# 集群化
## 1.集群化
Ignite节点可以自动发现对方，这有助于集群的按需扩展，而不必重启整个集群。开发者还可以利用Ignite的混合云支持能力，在私有云和公有云（例如Amazon Web Services）之间建立连接，从而达到两全其美。

![](https://files.readme.io/34771f3-ignite-deploy.png)

**特性：**

 - 通过`IgniteDiscoverySpi`实现的可插拔设计；
 - 动态拓扑管理；
 - 跨LAN、WAN和AWS的自动发现；
 - 按需直接部署；
 - 支持虚拟集群和集群组。

### 1.1.IgniteCluster
集群的功能是通过`ICluster`接口提供的，可以像下面这样通过`Ignite`获得`ICluster`的实例：
```csharp
IIgnite ignite = Ignition.Start();

ICluster cluster = ignite.GetCluster();
```
通过`ICluster`接口可以：

 - 获得集群节点列表；
 - 创建逻辑[集群组](#_2-集群组)。

### 1.2.ClusterNode
`IClusterNode`接口具有非常简洁的API，并且仅将节点作为拓扑中的逻辑网络端点进行处理。其持有全局唯一ID、节点指标、由用户设置的静态属性以及其他一些参数。
### 1.3.集群节点属性
在启动时所有集群节点都会自动将所有环境和系统属性注册为节点属性，另外开发者也可以注册自己的节点属性：

C#：
```csharp
var cfg = new IgniteConfiguration
{
    UserAttributes = new Dictionary<string, object> { { "ROLE", "worker" } }
};
```
app.config：
```xml
<igniteConfiguration>
    <userAttributes>
        <pair key='ROLE' value='worker' />
    </userAttributes>
</igniteConfiguration>
```
Spring XML：
```xml
<bean class="org.apache.ignite.IgniteConfiguration">
    ...
    <property name="userAttributes">
        <map>
            <entry key="ROLE" value="worker"/>
        </map>
    </property>
    ...
</bean>
```
下面的示例会显示如何获得配置了`worker`属性的节点：
```csharp
IClusterGroup workers = ignite.GetCluster().ForAttribute("ROLE", "worker");

ICollection<IClusterNode> nodes = workers.GetNodes();
```
::: tip 提示
通过`IClusterNode.GetAttributes()`方法可以获得所有的节点属性。
:::
### 1.4.集群节点指标
Ignite会自动收集所有集群节点的指标，指标在后台收集，并随着集群节点之间交换的每条心跳消息进行更新。

节点指标可通过`IClusterMetrics`获得，其包含了50多种指标（注意相同的指标也可用于[集群组](#_2-集群组)）。

这是获取本地节点一些指标的示例（包括平均CPU负载和已用堆空间）：
```csharp
// Local Ignite node.
IClusterNode localNode = cluster.GetLocalNode();

// Node metrics.
IClusterMetrics metrics = localNode.GetMetrics();

// Get some metric values.
double cpuLoad = metrics.CurrentCpuLoad;
long usedHeap = metrics.HeapMemoryUsed;
int numberOfCores = metrics.TotalCpus;
int activeJobs = metrics.CurrentActiveJobs;
```
### 1.5.本地集群节点
本地节点是表示当前Ignite.NET节点的`IClusterNode`实例：

下面是获取本地节点的一个示例：
```csharp
IClusterNode localNode = ignite.GetCluster().GetLocalNode();
```
## 2.集群组
`IClusterGroup`用于表示集群节点的逻辑分组。

在Ignite.NET中，所有节点在设计上都是等价的，因此不必按特定顺序启动任何节点，也不必为其分配任何特定角色。不过Ignite允许开发者按需对集群节点进行逻辑分组。例如可能希望仅在远程节点上部署服务，或为某些工作节点分配`worker`角色用于作业的执行。
::: tip 注意
注意`ICluster`接口也是一个集群组，其中包括集群中的所有节点。
:::

可以将作业执行、服务部署、消息传递、事件和其他任务限制为仅在某些集群组中运行。例如下面是仅向远程节点（本地节点除外）广播作业的方法：
```csharp
IIgnite ignite = Ignition.Start();

ICluster cluster = ignite.GetCluster();

// Get compute instance which will only execute
// over remote nodes, i.e. not this node.
ICompute compute = ignite.GetCompute(cluster.ForRemotes());

// Broadcast to all remote nodes and print the ID of the node
// on which this closure is executing.
compute.Broadcast(new MyComputeAction());
```
### 2.1.预定义集群组
可以基于任何谓词创建集群组，为了方便Ignite也附带了一些预定义的集群组。

以下是`ClusterGroup`接口上一些可用的集群组示例：

远程节点：
```csharp
ICluster cluster = ignite.GetCluster();

// Cluster group with remote nodes, i.e. other than this node.
IClusterGroup remoteGroup = cluster.ForRemotes();
```
缓存节点：
```csharp
ICluster cluster = ignite.GetCluster();

// All nodes on which cache with name "myCache" is deployed,
// either in client or server mode.
IClusterGroup cacheGroup = cluster.ForCacheNodes("myCache");

// All data nodes responsible for caching data for "myCache".
IClusterGroup dataGroup = cluster.ForDataNodes("myCache");

// All client nodes that access "myCache".
IClusterGroup clientGroup = cluster.ForClientNodes("myCache");
```
带有节点属性的节点：
```csharp
ICluster cluster = ignite.GetCluster();

// All nodes with attribute "ROLE" equal to "worker".
IClusterGroup attrGroup = cluster.ForAttribute("ROLE", "worker");
```
某主机上的节点：
```csharp
ICluster cluster = ignite.GetCluster();

// Pick a remote node.
IClusterNode remoteNode = cluster.ForRemotes().GetNode();

// All nodes on the same physical host as the remote node.
IClusterGroup sameHost = cluster.forHost(remoteNode);
```
最老的节点：
```csharp
ICluster cluster = ignite.GetCluster();

// Dynamic cluster group representing the oldest cluster node.
// Will automatically shift to the next oldest, if the oldest
// node crashes.
IClusterGroup oldestNode = cluster.ForOldest();
```
本地节点：
```csharp
ICluster cluster = ignite.GetCluster();

// Cluster group with only this (local) node in it.
IClusterGroup localGroup = cluster.ForLocal();

// Local node.
IClusterNode localNode = localGroup.GetNode();
```
### 2.2.自定义集群组
可以基于某些谓词定义动态集群组，这样的集群组将始终仅包括符合谓词的节点。

下面是CPU利用率低于50％的节点上的集群组示例，注意该组中的节点将根据其CPU负载随时间变化：
```csharp
ICluster cluster = ignite.GetCluster();

// Nodes with less than 50% CPU load.
IClusterGroup readyNodes = _grid1.GetCluster().ForPredicate(node => node.GetMetrics().CurrentCpuLoad < 0.5);
```
### 2.3.从集群组获取节点
可以像下面这样获取各种集群组节点：
```csharp
IClusterGroup remoteGroup = cluster.ForRemotes();

// All cluster nodes in the group.
ICollection<IClusterNode> grpNodes = remoteGroup.GetNodes();

// First node in the group (useful for groups with one node).
IClusterNode node = remoteGroup.GetNode();

// And if you know a node ID, get node by ID.
Guid myID = ...;

node = remoteGroup.GetNode(myId);
```
### 2.4.集群组指标
Ignite会自动收集有关所有集群节点的指标，更好的是它会自动聚合集群组中所有节点上的指标，并在组中提供适当的平均值，最小值和最大值。

通过`IClusterMetrics`接口可以拿到50多种不同的集群组指标（注意相同的指标也可用于单个集群节点）。

这是获取所有远程节点上的部分指标的示例（包括平均CPU负载和已用堆空间）：
```csharp
// Cluster group with remote nodes, i.e. other than this node.
IClusterGroup remoteGroup = ignite.GetCluster().ForRemotes();

// Cluster group metrics.
IClusterMetrics metrics = remoteGroup.GetMetrics();

// Get some metric values.
double cpuLoad = metrics.CurrentCpuLoad;
long usedHeap = metrics.HeapMemoryUsed;
int numberOfCores = metrics.TotalCpus;
int activeJobs = metrics.CurrentActiveJobs;
```
## 3.领导者选举
在分布式环境中，有时需要保证始终选择相同的节点，而不管集群拓扑如何变化，这样的节点通常称为**领导者**。

在许多系统中，选举集群领导者通常与数据的一致性有关，并通过收集集群节点的选票来处理。而在Ignite中数据一致性是由数据网格的映射函数（例如[约会哈希](http://en.wikipedia.org/wiki/Rendezvous_hashing)）处理的，因此传统意义上通过选择领导者来确保数据网格之外的数据一致性是不需要的。

不过可能还是希望针对某些任务能有一个*协调器*节点。为此Ignite可以自动始终选择集群中最老或最新的节点。

::: warning 使用服务网格
注意，对于大多数领导者或类似单例的场景，建议使用**服务网格**功能，因为它可以自动部署各种集群单例服务，并且通常更易于使用。
:::
### 3.1.最老的节点
最老的节点有一个属性，无论何时添加新节点，它都保持不变。最老的节点变更的唯一时点是它离开集群或故障时。

下面是如何获取仅包含最老节点的[集群组](#_2-集群组)的示例：
```csharp
ICluster cluster = ignite.GetCluster();

// Dynamic cluster group representing the oldest cluster node.
// Will automatically shift to the next oldest, if the oldest
// node crashes.
IClusterGroup oldestNode = cluster.ForOldest();
```
### 3.2.最新的节点
最新的节点与最老的节点不同，每当新节点加入集群时都会不断变化。不过有时它仍然很方便，特别是如果仅需要在新加入的节点上执行某些任务时，尤其如此。

下面是如何获取仅包含最新节点的[集群组](#_2-集群组)的示例：
```csharp
ICluster cluster = ignite.GetCluster();

// Dynamic cluster group representing the youngest cluster node.
// Will automatically shift to the previous youngest, if the youngest
// node crashes.
IClusterGroup youngestNode = cluster.ForYoungest();
```
::: tip 提示
获取集群组后，就可以将其用于执行任务、部署服务、发送消息等等。
:::
## 4.集群配置
在Ignite中，节点可以通过`DiscoverySpi`相互发现，其默认实现是使用TCP/IP的`TcpDiscoverySpi`，Ignite中还支持基于组播和静态IP机制的节点发现模式。

### 4.1.基于组播的发现
`TcpDiscoveryMulticastIpFinder`使用组播来发现网格中的其他节点，并且是默认的IP探测器。除非打算修改默认设置，否则不必指定它。下面是配置此探测器的示例：

C#：
```csharp
var cfg = new IgniteConfiguration
{
    DiscoverySpi = new TcpDiscoverySpi
    {
        IpFinder = new TcpDiscoveryMulticastIpFinder
        {
            MulticastGroup = "228.10.10.157"
        }
    }
};
```
app.config：
```xml
<igniteConfiguration>
    <discoverySpi type='TcpDiscoverySpi'>
        <ipFinder type='TcpDiscoveryMulticastIpFinder' multicastGroup='228.10.10.157' />
    </discoverySpi>
</igniteConfiguration>
```
Spring XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  ...
  <property name="discoverySpi">
    <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
      <property name="ipFinder">
        <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.multicast.TcpDiscoveryMulticastIpFinder">
          <property name="multicastGroup" value="228.10.10.157"/>
        </bean>
      </property>
    </bean>
  </property>
</bean>
```
### 4.2.基于静态IP的发现
对于禁用了组播的情况，应该使用`TcpDiscoveryStaticIpFinder`（Java中的`TcpDiscoveryVmIpFinder`），它需要事先配置好一个IP地址列表。

只需要提供至少一个远程节点的IP地址，但是通常建议提供2-3个在将来可能会启动的节点的地址。一旦建立了到任意IP地址的连接，Ignite就会自动发现所有其他的节点。
::: warning 警告
`TcpDiscoveryStaticIpFinder`默认在非共享模式下使用。如果打算启动服务端节点，则在此模式下，IP地址列表也应包含本地节点的地址，这样就不需要等待其他节点的加入，而是成为第一个节点并正常运行。
:::

下面是配置此探测器的示例：

C#：
```csharp
var cfg = new IgniteConfiguration
{
    DiscoverySpi = new TcpDiscoverySpi
    {
        IpFinder = new TcpDiscoveryStaticIpFinder
        {
            Endpoints = {"1.2.3.4", "1.2.3.5:47500..47509" }
        }
    }
};
```
app.config：
```xml
<igniteConfiguration>
    <discoverySpi type='TcpDiscoverySpi'>
        <ipFinder type='TcpDiscoveryStaticIpFinder'>
            <endpoints>
                <string>1.2.3.4</string>
                <string>1.2.3.5:47500..47509</string>
            </endpoints>
        </ipFinder>
    </discoverySpi>
</igniteConfiguration>
```
Spring XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  ...
  <property name="discoverySpi">
    <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
      <property name="ipFinder">
        <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.vm.TcpDiscoveryVmIpFinder">
          <property name="addresses">
            <list>
              <value>1.2.3.4</value>
              <value>1.2.3.5:47500..47509</value>
            </list>
          </property>
        </bean>
      </property>
    </bean>
  </property>
</bean>
```
### 4.3.基于组播和静态IP的发现
可以同时使用基于组播和静态IP的发现。这时除了通过组播接收的地址（如果有）之外，`TcpDiscoveryMulticastIpFinder`还可以与预配置的静态IP地址列表一起使用，就像上述基于静态IP的发现一样。下面是配置示例：

C#：
```csharp
var cfg = new IgniteConfiguration
{
    DiscoverySpi = new TcpDiscoverySpi
    {
        IpFinder = new TcpDiscoveryMulticastIpFinder
        {
            MulticastGroup = "228.10.10.157",
            Endpoints = {"1.2.3.4", "1.2.3.5:47500..47509" }
        }
    }
};
```
app.config：
```xml
<igniteConfiguration>
    <discoverySpi type='TcpDiscoverySpi'>
        <ipFinder type='TcpDiscoveryMulticastIpFinder' multicastGroup='228.10.10.157'>
            <endpoints>
                <string>1.2.3.4</string>
                <string>1.2.3.5:47500..47509</string>
            </endpoints>
        </ipFinder>
    </discoverySpi>
</igniteConfiguration>
```
Spring XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  ...
  <property name="discoverySpi">
    <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
      <property name="ipFinder">
        <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.multicast.TcpDiscoveryMulticastIpFinder">
          <property name="multicastGroup" value="228.10.10.157"/>
          <property name="addresses">
            <list>
              <value>1.2.3.4</value>
              <value>1.2.3.5:47500..47509</value>
            </list>
          </property>
        </bean>
      </property>
    </bean>
  </property>
</bean>
```
### 4.4.在同一个机器组中隔离Ignite集群
出于测试目的或其他原因，有时可能需要在同一台主机上启动两个隔离的Ignite集群。

对于`TcpDiscoverySpi`和`TcpCommunicationSpi`，如果不同集群的节点使用非交叉的本地端口范围，这个功能是可以实现的。

假设需要在一台主机上启动两个隔离的集群用于测试，那么第一个集群中的节点，应使用以下`TcpDiscoverySpi`和`TcpCommunicationSpi`配置：

C#：
```csharp
var cfg = new IgniteConfiguration
{
    // Explicitly configure TCP discovery SPI to provide list of initial nodes
    // from the first cluster.
    DiscoverySpi = new TcpDiscoverySpi
    {
        // Initial local port to listen to.
        LocalPort = 48500,
        // Changing local port range. This is an optional action.
        LocalPortRange = 20,
        IpFinder = new TcpDiscoveryStaticIpFinder
        {
            // Addresses and port range of the nodes from the first cluster.
            // 127.0.0.1 can be replaced with actual IP addresses or host names.
            // The port range is optional.
            Endpoints = new[] {"127.0.0.1:48500..48520"}
        }
    },
    // Explicitly configure TCP communication SPI changing
    // local port number for the nodes from the first cluster.
    CommunicationSpi = new TcpCommunicationSpi
    {
        LocalPort = 48100
    }
};
```
app.config：
```xml
<igniteConfiguration>
    <!--
        Explicitly configure TCP discovery SPI to provide list of initial
        nodes from the second cluster.
    -->
    <discoverySpi type='TcpDiscoverySpi' localPort='48500' localPortRange='20'>
        <ipFinder type='TcpDiscoveryMulticastIpFinder'>
            <endpoints>
                <!--
                    Addresses and port range of the nodes from the second cluster.
                    127.0.0.1 can be replaced with actual IP addresses or host names. Port range is optional.
                -->
                <string>127.0.0.1:48500..48520</string>
            </endpoints>
        </ipFinder>
    </discoverySpi>

    <!--
        Explicitly configure TCP communication SPI changing local port number
        for the nodes from the second cluster.
    -->
    <communicationSpi type='TcpCommunicationSpi' localPort='48100' />
</igniteConfiguration>
```
Spring XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  	...
    <!--
 				Explicitly configure TCP discovery SPI to provide list of
				initial nodes from the first cluster.
 	  -->
    <property name="discoverySpi">
        <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
            <!-- Initial local port to listen to. -->
            <property name="localPort" value="48500"/>

            <!-- Changing local port range. This is an optional action. -->
            <property name="localPortRange" value="20"/>

            <!-- Setting up IP finder for this cluster -->
            <property name="ipFinder">
                <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.vm.TcpDiscoveryVmIpFinder">
                    <property name="addresses">
                        <list>
                            <!--
                                Addresses and port range of the nodes from the first
 																cluster.
                                127.0.0.1 can be replaced with actual IP addresses or
 																host names. Port range is optional.
                            -->
                            <value>127.0.0.1:48500..48520</value>
                        </list>
                    </property>
                </bean>
            </property>
        </bean>
    </property>

    <!--
        Explicitly configure TCP communication SPI changing local
 				port number for the nodes from the first cluster.
    -->
    <property name="communicationSpi">
        <bean class="org.apache.ignite.spi.communication.tcp.TcpCommunicationSpi">
            <property name="localPort" value="48100"/>
        </bean>
    </property>
</bean>
```
而第二个集群中的节点，配置如下：

C#：
```csharp
var cfg = new IgniteConfiguration
{
    // Explicitly configure TCP discovery SPI to provide list of initial nodes
    // from the first cluster.
    DiscoverySpi = new TcpDiscoverySpi
    {
        // Initial local port to listen to.
        LocalPort = 49500,
        // Changing local port range. This is an optional action.
        LocalPortRange = 20,
        IpFinder = new TcpDiscoveryStaticIpFinder
        {
            // Addresses and port range of the nodes from the first cluster.
            // 127.0.0.1 can be replaced with actual IP addresses or host names.
            // The port range is optional.
            Endpoints = {"127.0.0.1:49500..49520"}
        }
    },
    // Explicitly configure TCP communication SPI changing
    // local port number for the nodes from the first cluster.
    CommunicationSpi = new TcpCommunicationSpi
    {
        LocalPort = 49100
    }
};
```
app.config：
```xml
<igniteConfiguration>
    <!--
        Explicitly configure TCP discovery SPI to provide list of initial
        nodes from the second cluster.
    -->
    <discoverySpi type='TcpDiscoverySpi' localPort='49500' localPortRange='20'>
        <ipFinder type='TcpDiscoveryMulticastIpFinder'>
            <endpoints>
                <!--
                    Addresses and port range of the nodes from the second cluster.
                    127.0.0.1 can be replaced with actual IP addresses or host names. Port range is optional.
                -->
                <string>127.0.0.1:49500..49520</string>
            </endpoints>
        </ipFinder>
    </discoverySpi>

    <!--
        Explicitly configure TCP communication SPI changing local port number
        for the nodes from the second cluster.
    -->
    <communicationSpi type='TcpCommunicationSpi' localPort='49100' />
</igniteConfiguration>
```
Spring XML：
```xml
<bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
    <!--
        Explicitly configure TCP discovery SPI to provide list of initial
         nodes from the second cluster.
    -->
    <property name="discoverySpi">
        <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
            <!-- Initial local port to listen to. -->
            <property name="localPort" value="49500"/>

            <!-- Changing local port range. This is an optional action. -->
            <property name="localPortRange" value="20"/>

            <!-- Setting up IP finder for this cluster -->
            <property name="ipFinder">
                <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.vm.TcpDiscoveryVmIpFinder">
                    <property name="addresses">
                        <list>
                            <!--
                                Addresses and port range of the nodes from the second
 																cluster.
                                127.0.0.1 can be replaced with actual IP addresses or
 																host names. Port range is optional.
                            -->
                            <value>127.0.0.1:49500..49520</value>
                        </list>
                    </property>
                </bean>
            </property>
        </bean>
    </property>

    <!--
        Explicitly configure TCP communication SPI changing local port number
        for the nodes from the second cluster.
    -->
    <property name="communicationSpi">
        <bean class="org.apache.ignite.spi.communication.tcp.TcpCommunicationSpi">
            <property name="localPort" value="49100"/>
        </bean>
    </property>
</bean>
```
从配置中可以看到，它们之间的差别很小，仅SPI和IP探测器的端口号有所不同。
::: tip 提示
如果希望来自不同集群的节点能使用组播协议互相发现，则在上面的每个配置中可以将`TcpDiscoveryStaticIpFinder`替换为`TcpDiscoveryMulticastIpFinder`，并为每个集群设置唯一的`TcpDiscoveryMulticastIpFinder.MulticastGroups`。
:::
### 4.5.故障检测超时
故障检测超时用于确定节点在认为无法与其他节点连接之前应等待多长时间，这是根据集群的网络和硬件条件调整发现SPI的故障检测功能的最简单方法。
::: warning 注意
超时自动控制诸如`TcpDiscoverySpi`套接字超时、消息确认超时等配置参数，如果显式配置了这些参数中的任何一个，则故障超时配置将被忽略。
:::

故障检测超时通过`IgniteConfiguration.FailureDetectionTimeout`属性进行配置，默认值是10秒，该值可以使发现SPI在大多数硬件和虚拟环境上都能可靠地工作，但这使故障检测时间变得很长。不过对于稳定的低延迟网络，该参数可以设置为~200毫秒，以便更快地检测故障并对故障做出反应。

# 集群化
## 1.概述
本章节会介绍节点间相互发现以形成集群的不同方式。

在启动时，将为节点分配以下两个角色之一：服务端节点或客户端节点。服务端节点是集群的主体，它们存储数据、执行计算任务等。客户端节点作为常规节点加入拓扑，但不存储数据。客户端节点用于将数据流传输到集群中并执行用户查询。

要组成集群，每个节点必须能够连接到所有其他节点。为了确保这一点，必须配置适当的发现机制。

::: tip 提示
除了客户端节点，还可以使用瘦客户端来定义和操作集群中的数据，具体请参见[瘦客户端](/doc/java/ThinClients.md)章节的内容。
:::

![](https://ignite.apache.org/docs/2.9.0/images/ignite_clustering.png)

### 1.1.发现机制
节点间可以自动相互发现并组成集群，这样就可以在需要时进行横向扩展，而不必重启整个集群。开发者还可以利用Ignite的混合云支持，其可以在私有云和公有云（例如Amazon Web Services）之间建立连接，从而提供更多样化的选择。

Ignite针对不同的场景，提供了两种发现机制：

 - TCP/IP发现针对百级以内节点的集群规模进行了优化；
 - ZooKeeper发现可将Ignite集群扩展到上千个节点，仍能保持线性扩展性和性能。

## 2.TCP/IP发现
Ignite集群中，节点间可以通过`DiscoverySpi`相互发现。`DiscoverySpi`的默认实现是`TcpDiscoverySpi`，其使用的是TCP/IP协议，节点发现具体可以配置为基于组播或者基于静态IP模式。
### 2.1.组播IP探测器
`TcpDiscoveryMulticastIpFinder`使用组播来发现每个节点，这也是默认的IP探测器，下面是通过配置文件以及编程模式进行配置的示例：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

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
</Tab>

<Tab title="Java">

```java
TcpDiscoverySpi spi = new TcpDiscoverySpi();

TcpDiscoveryMulticastIpFinder ipFinder = new TcpDiscoveryMulticastIpFinder();

ipFinder.setMulticastGroup("228.10.10.157");

spi.setIpFinder(ipFinder);

IgniteConfiguration cfg = new IgniteConfiguration();

// Override default discovery SPI.
cfg.setDiscoverySpi(spi);

// Start the node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

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
Ignition.Start(cfg);
```
</Tab>

<Tab title="C++">
C++目前还不支持这个API，需要使用基于XML的配置。

</Tab>
</Tabs>

### 2.2.静态IP探测器
静态IP探测器实现了`TcpDiscoveryVmIpFinder`，可以指定一组IP地址和端口，IP探测器将检查这些IP地址和端口以进行节点发现。

只需提供至少一个远程节点的IP地址即可，但是通常建议提供2或3个规划范围内节点的地址。一旦建立了与提供的任何IP地址的连接，Ignite就会自动发现所有其他节点。

::: tip 提示
除了在配置文件中指定以外，还可以通过`IGNITE_TCP_DISCOVERY_ADDRESSES`环境变量或者同名的系统属性来指定，地址间用逗号分割，还可以选择包含端口范围。
:::
::: tip 提示
`TcpDiscoveryVmIpFinder`默认用于`非共享`模式。如果打算启动一个服务端节点，则IP地址列表也会包含本地节点的地址，这时该节点将不会等到其他节点加入集群，而是成为第一个集群节点并开始正常运行。
:::
可以通过编程或者配置文件的方式配置静态IP探测器：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="discoverySpi">
        <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
            <property name="ipFinder">
                <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.vm.TcpDiscoveryVmIpFinder">
                    <property name="addresses">
                        <list>
                            <!--
                              Explicitly specifying address of a local node to let it start and
                              operate normally even if there is no more nodes in the cluster.
                              You can also optionally specify an individual port or port range.
                              -->
                            <value>1.2.3.4</value>
                            <!--
                              IP Address and optional port range of a remote node.
                              You can also optionally specify an individual port.
                              -->
                            <value>1.2.3.5:47500..47509</value>
                        </list>
                    </property>
                </bean>
            </property>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
TcpDiscoverySpi spi = new TcpDiscoverySpi();

TcpDiscoveryVmIpFinder ipFinder = new TcpDiscoveryVmIpFinder();

// Set initial IP addresses.
// Note that you can optionally specify a port or a port range.
ipFinder.setAddresses(Arrays.asList("1.2.3.4", "1.2.3.5:47500..47509"));

spi.setIpFinder(ipFinder);

IgniteConfiguration cfg = new IgniteConfiguration();

// Override default discovery SPI.
cfg.setDiscoverySpi(spi);

// Start a node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    DiscoverySpi = new TcpDiscoverySpi
    {
        IpFinder = new TcpDiscoveryStaticIpFinder
        {
            Endpoints = new[] {"1.2.3.4", "1.2.3.5:47500..47509" }
        }
    }
};
```
</Tab>

<Tab title="Shell">

```shell
# The configuration should use TcpDiscoveryVmIpFinder without addresses specified:

IGNITE_TCP_DISCOVERY_ADDRESSES=1.2.3.4,1.2.3.5:47500..47509 bin/ignite.sh -v config/default-config.xml
```
</Tab>
</Tabs>

::: warning 警告
提供多个地址时，要确认这些地址都是有效的。无法访问的地址会增加节点加入集群所需的时间。假设设置了5个IP地址，但是其中2个没有监听输入连接，如果Ignite开始通过这2个无法访问的地址接入集群，它将影响节点的启动速度。
:::
### 2.3.静态和组播IP探测器
可以同时使用基于组播和静态IP的发现，这时`TcpDiscoveryMulticastIpFinder`除了可以接收来自组播的IP地址以外，还可以处理预定义的静态IP地址，和上述描述的静态IP发现一样，下面是如何配置带有静态IP地址的组播IP探测器的示例：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="discoverySpi">
        <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
            <property name="ipFinder">
                <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.multicast.TcpDiscoveryMulticastIpFinder">
                    <property name="multicastGroup" value="228.10.10.157"/>
                    <!-- list of static IP addresses-->
                    <property name="addresses">
                        <list>
                            <value>1.2.3.4</value>
                            <!--
                              IP Address and optional port range.
                              You can also optionally specify an individual port.
                             -->
                            <value>1.2.3.5:47500..47509</value>
                        </list>
                    </property>
                </bean>
            </property>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
TcpDiscoverySpi spi = new TcpDiscoverySpi();

TcpDiscoveryMulticastIpFinder ipFinder = new TcpDiscoveryMulticastIpFinder();

// Set Multicast group.
ipFinder.setMulticastGroup("228.10.10.157");

// Set initial IP addresses.
// Note that you can optionally specify a port or a port range.
ipFinder.setAddresses(Arrays.asList("1.2.3.4", "1.2.3.5:47500..47509"));

spi.setIpFinder(ipFinder);

IgniteConfiguration cfg = new IgniteConfiguration();

// Override default discovery SPI.
cfg.setDiscoverySpi(spi);

// Start a node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    DiscoverySpi = new TcpDiscoverySpi
    {
        IpFinder = new TcpDiscoveryMulticastIpFinder
        {
            MulticastGroup = "228.10.10.157",
            Endpoints = new[] {"1.2.3.4", "1.2.3.5:47500..47509" }
        }
    }
};
Ignition.Start(cfg);
```
</Tab>

<Tab title="C++">
C++目前还不支持这个API，需要使用基于XML的配置。

</Tab>
</Tabs>

### 2.4.同一组主机内的集群隔离
Ignite允许同一组主机内启动两个相互隔离的集群，这可以通过不同集群的节点的`TcpDiscoverySpi`和`TcpCommunicationSpi`使用不交叉的本地端口范围来实现。

假定为了测试，在一台主机上要启动两个隔离的集群，对于第一个集群的节点，可以使用下面的配置：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
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
                            Addresses and port range of nodes from
                            the first cluster.
                            127.0.0.1 can be replaced with actual IP addresses
                            or host names. Port range is optional.
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
</Tab>

<Tab title="Java">

```java
IgniteConfiguration firstCfg = new IgniteConfiguration();

firstCfg.setIgniteInstanceName("first");

// Explicitly configure TCP discovery SPI to provide list of initial nodes
// from the first cluster.
TcpDiscoverySpi firstDiscoverySpi = new TcpDiscoverySpi();

// Initial local port to listen to.
firstDiscoverySpi.setLocalPort(48500);

// Changing local port range. This is an optional action.
firstDiscoverySpi.setLocalPortRange(20);

TcpDiscoveryVmIpFinder firstIpFinder = new TcpDiscoveryVmIpFinder();

// Addresses and port range of the nodes from the first cluster.
// 127.0.0.1 can be replaced with actual IP addresses or host names.
// The port range is optional.
firstIpFinder.setAddresses(Collections.singletonList("127.0.0.1:48500..48520"));

// Overriding IP finder.
firstDiscoverySpi.setIpFinder(firstIpFinder);

// Explicitly configure TCP communication SPI by changing local port number for
// the nodes from the first cluster.
TcpCommunicationSpi firstCommSpi = new TcpCommunicationSpi();

firstCommSpi.setLocalPort(48100);

// Overriding discovery SPI.
firstCfg.setDiscoverySpi(firstDiscoverySpi);

// Overriding communication SPI.
firstCfg.setCommunicationSpi(firstCommSpi);

// Starting a node.
Ignition.start(firstCfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var firstCfg = new IgniteConfiguration
{
    IgniteInstanceName = "first",
    DiscoverySpi = new TcpDiscoverySpi
    {
        LocalPort = 48500,
        LocalPortRange = 20,
        IpFinder = new TcpDiscoveryStaticIpFinder
        {
            Endpoints = new[]
            {
                "127.0.0.1:48500..48520"
            }
        }
    },
    CommunicationSpi = new TcpCommunicationSpi
    {
        LocalPort = 48100
    }
};
Ignition.Start(firstCfg);
```
</Tab>

<Tab title="C++">
C++目前还不支持这个API，需要使用基于XML的配置。

</Tab>
</Tabs>

对于第二个集群，配置如下：

<Tabs>
<Tab title="XML">

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
                            Addresses and port range of the nodes from the second cluster.
                            127.0.0.1 can be replaced with actual IP addresses or host names. Port range is optional.
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
</Tab>

<Tab title="Java">

```java
IgniteConfiguration secondCfg = new IgniteConfiguration();

secondCfg.setIgniteInstanceName("second");

// Explicitly configure TCP discovery SPI to provide list of initial nodes
// from the second cluster.
TcpDiscoverySpi secondDiscoverySpi = new TcpDiscoverySpi();

// Initial local port to listen to.
secondDiscoverySpi.setLocalPort(49500);

// Changing local port range. This is an optional action.
secondDiscoverySpi.setLocalPortRange(20);

TcpDiscoveryVmIpFinder secondIpFinder = new TcpDiscoveryVmIpFinder();

// Addresses and port range of the nodes from the second cluster.
// 127.0.0.1 can be replaced with actual IP addresses or host names.
// The port range is optional.
secondIpFinder.setAddresses(Collections.singletonList("127.0.0.1:49500..49520"));

// Overriding IP finder.
secondDiscoverySpi.setIpFinder(secondIpFinder);

// Explicitly configure TCP communication SPI by changing local port number for
// the nodes from the second cluster.
TcpCommunicationSpi secondCommSpi = new TcpCommunicationSpi();

secondCommSpi.setLocalPort(49100);

// Overriding discovery SPI.
secondCfg.setDiscoverySpi(secondDiscoverySpi);

// Overriding communication SPI.
secondCfg.setCommunicationSpi(secondCommSpi);

// Starting a node.
Ignition.start(secondCfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var secondCfg = new IgniteConfiguration
{
    IgniteInstanceName = "second",
    DiscoverySpi = new TcpDiscoverySpi
    {
        LocalPort = 49500,
        LocalPortRange = 20,
        IpFinder = new TcpDiscoveryStaticIpFinder
        {
            Endpoints = new[]
            {
                "127.0.0.1:49500..49520"
            }
        }
    },
    CommunicationSpi = new TcpCommunicationSpi
    {
        LocalPort = 49100
    }
};
Ignition.Start(secondCfg);
```
</Tab>

<Tab title="C++">
C++目前还不支持这个API，需要使用基于XML的配置。

</Tab>
</Tabs>

从配置可以看出，区别很小，仅是发现和通信SPI的端口号不同。

::: tip 提示
如果希望来自不同集群的节点能够使用组播协议相互发现，需要将`TcpDiscoveryVmIpFinder`替换为`TcpDiscoveryMulticastIpFinder`并在上面的配置中设置惟一的`TcpDiscoveryMulticastIpFinder.multicastGroups`。
:::
::: warning 警告
如果隔离的集群开启了原生持久化，那么不同的集群需要在文件系统的不同路径下存储持久化文件，具体可以参见[原生持久化](/doc/java/Persistence.md#_1-ignite持久化)的相关文档，来了解如何修改持久化相关的路径。
:::
### 2.5.基于JDBC的IP探测器
::: tip 提示
.NET/C#/C++目前还不支持。
:::
可以将数据库作为初始化IP地址的共享存储，使用这个IP探测器，节点会在启动时将IP地址写入数据库，这些都是通过`TcpDiscoveryJdbcIpFinder`实现的。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

  <property name="discoverySpi">
    <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
      <property name="ipFinder">
        <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.jdbc.TcpDiscoveryJdbcIpFinder">
          <property name="dataSource" ref="ds"/>
        </bean>
      </property>
    </bean>
  </property>
</bean>

<!-- Configured data source instance. -->
<bean id="ds" class="some.Datasource">

</bean>
```
</Tab>

<Tab title="Java">

```java
TcpDiscoverySpi spi = new TcpDiscoverySpi();

// Configure your DataSource.
DataSource someDs = new MySampleDataSource();

TcpDiscoveryJdbcIpFinder ipFinder = new TcpDiscoveryJdbcIpFinder();

ipFinder.setDataSource(someDs);

spi.setIpFinder(ipFinder);

IgniteConfiguration cfg = new IgniteConfiguration();

// Override default discovery SPI.
cfg.setDiscoverySpi(spi);

// Start the node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">
.NET目前还不支持这个API，需要使用基于XML的配置。

</Tab>

<Tab title="C++">
C++目前还不支持这个API，需要使用基于XML的配置。

</Tab>
</Tabs>

### 2.6.共享文件系统IP探测器
::: tip 提示
.NET/C#/C++目前还不支持。
:::
共享文件系统也可以作为节点IP地址的一个存储，节点会在启动时将IP地址写入文件系统，该功能通过`TcpDiscoverySharedFsIpFinder`实现。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="discoverySpi">
        <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
            <property name="ipFinder">
                <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.sharedfs.TcpDiscoverySharedFsIpFinder">
                  <property name="path" value="/var/ignite/addresses"/>
                </bean>
            </property>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
// Configuring discovery SPI.
TcpDiscoverySpi spi = new TcpDiscoverySpi();

// Configuring IP finder.
TcpDiscoverySharedFsIpFinder ipFinder = new TcpDiscoverySharedFsIpFinder();

ipFinder.setPath("/var/ignite/addresses");

spi.setIpFinder(ipFinder);

IgniteConfiguration cfg = new IgniteConfiguration();

// Override default discovery SPI.
cfg.setDiscoverySpi(spi);

// Start the node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">
.NET目前还不支持这个API，需要使用基于XML的配置。

</Tab>

<Tab title="C++">
C++目前还不支持这个API，需要使用基于XML的配置。

</Tab>
</Tabs>

### 2.7.ZooKeeper IP探测器
::: tip 提示
.NET/C#/C++目前还不支持。
:::
使用`TcpDiscoveryZookeeperIpFinder`可以配置ZooKeeper IP探测器（注意需要启用`ignite-zookeeper`模块）。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

    <property name="discoverySpi">
        <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
            <property name="ipFinder">
                <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.zk.TcpDiscoveryZookeeperIpFinder">
                    <property name="zkConnectionString" value="127.0.0.1:2181"/>
                </bean>
            </property>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
TcpDiscoverySpi spi = new TcpDiscoverySpi();

TcpDiscoveryZookeeperIpFinder ipFinder = new TcpDiscoveryZookeeperIpFinder();

// Specify ZooKeeper connection string.
ipFinder.setZkConnectionString("127.0.0.1:2181");

spi.setIpFinder(ipFinder);

IgniteConfiguration cfg = new IgniteConfiguration();

// Override default discovery SPI.
cfg.setDiscoverySpi(spi);

// Start the node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">
.NET目前还不支持这个API，需要使用基于XML的配置。

</Tab>

<Tab title="C++">
C++目前还不支持这个API，需要使用基于XML的配置。

</Tab>
</Tabs>

## 3.ZooKeeper发现
Ignite使用TCP/IP发现机制，将集群节点组织成环状拓扑结构有其优点，也有缺点。比如在一个有上百个节点的拓扑中，系统消息遍历所有的节点需要花很多秒，就结果来说，基本的事件处理，比如新节点加入或者故障节点检测，就会影响整个集群的响应能力和性能。

ZooKeeper发现机制是为需要保证伸缩性和线性扩展的大规模Ignite集群而设计的。但是同时使用Ignite和ZooKeeper需要配置和管理两个分布式系统，这很有挑战性。因此，建议仅在打算扩展到成百或者上千个节点时才使用该发现机制。否则，最好使用[TCP/IP发现](#_2-tcp-ip发现)。

ZooKeeper发现使用ZooKeeper作为同步的单点，然后将Ignite集群组织成一个星型拓扑，这时ZooKeeper集群位于中心，然后Ignite节点通过它进行发现事件的交换。

![](https://ignite.apache.org/docs/2.9.0/images/zookeeper.png)

需要注意的是，ZooKeeper发现仅仅是发现机制的一个实现，不会影响Ignite节点间的通信。节点之间一旦通过ZooKeeper发现机制彼此发现，它们就会使用Communication SPI进行点对点的通信。
### 3.1.配置
要启用ZooKeeper发现，需要配置`ZooKeeperDiscoverySpi`：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

  <property name="discoverySpi">
    <bean class="org.apache.ignite.spi.discovery.zk.ZookeeperDiscoverySpi">
      <property name="zkConnectionString" value="127.0.0.1:34076,127.0.0.1:43310,127.0.0.1:36745"/>
      <property name="sessionTimeout" value="30000"/>
      <property name="zkRootPath" value="/apacheIgnite"/>
      <property name="joinTimeout" value="10000"/>
    </bean>
  </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
ZookeeperDiscoverySpi zkDiscoverySpi = new ZookeeperDiscoverySpi();

zkDiscoverySpi.setZkConnectionString("127.0.0.1:34076,127.0.0.1:43310,127.0.0.1:36745");
zkDiscoverySpi.setSessionTimeout(30_000);

zkDiscoverySpi.setZkRootPath("/ignite");
zkDiscoverySpi.setJoinTimeout(10_000);

IgniteConfiguration cfg = new IgniteConfiguration();

//Override default discovery SPI.
cfg.setDiscoverySpi(zkDiscoverySpi);

// Start the node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">
.NET目前还不支持这个API，需要使用基于XML的配置。

</Tab>

<Tab title="C++">
C++目前还不支持这个API，需要使用基于XML的配置。

</Tab>
</Tabs>

下面两个参数是**必须**的（其它的是可选的）：

 - `zkConnectionString`：ZooKeeper服务器地址列表；
 - `sessionTimeout`：如果无法通过发现SPI进行事件消息的交换，多久之后节点会被视为断开连接。

### 3.2.故障和脑裂处理
在网络分区的情况下，一些节点由于位于分离的网络段而不能相互通信，这可能导致处理用户请求失败或不一致的数据修改。

ZooKeeper发现机制通过如下的方式来处理网络分区（脑裂）以及单个节点之间的通信故障：

::: warning 警告
假定集群中的所有节点都可以访问ZooKeeper集群。事实上，如果一个节点与ZooKeeper断开，那么它就会停止，然后其它节点就会将其视为故障或者失联。
:::
当节点发现它不能连接到集群中的其它节点时，它就通过向ZooKeeper集群发布特殊请求来启动一个通信故障解决进程。该进程启动后，所有节点尝试彼此连接，并将连接尝试的结果发送到协调进程的节点（协调器节点）。基于此信息，协调器节点创建表示集群中的网络状况的连接图，而进一步的动作取决于网络分区的类型，下面的章节会介绍几种可能的场景。

#### 3.2.1.集群被分为若干个不相交的部分

如果集群被分成几个独立的部分，每个部分（作为一个集群）可能认为自己是一个主集群并继续处理用户请求，从而导致数据不一致。为了避免这种情况，只有节点数量最多的部分保持活动，而其它部分的节点会被关闭。

![](https://ignite.apache.org/docs/2.9.0/images/network_segmentation.png)

上图显示集群被分为了两个部分，小集群中的节点（右侧的部分）会被终止。

![](https://ignite.apache.org/docs/2.9.0/images/segmentation_resolved.png)

当有多个最大的部分时，具有最大数量的客户端的部分保持活动，而其它部分则关闭。

#### 3.2.2.节点间部分连接丢失

一些节点无法连接到其它一些节点，这意味着虽然这些节点没有完全与集群断开连接，但是无法与一些节点交换数据，因此不能成为集群的一部分。在下图中，一个节点不能连接到其它两个节点：

![](https://ignite.apache.org/docs/2.9.0/images/split_brain.png)

这时，任务就是找到每个节点可以连接到每个其它节点的最大部分，这通常是一个难题，在可接受的时间内无法解决。协调器节点会使用启发式算法来寻找最佳近似解，解中忽略的节点将被关闭。

![](https://ignite.apache.org/docs/2.9.0/images/split_brain_resolved.png)

#### 3.2.3.ZooKeeper集群分区

在大规模集群中，ZooKeeper集群可以跨越多个数据中心和地理上不同的位置，由于拓扑分割，它可以分成多个段。如果出现这种情况，ZooKeeper将检查是否存在一个包含所有ZooKeeper节点的一半以上的段（对于ZooKeeper继续其操作来说，需要这么多节点），如果找到，这个段将接管Ignite集群的管理，而其它段将被关闭。如果没有这样的段，ZooKeeper将关闭它的所有节点。

在ZooKeeper集群分区的情况下，Ignite集群可以分割也可以不分割。在任何情况下，当关闭ZooKeeper节点时，相应的Ignite节点将尝试连接到可用ZooKeeper节点，如果不能这样做，则将关闭。

下图是将Ignite集群和ZooKeeper集群分割成两个部分的拓扑分区示例。如果集群部署在两个数据中心，则可能出现这种情况。这时，位于数据中心B的ZooKeeper节点将自动关闭，而位于数据中心B的Ignite节点因为无法连接到其余ZooKeeper节点，因此也将关闭自己。

![](https://ignite.apache.org/docs/2.9.0/images/zookeeper_split.png)

### 3.3.自定义发现事件
将环形拓扑变更为星型拓扑，影响了发现SPI处理自定义发现事件的方式。因为环形拓扑是线性的，这意味着每个发现消息是被节点顺序处理的。

而在ZooKeeper发现机制中，协调器会同时将发现消息发送给所有节点，结果就是消息的并行处理，因此ZooKeeper发现机制不允许对自定义发现事件的修改，比如，节点不允许为发现消息添加任何内容。
### 3.4.Ignite和ZooKeeper的配置一致性
使用ZooKeeper发现机制，需要确保两个系统的配置参数相互匹配不矛盾。

比如下面的ZooKeeper简单配置：
```properties
# The number of milliseconds of each tick
tickTime=2000

# The number of ticks that can pass between
# sending a request and getting an acknowledgement
syncLimit=5
```
如果这样配置，只有过了`tickTime * syncLimit`时限，ZooKeeper服务器才会发觉它是否与剩余的ZooKeeper集群分区，在ZooKeeper的这段时间之内，所有的Ignite节点都会接入该已分割的ZooKeeper服务器，而不会与其它的ZooKeeper服务器进行连接。

另一方面，在Ignite端有一个`sessionTimeout`参数，它定义了如果节点与ZooKeeper集群断开，多长时间ZooKeeper会关闭Ignite节点的会话，如果`sessionTimeout`比`tickTime * syncLimit`小，那么Ignite节点就会被分割的ZooKeeper服务器过早地通知，即会话会在其试图连接其它的ZooKeeper服务器之前过期。

要避免这种情况发生，`sessionTimeout`要比`tickTime * syncLimit`大。
## 4.云环境的发现
云上的节点发现通常认为很有挑战性，因为大部分的虚拟环境有如下的限制：

 - 组播被禁用；
 - 每次新的镜像启动时TCP地址会发生变化。

虽然在没有组播时可以使用基于TCP的发现，但是不得不处理不断变换的IP地址以及不断更新配置。这带来了很大的不便以至于在这种环境下基于静态IP的配置实质上变得不可用。

为了缓解不断变化的IP地址问题，Ignite设计了一组专门的IP探测器，用于支持云环境。

 - Apache jclouds IP探测器
 - Amazon S3 IP探测器
 - Amazon ELB IP探测器
 - Google云存储IP探测器

::: tip 提示
基于云的IP探测器使得配置创建一次即可，之后所有的实例都可以复用。
:::

### 4.1.Apache jclouds IP探测器
为了解决不断变化的IP地址的问题，Ignite支持通过使用基于Apache jclouds多云工具包的`TcpDiscoveryCloudIpFinder`来实现节点的自动发现。要了解有关Apache jclouds的更多信息，请参照[jclouds.apache.org](https://jclouds.apache.org/)。

该IP探测器通过获取云上所有虚拟机的私有和公有IP地址并给它们增加一个端口号来形成节点地址，该端口可以通过`TcpDiscoverySpi.setLocalPort(int)`或者`TcpDiscoverySpi.DFLT_PORT`进行设置，这样所有节点会连接任何生成的IP地址然后发起集群节点的自动发现。

可以参考[这里](https://jclouds.apache.org/reference/providers/#compute)来获取它支持的云平台的列表。

::: warning 警告
所有虚拟机都要使用同一个端口启动Ignite实例，否则它们无法通过IP探测器发现对方。
:::

下面是如何配置基于Apache jclouds的IP探测器的示例：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="discoverySpi">
    <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
      <property name="ipFinder">
        <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.cloud.TcpDiscoveryCloudIpFinder">
            <!-- Configuration for Google Compute Engine. -->
            <property name="provider" value="google-compute-engine"/>
            <property name="identity" value="YOUR_SERVICE_ACCOUNT_EMAIL"/>
            <property name="credentialPath" value="PATH_YOUR_PEM_FILE"/>
            <property name="zones">
            <list>
                <value>us-central1-a</value>
                <value>asia-east1-a</value>
            </list>
            </property>
        </bean>
      </property>
    </bean>
  </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
TcpDiscoverySpi spi = new TcpDiscoverySpi();

TcpDiscoveryCloudIpFinder ipFinder = new TcpDiscoveryCloudIpFinder();

// Configuration for AWS EC2.
ipFinder.setProvider("aws-ec2");
ipFinder.setIdentity("yourAccountId");
ipFinder.setCredential("yourAccountKey");
ipFinder.setRegions(Collections.singletonList("us-east-1"));
ipFinder.setZones(Arrays.asList("us-east-1b", "us-east-1e"));

spi.setIpFinder(ipFinder);

IgniteConfiguration cfg = new IgniteConfiguration();

// Override default discovery SPI.
cfg.setDiscoverySpi(spi);

// Start a node.
Ignition.start(cfg);
```
</Tab>
</Tabs>

### 4.2.Amazon S3 IP探测器
基于Amazon S3的发现可以使节点在启动时在Amazon S3存储上注册它们的IP地址，这样其它节点会尝试连接任意存储在S3上的IP地址然后发起集群节点的自动发现。至于使用，需要将`ipFinder`配置为`TcpDiscoveryS3IpFinder`。
::: tip 提示
必须启用[ignite-aws](/doc/java/SettingUp.md#_2-7-启用模块)模块。
:::

下面是如何配置基于Amazon S3的IP探测器的示例：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

  <property name="discoverySpi">
    <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
      <property name="ipFinder">
        <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.s3.TcpDiscoveryS3IpFinder">
          <property name="awsCredentials" ref="aws.creds"/>
          <property name="bucketName" value="YOUR_BUCKET_NAME"/>
        </bean>
      </property>
    </bean>
  </property>
</bean>

<!-- AWS credentials. Provide your access key ID and secret access key. -->
<bean id="aws.creds" class="com.amazonaws.auth.BasicAWSCredentials">
  <constructor-arg value="YOUR_ACCESS_KEY_ID" />
  <constructor-arg value="YOUR_SECRET_ACCESS_KEY" />
</bean>
```
</Tab>

<Tab title="Java">

```java
TcpDiscoverySpi spi = new TcpDiscoverySpi();

BasicAWSCredentials creds = new BasicAWSCredentials("yourAccessKey", "yourSecreteKey");

TcpDiscoveryS3IpFinder ipFinder = new TcpDiscoveryS3IpFinder();
ipFinder.setAwsCredentials(creds);
ipFinder.setBucketName("yourBucketName");

spi.setIpFinder(ipFinder);

IgniteConfiguration cfg = new IgniteConfiguration();

// Override default discovery SPI.
cfg.setDiscoverySpi(spi);

// Start a node.
Ignition.start(cfg);
```
</Tab>
</Tabs>

还可以使用AWS凭据提供者的**Instance Profile**：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

  <property name="discoverySpi">
    <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
      <property name="ipFinder">
        <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.s3.TcpDiscoveryS3IpFinder">
          <property name="awsCredentialsProvider" ref="aws.creds"/>
          <property name="bucketName" value="YOUR_BUCKET_NAME"/>
        </bean>
      </property>
    </bean>
  </property>
</bean>

<!-- Instance Profile based credentials -->
<bean id="aws.creds" class="com.amazonaws.auth.InstanceProfileCredentialsProvider">
  <constructor-arg value="false" />
</bean>
```
</Tab>

<Tab title="Java">

```java
TcpDiscoverySpi spi = new TcpDiscoverySpi();

AWSCredentialsProvider instanceProfileCreds = new InstanceProfileCredentialsProvider(false);

TcpDiscoveryS3IpFinder ipFinder = new TcpDiscoveryS3IpFinder();
ipFinder.setAwsCredentialsProvider(instanceProfileCreds);
ipFinder.setBucketName("yourBucketName");

spi.setIpFinder(ipFinder);

IgniteConfiguration cfg = new IgniteConfiguration();

// Override default discovery SPI.
cfg.setDiscoverySpi(spi);

// Start a node.
Ignition.start(cfg);
```
</Tab>
</Tabs>

### 4.3.基于Amazon ELB的发现
基于AWS ELB的IP探测器不需要节点注册其IP地址，该IP探测器会自动获取ELB中连接的所有节点的地址，然后使用它们连接集群。至于使用，需要将`ipFinder`配置为`TcpDiscoveryElbIpFinder`。

下面是如何配置基于AWS ELB的IP探测器的示例：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

  <property name="discoverySpi">
    <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
      <property name="ipFinder">
        <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.elb.TcpDiscoveryElbIpFinder">
          <property name="credentialsProvider">
              <bean class="com.amazonaws.auth.AWSStaticCredentialsProvider">
                  <constructor-arg ref="aws.creds"/>
              </bean>
          </property>
          <property name="region" value="YOUR_ELB_REGION_NAME"/>
          <property name="loadBalancerName" value="YOUR_AWS_ELB_NAME"/>
        </bean>
      </property>
    </bean>
  </property>
</bean>

<!-- AWS credentials. Provide your access key ID and secret access key. -->
<bean id="aws.creds" class="com.amazonaws.auth.BasicAWSCredentials">
  <constructor-arg value="YOUR_ACCESS_KEY_ID" />
  <constructor-arg value="YOUR_SECRET_ACCESS_KEY" />
</bean>
```
</Tab>

<Tab title="Java">

```java
TcpDiscoverySpi spi = new TcpDiscoverySpi();

BasicAWSCredentials creds = new BasicAWSCredentials("yourAccessKey", "yourSecreteKey");

TcpDiscoveryElbIpFinder ipFinder = new TcpDiscoveryElbIpFinder();
ipFinder.setRegion("yourElbRegion");
ipFinder.setLoadBalancerName("yourLoadBalancerName");
ipFinder.setCredentialsProvider(new AWSStaticCredentialsProvider(creds));

spi.setIpFinder(ipFinder);

IgniteConfiguration cfg = new IgniteConfiguration();

// Override default discovery SPI.
cfg.setDiscoverySpi(spi);

// Start the node.
Ignition.start(cfg);
```
</Tab>
</Tabs>

### 4.4.Google Compute发现
Ignite支持通过使用基于Google云存储的`TcpDiscoveryGoogleStorageIpFinder`来实现节点的自动发现。在启动时节点在存储上注册它们的IP地址，然后通过读取配置发现其他节点。

::: tip 提示
必须启用[ignite-gce](/doc/java/SettingUp.md#_2-7-启用模块)模块。
:::
下面是如何配置基于Google云存储的IP探测器的示例：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

  <property name="discoverySpi">
    <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
      <property name="ipFinder">
        <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.gce.TcpDiscoveryGoogleStorageIpFinder">
          <property name="projectName" ref="YOUR_GOOGLE_PLATFORM_PROJECT_NAME"/>
          <property name="bucketName" value="YOUR_BUCKET_NAME"/>
          <property name="serviceAccountId" value="YOUR_SERVICE_ACCOUNT_ID"/>
          <property name="serviceAccountP12FilePath" value="PATH_TO_YOUR_PKCS12_KEY"/>
        </bean>
      </property>
    </bean>
  </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
TcpDiscoverySpi spi = new TcpDiscoverySpi();

TcpDiscoveryGoogleStorageIpFinder ipFinder = new TcpDiscoveryGoogleStorageIpFinder();

ipFinder.setServiceAccountId("yourServiceAccountId");
ipFinder.setServiceAccountP12FilePath("pathToYourP12Key");
ipFinder.setProjectName("yourGoogleClourPlatformProjectName");

// Bucket name must be unique across the whole Google Cloud Platform.
ipFinder.setBucketName("your_bucket_name");

spi.setIpFinder(ipFinder);

IgniteConfiguration cfg = new IgniteConfiguration();

// Override default discovery SPI.
cfg.setDiscoverySpi(spi);

// Start the node.
Ignition.start(cfg);
```
</Tab>
</Tabs>

## 5.网络配置
### 5.1.IPv4和IPv6
Ignite尝试支持IPv4和IPv6，但这有时会导致集群分离的问题。一个可能的解决方案（除非确实需要IPv6）是通过设置`-Djava.net.preferIPv4Stack=true`JVM参数限制Ignite使用IPv4。
### 5.2.发现
本章节介绍默认发现机制的网络参数，该机制通过`TcpDiscoverySpi`类实现，通过TCP/IP协议交换发现消息。

可以通过如下方式调整该发现机制的参数：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

    <property name="discoverySpi">
        <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
            <property name="localPort" value="8300"/>
        </bean>
    </property>

</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

TcpDiscoverySpi discoverySpi = new TcpDiscoverySpi().setLocalPort(8300);

cfg.setDiscoverySpi(discoverySpi);
Ignite ignite = Ignition.start(cfg);
```
</Tab>
</Tabs>

下表介绍了`TcpDiscoverySpi`最重要的参数，完整参数可以参见[TcpDiscoverySpi](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/spi/discovery/tcp/TcpDiscoverySpi.html)的javadoc。

|属性|描述|默认值|
|---|---|---|
|`localAddress`|设置用于发现的本地主机地址|节点默认使用它找到的第一个非回环地址。如果没有可用的非回环地址，则使用`java.net.InetAddress.getLocalHost()`。|
|`localPort`|设置节点绑定的端口，如果设置为非默认值，其他节点必须知道该端口以发现该节点。|47500|
|`localPortRange`|如果`localPort`被占用，节点会尝试绑定下一个端口（加1），并且会持续这个过程直到找到可用的端口。`localPortRange`属性定义了节点会尝试的端口数量（从`localPort`开始）。|`100`|
|`reconnectCount`|节点尝试与其他节点建立连接的次数。|`10`|
|`networkTimeout`|网络操作的最大网络超时时间（毫秒）。|`5000`|
|`socketTimeout`|套接字超时时间，这个超时时间用于限制连接时间和写套接字时间。|`5000`|
|`ackTimeout`|发现消息的确认时间，如果超时时间内没有收到确认，那么发现SPI会尝试重新发送该消息。|`5000`|
|`joinTimeout`|加入超时定义节点等待加入集群的时间。如果使用了非共享IP探测器，并且节点无法连接到IP探测器的任何地址，则该节点将继续尝试在此超时时间内加入。如果所有地址均无响应，则会引发异常并且节点终止。`0`意味着一直等待。|`0`|
|`statisticsPrintFrequency`|定义节点将发现统计信息输出到日志的频率。`0`表示不输出，如果该值大于0，并且禁用了静默模式，则会每个周期以INFO级别输出一次统计信息。|`0`|

### 5.3.通信
在节点相互发现并组成集群之后，节点通过通信SPI交换消息。消息代表分布式集群操作，例如任务执行、数据修改操作、查询等。通信SPI的默认实现使用TCP/IP协议交换消息（`TcpCommunicationSpi`），本章节会介绍`TcpCommunicationSpi`的属性。

每个节点都打开一个本地通信端口和其他节点连接并发送消息的地址。在启动时，节点会尝试绑定到指定的通信端口（默认为47100）。如果端口已被使用，则节点会递增端口号，直到找到可用端口为止。尝试次数由`localPortRange`属性定义（默认为100）。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

    <property name="communicationSpi">
        <bean class="org.apache.ignite.spi.communication.tcp.TcpCommunicationSpi">
            <property name="localPort" value="4321"/>
        </bean>
    </property>

</bean>
```
</Tab>

<Tab title="Java">

```java
TcpCommunicationSpi commSpi = new TcpCommunicationSpi();

// Set the local port.
commSpi.setLocalPort(4321);

IgniteConfiguration cfg = new IgniteConfiguration();
cfg.setCommunicationSpi(commSpi);

// Start the node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
 var cfg = new IgniteConfiguration
 {
     CommunicationSpi = new TcpCommunicationSpi
     {
         LocalPort = 1234
     }
 };
Ignition.Start(cfg);
```
</Tab>
</Tabs>

下面是`TcpCommunicationSpi`的一些重要参数，完整的参数请参见[TcpCommunicationSpi](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/spi/communication/tcp/TcpCommunicationSpi.html)的javadoc。

|属性|描述|默认值|
|---|---|---|
|`localAddress`|通信SPI绑定的本地主机地址||
|`localPort`|节点用于通信的本地端口|`47100`|
|`localPortRange`|节点尝试按顺序绑定的端口范围，直到找到可用的端口为止。|`100`|
|`tcpNoDelay`|设置套接字选项`TCP_NODELAY`的值，每个创建或者接收的套接字都会使用这个值，它应该设置为`true`（默认），以减少通过TCP协议进行通讯期间请求/响应的时间。大多数情况下不建议改变这个选项。|`true`|
|`idleConnectionTimeout`|设置当连接将要关闭时，最大空闲连接超时时间。|`600000`|
|`usePairedConnections`|设置节点间是否要强制双向套接字连接的标志，如果设置为`true`，通信的节点间会建立两个独立的连接，一个用于出站消息，一个用于入站消息，如果设置为`false`，只会建立一个TCP连接用于双向通信，当消息的传递花费太长时间时，这个标志对于某些操作系统非常有用。|`false`|
|`directBuffer`|在分配NIO直接缓冲区以及NIO堆缓冲区之间进行切换。虽然直接缓冲区执行的更好，但有时（尤其在Windows）可能会造成JVM崩溃，如果在自己的环境中发生了，需要将这个属性设置为`false`。|`true`|
|`directSendBuffer`|当使用异步模式进行消息发送时，在分配NIO直接缓冲区以及NIO堆缓冲区之间进行切换。|`false`|
|`socketReceiveBuffer`|设置通信SPI创建或者接收的套接字的接收缓冲区大小，如果配置为`0`，会使用操作系统默认值。|`0`|
|`socketSendBuffer`|设置通信SPI创建或者接收的套接字的发送缓冲区大小，如果配置为`0`，会使用操作系统默认值。|`0`|

### 5.4.连接超时
连接超时由若干个属性定义：

|属性|描述|默认值|
|---|---|---|
|`IgniteConfiguration.failureDetectionTimeout`|服务端节点之间的基本网络操作超时。|`10000`|
|`IgniteConfiguration.clientFailureDetectionTimeout`|客户端节点之间的基本网络操作超时。|`30000`|

可以在节点配置中设置故障检测超时，如下所示。默认值使发现SPI在大多数本地环境和容器化环境中都能可靠地工作。但是在稳定的低延迟网络中，可以将参数设置为约200毫秒，以便更快地检测故障并对故障做出响应。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

    <property name="failureDetectionTimeout" value="5000"/>

    <property name="clientFailureDetectionTimeout" value="10000"/>

</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setFailureDetectionTimeout(5_000);

cfg.setClientFailureDetectionTimeout(10_000);
```
</Tab>
</Tabs>

## 6.客户端节点连接
### 6.1.客户端节点重连
有几种情况客户端会从集群中断开：

 - 由于网络原因，客户端无法和服务端重建连接；
 - 与服务端的连接有时被断开，客户端也可以重建与服务端的连接，但是由于服务端无法获得客户端心跳，服务端仍然断开客户端节点；
 - 慢客户端会被服务端节点踢出。

当一个客户端发现它与一个集群断开时，会为自己赋予一个新的节点ID然后试图与该服务端重新连接。注意这会产生一个副作用，就是当客户端重建连接时本地`ClusterNode`的`id`属性会发生变化，这意味着，如果业务逻辑依赖于这个`id`，就会受到影响。

在节点配置中可以禁用客户端重连：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="clientMode" value="true"/>

    <property name="discoverySpi">
        <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
            <!-- prevent this client from reconnecting on connection loss -->
            <property name="clientReconnectDisabled" value="true"/>
            <property name="ipFinder">

                <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.vm.TcpDiscoveryVmIpFinder">
                    <property name="addresses">
                        <list>
                            <value>127.0.0.1:47500..47509</value>
                        </list>
                    </property>
                </bean>
            </property>
        </bean>
    </property>
    <property name="communicationSpi">
        <bean class="org.apache.ignite.spi.communication.tcp.TcpCommunicationSpi">
            <property name="slowClientQueueLimit" value="1000"/>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

TcpDiscoverySpi discoverySpi = new TcpDiscoverySpi();
discoverySpi.setClientReconnectDisabled(true);

cfg.setDiscoverySpi(discoverySpi);
```
</Tab>
</Tabs>

当客户端处于一个断开状态并且试图重建与集群的连接过程中时，Ignite API会抛出一个特定的异常：`IgniteClientDisconnectedException`，这个异常提供了一个`Future`表示重连操作，可以使用这个`Future`来等待操作完成。

```java
IgniteCache cache = ignite.getOrCreateCache(new CacheConfiguration<>("myCache"));

try {
    cache.put(1, "value");
} catch (IgniteClientDisconnectedException e) {
    if (e.getCause() instanceof IgniteClientDisconnectedException) {
        IgniteClientDisconnectedException cause = (IgniteClientDisconnectedException) e.getCause();

        cause.reconnectFuture().get(); // Wait until the client is reconnected.
        // proceed
    }
}
```
### 6.2.客户端断连/重连事件
客户端断连/重连集群时也会在客户端触发两个发现事件：

 - `EVT_CLIENT_NODE_DISCONNECTED`
 - `EVT_CLIENT_NODE_RECONNECTED`

可以监听这些事件然后执行自定义的逻辑，具体请参见[事件监听](/doc/java/WorkingwithEvents.md)章节的内容。
### 6.3.管理慢客户端
很多环境中，客户端节点是在主集群外启动的，机器和网络都比较差，而有时服务端可能会产生负载（比如持续查询通知）而客户端没有能力处理，导致服务端的输出消息队列不断增长，这可能最终导致服务端出现内存溢出或者导致整个集群阻塞。

要管理这样的状况，可以配置允许向客户端节点输出消息的最大值，如果输出队列的大小超过配置的值，该客户端节点会从集群断开。

下面是如何配置慢客户端队列限值的示例：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="clientMode" value="true"/>

    <property name="communicationSpi">
        <bean class="org.apache.ignite.spi.communication.tcp.TcpCommunicationSpi">
            <property name="slowClientQueueLimit" value="1000"/>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();
cfg.setClientMode(true);

TcpCommunicationSpi commSpi = new TcpCommunicationSpi();
commSpi.setSlowClientQueueLimit(1000);

cfg.setCommunicationSpi(commSpi);
```
</Tab>
</Tabs>

## 7.基线拓扑
*基准拓扑*是一组持有数据数据的节点。引入基线拓扑概念是为了能够控制数据[再平衡](/doc/java/DataModeling.md#_2-5-再平衡)的时机。例如，如果有一个由3个节点组成的集群，并且数据分布在这些节点上，然后又添加了2个节点，则再平衡过程将在所有5个节点之间重新分配数据。再平衡过程发生在基线拓扑更改时，可以自动发生也可以手动触发。

基线拓扑仅包括服务端节点，不包括客户端节点，因为它们不存储数据。

基线拓扑的目的是：

 - 当服务端节点短时间离开集群时，例如由于偶发的网络故障或计划内的服务器维护，可以避免不必要的数据移动；
 - 可以控制数据再平衡的时机。

当基线拓扑自动调整功能启用后，基线拓扑会自动改变。这是纯内存集群的默认行为，但是对于开启持久化的集群，必须手动启用基线拓扑自动调整功能。该选项默认是禁用的，必须手动更改基线拓扑，可以使用控制脚本来更改基线拓扑。
::: warning 警告
基线拓扑变更过程中尝试创建缓存会抛出异常，详细信息请参见[动态创建缓存](/doc/java/UsingKeyValueApi.md#_1-2-动态创建缓存)。
:::
### 7.1.纯内存集群的基线拓扑
在纯内存集群中，在集群中添加或删除服务端节点默认是自动将基线拓扑调整为所有服务端节点的集合，数据也会自动再平衡，这个行为可以禁用并手动管理基线拓扑。

::: tip 提示
在以前的版本中，基线拓扑仅与开启持久化的集群有关。但是从2.8.0版开始，它也适用于纯内存集群。如果用户有一个纯内存集群，则该变化对用户是透明的，因为基线拓扑默认会在服务端节点离开或加入集群时自动更改。
:::
### 7.2.持久化集群的基线拓扑
如果集群中只要有一个数据区启用了持久化，则首次启动时该集群将处于非激活状态。在非激活状态下，所有操作将被禁止，必须先激活集群然后才能创建缓存和注入数据。集群激活会将当前服务端节点集合设置为基线拓扑。重启集群时，只要基线拓扑中注册的所有节点都加入，集群将自动激活，否则必须手动激活集群。

如下方式中的任何一个，都可以激活集群：

 - [控制脚本](/doc/java/Tools.md#_1-控制脚本)；
 - [REST API命令](/doc/java/RESTAPI.md#_4-3-setstate)；
 - 编程式：

<Tabs>
<Tab title="Java">

```java
Ignite ignite = Ignition.start();

ignite.cluster().state(ClusterState.ACTIVE);
```
</Tab>

<Tab title="C#/.NET">

```csharp
IIgnite ignite = Ignition.Start();
ignite.GetCluster().SetActive(true);
```
</Tab>
</Tabs>

### 7.3.基线拓扑自动调整
如果不想手动调整基线拓扑，还可以让集群自动调整基线拓扑。此功能称为基线拓扑自动调整。启用后集群将监控其服务端节点的状态，并在集群拓扑稳定一段可配置的时间后自动设置当前拓扑的基线。

当集群中的节点集发生变更时，将发生以下情况：

 - Ignite会等待一个可配置的时间（默认为5分钟）；
 - 如果在此期间拓扑中没有其他变更，则Ignite会将基线拓扑设置为当前节点集；
 - 如果在此期间节点集发生更改，则会更新超时时间。

这些节点集的每个变更都会重置自动调整的超时时间。当超时过期且当前节点集与基线拓扑不同（例如存在新节点或一些旧节点离开）时，Ignite将更改基线拓扑以匹配当前节点集，这也会触发数据再平衡。

自动调整超时使用户可以在节点由于临时性网络问题而短时间断开连接或希望快速重启节点时避免数据再平衡。如果希望节点集的临时变更不更改基线拓扑，则可以将超时设置为更高的值。

只有当集群处于激活状态时，基线拓扑才会自动调整。

可以使用[控制脚本](/doc/java/Tools.md#_1-控制脚本)开启该功能，还可以通过编程方式启用该功能。

<Tabs>
<Tab title="Java">

```java
Ignite ignite = Ignition.start();

ignite.cluster().baselineAutoAdjustEnabled(true);

ignite.cluster().baselineAutoAdjustTimeout(30000);
```
</Tab>

<Tab title="C#/.NET">

```csharp
IIgnite ignite = Ignition.Start();
ignite.GetCluster().SetBaselineAutoAdjustEnabledFlag(true);
ignite.GetCluster().SetBaselineAutoAdjustTimeout(30000);
```
</Tab>
</Tabs>

如果要禁用基线的自动调整，可以使用同样的方法，但是传入值为`false`：

<Tabs>
<Tab title="Java">

```java
ignite.cluster().baselineAutoAdjustEnabled(false);
```
</Tab>

<Tab title="C#/.NET">

```csharp
ignite.GetCluster().SetBaselineAutoAdjustEnabledFlag(false);
```
</Tab>
</Tabs>

### 7.4.监控基线拓扑
可以使用下面的工具监控/管理基线：

 - [控制脚本](/doc/java/Tools.md#_1-控制脚本)；
 - [JMX Beans](/doc/java/Monitoring.md#_4-2-6-拓扑监控)。

## 8.在NAT之后运行客户端节点
如果客户端节点部署在NAT之后，则由于通信协议的限制，服务端节点将无法与客户端建立连接。这包括客户端节点在虚拟环境（例如Kubernetes）中运行并且服务器节点部署在其他位置时的部署情况。

对于这种情况，需要启用一种特殊的通信模式：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="clientMode" value="true"/>
    <property name="communicationSpi">
        <bean class="org.apache.ignite.spi.communication.tcp.TcpCommunicationSpi">
            <property name="forceClientToServerConnections" value="true"/>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setClientMode(true);

cfg.setCommunicationSpi(new TcpCommunicationSpi().setForceClientToServerConnections(true));
```
</Tab>
</Tabs>

### 8.1.限制

 - 在服务端和客户端节点上当`TcpCommunicationSpi.usePairedConnections = true`时均不能使用此模式；
 - 从客户端节点启动持续查询（`forceClientToServerConnections = true`）时，[持续查询（转换器和过滤器）](/doc/java/ContinuousQueries.md)的对等类加载不起作用。需要将相应的类添加到每个服务端节点的类路径中；
 - 此属性只能在客户端节点上使用，此限制将在以后的版本中解决。

<RightPane/>
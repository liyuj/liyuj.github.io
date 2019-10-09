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

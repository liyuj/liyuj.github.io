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

# 数据再平衡
## 1.数据再平衡
### 1.1.概述
当一个新节点加入集群时，部分分区会被分配至新的节点，以使整个集群的数据保持平均分布，这个过程称为*数据再平衡*。

如果现有节点永久离开集群，并且未配置备份，则会丢失此节点上存储的分区。配置备份后，丢失分区的备份副本之一将成为主分区，并开始再平衡过程。

::: tip 警告
数据再平衡由[基线拓扑](/doc/java/Clustering.md#_7-基线拓扑)的变化触发。在纯内存集群中，默认行为是在节点离开或加入集群时（基线拓扑自动更改）立即开始再平衡。在开启持久化的集群中，默认必须手动更改基线拓扑，或者在[启用基线自动调整](/doc/java/Clustering.md#_7-3-基线拓扑自动调整)后可以自动更基线拓扑。
:::
再平衡是缓存级的配置。
### 1.2.配置再平衡模式
Ignite支持同步和异步的再平衡，在同步模式中，再平衡结束前缓存的任何操作都会被阻塞。在异步模式中，再平衡过程以异步的模式执行，也可以为某个缓存禁用再平衡。

如果要修改再平衡模式，可以在缓存配置中配置如下的值：

 - `SYNC`：同步再平衡模式，再平衡结束前缓存的任何操作都会被阻塞；
 - `ASYNC`：异步再平衡模式，缓存直接可用，然后在后台会从其它节点加载所有必要的数据；
 - `NONE`：该模式下不会发生再平衡，这意味着要么在访问数据时从持久化存储载入，要么数据被显式地填充。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration" id="ignite.cfg">
    <property name="cacheConfiguration">
        <list>
            <bean class="org.apache.ignite.configuration.CacheConfiguration">
                <property name="name" value="mycache"/>
                <!-- enable synchronous rebalance mode -->
                <property name="rebalanceMode" value="SYNC"/>
            </bean>
        </list>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

CacheConfiguration cacheCfg = new CacheConfiguration("mycache");

cacheCfg.setRebalanceMode(CacheRebalanceMode.SYNC);

cfg.setCacheConfiguration(cacheCfg);

// Start a node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
IgniteConfiguration cfg = new IgniteConfiguration
{
    CacheConfiguration = new[]
    {
        new CacheConfiguration
        {
            Name = "mycache",
            RebalanceMode = CacheRebalanceMode.Sync
        }
    }
};

// Start a node.
var ignite = Ignition.Start(cfg);
```
</Tab>
</Tabs>

### 1.3.配置再平衡线程池
默认一个节点只会有一个线程用于再平衡，这意味着在一个特定的时间点只有一个线程用于从一个节点到另一节点传输批量数据，或者处理来自远端的批量数据。

可以从系统线程池中拿到更多的线程数用于再平衡。每当节点需要将一批数据发送到远端节点或需要处理来自远端节点的一批数据时，都会从池中获取系统线程，批次处理完成后，该线程会被释放。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration" id="ignite.cfg">

    <property name="rebalanceThreadPoolSize" value="4"/>

    <property name="cacheConfiguration">
        <list>
            <bean class="org.apache.ignite.configuration.CacheConfiguration">
                <property name="name" value="mycache"/>
            </bean>
        </list>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setRebalanceThreadPoolSize(4);

CacheConfiguration cacheCfg = new CacheConfiguration("mycache");
cfg.setCacheConfiguration(cacheCfg);

// Start a node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>
</Tabs>

::: warning 警告
在内部，系统线程池广泛用于和缓存有关的所有操作（put，get等），SQL引擎和其它模块，因此将再平衡线程池设置为一个很大的值会显著提高再平衡的性能，但是会影响应用的吞吐量。
:::

### 1.4.再平衡消息限流
当数据从一个节点传输到另一个节点时，整个数据集会被拆分为多个批次然后将每一个批次作为一个单独的消息进行发送，批次的大小和节点在消息之间的等待时间，都是可以配置的。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration" id="ignite.cfg">
    <property name="cacheConfiguration">
        <list>
            <bean class="org.apache.ignite.configuration.CacheConfiguration">
                <property name="name" value="mycache"/>
                <!-- Set batch size. -->
                <property name="rebalanceBatchSize" value="#{2 * 1024 * 1024}"/>
                <!-- Set throttle interval. -->
                <property name="rebalanceThrottle" value="100"/>
            </bean>
        </list>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

CacheConfiguration cacheCfg = new CacheConfiguration("mycache");

cfg.setRebalanceBatchSize(2 * 1024 * 1024);
cfg.setRebalanceThrottle(100);

cfg.setCacheConfiguration(cacheCfg);

// Start a node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
IgniteConfiguration cfg = new IgniteConfiguration
{
    CacheConfiguration = new[]
    {
        new CacheConfiguration
        {
            Name = "mycache",
            RebalanceBatchSize = 2 * 1024 * 1024,
            RebalanceThrottle = new TimeSpan(0, 0, 0, 0, 100)
        }
    }
};

// Start a node.
var ignite = Ignition.Start(cfg);
```
</Tab>
</Tabs>

### 1.5.其他配置
下表列出了`CacheConfiguration`中和再平衡有关的属性：

|属性|描述|默认值|
|---|---|---|
|`rebalanceBatchSize`|单个再平衡消息的大小（字节），在每个节点再平衡算法会将数据拆分为多个批次，然后再将其发送给其他节点。|`512KB`|
|`rebalanceDelay`|当节点加入或者离开集群时，再平衡过程启动的延迟时间（毫秒），如果打算在节点离开拓扑后重启节点，或者打算在同时/一个个启动多个节点的过程中，所有节点都启动完成之前不进行重新分区或者再平衡，也可以推迟。|0，无延迟|
|`rebalanceOrder`|完成再平衡的顺序，只有`SYNC`和`ASYNC`再平衡模式的缓存才可以将再平衡顺序设置为非0值，具有更小值的缓存再平衡会被首先完成，再平衡默认是无序的。|0|
|`rebalanceThrottle`|请参见[再平衡消息限流](#_1-4-再平衡消息限流)|0（限流禁用）|
|`rebalanceTimeout`|节点间交换再平衡消息的挂起超时。|10秒|

### 1.6.再平衡过程监控
通过JMX可以监控[特定缓存的再平衡过程](/doc/java/Monitoring.md#_4-2-5-再平衡监控)。

<RightPane/>
# 配置缓存
## 1.缓存配置
本章节介绍如何设定缓存的配置参数，缓存创建之后，这些参数将无法修改。

::: tip Ignite中的缓存和表
缓存驱动的配置方式是配置选项之一，还可以使用`CREATE TABLE`这样的标准SQL命令来配置缓存/表，具体请参见[键-值缓存与SQL表](/doc/java/DataModeling.md#_1-2-键-值缓存与sql表)章节的内容以了解Ignite中缓存和表的关系。
:::
### 1.1.配置示例
下面是缓存配置的示例：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            <property name="name" value="myCache"/>
            <property name="cacheMode" value="PARTITIONED"/>
            <property name="backups" value="2"/>
            <property name="rebalanceMode" value="SYNC"/>
            <property name="writeSynchronizationMode" value="FULL_SYNC"/>
            <property name="partitionLossPolicy" value="READ_ONLY_SAFE"/>
            <!-- Other parameters -->
        </bean>
    </property>
</bean>
```

完整的参数列表，请参见[CacheConfiguration](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/configuration/CacheConfiguration.html)的javadoc。

</Tab>

<Tab title="Java">

```java
CacheConfiguration cacheCfg = new CacheConfiguration("myCache");

cacheCfg.setCacheMode(CacheMode.PARTITIONED);
cacheCfg.setBackups(2);
cacheCfg.setRebalanceMode(CacheRebalanceMode.SYNC);
cacheCfg.setWriteSynchronizationMode(CacheWriteSynchronizationMode.FULL_SYNC);
cacheCfg.setPartitionLossPolicy(PartitionLossPolicy.READ_ONLY_SAFE);

IgniteConfiguration cfg = new IgniteConfiguration();
cfg.setCacheConfiguration(cacheCfg);

// Start a node.
Ignition.start(cfg);
```

完整的参数列表，请参见[CacheConfiguration](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/configuration/CacheConfiguration.html)的javadoc。

</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    CacheConfiguration = new[]
    {
        new CacheConfiguration
        {
            Name = "myCache",
            CacheMode = CacheMode.Partitioned,
            Backups = 2,
            RebalanceMode = CacheRebalanceMode.Sync,
            WriteSynchronizationMode = CacheWriteSynchronizationMode.FullSync,
            PartitionLossPolicy = PartitionLossPolicy.ReadOnlySafe
        }
    }
};
Ignition.Start(cfg);
```
</Tab>

<Tab title="SQL">

```sql
CREATE TABLE IF NOT EXISTS Person (
  id int,
  city_id int,
  name varchar,
  age int,
  company varchar,
  PRIMARY KEY (id, city_id)
) WITH "cache_name=myCache,template=partitioned,backups=2";
```

完整的参数列表，请参见[CREATE TABLE](/doc/java/SQLReference.md#_2-1-create-table)章节的介绍。

</Tab>
</Tabs>

|参数|描述|默认值|
|---|---|---|
|`name`|缓存名||
|`cacheMode`|该参数定义了数据在集群中的分布方式。在默认的`PARTITIONED`模式中，整体数据集被拆分为分区，然后所有的分区再以平衡的方式分布于相关的节点上。而在`REPLICATED`模式中，所有的数据在所有的节点上都复制一份，具体请参见[分区/复制模式](/doc/java/DataModeling.md#_2-2-分区-复制模式)章节的介绍。|`PARTITIONED`|
|`writeSynchronizationMode`|写同步模式，具体请参见[配置分区备份](#_2-配置分区备份)章节的内容。|`PRIMARY_SYNC`|
|`rebalanceMode`|该参数控制再平衡过程的执行方式。可选值包括：`SYNC`：所有缓存操作都会被阻塞直到再平衡结束；`ASYNC`：再平衡在后台执行；`NONE`：再平衡不会被触发。|`ASYNC`|
|`backups`|缓存的备份分区数量。|`0`|
|`partitionLossPolicy`|[分区丢失策略](#_3-分区丢失策略)|`IGNORE`|
|`readFromBackup`|如果本地的备份分区可用，则从备份分区读取数据，而不是向主分区请求数据（可能位于远程节点）。|`true`|
|`queryPrallelism`|单节点在缓存上执行SQL查询的线程数，具体请参见性能优化的[查询并行度](/doc/java/PerformanceTroubleshooting.md)相关章节的内容。|`1`|

### 1.2.缓存模板
缓存模板是在集群中注册的`CacheConfiguration`实例，然后用作后续创建新缓存或SQL表的基础，一个从模板创建的缓存或表会继承该模板的所有属性。

当使用[CREATE TABLE](/doc/java/SQLReference.md#_2-1-create-table)命令建表时，模板非常有用，因为该命令并不支持所有的缓存参数。

::: tip 提示
当前，CREATE TABLE和REST命令支持模板。
:::
创建模板时，需要定义一个缓存配置然后将其加入`Ignite`实例中，如下所示。如果希望在XML配置文件中定义缓存模板，需要在模板名后面加一个`*`号，这个是用于标示该配置是一个模板而不是实际的缓存。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="cacheConfiguration">
        <list>
            <bean abstract="true" class="org.apache.ignite.configuration.CacheConfiguration" id="cache-template-bean">
                <!-- when you create a template via XML configuration, you must add an asterisk to the name of the template -->
                <property name="name" value="myCacheTemplate*"/>
                <property name="cacheMode" value="PARTITIONED"/>
                <property name="backups" value="2"/>
                <!-- Other cache parameters -->
            </bean>
        </list>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration igniteCfg = new IgniteConfiguration();

try (Ignite ignite = Ignition.start(igniteCfg)) {
    CacheConfiguration cacheCfg = new CacheConfiguration("myCacheTemplate");

    cacheCfg.setBackups(2);
    cacheCfg.setCacheMode(CacheMode.PARTITIONED);

    // Register the cache template
    ignite.addCacheConfiguration(cacheCfg);
}
```
</Tab>

<Tab title="C#/.NET">

```csharp
var ignite = Ignition.Start();

var cfg = new CacheConfiguration
{
    Name = "myCacheTemplate*",
    CacheMode = CacheMode.Partitioned,
    Backups = 2
};

ignite.AddCacheConfiguration(cfg);
```
</Tab>
</Tabs>

缓存模板在集群中注册之后，就可以用相同的配置创建其他缓存了。
## 2.配置分区备份
Ignite默认为每个分区持有一个副本（整个数据集的一个副本），这时如果一个或者多个节点故障，存储于这些节点上的分区就会丢失，为了避免这种情况，可以配置Ignite维护分区的备份副本。
::: tip 提示
备份默认是禁用的。
:::
备份副本是缓存（表）级的配置，如果配置了2个备份副本，集群会为每个分区维护3个副本。其中一个分区称为*主分区*，其他2个称为*备份分区*。扩展来说，具有主分区的节点称为该分区中存储的数据的*主节点*，备份分区对应的节点称为*备份节点*。

当某些数据对应的主分区所在的节点离开集群，Ignite会触发分区映射交换（PME）过程，PME会标记这些数据对应的某个已配置的备份分区为主分区。

备份分区增加了数据的可用性和某些场景的数据读取速度，因为如果本地节点的备份分区可用，Ignite会从备份分区读取数据（这是默认的行为，但是可以禁用）。但是增加了内存的消耗或者持久化存储的大小（如果开启）。
### 2.1.配置备份
在缓存配置中配置`backups`属性，可以配置备份副本的数量。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            <!-- Set the cache name. -->
            <property name="name" value="cacheName"/>
            <!-- Set the cache mode. -->
            <property name="cacheMode" value="PARTITIONED"/>
            <!-- Number of backup copies -->
            <property name="backups" value="1"/>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
CacheConfiguration cacheCfg = new CacheConfiguration();

cacheCfg.setName("cacheName");
cacheCfg.setCacheMode(CacheMode.PARTITIONED);
cacheCfg.setBackups(1);

IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setCacheConfiguration(cacheCfg);

// Start the node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    CacheConfiguration = new[]
    {
        new CacheConfiguration
        {
            Name = "myCache",
            CacheMode = CacheMode.Partitioned,
            Backups = 1
        }
    }
};
Ignition.Start(cfg);
```
</Tab>
</Tabs>

### 2.2.同步和异步备份
通过指定写同步模式，可以配置更新在主备副本之间是同步模式还是异步模式，如下所示：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            <!-- Set the cache name. -->
            <property name="name" value="cacheName"/>
            <!-- Number of backup copies -->
            <property name="backups" value="1"/>

            <property name="writeSynchronizationMode" value="FULL_SYNC"/>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
CacheConfiguration cacheCfg = new CacheConfiguration();

cacheCfg.setName("cacheName");
cacheCfg.setBackups(1);
cacheCfg.setWriteSynchronizationMode(CacheWriteSynchronizationMode.FULL_SYNC);
IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setCacheConfiguration(cacheCfg);

// Start the node.
Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    CacheConfiguration = new[]
    {
        new CacheConfiguration
        {
            Name = "myCache",
            WriteSynchronizationMode = CacheWriteSynchronizationMode.FullSync,
            Backups = 1
        }
    }
};
Ignition.Start(cfg);
```
</Tab>
</Tabs>

写同步模式有如下的可选值：

|值|描述|
|---|---|
|`FULL_SYNC`|客户端节点会等待所有相关的远程节点（主和备）写入或者提交完成。|
|`FULL_ASYNC`|客户端节点不会等待来自相关节点的响应，这时远程节点会在缓存写入或者事务提交方法完成之后稍晚些收到状态更新。|
|`PRIMARY_SYNC`|默认模式，客户端节点会等待主节点的写入或者提交完成，但是不会等待备份的更新。|

## 3.分区丢失策略
在整个集群的生命周期中，由于分区的主节点和备份节点的故障可能出现分区丢失的情况，这会导致部分数据丢失，需要根据场景进行处理。

当一个分区的主副本和所有备份副本均不在线，即该分区的主节点和备份节点全部故障时，该分区将丢失。这意味着对于给定的缓存，能承受的节点故障数不能超过缓存备份数。

当集群拓扑发生变更时，Ignite会检查变更是否导致分区丢失，并根据配置的分区丢失策略和基线自动调整设置，允许或禁止对缓存进行操作，具体请参阅下一章节的介绍。

对于纯内存缓存，当分区丢失时，除非数据重新加载，否则分区中的数据将无法恢复。对于持久化缓存，数据不会物理丢失，因为它已被持久化到磁盘上。当发生故障或断开连接的节点回到集群时（重启后），将从磁盘上加载数据。这时需要重置丢失的分区的状态才能继续使用数据，具体请参阅[处理分区丢失](#_3-3-处理分区丢失)章节的介绍。

### 3.1.配置分区丢失策略
Ignite支持以下的分区丢失策略：

|策略|描述|
|---|---|
|`IGNORE`|分区丢失将被忽略。集群将丢失的分区视为空分区。当请求该分区的数据时，将返回空值，就好像数据从不存在一样。此策略只能在纯内存集群中使用且是默认值，这个模式中启用了基线自动调整且超时为0。在所有其他配置（集群中只要有一个数据区开启了持久化）中，`IGNORE`策略都会被`READ_WRITE_SAFE`替代，即使在缓存配置中显式指定也不行。|
|`READ_WRITE_SAFE`|缓存丢失分区的读写尝试都会抛出异常，但是在线分区的读写是正常的。|
|`READ_ONLY_SAFE`|缓存处于只读状态，缓存的写操作会抛出异常，丢失分区的读操作也会抛出异常，具体请参阅[处理分区丢失](#_3-3-处理分区丢失)章节的介绍。|

分区丢失策略是缓存级的配置。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            <property name="name" value="myCache"/>

            <property name="partitionLossPolicy" value="READ_ONLY_SAFE"/>
        </bean>
    </property>
    <!-- other properties -->

</bean>
```
</Tab>

<Tab title="Java">

```java
CacheConfiguration cacheCfg = new CacheConfiguration("myCache");

cacheCfg.setPartitionLossPolicy(PartitionLossPolicy.READ_ONLY_SAFE);
```
</Tab>
</Tabs>

### 3.2.监听分区丢失事件
当发生分区丢失时，可以监听`EVT_CACHE_REBALANCE_PART_DATA_LOST`事件的通知。每个丢失的分区都会触发该事件，其包含了丢失的分区号以及持有该分区的节点ID。只有使用`READ_WRITE_SAFE`或`READ_ONLY_SAFE`策略时，才会触发分区丢失事件。

首先需要在集群的配置中启用事件，具体参见[启用事件](/doc/java/WorkingwithEvents.md#_1-2-启用事件)的介绍。
```java
Ignite ignite = Ignition.start();

IgnitePredicate<Event> locLsnr = evt -> {
    CacheRebalancingEvent cacheEvt = (CacheRebalancingEvent) evt;

    int lostPart = cacheEvt.partition();

    ClusterNode node = cacheEvt.discoveryNode();

    System.out.println(lostPart);

    return true; // Continue listening.
};

ignite.events().localListen(locLsnr, EventType.EVT_CACHE_REBALANCE_PART_DATA_LOST);
```
关于其他和分区再平衡有关的事件，可以参见[分区再平衡事件](/doc/java/WorkingwithEvents.md#_2-9-缓存再平衡事件)章节的介绍。

### 3.3.处理分区丢失
如果数据没有物理丢失，可以将该节点恢复然后重置丢失分区的状态，这样就可以继续处理该数据，通过控制脚本，或者在特定的缓存上调用`Ignite.resetLostPartitions(cacheNames)`，可以重置分区的状态。

```java
ignite.resetLostPartitions(Arrays.asList("myCache"));
```
控制脚本命令为：
```shell
control.sh --cache reset_lost_partitions myCache
```
如果不重置丢失的分区，根据缓存策略的配置，从丢失分区的读写操作可能会抛出`CacheException`，通过分析上层的触发原因，可以检查该异常是否由分区状态导致：
```java
IgniteCache<Integer, Integer> cache = ignite.cache("myCache");

try {
    Integer value = cache.get(3);
    System.out.println(value);
} catch (CacheException e) {
    if (e.getCause() instanceof CacheInvalidStateException) {
        System.out.println(e.getCause().getMessage());
    } else {
        e.printStackTrace();
    }
}
```
通过`IgniteCache.lostPartitions()`，可以拿到缓存丢失分区的列表：
```java
IgniteCache<Integer, String> cache = ignite.cache("myCache");

cache.lostPartitions();
```
### 3.4.从丢失分区中恢复
下面的章节会介绍根据集群的不同配置，如何从分区丢失中恢复。
#### 3.4.1.IGNORE策略的纯内存集群
在此配置中，该`IGNORE`策略仅适用于启用基线自动调整且超时为0的场景，这也是纯内存集群的默认设置。这时将忽略分区丢失，缓存仍然可以操作，丢失的分区会被视为空分区。

当禁用基线自动调整或超时时间大于0时，`IGNORE`策略会被替换为`READ_WRITE_SAFE`。
#### 3.4.2.READ_WRITE_SAFE或READ_ONLY_SAFE策略的纯内存集群
重置丢失的分区之前，对缓存的操作将被阻止。重置后，缓存可以继续使用，但是数据将丢失。

禁用基线自动调整或超时大于0时，必须在重置丢失的分区之前将节点（每个分区至少一个分区所有者）恢复到基线拓扑。否则，`Ignite.resetLostPartitions(cacheNames)`会抛出一个消息为`Cannot reset lost partitions because no baseline nodes are online [cache=someCahe, partition=someLostPart]`的`ClusterTopologyCheckedException`，表明无法安全恢复。如果由于某种原因（例如硬件故障）而无法恢复节点，需要在重置丢失的分区之前将它们从基线拓扑中手动删除。
#### 3.4.3.开启持久化的集群
如果所有的数据区都开启了持久化（没有纯内存数据区），那么有两种从丢失分区中恢复的方式（只要数据没有物理损坏）：

 1. 让所有的节点返回到基线；
 2. 重置丢失的分区（所有的缓存调用`Ignite.resetLostPartitions(…​)`）。

或者：

 1. 停止所有的节点；
 2. 启动包括故障节点在内的所有节点，然后激活集群。

如果某些节点无法返回，在尝试重置丢失分区状态前，需要将他们从基线拓扑中删除。
#### 3.4.4.同时有纯内存和持久化缓存的集群
如果集群同时有纯内存的数据区和持久化的数据区，那么纯内存的缓存会和配置为`READ_WRITE_SAFE`的纯内存集群的处理方式一致，而持久化的缓存会和持久化的集群的处理方式一致。
## 4.原子化模式
缓存默认仅支持原子操作，而批量操作（例如`putAll()`或`removeAll()`）则按顺序单独执行写入和删除。但是也可以启用事务支持并将一个或多个缓存操作，可能对应一个或者多个键，分组为单个原子事务。这些操作在没有任何其他交叉操作的情况下执行，或全部成功或全部失败，没有部分成功的状态。

要启用缓存的事务支持，需要将缓存配置中的`atomicityMode`参数设置为`TRANSACTIONAL`。

::: warning 警告
如果在一个缓存组中配置了多个缓存，这些缓存的原子化模式应全部相同，不能有的是`TRANSACTIONAL`，有的是`ATOMIC`。
:::
Ignite支持3种原子化模式，如下表所示：

|原子化模式|描述|
|---|---|
|`ATOMIC`|默认模式，所有操作都会原子化地执行，一次一个，不支持事务。`ATOMIC`模式通过避免事务锁，提供了最好的性能，同时为每个单个操作提供了数据原子性和一致性。比如`putAll(…​)`以及`removeAll(…​)`方法这样的批量操作，并不以事务方式执行，可能部分失败，如果发生了这种情况，会抛出`CachePartialUpdateException`异常，其中包含了更新失败的键列表。|
|`TRANSACTIONAL`|在键-值API层面开启了符合ACID的事务支持，但是SQL不支持事务。该模式的事务支持不同的[并发模型和隔离级别](/doc/java/Transactions.md#_1-3-并发模型和隔离级别)。如果确实需要符合ACID操作才建议开启这个模式，因为事务会导致性能下降。具体请参见[执行事务](/doc/java/Transactions.md)。|
|`TRANSACTIONAL_SNAPSHOT`|多版本并发控制（MVCC）的试验性实现。其同时支持键-值事务和SQL事务，更多的信息以及限制，请参见[多版本并发控制](/doc/java/WorkingwithSQL.md#_11-多版本并发控制)。**注意：**MVCC实现目前还处于测试阶段，不建议用于生产。|

可以在缓存配置中为缓存开启事务支持：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            <property name="name" value="myCache"/>

            <property name="atomicityMode" value="TRANSACTIONAL"/>
        </bean>
    </property>

    <!-- Optional transaction configuration. -->
    <property name="transactionConfiguration">
        <bean class="org.apache.ignite.configuration.TransactionConfiguration">
            <!-- Configure TM lookup here. -->
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
CacheConfiguration cacheCfg = new CacheConfiguration();

cacheCfg.setName("cacheName");

cacheCfg.setAtomicityMode(CacheAtomicityMode.TRANSACTIONAL);

IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setCacheConfiguration(cacheCfg);

// Optional transaction configuration. Configure TM lookup here.
TransactionConfiguration txCfg = new TransactionConfiguration();

cfg.setTransactionConfiguration(txCfg);

// Start a node
Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    CacheConfiguration = new[]
    {
        new CacheConfiguration("txCache")
        {
            AtomicityMode = CacheAtomicityMode.Transactional
        }
    },
    TransactionConfiguration = new TransactionConfiguration
    {
        DefaultTransactionConcurrency = TransactionConcurrency.Optimistic
    }
};
```
</Tab>
</Tabs>

## 5.过期策略
### 5.1.概述
过期策略指定了在缓存条目过期之前必须经过的时间量，时间可以从创建、最后访问或者修改时间开始计算。

根据内存配置，过期策略将从内存或磁盘上删除条目：

 - **内存模式**：数据仅保存在内存中，过期的条目会完全从内存中清除；
 - **内存+Ignite持久化**：过期的条目会完全从内存和磁盘上删除，注意过期策略会从磁盘上的分区文件中删除数据，但是不会释放空间，该空间会在后续的数据写入中重用；
 - **内存+外部存储**：过期的条目仅仅从内存（Ignite）中删除，外部存储（RDBMS、NoSQL以及其它数据库）中的数据会保持不变；
 - **内存+交换空间**：过期的条目会同时从内存和交换空间中删除。

过期策略可以通过任何标准的`javax.cache.expiry.ExpiryPolicy`实现或自定义实现进行设置：
### 5.2.配置
下面是过期策略的配置示例：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.CacheConfiguration">
    <property name="name" value="myCache"/>
    <property name="expiryPolicyFactory">
        <bean class="javax.cache.expiry.CreatedExpiryPolicy" factory-method="factoryOf">
            <constructor-arg>
                <bean class="javax.cache.expiry.Duration">
                    <constructor-arg value="MINUTES"/>
                    <constructor-arg value="5"/>
                </bean>
            </constructor-arg>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
CacheConfiguration<Integer, String> cfg = new CacheConfiguration<Integer, String>();
cfg.setName("myCache");
cfg.setExpiryPolicyFactory(CreatedExpiryPolicy.factoryOf(Duration.FIVE_MINUTES));
```
</Tab>

<Tab title="C#/.NET">

```csharp
class ExpiryPolicyFactoryImpl : IFactory<IExpiryPolicy>
{
    public IExpiryPolicy CreateInstance()
    {
        return new ExpiryPolicy(TimeSpan.FromMilliseconds(100), TimeSpan.FromMilliseconds(100),
            TimeSpan.FromMilliseconds(100));
    }
}

public static void Example()
{
    var cfg = new CacheConfiguration
    {
        Name = "cache_name",
        ExpiryPolicyFactory = new ExpiryPolicyFactoryImpl()
    };
```
</Tab>
</Tabs>

也可以为单独的缓存操作配置或者修改过期策略，该策略会影响返回的缓存实例上调用的每个操作：
```java
CacheConfiguration<Integer, String> cacheCfg = new CacheConfiguration<Integer, String>("myCache");

ignite.createCache(cacheCfg);

IgniteCache cache = ignite.cache("myCache")
        .withExpiryPolicy(new CreatedExpiryPolicy(new Duration(TimeUnit.MINUTES, 5)));

// if the cache does not contain key 1, the entry will expire after 5 minutes
cache.put(1, "first value");
```

### 5.3.Eager TTL（热生存时间）
过期的条目从缓存中删除，既可以马上删除，也可以在缓存操作对其访问时再删除。只要有一个缓存启用了热生存时间，Ignite就会创建一个线程在后台清理过期的数据。

如果该属性配置为`false`，过期的条目不会被马上删除，而是在执行缓存操作时由执行该操作的线程将其删除。

热生存时间可以通过`CacheConfiguration.eagerTtl`属性启用或者禁用（默认值是`true`）。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.CacheConfiguration">
    <property name="eagerTtl" value="true"/>
</bean>
```
</Tab>

<Tab title="Java">

```java
CacheConfiguration<Integer, String> cfg = new CacheConfiguration<Integer, String>();
cfg.setName("myCache");

cfg.setEagerTtl(true);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new CacheConfiguration
{
    Name = "cache_name",
    EagerTtl = true
};
```
</Tab>
</Tabs>

## 6.堆内缓存
Ignite在Java堆外部使用堆外内存来分配数据区，但是可以通过配置`CacheConfiguration.setOnheapCacheEnabled(true)`来开启堆内缓存。

对于在使用[二进制形式](/doc/java/DataModeling.md#_4-二进制编组器)的缓存条目或调用缓存条目的反序列化的服务器节点上进行大量缓存读取的场景，堆内缓存很有用。例如，当分布式计算或部署的服务从缓存中获取数据进行进一步处理时，可能会发生这种情况。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            <property name="name" value="myCache"/>
            <property name="onheapCacheEnabled" value="true"/>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
CacheConfiguration cfg = new CacheConfiguration();
cfg.setName("myCache");
cfg.setOnheapCacheEnabled(true);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new CacheConfiguration
{
    Name = "myCache",
    OnheapCacheEnabled = true
};
```
</Tab>
</Tabs>

### 6.1.配置退出策略
启用堆内缓存后，可以使用堆内缓存退出策略来管理不断增长的堆内缓存。

退出策略控制缓存的堆内存中可以存储的最大数据量，当到达最大值后，条目会从Java堆中退出。
::: tip 提示
堆内退出策略只会从Java堆中删除缓存条目，堆内数据区中存储的数据不受影响。
:::
退出策略支持基于批次的退出和基于内存大小限制的退出。如果开启了基于批次的退出，那么当缓存的数量比缓存最大值多出`batchSize`个条目时，退出就开始了，这时`batchSize`个条目就会被退出。如果开启了基于内存大小限制的退出，那么当缓存条目的大小（字节数）大于最大值时，退出就会被触发。

::: tip 注意
只有未配置最大内存限制时，才会支持基于批次的退出。
:::

Ignite中退出策略是可插拔的，可以通过`EvictionPolicy`接口进行控制，退出策略的实现定义了从堆内缓存选择待退出条目的算法，然后当缓存发生改变时就会收到通知。
#### 6.1.1.最近最少使用（LRU）
LRU退出策略基于[最近最少使用](http://en.wikipedia.org/wiki/Cache_algorithms#Least_Recently_Used)算法，它会确保最近最少使用的数据（即最久没有被访问的数据）会被首先退出。

::: tip 注意
LRU退出策略适用于堆内缓存的大多数使用场景，不确定时可以优先使用。
:::

这个退出策略通过`CacheConfiguration`进行配置，支持基于批次的退出以及基于内存大小限制的退出，如下所示：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.cache.CacheConfiguration">
  <property name="name" value="myCache"/>

  <!-- Enabling on-heap caching for this distributed cache. -->
  <property name="onheapCacheEnabled" value="true"/>

  <property name="evictionPolicy">
    <!-- LRU eviction policy. -->
    <bean class="org.apache.ignite.cache.eviction.lru.LruEvictionPolicy">
        <!-- Set the maximum cache size to 1 million (default is 100,000). -->
      <property name="maxSize" value="1000000"/>
    </bean>
  </property>

</bean>
```
</Tab>

<Tab title="Java">

```java
CacheConfiguration cacheCfg = new CacheConfiguration();

cacheCfg.setName("cacheName");

// Enabling on-heap caching for this distributed cache.
cacheCfg.setOnheapCacheEnabled(true);

// Set the maximum cache size to 1 million (default is 100,000).
cacheCfg.setEvictionPolicyFactory(() -> new LruEvictionPolicy(1000000));

IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setCacheConfiguration(cacheCfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    CacheConfiguration = new[]
    {
        new CacheConfiguration
        {
            Name = "cacheName",
            OnheapCacheEnabled = true,
            EvictionPolicy = new LruEvictionPolicy
            {
                MaxSize = 100000
            }
        }
    }
};
```
</Tab>
</Tabs>

#### 6.1.2.先进先出（FIFO）
FIFO退出策略基于[先进先出（FIFO）](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))算法，它确保缓存中保存时间最久的数据会被首先退出，它与`LruEvictionPolicy`不同，因为它忽略了数据的访问顺序。

这个策略通过`CacheConfiguration`进行配置，支持基于批次的退出以及基于内存大小限制的退出。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.cache.CacheConfiguration">
  <property name="name" value="myCache"/>

  <!-- Enabling on-heap caching for this distributed cache. -->
  <property name="onheapCacheEnabled" value="true"/>

  <property name="evictionPolicy">
    <!-- FIFO eviction policy. -->
    <bean class="org.apache.ignite.cache.eviction.fifo.FifoEvictionPolicy">
        <!-- Set the maximum cache size to 1 million (default is 100,000). -->
      <property name="maxSize" value="1000000"/>
    </bean>
  </property>

</bean>
```
</Tab>

<Tab title="Java">

```java
CacheConfiguration cacheCfg = new CacheConfiguration();

cacheCfg.setName("cacheName");

// Enabling on-heap caching for this distributed cache.
cacheCfg.setOnheapCacheEnabled(true);

// Set the maximum cache size to 1 million (default is 100,000).
cacheCfg.setEvictionPolicyFactory(() -> new FifoEvictionPolicy(1000000));

IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setCacheConfiguration(cacheCfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    CacheConfiguration = new[]
    {
        new CacheConfiguration
        {
            Name = "cacheName",
            OnheapCacheEnabled = true,
            EvictionPolicy = new FifoEvictionPolicy
            {
                MaxSize = 100000
            }
        }
    }
};
```
</Tab>
</Tabs>

#### 6.1.3.有序
有序退出策略和FIFO退出策略很像，不同点在于通过默认或者用户定义的比较器定义了数据的顺序，然后确保最小的数据（即排序数值最小的数据）会被退出。

默认的比较器用缓存条目的键作为比较器，它要求键必须实现`Comparable`接口。也可以提供自定义的比较器实现，可以通过键，值或者两者都用来进行条目的比较。

这个策略通过`CacheConfiguration`进行配置，支持基于批次的退出以及基于内存大小限制的退出。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.cache.CacheConfiguration">
  <property name="name" value="myCache"/>

  <!-- Enabling on-heap caching for this distributed cache. -->
  <property name="onheapCacheEnabled" value="true"/>

  <property name="evictionPolicy">
    <!-- Sorted eviction policy. -->
    <bean class="org.apache.ignite.cache.eviction.sorted.SortedEvictionPolicy">
      <!--
      Set the maximum cache size to 1 million (default is 100,000)
      and use default comparator.
      -->
      <property name="maxSize" value="1000000"/>
    </bean>
  </property>

</bean>
```
</Tab>

<Tab title="Java">

```java
CacheConfiguration cacheCfg = new CacheConfiguration();

cacheCfg.setName("cacheName");

// Enabling on-heap caching for this distributed cache.
cacheCfg.setOnheapCacheEnabled(true);

// Set the maximum cache size to 1 million (default is 100,000).
cacheCfg.setEvictionPolicyFactory(() -> new SortedEvictionPolicy(1000000));

IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setCacheConfiguration(cacheCfg);
```
</Tab>
</Tabs>

## 7.缓存组
对于集群中的缓存来说，总有一个开销，即缓存被拆分为分区后其状态必须在每个集群节点上进行跟踪以满足系统的需要。

如果开启了[Ignite的原生持久化](/doc/java/Persistence.md#_1-ignite持久化)，那么对于每个分区来说，都会在磁盘上打开一个文件进行读写，因此，如果有更多的缓存和分区：

 - 分区映射就会占用更多的Java堆，每个缓存都有自己的分区映射；
 - 新节点加入集群就会花费更多的时间；
 - 节点离开集群也会因为再平衡花费更多的时间；
 - 打开中的分区文件就会更多从而影响检查点的性能。

通常，如果只有几十甚至几百个缓存时，不用担心这些问题，但是如果增长到上千时，这类问题就会凸显。

要避免这个影响，可以考虑使用缓存组，一个组内的缓存会共享各种内部数据结构比如上面提到的分区映射，这样，会提高拓扑事件处理的效率以及降低整体的内存使用量。注意，从API上来看，缓存是不是组的一部分并没有什么区别。

通过配置`CacheConfiguration`的`groupName`属性可以创建一个缓存组，示例如下：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="cacheConfiguration">
        <list>
            <!-- Partitioned cache for Persons data. -->
            <bean class="org.apache.ignite.configuration.CacheConfiguration">
                <property name="name" value="Person"/>
                <property name="backups" value="1"/>
                <!-- Group the cache belongs to. -->
                <property name="groupName" value="group1"/>
            </bean>
            <!-- Partitioned cache for Organizations data. -->
            <bean class="org.apache.ignite.configuration.CacheConfiguration">
                <property name="name" value="Organization"/>
                <property name="backups" value="1"/>
                <!-- Group the cache belongs to. -->
                <property name="groupName" value="group1"/>
            </bean>
        </list>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
// Defining cluster configuration.
IgniteConfiguration cfg = new IgniteConfiguration();

// Defining Person cache configuration.
CacheConfiguration<Integer, Person> personCfg = new CacheConfiguration<Integer, Person>("Person");

personCfg.setBackups(1);

// Group the cache belongs to.
personCfg.setGroupName("group1");

// Defining Organization cache configuration.
CacheConfiguration orgCfg = new CacheConfiguration("Organization");

orgCfg.setBackups(1);

// Group the cache belongs to.
orgCfg.setGroupName("group1");

cfg.setCacheConfiguration(personCfg, orgCfg);

// Starting the node.
Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    CacheConfiguration = new[]
    {
        new CacheConfiguration
        {
            Name = "Person",
            Backups = 1,
            GroupName = "group1"
        },
        new CacheConfiguration
        {
            Name = "Organization",
            Backups = 1,
            GroupName = "group1"
        }
    }
};
Ignition.Start(cfg);
```
</Tab>
</Tabs>

在上面的示例中，`Person`和`Organization`缓存都属于`group1`。
::: tip 如何区分键-值对
如果将缓存分配给一个缓存组，则其数据存储在共享分区的内部结构中。写入缓存的每个键都会附加其所属的缓存的唯一ID。该ID是从缓存名派生的。这些都是透明的，并允许将不同缓存的数据存储在相同的分区和B+树结构中。
:::
对缓存进行分组的原因很简单，如果决定对1000个缓存进行分组，则存储分区数据、分区映射和打开分区文件的结构将减少为原来的千分之一。
::: tip 缓存组是否应一直使用？
虽然有这么多的好处，但是它可能影响读操作和索引的性能，这是由于所有的数据和索引都混合在一个共享的数据结构（分区映射、B+树）中，查询的时间变长导致的。
因此，如果集群有数十个和数百个节点和缓存，并且由于内部结构、检查点性能下降和/或节点到集群的连接速度较慢而遇到Java堆使用增加的情况，可以考虑使用缓存组。
:::

## 8.近缓存
近缓存是一种本地缓存，用于在本地节点上存储最近或最常访问的数据。假设应用启动了一个客户端节点并定期查询数据，例如国家/地区代码。因为客户端节点不存储数据，所以这些查询总是从远程节点获取数据。这时可以配置近缓存，以在应用运行时将国家/地区代码保留在本地节点上，这样可以提高性能。

近缓存为特定的常规缓存配置，并且仅保留该缓存的数据。

近缓存将数据存储在堆内存中，可以为近缓存条目配置缓存的最大值和退出策略。
::: tip 提示
近缓存是完全事务性的，并且每当服务端节点上的数据更改时，它们都会自动更新或失效。
:::

### 8.1.配置近缓存
可以在缓存配置中为特定缓存配置近缓存：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.CacheConfiguration">
    <property name="name" value="myCache"/>
    <property name="nearConfiguration">
        <bean class="org.apache.ignite.configuration.NearCacheConfiguration">
            <property name="nearEvictionPolicyFactory">
                <bean class="org.apache.ignite.cache.eviction.lru.LruEvictionPolicyFactory">
                    <property name="maxSize" value="100000"/>
                </bean>
            </property>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
// Create a near-cache configuration for "myCache".
NearCacheConfiguration<Integer, Integer> nearCfg = new NearCacheConfiguration<>();

// Use LRU eviction policy to automatically evict entries
// from near-cache whenever it reaches 100_000 entries
nearCfg.setNearEvictionPolicyFactory(new LruEvictionPolicyFactory<>(100_000));

CacheConfiguration<Integer, Integer> cacheCfg = new CacheConfiguration<Integer, Integer>("myCache");

cacheCfg.setNearConfiguration(nearCfg);

// Create a distributed cache on server nodes
IgniteCache<Integer, Integer> cache = ignite.getOrCreateCache(cacheCfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cacheCfg = new CacheConfiguration
{
    Name = "myCache",
    NearConfiguration = new NearCacheConfiguration
    {
        EvictionPolicy = new LruEvictionPolicy
        {
            MaxSize = 100_000
        }
    }
};

var cache = ignite.GetOrCreateCache<int, int>(cacheCfg);
```
</Tab>
</Tabs>

以这种方式配置后，就在从底层缓存请求数据的任何节点（包括服务端节点和客户端节点）上创建近缓存。如以下示例所示，当拿到缓存的实例时，数据将通过近缓存获得：
```java
IgniteCache<Integer, Integer> cache = ignite.cache("myCache");

int value = cache.get(1);
```
`CacheConfiguration`中与近缓存有关的大部分参数都会继承于底层缓存的配置，比如，如果底层缓存有一个`ExpiryPolicy`配置，近缓存中的条目也会基于同样的策略。

下表中列出的参数是不会从底层配置中继承的：

|参数|描述|默认值|
|---|---|---|
|`nearEvictionPolicy`|近缓存[退出策略](/doc/java/ConfiguringMemory.md#_3-退出策略)|无|
|`nearStartSize`|近缓存初始大小（可持有的条目数）|375,000|

### 8.2.客户端节点动态创建近缓存
从客户端节点向尚未配置近缓存的缓存发出请求时，可以为该缓存动态创建近缓存，通过在客户端本地存储“热”数据来提高性能。此缓存仅在创建它的节点上生效。

为此，创建一个近缓存配置并将其作为参数传递给获取缓存实例的方法：

<Tabs>
<Tab title="Java">

```java
// Create a near-cache configuration
NearCacheConfiguration<Integer, String> nearCfg = new NearCacheConfiguration<>();

// Use LRU eviction policy to automatically evict entries
// from near-cache, whenever it reaches 100_000 in size.
nearCfg.setNearEvictionPolicyFactory(new LruEvictionPolicyFactory<>(100_000));

// get the cache named "myCache" and create a near cache for it
IgniteCache<Integer, String> cache = ignite.getOrCreateNearCache("myCache", nearCfg);

String value = cache.get(1);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var ignite = Ignition.Start(new IgniteConfiguration
{
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
    CacheConfiguration = new[]
    {
        new CacheConfiguration {Name = "myCache"}
    }
});
var client = Ignition.Start(new IgniteConfiguration
{
    IgniteInstanceName = "clientNode",
    ClientMode = true,
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
    }
});
// Create a near-cache configuration
var nearCfg = new NearCacheConfiguration
{
    // Use LRU eviction policy to automatically evict entries
    // from near-cache, whenever it reaches 100_000 in size.
    EvictionPolicy = new LruEvictionPolicy()
    {
        MaxSize = 100_000
    }
};


// get the cache named "myCache" and create a near cache for it
var cache = client.GetOrCreateNearCache<int, string>("myCache", nearCfg);
```
</Tab>
</Tabs>

<RightPane/>
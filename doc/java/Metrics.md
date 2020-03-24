# 指标
## 1.内存指标
### 1.1.数据区指标
Ignite的固化内存可以通过`DataRegionMetrics`接口以及JMX Bean暴露的一些参数进行监控，通过这些指标，可以跟踪所有的内存使用，度量性能，以及执行必要的优化。

对于和某个特定节点有关的指标，`DataRegionMetrics`接口是主要的入口点，因为一个节点可以配置多个区域，因此每个区域的指标都是单独收集和获取的。

**启用数据区指标**

可以为希望收集指标的区域配置`DataRegionConfiguration.setMetricsEnabled(true)`，已开启指标收集：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="dataStorageConfiguration">
    <bean class="org.apache.ignite.configuration.DataStorageConfiguration">
      <property name="dataRegionConfigurations">
        <list>
          <bean class="org.apache.ignite.configuration.DataRegionConfiguration">
            <!-- Custom region name. -->
            <property name="name" value="myDataRegion"/>

            <!-- Enable metrics for this data region  -->
            <property name="metricsEnabled" value="true"/>

            <!-- Other configurations -->
            ...
          </bean>
        </list>
      </property>
    </bean>
  </property>

  <!-- Other Ignite configurations -->
  ...
</bean>
```
Java：
```java
// Ignite configuration.
IgniteConfiguration cfg = new IgniteConfiguration();

// Durable Memory configuration.
DataStorageConfiguration storageCfg = new DataStorageConfiguration();

// Create a new data region.
DataRegionConfiguration regionCfg = new DataRegionConfiguration();

// Region name.
regionCfg.setName("myDataRegion");

// Enabe metrics for this region.
regionCfg.setMetricsEnabled(true);

// Set the data region configuration.
storageCfg.setDataRegionConfigurations(regionCfg);

// Other configurations
...

// Apply the new configuration.
cfg.setDataStorageConfiguration(storageCfg);
```

**获取指标**

使用`Ignite.dataRegionMetrics()`接口的方法或者对应的JMX Bean可以获得最新的指标快照然后进行迭代，如下所示：
```java
// Get the metrics of all the data regions configured on a node.
Collection<DataRegionMetrics> regionsMetrics = ignite.dataRegionMetrics();

// Print out some of the metrics.
for (DataRegionMetrics metrics : regionsMetrics) {
    System.out.println(">>> Memory Region Name: " + metrics.getName());
    System.out.println(">>> Allocation Rate: " + metrics.getAllocationRate());
    System.out.println(">>> Fill Factor: " + metrics.getPagesFillFactor());
    System.out.println(">>> Allocated Size: " + metrics.getTotalAllocationSize());
    System.out.println(">>> Physical Memory Size: " + metrics.getPhysicalMemorySize());
}
```
下面是数据区的可用指标列表：

|`方法名`|`描述`|
|---|---|
|`getName()`|返回指标所属内存区的名字。|
|`getTotalAllocatedPages()`|获取该内存区已分配页面的总数量。|
|`getAllocationRate()`|获取该内存区的页面分配比率。|
|`getEvictionRate()`|获取该内存区的页面退出比率。|
|`getLargeEntriesPagesPercentage()`|获取被超过页面大小的大条目完全占用的页面的百分比，大条目也可以拆分为多个片段，每个片段适配一个单个页面。|
|`getPagesFillFactor()`|获取仍然空闲可用的空间的百分比。|
|`getDirtyPages()`|获取脏页面的数量（页面的内容与磁盘上同一页的内容不同），这个指标只有当持久化存储启用的时候才可用。|
|`getPagesReplaceRate()`|获取内存中的页面被磁盘上的其它页面替换的速率（页/秒）。这个指标有效地表示了内存中页面退出并且被磁盘上的页面替换的速率，这个指标只有当持久化存储启用的时候才可用。|
|`getPhysicalMemoryPages()`|获取当前加载进内存的页面数量，如果持久化存储未启用，这个指标会等同于`getTotalAllocatedPages()`。|
|`getTotalAllocatedSize()`|获取为内存区分配的总内存大小（字节），如果禁用原生持久化，该指标显示内存中页面总大小，如果启用原生持久化，该指标显示内存和磁盘上的页面总大小。|
|`getPhysicalMemorySize()`|获取内存中加载的页面总大小（字节），如果禁用了原生持久化，该指标与`getTotalAllocatedSize()`一致。|
|`getCheckpointBufferPages()`|获取页面中的检查点缓冲区大小。|
|`getCheckpointBufferSize()`|获取检查点缓冲区大小（字节）。|
|`getPageSize()`|获取内存页面大小。|

**使用JMX Bean**

所有本地节点的`DataRegionMetrics`，都是可以通过JMX接口`DataRegionMetricsMXBean`访问的，可以通过任何兼容JMX的工具或者API接入。

使用特定JMX bean暴露的`DataRegionMetricsMXBean.enableMetrics()`方法可以激活数据区的指标收集。

JMX bean暴露了与`DataRegionMetrics`相同的指标集合，然后还有些其它的，具体可以看[DataRegionMetricsMXBean](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/mxbean/DataRegionMetricsMXBean.html)的javadoc。
### 1.2.Ignite原生持久化指标
Ignite还为原生持久化提供了一组指标，这些指标在`DataStorageMetrics`接口中分组。

**启用数据存储指标**

通过配置`DataStorageConfiguration.setMetricsEnabled(true)`可以启用相关的指标收集，如下：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="dataStorageConfiguration">
    <bean class="org.apache.ignite.configuration.DataStorageConfiguration">
      <!-- Enable metrics for Ignite persistence  -->
      <property name="metricsEnabled" value="true"/>

      <!-- Other configurations -->
      ...
    </bean>
  </property>

  <!-- Other Ignite configurations -->
  ...
</bean>
```
Java：
```java
// Ignite configuration.
IgniteConfiguration cfg = new IgniteConfiguration();

// Durable Memory configuration.
DataStorageConfiguration storageCfg = new DataStorageConfiguration();

// Enable metrics for Ignite persistence.
storageCfg.setMetricsEnabled(true);

// Other configurations
...

// Apply the new configuration.
cfg.setDataStorageConfiguration(storageCfg);
```

**获取指标**

调用`Ignite.dataStorageMetrics()`方法可以获取最新的持久化指标快照，如下所示：
```java
// Getting metrics.
DataStorageMetrics pm = ignite.dataStorageMetrics();

System.out.println("Fsync duration: " + pm.getLastCheckpointFsyncDuration());

System.out.println("Data pages: " + pm.getLastCheckpointDataPagesNumber());

System.out.println("Checkpoint duration:" + pm.getLastCheckpointDuration());
```
下面是和数据存储有关的可用指标列表：

|`方法名`|`描述`|
|---|---|
|`getWalWritingRate()`|获取在最后配置的时间间隔内，每秒写入WAL的平均记录数。|
|`getWalArchiveSegments()`|获取目前WAL归档中的段数量。|
|`getWalFsyncTimeAverage()`|获取在最后配置的时间间隔内，以微妙计的平均WAL FSYNC模式持续时间。|
|`getLastCheckpointDuration()`|获取以毫秒计的最近一次检查点进程持续时间。|
|`getLastCheckpointTotalPagesNumber()`|获取最近的检查点进程中写入的页面总数。|

具体可以看[DataStorageMetrics](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/DataStorageMetrics.html)的javadoc。

**使用JMX Bean**

原生持久化的指标，也可以通过JMX接口`DataStorageMetricsMXBean`收集的，可以通过任何兼容JMX的工具或者API接入。

使用特定JMX bean暴露的`DataStorageMetricsMXBean.enableMetrics()`方法可以激活持久化相关的指标收集。

JMX bean暴露了与`DataStorageMetrics`相同的指标集合，然后还有些其它的，具体可以看[DataStorageMetricsMXBean](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/mxbean/DataStorageMetricsMXBean.html)的javadoc。

::: warning 启用指标收集
指标收集不是一个无代价的操作，会影响应用的性能，因此默认是关闭的，如果要打开，可以使用下面的方式：

 1.对于数据区可以配置`DataRegionConfiguration.setMetricsEnabled(true)`；
 2.对于原生持久化可以配置`DataStorageConfiguration.setMetricsEnabled(true)`；
 3.可以使用特定JMXbean暴露的`DataRegionMetricsMXBean.enableMetrics()`方法；
 4.可以使用特定JMXbean暴露的`DataStorageMetricsMXBean.enableMetrics()`方法；
:::

### 1.3.内存使用量计算
还可以获得与特定`CacheGroup`有关的缓存的指标，目前这些指标只能通过`CacheGroupMetricsMXBean`JMX接口访问，具体的可用指标列表，可以看[CacheGroupMetricsMXBean](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/mxbean/CacheGroupMetricsMXBean.html)的javadoc。

**单节点内存使用**

下面的示例显示如何计算*当前节点大小*，即当前节点的总体数据量（MB/GB），以及*当前缓存大小*，即缓存的数据大小（MB/GB）。

 1. 当前节点大小：`DataStorageMetricsMXBean#getTotalAllocatedSize`；
 2. 某个节点的特定缓存的当前大小：`CacheGroupMetricsMXBean#getTotalAllocatedSize`，注意，这个指标只是一个缓存组内一个缓存（默认行为）。

**集群范围内存使用**

 1. 要计算整个集群的大小，可以对所有节点的`DataStorageMetricsMXBean#getTotalAllocatedSize`进行汇总；
 2. 当前缓存的总大小为所有节点的`CacheGroupMetricsMXBean#getTotalAllocatedSize`汇总，注意，这个指标只是一个缓存组内一个缓存（默认行为）。

## 2.缓存指标
通过`CacheMetrics`接口，Ignite还可以监测和分布式缓存有关的统计数据。

`CacheMetrics`接口有各种指标，比如：缓存处理的put和get操作的总数，平均put和get时间，退出总数量，当前后写缓存存储缓冲区大小，以及更多。
### 2.1.启用缓存指标
要启用缓存指标，可以将希望收集指标缓存的`CacheConfiguration.setStatisticsEnabled(boolean)`配置为`true`。

下面以名为`test-cache`的缓存为例：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="cacheConfiguration">
    <list>
      <bean class="org.apache.ignite.configuration.CacheConfiguration">
        <property name="name" value="test-cache"/>

        <!-- Enabling statistics for this specific cache. -->
        <property name="statisticsEnabled" value="true"/>
      </bean>
    </list>
  </property>
</bean>
```
Java：
```java
IgniteConfiguration cfg = new IgniteConfiguration();

CacheConfiguration cacheCfg = new CacheConfiguration("test-cache");

// Enabling the metrics for the cache.
cacheCfg.setStatisticsEnabled(true);

// Starting the node.
Ignition.start(cfg);
```
### 2.2.获取缓存指标
通过如下方式可以获得一个特定缓存的最新指标快照：

 - `IgniteCache.metrics()`：获取缓存所在的整个集群的指标快照；
 - `IgniteCache.metrics(ClusterGroup grp)`：获取属于给定集群组的节点的指标快照；
 - `IgniteCache.localMetrics()`：获取缓存对应的本地节点的指标快照。

```java
IgniteCache<Integer, Person> cache = ignite.getOrCreateCache("myCache");

// Get cache metrics
CacheMetrics cm = cache.metrics();

System.out.println("Avg put time: " + cm.getAveragePutTime());

System.out.println("Avg get time: " + cm.getAverageGetTime());
```
查看[CacheMetrics](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/cache/CacheMetrics.html)的javadoc，可以了解完整的可用指标列表。
### 2.3.使用JMX Bean
通过`CacheMetricsMXBean`接口也可以用于访问缓存的指标，可以通过任意兼容JMX的工具或者API接入bean。如果要在应用中处理bean，通过`IgniteCache.mxBean()`或者`IgniteCache.localMxBean()`可以获得bean的引用。

使用特定JMX Bean暴露的`CacheMetricsMXBean.enableMetrics()`方法，可以激活缓存指标收集。

查看[CacheMetricsMXBean](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/mxbean/CacheMetricsMXBean.html)的javadoc，可以了解完整的可用指标列表。

### 2.4.缓存大小计算
要了解如何计算缓存的大小，可以参阅[内存使用量计算](#_1-3-内存使用量计算)。

## 3.指标体系
## 4.系统视图
2.8版本引入了新的系统视图子系统，主要目标是使用户能够通过几个独立的可插拔的导出器查看Ignite内部实体的状态。

传统的RDBMS用户都熟悉系统视图的概念，Ignite系统视图提供了与RDBMS系统视图相同的方式。主要区别是，只要实现了相应协议的导出器，均可访问Ignite系统视图，目前是直接支持SQL和JMX。

 - JMX和SQL出口默认处于启用状态，无需显式配置；
 - SQL视图位于`SYS`模式中；
 - 导出器是在节点启动期间配置的，不能在运行时更改；
 - 如果没有明确指定，则所有系统视图的数据都是本地化的。

**实体**

 - **系统视图**：一些Ignite内部对象的命名列表；
 - **系统视图导出器**：通过某些特定协议导出系统视图的Ignite SPI实现。导出器通过`IgniteConfiguration#setSysteViewExporterSpi`配置，可以配置多个导出器。如果需要通过不直接支持的任何协议进行集成，可以创建自定义的`org.apache.ignite.spi.systemview.SystemViewExporterSpi`实现。

**导出器**

*JMX导出器*

每个系统视图都会暴露为一个含有`TabularData`的JMX Bean。

*SQL导出器*

每个系统视图都会在`SYS`模式下暴露为一个SQL系统视图。

### 4.1.CACHES
CACHES视图暴露了缓存的各种信息。

**列**

|列名|类型|描述|
|---|---|---|
|`CACHE_NAME`|String|缓存名|
|`CACHE_ID`|int|缓存ID|
|`CACHE_TYPE`|String|缓存类型|
|`CACHE_MODE`|String|缓存模式|
|`ATOMICITY_MODE`|String|原子化模式|
|`CACHE_GROUP_NAME`|String|缓存组名|
|`AFFINITY`|String|映射函数的toString表示|
|`AFFINITY_MAPPER`|String|关联映射器的toString表示|
|`BACKUPS`|int|备份数|
|`CACHE_GROUP_ID`|int|缓存组ID|
|`CACHE_LOADER_FACTORY`|String|缓存加载器工厂的toString表示|
|`CACHE_STORE_FACTORY`|String|缓存存储器工厂的toString表示|
|`CACHE_WRITER_FACTORY`|String|缓存写入器工厂的toString表示|
|`DATA_REGION_NAME`|String|数据区名|
|`DEFAULT_LOCK_TIMEOUT`|long|锁超时（毫秒）|
|`EVICTION_FILTER`|String|退出过滤器的toString表示|
|`EVICTION_POLICY_FACTORY`|String|退出策略工厂的toString表示|
|`EXPIRY_POLICY_FACTORY`|String|过期策略工厂的toString表示|
|`INTERCEPTOR`|String|拦截器的toString表示|
|`IS_COPY_ON_READ`|boolean|缓存值副本是否保存在堆内的标志|
|`IS_EAGER_TTL`|boolean|是否立即从缓存中删除过期数据的标志|
|`IS_ENCRYPTION_ENABLED`|boolean|缓存数据开启加密则为true|
|`IS_EVENTS_DISABLED`|boolean|缓存事件禁用则为true|
|`IS_INVALIDATE`|boolean|如果值在近缓存中提交时无效（为空），则为true|
|`IS_LOAD_PREVIOUS_VALUE`|boolean|如果值在缓存中不存在时应该从存储中加载，则为true|
|`IS_MANAGEMENT_ENABLED`|boolean||
|`IS_NEAR_CACHE_ENABLED`|boolean|开启近缓存则为true|
|`IS_ONHEAP_CACHE_ENABLED`|boolean|开启堆内缓存则为true|
|`IS_READ_FROM_BACKUP`|boolean|如果开启从备份读则为true|
|`IS_READ_THROUGH`|boolean|如果开启通读则为true|
|`IS_SQL_ESCAPE_ALL`|boolean|如果所有的表名和字段名都用双引号转义则为true|
|`IS_SQL_ONHEAP_CACHE_ENABLED`|boolean|如果堆内缓存SQL开启则为true，开启时，查询引擎可以访问缓存的SQL数据，当相关的缓存数据发生变更或者退出时，这些数据也会失效退出|
|`IS_STATISTICS_ENABLED`|boolean||
|`IS_STORE_KEEP_BINARY`|boolean|缓存存储实现处理二进制对象而不是Java对象的标志|
|`IS_WRITE_BEHIND_ENABLED`|boolean|缓存存储开启后写模式标志|
|`IS_WRITE_THROUGH`|boolean|如果开启通写则为true|
|`MAX_CONCURRENT_ASYNC_OPERATIONS`|int|允许的最大并发异步操作数，如果为0，则不受限制|
|`MAX_QUERY_ITERATORS_COUNT`|int|可以存储的查询迭代器的最大值，当每页数据按需发给用户端时，存储迭代器用于支持查询分页|
|`NEAR_CACHE_EVICTION_POLICY_FACTORY`|String|近缓存退出策略工厂的toString表示|
|`NEAR_CACHE_START_SIZE`|int|启动后将用于预创建内部哈希表的近缓存初始缓存大小|
|`NODE_FILTER`|String|节点过滤器NodeFilter实现的toString表示|
|`PARTITION_LOSS_POLICY`|String|分区丢失策略的toString表示|
|`QUERY_DETAIL_METRICS_SIZE`|int|用于监控目的在内存中存储的查询详细指标的大小，如果为0则不会收集历史记录|
|`QUERY_PARALLELISM`|int|单节点查询并行度的查询执行引擎提示|
|`REBALANCE_BATCH_SIZE`|int|单次再平衡消息大小（字节）|
|`REBALANCE_BATCHES_PREFETCH_COUNT`|int|再平衡开始时节点生成的批次数|
|`REBALANCE_DELAY`|long|再平衡延迟时间（毫秒）|
|`REBALANCE_MODE`|String|再平衡模式|
|`REBALANCE_ORDER`|int|再平衡顺序|
|`REBALANCE_THROTTLE`|long|为了避免CPU和网络的过载，再平衡消息之间的等待时间（毫秒）|
|`REBALANCE_TIMEOUT`|long|再平衡超时（毫米）|
|`SQL_INDEX_MAX_INLINE_SIZE`|int|索引内联大小（字节）|
|`SQL_ONHEAP_CACHE_MAX_SIZE`|int|SQL堆内缓存最大值，以行数计算，当到达最大值时最早的数据会被退出|
|`SQL_SCHEMA`|String|模式名|
|`TOPOLOGY_VALIDATOR`|String|拓扑验证器的toString表示|
|`WRITE_BEHIND_BATCH_SIZE`|int|后写缓存的缓存操作批次大小|
|`WRITE_BEHIND_COALESCING`|boolean|后写缓存存储操作的写合并标志。将具有相同键的存储操作（get或remove）组合或合并为单个操作，从而减少对底层缓存存储的压力|
|`WRITE_BEHIND_FLUSH_FREQUENCY`|long|后写缓存将数据刷新到底层存储的频率（毫秒）|
|`WRITE_BEHIND_FLUSH_SIZE`|int|后写缓存刷新数据大小，如果缓存数据量达到该值，所有的后写缓存数据都会刷新到底层存储，然后后写缓存会被清空|
|`WRITE_BEHIND_FLUSH_THREAD_COUNT`|int|执行后写缓存刷新的线程数|
|`WRITE_SYNCHRONIZATION_MODE`|String|写同步模式|

### 4.2.CACHE_GROUPS
该视图暴露了已有的缓存组的各种信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`CACHE_GROUP_NAME`|String|缓存组名|
|`CACHE_COUNT`|int|缓存组中的缓存数|
|`DATA_REGION_NAME`|String|存储缓存组中数据的数据区|
|`CACHE_MODE`|String|默认缓存模式|
|`ATOMICITY_MODE`|String|默认原子化模式|
|`AFFINITY`|String|映射函数的toString表示|
|`BACKUPS`|int|备份数|
|`CACHE_GROUP_ID`|int|缓存组ID|
|`IS_SHARED`|boolean|缓存组为共享模式则为true|
|`NODE_FILTER`|String|节点过滤器NodeFilter的toString表示|
|`PARTITION_LOSS_POLICY`|String|分区丢失策略的toString表示|
|`PARTITIONS_COUNT`|int|分区数|
|`REBALANCE_DELAY`|long|再平衡延迟时间（毫秒）|
|`REBALANCE_MODE`|String|再平衡模式|
|`REBALANCE_ORDER`|int|再平衡组顺序|
|`TOPOLOGY_VALIDATOR`|String|拓扑验证器的toString表示|

### 4.3.TASKS
TASKS视图暴露了与正在运行的计算任务有关的各种信息。

|列名|数据类型|描述|
|---|---|---|
|`AFFINITY_CACHE_NAME`|String|映射缓存名|
|`AFFINITY_PARTITION_ID`|int|映射分区ID|
|`END_TIME`|long|结束时间|
|`EXEC_NAME`|String|执行任务的线程池名|
|`INTERNAL`|boolean|如果是内部任务则为true|
|`JOB_ID`|UUID|计算作业ID|
|`START_TIME`|long|启动时间|
|`TASK_CLASS_NAME`|String|任务类名|
|`TASK_NAME`|String|任务名|
|`TASK_NODE_ID`|UUID|发起任务的节点ID|
|`USER_VERSION`|String|任务版本|

### 4.4.SERVICES
SERVICES视图暴露了已部署服务的各种信息。

|列名|数据类型|描述|
|---|---|---|
|`SERVICE_ID`|UUID|服务ID|
|`NAME`|String|服务名|
|`SERVICE_CLASS`|String|服务类名|
|`CACHE_NAME`|String|缓存名|
|`ORIGIN_NODE_ID`|UUID|发起方节点ID|
|`TOTAL_COUNT`|int|服务实例总数|
|`MAX_PER_NODE_COUNT`|int|每节点最大服务数|
|`AFFINITY_KEY`|String|服务的关联键值|
|`NODE_FILTER`|String|节点过滤器NodeFilter的toString表示|
|`STATICALLY_CONFIGURED`|boolean|服务配置为静态则为true|

### 4.5.TRANSACTIONS
TRANSACTIONS视图暴露了当前正在运行的事务的各种信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`ORIGINATING_NODE_ID`|UUID||
|`STATE`|String||
|`XID`|UUID||
|`LABEL`|String||
|`START_TIME`|long||
|`ISOLATION`|String||
|`CONCURRENCY`|String||
|`KEYS_COUNT`|int||
|`CACHE_IDS`|String||
|`COLOCATED`|boolean||
|`DHT`|boolean||
|`DURATION`|long||
|`IMPLICIT`|boolean||
|`IMPLICIT_SINGLE`|boolean||
|`INTERNAL`|boolean||
|`LOCAL`|boolean||
|`LOCAL_NODE_ID`|UUID||
|`NEAR`|boolean||
|`ONE_PHASE_COMMIT`|boolean||
|`OTHER_NODE_ID`|UUID||
|`SUBJECT_ID`|UUID||
|`SYSTEM`|boolean||
|`THREAD_ID`|long||
|`TIMEOUT`|long||
|`TOP_VER`|String||

### 4.6.NODES
NODES视图暴露了集群节点的各种信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`NODE_ID`|UUID|节点ID|
|`CONSISTENT_ID`|String|节点的唯一性ID|
|`VERSION`|String|节点的版本|
|`IS_CLIENT`|boolean|节点是否为客户端节点|
|`IS_DAEMON`|boolean|节点是否为守护节点|
|`NODE_ORDER`|long|节点在拓扑中的顺序|
|`ADDRESSES`|String|节点的地址|
|`HOSTNAMES`|String|节点的主机名|
|`IS_LOCAL`|boolean|节点是否为本地节点|

### 4.7.CLIENT_CONNECTIONS
CLIENT_CONNECTIONS视图暴露了当前正在打开的客户端连接（JDBC/ODBC/瘦客户端）的各种信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`CONNECTION_ID`|long|连接ID|
|`LOCAL_ADDRESS`|IP地址|本地节点的IP地址|
|`REMOTE_ADDRESS`|IP地址|远程节点的IP地址|
|`TYPE`|String|连接类型|
|`USER`|String|用户名|
|`VERSION`|String|协议版本|

### 4.8.STRIPED_THREADPOOL_QUEUE
STRIPED_THREADPOOL_QUEUE视图暴露了在系统平行线程池中等待执行的任务的信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`STRIPE_INDEX`|int|平行线程的索引值|
|`DESCRIPTION`|String|任务的toString表示|
|`THREAD_NAME`|String|平行线程名|
|`TASK_NAME`|String|任务类名|

### 4.9.DATASTREAM_THREADPOOL_QUEUE
DATASTREAM_THREADPOOL_QUEUE视图暴露了数据流平行线程池中的等待任务信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`STRIPE_INDEX`|int|平行线程索引值|
|`DESCRIPTION`|String|任务的toString表示|
|`THREAD_NAME`|String|平行线程名|
|`TASK_NAME`|String|任务类名|

### 4.10.SCAN_QUERIES
SCAN_QUERIES视图暴露了当前正在运行的扫描查询信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`ORIGIN_NODE_ID`|UUID|发起查询的节点ID|
|`QUERY_ID`|long|查询ID|
|`CACHE_NAME`|String|缓存名|
|`CACHE_ID`|int|缓存ID|
|`CACHE_GROUP_ID`|int|缓存组ID|
|`CACHE_GROUP_NAME`|String|缓存组名|
|`START_TIME`|long|查询开始时间|
|`DURATION`|long|查询期限|
|`CANCELED`|boolean|如果取消了则为true|
|`FILTER`|String|过滤器的toString表示|
|`KEEP_BINARY`|boolean|如果开启了keepBinary则为true|
|`LOCAL`|boolean|如果仅为本地查询则为true|
|`PAGE_SIZE`|int|页面大小|
|`PARTITION`|int|查询分区ID|
|`SUBJECT_ID`|UUID|发起查询的用户ID|
|`TASK_NAME`|String|任务名|
|`TOPOLOGY`|String|拓扑版本|
|`TRANSFORMER`|String|转换器的toString表示|

### 4.11.CONTINUOUS_QUERIES
CONTINUOUS_QUERIES视图暴露了正在运行的持续查询信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`CACHE_NAME`|String|缓存名|
|`LOCAL_LISTENER`|String|本地监听器的toString表示|
|`REMOTE_FILTER`|String|远程过滤器的toString表示|
|`REMOTE_TRANSFORMER`|String|远程转换器的toString表示|
|`LOCAL_TRANSFORMED_LISTENER`|String|本地转换监听器的toString表示|
|`LAST_SEND_TIME`|long|事件批次上次发给持续查询发起节点的时间|
|`AUTO_UNSUBSCRIBE`|boolean|当节点断开或发起节点离开时，如果持续查询应该停止，则为true|
|`BUFFER_SIZE`|int|事件批次缓冲区大小|
|`DELAYED_REGISTER`|boolean|如果在相应缓存启动时就启动持续查询，则为true|
|`INTERVAL`|long|通知间隔时间|
|`IS_EVENTS`|boolean|如果用于订阅远程事件则为true|
|`IS_MESSAGING`|boolean|如果用于订阅消息则为true|
|`IS_QUERY`|boolean|如果用户启动了持续查询则为true|
|`KEEP_BINARY`|boolean|如果开启了keepBinary则为true|
|`NODE_ID`|UUID|发起节点ID|
|`NOTIFY_EXISTING`|boolean|如果监听器应通知现有条目则为true|
|`OLD_VALUE_REQUIRED`|boolean|如果事件中应包含条目的旧值则为true|
|`ROUTINE_ID`|UUID|查询ID|
|`TOPIC`|String|查询主题名|

### 4.12.SQL_QUERIES
SQL_QUERIES视图暴露了当前正在运行的SQL查询信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`QUERY_ID`|UUID|查询ID|
|`SQL`|String|查询文本|
|`ORIGIN_NODE_ID`|UUID|发起查询的节点ID|
|`START_TIME`|date|查询开始时间|
|`DURATION`|long|查询执行期限|
|`LOCAL`|boolean|如果仅为本地查询则为true|
|`SCHEMA_NAME`|String|模式名|

### 4.13.SQL_QUERIES_HISTORY
SQL_QUERIES_HISTORY视图暴露了SQL查询的历史信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`SCHEMA_NAME`|String|模式名|
|`SQL`|String|SQL文本|
|`LOCAL`|boolean|如果仅为本地查询则为true|
|`EXECUTIONS`|long|执行次数|
|`FAILURES`|long|失败次数|
|`DURATION_MIN`|long|最短执行期限|
|`DURATION_MAX`|long|最长执行期限|
|`LAST_START_TIME`|date|上次执行时间|

### 4.14.SCHEMAS
SCHEMAS视图暴露了SQL模式的各种信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`NAME`|String|模式名|
|`PREDEFINED`|boolean|如果是预定义模式则为true|

### 4.15.TABLES
TABLES视图暴露了SQL表的各种信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`TABLE_NAME`|String|表名|
|`SCHEMA_NAME`|String|表所属模式名|
|`CACHE_NAME`|String|表对应的缓存名|
|`CACHE_ID`|int|表对应的缓存ID|
|`AFFINITY_KEY_COLUMN`|String|关联键列名|
|`KEY_ALIAS`|String|主键列别名|
|`VALUE_ALIAS`|String|值列别名|
|`KEY_TYPE_NAME`|String|主键类型名|
|`VALUE_TYPE_NAME`|String|值类型名|
|`IS_INDEX_REBUILD_IN_PROGRESS`|boolean|如果表索引正在重建过程中则为true|

### 4.16.VIEWS
VIEWS视图暴露了关于SQL视图的各种信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`NAME`|String|视图名|
|`SCHEMA`|String|模式名|
|`DESCRIPTION`|String|描述|

### 4.17.INDEXES
INDEXES视图暴露了与SQL索引有关的各种信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`INDEX_NAME`|String|索引名|
|`INDEX_TYPE`|String|索引类型|
|`COLUMNS`|String|索引中的列名|
|`SCHEMA_NAME`|String|模式名|
|`TABLE_NAME`|String|表名|
|`CACHE_NAME`|String|缓存名|
|`CACHE_ID`|int|缓存ID|
|`INLINE_SIZE`|int|内联大小（字节）|
|`IS_PK`|boolean|是否为主键索引|
|`IS_UNIQUE`|boolean|是否为唯一索引|

### 4.18.TABLE_COLUMNS
TABLE_COLUMNS视图暴露了SQL表的列信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`COLUMN_NAME`|String|列名|
|`TABLE_NAME`|String|表名|
|`SCHEMA_NAME`|String|模式名|
|`AFFINITY_COLUMN`|boolean|如果该列为关联键则为true|
|`AUTO_INCREMENT`|boolean|如果是自增字段则为true|
|`DEFAULT_VALUE`|String|默认值|
|`NULLABLE`|boolean|如果允许为空则为true|
|`PK`|boolean|如果是主键则为true|
|`PRECISION`|int|列精度|
|`SCALE`|int|列标度|
|`TYPE`|String|列类型|

### 4.19.VIEW_COLUMNS
VIEW_COLUMNS视图暴露了视图的列信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`COLUMN_NAME`|String|列名|
|`VIEW_NAME`|String|视图名|
|`SCHEMA_NAME`|String|模式名|
|`DEFAULT_VALUE`|String|默认值|
|`NULLABLE`|boolean|如果允许为空则为true|
|`PRECISION`|int|列精度|
|`SCALE`|int|列标度|
|`TYPE`|String|列类型|

### 4.20.PAGE_LISTS
页面列表是一种数据结构，用于存储部分空闲的数据页面（空闲列表）和完全空闲的已分配页面（重用列表）的列表。在保存数据时，空闲列表和重用列表用于快速找到具有足够可用空间的页面，或者在确认不存在这样的页面时分配新的页面。

页面列表以桶的形式组织，每个桶将页面分组为具有大约相同的可用空间。

如果启用了持久化，则会为每个缓存组的每个分区创建页面列表，要查看此类页面列表，可以使用`cacheGroupPageLists`系统视图（SQL视图名为`CACHE_GROUP_PAGE_LISTS`），如果禁用了持久化，则会为每个数据区创建页面列表，这时需要使用`dataRegionPageLists`系统视图（SQL视图名为`DATA_REGION_PAGE_LISTS`）。这些视图包含了每个页面列表的每个桶的信息，这些信息有助于了解在不分配新页面的情况下可以将多少数据插入到缓存中，还有助于检测页面列表利用率的偏差。

**CACHE_GROUP_PAGE_LISTS列**

|列名|数据类型|描述|
|---|---|---|
|`CACHE_GROUP_ID`|int|缓存组ID|
|`PARTITION_ID`|int|分区ID|
|`NAME`|String|页面列表名|
|`BUCKET_NUMBER`|int|桶编号|
|`BUCKET_SIZE`|long|桶中的页面数量|
|`STRIPES_COUNT`|int|桶的并行度，并行度用于避免竞争|
|`CACHED_PAGES_COUNT`|int|桶的堆内页面列表缓存中的页面数|

**DATA_REGION_PAGE_LISTS列**

|列名|数据类型|描述|
|---|---|---|
|`NAME`|String|页面列表名|
|`BUCKET_NUMBER`|int|桶编号|
|`BUCKET_SIZE`|long|桶中的页面数量|
|`STRIPES_COUNT`|int|桶的并行度，并行度用于避免竞争|
|`CACHED_PAGES_COUNT`|int|桶的堆内页面列表缓存中的页面数|

### 4.21.NODE_ATTRIBUTES
NODE_ATTRIBUTES视图暴露了集群节点的属性信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`NODE_ID`|UUID|节点ID|
|`NAME`|String|属性名|
|`VALUE`|String|属性值|

### 4.22.BASELINE_NODES
BASELINE_NODES视图暴露了当前基线拓扑中的节点信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`CONSISTENT_ID`|String|节点唯一性ID|
|`ONLINE`|boolean|节点的运行状态|

### 4.23.NODE_METRICS
NODE_METRICS视图暴露了当前基线拓扑中的节点的各种信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`NODE_ID`|UUID|节点ID|
|`LAST_UPDATE_TIME`|TIMESTAMP|指标数据上次更新的时间|
|`MAX_ACTIVE_JOBS`|INT|节点曾经的最大并发作业数|
|`CUR_ACTIVE_JOBS`|INT|节点当前正在运行的活跃作业数|
|`AVG_ACTIVE_JOBS`|FLOAT|节点并发执行的平均活跃作业数|
|`MAX_WAITING_JOBS`|INT|节点曾经的最大等待作业数|
|`CUR_WAITING_JOBS`|INT|节点当前正在等待执行的作业数|
|`AVG_WAITING_JOBS`|FLOAT|节点的平均等待作业数|
|`MAX_REJECTED_JOBS`|INT|在一次冲突解决操作期间一次性的最大拒绝作业数|
|`CUR_REJECTED_JOBS`|INT|最近一次冲突解决操作中的拒绝作业数|
|`AVG_REJECTED_JOBS`|FLOAT|在冲突解决操作期间的平均拒绝作业数|
|`TOTAL_REJECTED_JOBS`|INT|节点启动后在冲突解决期间的拒绝作业总数|
|`MAX_CANCELED_JOBS`|INT|节点的并发最大取消作业数|
|`CUR_CANCELED_JOBS`|INT|节点仍在运行的已取消作业数|
|`AVG_CANCELED_JOBS`|FLOAT|节点的并发平均取消作业数|
|`TOTAL_CANCELED_JOBS`|INT|节点启动后取消作业总数|
|`MAX_JOBS_WAIT_TIME`|TIME|节点中的作业执行前在队列中的最大等待时间|
|`CUR_JOBS_WAIT_TIME`|TIME|节点当前正在等待执行的作业的最长等待时间|
|`AVG_JOBS_WAIT_TIME`|TIME|节点中的作业执行前在队列中的平均等待时间|
|`MAX_JOBS_EXECUTE_TIME`|TIME|节点作业的最长执行时间|
|`CUR_JOBS_EXECUTE_TIME`|TIME|节点当前正在执行的作业的执行时间|
|`AVG_JOBS_EXECUTE_TIME`|TIME|节点作业的平均执行时间|
|`TOTAL_JOBS_EXECUTE_TIME`|TIME|节点启动后已经完成的作业的执行总时间|
|`TOTAL_EXECUTED_JOBS`|INT|节点启动后处理的作业总数|
|`TOTAL_EXECUTED_TASKS`|INT|节点处理过的任务总数|
|`TOTAL_BUSY_TIME`|TIME|节点处理作业花费的总时间|
|`TOTAL_IDLE_TIME`|TIME|节点的总空闲（未执行任何作业）时间|
|`CUR_IDLE_TIME`|TIME|节点执行最近的作业后的空闲时间|
|`BUSY_TIME_PERCENTAGE`|FLOAT|节点执行作业和空闲的时间占比|
|`IDLE_TIME_PERCENTAGE`|FLOAT|节点空闲和执行作业的时间占比|
|`TOTAL_CPU`|INT|JVM的可用CPU数量|
|`CUR_CPU_LOAD`|DOUBLE|在范围（0, 1）中以分数表示的CPU使用率|
|`AVG_CPU_LOAD`|DOUBLE|在范围（0, 1）中以分数表示的CPU平均使用率|
|`CUR_GC_CPU_LOAD`|DOUBLE|上次指标更新后花费在GC上的平均时间，指标默认2秒更新一次|
|`HEAP_MEMORY_INIT`|LONG|JVM最初从操作系统申请用于内存管理的堆内存量（字节）。如果初始内存大小未定义，则显示-1|
|`HEAP_MEMORY_USED`|LONG|当前用于对象分配的堆大小，堆由一个或多个内存池组成，该值为所有堆内存池中使用的堆内存总数|
|`HEAP_MEMORY_COMMITED`|LONG|JVM使用的堆内存量（字节），这个内存量保证由JVM使用，堆由一个或多个内存池组成，该值为所有堆内存池中JVM使用的堆内存总数|
|`HEAP_MEMORY_MAX`|LONG|用于内存管理的最大堆内存量（字节），如果最大内存量未指定，则显示-1|
|`HEAP_MEMORY_TOTAL`|LONG|堆内存总量（字节），如果总内存量未指定，则显示-1|
|`NONHEAP_MEMORY_INIT`|LONG|JVM最初从操作系统申请用于内存管理的非堆内存量（字节）。如果初始内存大小未定义，则显示-1|
|`NONHEAP_MEMORY_USED`|LONG|JVM当前使用的非堆内存量，非堆内存由一个或多个内存池组成，该值为所有非堆内存池中使用的非堆内存总数|
|`NONHEAP_MEMORY_COMMITED`|LONG|JVM使用的非堆内存量（字节），这个内存量保证由JVM使用。非堆内存由一个或多个内存池组成，该值为所有非堆内存池中使用的非堆内存总数|
|`NONHEAP_MEMORY_MAX`|LONG|可用于内存管理的最大非堆内存量（字节），如果最大内存量未指定，则显示-1|
|`NONHEAP_MEMORY_TOTAL`|LONG|可用于内存管理的非堆内存总量（字节），如果总内存量未指定，则显示-1|
|`UPTIME`|TIME|JVM的正常运行时间|
|`JVM_START_TIME`|TIMESTAMP|JVM的启动时间|
|`NODE_START_TIME`|TIMESTAMP|节点的启动时间|
|`LAST_DATA_VERSION`|LONG|数据网格为所有缓存操作赋予的不断增长的版本数，该值为节点的最新数据版本|
|`CUR_THREAD_COUNT`|INT|包括守护和非守护线程在内的所有有效线程总数|
|`MAX_THREAD_COUNT`|INT|JVM启动或峰值重置后的最大有效线程数|
|`TOTAL_THREAD_COUNT`|LONG|JVM启动后启动的线程总数|
|`CUR_DAEMON_THREAD_COUNT`|INT|当前的有效守护线程数|
|`SENT_MESSAGES_COUNT`|INT|节点发送的通信消息总量|
|`SENT_BYTES_COUNT`|LONG|发送的字节量|
|`RECEIVED_MESSAGES_COUNT`|INT|节点接收的通信消息总量|
|`RECEIVED_BYTES_COUNT`|LONG|接收的字节量|
|`OUTBOUND_MESSAGES_QUEUE`|INT|出站消息队列大小|
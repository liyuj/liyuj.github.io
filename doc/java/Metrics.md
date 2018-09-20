# 18.指标
## 18.1.内存指标
### 18.1.1.数据区指标
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
|`getPagesReplaceRate()`|获取内存中的页面被磁盘上的其他页面替换的速率（页/秒）。这个指标有效地表示了内存中页面退出并且被磁盘上的页面替换的速率，这个指标只有当持久化存储启用的时候才可用。|
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
### 18.1.2.Ignite原生持久化指标
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
|||
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
>**启用指标收集**
指标收集不是一个无代价的操作，会影响应用的性能，因此默认是关闭的。
如果要打开，可以使用下面的方式：
1.对于数据区可以配置`DataRegionConfiguration.setMetricsEnabled(true)`；
2.对于原生持久化可以配置`DataStorageConfiguration.setMetricsEnabled(true)`；
3.可以使用特定JMXbean暴露的`DataRegionMetricsMXBean.enableMetrics()`方法；
4.可以使用特定JMXbean暴露的`DataStorageMetricsMXBean.enableMetrics()`方法；

### 18.1.3.内存使用量计算
还可以获得与特定`CacheGroup`有关的缓存的指标，目前这些指标只能通过`CacheGroupMetricsMXBean`JMX接口访问，具体的可用指标列表，可以看[CacheGroupMetricsMXBean](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/mxbean/CacheGroupMetricsMXBean.html)的javadoc。
**单节点内存使用**
下面的示例显示如何计算*当前节点大小*，即当前节点的总体数据量（MB/GB），以及*当前缓存大小*，即缓存的数据大小（MB/GB）。

 1. 当前节点大小：`DataStorageMetricsMXBean#getTotalAllocatedSize`；
 2. 某个节点的特定缓存的当前大小：`CacheGroupMetricsMXBean#getTotalAllocatedSize`，注意，这个指标只是一个缓存组内一个缓存（默认行为）。
**集群范围内存使用**

 1. 要计算整个集群的大小，可以对所有节点的`DataStorageMetricsMXBean#getTotalAllocatedSize`进行汇总；
 2. 当前缓存的总大小为所有节点的`CacheGroupMetricsMXBean#getTotalAllocatedSize`汇总，注意，这个指标只是一个缓存组内一个缓存（默认行为）。

## 18.2.缓存指标
通过`CacheMetrics`接口，Ignite还可以监测和分布式缓存有关的统计数据。
`CacheMetrics`接口有各种指标，比如：缓存处理的put和get操作的总数，平均put和get时间，退出总数量，当前后写缓存存储缓冲区大小，以及更多。
### 18.2.1.启用缓存指标
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
### 18.2.2.获取缓存指标
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
### 18.2.3.使用JMX Bean
通过`CacheMetricsMXBean`接口也可以用于访问缓存的指标，可以通过任意兼容JMX的工具或者API接入bean。如果要在应用中处理bean，通过`IgniteCache.mxBean()`或者`IgniteCache.localMxBean()`可以获得bean的引用。
使用特定JMX Bean暴露的`CacheMetricsMXBean.enableMetrics()`方法，可以激活缓存指标收集。
查看[CacheMetricsMXBean](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/mxbean/CacheMetricsMXBean.html)的javadoc，可以了解完整的可用指标列表。
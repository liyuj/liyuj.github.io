# 生产准备
## 1.生产准备
本章涵盖了在准备将系统迁移到生产环境时的主要考虑因素。
## 2.容量规划
### 2.1.概述
对系统容量进行编制和规划是设计的一个必要组成部分。理解需要的缓存大小有助于决定需要多少物理内存、多少JVM、多少CPU和服务器。本章节会讨论有助于规划和确定一个系统所需最小硬件需求的各种技术。
### 2.2.规划内存使用量

 - 计算主数据大小：每个条目的大小(字节)乘以条目的总数量；
 - 如果需要备份，乘以备份的数量；
 - 索引也需要内存，基本的用例是增加一个30%的量；
 - 每个缓存大约增加20MB（如果显式地指定`IgniteSystemProperties.IGNITE_ATOMIC_CACHE_DELETE_HISTORY_SIZE`为比默认值小的值，这个值可以减小）；
 - 每个节点增加大约200-300MB，为内部存储以及为了JVM和GC高效运行预留的合理的量。

::: tip 注意
Ignite通常会为每个条目增加200个字节。
:::

**内存容量规划示例**

以如下的场景举例：

 - 2,000,000个对象
 - 每个对象1,024个字节（1KB）
 - 1个备份
 - 4个节点

总对象数量 x 对象大小 x 2（每个对象一主一备）
2,000,000 x 1,024 x 2 = 4,096,000,000 字节

考虑到索引：
4,096,000,000 + (4,096,000,000 x 30%) = 5,078 MB

平台大约需要的额外内存：
300 MB x 4 = 1,200 MB

总大小：
5,078 + 1,200 = 6,278 MB

因此，预期的总内存消耗将超过 ~6GB
### 2.3.规划计算使用量
如果在没有代码的情况下规划计算通常来说很难进行估计，理解应用中要执行的每个操作要花费的成本是非常重要的，然后再乘以各种情况下预期要执行的操作的数量。为此最好从Ignite的基准测试结果切入，它详细描述了标准操作的执行结果，以及提供这种性能所必要的粗略的容量需求。

在32核4.large的AWS实例上，性能测试结果如下：

  - PUT/GET: 26k/s
  - PUT (事务): 68k/s
  - PUT (事务 - 悲观): 20k/s
  - PUT (事务 - 乐观): 44k/s
  - SQL查询: 72k/s

[这里](http://www.gridgain.com/resources/benchmarks/ignite-vs-hazelcast-benchmarks)有更多的信息。
### 2.4.规划磁盘空间使用量
如果开启了原生持久化，就需要为每个节点提供足够的磁盘空间来容纳正常操作所需的数据，数据包括应用的数据转换后的Ignite内部格式，再加上比如索引、WAL文件这样的辅助数据等。

所需的总空间可以按照如下方式进行估算（针对分区缓存）：

 - 数据大小×2.5~3（总数，将根据缓存配置在节点之间分配）。如果启用了[备份](/doc/java/Key-ValueDataGrid.md#_3-3-主备副本)，那么备份分区将占用与数据总量相同的空间，所以需要将这个值乘以备份数量+1，再将得到的数目除以节点的数目，就是每个节点所需空间的近似值；
 - 每个节点的WAL大小（10个段×段大小，默认值是640MB）；
 - 每个节点的WAL存档大小（[配置值](/doc/java/Persistence.md#_2-4-WAL存档)或检查点缓冲区大小的4倍），具体可以看[预写日志](/doc/java/Persistence.md#_2-预写日志)；

下表显示如何根据可用内存计算默认最大WAL存档大小（假设没有为内存区大小、检查点缓冲区大小和WAL存档大小的值进行指定）。这些是每个节点的值：

|内存量 < 5GB|5 <= 内存量 < 40GB|内存量 > 40GB|
|---|---|---|
|4 x MIN(内存量/5, 256MB)|内存量/5|8GB|

**示例**

::: tip 注意
可以根据这个[表格](https://docs.google.com/spreadsheets/d/e/2PACX-1vS5HpEpqqf93jtfsDKSi2dj3fpKqxF-W3-6e0wQ8407hrXeoa79jdlWkZiSrKCur_9uC4-ceFsoN_tb/pub?output=xlsx)来评估如何根据配置来计算集群所需的服务器数量。
:::

### 2.5.容量规划FAQ

**DB中有300GB的数据，Ignite中会不会也是这样的？**

不是，磁盘上的数据大小不能直接1：1地映射到内存中，粗略估计，如果不计算索引和其它的负载，和磁盘比大概是2.5/3倍的关系，如果要得到精确值，可以通过将记录导入Ignite来得出对象大小的平均值，然后乘以期望的对象数量。

## 3.性能优化技巧
### 3.1.概述
Ignite内存数据网格的性能和吞吐量很大程度上依赖于使用的功能以及配置，在几乎所有的场景中都可以通过简单地调整缓存的配置来优化缓存的性能。
### 3.2.禁用内部事件通知
Ignite有丰富的事件系统来向用户通知各种各样的事件，包括缓存的修改、退出、压缩、拓扑的变化等。因为每秒钟可能产生上千的事件，它会对系统产生额外的负载，这会导致显著地性能下降。因此，强烈建议只有应用逻辑必要时才启用这些事件。事件通知默认是禁用的：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    ...
    <!-- Enable only some events and leave other ones disabled. -->
    <property name="includeEventTypes">
        <list>
            <util:constant static-field="org.apache.ignite.events.EventType.EVT_TASK_STARTED"/>
            <util:constant static-field="org.apache.ignite.events.EventType.EVT_TASK_FINISHED"/>
            <util:constant static-field="org.apache.ignite.events.EventType.EVT_TASK_FAILED"/>
        </list>
    </property>
    ...
</bean>
```
### 3.3.固化内存调优
固化内存调优以及原生持久化，请参考相关的[内存配置](/doc/java/DurableMemory.md#_3-内存配置)以及下面的[固化内存调优](#_4-固化内存调优)章节。
### 3.4.调整数据再平衡
根据具体的业务场景，为数据再平衡调整合理的[再平衡线程池](/doc/java/Key-ValueDataGrid.md#_10-3-再平衡线程池调节)和[再平衡消息](/doc/java/Key-ValueDataGrid.md#_10-4-再平衡消息节流)参数。
### 3.5.配置线程池
Ignite使用了一组线程池，它们的大小默认由`max(8, CPU总核数)`确定，这个默认值适用于大多数场景，从而减少了上下文切换以及更高效地利用CPU缓存。但是，如果因为I/O阻塞或者其它的原因，只要希望也可以增加特定线程池的大小，下面是一个如何配置线程池的例子:

XML:
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    ...
    <!-- Configure internal thread pool. -->
    <property name="publicThreadPoolSize" value="64"/>

    <!-- Configure system thread pool. -->
    <property name="systemThreadPoolSize" value="32"/>
    ...
</bean>
```
### 3.6.使用并置的计算
Ignite可以在内存内执行MapReduce计算。不过通常很多计算都会使用缓存在远程节点上的一些数据，大多数情况下从远程节点加载那些数据是很昂贵的而将计算发送到数据所在的节点就要便宜得多。最简单的实现方式就是使用`IgniteCompute.affinityRun()`方法或者`@CacheAffinityMapped`注解，也有其它的方式， 包括`Affinity.mapKeysToNodes()`方法。并置计算的概念和相关的代码示例，请参见[关联并置](/doc/java/Key-ValueDataGrid.md#_7-关联并置)章节。
### 3.7.使用数据流处理器
如果需要往缓存中加载大量的数据，可以使用`IgniteDataStreamer`来实现，数据流处理器在将数据发送到远程节点之前会将数据正确地形成批次然后会正确地控制发生在每个节点的并发操作的数量来避免颠簸。通常它会比一堆单线程的操作有十倍的性能提升。可以在[数据加载](/doc/java/DataLoadingStreaming.md#_2-数据加载)章节看到更详细的描述和样例。
### 3.8.批量处理消息
如果能发送10个比较大的作业而不是100个小些的作业，那么应该选择发送大些的作业，这会降低网络上传输作业的数量以及显著地提升性能。类似的对于缓存条目也是一样，应该尽可能使用持有键值集合的API方法，而不是一个一个地传递。
### 3.9.调整垃圾收集
请参考[调整垃圾收集](#_5-垃圾回收调优)章节的内容。
### 3.10.文件描述符
**系统级文件描述符限制**

对于大规模的服务端应用，当运行大量的线程访问网格时，可能最终在客户端和服务端节点上打开大量的文件，因此建议增加默认值到默认的最大值。

错误的文件描述符设置会影响应用的稳定性和性能，为此，需要设置`系统级文件描述符限制`和`进程级文件描述符限制`，以root用户分别按照如下步骤操作：

 - 修改/etc/sysctl.conf文件的如下行：
```
fs.file-max = 300000
```
 - 执行如下命令使改变生效：
```bash
/sbin/sysctl -p
```
验证这个设置可以用：
```bash
cat /proc/sys/fs/file-max
```
或者也可以执行下面的命令：
```bash
sysctl fs.file-max
```
**进程级文件描述符限制**

Linux操作系统默认有一个相对较少的可用文件描述符和最大用户进程（1024）设置。因此对于一个账户，将其最大打开文件描述符（打开文件数）和最大用户进程配置为适当的值非常重要。

::: tip 提示
对于打开文件描述符，一个合理的最大值是32768。
:::

使用如下命令来设置打开文件描述符的最大值和用户进程的最大值。
```bash
ulimit -n 32768 -u 32768
```
或者，也可以相应地修改如下文件：
```
/etc/security/limits.conf

- soft    nofile          32768
- hard    nofile          32768

/etc/security/limits.d/90-nproc.conf

- soft nproc 32768
```

::: tip 提示
可以参照[增加打开文件数限制](https://easyengine.io/tutorials/linux/increase-open-files-limit/)了解更多细节。
:::
## 4.固化内存调优
本章节中包括了固化内存和原生持久化的性能建议和调优参数，在[内存配置](/doc/2.6.0/java/DurableMemory.md#_3-内存配置)中已经包括了一般的配置参数。
### 4.1.一般调优
为了正确地进行固化内存的调优，本章节中包含了一般性的建议，而不管将Ignite用于纯内存模式还是开启了持久化。

**调整交换参数**

当内存的使用达到阈值时，操作系统就会开始进行从内存到磁盘的页面交换，交换会显著影响Ignite节点进程的性能，这个问题可以通过调整操作系统参数来避免。如果使用的是UNIX，最佳选项是或者降低`vm.swappiness`的值到`10`，或者如果开启了原生持久化，也可以将其配置为`0`。
```bash
sysctl –w vm.swappiness=0
```
**共享内存**

操作系统和其它的应用为了满足功能需要也需要一块内存，再加上Ignite节点本身也需要一部分Java堆空间用于应用的查询和任务的处理，因此，如果Ignite运行于纯内存模式（无持久化），那么就不能将超过90%的内存分配给固化内存。

如果开启了Ignite的原生持久化，那么操作系统为了页面缓存还需要额外的内存空间来优化到磁盘的数据同步。在这个场景中，Ignite节点的整个内存占用（固化内存+Java堆）就不能超过内存总量的70%。

比如，下面的配置显示了如何为满足固化内存的需求分配4GB的内存空间：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

<!-- Redefining maximum memory size for the cluster node usage. -->
<property name="dataStorageConfiguration">
  <bean class="org.apache.ignite.configuration.DataStorageConfiguration">
    <property name="defaultDataRegionConfiguration">
      <bean class="org.apache.ignite.configuration.DataRegionConfiguration">
        <!-- Setting the size of the default region to 4GB. -->
        <property name="maxSize" value="#{4L * 1024 * 1024 * 1024}"/>
      </bean>
    </property>
  </bean>
</property>

<!-- The rest of the parameters. -->
</bean>
```
Java：
```java
IgniteConfiguration cfg = new IgniteConfiguration();

// Changing total RAM size to be used by Ignite Node.
DataStorageConfiguration storageCfg = new DataStorageConfiguration();

// Setting the size of the default memory region to 4GB to achieve this.
storageCfg.getDefaultDataRegionConfiguration().setMaxSize(
    4L * 1024 * 1024 * 1024);

cfg.setDataStorageConfiguration(storageCfg);

// Starting the node.
Ignition.start(cfg);
```
**JVM调整**

如果使用了原生持久化，建议将`MaxDirectMemorySize`配置为`<walSegmentSize * 4 >`，对于默认的WAL配置，该值为256MB。
### 4.2.与原生持久化有关的调优
本章节包含了开启Ignite原生持久化之后的建议。

#### 4.2.1.页面大小

Ignite的页面大小（`DataStorageConfiguration.pageSize`）不要小于存储设备（SSD、闪存等）的页面大小以及操作系统缓存页面的大小。

操作系统的缓存页面大小很容易就可以通过[系统工具和参数](https://unix.stackexchange.com/questions/128213/how-is-page-size-determined-in-virtual-address-space)获取到。

存储设备比如SSD的页面大小可以在设备的说明上找到，如果厂商未提供这些信息，可以运行SSD的基准测试来算出这个数值，如果还是难以拿到这个数值，可以使用4KB作为Ignite的页面大小。很多厂商为了适应4KB的随机写工作负载不得不调整驱动，因为很多标准基准测试都是默认使用4KB，来自英特尔的[白皮书](https://www.intel.com/content/dam/www/public/us/en/documents/white-papers/ssd-server-storage-applications-paper.pdf)也确认4KB足够了。

选定最优值之后，可以将其用于集群的配置：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="dataStorageConfiguration">
    <bean class="org.apache.ignite.configuration.DataStorageConfiguration">
      <!-- Set the page size to 4 KB -->
      <property name="pageSize" value="#{4 * 1024}"/>
    </bean>
  </property>

  <!--- Additional settings ---->
</bean>
```
Java：
```java
// Ignite configuration.
IgniteConfiguration cfg = new IgniteConfiguration();

// Durable memory configuration.
DataStorageConfiguration storageCfg = new DataStorageConfiguration();

// Changing the page size to 4 KB.
storageCfg.setPageSize(4096);

// Applying the new configuration.
cfg.setDataStorageConfiguration(storageCfg);
```
#### 4.2.2.为WAL使用单独的磁盘设备

考虑为Ignite原生持久化的分区和索引文件以及WAL使用单独的磁盘设备。Ignite会主动地写入分区/索引文件以及WAL，因此，如果为每个使用单独的物理磁盘，可以将写入吞吐量增加一倍，下面的示例会显示如何实践：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
   ...
  <!-- Enabling Ignite Native Persistence. -->
  <property name="dataStorageConfiguration">
    <bean class="org.apache.ignite.configuration.DataStorageConfiguration">
      <!--
          Sets a path to the root directory where data and indexes are
          to be persisted. It's assumed the directory is on a separated SSD.
      -->
      <property name="storagePath" value="/var/lib/ignite/persistence"/>

      <!--
          Sets a path to the directory where WAL is stored.
          It's assumed the directory is on a separated HDD.
      -->
      <property name="walPath" value="/wal"/>

      <!--
          Sets a path to the directory where WAL archive is stored.
          The directory is on the same HDD as the WAL.
      -->
      <property name="walArchivePath" value="/wal/archive"/>
    </bean>
  </property>
    ...
</bean>
```
Java：
```java
IgniteConfiguration cfg = new IgniteConfiguration();

// Configuring Ignite Native Persistence.
DataStorageConfiguration storeCfg = new DataStorageConfiguration();

// Sets a path to the root directory where data and indexes are to be persisted.
// It's assumed the directory is on a separated SSD.
storeCfg.setStoragePath("/var/lib/ignite/persistence");

// Sets a path to the directory where WAL is stored.
// It's assumed the directory is on a separated HDD.
storeCfg.setWalPath("/wal");

// Sets a path to the directory where WAL archive is stored.
// The directory is on the same HDD as the WAL.
storeCfg.setWalArchivePath("/wal/archive");

// Starting the node.
Ignition.start(cfg);
```

#### 4.2.3.增加WAL段大小

WAL段的默认大小（64MB）在高负载情况下可能是低效的，因为它导致WAL在段之间频繁切换，并且切换是有点昂贵的操作（参照[预写日志](/doc/java/Persistence.md#_2-预写日志)的工作原理）。将段大小设置为较大的值（最多2GB）可能有助于减少切换操作的次数，不过这将增加预写日志的占用空间。

#### 4.2.4.调整WAL模式

考虑其它WAL模式替代默认模式。每种模式在节点故障时提供不同程度的可靠性，并且可靠性与速度成反比，即，WAL模式越可靠，则速度越慢。因此，如果具体业务不需要高可靠性，那么可以切换到可靠性较低的模式。

具体可以看[WAL模式](/doc/java/Persistence.md#_2-2-wal模式)的相关内容。

#### 4.2.5.WAL冻结
有些场景中[禁用WAL](/doc/java/Persistence.md#_2-3-wal激活和冻结)可以提高性能。

#### 4.2.6.页面写入优化

Ignite会定期地启动检查点进程，以在内存和磁盘间同步脏页面。这个进程在后台进行，对应用没有影响。

但是，如果由检查点进程调度的一个脏页面，在写入磁盘前被更新，它之前的状态会被复制进一个特定的区域，叫做检查点缓冲区。如果这个缓冲区溢出，那么在检查点处理过程中，Ignite会停止所有的更新。因此，写入性能可能降为0，如下图所示：

![](https://files.readme.io/802c00c-image.png)

当检查点处理正在进行中时，如果脏页面数达到阈值，同样的情况也会发生，这会使Ignite强制安排一个新的检查点执行，并停止所有的更新操作直到第一个检查点执行完成。

当磁盘较慢或者更新过于频繁时，这两种情况都会发生，要减少或者防止这样的性能下降，可以考虑启用页面写入优化算法。这个算法会在检查点缓冲区填充过快或者脏页面占比过高时，将更新操作的性能降低到磁盘的速度。

::: tip 页面写入优化剖析
要了解更多的信息，可以看相关专家维护的[Wiki页面](https://cwiki.apache.org/confluence/display/IGNITE/Ignite+Persistent+Store+-+under+the+hood#IgnitePersistentStore-underthehood-PagesWriteThrottling)。
:::

下面的示例显示了如何开启页面写入优化：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
   ...
  <!-- Enabling Ignite Native Persistence. -->
  <property name="dataStorageConfiguration">
    <bean class="org.apache.ignite.configuration.DataStorageConfiguration">
      <!-- Enable write throttling. -->
      <property name="writeThrottlingEnabled" value="true"/>
    </bean>
  </property>
    ...
</bean>
```
Java：
```java
IgniteConfiguration cfg = new IgniteConfiguration();

// Configuring Ignite Native Persistence.
DataStorageConfiguration storeCfg = new DataStorageConfiguration();

// Enabling the writes throttling.
storeCfg.setWriteThrottlingEnabled(true);

// Starting the node.
Ignition.start(cfg);
```
#### 4.2.7.检查点缓冲区大小

前述章节中描述的检查点缓冲区大小，是检查点处理的触发器之一。

缓冲区的默认大小是根据内存区大小计算的。

|数据区大小|默认检查点缓冲区大小|
|---|---|
|`< 1GB`|MIN (256 MB, 数据区大小)|
|`1GB ~ 8GB`|数据区大小/4|
|`> 8GB`|2GB|

默认的缓冲区大小并没有为写密集型应用进行优化，因为在大小接近标称值时，页面写入优化算法会降低写入的性能，因此在正在进行检查点处理时，可以考虑增加`DataRegionConfiguration.checkpointPageBufferSize`，并且开启写入优化来阻止性能的下降：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
   ...
  <!-- Enabling Ignite Native Persistence. -->
  <property name="dataStorageConfiguration">
    <bean class="org.apache.ignite.configuration.DataStorageConfiguration">
      <!-- Enable write throttling. -->
      <property name="writeThrottlingEnabled" value="true"/>

      <property name="defaultDataRegionConfiguration">
        <bean class="org.apache.ignite.configuration.DataRegionConfiguration">
          <!-- Enabling persistence. -->
          <property name="persistenceEnabled" value="true"/>

          <!-- Increasing the buffer size to 1 GB. -->
          <property name="checkpointPageBufferSize"
                    value="#{1024L * 1024 * 1024}"/>
        </bean>
      </property>
    </bean>
  </property>
    ...
</bean>
```
Java：
```java
IgniteConfiguration cfg = new IgniteConfiguration();

// Configuring Ignite Native Persistence.
DataStorageConfiguration storeCfg = new DataStorageConfiguration();

// Enabling the writes throttling.
storeCfg.setWriteThrottlingEnabled(true);

// Increasing the buffer size to 1 GB.
storeCfg.getDefaultDataRegionConfiguration().setCheckpointPageBufferSize(
  1024L * 1024 * 1024);

// Starting the node.
Ignition.start(cfg);
```
在上例中，默认内存区的检查点缓冲区大小配置为1GB。

::: tip 检查点处理何时触发？
当脏页面数超过`总页数*2/3`或者达到`DataRegionConfiguration.checkpointPageBufferSize`时，检查点处理就会被触发。但是如果使用了页面写入优化，`DataRegionConfiguration.checkpointPageBufferSize`就会失效，因为算法的原因，不会达到这个值。
:::

#### 4.2.8.启用直接I/O

通常当应用访问磁盘上的数据时，操作系统拿到数据后会将其写入一个文件缓冲区缓存，写操作也是同样，操作系统首先将数据写入缓存，然后才会传输到磁盘，要消除这个过程，可以打开**直接IO**，这时数据会忽略文件缓冲区缓存，直接从磁盘进行读写。

Ignite中的直接I/O插件用于检查点进程，它的作用是将内存中的脏页面写入磁盘，建议将直接IO插件用于写密集型或者混合式负载环境中。

注意，无法为WAL文件直接开启直接I/O，但是开启直接I/O可以为WAL文件带来一点好处，就是WAL数据不会在操作系统的缓冲区缓存中存储过长时间，它会在下一次页面缓存扫描中被刷新（依赖于WAL模式），然后从页面缓存中删除。

要启用直接I/O插件，需要将`ignite-direct-io-2.4.0.jar`和`jna-4.5.0.jar`加入应用的类路径，这些jar文件位于Ignite二进制包的`libs/optional/ignite-direct-io`文件夹。另外，如果运行于独立模式，可以在运行`ignite.{sh|bat}`脚本前，将`ignite-direct-io`文件夹复制到`libs`文件夹中。

要禁用直接I/O，可以将`IGNITE_DIRECT_IO_ENABLED`系统属性配置为`false`。

相关的[Wiki页面](https://cwiki.apache.org/confluence/display/IGNITE/Ignite+Persistent+Store+-+under+the+hood#IgnitePersistentStore-underthehood-DirectI/O)有更多的细节。

#### 4.2.9.购买产品级的SSD

限于[SSD的操作特性](http://codecapsule.com/2014/02/12/coding-for-ssds-part-2-architecture-of-an-ssd-and-benchmarking/)，在经历几个小时的高强度写入负载之后，Ignite原生持久化的性能可能会下降，因此需要考虑购买快速的产品级SSD来保证长时间高水平的性能。

#### 4.2.10.SSD预留空间

由于SSD[预留空间](http://www.seagate.com/ru/ru/tech-insights/ssd-over-provisioning-benefits-master-ti/)的原因，50%使用率的磁盘的随机写性能要好于90%使用率的磁盘，因此需要考虑购买高预留空间比率的SSD，然后还要确保厂商能提供工具来进行相关的调整。

::: tip Intel 3D XPoint
考虑使用3D XPoint驱动器代替常规SSD，以避免由SSD级别上的低过度供应设置和恒定垃圾收集造成的瓶颈。具体可以看[这里](http://dmagda.blogspot.com/2017/10/3d-xpoint-outperforms-ssds-verified-on.html)。
:::
## 5.垃圾回收调优
### 5.1.垃圾回收调优
下面是对应用的一套JVM配置，它会产生大量的临时对象，因此会因为垃圾收集活动而触发长时间的暂停。

集群中的JVM需要不断地进行监控和调优，GC的调优非常依赖于应用以及Ignite的使用模式。

对于JDK1.8来说，建议使用G1垃圾收集器，在下面的示例中，一台开启了G1的64核CPU的机器，配置10G的堆空间：
```bash
-server
-Xms10g
-Xmx10g
-XX:+AlwaysPreTouch
-XX:+UseG1GC
-XX:+ScavengeBeforeFullGC
-XX:+DisableExplicitGC
```
::: danger 警告
如果要使用G1垃圾收集器，建议使用最新版本的Oracle JDK8或者OpenJDK8,因为经过了不断地改进。
:::

如果G1无法满足应用场景或者使用的是JDK7，那么可以参照下面的基于CMS的配置，对于开始JVM调优是比较合适的（64核CPU的机器的10GB堆举例）：
```bash
-server
-Xms10g
-Xmx10g
-XX:+AlwaysPreTouch
-XX:+UseParNewGC
-XX:+UseConcMarkSweepGC
-XX:+CMSClassUnloadingEnabled
-XX:+CMSPermGenSweepingEnabled
-XX:+ScavengeBeforeFullGC
-XX:+CMSScavengeBeforeRemark
-XX:+DisableExplicitGC
```
::: danger 警告
请注意，这些设置可能不总是理想的，所以一定确保在生产部署之前严格测试。
:::

### 5.2.Linux对GC的侵袭
在Linux环境下，因为I/O或者内存饥饿或者其它特定内核的设定的原因，可能发生一个应用面临长时间的GC暂停的情况。本章节会给出一些指导，关于如何修改内核设定来避免因为Linux内核导致的长时间GC暂停。

::: danger 注意
下面给出的所有的Shell脚本命令都在RedHat7上做了测试，这些可能和实际的Linux发行版不同。<br>
在应用任何基于内核的设定之前，还要确保检查系统统计数据、日志，使其对于实际场景的一个问题确实有效。<br>
最后，在生产环境中针对Linux内核级做出改变，与IT部门商议也是明智的。
:::

**I/O问题**

如果GC日志显示：“low user time, low system time, long GC pause”，那么一个原因就是GC线程因为内核等待I/O而卡住了，发生的原因基本是日志提交或者因为日志滚动的gzip导致改变的文件系统刷新。

作为一个解决方案，可以增加页面刷新到磁盘的频率，从默认的30秒到5秒。
```bash
  sysctl -w vm.dirty_writeback_centisecs=500
  sysctl -w vm.dirty_expire_centisecs=500
```
**内存问题**

如果GC日志显示“low user time, high system time, long GC pause”，那么最可能的是内存的压力触发了空闲内存的交换和扫描。

 - 检查并且降低‘swappiness’的设定来保护堆和匿名内存
```bash
sysctl -w vm.swappiness=10
```
 - 启动时给JVM增加–XX:+AlwaysPreTouch参数
 - 关闭NUMA zone-reclaim优化
```bash
sysctl -w vm.zone_reclaim_mode=0
```
 - 如果使用RedHat发行版，关闭transparent_hugepage
```bash
echo never > /sys/kernel/mm/redhat_transparent_hugepage/enabled
echo never > /sys/kernel/mm/redhat_transparent_hugepage/defrag
```
**页面缓存**

当应用与底层文件系统有大量的交互时，会导致内存大量使用页面缓存的情况，如果`kswapd`进程无法跟上页面缓存使用的页面回收，在后台应用就会面临当需要新页面时的直接回收导致的高延迟，这种情况不仅影响应用的性能，也可能导致长时间的GC暂停。

要避免内存页面直接回收导致的长时间GC暂停，在Linux的最新内核版本中，可以通过`/proc/sys/vm/extra_free_kbytes`设置在`wmark_min`和`wmark_low`之间增加额外的字节来避免前述的延迟。
```bash
sysctl -w vm.extra_free_kbytes=1240000
```
要获得有关本章节讨论的话题的更多信息，可以参考这个[幻灯片](http://events.linuxfoundation.org/sites/events/files/lcjp13_moriya.pdf)。
### 5.3.调试内存使用问题和GC暂停
当需要调试和解决与内存使用或者长时间GC暂停有关的问题时，本章节包括了一些可能有助于解决这些问题的信息。

**内存溢出时获得堆Dump**

当JVM抛出`OutOfMemoryException`并且JVM进程应该重启时，需要给JVM配置增加如下的属性：
```bash
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=/path/to/heapdump
-XX:OnOutOfMemoryError=“kill -9 %p”
-XX:+ExitOnOutOfMemoryError
```
**详细的垃圾收集统计**

为了捕获有关垃圾收集的详细信息以及它的性能，可以给JVM配置增加如下的参数：
```bash
-XX:+PrintGCDetails
-XX:+PrintGCTimeStamps
-XX:+PrintGCDateStamps
-XX:+UseGCLogFileRotation
-XX:NumberOfGCLogFiles=10
-XX:GCLogFileSize=100M
-Xloggc:/path/to/gc/logs/log.txt
```
对于G1，建议设置如下的属性，它提供了很多符合人体工程学的、明确地保持-XX:+PrintGCDetails的详细信息：
```bash
-XX:+PrintAdaptiveSizePolicy
```
确保修改相应的路径和文件名，并且确保对于每个调用使用一个不同的文件名来避免从多个进程覆盖日志文件。

**FlightRecorder设置**

当需要调试性能或者内存问题，可以依靠Java的Flight Recorder工具，它可以持续地收集底层的详细的运行时信息，来启用事后的事故分析，要开启Flight Recorder，可以使用如下的设定：
```bash
-XX:+UnlockCommercialFeatures
-XX:+FlightRecorder
-XX:+UnlockDiagnosticVMOptions
-XX:+DebugNonSafepoints
```
要开始记录一个特定的Java进程，可以使用下面的命令作为一个示例：
```bash
jcmd <PID> JFR.start name=<recordcing_name> duration=60s filename=/var/recording/recording.jfr settings=profile
```
关于Java的Flight Recorder的完整信息，可以查看Oracle的官方文档。
## 6.严重错误处理
### 6.1.概述
Ignite是一个健壮且容错的系统，但在现实中，一些无法预知的问题，可能导致节点无法操作，以致影响整个集群的状态，这样的问题可以在运行时进行检测，然后根据预配置的错误处理程序进行处理。
### 6.2.严重错误
下面的错误会被视为严重：

 - 系统级严重错误（`OutOfMemoryError`）；
 - 意外的系统工作进程终止（未处理的异常）；
 - 系统工作进程被终止；
 - 集群脑裂；

系统级严重错误会导致系统无法操作，比如：

 - 文件I/O错误：通常`IOException`由文件读/写抛出，通常在开启持久化时会发生（比如磁盘空间不足或者设备故障），或者在内存模式中，Ignite会使用磁盘来存储部分元数据（比如达到了文件描述符限制或者文件访问被禁止）；
 - 内存溢出错误：[固化内存](/doc/java/DurableMemory.md)分配空间失败（`IgniteOutOfMemoryException`）；
 - 内存溢出错误：集群节点堆溢出（`OutOfMemoryError`）；

### 6.3.故障处理
Ignite检测到严重的错误后，会通过预配置的故障处理程序进行处理，配置方法如下：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="failureHandler">
        <bean class="org.apache.ignite.failure.StopNodeFailureHandler"/>
    </property>
</bean>
```
Ignite支持如下的故障处理器：

|类|描述|
|---|---|
|`NoOpFailureHandler`|忽略任何故障，用于测试和调试环境。|
|`RestartProcessFailureHandler`|只能用于`ignite.(sh|bat)`的特定实现，进程必须使用`Ignition.restart(true)`调用进行终止。|
|`StopNodeFailureHandler`|出现严重错误时，使用`Ignition.stop(true)`或者`Ignition.stop(nodeName, true)`调用停止节点。|
|`StopNodeOrHaltFailureHandler`|默认处理器，它会试图停止节点，如果无法停止，那么它会试图终止JVM进程。<br>**参数**<br>`boolean tryStop`:如果为`true`,则尝试优雅地终止节点，默认为`false`;<br>`long timeout`：超时时间，默认为0|

### 6.4.关键工作进程健康检查
Ignite内部有一些工作进程，它们对集群的正常运行非常重要。如果它们中的一个终止了，Ignite节点可能变为失效状态。

下面的系统级工作进程为关键进程：

 - 发现进程：发现事件处理；
 - TCP通信进程：节点间的点对点通信；
 - 交换进程：分区映射交换；
 - 系统级线程池进程；
 - 数据流处理器线程池进程；
 - 超时进程：超时处理；
 - 检查点线程：Ignite持久化的检查点；
 - WAL进程：预写日志、段存档和压缩；
 - 过期进程：基于TTL的过期；
 - NIO进程：基础拓扑操作；

Ignite有一个内部机制用于验证关键进程是否正常,会定期检查每个进程是否在线，并更新其心跳时间戳。如果在配置的时间段内没有监测到其中任何一个条件，该进程会被认为阻塞，然后Ignite会将该信息记录日志。失效时间由`IgniteConfiguration.systemWorkerBlockedTimeout`属性指定（毫秒，默认值等于[故障检测超时](/doc/java/Clustering.md#_6-1-14-故障检测超时)）。

关键进程停止响应的情况被认为是严重故障，但是它们默认不由配置好的故障处理程序处理。如果希望故障处理程序以处理其它严重故障的方式处理这些情况，则需要将处理程序的`ignoredFailureTypes`属性设置为空值，如下所示。空值的原因是，此类故障默认被添加到处理程序的忽略列表中，并且从忽略列表移除的唯一方法是清空列表。

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

    <property name="systemWorkerBlockedTimeout" value="#{60 * 60 * 1000}"/>

    <property name="failureHandler">
        <bean class="org.apache.ignite.failure.StopNodeFailureHandler">

          <!-- uncomment to enable this handler to
           process critical workers' hung-ups -->
          <!--property name="ignoredFailureTypes">
            <list>
            </list>
          </property-->

      </bean>

    </property>
</bean>

```
::: tip 注意
关键进程的有效性检查也可以通过`FailureHandlingMxBean`JMX MBean进行配置。
:::
## 7.一致性检查
Ignite为快速地进行调试、解决以及监控和一致性有关的问题，提供了若干工具。

比如，如果怀疑一个SQL查询返回了不完整或者错误的结果集，该命令会验证是否真的发生了数据不一致。

另外，一致性检查的命令还可以作为集群常规健康检查的一部分。

具体可以看[控制脚本](/doc/tools/ControlScript.md#_1-4-一致性检查命令)中的相关章节。
## 8.虚拟环境
Ignite可以部署于VMWare、Docker、Kubernetes等管理的虚拟和云环境，对于这些环境，建议将Ignite实例绑定到一个单一专用的主机，这样可以：

 - 避免当Ignite实例与其它应用程序争用主机资源时，导致Ignite集群的性能出现峰值；
 - 确保高可用，如果一台主机宕机并且有两个或者多个Ignite服务端节点绑定到上面，那么可能导致数据丢失。
# 固化内存
## 1.固化内存
Ignite平台是基于固化内存架构的，当开启Ignite原生持久化功能时，它可以存储和处理存储在内存和磁盘上的数据和索引，固化内存架构有助于通过利用集群的所有可用资源，使数据固化到磁盘的同时，获得内存级的性能。

![](https://files.readme.io/f9f5c61-durable-memory.png)

Ignite*固化内存*的操作方式类似于操作系统的*虚拟内存*，比如Linux，但是这两种架构的显著不同在于，当开启固化内存功能时，它会将磁盘视为数据的超集，即使重启或者故障，数据仍然会保留，而传统的虚拟内存只是将磁盘作为一个交换空间，如果进程终止数据就会丢失。
### 1.1.内存级特性
因为这种架构是以内存为中心的，所以RAM会被视为首选的存储层，所有的处理都是在内存中进行的。下面会列出这种内存架构的特性和优势：

 - **堆外内存**：所有的数据和索引都位于Java堆外，这样就可以轻易地处理集群内的PB级的数据；
 - **消除明显的由垃圾回收导致的暂停**：因为所有的数据和索引都是存储在堆外的，所以应用是有可能导致长时间暂停的唯一来源；
 - **内存使用可预测**：固化内存默认会使用尽可能多的内存和磁盘空间，但是也可以配置内存使用量来满足应用的需求；
 - **自动内存碎片整理**：Ignite会尽可能高效地使用内存，然后在后台执行碎片整理以避免碎片化；
 - **改进性能和内存使用**：不管是内存还是磁盘，所有的数据和索引都以类似的页面化格式进行存储，这样可以避免不必要的数据序列化和反序列化；

### 1.2.持久化特性
本章节会概述Ignite可用的持久化选项。

**Ignite原生持久化**

Ignite的数据持久化方面，原生持久化是最灵活、扩展性最强、最方便的方式，如果需要分布式的内存数据库，这个功能是要广泛使用的，它具有如下优势：

 - **数据弹性**：原生持久化层存储了完整的数据集，因此不会受到集群故障或者重启的影响，数据不会丢失并且保证事务强一致性；
 - **内存只缓存热数据**：在磁盘上存储数据的超集然后在内存中存储数据的子集。如果开启了Ignite的原生持久化，就不需要在内存中保存所有的数据，固化内存会在内存中保留热数据，如果空间不足，会自动地将冷数据移出内存；
 - **在整个数据集中执行SQL**：多数内存系统只会在预加载到内存的数据中进行查询，因此数据的大小受到了内存大小的限制。而Ignite SQL会跨越整个分布式的持久化数据集，通过内存缓存来优化性能；
 - **集群即时重启**：如果整个集群故障，它可以立即重启并且可用，随着开始访问数据，内存缓存会自动地预热。

**第三方持久化**

Ignite可以为已有的第三方数据库提供一个缓存层，比如RDBMS、NoSQL或者HDFS，这个模式可以对保存数据的底层数据库进行加速，Ignite将数据保存在内存中，分布到多个节点，提供了更快的数据访问速度，减少了因为应用和数据库之间频繁的数据移动导致的网络负载。

但是，和原生持久化相比，也有很多的限制，比如，SQL只会在内存中执行，因此需要事先将所有的数据预加载到内存中。

**交换空间**

如果不想使用Ignite的持久化机制，也可以使用交换，这时，如果内存不足，内存中的数据会被移动到磁盘上的交换空间。如果启用交换空间，Ignite会将数据保存在内存映射文件（MMF）中，根据内存的消耗量，操作系统会将它的内容交换到磁盘。

由于内存过载，需要更多时间来对集群进行缩放，从而对数据集进行更平均的分布，这时交换空间可以避免内存溢出错误（OOME）。

## 2.内存架构
Ignite固化内存是一个基于页面的内存架构，它会将内存拆分成固定大小的页面。这些页面会被存储于内存的*堆外受管内存区*（Java堆外）中，然后在磁盘上以特定的层次结构进行组织。

::: tip 数据格式
Ignite在内存和磁盘上维护了同样的二进制格式，这样就不需要花费在内存和磁盘之间移动数据时进行序列化的开销。
:::

下面描述的是Ignite固化内存架构的结构图：

![](https://files.readme.io/9d858ef-Durable_Memory_Diagram.png)

### 2.1.内存区
固化内存由一个或者多个堆外内存区组成，一个内存区是通过内存策略配置的逻辑可扩展区域，这个区域大小可变，退出策略以及其它的参数在下面的内存策略中会详述。

固化内存默认只会分配一个内存区，它会占用本地集群节点可用内存的20%。
### 2.2.操作型数据和历史数据
基于性能的考虑，需要尽可能地将操作型数据保持在内存中，这时需要配置多个内存区。

比如，假设有*Person*、*Purchases*和*Records*实体，它们分别存储于*PersonsCache*、*PurchasesCache*和*RecordsCache*缓存中。Person和Purchases的数据是操作型的，即这些数据会被频繁访问，而Records是访问量较少的历史数据。
假定我们只有200GB的可用内存空间，那么在这个场景中，会按照如下方式分配物理内存：

 - 对于像Persons以及Purchases这样的操作型或者频繁访问的数据，分配190GB的内存区，这样PersonsCache和PurchasesCache在整个集群中会有最大的性能；
 - 对于像RecordsCache这样的历史数据或者访问量较少的数据分配10GB的内存区，它的数据大部分会位于磁盘上。

![](https://files.readme.io/89207d9-durable-memory-regions-segments.png)

### 2.3.内存段
每个内存区都开始于初始值，然后有一个可增长的最大值。这个区域扩展至其最大值的过程中，都会被分配连续的内存段。内存区的最大值默认为系统可用物理内存的20%。

::: tip 默认最大值
如果内存区的最大值没有显式地配置（通过`org.apache.ignite.configuration.MemoryPolicyConfiguration.setMaxSize()`），那么它会使用机器可用RAM的20%。
:::

一个内存块是从操作系统获得的连续字节数组或者物理内存，这个块会被分为固定大小的页面，该块中可以驻留若干种不同类型的页面，如下图所示：

![](https://files.readme.io/65ced5a-page-memory-pages.png)

### 2.4.数据页面
数据页面存储的是从应用端插入Ignite缓存中的缓存条目（数据页面在上图中标注为绿色）。

通常，一个数据页面持有多个键-值条目，以更高效地利用内存避免内存碎片化。当新的键-值条目加入缓存时，页面内存机制会查找适合该条目的页面然后加入里面。但是，当条目的总大小达到通过`DataStorageConfiguration.setPageSize(..)`参数配置的页面大小时，该条目会占据多于一个数据页面。

::: warning 注意
如果有很多的缓存条目都不适合单个页面，那么就需要增加配置参数中的页面大小。
:::

如果在更新期间条目的大小超过了它所属的数据页面的可用空间，那么Ignite会搜索一个有足够空间容纳更新后的条目的新数据页面，然后将数据移动到那里。
### 2.5.B+树和索引页面
应用定义和使用的SQL索引是以**B+树数据结构**的形式进行维护的。对于一个SQL模式中声明的每个唯一索引，Ignite会实例化并且管理一个专用的B+树实例。

![](https://files.readme.io/e0e9141-page-memory-b-tree.png)

::: tip 哈希索引
缓存的键也会存储于B+树，它们通过哈希值进行排序。
:::

如上图所示，整个B+树的目的就是链接和排序在固化内存中分配和存储的索引页面。从内部来说，索引页面包括了定位索引值、索引指向的缓存条目在数据页面中的偏移量、还有到其它索引页面的引用（用来遍历树）等所有必要的信息，索引页面在上图中标注为紫色。

B+树的元页面需要获得特定B+树的根和它的层次，以高效地执行范围查询。比如，当执行`myCache.get(keyA)`操作时，在一个节点上它会触发下面的操作流程：

 1. Ignite会查找`myCache`属于那个内存区；
 2. 在该内存区中，会定位持有`myCache`的键的B+树的元页面；
 3. 会计算`keyA`的哈希值，然后在B+树中检索该键所属的索引页面；
 4. 如果对应的索引页面没找到，那么意味着该键值对在`myCache`中不存在，然后Ignite会返回`null`作为`myCache.get(keyA)`操作的返回值；
 5. 如果索引页面存在，那么它会包含找到缓存条目`keyA`所在的数据页面的所有必要信息；
 6. 在数据页面找到缓存条目然后返回给应用。

### 2.6.空闲列表
前述章节的执行流程描述的是当应用希望获取缓存时在页面内存中如何检索缓存的条目。下面的内容是当调用像`myCache.put(keyA,valueA)`这样的操作时，Ignite如何存储一个新的条目。

在这个场景中，固化内存依赖的是空闲列表数据结构。空闲列表是一个双向链表，它存储了到大致相当于空闲空间的内存页面的引用。比如，有一个空闲列表，它存储了所有的数据页面，它占用了最多75%的空闲空间，还有一个列表来跟踪索引页面，它占用了剩余的25%的容量，数据和索引页面是由独立的空闲列表来跟踪的。

![](https://files.readme.io/4494e51-page-memory-free-list.png)

下面是`myCache.put(keyA,valueA)`操作的执行流程：

 1. Ignite会找到`myCache`所属的内存区；
 2. 在该内存区中，会定位持有`myCache`的键的B+树的元页面；
 3. 会计算`keyA`的哈希值，然后在B+树中检索该键所属的索引页面；
 4. 如果对应的索引页面在内存或者磁盘上都没有找到，那么会从空闲列表中申请一个新的页面成功之后，它就会被加入B+树；
 5. 如果索引页面是空的（即未指向任何数据页面），根据总的缓存条目大小会从空闲列表中分配一个新的数据页面，然后在索引页面中添加到新数据页面的引用；
 6. 该缓存条目会加入该数据页面。

## 3.内存配置
Ignite节点默认会至多消耗本地可用内存的20%，大多数情况下这也是唯一需要调整的参数，要修改默认内存区大小，代码如下所示：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

<!-- Redefining maximum memory size for the cluster node usage. -->
<property name="dataStorageConfiguration">
  <bean class="org.apache.ignite.configuration.DataStorageConfiguration">
    <!-- Redefining the default region's settings -->
    <property name="defaultDataRegionConfiguration">
      <bean class="org.apache.ignite.configuration.DataRegionConfiguration">
        <property name="name" value="Default_Region"/>
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
### 3.1.主要配置参数
要修改固化内存的主要配置参数，比如页面大小，通过`IgniteConfiguration.setDataStorageConfiguration(...)`方法传递一个`org.apache.ignite.configuration.DataStorageConfiguration`即可，下面是可用的参数：

|参数|描述|默认值|
|---|---|---|
|`setPageSize(...)`|设置默认页面大小。通常只有当应用产生大量的对象无法放入单一页面时，才需要修改这个参数。|`4`KB|
|`setDefaultDataRegionConfiguration(...)`|设置自动创建的默认内存区的大小，如果该属性未设置，那么默认的区域会消耗本地主机可用内存的20%。|内存的`20%`，禁用持久化|
|`setDataRegionConfigurations(...)`|配置一个节点上配置的所有数据区的列表。|空数组，用于创建默认区域的配置是不会保存在这里的。|
|`setSystemRegionInitialSize(...)`|设置为系统需求预留的内存区域的初始大小。|`40`MB|
|`setSystemRegionMaxSize(...)`|设置为系统需求预留的内存区域的最大值。因为内部数据结构的限制，总大小不应小于10MB。|`100`MB|
|`setConcurrencyLevel(...)`|设置在Ignite的内部页面映射表中并行段的数量。|可用CPU总数。|

在Ignite的[javadoc](https://ignite.apache.org/releases/latest/javadoc/index.html)中可以看到`DataStorageConfiguration`的完整参数列表。
下面是使用`DataStorageConfiguration`如何修改页面大小和并发级别的示例代码：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="dataStorageConfiguration">
    <bean class="org.apache.ignite.configuration.DataStorageConfiguration">
      <!-- Set concurrency level -->
      <property name="concurrencyLevel" value="4"/>

      <!-- Set the page size to 8 KB -->
      <property name="pageSize" value="8192"/>
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

// Altering the concurrency level.
storageCfg.setConcurrencyLevel(4);

// Changing the page size to 8 KB.
storageCfg.setPageSize(8192);

// Applying the new configuration.
cfg.setDataStorageConfiguration(storageCfg);
```
### 3.2.内存区
固化内存默认会初始化一个单一的可扩展内存区，它会占用禁用持久化的本地主机上20%的可用内存。也可以使用`org.apache.ignite.configuration.DataRegionConfiguration`类，定义多个数据区，它们可以有不同的参数，比如区大小、持久化和退出策略。

比如，要配置一个500MB的内存区并且开启持久化，那么就需要定义一个如下所示的配置：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  <!-- Durable memory configuration. -->
  <property name="dataStorageConfiguration">
    <bean class="org.apache.ignite.configuration.DataStorageConfiguration">
      <property name="dataRegionConfigurations">
        <list>
          <!--
              Defining a data region that will consume up to 500 MB of RAM and
              will have eviction and persistence enabled.
          -->
          <bean class="org.apache.ignite.configuration.DataRegionConfiguration">
            <!-- Custom region name. -->
            <property name="name" value="500MB_Region"/>

            <!-- 100 MB initial size. -->
            <property name="initialSize" value="#{100L * 1024 * 1024}"/>

            <!-- 500 MB maximum size. -->
            <property name="maxSize" value="#{500L * 1024 * 1024}"/>

            <!-- Enabling persistence for the region. -->
            <property name="persistenceEnabled" value="true"/>
          </bean>
        </list>
      </property>
    </bean>
  </property>

  <!-- Other configurations. -->
</bean>
```
Java：
```java
// Ignite configuration.
IgniteConfiguration cfg = new IgniteConfiguration();

// Durable Memory configuration.
DataStorageConfiguration storageCfg = new DataStorageConfiguration();

// Creating a new data region.
DataRegionConfiguration regionCfg = new DataRegionConfiguration();

// Region name.
regionCfg.setName("500MB_Region");

// Setting initial RAM size.
regionCfg.setInitialSize(100L * 1024 * 1024);

// Setting maximum RAM size.
regionCfg.setMaxSize(500L * 1024 * 1024);

// Enable persistence for the region.
regionCfg.setPersistenceEnabled(true);

// Setting the data region configuration.
storageCfg.setDataRegionConfigurations(regionCfg);

// Applying the new configuration.
cfg.setDataStorageConfiguration(storageCfg);
```
下一步，要使用这个配置好的区域，使得Ignite缓存将数据存储于其中，需要将区域的名字（`500MB_Region`）传递给`org.apache.ignite.configuration.CacheConfiguration.setDataRegionName(...)`方法：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <!-- Durable Memory and other configuration parameters. -->
    <!-- ....... -->

    <property name="cacheConfiguration">
       <list>
           <!-- Cache that is mapped to a specific data region. -->
           <bean class="org.apache.ignite.configuration.CacheConfiguration">
              <!--
                   Assigning the cache to the `500MB_Region` defined earlier.
               -->
               <property name="dataRegionName" value="500MB_Region"/>

             	 <!-- Cache name. -->
               <property name="name" value="SampleCache"/>

               <!-- Additional cache configuration parameters -->
           </bean>
       </list>
    </property>

    <!-- The rest of the configuration. -->
    <!-- ....... -->
</bean>
```
Java：
```java
// Ignite configuration.
IgniteConfiguration cfg = new IgniteConfiguration();

// Durable Memory configuration and the rest of the configuration.
// ....

// Creating a cache configuration.
CacheConfiguration cacheCfg = new CacheConfiguration();

// Binding the cache to the earlier defined region.
cacheCfg.setDataRegionName("500MB_Region");

// Setting the cache name.
cacheCfg.setName("SampleCache");

// Applying the cache configuration.
cfg.setCacheConfiguration(cacheCfg);
```
用这个配置启动Ignite集群后，固化内存会分配一个初始大小为100MB的内存区，然后它可以增长到500MB。数据的超集会一直存储于磁盘上，确保即使内存空间不足也不会出现数据丢失的情况。如果开启了持久化，Ignite会自动地使最近最少使用的数据退出。这个区域只会存储`SampleCache`的所有数据，除非通过前述的方式显式地指定其它的内存区，其它的缓存都会绑定到默认的内存区。

如果**禁用**了持久化并且所有的内存使用量超过了500MB，那么会抛出内存溢出异常，要避免这个问题，可以采用如下的办法来解决：

 - 开启Ignite的持久化存储；
 - 启用一个可用的退出算法，注意，只有开启Ignite持久化存储时退出功能才会默认打开，否则这个功能是禁用的；
 - 增加内存区的最大值。

### 3.3.堆内缓存
固化内存是堆外的内存，它是在Java堆之外分配的内存区，然后将数据存储在其中。不过通过将`org.apache.ignite.configuration.CacheConfiguration.setOnheapCacheEnabled(...)`配置为`true`可以为缓存开启堆内缓存。

当以[二进制形式](/doc/java/#_10-二进制编组器)处理缓存条目或者调用缓存的反序列化时在服务端节点有大量的读操作，堆内缓存对这样的场景非常有用。比如，当一个分布式计算或者部署的服务为下一步处理从缓存中获取一些数据时，就会发生这样的情况。

::: tip 堆内缓存大小
要管理堆内缓存的大小，避免其不断增长，一定要配置[基于缓存条目的退出策略](#_4-退出策略)。
:::

## 4.退出策略
### 4.1.概述
如果关闭了Ignite的原生持久化，Ignite会在堆外内存中持有所有的缓存条目，当有新的数据注入，会进行页面的分配。如果达到了内存的限制，Ignite无法分配页面时，部分数据就必须从内存中删除以避免内存溢出，这个过程叫做*退出*，退出保证系统不会内存溢出，但是代价是内存数据丢失以及如果需要数据还需要重新加载。

Ignite在三种场景中使用退出策略：

 - 关闭原生持久化之后的堆外内存；
 - 整合第三方持久化后的堆外内存；
 - 堆内缓存；

如果开启了原生持久化，当Ignite无法分配新的页面时，会有一个叫做*页面替换*的简单过程来进行堆外内存的释放，不同点在于数据并没有丢失（因为其存储于持久化存储），页面替换由Ignite自动处理，无法进行配置，细节可以看[这里](https://cwiki.apache.org/confluence/display/IGNITE/Ignite+Durable+Memory+-+under+the+hood#IgniteDurableMemory-underthehood-Pagereplacement%28rotationwithdisk%29)。
### 4.2.堆外内存
堆外内存退出的实现方式如下：

当内存使用超过预设限制时，Ignite使用预配置的算法之一来选择最适合退出的内存页。然后将页面中的每个缓存条目从页面中删除，但是会保留被事务锁定的条目。因此，整个页面或大块页面都是空的，可以再次使用。

![](https://files.readme.io/b2e3443-Off-heap_memory_eviction.png)

堆外内存的退出默认是关闭的，这意味着内存使用量会一直增长直到达到限值。如果要开启退出，需要在配置的`DataRegionConfiguration`部分指定页面退出模式，注意堆外内存退出是[内存区](/doc/java/DurableMemory.md#_3-2-内存区)级的,如果不使用内存区，那么需要给默认的内存区显式地增加参数来配置退出。

默认情况下，当某个内存区的内存消耗量达到90%时，退出就开始了，如果希望更早或者更晚地发起退出，可以配置`DataRegionConfiguration.setEvictionThreshold(...)`参数。

Ignite支持两种页面选择算法：

 - Random-LRU
 - Random-2-LRU

两者的不同下面会说明。

#### 4.2.1.Random-LRU
要启用Random-LRU退出算法，可以将`DataPageEvictionMode.RANDOM_LRU`传递给相应的`DataRegionConfiguration`，如下所示：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  <!-- Durable memory configuration. -->
  <property name="dataStorageConfiguration">
    <bean class="org.apache.ignite.configuration.DataStorageConfiguration">
      <property name="dataRegionConfigurations">
        <list>
          <!--
              Defining a data region that will consume up to 20 GB of RAM.
          -->
          <bean class="org.apache.ignite.configuration.DataRegionConfiguration">
            <!-- Custom region name. -->
            <property name="name" value="20GB_Region"/>

            <!-- 500 MB initial size (RAM). -->
            <property name="initialSize" value="#{500L * 1024 * 1024}"/>

            <!-- 20 GB maximum size (RAM). -->
            <property name="maxSize" value="#{20L * 1024 * 1024 * 1024}"/>

            <!-- Enabling RANDOM_LRU eviction for this region.  -->
            <property name="pageEvictionMode" value="RANDOM_LRU"/>
          </bean>
        </list>
      </property>
    </bean>
  </property>

  <!-- The rest of the configuration. -->
</bean>
```
Java：
```java
// Ignite configuration.
IgniteConfiguration cfg = new IgniteConfiguration();

// Durable Memory configuration.
DataStorageConfiguration storageCfg = new DataStorageConfiguration();

// Creating a new data region.
DataRegionConfiguration regionCfg = new DataRegionConfiguration();

// Region name.
regionCfg.setName("20GB_Region");

// 500 MB initial size (RAM).
regionCfg.setInitialSize(500L * 1024 * 1024);

// 20 GB max size (RAM).
regionCfg.setMaxSize(20L * 1024 * 1024 * 1024);

// Enabling RANDOM_LRU eviction for this region.
regionCfg.setPageEvictionMode(DataPageEvictionMode.RANDOM_LRU);

// Setting the data region configuration.
storageCfg.setDataRegionConfigurations(regionCfg);

// Applying the new configuration.
cfg.setDataStorageConfiguration(storageCfg);
```
Random-LRU算法工作方式如下：

 - 当一个内存区配置了内存策略时，就会分配一个堆外数组，它会跟踪每个数据页面的`最后使用`时间戳；
 - 当数据页面被访问时，跟踪数组的时间戳就会被更新；
 - 当退出页面时，算法会从跟踪数组中随机地选择5个索引，然后退出最近的时间戳对应的页面，如果部分索引指向非数据页面（索引或者系统页面），算法会选择其它的页面。

#### 4.2.2.Random-2-LRU
Random-2-LRU退出算法是Random-LRU算法的抗扫描版，要启用这个算法，将`DataPageEvictionMode.RANDOM_2_LRU`传递给相应的`DataRegionConfiguration`即可，如下所示：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  <!-- Durable memory configuration. -->
  <property name="dataStorageConfiguration">
    <bean class="org.apache.ignite.configuration.DataStorageConfiguration">
      <property name="dataRegionConfigurations">
        <list>
          <!--
              Defining a data region that will consume up to 20 GB of RAM.
          -->
          <bean class="org.apache.ignite.configuration.DataRegionConfiguration">
            <!-- Custom region name. -->
            <property name="name" value="20GB_Region"/>

            <!-- 500 MB initial size (RAM). -->
            <property name="initialSize" value="#{500L * 1024 * 1024}"/>

            <!-- 20 GB maximum size (RAM). -->
            <property name="maxSize" value="#{20L * 1024 * 1024 * 1024}"/>

            <!-- Enabling RANDOM_2_LRU eviction for this region.  -->
            <property name="pageEvictionMode" value="RANDOM_2_LRU"/>
          </bean>
        </list>
      </property>
    </bean>
  </property>

  <!-- The rest of the configuration. -->
</bean>
```
Java:
```java
// Ignite configuration.
IgniteConfiguration cfg = new IgniteConfiguration();

// Durable Memory configuration.
DataStorageConfiguration storageCfg = new DataStorageConfiguration();

// Creating a new data region.
DataRegionConfiguration regionCfg = new DataRegionConfiguration();

// Region name.
regionCfg.setName("20GB_Region");

// 500 MB initial size (RAM).
regionCfg.setInitialSize(500L * 1024 * 1024);

// 20 GB max size (RAM).
regionCfg.setMaxSize(20L * 1024 * 1024 * 1024);

// Enabling RANDOM_2_LRU eviction for this region.
regionCfg.setPageEvictionMode(DataPageEvictionMode.RANDOM_2_LRU);

// Setting the data region configuration.
storageCfg.setDataRegionConfigurations(regionCfg);

// Applying the new configuration.
cfg.setDataStorageConfiguration(storageCfg);
```
在Random-2-LRU算法中，每个数据页面会存储两个最近访问时间戳，退出时，算法会随机地从跟踪数组中选择5个索引值，然后两个最近时间戳中的最小值会被用来和另外四个候选页面中的最小值进行比较。

Random-2-LRU比Random-LRU要好，因为它解决了`昙花一现`的问题，即一个页面很少被访问，但是偶然地被访问了一次，然后就会被退出策略保护很长时间。

::: tip Random-LRU与Random-2-LRU的对比
Random-LRU退出模式中，一个数据页面只会保存一份最近访问时间戳，而Random-2-LRU模式会为每个数据页面保存两份最近访问时间戳。
:::

### 4.3.堆内缓存
如果通过`CacheConfiguration.setOnheapCacheEnabled(...)`开启了堆内缓存，那么固化内存是可以将热数据存储于Java堆中的。开启了堆内缓存之后，就可以使用一个缓存条目退出策略来管理不断增长的堆内缓存了。

退出策略控制着一个缓存对应的堆内内存可以存储的条目的最大数量，当达到堆内缓存数量的最大值之后，条目就会从Java堆中退出。

::: tip 提示
堆内退出策略只是将缓存条目从Java堆中删除，存储在堆外内存区中的条目不受影响。
:::

部分退出策略支持批量退出。如果是受到缓存数量限制的退出，开启了批量退出之后，那么当缓存的数量比缓存最大值多出`batchSize`个条目时，退出就开始了，这时`batchSize`个条目就会被退出。如果开启了缓存大小限制的退出，那么当缓存条目的大小（字节数）大于最大值时，退出就会被触发。

::: tip 注意
只有未配置最大内存限制时，才会支持批量退出。
:::

Ignite中退出策略是可插拔的，可以通过`EvictionPolicy`接口进行控制，退出策略的实现定义了从堆内缓存选择待退出条目的算法，然后当缓存发生改变时就会收到通知。
#### 4.3.1.最近最少使用（LRU）
LRU退出策略基于最近最少使用算法，它会确保最近最少使用的数据（即最久没有被访问的数据）会被首先退出。

::: tip 注意
LRU退出策略适用于堆内缓存的大多数使用场景，不确定时可以优先使用。
:::

这个策略通过`LruEvictionPolicy`实现，通过`CacheConfiguration`进行配置，支持批量退出以及受到内存大小限制的退出。

XML：
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

    ...
</bean>
```
Java:
```java
CacheConfiguration cacheCfg = new CacheConfiguration();

cacheCfg.setName("cacheName");

// Enabling on-heap caching for this distributed cache.
cacheCfg.setOnheapCacheEnabled(true);

// Set the maximum cache size to 1 million (default is 100,000).
cacheCfg.setEvictionPolicy(new LruEvictionPolicy(1000000));

IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setCacheConfiguration(cacheCfg);

// Start Ignite node.
Ignition.start(cfg);
```
#### 4.3.2.先进先出（FIFO）
FIFO退出策略基于先进先出算法，它确保缓存中保存时间最久的数据会被首先退出，它与`LruEvictionPolicy`不同，因为它忽略了数据的访问顺序。

这个策略通过`FifoEvictionPolicy`实现，通过`CacheConfiguration`进行配置,支持批量退出以及受到内存大小限制的退出。

XML:
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

    ...
</bean>
```
Java：
```java
CacheConfiguration cacheCfg = new CacheConfiguration();

cacheCfg.setName("cacheName");

// Enabling on-heap caching for this distributed cache.
cacheCfg.setOnheapCacheEnabled(true);

// Set the maximum cache size to 1 million (default is 100,000).
cacheCfg.setEvictionPolicy(new FifoEvictionPolicy(1000000));

IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setCacheConfiguration(cacheCfg);

// Start Ignite node.
Ignition.start(cfg);
```
#### 4.3.3.有序
有序退出策略和FIFO退出策略很像，不同点在于通过默认或者用户定义的比较器定义了数据的顺序，然后确保最小的数据（即排序数值最小的数据）会被退出。

默认的比较器用缓存条目的键作为比较器，它要求键必须实现`Comparable`接口。也可以提供自定义的比较器实现，可以通过键，值或者两者都用来进行条目的比较。

这个策略通过`SortedEvictionPolicy`实现，通过`CacheConfiguration`进行配置，支持批量退出以及受到内存大小限制的退出。

XML：
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

  ...
</bean>
```
Java：
```java
CacheConfiguration cacheCfg = new CacheConfiguration();

cacheCfg.setName("cacheName");

// Enabling on-heap caching for this distributed cache.
cacheCfg.setOnheapCacheEnabled(true);

// Set the maximum cache size to 1 million (default is 100,000).
cacheCfg.setEvictionPolicy(new SortedEvictionPolicy(1000000));

IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setCacheConfiguration(cacheCfg);

// Start Ignite node.
Ignition.start(cfg);
```
## 5.过期策略
过期策略指定了在缓存条目过期之前必须经过的时间量，时间可以从创建，最后访问或者修改时间开始计算。

过期策略的工作方式依赖于环境的内存配置：

 - **内存模式**：数据仅保存在内存中，过期的条目会完全从内存中清除；
 - **内存+Ignite持久化**：过期的条目会完全从内存和磁盘上删除；
 - **内存+第三方持久化**：过期的条目仅仅从内存（Ignite）中删除，第三方存储（RDBMS、NoSQL以及其它数据库）中的数据会保持不变；
 - **内存+交换空间**：过期的条目会同时从内存和交换空间中删除。

过期策略可以通过任何预定义的`ExpiryPolicy`实现进行设置。

|类名|创建时间|最后访问时间|最后更新时间|
|---|---|---|---|
|`CreatedExpiryPolicy`|可用|||
|`AccessedExpiryPolicy`|可用|可用||
|`ModifiedExpiryPolicy`|可用||可用|
|`TouchedExpiryPolicy`|可用|可用|可用|
|`EternalExpiryPolicy`||||

也可以自定义`ExpiryPolicy`实现。

过期策略可以在`CacheConfiguration`中进行设置，这个策略可以用于缓存内的所有条目。

Java:
```java
cfg.setExpiryPolicyFactory(CreatedExpiryPolicy.factoryOf(Duration.ZERO));
```
XML:
```xml
<bean class="org.apache.ignite.configuration.CacheConfiguration">
    ...

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
也可以在对缓存进行单独操作时对过期策略进行设置或者修改。
```java
IgniteCache<Object, Object> cache = cache.withExpiryPolicy(
    new CreatedExpiryPolicy(new Duration(TimeUnit.SECONDS, 5)));
```
此策略将用于在返回的缓存实例上调用的每个操作。
### 5.1.Eager TTL（热生存时间）
过期的条目从缓存中删除，既可以马上删除，也可以通过不同的缓存操作涉及它们再删除。只要有一个缓存配置启用了Eager TTL，Ignite就会创建一个线程在后台清理过期的数据。

Eager TTL可以通过`CacheConfiguration.eagerTtl`属性启用或者禁用（默认值是`true`）。

XML:
```xml
<bean class="org.apache.ignite.configuration.CacheConfiguration">
    <property name="eagerTtl" value="true"/>
</bean>
```
## 6.内存碎片整理

::: tip 自动碎片整理
在Ignite中内存碎片整理是自动进行的，不需要人工干预。
:::

固化内存会将数据全部保存在叫做*数据页面*的特定类型页面中，这样随着时间的推移，频繁的CRUD操作，会导致每个独立的页面都可能被更新多次，这就会导致页面和整个内存的碎片化。

为了最小化内存碎片，当页面发生严重碎片化时，Ignite会进行页面的**压缩**。

压缩后的数据页面大体如下所示：

![](https://files.readme.io/1242707-defragmented.png)

页面有一个头部，保存了所有的必要信息，所有的键-值条目都是从右往左添加的，在上图的页面中有三个条目（分别为1,2,3）,这些条目大小可能不同。

保存页面中键-值条目位置的偏移量（或者引用）是从左往右保存的，并且大小是固定的，偏移量作为指针用于定位页面中的键-值条目。
中间的区域都是空闲空间，当新的数据进入集群时就会被填充进去。

下一步，假设随着时间推移条目2被删除，这就导致了页面中空闲空间的不连续。

![](https://files.readme.io/883eb56-fragmented.png)

碎片化的页面大概就是这样的。

但是，当空闲空间需要或者碎片化达到了一个阈值，压缩进程就会进行碎片整理，然后使其达到上面第一张图片的状态-即空闲空间连续。这个进程是自动的，不需要人工干预。
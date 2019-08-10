# 5.数据中心复制
## 5.1.数据中心复制
如果用户有多个数据中心，那么在一个数据中心发生故障时，有另一个数据中心能完全承载其负载和数据，这会非常有价值，GridGain的数据中心复制就旨在解决这个问题。打开数据中心复制后，GridGain内存数据库将自动确保每个数据中心始终将其数据备份到其他数据中心（可以有一个或多个）。GridGain支持**主动-主动**和**主动-被动**模式进行复制。

数据中心复制（或简称DR）是GridGain商业版的功能，可以在不同拓扑的缓存之间进行数据传输，这些拓扑可能位于不同的地理位置。每当在一个GridGain拓扑中发生缓存更新时，它就可以透明地传输到另一个拓扑。

::: warning 注意
在使用数据中心复制时，`IgniteCache.clear`操作不会影响远程数据中心。
:::
能够发送或接收缓存更新的每个不同GridGain拓扑称为数据中心。每个数据中心都有一个介于1和31之间的唯一ID，此ID会分配给拓扑中的所有GridGain节点。

下图说明了数据中心复制的简单视图。

![](https://files.readme.io/0a3cd76-dr-new.png)

GridGain中的数据中心复制（DR）可以使用`GridDr`接口进行管理，该接口可以通过`Grid.dr()`方法获得。

```java
GridDr dr = grid.dr();
```
### 5.1.1.角色
数据中心复制的过程中涉及四个角色：发送方缓存、发送方中转站、接收方中转站和接收方缓存。

 - `发送方缓存`：是特定数据节点中的缓存，其内容应该被复制。对此缓存的所有更新都将传输到发送方中转站；
 - `发送方中转站`：是从发送方缓存接收更新并将它们发送到远程集群中的接收方中转站的节点；
 - `接收方中转站`：是一个节点，它从远程发送方中转站接收更新并将它们路由到接收方缓存；
 - `接收方缓存`：是特定数据节点中的缓存，它从接收方中转站接收更新并执行更新。

发送方缓存和发送方中转站位于同一集群中，接收方缓存和接收方中转站位于同一集群中。

将哪个角色分配给哪个节点没有限制，例如，一个节点可以同时充当发送方和接收方中转站，也可以有一个缓存同时充当发送方和接收方缓存，等等。

### 5.1.2.复制过程概述
在概念层面，复制基于两个主要步骤：

 1. 在开始复制之前，必须在数据中心之间进行一次全量数据同步；
 2. 启动复制后，数据中心中的每次数据更改都将复制到远程数据中心。

第一个步骤是通过称为*全量迁移*的过程实现的，它是将整个缓存的内容发送到远程数据中心的过程。具体有两种做法，一种是为指定的缓存调用`GridDr.stateTransfer(String cacheName, byte... dataCenterIds)`方法，另一种是通过Visor GUI完成（转到`Data Replication` - `Sender`选项卡并单击`Bootstrap`）。

在以下情况下需要全量迁移：

 1. 第一次启用复制时，需要在数据中心之间同步数据（如果缓存已包含未同步的数据）；
 2. 手动暂停后恢复复制（如果缓存在暂停期间有更新）；
 3. 由于复制失败（例如发送方缓存无法将数据发送到远程数据中心），复制暂停。

第二个场景是通过发送方中转站和接收方中转站之间的交互来实现的。内容需要复制的每个缓存（发送方缓存）将更新批量发送到发送方中转站，发送方中转站将数据传输到接收方中转站（远程数据中心中的节点），接收方中转站将数据写入接收方缓存（被复制的发送方缓存）。

### 5.1.3.发送方组
GridGain从8.4.9版本开始，引入了一种配置和执行缓存复制的新方式。

在之前的方式中，缓存通过一组节点（称为发送方中转站）进行复制。每个发送方中转站都被配置用于处理一组特定的缓存，并且其配置不能动态修改，这意味着无法复制动态创建的缓存（因为发送方中转站不知道它们）。

在新方式中，缓存的数据通过预定义的节点组（发送方组）发送到远程数据中心。缓存仅“知道”组的名称，然后集群会决定使用该组中的哪些节点用于数据的复制。通过这个方式，如果动态创建缓存，则仅需指定使用哪个组来执行复制，然后集群会从该组中找到节点，并通过它们将缓存的数据传输到远程数据中心（无需重新配置发送方中转站）。

在GridGain的8.4.9及更高版本中，会默认使用新的方式。如果未在缓存配置中指定组名，则将通过默认发送方组复制缓存，它包括了配置为发送方中转站的所有节点。如果要使用旧的方式，需要设置`GridGainConfiguration.setDrUseCacheNames(true)`。

::: danger 警告
如果使用旧的发送方节点配置（为版本<8.4.9创建），但是启动的GridGain版本 >= 8.4.9并且未设置`GridGainConfiguration.setDrUseCacheNames(true)`，则该节点将抛出异常并且无法启动。
:::
如果要使用新的方式，步骤如下：

 - 定义将用于将数据发送到远程数据中心的一组或多组节点。必须将这些节点的每个节点配置为发送方中转站。注意节点可以包含在多个组中，要告诉节点它归属于一个或多个特定组中，需要配置`DrSenderConfiguration.setSenderGroups(String[])`；
 - 配置每个缓存以通过特定组发送其数据，通过`CacheDrSenderConfiguration.setSenderGroup(String)`来指定组名。

### 5.1.4.动态缓存复制
如果要复制动态创建的缓存，则需要为该缓存设置发送方组，并确认在远程集群中已经创建相应的缓存。下面会叙述此过程中涉及的步骤。

1）对于通过Java API创建的缓存，通过调用`CacheDrSenderConfiguration.setSenderGroup(String)`方法指定发送方组，如下例所示：
```java
CacheDrSenderConfiguration senderCfg = new CacheDrSenderConfiguration();

//setting the sender group name
senderCfg.setSenderGroup("cache_group_name");

GridGainCacheConfiguration cachePluginCfg = new GridGainCacheConfiguration().setDrSenderConfiguration(senderCfg);

CacheConfiguration cacheCfg = new CacheConfiguration<>().setPluginConfigurations(cachePluginCfg);
```
如果使用[CREATE TABLE](/doc/sql/SQLReference.md#_2-2-3-create-table)命令创建缓存，则指定发送方组名的唯一方法是使用预定义的缓存模板。可以使用所需的发送方组（以及其他和复制相关的属性）创建缓存模板，然后将其作为参数传递给CREATE TABLE命令，这样创建的缓存将具有指定模板的属性。有关如何使用缓存模板的更多信息和示例，请参阅[缓存模板](/doc/java/Key-ValueDataGrid.md#_3-3-5-缓存模板)文档。

2）在将接收复制数据的远程数据中心中创建类似的缓存；

3）对缓存进行操作，这时数据将被发送到远程数据中心；

4）如果在远程数据中心中创建缓存之前就开始将数据写入缓存，则必须将缓存的内容全量传输到远程数据中心。这样才能保证两个缓存具有完全相同的数据，并且发送更新不会导致任何问题。

要为新缓存执行全量迁移，需要使用以下代码段：
```java
GridGain gg = Ignition.ignite().plugin(GridGain.PLUGIN_NAME);

gg.dr().stateTransfer("new_cache_name", dataCenterIds);
```
### 5.1.5.特性
**批处理和异步**

发送方缓存中的更新不会立即发送到发送方中转站，而是分批累积的。批次太大或太旧后，会将其发送到发送方中转站。可能有多个批次计划发送到发送方中转站或等待来自它的确认。如果队列中的批次过多，则会暂停对缓存的进一步更新，直到有新批次的空间为止。这是一种避免内存不足问题的背压形式。

**过滤**

通过实现`GridDrSenderCacheEntryFilter`接口并将该对象赋给`CacheDrSenderConfiguration.setEntryFilter()`可以为缓存更新提供一个可选的缓存过滤器，没有通过过滤器的更新不会进行复制。具体请参见[发送方缓存](#_5-2-发送方缓存)的相关章节。

**故障转移**

GridGain支持各种故障转移功能，保证向所有目标数据中心的复制批量交付。

如果发送方缓存将复制批次发送到发送方中转站，但是发送方中转站在确认此批次之前故障，则发送方缓存会自动将此批次重新发送到另一个可用的发送方中转站。

缓存更新是从主节点复制的，即如果有一个带有一个备份的分区模式缓存，其中有一个键K，其中N1是主节点，N2是备份节点，则针对此键的更新将从N1复制，如果节点N1在将复制批次发送到发送方中转站之前故障，则备份节点N2会将此更新重新发送到发送方中转站。

在发送方中转站收到复制批次和批次传递到所有接收方中转站之间有一个时间窗口。待处理的批次可以选择保存在持久化中，从而在发送方中转站重启后仍然保存。具体请参见[发送方中转站](#_5-3-发送方中转站)的相关内容。

发送方中转站将复制批次发送到接收方中转站时，如果此接收方中转站在确认该批次之前发生故障，则发送方中转站会自动将该批次重新发送到同一远程数据中心中的另一个接收方中转站。

如果复制失败，例如当远程数据中心不可用或者发送方中转站由于空间不足而无法存储更新的数据时，复制过程将暂停。当故障解除时，需要手动执行全量迁移以强制数据同步，然后通过调用`GridDr.resume(String cacheName)`以继续进行复制。

**复杂拓扑**

GridGain最多支持31个参与复制的数据中心以及它们之间的任何连接。可以将数据中心A复制到其他几个数据中心，也可以将数据中心A复制到数据中心B，然后数据中心B再将这些更新转发到数据中心C，还可以让数据中心A、B和C相互复制更新等等。但是要避免此类复杂拓扑中的循环，可以对发送方中转站上的某些更新进行过滤，例如可以配置数据中心A中发生的更新不应从数据中心B复制到数据中心C，同时仍将数据中心B中发生的更新复制到数据中心C。

**数据中心复制和SSL**

在使用DR时，GridGain有两种方法用于支持集群之间的安全连接。可以通过`IgniteConfiguration.SslContextFactory()`在所有通道（发现、通信等）上启用SSL，这时DR中也会自动启用SSL。如果`SslContextFactory`未定义，或者要覆盖`SslContextFactory()`中的默认设置，则可以通过`DrSenderConfiguration.setSslContextFactory`和`DrReceiverConfiguration.setSslContextFactory`仅为DR启用SSL，这时将通过此工厂创建的安全SSL通道执行复制。

如果`DrSenderConfiguration.setSslContextFactory`和`DrReceiverConfiguration.setSslContextFactory`的参数不存在，则会判断`isUseIgniteSslContextFactory`标志，如果该标志设置为`true`（默认值）并且`IgniteConfiguration.getSslContextFactory()`存在，则将使用Ignite的SSL上下文工厂在集群之间建立安全连接。

具体请参见[SSL和TLS](/doc/java/Security.md#_4-1-ssl和tls)。

**暂停/继续**

可以手动或自动暂停特定发送方缓存的复制。当GridGain检测到由于某种原因无法复制数据时，会发生自动复制暂停，这包括以下情况：

 - 没有可用的发送方中转站；
 - 没有任何发送方中转站可以处理复制批次（例如，在持久存储已满或已损坏的情况下）。

通过DR API可以手动暂停，暂停后只能通过DR API**手动**恢复复制。

**冲突解决**

在主动-主动方案中，当同一缓存的更新发生在不同的数据中心时，来自各个数据中心的相同键的更新称为冲突。为了确保跨不同数据中心的一致冲突解决方案，用户可以自定义冲突解决程序。

**度量**

`GridDr`接口提供了对各种度量标准接口的访问，这些接口可以获取与复制相关的统计信息，例如缓存或中转站发送和接收的批次数。

例如，以下代码段可用于获得`myReplicatedCache`缓存传输到发送方中转站的批次数。

```java
GridDr dr = grid.dr();

// obtaining the number of batches sent for replication
// by the cache named 'myReplicatedCache'
int batchesSent = dr.senderCacheMetrics("myReplicatedCache").batchesSent();
```
## 5.2.发送方缓存
发送方缓存是其内容应复制到远程数据中心的缓存。

发送方缓存的所有更新首先传递给可选的过滤器，通过过滤器的更新将在主数据节点上的复制批次中累积，当批次达到其最大容量或等待时间过长时，会根据定义好的负载平衡策略，将其发送到某个发送方中转站。

::: tip 注意
使用发送方组时，将从复制此缓存的中转站组中选择发送方中转站。如果未使用发送方组，则从缓存配置中指定的中转站中选择中转站。
:::
发送方中转站之后会发送确认，如果批次接收确认成功，则该批次会被视为已处理并从发送方缓存中删除。如果确认报告发送方中转站端发生错误或发送方中转站在确认批次之前发生故障，则发送方缓存会尝试将此批次发送到另一个发送方中转站。如果所有发送方中转站都无法处理该批次，则会将其丢弃并暂停复制。

如果有太多复制批次等待从发送方中转站接收确认，则在有新的空间释放之前，会暂停进一步的缓存更新，这样可以避免内存不足问题。

发送方缓存可以有固定大小的可选备份队列。配置后备份节点将把所有缓存更新放入此队列。这样在主节点故障时，成为主节点的备份节点将重新发送累积的更新到发送方中转站，从而确保故障主节点的数据复制。

要将缓存标记为DR发送方缓存，需要定义`CacheDrSenderConfiguration`并将其提供给`GridGainCacheConfiguration.setDrSenderConfiguration()`。
::: tip 注意
对于GridGain版本<8.4.9，需要从下面的配置中删除`senderGroup`属性，具体细节请参见上面的[发送方组](#_5-1-3-发送方组)章节。
:::
XML:
```xml
<!-- Configuration of the cache that is to be replicated among two separate data centers -->
<property name="cacheConfiguration">
    <bean class="org.apache.ignite.configuration.CacheConfiguration">
        <!-- Setting up basic cache parameters -->
        <property name="name" value="crossDrCache"/>
        <property name="cacheMode" value="PARTITIONED"/>
        <property name="backups" value="1"/>

        <!-- Setting up DR related cache parameters -->
        <property name="pluginConfigurations">
            <bean class="org.gridgain.grid.configuration.GridGainCacheConfiguration">
                <!--
                    Activate cache replication.
                -->
                <property name="drSenderConfiguration">
                    <bean class="org.gridgain.grid.cache.dr.CacheDrSenderConfiguration">
                        <!-- remove this property if you use GridGain version <  8.4.9 -->
                        <property name="senderGroup" value="group1"/>
                    </bean>
                </property>

                <!-- Other parameters. -->

            </bean>
        </property>
    </bean>
</property>

```
Java:
```java
CacheConfiguration<Integer, String> cfg = new CacheConfiguration<>();

cfg.setCacheMode(CacheMode.PARTITIONED);
cfg.setName("drCache");
cfg.setAtomicityMode(CacheAtomicityMode.ATOMIC);

GridGainCacheConfiguration cacheCfg = new GridGainCacheConfiguration();

// sender cache configuration
CacheDrSenderConfiguration cacheDrSenderCfg =  new CacheDrSenderConfiguration();
// if you use version 8.4.9 or later, set the name of the sender group
cacheDrSenderCfg.setSenderGroup("group1");

cacheDrSenderCfg.setBatchSendSize(4 * 1024);

cacheCfg.setDrSenderConfiguration(cacheDrSenderCfg);

cfg.setPluginConfigurations(cacheCfg);

IgniteCache<Integer, String> cache = ignite.getOrCreateCache(cfg);
```
### 5.2.1.配置属性
`CacheDrSenderConfiguration`有如下的属性：

|Setter方法|描述|默认值|
|---|---|---|
|`setBatchSendSize(int)`|批次发送大小。一旦批次中的条目数量大于此值或批次太旧，它将被发送到发送方中转站。|2048|
|`setBatchSendFrequency(long)`|批次发送频率。一旦当前时间和批次创建时间之间的差值大于该频率或批次太大，它将被发送到发送方中转站。如果设置为零或负值，则只有在它太大的情况下才会发送批次。|2000|
|`setMaxBatches(int)`|发送方中转站待确认的最大批次量。如果批次数等于此值，则在有新的批次空间释放之前都会暂停所有进一步的缓存更新。|32|
|`setEntryFilter(GridDrSenderCacheEntryFilter)`|条目过滤器，定义后会应用于所有的缓存更新，如果缓存的更新无法通过过滤器，将不会被复制。||
|`setLoadBalancingMode( DrSenderLoadBalancingMode)`|发送方中转站负载平衡策略，决定下一个复制批次发给哪个发送方中转站。|DR_RANDOM|
|`setStateTransferThreadsCount(int)`|参与给定缓存全量迁移的后台线程数。如果有太多这样的线程，它们可能会产生过高的负载，从而消耗系统资源并减慢常规缓存更新。|2|
|`setStateTransferThrottle(long)`|全量迁移限流延迟时间，以毫秒为单位。定义全量迁移线程在提交复制批次和开始填充新批次之间的延迟时间。限流时间越长，全量迁移产生的压力越小。|0|

## 5.3.发送方中转站
发送方中转站是从发送方缓存接收批次并将其发送到远程数据中心的节点。发送方中转站会处理在配置中预定义的一组缓存。

从发送方缓存接收的批次首先放入DR存储区，之后发送方中转站会向发送方缓存发送确认，确认成功后发送方中转站会从存储中获取批次并将其发送到目标远程数据中心，如果批次存储因任何原因（例如存储已满或损坏时）失败，则发送方中转站会反馈错误的确认，从而启动发送方缓存的故障转移。每个远程数据中心必须确认数据存储在远程接收方缓存中，所有目标远程数据中心确认批次后，将从存储中删除该批次。

::: tip 注意
当节点配置为发送方中转站时，它默认还将执行常规节点的功能，例如存储缓存的数据并进行计算。如果不希望该节点存储数据，可以在缓存配置中指定节点过滤器：`CacheConfiguration.setNodeFilter(IgnitePredicate<ClusterNode> nodeFilter)`。
:::
GridGain提供了两个DR存储实现：

 - `DrSenderInMemoryStore`：内存存储，将批次存储在RAM中；
 - `DrSenderFsStore`：持久化存储，可以将批次存储在磁盘上，并可以在发送方中转站重启后仍然可用。

默认会使用内存存储。要配置持久化存储，需要使用`DrSenderConfiguration.setStore(store)`方法，具体可参见下面的示例。

要建立与远程数据中心的连接，发送方中转站首先向远程数据中心的接收方中转站发送握手信息，接收方中转站验证协议版本和编组器是否相同，然后反馈成功或者失败。如果握手成功，发送方中转站会将接收方中转站视为可用，之后会将复制批次发送给它。

除了复制批次之外，发送方中转站还会定期向接收方中转站发送心跳请求，以确保连接没有问题。如果未及时收到心跳响应，则认为连接已断开。发送方中转站会将尚未确认的所有批次重定向到另一个接收方中转站，并尝试重新建立与故障接收方中转站的连接。

如果发件方中转站配置了多个接收方中转站，则可以配置负载平衡策略以优化批次分发。有两种可用的策略，分别是随机（默认）和轮询，可以使用`DrSenderConnectionConfiguration.setLoadBalancingMode()`指定负载平衡策略。

如果要将节点配置为发送方中转站，需要定义`DrSenderConfiguration`并将其提供给`GridGainConfiguration.setDrSenderConfiguration()`。

::: danger 注意
对于GridGain版本<8.4.9，必须指定`cacheNames`属性以指示将使用该节点发送更新的缓存。具体细节请参见上面的[发送方组](#_5-1-3-发送方组)章节。
:::
XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration" id="ignite.cfg">
    <property name="pluginConfigurations">
        <list>
            <bean class="org.gridgain.grid.configuration.GridGainConfiguration">

                <!-- Unique ID of this data center -->
                <property name="dataCenterId" value="1"/>
                <!--
                        Setting up sender HUB specific parameters.
                        https://gridgain.readme.io/docs/sender-hub
                    -->
                <property name="drSenderConfiguration">
                    <bean class="org.gridgain.grid.configuration.DrSenderConfiguration">

                        <property name="senderGroups">
                            <list>
                                <value>group1</value>
                            </list>
                        </property>

                        <!-- use this property for GridGain versions prior to 8.4.9
                        The name of the cache whose data is to be replicated to the remote data center.
                        <property name="cacheNames" value="crossDrCache"/>-->

                        <!-- Sender HUB connection configuration -->
                        <property name="connectionConfiguration">
                            <bean class="org.gridgain.grid.dr.DrSenderConnectionConfiguration">

                                <!-- Remote data center ID where cache data has to be replicated -->
                                <property name="dataCenterId" value="2"/>

                                <!-- Addresses of the remote data center's receiver HUB -->
                                <property name="receiverAddresses" value="127.0.0.1:50001"/>

                                <!-- Network interface to use for cross DR communications -->
                                <property name="localOutboundAddress" value="127.0.0.1"/>
                            </bean>
                        </property>
                    </bean>
                </property>
            </bean>
        </list>
    </property>
</bean>
```
Java：
```java
GridGain gg = ignite.plugin(GridGain.PLUGIN_NAME);

// Setting the unique ID of the data center
gg.configuration().setDataCenterId(new Integer(1).byteValue());

DrSenderConfiguration drSenderCfg = new DrSenderConfiguration();

drSenderCfg.setCacheNames("drCache");

// connection configuration
DrSenderConnectionConfiguration connectionCfg = new DrSenderConnectionConfiguration();

// remote data center ID
connectionCfg.setDataCenterId(new Integer(2).byteValue());

// the addresses of the remote data center's receiver hubs
connectionCfg.setReceiverAddresses("1.1.2.99:50002", "1.1.2.100:50002");

connectionCfg.setLocalOutboundAddress("127.0.0.1");

drSenderCfg.setConnectionConfiguration(connectionCfg);

gg.configuration().setDrSenderConfiguration(drSenderCfg);

// will store batches to the file system for resilience
DrSenderStore fsStore = new DrSenderFsStore();

// setting the path where batches will be stored
// until acknowledgement is received from the receiver hub
((DrSenderFsStore) fsStore).setDirectoryPath("/disk/replication/cache/store");

drSenderCfg.setStore(new DrSenderFsStore());

```
### 5.3.1.配置参数
`DrSenderConfiguration`有如下的参数：

|Setter方法|描述|默认值|
|---|---|---|
|`setCacheNames(String...)`|发送方中转站要处理的缓存名，只有提到的缓存才会将复制批次发送到该发送方中转站||
|`setConnectionConfiguration(DrSenderConnectionConfiguration...)`|远程数据中心的配置||
|`setStore(DrSenderStore)`|在收到所有的目标远程数据中心的确认前，复制批次的存储方式。|`GridDrSenderHubInMemoryStore`|
|`setMaxFailedConnectAttempts(int)`|建立与接收方中转站连接的最大连续失败尝试次数。在超出之前，发送方中转站将尝试在发生故障后立即重建连接。超出后发送方中转站将继续尝试根据重连失败超时时间重新建立连接。|5|
|`setMaxErrors(int)`|从单个接收方中转站接收的最大连续确认错误数。超出后连接将被视为故障，发送方中转站将关闭它。下一次尝试重建连接将根据重连失败超时时间执行。|10|
|`setHealthCheckFrequency(long)`|健康检查频率，以毫秒为单位。定义发送方中转站尝试连接到断开的接收方中转站的频率以及检查在线接收方中转站是否有必要发送心跳请求的频率。|2000|
|`setSystemRequestTimeout(long)`|系统请求超时（以毫秒为单位）。定义接收方中转站必须响应握手或心跳请求的时间窗口。如果没有及时响应，则认为与此接收方中转站的连接已断开。|5000|
|`setReadTimeout(long)`|读取超时（以毫秒为单位）。如果当前时间与从接收方中转站接收到最后数据的时间之间的差值大于该超时时间，则发送方中转站将向该接收方中转站发起心跳请求。|5000|
|`setMaxQueueSize(int)`|发送方中转站并行向远程数据中心发送复制批次。此参数定义可以同时发送到特定数据中心的最大批次数。用于防止过多的内存消耗。|100|
|`setReconnectOnFailureTimeout(long)`|重连失败超时（以毫秒为单位）。定义发送方中转站应尝试重建与故障接收方中转站的连接的频率。如果连接失败尝试建立连接太多或接收到太多连续的确认错误，则认为接收方中转站故障。|5000|

### 5.3.2.连接配置参数
`DrSenderConnectionConfiguration`有如下的参数：

|Setter方法|描述|默认值|
|---|---|---|
|`setDataCenterId(byte)`|远程数据中心的ID。||
|`setLocalOutboundHost(String)`|应绑定远程接收方中转站连接的本地主机。|`GridConfiguration.getLocalHost()`|
|`setReceiverHubAddresses(String...)`|以{host}：{port}的形式收集远程数据中心中接收方中转站的地址。||
|`setLoadBalancingMode( DrReceiverLoadBalancingMode)`|接收方中转站负载均衡模式。定义发送方中转站选择将下一个复制批次发送给哪个接收接收方中转站。|DR_RANDOM|
|`setIgnoredDataCenterIds(byte...)`|被忽略的数据中心ID数组。每个复制批次都具有最初创建此批次的数据中心的ID。如果此ID位于忽略列表中，则不会将其复制到此远程数据中心。||
|`setAwaitAcknowledge(boolean)`|是否等待接收方中转站的确认。如果设置为`false`，发送方中转站将不会等待接收方中转站的确认，并且将其发送到所有目标数据中心后，就会认为批次已完全处理。|true|

## 5.4.接收方缓存
接收方缓存是接收方拓扑中的缓存，其存储复制后的数据。

在特定更新存储在缓存中之前，GridGain会确认此更新不与现有缓存值冲突。冲突由接收方缓存上配置的冲突解决模式决定，如果存在冲突，用户提供的`CacheConflictResolver`将被调用。

XML：
```xml
<property name="cacheConfiguration">
    <bean class="org.apache.ignite.configuration.CacheConfiguration">
        <!-- Setting up basic cache parameters -->
        <property name="name" value="crossDrCache"/>
        <property name="cacheMode" value="PARTITIONED"/>
        <property name="backups" value="1"/>

        <!-- Setting up DR related cache parameters -->
        <property name="pluginConfigurations">
            <bean class="org.gridgain.grid.configuration.GridGainCacheConfiguration">

               <property name="drReceiverEnabled" value="true"/>

               <!-- Specify a custom conflict resolver -->
               <property name="conflictResolver">
                    <bean class="org.mydomain.ExampleConflictResolver"/>
                </property>
            </bean>
        </property>
    </bean>
</property>

```
Java：
```java
CacheConfiguration<Integer, String> cfg = new CacheConfiguration<>();

cfg.setCacheMode(CacheMode.PARTITIONED);
cfg.setName("drCache");
cfg.setAtomicityMode(CacheAtomicityMode.ATOMIC);

GridGainCacheConfiguration cacheCfg = new GridGainCacheConfiguration();
cacheCfg.setDrReceiverEnabled(true);

cacheCfg.setConflictResolver(new CacheConflictResolver() {
	  @Override
    public void resolve(CacheConflictContext cacheConflictContext) {
        //do conflict resolution here
    }
});

cfg.setPluginConfigurations(cacheCfg);

IgniteCache<Integer, String> cache = ignite.getOrCreateCache(cfg);
```
## 5.5.接收方中转站
接收方中转站是从远程发送方中转站接收批次然后将它们写入同一拓扑（数据中心）中的接收方缓存的节点。

首先，发送方中转站通过握手请求启动与数据中心中的接收方中转站的连接。接收方中转站会确认发送方和接收方的协议版本和编组器，如果相同则接收方中转站接受握手。

然后，发送方中转站开始向接收方中转站发送批次，收到批次后接收方中转站将其写入相应的接收方缓存。完成后接收方中转站会向发送方中转站发送确认。

在内部，接收方中转站会启动TCP服务器，它能接受来自发送方中转站的连接，此服务器的各种属性是可以配置的。

要将一个节点标记为接收方中转站，需要定义`DrReceiverConfiguration`并将其提供给`GridGainConfiguration.setDrReceiverConfiguration()`。

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration" id="ignite.cfg">
    <!--  DR specific settings -->
    <property name="pluginConfigurations">
        <list>
            <bean class="org.gridgain.grid.configuration.GridGainConfiguration">
                <!-- Unique ID of this data center -->
                <property name="dataCenterId" value="2"/>
                <!--
                    Setting up receiver HUB specific parameters.
                -->
                <property name="drReceiverConfiguration">
                    <bean class="org.gridgain.grid.configuration.DrReceiverConfiguration">
                        <!-- Address the receiver HUB of this data center is bound to. -->
                        <property name="localInboundHost" value="127.0.0.1"/>

                        <!-- TCP port receiver HUB of this data center is bound to. -->
                        <property name="localInboundPort" value="50001"/>
                    </bean>
                </property>
            </bean>
        </list>
    </property>
</bean>
```
Java：
```java
GridGain gg = ignite.plugin(GridGain.PLUGIN_NAME);

DrReceiverConfiguration drReceiverCfg = new DrReceiverConfiguration();

drReceiverCfg.setLocalInboundHost("127.0.0.1");
drReceiverCfg.setLocalInboundPort(50001);

gg.configuration().setDrReceiverConfiguration(drReceiverCfg);

```
### 5.5.1.配置参数
`DrReceiverConfiguration`有如下的参数：

|Setter方法|描述|默认值|
|---|---|---|
|`setLocalInboundHost(String)`|接收方中转站的连接监听器绑定的本地主机|`GridConfiguration.getLocalHost()`|
|`setLocalInboundPort(int)`|接收方中转站的连接监听器绑定的本地主机端口|49000|
|`setSelectorCount(int)`|TCP服务器中的选择器线程数|min(4,CPU核心数)|
|`setWorkerThreads(int)`|负责处理发送方中转站发送的批次的线程数|4 * CPU核心数|
|`setMessageQueueLimit(int)`|TCP服务器中传入和传出消息的消息队列限值|1024|
|`setTcpNodelay(boolean)`|TCP服务器中的TCP_NODELAY标志|true|
|`setDirectBuffer(boolean)`|TCP服务器中的直接缓冲标志|true|
|`setIdleTimeout(long)`|TCP服务器连接的空闲超时（以毫秒为单位）|60000|
|`setWriteTimeout(long)`|写入TCP服务器连接的超时（以毫秒为单位）|6000|
|`setFlushFrequency(long)`|数据刷新频率，以毫秒为单位。定义接收方中转站将从发送方中转站接收的批次刷新到接收方缓存的频率|2000|
|`setPerNodeBufferSize(int)`|每个节点的数据缓冲区大小。当排队等待特定接收方缓存数据节点的缓存条目数超过此限制时，挂起的数据将刷新到该数据节点|1024|
|`setPerNodeParallelLoadOperations(int)`|每节点并行加载操作数。定义可以在单个接收方缓存数据节点上同时执行多少数据刷新操作。|16|
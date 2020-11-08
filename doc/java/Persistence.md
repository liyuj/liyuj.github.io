# 配置持久化
## 1.Ignite持久化
### 1.1.概述
Ignite持久化，或者说原生持久化，是旨在提供持久化存储的一组功能。启用后，Ignite会将所有数据存储在磁盘上，并将尽可能多的数据加载到内存中进行处理。例如，如果有100个条目，而内存仅能存储20个，则所有100个都存储在磁盘上，而内存中仅缓存20个，以获得更好的性能。

如果关闭原生持久化并且不使用任何外部存储时，Ignite就是一个纯内存存储。

启用持久化后，每个服务端节点只会存储整个数据的一个子集，即只包含分配给该节点的分区（如果启用了备份，也包括[备份分区](/doc/java/DataModeling.md#_2-3-备份分区)）。

原生持久化基于以下特性：

 - 在磁盘上存储数据分区；
 - 预写日志；
 - 检查点；
 - 操作系统交换的使用。

启用持久化后，Ignite会将每个分区存储在磁盘上的单独文件中，分区文件的数据格式与保存在内存中的数据格式相同。如果启用了分区备份，则也会保存在磁盘上，除了数据分区，Ignite还存储索引和元数据。

![](https://ignite.apache.org/docs/2.9.0/images/persistent_store_structure.png)

可以在[配置](#_1-6-配置属性)中修改数据文件的默认位置。
### 1.2.启用持久化存储
原生持久化是配置在[数据区](/doc/java/ConfiguringMemory.md#_2-配置数据区)上的。要启用持久化存储，需要在数据区配置中将`persistenceEnabled`属性设置为`true`，可以同时有纯内存数据区和持久化数据区。

以下是如何为默认数据区启用持久化存储的示例：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="dataStorageConfiguration">
        <bean class="org.apache.ignite.configuration.DataStorageConfiguration">
            <property name="defaultDataRegionConfiguration">
                <bean class="org.apache.ignite.configuration.DataRegionConfiguration">
                    <property name="persistenceEnabled" value="true"/>
                </bean>
            </property>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

//data storage configuration
DataStorageConfiguration storageCfg = new DataStorageConfiguration();

storageCfg.getDefaultDataRegionConfiguration().setPersistenceEnabled(true);


cfg.setDataStorageConfiguration(storageCfg);

Ignite ignite = Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    DataStorageConfiguration = new DataStorageConfiguration
    {
        DefaultDataRegionConfiguration = new DataRegionConfiguration
        {
            Name = "Default_Region",
            PersistenceEnabled = true
        }
    }
};

Ignition.Start(cfg);
```
</Tab>
</Tabs>

### 1.3.配置持久化存储目录
启用持久化之后，节点就会在`{IGNITE_WORK_DIR}/db`目录中存储用户的数据、索引和WAL文件，该目录称为存储目录。通过配置`DataStorageConfiguration`的`storagePath`属性可以修改存储目录。

每个节点都会在存储目录下维护一个子目录树，来存储缓存数据、WAL文件和WAL存档文件。

|子目录名|描述|
|---|---|
|`{WORK_DIR}/db/{nodeId}`|该目录中包括了缓存的数据和索引|
|`{WORK_DIR}/db/wal/{nodeId}`|该目录中包括了WAL文件|
|`{WORK_DIR}/db/wal/archive/{nodeId}`|该目录中包括了WAL存档文件|

这里的`nodeId`要么是节点的唯一性ID（如果在节点配置中定义）要么是[自动生成的节点ID](https://cwiki.apache.org/confluence/display/IGNITE/Ignite+Persistent+Store+-+under+the+hood#IgnitePersistentStore-underthehood-SubfoldersGeneration)，它用于确保节点目录的唯一性。如果多个节点共享同一工作目录，则它们将使用不同的子目录。

如果工作目录包含多个节点的持久化文件（存在多个具有不同`nodeId`的`{nodeId}`子目录），则该节点将选择第一个未使用的子目录。为了确保节点即使重启也始终使用特定的子目录，即指定数据分区，需要在节点配置中将`IgniteConfiguration.setConsistentId`设置为集群范围内的唯一值。

修改存储目录的代码如下所示：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="dataStorageConfiguration">
        <bean class="org.apache.ignite.configuration.DataStorageConfiguration">
            <property name="defaultDataRegionConfiguration">
                <bean class="org.apache.ignite.configuration.DataRegionConfiguration">
                    <property name="persistenceEnabled" value="true"/>
                </bean>
            </property>
            <property name="storagePath" value="/opt/storage"/>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

//data storage configuration
DataStorageConfiguration storageCfg = new DataStorageConfiguration();

storageCfg.getDefaultDataRegionConfiguration().setPersistenceEnabled(true);

storageCfg.setStoragePath("/opt/storage");

cfg.setDataStorageConfiguration(storageCfg);

Ignite ignite = Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    DataStorageConfiguration = new DataStorageConfiguration
    {
        StoragePath = "/ssd/storage",

        DefaultDataRegionConfiguration = new DataRegionConfiguration
        {
            Name = "Default_Region",
            PersistenceEnabled = true
        }
    }
};

Ignition.Start(cfg);
```
</Tab>
</Tabs>

还可以将WAL和WAL存档路径指向存储目录之外的目录。详细信息后面章节会介绍。
### 1.4.预写日志
预写日志是节点上发生的所有数据修改操作（包括删除）的日志。在内存中更新页面时，更新不会直接写入分区文件，而是会附加到WAL的末尾。

预写日志的目的是为单个节点或整个集群的故障提供一个恢复机制。如果发生故障或重启，则可以依靠WAL的内容将集群恢复到最近成功提交的事务。

WAL由几个文件（称为活动段）和一个存档组成。活动段按顺序填充，然后循环覆盖。第一个段写满后，其内容将复制到WAL存档中（请参见下面的[WAL存档](#_1-4-2-wal存档)章节）。在复制第一段时，第二段会被视为激活的WAL文件，并接受来自应用端的所有更新，活动段默认有10个。
#### 1.4.1.WAL模式
WAL模式有几种，每种模式对性能的影响方式不同，并提供不同的一致性保证：

|WAL模式|描述|一致性保证|
|---|---|---|
|`FSYNC`|保证每个原子写或者事务性提交都会持久化到磁盘。|数据更新不会丢失，不管是任何的操作系统或者进程故障，甚至是电源故障。|
|`LOG_ONLY`|默认模式，对于每个原子写或者事务性提交，保证会刷新到操作系统的缓冲区缓存或者内存映射文件。默认会使用内存映射文件方式，并且可以通过将`IGNITE_WAL_MMAP`系统属性配置为`false`将其关闭。|如果仅仅是进程崩溃数据更新会保留。|
|`BACKGROUND`|如果打开了`IGNITE_WAL_MMAP`属性（默认），该模式的行为类似于`LOG_ONLY`模式，如果关闭了内存映射文件方式，变更会保持在节点的内部缓冲区，缓冲区刷新到磁盘的频率由`walFlushFrequency`参数定义。|如果打开了`IGNITE_WAL_MMAP`属性（默认），该模式提供了与`LOG_ONLY`模式一样的保证，否则如果进程故障或者其它的故障发生时，最近的数据更新可能丢失。|
|`NONE`|WAL被禁用，只有在节点优雅地关闭时，变更才会正常持久化，使用`Ignite#active(false)`可以冻结集群然后停止节点。|可能出现数据丢失，如果节点在更新操作期间突然终止，则磁盘上存储的数据很可能出现不同步或损坏。|

#### 1.4.2.WAL存档
WAL存档用于保存故障后恢复节点所需的WAL段。存档中保存的段的数量应确保所有段的总大小不超过WAL存档的既定大小。

WAL存档的最大大小（在磁盘上占用的总空间）定义为[检查点缓冲区大小](#_7-7-调整检查点缓冲区大小)的4倍，可以在[配置](#_1-6-配置属性)中更改该值。
::: warning 警告
将WAL存档大小配置为小于默认值可能影响性能，用于生产之前需要进行测试。
:::
#### 1.4.3.修改WAL段大小
在高负载情况下，默认的WAL段大小（64MB）可能效率不高，因为它会导致WAL过于频繁地在段之间切换，并且切换/轮转是一项昂贵的操作。更大的WAL段大小有助于提高高负载下的性能，但代价是增加WAL文件和WAL归档文件的总大小。

可以在数据存储配置中更改WAL段文件的大小，该值必须介于512KB和2GB之间。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration" id="ignite.cfg">

    <property name="dataStorageConfiguration">
        <bean class="org.apache.ignite.configuration.DataStorageConfiguration">

            <!-- set the size of wal segments to 128MB -->
            <property name="walSegmentSize" value="#{128 * 1024 * 1024}"/>

            <property name="defaultDataRegionConfiguration">
                <bean class="org.apache.ignite.configuration.DataRegionConfiguration">
                    <property name="persistenceEnabled" value="true"/>
                </bean>
            </property>

        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();
DataStorageConfiguration storageCfg = new DataStorageConfiguration();
storageCfg.getDefaultDataRegionConfiguration().setPersistenceEnabled(true);

storageCfg.setWalSegmentSize(128 * 1024 * 1024);

cfg.setDataStorageConfiguration(storageCfg);

Ignite ignite = Ignition.start(cfg);
```
</Tab>
</Tabs>

#### 1.4.4.禁用WAL
在某些情况下，禁用WAL以获得更好的性能是合理的做法。例如，在初始数据加载期间禁用WAL并在预加载完成后启用WAL就是个好的做法。

<Tabs>
<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();
DataStorageConfiguration storageCfg = new DataStorageConfiguration();
storageCfg.getDefaultDataRegionConfiguration().setPersistenceEnabled(true);

cfg.setDataStorageConfiguration(storageCfg);

Ignite ignite = Ignition.start(cfg);

ignite.cluster().state(ClusterState.ACTIVE);

String cacheName = "myCache";

ignite.getOrCreateCache(cacheName);

ignite.cluster().disableWal(cacheName);

//load data
ignite.cluster().enableWal(cacheName);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cacheName = "myCache";
var ignite = Ignition.Start();
ignite.GetCluster().DisableWal(cacheName);

//load data

ignite.GetCluster().EnableWal(cacheName);
```
</Tab>

<Tab title="SQL">

```sql
ALTER TABLE Person NOLOGGING

//...

ALTER TABLE Person LOGGING
```
</Tab>
</Tabs>

::: danger 警告
如果禁用WAL并重启节点，则将从该节点上的持久化存储中删除所有数据。之所以这样实现，是因为如果没有WAL，则无法保证节点故障或重启时的数据一致性。
:::
#### 1.4.5.WAL存档压缩
可以启用WAL存档压缩以减少WAL存档占用的空间。WAL存档默认包含最后20个检查点的段（此数字是可配置的）。启用压缩后，则将所有1个检查点之前的已存档段压缩为ZIP格式，如果需要这些段（例如在节点之间再平衡数据），则会将其解压缩为原始格式。

关于如何启用WAL存档压缩，请参见下面的[配置属性](#_1-6-配置属性)章节。
#### 1.4.6.WAL记录压缩
如[设计文档](https://cwiki.apache.org/confluence/display/IGNITE/Ignite+Persistent+Store+-+under+the+hood#IgnitePersistentStore-underthehood-WAL)中所述，在确认用户操作之前，代表数据更新的物理和逻辑记录已写入WAL文件，Ignite可以先将WAL记录压缩到内存中，然后再写入磁盘以节省空间。

WAL记录压缩要求引入`ignite-compress`模块，具体请参见[启用模块](/doc/java/SettingUp.md#_2-7-启用模块)。

WAL记录压缩默认是禁用的，如果要启用，需要在数据存储配置中设置压缩算法和压缩级别：
```java
IgniteConfiguration cfg = new IgniteConfiguration();

DataStorageConfiguration dsCfg = new DataStorageConfiguration();
dsCfg.getDefaultDataRegionConfiguration().setPersistenceEnabled(true);

//WAL page compression parameters
dsCfg.setWalPageCompression(DiskPageCompression.LZ4);
dsCfg.setWalPageCompressionLevel(8);

cfg.setDataStorageConfiguration(dsCfg);
Ignite ignite = Ignition.start(cfg);
```
[DiskPageCompression](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/configuration/DiskPageCompression.html)中列出了支持的压缩算法。
#### 1.4.7.禁用WAL存档
有时可能想要禁用WAL存档，比如减少与将WAL段复制到存档文件有关的开销，当Ignite将数据写入WAL段的速度快于将段复制到存档文件的速度时，这样做就有用，因为这样会导致I/O瓶颈，从而冻结节点的操作，如果遇到了这样的问题，就可以尝试关闭WAL存档。

通过将WAL路径和WAL存档路径配置为同一个值，可以关闭存档。这时Ignite就不会将段复制到存档文件，而是只是在WAL文件夹中创建新的段。根据WAL存档大小设置，旧段将随着WAL的增长而删除。
### 1.5.检查点
**检查点**是一个将脏页面从内存复制到磁盘上的分区文件的过程，脏页面是指页面已经在内存中进行了更新但是还没有写入对应的分区文件（只是添加到了WAL中）。

创建检查点后，所有更改都将保存到磁盘，并且在节点故障并重启后将生效。

检查点和预写日志旨在确保数据的持久化和节点故障时的恢复能力。

![](https://ignite.apache.org/docs/2.9.0/images/checkpointing-persistence.png)

这个过程通过在磁盘上保持页面的最新状态而节省更多的磁盘空间，检查点完成后，就可以在WAL存档中删除检查点执行前创建的WAL段。

具体请参见相关的文档：

 - [检查点操作监控](/doc/java/Monitoring.md#_4-2-4-检查点操作监控)；
 - [调整检查点缓冲区大小](#_7-7-调整检查点缓冲区大小)。

### 1.6.配置属性
下表列出了`DataStorageConfiguration`的主要参数：

|属性名|描述|默认值|
|---|---|---|
|`persistenceEnabled`|将该属性配置为`true`可以开启原生持久化。|`false`|
|`storagePath`|数据存储路径。|`${IGNITE_HOME}/work/db/node{IDX}-{UUID}`|
|`walPath`|WAL活动段存储路径。|`${IGNITE_HOME}/work/db/wal/`|
|`walArchivePath`|WAL存档路径。|`${IGNITE_HOME}/work/db/wal/archive/`|
|`walCompactionEnabled`|将该属性配置为`true`可以开启[WAL存档压缩](#_1-4-5-wal存档压缩)。|`false`|
|`walSegmentSize`|WAL段文件大小（字节）。|`64MB`|
|`walMode`|[预写日志模式](#_1-4-1-wal模式)。|`LOG_ONLY`|
|`walCompactionLevel`|WAL压缩级别，`1`表示速度最快，`9`表示最高的压缩率。|`1`|
|`maxWalArchiveSize`|WAL存档占用空间最大值（字节）。|[检查点缓冲区大小](#_7-7-调整检查点缓冲区大小)的4倍|

## 2.外部存储
### 2.1.概述
Ignite可以做为已有数据库之上的一个缓存层，包括RDBMS或者NoSQL数据库，比如Apache Cassandra或者MongoDB等，该场景通过内存计算来对底层数据库进行加速。

Ignite可以与Apache Cassandra直接集成，但是暂时还不支持其他NoSQL数据库，但是开发自己的[CacheStore接口实现](#_4-实现自定义cachestore)。

使用外部存储的两个主要场景是：
 
 - 作为已有数据库的缓存层，这时可以通过将数据加载到内存来优化处理速度，还可以为不支持SQL的数据库带来SQL支持能力（数据全部加载到内存）；
 - 希望将数据持久化到外部数据库（而不是单一的[原生持久化](#_1-ignite持久化)）。

![](https://ignite.apache.org/docs/2.9.0/images/external_storage.png)

`CacheStore`接口同时扩展了`javax.cache.integration.CacheLoader`和`javax.cache.integration.CacheWriter`，相对应的分别用于*通读*和*通写*。也可以单独实现每个接口，然后在缓存配置中单独配置。

::: tip 提示
除了键-值操作，Ignite的通写也支持SQL的INSERT、UPDATE和MERGE，但是SELECT查询语句不会从外部数据库通读数据。
:::
#### 2.1.1.通读和通写
通读是指如果缓存中不存在，则从底层持久化存储中读取数据。注意这仅适用于通过键-值API进行的`get`操作，`SELECT`查询不会从外部数据库查询数据。要执行`SELECT`查询，必须通过调用`loadCache()`方法将数据从数据库预加载到缓存中。

通写是指数据在缓存中更新后会自动持久化。所有的通读和通写操作都参与缓存事务，然后作为整体提交或回滚。
#### 2.1.2.后写缓存
在一个简单的通写模式中每个缓存的`put`和`remove`操作都会涉及一个持久化存储的请求，因此整个缓存更新的持续时间可能是相对比较长的。另外，密集的缓存更新频率也会导致非常高的存储负载。

对于这种情况，可以启用*后写*模式，它会以异步的方式执行更新操作。这个方式的主要概念是累积更新操作然后作为一个批量异步刷入持久化存储。数据的刷新可以基于时间的事件（数据条目驻留在队列中的时间是有限的）来触发，也可以基于队列大小的事件（如果队列大小达到限值，会被刷新）触发，或者两者（先发生者优先）。

::: tip 性能和一致性
启用后写缓存可以通过异步更新来提高性能，但这可能会导致一致性下降，因为某些更新可能由于节点故障或崩溃而丢失。
:::

对于后写的方式只有数据的最后一次更新会被写入底层存储。如果键为`key1`的缓存数据分别被依次更新为值`value1`、`value2`和`value3`，那么只有`(key1,value3)`对这一个存储请求会被传播到持久化存储。

::: tip 更新性能
批量的存储操作通常比按顺序的单一操作更有效率，因此可以通过开启后写模式的批量操作来利用这个特性。简单类型（`put`和`remove`）的简单顺序更新操作可以被组合成一个批量操作。比如，连续地往缓存中写入`(key1,value1)`、`(key2,value2)`、`(key3,value3)`可以通过一个单一的`CacheStore.putAll(...)`操作批量处理。
:::
### 2.2.RDBMS集成
要将RDBMS作为底层存储，可以使用下面的`CacheStore`实现之一：

 - `CacheJdbcPojoStore`：使用反射将对象存储为一组字段，如果在现有数据库之上添加Ignite并希望使用底层表中的部分字段或所有字段，请使用此实现；
 - `CacheJdbcBlobStore`：将对象以Blob格式存储在底层数据库中，当将外部数据库作为持久化存储并希望以简单格式存储数据时，可以用此实现。

下面是`CacheStore`两种实现的配置示例：

#### 2.2.1.CacheJdbcPojoStore
使用`CacheJdbcPojoStore`，可以将对象存储为一组字段，并可以配置表列和对象字段之间的映射。

 1. 将`CacheConfiguration.cacheStoreFactory`属性设置为`org.apache.ignite.cache.store.jdbc.CacheJdbcPojoStoreFactory`并提供以下属性：

    - `dataSourceBean`：数据库连接凭据：URL、用户、密码；
    - `dialect`：实现与数据库兼容的SQL方言的类。Ignite为MySQL、Oracle、H2、SQLServer和DB2数据库提供了现成的实现。这些方言位于`org.apache.ignite.cache.store.jdbc.dialect`包中；
    - `types`：此属性用于定义数据库表和相应的POJO之间的映射（请参见下面的POJO配置示例）。

 2. （可选）如果要在缓存上执行SQL查询，请配置[查询实体](/doc/java/WorkingwithSQL.md#_4-1-2-查询实体)。

以下示例演示了如何在MySQL表之上配置Ignite缓存。该映射到`Person`类对象的表有2列：`id（INTEGER）`和`name（VARCHAR）`。

可以通过XML或Java代码配置`CacheJdbcPojoStore`。

<Tabs>
<Tab title="XML">

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!--
  Licensed to the Apache Software Foundation (ASF) under one or more
  contributor license agreements.  See the NOTICE file distributed with
  this work for additional information regarding copyright ownership.
  The ASF licenses this file to You under the Apache License, Version 2.0
  (the "License"); you may not use this file except in compliance with
  the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:util="http://www.springframework.org/schema/util" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="         http://www.springframework.org/schema/beans              http://www.springframework.org/schema/beans/spring-beans.xsd              http://www.springframework.org/schema/util              http://www.springframework.org/schema/util/spring-util.xsd">
    <!-- Data source bean -->
    <bean class="com.mysql.cj.jdbc.MysqlDataSource" id="mysqlDataSource">
        <property name="URL" value="jdbc:mysql://[host]:[port]/[database]"/>
        <property name="user" value="YOUR_USER_NAME"/>
        <property name="password" value="YOUR_PASSWORD"/>
    </bean>
    <!-- Ignite Configuration -->
    <bean class="org.apache.ignite.configuration.IgniteConfiguration">
        <property name="cacheConfiguration">
            <list>
                <!-- Configuration for PersonCache -->
                <bean class="org.apache.ignite.configuration.CacheConfiguration">
                    <property name="name" value="PersonCache"/>
                    <property name="cacheMode" value="PARTITIONED"/>
                    <property name="atomicityMode" value="ATOMIC"/>
                    <property name="cacheStoreFactory">
                        <bean class="org.apache.ignite.cache.store.jdbc.CacheJdbcPojoStoreFactory">
                            <property name="dataSourceBean" value="mysqlDataSource"/>
                            <property name="dialect">
                                <bean class="org.apache.ignite.cache.store.jdbc.dialect.MySQLDialect"/>
                            </property>
                            <property name="types">
                                <list>
                                    <bean class="org.apache.ignite.cache.store.jdbc.JdbcType">
                                        <property name="cacheName" value="PersonCache"/>
                                        <property name="keyType" value="java.lang.Integer"/>
                                        <property name="valueType" value="org.apache.ignite.snippets.Person"/>
                                        <!--Specify the schema if applicable -->
                                        <!--property name="databaseSchema" value="MY_DB_SCHEMA"/-->
                                        <property name="databaseTable" value="PERSON"/>
                                        <property name="keyFields">
                                            <list>
                                                <bean class="org.apache.ignite.cache.store.jdbc.JdbcTypeField">
                                                    <constructor-arg>
                                                        <util:constant static-field="java.sql.Types.INTEGER"/>
                                                    </constructor-arg>
                                                    <constructor-arg value="id"/>
                                                    <constructor-arg value="int"/>
                                                    <constructor-arg value="id"/>
                                                </bean>
                                            </list>
                                        </property>
                                        <property name="valueFields">
                                            <list>
                                                <bean class="org.apache.ignite.cache.store.jdbc.JdbcTypeField">
                                                    <constructor-arg>
                                                        <util:constant static-field="java.sql.Types.INTEGER"/>
                                                    </constructor-arg>
                                                    <constructor-arg value="id"/>
                                                    <constructor-arg value="int"/>
                                                    <constructor-arg value="id"/>
                                                </bean>
                                                <bean class="org.apache.ignite.cache.store.jdbc.JdbcTypeField">
                                                    <constructor-arg>
                                                        <util:constant static-field="java.sql.Types.VARCHAR"/>
                                                    </constructor-arg>
                                                    <constructor-arg value="name"/>
                                                    <constructor-arg value="java.lang.String"/>
                                                    <constructor-arg value="name"/>
                                                </bean>
                                            </list>
                                        </property>
                                    </bean>
                                </list>
                            </property>
                        </bean>
                    </property>
                    <property name="readThrough" value="true"/>
                    <property name="writeThrough" value="true"/>
                    <!-- Configure query entities if you want to use SQL queries -->
                    <property name="queryEntities">
                        <list>
                            <bean class="org.apache.ignite.cache.QueryEntity">
                                <property name="keyType" value="java.lang.Integer"/>
                                <property name="valueType" value="org.apache.ignite.snippets.Person"/>
                                <property name="keyFieldName" value="id"/>
                                <property name="keyFields">
                                    <list>
                                        <value>id</value>
                                    </list>
                                </property>
                                <property name="fields">
                                    <map>
                                        <entry key="name" value="java.lang.String"/>
                                        <entry key="id" value="java.lang.Integer"/>
                                    </map>
                                </property>
                            </bean>
                        </list>
                    </property>
                </bean>
                <!-- Provide similar configurations for other caches/tables -->
            </list>
        </property>
    </bean>
</beans>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration igniteCfg = new IgniteConfiguration();

CacheConfiguration<Integer, Person> personCacheCfg = new CacheConfiguration<>();

personCacheCfg.setName("PersonCache");
personCacheCfg.setCacheMode(CacheMode.PARTITIONED);
personCacheCfg.setAtomicityMode(CacheAtomicityMode.ATOMIC);

personCacheCfg.setReadThrough(true);
personCacheCfg.setWriteThrough(true);

CacheJdbcPojoStoreFactory<Integer, Person> factory = new CacheJdbcPojoStoreFactory<>();
factory.setDialect(new MySQLDialect());
factory.setDataSourceFactory((Factory<DataSource>)() -> {
    MysqlDataSource mysqlDataSrc = new MysqlDataSource();
    mysqlDataSrc.setURL("jdbc:mysql://[host]:[port]/[database]");
    mysqlDataSrc.setUser("YOUR_USER_NAME");
    mysqlDataSrc.setPassword("YOUR_PASSWORD");
    return mysqlDataSrc;
});

JdbcType personType = new JdbcType();
personType.setCacheName("PersonCache");
personType.setKeyType(Integer.class);
personType.setValueType(Person.class);
// Specify the schema if applicable
// personType.setDatabaseSchema("MY_DB_SCHEMA");
personType.setDatabaseTable("PERSON");

personType.setKeyFields(new JdbcTypeField(java.sql.Types.INTEGER, "id", Integer.class, "id"));

personType.setValueFields(new JdbcTypeField(java.sql.Types.INTEGER, "id", Integer.class, "id"));
personType.setValueFields(new JdbcTypeField(java.sql.Types.VARCHAR, "name", String.class, "name"));

factory.setTypes(personType);

personCacheCfg.setCacheStoreFactory(factory);

QueryEntity qryEntity = new QueryEntity();

qryEntity.setKeyType(Integer.class.getName());
qryEntity.setValueType(Person.class.getName());
qryEntity.setKeyFieldName("id");

Set<String> keyFields = new HashSet<>();
keyFields.add("id");
qryEntity.setKeyFields(keyFields);

LinkedHashMap<String, String> fields = new LinkedHashMap<>();
fields.put("id", "java.lang.Integer");
fields.put("name", "java.lang.String");

qryEntity.setFields(fields);

personCacheCfg.setQueryEntities(Collections.singletonList(qryEntity));

igniteCfg.setCacheConfiguration(personCacheCfg);
```
</Tab>
</Tabs>

Person类：
```java
class Person implements Serializable {
    private static final long serialVersionUID = 0L;

    private int id;

    private String name;

    public Person() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
}
```
#### 2.2.2.CacheJdbcBlobStore
`CacheJdbcBlobStore`将对象以Blob格式存储于底层数据库中，它会创建一张表名为`ENTRIES`，有名为`key`和`val`的列（类型都为`binary`）。

可以通过提供自定义的建表语句和DML语句，分别用于加载、更新、删除数据来修改默认的定义，具体请参见[CacheJdbcBlobStore](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/cache/store/jdbc/CacheJdbcBlobStore.html)的javadoc。

在下面的示例中，Person类的对象存储于单一列的字节数组中。

<Tabs>
<Tab title="XML">

```xml
<bean id="mysqlDataSource" class="com.mysql.jdbc.jdbc2.optional.MysqlDataSource">
  <property name="URL" value="jdbc:mysql://[host]:[port]/[database]"/>
  <property name="user" value="YOUR_USER_NAME"/>
  <property name="password" value="YOUR_PASSWORD"/>
</bean>

<bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
   <property name="cacheConfiguration">
     <list>
       <bean class="org.apache.ignite.configuration.CacheConfiguration">
           <property name="name" value="PersonCache"/>
           <property name="cacheStoreFactory">
             <bean class="org.apache.ignite.cache.store.jdbc.CacheJdbcBlobStoreFactory">
               <property name="dataSourceBean" value = "mysqlDataSource" />
             </bean>
           </property>
       </bean>
      </list>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration igniteCfg = new IgniteConfiguration();

CacheConfiguration<Integer, Person> personCacheCfg = new CacheConfiguration<>();
personCacheCfg.setName("PersonCache");

CacheJdbcBlobStoreFactory<Integer, Person> cacheStoreFactory = new CacheJdbcBlobStoreFactory<>();

cacheStoreFactory.setUser("USER_NAME");

MysqlDataSource mysqlDataSrc = new MysqlDataSource();
mysqlDataSrc.setURL("jdbc:mysql://[host]:[port]/[database]");
mysqlDataSrc.setUser("USER_NAME");
mysqlDataSrc.setPassword("PASSWORD");

cacheStoreFactory.setDataSource(mysqlDataSrc);

personCacheCfg.setCacheStoreFactory(cacheStoreFactory);

personCacheCfg.setWriteThrough(true);
personCacheCfg.setReadThrough(true);

igniteCfg.setCacheConfiguration(personCacheCfg);
```
</Tab>
</Tabs>

### 2.3.加载数据
缓存存储配置完成并启动集群后，就可以使用下面的代码从数据库加载数据了：
```java
// Load data from person table into PersonCache.
IgniteCache<Integer, Person> personCache = ignite.cache("PersonCache");

personCache.loadCache(null);
```
### 2.4.NoSQL数据库集成
通过实现`CacheStore`接口，可以将Ignite与任何NoSQL数据库集成。

::: warning 警告
虽然Ignite支持分布式事务，但是并不会使NoSQL数据库具有事务性，除非数据库本身直接支持事务。
:::
#### 2.4.1.Cassandra集成
Ignite通过CacheStore实现，直接支持将Apache Cassandra用作持久化存储。其利用Cassandra的[异步查询](http://www.datastax.com/dev/blog/java-driver-async-queries)来提供`loadAll()`、`writeAll()`和`deleteAll()`等高性能批处理操作，并自动在Cassandra中创建所有必要的表和命名空间。

具体请参见[Cassandra集成](/doc/java/ExtensionsIntegrations.md#_6-1-概述)章节的介绍。
## 3.交换空间
### 3.1.概述
如果使用纯内存存储，随着数据量的大小逐步达到物理内存大小，可能导致内存溢出。如果不想使用原生持久化或者外部存储，还可以开启交换，这时Ignite会将内存中的数据移动到磁盘上的交换空间，注意Ignite不会提供自己的交换空间实现，而是利用了操作系统（OS）提供的交换功能。

打开交换空间之后，Ignite会将数据存储在内存映射文件（MMF）中，操作系统会根据内存使用情况，将其内容交换到磁盘，但是这时数据访问的性能会下降。另外，还没有数据持久性保证，这意味着交换空间中的数据只在节点在线期间才可用。一旦存在交换空间的节点停止，所有数据都会丢失。因此，应该将交换空间作为内存的扩展，以留出足够的时间向集群中添加更多的节点让数据重新分布，并避免集群未及时扩容导致内存溢出的错误（OOM）发生。

::: tip 注意
虽然交换空间位于磁盘上，但是其不能替代原生持久化。交换空间中的数据只有在节点在线时才有效，一旦节点关闭，数据将丢失。为了确保数据一直可用，应该启用[原生持久化](#_1-ignite持久化)或使用[外部存储](#_2-外部存储)。
:::
### 3.2.启用交换
数据区的`maxSize`定义了区域的整体最大值，如果数据量达到了`maxSize`，然后既没有使用原生持久化，也没有使用外部存储，那么就会抛出内存溢出异常。使用交换可以避免这种情况的发生，做法是：

 - 配置`maxSize`的值大于内存大小，这时操作系统就会使用交换；
 - 启用数据区的交换，如下所示。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <!-- Durable memory configuration. -->
    <property name="dataStorageConfiguration">
        <bean class="org.apache.ignite.configuration.DataStorageConfiguration">
            <property name="dataRegionConfigurations">
                <list>
                    <!--
                    Defining a data region that will consume up to 500 MB of RAM
                    with swap enabled.
                    -->
                    <bean class="org.apache.ignite.configuration.DataRegionConfiguration">
                        <!-- Custom region name. -->
                        <property name="name" value="500MB_Region"/>
                        <!-- 100 MB initial size. -->
                        <property name="initialSize" value="#{100L * 1024 * 1024}"/>
                        <!-- Setting region max size equal to physical RAM size(5 GB). -->
                        <property name="maxSize" value="#{5L * 1024 * 1024 * 1024}"/>
                        <!-- Enabling swap space for the region. -->
                        <property name="swapPath" value="/path/to/some/directory"/>
                    </bean>
                </list>
            </property>
        </bean>
    </property>
    <!-- Other configurations. -->
</bean>
```
</Tab>

<Tab title="Java">

```java
// Node configuration.
IgniteConfiguration cfg = new IgniteConfiguration();

// Durable Memory configuration.
DataStorageConfiguration storageCfg = new DataStorageConfiguration();

// Creating a new data region.
DataRegionConfiguration regionCfg = new DataRegionConfiguration();

// Region name.
regionCfg.setName("500MB_Region");

// Setting initial RAM size.
regionCfg.setInitialSize(100L * 1024 * 1024);

// Setting region max size equal to physical RAM size(5 GB)
regionCfg.setMaxSize(5L * 1024 * 1024 * 1024);

// Enable swap space.
regionCfg.setSwapPath("/path/to/some/directory");

// Setting the data region configuration.
storageCfg.setDataRegionConfigurations(regionCfg);

// Applying the new configuration.
cfg.setDataStorageConfiguration(storageCfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    DataStorageConfiguration = new DataStorageConfiguration
    {
        DataRegionConfigurations = new[]
        {
            new DataRegionConfiguration
            {
                Name = "5GB_Region",
                InitialSize = 100L * 1024 * 1024,
                MaxSize = 5L * 1024 * 1024 * 1024,
                SwapPath = "/path/to/some/directory"
            }
        }
    }
};
```
</Tab>
</Tabs>

## 4.实现自定义CacheStore
可以实现自己的自定义`CacheStore`并将其作为缓存的底层数据存储，`IgniteCache`中读写数据的方法将会调用`CacheStore`实现中相应的方法。

下表描述了`CacheStore`接口中的方法：

|方法|描述|
|---|---|
|`loadCache()`|调用`IgniteCache.loadCache(…​)`时，就会调用该方法，通常用于从数据库预加载数据。此方法在驻有缓存的所有节点上执行，要加载单个节点的数据，需要在该节点上调用`IgniteCache.localLoadCache()`方法。|
|`load()`、`write()`、`delete()`|当调用`IgniteCache`接口的`get()`、`put()`、`remove()`方法时，会分别调用这3个方法，这些方法用于单条数据的*通读*和*通写*。|
|`loadAll()`、`writeAll()`、`deleteAll()`|当调用`IgniteCache`接口的`getAll()`、`putAll()`、`removeAll()`方法时，会分别调用这3个方法，这些方法用于处理多条数据的*通读*和*通写*，通常以批量的形式实现以提高性能。|

### 4.1.CacheStoreAdapter
`CacheStoreAdapter`是`CacheStore`的扩展，提供了批量操作的默认实现，如`loadAll(Iterable)`、`writeAll(Collection)`和`deleteAll(Collection)`，其会迭代所有条目并在每个条目上调用对应的`load()`、`write()`和`delete()`方法。
### 4.2.CacheStoreSession
`CacheStoreSession`用于持有多个操作之间的上下文，主要用于提供事务支持。一个事务中的多个操作是在同一个数据库连接中执行的，并在事务提交时提交该连接。通过`@GridCacheStoreSessionResource`注解可以将其注入`CacheStore`实现中。

关于如何实现事务化的`CacheStore`，可以参见[GitHub上的示例](https://github.com/apache/ignite/tree/master/examples/src/main/java/org/apache/ignite/examples/datagrid/store/jdbc/CacheJdbcPersonStore.java)。
### 4.3.示例
下面是一个`CacheStore`的非事务化实现的示例：

```java
public class CacheJdbcPersonStore extends CacheStoreAdapter<Long, Person> {
    // This method is called whenever the "get(...)" methods are called on IgniteCache.
    @Override
    public Person load(Long key) {
        try (Connection conn = connection()) {
            try (PreparedStatement st = conn.prepareStatement("select * from PERSON where id=?")) {
                st.setLong(1, key);

                ResultSet rs = st.executeQuery();

                return rs.next() ? new Person(rs.getInt(1), rs.getString(2)) : null;
            }
        } catch (SQLException e) {
            throw new CacheLoaderException("Failed to load: " + key, e);
        }
    }

    @Override
    public void write(Entry<? extends Long, ? extends Person> entry) throws CacheWriterException {
        try (Connection conn = connection()) {
            // Syntax of MERGE statement is database specific and should be adopted for your database.
            // If your database does not support MERGE statement then use sequentially
            // update, insert statements.
            try (PreparedStatement st = conn.prepareStatement("merge into PERSON (id, name) key (id) VALUES (?, ?)")) {
                Person val = entry.getValue();

                st.setLong(1, entry.getKey());
                st.setString(2, val.getName());

                st.executeUpdate();
            }
        } catch (SQLException e) {
            throw new CacheWriterException("Failed to write entry (" + entry + ")", e);
        }
    }

    // This method is called whenever the "remove(...)" method are called on IgniteCache.
    @Override
    public void delete(Object key) {
        try (Connection conn = connection()) {
            try (PreparedStatement st = conn.prepareStatement("delete from PERSON where id=?")) {
                st.setLong(1, (Long) key);

                st.executeUpdate();
            }
        } catch (SQLException e) {
            throw new CacheWriterException("Failed to delete: " + key, e);
        }
    }

    // This method is called whenever the "loadCache()" and "localLoadCache()"
    // methods are called on IgniteCache. It is used for bulk-loading the cache.
    // If you don't need to bulk-load the cache, skip this method.
    @Override
    public void loadCache(IgniteBiInClosure<Long, Person> clo, Object... args) {
        if (args == null || args.length == 0 || args[0] == null)
            throw new CacheLoaderException("Expected entry count parameter is not provided.");

        final int entryCnt = (Integer) args[0];

        try (Connection conn = connection()) {
            try (PreparedStatement st = conn.prepareStatement("select * from PERSON")) {
                try (ResultSet rs = st.executeQuery()) {
                    int cnt = 0;

                    while (cnt < entryCnt && rs.next()) {
                        Person person = new Person(rs.getInt(1), rs.getString(2));
                        clo.apply(person.getId(), person);
                        cnt++;
                    }
                }
            }
        } catch (SQLException e) {
            throw new CacheLoaderException("Failed to load values from cache store.", e);
        }
    }

    // Open JDBC connection.
    private Connection connection() throws SQLException {
        // Open connection to your RDBMS systems (Oracle, MySQL, Postgres, DB2, Microsoft SQL, etc.)
        Connection conn = DriverManager.getConnection("jdbc:mysql://[host]:[port]/[database]", "YOUR_USER_NAME", "YOUR_PASSWORD");

        conn.setAutoCommit(true);

        return conn;
    }
}
```
## 5.集群快照
### 5.1.概述
对于开启了[原生持久化](#_1-ignite持久化)的集群，Ignite提供了创建集群完整快照的功能。一个Ignite快照包括了整个集群中所有存盘数据的完整一致副本，以及用于恢复过程必需的其他一些文件。

快照的结构除了一些例外，类似于[Ignite原生持久化存储目录的布局](#_1-3-配置持久化存储目录)，以下面的快照为例，看一下结构：

```
work
└── snapshots
    └── backup23012020
        └── db
            ├── binary_meta
            │         ├── node1
            │         ├── node2
            │         └── node3
            ├── marshaller
            │         ├── node1
            │         ├── node2
            │         └── node3
            ├── node1
            │    └── my-sample-cache
            │        ├── cache_data.dat
            │        ├── part-3.bin
            │        ├── part-4.bin
            │        └── part-6.bin
            ├── node2
            │    └── my-sample-cache
            │        ├── cache_data.dat
            │        ├── part-1.bin
            │        ├── part-5.bin
            │        └── part-7.bin
            └── node3
                └── my-sample-cache
                    ├── cache_data.dat
                    ├── part-0.bin
                    └── part-2.bin
```

 - 快照位于`work\snapshots`目录下，名为`backup23012020`，这里`work`是Ignite的工作目录；
 - 创建快照的集群有3个节点，所有节点都在同一台主机上运行。在此示例中，节点分别名为`node1`、`node2`和`node3`，而实际上，它们的名字是节点的[唯一性ID](https://cwiki.apache.org/confluence/display/IGNITE/Ignite+Persistent+Store+-+under+the+hood#IgnitePersistentStoreunderthehood-SubfoldersGeneration)；
 - 快照保留了`my-sample-cache`缓存的副本；
 - `db`文件夹在`part-N.bin`和`cache_data.dat`文件中保留数据记录的副本。预写日志和检查点不在快照中，因为这些在当前的恢复过程中并不需要；
 - `binary_meta`和`marshaller`目录存储了和元数据和编组器有关的信息。

::: tip 通常快照分布于整个集群
上面的示例显示为同一个集群创建的快照运行于同一台物理机，因此整个快照位于一个位置上。实际上，集群中不同主机的所有节点上都会有快照数据。每个节点都持有快照的一段，即归属于该节点的数据快照，[恢复过程](#_5-4-从快照恢复)会说明恢复时如何将所有段合并在一起。
:::
### 5.2.配置快照目录
快照默认存储在相应Ignite节点的工作目录中，并和Ignite持久化保存数据、索引、WAL和其他文件使用相同的存储介质。因为快照消耗了和持久化相当的空间，然后和Ignite持久化进程共享磁盘IO，从而会影响应用的性能，因此建议将快照和持久化文件存储在不同的存储介质上。

可以通过[更改持久化文件的存储目录](#_1-3-配置持久化存储目录)或覆盖快照的默认位置来避免Ignite原生持久化和快照之间的这种干扰，如下所示：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <!--
       Sets a path to the root directory where snapshot files will be persisted.
       By default, the `snapshots` directory is placed under the `IGNITE_HOME/db`.
    -->
    <property name="snapshotPath" value="/snapshots"/>

    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            <property name="name" value="snapshot-cache"/>
        </bean>
    </property>

</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

File exSnpDir = U.resolveWorkDirectory(U.defaultWorkDirectory(), "ex_snapshots", true);

cfg.setSnapshotPath(exSnpDir.getAbsolutePath());
```
</Tab>
</Tabs>

### 5.3.创建快照
Ignite提供了几个API来进行快照的创建，下面看下所有的选项：

#### 5.3.1.使用控制脚本
Ignite自带的[控制脚本](/doc/java/Tools.md#_1-控制脚本)支持和快照有关的操作，如下所示：

```shell
#Create a cluster snapshot:
control.(sh|bat) --snapshot create snapshot_name

#Cancel a running snapshot:
control.(sh|bat) --snapshot cancel snapshot_name

#Kill a running snapshot:
control.(sh|bat) --kill SNAPSHOT snapshot_name
```
#### 5.3.2.使用JMX
使用`SnapshotMXBean`接口，可以通过JMX执行和快照有关的过程：

|方法|描述|
|---|---|
|`createSnapshot(String snpName)`|创建快照|
|`createSnapshot(String snpName)`|在创建快照的发起节点取消快照|

#### 5.3.3.使用Java API
也可以通过Java API通过编程式创建快照：
```java
CacheConfiguration<Long, String> ccfg = new CacheConfiguration<Long, String>("snapshot-cache");

try (IgniteCache<Long, String> cache = ignite.getOrCreateCache(ccfg)) {
    cache.put(1, "Maxim");

    // Start snapshot operation.
    ignite.snapshot().createSnapshot("snapshot_02092020").get();
}
finally {
    ignite.destroyCache(ccfg);
}
```
### 5.4.从快照恢复
当前，数据恢复过程必须手动执行。简而言之，需要停止集群，用快照中的数据替换持久化数据和其他文件，然后重启节点。

详细过程如下：

 1. 停止要恢复的集群；
 2. 从检查点目录`$IGNITE_HOME/work/cp`中删除所有文件；
 3. 在每个节点上执行以下操作，单独清理`db/{node_id}`目录，如果他不在Ignite的`work`目录下：
    - 从`$IGNITE_HOME/work/db/binary_meta`目录中删除和`{nodeId}`有关的文件；
    - 从`$IGNITE_HOME/work/db/marshaller`目录中删除和`{nodeId}`有关的文件；
    - 从`$IGNITE_HOME/work/db`目录中删除和`{nodeId}`有关的文件和子目录；
    - 将快照中属于`{node_id}`节点的文件复制到`$IGNITE_HOME/work/`目录中。如果`db/{node_id}`目录不在Ignite的工作目录下，则应在对应目录复制数据文件。
 4. 重启集群。

**在不同拓扑的集群上恢复**

有时可能在N个节点的集群上创建快照，但是需要在有M个节点的集群上进行恢复，下表说明了支持的选项：

|条件|描述|
|---|---|
|`N==M`|**建议**方案，在拓扑一致的集群上创建和使用快照。|
|`N<M`|在M个节点的集群上首先启动N个节点，应用快照，然后将剩余的`M-N`个集群节点加入拓扑，然后等待数据再平衡和索引重建。|
|`N>M`|不支持。|

### 5.5.一致性保证
在Ignite的持久化文件、索引、模式、二进制元数据、编组器以及节点的其他文件上的并发操作以及正在进行的修改，所有的快照都是完全一致的。

集群范围的快照一致性是通过触发[分区映射交换](https://cwiki.apache.org/confluence/display/IGNITE/%28Partition+Map%29+Exchange+-+under+the+hood)过程实现的，通过这样做，集群最终达到的状态是所有之前发起的事务全部完成，新的事务全部暂停，这个过程结束之后，集群就会发起快照创建过程，PME过程会确保快照以一致的状态包括了主快照和备份快照。

Ignite持久化文件与其快照副本之间的一致性是通过将原始文件复制到目标快照目录并跟踪所有正在进行的更改来实现的，跟踪更改可能需要额外的空间。
### 5.6.当前的限制
快照过程有若干限制，如果要用于生产环境需要事先了解：

 - 不支持特定表/缓存的快照，只能创建整个集群的快照；
 - 未开启原生持久化的表/缓存，不支持快照；
 - 加密的缓存不包括在快照中；
 - 同时只能执行一个快照操作；
 - 如果一个服务端节点离开集群，快照过程会被中断；
 - 快照只能在具有相同节点ID的同一集群拓扑中恢复；
 - 目前还不支持自动化的恢复过程，只能手工执行。

## 6.磁盘压缩
磁盘压缩是指将数据页面写入磁盘时对其进行压缩的过程，以减小磁盘空间占用。这些页面在内存中是不压缩的，但是当将数据刷新到磁盘时，将使用配置的算法对其进行压缩。这仅适用于开启原生持久化的数据页面并且不会压缩索引或WAL记录的数据页，[WAL记录压缩](#_1-4-6-wal记录压缩)是可以单独启用的。

磁盘页面压缩是在每个缓存的配置中设定的，缓存必须在持久化的数据区中。目前没有选项可全局启用磁盘页面压缩，此外，还必须必须满足以下的条件：

 - 将持久化配置中的`pageSize`属性设置为文件系统页面大小的至少2倍，这意味着页面大小必须为8K或16K；
 - 启用`ignite-compress`模块。

要为某个缓存启用磁盘页面压缩，需要在缓存配置中提供一种可用的压缩算法，如下所示：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="dataStorageConfiguration">
        <bean class="org.apache.ignite.configuration.DataStorageConfiguration">
            <property name="pageSize" value="#{4096 * 2}"/>
            <property name="defaultDataRegionConfiguration">
                <bean class="org.apache.ignite.configuration.DataRegionConfiguration">
                    <property name="persistenceEnabled" value="true"/>
                </bean>
            </property>
        </bean>
    </property>
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            <property name="name" value="myCache"/>
            <!-- enable disk page compression for this cache -->
            <property name="diskPageCompression" value="LZ4"/>
            <!-- optionally set the compression level -->
            <property name="diskPageCompressionLevel" value="10"/>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
DataStorageConfiguration dsCfg = new DataStorageConfiguration();

//set the page size to 2 types of the disk page size
dsCfg.setPageSize(4096 * 2);

//enable persistence for the default data region
dsCfg.setDefaultDataRegionConfiguration(new DataRegionConfiguration().setPersistenceEnabled(true));

IgniteConfiguration cfg = new IgniteConfiguration();
cfg.setDataStorageConfiguration(dsCfg);

CacheConfiguration cacheCfg = new CacheConfiguration("myCache");
//enable disk page compression for this cache
cacheCfg.setDiskPageCompression(DiskPageCompression.LZ4);
//optionally set the compression level
cacheCfg.setDiskPageCompressionLevel(10);

cfg.setCacheConfiguration(cacheCfg);

Ignite ignite = Ignition.start(cfg);
```
</Tab>
</Tabs>

### 6.1.支持的算法

支持的压缩算法包括：

 - `ZSTD`：支持从-131072到22的压缩级别（默认值：3）；
 - `LZ4`：支持从0到17的压缩级别（默认值：0）；
 - `SNAPPY`
 - `SKIP_GARBAGE`：该算法仅从半填充页面中提取有用的数据，而不压缩数据。

## 7.持久化调优
本章节总结了Ignite原生持久化调优的最佳实践。
### 7.1.调整页面大小
Ignite的页面大小（`DataStorageConfiguration.pageSize`）不要小于存储设备（SSD、闪存、HDD等）的页面大小以及操作系统缓存页面的大小，默认值为4KB。

操作系统的缓存页面大小很容易就可以通过[系统工具和参数](https://unix.stackexchange.com/questions/128213/how-is-page-size-determined-in-virtual-address-space)获取到。

存储设备比如SSD的页面大小可以在设备的说明上找到，如果厂商未提供这些信息，可以运行SSD的基准测试来算出这个数值，如果还是难以拿到这个数值，可以使用4KB作为Ignite的页面大小。很多厂商为了适应4KB的随机写工作负载不得不调整驱动，因为很多标准基准测试都是默认使用4KB，来自英特尔的[白皮书](https://www.intel.com/content/dam/www/public/us/en/documents/white-papers/ssd-server-storage-applications-paper.pdf)也确认4KB足够了。

选定最优值之后，可以将其用于集群的配置：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="dataStorageConfiguration">
        <bean class="org.apache.ignite.configuration.DataStorageConfiguration">

            <!-- Set the page size to 8 KB -->
            <property name="pageSize" value="#{8 * 1024}"/>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

// Durable memory configuration.
DataStorageConfiguration storageCfg = new DataStorageConfiguration();

// Changing the page size to 8 KB.
storageCfg.setPageSize(8192);

cfg.setDataStorageConfiguration(storageCfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    DataStorageConfiguration = new DataStorageConfiguration
    {
        // Changing the page size to 4 KB.
        PageSize = 4096
    }
};
```
</Tab>
</Tabs>

### 7.2.单独保存WAL
考虑为数据文件以及预写日志（WAL）使用单独的磁盘设备。Ignite会主动地写入数据文件以及WAL文件，下面的示例会显示如何为数据存储、WAL以及WAL存档配置单独的路径：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="dataStorageConfiguration">
        <bean class="org.apache.ignite.configuration.DataStorageConfiguration">

            <!--
                Sets a path to the root directory where data and indexes are
                to be persisted. It's assumed the directory is on a separated SSD.
            -->
            <property name="storagePath" value="/opt/persistence"/>
            <property name="walPath" value="/opt/wal"/>
            <property name="walArchivePath" value="/opt/wal-archive"/>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

// Configuring Native Persistence.
DataStorageConfiguration storeCfg = new DataStorageConfiguration();

// Sets a path to the root directory where data and indexes are to be persisted.
// It's assumed the directory is on a separated SSD.
storeCfg.setStoragePath("/ssd/storage");

// Sets a path to the directory where WAL is stored.
// It's assumed the directory is on a separated HDD.
storeCfg.setWalPath("/wal");

// Sets a path to the directory where WAL archive is stored.
// The directory is on the same HDD as the WAL.
storeCfg.setWalArchivePath("/wal/archive");

cfg.setDataStorageConfiguration(storeCfg);

// Starting the node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    DataStorageConfiguration = new DataStorageConfiguration
    {
        // Sets a path to the root directory where data and indexes are to be persisted.
        // It's assumed the directory is on a separated SSD.
        StoragePath = "/ssd/storage",

        // Sets a path to the directory where WAL is stored.
        // It's assumed the directory is on a separated HDD.
        WalPath = "/wal",

        // Sets a path to the directory where WAL archive is stored.
        // The directory is on the same HDD as the WAL.
        WalArchivePath = "/wal/archive"
    }
};
```
</Tab>
</Tabs>

### 7.3.增加WAL段大小
WAL段的默认大小（64MB）在高负载情况下可能是低效的，因为它导致WAL在段之间频繁切换，并且切换/轮转是昂贵的操作。将段大小设置为较大的值（最多2GB）可能有助于减少切换操作的次数，不过这将增加预写日志的占用空间。

具体请参见[修改WAL段大小](#_1-4-3-修改wal段大小)。

### 7.4.调整WAL模式
考虑其它WAL模式替代默认模式。每种模式在节点故障时提供不同程度的可靠性，并且可靠性与速度成反比，即，WAL模式越可靠，则速度越慢。因此，如果具体业务不需要高可靠性，那么可以切换到可靠性较低的模式。

具体可以看[WAL模式](#_1-4-1-wal模式)的相关内容。

### 7.5.禁用WAL
有时[禁用WAL](#_1-4-4-禁用wal)也会改进性能。

### 7.6.页面写入限流
Ignite会定期地启动检查点进程，以在内存和磁盘间同步脏页面。脏页面是已在内存中更新但是还未写入对应的分区文件的页面（更新只是添加到了WAL）。这个进程在后台进行，对应用没有影响。

但是，如果计划进行检查点的脏页面在写入磁盘前被更新，它之前的状态会被复制进一个特定的区域，叫做检查点缓冲区。如果这个缓冲区溢出，那么在检查点处理过程中，Ignite会停止所有的更新。因此，写入性能可能降为0，直至检查点过程完成，如下图所示：

![](https://ignite.apache.org/docs/2.9.0/images/checkpointing-chainsaw.png)

当检查点处理正在进行中时，如果脏页面数达到阈值，同样的情况也会发生，这会使Ignite强制安排一个新的检查点执行，并停止所有的更新操作直到第一个检查点执行完成。

当磁盘较慢或者更新过于频繁时，这两种情况都会发生，要减少或者防止这样的性能下降，可以考虑启用页面写入限流算法。这个算法会在检查点缓冲区填充过快或者脏页面占比过高时，将更新操作的性能降低到磁盘的速度。

::: tip 页面写入限流剖析
要了解更多的信息，可以看相关的[Wiki页面](https://cwiki.apache.org/confluence/display/IGNITE/Ignite+Persistent+Store+-+under+the+hood#IgnitePersistentStore-underthehood-PagesWriteThrottling)。
:::

下面的示例显示了如何开启页面写入限流：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="dataStorageConfiguration">
        <bean class="org.apache.ignite.configuration.DataStorageConfiguration">

            <property name="writeThrottlingEnabled" value="true"/>

        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

// Configuring Native Persistence.
DataStorageConfiguration storeCfg = new DataStorageConfiguration();

// Enabling the writes throttling.
storeCfg.setWriteThrottlingEnabled(true);

cfg.setDataStorageConfiguration(storeCfg);
// Starting the node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    DataStorageConfiguration = new DataStorageConfiguration
    {
        WriteThrottlingEnabled = true
    }
};
```
</Tab>
</Tabs>

### 7.7.调整检查点缓冲区大小
前述章节中描述的检查点缓冲区大小，是检查点处理的触发器之一。

缓冲区的默认大小是根据数据区大小计算的。

|数据区大小|默认检查点缓冲区大小|
|---|---|
|`< 1GB`|MIN (256 MB, 数据区大小)|
|`1GB ~ 8GB`|数据区大小/4|
|`> 8GB`|2GB|

默认的缓冲区大小并没有为写密集型应用进行优化，因为在大小接近标称值时，页面写入限流算法会降低写入的性能，因此在正在进行检查点处理时还希望保持写入性能，可以考虑增加`DataRegionConfiguration.checkpointPageBufferSize`，并且开启写入限流来阻止性能的下降：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="dataStorageConfiguration">
        <bean class="org.apache.ignite.configuration.DataStorageConfiguration">

            <property name="writeThrottlingEnabled" value="true"/>

            <property name="defaultDataRegionConfiguration">
                <bean class="org.apache.ignite.configuration.DataRegionConfiguration">
                    <!-- Enabling persistence. -->
                    <property name="persistenceEnabled" value="true"/>
                    <!-- Increasing the buffer size to 1 GB. -->
                    <property name="checkpointPageBufferSize" value="#{1024L * 1024 * 1024}"/>
                </bean>
            </property>

        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

// Configuring Native Persistence.
DataStorageConfiguration storeCfg = new DataStorageConfiguration();

// Enabling the writes throttling.
storeCfg.setWriteThrottlingEnabled(true);

// Increasing the buffer size to 1 GB.
storeCfg.getDefaultDataRegionConfiguration().setCheckpointPageBufferSize(1024L * 1024 * 1024);

cfg.setDataStorageConfiguration(storeCfg);

// Starting the node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    DataStorageConfiguration = new DataStorageConfiguration
    {
        WriteThrottlingEnabled = true,
        DefaultDataRegionConfiguration = new DataRegionConfiguration
        {
            Name = DataStorageConfiguration.DefaultDataRegionName,
            PersistenceEnabled = true,

            // Increasing the buffer size to 1 GB.
            CheckpointPageBufferSize = 1024L * 1024 * 1024
        }
    }
};
```
</Tab>
</Tabs>

在上例中，默认数据区的检查点缓冲区大小配置为1GB。
### 7.8.启用直接I/O
通常当应用访问磁盘上的数据时，操作系统拿到数据后会将其写入一个文件缓冲区缓存，写操作也是同样，操作系统首先将数据写入缓存，然后才会传输到磁盘，要消除这个过程，可以打开直接IO，这时数据会忽略文件缓冲区缓存，直接从磁盘进行读写。

Ignite中的直接I/O插件用于加速检查点进程，它的作用是将内存中的脏页面写入磁盘，建议将直接IO插件用于写密集型负载环境中。

::: tip 注意
注意，无法专门为WAL文件开启直接I/O，但是开启直接I/O可以为WAL文件带来一点好处，就是WAL数据不会在操作系统的缓冲区缓存中存储过长时间，它会在下一次页面缓存扫描中被刷新（依赖于WAL模式），然后从页面缓存中删除。
:::

要启用直接I/O插件，需要在二进制包中将`{IGNITE_HOME}/libs/optional/ignite-direct-io`文件夹上移一层至`libs/optional/ignite-direct-io`文件夹，或者也可以作为一个Maven构件引入，具体请参见[这里](/doc/java/SettingUp.md#_2-7-启用模块)的介绍。

通过`IGNITE_DIRECT_IO_ENABLED`系统属性，也可以在运行时启用/禁用该插件。

相关的[Wiki页面](https://cwiki.apache.org/confluence/display/IGNITE/Ignite+Persistent+Store+-+under+the+hood#IgnitePersistentStore-underthehood-DirectI/O)有更多的细节。

### 7.9.购买产品级SSD
限于[SSD的操作特性](http://codecapsule.com/2014/02/12/coding-for-ssds-part-2-architecture-of-an-ssd-and-benchmarking/)，在经历几个小时的高强度写入负载之后，Ignite原生持久化的性能可能会下降，因此需要考虑购买快速的产品级SSD来保证高性能，或者切换到非易失性内存设备比如Intel Optane持久化内存。
### 7.10.SSD预留空间
由于SSD[预留空间](http://www.seagate.com/ru/ru/tech-insights/ssd-over-provisioning-benefits-master-ti/)的原因，50%使用率的磁盘的随机写性能要好于90%使用率的磁盘，因此需要考虑购买高预留空间比率的SSD，然后还要确保厂商能提供工具来进行相关的调整。

::: tip Intel 3D XPoint
考虑使用3D XPoint驱动器代替常规SSD，以避免由SSD级别上的低预留空间设置和恒定垃圾收集造成的瓶颈。具体可以看[这里](http://dmagda.blogspot.com/2017/10/3d-xpoint-outperforms-ssds-verified-on.html)。
:::

<RightPane/>
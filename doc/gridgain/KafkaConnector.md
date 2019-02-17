# 3.Kafka连接器
## 3.1.Kafka认证连接器
Kafka连接器将Ignite和和Kafka集成在一起，从而将Ignite轻松地加入一个基于Kafka管道的系统中。

Kafka连接器具有扩展性和弹性，可以解决很多集成的难题，如果直接使用Kafka的`Producer`和`Consumer`API，则必须手工处理解决这些问题。

![](https://files.readme.io/73b2ea2-What_is_Kafka_Connector-Ignite-Kafka_Connector.png)

### 3.1.1.Kafka连接器功能特性：

 - **配置驱动**：无需编码，参见Kafka连接器配置的相关章节；
 - **可扩展且灵活的架构**：参见Kafka连接器架构相关的章节，了解Kafka连接器如何满足性能、扩展性和容错的要求，并深入了解Kafka连接器的内部实现；
 - **支持Ignite的数据模式**：参见Kafka连接器数据模式相关的章节，了解Kafka连接器如何识别、持有和更新Ignite的数据模式，以实现从Ignite到其它具有Kafka连接器的系统（比如Cassandra、HDFS和关系数据库等等）的自动化数据流；
 - **易于运维**：参见Kafka连接器监控的相关章节，以了解如何在生产中监控Kafka连接器；
 - **GridGain和社区版Kafka连接器**：参见GridGain和Ignite的Kafka连接器对比相关的章节，了解GridGain的Kafka连接器与开源版之间的区别。

### 3.1.2.入门
参见Kafka连接器入门相关的章节，了解如何安装、配置和运行Kafka的连接器，然后看一些实际的示例：

 - [示例：使用Kafka连接器在关系数据库中持久化Ignite数据](#_3-8-示例-使用kafka连接器在关系数据库中持久化ignite数据);
 - [示例：使用Kafka连接器进行Ignite数据复制](#_3-9-示例-使用kafka连接器进行ignite数据复制)。

## 3.2.Kafka连接器入门
### 3.2.1.Kafka连接器生态系统
在一个分布式的Kafka连接器生态系统中，有不同类型的节点，本文档中使用以下的术语来指代特定的节点类型：

 - Kafka集群节点被称为`Kafka代理`；
 - Kafka连接器集群节点被称为`Kafka连接器工作节点`；
 - GridGain集群节点被称为`GridGain服务端`。

![](https://files.readme.io/37f4e2d-What_is_Kafka_Connector-Deployment.png)

### 3.2.2.GridGain的Kafka连接器安装
Kafka连接器安装分为3个步骤：

 1. 准备连接器安装包；
 2. 在Kafka中注册GridGain连接器；
 3. 在GridGain中注册连接器（可选）。

**1.准备连接器安装包**

Kafka连接器是GridGain企业版或旗舰版8.4.9及以后版本的一部分，位于GridGain安装文件夹的`integration/gridgain-kafka-connect`目录中。

然后拉取缺失的依赖项：
```bash
cd $GRIDGAIN_HOME/integration/gridgain-kafka-connect
./copy-dependencies.sh
```
**2.在Kafka中注册GridGain连接器**

对于每个Kafka的连接器工作节点：

 1. 将连接器包目录复制到期望的目标目录；
 2. 编辑Kafka连接器工作节点的配置（对于单工作节点Kafka连接器集群，编辑`$KAFKA_HOME/config/connect-standalone.properties`文件，对于多工作节点Kafka连接器集群，编辑`$KAFKA_HOME/config/connect-distributed.properties`），在插件目录中注册连接器，将`CONNECTORS_PATH`替换为之前复制的连接器安装包目录：

connect-standalone.properties：
```properties
plugin.path=CONNECTORS_PATH/gridgain-kafka-connect
```
**3.在GridGain中注册连接器**

::: tip 这是可选的
只有使用`BACKLOG`作为[故障恢复策略](#-3-3-1-2-故障转移-再平衡和分区偏移量)时，这个步骤才是必须的。
:::
在每个GridGain的服务端节点，将下面的jar包复制到`$GRIDGAIN_HOME/libs/user`目录中：

 - `gridgain-kafka-connect-8.4.9.jar`（位于GridGain节点的`$GRIDGAIN_HOME/integration/gridgain-kafka-connect/lib`目录中）；
 - `connect-api-2.0.0.jar`和`kafka-clients-2.0.0.jar`（位于Kafka连接器工作节点的`$KAFKA_HOME/libs`目录）。

### 3.2.3.GridGain的Kafka连接器配置
GridGain源连接器的必要属性是连接器的名字、类名和描述如何接入GridGain源集群的Ignite的配置文件的路径，名为`gridgain-kafka-connect-source`的最小源连接器配置大致如下：

gridgain-kafka-connect-source.properties：
```properties
name=gridgain-kafka-connect-source
connector.class=org.gridgain.kafka.source.IgniteSourceConnector
igniteCfg=IGNITE_CONFIG_PATH/ignite-server-source.xml
```
在[源连接器](#_3-5-1-源连接器)章节中有更详细的属性说明。

GridGain接收连接器的必要属性是连接器的名字、类名、数据流来源的主题列表和描述如何接入GridGain接收集群的Ignite的配置文件的路径，名为`gridgain-kafka-connect-sink`的最小接收连接器配置大致如下：

gridgain-kafka-connect-sink.properties：
```properties
name=gridgain-kafka-connect-sink
topics=topic1,topic2,topic3
connector.class=org.gridgain.kafka.sink.IgniteSinkConnector
igniteCfg=IGNITE_CONFIG_PATH/ignite-server-sink.xml
```
在[池连接器](#_3-5-2-接收连接器)章节中有更详细的属性说明。

### 3.2.4.运行Kafka连接器生态系统
[Kafka连接器的安装和配置](https://docs.confluent.io/current/connect/userguide.html#installing-and-configuring-kconnect-long)，可以看相关的文档，简要来说，要做如下的内容：

 1. 安装和配置Kafka的连接器；
 2. 配置和启动Zookeeper；
 3. 配置和启动Kafka代理；
 4. 配置和启动Kafka连接器工作节点。

了解了如何安装和配置Kafka连接器之后，下面就在一台主机中，使用默认的Zookeeper、Kafka代理和Kafka连接器工作节点配置文件运行Kafka生态系统的shell命令（生产上通常来说要在单独的主机中运行每个节点）：
```bash
$KAFKA_HOME/bin/zookeeper-server-start.sh $KAFKA_HOME/config/zookeeper.properties
$KAFKA_HOME/bin/kafka-server-start.sh $KAFKA_HOME/config/server.properties
$KAFKA_HOME/bin/connect-standalone.sh \
	$KAFKA_HOME/config/connect-standalone.properties \
	gridgain-kafka-connect-source.properties \
	gridgain-kafka-connect-sink.properties
```
### 3.2.5.管理Kafka连接器
每个Kafka工作节点都会暴露REST API，可以用来管理Kafka连接器（默认端口为8083），有关如何创建、删除、暂停和恢复连接器以及查看连接器和任务的状态，可以参见[Kafka连接器REST接口](https://docs.confluent.io/current/connect/references/restapi.html)文档。
## 3.3.Kafka连接器架构
### 3.3.1.源连接器
GridGain的源连接器会从Ignite缓存中加载数据，然后注入Kafka主题，该连接器会监控Ignite中缓存的新增和删除，然后自动进行调整。
#### 3.3.1.1.并行化
在Kafka中，**分区**是键/值/时间戳记录的流。与其它分布式系统类似，Kafka在节点之间分配分区以实现高可用性、可伸缩性和性能。
Kafka连接器架构是分层的：**连接器**会将输入分成分区，创建多个**任务**并为每个任务分配一个或多个分区，最大任务数是可配置的。

GridGain源连接器将每个Ignite缓存视为分区。换句话说，负载由缓存平衡：如果只有一个缓存进行数据加载，这时就是非分布式（独立）GridGain Kafka源连接器操作模式。

在Kafka中，分区存储在**主题**中（Kafka**生产者**写入以及Kafka**消费者**读取的地方），因此，GridGain的Kafka源连接器是在Ignite缓存和Kafka主题之间映射数据。

#### 3.3.1.2.故障转移、再平衡和分区偏移量
**再平衡**即将Kafka连接器和任务在**工作节点**（Kafka节点上运行的JVM进程）间重新分配，如下场景会发生再平衡：

 - 节点加入或离开Kafka集群；
 - GridGain的Kafka源连接器检测到Ignite缓存（Kafka术语中的分区）被创建或被删除，然后自身请求再平衡。

Kafka连接器提供源分区偏移量存储（不要与Kafka记录偏移量混淆），以支持在故障或任何其他原因导致的再平衡或重启后继续拉取数据。如果没有偏移量，连接器就必须从头开始重新加载所有数据，或丢失在连接器不可用期间生成的数据。例如，Confluent的文件源连接器将文件视为分区，并将文件中的位置视为偏移量，另一个例子是Confluent的JDBC源连接器将数据库表视为分区，将自增或时间戳字段值视为偏移量。

GridGain源连接器将**缓存**作为**分区**，通常没有适用于缓存的**偏移量**概念。虽然实际Ignite数据模型中可能有缓存具有自增键或自增值字段，但这种情况并不像关系数据库或NoSQL数据模型那样常见，因此Kafka连接器要求所有缓存包含自增字段将严重限制适用性。

因此，GridGain的Kafka连接器暴露了不同的策略来管理故障转移和再平衡，作为性能、资源消耗和数据交付保证之间的折衷，具体可以使用`failoverPolicy`配置项来指定。

**丢弃**

由于故障转移或再平衡而导致连接器停机期间发生的Ignite缓存更新丢失，此选项以丢失数据为代价提供最高性能。

**完整快照**

每次连接器启动时都从Ignite缓存拉取所有数据。在再平衡或故障转移后始终重新加载所有数据并不违反Kafka保证：可以将重复数据注入Kafka。不过Ignite旨在存储大量的数据，因此除非所有缓存都非常小，否则每次连接器重启都重新加载所有数据并不可行。

**临时缓存**

从最后提交的偏移量恢复。

连接器会在Ignite中创建一个特殊的Kafka临时缓存，其会复制所有的缓存数据并赋予偏移量。Kafka临时缓存由Kafka临时服务管理，该服务在Kafka连接器故障后仍然是在线状态。连接器从Kafka临时缓存中拉取数据，提交已处理的数据偏移量，并在失败或再平衡后从上次提交的偏移量中恢复。在连接器正常停止后，Kafka临时服务会被卸载，同时Kafka临时缓存也会被销毁。配置`backlogMemoryRegionName`可以对临时缓存的内存区、持久化以及其它的存储选项进行定义。

![](https://files.readme.io/6adf577-Offset_Management.png)

此选项支持**只处理一次**的语义，不过会消耗额外的Ignite资源来管理Kafka临时缓存，由于额外的数据编组，效率也不高，并且在Ignite集群重启后会丢失。

::: warning Ignite中配置Kafka临时缓存的内存区
如果使用Kafka临时缓存管理故障转移，必须在Ignite中配置专用于Kafka临时缓存的内存区，并为该内存区配置退出策略，以避免临时缓存无限增长。可以将内存区最大大小配置为足以避免在最坏情况下丢失数据的值。为了理解“最坏情况”，假定Ignite按照条目注入源缓存的速度将条目推送到Kafka临时缓存，源连接器不断拉取Kafka临时缓存并将数据注入Kafka，如果Kafka达不到Ignite的性能或Kafka不可用，那么数据可能会从临时缓存中退出而不会被注入Kafka。因此，临时缓存内存区的最大值，必须足以使所有数据在最长可能的停机时间内以最大速度注入Kafka。

临时缓存内存区的名字默认是`kafka-connect`，可以使用配置项`backlogMemoryRegionName`指定其它的名称。
:::
**动态重新配置**

Kafka连接器会监控在Ignite中创建的匹配`cacheWhitelist`和`cacheBlacklist`的新缓存以及在连接器运行时删除的现有缓存，连接器会对自身自动重新配置，如果动态创建或销毁受监控的缓存，Kafka会进行再平衡。

**初始数据加载**

`shallLoadInitialData`配置项控制是否在连接器启动时加载Ignite缓存中已有的数据。
### 3.3.2.接收连接器
GridGain接收连接器会从Kafka主题中导出数据，然后注入Ignite缓存，如果该缓存在Ignite中不存在，则会创建。

#### 3.3.2.1.并行化

接收连接器会启动一个或多个任务（任务数量在`tasks.max`配置项中指定），并在可用的工作节点中进行分配。每个任务都会从`topics`配置项中指定的主题中拉取数据，将它们分组成批，然后将批量数据推送到与主题对应的缓存中。

#### 3.3.2.2.故障转移、再平衡和分区偏移量
连接器框架会自动提交已处理数据的偏移量，如果连接器重启，会从最后提交的偏移量中继续从Kafka中拉取数据。这提供了**只处理一次**保证。
### 3.3.3.共同特性
**序列化和反序列化**

当源连接器将记录注入Kafka时会发生序列化。当接收连接器从Kafka中消费记录时，会发生反序列化。

Kafka会将连接器的序列化分开处理。使用Kafka工作节点的配置项`key.converter`和`value.converter`可以指定负责序列化的可插拔`Converter`模块的类名。

GridGain的Kafka连接器包中包含`org.gridgain.kafka.IgniteBinaryConverter`，它会使用Ignite的二进制编组器对数据进行序列化。该转换器为无模式数据提供了最大的性能，因为它是连接器使用的原生Ignite二进制对象。`IgniteBinaryConverter`支持Kafka的模式序列化，因此可以在启用模式时使用。

也可以使用其它供应商的转换器替代，它们可以提供一些丰富的附加功能，例如支持模式版本控制的模式注册等。

**过滤**

源和接收连接器都可以对从Ignite缓存中拉取或推送到Ignite缓存的数据进行过滤。

使用`cacheFilter`配置项可以指定实现`java.util.function.Predicate<org.gridgain.kafka.CacheEntry>`的自定义过滤器类名。

**转换**

Kafka的**单消息转换**（SMT）允许基于配置的消息结构和内容更改。参见[Kafka文档](http://kafka.apache.org/documentation.html#connect_transforms)以了解如何配置SMT。

**数据模式**

参见[Kafka连接器数据模式](#_3-4-kafka连接器数据模式)一节。
## 3.4.Kafka连接器数据模式
GridGain的Kafka连接器支持数据模式。这使得许多现有的非GridGain接收连接器可以理解使用GridGain源连接器注入的数据，而GridGain接收连接器也可以理解非GridGain源连接器注入的数据。

### 3.4.1.Ignite类型支持
GridGain的源和接收连接器使用Ignite的二进制格式来处理Ignite数据。

下表提供了Kafka模式类型与已知逻辑类型和Ignite二进制类型之间的映射。

|Kafka类型|Ignite类型|
|---|---|
|INT8|BYTE|
|INT16|SHORT, CHAR|
|INT32|INT|
|INT64|LONG|
|FLOAT32|FLOAT|
|FLOAT64|DOUBLE|
|BOOLEAN|BOOLEAN|
|STRING|STRING, UUID, CLASS|
|BYTES|BYTE_ARR|
|ARRAY(valueSchema)|COL<br>SHORT_ARR<br>INT_ARR<br>LONG_ARR<br>FLOAT_ARR<br>DOUBLE_ARR<br>CHAR_ARR<br>BOOLEAN_ARR<br>DECIMA<br>L_ARR<br>STRING_ARR<br>UUID_ARR<br>DATE_ARR<br>OBJ_ARR<br>ENUM_ARR<br>TIME_ARR<br>DATE_ARR<br>TIMES<br>TAMP_ARR<br>DECIMAL_ARR|
|MAP|MAP|
|STRUCT|OBJ, BINARY_OBJ|
|Date (逻辑类型)|DATE|
|Time (逻辑类型)|TIME|
|Timestamp (逻辑类型)|TIMESTAMP|
|Decimal (逻辑类型)|DECIMAL|

::: warning 部分Ignite类型信息会丢失
如上所示，由于没有Kafka模式和逻辑类型与之对应，因此以下Ignite类型的类型信息将丢失：CHAR，UUID，CLASS和相应的数组。
:::
::: warning 基于Java注解的配置会丢失
GridGain的Kafka连接器没有导入和导出使用Java注释指定的字段信息。例如，Kafka中不存在基于注解配置的关系键、SQL可查询字段和索引。

使用基于配置的方法，可以为接收器缓存指定此类信息。
:::
### 3.4.2.更新和删除
源连接器默认不会处理已删除的Ignite缓存条目。将`shallProcessRemovals`配置项设置为`true`可以使源连接器处理删除的数据。这时源连接器会将值为`null`的记录注入Kafka以表示该数据已被删除，然后接收连接器会删除值为`null`的数据。使用`null`作为值来表示数据已被删除是正常的，因为Ignite不支持`null`缓存值。

出于性能原因，接收连接器默认不支持已有的缓存条目更新。将`shallProcessUpdates`配置项设置为`true`可以使接收连接器更新已有的条目。
### 3.4.3.模式迁移
模式迁移对于GridGain连接器是隐式的。源和接收连接器都以跨平台的Ignite二进制格式拉取和推送缓存条目，这种格式本质上支持更改模式，Ignite缓存键和值是可以具有不同字段集的动态对象。

出于性能原因，源连接器会缓存键和值的模式，在拉取第一个缓存条目时模式被创建并复用于所有后续条目。仅当模式永远不会更改时，此方式才有效。设置`isSchemaDynamic`为`true`可以支持模式更改。
### 3.4.4.无模式操作
如果`isSchemaless`配置项设置为`true`，则源连接器不会生成模式。

禁用模式可以提高性能：连接器不会构建模式，也不会将键和值转换为Kafka格式，不过代价就是非GridGain接收转换器无法理解以Ignite二进制格式注入Kafka的数据。

部分场景禁用模式是有意义的：

 - 已准备通过编码来扩展非Ignite转换器处理Ignite二进制对象以实现更高的性能；
 - 如[示例：使用Kafka连接器进行Ignite数据复制](#_3-9-示例-使用kafka连接器进行ignite数据复制)所示，其不需要模式，因为源端和接收端都是GridGain连接器。
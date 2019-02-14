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

 - [示例：使用Kafka连接器在关系数据库中持久化Ignite数据](#_3-8-使用kafka连接器在关系数据库中持久化ignite数据);
 - [示例：使用Kafka连接器进行Ignite数据复制](#_3-9-使用kafka连接器进行ignite数据复制)。

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
只有使用`BACKLOG`作为[故障恢复策略](#-3-3-1-2-故障恢复-再平衡和分区偏移量)时，这个步骤才是必须的。
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
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
参见入门相关的章节，了解如何安装、配置和运行Kafka的连接器，然后看一些实际的示例：

 - [示例：使用Kafka连接器在关系数据库中持久化Ignite数据](#_3-8-使用kafka连接器在关系数据库中持久化ignite数据);
 - [示例：使用Kafka连接器进行Ignite数据复制](#_3-9-使用kafka连接器进行ignite数据复制)。


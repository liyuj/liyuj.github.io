# Kafka连接器深度解读之转换器和序列化释疑
[Kafka连接器](https://docs.confluent.io/current/connect/index.html)是Apache Kafka®的一部分，提供数据存储与Kafka之间的流式集成。对于数据工程师来说，只需要使用JSON格式配置文件即可。目前已经有很多数据存储的连接器，仅举几例来说，包括[JDBC](https://www.confluent.io/connector/kafka-connect-jdbc/)，[Elasticsearch](https://www.confluent.io/connector/kafka-connect-elasticsearch/)，[IBM MQ](https://www.confluent.io/connector/kafka-connect-ibm-mq/)，[S3](https://www.confluent.io/connector/kafka-connect-s3/)和[BigQuery](https://www.confluent.io/connector/bigquery-sink-connector/)。

对于开发者，Kafka连接器有丰富的[API](https://docs.confluent.io/current/connect/javadocs/index.html)，如有必要，可以[开发](https://docs.confluent.io/current/connect/devguide.html)自己的连接器。此外它还具有用于配置和管理连接器的[REST API](https://docs.confluent.io/current/connect/references/restapi.html)。

Kafka连接器本身是模块化的，提供了非常强大的满足集成需求的方法，部分关键组件包括：

 - 连接器：定义了一组如何与数据存储集成的JAR文件；
 - 转换器：处理数据的序列化和反序列化；
 - 变换：传输过程中的消息处理（可选）。

围绕Kafka连接器，常见的错误或者误解之一是数据的序列化，这是Kafka连接器通过转换器进行处理的，下面会介绍它们的工作机制，并说明一些常见问题如何处理。
## Kafka消息只是字节
Kafka消息是按照主题进行组织的。每条消息都是一个键/值对，不过Kafka就需要这些。当数据在Kafka中存储时都只是字节，这使得Kafka可以适用于各种场景，但这也意味着开发者有责任决定如何对数据进行序列化。

在配置Kafka连接器时，标准步骤的关键之一是序列化格式，要确保主题的读取方和写入方使用相同的序列化格式，否则会出现混乱和错误！

![](https://www.confluent.io/wp-content/uploads/Data-serialization-with-Kafka.png)

常见的格式有很多，包括：

 - JSON;
 - Avro;
 - Protobuf;
 - 字符串分割（如CSV）。

每种格式都有优点和缺点。
### 序列化格式的选择
选择序列化格式的一些原则包括：

 - **模式**：很多时候数据都会有一个模式。可能不喜欢这个事实，但作为开发人员有责任保留和传播此模式，因为模式提供了[服务之间的契约](https://www.infoq.com/presentations/contracts-streaming-microservices)。某些消息格式（例如Avro和Protobuf）具有强大的模式支持，而其它消息格式支持较少（JSON）或根本没有（分隔字符串）；
 - **生态系统兼容性**：Avro是Confluent平台的一等公民，得到了[Confluent模式注册表](https://www.confluent.io/confluent-schema-registry/)、Kafka连接器、[KSQL](https://www.confluent.io/product/ksql/)等的原生支持。而Protobuf则依赖于部分功能支持的社区贡献；
 - **消息大小**：JSON是纯文本格式，消息大小依赖于Kafka本身的压缩配置，而Avro和Protobuf都是二进制格式，因此消息较小；
 - **语言支持**：Java体系对Avro有强大的支持，但如果应用不是基于Java的，那么可能会发现它不太容易处理。

### 如果使用JSON格式写入目标端，需要在主题中使用JSON格式么？
不需要，不管是从源端读取数据的格式，还是将数据写入外部存储，都不会影响Kafka中消息序列化的格式。

Kafka中的连接器负责从源端（例如数据库）读取数据，并将其作为[数据的内部表示](https://docs.confluent.io/current/connect/javadocs/index.html?org/apache/kafka/connect/data/SchemaAndValue.html&_ga=2.83434774.1251956415.1553320583-1542045317.1553320583)传递给转换器,然后，Kafka中的转换器会将此源数据对象序列化到主题上。

当使用Kafka连接器作为接收端时，正好相反，即转换器将来自主题的数据反序列化为内部表示，其会传递給连接器，然后使用指定方法写入目标端。

这意味着可以在主题中比如以Avro格式保存数据，然后比如将其写入HDFS时，再指定[接收端连接器使用的格式](https://docs.confluent.io/current/connect/kafka-connect-hdfs/configuration_options.html?&_ga=2.50083494.1251956415.1553320583-1542045317.1553320583#connector)。
## 配置转换器
Kafka连接器在工作节点级别使用默认的转换器配置，也可以在每个连接器上覆盖它。由于在整个流水线中使用相同的序列化格式通常是一个好的做法，所以通常只需在工作节点上配置转换器，而无需在连接器中指定。但是如果从其它主题中提取数据而它们使用不同的序列化格式时，就要在连接器配置中指定它，即使在连接器的配置中覆盖它，执行任务的还是那个转换器。

**正确的连接器永远不会序列化/反序列化存储在Kafka中的消息，而是让配置的转换器完成这项工作。**

![](https://www.confluent.io/wp-content/uploads/Configuring-converters-with-Kafka-Connect.png)

注意Kafka消息只是键/值字节对，因此需要使用`key.converter`和`value.converter`配置项为键和值指定转换器，某些情况下，可以为键和值指定不同的转换器。

![](https://www.confluent.io/wp-content/uploads/Configuring-converters-with-Kafka-Connect-1.png)

下面是使用String转换器的示例，由于它只是一个字符串，数据没有模式，因此用于`value`并不是那么有用：
```
"key.converter": "org.apache.kafka.connect.storage.StringConverter",
```
某些转换器有其它配置项，对于Avro，需要指定`模式注册表`，对于JSON，需要指定是否希望Kafka连接器将模式嵌入JSON本身。为转换器指定配置项时，要使用`key.converter.`或`value.converter.`前缀。例如要将Avro用于消息的内容，需要指定以下配置项：
```
"value.converter": "io.confluent.connect.avro.AvroConverter",
"value.converter.schema.registry.url": "http://schema-registry:8081",
```
常见的转换器包括：

 - Avro：[Confluent平台](https://www.confluent.io/connector/kafka-connect-avro-converter/)的一部分

```
io.confluent.connect.avro.AvroConverter
```

 - String：Apache Kafka的一部分

```
org.apache.kafka.connect.storage.StringConverter
```

 - JSON：Apache Kafka的一部分

```
org.apache.kafka.connect.json.JsonConverter
```

 - ByteArray：Apache Kafka的一部分

```
org.apache.kafka.connect.converters.ByteArrayConverter
```

 - Protobuf：[社区开源](https://www.confluent.io/connector/kafka-connect-protobuf-converter/)

```
com.blueapron.connect.protobuf.ProtobufConverter
```
## JSON和模式
虽然JSON默认不支持携带模式，但Kafka连接器确实支持嵌入模式的特定JSON格式。由于模式也包含在每个消息中，因此生成的数据大小可能会变大。

如果正在配置Kafka源连接器并且希望Kafka连接器在写入Kafka的消息中包含模式，需要做如下的配置：
```
value.converter=org.apache.kafka.connect.json.JsonConverter
value.converter.schemas.enable=true
```
最终向Kafka写入的消息大致如下，`schema`以及`payload`为JSON中的顶级元素：
```json
{
  "schema": {
    "type": "struct",
    "fields": [
      {
        "type": "int64",
        "optional": false,
        "field": "registertime"
      },
      {
        "type": "string",
        "optional": false,
        "field": "userid"
      },
      {
        "type": "string",
        "optional": false,
        "field": "regionid"
      },
      {
        "type": "string",
        "optional": false,
        "field": "gender"
      }
    ],
    "optional": false,
    "name": "ksql.users"
  },
  "payload": {
    "registertime": 1493819497170,
    "userid": "User_1",
    "regionid": "Region_5",
    "gender": "MALE"
  }
}
```
请注意消息的大小，以及由内容与模式组成的消息的大小。考虑到在每条消息中都重复这一点，就会看到为什么像Avro这样的格式很有意义，因为模式是单独存储的，而消息只包含有效内容（并进行过压缩）。

如果从一个Kafka主题中使用Kafka接收连接器消费JSON格式的数据，则需要了解数据中是否包含模式，如果包含，则要与上面的格式相同，而不能是一些任意的格式，那么配置如下：
```
value.converter=org.apache.kafka.connect.json.JsonConverter
value.converter.schemas.enable=true
```
不过，如果使用的JSON数据没有`schema/payload`结构，像下面这样：
```json
{
  "registertime": 1489869013625,
  "userid": "User_1",
  "regionid": "Region_2",
  "gender": "OTHER"
}
```
则必须通过配置通知Kafka连接器不要寻找模式，如下：
```
value.converter=org.apache.kafka.connect.json.JsonConverter
value.converter.schemas.enable=false
```
和以前一样，要记住转换器配置项（此处`schemas.enable`）需要合适的前缀`key.converter`或`value.converter`。
## 常见错误
如果Kafka连接器中转换器配置不正确，可能遇到以下一些常见错误。这些消息会出现在Kafka连接器配置的接收端中，因为这里是对存储在Kafka中的消息进行反序列化的点。转换器问题通常不会在源端发生，因为源端已经配置了序列化。其中每个都会导致连接器失败，开始的错误为：
```
ERROR WorkerSinkTask{id=sink-file-users-json-noschema-01-0} Task threw an uncaught and unrecoverable exception (org.apache.kafka.connect.runtime.WorkerTask)
org.apache.kafka.connect.errors.ConnectException: Tolerance exceeded in error handler
   at org.apache.kafka.connect.runtime.errors.RetryWithToleranceOperator. execAndHandleError(RetryWithToleranceOperator.java:178)
   at org.apache.kafka.connect.runtime.errors.RetryWithToleranceOperator.execute (RetryWithToleranceOperator.java:104)
```
这个错误之后，会看到一个异常堆栈，其中描述了错误的原因。**注意对于连接器中的任何严重错误，都会抛出上述错误，因此可能会看到与序列化无关的错误**。要快速定位错误是由哪个错误配置导致的，可参考下表：

![](https://www.confluent.io/wp-content/uploads/Errors-from-misconfiguring-converters-in-Kafka-Connect.001.jpeg)

**问题：使用JsonConverter读取非JSON格式数据**

如果源端主题上有非JSON格式的数据，但是使用JsonConverter进行读取，就会看到：
```
org.apache.kafka.connect.errors.DataException: Converting byte[] to Kafka Connect data failed due to serialization error:
…
org.apache.kafka.common.errors.SerializationException: java.io.CharConversionException: Invalid UTF-32 character 0x1cfa7e2 (above 0x0010ffff) at char #1, byte #7)
```
这可能是因为源端主题以Avro或其它格式序列化引起的。

解决方案：如果数据实际上是Avro格式，则需要按照如下方式修改Kafka连接器的接收端：
```
"value.converter": "io.confluent.connect.avro.AvroConverter",
"value.converter.schema.registry.url": "http://schema-registry:8081",
```
**或者**，如果主题由Kafka连接器注入，也可以调整上游源端，让其输出JSON格式数据：
```
"value.converter": "org.apache.kafka.connect.json.JsonConverter",
"value.converter.schemas.enable": "false",
```
**问题：使用AvroConverter读取非Avro格式数据**

这是最常见的错误，当尝试使用AvroConverter从非Avro格式的主题读取数据时，会发生这种情况，还包括使用非Confluent模式注册表的[Avro序列化器](https://docs.confluent.io/5.0.0/schema-registry/docs/serializer-formatter.html?_ga=2.112366852.1251956415.1553320583-1542045317.1553320583#serializer)写入的数据：
```
org.apache.kafka.connect.errors.DataException: my-topic-name
at io.confluent.connect.avro.AvroConverter.toConnectData(AvroConverter.java:97)
…
org.apache.kafka.common.errors.SerializationException: Error deserializing Avro message for id -1
org.apache.kafka.common.errors.SerializationException: Unknown magic byte!
```
解决方案：检查源端主题的序列化格式，调整Kafka连接器接收端使用正确的转换器，或将上游格式修改为Avro（这样最好）。如果上游主题由Kafka连接器注入，也可以按如下方式配置源端连接器的转换器：
```
"value.converter": "io.confluent.connect.avro.AvroConverter",
"value.converter.schema.registry.url": "http://schema-registry:8081",
```
**问题：读取没有期望的schema/payload结构的JSON数据**

如前所述，Kafka连接器支持包含有效内容和模式的特殊JSON格式消息结构，如果读取的JSON数据不是这样的结构，会有下面的错误：
```
org.apache.kafka.connect.errors.DataException: JsonConverter with schemas.enable requires "schema" and "payload" fields and may not contain additional fields. If you are trying to deserialize plain JSON data, set schemas.enable=false in your converter configuration.
```
要知道，对于`schemas.enable=true`唯一有效的JSON结构是，`schema`和`payload`作为顶级元素（如上所示）。

正如错误消息本身所述，如果只是简单的JSON数据，则应将连接器的配置更改为：
```
"value.converter": "org.apache.kafka.connect.json.JsonConverter",
"value.converter.schemas.enable": "false",
```
如果要在数据中包含模式，要么切换到使用Avro（推荐），要么配置上游的Kafka连接器以在消息中包含模式：
```
"value.converter": "org.apache.kafka.connect.json.JsonConverter",
"value.converter.schemas.enable": "true",
```
## 解决问题的提示
**查看连接器工作节点的日志**

要查看Kafka连接器的错误日志，需要定位到Kafka连接器工作节点的输出。这个位置取决于Kafka连接器是如何启动的，[安装Kafka连接器](https://docs.confluent.io/current/installation/installing_cp/index.html?&_ga=2.40515874.1251956415.1553320583-1542045317.1553320583#on-premises-deployments)有好几种方法，包括Docker、Confluent CLI、systemd和手动下载的压缩包，然后工作节点的日志分别位于：

 - Docker：`docker logs container_name`；
 - Confluent CLI：`confluent log connect`；
 - systemd：日志文件写入`/var/log/confluent/kafka-connect`；
 - 其它：默认情况下，Kafka连接器会将其输出发送到`stdout`，因此可以在启动Kafka连接器的终端会话中看到。

**查看Kafka连接器的配置文件**

要更改Kafka连接器工作节点的配置项（适用于所有运行的连接器），需要相应地做出如下的修改：

 - Docker：配置环境变量，比如在Docker Compose中：

```
CONNECT_KEY_CONVERTER: io.confluent.connect.avro.AvroConverter
CONNECT_KEY_CONVERTER_SCHEMA_REGISTRY_URL: 'http://schema-registry:8081'
CONNECT_VALUE_CONVERTER: io.confluent.connect.avro.AvroConverter
CONNECT_VALUE_CONVERTER_SCHEMA_REGISTRY_URL: 'http://schema-registry:8081'
```

 - Confluent CLI：使用配置文件`/etc/schema-registry/connect-avro-distributed.properties`；
 - systemd（deb/rpm）：使用配置文件`/etc/kafka/connect-distributed.properties`；
 - 其它：启动Kafka连接器时，可以指定工作节点的属性文件，例如：

```bash
$ cd confluent-5.0.0
$ ./bin/connect-distributed ./etc/kafka/connect-distributed.properties
```
**检查Kafka主题**

假设遇到了上面提到过的错误，并且想要解决为什么Kafka连接器的接收端无法从主题中读取数据。

这时需要检查正在读取的主题的数据，并确认它采用了期望的序列化格式。另外，要记住所有消息都必须采用这种格式，所以不要只是假设因为现在以正确的格式向主题发送消息，所以不会出现问题。Kafka连接器和其它消费者也会读取该主题的已有消息。

下面将使用命令行来描述如何进行故障排除，但还有一些其它工具也可以做：

 - [Confluent控制中心](https://www.confluent.io/confluent-control-center/)有通过可视化的方式查看主题内容的功能，包括自动确定序列化格式；
 - [KSQL的PRINT命令](https://docs.confluent.io/current/ksql/docs/developer-guide/syntax-reference.html?_ga=2.146003636.1251956415.1553320583-1542045317.1553320583#print)会将主题的内容打印到控制台，包括自动确定序列化格式；
 - [Confluent CLI](https://docs.confluent.io/current/cli/index.html?_ga=2.84161817.1251956415.1553320583-1542045317.1553320583)工具有`consume`命令，其可被用于读取字符串和Avro格式的数据。

**如果认为是字符串/JSON格式数据**

可以使用控制台工具，包括`kafkacat`和`kafka-console-consumer`，以`kafkacat`为例：
```bash
$ kafkacat -b localhost:9092 -t users-json-noschema -C -c1
{
  "registertime":1493356576434,"userid":"User_8","regionid":"Region_2","gender":"MALE"}
```
使用`jq`命令，还可以验证和格式化JSON：
```bash
$ kafkacat -b localhost:9092 -t users-json-noschema -C -c1|jq '.'
{
  "registertime": 1493356576434,
  "userid": "User_8",
  "regionid": "Region_2",
  "gender": "MALE"
}
```
如果你看到了下面这样的乱码字符，其很可能是二进制数据，比如通过Avro或Protobuf格式写入就是这样的：
```bash
$ kafkacat -b localhost:9092 -t users-avro -C -c1
ڝ���VUser_9Region_MALE
```
**如果认为是Avro格式数据**

需要使用专为读取和反序列化Avro数据而设计的控制台工具，这里会使用`kafka-avro-console-consumer`。先要确认指定了正确的模式注册表URL：
```bash
$ kafka-avro-console-consumer --bootstrap-server localhost:9092 \
                              --property schema.registry.url=http://localhost:8081 \
                              --topic users-avro \
                              --from-beginning --max-messages 1
{"registertime":1505213905022,"userid":"User_5","regionid":"Region_4","gender":"FEMALE"}
```
和之前一样，如果要对其格式化，可以通过管道输出结果给`jq`：
```bash
$ kafka-avro-console-consumer --bootstrap-server localhost:9092 \
                              --property schema.registry.url=http://localhost:8081 \
                              --topic users-avro \
                              --from-beginning --max-messages 1 | \
                              jq '.'
{
  "registertime": 1505213905022,
  "userid": "User_5",
  "regionid": "Region_4",
  "gender": "FEMALE"
}
```
## 内部转换器
当运行在分布式模式时，Kafka连接器使用Kafka本身来存储有关其操作的元数据，包括连接器配置，偏移量等。

通过`internal.key.converter/internal.value.converter`配置项，这些Kafka主题本身可以配置使用不同的转换器。但是这些配置项只供内部使用，实际上[从Kafka 2.0版本开始就已被弃用](https://cwiki.apache.org/confluence/display/KAFKA/KIP-174+-+Deprecate+and+remove+internal+converter+configs+in+WorkerConfig)。不再需要修改这些，如果还要修改这些配置项，从Kafka的2.0版本开始，将会收到警告。
## 将模式应用于没有模式的消息
很多时候Kafka连接器会从已经存在模式的地方引入数据，这时只要保留该模式然后使用合适的序列化格式（例如Avro），加上比如模式注册表等提供的兼容性保证，该数据的所有下游用户就都可以从可用的模式中受益。但是如果没有明确的模式呢？

可能正使用[FileSourceConnector](https://docs.confluent.io/current/connect/filestream_connector.html?_ga=2.142315826.1251956415.1553320583-1542045317.1553320583)从纯文本文件中读取数据（不建议用于生产，但通常用于PoC），或者可能正在使用[REST连接器](https://github.com/llofberg/kafka-connect-rest)从REST端点提取数据。由于这两者以及其它的都没有固有的模式，因此需要进行声明。

有时可能只是想从源端读取字节然后将它们写入一个主题上，但大多数情况下需要做正确的事情并应用模式以便数据可以正确地处理。作为数据提取的一部分处理一次，而不是将问题推送到每个消费者（可能是多个），这是一个更好的做法。

可以编写自己的Kafka流式应用以将模式应用于Kafka主题中的数据，但也可以使用KSQL。[这篇文章](https://www.confluent.io/blog/data-wrangling-apache-kafka-ksql)展示了如何对从REST端点提取的JSON数据执行此操作。下面会看一下将模式应用于某些CSV数据的简单示例，显然是可以做到的。

假设有一个名为`testdata-csv`的Kafka主题，其中有一些CSV数据，大致如下：
```bash
$ kafkacat -b localhost:9092 -t testdata-csv -C
1,Rick Astley,Never Gonna Give You Up
2,Johnny Cash,Ring of Fire
```
通过观察，可以猜测它有三个字段，可能为：

 - ID；
 - 艺术家；
 - 歌曲。

如果将数据保留在这样的主题中，那么任何想要使用该数据的应用程序（可能是Kafka连接器接收端、定制的Kafka应用或者其它），都需要每次猜测这个模式。或者更糟糕的是，每个消费端应用的开发者都需要不断向数据提供方确认模式及其任何变更。正如Kafka解耦系统一样，这种模式依赖性迫使团队之间存在硬性耦合，这并不是一件好事。

因此要做的只是使用KSQL将模式应用于数据，并填充一个新的派生主题，其中保存模式。在KSQL中，可以像下面这样查看主题数据：
```
ksql> PRINT 'testdata-csv' FROM BEGINNING;
Format:STRING
11/6/18 2:41:23 PM UTC , NULL , 1,Rick Astley,Never Gonna Give You Up
11/6/18 2:41:23 PM UTC , NULL , 2,Johnny Cash,Ring of Fire
```
这里的前两个字段（`11/6/18 2:41:23 PM UTC`和`NULL`）分别是Kafka消息的时间戳和键，而其余字段来自CSV文件。下面用KSQL注册这个主题并声明模式：
```
ksql> CREATE STREAM TESTDATA_CSV (ID INT, ARTIST VARCHAR, SONG VARCHAR) \
WITH (KAFKA_TOPIC='testdata-csv', VALUE_FORMAT='DELIMITED');

Message
----------------
Stream created
----------------
```
通过KSQL可以查看现在有一个数据流模式：
```
ksql> DESCRIBE TESTDATA_CSV;

Name                 : TESTDATA_CSV
 Field   | Type
-------------------------------------
 ROWTIME | BIGINT (system)
 ROWKEY  | VARCHAR(STRING) (system)
 ID      | INTEGER
 ARTIST  | VARCHAR(STRING)
 SONG    | VARCHAR(STRING)
-------------------------------------
For runtime statistics and query details run: DESCRIBE EXTENDED <Stream,Table>;
```
通过查询KSQL流确认数据是否符合预期。注意对于已有的Kafka主题，此时只是作为Kafka的消费者，尚未更改或复制任何数据。
```
ksql> SET 'auto.offset.reset' = 'earliest';
Successfully changed local property 'auto.offset.reset' from 'null' to 'earliest'
ksql> SELECT ID, ARTIST, SONG FROM TESTDATA_CSV;
1 | Rick Astley | Never Gonna Give You Up
2 | Johnny Cash | Ring of Fire
```
最后，创建一个新的Kafka主题，由具有模式的重新序列化的数据填充。KSQL查询是连续的，因此除了将任何已有的数据从源端主题发送到目标端主题之外，KSQL还将向主题发送任何未来的数据。
```
ksql> CREATE STREAM TESTDATA WITH (VALUE_FORMAT='AVRO') AS SELECT * FROM TESTDATA_CSV;

Message
----------------------------
Stream created and running
----------------------------
```
这时使用Avro格式的控制台消费者对数据进行验证：
```
$ kafka-avro-console-consumer --bootstrap-server localhost:9092 \
                                --property schema.registry.url=http://localhost:8081 \
                                --topic TESTDATA \
                                --from-beginning | \
                                jq '.'
{
  "ID": {
    "int": 1
},
  "ARTIST": {
    "string": "Rick Astley"
},
  "SONG": {
    "string": "Never Gonna Give You Up"
  }
}
[…]
```
甚至可以在模式注册表中查看已经注册的模式：
```
$ curl -s http://localhost:8081/subjects/TESTDATA-value/versions/latest|jq '.schema|fromjson'
{
  "type": "record",
  "name": "KsqlDataSourceSchema",
  "namespace": "io.confluent.ksql.avro_schemas",
  "fields": [
    {
      "name": "ID",
      "type": [
        "null",
        "int"
      ],
      "default": null
    },
    {
      "name": "ARTIST",
      "type": [
        "null",
        "string"
      ],
      "default": null
    },
    {
      "name": "SONG",
      "type": [
        "null",
        "string"
      ],
      "default": null
    }
  ]
}
```
任何写入原始主题（`testdata-csv`）的新消息都由KSQL自动处理，并写入Avro格式的名为`TESTDATA`的新主题。现在，任何想要使用此数据的应用或团队都可以简单地处理`TESTDATA`主题，并利用声明模式的Avro序列化数据。还可以使用此技术更改主题中的分区数，分区键和复制因子。
## 结论
Kafka连接器是一个非常简单但功能强大的工具，可用于将其它系统与Kafka集成，最常见的误解是Kafka连接器提供的转换器。之前已经介绍过Kafka消息只是键/值对，了解应该使用哪个序列化机制然后在Kafka连接器中对其进行标准化非常重要。
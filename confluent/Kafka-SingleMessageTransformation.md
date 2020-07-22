# Kafka Connect深度解读之单消息转换
Kafka Connect是Apache Kafka®的一部分，在Kafka和其它系统之间提供可靠的、可扩展的分布式流式集成。Kafka Connect具有可用于许多系统的连接器，它是一个配置驱动的工具，不需要编码。

Kafka Connect API还提供了一个简单的接口，用于处理从源端通过数据管道到接收端的记录，该API称为`单消息转换（SMT）`，顾名思义，当数据通过Kafka Connect连接器时，它可以对数据管道中的每条消息进行操作。

连接器分为源端或接收端，它们要么从Kafka上游的系统中提取数据，要么向Kafka的下游推送数据。这个转换可以配置为在任何一侧进行，源端连接器可以在写入Kafka主题之前对数据进行转换，接收端连接器也可以在将数据写入接收端之前对其进行转换。

转换的一些常见用途是：

 - 对字段重命名；
 - 掩蔽值；
 - 根据值将记录路由到主题；
 - 将时间戳转换或插入记录中；
 - 操作主键，例如根据字段的值设置主键。

Kafka自带了许多转换器，但是开发自定义的转换器也非常容易。

## 配置Kafka Connect的单消息转换
需要给转换器指定一个名字，该名字将用于指定该转换器的其他属性。例如，下面是JDBC源端利用RegexRouter转换器的配置片段，该转换器将固定字符串附加到要写入的主题的末尾：
```
{
  “name”: "jdbcSource", 
	"config": {
  "connector.class": "io.confluent.connect.jdbc.JdbcSourceConnector",
  # —- other JDBC config properties —-
  "transforms": "routeRecords",
  "transforms.routeRecords.type":  "org.apache.kafka.connect.transforms.RegexRouter",
  "transforms.routeRecords.regex": "(.*)",
  "transforms.routeRecords.replacement": "$1-test"
[…]  }
}
```
该转换器被命名为`routeRecords`，且在后续中用于传递属性。注意，上面的示例显示了`RegexRouter`的两个配置属性：正则表达式`regex`和匹配组引用`replacement`。此设置将从JDBC源端获取表名，并将其加上`-test`后缀。根据转换器的功能不同，也可能会有不同的配置属性，具体可以参见相关的文档。
## 执行多次转换
有时需要执行多次转换，Kafka Connect支持定义多个转化器，他们在配置中链接在一起。这些消息按照在`transforms`属性中定义的顺序执行转换。
## 转换链示例
下面的转换使用`ValueToKey`转换器将值转换为主键，并使用`ExtractField`转换器仅使用ID整数值作为主键：
```
“transforms”:”createKey,extractInt”,
“transforms.createKey.type”:”org.apache.kafka.connect.transforms.ValueToKey”,
“transforms.createKey.fields”:”c1”,
“transforms.extractInt.type”:”org.apache.kafka.connect.transforms.ExtractField$Key”,
“transforms.extractInt.field”:”c1”
```
注意，使用上述`$Key`符号，会指定此转换将作用于记录的`Key`，如果要针对记录的`Value`，需要在这里指定`$Value`。最后`ConnectRecord`看起来像这样：
```
key        value
------------------------------
null       {"c1":{"int":100},"c2":{"string":"bar"}}
```
转换后：
```
key        value
------------------------------
100       {"c1":{"int":100},"c2":{"string":"bar"}}
```
## 转换器适合做什么，不适合做什么
转换是一个功能强大的概念，但仅应将其用于简单、有限的数据突变，不要调用外部API或状态存储，也不应尝试做任何繁琐的处理。应该使用Kafka Streams或KSQL之类的流处理解决方案在连接器之间的流处理层中处理更重的转换和数据集成。转换不能将一条消息拆分成多条消息，也不能关联其他流来进行扩充或进行任何类型的聚合，此类任务应留给流处理器。
## 单消息转换深入解读
下面深入地看下连接器如何处理数据。转换器被编译为JAR，并通过Connect工作节点的属性文件中的`plugin.path`属性，指定其可用于Kafka Connect，安装后就可以在连接器属性中配置转换。

配置和部署后，源端连接器将从上游系统接收记录，将其转换为`ConnectRecord`，然后将该记录传递给配置的转换器的`apply()`函数，然后等待返回记录。接收端连接器也是执行类似的过程，从Kafka主题读取并反序列化每个消息之后，将调用转换器的`apply()`方法，并将结果记录发送到目标系统。
## 如何开发单消息转换器
要开发将UUID插入每个记录的简单转换器，需要逐步执行以下的步骤。

`apply`方法是转换器的核心，这种转换支持带有模式和不带有模式的数据，因此每个都有一个转换：
```java
@Override
  public R apply(R record) {
    if (operatingSchema(record) == null) {
      return applySchemaless(record);
    } else {
      return applyWithSchema(record);
    }
  }

  private R applySchemaless(R record) {
    final Map<String, Object> value = requireMap(operatingValue(record), PURPOSE);

    final Map<String, Object> updatedValue = new HashMap<>(value);

    updatedValue.put(fieldName, getRandomUuid());

    return newRecord(record, null, updatedValue);
  }

  private R applyWithSchema(R record) {
    final Struct value = requireStruct(operatingValue(record), PURPOSE);

    Schema updatedSchema = schemaUpdateCache.get(value.schema());
    if(updatedSchema == null) {
      updatedSchema = makeUpdatedSchema(value.schema());
      schemaUpdateCache.put(value.schema(), updatedSchema);
    }

    final Struct updatedValue = new Struct(updatedSchema);

    for (Field field : value.schema().fields()) {
      updatedValue.put(field.name(), value.get(field));
    }

    updatedValue.put(fieldName, getRandomUuid());

    return newRecord(record, updatedSchema, updatedValue);
  }
```
此转换器可以应用于记录的键或值，因此需要实现`Key`和`Value`子类，其扩展了`InsertUuid`类并实现`apply`方法调用的`newRecord`方法：
```java
public static class Key<R extends ConnectRecord<R>> extends InsertUuid<R> {

    @Override
    protected Schema operatingSchema(R record) {
      return record.keySchema();
    }

    @Override
    protected Object operatingValue(R record) {
      return record.key();
    }

    @Override
    protected R newRecord(R record, Schema updatedSchema, Object updatedValue) {
      return record.newRecord(record.topic(), record.kafkaPartition(), updatedSchema, updatedValue, record.valueSchema(), record.value(), record.timestamp());
    }

  }

  public static class Value<R extends ConnectRecord<R>> extends InsertUuid<R> {

    @Override
    protected Schema operatingSchema(R record) {
      return record.valueSchema();
    }

    @Override
    protected Object operatingValue(R record) {
      return record.value();
    }

    @Override
    protected R newRecord(R record, Schema updatedSchema, Object updatedValue) {
      return record.newRecord(record.topic(), record.kafkaPartition(), record.keySchema(), record.key(), updatedSchema, updatedValue, record.timestamp());
    }

  }
```
该转换器仅改变了模式和值，但是要注意其可以操纵`ConnectRecord`的所有部分：`Key`、`Value`、`Key`和`Value`的模式、目标主题、目标分区和时间戳。

该转换器具有可选的参数，这些参数可以在运行时配置，并可以通过转换器类中重写的`configure()`方法访问：
```java
 @Override
  public void configure(Map<String, ?> props) {
    final SimpleConfig config = new SimpleConfig(CONFIG_DEF, props);
    fieldName = config.getString(ConfigName.UUID_FIELD_NAME);

    schemaUpdateCache = new SynchronizedCache<>(new LRUCache<Schema, Schema>(16));
  }
```
如上所示，该`Transformation`接口很简单，它实现了一个`apply()`方法来接收`ConnectRecord`然后再返回`ConnectRecord`，它可以选择通过`configure()`方法接收参数。

接下来，编译此JAR并将其放入Connect工作节点中`plugin.path`指定的路径中。注意需要将转换器所依赖的任何依赖项打包到它的路径中或编译为胖JAR。然后在连接器配置中调用它，如下所示（注意`$Value`内部类约定，以指示此转换应作用于记录的值）：
```
transforms=insertuuid
transforms.insertuuid.type=kafka.connect.smt.InsertUuid$Value
transforms.insertuuid.uuid.field.name="uuid"
```
<RightPane/>
# Cassandra集成
## 1.Ignite和Apache Cassandra
### 1.1.概述
对于过期的缓存记录，通过使用[Cassandra](http://cassandra.apache.org/)作为持久化存储，Ignite的Cassandra模块为缓存实现了一个CacheStore。

它在功能上和`CacheJdbcBlobStore`以及`CacheJdbcPojoStore`的方式几乎是相同的，但是又提供了如下的好处；

 1. 使用[Apache Cassandra](http://cassandra.apache.org/)，它是一个高性能和高可扩展的键值存储；
>**SQL查询**
注意，为了执行SQL查询，如果使用了外部的数据库，需要在Ignite缓存中持有所有的数据。
或者也可以使用Ignite原生的持久化-这是一个分布式的、支持ACID以及兼容SQL的磁盘存储，它可以在存储于内存和磁盘上的数据执行SQL查询。

 2. 对于CacheStore的批量操作`loadAll()`,`writeAll()`,`deleteAll()`，使用Cassandra的[异步查询](http://www.datastax.com/dev/blog/java-driver-async-queries) ，可以提供非常高的性能；
 3. 如果Cassandra中不存在会自动创建所有必要的表（以及键空间），也会为将存储为POJOs的Ignite键值自动检测所有必要的字段，并且创建相应的表结构。因此无需关注Cassandra的表创建DDL语法以及Java到Cassandra的类型映射细节。也可以使用`@QuerySqlField`注解为Cassandra表列提供配置（列名、索引、排序）；
 4. 可以有选择地为将创建的Cassandra表和键空间指定配置（复制因子、复制策略、Bloom过滤器等）；
 5. 组合BLOB和POJO存储的功能，可以根据喜好存储从Ignite缓存来的键-值对（作为BLOB或者POJO）；
 6. 对于键值支持[Java](https://docs.oracle.com/javase/tutorial/jndi/objects/serial.html)和[Kryo](https://github.com/EsotericSoftware/kryo)序列化，它会以BLOB形式存储于Cassandra；
 7. 通过为特定的Ignite缓存指定持久化配置，或者通过使用`@QuerySqlField(index = true)`注解自动进行配置的检测，支持Cassandra的[第二索引](http://docs.datastax.com/en/cql/3.0/cql/cql_reference/create_index_r.html)（包括定制索引）;
 8. 通过持久化配置，或者通过使用`@QuerySqlField(descending = true)`注解自动进行配置的检测，支持Cassandra集群键字段的排序；
 9. 对于POJO的键类，如果它的属性之一加注了`@AffinityKeyMapped`注解，也会支持关联并置，这时，Ignite缓存中存储在某个节点上的键-值对，也会存储（并置）于Cassandra中的同一个节点上。

## 2.基本概念
要将Cassandra设置为一个持久化存储，需要将Ignite缓存的`CacheStoreFactory`设置为`org.apache.ignite.cache.store.cassandra.CassandraCacheStoreFactory`。
可以像下面这样通过Spring进行配置：
```xml
<bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="cacheConfiguration">
        <list>
            ...
            <!-- Configuring persistence for "cache1" cache -->
            <bean class="org.apache.ignite.configuration.CacheConfiguration">
                <property name="name" value="cache1"/>
                <!-- Tune on Read-Through and Write-Through mode -->
                <property name="readThrough" value="true"/>
                <property name="writeThrough" value="true"/>
                <!-- Specifying CacheStoreFactory -->
                <property name="cacheStoreFactory">
                    <bean class="org.apache.ignite.cache.store.cassandra.CassandraCacheStoreFactory">
                        <!-- Datasource configuration bean which is responsible for Cassandra connection details -->
                        <property name="dataSourceBean" value="cassandraDataSource"/>
                        <!-- Persistent settings bean which is responsible for the details of how objects will be persisted to Cassandra -->
                        <property name="persistenceSettingsBean" value="cache1_persistence_settings"/>
                    </bean>
                </property>
            </bean>
            ...
        </list>
        ...
    </property>
</bean>
```
这里有两个主要的属性需要为`CassandraCacheStoreFactory`设置：

 - `dataSourceBean`:`org.apache.ignite.cache.store.cassandra.utils.datasource.DataSource`类的实例，负责Cassandra数据库连接的所有方面（凭据、联系点、读/写一致性级别、负载平衡策略等）；
 - `persistenceSettingsBean`:`org.apache.ignite.cache.store.cassandra.utils.persistence.KeyValuePersistenceSettings`类的实例，负责对象如何持久化到Cassandra的所有方面（键空间及其选项、表及其选项、分区和集群键选项、POJO对象字段映射、第二索引、BLOB对象序列化器等）。

下面的章节中这两个Bean及其配置会详细地描述。
### 2.1.DataSourceBean
这个bean存储了Cassandra数据库与连接和CRUD操作有关的所有必要信息，下面的表格中显示了所有的属性：

|属性|默认值|描述|
|---|---|---|
|user||连接Cassandra的用户名|
|password||连接Cassandra的用户密码|
|credentials||提供`user`和`password`的Credentials Bean|
|authProvider||接入Cassandra时使用指定的AuthProvider，当自定义身份认证体系准备就绪时，使用这个方法。|
|port||接入Cassandra时使用的端口（如果没有在连接点中提供）|
|contactPoints||Cassandra连接时使用的连接点数组（**hostaname:[port]**）|
|maxSchemaAgreementWaitSeconds|10秒|DDL查询返回前架构协议的最大等待时间|
|protocolVersion|3|指定使用Cassandra驱动协议的哪个版本（有助于旧版本Cassandra的后向兼容）。|
|compression||传输中使用的压缩格式，支持的压缩格式包括：**snappy**，**lz4**|
|useSSL|false|是否启用SSL|
|sslOptions|false|是否使用提供的选项启用SSL|
|collectMetrix|false|是否启用指标收集|
|jmxReporting|false|是否启用JMX的指标报告|
|fetchSize||指定查询获取大小，获取大小控制一次获取的结果集的数量|
|readConsistency||指定READ查询的一致性级别|
|writeConsistency||指定WRITE/DELETE/UPDATE查询的一致性级别|
|loadBalancingPolicy|TokenAwarePolicy|指定要使用的负载平衡策略|
|reconnectionPolicy|ExponentialReconnectionPolicy|指定要使用的重连策略|
|retryPolicy|DefaultRetryPolicy|指定要使用的重试策略|
|addressTranslater|IdentityTranslater|指定要使用的地址转换器|
|speculativeExecutionPolicy|NoSpeculativeExecutionPolicy|指定要使用 的推理执行策略|
|poolingOptions||指定连接池选项|
|socketOptions||指定保持到Cassandra主机的连接的底层Socket选项|
|nettyOptions||允许客户端定制Cassandra驱动底层Netty层的钩子|

### 2.2.PersistenceSettingsBean
这个bean存储了对象（键和值）如何持久化到Cassandra数据库的所有细节信息（键空间、表、分区选项、POJO字段映射等）。
`org.apache.ignite.cache.store.cassandra.utils.persistence.KeyValuePersistenceSettings`的构造器可以通过如下方式创建这个Bean，从一个包含特定结构的XML配置文档的字符串（看下面的代码），或者指向XML文档的资源。

下面是一个XML配置文档的常规示例（**持久化描述符**），它指定了Ignite缓存的键和值如何序列化/反序列化到/从Cassandra:
```xml
<!--
Root container for persistence settings configuration.

Note: required element

Attributes:
  1) keyspace [required] - specifies keyspace for Cassandra tables which should be used to store key/value pairs
  2) table    [required] - specifies Cassandra table which should be used to store key/value pairs
  3) ttl      [optional] - specifies expiration period for the table rows (in seconds)
-->
<persistence keyspace="my_keyspace" table="my_table" ttl="86400">
    <!--
    Specifies Cassandra keyspace options which should be used to create provided keyspace if it doesn't exist.

    Note: optional element
    -->
    <keyspaceOptions>
        REPLICATION = {'class' : 'SimpleStrategy', 'replication_factor' : 3}
        AND DURABLE_WRITES = true
    </keyspaceOptions>

    <!--
    Specifies Cassandra table options which should be used to create provided table if it doesn't exist.

    Note: optional element
    -->
    <tableOptions>
        comment = 'A most excellent and useful table'
        AND read_repair_chance = 0.2
    </tableOptions>

    <!--
    Specifies persistent settings for Ignite cache keys.

    Note: required element

    Attributes:
      1) class      [required] - java class name for Ignite cache key
      2) strategy   [required] - one of three possible persistent strategies:
            a) PRIMITIVE - stores key value as is, by mapping it to Cassandra table column with corresponding type.
                Should be used only for simple java types (int, long, String, double, Date) which could be mapped
                to corresponding Cassadra types.
            b) BLOB - stores key value as BLOB, by mapping it to Cassandra table column with blob type.
                Could be used for any java object. Conversion of java object to BLOB is handled by "serializer"
                which could be specified in serializer attribute (see below).
            c) POJO - stores each field of an object as a column having corresponding type in Cassandra table.
                Provides ability to utilize Cassandra secondary indexes for object fields.
      3) serializer [optional] - specifies serializer class for BLOB strategy. Shouldn't be used for PRIMITIVE and
        POJO strategies. Available implementations:
            a) org.apache.ignite.cache.store.cassandra.utils.serializer.JavaSerializer - uses standard Java
                serialization framework
            b) org.apache.ignite.cache.store.cassandra.utils.serializer.KryoSerializer - uses Kryo
                serialization framework
      4) column     [optional] - specifies column name for PRIMITIVE and BLOB strategies where to store key value.
        If not specified column having 'key' name will be used. Shouldn't be used for POJO strategy.
    -->
    <keyPersistence class="org.mycompany.MyKeyClass" strategy="..." serializer="..." column="...">
        <!--
        Specifies partition key fields if POJO strategy used.

        Note: optional element, only required for POJO strategy in case you want to manually specify
            POJO fields to Cassandra columns mapping, instead of relying on dynamic discovering of
            POJO fields and mapping them to the same columns of Cassandra table.
        -->
        <partitionKey>
            <!--
             Specifies mapping from POJO field to Cassandra table column.

             Note: required element

             Attributes:
               1) name   [required] - POJO field name
               2) column [optional] - Cassandra table column name. If not specified lowercase
                  POJO field name will be used.
            -->
            <field name="companyCode" column="company" />
            ...
            ...
        </partitionKey>

        <!--
        Specifies cluster key fields if POJO strategy used.

        Note: optional element, only required for POJO strategy in case you want to manually specify
            POJO fields to Cassandra columns mapping, instead of relying on dynamic discovering of
            POJO fields and mapping them to the same columns of Cassandra table.
        -->
        <clusterKey>
            <!--
             Specifies mapping from POJO field to Cassandra table column.

             Note: required element

             Attributes:
               1) name   [required] - POJO field name
               2) column [optional] - Cassandra table column name. If not specified lowercase
                  POJO field name will be used.
               3) sort   [optional] - specifies sort order (asc or desc)
            -->
            <field name="personNumber" column="number" sort="desc"/>
            ...
            ...
        </clusterKey>
    </keyPersistence>

    <!--
    Specifies persistent settings for Ignite cache values.

    Note: required element

    Attributes:
      1) class      [required] - java class name for Ignite cache value
      2) strategy   [required] - one of three possible persistent strategies:
            a) PRIMITIVE - stores key value as is, by mapping it to Cassandra table column with corresponding type.
                Should be used only for simple java types (int, long, String, double, Date) which could be mapped
                to corresponding Cassadra types.
            b) BLOB - stores key value as BLOB, by mapping it to Cassandra table column with blob type.
                Could be used for any java object. Conversion of java object to BLOB is handled by "serializer"
                which could be specified in serializer attribute (see below).
            c) POJO - stores each field of an object as a column having corresponding type in Cassandra table.
                Provides ability to utilize Cassandra secondary indexes for object fields.
      3) serializer [optional] - specifies serializer class for BLOB strategy. Shouldn't be used for PRIMITIVE and
        POJO strategies. Available implementations:
            a) org.apache.ignite.cache.store.cassandra.utils.serializer.JavaSerializer - uses standard Java
                serialization framework
            b) org.apache.ignite.cache.store.cassandra.utils.serializer.KryoSerializer - uses Kryo
                serialization framework
      4) column     [optional] - specifies column name for PRIMITIVE and BLOB strategies where to store value.
        If not specified column having 'value' name will be used. Shouldn't be used for POJO strategy.
    -->
    <valuePersistence class="org.mycompany.MyValueClass" strategy="..." serializer="..." column="">
        <!--
         Specifies mapping from POJO field to Cassandra table column.

         Note: required element

         Attributes:
           1) name         [required] - POJO field name
           2) column       [optional] - Cassandra table column name. If not specified lowercase
              POJO field name will be used.
           3) static       [optional] - boolean flag which specifies that column is static withing a given partition
           4) index        [optional] - boolean flag specifying that secondary index should be created for the field
           5) indexClass   [optional] - custom index java class name if you want to use custom index
           6) indexOptions [optional] - custom index options
        -->
        <field name="firstName" column="first_name" static="..." index="..." indexClass="..." indexOptions="..."/>
        ...
        ...
    </valuePersistence>
</persistence>
```
下面会提供关于持久化描述符配置及其元素的所有细节信息。

**persistence**

> **必要元素**
持久化配置的根容器。

|属性|必需|描述|
|---|---|---|
|keyspace|是|存储键-值对的Cassandra表的键空间，如果键空间不存在会创建它（如果指定的Cassandra账户持有正确的权限）。|
|table|否|存储键-值对的Cassandra表，如果表不存在会创建它（如果指定的Cassandra账户持有正确的权限）。|
|ttl|否|表数据行的到期时间（秒），要了解有关Cassandra ttl的详细信息，可以参照[到期数据](http://docs.datastax.com/en/cql/3.1/cql/cql_using/use_expire_c.html)。|

**keyspaceOptions**
> **可选元素**
创建在持久化配置容器中配置的**keyspace**属性指定的Cassandra键空间时的可选项。

键空间只有在不存在时才会被创建，并且连接到Cassandra的账户要持有正确的权限。

这个XML元素指定的文本只是[创建键空间](http://docs.datastax.com/en/cql/3.0/cql/cql_reference/create_keyspace_r.html)的Cassandra DDL语句中在**WITH**关键字之后的一段代码。

**tableOptions**
> **可选元素**
创建在持久化配置容器中配置的**table**属性指定的表时的可选项。

表只有在不存在时才会被创建，并且连接到Cassandra的账户要持有正确的权限。

这个XML元素指定的文本只是[创建表](http://docs.datastax.com/en/cql/3.0/cql/cql_reference/create_table_r.html)的Cassandra DDL语句中在**WITH**关键字之后的一段代码。

**keyPersistence**
> **必要元素**
Ignite缓存键的持久化配置。

这些属性指定了从Ignite缓存中对象如何存储/加载到/从Cassandra表。

|属性|必需|描述|
|---|---|---|
|class|是|Ignite缓存键的Java类名。|
|strategy|是|指定三个可能的持久化策略之一（看下面的描述），它会控制对象如何存储/加载到/从Cassandra表。|
|serializer|否|BLOB策略的序列化器类（可用的实现看下面），PRIMITIVE和POJO策略时无法使用。|
|column|否|PRIMITIVE和BLOB策略时存储键的列名，如果不指定，列名为`key`，对于POJO策略属性无需指定。|

*持久化策略*：
|名称|描述|
|---|---|
|**PRIMITIVE**|存储对象，通过对应的类型将其映射到Cassandra表列中，只能使用简单的Java类型（int、long、String、double、Date），它们会直接映射到对应的Cassandra类型上，要了解详细的Java到Cassandra的类型映射，点击[这里](http://docs.datastax.com/en/developer/java-driver/2.0/java-driver/reference/javaClass2Cql3Datatypes_r.html)。|
|**BLOB**|将对象存储为BLOB，使用BLOB类型将其映射到Cassandra表列，可以使用任何Java对象，Java对象到BLOB的转换是由**keyPersistence**容器中的serializer属性指定的序列化器处理的。|
|**POJO**|将对象的每个属性按照对应的类型存储到Cassandra的表中，对于对象的属性，提供了利用Cassandra第二索引的能力，只能用于遵守Java Bean规范的POJO对象，并且它的属性都是基本Java类型，它们会直接映射到对应的Cassandra类型上。|

*可用的序列化器实现*

|类名|描述|
|---|---|
|**org.apache.ignite.cache.store.cassandra.utils.serializer.JavaSerializer**|使用标准的Java序列化框架|
|**org.apache.ignite.cache.store.cassandra.utils.serializer.KryoSerializer**|使用Kryo序列化框架|

如果使用了**PRIMITIVE**和**BLOB**持久化策略，那么是不需要指定`keyPersistence`标签的内部元素的，这样的原因是，这两个策略中整个对象都被持久化到Cassandra表中的一列（可以通过`column`指定）。

如果使用`POJO`持久化策略，那么有两个策略：

 - 让`keyPersistence`标签为空，这时，POJO对象类的所有字段都会通过如下的规则自动检测：
  - 只有那些可以直接映射到[对应的Cassandra类型](http://docs.datastax.com/en/developer/java-driver/1.0/java-driver/reference/javaClass2Cql3Datatypes_r.html)的简单Java类型会被自动检测；
  - 字段的发现机制会考虑`@QuerySqlField`注解；
     - 如果指定了`name`属性，它会被用作Cassandra表中的列名，否则属性名的小写形式会被用做列名；
     - 如果为一个映射到**集群键**列的字段指定了`descending`属性，它会被用于指定列的排序规则。
  - 字段的发现机制会考虑`@AffinityKeyMapped`注解，加注这个注解的字段会被认为是[分区键](http://docs.datastax.com/en/cql/3.0/cql/ddl/ddl_compound_keys_c.html)（以它们在类中声明的顺序），其它的所有字段都会以[集群键](http://docs.datastax.com/en/cql/3.0/cql/ddl/ddl_compound_keys_c.html)处理。
  - 如果没有字段加注了`@AffinityKeyMapped`注解，所有被发现的字段都会被认为是[分区键](http://docs.datastax.com/en/cql/3.0/cql/ddl/ddl_compound_keys_c.html)。
 - 在`keyPersistence`标签中指定持久化的细节，这时，需要在`partitionKey`标签中指定映射到Cassandra表列的`分区键`字段，这个标签只是作为一个映射设置的容器，没有任何属性。作为一个选择（如果打算使用集群键），也可以在`clusterKey`标签中指定映射到对应Cassandra表列的`集群`键字段。这个标签只是作为一个映射设置的容器，也没有任何属性。

下面两个章节会详细描述**分区**和**集群**键字段映射的细节（如果选择了上面列表的第二个选项）。

**partitionKey**
> **可选元素**
`field`元素的容器，用于指定Cassandra的分区键。

定义了**Ignite缓存**的键对象字段（在它里面），它会被用作Cassandra表的**分区键**，并且指定了到表列的字段映射。

映射是通过`<field>`标签设定的，它有如下的属性：

|属性|必需|描述|
|---|---|---|
|name|是|POJO对象字段名|
|column|否|Cassandra表列名，如果不指定，会使用POJO字段名的小写形式|

**clusterKey**
> **可选元素**
`field`元素的容器，用于指定Cassandra的集群键。

定义了**Ignite缓存**的键对象字段（在它里面），它会被用作Cassandra表的**集群键**，并且指定了到表列的字段映射。
映射是通过`<field>`标签设定的，它有如下的属性：

|属性|必需|描述|
|---|---|---|
|name|是|POJO对象字段名|
|column|否|Cassandra表列名，如果不指定，会使用POJO字段名的小写形式|
|sort|否|指定字段排序规则（**升序**或者**降序**）|

**valuePersistence**
> **必要元素**
Ignite缓存值的持久化配置。

这些设置指定了Ignite缓存的值对象如何存储/加载到/从Cassandra表。

这些设置的属性看上去和对应的Ignite缓存键的设定很像。

|属性|必需|描述|
|---|---|---|
|class|是|Ignite缓存值的Java类名。|
|strategy|是|指定三个可能的持久化策略之一（看下面的描述），它会控制对象如何存储/加载到/从Cassandra表。|
|serializer|否|BLOB策略的序列化器类（可用的实现看下面），PRIMITIVE和POJO策略时无法使用。|
|column|否|PRIMITIVE和BLOB策略时存储值的列名，如果不指定，列名为`value`，对于POJO策略属性无需指定。|

持久化策略（与键的持久化策略一致）：

|名称|描述|
|---|---|
|**PRIMITIVE**|存储对象，通过对应的类型将其映射到Cassandra表列中，只能使用简单的Java类型（int、long、String、double、Date），它们会直接映射到对应的Cassandra类型上，要了解详细的Java到Cassandra的类型映射，点击[这里](http://docs.datastax.com/en/developer/java-driver/2.0/java-driver/reference/javaClass2Cql3Datatypes_r.html)。|
|**BLOB**|将对象存储为BLOB，使用BLOB类型将其映射到Cassandra表列，可以使用任何Java对象，Java对象到BLOB的转换是由**valuePersistence**容器中的serializer属性指定的序列化器处理的。|
|**POJO**|将对象的每个属性按照对应的类型存储到Cassandra的表中，对于对象的属性，提供了利用Cassandra第二索引的能力，只能用于遵守Java Bean规范的POJO对象，并且它的属性都是基本Java类型，它们会直接映射到对应的Cassandra类型上。|

*可用的序列化器实现*

|类名|描述|
|---|---|
|**org.apache.ignite.cache.store.cassandra.utils.serializer.JavaSerializer**|使用标准的Java序列化框架|
|**org.apache.ignite.cache.store.cassandra.utils.serializer.KryoSerializer**|使用Kryo序列化框架|

如果使用了**PRIMITIVE**和**BLOB**持久化策略，那么是不需要指定`valuePersistence`标签的内部元素的，这样的原因是，这两个策略中整个对象都被持久化到Cassandra表中的一列（可以通过`column`指定）。

如果使用`POJO`持久化策略，那么有两个策略（与键的选项相同）：

 - 让`valuePersistence`标签为空，这时，POJO对象类的所有字段都会通过如下的规则自动检测：
  - 只有那些可以直接映射到[对应的Cassandra类型](http://docs.datastax.com/en/developer/java-driver/1.0/java-driver/reference/javaClass2Cql3Datatypes_r.html)的简单Java类型会被自动检测；
  - 字段的发现机制会考虑`@QuerySqlField`注解；
     - 如果指定了`name`属性，它会被用作Cassandra表中的列名，否则属性名的小写形式会被用做列名；
     - 如果指定了`index`属性，会在Cassandra表中为相应的列创建第二索引（如果这样的表不存在）。
 - 在`valuePersistence`标签中指定持久化的细节，这时，就需要在`valuePersistence`标签中指定POJO字段到Cassandra表列的映射。

如果选择了上述的第二个选项，那么需要使用`<field>`标签指定POJO字段到Cassandra表列的映射，这个标签有如下的属性：

|属性|必需|描述|
|---|---|---|
|name|是|POJO对象字段名|
|column|否|Cassandra表列名，如果不指定，会使用POJO字段名的小写形式|
|static|否|布尔类型标志，它指定了在一个分区内列是否为静态的|
|index|否|布尔类型标志，指定了对于特定字段是否要创建第二索引|
|indexClass|否|如果要使用自定义索引，则为自定义索引Java类名|
|indexOptions|否|自定义索引选项|

## 3.示例
就像上一章描述的那样，要将Cassandra配置为缓存存储，需要将Ignite缓存的**CacheStoreFactory**设置为`org.apache.ignite.cache.store.cassandra.CassandraCacheStoreFactory`。

下面是一个Ignite将Cassandra配置为缓存存储的典型配置示例，即使它看上去很复杂也不用担心，我们会一步一步深入每一个配置项，这个示例来自于Cassandra模块源代码的单元测试资源文件`test/resources/org/apache/ignite/tests/persistence/blob/ignite-config.xml`。

XML：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">

    <!-- Cassandra connection settings -->
    <import resource="classpath:org/apache/ignite/tests/cassandra/connection-settings.xml" />

    <!-- Persistence settings for 'cache1' -->
    <bean id="cache1_persistence_settings" class="org.apache.ignite.cache.store.cassandra.persistence.KeyValuePersistenceSettings">
        <constructor-arg type="org.springframework.core.io.Resource" value="classpath:org/apache/ignite/tests/persistence/blob/persistence-settings-1.xml" />
    </bean>

    <!-- Persistence settings for 'cache2' -->
    <bean id="cache2_persistence_settings" class="org.apache.ignite.cache.store.cassandra.persistence.KeyValuePersistenceSettings">
        <constructor-arg type="org.springframework.core.io.Resource" value="classpath:org/apache/ignite/tests/persistence/blob/persistence-settings-3.xml" />
    </bean>

    <!-- Ignite configuration -->
    <bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
        <property name="cacheConfiguration">
            <list>
                <!-- Configuring persistence for "cache1" cache -->
                <bean class="org.apache.ignite.configuration.CacheConfiguration">
                    <property name="name" value="cache1"/>
                    <property name="readThrough" value="true"/>
                    <property name="writeThrough" value="true"/>
                    <property name="cacheStoreFactory">
                        <bean class="org.apache.ignite.cache.store.cassandra.CassandraCacheStoreFactory">
                            <property name="dataSourceBean" value="cassandraAdminDataSource"/>
                            <property name="persistenceSettingsBean" value="cache1_persistence_settings"/>
                        </bean>
                    </property>
                </bean>

                <!-- Configuring persistence for "cache2" cache -->
                <bean class="org.apache.ignite.configuration.CacheConfiguration">
                    <property name="name" value="cache2"/>
                    <property name="readThrough" value="true"/>
                    <property name="writeThrough" value="true"/>
                    <property name="cacheStoreFactory">
                        <bean class="org.apache.ignite.cache.store.cassandra.CassandraCacheStoreFactory">
                            <property name="dataSourceBean" value="cassandraAdminDataSource"/>
                            <property name="persistenceSettingsBean" value="cache2_persistence_settings"/>
                        </bean>
                    </property>
                </bean>
            </list>
        </property>

        <!-- Explicitly configure TCP discovery SPI to provide list of initial nodes. -->
        <property name="discoverySpi">
            <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
                <property name="ipFinder">
                    <!--
                        Ignite provides several options for automatic discovery that can be used
                        instead os static IP based discovery. For information on all options refer
                        to our documentation: http://apacheignite.readme.io/docs/cluster-config
                    -->
                    <!-- Uncomment static IP finder to enable static-based discovery of initial nodes. -->
                    <!--<bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.vm.TcpDiscoveryVmIpFinder">-->
                    <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.multicast.TcpDiscoveryMulticastIpFinder">
                        <property name="addresses">
                            <list>
                                <!-- In distributed environment, replace with actual host IP address. -->
                                <value>127.0.0.1:47500..47509</value>
                            </list>
                        </property>
                    </bean>
                </property>
            </bean>
        </property>
    </bean>
</beans>
```
在这个示例中，配置了两个Ignite缓存：`cache1`和`cache2`，下面会看配置的细节。

这两个缓存非常接近（**cache1**和**cache2**），看起来像这样：

XML：
```xml
<bean class="org.apache.ignite.configuration.CacheConfiguration">
    <property name="name" value="cache1"/>
    <property name="readThrough" value="true"/>
    <property name="writeThrough" value="true"/>
    <property name="cacheStoreFactory">
        <bean class="org.apache.ignite.cache.store.cassandra.CassandraCacheStoreFactory">
            <property name="dataSourceBean" value="cassandraAdminDataSource"/>
            <property name="persistenceSettingsBean" value="cache1_persistence_settings"/>
        </bean>
    </property>
</bean>
```
首先，我们看到通读和通写选项已经启用了：

XML：
```xml
<property name="readThrough" value="true"/>
<property name="writeThrough" value="true"/>
```
如果希望为过期条目使用持久化存储，这个对于Ignite缓存就是必要的。

如果希望异步更新持久化存储，也可以有选择地配置后写参数。

XML：
```xml
<property name="writeBehindEnabled" value="true"/>
```
下一个重要的事就是`CacheStoreFactory`的配置：

XML：
```xml
<property name="cacheStoreFactory">
    <bean class="org.apache.ignite.cache.store.cassandra.CassandraCacheStoreFactory">
        <property name="dataSourceBean" value="cassandraAdminDataSource"/>
        <property name="persistenceSettingsBean" value="cache1_persistence_settings"/>
    </bean>
</property>
```
可以看到将`org.apache.ignite.cache.store.cassandra.CassandraCacheStoreFactory`作为一个`CacheStoreFactory`，这使得Ignite缓存可以使用Cassandra作为持久化存储。对于`CassandraCacheStoreFactory`，需要指定两个必要的属性：

 - **dataSourceBean**：spring bean的名字，它指定了所有与Cassandra数据库连接有关的细节，要了解更多细节，可以看上一章的介绍；
 - **persistenceSettingsBean**：spring bean的名字，它指定了对象如何持久化到Cassandra数据库的细节，要了解更多细节，可以看上一章的介绍。

在这个示例中，`cassandraAdminDataSource`是一个datasource bean，可以使用如下的指令导入Ignite的缓存配置文件：
```xml
<import resource="classpath:org/apache/ignite/tests/cassandra/connection-settings.xml" />
```
`cache1_persistence_settings`是一个持久化配置bean，它是在Ignite缓存配置文件中使用如下的方式配置的：

XML:
```xml
<bean id="cache1_persistence_settings" class="org.apache.ignite.cache.store.cassandra.utils.persistence.KeyValuePersistenceSettings">
    <constructor-arg type="org.springframework.core.io.Resource" value="classpath:org/apache/ignite/tests/persistence/blob/persistence-settings-1.xml" />
</bean>
```
现在我们可以从`org/apache/ignite/tests/cassandra/connection-settings.xml`测试资源文件中看一下`cassandraAdminDataSource`的设置：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="cassandraAdminCredentials" class="org.apache.ignite.tests.utils.CassandraAdminCredentials"/>

    <bean id="loadBalancingPolicy" class="com.datastax.driver.core.policies.RoundRobinPolicy"/>

    <bean id="contactPoints" class="org.apache.ignite.tests.utils.CassandraHelper" factory-method="getContactPointsArray"/>

    <bean id="cassandraAdminDataSource" class="org.apache.ignite.cache.store.cassandra.utils.datasource.DataSource">
        <property name="credentials" ref="cassandraAdminCredentials"/>
        <property name="contactPoints" ref="contactPoints"/>
        <property name="readConsistency" value="ONE"/>
        <property name="writeConsistency" value="ONE"/>
        <property name="loadBalancingPolicy" ref="loadBalancingPolicy"/>
    </bean>
</beans>
```
最后，还没有描述的最后一个片段就是持久化设置的配置，我们可以从`org/apache/ignite/tests/persistence/blob/persistence-settings-1.xml`测试资源文件中看一下`cache1_persistence_settings`:

XML:
```xml
<persistence keyspace="test1" table="blob_test1">
    <keyPersistence class="java.lang.Integer" strategy="PRIMITIVE" />
    <valuePersistence strategy="BLOB"/>
</persistence>
```
在这个配置中，我们可以看到Cassandra的`test1.blob_test1`表会用于**cache1**缓存的键/值存储，缓存的键对象会以**integer**的形式存储于`key`列中，缓存的值对象会以**blob**的形式存储于`value`列中。

下一章会为不同类型的持久化策略提供持久化设置的示例。
### 3.1.示例1
Ignite缓存的持久化配置中，`Integer`类型的键在Cassandra中会以`int`的形式存储，`String`类型的值在Cassandra中会以`text`的形式存储。

XML:
```xml
<persistence keyspace="test1" table="my_table">
    <keyPersistence class="java.lang.Integer" strategy="PRIMITIVE" column="my_key"/>
    <valuePersistence class="java.lang.String" strategy="PRIMITIVE" />
</persistence>
```
键会存储于`my_key`列，值会存储于`value`列（如果`column`属性不指定，则会使用默认值）。
### 3.2.示例2
Ignite缓存的持久化配置中，`Integer`类型的键在Cassandra中会以`int`的形式存储，`any`类型的值（`BLOB`持久化策略中无需指定类型）在Cassandra中会以`BLOB`的形式存储，这个场景的唯一解决方案就是在Cassandra中将值存储为`BLOB`。

XML：
```xml
<persistence keyspace="test1" table="my_table">
    <keyPersistence class="java.lang.Integer" strategy="PRIMITIVE" />
    <valuePersistence strategy="BLOB"/>
</persistence>
```
键会存储于`key`列（如果`column`属性不指定则会使用默认值），值会存储于`value`列。
### 3.3.示例3
Ignite缓存的持久化配置中，`Integer`类型的键和`any`类型的值在Cassandra中都以`BLOB`的形式存储。
```xml
<persistence keyspace="test1" table="my_table">
    <!-- By default Java standard serialization is going to be used -->
    <keyPersistence class="java.lang.Integer"
                    strategy="BLOB"/>

    <!-- Kryo serialization specified to be used -->
    <valuePersistence class="org.apache.ignite.tests.pojos.Person"
                      strategy="BLOB"
                      serializer="org.apache.ignite.cache.store.cassandra.utils.serializer.KryoSerializer"/>
</persistence>
```
键会存储于`BLOB`类型的`key`列，使用[Java标准序列化](https://docs.oracle.com/javase/tutorial/jndi/objects/serial.html)，值会存储于`BLOB`类型的`value`列，使用[Kryo序列化](https://github.com/EsotericSoftware/kryo)。
### 3.4.示例4
Ignite缓存的持久化配置中，`Integer`类型的键在Cassandra中会以`int`的形式存储，自定义POJO`org.apache.ignite.tests.pojos.Person`类型的值在动态分析后会被持久化到一组表列中，这样每个POJO字段都会被映射到相对应的表列，关于更多动态POJO字段发现的信息，可以查看上一章的介绍。

XML：
```xml
<persistence keyspace="test1" table="my_table">
    <keyPersistence class="java.lang.Integer" strategy="PRIMITIVE"/>
    <valuePersistence class="org.apache.ignite.tests.pojos.Person" strategy="POJO"/>
</persistence>
```
键会存储于`int`类型的`key`列。

我们可以假设`org.apache.ignite.tests.pojos.Person`类的实现如下：
```java
public class Person {
    private String firstName;
    private String lastName;
    private int age;
    private boolean married;
    private long height;
    private float weight;
    private Date birthDate;
    private List<String> phones;

    public void setFirstName(String name) {
        firstName = name;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setLastName(String name) {
        lastName = name;
    }

    public String getLastName() {
        return lastName;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public int getAge() {
        return age;
    }

    public void setMarried(boolean married) {
        this.married = married;
    }

    public boolean getMarried() {
        return married;
    }

    public void setHeight(long height) {
        this.height = height;
    }

    public long getHeight() {
        return height;
    }

    public void setWeight(float weight) {
        this.weight = weight;
    }

    public float getWeight() {
        return weight;
    }

    public void setBirthDate(Date date) {
        birthDate = date;
    }

    public Date getBirthDate() {
        return birthDate;
    }

    public void setPhones(List<String> phones) {
        this.phones = phones;
    }

    public List<String> getPhones() {
        return phones;
    }
}
```
这时，Ignite缓存中`org.apache.ignite.tests.pojos.Person`类型的值会使用如下的动态配置映射规则持久化到一组Cassandra表列中：

|POJO字段|表列|列类型|
|---|---|---|
|firstName|firstname|text|
|lastName|lastname|text|
|age|age|int|
|married|married|boolean|
|height|height|bigint|
|weight|weight|float|
|birthDate|birthdate|timestamp|

从上表可以看出，`phones`字段不会被持久化到表中，这是应为它不是一个可以映射到[对应Cassandra类型](http://docs.datastax.com/en/developer/java-driver/1.0/java-driver/reference/javaClass2Cql3Datatypes_r.html)的简单Java类型，这种类型的字段只有在给这个对象类型手工指定所有的映射细节以及字段类型本身实现了`java.io.Serializable`接口时才会被持久化于Cassandra中。这时，字段会被持久化到一个单独的`BLOB`类型的表列。下个示例会看到更多的细节。

> 这个示例显示了，使用非常简单的配置，依托动态对象字段映射，就可以轻易地为POJO对象配置持久化。

### 3.5.示例5
Ignite缓存的持久化配置中，键是自定义的POJO`org.apache.ignite.tests.pojos.PersonId`类型，值是自定义POJO`org.apache.ignite.tests.pojos.Person`类型，基于手工指定的映射规则，都会被持久化到一组表列。

XML：
```xml
<persistence keyspace="test1" table="my_table" ttl="86400">
    <!-- Cassandra keyspace options which should be used to create provided keyspace if it doesn't exist -->
    <keyspaceOptions>
        REPLICATION = {'class' : 'SimpleStrategy', 'replication_factor' : 3}
        AND DURABLE_WRITES = true
    </keyspaceOptions>

    <!-- Cassandra table options which should be used to create provided table if it doesn't exist -->
    <tableOptions>
        comment = 'A most excellent and useful table'
        AND read_repair_chance = 0.2
    </tableOptions>

    <!-- Persistent settings for Ignite cache keys -->
    <keyPersistence class="org.apache.ignite.tests.pojos.PersonId" strategy="POJO">
        <!-- Partition key fields if POJO strategy used -->
        <partitionKey>
            <!-- Mapping from POJO field to Cassandra table column -->
            <field name="companyCode" column="company" />
            <field name="departmentCode" column="department" />
        </partitionKey>

        <!-- Cluster key fields if POJO strategy used -->
        <clusterKey>
            <!-- Mapping from POJO field to Cassandra table column -->
            <field name="personNumber" column="number" sort="desc"/>
        </clusterKey>
    </keyPersistence>

    <!-- Persistent settings for Ignite cache values -->
    <valuePersistence class="org.apache.ignite.tests.pojos.Person"
                      strategy="POJO"
                      serializer="org.apache.ignite.cache.store.cassandra.utils.serializer.KryoSerializer">
        <!-- Mapping from POJO field to Cassandra table column -->
        <field name="firstName" column="first_name" />
        <field name="lastName" column="last_name" />
        <field name="age" />
        <field name="married" index="true"/>
        <field name="height" />
        <field name="weight" />
        <field name="birthDate" column="birth_date" />
        <field name="phones" />
    </valuePersistence>
</persistence>
```
这些配置看上去非常复杂，我们可以一步一步地分析它。

首先看一下根标签：

XML：
```xml
<persistence keyspace="test1" table="my_table" ttl="86400">
```
它指定了Ignite缓存的键和值应该存储于`test1.my_table`表，并且每一条数据会在86400秒（24小时）后[过期](http://docs.datastax.com/en/cql/3.1/cql/cql_using/use_expire_c.html)。

然后可以看到关于Cassandra键空间的高级配置，在不存在时，这个配置会用于创建键空间。

XML：
```xml
<keyspaceOptions>
    REPLICATION = {'class' : 'SimpleStrategy', 'replication_factor' : 3}
    AND DURABLE_WRITES = true
</keyspaceOptions>
```
然后通过对键空间配置的分析，可以看到只会用于表创建的高级配置。

XML：
```xml
<tableOptions>
    comment = 'A most excellent and useful table'
    AND read_repair_chance = 0.2
</tableOptions>
```
下一个章节说明了Ignite缓存的键如何持久化：

XML：
```xml
<keyPersistence class="org.apache.ignite.tests.pojos.PersonId" strategy="POJO">
    <!-- Partition key fields if POJO strategy used -->
    <partitionKey>
        <!-- Mapping from POJO field to Cassandra table column -->
        <field name="companyCode" column="company" />
        <field name="departmentCode" column="department" />
    </partitionKey>

    <!-- Cluster key fields if POJO strategy used -->
    <clusterKey>
        <!-- Mapping from POJO field to Cassandra table column -->
        <field name="personNumber" column="number" sort="desc"/>
    </clusterKey>
</keyPersistence>
```
我们假定`org.apache.ignite.tests.pojos.PersonId`的实现如下：
```java
public class PersonId {
    private String companyCode;
    private String departmentCode;
    private int personNumber;

    public void setCompanyCode(String code) {
        companyCode = code;
    }

    public String getCompanyCode() {
        return companyCode;
    }

    public void setDepartmentCode(String code) {
        departmentCode = code;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setPersonNumber(int number) {
        personNumber = number;
    }

    public int getPersonNumber() {
        return personNumber;
    }
}
```
这时Ignite缓存中`org.apache.ignite.tests.pojos.PersonId`类型的键会使用如下的映射规则持久化到一组表示`分区`和`集群`键的Cassandra表列：

|POJO字段|表列|列类型|
|---|---|---|
|companyCode|company|text|
|departmentCode|department|text|
|personNumber|number|int|

另外，`(company, department)`的列组合会用作为Cassandra的`PARTITION`键，`number`列会用作为倒序排列的`集群`键。
最后到最后一章，它指定了Ignite缓存值的持久化配置：

XML：
```xml
<valuePersistence class="org.apache.ignite.tests.pojos.Person"
                  strategy="POJO"
                  serializer="org.apache.ignite.cache.store.cassandra.utils.serializer.KryoSerializer">
    <!-- Mapping from POJO field to Cassandra table column -->
    <field name="firstName" column="first_name" />
    <field name="lastName" column="last_name" />
    <field name="age" />
    <field name="married" index="true"/>
    <field name="height" />
    <field name="weight" />
    <field name="birthDate" column="birth_date" />
    <field name="phones" />
</valuePersistence>
```
假定`org.apache.ignite.tests.pojos.Person`类和示例4的实现一样，这时Ignite缓存的`org.apache.ignite.tests.pojos.Person`类型的值会以如下的映射规则持久化到一组Cassandra表列：

|POJO字段|表列|列类型|
|---|---|---|
|firstName|first_name|text|
|lastName|last_name|text|
|age|age|int|
|married|married|boolean|
|height|height|bigint|
|weight|weight|float|
|birthDate|birth_date|timestamp|
|phones|phones|blob|

和示例4相比，我们可以看到，使用Kryo序列化器，`phones`字段会被序列化到`blob`类型的`phones`列。另外，Cassandra会为`married`列创建第二索引。

## 4.DDL生成器
Ignite Cassandra模块的一个好处是，无需关注Cassandra的表创建DDL语法以及Java到Cassandra的类型映射细节。

只需要创建指定了Ignite缓存的键和值如何序列化/反序列化到/从Cassandra的XML配置文档即可，基于这个设置，剩余的Cassandra键空间和表都会被自动创建，要让这一切运转起来，只需要：

> 在Cassandra的连接设置中，指定的用户要有足够的权限来创建键空间和表。

不过因为严格的安全策略，某些环境中这是不可能的。这个场景的唯一解决方案就是向运维团队提供DDL脚本来创建所有必要的Cassandra键空间和表。

这就是使用DDL生成工具的确切场景，它会从一个持久化配置中生成DDL。

语法样例：
```bash
java org.apache.ignite.cache.store.cassandra.utils.DDLGenerator /opt/dev/ignite/persistence-settings-1.xml /opt/dev/ignite/persistence-settings-2.xml
```
输出样例：
```
-------------------------------------------------------------
DDL for keyspace/table from file: /opt/dev/ignite/persistence-settings-1.xml
-------------------------------------------------------------

create keyspace if not exists test1
with replication = {'class' : 'SimpleStrategy', 'replication_factor' : 3} and durable_writes = true;

create table if not exists test1.primitive_test1
(
 key int,
 value int,
 primary key ((key))
);

-------------------------------------------------------------
DDL for keyspace/table from file: /opt/dev/ignite/persistence-settings-2.xml
-------------------------------------------------------------

create keyspace if not exists test1
with REPLICATION = {'class' : 'SimpleStrategy', 'replication_factor' : 3} AND DURABLE_WRITES = true;

create table if not exists test1.pojo_test3
(
 company text,
 department text,
 number int,
 first_name text,
 last_name text,
 age int,
 married boolean,
 height bigint,
 weight float,
 birth_date timestamp,
 phones blob,
 primary key ((company, department), number)
)
with comment = 'A most excellent and useful table' AND read_repair_chance = 0.2 and clustering order by (number desc);
```
不要忘了设置正确的`CLASSPATH`环境变量：

 1. 在CLASSPATH中包含Ignite Cassandra模块的jar文件（`ignite-cassandra-<version-number>.jar`）；
 2. 如果打算为部分自定义Java类使用`POJO`持久化策略，需要同时在CLASSPATH中包含带有这些类的jar文件。

## 5.负载测试
Ignite的Cassandra模块提供了一组负载测试，它可以模拟Ignite和Cassandra在自定义键/值类和持久化设定时的生产负载，因此使用这些负载测试就可以度量特定配置下的性能指标。

 - 一组自定义的键/值类；
 - 一组Ignite节点；
 - 一组Cassandra节点；

这种类型的度量有助于更好地理解系统的可度量性。

### 5.1.构建负载测试
Cassandra模块的负载测试是作为模块测试源代码的一部分提供的，因此首先需要从源代码构建Ignite二进制包。

从源代码构建Ignite二进制包之后，会发现在Cassandra模块目录下有`target/tests-package`目录以及`target/ignite-cassandra-tests-<version>.zip`，它是这个目录的zip压缩包。测试包包含了马上就可以用的Ignite Cassandra模块的负载测试应用，它的结构如下：

 - **bootstrap**：目录包括了AWS部署框架的引导脚本；
 - **lib**：目录包括了Ignite和Cassandra通信所有必要的**jar**文件，如果要为自定义的键/值类运行负载测试，需要为它们创建单独的**jar**文件然后把它放在这个目录下（下一章会详细描述）；
 - **settings**：目录包括了负载测试的配置设定，比如Ignite和Cassandra的连接细节，持久化配置等（下一章会详细描述）；
 - **cassandra-load-tests.bat**：MS Windows的shell脚本，可以在Cassandra集群上直接运行持久化负载测试。这个测试可以绕过Ignite集群在Cassandra集群上直接进行键/值的持久化操作来衡量性能。这非常有用，基于这个测试的结果，可以确定作为Ignite缓存的持久化层的Cassandra集群的合理容量。
 - **cassandra-load-tests.sh**：上述脚本的Linux版本；
 - **ignite-load-tests.bat**：MS Windows的shell脚本，在Ignite集群上执行持久化负载测试，这个测试可以度量使用Cassandra集群作为持久化层的Ignite集群的键/值操作的持久化性能。基于这个测试的结果，可以确定Ignite集群的合理容量；
 - **ignite-load-tests.sh**：上述脚本的Linux版本；
 - **jvm-opts.bat**：MS Windows的shell脚本，指定负载测试的JVM参数；
 - **jvm-opts.sh**：上述脚本的Linux版本；
 - **recreate-cassandra-artifacts.bat**：在运行负载测试前重新创建Cassandra构件（键空间和表）的shell脚本（由AWS环境部署脚本使用，因此无需手动运行它）；
 - **recreate-cassandra-artifacts.sh**：上述脚本的Linux版本；

从上述列出的脚本可以看出，实际上有两种类型的负载测试：

 - **Cassandra负载测试**：绕过ignite直接在Cassandra上执行所有的键/值持久化操作；
 - **Ignite负载测试**：在Ignite上使用合适的IgniteCache执行所有的键/值持久化操作；

下面看一下负载测试场景和配置细节。
### 5.2.负载测试场景
`Cassandra`和`Ignite`负载测试都使用相同的一组测试：

 1. 单个**写**操作负载测试：当调用缓存的`IgniteCache.put`方法时就会执行这样的操作；
 2. **批量写**操作负载测试：当调用缓存的`IgniteCache.putAll`方法时就会执行这样的操作；
 3. 单个**读**操作负载测试：当调用缓存的`IgniteCache.get`方法时就会执行这样的操作；
 4. **批量读**操作负载测试：当调用缓存的`IgniteCache.getAll`方法时就会执行这样的操作。

所有指定的负载测试都会按照给定的顺序一个一个按顺序执行。
### 5.3.负载测试配置
负载测试的配置是通过`settings`文件夹中的如下属性文件指定的：

 1. **log4j.properties**：指定负载测试的logger设置；
 2. **org/apache/ignite/tests/cassandra/connection.properties**：Cassandra连接的接触点设置（可以看下面的表格）；
 3. **org/apache/ignite/tests/cassandra/credentials.properties**：Cassandra连接的凭证（可以看下面的表格）;
 4. **ests.properties**:指定负载测试执行的配置信息（可以看下面的表格）。

`log4j.properties`文件非常简单，它就是`log4j`的logger配置，我们可以深入地了解下其它的配置文件。
**org/apache/ignite/tests/cassandra/connection.properties**

|属性|描述|
|---|---|
|contact.points|用作接触点的Cassandra节点的列表，逗号分隔，应该是这样的格式：**server-1[:port],server-2[:port],server-3[:port]**等等|

**org/apache/ignite/tests/cassandra/credentials.properties**

|属性|描述|
|---|---|
|admin.user|连接Cassandra的Admin用户名|
|admin.password|连接Cassandra的Admin密码|
|regular.user|连接Cassandra的常规用户名|
|regular.password|连接Cassandra的常规用户密码|

**tests.properties**

|属性|描述|
|---|---|
|bulk.operation.size|每个批处理操作试图操作的元素数量：`IgniteCache.getAll`, `IgniteCache.putAll`|
|load.tests.cache.name|用于负载测试的Ignite缓存名|
|load.tests.threads.count|用于每个负载测试的线程数|
|load.tests.warmup.period|在开始任何度量前每个负载测试的预热周期（毫秒）。|
|load.tests.execution.time|除了预热周期外，每个负载测试的执行时间（毫秒）。|
|load.tests.requests.latency|到Cassandra/Ignite的两个连续请求的延迟时间（毫秒）。|
|load.tests.persistence.settings|用于负载测试的Cassandra持久化配置的资源|
|load.tests.ignite.config|用于负载测试的Ignite集群连接配置的资源|
|load.tests.key.generator|Ignite缓存的键对象生成器|
|load.tests.value.generator|Ignite缓存的值对象生成器|

### 5.4.运行负载测试
运行负载测试前，要确保：

 1. Ignite缓存的所有节点都要配置为使用相同的Cassandra缓存存储配置。可以从测试源代码包的一个资源文件中找到一个远程Ignite节点配置的示例：`settings/org/apache/ignite/tests/persistence/primitive/ignite-remote-server-config.xml`，如果只打算使用Cassandra进行负载测试，可以忽略这一步；
 2. `tests.properties`的`load.tests.ignite.config`属性，指向了正确的Ignite客户端节点配置（它应该有相同的Cassandra连接和持久化配置，比如远程Ignite节点配置文件），如果只打算使用Cassandra进行负载测试，可以忽略这一步；
 3. Cassandra连接配置，在`org/apache/ignite/tests/cassandra/connection.properties`和`org/apache/ignite/tests/cassandra/credentials.properties`文件中正确指定；

之后，只要执行相应的shell脚本，就可以轻易地运行负载测试了：

 - **cassandra-load-tests.sh / cassandra-load-tests.bat**：直接在Cassandra集群上执行持久化负载测试的shell脚本。这个测试可以绕过Ignite集群，直接在Cassandra集群上度量键/值持久化操作的性能。这非常有用，基于这个测试的结果，可以确定作为Ignite缓存的持久化层的Cassandra集群的合理容量；
 - **ignite-load-tests.sh / ignite-load-tests.bat**：在Ignite集群上执行持久化负载测试的shell脚本，这个测试可以度量使用Cassandra集群作为持久化层的Ignite集群的键/值操作的持久化性能。基于这个测试的结果，可以确定Ignite集群的合理容量。

### 5.5.使用自定义的键/值类
如果使用自定义的键/值类用于负载测试，那么需要：

 1. 在`tests.properties`的`load.tests.key.generator`属性中指定自定义键类的生成器。**生成器**的想法非常简单，它负责生成特定类的实例，并且实现`org.apache.ignite.tests.load.Generator`接口的`public Object generate(long i)`方法，也可以找到如下的示例实现：
 - **org.apache.ignite.tests.load.IntGenerator**：生成`int`实例；
 - **rg.apache.ignite.tests.load.LongGenerator**：生成`long`实例；
 - **org.apache.ignite.tests.load.PersonIdGenerator**：生成自定义Ignite缓存键类`org.apache.ignite.tests.pojos.PersonId`的实例；
 - **org.apache.ignite.tests.load.PersonGenerator**：生成自定义Ignite缓存值类`org.apache.ignite.tests.pojos.Person`的实例；
 2. 在`tests.properties`的`load.tests.value.generator`属性中指定自定义值类的生成器。实际上它可能与前述提到的相同，但是它生成的是对应的自定义值对象而不是键对象；
 3. 对于自定义键/值类指定Cassandra持久化配置，将持久化配置文件放在`settings`文件夹，并且检查`tests.properties`中的`load.tests.persistence.settings`属性指向了自定义的持久化配置；
 4. 定义Ignite缓存配置使其使用自定义的持久化配置，并且检查`tests.properties`中的`load.tests.ignite.config`属性指向Ignite缓存配置文件；
 5. 创建包含自定义键/值类和对应**生成器**类的**jar**文件，然后将它们（还包括可能的第三方依赖）放在`lib`目录中。

这就是使用自定义类运行负载测试的所有步骤。
### 5.6.分析测试执行结果
负载测试的执行结果以`log4j`日志文件的形式提供，默认（如果没有修改`log4j.properties`文件）会有两个文件会显示测试执行的结果概要：

 1. **cassandra-load-tests.log**：包含了Cassandra负载测试执行结果的概要统计（如果执行的`cassandra-load-tests.sh`或者`cassandra-load-tests.bat`shell脚本）；
 2. **ignite-load-tests.log**：包含了Ignite负载测试执行结果的概要统计（如果执行的`ignite-load-tests.sh`或者`ignite-load-tests.bat`shell脚本）。

下面是一个`gnite-load-tests.log`文件的示例（Cassandra负载测试的日志看上去差不多）：
```
19:53:37,303  INFO [main] - Ignite load tests execution started
19:53:37,305  INFO [main] - Running WRITE test
19:53:37,305  INFO [main] - Setting up load tests driver
19:53:42,352  INFO [main] - Load tests driver setup successfully completed
19:53:42,355  INFO [main] - Starting workers
19:53:42,384  INFO [main] - Workers started
19:53:42,385  INFO [main] - Waiting for workers to complete
20:01:42,398  INFO [main] - Worker WRITE-worker-0 successfully completed
20:01:42,407  INFO [main] - Worker WRITE-worker-1 successfully completed
20:01:42,452  INFO [main] - Worker WRITE-worker-2 successfully completed
20:01:42,453  INFO [main] - Worker WRITE-worker-3 successfully completed
20:01:42,453  INFO [main] - Worker WRITE-worker-4 successfully completed
20:01:42,453  INFO [main] - Worker WRITE-worker-5 successfully completed
20:01:42,453  INFO [main] - Worker WRITE-worker-6 successfully completed
20:01:42,453  INFO [main] - Worker WRITE-worker-7 successfully completed
20:01:42,453  INFO [main] - Worker WRITE-worker-8 successfully completed
20:01:42,453  INFO [main] - Worker WRITE-worker-9 successfully completed
20:01:42,453  INFO [main] - Worker WRITE-worker-10 successfully completed
20:01:42,453  INFO [main] - Worker WRITE-worker-11 successfully completed
20:01:42,453  INFO [main] - Worker WRITE-worker-12 successfully completed
20:01:42,453  INFO [main] - Worker WRITE-worker-13 successfully completed
20:01:42,453  INFO [main] - Worker WRITE-worker-14 successfully completed
20:01:42,453  INFO [main] - Worker WRITE-worker-15 successfully completed
20:01:42,454  INFO [main] - Worker WRITE-worker-16 successfully completed
20:01:42,454  INFO [main] - Worker WRITE-worker-17 successfully completed
20:01:42,639  INFO [main] - Worker WRITE-worker-18 successfully completed
20:01:42,639  INFO [main] - Worker WRITE-worker-19 successfully completed
20:01:42,639  INFO [main] - WRITE test execution successfully completed.
20:01:42,639  INFO [main] -
-------------------------------------------------
WRITE test statistics
WRITE messages: 1681780
WRITE errors: 0, 0.00%
WRITE speed: 5597 msg/sec
-------------------------------------------------
20:01:42,695  INFO [main] - Running BULK_WRITE test
20:01:42,695  INFO [main] - Setting up load tests driver
20:01:45,074  INFO [main] - Load tests driver setup successfully completed
20:01:45,074  INFO [main] - Starting workers
20:01:45,093  INFO [main] - Workers started
20:01:45,094  INFO [main] - Waiting for workers to complete
20:09:45,084  INFO [main] - Worker BULK_WRITE-worker-0 successfully completed
20:09:45,105  INFO [main] - Worker BULK_WRITE-worker-1 successfully completed
20:09:45,105  INFO [main] - Worker BULK_WRITE-worker-2 successfully completed
20:09:45,105  INFO [main] - Worker BULK_WRITE-worker-3 successfully completed
20:09:45,105  INFO [main] - Worker BULK_WRITE-worker-4 successfully completed
20:09:45,105  INFO [main] - Worker BULK_WRITE-worker-5 successfully completed
20:09:45,105  INFO [main] - Worker BULK_WRITE-worker-6 successfully completed
20:09:45,105  INFO [main] - Worker BULK_WRITE-worker-7 successfully completed
20:09:45,105  INFO [main] - Worker BULK_WRITE-worker-8 successfully completed
20:09:45,105  INFO [main] - Worker BULK_WRITE-worker-9 successfully completed
20:09:45,105  INFO [main] - Worker BULK_WRITE-worker-10 successfully completed
20:09:45,105  INFO [main] - Worker BULK_WRITE-worker-11 successfully completed
20:09:45,105  INFO [main] - Worker BULK_WRITE-worker-12 successfully completed
20:09:45,105  INFO [main] - Worker BULK_WRITE-worker-13 successfully completed
20:09:45,254  INFO [main] - Worker BULK_WRITE-worker-14 successfully completed
20:09:45,254  INFO [main] - Worker BULK_WRITE-worker-15 successfully completed
20:09:45,254  INFO [main] - Worker BULK_WRITE-worker-16 successfully completed
20:09:45,258  INFO [main] - Worker BULK_WRITE-worker-17 successfully completed
20:09:45,258  INFO [main] - Worker BULK_WRITE-worker-18 successfully completed
20:09:45,258  INFO [main] - Worker BULK_WRITE-worker-19 successfully completed
20:09:45,258  INFO [main] - BULK_WRITE test execution successfully completed.
20:09:45,258  INFO [main] -
-------------------------------------------------
BULK_WRITE test statistics
BULK_WRITE messages: 2021500
BULK_WRITE errors: 0, 0.00%
BULK_WRITE speed: 6748 msg/sec
-------------------------------------------------
20:09:45,477  INFO [main] - Running READ test
20:09:45,477  INFO [main] - Setting up load tests driver
20:09:48,626  INFO [main] - Load tests driver setup successfully completed
20:09:48,626  INFO [main] - Starting workers
20:09:48,631  INFO [main] - Workers started
20:09:48,631  INFO [main] - Waiting for workers to complete
20:17:57,128  INFO [main] - Worker READ-worker-0 successfully completed
20:17:57,128  INFO [main] - Worker READ-worker-1 successfully completed
20:17:57,128  INFO [main] - Worker READ-worker-2 successfully completed
20:17:57,128  INFO [main] - Worker READ-worker-3 successfully completed
20:17:57,145  INFO [main] - Worker READ-worker-4 successfully completed
20:17:57,145  INFO [main] - Worker READ-worker-5 successfully completed
20:17:57,145  INFO [main] - Worker READ-worker-6 successfully completed
20:17:57,145  INFO [main] - Worker READ-worker-7 successfully completed
20:17:57,145  INFO [main] - Worker READ-worker-8 successfully completed
20:17:57,145  INFO [main] - Worker READ-worker-9 successfully completed
20:17:57,145  INFO [main] - Worker READ-worker-10 successfully completed
20:17:57,145  INFO [main] - Worker READ-worker-11 successfully completed
20:17:57,145  INFO [main] - Worker READ-worker-12 successfully completed
20:17:57,145  INFO [main] - Worker READ-worker-13 successfully completed
20:17:57,145  INFO [main] - Worker READ-worker-14 successfully completed
20:17:57,145  INFO [main] - Worker READ-worker-15 successfully completed
20:17:57,145  INFO [main] - Worker READ-worker-16 successfully completed
20:17:57,145  INFO [main] - Worker READ-worker-17 successfully completed
20:17:57,145  INFO [main] - Worker READ-worker-18 successfully completed
20:17:57,145  INFO [main] - Worker READ-worker-19 successfully completed
20:17:57,145  INFO [main] - READ test execution successfully completed.
20:17:57,145  INFO [main] -
-------------------------------------------------
READ test statistics
READ messages: 1974957
READ errors: 0, 0.00%
READ speed: 6404 msg/sec
-------------------------------------------------
20:17:57,207  INFO [main] - Running BULK_READ test
20:17:57,207  INFO [main] - Setting up load tests driver
20:17:59,495  INFO [main] - Load tests driver setup successfully completed
20:17:59,495  INFO [main] - Starting workers
20:17:59,515  INFO [main] - Workers started
20:17:59,515  INFO [main] - Waiting for workers to complete
20:25:59,568  INFO [main] - Worker BULK_READ-worker-0 successfully completed
20:25:59,568  INFO [main] - Worker BULK_READ-worker-1 successfully completed
20:25:59,568  INFO [main] - Worker BULK_READ-worker-2 successfully completed
20:25:59,585  INFO [main] - Worker BULK_READ-worker-3 successfully completed
20:25:59,585  INFO [main] - Worker BULK_READ-worker-4 successfully completed
20:25:59,585  INFO [main] - Worker BULK_READ-worker-5 successfully completed
20:25:59,585  INFO [main] - Worker BULK_READ-worker-6 successfully completed
20:25:59,585  INFO [main] - Worker BULK_READ-worker-7 successfully completed
20:25:59,585  INFO [main] - Worker BULK_READ-worker-8 successfully completed
20:25:59,585  INFO [main] - Worker BULK_READ-worker-9 successfully completed
20:25:59,585  INFO [main] - Worker BULK_READ-worker-10 successfully completed
20:25:59,585  INFO [main] - Worker BULK_READ-worker-11 successfully completed
20:25:59,585  INFO [main] - Worker BULK_READ-worker-12 successfully completed
20:25:59,585  INFO [main] - Worker BULK_READ-worker-13 successfully completed
20:25:59,585  INFO [main] - Worker BULK_READ-worker-14 successfully completed
20:25:59,586  INFO [main] - Worker BULK_READ-worker-15 successfully completed
20:25:59,586  INFO [main] - Worker BULK_READ-worker-16 successfully completed
20:25:59,586  INFO [main] - Worker BULK_READ-worker-17 successfully completed
20:25:59,586  INFO [main] - Worker BULK_READ-worker-18 successfully completed
20:25:59,586  INFO [main] - Worker BULK_READ-worker-19 successfully completed
20:25:59,586  INFO [main] - BULK_READ test execution successfully completed.
20:25:59,586  INFO [main] -
-------------------------------------------------
BULK_READ test statistics
BULK_READ messages: 3832300
BULK_READ errors: 0, 0.00%
BULK_READ speed: 12790 msg/sec
-------------------------------------------------
20:25:59,653  INFO [main] - Ignite load tests execution completed
```
根据这个日志，可以发现：

 - 单个**写**操作的平均速度是`5597条/s`;
 - **批量写**操作的平均速度是`6748条/s`;
 - 单个**读**操作的平均速度是`6404条/s`;
 - **批量读**操作的平均速度是`12790条/s`;
 - 每种类型的测试中没有发生错误，当模拟负载时，它会比当前的Ignite/Cassandra基础设施能处理的要高，部分`写/批量写/读/批量读`操作可能会失败，并且会反映在测试统计的错误数字上（以及百分比）。

因此要为集群模拟真实的负载，只需要从多个客户端节点同时运行同一个负载测试，然后统计所有节点每个测试的平均速度，这就是当前的配置能处理的`写/批量写/读/批量读`操作的平均速度。

> 如果打算使用[AWS](https://aws.amazon.com/products/?nc2=h_ql_sf_ls)进行负载测试，只需要使用AWS部署，它会自动地考虑所有的路由（创建和引导必要的用于`Ignite/Cassandra/Tests`集群的EC2实例，运行负载测试以及等待它们完成，从每个EC2实例中收集所有的负载测试统计并且产生总结报告）。作为额外的好处，还可以得到`Cassandra/Ignite/Tests`集群的基于[Ganglia](http://ganglia.info/)的监控，它可以看到集群在高负载时都发生了什么。

> 建议运行负载测试之前执行**recreate-cassandra-artifacts.sh/recreate-cassandra-artifacts.bat**脚本。这个脚本会清理之前的负载测试执行中产生的所有Cassandra键空间/表，否则统计可能不是很精确，如果使用AWS，这个会自动做。

## 6.单元测试
Ignite的Cassandra模块提供了一组单元测试用例，它可以用来测试下面的功能是否正常：

 1. 绕过Ignite，通过直接序列化/反序列化Java基本类型（int，float，long等）到Cassandra测试`PRIMITIVE`持久化策略；
 2. 绕过Ignite，使用Java和Kryo序列化系统，通过直接序列化/反序列化Java基本类型和自定义Java类型到Cassandra测试`BLOB`持久化策略；
 3. 绕过Ignite，通过直接序列化/反序列化自定义Java类型到Cassandra测试`POJO`持久化策略；
 4. 透过Ignite缓存测试`PRIMITIVE`持久化策略；
 5. 透过Ignite缓存测试`BLOB`持久化策略；
 6. 透过Ignite缓存测试`POJO`持久化策略；
 7. 通过`loadCache`操作预热Ignite缓存。
# 使用SQL
## 1.介绍
Ignite是一个兼容于ANSI-99、可水平扩展和容错的分布式SQL数据库，根据使用场景，数据在整个集群中是以分区或者复制的模式进行分发。

作为SQL数据库，Ignite支持所有DML命令，包括SELECT、UPDATE、INSERT和DELETE语句，并且还实现了与分布式系统相关的DDL命令的子集。

在外部工具和应用中通过使用[JDBC](#_8-jdbc驱动)或[ODBC](#_10-odbc驱动)驱动，可以像处理任何其他支持SQL的存储一样与Ignite交互。Java、.NET和C++开发者还可以使用[原生SQL API](#_4-使用sql-api)。

在内部，SQL表具有与[键-值缓存](/doc/java/DataModeling.md#_1-2-键-值缓存与sql表)相同的数据结构，这意味着可以更改数据的分区分布，并利用[关联并置](/doc/java/DataModeling.md#_3-关联并置)技术获得更好的性能。

Ignite的SQL引擎使用H2数据库来解析和优化查询并生成执行计划。
### 1.1.分布式查询
对[分区表](/doc/java/DataModeling.md#_2-2-1-partitioned)的查询以分布式方式执行：

 - 对该查询进行解析，并分为多个`映射`查询和一个`汇总`查询；
 - 所有映射查询都在数据所在的所有节点上执行；
 - 所有节点都向查询发起方提供本地执行的结果集，查询发起方会将各个结果集汇总为最终结果。

也可以强制查询在本地进行处理，即在执行查询的节点上的数据子集上执行。
### 1.2.本地查询
如果在[复制表](/doc/java/DataModeling.md#_2-2-2-replicated)上执行查询，将会在本地数据上执行。
## 2.理解模式
### 2.1.概述
Ignite具有若干默认模式，并支持创建自定义模式。

默认两个模式可用：

 - `SYS`模式：其中包含许多和集群各种信息有关的系统视图，不能在此模式中创建表，更多信息请参见[系统视图](/doc/java/Monitoring.md#_6-系统视图)章节的介绍；
 - `PUBLIC`模式：未指定模式时的默认模式。

在以下场景中，可以创建自定义模式：

 - 可以在集群配置中指定自定义模式，请参见[自定义模式](#_2-3-自定义模式)；
 - Ignite为通过编程接口或XML配置创建的每个缓存创建一个模式，具体请参见[缓存和模式名](#_2-4-缓存和模式名)。

### 2.2.PUBLIC模式
如果需要且未指定模式时，默认会使用`PUBLIC`模式。例如，当通过JDBC接入集群而未显式设置模式时，就会使用`PUBLIC`模式。
### 2.3.自定义模式
可以通过`IgniteConfiguration`的`sqlSchemas`属性设置自定义模式，启动集群之前在配置中指定模式列表，然后在运行时就可以在这些模式中创建对象。

下面是带有两个自定义模式的配置示例：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="sqlConfiguration">
        <bean class="org.apache.ignite.configuration.SqlConfiguration">
            <property name="sqlSchemas">
                <list>
                    <value>MY_SCHEMA</value>
                    <value>MY_SECOND_SCHEMA</value>
                </list>
            </property>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

SqlConfiguration sqlCfg = new SqlConfiguration();

sqlCfg.setSqlSchemas("MY_SCHEMA", "MY_SECOND_SCHEMA" );

cfg.setSqlConfiguration(sqlCfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    SqlSchemas = new[]
    {
        "MY_SCHEMA",
        "MY_SECOND_SCHEMA"
    }
};
```
</Tab>
</Tabs>

要接入指定的模式，比如通过JDBC驱动，那么可以在连接串中指定模式名：
```
jdbc:ignite:thin://127.0.0.1/MY_SCHEMA
```
### 2.4.缓存和模式名
当创建带有[可查询字段](#_4-1-配置可查询字段)的缓存时，可以通过[SQL API](#_4-使用sql-api)来对缓存的数据进行维护，在SQL层面，每个缓存对应一个独立的模式，模式的名字等同于缓存的名字。

简单来说，当通过SQL API创建了一个表，可以通过编程接口将其当做键-值缓存访问，而对应的缓存名，可以通过`CREATE TABLE`语句的`WITH`子句中的`CACHE_NAME`参数进行指定：
```sql
CREATE TABLE City (
  ID INT(11),
  Name CHAR(35),
  CountryCode CHAR(3),
  District CHAR(20),
  Population INT(11),
  PRIMARY KEY (ID, CountryCode)
) WITH "backups=1, CACHE_NAME=City";
```
更多信息请参见[CREATE TABLE](/doc/java/SQLReference.md#_2-1-create-table)章节的介绍。

如果未指定这个参数，缓存名定义为如下格式（大写格式）：
```
SQL_<SCHEMA_NAME>_<TABLE_NAME>
```
## 3.定义索引
除了常规的DDL命令，比如CREATE/DROP INDEX，开发者还可以使用[SQL API](#_4-使用sql-api)来定义索引。

::: tip 提示
索引的功能是通过`ignite-indexing`模块提供的，所以如果通过Java代码启动Ignite，需要[将这个模块加入类路径](/doc/java/SettingUp.md#_2-7-启用模块)。
:::
Ignite会自动为每个缓存的主键和关联键字段创建索引，当在值对象的字段上创建索引时，Ignite会创建一个由索引字段和主键字段组成的组合索引。在SQL的角度，该索引由2列组成：索引列和主键列。
### 3.1.使用SQL创建索引
具体请参见[CREATE INDEX](/doc/java/SQLReference.md#_2-4-create-index)章节的内容。
### 3.2.使用注解配置索引
索引和可查询字段，在代码上，可以通过`@QuerySqlField`注解进行配置。在下面的示例中，Ignite的SQL引擎会在`id`和`salary`字段上创建索引：

<Tabs>
<Tab title="Java">

```java
public class Person implements Serializable {
    /** Indexed field. Will be visible to the SQL engine. */
    @QuerySqlField(index = true)
    private long id;

    /** Queryable field. Will be visible to the SQL engine. */
    @QuerySqlField
    private String name;

    /** Will NOT be visible to the SQL engine. */
    private int age;

    /**
     * Indexed field sorted in descending order. Will be visible to the SQL engine.
     */
    @QuerySqlField(index = true, descending = true)
    private float salary;
}
```
</Tab>

<Tab title="C#/.NET">

```csharp
class Person
{
    // Indexed field. Will be visible to the SQL engine.
    [QuerySqlField(IsIndexed = true)] public long Id;

    //Queryable field. Will be visible to the SQL engine
    [QuerySqlField] public string Name;

    //Will NOT be visible to the SQL engine.
    public int Age;

    /** Indexed field sorted in descending order.
      * Will be visible to the SQL engine. */
    [QuerySqlField(IsIndexed = true, IsDescending = true)]
    public float Salary;
}
```
</Tab>
</Tabs>

SQL查询中，类型名会被用作表名，这时，表名为`Person`（使用的模式名和定义见[模式](#_2-理解模式)章节的介绍）。

`id`和`salary`都是索引字段，`id`为生序排列，而`salary`为倒序排列。

如果不希望索引一个字段，但是希望在SQL查询中使用该列，那么该字段需要加上该注解，但是不需要`index = true`参数，这样的字段叫做*可查询字段*，在上例中，`name`定义为[可查询字段](#_4-1-配置可查询字段)。

`age`字段既不是可查询字段，也不是一个索引字段，因此在SQL查询中是无法访问的。

定义索引字段后，还需要[注册索引类型](#_3-2-2-注册索引类型)。
::: tip 运行时更新索引和可查询字段
如果希望运行时管理索引或者对象字段的可见性，需要使用[CREATE/DROP INDEX](/doc/java/SQLReference.md#_2-4-create-index)命令。
:::
#### 3.2.1.索引嵌套对象
使用注解，对象的嵌套字段也可以被索引和查询。比如，考虑一个`Person`对象内部有一个`Address`对象：
```java
public class Person {
    /** Indexed field. Will be visible for SQL engine. */
    @QuerySqlField(index = true)
    private long id;

    /** Queryable field. Will be visible for SQL engine. */
    @QuerySqlField
    private String name;

    /** Will NOT be visible for SQL engine. */
    private int age;

    /** Indexed field. Will be visible for SQL engine. */
    @QuerySqlField(index = true)
    private Address address;
}
```
而`Address`类的结构如下：
```java
public class Address {
    /** Indexed field. Will be visible for SQL engine. */
    @QuerySqlField (index = true)
    private String street;

    /** Indexed field. Will be visible for SQL engine. */
    @QuerySqlField(index = true)
    private int zip;
}
```
在上面的示例中，`Address`类的所有字段都加上了`@QuerySqlField(index = true)`注解，`Person`类的`Address`对象，也加上了该注解。

这样就可以执行下面的SQL语句：
```java
QueryCursor<List<?>> cursor = personCache.query(new SqlFieldsQuery( "select * from Person where street = 'street1'"));
```
注意在SQL语句的WHERE条件中不需要指定`address.street`，这是因为`Address`类的字段会被合并到`Person`中，这样就可以简单地在查询中直接访问`Address`中的字段。
::: warning 警告
如果在嵌套对象上创建了索引，就不能在这个表上执行UPDATE或者INSERT语句。
:::
#### 3.2.2.注册索引类型
定义索引和可查询字段之后，需要将它们及其所属的对象类型一起注册到SQL引擎中。

要指定应建立索引的类型，需要在`CacheConfiguration.setIndexedTypes()`方法中传递相应的键-值对，如下例所示：

<Tabs>
<Tab title="Java">

```java
// Preparing configuration.
CacheConfiguration<Long, Person> ccfg = new CacheConfiguration<>();

// Registering indexed type.
ccfg.setIndexedTypes(Long.class, Person.class);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var ccfg = new CacheConfiguration
{
    QueryEntities = new[]
    {
        new QueryEntity(typeof(long), typeof(Person))
    }
};
```
</Tab>
</Tabs>

此方法仅接受成对的类型：一个键类，一个值类，基本类型需要用包装器类型传入。

::: tip 预定义字段
除了用`@QuerySqlField`注解标注的所有字段，每个表都有两个特别的预定义字段：`_key`和`_val`，它表示到整个键对象和值对象的引用。这很有用，比如当它们中的一个是基本类型并且希望用它的值进行过滤时，执行`SELECT * FROM Person WHERE _key = 100`查询即可。
:::
::: tip 注意
因为有[二进制编组器](/doc/java/UsingKeyValueApi.md#_2-使用二进制对象)，不需要将索引类型类加入集群节点的类路径中，SQL引擎不需要对象反序列化就可以钻取索引和可查询字段的值。
:::
#### 3.2.3.组合索引
当查询条件复杂时可以使用多字段索引来加快查询的速度，这时可以用`@QuerySqlField.Group`注解。如果希望一个字段参与多个组合索引时也可以将多个`@QuerySqlField.Group`注解加入`orderedGroups`中。

比如，下面的`Person`类中`age`字段加入了名为`age_salary_idx`的组合索引，它的分组序号是0并且降序排列，同一个组合索引中还有一个字段`salary`,它的分组序号是3并且升序排列。最重要的是`salary`字段还是一个单列索引(除了`orderedGroups`声明之外，还加上了`index = true`)。分组中的`order`不需要是什么特别的数值，它只是用于分组内的字段排序。

<Tabs>
<Tab title="Java">

```java
public class Person implements Serializable {
    /** Indexed in a group index with "salary". */
    @QuerySqlField(orderedGroups = { @QuerySqlField.Group(name = "age_salary_idx", order = 0, descending = true) })

    private int age;

    /** Indexed separately and in a group index with "age". */
    @QuerySqlField(index = true, orderedGroups = { @QuerySqlField.Group(name = "age_salary_idx", order = 3) })
    private double salary;
}
```
</Tab>

<Tab title="C#/.NET">

```csharp
class Person
{
    [QuerySqlField(IndexGroups = new[] {"age_salary_idx"})]
    public int Age;

    [QuerySqlField(IsIndexed = true, IndexGroups = new[] {"age_salary_idx"})]
    public double Salary;
}
```
</Tab>
</Tabs>

::: tip 注意
将`@QuerySqlField.Group`放在`@QuerySqlField(orderedGroups={...})`外面是无效的。
:::
### 3.3.使用查询实体配置索引
索引和字段也可以通过`org.apache.ignite.cache.QueryEntity`进行配置，它便于利用Spring进行基于XML的配置。

在上面基于注解的配置中涉及的所有概念，对于基于`QueryEntity`的方式也都有效，此外，如果类型的字段通过`@QuerySqlField`进行了配置并且通过`CacheConfiguration.setIndexedTypes`注册过的，在内部也会被转换为查询实体。

下面的示例显示的是如何定义单一字段索引、组合索引和可查询字段：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration" id="ignite.cfg">
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            <property name="name" value="Person"/>
            <!-- Configure query entities -->
            <property name="queryEntities">
                <list>
                    <bean class="org.apache.ignite.cache.QueryEntity">
                        <!-- Setting  the type of the key -->
                        <property name="keyType" value="java.lang.Long"/>

                        <property name="keyFieldName" value="id"/>

                        <!-- Setting type of the value -->
                        <property name="valueType" value="org.apache.ignite.examples.Person"/>

                        <!-- Defining fields that will be either indexed or queryable.
                             Indexed fields are added to the 'indexes' list below.-->
                        <property name="fields">
                            <map>
                                <entry key="id" value="java.lang.Long"/>
                                <entry key="name" value="java.lang.String"/>
                                <entry key="salary" value="java.lang.Float "/>
                            </map>
                        </property>
                        <!-- Defining indexed fields.-->
                        <property name="indexes">
                            <list>
                                <!-- Single field (aka. column) index -->
                                <bean class="org.apache.ignite.cache.QueryIndex">
                                    <constructor-arg value="name"/>
                                </bean>
                                <!-- Group index. -->
                                <bean class="org.apache.ignite.cache.QueryIndex">
                                    <constructor-arg>
                                        <list>
                                            <value>id</value>
                                            <value>salary</value>
                                        </list>
                                    </constructor-arg>
                                    <constructor-arg value="SORTED"/>
                                </bean>
                            </list>
                        </property>
                    </bean>
                </list>
            </property>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
CacheConfiguration<Long, Person> cache = new CacheConfiguration<Long, Person>("myCache");

QueryEntity queryEntity = new QueryEntity();

queryEntity.setKeyFieldName("id").setKeyType(Long.class.getName()).setValueType(Person.class.getName());

LinkedHashMap<String, String> fields = new LinkedHashMap<>();
fields.put("id", "java.lang.Long");
fields.put("name", "java.lang.String");
fields.put("salary", "java.lang.Long");

queryEntity.setFields(fields);

queryEntity.setIndexes(Arrays.asList(new QueryIndex("name"),
        new QueryIndex(Arrays.asList("id", "salary"), QueryIndexType.SORTED)));

cache.setQueryEntities(Arrays.asList(queryEntity));
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cacheCfg = new CacheConfiguration
{
    Name = "myCache",
    QueryEntities = new[]
    {
        new QueryEntity
        {
            KeyType = typeof(long),
            KeyFieldName = "id",
            ValueType = typeof(dotnet_helloworld.Person),
            Fields = new[]
            {
                new QueryField
                {
                    Name = "id",
                    FieldType = typeof(long)
                },
                new QueryField
                {
                    Name = "name",
                    FieldType = typeof(string)
                },
                new QueryField
                {
                    Name = "salary",
                    FieldType = typeof(long)
                },
            },
            Indexes = new[]
            {
                new QueryIndex("name"),
                new QueryIndex(false, QueryIndexType.Sorted, new[] {"id", "salary"})
            }
        }
    }
};
Ignition.Start(new IgniteConfiguration
{
    CacheConfiguration = new[] {cacheCfg}
});
```
</Tab>
</Tabs>

SQL查询中会使用`valueType`的简称作为表名，这时，表名为`Person`（模式名的用法和定义请参见[理解模式](#_2-理解模式)章节的内容）。

QueryEntity定义之后，就可以执行下面的查询了：
```java
SqlFieldsQuery qry = new SqlFieldsQuery("SELECT id, name FROM Person" + "WHERE id > 1500 LIMIT 10");
```
::: tip 运行时更新索引和可查询字段
如果希望运行时管理索引或者对象字段的可见性，需要使用[CREATE/DROP INDEX](/doc/java/SQLReference.md#_2-4-create-index)命令。
:::
### 3.4.配置索引内联值
正确的索引内联值有助于增加索引字段上的查询速度，关于如何选择正确的内联值，请参见[增加索引内联值](/doc/java/PerformanceTroubleshooting.md#_4-8-增加索引内联值)章节的介绍。

大多数情况下，只需要为可变长度字段的索引设置内联值，比如字符串或者数组，默认值是10。

可通过如下方式修改默认值：

 - 单独为每个索引配置内联值；
 - 通过`CacheConfiguration.sqlIndexMaxInlineSize`属性为缓存内的所有索引配置内联值；
 - 通过`IGNITE_MAX_INDEX_PAYLOAD_SIZE`系统属性为集群内的所有索引配置内联值。

配置将按照上面的顺序依次生效。

可以为每个索引单独配置内联值，这会覆盖默认值。如果要为开发者定义的索引设置内联值，可以用下面的方法之一，该值以字节数为单位。

**注解方式**

<Tabs>
<Tab title="Java">

```java
@QuerySqlField(index = true, inlineSize = 13)
private String country;
```
</Tab>

<Tab title="C#/.NET">

```csharp
[QuerySqlField(IsIndexed = true, IndexInlineSize = 13)]
public string Country { get; set; }
```
</Tab>
</Tabs>

**QueryEntity方式**

<Tabs>
<Tab title="Java">

```java
QueryIndex idx = new QueryIndex("country");
idx.setInlineSize(13);
queryEntity.setIndexes(Arrays.asList(idx));
```
</Tab>

<Tab title="C#/.NET">

```csharp
var qe = new QueryEntity
{
    Indexes = new[]
    {
        new QueryIndex
        {
            InlineSize = 13
        }
    }
};
```
</Tab>
</Tabs>

**CREATE INDEX命令**

如果使用的是`CREATE INDEX`命令，那么可以使用`INLINE_SIZE`选项来配置内联值：
```sql
create index country_idx on Person (country) INLINE_SIZE 13;
```
### 3.5.自定义键
如果只使用预定义的SQL数据类型作为缓存键，那么就没必要对和DML相关的配置做额外的操作，这些数据类型在`GridQueryProcessor#SQL_TYPES`常量中进行定义，列举如下：

 - 所有的基本类型及其包装器，除了`char`和`Character`；
 - `String`;
 - `BigDecimal`;
 - `byte[]`;
 - `java.util.Date`, `java.sql.Date`, `java.sql.Timestamp`;
 - `java.util.UUID`。

不过如果决定引入复杂的自定义缓存键，那么在DML语句中要指向这些字段就需要：

 - 在`QueryEntity`中定义这些字段，与在值对象中配置字段一样；
 - 使用新的配置参数`QueryEntitty.setKeyFields(..)`来对键和值进行区分。

下面的例子展示了如何实现：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            <property name="name" value="personCache"/>
            <!-- Configure query entities -->
            <property name="queryEntities">
                <list>
                    <bean class="org.apache.ignite.cache.QueryEntity">
                        <!-- Registering key's class. -->
                        <property name="keyType" value="CustomKey"/>
                        <!-- Registering value's class. -->
                        <property name="valueType" value="org.apache.ignite.examples.Person"/>
                        <!-- Defining all the fields that will be accessible from DML. -->
                        <property name="fields">
                            <map>
                                <entry key="firstName" value="java.lang.String"/>
                                <entry key="lastName" value="java.lang.String"/>
                                <entry key="intKeyField" value="java.lang.Integer"/>
                                <entry key="strKeyField" value="java.lang.String"/>
                            </map>
                        </property>
                        <!-- Defining the subset of key's fields -->
                        <property name="keyFields">
                            <set>
                                <value>intKeyField</value>
                                <value>strKeyField</value>
                            </set>
                        </property>
                    </bean>
                </list>
            </property>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
// Preparing cache configuration.
CacheConfiguration<Long, Person> cacheCfg = new CacheConfiguration<Long, Person>("personCache");

// Creating the query entity.
QueryEntity entity = new QueryEntity("CustomKey", "Person");

// Listing all the queryable fields.
LinkedHashMap<String, String> fields = new LinkedHashMap<>();

fields.put("intKeyField", Integer.class.getName());
fields.put("strKeyField", String.class.getName());

fields.put("firstName", String.class.getName());
fields.put("lastName", String.class.getName());

entity.setFields(fields);

// Listing a subset of the fields that belong to the key.
Set<String> keyFlds = new HashSet<>();

keyFlds.add("intKeyField");
keyFlds.add("strKeyField");

entity.setKeyFields(keyFlds);

// End of new settings, nothing else here is DML related

entity.setIndexes(Collections.<QueryIndex>emptyList());

cacheCfg.setQueryEntities(Collections.singletonList(entity));

ignite.createCache(cacheCfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var ccfg = new CacheConfiguration
{
    Name = "personCache",
    QueryEntities = new[]
    {
        new QueryEntity
        {
            KeyTypeName = "CustomKey",
            ValueTypeName = "Person",
            Fields = new[]
            {
                new QueryField
                {
                    Name = "intKeyField",
                    FieldType = typeof(int),
                    IsKeyField = true
                },
                new QueryField
                {
                    Name = "strKeyField",
                    FieldType = typeof(string),
                    IsKeyField = true
                },
                new QueryField
                {
                    Name = "firstName",
                    FieldType = typeof(string)
                },
                new QueryField
                {
                    Name = "lastName",
                    FieldType = typeof(string)
                }
            }
        },
    }
};
```
</Tab>
</Tabs>

::: tip 哈希值自动计算和equals实现
如果自定义键可以被序列化为二进制形式，那么Ignite会自动进行哈希值的计算并且实现`equals`方法。

但是，如果键类型是`Externalizable`类型，那么就无法序列化为二进制形式，那么就需要自行实现`hashCode`和`equals`方法，具体请参见[使用二进制对象](/doc/java/UsingKeyValueApi.md#_2-使用二进制对象)章节的介绍。
:::
## 4.使用SQL API
除了使用JDBC驱动，Java开发者还可以使用Ignite的SQL API来访问和修改Ignite中存储的数据。

`SqlFieldsQuery`类是执行SQL查询和处理结果集的接口，`SqlFieldsQuery`通过`IgniteCache.query(SqlFieldsQuery)`方法执行，然后会返回一个游标。
### 4.1.配置可查询字段
如果希望使用SQL语句来查询缓存，需要定义值对象的哪些字段是可查询的，可查询字段是数据模型中SQL引擎可以处理的字段。

::: tip 提示
如果使用JDBC或者SQL工具建表，则不需要定义可查询字段。
:::
::: tip 提示
索引的功能是通过`ignite-indexing`模块提供的，所以如果通过Java代码启动Ignite，需要[将这个模块加入类路径](/doc/java/SettingUp.md#_2-7-启用模块)。
:::
在Java中，可查询字段可以通过两种方式来定义：

 - 使用注解；
 - 通过查询实体定义。

#### 4.1.1.@QuerySqlField注解
要让某个字段可查询，需要在值类定义的对应字段上加注`@QuerySqlField`注解，然后调用`CacheConfiguration.setIndexedTypes(…​)`方法。

<Tabs>
<Tab title="Java">

```java
class Person implements Serializable {
    /** Indexed field. Will be visible to the SQL engine. */
    @QuerySqlField(index = true)
    private long id;

    /** Queryable field. Will be visible to the SQL engine. */
    @QuerySqlField
    private String name;

    /** Will NOT be visible to the SQL engine. */
    private int age;

    /**
     * Indexed field sorted in descending order. Will be visible to the SQL engine.
     */
    @QuerySqlField(index = true, descending = true)
    private float salary;
}

public static void main(String[] args) {
    Ignite ignite = Ignition.start();
    CacheConfiguration<Long, Person> personCacheCfg = new CacheConfiguration<Long, Person>();
    personCacheCfg.setName("Person");

    personCacheCfg.setIndexedTypes(Long.class, Person.class);
    IgniteCache<Long, Person> cache = ignite.createCache(personCacheCfg);
}
```
</Tab>

<Tab title="C#/.NET">

```csharp
class Person
{
    // Indexed field. Will be visible to the SQL engine.
    [QuerySqlField(IsIndexed = true)] public long Id;

    //Queryable field. Will be visible to the SQL engine
    [QuerySqlField] public string Name;

    //Will NOT be visible to the SQL engine.
    public int Age;

    /**
      * Indexed field sorted in descending order.
      * Will be visible to the SQL engine.
    */
    [QuerySqlField(IsIndexed = true, IsDescending = true)]
    public float Salary;
}

public static void SqlQueryFieldDemo()
{
    var cacheCfg = new CacheConfiguration
    {
        Name = "cacheName",
        QueryEntities = new[]
        {
            new QueryEntity(typeof(int), typeof(Person))
        }
    };

    var ignite = Ignition.Start();
    var cache = ignite.CreateCache<int, Person>(cacheCfg);
}
```
</Tab>
</Tabs>

#### 4.1.2.查询实体
可以通过`QueryEntity`类来定义可查询字段，查询实体可以通过XML来配置：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration" id="ignite.cfg">
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            <property name="name" value="Person"/>
            <!-- Configure query entities -->
            <property name="queryEntities">
                <list>
                    <bean class="org.apache.ignite.cache.QueryEntity">
                        <!-- Setting  the type of the key -->
                        <property name="keyType" value="java.lang.Long"/>

                        <property name="keyFieldName" value="id"/>

                        <!-- Setting type of the value -->
                        <property name="valueType" value="org.apache.ignite.examples.Person"/>

                        <!-- Defining fields that will be either indexed or queryable.
                             Indexed fields are added to the 'indexes' list below.-->
                        <property name="fields">
                            <map>
                                <entry key="id" value="java.lang.Long"/>
                                <entry key="name" value="java.lang.String"/>
                                <entry key="salary" value="java.lang.Float "/>
                            </map>
                        </property>
                        <!-- Defining indexed fields.-->
                        <property name="indexes">
                            <list>
                                <!-- Single field (aka. column) index -->
                                <bean class="org.apache.ignite.cache.QueryIndex">
                                    <constructor-arg value="name"/>
                                </bean>
                                <!-- Group index. -->
                                <bean class="org.apache.ignite.cache.QueryIndex">
                                    <constructor-arg>
                                        <list>
                                            <value>id</value>
                                            <value>salary</value>
                                        </list>
                                    </constructor-arg>
                                    <constructor-arg value="SORTED"/>
                                </bean>
                            </list>
                        </property>
                    </bean>
                </list>
            </property>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
class Person implements Serializable {
    private long id;

    private String name;

    private int age;

    private float salary;
}

public static void main(String[] args) {
    Ignite ignite = Ignition.start();
    CacheConfiguration<Long, Person> personCacheCfg = new CacheConfiguration<Long, Person>();
    personCacheCfg.setName("Person");

    QueryEntity queryEntity = new QueryEntity(Long.class, Person.class)
            .addQueryField("id", Long.class.getName(), null).addQueryField("age", Integer.class.getName(), null)
            .addQueryField("salary", Float.class.getName(), null)
            .addQueryField("name", String.class.getName(), null);

    queryEntity.setIndexes(Arrays.asList(new QueryIndex("id"), new QueryIndex("salary", false)));

    personCacheCfg.setQueryEntities(Arrays.asList(queryEntity));

    IgniteCache<Long, Person> cache = ignite.createCache(personCacheCfg);
}
```
</Tab>

<Tab title="C#/.NET">

```csharp

```
</Tab>

<Tab title="C++">

```cpp
private class Person
{
    public long Id;

    public string Name;

    public int Age;

    public float Salary;
}

public static void QueryEntitiesDemo()
{
    var personCacheCfg = new CacheConfiguration
    {
        Name = "Person",
        QueryEntities = new[]
        {
            new QueryEntity
            {
                KeyType = typeof(long),
                ValueType = typeof(Person),
                Fields = new[]
                {
                    new QueryField("Id", typeof(long)),
                    new QueryField("Name", typeof(string)),
                    new QueryField("Age", typeof(int)),
                    new QueryField("Salary", typeof(float))
                },
                Indexes = new[]
                {
                    new QueryIndex("Id"),
                    new QueryIndex(true, "Salary"),
                }
            }
        }
    };
    var ignite = Ignition.Start();
    var personCache = ignite.CreateCache<int, Person>(personCacheCfg);
}
```
</Tab>
</Tabs>

### 4.2.查询
要在缓存上执行查询，简单地创建一个`SqlFieldsQuery`对象，将查询字符串传给构造方法，然后执行`cache.query(…​)`即可。注意在下面的示例中，Person缓存必须配置为[对SQL引擎可见](#_4-1-配置可查询字段)。

<Tabs>
<Tab title="Java">

```java
IgniteCache<Long, Person> cache = ignite.cache("Person");

SqlFieldsQuery sql = new SqlFieldsQuery(
        "select concat(firstName, ' ', lastName) from Person");

// Iterate over the result set.
try (QueryCursor<List<?>> cursor = cache.query(sql)) {
    for (List<?> row : cursor)
        System.out.println("personName=" + row.get(0));
}
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cache = ignite.GetCache<long, Person>("Person");

var sql = new SqlFieldsQuery("select concat(FirstName, ' ', LastName) from Person");

using (var cursor = cache.Query(sql))
{
    foreach (var row in cursor)
    {
        Console.WriteLine("personName=" + row[0]);
    }
}
```
</Tab>

<Tab title="C++">

```cpp
Cache<int64_t, Person> cache = ignite.GetOrCreateCache<int64_t, Person>("Person");

// Iterate over the result set.
// SQL Fields Query can only be performed using fields that have been listed in "QueryEntity" been of the config!
QueryFieldsCursor cursor = cache.Query(SqlFieldsQuery("select concat(firstName, ' ', lastName) from Person"));
while (cursor.HasNext())
{
    std::cout << "personName=" << cursor.GetNext().GetNext<std::string>() << std::endl;
}
```
</Tab>
</Tabs>

`SqlFieldsQuery`会返回一个游标，然后可以用游标来迭代匹配SQL查询的结果集。
#### 4.2.1.本地执行
如果要强制一个查询在本地执行，可以使用`SqlFieldsQuery.setLocal(true)`方法。这时，查询是在执行查询的节点的本地数据上执行，这意味着查询的结果集是不完整的，所以使用这个模式前要了解这个限制。
#### 4.2.2.WHERE子句的子查询
`INSERT`、`MERGE`语句中的`SELECT`查询，以及由`UPDATE`和`DELETE`操作生成的`SELECT`查询也是分布式的，可以以[并置或非并置的模式](#_5-分布式关联)执行。

但是，如果`WHERE`子句中有一个子查询，那么其只能以并置的方式执行。

比如，考虑下面的查询：
```sql
DELETE FROM Person WHERE id IN
    (SELECT personId FROM Salary s WHERE s.amount > 2000);
```
SQL引擎会生成一个`SELECT`查询，来获取要删除的条目列表。该查询是分布式的，在整个集群中执行，大致如下：
```sql
SELECT _key, _val FROM Person WHERE id IN
    (SELECT personId FROM Salary s WHERE s.amount > 2000);
```
但是，`IN`子句中的子查询（`SELECT personId FROM Salary …​`）并不是分布式的，只能在节点的本地可用数据集上执行。
### 4.3.插入、更新、删除和合并
使用`SqlFieldsQuery`可以执行DML命令来修改数据：

<Tabs>
<Tab title="INSERT">

```java
IgniteCache<Long, Person> cache = ignite.cache("personCache");

cache.query(
        new SqlFieldsQuery("INSERT INTO Person(id, firstName, lastName) VALUES(?, ?, ?)")
                .setArgs(1L, "John", "Smith"))
        .getAll();
```
</Tab>

<Tab title="UPDATE">

```java
IgniteCache<Long, Person> cache = ignite.cache("personCache");

cache.query(new SqlFieldsQuery("UPDATE Person set lastName = ? " + "WHERE id >= ?")
        .setArgs("Jones", 2L)).getAll();
```
</Tab>

<Tab title="DELETE">

```java
IgniteCache<Long, Person> cache = ignite.cache("personCache");

cache.query(new SqlFieldsQuery("DELETE FROM Person " + "WHERE id >= ?").setArgs(2L))
        .getAll();
```
</Tab>

<Tab title="MERGE">

```java
IgniteCache<Long, Person> cache = ignite.cache("personCache");

cache.query(new SqlFieldsQuery("MERGE INTO Person(id, firstName, lastName)"
        + " values (1, 'John', 'Smith'), (5, 'Mary', 'Jones')")).getAll();
```
</Tab>
</Tabs>

当使用`SqlFieldsQuery`来执行DDL语句时，必须调用`query(…​)`方法返回的游标的`getAll()`方法。
### 4.4.指定模式
通过`SqlFieldsQuery`执行的任何`SELECT`语句，默认都是在`PUBLIC`模式下解析的。但是如果表不在这个模式下，需要调用`SqlFieldsQuery.setSchema(…​)`来指定模式，这样语句就在指定的模式下执行了。

<Tabs>
<Tab title="Java">

```java
SqlFieldsQuery sql = new SqlFieldsQuery("select name from City").setSchema("PERSON");
```
</Tab>

<Tab title="C#/.NET">

```csharp
var sqlFieldsQuery = new SqlFieldsQuery("select name from City") {Schema = "PERSON"};
```
</Tab>

<Tab title="C++">

```cpp
// SQL Fields Query can only be performed using fields that have been listed in "QueryEntity" been of the config!
SqlFieldsQuery sql = SqlFieldsQuery("select name from City");
sql.SetSchema("PERSON");
```
</Tab>
</Tabs>

另外，也可以在语句中指定模式：
```java
SqlFieldsQuery sql = new SqlFieldsQuery("select name from Person.City");
```
### 4.5.创建表
可以向`SqlFieldsQuery`传递任何受支持的DDL语句，如下所示：

<Tabs>
<Tab title="Java">

```java
IgniteCache<Long, Person> cache = ignite
        .getOrCreateCache(new CacheConfiguration<Long, Person>().setName("Person"));

// Creating City table.
cache.query(new SqlFieldsQuery(
        "CREATE TABLE City (id int primary key, name varchar, region varchar)")).getAll();
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cache = ignite.GetOrCreateCache<long, Person>(
    new CacheConfiguration
    {
        Name = "Person"
    }
);

//Creating City table
cache.Query(new SqlFieldsQuery("CREATE TABLE City (id int primary key, name varchar, region varchar)"));
```
</Tab>

<Tab title="C++">

```cpp
Cache<int64_t, Person> cache = ignite.GetOrCreateCache<int64_t, Person>("Person");

// Creating City table.
cache.Query(SqlFieldsQuery("CREATE TABLE City (id int primary key, name varchar, region varchar)"));
```
</Tab>
</Tabs>

在SQL模式方面，上述代码的执行结果，创建了下面的表：

 - `Person`模式中的`Person`表（如果之前未创建）；
 - `Person`模式中的`City`表。

要查询`City`表，可以使用两种方式：`select * from Person.City`或`new SqlFieldsQuery("select * from City").setSchema("PERSON")`（注意大写）。
### 4.6.取消查询
有两种方式可以取消长时间运行的查询。

第一种方式是设置查询执行超时：

<Tabs>
<Tab title="Java">

```java
SqlFieldsQuery query = new SqlFieldsQuery("SELECT * from Person");

// Setting query execution timeout
query.setTimeout(10_000, TimeUnit.SECONDS);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var query = new SqlFieldsQuery("select * from Person") {Timeout = TimeSpan.FromSeconds(10)};
```
</Tab>
</Tabs>

第二个方式是调用`QueryCursor.close()`来终止查询：

<Tabs>
<Tab title="Java">

```java
SqlFieldsQuery query = new SqlFieldsQuery("SELECT * FROM Person");

// Executing the query
QueryCursor<List<?>> cursor = cache.query(query);

// Halting the query that might be still in progress.
cursor.close();
```
</Tab>

<Tab title="C#/.NET">

```csharp
var qry = new SqlFieldsQuery("select * from Person");
var cursor = cache.Query(qry);

//Executing query

//Halting the query that might be still in progress
cursor.Dispose();
```
</Tab>
</Tabs>

### 4.7.示例
Ignite的[源代码](https://github.com/apache/ignite/tree/master/examples/src/main/java/org/apache/ignite/examples/sql/SqlDmlExample.java)中有一个直接可以运行的`SqlDmlExample`，其演示了所有上面提到过的DML操作的使用。
## 5.分布式关联
分布式关联是指SQL语句中通过关联子句组合了两个或者更多的分区表，如果这些表关联在分区列（关联键）上，该关联称为*并置关联*，否则称为*非并置关联*。

并置关联更高效，因为其可以高效地在集群节点间分布。

Ignite默认将每个关联查询都视为并置关联，并按照并置的模式执行。

::: warning 警告
如果查询是非并置的，需要通过`SqlFieldsQuery.setDistributedJoins(true)`来开启查询执行的非并置模式，否则查询的结果集会是不正确的。
:::
::: warning 警告
如果经常关联表，那么建议将表在同一个列（关联表的列）上进行分区。

非并置的关联仅适用于无法使用并置关联的场景。
:::
### 5.1.并置关联
下图解释了并置关联的执行过程，一个并置关联（`Q`）会被发给存储与查询条件匹配的数据的所有节点，然后查询在每个节点的本地数据集上执行（`E(Q)`），结果集（`R`）会在查询的发起节点（客户端节点）聚合：

![](https://ignite.apache.org/docs/2.9.0/images/collocated_joins.png)

### 5.2.非并置关联
如果以非并置模式执行查询，则SQL引擎将在存储与查询条件匹配的数据的所有节点上本地执行查询。但是因为数据不是并置的，所以每个节点将通过发送广播或单播请求从其他节点拉取缺失的数据（本地不存在），下图描述了此过程：

![](https://ignite.apache.org/docs/2.9.0/images/non_collocated_joins.png)

如果关联是在主键或关联键上，则节点将发送单播请求，因为这时节点知道缺失数据的位置。否则节点将发送广播请求。出于性能原因，广播和单播请求都被汇总为批次。

通过设置JDBC/ODBC参数，或通过调用`SqlFieldsQuery.setDistributedJoins(true)`使用SQL API，可以启用非并置查询执行模式。

::: warning 警告
如果对[复制表](/doc/java/DataModeling.md#_2-2-2-replicated)中的列使用非并置关联，则该列必须有索引。否则会抛出异常。
:::
### 5.3.哈希关联
为了提高关联查询的性能，Ignite还支持[哈希关联算法](https://en.wikipedia.org/wiki/Hash_join)。在许多情况下，哈希关联比嵌套循环关联更有效，除非联接的探测端很小。但是，哈希关联只能与等关联一起使用，即关联谓词中关联类型为等比较。

要强制使用哈希关联：

 1. 使用`enforceJoinOrder`选项：

    <Tabs>
    <Tab title="Java API">

    ```java
    SqlFieldsQuery query = new SqlFieldsQuery(
            "SELECT * FROM TABLE_A, TABLE_B USE INDEX(HASH_JOIN_IDX)"
                    + " WHERE TABLE_A.column1 = TABLE_B.column2").setEnforceJoinOrder(true);
    ```
    </Tab>

    <Tab title="JDBC">

    ```java
    Class.forName("org.apache.ignite.IgniteJdbcThinDriver");

    // Open the JDBC connection.
    Connection conn = DriverManager.getConnection("jdbc:ignite:thin://127.0.0.1?enforceJoinOrder=true");
    ```
    </Tab>

    <Tab title="C#/.NET">

    ```csharp
    var query = new SqlFieldsQuery("SELECT * FROM TABLE_A, TABLE_B USE INDEX(HASH_JOIN_IDX) WHERE TABLE_A.column1 = TABLE_B.column2")
    {
        EnforceJoinOrder = true
    };
    ```
    </Tab>

    <Tab title="C++">

    ```cpp
    SqlFieldsQuery query = SqlFieldsQuery("SELECT * FROM TABLE_A, TABLE_B USE INDEX(HASH_JOIN_IDX) WHERE TABLE_A.column1 = TABLE_B.column2");
    query.SetEnforceJoinOrder(true);
    ```
    </Tab>
    </Tabs>

 2. 在要为其创建哈希关联索引的表上指定`USE INDEX（HASH_JOIN_IDX）`：

    ```sql
    SELECT * FROM TABLE_A, TABLE_B USE INDEX(HASH_JOIN_IDX) WHERE TABLE_A.column1 = TABLE_B.column2
    ```
## 6.SQL事务
::: warning 警告
支持[SQL事务](#_11-多版本并发控制)当前处于测试阶段，生产环境建议使用键-值事务。
:::
### 6.1.概述
配置为`TRANSACTIONAL_SNAPSHOT`原子化模式的缓存支持SQL事务。`TRANSACTIONAL_SNAPSHOT`模式是Ignite缓存的多版本并发控制（MVCC）实现，关于MVCC的更多信息以及当前的限制，请参见[多版本并发控制](#_11-多版本并发控制)章节的内容。

关于Ignite支持的事务语法，请参见[事务](/doc/java/SQLReference.md#_4-事务)章节的内容。
### 6.2.启用MVCC
在缓存配置中使用`TRANSACTIONAL_SNAPSHOT`原子化模式可以为缓存开启MVCC，如果使用`CREATE TABLE`命令建表，可以在命令的`WITH`子句中指定原子化模式参数。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">

            <property name="name" value="myCache"/>

            <property name="atomicityMode" value="TRANSACTIONAL_SNAPSHOT"/>

        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
CacheConfiguration cacheCfg = new CacheConfiguration<>();
cacheCfg.setName("myCache");

cacheCfg.setAtomicityMode(CacheAtomicityMode.TRANSACTIONAL_SNAPSHOT);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cacheCfg = new CacheConfiguration
{
    Name = "myCache",
    AtomicityMode = CacheAtomicityMode.TransactionalSnapshot
};
```
</Tab>

<Tab title="SQL">

```sql
CREATE TABLE Person WITH "ATOMICITY=TRANSACTIONAL_SNAPSHOT"
```
</Tab>
</Tabs>

### 6.3.限制
#### 6.3.1.跨缓存事务
`TRANSACTIONAL_SNAPSHOT`模式是缓存级的，因此不允许在一个事务中的缓存具有不同的原子化模式，如果要在一个事务中覆盖多张表，那么所有的相关表都要使用`TRANSACTIONAL_SNAPSHOT`模式创建。
#### 6.3.2.嵌套事务
通过JDBC/ODBC连接参数，Ignite支持三种模式用于处理嵌套的SQL事务。

JDBC连接串示例：
```
jdbc:ignite:thin://127.0.0.1/?nestedTransactionsMode=COMMIT
```
当事务中发生了嵌套的事务，系统的行为取决于`nestedTransactionsMode`参数：

 - `ERROR`：如果遇到嵌套事务，会抛出错误并且包含的事务会回滚，这是默认的行为；
 - `COMMIT`：包含事务会被挂起，嵌套事务启动后如果遇到COMMIT语句会被提交。包含事务中的其余语句会作为隐式事务执行；
 - `IGNORE`：**不要使用这个模式**，嵌套事务的开始会被忽略，嵌套事务中的语句会作为包含事务的一部分执行，并且随着嵌套事务的提交而提交所有的变更，包含事务的剩余语句会作为隐式事务执行。

## 7.自定义SQL函数
Ignite的SQL引擎支持通过额外用Java编写的自定义SQL函数，来扩展ANSI-99规范定义的SQL函数集。

一个自定义SQL函数仅仅是一个加注了`@QuerySqlFunction`注解的公共静态方法。
```java
// Defining a custom SQL function.
public class MyFunctions {
    @QuerySqlFunction
    public static int sqr(int x) {
        return x * x;
    }
}
```
持有自定义SQL函数的类需要使用`setSqlFunctionClasses(...)`方法在特定的`CacheConfiguration`中注册。
```java
// Preparing a cache configuration.
CacheConfiguration cfg = new CacheConfiguration();

// Registering the class that contains custom SQL functions.
cfg.setSqlFunctionClasses(MyFunctions.class);
```
经过了上述配置的缓存部署之后，在SQL查询中就可以调用自定义函数了，如下所示：
```java
// Preparing the query that uses customly defined 'sqr' function.
SqlFieldsQuery query = new SqlFieldsQuery(
  "SELECT name FROM Blocks WHERE sqr(size) > 100");

// Executing the query.
cache.query(query).getAll();
```
::: tip 类注册
在自定义SQL函数可能要执行的所有节点上，通过`CacheConfiguration.setSqlFunctionClasses(...)`注册的类都需要添加到类路径中，否则在自定义函数执行时会抛出`ClassNotFoundException`异常。
:::
## 8.JDBC驱动
Ignite提供了JDBC驱动，可以通过标准的SQL语句处理分布式数据，比如从JDBC端直接进行`SELECT`、`INSERT`、`UPDATE`和`DELETE`。

目前，Ignite支持两种类型的驱动，轻量易用的JDBC Thin模式驱动以及以客户端节点形式与集群进行交互的[JDBC客户端驱动](#_9-jdbc客户端驱动)。
### 8.1.JDBC Thin模式驱动
JDBC Thin模式驱动是Ignite提供的默认轻量级驱动，要使用这种驱动，只需要将`ignite-core-{version}.jar`加入应用的类路径即可。

驱动会接入集群的一个节点然后将所有的请求转发给它进行处理。节点会处理分布式的查询以及结果集的汇总，然后将结果集反馈给客户端应用。

JDBC连接串可以有两种模式：URL查询模式以及分号模式：
```
// URL query pattern
jdbc:ignite:thin://<hostAndPortRange0>[,<hostAndPortRange1>]...[,<hostAndPortRangeN>][/schema][?<params>]

hostAndPortRange := host[:port_from[..port_to]]

params := param1=value1[&param2=value2]...[&paramN=valueN]

// Semicolon pattern
jdbc:ignite:thin://<hostAndPortRange0>[,<hostAndPortRange1>]...[,<hostAndPortRangeN>][;schema=<schema_name>][;param1=value1]...[;paramN=valueN]
```

 - `host`：必需，它定义了要接入的集群节点主机地址；
 - `port_from`：打开连接的端口范围的起始点，如果忽略此参数默认为`10800`；
 - `port_to`：可选，如果忽略此参数则等同于`port_from`；
 - `schema`：要访问的模式名，默认是`PUBLIC`，这个名字对应于SQL的ANSI-99标准，不加引号是大小写不敏感的，加引号是大小写敏感的。如果使用了分号模式，模式可以通过参数名`schema`定义；
 - `<params>`：可选。

驱动类名为`org.apache.ignite.IgniteJdbcThinDriver`，比如，下面就是如何打开到集群节点的连接，监听地址为192.168.0.50：
```java
// Register JDBC driver.
Class.forName("org.apache.ignite.IgniteJdbcThinDriver");

// Open the JDBC connection.
Connection conn = DriverManager.getConnection("jdbc:ignite:thin://192.168.0.50");
```
::: tip 如果通过bash接入则JDBC URL需要加引号
如果通过bash环境接入，则连接URL需要加`" "`，比如：`"jdbc:ignite:thin://[address]:[port];user=[username];password=[password]"`
:::

#### 8.1.1.参数
下表列出了JDBC连接串支持的所有参数：

|属性名|描述|默认值|
|---|---|---|
|`user`|SQL连接的用户名，如果服务端开启了认证则此参数为必需。关于如何开启认证和创建用户，可以分别参见[认证](/doc/java/Security.md#_1-认证)和[创建用户](/doc/java/SQLReference.md#_2-6-create-user)的文档。|`ignite`|
|`password`|SQL连接的密码，如果服务端开启了认证则此参数为必需。关于如何开启认证和创建用户，可以分别参见[认证](/doc/java/Security.md#_1-认证)和[创建用户](/doc/java/SQLReference.md#_2-6-create-user)的文档。|`ignite`|
|`distributedJoins`|对于非并置数据是否使用分布式关联|`false`|
|`enforceJoinOrder`|是否在查询中强制表的关联顺序，如果配置为`true`，查询优化器在关联中不会对表进行重新排序。|false|
|`collocated`|如果SQL语句包含按主键或关联键对结果集进行分组的GROUP BY子句，可以将此参数设置为true。当Ignite执行分布式查询时，会向单个集群节点发送子查询，如果事先知道待查询的数据是在同一个节点上并置在一起的，并且是按主键或关联键分组的，那么Ignite通过在参与查询的每个节点本地分组数据来实现显著的性能和网络优化。|`false`|
|`replicatedOnly`|查询是否只包含复制表，这是一个潜在的可能提高性能的提示。|`false`|
|`autoCloseServerCursor`|当拿到最后一个结果集时是否自动关闭服务端游标。开启之后，对`ResultSet.close()`的调用就不需要网络访问，这样会改进性能。但是，如果服务端游标已经关闭，在调用`ResultSet.getMetadata()`方法时会抛出异常，这时为什么默认值为`false`的原因。|`false`|
|`partitionAwareness`|启用分区感知模式，该模式中，驱动会尝试确定要查询的数据所在的节点，然后把请求发给这些节点。|`false`|
|`partitionAwarenessSQLCacheSize`|驱动为优化而在本地保留的不同SQL查询数。当第一次执行查询时，驱动会接收正在查询的表的分区分布，并将其保存以备将来在本地使用。下次查询此表时，驱动使用该分区分布来确定要查询的数据的位置，以便将查询直接发送到正确的节点。当集群拓扑发生变更时，此包含SQL查询的本地存储将失效。此参数的最佳值应等于要执行的不同SQL查询的数量。|1000|
|`partitionAwarenessPartitionDistributionsCacheSize`|表示分区分布的不同对象的数量，驱动在本地保留以进行优化。具体请参见`partitionAwarenessSQLCacheSize`参数的说明。当集群拓扑发生变更时，持有分区分布对象的本地存储将失效。此参数的最佳值应等于要在查询中使用的不同表（缓存组）的数量。|`1000`|
|`socketSendBuffer`|发送套接字缓冲区大小，如果配置为0，会使用操作系统默认值。|`0`|
|`socketReceiveBuffer`|接收套接字缓冲区大小，如果配置为0，会使用操作系统默认值。|`0`|
|`tcpNoDelay`|是否使用`TCP_NODELAY`选项。|`true`|
|`lazy`|查询延迟执行。Ignite默认会将所有的结果集放入内存然后将其返回给客户端。对于不太大的结果集，这样会提供较好的性能，并且使内部的数据库锁时间最小化，因此提高了并发能力。但是如果相对于可用内存来说结果集过大，那么会导致频繁的GC暂停甚至`OutOfMemoryError`，如果使用这个标志，可以提示Ignite延迟加载结果集，这样可以在不大幅降低性能的前提下，最大限度地减少内存的消耗。|`false`|
|`skipReducerOnUpdate`|开启服务端的更新特性。当Ignite执行DML操作时，首先，它会获取所有受影响的中间行给查询发起方进行分析（通常被称为汇总方），然后会准备一个更新值的批次发给远程节点。这个方式可能影响性能，如果一个DML操作需要移动大量数据时，还可能会造成网络堵塞。使用这个标志可以提示Ignite在对应的远程节点上进行中间行的分析和更新。默认值为false，这意味着会首先获取中间行然后发给查询发起方。|`false`|

关于和安全有关的参数，请参见[使用SSL](#_8-1-6-使用ssl)章节的介绍。
#### 8.1.2.连接串示例

 - `jdbc:ignite:thin://myHost`：接入`myHost`,其它比如端口为`10800`等都是默认值；
 - `jdbc:ignite:thin://myHost:11900`：接入`myHost`,自定义端口为`11900`，其它为默认值；
 - `jdbc:ignite:thin://myHost:11900;user=ignite;password=ignite`：接入`myHost`,自定义端口为`11900`，并且带有用于认证的用户凭据；
 - `jdbc:ignite:thin://myHost:11900;distributedJoins=true&autoCloseServerCursor=true`：接入`myHost`,自定义端口为`11900`，开启了分布式关联和`autoCloseServerCursor`优化；
 - `jdbc:ignite:thin://myHost:11900/myschema;`：接入`myHost`，自定义端口为`11900`，模式为`MYSCHEMA`；
 - `jdbc:ignite:thin://myHost:11900/"MySchema";lazy=false`：接入`myHost`，自定义端口为`11900`，模式为`MySchema`（模式名区分大小写），并且禁用了查询的延迟执行。

#### 8.1.3.多端点
在连接串中配置多个连接端点也是可以的，这样如果连接中断会开启自动故障转移，JDBC驱动会从列表中随机选择一个地址接入。如果之前的连接中断，驱动会选择另一个地址直到连接恢复，如果所有的端点都不可达，JDBC会停止重连并且抛出异常。

下面的示例会显示如何通过连接串传递3个地址：
```java
// Register JDBC driver.
Class.forName("org.apache.ignite.IgniteJdbcThinDriver");

// Open the JDBC connection passing several connection endpoints.
Connection conn = DriverManager.getConnection(
  "jdbc:ignite:thin://192.168.0.50:101,192.188.5.40:101, 192.168.10.230:101");
```
#### 8.1.4.分区感知
::: warning 警告
分区感知是一个试验性特性，API和设计架构在正式发布之前可能会变更。
:::
分区感知是一个可使JDBC驱动“感知”集群中分区分布的功能。它使得驱动可以选择持有待查询数据的节点，并将查询直接发送到那些节点（如果在驱动的配置中提供了节点的地址）。分区感知可以提高使用关联键的查询的平均性能。

没有分区感知时，JDBC驱动将连接到某个节点，然后所有查询都通过该节点执行。如果数据分布在其他节点上，则必须在集群内重新路由查询，这会增加一个额外的网络波动。分区感知通过将查询直接发送到正确的节点来消除该波动。

要使用分区感知功能，需要在连接属性中提供所有服务端节点的地址，驱动会将请求直接发送到存储查询所请求数据的节点。
::: warning 警告
注意，当前需要在连接属性中提供所有服务端节点的地址，因为在打开连接后驱动不会自动加载它们。这意味着如果新的服务端节点加入集群，需要将节点的地址添加到连接属性中，然后重新连接驱动，否则驱动将无法直接向该节点发送请求。
:::
要开启分区感知，需要将`partitionAwareness=true`参数添加到连接串中，然后提供多个服务端节点的地址。

```java
Class.forName("org.apache.ignite.IgniteJdbcThinDriver");

Connection conn = DriverManager
        .getConnection("jdbc:ignite:thin://192.168.0.50,192.188.5.40,192.168.10.230?partitionAwareness=true");
```
::: tip 提示
分区感知功能只能使用默认的关联函数。
:::
#### 8.1.5.集群配置
为了接收和处理来自JDBC Thin驱动转发过来的请求，一个节点需要绑定到一个本地网络端口`10800`，然后监听入站请求。

通过`ClientConnectorConfiguration`，可以对参数进行修改：

<Tabs>
<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration()
    .setClientConnectorConfiguration(new ClientConnectorConfiguration());
```
</Tab>

<Tab title="XML">

```xml
<bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="clientConnectorConfiguration">
    <bean class="org.apache.ignite.configuration.ClientConnectorConfiguration" />
  </property>
</bean>
```
</Tab>
</Tabs>

其支持如下的参数：

|参数名|描述|默认值|
|---|---|---|
|`host`|绑定的主机名或者IP地址，如果配置为`null`，会使用`localHost`。|null|
|`port`|绑定的TCP端口，如果指定的端口已被占用，Ignite会使用`portRange`属性来查找其它可用的端口。|10800|
|`portRange`|定义尝试绑定的端口数量，比如，如果端口配置为`10800`并且端口范围为`100`，Ignite会从10800开始，在[10800,10900]范围内查找可用端口。|100|
|`maxOpenCursorsPerConnection`|每个连接打开的服务端游标的最大数量。|128|
|`threadPoolSize`|线程池中负责请求处理的线程数量。|max(8,CPU核数)|
|`socketSendBufferSize`|TCP套接字发送缓冲区大小，如果配置为`0`，会使用操作系统默认值。|0|
|`socketReceiveBufferSize`|TCP套接字接收缓冲区大小，如果配置为`0`，会使用操作系统默认值。|0|
|`tcpNoDelay`|是否使用`TCP_NODELAY`选项。|true|
|`idleTimeout`|客户端连接空闲超时时间。在空闲超过配置的超时时间后，客户端与服务端的连接会断开。如果该参数配置为0或者负值，空闲超时会被禁用。|0|
|`isJdbcEnabled`|是否允许JDBC访问。|true|
|`isThinClientEnabled`|是否允许瘦客户端访问。|true|
|`sslEnabled`|如果开启SSL，只允许SSL客户端连接。一个节点只允许一种连接模式：SSL或普通，一个节点无法同时接收两种模式的客户端连接，但是这个参数集群中的各个节点可以不同。|false|
|`useIgniteSslContextFactory`|在Ignite配置中是否使用SSL上下文工厂（具体可以看`IgniteConfiguration.sslContextFactory`）。|true|
|`sslClientAuth`|是否需要客户端认证。|false|
|`sslContextFactory`|提供节点侧SSL的`Factory<SSLContext>`实现的类名。|null|

::: warning JDBC Thin模式驱动并非线程安全
JDBC对象中的`Connection`、`Statement`和`ResultSet`不是线程安全的。因此不能在多线程中使用一个JDBC连接的Statement和ResultSet。
JDBC Thin模式驱动防止并发，如果检测到了并发访问，那么会抛出`SQLException`，消息为：`Concurrent access to JDBC connection is not allowed [ownThread=<guard_owner_thread_name>,curThread=<current_thread_name>]",SQLSTATE="08006`。
:::
#### 8.1.6.使用SSL
JDBC Thin模式驱动可以使用SSL来保护与集群之间的通信，集群端和驱动端必须同时配置SSL，集群配置方面，请参见[瘦客户端和JDBC/ODBC的SSL/TLS](/doc/java/Security.md#_2-3-瘦客户端和jdbc-odbc的ssl-tls)章节的介绍。

JDBC驱动中开启SSL，需要在连接串中传递`sslMode=require`参数，并且提供密钥库和信任库参数：
```java
Class.forName("org.apache.ignite.IgniteJdbcThinDriver");

String keyStore = "keystore/node.jks";
String keyStorePassword = "123456";

String trustStore = "keystore/trust.jks";
String trustStorePassword = "123456";

try (Connection conn = DriverManager.getConnection("jdbc:ignite:thin://127.0.0.1?sslMode=require"
        + "&sslClientCertificateKeyStoreUrl=" + keyStore + "&sslClientCertificateKeyStorePassword="
        + keyStorePassword + "&sslTrustCertificateKeyStoreUrl=" + trustStore
        + "&sslTrustCertificateKeyStorePassword=" + trustStorePassword)) {

    ResultSet rs = conn.createStatement().executeQuery("select 10");
    rs.next();
    System.out.println(rs.getInt(1));
} catch (Exception e) {
    e.printStackTrace();
}
```
下表列出了和SSL/TLS连接有关的参数：

|`sslMode`|开启SSL连接。可用的模式为：1.`require`：在客户端开启SSL协议，只有SSL连接才可以接入。2.`disable`：在客户端禁用SSL协议，只支持普通连接。|`disable`|
|`sslProtocol`|安全连接的协议名，如果未指定，会使用TLS协议。协议实现由JSSE提供：`SSLv3 (SSL), TLSv1 (TLS), TLSv1.1, TLSv1.2`|`TLS`|
|`sslKeyAlgorithm`|用于创建密钥管理器的密钥管理器算法。注意多数情况使用默认值即可。算法实现由JSSE提供：`PKIX (X509或SunPKIX), SunX509`||
|`sslClientCertificateKeyStoreUrl`|客户端密钥存储库文件的url，这是个强制参数，因为没有密钥管理器SSL上下文无法初始化。如果`sslMode`为`require`并且未通过属性文件指定密钥存储库 URL，那么会使用JSSE属性`javax.net.ssl.keyStore`的值。|JSSE系统属性`javax.net.ssl.keyStore`的值。|
|`sslClientCertificateKeyStorePassword`|客户端密钥存储库密码。如果`sslMode`为`require`并且未通过属性文件指定密钥存储库密码，那么会使用JSSE属性`javax.net.ssl.keyStorePassword`的值。|JSSE属性`javax.net.ssl.keyStorePassword`的值。|
|`sslClientCertificateKeyStoreType`|用于上下文初始化的客户端密钥存储库类型。如果`sslMode`为`require`并且未通过属性文件指定密钥存储库类型，那么会使用JSSE属性`javax.net.ssl.keyStoreType`的值。|JSSE属性`javax.net.ssl.keyStoreType`的值，如果属性未定义，默认值为JKS。|
|`sslTrustCertificateKeyStoreUrl`|truststore文件的URL。这是个可选参数，但是`sslTrustCertificateKeyStoreUrl`和`sslTrustAll`必须配置一个。如果`sslMode`为`require`并且未通过属性文件指定truststore文件URL，那么会使用JSSE属性`javax.net.ssl.trustStore`的值。|JSSE系统属性`javax.net.ssl.trustStore`的值。|
|`sslTrustCertificateKeyStorePassword`|truststore密码。如果`sslMode`为`require`并且未通过属性文件指定truststore密码，那么会使用JSSE属性`javax.net.ssl.trustStorePassword`的值。|JSSE系统属性`javax.net.ssl.trustStorePassword`的值。|
|`sslTrustCertificateKeyStoreType`|truststore类型。如果`sslMode`为`require`并且未通过属性文件指定truststore类型，那么会使用JSSE属性`javax.net.ssl.trustStoreType`的值。|JSSE系统属性`javax.net.ssl.trustStoreType`的值。如果属性未定义，默认值为JKS。|
|`sslTrustAll`|禁用服务端的证书验证。配置为`true`信任任何服务端证书（撤销的、过期的或者自签名的SSL证书）。注意，如果不能完全信任网络（比如公共互联网），不要在生产中启用该选项。|`false`|
|`sslFactory`|`Factory<SSLSocketFactory>`的自定义实现的类名，如果`sslMode`为`require`并且指定了该工厂类，自定义的工厂会替换JSSE的默认值，这时其它的SSL属性也会被忽略。|`null`|

默认实现基于JSSE，并且需要处理两个Java密钥库文件。

 - `sslClientCertificateKeyStoreUrl`：客户端认证密钥库文件，其持有客户端的密钥和证书；
 - `sslTrustCertificateKeyStoreUrl`：可信证书密钥库文件，包含用于验证服务器证书的证书信息。

信任库是可选参数，但是`sslTrustCertificateKeyStoreUrl`或者`sslTrustAll`必须配置两者之一。
::: warning 使用`sslTrustAll`参数
如果生产环境位于不完全可信网络（尤其是公共互联网），不要开启此选项。
:::

如果希望使用自己的实现或者通过某种方式配置`SSLSocketFactory`，可以使用驱动的`sslFactory`参数，这是一个包含`Factory<SSLSocketFactory>`接口实现的类名字符串，该类对于JDBC驱动的类加载器必须可用。
### 8.2.Ignite DataSource
`DataSource`对象可用作部署对象，其可以通过JNDI命名服务按逻辑名定位。Ignite JDBC驱动的`org.apache.ignite.IgniteJdbcThinDataSource`实现了JDBC的`DataSource`接口，这样就可以使用`DataSource`接口了。

除了通用的DataSource属性外，`IgniteJdbcThinDataSource`还支持所有可以传递给JDBC连接字符串的Ignite特有属性。例如，`distributedJoins`属性可以通过`IgniteJdbcThinDataSource#setDistributedJoins()`方法进行调整。

具体请参见[IgniteJdbcThinDataSource](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/IgniteJdbcThinDataSource.html)的javadoc。
### 8.3.示例
要处理集群中的数据，需要使用下面的一种方式来创建一个JDBC`Connection`对象：
```java
// Open the JDBC connection via DriverManager.
Connection conn = DriverManager.getConnection("jdbc:ignite:thin://192.168.0.50");
```
或者：
```java
// Or open connection via DataSource.
IgniteJdbcThinDataSource ids = new IgniteJdbcThinDataSource();
ids.setUrl("jdbc:ignite:thin://127.0.0.1");
ids.setDistributedJoins(true);

Connection conn = ids.getConnection();
```

之后就可以执行`SELECT`SQL查询了：
```java
// Query people with specific age using prepared statement.
PreparedStatement stmt = conn.prepareStatement("select name, age from Person where age = ?");

stmt.setInt(1, 30);

ResultSet rs = stmt.executeQuery();

while (rs.next()) {
    String name = rs.getString("name");
    int age = rs.getInt("age");
    // ...
}
```
此外，可以使用DML语句对数据进行修改。

#### 8.3.1.INSERT
```java
// Insert a Person with a Long key.
PreparedStatement stmt = conn.prepareStatement("INSERT INTO Person(_key, name, age) VALUES(CAST(? as BIGINT), ?, ?)");

stmt.setInt(1, 1);
stmt.setString(2, "John Smith");
stmt.setInt(3, 25);

stmt.execute();
```
#### 8.3.2.MERGE
```java
// Merge a Person with a Long key.
PreparedStatement stmt = conn.prepareStatement("MERGE INTO Person(_key, name, age) VALUES(CAST(? as BIGINT), ?, ?)");

stmt.setInt(1, 1);
stmt.setString(2, "John Smith");
stmt.setInt(3, 25);

stmt.executeUpdate();
```
#### 8.3.3.UPDATE
```java
// Update a Person.
conn.createStatement().
  executeUpdate("UPDATE Person SET age = age + 1 WHERE age = 25");
```
#### 8.3.4.DELETE
```java
conn.createStatement().execute("DELETE FROM Person WHERE age = 25");
```
### 8.4.流处理
Ignite的JDBC驱动可以通过`SET STREAMING`命令对流化数据进行批量处理，具体可以看[SET STREAMING](/doc/java/SQLReference.md#_5-2-set-streaming)的相关内容。
### 8.5.错误码
Ignite的JDBC驱动将错误码封装进了`java.sql.SQLException`类，它简化了应用端的错误处理。可以使用`java.sql.SQLException.getSQLState()`方法获取错误码，该方法会返回一个包含预定义ANSI SQLSTATE错误码的字符串：
```java
PreparedStatement ps;

try {
    ps = conn.prepareStatement("INSERT INTO Person(id, name, age) values (1, 'John', 'unparseableString')");
} catch (SQLException e) {
    switch (e.getSQLState()) {
    case "0700B":
        System.out.println("Conversion failure");
        break;

    case "42000":
        System.out.println("Parsing error");
        break;

    default:
        System.out.println("Unprocessed error: " + e.getSQLState());
        break;
    }
}
```
下表中列出了Ignite目前支持的所有[ANSI SQLSTATE](https://en.wikipedia.org/wiki/SQLSTATE)错误码，未来这个列表可能还会扩展：

|代码|描述|
|---|---|
|`0700B`|转换失败（比如，一个字符串表达式无法解析成数值或者日期）|
|`0700E`|无效的事务隔离级别|
|`08001`|驱动接入集群失败|
|`08003`|连接意外地处于关闭状态|
|`08004`|连接被集群拒绝|
|`08006`|通信中发生I/O错误|
|`22004`|不允许的空值|
|`22023`|不支持的参数类型|
|`23000`|违反了数据完整性约束|
|`24000`|无效的结果集状态|
|`0A000`|不支持的操作|
|`40001`|并发更新冲突，具体请参见[并发更新](#_11-4-并发更新)章节的介绍。|
|`42000`|查询解析异常|
|`50000`|Ignite内部错误，这个代码不是ANSI定义的，属于Ignite特有的错误，获取`java.sql.SQLException`的错误信息可以了解更多的细节|

## 9.JDBC客户端驱动
### 9.1.JDBC客户端驱动
JDBC客户端节点模式驱动使用客户端节点连接接入集群，这要求开发者提供一个完整的Spring XML配置作为JDBC连接串的一部分，然后拷贝下面所有的jar文件到应用或者SQL工具的类路径中：

 - `{IGNITE_HOME}\libs`目录下的所有jar文件；
 - `{IGNITE_HOME}\ignite-indexing`和`{IGNITE_HOME}\ignite-spring`目录下的所有jar文件；

这个驱动很重，而且可能不支持Ignite的最新SQL特性，但是因为它底层使用客户端节点连接，它可以执行分布式查询，然后在应用端直接对结果进行汇总。

JDBC连接URL的规则如下：
```
jdbc:ignite:cfg://[<params>@]<config_url>
```
其中：

 - `<config_url>`是必需的，表示指向Ignite客户端节点配置文件的任意合法URL，当驱动试图建立到集群的连接时，这个节点会在Ignite JDBC客户端节点驱动中启动；
  - `<params>`是可选的，格式如下：

```
param1=value1:param2=value2:...:paramN=valueN
```

驱动类名为`org.apache.ignite.IgniteJdbcDriver`，比如下面的代码，展示了如何打开一个到集群的JDBC连接：
```java
// Register JDBC driver.
Class.forName("org.apache.ignite.IgniteJdbcDriver");

// Open JDBC connection (cache name is not specified, which means that we use default cache).
Connection conn = DriverManager.getConnection("jdbc:ignite:cfg://file:///etc/config/ignite-jdbc.xml");
```
::: tip 安全连接
关于如何保护JDBC客户端驱动的更多信息，请参见[高级安全](/doc/java/Security.md#_2-ssl-tls)的相关文档。
:::

#### 9.1.1.支持的参数

|属性|描述|默认值|
|---|---|---|
|`cache`|缓存名，如果未定义会使用默认的缓存，区分大小写||
|`nodeId`|要执行的查询所在节点的Id，对于在本地查询是有用的||
|`local`|查询只在本地节点执行，这个参数和`nodeId`参数都是通过指定节点来限制数据集|false|
|`collocated`|优化标志，当Ignite执行一个分布式查询时，它会向单个的集群节点发送子查询，如果提前知道要查询的数据已经被并置到同一个节点，Ignite会有显著的性能提升和拓扑优化|false|
|`distributedJoins`|可以在非并置的数据上使用分布式关联。|false|
|`streaming`|通过`INSERT`语句为本链接开启批量数据加载模式，具体可以参照后面的`流模式`相关章节。|false|
|`streamingAllowOverwrite`|通知Ignite对于重复的已有键，覆写它的值而不是忽略它们，具体可以参照后面的`流模式`相关章节。|false|
|`streamingFlushFrequency`|超时时间，*毫秒*，数据流处理器用于刷新数据，*数据默认会在连接关闭时刷新*，具体可以参照后面的`流模式`相关章节。|0|
|`streamingPerNodeBufferSize`|数据流处理器的每节点缓冲区大小，具体可以参照后面的`流模式`相关章节。|1024|
|`streamingPerNodeParallelOperations`|数据流处理器的每节点并行操作数。具体可以参照后面的`流模式`相关章节。|16|
|`transactionsAllowed`|目前已经支持了ACID事务，但是仅仅在键-值API层面，在SQL层面Ignite支持原子性，还不支持事务一致性，这意味着使用这个功能的时候驱动可能抛出`Transactions are not supported`这样的异常。但是，有时需要使用事务语法（即使不需要事务语义），比如一些BI工具会一直强制事务行为，也需要将该参数配置为`true`以避免异常。|false|
|`multipleStatementsAllowed`|JDBC驱动可以同时处理多个SQL语句并且返回多个`ResultSet`对象，如果该参数为false，多个语句的查询会返回错误。|false|
|`lazy`|查询延迟执行。Ignite默认会将所有的结果集放入内存然后将其返回给客户端，对于不太大的结果集，这样会提供较好的性能，并且使内部的数据库锁时间最小化，因此提高了并发能力。但是，如果相对于可用内存来说结果集过大，那么会导致频繁的GC暂停，甚至`OutOfMemoryError`，如果使用这个标志，可以提示Ignite延迟加载结果集，这样可以在不大幅降低性能的前提下，最大限度地减少内存的消耗。|false|
|`skipReducerOnUpdate`|开启服务端的更新特性。当Ignite执行DML操作时，首先，它会获取所有受影响的中间行给查询发起方进行分析（通常被称为汇总），然后会准备一个更新值的批量发给远程节点。这个方式可能影响性能，如果一个DML操作会移动大量数据条目时，还可能会造成网络堵塞。使用这个标志可以提示Ignite在对应的远程节点上进行中间行的分析和更新。默认值为false，这意味着会首先获取中间行然后发给查询发起方。|false|

#### 9.1.2.流模式
使用JDBC驱动，可以以流模式（批处理模式）将数据注入Ignite集群。这时驱动会在内部实例化`IgniteDataStreamer`然后将数据传给它。要激活这个模式，可以在JDBC连接串中增加`streaming`参数并且设置为`true`：
```java
// Register JDBC driver.
Class.forName("org.apache.ignite.IgniteJdbcDriver");

// Opening connection in the streaming mode.
Connection conn = DriverManager.getConnection("jdbc:ignite:cfg://streaming=true@file:///etc/config/ignite-jdbc.xml");
```
目前，流模式只支持INSERT操作，对于想更快地将数据预加载进缓存的场景非常有用。JDBC驱动定义了多个连接参数来影响流模式的行为，这些参数已经在上述的参数表中列出。
::: danger 缓存名
确保在JDBC连接字符串中通过`cache=`参数为流操作指定目标缓存。如果未指定缓存或缓存与流式DML语句中使用的表不匹配，则更新会被忽略。
:::
这些参数几乎覆盖了`IgniteDataStreamer`的所有常规配置，这样就可以根据需要更好地调整流处理器。关于如何配置流处理器可以参考[流处理器](/doc/java/DataStreaming.md)的相关文档来了解更多的信息。
::: tip 基于时间的刷新
默认情况下，当要么连接关闭，要么达到了`streamingPerNodeBufferSize`，数据才会被刷新，如果希望按照时间的方式来刷新，那么可以调整`streamingFlushFrequency`参数。
:::

```java
// Register JDBC driver.
Class.forName("org.apache.ignite.IgniteJdbcDriver");

// Opening a connection in the streaming mode and time based flushing set.
Connection conn = DriverManager.getConnection("jdbc:ignite:cfg://streaming=true:streamingFlushFrequency=1000@file:///etc/config/ignite-jdbc.xml");

PreparedStatement stmt = conn.prepareStatement(
  "INSERT INTO Person(_key, name, age) VALUES(CAST(? as BIGINT), ?, ?)");

// Adding the data.
for (int i = 1; i < 100000; i++) {
      // Inserting a Person object with a Long key.
      stmt.setInt(1, i);
      stmt.setString(2, "John Smith");
      stmt.setInt(3, 25);

      stmt.execute();
}

conn.close();

// Beyond this point, all data is guaranteed to be flushed into the cache.
```
### 9.2.示例
要处理集群中的数据，需要使用下面的一种方式来创建一个JDBC`Connection`对象：
```java
// Register JDBC driver.
Class.forName("org.apache.ignite.IgniteJdbcDriver");

// Open JDBC connection (cache name is not specified, which means that we use default cache).
Connection conn = DriverManager.getConnection("jdbc:ignite:cfg://file:///etc/config/ignite-jdbc.xml");
```
之后就可以执行`SELECT`SQL查询了：
```java
// Query names of all people.
ResultSet rs = conn.createStatement().executeQuery("select name from Person");

while (rs.next()) {
    String name = rs.getString(1);
}
```

```java
// Query people with specific age using prepared statement.
PreparedStatement stmt = conn.prepareStatement("select name, age from Person where age = ?");

stmt.setInt(1, 30);

ResultSet rs = stmt.executeQuery();

while (rs.next()) {
    String name = rs.getString("name");
    int age = rs.getInt("age");
}
```
此外，可以使用DML语句对数据进行修改。
#### 9.2.1.INSERT
```java
// Insert a Person with a Long key.
PreparedStatement stmt = conn.prepareStatement("INSERT INTO Person(_key, name, age) VALUES(CAST(? as BIGINT), ?, ?)");

stmt.setInt(1, 1);
stmt.setString(2, "John Smith");
stmt.setInt(3, 25);

stmt.execute();
```
#### 9.2.2.MERGE
```java
// Merge a Person with a Long key.
PreparedStatement stmt = conn.prepareStatement("MERGE INTO Person(_key, name, age) VALUES(CAST(? as BIGINT), ?, ?)");

stmt.setInt(1, 1);
stmt.setString(2, "John Smith");
stmt.setInt(3, 25);

stmt.executeUpdate();
```
#### 9.2.3.UPDATE
```java
// Update a Person.
conn.createStatement().
  executeUpdate("UPDATE Person SET age = age + 1 WHERE age = 25");
```
#### 9.2.4.DELETE
```java
conn.createStatement().execute("DELETE FROM Person WHERE age = 25");
```
## 10.ODBC驱动
### 10.1.ODBC驱动
#### 10.1.1.概述
Ignite包括一个ODBC驱动，可以通过标准SQL查询和原生ODBC API查询和修改存储于分布式缓存中的数据。

要了解ODBC的细节，可以参照[ODBC开发者参考](https://msdn.microsoft.com/en-us/library/ms714177.aspx)。

Ignite的ODBC驱动实现了ODBC API的3.0版。
#### 10.1.2.集群配置
Ignite的ODBC驱动在Windows中被视为一个动态库，在Linux中被视为一个共享对象，应用不会直接加载它，而是在必要时使用一个驱动加载器API来加载和卸载ODBC驱动。

Ignite的ODBC驱动在内部使用TCP来接入Ignite集群，集群范围的连接参数可以通过`IgniteConfiguration.clientConnectorConfiguration`属性来配置：

<Tabs>
<Tab title="XML">

```xml
<bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="clientConnectorConfiguration">
        <bean class="org.apache.ignite.configuration.ClientConnectorConfiguration"/>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

ClientConnectorConfiguration clientConnectorCfg = new ClientConnectorConfiguration();
cfg.setClientConnectorConfiguration(clientConnectorCfg);
```
</Tab>
</Tabs>

客户端连接器配置支持下面的参数：

|属性|描述|默认值|
|---|---|---|
|`host`|绑定的主机名或者IP地址，如果为`null`，会绑定localhost|`null`|
|`port`|绑定的TCP端口，如果指定的端口被占用，Ignite会使用`portRange`属性寻找其它的可用端口。|`10800`|
|`portRange`|定义尝试绑定的端口范围。比如`port`配置为`10800`并且`portRange`为`100`，那么服务端会按照顺序去尝试绑定`[10800, 10900]`范围内的端口，直到找到可用的端口。|`100`|
|`maxOpenCursorsPerConnection`|单个连接可以同时打开的最大游标数。|128|
|`threadPoolSize`|线程池中负责请求处理的线程数。|`MAX(8, CPU核数)`|
|`socketSendBufferSize`|TCP套接字发送缓冲区大小，如果配置为0，会使用系统默认值|0|
|`socketReceiveBufferSize`|TCP套接字接收缓冲区大小，如果配置为0，会使用系统默认值。|0|
|`tcpNoDelay`|是否使用`TCP_NODELAY`选项。|`true`|
|`idleTimeout`|客户端连接的空闲超时时间。如果空闲时间超过配置的超时时间，客户端会自动断开与服务端的连接。如果该参数配置为0或者为负值，空闲超时会被禁用。|0|
|`isOdbcEnabled`|是否允许通过ODBC访问。|`true`|
|`isThinClientEnabled`|是否允许通过瘦客户端访问。|`true`|

可以通过如下方式修改参数：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <!-- Enabling ODBC. -->
    <property name="clientConnectorConfiguration">
        <bean class="org.apache.ignite.configuration.ClientConnectorConfiguration">
            <property name="host" value="127.0.0.1"/>
            <property name="port" value="10800"/>
            <property name="portRange" value="5"/>
            <property name="maxOpenCursorsPerConnection" value="512"/>
            <property name="socketSendBufferSize" value="65536"/>
            <property name="socketReceiveBufferSize" value="131072"/>
            <property name="threadPoolSize" value="4"/>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();
...
ClientConnectorConfiguration clientConnectorCfg = new ClientConnectorConfiguration();

clientConnectorCfg.setHost("127.0.0.1");
clientConnectorCfg.setPort(12345);
clientConnectorCfg.setPortRange(2);
clientConnectorCfg.setMaxOpenCursorsPerConnection(512);
clientConnectorCfg.setSocketSendBufferSize(65536);
clientConnectorCfg.setSocketReceiveBufferSize(131072);
clientConnectorCfg.setThreadPoolSize(4);

cfg.setClientConnectorConfiguration(clientConnectorCfg);
...
```
</Tab>

</Tabs>

通过`ClientListenerProcessor`从ODBC驱动端建立的连接也是可以配置的，关于如何从驱动端修改连接的配置，可以看[这里](#_10-2-连接串和dsn)。
#### 10.1.3.线程安全
Ignite ODBC驱动的当前实现仅在连接层提供了线程安全，这意味着如果没有额外的同步处理，多线程无法访问同一个连接。不过可以为每个线程创建独立的连接，然后同时使用。
#### 10.1.4.环境要求
Ignite的ODBC驱动官方在如下环境中进行了测试：

|OS|Windows（XP及以上，32位和64位版本）<br>Windows Server（2008及以上，32位和64位版本）<br>Ubuntu（14.x和15.x，64位）|
|---|---|
|C++编译器|MS Visual C++ (10.0及以上), g++ (4.4.0及以上)|
|Visual Studio|2010及以上|

#### 10.1.5.构建ODBC驱动
在Windows中，Ignite提供了预构建的32位和64位驱动的安装器，因此如果只是想在Windows中安装驱动，那么直接看下面的安装驱动章节就可以了。

对于Linux环境，安装之前还是需要进行构建，因此如果使用的是Linux或者使用Windows但是仍然想自己构建驱动，那么往下看。

Ignite的ODBC驱动的源代码随着Ignite版本一起发布，在使用之前可以自行构建。

因为ODBC驱动是用C++编写的，因此它是作为Ignite C++的一部分提供的，并且依赖于一些C++库，具体点说依赖于`utils`和`binary`Ignite库，这就意味着，在构建ODBC驱动本身之前，需要先构建它们。

这里假定使用的是二进制版本，如果使用的是源代码版本，那么需要将所有使用的`%IGNITE_HOME%\platforms\cpp`替换为`%IGNITE_HOME%\modules\platforms\cpp`。

##### 10.1.5.1.在Windows上构建
如果要在Windows上构建ODBC驱动，需要MS Visual Studio 2010及以后的版本。一旦打开了Ignite方案`%IGNITE_HOME%\platforms\cpp\project\vs\ignite.sln`(或者`ignite_86.sln`，32位平台)，在方案浏览器中点击odbc项目，然后选择“Build”，Visual Studio会自动地检测并且构建所有必要的依赖。

.sln文件的路径可能会有所不同，具体取决于是从源文件还是从二进制文件进行构建。如果在`%IGNITE_HOME%\platforms\cpp\project\vs\`中找不到.sln文件，可以尝试在`%IGNITE_HOME%\modules\platforms\cpp\project\vs\`中查找。
::: warning 注意
如果使用VS 2015及以后的版本（MSVC14.0及以后），需要将`legacy_stdio_definitions.lib`作为额外的库加入`odbc`项目的链接器配置以构建项目。要在IDE中将库文件加入链接器，可以打开项目节点的上下文菜单，选择`Properties`，然后在`Project Properties`对话框中，选择`Linker`，然后编辑`Linker Input`，这时就可以将`legacy_stdio_definitions.lib`加入分号分割的列表中。
:::

构建过程完成之后，会生成`ignite.odbc.dll`文件，对于64位版本，位于`%IGNITE_HOME%\platforms\cpp\project\vs\x64\Release`中，对于32位版本，位于`%IGNITE_HOME%\platforms\cpp\project\vs\Win32\Release`中。

::: warning 注意
确认为系统使用相应的驱动（32位或64位）。
:::
##### 10.1.5.2.在Windows中构建安装器

为了简化安装，构建完驱动之后可能想构建安装器，Ignite使用[WiX工具包](http://wixtoolset.org/)来生成ODBC的安装器，因此需要下载并安装WiX，记得一定要把Wix工具包的`bin`目录加入PATH变量中。

一切就绪之后，打开终端然后定位到`%IGNITE_HOME%\platforms\cpp\odbc\install`目录，按顺序执行如下的命令来构建安装器：

<Tabs>
<Tab title="64位">

```bash
candle.exe ignite-odbc-amd64.wxs
light.exe -ext WixUIExtension ignite-odbc-amd64.wixobj
```
</Tab>

<Tab title="32位">

```bash
candle.exe ignite-odbc-x86.wxs
light.exe -ext WixUIExtension ignite-odbc-x86.wixobj
```
</Tab>

</Tabs>

完成之后，目录中会出现`ignite-odbc-amd64.msi`和`ignite-odbc-x86.msi`文件，然后就可以使用它们进行安装了。

##### 10.1.5.3.在Linux上构建
在一个基于Linux的操作系统中，如果要构建及使用Ignite ODBC驱动，需要安装选择的ODBC驱动管理器，Ignite ODBC驱动已经使用[UnixODBC](http://www.unixodbc.org/)进行了测试。

**环境要求**

 - C++编译器；
 - cmake 3.6+；
 - JDK；
 - openssl，包括头文件；
 - unixODBC。

下面列出了几种流行发行版的安装说明：

<Tabs>
<Tab title="Ubuntu 18.04/20.04">

```bash
sudo apt-get install -y build-essential cmake openjdk-11-jdk unixodbc-dev libssl-dev
```
</Tab>

<Tab title="CentOS/RHEL 7">

```bash
sudo yum install -y epel-release
sudo yum install -y java-11-openjdk-devel cmake3 unixODBC-devel openssl-devel make gcc-c++
```
</Tab>

<Tab title="CentOS/RHEL 8">

```bash
sudo yum install -y java-11-openjdk-devel cmake3 unixODBC-devel openssl-devel make gcc-c++
```
</Tab>
</Tabs>

::: tip 提示
JDK只用于构建过程，并不会用于ODBC驱动。
:::

**构建ODBC驱动**

 - 为cmake创建一个构建目录，将其称为`${CPP_BUILD_DIR}`；
 - （可选）选择安装目录前缀（默认为`/usr/local`），将其称为`${CPP_INSTALL_DIR}`；
 - 通过如下命令构建和安装驱动：

<Tabs>
<Tab title="Ubuntu">

```shell
cd ${CPP_BUILD_DIR}
cmake -DCMAKE_BUILD_TYPE=Release -DWITH_ODBC=ON ${IGNITE_HOME}/platforms/cpp -DCMAKE_INSTALL_PREFIX=${CPP_INSTALL_DIR}
make
sudo make install
```
</Tab>

<Tab title="CentOS/RHEL">

```shell
cd ${CPP_BUILD_DIR}
cmake3 -DCMAKE_BUILD_TYPE=Release -DWITH_ODBC=ON  ${IGNITE_HOME}/platforms/cpp -DCMAKE_INSTALL_PREFIX=${CPP_INSTALL_DIR}
make
sudo make install
```
</Tab>
</Tabs>

构建过程完成后，可以通过如下命令找到ODBC驱动位于何处：
```bash
whereis libignite-odbc
```
路径很可能是：`/usr/local/lib/libignite-odbc.so`。
#### 10.1.6.安装ODBC驱动
要使用ODBC驱动，首先要在系统中进行注册，因此ODBC驱动管理器必须能找到它。
##### 10.1.6.1.在Windows上安装
在32位的Windows上需要使用32位版本的驱动，而在64位的Windows上可以使用64位和32位版本的驱动，也可以在64位的Windows上同时安装32位和64位版本的驱动，这样32位和64位的应用都可以使用驱动。

*使用安装器进行安装*

::: tip 注意
首先要安装微软的Microsoft Visual C++ 2010 Redistributable 32位或者64位包。
:::

这是最简单的方式，也是建议的方式，只需要启动指定版本的安装器即可：

 - 32位：`%IGNITE_HOME%\platforms\cpp\bin\odbc\ignite-odbc-x86.msi`
 - 64位：`%IGNITE_HOME%\platforms\cpp\bin\odbc\ignite-odbc-amd64.msi`

*手动安装*

要在Windows上手动安装ODBC驱动，首先要为驱动在文件系统中选择一个目录，选择一个位置后就可以把驱动放在哪并且确保所有的驱动依赖可以被解析，也就是说，它们要么位于`%PATH%`，要么和驱动DLL位于同一个目录。

之后，就需要使用`%IGNITE_HOME%/platforms/cpp/odbc/install`目录下的安装脚本之一，注意，执行这些脚本很可能需要管理员权限。

<Tabs>
<Tab title="x86">

```bash
install_x86 <absolute_path_to_32_bit_driver>
```
</Tab>

<Tab title="AMD64">

```bash
install_amd64 <absolute_path_to_64_bit_driver> [<absolute_path_to_32_bit_driver>]
```
</Tab>

</Tabs>

##### 10.1.6.2.在Linux上安装
要在Linux上构建和安装ODBC驱动，首先需要安装ODBC驱动管理器，Ignite ODBC驱动已经和[UnixODBC](http://www.unixodbc.org/)进行了测试。

如果已经构建完成并且执行了`make install`命令，`libignite-odbc.so`很可能会位于`/usr/local/lib`，要在ODBC驱动管理器中安装ODBC驱动并且可以使用，需要按照如下的步骤进行操作：

 - 确保链接器可以定位ODBC驱动的所有依赖。可以使用`ldd`命令像如下这样进行检查（假定ODBC驱动位于`/usr/local/lib`）:`ldd /usr/local/lib/libignite-odbc.so`，如果存在到其它库的无法解析的链接，需要将这些库文件所在的目录添加到`LD_LIBRARY_PATH`；
 - 编辑`$IGNITE_HOME/platforms/cpp/odbc/install/ignite-odbc-install.ini`文件，并且确保`Apache Ignite`段的`Driver`参数指向`libignite-odbc.so`所在的位置；
 - 要安装Ignite的ODBC驱动，可以使用如下的命令：`odbcinst -i -d -f $IGNITE_HOME/platforms/cpp/odbc/install/ignite-odbc-install.ini`，要执行这条命令，很可能需要root权限。

到现在为止，Ignite的ODBC驱动已经安装好了并且可以用了，可以像其它ODBC驱动一样，连接、使用。
### 10.2.连接串和DSN
#### 10.2.1.连接串格式
Ignite的ODBC驱动支持标准的连接串格式，下面是正常的语法：
```
connection-string ::= empty-string[;] | attribute[;] | attribute; connection-string
empty-string ::=
attribute ::= attribute-keyword=attribute-value | DRIVER=[{]attribute-value[}]
attribute-keyword ::= identifier
attribute-value ::= character-string
```
简单来说，连接串就是一个字符串，其中包含了用分号分割的参数。
#### 10.2.2.支持的参数
Ignite的ODBC驱动可以使用一些连接串/DSN参数，所有的参数都是大小写不敏感的，因此`ADDRESS`，`Address`，`address`都是有效的参数名，并且指向的是同一个参数。如果参数未指定，会使用默认值，其中的一个例外是`ADDRESS`属性，如果未指定，会使用`SERVER`和`PORT`属性代替：

|属性关键字|描述|默认值|
|---|---|---|
|`ADDRESS`|要连接的远程节点的地址，格式为：`<host>[:<port>]`。比如：localhost, example.com:12345, 127.0.0.1, 192.168.3.80:5893，如果指定了这个属性，`SERVER`和`PORT`将会被忽略。||
|`SERVER`|要连接的节点地址，如果指定了`ADDRESS`属性，本属性会被忽略。||
|`PORT`|节点的`OdbcProcessor`监听的端口,如果指定了`ADDRESS`属性，本属性会被忽略。|10800|
|`USER`|SQL连接的用户名。如果服务端开启了认证，该参数为必需。|“”|
|`PASSWORD`|SQL连接的密码。如果服务端开启了认证，该参数为必需。|“”|
|`SCHEMA`|模式名。|PUBLIC|
|`DSN`|要连接的DSN名||
|`PAGE_SIZE`|数据源的响应中返回的行数，默认值会适用于大多数场景，小些的值会导致获取数据变慢，大些的值会导致驱动的额外内存占用，以及获取下一页时的额外延迟。|1024|
|`DISTRIBUTED_JOINS`|为在ODBC连接上执行的所有查询开启非并置的分布式关联特性。|false|
|`ENFORCE_JOIN_ORDER`|强制SQL查询中表关联顺序，如果设置为`true`，查询优化器在关联时就不会对表进行再排序。|false|
|`PROTOCOL_VERSION`|使用的ODBC协议版本，目前支持如下的版本：2.1.0、2.1.5、2.3.0、2.3.2和2.5.0，因为向后兼容，也可以使用协议的早期版本。|2.3.0|
|`REPLICATED_ONLY`|配置查询只在全复制的表上执行，这是个提示，用于更高效地执行。|false|
|`COLLOCATED`|如果SQL语句包含按主键或关联键对结果集进行分组的GROUP BY子句，可以将此参数设置为true。当Ignite执行分布式查询时，会向单个集群节点发送子查询，如果事先知道待查询的数据是在同一个节点上并置在一起的，并且是按主键或关联键分组的，那么Ignite通过在参与查询的每个节点本地分组数据来实现显著的性能和网络优化。|false|
|`LAZY`|查询延迟执行。Ignite默认会将所有的结果集放入内存然后将其返回给客户端，对于不太大的结果集，这样会提供较好的性能，并且使内部的数据库锁时间最小化，因此提高了并发能力。但是，如果相对于可用内存来说结果集过大，那么会导致频繁的GC暂停，甚至`OutOfMemoryError`，如果使用这个标志，可以提示Ignite延迟加载结果集，这样可以在不大幅降低性能的前提下，最大限度地减少内存的消耗。|false|
|`SKIP_REDUCER_ON_UPDATE`|开启服务端的更新特性。当Ignite执行DML操作时，首先，它会获取所有受影响的中间行给查询发起方进行分析（通常被称为汇总），然后会准备一个更新值的批量发给远程节点。这个方式可能影响性能，如果一个DML操作会移动大量数据条目时，还可能会造成网络堵塞。使用这个标志可以提示Ignite在对应的远程节点上进行中间行的分析和更新。默认值为false，这意味着会首先获取中间行然后发给查询发起方。|false|
|`SSL_MODE`|确定服务端是否需要SSL连接。可以根据需要使用`require`或者`disable`。||
|`SSL_KEY_FILE`|指定包含服务端SSL私钥的文件名。||
|`SSL_CERT_FILE`|指定包含SSL服务器证书的文件名。||
|`SSL_CA_FILE`|指定包含SSL服务器证书颁发机构（CA）的文件名。||

#### 10.2.3.连接串示例
下面的串，可以用于`SQLDriverConnect`ODBC调用，来建立与Ignite节点的连接。

<Tabs>
<Tab title="认证">

```properties
DRIVER={Apache Ignite};
ADDRESS=localhost:10800;
SCHEMA=somecachename;
USER=yourusername;
PASSWORD=yourpassword;
SSL_MODE=[require|disable];
SSL_KEY_FILE=<path_to_private_key>;
SSL_CERT_FILE=<path_to_client_certificate>;
SSL_CA_FILE=<path_to_trusted_certificates>
```
</Tab>

<Tab title="指定缓存">

```
DRIVER={Apache Ignite};ADDRESS=localhost:10800;CACHE=yourCacheName
```
</Tab>

<Tab title="默认缓存">

```
DRIVER={Apache Ignite};ADDRESS=localhost:10800
```
</Tab>

<Tab title="DSN">

```
DSN=MyIgniteDSN
```
</Tab>

<Tab title="自定义页面大小">

```
DRIVER={Apache Ignite};ADDRESS=example.com:12901;CACHE=MyCache;PAGE_SIZE=4096
```
</Tab>
</Tabs>

#### 10.2.4.配置DSN
如果要使用[DSN](https://en.wikipedia.org/wiki/Data_source_name)(数据源名)来进行连接，可以使用同样的参数。

要在Windows上配置DSN，需要使用一个叫做`odbcad32`（32位x86系统）/`odbcad64`（64位）的系统工具，这是一个ODBC数据源管理器。

安装DSN工具时，如果使用的是预构建的msi文件，一定要先安装Microsoft Visual C++ 2010（[32位x86](https://www.microsoft.com/en-ie/download/details.aspx?id=5555)，或者[64位x64](https://www.microsoft.com/en-us/download/details.aspx?id=14632)）。

要启动这个工具，打开`Control panel`->`Administrative Tools`->`数据源（ODBC）`，当ODBC数据源管理器启动后，选择`Add...`->`Apache Ignite`，然后以正确的方式配置DSN。

![](https://ignite.apache.org/docs/2.9.0/images/odbc_dsn_configuration.png)

在Linux上配置DSN，需要找到`odbc.ini`文件，这个文件的位置各个发行版有所不同，依赖于发行版使用的特定驱动管理器，比如，如果使用`unixODBC`，那么可以执行如下的命令来输出系统级的ODBC相关信息：
```shell
odbcinst -j
```

使用`SYSTEM DATA SOURCES`和`USER DATA SOURCES`属性，可以定位`odbc.ini`文件。

找到`odbc.ini`文件之后，可以用任意编辑器打开它，然后像下面这样添加DSN片段：
```
[DSN Name]
description=<Insert your description here>
driver=Apache Ignite
<Other arguments here...>
```
### 10.3.查询和修改数据
#### 10.3.1.概述
本章会详细描述如何接入Ignite集群，如何使用ODBC驱动执行各种SQL查询。

在实现层，Ignite的ODBC驱动使用SQL字段查询来获取Ignite缓存中的数据，这意味着通过ODBC只可以访问这些[集群配置中定义](#_4-1-配置可查询字段)的字段。

另外，ODBC驱动支持DML，这意味着通过ODBC连接不仅仅可以读取数据，还可以修改数据。

::: tip 提示
这里是完整的[ODBC示例](https://github.com/apache/ignite/tree/master/modules/platforms/cpp/examples/odbc-example)。
:::

#### 10.3.2.配置Ignite集群
第一步，需要对集群节点进行配置，这个配置需要包含缓存的配置以及定义了`QueryEntities`的属性。如果应用（当前场景是ODBC驱动）要通过SQL语句进行数据的查询和修改，`QueryEntities`是必须的，或者，也可以使用DDL创建表。

<Tabs>
<Tab title="DDL">

```cpp
SQLHENV env;

// Allocate an environment handle
SQLAllocHandle(SQL_HANDLE_ENV, SQL_NULL_HANDLE, &env);

// Use ODBC ver 3
SQLSetEnvAttr(env, SQL_ATTR_ODBC_VERSION, reinterpret_cast<void*>(SQL_OV_ODBC3), 0);

SQLHDBC dbc;

// Allocate a connection handle
SQLAllocHandle(SQL_HANDLE_DBC, env, &dbc);

// Prepare the connection string
SQLCHAR connectStr[] = "DSN=My Ignite DSN";

// Connecting to Ignite Cluster.
SQLDriverConnect(dbc, NULL, connectStr, SQL_NTS, NULL, 0, NULL, SQL_DRIVER_COMPLETE);

SQLHSTMT stmt;

// Allocate a statement handle
SQLAllocHandle(SQL_HANDLE_STMT, dbc, &stmt);

SQLCHAR query1[] = "CREATE TABLE Person ( "
    "id LONG PRIMARY KEY, "
    "firstName VARCHAR, "
    "lastName VARCHAR, "
  	"salary FLOAT) "
    "WITH \"template=partitioned\"";

SQLExecDirect(stmt, query1, SQL_NTS);

SQLCHAR query2[] = "CREATE TABLE Organization ( "
    "id LONG PRIMARY KEY, "
    "name VARCHAR) "
    "WITH \"template=partitioned\"";

SQLExecDirect(stmt, query2, SQL_NTS);

SQLCHAR query3[] = "CREATE INDEX idx_organization_name ON Organization (name)";

SQLExecDirect(stmt, query3, SQL_NTS);
```
</Tab>

<Tab title="Spring XML">

```xml
<?xml version="1.0" encoding="UTF-8"?>

<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:util="http://www.springframework.org/schema/util"
       xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/util
        http://www.springframework.org/schema/util/spring-util.xsd">
  <bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">

    <!-- Enabling ODBC. -->
    <property name="odbcConfiguration">
      <bean class="org.apache.ignite.configuration.OdbcConfiguration"/>
    </property>

    <!-- Configuring cache. -->
    <property name="cacheConfiguration">
      <list>
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
          <property name="name" value="Person"/>
          <property name="cacheMode" value="PARTITIONED"/>
          <property name="atomicityMode" value="TRANSACTIONAL"/>
          <property name="writeSynchronizationMode" value="FULL_SYNC"/>

          <property name="queryEntities">
            <list>
              <bean class="org.apache.ignite.cache.QueryEntity">
                <property name="keyType" value="java.lang.Long"/>
                <property name="keyFieldName" value="id"/>
                <property name="valueType" value="Person"/>

                <property name="fields">
                  <map>
                    <entry key="firstName" value="java.lang.String"/>
                    <entry key="lastName" value="java.lang.String"/>
                    <entry key="salary" value="java.lang.Double"/>
                  </map>
                </property>
              </bean>
            </list>
          </property>
        </bean>

        <bean class="org.apache.ignite.configuration.CacheConfiguration">
          <property name="name" value="Organization"/>
          <property name="cacheMode" value="PARTITIONED"/>
          <property name="atomicityMode" value="TRANSACTIONAL"/>
          <property name="writeSynchronizationMode" value="FULL_SYNC"/>

          <property name="queryEntities">
            <list>
              <bean class="org.apache.ignite.cache.QueryEntity">
                <property name="keyType" value="java.lang.Long"/>
                <property name="keyFieldName" value="id"/>
                <property name="valueType" value="Organization"/>

                <property name="fields">
                  <map>
                    <entry key="id" value="java.lang.Integer"/>
                    <entry key="name" value="java.lang.String"/>
                  </map>
                </property>

                <property name="indexes">
                    <list>
                        <bean class="org.apache.ignite.cache.QueryIndex">
                            <constructor-arg value="name"/>
                        </bean>
                    </list>
                </property>
              </bean>
            </list>
          </property>
        </bean>
      </list>
    </property>
  </bean>
</beans>
```
</Tab>
</Tabs>

从上述配置中可以看出，定义了两个缓存，包含了`Person`和`Organization`类型的数据，它们都列出了使用SQL可以读写的特定字段和索引。
#### 10.3.3.接入集群
配置好然后启动集群，就可以从ODBC驱动端接入了。如何做呢？准备一个有效的连接串然后连接时将其作为一个参数传递给ODBC驱动就可以了。

另外，也可以像下面这样使用一个[预定义的DSN](#_10-2-4-配置dsn)来接入。
```cpp
SQLHENV env;

// Allocate an environment handle
SQLAllocHandle(SQL_HANDLE_ENV, SQL_NULL_HANDLE, &env);

// Use ODBC ver 3
SQLSetEnvAttr(env, SQL_ATTR_ODBC_VERSION, reinterpret_cast<void*>(SQL_OV_ODBC3), 0);

SQLHDBC dbc;

// Allocate a connection handle
SQLAllocHandle(SQL_HANDLE_DBC, env, &dbc);

// Prepare the connection string
SQLCHAR connectStr[] = "DSN=My Ignite DSN";

// Connecting to Ignite Cluster.
SQLRETURN ret = SQLDriverConnect(dbc, NULL, connectStr, SQL_NTS, NULL, 0, NULL, SQL_DRIVER_COMPLETE);

if (!SQL_SUCCEEDED(ret))
{
  SQLCHAR sqlstate[7] = { 0 };
  SQLINTEGER nativeCode;

  SQLCHAR errMsg[BUFFER_SIZE] = { 0 };
  SQLSMALLINT errMsgLen = static_cast<SQLSMALLINT>(sizeof(errMsg));

  SQLGetDiagRec(SQL_HANDLE_DBC, dbc, 1, sqlstate, &nativeCode, errMsg, errMsgLen, &errMsgLen);

  std::cerr << "Failed to connect to Apache Ignite: "
            << reinterpret_cast<char*>(sqlstate) << ": "
            << reinterpret_cast<char*>(errMsg) << ", "
            << "Native error code: " << nativeCode
            << std::endl;

  // Releasing allocated handles.
  SQLFreeHandle(SQL_HANDLE_DBC, dbc);
  SQLFreeHandle(SQL_HANDLE_ENV, env);

  return;
}
```
#### 10.3.4.查询数据
都准备好后，就可以使用ODBC API执行SQL查询了。
```cpp
SQLHSTMT stmt;

// Allocate a statement handle
SQLAllocHandle(SQL_HANDLE_STMT, dbc, &stmt);

SQLCHAR query[] = "SELECT firstName, lastName, salary, Organization.name FROM Person "
  "INNER JOIN \"Organization\".Organization ON Person.orgId = Organization.id";
SQLSMALLINT queryLen = static_cast<SQLSMALLINT>(sizeof(queryLen));

SQLRETURN ret = SQLExecDirect(stmt, query, queryLen);

if (!SQL_SUCCEEDED(ret))
{
  SQLCHAR sqlstate[7] = { 0 };
  SQLINTEGER nativeCode;

  SQLCHAR errMsg[BUFFER_SIZE] = { 0 };
  SQLSMALLINT errMsgLen = static_cast<SQLSMALLINT>(sizeof(errMsg));

  SQLGetDiagRec(SQL_HANDLE_DBC, dbc, 1, sqlstate, &nativeCode, errMsg, errMsgLen, &errMsgLen);

  std::cerr << "Failed to perfrom SQL query upon Apache Ignite: "
            << reinterpret_cast<char*>(sqlstate) << ": "
            << reinterpret_cast<char*>(errMsg) << ", "
            << "Native error code: " << nativeCode
            << std::endl;
}
else
{
  // Printing the result set.
  struct OdbcStringBuffer
  {
    SQLCHAR buffer[BUFFER_SIZE];
    SQLLEN resLen;
  };

  // Getting a number of columns in the result set.
  SQLSMALLINT columnsCnt = 0;
  SQLNumResultCols(stmt, &columnsCnt);

  // Allocating buffers for columns.
  std::vector<OdbcStringBuffer> columns(columnsCnt);

  // Binding colums. For simplicity we are going to use only
  // string buffers here.
  for (SQLSMALLINT i = 0; i < columnsCnt; ++i)
    SQLBindCol(stmt, i + 1, SQL_C_CHAR, columns[i].buffer, BUFFER_SIZE, &columns[i].resLen);

  // Fetching and printing data in a loop.
  ret = SQLFetch(stmt);
  while (SQL_SUCCEEDED(ret))
  {
    for (size_t i = 0; i < columns.size(); ++i)
      std::cout << std::setw(16) << std::left << columns[i].buffer << " ";

    std::cout << std::endl;

    ret = SQLFetch(stmt);
  }
}

// Releasing statement handle.
SQLFreeHandle(SQL_HANDLE_STMT, stmt);
```

::: tip 列绑定
在上例中，所有的列都绑定到`SQL_C_CHAR`，这意味着获取时所有的值都会被转换成字符串，这样做是为了简化，获取时进行值转换是非常慢的，因此默认的做法应该是与存储采用同样的方式进行获取。
:::

#### 10.3.5.插入数据
要将新的数据插入集群，ODBC端可以使用`INSERT`语句。
```cpp
SQLHSTMT stmt;

// Allocate a statement handle
SQLAllocHandle(SQL_HANDLE_STMT, dbc, &stmt);

SQLCHAR query[] =
	"INSERT INTO Person (id, orgId, firstName, lastName, resume, salary) "
	"VALUES (?, ?, ?, ?, ?, ?)";

SQLPrepare(stmt, query, static_cast<SQLSMALLINT>(sizeof(query)));

// Binding columns.
int64_t key = 0;
int64_t orgId = 0;
char name[1024] = { 0 };
SQLLEN nameLen = SQL_NTS;
double salary = 0.0;

SQLBindParameter(stmt, 1, SQL_PARAM_INPUT, SQL_C_SLONG, SQL_BIGINT, 0, 0, &key, 0, 0);
SQLBindParameter(stmt, 2, SQL_PARAM_INPUT, SQL_C_SLONG, SQL_BIGINT, 0, 0, &orgId, 0, 0);
SQLBindParameter(stmt, 3, SQL_PARAM_INPUT, SQL_C_CHAR, SQL_VARCHAR,	sizeof(name), sizeof(name), name, 0, &nameLen);
SQLBindParameter(stmt, 4, SQL_PARAM_INPUT, SQL_C_DOUBLE, SQL_DOUBLE, 0, 0, &salary, 0, 0);

// Filling cache.
key = 1;
orgId = 1;
strncpy(name, "John", sizeof(name));
salary = 2200.0;

SQLExecute(stmt);
SQLMoreResults(stmt);

++key;
orgId = 1;
strncpy(name, "Jane", sizeof(name));
salary = 1300.0;

SQLExecute(stmt);
SQLMoreResults(stmt);

++key;
orgId = 2;
strncpy(name, "Richard", sizeof(name));
salary = 900.0;

SQLExecute(stmt);
SQLMoreResults(stmt);

++key;
orgId = 2;
strncpy(name, "Mary", sizeof(name));
salary = 2400.0;

SQLExecute(stmt);

// Releasing statement handle.
SQLFreeHandle(SQL_HANDLE_STMT, stmt);
```
下面，是不使用预编译语句插入Organization数据：
```cpp
SQLHSTMT stmt;

// Allocate a statement handle
SQLAllocHandle(SQL_HANDLE_STMT, dbc, &stmt);

SQLCHAR query1[] = "INSERT INTO \"Organization\".Organization (id, name)
    VALUES (1L, 'Some company')";

SQLExecDirect(stmt, query1, static_cast<SQLSMALLINT>(sizeof(query1)));

SQLFreeStmt(stmt, SQL_CLOSE);

SQLCHAR query2[] = "INSERT INTO \"Organization\".Organization (id, name)
    VALUES (2L, 'Some other company')";

  SQLExecDirect(stmt, query2, static_cast<SQLSMALLINT>(sizeof(query2)));

// Releasing statement handle.
SQLFreeHandle(SQL_HANDLE_STMT, stmt);
```
::: warning 错误检查
为了简化，上面的代码没有进行错误检查，但是在生产环境中不要这样做。
:::
#### 10.3.6.更新数据
下面使用`UPDATE`语句更新存储在集群中的部分人员的工资信息：
```cpp
void AdjustSalary(SQLHDBC dbc, int64_t key, double salary)
{
  SQLHSTMT stmt;

  // Allocate a statement handle
  SQLAllocHandle(SQL_HANDLE_STMT, dbc, &stmt);

  SQLCHAR query[] = "UPDATE Person SET salary=? WHERE id=?";

  SQLBindParameter(stmt, 1, SQL_PARAM_INPUT,
      SQL_C_DOUBLE, SQL_DOUBLE, 0, 0, &salary, 0, 0);

  SQLBindParameter(stmt, 2, SQL_PARAM_INPUT, SQL_C_SLONG,
      SQL_BIGINT, 0, 0, &key, 0, 0);

  SQLExecDirect(stmt, query, static_cast<SQLSMALLINT>(sizeof(query)));

  // Releasing statement handle.
  SQLFreeHandle(SQL_HANDLE_STMT, stmt);
}

...
AdjustSalary(dbc, 3, 1200.0);
AdjustSalary(dbc, 1, 2500.0);
```
#### 10.3.7.删除数据
最后，使用`DELETE`语句删除部分记录：
```cpp
void DeletePerson(SQLHDBC dbc, int64_t key)
{
  SQLHSTMT stmt;

  // Allocate a statement handle
  SQLAllocHandle(SQL_HANDLE_STMT, dbc, &stmt);

  SQLCHAR query[] = "DELETE FROM Person WHERE id=?";

  SQLBindParameter(stmt, 1, SQL_PARAM_INPUT, SQL_C_SLONG, SQL_BIGINT,
      0, 0, &key, 0, 0);

  SQLExecDirect(stmt, query, static_cast<SQLSMALLINT>(sizeof(query)));

  // Releasing statement handle.
  SQLFreeHandle(SQL_HANDLE_STMT, stmt);
}

...
DeletePerson(dbc, 1);
DeletePerson(dbc, 4);
```
#### 10.3.8.通过参数数组进行批处理
Ignite的ODBC驱动支持在DML语句中通过[参数数组](https://docs.microsoft.com/en-us/sql/odbc/reference/develop-app/using-arrays-of-parameters)进行批处理。

还是使用上述插入数据的示例，但是只调用一次`SQLExecute`:
```cpp
SQLHSTMT stmt;

// Allocating a statement handle.
SQLAllocHandle(SQL_HANDLE_STMT, dbc, &stmt);

SQLCHAR query[] =
	"INSERT INTO Person (id, orgId, firstName, lastName, resume, salary) "
	"VALUES (?, ?, ?, ?, ?, ?)";

SQLPrepare(stmt, query, static_cast<SQLSMALLINT>(sizeof(query)));

// Binding columns.
int64_t key[4] = {0};
int64_t orgId[4] = {0};
char name[1024 * 4] = {0};
SQLLEN nameLen[4] = {0};
double salary[4] = {0};

SQLBindParameter(stmt, 1, SQL_PARAM_INPUT, SQL_C_SLONG, SQL_BIGINT, 0, 0, key, 0, 0);
SQLBindParameter(stmt, 2, SQL_PARAM_INPUT, SQL_C_SLONG, SQL_BIGINT, 0, 0, orgId, 0, 0);
SQLBindParameter(stmt, 3, SQL_PARAM_INPUT, SQL_C_CHAR, SQL_VARCHAR,	1024, 1024, name, 0, &nameLen);
SQLBindParameter(stmt, 4, SQL_PARAM_INPUT, SQL_C_DOUBLE, SQL_DOUBLE, 0, 0, salary, 0, 0);

// Filling cache.
key[0] = 1;
orgId[0] = 1;
strncpy(name, "John", 1023);
salary[0] = 2200.0;
nameLen[0] = SQL_NTS;

key[1] = 2;
orgId[1] = 1;
strncpy(name + 1024, "Jane", 1023);
salary[1] = 1300.0;
nameLen[1] = SQL_NTS;

key[2] = 3;
orgId[2] = 2;
strncpy(name + 1024 * 2, "Richard", 1023);
salary[2] = 900.0;
nameLen[2] = SQL_NTS;

key[3] = 4;
orgId[3] = 2;
strncpy(name + 1024 * 3, "Mary", 1023);
salary[3] = 2400.0;
nameLen[3] = SQL_NTS;

// Asking the driver to store the total number of processed argument sets
// in the following variable.
SQLULEN setsProcessed = 0;
SQLSetStmtAttr(stmt, SQL_ATTR_PARAMS_PROCESSED_PTR, &setsProcessed, SQL_IS_POINTER);

// Setting the size of the arguments array. This is 4 in our case.
SQLSetStmtAttr(stmt, SQL_ATTR_PARAMSET_SIZE, reinterpret_cast<SQLPOINTER>(4), 0);

// Executing the statement.
SQLExecute(stmt);

// Releasing the statement handle.
SQLFreeHandle(SQL_HANDLE_STMT, stmt);
```
::: tip 注意
注意这种类型的批处理目前只支持INSERT、UPDATE、 DELETE、和MERGE语句，还不支持SELECT，data-at-execution功能也不支持通过参数数组进行批处理。
:::
#### 10.3.9.流处理
Ignite的ODBC驱动可以通过`SET STREAMING`命令对流化数据进行批量处理，具体可以看[SET STREAMING](/doc/java/SQLReference.md#_5-2-set-streaming)的相关内容。
::: tip 注意
流处理模式中，参数数组和data-at-execution参数是不支持的。
:::
### 10.4.规范
#### 10.4.1.概述
ODBC[定义](https://msdn.microsoft.com/en-us/library/ms710289.aspx)了若干接口一致性级别，在本章中可以知道Ignite的ODBC驱动支持了哪些特性。
#### 10.4.2.核心接口一致性

|特性|支持程度|备注|
|---|---|---|
|通过调用`SQLAllocHandle`和`SQLFreeHandle`来分配和释放所有处理器类型|是||
|使用`SQLFreeStmt`函数的所有形式|是||
|通过调用`SQLBindCol`，绑定列结果集|是||
|通过调用`SQLBindParameter`和`SQLNumParams`，处理动态参数，包括参数数组，只针对输入方向，|是||
|指定绑定偏移量|是||
|使用数据执行对话框，涉及`SQLParamData`和`SQLPutData`的调用|是||
|管理游标和游标名|部分|实现了`SQLCloseCursor`，Ignite不支持命名游标|
|通过调用`SQLColAttribute`，`SQLDescribeCol`，`SQLNumResultCols`和`SQLRowCount`，访问结果集的描述（元数据）|是||
|通过调用目录函数`SQLColumns`，`SQLGetTypeInfo`，`SQLStatistics`和`SQLStatistics`查询数据字典|部分|不支持SQLStatistics|
|通过调用`SQLConnect`，`SQLDataSources`，`SQLDisconnect`和`SQLDriverConnect`管理数据源和连接，通过`SQLDrivers`获取驱动的信息，不管支持ODBC那个级别。|是||
|通过调用`SQLExecDirect`，`SQLExecute`和`SQLPrepare`预编译和执行SQL语句。|是||
|通过调用`SQLFetch`，或者将`FetchOrientation`参数设置为`SQL_FETCH_NEXT`之后调用`SQLFetchScroll`，获取一个结果集或者多行数据中的一行，只能向前|是||
|通过调用`SQLGetData`，获得一个未绑定的列|是||
|通过调用`SQLGetConnectAttr`、`SQLGetEnvAttr`、`SQLGetStmtAttr`，获取所有属性的当前值，或者通过调用`SQLSetConnectAttr`、`SQLSetEnvAttr`、`SQLSetStmtAttr`，将所有属性赋为默认值，以及为特定属性赋为非默认值。|部分|并不支持所有属性|
|通过调用`SQLCopyDesc`、`SQLGetDescField`、`SQLGetDescRec`、`SQLSetDescField`、`SQLSetDescRec`，操作描述符的特定字段。|否||
|通过调用`SQLGetDiagField`、`SQLGetDiagRec`，获得诊断信息。|是||
|通过调用`SQLGetFunctions`和`SQLGetInfo`，检测驱动兼容性，以及通过调用`SQLNativeSql`，在发送到数据源之前检测SQL语句中的任何文本代换的结果|是||
|使用`SQLEndTran`的语法提交一个事务，驱动的核心级别不需要支持真事务，因此，应用无法指定`SQL_ROLLBACK`或者为`SQL_ATTR_AUTOCOMMIT`连接属性指定`SQL_AUTOCOMMIT_OFF`|是||
|调用`SQLCancel`取消数据执行对话框，以及多线程环境中，在另一个线程中取消ODBC函数的执行，核心级别的接口一致性不需要支持函数的异步执行，也不需要使用`SQLCancel`取消一个ODBC函数的异步执行。平台和ODBC驱动都不需要多线程地同时自主活动，不过在多线程环境中，ODBC驱动必须是线程安全的，从应用来的请求的序列化是实现这个规范的一致的方式，即使它导致了一系列的性能问题。|否|当前的ODBC驱动实现不支持异步执行|
|通过调用`SQLSpecialColumns`获得表的行标识符`SQL_BEST_ROWID`。|部分|当前的实现总是返回空|

#### 10.4.3.Level1接口一致性

|特性|支持程度|备注|
|---|---|---|
|指定数据库表和视图的模式（使用两部分命名）。|是||
|ODBC函数调用的真正异步执行，在给定的连接上，适用的函数要么是全同步的，要么是全异步的。|否||
|使用可滚动的游标，调用`SQLFetchScroll`时使用`FetchOrientation`参数而不是`SQL_FETCH_NEXT`，可以在方法内访问结果集而不是只能向前。|否||
|通过调用`SQLPrimaryKeys`获得表的主键。|部分|目前返回空结果集。|
|使用存储过程，通过调用`SQLProcedureColumns`和`SQLProcedures`，使用ODBC的转义序列进行存储过程数据字典的查询以及存储过程的调用。|否||
|通过调用`SQLBrowseConnect`，通过交互式浏览可用的服务器接入一个数据源。|否||
|使用ODBC函数而不是SQL语句来执行特定的数据库操作：带有`SQL_POSITION`和`SQL_REFRESH`的`SQLSetPos`。|否||
|通过调用`SQLMoreResults`，访问由批处理和存储过程生成的多结果集的内容。|是||
|划定跨越多个ODBC函数的事务边界，获得真正的原子性以及在`SQLEndTran`中指定`SQL_ROLLBACK`的能力。|否|Ignite SQL不支持事务|

#### 10.4.4.Level2接口一致性

|特性|支持程度|备注|
|---|---|---|
|使用三部分命名的数据库表和视图。|否|Ignite SQL不支持catalog。|
|通过调用`SQLDescribeParam`描述动态参数。|是||
|不仅仅使用输入参数，还使用输出参数以及输入/输出参数，还有存储过程的结果。|否|Ignite SQL不支持输出参数。|
|使用书签，通过在第0列上调用`SQLDescribeCol`和`SQLColAttribute`获得书签；通过调用`SQLFetchScroll`时将参数`FetchOrientation`配置为`SQL_FETCH_BOOKMARK`，在书签上进行获取；通过调用`SQLBulkOperations`时将参数配置为`SQL_UPDATE_BY_BOOKMARK`、`SQL_DELETE_BY_BOOKMARK`、`SQL_FETCH_BY_BOOKMARK`可以进行书签的更新、删除和获取操作。|否|Ignite SQL不支持书签。|
|通过调用`SQLColumnPrivileges`、`SQLForeignKeys`、`SQLTablePrivileges`获取数据字典的高级信息。|部分|`SQLForeignKeys`已经实现，但是返回空的结果集。|
|通过在`SQLBulkOperations`中使用`SQL_ADD`或者在`SQLSetPos`中使用`SQL_DELETE`或`SQL_UPDATE`，使用ODBC函数而不是SQL语句执行额外的数据库操作。|否||
|为特定的个别语句开启ODBC函数的异步执行。|否||
|通过调用`SQLSpecialColumns`获得表的`SQL_ROWVER`列标识符。|部分|已实现，但是返回空结果集。|
|为`SQL_ATTR_CONCURRENCY`语句参数配置除了`SQL_CONCUR_READ_ONLY`以外的至少一个值。|否||
|登录请求以及SQL查询的超时功能(`SQL_ATTR_LOGIN_TIMEOUT`和`SQL_ATTR_QUERY_TIMEOUT`)。|部分|`SQL_ATTR_QUERY_TIMEOUT`支持已实现，`SQL_ATTR_LOGIN_TIMEOUT`还未实现。|
|修改默认隔离级别的功能，在隔离级别为`序列化`时支持事务的功能。|否|Ignite SQL不支持事务。|

#### 10.4.5.函数支持

|函数名|支持程度|一致性级别|
|---|---|---|
|SQLAllocHandle|是|Core|
|SQLBindCol|是|Core|
|SQLBindParameter|是|Core|
|SQLBrowseConnect|否|Level1|
|SQLBulkOperations|否|Level1|
|SQLCancel|否|Core|
|SQLCloseCursor|是|Core|
|SQLColAttribute|是|Core|
|SQLColumnPrivileges|否|Level2|
|SQLColumns|是|Core|
|SQLConnect|是|Core|
|SQLCopyDesc|否|Core|
|SQLDataSources|N/A|Core|
|SQLDescribeCol|是|Core|
|SQLDescribeParam|是|Level2|
|SQLDisconnect|是|Core|
|SQLDriverConnect|是|Core|
|SQLDrivers|N/A|Core|
|SQLEndTran|部分|Core|
|SQLExecDirect|是|Core|
|SQLExecute|是|Core|
|SQLFetch|是|Core|
|SQLFetchScroll|是|Core|
|SQLForeignKeys|部分|Level2|
|SQLFreeHandle|是|Core|
|SQLFreeStmt|是|Core|
|SQLGetConnectAttr|部分|Core|
|SQLGetCursorName|否|Core|
|SQLGetData|是|Core|
|SQLGetDescField|否|Core|
|SQLGetDescRec|否|Core|
|SQLGetDiagField|是|Core|
|SQLGetDiagRec|是|Core|
|SQLGetEnvAttr|部分|Core|
|SQLGetFunctions|否|Core|
|SQLGetInfo|是|Core|
|SQLGetStmtAttr|部分|Core|
|SQLGetTypeInfo|是|Core|
|SQLMoreResults|是|Level1|
|SQLNativeSql|是|Core|
|SQLNumParams|是|Core|
|SQLNumResultCols|是|Core|
|SQLParamData|是|Core|
|SQLPrepare|是|Core|
|SQLPrimaryKeys|部分|Level1|
|SQLProcedureColumns|否|Level1|
|SQLProcedures|否|Level1|
|SQLPutData|是|Core|
|SQLRowCount|是|Core|
|SQLSetConnectAttr|部分|Core|
|SQLSetCursorName|否|Core|
|SQLSetDescField|否|Core|
|SQLSetDescRec|否|Core|
|SQLSetEnvAttr|部分|Core|
|SQLSetPos|否|Level1|
|SQLSetStmtAttr|部分|Core|
|SQLSpecialColumns|部分|Core|
|SQLStatistics|否|Core|
|SQLTablePrivileges|否|Level2|
|SQLTables|是|Core|

#### 10.4.6.环境属性一致性

|特性|支持程度|一致性级别|
|---|---|---|
|`SQL_ATTR_CONNECTION_POOLING`|否|可选|
|`SQL_ATTR_CP_MATCH`|否|可选|
|`SQL_ATTR_ODBC_VER`|是|Core|
|`SQL_ATTR_OUTPUT_NTS`|是|可选|

#### 10.4.7.连接属性一致性

|特性|支持程度|一致性级别|
|---|---|---|
|`SQL_ATTR_ACCESS_MODE`|否|Core|
|`SQL_ATTR_ASYNC_ENABLE`|否|Level1/Level2|
|`SQL_ATTR_AUTO_IPD`|否|Level2|
|`SQL_ATTR_AUTOCOMMIT`|否|Level1|
|`SQL_ATTR_CONNECTION_DEAD`|是|Level1|
|`SQL_ATTR_CONNECTION_TIMEOUT`|是|Level2|
|`SQL_ATTR_CURRENT_CATALOG`|否|Level2|
|`SQL_ATTR_LOGIN_TIMEOUT`|否|Level2|
|`SQL_ATTR_ODBC_CURSORS`|否|Core|
|`SQL_ATTR_PACKET_SIZE`|否|Level2|
|否`SQL_ATTR_QUIET_MODE`|否|Core|
|`SQL否_ATTR_TRACE`|否|Core|
|`SQL_AT否TR_TRACEFILE`|否|Core|
|`SQL_AT否TR_TRANSLATE_LIB`|否|Core|
|`SQL_ATTR_TRANSLATE_OPTION`|否|Core|
|`SQL_ATTR_TXN_ISOLATION`|否|Level1/Level2|

#### 10.4.8.语句属性一致性

|特性|支持程度|一致性级别|
|---|---|---|
|`SQL_ATTR_APP_PARAM_DESC`|部分|Core|
|`SQL_ATTR_APP_ROW_DESC`|部分|Core|
|`SQL_ATTR_ASYNC_ENABLE`|否|Level1/Level2|
|`SQL_ATTR_CONCURRENCY`|否|Level1/Level2|
|`SQL_ATTR_CURSOR_SCROLLABLE`|否|Level1|
|`SQL_ATTR_CURSOR_SENSITIVITY`|否|Level2|
|`SQL_ATTR_CURSOR_TYPE`|否|Level1/Level2|
|`SQL_ATTR_ENABLE_AUTO_IPD`|否|Level2|
|`SQL_ATTR_FETCH_BOOKMARK_PTR`|否|Level2|
|`SQL_ATTR_IMP_PARAM_DESC`|部分|Core|
|`SQL_ATTR_IMP_ROW_DESC`|部分|Core|
|`SQL_ATTR_KEYSET_SIZE`|否|Level2|
|`SQL_ATTR_MAX_LENGTH`|否|Level1|
|`SQL_ATTR_MAX_ROWS`|否|Level1|
|`SQL_ATTR_METADATA_ID`|否|Core|
|`SQL_ATTR_NOSCAN`|否|Core|
|`SQL_ATTR_PARAM_BIND_OFFSET_PTR`|是|Core|
|`SQL_ATTR_PARAM_BIND_TYPE`|否|Core|
|`SQL_ATTR_PARAM_OPERATION_PTR`|否|Core|
|`SQL_ATTR_PARAM_STATUS_PTR`|是|Core|
|`SQL_ATTR_PARAMS_PROCESSED_PTR`|是|Core|
|`SQL_ATTR_PARAMSET_SIZE`|是|Core|
|`SQL_ATTR_QUERY_TIMEOUT`|是|Level2|
|`SQL_ATTR_RETRIEVE_DATA`|否|Level1|
|`SQL_ATTR_ROW_ARRAY_SIZE`|是|Core|
|`SQL_ATTR_ROW_BIND_OFFSET_PTR`|是|Core|
|`SQL_ATTR_ROW_BIND_TYPE`|是|Core|
|`SQL_ATTR_ROW_NUMBER`|否|Level1|
|`SQL_ATTR_ROW_OPERATION_PTR`|否|Level1|
|`SQL_ATTR_ROW_STATUS_PTR`|是|Core|
|`SQL_ATTR_ROWS_FETCHED_PTR`|是|Core|
|`SQL_ATTR_SIMULATE_CURSOR`|否|Level2|
|`SQL_ATTR_USE_BOOKMARKS`|否|Level2|

#### 10.4.9.描述符头字段一致性

|特性|支持程度|一致性级别|
|---|---|---|
|`SQL_DESC_ALLOC_TYPE`|否|Core|
|`SQL_DESC_ARRAY_SIZE`|否|Core|
|`SQL_DESC_ARRAY_STATUS_PTR`|否|Core/Level1|
|`SQL_DESC_BIND_OFFSET_PTR`|否|Core|
|`SQL_DESC_BIND_TYPE`|否|Core|
|`SQL_DESC_COUNT`|否|Core|
|`SQL_DESC_ROWS_PROCESSED_PTR`|否|Core|

#### 10.4.10.描述符记录字段一致性

|特性|支持程度|一致性级别|
|---|---|---|
|`SQL_DESC_AUTO_UNIQUE_VALUE`|否|Level2|
|`SQL_DESC_BASE_COLUMN_NAME`|否|Core|
|`SQL_DESC_BASE_TABLE_NAME`|否|Level1|
|`SQL_DESC_CASE_SENSITIVE`|否|Core|
|`SQL_DESC_CATALOG_NAME`|否|Level2|
|`SQL_DESC_CONCISE_TYPE`|否|Core|
|`SQL_DESC_DATA_PTR`|否|Core|
|`SQL_DESC_DATETIME_INTERVAL_CODE`|否|Core|
|`SQL_DESC_DATETIME_INTERVAL_PRECISION`|否|Core|
|`SQL_DESC_DISPLAY_SIZE`|否|Core|
|`SQL_DESC_FIXED_PREC_SCALE`|否|Core|
|`SQL_DESC_INDICATOR_PTR`|否|Core|
|`SQL_DESC_LABEL`|否|Level2|
|`SQL_DESC_LENGTH`|否|Core|
|`SQL_DESC_LITERAL_PREFIX`|否|Core|
|`SQL_DESC_LITERAL_SUFFIX`|否|Core|
|`SQL_DESC_LOCAL_TYPE_NAME`|否|Core|
|`SQL_DESC_NAME`|否|Core|
|`SQL_DESC_NULLABLE`|否|Core|
|`SQL_DESC_OCTET_LENGTH`|否|Core|
|`SQL_DESC_OCTET_LENGTH_PTR`|否|Core|
|`SQL_DESC_PARAMETER_TYPE`|否|Core/Level2|
|`SQL_DESC_PRECISION`|否|Core|
|`SQL_DESC_ROWVER`|否|Level1|
|`SQL_DESC_SCALE`|否|Core|
|`SQL_DESC_SCHEMA_NAME`|否|Level1|
|`SQL_DESC_SEARCHABLE`|否|Core|
|`SQL_DESC_TABLE_NAME`|否|Level1|
|`SQL_DESC_TYPE`|否|Core|
|`SQL_DESC_TYPE_NAME`|否|Core|
|`SQL_DESC_UNNAMED`|否|Core|
|`SQL_DESC_UNSIGNED`|否|Core|
|`SQL_DESC_UPDATABLE`|否|Core|

#### 10.4.11.SQL数据类型
下面是支持的SQL数据类型：

|数据类型|是否支持|
|---|---|
|`SQL_CHAR`|是|
|`SQL_VARCHAR`|是|
|`SQL_LONGVARCHAR`|是|
|`SQL_WCHAR`|否|
|`SQL_WVARCHAR`|否|
|`SQL_WLONGVARCHAR`|否|
|`SQL_DECIMAL`|是|
|`SQL_NUMERIC`|否|
|`SQL_SMALLINT`|是|
|`SQL_INTEGER`|是|
|`SQL_REAL`|否|
|`SQL_FLOAT`|是|
|`SQL_DOUBLE`|是|
|`SQL_BIT`|是|
|`SQL_TINYINT`|是|
|`SQL_BIGINT`|是|
|`SQL_BINARY`|是|
|`SQL_VARBINARY`|是|
|`SQL_LONGVARBINARY`|是|
|`SQL_TYPE_DATE`|是|
|`SQL_TYPE_TIME`|是|
|`SQL_TYPE_TIMESTAMP`|是|
|`SQL_TYPE_UTCDATETIME`|否|
|`SQL_TYPE_UTCTIME`|否|
|`SQL_INTERVAL_MONTH`|否|
|`SQL_INTERVAL_YEAR`|否|
|`SQL_INTERVAL_YEAR_TO_MONTH`|否|
|`SQL_INTERVAL_DAY`|否|
|`SQL_INTERVAL_HOUR`|否|
|`SQL_INTERVAL_MINUTE`|否|
|`SQL_INTERVAL_SECOND`|否|
|`SQL_INTERVAL_DAY_TO_HOUR`|否|
|`SQL_INTERVAL_DAY_TO_MINUTE`|否|
|`SQL_INTERVAL_DAY_TO_SECOND`|否|
|`SQL_INTERVAL_HOUR_TO_MINUTE`|否|
|`SQL_INTERVAL_HOUR_TO_SECOND`|否|
|`SQL_INTERVAL_MINUTE_TO_SECOND`|否|
|`SQL_GUID`|是|

#### 10.4.12.C数据类型
下面是支持的C数据类型：

|数据类型|是否支持|
|---|---|
|`SQL_C_CHAR`|是|
|`SQL_C_WCHAR`|是|
|`SQL_C_SHORT`|是|
|`SQL_C_SSHORT`|是|
|`SQL_C_USHORT`|是|
|`SQL_C_LONG`|是|
|`SQL_C_SLONG`|是|
|`SQL_C_ULONG`|是|
|`SQL_C_FLOAT`|是|
|`SQL_C_DOUBLE`|是|
|`SQL_C_BIT`|是|
|`SQL_C_TINYINT`|是|
|`SQL_C_STINYINT`|是|
|`SQL_C_UTINYINT`|是|
|`SQL_C_BIGINT`|是|
|`SQL_C_SBIGINT`|是|
|`SQL_C_UBIGINT`|是|
|`SQL_C_BINARY`|是|
|`SQL_C_BOOKMARK`|否|
|`SQL_C_VARBOOKMARK`|否|
|`SQL_C_INTERVAL* (all interval types)`|否|
|`SQL_C_TYPE_DATE`|是|
|`SQL_C_TYPE_TIME`|是|
|`SQL_C_TYPE_TIMESTAMP`|是|
|`SQL_C_NUMERIC`|是|
|`SQL_C_GUID`|是|

### 10.5.数据类型
支持如下的SQL数据类型（[规范](https://docs.microsoft.com/en-us/sql/odbc/reference/appendixes/sql-data-types?view=sql-server-ver15)中列出）：

 - `SQL_CHAR`
 - `SQL_VARCHAR`
 - `SQL_LONGVARCHAR`
 - `SQL_SMALLINT`
 - `SQL_INTEGER`
 - `SQL_FLOAT`
 - `SQL_DOUBLE`
 - `SQL_BIT`
 - `SQL_TINYINT`
 - `SQL_BIGINT`
 - `SQL_BINARY`
 - `SQL_VARBINARY`
 - `SQL_LONGVARBINARY`
 - `SQL_GUID`
 - `SQL_DECIMAL`
 - `SQL_TYPE_DATE`
 - `SQL_TYPE_TIMESTAMP`
 - `SQL_TYPE_TIME`

### 10.6.错误码
要获取错误码， 可以使用`SQLGetDiagRec()`函数，它会返回一个ANSI SQL标准定义的错误码字符串，比如：
```cpp
SQLHENV env;
SQLAllocHandle(SQL_HANDLE_ENV, SQL_NULL_HANDLE, &env);

SQLSetEnvAttr(env, SQL_ATTR_ODBC_VERSION, reinterpret_cast<void*>(SQL_OV_ODBC3), 0);

SQLHDBC dbc;
SQLAllocHandle(SQL_HANDLE_DBC, env, &dbc);

SQLCHAR connectStr[] = "DRIVER={Apache Ignite};SERVER=localhost;PORT=10800;SCHEMA=Person;";
SQLDriverConnect(dbc, NULL, connectStr, SQL_NTS, 0, 0, 0, SQL_DRIVER_COMPLETE);

SQLAllocHandle(SQL_HANDLE_STMT, dbc, &stmt);

SQLCHAR query[] = "SELECT firstName, lastName, resume, salary FROM Person";
SQLRETURN ret = SQLExecDirect(stmt, query, SQL_NTS);

if (ret != SQL_SUCCESS)
{
	SQLCHAR sqlstate[7] = "";
	SQLINTEGER nativeCode;

	SQLCHAR message[1024];
	SQLSMALLINT reallen = 0;

	int i = 1;
	ret = SQLGetDiagRec(SQL_HANDLE_STMT, stmt, i, sqlstate,
                      &nativeCode, message, sizeof(message), &reallen);

	while (ret != SQL_NO_DATA)
	{
		std::cout << sqlstate << ": " << message;

		++i;
		ret = SQLGetDiagRec(SQL_HANDLE_STMT, stmt, i, sqlstate,
                        &nativeCode, message, sizeof(message), &reallen);
	}
}
```
下表中列出了所有Ignite目前支持的错误码，该列表未来可能会扩展：

|错误码|描述|
|---|---|
|`01S00`|无效连接串属性|
|`01S02`|驱动程序不支持指定的值，并替换了一个类似的值|
|`08001`|驱动接入集群失败|
|`08002`|连接已经建立|
|`08003`|未知原因导致的连接处于关闭状态|
|`08004`|连接被集群踢出|
|`08S01`|连接失败|
|`22026`|字符串长度与数据执行对话框不匹配|
|`23000`|违反完整性约束（比如主键重复、主键为空等等）|
|`24000`|无效的游标状态|
|`42000`|请求的语法错误|
|`42S01`|表已经存在|
|`42S02`|表不存在|
|`42S11`|索引已经存在|
|`42S12`|索引不存在|
|`42S21`|列已经存在|
|`42S22`|列不存在|
|`HY000`|一般性错误，具体看错误消息|
|`HY001`|内存分配错误|
|`HY003`|无效的应用缓冲区类型|
|`HY004`|无效的SQL数据类型|
|`HY009`|无效的空指针使用|
|`HY010`|函数调用顺序错误|
|`HY090`|无效的字符串和缓冲区长度（比如长度为负或者为0）|
|`HY092`|可选类型超范围|
|`HY097`|列类型超范围|
|`HY105`|无效的参数类型|
|`HY106`|获取类型超范围|
|`HYC00`|特性未实现|
|`IM001`|函数不支持|

## 11.多版本并发控制
::: danger 警告
MVCC当前处于测试阶段。
:::
### 11.1.概述
配置为`TRANSACTIONAL_SNAPSHOT`原子化模式的缓存，支持SQL事务以及[键-值事务](/doc/java/Transactions.md)，并且为两种类型的事务开启了多版本并发控制（MVCC）。
### 11.2.多版本并发控制
多版本并发控制，是一种在多用户并发访问时，控制数据一致性的方法，MVCC实现了[快照隔离](https://en.wikipedia.org/wiki/Snapshot_isolation)保证，确保每个事务总是看到一致的数据快照。

每个事务在开始时会获得一个数据的一致性快照，并且只能查看和修改该快照中的数据。当事务更新一个条目时，Ignite验证其它事务没有更新该条目，并创建该条目的一个新的版本，新版本只有在事务成功提交时才对其它事务可见。如果该条目已被更新，当前事务会失败并抛出异常（关于如何处理更新冲突，请参见下面的[并发更新](#_11-4-并发更新)章节的介绍）。

快照不是物理快照，而是由MVCC协调器生成的逻辑快照，MVCC协调器是协调集群中的事务活动的集群节点。协调器跟踪所有活动的事务，并在每个事务完成时得到通知。启用MVCC的缓存的所有操作都需要从协调器请求一个数据的快照。
### 11.3.开启MVCC
要为缓存开启MVCC，需要在缓存配置中使用`TRANSACTIONAL_SNAPSHOT`原子化模式，如果使用`CREATE TABLE`命令创建表，则需要在该命令的`WITH`子句中将原子化模式作为参数传进去。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            <property name="name" value="myCache"/>
            <property name="atomicityMode" value="TRANSACTIONAL_SNAPSHOT"/>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="SQL">

```sql
CREATE TABLE Person WITH "ATOMICITY=TRANSACTIONAL_SNAPSHOT"
```
</Tab>
</Tabs>

::: tip 提示
`TRANSACTIONAL_SNAPSHOT`模式只支持默认的并发模型（`PESSIMISTIC`）和默认的隔离级别（`REPEATABLE_READ`），具体可以看上面的[并发模型和隔离级别](/doc/java/Transactions.md#_3-并发模型和隔离级别)章节。
:::
### 11.4.并发更新
在一个事务中，如果一个条目先被读取然后被更新，那么就有一种可能性，即另一个事务可能在两个操作之间切入然后首先更新该条目，这时，当第一个事务试图更新该条目时就会抛出异常，然后该事务会被标记为`只能回滚`，这时开发者就需要进行事务重试。

那么怎么知道发生了冲突呢？

 - 如果使用了Java的事务API，会抛出`CacheException`异常（异常信息为`Cannot serialize transaction due to write conflict (transaction is marked for rollback)`），并且`Transaction.rollbackOnly`标志为`true`；
 - 如果通过JDBC/ODBC驱动执行了SQL事务，那么会得到`SQLSTATE:40001`错误代码。

<Tabs>
<Tab title="Java">

```java
for(int i = 1; i <=5 ; i++) {
    try (Transaction tx = Ignition.ignite().transactions().txStart()) {
        System.out.println("attempt #" + i + ", value: " + cache.get(1));
        try {
            cache.put(1, "new value");
            tx.commit();
            System.out.println("attempt #" + i + " succeeded");
            break;
        } catch (CacheException e) {
            if (!tx.isRollbackOnly()) {
              // Transaction was not marked as "rollback only",
              // so it's not a concurrent update issue.
              // Process the exception here.
                break;
            }
        }
    }
}
```
</Tab>

<Tab title="JDBC">

```java
Class.forName("org.apache.ignite.IgniteJdbcThinDriver");

// Open JDBC connection.
Connection conn = DriverManager.getConnection("jdbc:ignite:thin://127.0.0.1");

PreparedStatement updateStmt = null;
PreparedStatement selectStmt = null;

try {
    // starting a transaction
    conn.setAutoCommit(false);

    selectStmt = conn.prepareStatement("select name from Person where id = 1");
    selectStmt.setInt(1, 1);
    ResultSet rs = selectStmt.executeQuery();

    if (rs.next())
        System.out.println("name = " + rs.getString("name"));

    updateStmt = conn.prepareStatement("update Person set name = ? where id = ? ");

    updateStmt.setString(1, "New Name");
    updateStmt.setInt(2, 1);
    updateStmt.executeUpdate();

    // committing the transaction
    conn.commit();
} catch (SQLException e) {
    if ("40001".equals(e.getSQLState())) {
        // retry the transaction
    } else {
        // process the exception
    }
} finally {
    if (updateStmt != null) updateStmt.close();
    if (selectStmt != null) selectStmt.close();
}
```
</Tab>

<Tab title="C#/.NET">

```csharp
for (var i = 1; i <= 5; i++)
{
    using (var tx = ignite.GetTransactions().TxStart())
    {
        Console.WriteLine($"attempt #{i}, value: {cache.Get(1)}");
        try
        {
            cache.Put(1, "new value");
            tx.Commit();
            Console.WriteLine($"attempt #{i} succeeded");
            break;
        }
        catch (CacheException)
        {
            if (!tx.IsRollbackOnly)
            {
                // Transaction was not marked as "rollback only",
                // so it's not a concurrent update issue.
                // Process the exception here.
                break;
            }
        }
    }
}
```
</Tab>

<Tab title="C++">

```cpp
for (int i = 1; i <= 5; i++)
{
    Transaction tx = ignite.GetTransactions().TxStart();
    std::cout << "attempt #" << i << ", value: " << cache.Get(1) << std::endl;
    try {
        cache.Put(1, "new value");
        tx.Commit();
        std::cout << "attempt #" << i << " succeeded" << std::endl;
        break;
    }
    catch (IgniteError e)
    {
        if (!tx.IsRollbackOnly())
        {
            // Transaction was not marked as "rollback only",
            // so it's not a concurrent update issue.
            // Process the exception here.
            break;
        }
    }
}
```
</Tab>

</Tabs>

### 11.5.限制
#### 11.5.1.跨缓存事务
`TRANSACTIONAL_SNAPSHOT`模式是缓存级的，并且事务中涉及的缓存不允许有不同的原子化模式，因此，如果希望在一个SQL事务中覆盖多个表，则必须使用`TRANSACTIONAL_SNAPSHOT`模式创建所有表。
#### 11.5.2.嵌套事务
通过JDBC/ODBC连接参数，Ignite支持三种模式来处理SQL的嵌套事务：

JDBC连接串：
```
jdbc:ignite:thin://127.0.0.1/?nestedTransactionsMode=COMMIT
```
当在一个事务中出现了嵌套事务，系统的行为依赖于`nestedTransactionsMode`参数：

 - `ERROR`：如果发生了嵌套事务，会抛出错误，包含事务会回滚，这是默认的行为；
 - `COMMIT`：包含事务会被提交，嵌套事务开始并且在遇到`COMMIT`语句时会提交，包含事务中的其余部分会作为隐式事务执行；
 - `IGNORE`：**不要使用这个模式**，嵌套事务的开始会被忽略，嵌套事务中的语句会作为包含事务的一部分来执行，然后所有的变更会随着嵌套事务的提交而提交，包含事务中的其余部分会作为隐式事务执行。

#### 11.5.3.持续查询
如果在开启了MVCC的缓存上使用持续查询，那么有些限制需要知道：

 - 当接收到更新事件时，在MVCC协调器得知更新之前，后续读取已更新键的操作可能会在一段时间内返回旧值。这是因为更新事件是从更新键的节点发送的，并且是在键更新后立即发送的。这时MVCC协调器可能不会立即感知该更新，因此，随后的读取可能会在这段时间内返回过时的信息。
 - 当使用持续查询时，每个节点单个事务可以更新的键数量是有限制的。更新后的值保存在内存中，如果更新太多，节点可能没有足够的内存来保存所有对象。为了避免内存溢出错误，每个事务在一个节点上只能最多更新20000个键（默认值）。如果超过此值，事务将抛出异常并回滚。可以通过指定`IGNITE_MVCC_TX_SIZE_CACHING_THRESHOLD`系统属性来修改该值。

#### 11.5.4.其它的限制
开启MVCC的缓存，下面的特性是不支持的，这些限制后续的版本可能会解决：

 - [近缓存](/doc/java/ConfiguringCaches.md#_8-近缓存)；
 - [过期策略](/doc/java/ConfiguringCaches.md#_5-过期策略)；
 - [事件](/doc/java/WorkingwithEvents.md)；
 - [缓存拦截器](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/cache/CacheInterceptor.html)；
 - [外部存储](/doc/java/Persistence.md#_2-外部存储)；
 - [堆内缓存](/doc/java/ConfiguringCaches.md#_6-堆内缓存)；
 - [显式锁](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/IgniteCache.html#lock-K-)；
 - [localEvict()](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/IgniteCache.html#localEvict-java.util.Collection-)和[localPeek()](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/IgniteCache.html#localPeek-K-org.apache.ignite.cache.CachePeekMode%E2%80%A6%E2%80%8B-)方法。

<RightPane/>
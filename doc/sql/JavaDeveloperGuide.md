# Java开发向导
## 1.SQL API
除了JDBC驱动，Java开发者还可以使用特定的SQL API来查询和修改数据库中的数据。
### 1.1.SqlFieldsQueries
`SqlFieldsQuery`类是执行SQL语句并遍历结果集的接口，它是在`IgniteCache.query(SqlFieldsQuery)`方法上执行的，该方法会返回一个游标。

只需要指定几个特定的字段即可，这样可以最小化网络和序列化的开销。`SqlFieldsQuery`接受一个标准SQL查询作为构造器参数，后续的执行方式如下：
```java
IgniteCache<Long, Person> cache = ignite.cache("personCache");

// Execute query to get names of all employees.
SqlFieldsQuery sql = new SqlFieldsQuery(
  "select concat(firstName, ' ', lastName) from Person");

// Iterate over the result set.
try (QueryCursor<List<?>> cursor = cache.query(sql)) {
  for (List<?> row : cursor)
    System.out.println("personName=" + row.get(0));
}
```
::: warning 可查询字段定义
在特定字段可以被`SqlFieldsQuery`访问之前，它们应做为SQL模式的一部分，使用标准的DDL命令，或者特定的Java注解，或者`QueryEntity`配置，都可以进行字段的定义。
:::

通过`SqlFieldsQuery`，还可以使用DML命令进行数据的修改：

**INSERT**
```java
IgniteCache<Long, Person> cache = ignite.cache("personCache");

cache.query(new SqlFieldsQuery(
    "INSERT INTO Person(id, firstName, lastName) VALUES(?, ?, ?)").
    setArgs(1L, "John", "Smith"));
```
**UPDATE**
```java
IgniteCache<Long, Person> cache = ignite.cache("personCache");

cache.query(new SqlFieldsQuery("UPDATE Person set lastName = ? " +
         "WHERE id >= ?").setArgs("Jones", 2L));
```
**DELETE**
```java
IgniteCache<Long, Person> cache = ignite.cache("personCache");

cache.query(new SqlFieldsQuery("DELETE FROM Person " +
         "WHERE id >= ?").setArgs(2L));
```
**MERGE**
```java
IgniteCache<Long, Person> cache = ignite.cache("personCache");

cache.query(new SqlFieldsQuery("MERGE INTO Person(id, firstName, lastName)" +
           " values (1, 'John', 'Smith'), (5, 'Mary', 'Jones')"));
```
### 1.2.示例
Ignite的二进制包包括了一个可运行的`SqlDmlExample.java`，它是源代码的一部分，演示了上述提到的所有DML操作的使用。
## 2.模式和索引
### 2.1.概述
不管是通过[注解](#_7-2-2-基于注解的配置)或者通过[QueryEntity](#_7-2-3-基于queryentity的配置)的方式，表和索引建立之后，它们所属的模式名为`CacheConfiguration`对象中配置的缓存名，也可以使用`CacheConfiguration.setSqlSchema`方法进行修改。

但是，如果表和索引是通过DDL语句的形式定义的，那么模式名就会完全不同，这时，表和索引所属的模式名默认为`PUBLIC`。

这时，不管使用上述的哪种方式配置的表，那么一定要确保查询时要指定正确的模式名。比如，假定80%的表都是通过DDL配置的，那么通过`SqlQuery.setSchema("PUBLIC")`方法将查询的默认模式配置成`PUBLIC`就会很有意义：

Java：
```java
IgniteCache cache = ignite.getOrCreateCache(
    new CacheConfiguration<>()
        .setName("Person")
        .setIndexedTypes(Long.class, Person.class));

// Creating City table.
cache.query(new SqlFieldsQuery("CREATE TABLE City " +
    "(id int primary key, name varchar, region varchar)").setSchema("PUBLIC")).getAll();

// Creating Organization table.
cache.query(new SqlFieldsQuery("CREATE TABLE Organization " +
    "(id int primary key, name varchar, cityName varchar)").setSchema("PUBLIC")).getAll();

// Joining data between City, Organizaion and Person tables. The latter
// was created with either annotations or QueryEntity approach.
SqlFieldsQuery qry = new SqlFieldsQuery("SELECT o.name from Organization o " +
    "inner join \"Person\".Person p on o.id = p.orgId " +
    "inner join City c on c.name = o.cityName " +
    "where p.age > 25 and c.region <> 'Texas'");

// Setting the query's default schema to PUBLIC.
// Table names from the query without the schema set will be
// resolved against PUBLIC schema.
// Person table belongs to "Person" schema (person cache) and this is why
// that schema name is set explicitly.
qry.setSchema("PUBLIC");

// Executing the query.
cache.query(qry).getAll();
```
### 2.2.基于注解的配置
索引，和可查询的字段一样，是可以通过编程的方式用`@QuerySqlField`进行配置的。如下所示，期望的字段已经加注了该注解。

Java：
```java
public class Person implements Serializable {
  /** Indexed field. Will be visible for SQL engine. */
  @QuerySqlField (index = true)
  private long id;

  /** Queryable field. Will be visible for SQL engine. */
  @QuerySqlField
  private String name;

  /** Will NOT be visible for SQL engine. */
  private int age;

  /**
   * Indexed field sorted in descending order.
   * Will be visible for SQL engine.
   */
  @QuerySqlField(index = true, descending = true)
  private float salary;
}
```
Scala：
```scala
case class Person (
  /** Indexed field. Will be visible for SQL engine. */
  @(QuerySqlField @field)(index = true) id: Long,

  /** Queryable field. Will be visible for SQL engine. */
  @(QuerySqlField @field) name: String,

  /** Will NOT be visisble for SQL engine. */
  age: Int

  /**
   * Indexed field sorted in descending order.
   * Will be visible for SQL engine.
   */
  @(QuerySqlField @field)(index = true, descending = true) salary: Float
) extends Serializable {
  ...
}
```
在SQL查询中，类型名会被用作表名，这时，表名为`Person`（模式名的定义和使用前面已经描述）。

`id`和`salary`都是索引列，`id`字段升序排列（默认），而`salary`降序排列。

如果不希望索引一个字段，但是仍然想在SQL查询中使用它，那么在加注解时可以忽略`index = true`参数，这样的字段称为可查询字段，举例来说，上面的`name`就被定义为可查询字段。

最后，`age`既不是可查询字段也不是索引字段，在Ignite中，从SQL查询的角度看就是不可见的。

下面，就可以向下面这样执行SQL查询了：
```java
SqlFieldsQuery qry = new SqlFieldsQuery("SELECT id, name FROM Person" +
		"WHERE id > 1500 LIMIT 10");
```
::: tip 运行时更新索引和可查询字段
如果需要在运行时管理索引或者使新的字段对SQL引擎可见，可以使用[ALTER TABLE, CREATE/DROP INDEX](/doc/sql/SQLReference.md#_2-数据定义语言（ddl）)命令。
:::

**索引嵌套对象**

使用注解，嵌套对象的字段也可以被索引以及查询，比如，假设`Person`对象有一个`Address`对象属性：
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
`Address`类的结构如下：
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
上例中，`@QuerySqlField(index = true)`注解加在了`Address`类的所有属性上，就像`Person`类的`Address`对象一样。
这样就可以执行下面这样的查询：
```java
QueryCursor<List<?>> cursor = personCache.query(new SqlFieldsQuery(
  "select * from Person where street = 'street1'"));
```
注意在查询的where子句中不需要指定**address.street**，这是因为`Address`类的字段会被合并到`Person`表中，这样会简化对`Address`中的字段的访问。
::: tip Scala注解
在Scala类中，`@QuerySqlField`注解必须和`@Field`注解一起使用，这样这个字段对于Ignite才是可见的，就像这样的:`@(QuerySqlField @field)`。

也可以使用`ignite-scalar`模块的`@ScalarCacheQuerySqlField`注解作为替代，它不过是`@Field`注解的别名。
:::

**注册索引类型**
定义了索引字段和可查询字段之后，就需要和它们所属的对象类型一起，在SQL引擎中注册。
要告诉Ignite哪些类型应该被索引，需要通过`CacheConfiguration.setIndexedTypes`方法传入键-值对，如下所示：
```java
// Preparing configuration.
CacheConfiguration<Long, Person> ccfg = new CacheConfiguration<>();

// Registering indexed type.
ccfg.setIndexedTypes(Long.class, Person.class);
```
注意，这个方法只接收成对的类型，一个键类一个值类，基本类型需要使用包装器类。
::: tip 预定义字段
除了用`@QuerySqlField`注解标注的所有字段，每个表都有两个特别的预定义字段：`_key`和`_val`，它表示到整个键对象和值对象的链接。这很有用，比如当它们中的一个是基本类型并且希望用它的值进行过滤时。要做到这一点，执行一个`SELECT * FROM Person WHERE _key = 100`查询即可。
:::

::: tip 注意
因为有[二进制编组器](/doc/java/README.md#_10-二进制编组器)，不需要将索引类型类加入集群节点的类路径中，SQL查询引擎不需要对象反序列化就可以钻取索引和可查询字段的值。
:::

**组合索引**

当查询条件复杂时可以使用多字段索引来加快查询的速度，这时可以用`@QuerySqlField.Group`注解。如果希望一个字段参与多个组合索引时也可以将多个`@QuerySqlField.Group`注解加入`orderedGroups`中。

比如，下面的`Person`类中`age`字段加入了名为`age_salary_idx`的组合索引，它的分组序号是0并且降序排列，同一个组合索引中还有一个字段`salary`,它的分组序号是3并且升序排列。最重要的是`salary`字段还是一个单列索引(除了`orderedGroups`声明之外，还加上了`index = true`)。分组中的`order`不需要是什么特别的数值，它只是用于分组内的字段排序。

**Java：**
```java
public class Person implements Serializable {
  /** Indexed in a group index with "salary". */
  @QuerySqlField(orderedGroups={@QuerySqlField.Group(
    name = "age_salary_idx", order = 0, descending = true)})
  private int age;

  /** Indexed separately and in a group index with "age". */
  @QuerySqlField(index = true, orderedGroups={@QuerySqlField.Group(
    name = "age_salary_idx", order = 3)})
  private double salary;
}
```

::: warning 注意
将`@QuerySqlField.Group`放在`@QuerySqlField(orderedGroups={...})`外面是无效的。
:::

### 2.3.基于QueryEntity的配置
索引和字段也可以通过`org.apache.ignite.cache.QueryEntity`进行配置，它便于利用Spring进行基于XML的配置。

在上面基于注解的配置中涉及的所有概念，对于基于`QueryEntity`的方式也都有效，此外，如果类型的字段通过`@QuerySqlField`进行了配置并且通过`CacheConfiguration.setIndexedTypes`注册过的，在内部也会被转换为查询实体。

下面的示例显示的是如何像可查询字段那样定义一个单一字段索引和组合索引。
```xml
<bean class="org.apache.ignite.configuration.CacheConfiguration">
    <property name="name" value="mycache"/>
    <!-- Configure query entities -->
    <property name="queryEntities">
        <list>
            <bean class="org.apache.ignite.cache.QueryEntity">
                <!-- Setting indexed type's key class -->
                <property name="keyType" value="java.lang.Long"/>

                <!-- Key field name to be used in INSERT and SELECT queries -->
                <property name="keyFieldName" value="id"/>

                <!-- Setting indexed type's value class -->
                <property name="valueType"
                          value="org.apache.ignite.examples.Person"/>

                <!-- Defining fields that will be either indexed or queryable.
                Indexed fields are added to 'indexes' list below.-->
                <property name="fields">
                    <map>
                        <entry key="id" value="java.lang.Long"/>
                        <entry key="name" value="java.lang.String"/>
                        <entry key="salary" value="java.lang.Long "/>
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
```
SQL查询中会使用`valueType`的简称作为表名，这时，表名为`Person`。

QueryEntity定义之后，就可以执行下面的查询了：
```java
SqlFieldsQuery qry = new SqlFieldsQuery("SELECT id, name FROM Person" +
		"WHERE id > 1500 LIMIT 10");
```
::: tip 运行时更新索引和可查询字段
如果需要在运行时管理索引或者使新的字段对SQL引擎可见，可以使用[ALTER TABLE, CREATE/DROP INDEX](/doc/sql/SQLReference.md#_2-数据定义语言（ddl）)命令。
:::
### 2.4.自定义键
如果只使用预定义的SQL数据类型作为缓存键，那么就没必要对和DML相关的配置做额外的操作，这些数据类型在`GridQueryProcessor#SQL_TYPES`常量中进行定义，列举如下：
::: tip 预定义SQL数据类型
 - 所有的基本类型及其包装器，除了`char`和`Character`；
 - `String`;
 - `BigDecimal`;
 - `byte[]`;
 - `java.util.Date`, `java.sql.Date`, `java.sql.Timestamp`;
 - `java.util.UUID`。
:::

不过如果决定引入复杂的自定义缓存键，那么在DML语句中要指向这些字段就需要：

 - 在`QueryEntity`中定义这些字段，与在值对象中配置字段一样；
 - 使用新的配置参数`QueryEntitty.setKeyFields(..)`来对键和值进行区分；

下面的例子展示了如何实现：

**Java:**
```java
// Preparing cache configuration.
CacheConfiguration cacheCfg = new CacheConfiguration<>("personCache");

// Creating the query entity.
QueryEntity entity = new QueryEntity("CustomKey", "Person");

// Listing all the queryable fields.
LinkedHashMap<String, String> flds = new LinkedHashMap<>();

flds.put("intKeyField", Integer.class.getName());
flds.put("strKeyField", String.class.getName());

flds.put("firstName", String.class.getName());
flds.put("lastName", String.class.getName());

entity.setFields(flds);

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
**XML:**
```xml
<bean class="org.apache.ignite.configuration.CacheConfiguration">
    <property name="name" value="personCache"/>
    <!-- Configure query entities -->
    <property name="queryEntities">
        <list>
            <bean class="org.apache.ignite.cache.QueryEntity">
                <!-- Registering key's class. -->
                <property name="keyType" value="CustomKey"/>

                <!-- Registering value's class. -->
                <property name="valueType"
                          value="org.apache.ignite.examples.Person"/>

                <!--
                    Defining all the fields that will be accessible from DML.
                -->
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
                      	<value>intKeyField<value/>
                      	<value>strKeyField<value/>
                    </set>
                </property>
            </bean>
        </list>
    </property>
</bean>
```
::: tip 哈希值自动计算和equals实现
如果自定义键可以被序列化为二进制形式，那么Ignite会自动进行哈希值的计算并且实现`equals`方法。

但是，如果是`Externalizable`类型，那么就无法序列化为二进制形式，那么就需要自行实现`hashCode`和`equals`方法。
:::

### 2.5.空间查询
这个空间模块只对`com.vividsolutions.jts`类型的对象有用。

要配置索引以及/或者几何类型的可查询字段，可以使用和已有的非几何类型同样的方法，首先，可以使用`org.apache.ignite.cache.QueryEntity`定义索引，它对于基于Spring的XML配置文件非常方便，第二，通过`@QuerySqlField`注解来声明索引也可以达到同样的效果，它在内部会转化为`QueryEntities`。

**QuerySqlField：**
```java
/**
 * Map point with indexed coordinates.
 */
private static class MapPoint {
    /** Coordinates. */
    @QuerySqlField(index = true)
    private Geometry coords;

    /**
     * @param coords Coordinates.
     */
    private MapPoint(Geometry coords) {
        this.coords = coords;
    }
}
```
**QueryEntity:**
```xml
<bean class="org.apache.ignite.configuration.CacheConfiguration">
    <property name="name" value="mycache"/>
    <!-- Configure query entities -->
    <property name="queryEntities">
        <list>
            <bean class="org.apache.ignite.cache.QueryEntity">
                <property name="keyType" value="java.lang.Integer"/>
                <property name="valueType" value="org.apache.ignite.examples.MapPoint"/>

                <property name="fields">
                    <map>
                        <entry key="coords" value="com.vividsolutions.jts.geom.Geometry"/>
                    </map>
                </property>

                <property name="indexes">
                    <list>
                        <bean class="org.apache.ignite.cache.QueryIndex">
                            <constructor-arg value="coords"/>
                        </bean>
                    </list>
                </property>
            </bean>
        </list>
    </property>
</bean>
```
使用上述方法定义了几何类型字段之后，就可以使用存储于这些字段中值进行查询了。
```java
// Query to find points that fit into a polygon.
SqlQuery<Integer, MapPoint> query = new SqlQuery<>(MapPoint.class, "coords && ?");

// Defining the polygon's boundaries.
query.setArgs("POLYGON((0 0, 0 99, 400 500, 300 0, 0 0))");

// Executing the query.
Collection<Cache.Entry<Integer, MapPoint>> entries = cache.query(query).getAll();

// Printing number of points that fit into the area defined by the polygon.
System.out.println("Fetched points [" + entries.size() + ']');
```
::: tip 完整示例
Ignite中用于演示空间查询的可以立即执行的完整示例，可以在[这里](https://github.com/dmagda/geospatial)找到。
:::

## 3.自定义SQL函数
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
经过了上述配置的缓存部署之后，在SQL查询中就可以随意地调用自定义函数了，如下所示：
```java
// Preparing the query that uses customly defined 'sqr' function.
SqlFieldsQuery query = new SqlFieldsQuery(
  "SELECT name FROM Blocks WHERE sqr(size) > 100");

// Executing the query.
cache.query(query).getAll();
```
::: warning 注意
在自定义SQL函数可能要执行的所有节点上，通过`CacheConfiguration.setSqlFunctionClasses(...)`注册的类都需要添加到类路径中，否则在自定义函数执行时会抛出`ClassNotFoundException`异常。
:::

## 4.查询取消
Ignite中有两种方式停止长时间运行的SQL查询，SQL查询时间长的原因，比如使用了未经优化的索引等。

第一个方法是为特定的`SqlFieldsQuery`设置查询执行的超时时间。
```java
SqlFieldsQuery query = new SqlFieldsQuery("SELECT * from Person");

// Setting query execution timeout
query.setTimeout(10_000, TimeUnit.SECONDS);
```
第二个方法是使用`QueryCursor.close()`来终止查询。
```java
SqlFieldsQuery query = new SqlFieldsQuery("SELECT * FROM Person");

// Executing the query
QueryCursor<List<?>> cursor = cache.query(query);

// Halting the query that might be still in progress.
cursor.close();
```
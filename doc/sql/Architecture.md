# 架构
## 1.IgniteSQL的工作方式
### 1.1.概述
Ignite的SQL引擎是与[H2数据库](http://www.h2database.com/)紧紧绑定在一起的，简而言之，H2是一个Java写的，遵循一组开源许可证，基于内存和磁盘的速度很快的数据库。

当`ignite-indexing`模块加入节点的类路径之后，一个嵌入式的H2数据库实例就会作为Ignite节点进程的一部分被启动。如果节点是在终端中通过`ignite.sh{bat}`脚本启动的，那么该模块会自动地加入类路径，因为它已经被放入了`{apache_ignite}\libs\`目录中。

如果使用的是maven，那么需要将如下的依赖加入`pom.xml`文件：
```xml
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-indexing</artifactId>
    <version>${ignite.version}</version>
</dependency>
```
Ignite借用了H2的SQL查询解析器以及优化器还有执行计划器。最后H2会在一个特定的节点执行本地化的查询，然后会将本地的结果集传递给分布式SQL引擎用于后续处理。

不过数据和索引，通常是存储于Ignite数据网格端的，而Ignite以分布式以及容错的方式执行SQL查询，这个是H2不支持的。
Ignite SQL网格执行查询有两种方式：

首先，如果查询在一个部署为`REPLICATED`模式缓存上执行，那么Ignite会将查询发送给一个单个集群节点，然后在其上的本地化数据上执行；

第二，如果查询执行于`PARTITIONED`模式缓存，那么执行流程如下：

 - 查询会被解析然后拆分为多个映射查询以及一个汇总查询；
 - 所有的映射查询都会在持有缓存数据的所有数据节点上执行；
 - 所有的节点都会将本地执行的结果集提供给查询发起者（汇总节点）,它会通过正确地合并结果集完成汇总的过程。

::: tip 关联执行流程
关联查询的执行流程与上面描述的`分区`缓存查询执行流程没什么不同。
:::

### 1.2.并发修改
`UPDATE`和`DELETE`语句在内部会生成`SELECT`查询，目的是获得要更新的条目的集合。这个集合中的键是不会被锁定的，因此有一种可能就是在并发的情况下，属于某个键的值会被其它的查询修改。SQL引擎已经实现了一种技术，即首先避免锁定键，然后保证在DML语句执行更新时值是最新的。

总体而言，引擎会并发地检测要更新的缓存条目的子集，然后重新执行`SELECT`语句来限制要修改的键的范围。

比如下面的要执行的`UPDATE`语句：
```sql
UPDATE Person set firstName = 'Mike' WHERE lastName = 'Smith';
```
在`firstName`和`lastName`更新之前，DML引擎会生成`SELECT`查询来获得符合`UPDATE`语句的`WHERE`条件的缓存条目，语句如下：
```java
SELECT _key, _value, 'Mike' from Person WHERE lastName = 'Smith';
```

::: tip _key和_val
`_key`和`_val`关键字用于获取同时获取对象的键和包含所有属性的值，同样的关键字也可以用于应用的代码中。
:::

之后通过上面的`SELECT`获得的条目会被其它查询并发地更新：
```sql
UPDATE Person set firstName = 'Sarah' WHERE id = 1;
```
SQL引擎在`UPDATE`语句执行的更新阶段会检测到键为`1`的缓存条目要被修改，之后会暂停更新并且重新执行一个`SELECT`查询的修订版本来获得最新的条目值：
```sql
SELECT _key, _value, 'Mike' from Person WHERE secondName = 'Smith'
    AND _key IN (SELECT * FROM TABLE(KEY long = [ 1 ]))
```
这个查询只会为过时的键执行，本例中只有一个键`1`。

这个过程会一直重复，直到DML引擎确信在更新阶段所有的条目都已经更新到最新版。尝试次数的最大值是`4`，目前并没有配置参数来改变这个值。

::: tip 注意
DML引擎不会为并发删除的条目重复执行`SELECT`语句，重复执行的查询只针对还在缓存中的条目。
:::

### 1.3.已知的限制
**WHERE条件中的子查询**

`INSERT`和`MERGE`语句中的子查询和`UPDATE`和`DELETE`操作自动生成的`SELECT`查询一样，如有必要都会被分布化然后执行，要么是并置，要么是非并置的模式。

但是，如果`WHERE`语句里面有一个子查询，那么它只能以并置的模式执行。

比如，有这样一个查询：
```sql
DELETE FROM Person WHERE id IN
    (SELECT personId FROM Salary s WHERE s.amount > 2000);
```
SQL引擎会生成`SELECT`查询来获得要删除的条目列表，这个查询会在整个集群中分布化并且执行，如下所示：
```sql
SELECT _key, _val FROM Person WHERE id IN
    (SELECT personId FROM Salary s WHERE s.amount > 2000);
```
不过`IN`子句中的子查询`(SELECT personId FROM "salary".Salary ...)`不会被进一步分布化，只会在一个集群节点的本地数据集上执行。

**左联接中在ON子句中引用其他表**

当查询被拆分时，LEFT JOIN子句的部分可能作为单独的映射查询来执行。如果ON子句引用的表不是正在联接的两个表，则此过程可能会失败，例如：
```sql
SELECT a.id FROM Person p LEFT JOIN Company c ON p.company_id = c.id
	LEFT JOIN Address a ON a.person_id = p.pid;
```
这种查询可能无法正确拆分，因为连接Company表和Address表的第二个ON子句还引用了Person表。如果遇到此类错误，可以尝试将附加条件移到WHERE块或修改左联接子句的顺序。

**DML语句的执行计划支持**

目前DML操作不支持`EXPLAIN`。

一个方法就是执行`UPDATE`或`DELETE`语句自动生成的`SELECT`语句或者DML语句使用的`INSERT`或`MERGE`语句的执行计划，这样会提供一个要执行的DML操作所使用的索引情况。
## 2.分布式关联
### 2.1.概述
Ignite支持并置和非并置的分布式SQL关联，此外，如果数据位于不同的缓存，Ignite还可以进行跨缓存的关联。
```sql
SELECT from Person as p, Organization as org
	WHERE p.orgId = org.id AND lower(org.name) = lower('apple')
```
`PARTITIONED`和`REPLICATED`模式缓存之间的关联也可以无限制地进行。

不过如果在`PARTITIONED`模式的数据集之间进行关联，那么一定要确保要么关联的键是`并置`的，要么为查询开启了非并置关联参数，两种类型的分布式关联模式下面会详述。
### 2.2.并置关联
默认情况下，如果一个SQL关联需要跨越多个Ignite缓存，那么所有的缓存都需要是并置的，否则，查询完成后会得到一个不完整的结果集，这是因为在关联阶段一个节点只能使用本地节点的可用数据。

如**图1**所示，首先，一个SQL查询会被发送到待关联数据所在的节点（Q），然后查询在每个节点的本地数据上立即执行（E（Q）），最后，所有的执行结果都会在客户端进行聚合（R）。

![](https://files.readme.io/2af89cf-Collocated_sql_queries.png)

### 2.3.非并置关联
虽然关联并置是一个强大的概念，即一旦配置了应用的业务实体（缓存），就可以以最优的方式执行跨缓存的关联，并且返回一个完整且一致的结果集。但还有一种可能就是，无法并置所有的数据，这时，就可能无法执行满足需求的所有SQL查询了。

Ignite设计和支持的**非并置**分布式关联就是针对的这样的场景，既无法或者很难并置所有的数据，但是仍然需要执行SQL查询。

::: danger 注意
在实践中不要过度使用基于非并置的分布式关联的方式，因为这种关联方式的性能差于基于关联并置的关联，因为要完成这个查询，要有更多的网络开销和节点间的数据移动。
:::

当为一个SQL查询启用了非并置的分布式关联之后，查询映射的节点就会从远程节点通过发送广播或者单播请求的方式获取缺失的数据（本地不存在的数据）。

::: tip 启用非并置的关联
可以查看JDBC, ODBC, Java, .NET, C++的相关文档来了解详细的信息。<br>
以Jdbc为例，它需要在连接的URL连接串中添加`distributedJoins=true`参数。
:::

正如**图2**所示，有一个潜在的数据移动步骤（D(Q)）。潜在的单播请求只会在关联在主键（缓存键）或者关联键上完成之后才会发送，因为执行关联的节点知道缺失数据的位置，其它所有的情况都会发送广播请求。

![](https://files.readme.io/95f09db-Non_collocated_sql_queries.png)

::: tip 注意
因为性能的原因，广播和单播请求都是批量处理的，这个批量的大小是由`page size`参数管理的。
:::

## 3.本地查询
有时，SQL网格中查询的执行会从分布式模式回落至本地模式，在本地模式中，查询会简单地传递至底层的H2引擎，它只会处理本地节点的数据集。

这些场景包括：

 - 如果一个查询在部署有`复制`缓存的节点上执行，那么Ignite会假定所有的数据都在本地，然后就会隐式地在本地执行一个简单的查询；
 - 查询在`本地`缓存上执行；
 - 使用`local = true`参数为查询显式地开启本地模式，该功能只有原生的Java、.NET和C++ API才支持，比如，在Java中该参数是通过`SqlQuery.setLocal(true)`或者`SqlFieldsQuery.setLocal(true)`进行切换；

即使查询执行时拓扑发生变化（新节点加入集群或者老节点离开集群），前两个场景也会一直提供完整而一致的结果集。

不过在应用显式开启本地模式的第三个场景中需要注意，原因是如果希望在部分节点的`分区`缓存上执行本地查询时拓扑还发生了变化，那么可能得到结果集的一部分，因为这时会触发一个自动的数据再平衡过程，SQL引擎无法处理这个特殊情况。

如果仍然希望在`PARTITIONED`模式缓存上执行本地查询，那么需要考虑使用[这里](/doc/java/ComputeGrid.md#_6-2-基于关联的call方法和run方法)描述的关联计算技术。
## 4.空间支持
### 4.1.概述
Ignite除了支持标准ANSI-99标准的SQL查询，支持基本数据类型或者特定/自定义对象类型之外，还可以查询和索引几何数据类型，比如点、线以及包括这些几何形状空间关系的多边形。

空间信息的查询功能，以及对应的可用的函数和操作符，是在[SQL的简单特性规范](http://www.opengeospatial.org/docs/is/)中定义的，目前，Ignite通过[JTS Topology Suite](http://tsusiatsoftware.net/jts/main.html)的使用，支持规范的交叉操作。
### 4.2.引入Ignite空间库
Ignite的空间库(`ignite-geospatial`)依赖于[JTS](http://tsusiatsoftware.net/jts/main.html)，它是LGPL许可证，不同于Apache的许可证，因此`ignite-geospatial`并没有包含在Ignite的二进制包中。

因为这个原因，`ignite-geospatial`的二进制库版本位于如下的Maven仓库中：
```xml
<repositories>
	<repository>
    <id>GridGain External Repository</id>
    <url>http://www.gridgainsystems.com/nexus/content/repositories/external</url>
	</repository>
</repositories>
```
在pom.xml中添加这个仓库以及如下的Maven依赖之后，就可以将该空间库引入应用中了。
```xml
<dependency>
	<groupId>org.apache.ignite</groupId>
  <artifactId>ignite-geospatial</artifactId>
  <version>${ignite.version}</version>
</dependency>
```
另外，也可以下载Ignite的源代码自己构建这个库。
## 5.性能和调试
### 5.1.使用EXPLAIN语句
为了读取执行计划以及提高查询性能的目的，Ignite支持`EXPLAIN ...`语法，注意一个计划游标会包含多行：最后一行是汇总节点的查询，其它是映射节点的。
```sql
EXPLAIN SELECT name FROM Person WHERE age = 26;
```
执行计划本身是由H2生成的，[这里](http://www.h2database.com/html/performance.html#explain_plan)有详细描述。
### 5.2.SQL性能和可用性考量
如果查询使用了操作符**OR**那么可能不是以期望的方式使用索引。比如对于查询：`select name from Person where sex='M' and (age = 20 or age = 30)`,会使用`sex`字段上的索引而不是`age`上的索引，虽然后者选择性更强。要解决这个问题需要用UNION ALL重写这个查询（注意没有ALL的UNION会返回去重的行，这会改变查询的语义而且引入了额外的性能开销），比如：
```sql
select name from Person where sex='M' and age = 20
UNION ALL
select name from Person where sex='M' and age = 30
```
尽量避免在SELECT查询的结果集中有过多的列，因为H2查询解析器的限制，带有100列以上的查询，执行速度可能比预期要差。
### 5.3.结果集延迟加载
Ignite默认会试图将所有结果集加载到内存然后将其发送给查询发起方(通常为应用客户端），这个方式在查询结果集不太大时提供了比较好的性能。

不过如果相对于可用内存来说结果集过大，就是导致长期的GC暂停甚至内存溢出。

为了降低内存的消耗，以适度降低性能为代价，可以对结果集进行延迟加载和处理，这个可以通过给JDBC或者ODBC连接串传递`lazy`参数，或者对于Java、.NET和C++来说，使用一个简单的方法也可以实现:

<Tabs>
<Tab name="Java">

```java
SqlFieldsQuery query = new SqlFieldsQuery("SELECT * FROM Person WHERE id > 10");

// Result set will be loaded lazily.
query.setLazy(true);
```
</Tab>
<Tab name="JDBC连接串">

```
jdbc:ignite:thin://192.168.0.15?lazy=true
```
</Tab>
</Tabs>

### 5.4.查询并置化的数据
当Ignite执行分布式查询时，它将子查询发送给单个集群成员，并将结果分组到汇总节点上。如果预先知道查询的数据是按`GROUP BY`条件并置处理的，可以使用`SqlFieldsQuery.collocated = true`来减少节点之间的网络流量和查询执行时间。当此标志设置为`true`时，首先对单个节点执行查询，并将结果发送到汇总节点进行最终计算。考虑下面的示例，假设数据由`department_id`进行并置：

**示例1**

```sql
SELECT SUM(salary) FROM Employee GROUP BY depatment_id
```
由于求和操作的性质，Ignite将对存储在各个节点上的元素的工资进行求和，然后将这些工资发送到汇总节点，在那里计算最终结果。启用并置标志只会稍微提高性能。

**示例2**

```sql
SELECT AVG(salary) FROM Employee GROUP BY depatment_id
```
在本例中，Ignite必须将所有`(salary, department_id)`对提取到汇总节点，并在那里计算结果。但是，如果员工按`department_id`字段进行并置，即同一部门的员工数据存储在同一个节点上，那么设置`SqlFieldsQuery.collocated = true`将减少查询执行时间，因为ignite将计算各个节点上每个部门的平均值，并将结果发送到汇总节点进行最终计算。
### 5.5.增加索引内联大小
Ignite在索引本身中部分包含索引值，以优化查询和数据更新。固定大小的数据类型（bool、byte、short、int等）全部包含在内，对于可变大小的数据（string，byte[]），只包括固定长度的部分。包含部分的长度称为*内联大小*，默认情况下等于值的前10个字节。

如果索引中没有完全包含值，比较这些值可能需要读取相应的数据页，这可能会对性能产生负面影响。在索引可变长度数据时，建议估计字段的长度，并将内联大小设置为包含大多数或所有值的值。

使用以下属性之一设置内联大小（值都是以字节为单位设置的）：

 - `QueryIndex.inlineSize`：如果通过`org.apache.ignite.cache.QueryEntity`对象配置索引时，具体细节可以参见[使用QueryEntity进行查询配置](/doc/java/Key-ValueDataGrid.md#_4-7-使用queryentity进行查询配置)；
 - `@QuerySqlField.inlineSize`：具体细节可以参见[通过注解进行查询的配置](/doc/java/Key-ValueDataGrid.md#_4-6-通过注解进行查询的配置)；
 - `INLINE_SIZE`：[CREATE INDEX](/doc/sql/SQLReference.md#_2-2-create-index)的`INLINE_SIZE`属性。

::: warning 注意
每个长度固定的列（如long）有1个字节的常量开销，每个`VARCHAR`列有2个字节的常量开销，在指定内联大小时应该考虑这些开销。还要注意的是，由于ignite将字符串编码为`UTF-8`，所以有些字符使用的字节数超过了1。
:::
### 5.6.查询并行度
SQL查询在每个涉及的节点上，默认是以单线程模式执行的，这种方式对于使用索引返回一个小的结果集的查询是一种优化，比如：
```sql
select * from Person where p.id = ?
```
某些查询以多线程模式执行会更好，这个和带有表扫描以及聚合的查询有关，这在OLAP的场景中比较常见，比如：
```sql
select SUM(salary) from Person
```
通过`CacheConfiguration.queryParallelism`属性可以配置查询的并行度，这个参数定义了在单一节点中执行查询时使用的线程数。使用[CREATE TABLE](/doc/sql/SQLReference.md#_2-3-create-table)生成SQL模式以及底层缓存时，使用一个已配置好的`CacheConfiguration`模板，也可以对这个参数进行调整。

如果查询包含`JOIN`，那么所有相关的缓存都应该有相同的并行度配置。

::: warning 注意
当前，这个属性影响特定缓存上的所有查询，可以加速很重的OLAP查询，但是会减慢其它的简单查询，这个行为在未来的版本中会改进。
:::

### 5.7.索引提示
当明确知道对于查询来说一个索引比另一个更合适时，索引提示就会非常有用，它会指导查询优化器来选择一个更高效的执行计划。在Ignite中要进行这个优化，可以使用`USE INDEX(indexA,...,indexN)`语句，它会告诉Ignite对于查询的执行只会使用给定名字的索引之一。

下面是一个示例：
```sql
SELECT * FROM Person USE INDEX(index_age)
  WHERE salary > 150000 AND age < 35;
```
### 5.8.分区修剪
分区修剪是一种在WHERE条件中使用关联键来对查询进行优化的技术。当执行这样的查询时，Ignite将只扫描存储请求数据的那些分区。这将减少查询时间，因为查询将只发送到存储所请求分区的节点。要了解有关分区分布的更多信息，请参阅[分区和复制](/doc/java/Key-ValueDataGrid.md#_3-1-分区和复制)。

在下面的示例中，Employee对象通过`id`字段并置处理（如果未指定关联键，则Ignite将使用主键来并置数据）：
```sql
CREATE TABLE employee (id BIGINT PRIMARY KEY, department_id INT, name VARCHAR)

/* This query is sent to the node where the requested key is stored */
SELECT * FROM employee WHERE id=10;

/* This query is sent to all nodes */
SELECT * FROM employee WHERE department_id=10;
```
下面的示例中，关联键显式指定，因此会被用于并置化的数据：
```sql
CREATE TABLE employee (id BIGINT PRIMARY KEY, department_id INT, name VARCHAR) WITH "AFFINITY_KEY=department_id"

/* This query is sent to all nodes */
SELECT * FROM employee WHERE id=10;

/* This query is sent to the node where the requested key is stored */
SELECT * FROM employee WHERE department_id=10;
```
### 5.9.更新时忽略汇总
当Ignite执行DML操作时，首先，它会获取所有受影响的中间行用于查询发起方的分析（也被称为汇总），然后会准备更新值的批处理,最后发送给远程节点。

如果一个DML操作需要移动大量数据，这个方式可能导致性能问题以及网络的堵塞。

使用这个标志可以作为一个提示，它使Ignite会在对应的远程节点上进行中间行的分析和更新，JDBC和ODBC都支持这个提示：
**JDBC**
```
jdbc:ignite:thin://192.168.0.15/skipReducerOnUpdate=true
```
### 5.10.SQL堆内行缓存
Ignite的固化内存在Java堆外存储数据和索引，这意味着每次数据访问，就会有一部分数据从堆外数据区复制到堆内，只要应用或者服务端节点引用它，就有可能被反序列化并且一直保持在堆内。

SQL堆内行缓存的目的就是在Java堆内存储热点数据（键值对象），使反序列化和数据复制的资源消耗最小化，每个缓存的行都会指向堆外数据区的一个数据条目，并且在如下情况下会失效：

 1. 存储在堆外数据区的主条目被更新或者删除；
 2. 存储主条目的数据页面从内存中退出。

堆内行缓存是缓存级的（SQL表或者缓存的创建也可以使用[CREATE TABLE](/doc/sql/SQLReference.md#_2-3-create-table)语句，相关的参数可以通过缓存模板传递）。
```xml
<bean class="org.apache.ignite.configuration.CacheConfiguration">
		<property name="name" value="person"/>
  	...
		<property name="sqlOnheapCacheEnabled" value="true"/>
</bean>
```
如果开启了行缓存，通过分配更多的内存，对于部分SQL查询或者场景，可能提升2倍的性能，这是一种折衷。

::: warning SQL堆内行缓存大小
目前，该缓存没有限制，可以和堆外数据区一样，占用更多的内存，但是：<br>
1.如果开启了堆内行缓存，需要配置JVM的最大堆大小为存储缓存的所有数据区的总大小；<br>
2.调整JVM的垃圾回收。
:::
### 5.11.用TIMESTAMP替代DATE
尽可能地使用[TIMESTAMP](/doc/sql/SQLReference.md#_10-11-timestamp)替代[DATE](/doc/sql/SQLReference.md#_10-10-date)，DATE类型的序列化/反序列化效率较低，导致性能下降。
## 6.模式
Ignite有一组默认的模式，为了更好地对表进行管理，也允许用户创建自定义的模式。

默认有两个可用的模式：

 - `SYS`模式：它包含了一组与集群节点信息有关的系统视图，具体请参见[系统视图](/doc/java/Metrics.md#_4-系统视图)章节；
 - [PUBLIC模式](#_6-2-public模式)：未指定模式时的默认模式。

在如下的场景中，可以创建自定义模式：

 - Ignite根据配置创建模式，具体可以看下面的[自定义模式](#_6-1-自定义模式)章节；
 - 通过编程接口或者XML配置，Ignite会为每个缓存创建一个模式，具体请参见[缓存和模式名](#_6-3-缓存和模式名)。

### 6.1.自定义模式
自定义模式可以通过`IgniteConfiguration`的`sqlSchemas`属性进行配置，在启动集群之前可以在配置中指定一个模式的列表，然后运行时在这些模式中创建对象。

下面的配置示例会创建两个模式：

<Tabs>
<Tab name="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="sqlSchemas">
        <list>
            <value>MY_SCHEMA</value>
            <value>MY_SECOND_SCHEMA</value>
        </list>
    </property>
</bean>
```
</Tab>
<Tab name="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setSqlSchemas("MY_SCHEMA", "MY_SECOND_SCHEMA");
```
要通过比如JDBC驱动接入指定的模式，需要在连接串中指定模式名，如下所示：
```
jdbc:ignite:thin://127.0.0.1/MY_SCHEMA
```
</Tab>
</Tabs>

### 6.2.PUBLIC模式
`PUBLIC`模式用于当需要模式而又未指定时的默认值，比如，当通过JDBC接入集群而又未显式指定模式，就会接入`PUBLIC`模式。
### 6.3.缓存和模式名
当创建缓存时（通过配置或者可用的编程接口），可以通过SQL API来对缓存的数据进行维护，在SQL层面，每个缓存对应一个独立的模式，模式的名字等同于缓存的名字。

简单来说，当通过SQL API创建了一个表，可以通过编程接口将其当做键-值缓存进行访问，而对应的缓存名，可以通过`CREATE TABLE`语句的`WITH`子句中的`CACHE_NAME`参数进行指定。
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
具体细节，可以看[CREATE TABLE](/doc/sql/SQLReference.md#_2-3-create-table)的相关内容。

如果未使用这个参数，缓存名为如下的形式：
```
SQL_<SchemaName>_<TableName>
```
## 7.SQL事务
### 7.1.概述
如果使用`TRANSACTIONAL_SNAPSHOT`模式，SQL的事务也是支持的。`TRANSACTIONAL_SNAPSHOT`模式是Ignite缓存的多版本并发控制（MVCC）的实现。

关于Ignite支持的事务语法以及示例代码，可以看[事务](/doc/sql/SQLReference.md#_12-事务)章节。
### 7.2.开启MVCC
要开启缓存的MVCC支持，需要在缓存的配置中使用`TRANSACTIONAL_SNAPSHOT`原子化模式。如果是使用的`CREATE TABLE`语句建的表，可以使用命令的`WITH`子句传递指定的原子化模式参数。

<Tabs>
<Tab name="SQL">

```sql
CREATE TABLE Person WITH "ATOMICITY=TRANSACTIONAL_SNAPSHOT"
```
</Tab>
<Tab name="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    ...
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">

            <property name="name" value="myCache"/>

            <property name="atomicityMode" value="TRANSACTIONAL_SNAPSHOT"/>
            ...
        </bean>
    </property>
</bean>
```
</Tab>
</Tabs>

### 7.3.限制

**跨缓存事务**

`TRANSACTIONAL_SNAPSHOT`模式是缓存级的，因此不允许在一个事务中的缓存具有不同的原子化模式，因此如果要在一个事务中覆盖多张表，那么所有的相关表都要使用`TRANSACTIONAL_SNAPSHOT`模式创建。

**嵌套事务**

通过JDBC/ODBC连接参数，Ignite支持三种模式用于处理嵌套的SQL事务。

JDBC连接串示例：
```
jdbc:ignite:thin://127.0.0.1/?nestedTransactionsMode=COMMIT
```
当事务中发生了嵌套的事务，系统的行为取决于`nestedTransactionsMode`参数：

 - `ERROR`：如果遇到嵌套事务，会抛出错误并且包含的事务会回滚，这是默认的行为；
 - `COMMIT`：包含事务会被挂起，嵌套事务启动后如果遇到COMMIT语句会被提交。包含事务中的其余语句会作为隐式事务执行；
 - `IGNORE`：**不要使用这个模式**，嵌套事务的开始会被忽略，嵌套事务中的语句会作为包含事务的一部分执行，并且随着嵌套事务的提交而提交所有的变更，包含事务的剩余语句会作为隐式事务执行。

<RightPane/>
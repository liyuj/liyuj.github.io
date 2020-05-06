# SQL参考
## 1.概述
本文档描述了Apache Ignite支持的SQL语法，其中包括：

 - 数据定义语言（DDL）
 - 数据操作语言（DML）
 - 聚合函数
 - 数值函数
 - 字符串函数
 - 日期和时间函数
 - 系统函数
 - 数据类型

## 2.数据定义语言（DDL）
### 2.1.ALTER TABLE
修改已有表的结构：
```sql
ALTER TABLE [IF EXISTS] tableName {alter_specification}

alter_specification:
    ADD [COLUMN] {[IF NOT EXISTS] tableColumn | (tableColumn [,...])}
  | DROP [COLUMN] {[IF EXISTS] columnName | (columnName [,...])}
  | {LOGGING | NOLOGGING}

tableColumn := columnName columnType
```
::: tip ALTER TABLE的范围
目前，Ignite只支持列的增加和删除，在即将发布的版本中，命令的语法和功能将进一步扩展。
:::

**参数**

 - `tableName`：表名
 - `tableColumn`：表中要增加的列名和类型
 - `columnName`：要增加或者删除的列名
 - `IF EXISTS`：如果对应表，如果指定表名的表不存在，则不会抛出异常；如果对应列，如果指定列名的列不存在，则不会抛出异常
 - `IF NOT EXISTS`：如果同名的列已经存在不会抛出错误
 - `LOGGING`：开启预写日志，预写日志默认开启，只有开启持久化，该指令才有意义
 - `NOLOGGING`：禁用预写日志，只有开启持久化，该指令才有意义

**描述**

`ALTER TABLE ADD`为之前创建的表增加一个或者多个列，列添加了之后，就可以在DML语句中进行访问，并且在`CREATE INDEX`语句中增加索引。

`ALTER TABLE DROP`从一个表中删除一个或者多个列，删除之后，查询就会无法访问，并且要考虑如下的特殊性和局限性：

 - 命令无法从集群中删除实际的数据，这意味着如果删除了列`name`，列`name`对应的值还在集群中保存着，这个限制会在下个版本中解决；
 - 如果该列被索引，则索引需要使用`DROP INDEX`命令手工删除；
 - 无法删除主键或者主键的一部分；
 - 如果该列表示整个值则也无法删除；


Ignite以键值对的形式存储数据，所有新增的列都属于值，键(`PRIMARY KEY`)所属的列是无法修改的。

`ALTER TABLE`语句在执行过程中，相同表的DDL和DML语句都会被阻塞一小段时间。

如果开启了Ignite的持久化，这个命令对应的模式改变也会被持久化到磁盘，因此即使整个集群重启也不会受到影响。

**示例**

给表增加一列：
```sql
ALTER TABLE Person ADD COLUMN city varchar;
```
只有没有同名列时才会为表增加新列：
```sql
ALTER TABLE City ADD COLUMN IF NOT EXISTS population int;
```
只有表存在时才会增加新列：
```sql
ALTER TABLE IF EXISTS Missing ADD number long;
```
一次为表增加多个列：
```sql
ALTER TABLE Region ADD COLUMN (code varchar, gdp double);
```
从表中删除一个列：
```sql
ALTER TABLE Person DROP COLUMN city;
```
只有指定的列存在时才从表删除列：
```sql
ALTER TABLE Person DROP COLUMN IF EXISTS population;
```
只有表存在时才删除列：
```sql
ALTER TABLE IF EXISTS Person DROP COLUMN number;
```
一次删除多个列：
```sql
ALTER TABLE Person DROP COLUMN (code, gdp);
```
禁用预写日志：
```sql
ALTER TABLE Person NOLOGGING
```
### 2.2.CREATE INDEX
为表创建索引。
```sql
CREATE [SPATIAL] INDEX [[IF NOT EXISTS] indexName] ON tableName
    (columnName [ASC|DESC] [,...]) [(index_option [...])]

index_option := {INLINE_SIZE size | PARALLEL parallelism_level}
```
**参数**

 - `indexName`：要创建的索引名；
 - `ASC`：升序排列（默认）;
 - `DESC`：降序排列；
 - `SPATIAL`：创建空间索引，目前只支持几何类型；
 - `IF NOT EXISTS`：如果同名索引已经存在则不会抛出错误，数据库只检查索引的名字，不考虑列的类型和数量；
 - `index_option`：创建索引的其它选项：
  - `INLINE_SIZE`：指定索引内联大小（字节），根据这个大小，Ignite会将整个索引值或者其一部分直接放入索引页中，这样会避免对数据页的额外调用以及提高查询性能。索引内联是默认开启的，然后其大小是根据表结构预先自动计算好的。将其值配置为0可以禁用内联功能，但是通常不推荐，具体可以看下面的索引内联章节；
  - `PARALLEL`：指定用于索引并行创建的线程数。线程数越多，索引创建的就越快，如果该值超过了CPU数量，那么它会被减少到内核的数量。如果参数未指定，那么线程数的默认值为可用CPU核数的25%。

**描述**

`CREATE INDEX`为指定的表创建一个新的索引，常规的索引存储于内部的B+树数据结构中，该B+树和实际的数据一样，在集群内进行分布，一个集群节点会存储其所属的数据对应的索引的一部分。

如果`CREATE INDEX`在运行时执行，那么数据库会在指定的索引列上同步地迭代，同一个表的其它DDL命令会被阻塞，直到`CREATE INDEX`执行完毕，但是DML语句的执行不受影响，还是并行地执行。

如果开启了Ignite的持久化，这个命令对应的模式改变也会被持久化到磁盘，因此即使整个集群重启也不会受到影响。

空间索引由JTS拓扑套件维护，具体可以参照相关的文档。

**索引内联**

索引内联内部限制最多为`2048`字节，如果超过该值会被默认减小为`2048`。

如果`INLINE_SIZE`参数未配置，那么Ignite会根据表结构计算索引大小，规则为：如果表中不包含可变大小列，比如`CHAR`、`VARCHAR`或者`BINARY`，那么引擎会累加所有列的大小，然后每列添加额外的字节，如果表中存在可变大小列，那么索引内联大小会从`IGNITE_MAX_INDEX_PAYLOAD_SIZE`系统属性派生，该属性默认值为10字节。

**索引的权衡**

为应用选择索引时，需要考虑很多事情。

 - 索引是有代价的：它们消耗内存，每个索引需要单独更新，因此当配置了很多索引时，缓存更新的性能会下降。最重要的是，执行查询时如果选择了错误的索引优化器会犯更多的错误。

::: danger 注意
索引每个字段是错误的！
:::

 - 索引只是有序数据结构（B+树），如果在字段(a,b,c)上定义了索引，那么记录的排序会是首先是a，然后b，再然后c。

::: tip 有序索引示例
| A | B | C |<br>
| 1 | 2 | 3 |<br>
| 1 | 4 | 2 |<br>
| 1 | 4 | 4 |<br>
| 2 | 3 | 5 |<br>
| 2 | 4 | 4 |<br>
| 2 | 4 | 5 |<br>
任意条件，比如`a = 1 and b > 3`，都会被视为有界范围，在`log(N)`时间内两个边界在索引中可以被快速检索到，然后结果就是两者之间的任何数据。<br>
下面的条件会使用索引：<br>
`a = ?`<br>
`a = ? and b = ?`<br>
`a = ? and b = ? and c = ?`<br>
从索引的角度，条件`a = ?`和`c = ?`不会好于`a = ?`<br>
明显地，半界范围`a > ?`可以工作得很好。
:::

- 单字段索引不如以同一个字段开始的多字段组合索引(索引(a)不如索引(a,b,c))，因此要优先使用组合索引；
- 如果指定了`INLINE_SIZE`属性，索引在B+树页面中会保存字段数据的前缀。这会通过更少的行数据检索提高搜索性能，但是树的大小大大增加（树高度的适度增加），并且由于过多的页面分割和合并从而减少了数据插入和删除的性能。在选择树的内联大小时考虑页面大小比较好：每个B-树条目需要页面中16+内联大小的字节（加上头和页面的额外链接）。

**示例**

创建常规索引：
```sql
CREATE INDEX title_idx ON books (title);
```
只有在不存在时创建倒序索引：
```sql
CREATE INDEX IF NOT EXISTS name_idx ON persons (firstName DESC);
```
创建组合索引：
```sql
CREATE INDEX city_idx ON sales (country, city);
```
创建指定内联大小的索引：
```sql
CREATE INDEX fast_city_idx ON sales (country, city) INLINE_SIZE 60;
```
创建空间索引：
```sql
CREATE SPATIAL INDEX idx_person_address ON Person (address);
```
### 2.3.CREATE TABLE
创建一个新表及其底层的缓存。
```sql
CREATE TABLE [IF NOT EXISTS] tableName (tableColumn [, tableColumn]...
[, PRIMARY KEY (columnName [,columnName]...)])
[WITH "paramName=paramValue [,paramName=paramValue]..."]

tableColumn := columnName columnType [DEFAULT defaultValue] [PRIMARY KEY]
```
#### 2.3.1.参数

 - `tableName`：表名；
 - `tableColumn`：新表中一个列的名字和类型；
 - `columnName`：之前定义的一个列名；
 - `DEFAULT`：指定列的默认值，只能接受常量值；
 - `IF NOT EXISTS`：只有同名表不存在时才会创建新表；
 - `PRIMARY KEY`：定义表的主键，可以由一个或者多个列组成；
 - `WITH`：标准ANSI SQL中未定义的参数：
   - `TEMPLATE=<cache's template name>`：在Ignite中注册的大小写敏感的缓存模板，用于CREATE TABLE命令在创建分布式缓存时的配置。一个模板是在集群中通过`Ignite.addCacheConfiguration`注册的`CacheConfiguration`类的实例。使用预定义的`TEMPLATE=PARTITIONED`或者`TEMPLATE=REPLICATED`模板，可以直接创建对应复制类型的缓存，其它的参数由`CacheConfiguration`对象决定，在没有显式指定的情况下，默认会使用`TEMPLATE=PARTITIONED`模板。
   - `BACKUPS=<number of backups>`：设置数据的备份数量，如果未指定这个参数，或者未指定任意的`TEMPLATE`参数，那么创建的缓存备份数量为0；
   - `ATOMICITY=<ATOMIC | TRANSACTIONAL | TRANSACTIONAL_SNAPSHOT>`：为底层缓存设置[原子化模式](/doc/java/Key-ValueDataGrid.md#_8-1-1-原子化模式)模式，如果该参数和`TEMPLATE`参数都未指定，那么创建的缓存为`ATOMIC`模式。如果指定为`TRANSACTIONAL_SNAPSHOT`模式，那么该表会[支持事务](/doc/java/Key-ValueDataGrid.md#_8-3-多版本并发控制)；
   - `WRITE_SYNCHRONIZATION_MODE=<PRIMARY_SYNC | FULL_SYNC | FULL_ASYNC>`：设置底层缓存的写同步模式，如果未指定这个参数，或者未指定任意的`TEMPLATE`参数，那么创建的缓存为`FULL_SYNC`模式；
   - `CACHE_GROUP=<group name>`：设置底层缓存所属的组名；
   - `AFFINITY_KEY=<affinity key column name>`：设置[关联键](/doc/java/Key-ValueDataGrid.md#_7-关联并置)名字，它应该是`PRIMARY KEY`约束中的一个列；
   - `CACHE_NAME=<custom name of the new cache>`：命令创建的底层缓存的名字，下面会详细描述；
   - `DATA_REGION=<existing data region name>`：表数据存储的数据区的名字，Ignite默认会将所有的数据存储于默认的数据区中；
   - `KEY_TYPE=<custom name of the key type>`：设置自定义键类型的名字，用于Ignite的键值API中，名字需要与Java、.NET和C++的类相对应，或者如果使用了二进制对象而不是自定义类时，也可以是随机的。在自定义键中，字段的数量和类型需要与`PRIMARY KEY`相对应，下面会详细描述；
   - `VALUE_TYPE=<custom name of the value type of the new cache>`：设置自定义值类型的名字，用于Ignite的键值API以及其它的非SQL API中。名字需要与Java、.NET和C++的类相对应，或者如果使用了二进制对象而不是自定义类时，也可以是随机的。值类型需要包含在CREATE TABLE命令中定义的所有列，但是`PRIMARY KEY`约束中列出的不算，下面会详细描述；
   - `WRAP_KEY=<true | false>`：这个标志控制**单列**主键是否会被包装成二进制对象形式，这个标志默认值为`false`，这个标志对多列的`PRIMARY KEY`不会产生影响，不管这个参数值是什么，它总是会被包装；
   - `WRAP_VALUE=<true | false>`：这个标志控制**单列**基本类型的值是否会被包装成二进制对象形式，这个标志默认值为`true`，这个标志对多列的值不会产生影响，不管这个参数值是什么，它总是会被包装。如果表中只有一个列，并且没有计划添加额外的列时，可以将其配置为`false`。注意如果该参数配置为`false`，就无法在该表上执行`ALTER TABLE ADD COLUMN`命令；

#### 2.3.2.描述

`CREATE TABLE`会创建一个新的缓存，然后在其上定义一个新的SQL表，缓存以键-值对的形式存储数据，并且该表允许在数据上执行SQL查询。

该表将存储在连接参数中指定的模式中。如果未指定模式，将使用`PUBLIC`模式。有关Ignite中模式的详细信息，请参见[模式](/doc/sql/Architecture.md#_6-模式)。

注意`CREATE TABLE`操作是同步的，在`CREATE TABLE`执行过程中会阻塞其它DDL命令的执行，DML命令的执行不受影响，还会以并行的方式执行。

如果希望使用键-值API访问数据，那么设置`CACHE_NAME`, `KEY_TYPE`和`VALUE_TYPE`参数会比较有用，因为：

 - `CREATE TABLE`执行后，生成的缓存名是`SQL_{SCHEMA_NAME}_{TABLE}`形式的，使用`CACHE_NAME`参数可以覆盖默认的名字；
 - 另外，该命令会创建两个新的二进制类型，分别对应键和值。Ignite会随机地生成包含UUID字符串的类型名，这使从非SQL API中使用这些`类型`变得复杂.这时可以使用自定义的`KEY_TYPE`和`VALUE_TYPE`来覆盖默认值，它们可以分别对应业务模型对象；

#### 2.3.3.示例

创建`Person`表：
```sql
CREATE TABLE IF NOT EXISTS Person (
  id int,
  city_id int,
  name varchar,
  age int,
  company varchar,
  PRIMARY KEY (id, city_id)
) WITH "template=partitioned,backups=1,affinity_key=city_id, key_type=PersonKey, value_type=MyPerson";
```
该命令执行后，做了如下事情：

 - 创建了一个新的名为`SQL_PUBLIC_PERSON`的分布式缓存，该缓存会存储Person类型的数据，该类型与一个特定的Java, .NET, C++类对应，或者是二进制对象。此外，键类型（`PersonKey`）和值类型（`MyPerson`）是显式定义的，说明该数据可以被键-值以及其它的非SQL API处理;
 - 带有所有参数的SQL表/模式都会被定义；
 - 数据以键-值对的形式存储，`PRIMARY KEY`列会被用于键列，其它的列则属于值；
 - 和分布式缓存有关的参数通过语句的`WITH`子句进行传递，如果没有`WITH`子句，那么缓存会通过`CacheConfiguration`类的默认参数创建。

下面的示例显示了如何通过指定的`PRIMARY KEY`来创建相同的表，然后覆写了和缓存有关的部分参数：
```sql
CREATE TABLE Person (
  id int PRIMARY KEY,
  city_id int,
  name varchar,
  age int,
  company varchar
) WITH "atomicity=transactional,cachegroup=somegroup";
```
### 2.4.DROP INDEX
删除表的一个索引。
```sql
DROP INDEX [IF EXISTS] indexName
```
**参数**

 - `indexName`：要删除的索引名；
 - `IF EXISTS`：如果指定名字的索引不存在，不会抛出错误，数据库只会校验索引的名字，不考虑列的类型和数量。

**描述**

`DROP INDEX`命令会删除之前创建的一个索引。

相同表的其它DDL命令会被阻塞，直到`DROP INDEX`执行完成，DML命令的执行不受影响，仍然会以并行的方式执行。

如果开启了Ignite的持久化，这个命令对应的模式改变也会被持久化到磁盘，因此即使整个集群重启也不会受到影响。

**示例**

删除一个索引：
```sql
DROP INDEX idx_person_name;
```
### 2.5.DROP TABLE
删除指定的表及其底层的索引。
```sql
DROP TABLE [IF EXISTS] tableName
```
**参数**

 - `tableName`：要删除的表名；
 - `IF EXISTS`：如果指定名字的表不存在，不会抛出错误。

**描述**

`DROP TABLE`命令会删除之前创建的一个表,底层的分布式缓存及其保存的数据也会被删除。

在`DROP TABLE`命令执行过程中，相同表的其它DDL和DML命令都会被阻塞，，在表删除后，所有挂起的命令都会报错。

如果开启了Ignite的持久化，这个命令对应的模式改变也会被持久化到磁盘，因此即使整个集群重启也不会受到影响。

**示例**

如果Person表存在，将其删除：
```sql
DROP TABLE IF EXISTS "Person";
```
### 2.6.CREATE USER
用指定的用户名和密码创建用户。
```sql
CREATE USER userName WITH PASSWORD 'password';
```
**参数**

 - `userName`：新用户的名字，用户名长度不能超过UTF8编码的60个字节；
 - `password`：新用户的密码，密码不能为空。

**描述**

该命令用指定的用户名和密码创建用户。

只有超级用户才能创建新用户。集群第一次启动时，Ignite创建了超级用户账户，名为`ignite`，密码为`ignite`，目前，无法修改超级用户的用户名，也不能将超级用户的权限赋予其它账户。

要创建一个大小写敏感的用户名，需要使用双引号(")SQL标识符。

::: tip 什么时候关注大小写敏感的用户名？
JDBC/ODBC接口只支持大小写不敏感的用户名，如果打算使用Java、.NET或者其它编程语言的API访问Ignite，那么要么使用大写字母，要么使用双引号传递用户名。<br>
比如，如果用户名为`Test`：<br>
1.在JDBC/ODBC中可以使用`Test`、`TEst`、`TEST`等各种组合；<br>
2.在Ignite为Java、.NET或者其它编程语言设计的原生SQL API中，可以使用`TEST`或者`"Test"`作为用户名。<br>
另外，尽量使用大小写敏感的用户名以保证所有SQL接口的名字一致性。
:::

**示例**

使用`test`作为用户名和密码创建用户：
```sql
CREATE USER test WITH PASSWORD 'test';
```
创建大小写敏感的用户名：
```sql
CREATE USER "TeSt" WITH PASSWORD 'test'
```
### 2.7.ALTER USER
修改已有用户的密码。
```sql
ALTER USER userName WITH PASSWORD 'newPassword';
```
**参数**

 - `userName`：已有的用户名；
 - `newPassword`：用户的新密码。

**描述**

该命令会修改已有用户的密码。

密码可以被超级用户(`ignite`)或者用户自己修改。

**示例**

更新用户的密码：
```sql
ALTER USER test WITH PASSWORD 'test123';
```
### 2.8.DROP USER
删除一个已有用户：
```sql
DROP USER userName;
```
**参数**

 - `userName`：要删除的用户名。

**描述**

该命令会删除一个已有用户。

只有超级用户（`ignite`）才能删除用户。

**示例**

删除用户：
```sql
DROP USER test;
```
## 3.数据操作语言（DML）
### 3.1.SELECT
从一张表或者多张表中获得数据。
```sql
SELECT
    [TOP term] [DISTINCT | ALL] selectExpression [,...]
    FROM tableExpression [,...] [WHERE expression]
    [GROUP BY expression [,...]] [HAVING expression]
    [{UNION [ALL] | MINUS | EXCEPT | INTERSECT} select]
    [ORDER BY order [,...]]
    [{ LIMIT expression [OFFSET expression]
    [SAMPLE_SIZE rowCountInt]} | {[OFFSET expression {ROW | ROWS}]
    [{FETCH {FIRST | NEXT} expression {ROW | ROWS} ONLY}]}]
```
**参数**

 - `DISTINCT`：配置从结果集中删除重复数据；
 - `GROUP BY`：通过给定的表达式对结果集进行分组；
 - `HAVING`：分组后过滤；
 - `ORDER BY`：使用给定的列或者表达式对结果集进行排序；
 - `LIMIT`和`FETCH FIRST/NEXT ROW(S) ONLY`：对查询返回的结果集的数量进行限制（如果为null或者小于0则无限制）；
 - `OFFSET`：配置忽略的行数；
 - `UNION`、`INTERSECT`、`MINUS`、`EXPECT`：将多个查询的结果集进行组合；
 - `tableExpression`：表联接。联接表达式目前不支持交叉联接和自然联接，自然联接是一个内联接，其条件会自动加在同名的列上；

```sql
tableExpression = [[LEFT | RIGHT]{OUTER}] | INNER | CROSS | NATURAL]
JOIN tableExpression
[ON expression]
```

 - `LEFT`：左联接执行从第一个（最左边）表开始的联接，然后匹配任何第二个（最右边）表的记录；
 - `RIGHT`：右联接执行从第二个（最右边）表开始的联接，然后匹配任何第一个（最左边）表的记录；
 - `OUTER`：外联接进一步细分为左外联接、右外联接和完全外联接，这取决于哪些表的行被保留（左、右或两者）；
 - `INNER`：内联接要求两个合并表中的每一行具有匹配的列值；
 - `CROSS`：交叉连接返回相关表数据的笛卡尔积；
 - `NATURAL`：自然联接是等值联接的一个特殊情况；
 - `ON`：要联接的条件或者值。

**描述**

`SELECT`查询可以在`分区`和`复制`模式的数据上执行。

当在全复制的数据上执行的时候，Ignite会将查询发送到某一个节点上，然后在其本地数据上执行。

另外，如果查询在分区数据上执行，那么执行流程如下：

 - 查询会被解析，然后拆分为多个映射查询和一个汇总查询；
 - 所有的映射查询会在请求数据所在的所有节点上执行；
 - 所有节点将本地执行的结果集返回给查询发起方（汇总），然后在将数据正确地合并之后完成汇总阶段。

**关联**

Ignite支持并置以及非并置的分布式SQL关联。

在分区和复制模式的数据集上进行关联也没有任何的限制。

但是，如果关联了分区模式的数据，那么要注意，要么将关联的键**并置**在一起，要么为查询开启非并置关联参数。

**分组和排序优化**

带有`ORDER BY`子句的SQL查询不需要将整个结果集加载到查询发起节点来进行完整的排序，而是查询映射的每个节点先对各自的结果集进行排序，然后汇总过程会以流式进行合并处理。

对于有序的`GROUP BY`查询也实现了部分优化，不需要将整个结果集加载到发起节点来进行分组，在Ignite中，每个节点的部分结果集可以流化、合并、聚合，然后逐步返回给应用。

**示例**

获取`Person`表的所有数据：
```sql
SELECT * FROM Person;
```
获取所有数据，按照字典顺序排序：
```sql
SELECT * FROM Person ORDER BY name;
```
计算某个城市的人口数量：
```sql
SELECT city_id, COUNT(*) FROM Person GROUP BY city_id;
```
关联`Person`和`City`表的数据：
```sql
SELECT p.name, c.name
	FROM Person p, City c
	WHERE p.city_id = c.id;
```
### 3.2.INSERT
往表中插入数据。
```sql
INSERT INTO tableName
  {[( columnName [,...])]
  {VALUES {({DEFAULT | expression} [,...])} [,...] | [DIRECT] [SORTED] select}}
  | {SET {columnName = {DEFAULT | expression}} [,...]}
```
**参数**

 - `tableName`：要更新的表名；
 - `columnName`：`VALUES`子句中的值对应的列名。

**描述**

`INSERT`命令在表中新增了一个条目。

因为Ignite是以键-值对的形式存储数据的，因此所有的`INSERT`语句最后都会被转换成键-值操作的集合。

如果单个键-值对正在加入缓存，那么最后`INSERT`语句会被转换成`cache.putIfAbsent(...)`操作，还有，如果插入多个键-值对，那么DML引擎会为每组数据创建一个`EntryProcessor`，然后使用`cache.invokeAll(...)`将数据注入缓存。

关于SQL引擎如何处理并发问题，可以看[这里](https://apacheignite-sql.readme.io/docs/how-ignite-sql-works#section-concurrent-modifications)。

**示例**

在表中插入一个新的`Person`：
```sql
INSERT INTO Person (id, name, city_id) VALUES (1, 'John Doe', 3);
```
将`Account`表的数据注入`Person`表：
```sql
INSERT INTO Person(id, name, city_id)
   (SELECT a.id + 1000, concat(a.firstName, a.secondName), a.city_id
   FROM Account a WHERE a.id > 100 AND a.id < 1000);
```
### 3.3.UPDATE
修改表中的数据。
```sql
UPDATE tableName [[AS] newTableAlias]
  SET {{columnName = {DEFAULT | expression}} [,...]} |
  {(columnName [,...]) = (select)}
  [WHERE expression][LIMIT expression]
```
**参数**

 - `table`：表名；
 - `columnName`：要修改的列名；

**描述**

`UPDATE`命令会修改表中的已有数据。

因为Ignite以键-值对的形式存储数据，因此所有的`UPDATE`语句最后都会被转换成一组键-值操作。

开始时，SQL引擎会根据`UPDATE`语句的`WHERE`子句生成并且执行一个`SELECT`查询，然后只会修改该结果集范围内的数据。

修改是通过`cache.invokeAll(...)`执行的，这基本上意味着`SELECT`查询完成后，SQL引擎就会准备一定量的`EntryProcessors`，然后使用`cache.invokeAll(...)`进行执行。`EntryProcessors`修改完数据后，会进行额外的检查，确保在查询和执行实际的更新之间没有受到干扰。

关于SQL引擎如何处理并发问题，可以看[这里](https://apacheignite-sql.readme.io/docs/how-ignite-sql-works#section-concurrent-modifications)。

::: tip 主键更新
Ignite不允许更新主键，因为主键和分区的映射关系是静态的。虽然分区及其数据可以修改所有者，但是键会一直属于一个固定的分区，该分区是根据主键使用一个哈希函数计算的。<br>
因此，如果主键需要更新，那么这条数据应该先删除，更新后再插入。
:::

**示例**

更新数据的`name`列：
```sql
UPDATE Person SET name = 'John Black' WHERE id = 2;
```
根据`Account`表的数据更新`Person`表：
```sql
UPDATE Person p SET name = (SELECT a.first_name FROM Account a WHERE a.id = p.id)
```
### 3.4.MERGE
将数据合并后入表。
```sql
MERGE INTO tableName [(columnName [,...])]
  [KEY (columnName [,...])]
  {VALUES {({ DEFAULT | expression } [,...])} [,...] | select}
```

**参数**

 - `tableName`：要更新的表名；
 - `columnName`：`VALUES`子句中的值对应的列名。

`MERGE`命令会更新已有的条目，如果不存在会插入一个新的条目。

因为Ignite是以键-值对的形式存储数据的，因此所有的`MERGE`语句最后都会被转换成键-值操作的集合。

`MERGE`是非常明确的操作，它会根据要被插入和更新的数据行数翻译成对应的`cache.put(...)`和`cache.putAll(...)`操作。

关于SQL引擎如何处理并发问题，可以看[这里](https://apacheignite-sql.readme.io/docs/how-ignite-sql-works#section-concurrent-modifications)。

**示例**

合并一组数据进`Person`表：
```sql
MERGE INTO Person(id, name, city_id) VALUES
	(1, 'John Smith', 5),
  (2, 'Mary Jones', 5);
```
从`Account`表获得数据，然后注入`Person`表：
```sql
MERGE INTO Person(id, name, city_id)
   (SELECT a.id + 1000, concat(a.firstName, a.secondName), a.city_id
   FROM Account a WHERE a.id > 100 AND a.id < 1000);
```
### 3.5.DELETE
从表中删除数据。
```sql
DELETE
  [TOP term] FROM tableName
  [WHERE expression]
  [LIMIT term]
```
**参数**

 - `tableName`：表名；
 - `TOP`、`LIMIT`：指定要删除的数据的数量（如果为null或者小于0则无限制）。

**描述**

`DETELE`命令会从一个表中删除数据。

因为Ignite以键-值对的形式存储数据，因此所有的`DELETE`语句最后都会被转换成一组键-值操作。
`DELETE`语句的执行会被拆分为两个阶段，和`UPDATE`语句的执行过程类似。

首先，使用一个SQL查询，SQL引擎会收集符合`DELTE`语句中`WHERE`子句的键，下一步，持有这些键之后，会创建一组`EntryProcessors`，调用`cache.invokeAll(...)`执行，在数据被删除之后，会进行额外的检查，确保在查询和执行实际的删除之间没有受到干扰。

关于SQL引擎如何处理并发问题，可以看[这里](https://apacheignite-sql.readme.io/docs/how-ignite-sql-works#section-concurrent-modifications)。

**示例**

从`Persons`表中删除指定name的数据：
```sql
DELETE FROM Person WHERE name = 'John Doe';
```
## 4.操作型命令
### 4.1.COPY
将CSV文件的数据复制进一个SQL表。
```sql
COPY FROM '/path/to/local/file.csv'
INTO tableName (columnName, columnName, ...) FORMAT CSV [CHARSET 'charset-name']
```
**参数**

 - `‘/path/to/local/file.csv’`：CSV文件的实际路径；
 - `tableName`：要注入数据的表名；
 - `columnName`：与CSV文件中的列对应的列名；
 - `charset-name`：字符集名，默认值为UTF-8。

**描述**

`COPY`命令可以将本地文件系统中文件的内容复制到服务端然后将数据注入SQL表。从内部来说，它会将文件内容读取为二进制形式数据包，然后将数据包发送到服务端，最后内容会以流的形式解析和处理。如果要将数据转存为文件，也可以使用这个模式。

::: warning 只支持JDBC
目前`COPY`命令只支持通过JDBC驱动以及CSV格式文件。
:::

**示例**

`COPY`命令可以以如下方式执行：
```sql
COPY FROM '/path/to/local/file.csv' INTO city (
  ID, Name, CountryCode, District, Population) FORMAT CSV
```
在上面的命令中，需要将`/path/to/local/file.csv`替换为CSV文件的实际路径，比如，可以使用最新的Ignite二进制包中自带的`city.csv`，该文件位于`[IGNITE_HOME]/examples/src/main/resources/sql/`目录。
### 4.2.SET STREAMING
将文件内容流化，批量地导入SQL表。
```sql
SET STREAMING [OFF|ON];
```
**描述**

使用`SET`命令，如果开启流化处理，可以在集群上将流化数据以批量的形式导入SQL表。JDBC驱动会分批打包命令，然后将其发送给服务端。在服务端，该批量会被转化为缓存更新命令流，这些更新命令在节点间是异步分布的，异步会增加峰值吞吐量，因为在任意时间节点，所有的节点都会忙于数据加载。

::: tip 只支持JDBC
目前`COPY`命令只支持通过JDBC驱动以及CSV格式文件。
:::

**使用**

要在集群中流化数据，需要准备一个`SET STREAMING ON`开头的文件，然后是要进行数据加载的`INSERT`命令，比如：
```sql
SET STREAMING ON;

INSERT INTO City(ID, Name, CountryCode, District, Population) VALUES (1,'Kabul','AFG','Kabol',1780000);
INSERT INTO City(ID, Name, CountryCode, District, Population) VALUES (2,'Qandahar','AFG','Qandahar',237500);
INSERT INTO City(ID, Name, CountryCode, District, Population) VALUES (3,'Herat','AFG','Herat',186800);
INSERT INTO City(ID, Name, CountryCode, District, Population) VALUES (4,'Mazar-e-Sharif','AFG','Balkh',127800);
INSERT INTO City(ID, Name, CountryCode, District, Population) VALUES (5,'Amsterdam','NLD','Noord-Holland',731200);
-- More INSERT commands --
```
注意，在执行上面的语句之前，需要在集群中先创建表，执行`CREATE TABLE`命令，或者将该命令作为插入数据的文件的一部分，放在`SET STREAMING ON`命令之前，比如：
```sql
CREATE TABLE City (
  ID INT(11),
  Name CHAR(35),
  CountryCode CHAR(3),
  District CHAR(20),
  Population INT(11),
  PRIMARY KEY (ID, CountryCode)
) WITH "template=partitioned, backups=1, affinityKey=CountryCode, CACHE_NAME=City, KEY_TYPE=demo.model.CityKey, VALUE_TYPE=demo.model.City";

SET STREAMING ON;

INSERT INTO City(ID, Name, CountryCode, District, Population) VALUES (1,'Kabul','AFG','Kabol',1780000);
INSERT INTO City(ID, Name, CountryCode, District, Population) VALUES (2,'Qandahar','AFG','Qandahar',237500);
INSERT INTO City(ID, Name, CountryCode, District, Population) VALUES (3,'Herat','AFG','Herat',186800);
INSERT INTO City(ID, Name, CountryCode, District, Population) VALUES (4,'Mazar-e-Sharif','AFG','Balkh',127800);
INSERT INTO City(ID, Name, CountryCode, District, Population) VALUES (5,'Amsterdam','NLD','Noord-Holland',731200);
-- More INSERT commands --
```

::: warning 将数据刷入集群
如果数据加载完成，一定要关闭JDBC连接，确保数据刷入集群。
:::

::: tip 已知的限制
虽然流化数据可以使数据加载快于其它的数据加载方式，但是它有很多限制需要注意：<br>
1.只能使用`INSERT`命令，其它比如`SELECT`或者其它任意的DML或者DDL命令的执行都会抛出异常；<br>
2.由于流化数据的异步属性，无法知道每个语句执行时的更新总数，因此所有与更新总数有关的JDBC命令都会返回0。
:::

**示例**

作为示例，可以使用最新的Ignite二进制包自带的`world.sql`文件，该文件位于`[IGNITE_HOME]/examples/sql/`目录。可以执行SQLLine的`run`命令，如下：
```bash
!run /apache_ignite_version/examples/sql/world.sql
```
执行上述命令并且关闭连接后，所有数据会加载到集群并且可以查询到：

![](https://files.readme.io/580d1a2-streaming.png)

### 4.3.KILL QUERY
`KILL QUERY`命令用于取消正在运行的查询。

```sql
KILL QUERY {ASYNC} '<query_id>'
```
**描述**

`ASYNC`是一个可选参数，可以立即返回而无需等待取消完成，`query_id`可以通过[SQL QUERIES](/doc/java/Metrics.md#_4-12-sql_queries)视图进行检索。

通过`KILL QUERY`命令取消查询后，所有相关节点上运行的该查询都将被取消。

## 5.聚合函数
### 5.1.AVG
```sql
AVG ([DISTINCT] expression)
```
**参数**

- `DISTINCT`：可选关键字，加上会去除重复数据。

**描述**

取平均值，如果没有命中记录，返回值为NULL，该函数只对SELECT语句有效，返回值类型与参数值类型相同。

**示例**

计算玩家的平均年龄：
```sql
SELECT AVG(age) "AverageAge" FROM Players;
```
### 5.2.BIT_AND
```sql
BIT_AND (expression)
```
**描述**

所有非空值的按位与操作，如果没有命中记录，返回值为NULL，该函数只对SELECT语句有效。

对长度相等的两个二进制表达式的每一对对应的位执行逻辑与操作。

对于每个对，如果第一个为1且第二个也为1，则返回值为1，否则返回0。
### 5.3.BIT_OR
```sql
BIT_OR (expression)
```
**描述**

所有非空值的按位或操作，如果没有命中记录，返回值为NULL，该函数只对SELECT语句有效。

对长度相等的两个二进制表达式的每一对对应的位执行逻辑或操作。

对于每个对，如果第一个为1或者第二个为1或者两者都为1，则返回值为1，否则返回0。
### 5.4.BOOL_AND
```sql
BOOL_AND (boolean)
```
**描述**

如果所有的表达式都为true，则返回true，如果没有命中记录，返回值为NULL，该函数只对SELECT语句有效。

**示例**
```sql
SELECT item, BOOL_AND(price > 10) FROM Items GROUP BY item;
```
### 5.5.BOOL_OR
```sql
BOOL_OR (boolean)
```
**描述**

如果任意表达式为true，则返回true，如果没有命中记录，返回值为NULL，该函数只对SELECT语句有效。

**示例**
```sql
SELECT BOOL_OR(CITY LIKE 'W%') FROM Users;
```
### 5.6.COUNT
```sql
COUNT (* | [DISTINCT] expression)
```
**描述**

所有条目或者非空值的数量，该方法返回long型值，如果没有命中记录，返回值为0，该函数只对SELECT语句有效。

**示例**

计算每个城市玩家的数量：
```sql
SELECT city_id, COUNT(*) FROM Players GROUP BY city_id;
```
### 5.7.MAX
```sql
MAX (expression)
```
**参数**

 - `expression`：可以是一个列名，也可以是另一个函数或者数学操作的结果集。

**描述**

返回最大值，如果没有命中记录，返回值为NULL，该函数只对SELECT语句有效，返回值类型与参数值类型相同。

**示例**

获得最高的玩家：
```sql
SELECT MAX(height) FROM Players;
```
### 5.8.MIN
```sql
MIN (expression)
```
**参数**

 - `expression`：可以是一个列名，也可以是另一个函数或者数学操作的结果集。

**描述**

返回最小值，如果没有命中记录，返回值为NULL，该函数只对SELECT语句有效，返回值类型与参数值类型相同。

**示例**

获得最年轻的玩家：
```sql
SELECT MIN(age) FROM Players;
```
### 5.9.SUM
```sql
SUM ([DISTINCT] expression)
```
**参数**

 - `DISTINCT`：去除重复的数据；
 - `expression`：可以是一个列名，也可以是另一个函数或者数学操作的结果集。

**描述**

返回所有值的总和，如果没有命中记录，返回值为NULL，该函数只对SELECT语句有效，返回值类型与参数值类型相同。

**示例**

获得所有玩家的总得分：
```sql
SELECT SUM(goal) FROM Players;
```
### 5.10.STDDEV_POP
```sql
STDDEV_POP ([DISTINCT] expression)
```
**参数**

  - `DISTINCT`：去除重复值；
  - `expression`：可以是一个列名。

**描述**

返回总体标准差。此方法返回一个double型值。如果没有命中记录，返回值为NULL，该函数只对SELECT语句有效。

**示例**

计算玩家年龄的标准差：
```sql
SELECT STDDEV_POP(age) from Players;
```
### 5.11.STDDEV_SAMP
```sql
STDDEV_SAMP ([DISTINCT] expression)
```
**参数**

  - `DISTINCT`：去除重复值；
  - `expression`：可以是一个列名。

**描述**

返回样本标准差。此方法返回一个double型值。如果没有命中记录，返回值为NULL，该函数只对SELECT语句有效。

**示例**

计算玩家年龄的样本标准差：
```sql
SELECT STDDEV_SAMP(age) from Players;
```
### 5.12.VAR_POP
```sql
VAR_POP ([DISTINCT] expression)
```
**参数**

  - `DISTINCT`：去除重复值；
  - `expression`：可以是一个列名。

**描述**

返回总体方差（总体标准方差）。此方法返回一个double型值。如果没有命中记录，返回值为NULL，该函数只对SELECT语句有效。

**示例**

计算玩家年龄的总体方差：
```sql
SELECT VAR_POP (age) from Players;
```
### 5.13.VAR_SAMP
```sql
VAR_SAMP ([DISTINCT] expression)
```
**参数**

  - `DISTINCT`：去除重复值；
  - `expression`：可以是一个列名。

**描述**
返回样本方差（样本标准方差）。此方法返回一个double型值。如果没有命中记录，返回值为NULL，该函数只对SELECT语句有效。

**示例**

计算玩家年龄的样本方差：
```sql
SELECT VAR_SAMP(age) FROM Players;
```
### 5.14.GROUP_CONCAT
```sql
GROUP_CONCAT([DISTINCT] expression || [expression || [expression ...]]
  [ORDER BY expression [ASC|DESC], [[ORDER BY expression [ASC|DESC]]]
  [SEPARATOR expression])
```
这里的`expression`可以是列和字符串的串联（使用`||`操作符），比如，`column1 || "=" || column2`。

**参数**

 - `DISTINCT`：对结果集进行筛选，去除重复记录；
 - `expression`：指定一个表达式，该表达式可以是列名、另一个函数的结果或数学运算；
 - `ORDER BY`：通过表达式对数据行进行排序；
 - `SEPARATOR`：覆写字符串分隔符。默认的分隔符是逗号“，”。

::: warning 注意
只有按主键或关联键对结果分组（即使用`GROUP BY`）时，才支持`GROUP_CONCAT`函数内的`DISTINCT`和`ORDER BY`表达式。此外，如果使用了[Java API](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/cache/query/SqlFieldsQuery.html#setCollocated-boolean-)，必须在连接串中配置`collocated=true`或者调用`SqlFieldsQuery.setCollocated(true)`，以通知Ignite数据是并置的。
:::

**描述**

用分隔符连接字符串。默认分隔符是','（没有空格）。此方法返回一个字符串。如果未命中数据则结果为空。只能在SELECT语句中使用聚合。

**示例**

将所有玩家的名字聚合成一行：
```sql
SELECT GROUP_CONCAT(name ORDER BY id SEPARATOR ', ') FROM Players;
```
## 6.数值函数
### 6.1.ABS
```sql
ABS (expression)
```
**参数**

 - `expression`：可以是列名，也可以是另一个函数或者数学操作的结果集。

**描述**

返回表达式的绝对值。

**示例**

计算绝对值：
```sql
SELECT transfer_id, ABS (price) from Transfers;
```
### 6.2.ACOS
```sql
ACOS (expression)
```
**参数**

 - `expression`：可以是列名，也可以是另一个函数或者数学操作的结果集。

**描述**

计算反余弦函数值，该函数返回double型值。

**示例**

获取反余弦值：
```sql
SELECT acos(angle) FROM Triangles;
```
### 6.3.ASIN
```sql
ASIN (expression)
```
**参数**

 - `expression`：可以是列名，也可以是另一个函数或者数学操作的结果集。

**描述**

计算反正弦函数值，该函数返回double型值。

**示例**

获取反余弦值：
```sql
SELECT asin(angle) FROM Triangles;
```
### 6.4.ATAN
```sql
ATAN (expression)
```
**参数**

 - `expression`：可以是列名，也可以是另一个函数或者数学操作的结果集。

**描述**

计算反正切函数值，该函数返回double型值。

**示例**

获取反余切值：
```sql
SELECT atan(angle) FROM Triangles;
```
### 6.5.COS
```sql
COS (expression)
```
**参数**

 - `expression`：可以是列名，也可以是另一个函数或者数学操作的结果集。

**描述**

计算余弦函数值，该函数返回double型值。

**示例**

获取余弦值：
```sql
SELECT COS(angle) FROM Triangles;
```
### 6.6.COSH
```sql
COSH (expression)
```
**参数**

 - `expression`：可以是列名，也可以是另一个函数或者数学操作的结果集。

**描述**

计算双曲余弦函数值，该函数返回double型值。

**示例**

获取双曲余弦值：
```sql
SELECT COSH(angle) FROM Triangles;
```
### 6.7.COT
```sql
COT (expression)
```
**参数**

 - `expression`：可以是列名，也可以是另一个函数或者数学操作的结果集。

**描述**

计算余切函数值，该函数返回double型值。

**示例**

获取余切值：
```sql
SELECT COT(angle) FROM Triangles;
```
### 6.8.SIN
```sql
SIN (expression)
```
**参数**

 - `expression`：可以是列名，也可以是另一个函数或者数学操作的结果集。

**描述**

计算正弦函数值，该函数返回double型值。

**示例**

获取正弦值：
```sql
SELECT SIN(angle) FROM Triangles;
```
### 6.9.SINH
```sql
SINH (expression)
```
**参数**

 - `expression`：可以是列名，也可以是另一个函数或者数学操作的结果集。

**描述**

计算双曲正弦函数值，该函数返回double型值。

**示例**

获取双曲正弦值：
```sql
SELECT SINH(angle) FROM Triangles;
```
### 6.10.TAN
```sql
TAN (expression)
```
**参数**

 - `expression`：可以是列名，也可以是另一个函数或者数学操作的结果集。

**描述**

计算正切函数值，该函数返回double型值。

**示例**

获取正切值：
```sql
SELECT TAN(angle) FROM Triangles;
```
### 6.11.TANH
```sql
TANH (expression)
```
**参数**

 - `expression`：可以是列名，也可以是另一个函数或者数学操作的结果集。

**描述**

计算双曲正切函数值，该函数返回double型值。

**示例**

获取双曲正切值：
```sql
SELECT TANH(angle) FROM Triangles;
```
### 6.12.ATAN2
```sql
ATAN2 (y, x)
```
**参数**

 - `x`和`y`：参数。

**描述**

将直角坐标转换成极坐标时的角度计算，该函数返回double型值。

**示例**

获取方位角：
```sql
SELECT ATAN2(X, Y) FROM Triangles;
```
### 6.13.BITAND
```sql
BITAND (y, x)
```
**参数**

 - `x`和`y`：参数。

**描述**

按位与操作，该函数返回double型值。

**示例**
```sql
SELECT BITAND(X, Y) FROM Triangles;
```
### 6.14.BITGET
```sql
BITGET (y, x)
```
**参数**

 - `x`和`y`：参数。

**描述**

当且仅当第一个参数在第二个参数指定的位置上存在二进制位组时返回true，该方法返回布尔值，第二个参数从0开始，最小有效位位置为0。

**示例**

检查第3位是否为1：
```sql
SELECT BITGET(X, 3) from Triangles;
```
### 6.15.BITOR
```sql
BITOR (y, x)
```
**参数**

 - `x`和`y`：参数。

**描述**

按位或操作，该方法返回long型值。

**示例**

计算两个字段的或操作：
```sql
SELECT BITOR(X, Y) from Triangles;
```
### 6.16.BITXOR
```sql
BITXOR (y, x)
```
**参数**

 - `x`和`y`：参数。

**描述**

按位异或操作，该方法返回long型值。

**示例**

计算两个字段的异或操作：
```sql
SELECT BITXOR(X, Y) from Triangles;
```
### 6.17.MOD
```sql
MOD (y, x)
```
**参数**

 - `x`和`y`：参数。

**描述**

取模操作，该方法返回long型值。

**示例**

计算两个字段的模：
```sql
SELECT MOD(X, Y) from Triangles;
```
### 6.18.CEILING
```sql
CEIL (expression)
CEILING (expression)
```
**参数**

 - `expression`：任意有效的数值表达式。

**描述**

可以参照Java的Math.ceil，该方法返回double型值。

**示例**

计算品类的向上取整价格：
```sql
SELECT item_id, CEILING(price) FROM Items;
```
### 6.19.DEGREES
```sql
DEGREES (expression)
```
**参数**

 - `expression`：任意有效的数值表达式。

**描述**

可以参照Java的Math.toDegrees，该方法返回double型值。

**示例**

计算参数的角度值：
```sql
SELECT DEGREES(X) FROM Triangles;
```
### 6.20.EXP
```sql
EXP (expression)
```
**参数**

 - `expression`：任意有效的数值表达式。

**描述**

可以参照Java的Math.exp，该方法返回double型值。

**示例**

计算exp：
```sql
SELECT EXP(X) FROM Triangles;
```
### 6.21.FLOOR
```sql
FLOOR (expression)
```
**参数**

 - `expression`：任意有效的数值表达式。

**描述**

可以参照Java的Math.floor，该方法返回double型值。

**示例**

计算向下取整价格：
```sql
SELECT FLOOR(X) FROM Items;
```
### 6.22.LOG
```sql
LOG (expression)
LN (expression)
```
**参数**

 - `expression`：任意有效的数值表达式。

**描述**

可以参照Java的Math.log，该方法返回double型值。

**示例**

计算自然对数：
```sql
SELECT LOG(X) from Items;
```
### 6.23.LOG10
```sql
LOG10 (expression)
```
**参数**

 - `expression`：任意有效的数值表达式。

**描述**

可以参照Java的Math.log10（Java5），该方法返回double型值。

**示例**

计算底数为10的对数：
```sql
SELECT LOG10(X) from Items;
```
### 6.24.RADIANS
```sql
RADIANS (expression)
```
**参数**

 - `expression`：任意有效的数值表达式。

**描述**

可以参照Java的Math.toRadians，该方法返回double型值。

**示例**

计算参数的弧度值：
```sql
SELECT RADIANS(X) FROM Triangles;
```
### 6.25.SQRT
```sql
SQRT (expression)
```
**参数**

 - `expression`：任意有效的数值表达式。

**描述**

可以参照Java的Math.sqrt，该方法返回double型值。

**示例**

计算参数的平方根：
```sql
SELECT SQRT(X) FROM Items;
```
### 6.26.PI
```sql
PI (expression)
```
**参数**

 - `expression`：任意有效的数值表达式。

**描述**

可以参照Java的Math.PI，该方法返回double型值。

**示例**

计算参数的圆周率：
```sql
SELECT PI(X) FROM Items;
```
### 6.27.POWER
```sql
POWER (X, Y)
```
**参数**

 - `x`和`y`：参数。

**描述**

可以参照Java的Math.pow，该方法返回double型值。


**示例**

计算2的乘方：
```sql
SELECT pow(2, n) FROM Rows;
```
### 6.28.RAND
```sql
{RAND | RANDOM} ([expression])
```
**参数**

 - `expression`：任意有效的数值表达式。

**描述**

调用函数时没有参数会生成下一个伪随机数，带参数时会使用会话的随机数生成器，，该方法返回从0（包含）到1（不包含）的一个double型值。

**示例**

为每个玩家生成一个随机数：
```sql
SELECT random() FROM Play;
```
### 6.29.RANDOM_UUID
```sql
{RANDOM_UUID | UUID} ()
```
**描述**

使用122伪随机位，返回一个新的UUID。

**示例**

为每个玩家生成一个随机数：
```sql
SELECT UUID(),name FROM Player;
```
### 6.30.ROUND
```sql
ROUND ( expression [, precision] )
```
**参数**

 - `expression`：任意有效的数值表达式；
 - `precision`：小数点之后的位数，如果位数未指定，会四舍五入到最近的long型值。

**描述**

四舍五入到指定的位数，如果未指定位数，则四舍五入到最近的long型值，该方法会返回一个数值（类型与输入相同）。

**示例**

将每个玩家的年龄转成整型值：
```sql
SELECT name, ROUND(age) FROM Player;
```
### 6.31.ROUNDMAGIC
```sql
ROUNDMAGIC (expression)
```
**参数**

 - `expression`：任意有效的数值表达式；

**描述**

该方法会很好地对数值进行四舍五入，但是速度较慢。它对0附近的数值有特殊的处理，它只支持小于等于+/-1000000000000的数值。

在内部，首先将值转成字符串，然后检查最后的4位，`000x`会变成`0000`,`999x`会变成`999999`，这些都是自动的，该方法返回double型值。

**示例**

对每个玩家的年龄进行四舍五入：
```sql
SELECT name, ROUNDMAGIC(AGE/3*3) FROM Player;
```
### 6.32.SECURE_RAND
```sql
SECURE_RAND (int)
```
**参数**

 - `int`：指定位数。

**描述**

生成安全加密的随机数，该方法返回字节。

**示例**

返回真正的随机数：
```sql
SELECT name, SECURE_RAND(10) FROM Player;
```
### 6.33.SIGN
```sql
SIGN (expression)
```
**参数**

 - `expression`：任意有效的数值表达式。

**描述**

如果表达式值小于0，则返回-1，等于0，则返回0，否则返回1。

**示例**

返回每个值的符号：
```sql
SELECT name, SIGN(VALUE) FROM Player;
```
### 6.34.ENCRYPT
```sql
ENCRYPT (algorithmString , keyBytes , dataBytes)
```
**参数**

 - `algorithmString`：指定支持的AES算法；
 - `keyBytes`：指定密钥；
 - `dataBytes`：数据。

**描述**

使用密钥对数据进行加密，支持的算法为AES，块大小为16个字节，该方法返回字节。

**示例**

对玩家的名字进行加密：
```sql
SELECT ENCRYPT('AES', '00', STRINGTOUTF8(Name)) FROM Player;
```
### 6.35.DECRYPT
```sql
DECRYPT (algorithmString , keyBytes , dataBytes)
```
**参数**

 - `algorithmString`：指定支持的AES算法；
 - `keyBytes`：指定密钥；
 - `dataBytes`：数据。

**描述**

使用密钥对数据进行解密，支持的算法为AES，块大小为16个字节，该方法返回字节。

**示例**

对玩家的名字进行解密：
```sql
SELECT DECRYPT('AES', '00', '3fabb4de8f1ee2e97d7793bab2db1116'))) FROM Player;
```
### 6.36.TRUNCATE
```sql
{TRUNC | TRUNCATE} ({{numeric, digitsInt} | timestamp | date | timestampString})
```
**描述**

截断到一定的位数，该方法返回double型值。如果处理一个时间戳，会将截断到日期类型，如果处理一个日期，会将其截断到时间较少的一个日期，如果处理时间戳字符串，会将时间戳截断到一个日期类型。

**示例**

```sql
TRUNCATE(VALUE, 2);
```
### 6.37.COMPRESS
```sql
COMPRESS(dataBytes [, algorithmString])
```
**参数**

 - `dataBytes`：要压缩的数据；
 - `algorithmString`：压缩的算法。

**描述**

使用指定的压缩算法压缩数据，支持的算法包括：LZF（快，但是压缩率较低，默认），DEFLATE（高压缩率）。压缩并不一定会减少大小，很小的对象以及冗余较少的对象会变得更大，该方法返回字节。

**示例**

```sql
COMPRESS(STRINGTOUTF8('Test'))
```
### 6.38.EXPAND
```sql
EXPAND(dataBytes)
```
**参数**

 - `dataBytes`：要解开的数据。

**描述**

解压缩通过COMPRESS函数压缩的数据，该方法返回字节。

**示例**
```sql
UTF8TOSTRING(EXPAND(COMPRESS(STRINGTOUTF8('Test'))))
```
### 6.39.ZERO
```sql
ZERO()
```
**描述**

返回0，该函数用于无法使用数值字面量的场景。

**示例**
```sql
ZERO()
```
## 7.字符串函数
### 7.1.ASCII
```sql
ASCII(string)
```
**参数**

 - `string`：参数。

**描述**

返回字符串中第一个字符的ASCII码值，该方法返回int型值。

**示例**
```sql
select ASCII(name) FROM Players;
```
### 7.2.BIT_LENGTH
```sql
BIT_LENGTH(string)
```
**参数**

 - `string`：参数。

**描述**

返回字符串的位数，该方法返回long型值，对于BLOB、CLOB、BYTES以及JAVA_OBJECT，需要使用精度，每个字符需要16位。

**示例**
```sql
select BIT_LENGTH(name) FROM Players;
```
### 7.3.LENGTH
```sql
{LENGTH | CHAR_LENGTH | CHARACTER_LENGTH} (string)
```
**参数**

 - `string`：参数。

**描述**

返回字符串的字符数，该方法返回long型值，对于BLOB、CLOB、BYTES以及JAVA_OBJECT，需要使用精度，每个字符需要16位。

**示例**
```sql
SELECT LENGTH(name) FROM Players;
```
### 7.4.OCTET_LENGTH
```sql
OCTET_LENGTH(string)
```
**参数**

 - `string`：参数。

**描述**

返回字符串的字节数，该方法返回long型值，对于BLOB、CLOB、BYTES以及JAVA_OBJECT，需要使用精度，每个字符需要2个字节。

**示例**
```sql
SELECT OCTET_LENGTH(name) FROM Players;
```
### 7.5.CHAR
```sql
{CHAR | CHR} (int)
```
**参数**

 - `int`：参数。

**描述**

返回ASCII码值对应的字符，该方法返回字符串。

**示例**
```sql
SELECT CHAR(65)||name FROM Players;
```
### 7.6.CONCAT
```sql
CONCAT(string, string [,...])
```
**参数**

 - `string`：参数。

**描述**

字符串连接，与操作符`||`不同，NULL参数会被忽略，不会导致结果变为NULL，该方法返回字符串。

**示例**
```sql
SELECT CONCAT(NAME, '!') FROM Players;
```
### 7.7.CONCAT_WS
```sql
CONCAT_WS(separatorString, string, string [,...])
```
**参数**

 - `separatorString`：分隔符；
 - `string`：参数。

**描述**

通过一个分隔符对字符串连接，与操作符`||`不同，NULL参数会被忽略，不会导致结果变为NULL，该方法返回字符串。

**示例**
```sql
SELECT CONCAT_WS(',', NAME, '!') FROM Players;
```
### 7.8.DIFFERENCE
```sql
DIFFERENCE(X, Y)
```
**参数**

 - `X`，`Y`：要比较的字符串。

**描述**

返回两个字符串之间的差异，该方法返回整型值。

**示例**

计算玩家姓名的一致程度：
```sql
select DIFFERENCE(T1.NAME, T2.NAME) FROM players T1, players T2
   WHERE T1.ID = 10 AND T2.ID = 11;
```
### 7.9.HEXTORAW
```sql
HEXTORAW(string)
```
**参数**

 - `string`：要转换的十六进制字符串。

**描述**

将十六进制字符串转换为普通字符串，4个十六进制字符转成一个普通字符。

**示例**
```sql
SELECT HEXTORAW(DATA) FROM Players;
```
### 7.10.RAWTOHEX
```sql
RAWTOHEX(string)
```
**参数**

 - `string`：要转换成十六进制的字符串。

**描述**

将字符串转换为十六进制形式，4个十六进制字符对应一个普通字符，该方法返回字符串类型。

**示例**
```sql
SELECT RAWTOHEX(DATA) FROM Players;
```
### 7.11.INSTR
```sql
INSTR(string, searchString, [, startInt])
```
**参数**

 - `string`：任意字符串
 - `searchString`：要搜索的字符串
 - `startInt`：搜索的起始位置

**描述**

返回要搜索的字符串在源字符串中的位置，如果指定了起始位置，之前的字符会被忽略，如果是负数，会返回最右侧的位置，如果未找到则返回0，注意该函数是区分大小写的。

**示例**

检查一个字符串是否包含`@`字符：
```sql
SELECT INSTR(EMAIL,'@') FROM Players;
```
### 7.12.INSERT
```sql
INSERT(originalString, startInt, lengthInt, addString)
```
**参数**

 - `originalString`：原来的字符串；
 - `startInt`：起始位置；
 - `lengthInt`：长度；
 - `addString`：要添加的字符串。

**描述**

在原字符串的指定位置插入额外的字符串，长度指的是在源字符串从指定开始位置开始删除的字符的长度，该方法返回字符串。

**示例**
```sql
SELECT INSERT(NAME, 1, 1, ' ') FROM Players;
```
### 7.13.LOWER
```sql
{LOWER | LCASE} (string)
```
**参数**

 - `string`：参数

**描述**

将字符串转为小写。

**示例**
```sql
SELECT LOWER(NAME) FROM Players;
```
### 7.14.UPPER
```sql
{UPPER | UCASE} (string)
```
**参数**

 - `string`：参数

**描述**

将字符串转为大写。

**示例**
下面的示例会将所有玩家的名字转为大写形式：
```sql
SELECT UPPER(last_name) "LastNameUpperCase" FROM Players;
```
### 7.15.LEFT
```sql
LEFT(string, int)
```
**参数**

 - `string`：参数；
 - `int`：字符数。

**描述**

返回最左边的若干个字符。

**示例**

获取玩家名字的前三个字符：
```sql
SELECT LEFT(NAME, 3) FROM Players;
```
### 7.16.RIGHT
```sql
RIGHT(string, int)
```
**参数**

 - `string`：参数；
 - `int`：字符数。

**描述**

返回最右边的若干个字符。

**示例**

获取玩家名字的后三个字符：
```sql
SELECT RIGHT(NAME, 3) FROM Players;
```
### 7.17.LOCATE
```sql
LOCATE(searchString, string [, startInt])
```
**参数**

 - `string`：任意字符串
 - `searchString`：要搜索的字符串
 - `startInt`：搜索的起始位置

**描述**

返回要搜索的字符串在源字符串中的位置，如果指定了起始位置，之前的字符会被忽略，如果是负数，会返回最右侧的位置，如果未找到则返回0。

**示例**

检查一个字符串是否包含`@`字符：
```sql
SELECT LOCATE('.', NAME) FROM Players;
```
### 7.18.POSITION
```sql
POSITION(searchString, string)
```
**描述**

返回要搜索的字符串在源字符串中的位置，可以参照`LOCATE`。

**示例**
```sql
SELECT POSITION('.', NAME) FROM Players;
```
### 7.19.LPAD
```sql
LPAD(string, int[, paddingString])
```
**描述**

将字符串左补到指定的长度，如果长度比字符串长度小，后面会被截断，如果未指定补齐字符串，默认使用空格。

**示例**
```sql
SELECT LPAD(AMOUNT, 10, '*') FROM Players;
```
### 7.20.RPAD
```sql
RPAD(string, int[, paddingString])
```
**描述**

将字符串右补到指定的长度，如果长度比字符串长度小，后面会被截断，如果未指定补齐字符串，默认使用空格。

**示例**
```sql
SELECT RPAD(TEXT, 10, '-') FROM Players;
```
### 7.21.LTRIM
```sql
LTRIM(string)
```
**描述**

删除字符串开头的空格。

**示例**
```sql
SELECT LTRIM(NAME) FROM Players;
```
### 7.22.RTRIM
```sql
RTRIM(string)
```
**描述**

删除字符串末尾的空格。

**示例**
```sql
SELECT RTRIM(NAME) FROM Players;
```
### 7.23.TRIM
```sql
TRIM ([{LEADING | TRAILING | BOTH} [string] FROM] string)
```
**描述**

删除首尾的所有空格，通过一个字符串，也可以删除其它的字符。

**示例**
```sql
SELECT TRIM(BOTH '_' FROM NAME) FROM Players;
```
### 7.24.REGEXP_REPLACE
```sql
REGEXP_REPLACE(inputString, regexString, replacementString [, flagsString])
```
**描述**

替换每个匹配正则表达式的子串，具体可以参照Java的`String.replaceAll()`方法，如果参数都为空（除了可选的flagsString参数），返回结果也为空。

flagsString参数可以为`i`、`c`、`n`、`m`，其它的字符会出现异常，该参数可以同时使用多个标志位（比如`im`），后面的标志会覆盖前面的，比如`ic`等价于`c`。

 - `i`：启用区分大小写匹配（Pattern.CASE_INSENSITIVE）；
 - `c`：禁用区分大小写匹配（Pattern.CASE_INSENSITIVE）；
 - `n`：允许句号`.`匹配换行符（Pattern.DOTALL）；
 - `m`：启用多行模式（Pattern.MULTILINE）。

**示例**
```sql
SELECT REGEXP_REPLACE(name, 'w+', 'W', 'i') FROM Players;
```
### 7.25.REGEXP_LIKE
```sql
REGEXP_LIKE(inputString, regexString [, flagsString])
```
**描述**

用正则表达式进行字符串匹配，具体可以参照Java的`Matcher.find()`方法，如果参数都为空（除了可选的flagsString参数），返回结果也为空。

flagsString参数可以为`i`、`c`、`n`、`m`，其它的字符会出现异常，该参数可以同时使用多个标志位（比如`im`），后面的标志会覆盖前面的，比如`ic`等价于`c`。

 - `i`：启用区分大小写匹配（Pattern.CASE_INSENSITIVE）；
 - `c`：禁用区分大小写匹配（Pattern.CASE_INSENSITIVE）；
 - `n`：允许句号`.`匹配换行符（Pattern.DOTALL）；
 - `m`：启用多行模式（Pattern.MULTILINE）。

**示例**
```sql
SELECT REGEXP_LIKE(name, '[A-Z ]*', 'i') FROM Players;
```
### 7.26.REPEAT
```sql
REPEAT(string, int)
```
**描述**

返回重复若干次数的字符串。

**示例**
```sql
SELECT REPEAT(NAME || ' ', 10) FROM Players;
```
### 7.27.REPLACE
```sql
REPLACE(string, searchString [, replacementString])
```
**描述**

将文本中出现的所有搜索字符串替换为另一个字符串，如果未指定替换字符串，索索字符串会从原字符串中删除，如果参数都为空，则返回值为空。

**示例**
```sql
SELECT REPLACE(NAME, ' ') FROM Players;
```
### 7.28.SOUNDEX
```sql
SOUNDEX(string)
```
**描述**

返回表示字符串声音的四个字符码，具体可以看[这里](http://www.archives.gov/genealogy/census/soundex.html)，该方法返回一个字符串。

**示例**
```sql
SELECT SOUNDEX(NAME) FROM Players;
```
### 7.29.SPACE
```sql
SPACE(int)
```
**描述**

返回由若干个空格组成的字符串。

**示例**
```sql
SELECT name, SPACE(80) FROM Players;
```
### 7.30.STRINGDECODE
```sql
STRINGDECODE(string)
```
**描述**

使用Java的字符串编码格式对已编码字符串进行转换，特殊字符为`\b`、`\t`、`\n`、`\f`、`\r`、`\"`、`\`、`\<octal>`, `\u<unicode>`，该方法返回一个字符串。

**示例**
```sql
STRINGENCODE(STRINGDECODE('Lines 1\nLine 2'));
```
### 7.31.STRINGENCODE
```sql
STRINGENCODE(string)
```
**描述**

使用Java的字符串编码格式对字符串进行编码，特殊字符为`\b`、`\t`、`\n`、`\f`、`\r`、`\"`、`\`、`\<octal>`, `\u<unicode>`，该方法返回一个字符串。

**示例**
```sql
STRINGENCODE(STRINGDECODE('Lines 1\nLine 2'))
```
### 7.32.STRINGTOUTF8
```sql
STRINGTOUTF8(string)
```
**描述**

将字符串转换成UTF-8格式的字符数组，该方法返回字节数组。

**示例**
```sql
SELECT UTF8TOSTRING(STRINGTOUTF8(name)) FROM Players;
```
### 7.33.SUBSTRING
```sql
{SUBSTRING | SUBSTR} (string, startInt [, lengthInt])
```
**描述**

返回一个字符串从指定位置开始的一个子串，如果开始位置为负数，那么开始位置会相对于字符串的末尾。长度是可选的。`SUBSTRING(string [FROM start] [FOR length])`也是支持的。

**示例**
```sql
SELECT SUBSTR(name, 2, 5) FROM Players;
```
### 7.34.UTF8TOSTRING
```sql
UTF8TOSTRING(bytes)
```
**描述**

将UTF-8编码的字符串解码成对应的字符串。

**示例**
```sql
SELECT UTF8TOSTRING(STRINGTOUTF8(name)) FROM Players;
```
### 7.35.XMLATTR
```sql
XMLATTR(nameString, valueString)
```
**描述**

以name=value的形式创建一个XML属性元素，value是以XML文本的形式进行编码，该方法返回一个字符串。

**示例**
```sql
XMLNODE('a', XMLATTR('href', 'http://h2database.com'))
```
### 7.36.XMLNODE
```sql
XMLNODE(elementString [, attributesString [, contentString [, indentBoolean]]])
```
**描述**

创建一个XML节点元素，如果属性字符串为空或者null，那么意味着这个节点没有属性，如果内容字符串为空或者null，那么这个节点是没有内容的，如果内容中包含换行，那么默认会被缩进，该方法返回一个字符串。

**示例**
```sql
XMLNODE('a', XMLATTR('href', 'http://h2database.com'), 'H2')
```
### 7.37.XMLCOMMENT
```sql
XMLCOMMENT(commentString)
```
**描述**

创建一个XML注释，两个减号(`--`)会被转换为` - -`。该方法返回一个字符串。

**示例**
```sql
XMLCOMMENT('Test')
```
### 7.38.XMLCDATA
```sql
XMLCDATA(valueString)
```
**描述**

创建一个XML CDATA元素，如果值中包含`]]>`，会创建一个XML文本元素作为替代，该方法返回一个字符串。

**示例**
```sql
XMLCDATA('data')
```
### 7.39.XMLSTARTDOC
```sql
XMLSTARTDOC()
```
**描述**

返回一个XML声明，结果为`<?xml version=1.0?>`。

**示例**
```sql
XMLSTARTDOC()
```
### 7.40.XMLTEXT
```sql
XMLTEXT(valueString [, escapeNewlineBoolean])
```
**描述**

创建一个XML文本元素，如果启用，换行符会被转换为一个XML实体（`&#`），该方法返回一个字符串。

**示例**
```sql
XMLSTARTDOC()
```
### 7.41.TO_CHAR
```sql
TO_CHAR(value [, formatString[, nlsParamString]])
```
**描述**

该函数会格式化一个时间戳、数值或者文本。

**示例**
```sql
TO_CHAR(TIMESTAMP '2010-01-01 00:00:00', 'DD MON, YYYY')
```
### 7.42.TRANSLATE
```sql
TRANSLATE(value , searchString, replacementString]])
```
**描述**

该函数会用另一组字符替换字符串中一组字符。

**示例**
```sql
TRANSLATE('Hello world', 'eo', 'EO')
```
## 8.日期和时间函数
### 8.1.CURRENT_DATE
```sql
{CURRENT_DATE [()] | CURDATE() | SYSDATE | TODAY}
```
**描述**

返回当前日期，该方法在一个事务中会返回同一个值。

**示例**
```sql
CURRENT_DATE()
```
### 8.2.CURRENT_TIME
```sql
{CURRENT_TIME [ () ] | CURTIME()}
```
**描述**

返回当前时间，该方法在一个事务中会返回同一个值。

**示例**
```sql
CURRENT_TIME()
```
### 8.3.CURRENT_TIMESTAMP
```sql
{CURRENT_TIMESTAMP [([int])] | NOW([int])}
```
**描述**

返回当前时间戳，注意纳秒的精度参数是可选的，该方法在一个事务中会返回同一个值。

**示例**
```sql
CURRENT_TIMESTAMP()
```
### 8.4.DATEADD
```sql
{DATEADD| TIMESTAMPADD} (unitString, addIntLong, timestamp)
```
**描述**

为时间戳增加若干个单位。第一个字符串表示单位，使用负数可以做减法，如果操作毫秒addIntLong可以是一个long型值，否则限定为整型值。支持的单位与`EXTRACT`函数一致。`DATEADD`方法返回一个时间戳，`TIMESTAMPADD`方法返回一个long型值。

**示例**
```sql
DATEADD('MONTH', 1, DATE '2001-01-31')
```
### 8.5.DATEDIFF
```sql
{DATEDIFF | TIMESTAMPDIFF} (unitString, aTimestamp, bTimestamp)
```
**描述**

返回两个时间戳根据特定单位计算的差值，该方法返回long型值，第一个字符串表示单位，支持的单位与`EXTRACT`函数一致。

**示例**
```sql
DATEDIFF('YEAR', T1.CREATED, T2.CREATED)
```
### 8.6.DAYNAME
```sql
DAYNAME(date)
```
**描述**

返回日期的名字（英语）。

**示例**
```sql
DAYNAME(CREATED)
```
### 8.7.DAY_OF_MONTH
```sql
DAY_OF_MONTH(date)
```
**描述**

返回月中的日期数（1-31）。

**示例**
```sql
DAY_OF_MONTH(CREATED)
```
### 8.8.DAY_OF_WEEK
```sql
DAY_OF_WEEK(date)
```
**描述**

返回周中的天数（1表示周日）。

**示例**
```sql
DAY_OF_WEEK(CREATED)
```
### 8.9.DAY_OF_YEAR
```sql
DAY_OF_YEAR(date)
```
**描述**

返回年中的天数（1-366）。

**示例**
```sql
DAY_OF_YEAR(CREATED)
```
### 8.10.EXTRACT
```sql
EXTRACT ({EPOCH | YEAR | YY | QUARTER | MONTH | MM | WEEK | ISO_WEEK
| DAY | DD | DAY_OF_YEAR | DOY | DAY_OF_WEEK | DOW | ISO_DAY_OF_WEEK
| HOUR | HH | MINUTE | MI | SECOND | SS | MILLISECOND | MS
| MICROSECOND | MCS | NANOSECOND | NS}
FROM timestamp)
```
**描述**

返回时间戳中的特定值，该方法返回整型值。

**示例**
```sql
EXTRACT(SECOND FROM CURRENT_TIMESTAMP)
```
### 8.11.FORMATDATETIME
```sql
FORMATDATETIME (timestamp, formatString [,localeString [,timeZoneString]])
```
**描述**

将日期、时间或者时间戳格式化成字符串，最常用的格式符为：y：年，M：月，d：日期，H：小时，m：分钟，s：秒，要了解详细信息，可以看Java的java.text.SimpleDateFormat，该方法返回字符串。

**示例**
```sql
FORMATDATETIME(TIMESTAMP '2001-02-03 04:05:06', 'EEE, d MMM yyyy HH:mm:ss z', 'en', 'GMT')
```
### 8.12.HOUR
```sql
HOUR(timestamp)
```
**描述**

返回时间戳中的小时数（0-23）。

**示例**
```sql
HOUR(CREATED)
```
### 8.13.MINUTE
```sql
MINUTE(timestamp)
```
**描述**

返回时间戳中的分钟数（0-59）。

**示例**
```sql
MINUTE(CREATED)
```
### 8.14.MONTH
```sql
MONTH(timestamp)
```
**描述**

返回时间戳中的月数（1-12）。

**示例**
```sql
MONTH(CREATED)
```
### 8.15.MONTHNAME
```sql
MONTHNAME(date)
```
**描述**

返回月的名字（英语）。

**示例**
```sql
MONTHNAME(CREATED)
```
### 8.16.PARSEDATETIME
```sql
PARSEDATETIME(string, formatString [, localeString [, timeZoneString]])
```
**描述**

将字符串解析成时间戳类型，最常用的格式符为：y：年，M：月，d：日期，H：小时，m：分钟，s：秒，要了解详细信息，可以看Java的`java.text.SimpleDateFormat`。

**示例**
```sql
PARSEDATETIME('Sat, 3 Feb 2001 03:05:06 GMT', 'EEE, d MMM yyyy HH:mm:ss z', 'en', 'GMT')
```
### 8.17.QUARTER
```sql
QUARTER(timestamp)
```
**描述**

返回时间戳中的季度数（1-4）。

**示例**
```sql
QUARTER(CREATED)
```
### 8.18.SECOND
```sql
SECOND(timestamp)
```
**描述**

返回时间戳中的秒数（0-59）。

**示例**
```sql
SECOND(CREATED)
```
### 8.19.WEEK
```sql
WEEK(timestamp)
```
**描述**

返回时间戳中的周数（1-53），该方法使用系统当前的区域设置。

**示例**
```sql
WEEK(CREATED)
```
### 8.20.YEAR
```sql
YEAR(timestamp)
```
**描述**

返回时间戳中的年数。

**示例**
```sql
YEAR(CREATED)
```
## 9.系统函数
### 9.1.COALESCE
```sql
{COALESCE | NVL } (aValue, bValue [,...])
```
**描述**

返回第一个非空值。

**示例**
```sql
COALESCE(A, B, C)
```
### 9.2.DECODE
```sql
DECODE(value, whenValue, thenValue [,...])
```
**描述**

返回第一个匹配的值，NULL会匹配NULL，如果没有匹配的，那么会返回NULL或者最后一个参数（参数个数为偶数）。

**示例**
```sql
DECODE(RAND()>0.5, 0, 'Red', 1, 'Black')
```
### 9.3.GREATEST
```sql
GREATEST(aValue, bValue [,...])
```
**描述**

返回非空的最大值，如果所有值都为空则返回空。

**示例**
```sql
GREATEST(1, 2, 3)
```
### 9.4.IFNULL
```sql
IFNULL(aValue, bValue)
```
**描述**

如果`aValue`非空则返回`aValue`，否则返回`bValue`。

**示例**
```sql
IFNULL(NULL, '')
```
### 9.5.LEAST
```sql
LEAST(aValue, bValue [,...])
```
**描述**

返回非空的最小值，如果所有值都为空则返回空。

**示例**
```sql
LEAST(1, 2, 3)
```
### 9.6.NULLIF
```sql
NULLIF(aValue, bValue)
```
**描述**

如果`aValue`等于`bValue`，则返回NULL，否则返回`aValue`。

**示例**
```sql
NULLIF(A, B)
```
### 9.7.NVL2
```sql
NVL2(testValue, aValue, bValue)
```
**描述**

如果`testValue`为空，则返回`bValue`，否则返回`aValue`。

**示例**
```sql
NVL2(X, 'not null', 'null')
```
### 9.8.CASEWHEN
```sql
CASEWHEN (boolean , aValue , bValue)
```
**描述**

如果布尔表达式为true，则返回`aValue`，否则返回`bValue`。

**示例**
```sql
CASEWHEN(ID=1, 'A', 'B')
```
### 9.9.CAST
```sql
CAST (value AS dataType)
```
**描述**

将值变更为另一个类型，规则如下：

 - 如果将数值转为布尔值，0被认为false，其它值为true；
 - 如果将布尔值转为数值，false为0，true为1；
 - 当将数值转为另一个类型的数值时，会检查是否溢出；
 - 如果将数值转为二进制，字节数会与精度匹配；
 - 如果将字符串转为二进制，会用十六进制编码；
 - 一个十六进制字符串可以转为二进制形式，然后转成数值。如果无法直接转换，则首先将其转为字符串。

**示例**
```sql
CAST(NAME AS INT);
CAST(65535 AS BINARY);
CAST(CAST('FFFF' AS BINARY) AS INT);
```
### 9.10.CONVERT
```sql
CONVERT (value , dataType)
```
**描述**

将值转为另一个类型。

**示例**
```sql
CONVERT(NAME, INT)
```
### 9.11.TABLE
```sql
TABLE	| TABLE_DISTINCT	(name dataType = expression)
```
**描述**

返回一个结果集，TABLE_DISTINCT会删除重复行。

**示例**
```sql
SELECT * FROM TABLE(ID INT=(1, 2), NAME VARCHAR=('Hello', 'World'))
```
## 10.数据类型
本章节中列出了Ignite中支持的SQL数据类型列表，比如string、numeric以及date/time类型。

对于每个SQL类型来说，都会被映射到Ignite原生支持的编程语言或者驱动指定的类型上。
### 10.1.BOOLEAN
可选值：`TRUE`和`FALSE`。

映射：

 - Java/JDBC: `java.lang.Boolean`
 - .NET/C#: `bool`
 - C/C++: `bool`
 - ODBC: `SQL_BIT`

### 10.2.INT
可选值：[`-2147483648`, `2147483647`]。

映射：

 - Java/JDBC: `java.lang.Integer`
 - .NET/C#: `int`
 - C/C++: `int32_t`
 - ODBC: `SQL_INTEGER`

### 10.3.TINYINT
可选值：[`-128`, `127`]。

映射：

 - Java/JDBC: `java.lang.Byte`
 - .NET/C#: `sbyte`
 - C/C++: `int8_t`
 - ODBC: `SQL_TINYINT`

### 10.4.SMALLINT
可选值：[`-32768`, `32767`]。

映射：

 - Java/JDBC: `java.lang.Short`
 - .NET/C#: `short`
 - C/C++: `int16_t`
 - ODBC: `SQL_SMALLINT`

### 10.5.BIGINT
可选值：[`-9223372036854775808`, `9223372036854775807`]。

映射：

 - Java/JDBC: `java.lang.Long`
 - .NET/C#: `long`
 - C/C++: `int64_t`
 - ODBC: `SQL_BIGINT`

### 10.6.DECIMAL
可选值：带有固定精度的数值类型。

映射：

 - Java/JDBC: `java.math.BigDecimal`
 - .NET/C#: `decimal`
 - C/C++: `ignite::Decimal`
 - ODBC: `SQL_DECIMAL`

### 10.7.DOUBLE
可选值：浮点数。

映射：

 - Java/JDBC: `java.lang.Double`
 - .NET/C#: `double`
 - C/C++: `double`
 - ODBC: `SQL_DOUBLE`

### 10.8.REAL
可选值：单精度浮点数。

映射：

 - Java/JDBC: `java.lang.Float`
 - .NET/C#: `float`
 - C/C++: `float`
 - ODBC: `SQL_FLOAT`

### 10.9.TIME
可选值：时间数据类型，格式为`hh:mm:ss`。

映射：

 - Java/JDBC: `java.sql.Time`
 - .NET/C#: `N/A`
 - C/C++: `ignite::Time`
 - ODBC: `SQL_TYPE_TIME`

### 10.10.DATE
可选值：日期数据类型，格式为`yyyy-MM-dd`。

映射：

 - Java/JDBC: `java.sql.Date`
 - .NET/C#: `N/A`
 - C/C++: `ignite::Date`
 - ODBC: `SQL_TYPE_DATE`

::: danger 注意
尽可能地使用`TIMESTAMP`而不是`DATE`，因为`DATE`类型的序列化/反序列化效率非常低，导致性能下降。
:::
### 10.11.TIMESTAMP
可选值：时间戳数据类型，格式为`yyyy-MM-dd hh:mm:ss[.nnnnnnnnn]`。

映射：

 - Java/JDBC: `java.sql.Timestamp`
 - .NET/C#: `System.DateTime`
 - C/C++: `ignite::Timestamp`
 - ODBC: `SQL_TYPE_TIMESTAMP`

### 10.12.VARCHAR
可选值：Unicode字符串。

映射：

 - Java/JDBC: `java.lang.String`
 - .NET/C#: `string`
 - C/C++: `std::string`
 - ODBC: `SQL_VARCHAR`

### 10.13.CHAR
可选值：Unicode字符串。支持这个类型是为了与旧的应用或者其它数据库进行兼容。

映射：

 - Java/JDBC: `java.lang.String`
 - .NET/C#: `string`
 - C/C++: `std::string`
 - ODBC: `SQL_CHAR`

### 10.14.UUID
可选值：通用唯一标识符，长度128位。

映射：

 - Java/JDBC: `java.util.UUID`
 - .NET/C#: `System.Guid`
 - C/C++: `ignite::Guid`
 - ODBC: `SQL_GUID`

### 10.15.BINARY
可选值：表示一个字节数组。

映射：

 - Java/JDBC: `byte[]`
 - .NET/C#: `byte[]`
 - C/C++: `int8_t[]`
 - ODBC: `SQL_BINARY`

### 10.16.GEOMETRY
可选值：空间几何类型，基于`com.vividsolutions.jts`库，通常以文本格式表示。

映射：

 - Java/JDBC: 来自`com.vividsolutions.jts`包的类型
 - .NET/C#: `N/A`
 - C/C++: `N/A`
 - ODBC: `N/A`

## 11.规范一致性
Ignite直接支持ANSI-99标准的主要特性，下面的表格会显示Ignite与[SQL:1999 (核心)](https://en.wikipedia.org/wiki/SQL_compliance)的兼容性。

|特性ID，特姓名|支持度|
|---|---|
|`E011`数值数据类型|Ignite完全支持下面的子特性：<br>　　E011–01：INTEGER和SMALLINT数据类型（包括各种拼写）<br>　　E011–02：REAL，DOUBLE PRECISON以及FLOAT数据类型<br>　　E011–05：数值比较<br>　　E011–06：数值类型间的隐性转换<br>Ignite部分支持下面的子特性：<br>　　E011–03：DECIMAL和NUMERIC数据类型，目前不支持固定精度<br>　　E011–04：算术运算符|
|`E021`字符串类型|Ignite完全支持下面的子特性：<br>　　E021–03：字符字面量<br>　　E021–04：CHARACTER_LENGTH函数<br>　　E021–05：OCTET_LENGTH函数<br>　　E021–06：SUBSTRING函数<br>　　E021–07：字符串拼接<br>　　E021–08：UPPER和LOWER函数<br>　　E021–09：TRIM函数<br>　　E021–10：不可变长度和可变长度字符串之间的隐式转换<br>　　E021–11：POSITION函数<br>　　E021–12：字符串比较<br>Ignite部分支持下面的子特性：<br>　　E021–01：CHARACTER数据类型（包括各种拼写）<br>　　E021–02：CHARACTER VARYING数据类型（包括各种拼写）|
|`E031`标识符|Ignite完全支持下面的子特性：<br>　　E031–01：分割标识符<br>　　E031–02：小写标识符<br>　　E031–03：下划线结尾|
|`E051`基本查询规范|Ignite完全支持下面的子特性：<br>　　E051–01：SELECT DISTINCT<br>　　E051–04：GROUP BY可以包含SELECT字段列表中没有的列<br>　　E051–05：SELECT列表项可以重命名<br>　　E051–06：HAVING子句<br>　　E051–07：SELECT中的限定符*<br>　　E051–08：FROM子句中的别名<br>Ignite不支持下面的子特性：<br>　　E051–02：GROUP BY子句，不支持ROLLUP、CUBE、GROUPING SETS<br>　　E051–09：FROM子句列重命名|
|`E061`基本谓词和查询条件|Ignite完全支持下面的子特性：<br>　　E061–01：比较谓词<br>　　E061–02：BETWEEN谓词<br>　　E061–03：包含值列表的IN谓词<br>　　E061–06：NULL谓词<br>　　E061–08：EXISTS谓词<br>　　E061–09：比较谓词中的子查询<br>　　E061–11：IN谓词中的子查询<br>　　E061–13：子查询别名<br>　　E061–14：检索条件<br>Ignite部分支持下面的子特性：<br>　　E061–04：LIKE谓词<br>　　E061–05：LIKE谓词，ESCAPE子句<br>　　E061–07：限定比较谓词<br>Ignite不支持下面的子特性：<br>　　E061–12：限定比较谓词中的子查询|
|`E071`基本查询表达式|Ignite部分支持下面的子特性：<br>　　E071–01：UNION DISTINCT表运算符<br>　　E071–02：UNION ALL表运算符<br>　　E071–03：EXCEPT DISTINCT表运算符<br>　　E071–05：通过表运算符组合的列不必具有完全相同的数据类型<br>　　E071–06：子查询中的表运算符|
|`E081`基本权限|Ignite不支持下面的子特性：<br>　　E081–01：表级SELECT权限<br>　　E081–02：DELETE权限<br>　　E081–03：表级INSERT权限<br>　　E081–04：表级UPDATE权限<br>　　E081–05：列级UPDATE权限<br>　　E081–06：表级REFERENCES权限<br>　　E081–07：列级REFERENCES权限<br>　　E081–08：WITH GRANT OPTION<br>　　E081–09：USAGE权限<br>　　E081–10：EXECUTE权限|
|`E091`聚合函数|Ignite部分支持下面的子特性：<br>　　E091–01：AVG<br>　　E091–02：COUNT<br>　　E091–03：MAX<br>　　E091–04：MIN<br>　　E091–05：SUM<br>　　E091–06：ALL限定符<br>　　E091–07：DISTINCT限定符|
|`E101`基本数据维护|Ignite完全支持下面的子特性：<br>　　E101–03：已检索的UPDATE语句<br>　　E101–04：已检索的DELETE语句<br>Ignite部分支持下面的子特性：<br>　　E101–01：INSERT语句不支持DEFAULT默认值|
|`E111`单行SELECT语句|目前不支持|
|`E121`基本游标支持|Ignite不支持下面的子特性：<br>　　E121–01：DECLARE CURSOR<br>　　E121–02：ORDER BY中的列可以不在SELECT字段列表中<br>　　E121–03：ORDER BY子句中的值表达式<br>　　E121–04：OPEN语句<br>　　E121–06：UPDATE语句中的定位<br>　　E121–07：DELETE语句中的定位<br>　　E121–08：CLOSE语句<br>　　E121–10：FETCH语句，隐式NEXT<br>　　E121–17：WITH HOLD游标|
|`E131`NULL值支持|Ignite完全支持此特性|
|`E141`基本完整性约束|Ignite完全支持下面的子特性：<br>　　E141–01：NOT NULL约束<br>Ignite部分支持下面的子特性：<br>　　E141–03：PRIMARY KEY约束<br>　　E141–08：PRIMARY KEY推断NOT NULL<br>Ignite不支持下面的子特性：<br>　　E141–02：NOT NULL列的UNIQUE约束<br>　　E141–04：对引用的删除和更新操作，都具有默认NO ACTION的基本FOREIGN KEY约束<br>　　E141–06：CHECK约束<br>　　E141–07：列默认值<br>　　E141–10：外键中的列名没有顺序约束|
|`E151`事务支持|Ignite不支持下面的子特性：<br>　　E151–01：COMMIT语句<br>　　E151–02：ROLLBACK语句|
|`E152`基本SET TRANSACTION语句|Ignite不支持下面的子特性：<br>　　E152–01：SET TRANSACTION语句: ISOLATION LEVEL SERIALIZABLE子句<br>　　E152–02：SET TRANSACTION语句: READ ONLY和READ WRITE子句|
|`E153`可更新的带子查询的查询|Ignite完全支持此特性|
|`E161`双减号开头的SQL注释|Ignite完全支持此特性|
|`E171`SQLSTATE支持|Ignite部分支持本特性，实现了标准错误码的子集，并且引入了部分自定义的错误码|
|`E182`主机语言绑定（以前的“模块语言”）|目前不支持|
|`F021`基本信息模式|Ignite不支持下面的子特性：<br>　　F021–01：COLUMNS视图<br>　　F021–02：TABLES视图<br>　　F021–03：VIEWS视图<br>　　F021–04：TABLE_CONSTRAINTS视图<br>　　F021–05：REFERENTIAL_CONSTRAINTS视图<br>　　F021–06：CHECK_CONSTRAINTS视图|
|`F031`基本模式维护|Ignite完全支持下面的子特性：<br>　　F031–04：ALTER TABLE语句，ADD COLUMN子句<br>Ignite部分支持下面的子特性：<br>　　F031–01：持久化的表的CREATE TABLE语句，支持基本语法，但是不支持AS，不支持权限（INSERT、SELECT、UPDATE、DELETE）<br>Ignite不支持下面的子特性：<br>　　F031–02：CREATE VIEW语句<br>　　F031–03：GRANT语句<br>　　F031–13：DROP TABLE语句，RESTRICT子句<br>　　F031–16：DROP VIEW语句，RESTRICT子句<br>　　F031–19：REVOKE语句，RESTRICT子句|
|`F041`基本表联接|Ignite完全支持下面的子特性：<br>　　F041–01：内联接（INNER关键字不是必须的）<br>　　F041–02：INNER关键字<br>　　F041–03：LEFT OUTER JOIN<br>　　F041–04：RIGHT OUTER JOIN<br>　　F041–05：外联接可以嵌套<br>　　F041–07：左或右外联接中的内部表也可以用于内联接<br>　　F041–08：所有的比较运算符都支持，不仅仅是=|
|`F051`基本时期和时间|Ignite完全支持下面的子特性：<br>　　F051–04：DATE、TIME和TIMESTAMP数据类型上的比较谓词<br>　　F051–05：日期时间类型和字符串类型之间的显式类型转换<br>　　F051–06：CURRENT_DATE<br>　　F051–07：LOCALTIME<br>　　F051–08：LOCALTIMESTAMP<br>Ignite部分支持下面的子特性：<br>　　F051–01：DATE数据类型（包括DATE字面量）<br>　　F051–02：TIME数据类型（包括TIME字面量）<br>　　F051–03：TIMESTAMP数据类型（包括TIMESTAMP字面量）|
|`F081`视图中的UNION和EXCEPT|暂不支持|
|`F131`分组运算符|Ignite不支持下面的子特性：<br>　　F131–01：带有分组视图的查询中支持WHERE、GROUP BY和HAVING子句<br>　　F131–02：带有分组视图的查询中支持多个表<br>　　F131–03：带有分组视图的查询中支持聚合函数<br>　　F131–04：带有GROUP BY和HAVING子句和分组视图的子查询<br>　　F131–05：带有GROUP BY和HAVING子句和分组视图的单行SELECT|
|`F181`多模块支持|暂不支持|
|`F201`CAST函数|Ignite完全支持此特性|
|`F221`显式默认值|Ignite完全支持此特性|
|`F261`CASE表达式|Ignite完全支持下面的子特性：<br>　　F261–01：简单CASE<br>　　F261–02：已检索CASE<br>　　F261–03：NULLIF<br>　　F261–04：COALESCE|
|`F311`模式定义语句|Ignite不支持下面的子特性：<br>　　F311–01：CREATE SCHEMA<br>　　F311–02：持久化的表的CREATE TABLE<br>　　F311–03：CREATE VIEW<br>　　F311–04：CREATE VIEW: WITH CHECK OPTION<br>　　F311–05：GRANT语句|
|`F471`标量子查询值|Ignite完全支持此特性|
|`F481`扩展NULL谓词|Ignite完全支持此特性|
|`F501`特性和一致性视图|Ignite不支持下面的子特性：<br>　　F501–01：SQL_FEATURES视图<br>　　F501–02：SQL_SIZING视图<br>　　F501–03：SQL_LANGUAGES视图|
|`F812`基本标志|暂不支持|
|`S011`明确的数据类型|Ignite不支持下面的子特性：<br>　　S011–01：USER_DEFINED_TYPES视图|
|`T321`基本SQL调用的存储过程|Ignite不支持下面的子特性：<br>　　T321–01：无过载的用户定义函数<br>　　T321–02：无过载的用户定义存储过程<br>　　T321–03：函数调用<br>　　T321–04：CALL语句<br>　　T321–05：RETURN语句<br>　　T321–06：ROUTINES视图<br>　　T321–07：PARAMETERS视图|

## 12.事务
Ignite支持下面的语句，用户可以对事务进行开启、提交和回滚。
```sql
BEGIN [TRANSACTION]

COMMIT [TRANSACTION]

ROLLBACK [TRANSACTION]
```

 - `BEGIN`语句开启一个新的事务；
 - `COMMIT`语句提交当前事务；
 - `ROLLBACK`语句回滚当前事务。

::: danger 限制
事务内不支持DDL语句。
:::

### 12.1.描述
`BEGIN`、`COMMIT`和`ROLLBACK`命令可用于处理[SQL事务](/doc/sql/Architecture.md#_7-sql事务)，事务是一组有序的SQL操作，通过`BEGIN`语句开始，以`COMMIT`结束，事务内的操作要么全部成功，要么全部失败。

`ROLLBACK [TRANSACTION]`语句会撤销上次`COMMIT`或者`ROLLBACK`命令之后的所有更新。
### 12.2.示例
在一个事务内，插入一条Person数据，更新City的population字段：
```sql
BEGIN;

INSERT INTO Person (id, name, city_id) VALUES (1, 'John Doe', 3);

UPDATE City SET population = population + 1 WHERE id = 3;

COMMIT;
```
回滚之前命令的更新：
```sql
BEGIN;

INSERT INTO Person (id, name, city_id) VALUES (1, 'John Doe', 3);

UPDATE City SET population = population + 1 WHERE id = 3;

ROLLBACK;
```
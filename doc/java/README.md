# 1.基本概念
## 1.1.Ignite是什么

::: tip Ignite是：
一个以内存为中心的分布式数据库、缓存和处理平台，可以在PB级数据中，以内存级的速度进行事务性、分析性以及流式负载的处理。
:::

![](https://files.readme.io/0bad3a9-ignite_architecture.png)
### 1.1.1.固化内存
Ignite的固化内存组件不仅仅将内存作为一个缓存层，还视为一个全功能的存储层。这意味着可以按需将持久化打开或者关闭。如果持久化关闭，那么Ignite就可以作为一个分布式的**内存数据库**或者**内存数据网格**，这完全取决于使用SQL和键-值API的喜好。如果持久化打开，那么Ignite就成为一个分布式的，**可水平扩展的数据库**，它会保证完整的数据一致性以及集群故障的可恢复能力。
### 1.1.2.Ignite持久化
Ignite的原生持久化是一个分布式的、支持ACID以及兼容SQL的磁盘存储，它可以作为一个可选的磁盘层与Ignite的固化内存透明地集成，然后将数据和索引存储在SSD、闪存、3D XPoint以及其他类型的非易失性存储中。

打开Ignite的持久化之后，就不需要将所有的数据和索引保存在内存中，或者在节点或者集群重启后对数据进行预热，因为固化内存和持久化紧密耦合之后，会将其视为一个二级存储层，这意味着在内存中数据和索引的一个子集如果丢失了，固化内存会从磁盘上进行获取。
### 1.1.3.ACID兼容
存储在Ignite中的数据，在内存和磁盘上是同时支持ACID的，使Ignite成为一个**强一致**的系统，Ignite可以在整个网络的多台服务器上保持事务。
### 1.1.4.完整的SQL支持
Ignite提供了完整的SQL、DDL和DML的支持，可以使用纯SQL而不用写代码与Ignite进行交互，这意味着只使用SQL就可以创建表和索引，以及插入、更新和查询数据。有这个完整的SQL支持，Ignite就可以作为一种**分布式SQL数据库**。
### 1.1.5.键-值
Ignite的内存数据网格组件是一个完整的事务型**分布式键值存储**，它可以在有几百台服务器的集群上进行水平扩展。在打开持久化时，Ignite可以存储比内存容量更大的数据，并且在整个集群重启之后仍然可用。
### 1.1.6.并置处理
大多数传统数据库是以客户机-服务器的模式运行的，这意味着数据必须发给客户端进行处理，这个方式需要在客户端和服务端之间进行大量的数据移动，通常来说不可扩展。而Ignite使用了另外一种方式，可以将轻量级的计算发给数据，即数据的**并置**计算，从结果上来说，Ignite扩展性更好，并且使数据移动最小化。
### 1.1.7.可扩展性和持久性
Ignite是一个弹性的、可水平扩展的分布式系统，它支持按需地添加和删除节点，Ignite还可以存储数据的多个副本，这样可以使集群从部分故障中恢复。如果打开了持久化，那么Ignite中存储的数据可以在集群的完全故障中恢复。Ignite集群重启会非常快，因为数据从磁盘上获取，瞬间就具有了可操作性。从结果上来说，数据不需要在处理之前预加载到内存中，而Ignite会缓慢地恢复内存级的性能。

## 1.2.Ignite定位

**Ignite是不是持久化或者纯内存存储？**

**都是**，Ignite的原生持久化可以打开，也可以关闭。这使得Ignite可以存储比可用内存容量更大的数据集。也就是说，可以只在内存中存储较少的操作性数据集，然后将不适合存储在内存中的较大数据集存储在磁盘上，即为了提高性能将内存作为一个缓存层。

**Ignite是不是内存数据库（IMDB）？**

**是**，虽然Ignite的*固化内存*在内存和磁盘中都工作得很好，但是磁盘持久化是可以关闭的，使Ignite成为一个支持SQL以及分布式关联的*内存数据库*。

**Ignite是不是内存数据网格（IMDG）？**

**是**，Ignite是一个全功能的数据网格，它既可以用于纯内存模式，也可以带有Ignite的原生持久化，它也可以与任何第三方数据库集成，包括RDBMS和NoSQL。

**Ignite是不是一个分布式缓存？**

**是**，如果关闭原生持久化，Ignite就会成为一个分布式缓存，Ignite实现了JCache规范（JSR107），并且提供了比规范要求更多的功能，包括分区和复制模式、分布式ACID事务、SQL查询以及原生持久化等。

**Ignite是不是分布式数据库？**

**是**，在整个集群的多个节点中，Ignite中的数据要么是*分区模式*的，要么是*复制模式*的，这给系统带来了伸缩性，增加了系统的弹性。Ignite可以自动控制数据如何分区，同时，开发者也可以插入自定义的分布（关系）函数，以及为了提高效率将部分数据并置在一起。

**Ignite是不是SQL数据库？**

**不完整**，尽管Ignite的目标是和其他的关系型SQL数据库具有类似的行为，但是在处理约束和索引方面还是有不同的。Ignite支持*一级*和*二级*索引，但是只有一级索引支持*唯一性*，Ignite还不支持*外键*约束。

总体来说，Ignite作为约束不支持任何会导致集群广播消息的更新以及显著降低系统性能和可伸缩性的操作。

**Ignite是不是一个NoSQL数据库?**

**不完全**，和其他NoSQL数据库一样，Ignite支持高可用和水平扩展，但是，和其他的NoSQL数据库不同，Ignite支持SQL和ACID。

**Ignite是不是事务型数据库？**

**不完整**，ACID事务是支持的，但是仅仅在键-值API级别，Ignite还支持*跨分区的事务*，这意味着事务可以跨越不同服务器不同分区中的键。

在SQL层，Ignite支持*原子性*，还不是*事务型一致性*，社区计划在2.4版本中实现SQL事务。

**Ignite是不是一个多模式数据库？**

**是**，Ignite的数据建模和访问，同时支持键值和SQL，另外，Ignite还为在分布式数据上的计算处理，提供了强大的API。

**Ignite是不是键-值存储？**

**是**，Ignite提供了丰富的键-值API，兼容于JCache (JSR-107)，并且支持Java，C++和.NET。

**固化内存是什么？**

Ignite的*固化内存*架构使得Ignite可以将内存计算延伸至磁盘，它基于一个页面化的堆外内存分配器，它通过预写日志（WAL）的持久化来对数据进行固化，当持久化禁用之后，固化内存就会变成一个纯粹的内存存储。

**并置处理是什么？**

Ignite是一个分布式系统，因此，有能力将数据和数据以及数据和计算进行并置就变得非常重要，这会避免分布式数据噪声。当执行分布式SQL关联时数据的并置就变得非常的重要。Ignite还支持将用户的逻辑（函数，lambda等）直接发到数据所在的节点然后在本地进行数据的运算。

## 1.3.入门
### 1.3.1.先决条件
Apache Ignite官方在如下环境中进行的测试：

 - JDK：Oracle JDK8及以上，Open JDK8及以上，IBM JDK8及以上，如果使用了JDK9，具体可以看下面的`在JDK9中运行Ignite`章节；
 - OS：Linux（任何版本），Mac OS X（10.6及以上），Windows(XP及以上)，Windows Server（2008及以上），Oracle Solaris
 - 网络：没有限制（建议10G）
 - 架构：x86，x64，SPARC，PowerPC

### 1.3.2.启动第一个Ignite集群

**二进制发行版**

可以从下面的步骤开始：

 - 从[官网](https://ignite.apache.org/)下载zip格式压缩包；
 - 解压到系统中的一个安装文件夹；
 - （可选）配置`IGNITE_HOME`环境变量，指向安装文件夹，确保路径以`/`结尾。

::: tip 其他的安装选项
除了二进制发行版，Ignite还支持源代码安装、docker、云镜像以及RPM格式，具体可以看下面的说明。
在应用中，建议使用maven，后面会介绍。
:::

下一步，使用命令行接口可以启动第一个Ignite集群，如下所示，可以使用默认的或者也可以加上自定义的配置文件，可以启动任意多个节点，它们之间会自动发现。

**使用默认的配置**

使用默认的配置启动集群，打开命令行，转到`IGNITE_HOME`（Ignite安装文件夹），然后输入：

Linux：
```bash
$ bin/ignite.sh
```
Windows：
```batch
$ bin\ignite.bat
```
输出大致如下：
```
[02:49:12] Ignite node started OK (id=ab5d18a6)
[02:49:12] Topology snapshot [ver=1, nodes=1, CPUs=8, heap=1.0GB]
```
`ignite.sh`会使用`config/default-config.xml`这个默认配置文件启动节点。

**传入配置文件**

如果要使用一个定制配置文件，可以将其作为参数传给`ignite.sh/bat`，如下：

Linux：
```bash
$ bin/ignite.sh examples/config/example-ignite.xml
```
Windows：
```batch
$ bin\ignite.bat examples\config\example-ignite.xml
```
配置文件的路径，可以是绝对路径，也可以是相对于`IGNITE_HOME`（Ignite安装文件夹）的相对路径，也可以是类路径中的`META-INF`文件夹。
>**交互模式**
如果要使用交互模式选择一个配置文件，传入`-i`参数即可，就是`ignite.sh -i`。

好，这样就成功了！
### 1.3.3.使用Maven
下一步是将Ignite嵌入自己的应用，Java中的最简单的入门方式是使用Maven依赖系统。

Ignite中只有`ignite-core`模块是必须的，一般来说，要使用基于Spring的xml配置，还需要`ignite-spring`模块，要使用SQL查询，还需要`ignite-indexing`模块。

下面中的`${ignite-version}`需要替换为实际使用的版本。
```xml
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-core</artifactId>
    <version>${ignite.version}</version>
</dependency>
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-spring</artifactId>
    <version>${ignite.version}</version>
</dependency>
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-indexing</artifactId>
    <version>${ignite.version}</version>
</dependency>
```

::: tip Maven配置
关于如何包含个别的ignite maven模块的更多信息，可以参考`1.4.Maven设置`章节。
:::

每个发布版中，都会有一个[示例工程](https://github.com/apache/ignite/tree/master/examples)，在开发环境中打开这个工程，然后转到`{ignite_version}/examples`文件夹找到`pom.xml`文件，依赖引入之后，各种示例就可以演示Ignite的各种功能了。

### 1.3.4.第一个SQL应用
下面会创建两张表及其索引，分别为`City`表和`Person`表，分别表示居住在城市中的人，并且城市中会有很多的人，通过WITH子句然后指定`affinityKey=city_id`，可以将人对象和其居住的城市对象并置在一起。

通过命令行或者嵌入式模式启动Ignite集群节点后，可以通过下面的语句创建SQL模式：

SQL：
```sql
CREATE TABLE City (
  id LONG PRIMARY KEY, name VARCHAR)
  WITH "template=replicated"

CREATE TABLE Person (
  id LONG, name VARCHAR, city_id LONG, PRIMARY KEY (id, city_id))
  WITH "backups=1, affinityKey=city_id"

CREATE INDEX idx_city_name ON City (name)

CREATE INDEX idx_person_name ON Person (name)
```
JDBC：
```java
// Register JDBC driver.
Class.forName("org.apache.ignite.IgniteJdbcThinDriver");

// Open JDBC connection.
Connection conn = DriverManager.getConnection("jdbc:ignite:thin://127.0.0.1/");

// Create database tables.
try (Statement stmt = conn.createStatement()) {

    // Create table based on REPLICATED template.
    stmt.executeUpdate("CREATE TABLE City (" + 
    " id LONG PRIMARY KEY, name VARCHAR) " +
    " WITH \"template=replicated\"");

    // Create table based on PARTITIONED template with one backup.
    stmt.executeUpdate("CREATE TABLE Person (" +
    " id LONG, name VARCHAR, city_id LONG, " +
    " PRIMARY KEY (id, city_id)) " +
    " WITH \"backups=1, affinityKey=city_id\"");
  
    // Create an index on the City table.
    stmt.executeUpdate("CREATE INDEX idx_city_name ON City (name)");

    // Create an index on the Person table.
    stmt.executeUpdate("CREATE INDEX idx_person_name ON Person (name)");
}
```
ODBC：
```cpp
SQLHSTMT stmt;

// Allocate a statement handle.
SQLAllocHandle(SQL_HANDLE_STMT, dbc, &stmt);

// Create table based on REPLICATED template.
SQLCHAR query1[] = "CREATE TABLE City ("
  "id LONG PRIMARY KEY, name VARCHAR) "
  "WITH \"template=replicated\"";
SQLSMALLINT queryLen1 = static_cast<SQLSMALLINT>(sizeof(query1));

SQLExecDirect(stmt, query, queryLen);

// Create table based on PARTITIONED template with one backup.
SQLCHAR query2[] = "CREATE TABLE Person ( "
    "id LONG, name VARCHAR, city_id LONG "
    "PRIMARY KEY (id, city_id)) "
    "WITH \"backups=1, affinityKey=city_id\"";
SQLSMALLINT queryLen2 = static_cast<SQLSMALLINT>(sizeof(query2));

SQLExecDirect(stmt, query, queryLen);

// Create an index on the City table.
SQLCHAR query3[] = "CREATE INDEX idx_city_name ON City (name)";

SQLSMALLINT queryLen3 = static_cast<SQLSMALLINT>(sizeof(query3));

SQLRETURN ret = SQLExecDirect(stmt, query3, queryLen3);

// Create an index on the Person table.
SQLCHAR query4[] = "CREATE INDEX idx_person_name ON Person (name)";

SQLSMALLINT queryLen4 = static_cast<SQLSMALLINT>(sizeof(query4));

ret = SQLExecDirect(stmt, query4, queryLen4);
```
下一步，需要往两个表中注入一些数据，比如：

SQL：
```sql
INSERT INTO City (id, name) VALUES (1, 'Forest Hill');
INSERT INTO City (id, name) VALUES (2, 'Denver');
INSERT INTO City (id, name) VALUES (3, 'St. Petersburg');

INSERT INTO Person (id, name, city_id) VALUES (1, 'John Doe', 3);
INSERT INTO Person (id, name, city_id) VALUES (2, 'Jane Roe', 2);
INSERT INTO Person (id, name, city_id) VALUES (3, 'Mary Major', 1);
INSERT INTO Person (id, name, city_id) VALUES (4, 'Richard Miles', 2);
```
JDBC：
```java
// Register JDBC driver
Class.forName("org.apache.ignite.IgniteJdbcThinDriver");

// Open JDBC connection
Connection conn = DriverManager.getConnection("jdbc:ignite:thin://127.0.0.1/");

// Populate City table
try (PreparedStatement stmt =
conn.prepareStatement("INSERT INTO City (id, name) VALUES (?, ?)")) {

    stmt.setLong(1, 1L);
    stmt.setString(2, "Forest Hill");
    stmt.executeUpdate();

    stmt.setLong(1, 2L);
    stmt.setString(2, "Denver");
    stmt.executeUpdate();

    stmt.setLong(1, 3L);
    stmt.setString(2, "St. Petersburg");
    stmt.executeUpdate();
}

// Populate Person table
try (PreparedStatement stmt =
conn.prepareStatement("INSERT INTO Person (id, name, city_id) VALUES (?, ?, ?)")) {

    stmt.setLong(1, 1L);
    stmt.setString(2, "John Doe");
    stmt.setLong(3, 3L);
    stmt.executeUpdate();

    stmt.setLong(1, 2L);
    stmt.setString(2, "Jane Roe");
    stmt.setLong(3, 2L);
    stmt.executeUpdate();

    stmt.setLong(1, 3L);
    stmt.setString(2, "Mary Major");
    stmt.setLong(3, 1L);
    stmt.executeUpdate();

    stmt.setLong(1, 4L);
    stmt.setString(2, "Richard Miles");
    stmt.setLong(3, 2L);
    stmt.executeUpdate();
}
```
ODBC：
```cpp
SQLHSTMT stmt;

// Allocate a statement handle.
SQLAllocHandle(SQL_HANDLE_STMT, dbc, &stmt);

// Populate City table.
SQLCHAR query1[] = "INSERT INTO City (id, name) VALUES (?, ?)";

SQLRETURN ret = SQLPrepare(stmt, query1, static_cast<SQLSMALLINT>(sizeof(query1)));

char name[1024];

int32_t key = 1;
strncpy(name, "Forest Hill", sizeof(name));
ret = SQLExecute(stmt);

key = 2;
strncpy(name, "Denver", sizeof(name));
ret = SQLExecute(stmt);

key = 3;
strncpy(name, "Denver", sizeof(name));
ret = SQLExecute(stmt);

// Populate Person table
SQLCHAR query2[] = "INSERT INTO Person (id, name, city_id) VALUES (?, ?, ?)";

ret = SQLPrepare(stmt, query2, static_cast<SQLSMALLINT>(sizeof(query2)));

key = 1;
strncpy(name, "John Doe", sizeof(name));
int32_t city_id = 3;
ret = SQLExecute(stmt);

key = 2;
strncpy(name, "Jane Roe", sizeof(name));
city_id = 2;
ret = SQLExecute(stmt);

key = 3;
strncpy(name, "Mary Major", sizeof(name));
city_id = 1;
ret = SQLExecute(stmt);

key = 4;
strncpy(name, "Richard Miles", sizeof(name));
city_id = 2;
ret = SQLExecute(stmt);
```
Java API：
```
// Connecting to the cluster.
Ignite ignite = Ignition.start();

// Getting a reference to an underlying cache created for City table above.
IgniteCache<Long, City> cityCache = ignite.cache("SQL_PUBLIC_CITY");

// Getting a reference to an underlying cache created for Person table above.
IgniteCache<PersonKey, Person> personCache = ignite.cache("SQL_PUBLIC_PERSON");

// Inserting entries into City.
SqlFieldsQuery query = new SqlFieldsQuery(
    "INSERT INTO City (id, name) VALUES (?, ?)");

cityCache.query(query.setArgs(1, "Forest Hill")).getAll();
cityCache.query(query.setArgs(2, "Denver")).getAll();
cityCache.query(query.setArgs(3, "St. Petersburg")).getAll();

// Inserting entries into Person.
query = new SqlFieldsQuery(
    "INSERT INTO Person (id, name, city_id) VALUES (?, ?, ?)");

personCache.query(query.setArgs(1, "John Doe", 3)).getAll();
personCache.query(query.setArgs(2, "Jane Roe", 2)).getAll();
personCache.query(query.setArgs(3, "Mary Major", 1)).getAll();
personCache.query(query.setArgs(4, "Richard Miles", 2)).getAll();
```
下面就可以查询数据了，可以查询人及其居住的城市，这会进行两个表的关联：

SQL：
```sql
SELECT p.name, c.name
FROM Person p, City c
WHERE p.city_id = c.id
```
JDBC：
```java
// Register JDBC driver
Class.forName("org.apache.ignite.IgniteJdbcThinDriver");

// Open JDBC connection
Connection conn = DriverManager.getConnection("jdbc:ignite:thin://127.0.0.1/");

// Get data
try (Statement stmt = conn.createStatement()) {
    try (ResultSet rs =
    stmt.executeQuery("SELECT p.name, c.name " +
    " FROM Person p, City c " +
    " WHERE p.city_id = c.id")) {

      while (rs.next())
         System.out.println(rs.getString(1) + ", " + rs.getString(2));
    }
}
```
ODBC：
```cpp
SQLHSTMT stmt;

// Allocate a statement handle
SQLAllocHandle(SQL_HANDLE_STMT, dbc, &stmt);

// Get data using an SQL join sample.
SQLCHAR query[] = "SELECT p.name, c.name "
  "FROM Person p, City c "
  "WHERE p.city_id = c.id";

SQLSMALLINT queryLen = static_cast<SQLSMALLINT>(sizeof(query));

SQLRETURN ret = SQLExecDirect(stmt, query, queryLen);
```
Java API：
```java
// Connecting to the cluster.
Ignite ignite = Ignition.start();

// Getting a reference to an underlying cache created for City table above.
IgniteCache<Long, City> cityCache = ignite.cache("SQL_PUBLIC_CITY");

// Querying data from the cluster using a distributed JOIN.
SqlFieldsQuery query = new SqlFieldsQuery("SELECT p.name, c.name " +
    " FROM Person p, City c WHERE p.city_id = c.id");

FieldsQueryCursor<List<?>> cursor = cityCache.query(query);

Iterator<List<?>> iterator = cursor.iterator();


while (iterator.hasNext()) {
    List<?> row = iterator.next();

    System.out.println(row.get(0) + ", " + row.get(1));
}
```
这会产生如下的输出：
```
Mary Major, Forest Hill
Jane Roe, Denver
Richard Miles, Denver
John Doe, St. Petersburg
```
### 1.3.5.第一个计算应用
作为第一个计算应用，它会计算一句话中非空白字符的字符数量。作为一个示例，首先将一句话分割为多个单词，然后通过计算作业来计算每一个独立单词中的字符数量。最后，我们将从每个作业获得的结果简单相加来获得整个的数量。

Java8：
```java
try (Ignite ignite = Ignition.start("examples/config/example-ignite.xml")) {
  Collection<IgniteCallable<Integer>> calls = new ArrayList<>();

  // Iterate through all the words in the sentence and create Callable jobs.
  for (final String word : "Count characters using callable".split(" "))
    calls.add(word::length);

  // Execute collection of Callables on the grid.
  Collection<Integer> res = ignite.compute().call(calls);

  // Add up all the results.
  int sum = res.stream().mapToInt(Integer::intValue).sum();
 
	System.out.println("Total number of characters is '" + sum + "'.");
}
```
Java7:
```java
try (Ignite ignite = Ignition.start("examples/config/example-ignite.xml")) {
    Collection<IgniteCallable<Integer>> calls = new ArrayList<>();
 
    // Iterate through all the words in the sentence and create Callable jobs.
    for (final String word : "Count characters using callable".split(" ")) {
        calls.add(new IgniteCallable<Integer>() {
            @Override public Integer call() throws Exception {
                return word.length();
            }
        });
    }
 
    // Execute collection of Callables on the grid.
    Collection<Integer> res = ignite.compute().call(calls);
 
    int sum = 0;
 
    // Add up individual word lengths received from remote nodes.
    for (int len : res)
        sum += len;
 
    System.out.println(">>> Total number of characters in the phrase is '" + sum + "'.");
}
```

::: tip 零部署
注意，由于Ignite的`零部署`特性，当从IDE运行上面的程序时，远程节点没有经过显式地部署，就获得了计算作业。
:::

另一个例子，创建一个应用，它会读取第一个SQL应用中保存的数据，然后在这些对象上进行一些额外的处理。

下面会创建一个天气警报应用，假定丹佛有一个天气警报，然后需要提醒丹佛的居民为恶劣天气做好准备。

下面是代码片段：
```java
Ignite ignite = Ignition.start();

long cityId = 2; // Id for Denver

// Sending the logic to a cluster node that stores Denver and its residents.
ignite.compute().affinityRun("SQL_PUBLIC_CITY", cityId, new IgniteRunnable() {
  
  @IgniteInstanceResource
  Ignite ignite;
  
  @Override
  public void run() {
    // Getting an access to Persons cache.
    IgniteCache<BinaryObject, BinaryObject> people = ignite.cache(
        "Person").withKeepBinary();
 
    ScanQuery<BinaryObject, BinaryObject> query = 
        new ScanQuery <BinaryObject, BinaryObject>();
 
    try (QueryCursor<Cache.Entry<BinaryObject, BinaryObject>> cursor =
           people.query(query)) {
      
      // Iteration over the local cluster node data using the scan query.
      for (Cache.Entry<BinaryObject, BinaryObject> entry : cursor) {
        BinaryObject personKey = entry.getKey();
 
        // Picking Denver residents only only.
        if (personKey.<Long>field("CITY_ID") == cityId) {
            person = entry.getValue();
 
            // Sending the warning message to the person.
        }
      }
    }
  }
}
```
在上例中使用了`affinityRun()`方法，并且指定了`SQL_PUBLIC_CITY`缓存，`cityId`以及一个新创建的`IgniteRunnable()`，这样确保了计算被发送到丹佛及其居民所在的节点，使得可以直接在数据所在的地方执行业务逻辑，避免了昂贵的序列化可网络开销。
### 1.3.6.第一个数据网格应用
我们再来一个小例子，它从/往分布式缓存中获取/添加数据，并且执行基本的事务。

因为在应用中使用了缓存，要确保他是经过配置的，我们可以用Ignite自带的示例配置，他已经做了一些缓存的配置。
```bash
$ bin/ignite.sh examples/config/example-cache.xml
```
Put和Get：
```java
try (Ignite ignite = Ignition.start("examples/config/example-ignite.xml")) {
    IgniteCache<Integer, String> cache = ignite.getOrCreateCache("myCacheName");
 
    // Store keys in cache (values will end up on different cache nodes).
    for (int i = 0; i < 10; i++)
        cache.put(i, Integer.toString(i));
 
    for (int i = 0; i < 10; i++)
        System.out.println("Got [key=" + i + ", val=" + cache.get(i) + ']');
}
```
原子化操作：
```java
// Put-if-absent which returns previous value.
Integer oldVal = cache.getAndPutIfAbsent("Hello", 11);
  
// Put-if-absent which returns boolean success flag.
boolean success = cache.putIfAbsent("World", 22);
  
// Replace-if-exists operation (opposite of getAndPutIfAbsent), returns previous value.
oldVal = cache.getAndReplace("Hello", 11);
 
// Replace-if-exists operation (opposite of putIfAbsent), returns boolean success flag.
success = cache.replace("World", 22);
  
// Replace-if-matches operation.
success = cache.replace("World", 2, 22);
  
// Remove-if-matches operation.
success = cache.remove("Hello", 1);
```
事务：
```java
try (Transaction tx = ignite.transactions().txStart()) {
    Integer hello = cache.get("Hello");
  
    if (hello == 1)
        cache.put("Hello", 11);
  
    cache.put("World", 22);
  
    tx.commit();
}
```
分布式锁：
```java
// Lock cache key "Hello".
Lock lock = cache.lock("Hello");
 
lock.lock();
 
try {
    cache.put("Hello", 11);
    cache.put("World", 22);
}
finally {
    lock.unlock();
}
```
### 1.3.7.第一个服务网格应用
Ignite的服务网格对于在集群中部署微服务非常有用，Ignite会处理和部署的服务有关的任务的生命周期，并且提供了在应用中调用服务的简单方式。

作为一个示例，下面会开发一个服务，它会返回一个特定城市当前的天气预报。首先，它会创建一个只有一个方法的服务接口，这个接口扩展自`org.apache.ignite.services.Service`。
```java
import org.apache.ignite.services.Service;

public interface WeatherService extends Service {
    /**
     * Get a current temperature for a specific city in the world.
     *
     * @param countryCode Country code (ISO 3166 country codes).
     * @param cityName City name.
     * @return Current temperature in the city in JSON format.
     * @throws Exception if an exception happened.
     */
    String getCurrentTemperature(String countryCode, String cityName)
        throws Exception;
}
```
服务的实现会接入天气频道然后获取天气数据，代码如下：
```java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import org.apache.ignite.services.ServiceContext;


public class WeatherServiceImpl implements WeatherService {
    /** Weather service URL. */
    private static final String WEATHER_URL = "http://samples.openweathermap.org/data/2.5/weather?";

    /** Sample app ID. */
    private static final String appId = "ca7345b4a1ef8c037f7749c09fcbf808";

    /** {@inheritDoc}. */
    @Override public void init(ServiceContext ctx) throws Exception {
        System.out.println("Weather Service is initialized!");
    }

    /** {@inheritDoc}. */
    @Override public void execute(ServiceContext ctx) throws Exception {
        System.out.println("Weather Service is started!");
    }

    /** {@inheritDoc}. */
    @Override public void cancel(ServiceContext ctx) {
        System.out.println("Weather Service is stopped!");
    }

    /** {@inheritDoc}. */
    @Override public String getCurrentTemperature(String cityName,
        String countryCode) throws Exception {
        
        System.out.println(">>> Requested weather forecast [city=" 
            + cityName + ", countryCode=" + countryCode + "]");

        String connStr = WEATHER_URL + "q=" + cityName + ","
            + countryCode + "&appid=" + appId;

        URL url = new URL(connStr);

        HttpURLConnection conn = null;

        try {
            // Connecting to the weather service.
            conn = (HttpURLConnection) url.openConnection();

            conn.setRequestMethod("GET");

            conn.connect();

            // Read data from the weather server.
            try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(conn.getInputStream()))) {

                String line;
                StringBuilder builder = new StringBuilder();

                while ((line = reader.readLine()) != null)
                    builder.append(line);

                return builder.toString();
            }
        } finally {
            if (conn != null)
                conn.disconnect();
        }
    }
}
```
最后，服务需要在集群中进行部署，然后就可以在应用端进行调用，为了简化，服务在同一个应用中进行部署和调用，如下：
```java
import org.apache.ignite.Ignite;
import org.apache.ignite.Ignition;

public class ServiceGridExample {

    public static void main(String[] args) throws Exception {
        try (Ignite ignite = Ignition.start()) {

            // Deploying a single instance of the Weather Service 
            // in the whole cluster.
            ignite.services().deployClusterSingleton("WeatherService",
               new WeatherServiceImpl());

            // Requesting current weather for London.
            WeatherService service = ignite.services().service("WeatherService");

            String forecast = service.getCurrentTemperature("London", "UK");

            System.out.println("Weather forecast in London:" + forecast);
        }
    }
}
```
::: tip 零部署和服务网格
零部署是不支持服务网格的，如果希望将上面的服务部署在通过`ignite.sh`或者`ignite.bat`文件启动的节点上，那么就需要将服务的实现打成jar包然后放在`{apache_ignite_version}/libs`文件夹中。
:::

### 1.3.8.集群管理和监控
查看数据网格的数据、以及执行其他的管理和监控操作的最简单方式是使用`Ignite Web控制台`，还有就是使用Ignite的`Visor命令行`工具。

### 1.3.9.Docker和云镜像安装
最新的Ignite Docker镜像以及AWS和Google计算引擎的云镜像，可以通过Ignite的[下载页面](https://ignite.apache.org/download.cgi#docker)获得。
### 1.3.10.RPM|DEB包安装
Ignite可以通过官方的[RPM](https://www.apache.org/dist/ignite/rpm)和[DEB](https://www.apache.org/dist/ignite/deb)仓库获得。
### 1.3.11.通过源代码构建
如果下载了源代码，可以使用下面的命令构建二进制包：
```bash
# Unpack the source package
$ unzip -q apache-ignite-{version}-src.zip
$ cd apache-ignite-{version}-src
 
# Build In-Memory Data Fabric release (without LGPL dependencies)
$ mvn clean package -DskipTests
 
# Build In-Memory Data Fabric release (with LGPL dependencies)
$ mvn clean package -DskipTests -Prelease,lgpl
 
# Build In-Memory Hadoop Accelerator release
# (optionally specify version of hadoop to use)
$ mvn clean package -DskipTests -Dignite.edition=hadoop [-Dhadoop.version=X.X.X]
```
源码包中的DEVNOTES.txt文件，有更多的细节。
### 1.3.12.在JDK9中运行Ignite
Ignite使用了专有的SDK API，默认不再可用。为了运行Ignite，需要给JVM传递特定的参数，以使这些API可用。

如果使用嵌入式模式启动，可以给JVM添加如下的参数：
```
--add-exports=java.base/jdk.internal.misc=ALL-UNNAMED 
--add-exports=java.base/sun.nio.ch=ALL-UNNAMED 
--add-exports=java.management/com.sun.jmx.mbeanserver=ALL-UNNAMED 
--add-exports=jdk.internal.jvmstat/sun.jvmstat.monitor=ALL-UNNAMED
--add-exports=java.base/sun.reflect.generics.reflectiveObjects=ALL-UNNAMED
--illegal-access=permit
```
如果使用的是启动脚本（`ignite.sh|bat`），那么什么都不需要做，因为这些参数脚本里面已经有了。
## 1.4.Maven配置
### 1.4.1.摘要
如果项目里用Maven管理依赖，可以单独地导入各个Ignite模块。

> 注意，在下面的例子中，要将`${ignite.version}`替换为实际的版本。

### 1.4.2.常规依赖
Ignite强依赖于`ignite-core.jar`。
```xml
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-core</artifactId>
    <version>${ignite.version}</version>
</dependency>
```
然而，很多时候需要其他更多的依赖，比如，要使用Spring配置或者SQL查询等。

下面就是最常用的可选模块：

 - ignite-indexing（可选，如果需要SQL查询）
 - ignite-spring（可选，如果需要spring配置）

```xml
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-core</artifactId>
    <version>${ignite.version}</version>
</dependency>
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-spring</artifactId>
    <version>${ignite.version}</version>
</dependency>
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-indexing</artifactId>
    <version>${ignite.version}</version>
</dependency>
```

### 1.4.3.导入独立模块
可以一个个地导入Ignite模块，唯一必须的就是`ignite-core`，其他的都是可选的，所有可选模块都可以像核心模块一样导入，只是构件Id不同。

现在提供如下模块：

 - `ignite-spring`：基于Spring的配置支持
 - `ignite-indexing`：SQL查询和索引
 - `ignite-geospatial`：地理位置索引
 - `ignite-hibernate`：Hibernate集成
 - `ignite-web`：Web Session集群化
 - `ignite-schedule`：基于Cron的计划任务
 - `ignite-log4j`：Log4j日志
 - `ignite-jcl`：Apache Commons logging日志
 - `ignite-jta`：XA集成
 - `ignite-hadoop2-integration`：HDFS2.0集成
 - `ignite-rest-http`：HTTP REST请求
 - `ignite-scalar`：Ignite Scalar API
 - `ignite-slf4j`：SLF4J日志
 - `ignite-ssh`；SSH支持，远程机器上启动网格节点
 - `ignite-urideploy`：基于URI的部署
 - `ignite-aws`：AWS S3上的无缝集群发现
 - `ignite-aop`：网格支持AOP
 - `ignite-visor-console`：开源的命令行管理和监控工具

::: warning 构件版本
注意，导入若干Ignite模块时，他们的版本号应该相同，比如，如果使用`ignite-core`1.8,所有其他的模块也必须导入1.8版本。
:::

### 1.4.4.LGPL依赖
下面的Ignite模块有LGPL依赖，因此无法部署到Maven中央仓库：

 - `ignite-hibernate`
 - `ignite-geospatial`
 - `ignite-schedule`

要使用这些模块，需要手工从源代码进行构建然后加入自己的项目，比如，要将`ignite-hibernate`安装到本地库，可以在Ignite的源代码包中运行如下的命令：
```bash
mvn clean install -DskipTests -Plgpl -pl modules/hibernate -am
```

::: tip 第三方仓库
GridGain提供自己的[Maven仓库](http://www.gridgainsystems.com/nexus/content/repositories/external)，包含了Ignite的LGPL构件，比如`ignite-hibernate`。<br>
注意位于GridGain的Maven库中的构件仅仅为了方便使用，并不是官方的Ignite构件。
:::

## 1.5.Ignite生命周期
### 1.5.1.摘要
Ignite是基于JVM的，一个JVM可以运行一个或者多个逻辑Ignite节点（大多数情况下，一个JVM运行一个Ignite节点）。在整个Ignite文档中，会交替地使用术语Ignite运行时以及Ignite节点，比如说可以该主机运行5个节点，技术上通常意味着主机上启动5个JVM，每个JVM运行一个节点，Ignite也支持一个JVM运行多个节点，事实上，通常作为Ignite内部测试用。

> Ignite运行时 == JVM进程 == Ignite节点（多数情况下）

### 1.5.2.Ignition类
`Ignition`类在网络中启动各个Ignite节点，注意一台物理服务器（网络中的一台计算机）可以运行多个Ignite节点。
下面的代码是在全默认配置下在本地启动网格节点；
```java
Ignite ignite = Ignition.start();
```
或者传入一个配置文件：
```java
Ignite ignite = Ignition.start("examples/config/example-cache.xml");
```
配置文件的路径既可以是绝对路径，也可以是相对于IGNITE_HOME的相对路径，也可以是相对于类路径的META-INF文件夹。

### 1.5.3.LifecycleBean
有时可能希望在Ignite节点启动和停止的之前和之后执行特定的操作，这个可以通过实现`LifecycleBean`接口实现，然后在spring的配置文件中通过指定`IgniteConfiguration`的`lifecycleBeans`属性实现。
```xml
<bean class="org.apache.ignite.IgniteConfiguration">
    ...
    <property name="lifecycleBeans">
        <list>
            <bean class="com.mycompany.MyLifecycleBean"/>
        </list>
    </property>
    ...
</bean>
```
`LifecycleBean`也可以像下面这样通过编程的方式实现：
```java
// Create new configuration.
IgniteConfiguration cfg = new IgniteConfiguration();
 
// Provide lifecycle bean to configuration.
cfg.setLifecycleBeans(new MyLifecycleBean());
 
// Start Ignite node with given configuration.
Ignite ignite = Ignition.start(cfg)
```
一个`LifecycleBean`的实现可能如下所示：
```java
public class MyLifecycleBean implements LifecycleBean {
    @Override public void onLifecycleEvent(LifecycleEventType evt) {
        if (evt == LifecycleEventType.BEFORE_NODE_START) {
            // Do something.
            ...
        }
    }
}
```
也可以将Ignite实例以及其他有用的资源注入`LifecycleBean`实现，查看`1.8.资源注入`章节可以了解更多的信息。

### 1.5.4.生命周期事件类型
当前支持如下生命周期事件类型：

 - `BEFORE_NODE_START`：Ignite节点的启动程序初始化之前调用
 - `AFTER_NODE_START`：Ignite节点启动之后调用
 - `BEFORE_NODE_STOP`：Ignite节点的停止程序初始化之前调用
 - `AFTER_NODE_STOP`：Ignite节点停止之后调用

## 1.6.异步支持
### 1.6.1.摘要
Ignite的多数API即可以支持同步模式，也可以支持异步模式，异步方法后面追加了`Async`后缀。
```java
// Synchronous get
V get(K key);

// Asynchronous get
IgniteFuture<V> getAsync(K key);
```
异步操作返回的是一个`IgniteFuture`或其子类的实例，通过如下方式可以获得异步操作的结果，或者调用阻塞的`IgniteFuture.get()`方法，或者通过`IgniteFuture.listen()`方法或者`IgniteFuture.chain()`方法注册一个闭包，然后等待当操作完成后调用闭包。
### 1.6.2.支持的接口
下面列出的接口可以用于同步或者异步模式：

 - `IgniteCompute`
 - `IgniteCache`
 - `Transaction`
 - `IgniteServices`
 - `IgniteMessaging`
 - `IgniteEvents`

### 1.6.3.监听器和Future链
要在非阻塞模式下等待异步操作的结果（`IgniteFuture.get()`），可以使用`IgniteFuture.listen()`方法或者`IgniteFuture.chain()`方法注册一个闭包，当操作完成后，闭包会被调用，比如：
```java
IgniteCompute compute = ignite.compute();

// Execute a closure asynchronously.
IgniteFuture<String> fut = compute.callAsync(() -> {
    return "Hello World";
});

// Listen for completion and print out the result.
fut.listen(f -> System.out.println("Job result: " + f.get()));
```
>**闭包执行和线程池**
异步操作完成后，如果通过`IgniteFuture.listen()`或者`IgniteFuture.chain()`方法传递了闭包，那么闭包就会被调用线程以同步的方式执行，否则，闭包就会随着操作的完成异步地执行。
根据操作的类型，闭包可能被系统线程池中的线程调用（异步缓存操作），或者被公共线程池中的线程调用（异步计算操作）。因此需要避免在闭包实现中调用同步的缓存和计算操作，否则可能导致死锁。
要实现Ignite计算操作异步嵌套执行，可以使用自定义线程池，相关内容可以查看`1.9.线程池`中的相关内容。

## 1.7.客户端和服务端
### 1.7.1.摘要
Ignite有一个可选的概念，就是**客户端节点**和**服务端节点**，服务端节点参与缓存、计算执行、流式处理等等，而原生的客户端节点提供了远程连接服务端的能力。Ignite原生客户端可以使用完整的`Ignite` API集合，包括近缓存、事务、计算、流、服务等等。
所有的Ignite节点默认都是以`服务端`模式启动的，`客户端`模式需要显式地启用。

### 1.7.2.配置客户端和服务端
可以通过`IgniteConfiguration.setClientMode(...)`属性配置一个节点，或者为客户端，或者为服务端。

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    ...   
    <!-- Enable client mode. -->
    <property name="clientMode" value="true"/>
    ...
</bean>
```
Java:
```java
IgniteConfiguration cfg = new IgniteConfiguration();

// Enable client mode.
cfg.setClientMode(true);

// Start Ignite in client mode.
Ignite ignite = Ignition.start(cfg);
```
方便起见，也可以通过` Ignition`类来打开或者关闭客户端模式作为替代，这样可以使客户端和服务端共用一套配置。
```java
Ignition.setClientMode(true);

// Start Ignite in client mode.
Ignite ignite = Ignition.start();
```
### 1.7.3.创建分布式缓存
当在Ignite中创建缓存时，不管是通过XML方式，还是通过` Ignite.createCache(...)`或者`Ignite.getOrCreateCache(...)`方法，Ignite会自动地在所有的服务端节点中部署分布式缓存。

> 当分布式缓存创建之后，他会自动地部署在所有的已有或者未来的**服务端**节点上。

```java
// Enable client mode locally.
Ignition.setClientMode(true);

// Start Ignite in client mode.
Ignite ignite = Ignition.start();

CacheConfiguration cfg = new CacheConfiguration("myCache");

// Set required cache configuration properties.
...

// Create cache on all the existing and future server nodes.
// Note that since the local node is a client, it will not 
// be caching any data.
IgniteCache<?, ?> cache = ignite.getOrCreateCache(cfg);
```

### 1.7.4.客户端或者服务端计算
`IgniteCompute`默认会在所有的服务端节点上执行作业，然而，也可以通过创建相应的集群组来选择是只在服务端节点还是只在客户端节点上执行作业。

服务端节点执行：
```java
IgniteCompute compute = ignite.compute();

// Execute computation on the server nodes (default behavior).
compute.broadcast(() -> System.out.println("Hello Server"));
```
客户端节点执行：
```java
ClusterGroup clientGroup = ignite.cluster().forClients();

IgniteCompute clientCompute = ignite.compute(clientGroup);

// Execute computation on the client nodes.
clientCompute.broadcast(() -> System.out.println("Hello Client"));
```
### 1.7.5.管理慢客户端
很多部署环境中，客户端节点是在主集群外启动的，机器和网络都比较差，在这些场景中服务端可能产生负载（比如持续查询通知）而客户端没有能力处理，导致服务端的输出消息队列不断增长，这可能最终导致服务端出现内存溢出的情况，或者如果打开背压控制时导致整个集群阻塞。

要管理这样的状况，可以配置允许向客户端节点输出消息的最大值，如果输出队列的大小超过配置的值，该客户端节点会从集群断开以防止拖慢整个集群。

下面的例子显示了如何通过XML或者编程的方式配置慢客户端队列限值：

Java：
```java
IgniteConfiguration cfg = new IgniteConfiguration();

// Configure Ignite here.

TcpCommunicationSpi commSpi = new TcpCommunicationSpi();
commSpi.setSlowClientQueueLimit(1000);

cfg.setCommunicationSpi(commSpi);
```
XML：
```xml
<bean id="grid.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
  <!-- Configure Ignite here. -->
  
  <property name="communicationSpi">
    <bean class="org.apache.ignite.spi.communication.tcp.TcpCommunicationSpi">
      <property name="slowClientQueueLimit" value="1000"/>
    </bean>
  </property>
</bean>
```
### 1.7.6.客户端重连
有几种情况客户端会从集群中断开：

 - 由于网络原因，客户端无法和服务端重建连接；
 - 与服务端的连接有时被断开，客户端也可以重建与服务端的连接，但是由于服务端无法获得客户端心跳，服务端仍然断开客户端节点；
 - 慢客户端会被服务端节点踢出；

当一个客户端发现它与一个集群断开时，会为自己赋予一个新的节点`id`然后试图与该服务端重新连接。`注意`：这会产生一个副作用，就是当客户端重建连接时本地`ClusterNode`的`id`属性会发生变化，这意味着，如果业务逻辑依赖于这个`id`，就会受到影响。
当客户端处于一个断开状态并且试图重建与集群的连接过程中时，Ignite API会抛出一个特定的异常：`IgniteClientDisconnectedException`，这个异常提供了一个`future`，当客户端重连成功后他会完成（`IgniteCache`API会抛出`CacheException`，他有一个`IgniteClientDisconnectedException`作为他的cause）。这个`future`也可以通过`IgniteCluster.clientReconnectFuture()`方法获得。

此外，客户端重连也有一些特定的事件（这些事件是本地化的，也就是说他们只会在客户端节点触发）：

 - EventType.EVT_CLIENT_NODE_DISCONNECTED
 - EventType.EVT_CLIENT_NODE_RECONNECTED

下面的例子显示`IgniteClientDisconnectedException`如何使用：

计算：
```java
IgniteCompute compute = ignite.compute();

while (true) {
    try {
        compute.run(job);
    }
    catch (IgniteClientDisconnectedException e) {
        e.reconnectFuture().get(); // Wait for reconnection.

        // Can proceed and use the same IgniteCompute instance.
    }
}
```
缓存：
```java
IgniteCache cache = ignite.getOrCreateCache(new CacheConfiguration<>());

while (true) {
  try {
    cache.put(key, val);
  }
  catch (CacheException e) {
    if (e.getCause() instanceof IgniteClientDisconnectedException) {
      IgniteClientDisconnectedException cause =
        (IgniteClientDisconnectedException)e.getCause();

      cause.reconnectFuture().get(); // Wait for reconnection.

      // Can proceed and use the same IgniteCache instance.
    }
  }
}
```
客户端自动重连可以通过`TcpDiscoverySpi`的`clientReconnectDisabled`属性禁用，如果重连被禁用那么当发现与集群断开时客户端节点就会停止。

下面的例子显示了如何禁用客户端重连：
```java
IgniteConfiguration cfg = new IgniteConfiguration();

// Configure Ignite here.

TcpDiscoverySpi discoverySpi = new TcpDiscoverySpi();

discoverySpi.setClientReconnectDisabled(true);

cfg.setDiscoverySpi(discoverySpi);
```
### 1.7.7.客户端节点强制服务端模式
客户端节点需要网络中有在线的服务端节点才能启动。

然而，如果在没有运行中的服务端节点时还要启动一个客户端节点，可以通过如下方式在客户端节点强制服务端模式发现。

如果不管服务端节点是否在线都要启动客户端节点非常必要，可以以如下的方式在客户端强制服务端模式发现：
```java
IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setClientMode(true);

// Configure Ignite here.

TcpDiscoverySpi discoverySpi = new TcpDiscoverySpi();

discoverySpi.setForceServerMode(true);

cfg.setDiscoverySpi(discoverySpi);
```
这种情况下，如果网络中的所有节点都是服务端节点时发现就会发生。

::: warning 注意
这种情况下为了发现能正常工作，发现SPI在所有节点上使用的所有地址应该是可以相互访问的。
:::

## 1.8.资源注入
### 1.8.1.摘要
Ignite中，预定义的资源都是可以进行依赖注入的，同时支持基于属性和基于方法的注入。任何加注正确注解的资源都会在初始化之前注入相对应的任务、作业、闭包或者SPI。
### 1.8.2.基于属性和基于方法
可以通过在一个属性或者方法上加注注解来注入资源。当加注在属性上时，Ignite只是在注入阶段简单地设置属性的值（不会理会该属性的访问修饰符）。如果在一个方法上加注了资源注解，他会访问一个与注入资源相对应的输入参数的类型，如果匹配，那么在注入阶段，就会将适当的资源作为输入参数，然后调用该方法。

基于属性：
```java
Ignite ignite = Ignition.ignite();

Collection<String> res = ignite.compute().broadcast(new IgniteCallable<String>() {
  // Inject Ignite instance.  
  @IgniteInstanceResource
  private Ignite ignite;

  @Override
  public String call() throws Exception { 
    IgniteCache<Object, Object> cache = ignite.getOrCreateCache(CACHE_NAME);

    // Do some stuff with cache.
     ...
  }
});
```
基于方法：
```java
public class MyClusterJob implements ComputeJob {
    ...
    private Ignite ignite;
    ...
    // Inject Ignite instance.  
    @IgniteInstanceResource
    public void setIgnite(Ignite ignite) {
        this.ignite = ignite;
    }
    ...
}
```
### 1.8.3.预定义的资源
有很多的预定义资源可供注入：

|资源|描述|
|---|---|
|`CacheNameResource`|由`CacheConfiguration.getName()`提供，注入网格缓存名|
|`CacheStoreSessionResource`|注入当前的`CacheStoreSession`实例|
|`IgniteInstanceResource`|注入当前的Ignite实例|
|`JobContextResource`|注入`ComputeJobContext`的实例。作业的上下文持有关于一个作业执行的有用的信息。比如，可以获得包含与作业并置的条目的缓存的名字。|
|`LoadBalancerResource`|注入`ComputeLoadBalancer`的实例，注入后可以用于任务的负载平衡。|
|`LoggerResource`|注入`IgniteLogger`的实例，他可以用于向本地节点的日志写消息。|
|`ServiceResource`|通过指定服务名注入Ignite的服务。|
|`SpringApplicationContextResource`|注入Spring的`ApplicationContext`资源。|
|`SpringResource`|从Spring的`ApplicationContext`注入资源，当希望访问在Spring的ApplicationContext XML配置中指定的一个Bean时，可以用它。|
|`TaskContinuousMapperResource`|注入一个`ComputeTaskContinuousMapper`的实例，持续映射可以在任何时点从任务中发布作业，即使过了*map*的初始化阶段。|
|`TaskSessionResource`|注入`ComputeTaskSession`资源的实例，它为一个特定的任务执行定义了一个分布式的会话。|

## 1.9.线程池
### 1.9.1.摘要
Ignite创建并且维护着一组线程池，根据使用的API不同分别用于不同的目的。本章节中会列出一些众所周知的内部线程池，然后会展示如何自定义线程池。在`IgniteConfiguration`的javadoc中，可以看到Ignite中可用的完整线程池列表。
### 1.9.2.系统线程池
系统线程池处理所有与缓存相关的操作，除了SQL以及其他的查询类型，它们会使用查询线程池，同时这个线程池也负责处理Ignite计算任务的取消操作。

默认的线程池数量为`max(8,CPU总核数)`，使用`IgniteConfiguration.setSystemThreadPoolSize(...)`可以进行调整。
### 1.9.3.公共线程池
公共线程池负责Ignite的计算网格，所有的计算任务都由这个线程池接收然后处理。

默认的线程池数量为`max(8,CPU总核数)`，使用`IgniteConfiguration.setPublicThreadPoolSize(...)`可以进行调整。
### 1.9.4.查询线程池
查询线程池处理集群内所有的SQL、扫描和SPI查询。

默认的线程池数量为`max(8,CPU总核数)`，使用`IgniteConfiguration.setQueryThreadPoolSize(...)`可以进行调整。
### 1.9.5.服务线程池
Ignite的服务网格调用使用的是服务线程池，Ignite的服务和计算网格组件都有专用的线程池，可以避免当一个服务实现希望调用一个计算（或者反之）时的线程争用和死锁。

默认的线程池数量为`max(8,CPU总核数)`，使用`IgniteConfiguration.setServiceThreadPoolSize(...)`可以进行调整。
### 1.9.6.平行线程池
平行线程池通过将操作展开为多个平行的执行，有助于显著加速基本的缓存操作以及事务，因为可以避免相互竞争。

默认的线程池数量为`max(8,CPU总核数)`，使用`IgniteConfiguration.setStripedPoolSize(...)`可以进行调整。
### 1.9.7.数据流处理器线程池
数据流处理器线程池用于处理来自`IgniteDataStreamer`的所有消息和请求，各种内置的使用`IgniteDataStreamer`的流适配器也可以。

默认的线程池数量为`max(8,CPU总核数)`，使用`IgniteConfiguration.setDataStreamerThreadPoolSize(...)`可以进行调整。
### 1.9.8.自定义线程池
对于Ignite的计算任务，也可以配置自定义的线程池，当希望同步地从一个计算任务调用另一个的时候很有用，因为可以避免死锁。要保证这一点，需要确保执行嵌套任务的线程池不同于上级任务的线程池。

自定义线程池需要在`IgniteConfiguration`中进行定义，并且需要有一个唯一的名字：

Java:
```java
IgniteConfiguration cfg = ...;

cfg.setExecutorConfiguration(new ExecutorConfiguration("myPool").setSize(16));
```
XML:
```xml
<bean id="grid.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
  ...
  <property name="executorConfiguration">
    <list>
      <bean class="org.apache.ignite.configuration.ExecutorConfiguration">
        <property name="name" value="myPool"/>
        <property name="size" value="16"/>
      </bean>
    </list>
  </property>
  ...
</bean>
```
这样，假定下面的计算任务由上面定义的`myPool`线程池中的线程执行：
```java
public class InnerRunnable implements IgniteRunnable {    
    @Override public void run() {
        System.out.println("Hello from inner runnable!");
    }
}
```
怎么做呢，需要使用`IgniteCompute.withExecutor()`，他会被上级任务的实现马上执行，像下面这样：
```java
public class OuterRunnable implements IgniteRunnable {    
    @IgniteInstanceResource
    private Ignite ignite;
    
    @Override public void run() {
        // Synchronously execute InnerRunnable in custom executor.
        ignite.compute().withExecutor("myPool").run(new InnerRunnable());
    }
}
```
上级任务的执行可通过如下方式触发，对于这个场景，它会由公共线程池执行：
```java
ignite.compute().run(new OuterRunnable());
```
>**未定义线程池**
如果应用请求在自定义线程池执行计算任务，而该线程池在Ignite节点中未定义，那么一个特定的警告消息就会在节点的日志中输出，然后任务就会被公共线程池接管执行。
## 1.10.二进制编组器
### 1.10.1.基本概念
从1.6版本开始，Ignite引入了一个在缓存中存储数据的新概念，名为`二进制对象`，这个新的序列化格式提供了若干个优势：

 - 他可以从一个对象的序列化形式中读取一个任意的属性，而不需要将该对象完整地反序列化，这个功能完全删除了将缓存的键和值类部署到服务端节点类路径的必要性；
 - 他可以为同一个类型的对象增加和删除属性，给定的服务端节点不需要有模型类的定义，这个功能允许动态改变对象的结构，甚至允许多个客户端持有类定义的不同版本，他们是共存的；
 - 他可以根据类型名构造一个新的对象，根本不需要类定义，因此允许动态类型创建；

二进制对象只可以用于使用默认的二进制编组器时（即没有在配置中显式地设置其他的编组器）

::: tip 限制
`BinaryObject`格式实现也带来了若干个限制：
 1. 在内部Ignite不会写属性以及类型的名字，但是使用一个小写的名字哈希来标示一个属性或者类型，这意味着属性或者类型不能有同样的名字哈希。即使序列化不会在哈希冲突的情况下工作，但Ignite在配置级别提供了一种方法来解决此冲突；
 2. 同样的原因，`BinaryObject`格式在类的不同层次上也不允许有同样的属性名；
 3. 如果类实现了`Externalizable`接口，Ignite会使用`OptimizedMarshaller`，`OptimizedMarshaller`会使用`writeExternal()`和`readExternal()`来进行类对象的序列化和反序列化，这需要将实现`Externalizable`的类加入服务端节点的类路径中。
:::

`IgniteBinary`入口，可以从Ignite的实例获得，包含了操作二进制对象的所有必要的方法。
::: tip 自动化哈希值计算和Equals实现
如果一个对象可以被序列化到二进制形式，那么Ignite会在序列化期间计算它的哈希值并且将其写入最终的二进制数组。另外，Ignite还为二进制对象的比较需求提供了equals方法的自定义实现。这意味着，不需要为在Ignite中使用的自定义键和值覆写`GetHashCode`和`Equals`方法，除非他们无法序列化成二进制形式。

比如，`Externalizable`类型的对象无法被序列化成二进制形式，这时就需要自行实现`hashCode`和`equals`方法，具体可以看上面的限制章节。
:::

### 1.10.2.配置二进制对象
在绝大多数情况下不需要额外地配置二进制对象。
但是，如果需要覆写默认的类型和属性ID计算或者加入`BinarySerializer`，可以为`IgniteConfiguration`定义一个`BinaryConfiguration`对象，这个对象除了为每个类型指定映射以及序列化器之外还可以指定一个全局的Name映射、一个全局ID映射以及一个全局的二进制序列化器。对于每个类型的配置，通配符也是支持的，这时提供的配置会适用于匹配类型名称模板的所有类型。
配置二进制类型：
```xml
<bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
    
  <property name="binaryConfiguration">
    <bean class="org.apache.ignite.configuration.BinaryConfiguration">
      
      <property name="nameMapper" ref="globalNameMapper"/>
      <property name="idMapper" ref="globalIdMapper"/>

      <property name="typeConfigurations">
        <list>
          <bean class="org.apache.ignite.binary.BinaryTypeConfiguration">
            <property name="typeName" value="org.apache.ignite.examples.*"/>
            <property name="serializer" ref="exampleSerializer"/>
          </bean>
        </list>
      </property>
    </bean>
  </property>
...
```
### 1.10.3.BinaryObject缓存API
Ignite默认使用反序列化值作为最常见的使用场景，要启用`BinaryObject`处理，需要获得一个`IgniteCache`的实例然后使用`withKeepBinary()`方法。启用之后，如果可能，这个标志会确保从缓存返回的对象都是`BinaryObject`格式的。将值传递给`EntryProcessor`和`CacheInterceptor`也是同样的处理。

::: tip 平台类型
注意当通过`withKeepBinary()`方法启用`BinaryObject`处理时并不是所有的对象都会表示为`BinaryObject`，会有一系列的`平台`类型，包括基本类型，String，UUID，Date，Timestamp，BigDecimal，Collections，Maps和Arrays，他们不会被表示为`BinaryObject`。

注意在下面的示例中，键类型为`Integer`，他是不会被修改，因为他是`平台`类型。
:::

获取BinaryObject：
```java
// Create a regular Person object and put it to the cache.
Person person = buildPerson(personId);
ignite.cache("myCache").put(personId, person);

// Get an instance of binary-enabled cache.
IgniteCache<Integer, BinaryObject> binaryCache = ignite.cache("myCache").withKeepBinary();

// Get the above person object in the BinaryObject format.
BinaryObject binaryPerson = binaryCache.get(personId);
```
### 1.10.4.使用BinaryObjectBuilder修改二进制对象
`BinaryObject`实例是不能修改的，要更新属性或者创建新的`BinaryObject`，必须使用`BinaryObjectBuilder`的实例。

`BinaryObjectBuilder`的实例可以通过`IgniteBinary`入口获得。他可以使用类型名创建，这时返回的对象不包含任何属性，或者他也可以通过一个已有的`BinaryObject`创建，这时返回的对象会包含从给定的`BinaryObject`中拷贝的所有属性。

获取`BinaryObjectBuilder`实例的另外一个方式是调用已有`BinaryObject`实例的`toBuilder()`方法，这种方式创建的对象也会从`BinaryObject`中拷贝所有的数据。

::: tip 限制

 - 无法修改已有字段的类型；
 - 无法变更枚举值的顺序，也无法在枚举值列表的开始或者中部添加新的常量，但是可以在列表的末尾添加新的常量。

:::

下面是一个使用`BinaryObject`API来处理服务端节点的数据而不需要将程序部署到服务端以及不需要实际的数据反序列化的示例：

EntryProcessor内的BinaryObject：
```java
// The EntryProcessor is to be executed for this key.
int key = 101;

cache.<Integer, BinaryObject>withKeepBinary().invoke(
  key, new CacheEntryProcessor<Integer, BinaryObject, Object>() {
  	public Object process(MutableEntry<Integer, BinaryObject> entry,
                          Object... objects) throws EntryProcessorException {
		    // Create builder from the old value.
        BinaryObjectBuilder bldr = entry.getValue().toBuilder();

        //Update the field in the builder.
        bldr.setField("name", "Ignite");

        // Set new value to the entry.
        entry.setValue(bldr.build());

        return null;
     }
  });
```
### 1.10.5.BinaryObject类型元数据
像上面描述的那样，二进制对象结构可以在运行时进行修改，因此获取一个存储在缓存中的一个特定类型的信息也可能是有用的，比如属性名，属性类型，属性类型名，关系属性名，Ignite通过`BinaryType`接口满足这样的需求。

这个接口还引入了一个属性getter的更快的版本，叫做`BinaryField`。这个概念类似于Java的反射，可以缓存`BinaryField`实例中读取的属性的特定信息，他有助于从一个很大的二进制对象集合中读取同一个属性。
```java
Collection<BinaryObject> persons = getPersons();

BinaryField salary = null;

double total = 0;
int cnt = 0;

for (BinaryObject person : persons) {
    if (salary == null)
        salary = person.type().field("salary");

    total += salary.value(person);
    cnt++;
}

double avg = total / cnt;
```
### 1.10.6.BinaryObject和CacheStore
在缓存API上调用`withKeepBinary()`方法对于将用户对象传入`CacheStore`的方式不起作用，这么做是故意的，因为大多数情况下单个`CacheStore`实现要么使用反序列化类，要么使用`BinaryObject`表示。要控制对象传入Store的方式，需要使用`CacheConfiguration`的`storeKeepBinary`标志，当该标志设置为`false`时，会将反序列化值传入Store，否则会使用`BinaryObject`表示。

下面是一个使用`BinaryObject`的Store的伪代码实现的示例：
```java
public class CacheExampleBinaryStore extends CacheStoreAdapter<Integer, BinaryObject> {
    @IgniteInstanceResource
    private Ignite ignite;

    /** {@inheritDoc} */
    @Override public BinaryObject load(Integer key) {
        IgniteBinary binary = ignite.binary();

        List<?> rs = loadRow(key);

        BinaryObjectBuilder bldr = binary.builder("Person");

        for (int i = 0; i < rs.size(); i++)
            bldr.setField(name(i), rs.get(i));

        return bldr.build();
    }

    /** {@inheritDoc} */
    @Override public void write(Cache.Entry<? extends Integer, ? extends BinaryObject> entry) {
        BinaryObject obj = entry.getValue();

        BinaryType type = obj.type();

        Collection<String> fields = type.fieldNames();
        
        List<Object> row = new ArrayList<>(fields.size());

        for (String fieldName : fields)
            row.add(obj.field(fieldName));
        
        saveRow(entry.getKey(), row);
    }
}
```
### 1.10.7.二进制Name映射器和二进制ID映射器
在内部，Ignite不会写属性或者类型名字的完整字符串，而是因为性能的原因，为类型或者属性名写一个整型哈希值作为替代。经过测试，在类型相同时，属性名或者类型名的哈希值冲突实际上是不存在的，为了获得性能，使用哈希值是安全的。对于当不同的类型或者属性确实冲突的场合，`BinaryNameMapper`和`BinaryIdMapper`可以为该类型或者属性名覆写自动生成的哈希值。

`BinaryNameMapper` - 映射类型/类和属性名到不同的名字；

`BinaryIdMapper` - 映射从`BinaryNameMapper`来的类型和属性名到ID，以便于Ignite内部使用。

Ignite直接支持如下的映射器实现：

 - `BinaryBasicNameMapper`：`BinaryNameMapper`的一个基本实现，对于一个给定的类，根据使用的`setSimpleName(boolean useSimpleName)`属性值，会返回一个完整或者简单的名字；
 - `BinaryBasicIdMapper`：`BinaryIdMapper`的一个基本实现，他有一个`setLowerCase(boolean isLowerCase)`配置属性，如果属性设置为`false`，那么会返回一个给定类型或者属性名的哈希值，如果设置为`true`，会返回一个给定类型或者属性名的小写形式的哈希值。

如果仅仅使用Java或者.NET客户端并且在`BinaryConfiguration`中没有指定映射器，那么Ignite会使用`BinaryBasicNameMapper`并且`simpleName`属性会被设置为`false`，使用`BinaryBasicIdMapper`并且`lowerCase`属性会被设置为`true`。

如果使用了C++客户端并且在`BinaryConfiguration`中没有指定映射器，那么Ignite会使用`BinaryBasicNameMapper`并且`simpleName`属性会被设置为`true`，使用`BinaryBasicIdMapper`并且`lowerCase`属性会被设置为`true`。

如果使用Java、.Net或者C++，默认是不需要任何配置的，只有当需要平台协同、名字转换复杂的情况下，才需要配置映射器。
## 1.11.日志
Ignite支持各种日志库和框架，可以直接使用[Log4j](https://logging.apache.org/log4j/2.x/)、[Log4j2](https://logging.apache.org/log4j/2.x/)、[JCL](https://commons.apache.org/proper/commons-logging/guide.html)和[SLF4J](https://www.slf4j.org/manual.html)，本文会描述如何使用它们。
### 1.11.1.Log4j
如果在启动独立集群节点时要使用Log4j模块，需要在执行`ignite.{sh|bat}`脚本前，将`optional/ignite-log4j`文件夹移动到Ignite发行版的`lib`目录下，这时这个模块目录中的内容会被添加到类路径。

如果项目中使用maven进行依赖管理，那么需要添加如下的依赖：
```xml
<dependency>
  <groupId>org.apache.ignite</groupId>
  <artifactId>ignite-log4j</artifactId>
  <version>${ignite.version}</version>
</dependency>
```
将`${ignite.version}`替换为实际使用的Ignite版本。

要使用Log4j进行日志记录，需要配置`IgniteConfiguration`的`gridLogger`属性，如下所示：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="gridLogger">
    <bean class="org.apache.ignite.logger.log4j.Log4JLogger">
      <constructor-arg type="java.lang.String" value="log4j.xml"/>
    </bean>
  </property>
  <!-- Other Ignite configurations -->
  ...
</bean>
```
Java：
```java
IgniteConfiguration cfg = new IgniteConfiguration();

IgniteLogger log = new Log4JLogger("log4j.xml");

cfg.setGridLogger(log);

// Start Ignite node.
Ignite ignite = Ignition.start(cfg);

ignite.log().info("Info Message Logged!");
```
在上面的配置中，`log4j.xml`的路径要么是绝对路径，要么是相对路径，相对路径可以相对于`META-INF`，也可以相对于`IGNITE_HOME`。
### 1.11.2.Log4j2
如果在启动独立集群节点时要使用Log4j2模块，需要在执行`ignite.{sh|bat}`脚本前，将`optional/ignite-log4j2`文件夹移动到Ignite发行版的`lib`目录下，这时这个模块目录中的内容会被添加到类路径。

如果项目中使用maven进行依赖管理，那么需要添加如下的依赖：
```xml
<dependency>
  <groupId>org.apache.ignite</groupId>
  <artifactId>ignite-log4j2</artifactId>
  <version>${ignite.version}</version>
</dependency>
```
将`${ignite.version}`替换为实际使用的Ignite版本。

要使用Log4j2进行日志记录，需要配置`IgniteConfiguration`的`gridLogger`属性，如下所示：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="gridLogger">
    <bean class="org.apache.ignite.logger.log4j2.Log4J2Logger">
      <constructor-arg type="java.lang.String" value="log4j2.xml"/>
    </bean>
  </property>
  <!-- Other Ignite configurations -->
  ...
</bean>
```
Java：
```java
IgniteConfiguration cfg = new IgniteConfiguration();

IgniteLogger log = new Log4J2Logger("log4j2.xml");

cfg.setGridLogger(log);

// Start Ignite node.
Ignite ignite = Ignition.start(cfg);

ignite.log().info("Info Message Logged!");
```
在上面的配置中，`log4j2.xml`的路径要么是绝对路径，要么是相对路径，相对路径可以相对于`META-INF`，也可以相对于`IGNITE_HOME`。
### 1.11.3.JCL
如果在启动独立集群节点时要使用JCL模块，需要在执行`ignite.{sh|bat}`脚本前，将`optional/ignite-jcl`文件夹移动到Ignite发行版的`lib`目录下，这时这个模块目录中的内容会被添加到类路径。

如果项目中使用maven进行依赖管理，那么需要添加如下的依赖：
```xml
<dependency>
  <groupId>org.apache.ignite</groupId>
  <artifactId>ignite-jcl</artifactId>
  <version>${ignite.version}</version>
</dependency>
```
将`${ignite.version}`替换为实际使用的Ignite版本。

要使用JCL进行日志记录，需要配置`IgniteConfiguration`的`gridLogger`属性，如下所示：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="gridLogger">
    <bean class="org.apache.ignite.logger.jcl.JclLogger">
      <constructor-arg type="org.apache.commons.logging.Log">
        <bean class="org.apache.commons.logging.impl.Log4JLogger">
          <constructor-arg type="java.lang.String" value="log4j.xml"/>
        </bean>
      </constructor-arg>
    </bean>
  </property>
  <!-- Other Ignite configurations -->
  ...
</bean>
```
Java：
```java
IgniteConfiguration cfg = new IgniteConfiguration();

IgniteLogger log = new JclLogger(new 
  org.apache.commons.logging.impl.Log4JLogger("log4j.xml"));

cfg.setGridLogger(log);

// Start Ignite node.
Ignite ignite = Ignition.start(cfg);

ignite.log().info("Info Message Logged!");
```
### 1.11.4.SLF4J
如果在启动独立集群节点时要使用SLF4J模块，需要在执行`ignite.{sh|bat}`脚本前，将`optional/ignite-slf4j`文件夹移动到Ignite发行版的`lib`目录下，这时这个模块目录中的内容会被添加到类路径。

如果项目中使用maven进行依赖管理，那么需要添加如下的依赖：
```xml
<dependency>
  <groupId>org.apache.ignite</groupId>
  <artifactId>ignite-slf4j</artifactId>
  <version>${ignite.version}</version>
</dependency>
```
将`${ignite.version}`替换为实际使用的Ignite版本。

要使用JCL进行日志记录，需要配置`IgniteConfiguration`的`gridLogger`属性，如下所示：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="gridLogger">
    <bean class="org.apache.ignite.logger.slf4j.Slf4jLogger"/>
  </property>
  <!-- Other Ignite configurations -->
  ...
</bean>
```
Java：
```java
IgniteConfiguration cfg = new IgniteConfiguration();

IgniteLogger log = new Slf4jLogger();

cfg.setGridLogger(log);

// Start Ignite node.
Ignite ignite = Ignition.start(cfg);

ignite.log().info("Info Message Logged!");
```
要了解更多的信息，可以看[SLF4J手册](https://www.slf4j.org/docs.html)。
### 1.11.5.默认日志
Ignite默认会使用`java.util.logging.Logger`（JUL），通过`$IGNITE_HOME/config/java.util.logging.properties`配置文件进行配置，然后将日志写入`$IGNITE_HOME/work/log`文件夹，要修改这个日志目录，需要使用`IGNITE_LOG_DIR`环境变量。

另外，Ignite启动于*quiet*模式，会阻止`INFO`和`DEBUG`日志的输出。要关闭*quiet*模式，可以使用`-DIGNITE_QUIET=false`系统属性。注意，*quiet*模式的所有信息都是输出到标准输出（STDOUT）的。

::: warning 如果使用jul-to-slf4j桥，要确保配置正确
如果使用了`jul-to-slf4j`桥，需要特别关注下Ignite中的JUL日志级别。如果在org.apache上配置了`DEBUG`级别，那么最终的日志级别会为`INFO`。这意味着在生成日志时会产生十倍的负载，然后在通过桥时被丢弃。JUL默认级别为`INFO`，在`org.apache.ignite.logger.java.JavaLogger#isDebugEnabled`中设置一个断点，会发现JUL子系统会生成`DEBUG`级别的日志。
:::

## 1.12.RPM和DEB包安装
### 1.12.1.摘要
Ignite可以通过[RPM](https://www.apache.org/dist/ignite/rpm)或者[DEB](https://www.apache.org/dist/ignite/deb)仓库进行安装。

::: warning 确认Linux发行版
Ignite的RPM/DEB包，在如下的Linux发行版中进行了验证：

 - Ubuntu 14.10及以上的版本；
 - Debian 9.3及以上的版本；
 - CentOS 7.4.1708及以上的版本

只要包可以安装，其他的发行版也是支持的。
:::
### 1.12.2.仓库的配置
配置Ignite的RPM或者DEB仓库，如下所示（如果必要，需要根据提示接受GPG密钥），其中包括了特定发行版的配置：

Debian：
```bash
# Install dirmngr (if not already installed) for apt-key ability to retrieve remote GPG keys
sudo apt update
sudo apt install dirmngr --no-install-recommends
```
RPM：
```bash
sudo bash -c 'cat <<EOF > /etc/yum.repos.d/ignite.repo
[ignite]
name=Apache Ignite
baseurl=http://apache.org/dist/ignite/rpm/
gpgcheck=1
repo_gpgcheck=1
gpgkey=http://apache.org/dist/ignite/KEYS
       http://bintray.com/user/downloadSubjectPublicKey?username=bintray
EOF'
sudo yum check-update
```
DEB：
```bash
sudo bash -c 'cat <<EOF > /etc/apt/sources.list.d/ignite.list
deb http://apache.org/dist/ignite/deb/ apache-ignite main
EOF'
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 379CE192D401AB61
sudo apt update
```
### 1.12.3.Ignite的安装
安装Ignite的最新版：

RPM：
```bash
sudo yum install apache-ignite
```
DEB：
```bash
sudo apt install apache-ignite --no-install-recommends
```
安装后的结构如下：

|文件夹|映射至|描述|
|---|---|---|
|`/usr/share/apache-ignite`||Ignite安装的根目录|
|`/usr/share/apache-ignite/bin`||二进制文件文件夹（脚本以及可执行程序）|
|`/etc/apache-ignite`|`/usr/share/apache-ignite/config`|默认配置文件|
|`/var/log/apache-ignite`|`/var/lib/apache-ignite/log`|日志目录|
|`/usr/lib/apache-ignite`|`/usr/share/apache-ignite/libs`|核心和可选库|
|`/var/lib/apache-ignite`|`/usr/share/apache-ignite/work`|Ignite的工作目录|
|`/usr/share/doc/apache-ignite`||文档|
|`/usr/share/license/apache-ignite-<version>`||协议|
|`/etc/systemd/system`||`systemd`服务配置|

### 1.12.4.将Ignite作为服务

::: warning 注意
如果运行于Windows10 WSL或者Docker，那么需要将Ignite作为一个独立的进程（而不是一个服务），具体可以看下面的章节。
:::
用一个配置文件启动一个Ignite节点，可以这样做：`sudo systemctl start apache-ignite@<config_name>`，注意这里的`<config_name>`参数是相对于`/etc/apache-ignite`文件夹的。

运行Ignite服务：
```bash
sudo systemctl start apache-ignite@default-config.xml    # start Ignite service
journalctl -fe                                           # check logs
```
如果要开启随着系统启动而节点自动重启，如下：
```bash
sudo systemctl enable apache-ignite@<config name>
```
### 1.12.5.将Ignite作为独立进程
使用下面的命令，可以将Ignite启动为一个独立的进程（先要切换到`/usr/share/apache-ignite`），如果要修改默认的配置，可以更新`/etc/apache-ignite/default-config.xml`文件。

首先，切换到`ignite`用户，如下：
```bash
sudo -u ignite /usr/bin/env bash    # switch to ignite user
```
然后切换到Ignite的bin文件夹，启动一个节点：
```bash
cd /usr/share/apache-ignite         # navigate to Ignite home folder
bin/ignite.sh                       # run Ignite with default configuration
```
### 1.12.6.在Windows10 WSL中运行Ignite
**网络配置**

在Windows 10 WSL环境下运行Ignite，需要对具有高级安全的Windows防御防火墙进行正确的配置：

 - 运行`具有高级安全的Windows防御防火墙`；
 - 选择左侧的`入站规则`菜单；
 - 选择右侧的`新建规则`菜单；
 - 选择`程序`复选框然后点击`下一步`；
 - 在`程序路径`字段中输入`%SystemRoot%\System32\wsl.exe`，然后点击`下一步`；
 - 选择`允许连接`复选框，然后点击`下一步`；
 - 选择`域`、`私有`和`公开`复选框，然后点击`下一步`；
 - 在`名字`字段中给起个名字（在`描述`字段中，也可以可选地写一段描述），然后点击`完成`。

这个配置好的规则将允许Windows 10 WSL环境中的Ignite节点暴露于局域网中。

**启动Ignite集群**

由于特殊的网络堆栈实现，如果要在一个Windows10 WSL环境中运行多个节点，需要对配置进行自定义（可以看下面的`wsl-default-config`），启动命令如下：`bin/ignite.sh config/wsl-default-config.xml -J-DNODE=<00..99>`。

wsl-default-config.xml：
```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="placeholderConfig" class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer"/>

    <bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
        <property name="discoverySpi">
            <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
                <property name="localPort" value="475${NODE}"/>
                <property name="ipFinder">
                    <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.multicast.TcpDiscoveryMulticastIpFinder">
                        <property name="addresses">
                            <list>
                                <value>127.0.0.1:47500..47599</value>
                            </list>
                        </property>
                    </bean>
                </property>
            </bean>
        </property>

        <property name="communicationSpi">
            <bean class="org.apache.ignite.spi.communication.tcp.TcpCommunicationSpi">
                <property name="localPort" value="481${NODE}"/>
            </bean>
        </property>

    </bean>
</beans>
```
首先，以`ignite`用户登录，如下：
```bash
sudo -u ignite /usr/bin/env bash
```
然后转到Ignite的主文件夹，然后在本地启动希望数量的节点（最多100）：
```bash
# Navigate to Ignite home folder
cd /usr/share/apache-ignite

# Run several local nodes
bin/ignite.sh config/wsl-default-config.xml -J-DNODE=00 &
bin/ignite.sh config/wsl-default-config.xml -J-DNODE=01 &
...
bin/ignite.sh config/wsl-default-config.xml -J-DNODE=99 &
```
## 1.13.FAQ

**1.堆内和堆外内存存储有何不同？**

当处理很大的堆时，通过在Java主堆空间外部缓存数据，可以使缓存克服漫长的JVM垃圾收集（GC）导致的暂停，但是数据仍然在内存中。
[更多信息](https://apacheignite.readme.io/docs/off-heap-memory)

**2.Apache Ignite是一个键值存储么？**

Apache Ignite是一个具有计算能力的、有弹性的内存中的分布式对象存储。在其最简单的形式中，是的，Apache Ignite可以作为一个键/值存储（缓存），但是也暴露了更丰富的API来与数据交互，比如完整的ANSI99兼容的SQL查询、文本检索、事务等等。
[更多信息](https://apacheignite.readme.io/docs/jcache)

**3.Apache Ignite是否支持JSON文档？**

当前，Apache Ignite并不完整支持JSON文档，但是当前处于beta阶段的Node.js客户端会支持JSON文档。

**4.Apache Ignite是否可以用于Apache Hive？**

是，Apache Ignite的Hadoop加速器提供了一系列的组件，支持在任何的Hadoop发行版中执行内存中的Hadoop作业执行和文件系统操作，包括Apache Hive。
[在Ignite化的Hadoop中运行Apache Hive](https://apacheignite-fs.readme.io/docs/running-apache-hive-over-ignited-hadoop)

**5.在事务隔离的悲观模式中，是否锁定键的读和写？**

是的，主要的问题在于，在`悲观`模式中，访问是会获得锁，而在`乐观`模式中，锁是在提交阶段获得的。
[更多信息](https://apacheignite.readme.io/docs/transactions)

**6.是否可以用Hibernate访问Apache Ignite？**

是的，Apache Ignite可以用作Hibernate的二级缓存（或者L2缓存），他可以显著地提升应用的持久化层的速度。
[更多信息](https://apacheignite.readme.io/docs/hibernate-l2-cache)

**7.Apache Ignite是否支持JDBC？**

是的，Apache Ignite提供了JDBC驱动，可以在缓存中使用标准SQL查询和JDBC API获得分布式的数据。
[更多信息](https://apacheignite.readme.io/docs/jdbc-driver)

**8.Apache Ignite是否保证消息的顺序？**

是的，如果希望收到消息的顺序与发送消息的顺序一致，可以使用`sendOrdered(...)`方法。可以传递一个超时时间来指定一条消息在队列中的等待时间，他会等待本来应在其之前发送的消息。如果超时时间过期，所有的还没有到达该节点中一个给定主题的消息都会被忽略。
[更多信息](https://apacheignite.readme.io/docs/messaging)

**9.是否可以运行Java和.Net闭包？他是如何工作的？**

.Net节点可以同时执行Java和.Net闭包，而标准Java节点只能执行Java闭包。当启动ApacheIgnite.exe时，他会使用位于`IGNITE_HOME/platforms/dotnet/bin`的一个脚本在同一个进程下同时启动JVM和CLR，.Net闭包会被CLR处理执行。

**10.Java和.Net之间的转换成本是什么？**

仅有的最小可能的开销是一个额外的数组复制+JNI调用，在本地测试时这个开销可能降低性能，但在真正的分布式负载环境下可以忽略不计。

**11.闭包是如何传输的？**

每个闭包都是一个特定类的对象。当它要被发送时会序列化成二进制的形式，通过线路发送到一个远程节点然后在那里反序列化。该远程节点在类路径中应该有该闭包类，或者开启peerClassLoading以从发送端加载该类。

**12.SQL查询是否被负载平衡？**

SQL查询总是被广播到保存有要查询的数据的每个节点，例外就是本地SQL查询(query.setLocal(true))，他只是在一个本地节点执行，还有就是可以精确标识节点的部分查询。

**13.用户是否可以控制资源分配？即，是否可以限制用户A为50个节点，但是用户B可以在所有的100个节点上执行任务？**

多租户只在缓存中存在，他们可以在创建在一个节点的子集上（可以看`CacheConfiguration.setNodeFilter`）以及在每个缓存基础上安全地赋予权限。
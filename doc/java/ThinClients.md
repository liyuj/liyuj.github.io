# 瘦客户端
## 1.瘦客户端介绍
### 1.1.概述
瘦客户端是一个使用标准套接字连接接入集群的轻量级的Ignite客户端，它不会成为集群拓扑的一部分，也不持有任何数据，也不会参与计算。它所做的只是简单地建立一个与标准Ignite节点的套接字连接，并通过该节点执行所有操作。

瘦客户端基于[二进制客户端协议](#_8-二进制客户端协议)，这样任何语言都可以接入Ignite集群，目前如下的客户端可用：

  - Java瘦客户端
  - .NET/C#瘦客户端
  - C++瘦客户端
  - Node.js瘦客户端
  - Python瘦客户端
  - PHP瘦客户端

### 1.2.瘦客户端特性
下表列出了每个客户端支持的特性：

|瘦客户端特性|Java|.NET|C++|Python|Node.js|PHP|
|---|---|---|---|---|---|---|
|`扫描查询`|是|是|否|是|是|是|
|`支持过滤器的扫描查询`|是|是|否|否|否|否|
|`SqlFieldsQuery`|是|是|否|是|是|是|
|`二进制对象API`|是|是|否|否|是|是|
|`异步操作`|否|是|否|是|是|是|
|`SSL/TLS`|是|是|是|是|是|是|
|`认证`|是|是|是|是|是|是|
|`分区感知`|是|是|是|是|是|否|
|`故障转移`|是|否|是|是|是|是|
|`事务`|是|否|否|否|否|否|
|`集群API`|是|是|否|否|否|否|
|`集群发现`|否|是|否|否|否|否|
|`计算`|是|是|否|否|否|否|
|`服务调用`|是|否|否|否|否|否|

#### 1.2.1.客户端连接故障转移
所有瘦客户端（.NET瘦客户端除外）均支持连接故障转移机制，在当前节点或连接失败时，客户端可自动切换到可用节点。为了使该机制生效，需要在客户端配置中提供用于故障转移节点的地址列表。更多详细信息，请参阅相关的客户端文档。
#### 1.2.2.分区感知
如[数据分区](/doc/java/DataModeling.md#_2-数据分区)章节所述，出于可伸缩性和性能方面的考虑，集群中的数据会在节点间平均分布。每个集群节点都维护数据和分区分布图的子集，用于确定持有所请求条目的主/备份副本的节点。

分区感知使得瘦客户端可以将查询请求直接发送到持有待查询数据的节点。
::: warning 警告
分区感知是一项实验性功能，正式发布之前，其API或设计架构可能会更改。
:::
在没有分区感知时，通过瘦客户端接入集群的应用，实际是通过某个作为代理的服务端节点执行所有查询和操作，然后将这些操作重新路由到数据所在的节点，这会导致瓶颈，可能会限制应用的线性扩展能力。

![](https://ignite.apache.org/docs/2.9.0/images/partitionawareness01.png)

注意查询必须通过代理服务端节点，然后路由到正确的节点。

有了分区感知之后，瘦客户端可以将查询和操作直接路由到持有待处理数据的主节点，这消除了瓶颈，使应用更易于扩展。

![](https://ignite.apache.org/docs/2.9.0/images/partitionawareness02.png)

::: warning 警告
注意目前需要在连接属性中提供所有服务端节点的地址。这意味着如果新的服务端节点加入集群，则应将新服务端的地址添加到连接属性中，然后重新连接。否则，瘦客户端将无法向该服务端发送直接请求，正式发布之后将解决此限制。
:::
#### 1.2.3.认证
所有瘦客户端都支持集群的身份验证。身份验证是在[集群配置](/doc/java/Security.md#_1-认证)中配置的，客户端仅提供用户凭据。更多的信息请参考特定客户端的文档。
### 1.3.集群配置
瘦客户端连接参数是由客户端连接器配置控制的。Ignite默认在端口10800上接受客户端连接。端口、连接缓冲区大小和超时、启用SSL/TLS等都是可以修改的。
#### 1.3.1.配置瘦客户端连接器
以下示例显示了如何配置瘦客户端连接参数：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration" id="ignite.cfg">
    <property name="clientConnectorConfiguration">
        <bean class="org.apache.ignite.configuration.ClientConnectorConfiguration">
            <property name="port" value="10000"/>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
ClientConnectorConfiguration clientConnectorCfg = new ClientConnectorConfiguration();
// Set a port range from 10000 to 10005
clientConnectorCfg.setPort(10000);
clientConnectorCfg.setPortRange(5);

IgniteConfiguration cfg = new IgniteConfiguration().setClientConnectorConfiguration(clientConnectorCfg);

// Start a node
Ignite ignite = Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    ClientConnectorConfiguration = new ClientConnectorConfiguration
    {
        // Set a port range from 10000 to 10005
        Port = 10000,
        PortRange = 5
    }
};

var ignite = Ignition.Start(cfg);
```
</Tab>
</Tabs>

下表中列出了可能需要修改的一些参数：

|参数|描述|默认值|
|---|---|---|
|`thinClientEnabled`|启用/禁用客户端接入|`true`|
|`port`|瘦客户端连接端口|`10800`|
|`portRange`|此参数设置瘦客户端连接的端口范围。例如，如果`portRange`=10，则瘦客户端可以连接到10800–18010范围内的任何端口。节点会尝试绑定从`port`开始的范围内的每个端口，直到找到可用端口为止。如果所有端口都不可用，则该节点将无法启动。|`100`|
|`sslEnabled`|将此属性配置为`true`，可以为瘦客户端连接启用SSL。|`false`|

完整的参数列表，请参见[ClientConnectorConfiguration](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/configuration/ClientConnectorConfiguration.html)的javadoc。
### 1.3.2.为瘦客户端启用SSL/TLS
参见[瘦客户端和JDBC/ODBC的SSL/TLS](/doc/java/Security.md#_2-3-瘦客户端和jdbc-odbc的ssl-tls)章节的内容。
## 2.Java瘦客户端
### 2.1.概述
Java瘦客户端是一个使用标准套接字连接接入集群的轻量级的Ignite客户端，它不会成为集群拓扑的一部分，也不持有任何数据，也不会参与计算。它所做的只是简单地建立一个与标准Ignite节点的套接字连接，并通过该节点执行所有操作。
### 2.2.配置
如果使用Maven或者Gradle，需要向应用中添加`ignite-core`依赖：

<Tabs>
<Tab title="Maven">

```xml
<properties>
    <ignite.version>2.9.0</ignite.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.apache.ignite</groupId>
        <artifactId>ignite-core</artifactId>
        <version>${ignite.version}</version>
    </dependency>
</dependencies>
```
</Tab>

<Tab title="Gradle">

```groovy
def igniteVersion = '2.9.0'

dependencies {
    compile group: 'org.apache.ignite', name: 'ignite-core', version: igniteVersion
}
```
</Tab>
</Tabs>

或者，也可以直接使用二进制包中的`ignite-core-2.9.0.jar`。
### 2.3.接入集群
可以使用`Ignition.startClient(ClientConfiguration)`方法初始化瘦客户端，该方法接受一个定义了客户端连接参数的`ClientConfiguration`对象。

该方法返回`IgniteClient`接口，提供了访问数据的各种方法。`IgniteClient`是一个自动关闭的资源，因此可以使用`try-with-resources`语句来关闭瘦客户端并且释放连接相关的资源。
```java
ClientConfiguration cfg = new ClientConfiguration().setAddresses("127.0.0.1:10800");
try (IgniteClient client = Ignition.startClient(cfg)) {
    ClientCache<Integer, String> cache = client.cache("myCache");
    // Get data from the cache
}
```
可以提供多个节点的地址，这时瘦客户端会随机接入列表中的服务端，如果都不可达，则抛出`ClientConnectionException`。
```java
try (IgniteClient client = Ignition.startClient(new ClientConfiguration().setAddresses("node1_address:10800",
        "node2_address:10800", "node3_address:10800"))) {
} catch (ClientConnectionException ex) {
    // All the servers are unavailable
}
```
注意，如果服务端故障，上述代码提供了一个故障转移的机制，具体请参见下面的处理节点故障相关章节的内容。
### 2.4.分区感知
分区感知使得瘦客户端可以将请求直接发给待处理数据所在的节点。
::: warning 警告
分区感知是一个试验性特性，在正式发布之前，API和设计架构可能会修改。
:::
在没有分区感知时，通过瘦客户端接入集群的应用，实际是通过某个作为代理的服务端节点执行所有查询和操作，然后将这些操作重新路由到数据所在的节点，这会导致瓶颈，可能会限制应用的线性扩展能力。

![](https://ignite.apache.org/docs/2.9.0/images/partitionawareness01.png)

注意查询必须通过代理服务端节点，然后路由到正确的节点。

有了分区感知之后，瘦客户端可以将查询和操作直接路由到持有待处理数据的主节点，这消除了瓶颈，使应用更易于扩展。

![](https://ignite.apache.org/docs/2.9.0/images/partitionawareness02.png)

::: warning 警告
注意目前需要在连接属性中提供所有服务端节点的地址。这意味着如果新的服务端节点加入集群，则应将新服务端的地址添加到连接属性中，然后重新连接。否则，瘦客户端将无法向该服务端发送直接请求，正式发布之后将解决此限制。
:::
下面的示例介绍了Java瘦客户端中分区感知功能的使用方法：
```java
ClientConfiguration cfg = new ClientConfiguration()
        .setAddresses("node1_address:10800", "node2_address:10800", "node3_address:10800")
        .setPartitionAwarenessEnabled(true);

try (IgniteClient client = Ignition.startClient(cfg)) {
    ClientCache<Integer, String> cache = client.cache("myCache");
    // Put, get or remove data from the cache...
} catch (ClientException e) {
    System.err.println(e.getMessage());
}
```
### 2.5.使用键-值API
Java瘦客户端支持胖客户端可以用的大多数键-值操作，要在某个缓存上执行键-值操作，需要先拿到该缓存的实例，然后调用他的方法。
#### 2.5.1.获取缓存的实例
`ClientCache`API提供了键-值操作API，通过如下的方法可以获得`ClientCache`的实例：

 - `IgniteClient.cache(String)`：假定给定名字的缓存已存在，该方法不会与集群通信确认缓存是否真实存在，如果缓存不存在之后的缓存操作会报错；
 - `IgniteClient.getOrCreateCache(String)`，`IgniteClient.getOrCreateCache(ClientCacheConfiguration)`：获取指定名字的缓存，如果不存在则会创建该缓存，创建时会使用默认的配置；
 - `IgniteClient.createCache(String)`，`IgniteClient.createCache(ClientCacheConfiguration)`：创建指定名字的缓存，如果已经存在则会报错；

使用`IgniteClient.cacheNames()`可以列出所有已有的缓存。
```java
ClientCacheConfiguration cacheCfg = new ClientCacheConfiguration().setName("References")
        .setCacheMode(CacheMode.REPLICATED)
        .setWriteSynchronizationMode(CacheWriteSynchronizationMode.FULL_SYNC);

ClientCache<Integer, String> cache = client.getOrCreateCache(cacheCfg);
```

#### 2.5.2.基本缓存操作
下面的代码片段演示了如何从瘦客户端执行基本的缓存操作：
```java
Map<Integer, String> data = IntStream.rangeClosed(1, 100).boxed()
        .collect(Collectors.toMap(i -> i, Object::toString));

cache.putAll(data);

assert !cache.replace(1, "2", "3");
assert "1".equals(cache.get(1));
assert cache.replace(1, "1", "3");
assert "3".equals(cache.get(1));

cache.put(101, "101");

cache.removeAll(data.keySet());
assert cache.size() == 1;
assert "101".equals(cache.get(101));

cache.removeAll();
assert 0 == cache.size();
```
#### 2.5.3.执行扫描查询
使用`ScanQuery<K, V>`类可获得一组满足给定条件的条目，瘦客户端将查询发送到集群节点，在集群节点上将其作为普通[扫描查询](/doc/java/UsingKeyValueApi.md#_3-使用扫描查询)执行。

查询条件由一个`IgniteBiPredicate<K, V>`对象指定，该对象作为参数传递给查询构造函数。谓词应用于服务器端,如果未提供任何谓词，查询将返回所有缓存条目。
::: tip 提示
谓词的类必须在集群的服务端节点上可用。
:::
查询结果是按页传输到客户端的，每个页面包含特定数量的条目，仅在请求该页面的条目时才将其提取到客户端。要更改页面中的条目数，需要使用`ScanQuery.setPageSize(int pageSize)`方法（默认值为1024）。
```java
ClientCache<Integer, Person> personCache = client.getOrCreateCache("personCache");

Query<Cache.Entry<Integer, Person>> qry = new ScanQuery<Integer, Person>(
        (i, p) -> p.getName().contains("Smith"));

try (QueryCursor<Cache.Entry<Integer, Person>> cur = personCache.query(qry)) {
    for (Cache.Entry<Integer, Person> entry : cur) {
        // Process the entry ...
    }
}
```
`IgniteClient.query(…​)`方法会返回`FieldsQueryCursor`的实例，要确保对结果集进行遍历后将其关闭。
#### 2.5.4.事务
如果缓存为`AtomicityMode.TRANSACTIONAL`模式，则客户端支持事务。
##### 2.5.4.1.执行事务
要开始事务，需要从`IgniteClient`中拿到`ClientTransactions`对象。`ClientTransactions`中有一组`txStart(…​)`方法，每个都会开启一个新的事务然后返回一个表示事务的`ClientTransaction`对象，使用该对象可以对事务进行提交或者回滚。
```java
ClientCache<Integer, String> cache = client.cache("my_transactional_cache");

ClientTransactions tx = client.transactions();

try (ClientTransaction t = tx.txStart()) {
    cache.put(1, "new value");

    t.commit();
}
```
##### 2.5.4.2.事务配置
客户端事务可以有不同的[并发模型和隔离级别](/doc/java/Transactions.md#_1-3-并发模型和隔离级别)，以及执行超时，这些都可以在所有事务上进行配置，也可以针对单个事务进行配置。

`ClientConfiguration`可以配置该客户端接口启动的所有事务默认的并发模型、隔离级别和超时时间：
```java
ClientConfiguration cfg = new ClientConfiguration();
cfg.setAddresses("localhost:10800");

cfg.setTransactionConfiguration(new ClientTransactionConfiguration().setDefaultTxTimeout(10000)
        .setDefaultTxConcurrency(TransactionConcurrency.OPTIMISTIC)
        .setDefaultTxIsolation(TransactionIsolation.REPEATABLE_READ));

IgniteClient client = Ignition.startClient(cfg);
```
开启某个事务时，也可以单独指定并发模型、隔离级别和超时时间，这时提供的值就会覆盖默认的值：
```java
ClientTransactions tx = client.transactions();
try (ClientTransaction t = tx.txStart(TransactionConcurrency.OPTIMISTIC,
        TransactionIsolation.REPEATABLE_READ)) {
    cache.put(1, "new value");
    t.commit();
}
```
#### 2.5.5.处理二进制对象
瘦客户端完全支持[处理二进制对象](/doc/java/UsingKeyValueApi.md#_2-使用二进制对象)章节中介绍的二进制对象API，使用`CacheClient.withKeepBinary()`可以将缓存切换到二进制模式，然后就可以直接处理二进制对象而避免序列化/反序列化。使用`IgniteClient.binary()`可以获取一个`IgniteBinary`的实例，然后就可以从头开始构建一个对象。
```java
IgniteBinary binary = client.binary();

BinaryObject val = binary.builder("Person").setField("id", 1, int.class).setField("name", "Joe", String.class)
        .build();

ClientCache<Integer, BinaryObject> cache = client.cache("persons").withKeepBinary();

cache.put(1, val);

BinaryObject value = cache.get(1);
```
### 2.6.执行SQL语句
Java瘦客户端提供了一个SQL API来执行SQL语句，SQL语句通过`SqlFieldsQuery`对象来声明，然后通过`IgniteClient.query(SqlFieldsQuery)`来执行。
```java
client.query(new SqlFieldsQuery(String.format(
        "CREATE TABLE IF NOT EXISTS Person (id INT PRIMARY KEY, name VARCHAR) WITH \"VALUE_TYPE=%s\"",
        Person.class.getName())).setSchema("PUBLIC")).getAll();

int key = 1;
Person val = new Person(key, "Person 1");

client.query(new SqlFieldsQuery("INSERT INTO Person(id, name) VALUES(?, ?)").setArgs(val.getId(), val.getName())
        .setSchema("PUBLIC")).getAll();

FieldsQueryCursor<List<?>> cursor = client
        .query(new SqlFieldsQuery("SELECT name from Person WHERE id=?").setArgs(key).setSchema("PUBLIC"));

// Get the results; the `getAll()` methods closes the cursor; you do not have to
// call cursor.close();
List<List<?>> results = cursor.getAll();

results.stream().findFirst().ifPresent(columns -> {
    System.out.println("name = " + columns.get(0));
});
```
`query(SqlFieldsQuery)`方法会返回一个`FieldsQueryCursor`的实例，可以用于对结果集进行迭代，使用完毕后，一定要关闭以释放相关的资源。
::: tip 提示
`getAll()`方法会从游标中拿到所有的结果集，然后将其关闭。
:::
`SqlFieldsQuery`的使用以及SQL API方面的更多信息，请参见[使用SQL API](/doc/java/WorkingwithSQL.md#_4-使用sql-api)章节的内容。
### 2.7.使用集群API
集群API可以用于创建集群组然后在这个组中执行各种操作。`ClientCluster`接口是该API的入口，用处如下：

 - 获取或者修改集群的状态；
 - 获取集群所有节点的列表；
 - 创建集群节点的逻辑组，然后使用其他的Ignite API在组中执行特定的操作。

使用`IgniteClient`实例可以获得`ClientCluster`接口的引用。
```java
try (IgniteClient client = Ignition.startClient(clientCfg)) {
    ClientCluster clientCluster = client.cluster();
    clientCluster.state(ClusterState.ACTIVE);
}
```
#### 2.7.1.节点逻辑分组
可以使用集群API的`ClientClusterGroup`接口来创建集群节点的各种组合。比如，一个组可以包含所有的服务端节点，而另一组可以仅包含与特定TCP/IP地址格式匹配的那些节点，下面的示例显示如何创建位于`dc1`数据中心的一组服务端节点：
```java
try (IgniteClient client = Ignition.startClient(clientCfg)) {
    ClientClusterGroup serversInDc1 = client.cluster().forServers().forAttribute("dc", "dc1");
    serversInDc1.nodes().forEach(n -> System.out.println("Node ID: " + n.id()));
}
```
关于这个功能的更多信息，请参见[集群组](/doc/java/DistributedComputing.md#_2-集群组)的相关文档。
### 2.8.执行计算任务
当前，Java瘦客户端通过执行集群中**已经部署**的计算任务来支持基本的[计算功能](/doc/java/DistributedComputing.md#_1-分布式计算api)。可以跨所有集群节点或特定[集群组](#_2-7-1-节点逻辑分组)运行任务。这个环境要求将计算任务打包成一个JAR文件，并将其添加到集群节点的类路径中。

由瘦客户端触发的任务执行默认在集群侧被禁用。需要在服务端节点和胖客户端节点将`ThinClientConfiguration.maxActiveComputeTasksPerConnection`参数设置为非零值：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration" id="ignite.cfg">
    <property name="clientConnectorConfiguration">
        <bean class="org.apache.ignite.configuration.ClientConnectorConfiguration">
            <property name="thinClientConfiguration">
                <bean class="org.apache.ignite.configuration.ThinClientConfiguration">
                    <property name="maxActiveComputeTasksPerConnection" value="100" />
                </bean>
            </property>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
ThinClientConfiguration thinClientCfg = new ThinClientConfiguration()
        .setMaxActiveComputeTasksPerConnection(100);

ClientConnectorConfiguration clientConnectorCfg = new ClientConnectorConfiguration()
        .setThinClientConfiguration(thinClientCfg);

IgniteConfiguration igniteCfg = new IgniteConfiguration()
        .setClientConnectorConfiguration(clientConnectorCfg);

Ignite ignite = Ignition.start(igniteCfg);
```
</Tab>
</Tabs>

下面的示例显示如果通过`ClientCompute`接口访问计算API，然后执行名为`MyTask`的计算任务：
```java
try (IgniteClient client = Ignition.startClient(clientCfg)) {
    // Suppose that the MyTask class is already deployed in the cluster
    client.compute().execute(
        MyTask.class.getName(), "argument");
}
```
### 2.9.执行Ignite服务
可以使用Java瘦客户端的`ClientServices`接口调用一个集群中**已经部署**的[Ignite服务](/doc/java/UsingServices.md)。

下面的示例显示如何调用名为`MyService`的服务：
```java
try (IgniteClient client = Ignition.startClient(clientCfg)) {
    // Executing the service named MyService
    // that is already deployed in the cluster.
    client.services().serviceProxy(
        "MyService", MyService.class).myServiceMethod();
}
```
### 2.10.处理异常
#### 2.10.1.处理节点故障
当在客户端配置中提供多个节点的地址时，如果当前连接失败，客户端将自动切换到下一个节点，然后重试任何正在进行的操作。

对于原子操作，故障转移到另一个节点对用户是透明的。但是如果执行的是扫描查询或SELECT查询，则查询游标上的迭代可能会抛出`ClientConnectionException`。之所以会发生这种情况，是因为查询是按页返回数据，并且如果在客户端检索页面时客户端连接到的节点故障，则会抛出异常以保持查询结果的一致性。

如果启动了显式事务，则在服务端节点故障时，绑定到该事务的缓存操作也会抛出`ClientException`异常。

用户代码应处理这些异常并相应地实现重试逻辑。
### 2.11.安全
#### 2.11.1.SSL/TLS
要在瘦客户端和集群之间使用加密的通信，必须在集群配置和客户端配置中都启用SSL/TLS。有关集群配置的说明，请参阅[瘦客户端启用SSL/TLS](#_1-3-2-为瘦客户端启用ssl-tls)章节的介绍。

要在瘦客户端中启用加密的通信，请在瘦客户端配置中提供一个包含加密密钥的密钥库和一个具有受信任证书的信任库：
```java
ClientConfiguration clientCfg = new ClientConfiguration().setAddresses("127.0.0.1:10800");

clientCfg.setSslMode(SslMode.REQUIRED).setSslClientCertificateKeyStorePath(KEYSTORE)
        .setSslClientCertificateKeyStoreType("JKS").setSslClientCertificateKeyStorePassword("123456")
        .setSslTrustCertificateKeyStorePath(TRUSTSTORE).setSslTrustCertificateKeyStorePassword("123456")
        .setSslTrustCertificateKeyStoreType("JKS").setSslKeyAlgorithm("SunX509").setSslTrustAll(false)
        .setSslProtocol(SslProtocol.TLS);

try (IgniteClient client = Ignition.startClient(clientCfg)) {
    // ...
}
```
下表介绍了客户端连接的加密参数：

|属性|描述|默认值|
|---|---|---|
|`sslMode`|`REQURED`或者`DISABLED`|`DISABLED`|
|`sslClientCertificateKeyStorePath`|私钥密钥库文件的路径||
|`sslClientCertificateKeyStoreType`|密钥库的类型|`JKS`|
|`sslClientCertificateKeyStorePassword`|密钥库的密码||
|`sslTrustCertificateKeyStorePath`|信任库文件的路径||
|`sslTrustCertificateKeyStoreType`|信任库的类型|`JKS`|
|`sslTrustCertificateKeyStorePassword`|信任库的密码||
|`sslKeyAlgorithm`|用于创建密钥管理器的密钥管理器算法|`SunX509`|
|`sslTrustAll`|如果配置为`true`，则不验证证书||
|`sslProtocol`|用于数据加密的协议名|`TLS`|

#### 2.11.2.认证
配置[集群侧的认证](/doc/java/Security.md#_1-认证)，然后在客户端配置中提供用户名和密码：
```java
ClientConfiguration clientCfg = new ClientConfiguration().setAddresses("127.0.0.1:10800").setUserName("joe")
        .setUserPassword("passw0rd!");

try (IgniteClient client = Ignition.startClient(clientCfg)) {
    // ...
} catch (ClientAuthenticationException e) {
    // Handle authentication failure
}
```
## 3..NET瘦客户端
### 3.1.环境要求
 
 - 支持的运行时：.NET 4.0+，.NET Core 2.0+；
 - 支持的操作系统：Windows，Linux，macOS (.NET Core 2.0+支持的任何操作系统)。

### 3.2.安装
.NET瘦客户端API由Ignite.NET API库提供，位于二进制包的`{IGNITE_HOME}/platforms/dotnet`目录下，API位于`Apache.Ignite.Core`程序集中。
### 3.3.接入集群
瘦客户端的API入口是`Ignition.StartClient(IgniteClientConfiguration)`方法，其中`IgniteClientConfiguration.Endpoints`是必需的，它指向了运行服务端节点的主机。
```csharp
var cfg = new IgniteClientConfiguration
{
    Endpoints = new[] {"127.0.0.1:10800"}
};

using (var client = Ignition.StartClient(cfg))
{
    var cache = client.GetOrCreateCache<int, string>("cache");
    cache.Put(1, "Hello, World!");
}
```
#### 3.3.1.故障转移
可以提供多个节点的地址，这时瘦客户端会随机接入列表中的服务端，这时**故障转移机制**就会启用，即如果一个服务端故障，客户端会尝试其他的地址然后自动重连。注意如果服务端节点故障时客户端操作正在执行中，有可能抛出`IgniteClientException`异常，开发者需要处理这个异常并实现相应的重试逻辑。
#### 3.3.2.服务端节点自动发现
瘦客户端可以自动发现集群中的服务端节点，如果开启了分区感知，这个功能就会启用。

服务端的发现是一个异步的过程，是在后台进行的。另外，瘦客户端只在执行部分操作时才会接收拓扑更新（以最大程度地减少来自空闲连接的服务器负载和网络流量）。

可以通过启用日志记录和/或调用`IIgniteClient.GetConnections`来观察发现过程：
```csharp
var cfg = new IgniteClientConfiguration
{
    Endpoints = new[] {"127.0.0.1:10800"},
    EnablePartitionAwareness = true,

    // Enable trace logging to observe discovery process.
    Logger = new ConsoleLogger { MinLevel = LogLevel.Trace }
};

var client = Ignition.StartClient(cfg);

// Perform any operation and sleep to let the client discover
// server nodes asynchronously.
client.GetCacheNames();
Thread.Sleep(1000);

foreach (IClientConnection connection in client.GetConnections())
{
    Console.WriteLine(connection.RemoteEndPoint);
}
```
::: warning 警告
当服务端位于NAT服务器或代理之后时，服务端发现可能不起作用。服务端节点将其地址和端口提供给客户端，但是当客户端位于其他子网中时，这些地址将不起作用。
:::
### 3.4.分区感知
分区感知使得瘦客户端可以将请求直接发给待处理数据所在的节点。
::: warning 警告
分区感知是一个试验性特性，在正式发布之前，API和设计架构可能会修改。
:::
在没有分区感知时，通过瘦客户端接入集群的应用，实际是通过某个作为代理的服务端节点执行所有查询和操作，然后将这些操作重新路由到数据所在的节点，这会导致瓶颈，可能会限制应用的线性扩展能力。

![](https://ignite.apache.org/docs/2.9.0/images/partitionawareness01.png)

注意查询必须通过代理服务端节点，然后路由到正确的节点。

有了分区感知之后，瘦客户端可以将查询和操作直接路由到持有待处理数据的主节点，这消除了瓶颈，使应用更易于扩展。

![](https://ignite.apache.org/docs/2.9.0/images/partitionawareness02.png)

将`IgniteClientConfiguration.EnablePartitionAwareness`属性配置为`true`可以开启分区感知，这同时也开启了服务端发现。如果客户端位于NAT或者代理之后，服务端自动发现可能不起作用，这时需要在客户端的连接配置中提供所有的服务端地址。
### 3.5.使用键-值API
#### 3.5.1.获取缓存的实例
`ICacheClient`API提供了键-值操作API，通过如下的方法可以获得`ICacheClient`的实例：

 - `GetCache(cacheName)`：返回已有缓存的实例；
 - `CreateCache(cacheName)`：用指定名字创建一个缓存；
 - `GetOrCreateCache(CacheClientConfiguration)`：通过指定的配置获取和创建一个缓存；

```csharp
var cacheCfg = new CacheClientConfiguration
{
    Name = "References",
    CacheMode = CacheMode.Replicated,
    WriteSynchronizationMode = CacheWriteSynchronizationMode.FullSync
};
var cache = client.GetOrCreateCache<int, string>(cacheCfg);
```
使用`IIgniteClient.GetCacheNames()`可以获得所有已有缓存的列表。
#### 3.5.2.基本缓存操作
下面的代码片段演示了如何从瘦客户端执行基本的缓存操作：
```csharp
var data = Enumerable.Range(1, 100).ToDictionary(e => e, e => e.ToString());

cache.PutAll(data);

var replace = cache.Replace(1, "2", "3");
Console.WriteLine(replace); //false

var value = cache.Get(1);
Console.WriteLine(value); //1

replace = cache.Replace(1, "1", "3");
Console.WriteLine(replace); //true

value = cache.Get(1);
Console.WriteLine(value); //3

cache.Put(101, "101");

cache.RemoveAll(data.Keys);
var sizeIsOne = cache.GetSize() == 1;
Console.WriteLine(sizeIsOne); //true

value = cache.Get(101);
Console.WriteLine(value); //101

cache.RemoveAll();
var sizeIsZero = cache.GetSize() == 0;
Console.WriteLine(sizeIsZero); //true
```
#### 3.5.3.处理二进制对象
瘦客户端完全支持[处理二进制对象](/doc/java/UsingKeyValueApi.md#_2-使用二进制对象)章节中介绍的二进制对象API，使用`ICacheClient.WithKeepBinary()`可以将缓存切换到二进制模式，然后就可以直接处理二进制对象而避免序列化/反序列化。使用`IIgniteClient.GetBinary()`可以获取一个`IBinary`的实例，然后就可以从头开始构建一个对象。
```csharp
var binary = client.GetBinary();

var val = binary.GetBuilder("Person")
    .SetField("id", 1)
    .SetField("name", "Joe")
    .Build();

var cache = client.GetOrCreateCache<int, object>("persons").WithKeepBinary<int, IBinaryObject>();

cache.Put(1, val);

var value = cache.Get(1);
```
### 3.6.执行扫描查询
使用扫描查询可获得一组满足给定条件的条目，瘦客户端将查询发送到集群节点，在集群节点上将其作为普通扫描查询执行。

查询条件由一个`ICacheEntryFilter`对象指定，该对象作为参数传递给查询构造函数。

查询过滤器定义方式如下：
```csharp
class NameFilter : ICacheEntryFilter<int, Person>
{
    public bool Invoke(ICacheEntry<int, Person> entry)
    {
        return entry.Value.Name.Contains("Smith");
    }
}
```
然后执行扫描查询：
```csharp
var cache = client.GetOrCreateCache<int, Person>("personCache");

cache.Put(1, new Person {Name = "John Smith"});
cache.Put(2, new Person {Name = "John Johnson"});

using (var cursor = cache.Query(new ScanQuery<int, Person>(new NameFilter())))
{
    foreach (var entry in cursor)
    {
        Console.WriteLine("Key = " + entry.Key + ", Name = " + entry.Value.Name);
    }
}
```

### 3.7.执行SQL语句
瘦客户端提供了一个SQL API来执行SQL语句，SQL语句通过`SqlFieldsQuery`对象来声明，然后通过`ICacheClient.Query(SqlFieldsQuery)`来执行。另外，SQL查询也可以通过Ignite LINQ提供者来执行。
```csharp
var cache = client.GetOrCreateCache<int, Person>("Person");
cache.Query(new SqlFieldsQuery(
        $"CREATE TABLE IF NOT EXISTS Person (id INT PRIMARY KEY, name VARCHAR) WITH \"VALUE_TYPE={typeof(Person)}\"")
    {Schema = "PUBLIC"}).GetAll();

var key = 1;
var val = new Person {Id = key, Name = "Person 1"};

cache.Query(
    new SqlFieldsQuery("INSERT INTO Person(id, name) VALUES(?, ?)")
    {
        Arguments = new object[] {val.Id, val.Name},
        Schema = "PUBLIC"
    }
).GetAll();

var cursor = cache.Query(
    new SqlFieldsQuery("SELECT name FROM Person WHERE id = ?")
    {
        Arguments = new object[] {key},
        Schema = "PUBLIC"
    }
);

var results = cursor.GetAll();

var first = results.FirstOrDefault();
if (first != null)
{
    Console.WriteLine("name = " + first[0]);
}
```
### 3.8.使用集群API
集群API可以用于创建集群组然后在这个组中执行各种操作。`IClientCluster`接口是该API的入口，用处如下：

 - 获取或者修改集群的状态；
 - 获取集群所有节点的列表；
 - 创建集群节点的逻辑组，然后使用其他的Ignite API在组中执行特定的操作。

使用`IClientCluster`实例可以获得包含所有节点的`IClientCluster`的引用。并激活整个集群以及`my-cache`缓存的预写日志。
```csharp
IIgniteClient client = Ignition.StartClient(cfg);
IClientCluster cluster = client.GetCluster();
cluster.SetActive(true);
cluster.EnableWal("my-cache");
```
#### 3.8.1.节点逻辑分组
可以使用集群API的`IClientClusterGroup`接口来创建集群节点的各种组合。比如，一个组可以包含所有的服务端节点，而另一组可以仅包含与特定TCP/IP地址格式匹配的那些节点，下面的示例显示如何创建位于`dc1`数据中心的一组服务端节点：
```csharp
IIgniteClient client = Ignition.StartClient(cfg);
IClientClusterGroup serversInDc1 = client.GetCluster().ForServers().ForAttribute("dc", "dc1");
foreach (IClientClusterNode node in serversInDc1.GetNodes())
    Console.WriteLine($"Node ID: {node.Id}");
```
注意，`IClientCluster`实例实现了`IClientClusterGroup`，这个是集群组根，包括了集群的所有节点。

关于这个功能的更多信息，请参见[集群组](/doc/java/DistributedComputing.md#_2-集群组)的相关文档。
### 3.9.执行计算任务
当前，.NET瘦客户端通过执行集群中**已经部署**的计算任务来支持基本的[计算功能](/doc/java/DistributedComputing.md#_1-分布式计算api)。可以跨所有集群节点或特定[集群组](#_3-8-1-节点逻辑分组)运行任务。

由瘦客户端触发的任务执行默认在集群侧被禁用。需要在服务端节点和胖客户端节点将`ThinClientConfiguration.MaxActiveComputeTasksPerConnection`参数设置为非零值：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration" id="ignite.cfg">
  <property name="clientConnectorConfiguration">
    <bean class="org.apache.ignite.configuration.ClientConnectorConfiguration">
      <property name="thinClientConfiguration">
        <bean class="org.apache.ignite.configuration.ThinClientConfiguration">
          <property name="maxActiveComputeTasksPerConnection" value="100" />
        </bean>
      </property>
    </bean>
  </property>
</bean>
```
</Tab>

<Tab title="C#">

```csharp
var igniteCfg = new IgniteConfiguration
{
    ClientConnectorConfiguration = new ClientConnectorConfiguration
    {
        ThinClientConfiguration = new ThinClientConfiguration
        {
            MaxActiveComputeTasksPerConnection = 10
        }
    }
};

IIgnite ignite = Ignition.Start(igniteCfg);
```
</Tab>
</Tabs>

下面的示例显示如果通过`IComputeClient`接口访问计算API，然后执行名为`org.foo.bar.AddOneTask`、传入参数为`1`的计算任务：
```csharp
IIgniteClient client = Ignition.StartClient(cfg);
IComputeClient compute = client.GetCompute();
int result = compute.ExecuteJavaTask<int>("org.foo.bar.AddOneTask", 1);
```
### 3.10.安全
#### 3.10.1.SSL/TLS
要在瘦客户端和集群之间使用加密的通信，必须在集群配置和客户端配置中都启用SSL/TLS。有关集群配置的说明，请参阅[瘦客户端启用SSL/TLS](#_1-3-2-为瘦客户端启用ssl-tls)章节的介绍。

下面的代码示例演示了如何在瘦客户端中配置SSL参数：
```csharp
var cfg = new IgniteClientConfiguration
{
    Endpoints = new[] {"127.0.0.1:10800"},
    SslStreamFactory = new SslStreamFactory
    {
        CertificatePath = ".../certs/client.pfx",
        CertificatePassword = "password",
    }
};
using (var client = Ignition.StartClient(cfg))
{
    //...
}
```
#### 3.10.2.认证
配置[集群侧的认证](/doc/java/Security.md#_1-认证)，然后在客户端配置中提供用户名和密码：
```csharp
var cfg = new IgniteClientConfiguration
{
    Endpoints = new[] {"127.0.0.1:10800"},
    UserName = "ignite",
    Password = "ignite"
};
using (var client = Ignition.StartClient(cfg))
{
    //...
}
```
## 4.C++瘦客户端
### 4.1.环境要求

 - C编译器：MS Visual C（10.0及以后），g++（4.4.0及以后）；
 - Visual Studio 2010及以后。

### 4.2.安装
Ignite二进制包的`${IGNITE_HOME}/platforms/cpp`目录中包含了C++瘦客户端的源代码。

<Tabs>
<Tab title="Windows">

```batch
cd %IGNITE_HOME%\platforms\cpp\project\vs

msbuild ignite.sln /p:Configuration=Release /p:Platform=x64
```
</Tab>

<Tab title="Ubuntu">

```shell
cd ${CPP_BUILD_DIR}
cmake -DCMAKE_BUILD_TYPE=Release -DWITH_THIN_CLIENT=ON ${IGNITE_HOME}/platforms/cpp
make
sudo make install
```
</Tab>

<Tab title="CentOS/RHEL">

```shell
cd ${CPP_BUILD_DIR}
cmake3 -DCMAKE_BUILD_TYPE=Release -DWITH_THIN_CLIENT=ON ${IGNITE_HOME}/platforms/cpp
make
sudo make install
```
</Tab>
</Tabs>

### 4.3.创建客户端实例
瘦客户端提供的API位于`ignite::thin`命名空间，API的主要入口是`IgniteClient::Start(IgniteClientConfiguration)`方法，会返回一个客户端的实例：
```cpp
#include <ignite/thin/ignite_client.h>
#include <ignite/thin/ignite_client_configuration.h>

using namespace ignite::thin;

void TestClient()
{
    IgniteClientConfiguration cfg;

    //Endpoints list format is "<host>[port[..range]][,...]"
    cfg.SetEndPoints("127.0.0.1:11110,example.com:1234..1240");

    IgniteClient client = IgniteClient::Start(cfg);

    cache::CacheClient<int32_t, std::string> cacheClient =
        client.GetOrCreateCache<int32_t, std::string>("TestCache");

    cacheClient.Put(42, "Hello Ignite Thin Client!");
}
```
#### 4.3.1.分区感知
分区感知使得瘦客户端可以将请求直接发给待处理数据所在的节点。
::: warning 警告
分区感知是一个试验性特性，在正式发布之前，API和设计架构可能会修改。
:::
在没有分区感知时，通过瘦客户端接入集群的应用，实际是通过某个作为代理的服务端节点执行所有查询和操作，然后将这些操作重新路由到数据所在的节点，这会导致瓶颈，可能会限制应用的线性扩展能力。

![](https://ignite.apache.org/docs/2.9.0/images/partitionawareness01.png)

注意查询必须通过代理服务端节点，然后路由到正确的节点。

有了分区感知之后，瘦客户端可以将查询和操作直接路由到持有待处理数据的主节点，这消除了瓶颈，使应用更易于扩展。

![](https://ignite.apache.org/docs/2.9.0/images/partitionawareness02.png)

::: warning 警告
注意目前需要在连接属性中提供所有服务端节点的地址。这意味着如果新的服务端节点加入集群，则应将新服务端的地址添加到连接属性中，然后重新连接。否则，瘦客户端将无法向该服务端发送直接请求，正式发布之后将解决此限制。
:::

下面的代码演示了C++瘦客户端中的分区感知功能如何使用：
```cpp
#include <ignite/thin/ignite_client.h>
#include <ignite/thin/ignite_client_configuration.h>

using namespace ignite::thin;

void TestClientPartitionAwareness()
{
    IgniteClientConfiguration cfg;
    cfg.SetEndPoints("127.0.0.1:10800,217.29.2.1:10800,200.10.33.1:10800");
    cfg.SetPartitionAwareness(true);

    IgniteClient client = IgniteClient::Start(cfg);

    cache::CacheClient<int32_t, std::string> cacheClient =
        client.GetOrCreateCache<int32_t, std::string>("TestCache");

    cacheClient.Put(42, "Hello Ignite Partition Awareness!");

    cacheClient.RefreshAffinityMapping();

    // Getting a value
    std::string val = cacheClient.Get(42);
}
```
### 4.4.使用键-值API
#### 4.4.1.获取缓存实例
要在缓存上执行基本的键-值操作，需要先获取缓存的实例：
```cpp
cache::CacheClient<int32_t, std::string> cache =
    client.GetOrCreateCache<int32_t, std::string>("TestCache");
```
`GetOrCreateCache(cacheName)`会返回一个缓存的实例，如果不存在，会创建一个新的缓存。
#### 4.4.2.基本缓存操作
下面的代码片段演示了如何在一个缓存上执行基本的缓存操作：
```cpp
std::map<int, std::string> vals;
for (int i = 1; i < 100; i++)
{
    vals[i] = i;
}

cache.PutAll(vals);
cache.Replace(1, "2");
cache.Put(101, "101");
cache.RemoveAll();
```
### 4.5.安全
#### 4.5.1.SSL/TLS
要在瘦客户端和集群之间使用加密的通信，必须在集群配置和客户端配置中都启用SSL/TLS。有关集群配置的说明，请参阅[瘦客户端启用SSL/TLS](#_1-3-2-为瘦客户端启用ssl-tls)章节的介绍。
```cpp
IgniteClientConfiguration cfg;

// Sets SSL mode.
cfg.SetSslMode(SslMode::Type::REQUIRE);

// Sets file path to SSL certificate authority to authenticate server certificate during connection establishment.
cfg.SetSslCaFile("path/to/SSL/certificate/authority");

// Sets file path to SSL certificate to use during connection establishment.
cfg.SetSslCertFile("path/to/SSL/certificate");

// Sets file path to SSL private key to use during connection establishment.
cfg.SetSslKeyFile("path/to/SSL/private/key");
```
#### 4.5.2.认证
配置[集群侧的认证](/doc/java/Security.md#_1-认证)，然后在客户端配置中提供用户名和密码：
```cpp
#include <ignite/thin/ignite_client.h>
#include <ignite/thin/ignite_client_configuration.h>

using namespace ignite::thin;

void TestClientWithAuth()
{
    IgniteClientConfiguration cfg;
    cfg.SetEndPoints("127.0.0.1:10800");

    // Use your own credentials here.
    cfg.SetUser("ignite");
    cfg.SetPassword("ignite");

    IgniteClient client = IgniteClient::Start(cfg);

    cache::CacheClient<int32_t, std::string> cacheClient =
        client.GetOrCreateCache<int32_t, std::string>("TestCache");

    cacheClient.Put(42, "Hello Ignite Thin Client with auth!");
}
```
## 5.Python瘦客户端
## 6.PHP瘦客户端
## 7.Node.js瘦客户端
## 8.二进制客户端协议
### 8.1.二进制客户端协议
#### 8.1.1.概述
Ignite的二进制客户端协议使得应用不用启动一个全功能的节点，就可以与已有的集群进行通信。应用使用原始的TCP套接字，就可以接入集群。连接建立之后，就可以使用定义好的格式执行缓存操作。

与集群通信，客户端必须遵守下述的数据格式和通信细节。
#### 8.1.2.数据格式

**字节序**

Ignite的二进制客户端协议使用小端字节顺序。

**数据对象**

业务数据，比如缓存的键和值，是以Ignite的[二进制对象](/doc/java/DataModeling.md#_4-二进制编组器)表示的，一个数据对象可以是标准类型（预定义），也可以是复杂对象，具体可以看[数据格式](#_2-2-数据格式)的相关章节。
#### 8.1.3.消息格式
所有消息的请求和响应，包括握手，都以`int`类型消息长度开始（不包括开始的4个字节），后面是消息体。

**握手**

二进制客户端协议需要一个连接握手，来确保客户端和服务端版本的兼容性。下表会显示请求和响应握手消息的结构，下面的示例章节中还会显示如何发送和接收握手请求及其对应的响应。

|请求类型|描述|
|---|---|
|`int`|握手有效消息长度|
|`byte`|握手码，值为1|
|`short`|主版本号|
|`short`|次版本号|
|`short`|修订版本号|
|`byte`|客户端码，值为2|
|`string`|用户名|
|`string`|密码|

|响应类型（成功）|描述|
|---|---|
|`int`|成功消息长度，1|
|`byte`|成功标志，1|

|响应类型（失败）|描述|
|---|---|
|`int`|错误消息长度|
|`byte`|成功标志，0|
|`short`|服务端主版本号|
|`short`|服务端次版本号|
|`short`|服务端修订版本号|
|`string`|错误消息|

**标准消息头**

客户端操作消息由消息头和与操作有关的数据的消息体组成，每个操作都有自己的数据请求和响应格式，以及一个通用头。
下面的表格和示例显示了客户端操作消息头的请求和响应结构。

|请求类型|描述|
|---|---|
|`int`|有效信息长度|
|`short`|操作码|
|`long`|请求Id，客户端生成，响应中也会返回|

请求头：
```java
private static void writeRequestHeader(int reqLength, short opCode, long reqId, DataOutputStream out) throws IOException {
  // Message length
  writeIntLittleEndian(10 + reqLength, out);

  // Op code
  writeShortLittleEndian(opCode, out);

  // Request id
  writeLongLittleEndian(reqId, out);
}

```

|响应类型|描述|
|---|---|
|`int`|响应消息长度|
|`long`|请求Id|
|`int`|状态码，（0为成功，其它为错误码）|
|`string`|错误消息（只有状态码非0时才会有）|

响应头：
```java
private static void readResponseHeader(DataInputStream in) throws IOException {
  // Response length
  final int len = readIntLittleEndian(in);

  // Request id
  long resReqId = readLongLittleEndian(in);

  // Success code
  int statusCode = readIntLittleEndian(in);
}
```
#### 8.1.4.接入

**TCP套接字**

客户端应用接入服务端节点需要通过TCP套接字，连接器默认使用`10800`端口。可以在集群的`IgniteConfiguration`中的`clientConnectorConfiguration`属性中，配置端口号及其它的服务端连接参数，如下所示：

<Tabs>
<Tab title="XML">

```xml
<bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
    <!-- Thin client connection configuration. -->
    <property name="clientConnectorConfiguration">
        <bean class="org.apache.ignite.configuration.ClientConnectorConfiguration">
            <property name="host" value="127.0.0.1"/>
            <property name="port" value="10900"/>
            <property name="portRange" value="30"/>
        </bean>
    </property>

    <!-- Other Ignite Configurations. -->

</bean>
```
</Tab>

<Tab title="Java">

```java
	IgniteConfiguration cfg = new IgniteConfiguration();

ClientConnectorConfiguration ccfg = new ClientConnectorConfiguration();
ccfg.setHost("127.0.0.1");
ccfg.setPort(10900);
ccfg.setPortRange(30);

// Set client connection configuration in IgniteConfiguration
cfg.setClientConnectorConfiguration(ccfg);

// Start Ignite node
Ignition.start(cfg);
```
</Tab>

</Tabs>

**连接握手**

除了套接字连接之外，瘦客户端协议还需要连接握手，以确保客户端和服务端版本兼容。注意握手必须是连接建立后的**第一条消息**。

对于握手消息的请求和响应数据结构，可以看上面的握手章节。

**示例**

套接字和握手连接：
```java
Socket socket = new Socket();
socket.connect(new InetSocketAddress("127.0.0.1", 10800));

String username = "yourUsername";

String password = "yourPassword";

DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Message length
writeIntLittleEndian(18 + username.length() + password.length(), out);

// Handshake operation
writeByteLittleEndian(1, out);

// Protocol version 1.0.0
writeShortLittleEndian(1, out);
writeShortLittleEndian(1, out);
writeShortLittleEndian(0, out);

// Client code: thin client
writeByteLittleEndian(2, out);

// username
writeString(username, out);

// password
writeString(password, out);

// send request
out.flush();

// Receive handshake response
DataInputStream in = new DataInputStream(socket.getInputStream());
int length = readIntLittleEndian(in);
int successFlag = readByteLittleEndian(in);

// Since Ignite binary protocol uses little-endian byte order,
// we need to implement big-endian to little-endian
// conversion methods for write and read.

// Write int in little-endian byte order
private static void writeIntLittleEndian(int v, DataOutputStream out) throws IOException {
  out.write((v >>> 0) & 0xFF);
  out.write((v >>> 8) & 0xFF);
  out.write((v >>> 16) & 0xFF);
  out.write((v >>> 24) & 0xFF);
}

// Write short in little-endian byte order
private static final void writeShortLittleEndian(int v, DataOutputStream out) throws IOException {
  out.write((v >>> 0) & 0xFF);
  out.write((v >>> 8) & 0xFF);
}

// Write byte in little-endian byte order
private static void writeByteLittleEndian(int v, DataOutputStream out) throws IOException {
  out.writeByte(v);
}

// Read int in little-endian byte order
private static int readIntLittleEndian(DataInputStream in) throws IOException {
  int ch1 = in.read();
  int ch2 = in.read();
  int ch3 = in.read();
  int ch4 = in.read();
  if ((ch1 | ch2 | ch3 | ch4) < 0)
    throw new EOFException();
  return ((ch4 << 24) + (ch3 << 16) + (ch2 << 8) + (ch1 << 0));
}


// Read byte in little-endian byte order
private static byte readByteLittleEndian(DataInputStream in) throws IOException {
  return in.readByte();
}

// Other write and read methods
```
#### 8.1.5.客户端操作
握手成功之后，客户端就可以执行各种缓存操作了。

 - 键-值查询；
 - SQL和扫描查询；
 - 二进制类型操作；
 - 缓存配置操作。

### 8.2.数据格式
标准数据类型表示为类型代码和值的组合。

|字段|长度（字节）|描述|
|---|---|---|
|`type_code`|1|有符号的单字节整数代码，表示值的类型。|
|`value`|可变长度|值本身，类型和大小取决于`type_code`|

下面会详细描述支持的类型及其格式。

#### 8.2.1.基础类型
基础类型都是非常基本的类型，比如数值类型。

**Byte**

|字段|长度（字节）|描述|
|---|---|---|
|`Type`|1|1|
|`Value`|1|单字节值|

**Short**

类型代码：2

2字节有符号长整形数值，小端字节顺序。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`Value`|2|值|

**Int**

类型代码：3

4字节有符号长整形数值，小端字节顺序。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`Value`|4|值|

**Long**

类型代码：4

8字节有符号长整形数值，小端字节顺序。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`Value`|8|值|

**Float**

类型代码：5

4字节IEEE 754长浮点数值，小端字节顺序。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`Value`|4|值|

**Double**

类型代码：6

8字节IEEE 754长浮点数值，小端字节顺序。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`Value`|8|值|

**Char**

类型代码：7

单UTF-16代码单元，小端字节顺序。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`Value`|2|UTF-16代码单元，小端字节顺序|

**Bool**

类型代码：8

布尔值，0为`false`，非零为`true`。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`Value`|1|0为`false`，非零为`true`|

**NULL**

类型代码：101

这不是一个确切的类型，只是一个空值，可以分配给任何类型的对象。

没有实际内容，只有类型代码。

#### 8.2.2.标准对象

**String**

类型代码：9

UTF-8编码的字符串，必须是有效的UTF-8编码的字符串。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`length`|4|低位优先的有符号整数，字符串的长度，以UTF-8代码单位表示，即字节|
|`data`|`length`|无BOM的UTF-8编码的字符串数据|

**UUID（Guid）**

类型代码：10

一个统一唯一标识符（UUID）是一个128为的数值，用于在计算机系统中标识信息。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`most_significant_bits`|8|低位优先的64位字节数值，表示UUID的64个最高有效位。|
|`least_significant_bits`|8|低位优先的64位字节数值，表示UUID的64个最低有效位。|

**Timestamp**

类型代码：33

比`Date`数据类型更精确。除了从epoch开始的毫秒外，包含最后一毫秒的纳秒部分，该值范围在0到999999之间。这意味着，可以通过以下表达式获得以纳秒为单位的完整时间戳：`msecs_since_epoch \* 1000000 + msec_fraction_in_nsecs`。

::: warning 注意
纳秒时间戳计算表达式仅供评估之用。在生产中不应该使用该表达式，因为在某些语言中，表达式可能导致整数溢出。
:::

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`msecs_since_epoch`|8|低位优先的有符号整形值，该值为从`00:00:00 1 Jan 1970 UTC`开始过去的毫秒数，这个格式通常称为Unix或者POSIX时间。|
|`msec_fraction_in_nsecs`|4|低位优先的有符号整形值，一个毫秒的纳秒部分。|

**Date**

类型代码：11

日期，该值为从`00:00:00 1 Jan 1970 UTC`开始过去的毫秒数，这个格式通常称为Unix或者POSIX时间。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`msecs_since_epoch`|8|低位优先的有符号整形值。|

**Time**

类型代码：36

时间，表示为从午夜（即00:00:00 UTC）起经过的毫秒数。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`value`|8|低位优先的有符号整形值，表示为从`00:00:00 UTC`起经过的毫秒数。|

**Decimal**

类型代码：30

任何所需精度和比例的数值。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`scale`|4|低位优先的有符号整形值，实际为十的幂，在此基础上原值要做除法，比如，比例为3的42为0.042，比例为-3的42为42000，比例为1的42为42。|
|`length`|4|低位优先的有符号整形值，数字的长度（字节）。|
|`data`|`length`|第一位是负数标志。如果为1，则值为负数。其它位以高位优先格式的有符号的变长整数。|

**Enum**

类型代码：28

枚举类型值，这些类型只定义了有限数量的命名值。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`type_id`|4|低位优先的有符号整形值，具体可以看下面的`Type ID`。|
|`ordinal`|4|低位优先的有符号整形值，枚举值序号。它在枚举声明中的位置，初始常数为0。|

#### 8.2.3.基础类型数组
这种数组只包含值（元素）的内容，它们类型类似，具体可以看下表的格式描述。注意数组只包含内容，没有类型代码。

|字段|长度（字节）|描述|
|---|---|---|
|`length`|4|有符号整数，数组中元素的个数。|
|`element_0_payload`|依赖于类型|元素0的内容。|
|`element_1_payload`|依赖于类型|元素1的内容。|
|`element_N_payload`|依赖于类型|元素N的内容。|

**Byte数组**

类型代码：12

字节数组。可以是一段原始数据，也可以是一组小的有符号整数。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`length`|4|有符号整数，数组里的元素个数|
|`elements`|`length`|元素序列。每个元素都是`byte`类型。|

**Short数组**

类型代码：13

有符号短整形数值数组。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`length`|4|有符号整数，数组里的元素个数|
|`elements`|`length` × 2|元素序列。每个元素都是`short`类型。|

**Int数组**

类型代码：14

有符号整形数值数组。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`length`|4|有符号整数，数组里的元素个数|
|`elements`|`length` × 4|元素序列。每个元素都是`int`类型。|

**Long数组**

类型代码：15

有符号长整形数值数组。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`length`|4|有符号整数，数组里的元素个数|
|`elements`|`length` × 8|元素序列。每个元素都是`long`类型。|

**Float数组**

类型代码：16

浮点型数值数组。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`length`|4|有符号整数，数组里的元素个数|
|`elements`|`length` × 4|元素序列。每个元素都是`float`类型。|

**Double数组**

类型代码：17

双精度浮点型数值数组。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`length`|4|有符号整数，数组里的元素个数|
|`elements`|`length` × 8|元素序列。每个元素都是`double`类型。|

**Char数组**

类型代码：18

UTF-16编码单元数组。和`String`不同，此类型不是必须包含有效的UTF-16文本。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`length`|4|有符号整数，数组里的元素个数|
|`elements`|`length` × 2|元素序列。每个元素都是`char`类型。|

**Bool数组**

类型代码：19

布尔值数组。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`length`|4|有符号整数，数组里的元素个数|
|`elements`|`length`|元素序列。每个元素都是`bool`类型。|

#### 8.2.4.标准对象数组
这种数组包含完整值（元素）的内容，这意味着，数组的元素包含类型代码和内容。此格式允许元素为`NULL`值。这就是它们被称为“对象”的原因。它们都有相似的格式，具体可以看下表的格式描述。

|字段|长度（字节）|描述|
|---|---|---|
|`length`|4|有符号整数，数组中元素的个数。|
|`element_0_full_value`|依赖于值类型|元素0的完整值，包含类型代码和内容，可以为`NULL`。|
|`element_1_full_value`|依赖于值类型|元素1的完整值或`NULL`。|
|`element_N_full_value`|依赖于值类型|元素N的完整值或`NULL`。|

**String数组**

类型代码：20

UTF-8字符串数组。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`length`|4|有符号整数，数组里的元素个数|
|`elements`|可变长度，取决于每个字符串的长度，对于每个元素，字符串为`5 + 值长度`，`NULL`为`1`|元素序列。每个元素都是`string`类型的完整值，包括类型代码，或者`NULL`。|

**UUID（Guid）数组**

类型代码：21

UUID（Guid）数组。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`length`|4|有符号整数，数组里的元素个数|
|`elements`|可变长度，对于每个元素，UUID为`17`，`NULL`为`1`|元素序列。每个元素都是`uuid`类型的完整值，包括类型代码，或者`NULL`。|

**Timestamp数组**

类型代码：34

时间戳数组。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`length`|4|有符号整数，数组里的元素个数|
|`elements`|可变长度，对于每个元素，Timestamp为`13`，`NULL`为`1`|元素序列。每个元素都是`timestamp`类型的完整值，包括类型代码，或者`NULL`。|

**Date数组**

类型代码：22

日期数组。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`length`|4|有符号整数，数组里的元素个数|
|`elements`|可变长度，对于每个元素，Date为`9`，`NULL`为`1`|元素序列。每个元素都是`date`类型的完整值，包括类型代码，或者`NULL`。|

**Time数组**

类型代码：37

时间数组。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`length`|4|有符号整数，数组里的元素个数|
|`elements`|可变长度，对于每个元素，Time为`9`，`NULL`为`1`|元素序列。每个元素都是`time`类型的完整值，包括类型代码，或者`NULL`。|

**Decimal数组**

类型代码：31

数值数组。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`length`|4|有符号整数，数组里的元素个数|
|`elements`|可变长度，对于每个元素，数值为`9 + 值长度`，`NULL`为`1`|元素序列。每个元素都是`decimal`类型的完整值，包括类型代码，或者`NULL`。|

#### 8.2.5.对象集合
**对象数组**

类型代码：23

任意类型对象数组。包括任意类型的标准对象、以及各种类型的复杂对象、`NULL`值及其它们的任意组合，这也意味着，集合可以包含其它的集合。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`type_id`|4|包含对象的类型描述符，比如，Java中这个类型会用于反序列化为`Type[]`，显然，数组中的所有对象都应该有个`Type`作为父类型，这是任意对象类型的父类型。比如，在Java中是`java.lang.Object`，这样的`根`对象类型的Type ID为`-1`，具体下面会详述。|
|`length`|4|有符号整数，数组里的元素个数|
|`elements`|可变长度，取决于对象的长度|元素序列。每个元素都是任意类型的完整值，或者`NULL`。|

**集合**

类型代码：24

通用集合类型，和对象数组一样，包含对象，但是和数组不同，它有一个针对特定类型反序列化到平台特定集合的提示，不仅仅是个数组，它支持下面的集合类型：

 - `USER_SET`：-1，这是常规集合类型，无法映射到更具体的集合类型。不过，众所周知，它是固定的。将这样的集合反序列化为平台上基本和更广泛使用的集合类型是有意义的，例如哈希集合；
 - `USER_COL`：0，这是常规集合类型，无法映射到更具体的集合类型。将这样的集合反序列化为平台上基本和更广泛使用的集合类型是有意义的，例如可变大小数组；
 - `ARR_LIST`：1，这实际上是一种可变大小的数组类型；
 - `LINKED_LIST`：2，这是链表类型；
 - `HASH_SET`：3，这是基本的哈希集合类型；
 - `LINKED_HASH_SET`：4，这是一个哈希集合类型，会维护元素的顺序；
 - `SINGLETON_LIST`：5，这是一个只有一个元素的集合，可供平台用于优化目的。如果不适用，则可以使用任何集合类型。

::: tip 注意
集合类型字节用作将集合反序列化为特定平台最合适类型的提示。例如在Java中，`HASH_SET`会反序列化为`java.util.HashSet`，而`LINKED_HASH_SET`会反序列化为`java.util.LinkedHashSet`。建议瘦客户端实现在序列化和反序列化时尝试使用最合适的集合类型。但是，这只是一个提示，如果它与平台无关或不适用，可以忽略它。
:::

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`length`|4|有符号整数，数组里的元素个数|
|`type`|1|集合的类型|
|`elements`|可变长度，取决于对象的大小|元素序列。每个元素都是任意类型的完整值，或者`NULL`。|

**映射**

类型代码：25

类似Map的集合类型，包含成对的键和值对象，键和值可以为任意类型的对象，包括各种类型的标准对象、复杂对象以及组合对象。包含一个反序列化到具体Map类型的提示，支持下面的Map类型：

 - `HASH_MAP`：1，这是基本的哈希映射；
 - `LINKED_HASH_MAP`：2，这也是一个哈希映射，但是会维护元素的顺序。

::: tip 注意
映射类型字节用作将集合反序列化为特定平台最合适类型的提示。建议瘦客户端实现在序列化和反序列化时尝试使用最合适的集合类型。但是，这只是一个提示，如果它与平台无关或不适用，可以忽略它。
:::

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`length`|4|有符号整数，数组里的元素个数|
|`type`|1|集合的类型|
|`elements`|可变长度，取决于对象的大小|元素序列。这里的元素都有键和值，成对出现，每个元素都是任意类型的完整值或者`NULL`。|

**枚举数组**

类型代码：29

枚举类型值数组，元素要么是枚举类型值，要么是NULL，所以，任意元素要么占用9字节，要么1字节。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`type_id`|4|包含对象的类型描述符，比如，Java中这个类型会用于反序列化为`EnumType[]`，显然，数组中的所有对象都应该有个`EnumType`作为父类型，这是任意枚举对象类型的父类型，具体下面会详述。|
|`length`|4|有符号整数，数组里的元素个数|
|`elements`|可变长度，取决于对象的长度|元素序列。每个元素都是枚举类型的完整值，或者`NULL`。|

#### 8.2.6.复杂对象
类型代码：103

复杂对象由一个24位的头、一组字段（数据对象）以及一个模式（字段ID和位置）组成。根据操作和数据模型，一个数据对象可以为一个基础类型或者复杂类型（一组字段）。

结构：

|字段|长度（字节）|是否必须|
|---|---|---|
|`version`|1|是|
|`flags`|2|是|
|`type_id`|4|是|
|`hash_code`|4|是|
|`length`|4|是|
|`schema_id`|4|是|
|`object_fields`|可变长度|否|
|`schema`|可变长度|否|
|`raw_data_offset`|4|否|

**version**

这是一个字段，指示复杂对象布局的版本。它是必须向后兼容的。客户端应该检查这个字段并向用户指出错误（如果不知道对象布局版本），以防止数据损坏和不可预知的反序列化结果。

**flags**

这个字段是16位的低位优先的掩码。包含对象标志，该标志指示读取器应如何处理对象实例。有以下标志：

 - `USER_TYPE = 0x0001`：表示类型是用户类型，应始终为任何客户端类型设置，在反序列化时可以忽略；
 - `HAS_SCHEMA = 0x0002`：表示对象布局在尾部是否包含模式；
 - `HAS_RAW_DATA = 0x0004`：表示对象是否包含原始数据；
 - `OFFSET_ONE_BYTE = 0x0008`：表示模式字段偏移量为一个字节长度；
 - `OFFSET_TWO_BYTES = 0x0010`：表示模式字段偏移量为二个字节长度；
 - `COMPACT_FOOTER = 0x0020`：表示尾部不包含字段ID，只有偏移量。

**type_id**

此字段包含唯一的类型标识符。它是低位优先的4个字节长度。默认情况下，`Type ID`是通过类型名称的Java风格的哈希值获得的。`Type ID`评估算法应该在集群中的所有平台上都相同，以便所有平台都能够使用此类型的对象进行操作。下面是所有瘦客户端推荐使用的默认`Type ID`计算算法：

<Tabs>
<Tab title="Java">

```java
static int hashCode(String str) {
  int len = str.length;

  int h = 0;

  for (int i = 0; i < len; i++) {
    int c = str.charAt(i);

    c = Character.toLowerCase(c);

    h = 31 * h + c;
  }

  return h;
}
```
</Tab>

<Tab title="C">

```cpp
int32_t HashCode(const char* val, size_t size)
{
  if (!val && size == 0)
    return 0;

  int32_t hash = 0;

  for (size_t i = 0; i < size; ++i)
  {
    char c = val[i];

    if ('A' <= c && c <= 'Z')
      c |= 0x20;

    hash = 31 * hash + c;
  }

  return hash;
}
```
</Tab>

</Tabs>

**hash_code**

值的哈希编码，它是低位优先的4字节长度，它由不包含头部的内容部分的Java风格的哈希编码计算得来，Ignite引擎用来作比较用，比如用作键的比较。下面是哈希值的计算算法：

<Tabs>
<Tab title="Java">

```java
static int dataHashCode(byte[] data) {
  int len = data.length;

  int h = 0;

  for (int i = 0; i < len; i++)
    h = 31 * h + data[i];

  return h;
}
```
</Tab>

<Tab title="C">

```cpp
int32_t GetDataHashCode(const void* data, size_t size)
{
  if (!data)
    return 0;

  int32_t hash = 1;
  const int8_t* bytes = static_cast<const int8_t*>(data);

  for (int i = 0; i < size; ++i)
    hash = 31 * hash + bytes[i];

  return hash;
}
```
</Tab>

</Tabs>

**length**

这个字段为对象（包括头部）的整体长度，它为低位优先的4字节整型值，通过在当前数据流的位置上简单地增加本字段值的偏移量，可以轻易地忽略整个对象。

**schema_id**

对象模式标识符。它为低位优先4字节值，并由所有对象字段ID的哈希值计算得出。它用于复杂的对象大小优化。Ignite使用`schema_id`来避免将整个模式写入到每个复杂对象值的末尾。相反，它将所有模式存储在二进制元数据存储中，并且只向对象写入字段偏移量。这种优化有助于显著减少包含许多短字段（如整型值）的复杂对象的大小。

如果模式缺失（例如，以原始模式写入整个对象，或者没有任何字段），则`schema_id`字段为0。

::: tip 注意
无法使用`type_id`确定`schema_id`，因为具有相同`type_id`的对象可以具有多个模式，即字段序列。
:::

`schema_id`的计算算法如下：

<Tabs>
<Tab title="Java">

```java
/** FNV1 hash offset basis. */
private static final int FNV1_OFFSET_BASIS = 0x811C9DC5;

/** FNV1 hash prime. */
private static final int FNV1_PRIME = 0x01000193;

static int calculateSchemaId(int fieldIds[])
{
  if (fieldIds == null || fieldIds.length == 0)
    return 0;

  int len = fieldIds.length;

  int schemaId = FNV1_OFFSET_BASIS;

  for (size_t i = 0; i < len; ++i)
  {
    fieldId = fieldIds[i];

    schemaId = schemaId ^ (fieldId & 0xFF);
    schemaId = schemaId * FNV1_PRIME;
    schemaId = schemaId ^ ((fieldId >> 8) & 0xFF);
    schemaId = schemaId * FNV1_PRIME;
    schemaId = schemaId ^ ((fieldId >> 16) & 0xFF);
    schemaId = schemaId * FNV1_PRIME;
    schemaId = schemaId ^ ((fieldId >> 24) & 0xFF);
    schemaId = schemaId * FNV1_PRIME;
  }
}
```
</Tab>

<Tab title="C">

```cpp
/** FNV1 hash offset basis. */
enum { FNV1_OFFSET_BASIS = 0x811C9DC5 };

/** FNV1 hash prime. */
enum { FNV1_PRIME = 0x01000193 };

int32_t CalculateSchemaId(const int32_t* fieldIds, size_t num)
{
  if (!fieldIds || num == 0)
    return 0;

  int32_t schemaId = FNV1_OFFSET_BASIS;

  for (size_t i = 0; i < num; ++i)
  {
    fieldId = fieldIds[i];

    schemaId ^= fieldId & 0xFF;
    schemaId *= FNV1_PRIME;
    schemaId ^= (fieldId >> 8) & 0xFF;
    schemaId *= FNV1_PRIME;
    schemaId ^= (fieldId >> 16) & 0xFF;
    schemaId *= FNV1_PRIME;
    schemaId ^= (fieldId >> 24) & 0xFF;
    schemaId *= FNV1_PRIME;
  }
}
```
</Tab>

</Tabs>

**object_fields**

对象字段。每个字段都是二进制对象，可以是复杂类型，也可以是标准类型。注意，一个没有任何字段的复杂对象也是有效的，可能会遇到。每个字段的名字可有可无。对于命名字段，在对象模式中会写入一个偏移量，通过该偏移量，可以在对象中将其定位，而无需对整个对象进行反序列化。没有名字的字段总是存储在命名字段之后，并以所谓的`原始模式`写入。

因此，以原始模式写入的字段只能按与写入相同的顺序通过顺序读取进行访问，而命名字段则可以按随机顺序读取。

**schema**

对象模式。复杂对象的模式可有可无，因此此字段是可选的。如果对象中没有命名字段，则对象中不存在模式。它还包括当对象根本没有字段时的情况。可以检查`HAS_SCHEMA`对象标志，以确定该对象是否具有模式。

模式的主要目的是可以对对象字段进行快速搜索。为此，模式在对象内容中包含对象字段的偏移序列。字段偏移本身的大小可能不同。这些字段的大小由最大偏移值在写入时确定。如果它在[24..255]字节范围内，则使用1字节偏移量；如果它在[256..65535]字节范围内，则使用2字节偏移量。其它情况使用4字节偏移量。要确定读取时偏移量的大小，客户端应该检查`OFFSET_ONE_BYTE`和`OFFSET_TWO_BYTES`标志。如果设置了`OFFSET_ONE_BYTE`标志，则偏移量为1字节长，否则如果设置了`OFFSET_TWO_BYTES`标志，则偏移量为2字节长，否则偏移量为4字节长。

支持的模式有两种：

 - `完整模式方式`：实现更简单，但使用更多资源；
 - `压缩尾部方式`：更难实现，但提供更好的性能并减少内存消耗，因此建议新客户端用此方式实现。

具体下面会介绍。

注意，客户端应该校验`COMPACT_FOOTER`标志，来确定每个对象应该使用哪个方式。

*完整模式方式*

如果使用这个方式，`COMPACT_FOOTER`标志未配置，然后整个对象模式会被写入对象的尾部，这时只有复杂对象自身需要反序列化（`schema_id`字段会被忽略，并且不需要其它的数据），这时复杂对象的`schema`字段的结构如下：

|字段|长度（字节）|描述|
|---|---|---|
|`field_id_0`|4|索引值为0的字段的ID，低位优先4字节，这个ID是通过字段名字用和`type_id`一样的方式计算得来的。|
|`field_offset_0`|可变长度，依赖于对象的大小：1,2或4|低位优先无符号整数，对象中字段的偏移量，从完整对象值的第一个字节开始（即`type_code`的位置）。|
|`field_id_1`|4|索引值为1的字段的ID，低位优先4字节。|
|`field_offset_1`|可变长度，依赖于对象的大小：1,2或4|低位优先无符号整数，对象中字段的偏移量。|
|`field_id_N`|4|索引值为N的字段的ID，低位优先4字节。|
|`field_offset_N`|可变长度，依赖于对象的大小：1,2或4|低位优先无符号整数，对象中字段的偏移量。|

*压缩尾部方式*

这个模式中，配置了`COMPACT_FOOTER`标志然后只有字段偏移量的序列会被写入对象的尾部。这时，客户端使用`schema_id`字段搜索以前存储的元数据中的对象模式，以查找字段顺序并将字段与其偏移量关联。

如果使用了这个方式，客户端需要在一个特定的元数据中持有模式，然后将其发送/接收给/自Ignite服务端，具体可以看[二进制类型元数据](#_8-5-二进制类型元数据)的相关章节。

这个场景中`schema`的结构如下：

|字段|长度（字节）|描述|
|---|---|---|
|`field_offset_0`|可变长度，依赖于对象的大小：1,2或4|低位优先无符号整数，对象中字段0的偏移量，从完整对象值的第一个字节开始（即`type_code`的位置）。|
|`field_offset_1`|可变长度，依赖于对象的大小：1,2或4|低位优先无符号整数，对象中字段1的偏移量。|
|`field_offset_N`|可变长度，依赖于对象的大小：1,2或4|低位优先无符号整数，对象中字段N的偏移量。|

**raw_data_offset**

可选字段。仅存在于对象中，如果有任何字段，则以原始模式写入。这时，设置了`HAS_RAW_DATA`标志并且存在原始数据偏移量字段，存储为低位优先4字节。该值指向复杂对象中的原始数据偏移量，从头部的第一个字节开始（即，此字段始终大于头部的长度）。

此字段用于用户以原始模式开始读取时对流进行定位。
#### 8.2.7.特殊类型
**包装数据**

类型代码：27

一个或多个二进制对象可以包装成一个数组，这样可以高效地读取、存储、传输和写入对象，而不需要理解它的内容，只进行简单的字节复制即可。

所有缓存操作都返回包装器内的复杂对象（不是基础类型）。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`length`|4|低位优先的4字节有符号整数，以字节计算的包装后的数据的大小。|
|`payload`|`length`|内容|
|`offset`|4|低位优先的4字节有符号整数，数组内对象的偏移量，数组内可以包含一个对象图，这个偏移量指向根对象。|

**二进制枚举**

类型代码：38

包装枚举类型，引擎可以返回此类型以替代普通枚举类型。当使用二进制API时，枚举应该以这种形式写入。

结构：

|字段|长度（字节）|描述|
|---|---|---|
|`type_id`|4|低位优先的4字节有符号整数，具体可以看`type_id`相关章节的内容。|
|`ordinal`|4|低位优先的4字节有符号整数，枚举值序号，即在枚举声明中的位置，这个序号的初始值为0|

#### 8.2.8.序列化和反序列化示例

**常规对象读**

下面的代码模板，显示了如何从输入的字节流中读取各种类型的数据：
```java
private static Object readDataObject(DataInputStream in) throws IOException {
  byte code = in.readByte();

  switch (code) {
    case 1:
      return in.readByte();
    case 2:
      return readShortLittleEndian(in);
    case 3:
      return readIntLittleEndian(in);
    case 4:
      return readLongLittleEndian(in);
    case 27: {
      int len = readIntLittleEndian(in);
      // Assume 0 offset for simplicity
      Object res = readDataObject(in);
      int offset = readIntLittleEndian(in);
      return res;
    }
    case 103:
      byte ver = in.readByte();
      assert ver == 1; // version
      short flags = readShortLittleEndian(in);
      int typeId = readIntLittleEndian(in);
      int hash = readIntLittleEndian(in);
      int len = readIntLittleEndian(in);
      int schemaId = readIntLittleEndian(in);
      int schemaOffset = readIntLittleEndian(in);
      byte[] data = new byte[len - 24];
      in.read(data);
      return "Binary Object: " + typeId;
    default:
      throw new Error("Unsupported type: " + code);
  }
}
```
**Int**

下面的代码片段显示了如何进行`int`类型的数据对象的读写，使用的是基于套接字的输出/输入流：
```java
// Write int data object
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

int val = 11;
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(val, out);

// Read int data object
DataInputStream in = new DataInputStream(socket.getInputStream());
int typeCode = readByteLittleEndian(in);
int val = readIntLittleEndian(in);
```

**String**

下面的代码片段显示了如何进行`String`类型的读写，格式如下：

|类型|描述|
|---|---|
|byte|字符串类型代码，0|
|int|UTF-8字节模式的字符串长度|
|bytes|实际字符串|

```java
private static void writeString (String str, DataOutputStream out) throws IOException {
  writeByteLittleEndian(9, out); // type code for String

  int strLen = str.getBytes("UTF-8").length; // length of the string
  writeIntLittleEndian(strLen, out);

  out.writeBytes(str);
}

private static String readString(DataInputStream in) throws IOException {
  int type = readByteLittleEndian(in); // type code

  int strLen = readIntLittleEndian(in); // length of the string

  byte[] buf = new byte[strLen];

  readFully(in, buf, 0, strLen);

  return new String(buf);
}
```
### 8.3.键-值查询
本章节会描述可以对缓存进行的键值操作，该键值操作等同于Ignite原生的缓存操作，具体可以看[IgniteCache](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/IgniteCache.html)的文档，每个操作都会有一个[头信息](#_2-1-3-消息格式)及与该操作对应的数据。

在[数据格式](#_2-2-数据格式)章节，可以参阅可用的数据类型和数据格式规范的清单。

#### 8.3.1.操作代码
与Ignite服务端节点成功握手后，客户端可以通过发送带有特定操作代码的请求（参见下面的请求/响应结构）来开始执行各种键值操作：

|操作|操作代码|
|---|---|
|`OP_CACHE_GET`|1000|
|`OP_CACHE_PUT`|1001|
|`OP_CACHE_PUT_IF_ABSENT`|1002|
|`OP_CACHE_GET_ALL`|1003|
|`OP_CACHE_PUT_ALL`|1004|
|`OP_CACHE_GET_AND_PUT`|1005|
|`OP_CACHE_GET_AND_REPLACE`|1006|
|`OP_CACHE_GET_AND_REMOVE`|1007|
|`OP_CACHE_GET_AND_PUT_IF_ABSENT`|1008|
|`OP_CACHE_REPLACE`|1009|
|`OP_CACHE_REPLACE_IF_EQUALS`|1010|
|`OP_CACHE_CONTAINS_KEY`|1011|
|`OP_CACHE_CONTAINS_KEYS`|1012|
|`OP_CACHE_CLEAR`|1013|
|`OP_CACHE_CLEAR_KEY`|1014|
|`OP_CACHE_CLEAR_KEYS`|1015|
|`OP_CACHE_REMOVE_KEY`|1016|
|`OP_CACHE_REMOVE_IF_EQUALS`|1017|
|`OP_CACHE_REMOVE_KEYS`|1018|
|`OP_CACHE_REMOVE_ALL`|1019|
|`OP_CACHE_GET_SIZE`|1020|

注意上面提到的操作代码，是请求头的一部分，具体可以看[头信息](#_2-1-3-消息格式)的相关内容。

#### 8.3.2.OP_CACHE_GET
通过键从缓存获得值，如果不存在则返回`null`。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|数据对象|要返回的缓存条目的主键|

|响应类型|描述|
|---|---|
|头信息|响应头|
|数据对象|给定主键对应的值，如果不存在则为`null`|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(10, OP_CACHE_GET, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);

// Data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key, out);   // Cache key
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting cache value (Data Object)
int resTypeCode = readByteLittleEndian(in);
int value = readIntLittleEndian(in);
```
</Tab>

</Tabs>

#### 8.3.3.OP_CACHE_GET_ALL
从一个缓存中获得多个键-值对。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|int|键数量|
|数据对象|缓存条目的主键，重复多次，次数为前一个参数传递的值|

|响应类型|描述|
|---|---|
|头信息|响应头|
|int|结果数量|
|键对象+值对象|返回的键-值对，不包含缓存中没有的条目，重复多次，次数为前一个参数返回的值|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(19, OP_CACHE_GET_ALL, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);

// Key count
writeIntLittleEndian(2, out);

// Data object 1
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key1, out);   // Cache key

// Data object 2
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key2, out);   // Cache key
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Result count
int resCount = readIntLittleEndian(in);

for (int i = 0; i < resCount; i++) {
  // Resulting data object
  int resKeyTypeCode = readByteLittleEndian(in); // Integer type code
  int resKey = readIntLittleEndian(in); // Cache key

  // Resulting data object
  int resValTypeCode = readByteLittleEndian(in); // Integer type code
  int resValue = readIntLittleEndian(in); // Cache value
}
```
</Tab>

</Tabs>

#### 8.3.4.OP_CACHE_PUT
往缓存中写入给定的键-值对（会覆盖已有的值）。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|数据对象|键|
|数据对象|值|

|响应类型|描述|
|---|---|
|头信息|响应头|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(15, OP_CACHE_PUT, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);

// Cache key data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key, out);   // Cache key

// Cache value data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(value, out);   // Cache value
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);
```
</Tab>

</Tabs>

#### 8.3.5.OP_CACHE_PUT_ALL
往缓存中写入给定的多个键-值对（会覆盖已有的值）。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|int|键-值对数量|
|键对象+值对象|键-值对，重复多次，次数为前一个参数传递的值|

|响应类型|描述|
|---|---|
|头信息|响应头|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(29, OP_CACHE_PUT_ALL, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);

// Entry Count
writeIntLittleEndian(2, out);

// Cache key data object 1
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key1, out);   // Cache key

// Cache value data object 1
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(value1, out);   // Cache value

// Cache key data object 2
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key2, out);   // Cache key

// Cache value data object 2
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(value2, out);   // Cache value
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);
```
</Tab>

</Tabs>

#### 8.3.6.OP_CACHE_CONTAINS_KEY
判断缓存中是否存在给定的键。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|数据对象|缓存条目的主键|

|响应类型|描述|
|---|---|
|头信息|响应头|
|bool|主键存在则为true，否则为false|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(10, OP_CACHE_CONTAINS_KEY, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);

// Cache key data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key, out);   // Cache key
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Result
boolean res = readBooleanLittleEndian(in);
```
</Tab>

</Tabs>

#### 8.3.7.OP_CACHE_CONTAINS_KEYS
判断缓存中是否存在给定的所有键。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|int|键数量|
|数据对象|缓存条目的主键，重复多次，次数为前一个参数传递的值|

|响应类型|描述|
|---|---|
|头信息|响应头|
|bool|主键存在则为true，否则为false|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(19, OP_CACHE_CONTAINS_KEYS, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);

//Count
writeIntLittleEndian(2, out);

// Cache key data object 1
int key1 = 11;
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key1, out);   // Cache key

// Cache key data object 2
int key2 = 22;
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key2, out);   // Cache key
```
</Tab>

<Tab title="响应">

```java

// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting boolean value
boolean res = readBooleanLittleEndian(in);
```
</Tab>

</Tabs>

#### 8.3.8.OP_CACHE_GET_AND_PUT
往缓存中插入一个键-值对，并且返回与该键对应的原值，如果缓存中没有该键，则会创建一个新的条目并返回`null`。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|数据对象|要更新的键|
|数据对象|给定键对应的新值|

|响应类型|描述|
|---|---|
|头信息|响应头|
|数据对象|给定键的原有值，或者为`null`|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(15, OP_CACHE_GET_AND_PUT, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);

// Cache key data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key, out);   // Cache key

// Cache value data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(value, out);   // Cache value
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting cache value (Data Object)
int resTypeCode = readByteLittleEndian(in);
int value = readIntLittleEndian(in);
```
</Tab>

</Tabs>

#### 8.3.9.OP_CACHE_GET_AND_REPLACE
替换缓存中给定键的值，然后返回原值，如果缓存中该键不存在，该操作会返回`null`而缓存不会有改变。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|数据对象|要更新的键|
|数据对象|给定键对应的新值|

|响应类型|描述|
|---|---|
|头信息|响应头|
|数据对象|给定键的原有值，如果该键不存在则为`null`|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(15, OP_CACHE_GET_AND_REPLACE, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);

// Cache key data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key, out);   // Cache key

// Cache value data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(value, out);   // Cache value
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting cache value (Data Object)
int resTypeCode = readByteLittleEndian(in);
int value = readIntLittleEndian(in);
```
</Tab>

</Tabs>

#### 8.3.10.OP_CACHE_GET_AND_REMOVE
删除缓存中给定键对应的数据，然后返回原值，如果缓存中该键不存在，该操作会返回`null`。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|数据对象|要删除的键|

|响应类型|描述|
|---|---|
|头信息|响应头|
|数据对象|给定键的原有值，如果该键不存在则为`null`|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(10, OP_CACHE_GET_AND_REMOVE, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);

// Cache key data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key, out);   // Cache key
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting cache value (Data Object)
int resTypeCode = readByte(in);
int value = readInt(in);
```
</Tab>

</Tabs>

#### 8.3.11.OP_CACHE_PUT_IF_ABSENT
在条目不存在时插入一个新的条目。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|数据对象|要插入的键|
|数据对象|给定键对应的值|

|响应类型|描述|
|---|---|
|头信息|响应头|
|bool|插入成功为`true`，条目已存在为`false`|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(15, OP_CACHE_PUT_IF_ABSENT, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);

// Cache key data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key, out);   // Cache key

// Cache value data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(value, out);   // Cache Value
```
</Tab>

<Tab title="响应">

```java
 // Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting boolean value
boolean res = readBooleanLittleEndian(in);
```
</Tab>

</Tabs>

#### 8.3.12.OP_CACHE_GET_AND_PUT_IF_ABSENT
在条目不存在时插入一个新的条目，否则返回已有的值。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|数据对象|要插入的键|
|数据对象|给定键对应的值|

|响应类型|描述|
|---|---|
|头信息|响应头|
|数据对象|如果缓存没有该条目则返回`null`（这时会创建一个新条目），或者返回给定键对应的已有值。|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(15, OP_CACHE_GET_AND_PUT_IF_ABSENT, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);

// Cache key data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key, out);   // Cache key

// Cache value data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(value, out);   // Cache value
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting cache value (Data Object)
int resTypeCode = readByteLittleEndian(in);
int value = readIntLittleEndian(in);
```
</Tab>

</Tabs>

#### 8.3.13.OP_CACHE_REPLACE
替换缓存中已有键的值。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|数据对象|键|
|数据对象|给定键对应的值|

|响应类型|描述|
|---|---|
|头信息|响应头|
|bool|表示是否替换成功|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(15, OP_CACHE_REPLACE, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);

// Cache key data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key, out);   // Cache key

// Cache value data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(value, out);   // Cache value
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

boolean res = readBooleanLittleEndian(in);
```
</Tab>

</Tabs>

#### 8.3.14.OP_CACHE_REPLACE_IF_EQUALS
当在缓存中给定的键已存在且值等于给定的值时，才会用新值替换旧值。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|数据对象|键|
|数据对象|用于和给定的键对应的值做比较的值|
|数据对象|给定键对应的值|

|响应类型|描述|
|---|---|
|头信息|响应头|
|bool|表示是否替换成功|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(20, OP_CACHE_REPLACE_IF_EQUALS, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);

// Cache key data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key, out);   // Cache key

// Cache value data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(value, out);   // Cache value to compare

// Cache value data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(newValue, out);   // New cache value
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

boolean res = readBooleanLittleEndian(in);
```
</Tab>

</Tabs>

#### 8.3.15.OP_CACHE_CLEAR
清空缓存而不通知监听器或者缓存写入器，具体可以看对应方法的[文档](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/IgniteCache.html#clear--)。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|

|响应类型|描述|
|---|---|
|头信息|响应头|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(5, OP_CACHE_CLEAR, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);
```
</Tab>

</Tabs>

#### 8.3.16.OP_CACHE_CLEAR_KEY
清空缓存键而不通知监听器或者缓存写入器，具体可以看对应方法的[文档](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/IgniteCache.html#clear-K-)。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|数据对象|缓存条目的键|

|响应类型|描述|
|---|---|
|头信息|响应头|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(10, OP_CACHE_CLEAR_KEY, 1, out);;

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);

// Cache key data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key, out);   // Cache key
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);
```
</Tab>

</Tabs>

#### 8.3.17.OP_CACHE_CLEAR_KEYS
清空缓存的多个键而不通知监听器或者缓存写入器，具体可以看对应方法的[文档](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/IgniteCache.html#clearAll-java.util.Set-)。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|int|键数量|
|数据对象×键数量|缓存条目的键|

|响应类型|描述|
|---|---|
|头信息|响应头|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(19, OP_CACHE_CLEAR_KEYS, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);

// key count
writeIntLittleEndian(2, out);

// Cache key data object 1
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key1, out);   // Cache key

// Cache key data object 2
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key2, out);   // Cache key
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);
```
</Tab>

</Tabs>

#### 8.3.18.OP_CACHE_REMOVE_KEY
删除给定键对应的数据，通知监听器和缓存的写入器，具体可以看相关方法的[文档](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/IgniteCache.html#remove-K-)。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|数据对象|键|

|响应类型|描述|
|---|---|
|头信息|响应头|
|bool|表示是否删除成功|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(10, OP_CACHE_REMOVE_KEY, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);

// Cache key data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key1, out);   // Cache key
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting boolean value
boolean res = readBooleanLittleEndian(in);
```
</Tab>

</Tabs>

#### 8.3.19.OP_CACHE_REMOVE_IF_EQUALS
当给定的值等于当前值时，删除缓存中给定键对应的条目，然后通知监听器和缓存写入器。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|数据对象|要删除条目的键|
|数据对象|用于和当前值比较的值|

|响应类型|描述|
|---|---|
|头信息|响应头|
|bool|表示是否删除成功|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(15, OP_CACHE_REMOVE_IF_EQUALS, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);

// Cache key data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key, out);   // Cache key

// Cache value data object
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(value, out);   // Cache value
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting boolean value
boolean res = readBooleanLittleEndian(in);
```
</Tab>

</Tabs>

#### 8.3.20.OP_CACHE_GET_SIZE
获取缓存条目的数量，该方法等同于[IgniteCache.size(CachePeekMode... peekModes)](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/IgniteCache.html#size-org.apache.ignite.cache.CachePeekMode...-)。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|int|要请求的PEEK模式数值。当设置为0时，将使用`CachePeekMode.ALL`。当设置为正值时，需要在以下字段中指定应计数的条目类型：全部、备份、主或近缓存条目。|
|byte|表示要统计哪种类型的条目：0：所有，1：近缓存条目，2：主条目，3：备份条目，该字段的重复次数应等于上一个参数的值|

|响应类型|描述|
|---|---|
|头信息|响应头|
|long|缓存大小|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(10, OP_CACHE_GET_SIZE, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);

// Peek mode count; '0' means All
writeIntLittleEndian(0, out);

// Peek mode
writeByteLittleEndian(0, out);
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Number of entries in cache
long cacheSize = readLongLittleEndian(in);
```
</Tab>

</Tabs>

#### 8.3.21.OP_CACHE_REMOVE_KEYS
删除给定键对应的条目，通知监听器和缓存写入器，具体可以看相关方法的[文档](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/IgniteCache.html#removeAll-java.util.Set-)。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|int|要删除的键数量|
|数据对象|要删除条目的键，如果该键不存在，则会被忽略，该字段必须提供，重复次数为前一个参数的值|

|响应类型|描述|
|---|---|
|头信息|响应头|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(19, OP_CACHE_REMOVE_KEYS, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);

// key count
writeIntLittleEndian(2, out);

// Cache key data object 1
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key1, out);   // Cache key

// Cache value data object 2
writeByteLittleEndian(3, out);  // Integer type code
writeIntLittleEndian(key2, out);   // Cache key
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting cache value (Data Object)
int resTypeCode = readByte(in);
int value = readInt(in);
```
</Tab>

</Tabs>

#### 8.3.22.OP_CACHE_REMOVE_ALL
从缓存中删除所有的条目，通知监听器和缓存写入器，具体可以看相关方法的[文档](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/IgniteCache.html#removeAll--)。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|

|响应类型|描述|
|---|---|
|头信息|响应头|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(5, OP_CACHE_REMOVE_ALL, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response length
final int len = readIntLittleEndian(in);

// Request id
long resReqId = readLongLittleEndian(in);

// Success
int statusCode = readIntLittleEndian(in);
```
</Tab>

</Tabs>

### 8.4.SQL和扫描查询
#### 8.4.1.操作代码
与Ignite服务端节点成功握手后，客户端就可以通过发送带有特定操作代码的请求（请参见下面的请求/响应结构）来执行各种SQL和扫描查询了：

|操作|操作代码|
|---|---|
|`OP_QUERY_SQL`|2002|
|`OP_QUERY_SQL_CURSOR_GET_PAGE`|2003|
|`OP_QUERY_SQL_FIELDS`|2004|
|`OP_QUERY_SQL_FIELDS_CURSOR_GET_PAGE`|2005|
|`OP_QUERY_SCAN`|2000|
|`OP_QUERY_SCAN_CURSOR_GET_PAGE`|2001|
|`OP_RESOURCE_CLOSE`|0|

注意上面提到的操作代码，是请求头的一部分，具体可以看[头信息](#_2-1-3-消息格式)的相关内容。
#### 8.4.2.OP_QUERY_SQL
在集群存储的数据中执行SQL查询，查询会返回所有的结果集（键-值对）。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|string|类型或者SQL表名|
|string|SQL查询字符串|
|int|查询参数个数|
|数据对象|查询参数，重复多次，次数为前一个参数传递的值|
|bool|分布式关联标志|
|bool|本地查询标志|
|bool|复制标志，查询是否只包含复制表|
|int|游标页面大小|
|long|超时时间（毫秒），应该为非负值，值为0会禁用超时功能|

响应只包含第一页的结果。

|响应类型|描述|
|---|---|
|头信息|响应头|
|long|游标ID，可以被`OP_RESOURSE_CLOSE`关闭|
|int|第一页的行数|
|键数据对象+值数据对象|键-值对形式的记录，重复多次，次数为前一个参数返回的行数值|
|bool|指示是否有更多结果可通过`OP_QUERY_SQL_CURSOR_GET_PAGE`获取。如果为false，则查询游标将自动关闭。|

<Tabs>
<Tab title="请求">

```java
String entityName = "Person";
int entityNameLength = getStrLen(entityName); // UTF-8 bytes

String sql = "Select * from Person";
int sqlLength = getStrLen(sql);

DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(34 + entityNameLength + sqlLength, OP_QUERY_SQL, 1, out);

// Cache id
String queryCacheName = "personCache";
writeIntLittleEndian(queryCacheName.hashCode(), out);

// Flag = none
writeByteLittleEndian(0, out);

// Query Entity
writeString(entityName, out);

// SQL query
writeString(sql, out);

// Argument count
writeIntLittleEndian(0, out);

// Joins
out.writeBoolean(false);

// Local query
out.writeBoolean(false);

// Replicated
out.writeBoolean(false);

// cursor page size
writeIntLittleEndian(1, out);

// Timeout
writeLongLittleEndian(5000, out);
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

long cursorId = readLongLittleEndian(in);

int rowCount = readIntLittleEndian(in);

// Read entries (as user objects)
for (int i = 0; i < rowCount; i++) {
  Object key = readDataObject(in);
  Object val = readDataObject(in);

  System.out.println("CacheEntry: " + key + ", " + val);
}

boolean moreResults = readBooleanLittleEndian(in);
```
</Tab>

</Tabs>

#### 8.4.3.OP_QUERY_SQL_CURSOR_GET_PAGE
通过`OP_QUERY_SQL`的游标ID，查询下一个游标页。

|请求类型|描述|
|---|---|
|头信息|请求头|
|long|游标ID|

|响应类型|描述|
|---|---|
|头信息|响应头|
|long|游标ID|
|int|行数|
|键数据对象+值数据对象|键-值对形式的记录，重复多次，次数为前一个参数返回的行数值|
|bool|指示是否有更多结果可通过`OP_QUERY_SQL_CURSOR_GET_PAGE`获取。如果为false，则查询游标将自动关闭。|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(8, OP_QUERY_SQL_CURSOR_GET_PAGE, 1, out);

// Cursor Id (received from Sql query operation)
writeLongLittleEndian(cursorId, out);
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

int rowCount = readIntLittleEndian(in);

// Read entries (as user objects)
for (int i = 0; i < rowCount; i++){
  Object key = readDataObject(in);
  Object val = readDataObject(in);

  System.out.println("CacheEntry: " + key + ", " + val);
}

boolean moreResults = readBooleanLittleEndian(in);
```
</Tab>

</Tabs>

#### 8.4.4.OP_QUERY_SQL_FIELDS
执行SQLFieldQuery。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|string|查询的模式，可以为空，默认为`PUBLIC`模式|
|int|查询游标页面大小|
|int|最大行数|
|string|SQL|
|int|参数个数|
|数据对象|重复多次，重复次数为前一个参数值|
|byte|语句类型。ANY：0，SELECT：1，UPDATE：2|
|bool|分布式关联标志|
|bool|本地查询标志|
|bool|复制标志，查询涉及的表是否都为复制表|
|bool|是否强制关联的顺序|
|bool|数据是否并置标志|
|bool|是否延迟查询的执行|
|long|超时（毫秒）|
|bool|是否包含字段名|

|响应类型|描述|
|---|---|
|头信息|响应头|
|long|游标ID，可以被`OP_RESOURCE_CLOSE`关闭|
|int|字段（列）数量|
|string（可选）|*只有请求中的`IncludeFieldNames`标志为true时才是必须的*，列名，重复多次，重复次数为前一个参数的值|
|int|第一页行数|
|数据对象|字段（列）值，字段个数重复次数为前述字段数量参数值，行数重复次数为前一个参数的值|
|bool|表示是否还可以通过`OP_QUERY_SQL_FIELDS_CURSOR_GET_PAGE`获得更多结果|

<Tabs>
<Tab title="请求">

```java
String sql = "Select id, salary from Person";
int sqlLength = sql.getBytes("UTF-8").length;

String sqlSchema = "PUBLIC";
int sqlSchemaLength = sqlSchema.getBytes("UTF-8").length;

DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(43 + sqlLength + sqlSchemaLength, OP_QUERY_SQL_FIELDS, 1, out);

// Cache id
String queryCacheName = "personCache";
int cacheId = queryCacheName.hashCode();
writeIntLittleEndian(cacheId, out);

// Flag = none
writeByteLittleEndian(0, out);

// Schema
writeByteLittleEndian(9, out);
writeIntLittleEndian(sqlSchemaLength, out);
out.writeBytes(sqlSchema); //sqlSchemaLength

// cursor page size
writeIntLittleEndian(2, out);

// Max Rows
writeIntLittleEndian(5, out);

// SQL query
writeByteLittleEndian(9, out);
writeIntLittleEndian(sqlLength, out);
out.writeBytes(sql);//sqlLength

// Argument count
writeIntLittleEndian(0, out);

// Statement type
writeByteLittleEndian(1, out);

// Joins
out.writeBoolean(false);

// Local query
out.writeBoolean(false);

// Replicated
out.writeBoolean(false);

// Enforce join order
out.writeBoolean(false);

// collocated
out.writeBoolean(false);

// Lazy
out.writeBoolean(false);

// Timeout
writeLongLittleEndian(5000, out);

// Replicated
out.writeBoolean(false);
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

long cursorId = readLongLittleEndian(in);

int colCount = readIntLittleEndian(in);

int rowCount = readIntLittleEndian(in);

// Read entries
for (int i = 0; i < rowCount; i++) {
  long id = (long) readDataObject(in);
  int salary = (int) readDataObject(in);

  System.out.println("Person id: " + id + "; Person Salary: " + salary);
}

boolean moreResults = readBooleanLittleEndian(in);
```
</Tab>

</Tabs>

#### 8.4.5.OP_QUERY_SQL_FIELDS_CURSOR_GET_PAGE
通过`OP_QUERY_SQL_FIELDS`的游标ID，获取下一页的查询结果。

|请求类型|描述|
|---|---|
|头信息|请求头|
|long|从`OP_QUERY_SQL_FIELDS`获取的游标ID|

|响应类型|描述|
|---|---|
|头信息|响应头|
|int|行数|
|数据对象|字段（列）值，字段个数重复次数为前述字段数量参数值，行数重复次数为前一个参数的值|
|bool|指示是否有更多结果可通过`OP_QUERY_SQL_FIELDS_CURSOR_GET_PAGE`获取。|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(8, QUERY_SQL_FIELDS_CURSOR_GET_PAGE, 1, out);

// Cursor Id
writeLongLittleEndian(1, out);
```
</Tab>

<Tab title="响应">

```java
 // Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

int rowCount = readIntLittleEndian(in);

// Read entries (as user objects)
for (int i = 0; i < rowCount; i++){
   // read data objects * column count.
}

boolean moreResults = readBooleanLittleEndian(in);
```
</Tab>

</Tabs>

#### 8.4.6.OP_QUERY_SCAN
执行扫描查询。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|标志，`0`为默认值，或者`1`为保持值的二进制形式|
|数据对象|过滤器对象，如果不打算在集群中过滤数据可以为`null`，过滤器类应该加入服务端节点的类路径中|
|byte|过滤器平台。JAVA：1，DOTNET：2，CPP：3，过滤器对象非空时，需要这个参数|
|int|游标页面大小|
|int|要查询的分区数（对于查询整个缓存为负数）|
|bool|本地标志，查询是否只在本地节点执行|

|响应类型|描述|
|---|---|
|头信息|响应头|
|long|游标ID|
|int|行数|
|键数据对象+值数据对象|键-值对形式的记录，重复多次，次数为前一个参数返回的行数值|
|bool|指示是否有更多结果可通过`OP_QUERY_SCAN_CURSOR_GET_PAGE`获取。如果为false，则查询游标将自动关闭。|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(15, OP_QUERY_SCAN, 1, out);

// Cache id
String queryCacheName = "personCache";
writeIntLittleEndian(queryCacheName.hashCode(), out);

// flags
writeByteLittleEndian(0, out);

// Filter Object
writeByteLittleEndian(101, out); // null

// Cursor page size
writeIntLittleEndian(1, out);

// Partition to query
writeIntLittleEndian(-1, out);

// local flag
out.writeBoolean(false);
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

//Response header
readResponseHeader(in);

// Cursor id
long cursorId = readLongLittleEndian(in);

int rowCount = readIntLittleEndian(in);

// Read entries (as user objects)
for (int i = 0; i < rowCount; i++) {
  Object key = readDataObject(in);
  Object val = readDataObject(in);

  System.out.println("CacheEntry: " + key + ", " + val);
}

boolean moreResults = readBooleanLittleEndian(in);
```
</Tab>

</Tabs>

#### 8.4.7.OP_QUERY_SCAN_CURSOR_GET_PAGE
通过`OP_QUERY_SCAN`获取的游标，查询下一页的数据。

|请求类型|描述|
|---|---|
|头信息|请求头|
|long|游标ID|

|响应类型|描述|
|---|---|
|头信息|响应头|
|long|游标ID|
|int|行数|
|键数据对象+值数据对象|键-值对形式的记录，重复多次，次数为前一个参数返回的行数值|
|bool|指示是否有更多结果可通过`OP_QUERY_SCAN_CURSOR_GET_PAGE`获取。如果为false，则查询游标将自动关闭。|

#### 8.4.8.OP_RESOURCE_CLOSE
关闭一个资源，比如游标。

|请求类型|描述|
|---|---|
|头信息|请求头|
|long|资源ID|

|响应类型|描述|
|---|---|
|头信息|响应头|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(8, OP_RESOURCE_CLOSE, 1, out);

// Resource id
long cursorId = 1;
writeLongLittleEndian(cursorId, out);
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);
```
</Tab>

</Tabs>

### 8.5.二进制类型元数据
#### 8.5.1.操作代码
与Ignite服务端节点成功握手后，客户端就可以通过发送带有特定操作代码的请求（请参见下面的请求/响应结构）来执行与二进制类型有关的各种操作了：

|操作|操作代码|
|---|---|
|`OP_GET_BINARY_TYPE_NAME`|3000|
|`OP_REGISTER_BINARY_TYPE_NAME`|3001|
|`OP_GET_BINARY_TYPE`|3002|
|`OP_PUT_BINARY_TYPE`|3003|

注意上面提到的操作代码，是请求头的一部分，具体可以看[头信息](#_2-1-3-消息格式)的相关内容。

#### 8.5.2.OP_GET_BINARY_TYPE_NAME
通过ID取得和平台相关的完整二进制类型名，比如，.NET和Java都可以映射相同的类型`Foo`，但是在.NET中类型是`Apache.Ignite.Foo`，而在Java中是`org.apache.ignite.Foo`。

名字是使用`OP_REGISTER_BINARY_TYPE_NAME`注册的。

|请求类型|描述|
|---|---|
|头信息|请求头|
|byte|平台ID。Java：0，DOTNET：1|
|int|类型ID，Java风格类型名字的哈希值|

|响应类型|描述|
|---|---|
|头信息|响应头|
|string|二进制类型名|

<Tabs>
<Tab title="请求">

```java
String type = "ignite.myexamples.model.Person";
int typeLen = type.getBytes("UTF-8").length;

DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(5, OP_GET_BINARY_TYPE_NAME, 1, out);

// Platform id
writeByteLittleEndian(0, out);

// Type id
writeIntLittleEndian(type.hashCode(), out);
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting String
int typeCode = readByteLittleEndian(in); // type code
int strLen = readIntLittleEndian(in); // length

byte[] buf = new byte[strLen];

readFully(in, buf, 0, strLen);

String s = new String(buf);

System.out.println(s);
```
</Tab>

</Tabs>

#### 8.5.3.OP_REGISTER_BINARY_TYPE_NAME
通过ID注册平台相关的完整二进制类型名，比如，.NET和Java都可以映射相同的类型`Foo`，但是在.NET中类型是`Apache.Ignite.Foo`，而在Java中是`org.apache.ignite.Foo`。

|请求类型|描述|
|---|---|
|头信息|请求头|
|byte|平台ID。Java：0，DOTNET：1|
|int|类型ID，Java风格类型名字的哈希值|
|string|类型名|

|响应类型|描述|
|---|---|
|头信息|响应头|

<Tabs>
<Tab title="请求">

```java
String type = "ignite.myexamples.model.Person";
int typeLen = type.getBytes("UTF-8").length;

DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(20 + typeLen, OP_PUT_BINARY_TYPE_NAME, 1, out);

//Platform id
writeByteLittleEndian(0, out);

//Type id
writeIntLittleEndian(type.hashCode(), out);

// Type name
writeString(type, out);
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

readResponseHeader(in);
```
</Tab>

</Tabs>

#### 8.5.4.OP_GET_BINARY_TYPE
通过ID获取二进制类型信息。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|类型ID，Java风格类型名字的哈希值|

|响应类型|描述|
|---|---|
|头信息|响应头|
|bool|false:二进制类型不存在，响应结束，true：二进制类型存在，内容如下|
|int|类型ID，Java风格类型名字的哈希值|
|string|类型名|
|string|关联键字段名|
|int|BinaryField计数|
|BinaryField*count|BinaryField结构。String：字段名；int：类型ID，Java风格类型名哈希值；int：字段ID，Java风格字段名哈希值|
|bool|是否枚举值，如果为true，则需要传入下面两个参数，否则会被忽略|
|int|*只有在`enum`参数为`true`时才是必须*，枚举字段数量|
|string+int|*只有在`enum`参数为`true`时才是必须*，枚举值，枚举值是一对字面量值（字符串）和一个数值（整型）组成。重复多次，重复次数为前一个参数的值|
|int|BinarySchema计数|
|BinarySchema|BinarySchema结构。int：唯一模式ID；int：模式中字段数；int：字段ID，Java风格字段名哈希值，重复多次，重复次数为模式中字段数量，BinarySchema重复次数为前一个参数数值|

<Tabs>
<Tab title="请求">

```java
String type = "ignite.myexamples.model.Person";

DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(4, OP_BINARY_TYPE_GET, 1, out);

// Type id
writeIntLittleEndian(type.hashCode(), out);
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

readResponseHeader(in);

boolean typeExist = readBooleanLittleEndian(in);

int typeId = readIntLittleEndian(in);

String typeName = readString(in);

String affinityFieldName = readString(in);

int fieldCount = readIntLittleEndian(in);

for (int i = 0; i < fieldCount; i++)
	readBinaryTypeField(in);

boolean isEnum = readBooleanLittleEndian(in);

int schemaCount = readIntLittleEndian(in);

// Read binary schemas
for (int i = 0; i < schemaCount; i++) {
  int schemaId = readIntLittleEndian(in); // Schema Id

  int fieldCount = readIntLittleEndian(in); // field count

  for (int j = 0; j < fieldCount; j++) {
    System.out.println(readIntLittleEndian(in)); // field id
  }
}

private static void readBinaryTypeField (DataInputStream in) throws IOException{
  String fieldName = readString(in);
  int fieldTypeId = readIntLittleEndian(in);
  int fieldId = readIntLittleEndian(in);
  System.out.println(fieldName);
}
```
</Tab>

</Tabs>

#### 8.5.5.OP_PUT_BINARY_TYPE
在集群中注册二进制类型信息。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|类型ID，Java风格类型名字的哈希值|
|string|类型名|
|string|关联键字段名|
|int|BinaryField计数|
|BinaryField|BinaryField结构。String：字段名；int：类型ID，Java风格类型名哈希值；int：字段ID，Java风格字段名哈希值；重复多次，重复次数为前一个参数传递的值|
|bool|是否枚举值，如果为true，则需要传入下面两个参数，否则会被忽略|
|int|*只有在`enum`参数为`true`时才是必须*，枚举字段数量|
|string+int|*只有在`enum`参数为`true`时才是必须*，枚举值，枚举值是一对字面量值（字符串）和一个数值（整型）组成。重复多次，重复次数为前一个参数的值|
|int|BinarySchema计数|
|BinarySchema|BinarySchema结构。int：唯一模式ID；int：模式中字段数；int：字段ID，Java风格字段名哈希值，重复多次，重复次数为模式中字段数量，BinarySchema重复次数为前一个参数数值|

|响应类型|描述|
|---|---|
|头信息|响应头|

<Tabs>
<Tab title="请求">

```java
String type = "ignite.myexamples.model.Person";

DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(120, OP_BINARY_TYPE_PUT, 1, out);

// Type id
writeIntLittleEndian(type.hashCode(), out);

// Type name
writeString(type, out);

// Affinity key field name
writeByteLittleEndian(101, out);

// Field count
writeIntLittleEndian(3, out);

// Field 1
String field1 = "id";
writeBinaryTypeField(field1, "long", out);

// Field 2
String field2 = "name";
writeBinaryTypeField(field2, "String", out);

// Field 3
String field3 = "salary";
writeBinaryTypeField(field3, "int", out);

// isEnum
out.writeBoolean(false);

// Schema count
writeIntLittleEndian(1, out);

// Schema
writeIntLittleEndian(657, out);  // Schema id; can be any custom value
writeIntLittleEndian(3, out);  // field count
writeIntLittleEndian(field1.hashCode(), out);
writeIntLittleEndian(field2.hashCode(), out);
writeIntLittleEndian(field3.hashCode(), out);

private static void writeBinaryTypeField (String field, String fieldType, DataOutputStream out) throws IOException{
  writeString(field, out);
  writeIntLittleEndian(fieldType.hashCode(), out);
  writeIntLittleEndian(field.hashCode(), out);
}
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

readResponseHeader(in);
```
</Tab>

</Tabs>

### 8.6.缓存配置
#### 8.6.1.操作代码
与Ignite服务端节点成功握手后，客户端就可以通过发送带有特定操作代码的请求（请参见下面的请求/响应结构）来执行各种缓存配置操作了：

|操作|操作代码|
|---|---|
|`OP_CACHE_GET_NAMES`|1050|
|`OP_CACHE_CREATE_WITH_NAME`|1051|
|`OP_CACHE_GET_OR_CREATE_WITH_NAME`|1052|
|`OP_CACHE_CREATE_WITH_CONFIGURATION`|1053|
|`OP_CACHE_GET_OR_CREATE_WITH_CONFIGURATION`|1054|
|`OP_CACHE_GET_CONFIGURATION`|1055|
|`OP_CACHE_DESTROY`|1056|

注意上面提到的操作代码，是请求头的一部分，具体可以看[头信息](#_2-1-3-消息格式)的相关内容。

#### 8.6.2.OP_CACHE_CREATE_WITH_NAME
通过给定的名字创建缓存，如果缓存的名字中有`*`，则可以应用一个缓存模板，如果给定名字的缓存已经存在，则会抛出异常。

|请求类型|描述|
|---|---|
|头信息|请求头|
|string|缓存名|

|响应类型|描述|
|---|---|
|头信息|响应头|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

String cacheName = "myNewCache";

int nameLength = cacheName.getBytes("UTF-8").length;

DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(5 + nameLength, OP_CACHE_CREATE_WITH_NAME, 1, out);

// Cache name
writeString(cacheName, out);

// Send request
out.flush();
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

readResponseHeader(in);
```
</Tab>

</Tabs>

#### 8.6.3.OP_CACHE_GET_OR_CREATE_WITH_NAME
通过给定的名字创建缓存，如果缓存的名字中有`*`，则可以应用一个缓存模板，如果给定名字的缓存已经存在，则什么也不做。

|请求类型|描述|
|---|---|
|头信息|请求头|
|string|缓存名|

|响应类型|描述|
|---|---|
|头信息|响应头|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

String cacheName = "myNewCache";

int nameLength = cacheName.getBytes("UTF-8").length;

DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(5 + nameLength, OP_CACHE_GET_OR_CREATE_WITH_NAME, 1, out);

// Cache name
writeString(cacheName, out);

// Send request
out.flush();
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

readResponseHeader(in);
```
</Tab>

</Tabs>

#### 8.6.4.OP_CACHE_GET_NAMES
获取已有缓存的名字。

|请求类型|描述|
|---|---|
|头信息|请求头|

|响应类型|描述|
|---|---|
|头信息|响应头|
|int|缓存数量|
|string|缓存名字，重复多次，重复次数为前一个参数的返回值|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(5, OP_CACHE_GET_NAMES, 1, out);
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

readResponseHeader(in);

// Cache count
int cacheCount = readIntLittleEndian(in);

// Cache names
for (int i = 0; i < cacheCount; i++) {
  int type = readByteLittleEndian(in); // type code

  int strLen = readIntLittleEndian(in); // length

  byte[] buf = new byte[strLen];

  readFully(in, buf, 0, strLen);

  String s = new String(buf); // cache name

  System.out.println(s);
}
```
</Tab>

</Tabs>

#### 8.6.5.OP_CACHE_GET_CONFIGURATION
获取指定缓存的配置信息。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|type|标志|

|响应类型|描述|
|---|---|
|头信息|响应头|
|int|以字节计算的配置信息的长度（所有的配置参数）|
|CacheConfiguration|缓存配置的结构，具体见下表|

**CacheConfiguration**

|类型|描述|
|---|---|
|int|备份数量|
|int|CacheMode。LOCAL：0；REPLICATED：1；PARTITIONED：2|
|bool|CopyOnRead标志|
|string|内存区名字|
|bool|EagerTTL标志|
|bool|指标统计标志|
|string|缓存组名|
|bool|无效标志|
|long|默认锁超时时间（毫秒）|
|int|最大查询迭代数|
|string|缓存名|
|bool|堆内缓存开启标志|
|int|分区丢失策略。READ_ONLY_SAFE：0；READ_ONLY_ALL：1；READ_WRITE_SAFE：2；READ_WRITE_ALL：3；IGNORE：4|
|int|QueryDetailMetricsSize|
|int|QueryParellelism|
|bool|是否从备份读取标志|
|int|再平衡缓存区大小|
|long|再平衡批处理预取计数|
|long|再平衡延迟时间（毫秒）|
|int|再平衡模式。SYNC：0；ASYNC：1；NONE：2|
|int|再平衡顺序|
|long|再平衡调节（毫秒）|
|long|再平衡超时（毫秒）|
|bool|SqlEscapeAll|
|int|SqlIndexInlineMaxSize|
|string|SQL模式|
|int|写同步模式。FULL_SYNC：0；FULL_ASYNC：1；PRIMARY_SYNC：2|
|int|CacheKeyConfiguration计数|
|CacheKeyConfiguration|CacheKeyConfiguration结构。String：类型名；String：关联键字段名。重复多次，重复次数为前一参数返回值|
|int|QueryEntity计数|
|QueryEntity|QueryEntity结构，具体见下表|

**QueryEntity**

|类型|描述|
|---|---|
|string|键类型名|
|string|值类型名|
|string|表名|
|string|键字段名|
|string|值字段名|
|int|QueryField计数|
|QueryField|QueryField结构。String：名字；String：类型名；bool：是否键字段；bool：是否有非空约束。重复多次，重复次数为前一参数对应值|
|int|别名计数|
|string+string|字段名别名|
|int|QueryIndex计数|
|QueryIndex|QueryIndex结构。String：索引名；byte：索引类型，(SORTED：0；FULLTEXT：1；GEOSPATIAL：2)；int：内联大小；int：字段计数；(string + bool)：字段（名字+是否降序）|

<Tabs>
<Tab title="请求">

```java
String cacheName = "myCache";

DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(5, OP_CACHE_GET_CONFIGURATION, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

readResponseHeader(in);

// Config length
int configLen = readIntLittleEndian(in);

// CacheAtomicityMode
int cacheAtomicityMode = readIntLittleEndian(in);

// Backups
int backups = readIntLittleEndian(in);

// CacheMode
int cacheMode = readIntLittleEndian(in);

// CopyOnRead
boolean copyOnRead = readBooleanLittleEndian(in);

// Other configurations
```
</Tab>

</Tabs>

#### 8.6.6.OP_CACHE_CREATE_WITH_CONFIGURATION
用给定的配置创建缓存，如果该缓存已存在会抛出异常。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|按字节计算的配置的长度（所有的配置参数）|
|short|配置参数计数|
|short + 属性类型|配置属性数据。重复多次，重复次数为前一参数对应值|

配置参数的个数没有要求，但是`Name`必须提供。

缓存的配置数据是以键-值对的形式提供的，这里键是`short`类型的属性ID，而值是与键对应的数据，下表描述了所有可用的参数：

|属性代码|属性类型|描述|
|---|---|---|
|2|int|CacheAtomicityMode。TRANSACTIONAL：0；ATOMIC：1|
|3|int|备份数量|
|1|int|CacheMode。LOCAL：0；REPLICATED：1；PARTITIONED：2|
|5|bool|CopyOnRead|
|100|String|内存区名|
|405|bool|EagerTtl|
|406|bool|StatisticsEnabled|
|400|String|缓存组名|
|402|long|默认锁超时时间（毫秒）|
|403|int|MaxConcurrentAsyncOperations|
|206|int|MaxQueryIterators|
|0|String|缓存名|
|101|bool|堆内缓存启用标志|
|404|int|PartitionLossPolicy。READ_ONLY_SAFE：0；READ_ONLY_ALL：1；READ_WRITE_SAFE：2；READ_WRITE_ALL：3；IGNORE：4|
|202|int|QueryDetailMetricsSize|
|201|int|QueryParallelism|
|6|bool|ReadFromBackup|
|303|int|再平衡批处理大小|
|304|long|再平衡批处理预读计数|
|301|long|再平衡延迟时间（毫秒）|
|300|int|RebalanceMode。SYNC：0；ASYNC：1；NONE：2|
|305|int|再平衡顺序|
|306|long|再平衡调节（毫秒）|
|302|long|再平衡超时（毫秒）|
|205|bool|SqlEscapeAll|
|204|int|SqlIndexInlineMaxSize|
|203|String|SQL模式|
|4|int|WriteSynchronizationMode。FULL_SYNC：0；FULL_ASYNC：1；PRIMARY_SYNC：2|
|401|int+CacheKeyConfiguration|CacheKeyConfiguration计数+CacheKeyConfiguration。CacheKeyConfiguration结构。String：类型名；String：关联键字段名|
|200|int+QueryEntity|QueryEntity计数+QueryEntity。QueryEntity结构如下表|

**QueryEntity**

|类型|描述|
|---|---|
|string|键类型名|
|string|值类型名|
|string|表名|
|string|键字段名|
|string|值字段名|
|int|QueryField计数|
|QueryField|QueryField结构。String：名字；String：类型名；bool：是否键字段；bool：是否有非空约束。重复多次，重复次数为前一参数对应值|
|int|别名计数|
|string+string|字段名别名|
|int|QueryIndex计数|
|QueryIndex|QueryIndex结构。String：索引名；byte：索引类型，(SORTED：0；FULLTEXT：1；GEOSPATIAL：2)；int：内联大小；int：字段计数；(string + bool)：字段（名字+是否降序）|

|响应类型|描述|
|---|---|
|头信息|响应头|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(30, OP_CACHE_CREATE_WITH_CONFIGURATION, 1, out);

// Config length in bytes
writeIntLittleEndian(16, out);

// Number of properties
writeShortLittleEndian(2, out);

// Backups opcode
writeShortLittleEndian(3, out);
// Backups: 2
writeIntLittleEndian(2, out);

// Name opcode
writeShortLittleEndian(0, out);
// Name
writeString("myNewCache", out);
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);
```
</Tab>

</Tabs>

#### 8.6.7.OP_CACHE_GET_OR_CREATE_WITH_CONFIGURATION
根据提供的配置创建缓存，如果该缓存已存在则什么都不做。

|请求类型|描述|
|---|---|
|头信息|请求头|
|CacheConfiguration|缓存配置的结构，具体见前述|

|响应类型|描述|
|---|---|
|头信息|响应头|

<Tabs>
<Tab title="请求">

```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

writeRequestHeader(30, OP_CACHE_GET_OR_CREATE_WITH_CONFIGURATION, 1, out);

// Config length in bytes
writeIntLittleEndian(16, out);

// Number of properties
writeShortLittleEndian(2, out);

// Backups opcode
writeShortLittleEndian(3, out);

// Backups: 2
writeIntLittleEndian(2, out);

// Name opcode
writeShortLittleEndian(0, out);

// Name
writeString("myNewCache", out);
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);
```
</Tab>

</Tabs>

#### 8.6.8.OP_CACHE_DESTROY
销毁指定的缓存。

|请求类型|描述|
|---|---|
|头信息|请求头|
缓存ID，Java风格的缓存名的哈希值

|响应类型|描述|
|---|---|
|头信息|响应头|

<Tabs>
<Tab title="请求">

```java
String cacheName = "myCache";

DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(4, OP_CACHE_DESTROY, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Send request
out.flush();
```
</Tab>

<Tab title="响应">

```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

readResponseHeader(in);
```
</Tab>
</Tabs>

<RightPane/>
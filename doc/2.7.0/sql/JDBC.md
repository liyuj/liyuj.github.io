# JDBC
## 1.JDBC驱动
Ignite提供了一个JDBC驱动，它可以通过标准的SQL语句处理分布式数据，比如从JDBC端直接进行`SELECT`、`INSERT`、`UPDATE`和`DELETE`。

目前，Ignite支持两种类型的驱动，轻量易用的JDBC Thin模式驱动以及以客户端节点形式与集群进行交互。
### 1.1.JDBC Thin模式驱动
JDBC Thin模式驱动是默认的，是一个轻量级驱动，要使用这种驱动，只需要将`ignite-core-{version}.jar`放入应用的类路径即可。

驱动会接入集群节点然后将所有的请求转发给它进行处理。节点会处理分布式的查询以及结果集的汇总，然后将结果集反馈给客户端应用。
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

下表列出了JDBC连接串支持的所有参数：

|属性名|描述|默认值|
|---|---|---|
|`user`|SQL连接的用户名，如果服务端开启了认证则此参数为必需。|`ignite`|
|`password`|SQL连接的密码，如果服务端开启了认证则此参数为必需。|`ignite`|
|`distributedJoins`|对于非并置数据是否使用分布式关联|`false`|
|`enforceJoinOrder`|是否在查询中强制表的关联顺序，如果配置为`true`，查询优化器在关联中不会对表进行重新排序。|false|
|`collocated`|数据是否并置，当执行分布式查询时，它会将子查询发送给各个节点，如果事先知道要查询的数据在相同的节点是并置在一起的，那么Ignite会有显著的性能提升和拓扑优化。|`false`|
|`replicatedOnly`|查询是否只包含复制表，这是一个潜在的可能提高性能的提示。|`false`|
|`autoCloseServerCursor`|当拿到最后一个结果集时是否自动关闭服务端游标。开启之后，对`ResultSet.close()`的调用就不需要网络访问，这样会改进性能。但是，如果服务端游标已经关闭，在调用`ResultSet.getMetadata()`方法时会抛出异常，这时为什么默认值为`false`的原因。|`false`|
|`socketSendBuffer`|发送套接字缓冲区大小，如果配置为0，会使用操作系统默认值。|`0`|
|`socketReceiveBuffer`|接收套接字缓冲区大小，如果配置为0，会使用操作系统默认值。|`0`|
|`tcpNoDelay`|是否使用`TCP_NODELAY`选项。|`true`|
|`lazy`|查询延迟执行。Ignite默认会将所有的结果集放入内存然后将其返回给客户端，对于不太大的结果集，这样会提供较好的性能，并且使内部的数据库锁时间最小化，因此提高了并发能力。但是，如果相对于可用内存来说结果集过大，那么会导致频繁的GC暂停，甚至`OutOfMemoryError`，如果使用这个标志，可以提示Ignite延迟加载结果集，这样可以在不大幅降低性能的前提下，最大限度地减少内存的消耗。|`false`|
|`skipReducerOnUpdate`|开启服务端的更新特性。当Ignite执行DML操作时，首先，它会获取所有受影响的中间行给查询发起方进行分析（通常被称为汇总），然后会准备一个更新值的批量发给远程节点。这个方式可能影响性能，如果一个DML操作会移动大量数据条目时，还可能会造成网络堵塞。使用这个标志可以提示Ignite在对应的远程节点上进行中间行的分析和更新。默认值为false，这意味着会首先获取中间行然后发给查询发起方。|`false`|
|`sslMode`|开启SSL连接。可用的模式为：1.`require`：在客户端开启SSL协议，只有SSL连接才可以接入。2.`disable`：在客户端禁用SSL协议，只支持普通连接。|`disable`|
|`sslProtocol`|安全连接的协议名，如果未指定，会使用TLS协议。协议实现由JSSE支持：`SSLv3 (SSL), TLSv1 (TLS), TLSv1.1, TLSv1.2`|`TLS`|
|`sslKeyAlgorithm`|创建密钥管理器使用的算法。注意大多数情况使用默认值就可以了。算法实现由JSSE提供：`PKIX (X509 or SunPKIX), SunX509`||
|`sslClientCertificateKeyStoreUrl`|客户端密钥存储库文件的url，这是个强制参数，因为没有密钥管理器SSL上下文无法初始化。如果`sslMode`为`require`并且未通过属性文件指定密钥存储库 URL，那么会使用JSSE属性`javax.net.ssl.keyStore`的值。|JSSE系统属性`javax.net.ssl.keyStore`的值。|
|`sslClientCertificateKeyStorePassword`|客户端密钥存储库密码。如果`sslMode`为`require`并且未通过属性文件指定密钥存储库密码，那么会使用JSSE属性`javax.net.ssl.keyStorePassword`的值。|JSSE属性`javax.net.ssl.keyStorePassword`的值。|
|`sslClientCertificateKeyStoreType`|用于上下文初始化的客户端密钥存储库类型。如果`sslMode`为`require`并且未通过属性文件指定密钥存储库类型，那么会使用JSSE属性`javax.net.ssl.keyStoreType`的值。|JSSE属性`javax.net.ssl.keyStoreType`的值，如果属性未定义，默认值为JKS。|
|`sslTrustCertificateKeyStoreUrl`|truststore文件的URL。这是个可选参数，但是`sslTrustCertificateKeyStoreUrl`和`sslTrustAll`必须配置一个。如果`sslMode`为`require`并且未通过属性文件指定truststore文件URL，那么会使用JSSE属性`javax.net.ssl.trustStore`的值。|JSSE系统属性`javax.net.ssl.trustStore`的值。|
|`sslTrustCertificateKeyStorePassword`|truststore密码。如果`sslMode`为`require`并且未通过属性文件指定truststore密码，那么会使用JSSE属性`javax.net.ssl.trustStorePassword`的值。|JSSE系统属性`javax.net.ssl.trustStorePassword`的值。|
|`sslTrustCertificateKeyStoreType`|truststore类型。如果`sslMode`为`require`并且未通过属性文件指定truststore类型，那么会使用JSSE属性`javax.net.ssl.trustStoreType`的值。|JSSE系统属性`javax.net.ssl.trustStoreType`的值。如果属性未定义，默认值为JKS。|
|`sslTrustAll`|禁用服务端的证书验证。配置为`true`信任任何服务端证书（撤销的、过期的或者自签名的SSL证书）。注意，如果不能完全信任网络（比如公共互联网），不要在生产中启用该选项。|`false`|
|`sslFactory`|`Factory<SSLSocketFactory>`的自定义实现的类名，如果`sslMode`为`require`并且指定了该工厂类，自定义的工厂会替换JSSE的默认值，这时其它的SSL属性也会被忽略。|`null`|

**连接串示例**

 - `jdbc:ignite:thin://myHost`：接入`myHost`,其它比如端口为`10800`等都是默认值；
 - `jdbc:ignite:thin://myHost:11900`：接入`myHost`,自定义端口为`11900`，其它为默认值；
 - `jdbc:ignite:thin://myHost:11900;user=ignite;password=ignite`：接入`myHost`,自定义端口为`11900`，并且带有用于认证的用户凭据；
 - `jdbc:ignite:thin://myHost:11900;distributedJoins=true&autoCloseServerCursor=true`：接入`myHost`,自定义端口为`11900`，开启了分布式关联和`autoCloseServerCursor`优化；
 - `jdbc:ignite:thin://myHost:11900/myschema;`：接入`myHost`，自定义端口为`11900`，模式为`MYSCHEMA`；
 - `jdbc:ignite:thin://myHost:11900/"MySchema";lazy=false`：接入`myHost`，自定义端口为`11900`，模式为`MySchema`（模式名区分大小写），并且禁用了查询的延迟执行。

**多端点**

在连接串中配置多个连接端点也是可以的，这样如果连接中断会开启自动故障转移，JDBC驱动会从列表中随机选择一个地址接入。如果之前的连接中断，驱动会选择另一个地址直到连接恢复，如果所有的端点都不可达，JDBC会停止重连并且抛出异常。

下面的示例会显示如何通过连接串传递三个地址：
```java
// Register JDBC driver.
Class.forName("org.apache.ignite.IgniteJdbcThinDriver");

// Open the JDBC connection passing several connection endpoints.
Connection conn = DriverManager.getConnection(
  "jdbc:ignite:thin://192.168.0.50:101,192.188.5.40:101, 192.168.10.230:101");
```

**集群配置**

为了接收和处理来自JDBC Thin驱动转发过来的请求，一个节点需要绑定到一个本地网络端口`10800`，然后监听入站请求。

通过`IgniteConfiguration`配置`ClientConnectorConfiguration`，可以对参数进行修改：

Java：
```java
IgniteConfiguration cfg = new IgniteConfiguration()
    .setClientConnectorConfiguration(new ClientConnectorConfiguration());
```
XML：
```xml
<bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="clientConnectorConfiguration">
    <bean class="org.apache.ignite.configuration.ClientConnectorConfiguration" />
  </property>
</bean>
```
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
JDBC对象中的`Connection`、`Statement`和`ResultSet`不是线程安全的。因此不能在多个线程中使用一个JDBC连接对Statement和ResultSet进行操作。
JDBC Thin模式驱动添加了并发保护，如果检测到了并发访问，那么会抛出`SQLException`，消息为：`Concurrent access to JDBC connection is not allowed [ownThread=<guard_owner_thread_name>, curThread=<current_thread_name>]",
SQLSTATE="08006`。
:::

### 1.2.使用SSL
JDBC Thin模式驱动可以使用SSL套接字通讯在驱动和节点间建立安全连接（包括发起握手）。

具体可以看JDBC驱动的`ssl*`相关参数以及`ClientConnectorConfiguration`的`ssl*`和`useIgniteSslContextFactory`参数。

默认实现基于JSSE，并且需要处理两个Java密钥存储库文件。

 - `sslClientCertificateKeyStoreUrl`：客户端认证密钥存储库文件，其持有客户端的密钥和证书；
 - `sslTrustCertificateKeyStoreUrl`：可信证书密钥存储库文件，包含用于验证服务器证书的证书信息。

可信存储库是可选参数，但是`sslTrustCertificateKeyStoreUrl`或者`sslTrustAll`必须配置两者之一。
::: warning 使用`sslTrustAll`参数
如果生产环境位于不完全可信网络（尤其是公共互联网），不要开启此选项。
:::

如果希望使用自己的实现或者通过某种方式配置`SSLSocketFactory`，可以使用驱动的`sslFactory`参数，这是一个包含`Factory<SSLSocketFactory>`接口实现的类名字符串，该类对于JDBC驱动的类加载器必须可用。
### 1.3.示例
要处理集群中的数据，需要使用下面的一种方式来创建一个JDBC`Connection`对象：
```java
// Open the JDBC connection via DriverManager.
Connection conn = DriverManager.getConnection("jdbc:ignite:thin://192.168.0.50");

// Or open connection via DataSource.
IgniteJdbcThinDataSource ids = new IgniteJdbcThinDataSource();
ids.setUrl("jdbc:ignite:thin://192.168.0.50");
ids.setDistributedJoins(true);

Connection conn2 = ids.getConnection();
```
之后就可以执行`SELECT`SQL查询了：
```java
// Query names of all people.
ResultSet rs = conn.createStatement().executeQuery("select name from Person");

while (rs.next()) {
    String name = rs.getString(1);
    ...
}

// Query people with specific age using prepared statement.
PreparedStatement stmt = conn.prepareStatement("select name, age from Person where age = ?");

stmt.setInt(1, 30);

ResultSet rs = stmt.executeQuery();

while (rs.next()) {
    String name = rs.getString("name");
    int age = rs.getInt("age");
    ...
}
```
此外，可以使用DML语句对数据进行修改。

**INSERT**
```java
// Insert a Person with a Long key.
PreparedStatement stmt = conn.prepareStatement("INSERT INTO Person(_key, name, age) VALUES(CAST(? as BIGINT), ?, ?)");

stmt.setInt(1, 1);
stmt.setString(2, "John Smith");
stmt.setInt(3, 25);

stmt.execute();
```
**MERGE**
```java
// Merge a Person with a Long key.
PreparedStatement stmt = conn.prepareStatement("MERGE INTO Person(_key, name, age) VALUES(CAST(? as BIGINT), ?, ?)");

stmt.setInt(1, 1);
stmt.setString(2, "John Smith");
stmt.setInt(3, 25);

stmt.executeUpdate();
```
**UPDATE**
```java
// Update a Person.
conn.createStatement().
  executeUpdate("UPDATE Person SET age = age + 1 WHERE age = 25");
```
**DELETE**
```java
conn.createStatement().execute("DELETE FROM Person WHERE age = 25");
```
### 1.4.流处理
Ignite的JDBC驱动可以通过`SET STREAMING`命令对流化数据进行批量处理，具体可以看[SET STREAMING](/doc/2.7.0/sql/SQLReference.md#_4-2-set-streaming)的相关内容。
## 2.JDBC客户端模式驱动
### 2.1.JDBC客户端模式驱动
JDBC客户端节点模式驱动使用自己的完整功能的客户端节点连接接入集群，这要求开发者提供一个完整的Spring XML配置作为JDBC连接串的一部分，然后拷贝下面所有的jar文件到应用或者SQL工具的类路径中：

 - `{apache_ignite_release}\libs`目录下的所有jar文件；
 - `{apache_ignite_release}\ignite-indexing`和`{apache_ignite_release}\ignite-spring`目录下的所有jar文件；

这个驱动很重，而且可能不支持Ignite的最新SQL特性，但是因为它底层使用客户端节点连接，它可以执行分布式查询，然后在应用端直接对结果进行汇总。

JDBC连接URL的规则如下：
```
jdbc:ignite:cfg://[<params>@]<config_url>
```

 - `<config_url>`是必需的，表示指向Ignite客户端节点配置文件的任意合法URL，当驱动试图建立到集群的连接时，这个节点会在Ignite JDBC客户端节点驱动中启动；
  - `<params>`是可选的，格式如下：

```
param1=value1:param2=value2:...:paramN=valueN
```
驱动类名为`org.apache.ignite.IgniteJdbcDriver`，比如下面的代码，展示了如何打开一个到集群的连接：
```java
// Register JDBC driver.
Class.forName("org.apache.ignite.IgniteJdbcDriver");

// Open JDBC connection (cache name is not specified, which means that we use default cache).
Connection conn = DriverManager.getConnection("jdbc:ignite:cfg://file:///etc/config/ignite-jdbc.xml");
```
::: tip 安全连接
关于如何保护JDBC客户端驱动的更多信息，请参见[高级安全](/doc/2.7.0/java/Security.md#_2-高级安全)的相关文档。
:::
它支持如下的参数：

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

::: tip 跨缓存查询
驱动连接到的缓存会被视为默认的模式，要跨越多个缓存进行查询，可以参照[分布式关联](/doc/2.7.0/sql/Architecture.md#_2-分布式关联)章节。
:::

**流模式**

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
这些参数几乎覆盖了`IgniteDataStreamer`的所有常规配置，这样就可以根据需要更好地调整流处理器。关于如何配置流处理器可以参考[流处理器](/doc/2.7.0/java/DataLoadingStreaming.md#_3-数据流处理器)的相关文档来了解更多的信息。
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
### 2.2.示例
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
    ...
}

// Query people with specific age using prepared statement.
PreparedStatement stmt = conn.prepareStatement("select name, age from Person where age = ?");

stmt.setInt(1, 30);

ResultSet rs = stmt.executeQuery();

while (rs.next()) {
    String name = rs.getString("name");
    int age = rs.getInt("age");
    ...
}
```
此外，可以使用DML语句对数据进行修改。

**INSERT**
```java
// Insert a Person with a Long key.
PreparedStatement stmt = conn.prepareStatement("INSERT INTO Person(_key, name, age) VALUES(CAST(? as BIGINT), ?, ?)");

stmt.setInt(1, 1);
stmt.setString(2, "John Smith");
stmt.setInt(3, 25);

stmt.execute();
```
**MERGE**
```java
// Merge a Person with a Long key.
PreparedStatement stmt = conn.prepareStatement("MERGE INTO Person(_key, name, age) VALUES(CAST(? as BIGINT), ?, ?)");

stmt.setInt(1, 1);
stmt.setString(2, "John Smith");
stmt.setInt(3, 25);

stmt.executeUpdate();
```
**UPDATE**
```java
// Update a Person.
conn.createStatement().
  executeUpdate("UPDATE Person SET age = age + 1 WHERE age = 25");
```
**DELETE**
```java
conn.createStatement().execute("DELETE FROM Person WHERE age = 25");
```
## 3.错误码
Ignite的JDBC驱动将错误码封装进了`java.sql.SQLException`类，它简化了应用端的错误处理。要获得错误码，可以使用`java.sql.SQLException.getSQLState()`方法，它会返回一个字符串：
```java
// Register JDBC driver.
Class.forName("org.apache.ignite.IgniteJdbcThinDriver");

// Open JDBC connection.
Connection conn = DriverManager.getConnection("jdbc:ignite:thin://127.0.0.1");

PreparedStatement ps;

try {
  ps = conn.prepareStatement("INSERT INTO Person(id, name, age) values (1," +
                             "'John', 'unparseableString')");
}
catch (SQLException e) {
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
下表中列出了Ignite目前支持的所有错误码，未来这个列表可能还会扩展：

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
|`42000`|查询解析异常|
|`50000`|Ignite内部错误，这个代码不是ANSI定义的，属于Ignite特有的错误，获取`java.sql.SQLException`的错误信息可以了解更多的细节|

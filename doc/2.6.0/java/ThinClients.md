# 19.瘦客户端
## 19.1.瘦客户端
瘦客户端是一个轻量级的Ignite客户端，通过标准的Socket连接接入集群，它不会启动一个JVM进程（不需要Java），不会成为集群拓扑的一部分，也不持有任何数据，也不会参与计算网格的计算。

它所做的只是简单地建立一个与标准Ignite节点的Socket连接，并通过该节点执行所有操作。

瘦客户端基于二进制客户端协议，这样任何语言都可以接入Ignite集群，目前如下的客户端可用：
 
  - Java瘦客户端
  - .NET瘦客户端

NodeJS、Go、Python、PHP以及其它的客户端在未来的版本中会发布。
## 19.2.二进制客户端协议
### 19.2.1.摘要
Ignite的二进制客户端协议使得应用不用启动一个全功能的节点，就可以与已有的集群进行通信。应用使用原始的TCP套接字，就可以接入集群。连接建立之后，就可以使用定义好的格式执行缓存操作。

与集群通信，客户端必须遵守下述的数据格式和通信细节。
### 19.2.2.数据格式
**字节序**

Ignite的二进制客户端协议使用低字节序。

**数据对象**

用户数据，比如缓存的键和值，是以Ignite的二进制对象表示的，一个数据对象可以是标准类型（预定义），也可以是复杂对象，具体可以看数据格式的相关章节。
### 19.2.3.消息格式
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
|`int`|状态码，（0为成功，其他为错误码）|
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
### 19.2.4.接入
**TCP套接字**

客户端应用接入服务端节点需要通过TCP套接字，连接器默认使用`10800`端口。可以在集群的`IgniteConfiguration`中的`clientConnectorConfiguration`属性中，配置端口号及其它的服务端连接参数，如下所示：

XML：
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
Java：
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
**连接握手**

除了套接字连接之外，瘦客户端协议还需要连接握手，以确保客户端和服务端版本兼容。注意握手必须是连接建立后的第一条消息。
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
### 19.2.5.客户端操作
握手成功之后，客户端就可以执行各种缓存操作了。

 - 键-值查询；
 - SQL和扫描查询；
 - 二进制类型操作；
 - 缓存配置操作。

## 19.3.Java瘦客户端
Java瘦客户端将二进制客户端协议暴露给Java开发者。

瘦客户端是一个轻量级的Ignite客户端，通过标准的Socket连接接入集群，不会成为集群拓扑的一部分，也不持有任何数据，也不会参与计算网格的计算。

它所做的只是简单地建立一个与标准Ignite节点的Socket连接，并通过该节点执行所有操作。

### 19.3.1.快速入门
按照下面的步骤操作，可以学习瘦客户端API和开发环境的基础知识。
#### 19.3.1.1.Maven配置
添加`ignite-core`这一个依赖就可以使用所有的瘦客户端API。

Maven：
```xml
 <properties>
        <ignite.version>2.5.0</ignite.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.apache.ignite</groupId>
            <artifactId>ignite-core</artifactId>
            <version>${ignite.version}</version>
        </dependency>      
    </dependencies>
```
Gradle：
```xml
 def igniteVersion = '2.5.0'

dependencies {
    compile group: 'org.apache.ignite', name: 'ignite-core', version: igniteVersion
}
```
>**Ignite版本**
瘦客户端和Ignite服务端版本可以不同，只要二进制协议版本是兼容的即可。

#### 19.3.1.2.简单应用
```java
public static void main(String[] args) {
    ClientConfiguration cfg = new ClientConfiguration().setAddresses("127.0.0.1:10800");

    try (IgniteClient igniteClient = Ignition.startClient(cfg)) {
        System.out.println();
        System.out.println(">>> Thin client put-get example started.");

        final String CACHE_NAME = "put-get-example";

        ClientCache<Integer, Address> cache = igniteClient.getOrCreateCache(CACHE_NAME);

        System.out.format(">>> Created cache [%s].\n", CACHE_NAME);

        Integer key = 1;
        Address val = new Address("1545 Jackson Street", 94612);

        cache.put(key, val);

        System.out.format(">>> Saved [%s] in the cache.\n", val);

        Address cachedVal = cache.get(key);

        System.out.format(">>> Loaded [%s] from the cache.\n", cachedVal);
    }
    catch (ClientException e) {
        System.err.println(e.getMessage());
    }
    catch (Exception e) {
        System.err.format("Unexpected failure: %s\n", e);
    }
}
```
该应用做了如下的工作：

 - 使用`Ignition#startClient(clientCfg)`向运行在本地`127.0.0.1`上的Ignite服务端发起了一个瘦客户端连接；
 - 使用`IgniteClient#getOrCreateCache(cacheName)`创建了一个指定名字的缓存；
 - 使用`ClientCache#put(key, val)}`和`ClientCache#get(key)`存储和获取数据。

#### 19.3.1.3.启动集群
在本地主机上启动集群：

Unix：
```bash
$IGNITE_HOME/bin/ignite.sh $IGNITE_HOME/examples/config/example-ignite.xml

...
[27-02-2018 19:21:00][INFO ][main][GridDiscoveryManager] Topology snapshot [ver=1, servers=1, clients=0, CPUs=8, offheap=1.0GB, heap=1.0GB]
```
Windows：
```bash
%IGNITE_HOME%\bin\ignite.bat %IGNITE_HOME%\examples\config\example-ignite.xml

...
[27-02-2018 19:21:00][INFO ][main][GridDiscoveryManager] Topology snapshot [ver=1, servers=1, clients=0, CPUs=8, offheap=1.0GB, heap=1.0GB]
```
>**服务端启动等待**
与Ignite客户端模式不同，它会等待服务端节点的启动，而瘦客户端在无法找到配置好的服务端时，会连接失败。

#### 19.3.1.4.启动应用
在IDE中运行程序，然后会看到如下的输出：
```bash
>>> Thin client put-get example started.
>>> Created cache [put-get-example].
>>> Saved [Address [street=1545 Jackson Street, zip=94612]] in the cache.
>>> Loaded [Address [street=1545 Jackson Street, zip=94612]] from the cache.
```
>**注意集群拓扑没有发生变化**
瘦客户端没有成为集群的一个成员，这是一个轻量级的应用，它会使用二进制客户端协议，通过TCP套接字与集群通信。

### 19.3.2.API
本章节讲述Ignite支持的Java瘦客户端API。
#### 19.3.2.1.初始化
`Ignition#startClient(ClientConfiguration)`方法会发起一个连接请求。

`IgniteClient`是一个可以自动关闭的资源，因此可以使用**try-with-resources**语句初始化和释放`IgniteClient`。
```java
try (IgniteClient client = Ignition.startClient(
  new ClientConfiguration().setAddresses("127.0.0.1:10800")
)) { 
}
```
#### 19.3.2.2.缓存管理
下面的方法可以用于获取表示缓存的`CacheClient`实例。

 - `IgniteClient#cache(String)`：假定指定名字的缓存已经存在，该方法不会与Ignite通信确认该缓存是否真的存在，后续的缓存操作如果缓存不存在会报错；
 - `IgniteClient#getOrCreateCache(String)，IgniteClient#getOrCreateCache(ClientCacheConfiguration)`：获取指定名字的缓存，如果不存在会进行创建，缓存创建时会使用默认的配置；
 - `IgniteClient#createCache(String), IgniteClient#createCache(ClientCacheConfiguration)`：用指定的名字创建缓存，如果缓存已经存在，会报错。

`IgniteClient#cacheNames()`方法可以列出所有的已有缓存。
```java
ClientCacheConfiguration cacheCfg = new ClientCacheConfiguration()
  .setName("References")
  .setCacheMode(CacheMode.REPLICATED)
  .setWriteSynchronizationMode(CacheWriteSynchronizationMode.FULL_SYNC);

ClientCache<Integer, String> cache = client.getOrCreateCache(cacheCfg);
```
#### 19.3.2.3.瘦客户端和JCache
目前，瘦客户端只实现了JCache的一个子集，因此并没有实现`javax.cache.Cache`（`ClientCacheConfiguration`也没有实现`javax.cache.configuration`）。

`ClientCache<K, V>`目前支持如下的JCache API：

 - `V get(K key)`；
 - `void put(K key, V val)`；
 - `boolean containsKey(K key)`；
 - `String getName()`；
 - `CacheClientConfiguration getConfiguration()`；
 - `Map<K, V> getAll(Set<? extends K> keys)`；
 - `void putAll(Map<? extends K, ? extends V> map)`；
 - `boolean replace(K key, V oldVal, V newVal)`；
 - `boolean replace(K key, V val)`；
 - `boolean remove(K key)`；
 - `boolean remove(K key, V oldVal)`；
 - `void removeAll(Set<? extends K> keys)`；
 - `void removeAll()`；
 - `V getAndPut(K key, V val)`；
 - `V getAndRemove(K key)`；
 - `V getAndReplace(K key, V val)`；
 - `boolean putIfAbsent(K key, V val)`；
 - `void clear()`

`ClientCache<K, V>`暴露了JCache中没有的高级的缓存API：

 - `int size(CachePeekMode... peekModes)`

```java
Map<Integer, String> data = IntStream.rangeClosed(1, 100).boxed()
    .collect(Collectors.toMap(i -> i, Object::toString));

cache.putAll(data);

assertFalse(cache.replace(1, "2", "3"));
assertEquals("1", cache.get(1));
assertTrue(cache.replace(1, "1", "3"));
assertEquals("3", cache.get(1));

cache.put(101, "101");

cache.removeAll(data.keySet());
assertEquals(1, cache.size());
assertEquals("101", cache.get(101));

cache.removeAll();
assertEquals(0, cache.size());
```
#### 19.3.2.4.扫描查询
使用`ScanQuery<K, V>`可以在服务端使用Java谓词对数据进行过滤，然后在客户端对过滤后的结果集进行迭代。

过滤后的条目是按页传输到客户端的，这样每次只有一个页面的数据会被加载到客户单的内存，页面大小可以通过`ScanQuery#setPageSize(int)`进行配置。
```java
Query<Cache.Entry<Integer, Person>> qry = new ScanQuery<Integer, Person>((i, p) -> p.getName().contains("Smith")).setPageSize(1000);

for (Query<Cache.Entry<Integer, Person>> qry : queries) {
  try (QueryCursor<Cache.Entry<Integer, Person>> cur = cache.query(qry)) {
    for (Cache.Entry<Integer, Person> entry : cur) {
      // Handle the entry ...
```
#### 19.3.2.5.SQL查询
SQL查询共有2种：

 - **数据定义语言语句**：用来管理缓存和索引；
 - **数据维护语言语句**：用来管理数据。

可以通过如下的方式使用瘦客户端的SQL API：

 - `IgniteClient#query(SqlFieldsQuery).getAll()`：执行非SELECT语句（DDL和DML）；
 - `IgniteClient#query(SqlFieldsQuery)`：执行SELECT语句以及获取字段的子集；
 - `IgniteCache#query(SqlQuery)`：执行SELECT语句，获取整个对象并且将结果集反序列化为Java类型实例。

和扫描查询一样，SELECT查询也是按页返回结果集，这样每次只有一个页面的数据加载到客户端的内存。
```java
client.query(
    new SqlFieldsQuery(String.format(
        "CREATE TABLE IF NOT EXISTS Person (id INT PRIMARY KEY, name VARCHAR) WITH \"VALUE_TYPE=%s\"",
        Person.class.getName()
    )).setSchema("PUBLIC")
).getAll();

int key = 1;
Person val = new Person(key, "Person 1");

client.query(new SqlFieldsQuery(
    "INSERT INTO Person(id, name) VALUES(?, ?)"
).setArgs(val.getId(), val.getName()).setSchema("PUBLIC")).getAll();

Object cachedName = client.query(
    new SqlFieldsQuery("SELECT name from Person WHERE id=?").setArgs(key).setSchema("PUBLIC")
).getAll().iterator().next().iterator().next();

assertEquals(val.getName(), cachedName);
```
#### 19.3.2.6.Ignite二进制对象
瘦客户端完全支持`1.10.二进制编组器`章节中描述的Ignite二进制对象API，使用`CacheClient#withKeepBinary()`可以将缓存切换为二进制模式，然后就可以直接处理二进制对象，从而避免序列化/反序列化。

使用`IgniteClient#binary()`可以获得`IgniteBinary`的实例，然后从头构建一个对象。
```java
IgniteBinary binary = client.binary();

BinaryObject val = binary.builder("Person")
    .setField("id", 1, int.class)
    .setField("name", "Joe", String.class)
    .build();

ClientCache<Integer, BinaryObject> cache = client.cache("persons").withKeepBinary();

cache.put(1, val);

BinaryObject cachedVal = cache.get(1);
```
#### 19.3.2.7.多线程
瘦客户端是单线程且线程安全的。唯一的共享资源是底层的通信管道，同时只有一个线程对管道进行读写，这时其它线程会等待。

>**使用瘦客户端连接池的多线程来改进性能**
目前瘦客户端无法通过多线程来改进吞吐量，但是可以在应用中使用瘦客户端连接池来创建多线程，以改进吞吐量。

#### 19.3.2.8.异步API
>**异步API暂不支持**
虽然二进制客户端协议设计时是支持异步API的，但是Java瘦客户端目前还不支持，异步API的功能下个版本会添加。

#### 19.3.2.9.客户端-服务端兼容性
客户端`ignite-core`的版本号要小于等于服务端`ignite-core`的版本号。

Ignite的服务端会维持二进制协议的向后兼容性，如果两者协议版本不兼容，会抛出`RuntimeException`。
### 19.3.3.安全
#### 19.3.3.1.加密
通过在通信管道上开启SSL/TLS，可以确保瘦客户端上的数据是加密的。
```java
ClientConfiguration clientCfg = new ClientConfiguration()
  .setAddresses("127.0.0.1:10800");

clientCfg
    .setSslMode(SslMode.REQUIRED)
    .setSslClientCertificateKeyStorePath("client.jks")
    .setSslClientCertificateKeyStoreType("JKS")
    .setSslClientCertificateKeyStorePassword("123456")
    .setSslTrustCertificateKeyStorePath("trust.jks")
    .setSslTrustCertificateKeyStoreType("JKS")
    .setSslTrustCertificateKeyStorePassword("123456")
    .setSslKeyAlgorithm("SunX509")
    .setSslTrustAll(false)
    .setSslProtocol(SslProtocol.TLS);

try (IgniteClient client = Ignition.startClient(clientCfg)) {
	...
```
#### 19.3.3.2.认证
如果服务端开启认证，那么用户必须提供凭据。

如果认证失败，会抛出`ClientAuthenticationException`。
```java
ClientConfiguration clientCfg = new ClientConfiguration()
  .setAddresses("127.0.0.1:10800")
  .setUserName("joe")
  .setUserPassword("passw0rd!");

try (IgniteClient client = Ignition.startClient(clientCfg)) {
    ...
}
catch (ClientAuthenticationException e) {
    // Handle authentication failure
}
```
#### 19.3.3.3.授权
目前，Ignite本身还不支持授权，但是提供了授权的机制，允许开发者自定义授权的插件，或者从第三方厂家处获取插件，比如[这个](https://docs.gridgain.com/docs/security-and-audit)。

### 19.3.4.高可用
#### 19.3.4.1.故障转移
Ignite不支持瘦客户端在服务端侧的故障转移，如果客户端接入的服务端下线，瘦客户端会通过重试，然后自动重连到另一个服务端节点来实现故障转移。

配置多个服务端可以开启故障转移机制。
```java
try (IgniteClient client = Ignition.startClient(
  new IgniteClientConfiguration()
  .setAddresses("127.0.0.1:1080", "127.0.0.1:1081", "127.0.0.1:1082")
)) {
  ...
}
catch (IgniteUnavailableException ex) {
    // All the servers are unavailable
}
```
瘦客户端会随机地尝试列表中的服务端，如果所有服务端都不可用，会抛出`ClientConnectionException`。

除非所有的服务端节点都不可用，否则故障转移机制对业务代码来说是透明的，唯一有牵连的就是故障转移查询会返回多个条目，这是针对缓存语义的，考虑下面的代码：
```java
Query<Cache.Entry<Integer, Person>> qry = new ScanQuery<Integer, Person>((i, p) -> p.getName().contains("Smith")).setPageSize(1000);

for (Query<Cache.Entry<Integer, Person>> qry : queries) {
  try (QueryCursor<Cache.Entry<Integer, Person>> cur = cache.query(qry)) {
    for (Cache.Entry<Integer, Person> entry : cur) {
      // Handle the entry ...
```
在`19.3.2.API`章节中说过，扫描和SQL的SELECT查询是按页返回的，如果在迭代过程中客户端接入的服务端节点下线，客户端会从头开始重试，这会导致上面的代码重复处理数据。

有两种方式可以定位问题：

 - 如果数据很小可以放入内存，那么可以获取所有的数据然后放入一个Map：`Map<Integer, Person> res = cur.getAll().stream().collect(Collectors.toMap(Cache.Entry::getKey, Cache.Entry::getValue))`，Map可以解决重复数据的问题；
 - 记住重复的条目，然后幂等地处理这些条目。

### 19.3.5.监控
#### 19.3.5.1.日志
瘦客户端不会记录任何信息，也无法配置记录日志，处理瘦客户端的异常以及决定后续如何处理是应用本身的职责。
#### 19.3.5.2.异常
![](https://files.readme.io/1d15d18-Java_Thin_Client.png)

所有的客户端异常都是非检查异常：

 - `ClientConnectionException`：表示所有的指定服务端节点都不可用；
 - `ClientAuthenticationException`：表示服务端已经开启了认证，但是瘦客户端没有提供凭据，或者提供了无效的凭据。

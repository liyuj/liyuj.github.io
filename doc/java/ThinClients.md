# 19.瘦客户端
## 19.1.瘦客户端
瘦客户端是一个轻量级的Ignite客户端，通过标准的Socket连接接入集群，它不会启动一个JVM进程（不需要Java），不会成为集群拓扑的一部分，也不持有任何数据，也不会参与计算网格的计算。

它所做的只是简单地建立一个与标准Ignite节点的Socket连接，并通过该节点执行所有操作。

瘦客户端基于二进制客户端协议，这样任何语言都可以接入Ignite集群，目前如下的客户端可用：
 
  - Java瘦客户端
  - .NET瘦客户端
  - C++瘦客户端
  - NodeJS瘦客户端
  - Python瘦客户端
  - PHP瘦客户端

## 19.2.二进制客户端协议
### 19.2.1.二进制客户端协议
#### 19.2.1.1.摘要
Ignite的二进制客户端协议使得应用不用启动一个全功能的节点，就可以与已有的集群进行通信。应用使用原始的TCP套接字，就可以接入集群。连接建立之后，就可以使用定义好的格式执行缓存操作。

与集群通信，客户端必须遵守下述的数据格式和通信细节。
#### 19.2.1.2.数据格式

**字节序**

Ignite的二进制客户端协议使用小端字节顺序。

**数据对象**

用户数据，比如缓存的键和值，是以Ignite的二进制对象表示的，一个数据对象可以是标准类型（预定义），也可以是复杂对象，具体可以看[数据格式](#_19-2-2-数据格式)的相关章节。
#### 19.2.1.3.消息格式
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
#### 19.2.1.4.接入

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
#### 19.2.1.5.客户端操作
握手成功之后，客户端就可以执行各种缓存操作了。

 - 键-值查询；
 - SQL和扫描查询；
 - 二进制类型操作；
 - 缓存配置操作。

### 19.2.2.数据格式
标准数据类型表示为类型代码和值的组合。

|字段|长度（字节）|描述|
|---|---|---|
|`type_code`|1|有符号的单字节整数代码，表示值的类型。|
|`value`|可变长度|值本身，类型和大小取决于`type_code`|

下面会详细描述支持的类型及其格式。

#### 19.2.2.1.基础类型
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

#### 19.2.2.2.标准对象

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

#### 19.2.2.3.基础类型数组
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

#### 19.2.2.4.标准对象数组
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

#### 19.2.2.5.对象集合
**对象数组**

类型代码：23

任意类型对象数组。包括任意类型的标准对象、以及各种类型的复杂对象、`NULL`值及其他们的任意组合，这也意味着，集合可以包含其它的集合。

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

#### 19.2.2.6.复杂对象
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

Java：
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
C：
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
**hash_code**

值的哈希编码，它是低位优先的4字节长度，它由不包含头部的内容部分的Java风格的哈希编码计算得来，Ignite引擎用来作比较用，比如用作键的比较。下面是哈希值的计算算法：

Java:
```java
static int dataHashCode(byte[] data) {
  int len = data.length;

  int h = 0;

  for (int i = 0; i < len; i++)
    h = 31 * h + data[i];

  return h;
}
```
C:
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
**length**

这个字段为对象（包括头部）的整体长度，它为低位优先的4字节整型值，通过在当前数据流的位置上简单地增加本字段值的偏移量，可以轻易地忽略整个对象。

**schema_id**

对象模式标识符。它为低位优先4字节值，并由所有对象字段ID的哈希值计算得出。它用于复杂的对象大小优化。Ignite使用`schema_id`来避免将整个模式写入到每个复杂对象值的末尾。相反，它将所有模式存储在二进制元数据存储中，并且只向对象写入字段偏移量。这种优化有助于显著减少包含许多短字段（如整型值）的复杂对象的大小。

如果模式缺失（例如，以原始模式写入整个对象，或者没有任何字段），则`schema_id`字段为0。

::: tip 注意
无法使用`type_id`确定`schema_id`，因为具有相同`type_id`的对象可以具有多个模式，即字段序列。
:::

`schema_id`的计算算法如下：

Java：
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
C：
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

如果使用了这个方式，客户端需要在一个特定的元数据中持有模式，然后将其发送/接收给/自Ignite服务端，具体可以看[二进制类型元数据](/doc/java/ThinClients.md#_19-2-5-二进制类型元数据)的相关章节。

这个场景中`schema`的结构如下：

|字段|长度（字节）|描述|
|---|---|---|
|`field_offset_0`|可变长度，依赖于对象的大小：1,2或4|低位优先无符号整数，对象中字段0的偏移量，从完整对象值的第一个字节开始（即`type_code`的位置）。|
|`field_offset_1`|可变长度，依赖于对象的大小：1,2或4|低位优先无符号整数，对象中字段1的偏移量。|
|`field_offset_N`|可变长度，依赖于对象的大小：1,2或4|低位优先无符号整数，对象中字段N的偏移量。|

**raw_data_offset**

可选字段。仅存在于对象中，如果有任何字段，则以原始模式写入。这时，设置了`HAS_RAW_DATA`标志并且存在原始数据偏移量字段，存储为低位优先4字节。该值指向复杂对象中的原始数据偏移量，从头部的第一个字节开始（即，此字段始终大于头部的长度）。

此字段用于用户以原始模式开始读取时对流进行定位。
#### 19.2.2.7.特殊类型
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

#### 19.2.2.8.序列化和反序列化示例

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
### 19.2.3.键-值查询
本章节会描述可以对缓存进行的键值操作，该键值操作等同于Ignite原生的缓存操作，具体可以看[IgniteCache](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/IgniteCache.html)的文档，每个操作都会有一个[头信息](#_19-2-1-3-消息格式)及与该操作对应的数据。

在[数据格式](#_19-2-2-数据格式)章节，可以参阅可用的数据类型和数据格式规范的清单。

#### 19.2.3.1.操作代码
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

注意上面提到的操作代码，是请求头的一部分，具体可以看[头信息](#_19-2-1-3-消息格式)的相关内容。

#### 19.2.3.2.OP_CACHE_GET
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

请求：

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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting cache value (Data Object)
int resTypeCode = readByteLittleEndian(in);
int value = readIntLittleEndian(in); 
```
#### 19.2.3.3.OP_CACHE_GET_ALL
从一个缓存中获得多个键值对。

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
|键对象+值对象|返回的键值对，不包含缓存中没有的条目，重复多次，次数为前一个参数返回的值|

请求：
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
响应：
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
#### 19.2.3.4.OP_CACHE_PUT
往缓存中写入给定的键值对（会覆盖已有的值）。

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

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);
```
#### 19.2.3.5.OP_CACHE_PUT_ALL
往缓存中写入给定的多个键值对（会覆盖已有的值）。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|
|int|键值对数量|
|键对象+值对象|键值对，重复多次，次数为前一个参数传递的值|

|响应类型|描述|
|---|---|
|头信息|响应头|

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);
```
#### 19.2.3.6.OP_CACHE_CONTAINS_KEY
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

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Result
boolean res = readBooleanLittleEndian(in);
```
#### 19.2.3.7.OP_CACHE_CONTAINS_KEYS
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

请求：
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
响应：
```java

// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting boolean value
boolean res = readBooleanLittleEndian(in);
```
#### 19.2.3.8.OP_CACHE_GET_AND_PUT
往缓存中插入一个键值对，并且返回与该键对应的原值，如果缓存中没有该键，则会创建一个新的条目并返回`null`。

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

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting cache value (Data Object)
int resTypeCode = readByteLittleEndian(in);
int value = readIntLittleEndian(in);
```
#### 19.2.3.9.OP_CACHE_GET_AND_REPLACE
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

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting cache value (Data Object)
int resTypeCode = readByteLittleEndian(in); 
int value = readIntLittleEndian(in); 
```
#### 19.2.3.10.OP_CACHE_GET_AND_REMOVE
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

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting cache value (Data Object)
int resTypeCode = readByte(in);
int value = readInt(in);
```
#### 19.2.3.11.OP_CACHE_PUT_IF_ABSENT
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

请求：
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
响应：
```java
 // Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting boolean value
boolean res = readBooleanLittleEndian(in);
```
#### 19.2.3.12.OP_CACHE_GET_AND_PUT_IF_ABSENT
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

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting cache value (Data Object)
int resTypeCode = readByteLittleEndian(in);
int value = readIntLittleEndian(in); 
```
#### 19.2.3.13.OP_CACHE_REPLACE
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

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

boolean res = readBooleanLittleEndian(in);
```
#### 19.2.3.14.OP_CACHE_REPLACE_IF_EQUALS
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

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

boolean res = readBooleanLittleEndian(in);
```
#### 19.2.3.15.OP_CACHE_CLEAR
清空缓存而不通知监听器或者缓存写入器，具体可以看对应方法的[文档](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/IgniteCache.html#clear--)。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|

|响应类型|描述|
|---|---|
|头信息|响应头|

请求：
```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(5, OP_CACHE_CLEAR, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);
```
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);
```
#### 19.2.3.16.OP_CACHE_CLEAR_KEY
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

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);
```
#### 19.2.3.17.OP_CACHE_CLEAR_KEYS
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

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);
```
#### 19.2.3.18.OP_CACHE_REMOVE_KEY
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

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting boolean value
boolean res = readBooleanLittleEndian(in);
```
#### 19.2.3.19.OP_CACHE_REMOVE_IF_EQUALS
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

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting boolean value
boolean res = readBooleanLittleEndian(in);
```
#### 19.2.3.20.OP_CACHE_GET_SIZE
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

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Number of entries in cache
long cacheSize = readLongLittleEndian(in);
```
#### 19.2.3.21.OP_CACHE_REMOVE_KEYS
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

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);

// Resulting cache value (Data Object)
int resTypeCode = readByte(in);
int value = readInt(in);
```
#### 19.2.3.22.OP_CACHE_REMOVE_ALL
从缓存中删除所有的条目，通知监听器和缓存写入器，具体可以看相关方法的[文档](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/IgniteCache.html#removeAll--)。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|缓存ID，Java风格的缓存名的哈希值|
|byte|0，该字段被废弃，未来会删除|

|响应类型|描述|
|---|---|
|头信息|响应头|

请求：
```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(5, OP_CACHE_REMOVE_ALL, 1, out);

// Cache id
writeIntLittleEndian(cacheName.hashCode(), out);

// Flags = none
writeByteLittleEndian(0, out);
```
响应：
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
### 19.2.4.SQL和扫描查询
#### 19.2.4.1.操作代码
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

注意上面提到的操作代码，是请求头的一部分，具体可以看[头信息](#_19-2-1-3-消息格式)的相关内容。
#### 19.2.4.2.OP_QUERY_SQL
在集群存储的数据中执行SQL查询，查询会返回所有的结果集（键值对）。

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
|键数据对象+值数据对象|键值对形式的记录，重复多次，次数为前一个参数返回的行数值|
|bool|指示是否有更多结果可通过`OP_QUERY_SQL_CURSOR_GET_PAGE`获取。如果为false，则查询游标将自动关闭。|

请求：
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
响应：
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
#### 19.2.4.3.OP_QUERY_SQL_CURSOR_GET_PAGE
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
|键数据对象+值数据对象|键值对形式的记录，重复多次，次数为前一个参数返回的行数值|
|bool|指示是否有更多结果可通过`OP_QUERY_SQL_CURSOR_GET_PAGE`获取。如果为false，则查询游标将自动关闭。|

请求：
```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(8, OP_QUERY_SQL_CURSOR_GET_PAGE, 1, out);

// Cursor Id (received from Sql query operation)
writeLongLittleEndian(cursorId, out); 
```
响应：
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
#### 19.2.4.4.OP_QUERY_SQL_FIELDS
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

请求：
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
响应：
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
#### 19.2.4.5.OP_QUERY_SQL_FIELDS_CURSOR_GET_PAGE
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

请求：
```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(8, QUERY_SQL_FIELDS_CURSOR_GET_PAGE, 1, out);

// Cursor Id
writeLongLittleEndian(1, out);
```
响应：
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
#### 19.2.4.6.OP_QUERY_SCAN
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
|键数据对象+值数据对象|键值对形式的记录，重复多次，次数为前一个参数返回的行数值|
|bool|指示是否有更多结果可通过`OP_QUERY_SCAN_CURSOR_GET_PAGE`获取。如果为false，则查询游标将自动关闭。|

请求：
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
响应：
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
#### 19.2.4.7.OP_QUERY_SCAN_CURSOR_GET_PAGE
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
|键数据对象+值数据对象|键值对形式的记录，重复多次，次数为前一个参数返回的行数值|
|bool|指示是否有更多结果可通过`OP_QUERY_SCAN_CURSOR_GET_PAGE`获取。如果为false，则查询游标将自动关闭。|

#### 19.2.4.8.OP_RESOURCE_CLOSE
关闭一个资源，比如游标。

|请求类型|描述|
|---|---|
|头信息|请求头|
|long|资源ID|

|响应类型|描述|
|---|---|
|头信息|响应头|

请求：
```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(8, OP_RESOURCE_CLOSE, 1, out);

// Resource id
long cursorId = 1;
writeLongLittleEndian(cursorId, out);
```
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);
```
### 19.2.5.二进制类型元数据
#### 19.2.5.1.操作代码
与Ignite服务端节点成功握手后，客户端就可以通过发送带有特定操作代码的请求（请参见下面的请求/响应结构）来执行与二进制类型有关的各种操作了：

|操作|操作代码|
|---|---|
|`OP_GET_BINARY_TYPE_NAME`|3000|
|`OP_REGISTER_BINARY_TYPE_NAME`|3001|
|`OP_GET_BINARY_TYPE`|3002|
|`OP_PUT_BINARY_TYPE`|3003|

注意上面提到的操作代码，是请求头的一部分，具体可以看[头信息](#_19-2-1-3-消息格式)的相关内容。

#### 19.2.5.2.OP_GET_BINARY_TYPE_NAME
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

请求：
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
响应：
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
#### 19.2.5.3.OP_REGISTER_BINARY_TYPE_NAME
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

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

readResponseHeader(in);
```
#### 19.2.5.4.OP_GET_BINARY_TYPE
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
|string|关系键字段名|
|int|BinaryField计数|
|BinaryField*count|BinaryField结构。String：字段名；int：类型ID，Java风格类型名哈希值；int：字段ID，Java风格字段名哈希值|
|bool|是否枚举值，如果为true，则需要传入下面两个参数，否则会被忽略|
|int|*只有在`enum`参数为`true`时才是必须*，枚举字段数量|
|string+int|*只有在`enum`参数为`true`时才是必须*，枚举值，枚举值是一对字面量值（字符串）和一个数值（整型）组成。重复多次，重复次数为前一个参数的值|
|int|BinarySchema计数|
|BinarySchema|BinarySchema结构。int：唯一模式ID；int：模式中字段数；int：字段ID，Java风格字段名哈希值，重复多次，重复次数为模式中字段数量，BinarySchema重复次数为前一个参数数值|

请求：
```java
String type = "ignite.myexamples.model.Person";

DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(4, OP_BINARY_TYPE_GET, 1, out);

// Type id
writeIntLittleEndian(type.hashCode(), out);
```
响应：
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
#### 19.2.5.5.OP_PUT_BINARY_TYPE
在集群中注册二进制类型信息。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|类型ID，Java风格类型名字的哈希值|
|string|类型名|
|string|关系键字段名|
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

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

readResponseHeader(in);
```
### 19.2.6.缓存配置
#### 19.2.6.1.操作代码
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

注意上面提到的操作代码，是请求头的一部分，具体可以看[头信息](#_19-2-1-3-消息格式)的相关内容。

#### 19.2.6.2.OP_CACHE_CREATE_WITH_NAME
通过给定的名字创建缓存，如果缓存的名字中有`*`，则可以应用一个缓存模板，如果给定名字的缓存已经存在，则会抛出异常。

|请求类型|描述|
|---|---|
|头信息|请求头|
|string|缓存名|

|响应类型|描述|
|---|---|
|头信息|响应头|

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

readResponseHeader(in);
```
#### 19.2.6.3.OP_CACHE_GET_OR_CREATE_WITH_NAME
通过给定的名字创建缓存，如果缓存的名字中有`*`，则可以应用一个缓存模板，如果给定名字的缓存已经存在，则什么也不做。

|请求类型|描述|
|---|---|
|头信息|请求头|
|string|缓存名|

|响应类型|描述|
|---|---|
|头信息|响应头|

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

readResponseHeader(in);
```
#### 19.2.6.4.OP_CACHE_GET_NAMES
获取已有缓存的名字。

|请求类型|描述|
|---|---|
|头信息|请求头|

|响应类型|描述|
|---|---|
|头信息|响应头|
|int|缓存数量|
|string|缓存名字，重复多次，重复次数为前一个参数的返回值|

请求：
```java
DataOutputStream out = new DataOutputStream(socket.getOutputStream());

// Request header
writeRequestHeader(5, OP_CACHE_GET_NAMES, 1, out);
```
响应：
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
#### 19.2.6.5.OP_CACHE_GET_CONFIGURATION
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
|CacheKeyConfiguration|CacheKeyConfiguration结构。String：类型名；String：关系键字段名。重复多次，重复次数为前一参数返回值|
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

请求：
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
响应：
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
#### 19.2.6.6.OP_CACHE_CREATE_WITH_CONFIGURATION
用给定的配置创建缓存，如果该缓存已存在会抛出异常。

|请求类型|描述|
|---|---|
|头信息|请求头|
|int|按字节计算的配置的长度（所有的配置参数）|
|short|配置参数计数|
|short + 属性类型|配置属性数据。重复多次，重复次数为前一参数对应值|

配置参数的个数没有要求，但是`Name`必须提供。

缓存的配置数据是以键值对的形式提供的，这里键是`short`类型的属性ID，而值是与键对应的数据，下表描述了所有可用的参数：

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
|401|int+CacheKeyConfiguration|CacheKeyConfiguration计数+CacheKeyConfiguration。CacheKeyConfiguration结构。String：类型名；String：关系键字段名|
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

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);
```
#### 19.2.6.7.OP_CACHE_GET_OR_CREATE_WITH_CONFIGURATION
根据提供的配置创建缓存，如果该缓存已存在则什么都不做。

|请求类型|描述|
|---|---|
|头信息|请求头|
|CacheConfiguration|缓存配置的结构，具体见前述|

|响应类型|描述|
|---|---|
|头信息|响应头|

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

// Response header
readResponseHeader(in);
```
#### 19.2.6.8.OP_CACHE_DESTROY
销毁指定的缓存。

|请求类型|描述|
|---|---|
|头信息|请求头|
缓存ID，Java风格的缓存名的哈希值

|响应类型|描述|
|---|---|
|头信息|响应头|

请求：
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
响应：
```java
// Read result
DataInputStream in = new DataInputStream(socket.getInputStream());

readResponseHeader(in);
```
## 19.3.Java瘦客户端
### 19.3.1.Java瘦客户端
#### 19.3.1.1.摘要
Java瘦客户端将[二进制客户端协议](#_19-2-二进制客户端协议)暴露给Java开发者。

瘦客户端是一个轻量级的Ignite客户端，通过标准的Socket连接接入集群，不会成为集群拓扑的一部分，也不持有任何数据，也不会参与计算网格的计算。它所做的只是简单地建立一个与标准Ignite节点的Socket连接，并通过该节点执行所有操作。

按照下面的步骤操作，可以学习瘦客户端API和开发环境的基础知识。
#### 19.3.1.2.Maven配置
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
```
 def igniteVersion = '2.5.0'

dependencies {
    compile group: 'org.apache.ignite', name: 'ignite-core', version: igniteVersion
}
```
::: tip Ignite版本
瘦客户端和Ignite服务端版本可以不同，只要二进制协议版本是兼容的即可。
:::

#### 19.3.1.3.简单应用
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

#### 19.3.1.4.启动集群
在本地主机上启动集群：

Unix：
```bash
$IGNITE_HOME/bin/ignite.sh $IGNITE_HOME/examples/config/example-ignite.xml

...
[27-02-2018 19:21:00][INFO ][main][GridDiscoveryManager] Topology snapshot [ver=1, servers=1, clients=0, CPUs=8, offheap=1.0GB, heap=1.0GB]
```
Windows：
```batch
%IGNITE_HOME%\bin\ignite.bat %IGNITE_HOME%\examples\config\example-ignite.xml

...
[27-02-2018 19:21:00][INFO ][main][GridDiscoveryManager] Topology snapshot [ver=1, servers=1, clients=0, CPUs=8, offheap=1.0GB, heap=1.0GB]
```
::: tip 服务端启动等待
与Ignite客户端模式不同，它会等待服务端节点的启动，而瘦客户端在无法找到配置好的服务端时，会连接失败。
:::

#### 19.3.1.5.启动应用
在IDE中运行程序，然后会看到如下的输出：
```
>>> Thin client put-get example started.
>>> Created cache [put-get-example].
>>> Saved [Address [street=1545 Jackson Street, zip=94612]] in the cache.
>>> Loaded [Address [street=1545 Jackson Street, zip=94612]] from the cache.
```
::: tip 注意集群拓扑没有发生变化
瘦客户端没有成为集群的一个成员，这是一个轻量级的应用，它会使用二进制客户端协议，通过TCP套接字与集群通信。
:::

### 19.3.2.初始化和配置
`IgniteClient`API是Java瘦客户端的入口。
#### 19.3.2.1.初始化
`Ignition#startClient(ClientConfiguration)`方法会发起一个瘦客户端连接请求。

`IgniteClient`是一个可以自动关闭的资源，因此可以使用**try-with-resources**语句初始化和释放`IgniteClient`。
```java
try (IgniteClient client = Ignition.startClient(
  new ClientConfiguration().setAddresses("127.0.0.1:10800")
)) { 
  // Do something here.
}
```
#### 19.3.2.2.配置
使用`ClientConfiguration`和`ClientCacheConfiguration`可以分别对瘦客户端和客户端缓存进行配置。
#### 19.3.2.3.ClientCache API
`ClientCache`API表示一个缓存，并且可以在存储数据的Ignite集群中执行键-值操作，通过如下的方法可以获得`ClientCache`的实例：

 - `IgniteClient#cache(String)`：假定给定名字的缓存已存在，该方法不会与集群通信确认缓存是否真实存在，如果缓存不存在之后的缓存操作会报错；
 - `IgniteClient#getOrCreateCache(String)`，`IgniteClient#getOrCreateCache(ClientCacheConfiguration)`：获取指定名字的缓存，如果不存在则会创建该缓存，创建时会使用默认的配置；
 - `IgniteClient#createCache(String)`，`IgniteClient#createCache(ClientCacheConfiguration)`：创建指定名字的缓存，如果已经存在则会报错；

使用`IgniteClient#cacheNames()`可以列出所有已有的缓存。
```java
ClientCacheConfiguration cacheCfg = new ClientCacheConfiguration()
  .setName("References")
  .setCacheMode(CacheMode.REPLICATED)
  .setWriteSynchronizationMode(CacheWriteSynchronizationMode.FULL_SYNC);

ClientCache<Integer, String> cache = client.getOrCreateCache(cacheCfg);
```
#### 19.3.2.4.多线程
瘦客户端是单线程且线程安全的。唯一的共享资源是底层的通信管道，同时只有一个线程对管道进行读写，这时其它线程会等待其完成。

::: warning 使用瘦客户端连接池的多线程来改进性能
目前瘦客户端无法通过多线程来改进吞吐量，但是可以在应用中使用瘦客户端连接池来创建多线程，以改进吞吐量。
:::
#### 19.3.2.5.异步API
::: tip 异步API暂不支持
虽然二进制客户端协议设计时是支持异步API的，但是Java瘦客户端目前还不支持，异步API的功能下个版本会添加。
:::
#### 19.3.2.6.客户端-服务端兼容性
客户端`ignite-core`的版本号要小于等于服务端`ignite-core`的版本号。

Ignite的服务端会维持二进制协议的向后兼容性，如果两者协议版本不兼容，会抛出`RuntimeException`。
#### 19.3.2.7.故障转移
Ignite不支持服务器端的瘦客户端故障转移。在客户端连接到的服务端停机时，瘦客户端通过自动重连到其它服务端并重试操作来提供故障转移。

配置多个服务端以启用故障转移机制：
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
瘦客户端会随机地尝试列表中所有的服务器，如果都不可用会抛出`ClientConnectionException`。

除非所有服务端都变为不可用，否则故障转移机制对业务代码来说几乎是透明的，唯一的问题是失败的查询返回重复的条目，这与缓存语义相反。考虑此代码：
```java
Query<Cache.Entry<Integer, Person>> qry = new ScanQuery<Integer, Person>((i, p) -> p.getName().contains("Smith")).setPageSize(1000);

for (Query<Cache.Entry<Integer, Person>> qry : queries) {
  try (QueryCursor<Cache.Entry<Integer, Person>> cur = cache.query(qry)) {
    for (Cache.Entry<Integer, Person> entry : cur) {
      // Handle the entry ...
```
正如API章节所解释的，扫描和SQL SELECT查询是按页检索数据。如果客户端连接的服务端在迭代条目时停机，客户端将从头进行重试。这使得上面的代码会处理已经处理过的条目。

解决这个问题有两种方法：

 - 如果数据量较小足够放入内存，那么获取所有数据后可以将其放入一个Map：`Map<Integer, Person> res = cur.getAll().stream().collect(Collectors.toMap(Cache.Entry::getKey, Cache.Entry::getValue))`，Map会处理掉重复的条目；
 - 针对条目可能重复的问题，对条目进行幂等处理。

### 19.3.3.键-值
#### 19.3.3.1.支持的JCache API
目前，瘦客户端只实现了[JCache](https://jcp.org/aboutJava/communityprocess/final/jsr107/index.html)的一个子集，因此并没有实现`javax.cache.Cache`（`ClientCacheConfiguration`也没有实现`javax.cache.configuration`）。

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
#### 19.3.3.2.扫描查询
使用`ScanQuery<K, V>`可以在服务端使用Java谓词对数据进行过滤，然后在客户端对过滤后的结果集进行迭代。

过滤后的条目是按页传输到客户端的，这样每次只有一个页面的数据会被加载到客户单的内存，页面大小可以通过`ScanQuery#setPageSize(int)`进行配置。
```java
Query<Cache.Entry<Integer, Person>> qry = new ScanQuery<Integer, Person>((i, p) -> p.getName().contains("Smith")).setPageSize(1000);

for (Query<Cache.Entry<Integer, Person>> qry : queries) {
  try (QueryCursor<Cache.Entry<Integer, Person>> cur = cache.query(qry)) {
    for (Cache.Entry<Integer, Person> entry : cur) {
      // Handle the entry ...
```
### 19.3.4.SQL
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
### 19.3.5.二进制类型
瘦客户端完全支持[二进制编组器](/doc/java/README.md#_1-10-二进制编组器)章节中描述的二进制对象API。

使用`CacheClient#withKeepBinary()`将缓存切换到二进制模式，然后直接处理Ignite的二进制对象，可以避免序列化/反序列化。

使用`IgniteClient#binary()`获取`IgniteBinary`的实例并从头构建对象。
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
### 19.3.6.安全
#### 19.3.6.1.加密
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
#### 19.3.6.2.认证
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
::: tip 确保开启服务端的认证
确保[服务端的认证](/doc/java/Security.md#_4-2-高级安全)已开启，并且在凭据存储中配置了客户端凭据。
:::
#### 19.3.6.3.授权
目前，Ignite本身还不支持授权，但是提供了授权的机制，允许开发者自定义授权的插件，或者从第三方厂家处获取插件，比如[这个](https://docs.gridgain.com/docs/security-and-audit)。
## 19.4.Node.JS瘦客户端
### 19.4.1.Node.js瘦客户端
#### 19.4.1.1.摘要
这个瘦客户端使得Node.js应用可以通过[二进制客户端协议](#_19-2-二进制客户端协议)与Ignite集群进行交互。

瘦客户端是一个轻量级的Ignite客户端，通过标准的Socket连接接入集群，它不会启动一个JVM进程（不需要Java），不会成为集群拓扑的一部分，也不持有任何数据，也不会参与计算网格的计算。

它所做的只是简单地建立一个与标准Ignite节点的Socket连接，并通过该节点执行所有操作。
#### 19.4.1.2.入门
**先决条件**

 - [Node.js](https://nodejs.org/en/)的版本要求是8.0及以上，可以下载Node.js针对特定平台预编译好的[二进制安装包](https://nodejs.org/en/download/)，也可以使用[包管理器](https://nodejs.org/en/download/package-manager)安装Node.js；
 - [最新版本](https://ignite.apache.org/download.cgi)的Ignite。

`node`和`npm`安装完之后，就可以选择下面中的一个安装选项：

**通过npm进行安装**

通过执行下面的命令来安装Node.js的瘦客户端包：

```bash
npm install -g apache-ignite-client
```
**通过源代码进行安装**

如果希望从Ignite的仓库构建和安装瘦客户端包，可以按照如下步骤操作：

 1. 克隆或者复制Ignite的仓库[https://github.com/apache/ignite.git](https://github.com/apache/ignite.git)到`local_ignite_path`；
 2. 切换到`local_ignite_path/modules/platforms/nodejs`文件夹；
 3. 执行`npm link`命令；
 4. 执行`npm link apache-ignite-client`命令（只针对示例和测试）。

```bash
cd local_ignite_path/modules/platforms/nodejs
npm link
npm link apache-ignite-client #linking examples (optional)
```
#### 19.4.1.3.运行示例
为了方便入门，这里使用的是随着每个Ignite发行版发布的一个现成的[示例](https://apacheignite.readme.io/v2.7/docs/[https://github.com/apache/ignite/tree/master/modules/platforms/nodejs/examples])。

1.运行Ignite的服务端：

在用Node.js瘦客户端接入Ignite之前，需要启动至少一个Ignite服务端节点。要使用默认的配置启动一个集群节点，打开终端，假定位于`IGNITE_HOME`（Ignite安装文件夹），只需要输入：

Unix：
```bash
./ignite.sh
```
Windows：
```batch
ignite.bat
```
2.链接Ignite的Node.js示例（如果还没做）：
```bash
cd {ignite}/modules/platforms/nodejs/examples # navigate to examples folder
npm link apache-ignite-client #link examples
```
必要的时候，要修改源文件中`ENDPOINT`常量，它表示一个远程的Ignite节点端点，默认值为`127.0.0.1:10800`。

3.通过调用`node <example_file_name>.js`来运行这个示例，如下：
```bash
node CachePutGetExample.js
```
::: tip Node.js示例文件
Node.js瘦客户端有完整的直接可用的[示例](https://github.com/apache/ignite/tree/master/modules/platforms/nodejs/examples)，他们可以演示客户端的行为。
:::
### 19.4.2.初始化和配置
本文会描述使用Node.js瘦客户端与Ignite集群进行交互的基本步骤。

在用Node.js瘦客户端接入Ignite之前，需要启动至少一个Ignite服务端节点，比如，可以使用`ignite.sh`脚本：

Unix：
```bash
./ignite.sh
```
Windows：
```batch
ignite.bat
```
#### 19.4.2.1.初始化IgniteClient
客户端的使用始于`IgniteClient`类实例的创建，它会将Node.js应用接入Ignite集群。其构造函数有一个可选的参数`onStateChanged`回调函数，每次客户端跳转到新的连接状态时都会调用该回调函数（请参见下文）。

可以根据需要创建尽可能多的`IgniteClient`实例，它们都将独立工作。
```javascript
const IgniteClient = require('apache-ignite-client');

const igniteClient = new IgniteClient(onStateChanged);

function onStateChanged(state, reason) {
    if (state === IgniteClient.STATE.CONNECTED) {
        console.log('Client is started');
    }
    else if (state === IgniteClient.STATE.DISCONNECTED) {
        console.log('Client is stopped');
        if (reason) {
            console.log(reason);
        }
    }
}
```
#### 19.4.2.2.配置IgniteClient
下一步是为客户端连接创建配置，可以通过注入`IgniteClientConfiguration`类实例实现。

配置的一个必要部分（在构造函数中指定）是Ignite节点的端点列表。至少要指定一个端点。客户端只会连接到一个节点（从提供的列表中随机选一个端点）。其它节点（如果提供的话）由客户端用于`故障转移重连算法`：如果当前连接断开，客户端将尝试重连到列表中的下一个随机端点。

可以使用其它方法指定配置的可选部分，这些方法包括：

 - 通过用户名/密码进行认证；
 - SSL/TLS连接；
 - Node.js连接选项。

客户端默认会使用Node.js定义的默认连接选项建立一个不安全的连接，即不使用认证。

下面的示例显示了如何对客户端进行配置：
```javascript
const IgniteClient = require('apache-ignite-client');
const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;

const igniteClientConfiguration = new IgniteClientConfiguration('127.0.0.1:10800');
```
下一个示例显示如何在客户端配置中添加用户名/密码和额外的连接选项：
```javascript
const IgniteClient = require('apache-ignite-client');
const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;

const igniteClientConfiguration = new IgniteClientConfiguration('127.0.0.1:10800').
    setUserName('ignite').
    setPassword('ignite').
    setConnectionOptions(false, { 'timeout' : 0 });
```
#### 19.4.2.3.接入集群
下一步是将客户端连接到Ignite集群。在`connect`方法中指定了客户端连接的配置，其中包括要连接到的端点。

客户端有三种连接状态：`CONNECTING`、`CONNECTED`、`DISCONNECTED`。如果在客户端的构造函数中有回调函数，则该状态会通过`onStateChanged`回调函数反馈。

只有在`CONNECTED`状态下，才能与Ignite集群进行交互。

如果客户端意外地断开连接，它会自动跳转到`CONNECTING`状态，并尝试使用`故障转移重连算法`重新连接。如果无法重连到所提供列表中的所有端点，则客户端将跳转到`DISCONNECTED`状态。

应用程序随时都可以调用`disconnect`方法将客户端强制跳转到`DISCONNECTED`状态。

当客户端断开连接时，应用可以使用相同或不同的配置（例如使用不同的端点列表）再次调用`connect`方法。
```javascript
const IgniteClient = require('apache-ignite-client');
const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;

async function connectClient() {
    const igniteClient = new IgniteClient(onStateChanged);
    try {
        const igniteClientConfiguration = new IgniteClientConfiguration(
          '127.0.0.1:10800', '127.0.0.1:10801', '127.0.0.1:10802');
        // connect to Ignite node
        await igniteClient.connect(igniteClientConfiguration);
    }
    catch (err) {
        console.log(err.message);
    }
}

function onStateChanged(state, reason) {
    if (state === IgniteClient.STATE.CONNECTED) {
        console.log('Client is started');
    }
    else if (state === IgniteClient.STATE.CONNECTING) {
        console.log('Client is connecting');
    }
    else if (state === IgniteClient.STATE.DISCONNECTED) {
        console.log('Client is stopped');
        if (reason) {
            console.log(reason);
        }
    }
}

connectClient();
```
#### 19.4.2.4.配置缓存
下一步是获取一个缓存实例，一个用于访问存储在Ignite中的数据的`CacheClient`类实例。

瘦客户端提供了几种方法来处理Ignite缓存和创建缓存实例：按名称获取缓存、使用指定名称和可选缓存配置创建缓存、获取或创建缓存、销毁缓存等。

对于相同或不同的Ignite缓存，可以根据需要获取任意数量的缓存实例，并且可以对它们并行处理。

以下示例显示如何按名称访问缓存以及随后销毁它：
```javascript
const IgniteClient = require('apache-ignite-client');
const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;

async function getOrCreateCacheByName() {
    const igniteClient = new IgniteClient();
    try {
        await igniteClient.connect(new IgniteClientConfiguration('127.0.0.1:10800'));
        // get or create cache by name
        const cache = await igniteClient.getOrCreateCache('myCache');

        // perform cache key-value operations
        // ...

        // destroy cache
        await igniteClient.destroyCache('myCache');
    }
    catch (err) {
        console.log(err.message);
    }
    finally {
        igniteClient.disconnect();
    }
}

getOrCreateCacheByName();
```
下一个示例显示如何通过名字和配置访问缓存：
```javascript
const IgniteClient = require('apache-ignite-client');
const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;
const CacheConfiguration = IgniteClient.CacheConfiguration;

async function createCacheByConfiguration() {
    const igniteClient = new IgniteClient();
    try {
        await igniteClient.connect(new IgniteClientConfiguration('127.0.0.1:10800'));
        // create cache by name and configuration
        const cache = await igniteClient.createCache(
            'myCache',
            new CacheConfiguration().setSqlSchema('PUBLIC'));
    }
    catch (err) {
        console.log(err.message);
    }
    finally {
        igniteClient.disconnect();
    }
}

createCacheByConfiguration();
```
下面的示例显示如何通过名字获取一个已有的缓存：
```javascript
const IgniteClient = require('apache-ignite-client');
const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;

async function getExistingCache() {
    const igniteClient = new IgniteClient();
    try {
        await igniteClient.connect(new IgniteClientConfiguration('127.0.0.1:10800'));
        // get existing cache by name
        const cache = igniteClient.getCache('myCache');
    }
    catch (err) {
        console.log(err.message);
    }
    finally {
        igniteClient.disconnect();
    }
}

getExistingCache();
```
**类型映射配置**

可以为缓存的键和/或值指定具体的Ignite类型。如果键和/或值是非基础类型（如映射、集合、复杂对象等），也可以为该对象的字段指定具体的Ignite类型。

如果没有为某些字段显式指定Ignite类型，客户端将尝试在JavaScript类型和Ignite对象类型之间进行自动默认映射。

有关类型和映射的更多详细信息，请参见[数据类型](#_19-4-2-5-数据类型)部分。
```javascript
const IgniteClient = require('apache-ignite-client');
const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;
const ObjectType = IgniteClient.ObjectType;
const MapObjectType = IgniteClient.MapObjectType;

async function setCacheKeyValueTypes() {
    const igniteClient = new IgniteClient();
    try {
        await igniteClient.connect(new IgniteClientConfiguration('127.0.0.1:10800'));
        const cache = await igniteClient.getOrCreateCache('myCache');
        // set cache key/value types
        cache.setKeyType(ObjectType.PRIMITIVE_TYPE.INTEGER).
            setValueType(new MapObjectType(
                MapObjectType.MAP_SUBTYPE.LINKED_HASH_MAP,
                ObjectType.PRIMITIVE_TYPE.SHORT,
                ObjectType.PRIMITIVE_TYPE.BYTE_ARRAY));
    }
    catch (err) {
        console.log(err.message);
    }
    finally {
        igniteClient.disconnect();
    }
}

setCacheKeyValueTypes();
```
到这里，就可以对存储的数据进行处理，或者将数据放入Ignite。
#### 19.4.2.5.数据类型
在二进制客户端协议中定义的Ignite类型和JavaScript类型之间，客户端支持两种映射方式：

 - 显式映射；
 - 默认映射；

**显式映射**

每次应用通过客户端的API向Ignite写入或读取字段时都会发生映射。这里的字段是任何存储在Ignite中的数据，包括一个Ignite条目的全部键或值、数组或集合的元素、复杂对象的字段等。

使用客户端API的方法，应用可以显式指定特定字段的Ignite类型。客户端使用此信息将字段从JavaScript转换为Java类型，而在读/写操作期间反之亦然。作为读取操作的结果，该字段被转换为JavaScript类型。在写操作的输入中验证相应的JavaScript类型。

如果应用没有为字段显式指定Ignite类型，则客户端在字段读/写操作期间使用默认映射。

**默认映射**

Ignite和JavaScript类型之间的默认映射说明在[这里](https://rawgit.com/apache/ignite/master/modules/platforms/nodejs/api_spec/ObjectType.html)。

**复杂对象类型支持**

客户端提供了两种操作Ignite复杂对象类型的方法：反序列化形式和二进制形式。

应用可以通过`ComplexObjectType`类的实例指定字段的Ignite类型，它是一个JavaScript对象实例的引用。这时当应用读取字段的值时，客户端将反序列化接收到的Ignite复杂对象，并将其作为相应JavaScript对象的实例返回给客户端。当应用写入字段值时，客户端需要相应的JavaScript对象的实例，并将其序列化为Ignite复杂对象。

如果应用没有指定字段的Ignite类型并读取字段的值，客户端会将接收到的Ignite复杂对象作为`BinaryObject`类的实例返回（Ignite复杂对象的二进制形式）。`BinaryObject`无需反序列化就可以对其内容进行处理（读取和写入对象字段的值、添加和删除字段等），而且应用还可以从JavaScript对象创建`BinaryObject`类的实例。如果该字段没有显式指定的Ignite类型，则应用程序可以将二进制对象作为字段的值写入Ignite。

客户端负责从/在Ignite集群获取或注册有关Ignite复杂对象类型的信息（包括模式）。当需要从/到Ignite点读取或写入Ignite复杂对象时，这个过程由客户端自动完成。
#### 19.4.2.6.支持的API
客户端API的规范在[这里](https://rawgit.com/apache/ignite/master/modules/platforms/nodejs/api_spec/index.html)。

除了下面不适用的特性之外，客户端支持[二进制客户端协议](#_19-2-二进制客户端协议)中的所有操作和类型：

 - `OP_REGISTER_BINARY_TYPE_NAME`和`OP_GET_BINARY_TYPE_NAME`操作是不支持的；
 - `OP_QUERY_SCAN`操作的过滤器对象是不支持的，`OP_QUERY_SCAN`操作本身是支持的；
 - 无法注册一个新的Ignite枚举类型，对一个已有的Ignite枚举类型项目的读写是支持的；

下面的附加特性是支持的：

 - 通过用户名/密码进行认证；
 - SSL/TLS连接；
 - 故障转移重连算法

#### 19.4.2.7.启用调试
要打开/关闭客户端的调试输出开关（包括错误日志），可以调用`IgniteClient`实例的`setDebug()`方法，调试输出默认是关闭的。
```javascript
const IgniteClient = require('apache-ignite-client');

const igniteClient = new IgniteClient();
igniteClient.setDebug(true);
```
### 19.4.3.键-值
#### 19.4.3.1.键-值操作
`CacheClient`类为缓存的键值数据提供了键值操作的方法，`put`、`get`、`putAll`、`getAll`、`replace`等，下面是一个示例：
```javascript
const IgniteClient = require('apache-ignite-client');
const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;
const ObjectType = IgniteClient.ObjectType;
const CacheEntry = IgniteClient.CacheEntry;

async function performCacheKeyValueOperations() {
    const igniteClient = new IgniteClient();
    try {
        await igniteClient.connect(new IgniteClientConfiguration('127.0.0.1:10800'));
        const cache = (await igniteClient.getOrCreateCache('myCache')).
            setKeyType(ObjectType.PRIMITIVE_TYPE.INTEGER);
        // put and get value
        await cache.put(1, 'abc');
        const value = await cache.get(1);

        // put and get multiple values using putAll()/getAll() methods
        await cache.putAll([new CacheEntry(2, 'value2'), new CacheEntry(3, 'value3')]);
        const values = await cache.getAll([1, 2, 3]);

        // removes all entries from the cache
        await cache.clear();
    }
    catch (err) {
        console.log(err.message);
    }
    finally {
        igniteClient.disconnect();
    }
}

performCacheKeyValueOperations();
```
#### 19.4.3.2.扫描查询
Node.js客户端完全支持Ignite的扫描查询。查询方法会返回一个游标类，它可以用于对结果集的延迟迭代，或者一次获取所有的结果。

首先，通过创建和配置一个`ScanQuery`类的实例来定义查询。

然后，将`ScanQuery`实例传递给`Cache`实例并执行查询，最后使用`Cursor`实例来对返回的查询结果进行迭代或者获取所有数据。
```javascript
const IgniteClient = require('apache-ignite-client');
const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;
const ObjectType = IgniteClient.ObjectType;
const CacheEntry = IgniteClient.CacheEntry;
const ScanQuery = IgniteClient.ScanQuery;

async function performScanQuery() {
    const igniteClient = new IgniteClient();
    try {
        await igniteClient.connect(new IgniteClientConfiguration('127.0.0.1:10800'));
        const cache = (await igniteClient.getOrCreateCache('myCache')).
            setKeyType(ObjectType.PRIMITIVE_TYPE.INTEGER);

        // put multiple values using putAll()
        await cache.putAll([
            new CacheEntry(1, 'value1'),
            new CacheEntry(2, 'value2'),
            new CacheEntry(3, 'value3')]);

        // create and configure scan query
        const scanQuery = new ScanQuery().
            setPageSize(1);
        // obtain scan query cursor
        const cursor = await cache.query(scanQuery);
        // getAll cache entries returned by the scan query
        for (let cacheEntry of await cursor.getAll()) {
            console.log(cacheEntry.getValue());
        }

        await igniteClient.destroyCache('myCache');
    }
    catch (err) {
        console.log(err.message);
    }
    finally {
        igniteClient.disconnect();
    }
}

performScanQuery();
```
### 19.4.4.SQL
#### 19.4.4.1.SQL查询
Node.js客户端完全支持Ignite的SQL查询，查询方法会返回一个游标类，它可以用于对结果集的延迟迭代，或者一次获取所有的结果。

首先，通过创建和配置一个`SqlQuery`类的实例来定义查询。

然后，将`SqlQuery`实例传递给`Cache`实例并执行查询，最后使用`Cursor`实例来对返回的查询结果进行迭代或者获取所有数据。
```javascript
const IgniteClient = require('apache-ignite-client');
const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;
const CacheConfiguration = IgniteClient.CacheConfiguration;
const QueryEntity = IgniteClient.QueryEntity;
const QueryField = IgniteClient.QueryField;
const ObjectType = IgniteClient.ObjectType;
const ComplexObjectType = IgniteClient.ComplexObjectType;
const CacheEntry = IgniteClient.CacheEntry;
const SqlQuery = IgniteClient.SqlQuery;

async function performSqlQuery() {
    const igniteClient = new IgniteClient();
    try {
        await igniteClient.connect(new IgniteClientConfiguration('127.0.0.1:10800'));
        // cache configuration required for sql query execution
        const cacheConfiguration = new CacheConfiguration().
            setQueryEntities(
                new QueryEntity().
                    setValueTypeName('Person').
                    setFields([
                        new QueryField('name', 'java.lang.String'),
                        new QueryField('salary', 'java.lang.Double')
                    ]));
        const cache = (await igniteClient.getOrCreateCache('sqlQueryPersonCache', cacheConfiguration)).
            setKeyType(ObjectType.PRIMITIVE_TYPE.INTEGER).
            setValueType(new ComplexObjectType({ 'name' : '', 'salary' : 0 }, 'Person'));

        // put multiple values using putAll()
        await cache.putAll([
            new CacheEntry(1, { 'name' : 'John Doe', 'salary' : 1000 }),
            new CacheEntry(2, { 'name' : 'Jane Roe', 'salary' : 2000 }),
            new CacheEntry(2, { 'name' : 'Mary Major', 'salary' : 1500 })]);

        // create and configure sql query
        const sqlQuery = new SqlQuery('Person', 'salary > ? and salary <= ?').
            setArgs(900, 1600);
        // obtain sql query cursor
        const cursor = await cache.query(sqlQuery);
        // getAll cache entries returned by the sql query
        for (let cacheEntry of await cursor.getAll()) {
            console.log(cacheEntry.getValue());
        }

        await igniteClient.destroyCache('sqlQueryPersonCache');
    }
    catch (err) {
        console.log(err.message);
    }
    finally {
        igniteClient.disconnect();
    }
}

performSqlQuery();
```
#### 19.4.4.2.SQLFieldsQuery
这种类型的查询用于获取作为SQL查询结果集一部分的部分字段，执行诸如INSERT、UPDATE、DELETE、CREATE等DML和DDL语句。

首先，通过创建和配置`SqlFieldsQuery`类的实例来定义查询。然后，将`SqlFieldsQuery`传递到`Cache`实例的查询方法，并获取`SqlFieldsCursor`类的实例。最后，使用`SqlFieldsCursor`实例迭代或获取查询返回的所有元素。
```javascript
const IgniteClient = require('apache-ignite-client');
const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;
const CacheConfiguration = IgniteClient.CacheConfiguration;
const ObjectType = IgniteClient.ObjectType;
const CacheEntry = IgniteClient.CacheEntry;
const SqlFieldsQuery = IgniteClient.SqlFieldsQuery;

async function performSqlFieldsQuery() {
    const igniteClient = new IgniteClient();
    try {
        await igniteClient.connect(new IgniteClientConfiguration('127.0.0.1:10800'));
        const cache = await igniteClient.getOrCreateCache('myPersonCache', new CacheConfiguration().
            setSqlSchema('PUBLIC'));

        // create table using SqlFieldsQuery
        (await cache.query(new SqlFieldsQuery(
           'CREATE TABLE Person (id INTEGER PRIMARY KEY, firstName VARCHAR, lastName VARCHAR, salary DOUBLE)'))).getAll();

        // insert data into the table
        const insertQuery = new SqlFieldsQuery('INSERT INTO Person (id, firstName, lastName, salary) values (?, ?, ?, ?)').
            setArgTypes(ObjectType.PRIMITIVE_TYPE.INTEGER);
        (await cache.query(insertQuery.setArgs(1, 'John', 'Doe', 1000))).getAll();
        (await cache.query(insertQuery.setArgs(2, 'Jane', 'Roe', 2000))).getAll();

        // obtain sql fields cursor
        const sqlFieldsCursor = await cache.query(
            new SqlFieldsQuery("SELECT concat(firstName, ' ', lastName), salary from Person").
                setPageSize(1));

        // iterate over elements returned by the query
        do {
            console.log(await sqlFieldsCursor.getValue());
        } while (sqlFieldsCursor.hasMore());

        // drop the table
        (await cache.query(new SqlFieldsQuery("DROP TABLE Person"))).getAll();
    }
    catch (err) {
        console.log(err.message);
    }
    finally {
        igniteClient.disconnect();
    }
}

performSqlFieldsQuery();
```
### 19.4.5.二进制类型
除了下面不适用的特性之外，客户端支持[二进制客户端协议](#_19-2-二进制客户端协议)中的所有操作和类型：

 - `OP_REGISTER_BINARY_TYPE_NAME`和`OP_GET_BINARY_TYPE_NAME`操作是不支持的；
 - `OP_QUERY_SCAN`操作的过滤器对象是不支持的，`OP_QUERY_SCAN`操作本身是支持的；
 - 无法注册一个新的Ignite枚举类型，对一个已有的Ignite枚举类型项目的读写是支持的；

下面的示例显示了如何处理复杂对象和二进制对象：
```javascript
const IgniteClient = require('apache-ignite-client');
const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;
const ObjectType = IgniteClient.ObjectType;
const CacheEntry = IgniteClient.CacheEntry;
const ComplexObjectType = IgniteClient.ComplexObjectType;

class Person {
    constructor(id = null, name = null, salary = null) {
        this.id = id;
        this.name = name;
        this.salary = salary;
    }
}

async function putGetComplexAndBinaryObjects() {
    const igniteClient = new IgniteClient();
    try {
        await igniteClient.connect(new IgniteClientConfiguration('127.0.0.1:10800'));
        const cache = await igniteClient.getOrCreateCache('myPersonCache');
        // Complex Object type for JavaScript Person class instances
        const personComplexObjectType = new ComplexObjectType(new Person(0, '', 0)).
            setFieldType('id', ObjectType.PRIMITIVE_TYPE.INTEGER); 
        // set cache key and value types
        cache.setKeyType(ObjectType.PRIMITIVE_TYPE.INTEGER).
            setValueType(personComplexObjectType);
        // put Complex Objects to the cache
        await cache.put(1, new Person(1, 'John Doe', 1000));
        await cache.put(2, new Person(2, 'Jane Roe', 2000));
        // get Complex Object, returned value is an instance of Person class
        const person = await cache.get(1);
        console.log(person);

        // new CacheClient instance of the same cache to operate with BinaryObjects
        const binaryCache = igniteClient.getCache('myPersonCache').
            setKeyType(ObjectType.PRIMITIVE_TYPE.INTEGER);
        // get Complex Object from the cache in a binary form, returned value is an instance of BinaryObject class
        let binaryPerson = await binaryCache.get(2);
        console.log('Binary form of Person:');       
        for (let fieldName of binaryPerson.getFieldNames()) {
            let fieldValue = await binaryPerson.getField(fieldName);
            console.log(fieldName + ' : ' + fieldValue);
        }
        // modify Binary Object and put it to the cache
        binaryPerson.setField('id', 3, ObjectType.PRIMITIVE_TYPE.INTEGER).
            setField('name', 'Mary Major');
        await binaryCache.put(3, binaryPerson);

        // get Binary Object from the cache and convert it to JavaScript Object
        binaryPerson = await binaryCache.get(3);
        console.log(await binaryPerson.toObject(personComplexObjectType));

        await igniteClient.destroyCache('myPersonCache');
    }
    catch (err) {
        console.log(err.message);
    }
    finally {
        igniteClient.disconnect();
    }
}

putGetComplexAndBinaryObjects();
```
### 19.4.6.安全
#### 19.4.6.1.认证
关于如何在Ignite的集群端打开和配置认证，说明在[这里](/doc/java/Security.md#_4-2-高级安全)。在Node.js端，将用户名/密码传递给`IgniteClientConfiguration`的方法如下：
```javascript
const ENDPOINT = 'localhost:10800';
const USER_NAME = 'ignite';
const PASSWORD = 'ignite';

const cfg = new IgniteClientConfiguration(ENDPOINT).
	setUserName(USER_NAME).
  setPassword(PASSWORD);
```
#### 19.4.6.2.加密
1.获取TLS所需的证书：

 - 或获取指定的Ignite服务端可用的现有证书；
 - 或者为正在使用的Ignite服务端生成新证书；

2.需要以下文件：
 
 - `keystore.jks`，`truststore.jks` - 用于服务端；
 - `client.key`，`client.crt`，`ca.crt` - 用于客户端；

3.设置Ignite服务端以支持[SSL\TLS](/doc/java/Security.md#_4-1-ssl和tls)，在启动过程中提供获得的`keystore.jks`和`truststore.jks`证书：
4.将`client.key`、`client.crt`和`ca.crt`文件放在客户端本地的某个位置：
5.根据需要，更新下面示例中的常量TLS_KEY_FILE_NAME、TLS_CERT_FILE_NAME和TLS_CA_FILE_NAME：
6.根据需要更新下面示例中的`USER_NAME`和`PASSWORD`常量。

```javascript
const FS = require('fs');
const IgniteClient = require('apache-ignite-client');
const ObjectType = IgniteClient.ObjectType;
const ComplexObjectType = IgniteClient.ComplexObjectType;
const BinaryObject = IgniteClient.BinaryObject;
const CacheEntry = IgniteClient.CacheEntry;
const ScanQuery = IgniteClient.ScanQuery;
const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;

const ENDPOINT = 'localhost:10800';
const USER_NAME = 'ignite';
const PASSWORD = 'ignite';

const TLS_KEY_FILE_NAME = __dirname + '/certs/client.key';
const TLS_CERT_FILE_NAME = __dirname + '/certs/client.crt';
const TLS_CA_FILE_NAME = __dirname + '/certs/ca.crt';

const CACHE_NAME = 'AuthTlsExample_cache';

// This example demonstrates how to establish a secure connection to an Ignite node and use username/password authentication,
// as well as basic Key-Value Queries operations for primitive types:
// - connects to a node using TLS and providing username/password
// - creates a cache, if it doesn't exist
//   - specifies key and value type of the cache
// - put data of primitive types into the cache
// - get data from the cache
// - destroys the cache
class AuthTlsExample {

    async start() {
        const igniteClient = new IgniteClient(this.onStateChanged.bind(this));
        try {
            const connectionOptions = {
                'key' : FS.readFileSync(TLS_KEY_FILE_NAME),
                'cert' : FS.readFileSync(TLS_CERT_FILE_NAME),
                'ca' : FS.readFileSync(TLS_CA_FILE_NAME)
            };
            await igniteClient.connect(new IgniteClientConfiguration(ENDPOINT).
                setUserName(USER_NAME).
                setPassword(PASSWORD).
                setConnectionOptions(true, connectionOptions));

            const cache = (await igniteClient.getOrCreateCache(CACHE_NAME)).
                setKeyType(ObjectType.PRIMITIVE_TYPE.INTEGER).
                setValueType(ObjectType.PRIMITIVE_TYPE.SHORT_ARRAY);

            await this.putGetData(cache);

            await igniteClient.destroyCache(CACHE_NAME);
        }
        catch (err) {
            console.log('ERROR: ' + err.message);
        }
        finally {
            igniteClient.disconnect();
        }
    }

    async putGetData(cache) {
        let keys = [1, 2, 3];
        let values = keys.map(key => this.generateValue(key));

        // put multiple values in parallel
        await Promise.all([
            await cache.put(keys[0], values[0]),
            await cache.put(keys[1], values[1]),
            await cache.put(keys[2], values[2])
        ]);
        console.log('Cache values put successfully');

        // get values sequentially
        let value;
        for (let i = 0; i < keys.length; i++) {
            value = await cache.get(keys[i]);
            if (!this.compareValues(value, values[i])) {
                console.log('Unexpected cache value!');
                return;
            }
        }
        console.log('Cache values get successfully');
    }

    compareValues(array1, array2) {
        return array1.length === array2.length &&
            array1.every((value1, index) => value1 === array2[index]);
    }

    generateValue(key) {
        const length = key + 5;
        const result = new Array(length);
        for (let i = 0; i < length; i++) {
            result[i] = key * 10 + i;
        }
        return result;
    }

    onStateChanged(state, reason) {
        if (state === IgniteClient.STATE.CONNECTED) {
            console.log('Client is started');
        }
        else if (state === IgniteClient.STATE.DISCONNECTED) {
            console.log('Client is stopped');
            if (reason) {
                console.log(reason);
            }
        }
    }
}

const authTlsExample = new AuthTlsExample();
authTlsExample.start();
```
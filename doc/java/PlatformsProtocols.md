# 12.平台和协议
## 12.1.摘要
Ignite为主要的语言和技术，以原生库的形式提供了一套API，包括Java，.NET和C++，还支持包括REST、Memcached以及Redis在内的多种协议。
## 12.2.REST API
Ignite提供了一个HTTP REST客户端，可以以REST的方式通过HTTP或者HTTPS协议与集群进行通信。REST API可以用于执行不同的操作，比如对缓存进行读/写，执行任务，获取各种指标等等。
### 12.2.1.入门
要启用HTTP连接，确保在类路径中包含`ignite-rest-http`模块，在发布版中，这意味着将其从`IGNITE_HOME/libs/optional/`拷贝到`IGNITE_HOME/libs`中。

不需要显式地进行配置，连接器就会自动启动，然后监听`8080`端口，可以通过`curl`检测其是否工作正常。
```bash
curl 'http://localhost:8080/ignite?cmd=version'
```
请求参数可以通过URL传递，也可以通过表单的POST提交方式传递：
```bash
curl 'http://localhost:8080/ignite?cmd=put&cacheName=myCache' -X POST -H 'Content-Type: application/x-www-form-urlencoded' -d 'key=testKey&val=testValue'
```
**安全**

通过REST协议，可以与集群建立安全的连接，怎么做呢，首先要通过`IgniteConfiguration.setAuthenticationEnabled(true)`方法开启集群的认证功能，注意目前只有开启持久化时认证功能才可用。

服务端开启认证之后，就可以在REST连接串中提供`user=[user]&password=[password]`参数进行用户认证了，成功之后会生成一个会话令牌，该令牌可以在该会话有效期内的任意命令中使用。

请求认证有两种方式：

1.使用带有`user=[user]&password=[password]`参数的`authenticate`命令：
```
https://[host]:[port]/ignite?cmd=authenticate&user=[user]&password=[password]
```
2.在任意REST命令的连接串中，加上`user=[user]&password=[password]`参数，下面使用`version`命令举例：
```
 http://[host]:[port]/ignite?cmd=version&user=[user]&password=[password]
```
上面的例子中，需要将`[host]`, `[port]`, `[user]`和`[password]`替换为实际值。

在浏览器中执行上面的字符串都会返回一个会话令牌，大概向下面这样：
```json
{"successStatus":0,"error":null,"sessionToken":"EF6013FF590348CE91DEAE9870183BEF","response":true}
```
获得这个令牌之后，就可以像下面这样，在连接串中加上`sessionToken`参数：
```
http://[host]:[port]/ignite?cmd=top&sessionToken=[sessionToken]
```
上面的例子中，需要将`[host]`, `[port]`, `[sessionToken]`替换为实际值。

::: warning 注意
如果服务端开启了认证，那么用户的凭据或者令牌就是必须的，如果既不提供`sessionToken`，也不提供`user`和`password`会出错：`{"successStatus":2,"sessionToken":null,"error":"Failed to handle request - session token not found or invalid","response":null}`。
:::

::: tip 会话令牌过期
会话令牌有效期只有**30秒**，如果使用一个过期的令牌会报错：`{"successStatus":1,"error":"Failed to handle request - unknown session token (maybe expired session) [sesTok=12FFFD4827D149068E9FFF59700E5FDA]","sessionToken":null,"response":null}`。如果要自定义过期时间，可以配置`IGNITE_REST_SESSION_TIMEOUT`系统参数，单位为秒。<br>
比如：`-DIGNITE_REST_SESSION_TIMEOUT=3600`
:::

### 12.2.2.数据类型
对于**put/get**操作，REST API还可以通过`keyType`和`valueType`参数支持Java的内置类型，注意除非显式指定了下面提到的数据类型，REST协议会将键-值数据转换为`String`类型，这意味着集群中对数据的读写都是作为`String`的。

|REST键类型/值类型|对应的Java类型|
|---|---|
|`boolean`|`java.lang.Boolean`|
|`byte`|`java.lang.Byte`|
|`short`|`java.lang.Short`|
|`integer`|`java.lang.Integer`|
|`long`|`java.lang.Long`|
|`float`|`java.lang.Float`|
|`double`|`java.lang.Double`|
|`date`|`java.sql.Date`，数值应该为`valueOf(String)`方法支持的格式，比如：2018-01-01|
|`time`|`java.sql.Time`，数值应该为`valueOf(String)`方法支持的格式，比如：01:01:01|
|`timestamp`|`java.sql.Timestamp`，数值应该为`valueOf(String)`方法支持的格式，比如：2018-02-18%2001:01:01|
|`uuid`|`java.util.UUID`|
|`IgniteUuid`|`org.apache.ignite.lang.IgniteUuid`|

下面的`put`命令，带有`keyType=int`和`valueType=date`参数。
```
http://[host]:[port]/ignite?cmd=put&key=1&val=2018-01-01&cacheName=myCache&keyType=int&valueType=date
```
对应的`get`命令为：
```
http://[host]:[port]/ignite?cmd=get&key=1&cacheName=myCache&keyType=int&valueType=date
```
### 12.2.3.API参考

 - [返回值](#12.2.3.1.返回值)
 - [log](#12.2.3.2.log)
 - [version](#12.2.3.3.version)
 - [decr](#12.2.3.4.decr)
 - [incr](#12.2.3.5.incr)
 - [cache](#12.2.3.6.cache)
 - [cas](#12.2.3.7.cas)
 - [prepend](#12.2.3.8.prepend)
 - [append](#12.2.3.9.append)
 - [rep](#12.2.3.10.rep)
 - [getrep](#12.2.3.11.getrep)
 - [repval](#12.2.3.12.repval)
 - [rmvall](#12.2.3.13.rmvall)
 - [rmvval](#12.2.3.14.rmvval)
 - [rmv](#12.2.3.15.rmv)
 - [getrmv](#12.2.3.16.getrmv)
 - [add](#12.2.3.17.add)
 - [putall](#12.2.3.18.putall)
 - [put](#12.2.3.19.put)
 - [getall](#12.2.3.20.getall)
 - [get](#12.2.3.21.get)
 - [conkey](#12.2.3.22.conkey)
 - [conkeys](#12.2.3.23.conkeys)
 - [getput](#12.2.3.24.getput)
 - [putifabs](#12.2.3.25.putifabs)
 - [getputifabs](#12.2.3.26.getputifabs)
 - [size](#12.2.3.27.size)
 - [getorcreate](#12.2.3.28.getorcreate)
 - [destcache](#12.2.3.29.destcache)
 - [node](#12.2.3.30.node)
 - [top](#12.2.3.31.top)
 - [exe](#12.2.3.32.exe)
 - [res](#12.2.3.33.res)
 - [qryexe](#12.2.3.34.qryexe)
 - [qryfldexe](#12.2.3.35.qryfldexe)
 - [qryfetch](#12.2.3.36.qryfetch)
 - [qrycls](#12.2.3.37.qrycls)
 - [metadata](#12.2.3.38.metadata)
 - [qryscanexe](#12.2.3.39.qryscanexe)

在内部，Ignite使用Jetty来提供HTTP服务的功能，HTTP REST客户端可以使用`ConnectorConfiguration`进行配置。
#### 12.2.3.1.返回值
HTTP REST请求返回一个JSON对象，每一个命令都有一个类似的结构，这个对象有如下的结构：

|名字|类型|描述|示例|
|---|---|---|---|
|affinityNodeId|string|关联节点ID|2bd7b049-3fa0-4c44-9a6d-b5c7a597ce37|
|error|string|如果服务器无法处理请求，出现的错误的描述|每个命令单独指定|
|sessionToken|String|如果服务端开启认证，该字段包含了在会话有效期内可以用于其它命令的会话令牌，如果关闭认证，该字段为空。|如果认证打开，EF6013FF590348CE91DEAE9870183BEF，否则为空|
|response|jsonObject|该命令包含命令执行结果|每个命令单独指定|
|successStatus|Integer|返回状态码：<br>成功：0<br>失败：1<br>授权失败：2<br>安全检查失败：3|0|

#### 12.2.3.2.log
**log**命令显示服务器的日志。

URL:
```
http://host:port/ignite?cmd=log&from=10&to=100&path=/var/log/ignite.log
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**log**，小写||
|from|integer|是|开始的行号，如果传入了**to**参数，该参数为必须|0|
|path|string|是|日志文件的路径，如果未提供会使用默认值|/log/cache_server.log|
|to|integer|是|结束的行号，如果传入了**from**参数，该参数为必须|1000|

**响应示例**
```json
{
  "error": "",
  "response": ["[14:01:56,626][INFO ][test-runner][GridDiscoveryManager] Topology snapshot [ver=1, nodes=1, CPUs=8, heap=1.8GB]"],
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|string|日志|["[14:01:56,626][INFO ][test-runner][GridDiscoveryManager] Topology snapshot [ver=1, nodes=1, CPUs=8, heap=1.8GB]"]|

#### 12.2.3.3.version
**version**命令显示当前Ignite的版本。

URL:
```
http://host:port/ignite?cmd=version
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**version**，小写||

**响应示例**
```json
{
  "error": "",
  "response": "1.0.0",
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|string|Ignite版本|1.0.0|

#### 12.2.3.4.decr
**decr**命令减去然后获得给定原子性Long类型的当前值。

URL:
```
http://host:port/ignite?cmd=decr&cacheName=partionedCache&key=decrKey&init=15&delta=10
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**decr**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|key|string|否|原子性Long类型的名称|counter|
|init|long|是|初始值|15|
|delta|long|否|减去的值|42|

**响应示例**
```json
{
  "affinityNodeId": "e05839d5-6648-43e7-a23b-78d7db9390d5",
  "error": "",
  "response": -42,
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|long|操作之后的值|-42|

#### 12.2.3.5.incr
**incr**命令增加然后获得给定原子性Long类型的当前值。

URL:
```
http://host:port/ignite?cmd=incr&cacheName=partionedCache&key=incrKey&init=15&delta=10
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**incr**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|key|string|否|原子性Long类型的名称|counter|
|init|long|是|初始值|15|
|delta|long|否|增加的值|42|

**响应示例**
```json
{
  "affinityNodeId": "e05839d5-6648-43e7-a23b-78d7db9390d5",
  "error": "",
  "response": 42,
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|long|操作之后的值|42|

#### 12.2.3.6.cache
**cache**命令可以获得Ignite缓存的指标。

URL:
```
http://host:port/ignite?cmd=cache&cacheName=partionedCache&destId=8daab5ea-af83-4d91-99b6-77ed2ca06647
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**cache**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "",
  "error": "",
  "response": {
    "createTime": 1415179251551,
    "hits": 0,
    "misses": 0,
    "readTime": 1415179251551,
    "reads": 0,
    "writeTime": 1415179252198,
    "writes": 2
  },
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|jsonObject|JSON对象包含了缓存的指标，比如创建时间，读计数等|{"createTime": 1415179251551, "hits": 0, "misses": 0, "readTime":1415179251551, "reads": 0,"writeTime": 1415179252198, "writes": 2
}|

#### 12.2.3.7.cas
**cas**命令在之前的值等于预期值时会在缓存中存储给定的键值对。

URL:
```
http://host:port/ignite?cmd=cas&key=casKey&val2=casOldVal&val1=casNewVal&cacheName=partionedCache&destId=8daab5ea-af83-4d91-99b6-77ed2ca06647
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**cas**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|key|string|否|缓存内要保存的键值|name|
|val|string|否|与给定键对应的值|Jack|
|val2|string|否|预期值|Bob|
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "1bcbac4b-3517-43ee-98d0-874b103ecf30",
  "error": "",
  "response": true,
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|boolean|如果替换发生则为true，否则false|true|

#### 12.2.3.8.prepend
**prepend**命令为给定的键关联的值增加一个前缀。

URL:
```
http://host:port/ignite?cmd=prepend&key=prependKey&val=prefix_&cacheName=partionedCache&destId=8daab5ea-af83-4d91-99b6-77ed2ca06647
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**prepend**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|key|string|否|缓存内要保存的键值|name|
|val|string|否|为当前值要增加的前缀|Name_|
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "1bcbac4b-3517-43ee-98d0-874b103ecf30",
  "error": "",
  "response": true,
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|boolean|如果替换发生则为true，否则false|true|

#### 12.2.3.9.append
**append**命令为给定的键关联的值增加一个后缀。

URL:
```
http://host:port/ignite?cmd=append&key=appendKey&val=_suffix&cacheName=partionedCache&destId=8daab5ea-af83-4d91-99b6-77ed2ca06647
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**append**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|key|string|否|缓存内要保存的键值|name|
|val|string|否|为当前值要增加的后缀|Jack|
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "1bcbac4b-3517-43ee-98d0-874b103ecf30",
  "error": "",
  "response": true,
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|boolean|如果替换发生则为true，否则false|true|

#### 12.2.3.10.rep
**rep**命令为给定的键存储一个新值。

URL:
```
http://host:port/ignite?cmd=rep&key=repKey&val=newValue&cacheName=partionedCache&destId=8daab5ea-af83-4d91-99b6-77ed2ca06647
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**rep**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|key|string|否|缓存内要保存的键值|name|
|val|string|否|与给定键关联的新值|Jack|
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "1bcbac4b-3517-43ee-98d0-874b103ecf30",
  "error": "",
  "response": true,
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|boolean|如果替换发生则为true，否则false|true|

#### 12.2.3.11.getrep
**getrep**命令为给定的键存储一个新值,然后返回原值。

URL:
```
http://host:port/ignite?cmd=getrep&key=repKey&val=newValue&cacheName=partionedCache&destId=8daab5ea-af83-4d91-99b6-77ed2ca06647
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**getrep**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|key|string|否|缓存内要保存的键值|name|
|val|string|否|与给定键关联的新值|Jack|
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "1bcbac4b-3517-43ee-98d0-874b103ecf30",
  "error": "",
  "response": oldValue,
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|jsonObject|给定键的原值|{"name": "Bob"}|

#### 12.2.3.12.repval
**repval**命令在之前的值等于预期值时会替换给定键的值。

URL:
```
http://host:port/ignite?cmd=repval&key=repKey&val=newValue&val2=oldVal&cacheName=partionedCache&destId=8daab5ea-af83-4d91-99b6-77ed2ca06647
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**repval**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|key|string|否|缓存内的键值|name|
|val|string|否|与给定键对应的值|Jack|
|val2|string|否|预期值|oldValue|
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "1bcbac4b-3517-43ee-98d0-874b103ecf30",
  "error": "",
  "response": true,
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|boolean|如果替换发生则为true，否则false|true|

#### 12.2.3.13.rmvall
**rmvall**命令会从缓存中删除给定键的数据。

URL:
```
http://host:port/ignite?cmd=rmvall&k1=rmKey1&k2=rmKey2&k3=rmKey3&cacheName=partionedCache&destId=8daab5ea-af83-4d91-99b6-77ed2ca06647
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**rmvall**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|k1...kN|string|否|要从缓存中删除的键|name|
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "1bcbac4b-3517-43ee-98d0-874b103ecf30",
  "error": "",
  "response": true,
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|boolean|如果删除发生则为true，否则false|true|

#### 12.2.3.14.rmvval
**rmvval**命令当当前值等于预期值时在缓存中删除给定键对应的映射。

URL:
```
http://host:port/ignite?cmd=rmvval&key=rmvKey&val=rmvVal&cacheName=partionedCache&destId=8daab5ea-af83-4d91-99b6-77ed2ca06647
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**rmvval**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|key|string|否|缓存内要删除的键值|name|
|val|string|否|与给定键关联的期望值|oldValue|
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "1bcbac4b-3517-43ee-98d0-874b103ecf30",
  "error": "",
  "response": true,
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|boolean|false，如果没有映射的键|true|

#### 12.2.3.15.rmv
**rmv**命令在缓存中删除给定键对应的映射。

URL:
```
http://host:port/ignite?cmd=rmv&key=rmvKey&cacheName=partionedCache&destId=8daab5ea-af83-4d91-99b6-77ed2ca06647
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**rmv**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|key|string|否|缓存内要删除的键值|name|
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "1bcbac4b-3517-43ee-98d0-874b103ecf30",
  "error": "",
  "response": true,
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|boolean|true,如果删除发生，否则，false|true|

#### 12.2.3.16.getrmv
**getrmv**命令在缓存中删除给定键的映射,然后返回原值。

URL:
```
http://host:port/ignite?cmd=getrmv&cacheName=partionedCache&destId=8daab5ea-af83-4d91-99b6-77ed2ca06647&key=name
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**getrep**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|key|string|否|缓存内要删除的键值|name|
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "1bcbac4b-3517-43ee-98d0-874b103ecf30",
  "error": "",
  "response": value,
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|jsonObject|给定键的原值|{"name": "Bob"}|

#### 12.2.3.17.add
**add**命令当缓存中不存在该映射时存储该映射。

URL:
```
http://host:port/ignite?cmd=add&key=newKey&val=newValue&cacheName=partionedCache&destId=8daab5ea-af83-4d91-99b6-77ed2ca06647
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**add**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|key|string|否|缓存内要存储的键值|name|
|val|string|否|与给定键关联的值|Jack|
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "1bcbac4b-3517-43ee-98d0-874b103ecf30",
  "error": "",
  "response": true,
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|boolean|true，如果成功存储，否则，false|true|

#### 12.2.3.18.putall
**putall**命令会在缓存中存储给定的键值对。

URL:
```
http://host:port/ignite?cmd=putall&k1=putKey1&k2=putKey2&k3=putKey3&v1=value1&v2=value2&v3=value3&cacheName=partionedCache&destId=8daab5ea-af83-4d91-99b6-77ed2ca06647
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**putall**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|k1...kN|string|否|要在缓存中保存的键|name|
|v1...vN|string|否|与给定键关联的值|Jack|
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "1bcbac4b-3517-43ee-98d0-874b103ecf30",
  "error": "",
  "response": true,
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|boolean|如果成功保存则为true，否则false|true|

#### 12.2.3.19.put
**put**命令在缓存中存储该映射。

URL:
```
http://host:port/ignite?cmd=put&key=newKey&val=newValue&cacheName=partionedCache&destId=8daab5ea-af83-4d91-99b6-77ed2ca06647
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**put**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|key|string|否|缓存内要存储的键值|name|
|val|string|否|与给定键关联的值|Jack|
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "1bcbac4b-3517-43ee-98d0-874b103ecf30",
  "error": "",
  "response": true,
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|boolean|true，如果成功存储，否则，false|true|

#### 12.2.3.20.getall
**getall**命令会从缓存中获取给定键的数据。

URL:
```
http://host:port/ignite?cmd=getall&k1=getKey1&k2=getKey2&k3=getKey3&cacheName=partionedCache&destId=8daab5ea-af83-4d91-99b6-77ed2ca06647
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**rmvall**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|k1...kN|string|否|要从缓存中获取的值对应的键|key1, key2, ..., keyN|
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "",
  "error": "",
  "response": {
    "key1": "value1",
    "key2": "value2"
  },
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|jsonObject|键值对映射|{"key1": "value1","key2": "value2"}|

::: tip 数组形式输出
要获得数组形式的输出，需要配置系统属性`IGNITE_REST_GETALL_AS_ARRAY`为`true`，如果配置了这个属性，那么`getall`命令的输出格式为：`{“successStatus”:0,“affinityNodeId”:null,“error”:null,“sessionToken”:null,“response”:[{“key”:“key1”,“value”:“value1”},{“key”:“key2”,“value”:“value2”}]}`
:::
#### 12.2.3.21.get
**get**命令在缓存中获取给定的键对应的值。

URL:
```
http://host:port/ignite?cmd=get&key=getKey&cacheName=partionedCache&destId=8daab5ea-af83-4d91-99b6-77ed2ca06647
```
也可以获取通过API或者SQL插入的数据，比如，如果缓存中有一个`Person`对象，可以通过如下方式获取：

URL：
```
# If the entry in cache was inserted via API, for example
# cache.put(1, new Person(1, Alex, 300));
# you can use the following REST command to get the value

http://host:port/ignite?cmd=get&cacheName=myCacheName&keyType=int&key=1
```
SQL：
```
# If the entry in cache was inserted via SQL, for example -
# create table person(id integer primary key, name varchar(100), salary integer);
# insert into person(id, name, salary) values (1, Alex, 300);
# you can use the following REST command to get the value

http://host:port/ignite?cmd=get&cacheName=SQL_PUBLIC_PERSON&keyType=int&key=1
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**get**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|key|string|否|要返回的值对应的键|testKey|
|keyType|Java内置类型|是|具体可以看上面的`12.2.2.数据类型`章节。||
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "2bd7b049-3fa0-4c44-9a6d-b5c7a597ce37",
  "error": "",
  "response": "value from cache",
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|jsonObject|给定键的值|{"name": "Alex","id":1,"salary":2000}|

#### 12.2.3.22.conkey
**conkey**命令在缓存中检测是否有给定键对应的条目。

URL:
```
http://host:port/ignite?cmd=conkey&key=getKey&cacheName=partionedCache
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**conkey**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|key|string|否|在缓存中检测是否存在的键|testKey|
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "2bd7b049-3fa0-4c44-9a6d-b5c7a597ce37",
  "error": "",
  "response": true,
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|boolean|存在给定键对应的映射则为true|true|

#### 12.2.3.23.conkeys
**conkeys**命令在缓存中检测是否有给定键对应的条目。

URL:
```
http://host:port/ignite?cmd=conkeys&k1=getKey1&k2=getKey2&k3=getKey3&cacheName=partionedCache
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**rmvall**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|k1...kN|string|否|在缓存中检测是否存在的键|key1, key2, ..., keyN|
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "2bd7b049-3fa0-4c44-9a6d-b5c7a597ce37",
  "error": "",
  "response": true,
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|boolean|存在给定键对应的映射则为true|true|

#### 12.2.3.24.getput
**getput**命令在缓存中存储给定的键值对，如果之前存在该映射的话则返回原值。

URL:
```
http://host:port/ignite?cmd=getput&key=getKey&val=newVal&cacheName=partionedCache
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**getput**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|key|string|否|缓存内要存储的键值|name|
|val|string|否|与给定键关联的值|Jack|
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "2bd7b049-3fa0-4c44-9a6d-b5c7a597ce37",
  "error": "",
  "response": "value",
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|jsonObject|给定键的原值|{"name": "bob"}|

#### 12.2.3.25.putifabs
**putifabs**命令只有在缓存中存在该映射的话才会存储给定的键值对。

URL:
```
http://host:port/ignite?cmd=putifabs&key=getKey&val=newVal&cacheName=partionedCache
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**putifabs**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|key|string|否|缓存内要存储的键|name|
|val|string|否|与给定键关联的值|Jack|
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "2bd7b049-3fa0-4c44-9a6d-b5c7a597ce37",
  "error": "",
  "response": true,
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|boolean|成功存储则为true|true|

#### 12.2.3.26.getputifabs
**getputifabs**命令只有在缓存中不存在该映射时才会进行存储，否则会返回对应该键的原值。

URL:
```
http://host:port/ignite?cmd=getputifabs&key=getKey&val=newVal&cacheName=partionedCache
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**getputifabs**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|
|key|string|否|缓存内要存储的键值|name|
|val|string|否|与给定键关联的值|Jack|
|destId|string|是|要返回指标的节点Id|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "affinityNodeId": "2bd7b049-3fa0-4c44-9a6d-b5c7a597ce37",
  "error": "",
  "response": "value",
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|jsonObject|给定键对应的原值|{"name": "bob"}|

#### 12.2.3.27.size
**size**命令返回指定缓存的总条目的数量。

URL:
```
http://host:port/ignite?cmd=size&cacheName=partionedCache
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**size**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|

**响应示例**
```json
{
  "affinityNodeId": "",
  "error": "",
  "response": 1,
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|number|给定缓存的总条目数量|5|

#### 12.2.3.28.getorcreate
**getorcreate**命令如果不存在的话会创建给定名字的缓存。

URL:
```
http://host:port/ignite?cmd=getorcreate&cacheName=myPartionedCache
```
**请求参数**

|名称|类型|可选|描述|
|---|---|---|---|
|cmd|string|否|**getorcreate**，小写|
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|
|backups|int|是|缓存数据的备份数量，默认值为0|
|dataRegion|string|是|缓存所属的内存区的名字|
|templateName|string|是|Ignite中注册的用作缓存配置的缓存模板名，具体可以看[缓存模板](/doc/java/Key-ValueDataGrid.md#_3-3-5-缓存模板)|
|cacheGroup|string|是|缓存所属的缓存组名|
|writeSynchronizationMode|string|是|配置缓存的写同步模式：`FULL_SYNC`、`FULL_ASYNC`和`PRIMARY_SYNC`|

**响应示例**
```json
{
  "error": "",
  "response": null,
  "successStatus": 0
}
```

#### 12.2.3.29.destcache
**destcache**命令删除给定名字的缓存。

URL:
```
http://host:port/ignite?cmd=destcache&cacheName=partionedCache
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**destcache**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|

**响应示例**
```json
{
  "error": "",
  "response": null,
  "successStatus": 0
}
```

#### 12.2.3.30.node
**node**命令获取一个节点的信息。

URL:
```
http://host:port/ignite?cmd=node&attr=true&mtr=true&id=c981d2a1-878b-4c67-96f6-70f93a4cd241
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**node**，小写||
|mtr|boolean|是|如果为true，返回值会包含指标信息|true|
|attr|boolean|是|如果为true，返回值会包含属性信息|true|
|ip|string|是|如果传递了id参数该参数是可选的。返回值包含了指定IP对应的节点信息|192.168.0.1|
|id|string|是|如果传递了ip参数该参数为可选的。返回值包含了指定节点id对应的节点信息|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "error": "",
  "response": {
    "attributes": null,
    "caches": {},
    "consistentId": "127.0.0.1:47500",
    "defaultCacheMode": "REPLICATED",
    "metrics": null,
    "nodeId": "2d0d6510-6fed-4fa3-b813-20f83ac4a1a9",
    "replicaCount": 128,
    "tcpAddresses": ["127.0.0.1"],
    "tcpHostNames": [""],
    "tcpPort": 11211
  },
  "successStatus": 0
}
```

|名称|类型|描述|示例|
|---|---|---|---|
|response|jsonObject|一个节点的信息|{"attributes": null,"caches": {},"consistentId": "127.0.0.1:47500","defaultCacheMode": "REPLICATED","metrics": null,"nodeId": "2d0d6510-6fed-4fa3-b813-20f83ac4a1a9","replicaCount": 128,"tcpAddresses": ["127.0.0.1"],"tcpHostNames": [""],"tcpPort": 11211}|

#### 12.2.3.31.top
**top**命令获取一个网络拓扑的信息。

URL:
```
http://host:port/ignite?cmd=top&attr=true&mtr=true&id=c981d2a1-878b-4c67-96f6-70f93a4cd241
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**top**，小写||
|mtr|boolean|是|如果为true，返回值会包含指标信息|true|
|attr|boolean|是|如果为true，返回值会包含属性信息|true|
|ip|string|是|如果传递了id参数该参数是可选的。返回值包含了指定IP对应的节点信息|192.168.0.1|
|id|string|是|如果传递了ip参数该参数为可选的。返回值包含了指定节点id对应的节点信息|8daab5ea-af83-4d91-99b6-77ed2ca06647|

**响应示例**
```json
{
  "error": "",
  "response": [
    {
      "attributes": {
        ...
      },
      "caches": [
        {
          name: "",
          mode: "PARTITIONED"
        },
        {
          name: "partionedCache",
          mode: "PARTITIONED",
          sqlSchema: "partionedCache"
        }
      ],
      "consistentId": "127.0.0.1:47500",
      "metrics": {
        ...
      },
      "nodeId": "96baebd6-dedc-4a68-84fd-f804ee1ed995",
      "replicaCount": 128,
      "tcpAddresses": ["127.0.0.1"],
      "tcpHostNames": [""],
      "tcpPort": 11211
   },
   {
     "attributes": {
       ...
     },
     "caches": [
       {
         name: "",
         mode: "REPLICATED"
       }
     ],
     "consistentId": "127.0.0.1:47501",
     "metrics": {
       ...
     },
     "nodeId": "2bd7b049-3fa0-4c44-9a6d-b5c7a597ce37",
     "replicaCount": 128,
     "tcpAddresses": ["127.0.0.1"],
     "tcpHostNames": [""],
     "tcpPort": 11212
   }
  ],
  "successStatus": 0
}
```

|名称|类型|描述|示例|
|---|---|---|---|
|response|jsonObject|一个网络拓扑的信息|[{"attributes": {...},"caches": [{name: "",mode: "PARTITIONED"},{name: "partionedCache",mode: "PARTITIONED",sqlSchema: "partionedCache"}],"consistentId": "127.0.0.1:47500","REPLICATED","metrics": {...},"nodeId": "96baebd6-dedc-4a68-84fd-f804ee1ed995",..."tcpPort": 11211},{"attributes": {...},"caches": [{name: "",mode: "REPLICATED"}],"consistentId": "127.0.0.1:47501","metrics": {...},"nodeId": "2bd7b049-3fa0-4c44-9a6d-b5c7a597ce37",..."tcpPort": 11212}]|

#### 12.2.3.32.exe
**exe**命令在集群中执行给定的任务。

URL:
```
http://host:port/ignite?cmd=exe&name=taskName&p1=param1&p2=param2&async=true
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**exe**，小写||
|name|string|否|要执行的任务名|summ|
|p1...pN|string|是|任务执行的参数|arg1...argN|
|async|boolean|是|任务异步执行的标志|true|

**响应示例**
```json
{
  "error": "",
  "response": {
    "error": "",
    "finished": true,
    "id": "~ee2d1688-2605-4613-8a57-6615a8cbcd1b",
    "result": 4
  },
  "successStatus": 0
}
```

|名称|类型|描述|示例|
|---|---|---|---|
|response|jsonObject|JSON对象，包含了与错误有关的信息，任务的唯一标识，计算的结果和状态|{"error": "","finished": true,"id":"~ee2d1688-2605-4613-8a57-6615a8cbcd1b","result": 4}|

#### 12.2.3.33.res
**res**命令获取指定任务的计算结果。

URL:
```
http://host:port/ignite?cmd=res&id=8daab5ea-af83-4d91-99b6-77ed2ca06647
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**res**，小写||
|id|string|否|要返回结果的任务id|69ad0c48941-4689aae0-6b0e-4d52-8758-ce8fe26f497d~4689aae0-6b0e-4d52-8758-ce8fe26f497d|

**响应示例**
```json
{
  "error": "",
  "response": {
    "error": "",
    "finished": true,
    "id": "69ad0c48941-4689aae0-6b0e-4d52-8758-ce8fe26f497d~4689aae0-6b0e-4d52-8758-ce8fe26f497d",
    "result": 4
  },
  "successStatus": 0
}
```

|名称|类型|描述|示例|
|---|---|---|---|
|response|jsonObject|JSON对象，包含了与错误有关的信息，任务的唯一标识，计算的结果和状态|{"error": "","finished": true,"id":"~ee2d1688-2605-4613-8a57-6615a8cbcd1b","result": 4}|

#### 12.2.3.34.qryexe
**qryexe**命令在缓存中执行指定的查询。

URL:
```
http://host:port/ignite?cmd=qryexe&type=Person&pageSize=10&cacheName=Person&arg1=1000&arg2=2000&qry=salary+%3E+%3F+and+salary+%3C%3D+%3F
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**qryexe**，小写||
|type|string|否|要查询的类型|String|
|pageSize|number|否|查询的每页大小|3|
|cacheName|string|是|缓存名称，如果未提供则使用默认的缓存|testCache|
|arg1...argN|string|否|查询的参数|1000,2000|
|qry|string|否|编码后的sql|salary+%3E+%3F+and+salary+%3C%3D+%3F|

**响应示例**
```json
{
  "error":"",
  "response":{
    "fieldsMetadata":[],
    "items":[
      {"key":3,"value":{"name":"Jane","id":3,"salary":2000}},
      {"key":0,"value":{"name":"John","id":0,"salary":2000}}],
    "last":true,
    "queryId":0},
  "successStatus":0
}
```

|名称|类型|描述|示例|
|---|---|---|---|
|response|jsonObject|JSON对象，包含了查询的结果集，最后页的标识以及查询的id|{"fieldsMetadata":[],"items":[{"key":3,"value":{"name":"Jane","id":3,salary":2000}},{"key":0,"value":{"name":"John","id":0,"salary":2000}}],"last":true,"queryId":0}|

#### 12.2.3.35.qryfldexe
**qryfldexe**命令在缓存中执行指定的有字段的查询。

URL:
```
http://host:port/ignite?cmd=qryfldexe&pageSize=10&cacheName=Person&qry=select+firstName%2C+lastName+from+Person
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**qryfldexe**，小写||
|pageSize|number|否|查询的每页大小|3|
|cacheName|string|是|缓存名称，如果未提供则使用默认的缓存|testCache|
|arg1...argN|string|否|查询的参数|1000,2000|
|qry|string|否|编码后的sql|select+firstName%2C+lastName+from+Person|

**响应示例**
```json
{
  "error":"",
  "response":{
    "fieldsMetadata":[{"fieldName":"FIRSTNAME", "fieldTypeName":"java.lang.String", "schemaName":"person", "typeName":"PERSON"},{"fieldName":"LASTNAME","fieldTypeName":"java.lang.String","schemaName":"person","typeName":"PERSON"}],
    "items":[["Jane","Doe"],["John","Doe"]],
    "last":true,
    "queryId":0
  },
  "successStatus":0}
```

|名称|类型|描述|示例|
|---|---|---|---|
|response|jsonObject|JSON对象，包含了查询的结果集，字段查询的元数据，最后页的标识以及查询的id|{"fieldsMetadata":[{"fieldName":"FIRSTNAME","fieldTypeName":"java.lang.String","schemaName":"person","typeName":"PERSON"},...],"items":[["Jane","Doe"],["John","Doe"]],"last":true,"queryId":0}|

#### 12.2.3.36.qryfetch
**qryfetch**命令获取指定查询的下一页数据。

URL:
```
http://host:port/ignite?cmd=qryfetch&pageSize=10&qryId=5
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**qryfetch**，小写||
|pageSize|number|否|查询的每页大小|3|
|qryId|number|否|qryexe,qryfldexe,qryfetch命令执行返回的查询id|0|

**响应示例**
```json
{
  "error":"",
  "response":{
    "fieldsMetadata":[],
    "items":[["Jane","Doe"],["John","Doe"]],
    "last":true,
    "queryId":0
  },
  "successStatus":0}
```

|名称|类型|描述|示例|
|---|---|---|---|
|response|jsonObject|JSON对象，包含了查询的结果集，最后页的标识以及查询的id|{"fieldsMetadata":[],"items":[["Jane","Doe"],["John","Doe"]],"last":true,"queryId":0}|

#### 12.2.3.37.qrycls
**qrycls**命令关闭查询占用的资源。

URL:
```
http://host:port/ignite?cmd=qrycls&qryId=5
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**qrycls**，小写||
|qryId|number|否|qryexe,qryfldexe,qryfetch命令执行返回的查询id|0|

**响应示例**
```json
{
  "error":"",
  "response":true,
  "successStatus":0
}
```

|名称|类型|描述|示例|
|---|---|---|---|
|response|boolean|如果成功关闭则为true|true|

#### 12.2.3.38.metadata
**metadata**命令返回指定缓存的元数据。

URL:
```
http://host:port/ignite?cmd=metadata&cacheName=partionedCache
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**metadata**，小写||
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|partionedCache|

**响应示例**
```json
{
  "error": "",
  "response": {
    "cacheName": "partionedCache",
    "types": [
      "Person"
    ],
    "keyClasses": {
      "Person": "java.lang.Integer"
    },
    "valClasses": {
      "Person": "org.apache.ignite.Person"
    },
    "fields": {
      "Person": {
        "_KEY": "java.lang.Integer",
        "_VAL": "org.apache.ignite.Person",
        "ID": "java.lang.Integer",
        "FIRSTNAME": "java.lang.String",
        "LASTNAME": "java.lang.String",
        "SALARY": "double"
      }
    },
    "indexes": {
      "Person": [
        {
          "name": "ID_IDX",
          "fields": [
            "id"
          ],
          "descendings": [],
          "unique": false
        },
        {
          "name": "SALARY_IDX",
          "fields": [
            "salary"
          ],
          "descendings": [],
          "unique": false
        }
      ]
    }
  },
  "sessionToken": "",
  "successStatus": 0
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|jsonObject|给定缓存的元数据|{"cacheName": "partionedCache","types": ["Person"],"keyClasses": {"Person":"java.lang.Integer"},"valClasses": {"Person":"org.apache.ignite.Person"},"fields": {"Person": {"_KEY":"java.lang.Integer","_VAL": "org.apache.ignite.Person","ID":"java.lang.Integer","FIRSTNAME":"java.lang.String","LASTNAME": "java.lang.String","SALARY": "double"}},"indexes": {"Person": [{"name": "ID_IDX","fields": ["id"],"descendings": [],"unique": false},{"name": "SALARY_IDX","fields": ["salary"],"descendings": [],"unique": false}]}}|

#### 12.2.3.39.qryscanexe
**qryscanexe**命令在缓存中执行扫描查询。

URL:
```
http://host:port/ignite?cmd=qryscanexe&pageSize=10&cacheName=Person&className=org.apache.ignite.filters.PersonPredicate
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string|否|**qryscanexe**，小写||
|pageSize|number|否|查询的每页大小|3|
|cacheName|string|是|缓存名称，如果未提供，会使用默认的缓存|testCache|
|className|string|是|扫描查询的谓词类名，应该实现`IgniteBiPredicate `接口|org.apache.ignite.filters.PersonPredicate|

**响应示例**
```json
{
  "error": "",
  "response": {
    "fieldsMetadata": [
      {
        "fieldName": "key",
        "fieldTypeName": "",
        "schemaName": "",
        "typeName": ""
      },
      {
        "fieldName": "value",
        "fieldTypeName": "",
        "schemaName": "",
        "typeName": ""
      }
    ],
    "items": [
      {
        "key": 1,
        "value": {
          "firstName": "Jane",
          "id": 1,
          "lastName": "Doe",
          "salary": 1000
        }
      },
      {
        "key": 3,
        "value": {
          "firstName": "Jane",
          "id": 3,
          "lastName": "Smith",
          "salary": 2000
        }
      }
    ],
    "last": true,
    "queryId": 0
  },
  "successStatus": 0
}
```

|名称|类型|描述|示例|
|---|---|---|---|
|response|jsonObject|JSON对象，包含了扫描查询的结果集，字段查询的元数据，最后页的标识以及查询的id|{"fieldsMetadata":[{"fieldName":"key","fieldTypeName":"", "schemaName":"","typeName":""},{"fieldName":"value","fieldTypeName":"","schemaName":"","typeName":""}],"items":[{"key":1,"value":{"firstName":"Jane","id":1,"lastName":"Doe","salary":1000}},{"key":3,"value":{"firstName":"Jane","id":3,"lastName":"Smith","salary":2000}}],"last":true,"queryId":0}|

#### 12.2.3.40.activate
**activate**命令针对开启持久化的集群开始集群激活过程。

URL：
```
http://host:port/ignite?cmd=activate
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string||**activate**，小写||

**响应示例**

```json
{
  "successStatus":0,
  "error":null,
  "sessionToken":null,
  "response":"activate started"
}
```

|名称|类型|描述|示例|
|---|---|---|---|
|response|string|开始集群的激活|activate started|

#### 12.2.3.41.deactivate
**deactivate**命令针对开启持久化的集群开始集群冻结过程。

URL：
```
http://host:port/ignite?cmd=deactivate
```
**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string||**deactivate**，小写||

**响应示例**

```json
{
  "successStatus":0,
  "error":null,
  "sessionToken":null,
  "response":"deactivate started"
}
```
|名称|类型|描述|示例|
|---|---|---|---|
|response|string|开始集群的冻结|deactivate started|

#### 12.2.3.42.currentstate
**currentstate**命令用于显示当前集群的状态（激活/冻结）。

URL：
```
http://host:port/ignite?cmd=currentstate
```

**请求参数**

|名称|类型|可选|描述|示例|
|---|---|---|---|---|
|cmd|string||**currentstate**，小写||

**响应示例**

```json
{
  "successStatus":0,
  "error":null,
  "sessionToken":null,
  "response":true
}
```

|名称|类型|描述|示例|
|---|---|---|---|
|response|string|集群为激活状态则为`true`，否则为`false`。|true|

### 12.2.4.常规配置

|参数名|描述|可选|默认值|
|---|---|---|---|
|`setSecretKey(String)`|定义用于客户端认证的密钥，如果进行了设定，客户端请求必须包含HTTP头`X-Signature`，值为：`[1]:[2]`，这里`[1]`为毫秒值的时间戳，`[2]`为密钥的Base64格式的SHA1哈希值。|是|null|
|`setPortRange(int)`|Jetty服务的端口范围，如果在Jetty配置文件中或者`IGNITE_JETTY_PORT`系统属性中配置的端口已被占用，Ignite会将该端口加1然后再做一次绑定直到设定的范围上限。|是|100|
|`setJettyPath(String)`|Jetty配置文件的路径，要么是绝对路径，要么是相对于`IGNITE_HOME`，如果未指定，Ignite会用简单的HTTP连接器启动Jetty服务，这个连接器会分别使用`IGNITE_JETTY_HOST`和`IGNITE_JETTY_PORT`系统参数作为主机和端口，如果`IGNITE_JETTY_HOST`未设定，会使用localhost，如果`IGNITE_JETTY_PORT`未设定，默认会使用8080。|是|null|
|`setMessageInterceptor(ConnectorMessageInterceptor)`|转换通过REST协议进行交换的所有对象的拦截器。比如在客户端使用自定义的序列化，那么可以写一个拦截器来将从客户端收到的二进制数据转换为Java对象，然后就可以直接访问。|是|null|

### 12.2.5.Jetty XML配置示例
配置文件的路径需要通过上面描述的`ConnectorConfiguration.setJettyPath(String)`进行设定。
```xml
<?xml version="1.0"?>
<!DOCTYPE Configure PUBLIC "-//Jetty//Configure//EN" "http://www.eclipse.org/jetty/configure.dtd">
<Configure id="Server" class="org.eclipse.jetty.server.Server">
    <Arg name="threadPool">
        <!-- Default queued blocking thread pool -->
        <New class="org.eclipse.jetty.util.thread.QueuedThreadPool">
            <Set name="minThreads">20</Set>
            <Set name="maxThreads">200</Set>
        </New>
    </Arg>
    <New id="httpCfg" class="org.eclipse.jetty.server.HttpConfiguration">
        <Set name="secureScheme">https</Set>
        <Set name="securePort">8443</Set>
        <Set name="sendServerVersion">true</Set>
        <Set name="sendDateHeader">true</Set>
    </New>
    <Call name="addConnector">
        <Arg>
            <New class="org.eclipse.jetty.server.ServerConnector">
                <Arg name="server"><Ref refid="Server"/></Arg>
                <Arg name="factories">
                    <Array type="org.eclipse.jetty.server.ConnectionFactory">
                        <Item>
                            <New class="org.eclipse.jetty.server.HttpConnectionFactory">
                                <Ref refid="httpCfg"/>
                            </New>
                        </Item>
                    </Array>
                </Arg>
                <Set name="host">
                  <SystemProperty name="IGNITE_JETTY_HOST" default="localhost"/>
              	</Set>
                <Set name="port">
                  <SystemProperty name="IGNITE_JETTY_PORT" default="8080"/>
              	</Set>
                <Set name="idleTimeout">30000</Set>
                <Set name="reuseAddress">true</Set>
            </New>
        </Arg>
    </Call>
    <Set name="handler">
        <New id="Handlers" class="org.eclipse.jetty.server.handler.HandlerCollection">
            <Set name="handlers">
                <Array type="org.eclipse.jetty.server.Handler">
                    <Item>
                        <New id="Contexts" class="org.eclipse.jetty.server.handler.ContextHandlerCollection"/>
                    </Item>
                </Array>
            </Set>
        </New>
    </Set>
    <Set name="stopAtShutdown">false</Set>
</Configure>
```
## 12.3.Memcached
Ignite支持[Memcached](http://memcached.org/)协议，可以通过任何Memcached兼容客户端从Ignite缓存中存储和获取分布化的数据。

::: tip 注意
当前，Ignite只支持Memcached的二进制协议。
:::

可以通过如下语言的Memcached客户端连接到Ignite：

 - PHP
 - Java
 - Python
 - Ruby

### 12.3.1.配置
Ignite在其REST客户端连接器端口（默认为11211）上接收Memcached请求。

对于除增量和减量之外的所有Memcached操作，Ignite使用默认缓存（缓存名为`default`）。它需要事先显式创建，比如使用以下配置：
```xml
<bean class="org.apache.ignite.configuration.CacheConfiguration">
    <property name="name" value="default"/>
    <property name="atomicityMode" value="ATOMIC"/>
    <property name="backups" value="1"/>
</bean>
```
注意，下面的示例使用示例`examples/config/example-cache.xml`配置文件，该文件声明了默认的缓存。

对于增量和减量Memcached操作，Ignite使用`IgniteAtomicLong`数据结构，它们也需要预先创建，代码如下：
```java
ignite.atomicLong("key", 10, true);
```
### 12.3.2.PHP
要使用PHP客户端通过Memcached连接到Ignite，首先要[下载Ignite](https://ignite.incubator.apache.org/download.html)，然后：

 - 启动配置有缓存的Ignite，比如：

```bash
bin/ignite.sh examples/config/example-cache.xml
```

 - 通过二进制协议用Memcached客户端连接到Ignite：

```php
// Create client instance.
$client = new Memcached();

// Set localhost and port (set to correct values).
$client->addServer("localhost", 11211);

// Force client to use binary protocol.
$client->setOption(Memcached::OPT_BINARY_PROTOCOL, true);

// Put entry to cache.
if ($client->add("key", "val"))
    echo "Successfully put entry in cache.\n";

// Check entry value.
echo("Value for 'key': " . $client->get("key") . "\n");
```

### 12.3.3.Java
要使用Java客户端通过Memcached连接到Ignite，首先要[下载Ignite](https://ignite.incubator.apache.org/download.html)，然后：

 - 启动配置有缓存的Ignite，比如：

```bash
bin/ignite.sh examples/config/example-cache.xml
```

 - 通过二进制协议用Memcached客户端连接到Ignite：

```java
MemcachedClient client = null;

try {
    client = new MemcachedClient(new BinaryConnectionFactory(),
            AddrUtil.getAddresses("localhost:11211"));
} catch (IOException e) {
    e.printStackTrace();
}

client.set("key", 0, "val");

System.out.println("Value for 'key': " + client.get("key"));
```

### 12.3.4.Python
要使用Python客户端通过Memcached连接到Ignite，首先要[下载Ignite](https://ignite.incubator.apache.org/download.html)，然后：

 - 启动配置有缓存的Ignite，比如：

```bash
bin/ignite.sh examples/config/example-cache.xml
```

 - 通过二进制协议用Memcached客户端连接到Ignite：

```python
import pylibmc

client = memcache.Client(["127.0.0.1:11211", binary=True])

client.set("key", "val")

print "Value for 'key': %s" %

client.get("key")
```

### 12.3.5.Ruby
要使用Ruby客户端通过Memcached连接到Ignite，首先要[下载Ignite](https://ignite.incubator.apache.org/download.html)，然后：

 - 启动配置有缓存的Ignite，比如：

```bash
bin/ignite.sh examples/config/example-cache.xml
```

 - 通过二进制协议用Memcached客户端连接到Ignite：

```ruby
require 'dalli'

options = { :namespace => "app_v1", :compress => true }

client = Dalli::Client.new('localhost:11211', options)

client.set('key', 'value', nil, :raw => true)

value = client.get('key')
```
## 12.4.Redis
Ignite实现了对[Redis](http://redis.io/)的部分兼容，可以使用任何Redis兼容客户端在缓存中存储以及获取分布化的数据。
Ignite客户端支持如下的命令：

**连接**

 - [ECHO](http://redis.io/commands/echo)
 - [PING](http://redis.io/commands/ping)
 - [QUIT](http://redis.io/commands/quit)
 - [SELECT](https://redis.io/commands/select)

**字符串**

 - [GET](http://redis.io/commands/get)
 - [MGET](http://redis.io/commands/mget)（限制：*对于不存在的键，查询结果中不包含空值*）
 - [SET](http://redis.io/commands/set)（限制：没有键过期）
 - [MSET](http://redis.io/commands/mset)
 - [INCR](http://redis.io/commands/incr)
 - [DECR](http://redis.io/commands/decr)
 - [INCRBY](http://redis.io/commands/incrby)
 - [DECRBY](http://redis.io/commands/decrby)
 - [APPEND](http://redis.io/commands/append)
 - [STRLEN](http://redis.io/commands/strlen)
 - [GETSET](http://redis.io/commands/getset)
 - [SETRANGE](http://redis.io/commands/setrange)
 - [GETRANGE](http://redis.io/commands/getrange)

**键**

 - [DEL](http://redis.io/commands/del)（限制：返回提交的键的数量）
 - [EXISTS](http://redis.io/commands/exists)

**服务器**

  - [DBSIZE](http://redis.io/commands/dbsize)
  - [FLUSHDB](https://redis.io/commands/flushdb)
  - [FLUSHALL](https://redis.io/commands/flushall)

集群节点通过监听特定的端口来接收Redis请求，每个Ignite节点默认都会通过监听`[host]:11211`来接收请求，通过`ConnectorConfiguration`可以覆写主机和端口：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  	...
	<property name="connectorConfiguration">
	    <bean class="org.apache.ignite.configuration.ConnectorConfiguration">
		<property name="host" value="localhost"/>
		<property name="port" value="6379"/>
	    </bean>
	</property>
</bean>
```
::: tip 配置默认缓存
需要配置一个默认的`redis-ignite-internal-cache-0`缓存，用于默认的Redis数据库，当切换到SELECT命令时也可以用做其他数据库的模板。
:::

可以使用自己喜欢的[Redis客户端](http://redis.io/clients)接入Ignite，下面是是用几种语言的简单示例：
### 12.4.1.Java
要使用Redis的java客户端接入Ignite，需要先配置并启动一个Ignite集群。

要接入使用`6379`端口的Ignite，以[Jedis](https://github.com/xetorthio/jedis)为例：
```java
JedisPoolConfig jedisPoolCfg = new JedisPoolConfig();

// your pool configurations.

JedisPool pool = new JedisPool(jedisPoolCfg, "localhost", 6379, 10000);

try (Jedis jedis = pool.getResource()) {
    jedis.set("key1", "1");
    System.out.println("Value for 'key1': " + jedis.get("key1"));
}

pool.destroy();
```
### 12.4.2.Python
要使用Redis的Python客户端接入Ignite，需要先配置并启动一个Ignite集群。

要接入使用`6379`端口的Ignite，以[redis-py](https://github.com/andymccurdy/redis-py)为例：
```python
>>> import redis
>>> r = redis.StrictRedis(host='localhost', port=6379, db=0)
>>> r.set('k1', 1)
True
>>> r.get('k1')
'1'
```
### 12.4.3.PHP
要使用Redis的PHP客户端接入Ignite，需要先配置并启动一个Ignite集群。

要接入使用`6379`端口的Ignite，以[predis](https://github.com/nrk/predis)为例：
```php
// Load the library.
require 'predis/autoload.php';
Predis\Autoloader::register();

// Connect.
try {
    $redis = new Predis\Client();

    echo ">>> Successfully connected to Redis. \n";

    // Put entry to cache.
    if ($redis->set('k1', '1'))
        echo ">>> Successfully put entry in cache. \n";

    // Check entry value.
    echo(">>> Value for 'k1': " . $redis->get('k1') . "\n");
}
catch (Exception $e) {
    echo "Couldn't connected to Redis";
    echo $e->getMessage();
}
```
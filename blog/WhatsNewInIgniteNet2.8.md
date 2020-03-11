# Apache Ignite.NET 2.8的新功能
## 瘦客户端和分区感知

从一开始，Ignite就支持[客户端和服务端连接模式](https://www.ignite-service.cn/doc/java/#_7-客户端和服务端)。不过即使客户端模式不存储数据也不执行计算，它仍然相对“笨重”，启动Ignite.NET客户端节点需要一个嵌入式的JVM环境，可能至少需要一秒钟，并且消耗几兆字节的内存。

在某些场景中，例如短期在线应用、低功耗客户端主机、命令行工具等，可能不希望这样的架构。因此Ignite从2.4版本开始，新增了轻量级的瘦客户端协议来处理这些场景，下面是简单的比较：

||胖客户端|瘦客户端|
|---|---|---|
|启动时间  | 1300 ms             | 15 ms       |
|内存占用     | 40 MB (.NET + Java) | 70 KB       |
|是否需要 Java | 是                 | 否          |

Ignite.NET瘦客户端通过`Ignition.StartClient()`启动，并提供一组和胖客户端类似的API。根接口是分开的（`IIgnite`-> `IIgniteClient`，`ICache`-> `ICacheClient`），但是方法的命名方式相同，并且大多数代码可以轻松地来回切换。

瘦客户端协议是开放、可扩展并且文档化的，这样也为其他语言（例如[Python、JavaScript和PHP](https://www.ignite-service.cn/doc/java/ThinClients.html#_1-瘦客户端)）的客户端铺平了道路。

### 分区感知

瘦客户端的初始实现使用接入指定服务端节点的单个连接来执行所有的操作。大家都知道Ignite在集群节点之间平均分配缓存数据，当瘦客户端连接到节点A，但请求的数据在节点B上时，则必须从A到B发出另一个网络请求，这样并不高效。

Ignite从2.8版本开始，引入了瘦客户端分区感知功能：瘦客户端可以接入所有服务端节点，确定给定键的主节点，并将请求直接路由到该节点，从而避免了额外的网络负载。这种路由非常快，它通过键哈希值的一些基本数学运算，就可以根据已知的分区分布确定目标节点。通过`IgniteClientConfiguration.EnablePartitionAwareness = true`打开/关闭分区感知后，`cache.Get`操作的性能测试结果如下：
```
|            Method |     Mean |    Error |   StdDev |
|------------------ |---------:|---------:|---------:|
|               Get | 90.73 us | 2.114 us | 5.892 us |
| GetPartitionAware | 31.56 us | 0.618 us | 1.234 us |
```
具体测试中，集群拓扑、网络速度和缓存数据量可能有所不同，测试结果可能会不一样，但改进幅度是很大的。

### 故障转移

瘦客户端多节点连接还意味着故障转移的能力：如果一个或多个服务端节点发生故障，则客户端会自动切换到其他连接。
## 跨平台支持：.NET Core、Linux、macOS
Ignite从2.4版本开始引入了.NET Core 2.x支持，最终放弃了和Windows相关的C++部分，并切换到[JNI层](https://en.wikipedia.org/wiki/Java_Native_Interface)的纯.NET实现，从而使Ignite.NET应用可以在Linux和macOS上运行。

Ignite在2.8版本中新增了官方的.NET Core 3.x支持，并且可以在该框架支持的任何操作系统上以任何模式运行：服务端、客户端、瘦客户端。

Ignite改进了NuGet软件包中处理jar文件的方式，使用[MSBuild.targets文件](https://docs.microsoft.com/en-us/visualstudio/msbuild/msbuild-dot-targets-files?view=vs-2019)替换了`post_build`脚本，该文件更可靠，跨平台，并且可以通过`dotnet build`以及`dotnet publish`处理：.jar文件会被自动复制到构建和发布目录，从而生成一个独立的软件包。

注意最低系统要求仍然相同：.NET 4.0和Visual Studio2010，Ignite会保证主要版本（2.x）内的向后兼容性。但是在即将推出的Ignite 3.x中将切换到.NET Standard 2.0。

## LINQ：Conditional和批量更新

SQL的`UPDATE .. WHERE ..`或`DELETE .. WHERE ..`在ORM和LINQ中通常无法实现。Ignite最终使用`.Where()`来获取数据，然后一个一个更新，这个方案不是很理想，并且也不够优雅。

假设要冻结所有一年以上未使用我们网站的用户：
```csharp
ICacheClient<int, Person> cache = client.GetCache<int, Person>("person");

var threshold = DateTime.UtcNow.AddYears(-1);

IQueryable<ICacheEntry<int,Person>> inactiveUsers = cache.AsCacheQueryable()
	.Where(entry => entry.Value.LastActivityDate < threshold);

foreach (var entry in inactiveUsers)
{
	entry.Value.IsDeactivated = true;
	cache[entry.Key] = entry.Value;
}
```
这个代码会将匹配的数据加载到本地节点，浪费内存并给网络造成了压力，这也违背了Ignite并置处理的原则：即[将代码发到数据所在处，而不是将数据拉到代码所在处](https://ignite.apache.org/features/collocatedprocessing.html)。

解决方法是使用SQL代替：

```csharp
cache.Query(new SqlFieldsQuery(
	"UPDATE person SET IsDeactivated = true WHERE LastActivityDate < ?", threshold));
```
简单、简洁、高效：Ignite会将查询发送到所有节点，并对每个缓存数据在本地执行更新，从而避免了节点之间的任何数据移动。但是开发者不想要C＃中的SQL，而是想要LINQ，因为它经过了编译器检查，并且由于IDE的高效而更易于读写。

Ignite在2.5中通过LINQ引入了DML更新（除了Ignite2.1中的删除操作）：
```csharp
cache.AsCacheQueryable()
	.Where(entry => entry.Value.LastActivityDate < threshold)
	.UpdateAll(d => d.Set(person => person.IsDeactivated, true));
```
它将效率和LINQ的优点结合起来，转换为与上面相同的SQL查询。

## 动态服务代理

`IServices.GetDynamicServiceProxy()`是一个返回`dynamic`实例的新API，这样就无需事先创建接口即可调用任意服务，例如：
```csharp
interface ISomeService
{
    int GetId(string data);
}
...
ISomeService proxy = ignite.GetServices().GetServiceProxy<ISomeService>("someService");
var id = proxy.GetId("foo");
```
可以替换为：
```csharp
dynamic proxy = ignite.GetServices().GetDynamicServiceProxy("someService");
var id = proxy.GetId("foo");
```
这在POC、调用Java服务等许多场景中都很有用。

后续甚至还可以通过字符串名字调用服务的方法：
```csharp
var methodName = "foo";
var proxy = (DynamicObject) ignite.GetServices().GetDynamicServiceProxy("someService");
proxy.TryInvokeMember(new SimpleBinder(methodName), new object[0], out var result);
```
## 总结

今后，瘦客户端协议及其各种语言的实现是Apache Ignite社区的主要方向之一，其中分区感知是一个重要的里程碑。下一步是自动服务端节点发现，这样就不必手动提供端点列表。在即将发布的版本中，还会将计算、服务、事务（已在Java瘦客户端中提供）和其他API添加到瘦客户端，瘦客户端的功能将变得更为强大。
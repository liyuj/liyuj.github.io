# 键-值API
## 1.基本缓存操作
### 1.1.获取缓存的实例
在缓存上的所有操作都是通过`IgniteCache`实例进行的，也可以在已有的缓存上拿到`IgniteCache`，也可以动态创建。

<Tabs>
<Tab title="Java">

```java
Ignite ignite = Ignition.ignite();

// Obtain an instance of the cache named "myCache".
// Note that different caches may have different generics.
IgniteCache<Integer, String> cache = ignite.cache("myCache");
```
</Tab>

<Tab title="C#/.NET">

```csharp
IIgnite ignite = Ignition.Start();

// Obtain an instance of cache named "myCache".
// Note that generic arguments are only for your convenience.
// You can work with any cache in terms of any generic arguments.
// However, attempt to retrieve an entry of incompatible type
// will result in exception.
ICache<int, string> cache = ignite.GetCache<int, string>("myCache");
```
</Tab>

<Tab title="C++">

```cpp
IgniteConfiguration cfg;
cfg.springCfgPath = "/path/to/configuration.xml";

Ignite ignite = Ignition::Start(cfg);

// Obtain instance of cache named "myCache".
// Note that different caches may have different generics.
Cache<int32_t, std::string> cache = ignite.GetCache<int32_t, std::string>("myCache");
```
</Tab>
</Tabs>

### 1.2.动态创建缓存
动态创建缓存方式如下：

<Tabs>
<Tab title="Java">

```java
Ignite ignite = Ignition.ignite();

CacheConfiguration<Integer, String> cfg = new CacheConfiguration<>();

cfg.setName("myNewCache");
cfg.setAtomicityMode(CacheAtomicityMode.TRANSACTIONAL);

// Create a cache with the given name if it does not exist.
IgniteCache<Integer, String> cache = ignite.getOrCreateCache(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
IIgnite ignite = Ignition.Start();

// Create cache with given name, if it does not exist.
var cache = ignite.GetOrCreateCache<int, string>("myNewCache");
```
</Tab>

<Tab title="C++">

```cpp
IgniteConfiguration cfg;
cfg.springCfgPath = "/path/to/configuration.xml";

Ignite ignite = Ignition::Start(cfg);

// Create a cache with the given name, if it does not exist.
Cache<int32_t, std::string> cache = ignite.GetOrCreateCache<int32_t, std::string>("myNewCache");
```
</Tab>
</Tabs>

关于缓存的配置参数，请参见[缓存配置](/doc/java/ConfiguringCaches.md#_1-缓存配置)章节的内容。

在基线拓扑变更过程中调用创建缓存的方法，会抛出`org.apache.ignite.IgniteCheckedException`异常：

```
javax.cache.CacheException: class org.apache.ignite.IgniteCheckedException: Failed to start/stop cache, cluster state change is in progress.
        at org.apache.ignite.internal.processors.cache.GridCacheUtils.convertToCacheException(GridCacheUtils.java:1323)
        at org.apache.ignite.internal.IgniteKernal.createCache(IgniteKernal.java:3001)
        at org.apache.ignite.internal.processors.platform.client.cache.ClientCacheCreateWithNameRequest.process(ClientCacheCreateWithNameRequest.java:48)
        at org.apache.ignite.internal.processors.platform.client.ClientRequestHandler.handle(ClientRequestHandler.java:51)
        at org.apache.ignite.internal.processors.odbc.ClientListenerNioListener.onMessage(ClientListenerNioListener.java:173)
        at org.apache.ignite.internal.processors.odbc.ClientListenerNioListener.onMessage(ClientListenerNioListener.java:47)
        at org.apache.ignite.internal.util.nio.GridNioFilterChain$TailFilter.onMessageReceived(GridNioFilterChain.java:278)
        at org.apache.ignite.internal.util.nio.GridNioFilterAdapter.proceedMessageReceived(GridNioFilterAdapter.java:108)
        at org.apache.ignite.internal.util.nio.GridNioAsyncNotifyFilter$3.body(GridNioAsyncNotifyFilter.java:96)
        at org.apache.ignite.internal.util.worker.GridWorker.run(GridWorker.java:119)

        at java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1128)
        at java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:628)
        at java.base/java.lang.Thread.run(Thread.java:834)
```
如果拿到这个异常，可以进行重试。
### 1.3.销毁缓存
要在整个集群中删除一个缓存，需要调用`destroy()`方法：

<Tabs>
<Tab title="Java">

```java
Ignite ignite = Ignition.ignite();

IgniteCache<Long, String> cache = ignite.cache("myCache");

cache.destroy();
```
</Tab>
</Tabs>

### 1.4.原子化操作
拿到缓存实例后，就可以对其进行读写操作：

<Tabs>
<Tab title="Java">

```java
IgniteCache<Integer, String> cache = ignite.cache("myCache");

// Store keys in the cache (the values will end up on different cache nodes).
for (int i = 0; i < 10; i++)
    cache.put(i, Integer.toString(i));

for (int i = 0; i < 10; i++)
    System.out.println("Got [key=" + i + ", val=" + cache.get(i) + ']');
```
</Tab>

<Tab title="C#/.NET">

```csharp
using (var ignite = Ignition.Start("examples/config/example-cache.xml"))
{
    var cache = ignite.GetCache<int, string>("cache_name");

    for (var i = 0; i < 10; i++)
    {
        cache.Put(i, i.ToString());
    }

    for (var i = 0; i < 10; i++)
    {
        Console.Write("Got [key=" + i + ", val=" + cache.Get(i) + ']');
    }
}
```
</Tab>

<Tab title="C++">

```cpp
IgniteConfiguration cfg;
cfg.springCfgPath = "/path/to/configuration.xml";

try
{
    Ignite ignite = Ignition::Start(cfg);

    Cache<int32_t, std::string> cache = ignite.GetOrCreateCache<int32_t, std::string>(CACHE_NAME);

    // Store keys in the cache (the values will end up on different cache nodes).
    for (int32_t i = 0; i < 10; i++)
    {
        cache.Put(i, std::to_string(i));
    }

    for (int i = 0; i < 10; i++)
    {
        std::cout << "Got [key=" << i << ", val=" + cache.Get(i) << "]" << std::endl;
    }
}
catch (IgniteError& err)
{
    std::cout << "An error occurred: " << err.GetText() << std::endl;
    return err.GetCode();
}
```
</Tab>
</Tabs>

::: tip 提示
`putAll()`和`putAll()`这样的批量操作方法，是以原子化的模式按顺序执行，可能部分失败。发生这种情况时，会抛出包含了更新失败数据列表的`CachePartialUpdateException`异常。
如果希望在一个操作中更新条目的集合，建议考虑使用[事务](/doc/java/Transactions.md)。
:::
下面是更多基本缓存操作的示例：

<Tabs>
<Tab title="Java">

```java
// Put-if-absent which returns previous value.
String oldVal = cache.getAndPutIfAbsent(11, "Hello");

// Put-if-absent which returns boolean success flag.
boolean success = cache.putIfAbsent(22, "World");

// Replace-if-exists operation (opposite of getAndPutIfAbsent), returns previous
// value.
oldVal = cache.getAndReplace(11, "New value");

// Replace-if-exists operation (opposite of putIfAbsent), returns boolean
// success flag.
success = cache.replace(22, "Other new value");

// Replace-if-matches operation.
success = cache.replace(22, "Other new value", "Yet-another-new-value");

// Remove-if-matches operation.
success = cache.remove(11, "Hello");
```
</Tab>

<Tab title="C#/.NET">

```csharp
using (var ignite = Ignition.Start("examples/config/example-cache.xml"))
{
    var cache = ignite.GetCache<string, int>("cache_name");

    // Put-if-absent which returns previous value.
    var oldVal = cache.GetAndPutIfAbsent("Hello", 11);

    // Put-if-absent which returns boolean success flag.
    var success = cache.PutIfAbsent("World", 22);

    // Replace-if-exists operation (opposite of getAndPutIfAbsent), returns previous value.
    oldVal = cache.GetAndReplace("Hello", 11);

    // Replace-if-exists operation (opposite of putIfAbsent), returns boolean success flag.
    success = cache.Replace("World", 22);

    // Replace-if-matches operation.
    success = cache.Replace("World", 2, 22);

    // Remove-if-matches operation.
    success = cache.Remove("Hello", 1);
}
```
</Tab>

<Tab title="C++">

```cpp
IgniteConfiguration cfg;
cfg.springCfgPath = "/path/to/configuration.xml";

Ignite ignite = Ignition::Start(cfg);

Cache<std::string, int32_t> cache = ignite.GetOrCreateCache<std::string, int32_t>("myNewCache");

// Put-if-absent which returns previous value.
int32_t oldVal = cache.GetAndPutIfAbsent("Hello", 11);

// Put-if-absent which returns boolean success flag.
boolean success = cache.PutIfAbsent("World", 22);

// Replace-if-exists operation (opposite of getAndPutIfAbsent), returns previous value.
oldVal = cache.GetAndReplace("Hello", 11);

// Replace-if-exists operation (opposite of putIfAbsent), returns boolean success flag.
success = cache.Replace("World", 22);

// Replace-if-matches operation.
success = cache.Replace("World", 2, 22);

// Remove-if-matches operation.
success = cache.Remove("Hello", 1);
```
</Tab>
</Tabs>

### 1.5.异步执行
大多数缓存操作方法都有对应的异步执行模式，方法名带有`Async`后缀。

<Tabs>
<Tab title="Java">

```java
// a synchronous get
V get(K key);

// an asynchronous get
IgniteFuture<V> getAsync(K key);
```
</Tab>

<Tab title="C#/.NET">

```csharp
// a synchronous get
TV Get(TK key);

// an asynchronous get
Task<TV> GetAsync(TK key);
```
</Tab>

<Tab title="C++">

```cpp
// a synchronous get
V Get(K key);

// an asynchronous get
Future<V> GetAsync(K key);
```
</Tab>
</Tabs>

异步操作会返回一个代表操作结果的对象，可以以阻塞或非阻塞的方式，等待操作的完成。

以非阻塞的方式等待结果，可以使用`IgniteFuture.listen()`或`IgniteFuture.chain()`方法注册一个闭包，其会在操作完成后被调用。

<Tabs>
<Tab title="Java">

```java
IgniteCompute compute = ignite.compute();

// Execute a closure asynchronously.
IgniteFuture<String> fut = compute.callAsync(() -> "Hello World");

// Listen for completion and print out the result.
fut.listen(f -> System.out.println("Job result: " + f.get()));
```
</Tab>

<Tab title="C#/.NET">

```csharp
class HelloworldFunc : IComputeFunc<string>
{
    public string Invoke()
    {
        return "Hello World";
    }
}

public static void AsynchronousExecution()
{
    var ignite = Ignition.Start();
    var compute = ignite.GetCompute();

    //Execute a closure asynchronously
    var fut = compute.CallAsync(new HelloworldFunc());

    // Listen for completion and print out the result
    fut.ContinueWith(Console.Write);
}
```
</Tab>

<Tab title="C++">

```cpp
/*
 * Function class.
 */
class HelloWorld : public compute::ComputeFunc<void>
{
    friend struct ignite::binary::BinaryType<HelloWorld>;
public:
    /*
     * Default constructor.
     */
    HelloWorld()
    {
        // No-op.
    }

    /**
     * Callback.
     */
    virtual void Call()
    {
        std::cout << "Job Result: Hello World" << std::endl;
    }

};

/**
 * Binary type structure. Defines a set of functions required for type to be serialized and deserialized.
 */
namespace ignite
{
    namespace binary
    {
        template<>
        struct BinaryType<HelloWorld>
        {
            static int32_t GetTypeId()
            {
                return GetBinaryStringHashCode("HelloWorld");
            }

            static void GetTypeName(std::string& dst)
            {
                dst = "HelloWorld";
            }

            static int32_t GetFieldId(const char* name)
            {
                return GetBinaryStringHashCode(name);
            }

            static int32_t GetHashCode(const HelloWorld& obj)
            {
                return 0;
            }

            static bool IsNull(const HelloWorld& obj)
            {
                return false;
            }

            static void GetNull(HelloWorld& dst)
            {
                dst = HelloWorld();
            }

            static void Write(BinaryWriter& writer, const HelloWorld& obj)
            {
                // No-op.
            }

            static void Read(BinaryReader& reader, HelloWorld& dst)
            {
                // No-op.
            }
        };
    }
}

int main()
{
    IgniteConfiguration cfg;
    cfg.springCfgPath = "/path/to/configuration.xml";

    Ignite ignite = Ignition::Start(cfg);

    // Get binding instance.
    IgniteBinding binding = ignite.GetBinding();

    // Registering our class as a compute function.
    binding.RegisterComputeFunc<HelloWorld>();

    // Get compute instance.
    compute::Compute compute = ignite.GetCompute();

    // Declaring function instance.
    HelloWorld helloWorld;

    // Making asynchronous call.
    compute.RunAsync(helloWorld);
}
```
</Tab>
</Tabs>

::: tip 闭包执行和线程池
如果在将闭包传递给`IgniteFuture.listen()`或`IgniteFuture.chain()`方法时已完成异步操作，则该闭包由调用线程同步执行。否则当操作完成时，闭包将异步执行。

根据操作的类型，闭包将被系统线程池中的线程（异步缓存操作）或公共线程池中的线程（异步计算操作）调用。因此应避免在闭包内部调用同步缓存和计算操作，因为由于线程池不足，它可能导致死锁。

为了实现异步计算操作的嵌套执行，可以利用[自定义线程池](/doc/java/PerformanceTroubleshooting.md#_5-7-创建自定义线程池)。
:::
## 2.使用二进制对象
### 2.1.概述
在Ignite中，数据以[二进制格式](/doc/java/DataModeling.md#_4-二进制编组器)存储，然后在每次读取时再反序列化为对象，不过可以直接操作二进制对象避免反序列化。

二进制对象是缓存数据的二进制表示的包装器，每个二进制对象都有`field(name)`方法（返回对应字段的值）和`type()`方法（提取[对象的类型](#_2-4-二进制类型和二进制字段)信息）。当只需要处理对象的部分字段而不需要反序列化整个对象时，二进制对象会很有用。

处理二进制对象时不需要具体的类定义，不重启集群就可以[动态修改对象的结构](#_2-3-创建和修改二进制对象)。

在所有支持的平台上，二进制对象格式都是统一的，包括Java、.NET和C++。可以启动一个Java版Ignite集群，然后使用.NET和C++客户端接入集群，然后在这些客户端上使用二进制对象而不需要持有类定义。

::: warning 限制
 1. 在内部二进制对象的类型和字段以ID来标识，该ID由对应字符串名字的哈希值计算得出，这意味着属性或者类型不能有同样的名字哈希，因此不允许使用具有相同名字哈希的字段或类型。但是，可以通过配置提供[自定义的ID生成实现](#_2-6-配置二进制对象)；
 2. 同样的原因，`BinaryObject`格式在类的不同层次上也不允许有同样的属性名；
 3. 如果类实现了`Externalizable`接口，Ignite会使用`OptimizedMarshaller`，`OptimizedMarshaller`会使用`writeExternal()`和`readExternal()`来进行类对象的序列化和反序列化，这需要将实现`Externalizable`的类加入服务端节点的类路径中。
:::
### 2.2.启用缓存的二进制模式
当从缓存中拿数据时，默认返回的是反序列化格式，要处理二进制格式，需要使用`withKeepBinary()`方法拿到缓存的实例，这个实例会尽可能返回二进制格式的对象。

<Tabs>
<Tab title="Java">

```java
// Create a regular Person object and put it into the cache.
Person person = new Person(1, "FirstPerson");
ignite.cache("personCache").put(1, person);

// Get an instance of binary-enabled cache.
IgniteCache<Integer, BinaryObject> binaryCache = ignite.cache("personCache").withKeepBinary();
BinaryObject binaryPerson = binaryCache.get(1);
```
</Tab>

<Tab title="C#/.NET">

```csharp
ICache<int, IBinaryObject> binaryCache = cache.WithKeepBinary<int, IBinaryObject>();
IBinaryObject binaryPerson = binaryCache[1];
string name = binaryPerson.GetField<string>("Name");

IBinaryObjectBuilder builder = binaryPerson.ToBuilder();
builder.SetField("Name", name + " - Copy");

IBinaryObject binaryPerson2 = builder.Build();
binaryCache[2] = binaryPerson2;
```
</Tab>
</Tab>
</Tabs>

注意并不是所有的对象都会转为二进制对象格式，下面的类不会进行转换（即`toBinary(Object)`方法返回原始对象，以及这些类的实例存储不会发生变化）：

 - 所有的基本类型（`byte`、`int`等）及其包装类（`Byte`、`Integer`等）；
 - 基本类型的数组（`byte[]`、`int[]`等）；
 - `String`及其数组；
 - `UUID`及其数组；
 - `Date`及其数组；
 - `Timestamp`及其数组；
 - `Enum`及其数组；
 - 对象的映射、数组和集合（但如果它们是可以转成二进制的，则内部对象将被重新转换）。

### 2.3.创建和修改二进制对象
二进制对象实例是不可变的，要更新字段或者创建新的二进制对象，需要使用二进制对象的建造器工具类，其可以在没有对象的类定义的前提下，修改二进制对象的字段。

::: warning 限制

 - 无法修改已有字段的类型；
 - 无法变更枚举值的顺序，也无法在枚举值列表的开始或者中部添加新的常量，但是可以在列表的末尾添加新的常量。
:::
二进制对象建造器实例获取方式如下：

<Tabs>
<Tab title="Java">

```java
BinaryObjectBuilder builder = ignite.binary().builder("org.apache.ignite.snippets.Person");

builder.setField("id", 2L);
builder.setField("name", "SecondPerson");

binaryCache.put(2, builder.build());
```
</Tab>

<Tab title="C#/.NET">

```csharp
IIgnite ignite = Ignition.Start();

IBinaryObjectBuilder builder = ignite.GetBinary().GetBuilder("Book");

IBinaryObject book = builder
  .SetField("ISBN", "xyz")
  .SetField("Title", "War and Peace")
  .Build();
```
</Tab>
</Tabs>

通过这个方式创建的建造器没有任何字段，调用`setField(…​)`方法可以添加字段：

通过调用`toBuilder()`方法，也可以从一个已有的二进制对象上获得建造器实例，这时该二进制对象的所有字段都会复制到该建造器中。

在下面的示例中，会在服务端通过`EntryProcessor`机制更新一个对象，而不需要在该节点部署该对象类定义，也不需要完整对象的反序列化。

<Tabs>
<Tab title="Java">

```java
// The EntryProcessor is to be executed for this key.
int key = 1;
ignite.cache("personCache").<Integer, BinaryObject>withKeepBinary().invoke(key, (entry, arguments) -> {
    // Create a builder from the old value.
    BinaryObjectBuilder bldr = entry.getValue().toBuilder();

    //Update the field in the builder.
    bldr.setField("name", "Ignite");

    // Set new value to the entry.
    entry.setValue(bldr.build());

    return null;
});
```
</Tab>
</Tabs>

### 2.4.二进制类型和二进制字段
二进制对象持有其表示的对象的类型信息，类型信息包括字段名、字段类型和关联字段名。

每个字段的类型通过一个`BinaryField`对象来表示，获得`BinaryField`对象后，如果需要从集合中的每个对象读取相同的字段，则可以多次重用该对象。重用`BinaryField`对象比直接从每个二进制对象读取字段值要快，下面是使用二进制字段的示例：

```java
Collection<BinaryObject> persons = getPersons();

BinaryField salary = null;
double total = 0;
int count = 0;

for (BinaryObject person : persons) {
    if (salary == null) {
        salary = person.type().field("salary");
    }

    total += (float) salary.value(person);
    count++;
}

double avg = total / count;
```
### 2.5.二进制对象的优化建议
Ignite为给定类型的每个二进制对象保留一个*模式*，该模式指定对象中的字段及其顺序和类型。模式在整个集群中复制，具有相同字段但顺序不同的二进制对象被认为具有不同的模式，因此建议以相同的顺序往二进制对象中添加字段。

空字段通常需要5个字节来存储，字段ID4个字节，字段长度1个字节。在内存方面，最好不要包含字段，也不要包含空字段。但是，如果不包括字段，则Ignite会为此对象创建一个新模式，该模式与包含该字段的对象的模式不同。如果有多个字段以随机组合设置为`null`，那么Ignite会为每种组合维护一个不同的二进制对象模式，这样Java堆可能会被二进制对象模式耗尽。最好为二进制对象提供几个模式，并以相同的顺序设置相同类型的相同字段集。通过提供相同的字段集（即使具有空值）来创建二进制对象时，选择其中一个，这也是需要为空字段提供字段类型的原因。

如果有一个子集的字段是可选的，但要么全部不存在，要么全部存在，那么也可以嵌套二进制对象，可以将它们放在单独的二进制对象中，该对象存储在父对象的字段下，或者设置为null。

如果有大量字段，这些字段在任何组合中都是可选的，并且通常为空，则可以将其存储在映射字段中，值对象中将有几个固定字段，还有一个映射用于其他属性。
### 2.6.配置二进制对象
在绝大多数场景中，无需配置二进制对象。但是如果需要更改类型和字段ID的生成或插入自定义序列化器，则可以通过配置来实现。

二进制对象的类型和字段由其ID标识，该ID由相对应的字符串名计算为哈希值，并将其存储在每个二进制对象中，可以在配置中定义自己的ID生成实现。

名字到ID的转换分为两个步骤。首先，由名字映射器转换类型名（类名）或字段名，然后由ID映射器计算ID。可以指定全局名字映射器，全局ID映射器和全局二进制序列化器，以及每个类型的映射器和序列化器。每个类型的配置均支持通配符，这时所提供的配置将应用于与类型名字模板匹配的所有类型。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

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

</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration igniteCfg = new IgniteConfiguration();

BinaryConfiguration binaryConf = new BinaryConfiguration();
binaryConf.setNameMapper(new MyBinaryNameMapper());
binaryConf.setIdMapper(new MyBinaryIdMapper());

BinaryTypeConfiguration binaryTypeCfg = new BinaryTypeConfiguration();
binaryTypeCfg.setTypeName("org.apache.ignite.snippets.*");
binaryTypeCfg.setSerializer(new ExampleSerializer());

binaryConf.setTypeConfigurations(Collections.singleton(binaryTypeCfg));

igniteCfg.setBinaryConfiguration(binaryConf);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    BinaryConfiguration = new BinaryConfiguration
    {
        NameMapper = new ExampleGlobalNameMapper(),
        IdMapper = new ExampleGlobalIdMapper(),
        TypeConfigurations = new[]
        {
            new BinaryTypeConfiguration
            {
                TypeName = "org.apache.ignite.examples.*",
                Serializer = new ExampleSerializer()
            }
        }
    }
};
```
</Tab>
</Tabs>

## 3.使用扫描查询
### 3.1.概述
`IgniteCache`有几个查询方法，他们会接收`Query`类的子类，然后返回一个`QueryCursor`。

`Query`表示在缓存上执行的分页查询的抽象，页面大小通过`Query.setPageSize(…​)`进行配置，默认值为`1024`。

`QueryCursor`表示结果集，可以透明地按页迭代。当用户迭代到页尾时，`QueryCursor`会自动在后台请求下一页。对于不需要分页的场景，可以使用`QueryCursor.getAll()`方法，其会拿到所有的数据，并将其存储在一个集合中。

::: tip 关闭游标
调用`QueryCursor.getAll()`方法时，游标会自动关闭。如果在循环中迭代游标，或者显式拿到`Iterator`，必须手动关闭游标，或者使用`try-with-resources`语句。
:::

### 3.2.执行扫描查询
扫描查询是以分布式的方式从缓存中获取数据的简单搜索查询，如果执行时没有参数，扫描查询会从缓存中获取所有数据。

<Tabs>
<Tab title="Java">

```java
IgniteCache<Integer, Person> cache = ignite.getOrCreateCache("myCache");

QueryCursor<Cache.Entry<Integer, Person>> cursor = cache.query(new ScanQuery<>());
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cursor = cache.Query(new ScanQuery<int, Person>());
```
</Tab>

<Tab title="C++">

```cpp
Cache<int64_t, Person> cache = ignite.GetOrCreateCache<int64_t, ignite::Person>("personCache");

QueryCursor<int64_t, Person> cursor = cache.Query(ScanQuery());
```
</Tab>
</Tabs>

如果指定了谓语，扫描查询会返回匹配谓语的数据，谓语应用于远端节点：

<Tabs>
<Tab title="Java">

```java
IgniteCache<Integer, Person> cache = ignite.getOrCreateCache("myCache");

// Find the persons who earn more than 1,000.
IgniteBiPredicate<Integer, Person> filter = (key, p) -> p.getSalary() > 1000;

try (QueryCursor<Cache.Entry<Integer, Person>> qryCursor = cache.query(new ScanQuery<>(filter))) {
    qryCursor.forEach(
            entry -> System.out.println("Key = " + entry.getKey() + ", Value = " + entry.getValue()));
}
```
</Tab>

<Tab title="C#/.NET">

```csharp
class SalaryFilter : ICacheEntryFilter<int, Person>
{
    public bool Invoke(ICacheEntry<int, Person> entry)
    {
        return entry.Value.Salary > 1000;
    }
}

public static void ScanQueryFilterDemo()
{
    var ignite = Ignition.Start();
    var cache = ignite.GetOrCreateCache<int, Person>("person_cache");

    cache.Put(1, new Person {Name = "person1", Salary = 1001});
    cache.Put(2, new Person {Name = "person2", Salary = 999});

    using (var cursor = cache.Query(new ScanQuery<int, Person>(new SalaryFilter())))
    {
        foreach (var entry in cursor)
        {
            Console.WriteLine("Key = " + entry.Key + ", Value = " + entry.Value);
        }
    }
}
```
</Tab>
</Tabs>

扫描查询还支持可选的转换器闭包，可以在数据返回之前在服务端转换数据，比如，当只想从大对象中获取少量字段，以最小化网络传输时，这个功能就很有用。下面的示例显示如何只返回键，而不返回值：

```java
IgniteCache<Integer, Person> cache = ignite.getOrCreateCache("myCache");

// Get only keys for persons earning more than 1,000.
List<Integer> keys = cache.query(new ScanQuery<>(
        // Remote filter
        (IgniteBiPredicate<Integer, Person>) (k, p) -> p.getSalary() > 1000),
        // Transformer
        (IgniteClosure<Cache.Entry<Integer, Person>, Integer>) Cache.Entry::getKey).getAll();
```
### 3.3.本地扫描查询
扫描查询默认是分布到所有节点上的，不过也可以只在本地执行查询，这时查询只会处理本地节点（查询执行的节点）上存储的数据。

<Tabs>
<Tab title="Java">

```java
QueryCursor<Cache.Entry<Integer, Person>> cursor = cache
        .query(new ScanQuery<Integer, Person>().setLocal(true));
```
</Tab>

<Tab title="C#/.NET">

```csharp
var query = new ScanQuery<int, Person> {Local = true};
var cursor = cache.Query(query);
```
</Tab>

<Tab title="C++">

```cpp
ScanQuery sq;
sq.SetLocal(true);

QueryCursor<int64_t, Person> cursor = cache.Query(sq);
```
</Tab>
</Tabs>

### 3.4.相关主题

 - [通过REST API执行扫描查询](/doc/java/RESTAPI.md#_4-38-qryscanexe)；
 - [缓存查询事件](/doc/java/WorkingwithEvents.md#_2-5-缓存查询事件)。

## 4.读修复
::: warning 警告
这是个试验性API。
:::
`读修复`是指在正常读取操作期间修复主备数据之间不一致的技术。当用户操作读取了一个或多个特定键时，Ignite会检查给定键在所有备份副本中的值。

读修复模式旨在保持一致性。不过由于检查了备份副本，因此读操作的成本增加了约2倍。通常不建议一直使用此模式，而应一次性使用。

要启用读修复模式，需要获取一个开启了读修复的缓存实例，如下所示：
```java
IgniteCache<Object, Object> cache = ignite.cache("my_cache").withReadRepair();

Object value = cache.get(10);
```

一致性检查与下面的缓存配置不兼容：

 - 没有备份的缓存；
 - 本地缓存；
 - 近缓存；
 - 开启通读的缓存。

### 4.1.事务化缓存
拓扑中的值将替换为最新版本的值。

 - 对于配置为`TransactionConcurrency.OPTIMISTIC`并发模型或`TransactionIsolation.READ_COMMITTED`隔离级别的事务自动处理；
 - 对于配置为`TransactionConcurrency.PESSIMISTIC`并发模型和`TransactionIsolation.READ_COMMITTED`隔离级别的事务，在`commit()`阶段自动处理；

当检测到备份不一致时，Ignite将生成一个[违反一致性事件](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/events/EventType.html#EVT_CONSISTENCY_VIOLATION)（如果在配置中启用了该事件），通过监听该事件可以获取有关不一致问题的通知。关于如果进行事件监听，请参见[使用事件](/doc/java/WorkingwithEvents.md)的介绍。

如果事务中已经缓存了值，则读修复不能保证`检查所有副本`。例如，如果使用非`TransactionIsolation.READ_COMMITTED`隔离级别，并且已经读取了该值或执行了写入操作，则将获得缓存的值。

### 4.2.原子化缓存
如果发现差异，则抛出违反一致性异常。

由于原子化缓存的性质，可以观察到假阳性结果。比如在缓存加载中尝试检查一致性可能会触发违反一致性异常。读修复的实现会尝试检查给定键三次，尝试次数可以通过`IGNITE_NEAR_GET_MAX_REMAPS`系统属性来修改。

注意不会为原子缓存记录违反一致性事件。

<RightPane/>
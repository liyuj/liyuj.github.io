# Ignite持续查询
## 1.持续查询
持续查询可以监控缓存中数据的变化，启动后就会收到符合查询条件的数据变化的通知。

所有更新事件都会精确一次传播给查询中注册的本地监听器。

还可以指定一个远程过滤器，以缩小监听更新的条目范围。

::: danger 持续查询和MVCC
对于开启了MVCC的缓存，持续查询有一些[功能限制](/doc/java/WorkingwithSQL.md#_11-多版本并发控制)。
:::
### 1.1.本地监听器
当缓存发生更新（数据的插入、更新和删除）后，一个事件就会发给持续查询的本地监听器，之后应用就可以做出相应的反应，本地监听器是在发起查询的节点上执行的。

注意，如果启动时没有本地监听器，持续查询会抛出异常。

<Tabs>
<Tab title="Java">

```java
IgniteCache<Integer, String> cache = ignite.getOrCreateCache("myCache");

ContinuousQuery<Integer, String> query = new ContinuousQuery<>();

query.setLocalListener(new CacheEntryUpdatedListener<Integer, String>() {

    @Override
    public void onUpdated(Iterable<CacheEntryEvent<? extends Integer, ? extends String>> events)
        throws CacheEntryListenerException {
        // react to the update events here
    }
});

cache.query(query);
```
</Tab>

<Tab title="C#/.NET">

```csharp
class LocalListener : ICacheEntryEventListener<int, string>
{
    public void OnEvent(IEnumerable<ICacheEntryEvent<int, string>> evts)
    {
        foreach (var cacheEntryEvent in evts)
        {
            //react to update events here
        }
    }
}
public static void ContinuousQueryListenerDemo()
{
    var ignite = Ignition.Start(new IgniteConfiguration
    {
        DiscoverySpi = new TcpDiscoverySpi
        {
            LocalPort = 48500,
            LocalPortRange = 20,
            IpFinder = new TcpDiscoveryStaticIpFinder
            {
                Endpoints = new[]
                {
                    "127.0.0.1:48500..48520"
                }
            }
        }
    });
    var cache = ignite.GetOrCreateCache<int, string>("myCache");

    var query = new ContinuousQuery<int, string>(new LocalListener());

    var handle = cache.QueryContinuous(query);

    cache.Put(1, "1");
    cache.Put(2, "2");
}
```
</Tab>

<Tab title="C++">

```cpp
/**
 * Listener class.
 */
template<typename K, typename V>
class Listener : public event::CacheEntryEventListener<K, V>
{
public:
    /**
     * Default constructor.
     */
    Listener()
    {
        // No-op.
    }

    /**
     * Event callback.
     *
     * @param evts Events.
     * @param num Events number.
     */
    virtual void OnEvent(const CacheEntryEvent<K, V>* evts, uint32_t num)
    {
        for (uint32_t i = 0; i < num; ++i)
        {
            std::cout << "Queried entry [key=" << (evts[i].HasValue() ? evts[i].GetKey() : K())
                << ", val=" << (evts[i].HasValue() ? evts[i].GetValue() : V()) << ']'
                << std::endl;
        }
    }
};

int main()
{
    IgniteConfiguration cfg;
    cfg.springCfgPath = "/path/to/configuration.xml";

    Ignite ignite = Ignition::Start(cfg);

    Cache<int32_t, std::string> cache = ignite.GetOrCreateCache<int32_t, std::string>("myCache");

    // Declaring custom listener.
    Listener<int32_t, std::string> listener;

    // Declaring continuous query.
    continuous::ContinuousQuery<int32_t, std::string> query(MakeReference(listener));

    continuous::ContinuousQueryHandle<int32_t, std::string> handle = cache.QueryContinuous(query);
}
```
</Tab>
</Tabs>

### 1.2.初始查询
当要执行持续查询时，在将持续查询注册在集群中以及开始接收更新之前，可以选择指定一个初始化查询。其可以通过`ContinuousQuery.setInitialQuery(Query)`方法进行设置。

和扫描查询一样，持续查询通过`query()`方法执行然后返回一个游标。设置初始查询后，可以使用该游标迭代初始查询的结果。

<Tabs>
<Tab title="Java">

```java
IgniteCache<Integer, String> cache = ignite.getOrCreateCache("myCache");

ContinuousQuery<Integer, String> query = new ContinuousQuery<>();

// Setting an optional initial query.
// The query will return entries for the keys greater than 10.
query.setInitialQuery(new ScanQuery<>((k, v) -> k > 10));

//mandatory local listener
query.setLocalListener(events -> {
});

try (QueryCursor<Cache.Entry<Integer, String>> cursor = cache.query(query)) {
    // Iterating over the entries returned by the initial query
    for (Cache.Entry<Integer, String> e : cursor)
        System.out.println("key=" + e.getKey() + ", val=" + e.getValue());
}
```
</Tab>

<Tab title="C++">

```cpp
Cache<int32_t, std::string> cache = ignite.GetOrCreateCache<int32_t, std::string>("myCache");

// Custom listener
Listener<int32_t, std::string> listener;

// Declaring continuous query.
continuous::ContinuousQuery<int32_t, std::string> query(MakeReference(listener));

// Declaring optional initial query
ScanQuery initialQuery = ScanQuery();

continuous::ContinuousQueryHandle<int32_t, std::string> handle = cache.QueryContinuous(query, initialQuery);

// Iterating over existing data stored in the cache.
QueryCursor<int32_t, std::string> cursor = handle.GetInitialQueryCursor();

while (cursor.HasNext())
{
    std::cout << cursor.GetNext().GetKey() << std::endl;
}
```
</Tab>
</Tabs>

### 1.3.远程过滤器
过滤器会计算每条更新，然后评估该更新是否需要传播给该查询的本地监听器。如果过滤器返回`true`，那么本地监听器会收到更新的通知。

出于冗余原因，将对数据的主备版本（如果配置了备份）都执行过滤器。因此可以将远程过滤器用作更新事件的远程监听器。

<Tabs>
<Tab title="Java">

```java
ContinuousQuery<Integer, String> qry = new ContinuousQuery<>();

qry.setLocalListener(events ->
    events.forEach(event -> System.out.format("Entry: key=[%s] value=[%s]\n", event.getKey(), event.getValue()))
);

qry.setRemoteFilterFactory(new Factory<CacheEntryEventFilter<Integer, String>>() {
    @Override
    public CacheEntryEventFilter<Integer, String> create() {
        return new CacheEntryEventFilter<Integer, String>() {
            @Override
            public boolean evaluate(CacheEntryEvent<? extends Integer, ? extends String> e) {
                System.out.format("the value for key [%s] was updated from [%s] to [%s]\n", e.getKey(), e.getOldValue(), e.getValue());
                return true;
            }
        };
    }
});
```
</Tab>

<Tab title="C#/.NET">

```csharp
class LocalListener : ICacheEntryEventListener<int, string>
{
    public void OnEvent(IEnumerable<ICacheEntryEvent<int, string>> evts)
    {
        foreach (var cacheEntryEvent in evts)
        {
            //react to update events here
        }
    }
}
class RemoteFilter : ICacheEntryEventFilter<int, string>
{
    public bool Evaluate(ICacheEntryEvent<int, string> e)
    {
        if (e.Key == 1)
        {
            return false;
        }
        Console.WriteLine("the value for key {0} was updated from {1} to {2}", e.Key, e.OldValue, e.Value);
        return true;
    }
}
public static void ContinuousQueryFilterDemo()
{
    var ignite = Ignition.Start(new IgniteConfiguration
    {
        DiscoverySpi = new TcpDiscoverySpi
        {
            LocalPort = 48500,
            LocalPortRange = 20,
            IpFinder = new TcpDiscoveryStaticIpFinder
            {
                Endpoints = new[]
                {
                    "127.0.0.1:48500..48520"
                }
            }
        }
    });
    var cache = ignite.GetOrCreateCache<int, string>("myCache");

    var query = new ContinuousQuery<int, string>(new LocalListener(), new RemoteFilter());

    var handle = cache.QueryContinuous(query);

    cache.Put(1, "1");
    cache.Put(2, "2");
}
```
</Tab>

<Tab title="C++">

```cpp
template<typename K, typename V>
struct RemoteFilter : event::CacheEntryEventFilter<int32_t, std::string>
{
    /**
     * Default constructor.
     */
    RemoteFilter()
    {
        // No-op.
    }

    /**
     * Destructor.
     */
    virtual ~RemoteFilter()
    {
        // No-op.
    }

    /**
     * Event callback.
     *
     * @param event Event.
     * @return True if the event passes filter.
     */
    virtual bool Process(const CacheEntryEvent<K, V>& event)
    {
        std::cout << "The value for key " << event.GetKey() <<
            " was updated from " << event.GetOldValue() << " to " << event.GetValue() << std::endl;
        return true;
    }
};

namespace ignite
{
    namespace binary
    {
        template<>
        struct BinaryType< RemoteFilter<int32_t, std::string> >
        {
            static int32_t GetTypeId()
            {
                return GetBinaryStringHashCode("RemoteFilter<int32_t,std::string>");
            }

            static void GetTypeName(std::string& dst)
            {
                dst = "RemoteFilter<int32_t,std::string>";

            }

            static int32_t GetFieldId(const char* name)
            {
                return GetBinaryStringHashCode(name);
            }

            static bool IsNull(const RemoteFilter<int32_t, std::string>&)
            {
                return false;
            }

            static void GetNull(RemoteFilter<int32_t, std::string>& dst)
            {
                dst = RemoteFilter<int32_t, std::string>();
            }

            static void Write(BinaryWriter& writer, const RemoteFilter<int32_t, std::string>& obj)
            {
                // No-op.
            }

            static void Read(BinaryReader& reader, RemoteFilter<int32_t, std::string>& dst)
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

    // Start a node.
    Ignite ignite = Ignition::Start(cfg);

    // Get binding.
    IgniteBinding binding = ignite.GetBinding();

    // Registering remote filter.
    binding.RegisterCacheEntryEventFilter<RemoteFilter<int32_t, std::string>>();

    // Get cache instance.
    Cache<int32_t, std::string> cache = ignite.GetOrCreateCache<int32_t, std::string>("myCache");

    // Declaring custom listener.
    Listener<int32_t, std::string> listener;

    // Declaring filter.
    RemoteFilter<int32_t, std::string> filter;

    // Declaring continuous query.
    continuous::ContinuousQuery<int32_t, std::string> qry(MakeReference(listener), MakeReference(filter));
}
```
</Tab>
</Tabs>

::: tip 提示
为了使用远程过滤器，要确保过滤器的类定义在服务端节点可用，这有两个途径：

 - 将类文件加入每个服务端节点的类路径中；
 - 开启[对等类加载](/doc/java/CodeDeployment.md#_2-对等类加载)。

:::
### 1.4.远程转换器
持续查询默认会将整个更新后的对象发送给应用端的监听器，这会导致网络的过度使用，如果传输的对象很大，更是如此。另外，应用通常更希望得到更新对象的字段的子集，而不是整个对象。

为了解决这个问题，可以使用带有转换器的持续查询，转换器是一个在远程节点上针对每个更新执行的函数，然后只会返回转换的结果。

```java
IgniteCache<Integer, Person> cache = ignite.getOrCreateCache("myCache");

// Create a new continuous query with a transformer.
ContinuousQueryWithTransformer<Integer, Person, String> qry = new ContinuousQueryWithTransformer<>();

// Factory to create transformers.
Factory factory = FactoryBuilder.factoryOf(
    // Return one field of a complex object.
    // Only this field will be sent over to the local listener.
    (IgniteClosure<CacheEntryEvent, String>)
        event -> ((Person)event.getValue()).getName()
);

qry.setRemoteTransformerFactory(factory);

// Listener that will receive transformed data.
qry.setLocalListener(names -> {
    for (String name : names)
        System.out.println("New person name: " + name);
});
```
::: tip 提示
为了使用转换器，要确保转换器的类定义在服务端节点可用，这有两个途径：

 - 将类文件加入每个服务端节点的类路径中；
 - 开启[对等类加载](/doc/java/CodeDeployment.md#_2-对等类加载)。

:::
### 1.5.事件传递保证
持续查询的实现保证一个事件只会传递给客户端的本地监听器一次的精确一次语义。

主备节点都会维护一个更新队列，该队列持有事件，这些事件由服务端的持续查询处理，但尚未传递给客户端。假设主节点故障或集群拓扑因故发生变更，每个备份节点都会将其更新队列的内容刷新到客户端，以确保将每个事件都传递到客户端的本地监听器。

Ignite管理一个特殊的分区级更新计数器，该计数器会避免重复的通知。一旦某个分区中的条目更新，该分区的计数器将在主备节点上都递增。该计数器的值也与事件通知一起发送到客户端。因此，客户端可以跳过已经处理的事件。客户端确认收到事件后，主节点和备份节点将从其备份队列中删除此事件的记录。
### 1.6.示例
下面的示例演示了持续查询的典型使用：

 - [CacheContinuousQueryExample.java](https://github.com/apache/ignite/tree/master/examples/src/main/java/org/apache/ignite/examples/datagrid/CacheContinuousQueryExample.java)；
 - [CacheContinuousAsyncQueryExample.java](https://github.com/apache/ignite/tree/master/examples/src/main/java/org/apache/ignite/examples/datagrid/CacheContinuousAsyncQueryExample.java)；
 - [CacheContinuousQueryWithTransformerExample.java](https://github.com/apache/ignite/tree/master/examples/src/main/java/org/apache/ignite/examples/datagrid/CacheContinuousQueryWithTransformerExample.java)。

<RightPane/>
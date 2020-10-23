# 数据流处理
## 1.概述
Ignite提供了一个数据流API，可用于将大量连续的数据流注入Ignite集群，数据流API支持容错和线性扩展，并为注入Ignite的数据提供了至少一次保证，这意味着每个条目至少会被处理一次。

数据通过与缓存关联的数据流处理器流式注入到缓存中。数据流处理器自动缓冲数据并将其分组成批次以提高性能，并将其并行发送到多个节点。

数据流API提供以下功能：

 - 添加到数据流处理器的数据将在节点之间自动分区和分布；
 - 可以以并置方式并发处理数据；
 - 客户端可以在注入数据时对数据执行并发SQL查询。

![](https://ignite.apache.org/docs/2.9.0/images/data_streaming.png)

## 2.数据流处理器
数据流处理器与特定的缓存关联，并提供用于将数据注入缓存的接口。

在典型场景中，用户拿到数据流处理器之后，会使用其中某个方法将数据流式注入缓存中，而Ignite根据分区规则对数据条目进行批处理，从而避免不必要的数据移动。

拿到特定缓存的数据流处理器的方法如下：

<Tabs>
<Tab title="Java">

```java
// Get the data streamer reference and stream data.
try (IgniteDataStreamer<Integer, String> stmr = ignite.dataStreamer("myCache")) {
    // Stream entries.
    for (int i = 0; i < 100000; i++)
        stmr.addData(i, Integer.toString(i));
}
System.out.println("dataStreamerExample output:" + cache.get(99999));
```
</Tab>

<Tab title="C#/.NET">

```csharp
using (var stmr = ignite.GetDataStreamer<int, string>("myCache"))
{
    for (var i = 0; i < 1000; i++)
        stmr.AddData(i, i.ToString());
}
```
</Tab>
</Tabs>

在Ignite的Java版本中，数据流处理器是`IgniteDataStreamer`接口的实现，`IgniteDataStreamer`提供了一组`addData(…​)`方法来向缓存中添加键-值对，完整的方法列表，可以参见[IgniteDataStreamer](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/IgniteDataStreamer.html)的javadoc。
## 3.覆写已有的数据
数据流处理器默认不会覆盖已有的数据，通过将`allowOverwrite`属性配置为`true`，可以修改该行为。

<Tabs>
<Tab title="Java">

```java
stmr.allowOverwrite(true);
```
</Tab>

<Tab title="C#/.NET">

```csharp
stmr.AllowOverwrite = true;
```
</Tab>
</Tabs>

::: tip 提示
如果`allowOverwrite`配置为`false`（默认），更新不会传播到[外部存储](/doc/java/Persistence.md#_2-外部存储)（如果开启）。
:::
## 4.处理数据
如果需要在添加新数据之前执行自定义逻辑，则可以使用数据流接收器。在将数据存储到缓存之前，数据流接收器用于以并置方式处理数据，其中实现的逻辑会在存储数据的节点上执行。

<Tabs>
<Tab title="Java">

```java
try (IgniteDataStreamer<Integer, String> stmr = ignite.dataStreamer("myCache")) {

    stmr.allowOverwrite(true);

    stmr.receiver((StreamReceiver<Integer, String>) (cache, entries) -> entries.forEach(entry -> {

        // do something with the entry

        cache.put(entry.getKey(), entry.getValue());
    }));
}
```
</Tab>

<Tab title="C#/.NET">

```csharp
private class MyStreamReceiver : IStreamReceiver<int, string>
{
    public void Receive(ICache<int, string> cache, ICollection<ICacheEntry<int, string>> entries)
    {
        foreach (var entry in entries)
        {
            // do something with the entry

            cache.Put(entry.Key, entry.Value);
        }
    }
}

public static void StreamReceiverDemo()
{
    var ignite = Ignition.Start();

    using (var stmr = ignite.GetDataStreamer<int, string>("myCache"))
    {
        stmr.AllowOverwrite = true;
        stmr.Receiver = new MyStreamReceiver();
    }
}
```
</Tab>
</Tabs>

::: tip 提示
注意数据流接收器不会自动将数据注入缓存，需要显式地调用`put(…​)`方法之一。
:::
::: warning 警告
要在远端节点执行的接收器类定义必须在该节点可用，这可通过2种方式实现：

 - 将类文件加入该节点的类路径；
 - 开启[对等类加载](/doc/java/CodeDeployment.md#_2-对等类加载)；

:::
### 4.1.StreamTransformer
`StreamTransformer`是`StreamReceiver`的简单实现，用于更新流中的数据。数据流转换器利用了并置的特性，并在将要存储数据的节点上更新数据。

在下面的示例中，使用`StreamTransformer`为文本流中找到的每个不同单词增加一个计数：

<Tabs>
<Tab title="Java">

```java
String[] text = { "hello", "world", "hello", "Ignite" };
CacheConfiguration<String, Long> cfg = new CacheConfiguration<>("wordCountCache");

IgniteCache<String, Long> stmCache = ignite.getOrCreateCache(cfg);

try (IgniteDataStreamer<String, Long> stmr = ignite.dataStreamer(stmCache.getName())) {
    // Allow data updates.
    stmr.allowOverwrite(true);

    // Configure data transformation to count instances of the same word.
    stmr.receiver(StreamTransformer.from((e, arg) -> {
        // Get current count.
        Long val = e.getValue();

        // Increment count by 1.
        e.setValue(val == null ? 1L : val + 1);

        return null;
    }));

    // Stream words into the streamer cache.
    for (String word : text)
        stmr.addData(word, 1L);

}
```
</Tab>

<Tab title="C#/.NET">

```csharp
class MyEntryProcessor : ICacheEntryProcessor<string, long, object, object>
{
    public object Process(IMutableCacheEntry<string, long> e, object arg)
    {
        //get current count
        var val = e.Value;

        //increment count by 1
        e.Value = val == 0 ? 1L : val + 1;

        return null;
    }
}

public static void StreamTransformerDemo()
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
    var cfg = new CacheConfiguration("wordCountCache");
    var stmCache = ignite.GetOrCreateCache<string, long>(cfg);

    using (var stmr = ignite.GetDataStreamer<string, long>(stmCache.Name))
    {
        //Allow data updates
        stmr.AllowOverwrite = true;

        //Configure data transformation to count instances of the same word
        stmr.Receiver = new StreamTransformer<string, long, object, object>(new MyEntryProcessor());

        //stream words into the streamer cache
        foreach (var word in GetWords())
        {
            stmr.AddData(word, 1L);
        }
    }

    Console.WriteLine(stmCache.Get("a"));
    Console.WriteLine(stmCache.Get("b"));
}

static IEnumerable<string> GetWords()
{
    //populate words list somehow
    return Enumerable.Repeat("a", 3).Concat(Enumerable.Repeat("b", 2));
}
```
</Tab>
</Tabs>

### 4.2.StreamVisitor
`StreamVisitor`也是`StreamReceiver`的一个方便实现，它会访问流中的每个键-值对，但不会更新缓存。如果键-值对需要存储在缓存内，那么需要显式地调用任意的`put(...)`方法。

在下面的示例中，有两个缓存:`marketData`和`instruments`，收到market数据的瞬间就会将它们放入`marketData`缓存的流处理器，映射到特定market数据的集群节点上的`marketData`的流处理器的`StreamVisitor`就会被调用，在分别收到market数据后就会用最新的市场价格更新`instrument`缓存。

注意，根本不会更新`marketData`缓存，它一直是空的，只是直接在数据将要存储的集群节点上简单利用了market数据的并置处理能力。

<Tabs>
<Tab title="Java">

```java
static class Instrument {
    final String symbol;
    Double latest;
    Double high;
    Double low;

    public Instrument(String symbol) {
        this.symbol = symbol;
    }

}

static Map<String, Double> getMarketData() {
    //populate market data somehow
    return new HashMap<>();
}

@Test
void streamVisitorExample() {
    try (Ignite ignite = Ignition.start()) {
        CacheConfiguration<String, Double> mrktDataCfg = new CacheConfiguration<>("marketData");
        CacheConfiguration<String, Instrument> instCfg = new CacheConfiguration<>("instruments");

        // Cache for market data ticks streamed into the system.
        IgniteCache<String, Double> mrktData = ignite.getOrCreateCache(mrktDataCfg);

        // Cache for financial instruments.
        IgniteCache<String, Instrument> instCache = ignite.getOrCreateCache(instCfg);

        try (IgniteDataStreamer<String, Double> mktStmr = ignite.dataStreamer("marketData")) {
            // Note that we do not populate the 'marketData' cache (it remains empty).
            // Instead we update the 'instruments' cache based on the latest market price.
            mktStmr.receiver(StreamVisitor.from((cache, e) -> {
                String symbol = e.getKey();
                Double tick = e.getValue();

                Instrument inst = instCache.get(symbol);

                if (inst == null)
                    inst = new Instrument(symbol);

                // Update instrument price based on the latest market tick.
                inst.high = Math.max(inst.high, tick);
                inst.low = Math.min(inst.low, tick);
                inst.latest = tick;

                // Update the instrument cache.
                instCache.put(symbol, inst);
            }));

            // Stream market data into the cluster.
            Map<String, Double> marketData = getMarketData();
            for (Map.Entry<String, Double> tick : marketData.entrySet())
                mktStmr.addData(tick);
        }
    }
}
```
</Tab>

<Tab title="C#/.NET">

```csharp
class Instrument
{
    public readonly string Symbol;
    public double Latest { get; set; }
    public double High { get; set; }
    public double Low { get; set; }

    public Instrument(string symbol)
    {
        this.Symbol = symbol;
    }
}

private static Dictionary<string, double> getMarketData()
{
    //populate market data somehow
    return new Dictionary<string, double>
    {
        ["foo"] = 1.0,
        ["foo"] = 2.0,
        ["foo"] = 3.0
    };
}

public static void StreamVisitorDemo()
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

    var mrktDataCfg = new CacheConfiguration("marketData");
    var instCfg = new CacheConfiguration("instruments");

    // Cache for market data ticks streamed into the system
    var mrktData = ignite.GetOrCreateCache<string, double>(mrktDataCfg);
    // Cache for financial instruments
    var instCache = ignite.GetOrCreateCache<string, Instrument>(instCfg);

    using (var mktStmr = ignite.GetDataStreamer<string, double>("marketData"))
    {
        // Note that we do not populate 'marketData' cache (it remains empty).
        // Instead we update the 'instruments' cache based on the latest market price.
        mktStmr.Receiver = new StreamVisitor<string, double>((cache, e) =>
        {
            var symbol = e.Key;
            var tick = e.Value;

            Instrument inst = instCache.Get(symbol);

            if (inst == null)
            {
                inst = new Instrument(symbol);
            }

            // Update instrument price based on the latest market tick.
            inst.High = Math.Max(inst.High, tick);
            inst.Low = Math.Min(inst.Low, tick);
            inst.Latest = tick;
        });
        var marketData = getMarketData();
        foreach (var tick in marketData)
        {
            mktStmr.AddData(tick);
        }
        mktStmr.Flush();
        Console.Write(instCache.Get("foo"));
    }
}
```
</Tab>
</Tabs>

## 5.配置数据流处理器线程池大小
数据流处理器线程池专用于处理来自数据流处理器的消息。

默认池大小为`max(8, CPU总核数)`，使用`IgniteConfiguration.setDataStreamerThreadPoolSize(…​)`可以改变线程池的大小。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="dataStreamerThreadPoolSize" value="10"/>

    <!-- other properties -->

</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();
cfg.setDataStreamerThreadPoolSize(10);

Ignite ignite = Ignition.start(cfg);
```
</Tab>
</Tabs>

<RightPane/>
# 分布式计算
## 1.分布式计算API
Ignite提供了一套API，用于在集群范围以容错和负载平衡的方式执行分布式计算。可以提交单个任务执行，也可以通过自动任务拆分实施MapReduce模式的并行计算，该API可以进行细粒度的控制。
### 1.1.获取计算接口实例
执行分布式计算的主要入口是计算接口，该接口可通过`Ignite`实例获得：

<Tabs>
<Tab title="Java">

```java
Ignite ignite = Ignition.start();

IgniteCompute compute = ignite.compute();
```
</Tab>

<Tab title="C#/.NET">

```csharp
var ignite = Ignition.Start();
var compute = ignite.GetCompute();
```
</Tab>

<Tab title="C++">

```cpp
Ignite ignite = Ignition::Start(cfg);

Compute compute = ignite.GetCompute();
```
</Tab>
</Tabs>

该接口提供了在集群范围分发不同类型计算任务然后执行[并置计算](#_8-计算和数据并置)的方法。

### 1.2.指定计算节点集
每个计算接口的实例都是与一组执行任务的[节点集](#_2-集群组)相关联的。如果没有参数，`ignite.compute()`返回的计算接口是与所有的服务端节点关联的，要获得与特定节点集关联的实例，需要使用`Ignite.compute(ClusterGroup group)`。在下面的示例中，计算接口只绑定到远程节点，即除了运行本代码的所有节点。

<Tabs>
<Tab title="Java">

```java
Ignite ignite = Ignition.start();

IgniteCompute compute = ignite.compute(ignite.cluster().forRemotes());
```
</Tab>

<Tab title="C#/.NET">

```csharp
var ignite = Ignition.Start();
var compute = ignite.GetCluster().ForRemotes().GetCompute();
```
</Tab>
</Tabs>

### 1.3.执行任务
Ignite提供了3个接口，用于实现具体的任务并通过计算接口执行。

 - `IgniteRunnable`：一个`java.lang.Runnable`的扩展，可用于实现没有输入参数和返回值的计算；
 - `IgniteCallable`：一个`java.util.concurrent.Callable`的扩展，会有一个返回值；
 - `IgniteClosure`：一个函数式接口，可以接受一个参数，并且有返回值。

一个任务可以执行一次（在某个节点上），或者广播到所有的节点。

::: warning 警告
为了能在远程节点执行任务，一定要确保任务的类定义在节点上可用，具体有两种方式：

 - 将类文件添加到节点的类路径；
 - 开启[对等类加载](/doc/java/CodeDeployment.md#_2-对等类加载)。
:::
#### 1.3.1.执行Runnable任务
要执行Runnable任务，需要使用计算接口的`run(…​)`方法，这时该任务会被发送到与计算接口关联的某个节点上。

<Tabs>
<Tab title="Java">

```java
IgniteCompute compute = ignite.compute();

// Iterate through all words and print
// each word on a different cluster node.
for (String word : "Print words on different cluster nodes".split(" ")) {
    compute.run(() -> System.out.println(word));
}
```
</Tab>

<Tab title="C#/.NET">

```csharp
class PrintWordAction : IComputeAction
{
    public void Invoke()
    {
        foreach (var s in "Print words on different cluster nodes".Split(" "))
        {
            Console.WriteLine(s);
        }
    }
}

public static void ComputeRunDemo()
{
    var ignite = Ignition.Start(
        new IgniteConfiguration
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
        }
    );
    ignite.GetCompute().Run(new PrintWordAction());
}
```
</Tab>

<Tab title="C++">

```cpp
/*
 * Function class.
 */
class PrintWord : public compute::ComputeFunc<void>
{
    friend struct ignite::binary::BinaryType<PrintWord>;
public:
    /*
     * Default constructor.
     */
    PrintWord()
    {
        // No-op.
    }

    /*
     * Constructor.
     *
     * @param text Text.
     */
    PrintWord(const std::string& word) :
        word(word)
    {
        // No-op.
    }

    /**
     * Callback.
     */
    virtual void Call()
    {
        std::cout << word << std::endl;
    }

    /** Word to print. */
    std::string word;

};

/**
 * Binary type structure. Defines a set of functions required for type to be serialized and deserialized.
 */
namespace ignite
{
    namespace binary
    {
        template<>
        struct BinaryType<PrintWord>
        {
            static int32_t GetTypeId()
            {
                return GetBinaryStringHashCode("PrintWord");
            }

            static void GetTypeName(std::string& dst)
            {
                dst = "PrintWord";
            }

            static int32_t GetFieldId(const char* name)
            {
                return GetBinaryStringHashCode(name);
            }

            static int32_t GetHashCode(const PrintWord& obj)
            {
                return 0;
            }

            static bool IsNull(const PrintWord& obj)
            {
                return false;
            }

            static void GetNull(PrintWord& dst)
            {
                dst = PrintWord("");
            }

            static void Write(BinaryWriter& writer, const PrintWord& obj)
            {
                writer.RawWriter().WriteString(obj.word);
            }

            static void Read(BinaryReader& reader, PrintWord& dst)
            {
                dst.word = reader.RawReader().ReadString();
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
    binding.RegisterComputeFunc<PrintWord>();

    // Get compute instance.
    compute::Compute compute = ignite.GetCompute();

    std::istringstream iss("Print words on different cluster nodes");
    std::vector<std::string> words((std::istream_iterator<std::string>(iss)),
        std::istream_iterator<std::string>());

    // Iterate through all words and print
    // each word on a different cluster node.
    for (std::string word : words)
    {
        // Run compute task.
        compute.Run(PrintWord(word));
    }
}
```
</Tab>
</Tabs>

#### 1.3.2.执行Callable任务
要执行Callable任务，需要使用计算接口的`call(…​)`方法。

<Tabs>
<Tab title="Java">

```java
Collection<IgniteCallable<Integer>> calls = new ArrayList<>();

// Iterate through all words in the sentence and create callable jobs.
for (String word : "How many characters".split(" "))
    calls.add(word::length);

// Execute the collection of callables on the cluster.
Collection<Integer> res = ignite.compute().call(calls);

// Add all the word lengths received from cluster nodes.
int total = res.stream().mapToInt(Integer::intValue).sum();
```
</Tab>

<Tab title="C#/.NET">

```csharp
class CharCounter : IComputeFunc<int>
{
    private readonly string arg;

    public CharCounter(string arg)
    {
        this.arg = arg;
    }

    public int Invoke()
    {
        return arg.Length;
    }
}

public static void ComputeFuncDemo()
{
    var ignite = Ignition.Start(
        new IgniteConfiguration
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
        }
    );

    // Iterate through all words in the sentence and create callable jobs.
    var calls = "How many characters".Split(" ").Select(s => new CharCounter(s)).ToList();

    // Execute the collection of calls on the cluster.
    var res = ignite.GetCompute().Call(calls);

    // Add all the word lengths received from cluster nodes.
    var total = res.Sum();
}
```
</Tab>

<Tab title="C++">

```cpp
/*
 * Function class.
 */
class CountLength : public compute::ComputeFunc<int32_t>
{
    friend struct ignite::binary::BinaryType<CountLength>;
public:
    /*
     * Default constructor.
     */
    CountLength()
    {
        // No-op.
    }

    /*
     * Constructor.
     *
     * @param text Text.
     */
    CountLength(const std::string& word) :
        word(word)
    {
        // No-op.
    }

    /**
     * Callback.
     * Counts number of characters in provided word.
     *
     * @return Word's length.
     */
    virtual int32_t Call()
    {
        return word.length();
    }

    /** Word to print. */
    std::string word;

};

/**
 * Binary type structure. Defines a set of functions required for type to be serialized and deserialized.
 */
namespace ignite
{
    namespace binary
    {
        template<>
        struct BinaryType<CountLength>
        {
            static int32_t GetTypeId()
            {
                return GetBinaryStringHashCode("CountLength");
            }

            static void GetTypeName(std::string& dst)
            {
                dst = "CountLength";
            }

            static int32_t GetFieldId(const char* name)
            {
                return GetBinaryStringHashCode(name);
            }

            static int32_t GetHashCode(const CountLength& obj)
            {
                return 0;
            }

            static bool IsNull(const CountLength& obj)
            {
                return false;
            }

            static void GetNull(CountLength& dst)
            {
                dst = CountLength("");
            }

            static void Write(BinaryWriter& writer, const CountLength& obj)
            {
                writer.RawWriter().WriteString(obj.word);
            }

            static void Read(BinaryReader& reader, CountLength& dst)
            {
                dst.word = reader.RawReader().ReadString();
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
    binding.RegisterComputeFunc<CountLength>();

    // Get compute instance.
    compute::Compute compute = ignite.GetCompute();

    std::istringstream iss("How many characters");
    std::vector<std::string> words((std::istream_iterator<std::string>(iss)),
        std::istream_iterator<std::string>());

    int32_t total = 0;

    // Iterate through all words in the sentence, create and call jobs.
    for (std::string word : words)
    {
        // Add word length received from cluster node.
        total += compute.Call<int32_t>(CountLength(word));
    }
}
```
</Tab>
</Tabs>

#### 1.3.3.执行IgniteClosure任务
执行`IgniteClosure`，需要调用计算接口的`apply(…​)`方法。该方法接受一个任务及其输入参数，该参数会在执行时传给`IgniteClosure`。

<Tabs>
<Tab title="Java">

```java
IgniteCompute compute = ignite.compute();

// Execute closure on all cluster nodes.
Collection<Integer> res = compute.apply(String::length, Arrays.asList("How many characters".split(" ")));

// Add all the word lengths received from cluster nodes.
int total = res.stream().mapToInt(Integer::intValue).sum();
```
</Tab>

<Tab title="C#/.NET">

```csharp
class CharCountingFunc : IComputeFunc<string, int>
{
    public int Invoke(string arg)
    {
        return arg.Length;
    }
}

public static void Foo()
{
    var ignite = Ignition.Start(
        new IgniteConfiguration
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
        }
    );

    var res = ignite.GetCompute().Apply(new CharCountingFunc(), "How many characters".Split());

    int total = res.Sum();
}
```
</Tab>
</Tabs>

#### 1.3.4.执行广播任务
`broadcast()`方法会在与计算实例相关联的所有节点上执行任务。

<Tabs>
<Tab title="Java">

```java
// Limit broadcast to remote nodes only.
IgniteCompute compute = ignite.compute(ignite.cluster().forRemotes());

// Print out hello message on remote nodes in the cluster group.
compute.broadcast(() -> System.out.println("Hello Node: " + ignite.cluster().localNode().id()));
```
</Tab>

<Tab title="C#/.NET">

```csharp
class PrintNodeIdAction : IComputeAction
{
    public void Invoke()
    {
        Console.WriteLine("Hello node: " +
                          Ignition.GetIgnite().GetCluster().GetLocalNode().Id);
    }
}

public static void BroadcastDemo()
{
    var ignite = Ignition.Start(
        new IgniteConfiguration
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
        }
    );

    // Limit broadcast to remote nodes only.
    var compute = ignite.GetCluster().ForRemotes().GetCompute();
    // Print out hello message on remote nodes in the cluster group.
    compute.Broadcast(new PrintNodeIdAction());
}
```
</Tab>

<Tab title="C++">

```cpp
/*
 * Function class.
 */
class Hello : public compute::ComputeFunc<void>
{
    friend struct ignite::binary::BinaryType<Hello>;
public:
    /*
     * Default constructor.
     */
    Hello()
    {
        // No-op.
    }

    /**
     * Callback.
     */
    virtual void Call()
    {
        std::cout << "Hello" << std::endl;
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
        struct BinaryType<Hello>
        {
            static int32_t GetTypeId()
            {
                return GetBinaryStringHashCode("Hello");
            }

            static void GetTypeName(std::string& dst)
            {
                dst = "Hello";
            }

            static int32_t GetFieldId(const char* name)
            {
                return GetBinaryStringHashCode(name);
            }

            static int32_t GetHashCode(const Hello& obj)
            {
                return 0;
            }

            static bool IsNull(const Hello& obj)
            {
                return false;
            }

            static void GetNull(Hello& dst)
            {
                dst = Hello();
            }

            static void Write(BinaryWriter& writer, const Hello& obj)
            {
                // No-op.
            }

            static void Read(BinaryReader& reader, Hello& dst)
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
    binding.RegisterComputeFunc<Hello>();

    // Broadcast to all nodes.
    compute::Compute compute = ignite.GetCompute();

    // Declaring function instance.
    Hello hello;

    // Print out hello message on nodes in the cluster group.
    compute.Broadcast(hello);
}
```
</Tab>
</Tabs>

#### 1.3.5.异步执行
前述所有方法都有对应的异步实现。

 - `callAsync(…​)`；
 - `runAsync(…​)`;
 - `applyAsync(…​)`;
 - `broadcastAsync(…​)`。

异步方法会返回一个表示执行结果的`IgniteFuture`，在下面的示例中，会异步执行一组Callable任务：

<Tabs>
<Tab title="Java">

```java
IgniteCompute compute = ignite.compute();

Collection<IgniteCallable<Integer>> calls = new ArrayList<>();

// Iterate through all words in the sentence and create callable jobs.
for (String word : "Count characters using a callable".split(" "))
    calls.add(word::length);

IgniteFuture<Collection<Integer>> future = compute.callAsync(calls);

future.listen(fut -> {
    // Total number of characters.
    int total = fut.get().stream().mapToInt(Integer::intValue).sum();

    System.out.println("Total number of characters: " + total);
});
```
</Tab>

<Tab title="C#/.NET">

```csharp
class CharCounter : IComputeFunc<int>
{
    private readonly string arg;

    public CharCounter(string arg)
    {
        this.arg = arg;
    }

    public int Invoke()
    {
        return arg.Length;
    }
}
public static void AsyncDemo()
{
    var ignite = Ignition.Start(
        new IgniteConfiguration
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
        }
    );

    var calls = "Count character using async compute"
        .Split(" ").Select(s => new CharCounter(s)).ToList();

    var future = ignite.GetCompute().CallAsync(calls);

    future.ContinueWith(fut =>
    {
        var total = fut.Result.Sum();
        Console.WriteLine("Total number of characters: " + total);
    });
}
```
</Tab>

<Tab title="C++">

```cpp
/*
 * Function class.
 */
class CountLength : public compute::ComputeFunc<int32_t>
{
    friend struct ignite::binary::BinaryType<CountLength>;
public:
    /*
     * Default constructor.
     */
    CountLength()
    {
        // No-op.
    }

    /*
     * Constructor.
     *
     * @param text Text.
     */
    CountLength(const std::string& word) :
        word(word)
    {
        // No-op.
    }

    /**
     * Callback.
     * Counts number of characters in provided word.
     *
     * @return Word's length.
     */
    virtual int32_t Call()
    {
        return word.length();
    }

    /** Word to print. */
    std::string word;

};

/**
 * Binary type structure. Defines a set of functions required for type to be serialized and deserialized.
 */
namespace ignite
{
    namespace binary
    {
        template<>
        struct BinaryType<CountLength>
        {
            static int32_t GetTypeId()
            {
                return GetBinaryStringHashCode("CountLength");
            }

            static void GetTypeName(std::string& dst)
            {
                dst = "CountLength";
            }

            static int32_t GetFieldId(const char* name)
            {
                return GetBinaryStringHashCode(name);
            }

            static int32_t GetHashCode(const CountLength& obj)
            {
                return 0;
            }

            static bool IsNull(const CountLength& obj)
            {
                return false;
            }

            static void GetNull(CountLength& dst)
            {
                dst = CountLength("");
            }

            static void Write(BinaryWriter& writer, const CountLength& obj)
            {
                writer.RawWriter().WriteString(obj.word);
            }

            static void Read(BinaryReader& reader, CountLength& dst)
            {
                dst.word = reader.RawReader().ReadString();
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
    binding.RegisterComputeFunc<CountLength>();

    // Get compute instance.
    compute::Compute asyncCompute = ignite.GetCompute();

    std::istringstream iss("Count characters using callable");
    std::vector<std::string> words((std::istream_iterator<std::string>(iss)),
        std::istream_iterator<std::string>());

    std::vector<Future<int32_t>> futures;

    // Iterate through all words in the sentence, create and call jobs.
    for (std::string word : words)
    {
        // Counting number of characters remotely.
        futures.push_back(asyncCompute.CallAsync<int32_t>(CountLength(word)));
    }

    int32_t total = 0;

    // Counting total number of characters.
    for (Future<int32_t> future : futures)
    {
        // Waiting for results.
        future.Wait();

        total += future.GetValue();
    }

    // Printing result.
    std::cout << "Total number of characters: " << total << std::endl;
}
```
</Tab>
</Tabs>

### 1.4.任务执行超时
任务执行可以配置一个超时时间，如果任务未在指定时间段内完成，该任务会被停止，并且由该任务生成的作业也都会被取消。

要执行带有超时限制的任务，需要使用计算接口的`withTimeout(…​)`方法。该方法会返回一个计算接口，然后以给定的时限执行第一个任务，后续的任务并没有超时限制，需要为每一个需要超时限制的任务调用`withTimeout(…​)`方法。

```java
IgniteCompute compute = ignite.compute();

compute.withTimeout(300_000).run(() -> {
    // your computation
    // ...
});
```
### 1.5.本地节点内作业共享状态
通常来说在一个节点内的不同的计算作业之间共享状态是很有用的，为此Ignite在每个节点上提供了一个共享节点局部变量。

```java
IgniteCluster cluster = ignite.cluster();

ConcurrentMap<String, Integer> nodeLocalMap = cluster.nodeLocalMap();
```

节点局部变量类似于非分布式的线程局部变量，它只会保持在本地节点上。节点局部变量可以用于计算任务在不同的执行中共享状态，也可以用于部署的服务。

在下面的示例中，作业每次在某个节点上执行时，都会在本地节点上增加一个计数器。结果是每个节点上的本地节点计数器会显示该作业在该节点上执行了多少次。

```java
IgniteCallable<Long> job = new IgniteCallable<Long>() {
    @IgniteInstanceResource
    private Ignite ignite;

    @Override
    public Long call() {
        // Get a reference to node local.
        ConcurrentMap<String, AtomicLong> nodeLocalMap = ignite.cluster().nodeLocalMap();

        AtomicLong cntr = nodeLocalMap.get("counter");

        if (cntr == null) {
            AtomicLong old = nodeLocalMap.putIfAbsent("counter", cntr = new AtomicLong());

            if (old != null)
                cntr = old;
        }

        return cntr.incrementAndGet();
    }
};
```
### 1.6.从计算任务访问数据
如果计算任务需要访问Ignite中存储的数据，那么可以通过`Ignite`实例实现：

<Tabs>
<Tab title="Java">

```java
public class MyCallableTask implements IgniteCallable<Integer> {

    @IgniteInstanceResource
    private Ignite ignite;

    @Override
    public Integer call() throws Exception {

        IgniteCache<Long, Person> cache = ignite.cache("person");

        // Get the data you need
        Person person = cache.get(1L);

        // do with the data what you need to do

        return 1;
    }
}
```
</Tab>

<Tab title="C#/.NET">

```csharp
class FuncWithDataAccess : IComputeFunc<int>
{
    [InstanceResource] private IIgnite _ignite;

    public int Invoke()
    {
        var cache = _ignite.GetCache<int, string>("someCache");

        // get the data you need
        string cached = cache.Get(1);

        // do with data what you need to do, for example:
        Console.WriteLine(cached);

        return 1;
    }
}
```
</Tab>

<Tab title="C++">

```cpp
/*
 * Function class.
 */
class GetValue : public compute::ComputeFunc<void>
{
    friend struct ignite::binary::BinaryType<GetValue>;
public:
    /*
     * Default constructor.
     */
    GetValue()
    {
        // No-op.
    }

    /**
     * Callback.
     */
    virtual void Call()
    {
        Ignite& node = GetIgnite();

        // Get the data you need
        Cache<int64_t, Person> cache = node.GetCache<int64_t, Person>("person");

        // do with the data what you need to do
        Person person = cache.Get(1);
    }
};
```
</Tab>
</Tabs>

注意，上面的示例可能不是最有效的方法。原因是与键`1`相对应的`Person`对象可能不在当前任务执行的节点上。这时对象是通过网络获取的，通过将[计算与数据并置](#_8-计算和数据并置)可以避免这种情况。
::: warning 注意
如果要在`IgniteCallable`和`IgniteRunnable`任务中使用键和值对象，那么要确保相关的类定义部署在所有的节点上。
:::
## 2.集群组
`ClusterGroup`表示集群内节点的一个逻辑组。当希望把特定的操作限定在一个节点子集中时（而不是整个集群），可以在Ignite的许多API中使用该接口。例如希望仅在远程节点上部署服务，或者仅在具有特定属性的节点集上执行作业等。
::: tip 注意
注意`IgniteCluster`接口也是一个集群组，只不过包括集群内的所有节点。
:::
可以限制作业执行、服务部署、消息、事件以及其它任务只在部分集群组内执行，比如，下面的示例只把作业广播到远程节点（除了本地节点）：

<Tabs>
<Tab title="Java">

```java
Ignite ignite = Ignition.ignite();

IgniteCluster cluster = ignite.cluster();

// Get compute instance which will only execute
// over remote nodes, i.e. all the nodes except for this one.
IgniteCompute compute = ignite.compute(cluster.forRemotes());

// Broadcast to all remote nodes and print the ID of the node
// on which this closure is executing.
compute.broadcast(
        () -> System.out.println("Hello Node: " + ignite.cluster().localNode().id()));
```
</Tab>

<Tab title="C#/.NET">

```csharp
class PrintNodeIdAction : IComputeAction
{
    public void Invoke()
    {
        Console.WriteLine("Hello node: " +
                          Ignition.GetIgnite().GetCluster().GetLocalNode().Id);
    }
}

public static void RemotesBroadcastDemo()
{
    var ignite = Ignition.Start();

    var cluster = ignite.GetCluster();

    // Get compute instance which will only execute
    // over remote nodes, i.e. all the nodes except for this one.
    var compute = cluster.ForRemotes().GetCompute();

    // Broadcast to all remote nodes and print the ID of the node
    // on which this closure is executing.
    compute.Broadcast(new PrintNodeIdAction());
}
```
</Tab>
</Tabs>

为了方便，Ignite也有一些预定义的集群组：

<Tabs>
<Tab title="Java">

```java
IgniteCluster cluster = ignite.cluster();

// All nodes on which the cache with name "myCache" is deployed,
// either in client or server mode.
ClusterGroup cacheGroup = cluster.forCacheNodes("myCache");

// All data nodes responsible for caching data for "myCache".
ClusterGroup dataGroup = cluster.forDataNodes("myCache");

// All client nodes that can access "myCache".
ClusterGroup clientGroup = cluster.forClientNodes("myCache");
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cluster = ignite.GetCluster();

// All nodes on which cache with name "myCache" is deployed,
// either in client or server mode.
var cacheGroup = cluster.ForCacheNodes("myCache");

// All data nodes responsible for caching data for "myCache".
var dataGroup = cluster.ForDataNodes("myCache");

// All client nodes that access "myCache".
var clientGroup = cluster.ForClientNodes("myCache");
```
</Tab>
</Tabs>

## 3.ExecutorService
Ignite提供了一个`java.util.concurrent.ExecutorService`接口的分布式实现，该实现将任务提交到集群的服务端节点执行。任务在整个集群中负载平衡，只要集群中至少有一个节点，就可以保证任务得到执行。

`ExecutorService`可以通过`Ignite`实例获得：
```java
// Get cluster-enabled executor service.
ExecutorService exec = ignite.executorService();

// Iterate through all words in the sentence and create jobs.
for (final String word : "Print words using runnable".split(" ")) {
    // Execute runnable on some node.
    exec.submit(new IgniteRunnable() {
        @Override
        public void run() {
            System.out.println(">>> Printing '" + word + "' on this node from grid job.");
        }
    });
}
```
也可以限制作业在一个[集群组](#_2-集群组)中执行：
```java
// A group for nodes where the attribute 'worker' is defined.
ClusterGroup workerGrp = ignite.cluster().forAttribute("ROLE", "worker");

// Get an executor service for the cluster group.
ExecutorService exec = ignite.executorService(workerGrp);
```
## 4.MapReduce API
### 4.1.概述
Ignite提供了用于执行简化的MapReduce操作的API。MapReduce范式基于以下假设：要执行的任务可以被拆分为多个作业（映射阶段），并分别执行每个作业，然后每个作业的结果汇总到最终结果中（汇总阶段）。

Ignite中，作业是根据预配置的[负载平衡策略](#_5-负载平衡)在节点间分配的，结果会被汇总在提交任务的节点上。

MapReduce范式由`ComputeTask`接口提供。
::: tip 提示
`ComputeTask`仅在需要对作业到节点的映射或自定义故障转移逻辑进行细粒度控制时使用，对于其他情况，都建议使用简单的[闭包](#_1-分布式计算api)。
:::

### 4.2.ComputeTask接口
`ComputeTask`接口提供了一种实现自定义映射和汇总逻辑的方法，该接口有3个方法：`map(…​)`、`result()`和`reduce()`。

`map()`用于根据输入参数创建计算作业并将其映射到工作节点。该方法参数为要在其上运行任务的集群节点集合以及任务的输入参数。该方法会返回一个映射，其中作业为键，映射的工作节点为值，然后将作业发送到映射的节点并在其中执行。

`result()`会在完成每个作业后调用，并返回一个`ComputeJobResultPolicy`指示如何继续执行任务的实例。该方法参数为作业的结果以及到目前为止接收到的所有作业结果的列表，该方法可能返回以下值之一：

 - `WAIT`：等待所有剩余工作完成（如果有）；
 - `REDUCE`：立即进入汇总阶段，丢弃所有剩余的作业和尚未收到的结果；
 - `FAILOVER`：将作业故障转移到另一个节点（请参见[容错](#_6-容错)章节的介绍）。

当所有作业都已完成（或`result()`方法中某个作业返回`REDUCE`策略）时，在汇总阶段中会调用`reduce()`方法。该方法参数为具有所有完成结果的列表，并返回计算的最终结果。
### 4.3.执行计算任务
要执行计算任务，需调用`IgniteCompute.execute(…​)`方法，并将输入参数作为最后一个参数传入。

<Tabs>
<Tab title="Java">

```java
Ignite ignite = Ignition.start();

IgniteCompute compute = ignite.compute();

int count = compute.execute(new CharacterCountTask(), "Hello Grid Enabled World!");
```
</Tab>

<Tab title="C#/.NET">

```csharp
class CharCountComputeJob : IComputeJob<int>
{
    private readonly string _arg;

    public CharCountComputeJob(string arg)
    {
        Console.WriteLine(">>> Printing '" + arg + "' from compute job.");
        this._arg = arg;
    }

    public int Execute()
    {
        return _arg.Length;
    }

    public void Cancel()
    {
        throw new System.NotImplementedException();
    }
}


class CharCountTask : IComputeTask<string, int, int>
{
    public IDictionary<IComputeJob<int>, IClusterNode> Map(IList<IClusterNode> subgrid, string arg)
    {
        var map = new Dictionary<IComputeJob<int>, IClusterNode>();
        using (var enumerator = subgrid.GetEnumerator())
        {
            foreach (var s in arg.Split(" "))
            {
                if (!enumerator.MoveNext())
                {
                    enumerator.Reset();
                    enumerator.MoveNext();
                }

                map.Add(new CharCountComputeJob(s), enumerator.Current);
            }
        }

        return map;
    }

    public ComputeJobResultPolicy OnResult(IComputeJobResult<int> res, IList<IComputeJobResult<int>> rcvd)
    {
        // If there is no exception, wait for all job results.
        return res.Exception != null ? ComputeJobResultPolicy.Failover : ComputeJobResultPolicy.Wait;
    }

    public int Reduce(IList<IComputeJobResult<int>> results)
    {
        return results.Select(res => res.Data).Sum();
    }
}

public static void MapReduceComputeJobDemo()
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

    var compute = ignite.GetCompute();

    var res = compute.Execute(new CharCountTask(), "Hello Grid Please Count Chars In These Words");

    Console.WriteLine("res=" + res);
}
```
</Tab>
</Tabs>

通过使用[集群组](#_2-集群组)，可以将作业的执行限制在节点的子集上。
### 4.4.处理作业故障
如果节点在任务执行期间故障，则为该节点安排的所有作业都会自动发送到另一个可用节点（由于内置的故障转移机制）。但是，如果作业引发异常，则可以将作业视为失败，然后将其转移到另一个节点以重新执行，该行为可通过在`result(…​)`方法中返回`FAILOVER`实现：
```java
@Override
public ComputeJobResultPolicy result(ComputeJobResult res, List<ComputeJobResult> rcvd) {
    IgniteException err = res.getException();

    if (err != null)
        return ComputeJobResultPolicy.FAILOVER;

    // If there is no exception, wait for all job results.
    return ComputeJobResultPolicy.WAIT;
}
```
### 4.5.计算任务适配器
有几个辅助类，可以提供`result(…​)`和`map(…​)`的常用实现。

 - `ComputeTaskAdapter`：其定义了一个默认的`result(...)`方法实现，它在当一个作业抛出异常时返回一个`FAILOVER`策略，否则会返回一个`WAIT`策略，这样会等待所有的作业完成，并且有结果；
 - `ComputeTaskSplitAdapter`：其继承了`ComputeTaskAdapter`,然后实现了`map(...)`以将作业自动分配给节点。他引入了一个新的`split(...)`方法，可以实现根据输入的数据生成作业的逻辑。

### 4.6.分布式任务会话
::: tip 提示
该功能在.NET/C#/C++中不可用。
:::
对于每个任务，Ignite会创建一个分布式会话，该会话保存有关任务的信息，并且对任务本身及其派生的所有作业都可见。可以使用此会话在作业之间共享属性，属性可以在作业执行之前或期间分配，并且可以按照设置它们的顺序对其他作业可见。
```java
@ComputeTaskSessionFullSupport
private static class TaskSessionAttributesTask extends ComputeTaskSplitAdapter<Object, Object> {

    @Override
    protected Collection<? extends ComputeJob> split(int gridSize, Object arg) {
        Collection<ComputeJob> jobs = new LinkedList<>();

        // Generate jobs by number of nodes in the grid.
        for (int i = 0; i < gridSize; i++) {
            jobs.add(new ComputeJobAdapter(arg) {
                // Auto-injected task session.
                @TaskSessionResource
                private ComputeTaskSession ses;

                // Auto-injected job context.
                @JobContextResource
                private ComputeJobContext jobCtx;

                @Override
                public Object execute() {
                    // Perform STEP1.
                    // ...

                    // Tell other jobs that STEP1 is complete.
                    ses.setAttribute(jobCtx.getJobId(), "STEP1");

                    // Wait for other jobs to complete STEP1.
                    for (ComputeJobSibling sibling : ses.getJobSiblings())
                        try {
                            ses.waitForAttribute(sibling.getJobId(), "STEP1", 0);
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }

                    // Move on to STEP2.
                    // ...

                    return ...

                }
            });
        }
        return jobs;
    }

    @Override
    public Object reduce(List<ComputeJobResult> results) {
        // No-op.
        return null;
    }

}
```
### 4.7.计算任务示例
下面的示例演示了一个字符计数应用，他将一个给定的字符串拆分为单词，然后在单独的作业中计算每个单词的长度，作业会分发到所有的集群节点上。

<Tabs>
<Tab title="Java">

```java
public class ComputeTaskExample {
    public static class CharacterCountTask extends ComputeTaskSplitAdapter<String, Integer> {
        // 1. Splits the received string into words
        // 2. Creates a child job for each word
        // 3. Sends the jobs to other nodes for processing.
        @Override
        public List<ComputeJob> split(int gridSize, String arg) {
            String[] words = arg.split(" ");

            List<ComputeJob> jobs = new ArrayList<>(words.length);

            for (final String word : words) {
                jobs.add(new ComputeJobAdapter() {
                    @Override
                    public Object execute() {
                        System.out.println(">>> Printing '" + word + "' on from compute job.");

                        // Return the number of letters in the word.
                        return word.length();
                    }
                });
            }

            return jobs;
        }

        @Override
        public Integer reduce(List<ComputeJobResult> results) {
            int sum = 0;

            for (ComputeJobResult res : results)
                sum += res.<Integer>getData();

            return sum;
        }
    }

    public static void main(String[] args) {

        Ignite ignite = Ignition.start();

        IgniteCompute compute = ignite.compute();

        // Execute the task on the cluster and wait for its completion.
        int cnt = compute.execute(CharacterCountTask.class, "Hello Grid Enabled World!");

        System.out.println(">>> Total number of characters in the phrase is '" + cnt + "'.");
    }
}
```
</Tab>

<Tab title="C#/.NET">

```csharp
class CharCountComputeJob : IComputeJob<int>
{
    private readonly string _arg;

    public CharCountComputeJob(string arg)
    {
        Console.WriteLine(">>> Printing '" + arg + "' from compute job.");
        this._arg = arg;
    }

    public int Execute()
    {
        return _arg.Length;
    }

    public void Cancel()
    {
        throw new System.NotImplementedException();
    }
}

public class ComputeTaskExample
{
    private class CharacterCountTask : ComputeTaskSplitAdapter<string, int, int>
    {
        public override int Reduce(IList<IComputeJobResult<int>> results)
        {
            return results.Select(res => res.Data).Sum();
        }

        protected override ICollection<IComputeJob<int>> Split(int gridSize, string arg)
        {
            return arg.Split(" ")
                .Select(word => new CharCountComputeJob(word))
                .Cast<IComputeJob<int>>()
                .ToList();
        }
    }

    public static void RunComputeTaskExample()
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

        var cnt = ignite.GetCompute().Execute(new CharacterCountTask(), "Hello Grid Enabled World!");
        Console.WriteLine(">>> Total number of characters in the phrase is '" + cnt + "'.");
    }
}
```
</Tab>
</Tabs>

## 5.负载平衡
Ignite会对由[计算任务](#_4-mapreduce-api)产生的作业以及通过分布式计算API提交的单个任务自动负载平衡，通过`IgniteCompute.run(…​)`和其他计算方法提交的单个任务会被视为单个作业的任务。

Ignite默认使用轮询算法（`RoundRobinLoadBalancingSpi`），该算法在为计算任务指定的节点上按顺序分配作业。
::: tip 提示
负载平衡不适用于[并置计算](#_8-计算和数据并置)。
:::

负载平衡算法由`IgniteConfiguration.loadBalancingSpi`属性控制。

### 5.1.轮询式负载均衡
`RoundRobinLoadBalancingSpi`以轮询方式遍历并选择下一个可用的节点，可用节点是在执行任务[获取计算实例](#_1-1-获取计算接口实例)时定义的。

轮询式负载平衡支持两种操作模式：任务级和全局级。

如果配置成任务级模式，当任务开始执行时实现会随机地选择一个节点，然后会顺序地迭代拓扑中所有的节点，对于任务拆分的大小等同于节点的数量时，这个模式保证所有的节点都会参与任务的执行。
::: warning 警告
在任务级模式中需要启用以下事件类型：`EVT_TASK_FAILED`、`EVT_TASK_FINISHED`、`EVT_JOB_MAPPED`。
:::
如果配置成全局级模式，对于所有的任务都会维护一个节点的单一连续队列然后每次都会从队列中选择一个节点。这个模式中（不像每任务模式），当多个任务并发执行时，即使任务的拆分大小等同于节点的数量，同一个任务的某些作业仍然可能被赋予同一个节点。

默认使用全局级模式。

<Tabs>
<Tab title="XML">

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!--
  Licensed to the Apache Software Foundation (ASF) under one or more
  contributor license agreements.  See the NOTICE file distributed with
  this work for additional information regarding copyright ownership.
  The ASF licenses this file to You under the Apache License, Version 2.0
  (the "License"); you may not use this file except in compliance with
  the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:util="http://www.springframework.org/schema/util"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="         http://www.springframework.org/schema/beans
         http://www.springframework.org/schema/beans/spring-beans.xsd
         http://www.springframework.org/schema/util
         http://www.springframework.org/schema/util/spring-util.xsd">
    <bean class="org.apache.ignite.configuration.IgniteConfiguration">
        <property name="includeEventTypes">
            <list>
                <!--these events are required for the per-task mode-->
                <util:constant static-field="org.apache.ignite.events.EventType.EVT_TASK_FINISHED"/>
                <util:constant static-field="org.apache.ignite.events.EventType.EVT_TASK_FAILED"/>
                <util:constant static-field="org.apache.ignite.events.EventType.EVT_JOB_MAPPED"/>
            </list>
        </property>

        <property name="loadBalancingSpi">
            <bean class="org.apache.ignite.spi.loadbalancing.roundrobin.RoundRobinLoadBalancingSpi">
                <!-- Activate the per-task round-robin mode. -->
                <property name="perTask" value="true"/>
            </bean>
        </property>

    </bean>
</beans>
```
</Tab>

<Tab title="Java">

```java
RoundRobinLoadBalancingSpi spi = new RoundRobinLoadBalancingSpi();
spi.setPerTask(true);

IgniteConfiguration cfg = new IgniteConfiguration();
// these events are required for the per-task mode
cfg.setIncludeEventTypes(EventType.EVT_TASK_FINISHED, EventType.EVT_TASK_FAILED, EventType.EVT_JOB_MAPPED);

// Override default load balancing SPI.
cfg.setLoadBalancingSpi(spi);

// Start a node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>
</Tabs>

### 5.2.随机和加权式负载平衡
`WeightedRandomLoadBalancingSpi`会为作业的执行从可用节点列表中随机选择一个节点，也可以选择为节点赋予权值，这样有更高权重的节点最终会使将作业分配给它的机会更多，所有节点的权重默认值都是10。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="loadBalancingSpi">
        <bean class="org.apache.ignite.spi.loadbalancing.weightedrandom.WeightedRandomLoadBalancingSpi">
            <property name="useWeights" value="true"/>
            <property name="nodeWeight" value="10"/>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
WeightedRandomLoadBalancingSpi spi = new WeightedRandomLoadBalancingSpi();

// Configure SPI to use the weighted random load balancing algorithm.
spi.setUseWeights(true);

// Set weight for the local node.
spi.setNodeWeight(10);

IgniteConfiguration cfg = new IgniteConfiguration();

// Override default load balancing SPI.
cfg.setLoadBalancingSpi(spi);

// Start a node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>
</Tabs>

### 5.3.作业窃取
通常集群由很多计算机组成，这就可能存在配置不均衡的情况，这时开启`JobStealingCollisionSpi`就会有助于避免作业聚集在过载的节点，因为它们将被未充分利用的节点窃取。

`JobStealingCollisionSpi`可以将作业从高负载节点移动到低负载节点，当部分作业完成得很快，而其它的作业还在高负载节点中排队时，这个SPI就会非常有用，这时等待作业就会被移动到更快/低负载的节点。

`JobStealingCollisionSpi`采用的是后负载技术，它可以在任务已经被调度在节点A执行后重新分配到节点B。

::: warning 警告
如果要启用作业窃取，则必须将故障转移SPI配置为`JobStealingFailoverSpi`。具体请参见[容错](#_6-容错)。
:::

下面是配置`JobStealingCollisionSpi`的示例：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <!-- Enabling the required Failover SPI. -->
    <property name="failoverSpi">
        <bean class="org.apache.ignite.spi.failover.jobstealing.JobStealingFailoverSpi"/>
    </property>
    <!-- Enabling the JobStealingCollisionSpi for late load balancing. -->
    <property name="collisionSpi">
        <bean class="org.apache.ignite.spi.collision.jobstealing.JobStealingCollisionSpi">
            <property name="activeJobsThreshold" value="50"/>
            <property name="waitJobsThreshold" value="0"/>
            <property name="messageExpireTime" value="1000"/>
            <property name="maximumStealingAttempts" value="10"/>
            <property name="stealingEnabled" value="true"/>
            <property name="stealingAttributes">
                <map>
                    <entry key="node.segment" value="foobar"/>
                </map>
            </property>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
JobStealingCollisionSpi spi = new JobStealingCollisionSpi();

// Configure number of waiting jobs
// in the queue for job stealing.
spi.setWaitJobsThreshold(10);

// Configure message expire time (in milliseconds).
spi.setMessageExpireTime(1000);

// Configure stealing attempts number.
spi.setMaximumStealingAttempts(10);

// Configure number of active jobs that are allowed to execute
// in parallel. This number should usually be equal to the number
// of threads in the pool (default is 100).
spi.setActiveJobsThreshold(50);

// Enable stealing.
spi.setStealingEnabled(true);

// Set stealing attribute to steal from/to nodes that have it.
spi.setStealingAttributes(Collections.singletonMap("node.segment", "foobar"));

// Enable `JobStealingFailoverSpi`
JobStealingFailoverSpi failoverSpi = new JobStealingFailoverSpi();

IgniteConfiguration cfg = new IgniteConfiguration();

// Override default Collision SPI.
cfg.setCollisionSpi(spi);

cfg.setFailoverSpi(failoverSpi);
```
</Tab>
</Tabs>

## 6.容错
Ignite支持作业的自动故障转移，当一个节点崩溃时，作业会被转移到其它可用节点再次执行。集群中只要有一个节点在线，作业就不会丢失。

全局故障转移策略由`IgniteConfiguration.failoverSpi`属性控制。

可用的实现包括：

 - `AlwaysFailoverSpi`：该实现会将一个故障的作业路由到另一个节点，这也是默认的模式。当来自一个计算任务的作业失败后，首先会尝试将故障的作业路由到该任务还没有被执行过的节点上，如果没有可用的节点，然后会试图将故障的作业路由到可能运行同一个任务中其它的作业的节点上，如果上述的尝试都失败了，那么该作业就不会被故障转移。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

    <property name="failoverSpi">
        <bean class="org.apache.ignite.spi.failover.always.AlwaysFailoverSpi">
            <property name="maximumFailoverAttempts" value="5"/>
        </bean>
    </property>

</bean>
```
</Tab>

<Tab title="Java">

```java
AlwaysFailoverSpi failSpi = new AlwaysFailoverSpi();

// Override maximum failover attempts.
failSpi.setMaximumFailoverAttempts(5);

// Override the default failover SPI.
IgniteConfiguration cfg = new IgniteConfiguration().setFailoverSpi(failSpi);

// Start a node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>
</Tabs>

 - `NeverFailoverSpi`：该实现不对失败的作业故障转移；

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

    <property name="failoverSpi">
        <bean class="org.apache.ignite.spi.failover.never.NeverFailoverSpi"/>
    </property>

</bean>
```
</Tab>

<Tab title="Java">

```java
NeverFailoverSpi failSpi = new NeverFailoverSpi();

IgniteConfiguration cfg = new IgniteConfiguration();

// Override the default failover SPI.
cfg.setFailoverSpi(failSpi);

// Start a node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>
</Tabs>

 - `JobStealingFailoverSpi`：只有在希望启用[作业窃取](#_5-3-作业窃取)时，才需要使用这个实现。

## 7.作业调度
当作业到达目标节点时，会被提交到一个线程池并以随机顺序调度执行，但是通过配置`CollisionSpi`可以更改作业顺序。`CollisionSpi`接口提供了一种在每个节点调度作业执行的方法。

Ignite提供了`CollisionSpi`接口的几种实现：

 - `FifoQueueCollisionSpi`：在多个线程中进行简单的FIFO排序，这时默认的实现；
 - `PriorityQueueCollisionSpi`：按优先级排序；
 - `JobStealingFailoverSpi`：该实现用于开启[作业窃取](#_5-3-作业窃取)。

`CollisionSpi`通过`IgniteConfiguration.collisionSpi`属性来配置。
### 7.1.FIFO排序
`FifoQueueCollisionSpi`提供了作业到达时的FIFO排序，作业以多线程模式执行。线程数由`parallelJobsNumber`参数控制，默认值为CPU核数的2倍。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

    <property name="collisionSpi">
        <bean class="org.apache.ignite.spi.collision.fifoqueue.FifoQueueCollisionSpi">
            <!-- Execute one job at a time. -->
            <property name="parallelJobsNumber" value="1"/>
        </bean>
    </property>

</bean>
```
</Tab>

<Tab title="Java">

```java
FifoQueueCollisionSpi colSpi = new FifoQueueCollisionSpi();

// Execute jobs sequentially, one at a time,
// by setting parallel job number to 1.
colSpi.setParallelJobsNumber(1);

IgniteConfiguration cfg = new IgniteConfiguration();

// Override default collision SPI.
cfg.setCollisionSpi(colSpi);

// Start a node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>
</Tabs>

### 7.2.优先级排序
使用`PriorityQueueCollisionSpi`可以为单独的作业分配优先级，因此高优先级的作业会比低优先级的作业先执行，也可以指定要处理作业的线程数。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

    <property name="collisionSpi">
        <bean class="org.apache.ignite.spi.collision.priorityqueue.PriorityQueueCollisionSpi">
            <!-- Change the parallel job number if needed.
                 Default is number of cores times 2. -->
            <property name="parallelJobsNumber" value="5"/>
        </bean>
    </property>

</bean>
```
</Tab>

<Tab title="Java">

```java
PriorityQueueCollisionSpi colSpi = new PriorityQueueCollisionSpi();

// Change the parallel job number if needed.
// Default is number of cores times 2.
colSpi.setParallelJobsNumber(5);

IgniteConfiguration cfg = new IgniteConfiguration();

// Override default collision SPI.
cfg.setCollisionSpi(colSpi);

// Start a node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>
</Tabs>

任务优先级是在任务会话中通过`grid.task.priority`属性配置的，如果任务未分配优先级，那么会使用默认优先级0。

```java
public class MyUrgentTask extends ComputeTaskSplitAdapter<Object, Object> {
    // Auto-injected task session.
    @TaskSessionResource
    private ComputeTaskSession taskSes = null;

    @Override
    protected Collection<ComputeJob> split(int gridSize, Object arg) {
        // Set high task priority.
        taskSes.setAttribute("grid.task.priority", 10);

        List<ComputeJob> jobs = new ArrayList<>(gridSize);

        for (int i = 1; i <= gridSize; i++) {
            jobs.add(new ComputeJobAdapter() {

                @Override
                public Object execute() throws IgniteException {

                    //your implementation goes here

                    return null;
                }
            });
        }

        // These jobs will be executed with higher priority.
        return jobs;
    }

    @Override
    public Object reduce(List<ComputeJobResult> results) throws IgniteException {
        return null;
    }
}
```
## 8.计算和数据并置
并置计算是一种分布式数据处理模式，其会将在特定数据集上执行的计算任务发送到待处理数据所在的节点，并且仅将计算结果返回。这样可以最大程度减少节点之间的数据传输，并可以显著缩短任务执行时间。

Ignite提供了几种执行并置计算的方法，所有这些方法都使用关联函数来确定数据的位置。

计算接口提供了`affinityCall(…​)`和`affinityRun(…​)`方法，可以通过键或分区将任务和数据并置在一起。
::: warning 提示
`affinityCall(…​)`和`affinityRun(…​)`方法保证在任务执行期间，给定的键或分区中的数据在目标节点上是存在的。
:::

::: warning 提示
待执行任务的类定义必须在远程节点上可用，可以通过两种方式确保这一点：

 - 将类添加到节点的类路径；
 - 启用[对等类加载](/doc/java/CodeDeployment.md#_2-对等类加载)。

:::

### 8.1.通过键并置
要将计算任务发送到给定键所在的节点，可以使用以下方法：

 - `IgniteCompute.affinityCall(String cacheName, Object key, IgniteCallable<R> job)`；
 - `IgniteCompute.affinityRun(String cacheName, Object key, IgniteRunnable job)`；

Ignite会调用配置好的关联函数来确定给定键的位置。

<Tabs>
<Tab title="Java">

```java
IgniteCache<Integer, String> cache = ignite.cache("myCache");

IgniteCompute compute = ignite.compute();

int key = 1;

// This closure will execute on the remote node where
// data for the given 'key' is located.
compute.affinityRun("myCache", key, () -> {
    // Peek is a local memory lookup.
    System.out.println("Co-located [key= " + key + ", value= " + cache.localPeek(key) + ']');
});
```
</Tab>

<Tab title="C#/.NET">

```csharp
class MyComputeAction : IComputeAction
{
    [InstanceResource] private readonly IIgnite _ignite;

    public int Key { get; set; }

    public void Invoke()
    {
        var cache = _ignite.GetCache<int, string>("myCache");
        // Peek is a local memory lookup
        Console.WriteLine("Co-located [key= " + Key + ", value= " + cache.LocalPeek(Key) + ']');
    }
}

public static void AffinityRunDemo()
{
    var cfg = new IgniteConfiguration();
    var ignite = Ignition.Start(cfg);

    var cache = ignite.GetOrCreateCache<int, string>("myCache");
    cache.Put(0, "foo");
    cache.Put(1, "bar");
    cache.Put(2, "baz");
    var keyCnt = 3;

    var compute = ignite.GetCompute();

    for (var key = 0; key < keyCnt; key++)
    {
        // This closure will execute on the remote node where
        // data for the given 'key' is located.
        compute.AffinityRun("myCache", key, new MyComputeAction {Key = key});
    }
}
```
</Tab>

<Tab title="C++">

```cpp
/*
 * Function class.
 */
struct FuncAffinityRun : compute::ComputeFunc<void>
{
    /*
    * Default constructor.
    */
    FuncAffinityRun()
    {
        // No-op.
    }

    /*
    * Parameterized constructor.
    */
    FuncAffinityRun(std::string cacheName, int32_t key) :
        cacheName(cacheName), key(key)
    {
        // No-op.
    }

    /**
     * Callback.
     */
    virtual void Call()
    {
        Ignite& node = GetIgnite();

        Cache<int32_t, std::string> cache = node.GetCache<int32_t, std::string>(cacheName.c_str());

        // Peek is a local memory lookup.
        std::cout << "Co-located [key= " << key << ", value= " << cache.LocalPeek(key, CachePeekMode::ALL) << "]" << std::endl;
    }

    std::string cacheName;
    int32_t key;
};

/**
 * Binary type structure. Defines a set of functions required for type to be serialized and deserialized.
 */
namespace ignite
{
    namespace binary
    {
        template<>
        struct BinaryType<FuncAffinityRun>
        {
            static int32_t GetTypeId()
            {
                return GetBinaryStringHashCode("FuncAffinityRun");
            }

            static void GetTypeName(std::string& dst)
            {
                dst = "FuncAffinityRun";
            }

            static int32_t GetFieldId(const char* name)
            {
                return GetBinaryStringHashCode(name);
            }

            static int32_t GetHashCode(const FuncAffinityRun& obj)
            {
                return 0;
            }

            static bool IsNull(const FuncAffinityRun& obj)
            {
                return false;
            }

            static void GetNull(FuncAffinityRun& dst)
            {
                dst = FuncAffinityRun();
            }

            static void Write(BinaryWriter& writer, const FuncAffinityRun& obj)
            {
                writer.WriteString("cacheName", obj.cacheName);
                writer.WriteInt32("key", obj.key);
            }

            static void Read(BinaryReader& reader, FuncAffinityRun& dst)
            {
                dst.cacheName = reader.ReadString("cacheName");
                dst.key = reader.ReadInt32("key");
            }
        };
    }
}


int main()
{
    IgniteConfiguration cfg;
    cfg.springCfgPath = "/path/to/configuration.xml";

    Ignite ignite = Ignition::Start(cfg);

    // Get cache instance.
    Cache<int32_t, std::string> cache = ignite.GetOrCreateCache<int32_t, std::string>("myCache");

    // Get binding instance.
    IgniteBinding binding = ignite.GetBinding();

    // Registering our class as a compute function.
    binding.RegisterComputeFunc<FuncAffinityRun>();

    // Get compute instance.
    compute::Compute compute = ignite.GetCompute();

    int key = 1;

    // This closure will execute on the remote node where
    // data for the given 'key' is located.
    compute.AffinityRun(cache.GetName(), key, FuncAffinityRun(cache.GetName(), key));
}
```
</Tab>
</Tabs>

### 8.2.通过分区并置
`affinityCall(Collection<String> cacheNames, int partId, IgniteRunnable job)`和`affinityRun(Collection<String> cacheNames, int partId, IgniteRunnable job)`会将任务发送到给定ID的分区所在的节点。当需要检索多个键的对象并且知道这些键属于同一分区时，这很有用。这时可以为每个键创建一个任务，而不是多个任务。

例如，假设要计算特定键子集的特定字段的算术平均值。如果要分发计算，则可以按分区对键进行分组，并将每组键发送到分区所在的节点以获取值。组的数量（即任务的数量）不会超过分区的总数（默认为1024）。下面是说明此示例的代码段：

```java
// this task sums up the values of the salary field for the given set of keys
private static class SumTask implements IgniteCallable<BigDecimal> {
    private Set<Long> keys;

    public SumTask(Set<Long> keys) {
        this.keys = keys;
    }

    @IgniteInstanceResource
    private Ignite ignite;

    @Override
    public BigDecimal call() throws Exception {

        IgniteCache<Long, BinaryObject> cache = ignite.cache("person").withKeepBinary();

        BigDecimal sum = new BigDecimal(0);

        for (long k : keys) {
            BinaryObject person = cache.localPeek(k, CachePeekMode.PRIMARY);
            if (person != null)
                sum = sum.add(new BigDecimal((float) person.field("salary")));
        }

        return sum;
    }
}

public static void calculateAverage(Ignite ignite, Set<Long> keys) {

    // get the affinity function configured for the cache
    Affinity<Long> affinityFunc = ignite.affinity("person");

    // this map stores collections of keys for each partition
    HashMap<Integer, Set<Long>> partMap = new HashMap<>();
    keys.forEach(k -> {
        int partId = affinityFunc.partition(k);

        Set<Long> keysByPartition = partMap.computeIfAbsent(partId, key -> new HashSet<Long>());
        keysByPartition.add(k);
    });

    BigDecimal total = new BigDecimal(0);

    IgniteCompute compute = ignite.compute();

    List<String> caches = Arrays.asList("person");

    // iterate over all partitions
    for (Map.Entry<Integer, Set<Long>> pair : partMap.entrySet()) {
        // send a task that gets specific keys for the partition
        BigDecimal sum = compute.affinityCall(caches, pair.getKey().intValue(), new SumTask(pair.getValue()));
        total = total.add(sum);
    }

    System.out.println("the average salary is " + total.floatValue() / keys.size());
}
```

如果要处理缓存中的所有数据，可以迭代缓存中的所有分区，并发送处理每个单独分区上存储的数据的任务。

```java
// this task sums up the value of the 'salary' field for all objects stored in
// the given partition
public static class SumByPartitionTask implements IgniteCallable<BigDecimal> {
    private int partId;

    public SumByPartitionTask(int partId) {
        this.partId = partId;
    }

    @IgniteInstanceResource
    private Ignite ignite;

    @Override
    public BigDecimal call() throws Exception {
        // use binary objects to avoid deserialization
        IgniteCache<Long, BinaryObject> cache = ignite.cache("person").withKeepBinary();

        BigDecimal total = new BigDecimal(0);
        try (QueryCursor<Cache.Entry<Long, BinaryObject>> cursor = cache
                .query(new ScanQuery<Long, BinaryObject>(partId).setLocal(true))) {
            for (Cache.Entry<Long, BinaryObject> entry : cursor) {
                total = total.add(new BigDecimal((float) entry.getValue().field("salary")));
            }
        }

        return total;
    }
}
```

::: warning 性能考量
当要处理的数据量足够大时，并置计算有性能优势。在某些情况下，当数据量较小时，[扫描查询](/doc/java/UsingKeyValueApi.md#_3-使用扫描查询)可能会执行得更好。
:::

### 8.3.EntryProcessor
`EntryProcessor`用于在存储缓存条目的节点上处理该缓存条目并返回处理结果。对于`EntryProcessor`，不必传输整个对象来执行操作，可以远程执行操作，并且只传输结果。

如果`EntryProcessor`为不存在的条目设置值，则该条目将添加到缓存中。

对于给定的键，`EntryProcessor`在一个锁内以原子方式执行。

<Tabs>
<Tab title="Java">

```java
IgniteCache<String, Integer> cache = ignite.cache("mycache");

// Increment the value for a specific key by 1.
// The operation will be performed on the node where the key is stored.
// Note that if the cache does not contain an entry for the given key, it will
// be created.
cache.invoke("mykey", (entry, args) -> {
    Integer val = entry.getValue();

    entry.setValue(val == null ? 1 : val + 1);

    return null;
});
```
</Tab>

<Tab title="C#/.NET">

```csharp
void CacheInvoke()
{
    var ignite = Ignition.Start();

    var cache = ignite.GetOrCreateCache<int, int>("myCache");

    var proc = new Processor();

    // Increment cache value 10 times
    for (int i = 0; i < 10; i++)
        cache.Invoke(1, proc, 5);
}

class Processor : ICacheEntryProcessor<int, int, int, int>
{
    public int Process(IMutableCacheEntry<int, int> entry, int arg)
    {
        entry.Value = entry.Exists ? arg : entry.Value + arg;

        return entry.Value;
    }
}
```
</Tab>

<Tab title="C++">

```cpp
/**
 * Processor for invoke method.
 */
class IncrementProcessor : public cache::CacheEntryProcessor<std::string, int32_t, int32_t, int32_t>
{
public:
    /**
     * Constructor.
     */
    IncrementProcessor()
    {
        // No-op.
    }

    /**
     * Copy constructor.
     *
     * @param other Other instance.
     */
    IncrementProcessor(const IncrementProcessor& other)
    {
        // No-op.
    }

    /**
     * Assignment operator.
     *
     * @param other Other instance.
     * @return This instance.
     */
    IncrementProcessor& operator=(const IncrementProcessor& other)
    {
        return *this;
    }

    /**
     * Call instance.
     */
    virtual int32_t Process(MutableCacheEntry<std::string, int32_t>& entry, const int& arg)
    {
        // Increment the value for a specific key by 1.
        // The operation will be performed on the node where the key is stored.
        // Note that if the cache does not contain an entry for the given key, it will
        // be created.
        if (!entry.IsExists())
            entry.SetValue(1);
        else
            entry.SetValue(entry.GetValue() + 1);

        return entry.GetValue();
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
        struct BinaryType<IncrementProcessor>
        {
            static int32_t GetTypeId()
            {
                return GetBinaryStringHashCode("IncrementProcessor");
            }

            static void GetTypeName(std::string& dst)
            {
                dst = "IncrementProcessor";
            }

            static int32_t GetFieldId(const char* name)
            {
                return GetBinaryStringHashCode(name);
            }

            static int32_t GetHashCode(const IncrementProcessor& obj)
            {
                return 0;
            }

            static bool IsNull(const IncrementProcessor& obj)
            {
                return false;
            }

            static void GetNull(IncrementProcessor& dst)
            {
                dst = IncrementProcessor();
            }

            static void Write(BinaryWriter& writer, const IncrementProcessor& obj)
            {
                // No-op.
            }

            static void Read(BinaryReader& reader, IncrementProcessor& dst)
            {
                // No-op.
            }
        };
    }
}

int main()
{
    IgniteConfiguration cfg;
    cfg.springCfgPath = "platforms/cpp/examples/put-get-example/config/example-cache.xml";

    Ignite ignite = Ignition::Start(cfg);

    // Get cache instance.
    Cache<std::string, int32_t> cache = ignite.GetOrCreateCache<std::string, int32_t>("myCache");

    // Get binding instance.
    IgniteBinding binding = ignite.GetBinding();

    // Registering our class as a cache entry processor.
    binding.RegisterCacheEntryProcessor<IncrementProcessor>();

    std::string key("mykey");
    IncrementProcessor inc;

    cache.Invoke<int32_t>(key, inc, NULL);
}
```
</Tab>
</Tabs>

<RightPane/>

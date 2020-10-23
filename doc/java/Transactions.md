# Ignite事务
## 1.概述
要为特定的缓存开启事务支持，需要在缓存配置中将`atomicityMode`设置为`TRANSACTIONAL`，具体请参见[原子化模式](/doc/java/ConfiguringCaches.md#_4-原子化模式)。

事务可以将多个缓存操作，可能对应一个或者多个键，组合为一个单个原子事务，这些操作在没有任何其他交叉操作的情况下执行，或全部成功或全部失败，没有部分成功的状态。

在缓存配置中可以为缓存开启事务支持：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

    <property name="transactionConfiguration">
        <bean class="org.apache.ignite.configuration.TransactionConfiguration">
            <!--Set the timeout to 20 seconds-->
            <property name="TxTimeoutOnPartitionMapExchange" value="20000"/>
        </bean>
    </property>

</bean>
```
</Tab>

<Tab title="Java">

```java
CacheConfiguration cacheCfg = new CacheConfiguration();

cacheCfg.setName("cacheName");

cacheCfg.setAtomicityMode(CacheAtomicityMode.TRANSACTIONAL);

IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setCacheConfiguration(cacheCfg);

// Optional transaction configuration. Configure TM lookup here.
TransactionConfiguration txCfg = new TransactionConfiguration();

cfg.setTransactionConfiguration(txCfg);

// Start a node
Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    CacheConfiguration = new[]
    {
        new CacheConfiguration("txCache")
        {
            AtomicityMode = CacheAtomicityMode.Transactional
        }
    },
    TransactionConfiguration = new TransactionConfiguration
    {
        DefaultTransactionConcurrency = TransactionConcurrency.Optimistic
    }
};
```
</Tab>
</Tabs>

## 2.执行事务
键-值API为开启和完成事务以及获取和事务有关的指标，提供了一个接口，该接口可以通过`Ignite`实例获得：

<Tabs>
<Tab title="Java">

```java
Ignite ignite = Ignition.ignite();

IgniteTransactions transactions = ignite.transactions();

try (Transaction tx = transactions.txStart()) {
    Integer hello = cache.get("Hello");

    if (hello == 1)
        cache.put("Hello", 11);

    cache.put("World", 22);

    tx.commit();
}
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
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
    },
    CacheConfiguration = new[]
    {
        new CacheConfiguration
        {
            Name = "cacheName",
            AtomicityMode = CacheAtomicityMode.Transactional
        }
    },
    TransactionConfiguration = new TransactionConfiguration
    {
        DefaultTimeoutOnPartitionMapExchange = TimeSpan.FromSeconds(20)
    }
};

var ignite = Ignition.Start(cfg);
var cache = ignite.GetCache<string, int>("cacheName");
cache.Put("Hello", 1);
var transactions = ignite.GetTransactions();

using (var tx = transactions.TxStart())
{
    int hello = cache.Get("Hello");

    if (hello == 1)
    {
        cache.Put("Hello", 11);
    }

    cache.Put("World", 22);

    tx.Commit();
}
```
</Tab>

<Tab title="C++">

```cpp
Transactions transactions = ignite.GetTransactions();

Transaction tx = transactions.TxStart();
int hello = cache.Get("Hello");

if (hello == 1)
    cache.Put("Hello", 11);

cache.Put("World", 22);

tx.Commit();
```
</Tab>
</Tabs>

## 3.并发模型和隔离级别
当原子化模式配置为`TRANSACTIONAL`时，Ignite对事务支持`乐观`和`悲观`的**并发模型**。并发模型决定了何时获得一个条目级的事务锁-在访问数据时或者在`prepare`阶段。锁定可以防止对一个对象的并发访问。比如，当试图用悲观锁更新一个ToDo列表项时，服务端会在该对象上置一个锁，在提交或者回滚该事务之前，其它的事务或者操作都无法更新该条目。不管在一个事务中使用那种并发模型，在提交之前都存在事务中的所有条目被锁定的时刻。

**隔离级别**定义了并发事务如何"看"以及处理针对同一个键的操作。Ignite支持`READ_COMMITTED`、`REPEATABLE_READ`、`SERIALIZABLE`隔离级别。

并发模型和隔离级别的所有组合都是可以同时使用的。下面是针对Ignite提供的每一个并发-隔离组合的行为和保证的描述。
### 3.1.悲观事务
在`PESSIMISTIC`事务中，锁是在第一次读或者写访问期间获得（取决于隔离级别）然后被事务持有直到其被提交或者回滚。该模式中，锁首先在主节点获得然后在准备阶段提升至备份节点。下面的隔离级别可以配置为`PESSIMISTIC`并发模型。

 - `READ_COMMITTED`：数据被无锁地读取并且不会被事务本身缓存。如果缓存配置允许，数据是可能从一个备份节点中读取的。在这个隔离级别中，可以有所谓的非可重复读，因为当在自己的事务中读取数据两次时，一个并发事务可以改变该数据。锁只有在第一次写访问时才会获得（包括`EntryProcessor`调用）。这意味着事务中已经读取的一个条目在该事务提交时可能有一个不同的值，这种情况是不会抛出异常的。
 - `REPEATABLE_READ`：获得条目锁以及第一次读或者写访问时从主节点获得数据，然后就存储在本地事务映射中。之后对同一数据的所有连续访问都是本地化的，并且返回最后一次读或者被更新的事务值。这意味着没有其它的并发事务可以改变锁定的数据，这样就获得了事务的可重复读。
 - `SERIALIZABLE`：在`PESSIMISTIC`模式中，这个隔离级别与`REPEATABLE_READ`是一样的工作方式。

注意，在`PESSIMISTIC`模式中，锁的顺序是很重要的。此外Ignite可以按照指定的顺序依次并且准确地获得锁。

::: danger 拓扑变化约束
注意，如果至少获取了一个`PESSIMISTIC`事务锁，则在提交或回滚事务之前，将无法更改缓存拓扑。因此应该避免长时间持有事务锁。
:::

### 3.2.乐观事务
在`OPTIMISTIC`事务中，条目锁是在二阶段提交的`准备`阶段从主节点获得的，然后提升至备份节点，该锁在事务提交时被释放。如果回滚事务没有试图做提交，是不会获得锁的。下面的隔离级别可以与`OPTIMISTIC`并发模型配置在一起。

 - `READ_COMMITTED`：应该作用于缓存的改变是在源节点上收集的，然后事务提交后生效。事务数据无锁地读取并且不会在事务中缓存。如果缓存配置允许，该数据是可能从备份节点中读取的。在这个隔离级别中，可以有一个所谓的非可重复读，因为在自己的事务中读取数据两次时另一个事务可以修改数据。这个模式组合在第一次读或者写操作后如果条目值被修改是不会做校验的，并且不会抛出异常。
 - `REPEATABLE_READ`：这个隔离级别的事务的工作方式类似于`OPTIMISTIC`的`READ_COMMITTED`的事务，只有一个不同：读取值缓存于发起节点并且所有的后续读保证都是本地化的。这个模式组合在第一次读或者写操作后如果条目值被修改是不会做校验的，并且不会抛出异常。
 - `SERIALIZABLE`：在第一次读访问之后会存储一个条目的版本，如果Ignite引擎检测到发起事务中的条目只要有一个被修改，Ignite就会在提交阶段放弃该事务，这是在提交阶段对集群内的事务中记载的条目的版本进行内部检查实现的。简而言之，这意味着Ignite如果在一个事务的提交阶段检测到一个冲突，就会放弃这个事务并且抛出`TransactionOptimisticException`异常以及回滚已经做出的任何改变，开发者应该处理这个异常并且重试该事务。

<Tabs>
<Tab title="Java">

```java
CacheConfiguration<Integer, String> cfg = new CacheConfiguration<>();
cfg.setAtomicityMode(CacheAtomicityMode.TRANSACTIONAL);
cfg.setName("myCache");
IgniteCache<Integer, String> cache = ignite.getOrCreateCache(cfg);

// Re-try the transaction a limited number of times.
int retryCount = 10;
int retries = 0;

// Start a transaction in the optimistic mode with the serializable isolation
// level.
while (retries < retryCount) {
    retries++;
    try (Transaction tx = ignite.transactions().txStart(TransactionConcurrency.OPTIMISTIC,
            TransactionIsolation.SERIALIZABLE)) {
        // modify cache entries as part of this transaction.
        cache.put(1, "foo");
        cache.put(2, "bar");
        // commit the transaction
        tx.commit();

        // the transaction succeeded. Leave the while loop.
        break;
    } catch (TransactionOptimisticException e) {
        // Transaction has failed. Retry.
    }
}
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
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
    },
    CacheConfiguration = new[]
    {
        new CacheConfiguration
        {
            Name = "cacheName",
            AtomicityMode = CacheAtomicityMode.Transactional
        }
    },
    TransactionConfiguration = new TransactionConfiguration
    {
        DefaultTimeoutOnPartitionMapExchange = TimeSpan.FromSeconds(20)
    }
};

var ignite = Ignition.Start(cfg);
// Re-try the transaction a limited number of times
var retryCount = 10;
var retries = 0;

// Start a transaction in the optimistic mode with the serializable isolation level
while (retries < retryCount)
{
    retries++;
    try
    {
        using (var tx = ignite.GetTransactions().TxStart(TransactionConcurrency.Optimistic,
            TransactionIsolation.Serializable))
        {
            // modify cache entries as part of this transaction.

            // commit the transaction
            tx.Commit();

            // the transaction succeeded. Leave the while loop.
            break;
        }
    }
    catch (TransactionOptimisticException)
    {
        // Transaction has failed. Retry.
    }

}
```
</Tab>

<Tab title="C++">

```cpp
// Re-try the transaction a limited number of times.
int const retryCount = 10;
int retries = 0;

// Start a transaction in the optimistic mode with the serializable isolation level.
while (retries < retryCount)
{
    retries++;

    try
    {
        Transaction tx = ignite.GetTransactions().TxStart(
                TransactionConcurrency::OPTIMISTIC, TransactionIsolation::SERIALIZABLE);

        // commit the transaction
        tx.Commit();

        // the transaction succeeded. Leave the while loop.
        break;
    }
    catch (IgniteError e)
    {
        // Transaction has failed. Retry.
    }
}
```
</Tab>
</Tabs>

这里另外一个需要注意的重要的点是，即使一个条目只是简单地读取（没有改变，`cache.put(...)`），一个事务仍然可能失败，因为该条目的值对于发起事务中的逻辑很重要。

注意，对于`READ_COMMITTED`和`REPEATABLE_READ`事务，键的顺序是很重要的，因为这些模式中锁也是按顺序获得的。
### 3.3.读一致性
为了在悲观模式下实现完全的读一致性，需要获取读锁。这意味着只有在悲观的可重复读（或可序列化）事务中，悲观模式下的读之间的完全一致性才能够实现。

当使用乐观事务时，通过禁止读之间的潜在冲突，可以实现完全的读一致性。此行为由乐观的可序列化模式提供。但是，请注意，在提交发生之前，用户仍然可以读取部分事务状态，因此事务逻辑必须对其进行保护。只有在提交阶段，在任何冲突的情况下，才会抛出`TransactionOptimisticException`，这将允许开发者重试事务。

::: warning 警告
如果没有使用悲观的可重复读或者可序列化事务，或者也没有使用乐观的序列化事务，那么就可以看到部分的事务状态，这意味着如果一个事务更新对象A和B，那么另一个事务可能看到A的新值和B的旧值。
:::
## 4.死锁检测
当处理分布式事务时必须要遵守的主要规则是参与一个事务的键的锁，必须按照同样的顺序获得，违反这个规则就可能导致分布式死锁。

Ignite无法避免分布式死锁，而是有一个内建的功能来使调试和解决这个问题更容易。

在下面的代码片段中，事务启动时带有超时限制，如果到期，死锁检测过程就会试图查找一个触发这个超时的可能的死锁。当超过超时时间时，无论死锁如何，都会向应用层抛出`CacheException`，并将`TransactionTimeoutException`作为其触发原因。不过如果检测到了一个死锁，返回的`TransactionTimeoutException`的触发原因会是`TransactionDeadlockException`（至少涉及死锁的一个事务）。

<Tabs>
<Tab title="Java">

```java
CacheConfiguration<Integer, String> cfg = new CacheConfiguration<>();
cfg.setAtomicityMode(CacheAtomicityMode.TRANSACTIONAL);
cfg.setName("myCache");
IgniteCache<Integer, String> cache = ignite.getOrCreateCache(cfg);

try (Transaction tx = ignite.transactions().txStart(TransactionConcurrency.PESSIMISTIC,
        TransactionIsolation.READ_COMMITTED, 300, 0)) {
    cache.put(1, "1");
    cache.put(2, "1");

    tx.commit();
} catch (CacheException e) {
    if (e.getCause() instanceof TransactionTimeoutException
            && e.getCause().getCause() instanceof TransactionDeadlockException)

        System.out.println(e.getCause().getCause().getMessage());
}
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
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
    },
    CacheConfiguration = new[]
    {
        new CacheConfiguration
        {
            Name = "cacheName",
            AtomicityMode = CacheAtomicityMode.Transactional
        }
    },
    TransactionConfiguration = new TransactionConfiguration
    {
        DefaultTimeoutOnPartitionMapExchange = TimeSpan.FromSeconds(20)
    }
};

var ignite = Ignition.Start(cfg);
var intCache = ignite.GetOrCreateCache<int, int>("intCache");
try
{
    using (var tx = ignite.GetTransactions().TxStart(TransactionConcurrency.Pessimistic,
        TransactionIsolation.ReadCommitted, TimeSpan.FromMilliseconds(300), 0))
    {
        intCache.Put(1, 1);
        intCache.Put(2, 1);
        tx.Commit();
    }
}
catch (TransactionTimeoutException e)
{
    Console.WriteLine(e.Message);
}
catch (TransactionDeadlockException e)
{
    Console.WriteLine(e.Message);
}
```
</Tab>

<Tab title="C++">

```cpp
try {
    Transaction tx = ignite.GetTransactions().TxStart(
        TransactionConcurrency::PESSIMISTIC, TransactionIsolation::READ_COMMITTED, 300, 0);
    cache.Put(1, 1);

    cache.Put(2, 1);

    tx.Commit();
}
catch (IgniteError& err)
{
    std::cout << "An error occurred: " << err.GetText() << std::endl;
    std::cin.get();
    return err.GetCode();
}
```
</Tab>
</Tabs>

`TransactionDeadlockException`里面包含了有用的信息，有助于找到导致死锁的原因。

```
Deadlock detected:

K1: TX1 holds lock, TX2 waits lock.
K2: TX2 holds lock, TX1 waits lock.

Transactions:

TX1 [txId=GridCacheVersion [topVer=74949328, time=1463469328421, order=1463469326211, nodeOrder=1], nodeId=ad68354d-07b8-4be5-85bb-f5f2362fbb88, threadId=73]
TX2 [txId=GridCacheVersion [topVer=74949328, time=1463469328421, order=1463469326210, nodeOrder=1], nodeId=ad68354d-07b8-4be5-85bb-f5f2362fbb88, threadId=74]

Keys:

K1 [key=1, cache=default]
K2 [key=2, cache=default]
```

死锁检测是一个多步过程，根据集群中节点的数量、键以及可能导致死锁涉及的事务数，可能需要做多次迭代。一个死锁检测的发起者是发起事务并且出现`TransactionTimeoutException`错误的那个节点，这个节点会检查是否发生了死锁，通过与其它远程节点交换请求/响应，并且准备一个与死锁有关的、由`TransactionDeadlockException`提供的报告，每个这样的消息（请求/响应）都会被称为一次迭代。

因为死锁检测过程不结束，事务就不会回滚，有时，如果希望对于事务回滚有一个可预测的时间，调整一下参数还是有意义的（下面会描述）。

 - `IgniteSystemProperties.IGNITE_TX_DEADLOCK_DETECTION_MAX_ITERS`：指定死锁检测过程迭代的最大数，如果这个属性的值小于等于0，死锁检测会被禁用（默认为1000）；
 - `IgniteSystemProperties.IGNITE_TX_DEADLOCK_DETECTION_TIMEOUT`：指定死锁检测机制的超时时间（默认为1分钟）。

注意如果迭代次数太少，可能获得一个不完整的死锁检测报告。
## 5.无死锁事务
对于`OPTIMISTIC``SERIALIZABLE`事务，锁不是按顺序获得的。该模式中键可以按照任何顺序访问，因为事务锁是通过一个额外的检查以并行的方式获得的，这使得Ignite可以避免死锁。

这里需要引入几个概念来描述`SERIALIZABLE`的事务锁的工作方式。Ignite中的每个事务都会被赋予一个叫做`XidVersion`的可比较的版本号，事务提交时该事务中修改的每个条目都会被赋予一个叫做`EntryVersion`的新的版本号，一个版本号为`XidVersionA`的`OPTIMISTIC``SERIALIZABLE`事务在如下情况下会抛出`TransactionOptimisticException`异常而失败：

 - 有一个进行中的`PESSIMISTIC`或者非可序列化`OPTIMISTIC`事务在`SERIALIZABLE`事务中的一个条目上持有了一个锁；
 - 有另外一个进行中的版本号为`XidVersionB`的`OPTIMISTIC``SERIALIZABLE`事务，在`XidVersionB > XidVersionA`时以及这个事务在`SERIALIZABLE`事务中的一个条目上持有了一个锁；
 - 在该`OPTIMISTIC``SERIALIZABLE`事务获得所有必要的锁时，存在在提交之前的版本与当前版本不同的条目；

::: tip 注意
在一个高并发环境中，乐观锁可能出现高事务失败率，而悲观锁如果锁被事务以一个不同的顺序获得可能导致死锁。

不过在一个同质化的环境中，乐观可序列化锁对于大的事务可能提供更好的性能，因为网络交互的数量只取决于事务相关的节点的数量，而不取决于事务中的键的数量。
:::

## 6.处理失败事务
如下的异常可能导致事务失败：

|异常名称|描述|解决办法|
|---|---|---|
|由`TransactionTimeoutException`触发的`CacheException`|事务超时会触发`TransactionTimeoutException`。|可以增加超时时间或者缩短事务执行时间|
|`TransactionDeadlockException`触发`TransactionTimeoutException`，再触发`CacheException`|事务死锁会触发这个异常。|使用死锁检测机制调试和修正死锁，或者切换到乐观序列化事务（无死锁事务）。|
|`TransactionOptimisticException`|某种原因的乐观事务失败会抛出这个异常，大多数情况下，该异常发生在事务试图并发更新数据的场景中。|重新执行事务。|
|`TransactionRollbackException`|事务自动或者手动回滚时，可能抛出这个异常，这时，数据状态是一致的。|因为数据状态是一致的，所以可以对事务进行重试。|
|`TransactionHeuristicException`|这是一个不太可能发生的异常，由Ignite中意想不到的内部错误或者通信错误导致，该异常存在于事务子系统无法预知的不确定场景中，目前没有被合理地处理。|如果出现该异常，数据可能不一致，这时需要对数据进行重新加载，或者报告给Ignite开发社区。|

## 7.长期运行事务终止
在Ignite集群中，部分事件会触发分区映射的交换过程以及数据的再平衡，来保证整个集群的数据分布，这个事件的一个例子就是集群拓扑变更事件，它会在新节点加入或者已有节点离开时触发，还有，新的缓存或者SQL表创建时，也会触发分区映射的交换。

当分区映射交换开始时，Ignite会在特定的阶段拿到一个全局锁，在未完成的事务并行执行时无法获得锁，这些事务会阻止分区映射交换进程，从而阻断一些新节点加入进程这样的一些操作。

使用`TransactionConfiguration.setTxTimeoutOnPartitionMapExchange(...)`方法，可以配置长期运行事务阻断分区映射交换的最大时间，时间一到，所有的未完成事务都会回滚，让分区映射交换进程先完成。

下面的示例显示如何配置超时时间：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

    <property name="transactionConfiguration">
        <bean class="org.apache.ignite.configuration.TransactionConfiguration">
            <!--Set the timeout to 20 seconds-->
            <property name="TxTimeoutOnPartitionMapExchange" value="20000"/>
        </bean>
    </property>

</bean>
```
</Tab>

<Tab title="Java">

```java
// Create a configuration
IgniteConfiguration cfg = new IgniteConfiguration();

// Create a Transaction configuration
TransactionConfiguration txCfg = new TransactionConfiguration();

// Set the timeout to 20 seconds
txCfg.setTxTimeoutOnPartitionMapExchange(20000);

cfg.setTransactionConfiguration(txCfg);

// Start the node
Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    TransactionConfiguration = new TransactionConfiguration
    {
        DefaultTimeoutOnPartitionMapExchange = TimeSpan.FromSeconds(20)
    }
};
Ignition.Start(cfg);
```
</Tab>
</Tabs>

## 8.事务监控
和事务相关的指标信息，请参见[事务监控](/doc/java/Monitoring.md#_4-2-8-事务监控)章节的介绍。

关于如何跟踪事务的信息，请参见[跟踪](/doc/java/Monitoring.md#_7-跟踪)章节的介绍。

另外，还可以通过[控制脚本](/doc/java/Tools.md#_1-控制脚本)获取事务的信息，或者取消集群中正在执行的事务。

<RightPane/>
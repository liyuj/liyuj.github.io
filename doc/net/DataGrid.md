# 数据网格
## 1.数据网格
Ignite.NET针对越来越火的水平扩展概念而构建，具有实时按需增加节点的能力。它可以线性扩展至几百个节点，通过数据位置的强语义以及关联数据路由来降低冗余数据噪声。

Ignite数据网格是一个`分布式内存键-值存储`，它可以视为一个分布式的分区化哈希映射，每个集群节点都持有所有数据的一部分，这意味着随着集群节点的增加，就可以缓存更多的数据。

与其它键值存储系统不同，Ignite通过可插拔的哈希算法来决定数据的位置，每个客户端都可以通过一个哈希函数决定一个键属于哪个节点，而不需要任何特定的映射服务器或者协调器节点。

Ignite数据网格支持本地、复制、分区模式的数据集，可以使用标准SQL语法方便地进行跨数据集查询，同时还支持在数据中进行分布式SQL关联。

Ignite数据网格轻量快速，是目前在集群中支持数据的事务性和原子性的最快的实现之一。
::: tip 数据一致性
只要集群处于在线状态，即使节点故障或拓扑发生变化，Ignite都会保证不同节点之间的数据始终保持一致。
:::
![](https://files.readme.io/ae429f4-data_grid.png)

**功能特性**

 - 分布式内存缓存；
 - 高性能；
 - 弹性扩展；
 - 分布式内存事务；
 - 分层堆外存储；
 - 支持关联的分布式ANSI-99 SQL查询。

### 1.1.IgniteCache
`ICache`接口是Ignite缓存实现的入口，提供了存储和获取数据、执行查询（包括SQL）、迭代和扫描等的方法。

可以像下面这样获得`ICache`的实例：
```csharp
IIgnite ignite = Ignition.Start();

// Obtain instance of cache named "myCache".
// Note that generic arguments are only for your convenience.
// You can work with any cache in terms of any generic arguments.
// However, attempt to retrieve an entry of incompatible type
// will result in exception.
ICache<int, string> cache = ignite.GetCache<int, string>("myCache");
```
还可以动态创建缓存的实例，这时Ignite会在所有服务端节点上创建和部署缓存。
```csharp
IIgnite ignite = Ignition.Start();

// Create cache with given name, if it does not exist.
var cache = ignite.GetOrCreateCache<int, string>("myNewCache");
```
::: tip XML配置
在任何节点上的Ignite Spring XML配置中定义的所有缓存都会自动创建并部署在所有服务端节点上（即无需在每个节点上都指定相同的配置）。
:::
## 2.缓存操作
Ignite.NET数据网格为数据访问提供了易于使用且功能强大的API，主要包括了如下的功能：

 - 基本缓存操作；
 - ConcurrentMap API；
 - 并置处理（EntryProcessor）；
 - 事件和指标；
 - 可插拔的持久化；
 - ACID事务；
 - 数据查询能力（包括SQL）。

### 2.1.ICache
可以从`IIgnite`中直接获得`ICache<,>`的实例：
```csharp
IIgnite ignite = Ignition.Start();

ICache<int, string> cache = ignite.GetCache<int, string>("mycache");
```
泛型化的缓存提供了一种强类型高性能的数据处理方法。

注意泛型参数不会影响内部缓存的表示，可以使用任何泛型参数处理同一个缓存。查询不兼容类型的条目会抛出`InvalidCastException`异常。

### 2.2.基本操作
下面是一些基本的原子操作示例：

Put & Get：
```csharp
using (var ignite = Ignition.Start())
{
    var cache = ignite.GetOrCreateCache<int, string>("myCache");

    // Store keys in cache (values will end up on different cache nodes).
    for (int i = 0; i < 10; i++)
        cache.Put(i, i.ToString());

    for (int i = 0; i < 10; i++)
        Console.WriteLine("Got [key={0}, val={1}]", i, cache.Get(i));
}
```
原子操作：
```csharp
// Put-if-absent which returns previous value.
CacheResult<string> oldVal = cache.GetAndPutIfAbsent(11, "Hello");

// Put-if-absent which returns boolean success flag.
bool success = cache.PutIfAbsent(22, "World");

// Replace-if-exists operation (opposite of getAndPutIfAbsent), returns previous value.
oldVal = cache.GetAndReplace(11, "Hello");

// Replace-if-exists operation (opposite of putIfAbsent), returns boolean success flag.
success = cache.Replace(22, "World");

// Replace-if-matches operation.
success = cache.Replace(22, "World", "World!");

// Remove-if-matches operation.
success = cache.Remove(1, "Hello");
```
### 2.3.ICacheEntryProcessor
当对缓存执行写入和更新操作时，通常要在网络上发送完整的对象状态，而`ICacheEntryProcessor`可以直接在主节点上处理数据，通常仅需传输增量而不是完整状态。

此外，可以将自己的业务逻辑嵌入到`ICacheEntryProcessor`中，例如，拿到先前的缓存值并通过指定的参数对其进行递增处理：
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
::: tip 原子性
`EntryProcessors`在给定缓存键的锁内以原子方式执行。
:::
### 2.4.异步支持
和Ignite中的所有分布式API一样，`ICache`也支持基于任务的异步模式，并且具有与所有分布式方法相对应的Async方法：
```csharp
// Start asynchronous operation and obtain a Task that represents it
Task<CacheResult<string>> asyncVal = cache.GetAndPutAsync(1, "1");

// Synchronously wait for the task to complete and obtain result
Console.WriteLine(asyncVal.Result.Success);

// Use C# 5 await keyword
Console.WriteLine((await asyncVal).Success);

// Use continuation
asyncVal.ContinueWith(task => Console.WriteLine(task.Result.Success));
```
## 3.缓存模式
Ignite.NET也提供了缓存操作的几种不同模式，具体细节可以参见Ignite的[分区和复制](/doc/java/Key-ValueDataGrid.md#_3-1-分区和复制)文档。

相关配置的示例：

C#：
```csharp
var cfg = new IgniteConfiguration
{
    CacheConfiguration = new[]
    {
        new CacheConfiguration
        {
            Name = "cacheName",
            CacheMode = CacheMode.Replicated,
            AtomicWriteOrderMode = CacheAtomicWriteOrderMode.Primary
        }
    }
};
```
app.config：
```xml
<igniteConfiguration>
    <cacheConfiguration>
        <cacheConfiguration name="cacheName" cacheMode="Replicated" atomicWriteOrderMode="Primary" />
    </cacheConfiguration>
</igniteConfiguration>
```
## 4.缓存查询
Ignite.NET提供了非常优雅的查询接口，包括基于谓词的扫描查询、SQL查询和文本查询，对于SQL查询，Ignite支持内存中的索引，所以所有的数据检索都会非常快。如果数据保存在堆外内存，那么索引也会保存在堆外内存。
### 4.1.主要的抽象
`ICache`有几种查询方法，所有这些方法都接收某些`QueryBase`类的子类然后返回`IQueryCursor`。

**QueryBase**

`QueryBase`抽象类表示要在分布式缓存上执行的抽象分页查询，可以通过`Query.PageSize`属性设置返回的游标的页面大小。

**IQueryCursor**

`IQueryCursor`表示查询的结果集，并可以透明的逐页迭代。每当开始遍历最后一页时，它将自动在后台请求下一页。对于不需要分页的情况，可以使用`IQueryCursor.GetAll()`方法来获取整个查询结果并将其存储在集合中。

::: tip 关闭游标
如果调用`QueryCursor.GetAll()`方法，游标将自动关闭。如果要遍历游标，则必须显式调用`Dispose()`或使用`using`关键字，使用`foreach`循环将自动调用`Dispose()`。
:::

### 4.2.扫描查询
扫描查询可以基于某些自定义的谓词以分布式形式查询缓存。
```csharp
var cache = ignite.GetOrCreateCache<int, Person>("myCache");

// Create query and get a cursor.
var cursor = cache.Query(new ScanQuery<int, Person>(new QueryFilter()));

// Iterate over results. Using 'foreach' loop will close the cursor automatically.
foreach (var cacheEntry in cursor)
    Console.WriteLine(cacheEntry.Value);
```
### 4.3.文本查询
Ignite还支持基于Lucene索引的文本查询。
```csharp
var cache = ignite.GetOrCreateCache<int, Person>("myCache");

// Query for all people with "Master Degree" in their resumes.
var cursor = cache.Query(new TextQuery("Person", "Master Degree"));

// Iterate over results. Using 'foreach' loop will close the cursor automatically.
foreach (var cacheEntry in cursor)
    Console.WriteLine(cacheEntry.Value);
```
## 5.持续查询
持续查询可以监听缓存中数据的变化，启动后就会收到符合查询条件的数据变化的通知。

Ignite通过`ContinuousQuery`类和`ICache.QueryContinuous`方法来支持持续查询，其支持以下内容：

**初始查询**

执行持续查询时，在开始监听更新之前可以执行一个初始查询，初始查询通过`initialQry`参数设置，可以是任何Ignite查询类型，扫描查询、SQL查询或文本查询。

**远程过滤器**

该过滤器在给定键的主节点上执行，并评估是否应将事件传播到监听器。如果过滤器返回`true`，则将通知监听器，否则将跳过该事件。在触发事件的节点上进行过滤可以最大程度地减少不必要的与监听器通知有关的网络流量。远程监听器是通过`ContinuousQuery.Filter`属性进行配置的。

**本地监听器**

只要事件与远程过滤器匹配，它们就会被发送到客户端以通知本地的监听器，本地监听器是通过`ContinuousQuery.Listener`属性进行配置的。
```csharp
var cache = ignite.GetOrCreateCache<int, string>("mycache");

// Callback that is called locally when update notifications are received.
var localListener = new LocalListener();

// Create new continuous query.
var qry = new ContinuousQuery<int, string>(localListener)
{
    // This filter will be evaluated remotely on all nodes.
    // Entry that pass this filter will be sent to the caller.
    Filter = new RemoteFilter()
};

// Optional initial query to select all keys greater than 10.
var initialQry = new ScanQuery<int, string>(new InitialFilter());

using (var queryHandle = cache.QueryContinuous(qry, initialQry))
{
    // Iterate through existing data stored in cache.
    foreach (var entry in queryHandle.GetInitialQueryCursor())
        Console.WriteLine("key={0}, val={1}", entry.Key, entry.Value);

    // Add a few more keys and watch a few more query notifications.
    for (int i = 5; i < 15; i++)
        cache.Put(i, i.ToString());
}
```
## 6.事务
### 6.1.原子化模式
Ignite的缓存操作支持两种模式，`事务`模式和`原子`模式。在`事务`模式中，可以将多个缓存操作组合成一个事务，而`原子`模式支持多个原子操作，一次一个。原子化模式是在`CacheAtomicityMode`枚举中定义的。

`事务`模式支持完全兼容ACID的事务，不过如果实际只需要原子语义，那么还是建议使用`原子`模式，因为性能更好。

`原子`模式通过避免事务锁实现了更好的性能，同时仍然提供了数据的原子性和一致性。`原子`模式的另一个不同是批量写入，比如`PutAll(...)`和`RemoveAll(...)`方法，是不会在一个事务中执行的，可能部分失败。如果出现了部分失败，会抛出包含有更新失败的键列表的`CachePartialUpdateException`异常。

原子化模式是通过`CacheConfiguration`进行配置的：

C#：
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
app.config：
```xml
<igniteConfiguration>
  <cacheConfiguration>
    <cacheConfiguration name="txCache" atomicityMode="Transactional" />
  </cacheConfiguration>
  <transactionConfiguration defaultTransactionConcurrency="Optimistic" />
</igniteConfiguration>
```
Spring XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    ...
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
          	<!-- Set a cache name. -->
   					<property name="name" value="myCache"/>

            <!-- Set atomicity mode, can be ATOMIC or TRANSACTIONAL.
								 ATOMIC is default. -->
    				<property name="atomicityMode" value="TRANSACTIONAL"/>
            ...
        </bean>
    </property>

    <!-- Optional transaction configuration. -->
    <property name="transactionConfiguration">
        <bean class="org.apache.ignite.configuration.TransactionConfiguration">
            <!-- Configure TM lookup here. -->
        </bean>
    </property>
</bean>
```
### 6.2.ITransactions
`ITransactions`接口包含了开始和完成事务、订阅监听器以及获取指标数据等功能。
::: tip 跨缓存事务
可以将来自不同缓存的多种操作组合到一个事务中，这意味着可以在一个事务中更新不同类型的缓存，例如`复制`和`分区`模式缓存。
:::
::: tip 近缓存事务
近缓存是完全事务性的，并且当服务端上的数据更改时，它们都会自动更新或失效。
:::
通过如下方式可以获得`ITransactions`的实例：
```csharp
IIgnite ignite = Ignition.Start();

ITransactions transactions = ignite.GetTransactions();
```
下面是执行事务操作的一个示例：
```csharp
using (ITransaction tx = transactions.TxStart())
{
    var hello = cache.Get(1);

    if (hello != "Hello")
        cache.Put(1, "Hello");

    cache.Put(2, "World");

    tx.Commit();
}
```
### 6.3.二阶段提交（2PC）
Ignite在事务中使用了2阶段提交（2PC）的协议，但是只要适用也带有很多一阶段提交的优化。在一个事务中当数据更新时，在调用`commit()`方法之前，Ignite会在本地事务映射中保持事务状态，在这一点，只要需要，数据都会被传输到远程节点。

有关二阶段提交的更多信息，可以参照如下文章：

 - [Apache Ignite事务架构：2阶段提交协议](https://my.oschina.net/liyuj/blog/1626309)
 - [Apache Ignite事务架构：并发模型和隔离级别](https://my.oschina.net/liyuj/blog/1627248)
 - [Apache Ignite事务架构：故障和恢复](https://my.oschina.net/liyuj/blog/1791800)
 - [Apache Ignite事务架构：Ignite持久化的事务处理](https://my.oschina.net/liyuj/blog/1793912)
 - [Apache Ignite事务架构：第三方持久化的事务处理](https://my.oschina.net/liyuj/blog/1796152)

或者，也可以看下面的[资料](https://cwiki.apache.org/confluence/display/IGNITE/Ignite+Key-Value+Transactions+Architecture)，了解事务子系统的内部实现。
::: tip ACID完整性
Ignite提供了完整的ACID（原子性、一致性、隔离性和持久性）兼容事务来确保一致性。
:::
### 6.4.并发模型和隔离级别
当原子化模式配置为`事务`时，Ignite对事务支持`乐观`和`悲观`的**并发模型**。并发模型决定了何时获得一个条目级的事务锁-在访问数据时或者在`prepare`阶段。锁定可以防止对一个对象的并发访问。比如，当试图用悲观锁更新一个ToDo列表项时，服务端会在该对象上置一个锁以使其它的事务或者操作无法更新同一个条目，直到提交或者回滚该事务。不管在一个事务中使用那种并发模型，在提交之前都存在事务中的所有条目被锁定的时刻。

**隔离级别**定义了并发事务如何"看"以及处理针对同一个键的操作。Ignite支持`读提交`、`可重复读`、`可序列化`隔离级别。
并发模型和隔离级别的所有组合都是可以同时使用的。下面是针对Ignite提供的每一个并发-隔离组合的行为和保证的描述。
### 6.5.悲观事务
在`悲观`事务中，锁是在第一次读或者写访问期间获得（取决于隔离级别）然后被事务持有直到其被提交或者回滚。该模式中，锁首先在主节点获得然后在准备阶段提升至备份节点。下面的隔离级别可以配置为`悲观`并发模型。

 - `读提交`：数据被无锁地读取并且不会被事务本身缓存。如果缓存配置允许，数据是可能从一个备份节点中读取的。在这个隔离级别中，可以有所谓的非可重复读，因为当在自己的事务中读取数据两次时，一个并发事务可以改变该数据。锁只有在第一次写访问时才会获得（包括`EntryProcessor`调用）。这意味着事务中已经读取的一个条目在该事务提交时可能有一个不同的值，这种情况是不会抛出异常的；
 - `可重复读`：获得条目锁以及第一次对主节点的读/写访问并获得数据后，就会存储在本地事务映射中。之后对同一数据的所有连续访问都是本地化的，并且返回最后一次读或者被更新的事务值。这意味着没有其它的并发事务可以改变锁定的数据，这样就获得了事务的可重复读；
 - `可序列化`：在`悲观`模式中，这个隔离级别与`可重复读`是一样的工作方式。

注意，在`悲观`模式中，锁的顺序是很重要的。此外，Ignite可以按照用户提供的顺序依次并且准确地获得锁。

::: warning 性能考量
设想拓扑中有三个节点（A、B、C），并且在事务中针对键[1, 2, 3, 4, 5, 6]执行一个`putAll`。假定这些键以如下形式映射到节点：{A: 1, 4}, {B: 2, 5}, {C: 3, 6}，因为Ignite在`悲观`模式中无法改变获得锁的顺序，它会产生6次连续地网络往返：[A, B, C, A, B, C]。在键的锁定顺序对于一个事务的语义不重要的情况下，将键按照分区进行分组然后将在一个分区的键一起锁定是明智的。这在一个大的事务中可以显著地降低网络消息的数量。在这个示例中，如果对于一个`putAll`键按照如下的方式排序：[1, 4, 2, 5, 3, 6]，之后只需要3次的连续网络访问。
:::
::: danger 拓扑变化约束
注意，如果至少获得一个悲观事务锁，都不可能改变缓存的拓扑，直到事务被提交或者回滚，因此，不建议长时间地持有事务锁。
:::
### 6.6.悲观事务中的死锁检测
当处理分布式事务时必须要遵守的主要规则是参与一个事务的键的锁，必须按照同样的顺序获得，违反这个规则就可能导致分布式死锁。

Ignite无法避免分布式死锁，而是有一个内建的功能来使调试和解决这个问题更容易。

就像下面的代码片段所示，事务启动时带有超时限制。如果到期，则死锁检测过程将尝试查找可能导致超时的死锁。超时到期后，无论死锁如何，都会抛出异常并将其传播到应用端。不过如果检测到死锁，则异常消息将包含有关死锁的详细信息。
```csharp
using (ITransaction tx = ignite.GetTransactions().TxStart(
	TransactionConcurrency.Pessimistic, TransactionIsolation.ReadCommitted,
	TimeSpan.FromMilliseconds(300), 0))
{
	cache.Put(1, 1);

	cache.Put(2, 1);

	tx.Commit();
}
catch (TransactionDeadlockException e)
{
	// Write all the exception information, including deadlock details.
	Console.WriteLine(e.ToString());
}
```
异常消息：
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
死锁检测是一个多步过程，依赖于集群中节点的数量、键以及可能导致死锁涉及的事务数，可能需要做很多次迭代。一个死锁检测的发起者是发起事务并且出现`TransactionTimeoutException`错误的那个节点，该节点会检查是否发生了死锁，通过与其它远程节点交换请求/响应，并且准备一个与死锁有关的、由`TransactionDeadlockException`提供的报告，每个这样的消息（请求/响应）都会被称为一个迭代器。
::: tip 提示
如果要完全避免死锁，请参见下面的无死锁事务章节。
:::
### 6.7.乐观事务
在乐观事务中，条目锁是在二阶段提交的`准备`阶段从主节点获得的，然后提升至备份节点，该锁在事务提交时被释放。如果用户回滚事务没有试图做提交，是不会获得锁的。下面的隔离级别可以与`乐观`并发模型配置在一起。

 - `读提交`：应该作用于缓存的改变是在源节点上收集的，然后事务提交后生效。事务数据无锁地读取并且不会在事务中缓存。如果缓存配置允许，该数据是可能从备份节点中读取的。在这个隔离级别中，可以有一个所谓的非可重复读，因为在自己的事务中读取数据两次时另一个事务可以修改数据。这个模式组合在第一次读或者写操作后如果条目值被修改是不会做校验的，并且不会抛出异常。
 - `可重复读`：这个隔离级别的事务的工作方式类似于`乐观` `读提交`的事务，只有一个不同-读取值缓存于源节点并且所有的后续读保证都是本地化的。这个模式组合在第一次读或者写操作后如果条目值被修改是不会做校验的，并且不会抛出异常。
 - `可序列化`：在第一次读访问之后会存储一个条目的版本，如果Ignite引擎检测到发起事务中的条目只要有一个被修改，Ignite就会在提交阶段放弃该事务，这是在提交阶段对网格内的事务中记载的条目的版本进行内部检查实现的。简而言之，这意味着Ignite如果在一个事务的提交阶段检测到一个冲突，就会放弃这个事务并且抛出`TransactionOptimisticException`异常以及回滚已经做出的任何改变，开发者应该处理这个异常并且重试该事务。

```csharp
var txs = ignite.GetTransactions();

// Start transaction in optimistic mode with serializable isolation level.
while (true)
{
    using (var tx = txs.txStart(TransactionConcurrency.Optimistic,                                       TransactionIsolation.Serializable))
    {
	 			// Modify cache entires as part of this transacation.
  			....

  			// commit transaction.
  			tx.Commit();

      	// Transaction succeeded. Leave the while loop.
      	break;
    }
    catch (TransactionOptimisticException e) {
    		// Transaction has failed. Retry.
    }
}
```
这里另外一个需要注意的重要的点是，即使一个条目只是简单地读取，一个事务仍然可能失败，因为该条目的值对于发起事务中的逻辑很重要。

注意，对于`读提交`和`可重复读`事务，键的顺序是很重要的，因为这些模式中锁也是按顺序获得的。
### 6.8.无死锁事务
对于`乐观`的`可序列化`事务，锁不是按顺序获得的。该模式中键可以按照任何顺序访问，因为事务锁是通过一个额外的检查以并行的方式获得的，这使得Ignite可以避免死锁。

这里需要引入几个概念来描述`可序列化`的事务锁的工作方式。Ignite中的每个事务都会被赋予一个叫做`XidVersion`的可比较的版本号，事务提交时该事务中修改的每个条目都会被赋予一个叫做`EntryVersion`的新的版本号，一个版本号为`XidVersionA`的`乐观可序列化`事务在如下情况下会抛出`TransactionOptimisticException`异常而失败：

 - 有一个进行中的`悲观`的或者非可序列化`乐观`事务在`可序列化`事务中的一个条目上持有了一个锁；
 - 有另外一个进行中的版本号为`XidVersionB`的`乐观可序列化`事务，在`XidVersionB > XidVersionA`时以及这个事务在`可序列化`事务中的一个条目上持有了一个锁；
 - 在该`乐观可序列化`事务获得所有必要的锁时，存在在提交之前的版本与当前版本不同的条目；

::: tip 注意
在一个高并发环境中，乐观锁可能出现高事务失败率，而悲观锁如果锁被事务以一个不同的顺序获得可能导致死锁。

不过在一个同质化的环境中，乐观可序列化锁对于大的事务可能提供更好的性能，因为网络交互的数量只取决于事务相关的节点的数量，而不取决于事务中的键的数量。
:::
## 7.关联并置
鉴于多数情况是使用`分区`模式缓存数据，因此将数据和计算并置就会显著提升应用的性能和可扩展性。

### 7.1.数据和计算的并置
是可以将计算映射到数据所在的节点的，这个概念叫做数据和计算的并置，它可以将整个计算单元映射到某个节点。

数据和计算的并置，是通过`ICompute.AffinityRun(...)`和`ICompute.AffinityCall(...)`方法实现的。

下面是将计算与持有指定数据的一些节点并置处理的示例：
```csharp
void AffinityRun()
{
    using (var ignite = Ignition.Start())
    {
        int key = 5;

        ignite.GetCompute().AffinityRun("persons", key, new AffinityAction {Key = key});
    }
}

class AffinityAction : IComputeAction
{
    [InstanceResource] private readonly IIgnite _ignite;

    public int Key { get; set; }

    public void Invoke()
    {
        // When used in AffinityRun, this cache access is local
        var person = _ignite.GetCache<int, IPerson>("persons").Get(Key);

        Console.WriteLine(person.Name);
    }
}
```
### 7.2.ICompute和ICacheEntryProcessor
`ICompute.AffinityRun(...)`和`ICache.Invoke(...)`方法都提供了计算和数据并置的能力。主要区别在于`Invoke(...)`方法是原子化的，并且执行时会持有指定键的锁，不应该从`ICacheEntryProcessor`业务逻辑内访问其他键，因为它可能导致死锁。

而`AffinityRun(...)`和`AffinityCall(...)`则不持有任何锁。例如，在这些方法中开始多个事务或执行缓存查询都是合法的，而不必担心死锁。这时Ignite将自动检测到并置的处理，并将对事务使用轻量级的一阶段提交优化（而不是二阶段提交）。
## 8.数据加载
数据加载通常与启动时初始化缓存数据有关。使用标准缓存的`Put(...)`或`PutAll(...)`操作对于加载大量数据来说通常比较低效。

### 8.1.IDataStreamer
数据流处理器是由`IDataStreamer`API定义的，可用于将大量连续不断的数据注入Ignite缓存。数据流处理器支持可伸缩和容错，并在把数据发送到对应的节点之前，将数据进行分批处理来实现高性能。
::: tip 提示
数据流可以随时将大量数据加载到缓存中，包括在启动时进行预加载。
:::

更多细节请参见[数据流处理器](/doc/net/Streaming.md#_2-数据流处理器)的文档。

### 8.2.ICache.LoadCache()
将大量数据加载到缓存的另一种方法是通过[ICacheStore.LoadCache()](/doc/net/Persistence.md#_2-3-1-loadcache)方法，该方法甚至无需传递需要加载的键就可以加载缓存数据。

`ICache.LoadCache()`方法将委派给持有该缓存的所有节点上的`ICacheStore.LoadCache()`方法，要仅在本地节点上加载数据，可以使用`ICache.LocalLoadCache()`方法。
::: tip 注意
如果是分区缓存，则未映射到该节点的键（无论是主备）将被缓存自动丢弃。
:::

**分区感知数据加载**

在上述方案中，将在所有节点上执行相同的查询，每个节点都会遍历整个结果集，跳过不属于该节点的键，这不是很高效。

如果将分区ID与每条记录一起存储在数据库中，则可以改善这种情况。可以使用`ICacheAffinity`接口获取任何键的分区ID。

当缓存对象能获取对应的分区ID时，每个节点就可以只查询属于该节点的那些分区数据，为此可以将Ignite实例注入到CacheStore中，并用它来确定属于本地节点的分区。
## 9.过期策略
过期策略用于指定缓存数据的过期时间，时间可以从创建、上次访问或修改时间开始计算。

可以通过实现`IExpiryPolicy`接口或使用预定义的`ExpiryPolicy`实现来配置过期策略。

过期策略可以在Spring XML的`CacheConfiguration`中进行配置，此策略将影响缓存内的所有数据。
```csharp
var cache = cache.WithExpiryPolicy(new ExpiryPolicy(TimeSpan.FromMilliseconds(100),
                TimeSpan.FromMilliseconds(100), TimeSpan.FromMilliseconds(100)));
```
该策略将影响返回的缓存实例上的每个操作。
## 10.近缓存
分区缓存也可以通过近缓存前置，这是一种较小的本地缓存，用于存储最近或访问频率最高的数据。和分区缓存一样，开发者可以控制近缓存的大小及其退出策略。

通过将`NearConfiguration`传入`IIgnite.CreateNearCache(NearConfiguration)`或`IIgnite.GetOrCreateNearCache(NearConfiguration)`方法，可以直接在客户端节点创建近缓存。如果想同时动态创建分布式缓存并为其创建近缓存，可以使用`IIgnite.GetOrCreateCache(CacheConfiguration, NearCacheConfiguration)`方法。
```csharp
// Create a near cache configuration.
var nearCacheCfg = new NearCacheConfiguration
{
		// Use LRU eviction policy to automatically evict entries
		// from near-cache, whenever it reaches 100000 in size.
    EvictionPolicy = new LruEvictionPolicy
    {
        MaxSize = 100000
    }
};

// Create a distributed cache on server nodes and
// a near cache on the local node, named "myCache".
var cache = ignite.GetOrCreateCache<int, int>(new CacheConfiguration(CacheName), nearCacheCfg);
```
在绝大多数场景中，如果使用了Ignite的关联并置，就不应该再使用近缓存了，因为所有数据都已经在本地了。

但是有时是无法将计算发送到远程节点的，对于这种情况，近缓存可以显著提高应用的可伸缩性和整体性能。

::: tip 事务
近缓存是完全事务化的，并且每当服务端的数据更改时，它们都会自动更新或失效。
:::

::: tip 服务端节点的近缓存
当以非并置的方式访问服务端上的分区缓存数据时，也可以通过`CacheConfiguration.NearConfiguration`属性在服务端节点上配置近缓存。
:::
### 10.1.配置
`CacheConfiguration`中对近缓存有意义的大多数可用配置参数都是从服务端配置继承的，例如，如果服务端缓存配置了`ExpiryPolicy`，则近缓存中的数据也会有相同的过期策略。

下表中列出的参数不是从服务端配置继承的，而是通过`NearCacheConfiguration`单独提供的：

|Setter方法|描述|默认值|
|---|---|---|
|`EvictionPolicy`|近缓存退出策略|无|
|`NearStartSize`|近缓存初始缓存大小，用于启动后初始化内部哈希表。|`CacheConfiguration.DefaultStartSize / 4 = 375,000`|

## 11.TransactionScope API
除了[事务](#_6-事务)中描述的`ITransactions`API，还可以通过标准的`System.Transactions.TransactionScope`API使用Ignite事务。
```csharp
using (var ts = new TransactionScope())
{
  cache.Put(1, "x");
  cache.Put(2, "y");

  ts.Complete();
}
```
如果缓存是事务化的，上面的代码会自动调用`ITransactions.TxStart()`和`ITransaction.Commit()`。

如果Ignite事务是由手动启动的，`TransactionScope`会被忽略，不会触发提交和回滚。
```csharp
// Assigning a value for the key.
cache[1] = 0;

using (var tx = transactions.TxStart())
{
  // Ignite transaction is started manually, TransactionScope below will not have any effect.
  using (new TransactionScope())
  {
    cache[1] = 2; // The update is enlisted into the outer Ignite transaction.
  }  // TransactionScope attempts to revert changes, will have no effect on the outer Ignite transaction.

  tx.Commit(); // Committing Ignite transaction.
}

cache.Get(1); // Returns 2.
```
### 11.1.事务隔离
Ignite有三个隔离模式，而`System.Transactions.IsolationLevel`有更多的模式，下表显示了`System.Transactions.IsolationLevel`和`Apache.Ignite.Core.Transactions.TransactionIsolation`之间的映射关系：

|IsolationLevel|TransactionIsolation|
|---|---|
|`Serializable`|`Serializable`|
|`RepeatableRead`|`RepeatableRead`|
|`ReadCommitted`|`ReadCommitted`|
|`ReadUncommitted`|``|
|`Snapshot`|``|
|`Chaos`|``|

`TransactionOptions.IsolationLevel`的默认值是`Serializable`。
```csharp
using (var ts = new TransactionScope(
  TransactionScopeOption.Required,
  new TransactionOptions
  {
    IsolationLevel = IsolationLevel.ReadCommitted
  }))
{
  cache[1] = 2;
  ts.Complete();
}
```
### 11.2.事务并发
Ignite事务有`TransactionConcurrency`配置（`Pessimistic`和`Optimistic`），而`TransactionScope`API没有这样的概念，因此如果一个Ignite事务由`TransactionScope`启动，它会使用由`IgniteConfiguration.TransactionConfiguration.DefaultTransactionConcurrency`属性配置的`TransactionConcurrency`默认值`Pessimistic`。
```csharp
var cfg = new IgniteConfiguration
{
  TransactionConfiguration = new TransactionConfiguration
  {
    DefaultTransactionConcurrency = TransactionConcurrency.Optimistic
  }
};

using (var ignite = Ignition.Start(cfg))
{
  using (var ts = new TransactionScope()) // Optimistic, Serializable
  {
    cache[1] = 2;
    ts.Complete();
  }
}
```
### 11.3.嵌套事务范围
`TransactionScope`可以嵌套在另一个`TransactionScope`中，不过Ignite不允许一个线程中有多于一个事务，根据`TransactionScopeOption`的配置会有如下的行为：

**TransactionScopeOption.Suppress:**

所有Ignite操作都参与现有的事务（抑制被忽略）。

**TransactionScopeOption.Required:**

所有Ignite操作都参与现有的事务（预期的行为）。

**TransactionScopeOption.RequiresNew:**

所有Ignite操作都参与现有的事务（新事务不会被创建），**Ignite事务会在嵌套的`TransactionScope`块退出时完成**，或者提交或者回滚，此后外部的范围将不起作用。

### 11.4.异步操作
所有的事务化异步操作都必须在离开`TransactionScope`前完成，否则行为未知，在执行异步操作时，要确认调用了`Wait()`或者`await`。
```csharp
using (var ts = new TransactionScope())
{
  cache.PutAsync(1, "x").Wait();
  await cache.PutAsync(2, "y");

  ts.Complete();
}
```
<RightPane/>
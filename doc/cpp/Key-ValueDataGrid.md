# 3.键-值数据网格
## 3.1.数据网格
Ignite C++内存数据网格是从头开始构建的，具有水平扩展的概念和实时按需添加节点的能力。它可以线性扩展至几百个节点，通过数据位置的强语义以及关联数据路由来降低冗余数据噪声。

Ignite数据网格是一个分布式内存键-值存储，可以视为一个分布式分区化的哈希映射。每个集群节点持有整个数据的一部分。这样添加的集群节点越多，就可以存储更多的数据。

与其它键-值存储不同，Ignite使用可插拔的哈希算法来确定数据的位置。每个客户端都可以通过哈希函数来确定键属于哪个节点，而无需任何特殊的映射服务器或命名节点。

Ignite数据网格支持本地、复制和分区数据集，并允许使用标准SQL语法在这些数据集之间自由关联查询。

Ignite数据网格速度非常快，是当今集群环境下对数据进行事务或原子化处理最快的实现之一。
::: tip 数据一致性
只要集群处于在线状态，Ignite就会保证不管故障或集群变更，不同集群节点之间的数据始终保持一致。
:::

![](https://files.readme.io/43f1493-data_grid.png)

**特性**

 - 分布式内存缓存；
 - 高性能；
 - 弹性扩展；
 - 分布式内存事务；
 - 分层堆外存储；
 - 支持关联的分布式ANSI-99 SQL查询。

### 3.1.1.IgniteCache
`Cache`类是Ignite缓存实现的入口，提供了存储和检索数据、执行查询的方法，包括SQL、迭代和扫描等。

获取`Cache`实例的方法如下：
```cpp
using namespace ignite;
using namespace cache;

IgniteConfiguration cfg;

// Start a node.
Ignite grid = Ignition::Start(cfg);

// Obtain instance of cache named "myCache".
// Note that generic arguments are only for your convenience.
// You can work with any cache in terms of any generic arguments.
// However, attempt to retrieve an entry of incompatible type
// will result in exception.
Cache<int, std::string> cache = grid.GetCache<int, std::string>("myCache");
```
还可以动态创建缓存实例，这时Ignite将在所有服务端节点创建和部署缓存：
```cpp
using namespace ignite;
using namespace cache;

IgniteConfiguration cfg;

// Start a node.
Ignite grid = Ignition::Start(cfg);

// Create cache with given name, if it does not exist.
Cache<int, std::string> cache = grid.GetOrCreateCache<int, std::string>("myNewCache");
```
::: tip XML配置
任何节点上的Ignite Spring XML配置中定义的所有缓存也将自动创建并部署在所有服务端上（无需在每个节点指定相同的配置）
:::
## 3.2.缓存操作
Ignite C++数据网格提供了一个易用且功能强大的API，支持如下的操作：

 - 基本缓存操作；
 - ConcurrentMap API；
 - 可插拔的持久化；
 - ACID事务；
 - 数据查询功能（包括SQL）。

### 3.2.1.Cache
可以直接从`Ignite`中获取`Cache<,>`的实例：
```cpp
using namespace ignite;
using namespace cache;

IgniteConfiguration cfg;

Ignite grid = Ignition::Start(cfg);

Cache<int, std::string> cache = grid.GetCache<int, std::string>("myCache");
```
泛型化的缓存提供了一种强类型和高性能的数据处理方式。

注意，泛型参数不会影响内部缓存表示，可以使用任意泛型参数处理相同的缓存。尝试获取不兼容类型的条目将抛出异常。
### 3.2.2.基本操作
下面是基本的原子化操作的示例：

Put&Get：
```cpp
using namespace ignite;
using namespace cache;

IgniteConfiguration cfg;

// Start a node.
Ignite grid = Ignition::Start(cfg);

// Get cache instance.
Cache<int, std::string> cache = grid.GetCache<int, std::string>("myCache");

// Store keys in cache (values will end up on different cache nodes).
for (int i = 0; i < 10; ++i)
{
    std::stringstream value;
    value << i;

    cache.Put(i, value.str());
}

for (int i = 0; i < 10; ++i)
  	std::cout << "Got [key=" << i << ", val=" << cache.Get(i) << "]";

```
原子化：
```cpp
// Put-if-absent which returns previous value.
std::string oldVal = cache.GetAndPutIfAbsent(11, "Hello");

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
## 3.3.缓存模式
Ignite C++提供了不同的缓存操作模式，可以通过Spring的XML配置文件对其进行配置，具体请参见Ignite的[分区和复制](/doc/java/Key-ValueDataGrid.md#_3-3-1-分区和复制)文档。
## 3.4.缓存查询
Ignite C++支持非常优雅的查询API，包括：

 - 基于谓词的扫描查询；
 - SQL查询；
 - 文本查询。

对于SQL查询，Ignite支持内存索引，因此所有数据查询都非常快。如果在堆外内存中缓存数据，那么查询索引也将存储在堆外内存中。

### 3.4.1.主要抽象
`Cache`有几个查询方法可用于执行查询和获取游标。

::: tip 关闭游标
一些游标有`GetAll()`方法，调用这些方法会自动关闭光标。
:::
### 3.4.2.扫描查询
扫描查询可以基于某些用户定义的谓词以分布式形式查询缓存：
```cpp
using namespace ignite;
using namespace cache;

IgniteConfiguration cfg;
Ignite grid = Ignition::Start(cfg);

Cache<int, std::string> cache = grid.GetOrCreateCache<int, std::string>("myCache");

// Create query and get a cursor.
QueryCursor<int, std::string> cursor = cache.Query(ScanQuery());

// Iterate over results.
while (cursor.HasNext())
  std::cout << cursor.GetNext().GetKey() << std::endl;
```
### 3.4.3.SQL查询
这部分内容在单独的[分布式SQL](/doc/cpp/DistributedSQL.md)中进行介绍。
### 3.4.4.文本查询
Ignite还支持基于Lucene索引的文本查询：
```cpp
using namespace ignite;
using namespace cache;

IgniteConfiguration cfg;
Ignite grid = Ignition::Start(cfg);

Cache<int, Person> cache = grid.GetOrCreateCache<int, Person>("myCache");

// Create query and get a cursor.
QueryCursor<int, Person> cursor = cache.Query(TextQuery("Person", "Master Degree"));

// Iterate over results.
while (cursor.HasNext())
  std::cout << entry.GetKey().GetNext() << std::endl;
```
### 3.4.5.使用QueryEntity对查询进行配置
通过`org.apache.ignite.cache.QueryEntity`还可以对索引和字段进行配置，这可以通过Spring方便地配置：
```xml
<bean class="org.apache.ignite.configuration.CacheConfiguration">
    <property name="name" value="mycache"/>
    <!-- Configure query entities -->
    <property name="queryEntities">
        <list>
            <bean class="org.apache.ignite.cache.QueryEntity">
                <property name="keyType" value="java.lang.Long"/>
                <property name="valueType" value="Person"/>

                <property name="fields">
                    <map>
                        <entry key="id" value="java.lang.Long"/>
                        <entry key="orgId" value="java.lang.Long"/>
                        <entry key="firstName" value="java.lang.String"/>
                        <entry key="lastName" value="java.lang.String"/>
                        <entry key="resume" value="java.lang.String"/>
                        <entry key="salary" value="java.lang.Double"/>
                    </map>
                </property>

                <property name="indexes">
                    <list>
                        <bean class="org.apache.ignite.cache.QueryIndex">
                            <constructor-arg value="id"/>
                        </bean>
                        <bean class="org.apache.ignite.cache.QueryIndex">
                            <constructor-arg value="orgId"/>
                        </bean>
                        <bean class="org.apache.ignite.cache.QueryIndex">
                            <constructor-arg value="salary"/>
                        </bean>
                    </list>
                </property>
            </bean>
        </list>
    </property>
</bean>
```
## 3.5.事务
Ignite支持两种类型的缓存操作，`事务`模式和`原子`模式，在`事务`模式中可以在一个事务中组合多个缓存操作，而`原子`模式支持多个原子性操作，一次一个。`原子`模式更轻量，通常比`事务`模式的性能更好。

不过，无论使用哪种模式，只要集群处于在线状态，不同节点之间的数据就必须保持一致，这意味着无论使用哪个节点来获取数据，都不会获得部分提交的数据或与其它数据不一致的数据。
### 3.5.1.Transactions
`Transactions`类包含用于启动和完成事务以及订阅监听器或获取指标数据的功能。
::: tip 跨缓存事务
可以将来自不同缓存的多个操作组合到一个事务中。注意，这允许在一个事务中更新不同类型（`分区`和`复制`）的缓存。
:::
通过如下方式可以获得`Transactions`的实例：
```cpp
Ignite ignite = Ignition::Get();

Transactions transactions = ignite.GetTransactions();
```
下面是在Ignite中处理事务的示例：
```cpp
Transaction tx = transactions.TxStart();

int hello = cache.Get("Hello");

if (hello == 1)
  cache.Put("Hello", 11);

cache.Put("World", 22);

tx.Commit();
```
### 3.5.2.2阶段提交（2PC）
Ignite在事务中使用了2阶段提交（2PC）的协议，但是只要适用也带有很多一阶段提交的优化。在一个事务中当数据更新时，在调用`commit()`方法之前，Ignite会在本地事务映射中保持事务状态，在这一点，只要需要，数据都会被传输到远程节点。

关于二阶段提交的工作方式，具体可以参照如下文章：

 - [Apache Ignite事务架构：2阶段提交协议](https://my.oschina.net/liyuj/blog/1626309)
 - [Apache Ignite事务架构：并发模型和隔离级别](https://my.oschina.net/liyuj/blog/1627248)
 - [Apache Ignite事务架构：故障和恢复](https://my.oschina.net/liyuj/blog/1791800)
 - [Apache Ignite事务架构：Ignite持久化的事务处理](https://my.oschina.net/liyuj/blog/1793912)
 - [Apache Ignite事务架构：第三方持久化的事务处理](https://my.oschina.net/liyuj/blog/1796152)

::: tip ACID完整性
Ignite提供了完整的ACID（原子性，一致性，隔离性和持久性）兼容事务来确保一致性。
:::

### 3.5.3.并发模型和隔离级别
当原子化模式配置为`事务`时，Ignite支持`乐观`和`悲观`的**事务并发模型**。并发模型决定了何时（在访问数据时或者在`prepare`阶段）获得一个条目级的事务锁。锁定可以防止对一个对象的并发访问。比如，当试图用悲观锁更新一个ToDo列表项时，服务端会在该对象上置一个锁，在提交或者回滚该事务之前，其它的事务或者操作都无法更新同一个条目。不管在一个事务中使用哪种并发模型，在提交之前都存在事务中的所有条目被锁定的时刻。

**隔离级别**定义了并发事务如何"看"以及处理针对同一个键的操作。Ignite支持`读提交`、`可重复读`、`可序列化`隔离级别。并发模型和隔离级别的所有组合都是可以同时使用的，下面是描述Ignite提供的每一个并发-隔离组合的行为和保证。
### 3.5.4.悲观事务
在`悲观`事务中，锁是在第一次读或者写访问期间获得（取决于隔离级别）然后被事务持有直到其被提交或者回滚。该模式中，锁首先在主节点获得然后在准备阶段提升至备份节点。下面的隔离级别可以配置为`悲观`并发模型：

 - `读提交`：数据被无锁地读取并且不会被事务本身缓存。如果缓存配置允许，数据是可能从一个备份节点中读取的。在这个隔离级别中，可以有所谓的非可重复读，因为当在自己的事务中读取数据两次时，一个并发事务可以改变该数据。锁只有在第一次写访问时才会获得。这意味着事务中已经读取的一个条目在该事务提交时可能有一个不同的值，这种情况是不会抛出异常的；
 - `可重复读`：获得条目锁以及第一次对主节点的读/写访问并获得数据后，就会存储在本地事务映射中。之后对同一数据的所有连续访问都是本地化的，并且返回最后一次读或者被更新的事务值。这意味着没有其它的并发事务可以改变锁定的数据，这样就获得了事务的可重复读；
 - `可序列化`：在`悲观`模式中，这个隔离级别与`可重复读`是一样的工作方式。

注意，在`悲观`模式中，锁的顺序是很重要的。此外，Ignite可以按照用户提供的顺序依次并且准确地获得锁。

::: warning 性能考量
设想拓扑中有三个节点（A、B、C），并且在事务中针对键[1, 2, 3, 4, 5, 6]执行一个`putAll`。假定这些键以如下形式映射到节点：{A: 1, 4}, {B: 2, 5}, {C: 3, 6}，因为Ignite在`悲观`模式中无法改变获得锁的顺序，它会产生6次连续地网络往返：[A, B, C, A, B, C]。在键的锁定顺序对于一个事务的语义不重要的情况下，将键按照分区进行分组然后将在一个分区的键一起锁定是明智的。这在一个大的事务中可以显著地降低网络消息的数量。在这个示例中，如果对于一个`putAll`键按照如下的方式排序：[1, 4, 2, 5, 3, 6]，之后只需要3次的连续网络访问。
:::
::: danger 拓扑变化约束
注意，如果至少获得一个`悲观`事务锁，在事务被提交或者回滚之前，都不可能改变缓存的拓扑，因此，不建议长时间地持有事务锁。
:::
### 3.5.5.悲观事务死锁检测
当处理分布式悲观事务时必须要遵守的主要规则是参与一个事务的键的锁，必须按照同样的顺序获得，违反这个规则就可能导致分布式死锁。

Ignite无法避免分布式死锁，而是有一个内建的功能来使调试和解决这个问题更容易。

就像下面的代码片段所示，一个带有超时时间的事务启动后，如果过了超时时间，死锁检测过程就会试图查找一个触发这个超时的可能的死锁。当超过超时时间时，会抛出`TransactionTimeoutException`并且像触发`CacheException`那样传播到应用层而不会管死锁。不过，如果检测到了一个死锁，返回的`TransactionTimeoutException`的cause会是`TransactionDeadlockException`（至少一个事务涉及死锁），在Ignite C++中，这些错误将作为`IgniteError`进行传播。
```cpp
try {
	Transaction tx = ignite.GetTransactions().TxStart(
    TransactionConcurrency::PESSIMISTIC, TransactionIsolation::READ_COMMITTED, 300, 0);

	cache.Put(1, 1);
	cache.Put(2, 1);

	tx.Commit();
}
catch (IgniteError e) {
  std::cout << e.GetText() << std::endl;
}
```
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
::: tip 注意
如果想彻底避免死锁，可以看下面的乐观事务和无死锁事务章节。
:::
### 3.5.6.乐观事务
在`乐观`事务中，条目锁是在二阶段提交的`准备`阶段从主节点获得的，然后提升至备份节点，该锁在事务提交时被释放。如果用户回滚事务没有试图做提交，是不会获得锁的。下面的隔离级别可以与`乐观`并发模型配置在一起。

 - `读提交`：应该作用于缓存的改变是在源节点上收集的，然后事务提交后生效。事务数据无锁地读取并且不会在事务中缓存。如果缓存配置允许，该数据是可能从备份节点中读取的。在这个隔离级别中，可以有一个所谓的不可重复读，因为在自己的事务中读取数据两次时另一个事务可以修改数据。这个模式组合在第一次读/写操作后如果条目值被修改是不会做校验的，并且不会抛出异常；
 - `可重复读`：这个隔离级别的事务的工作方式类似于`乐观`的`读提交`事务，只有一个不同-读取值缓存于源节点并且所有的后续读保证都是本地化的。这个模式组合在第一次读/写操作后如果条目值被修改是不会做校验的，并且不会抛出异常;
 - `可序列化`：在第一次读访问之后会存储一个条目的版本，如果Ignite引擎检测到发起事务中的条目只要有一个被修改，Ignite就会在提交阶段放弃该事务，这是在提交阶段对网格内的事务中记载的条目的版本进行内部检查实现的。简而言之，这意味着Ignite如果在一个事务的提交阶段检测到一个冲突，就会放弃这个事务并且抛出`TransactionOptimisticException`异常，在Ignite C++中，这是以`IgniteError`的形式传播的，然后回滚已经做出的任何改变，开发者应该处理这个异常并且重试该事务。
```cpp
IgniteTransactions txs = ignite.GetTransactions();

// Start transaction in optimistic mode with serializable isolation level.
while (true) {
    try {
      Transaction tx = txs.TxStart(TransactionConcurrency::OPTIMISTIC,
                                   TransactionIsolation::SERIALIZABLE);

  		// Modify cache entires as part of this transacation.
  		....

  		// Commit transaction.
  		tx.Commit();

      // Transaction succeeded. Leave the while loop.
      break;
    }
    catch (IgniteError e) {
    	// Transaction has failed. Retry.
    }
}
```
这里另外一个需要注意的要点是，即使一个条目只是简单地读取（没有修改，`cache.put(...)`），一个事务仍然可能失败，因为该条目的值对于发起事务中的逻辑很重要。

注意，对于`读提交`和`可重复读`事务，键的顺序是很重要的，因为这些模式中锁也是按顺序获得的。
### 3.5.7.无死锁事务
对于`乐观`的`可序列化`事务，锁不是按顺序获得的。该模式中键可以按照任何顺序访问，因为事务锁是通过一个额外的检查以并行的方式获得的，这使得Ignite可以避免死锁。

这里需要引入几个概念来描述`可序列化`的事务锁是如何工作的。Ignite中的每个事务都会被赋予一个叫做`XidVersion`的可比较的版本号，事务提交时该事务中修改的每个条目都会被赋予一个叫做`EntryVersion`的新的版本号，一个版本号为`XidVersionA`的`乐观可序列化`事务在如下情况下会抛出`TransactionOptimisticException`异常而失败：

 - 有一个进行中的`悲观`的或者非可序列化`乐观`事务在`可序列化`事务中的一个条目上持有了一个锁；
 - 有另外一个进行中的版本号为`XidVersionB`的`乐观可序列化`事务，在`XidVersionB > XidVersionA`时以及这个事务在`可序列化`事务中的一个条目上持有了一个锁；
 - 在该`乐观可序列化`事务获得所有必要的锁时，存在在提交之前的版本与当前版本不同的条目；

::: tip 注意
在一个高并发环境中，乐观锁可能导致一个很高的事务失败率。但是悲观锁如果锁被事务以一个不同的顺序获得可能导致死锁。
不过在一个同质化的环境中，乐观可序列化锁对于大的事务可能提供更好的性能，因为网络交互的数量只取决于事务相关的节点的数量，而不取决于事务中的键的数量。
:::
### 3.5.8.原子化模式
Ignite支持两种原子化模式：

 - `TRANSACTIONAL`
 - `ATOMIC`

`TRANSACTIONAL`模式完全支持ACID事务，不过如果只需要原子语义，还是建议使用`ATOMIC`模式，因为性能更好。

`ATOMIC`模式通过避免事务锁提供了更好的性能，同时仍提供数据原子性和一致性。`ATOMIC`模式的另一个区别是批量写，例如`PutAll(...)`和`RemoveAll(...)`方法不在一个事务中执行，并且可以部分失败。

::: tip 性能
注意，只要使用`ATOMIC`模式，就会禁用事务，这样可以在不需要事务时实现更高的性能和吞吐量。
:::
### 3.5.9.配置
原子化模式可以通过`CacheConfiguration`的`atomicityMode`属性进行配置，默认值为`ATOMIC`：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    ...
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
          <!-- Set a cache name. -->
   				<property name="name" value="myCache"/>

           <!-- Set atomicity mode, can be ATOMIC or TRANSACTIONAL. -->
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
## 3.6.持续查询
### 3.6.1.持续查询
通过持续查询，可以监听Ignite缓存上发生的数据变化。启动持续查询后，如果有，会收到有关查询过滤器中所有数据变更的通知。

持续查询功能可通过`ContinuousQuery`获得，下面会详述。

#### 3.6.1.1.初始化查询

当要执行持续查询时，在将持续查询注册在集群中以及开始接收更新之前，可以有选择地指定一个初始化查询。

初始化查询可以通过`Cache.QueryContinuous(Query)`方法进行设置，并且可以是任意查询类型，包括扫描查询，SQL查询和文本查询。

#### 3.6.1.2.远程过滤器

这个过滤器在给定键对应的主和备节点上执行，然后评估更新是否需要作为一个事件传播给该查询的本地监听器。

如果过滤器返回`true`，那么本地监听器就会收到通知，否则事件会被忽略。产生更新的特定主和备节点，会在主/备节点以及应用端执行的本地监听器之间，减少不必要的网络流量。

下面是自定义过滤器的一个示例：
```cpp
// User-defined filter class.
template<typename K, typename V>
struct RangeFilter : CacheEntryEventFilter<K, V>
{
    RangeFilter() :
      rangeBegin(0), rangeEnd(0) { }

    RangeFilter(const K& from, const K& to) :
      rangeBegin(from), rangeEnd(to) { }

    virtual ~RangeFilter() { }

    // Event callback. Should be defined for any filter.
    virtual bool Process(const CacheEntryEvent<K, V>& event)
    {
        return event.GetKey() >= rangeBegin && event.GetKey() < rangeEnd;
    }

    // Beginning of the range.
    K rangeBegin;

    // End of the range.
    K rangeEnd;
};
```
远程过滤器的实例，可以通过`ContinuousQuery`类的构造器进行配置。

由于过滤器实现可以在随机节点上执行，因此要确保在所有节点上使用`IgniteBinding::RegisterCacheEntryEventFilter()`方法注册过滤器，这可以通过调用`Ignite::GetBinding()`方法，或在节点启动时调用`IGNITE_EXPORTED_CALL void IgniteModuleInit(ignite::IgniteBindingContext&)`方法来完成：
```cpp
// This callback called by Ignite on node startup and could be
// used to register code, that needs to be called remotely.
IGNITE_EXPORTED_CALL void IgniteModuleInit(ignite::IgniteBindingContext& context)
{
    IgniteBinding binding = context.GetBingding();

    binding.RegisterCacheEntryEventFilter< RangeFilter<int, TestEntry> >();
}

// Alternatively you can register it manually.
// Note, that you should only register every user class once, so choose one method.
void SomeUserFunction()
{
  //...
  Ignite node = Ignition::Get("SomeNode");
  IgniteBinding binding = node.GetBingding();
  binding.RegisterCacheEntryEventFilter< RangeFilter<int, TestEntry> >();
  //...
}
```
#### 3.6.1.3.本地监听器

当缓存被修改时（一个条目被插入、更新或者删除），更新对应的事件就会发送给持续查询的本地监听器，之后应用就可以做出对应的反应。

下面是监听器的示例：
```cpp
// User-defined listener class.
template<typename K, typename V>
class Listener : public CacheEntryEventListener<K, V>
{
public:
    Listener() { }

    // Callback that is executed locally when an notification is received.
    virtual void OnEvent(const CacheEntryEvent<K, V>* evts, uint32_t num)
    {
        for (uint32_t i = 0; i < num; ++i)
            std::cout << "key=" << evts[i].GetKey()
                      << ", val=" << evts[i].GetValue()
                      << std::endl;
    }
};
```

可以通过`ContinuousQuery.SetListener(Reference<CacheEntryEventListener<K, V>>)`方法设置本地监听器或将其传递给`ContinuousQuery`的构造函数，如下所示：
```cpp
// Creating a listener.
Listener<int32_t, std::string> lsnr;

// Creating a filter. We are only insterested in entries with
// keys in range [5, 10), i.e. {5, 6, 7, 8, 9}.
RangeFilter<int32_t, std::string> filter(5, 10);

// Getting the cache.
Cache<int32_t, std::string> cache =
  ignite.GetCache<int32_t, std::string>("mycache");

// Instantiating a continuous query. Passing a copy of the listener.
ContinuousQuery<int32_t, std::string> qry(
  MakeReferenceFromCopy(lsnr), MakeReferenceFromCopy(filter));

// Setting an optional initial query.
// The initial query will return all the entries that are in the cache.
ContinuousQueryHandle<int32_t, std::string> handle =
  cache.QueryContinuous(qry, ScanQuery());

QueryCursor<int32_t, std::string> cursor = handle.GetInitialQueryCursor();

// Iterating over the initial's query result set.
while (cursor.HasNext())
{
  CacheEntry<int32_t, std::string> e = cursor.GetNext();

  std::cout << "key=" << e.GetKey()
    << ", val=" << e.GetValue()
    << std::endl;
}

// Adding a few more cache entries.
// As a result, the local listener above will be called.
for (int32_t i = 0; i < 15; ++i)
{
  std::stringstream converter;
  converter << i;

  cache.Put(i, converter.str());
}
```
有关`ignite::Reference`类的详细信息，可以参见上面的[对象生命周期](/doc/cpp/#_1-6-对象生命周期)文档。
### 3.6.2.事件传递保证
持续查询的实现会明确地保证，一个事件只会传递给客户端的本地监听器一次。

因为除了主节点，在每个备份节点维护一个更新队列是可行的。如果主节点故障或者由于某些其它原因拓扑发生了改变，之后每个备份节点会刷新它的内部队列的内容给客户端，确保事件都会被传递给客户端的本地监听器。

为了避免重复通知，当所有的备份节点都刷新它们的队列给客户端时，Ignite会为每个分区维护一个更新计数器。当某个分区的一个条目已经更新，这个分区的计数器在主节点和备份节点都会增加。这个计数器的值会和事件通知一起发给客户端，该客户端还维护该映射的副本。如果客户端收到了一个更新，对应的计数小于它的本地映射，这个更新会被视为重复的然后被忽略。

一旦客户端确认一个事件已经收到，主节点和备份节点会从它们的备份队列中删除该事件的记录。
### 3.6.3.示例
Ignite的发行版附带一个有关持续查询用法的完整示例，名为`continuous_query_example.cpp`，相关的代码在[GitHub](https://github.com/apache/ignite/blob/master/modules/platforms/cpp/examples/continuous-query-example/src/continuous_query_example.cpp)上也有。
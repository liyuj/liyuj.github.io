# 3.键-值数据网格
## 3.1.数据网格
Ignite针对越来越火的水平扩展概念而构建，具有实时按需增加节点的能力。它可以支持线性扩展到几百个节点，通过数据位置的强语义以及数据关系路由来降低冗余数据噪声。

Ignite数据网格是一个`基于内存的分布式键值存储`，它可以视为一个分布式的分区化哈希，每个集群节点都持有所有数据的一部分，这意味着随着集群节点的增加，就可以缓存更多的数据。
![](https://files.readme.io/58ec82e-data_grid.png)
与其它键值存储系统不同，Ignite通过可插拔的哈希算法来决定数据的位置，每个客户端都可以通过一个加入一个哈希函数决定一个键属于哪个节点，而不需要任何特定的映射服务器或者name节点。

Ignite数据网格支持本地、复制的、分区化的数据集，允许使用标准SQL语法方便地进行跨数据集查询，同时还支持在数据中进行分布式SQL关联。

Ignite数据网格轻量快速，是目前在集群中支持数据的事务性和原子性的最快的实现之一。

`数据一致性`
只要集群仍然处于活动状态，即使节点崩溃或者网络拓扑发生变化，Ignite都会保证不同集群节点中的数据的一致性。

`JCache (JSR107)`
Ignite实现了`JCache`(JSR107)规范。

## 3.2.超越JCache
### 3.2.1.摘要
Ignite是**JCache(JSR107)**规范的一个实现，JCache为数据访问提供了简单易用且功能强大的API。不过规范忽略了任何有关数据分布以及一致性的细节来允许开发商在自己的实现中有足够的自由度。

可以通过JCache实现：

 - 基本缓存操作
 - ConcurrentMap API
 - 并行处理(EntryProcessor)
 - 事件和度量
 - 可插拔的持久化

在JCache之外，Ignite还提供了ACID事务，数据查询的能力(包括SQL)，各种内存模型等。

### 3.2.2.IgniteCache
`IgniteCache`接口是Ignite缓存实现的一个入口，提供了保存和获取数据，执行查询，包括SQL，迭代和扫描等等的方法。
`IgniteCache`是基于**JCache(JSR107)**的，所以在非常基本的API上可以减少到`javax.cache.Cache`接口，不过`IgniteCache`还提供了JCache规范之外的、有用的功能，比如数据加载，查询，异步模型等。
可以从`Ignite`中直接获得`IgniteCache`的实例：
```java
Ignite ignite = Ignition.ignite();

// Obtain instance of cache named "myCache".
// Note that different caches may have different generics.
IgniteCache<Integer, String> cache = ignite.cache("myCache");
```
**动态缓存**
也可以动态地创建缓存的一个实例，这时，Ignite会在所有的符合条件的集群成员中创建和部署该缓存。一个动态缓存启动后，它也会自动的部署到新加入的符合条件的节点上。
```java
Ignite ignite = Ignition.ignite();

CacheConfiguration cfg = new CacheConfiguration();

cfg.setName("myCache");
cfg.setAtomicityMode(TRANSACTIONAL);

// Create cache with given name, if it does not exist.
IgniteCache<Integer, String> cache = ignite.getOrCreateCache(cfg);
```

> **XML配置**
在任意的缓存节点上定义的基于Spring的XML配置的所有缓存同时会自动地在所有的集群节点上创建和部署（不需要在每个集群节点上指定同样的配置）。

### 3.2.3.基本操作
下面是一些JCache基本原子操作的例子：
Put和Get：
```java
try (Ignite ignite = Ignition.start("examples/config/example-cache.xml")) {
    IgniteCache<Integer, String> cache = ignite.cache(CACHE_NAME);
 
    // Store keys in cache (values will end up on different cache nodes).
    for (int i = 0; i < 10; i++)
        cache.put(i, Integer.toString(i));
 
    for (int i = 0; i < 10; i++)
        System.out.println("Got [key=" + i + ", val=" + cache.get(i) + ']');
}
```
原子操作：
```java
// Put-if-absent which returns previous value.
Integer oldVal = cache.getAndPutIfAbsent("Hello", 11);
  
// Put-if-absent which returns boolean success flag.
boolean success = cache.putIfAbsent("World", 22);
  
// Replace-if-exists operation (opposite of getAndPutIfAbsent), returns previous value.
oldVal = cache.getAndReplace("Hello", 11);
 
// Replace-if-exists operation (opposite of putIfAbsent), returns boolean success flag.
success = cache.replace("World", 22);
  
// Replace-if-matches operation.
success = cache.replace("World", 2, 22);
  
// Remove-if-matches operation.
success = cache.remove("Hello", 1);
```
>**死锁**
如果批量（比如`IgniteCache#putAll`, `IgniteCache#invokeAll`等）操作以并行方式执行，那么键应该是有序的，以避免死锁，建议使用`TreeMap`而不是`HashMap`以保证一致性、有序性，注意这个对于`原子化`和`事务化`缓存都是一样的。

### 3.2.4.EntryProcessor
当在缓存中执行`puts`和`updates`操作时，通常需要在网络中发送完整的状态数据，而`EntryProcessor`可以直接在主节点上处理数据，只需要传输增量数据而不是全量数据。

此外，可以在`EntryProcessor`中嵌入自定义逻辑，比如，获取之前缓存的数据然后加1。

Java8：
```java
IgniteCache<String, Integer> cache = ignite.cache("mycache");

// Increment cache value 10 times.
for (int i = 0; i < 10; i++)
  cache.invoke("mykey", (entry, args) -> {
    Integer val = entry.getValue();

    entry.setValue(val == null ? 1 : val + 1);

    return null;
  });
```
Java7：
```java
IgniteCache<String, Integer> cache = ignite.jcache("mycache");

// Increment cache value 10 times.
for (int i = 0; i < 10; i++)
  cache.invoke("mykey", new EntryProcessor<String, Integer, Void>() {
    @Override 
    public Object process(MutableEntry<Integer, String> entry, Object... args) {
      Integer val = entry.getValue();

      entry.setValue(val == null ? 1 : val + 1);

      return null;
    }
  });
```
>**原子性**：
`EntryProcessor`通过给键加锁以原子性方式执行。

### 3.2.5.异步支持
和Ignite中的所有API一样，`IgniteCache`实现了`IgniteAsynchronousSupport`接口，因此可以以异步的方式使用。
```java
// Enable asynchronous mode.
IgniteCache<String, Integer> asyncCache = ignite.cache("mycache").withAsync();

// Asynhronously store value in cache.
asyncCache.getAndPut("1", 1);

// Get future for the above invocation.
IgniteFuture<Integer> fut = asyncCache.future();

// Asynchronously listen for the operation to complete.
fut.listenAsync(f -> System.out.println("Previous cache value: " + f.get()));
```
### 3.2.6.将Ignite作为JCache提供者
如果创建缓存实例时使用JCache管理器，JCache可以接受一个特定的提供者配置。如果从另一个JCache实现上移植，在不修改已有代码的前提下，就可以利用Ignite提供的分布式缓存的优势。

下面是使用JCache管理器时，如何进行Ignite缓存配置的示例：
```java
// Get or create a cache manager.
CacheManager cacheMgr = Caching.getCachingProvider().getCacheManager();

// This is an Ignite configuration object (org.apache.ignite.configuration.CacheConfiguration).
CacheConfiguration<Integer, String> cfg = new CacheConfiguration<>();

// Specify cache mode and/or any other Ignite-specific configuration properties.
cfg.setCacheMode(CacheMode.PARTITIONED);

// Create a cache based on the configuration created above.
Cache<Integer, String> cache = cacheMgr.createCache("aCache", cfg);

// Cache operations
Integer key = 1;
String value = "11";
cache.put(key, value");
System.out.println(cache.get(key));
```
另外，`CachingProvider.getCacheManager(..)`方法可以接受一个特定的URI，它指向一个Ignite的xml格式配置文件，比如：
```java
// Get or create a cache manager.
CacheManager cacheMgr = Caching.getCachingProvider().getCacheManager(
  Paths.get("path/to/ignite/xml/configuration/file").toUri(), null);

// Get a cache defined in the configuration file provided above.
Cache<Integer, String> cache = cacheMgr.getCache("myCache");

// Cache operations
Integer key = 1;
String value = "11";
cache.put(key, value");
System.out.println(cache.get(key));
```
注意，上述的`Cache<K, V>`实例只支持`javax.cache.Cache`类型。

要使用Ignite提供的扩展功能，比如SQL、扫描或者持续查询，需要将`javax.cache.Cache`实例转换成`IgniteCache`实例，这样的：
```java
// Get or create a cache manager.
CacheManager cacheMgr = Caching.getCachingProvider().getCacheManager(
  Paths.get("path/to/ignite/xml/configuration/file").toUri(), null);

// Get a cache defined in the configuration file provided above.
Cache<Integer, String> cache = cacheMgr.getCache("myCache");

// Obtain org.apache.ignite.IgniteCache instance.
IgniteCache igniteCache = (IgniteCache) cache;

// Ignite specific cache operations
//......
```
## 3.3.分区和复制
### 3.3.1.摘要
Ignite提供了三种不同的缓存操作模式，`分区`、`复制`和`本地`。缓存模型可以为每个缓存单独配置，缓存模型是通过`CacheMode`枚举定义的。
>**数据分区内部实现**
如果想了解Ignite分区的内部实现，以及再平衡的工作机制，可以看这个[Wiki页面](https://cwiki.apache.org/confluence/display/IGNITE/%28Partition+Map%29+Exchange+-+under+the+hood)。

### 3.3.2.分区模式
`分区`模式是扩展性最好的分布式缓存模式，这种模式下，所有数据被均等地分布在分区中，所有的分区也被均等地拆分在相关的节点中，实际上就是为缓存的数据创建了一个巨大的内存内分布式存储。这个方式可以在所有节点上只要匹配总可用存储(内存和磁盘)就可以存储尽可能多的数据，因此，可以在集群的所有节点的内存中可以存储TB级的数据。也就是说，只要有足够多的节点，就可以存储足够多的数据。

与`复制`模式不同，它更新是很昂贵的，因为集群内的每个节点都需要更新，而`分区`模式更新就很廉价，因为对于每个键只需要更新一个主节点（可选择一个或者多个备份节点），不过读取变得较为昂贵，因为只有特定节点才持有缓存的数据。

为了避免额外的数据移动，总是访问恰好缓存有要访问的数据的节点是很重要的，这个方法叫做*关系并置*，当工作在分区化缓存时强烈建议使用。

> 分区化缓存适合于数据量很大而更新频繁的场合。

下图简单描述了一下一个分区缓存，实际上，键A赋予了运行在JVM1上的节点，B赋予了运行在JVM3上的节点，等等。
![3.3.2](https://files.readme.io/egtolRvXRdqIWEQWP940_partitioned_cache.png)

下面的配置章节显示了如何配置缓存模式的例子。

### 3.3.3.复制模式
`复制`模式中，所有数据都被复制到集群内的每个节点，因为每个节点都有效所以这个缓存模式提供了最大的数据可用性。不过这个模式每个数据更新都要传播到其它所有节点，因而会对性能和可扩展性产生影响。

Ignite中，*复制缓存*的实现类似于*分区缓存*，每个键都有一个主拷贝而且在集群内的其它节点也会有备份。比如下图中，对于键A，运行于JVM1的节点为主节点，但是同时它还存储了其它数据的拷贝（B、C、D）。
![3.3.3](https://files.readme.io/0yOEFydERAyggehGP75B_replicated_catche_8_sm.png)
因为相同的数据被存储在所有的集群节点中，复制缓存的大小受到节点的有效存储（内存和磁盘）的限制。这个模式适用于读缓存比写缓存频繁的多而且数据集较小的场景，如果应用超过80%的时间用于查找缓存，那么就要考虑使用`复制`缓存模式了。

> 复制缓存适用于数据集不大而且更新不频繁的场合。

### 3.3.4.本地模式
`本地`模式是最轻量的模式，因为没有数据被分布化到其它节点。它适用于或者数据是只读的，或者需要定期刷新的场景中。当缓存数据失效需要从持久化存储中加载数据时，它也可以工作与`通读`模式。除了分布化以外，本地缓存包括了分布式缓存的所有功能，比如自动数据回收，过期，磁盘交换，数据查询以及事务。

### 3.3.5.配置
缓存可以每个缓存分别配置，通过设置`CacheConfiguration`的`cacheMode`属性实现：
XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  	...
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            <!-- Set a cache name. -->
            <property name="name" value="cacheName"/>
            <!-- Set cache mode. -->
            <property name="cacheMode" value="PARTITIONED"/>
            <!-- Other cache configurations. -->
            ... 
        </bean>
    </property>
</bean>
```
Java:
```java
CacheConfiguration cacheCfg = new CacheConfiguration("myCache");

cacheCfg.setCacheMode(CacheMode.PARTITIONED);

IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setCacheConfiguration(cacheCfg);

// Start Ignite node.
Ignition.start(cfg);
```
## 3.4.主节点和备份副本
### 3.4.1.摘要
在`分区`模式下，赋予键的节点叫做这些键的主节点，对于缓存的数据，也可以有选择地配置任意多个备份节点。如果副本数量大于0，那么Ignite会自动地为每个独立的键赋予备份节点，比如，如果副本数量为1，那么数据网格内缓存的每个键都会有2个备份，一主一备。

> 因为性能原因备份默认是被关闭的。

### 3.4.2.配置备份
备份可以通过`CacheConfiguration`的`backups`属性进行配置，像下面这样：
XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    ...
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            <!-- Set a cache name. -->
            <property name="name" value="cacheName"/>
          
            <!-- Set cache mode. -->
            <property name="cacheMode" value="PARTITIONED"/>
            
            <!-- Number of backup nodes. -->
            <property name="backups" value="1"/>
            ... 
        </bean>
    </property>
</bean>
```
Java：
```java
CacheConfiguration cacheCfg = new CacheConfiguration();

cacheCfg.setName("cacheName");

cacheCfg.setCacheMode(CacheMode.PARTITIONED);

cacheCfg.setBackups(1);

IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setCacheConfiguration(cacheCfg);

// Start Ignite node.
Ignition.start(cfg);
```
### 3.4.3.同步和异步备份
`CacheWriteSynchronizationMode`枚举可以用来配置主节点和备份部分的同步和异步更新。同步写模式告诉Ignite在完成写或者提交之前客户端节点是否要等待来自远程节点的响应。

同步写模式可以设置为下面的三种之一：

|同步写模式|描述|
|---|---|
|`FULL_SYNC`|客户端节点要等待所有相关远程节点的写入或者提交完成（主和备）。|
|`FULL_ASYNC`|这种情况下，客户端不需要等待来自相关节点的响应。这时远程节点会在获得它们的状态在任意的缓存写操作完成或者`Transaction.commit()`方法调用完成之后进行小幅更新。|
|`PRIMARY_SYNC`|这是**默认**模式，客户端节点会等待主节点的写或者提交完成，但不会等待备份节点的更新完成。|

>**缓存数据一致性**
注意不管那种写同步模式，在使用事务时缓存数据都会保持在所有相关节点上的完整一致性。

写同步模式可以通过`CacheConfiguration`的`writeSynchronizationMode`属性进行配置，像下面这样：
XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    ...
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            <!-- Set a cache name. -->
            <property name="name" value="cacheName"/>
          
            <!-- Set write synchronization mode. -->
            <property name="writeSynchronizationMode" value="FULL_SYNC"/>       
            ... 
        </bean>
    </property>
</bean>
```
Java：
```java
CacheConfiguration cacheCfg = new CacheConfiguration();

cacheCfg.setName("cacheName");

cacheCfg.setWriteSynchronizationMode(CacheWriteSynchronizationMode.FULL_SYNC);

IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setCacheConfiguration(cacheCfg);

// Start Ignite node.
Ignition.start(cfg);
```
## 3.5.近缓存
分区化的缓存也可以通过`近`缓存前移，它是一个较小的本地缓存，可以用来存储最近或者最频繁访问的数据。和分区缓存一样，可以控制近缓存的大小以及回收策略。

近缓存可以通过在`Ignite.createNearCache(NearConfiguration)`中传入`NearConfiguration`或者通过调用`Ignite.getOrCreateNearCache(NearConfiguration)`方法在*客户端节点*直接创建。使用`Ignite.getOrCreateCache(CacheConfiguration, NearCacheConfiguration)`，可以在动态启动一个分布式缓存的同时为其创建一个近缓存。

Java：
```java
// Create near-cache configuration for "myCache".
NearCacheConfiguration<Integer, Integer> nearCfg = 
    new NearCacheConfiguration<>();

// Use LRU eviction policy to automatically evict entries
// from near-cache, whenever it reaches 100_000 in size.
nearCfg.setNearEvictionPolicy(new LruEvictionPolicy<>(100_000));

// Create a distributed cache on server nodes and 
// a near cache on the local node, named "myCache".
IgniteCache<Integer, Integer> cache = ignite.getOrCreateCache(
    new CacheConfiguration<Integer, Integer>("myCache"), nearCfg);
```
在大多数情况下，只要用了Ignite的关系并置，近缓存就不应该用了。如果计算与相应的分区化缓存节点是并置的，那么近缓存也不需要了，因为所有数据只在分区缓存的本地才有效。但是，有时没有必要将计算任务发送给远端节点，比如近缓存可以显著提升可扩展性或者提升应用的整体性能的场景。

>**事务**
近缓存是完全事务性的，当服务端的数据发生改变时会自动地获得更新或者失效。
**服务端节点的近缓存**
每当以一个非托管的方式从服务器端的`分区`缓存中访问数据时，都需要通过`CacheConfiguration.setNearConfiguration(...)`方法在服务端节点上配置近缓存。

### 3.5.1.配置
`CacheConfiguration`中与近缓存有关的大部分参数都会继承于服务端的配置，比如，如果服务端缓存有一个`ExpiryPolicy`，近缓存中的条目也会基于同样的策略。

下表中列出的参数是不会从服务端配置中继承的，是通过`NearCacheConfiguration`对象单独提供的：

|setter方法|描述|默认值|
|---|---|---|
|setNearEvictionPolicy(CacheEvictionPolicy)|近缓存回收策略|无|
|setNearStartSize(int)|缓存初始大小|375,000|

## 3.6.缓存查询
### 3.6.1.摘要
Ignite提供了非常优雅的查询API，支持基于谓词的扫描查询、SQL查询（ANSI-99兼容）、文本查询。对于SQL查询，Ignite提供了内存索引，因此所有的数据检索都是非常快的。

Ignite也通过`IndexingSpi`和`SpiQuery`类提供对自定义索引的支持。
### 3.6.2.主要的抽象
`IgniteCache`有若干个查询方法，这些方法可以获得一些`Query`的子类以及返回`QueryCursor`。

**查询**
`Query`抽象类表示一个在分布式缓存上执行的抽象分页查询。可以通过`Query.setPageSize(...)`方法设置返回游标的每页大小（默认值是`1024`）。

**查询游标**
`QueryCursor`表示查询的结果集，可以透明地进行一页一页地迭代。每当迭代到每页的最后时，会自动地在后台请求下一页的数据，当不需要分页时，可以使用`QueryCursor.getAll()`方法，它会获得整个查询结果集然后存储在集合里。

> **关闭游标**
如果调用了`QueryCursor.getAll()`方法，游标会自动关闭。如果通过for循环迭代一个游标或者显式地获得`Iterator`，必须显式地关闭或者使用` AutoCloseable`语法。

### 3.6.3.扫描查询
扫描查询可以通过用户定义的谓词以分布式的形式进行缓存的查询。
Java8：
```java
IgniteCache<Long, Person> cache = ignite.cache("mycache");

// Find only persons earning more than 1,000.
try (QueryCursor cursor = cache.query(new ScanQuery((k, p) -> p.getSalary() > 1000)) {
  for (Person p : cursor)
    System.out.println(p.toString());
}
```
Java7:
```java
IgniteCache<Long, Person> cache = ignite.cache("mycache");

// Find only persons earning more than 1,000.
IgniteBiPredicate<Long, Person> filter = new IgniteBiPredicate<>() {
  @Override public boolean apply(Long key, Perons p) {
    return p.getSalary() > 1000;
  }
};

try (QueryCursor cursor = cache.query(new ScanQuery(filter)) {
  for (Person p : cursor)
    System.out.println(p.toString());
}
```
扫描查询还支持可选的转换器闭包，它可以在服务端节点在将数据发送到客户端之前对其进行转换。这个很有用，比如，当只是希望从一个大的对象获取少量字段时，这样可以最小化网络的数据传输量，下面的示例显示了如何只获取对象的键，而不发送对象的值。

Java8:
```java
IgniteCache<Long, Person> cache = ignite.cache("mycache");

// Get only keys for persons earning more than 1,000.
List<Long> keys = cache.query(new ScanQuery<Long, Person>(
    (k, p) -> p.getSalary() > 1000), // Remote filter.
    Cache.Entry::getKey              // Transformer.
).getAll();
```
Java7：
```java
IgniteCache<Long, Person> cache = ignite.cache("mycache");

// Get only keys for persons earning more than 1,000.
List<Long> keys = cache.query(new ScanQuery<>(
    // Remote filter.
    new IgniteBiPredicate<Long, Person>() {
        @Override public boolean apply(Long k, Person p) {
            return p.getSalary() > 1000;
        }
    }),
    // Transformer.
    new IgniteClosure<Cache.Entry<Long, Person>, Long>() {
        @Override public Long apply(Cache.Entry<Long, Person> e) {
            return e.getKey();
        }
    }
).getAll();
```
### 3.6.4.SQL查询
Ignite的SQL查询请参照SQL网格的相关章节。
### 3.6.5.文本查询
Ignite也支持通过Lucene索引实现的基于文本的查询。

文本查询：
```java
IgniteCache<Long, Person> cache = ignite.cache("mycache");

// Query for all people with "Master Degree" in their resumes.
TextQuery txt = new TextQuery(Person.class, "Master Degree");

try (QueryCursor<Entry<Long, Person>> masters = cache.query(txt)) {
  for (Entry<Long, Person> e : cursor)
    System.out.println(e.getValue().toString());
}
```
### 3.6.6.通过注解进行查询的配置
索引可以在代码中通过`@QuerySqlField`注解进行配置，来告诉Ignite那个类型要被索引，键值对可以传入`CacheConfiguration.setIndexedTypes(MyKey.class, MyValue.class)`方法。注意这个方法只会接受成对的类型，一个是键类型，一个是值类型。

Java：
```java
public class Person implements Serializable {
  /** Person ID (indexed). */
  @QuerySqlField(index = true)
  private long id;

  /** Organization ID (indexed). */
  @QuerySqlField(index = true)
  private long orgId;

  /** First name (not-indexed). */
  @QuerySqlField
  private String firstName;

  /** Last name (not indexed). */
  @QuerySqlField
  private String lastName;

  /** Resume text (create LUCENE-based TEXT index for this field). */
  @QueryTextField
  private String resume;

  /** Salary (indexed). */
  @QuerySqlField(index = true)
  private double salary;
  
  ...
}
```
### 3.6.7.使用QueryEntity进行查询配置
索引和字段也可以通过`org.apache.ignite.cache.QueryEntity`进行配置，它便于通过Spring使用XML进行配置，详细信息可以参照JavaDoc。它与`@QuerySqlField`注解是等价的，因为在内部类注解会被转换成查询实体。

XML：
```xml
<bean class="org.apache.ignite.configuration.CacheConfiguration">
    <property name="name" value="mycache"/>
    <!-- Configure query entities -->
    <property name="queryEntities">
        <list>
            <bean class="org.apache.ignite.cache.QueryEntity">
                <property name="keyType" value="java.lang.Long"/>
                <property name="valueType" value="org.apache.ignite.examples.Person"/>

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
Java:
```java
CacheConfiguration<Long, Person> cacheCfg = new CacheConfiguration<>();
...
cacheCfg.setName("mycache");

// Setting up query entity.
QueryEntity queryEntity = new QueryEntity();

queryEntity.setKeyType(Long.class.getName());
queryEntity.setValueType(Person.class.getName());

// Listing query fields.
LinkedHashMap<String, String> fields = new LinkedHashMap();

fields.put("id", Long.class.getName());
fields.put("orgId", Long.class.getName());
fields.put("firstName", String.class.getName());
fields.put("lastName", String.class.getName());
fields.put("resume", String.class.getName());
fields.put("salary", Double.class.getName());

queryEntity.setFields(fields);

// Listing indexes.
Collection<QueryIndex> indexes = new ArrayList<>(3);

indexes.add(new QueryIndex("id"));
indexes.add(new QueryIndex("orgId"));
indexes.add(new QueryIndex("salary"));

queryEntity.setIndexes(indexes);
...
cacheCfg.setQueryEntities(Arrays.asList(queryEntity));
...
```
## 3.7.持续查询
### 3.7.1.持续查询
持续查询可以监听缓存中数据的变更。持续查询一旦启动，如果有，就会收到符合查询条件的数据变化的通知。

持续查询的功能是通过`ContinuousQuery`类启用的，详细描述如下：
#### 3.7.1.1.初始化查询
当要执行持续查询时，在将持续查询注册在集群中以及开始接收更新之前，可以有选择地指定一个初始化查询。

初始化查询可以通过`ContinuousQuery.setInitialQuery(Query)`方法进行设置，并且可以是任意查询类型，包括扫描查询，SQL查询和文本查询。
#### 3.7.1.2.远程过滤器
这个过滤器在给定键对应的主和备节点上执行，然后评估更新是否需要作为一个事件传播给该查询的本地监听器。

如果过滤器返回`true`，那么本地监听器就会收到通知，否则事件会被忽略。产生更新的特定主和备节点，会在主/备节点以及应用端执行的本地监听器之间，减少不必要的网络流量。

远程过滤器可以通过`ContinuousQuery.setRemoteFilter(CacheEntryEventFilter<K, V>)`方法进行设置。
#### 3.7.1.3.本地监听器
当缓存被修改时（一个条目被插入、更新或者删除），更新对应的事件就会发送给持续查询的本地监听器，之后应用就可以做出对应的反应。
当事件通过了远程过滤器，它们就会被发送给客户端，通知哪里的本地监听器。

本地监听器是通过`ContinuousQuery.setLocalListener(CacheEntryUpdatedListener<K, V>)`方法设置的。

Java8:
```java
IgniteCache<Integer, String> cache = ignite.cache("mycache");

// Creating a continuous query.
ContinuousQuery<Integer, String> qry = new ContinuousQuery<>();

// Setting an optional initial query. 
// The query will return entries for the keys greater than 10.
qry.setInitialQuery(new ScanQuery<Integer, String>((k, v) -> k > 10)):

// Local listener that is called locally when an update notification is received.
qry.setLocalListener((evts) -> 
	evts.stream().forEach(e -> System.out.println("key=" + e.getKey() + ", val=" + e.getValue())));

// This filter will be evaluated remotely on all nodes.
// Entry that pass this filter will be sent to the local listener.
qry.setRemoteFilter(e -> e.getKey() > 10);

// Executing the query.
try (QueryCursor<Cache.Entry<Integer, String>> cur = cache.query(qry)) {
  // Iterating over existing data stored in cache.
  for (Cache.Entry<Integer, String> e : cur)
    System.out.println("key=" + e.getKey() + ", val=" + e.getValue());

  // Adding a few more cache entries.
  // As a result, the local listener above will be called.
  for (int i = 5; i < 15; i++)
    cache.put(i, Integer.toString(i));
}
```
Java7:
```java
IgniteCache<Integer, String> cache = ignite.cache(CACHE_NAME);

// // Creating a continuous query.
ContinuousQuery<Integer, String> qry = new ContinuousQuery<>();

// Setting an optional initial query. 
// The query will return entries for the keys greater than 10.
qry.setInitialQuery(new ScanQuery<Integer, String>(
  new IgniteBiPredicate<Integer, String>() {
  @Override public boolean apply(Integer key, String val) {
    return key > 10;
  }
}));

// Local listener that is called locally when an update notification is received.
qry.setLocalListener(new CacheEntryUpdatedListener<Integer, String>() {
  @Override public void onUpdated(Iterable<CacheEntryEvent<? extends Integer, ? extends String>> evts) {
    for (CacheEntryEvent<Integer, String> e : evts)
      System.out.println("key=" + e.getKey() + ", val=" + e.getValue());
  }
});

// This filter will be evaluated remotely on all nodes.
// Entry that pass this filter will be sent to the local listener.
qry.setRemoteFilter(new CacheEntryEventFilter<Integer, String>() {
  @Override public boolean evaluate(CacheEntryEvent<? extends Integer, ? extends String> e) {
    return e.getKey() > 10;
  }
});

// Execute query.
try (QueryCursor<Cache.Entry<Integer, String>> cur = cache.query(qry)) {
  // Iterating over existing data stored in cache.
  for (Cache.Entry<Integer, String> e : cur)
    System.out.println("key=" + e.getKey() + ", val=" + e.getValue());

  // Adding a few more cache entries.
  // As a result, the local listener above will be called.
  for (int i = keyCnt; i < keyCnt + 10; i++)
    cache.put(i, Integer.toString(i));
}
```
#### 3.7.1.4.远程转换器
持续查询默认会将整个更新后的对象发送给应用端的监听器，这会导致网络的过度使用，如果传输的对象很大，更是如此。另外，应用通常更希望得到所有字段的子集，而不是整个对象。

为了解决这个问题，可以使用`ContinuousQueryWithTransformer`，它可以配置一个自定义的转换器工厂，它会在远程节点执行，处理每个更新后的对象，然后只将转换后的结果发给监听器。
```java
// Create a new continuous query with the transformer.
ContinuousQueryWithTransformer qry = new ContinuousQueryWithTransformer();

// Factory to create transformers.
Factory factory = FactoryBuilder.factoryOf(
    // Return one field of a complex object.
    // Only this field will be sent over to a local listener over the network.
    (IgniteClosure<CacheEntryEvent, String>)
        event -> ((Organization)event.getValue()).name());

qry.setRemoteTransformerFactory(factory);

// Listener that will receive transformed data.
qry.setLocalListener(names -> {
    for (Object name : names)
        System.out.println("New organization name: " + name);
});
```
`ContinuousQueryWithTransformer`的使用示例，[GitHub](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/datagrid/CacheContinuousQueryWithTransformerExample.java)上有。
### 3.7.2.事件传递保证
持续查询的实现会明确地保证，一个事件只会传递给客户端的本地监听器一次。

因为除了主节点，在每个备份节点维护一个更新队列是可行的。如果主节点故障或者由于某些其它原因拓扑发生了改变，之后每个备份节点会刷新它的内部队列的内容给客户端来确保事件都会被传递给客户端的本地监听器。

为了避免重复通知，当所有的备份节点都刷新它们的队列给客户端时，Ignite会为每个分区维护一个更新计数器。当某个分区的一个条目已经更新，这个分区的计数器在主节点和备份节点都会增加。这个计数器的值会和事件通知一起发给客户端，该客户端还维护该映射的副本。如果客户端收到了一个更新，对应的计数小于它的本地映射，这个更新会被视为重复的然后被忽略。

一旦客户端确认一个事件已经收到，主节点和备份节点会从它们的备份队列中删除该事件的记录。
### 3.7.3.示例
关于描述持续查询如何使用的完整示例，已经随着Ignite的发行版一起发布，名为`CacheContinuousQueryExample`，相关的代码在[GitHub](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/datagrid/CacheContinuousQueryExample.java)上也有。
## 3.8.事务
### 3.8.1.原子化模式
Ignite支持两种类型的缓存操作，*事务性*和*原子性*，在`事务性`模式中可以在一个事务中组合多个缓存操作，而`原子性`模式支持多个原子性操作，一次一个。

`TRANSACTIONAL`模式完全遵守ACID事务，在这个模式中，可以将多个缓存操作，可以是一个或者多个键，合并成一个逻辑操作，叫做一个事务。在这些键上的所有操作都不会有其它的操作干扰，要么全部成功，要么全部失败，不会出现部分成功的情况。但是出于性能原因还是建议使用`ATOMIC`模式，只有在需要兼容ACID时才需要开启`TRANSACTIONAL`模式。

`ATOMIC`模式因为避免了事务锁，所以性能更好，但是仍然提供了**单个数据**的原子性和一致性。`ATOMIC`模式的另一个不同是批量写，比如`putAll(...)`和`removeAll(...)`方法不再可以在一个事务中执行并且可能部分失败，在部分失败时，会抛出`CachePartialUpdateException`，它里面包含了更新失败的键列表。

原子化模式是在`CacheAtomicityMode`枚举中定义的，可以在CacheConfiguration的`atomicityMode`属性进行配置。

XML：
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
Java:
```java
CacheConfiguration cacheCfg = new CacheConfiguration();

cacheCfg.setName("cacheName");

cacheCfg.setAtomicityMode(CacheAtomicityMode.ATOMIC);

IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setCacheConfiguration(cacheCfg);

// Optional transaction configuration. Configure TM lookup here.
TransactionConfiguration txCfg = new TransactionConfiguration();

cfg.setTransactionConfiguration(txCfg);

// Start Ignite node.
Ignition.start(cfg);
```

> **性能**
注意当使用`ATOMIC`模式时，事务是被禁用的，因为不需要事务，因此可以获得更高的性能和吞吐量。

### 3.8.2.IgniteTransactions
`IgniteTransactions`接口包括了启动和结束事务的功能，以及订阅监听器或者获得指标数据。

> **跨缓存事务**
可以在一个事务中组合来自不同缓存的多个操作。注意它可以在一个事务中更新不同类型的缓存，比如`复制`和`分区`缓存。
**近缓存事务**
近缓存是完全事务化的，当数据在服务端改变时，会自动地获得更新或者失效。

可以像下面这样获得`IgniteTransactions`的一个实例：
Java：
```java
Ignite ignite = Ignition.ignite();

IgniteTransactions transactions = ignite.transactions();
```
下面是一个事务如何在Ignite中执行的例子：
```java
try (Transaction tx = transactions.txStart()) {
    Integer hello = cache.get("Hello");
  
    if (hello == 1)
        cache.put("Hello", 11);
  
    cache.put("World", 22);
  
    tx.commit();
}
```
>**事务对象生命周期**
一个`Transaction`对象用完之后需要关闭，要保证不出差错，可以这么做：
 - 在`try-with-resources`语句中启动`Transaction`，它最终会调用close()方法；
 - 使用`finally`代码块，手工调用`tx.close()`方法。

>**事务化方法**
当缓存开启事务时，并不是`IgniteCache`API中的所有方法都支持事务，需要看它的方法签名，如果其抛出`TransactionException`异常，那么它就满足ACID原则，可以安全地用于分布式事务。
### 3.8.3.2阶段提交（2PC）
Ignite在事务中使用了2阶段提交（2PC）的协议，但是只要适用也带有很多一阶段提交的优化。在一个事务中当数据更新时，在调用`commit()`方法之前，Ignite会在本地事务映射中保持事务状态，在这一点，只要需要，数据都会被传输到远程节点。

顾名思义，有两个阶段：准备和提交，具体可以参照如下文章：

 - [Apache Ignite事务架构：2阶段提交协议](https://my.oschina.net/liyuj/blog/1626309)
 - [Apache Ignite事务架构：并发模型和隔离级别](https://my.oschina.net/liyuj/blog/1627248)
 - [Apache Ignite事务架构：故障和恢复](https://my.oschina.net/liyuj/blog/1791800)
 - [Apache Ignite事务架构：Ignite持久化的事务处理](https://my.oschina.net/liyuj/blog/1793912)
 - [Apache Ignite事务架构：第三方持久化的事务处理](https://my.oschina.net/liyuj/blog/1796152)

或者，也可以看下面的[资料](https://cwiki.apache.org/confluence/display/IGNITE/Ignite+Key-Value+Transactions+Architecture)，了解事务子系统的内部实现。
> **ACID完整性**
Ignite提供了完整的ACID（原子性，一致性，隔离性和持久性）兼容事务来确保一致性。

### 3.8.4.并发模型和隔离级别
当原子化模式配置为`事务`时，Ignite对事务支持`乐观`和`悲观`的**并发模型**。并发模型决定了何时获得一个条目级的事务锁-在访问数据时或者在`prepare`阶段。锁定可以防止对一个对象的并发访问。比如，当试图用悲观锁更新一个ToDo列表项时，服务端会在该对象上置一个锁以使其它的事务或者操作无法更新同一个条目，直到提交或者回滚该事务。不管在一个事务中使用那种并发模型，在提交之前都存在事务中的所有条目被锁定的时刻。

**隔离级别**定义了并发事务如何"看"以及处理针对同一个键的操作。Ignite支持`读提交`、`可重复读`、`可序列化`隔离级别。
并发模型和隔离级别的所有组合都是可以同时使用的。下面是针对Ignite提供的每一个并发-隔离组合的行为和保证的描述。
### 3.8.5.悲观事务
在`悲观`事务中，锁是在第一次读或者写访问期间获得（取决于隔离级别）然后被事务持有直到其被提交或者回滚。该模式中，锁首先在主节点获得然后在准备阶段提升至备份节点。下面的隔离级别可以配置为`悲观`并发模型。

 - `读提交`：数据被无锁地读取并且不会被事务本身缓存。如果缓存配置允许的话数据是可能从一个备份节点中读取的。在这个隔离级别中，可以有所谓的非可重复读，因为当在自己的事务中读取数据两次时，一个并发事务可以改变该数据。锁只有在第一次写访问时才会获得（包括`EntryProcessor`调用）。这意味着事务中已经读取的一个条目在该事务提交时可能有一个不同的值，这种情况是不会抛出异常的；
 - `可重复读`：获得条目锁以及第一次对主节点的读/写访问并获得数据后，就会存储在本地事务映射中。之后对同一数据的所有连续访问都是本地化的，并且返回最后一次读或者被更新的事务值。这意味着没有其它的并发事务可以改变锁定的数据，这样就获得了事务的可重复读；
 - `可序列化`：在`悲观`模式中，这个隔离级别与`可重复读`是一样的工作方式。

注意，在`悲观`模式中，锁的顺序是很重要的。此外，Ignite可以按照用户提供的顺序依次并且准确地获得锁。

::: warning 性能考量
设想拓扑中有三个节点（A、B、C），并且在事务中针对键[1, 2, 3, 4, 5, 6]执行一个`putAll`。假定这些键以如下形式映射到节点：{A: 1, 4}, {B: 2, 5}, {C: 3, 6}，因为Ignite在`悲观`模式中无法改变获得锁的顺序，它会产生6次连续地网络往返：[A, B, C, A, B, C]。在键的锁定顺序对于一个事务的语义不重要的情况下，将键按照分区进行分组然后将在一个分区的键一起锁定是明智的。这在一个大的事务中可以显著地降低网络消息的数量。在这个示例中，如果对于一个`putAll`键按照如下的方式排序：[1, 4, 2, 5, 3, 6]，之后只需要3次的连续网络访问。
:::
::: danger 拓扑变化约束
注意，如果至少获得一个悲观事务锁，都不可能改变缓存的拓扑，直到事务被提交或者回滚，因此，不建议长时间地持有事务锁。
:::

### 3.8.6.乐观事务
在乐观事务中，条目锁是在二阶段提交的`准备`阶段从主节点获得的，然后提升至备份节点，该锁在事务提交时被释放。如果用户回滚事务没有试图做提交，是不会获得锁的。下面的隔离级别可以与`乐观`并发模型配置在一起。

 - `读提交`：应该作用于缓存的改变是在源节点上收集的，然后事务提交后生效。事务数据无锁地读取并且不会在事务中缓存。如果缓存配置允许的话该数据是可能从备份节点中读取的。在这个隔离级别中，可以有一个所谓的非可重复读，因为在自己的事务中读取数据两次时另一个事务可以修改数据。这个模式组合在第一次读或者写操作后如果条目值被修改是不会做校验的，并且不会抛出异常。
 - `可重复读`：这个隔离级别的事务的工作方式类似于`乐观` `读提交`的事务，只有一个不同-读取值缓存于源节点并且所有的后续读保证都是本地化的。这个模式组合在第一次读或者写操作后如果条目值被修改是不会做校验的，并且不会抛出异常。
 - `可序列化`：在第一次读访问之后会存储一个条目的版本，如果Ignite引擎检测到发起事务中的条目只要有一个被修改，Ignite就会在提交阶段放弃该事务，这是在提交阶段对网格内的事务中记载的条目的版本进行内部检查实现的。简而言之，这意味着Ignite如果在一个事务的提交阶段检测到一个冲突，就会放弃这个事务并且抛出`TransactionOptimisticException`异常以及回滚已经做出的任何改变，开发者应该处理这个异常并且重试该事务。
```java
// Re-try transaction finite amount of time.
int retryCount = 10;
int retries = 0;

// Start transaction in optimistic mode with serializable isolation level.
while (retries < retryCount) {
    retries++;
    try (Transaction tx =  
        ignite.transactions().txStart(TransactionConcurrency.OPTIMISTIC,
                                      TransactionIsolation.SERIALIZABLE)) {
        // Modify cache entries as part of this transaction.
        ....
        
        // commit transaction.  
        tx.commit();

        // Transaction succeeded. Leave the while loop.
        break;
    }
    catch (TransactionOptimisticException e) {
        // Transaction has failed. Retry.
    }
}
```
这里另外一个需要注意的重要的点是，即使一个条目只是简单地读取（没有改变，cache.put(...)），一个事务仍然可能失败，因为该条目的值对于发起事务中的逻辑很重要。

注意，对于`读提交`和`可重复读`事务，键的顺序是很重要的，因为这些模式中锁也是按顺序获得的。
>**乐观可序列化事务的重试**
对于乐观可序列化事务的失败，重试是个好办法，因为事务试图更新的数据，	可能被并发地修改，因此，需要通过重试逻辑来处理`TransactionOptimisticException`异常，只不过需要合理地限制重试的次数。

### 3.8.7.死锁检测
当处理分布式事务时必须要遵守的主要规则是参与一个事务的键的锁，必须按照同样的顺序获得，违反这个规则就可能导致分布式死锁。
Ignite无法避免分布式死锁，而是有一个内建的功能来使调试和解决这个问题更容易。

就像下面的代码片段所示，一个带有超时时间的事务启动。如果过了超时时间，死锁检测过程就会试图查找一个触发这个超时的可能的死锁。当超过超时时间时，会抛出`TransactionTimeoutException`并且像触发`CacheException`那样传播到应用层而不会管死锁。不过如果检测到了一个死锁，返回的`TransactionTimeoutException`的cause会是`TransactionDeadlockException`（至少涉及死锁的一个事务）。
```java
try (Transaction tx = ignite.transactions().txStart(TransactionConcurrency.PESSIMISTIC,
    TransactionIsolation.READ_COMMITTED, 300, 0)) {
    cache.put(1, 1);

    cache.put(2, 1);

    tx.commit();
}
catch (CacheException e) {
    if (e.getCause() instanceof TransactionTimeoutException &&
        e.getCause().getCause() instanceof TransactionDeadlockException)    
        
        System.out.println(e.getCause().getCause().getMessage());
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
死锁检测是一个多步过程，依赖于集群中节点的数量、键以及可能导致死锁涉及的事务数，可能需要做很多次迭代。一个死锁检测的发起者是发起事务并且出现`TransactionTimeoutException`错误的那个节点，这个节点会检查是否发生了死锁，通过与其它远程节点交换请求/响应，并且准备一个与死锁有关的、由`TransactionDeadlockException`提供的报告，每个这样的消息（请求/响应）都会被称为一个迭代器。

因为死锁检测过程不结束，事务就不会回滚，有时，如果希望对于事务回滚有一个可预测的时间，调整一下参数还是有意义的（下面会描述）。

 - `IgniteSystemProperties.IGNITE_TX_DEADLOCK_DETECTION_MAX_ITERS`：指定死锁检测过程迭代器的最大数，如果这个属性的值小于等于0，死锁检测会被禁用（默认为1000）；
 - `IgniteSystemProperties.IGNITE_TX_DEADLOCK_DETECTION_TIMEOUT`：指定死锁检测机制的超时时间（默认为1分钟）。

注意如果迭代器太少的话，可能获得一个不完整的死锁检测报告。

> 如果想彻底避免死锁，可以看下面的无死锁事务章节。

### 3.8.8.无死锁事务
对于`乐观`的`可序列化`事务，锁不是按顺序获得的。该模式中键可以按照任何顺序访问，因为事务锁是通过一个额外的检查以并行的方式获得的，这使得Ignite可以避免死锁。

这里需要引入几个概念来描述`可序列化`的事务锁是如何工作的。Ignite中的每个事务都会被赋予一个叫做`XidVersion`的可比较的版本号，事务提交时该事务中修改的每个条目都会被赋予一个叫做`EntryVersion`的新的版本号，一个版本号为`XidVersionA`的`乐观可序列化`事务在如下情况下会抛出`TransactionOptimisticException`异常而失败：

 - 有一个进行中的`悲观`的或者非可序列化`乐观`事务在`可序列化`事务中的一个条目上持有了一个锁；
 - 有另外一个进行中的版本号为`XidVersionB`的`乐观可序列化`事务，在`XidVersionB > XidVersionA`时以及这个事务在`可序列化`事务中的一个条目上持有了一个锁；
 - 在该`乐观可序列化`事务获得所有必要的锁时，存在在提交之前的版本与当前版本不同的条目；

> 在一个高并发环境中，乐观锁可能导致一个很高的事务失败率。但是悲观锁如果锁被事务以一个不同的顺序获得可能导致死锁。
不过在一个同质化的环境中，乐观可序列化锁对于大的事务可能提供更好的性能，因为网络交互的数量只取决于事务相关的节点的数量，而不取决于事务中的键的数量。

### 3.8.9.失败事务处理
如下的异常可能导致事务失败：

|异常名称|描述|
|---|---|
|事务死锁会触发这个异常，`解决办法`：使用死锁检测机制调试和修正死锁，或者切换到乐观序列化事务（无死锁事务）。由`TransactionTimeoutException`触发的`CacheException`|事务超时会触发`TransactionTimeoutException`，`解决办法`：可以增加超时时间或者缩短事务执行时间|
|`TransactionDeadlockException`触发`TransactionTimeoutException`，再触发`CacheException`|事务死锁会触发这个异常，`解决办法`：使用死锁检测机制调试和修正死锁，或者切换到乐观序列化事务（无死锁事务）。|
|`TransactionOptimisticException`|乐观事务失败会抛出这个异常，大多数情况下，该异常发生在事务试图并发更新数据的场景中。`解决办法`：重新执行事务。|
|`TransactionRollbackException`|事务自动或者手动回滚时，可能抛出这个异常，这时，数据状态是一致的。`解决方法`：因为数据状态是一致的，所以可以对事务进行重试。|
|`TransactionHeuristicException`|这是一个不太可能发生的异常，由Ignite中意想不到的内部错误或者通信错误导致，该异常存在于事务子系统无法预知的不确定场景中，目前没有被合理地处理。`解决办法`：如果出现该异常，数据可能不一致，这时需要对数据进行重新加载，或者报告给Ignite开发社区。|

>**事务重试**
对于乐观和悲观事务的重试，都是合理的，即使因为网络或者节点故障导致事务失败，Ignite仍然会利用备份或者磁盘上的可用数据，来保证数据一致性，所有这些，都支持事务重试。

但是，不要在应用层无限地进行事务重试，包括在有限的时间内这样做也不好。

### 3.8.10.长时间运行事务终止
在Ignite集群中，部分事件会触发分区映射的交换过程以及数据的再平衡，来保证整个集群的数据分布，这个事件的一个例子就是集群拓扑变更事件，它会在新节点加入或者已有节点离开时触发，还有，新的缓存或者SQL表创建时，也会触发分区映射的交换。

当分区映射交换开始时，Ignite会在特定的阶段拿到一个全局锁，只有在未完成的事务并行执行时才需要获得锁，这些事务会阻止分区映射交换进程往前走，从而阻断一些新节点加入进程这样的一些操作。

使用`TransactionConfiguration.setTxTimeoutOnPartitionMapExchange(...)`方法，可以配置长期运行事务阻断分区映射交换的最大时间，时间一到，所有的未完成事务都会回滚，让分区映射交换进程先完成。

下面的示例显示如何配置超时时间：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  	...
    <property name="transactionConfiguration">
        <bean class="org.apache.ignite.configuration.TransactionConfiguration">
        <!--Set the timeout to 20 seconds-->
        <property name="TxTimeoutOnPartitionMapExchange" value="20000"/>
        <!--Other trasaction configurations-->
        ...
        </bean>
    </property>
</bean>
```
Java：
```java
// Create Ignite configuration
IgniteConfiguration cfg = new IgniteConfiguration();
        
// Create Ignite Transactions configuration
TransactionConfiguration txCfg = new TransactionConfiguration();

// Set the timeout to 20 seconds
txCfg.setTxTimeoutOnPartitionMapExchange(20000);

cfg.setTransactionConfiguration(txCfg);

// Start the cluster node
Ignition.start(cfg);
```
如果事务因为超时而回滚，可以捕获并且处理`TransactionTimeoutException`。
### 3.8.11.集成JTA
Ignite可以通过`TransactionConfiguration#setTxManagerFactory`方法配置一个JTA事务管理器搜索类，事务管理器工厂是一个工厂，它给Ignite提供了一个JTA事务管理器的实例。

Ignite提供了一个`CacheJndiTmFactory`工厂，它是一个通过JNDI名字查找事务管理器的事务管理器工厂实现。

设置了之后，在事务中的每一次缓存操作，Ignite都会检查是否存在一个进行中的JTA事务。如果JTA事务开启了，Ignite也会开启一个事务然后通过它自己的一个`XAResource`的内部实现来将其加入JTA事务，Ignite事务会准备，提交或者干脆回滚相应的JTA事务。
下面是一个在Ignite中使用JTA事务管理器的示例：

Java:
```java
// Get an instance of JTA transaction manager.
TMService tms = appCtx.getComponent(TMService.class);

// Get an instance of Ignite cache.
IgniteCache<String, Integer> cache = cache();

UserTransaction jtaTx = tms.getUserTransaction();

// Start JTA transaction.
jtaTx.begin();

try {
    // Do some cache operations.
    cache.put("key1", 1);
    cache.put("key2", 2);

    // Commit the transaction.
    jtaTx.commit();
}
finally {
    // Rollback in a case of exception.
    if (jtaTx.getStatus() == Status.STATUS_ACTIVE)
        jtaTx.rollback();
}
```
## 3.9.锁
缓存事务会隐式地获得锁，不过有些情况下显式锁是很有用的。`IgniteCache`API的`lock()`方法会返回一个`java.util.concurrent.locks.Lock`的实例，它可以在任意给定的键上定义显式的分布式锁，也可以通过`IgniteCache.lockAll()`方法给集合对象加锁。
```java
IgniteCache<String, Integer> cache = ignite.cache("myCache");

// Create a lock for the given key
Lock lock = cache.lock("keyLock");
// Acquire the lock
lock.lock();
try {  
    cache.put("Hello", 11);
    cache.put("World", 22);
}
finally {
    // Release the lock
    lock.unlock();
}
```

> **原子化模式**
Ignite中，只有在`TRANSACTIONAL`原子化模式中才支持锁，它可以通过`CacheConfiguration`的`atomicityMode`属性进行配置。

**锁和事务**
显式锁是非事务性的，不能在事务中使用（会抛出异常）。如果确实需要在事务中使用显式锁，那么需要使用事务的`TransactionConcurrency.PESSIMISTIC`并发控制，它会为相关的缓存操作获得显式锁。
## 3.10.关系并置
数据和计算以及数据和数据的并置可以显著地提升应用的性能和可扩展性。
### 3.10.1.数据与数据的并置
在许多情况下，如果不同的缓存键被同时访问的话那么将它们并置在一起是很有利的。通常来说业务逻辑需要访问不止一个的缓存键，通过将它们并置在一起可以确保具有同一个`affinityKey`的所有键都会缓存在同一个处理节点上,从而避免从远程节点获取数据的昂贵网络开销。

例如，有一个`Person`和`Company`对象，然后希望将`Person`对象和其工作的`Company`对象并置在一起。

要做到这一点，用于缓存`Person`对象的缓存键应该有一个属性或者方法加注了`@AffinityKeyMapped`注解，它会提供用于并置的`Company`键的值，方便起见，也可以选用`AffinityKey`类。

如果缓存是通过SQL创建的，那么关系键是通过`CREATE TABLE`的`AFFINITY_KEY`参数传递的。
> **Scala中的注解**
注意，如果Scala的case class用于键类并且它的构造函数参数之一加注了`@AffinityKeyMapped`注解，默认这个注解并不会正确地用于生成的字段，因此也就不会被Ignite识别。要覆盖这个行为，可以使用`@field`[元注解](http://www.scala-lang.org/api/current/#scala.annotation.meta.package)而不是`@AffinityKeyMapped`（看下面的示例）。

使用PersonKey:
```java
public class PersonKey {
    // Person ID used to identify a person.
    private String personId;
 
    // Company ID which will be used for affinity.
    @AffinityKeyMapped
    private String companyId;
    ...
}

// Instantiate person keys with the same company ID which is used as affinity key.
Object personKey1 = new PersonKey("myPersonId1", "myCompanyId");
Object personKey2 = new PersonKey("myPersonId2", "myCompanyId");
 
Person p1 = new Person(personKey1, ...);
Person p2 = new Person(personKey2, ...);
 
// Both, the company and the person objects will be cached on the same node.
comCache.put("myCompanyId", new Company(...));
perCache.put(personKey1, p1);
perCache.put(personKey2, p2);
```
使用PersonKey（Scala）
```java
case class PersonKey (
    // Person ID used to identify a person.
    personId: String,
 
    // Company ID which will be used for affinity.
    @(AffinityKeyMapped @field)
    companyId: String
)

// Instantiate person keys with the same company ID which is used as affinity key.
val personKey1 = PersonKey("myPersonId1", "myCompanyId");
val personKey2 = PersonKey("myPersonId2", "myCompanyId");
 
val p1 = new Person(personKey1, ...);
val p2 = new Person(personKey2, ...);
 
// Both, the company and the person objects will be cached on the same node.
compCache.put("myCompanyId", Company(...));
perCache.put(personKey1, p1);
perCache.put(personKey2, p2);
```
使用AffinityKey：
```java
Object personKey1 = new AffinityKey("myPersonId1", "myCompanyId");
Object personKey2 = new AffinityKey("myPersonId2", "myCompanyId");
 
Person p1 = new Person(personKey1, ...);
Person p2 = new Person(personKey2, ...);
 
// Both, the company and the person objects will be cached on the same node.
comCache.put("myCompanyId", new Company(..));
perCache.put(personKey1, p1);
perCache.put(personKey2, p2);
```

> **SQL关联**
当在分区缓存上的数据执行SQL分布式关联时，一定要确保关联的键是并置的。

### 3.10.2.数据和计算的并置
也有可能向缓存数据的节点发送计算，这是一个被称为数据和计算的并置的概念，它可以向特定的节点发送整个的工作单元。

要将数据和计算并置在一起，需要使用`IgniteCompute.affinityRun(...)`和`IgniteCompute.affinityCall(...)`方法。
下面的例子显示了如何和上面提到的缓存`Person`和`Company`对象的同一个集群节点进行并置计算：

Java8:
```java
String companyId = "myCompanyId";
 
// Execute Runnable on the node where the key is cached.
ignite.compute().affinityRun("myCache", companyId, () -> {
  Company company = cache.get(companyId);

  // Since we collocated persons with the company in the above example,
  // access to the persons objects is local.
  Person person1 = cache.get(personKey1);
  Person person2 = cache.get(personKey2);
  ...  
});
```
Java7:
```java
final String companyId = "myCompanyId";
 
// Execute Runnable on the node where the key is cached.
ignite.compute().affinityRun("myCache", companyId, new IgniteRunnable() {
  @Override public void run() {
    Company company = cache.get(companyId);
    
    Person person1 = cache.get(personKey1);
    Person person2 = cache.get(personKey2);
    ...
  }
};
```
### 3.10.3.IgniteCompute和EntryProcessor
`IgniteCompute.affinityRun(...)`和`IgniteCache.invoke(...)`方法都提供了数据和计算的并置。主要的不同在于`invoke(...)`方法是原子的并且执行时在键上加了锁，无法从`EntryProcessor`逻辑内部访问其它的键，因为它会触发一个死锁。
另一方面，`affinityRun(...)`和`affinityCall(...)`不持有任何锁。比如，在这些方法内开启多个事务或者执行缓存查询是绝对合法的，不用担心死锁。这时Ignite会自动检测处理是并置的然后对事务采用优化过的一阶段提交而不是二阶段提交。

> 关于`IgniteCache.invoke(...)`方法的更多信息，请参照`3.2.超越JCache`文档。

### 3.10.4.关系函数
分区的关系控制一个分区缓存在哪个网格节点或者哪些节点上。`AffinityFunction`是一个可插拔的API用于确定网格中分区到节点的一个理想映射。当拓扑发生变化时，分区到节点的映射可能不同于关系函数提供的理想分布，直到再平衡结束。

Ignite提供了`RendezvousAffinityFunction`，这个函数允许分区到节点的映射有点区别（即一些节点可能比其它节点负责稍微多一点的分区数量）。不过它保证当拓扑发生变化时，分区只会迁移到一个新加入的节点或者只来自一个离开的节点，集群内已有的节点间不会发生数据的交换。

注意，缓存关系函数不会直接映射键和节点，它映射的是键和分区。分区只是来自一个有限集合的简单的数字（默认0-1024）。在键映射到它们的分区之后（即获得了它们的分区号），已有的分区到节点的映射会用于当前的拓扑版本，键到分区的映射在时间上并不会改变。
下面的代码显示了如何自定义和配置一个关系函数：
```XML
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
	<property name="cacheConfiguration">
  	<list>
    	<!-- Creating a cache configuration. -->
      <bean class="org.apache.ignite.configuration.CacheConfiguration">
      	<property name="name" value="myCache"/>

        <!-- Creating the affinity function with custom setting. -->
        <property name="affinity">
        	<bean         class="org.apache.ignite.cache.affinity.rendezvous.RendezvousAffinityFunction">
        		<property name="excludeNeighbors" value="true"/>
            <property name="partitions" value="2048"/>
          </bean>
        </property>
      </bean>
    </list>
  </property>
</bean>
```
Java:
```java
// Preparing Apache Ignite node configuration.
IgniteConfiguration cfg = new IgniteConfiguration();
        
// Creating a cache configuration.
CacheConfiguration cacheCfg = new CacheConfiguration("myCache");

// Creating the affinity function with custom setting.
RendezvousAffinityFunction affFunc = new RendezvousAffinityFunction();
        
affFunc.setExcludeNeighbors(true);
        
affFunc.setPartitions(2048);

// Applying the affinity function configuration.
cacheCfg.setAffinity(affFunc);
        
// Setting the cache configuration.
cfg.setCacheConfiguration(cacheCfg);
```

> **关系的故障安全**
主备副本不位于同一台物理机上，以这样的方式调整集群内的分区是很有用的，要确保这个属性，可以在`RendezvousAffinityFunction`上设置`excludeNeighbors`标志。

有时将一个分区的主备副本放在不同的机架上也是很有用的。这时，可以为每个节点赋予一个特别的属性然后在`RendezvousAffinityFunction`上使用`AffinityBackupFilter`属性来排除同一个机架中分配用于备份副本的若干节点。

`AffinityFunction`是一个可插拔的API，也可以提供这个函数的自定义实现，`AffinityFunction`API的三个主要方法是：

 - `partitions()`：获取一个缓存的分区总数量，集群启动之后无法改变。
 - `partition(...)`：给定一个键，这个方法确定一个键属于哪个分区，这个映射在时间上不会改变。
 - `assignPartitions(...)`：这个方法在拓扑发生变化时每次都会被调用，这个方法对于给定的拓扑返回一个分区到节点的映射。

### 3.10.5.CacheAffinityKeyMapper
`CacheAffinityKeyMapper`是一个可插拔的API，负责为一个缓存键获取关系键。通常缓存键本身就用于关系键，不过为了与其它的缓存键并置，有时改变一个缓存键的关系是很重要的。

`CacheAffinityKeyMapper`的主要方法是`affinityKey(key)`，它会为一个缓存键返回一个`affinityKey`。Ignite默认会查找加注`@CacheAffinityKeyMapped`注解的所有属性和方法。如果没有找到这样的属性或者方法，那么缓存键本身就会用做关系键。如果找到了这样的属性或者方法，那么这个属性或者方法的值就会从`CacheAffinityKeyMapper.affinityKey(key)`方法返回，这样只要需要，就可以指定一个替代的关系键，而不是缓存键本身。

## 3.11.分区丢失策略
在整个集群的生命周期中，所有的主节点以及持有这些分区数据的备份节点全部故障，导致分区数据丢失，是有可能的，这会导致部分数据丢失，这个需要根据实际需要进行处理。比如，有些应用认为这是严重的问题，会阻止所有到这个分区的写操作，而其它的应用可能忽略掉这个问题，因为数据可以重新加载。
**策略**
Ignite支持如下的[分区丢失策略](https://ignite.apache.org/releases/latest/javadoc/org/apache/ignite/cache/PartitionLossPolicy.html)：

 - `READ_ONLY_SAFE`：所有缓存/表的写操作都会抛出异常，在线分区的读操作是可以的，丢失分区的读操作会抛出异常；
 - `READ_ONLY_ALL`：包括丢失的分区，所有分区都是可以读的，任意分区的写操作都会抛出异常，从丢失的分区读取数据的结果是未定义的，而且不同的节点返回结果可能不同；
 - `READ_WRITE_SAFE`：在线分区的读写都是可以的，丢失分区的读写操作都会抛出异常；
 - `READ_WRITE_ALL`：所有的读写都会继续进行，就像所有分区都处于一致状态那样（就像没有分区丢失），从丢失分区的读操作是未定义的，并且不同节点返回结果可能不同；
 - `IGNORE`：该模式不会标记丢失的分区为丢失状态，假定没有发生分区丢失，并且立即清除分区丢失状态。从技术上来说，分区不会被加入`lostPartitions`列表，这是与`READ_WRITE_ALL`模式的主要区别，`IGNORE`模式为默认模式。

分区丢失策略是在缓存层级进行配置的：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  	...
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            <!-- Set a cache name. -->
            <property name="name" value="cacheName"/>
            <!-- Set partition loss policy. -->
            <property name="partitionLossPolicy" value="READ_ONLY_SAFE"/>
            <!-- Other cache configurations. -->
            ... 
        </bean>
    </property>
</bean>
```
Java：
```java
acheConfiguration cfg = new CacheConfiguration("cacheName");

// Set partition loss policy to READ_ONLY_SAFE
cfg.setPartitionLossPolicy(PartitionLossPolicy.READ_ONLY_SAFE);
```
**分区丢失事件处理**
Ignite提供了一些功能来处理分区丢失事件。

首先，确保订阅了`EVT_CACHE_REBALANCE_PART_DATA_LOST`事件，这样在分区丢失时会收到通知。
```java
Ignite ignite = Ignition.ignite();

// Local listener that listenes to local events.
IgnitePredicate<CacheEvent> locLsnr = evt -> {
  System.out.println("Received event [evt=" + evt.name() + "]");

  return true; // Continue listening.
};

// Subscribe to specified cache events occuring on local node.
ignite.events().localListen(locLsnr,
  EventType.EVT_CACHE_REBALANCE_PART_DATA_LOST);
```
下一步，如果业务逻辑希望某时获取所有的丢失分区，那么要使用`IgniteCache.lostPartitions()`方法。
```java
// Cache reference
IgniteCache cache;

// Getting a list of the lost partitions.
Collection<Integer> lostPartitions = cache.lostPartitions();

// Performing some actions upon the partitions.
...
```
最后，如果确认所有的丢失分区都已经恢复（比如，之前所有的主备节点故障之后，存储在Ignite持久化中的该分区数据，重新导入），那么需要使用`Ignite.resetLostPartitions(...)`方法清除`lost`标志，以使所有分区恢复正常：
```java
// Clear partition's lost state and moves caches to a normal mode.
ignite.resetLostPartitions(Arrays.asList("cache1", "cache2"));

// check that there are no more lost partitions
boolean lostPartiion = cache.lostPartitions().isEmpty()
```
## 3.12.数据再平衡
### 3.12.1.摘要
当一个新节点加入集群时，已有节点会放弃一部分缓存条目的所有权转交给新的节点，以使整个网格在任何时候都保持键的均等平衡。

如果新的节点成为一些分区的主节点或者备份节点，它会从该分区之前的主节点获取数据，或者从该分区的备份节点之一获取数据。一旦分区全部载入新的节点，旧节点就会被标记为过时然后该节点在所有当前的事务完成之后最终会被退出。因此，在一些很短的时间段，在拓扑发生变化之后，有一种情况是在缓存中对于一个键备份的数量可能比事先配置的多。不过一旦再平衡完成，额外的备份会被删除。

### 3.12.2.再平衡模式
下面的再平衡模式是在`CacheRebalanceMode`枚举中定义的：

|缓存再平衡模式|描述|
|---|---|
|`SYNC`|同步再平衡模式，直到所有必要的数据全部从其它有效节点加载完毕分布式缓存才会启动，这意味着所有对缓存的开放API的调用都会阻塞直到再平衡结束|
|`ASYNC`|异步平衡模式，分布式缓存会马上启动，然后在后台会从其它节点加载所有必要的数据|
|`NONE`|该模式下不会发生再平衡，这意味着要么在访问数据时从持久化存储载入，要么数据被显式地填充。|

默认启用`ASYNC`再平衡模式，要使用其它的再平衡模式，可以像下面这样设置`CacheConfiguration`的`rebalanceMode`属性：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    ...
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">             
            <!-- Set synchronous rebalancing. -->
            <property name="rebalanceMode" value="SYNC"/>
            ... 
        </bean
    </property>
</bean>
```
Java：
```java
CacheConfiguration cacheCfg = new CacheConfiguration();

cacheCfg.setRebalanceMode(CacheRebalanceMode.SYNC);

IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setCacheConfiguration(cacheCfg);

// Start Ignite node.
Ignition.start(cfg);
```
### 3.12.3.再平衡线程池调节
`IgniteConfiguration`提供了一个`setRebalanceThreadPoolSize`方法，它可以为了再平衡的需要，从Ignite的系统线程池中获取一定数量的线程，每当一个节点需要向远程节点发送一批数据时，或者需要处理来自相反方向的一批数据时，都会从池中获取一个系统线程，这个远程节点既可能是一个分区的主节点，也可能是备份节点。这个线程在批处理发送或者接收完以及处理完之后，就会被释放。

默认只会有一个线程用于再平衡。这基本上意味着在一个特定的时间点只有一个线程用于从一个节点到另一节点传输批量数据，或者处理来自远端的批量数据。举例来说，如果集群有两个节点和一个缓存，那么所有缓存的分区都会一个一个地按照顺序进行再平衡。如果集群有两个节点和两个不同的缓存，那么这些缓存会以并行的方式进行再平衡，但是在一个特定的时间点，就像上面解释的那样，只会处理属于某一个特定缓存的批量数据。

> 每个缓存的分区数量不会影响再平衡的性能，有影响的是数据的总量，再平衡线程池大小以及下面章节列出的其它参数。

根据系统中缓存的数量以及缓存中存储的数据量，如果再平衡线程池的大小为1，要将所有的数据再平衡至一个节点上，会花费很长的时间。要加快预加载的进程，可以根据需要增加`IgniteConfiguration.setRebalanceThreadPoolSize`的值。

假定将`IgniteConfiguration.setRebalanceThreadPoolSize`的值设为4然后考虑上述的示例，再平衡的过程会如下所示：

 - 如果集群有两个节点和一个缓存，那么缓存的分区逻辑上会分为4个不同的组，它们会以并行的方式进行处理，每个线程处理一个组，属于一个特定组的分区会按照顺序一个一个地进行再平衡。
 - 如果集群有两个节点和两个不同的缓存，那么每个缓存的分区逻辑上都会分为四个不同的组（每个缓存都会有四个组，总共8个组），然后会有四个不同的线程并行地处理这些组，不过在一个特定的时间点，就像上面解释的那样，只有属于一个特定组（总共8个）的数据会被处理。

> 在内部，系统线程池广泛用于和缓存有关的所有操作（put，get等），SQL引擎和其它模块，因此将`IgniteConfiguration.setRebalanceThreadPoolSize`设置为一个很大的值会显著提高再平衡的性能，但是会影响应用的性能。

### 3.12.4.再平衡消息限流
当再平衡器将数据从一个节点传输到另一个节点时，它会将整个数据集拆分为多个批次然后将每一个批次作为一个单独的消息进行发送。如果数据集很大的话那么就会有很多的消息要发送，CPU和网络就会过度的消耗，这时在再平衡消息之间进行等待是合理的，以使由于再平衡过程导致的性能下降冲击最小化。这个时间间隔可以通过`CacheConfiguration`的`rebalanceThrottle`属性进行限流，它的默认值是0，意味着在消息之间没有暂停，注意单个消息的大小也可以通过`rebalanceBatchSize`属性进行设置(默认值是512K)。

比如，如果希望再平衡器间隔100ms每个消息发送2MB数据，需要提供如下的配置：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    ...
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            <!-- Set batch size. -->
            <property name="rebalanceBatchSize" value="#{2 * 1024 * 1024}"/>
 
            <!-- Set throttle interval. -->
            <property name="rebalanceThrottle" value="100"/>
            ... 
        </bean
    </property>
</bean>
```
Java：
```java
CacheConfiguration cacheCfg = new CacheConfiguration();

cacheCfg.setRebalanceBatchSize(2 * 1024 * 1024);
            
cacheCfg.setRebalanceThrottle(100);

IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setCacheConfiguration(cacheCfg);

// Start Ignite node.
Ignition.start(cfg);
```
### 3.12.5.配置
缓存的再平衡行为可以有选择地通过下面的配置属性进行定制：
**CacheConfiguration**

|setter方法|描述|默认值|
|---|---|---|
|`setRebalanceMode`|分布式缓存的再平衡模式，细节可以参照再平衡模式章节|ASYNC|
|`setRebalanceDelay`|当节点加入或者离开（故障）集群时，再平衡应该自动启动的延迟时间（毫秒），如果打算在节点离开集群后重启节点，再平衡也应该推迟，如果打算在同时启动多个节点，或者一个个启动节点的过程中，不进行再平衡，也可以推迟，只到所有节点都启动完成再进行。|0，无延迟|
|`setRebalanceBatchSize`|单个再平衡消息的大小（byte），再平衡算法会在发送数据之前将每个节点的整个数据集拆分成多个批次。|512K|
|`setRebalanceThrottle`|可以看上面的[再平衡消息限流](#_3-12-4-再平衡消息限流)章节。|0，无间隔|
|`setRebalanceOrder`|要完成的再平衡的顺序，只有同步和异步再平衡模式的缓存才可以将再平衡顺序设置为非0值，具有更小值的缓存再平衡会被首先完成，再平衡默认是无序的|0|
|`setRebalanceBatchesPrefetchCount`|为了达到更好的性能，数据提供者节点会在再平衡开始时提供不止一个批次然后在下一个请求时提供一个新的批次。这个方法会设置再平衡开始时数据提供者节点产生的批次的数量|2|
|`setRebalanceTimeout`|节点间正在交换的等待再平衡消息的超时时间|10秒|

**IgniteConfiguration**：
|setter方法|描述|默认值|
|---|---|---|
|`setRebalanceThreadPoolSize`|用于再平衡的线程的最大值|1，对整个集群的操作影响最小|

## 3.13.拓扑验证
拓扑验证器用于验证拓扑对于未来的缓存操作是否有效。

拓扑验证器在每次集群拓扑发生变化时都会被调用（或者新节点加入或者已有节点故障或者其它的）。如果没有配置拓扑验证器，那么集群拓扑会被认为一直有效。

当`TopologyValidator.validate(Collection)`方法返回true时，那么对于特定的缓存以及在这个缓存上的所有有效操作拓扑都会被认为是有效的，否则，该缓存上的所有更新操作都会抛出如下异常：

 - `CacheException`:所有试图更新的操作都会抛出（put，remove等）
 - `IgniteException`:试图进行事务提交的操作会抛出

返回false以及声明拓扑无效后，当下一次拓扑发生变化时拓扑验证器可以返回正常状态。

示例：
```java
...
for (CacheConfiguration cCfg : iCfg.getCacheConfiguration()) {
    if (cCfg.getName() != null) {
        if (cCfg.getName().equals(CACHE_NAME_1))
            cCfg.setTopologyValidator(new TopologyValidator() {
                @Override public boolean validate(Collection<ClusterNode> nodes) {
                    return nodes.size() == 2;
                }
            });
        else if (cCfg.getName().equals(CACHE_NAME_2))
            cCfg.setTopologyValidator(new TopologyValidator() {
                @Override public boolean validate(Collection<ClusterNode> nodes) {
                    return nodes.size() >= 2;
                }
            });
    }
}
...
```
在这个例子中，对缓存允许更新操作情况如下：

 - `CACHE_NAME_1`:集群具有两个节点时
 - `CACHE_NAME_2`:集群至少有两个节点时

**配置**
拓扑验证器通过`CacheConfiguration.setTopologyValidator(TopologyValidator)`方法既可以用代码也可以用XML进行配置。
## 3.14.缓存组
对于部署在集群中的一个缓存来说，总有一个开销——即缓存被拆分为分区，其状态必须在每个集群节点上进行跟踪以满足系统需要。

比如，假定一个集群节点维护了一个叫做分区映射的数据结构，它驻留在Java堆中，并且消耗了部分空间，当拓扑变更（新节点加入集群或者某个节点离开）事件触发时，分区映射会在集群节点间进行交换，并且如果Ignite的持久化开启，那么对于每个分区来说，都会在磁盘上打开一个文件进行读写，因此，如果有更多的缓存和分区：

 - 分区映射就会占用更多的Java堆，每个缓存都有自己的分区映射；
 - 新节点加入集群就会花费更多的时间；
 - 节点离开集群也会因为再平衡花费更多的时间；
 - 打开中的分区文件就会更多从而影响检查点的性能；

通常，如果只有几十甚至几百个缓存时，不用担心这些问题，但是如果增长到上千时，这类问题就会凸显。

要避免这个情况，可以考虑使用**缓存组**，一个组内的缓存会共享各种内部数据结构比如上面提到的分区映射，这样，会提高拓扑事件处理的效率以及降低整体的内存使用量。注意，从API上来看，缓存是不是组的一部分并没有什么区别。

通过配置`CacheConfiguration`的`groupName`属性可以创建一个缓存组，示例如下：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="cacheConfiguration">
    <list>
      <!-- Partitioned cache for Persons data. -->
      <bean class="org.apache.ignite.configuration.CacheConfiguration">
        <property name="name" value="Person"/>
        <property name="backups" value="1"/>
                    
        <!-- Group the cache belongs to. -->
        <property name="groupName" value="group1"/>
      </bean>

      <!-- Partitioned cache for Organizations data. -->
      <bean class="org.apache.ignite.configuration.CacheConfiguration">
        <property name="name" value="Organization"/>
        <property name="backups" value="1"/>
                    
        <!-- Group the cache belongs to. -->
        <property name="groupName" value="group1"/>
      </bean>
    </list>
  </property>
</bean>
```
Java：
```java
// Defining cluster configuration.
IgniteConfiguration cfg = new IgniteConfiguration();

// Defining Person cache configuration.
CacheConfiguration personCfg = new CacheConfiguration("Person");
        
personCfg.setBackups(1);
        
// Group the cache belongs to.
personCfg.setGroupName("group1");

// Defining Organization cache configuration.
CacheConfiguration orgCfg = new CacheConfiguration("Organization");

orgCfg.setBackups(1);

// Group the cache belongs to.
orgCfg.setGroupName("group1");
        
cfg.setCacheConfiguration(personCfg, orgCfg);
        
//Starting the node.
Ignition.start(cfg);
```
从上例来看，`Person`和`Organization`都属于`group1`。
>**键值如何区分？**
将缓存分配给一个缓存组之后，它的数据就会被存储于共享分区的内部数据结构中，插入缓存中的每个键都会附加该键所属的缓存的唯一ID，这个ID是从缓存名派生的。这些都是透明的，从而使得Ignite可以混合存储于共享分区、B+树以及分区文件中的缓存数据。

将缓存分组的原因很简单，如果决定对1000个缓存进行分组，那么存储分区数据、分区映射以及打开的Ignite持久化分区文件数量都会变为原来的千分之一。
>**分组适用于所有场景么？**
虽然有这么多的好处，但是它可能影响读操作和索引的性能，这是由于所有的数据和索引都混合在一个共享的数据结构（分区映射、B+树）中，查询的时间变长导致的。
因此，如果集群中有几十个节点上百个缓存，可以考虑使用缓存组，这样可以降低内部结构的Java堆使用量，但同时会降低检查点的性能，节点接入集群的速度也会下降。

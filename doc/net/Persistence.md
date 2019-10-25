# 持久化
## 1.原生持久化
Ignite原生持久化是一种分布式的兼容ACID和SQL的磁盘存储，其可以透明地与Ignite的固化内存集成。原生持久化是可选的，可以启用和禁用，禁用后Ignite就成为纯内存存储。

启用持久化后，就不再需要将所有数据和索引保存在内存中，也无需在节点或集群重启后进行内存预热，因为Ignite[固化内存](/doc/net/DurableMemory.md#_1-固化内存)与持久化是紧密耦合的，并将其视为二级存储，这意味着如果内存中缺少部分数据或索引，则固化内存将从磁盘中获取数据。

具体细节请参见Java版本的[相关文档](/doc/java/Persistence.md)。

### 1.1.用法
要启用分布式持久化存储，需要配置`IgniteConfiguration.PersistentStoreConfiguration`属性：

C#：
```csharp
var cfg = new IgniteConfiguration
{
    DataStorageConfiguration = new DataStorageConfiguration
    {
        DefaultDataRegionConfiguration = new DataRegionConfiguration
        {
            Name = "defaultRegion",
            PersistenceEnabled = true
        },
        DataRegionConfigurations = new[]
        {
            new DataRegionConfiguration
            {
                // Persistence is off by default.
                Name = "inMemoryRegion"
            }
        }
    },
    CacheConfiguration = new[]
    {
        new CacheConfiguration
        {
            // Default data region has persistence enabled.
            Name = "persistentCache"
        },
        new CacheConfiguration
        {
            Name = "inMemoryOnlyCache",
            DataRegionName = "inMemoryRegion"
        }
    }
};
```
app.config：
```xml
<igniteConfiguration>
  <dataStorageConfiguration>

    <!-- Enable persistence for all caches by default. -->
    <defaultDataRegionConfiguration name="defaultRegion" persistenceEnabled="true" />

    <!-- Define custom region without persistence. -->
    <dataRegionConfigurations>
      <dataRegionConfiguration name="inMemoryRegion" />
    </dataRegionConfigurations>

  </dataStorageConfiguration>
  <cacheConfiguration>

    <!-- Default region is persistent. -->
    <cacheConfiguration name="persistentCache" />

    <!-- Custom cache without persistence. -->
    <cacheConfiguration dataRegionName="inMemoryRegion" name="inMemoryOnlyCache" />

  </cacheConfiguration>
</igniteConfiguration>
```
启用持久化存储后，所有的数据和索引都会同时保存在内存和磁盘上。

如果Ignite发现启用了持久化，会将集群从激活状态转为非激活状态，这时应用非经允许无法对数据进行修改。这样做是为了避免应用在集群重启的过程中修改持久化的、可能还未准备好的数据的情况。因此这时的常规做法是等待所有节点加入集群，然后从应用或者任何节点调用`IIgnite.SetActive(true)`，以将集群转为激活状态。
::: tip 持久化存储根路径
Ignite中所有数据默认保存在工作目录（`IGNITE_HOME\work`），可以通过`PersistentStoreConfiguration.PersistentStorePath`属性对默认值进行修改。
:::
## 2.第三方持久化
Ignite.NET针对底层持久化存储（例如Oracle、MSSQL等RDBMS或MongoDB、Couchbase之类的NoSQL数据库）的**通读**和**通写**，提供了`ICacheStore`API。

![](https://files.readme.io/94a0f76-in_memory_data.png)

### 2.1.通读和通写
当需要进行通读或通写行为时，提供正确的缓存存储实现非常重要。通读即如果数据在缓存中无效，会从持久化存储中读取数据，而通写则是如果缓存数据发生了更新，数据会自动持久化。所有的通读和通写操作将参与整个缓存事务，并在整体上进行提交或回滚。

要配置通读和通写，需要实现`ICacheStore`接口，并在配置文件中配置`CacheConfiguration`的`cacheStoreFactory`、`readThrough`和`writeThrough`属性，后面会有示例。

### 2.2.后写缓存
在简单的通写模式下，每个缓存的写入和删除操作都将涉及对持久化存储的相应请求，因此缓存更新的总持续时间可能相对较长，此外密集的缓存更新可能会导致极高的存储负载。

对于此类情况，Ignite提供了异步持久化更新选项（也称为`后写`）。此方法的关键概念是累积更新，然后将其批量异步刷新到持久化存储中。实际的数据持久化可以通过基于时间的事件（数据可以在队列中驻留的最大时间受到限制）或队列大小的事件（队列的大小达到某个特定点时刷新）来触发，也可以将两者结合在一起，这时任一事件都会触发刷新。

::: tip 更新顺序
使用后写的方式，只有数据的最后一次更新会被写入底层存储。如果键为`key1`的数据分别用值`value1`、`value2`和`value3`进行更新，则只将（`key1`，`value3`）这个请求传播到持久化。
:::

::: tip 更新性能
批量操作通常比一系列的单个操作更有效率，因此可以通过在后写模式下启用批量操作来利用此功能。可以将相似类型的更新序列（写入或删除）组合为一个批次，例如可以将（`key1`，`value1`）、（`key2`，`value2`）和（`key3`，`value3`）的顺序写入组合到单个`CacheStore.putAll(...)`操作中。
:::

可以通过`CacheConfiguration.writeBehindEnabled`属性启用后写缓存，有关后写缓存的可自定义属性列表，请参见下面的[配置](#_2-5-配置)部分。

### 2.3.ICacheStore
Ignite.NET中的`ICacheStore`接口用于和底层数据存储之间的数据读写。

::: tip 事务
`ICacheStore`是完全事务性的，会自动合并到正在进行的缓存事务中。
:::

**LoadCache()**

`ICacheStore.LoadCache()`用于缓存数据加载，即使没有传入要加载的键也可以。它通常用于启动时预热缓存，但是也可以在启动缓存后的任何时候调用它。

`ICache.LoadCache()`方法将委派给持有该缓存的节点的`ICacheStore.LoadCache()`方法，如果希望仅在本地节点上调用加载，可以使用`ICache.LocalLoadCache()`方法。
::: tip 提示
如果是分区缓存，对于不是映射到该节点的键（无论是主还是备）将被缓存自动丢弃。
:::

**Load(),Write(),Delete()**

当调用`ICache`接口的`Get()`、`Put()`以及`Remove()`方法时，会相对应地调用`ICacheStore`的`Load()`、`Write()`以及`Delete()`方法，在处理单个缓存数据时，这些方法用于实现通读和通写行为。

**LoadAll(),WriteAll(),DeleteAll()**

当调用`ICache`接口的`GetAll()`、`PutAll()`以及`RemoveAll()`方法时，会相对应地调用`ICacheStore`的`LoadAll()`、`WriteAll()`以及`DeleteAll()`方法，在处理多个缓存数据时，这些方法用于实现通读和通写行为，通常通过批量操作以实现更好的性能。
::: tip 提示
`CacheStoreAdapter`提供了`LoadAll()`、`WriteAll()`和`DeleteAll()`这些方法的默认实现，它们只是简单地一个个迭代所有键。
:::

**SessionEnd()**

Ignite有一个存储会话的概念，该概念可能跨越多个缓存存储操作，会话在处理事务时特别有用。

如果是`ATOMIC`模式缓存，则在每个`ICacheStore`方法完成后调用`SessionEnd()`方法。如果使用`TRANSACTIONAL`模式缓存，则在每个事务结束时调用`SessionEnd()`，其可以在底层存储上提交或回滚多个操作。
::: tip 提示
`CacheStoreAdapater`提供了`SessionEnd()`方法的默认空实现。
:::

### 2.4.CacheStoreSession
缓存存储会话的主要目的是在缓存事务中使用`ICacheStore`时，保持多个存储调用之间的上下文。例如如果将数据库用作持久化存储，则可以存储该数据库的连接。然后可以在`ICacheStore.SessionEnd(boolean)`方法中提交此连接。

`CacheStoreSession`可以通过`StoreSessionResource`属性注入到缓存存储实现中。

### 2.5.配置
以下的参数可用于通过`IgniteConfiguration.CacheConfiguration`启用和配置后写缓存：

|属性|描述|默认值|
|---|---|---|
|`WriteBehindEnabled`|设置后写是否启用的标志|false|
|`WriteBehindFlushSize`|后写缓存的最大值，如果超过了这个限值，所有的缓存数据都会被刷入CacheStore然后写缓存被清空。如果值为0，刷新操作将会依据刷新频率间隔，注意不能将写缓存大小和刷新频率都设置为0|10240|
|`WriteBehindFlushFrequency`|后写缓存的刷新频率，单位为毫秒，该值定义了从对缓存对象进行插入/删除和当相应的操作被施加到CacheStore的时刻之间的最大时间间隔。如果值为0，刷新会依据写缓存大小，注意不能将写缓存大小和刷新频率都设置为0|5000毫秒|
|`WriteBehindFlushThreadCount`|执行缓存刷新的线程数|1|
|`WriteBehindBatchSize`|后写缓存存储操作的操作数最大值|512|

`ICacheStore`接口可以在`CacheConfiguration`中通过`PlatformDotNetCacheStoreFactory`，以代码或者配置文件的方式进行配置：

C#：
```csharp
var cfg = new IgniteConfiguration
{
    CacheConfiguration = new[]
    {
        new CacheConfiguration {CacheStoreFactory = new MyStoreFactory()}
    }
};
```
app.config：
```xml
<igniteConfiguration>
    <cacheConfiguration>
        <cacheConfiguration>
            <cacheStoreFactory type="MyNamespace.MyStoreFactory, MyAssembly" />
        </cacheConfiguration>
    </cacheConfiguration>
</igniteConfiguration>
```
Spring XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  ...
    <property name="cacheConfiguration">
      <list>
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
          ...
          <property name="cacheStoreFactory">
            <bean class="org.apache.ignite.platform.dotnet.PlatformDotNetCacheStoreFactory">
              <property name="typeName" value="MyNamespace.MyStoreFactory, MyAssembly"/>
            </bean>
	    		</property>
    			...
    		</bean>
    	</list>
    </property>
  ...
</bean>
```

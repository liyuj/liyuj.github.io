# 持久化
## 1.Ignite持久化
Ignite原生持久化是一个分布式的兼容ACID和SQL的磁盘存储，它与Ignite的固化内存透明地集成在一起。Ignite持久化是可选的，可以打开和关闭。关闭时，Ignite就是一个纯粹的内存存储。

启用原生持久化后，Ignite就会在磁盘上存储数据的超集，然后会根据容量在RAM中存储尽可能多的数据。例如，如果有100个条目且RAM只能存储20个，那么所有100个将存储在磁盘上，只有20个将缓存在RAM中以获得更好的性能。

此外，值得一提的是，与纯内存的场景一样，当启用持久化时，每个节点仅持有数据的一个子集，仅包括节点做为主节点或备份节点的分区。而整个集群则持有完整的数据集。

具体的细节可以参见Java版本的[持久化](/doc/java/Persistence.md#_1-ignite持久化)文档。
### 1.1.用法
要启用原生持久化，需要在节点的配置中配置`DataStorageConfiguration`：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  <!-- Enabling Apache Ignite native persistence. -->
  <property name="dataStorageConfiguration">
    <bean class="org.apache.ignite.configuration.DataStorageConfiguration">
      <property name="defaultDataRegionConfiguration">
        <bean class="org.apache.ignite.configuration.DataRegionConfiguration">
          <property name="persistenceEnabled" value="true"/>
        </bean>
      </property>
    </bean>
  </property>

  <!-- Additional setting. -->

</bean>
```
启用持久化后，所有数据和索引都将存储在对应节点的内存和磁盘上。
## 2.第三方持久化
### 2.1.概述
除了[Ignite原生持久化](#_7-1-ignite持久化)之外，Ignite C++还可以使用第三方存储来实现持久化。可以使用关系数据库这样的底层存储，然后将缓存配置为**通写**、**后写**或者**通读**模式。通过这些配置，Ignite C++可以自动地将所有更新发送给持久化层，也可以对数据进行按需预加载。

![](https://files.readme.io/9a17490-in_memory_data.png)

::: tip 注意
目前，Ignite C++没有实现整套缓存存储相关的API。如果需要只有Java版本才有的功能，那就得使用Java版本。
:::
### 2.2.通读和通写
如果需要通读或通写功能，就得配置争取的缓存存储。通读就是数据在缓存中不可用，就会从底层存储中读取，而通写则是如果在缓存中更新了数据，数据会自动持久化。所有的通读和通写操作都将参与整体缓存事务，并将作为整体提交或回滚。

要配置通读和通写，需要配置`CacheConfiguration`中`cacheStoreFactory`的`readThrough`和`writeThrough`属性，如下所示：

<code-group>
<code-block title="自定义存储">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  ...
    <property name="cacheConfiguration">
      <list>
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
          ...
          <property name="cacheStoreFactory">
            <bean class="javax.cache.configuration.FactoryBuilder" factory-method="factoryOf">
              <constructor-arg value="foo.bar.MyPersonStore"/>
            </bean>
          </property>
          <property name="readThrough" value="true"/>
          <property name="writeThrough"  value="true"/>
        </bean>
    	</list>
    </property>
  ...
</bean>
```
</code-block>

<code-block title="CacheJdbcBlobStoreFactory">

```xml
<bean id= "simpleDataSource" class="org.h2.jdbcx.JdbcDataSource"/>

<bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
  ...
   <property name="cacheConfiguration">
     <list>
       <bean class="org.apache.ignite.configuration.CacheConfiguration">
         ...
           <property name="cacheStoreFactory">
             <bean class="org.apache.ignite.cache.store.jdbc.CacheJdbcBlobStoreFactory">
               <property name="user" value = "user" />
               <property name="dataSourceBean" value = "simpleDataSource" />
             </bean>
           </property>
       </bean>
      </list>
    </property>
  ...
</bean>
```
</code-block>

<code-block title="CacheJdbcPojoStore">

```xml
<bean id= "simpleDataSource" class="org.h2.jdbcx.JdbcDataSource"/>

<bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
  ...
    <property name="cacheConfiguration">
      <list>
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
          ...
            <property name="cacheStoreFactory">
              <bean class="org.apache.ignite.cache.store.jdbc.CacheJdbcPojoStoreFactory">
                <property name="dataSourceBean" value = "simpleDataSource" />
              </bean>
            </property>
        </bean>
      </list>
    </property>
</bean>
```
</code-block>

<code-block title="CacheHibernateBlobStore">

```xml
<bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
  ...
    <property name="cacheConfiguration">
      <list>
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
          <bean class="org.apache.ignite.cache.store.hibernate.CacheHibernateBlobStoreFactory">
           <property name="hibernateProperties">
             <props>
               <prop key="connection.url">jdbc:h2:mem:</prop>
               <prop key="hbm2ddl.auto">update</prop>
               <prop key="show_sql">true</prop>
             </props>
           </property>
         </bean>
       </list>
    </property>
  ...
</bean>
```
</code-block>

</code-group>

::: warning Ignite C++缓存存储
目前，可以使用Java Spring XML配置来配置CacheStore及其属性，在以后的版本中将支持原生C++的方式。
:::
### 2.3.后写
在简单的通写模式中，每个缓存的写入和删除操作都会涉及一个对应持久化存储的请求，因此缓存更新的总持续时间可能相对较长。此外，密集的缓存更新也可能会导致极高的存储负载。

对于这种场景，Ignite提供了一个异步持久化更新的选项，也称为**后写**。此方法的关键点是累积更新，然后将其作为批量操作异步刷新到底层数据库。实际的数据持久化可以由相关的事件触发刷新，这些事件可以基于时间（数据条目驻留在队列中的最长时间是有限的），也可以基于队列大小（当队列大小达到某个特定点时），也可以同时使用两者。

::: tip 更新顺序
使用后写方法，只有对条目的最后更新才会写入底层存储。如果键为`key1`的缓存条目分别按照值`value1`、`value2`和`value3`的顺序更新，则只有（`key1`，`value3`）的单个数据对存储请求会被传播到持久化存储。
:::
::: tip 更新性能
批量存储操作通常比单个存储操作序列更有效。可以通过在后写模式下启用批处理操作来开启该功能。可以将类似类型（写入或移除）的更新序列分为多个批次，例如，（key1，value1），（key2，value2），（key3，value3）这样的顺序写入操作，可以作为一个批量写入操作。
:::
后写缓存可以通过`CacheConfiguration.writeBehindEnabled(boolean)`配置属性来开启：
```xml
<bean class="org.apache.ignite.configuration.CacheConfiguration">
    ...
    <property name="readThrough" value="true"/>
    <property name="writeThrough" value="true"/>
    <property name="writeBehindEnabled" value="true"/>
    <property name="writeBehindFlushSize" value="0"/>
    <property name="writeBehindFlushFrequency" value="10000"/>
    <property name="writeBehindFlushThreadCount" value="2"/>
    <property name="writeBehindBatchSize" value="1024"/>
    ...
</bean>
```
### 2.4.缓存加载
要将数据从持久化存储加载到缓存，可以使用`Cache::LoadCache()`方法。它通常用于在启动时热加载缓存，不过也可以在缓存启动后的任何时刻调用。

要仅在本地节点上加载，请使用`Cache.LocalLoadCache()`方法。
::: tip 注意
在预加载分区缓存期间，将自动丢弃节点既不是主节点也不备份节点的数据。
:::
```cpp
// Preparing cache configuration.
IgniteConfiguration cfg;
cfg.springCfgPath = "my_ignite_config.xml";

Ignite node = Ignition::Start(cfg);

// Starting the cache.
Cache<int32_t, Person> cache = node.GetOrCreateCache<int32_t, Person>("myCache");

// Initiating cache loading.
cache.LoadCache();
```
<RightPane/>
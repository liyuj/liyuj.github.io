# 分布式数据结构
## 1.原子化类型
Ignite支持分布式`atomic long`、`atomic reference`和`atomic sequence`，并提供了类似于`System.Threading.Interlocked`API的类。

Ignite的原子类型是在整个集群中分布的，即可在全局范围内执行原子操作（例如`Increment`或`CompareExchange`）。例如，可以在一个节点上更新一个原子长整形值，然后从另一个节点进行读取。

**功能特性：**

 - 获取当前值；
 - 以原子方式修改当前值；
 - 以原子方式增加或减少当前值；
 - 以原子方式将当前值替换为新值；

可以通过`IAtomicLong`接口获得分布式原子化长整形，如下所示：
```csharp
IIgnite ignite = Ignition.Start();

IAtomicLong atomicLong = ignite.GetAtomicLong(
    "atomicName", // Atomic long name.
    0,        		// Initial value.
    false     		// Create if it does not exist.
)
```
`IAtomicLong`的用法如下：
```csharp
IIgnite ignite = Ignition.Start();

// Initialize atomic long.
IAtomicLong atomicLong = ignite.GetAtomicLong("atomicName", 0, true);

// Increment atomic long on local node.
Console.WriteLine("Incremented value: " + atomicLong.Increment());

```
`IAtomicLong`提供的所有原子化操作都是同步化的，花费的时间取决于使用相同原子长整形实例执行并发操作的节点数、这些操作的强度以及网络延迟。
::: tip 提示
`ICache`接口有`PutIfAbsent()`和`Replace()`方法，它们提供与原子类型相同的CompareExchange功能。
:::
### 1.1.原子类型配置
Ignite中的原子化类型可以通过`IgniteConfiguration`的`AtomicConfiguration`属性进行配置，可用的参数如下：

|属性|描述|默认值|
|---|---|---|
|`Backups`|配置备份数|0|
|`CacheMode`|配置原子类型的缓存模式|`Partitioned`|
|`AtomicSequenceReserveSize`|配置`IgniteAtomicSequence`实例预留的序列值数量|1000|

**示例**

C#：
```csharp
var cfg = new IgniteConfiguration
{
    AtomicConfiguration = new AtomicConfiguration
    {
        Backups = 1,
        CacheMode = CacheMode.Partitioned,
        AtomicSequenceReserveSize = 5000
    }
};
```
app.config：
```xml
<igniteConfiguration>
    <atomicConfiguration backups='1' cacheMode='Partitioned' atomicSequenceReserveSize='5000' />
</igniteConfiguration>
```
Spring XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    ...
    <property name="atomicConfiguration">
        <bean class="org.apache.ignite.configuration.AtomicConfiguration">
            <!-- Set number of backups. -->
            <property name="backups" value="1"/>

          	<!-- Set cache mode. -->
          	<property name="cacheMode" value="PARTITIONED"/>
        </bean>
    </property>
</bean>
```

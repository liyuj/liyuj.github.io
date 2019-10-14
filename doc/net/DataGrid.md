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

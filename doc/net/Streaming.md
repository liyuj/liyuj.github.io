# 流式处理
## 1.流式处理
Ignite流式处理可以以可扩展和容错的方式处理持续不断的数据流，将数据注入Ignite的速度可以非常高，每秒可以轻松超过上百万个事件。

**工作方式**

 1. 客户端节点使用[数据流处理器](#_2-数据流处理器)将有限或者持续不断的数据流注入Ignite缓存；
 2. 数据自动在Ignite节点间分区，每个节点获得等量的数据；
 3. 流化数据可以直接在Ignite节点上以并置的方式批量处理；
 4. 客户端可以在流化数据上并发地执行SQL查询。

![](https://files.readme.io/ea1452e-ignite-stream-query.png)

**数据流处理器**

数据流处理器通过`IDataStreamer`API定义，用于往Ignite缓存中注入大量持续不断的数据流。数据流处理器支持扩展和容错，并为所有注入Ignite的流式数据提供至少一次保证的语义。

**数据查询**

可以使用完整的Ignite数据索引能力，再加上Ignite的SQL、文本和基于谓词的缓存查询，可以对流式数据进行查询。

## 2.数据流处理器
**IDataStreamer**

将大量的数据流快速注入Ignite的主要抽象为`IDataStreamer`，其在内部会对数据进行批量化处理，并且会按照数据所属的节点对数据进行并置。

高加载速度是通过如下技术实现的：

 - 映射到同一个节点的数据先批量进入一个缓冲区；
 - 多个缓冲区可以共存；
 - 为了避免运行时内存溢出，数据流处理器有一个可以并发处理的最大缓冲区数。

要往数据流处理器中添加数据，需要调用`IDataStreamer.AddData(...)`方法。
```csharp
using (var ldr = ignite.GetDataStreamer<int, Account>("myStreamCache"))
{
    for (int i = 0; i < EntryCount; i++)
        ldr.AddData(i, new Account(i, i));
}
```
**允许覆盖**

数据流处理器默认是不可以覆写已有的数据的，这意味着会跳过缓存中已有的数据。这是一个高效的模式，因为数据流处理器不用担心后台的数据版本。

如果预计数据在缓存中可能会存在，并且希望覆盖它，则需要将`IDataStreamer.AllowOverwrite`属性配置为`true`。

::: tip 处理器、缓存存储和AllowOverwrite
`AllowOverwrite`属性如果为`false`（默认），即使`SkipStore`属性为`false`，也会忽略[持久化存储](/doc/net/Persistence.md#_2-第三方持久化)。

只有`AllowOverwrite`为`true`时，缓存存储才会被调用。
:::
**StreamReceiver**

如果希望执行一些自定义的业务逻辑，而不仅仅是添加数据，这时可以利用`IStreamReceiver`API。

流接收器可以直接在将要缓存数据的节点上以并置方式对流数据做出反应，可以在将数据注入缓存之前修改数据或向其中添加任何自定义业务逻辑。
::: tip 提示
注意`IStreamReceiver`不会自动将数据注入缓存，需要显式调用`ICache.Put(...)`等方法。
:::

**StreamTransformer**

`StreamTransformer`是`IStreamReceiver`的简化实现，其可以根据前值更新缓存中的数据。更新是并置的，即更新发生在存储数据的节点上。

**StreamVisitor**

`StreamVisitor`也是一种`IStreamReceiver`的简化实现，它会读取流中的每个键值对，注意其不会更新缓存。如果数据需要存储在缓存中，则应显式调用`ICache.Put(...)`等方法。
<RightPane/>
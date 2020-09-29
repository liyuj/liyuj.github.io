# 分布式事件
## 1.本地和远程事件
Ignite分布式事件功能使得应用可以接收分布式环境中发生的各种事件通知，可以自动获得有关集群中本地或远程节点上发生的任务执行、读，写或查询操作的通知。

该功能是通过`IEvents`接口提供的，通过如下方式可以获取`IEvents`接口的实例：
```csharp
IIgnite ignite = Ignition.Start()

IEvents evts = ignite.GetEvents();
```
### 1.1.订阅事件
`Listen`方法可用于接收集群中发生的指定事件的通知。该方法会在本地节点为指定事件注册一个监听器。当任何节点发生该事件时，都会通知该监听器。
```csharp
void Events()
{
    using (IIgnite ignite = Ignition.Start())
    {
        IEvents events = ignite.GetEvents();

        var listener = new CacheEventListener();

        // Subscribe to cache events.
        events.LocalListen(listener, EventType.CacheObjectPut, EventType.CacheObjectRead);

        // Generate event by adding cache entry.
        ignite.GetOrCreateCache<int, int>("myCache").Put(1, 1);

        // Unsubscribe.
        events.StopLocalListen(listener);
    }
}

class CacheEventListener : IEventListener<CacheEvent>
{
    public bool Invoke(CacheEvent evt)
    {
        Console.WriteLine("Received event [evt={0}, key={1}, oldVal={2}, newVal={3}]", evt.Name, evt.Key, evt.OldValue, evt.NewValue);

        return true; // Continue listening.
    }
}
```
::: tip 注意
`EventType`类定义了可用于监听方法的各种事件类型常量。`IEventListener`的泛型参数应对应于订阅的事件类型（例如`CacheEvent`对于`EventType.Cache*`）。另外`IEvent`可用于接收任何类型的事件。
:::
::: warning 警告
在`LocalListen(...)`方法中以参数传递的事件类型，也需要在`IgniteConfiguration`中进行配置，具体参见下面的[配置](#_1-3-配置)章节。
:::
### 1.2.事件的查询
系统中产生的所有事件均保存在本地节点上，`IEvents`API提供了查询这些事件的方法。

**远程事件**

`RemoteQuery(...)`方法可通过传入的谓词过滤器查询指定远程节点上的事件。
### 1.3.配置
要接收集群中任何缓存或者任务的通知，必须配置`IgniteConfiguration`中的`includeEventTypes`属性：

<code-group>
<code-block title="C#">

```csharp
var cfg = new IgniteConfiguration
{
    IncludedEventTypes = {EventType.TaskFailed, EventType.JobFinished}
};
```
</code-block>

<code-block title="app.config">

```xml
<igniteConfiguration>
    <includedEventTypes>
        <int>TaskFailed</int>
        <int>JobFinished</int>
    </includedEventTypes>
</igniteConfiguration>
```
</code-block>

<code-block title="Spring XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
 		...
    <property name="includeEventTypes">
        <util:constant static-field="org.apache.ignite.events.EventType.EVT_TASK_FAILED"/>
        <util:constant static-field="org.apache.ignite.events.EventType.EVT_JOB_FINISHED"/>
    </property>
  	...
</bean>
```
</code-block>

</code-group>

事件通知因为性能原因默认是关闭的。
::: tip 提示
因为每秒会生成大量的事件，所以会给系统带来额外的负担，这会导致明显的性能下降。因此强烈建议仅启用应用的业务逻辑所需的那些事件。
:::
<RightPane/>
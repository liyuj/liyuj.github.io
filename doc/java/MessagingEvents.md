# 消息和事件
## 1.基于主题的消息
### 1.1.概述
Ignite分布式消息可以在集群内的所有节点间进行基于主题的通信，带有特定消息主题的消息可以分布到订阅了该主题的所有节点或者节点的子集。

Ignite消息基于发布-订阅范式，发布者和订阅者通过一个通用的主题连接在一起。当一个节点针对主题T发布了一个消息A，它会被分布到所有订阅了主题T的节点。

::: tip 注意
任意加入集群的新节点会自动地订阅集群内（或者集群组内）其它节点订阅的所有的主题。
:::

### 1.2.IgniteMessaging
Ignite中的分布式消息功能是通过`IgniteMessaging`接口提供的，可以像下面这样获得一个`IgniteMessaging`的实例：
```java
Ignite ignite = Ignition.ignite();

// Messaging instance over this cluster.
IgniteMessaging msg = ignite.message();

// Messaging instance over given cluster group (in this case, remote nodes).
IgniteMessaging rmtMsg = ignite.message(ignite.cluster().forRemotes());
```
### 1.3.发布消息
send方法可以将一个带有特定消息主题的消息发送/发布到所有的节点，消息可以以*有序*也可以以*无序*的方式发送。

**有序消息**

**sendOrdered(...)**可以用于希望按照发送消息的顺序接收消息的场合，可以传递一个timeout参数来指定一个消息可以在队列中保持多长时间来等待发送之前的消息。如果达到了超时时间，那么还没有到达该节点上指定主题的所有消息都会被忽略。

**无序消息**

`send(...)`方法不保证消息的顺序，这意味着，当顺序地发送消息A和消息B，不能保证目标节点先收到A后收到B。
### 1.4.订阅消息
`listen`方法可以监听/订阅消息。当这些方法被调用时，带有指定消息主题的监听器就会被注册到所有的（或者集群组）节点来监听新的消息。对于listen方法，可以传入一个返回boolean值的谓词，它会告诉监听器是继续还是停止监听新的消息。

**本地监听**

`localListen(...)`方法只在本地节点注册了一个带有指定主题的消息监听器然后监听来自集群内任意节点的消息。

**远程监听**

`remoteListen(...)`方法在集群内的所有节点上注册了一个带有指定主题的监听器然后监听来自集群内任意节点的消息。
### 1.5.示例
下面的示例显示了在远程节点间的消息交换：

<code-group>
<code-block title="有序消息">

```java
Ignite ignite = Ignition.ignite();

IgniteMessaging rmtMsg = ignite.message(ignite.cluster().forRemotes());

// Add listener for unordered messages on all remote nodes.
rmtMsg.remoteListen("MyOrderedTopic", (nodeId, msg) -> {
    System.out.println("Received ordered message [msg=" + msg + ", from=" + nodeId + ']');

    return true; // Return true to continue listening.
});

// Send ordered messages to remote nodes.
for (int i = 0; i < 10; i++)
    rmtMsg.sendOrdered("MyOrderedTopic", Integer.toString(i),0);
```
</code-block>

<code-block title="无序消息">

```java
Ignite ignite = Ignition.ignite();

IgniteMessaging rmtMsg = ignite.message(ignite.cluster().forRemotes());

// Add listener for unordered messages on all remote nodes.
rmtMsg.remoteListen("MyUnOrderedTopic", (nodeId, msg) -> {
    System.out.println("Received unordered message [msg=" + msg + ", from=" + nodeId + ']');

    return true; // Return true to continue listening.
});

// Send unordered messages to remote nodes.
for (int i = 0; i < 10; i++)
    rmtMsg.send("MyUnOrderedTopic", Integer.toString(i));
```
</code-block>

</code-group>

## 2.本地和远程事件
### 2.1.概述
Ignite分布式事件功能使得在分布式集群环境下发生各种各样事件时应用可以接收到通知。可以自动获得比如任务执行、发生在本地或者远程节点上的读写或者查询操作的通知。
### 2.2.IgniteEvents API
分布式事件功能是通过`IgniteEvents`接口提供的，可以通过如下方式从Ignite中获得`IgniteEvents`的实例：
```java
Ignite ignite = Ignition.ignite();

IgniteEvents evts = ignite.events();
```
### 2.3.订阅事件
监听方法可以接收集群内发生的指定事件的通知，这些方法在本地或者远程节点上注册了一个指定事件的监听器，当在该节点上发生该事件时，会通知该监听器。

**本地事件**

如果希望在本地节点监听事件，需要通过`IgniteConfiguration`的`setLocalEventListeners(...)`方法配置本地事件监听器，还可以使用`IgniteEvents`的`localListen(...)`方法，但是要注意`localListen(...)`方法调用前的事件会错过。

**远程事件**

`remoteListen(...)`方法会在集群或者集群组内的所有节点上针对指定事件注册监听器。
下面是每个方法的示例：

<code-group>
<code-block title="本地监听">

```java
Ignite ignite = Ignition.ignite();

// Local listener that listenes to local events.
IgnitePredicate<CacheEvent> locLsnr = evt -> {
  System.out.println("Received event [evt=" + evt.name() + ", key=" + evt.key() +
    ", oldVal=" + evt.oldValue() + ", newVal=" + evt.newValue());

  return true; // Continue listening.
};

// Subscribe to specified cache events occuring on local node.
ignite.events().localListen(locLsnr,
  EventType.EVT_CACHE_OBJECT_PUT,
  EventType.EVT_CACHE_OBJECT_READ,
  EventType.EVT_CACHE_OBJECT_REMOVED);

// Get an instance of named cache.
final IgniteCache<Integer, String> cache = ignite.cache("cacheName");

// Generate cache events.
for (int i = 0; i < 20; i++)
  cache.put(i, Integer.toString(i));
```
</code-block>

<code-block title="远程监听">

```java
Ignite ignite = Ignition.ignite();

// Get an instance of named cache.
final IgniteCache<Integer, String> cache = ignite.cache("cacheName");

// Sample remote filter which only accepts events for keys
// that are greater than or equal to 10.
IgnitePredicate<CacheEvent> rmtLsnr = evt -> evt.<Integer>key() >= 10;

// Subscribe to specified cache events on all nodes that have cache running.
ignite.events(ignite.cluster().forCacheNodes("cacheName")).remoteListen(null, rmtLsnr,                                                                 EventType.EVT_CACHE_OBJECT_PUT,
  EventType.EVT_CACHE_OBJECT_READ,
  EventType.EVT_CACHE_OBJECT_REMOVED);

// Generate cache events.
for (int i = 0; i < 20; i++)
  cache.put(i, Integer.toString(i));
```
</code-block>

</code-group>

在上述示例中，`EVT_CACHE_OBJECT_PUT`,`EVT_CACHE_OBJECT_READ`,`EVT_CACHE_OBJECT_REMOVED`是在`EventType`接口中预定义的事件类型常量。

::: tip 注意
`EventType`接口定义了监听方法可用的各种事件类型常量，可以在相关的[javadoc](https://ignite.apache.org/releases/latest/javadoc/)中看到这些事件类型的完整列表。
:::

::: warning 警告
作为参数传入`localListen(...)`和`remoteListen(...)`方法的事件类型还必须在`IgniteConfiguration`中进行配置，可以参照下面的[配置](#_2-5-配置)章节。
:::

### 2.4.事件的查询
系统生成的所有事件都会保持在本地节点的本地，`IgniteEvents`API提供了查询这些事件的方法。

**本地事件**

`localQuery(...)`方法通过传入的谓词过滤器在本地节点上进行事件的查询。如果满足了所有的条件，就会返回一个本地节点发生的所有事件的集合。

**远程事件**

`remoteQuery(...)`方法通过传入的谓词过滤器在远程节点上进行事件的异步查询。这个操作是分布式的，因此可能在通信层发生故障而且通常也会比本地事件通知花费更多的时间，注意这个方法是非阻塞的，然后附带`Future`立即返回。
### 2.5.配置
要获得集群内发生的任意任务或者缓存事件的通知，`IgniteConfiguration`的`includeEventTypes`属性必须启用：

<code-group>
<code-block title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    ...
    <!-- Enable cache events. -->
    <property name="includeEventTypes">
        <util:constant static-field="org.apache.ignite.events.EventType.EVTS_CACHE"/>
    </property>
    ...
</bean>
```
</code-block>

<code-block title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

// Enable cache events.
cfg.setIncludeEventTypes(EVTS_CACHE);

// Start Ignite node.
Ignition.start(cfg);
```
</code-block>

</code-group>

因为性能原因事件通知默认是关闭的。

::: tip 注意
因为每秒生成上千的事件，它会在系统中产生额外的负载，这会导致显著的性能下降。因此强烈建议只有在应用逻辑必需时才启用这些事件。
:::

## 3.自动化批处理
Ignite会自动地对集群内发生的，作为缓存事件的结果生成的事件通知进行分组或者分批处理。

缓存内的每个事件都会导致一个事件通知被生成以及发送，对于缓存活动频繁的系统，获取每个事件的通知都将是网络密集的，可能导致集群内缓存操作的性能下降。

Ignite中，事件通知可以被分组然后分批地或者定时地发送，下面是一个如何实现这一点的示例：
```java
Ignite ignite = Ignition.ignite();

// Get an instance of named cache.
final IgniteCache<Integer, String> cache = ignite.cache("cacheName");

// Sample remote filter which only accepts events for keys
// that are greater than or equal to 10.
IgnitePredicate<CacheEvent> rmtLsnr = new IgnitePredicate<CacheEvent>() {
    @Override public boolean apply(CacheEvent evt) {
        System.out.println("Cache event: " + evt);

        int key = evt.key();

        return key >= 10;
    }
};

// Subscribe to cache events occuring on all nodes
// that have the specified cache running.
// Send notifications in batches of 10.
ignite.events(ignite.cluster().forCacheNodes("cacheName")).remoteListen(
		10 /*batch size*/, 0 /*time intervals*/, false, null, rmtLsnr, EVTS_CACHE);

// Generate cache events.
for (int i = 0; i < 20; i++)
    cache.put(i, Integer.toString(i));
```
<RightPane/>
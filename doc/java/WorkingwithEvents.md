# Ignite事件
## 1.启用和监听事件
### 1.1.概述
Ignite可以为集群中发生的各种操作生成事件，并将这些操作通知应用。事件的类型很多，包括缓存事件、节点发现事件、分布式任务执行事件等等。

完整的可用事件列表在[事件](#_2-事件)章节有介绍。
### 1.2.启用事件
事件默认是禁用的，开发者需要显式启用每个想要使用的事件类型。要启用某个事件类型，需要将其在`IgniteConfiguration`的`includeEventTypes`属性中列出，如下所示：

<Tabs>
<Tab title="XML">

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!--
  Licensed to the Apache Software Foundation (ASF) under one or more
  contributor license agreements.  See the NOTICE file distributed with
  this work for additional information regarding copyright ownership.
  The ASF licenses this file to You under the Apache License, Version 2.0
  (the "License"); you may not use this file except in compliance with
  the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:util="http://www.springframework.org/schema/util"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="         http://www.springframework.org/schema/beans
    http://www.springframework.org/schema/beans/spring-beans.xsd
    http://www.springframework.org/schema/util
    http://www.springframework.org/schema/util/spring-util.xsd">

    <bean class="org.apache.ignite.configuration.IgniteConfiguration">

        <property name="includeEventTypes">
            <list>
                <util:constant static-field="org.apache.ignite.events.EventType.EVT_CACHE_OBJECT_PUT"/>
                <util:constant static-field="org.apache.ignite.events.EventType.EVT_CACHE_OBJECT_READ"/>
                <util:constant static-field="org.apache.ignite.events.EventType.EVT_CACHE_OBJECT_REMOVED"/>
                <util:constant static-field="org.apache.ignite.events.EventType.EVT_NODE_LEFT"/>
                <util:constant static-field="org.apache.ignite.events.EventType.EVT_NODE_JOINED"/>
            </list>
        </property>
    </bean>

</beans>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

// Enable cache events.
cfg.setIncludeEventTypes(EventType.EVT_CACHE_OBJECT_PUT, EventType.EVT_CACHE_OBJECT_READ,
        EventType.EVT_CACHE_OBJECT_REMOVED, EventType.EVT_NODE_JOINED, EventType.EVT_NODE_LEFT);

// Start the node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    IncludedEventTypes = new[]
    {
        EventType.CacheObjectPut,
        EventType.CacheObjectRead,
        EventType.CacheObjectRemoved,
        EventType.NodeJoined,
        EventType.NodeLeft
    }
};
var ignite = Ignition.Start(cfg);
```
</Tab>
</Tabs>

### 1.3.获得事件接口
事件功能是通过事件接口实现的，该接口提供了监听集群事件的方法，该事件接口可以通过`Ignite`实例获得，如下所示：

<Tabs>
<Tab title="Java">

```java
IgniteEvents events = ignite.events();
```
</Tab>

<Tab title="C#/.NET">

```csharp
var ignite = Ignition.GetIgnite();
var events = ignite.GetEvents();
```
</Tab>
</Tabs>

事件接口可以与[一组节点](/doc/java/DistributedComputing.md#_2-集群组)相关联，这意味着可以访问在特定节点集上发生的事件。在下面的示例中，获得的事件接口对应的是持有`Person`缓存数据的节点集。

<Tabs>
<Tab title="Java">

```java
Ignite ignite = Ignition.ignite();

IgniteEvents events = ignite.events(ignite.cluster().forCacheNodes("person"));
```
</Tab>

<Tab title="C#/.NET">

```csharp
var ignite = Ignition.GetIgnite();
var events = ignite.GetCluster().ForCacheNodes("person").GetEvents();
```
</Tab>
</Tabs>

### 1.4.监听事件
可以监听本地或远程事件。本地事件是在注册监听器的节​​点上生成的事件，远程事件是发生在其他节点上的事件。

注意，即使相应的真实事件仅发生一次，某些事件也可能在多个节点上触发，例如当某节点离开集群时，剩余的每个节点都会生成`EVT_NODE_LEFT`事件。

另一个示例是将对象写入缓存时。这时该`EVT_CACHE_OBJECT_PUT`事件发生在该对象的[主分区](/doc/java/DataModeling.md#_2-数据分区)所属的节点上，该节点可能与调用`put(…​)`方法的节点不同。此外如果该缓存配置了备份，则[备份分区](/doc/java/DataModeling.md#_2-数据分区)对应的所有节点也会触发该事件。

事件接口提供了仅监听本地事件以及监听本地和远程事件的方法。
#### 1.4.1.监听本地事件
要监听本地事件，需要使用`localListen(listener, eventTypes…​)`方法，如下所示。该方法会接收一个事件监听器，本地节点每次发生该类型事件时都会调用该监听器。

要注销该本地监听器，需要在其方法内返回`false`：

<Tabs>
<Tab title="Java">

```java
IgniteEvents events = ignite.events();

// Local listener that listens to local events.
IgnitePredicate<CacheEvent> localListener = evt -> {
    System.out.println("Received event [evt=" + evt.name() + ", key=" + evt.key() + ", oldVal=" + evt.oldValue()
            + ", newVal=" + evt.newValue());

    return true; // Continue listening.
};

// Subscribe to the cache events that are triggered on the local node.
events.localListen(localListener, EventType.EVT_CACHE_OBJECT_PUT, EventType.EVT_CACHE_OBJECT_READ,
        EventType.EVT_CACHE_OBJECT_REMOVED);
```
</Tab>

<Tab title="C#/.NET">

```csharp
class LocalListener : IEventListener<CacheEvent>
{
    public bool Invoke(CacheEvent evt)
    {
        Console.WriteLine("Received event [evt=" + evt.Name + ", key=" + evt.Key + ", oldVal=" + evt.OldValue
                          + ", newVal=" + evt.NewValue);
        return true;
    }
}

public static void LocalListenDemo()
{
    var cfg = new IgniteConfiguration
    {
        IncludedEventTypes = new[]
        {
            EventType.CacheObjectPut,
            EventType.CacheObjectRead,
            EventType.CacheObjectRemoved,
        }
    };
    var ignite = Ignition.Start(cfg);
    var events = ignite.GetEvents();
    events.LocalListen(new LocalListener(), EventType.CacheObjectPut, EventType.CacheObjectRead,
        EventType.CacheObjectRemoved);

    var cache = ignite.GetOrCreateCache<int, int>("myCache");
    cache.Put(1, 1);
    cache.Put(2, 2);
}
```
</Tab>
</Tabs>

事件监听器是`IgnitePredicate<T>`类的对象，其类型参数与监听器将要处理的事件的类型匹配。例如，缓存事件（`EVT_CACHE_OBJECT_PUT`，`EVT_CACHE_OBJECT_READ`等）对应于[CacheEvent](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/events/CacheEvent.html)类，发现事件（`EVT_NODE_LEFT`，`EVT_NODE_JOINED`等）对应于[DiscoveryEvent](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/events/DiscoveryEvent.html)类等等。如果要监听不同类型的事件，则可以使用通用的[Event](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/events/Event.html)接口：

```java
IgnitePredicate<Event> localListener = evt -> {
    // process the event
    return true;
};
```
#### 1.4.2.监听远程事件
该`IgniteEvents.remoteListen(localListener, filter, types)`方法可用于注册监听远程和本地事件的监听器，它接收本地监听器、过滤器以及要监听的事件类型列表。

过滤器将部署到与事件接口关联的所有节点，包括本地节点，通过过滤器的事件将发送到本地监听器。

该方法返回一个唯一的标识符，该标识符可用于注销监听器和过滤器，届时调用`IgniteEvents.stopRemoteListen(uuid)`即可。另一种注销监听器的方式是在`apply()`方法中返回`false`。

<Tabs>
<Tab title="Java">

```java
IgniteEvents events = ignite.events();

IgnitePredicate<CacheEvent> filter = evt -> {
    System.out.println("remote event: " + evt.name());
    return true;
};

// Subscribe to the cache events on all nodes where the cache is hosted.
UUID uuid = events.remoteListen(new IgniteBiPredicate<UUID, CacheEvent>() {

    @Override
    public boolean apply(UUID uuid, CacheEvent e) {

        // process the event

        return true; //continue listening
    }
}, filter, EventType.EVT_CACHE_OBJECT_PUT);
```
</Tab>
</Tabs>

#### 1.4.3.批处理事件
缓存中的每个操作都可以导致事件通知的生成和发送。对于缓存操作频繁的系统，针对每个事件进行通知可能会占用大量网络资源，这可能会导致缓存操作的性能下降。

可以将事件通知分组，并分批或定时发送，以减轻对性能的影响。下面是具体的示例：
```java
Ignite ignite = Ignition.ignite();

// Get an instance of the cache.
final IgniteCache<Integer, String> cache = ignite.cache("cacheName");

// Sample remote filter which only accepts events for the keys
// that are greater than or equal to 10.
IgnitePredicate<CacheEvent> rmtLsnr = new IgnitePredicate<CacheEvent>() {
    @Override
    public boolean apply(CacheEvent evt) {
        System.out.println("Cache event: " + evt);

        int key = evt.key();

        return key >= 10;
    }
};

// Subscribe to the cache events that are triggered on all nodes
// that host the cache.
// Send notifications in batches of 10.
ignite.events(ignite.cluster().forCacheNodes("cacheName")).remoteListen(10 /* batch size */,
        0 /* time intervals */, false, null, rmtLsnr, EventType.EVTS_CACHE);

// Generate cache events.
for (int i = 0; i < 20; i++)
    cache.put(i, Integer.toString(i));
```
### 1.5.存储和查询事件
可以配置事件存储，以将事件保留在事件发生的节点上，然后可以查询应用中的事件。

可以将事件存储配置为保留特定时间段的事件，仅保留最新事件或保留满足特定过滤器的事件，具体请参见[MemoryEventStorageSpi](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/spi/eventstorage/memory/MemoryEventStorageSpi.html)的javadoc。

以下是事件存储配置的示例：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

    <property name="eventStorageSpi" >
        <bean class="org.apache.ignite.spi.eventstorage.memory.MemoryEventStorageSpi">
            <property name="expireAgeMs" value="600000"/>
        </bean>
    </property>

</bean>
```
</Tab>

<Tab title="Java">

```java
MemoryEventStorageSpi eventStorageSpi = new MemoryEventStorageSpi();
eventStorageSpi.setExpireAgeMs(600000);

IgniteConfiguration igniteCfg = new IgniteConfiguration();
igniteCfg.setEventStorageSpi(eventStorageSpi);

Ignite ignite = Ignition.start(igniteCfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    EventStorageSpi = new MemoryEventStorageSpi()
    {
        ExpirationTimeout = TimeSpan.FromMilliseconds(600000)
    },
    IncludedEventTypes = new[]
    {
        EventType.CacheObjectPut,
        EventType.CacheObjectRead,
        EventType.CacheObjectRemoved,
    }
};
var ignite = Ignition.Start(cfg);
```
</Tab>
</Tabs>

#### 1.5.1.查询本地事件
以下示例显示如何查询本地存储的`EVT_CACHE_OBJECT_PUT`事件。

<Tabs>
<Tab title="Java">

```java
Collection<CacheEvent> cacheEvents = events.localQuery(e -> {
    // process the event
    return true;
}, EventType.EVT_CACHE_OBJECT_PUT);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var events = ignite.GetEvents();
var cacheEvents = events.LocalQuery(EventType.CacheObjectPut);
```
</Tab>
</Tabs>

#### 1.5.2.查询远程事件
下面是查询远程事件的示例：

<Tabs>
<Tab title="Java">

```java
Collection<CacheEvent> storedEvents = events.remoteQuery(e -> {
    // process the event
    return true;
}, 0, EventType.EVT_CACHE_OBJECT_PUT);
```
</Tab>

<Tab title="C#/.NET">

```csharp
class EventFilter : IEventFilter<CacheEvent>
{
    public bool Invoke(CacheEvent evt)
    {
        return true;
    }
}
// ....


    var events = ignite.GetEvents();
    var storedEvents = events.RemoteQuery(new EventFilter(), null, EventType.CacheObjectPut);
```
</Tab>
</Tabs>

## 2.事件
本章节会介绍不同的事件类型，何时何地生成事件以及如何使用它们。

最完整和最新的事件列表可以参见[EventType](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/events/EventType.html)的javadoc。
### 2.1.概述
所有事件均会实现`Event`接口。但是可能希望将每个事件强制转换为特定的类，以获取有关触发该事件的操作的更多信息。例如，“缓存更新”操作将触发一个事件，该事件是`CacheEvent`类的实例，其中包含有关已修改数据的信息，触发该事件的主体的ID等。

所有事件都包含有关生成事件的节点的信息。例如，当执行`IgniteClosure`作业时，`EVT_JOB_STARTED`和`EVT_JOB_FINISHED`事件包含有关执行闭包操作的节点的信息。
```java
IgniteEvents events = ignite.events();

UUID uuid = events.remoteListen(new IgniteBiPredicate<UUID, JobEvent>() {
    @Override
    public boolean apply(UUID uuid, JobEvent e) {

        System.out.println("nodeID = " + e.node().id() + ", addresses=" + e.node().addresses());

        return true; //continue listening
    }
}, null, EventType.EVT_JOB_FINISHED);
```
::: warning 事件顺序
无法保证事件监听器中的事件顺序与事件生成的顺序一致。
:::
#### 2.1.1.主体ID
部分事件包含了`subjectID`字段，其表示发起该活动的主体的ID。

 - 由服务端或客户端节点发起操作时，`subjectID`表示该节点的ID；
 - 当该操作由瘦客户端/JDBC/ODBC/REST客户端完成时，`subjectID`是在客户端接入集群时生成的，并且只要客户端一直接入集群，该`subjectID`就会保持不变。

检查具体的事件类可以了解该`subjectID`字段是否存在。
### 2.2.集群状态变更事件
集群状态变更的事件是[ClusterStateChangeEvent](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/events/ClusterStateChangeEvent.html)类的实例。

当集群状态变更时（自动激活或用户手动修改状态时），将生成集群状态变更事件。这些事件包含新旧状态，以及更改后的基线节点列表。

|事件类型|事件描述|事件触发点|
|---|---|---|
|EVT_CLUSTER_STATE_CHANGED|集群状态发生变更|所有集群节点|

### 2.3.缓存生命周期事件
缓存生命周期事件是[CacheEvent](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/events/CacheEvent.html)类的实例。每个缓存生命周期事件都与特定的缓存相关联，并具有一个包含缓存名的字段。

|事件类型|事件描述|事件触发点|
|---|---|---|
|EVT_CACHE_STARTED|在特定节点上启动缓存。每个服务端节点都拥有一个缓存的内部实例。创建实例时将触发此事件，其中包括以下操作：<br> 1.具有缓存的集群被激活，配置了缓存的所有服务端节点上的每个缓存都会生成事件；<br>2.服务端节点持有现有的缓存加入集群（缓存在该节点上已启动）；<br>3.通过调用`Ignite.getOrCreateCache(…​)`或类似方法动态创建新缓存时，该缓存所在的所有节点上都会触发该事件；<br>4.当在客户端节点上获取缓存的实例时；<br>5.通过[CREATE TABLE](/doc/java/SQLReference.md#_2-1-create-table)命令创建缓存时。|启动缓存的所有节点|
|EVT_CACHE_STOPPED|当缓存停止时会触发该事件，包括下面的活动：<br>1.集群冻结，所有服务端节点上的所有缓存都会停止；<br>2.调用`IgniteCache.close()`方法，调用该方法的节点会触发该事件。<br>3.该SQL表被删除。<br>4.如果调用了`cache = Ignite.getOrCreateCache(…​)`然后调用了`Ignite.close()`，该节点上的该缓存也会关闭。|缓存停止的所有节点|
|EVT_CACHE_NODES_LEFT|承载特定缓存的所有节点都已离开集群。当在服务端节点的子集上部署缓存或所有服务端节点都离开集群而仅保留客户端节点时，会触发该事件。|所有剩余的节点|

### 2.4.缓存事件
缓存事件是[CacheEvent](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/events/CacheEvent.html)类的实例，表示对缓存对象的操作，例如读取、写入、删除、锁定等。

每个事件都包含有关缓存的信息、操作访问的键、操作前后的值（如果适用）等。

使用DML命令时，也会生成缓存事件。

|事件类型|事件描述|事件触发点|
|---|---|---|
|EVT_CACHE_OBJECT_PUT|将对象写入缓存。每次调用`IgniteCache.put()`都会触发此事件。批量操作（例如`putAll(…​)`）则会产生该类型的多个事件。|该条目的主备节点|
|EVT_CACHE_OBJECT_READ|从缓存中读取对象。使用[扫描查询](/doc/java/UsingKeyValueApi.md#_3-使用扫描查询)时不会此事件（需使用缓存查询事件监控扫描查询）。|执行读取操作的节点。可以是主节点，也可以是备份节点（启用了从备份读取时才可能出现后一种情况）。在事务性缓存中，可以根据并发模型和隔离级别在主节点和备份节点上生成事件。|
|EVT_CACHE_OBJECT_REMOVED|从缓存删除事件。条目所在的主节点和备份节点||
|EVT_CACHE_OBJECT_LOCKED|在某个键上获得锁时会触发该事件。键只有在事务性缓存中才能获得锁，包括如下的场景：<br>1.通过`IgniteCache.lock()`或`IgniteCache.lockAll()`获得显式锁；<br>2.每个原子（非事务性）数据修改操作（写入、更新、删除）都将获得一个锁。这时该事件在键的主节点和备份节点上均被触发；<br>3.在事务中访问键可以获取锁（取决于[并发模型和隔离级别](/doc/java/Transactions.md#_3-并发模型和隔离级别)）。|条目所在的主/备节点（取决于并发模型和隔离级别）|
|EVT_CACHE_OBJECT_UNLOCKED|键上的锁释放时会触发该事件。|条目的主节点|
|EVT_CACHE_OBJECT_EXPIRED|缓存条目过期时会触发该事件，该事件仅在配置了[过期策略](/doc/java/ConfiguringCaches.md#_5-过期策略)时才有可能发生。|该条目对应的主节点和备份节点|
|EVT_CACHE_ENTRY_CREATED|当Ignite创建内部条目以使用缓存中的特定对象时，将触发此事件。不建议使用此事件，如果要监控缓存写入操作，则`EVT_CACHE_OBJECT_PUT`事件在大多数情况下足够了。|该条目对应的主节点和备份节点|
|EVT_CACHE_ENTRY_DESTROYED|当Ignite销毁为使用缓存中的特定对象而创建的内部条目时，将触发此事件。不建议使用该事件，销毁内部条目不会从缓存中删除任何数据。如果要监听缓存删除操作，请使用`EVT_CACHE_OBJECT_REMOVED`事件。|该条目对应的主节点和备份节点|

### 2.5.缓存查询事件
和缓存查询有关的事件有2个：

 - 和读取数据有关的缓存查询操作，是[CacheQueryReadEvent](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/events/CacheQueryReadEvent.html)类的实例；
 - 和操作数据有关的缓存查询操作，是[CacheQueryExecutedEvent](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/events/CacheQueryExecutedEvent.html)类的实例。

|事件类型|事件描述|事件触发点|
|---|---|---|
|EVT_CACHE_QUERY_OBJECT_READ|缓存查询执行的是读操作，与[查询过滤器](/doc/java/UsingKeyValueApi.md#_3-使用扫描查询)匹配的所有对象都会生成此事件。|读取对象的主节点|
|EVT_CACHE_QUERY_EXECUTED|执行查询时会生成此事件。|持有该缓存的所有服务端节点|

### 2.6.类和任务部署事件
部署事件是[DeploymentEvent](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/events/DeploymentEvent.html)类的实例。

|事件类型|事件描述|事件触发点|
|---|---|---|
|EVT_CLASS_DEPLOYED|类（非任务）已部署到某个节点|类部署的节点|
|EVT_CLASS_UNDEPLOYED|类卸载|类卸载的节点|
|EVT_CLASS_DEPLOY_FAILED|类部署失败|类部署的节点|
|EVT_TASK_DEPLOYED|任务类已部署到某个节点|类部署的节点|
|EVT_TASK_UNDEPLOYED|任务类在某个节点上卸载|类卸载的节点|
|EVT_TASK_DEPLOY_FAILED|类部署失败|类部署的节点|

### 2.7.发现事件
发现事件在节点（包括服务端和客户端）加入或离开集群时发生，包括节点由于故障而离开的情况。

发现事件是[DiscoveryEvent](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/events/DiscoveryEvent.html)类的实例。

|事件类型|事件描述|事件触发点|
|---|---|---|
|EVT_NODE_JOINED|节点加入集群|集群中的所有节点（加入的节点除外）|
|EVT_NODE_LEFT|节点离开集群|集群中所有剩余的节点|
|EVT_NODE_FAILED|集群检测到某节点非正常离开集群|集群中所有剩余的节点|
|EVT_NODE_SEGMENTED|节点发生分区|被分割的节点|
|EVT_CLIENT_NODE_DISCONNECTED|客户端断开了与集群的连接|与集群断开连接的客户端节点|
|EVT_CLIENT_NODE_RECONNECTED|客户端节点与集群重连|重新连接到群集的客户端节点|

### 2.8.任务执行事件
任务执行事件与[任务执行](/doc/java/DistributedComputing.md#_4-mapreduce-api)的不同阶段相关。执行[简单的闭包](/doc/java/DistributedComputing.md#_1-分布式计算api)时也会生成事件，因为在内部将闭包视为生成单个作业的任务。

任务执行事件是[TaskEvent](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/events/TaskEvent.html)类的实例。

|事件类型|事件描述|事件触发点|
|---|---|---|
|EVT_TASK_STARTED|任务开始，比如调用了`IgniteCompute.execute()`等方法|发起任务的节点|
|EVT_TASK_REDUCED|此事件表示任务执行流的汇总阶段|发起任务的节点|
|EVT_TASK_FINISHED|任务执行完成|发起任务的节点|
|EVT_TASK_FAILED|任务失败|发起任务的节点|
|EVT_TASK_TIMEDOUT|任务执行超时，当使用`Ignite.compute().withTimeout(…​)`执行任务时可能触发该事件。任务超时时，将取消所有正在执行的作业，还会生成`EVT_TASK_FAILED`事件|发起任务的节点|
|EVT_TASK_SESSION_ATTR_SET|作业在[会话](/doc/java/DistributedComputing.md#_4-6-分布式任务会话)中配置属性。|执行作业的节点|

作业执行事件是[JobEvent](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/events/JobEvent.html)类的实例。作业执行事件是在作业执行的不同阶段生成的，并且与作业的特定实例相关联。该事件包含有关产生作业的任务的信息（任务名称，任务类等）。

|事件类型|事件描述|事件触发点|
|---|---|---|
|EVT_JOB_MAPPED|作业被映射到特定节点。映射发生在任务开始的节点上。将为映射阶段中生成的每个作业生成此事件|启动任务的节点|
|EVT_JOB_QUEUED|作业被添加到映射节点的队列中|计划执行作业的节点|
|EVT_JOB_STARTED|开始执行作业|执行作业的节点|
|EVT_JOB_FINISHED|作业执行完毕，也包括作业被取消的情况|执行作业的节点|
|EVT_JOB_RESULTED|作业将结果返回给发起任务的节点|启动任务的节点|
|EVT_JOB_FAILED|作业执行失败。如果配置了作业故障转移策略（默认），则该事件将伴随`EVT_JOB_FAILED_OVER`事件|执行作业的节点|
|EVT_JOB_FAILED_OVER|作业被故障转移至其他的节点|启动任务的节点|
|EVT_JOB_TIMEDOUT|作业执行超时|执行作业的节点|
|EVT_JOB_REJECTED|作业被拒绝。如果配置了[CollisionSpi](/doc/java/DistributedComputing.md#_7-作业调度)，则可以拒绝该作业|拒绝作业的节点|
|EVT_JOB_CANCELLED|作业被取消|执行作业的节点|

### 2.9.缓存再平衡事件
缓存再平衡事件（`EVT_CACHE_REBALANCE_OBJECT_LOADED`和`EVT_CACHE_REBALANCE_OBJECT_UNLOADED`除外）都是[CacheRebalancingEvent](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/events/CacheRebalancingEvent.html)类的实例。

再平衡是缓存级的，因此每个再平衡事件都对应一个特定的缓存，该事件包含缓存名。

将单个缓存分区从节点A移动到节点B的过程包括以下步骤：

 1. 节点A提供了一个分区（REBALANCE_PART_SUPPLIED）。分区中的对象开始移动到节点B；
 2. 节点B接收分区数据（REBALANCE_PART_LOADED）；
 3. 节点A从其存储中删除分区（REBALANCE_PART_UNLOADED）。

|事件类型|事件描述|事件触发点|
|---|---|---|
|EVT_CACHE_REBALANCE_STARTED|缓存再平衡开始|持有该缓存的所有节点|
|EVT_CACHE_REBALANCE_STOPPED|缓存再平衡停止|持有该缓存的所有节点|
|EVT_CACHE_REBALANCE_PART_LOADED|缓存的分区已加载到新节点上。对于参与缓存再平衡的每个分区都会触发此事件|加载分区的节点|
|EVT_CACHE_REBALANCE_PART_UNLOADED|将缓存的分区加载到新目的地后，将从原节点中删除该分区|再平衡之前持有该分区的节点|
|EVT_CACHE_REBALANCE_OBJECT_LOADED|作为再平衡过程的一部分，一个对象被移动到新的节点|加载对象的节点|
|EVT_CACHE_REBALANCE_OBJECT_UNLOADED|将对象移动到新节点后，将从原节点删除该对象|删除对象的节点|
|EVT_CACHE_REBALANCE_PART_DATA_LOST|将要再平衡的分区丢失，比如由于节点故障等||
|EVT_CACHE_REBALANCE_PART_SUPPLIED|节点将缓存分区作为再平衡过程的一部分|持有该分区的节点|

### 2.10.事务事件
事务事件是[TransactionStateChangedEvent](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/events/TransactionStateChangedEvent.html)类的实例。这些事件可以获取有关事务执行不同阶段的通知，每个事件都包含与之对应的`Transaction`对象。

|事件类型|事件描述|事件触发点|
|---|---|---|
|EVT_TX_STARTED|事务开始。注意在事务性缓存中，在事务外部执行的每个原子操作都被视为由单个操作组成的事务|事务开始的节点|
|EVT_TX_COMMITTED|事务提交|事务开始的节点|
|EVT_TX_ROLLED_BACK|事务回滚|事务执行的节点|
|EVT_TX_SUSPENDED|事务挂起|事务开始的节点|
|EVT_TX_RESUMED|事务继续|事务开始的节点|

<RightPane/>
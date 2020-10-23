# Ignite消息
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
```java
Ignite ignite = Ignition.ignite();

IgniteMessaging rmtMsg = ignite.message(ignite.cluster().forRemotes());

// Add listener for ordered messages on all remote nodes.
rmtMsg.remoteListen("MyOrderedTopic", (nodeId, msg) -> {
    System.out.println("Received ordered message [msg=" + msg + ", from=" + nodeId + ']');

    return true; // Return true to continue listening.
});

// Send ordered messages to remote nodes.
for (int i = 0; i < 10; i++)
    rmtMsg.sendOrdered("MyOrderedTopic", Integer.toString(i),0);
```

<RightPane/>
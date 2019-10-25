# 分布式消息
## 1.基于主题
Ignite分布式消息可以在集群所有节点之间进行基于主题的通信，可以将具有指定消息主题的消息分发到已订阅该主题的所有节点或其子集。

Ignite消息基于发布-订阅范式，其中发布者和订阅者通过一个公共主题连接在一起。当某节点发送有关主题T的消息A时，该消息将发布到订阅T的所有节点上。
::: tip 提示
加入集群的新节点会自动订阅该集群（或[集群组](/doc/net/Clustering.md#_2-集群组)）中其他节点所订阅的所有主题。
:::

Ignite中的分布式消息功能是通过`IMessaging`接口提供的，下述方法可以获得`IMessaging`的实例：
```csharp
IIgnite ignite = Ignition.Start();

// Messaging instance over this cluster.
IMessaging msg = ignite.GetMessaging();

// Messaging instance over given cluster group (in this case, remote nodes).
IMessaging rmtMsg = ignite.GetCluster().ForRemotes().GetMessaging();
```
### 1.1.发布消息
`Send`方法可以将指定主题的消息发送/发布到所有节点，消息可以是有序的也可以是无序的。

**有序消息**

如果想按发送的顺序接收消息，则可以使用`SendOrdered(...)`方法。还可以传递一个超时参数，以指定消息在真正发送之前将在队列中等待多长时间，如果超时到期，那么该节点上尚未到达指定主题的所有消息将被忽略。

**无序消息**

`Send(...)`方法不保证消息的顺序。这意味着如果按顺序发送消息A和消息B，目标节点不能保证先接收A，然后接收B。

### 1.2.订阅消息
`Listen`方法可用于监听/订阅消息。调用该方法后，监听指定主题新消息的监听器将在所有（或子集）节点上注册。使用该方法，可以传递一个谓词，该谓词返回一个布尔值从而告诉监听器继续或停止监听新消息。

**本地监听器**

`LocalListen(...)`方法仅在本地节点上注册监听指定主题的监听器，并监听此集群组中任何节点的消息。

**远程监听器**

`RemoteListen(...)`方法会为集群组内所有节点的指定主题注册监听器，并监听来自该集群组任何节点的消息。

### 1.3.示例
以下示例显示了远程节点之间的消息交换：
```csharp
void Messaging()
{
    using (IIgnite ignite = Ignition.Start())
    {
        var rmtMsg = ignite.GetCluster().ForRemotes().GetMessaging();

        // Add listener for messages on all remote nodes.
        rmtMsg.RemoteListen(new Listener(), "myTopic");

        // Send message to remote nodes.
        rmtMsg.Send("Hello!", "myTopic");
    }
}

class Listener : IMessageListener<string>
{
    public bool Invoke(Guid nodeId, string message)
    {
        Console.WriteLine("Received message '{0}' from node '{1}'", message, nodeId);

        return true; // Return true to continue listening.
    }
}
```
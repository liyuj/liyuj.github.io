# 启动和停止节点
本章节介绍如何启动服务端和客户端节点。

节点的类型有两种：服务端节点和客户端节点。客户端节点也称为胖客户端，以区别于[瘦客户端](/doc/java/ThinClients.md)。服务端节点参与缓存、计算的执行、流数据处理等。客户端节点提供远程接入服务端的能力，有完整的Ignite API支持，包括近缓存、事务、计算、流处理、服务等。

所有的节点默认都以服务端模式启动，客户端模式需要显式指定。
## 1.启动服务端节点
可以使用下面的命令或者代码片段，启动一个普通的服务端节点：

<Tabs>
<Tab title="Shell">

```shell
ignite.sh path/to/configuration.xml
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();
Ignite ignite = Ignition.start(cfg);
```
Ignite实现了`AutoCloseable`接口，可以使用`try-with-resource`语句来自动关闭。

```java
IgniteConfiguration cfg = new IgniteConfiguration();

try (Ignite ignite = Ignition.start(cfg)) {
    //
}
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration();
IIgnite ignite = Ignition.Start(cfg);
```
Ignite是一个`IDisposable`对象，可以使用`using`语句自动关闭：
```csharp
var cfg = new IgniteConfiguration();
using (IIgnite ignite = Ignition.Start(cfg))
{
    //
}
```
</Tab>
</Tabs>

## 2.启动客户端节点
要启动客户端节点，可以简单地在节点的配置中打开客户端模式：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="clientMode" value="true"/>

</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

// Enable client mode.
cfg.setClientMode(true);

// Start a client
Ignite ignite = Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    ClientMode = true
};
IIgnite ignite = Ignition.Start(cfg);
```
</Tab>
</Tabs>

另外，还有个方便的方法，还可以通过`Ignition`类来启用或者禁用客户端模式，这样服务端和客户端就可以复用相同的配置。

<Tabs>
<Tab title="Java">

```java
Ignition.setClientMode(true);

// Start the node in client mode.
Ignite ignite = Ignition.start();
```
</Tab>

<Tab title="C#/.NET">

```csharp
Ignition.ClientMode = true;
Ignition.Start();
```
</Tab>

<Tab title="C++">

```
C++目前还不支持这个API。
```
</Tab>
</Tabs>

## 3.停止节点
强制停止某个节点时，可能会导致数据丢失或数据不一致，甚至会使节点无法重启。当节点没有响应且无法正常关闭时，应将强制停止作为最后的手段。

正常停止可以使节点完成关键操作并正确完成其生命周期，执行正常停止的正确过程如下：

 1. 使用以下方法之一停止节点：

    - 以编程方式调用`Ignite.close()`；
    - 以编程方式调用`System.exit()`；
    - 发送用户中断信号。Ignite使用JVM关闭钩子在JVM停止之前执行自定义逻辑。如果通过运行`ignite.sh`来启动节点并且不将其与终端分离，则可以通过按下`Ctrl+C`来停止节点。

 2. 从[基线拓扑](/doc/java/Clustering.md#_7-基线拓扑)中删除该节点。如果启用了[基线自动调整](/doc/java/Clustering.md#_7-3-基线拓扑自动调整)，则可以不执行此步骤。

从基准拓扑中删除节点将在其余节点上开始再平衡过程。如果计划在停止后立即重启该节点，则不必进行再平衡。在这种情况下，请勿从基准拓扑中删除该节点。
## 4.配置JVM选项
当通过`ignite.sh`脚本启动节点时，设置JVM参数有几个方法，这些方法下面的章节会介绍。
### 4.1.JVM_OPTS系统变量
可以配置`JVM_OPTS`环境变量：
```shell
export JVM_OPTS="$JVM_OPTS -Xmx6G -DIGNITE_TO_STRING_INCLUDE_SENSITIVE=false"; $IGNITE_HOME/bin/ignite.sh
```
### 4.2.命令行参数
还可以通过`-J`前缀传递JVM参数：
```shell
./ignite.sh -J-Xmx6G -J-DIGNITE_TO_STRING_INCLUDE_SENSITIVE=false
```
## 5.节点生命周期事件
生命周期事件使开发者有机会在节点生命周期的不同阶段执行自定义代码。

共有4个生命周期事件：

 - `BEFORE_NODE_START`：Ignite节点的启动程序初始化之前调用；
 - `AFTER_NODE_START`：Ignite节点启动之后调用；
 - `BEFORE_NODE_STOP`：Ignite节点的停止程序初始化之前调用；
 - `AFTER_NODE_STOP`：Ignite节点停止之后调用。

下面的步骤介绍如何添加一个自定义生命周期事件监听器：

 1. 开发一个实现`LifecycleBean`接口的类，该接口有一个`onLifecycleEvent()`方法，每个生命周期事件都会调用。

```java
public class MyLifecycleBean implements LifecycleBean {
    @IgniteInstanceResource
    public Ignite ignite;

    @Override
    public void onLifecycleEvent(LifecycleEventType evt) {
        if (evt == LifecycleEventType.AFTER_NODE_START) {

            System.out.format("After the node (consistentId = %s) starts.\n", ignite.cluster().node().consistentId());

        }
    }
}
```

 2. 将该类注册到节点的配置中：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="lifecycleBeans">
        <list>
            <bean class="org.apache.ignite.snippets.MyLifecycleBean"/>
        </list>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

// Specify a lifecycle bean in the node configuration.
cfg.setLifecycleBeans(new MyLifecycleBean());

// Start the node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>
</Tabs>

<RightPane/>
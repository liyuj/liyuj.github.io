# Ignite.NET插件示例：分布式Semaphore（信号量）
Ignite.NET从2.0版本开始，引入了[插件系统](https://liyuj.gitee.io/doc/net/ThirdPartyIntegrations.html#_4-插件)，插件可以仅在于.NET环境中，也可以在于.NET + Java混合环境中，本文会描述如何在后者实现插件。
## 为什么需要插件？
Ignite.NET构建于Ignite（用Java编写）之上，JVM会在.NET进程中启动，.NET部分与Java部分进行交互，并尽可能重用现有的Ignite功能。

插件系统将此平台交互机制公开给第三方，主要场景之一是在.NET中可以使用Ignite和第三方Java API。

这种API的一个典型事例是[IgniteSemaphore](https://liyuj.gitee.io/doc/java/DistributedDataStructures.html#_6-semaphore（信号量）)，该功能在Ignite.NET中尚不可用。
## 分布式Semaphore API
Ignite中的Semaphore类似于`System.Threading.Semaphore`（[MSDN](https://msdn.microsoft.com/en-us/library/system.threading.semaphore.aspx)），但是是在整个集群中生效的，限制在所有Ignite节点上执行指定代码段的线程数。

代码大致如下：
```csharp
IIgnite ignite = Ignition.GetIgnite();
ISemaphore semaphore = ignite.GetOrCreateSemaphore(name: "foo", count: 3);

semaphore.WaitOne();  // Enter the semaphore (may block)
// Do work
semaphore.Release();
```
看起来很简单而且非常有用，与.NET内置的`Semaphore`API相同。显然不能更改`IIgnite`的接口，因此`GetOrCreateSemaphore`就是一个扩展点，下面会详细描述。
## Java插件
先看Java端，这里需要一种调用`Ignite.semaphore()`的方法并向.NET平台提供访问该实例的方法。

创建一个Java项目并通过Maven引用Ignite（具体内容请参见[构建多平台Ignite集群](https://my.oschina.net/liyuj/blog/793938)文章）。

每个插件都以`PluginConfiguration`开始，本例的插件不需要任何配置属性，但是该类必须存在，因此只需创建一个简单的类即可：
```java
public class IgniteNetSemaphorePluginConfiguration implements PluginConfiguration {}
```
然后是插件的入口：`PluginProvider<PluginConfiguration>`。该接口有很多方法，但是大多数方法都可以为空（`name`和`version`不能为空，因此需要为其赋值）。这里只需关注`initExtensions`方法，它是跨平台互操作的入口点，本例中做的就是注册`PlatformPluginExtension`实现：
```java
public class IgniteNetSemaphorePluginProvider implements PluginProvider<IgniteNetSemaphorePluginConfiguration> {
    public String name() { return "DotNetSemaphore"; }
    public String version() { return "1.0"; }

    public void initExtensions(PluginContext pluginContext, ExtensionRegistry extensionRegistry)
            throws IgniteCheckedException {
        extensionRegistry.registerExtension(PlatformPluginExtension.class,
                new IgniteNetSemaphorePluginExtension(pluginContext.grid()));
    }
...
}
```
`PlatformPluginExtension`有一个唯一的`id`，用于从.NET端访问它，还有一个`PlatformTarget createTarget()`方法，用于创建可以从.NET端访问的对象。

Java中的[PlatformTarget](https://github.com/apache/ignite/blob/master/modules/core/src/main/java/org/apache/ignite/internal/processors/platform/PlatformTarget.java)会映射到.NET中的[IPlatformTarget](https://github.com/apache/ignite/blob/master/modules/platforms/dotnet/Apache.Ignite.Core/Interop/IPlatformTarget.cs)接口，当在.NET中调用`IPlatformTarget.InLongOutLong`时，就会调用Java实现中的`PlatformTarget.processInLongOutLong`。还有许多其他方法可以用于交换基本类型、序列化数据和对象。每个方法都有一个指定了操作代码的`type`参数，以防插件上有很多不同的方法。

本例中需要两个`PlatformTarget`类：一个代表整个插件并具有`getOrCreateSemaphore`方法，另一个代表每个特定信号量。第一个应该持有字符串类型的名称和整型的计数器并返回一个对象，因此需要实现`PlatformTarget.processInStreamOutObject`，其他方法都不需要可以将其置空：
```java
public class IgniteNetPluginTarget implements PlatformTarget {
    private final Ignite ignite;

    public IgniteNetPluginTarget(Ignite ignite) {
        this.ignite = ignite;
    }

    public PlatformTarget processInStreamOutObject(int i, BinaryRawReaderEx binaryRawReaderEx) throws IgniteCheckedException {
        String name = binaryRawReaderEx.readString();
        int count = binaryRawReaderEx.readInt();

        IgniteSemaphore semaphore = ignite.semaphore(name, count, true, true);

        return new IgniteNetSemaphore(semaphore);
    }
...
}
```
.NET中的每个`ISemaphore`对象在Java中都会有一个对应的`IgniteNetSemaphore`，它也是一个`PlatformTarget`。这个对象将处理`WaitOne`和`Release`方法，并将它们委托给底层的`IgniteSemaphore`对象。由于这两个方法都是返回void且是无参数的，因此最简单的`PlatformTarget`是：
```java
public long processInLongOutLong(int i, long l) throws IgniteCheckedException {
    if (i == 0) semaphore.acquire();
    else semaphore.release();

    return 0;
}
```
这样Java部分就完成了！创建`resources\META-INF.services\org.apache.ignite.plugin.PluginProvider`文件，内容为类名，Java服务加载器就可以加载该类。使用Maven打包该项目（在终端中执行`mvn package`或使用IDE）后，target目录中就应该有一个`IgniteNetSemaphorePlugin-1.0-SNAPSHOT.jar`文件。

## .NET插件
首先创建一个控制台项目，安装Ignite NuGet软件包，并以刚刚创建的jar文件的路径启动Ignite：
```csharp
var cfg = new IgniteConfiguration
{
    JvmClasspath = @"..\..\..\..\Java\target\IgniteNetSemaphorePlugin-1.0-SNAPSHOT.jar"
};

Ignition.Start(cfg);
```
Ignite节点启动后就可以在日志中看到插件的名称：
```
[16:02:38] Configured plugins:
[16:02:38]   ^-- DotNetSemaphore 1.0
```
对于.NET部分将采用API优先的方法：首先实现扩展方法，然后从那里继续。
```csharp
public static class IgniteExtensions
{
    public static Semaphore GetOrCreateSemaphore(this IIgnite ignite, string name, int count)
    {
        return ignite.GetPlugin<SemaphorePlugin>("semaphorePlugin").GetOrCreateSemaphore(name, count);
    }
}
```
为了使该`GetPlugin`方法生效，需要配置`IgniteConfiguration.PluginConfigurations`属性，它持有`IPluginConfiguration`实现的集合，并且每个实现又必须链接到`IPluginProvider`的实现：
```csharp
[PluginProviderType(typeof(SemaphorePluginProvider))]
class SemaphorePluginConfiguration : IPluginConfiguration  {...}
```
在节点启动时，Ignite.NET会迭代插件配置，实例化插件提供者，并调用其`Start(IPluginContext<SemaphorePluginConfiguration> context)`方法，然后对`IIgnite.GetPlugin`的调用会委托给指定名字的提供者的`IPluginProvider.GetPlugin`。
```csharp
class SemaphorePluginProvider : IPluginProvider<SemaphorePluginConfiguration>
{
    private SemaphorePlugin _plugin;

    public T GetPlugin<T>() where T : class
    {
        return _plugin as T;
    }

    public void Start(IPluginContext<SemaphorePluginConfiguration> context)
    {
        _plugin = new SemaphorePlugin(context);
    }

    ...

}
```
通过`IPluginContext`可以访问Ignite实例、Ignite和插件的配置，还有`GetExtension`方法，会委托给Java中的`PlatformPluginExtension.createTarget()`方法，这样就可以在两个平台之间“建立连接”。.NET中的`IPlatformTarget`链接到Java中的`PlatformTarget`，它们可以相互调用，并且Java对象的生存周期与.NET对象的生存周期是关联的，即一旦垃圾收集器回收了.NET对象，也会释放Java对象的引用，因此Java对象也会被回收。

下面的实现很简单，只调用了对应的`IPlatformTarget`方法：
```csharp
class SemaphorePlugin
{
    private readonly IPlatformTarget _target;  // Refers to IgniteNetPluginTarget in Java

    public SemaphorePlugin(IPluginContext<SemaphorePluginConfiguration> context)
    {
        _target = context.GetExtension(100);
    }

    public Semaphore GetOrCreateSemaphore(string name, int count)
    {
        var semaphoreTarget = _target.InStreamOutObject(0, w =>
        {
            w.WriteString(name);
            w.WriteInt(count);
        });

        return new Semaphore(semaphoreTarget);
    }
}

class Semaphore
{
    private readonly IPlatformTarget _target;  // Refers to IgniteNetSemaphore in Java

    public Semaphore(IPlatformTarget target)
    {
        _target = target;
    }

    public void WaitOne()
    {
        _target.InLongOutLong(0, 0);
    }

    public void Release()
    {
        _target.InLongOutLong(1, 0);
    }
}
```
这样就可以了，并且向现有插件添加更多逻辑也很容易，只需在两侧实现一对方法即可。Ignite使用[JNI](https://en.wikipedia.org/wiki/Java_Native_Interface)和非托管内存在.NET和Java平台之间使用一个进程交换数据，既简单又高效。

## 测试
为了演示Semaphore的分布式特性，可以运行多个Ignite节点，每个节点都调用`WaitOne()`，就会看到一次只有两个节点能够获取信号量：
```csharp
var ignite = Ignition.Start(cfg);
var sem = ignite.GetOrCreateSemaphore("foo", 2);

Console.WriteLine("Trying to acquire semaphore...");

sem.WaitOne();

Console.WriteLine("Semaphore acquired. Press any key to release.");
Console.ReadKey();
```

# 在LINQPad中使用Ignite.NET
[LINQPad](https://www.linqpad.net/)是进行.NET开发的一款优秀工具，非常有利于Ignite.NET API的快速入门。

![](https://ptupitsyn.github.io/images/ignite-linqpad.png)

## 入门

 1. 下载LINQPad：[linqpad.net/Download.aspx](https://www.linqpad.net/Download.aspx)，注意要选择64位操作系统的**AnyCPU**版本；
 2. 安装Ignite.NET的NuGet软件包：

    - 按F4（或点击`Query` -> `References`和`Properties`菜单项）；
    - 点击`Add NuGet…`，可能会出现警告：`As you don't have LINQPad Premium/Developer Edition, you can only search for NuGet packages that include LINQPad samples.`，这是正常的，因为Ignite软件包确实包含LINQPad示例；
    - 通过单击`Add To Query`按钮来安装软件包；
    - 点击`Add namespaces`按钮，并（至少）添加第一个：`Apache.Ignite.Core`；
    - 关闭NuGet窗口，在`Query Properties`窗口上单击`OK`；

 3. 确认`Language`下拉框设置为`C# Expression`（默认设置）；
 4. 输入`Ignition.Start()`，然后按下F5。

Ignite节点启动后，就可以在输出面板中看到通常的控制台输出。

在左侧的`Samples`选项卡上可以看到打包的示例代码。

![](https://ptupitsyn.github.io/images/2016-08-08-Whats-New-In-Ignite-Net-1-7.1/linqpad-output.png)

## 回收工作进程
LINQPad在单独的进程中运行业务代码，该进程默认在多次运行之间可以重复使用（出于性能原因）。

这有两个问题：

   1. Ignite.NET启动进程内JVM，该进程重用时，也会重用此JVM，因此无法修改JVM选项；
   2. `Ignition`类将所有启动的节点保留在静态映射中，该进程重用时，这些节点将保持运行，如果执行`Ignition.Start()`两次，则会抛出`Default Ignite instance has already been started.`这样的错误。

该行为有时可能有用，但有时则不需要，但是幸好可以通过内置的`Util.NewProcess`属性来控制它。先将顶部的`Language`下拉框切换到`C# Statement(s)`模式，然后运行以下脚本：
```csharp
Util.NewProcess = true;
Ignition.Start();
```
该脚本多次运行也不会出问题，因为每次都是从头开始的。

## 重用启动节点
由于JVM启动和网络发现的过程，Ignite节点需要一些时间才能启动。为了在LINQPad中对代码快速迭代，可以在多次运行之间重用已启动的节点。例如下面的代码重用启动的Ignite实例并重用现有的缓存，每次运行添加一条数据并显示现有的数据：
```csharp
// Get existing instance or start a new one
var ignite = Ignition.TryGetIgnite() ?? Ignition.Start();

// Get existing cache or create a new one
var cache = ignite.GetOrCreateCache<Guid, DateTime>("cache");

// Add a new entry
cache[Guid.NewGuid()] = DateTime.Now;

// Show all entries
cache.Dump();
```
与重启节点需要几秒钟的时间相反，此代码将在几毫秒内运行。

必要时可以通过`Shift+Control+F5`卸载`AppDomain`并从头开始。

## 使用技巧
除了简单讲解Ignite API之外，还建议关注下下面的Ignite + LINQPad使用场景：

**检查现有的缓存**

[Visor命令行工具](https://liyuj.gitee.io/doc/tools/VisorManagementConsole.html#_1-命令行接口)可以显示缓存的内容，但是在LINQPad中执行此操作更加灵活且友好，因为LINQPad脚本中没有任何实际的类，因此必须通过二进制模式才能读取缓存的内容。

以下代码显示了所有缓存的列表以及每个缓存中的前5条数据：
```csharp
var ignite = Ignition.TryGetIgnite() ?? Ignition.Start();

foreach (var cacheName in ignite.GetCacheNames())
    ignite.GetCache<object, object>(cacheName)
        .WithKeepBinary<object, object>()
        .Select(x => x.ToString())
        .Take(5)
        .Dump(cacheName);
```
**将Spring XML配置转换为C# IgniteConfiguration**

假设有一些Ignite Spring XML配置文件，并且需要对Ignite.NET也使用相同的配置，或者要从Ignite.NET 1.5迁移，该版本中Spring XML是唯一的配置机制。

具体上可以简单地使用上述Spring XML文件启动节点，然后调用`GetConfiguration()`以查看其在.NET中对应的配置：
```csharp
Ignition.Start(@"spring-config.xml").GetConfiguration()
```
**将IgniteConfiguration转换为app.config XML**

Ignite.NET支持[app.config和web.config配置](https://liyuj.gitee.io/doc/net/#_5-配置)。但是编写XML并不高效，而在C#中使用`IgniteConfiguration`则更容易一些，因为IDE会有很大的帮助，可以避免无法编译的无效代码。

为了配合使用XML，有一种将`IgniteConfiguration`实例转换为XML表示形式的隐藏方法。以下代码显示了如何通过反射（早期版本）使用它（确认已将`Language`下拉菜单设置为`C#Program`）：
```csharp
void Main()
{
    new IgniteConfiguration
    {
        CacheConfiguration = new[]
        {
            new CacheConfiguration
            {
                Name = "myCache",
                CacheMode = CacheMode.Replicated
            }
        }
    }.ToXml().Dump();
}

public static class IgniteConfigurationExtensions
{
    public static string ToXml(this IgniteConfiguration cfg)
    {
        var sb = new StringBuilder();

        var settings = new XmlWriterSettings
        {
            Indent = true
        };

        using (var xmlWriter = XmlWriter.Create(sb, settings))
        {
            typeof(Ignition).Assembly
                .GetType("Apache.Ignite.Core.Impl.Common.IgniteConfigurationXmlSerializer")
                .GetMethod("Serialize")
                .Invoke(null, new object[] {cfg, xmlWriter, "igniteConfiguration"});
        }

        return sb.ToString();
    }
}
```
结果是：
```xml
<?xml version="1.0" encoding="utf-16"?>
<igniteConfiguration xmlns="http://ignite.apache.org/schema/dotnet/IgniteConfigurationSection">
  <cacheConfiguration>
    <cacheConfiguration name="myCache" cacheMode="Replicated" />
  </cacheConfiguration>
</igniteConfiguration>
```
结合先前的Spring XML场景，还可以将Spring XML转换为app.config XML。

在最新的版本中，在开放API中还有`ToXml`方法，会更方便。
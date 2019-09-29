# 基本概念
## 1.Ignite.NET是什么？
::: tip Ignite是：
一个以内存为中心的分布式数据库、缓存和处理平台，可以在PB级数据中，以内存级的速度进行事务性、分析性以及流式负载的处理。
:::
![](https://files.readme.io/11ace9c-0bad3a9-ignite_architecture.png)

### 1.1.固化内存
Ignite的固化内存组件不仅仅将内存作为一个缓存层，还视为一个全功能的存储层。这意味着可以按需将持久化打开或者关闭。如果持久化关闭，那么Ignite就可以作为一个分布式的**内存数据库**或者**内存数据网格**，这完全取决于使用SQL和键-值API的喜好。如果持久化打开，那么Ignite就成为一个分布式的，**可水平扩展的数据库**，它会保证完整的数据一致性以及集群故障的可恢复能力。
### 1.2.Ignite持久化
Ignite的原生持久化是一个分布式的、支持ACID以及兼容SQL的磁盘存储，它可以作为一个可选的磁盘层与Ignite的固化内存透明地集成，然后将数据和索引存储在SSD、闪存、3D XPoint以及其它类型的非易失性存储中。

打开Ignite的持久化之后，就不需要将所有的数据和索引保存在内存中，或者在节点或者集群重启后对数据进行预热，因为固化内存和持久化紧密耦合之后，会将其视为一个二级存储层，这意味着在内存中数据和索引的一个子集如果丢失了，固化内存会从磁盘上进行获取。
### 1.3.ACID兼容
存储在Ignite中的数据，在内存和磁盘上是同时支持ACID的，使Ignite成为一个**强一致**的系统，Ignite可以在整个拓扑的多台服务器上保持事务。
### 1.4.完整的SQL支持
Ignite提供了完整的SQL、DDL和DML的支持，可以使用纯SQL而不用写代码与Ignite进行交互，这意味着只使用SQL就可以创建表和索引，以及插入、更新和查询数据。有这个完整的SQL支持，Ignite就可以作为一种**分布式SQL数据库**。
### 1.5.键-值
Ignite的内存数据网格组件是一个完整的事务型**分布式键值存储**，它可以在有几百台服务器的集群上进行水平扩展。在打开持久化时，Ignite可以存储比内存容量更大的数据，并且在整个集群重启之后仍然可用。
### 1.6.并置处理
大多数传统数据库是以客户机-服务器的模式运行的，这意味着数据必须发给客户端进行处理，这个方式需要在客户端和服务端之间进行大量的数据移动，通常来说不可扩展。而Ignite使用了另外一种方式，可以将轻量级的计算发给数据，即数据的**并置**计算，从结果上来说，Ignite扩展性更好，并且使数据移动最小化。
### 1.7.可扩展性和持久性
Ignite是一个弹性的、可水平扩展的分布式系统，它支持按需地添加和删除节点，Ignite还可以存储数据的多个副本，这样可以使集群从部分故障中恢复。如果打开了持久化，那么Ignite中存储的数据可以在集群的完全故障中恢复。Ignite集群重启会非常快，因为数据从磁盘上获取，瞬间就具有了可操作性。从结果上来说，数据不需要在处理之前预加载到内存中，而Ignite会缓慢地恢复内存级的性能。
### 1.8.Ignite和Ignite.NET
Ignite.NET构建于Ignite之上：

 - .NET会在同一个进程中启动JVM，并通过JNI与之通信；
 - .NET、C++和Java节点会加入同一个集群，使用相同的缓存，并使用通用的二进制协议进行互操作；
 - Java计算作业可以在任意节点上执行（.NET、C++和Java）；
 - .NET计算作业只能运行在.NET节点上；

Ignite.NET还可以运行于[瘦客户端](#_15-瘦客户端)模式，不需要Java/JVM，与服务端使用单一的TCP连接进行通信。
## 2.入门
### 2.1.环境要求

 - JDK：8+；
 - OS：Windows(7及以上)，Windows Server（2008 R2及以上），Linux（支持.NET Core的任何发行版），macOS；
 - 网络：没有限制（建议10G）；
 - 硬件：无限制；
 - .NET框架：.NET 4.0+, .NET Core 2.0+；
 - IDE：.NET 4.0+, .NET Core 2.0+；

下面的内容基于Windows和Visual Studio，对于Linux和macOS平台的使用，请参见[跨平台支持](#_3-跨平台支持)。

### 2.2.安装
**NuGet**

NuGet是将Ignite.NET包含到项目中最便捷的方法，具体可以在软件包管理器控制台中输入以下内容：`Install-Package Apache.Ignite`进行安装。

或者也可以在NuGet Gallery中搜索软件包：[https://www.nuget.org/packages/Apache.Ignite/](https://www.nuget.org/packages/Apache.Ignite/)。
::: tip 提示
安装NuGet软件包会更新项目的`post-build`事件，将Libs文件夹复制到输出目录，具体请参见[部署](#_13-部署)章节的内容。
:::
::: tip 更新NuGet软件包
当要更新到新版本的Ignite.NET时，一定要清理`bin`文件夹并且重新构建，以更新Libs文件夹。
:::
**二进制发行版**

二进制发行版包含了Ignite、Ignite.NET和Ignite.C++，可选的Java包，示例代码以及其他的内容。

 - 从如下[地址](https://ignite.apache.org/download.cgi#binaries)下载二进制发行版；
 - 将压缩包解压到系统中某个安装文件夹中。

运行示例：

 - 打开`platforms\dotnet\examples\Apache.Ignite.Examples.sln`；
 - 打开`Apache.Ignite.Examples`项目属性文件，通过`Startup object`复选框选择一个示例；
 - 可选：通过`Apache.Ignite.exe -configFileName=platforms\dotnet\examples\Apache.Ignite.Examples\App.config -assembly=[path_to_Apache.Ignite.ExamplesDll.dll]`启动一个独立的节点；
 - 使用`F5`或者`Ctrl-F5`运行示例。

**源代码发行版**

Ignite.NET基于Ignite，需要首先构建Java源代码，具体请参见[这里](/doc/java/#_3-入门)。

可以使用一个`build.bat`或者`build.ps1`脚本（位于`modules\platforms\dotnet\`文件夹）来构建Java源代码、.NET源代码和NuGet软件包。
```bash
rem Switch to Ignite.NET directory
cd modules\platforms\dotnet

build
```
### 2.3.从命令行启动
一个Ignite节点可以从命令行启动，可以使用默认的配置也可以传入一个配置文件。可以启动任意个节点，它们彼此之间会自动发现对方。假定当前位于Ignite的安装文件夹，可以在命令行中输入下面的命令：
```bash
platforms\dotnet\bin\Apache.Ignite.exe
```
可以看到下面的信息：
```
[02:49:12] Ignite node started OK (id=ab5d18a6)
[02:49:12] Topology snapshot [ver=1, nodes=1, CPUs=8, heap=1.0GB]
```
::: tip 提示
关于如何生成独立的Ignite.NET节点以及使用各种配置参数的更多信息，可以参见[独立节点](#_5-独立节点)。
:::
### 2.4.第一个Ignite计算应用
下面是第一个网格应用，该应用将计算句子中的非空白字符数。例如将一个句子拆分为多个单词，并将统计每个单词中的字符数作为一个计算作业，最后将各个作业获得的结果相加即可得出总数。

 - 创建一个新的控制台应用项目；
 - 使用NuGet时：安装Apache Ignite.NET NuGet软件包；
 - 使用完整发行版时：添加对platform\dotnet\bin\Apache.Ignite.Core.dll的引用。

```csharp
static void Compute()
{
    using (var ignite = Ignition.Start())
    {
        var funcs = "Count characters using callable".Split(' ')
          .Select(word => new ComputeFunc { Word = word });

        ICollection<int> res = ignite.GetCompute().Call(funcs);

        var sum = res.Sum();

        Console.WriteLine(">>> Total number of characters in the phrase is '{0}'.", sum);
    }
}

class ComputeFunc : IComputeFunc<int>
{
    public string Word { get; set; }

    public int Invoke()
    {
        return Word.Length;
    }
}

```
### 2.5.第一个Ignite数据网格应用
下面是一组简单的应用，它们会简单地进行一些分布式缓存的读写，然后执行基本的事务操作：

写和读：
```csharp
using (var ignite = Ignition.Start())
{
    var cache = ignite.GetOrCreateCache<int, string>("myCache");

    // Store keys in cache (values will end up on different cache nodes).
    for (int i = 0; i < 10; i++)
        cache.Put(i, i.ToString());

    for (int i = 0; i < 10; i++)
        Console.WriteLine("Got [key={0}, val={1}]", i, cache.Get(i));
}
```
原子化操作：
```csharp
// Put-if-absent which returns previous value.
CacheResult<string> oldVal = cache.GetAndPutIfAbsent(11, "Hello");

// Put-if-absent which returns boolean success flag.
bool success = cache.PutIfAbsent(22, "World");

// Replace-if-exists operation (opposite of getAndPutIfAbsent), returns previous value.
oldVal = cache.GetAndReplace(11, "Hello");

// Replace-if-exists operation (opposite of putIfAbsent), returns boolean success flag.
success = cache.Replace(22, "World");

// Replace-if-matches operation.
success = cache.Replace(22, "World", "World!");

// Remove-if-matches operation.
success = cache.Remove(1, "Hello");
```
事务：
```csharp
using (var tx = ignite.GetTransactions().TxStart())
{
    var hello = cache.Get(1);

    if (hello == "1")
        cache.Put(1, "Hello");

    cache.Put(22, "World");

    tx.Commit();
}
```
分布式锁：
```csharp
// Lock cache key "11".
using (var cacheLock = cache.Lock(11))
{
    cacheLock.Enter();

    try
    {
        cache.Put(11, "Hello");
        cache.Put(22, "World");
    }
    finally
    {
        cacheLock.Exit();
    }
}
```
### 2.6.Ignite Visor管理控制台
要确认数据网格的内容以及执行一些其它的管理和监视操作，最简单的方法是使用Ignite的[Visor命令行工具](/doc/tools/VisorManagementConsole.md)。

通过下面的命令可以启动Visor：
```batch
bin\ignitevisorcmd.bat
```
### 2.7.LINQPad入门
[LINQPad](http://www.linqpad.net/)非常适合快速入门。

Apache Ignite.NET NuGet软件包包括LINQPad示例。

 - 参考NuGet软件包：F4->添加NuGet ...；
 - 转到Samples选项卡 -> nuget -> Apache.Ignite；

更多的信息可以参见：[在LINQPad中使用Apache Ignite.NET](https://ptupitsyn.github.io/Using-Apache-Ignite-Net-in-LINQPad/)。
## 3.跨平台支持
从2.4版本开始，同Windows平台一样，也可以在Linux和macOS平台上运行.NET节点以及开发Ignite.NET应用，.NET Core和Mono平台都是支持的。

### 3.1..NET Core
**环境要求**

 - [.NET Core SDK 2.0+](https://www.microsoft.com/net/download/)；
 - [Java 8+](http://www.oracle.com/technetwork/java/javase/downloads/index.html)（macOS需要JDK，否则JRE也可以）。

**使用NuGet**

 - `dotnet new console`；
 - `dotnet add package Apache.Ignite`；

编辑`Program.cs`文件：
```csharp
using System;
using Apache.Ignite.Core;

namespace IgniteTest
{
    class Program
    {
        static void Main(string[] args)
        {
            Ignition.Start();
        }
    }
}
```

 - `dotnet run`

**运行示例**

[二进制发行版](https://ignite.apache.org/download.cgi#binaries)中包含了.NET Core的示例：

 - 从[这里](https://ignite.apache.org/download.cgi#binaries)下载二进制发行版然后解压；
 - `cd platforms/dotnet/examples/dotnetcore`；
 - `dotnet run`。

### 3.2.Mono
**环境要求**

 - [Mono](http://www.mono-project.com/download/)；
 - [Java 8+](http://www.oracle.com/technetwork/java/javase/downloads/index.html)（macOS需要JDK，否则JRE也可以）。

**使用NuGet**

请参见[入门](#_2-入门)章节中的相关内容。

一个额外的步骤是配置`IGNITE_HOME`环境变量或者`IgniteConfiguration.IgniteHome`，指向NuGet的包路径（通常是`packages/Apache.Ignite.2.4.0`）。

**运行示例**

Mono可以直接在.NET 4环境中构建和运行。

 - `cd platforms/dotnet/examples`；
 - `nuget restore`；
 - `msbuild`；
 - `mono Apache.Ignite.Examples/bin/Debug/Apache.Ignite.Examples.exe`。

### 3.3.Java检测
Ignite.NET会在如下路径中查找Java运行环境：

 - `HKLM\Software\JavaSoft\Java Runtime Environment`（Windows）；
 - `/usr/bin/java`（Linux）；
 - `/Library/Java/JavaVirtualMachines`（macOS）；

如果在其它位置自行安装Java环境，则需配置下面的任一配置项：

 - `IgniteConfiguration.JvmDllPath`属性；
 - `JAVA_HOME`环境变量。

### 3.4.已知问题
**NU1701**

`warning NU1701: Package 'Apache.Ignite 2.4.0' was restored using '.NETFramework,Version=v4.6.1' instead of the project target framework '.NETCoreApp,Version=v2.0'. This package may not be fully compatible with your project.`。

Ignite.NET完全支持.NET Core，但NuGet针对的是.NET 4.0。通过在`csproj`文件中添加`<PropertyGroup><NoWarn>NU1701</NoWarn></PropertyGroup>`，可以安全地忽略此警告。

**No Java runtime present, requesting install**

在macOS上Java的`8u151`版本存在一个问题：[JDK-7131356](https://bugs.openjdk.java.net/browse/JDK-7131356)，一定要安装`8u152`及其以后的版本。

**Serializing delegates is not supported on this platform**

.NET Core不支持序列化委托，执行`System.MulticastDelegate.GetObjectData`[会抛出异常](https://github.com/dotnet/coreclr/blob/master/src/mscorlib/src/System/MulticastDelegate.cs#L52)，因此Ignite.NET无法对委托或包含委托的对象进行序列化。

**Could not load file or assembly 'System.Configuration.ConfigurationManager'**

已知的[.NET问题(506)](https://github.com/dotnet/standard/issues/506)，有时需要额外的包引用：

 - `dotnet add package System.Configuration.ConfigurationManager`


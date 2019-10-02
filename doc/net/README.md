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

Ignite.NET还可以运行于[瘦客户端](#_16-瘦客户端)模式，不需要Java/JVM，与服务端使用单一的TCP连接进行通信。
## 2.Ignite定位

**Ignite是不是持久化或者纯内存存储？**

**都是**，Ignite的原生持久化可以打开，也可以关闭。这使得Ignite可以存储比可用内存容量更大的数据集。也就是说，可以只在内存中存储较少的操作性数据集，然后将不适合存储在内存中的较大数据集存储在磁盘上，即为了提高性能将内存作为一个缓存层。

**Ignite是不是内存数据库（IMDB）？**

**是**，虽然Ignite的*固化内存*在内存和磁盘中都工作得很好，但是磁盘持久化是可以关闭的，使Ignite成为一个支持SQL以及分布式关联的*内存数据库*。

**Ignite是不是内存数据网格（IMDG）？**

**是**，Ignite是一个全功能的数据网格，它既可以用于纯内存模式，也可以带有Ignite的原生持久化，它也可以与任何第三方数据库集成，包括RDBMS和NoSQL。

**Ignite是不是一个分布式缓存？**

**是**，如果关闭原生持久化，Ignite就会成为一个分布式缓存，Ignite实现了JCache规范（JSR107），并且提供了比规范要求更多的功能，包括分区和复制模式、分布式ACID事务、SQL查询以及原生持久化等。

**Ignite是不是分布式数据库？**

**是**，在整个集群的多个节点中，Ignite中的数据要么是*分区模式*的，要么是*复制模式*的，这给系统带来了伸缩性，增加了系统的弹性。Ignite可以自动控制数据如何分区，同时，开发者也可以插入自定义的分布（关联）函数，以及为了提高效率将部分数据并置在一起。

**Ignite是不是SQL数据库？**

**不完整**，尽管Ignite的目标是和其它的关系型SQL数据库具有类似的行为，但是在处理约束和索引方面还是有不同的。Ignite支持*一级*和*二级*索引，但是只有一级索引支持*唯一性*，Ignite还不支持*外键*约束。

总体来说，Ignite作为约束不支持任何会导致集群广播消息的更新以及显著降低系统性能和可伸缩性的操作。

**Ignite是不是一个NoSQL数据库?**

**不完全**，和其它NoSQL数据库一样，Ignite支持高可用和水平扩展，但是，和其它的NoSQL数据库不同，Ignite支持SQL和ACID。

**Ignite是不是事务型数据库？**

**不完整**，ACID事务是支持的，但是仅仅在键-值API级别，Ignite还支持*跨分区的事务*，这意味着事务可以跨越不同服务器不同分区中的键。

Ignite在2.7版本中，通过MVCC技术，实现了包括SQL事务在内的全事务支持，不过目前还处于测试阶段。

**Ignite是不是一个多模式数据库？**

**是**，Ignite的数据建模和访问，同时支持键值和SQL，另外，Ignite还为在分布式数据上的计算处理，提供了强大的API。

**Ignite是不是键-值存储？**

**是**，Ignite提供了丰富的键-值API，兼容于JCache (JSR-107)，并且支持Java，C++和.NET。

**固化内存是什么？**

Ignite的*固化内存*架构使得Ignite可以将内存计算延伸至磁盘，它基于一个页面化的堆外内存分配器，它通过预写日志（WAL）的持久化来对数据进行固化，当持久化禁用之后，固化内存就会变成一个纯粹的内存存储。

**并置处理是什么？**

Ignite是一个分布式系统，因此，有能力将数据和数据以及数据和计算进行并置就变得非常重要，这会避免分布式数据噪声。当执行分布式SQL关联时数据的并置就变得非常的重要。Ignite还支持将用户的逻辑（函数，lambda等）直接发到数据所在的节点然后在本地进行数据的运算。
## 3.入门
### 3.1.环境要求

 - JDK：8+；
 - OS：Windows(7及以上)，Windows Server（2008 R2及以上），Linux（支持.NET Core的任何发行版），macOS；
 - 网络：没有限制（建议10G）；
 - 硬件：无限制；
 - .NET框架：.NET 4.0+, .NET Core 2.0+；
 - IDE：.NET 4.0+, .NET Core 2.0+；

下面的内容基于Windows和Visual Studio，对于Linux和macOS平台的使用，请参见[跨平台支持](#_4-跨平台支持)。

### 3.2.安装
**NuGet**

NuGet是将Ignite.NET包含到项目中最便捷的方法，具体可以在软件包管理器控制台中输入以下内容：`Install-Package Apache.Ignite`进行安装。

或者也可以在NuGet Gallery中搜索软件包：[https://www.nuget.org/packages/Apache.Ignite/](https://www.nuget.org/packages/Apache.Ignite/)。
::: tip 提示
安装NuGet软件包会更新项目的`post-build`事件，将Libs文件夹复制到输出目录，具体请参见[部署](#_14-部署)章节的内容。
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
### 3.3.从命令行启动
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
关于如何生成独立的Ignite.NET节点以及使用各种配置参数的更多信息，可以参见[独立节点](#_6-独立节点)。
:::
### 3.4.第一个Ignite计算应用
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
### 3.5.第一个Ignite数据网格应用
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
### 3.6.Ignite Visor管理控制台
要确认数据网格的内容以及执行一些其它的管理和监视操作，最简单的方法是使用Ignite的[Visor命令行工具](/doc/tools/VisorManagementConsole.md)。

通过下面的命令可以启动Visor：
```batch
bin\ignitevisorcmd.bat
```
### 3.7.LINQPad入门
[LINQPad](http://www.linqpad.net/)非常适合快速入门。

Apache Ignite.NET NuGet软件包包括LINQPad示例。

 - 参考NuGet软件包：F4->添加NuGet ...；
 - 转到Samples选项卡 -> nuget -> Apache.Ignite；

更多的信息可以参见：[在LINQPad中使用Apache Ignite.NET](https://ptupitsyn.github.io/Using-Apache-Ignite-Net-in-LINQPad/)。
## 4.跨平台支持
从2.4版本开始，同Windows平台一样，也可以在Linux和macOS平台上运行.NET节点以及开发Ignite.NET应用，.NET Core和Mono平台都是支持的。

### 4.1..NET Core
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

### 4.2.Mono
**环境要求**

 - [Mono](http://www.mono-project.com/download/)；
 - [Java 8+](http://www.oracle.com/technetwork/java/javase/downloads/index.html)（macOS需要JDK，否则JRE也可以）。

**使用NuGet**

请参见[入门](#_3-入门)章节中的相关内容。

一个额外的步骤是配置`IGNITE_HOME`环境变量或者`IgniteConfiguration.IgniteHome`，指向NuGet的包路径（通常是`packages/Apache.Ignite.2.4.0`）。

**运行示例**

Mono可以直接在.NET 4环境中构建和运行。

 - `cd platforms/dotnet/examples`；
 - `nuget restore`；
 - `msbuild`；
 - `mono Apache.Ignite.Examples/bin/Debug/Apache.Ignite.Examples.exe`。

### 4.3.Java检测
Ignite.NET会在如下路径中查找Java运行环境：

 - `HKLM\Software\JavaSoft\Java Runtime Environment`（Windows）；
 - `/usr/bin/java`（Linux）；
 - `/Library/Java/JavaVirtualMachines`（macOS）；

如果在其它位置自行安装Java环境，则需配置下面的任一配置项：

 - `IgniteConfiguration.JvmDllPath`属性；
 - `JAVA_HOME`环境变量。

### 4.4.已知问题
**NU1701**

`warning NU1701: Package 'Apache.Ignite 2.4.0' was restored using '.NETFramework,Version=v4.6.1' instead of the project target framework '.NETCoreApp,Version=v2.0'. This package may not be fully compatible with your project.`。

Ignite.NET完全支持.NET Core，但NuGet程序集针对的是.NET 4.0。通过在`csproj`文件中添加`<PropertyGroup><NoWarn>NU1701</NoWarn></PropertyGroup>`，可以安全地忽略此警告。

**No Java runtime present, requesting install**

在macOS上Java的`8u151`版本存在一个问题：[JDK-7131356](https://bugs.openjdk.java.net/browse/JDK-7131356)，一定要安装`8u152`及其以后的版本。

**Serializing delegates is not supported on this platform**

.NET Core不支持序列化委托，执行`System.MulticastDelegate.GetObjectData`[会抛出异常](https://github.com/dotnet/coreclr/blob/master/src/mscorlib/src/System/MulticastDelegate.cs#L52)，因此Ignite.NET无法对委托或包含委托的对象进行序列化。

**Could not load file or assembly 'System.Configuration.ConfigurationManager'**

已知的[.NET问题(506)](https://github.com/dotnet/standard/issues/506)，有时需要额外的包引用：

 - `dotnet add package System.Configuration.ConfigurationManager`

## 5.配置
Ignite.NET节点可以通过多种方法来配置，具体表现为一组`Ignition.Start*`方法。

### 5.1.C#代码
在C#代码中，完全可以通过`Ignition.Start(IgniteConfiguration)`配置Ignite.NET。
```csharp
Ignition.Start(new IgniteConfiguration
{
    DiscoverySpi = new TcpDiscoverySpi
    {
        IpFinder = new TcpDiscoveryStaticIpFinder
        {
            Endpoints = new[] {"127.0.0.1:47500..47509"}
        },
        SocketTimeout = TimeSpan.FromSeconds(0.3)
    },
    IncludedEventTypes = EventType.CacheAll,
    JvmOptions = new[] { "-Xms1024m", "-Xmx1024m" }
});
```
### 5.2.app.config和web.config
`Ignition.StartFromApplicationConfiguration`方法会从`app.config`或`web.config`文件的`Apache.Ignite.Core.IgniteConfigurationSection`中读取配置。

在二进制发行版的`Apache.Ignite.Core.dll`旁边，以及`Apache.Ignite.Schema`NuGet包中，可以找到`IgniteConfigurationSection.xsd`架构文件。在配置文件中编辑`IgniteConfigurationSection`时，将其包含在项目中并且构建动作为`None`，可以在Visual Studio中启用IntelliSense。

::: tip 提示
要将`IgniteConfigurationSection.xsd`架构文件添加到Visual Studio项目中，可以转到`Projects`菜单，然后单击`Add Existing Item...`菜单项，之后找到`IgniteConfigurationSection.xsd`并且选中。

或者，安装NuGet软件包：`Install-Package Apache.Ignite.Schema`，这将自动将xsd文件添加到项目中。

为了改善编辑体验，确保在工具-选项-文本编辑器-XML中启用了`语句完成`选项。
:::
**app.config**
```xml
<?xml version="1.0" encoding="utf-8"?>

<configuration>
    <configSections>
        <section name="igniteConfiguration" type="Apache.Ignite.Core.IgniteConfigurationSection, Apache.Ignite.Core" />
    </configSections>

    <runtime>
        <gcServer enabled="true"/>
    </runtime>

    <igniteConfiguration xmlns="http://ignite.apache.org/schema/dotnet/IgniteConfigurationSection" gridName="myGrid1">
        <discoverySpi type="TcpDiscoverySpi">
            <ipFinder type="TcpDiscoveryStaticIpFinder">
                <endpoints>
                    <string>127.0.0.1:47500..47509</string>
                </endpoints>
            </ipFinder>
        </discoverySpi>

        <cacheConfiguration>
            <cacheConfiguration cacheMode='Replicated' readThrough='true' writeThrough='true' />
            <cacheConfiguration name='secondCache' />
        </cacheConfiguration>

        <includedEventTypes>
            <int>42</int>
            <int>TaskFailed</int>
            <int>JobFinished</int>
        </includedEventTypes>

        <userAttributes>
            <pair key='myNode' value='true' />
        </userAttributes>

        <JvmOptions>
          <string>-Xms1024m</string>
          <string>-Xmx1024m</string>
        </JvmOptions>
    </igniteConfiguration>
</configuration>
```
**C#**
```csharp
var ignite = Ignition.StartFromApplicationConfiguration("igniteConfiguration");
```
**Ignite配置段的语法**

Ignite的配置段直接映射到`IgniteConfiguration`类。

 - 简单属性（字符串、基础类型、枚举）映射到XML属性（属性名为驼峰式的C#属性名）；
 - 复杂属性映射到嵌套的XML元素（元素名为驼峰式的C#属性名）；
 - 当复杂属性是接口或抽象类时，`type`属性将用于指定类型，需要使用程序集限定名。对于内置类型（例如上面代码示例中的`TcpDiscoverySpi`），可以省略程序集名和命名空间；
 - 如有疑问，可以查询`IgniteConfigurationSection.xsd`。

### 5.3.Spring XML
Spring的XML文件可以使用原生的基于Java的Ignite配置，Spring的配置文件可以通过`Ignition.Start(string)`方法以及`IgniteConfiguration.SpringConfigUrl`属性传入。

使用`IgniteConfiguration.SpringConfigUrl`属性时，Spring的配置会首先加载，在其之上才会应用其他的`IgniteConfiguration`属性，这样在Ignite.NET不直接支持某些Java属性时，此功能会有用。

**Spring XML：**
```xml
<?xml version="1.0" encoding="UTF-8"?>

<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:util="http://www.springframework.org/schema/util"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
                           http://www.springframework.org/schema/beans/spring-beans.xsd
                           http://www.springframework.org/schema/util
                           http://www.springframework.org/schema/util/spring-util.xsd">
    <bean id="grid.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
        <property name="localHost" value="127.0.0.1"/>
        <property name="gridName" value="grid1"/>
        <property name="userAttributes">
            <map>
                <entry key="my_attr" value="value1"/>
            </map>
        </property>

        <property name="cacheConfiguration">
            <list>
                <bean class="org.apache.ignite.configuration.CacheConfiguration">
                    <property name="name" value="cache1"/>
                    <property name="startSize" value="10"/>
                </bean>
            </list>
        </property>

        <property name="discoverySpi">
            <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
                <property name="ipFinder">
                    <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.vm.TcpDiscoveryVmIpFinder">
                        <property name="addresses">
                            <list>
                                <value>127.0.0.1:47500..47509</value>
                            </list>
                        </property>
                    </bean>
                </property>
                <property name="socketTimeout" value="300" />
            </bean>
        </property>
    </bean>
</beans>
```
**C#：**
```csharp
var ignite = Ignition.Start("spring-config.xml");
```
## 6.独立节点
Ignite.NET节点可以在.NET应用的代码中通过使用`Ignition.Start()`启动，也可以使用可执行的`Apache.Ignite.exe`（位于`{apache_ignite_release}\platforms\dotnet\bin`文件夹下）作为单独的进程启动。像通常一样，在内部`Apache.Ignite.exe`引用`Apache.Ignite.Core.dll`和使用`Ignition.Start()`，并且可以使用下面列出的命令行参数进行配置，方法是将它们作为命令行选项传递或直接在`Apache.Ignite.exe.config`文件中进行设置。
### 6.1.通过命令行配置独立节点
下面是基本的Ignite参数，当使用`Apache.Ignite.exe`程序启动节点时，这些参数可以作为命令行参数传入：

|命令行参数|含义|
|---|---|
|`-IgniteHome`|Ignite安装目录路径（如果未提供会使用`IGNITE_HOME`环境变量）|
|`-ConfigFileName`|`app.config`文件路径（如果未提供会使用`Apache.Ignite.exe.config`）|
|`-ConfigFileName`|配置文件中`IgniteConfigurationSection`的名字|
|`-SpringConfigUrl`|Spring配置文件路径|
|`-JvmDllPath`|JVM库`jvm.dll`的路径（如果未提供会使用`JAVA_HOME`环境变量）|
|`-JvmClasspath`|传递给JVM的类路径（在这里注册其它的jar文件）|
|`-SuppressWarnings`|是否输出警告信息|
|`-J<javaOption>`|JVM参数|
|`-Assembly`|要加载的其它.NET程序集|
|`-JvmInitialMemoryMB`|初始Java堆大小（MB），对应于`-Xms`Java参数|
|`-JvmMaxMemoryMB`|最大Java堆大小（MB），对应于`-Xmx`Java参数|
|`/install`|根据指定的参数将Ignite安装为Windows服务|
|`/uninstall`|卸载Ignite Windows服务|

示例：
```batch
Apache.Ignite.exe -ConfigFileName=c:\ignite\my-config.xml -ConfigSectionName=igniteConfiguration -Assembly=c:\ignite\my-code.dll -J-Xms1024m -J-Xmx2048m
```
### 6.2.通过XML文件配置独立节点
通过`app.config`XML文件或/和Spring配置文件，也可以配置独立节点。上面列出的每个命令行参数，也可以用于`Apache.Ignite.exe.config`的`appSettings`段。
```xml
<configuration>
  <configSections>
    <section name="igniteConfiguration" type="Apache.Ignite.Core.IgniteConfigurationSection, Apache.Ignite.Core" />
  </configSections>

  <igniteConfiguration springConfigUrl="c:\ignite\spring.xml">
    <cacheConfiguration name="myCache" cacheMode="Replicated" />
  </igniteConfiguration>

  <appSettings>
    <add key="Ignite.Assembly.1" value="my-assembly.dll"/>
    <add key="Ignite.Assembly.2" value="my-assembly2.dll"/>
    <add key="Ignite.ConfigSectionName" value="igniteConfiguration" />
  </appSettings>
</configuration>
```
这个示例定义了`igniteConfiguration`段，并通过`Ignite.ConfigSectionName`配置用其启动Ignite，它还引用了一个Spring配置文件，两者最终会组合在一起。
### 6.3.加载用户程序集
某些Ignite的API涉及了远程代码执行，因此需要将代码和程序集一起加载到`Apache.Ignite.exe`，这可以通过`-Assembly`命令行参数或者`Ignite.Assembly`应用配置来实现。

以下功能要求在所有节点上加载相应的程序集：

 - `ICompute`（支持自动加载，具体可以参见[远程程序集加载](/doc/net/Clustering.md#_7_远程程序集加载)）。
 - 带过滤器的扫描查询；
 - 带过滤器的持续查询；
 - `远程程序集加载`方法；
 - 带过滤器的`ICache.LoadCache`；
 - `IServices`；
 - `IMessaging.RemoteListen`；
 - `IEvents.RemoteQuery`。

::: warning 缺失用户程序集
如果一个用户程序集无法加载，会抛出`Could not load file or assembly 'MyAssembly' or one of its dependencies`异常。

注意任何程序集的**依赖**也是必须要加入该列表的。
:::
### 6.4.Ignite.NET作为Windows服务
`Apache.Ignite.exe`可以安装为Windows的服务，因此可以通过`/install`命令行参数自动启动。每次服务启动时，所有其它命令行参数将被保留和使用。使用`/uninstall`可以卸载服务。
```batch
Apache.Ignite.exe /install -J-Xms513m -J-Xmx555m -ConfigSectionName=igniteConfiguration
```
## 7.Ignite.NET生命周期
Ignite.NET是基于进程的，单个进程代表一个或多个逻辑Ignite.NET节点（多数情况下单个进程仅运行一个Ignite.NET节点）。在整个Ignite文档中，几乎可以交替使用术语Ignite运行时和Ignite节点，例如当说要求“在该主机上运行5个节点”时，从技术上讲，大多数情况下在该主机上启动5个Ignite.NET进程即可，每个进程都运行一个Ignite节点。当然Ignite.NET也可以在单​​个进程中支持多个节点，比如大多数Ignite.NET自身内部测试即是这样的运行方式。

::: tip 提示
Ignite.NET运行时 == Ignite.NET进程 == Ignite.NET节点（多数情况下）
:::
### 7.1.Ignition类
`Ignition`类可以在网络拓扑中启动一个独立的Ignite.NET节点，注意一台物理服务器（例如网络上的一台计算机），可以同时运行多个Ignite.NET节点。

下面是在本地使用默认值启动一个节点的方法：
```csharp
IIgnite ignite = Ignition.Start();
```
也可以传递一个配置文件：
```csharp
IIgnite ignite = Ignition.Start("examples/config/example-cache.xml");
```
配置文件的路径可以是绝对路径，也可以相对于`IGNITE_HOME`（Ignite安装文件夹）或者当前目录。

### 7.2.ILifecycleHandler
有时在启动或者停止Ignite节点时需要执行特定的事件，这可以通过实现`ILifecycleHandler`接口实现，然后在`IgniteConfiguration`的`LifecycleHandlers`属性中指定。
```csharp
var cfg = new IgniteConfiguration
{
    LifecycleHandlers = new [] { new LifecycleExampleHandler() }
};

using (var ignite = Ignition.Start(cfg))
{
  ...
}
```
`ILifecycleHandler`的实现大致如下：
```csharp
class LifecycleExampleHandler : ILifecycleHandler
{
    public void OnLifecycleEvent(LifecycleEventType evt)
    {
        if (evt == LifecycleEventType.AfterNodeStart)
            Started = true;
        else if (evt == LifecycleEventType.AfterNodeStop)
            Started = false;
    }

    public bool Started { get; private set; }
}
```
### 7.3.生命周期事件类型
Ignite.NET支持如下的生命周期事件类型：

|事件类型|描述|
|---|---|
|`BeforeNodeStart`|启动节点启动过程之前调用|
|`AfterNodeStart`|节点启动之后调用|
|`BeforeNodeStop`|启动节点停止过程之前调用|
|`AfterNodeStop`|节点停止之后调用|


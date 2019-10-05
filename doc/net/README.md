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

## 8.异步支持
Ignite.NET API的所有分布式方法都可以以同步或者异步的方式执行，这些方法以`DoSomething`/`DoSomethingAsync`的方式成对表示。异步方法遵循基于任务的异步模式：它们返回System.Threading.Task，可以使用C# 5的`await`关键字来等待。

支持取消的异步方法具有`CancellationToken`参数重载。

**计算网格示例**

下面的示例说明了同步计算和异步计算之间的区别。

同步：
```csharp
ICompute compute = ignite.GetCompute();

// Execute a job and wait for the result.
string res = compute.Call(new ComputeFunc());

Console.WriteLine(res);
```
下面是将上面的代码异步化：
```csharp
// Start asynchronous operation and obtain a Task that represents it
Task<string> asyncRes = compute.CallAsync(new ComputeFunc());

// Synchronously wait for the task to complete and obtain result
Console.WriteLine(asyncRes.Result);

// OR use C# 5 await keyword
Console.WriteLine(await asyncRes);

// OR use continuation
asyncRes.ContinueWith(task => Console.WriteLine(task.Result));
```
**数据网格示例**

下面是同步和异步调用的数据网格示例。

同步：
```csharp
ICache<int, string> cache = ignite.GetCache<int, string>("myCache");

CacheResult<string> val = cache.GetAndPut(1, "1");
```
下面是上面调用的异步形式：
```csharp
// Start asynchronous operation and obtain a Task that represents it
Task<CacheResult<string>> asyncVal = cache.GetAndPutAsync(1, "1");

// Synchronously wait for the task to complete and obtain result
Console.WriteLine(asyncVal.Result.Success);

// Use C# 5 await keyword
Console.WriteLine((await asyncVal).Success);

// Use continuation
asyncVal.ContinueWith(task => Console.WriteLine(task.Result.Success));
```
### 8.1.异步延续
Ignite中的异步操作是通过特殊的系统线程完成的，这些线程具有以下限制：

 - 不应使用Ignite API；
 - 不应执行繁重的操作。

当`ConfigureAwait(false)`与`async`关键字一起使用时，代码可能最终在Ignite系统线程中：
```csharp
var cache = ignite.GetCache<int, int>("ints");

await cache.PutAsync(1, 1).ConfigureAwait(false);
// All the code below executes in Ignite system thread.
// Do not access Ignite APIs from here.
```
如果需要执行多个等待的操作，请不要使用`ConfigureAwait(false)`。

对于控制台、ASP.NET Core和某些其他类型的应用，`System.Threading.SynchronizationContext`未设置默认值，因此一个自定义的`SynchronizationContext`是必要的，以避免在Ignite系统线程上运行延续。最简单的方法是从这样的`SynchronizationContext`类派生：
```csharp
class Program
{
    public static async Task<int> Main()
    {
        // Run async continuations on .NET Thread Pool threads.
        SynchronizationContext.SetSynchronizationContext(
             new ThreadPoolSynchronizationContext());

        using (var ignite = Ignition.Start())
        {
            var cache = ignite.GetOrCreateCache<int, string>("my-cache");
            await cache.PutAsync(1, "Test1");
            await cache.PutAsync(2, "Test2");
            await cache.PutAsync(3, "Test3");
        }

        return 0;
    }
}

class ThreadPoolSynchronizationContext : SynchronizationContext
{
    // No-op.
    // Don't use SynchronizationContext class directly because optimization
    // in the Task class treats that the same way as null context.
}
```
## 9.客户端和服务端
### 9.1.概述
Ignite.NET有`客户端`和`服务端`节点的概念。服务端节点参与缓存、计算执行、流处理等，而原生客户端节点可以远程接入服务端，可以使用完整的Ignite API，包括客户端近缓存、事务、计算、流处理、服务网格等。

所有Ignite节点默认均以`服务端`模式启动，`客户端`模式是需要显式指定的。

另一个Ignite模式是[瘦客户端](#_16-瘦客户端)，它与原生客户端有很大不同。瘦客户端非常轻量，不参与集群拓扑。每个瘦客户端都通过套接字接入特定的Ignite节点，并通过该节点执行所有操作。瘦客户端API与完整的Ignite API相似，但功能较少。
### 9.2.配置客户端和服务端
通过`IgniteConfiguration.clientMode`属性，可以将一个节点配置为客户端或者服务端。

或者为了方便，也可以在`Ignition`类本身上启用或禁用客户端模式，这样可以使客户端和服务端有同样的配置。
```csharp
Ignition.ClientMode = true;

// Start Ignite in client mode.
IIgnite ignite = Ignition.Start();
```
### 9.3.创建分布式缓存
当创建缓存时，不管是通过XML文件，还是通过`IIgnite.CreateCache(...)`或者`IIgnite.GetOrCreateCache(...)`方法，Ignite都会自动在所有服务端节点上部署分布式缓存。
::: tip 提示
一个分布式缓存创建之后，它会自动部署到所有的现有和未来的`服务端`节点上。
:::
```csharp
// Enable client mode locally.
Ignition.ClientMode = true;

// Start Ignite in client mode.
IIgnite ignite = Ignition.Start();

// Create cache on all the existing and future server nodes.
// Note that since the local node is a client, it will not
// be caching any data.
var cache = ignite.GetOrCreateCache<object, object>("cacheName");
```
### 9.4.客户端或者服务端上的计算
`IgniteCompute`默认会在所有的服务端节点上执行计算作业，不过通过创建对应的集群组，也可以选择只在服务端节点或者只在客户端节点上执行。

服务端上的计算：
```csharp
ICompute compute = ignite.GetCompute();

// Execute computation on the server nodes (default behavior).
compute.Broadcast(new MyComputeAction());
```
客户端上的计算：
```csharp
IClusterGroup clientGroup = ignite.GetCluster().ForClientNodes(null);

ICompute clientCompute = clientGroup.GetCompute();

// Execute computation on the client nodes.
clientCompute.Broadcast(new MyComputeAction());
```
### 9.5.客户端重连
在以下几种情况下，客户端节点可能会与集群断开连接：

 - 当客户端节点由于网络问题而无法与服务端节点重建连接时；
 - 与服务端节点的连接断开了一段时间，客户端节点能够重建与服务端的连接，但是服务端因为未收到客户端心跳，仍然删除了客户端节点；
 - 速度慢的客户端可能会被服务器节点踢出。

当客户端确定它与集群断开时，它会被分配一个新的节点`id`，并尝试重新接入集群。不过要注意这有副作用，即如果客户端重新连接，则本地`ClusterNode`的`id`属性将更改，这意味着任何依赖于`id`值的应用逻辑都可能受到影响。

当客户端处于断开状态并且正在进行重连尝试时，Ignite API会抛出一个特定的异常： `IgniteClientDisconnectedException`，此异常提供了一个`ClientReconnectTask`属性，该任务在重连完成后将会完成（`IgniteCache`API会抛出`CacheException`，其将`IgniteClientDisconnectedException`作为`InnerException`），该任务也可以通过`IIgnite.ClientReconnectTask`获得。

客户端重连也有对应的Ignite事件（这些事件是本地事件，即它们仅在客户端节点上触发），包括：`EventType.ClientNodeDisconnected`和`EventType.ClientNodeReconnected`。

`IIgnite`中当然也有`ClientDisconnected`和`ClientReconnected`事件：

计算：
```csharp
var compute = ignite.GetCompute();

while (true)
{
    try
    {
        compute.Run(job);
    }
    catch (ClientDisconnectedException e)
    {
        e.ClientReconnectTask.Wait(); // Wait for reconnection.

        // Can proceed and use the same ICompute instance.
    }
}
```
缓存：
```csharp
var cache = ignite.GetOrCreateCache("myCache");

while (true)
{
  try
  {
    cache.Put(key, val);
  }
  catch (CacheException e)
  {
    var discEx = e.InnerException as ClientDisconnectedException;

    if (discEx != null)
    {
      discEx.ClientReconnectTask.Wait();

      // Can proceed and use the same ICache instance.
    }
  }
}
```
使用`TcpDiscoverySpi`中的`ClientReconnectDisabled`属性，也可以禁用客户端的自动重连。如果重连被禁用，客户端节点会被停止。

C#：
```csharp
var cfg = new IgniteConfiguration
{
    DiscoverySpi = new TcpDiscoverySpi
    {
        ClientReconnectDisabled = true
    }
};
```
app.config：
```xml
<discoverySpi type="TcpDiscoverySpi" clientReconnectDisabled="true" />
```
### 9.6.管理慢客户端
在许多环境中，客户端节点是在主集群之外、网络较差、速度较慢的主机上启动的，这时服务端可能会生成客户端无法处理的负载（例如持续查询通知等），从而导致服务端上出站消息队列的增加。如果启用了背压控制，最终可能会导致服务端内存不足或阻塞整个集群。

要管理这些情况，可以配置面向客户端节点的最大允许出站消息数。如果出站队列的大小超过此值，则此类客户端节点将与集群断开，从而阻止整体变慢。

下面显示了如何配置慢客户端队列限制：

C#：
```csharp
var cfg = new IgniteConfiguration
{
    CommunicationSpi = new TcpCommunicationSpi
    {
        SlowClientQueueLimit = 1000
    }
};
```
app.config：
```xml
<igniteConfiguration>
    <communicationSpi type="TcpCommunicationSpi" slowClientQueueLimit="1000" />
</igniteConfiguration>
```
Spring XML：
```xml
<bean id="grid.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="communicationSpi">
    <bean class="org.apache.ignite.spi.communication.tcp.TcpCommunicationSpi">
      <property name="slowClientQueueLimit" value="1000"/>
    </bean>
  </property>
</bean>
```
## 10.性能优化技巧
Ignite.NET内存数据网格的性能和吞吐量很大程度上依赖于使用的功能以及配置，在几乎所有的场景中都可以通过简单地调整缓存的配置来优化缓存的性能。
### 10.1.禁用内部事件通知
Ignite有丰富的事件系统来向用户通知各种各样的事件，包括缓存的修改、退出、压缩、拓扑的变化等。因为每秒钟可能产生上千的事件，它会对系统产生额外的负载，这会导致显著地性能下降。因此，强烈建议只有应用逻辑必要时才启用这些事件。事件通知默认是禁用的：

C#：
```csharp
var cfg = new IgniteConfiguration
{
    IncludedEventTypes =
    {
        EventType.TaskStarted,
        EventType.TaskFinished,
        EventType.TaskFailed
    }
};
```
app.config：
```xml
<igniteConfiguration>
    <includedEventTypes>
        <int>TaskStarted</int>
        <int>TaskFinished</int>
        <int>TaskFailed</int>
    </includedEventTypes>
</igniteConfiguration>
```
Spring XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    ...
    <!-- Enable only some events and leave other ones disabled. -->
    <property name="includeEventTypes">
        <list>
            <util:constant static-field="org.apache.ignite.events.EventType.EVT_TASK_STARTED"/>
            <util:constant static-field="org.apache.ignite.events.EventType.EVT_TASK_FINISHED"/>
            <util:constant static-field="org.apache.ignite.events.EventType.EVT_TASK_FAILED"/>
        </list>
    </property>
    ...
</bean>
```
### 10.2.调整缓存初始大小
在大小和容量方面，Ignite的内部缓存映射的行为与普通的.NET Hashtable或Dictionary完全相同：它有初始容量（默认情况下很小），当没有空余时容量会增加一倍。内部缓存映射调整大小的过程会占用大量CPU且非常耗时，并且如果将巨大的数据集加载到缓存中（这是常规使用场景），则映射将不得不调整很多次。为避免这种情况，建议指定初始缓存映射容量，与数据集的预期大小相当。在加载期间这将节省大量CPU资源，因为不必调整映射的大小。例如如果希望将1亿数据加载到缓存中，则可以使用以下配置：

C#：
```csharp
var cfg = new IgniteConfiguration
{
    CacheConfiguration = new[]
    {
        new CacheConfiguration
        {
            StartSize = 100 * 1024 * 1024
        }
    }
};
```
app.config：
```xml
<igniteConfiguration>
    <cacheConfiguration>
        <cacheConfiguration startSize="104857600" />
    </cacheConfiguration>
</igniteConfiguration>
```
Spring XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    ...
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            ...
            <!-- Set initial cache capacity to ~ 100M. -->
            <property name="startSize" value="#{100 * 1024 * 1024}"/>
            ...
        </bean>
    </property>
</bean>
```
上面的配置将节省`log₂(10⁸) − log₂(1024) ≈ 16`次缓存映射大小调整（初始映射容量默认为1024）。注意每次后续大小调整平均将比前一次多2倍的时间。
### 10.3.关闭备份
如果使用了`分区`缓存，而且数据丢失并不是关键（比如，当有一个备份缓存存储时），可以考虑禁用`分区`缓存的备份。当备份启用时，缓存引擎会为每个条目维护一个远程拷贝，这需要网络交换，因此是耗时的。要禁用备份，可以使用如下的配置：

C#：
```csharp
var cfg = new IgniteConfiguration
{
    CacheConfiguration = new[]
    {
        new CacheConfiguration
        {
            CacheMode = CacheMode.Partitioned,
            Backups = 0
        }
    }
};
```
app.config：
```xml
<igniteConfiguration>
    <cacheConfiguration>
        <cacheConfiguration cacheMode="Partitioned" backups="0" />
    </cacheConfiguration>
</igniteConfiguration>
```
Spring XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    ...
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            ...
            <!-- Set cache mode. -->
            <property name="cacheMode" value="PARTITIONED"/>
            <!-- Set number of backups to 0-->
            <property name="backups" value="0"/>
            ...
        </bean>
    </property>
</bean>
```
::: warning 可能的数据丢失
如果没有启用`分区`缓存的备份，会丢失缓存在故障节点的所有数据，这对于缓存临时数据或者数据可以通过某种方式重建可能是可以接受的。禁用备份之前一定要确认对于应用来说丢失数据不是严重问题。
:::
### 10.4.调整退出策略
退出默认是禁用的，为了确保缓存中的数据不会增长到超过限值，需要使用退出机制并选择合适的退出策略，下面的示例是配置LRU退出策略，最大值为100000条数据：

C#：
```csharp
var cfg = new IgniteConfiguration
{
    CacheConfiguration = new[]
    {
        new CacheConfiguration
        {
            EvictionPolicy = new LruEvictionPolicy { MaxSize = 1000000 }
        }
    }
};
```
app.config：
```xml
<igniteConfiguration>
    <cacheConfiguration>
        <cacheConfiguration>
          	<evictionPolicy type='LruEvictionPolicy' maxSize='1000000' />
        </cacheConfiguration>
    </cacheConfiguration>
</igniteConfiguration>
```
Spring XML：
```xml
<bean class="org.apache.ignite.cache.CacheConfiguration">
    ...
    <property name="evictionPolicy">
        <!-- LRU eviction policy. -->
        <bean class="org.apache.ignite.cache.eviction.lru.LruEvictionPolicy">
            <!-- Set the maximum cache size to 1 million (default is 100,000). -->
            <property name="maxSize" value="1000000"/>
        </bean>
    </property>
    ...
</bean>
```
不管使用了哪个退出策略，缓存的性能取决于缓存中退出策略允许的最大数据量，即如果缓存大小超过了限值，就会发生退出。
### 10.5.调整缓存数据再平衡
当新节点加入拓扑时，现有节点会放弃某些键的主备数据所有权，并转给新的节点，以使数据在整个网格中始终保持均衡。这可能需要额外的资源并影响缓存性能，要解决此可能的问题，需要考虑调整以下参数：

 - 配置适合自己网络的再平衡批次大小。默认值为512KB，这意味着默认的再平衡消息约为512KB，不过可以根据网络性能将此值设置为更高或更低；
 - 配置再平衡限流以释放CPU。如果数据集很大并且有很多消息要发送，则CPU或网络可能会被过度消耗，这可能会持续降低应用的性能。这时应该启用数据再平衡限流，这有助于调整再平衡消息之间的等待时间，以确保再平衡过程不会对性能造成任何负面影响。注意在再平衡过程中，应用将继续正常运行；
 - 配置再平衡线程池大小。与上一点相反，有时可能需要通过使用更多的CPU内核来加快再平衡，这可以通过增加再平衡线程池中的线程数来实现（池中默认只有2个线程）。

以下是在缓存配置中配置所有上述参数的示例：

C#：
```csharp
var cfg = new IgniteConfiguration
{
    CacheConfiguration = new[]
    {
        new CacheConfiguration
        {
            RebalanceBatchSize = 1024 * 1024,
            RebalanceThrottle = TimeSpan.Zero  // disable throttling
        }
    }
};
```
app.config：
```xml
<igniteConfiguration>
    <cacheConfiguration>
        <cacheConfiguration rebalanceBatchSize="1048576" rebalanceThrottle="0:0:0" />
    </cacheConfiguration>
</igniteConfiguration>
```
Spring XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    ...
    <property name="cacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            <!-- Set rebalance batch size to 1 MB. -->
            <property name="rebalanceBatchSize" value="#{1024 * 1024}"/>

            <!-- Explicitly disable rebalance throttling. -->
            <property name="rebalanceThrottle" value="0"/>
            ...
        </bean
    </property>
</bean>
```
### 10.6.配置线程池
Ignite的主线程池大小默认为可用CPU核数的2倍。在大多数情况下，每个内核持有2个线程可以提高应用的性能，因为上下文切换会更少，CPU缓存也会更好地工作。不过如果预期作业会因I/O或任何其他原因而阻塞，则增加线程池大小可能是有意义的。以下是如何配置线程池的示例：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    ...
    <!-- Configure internal thread pool. -->
    <property name="publicThreadPoolSize" value="64"/>

    <!-- Configure system thread pool. -->
    <property name="systemThreadPoolSize" value="32"/>
    ...
</bean>
```
### 10.7.尽可能地使用IBinarizable
通过网络传输的每个对象都实现`Apache.Ignite.Core.Binary.IBinarizable`是一个最佳实践。这些可能是缓存键或值、作业、作业的参数或将通过网络发送到其他节点的任何内容。实现`IBinarizable`有时性能可能比标准序列化提高10倍以上。
### 10.8.使用并置计算
Ignite可以在内存中执行MapReduce计算，不过大多数计算通常需要处理缓存在远程节点上的某些数据。从远程节点加载该数据通常非常昂贵，但是将计算发送到数据所在的节点要廉价得多。最简单的方法是使用`ICompute.AffinityRun()`方法，还有其他方法，包括`ICacheAffinity.MapKeysToNodes()`方法。并置计算概念的更多信息和代码示例，请参见[关联并置](/doc/net/DataGrid.md#_7-关联并置)。
### 10.9.使用数据流处理器
如果需要将大量数据加载到缓存中，可以使用`IDataStreamer`。数据流处理器在将更新发送到远程节点之前，会将更新恰当地批量化，还会适当地控制每个节点上并行操作的数量，以避免故障。通常它的性能比一堆单线程更新高10倍。更详细的说明和示例，请参见[数据加载](/doc/net/DataGrid.md#_8-数据加载)章节。
### 10.10.批量处理消息
如果能发送10个比较大的作业而不是100个小些的作业，那么应该选择发送大些的作业，这会降低网络上传输作业的数量以及显著地提升性能。类似的对于缓存条目也是一样，应该尽可能使用持有键值集合的API方法，而不是一个一个地传递。
### 10.11.调整垃圾收集
如果由于垃圾收集（GC）导致吞吐量大幅波动，则应调整JVM参数。以下的JVM设置已经被证明可提供相当平稳的吞吐量，而不会出现大的波动：
```
-XX:+UseParNewGC
-XX:+UseConcMarkSweepGC
-XX:+UseTLAB 
-XX:NewSize=128m
-XX:MaxNewSize=128m
-XX:MaxTenuringThreshold=0
-XX:SurvivorRatio=1024
-XX:+UseCMSInitiatingOccupancyOnly
-XX:CMSInitiatingOccupancyFraction=60
```
# 1.基本概念
## 1.1.Ignite C++是什么？

::: tip Ignite是：
一个以内存为中心的分布式数据库、缓存和处理平台，可以在PB级数据中，以内存级的速度进行事务性、分析性以及流式负载的处理。
:::

![](https://files.readme.io/98cd767-0bad3a9-ignite_architecture.png)

### 1.1.1.固化内存
Ignite的固化内存组件不仅仅将内存作为一个缓存层，还视为一个全功能的存储层。这意味着可以按需将持久化打开或者关闭。如果持久化关闭，那么Ignite就可以作为一个分布式的**内存数据库**或者**内存数据网格**，这完全取决于使用SQL和键-值API的喜好。如果持久化打开，那么Ignite就成为一个分布式的，**可水平扩展的数据库**，它会保证完整的数据一致性以及集群故障的可恢复能力。
### 1.1.2.Ignite持久化
Ignite的原生持久化是一个分布式的、支持ACID以及兼容SQL的磁盘存储，它可以作为一个可选的磁盘层与Ignite的固化内存透明地集成，然后将数据和索引存储在SSD、闪存、3D XPoint以及其他类型的非易失性存储中。

打开Ignite的持久化之后，就不需要将所有的数据和索引保存在内存中，或者在节点或者集群重启后对数据进行预热，因为固化内存和持久化紧密耦合之后，会将其视为一个二级存储层，这意味着在内存中数据和索引的一个子集如果丢失了，固化内存会从磁盘上进行获取。
### 1.1.3.ACID兼容
存储在Ignite中的数据，在内存和磁盘上是同时支持ACID的，使Ignite成为一个**强一致**的系统，Ignite可以在整个网络的多台服务器上保持事务。
### 1.1.4.完整的SQL支持
Ignite提供了完整的SQL、DDL和DML的支持，可以使用纯SQL而不用写代码与Ignite进行交互，这意味着只使用SQL就可以创建表和索引，以及插入、更新和查询数据。有这个完整的SQL支持，Ignite就可以作为一种**分布式SQL数据库**。
### 1.1.5.键-值
Ignite的内存数据网格组件是一个完整的事务型**分布式键值存储**，它可以在有几百台服务器的集群上进行水平扩展。在打开持久化时，Ignite可以存储比内存容量更大的数据，并且在整个集群重启之后仍然可用。
### 1.1.6.并置处理
大多数传统数据库是以客户机-服务器的模式运行的，这意味着数据必须发给客户端进行处理，这个方式需要在客户端和服务端之间进行大量的数据移动，通常来说不可扩展。而Ignite使用了另外一种方式，可以将轻量级的计算发给数据，即数据的**并置**计算，从结果上来说，Ignite扩展性更好，并且使数据移动最小化。
### 1.1.7.可扩展性和持久性
Ignite是一个弹性的、可水平扩展的分布式系统，它支持按需地添加和删除节点，Ignite还可以存储数据的多个副本，这样可以使集群从部分故障中恢复。如果打开了持久化，那么Ignite中存储的数据可以在集群的完全故障中恢复。Ignite集群重启会非常快，因为数据从磁盘上获取，瞬间就具有了可操作性。从结果上来说，数据不需要在处理之前预加载到内存中，而Ignite会缓慢地恢复内存级的性能。
### 1.1.8.Ignite和Ignite C++

 - Ignite C++构建于Ignite之上；
 - Ignite C++在同一个进程中启动JVM，并且通过JNI与之通信；
 - .NET、C++和Java节点可以加入同一个集群，使用相同的缓存，并且使用通用的二进制协议进行互操作；
 - Java计算作业可以在任意节点上执行（Java、.NET和C++）。

## 1.2.Ignite定位

**Ignite是不是持久化或者纯内存存储？**

**都是**，Ignite的原生持久化可以打开，也可以关闭。这使得Ignite可以存储比可用内存容量更大的数据集。也就是说，可以只在内存中存储较少的操作性数据集，然后将不适合存储在内存中的较大数据集存储在磁盘上，即为了提高性能将内存作为一个缓存层。

**Ignite是不是内存数据库（IMDB）？**

**是**，虽然Ignite的*固化内存*在内存和磁盘中都工作得很好，但是磁盘持久化是可以关闭的，使Ignite成为一个支持SQL以及分布式关联的*内存数据库*。

**Ignite是不是内存数据网格（IMDG）？**

**是**，Ignite是一个全功能的数据网格，它既可以用于纯内存模式，也可以带有Ignite的原生持久化，它也可以与任何第三方数据库集成，包括RDBMS和NoSQL。

**Ignite是不是一个分布式缓存？**

**是**，如果关闭原生持久化，Ignite就会成为一个分布式缓存，Ignite实现了JCache规范（JSR107），并且提供了比规范要求更多的功能，包括分区和复制模式、分布式ACID事务、SQL查询以及原生持久化等。

**Ignite是不是分布式数据库？**

**是**，在整个集群的多个节点中，Ignite中的数据要么是*分区模式*的，要么是*复制模式*的，这给系统带来了伸缩性，增加了系统的弹性。Ignite可以自动控制数据如何分区，同时，开发者也可以插入自定义的分布（关系）函数，以及为了提高效率将部分数据并置在一起。

**Ignite是不是关系型SQL数据库？**

**不完整**，尽管Ignite的目标是和其他的关系型SQL数据库具有类似的行为，但是在处理约束和索引方面还是有不同的。Ignite支持*一级*和*二级*索引，但是只有一级索引支持*唯一性*，Ignite还不支持*外键*约束。

总体来说，Ignite作为约束不支持任何会导致集群广播消息的更新以及显著降低系统性能和可伸缩性的操作。

**Ignite是不是一个NoSQL数据库?**

**不完全**，和其他NoSQL数据库一样，Ignite支持高可用和水平扩展，但是，和其他的NoSQL数据库不同，Ignite支持SQL和ACID。

**Ignite是不是事务型数据库？**

**不完整**，ACID事务是支持的，但是仅仅在键-值API级别，Ignite还支持*跨分区的事务*，这意味着事务可以跨越不同服务器不同分区中的键。

在SQL层，Ignite支持*原子性*，还不是*事务型一致性*，社区计划在2.4版本中实现SQL事务。

**Ignite是不是一个多模式数据库？**

**是**，Ignite的数据建模和访问，同时支持键值和SQL，另外，Ignite还为在分布式数据上的计算处理，提供了强大的API。

**Ignite是不是键-值存储？**

**是**，Ignite提供了丰富的键-值API，兼容于JCache (JSR-107)，并且支持Java，C++和.NET。

**固化内存是什么？**

Ignite的*固化内存*架构使得Ignite可以将内存计算延伸至磁盘，它基于一个页面化的堆外内存分配器，它通过预写日志（WAL）的持久化来对数据进行固化，当持久化禁用之后，固化内存就会变成一个纯粹的内存存储。

**并置处理是什么？**

Ignite是一个分布式系统，因此，有能力将数据和数据以及数据和计算进行并置就变得非常重要，这会避免分布式数据噪声。当执行分布式SQL关联时数据的并置就变得非常的重要。Ignite还支持将用户的逻辑（函数，lambda等）直接发到数据所在的节点然后在本地进行数据的运算。

## 1.3.入门
### 1.3.1.先决条件
Apache Ignite官方在如下环境中进行了测试：

 - JDK：Oracle JDK8及以上，Open JDK8及以上，IBM JDK8及以上；
 - OS：Windows (Vista及以上)，Windows Server (2008及以上)，Ubuntu (14.x和15.x)；
 - 网络：没有限制（建议10G）；
 - 硬件：没有限制；
 - C++编译器：MS Visual C++ (10.0及以上), g++ (4.4.0及以上)；
 - Visual Studio：2010及以上。

### 1.3.2.安装
以下是安装Ignite С++的概述：

- 从[官网](https://ignite.apache.org/)下载Ignite的压缩包；
- 在本机中将压缩包解压到安装文件夹。

**从源代码构建**

Ignite C++基于Ignite，因此首先需要构建Java代码，具体可以参见Ignite版本的[相关页面](/doc/java/#_1-3-入门)。

另外，如果要构建测试，还会需要[Boost](http://www.boost.org/)，在Windows中需要正确配置`BOOST_HOME`环境变量，如果不需要测试，可以排除测试的工程，或者不对它们进行编译。在Linux中可以使用`configure`脚本，具体可以调用`./configure --help`寻求帮助。

使用如下的命令可以构建C++的二进制包：

Windows：
```batch
cd modules\platforms\cpp\project\vs

msbuild ignite.sln /p:Configuration=Release /p:Platform=x64
```
Linux（系统范围）
```bash
cd modules/platforms/cpp
libtoolize && aclocal && autoheader && automake --add-missing && autoreconf

# You can call the following command to see all the available
# configuration options:
# ./configure --help
# To use default configuration just type:
./configure
make

#The following step is optional if you want to install Ignite
#for your system. It would probably require root:
sudo make install
```
Linux(本地目录)
```bash
cd modules/platforms/cpp
libtoolize && aclocal && autoheader && automake --add-missing && autoreconf

# You can call the following command to see all the available
# configuration options:
# ./configure --help
#
# Specify a target subdirectory in your user's home dir:
./configure --prefix=/home/user/odbc
make

#The following step is needed if you want to install Ignite
#under specified prefix directory.
make install
```
::: tip 如要构建整个工程，需要boost.test库
如果不打算运行测试，就不要构建整个工程，或者说，可以只构建需要的工程。在Windows上，可以通过单击解决方案资源管理器中感兴趣的工程并选择“构建”来实现这一点。在Linux上，可以使用`configure`脚本启用/禁用不同组件的构建。
:::
### 1.3.3.从命令行启动
一个Ignite节点可以从命令行启动，或者使用默认的配置，或者也可以传入一个配置文件。可以启动任意数量的节点，它们会自动地进行彼此发现。

::: warning 平台互操作性
如果要尝试部署一个同时包含Java和C++节点的集群，请注意看下面的[平台互操作性](#_1-5-平台互操作性)章节，确保做了和异构集群有关的额外配置。
:::
**使用默认的配置**

要用默认配置启动一个节点，打开终端，然后转到`IGNITE_HOME`文件夹（Ignite安装文件夹），使用上面的命令构建完成二进制包之后，只需要输入：

Windows：
```batch
modules\platforms\cpp\project\vs\x64\Release\ignite.exe
```
Linux：
```bash
./modules/platforms/cpp/ignite/ignite
```
输出大致如下：
```
[16:47:37] Ignite node started OK (id=ee97150d)
[16:47:37] Topology snapshot [ver=1, servers=1, clients=0, CPUs=2, heap=0.89GB]
```
`ignite.exe`默认会使用`config/default-config.xml`文件启动Ignite C++节点。

**传递配置文件**

如果要从命令行显式传递配置文件，需要在Ignite安装文件夹中输入`ignite.exe -springConfigUrl=<path to configuration file>`，比如：

Windows：
```batch
modules\platforms\cpp\project\vs\x64\Release\ignite.exe -springConfigUrl=c:\work\my-config.xml
```
Linux：
```bash
./modules/platforms/cpp/ignite/ignite -springConfigUrl=~/work/my-config.xml
```
### 1.3.4.第一个数据网格应用
下面是一些小例子，进行分布式缓存的put/get操作，还有就是执行基本的事务：

Put和Get：
```cpp
using namespace ignite;
using namespace cache;

IgniteConfiguration cfg;

// Start a node.
Ignite grid = Ignition::Start(cfg);

// Get cache instance.
Cache<int, std::string> cache = grid.GetOrCreateCache<int, std::string>("myCache");

// Store keys in cache (values will end up on different cache nodes).
for (int i = 0; i < 10; ++i)
{
    std::stringstream value;
    value << i;

    cache.Put(i, value.str());
}

for (int i = 0; i < 10; ++i)
  	std::cout << "Got [key=" << i << ", val=" << cache.Get(i) << "]";

```
原子操作：
```cpp
// Put-if-absent which returns previous value.
std::string oldVal = cache.GetAndPutIfAbsent(11, "Hello");

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
### 1.3.5.Ignite Visor管理控制台
检查数据网格的内容以及执行其它众多管理和监视操作的最简单方法是使用Ignite的Visor命令行工具。

Visor启动方法如下：
```batch
bin\ignitevisorcmd.bat
```

# 基本概念
## 1.Ignite是什么？

::: tip Ignite是：
一个支持水平扩展和容错的分布式内存计算平台，可以在TB级数据上以内存级的速度构建实时应用。
:::

![](https://files.readme.io/c686708-ignite_cluster.png)
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

Ignite在键-值API级别支持ACID事务，Ignite还支持*跨分区的事务*，这意味着事务可以跨越不同服务器不同分区。

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
Apache Ignite官方在如下环境中进行了测试：

 - JDK：Oracle JDK8及以上，Open JDK8及以上，IBM JDK8及以上；
 - OS：Linux（任何版本），Mac OS X（10.6及以上），Windows(XP及以上)，Windows Server（2008及以上），Oracle Solaris；
 - 网络：没有限制（建议10G甚至更快的网络带宽）；
 - 架构：x86，x64，SPARC，PowerPC

如果使用了JDK9或之后的版本，具体可以看下面的[在JDK9及以后版本中运行Ignite](#_3-10-在jdk11及以后的版本中运行)章节；

### 3.2.安装Apache Ignite
Ignite入门的最简单方式是使用每次版本发布生成的二进制压缩包：
 
 - 下载最新版本的[Ignite压缩包](https://ignite.apache.org/download.cgi#binaries)；
 - 将该包解压到操作系统的一个文件夹；
 - （可选）将`ignite-rest-http`文件夹从`{ignite}/libs/optional`移动到`{ignite}/libs`，这样开启Ignite的REST服务库后，就可以使用Ignite的Web控制台对集群进行管理和监控；
 - （可选）配置`IGNITE_HOME`环境变量指向Ignite的安装文件夹，路径不要以`/`（Windows为`\`）结尾，如果Ignite运行有问题，需要关注这个配置项；

<Tabs>
<Tab name="以XML格式配置工作目录">
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="workDirectory" value="/path/to/work/directory"/>
    <!-- other properties -->
</bean>
```
</Tab>
<Tab name="以编程方式配置工作目录">

```java
IgniteConfiguration igniteCfg = new IgniteConfiguration();
igniteCfg.setWorkDirectory("/path/to/work/directory");
```
</Tab>
</Tabs>

### 3.3.启动Ignite集群
可以从命令行启动Ignite集群，或者使用默认的配置，或者传入一个自定义配置文件，可以同时启动任意多个节点，他们都会自动地相互发现。

在命令行中转到Ignite安装文件夹的`bin`目录：

<Tabs>
<Tab name="Unix">
```shell
cd {ignite}/bin/
```
</Tab>
<Tab name="Windows">

```batch
cd {ignite}\bin\
```
</Tab>
</Tabs>

向下面这样，将一个自定义配置文件作为参数传递给`ignite.sh|bat`，然后启动一个节点：

<Tabs>
<Tab name="Unix">
```shell
./ignite.sh ../examples/config/example-ignite.xml
```
</Tab>
<Tab name="Windows">

```batch
ignite.bat ..\examples\config\example-ignite.xml
```
</Tab>
</Tabs>

输出大致如下：
```
[08:53:45] Ignite node started OK (id=7b30bc8e)
[08:53:45] Topology snapshot [ver=1, locNode=7b30bc8e, servers=1, clients=0, state=ACTIVE, CPUs=4, offheap=1.6GB, heap=2.0GB]
```
再次开启一个终端然后执行和前述同样的命令，这样会往集群中添加一个节点，这时再次看下输出，注意包含`Topology snapshot`的行，就会发现集群中有了2个服务端节点，同时集群中可用的CPU和内存也会更多：
```
[08:54:34] Ignite node started OK (id=3a30b7a4)
[08:54:34] Topology snapshot [ver=2, locNode=3a30b7a4, servers=2, clients=0, state=ACTIVE, CPUs=4, offheap=3.2GB, heap=4.0GB]
```
::: tip 默认配置
`ignite.sh|bat`默认会使用`config/default-config.xml`这个配置文件启动节点。
:::
好了，这样就启动了第一个Ignite集群。
### 3.4.创建第一个应用
集群启动之后，就可以为Ignite创建一个`HelloWorld`示例，首先需要使用Maven向Java应用中添加必要的Ignite构件。
### 3.5.创建Maven工程
使用喜欢的IDE创建一个新的Maven工程，然后将下面的依赖加入工程的`pom.xml`中：
```xml
<properties>
    <ignite.version>2.8.0</ignite.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.apache.ignite</groupId>
        <artifactId>ignite-core</artifactId>
        <version>${ignite.version}</version>
    </dependency>
    <dependency>
        <groupId>org.apache.ignite</groupId>
        <artifactId>ignite-spring</artifactId>
        <version>${ignite.version}</version>
    </dependency>
</dependencies>
```
::: tip 修改Ignite的版本以及开启其他的模块
将`ignite.version`替换为实际使用的Ignite版本。
如果需要，将其他的Ignite构件加入依赖，比如可以导入`ignite-indexing`模块以开启Ignite的SQL API，加入`ignite-ml`可以引入Ignite的机器学习库。
:::
### 3.6.添加IgniteHelloWorld
下面这个`IgniteHelloWord.java`文件，会在所有已启动的服务端节点上输出`Hello World`以及其他的一些环境信息，该示例会显示如何使用Java API配置集群，如何创建缓存，如何加载数据并在服务端以MapReduce模式执行Java任务：
```java
public class IgniteHelloWorld {
    public static void main(String[] args) throws IgniteException {
        // Preparing IgniteConfiguration using Java APIs
        IgniteConfiguration cfg = new IgniteConfiguration();

        // The node will be started as a client node.
        cfg.setClientMode(true);

        // Classes of custom Java logic will be transferred over the wire from this app.
        cfg.setPeerClassLoadingEnabled(true);

        // Setting up an IP Finder to ensure the client can locate the servers.
        TcpDiscoveryMulticastIpFinder ipFinder = new TcpDiscoveryMulticastIpFinder();
        ipFinder.setAddresses(Collections.singletonList("127.0.0.1:47500..47509"));
        cfg.setDiscoverySpi(new TcpDiscoverySpi().setIpFinder(ipFinder));

        // Starting the node
        Ignite ignite = Ignition.start(cfg);

        // Create an IgniteCache and put some values in it.
        IgniteCache<Integer, String> cache = ignite.getOrCreateCache("myCache");
        cache.put(1, "Hello");
        cache.put(2, "World!");

        System.out.println(">> Created the cache and add the values.");

        // Executing custom Java compute task on server nodes.
        ignite.compute(ignite.cluster().forServers()).broadcast(new RemoteTask());

        System.out.println(">> Compute task is executed, check for output on the server nodes.");

        // Disconnect from the cluster.
        ignite.close();
    }

    /**
     * A compute tasks that prints out a node ID and some details about its OS and JRE.
     * Plus, the code shows how to access data stored in a cache from the compute task.
     */
    private static class RemoteTask implements IgniteRunnable {
        @IgniteInstanceResource
        Ignite ignite;

        @Override public void run() {
            System.out.println(">> Executing the compute task");

            System.out.println(
                "   Node ID: " + ignite.cluster().localNode().id() + "\n" +
                "   OS: " + System.getProperty("os.name") +
                "   JRE: " + System.getProperty("java.runtime.name"));

            IgniteCache<Integer, String> cache = ignite.cache("myCache");

            System.out.println(">> " + cache.get(1) + " " + cache.get(2));
        }
    }
}
```
不要忘了添加`import`语句，然后如果IDE和Maven解决了所有的依赖，就可以了。

如果IDE仍然使用早于1.8版本的Java编译器，那么还需要将下面的配置项加入`pom.xml`文件：
```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <configuration>
                <source>1.8</source>
                <target>1.8</target>
            </configuration>
        </plugin>
    </plugins>
</build>
```
### 3.7.运行该应用
编译并运行`IgniteHelloWorld.java`，然后就会在服务端节点上看到`Hello World!`以及其他的一些环境信息输出。

这样第一个Ignite应用就建完了，它会接入并使用本地集群的资源。
### 3.8.集群的管理和监控
监控集群状态以及控制其行为的最简单的方式是使用像[Web控制台](https://ignite.apache.org/features/manageandmonitor.html)或者[Visor命令行](/doc/2.6.0/tools/VisorManagementConsole.md)这样的Ignite工具。

### 3.9.进一步编程的示例
通过学习技术文档以及运行二进制包附带的示例代码，可以进一步学习Ignite，该示例文件夹位于`{ignite}\examples`目录下。

::: tip 提示
如果更方便，这些示例代码可以Ignite的Github代码库的如下[位置](https://github.com/apache/ignite/tree/master/examples)中找到。
:::

### 3.10.在Java11及以后的版本中使用Ignite
要在Java11及以后的版本中执行Ignite：

 1. 配置`JAVA_HOME`环境变量或者Windows的`PATH`，指向Java的安装目录；
 2. Ignite使用了专有的SDK API，这些API默认并未开启，因此需要向JVM传递额外的专有标志来让这些API可用。如果使用的是`ignite.sh`或者`ignite.bat`，那么什么都不需要做，因为脚本已经提前配置好了。否则就需要向应用的JVM添加下面的参数；
 3. TLSv1.3，Java11中已经可以使用，目前还不支持，如果节点间使用了SSL，可以考虑添加`-Djdk.tls.client.protocols=TLSv1.2`；
 4. 给Java应用添加下面的VM选项，如果使用的是Java瘦客户端或者JDBC，则不需要。
 
```properties
--add-exports=java.base/jdk.internal.misc=ALL-UNNAMED
--add-exports=java.base/sun.nio.ch=ALL-UNNAMED
--add-exports=java.management/com.sun.jmx.mbeanserver=ALL-UNNAMED
--add-exports=jdk.internal.jvmstat/sun.jvmstat.monitor=ALL-UNNAMED
--add-exports=java.base/sun.reflect.generics.reflectiveObjects=ALL-UNNAMED
--illegal-access=permit
```
## 4.Ignite生命周期
### 4.1.概述
Ignite是基于JVM的，一个JVM可以运行一个或者多个逻辑Ignite节点（大多数情况下，一个JVM仅运行一个Ignite节点）。在整个Ignite文档中，会交替地使用术语Ignite运行时以及Ignite节点，比如说可以该主机运行5个节点，技术上通常意味着主机上启动5个JVM，每个JVM运行一个节点，Ignite也支持一个JVM运行多个节点，事实上，通常作为Ignite内部测试用。

::: tip 提示
Ignite运行时 == JVM进程 == Ignite节点（多数情况下）
:::

### 4.2.Ignition类
`Ignition`类在网络中启动各个Ignite节点，注意一台物理服务器（网络中的一台计算机）可以运行多个Ignite节点。
下面的代码是在全默认配置下在本地启动网格节点；
```java
Ignite ignite = Ignition.start();
```
或者传入一个配置文件：
```java
Ignite ignite = Ignition.start("examples/config/example-cache.xml");
```
配置文件的路径既可以是绝对路径，也可以是相对于IGNITE_HOME的相对路径，也可以是相对于类路径的META-INF文件夹。

### 4.3.LifecycleBean
有时可能希望在Ignite节点启动和停止的之前和之后执行特定的操作，这个可以通过实现`LifecycleBean`接口实现，然后在Spring的配置文件中通过指定`IgniteConfiguration`的`lifecycleBeans`属性实现。
```xml
<bean class="org.apache.ignite.IgniteConfiguration">
    ...
    <property name="lifecycleBeans">
        <list>
            <bean class="com.mycompany.MyLifecycleBean"/>
        </list>
    </property>
    ...
</bean>
```
`LifecycleBean`也可以像下面这样通过编程的方式实现：
```java
// Create new configuration.
IgniteConfiguration cfg = new IgniteConfiguration();

// Provide lifecycle bean to configuration.
cfg.setLifecycleBeans(new MyLifecycleBean());

// Start Ignite node with given configuration.
Ignite ignite = Ignition.start(cfg)
```
一个`LifecycleBean`的实现可能如下所示：
```java
public class MyLifecycleBean implements LifecycleBean {
    @Override public void onLifecycleEvent(LifecycleEventType evt) {
        if (evt == LifecycleEventType.BEFORE_NODE_START) {
            // Do something.
            ...
        }
    }
}
```
也可以将Ignite实例以及其它有用的资源注入`LifecycleBean`实现，查看[资源注入](#_6-资源注入)章节可以了解更多的信息。

### 4.4.生命周期事件类型
当前支持如下生命周期事件类型：

 - `BEFORE_NODE_START`：Ignite节点的启动程序初始化之前调用
 - `AFTER_NODE_START`：Ignite节点启动之后调用
 - `BEFORE_NODE_STOP`：Ignite节点的停止程序初始化之前调用
 - `AFTER_NODE_STOP`：Ignite节点停止之后调用

## 5.异步支持
### 5.1.概述
Ignite的多数API即可以支持同步模式，也可以支持异步模式，异步方法需要有一个`Async`后缀。
```java
// Synchronous get
V get(K key);

// Asynchronous get
IgniteFuture<V> getAsync(K key);
```
异步操作返回的是一个`IgniteFuture`或其子类的实例，通过如下方式可以获得异步操作的结果，或者调用阻塞的`IgniteFuture.get()`方法，或者通过`IgniteFuture.listen()`方法或者`IgniteFuture.chain()`方法注册一个闭包，然后等待当操作完成后调用闭包。
### 5.2.支持的接口
下面列出的接口可以用于同步或者异步模式：

 - `IgniteCompute`
 - `IgniteCache`
 - `Transaction`
 - `IgniteServices`
 - `IgniteMessaging`
 - `IgniteEvents`

### 5.3.监听器和Future链
要在非阻塞模式下等待异步操作的结果（`IgniteFuture.get()`），可以使用`IgniteFuture.listen()`方法或者`IgniteFuture.chain()`方法注册一个闭包，当操作完成后，闭包会被调用，比如：
```java
IgniteCompute compute = ignite.compute();

// Execute a closure asynchronously.
IgniteFuture<String> fut = compute.callAsync(() -> {
    return "Hello World";
});

// Listen for completion and print out the result.
fut.listen(f -> System.out.println("Job result: " + f.get()));
```
::: warning 闭包执行和线程池
异步操作完成后，如果通过`IgniteFuture.listen()`或者`IgniteFuture.chain()`方法传递了闭包，那么闭包就会被调用线程以同步的方式执行，否则，闭包就会随着操作的完成异步地执行。
根据操作的类型，闭包可能被系统线程池中的线程调用（异步缓存操作），或者被公共线程池中的线程调用（异步计算操作）。因此需要避免在闭包实现中调用同步的缓存和计算操作，否则可能导致死锁。
要实现Ignite计算操作异步嵌套执行，可以使用自定义线程池，相关内容可以查看[自定义线程池](#_7-8-自定义线程池)中的相关内容。
:::
## 6.资源注入
### 6.1.概述
Ignite中，预定义的资源都是可以进行依赖注入的，同时支持基于属性和基于方法的注入。任何加注正确注解的资源都会在初始化之前注入相对应的任务、作业、闭包或者SPI。
### 6.2.基于属性和基于方法
可以通过在一个属性或者方法上加注注解来注入资源。当加注在属性上时，Ignite只是在注入阶段简单地设置属性的值（不会理会该属性的访问修饰符）。如果在一个方法上加注了资源注解，它会访问一个与注入资源相对应的输入参数的类型，如果匹配，那么在注入阶段，就会将适当的资源作为输入参数，然后调用该方法。

<Tabs>
<Tab name="基于属性">

```java
Ignite ignite = Ignition.ignite();

Collection<String> res = ignite.compute().broadcast(new IgniteCallable<String>() {
  // Inject Ignite instance.
  @IgniteInstanceResource
  private Ignite ignite;

  @Override
  public String call() throws Exception {
    IgniteCache<Object, Object> cache = ignite.getOrCreateCache(CACHE_NAME);

    // Do some stuff with cache.
     ...
  }
});
```
</Tab>
<Tab name="基于方法">

```java
public class MyClusterJob implements ComputeJob {
    ...
    private Ignite ignite;
    ...
    // Inject Ignite instance.
    @IgniteInstanceResource
    public void setIgnite(Ignite ignite) {
        this.ignite = ignite;
    }
    ...
}
```
</Tab>
</Tabs>
### 6.3.预定义的资源
有很多的预定义资源可供注入：

|资源|描述|
|---|---|
|`CacheNameResource`|由`CacheConfiguration.getName()`提供，注入网格缓存名|
|`CacheStoreSessionResource`|注入当前的`CacheStoreSession`实例|
|`IgniteInstanceResource`|注入当前的Ignite实例|
|`JobContextResource`|注入`ComputeJobContext`的实例。作业的上下文持有关于一个作业执行的有用的信息。比如，可以获得包含与作业并置的条目的缓存的名字。|
|`LoadBalancerResource`|注入`ComputeLoadBalancer`的实例，注入后可以用于任务的负载平衡。|
|`LoggerResource`|注入`IgniteLogger`的实例，它可以用于向本地节点的日志写消息。|
|`ServiceResource`|通过指定服务名注入Ignite的服务。|
|`SpringApplicationContextResource`|注入Spring的`ApplicationContext`资源。|
|`SpringResource`|从Spring的`ApplicationContext`注入资源，当希望访问在Spring的ApplicationContext XML配置中指定的一个Bean时，可以用它。|
|`TaskContinuousMapperResource`|注入一个`ComputeTaskContinuousMapper`的实例，持续映射可以在任何时点从任务中发布作业，即使过了*map*的初始化阶段。|
|`TaskSessionResource`|注入`ComputeTaskSession`资源的实例，它为一个特定的任务执行定义了一个分布式的会话。|

## 7.线程池
### 7.1.概述
Ignite创建并且维护着一组线程池，根据使用的API不同分别用于不同的目的。本章节中会列出一些众所周知的内部线程池，然后会展示如何自定义线程池。在`IgniteConfiguration`的javadoc中，可以看到Ignite中可用的完整线程池列表。
### 7.2.系统线程池
系统线程池处理所有与缓存相关的操作，除了SQL以及其它的查询类型，它们会使用查询线程池，同时这个线程池也负责处理Ignite计算任务的取消操作。

默认的线程池数量为`max(8,CPU总核数)`，使用`IgniteConfiguration.setSystemThreadPoolSize(...)`可以进行调整。
### 7.3.公共线程池
公共线程池负责Ignite的计算网格，所有的计算任务都由这个线程池接收然后处理。

默认的线程池数量为`max(8,CPU总核数)`，使用`IgniteConfiguration.setPublicThreadPoolSize(...)`可以进行调整。
### 7.4.查询线程池
查询线程池处理集群内所有的SQL、扫描和SPI查询。

默认的线程池数量为`max(8,CPU总核数)`，使用`IgniteConfiguration.setQueryThreadPoolSize(...)`可以进行调整。
### 7.5.服务线程池
Ignite的服务网格调用使用的是服务线程池，Ignite的服务和计算网格组件都有专用的线程池，可以避免当一个服务实现希望调用一个计算（或者反之）时的线程争用和死锁。

默认的线程池数量为`max(8,CPU总核数)`，使用`IgniteConfiguration.setServiceThreadPoolSize(...)`可以进行调整。
### 7.6.平行线程池
平行线程池通过将操作展开为多个平行的执行，有助于显著加速基本的缓存操作以及事务，因为可以避免相互竞争。

默认的线程池数量为`max(8,CPU总核数)`，使用`IgniteConfiguration.setStripedPoolSize(...)`可以进行调整。
### 7.7.数据流处理器线程池
数据流处理器线程池用于处理来自`IgniteDataStreamer`的所有消息和请求，各种内置的使用`IgniteDataStreamer`的流适配器也可以。

默认的线程池数量为`max(8,CPU总核数)`，使用`IgniteConfiguration.setDataStreamerThreadPoolSize(...)`可以进行调整。
### 7.8.自定义线程池
对于Ignite的计算任务，也可以配置自定义的线程池，当希望同步地从一个计算任务调用另一个的时候很有用，因为可以避免死锁。要保证这一点，需要确保执行嵌套任务的线程池不同于上级任务的线程池。

自定义线程池需要在`IgniteConfiguration`中进行定义，并且需要有一个唯一的名字：

<Tabs>
<Tab name="XML">
```xml
<bean id="grid.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
  ...
  <property name="executorConfiguration">
    <list>
      <bean class="org.apache.ignite.configuration.ExecutorConfiguration">
        <property name="name" value="myPool"/>
        <property name="size" value="16"/>
      </bean>
    </list>
  </property>
  ...
</bean>
```
</Tab>
<Tab name="Java">

```java
IgniteConfiguration cfg = ...;

cfg.setExecutorConfiguration(new ExecutorConfiguration("myPool").setSize(16));
```
</Tab>
</Tabs>

这样，假定下面的计算任务由上面定义的`myPool`线程池中的线程执行：
```java
public class InnerRunnable implements IgniteRunnable {
    @Override public void run() {
        System.out.println("Hello from inner runnable!");
    }
}
```
怎么做呢，需要使用`IgniteCompute.withExecutor()`，它会被上级任务的实现马上执行，像下面这样：
```java
public class OuterRunnable implements IgniteRunnable {
    @IgniteInstanceResource
    private Ignite ignite;

    @Override public void run() {
        // Synchronously execute InnerRunnable in custom executor.
        ignite.compute().withExecutor("myPool").run(new InnerRunnable());
    }
}
```
上级任务的执行可通过如下方式触发，对于这个场景，它会由公共线程池执行：
```java
ignite.compute().run(new OuterRunnable());
```
::: warning 未定义线程池
如果应用请求在自定义线程池执行计算任务，而该线程池在Ignite节点中未定义，那么一个特定的警告消息就会在节点的日志中输出，然后任务就会被公共线程池接管执行。
:::
## 8.二进制编组器
### 8.1.基本概念
从1.6版本开始，Ignite引入了一个在缓存中存储数据的新概念，名为`二进制对象`，这个新的序列化格式提供了若干个优势：

 - 它可以从一个对象的序列化形式中读取一个任意的属性，而不需要将该对象完整地反序列化，这个功能完全删除了将缓存的键和值类部署到服务端节点类路径的必要性；
 - 它可以为同一个类型的对象增加和删除属性，给定的服务端节点不需要有模型类的定义，这个功能允许动态改变对象的结构，甚至允许多个客户端持有类定义的不同版本，它们是共存的；
 - 它可以根据类型名构造一个新的对象，根本不需要类定义，因此允许动态类型创建；

二进制对象只可以用于使用默认的二进制编组器时（即没有在配置中显式地设置其它的编组器）

::: tip 限制
`BinaryObject`格式实现也带来了若干个限制：
 1. 在内部Ignite不会写属性以及类型的名字，但是使用一个小写的名字哈希来标示一个属性或者类型，这意味着属性或者类型不能有同样的名字哈希。即使序列化不会在哈希冲突的情况下工作，但Ignite在配置级别提供了一种方法来解决此冲突；
 2. 同样的原因，`BinaryObject`格式在类的不同层次上也不允许有同样的属性名；
 3. 如果类实现了`Externalizable`接口，Ignite会使用`OptimizedMarshaller`，`OptimizedMarshaller`会使用`writeExternal()`和`readExternal()`来进行类对象的序列化和反序列化，这需要将实现`Externalizable`的类加入服务端节点的类路径中。
:::

`IgniteBinary`入口，可以从Ignite的实例获得，包含了操作二进制对象的所有必要的方法。
::: tip 自动化哈希值计算和Equals实现
如果一个对象可以被序列化到二进制形式，那么Ignite会在序列化期间计算它的哈希值并且将其写入最终的二进制数组。另外，Ignite还为二进制对象的比较需求提供了equals方法的自定义实现。这意味着，不需要为在Ignite中使用的自定义键和值覆写`GetHashCode`和`Equals`方法，除非它们无法序列化成二进制形式。

比如，`Externalizable`类型的对象无法被序列化成二进制形式，这时就需要自行实现`hashCode`和`equals`方法，具体可以看上面的限制章节。
:::

### 8.2.配置二进制对象
在绝大多数情况下不需要额外地配置二进制对象。
但是，如果需要覆写默认的类型和属性ID计算或者加入`BinarySerializer`，可以为`IgniteConfiguration`定义一个`BinaryConfiguration`对象，这个对象除了为每个类型指定映射以及序列化器之外还可以指定一个全局的Name映射、一个全局ID映射以及一个全局的二进制序列化器。对于每个类型的配置，通配符也是支持的，这时提供的配置会适用于匹配类型名称模板的所有类型。
配置二进制类型：
```xml
<bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">

  <property name="binaryConfiguration">
    <bean class="org.apache.ignite.configuration.BinaryConfiguration">

      <property name="nameMapper" ref="globalNameMapper"/>
      <property name="idMapper" ref="globalIdMapper"/>

      <property name="typeConfigurations">
        <list>
          <bean class="org.apache.ignite.binary.BinaryTypeConfiguration">
            <property name="typeName" value="org.apache.ignite.examples.*"/>
            <property name="serializer" ref="exampleSerializer"/>
          </bean>
        </list>
      </property>
    </bean>
  </property>
...
```
### 8.3.BinaryObject缓存API
Ignite默认使用反序列化值作为最常见的使用场景，要启用`BinaryObject`处理，需要获得一个`IgniteCache`的实例然后使用`withKeepBinary()`方法。启用之后，如果可能，这个标志会确保从缓存返回的对象都是`BinaryObject`格式的。将值传递给`EntryProcessor`和`CacheInterceptor`也是同样的处理。

::: tip 平台类型
注意当通过`withKeepBinary()`方法启用`BinaryObject`处理时并不是所有的对象都会表示为`BinaryObject`，会有一系列的`平台`类型，包括基本类型、String、UUID、Date、Timestamp、BigDecimal、Collections、Maps和这些类型的数组，它们不会被表示为`BinaryObject`。

注意在下面的示例中，键类型为`Integer`，它是不会被修改，因为它是`平台`类型。
:::

获取BinaryObject：
```java
// Create a regular Person object and put it to the cache.
Person person = buildPerson(personId);
ignite.cache("myCache").put(personId, person);

// Get an instance of binary-enabled cache.
IgniteCache<Integer, BinaryObject> binaryCache = ignite.cache("myCache").withKeepBinary();

// Get the above person object in the BinaryObject format.
BinaryObject binaryPerson = binaryCache.get(personId);
```
### 8.4.使用BinaryObjectBuilder修改二进制对象
`BinaryObject`实例是不能修改的，要更新属性或者创建新的`BinaryObject`，必须使用`BinaryObjectBuilder`的实例。

`BinaryObjectBuilder`的实例可以通过`IgniteBinary`入口获得。它可以使用类型名创建，这时返回的对象不包含任何属性，或者它也可以通过一个已有的`BinaryObject`创建，这时返回的对象会包含从给定的`BinaryObject`中拷贝的所有属性。

获取`BinaryObjectBuilder`实例的另外一个方式是调用已有`BinaryObject`实例的`toBuilder()`方法，这种方式创建的对象也会从`BinaryObject`中拷贝所有的数据。

::: tip 限制

 - 无法修改已有字段的类型；
 - 无法变更枚举值的顺序，也无法在枚举值列表的开始或者中部添加新的常量，但是可以在列表的末尾添加新的常量。

:::

下面是一个使用`BinaryObject`API来处理服务端节点的数据而不需要将程序部署到服务端以及不需要实际的数据反序列化的示例：

EntryProcessor内的BinaryObject：
```java
// The EntryProcessor is to be executed for this key.
int key = 101;

cache.<Integer, BinaryObject>withKeepBinary().invoke(
  key, new CacheEntryProcessor<Integer, BinaryObject, Object>() {
  	public Object process(MutableEntry<Integer, BinaryObject> entry,
                          Object... objects) throws EntryProcessorException {
		    // Create builder from the old value.
        BinaryObjectBuilder bldr = entry.getValue().toBuilder();

        //Update the field in the builder.
        bldr.setField("name", "Ignite");

        // Set new value to the entry.
        entry.setValue(bldr.build());

        return null;
     }
  });
```
### 8.5.BinaryObject类型元数据
像上面描述的那样，二进制对象结构可以在运行时进行修改，因此获取一个存储在缓存中的一个特定类型的信息也可能是有用的，比如属性名、属性类型名，关联属性名，Ignite通过`BinaryType`接口满足这样的需求。

这个接口还引入了一个属性getter的更快的版本，叫做`BinaryField`。这个概念类似于Java的反射，可以缓存`BinaryField`实例中读取的属性的特定信息，它有助于从一个很大的二进制对象集合中读取同一个属性。
```java
Collection<BinaryObject> persons = getPersons();

BinaryField salary = null;

double total = 0;
int cnt = 0;

for (BinaryObject person : persons) {
    if (salary == null)
        salary = person.type().field("salary");

    total += salary.value(person);
    cnt++;
}

double avg = total / cnt;
```
### 8.6.BinaryObject和CacheStore
在缓存API上调用`withKeepBinary()`方法对于将用户对象传入`CacheStore`的方式不起作用，这么做是故意的，因为大多数情况下单个`CacheStore`实现要么使用反序列化类，要么使用`BinaryObject`表示。要控制对象传入Store的方式，需要使用`CacheConfiguration`的`storeKeepBinary`标志，当该标志设置为`false`时，会将反序列化值传入Store，否则会使用`BinaryObject`表示。

下面是一个使用`BinaryObject`的Store的伪代码实现的示例：
```java
public class CacheExampleBinaryStore extends CacheStoreAdapter<Integer, BinaryObject> {
    @IgniteInstanceResource
    private Ignite ignite;

    /** {@inheritDoc} */
    @Override public BinaryObject load(Integer key) {
        IgniteBinary binary = ignite.binary();

        List<?> rs = loadRow(key);

        BinaryObjectBuilder bldr = binary.builder("Person");

        for (int i = 0; i < rs.size(); i++)
            bldr.setField(name(i), rs.get(i));

        return bldr.build();
    }

    /** {@inheritDoc} */
    @Override public void write(Cache.Entry<? extends Integer, ? extends BinaryObject> entry) {
        BinaryObject obj = entry.getValue();

        BinaryType type = obj.type();

        Collection<String> fields = type.fieldNames();

        List<Object> row = new ArrayList<>(fields.size());

        for (String fieldName : fields)
            row.add(obj.field(fieldName));

        saveRow(entry.getKey(), row);
    }
}
```
### 8.7.二进制Name映射器和二进制ID映射器
在内部，Ignite不会写属性或者类型名字的完整字符串，而是为了性能，为类型和属性名写一个整型哈希值。经过测试，在类型相同时，属性名或者类型名的哈希值冲突实际上是不存在的，为了性能使用哈希值是安全的。对于当不同的类型或者属性确实冲突的场合，`BinaryNameMapper`和`BinaryIdMapper`可以为该类型或者属性名覆写自动生成的哈希值。

`BinaryNameMapper`：映射类型/类和属性名到不同的名字；

`BinaryIdMapper`：映射从`BinaryNameMapper`来的类型和属性名到ID，以便于Ignite内部使用。

Ignite直接支持如下的映射器实现：

 - `BinaryBasicNameMapper`：`BinaryNameMapper`的一个基本实现，对于一个给定的类，根据使用的`setSimpleName(boolean useSimpleName)`属性值，会返回一个完整或者简单的名字；
 - `BinaryBasicIdMapper`：`BinaryIdMapper`的一个基本实现，它有一个`lowerCase`配置属性，如果属性设置为`false`，那么会返回一个给定类型或者属性名的哈希值，如果设置为`true`，会返回一个给定类型或者属性名的小写形式的哈希值。

如果仅仅使用Java或者.NET客户端并且在`BinaryConfiguration`中没有指定映射器，那么Ignite会使用`BinaryBasicNameMapper`并且`simpleName`属性会被设置为`false`，使用`BinaryBasicIdMapper`并且`lowerCase`属性会被设置为`true`。

如果使用了C++客户端并且在`BinaryConfiguration`中没有指定映射器，那么Ignite会使用`BinaryBasicNameMapper`并且`simpleName`属性会被设置为`true`，使用`BinaryBasicIdMapper`并且`lowerCase`属性会被设置为`true`。

如果使用Java、.Net或者C++，默认是不需要任何配置的，只有当需要平台协同、名字转换复杂的情况下，才需要配置映射器。
## 9.日志
Ignite支持各种日志库和框架，可以直接使用[Log4j](https://logging.apache.org/log4j/2.x/)、[Log4j2](https://logging.apache.org/log4j/2.x/)、[JCL](https://commons.apache.org/proper/commons-logging/guide.html)和[SLF4J](https://www.slf4j.org/manual.html)，本文会描述如何使用它们。
### 9.1.通用配置
Ignite节点启动之后，会在控制台中输出启动信息，包括了配置的日志库信息。每个日志库都有自己的配置参数，需要分别进行配置。除了库特有的配置，还有一些系统属性可以对日志进行调整，如下表所示：

|系统属性|描述|默认值|
|---|---|---|
|`IGNITE_LOG_INSTANCE_NAME`|如果该属性存在，Ignite会在日志消息中包含实例名|未配置|
|`IGNITE_QUIET`|配置为`false`可以禁用静默模式，启用详细模式，其会输出更多的信息|true|
|`IGNITE_LOG_DIR`|该属性会指定Ignite日志的输出目录|$IGNITE_HOME/work/log|
|`IGNITE_DUMP_THREADS_ON_FAILURE`|如果配置为`true`，在捕获严重错误时会在日志中输出线程堆栈信息|true|

### 9.2.默认日志
Ignite默认会使用`java.util.logging.Logger`（JUL），通过`$IGNITE_HOME/config/java.util.logging.properties`配置文件进行配置，然后将日志写入`$IGNITE_HOME/work/log`文件夹，要修改这个日志目录，需要使用`IGNITE_LOG_DIR`环境变量。

另外，Ignite启动于*静默*模式，会阻止`INFO`和`DEBUG`日志的输出。要关闭*静默*模式，可以使用`-DIGNITE_QUIET=false`系统属性。注意*静默*模式的所有信息都是输出到标准输出（STDOUT）的。
::: warning 默认日志目录
如果是在Java应用内启动Ignite，日志目录为`$IGNITE_HOME/work`，默认为`/tmp/ignite/work/log/`，不过要注意将日志目录配置为一个更可靠的位置。
:::
::: warning 如果使用jul-to-slf4j桥，要确保配置正确
如果使用了`jul-to-slf4j`桥，需要特别关注下Ignite中的JUL日志级别。如果在`org.apache`上配置了`DEBUG`级别，那么最终的日志级别会为`INFO`。这意味着在生成日志时会产生十倍的负载，然后在通过桥时被丢弃。JUL默认级别为`INFO`，在`org.apache.ignite.logger.java.JavaLogger#isDebugEnabled`中设置一个断点，会显示JUL子系统是否在生成调试级别日志。
:::
::: tip 注意
通过[LoggingMXBean](https://docs.oracle.com/javase/8/docs/api/java/util/logging/LoggingMXBean.html)，可以在运行时对默认的日志记录器进行重新配置。
:::
基本日志配置：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

  <!-- uncomment the following section to set, e.g., log4j as the logging library to be used-->
  <!--property name="gridLogger">
    <bean class="org.apache.ignite.logger.log4j.Log4JLogger">
      <constructor-arg type="java.lang.String" value="log4j.xml"/>
    </bean>
  </property-->

   <!-- how frequently Ignite will output basic node metrics into the log-->
  <property name="metricsLogFrequency" value="#{60 * 10 * 1000}"/>

</bean>
```
### 9.3.Log4j
如果在启动独立集群节点时要使用Log4j模块，需要在执行`ignite.{sh|bat}`脚本前，将`optional/ignite-log4j`文件夹移动到Ignite二进制包的`lib`目录下，这时这个模块目录中的内容会被添加到类路径。

如果项目中使用maven进行依赖管理，那么需要添加如下的依赖：
```xml
<dependency>
  <groupId>org.apache.ignite</groupId>
  <artifactId>ignite-log4j</artifactId>
  <version>${ignite.version}</version>
</dependency>
```
将`${ignite.version}`替换为实际使用的Ignite版本。

要使用Log4j进行日志记录，需要配置`IgniteConfiguration`的`gridLogger`属性，如下所示：

<Tabs>
<Tab name="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="gridLogger">
    <bean class="org.apache.ignite.logger.log4j.Log4JLogger">
      <constructor-arg type="java.lang.String" value="log4j.xml"/>
    </bean>
  </property>
  <!-- Other Ignite configurations -->
  ...
</bean>
```
</Tab>
<Tab name="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

IgniteLogger log = new Log4JLogger("log4j.xml");

cfg.setGridLogger(log);

// Start Ignite node.
Ignite ignite = Ignition.start(cfg);

ignite.log().info("Info Message Logged!");
```
</Tab>
</Tabs>

在上面的配置中，`log4j.xml`的路径要么是绝对路径，要么是相对路径，相对路径可以相对于`META-INF`，也可以相对于`IGNITE_HOME`。
::: tip 注意
Log4j支持运行时配置，即配置文件的修改无需应用重启即可生效。
:::

### 9.4.Log4j2
如果在启动独立集群节点时要使用Log4j2模块，需要在执行`ignite.{sh|bat}`脚本前，将`optional/ignite-log4j2`文件夹移动到Ignite二进制包的`lib`目录下，这时这个模块目录中的内容会被添加到类路径。

如果项目中使用maven进行依赖管理，那么需要添加如下的依赖：
```xml
<dependency>
  <groupId>org.apache.ignite</groupId>
  <artifactId>ignite-log4j2</artifactId>
  <version>${ignite.version}</version>
</dependency>
```
将`${ignite.version}`替换为实际使用的Ignite版本。

要使用Log4j2进行日志记录，需要配置`IgniteConfiguration`的`gridLogger`属性，如下所示：

<Tabs>
<Tab name="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="gridLogger">
    <bean class="org.apache.ignite.logger.log4j2.Log4J2Logger">
      <constructor-arg type="java.lang.String" value="log4j2.xml"/>
    </bean>
  </property>
  <!-- Other Ignite configurations -->
  ...
</bean>
```
</Tab>
<Tab name="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

IgniteLogger log = new Log4J2Logger("log4j2.xml");

cfg.setGridLogger(log);

// Start Ignite node.
Ignite ignite = Ignition.start(cfg);

ignite.log().info("Info Message Logged!");
```
</Tab>
</Tabs>

在上面的配置中，`log4j2.xml`的路径要么是绝对路径，要么是相对路径，相对路径可以相对于`META-INF`，也可以相对于`IGNITE_HOME`。
::: tip 注意
Log4j2支持运行时配置，即配置文件的修改无需应用重启即可生效。
:::
### 9.5.JCL
如果在启动独立集群节点时要使用JCL模块，需要在执行`ignite.{sh|bat}`脚本前，将`optional/ignite-jcl`文件夹移动到Ignite二进制包的`lib`目录下，这时这个模块目录中的内容会被添加到类路径。

如果项目中使用maven进行依赖管理，那么需要添加如下的依赖：
```xml
<dependency>
  <groupId>org.apache.ignite</groupId>
  <artifactId>ignite-jcl</artifactId>
  <version>${ignite.version}</version>
</dependency>
```
将`${ignite.version}`替换为实际使用的Ignite版本。

要使用JCL进行日志记录，需要配置`IgniteConfiguration`的`gridLogger`属性，如下所示：

<Tabs>
<Tab name="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="gridLogger">
    <bean class="org.apache.ignite.logger.jcl.JclLogger">
    </bean>
  </property>
  <!-- Other Ignite configurations -->
  ...
</bean>
```
</Tab>
<Tab name="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

IgniteLogger log = new JclLogger();

cfg.setGridLogger(log);

// Start Ignite node.
Ignite ignite = Ignition.start(cfg);

ignite.log().info("Info Message Logged!");
```
</Tab>
</Tabs>

::: tip 注意
注意JCL只是简单地将日志消息转发给底层的日志系统，这需要正确的配置，具体请参见[JCL官方文档](https://commons.apache.org/proper/commons-logging/guide.html#Configuration)。比如要使用Log4j，类路径中需要添加必要的库文件。
:::
### 9.6.SLF4J
如果在启动独立集群节点时要使用SLF4J模块，需要在执行`ignite.{sh|bat}`脚本前，将`optional/ignite-slf4j`文件夹移动到Ignite二进制包的`lib`目录下，这时这个模块目录中的内容会被添加到类路径。

如果项目中使用maven进行依赖管理，那么需要添加如下的依赖：
```xml
<dependency>
  <groupId>org.apache.ignite</groupId>
  <artifactId>ignite-slf4j</artifactId>
  <version>${ignite.version}</version>
</dependency>
```
将`${ignite.version}`替换为实际使用的Ignite版本。

要使用JCL进行日志记录，需要配置`IgniteConfiguration`的`gridLogger`属性，如下所示：

<Tabs>
<Tab name="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="gridLogger">
    <bean class="org.apache.ignite.logger.slf4j.Slf4jLogger"/>
  </property>

  <!-- Other Ignite configurations -->

</bean>
```
</Tab>
<Tab name="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

IgniteLogger log = new Slf4jLogger();

cfg.setGridLogger(log);

// Start Ignite node.
Ignite ignite = Ignition.start(cfg);

ignite.log().info("Info Message Logged!");
```
</Tab>
</Tabs>

要了解更多的信息，可以看[SLF4J手册](https://www.slf4j.org/docs.html)。
### 9.7.日志配置示例
下面的步骤可以引导开发者进行日志的配置，这可以覆盖大多数的场景。

 1. 使用Log4j或者Log4j2作为日志框架，具体可以看上面章节的介绍；
 2. 如果使用了默认的配置文件（`ignite-log4j.xml`或`ignite-log4j2.xml`），需要取消`CONSOLE`Appender的注释；
 3. 在日志配置文件中，指定日志文件的路径，默认值为`${IGNITE_HOME}/work/log/ignite.log`；
 4. Ignite以详细日志模式启动：
   - 如果使用的是`ignite.sh`，指定`-v`选项；
   - 如果通过Java代码启动，使用`IGNITE_QUIET=false`系统变量。

### 9.8.日志管理提示
日志在故障排除和查找错误方面起着重要作用。

以下是一些关于如何管理日志文件的一般提示：

 - 不要将日志文件存储在`/tmp`文件夹中，每次重启服务器时都会清除此文件夹；
 - 确保存储日志文件的磁盘上有足够的可用空间；
 - 定期存档旧日志文件以节省存储空间。

## 10.异常处理
下表描述了Ignite API支持的异常以及可以用来处理这些异常的操作。可以查看javadoc中的`throws`子句，查看是否存在已检查异常。

|异常|描述|要采取的动作|运行时异常|
|---|---|---|---|
|`IgniteException`|此异常表示网格中存在错误。|操作失败，从方法退出。|是|
|`IgniteClientDisconnectedException`|当客户端节点与集群断开连接时，Ignite API（缓存操作、计算API和数据结构操作）会抛出此异常。|在`Future`中等待并重试。|是|
|`IgniteAuthenticationException`|当节点身份验证失败或安全身份验证失败时，会抛出此异常。|操作失败，从方法退出。|否|
|`IgniteClientException`|缓存操作会抛出此异常。|根据异常消息确定下一步的动作。|是|
|`IgniteDeploymentException`|当Ignite API（计算网格相关）未能在节点上部署作业或任务时，会抛出此异常。|操作失败，从方法退出。|是|
|`IgniteInterruptedException`|此异常用于将标准[InterruptedException](https://docs.oracle.com/javase/8/docs/api/java/lang/InterruptedException.html)包装为`IgniteException`。|清除中断标志后重试。|是|
|`IgniteSpiException`|SPI引发的异常，如`CollisionSpi`、`LoadBalancingSpi`、<br>`TcpDiscoveryIpFinder`、`FailoverSpi`、`UriDeploymentSpi`等。|操作失败，从方法退出。|是|
|`IgniteSQLException`|SQL查询处理失败会抛出此异常，该异常会包含相关规范定义的[错误代码](https://static.javadoc.io/org.apache.ignite/ignite-core/2.5.0/org/apache/ignite/internal/processors/cache/query/IgniteQueryErrorCode.html)。|操作失败，从方法退出。|是|
|`IgniteAccessControlException`|认证/授权失败时会抛出此异常。|操作失败，从方法退出。|否|
|`IgniteCacheRestartingException`|如果缓存正在重启，Ignite的缓存API会抛出此异常。|在`Future`中等待并重试。|是|
|`IgniteFutureTimeoutException`|当`Future`的计算超时时，会抛出此异常。|要么增加超时限制要么方法退出。|是|
|`IgniteFutureCancelledException`|当`Future`的计算因为被取消而无法获得结果时，会抛出此异常。|可进行重试。|是|
|`IgniteIllegalStateException`|此异常表示Ignite实例对于请求的操作处于无效状态。|操作失败，从方法退出。|是|
|`IgniteNeedReconnectException`|此异常显示节点应尝试重新连接到集群。|可进行重试。|否|
|`IgniteDataIntegrityViolationException`|如果发现数据完整性冲突，会抛出此异常。|操作失败，从方法退出。|是|
|`IgniteOutOfMemoryException`|系统没有足够内存处理Ignite操作（缓存操作）时，会抛出此异常。|操作失败，从方法退出。|是|
|`IgniteTxOptimisticCheckedException`|当事务以乐观方式失败时，会抛出此异常。|可进行重试|否|
|`IgniteTxRollbackCheckedException`|当事务自动回滚时，会抛出此异常。|可进行重试。|否|
|`IgniteTxTimeoutCheckedException`|当事务超时时，会抛出此异常。|可进行重试。|否|
|`ClusterTopologyException`|当集群拓扑发生错误（比如节点故障）时会抛出此异常（针对计算和事件API）。|在`Future`中等待并重试。|是|

## 11.FAQ

**1.堆内和堆外内存存储有何不同？**

当处理很大的堆时，通过在Java主堆空间外部缓存数据，可以使缓存克服漫长的JVM垃圾收集（GC）导致的暂停，但是数据仍然在内存中。
[更多信息](https://apacheignite.readme.io/docs/off-heap-memory)

**2.Apache Ignite是一个键值存储么？**

Apache Ignite是一个具有计算能力的、有弹性的内存中的分布式对象存储。在其最简单的形式中，是的，Apache Ignite可以作为一个键/值存储（缓存），但是也暴露了更丰富的API来与数据交互，比如完整的ANSI99兼容的SQL查询、文本检索、事务等等。
[更多信息](https://apacheignite.readme.io/docs/jcache)

**3.Apache Ignite是否支持JSON文档？**

当前，Apache Ignite并不完整支持JSON文档，但是当前处于beta阶段的Node.js客户端会支持JSON文档。

**4.Apache Ignite是否可以用于Apache Hive？**

是，Apache Ignite的Hadoop加速器提供了一系列的组件，支持在任何的Hadoop发行版中执行内存中的Hadoop作业执行和文件系统操作，包括Apache Hive。
[在Ignite化的Hadoop中运行Apache Hive](https://apacheignite-fs.readme.io/docs/running-apache-hive-over-ignited-hadoop)

**5.在事务隔离的悲观模式中，是否锁定键的读和写？**

是的，主要的问题在于，在`悲观`模式中，访问是会获得锁，而在`乐观`模式中，锁是在提交阶段获得的。
[更多信息](https://apacheignite.readme.io/docs/transactions)

**6.是否可以用Hibernate访问Apache Ignite？**

是的，Apache Ignite可以用作Hibernate的二级缓存（或者L2缓存），它可以显著地提升应用的持久化层的速度。
[更多信息](https://apacheignite.readme.io/docs/hibernate-l2-cache)

**7.Apache Ignite是否支持JDBC？**

是的，Apache Ignite提供了JDBC驱动，可以在缓存中使用标准SQL查询和JDBC API获得分布式的数据。
[更多信息](https://apacheignite.readme.io/docs/jdbc-driver)

**8.Apache Ignite是否保证消息的顺序？**

是的，如果希望收到消息的顺序与发送消息的顺序一致，可以使用`sendOrdered(...)`方法。可以传递一个超时时间来指定一条消息在队列中的等待时间，它会等待本来应在其之前发送的消息。如果超时时间过期，所有的还没有到达该节点中一个给定主题的消息都会被忽略。
[更多信息](https://apacheignite.readme.io/docs/messaging)

**9.是否可以运行Java和.Net闭包？它是如何工作的？**

.Net节点可以同时执行Java和.Net闭包，而标准Java节点只能执行Java闭包。当启动ApacheIgnite.exe时，它会使用位于`IGNITE_HOME/platforms/dotnet/bin`的一个脚本在同一个进程下同时启动JVM和CLR，.Net闭包会被CLR处理执行。

**10.Java和.Net之间的转换成本是什么？**

仅有的最小可能的开销是一个额外的数组复制+JNI调用，在本地测试时这个开销可能降低性能，但在真正的分布式负载环境下可以忽略不计。

**11.闭包是如何传输的？**

每个闭包都是一个特定类的对象。当它要被发送时会序列化成二进制的形式，通过网络发送到一个远程节点然后在那里反序列化。该远程节点在类路径中应该有该闭包类，或者开启对等类加载以从发送端加载该类。

**12.SQL查询是否被负载平衡？**

SQL查询总是被广播到保存有要查询的数据的每个节点，例外就是本地SQL查询(query.setLocal(true))，它只是在一个本地节点执行，还有就是可以精确标识节点的部分查询。

**13.用户是否可以控制资源分配？即，是否可以限制用户A为50个节点，但是用户B可以在所有的100个节点上执行任务？**

多租户只在缓存中存在，它们可以在创建在一个节点的子集上（可以看`CacheConfiguration.setNodeFilter`）以及在每个缓存基础上安全地赋予权限。

**IGFS的未来如何？**

开发IGFS的初衷是将其做为Hadoop加速的解决方案。然而在实践中，IGFS提供了不一致的性能表现，它所提供的任何性能增加对于生产来说都微不足道，此外它的整合成本也比较高。要获得数量级的性能提升，基于内存的存储必须与应用使用的API紧密耦合，对于IGFS，存储是Ignite，而API是用Hive、Impala、Pig、MapReduce等分别开发的。

对于废弃Hadoop的场景以及实时分析来说，最好使用Ignite的标准配置：即打开Ignite的原生持久化，然后使用Ignite SQL、计算网格或ML处理Ignite中的数据，并使用Hadoop框架处理HDFS数据集。也可以考虑将Spark作为一个通用API，用于合并存储在两个数据集中的数据。

<RightPane/>
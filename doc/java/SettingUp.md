# Ignite配置入门
## 1.配置方式
本章节会介绍在Ignite集群中设定配置参数的不同方式。

::: tip .NET、Python、Node.js等其他语言的配置

 - .NET开发者：请参见[.NET配置](/doc/java/DotnetSpecific.md)相关章节的介绍；
 - Python、Node.js等其他语言开发者：请参见[瘦客户端](/doc/java/ThinClients.md)中相关章节的内容。

:::
### 1.1.概述
可以通过在启动节点时向Ignite提供[IgniteConfiguration](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/configuration/IgniteConfiguration.html)类的实例来指定自定义配置参数。使用编程方式或通过XML配置文件都可以，这两种方式是完全可以互换的。

XML配置文件是必须包含`IgniteConfiguration`bean的Spring Bean定义文件。从命令行启动节点时，可以将配置文件作为参数传递给`ignite.sh|bat`脚本，如下所示：
```shell
ignite.sh ignite-config.xml
```
如果未指定配置文件，会使用默认文件`{IGNITE_HOME}/config/default-config.xml`。
### 1.2.基于Spring的XML配置
要创建一个Spring XML格式的配置文件，需要定义一个`IgniteConfiguration`bean，然后配置不同于默认值的参数，关于如何使用基于XML模式的配置的更多信息，可以看官方的[Spring文档](https://docs.spring.io/spring/docs/4.2.x/spring-framework-reference/html/xsd-configuration.html)。

在下面的示例中，创建了`IgniteConfiguration`bean，配置了`workDirectory`属性，然后配置了一个[分区模式的缓存](/doc/java/DataModeling.md#_2-2-1-partitioned)。
```xml
<?xml version="1.0" encoding="UTF-8"?>

<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean class="org.apache.ignite.configuration.IgniteConfiguration">
        <property name="workDirectory" value="/path/to/work/directory"/>

        <property name="cacheConfiguration">
            <bean class="org.apache.ignite.configuration.CacheConfiguration">
                <!-- Set the cache name. -->
                <property name="name" value="myCache"/>
                <!-- Set the cache mode. -->
                <property name="cacheMode" value="PARTITIONED"/>
                <!-- Other cache parameters. -->
            </bean>
        </property>
    </bean>
</beans>
```
### 1.3.编程式配置
创建一个`IgniteConfiguration`类的实例，然后配置必要的参数，如下所示：

<Tabs>
<Tab title="Java">

```java
IgniteConfiguration igniteCfg = new IgniteConfiguration();
//setting a work directory
igniteCfg.setWorkDirectory("/path/to/work/directory");

//defining a partitioned cache
CacheConfiguration cacheCfg = new CacheConfiguration("myCache");
cacheCfg.setCacheMode(CacheMode.PARTITIONED);

igniteCfg.setCacheConfiguration(cacheCfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var igniteCfg = new IgniteConfiguration
{
    WorkDirectory = "/path/to/work/directory",
    CacheConfiguration = new[]
    {
        new CacheConfiguration
        {
            Name = "myCache",
            CacheMode = CacheMode.Partitioned
        }
    }
};
```
</Tab>

<Tab title="C++">

```cpp
IgniteConfiguration cfg;

cfg.igniteHome = "/path/to/work/directory";
```
</Tab>
</Tabs>

完整参数的列表，可以参见[IgniteConfiguration](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/configuration/IgniteConfiguration.html)的javadoc。

## 2.Ignite Java配置
::: tip .NET、Python、Node.js等其他语言的配置

 - .NET开发者：请参见[.NET配置](/doc/java/DotnetSpecific.md)相关章节的介绍；
 - Python、Node.js等其他语言开发者：请参见[瘦客户端](/doc/java/ThinClients.md)中相关章节的内容。

:::
### 2.1.环境要求
Apache Ignite官方在如下环境中进行了测试：

 - JDK：Oracle JDK8及以上，Open JDK8及以上，IBM JDK8及以上；
 - OS：Linux（任何版本），Mac OS X（10.6及以上），Windows(XP及以上)，Windows Server（2008及以上），Oracle Solaris；
 - 网络：没有限制（建议10G甚至更快的网络带宽）；
 - 架构：x86，x64，SPARC，PowerPC。

### 2.2.在Java11及以后的版本中使用Ignite
要在Java11及以后的版本中运行Ignite，需按照如下步骤操作：

1. 配置`JAVA_HOME`环境变量，指向Java的安装目录；
2. Ignite使用了专有的SDK API，这些API默认并未开启，因此需要向JVM传递额外的专有标志来让这些API可用。如果使用的是`ignite.sh`或者`ignite.bat`，那么什么都不需要做，因为脚本已经提前配置好了。否则就需要向应用的JVM添加下面的参数；
```properties
--add-exports=java.base/jdk.internal.misc=ALL-UNNAMED
--add-exports=java.base/sun.nio.ch=ALL-UNNAMED
--add-exports=java.management/com.sun.jmx.mbeanserver=ALL-UNNAMED
--add-exports=jdk.internal.jvmstat/sun.jvmstat.monitor=ALL-UNNAMED
--add-exports=java.base/sun.reflect.generics.reflectiveObjects=ALL-UNNAMED
--add-opens=jdk.management/com.sun.management.internal=ALL-UNNAMED
--illegal-access=permit
```
3. TLSv1.3，Java11中已经可以使用，目前还不支持，如果节点间使用了SSL，可以考虑添加`-Djdk.tls.client.protocols=TLSv1.2`。

### 2.3.使用二进制包

 - 下载最新版本的[Ignite压缩包](https://ignite.apache.org/download.cgi#binaries)；
 - 将该包解压到操作系统的一个文件夹；
 - （可选）配置`IGNITE_HOME`环境变量或者Windows的`PATH`指向Ignite的安装文件夹，路径不要以`/`（Windows为`\`）结尾。

### 2.4.使用Maven
使用Ignite的最简单的方式是将其加入项目的pom.xml文件。

```xml
<properties>
    <ignite.version>2.9.0</ignite.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.apache.ignite</groupId>
        <artifactId>ignite-core</artifactId>
        <version>${ignite.version}</version>
    </dependency>
</dependencies>
```
`ignite-core`模块包含了Ignite的核心功能，其他的功能都是由各种Ignite模块提供的。

下面两个是最常用的模块：

 - `ignite-spring`：支持[基于XML的配置](#_1-2-基于spring的xml配置)；
 - `ignite-indexing`：支持SQL索引。

```xml
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-spring</artifactId>
    <version>${ignite.version}</version>
</dependency>
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-indexing</artifactId>
    <version>${ignite.version}</version>
</dependency>
```
### 2.5.使用Docker
如果希望在Docker环境中运行Ignite，请参见[Docker部署](/doc/java/Installation.md#_2-使用docker安装)章节的内容。
### 2.6.配置工作目录
Ignite会使用一个工作目录来保存应用的数据（如果使用了[原生持久化](/doc/java/Persistence.md)功能）、索引文件、元数据信息、日志以及其他文件，默认的工作目录为：

 - `$IGNITE_HOME/work`：如果定义了`IGNITE_HOME`系统属性，如果使用二进制包的`bin/ignite.sh`脚本启动，就是这种情况；
 - `./ignite/work`：这个路径相对于应用启动时的目录。

修改默认的工作目录有几种方式：

 - 环境变量方式：

```shell
export IGNITE_WORK_DIR=/path/to/work/directory
```

 - 在节点的配置中：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="workDirectory" value="/path/to/work/directory"/>
    <!-- other properties -->
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration igniteCfg = new IgniteConfiguration();
igniteCfg.setWorkDirectory("/path/to/work/directory");
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    WorkDirectory = "/path/to/work/directory"
};
```
</Tab>

<Tab title="C++">

```cpp
IgniteConfiguration cfg;

cfg.igniteHome = "/path/to/work/directory";
```
</Tab>
</Tabs>

### 2.7.启用模块
Ignite包含了很多的模块，提供了各种各样的功能，开发者可以根据需要，一个个引入。

Ignite的二进制包里面包含了所有的模块，但是默认都是禁用的（除了`ignite-core`、`ignite-spring`、`ignite-indexing`模块），可选库位于二进制包的`lib/optional`文件夹，每个模块是一个单独的子目录。

根据使用Ignite的方式，可以使用下述方式之一启用模块：

 - 如果使用的是二进制包，那么可以在启动节点之前将`libs/optional/{module-dir}`移动到`libs`目录；
 - 将`libs/optional/{module-dir}`中的库文件加入应用的类路径；
 - 将一个模块添加到工程的依赖中：

```xml
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-log4j2</artifactId>
    <version>${ignite.version}</version>
</dependency>
```
下面的模块有LGPL依赖，因此无法部署在Maven中央仓库中：

 - `ignite-hibernate`；
 - `ignite-geospatial`；
 - `ignite-schedule`。

要使用这些模块，可以从源代码进行构建然后添加到工程中，比如要将`ignite-hibernate`模块安装到本地仓库，可以在Ignite的源代码包中执行下面的命令：
```shell
mvn clean install -DskipTests -Plgpl -pl modules/hibernate -am
```
下面的模块都是可用的：

|模块的构件|描述|
|---|---|
|`ignite-aop`|Ignite AOP模块通过添加`@Gridify`注解，可以将任何Java方法转换为分布式闭包。|
|`ignite-aws`|AWS S3上的集群发现，具体请参见[Amazon S3 IP探测器](/doc/java/Clustering.md#_4-2-amazon-s3-ip探测器)。|
|`ignite-cassandra-serializers`|该模块提供了在Cassandra中将对象保存为BLOB格式的附加序列化器，该模块可以和Ignite的Cassandra存储模块一起使用。|
|`ignite-cassandra-store`|该模块提供了一个基于Cassandra数据库的CacheStore实现。|
|`ignite-cloud`|该模块提供了TCP发现中IP探测器的Apache Jclouds实现。|
|`ignite-direct-io`|该模块提供了一个以`O_DIRECT`模式进行缓存分区读写的页面存储。|
|`ignite-gce`|该模块提供了TCP发现中IP探测器的Google Cloud Storage实现。|
|`ignite-indexing`|[SQL查询和索引](/doc/java/WorkingwithSQL.md#_3-定义索引)。|
|`ignite-jcl`|支持Jakarta Common Logging (JCL)框架。|
|`ignite-jta`|Ignite事务与JTA的集成。|
|`ignite-kafka`|Ignite的Kafka流处理器，提供了从Kafka到Ignite缓存的流式数据处理能力。|
|`ignite-kubernetes`|Ignite Kubernetes模块提供了一个基于TCP发现的IP探测器，其使用专用的Kubernetes服务来查找由Kubernetes容器化的Ignite配置组的IP地址。|
|`ignite-log4j`|支持log4j。|
|`ignite-log4j2`|支持log4j2。|
|`ignite-ml`|Ignite的机器学习模块，其提供了机器学习功能以及线性代数的相关数据结构和方法，包括堆内和堆外，密集和稀疏，本地和分布式实现。详细信息请参见[机器学习](/doc/java/MachineLearning.md)文档。|
|`ignite-osgi`|该模块提供了桥接组件，以使Ignite可以在OSGi容器（例如Apache Karaf）内无缝运行。|
|`ignite-osgi-karaf`|该模块包含功能特性库，以方便将Ignite安装到Apache Karaf容器中。|
|`ignite-rest-http`|该模块在节点内启动了一个基于Jetty的服务器，该服务器可用于在集群中使用基于HTTP的RESTful API执行任务和/或缓存命令。|
|`ignite-scalar`|该模块为基于Scala的DSL提供Ignite API的扩展和快捷方式。|
|`ignite-scalar_2.10`|Ignite支持Scalar2.10的模块。|
|`ignite-schedule`|该模块提供了在本地节点使用基于UNIX CRON表达式语法的作业调度能力。|
|`ignite-slf4j`|支持[SLF4J日志](/doc/java/ConfiguringLogging.md#_6-使用slf4j)框架。|
|`ignite-spark`|该模块提供了SparkRDD抽象的实现，可轻松访问Ignite缓存。|
|`ignite-spring-data`|提供了与Spring Data框架的集成。|
|`ignite-spring-data_2.0`|提供了与Spring Data框架2.0的集成。|
|`ignite-ssh`|该模块提供了通过SSH在远程主机上启动Ignite节点的功能。|
|`ignite-urideploy`|提供了从不同来源（例如文件系统、HTTP甚至电子邮件）部署任务的功能。|
|`ignite-visor-console`|开源的命令行管理和监控工具。|
|`ignite-web`|该模块允许基于Servlet和Servlet上下文监听器在任何Web容器内启动节点。此外该模块还提供了将Web会话缓存在Ignite缓存中的功能。|
|`ignite-zookeeper`|该模块提供了一个基于TCP发现的IP探测器，它会使用一个ZooKeeper目录来发现其他的Ignite节点。|

### 2.8.配置建议
以下是一些推荐的配置技巧，旨在使开发者更轻松地操作Ignite集群或使用Ignite开发应用。

**配置工作目录**

如果要使用二进制包或Maven，建议为Ignite设置工作目录。工作目录用于存储元数据信息、索引文件、应用程序数据（如果使用[原生持久化](/doc/java/Persistence.md)功能）、日志和其他文件。建议一定要设置工作目录。

**建议的日志配置**

日志在故障排除和查找错误方面起着重要作用，以下是有关如何管理日志文件的一些一般提示：

 - 以`verbose`模式启动Ignite；
   - 如果使用`ignite.sh`，请指定`-v`选项；
   - 如果从Java代码启动Ignite，请设置`IGNITE_QUIET=false`系统变量；

 - 不要将日志文件存储在`/tmp`文件夹中，每次重启服务器时都会清除此文件夹；
 - 确保在存储日志文件的磁盘上有足够的可用空间；
 - 定期归档旧的日志文件以节省存储空间。

## 3.配置日志
### 3.1.概述
Ignite支持各种常见的日志库和框架：

 - JUL (默认)；
 - Log4j；
 - Log4j2；
 - JCL；
 - SLF4J。

本章节会介绍如何使用它们。

Ignite节点启动之后，会在控制台中输出启动信息，包括了配置的日志库信息。每个日志库都有自己的配置参数，需要分别进行配置。除了库特有的配置，还有一些系统属性可以对日志进行调整，如下表所示：

|系统属性|描述|默认值|
|---|---|---|
|`IGNITE_LOG_INSTANCE_NAME`|如果该属性存在，Ignite会在日志消息中包含实例名|未配置|
|`IGNITE_QUIET`|配置为`false`可以禁用静默模式，启用详细模式，其会输出更多的信息|true|
|`IGNITE_LOG_DIR`|该属性会指定Ignite日志的输出目录|`$IGNITE_HOME/work/log`|
|`IGNITE_DUMP_THREADS_ON_FAILURE`|如果配置为`true`，在捕获严重错误时会在日志中输出线程堆栈信息|true|

### 3.2.默认日志
Ignite默认会使用`java.util.logging`（JUL框架），如果节点是通过二进制包的`ignite.sh|bat`脚本启动，Ignite会使用`$IGNITE_HOME/config/java.util.logging.properties`作为默认的配置文件，然后将日志写入`$IGNITE_HOME/work/log`文件夹中的日志文件，要修改这个日志目录，可以使用`IGNITE_LOG_DIR`系统属性。

如果将Ignite作为应用中的库文件引入，默认的日志配置只包括控制台日志处理器，级别为`INFO`，可以通过`java.util.logging.config.file`系统属性提供一个自定义的配置文件。
### 3.3.使用Log4j
::: tip 提示
在使用Log4j之前，需要先启用[ignite-log4j](/doc/java/SettingUp.md#_2-7-启用模块)模块。
:::
要使用Log4j进行日志记录，需要配置`IgniteConfiguration`的`gridLogger`属性，如下所示：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration" id="ignite.cfg">
    <property name="gridLogger">
        <bean class="org.apache.ignite.logger.log4j.Log4JLogger">
            <!-- log4j configuration file -->
            <constructor-arg type="java.lang.String" value="log4j-config.xml"/>
        </bean>
    </property>

    <!-- other properties -->

</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

IgniteLogger log = new Log4JLogger("log4j-config.xml");

cfg.setGridLogger(log);

// Start a node.
try (Ignite ignite = Ignition.start(cfg)) {
    ignite.log().info("Info Message Logged!");
}
```
</Tab>

<Tab title="C#/.NET">
.NET目前还不支持这个API，需要使用基于XML的配置。

</Tab>

<Tab title="C++">
C++目前还不支持这个API，需要使用基于XML的配置。

</Tab>
</Tabs>

在上面的配置中，`log4j-config.xml`的路径要么是绝对路径，要么是相对路径，可以相对于`META-INF`，也可以相对于`IGNITE_HOME`。在Ignite的二进制包中有一个log4j配置文件的示例（`$IGNITE_HOME/config/ignite-log4j.xml`）。
### 3.4.使用Log4j2
::: tip 提示
在使用Log4j之前，需要先启用[ignite-log4j2](/doc/java/SettingUp.md#_2-7-启用模块)模块。
:::
要使用Log4j2进行日志记录，需要配置`IgniteConfiguration`的`gridLogger`属性，如下所示：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration" id="ignite.cfg">
    <property name="gridLogger">
        <bean class="org.apache.ignite.logger.log4j2.Log4J2Logger">
            <!-- log4j2 configuration file -->
            <constructor-arg type="java.lang.String" value="log4j2-config.xml"/>
        </bean>
    </property>

    <!-- other properties -->

</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

IgniteLogger log = new Log4J2Logger("log4j2-config.xml");

cfg.setGridLogger(log);

// Start a node.
try (Ignite ignite = Ignition.start(cfg)) {
    ignite.log().info("Info Message Logged!");
}
```
</Tab>

<Tab title="C#/.NET">
.NET目前还不支持这个API，需要使用基于XML的配置。

</Tab>

<Tab title="C++">
C++目前还不支持这个API，需要使用基于XML的配置。

</Tab>
</Tabs>

在上面的配置中，`log4j2-config.xml`的路径要么是绝对路径，要么是相对路径，可以相对于`META-INF`，也可以相对于`IGNITE_HOME`。在Ignite的二进制包中有一个log4j2配置文件的示例（`$IGNITE_HOME/config/ignite-log4j2.xml`）。

::: tip 提示
Log4j2的配置支持运行时调整，即配置文件的变更会即时生效而不需要重启应用。
:::

### 3.5.使用JCL
::: tip 提示
在使用Log4j之前，需要先启用[ignite-jcl](/doc/java/SettingUp.md#_2-7-启用模块)模块。
:::
::: tip 提示
注意JCL只是简单地将日志消息转发给底层的日志系统，该日志系统是需要正确配置的，更多的信息，请参见[JCL官方文档](https://commons.apache.org/proper/commons-logging/guide.html#Configuration)。比如，如果要使用Log4j，就需要把必要的库文件加入类路径中。
:::
要使用JCL进行日志记录，需要配置`IgniteConfiguration`的`gridLogger`属性，如下所示：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration" id="ignite.cfg">
    <property name="gridLogger">
        <bean class="org.apache.ignite.logger.jcl.JclLogger">
        </bean>
    </property>

    <!-- other properties -->

</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setGridLogger(new JclLogger());

// Start a node.
try (Ignite ignite = Ignition.start(cfg)) {
    ignite.log().info("Info Message Logged!");
}
```
</Tab>

<Tab title="C#/.NET">
.NET目前还不支持这个API，需要使用基于XML的配置。

</Tab>

<Tab title="C++">
C++目前还不支持这个API，需要使用基于XML的配置。

</Tab>
</Tabs>

### 3.6.使用SLF4J
::: tip 提示
在使用Log4j之前，需要先启用[ignite-slf4j](/doc/java/SettingUp.md#_2-7-启用模块)模块。
:::
要使用SLF4J进行日志记录，需要配置`IgniteConfiguration`的`gridLogger`属性，如下所示：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration" id="ignite.cfg">
    <property name="gridLogger">
        <bean class="org.apache.ignite.logger.slf4j.Slf4jLogger">
        </bean>
    </property>

    <!-- other properties -->

</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setGridLogger(new Slf4jLogger());

// Start a node.
try (Ignite ignite = Ignition.start(cfg)) {
    ignite.log().info("Info Message Logged!");
}
```
</Tab>

<Tab title="C#/.NET">
.NET目前还不支持这个API，需要使用基于XML的配置。

</Tab>

<Tab title="C++">
C++目前还不支持这个API，需要使用基于XML的配置。

</Tab>
</Tabs>

更多的信息，请参见[SLF4J用户手册](https://www.slf4j.org/docs.html)。
### 3.7.限制敏感信息
日志可以包括缓存数据、系统属性、启动选项等内容。在某些情况下，这些日志可能包含敏感信息。可以通过将`IGNITE_TO_STRING_INCLUDE_SENSITIVE`系统属性设置为`false`来阻止将此类信息写入日志。

```shell
./ignite.sh -J-DIGNITE_TO_STRING_INCLUDE_SENSITIVE=false
```
请参见[配置JVM选项](/doc/java/StartingNodes.md#_4-配置jvm选项)以了解设置系统属性的不同方式。
### 3.8.日志配置示例
下面的步骤可以指导开发者配置日志的过程，这个过程会适用大多数场景。

 1. 使用Log4j或者Log4j2作为日志框架，使用方式见前述的说明；
 2. 如果使用了默认的配置文件（`ignite-log4j.xml`或者`ignite-log4j2.xml`），需要取消`CONSOLE`appender的注释；
 3. 在log4j配置文件中，需要配置日志文件的路径，默认位置为`${IGNITE_HOME}/work/log/ignite.log`；
 4. 使用`verbose`模式启动节点：
    - 如果使用`ignite.sh`启动节点，加上`-v`选项；
    - 如果从Java代码启动节点，需要使用`IGNITE_QUIET=false`系统变量。

## 4.资源注入
### 4.1.概述
Ignite中，预定义的资源都是可以进行依赖注入的，同时支持基于属性和基于方法的注入。任何加注正确注解的资源都会在初始化之前注入相对应的任务、作业、闭包或者SPI。
### 4.2.基于属性和基于方法
可以通过在一个属性或者方法上加注注解来注入资源。当加注在属性上时，Ignite只是在注入阶段简单地设置属性的值（不会理会该属性的访问修饰符）。如果在一个方法上加注了资源注解，它会访问一个与注入资源相对应的输入参数的类型，如果匹配，那么在注入阶段，就会将适当的资源作为输入参数，然后调用该方法。

<Tabs>
<Tab title="基于属性">

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

<Tab title="基于方法">

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

### 4.3.预定义的资源
有很多的预定义资源可供注入：

|资源|描述|
|---|---|
|`CacheNameResource`|由`CacheConfiguration.getName()`提供，注入缓存名|
|`CacheStoreSessionResource`|注入当前的`CacheStoreSession`实例|
|`IgniteInstanceResource`|注入当前的Ignite实例|
|`JobContextResource`|注入`ComputeJobContext`的实例。作业的上下文持有关于一个作业执行的有用的信息。比如，可以获得包含与作业并置的条目的缓存的名字。|
|`LoadBalancerResource`|注入`ComputeLoadBalancer`的实例，注入后可以用于任务的负载平衡。|
|`ServiceResource`|通过指定服务名注入Ignite的服务。|
|`SpringApplicationContextResource`|注入Spring的`ApplicationContext`资源。|
|`SpringResource`|从Spring的`ApplicationContext`注入资源，当希望访问在Spring的ApplicationContext XML配置中指定的一个Bean时，可以用它。|
|`TaskContinuousMapperResource`|注入一个`ComputeTaskContinuousMapper`的实例，持续映射可以在任何时点从任务中发布作业，即使过了*map*的初始化阶段。|
|`TaskSessionResource`|注入`ComputeTaskSession`资源的实例，它为一个特定的任务执行定义了一个分布式的会话。|

<RightPane/>
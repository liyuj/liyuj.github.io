# 快速入门
## 1.Java
本章节介绍运行Ignite的系统要求，如何安装，启动一个集群，然后运行一个简单的HelloWorld示例。
### 1.1.环境要求
Apache Ignite官方在如下环境中进行了测试：

 - JDK：Oracle JDK8及以上，Open JDK8及以上，IBM JDK8及以上；
 - OS：Linux（任何版本），Mac OS X（10.6及以上），Windows(XP及以上)，Windows Server（2008及以上），Oracle Solaris；
 - 网络：没有限制（建议10G甚至更快的网络带宽）；
 - 架构：x86，x64，SPARC，PowerPC。

如果使用了JDK9或之后的版本，具体可以看下面的[在JDK11及以后版本中运行Ignite](#_1-6-在jdk11及以后的版本中运行)章节；

### 1.2.安装Ignite
Ignite入门的最简单方式是使用每次版本发布生成的二进制压缩包：
 
 - 下载最新版本的[Ignite压缩包](https://ignite.apache.org/download.cgi#binaries)；
 - 将该包解压到操作系统的一个文件夹；
 - （可选）启用必要的[模块](/doc/java/SettingUp.md#_2-7-启用模块)；
 - （可选）配置`IGNITE_HOME`环境变量或者Windows的`PATH`指向Ignite的安装文件夹，路径不要以`/`（Windows为`\`）结尾。

### 1.3.启动Ignite
可以从命令行启动Ignite集群，或者使用默认的配置，或者传入一个自定义配置文件，可以同时启动任意多个节点，他们都会自动地相互发现。

在命令行中转到Ignite安装文件夹的`bin`目录：

<Tabs>
<Tab title="Linux">
```shell
cd {IGNITE_HOME}/bin/
```
</Tab>

<Tab title="Windows">

```batch
cd {IGNITE_HOME}\bin\
```
</Tab>

</Tabs>

向下面这样，将一个自定义配置文件作为参数传递给`ignite.sh|bat`，然后启动一个节点：

<Tabs>
<Tab title="Linux">
```shell
./ignite.sh ../examples/config/example-ignite.xml
```
</Tab>

<Tab title="Windows">

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
再次开启一个终端然后执行和前述同样的命令：

<Tabs>
<Tab title="Linux">
```shell
./ignite.sh ../examples/config/example-ignite.xml
```
</Tab>

<Tab title="Windows">

```batch
ignite.bat ..\examples\config\example-ignite.xml
```
</Tab>

</Tabs>

这时再次看下输出，注意包含`Topology snapshot`的行，就会发现集群中有了2个服务端节点，同时集群中可用的CPU和内存也会更多：
```
[08:54:34] Ignite node started OK (id=3a30b7a4)
[08:54:34] Topology snapshot [ver=2, locNode=3a30b7a4, servers=2, clients=0, state=ACTIVE, CPUs=4, offheap=3.2GB, heap=4.0GB]
```
::: tip 默认配置
`ignite.sh|bat`默认会使用`config/default-config.xml`这个配置文件启动节点。
:::

### 1.4.创建第一个应用
集群启动之后，就可以按照如下步骤运行一个`HelloWorld`示例。
#### 1.4.1.添加Maven依赖
在Java中使用Ignite的最简单的方式是使用Maven依赖管理。

使用喜欢的IDE创建一个新的Maven工程，然后在项目的`pom.xml`文件中添加下面的依赖：
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
    <dependency>
        <groupId>org.apache.ignite</groupId>
        <artifactId>ignite-spring</artifactId>
        <version>${ignite.version}</version>
    </dependency>
</dependencies>
```
#### 1.4.2.HelloWorld.java
下面这个`HelloWord.java`文件，会在所有已启动的服务端节点上输出`Hello World`以及其他的一些环境信息，该示例会显示如何使用Java API配置集群，如何创建缓存，如何加载数据并在服务端执行Java任务：
```java
public class HelloWorld {
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
::: tip 提示
不要忘了添加`import`语句，然后如果Maven解决了所有的依赖，这个会很简单。

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
:::
#### 1.4.3.运行该应用
编译并运行`HelloWorld.java`，然后就会在所有服务端节点上看到`Hello World!`以及其他的一些环境信息输出。
### 1.5.进一步的示例
Ignite的安装包里面包含了其他的示例。

按照下面的步骤，可以运行这个示例工程（这里以IntelliJ IDEA为例，其他类似的IDE比如Eclipse也可以）。

1. 启动IntelliJ IDEA，然后点击`Import Project`按钮；

![](https://ignite.apache.org/docs/2.9.0/images/ijimport.png)

2. 转到`{IGNITE_HOME}/examples`目录，选择`{IGNITE}/examples/pom.xml`文件，然后点击`OK`；
3. 在后面的界面中点击`Next`，都使用项目的默认配置，最后点击`Finish`；
4. 等待IntelliJ IDE完成Maven配置，解析依赖，然后加载模块；
5. 必要时需要配置JDK。
6. 运行`rc/main/java/org/apache/ignite/examples/datagrid/CacheApiExample`；

![](https://ignite.apache.org/docs/2.9.0/images/ijrun.png)

7. 确认示例代码已经启动并且成功执行，如下图所示：

![](https://ignite.apache.org/docs/2.9.0/images/ijfull.png)

### 1.6.在Java11及以后的版本中使用Ignite
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

## 2.C#/.NET
本章节介绍如何使用.NET Core进行构建以及在.NET中运行一个简单的HelloWorld示例，启动一个节点，写入数据然后读取。
### 2.1.环境要求
Ignite.NET在如下环境中进行了测试：

 - JDK：Oracle JDK8及以上，Open JDK8及以上，IBM JDK8及以上；
 - .NET框架：.NET 4.0+, .NET Core 2.0+。

### 2.2.运行一个简单的.NET示例
::: tip 提示
Ignite.NET支持胖客户端和瘦客户端，本章节会聚焦于胖客户端。添加Ignite的库包之后就可以运行该示例，并不需要下载安装Ignite的二进制包。

至于.NET瘦客户端，请参见[.NET瘦客户端](/doc/java/ThinClients.md#_3-net瘦客户端)。
:::

1. 安装.NET Core SDK（版本2+），[https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)；
2. 使用命令行（Linux shell，Windows CMD或者PowerShell等）执行下面的2个命令：

  ```
    > dotnet new console
  ```

  这会创建一个新的工程，包含了一个带有元数据的项目文件和有代码的.cs文件。

  ```
    > dotnet add package Apache.Ignite
  ```
  这会修改项目文件`.csproj`添加依赖。
3. 使用文本编辑器打开`Program.cs`，然后替换成下面的内容：

```csharp
using System;
using Apache.Ignite.Core;

namespace  IgniteTest
{
    class Program
    {
        static void Main(string[] args)
        {
          var ignite = Ignition.Start();
          var cache = ignite.GetOrCreateCache<int, string>("my-cache");
          cache.Put(1, "Hello, World");
          Console.WriteLine(cache.Get(1));
        }
    }
}
```
4. 保存后运行改程序：

```
> dotnet run
```
这样就可以了，这时会看到启动了一个节点并且显示了`Hello, World`。
### 2.3.进一步的示例

 - 了解[.NET瘦客户端](/doc/java/ThinClients.md#_net瘦客户端)，这是接入Ignite集群的一个轻量级解决方案；
 - 在[这里](https://github.com/apache/ignite/tree/master/modules/platforms/dotnet/examples)可以看到Ignite自带的其他.NET示例；
 - 要了解关于.NET部分的更多介绍，请参见[这里](/doc/java/DotnetSpecific.md)。

## 3.C++
本章节介绍C++环境运行Ignite的系统要求，以及如何安装Ignite，启动一个集群，然后运行一个简单的HelloWorld示例。
### 3.1.环境要求
Ignite C++官方在如下环境中进行了测试：

 - JDK：Oracle JDK8及以上，Open JDK8及以上，IBM JDK8及以上；
 - OS：WindowsVista，Windows Server2008及以后的版本，Ubuntu（18.04 64位）；
 - 网络：没有限制（建议10G甚至更快的网络带宽）；
 - 硬件：没有限制；
 - C++编译器：MS Visual C (10.0及以后), g (4.4.0及以后)；
 - Visual Studio：2010及以后。

### 3.2.安装Ignite

 - 下载最新版本的[Ignite压缩包](https://ignite.apache.org/download.cgi#binaries)；
 - 将该包解压到操作系统的一个文件夹；
 - （可选）启用必要的[模块](/doc/java/SettingUp.md#_2-7-启用模块)；
 - （可选）配置`IGNITE_HOME`环境变量或者Windows的`PATH`指向Ignite的安装文件夹，路径不要以`/`（Windows为`\`）结尾。

### 3.3.启动Ignite
可以从命令行启动Ignite集群，或者使用默认的配置，或者传入一个自定义配置文件，可以同时启动任意多个节点，他们都会自动地相互发现。

在命令行中转到Ignite安装文件夹的`bin`目录：

<Tabs>
<Tab title="Linux">
```shell
cd {IGNITE_HOME}/bin/
```
</Tab>

<Tab title="Windows">

```batch
cd {IGNITE_HOME}\bin\
```
</Tab>

</Tabs>

向下面这样，将一个自定义配置文件作为参数传递给`ignite.sh|bat`，然后启动一个节点：

<Tabs>
<Tab title="Linux">
```shell
./ignite.sh ../examples/config/example-ignite.xml
```
</Tab>

<Tab title="Windows">

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
再次开启一个终端然后执行和前述同样的命令：

<Tabs>
<Tab title="Linux">
```shell
./ignite.sh ../examples/config/example-ignite.xml
```
</Tab>

<Tab title="Windows">

```batch
ignite.bat ..\examples\config\example-ignite.xml
```
</Tab>

</Tabs>

这时再次看下输出，注意包含`Topology snapshot`的行，就会发现集群中有了2个服务端节点，同时集群中可用的CPU和内存也会更多：
```
[08:54:34] Ignite node started OK (id=3a30b7a4)
[08:54:34] Topology snapshot [ver=2, locNode=3a30b7a4, servers=2, clients=0, state=ACTIVE, CPUs=4, offheap=3.2GB, heap=4.0GB]
```
::: tip 默认配置
`ignite.sh|bat`默认会使用`config/default-config.xml`这个配置文件启动节点。
:::

::: tip 提示
IgniteC++支持胖客户端和瘦客户端，本章节会聚焦瘦客户端，可以运行下面的示例，接入之前启动的Java版本的集群。
:::
集群启动之后，就可以使用Ignite C++瘦客户端执行缓存操作（比如读写数据，执行SQL等）。
### 3.4.Ignite和C++入门
Ignite附带了强大的C++客户端，要入门Ignite和C++，首先要熟悉如何构建C++应用。

 1. 安装`openssl`并将其加入PATH；
 2. 事先要下载并安装好[Apache Ignite](https://ignite.apache.org/docs/latest/quick-start/cpp#installing-ignite)；
 3. 转到`{IGNITE_HOME}/platforms/cpp/project/vs`文件夹；
 4. 启动相应的Visual Studio方案文件（`ignite.sln`对应于64位）；
 5. 构建该方案。

到这，就可以创建自己的代码，或运行`{IGNITE_HOME}/platforms/cpp/examples/project/vs`目录中已有的示例了。

`{IGNITE_HOME}/platforms/cpp`文件夹中的`readme.txt`和`DEVNOTES.txt`文件中包含有关如何为构建，测试和使用C++版本GGCE的更多信息。

有关C++瘦客户端的信息，请参见[C++瘦客户端](/doc/java/ThinClients.md#_4-c-瘦客户端)。
### 3.5.Unix下的C++
在Unix系统中，可以使用命令行来构建和运行Ignite二进制包中包含的示例代码。
#### 3.5.1.环境要求
需要安装如下的包：

 - C++编译器；
 - cmake 3.6+；
 - JDK；
 - openssl，包括头文件；
 - unixODBC。

针对一些流行的发行版的安装介绍，列在了下面：

<Tabs>
<Tab title="Ubuntu18.04/20.04">

```shell
sudo apt-get install -y build-essential cmake openjdk-11-jdk unixodbc-dev libssl-dev
```
</Tab>

<Tab title="CentOS/RHEL7">

```shell
sudo yum install -y epel-release
sudo yum install -y java-11-openjdk-devel cmake3 unixODBC-devel openssl-devel make gcc-c++
```
</Tab>

<Tab title="CentOS/RHEL8">
```shell
sudo yum install -y java-11-openjdk-devel cmake3 unixODBC-devel openssl-devel make gcc-c++
```
</Tab>

</Tabs>

#### 3.5.2.构建IgniteC++

 - 下载并解压Ignite二进制包，并将生成的目录定义为`${IGNITE_HOME}`；
 - 为CMake创建一个构建目录，将其定义为`${CPP_BUILD_DIR}`；
 - 通过执行以下命令来构建和安装Ignite C++：

<Tabs>
<Tab title="Ubuntu">
```shell
cd ${CPP_BUILD_DIR}
cmake -DCMAKE_BUILD_TYPE=Release -DWITH_ODBC=ON -DWITH_THIN_CLIENT=ON ${IGNITE_HOME}/platforms/cpp
make
sudo make install
```
</Tab>

<Tab title="CentOS/RHEL">
```shell
cd ${CPP_BUILD_DIR}
cmake3 -DCMAKE_BUILD_TYPE=Release -DWITH_ODBC=ON -DWITH_THIN_CLIENT=ON ${IGNITE_HOME}/platforms/cpp
make
sudo make install
```
</Tab>
</Tabs>

构建和运行胖客户端示例：

 - 为cmake创建一个构建目录，并将其定义为`${CPP_EXAMPLES_BUILD_DIR}`；
 - 通过下面的命令构建示例代码：

<Tabs>
<Tab title="Ubuntu">
```shell
cd ${CPP_EXAMPLES_BUILD_DIR}
cmake -DCMAKE_BUILD_TYPE=Release ${IGNITE_HOME}/platforms/cpp/examples && make
cd ./put-get-example
./ignite-put-get-example
```
</Tab>

<Tab title="CentOS/RHEL">
```shell
cd ${CPP_EXAMPLES_BUILD_DIR}
cmake3 -DCMAKE_BUILD_TYPE=Release ${IGNITE_HOME}/platforms/cpp/examples && make
cd ./put-get-example
./ignite-put-get-example
```
</Tab>
</Tabs>

### 3.6.进一步

 - 了解[C++瘦客户端](/doc/java/ThinClients.md#_c-瘦客户端)，这是接入Ignite集群的一个轻量级解决方案；
 - 在[这里](https://github.com/apache/ignite/tree/master/modules/platforms/cpp/examples)可以看到Ignite自带的其他C++示例；
 - 要了解关于C++部分的更多介绍，请参见[这里](/doc/java/CppSpecific.md)。

## 4.Python
本章节介绍运行Ignite的系统要求，如何安装，启动一个集群，然后使用[Python瘦客户端](/doc/java/ThinClients.md#_5-python瘦客户端)运行一个简单的HelloWorld示例。

瘦客户端是一个轻量级的Ignite连接模式，它不参与集群，不持有数据，也不执行计算，只是与一个或者多个Ignite节点之间建立套接字连接然后通过这些节点执行各种操作。
### 4.1.环境要求
Apache Ignite官方在如下环境中进行了测试：

 - JDK：Oracle JDK8及以上，Open JDK8及以上，IBM JDK8及以上；
 - OS：Linux（任何版本），Mac OS X（10.6及以上），Windows(XP及以上)，Windows Server（2008及以上），Oracle Solaris；
 - 网络：没有限制（建议10G甚至更快的网络带宽）；
 - 架构：x86，x64，SPARC，PowerPC；
 - Python：版本3.4.0及以上。

### 4.2.安装Ignite
Ignite入门的最简单方式是使用每次版本发布生成的二进制压缩包：
 
 - 下载最新版本的[Ignite压缩包](https://ignite.apache.org/download.cgi#binaries)；
 - 将该包解压到操作系统的一个文件夹；
 - （可选）启用必要的[模块](/doc/java/SettingUp.md#_2-7-启用模块)；
 - （可选）配置`IGNITE_HOME`环境变量或者Windows的`PATH`指向Ignite的安装文件夹，路径不要以`/`（Windows为`\`）结尾。

完成之后，执行如下命令安装Python的瘦客户端包，该客户端缩写为`pyignite`。

<Tabs>
<Tab title="pip3">
```shell
pip3 install pyignite
```
</Tab>

<Tab title="pip">
```shell
pip install pyignite
```
</Tab>
</Tabs>

### 4.3.启动Ignite
在使用Python瘦客户端接入Ignite之前，至少要启动一个Ignite集群节点。

可以从命令行启动Ignite集群，或者使用默认的配置，或者传入一个自定义配置文件，可以同时启动任意多个节点，他们都会自动地相互发现。

在命令行中转到Ignite安装文件夹的`bin`目录：

<Tabs>
<Tab title="Linux">
```shell
cd {IGNITE_HOME}/bin/
```
</Tab>

<Tab title="Windows">

```batch
cd {IGNITE_HOME}\bin\
```
</Tab>

</Tabs>

向下面这样，将一个自定义配置文件作为参数传递给`ignite.sh|bat`，然后启动一个节点：

<Tabs>
<Tab title="Linux">
```shell
./ignite.sh ../examples/config/example-ignite.xml
```
</Tab>

<Tab title="Windows">

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
再次开启一个终端然后执行和前述同样的命令：

<Tabs>
<Tab title="Linux">
```shell
./ignite.sh ../examples/config/example-ignite.xml
```
</Tab>

<Tab title="Windows">

```batch
ignite.bat ..\examples\config\example-ignite.xml
```
</Tab>

</Tabs>

这时再次看下输出，注意包含`Topology snapshot`的行，就会发现集群中有了2个服务端节点，同时集群中可用的CPU和内存也会更多：
```
[08:54:34] Ignite node started OK (id=3a30b7a4)
[08:54:34] Topology snapshot [ver=2, locNode=3a30b7a4, servers=2, clients=0, state=ACTIVE, CPUs=4, offheap=3.2GB, heap=4.0GB]
```
::: tip 默认配置
`ignite.sh|bat`默认会使用`config/default-config.xml`这个配置文件启动节点。
:::
### 4.4.运行第一个应用
集群启动之后，就可以使用Ignite的Python瘦客户端执行各种缓存操作了。

假定服务端节点就在本地运行，下面的HelloWorld程序会对缓存进行数据的读写。

```python
from pyignite import Client

client = Client()
client.connect('127.0.0.1', 10800)

#Create cache
my_cache = client.create_cache('my cache')

#Put value in cache
my_cache.put(1, 'Hello World')

#Get value from cache
result = my_cache.get(1)
print(result)
```
如果要运行，可以将这段文本保存为一个文本章节件（比如hello.py），然后在命令行中使用如下命令运行：
```shell
python3 hello.py
```
或者可以在Python解释器/终端（比如Windows中的IDLE）中输入这个示例，然后在哪里修改/执行。

### 4.5.进一步的示例
在[这里](https://github.com/apache/ignite/tree/master/modules/platforms/python/examples)可以看到Ignite自带的其他Python示例。

## 5.Node.js
本章节介绍运行Ignite的系统要求，如何安装，启动一个集群，然后使用[Node.js瘦客户端](/doc/java/ThinClients.md#_7-node-js瘦客户端)运行一个简单的HelloWorld示例。

瘦客户端是一个轻量级的Ignite连接模式，它不参与集群，不持有数据，也不执行计算，只是与一个或者多个Ignite节点之间建立套接字连接然后通过这些节点执行各种操作。
### 5.1.环境要求
Apache Ignite官方在如下环境中进行了测试：

 - JDK：Oracle JDK8及以上，Open JDK8及以上，IBM JDK8及以上；
 - OS：Linux（任何版本），Mac OS X（10.6及以上），Windows(XP及以上)，Windows Server（2008及以上），Oracle Solaris；
 - 网络：没有限制（建议10G甚至更快的网络带宽）；
 - 架构：x86，x64，SPARC，PowerPC；
 - Node.js：要求版本8.0及以上，可以下载适用目标主机的二进制包，也可以通过包管理器安装Node.js。

### 5.2.安装Ignite
Ignite入门的最简单方式是使用每次版本发布生成的二进制压缩包：
 
 - 下载最新版本的[Ignite压缩包](https://ignite.apache.org/download.cgi#binaries)；
 - 将该包解压到操作系统的一个文件夹；
 - （可选）启用必要的[模块](/doc/java/SettingUp.md#_2-7-启用模块)；
 - （可选）配置`IGNITE_HOME`环境变量或者Windows的`PATH`指向Ignite的安装文件夹，路径不要以`/`（Windows为`\`）结尾。

完成之后，执行如下命令安装Node.js的瘦客户端包：

```shell
npm install -g apache-ignite-client
```

### 5.3.启动Ignite
在使用Node.js瘦客户端接入Ignite之前，至少要启动一个Ignite集群节点。

可以从命令行启动Ignite集群，或者使用默认的配置，或者传入一个自定义配置文件，可以同时启动任意多个节点，他们都会自动地相互发现。

在命令行中转到Ignite安装文件夹的`bin`目录：

<Tabs>
<Tab title="Linux">
```shell
cd {IGNITE_HOME}/bin/
```
</Tab>

<Tab title="Windows">

```batch
cd {IGNITE_HOME}\bin\
```
</Tab>

</Tabs>

向下面这样，将一个自定义配置文件作为参数传递给`ignite.sh|bat`，然后启动一个节点：

<Tabs>
<Tab title="Linux">
```shell
./ignite.sh ../examples/config/example-ignite.xml
```
</Tab>

<Tab title="Windows">

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
再次开启一个终端然后执行和前述同样的命令：

<Tabs>
<Tab title="Linux">
```shell
./ignite.sh ../examples/config/example-ignite.xml
```
</Tab>

<Tab title="Windows">

```batch
ignite.bat ..\examples\config\example-ignite.xml
```
</Tab>

</Tabs>

这时再次看下输出，注意包含`Topology snapshot`的行，就会发现集群中有了2个服务端节点，同时集群中可用的CPU和内存也会更多：
```
[08:54:34] Ignite node started OK (id=3a30b7a4)
[08:54:34] Topology snapshot [ver=2, locNode=3a30b7a4, servers=2, clients=0, state=ACTIVE, CPUs=4, offheap=3.2GB, heap=4.0GB]
```
::: tip 默认配置
`ignite.sh|bat`默认会使用`config/default-config.xml`这个配置文件启动节点。
:::
### 5.4.运行第一个应用
集群启动之后，就可以通过Ignite的Node.js瘦客户端执行各种缓存操作，在`{ignite_nodejs_dir}/platforms/nodejs/examples`文件夹中包含了若干直接就可以运行的Node.js示例，比如：

```shell
cd {IGNITE_HOME}/platforms/nodejs/examples
node CachePutGetExample.js
```
假定服务端节点就在本地运行，而且完成了前述的各项准备工作，下面就是一个简单的对缓存进行数据读写的HelloWorld示例。如果遵照了前述的介绍，然后将该示例代码放到了`examples`文件夹，就可以了。

```javascript
const IgniteClient = require('apache-ignite-client');
const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;
const ObjectType = IgniteClient.ObjectType;
const CacheEntry = IgniteClient.CacheEntry;

async function performCacheKeyValueOperations() {
    const igniteClient = new IgniteClient();
    try {
        await igniteClient.connect(new IgniteClientConfiguration('127.0.0.1:10800'));
        const cache = (await igniteClient.getOrCreateCache('myCache')).
            setKeyType(ObjectType.PRIMITIVE_TYPE.INTEGER);
        // put and get value
        await cache.put(1, 'Hello World');
        const value = await cache.get(1);
        console.log(value);

    }
    catch (err) {
        console.log(err.message);
    }
    finally {
        igniteClient.disconnect();
    }
}

performCacheKeyValueOperations();
```
### 5.5.下一步
要进一步了解，[Node.js瘦客户端](/doc/java/ThinClients.md#_7-node-js瘦客户端)有更多的介绍。
## 6.SQL（通过命令行）
如果仅在本地主机启动了一个集群，并且未通过Java程序或者启动IDE注入了一些数据，那么不需要5分钟，就可以通过纯命令行使用SQL进行基本的数据加载和执行一些查询。

要做到这一点，可以使用`sqlline`工具（位于Ignite二进制包里面的`/bin`文件夹）。

::: tip 提示
此示例仅显示了一种简单的方法，可以快速将数据加载到Ignite中，以进行演示。对于更大的生产级负载，建议用户使用更可靠的数据加载方法（IgniteDataStreamer、Spark、高级SQL等），关于如何从RDBMS加载数据的更多信息，请参阅[外部存储](/doc/java/Persistence.md#_2-外部存储)章节。
:::
### 6.1.安装Ignite
Ignite入门的最简单方式是使用每次版本发布生成的二进制压缩包：
 
 - 下载最新版本的[Ignite压缩包](https://ignite.apache.org/download.cgi#binaries)；
 - 将该包解压到操作系统的一个文件夹；
 - （可选）启用必要的[模块](/doc/java/SettingUp.md#_2-7-启用模块)；
 - （可选）配置`IGNITE_HOME`环境变量或者Windows的`PATH`指向Ignite的安装文件夹，路径不要以`/`（Windows为`\`）结尾。

完成之后，执行如下命令安装Node.js的瘦客户端包：

```shell
npm install -g apache-ignite-client
```

### 6.2.运行Ignite
在使用Node.js瘦客户端接入Ignite之前，至少要启动一个Ignite集群节点。

可以从命令行启动Ignite集群，或者使用默认的配置，或者传入一个自定义配置文件，可以同时启动任意多个节点，他们都会自动地相互发现。

在命令行中转到Ignite安装文件夹的`bin`目录：

<Tabs>
<Tab title="Linux">
```shell
cd {IGNITE_HOME}/bin/
```
</Tab>

<Tab title="Windows">

```batch
cd {IGNITE_HOME}\bin\
```
</Tab>

</Tabs>

向下面这样，将一个自定义配置文件作为参数传递给`ignite.sh|bat`，然后启动一个节点：

<Tabs>
<Tab title="Linux">
```shell
./ignite.sh ../examples/config/example-ignite.xml
```
</Tab>

<Tab title="Windows">

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
再次开启一个终端然后执行和前述同样的命令：

<Tabs>
<Tab title="Linux">
```shell
./ignite.sh ../examples/config/example-ignite.xml
```
</Tab>

<Tab title="Windows">

```batch
ignite.bat ..\examples\config\example-ignite.xml
```
</Tab>

</Tabs>

这时再次看下输出，注意包含`Topology snapshot`的行，就会发现集群中有了2个服务端节点，同时集群中可用的CPU和内存也会更多：
```
[08:54:34] Ignite node started OK (id=3a30b7a4)
[08:54:34] Topology snapshot [ver=2, locNode=3a30b7a4, servers=2, clients=0, state=ACTIVE, CPUs=4, offheap=3.2GB, heap=4.0GB]
```
::: tip 默认配置
`ignite.sh|bat`默认会使用`config/default-config.xml`这个配置文件启动节点。
:::
这是最基本的启动方法。它在本地计算机上启动一个集群，下面就可以接入集群添加数据了。
### 6.3.使用SQLline
使用`sqlline`工具非常简单，只需要连接某个节点然后输入SQL语句即可。

1. 打开一个命令行终端，转到`{IGNITE_HOME}\bin`文件夹；
2. 使用`sqlline`接入集群：

<Tabs>
<Tab title="Linux">
```shell
$ ./sqlline.sh -u jdbc:ignite:thin://127.0.0.1/
```
</Tab>

<Tab title="Windows">

```batch
$ sqlline -u jdbc:ignite:thin://127.0.0.1
```
</Tab>

</Tabs>

3. 在`sqlline`中输入下面两个语句创建两个表：

```sql
CREATE TABLE City (id LONG PRIMARY KEY, name VARCHAR) WITH "template=replicated";

CREATE TABLE Person (id LONG, name VARCHAR, city_id LONG, PRIMARY KEY (id, city_id))
WITH "backups=1, affinityKey=city_id";
```

4. 使用下面的语句插入一些数据：

```sql
INSERT INTO City (id, name) VALUES (1, 'Forest Hill');
INSERT INTO City (id, name) VALUES (2, 'Denver');
INSERT INTO City (id, name) VALUES (3, 'St. Petersburg');
INSERT INTO Person (id, name, city_id) VALUES (1, 'John Doe', 3);
INSERT INTO Person (id, name, city_id) VALUES (2, 'Jane Roe', 2);
INSERT INTO Person (id, name, city_id) VALUES (3, 'Mary Major', 1);
INSERT INTO Person (id, name, city_id) VALUES (4, 'Richard Miles', 2);
```

5. 执行一些查询语句：

```sql
SELECT * FROM City;

+--------------------------------+--------------------------------+
|               ID               |              NAME              |
+--------------------------------+--------------------------------+
| 1                              | Forest Hill                    |
| 2                              | Denver                         |
| 3                              | St. Petersburg                 |
+--------------------------------+--------------------------------+
3 rows selected (0.05 seconds)
```

6. 执行分布式关联：

```sql
SELECT p.name, c.name FROM Person p, City c WHERE p.city_id = c.id;

+--------------------------------+--------------------------------+
|              NAME              |              NAME              |
+--------------------------------+--------------------------------+
| Mary Major                     | Forest Hill                    |
| Jane Roe                       | Denver                         |
| John Doe                       | St. Petersburg                 |
| Richard Miles                  | Denver                         |
+--------------------------------+--------------------------------+
4 rows selected (0.011 seconds)
```
### 6.4.下一步

 - 关于Ignite和[SQL](/doc/java/WorkingwithSQL.md)的更多介绍；
 - 使用[SQLLine](/doc/java/Tools.md#_3-sqlline)的更多介绍。

## 7.PHP
本章节介绍运行Ignite的系统要求，如何安装，启动一个集群，然后使用PHP瘦客户端运行一个简单的HelloWorld示例。

瘦客户端是一个轻量级的Ignite连接模式，它不参与集群，不持有数据，也不执行计算，只是与一个或者多个Ignite节点之间建立套接字连接然后通过这些节点执行各种操作。
### 7.1.环境要求
Apache Ignite官方在如下环境中进行了测试：

 - JDK：Oracle JDK8及以上，Open JDK8及以上，IBM JDK8及以上；
 - OS：Linux（任何版本），Mac OS X（10.6及以上），Windows(XP及以上)，Windows Server（2008及以上），Oracle Solaris；
 - 网络：没有限制（建议10G甚至更快的网络带宽）；
 - 架构：x86，x64，SPARC，PowerPC；
 - PHP：版本7.2或者更高，Composer依赖管理器，PHP的Multibyte String扩展。根据PHP的配置，可能还需要其他的安装/配置。

### 7.2.安装Ignite
Ignite入门的最简单方式是使用每次版本发布生成的二进制压缩包：
 
 - 下载最新版本的[Ignite压缩包](https://ignite.apache.org/download.cgi#binaries)；
 - 将该包解压到操作系统的一个文件夹；
 - （可选）启用必要的[模块](/doc/java/SettingUp.md#_2-7-启用模块)；
 - （可选）配置`IGNITE_HOME`环境变量或者Windows的`PATH`指向Ignite的安装文件夹，路径不要以`/`（Windows为`\`）结尾。

完成之后，转到`{IGNITE_HOME}/platforms/php`，使用下面的命令通过Composer安装Ignite的PHP瘦客户端：

```shell
composer install --no-dev
```

### 7.3.启动Ignite
在使用PHP瘦客户端接入Ignite之前，至少要启动一个Ignite集群节点。

可以从命令行启动Ignite集群，或者使用默认的配置，或者传入一个自定义配置文件，可以同时启动任意多个节点，他们都会自动地相互发现。

在命令行中转到Ignite安装文件夹的`bin`目录：

<Tabs>
<Tab title="Linux">
```shell
cd {IGNITE_HOME}/bin/
```
</Tab>

<Tab title="Windows">

```batch
cd {IGNITE_HOME}\bin\
```
</Tab>

</Tabs>

向下面这样，将一个自定义配置文件作为参数传递给`ignite.sh|bat`，然后启动一个节点：

<Tabs>
<Tab title="Linux">
```shell
./ignite.sh ../examples/config/example-ignite.xml
```
</Tab>

<Tab title="Windows">

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
再次开启一个终端然后执行和前述同样的命令：

<Tabs>
<Tab title="Linux">
```shell
./ignite.sh ../examples/config/example-ignite.xml
```
</Tab>

<Tab title="Windows">

```batch
ignite.bat ..\examples\config\example-ignite.xml
```
</Tab>

</Tabs>

这时再次看下输出，注意包含`Topology snapshot`的行，就会发现集群中有了2个服务端节点，同时集群中可用的CPU和内存也会更多：
```
[08:54:34] Ignite node started OK (id=3a30b7a4)
[08:54:34] Topology snapshot [ver=2, locNode=3a30b7a4, servers=2, clients=0, state=ACTIVE, CPUs=4, offheap=3.2GB, heap=4.0GB]
```
::: tip 默认配置
`ignite.sh|bat`默认会使用`config/default-config.xml`这个配置文件启动节点。
:::
### 7.4.运行第一个应用
集群启动之后，就可以使用Ignite的PHP瘦客户端执行各种缓存操作了。在Ignite的二进制包中的`{IGNITE_HOME}/platforms/php/examples`文件夹，已经包含了一些直接就可以运行的PHP示例，比如：

<Tabs>
<Tab title="Linux">
```shell
cd {IGNITE_HOME}/platforms/php/examples
php CachePutGetExample.php
```
</Tab>

<Tab title="Windows">
```batch
cd {IGNITE_HOME}\platforms\php\examples
php CachePutGetExample.php
```
</Tab>
</Tabs>

假定服务端节点就在本地运行，而且完成了前述的各项准备工作，下面就是一个简单的对缓存进行数据读写的HelloWorld示例。注意`require_once`行，确认这个路径是正确的。如果遵照了前述的介绍，然后将该示例代码放到了`examples`文件夹，就可以了。

```php
<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Apache\Ignite\Client;
use Apache\Ignite\ClientConfiguration;
use Apache\Ignite\Type\ObjectType;
use Apache\Ignite\Cache\CacheEntry;
use Apache\Ignite\Exception\ClientException;

function performCacheKeyValueOperations(): void
{
    $client = new Client();
    try {
        $client->connect(new ClientConfiguration('127.0.0.1:10800'));
        $cache = $client->getOrCreateCache('myCache')->
            setKeyType(ObjectType::INTEGER);

        // put and get value
        $cache->put(1, 'Hello World');
        $value = $cache->get(1);
        echo($value);
    } catch (ClientException $e) {
        echo($e->getMessage());
    } finally {
        $client->disconnect();
    }
}

performCacheKeyValueOperations();
```
### 7.5.进一步的示例
在[这里](/doc/java/ThinClients.md#_6-php瘦客户端)有关于PHP瘦客户端的更多介绍。

## 8.REST API
本章节介绍运行Ignite的系统要求，如何安装，启动一个集群，然后使用REST API运行一个简单的HelloWorld示例。
### 8.1.环境要求
Apache Ignite官方在如下环境中进行了测试：

 - JDK：Oracle JDK8及以上，Open JDK8及以上，IBM JDK8及以上；
 - OS：Linux（任何版本），Mac OS X（10.6及以上），Windows(XP及以上)，Windows Server（2008及以上），Oracle Solaris；
 - 网络：没有限制（建议10G甚至更快的网络带宽）；
 - 架构：x86，x64，SPARC，PowerPC。

### 7.2.安装Ignite
Ignite入门的最简单方式是使用每次版本发布生成的二进制压缩包：
 
 - 下载最新版本的[Ignite压缩包](https://ignite.apache.org/download.cgi#binaries)；
 - 将该包解压到操作系统的一个文件夹；
 - （可选）启用必要的[模块](/doc/java/SettingUp.md#_2-7-启用模块)；
 - （可选）配置`IGNITE_HOME`环境变量或者Windows的`PATH`指向Ignite的安装文件夹，路径不要以`/`（Windows为`\`）结尾。

完成之后，还需要启用Ignite的HTTP连接能力，这时只需要将`ignite-rest-http`模块从`{IGNITE_HOME}/libs/optional/`复制到`{IGNITE_HOME}/libs`即可。

### 8.3.启动Ignite
在使用REST API接入Ignite之前，至少要启动一个Ignite集群节点。

可以从命令行启动Ignite集群，或者使用默认的配置，或者传入一个自定义配置文件，可以同时启动任意多个节点，他们都会自动地相互发现。

在命令行中转到Ignite安装文件夹的`bin`目录：

<Tabs>
<Tab title="Linux">
```shell
cd {IGNITE_HOME}/bin/
```
</Tab>

<Tab title="Windows">

```batch
cd {IGNITE_HOME}\bin\
```
</Tab>

</Tabs>

向下面这样，将一个自定义配置文件作为参数传递给`ignite.sh|bat`，然后启动一个节点：

<Tabs>
<Tab title="Linux">
```shell
./ignite.sh ../examples/config/example-ignite.xml
```
</Tab>

<Tab title="Windows">

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
再次开启一个终端然后执行和前述同样的命令：

<Tabs>
<Tab title="Linux">
```shell
./ignite.sh ../examples/config/example-ignite.xml
```
</Tab>

<Tab title="Windows">

```batch
ignite.bat ..\examples\config\example-ignite.xml
```
</Tab>

</Tabs>

这时再次看下输出，注意包含`Topology snapshot`的行，就会发现集群中有了2个服务端节点，同时集群中可用的CPU和内存也会更多：
```
[08:54:34] Ignite node started OK (id=3a30b7a4)
[08:54:34] Topology snapshot [ver=2, locNode=3a30b7a4, servers=2, clients=0, state=ACTIVE, CPUs=4, offheap=3.2GB, heap=4.0GB]
```
::: tip 默认配置
`ignite.sh|bat`默认会使用`config/default-config.xml`这个配置文件启动节点。
:::
### 8.4.运行第一个应用
集群启动之后，就可以使用Ignite的REST API执行各种缓存操作了。

不需要进行任何特殊的配置，因为连接器已经自动地初始化，监听端口为8080。

如果要验证连接器已经就绪，可以使用curl命令：
```shell
curl "http://localhost:8080/ignite?cmd=version"
```
可以看到如下的消息：
```shell
$ curl "http://localhost:8080/ignite?cmd=version"
{"successStatus":0,"error":null,"sessionToken":null,"response":"2.9.0"}
```
在结果中可以看到Ignite的版本是2.9.0。

请求参数可以以URL的方式提供，也可以采用表单数据的模式：
```shell
curl 'http://localhost:8080/ignite?cmd=put&cacheName=myCache' -X POST -H 'Content-Type: application/x-www-form-urlencoded' -d 'key=testKey&val=testValue'
```

假定服务端节点就在本地运行，下面就是一个简单的示例，该命令创建了一个缓存（myCache），然后通过REST API向缓存写入并读取了字符串`Hello_World!`：

创建一个缓存：
```shell
curl "http://localhost:8080/ignite?cmd=getorcreate&cacheName=myCache"
```
向缓存写入数据。默认的数据类型为`string`，但是可以通过`keyType`参数指定一个[数据类型](/doc/java/RESTAPI.md#_2-数据类型)：
```shell
curl "http://localhost:8080/ignite?cmd=put&key=1&val="Hello_World!"&cacheName=myCache"
```
从缓存获取数据：
```shell
curl "http://localhost:8080/ignite?cmd=get&key=1&cacheName=myCache"
```
现在已经看到了通过REST API访问Ignite集群的非常基本的示例，还应该注意以下几点：

 - 这是一个非常基本的示例。要了解更多的信息，比如各种API调用的列表，还有比如安全这样更为重要的主题，请参见[这里](/doc/java/RESTAPI.md)的介绍；
 - REST接口可能并不适合所有任务。例如，如果要加载大量数据或以毫秒级的延迟执行关键任务，则应使用某个语言的客户端。

<RightPane/>
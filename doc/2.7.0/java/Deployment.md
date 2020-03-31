# 部署
## 1.部署
Ignite对部署没有要求，可以非常容易地部署到私有主机或者任意的云环境，比如，Ignite可以独立部署，也可以部署在Kubernetes或者Docker容器中，还有Apache Mesos以及Hadoop Yarn。它可以运行在物理主机中，也可以部署在虚拟机中。

![](https://files.readme.io/8a65d4a-ignite-deploy.png)

## 2.Docker部署
Docker可以将Ignite应用及其所有的依赖打包进一个标准的容器，Docker会自动下载Ignite的二进制包，将代码部署进Ignite以及配置节点，它还可以自动启动配置好的Ignite节点，这样的集成方式，使得通过简单地重启Ignite的Docker容器就可以部署新的代码。
### 2.1.启动Ignite Docker容器
要运行Docker容器，需要拉取然后启动一个Docker镜像，默认会下载最新的版本，但是在[这里](https://hub.docker.com/r/apacheignite/ignite/tags)可以看到一个完整的清单。

可以使用如下的命令拉取Ignite docker镜像：
```bash
# Pull latest version.
sudo docker pull apacheignite/ignite

# Pull ignite version {ignite-version}
sudo docker pull apacheignite/ignite:{ignite-version}
```
可以使用`docker run`来运行Ignite docker容器：
```bash
# Run latest version.
sudo docker run -it --net=host
-e "CONFIG_URI=$CONFIG_URI"
[-e "OPTION_LIBS=$OPTION_LIBS"]
[-e "JVM_OPTS=$JVM_OPTS"]
...
apacheignite/ignite

# Run ignite version {ignite-version}
sudo docker run -it --net=host
-e "CONFIG_URI=$CONFIG_URI"
[-e "OPTION_LIBS=$OPTION_LIBS"]
[-e "JVM_OPTS=$JVM_OPTS"]
...
apacheignite/ignite:{ignite-version}
```
下面的配置参数在docker容器中可以通过环境变量进行传递：

|名称|描述|默认|示例|
|---|---|---|---|
|`CONFIG_URI`|Ignite配置文件的URL（也可以相对于类路径的META-INF文件夹），下载的配置文件会保存于./ignite-config.xml|无|https://raw.githubusercontent.com/apache/ignite/ master/examples/config/example-cache.xml|
|`OPTION_LIBS`|会被包含在类路径中的可选库|`ignite-log4j, ignite-spring,ignite-indexing`|`ignite-aws,ignite-aop`|
|`JVM_OPTS`|通过docker命令传递给ignite实例的环境变量。|无|`-Xms1g -Xmx1g -server -XX:+AggressiveOpts -XX:MaxPermSize=256m`|
|`EXTERNAL_LIBS`|库文件URL列表|无|`http://central.maven.org/maven2/io/undertow/undertow-servlet/1.3.10.Final/undertow-servlet-1.3.10.Final.jar,http://central.maven.org/maven2/io/undertow/undertow-build-config/1.0.0.Beta24/undertow-build-config-1.0.0.Beta24.jar`|

### 2.2.示例
要启动Ignite的docker容器，可以使用如下的命令：
```bash
sudo docker run -it --net=host -e "CONFIG_URI=https://raw.githubusercontent.com/apache/ignite/master/examples/config/example-cache.xml" apacheignite/ignite
```
之后应该看到如下的输出日志：

![](https://files.readme.io/ryYtMcSCuGiyVcXN1GCw_dock_git_repo.png)

## 3.AWS部署
Ignite的AMI（Amazon机器镜像）可以通过AWS的EC2管理控制台配置一个简单的Ignite集群，通过AMI进行安装，可以快速地部署一个Ignite集群。
### 3.1.Amazon EC2部署

 - 点击下表的链接选择必要的区域：
<table>
<tr>
<td>
区域
</td>
<td>
镜像
</td>
</tr>
<tr>
<td>
US-WEST
</td>
<td>
<a href="https://console.aws.amazon.com/ec2/home?region=us-west-1#launchAmi=ami-9cdbb3fc">ami-9cdbb3fc</a>
</td>
</tr>
<tr>
<td>
US-EAST
</td>
<td>
<a href="https://console.aws.amazon.com/ec2/home?region=us-east-1#launchAmi=ami-ce82caa4">ami-ce82caa4</a>
</td>
</tr>
<tr>
<td>
EU-CENTRAL
</td>
<td>
<a href="https://console.aws.amazon.com/ec2/home?region=eu-central-1#launchAmi=ami-191b0775">ami-191b0775</a>
</td>
</tr>
</table>
或者，也可以使用`Apache Ignite`关键字在`Community AMIs`中搜索镜像：

![](https://files.readme.io/faf5b14-search.png)

 - 选择一个`Instance Type`;
 - 打开`Configure Instance`并且展开`Advanced Details`;
 - 添加下面的任意配置参数；

|名称|描述|默认|示例|
|---|---|---|---|
|`CONFIG_URI`|Ignite配置文件的URL（也可以相对于类路径的META-INF文件夹），下载的配置文件会保存于./ignite-config.xml|无|https://raw.githubusercontent.com/apache/ignite/ master/examples/config/example-cache.xml|
|`OPTION_LIBS`|会被包含在类路径中的可选库|`ignite-log4j, ignite-spring,ignite-indexing`|`ignite-aws,ignite-aop`|
|`JVM_OPTS`|通过docker命令传递给ignite实例的环境变量。|无|`-Xms1g -Xmx1g -server -XX:+AggressiveOpts -XX:MaxPermSize=256m`|
|`EXTERNAL_LIBS`|库文件URL列表|无|`http://central.maven.org/maven2/io/undertow/undertow-servlet/1.3.10.Final/undertow-servlet-1.3.10.Final.jar,http://central.maven.org/maven2/io/undertow/undertow-build-config/1.0.0.Beta24/undertow-build-config-1.0.0.Beta24.jar`|
|`IGNITE_VERSION`|Ignite的版本|`latest`|2.1.0|

如下图所示：

![](https://files.readme.io/0c08e64-advance_details.png)

::: tip 首选Ignite版本
IGNITE_VERSION属性可以视具体情况而定。
:::

 - 在`Tag Instance`，设置`name`标签，比如`ignite-node`;
 - 复查然后运行实例；
 - 连接实例：[http://docs.aws.amazon.com/AWSEC2/latest/UserGuide](http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstances.html);
 - 要查看执行的过程，需要知道容器的id，可以使用如下命令：
```bash
sudo docker ps
```
 - 显示日志：
```bash
sudo docker logs -f CONTAINER_ID
```
 - 进入docker容器：
```bash
sudo docker exec -it container_id /bin/bash
```
## 4.Google计算部署
Ignite的镜像可以通过Google计算控制台配置一个简单的Ignite集群，通过镜像进行安装，可以快速地部署一个Ignite集群。
### 4.1.Google计算部署

 - 要导入[Ignite镜像](https://storage.googleapis.com/ignite-media/ignite-google-image.tar.gz)，执行如下的命令：
```bash
gcloud compute images create ignite-image \
   --source-uri gs://ignite-media/ignite-google-image.tar.gz
```
要了解更多信息，可以参照[cloud.google.com](https://cloud.google.com/compute/docs/images#import_an_image)。

 - 打开`Google Compute Console`；
 - 打开`Compute->Compute Engine->VM`实例，然后点击`New instance`；
 - 点击`Boot disk`的`Change`按钮；
 - 打开`Custom images`，然后选择已导入的镜像，在下面的截图中，可以看到名为`ignite-name`的镜像；

![](https://files.readme.io/e02e235-choose_image.png)

 - 点击`Management, disk, networking, access & security options `，然后可以添加任意的配置参数：

|名称|描述|默认|示例|
|---|---|---|---|
|`CONFIG_URI`|Ignite配置文件的URL（也可以相对于类路径的META-INF文件夹），下载的配置文件会保存于./ignite-config.xml|无|https://raw.githubusercontent.com/apache/ignite/ master/examples/config/example-cache.xml|
|`OPTION_LIBS`|会被包含在类路径中的可选库|`ignite-log4j, ignite-spring,ignite-indexing`|`ignite-aws,ignite-aop`|
|`JVM_OPTS`|通过docker命令传递给ignite实例的环境变量。|无|`-Xms1g -Xmx1g -server -XX:+AggressiveOpts -XX:MaxPermSize=256m`|
|`EXTERNAL_LIBS`|库文件URL列表|无|`http://central.maven.org/maven2/io/undertow/undertow-servlet/1.3.10.Final/undertow-servlet-1.3.10.Final.jar,http://central.maven.org/maven2/io/undertow/undertow-build-config/1.0.0.Beta24/undertow-build-config-1.0.0.Beta24.jar`|
|`IGNITE_VERSION`|Ignite的版本|`latest`|1.7.0|

如下图所示：

![](https://files.readme.io/1945104-metadata.png)

::: tip 首选Ignite版本
IGNITE_VERSION属性可以视具体情况而定。
:::

 - 填写必要的属性然后运行实例；
 - 连接实例;
 - 要查看执行的过程，需要知道容器的id，可以使用如下命令：
```bash
sudo docker ps
```
 - 下面的命令会显示日志：
```bash
sudo docker logs -f CONTAINER_ID
```
 - 使用下面的命令可以进入docker容器：
```bash
sudo docker exec -it container_id /bin/bash
```
## 5.Mesos部署
### 5.1.概述
Apache Ignite支持在Mesos集群上调度和运行Ignite节点。

Apache Mesos是一个集群管理器，它提供了一个通用运行环境以及所有的必要资源来部署、运行和管理分布式应用。它对资源的管理和隔离有助于充分利用服务器资源。

要了解Apache Mesos的更多信息，请参照：[http://mesos.apache.org/](http://mesos.apache.org/)

### 5.2.Ignite Mesos框架
常规部署Apache Ignite集群需要下载Apache Ignite二进制包，修改配置参数以及启动节点。Apache Ignite Mesos框架由`调度器`和`任务`组成，可以极大地简化集群的部署。

 - `调度器`：调度器启动时将自己在Mesos主节点上注册，注册成功之后调度器就会开始处理从Mesos主节点到使用资源的Ignite节点的资源请求，调度器会维护Ignite集群所需（并且可用）的所有资源水平（CPU，内存等）；
 - `任务`：在Mesos从节点上启动Ignite节点。

### 5.3.运行Ignite Mesos框架
要运行Ignite Mesos框架需要配置好的正在运行的Apache Mesos集群，如果需要如何Apache Mesos集群的信息，请参照：[https://docs.mesosphere.com/getting-started/datacenter/install/](https://docs.mesosphere.com/getting-started/datacenter/install/)。

::: warning 注意
确保主节点和从节点监听正确的IP地址，否则无法保证Mesos集群能正常工作。
:::

**通过Marathon运行框架**

目前，建议的做法是通过Marathon运行框架。

 - 安装Marathon，参照：[https://mesosphere.github.io/marathon/docs/](https://mesosphere.github.io/marathon/docs/)marathon章节；
 - 下载Apache Ignite然后将`libs\optional\ignite-mesos\ignite-mesos-<ignite-version>-jar-with-dependencies.jar`上传到任意一个云存储（比如Amazon S3yun）；
 - 拷贝下面的应用定义（JSON格式）然后保存成`marathon.json`文件，然后对参数做必要的修改；
```json
 {
  "id": "ignition",
  "instances": 1,
  "cpus": 2,
  "mem": 2048,
  "ports": [0],
  "uris": [
    "http://host/ignite-mesos-<ignite-version>-jar-with-dependencies.jar"
  ],
  "env": {
    "IGNITE_NODE_COUNT": "4",
    "MESOS_MASTER_URL": "zk://localhost:2181/mesos",
    "IGNITE_RUN_CPU_PER_NODE": "2",
    "IGNITE_MEMORY_PER_NODE": "2048",
    "IGNITE_VERSION": "1.0.5",
    "MESOS_USER" : "userAAAAA",
    "MESOS_ROLE" :  "role1"
  },
  "cmd": "java -jar ignite-mesos-<ignite-version>-jar-with-dependencies.jar"
}
```
角色名必须是有效的目录名，因此如下的格式非法：

  1.为空串；
  2.为.或者..;
  3.由`-`开始；
  4.包含斜杠、退格键以及空白符等。

如果集群没有额外的约束，框架会试图占用Mesos集群的所有资源。

 - 通过curl等工具发送应用定义的POST请求给Marathon：
```bash
curl -X POST -H "Content-type: application/json" --data-binary @marathon.json http://<marathon-ip>:8080/v2/apps/
```
 - 为了确保Apache Mesos框架正确部署，可以这么做，打开Marathon界面` http://<marathon-ip>:8080`，确保有一个名为`ignition`的应用，而且状态是`Running`；
![](https://files.readme.io/sTIbAfcdScKoDCSAJ6Q5_marathon.png)
 - 打开Mesos控制台`http://<master-ip>:5050`，如果一切正常那么任务的名字类似`Ignite node N`，状态是`RUNNING`。在本示例中，N=4，可以看示例中的`marathon.json`文件-"IGNITE_NODE_COUNT": "4"；
![](https://files.readme.io/WSZ5mvnqQzy0dsUeq9WQ_mesos.png)
 - Mesos允许通过浏览器获得任务的日志，要查看Ignition的日志可以点击`Active Tasks`表格中的`Sandbox`；
![](https://files.readme.io/qUqG485tRtKS50JCp7yn_mesos_sandbox.png)
 - 点击`stdout`获取标准输出日志，`stderr`获取标准错误日志；
![](https://files.readme.io/Ch5VkVm1Q5qGvrGEYF4k_mesos_sandbox_stdout.png)
**通过jar文件运行框架**
 - 下载Ignite包然后打开`libs\optional\ignite-mesos\`文件夹；
 - 使用如下命令运行框架：
```
java -jar ignite-mesos-<ignite-version>-jar-with-dependencies.jar
```
或者：
```
java -jar ignite-mesos-<ignite-version>-jar-with-dependencies.jar properties.prop
```
其中`properties.prop`是一个属性文件，如果不提供配置文件那么框架会试图占用Mesos集群的所有资源，下面是一个例子：
```properties
# The number of nodes in the cluster.
IGNITE_NODE_COUNT=1
# Mesos ZooKeeper URL to locate leading master.
MESOS_MASTER_URL=zk://localhost:2181/mesos
# The number of CPU Cores for each Apache Ignite node.
IGNITE_RUN_CPU_PER_NODE=4
# The number of Megabytes of RAM for each Apache Ignite node.
IGNITE_MEMORY_PER_NODE=4096
# The version ignite which will be run on nodes.
IGNITE_VERSION=1.7.0
```
 - 为了确保Apache Mesos框架部署正确，可以这么做-打开Mesos控制台` http://<marathon-ip>:5050`，如果一切正常，名字类似`Ignite node N`的任务状态应该是`Running`。在本示例中N=1，可以看示例中的`properties.prop `文件-"IGNITE_NODE_COUNT": "1"；
![](https://files.readme.io/eEmfch9cQcSQiM27gSqT_Mesos_console.png)
 - Mesos可以通过浏览器获得任务的日志，要查看Ignition的日志，可以点击`Sandbox`；
![](https://files.readme.io/s6fvlxNcQz66nhq8e9zH_Sandbox.png)
 - 点击`stdout`获取标准输出日志，`stderr`获取标准错误日志；
![](https://files.readme.io/MEksCWXBTRq5WpUyp4CJ_stdout.png)

### 5.4.配置
所有配置都是通过环境变量或者配置文件处理的（这非常适用于简化marathon的配置以运行框架），下面的配置参数可以根据需要进行配置：

|名称|描述|默认值|示例|
|---|---|---|---|
|`IGNITE_RUN_CPU_PER_NODE`|每个Ignite节点的CPU核数|没有限制|2|
|`IGNITE_MEMORY_PER_NODE`|每个节点的内存数量（M）|没有限制|1024|
|`IGNITE_DISK_SPACE_PER_NODE`|每个节点占用的磁盘容量（M）|1024|2048|
|`IGNITE_NODE_COUNT`|集群内的节点数量|5|10|
|`IGNITE_TOTAL_CPU`|Ignite集群的CPU核数|没有限制|5|
|`IGNITE_TOTAL_MEMORY`|Ignite集群占用的内存（M）|没有限制||
|`IGNITE_TOTAL_DISK_SPACE`|Ignite集群占用的磁盘空间（M）|没有限制|5120|
|`IGNITE_MIN_CPU_PER_NODE`|要运行Ignite节点所需的CPU核数的最小值|1|4|
|`IGNITE_MIN_MEMORY_PER_NODE`|要运行Ignite节点所需的内存的最小值（M）|256|1024|
|`IGNITE_VERSION`|节点要运行的Ignite的版本|latest|1.6.0|
|`IGNITE_WORK_DIR`|保存Ignite二进制包的目录|ignite-release|/opt/ignite/|
|`IGNITE_XML_CONFIG`|Apache Ignite配置文件的路径|无|/opt/ignite/ignite-config.xml|
|`IGNITE_CONFIG_XML_URL`|Apache Ignite配置文件的URL|无|https://example.com/default-config.xml|
|`IGNITE_USERS_LIBS`|要添加到类路径的库文件的路径|无|/opt/libs/|
|`IGNITE_USERS_LIBS_URL`|要添加到类路径的库文件的URL列表，逗号分割|无|https://example.com/lib.zip,https://example.com/lib1.zip|
|`MESOS_MASTER_URL`|要定位主节点的Mesos Zookeeper的URL|zk://localhost:2181/mesos|zk://176.0.1.45:2181/mesos or 176.0.1.45:2181|
|`IGNITE_PACKAGE_URL`|Ignite的压缩包URL，这个参数可以用于替换IGNITE_VERSION参数。|无|http://apache-mirror.rbc.ru/pub/apache//ignite/1.7.0/apache-ignite-1.7.0-src.zip|
|`IGNITE_PACKAGE_PATH`|Ignite的压缩包路径，这个参数在访问因特网受限时是有用的。|无|/opt/ignite/apache-ignite-fabric-1.6.0-bin.zip|
|`IGNITE_HTTP_SERVER_IDLE_TIMEOUT`|设置一个HTTP连接的最大空闲时间（毫秒），jetty服务器会使用，服务器提供了ignite的mesos框架所需的资源，比如ignite压缩包，用户的库文件，配置等。|30000|30000|

## 6.Yarn部署
### 6.1.概述
与Yarn的集成可以支持在Yarn集群上调度和运行Apache Ignite节点。

Yarn是一个资源管理器，它提供了一个包括所有必要资源的通用的运行环境来进行分布式应用的部署，运行和管理，它对资源的管理和隔离有助于充分利用服务器资源。

要了解Yarn的信息，请参照[http://hadoop.apache.org/docs/current/hadoop-yarn/hadoop-yarn-site/YARN.html](http://hadoop.apache.org/docs/current/hadoop-yarn/hadoop-yarn-site/YARN.html)。

### 6.2.Ignite Yarn应用
部署Apache Ignite集群的典型步骤是下载Ignite的二进制包，修改配置文件以及启动节点。与Yarn的集成可以避免这些操作，Ignite Yarn应用可以极大的简化集群的部署，它由如下组件组成：

 - 下载Ignite二进制包，将必要的资源放入HDFS，创建启动任务的必要的上下文，启动`ApplicationMaster`进程；
 - `Application master`：注册成功之后组件就会开始处理从资源管理器到使用资源的Ignite节点的资源请求，`Application master`会维护Ignite集群所需的所有资源水平（CPU，内存等）；
 - `Container`：在从节点上运行Ignite节点的实体；

### 6.3.运行Ignite Yarn应用
要运行Ignite应用，需要配置和运行Yarn和Hadoop集群，要了解如何配置集群的信息，可以参照：[ http://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-common/ClusterSetup.html](http://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-common/ClusterSetup.html).

 - 下载Ignite；
 - 配置属性文件，修改必要的参数，可以参照下面的`配置`章节：

```properties
# The number of nodes in the cluster.
IGNITE_NODE_COUNT=2

# The number of CPU Cores for each Apache Ignite node.
IGNITE_RUN_CPU_PER_NODE=1

# The number of Megabytes of RAM for each Apache Ignite node.
IGNITE_MEMORY_PER_NODE=2048

# The version of Ignite which will be run on nodes.
IGNITE_VERSION=2.3.0
```

 - 运行应用；
```bash
yarn jar ignite-yarn-<ignite-version>.jar ./ignite-yarn-<ignite-version>.jar cluster.properties
```
 - 为了确保应用正确部署，可以这样做：打开Yarn控制台`http://<hostname>:8088/cluster`，看名字为`Ignition`的应用是否工作正常；
![](https://files.readme.io/ISnxYZaaSyWC3Z6VP54H_AllApp.png)
 - 可以从浏览器获得日志，要查看日志可以点击任意容器的`Logs`；
![](https://files.readme.io/y0U5GlGoTUeSl3qc8iMQ_ContainerLogs.png)
 - 点击`stdout`获取标准输出日志，`stderr`获取标准错误日志；
![](https://files.readme.io/a3e8yeROWckIihHTWTwp_ContainerStdout.png)

### 6.4.配置
所有的配置都是通过环境变量和属性文件进行的，下面的配置参数可以根据需要进行配置：

|名称|描述|默认值|示例|
|---|---|---|---|
|`IGNITE_XML_CONFIG`|指向Apache Ignite配置文件的HDFS路径|无|/opt/ignite/ignite-config.xml|
|`IGNITE_WORK_DIR`|用于保存Ignite二进制包的目录|./ignite-release|/opt/ignite/|
|`IGNITE_RELEASES_DIR`|保存Ignite二进制包的HDFS路径|/ignite/releases/|/ignite-rel/|
|`IGNITE_USERS_LIBS`|要添加到CLASSPATH的库文件的HDFS路径|无|/opt/libs/|
|`IGNITE_MEMORY_PER_NODE`|每个Ignite节点占用的内存的大小（M），这个是Java堆的大小，包括了堆内缓存（如果使用了堆内缓存）。|2048|1024|
|`IGNITE_MEMORY_OVERHEAD_PER_NODE`|所有数据区必要的内存量，包括用于处理JVM本身的负载、用于存储数据的节点，都需要调整，不仅仅是计算。YARN用于容器运行Ignite节点的必要内存量是IGNITE_MEMORY_PER_NODE和IGNITE_MEMORY_OVERHEAD_PER_NODE之和。|IGNITE_MEMORY_PER_NODE * 0.10，最小值384|17408|
|`IGNITE_HOSTNAME_CONSTRAINT`|从节点约束|无|192.168.0.[1-100]|
|`IGNITE_NODE_COUNT`|集群节点的数量|3|10|
|`IGNITE_RUN_CPU_PER_NODE`|每个Ignite节点的CPU核数|2|4|
|`IGNITE_VERSION`|节点上运行的Ignite版本|latest|1.0.5|
|`IGNITE_PATH`|到Ignite构建的hdfs路径，当yarn集群运行在内网无法访问互联网时，这个属性很有用。|无|/ignite/apache-ignite-fabric-1.7.0-bin.zip|
|`IGNITE_JVM_OPTS`|JVM参数|无|-XX:+PrintGC|

## 7.VMWare部署
### 7.1.概述
Ignite可以部署于VMWare管理的虚拟和云环境，没有什么和VMWare有关的特性，不过建议将Ignite实例绑定到一个单一专用的主机，这样可以：

 - 避免当Ignite实例与其它应用程序争用主机资源时，导致Ignite集群的性能出现峰值；
 - 确保高可用，如果一台主机宕机并且有两个或者多个Ignite服务端节点绑定到上面，那么可能导致数据丢失。

下面的内容会说明和Ignite节点迁移有关的vMotion的使用。
### 7.2.使用vMotion进行节点迁移
vMotion可以将一个在线的实例从一台主机迁移到另一台，但是迁移之后Ignite依赖的一些基本要求要得到满足：

 - 新主机有相同的内存状态；
 - 新主机有相同的磁盘状态（或新主机使用相同的磁盘）；
 - IP地址、可用的端口以及其它的网络参数没有变化；
 - 所有的网络资源可用，TCP连接没有中断。

如果vMotion按照上述规则设置并工作，则Ignite节点将正常工作。

不过vMotion迁移将影响Ignite实例的性能。在传输过程中，许多资源（主要是CPU和网络）将服务于vMotion的需要。

为了避免集群一段时间内的性能下降甚至无响应，建议如下：

 - 在Ignite集群的低活跃和负载期间执行迁移。这确保了更快的传输，同时对集群性能影响最小；
 - 避免自动迁移（DRS的完全自动迁移），让IT专家决定迁移Ignite实例的最佳时机；
 - 如果必须迁移多个节点，则需要一个个按顺序地执行节点的迁移；
 - 将`IgniteConfiguration.failureDetectionTimeout`参数设置为高于Ignite实例的可能停机时间的值。这是因为当剩下一小块状态要传输时，vMotion将停止Ignite实例的CPU。假定传输该数据块需要`X`时间，那么`IgniteConfiguration.failureDetectionTimeout`必须大于`X`；否则节点将从集群中删除；
 - 使用高吞吐量网络。最好vMotion迁移器和Ignite集群使用不同的网络来避免网络饱和；
 - 优先选择内存较少的节点，较小内存的Ignite实例确保更快的vMotion迁移，更快的迁移确保Ignite集群更稳定的操作；
 - 如果业务允许，甚至可以考虑在Ignite实例停机时进行迁移。假设集群中的其它节点上有数据的备份副本，则可以先将该节点关闭，然后在vMotion迁移结束后恢复该节点，这样和在线迁移相比，可能总体性能更好（集群的性能和vMotion传输时间）。
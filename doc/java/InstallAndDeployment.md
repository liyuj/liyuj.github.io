# 安装和部署
## 1.安装和部署
Ignite对部署没有要求，可以非常容易地部署到私有主机或者任意的云环境，比如，Ignite可以独立部署，也可以部署在Kubernetes或者Docker容器中，还有Apache Mesos以及Hadoop Yarn。它可以运行在物理主机中，也可以部署在虚拟机中。

![](https://files.readme.io/8a65d4a-ignite-deploy.png)

## 2.通过ZIP包安装
安装Ignite的最通用方法是使用每个版本的二进制ZIP压缩文件。

 - 下载Ignite的最新版本的[ZIP压缩包](https://ignite.apache.org/download.cgi#binaries)；
 - 将压缩包解压到某个文件夹；
 - （可选）将`ignite-rest-http`文件夹从`{ignite}/libs/optional`移动到`{ignite}/libs`，以开启Ignite的REST服务，Ignite的Web控制台会使用REST服务进行集群的管理和监控；
 - （可选）配置`IGNITE_HOME`环境变量或者配置Windows的PATH，指向Ignite的安装文件夹，注意路径不能以`/`（Windows中为`\`）结尾。

配置Ignite的工作文件夹：

<code-group>
<code-block title="XML">
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="workDirectory" value="/path/to/work/directory"/>
    <!-- other properties -->
</bean>
```
</code-block>

<code-block title="Java">

```java
IgniteConfiguration igniteCfg = new IgniteConfiguration();
igniteCfg.setWorkDirectory("/path/to/work/directory");
```
</code-block>

</code-group>

## 3.Maven配置
### 3.1.概述
如果项目里用Maven管理依赖，可以单独地导入各个Ignite模块。

::: tip 注意
在下面的例子中，要将`${ignite.version}`替换为实际使用的版本。
:::

::: tip Java 9/10/11
如果使用的是Java 9/10/11，要确认更新了[这里](#_3-2-在jdk9-10-11中运行ignite)描述的JVM启动参数。
:::

### 3.2.常规依赖
Ignite强依赖于`ignite-core.jar`。
```xml
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-core</artifactId>
    <version>${ignite.version}</version>
</dependency>
```
不过很多时候需要其它更多的依赖，比如，要使用Spring配置或者SQL查询等。

下面就是最常用的可选模块：

 - ignite-indexing（可选，如果需要SQL查询）
 - ignite-spring（可选，如果需要spring配置）

```xml
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
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-indexing</artifactId>
    <version>${ignite.version}</version>
</dependency>
```

### 3.3.导入独立模块
可以一个个地导入Ignite模块，唯一必须的就是`ignite-core`，其它的都是可选的，所有可选模块都可以像核心模块一样导入，只是构件Id不同。

现在提供如下模块：

 - `ignite-spring`：基于Spring的配置支持
 - `ignite-indexing`：SQL查询和索引
 - `ignite-geospatial`：地理位置索引
 - `ignite-hibernate`：Hibernate集成
 - `ignite-web`：Web Session集群化
 - `ignite-schedule`：基于Cron的计划任务
 - `ignite-log4j`：Log4j日志
 - `ignite-jcl`：Apache Commons logging日志
 - `ignite-jta`：XA集成
 - `ignite-hadoop2-integration`：HDFS2.0集成
 - `ignite-rest-http`：HTTP REST请求
 - `ignite-scalar`：Ignite Scalar API
 - `ignite-slf4j`：SLF4J日志
 - `ignite-ssh`；SSH支持，远程机器上启动网格节点
 - `ignite-urideploy`：基于URI的部署
 - `ignite-aws`：AWS S3上的无缝集群发现
 - `ignite-aop`：网格支持AOP
 - `ignite-visor-console`：开源的命令行管理和监控工具

::: warning 构件版本
注意，导入若干Ignite模块时，它们的版本号应该相同，比如，如果使用`ignite-core`1.8,所有其它的模块也必须导入1.8版本。
:::

### 3.4.LGPL依赖
下面的Ignite模块有LGPL依赖，因此无法部署到Maven中央仓库：

 - `ignite-hibernate`
 - `ignite-geospatial`
 - `ignite-schedule`

要使用这些模块，需要手工从源代码进行构建然后加入自己的项目，比如，要将`ignite-hibernate`安装到本地库，可以在Ignite的源代码包中运行如下的命令：
```bash
mvn clean install -DskipTests -Plgpl -pl modules/hibernate -am
```

::: tip 第三方仓库
GridGain提供自己的[Maven仓库](http://www.gridgainsystems.com/nexus/content/repositories/external)，包含了Ignite的LGPL构件，比如`ignite-hibernate`。<br>
注意位于GridGain的Maven库中的构件仅仅为了方便使用，并不是官方的Ignite构件。
:::
## 4.RPM和DEB包安装
### 4.1.概述
Ignite可以通过[RPM](https://www.apache.org/dist/ignite/rpm)或者[DEB](https://www.apache.org/dist/ignite/deb)仓库进行安装。

::: warning 确认Linux发行版
Ignite的RPM/DEB包，在如下的Linux发行版中进行了验证：

 - Ubuntu 14.10及以上的版本；
 - Debian 9.3及以上的版本；
 - CentOS 7.4.1708及以上的版本

只要包可以安装，其它的发行版也是支持的。
:::
### 4.2.仓库的配置
配置Ignite的RPM或者DEB仓库，如下所示（如果必要，需要根据提示接受GPG密钥），其中包括了特定发行版的配置：

Debian：
```bash
# Install dirmngr (if not already installed) for apt-key ability to retrieve remote GPG keys
sudo apt update
sudo apt install dirmngr --no-install-recommends
```

<code-group>
<code-block title="RPM">

```bash
sudo bash -c 'cat <<EOF > /etc/yum.repos.d/ignite.repo
[ignite]
name=Apache Ignite
baseurl=http://apache.org/dist/ignite/rpm/
gpgcheck=1
repo_gpgcheck=1
gpgkey=http://apache.org/dist/ignite/KEYS
       http://bintray.com/user/downloadSubjectPublicKey?username=bintray
EOF'
sudo yum check-update
```
</code-block>

<code-block title="DEB">

```bash
sudo bash -c 'cat <<EOF > /etc/apt/sources.list.d/ignite.list
deb http://apache.org/dist/ignite/deb/ apache-ignite main
EOF'
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 379CE192D401AB61
sudo apt update
```
</code-block>

</code-group>

### 4.3.Ignite的安装
安装Ignite的最新版：

<code-group>
<code-block title="RPM">

```bash
sudo yum install apache-ignite
```
</code-block>

<code-block title="DEB">

```bash
sudo apt install apache-ignite --no-install-recommends
```
</code-block>

</code-group>

安装后的结构如下：

|文件夹|映射至|描述|
|---|---|---|
|`/usr/share/apache-ignite`||Ignite安装的根目录|
|`/usr/share/apache-ignite/bin`||二进制文件文件夹（脚本以及可执行程序）|
|`/etc/apache-ignite`|`/usr/share/apache-ignite/config`|默认配置文件|
|`/var/log/apache-ignite`|`/var/lib/apache-ignite/log`|日志目录|
|`/usr/lib/apache-ignite`|`/usr/share/apache-ignite/libs`|核心和可选库|
|`/var/lib/apache-ignite`|`/usr/share/apache-ignite/work`|Ignite的工作目录|
|`/usr/share/doc/apache-ignite`||文档|
|`/usr/share/license/apache-ignite-<version>`||协议|
|`/etc/systemd/system`||`systemd`服务配置|

### 4.4.将Ignite作为服务

::: warning 注意
如果运行于Windows10 WSL或者Docker，那么需要将Ignite作为一个独立的进程（而不是一个服务），具体可以看下面的章节。
:::
用一个配置文件启动一个Ignite节点，可以这样做：`sudo systemctl start apache-ignite@<config_name>`，注意这里的`<config_name>`参数是相对于`/etc/apache-ignite`文件夹的。

运行Ignite服务：
```bash
sudo systemctl start apache-ignite@default-config.xml    # start Ignite service
journalctl -fe                                           # check logs
```
如果要开启随着系统启动而节点自动重启，如下：
```bash
sudo systemctl enable apache-ignite@<config name>
```
### 4.5.将Ignite作为独立进程
使用下面的命令可以将Ignite启动为一个独立的进程（先要切换到`/usr/share/apache-ignite`），如果要修改默认的配置，可以修改`/etc/apache-ignite/default-config.xml`文件。默认的配置会使用组播IP探测器，如果要使用静态IP探测器，需要修改默认的配置文件，具体参见[TCP/IP发现](/doc/java/Clustering.md#_6-1-tcp-ip发现)。

首先，切换到`ignite`用户，如下：
```bash
sudo -u ignite /usr/bin/env bash    # switch to ignite user
```
然后切换到Ignite的bin文件夹，启动一个节点：

<code-group>
<code-block title="默认配置">

```bash
cd /usr/share/apache-ignite         # navigate to Ignite home folder
bin/ignite.sh                       # run Ignite with default configuration
```
</code-block>

<code-block title="自定义配置">

```bash
sudo -u ignite /usr/bin/env bash       # switch to ignite user
cd /usr/share/apache-ignite/bin        # navigate to Ignite bin folder
./ignite.sh <path_to_custom_config>    # start Ignite with custom configuration
```
</code-block>

</code-group>

### 4.6.在Windows10 WSL中运行Ignite
**网络配置**

在Windows 10 WSL环境下运行Ignite，需要对具有高级安全的Windows防御防火墙进行正确的配置：

 - 运行`具有高级安全的Windows防御防火墙`；
 - 选择左侧的`入站规则`菜单；
 - 选择右侧的`新建规则`菜单；
 - 选择`程序`复选框然后点击`下一步`；
 - 在`程序路径`字段中输入`%SystemRoot%\System32\wsl.exe`，然后点击`下一步`；
 - 选择`允许连接`复选框，然后点击`下一步`；
 - 选择`域`、`私有`和`公开`复选框，然后点击`下一步`；
 - 在`名字`字段中输入名字（在`描述`字段中，也可以可选地写一段描述），然后点击`完成`。

这个配置好的规则将允许Windows 10 WSL环境中的Ignite节点暴露于局域网中。

**启动Ignite集群**

由于特殊的网络堆栈实现，如果要在一个Windows10 WSL环境中运行多个节点，需要对配置进行自定义（可以看下面的`wsl-default-config`），启动命令如下：`bin/ignite.sh config/wsl-default-config.xml -J-DNODE=<00..99>`。

wsl-default-config.xml：
```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="placeholderConfig" class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer"/>

    <bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
        <property name="discoverySpi">
            <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
                <property name="localPort" value="475${NODE}"/>
                <property name="ipFinder">
                    <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.multicast.TcpDiscoveryMulticastIpFinder">
                        <property name="addresses">
                            <list>
                                <value>127.0.0.1:47500..47599</value>
                            </list>
                        </property>
                    </bean>
                </property>
            </bean>
        </property>

        <property name="communicationSpi">
            <bean class="org.apache.ignite.spi.communication.tcp.TcpCommunicationSpi">
                <property name="localPort" value="481${NODE}"/>
            </bean>
        </property>

    </bean>
</beans>
```
首先，以`ignite`用户登录，如下：
```bash
sudo -u ignite /usr/bin/env bash
```
然后转到Ignite的主文件夹，然后在本地启动希望数量的节点（最多100）：
```bash
# Navigate to Ignite home folder
cd /usr/share/apache-ignite

# Run several local nodes
bin/ignite.sh config/wsl-default-config.xml -J-DNODE=00 &
bin/ignite.sh config/wsl-default-config.xml -J-DNODE=01 &
...
bin/ignite.sh config/wsl-default-config.xml -J-DNODE=99 &
```
## 5.Docker部署
Docker可以将Ignite应用及其所有的依赖打包进一个标准的容器，Docker会自动下载Ignite二进制包，将用户的库文件部署进Ignite以及配置节点，它还可以自动启动配置好的Ignite节点，这样的集成方式，使得通过简单地重启Ignite的Docker容器就可以部署新的代码。

要运行一个Docker容器，需要拉取和启动一个Docker镜像，默认会下载最新的版本，在[这里](https://hub.docker.com/r/apacheignite/ignite/tags)可以看到完整的标签列表。
### 5.1.下载Ignite的Docker镜像
使用下面的命令，可以拉取Ignite的Docker镜像：
```shell
# Pull latest version.
sudo docker pull apacheignite/ignite

# Pull a specific Ignite version {ignite-version}
sudo docker pull apacheignite/ignite:{ignite-version}
```
### 5.2.以内存集群模式运行Ignite的Docker镜像
使用下面的命令可以运行Ignite的Docker镜像：
```shell
# Run latest version.
sudo docker run -it --net=host \
-e "CONFIG_URI=$CONFIG_URI" \
-e "OPTION_LIBS=$OPTION_LIBS" \
-e "JVM_OPTS=$JVM_OPTS" \
apacheignite/ignite

# Run a specific Ignite version
sudo docker run -it --net=host \
-e "CONFIG_URI=$CONFIG_URI" \
-e "OPTION_LIBS=$OPTION_LIBS" \
-e "JVM_OPTS=$JVM_OPTS" \
apacheignite/ignite:{ignite-version}
```
下面的配置参数在docker容器中可以通过环境变量进行传递：

|名称|描述|默认|示例|
|---|---|---|---|
|`CONFIG_URI`|Ignite配置文件的URL（也可以相对于类路径的META-INF文件夹），下载的配置文件会保存于`./ignite-config.xml`|无|[https://raw.githubusercontent.com/apache/ignite/master/examples/config/example-cache.xml](https://raw.githubusercontent.com/apache/ignite/master/examples/config/example-cache.xml)|
|`OPTION_LIBS`|会被包含在类路径中的可选库|`ignite-log4j, ignite-spring,ignite-indexing`|`ignite-aws,ignite-aop`|
|`JVM_OPTS`|通过docker命令传递给ignite实例的环境变量。|无|`-Xms1g -Xmx1g -server -XX:+AggressiveOpts -XX:MaxPermSize=256m`|
|`EXTERNAL_LIBS`|库文件URL列表|无|`http://central.maven.org/maven2/io/undertow/undertow-servlet/1.3.10.Final/undertow-servlet-1.3.10.Final.jar,http://central.maven.org/maven2/io/undertow/undertow-build-config/1.0.0.Beta24/undertow-build-config-1.0.0.Beta24.jar`|

### 5.3.以持久化集群模式运行Ignite的Docker镜像
如果要使用Ignite的[持久化](/doc/java/Persistence.md)，Ignite会将用户的数据保存在容器文件系统的默认工作目录（`{IGNITE_HOME}/work`）下，如果重启容器，该目录会被清空，要避免这个问题，可以这样做：

 - 使用一个持久化卷来保存数据；
 - 加载一个本地目录。

下面会详细描述这两个选项：

**使用持久化卷**

使用下面的命令可以创建一个持久化卷：
```shell
sudo docker volume create persistence-volume
```
在运行Ignite的Docker镜像时，可以将该卷加载到一个特定的目录中，这个目录需要传入Ignite，这可以通过两种方式实现：

 - 使用`IGNITE_WORK_DIR`系统属性；
 - 在节点的配置文件中。

下面的命令会启动Ignite的Docker镜像，然后通过系统属性将工作目录传给Ignite：
```shell
docker run -d \
  -v persistence-volume:/persistence \
  -e IGNITE_WORK_DIR=/persistence \
  apacheignite/ignite

```
如果希望通过XML配置文件或者编程的方式配置工作目录，可以通过配置`IgniteConfiguration.workDirectory`属性实现，一定要注意该属性的值要与上面的`docker run`命令的`-v`参数值相一致。

**使用本地目录**

如果不创建卷，也可以将一个本地目录加载到运行Ignite镜像的容器中，然后使用这个目录存储持久化数据。当使用相同的命令重启容器时，Ignite会加载已有的数据。
```shell
mkdir ignite_work_dir
docker run -d \
  -v ${PWD}/ignite_work_dir:/persistence \
  -e IGNITE_WORK_DIR=/persistence \
  apacheignite/ignite
```
`-v`参数会在容器的`/persistence`目录下加载一个本地目录，`-e IGNITE_WORK_DIR=/persistence`选项会通知Ignite将这个目录作为工作目录。

### 5.4.示例
要启动Ignite的docker容器，可以使用如下的命令：
```bash
sudo docker run -it --net=host -e "CONFIG_URI=https://raw.githubusercontent.com/apache/ignite/master/examples/config/example-cache.xml" apacheignite/ignite
```
之后应该看到如下的输出日志：

![](https://files.readme.io/ryYtMcSCuGiyVcXN1GCw_dock_git_repo.png)

## 6.AWS部署
Ignite的AMI（Amazon机器镜像）可以通过AWS的EC2管理控制台快速配置和部署一个简单的Ignite集群。
### 6.1.Amazon EC2部署

 - 点击下表的链接选择必要的区域：

|区域|镜像|
|---|---|
|`US-WEST`|[ami-9cdbb3fc](https://console.aws.amazon.com/ec2/home?region=us-west-1#launchAmi=ami-9cdbb3fc)|
|`US-EAST`|[ami-ce82caa4](https://console.aws.amazon.com/ec2/home?region=us-east-1#launchAmi=ami-ce82caa4)|
|`EU-CENTRAL`|[ami-191b0775](https://console.aws.amazon.com/ec2/home?region=eu-central-1#launchAmi=ami-191b0775)|

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
## 7.Google计算部署
Ignite的镜像可以通过Google计算控制台快速配置和部署一个简单的Ignite集群。
### 7.1.Google计算部署

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
## 8.Mesos部署
### 8.1.概述
Apache Ignite支持在Mesos集群上调度和运行Ignite节点。

Apache Mesos是一个集群管理器，它提供了一个通用运行环境以及所有的必要资源来部署、运行和管理分布式应用。它对资源的管理和隔离有助于充分利用服务器资源。

要了解Apache Mesos的更多信息，请参照：[http://mesos.apache.org/](http://mesos.apache.org/)

### 8.2.Ignite Mesos框架
常规部署Apache Ignite集群需要下载Apache Ignite二进制包，修改配置参数以及启动节点。Apache Ignite Mesos框架由`调度器`和`任务`组成，可以极大地简化集群的部署。

 - `调度器`：调度器启动时将自己在Mesos主节点上注册，注册成功之后调度器就会开始处理从Mesos主节点到使用资源的Ignite节点的资源请求，调度器会维护Ignite集群所需（并且可用）的所有资源水平（CPU，内存等）；
 - `任务`：在Mesos从节点上启动Ignite节点。

### 8.3.运行Ignite Mesos框架
要运行Ignite Mesos框架需要配置好的正在运行的Apache Mesos集群，如果需要如何Apache Mesos集群的信息，请参照：[https://docs.mesosphere.com/getting-started/datacenter/install/](https://docs.mesosphere.com/getting-started/datacenter/install/)。

::: warning 注意
确保主节点和从节点监听正确的IP地址，否则无法保证Mesos集群工作正常。
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
    "http://host/ignite-mesos-<ignite-version>.jar"
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
  "cmd": "java -jar ignite-mesos-<ignite-version>.jar"
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
 - Mesos支持通过浏览器获得任务的日志，要查看Ignition的日志可以点击`Active Tasks`表格中的`Sandbox`；
![](https://files.readme.io/qUqG485tRtKS50JCp7yn_mesos_sandbox.png)
 - 点击`stdout`获取标准输出日志，`stderr`获取标准错误日志；
![](https://files.readme.io/Ch5VkVm1Q5qGvrGEYF4k_mesos_sandbox_stdout.png)

**通过jar文件运行框架**

 - 下载Ignite包然后打开`libs\optional\ignite-mesos\`文件夹；
 - 使用如下命令运行框架：
```shell
java -jar ignite-mesos-<ignite-version>.jar
```
或者：
```shell
java -jar ignite-mesos-<ignite-version>.jar properties.prop
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
 - 为了确保Apache Mesos框架部署正确，可以打开Mesos控制台`http://<marathon-ip>:5050`，如果一切正常，名字类似`Ignite node N`的任务状态应该是`Running`。在本示例中N=1，可以看示例中的`properties.prop`文件-"IGNITE_NODE_COUNT": "1"；
![](https://files.readme.io/eEmfch9cQcSQiM27gSqT_Mesos_console.png)
 - Mesos可以通过浏览器获得任务的日志，要查看Ignition的日志，可以点击`Sandbox`；
![](https://files.readme.io/s6fvlxNcQz66nhq8e9zH_Sandbox.png)
 - 点击`stdout`获取标准输出日志，`stderr`获取标准错误日志；
![](https://files.readme.io/MEksCWXBTRq5WpUyp4CJ_stdout.png)

### 8.4.配置
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

## 9.Yarn部署
### 9.1.概述
与Yarn的集成可以支持在Yarn集群上调度和运行Apache Ignite节点。

Yarn是一个资源管理器，它提供了一个包括所有必要资源的通用的运行环境来进行分布式应用的部署，运行和管理，它对资源的管理和隔离有助于充分利用服务器资源。

要了解Yarn的信息，请参照[http://hadoop.apache.org/docs/current/hadoop-yarn/hadoop-yarn-site/YARN.html](http://hadoop.apache.org/docs/current/hadoop-yarn/hadoop-yarn-site/YARN.html)。

### 9.2.Ignite Yarn应用
部署Apache Ignite集群的典型步骤是下载Ignite的二进制包，修改配置文件以及启动节点。与Yarn的集成可以避免这些操作，Ignite Yarn应用可以极大的简化集群的部署，它由如下组件组成：

 - 下载Ignite二进制包，将必要的资源放入HDFS，创建启动任务的必要的上下文，启动`ApplicationMaster`进程；
 - `Application master`：注册成功之后组件就会开始处理从资源管理器到使用资源的Ignite节点的资源请求，`Application master`会维护Ignite集群所需的所有资源水平（CPU，内存等）；
 - `Container`：在从节点上运行Ignite节点的实体；

### 9.3.运行Ignite Yarn应用
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

# URL where Ignite distribution can be downloaded from
IGNITE_URL=http://mirror.linux-ia64.org/apache/ignite/2.7.0/apache-ignite-2.7.0-bin.zip

# You can also provide a path to unzipped Ignite distribution instead of the URL
# IGNITE_PATH=/ignite/apache-ignite-2.7.0-bin
```

 - 运行应用；
```bash
yarn jar ignite-yarn-<ignite-version>.jar ./ignite-yarn-<ignite-version>.jar cluster.properties
```
 - 为了确保应用正确部署，可以打开Yarn控制台`http://<hostname>:8088/cluster`，看名字为`Ignition`的应用是否工作正常；
![](https://files.readme.io/ISnxYZaaSyWC3Z6VP54H_AllApp.png)
 - 可以从浏览器获得日志，要查看日志可以点击任意容器的`Logs`；
![](https://files.readme.io/y0U5GlGoTUeSl3qc8iMQ_ContainerLogs.png)
 - 点击`stdout`获取标准输出日志，`stderr`获取标准错误日志；
![](https://files.readme.io/a3e8yeROWckIihHTWTwp_ContainerStdout.png)

### 9.4.配置
所有的配置都是通过环境变量和属性文件进行的，下面的配置参数可以根据需要进行配置：

|名称|描述|默认值|示例|
|---|---|---|---|
|`IGNITE_XML_CONFIG`|指向Apache Ignite配置文件的HDFS路径|无|/opt/ignite/ignite-config.xml|
|`IGNITE_WORKING_DIR`|用于保存Ignite二进制包的目录|./ignite-release|/opt/ignite/|
|`IGNITE_RELEASES_DIR`|保存Ignite二进制包的HDFS路径|/ignite/releases/|/ignite-rel/|
|`IGNITE_USERS_LIBS`|要添加到CLASSPATH的库文件的HDFS路径|无|/opt/libs/|
|`IGNITE_MEMORY_PER_NODE`|每个Ignite节点占用的内存的大小（M），这个是Java堆的大小，包括了堆内缓存（如果使用了堆内缓存）。|2048|1024|
|`IGNITE_MEMORY_OVERHEAD_PER_NODE`|所有数据区必要的内存量，包括用于处理JVM本身的负载、用于存储数据的节点，都需要调整，不仅仅是计算。YARN用于容器运行Ignite节点的必要内存量是IGNITE_MEMORY_PER_NODE和IGNITE_MEMORY_OVERHEAD_PER_NODE之和。|IGNITE_MEMORY_PER_NODE * 0.10，最小值384|17408|
|`IGNITE_HOSTNAME_CONSTRAINT`|从节点约束|无|192.168.0.[1-100]|
|`IGNITE_NODE_COUNT`|集群节点的数量|3|10|
|`IGNITE_RUN_CPU_PER_NODE`|每个Ignite节点的CPU核数|2|4|
|`IGNITE_VERSION`|节点上运行的Ignite版本|latest|1.0.5|
|`IGNITE_PATH`|到Ignite二进制包的HDFS路径，当YARN集群运行在内网无法访问互联网时，这个属性很有用。|无|/ignite/apache-ignite-fabric-1.7.0-bin.zip|
|`IGNITE_URL`|用于下载Ignite二进制包的地址，对于2.7版本，IGNITE_PATH或者IGNITE_URL是必须要有的|无|`http://mirror.linux-ia64.org/apache/ignite/2.7.0/apache-ignite-2.7.0-bin.zip`|
|`IGNITE_JVM_OPTS`|JVM参数|无|-XX:+PrintGC|

## 10.VMWare部署
### 10.1.概述
Ignite可以部署于VMWare管理的虚拟和云环境，没有什么和VMWare有关的特性，不过建议将Ignite实例绑定到一个单一专用的主机，这样可以：

 - 避免当Ignite实例与其它应用程序争用主机资源时，导致Ignite集群的性能出现峰值；
 - 确保高可用，如果一台主机宕机并且有两个或者多个Ignite服务端节点绑定到上面，那么可能导致数据丢失。

下面的内容会说明和Ignite节点迁移有关的vMotion的使用。
### 10.2.使用vMotion进行节点迁移
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

<RightPane/>
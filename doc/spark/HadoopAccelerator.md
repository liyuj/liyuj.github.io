# 3.Hadoop加速器
## 3.1.Hadoop加速器
Ignite Hadoop加速器提供了一个组件集来进行内存Hadoop作业执行以及文件系统操作。
### 3.1.1.MapReduce
Hadoop加速器提供了一个高性能的作业跟踪器实现，替代了标准的Hadoop MapReduce，使用它可以提高Hadoop MapReduce作业执行的性能。
### 3.1.2.IGFS-内存文件系统
Hadoop加速器提供了一个Hadoop`FileSystem`实现，它通过分布式Ignite文件系统(`IGFS`)在内存内存储文件系统数据，使用它可以最小化磁盘IO以及改进任何文件系统操作的性能。
### 3.1.3.二级文件系统
Hadoop加速器提供了一个`SecondaryFileSystem`的实现，这个实现可以注入已有的IGFS以在任何其它的Hadoop`FileSystem`实现上进行通读和通写操作（比如HDFS）。如果希望在基于磁盘的`HDFS`或者任何其它的Hadoop兼容文件系统上建立一个内存缓存层，那么可以使用它。
### 3.1.4.支持的Hadoop发行版
Ignite Hadoop加速器可以用于一系列的Hadoop发行版，每个发行版都需要一个特定的安装步骤。
## 3.2.MapReduce
Ignite内存MapReduce可以有效地对存储在任何Hadoop文件系统上的数据进行并行处理，它在提供了低延迟，HPC样式的分布式处理的同时还消除了与标准Hadoop架构中的作业跟踪器和任务跟踪器有关的开销。内存内的MapReduce对于强CPU需求的任务提供了令人激动的性能，而仅仅需要对已有的应用进行很小的改动。

![](https://files.readme.io/03b5cde-hadoop_sequence-1.png)
### 3.2.1.配置Ignite
Ignite Hadoop加速器MapReduce引擎在Ignite集群中处理Hadoop作业，必须满足若干前提条件：

 - 必须设置`IGNITE_HOME`环境变量并且指向Ignite的安装根目录；
 - 每个集群节点在类路径中必须包含Hadoop的jar文件，可以参照Ignite针对各个Hadoop发行版的安装向导来了解详细信息；
 - 集群节点通过监听特定的Socket来接收作业执行的请求。每个Ignite节点默认都会监听来自`127.0.0.1:11211`的请求，可以通过`ConnectorConfiguration`类来改写默认的主机和端口。
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  ...
  <property name="connectorConfiguration">
    <list>
      <bean class="org.apache.ignite.configuration.ConnectorConfiguration">
        <property name="host" value="myHost" />
        <property name="port" value="12345" />        
      </bean>
    </list>    
  </property>
</bean>
```
### 3.2.2.运行Ignite
配置Ignite节点后用如下方法启动：
```bash
$ bin/ignite.sh
```
### 3.2.3.配置Hadoop
要通过Ignite作业跟踪器运行Hadoop作业需要满足一些必要条件：

 - 必须设置`IGNITE_HOME`环境变量并且指向Ignite的安装根目录；
 - Hadoop在类路径中必须包含Ignite Jars:`${IGNITE_HOME}\libs\ignite-core-[version].jar`以及`${IGNITE_HOME}\libs\hadoop\ignite-hadoop-[version].jar`，这可以通过几种方式实现：
    - 将这几个jar文件加入`HADOOP_CLASSPATH`环境变量中；
    - 将这些jar文件拷贝或者建立符号链接到Hadoop存放共享库的文件夹中，可以参照Ignite针对各个Hadoop发行版的安装向导来了解详细信息；
 - Hadoop作业必须配置使用Ignite作业跟踪器，有两个配置属性负责这个：
     - `mapreduce.framework.name`：必须设置为`ignite`；
     - `mapreduce.jobtracker.address`：必须设置为Ignite节点监听的主机/端口；

这仍然可以通过几种方式实现，**第一**，可以创建独立的带有这些配置属性的`mapred-site.xml`文件然后将其用于作业执行：
```xml
<configuration>
  ...
  <property>
    <name>mapreduce.framework.name</name>
    <value>ignite</value>
  </property>
  <property>
    <name>mapreduce.jobtracker.address</name>
    <value>127.0.0.1:11211</value>
  </property>
  ...
</configuration>
```
**第二**，可以覆写Hadoop安装的`mapred-site.xml`，这会强制所有Hadoop作业默认选择Ignite作业跟踪器，除非通过某种方式在作业级覆写。

**第三**，可以为特定的作业通过编程方式设置这些属性：
```java
Configuration conf = new Configuration();
...
conf.set(MRConfig.FRAMEWORK_NAME,  IgniteHadoopClientProtocolProvider.FRAMEWORK_NAME);
conf.set(MRConfig.MASTER_ADDRESS, "127.0.0.1:11211);
...
Job job = new Job(conf, "word count");
...
```
### 3.2.4.运行Hadoop
如何运行一个作业取决于如何配置Hadoop：

如果配置了独立的`mapred-site.xml`：
```bash
hadoop --config [path_to_config] [arguments]
```
如果修改了默认的`mapred-site.xml`，那么`--config`选项就不是必要的了：
```bash
hadoop [arguments]
```
如果通过编程方式启动作业，那么像下面这样提交它：
```java
...
Job job = new Job(conf, "word count");
...
job.submit();
```
## 3.3.在Apache Hadoop上安装
本章节描述了如何在Apache Hadoop发行版上安装Ignite Hadoop加速器。

安装由如下的主要步骤组成：

 - 将Ignite的jar加入Hadoop的类路径；
 - 启动Ignite节点；
 - 向Hadoop传递正确的配置。

### 3.3.1.Ignite

 - 下载最新版本的Ignite Hadoop加速器然后解压到某处；
 - 设置`IGNITE_HOME`环境变量，指向上一步Ignite Hadoop加速器的解压目录；
 - 确保`HADOOP_HOME`环境变量设置正确，这对于Ignite查找必须的Hadoop的类是必要的；
 - 如果希望从HDFS中缓存数据需要配置二级文件系统，打开` $IGNITE_HOME/config/default-config.xml`，将`secondaryFileSystem`属性的注释去掉，然后设置正确的`HDFS`URI。
```xml
<bean class="org.apache.ignite.configuration.FileSystemConfiguration">
  ...
  <property name="secondaryFileSystem">
    <bean class="org.apache.ignite.hadoop.fs.IgniteHadoopIgfsSecondaryFileSystem">
      <property name="fileSystemFactory">
        <bean class="org.apache.ignite.hadoop.fs.CachingHadoopFileSystemFactory">
          <property name="uri" value="hdfs://your_hdfs_host:9000/"/>
        </bean>
      </property>
    </bean>
  </property>
</bean>
```
如果需要，也可以向文件系统工厂传递额外的Hadoop配置文件：
```xml
<bean class="org.apache.ignite.hadoop.fs.CachingHadoopFileSystemFactory">
  <property name="uri" value="hdfs://your_hdfs_host:9000/"/>
  <property name="configPaths">
    <list>
      <value>/path/to/core-site.xml</value>
    </list>
  </property>
</bean>
```
 - 到这一步，Ignite节点已经配置好可以启动了：
```bash
$IGNITE_HOME/bin/ignite.sh
```
### 3.3.2.Hadoop

 - 确保设置`IGNITE_HOME`环境变量，指向Ignite Hadoop加速器的解压目录；
 - 拷贝或者符号链接Ignite的jar文件到Hadoop的类路径，这可以使Hadoop在运行时加载Ignite的类；
```bash
cd $HADOOP_HOME/share/hadoop/common/lib
ln -s $IGNITE_HOME/libs/ignite-core-[version].jar
ln -s $IGNITE_HOME/libs/ignite-shmem-1.0.0.jar
ln -s $IGNITE_HOME/libs/ignite-hadoop/ignite-hadoop-[version].jar
```
 - 创建Hadoop配置；

Hadoop会根据配置文件，分别为`core-site.xml`和`mapred-site.xml`，确定使用那个文件系统和作业跟踪器。

设置这个配置的建议方式是创建单独的目录，拷贝已有的`core-site.xml`和`mapred-site.xml`文件到那里，然后应用必要的配置变更，比如：
```bash
mkdir ~/ignite_conf
cd ~/ignite_conf
cp $HADOOP_HOME/etc/hadoop/core-site.xml .
cp $HADOOP_HOME/etc/hadoop/mapred-site.xml .
```
如果要使用IGFS，需要在`core-site.xml`中添加类名映射：
```xml
<configuration>
  ...
  <property>
    <name>fs.igfs.impl</name>
    <value>org.apache.ignite.hadoop.fs.v1.IgniteHadoopFileSystem</value>
  </property>
  <property>
    <name>fs.AbstractFileSystem.igfs.impl</name>
    <value>org.apache.ignite.hadoop.fs.v2.IgniteHadoopFileSystem</value>
  </property> 
  ...
</configuration>
```
如果要使用IGFS作为默认的文件系统（即没有`igfs://`前缀），那么应该设置`core-site.xml`中的`fs.defaultFS`属性：
```xml
<configuration>
  ...
  <property>
    <name>fs.defaultFS</name>
    <value>igfs://igfs@/</value>
  </property>
  ...
</configuration>
```
如果希望使用Ignite的Hadoop加速器用于MapReduce作业，那么应该将`mapred-site.xml`指向正确的作业跟踪器：
```xml
<configuration>
  ...
  <property>
    <name>mapreduce.framework.name</name>
    <value>ignite</value>
  </property>
  <property>
    <name>mapreduce.jobtracker.address</name>
    <value>[your_host]:11211</value>
  </property>
  ...
</configuration>
```
作为替代，也可以使用Ignite发行版自带的配置文件，位于`$IGNITE_HOME/config/hadoop`目录。
### 3.3.3.使用Ignite Hadoop加速器
到这一步安装已经完成然后就可以启动运行作业或者处理IGFS了。

查询IGFS：
```bash
hadoop --config ~/ignite_conf fs -ls /
```
运行一个作业：
```bash
hadoop --config ~/ignite_conf jar [your_job]
```

## 3.4.在Cloudera CDH上安装
本章节描述了如何在Cloudera CDH发行版上安装Ignite Hadoop加速器。

安装由如下的主要步骤组成：

 - 将Ignite的jar加入Hadoop的类路径；
 - 启动Ignite节点；
 - 向Hadoop传递正确的配置。

### 3.4.1.Ignite

 - 下载最新版本的Ignite Hadoop加速器然后解压到某处；
 - 设置`IGNITE_HOME`环境变量，指向上一步Ignite Hadoop加速器的解压目录；
 - 确保正确设置了如下的Hadoop环境变量，假定CDH安装于`usr/lib`目录：
```bash
export HADOOP_HOME=/usr/lib/hadoop/
export HADOOP_COMMON_HOME=/usr/lib/hadoop/
export HADOOP_HDFS_HOME=/usr/lib/hadoop-hdfs/ 
export HADOOP_MAPRED_HOME=/usr/lib/hadoop-mapreduce/
```
 - 如果希望从HDFS中缓存数据，需要配置二级文件系统，打开` $IGNITE_HOME/config/default-config.xml`，取消`secondaryFileSystem`属性的注释并且设置正确的`HDFS`URI：
```xml
<bean class="org.apache.ignite.configuration.FileSystemConfiguration">
  ...
  <property name="secondaryFileSystem">
    <bean class="org.apache.ignite.hadoop.fs.IgniteHadoopIgfsSecondaryFileSystem">
      <property name="fileSystemFactory">
        <bean class="org.apache.ignite.hadoop.fs.CachingHadoopFileSystemFactory">
          <property name="uri" value="hdfs://your_hdfs_host:8020"/>
        </bean>
      </property>
    </bean>
  </property>
</bean>
```
如果需要，也可以给文件系统工厂传递额外的Hadoop配置文件：
```xml
<bean class="org.apache.ignite.hadoop.fs.CachingHadoopFileSystemFactory">
  <property name="uri" value="hdfs://your_hdfs_host:9000"/>
  <property name="configPaths">
    <list>
      <value>/path/to/core-site.xml</value>
    </list>
  </property>
</bean>
```
 - 到这一步，Ignite已经配置好了：
```bash
$IGNITE_HOME/bin/ignite.sh
```
### 3.4.2.CDH

 - 确保设置IGNITE_HOME环境变量，指向Ignite Hadoop加速器的解压目录；
 - 拷贝或者符号链接Ignite的jar文件到Hadoop的类路径，这可以使Hadoop在运行时加载Ignite的类；
```bash
cd /usr/lib/hadoop/lib
ln -s $IGNITE_HOME/libs/ignite-core-[version].jar
ln -s $IGNITE_HOME/libs/ignite-shmem-1.0.0.jar
ln -s $IGNITE_HOME/libs/ignite-hadoop/ignite-hadoop-[version].jar
```
 - 创建Hadoop配置；

Hadoop会根据配置文件，分别为`core-site.xml`和`mapred-site.xml`，确定使用那个文件系统和作业跟踪器。

设置这个配置的建议方式是创建单独的目录，拷贝已有的`core-site.xml`和`mapred-site.xml`文件到那里，然后应用必要的配置变更，比如：
```bash
mkdir ~/ignite_conf
cd ~/ignite_conf
cp /usr/hdp/current/hadoop-client/etc/core-site.xml .
cp /usr/hdp/current/hadoop-client/etc/mapred-site.xml .
```
如果要使用IGFS，需要在`core-site.xml`中添加类名映射：
```xml
<configuration>
  ...
  <property>
    <name>fs.igfs.impl</name>
    <value>org.apache.ignite.hadoop.fs.v1.IgniteHadoopFileSystem</value>
  </property>
  <property>
    <name>fs.AbstractFileSystem.igfs.impl</name>
    <value>org.apache.ignite.hadoop.fs.v2.IgniteHadoopFileSystem</value>
  </property> 
  ...
</configuration>
```
如果要使用IGFS作为默认的文件系统（即没有`igfs://`前缀），那么应该设置`core-site.xml`中的`fs.defaultFS`属性：
```xml
<configuration>
  ...
  <property>
    <name>fs.defaultFS</name>
    <value>igfs://igfs@/</value>
  </property>
  ...
</configuration>
```
如果希望使用Ignite的Hadoop加速器用于MapReduce作业，那么应该将`mapred-site.xml`指向正确的作业跟踪器：
```xml
<configuration>
  ...
  <property>
    <name>mapreduce.framework.name</name>
    <value>ignite</value>
  </property>
  <property>
    <name>mapreduce.jobtracker.address</name>
    <value>[your_host]:11211</value>
  </property>
  ...
</configuration>
```
作为替代，也可以使用Ignite发行版自带的配置文件，位于`$IGNITE_HOME/config/hadoop`目录。
### 3.4.3.使用Ignite Hadoop加速器
到这一步安装已经完成然后就可以启动运行作业或者处理IGFS了。

查询IGFS：
```bash
hadoop --config ~/ignite_conf fs -ls /
```
运行一个作业：
```bash
hadoop --config ~/ignite_conf jar [your_job]
```
## 3.5.在Hortonworks HDP上安装
本章节描述了如何在Hortonworks HDP发行版上安装Ignite Hadoop加速器。

安装由如下的主要步骤组成：

 - 将Ignite的jar加入Hadoop的类路径；
 - 启动Ignite节点；
 - 向Hadoop传递正确的配置。

### 3.5.1.Ignite

 - 下载最新版本的Ignite Hadoop加速器然后解压到某处；
 - 设置`IGNITE_HOME`环境变量，指向上一步Ignite Hadoop加速器的解压目录；
 - 确保正确设置了如下的Hadoop环境变量，假定HDP安装于`usr/hdp/current`目录：
```bash
export HADOOP_HOME=/usr/hdp/current/
export HADOOP_COMMON_HOME=/usr/hdp/current/hadoop-client/
export HADOOP_HDFS_HOME=/usr/hdp/current/hadoop-hdfs-client/ 
export HADOOP_MAPRED_HOME=/usr/hdp/current/hadoop-mapreduce-client/
```
 - 如果希望从HDFS中缓存数据，需要配置二级文件系统，打开` $IGNITE_HOME/config/default-config.xml`，取消`secondaryFileSystem`属性的注释并且设置正确的`HDFS`URI：
```xml
<bean class="org.apache.ignite.configuration.FileSystemConfiguration">
  ...
  <property name="secondaryFileSystem">
    <bean class="org.apache.ignite.hadoop.fs.IgniteHadoopIgfsSecondaryFileSystem">
      <property name="fileSystemFactory">
        <bean class="org.apache.ignite.hadoop.fs.CachingHadoopFileSystemFactory">
          <property name="uri" value="hdfs://your_hdfs_host:9000"/>
        </bean>
      </property>
    </bean>
  </property>
</bean>
```
如果需要，也可以给文件系统工厂传递额外的Hadoop配置文件：
```xml
<bean class="org.apache.ignite.hadoop.fs.CachingHadoopFileSystemFactory">
  <property name="uri" value="hdfs://your_hdfs_host:9000"/>
  <property name="configPaths">
    <list>
      <value>/path/to/core-site.xml</value>
    </list>
  </property>
</bean>
```
 - 到这一步，Ignite已经配置好了：
```bash
$IGNITE_HOME/bin/ignite.sh
```
### 3.5.2.HDP

 - 确保设置IGNITE_HOME环境变量，指向Ignite Hadoop加速器的解压目录；
 - 拷贝或者符号链接Ignite的jar文件到Hadoop的类路径，这可以使Hadoop在运行时加载Ignite的类；
```bash
cd /usr/hdp/current/hadoop-client/lib
ln -s $IGNITE_HOME/libs/ignite-core-[version].jar
ln -s $IGNITE_HOME/libs/ignite-shmem-1.0.0.jar
ln -s $IGNITE_HOME/libs/ignite-hadoop/ignite-hadoop-[version].jar
```
 - 创建Hadoop配置；
Hadoop会根据配置文件，分别为`core-site.xml`和`mapred-site.xml`，确定使用那个文件系统和作业跟踪器。

设置这个配置的建议方式是创建单独的目录，拷贝已有的`core-site.xml`和`mapred-site.xml`文件到那里，然后应用必要的配置变更，比如：
```bash
mkdir ~/ignite_conf
cd ~/ignite_conf
cp /usr/hdp/current/hadoop-client/etc/core-site.xml .
cp /usr/hdp/current/hadoop-client/etc/mapred-site.xml .
```
如果要使用IGFS，需要在`core-site.xml`中添加类名映射：
```xml
<configuration>
  ...
  <property>
    <name>fs.igfs.impl</name>
    <value>org.apache.ignite.hadoop.fs.v1.IgniteHadoopFileSystem</value>
  </property>
  <property>
    <name>fs.AbstractFileSystem.igfs.impl</name>
    <value>org.apache.ignite.hadoop.fs.v2.IgniteHadoopFileSystem</value>
  </property> 
  ...
</configuration>
```
如果要使用IGFS作为默认的文件系统（即没有`igfs://`前缀），那么应该设置`core-site.xml`中的`fs.defaultFS`属性：
```xml
<configuration>
  ...
  <property>
    <name>fs.defaultFS</name>
    <value>igfs://igfs@/</value>
  </property>
  ...
</configuration>
```
如果希望使用Ignite的Hadoop加速器用于MapReduce作业，那么应该将`mapred-site.xml`指向正确的作业跟踪器：
```xml
<configuration>
  ...
  <property>
    <name>mapreduce.framework.name</name>
    <value>ignite</value>
  </property>
  <property>
    <name>mapreduce.jobtracker.address</name>
    <value>[your_host]:11211</value>
  </property>
  ...
</configuration>
```
作为替代，也可以使用Ignite发行版自带的配置文件，位于`$IGNITE_HOME/config/hadoop`目录。
### 3.5.3.使用Ignite Hadoop加速器
到这一步安装已经完成然后就可以启动运行作业或者处理IGFS了。

查询IGFS：
```bash
hadoop --config ~/ignite_conf fs -ls /
```
运行一个作业：
```bash
hadoop --config ~/ignite_conf jar [your_job]
```
## 3.6.Ignite和Apache Hive
本章节描述如果在经过Ignite加速后的Hadoop上正确配置和启动Hive，还显示了通过这样的配置如何启动HiveServer2以及一个远程客户端。
### 3.6.1.前提条件
假定Hadoop已经安装和配置好以运行在Ignite上，然后配置了IGFS文件系统以及MapReduce作业跟踪器功能的Ignite节点也已经启动运行。

还需要安装[Hive](http://hive.apache.org/)。
### 3.6.2.启动Hive
下面是在`Ignited`的Hadoop上运行Hive的必要步骤：

 - 提供可执行的`Hadoop`的正确位置，这个可以通过将可执行文件的路径加入`PATH`环境变量（注意可执行的文件大都位于一个叫做`bin/`的文件夹），或者通过指定`HADOOP_HOME`环境变量实现；
 - 提供配置文件的位置（`core-site.xml`,`hive-site.xml`,`mapred-site.xml`），这个可以通过将这些文件放入一个目录然后将该目录的路径作为`HIVE_CONF_DIR`环境变量值来实现。

> **配置模板**
建议使用Hive模板配置文件`<IGNITE_HOME>/config/hadoop/hive-site.ignite.xml`来获得Ignite指定的设置。

> 有一个与Hive和Hadoop中的不同`jline`库版本有关的潜在[问题](http://stackoverflow.com/questions/28997441/hive-startup-error-terminal-initialization-failed-falling-back-to-unsupporte)，它可以通过设置`HADOOP_USER_CLASSPATH_FIRST=true`环境变量来解决。

为了方便，也可以创建一个简单的脚本来正确地设置所有必要的变量然后启动Hive，像下面这样：
```bash
# Specify Hive home directory:
export HIVE_HOME=<Hive installation directory>

# Specofy configuration files location:
export HIVE_CONF_DIR=<Path to our configuration folder>

# If you did not set hadoop executable in PATH, specify Hadoop home explicitly:
export HADOOP_HOME=<Hadoop installation folder>

# Avoid problem with different 'jline' library in Hadoop: 
export HADOOP_USER_CLASSPATH_FIRST=true

${HIVE_HOME}/bin/hive "${@}"
```
这个脚本可以用于在交互式控制台上启动Hive：
```bash
$ hive-ig cli
hive> show tables;
OK
u_data
Time taken: 0.626 seconds, Fetched: 1 row(s)
hive> quit;
$
```
### 3.6.3.启动HiveServer2
如果为了增强的客户端功能希望使用[HiveServer2](https://cwiki.apache.org/confluence/display/Hive/Setting+Up+HiveServer2)，要启动它也可以使用上面创建的脚本。
```bash
hive-ig --service hiveserver2
```
服务启动之后，可以使用任何有效的[客户端](https://cwiki.apache.org/confluence/display/Hive/HiveServer2+Clients)（比如beeline）连接它。作为一个远程客户端，`beeline`可以在任意主机运行，它也不需要任何特别的环境来与`Ignited`Hive一起工作，下面是示例：
```bash
$ ./beeline 
Beeline version 1.2.1 by Apache Hive
beeline> !connect jdbc:hive2://localhost:10000 scott tiger org.apache.hive.jdbc.HiveDriver
Connecting to jdbc:hive2://localhost:10000
Connected to: Apache Hive (version 1.2.1)
Driver: Hive JDBC (version 1.2.1)
Transaction isolation: TRANSACTION_REPEATABLE_READ
0: jdbc:hive2://localhost:10000> show tables;
+-----------+--+
| tab_name  |
+-----------+--+
| u_data    |
+-----------+--+
1 row selected (0.957 seconds)
0: jdbc:hive2://localhost:10000>
```
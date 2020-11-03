# OSGi支持
## 1.在Apache Karaf中安装
### 1.1.概述
[Apache Karaf](https://karaf.apache.org/)是一个轻量级、功能强大的企业级OSGi容器，它支持Eclipse Equinox和Apache Felix运行时。

> **支持Apache Karaf4.0.0版本系列**
Ignite在Karaf4.0.0版本系列上进行了测试，可能也可以工作于更老的版本上，但是未经过明确的测试。

为了方便不同Ignite模块的部署（包括它们的依赖），Ignite提供了一套打包进特性库的[Karaf特性](https://karaf.apache.org/manual/latest/users-guide/provisioning.html)，这使得借助于Karaf Shell的一个命令就可以快速地将Ignite部署进OSGi环境。

### 1.2.准备步骤
首先，Ignite使用了Oracle/Sun JRE的底层包`sun.nio.ch`(OpenJDK也有效)。

因为这是一个专有的包（并不是Java标准规范的一部分），Apache Kafka默认并没有从[System Bundle](http://wiki.osgi.org/wiki/System_Bundle)（bundle 0）中导出它，因此必须通过[修改${KARAF_BASE}/etc/jre.properties文件](https://karaf.apache.org/manual/latest-2.2.x/users-guide/jre-tuning.html)通知Kafka导出它。

定位到使用的JRE版本的`jre-1.x`属性，然后在最后追加包名，比如：
```
jre-1.8= \
 javax.accessibility, \
 javax.activation;version="1.1", \
 ...
 org.xml.sax.helpers, \
 sun.nio.ch
```
### 1.3.安装Ignite特性库
使用Apache Karaf Shell中的如下命令来安装Ignite特性库，确保容器可以连接到互联网或者一个包含Ignite组件的备用Maven仓库。

将Ignite特性库加入Karaf：
```bash
karaf@root()> feature:repo-add mvn:org.apache.ignite/ignite-osgi-karaf/${ignite.version}/xml/features
Adding feature url mvn:org.apache.ignite/ignite-osgi-karaf/${ignite.version}/xml/features
karaf@root()>
```
将`${ignite.version}`替换为实际使用的版本号。

这时可以列出Ignite支持的所有特性：
```
karaf@root()> feature:list | grep ignite
ignite-all                    | 1.5.0.SNAPSHOT   |          | Uninstalled | ignite                   | Apache Ignite :: All
ignite-core                   | 1.5.0.SNAPSHOT   |          | Uninstalled | ignite                   | Apache Ignite :: Core
ignite-aop                    | 1.5.0.SNAPSHOT   |          | Uninstalled | ignite                   | Apache Ignite :: AOP
ignite-aws                    | 1.5.0.SNAPSHOT   |          | Uninstalled | ignite                   | Apache Ignite :: AWS
ignite-indexing               | 1.5.0.SNAPSHOT   |          | Uninstalled | ignite                   | Apache Ignite :: Indexing
ignite-hibernate              | 1.5.0.SNAPSHOT   |          | Uninstalled | ignite                   | Apache Ignite :: Hibernate
ignite-jcl                    | 1.5.0.SNAPSHOT   |          | Uninstalled | ignite                   | Apache Ignite :: JCL
ignite-jms11                  | 1.5.0.SNAPSHOT   |          | Uninstalled | ignite                   | Apache Ignite :: JMS 1.1
ignite-jta                    | 1.5.0.SNAPSHOT   |          | Uninstalled | ignite                   | Apache Ignite :: JTA
ignite-kafka                  | 1.5.0.SNAPSHOT   |          | Uninstalled | ignite                   | Apache Ignite :: Kafka
[...]
karaf@root()>
```

### 1.4.安装合适的Ignite特性
下面的特性是有点特别的：

 - `ignite-core`：ignite-core模块，它是所有其它特性依赖的，因此不要忘了安装；
 - `ignite-all`：安装其它所有特性的一个汇总；

所有其它的特性包括对应的Ignite模块+依赖，可以通过如下方式安装它们：
```
karaf@root()> feature:install ignite-core
karaf@root()> feature:install ignite-kafka
karaf@root()> feature:install ignite-aop ignite-urideploy
karaf@root()>
```
一些模块是OSGi片段而不是组件，当安装它们时，可能会注意到，Karaf Shell以及/或者`ignite-core`，其中一个或者两者，重新启动。

### 1.5.ignite-log4j和Pax Logging

> **当Karaf版本<=4.0.3时如果使用Pax Logging请仔细阅读这个注释**
安装`ignite-log4j`这个特性时，Karaf Shell可能显示下面的消息：
Error executing command: Resource has no uri
这不是一个严重的错误，已经汇报给Karaf社区，问题号是[KARAF-4129](https://issues.apache.org/jira/browse/KARAF-4129)。
按照如下的说明可以忽略这个错误。

Apache Karaf捆绑了[Pax Logging](https://ops4j1.jira.com/wiki/display/paxlogging/Pax+Logging),它是一个从其它组件收集和汇总日志输出（通过不同的框架输出，比如slf4j，log4j，JULI，commons-logging等）然后用一个典型的log4j配置处理的框架。

`ignite-log4j `模块依赖于log4j，Pax Logging默认不输出它，因此开发了一个OSGi片段，SymbolicName为`ignite-osgi-paxlogging`，它加入了`ignite-core`然后输出了缺失的包。

`ignite-log4j`特性也安装了这个片段，但是需要用`org.ops4j.pax.logging.pax-logging-api`这个名字强制刷新：
```bash
karaf@root()> feature:install ignite-log4j
karaf@root()> refresh org.ops4j.pax.logging.pax-logging-api
karaf@root()>
        __ __                  ____
       / //_/____ __________ _/ __/
      / ,<  / __ `/ ___/ __ `/ /_
     / /| |/ /_/ / /  / /_/ / __/
    /_/ |_|\__,_/_/   \__,_/_/

  Apache Karaf (4.0.2)

Hit '<tab>' for a list of available commands
and '[cmd] --help' for help on a specific command.
Hit '<ctrl-d>' or type 'system:shutdown' or 'logout' to shutdown Karaf.

karaf@root()> la | grep ignite-osgi-paxlogging
75 | Resolved  |   8 | 1.5.0.SNAPSHOT                            | ignite-osgi-paxlogging, Hosts: 1
karaf@root()>
```

## 2.支持的模块
以下的模块已OSGi化：

 - ignite-core
 - ignite-aop
 - ignite-aws
 - ignite-camel
 - ignite-flume
 - ignite-indexing
 - ignite-hibernate
 - ignite-jcl
 - ignite-jms11
 - ignite-jta
 - ignite-kafka
 - ignite-mqtt
 - ignite-log4j
 - ignite-rest-http
 - ignite-scalar-2.11
 - ignite-scalar-2.10
 - ignite-schedule
 - ignite-slf4j
 - ignite-spring
 - ignite-ssh
 - ignite-twitter
 - ignite-urideploy
 - ignite-web
 - ignite-zookeeper

下面的模块由于各种各样的原因目前还不支持OSGi：

 - ignite-cloud
 - ignite-hadoop
 - ignite-gce
 - ignite-log4j2
 - ignite-mesos
 - ignite-visor-console[-2.10]
 - ignite-yarn

## 3.在OSGi容器中启动
### 3.1.容器的配置
要在一个OSGi容器中启动Ignite，至少要安装如下的组件：

 - ignite-core
 - ignite-osgi
 - javax cache API

当在Karaf中部署时，可以通过使用Ignite特性库来快速地安装`ignite-core`特性，可以参照[在Apache Karaf中安装](#_4-1-在apache-karaf中安装)章节来了解更多的信息。

可以随意地安装额外的Ignite模块来扩展平台的功能，就像在一个标准环境中将模块加入类路径一样。
### 3.2.实现Ignite组件Activator
要启动Ignite，通过继承抽象类`org.apache.ignite.osgi.IgniteAbstractOsgiContextActivator`来实现一个OSGi组件Activator：
```java
package org.apache.ignite.osgi.examples;

import org.apache.ignite.configuration.IgniteConfiguration;
import org.apache.ignite.osgi.IgniteAbstractOsgiContextActivator;
import org.apache.ignite.osgi.classloaders.OsgiClassLoadingStrategyType;

public class MyActivator extends IgniteAbstractOsgiContextActivator {

    /**
     * Configure your Ignite instance as you would normally do,
     * and return it.
     */
    @Override public IgniteConfiguration igniteConfiguration() {
        IgniteConfiguration config = new IgniteConfiguration();
        config.setGridName("testGrid");

        // ...

        return config;
    }

    /**
     * Choose the classloading strategy for Ignite to use.
     */
    @Override public OsgiClassLoadingStrategyType classLoadingStrategy() {
        return OsgiClassLoadingStrategyType.BUNDLE_DELEGATING;
    }
}
```
在OSGi中支持两个不同的类加载策略：

 - `BUNDLE_DELEGATING`：优先使用包含Activator的组件的类加载器，`ignite-core`的类加载器作为备选；
 - `CONTAINER_SWEEP`：与`BUNDLE_DELEGATING`一样，但是在类仍然找不到时最终会搜索所有的组件。

> **未来的OSGi类加载策略**
未来可能会考虑在以后的版本中增加其它的类加载策略，比如使用Service Locator机制来定位通过一个文件自发地希望向Ignite的编组器暴露包的组件，类似于JAXB规范中的jaxb.index。

确保将`Bundle-Activator`OSGi清单头加入组件，这样才能使OSGi容器在组件启动时调用Activator。

包括Bundle-Activator的OSGi头
```
Bundle-SymbolicName: test-bundle
Bundle-Activator: org.apache.ignite.osgi.examples.MyActivator
Import-Package: ...
[...]
```
要生成这个组件，需要包含`Bundle-Activator`OSGi头，建议在Maven构建中增加`maven-bundle-plugin`插件，下面是对应的配置：
```xml
<plugin>
  <groupId>org.apache.felix</groupId>
  <artifactId>maven-bundle-plugin</artifactId>
  <version>${maven.bundle.plugin.version}</version>
  <configuration>
    <Bundle-SymbolicName>...</Bundle-SymbolicName>
    <Bundle-Activator>org.apache.ignite.osgi.examples.MyActivator</Bundle-Activator>
    [...]
  </configuration>
</plugin>
```
<RightPane/>
# 3.Web会话集群化
## 3.1.Web会话集群化
### 3.1.1.摘要
Ignite具有缓存所有兼容Java Servlet3.0规范的Java Servlet容器的Web Session的能力。包括Apache Tomcat,Eclipse Jetty,Oracle WebLogic以及其它的。

缓存Web会话对于运行一个应用服务器集群时是有用的。当在一个Servlet容器中运行一个Web应用时，可能面临性能和可扩展性的问题，一个单独的应用服务器通常可能无法自己处理很大的流量，一个常规的解决方案就是跨越多个集群实例扩展Web应用。

![](https://files.readme.io/37e2f93-web_sessions-small-copy.png)

在上面的架构中，高可用代理（负载平衡器）在多个应用服务器实例之间分发请求（应用服务器1，应用服务器2……），来降低每个实例的负载以及提供在任意实例故障时的服务可用性，这里的问题就是Web会话的可用性。Web会话通过Cookie保持请求之间的中间逻辑状态，并且通常绑定到一个特定的应用实例。通常这是由粘性连接来处理，来确保来自同一个用户的请求被同一个应用服务器实例处理。然而，如果该实例故障，会话就丢失了，所有当前未保存的状态也丢失了，然后用户会重新创建它。

![](https://files.readme.io/dae81d5-web_sessions_failed_instance-small.png)

这里的一个解决方案就是用Ignite来缓存Web会话-维护每个创建的会话的拷贝的分布式缓存，在所有的实例中共享。如果任何一个应用实例故障，Ignite会马上从分布式缓存中恢复故障实例所属的会话，而不管下一个请求会被转发到哪个应用服务器。这样的话，随着Web会话被缓存粘性连接就变得不那么重要，因为会话可以用于请求被路由到的任何应用服务器。

![](https://files.readme.io/43c16d4-web_sessions_clustering.png)

这个章节给出了一个Ignite的Web会话缓存功能的主要架构概况以及介绍了如何配置Web应用来启用Web会话缓存。

### 3.1.2.架构
要用Ignite配置一个分布式Web会话缓存，通常需要将应用启动为一个Ignite节点(嵌入式模式)，当多个应用服务器实例启动后，所有的Ignite节点会形成一个分布式缓存。

> 注意并不是所有的Ignite缓存节点都需要运行在应用服务器内部，也可以启动额外的，独立的Ignite节点，然后将它们加入集群。

### 3.1.3.复制策略
当将会话存储在Ignite中时有几个复制策略可供选择，复制策略是在缓存的备份设定中定义的，本章节将主要覆盖最常用的配置。

**全复制缓存**

这个策略保存每个Ignite节点上的所有会话的拷贝，提供了最大的可用性。然而这个方法缓存的会话的数量必须匹配单个服务器的内存大小，另外，性能也会变差因为现在Web会话状态的每一次改变都必须复制到集群中所有的其它节点。

要启用全复制策略，设置缓存的cacheMode为`REPLICATED`：
```xml
<bean class="org.apache.ignite.configuration.CacheConfiguration">
    <!-- Cache mode. -->
    <property name="cacheMode" value="REPLICATED"/>
    ...
</bean>
```
**有备份的分区缓存**

在分区模式，Web会话会被拆分为区，每个节点只负责缓存分配给该节点的分区的数据，这个方法中如果有更多的节点，就可以缓存更多的数据，新的节点也可以动态地加入以增加更多的内存。

> `分区`模式中，冗余是通过为每个缓存的Web会话配置一定数量的备份实现的。

要开启分区策略，设置缓存的cacheMode为`PARTITIONED`以及通过`CacheConfiguration`的`backups`属性来配置备份的数量。
```xml
<bean class="org.apache.ignite.configuration.CacheConfiguration">
    <!-- Cache mode. -->
    <property name="cacheMode" value="PARTITIONED"/>
    <property name="backups" value="1"/>
</bean>
```

> 可以参照`3.3.缓存模型`来了解关于Ignite不同复制策略的更多信息。

### 3.1.4.过期和退出
当会话过期后会被缓存自动清理。然而，如果创建了大量的长期存活的会话，当缓存达到一个特定的限值时，为了节省内存可能需要将不必要的缓存退出。这个可以通过设置缓存的退出策略以及指定缓存中可以存储的会话的最大值来实现。比如，要启用基于LRU算法的自动退出以及10000个会话的限制，可以通过如下的缓存配置来实现：
```xml
<bean class="org.apache.ignite.configuration.CacheConfiguration">
    <!-- Cache name. -->
    <property name="name" value="session-cache"/>
 
    <!-- Set up LRU eviction policy with 10000 sessions limit. -->
    <property name="evictionPolicy">
        <bean class="org.apache.ignite.cache.eviction.lru.LruEvictionPolicy">
           <property name="maxSize" value="10000"/>
        </bean>
    </property>
    ...
</bean>
```

> 要了解各个退出策略的更多信息，可以参照`3.15.退出策略`章节。

### 3.1.5.配置
要在应用中通过Ignite开启Web会话缓存，需要：

 1. **添加Ignite的jar包**，下载Ignite然后将如下的jar包加入应用的类路径(WEB-INF/lib目录)；

  - ignite.jar
  - ignite-web.jar
  - ignite-log4j.jar
  - ignite-spring.jar

或者，如果是一个基于Maven的工程，可以将下面的片段加入应用的pom.xml：
```xml
<dependency>
      <groupId>org.apache.ignite</groupId>
      <artifactId>ignite-core</artifactId>
      <version> ${ignite.version}</version>
</dependency>

<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-web</artifactId>
    <version> ${ignite.version}</version>
</dependency>

<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-log4j</artifactId>
    <version>${ignite.version}</version>
</dependency>

<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-spring</artifactId>
    <version>${ignite.version}</version>
</dependency>
```

确保将${ignite.version}替换为实际的Ignite版本。
 2. **配置缓存模式**，配置Ignite的缓存，要么是`分区`模式，要么是`复制`模式（可以看上面的例子）；
 3. **更新web.xml**，在web.xml中声明一个ContextListener和一个WebSessionsFilter：

```xml
...

<listener>
   <listener-class>org.apache.ignite.startup.servlet.ServletContextListenerStartup</listener-class>
</listener>

<filter>
   <filter-name>IgniteWebSessionsFilter</filter-name>
   <filter-class>org.apache.ignite.cache.websession.WebSessionFilter</filter-class>
</filter>

<!-- You can also specify a custom URL pattern. -->
<filter-mapping>
   <filter-name>IgniteWebSessionsFilter</filter-name>
   <url-pattern>/*</url-pattern>
</filter-mapping>

<!-- Specify Ignite configuration (relative to META-INF folder or Ignite_HOME). -->
<context-param>
   <param-name>IgniteConfigurationFilePath</param-name>
   <param-value>config/default-config.xml </param-value>
</context-param>

<!-- Specify the name of Ignite cache for web sessions. -->
<context-param>
   <param-name>IgniteWebSessionsCacheName</param-name>
   <param-value>partitioned</param-value>
</context-param>

...
```

在应用启动时，监听器会在应用中启动一个Ignite节点，它会连接网络中的其它节点以形成一个分布式缓存。
 4. **设置退出策略（可选）**，为缓存中的旧数据设置退出策略（可以看上面的例子）。

**配置参数**

`ServletContextListenerStartup`有如下的配置参数：

|参数名|描述|默认值|
|---|---|---|
|`IgniteConfigurationFilePath`|Ignite配置文件的路径（相对于`META-INF`文件夹或者` IGNITE_HOME`）|/config/default-config.xml|

WebSessionFilter有如下的配置参数：

|参数名|描述|默认值|
|---|---|---|
|`IgniteWebSessionsGridName`|启动Ignite节点的网格名，可以参照配置文件的grid部分（如果配置文件中指定了网格名）|无|
|`IgniteWebSessionsCacheName`|Web会话缓存的缓存名|无|
|`IgniteWebSessionsMaximumRetriesOnFail`|只对`ATOMIC`缓存有效，指定了当主节点故障时的重试次数|3|

### 3.1.6.支持的容器
Ignite官方测试了如下的应用服务器：

 - Apache Tomcat 7
 - Eclipse Jetty 9
 - Apache Tomcat 6
 - Oracle WebLogic >= 10.3.4

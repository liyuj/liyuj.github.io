# 8.Hibernate
## 8.1.Hibernate二级缓存
### 8.1.1.概述
Ignite可以用做Hibernate的二级缓存，它可以显著地提升应用持久化层的性能。

Hibernate是著名的、应用广泛的对象关系映射框架(ORM),在与SQL数据库紧密互动的同时，它通过对查询结果集的缓存来最小化昂贵的数据库请求。

![](https://files.readme.io/867f0b4-hibernate-L2-cache_1.png)

Hibernate数据库映射对象的所有工作都是在一个会话中完成的，通常绑定到一个工作节点线程或者Web会话。Hibernate默认只会使用Session级的缓存（一级缓存），因此，缓存在一个会话中的对象，对于另一个会话是不可见的。不过如果用的是全局二级缓存，它缓存的所有对象对于用同一个缓存配置的所有会话都是可见的。这通常会带来性能的显著提升，因为每一个新创建的会话都可以利用二级缓存（它比任何会话级L1缓存都要长寿）中已有的数据的好处。

一级缓存是一直启用的而且是由Hibernate内部实现的，而二级缓存是可选的而且有很多的可插拔的实现。Ignite可以作为L2缓存的实现非常容易地嵌入，而且可以用于所有的访问模式（`READ_ONLY`,`READ_WRITE`,`NONSTRICT_READ_WRITE`和`TRANSACTIONAL`），支持广泛的相关特性：

 - 缓存到内存和磁盘以及堆外内存
 - 缓存事务
 - 集群，有2种不同的复制模式，`复制`和`分区`

如果要将Ignite作为Hibernate的二级缓存，需要简单的三个步骤：

 - 将Ignite的库文件添加到应用的类路径；
 - 启用二级缓存以及在二级缓存的配置文件中指定Ignite的实现类；
 - 为二级缓存配置Ignite缓存区域以及启动嵌入式的Ignite节点（也可以选择外部的节点）。

本章节的后面会详细介绍这些步骤的细节。

### 8.1.2.二级缓存配置
要将Ignite配置为Hibernate的二级缓存，不需要修改已有的Hibernate代码，只需要：

 - 在工程中添加`ignite-hibernate_5.1`或者`ignite-hibernate_4.2`模块的依赖，或者，如果是从命令行启动节点，也可以从`{apache_ignite_relese}/libs/optional`中拷贝同名的jar文件到`{apache_ignite_relese}/libs`文件夹；
 - 配置Hibernate使用Ignite作为二级缓存；
 - 正确地配置Ignite缓存。

**Maven配置**

要在项目中添加Ignite-hibernate集成，需要将下面的依赖加入POM文件：

Hibernate5:
```xml
<dependency>
  <groupId>org.apache.ignite</groupId>
  <artifactId>ignite-hibernate_5.1</artifactId>
  <version>${ignite.version}</version>
</dependency>
```
Hibernate4:
```xml
<dependency>
  <groupId>org.apache.ignite</groupId>
  <artifactId>ignite-hibernate_4.2</artifactId>
  <version>${ignite.version}</version>
</dependency>
```
**Hibernate配置示例**

一个用Ignite配置Hibernate二级缓存的典型例子看上去像下面这样：
```xml
<hibernate-configuration>
    <session-factory>
        ...
        <!-- Enable L2 cache. -->
        <property name="cache.use_second_level_cache">true</property>

        <!-- Generate L2 cache statistics. -->
        <property name="generate_statistics">true</property>

        <!-- Specify Ignite as L2 cache provider. -->
        <property name="cache.region.factory_class">org.apache.ignite.cache.hibernate.HibernateRegionFactory</property>

        <!-- Specify the name of the grid, that will be used for second level caching. -->
        <property name="org.apache.ignite.hibernate.ignite_instance_name">hibernate-grid</property>

        <!-- Set default L2 cache access type. -->
        <property name="org.apache.ignite.hibernate.default_access_type">READ_ONLY</property>

        <!-- Specify the entity classes for mapping. -->
        <mapping class="com.mycompany.MyEntity1"/>
        <mapping class="com.mycompany.MyEntity2"/>

        <!-- Per-class L2 cache settings. -->
        <class-cache class="com.mycompany.MyEntity1" usage="read-only"/>
        <class-cache class="com.mycompany.MyEntity2" usage="read-only"/>
        <collection-cache collection="com.mycompany.MyEntity1.children" usage="read-only"/>
        ...
    </session-factory>
</hibernate-configuration>
```
这里，做了如下工作：

 - 开启了二级缓存（可选地生成二级缓存的统计）
 - 指定Ignite作为二级缓存的实现
 - 指定缓存网格的名字（需要和Ignite配置文件中的保持一致）
 - 指定实体类以及为每个类配置缓存（Ignite中应该配置一个相应的缓存区域）

**Ignite配置示例**

一个典型的支持Hibernate二级缓存的Ignite配置，像下面这样：
```xml
<!-- Basic configuration for atomic cache. -->
<bean id="atomic-cache" class="org.apache.ignite.configuration.CacheConfiguration" abstract="true">
    <property name="cacheMode" value="PARTITIONED"/>
    <property name="atomicityMode" value="ATOMIC"/>
    <property name="writeSynchronizationMode" value="FULL_SYNC"/>
</bean>

<!-- Basic configuration for transactional cache. -->
<bean id="transactional-cache" class="org.apache.ignite.configuration.CacheConfiguration" abstract="true">
    <property name="cacheMode" value="PARTITIONED"/>
    <property name="atomicityMode" value="TRANSACTIONAL"/>
    <property name="writeSynchronizationMode" value="FULL_SYNC"/>
</bean>

<bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
    <!--
        Specify the name of the caching grid (should correspond to the
        one in Hibernate configuration).
    -->
    <property name="igniteInstanceName" value="hibernate-grid"/>
    ...
    <!--
        Specify cache configuration for each L2 cache region (which corresponds
        to a full class name or a full association name).
    -->
    <property name="cacheConfiguration">
        <list>
            <!--
                Configurations for entity caches.
            -->
            <bean parent="transactional-cache">
                <property name="name" value="com.mycompany.MyEntity1"/>
            </bean>
            <bean parent="transactional-cache">
                <property name="name" value="com.mycompany.MyEntity2"/>
            </bean>
            <bean parent="transactional-cache">
                <property name="name" value="com.mycompany.MyEntity1.children"/>
            </bean>

            <!-- Configuration for update timestamps cache. -->
            <bean parent="atomic-cache">
                <property name="name" value="org.hibernate.cache.spi.UpdateTimestampsCache"/>
            </bean>

            <!-- Configuration for query result cache. -->
            <bean parent="atomic-cache">
                <property name="name" value="org.hibernate.cache.internal.StandardQueryCache"/>
            </bean>
        </list>
    </property>
    ...
</bean>
```
上面的代码为每个二级缓存区域指定了缓存的配置：

 - 使用`分区`缓存在缓存节点间拆分数据，其它的策略也可以选择`复制`模式，这样就在所有缓存节点上复制完整的数据集，可以参照相关的章节以了解更多的信息。
 - 指定与二级缓存区域名一致的缓存名（或者是完整类名或者是完整的关系名）
 - 用`事务`原子化模式来利用缓存事务的优势
 - 开启`FULL_SYNC`模式保持备份节点的完全同步

另外，指定了一个缓存来更新时间戳，它可以是`原子化`的，因为性能好。

配置完Ignite缓存节点后，可以通过如下方式在节点内启动它：
```java
Ignition.start("my-config-folder/my-ignite-configuration.xml");
```
上述代码执行完毕后，内部的节点就启动了然后准备缓存数据，也可以从控制台执行如下命令来启动额外的独立的节点：
```bash
$IGNITE_HOME/bin/ignite.sh my-config-folder/my-ignite-configuration.xml
```
对于Windows,可以执行同一文件夹下的`.bat`脚本。

::: tip 提示
节点也可以在其它主机上启动，以形成一个分布式的缓存集群，一定要确保在配置文件中指定正确的网络参数。
:::

### 8.1.3.查询缓存
除了二级缓存，Hibernate还提供了查询缓存，这个缓存存储了通过指定参数集进行查询的结果(或者是HQL或者是Criteria)，因此，当重复用同样的参数集进行查询时，它会命中缓存而不会去访问数据库。

查询缓存对于反复用同样的参数集进行查询时是有用的。像二级缓存的场景一样，Hibernate依赖于一个第三方的缓存实现，Ignite也可以这样用。

::: tip 提示
要考虑使用Ignite的SQL网格会比通过Hibernate性能更好。
:::

### 8.1.4.查询缓存配置
上面的配置信息完全适用于查询缓存，但是额外的配置和代码变更还是必要的。

**Hibernate配置**

要在Hibernate种启用查询缓存，只需要在配置文件中添加额外的一行：
```xml
<!-- Enable query cache. -->
<property name="cache.use_query_cache">true</property>
```
然后，需要对代码做出修改，对于要缓存的每一个查询，都需要通过调用`setCacheable(true)`来开启`cacheable`标志。
```java

Session ses = ...;

// Create Criteria query.
Criteria criteria = ses.createCriteria(cls);

// Enable cacheable flag.
criteria.setCacheable(true);

...
```
这个完成之后，查询结果就会被缓存了。

**Ignite配置**

要在Ignite中开启Hibernate查询缓存，需要指定一个额外的缓存配置：
```xml
<property name="cacheConfiguration">
    <list>
        ...
        <!-- Query cache (refers to atomic cache defined in above example). -->
        <bean parent="atomic-cache">
            <property name="name" value="org.hibernate.cache.internal.StandardQueryCache"/>
        </bean>
    </list>
</property>
```
注意为了更好的性能缓存配置为`原子化`的。
### 8.1.5.示例
GitHub上有完整的[示例](https://github.com/apache/ignite/blob/master/examples/src/main/java-lgpl/org/apache/ignite/examples/datagrid/hibernate/HibernateL2CacheExample.java)。
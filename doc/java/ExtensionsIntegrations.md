# 扩展和集成
## 1.Spring
### 1.1.Spring Boot
#### 1.1.1.概述
[Spring Boot](https://spring.io/projects/spring-boot)是一个广泛使用的Java框架，它使开发基于Spring的独立应用变得非常容易。

Ignite提供了2个扩展来完成Spring Boot环境的自动化配置：

 - `ignite-spring-boot-autoconfigure-ext`：在Spring Boot中自动化配置Ignite的服务端和客户端节点；
 - `ignite-spring-boot-thin-client-autoconfigure-ext`：在Spring Boot中自动化配置Ignite的[瘦客户端](/doc/java/ThinClients.md#_2-java瘦客户端)节点。

#### 1.1.2.自动化配置Ignite的服务端和客户端
需要使用`ignite-spring-boot-autoconfigure-ext`扩展来使用Spring Boot自动化配置Ignite的服务端和客户端（胖客户端）。

通过Maven添加扩展的方式如下：
```xml
<dependency>
  <groupId>org.apache.ignite</groupId>
  <artifactId>ignite-spring-boot-autoconfigure-ext</artifactId>
   <version>1.0.0</version>
</dependency>
```
添加之后，Spring在启动之后会自动创建一个Ignite实例。
##### 1.1.2.1.通过Spring Boot的配置文件配置Ignite
可以使用常规的Spring Boot配置文件对Ignite进行配置，前缀是`ignite`：
```yml
ignite:
  igniteInstanceName: properties-instance-name
  communicationSpi:
    localPort: 5555
  dataStorageConfiguration:
    defaultDataRegionConfiguration:
      initialSize: 10485760 #10MB
    dataRegionConfigurations:
      - name: my-dataregion
        initialSize: 104857600 #100MB
  cacheConfiguration:
    - name: accounts
      queryEntities:
      - tableName: ACCOUNTS
        keyFieldName: ID
        keyType: java.lang.Long
        valueType: java.lang.Object
        fields:
          ID: java.lang.Long
          amount: java.lang.Double
          updateDate: java.util.Date
    - name: my-cache2
```
##### 1.1.2.2.通过编程的方式配置Ignite
有两种编程方式：

 1. 创建`IgniteConfiguration`Bean：
   只需要创建一个方法返回`IgniteConfiguration`即可，其会通过开发者的配置创建`Ignite`实例：
    ```java
    @Bean
    public IgniteConfiguration igniteConfiguration() {
        // If you provide a whole ClientConfiguration bean then configuration properties will not be used.
        IgniteConfiguration cfg = new IgniteConfiguration();
        cfg.setIgniteInstanceName("my-ignite");
        return cfg;
    }
    ```
 2. 通过Spring Boot配置自定义`IgniteConfiguration`：
    如果希望自定义通过Spring Boot配置文件创建的`IgniteConfiguration`，那么需要在应用的上下文中提供一个`IgniteConfigurer`的实现。

    首先，`IgniteConfiguration`会被Spring Boot加载，然后其实例会被传入配置器：
    ```java
    @Bean
    public IgniteConfigurer nodeConfigurer() {
        return cfg -> {
        //Setting some property.
        //Other will come from `application.yml`
        cfg.setIgniteInstanceName("my-ignite");
        };
    }
    ```
#### 1.1.3.自动化配置Ignite的瘦客户端
需要使用`ignite-spring-boot-thin-client-autoconfigure-ext`扩展来自动化配置Ignite的瘦客户端。

通过Maven添加扩展的方式如下：
```xml
<dependency>
  <groupId>org.apache.ignite</groupId>
  <artifactId>ignite-spring-boot-thin-client-autoconfigure-ext</artifactId>
   <version>1.0.0</version>
</dependency>
```
添加之后，Spring在启动之后会自动创建一个Ignite的瘦客户端连接实例。
##### 1.1.3.1.通过Spring Boot的配置文件配置瘦客户端
可以使用常规的Spring Boot配置文件对IgniteClient进行配置，前缀是`ignite-client`：
```yml
ignite-client:
  addresses: 127.0.0.1:10800 # this is mandatory property!
  timeout: 10000
  tcpNoDelay: false
```
##### 1.1.3.2.通过编程的方式配置瘦客户端

有两种编程方式配置`IgniteClient`对象：

 1. 创建`ClientConfiguration`Bean：
    只需要创建一个方法返回`ClientConfiguration`即可，其会通过开发者的配置创建`IgniteClient`实例：
    ```java
    @Bean
    public ClientConfiguration clientConfiguration() {
        // If you provide a whole ClientConfiguration bean then configuration properties will not be used.
        ClientConfiguration cfg = new ClientConfiguration();
        cfg.setAddresses("127.0.0.1:10800");
        return cfg;
    }
    ```
 2. 通过Spring Boot配置自定义`ClientConfiguration`：
    如果希望自定义通过Spring Boot配置文件创建的`ClientConfiguration`，那么需要在应用的上下文中提供一个`IgniteClientConfigurer`的实现。

    首先，`ClientConfiguration`会被Spring Boot加载，然后其实例会被传入配置器：
    ```java
    @Bean
    IgniteClientConfigurer configurer() {
        //Setting some property.
        //Other will come from `application.yml`
        return cfg -> cfg.setSendBufferSize(64*1024);
    }
    ```
#### 1.1.4.示例
[这里](https://github.com/apache/ignite-extensions/tree/master/modules/spring-boot-autoconfigure-ext/examples/main)有若干示例供参考。
### 1.2.Spring Data
#### 1.2.1.概述
[Spring Data框架](http://projects.spring.io/spring-data/)提供了一套统一并且广泛使用的API，它从应用层抽象了底层的数据存储，Spring Data有助于避免锁定到特定的数据库厂商，通过很小的代价就可以从一个数据库切换到另一个，Ignite通过实现`CrudRepository`接口来与Spring Data集成。
#### 1.2.2.Maven配置
开始使用Ignite的Spring Data库的最简单方式就是将下面的Maven依赖加入应用的`pom.xml`文件：
```xml
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-spring-data</artifactId>
    <version>{ignite.version}</version>
</dependency>
```
#### 1.2.3.IgniteRepository
Ignite引入了一个特定的`IgniteRepository`接口，扩展了默认的`CrudRepository`，这个接口可以被所有希望从Ignite集群中存储和查询数据的自定义Spring Data Repository继承。

比如，创建一个名为`PersonRepository`的自定义Repository：
```java
@RepositoryConfig(cacheName = "PersonCache")
public interface PersonRepository extends IgniteRepository<Person, Long> {
    /**
     * Gets all the persons with the given name.
     * @param name Person name.
     * @return A list of Persons with the given first name.
     */
    public List<Person> findByFirstName(String name);

    /**
     * Returns top Person with the specified surname.
     * @param name Person surname.
     * @return Person that satisfy the query.
     */
    public Cache.Entry<Long, Person> findTopByLastNameLike(String name);

    /**
     * Getting ids of all the Person satisfying the custom query from {@link Query} annotation.
     *
     * @param orgId Query parameter.
     * @param pageable Pageable interface.
     * @return A list of Persons' ids.
     */
    @Query("SELECT id FROM Person WHERE orgId > ?")
    public List<Long> selectId(long orgId, Pageable pageable);
}
```

 - `@RepositoryConfig`注解需要指定，它会将Repository映射到一个分布式缓存，在上面的示例中，`PersonRepository`映射到了`PersonCache`；
 - 自定义方法（比如`findByFirstName(name)`以及`findTopByLastNameLike(name)`）的签名会被自动处理，在该方法被调用时会被转成对应的SQL查询。另外，如果需要执行明确的SQL查询作为方法调用的结果，也可以使用`@Query(queryString)`注解。

::: warning 不支持的CRUD操作
`CrudRepository`接口的部分操作目前还不支持。这些操作是不需要提供主键作为参数的：
 - `save(S entity)`
 - `save(Iterable<S> entities)`
 - `delete(T entity)`
 - `delete(Iterable<? extends T> entities)`

这些操作可以使用`IgniteRepository`接口中提供的功能相当的函数替代：

 - `save(ID key, S entity)`
 - `save(Map<ID, S> entities)`
 - `deleteAll(Iterable<ID> ids)`
:::
#### 1.2.4.Spring Data和Ignite配置
要在Spring Data中启用面向Ignite的Repository，需要在应用的配置上添加`@EnableIgniteRepositories`注解，如下所示：
```java
@Configuration
@EnableIgniteRepositories
public class SpringAppCfg {
    /**
     * Creating Apache Ignite instance bean. A bean will be passed
     * to IgniteRepositoryFactoryBean to initialize all Ignite based Spring Data      * repositories and connect to a cluster.
     */
    @Bean
    public Ignite igniteInstance() {
        IgniteConfiguration cfg = new IgniteConfiguration();

        // Setting some custom name for the node.
        cfg.setIgniteInstanceName("springDataNode");

        // Enabling peer-class loading feature.
        cfg.setPeerClassLoadingEnabled(true);

        // Defining and creating a new cache to be used by Ignite Spring Data
        // repository.
        CacheConfiguration ccfg = new CacheConfiguration("PersonCache");

        // Setting SQL schema for the cache.
        ccfg.setIndexedTypes(Long.class, Person.class);

        cfg.setCacheConfiguration(ccfg);

        return Ignition.start(cfg);
    }
}
```
这个配置会实例化传入`IgniteRepositoryFactoryBean`的Ignite bean（节点），然后用于所有需要接入Ignite集群的Ignite Repository。

在上例中，应用会直接实例化该bean，然后命名为`igniteInstance`，另外，配置也可以注册下面的bean，然后自动地启动一个Ignite节点。

 - 名为`igniteCfg`的`IgniteConfiguration`对象；
 - 名为`igniteSpringCfgPath`的指向Ignite的Spring XML配置文件的路径。

#### 1.2.5.使用IgniteRepository
所有的配置和Repository准备好之后，就可以在应用的上下文中注册配置以及获取Repository的引用。下面的示例代码就会展示如何在应用的上下文中注册`SpringAppCfg`（上面章节的示例配置），然后获取`PersonRepository`的引用：
```java
ctx = new AnnotationConfigApplicationContext();

// Explicitly registering Spring configuration.
ctx.register(SpringAppCfg.class);

ctx.refresh();

// Getting a reference to PersonRepository.
repo = ctx.getBean(PersonRepository.class);
```
下面，就可以使用Spring Data的API将数据加入分布式缓存：
```java
TreeMap<Long, Person> persons = new TreeMap<>();

persons.put(1L, new Person(1L, 2000L, "John", "Smith", 15000, "Worked for Apple"));

persons.put(2L, new Person(2L, 2000L, "Brad", "Pitt", 16000, "Worked for Oracle"));

persons.put(3L, new Person(3L, 1000L, "Mark", "Tomson", 10000, "Worked for Sun"));

// Adding data into the repository.
repo.save(persons);
```
如果要查询数据，可以使用基本的CRUD操作或者方法，它们会自动地转换为Ignite的SQL查询。
```java
List<Person> persons = repo.findByFirstName("John");

for (Person person: persons)
	System.out.println("   >>>   " + person);

Cache.Entry<Long, Person> topPerson = repo.findTopByLastNameLike("Smith");

System.out.println("\n>>> Top Person with surname 'Smith': " +
		topPerson.getValue());
```
#### 1.2.6.示例
[GitHub](https://github.com/apache/ignite/tree/master/examples/src/main/java/org/apache/ignite/examples/springdata)上有完整的示例。
### 1.3.Spring缓存
#### 1.3.1.概述
Ignite提供了一个`SpringCacheManager`，一个[Spring缓存抽象](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/cache.html)的实现。它提供了基于注解的方式来启用Java方法的缓存，这样方法的执行结果就会存储在Ignite缓存中。如果之后同一个方法通过同样的参数集被调用，结果会直接从缓存中获得而不是实际执行这个方法。
#### 1.3.2.启用Spring缓存
只需要两个简单的步骤就可以将Ignite缓存嵌入基于Spring的应用：

 - 在嵌入式模式中使用正确的配置文件启动一个Ignite节点（即应用运行的同一个JVM）。它也可以有预定义的缓存，但不是必须的-如果必要缓存会在第一次访问时自动创建。
 - 在Spring应用上下文中配置`SpringCacheManager`作为缓存管理器。

嵌入式节点可以通过`SpringCacheManager`自己启动，这种情况下需要分别通过`configurationPath`或者`configuration`属性提供一个Ignite配置文件的路径或者`IgniteConfiguration`Bean（看下面的示例）。注意同时设置两个属性是非法的，会抛出`IllegalArgumentException`。

<Tabs>
<Tab title="配置文件路径">

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:cache="http://www.springframework.org/schema/cache"
       xsi:schemaLocation="
         http://www.springframework.org/schema/beans
         http://www.springframework.org/schema/beans/spring-beans.xsd
         http://www.springframework.org/schema/cache
         http://www.springframework.org/schema/cache/spring-cache.xsd">
    <!-- Provide configuration file path. -->
    <bean id="cacheManager" class="org.apache.ignite.cache.spring.SpringCacheManager">
        <property name="configurationPath" value="examples/config/spring-cache.xml"/>
    </bean>

    <!-- Enable annotation-driven caching. -->
    <cache:annotation-driven/>
</beans>
```
</Tab>

<Tab title="配置Bean">

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:cache="http://www.springframework.org/schema/cache"
       xsi:schemaLocation="
         http://www.springframework.org/schema/beans
         http://www.springframework.org/schema/beans/spring-beans.xsd
         http://www.springframework.org/schema/cache
         http://www.springframework.org/schema/cache/spring-cache.xsd">
    <-- Provide configuration bean. -->
    <bean id="cacheManager" class="org.apache.ignite.cache.spring.SpringCacheManager">
        <property name="configuration">
            <bean class="org.apache.ignite.configuration.IgniteConfiguration">
                 ...
            </bean>
        </property>
    </bean>

    <-- Enable annotation-driven caching. -->
    <cache:annotation-driven/>
</beans>
```
</Tab>
</Tabs>

当缓存管理器初始化时也可能已经有一个Ignite节点正在运行（比如已经通过`ServletContextListenerStartup`启动了）。这时只需要简单地通过`gridName`属性提供网格名字就可以了。注意如果不设置网格名字，缓存管理器会试图使用默认的Ignite实例（名字为`null`的），下面是一个示例：

使用已启动的Ignite实例：
```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:cache="http://www.springframework.org/schema/cache"
       xsi:schemaLocation="
         http://www.springframework.org/schema/beans
         http://www.springframework.org/schema/beans/spring-beans.xsd
         http://www.springframework.org/schema/cache
         http://www.springframework.org/schema/cache/spring-cache.xsd">
    <!-- Provide grid name. -->
    <bean id="cacheManager" class="org.apache.ignite.cache.spring.SpringCacheManager">
        <property name="gridName" value="myGrid"/>
    </bean>

    <!-- Enable annotation-driven caching. -->
    <cache:annotation-driven/>
</beans>
```
::: tip 远程节点
注意应用内部启动的节点只是接入拓扑的一个入口，可以按需启动任意数量的远程节点，所有这些节点都会参与缓存数据。
:::
#### 1.3.3.动态缓存
虽然通过Ignite配置文件可以获得所有必要的缓存，但是这不是必要的。如果Spring要使用一个不存在的缓存时，`SpringCacheManager`会自动创建它。

如果不指定，会使用默认值创建一个新的缓存。也可以通过`dynamicCacheConfiguration`属性提供一个配置模板进行自定义，比如，如果希望使用`复制`缓存而不是`分区`缓存，可以像下面这样配置`SpringCacheManager`:
```xml
<bean id="cacheManager" class="org.apache.ignite.cache.spring.SpringCacheManager">
    ...

    <property name="dynamicCacheConfiguration">
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
            <property name="cacheMode" value="REPLICATED"/>
        </bean>
    </property>
</bean>
```
也可以在客户端侧使用近缓存，要做到这一点只需要简单地通过`dynamicNearCacheConfiguration`属性提供一个近缓存配置即可。近缓存默认是不启用的，下面是一个示例：
```xml
<bean id="cacheManager" class="org.apache.ignite.cache.spring.SpringCacheManager">
    ...

    <property name="dynamicNearCacheConfiguration">
        <bean class="org.apache.ignite.configuration.NearCacheConfiguration">
            <property name="nearStartSize" value="1000"/>
        </bean>
    </property>
</bean>
```
#### 1.3.4.示例
如果在Spring应用上下文中已经加入了`SpringCacheManager`，就可以通过简单地加上注解为任意的java方法启用缓存。

通常为很重的操作使用缓存，比如数据库访问。比如，假设有个Dao类有一个`averageSalary(...)`方法，它计算一个组织内的所有雇员的平均工资，那么可以通过`@Cacheable`注解来开启这个方法的缓存。
```java
private JdbcTemplate jdbc;

@Cacheable("averageSalary")
public long averageSalary(int organizationId) {
    String sql =
        "SELECT AVG(e.salary) " +
        "FROM Employee e " +
        "WHERE e.organizationId = ?";

    return jdbc.queryForObject(sql, Long.class, organizationId);
}
```
当这个方法第一次被调用时，`SpringCacheManager`会自动创建一个`averageSalary`缓存，它也会在缓存中查找事先计算好的平均值然后如果存在，就会直接返回，如果这个组织的平均值还没有被计算过，那么这个方法就会被调用然后将结果保存在缓存中，因此下一次请求这个组织的平均值，就不需要访问数据库了。

如果一个雇员的工资发生变化，可能希望从缓存中删除这个雇员所属组织的平均值，否则`averageSalary(...)`方法会返回过时的缓存结果。这个可以通过将`@CacheEvict`注解加到一个方法上来更新雇员的工资：
```java
private JdbcTemplate jdbc;

@CacheEvict(value = "averageSalary", key = "#e.organizationId")
public void updateSalary(Employee e) {
    String sql =
        "UPDATE Employee " +
        "SET salary = ? " +
        "WHERE id = ?";

    jdbc.update(sql, e.getSalary(), e.getId());
}
```
在这个方法被调用之后，该雇员所属组织的平均值就会被从`averageSalary`缓存中踢出，这会强迫`averageSalary(...)`方法在下次调用时重新计算。

::: tip Spring表达式语言(SpEL)
注意这个方法是以雇员为参数的，而平均值是通过`organizationID`将平均值存储在缓存中的。为了明确地指定什么作为缓存键，可以使用注解的`key`参数和Spring表达式语言。
`#e.organizationId`表达式的意思是从`e`变量中获取`organizationId`属性的值。本质上会在提供的雇员对象上调用`getOrganizationId()`方法，以及将返回的值作为缓存键。
:::
## 2.Ignite和Spark
### 2.1.概述
Ignite作为一个分布式的内存数据库和缓存平台，对于Spark用户可以实现如下的功能：

 - 获得真正的可扩展的内存级性能，避免数据源和Spark工作节点和应用之间的数据移动；
 - 提升DataFrame和SQL的性能；
 - 在Spark作业之间更容易地共享状态和数据。

![](https://ignite.apache.org/docs/2.9.0/images/spark_integration.png)
#### 2.1.1.IgniteRDD
Ignite提供了一个Spark RDD抽象的实现，它可以容易地在内存中跨越多个Spark作业共享状态，在跨越不同Spark作业、工作节点或者应用时，IgniteRDD为内存中的相同数据提供了一个共享的、可变的视图，而原生的SparkRDD无法在Spark作业或者应用之间进行共享。

[IgniteRDD](#_2-2-ignitecontext和igniterdd)实现的方式是作为一个分布式的Ignite缓存（或者表）的视图，它可以作为一个节点部署在Spark执行进程内部，或者Spark 工作节点上或者它自己的集群中。这意味着根据选择的不同的部署模型，共享状态可能只存在于一个Spark应用的生命周期内（嵌入式模式），或者可能存在于Spark应用外部（独立模式），这时状态可以在多个Spark应用之间共享。

虽然SparkSQL支持丰富的SQL语法，但是它没有实现索引。从结果上来说，即使在普通的较小的数据集上，Spark查询也可能花费几分钟的时间，因为需要进行全表扫描。如果使用Ignite，Spark用户可以配置主索引和二级索引，这样可以带来上千倍的性能提升。
#### 2.1.2.Ignite DataFrames
Spark DataFrame API引入了描述数据的模式的概念，这样Ignite就可以管理模式并且将数据组织成表格的形式。简单来说，DataFrame就是一个将数据组织成命名列的分布式集合，它在概念上等价于关系数据库中的表，Spark会利用催化剂查询优化器的优势，生成一个比RDD更高效的查询执行计划，而RDD只是一个集群范围的、分区化的元素的集合。

Ignite扩展了[DataFrame](#_2-3-ignite-dataframe)，简化了开发，并且如果Ignite用作Spark的内存存储，还会改进数据访问的时间，好处包括：

 - 通过在Ignite中读写DataFrame，可以在Spark作业间共享数据和状态；
 - 使用Ignite的SQL引擎，包括高级索引以及避免Ignite和Spark之间的网络数据移动，可以优化Spark的查询执行计划，从而实现更快的SparkSQL查询。

#### 2.1.3.支持的Spark版本
Ignite有两个模块，分别支持不同的Spark版本：

 - `ignite-spark`：与Spark2.3版本集成；
 - `ignite-spark-2.4`：与Spark2.4版本集成。

### 2.2.IgniteContext和IgniteRDD
#### 2.2.1.IgniteContext
IgniteContext是Spark和Ignite集成的主要入口点。要创建一个Ignite上下文的实例，必须提供一个SparkContext的实例以及创建`IgniteConfiguration`的闭包（配置工厂）。Ignite上下文会确保Ignite服务端或者客户端节点存在于所有参与的作业实例中。或者，一个XML配置文件的路径也可以传入`IgniteContext`构造器，它会用于配置启动的节点。

当创建一个`IgniteContext`实例时，一个可选的boolean`client`参数（默认为`true`）可以传入上下文构造器，这个通常用于一个共享部署安装，当`client`设为`false`时，上下文会操作于嵌入式模式然后在上下文创建期间在所有的工作节点上启动服务端节点。可以参照[安装与部署](#_4-4-安装和部署)章节了解有关部署配置的信息。
::: warning 嵌入式模式已被废弃
嵌入式模式意味着需要在Spark执行器中启动Ignite服务端节点，这可能导致意外的再平衡甚至数据丢失，因此该模式目前已被弃用并且最终会被废弃。可以考虑启动一个单独的Ignite集群然后使用独立模式来避免数据的一致性和性能问题。
:::

一旦创建了`IgniteContext`，`IgniteRDD`的实例可以通过`fromCache`方法获得，当RDD创建之后请求的缓存在Ignite集群中是否存在不是必要的，如果指定名字的缓存不存在，会用提供的配置或者模板配置创建它。

比如，下面的代码会用默认的Ignite配置创建一个Ignite上下文：
```scala
val igniteContext = new IgniteContext(sparkContext,
    () => new IgniteConfiguration())
```
下面的代码会从`example-shared-rdd.xml`的配置创建一个Ignite上下文：
```scala
val igniteContext = new IgniteContext(sparkContext,
    "examples/config/spark/example-shared-rdd.xml")
```
#### 2.2.2.IgniteRDD
`IgniteRDD`是一个SparkRDD抽象的实现，它表示Ignite的缓存的活动视图。`IgniteRDD`不是一成不变的，Ignite缓存的所有改变（不论是它被另一个RDD或者缓存的外部改变触发）对于RDD用户都会立即可见。

`IgniteRDD`利用Ignite缓存的分区性质然后向Spark执行器提供分区信息。`IgniteRDD`中分区的数量会等于底层Ignite缓存的分区数量，`IgniteRDD`还通过`getPrefferredLocations`方法向Spark提供了关联信息使RDD计算可以使用本地的数据。

#### 2.2.3.从Ignite中读取数据
因为`IgniteRDD`是Ignite缓存的一个活动视图，因此不需要从Ignite向Spark应用显式地加载数据，在`IgniteRDD`实例创建之后所有的RDD方法都会立即可用。

比如，假定一个名为`partitioned`的Ignite缓存包含字符值，下面的代码会查找包含单词`Ignite`的所有值：
```scala
val cache = igniteContext.fromCache("partitioned")
val result = cache.filter(_._2.contains("Ignite")).collect()
```
#### 2.2.4.向Ignite保存数据
因为Ignite缓存操作于键-值对，因此向Ignite缓存保存数据的最明确的方法是使用Spark数组RDD以及`savePairs`方法，如果可能，这个方法会利用RDD分区的优势然后以并行的方式将数据存入缓存。

也可能使用`saveValues`方法将只有值的RDD存入Ignite缓存，这时，`IgniteRDD`会为每个要存入缓存的值生成一个唯一的本地关联键。

比如，下面的代码会使用10个并行存储操作保存从1到10000的整型值对到一个名为`partitioned`的缓存中：
```scala
val cacheRdd = igniteContext.fromCache("partitioned")

cacheRdd.savePairs(sparkContext.parallelize(1 to 10000, 10).map(i => (i, i)))
```
#### 2.2.5.在Ignite缓存中执行SQL查询
当Ignite缓存配置为启用索引子系统，就可以使用`objectSql`和`sql`方法在缓存中执行SQL查询。可以参照[使用SQL](/doc/java/WorkingwithSQL.md#_1-介绍)章节来了解有关Ignite SQL查询的更多信息。

比如，假定名为`partitioned`的缓存配置了索引整型对，下面的代码会获得 (10, 100)范围内的所有整型值：
```scala
val cacheRdd = igniteContext.fromCache("partitioned")

val result = cacheRdd.sql(
  "select _val from Integer where val > ? and val < ?", 10, 100)
```
#### 2.2.6.示例
GitHub上有一些示例，演示了`IgniteRDD`如何使用：

 - [Scala示例](https://github.com/apache/ignite/blob/master/examples/src/main/scala/org/apache/ignite/scalar/examples/spark/ScalarSharedRDDExample.scala)
 - [Java示例](https://github.com/apache/ignite/blob/master/examples/src/main/spark/org/apache/ignite/examples/spark/SharedRDDExample.java)

### 2.3.Ignite DataFrame
#### 2.3.1.概述
Spark DataFrame API引入了描述数据的模式的概念，这样Ignite就可以管理模式并且将数据组织成表格的形式。简单来说，DataFrame就是一个将数据组织成命名列的分布式集合，它在概念上等价于关系数据库中的表，Spark会利用催化剂查询优化器的优势，生成一个比RDD更高效的查询执行计划，而RDD只是一个集群范围的、分区化的元素的集合。

Ignite扩展了DataFrame，简化了开发，并且如果Ignite用作Spark的内存存储，还会改进数据访问的时间，好处包括：

 - 通过在Ignite中读写DataFrame，可以在Spark作业间共享数据和状态；
 - 使用Ignite的SQL引擎，包括高级索引以及避免Ignite和Spark之间的网络数据移动，可以优化Spark的查询执行计划，从而实现更快的SparkSQL查询。

#### 2.3.2.集成
`IgniteRelationProvider`是Spark`RelationProvider`和`CreatableRelationProvider`接口的一个实现，`IgniteRelationProvider`可以通过SparkSQL接口，直接访问Ignite表。数据通过`IgniteSQLRelation`进行加载和交换，其在Ignite端执行过滤操作。目前，分组、联接或者排序操作，是在Spark端进行的，在即将发布的版本中，这些操作会在Ignite端进行优化和处理。`IgniteSQLRelation`利用了Ignite架构的分区特性，并且为Spark提供了分区信息。
#### 2.3.3.Spark会话
如果要使用Spark DataFrame API，需要为Spark编程创建一个入口点，这是通过`SparkSession`对象实现的，大体如下：

<Tabs>
<Tab title="Java">

```java
// Creating spark session.
SparkSession spark = SparkSession.builder()
  .appName("Example Program")
  .master("local")
  .config("spark.executor.instances", "2")
  .getOrCreate();
```
</Tab>

<Tab title="Scala">

```scala
// Creating spark session.
implicit val spark = SparkSession.builder()
  .appName("Example Program")
  .master("local")
  .config("spark.executor.instances", "2")
  .getOrCreate()
```
</Tab>
</Tabs>

#### 2.3.4.读取DataFrame
要从Ignite中读取数据，需要指定格式以及Ignite配置文件的路径，假定如下名为`person`的Ignite表已经创建和部署：
```sql
CREATE TABLE person (
    id LONG,
    name VARCHAR,
    city_id LONG,
    PRIMARY KEY (id, city_id)
) WITH "backups=1, affinityKey=city_id”;

```
下面的Spark代码可以从`person`表检索到名字为`Mary Major`的所有行：

<Tabs>
<Tab title="Java">

```java
SparkSession spark = _
String cfgPath = “path/to/config/file”;

Dataset<Row> df = spark.read()
  .format(IgniteDataFrameSettings.FORMAT_IGNITE())              //Data source
  .option(IgniteDataFrameSettings.OPTION_TABLE(), "person")     //Table to read.
  .option(IgniteDataFrameSettings.OPTION_CONFIG_FILE(), CONFIG) //Ignite config.
  .load();

df.createOrReplaceTempView("person");

Dataset<Row> igniteDF = spark.sql(
  "SELECT * FROM person WHERE name = 'Mary Major'");
```
</Tab>

<Tab title="Scala">

```scala
val spark: SparkSession = …
val cfgPath: String = “path/to/config/file”

val df = spark.read
  .format(FORMAT_IGNITE)               // Data source type.
  .option(OPTION_TABLE, "person")      // Table to read.
  .option(OPTION_CONFIG_FILE, cfgPath) // Ignite config.
  .load()

df.createOrReplaceTempView("person")

val igniteDF = spark.sql("SELECT * FROM person WHERE name = 'Mary Major'")
```
</Tab>
</Tabs>

#### 2.3.5.保存DataFrames
::: tip 实现细节
从内部来说，所有的插入操作都是通过`IgniteDataStreamer`实现的，内部的流处理器是可以通过参数进行控制的。
:::

Ignite可以作为Spark创建和维护的DataFrame的存储层，下面的保存模式，决定了Ignite中DataFrame的处理方式：

 - `Append`：DataFrame会附加到一个已有的表，如果要更新DataFrame中的已有条目，可以配置`OPTION_STREAMER_ALLOW_OVERWRITE=true`；
 - `Overwrite`：会执行如下的步骤：
   - 如果Ignite中的表已经存在，那么会被删除；
   - 会使用DataFrame的模式以及参数创建新的表；
   - DataFrame的内容会被插入新的表。
 - `ErrorIfExists`：（默认），如果表已经存在会抛出异常，表不存在时：
   - 会使用DataFrame的模式以及参数创建新的表；
   - DataFrame的内容会被插入新的表。
 - `Ignore`：如果表已经存在会被忽略，表不存在时：
   - 会使用DataFrame的模式以及参数创建新的表；
   - DataFrame的内容会被插入新的表。

保存模式可以通过`mode(SaveMode mode)`方法指定，具体可以参照[Spark的文档](https://spark.apache.org/docs/2.2.0/api/scala/index.html#org.apache.spark.sql.DataFrameWriter@mode(saveMode:org.apache.spark.sql.SaveMode):org.apache.spark.sql.DataFrameWriter%5BT%5D)，下面是该方法的一个示例：

<Tabs>
<Tab title="Java">

```java
SparkSession spark = _

String cfgPath = “path/to/config/file”

Dataset<Row> jsonDataFrame = spark.read().json(“path/to/file.json”);

jsonDataFrame.write()
  .format(IgniteDataFrameSettings.FORMAT_IGNITE())
  .mode(SaveMode.Append) // SaveMode.
//... other options
   .save();
```
</Tab>

<Tab title="Scala">

```scala
val spark: SparkSession = …

val cfgPath: String = “path/to/config/file”

val jsonDataFrame = spark.read.json(“path/to/file.json”)

jsonDataFrame.write
  .format(FORMAT_IGNITE)
  .mode(SaveMode.Append) // SaveMode.
//... other options
  .save()
```
</Tab>
</Tabs>

如果是通过保存DataFrame的途径创建的新表，那么必须定义下面的选项：

 - `OPTION_CREATE_TABLE_PRIMARY_KEY_FIELDS`：Ignite表的主键，该选项的内容为代表主键的、逗号分隔的字段/列列表；
 - `OPTION_CREATE_TABLE_PARAMETERS`：用于Ignite表创建的附加参数，该参数为Ignite的[CREATE TABLE](/doc/java/SQLReference.md#_2-1-create-table)命令支持的参数。

下面的示例展示了如何将JSON文件的内容写入Ignite：

<Tabs>
<Tab title="Java">

```java
SparkSession spark = _

String cfgPath = “path/to/config/file”

Dataset<Row> jsonDataFrame = spark.read().json(“path/to/file.json”);

jsonDataFrame.write()
  .format(IgniteDataFrameSettings.FORMAT_IGNITE())
  .option(IgniteDataFrameSettings.OPTION_CONFIG_FILE(), TEST_CONFIG_FILE)
  .option(IgniteDataFrameSettings.OPTION_TABLE(), "json_table")
  .option(IgniteDataFrameSettings.OPTION_CREATE_TABLE_PRIMARY_KEY_FIELDS(), "id")
  .option(IgniteDataFrameSettings.OPTION_CREATE_TABLE_PARAMETERS(), "template=replicated")
  .save();
```
</Tab>

<Tab title="Scala">

```scala
val spark: SparkSession = …

val cfgPath: String = “path/to/config/file”

val jsonDataFrame = spark.read.json(“path/to/file.json”)

jsonDataFrame.write
  .format(FORMAT_IGNITE)
  .option(OPTION_CONFIG_FILE, TEST_CONFIG_FILE)
  .option(OPTION_TABLE, "json_table")
  .option(OPTION_CREATE_TABLE_PRIMARY_KEY_FIELDS, "id")
  .option(OPTION_CREATE_TABLE_PARAMETERS, "template=replicated")
  .save()
```
</Tab>
</Tabs>

#### 2.3.6.IgniteSparkSession和IgniteExternalCatalog
针对已知数据源（比如表和视图）的元信息的读取和存储，Spark引入了叫做`catalog`的实体，关于这个目录，Ignite提供了自己的实现，叫做`IgniteExternalCatalog`。

`IgniteExternalCatalog`可以读取部署在Ignite集群中的所有SQL表的元数据信息，如果要构造`IgniteSparkSession`对象，`IgniteExternalCatalog`也是必要的。

`IgniteSparkSession`是正常`SparkSession`的一个扩展，它存储了`IgniteContext`，并且在Spark对象中注入了`IgniteExternalCatalog`。

`IgniteSparkSession`可以用`IgniteSparkSession.builder()`进行创建，比如，如果下面的两张表已经创建好：
```sql
CREATE TABLE city (
    id LONG PRIMARY KEY,
    name VARCHAR
) WITH "template=replicated";

CREATE TABLE person (
    id LONG,
    name VARCHAR,
    city_id LONG,
    PRIMARY KEY (id, city_id)
) WITH "backups=1, affinityKey=city_id";
```
然后执行下面的代码，列出表的元数据信息：

<Tabs>
<Tab title="Java">

```java
// Using SparkBuilder provided by Ignite.
IgniteSparkSession igniteSession = IgniteSparkSession.builder()
  .appName("Spark Ignite catalog example")
  .master("local")
  .config("spark.executor.instances", "2")
  //Only additional option to refer to Ignite cluster.
  .igniteConfig("/path/to/ignite/config.xml")
  .getOrCreate();

// This will print out info about all SQL tables existed in Ignite.
igniteSession.catalog().listTables().show();

// This will print out schema of PERSON table.
igniteSession.catalog().listColumns("person").show();

// This will print out schema of CITY table.
igniteSession.catalog().listColumns("city").show();
```
</Tab>

<Tab title="Scala">

```scala
// Using SparkBuilder provided by Ignite.
val igniteSession = IgniteSparkSession.builder()
  .appName("Spark Ignite catalog example")
  .master("local")
  .config("spark.executor.instances", "2")
  //Only additional option to refer to Ignite cluster.
  .igniteConfig("/path/to/ignite/config.xml")
  .getOrCreate()

// This will print out info about all SQL tables existed in Ignite.
igniteSession.catalog.listTables().show()

// This will print out schema of PERSON table.
igniteSession.catalog.listColumns("person").show()

// This will print out schema of CITY table.
igniteSession.catalog.listColumns("city").show()
```
</Tab>

</Tabs>

代码输出大体如下：
```
+------+--------+-----------+---------+-----------+
|  name|database|description|tableType|isTemporary|
+------+--------+-----------+---------+-----------+
|  CITY|        |       null| EXTERNAL|      false|
|PERSON|        |       null| EXTERNAL|      false|
+------+--------+-----------+---------+-----------+

PERSON table description:

+-------+-----------+--------+--------+-----------+--------+
|   name|description|dataType|nullable|isPartition|isBucket|
+-------+-----------+--------+--------+-----------+--------+
|   NAME|       null|  string|    true|      false|   false|
|     ID|       null|  bigint|   false|       true|   false|
|CITY_ID|       null|  bigint|   false|       true|   false|
+-------+-----------+--------+--------+-----------+--------+

CITY table description:

+----+-----------+--------+--------+-----------+--------+
|name|description|dataType|nullable|isPartition|isBucket|
+----+-----------+--------+--------+-----------+--------+
|NAME|       null|  string|    true|      false|   false|
|  ID|       null|  bigint|   false|       true|   false|
+----+-----------+--------+--------+-----------+--------+
```
#### 2.3.7.Ignite DataFrame选项

|参数|描述|
|---|---|
|`FORMAT_IGNITE`|Ignite数据源的名字|
|`OPTION_CONFIG_FILE`|配置文件的路径|
|`OPTION_TABLE`|表名|
|`OPTION_CREATE_TABLE_PARAMETERS`|新创建表的额外参数，该选项的值用作`CREATE TABLE`语句的`WITH`部分。|
|`OPTION_CREATE_TABLE_PRIMARY_KEY_FIELDS`|逗号分隔的主键字段的列表。|
|`OPTION_STREAMER_ALLOW_OVERWRITE`|如果为`true`，那么已有的行会被DataFrame的内容覆写，如果为`false`并且表中对应的主键已经存在，那么后续该行会被忽略。|
|`OPTION_STREAMER_FLUSH_FREQUENCY`|自动刷新频率，这是流处理器尝试提交所有附加数据到远程节点的时间间隔。|
|`OPTION_STREAMER_PER_NODE_BUFFER_SIZE`|每节点的缓冲区大小。每个节点键-值对缓冲区的大小。|
|`OPTION_STREAMER_PER_NODE_PARALLEL_OPERATIONS`|每节点的缓冲区大小。每个节点进行并行流处理的最大数量。|

#### 2.3.8.示例
GitHub上有一些用于演示如何在Ignite中使用Spark DataFrame的示例：

 - [DataFrame](https://github.com/apache/ignite/blob/master/examples/src/main/spark/org/apache/ignite/examples/spark/IgniteDataFrameExample.scala)
 - [保存DataFrame](https://github.com/apache/ignite/blob/master/examples/src/main/spark/org/apache/ignite/examples/spark/IgniteDataFrameWriteExample.scala)
 - [Catalog](https://github.com/apache/ignite/blob/master/examples/src/main/spark/org/apache/ignite/examples/spark/IgniteCatalogExample.scala)

### 2.4.安装
#### 2.4.1.共享部署
共享部署意味着Ignite节点的运行独立于Spark应用然后即使Spark作业结束之后也仍然保存状态。类似于Spark，将Ignite部署入集群有两种方式：
##### 2.4.1.1.独立部署
在独立部署模式，Ignite节点应该与Spark工作节点部署在一起。Ignite安装的介绍可以参照[入门](/doc/2.8.0/java/#_3-入门)章节，在所有的工作节点上安装Ignite之后，通过`ignite.sh`脚本在每个配置好的Spark工作节点上启动一个节点。
##### 2.4.1.2.默认将Ignite库文件加入Spark类路径
Spark应用部署模型可以在应用启动期间动态地发布jar，但是这个模式有一些缺点：

 - Spark动态类加载器没有实现`getResource`方法，因此无法访问位于jar文件内部的资源；
 - Java的logger使用应用级类加载器（而不是上下文级类加载器）来加载日志处理器，这会导致在Ignite中使用Java logging时会抛出`ClassNotFoundException`；

有一个方法来对每一个启动的应用修改默认的Spark类路径（这个可以在每个Spark集群的机器上实现，包括主节点，工作节点以及驱动节点）。

 1. 定位到`$SPARK_HOME/conf/spark-env.sh`文件，如果该文件不存在，用`$SPARK_HOME/conf/spark-env.sh.template`这个模板创建它；
 2. 将下面的行加入`spark-env.sh`文件的末尾（如果没有全局定义`IGNITE_HOME`，则需要将设置`IGNITE_HOME`的行的注释去掉）。
```bash
# Optionally set IGNITE_HOME here.
# IGNITE_HOME=/path/to/ignite

IGNITE_LIBS="${IGNITE_HOME}/libs/*"

for file in ${IGNITE_HOME}/libs/*
do
    if [ -d ${file} ] && [ "${file}" != "${IGNITE_HOME}"/libs/optional ]; then
        IGNITE_LIBS=${IGNITE_LIBS}:${file}/*
    fi
done

export SPARK_CLASSPATH=$IGNITE_LIBS
```
从`$IGNITE_HOME/libs/optional`文件夹中复制必要的库文件，比如`ignite-log4j`，到`$IGNITE_HOME/libs`文件夹。
也可以验证Spark的类路径是否被运行`bin/spark-shell`所改变，然后输入一个简单的import语句：
```bash
scala> import org.apache.ignite.configuration._
import org.apache.ignite.configuration._
```
#### 2.4.2.嵌入式部署
::: warning 嵌入式模式已被废弃
嵌入式模式意味着需要在Spark执行器中启动Ignite服务端节点，这可能导致意外的再平衡甚至数据丢失，因此该模式目前已被弃用并且最终会被废弃。可以考虑启动一个单独的Ignite集群然后使用独立模式来避免数据的一致性和性能问题。
:::

嵌入式部署意味着Ignite节点是在Spark作业进程内部启动的，然后当作业结束时就停止了，这时不需要额外的部署步骤。Ignite代码会通过Spark的部署机制分布到Spark工作节点然后作为`IgniteContext`初始化的一部分在所有的Spark工作节点上启动节点。
#### 2.4.3.Maven
Ignite的Spark构件已经上传到[Maven中心库](http://search.maven.org/#search%7Cga%7C1%7Cg%3A%22org.apache.ignite%22)，根据使用的Scala版本，引入下面的对应的依赖：

<Tabs>
<Tab title="Scala 2.11">

```xml
<dependency>
  <groupId>org.apache.ignite</groupId>
  <artifactId>ignite-spark</artifactId>
  <version>${ignite.version}</version>
</dependency>
```
</Tab>

<Tab title="Scala 2.10">

```xml
<dependency>
  <groupId>org.apache.ignite</groupId>
  <artifactId>ignite-spark_2.10</artifactId>
  <version>${ignite.version}</version>
</dependency>
```
</Tab>
</Tabs>

#### 2.4.4.SBT
如果在Scala应用中使用SBT作为构建工具，那么可以使用下面的一行命令，将Ignite的Spark构件加入`build.sbt`：

<Tabs>
<Tab title="Scala 2.11">

```
libraryDependencies += "org.apache.ignite" % "ignite-spark" % "ignite.version"
```
</Tab>

<Tab title="Scala 2.10">

```
libraryDependencies += "org.apache.ignite" % "ignite-spark_2.10" % "ignite.version"
```
</Tab>
</Tabs>

#### 2.4.5.类路径配置
当使用IgniteRDD或者Ignite的DataFrame API时，要注意Spark的执行器以及驱动在它们的类路径中所有必需的Ignite的jar包都是可用的，Spark提供了若干种方式来修改驱动或者执行器进程的类路径。
##### 2.4.5.1.参数配置
通过使用比如`spark.driver.extraClassPath`以及`spark.executor.extraClassPath`这样的参数，可以将Ignite的jar包加入Spark，具体可以看Spark的[官方文档](https://spark.apache.org/docs/latest/configuration.html#runtime-environment)。

下面的片段演示了如何使用`spark.driver.extraClassPath`参数：
```bash
spark.executor.extraClassPath /opt/ignite/libs/*:/opt/ignite/libs/optional/ignite-spark/*:/opt/ignite/libs/optional/ignite-log4j/*:/opt/ignite/libs/optional/ignite-yarn/*:/opt/ignite/libs/ignite-spring/*
```
##### 2.4.5.2.源代码配置
Spark也提供了在源代码中配置额外的库的API，比如像下面的代码片段：
```scala
private val MAVEN_HOME = "/home/user/.m2/repository"

val spark = SparkSession.builder()
       .appName("Spark Ignite data sources example")
       .master("spark://172.17.0.2:7077")
       .getOrCreate()

spark.sparkContext.addJar(MAVEN_HOME + "/org/apache/ignite/ignite-core/2.4.0/ignite-core-2.4.0.jar")
spark.sparkContext.addJar(MAVEN_HOME + "/org/apache/ignite/ignite-spring/2.4.0/ignite-spring-2.4.0.jar")
spark.sparkContext.addJar(MAVEN_HOME + "/org/apache/ignite/ignite-log4j/2.4.0/ignite-log4j-2.4.0.jar")
spark.sparkContext.addJar(MAVEN_HOME + "/org/apache/ignite/ignite-spark/2.4.0/ignite-spark-2.4.0.jar")
spark.sparkContext.addJar(MAVEN_HOME + "/org/apache/ignite/ignite-indexing/2.4.0/ignite-indexing-2.4.0.jar")
spark.sparkContext.addJar(MAVEN_HOME + "/org/springframework/spring-beans/4.3.7.RELEASE/spring-beans-4.3.7.RELEASE.jar")
spark.sparkContext.addJar(MAVEN_HOME + "/org/springframework/spring-core/4.3.7.RELEASE/spring-core-4.3.7.RELEASE.jar")
spark.sparkContext.addJar(MAVEN_HOME + "/org/springframework/spring-context/4.3.7.RELEASE/spring-context-4.3.7.RELEASE.jar")
spark.sparkContext.addJar(MAVEN_HOME + "/org/springframework/spring-expression/4.3.7.RELEASE/spring-expression-4.3.7.RELEASE.jar")
spark.sparkContext.addJar(MAVEN_HOME + "/javax/cache/cache-api/1.0.0/cache-api-1.0.0.jar")
spark.sparkContext.addJar(MAVEN_HOME + "/com/h2database/h2/1.4.195/h2-1.4.195.jar")
```
### 2.5.用Spark-shell测试Ignite
#### 2.5.1.启动集群
这里会简要地介绍Spark和Ignite集群的启动过程，可以参照[Spark文档](https://spark.apache.org/docs/latest/)来了解详细信息。

为了测试，需要一个Spark主节点以及至少一个Spark工作节点，通常Spark主节点和Spark工作节点是不同的机器，但是为了测试可以在启动主节点的同一台机器上启动工作节点。

1. 下载和解压Spark二进制包到所有节点的同一个位置（将其设为`SPARK_HOME`）；
2. 下载和解压Ignite二进制包到所有节点的同一个位置（将其设为`IGNITE_HOME`）；
3. 转到`$SPARK_HOME`然后执行如下的命令：
    ```bash
    sbin/start-master.sh
    ```
    这个脚本会输出启动过程的日志文件的路径，可以在日志文件中查看master的URL，它的格式是：`spark://master_host:master_port`。也可以在日志文件中查看WebUI的URL（通常是`http://master_host:8080`）。
4. 转到每个工作节点的`$SPARK_HOME`然后执行如下的命令：
    ```bash
    bin/spark-class org.apache.spark.deploy.worker.Worker spark://master_host:master_port
    ```
    这里的`spark://master_host:master_port`就是从上述的主节点的日志文件中抓取的主节点的URL。在所有的工作节点都启动之后可以查看主节点的WebUI界面，它会显示所有的处于`ALIVE`状态的已经注册的工作节点。
5. 转到每个工作节点的`$IGNITE_HOME`目录然后通过运行如下的命令启动一个Ignite节点：
    ```bash
    bin/ignite.sh
    ```

这时可以看到通过默认的配置Ignite节点会彼此发现对方。如果网络不允许多播通信，那么需要修改默认的配置文件然后配置TCP发现。
#### 2.5.2.使用Spark-Shell
现在，在集群启动运行之后，可以运行`spark-shell`来验证这个集成：

1. 启动spark-shell：

   - 还可能需要提供Ignite部件的Maven坐标（如果需要，可以使用`--repositories`参数，但是它可能会被忽略）：
    ```bash
    ./bin/spark-shell
        --packages org.apache.ignite:ignite-spark:1.8.0
    --master spark://master_host:master_port
    --repositories http://repo.maven.apache.org/maven2/org/apache/ignite
    ```
   - 或者也可以通过`--jars`参数提供指向Ignite的jar文件的路径：
    ```bash
    ./bin/spark-shell --jars path/to/ignite-core.jar,path/to/ignite-spark.jar,path/to/cache-api.jar,path/to/ignite-log4j.jar,path/to/log4j.jar --master spark://master_host:master_port
    ```
    这时可以看到Spark shell已经启动了。

    注意，如果打算使用Spring的配置进行加载，则需要同时添加`ignite-spring`的依赖。
    ```bash
    ./bin/spark-shell
        --packages org.apache.ignite:ignite-spark:1.8.0,org.apache.ignite:ignite-spring:1.8.0
    --master spark://master_host:master_port
    ```
2. 通过默认的配置创建一个Ignite上下文的实例：
    ```scala
    import org.apache.ignite.spark._
    import org.apache.ignite.configuration._

    val ic = new IgniteContext(sc, () => new IgniteConfiguration())
    ```
    然后可以看到一些像下面这样的：
    ```
    ic: org.apache.ignite.spark.IgniteContext = org.apache.ignite.spark.IgniteContext@62be2836
    ```
    创建一个IgniteContext实例的另一个方式是使用一个配置文件，注意如果指向配置文件的路径是相对形式的，那么`IGNITE_HOME`环境变量应该是在系统中全局设定的，因为路径的解析是相对于`IGNITE_HOME`的。
    ```scala
    import org.apache.ignite.spark._
    import org.apache.ignite.configuration._

    val ic = new IgniteContext(sc, "examples/config/spark/example-shared-rdd.xml")
    ```
3. 通过使用默认配置中的"partitioned"缓存创建一个IgniteRDD的实例：
    ```scala
    val sharedRDD = ic.fromCache[Integer, Integer]("partitioned")
    ```
    然后可以看到为partitioned缓存创建了一个RDD的实例：
    ```scala
    shareRDD: org.apache.ignite.spark.IgniteRDD[Integer,Integer] = IgniteRDD[0] at RDD at IgniteAbstractRDD.scala:27
    ```
    注意RDD的创建是一个本地的操作，并不会在Ignite集群上创建缓存。
4. 这时可以用RDD让Spark做一些事情，比如，获取值小于10的所有键-值对：
    ```scala
    sharedRDD.filter(_._2 < 10).collect()
    ```
    因为缓存还没有数据，因此结果会是一个空的数组：
    ```scala
    res0: Array[(Integer, Integer)] = Array()
    ```
    可以查看远程spark工作节点的日志文件然后可以看到Ignite上下文如何在集群内的所有远程工作节点上启动客户端。也可以启动命令行Visor然后查看`partitioned`缓存已经创建了。
5. 在Ignite中保存一些值：
    ```scala
    sharedRDD.savePairs(sc.parallelize(1 to 100000, 10).map(i => (i, i)))
    ```
    运行这个命令后可以通过命令行Visor查看缓存的大小是100000个元素。
6. 现在要检查之前创建的状态在作业重启之后如何保持，关闭spark-shell然后重复步骤1-3，这时会再一次为partitioned缓存创建了Ignite上下文和RDD的实例，现在可以查看在RDD中有多少值大于50000的键：
    ```scala
    sharedRDD.filter(_._2 > 50000).count
    ```
    因为在缓存中加入了从1到100000的连续数值，那么会得到结果`50000`：
    ```scala
    res0: Long = 50000
    ```

### 2.6.发现并解决的问题

 - **在IgniteRDD上调用任何活动时Spark应用或者Spark shell没有响应**
    如果在客户端模式（默认模式）下创建`IgniteContext`然后又没有任何Ignite服务端节点启动时，就会发生这种情况，这时Ignite客户端会一直等待服务端节点启动或者超过集群连接超时时间后失败。当在客户端节点使用`IgniteContext`时应该启动至少一个服务端节点。
 - **当使用IgniteContext时，抛出了` java.lang.ClassNotFoundException`和`org.apache.ignite.logger.java.JavaLoggerFileHandler`**
    在类路径中没有任何日志实现然后Ignite会试图使用标准的Java日志时，这个问题就会发生。Spark默认会使用单独的类加载器加载用户的所有jar文件，而Java日志框架是使用应用级类加载器来初始化日志处理器。要解决这个问题，可以将`ignite-log4j`模块加入使用的jar列表以使Ignite使用log4J作为日志记录器，或者就像[安装](#_2-4-安装)章节中描述的那样修改Spark的默认类路径。

## 3.Hibernate二级缓存
### 3.1.概述
Ignite可以用做[Hibernate](http://hibernate.org/)的二级缓存，它可以显著地提升应用持久化层的性能。

Hibernate数据库映射对象的所有工作都是在一个会话中完成的，通常绑定到一个工作节点线程或者Web会话。Hibernate默认只会使用Session级的缓存（一级缓存），因此，缓存在一个会话中的对象，对于另一个会话是不可见的。不过如果用的是全局二级缓存，它缓存的所有对象对于用同一个缓存配置的所有会话都是可见的。这通常会带来性能的显著提升，因为每一个新创建的会话都可以利用二级缓存（它比任何会话级L1缓存都要长寿）中已有的数据的好处。

![](https://ignite.apache.org/docs/2.9.0/images/integrations/hibernate-l2-cache.png)

一级缓存是一直启用的而且是由Hibernate内部实现的，而二级缓存是可选的而且有很多的可插拔的实现。Ignite可以作为L2缓存的实现非常容易地嵌入，而且可以用于所有的访问模式（`READ_ONLY`,`READ_WRITE`,`NONSTRICT_READ_WRITE`和`TRANSACTIONAL`），支持广泛的相关特性：

 - 缓存到内存和磁盘以及堆外内存；
 - 缓存事务；
 - 集群，有2种不同的复制模式，`复制`和`分区`。

如果要将Ignite作为Hibernate的二级缓存，需要简单的3个步骤：

 - 将Ignite的库文件添加到应用的类路径；
 - 启用二级缓存以及在二级缓存的配置文件中指定Ignite的实现类；
 - 为二级缓存配置Ignite缓存区域以及启动嵌入式的Ignite节点（也可以选择外部的节点）。

本章节的后面会详细介绍这些步骤的细节。
### 3.2.二级缓存配置
要将Ignite配置为Hibernate的二级缓存，不需要修改已有的Hibernate代码，只需要：

 - 在工程中添加`ignite-hibernate_5.1`或者`ignite-hibernate_4.2`模块的依赖，或者，如果是从命令行启动节点，也可以从`{apache_ignite_relese}/libs/optional`中拷贝同名的jar文件到`{apache_ignite_relese}/libs`文件夹；
 - 配置Hibernate使用Ignite作为二级缓存；
 - 正确地配置Ignite缓存。

#### 3.2.1.Maven配置
要在项目中添加Ignite-hibernate集成，需要将下面的依赖加入POM文件：

<Tabs>
<Tab title="Hibernate5">

```xml
<dependency>
  <groupId>org.apache.ignite</groupId>
  <artifactId>ignite-hibernate_5.3</artifactId>
  <version>${ignite.version}</version>
</dependency>
```
</Tab>

<Tab title="Hibernate4">

```xml
<dependency>
  <groupId>org.apache.ignite</groupId>
  <artifactId>ignite-hibernate_4.2</artifactId>
  <version>${ignite.version}</version>
</dependency>
```
</Tab>
</Tabs>

#### 3.2.2.Hibernate配置示例
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

#### 3.2.3.Ignite配置示例
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

<Tabs>
<Tab title="Linux">

```shell
$IGNITE_HOME/bin/ignite.sh my-config-folder/my-ignite-configuration.xml
```
</Tab>

<Tab title="Windows">

```batch
$IGNITE_HOME\bin\ignite.bat my-config-folder\my-ignite-configuration.xml
```
</Tab>
</Tabs>

::: tip 提示
节点也可以在其它主机上启动，以形成一个分布式的缓存集群，一定要确保在配置文件中指定正确的网络参数。
:::

### 3.3.查询缓存
除了二级缓存，Hibernate还提供了查询缓存，这个缓存存储了通过指定参数集进行查询的结果(或者是HQL或者是Criteria)，因此，当重复用同样的参数集进行查询时，它会命中缓存而不会去访问数据库。

查询缓存对于反复用同样的参数集进行查询时是有用的。像二级缓存的场景一样，Hibernate依赖于一个第三方的缓存实现，Ignite也可以这样用。
### 3.4.查询缓存配置
上面的配置信息完全适用于查询缓存，但是额外的配置和代码变更还是必要的。
#### 3.4.1.Hibernate配置
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
#### 3.4.2.Ignite配置
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
### 3.5.示例
GitHub上有完整的[示例](https://github.com/apache/ignite/blob/master/examples/src/main/java-lgpl/org/apache/ignite/examples/datagrid/hibernate/HibernateL2CacheExample.java)。
## 4.MyBatis二级缓存
Ignite可以作为MyBatis的二级缓存使用，从而在整个集群中分布和缓存数据。

如果是一个Maven用户，可以简单地在`pom.xml`中添加如下的依赖：
```xml
<dependencies>
  ...
  <dependency>
    <groupId>org.mybatis.caches</groupId>
    <artifactId>mybatis-ignite</artifactId>
    <version>1.0.5</version>
  </dependency>
  ...
</dependencies>
```
或者，也可以下载[zip包](https://github.com/mybatis/ignite-cache/releases)，解压缩之后将jar文件加入类路径。

然后，只需要像下面这样在映射XML文件中指定即可：
```xml
<mapper namespace="org.acme.FooMapper">
  <cache type="org.mybatis.caches.ignite.IgniteCacheAdapter" />
</mapper>
```
然后在`config/default-config.xml`中配置Ignite缓存（可以简单地参考下[github](https://github.com/mybatis/ignite-cache/tree/master/config)中的配置）。
## 5.流处理
### 5.1.Kafka流处理器
#### 5.1.1.概述
Apache Ignite的Kafka流处理器模块提供了从Kafka到Ignite缓存的流处理功能，下面两个方法中的任何一个都可以用于获得这样的流处理功能：

 - 使用带有Ignite接收器的Kafka连接器功能；
 - 在Maven工程中导入Kafka的流处理器模块然后实例化KafkaStreamer用于数据流处理。

#### 5.1.2.通过Kafka Connect的数据流
通过从Kafka的主题拉取数据然后将其写入特定的Ignite缓存，IgniteSinkConnector可以用于将数据从Kafka导入Ignite缓存。
连接器位于`optional/ignite-kafka`，它和它的依赖需要位于一个Kafka运行实例的类路径中，下面会详细描述。关于Kafka Connect的更多信息，可以参考[Kafka文档](http://kafka.apache.org/documentation.html#connect)。
##### 5.1.2.1.设置和运行

 1. 将下面的jar包放入Kafka的类路径：
    ```
    ignite-kafka-x.x.x.jar <-- with IgniteSinkConnector
    ignite-core-x.x.x.jar
    cache-api-1.0.0.jar
    ignite-spring-1.5.0-SNAPSHOT.jar
    spring-aop-4.1.0.RELEASE.jar
    spring-beans-4.1.0.RELEASE.jar
    spring-context-4.1.0.RELEASE.jar
    spring-core-4.1.0.RELEASE.jar
    spring-expression-4.1.0.RELEASE.jar
    commons-logging-1.1.1.jar
    ```
 2. 准备工作节点的配置，比如；
    ```properties
    bootstrap.servers=localhost:9092

    key.converter=org.apache.kafka.connect.storage.StringConverter
    value.converter=org.apache.kafka.connect.storage.StringConverter
    key.converter.schemas.enable=false
    value.converter.schemas.enable=false

    internal.key.converter=org.apache.kafka.connect.storage.StringConverter
    internal.value.converter=org.apache.kafka.connect.storage.StringConverter
    internal.key.converter.schemas.enable=false
    internal.value.converter.schemas.enable=false

    offset.storage.file.filename=/tmp/connect.offsets
    offset.flush.interval.ms=10000
    ```
 3. 准备连接器的配置，比如：
    ```properties
    # connector
    name=my-ignite-connector
    connector.class=org.apache.ignite.stream.kafka.connect.IgniteSinkConnector
    tasks.max=2
    topics=someTopic1,someTopic2

    # cache
    cacheName=myCache
    cacheAllowOverwrite=true
    igniteCfg=/some-path/ignite.xml
    singleTupleExtractorCls=my.company.MyExtractor
    ```
    - 这里`cacheName`等于`some-path/ignite.xml`中指定的缓存名，之后`someTopic1,someTopic2`主题的数据就会被拉取和存储；
    - 如果希望覆盖缓存中的已有值，可以将`cacheAllowOverwrite`设置为`true`；
    - 如果需要解析输入的数据然后形成新的键和值，则需要实现一个`StreamSingleTupleExtractor`然后像上面那样指定`singleTupleExtractorCls`；
    - 还可以设置`cachePerNodeDataSize`和`cachePerNodeParOps`，用于调整每个节点的缓冲区以及每个节点中并行流操作的最大值。
 4. 启动连接器，作为一个示例，像下面这样在独立模式中：
    ```bash
    bin/connect-standalone.sh myconfig/connect-standalone.properties myconfig/ignite-connector.properties
    ```

##### 5.1.2.2.流程检查
要执行一个非常基本的功能检查，可以这样做：

 1. 启动Zookeeper；
    ```bash
    bin/zookeeper-server-start.sh config/zookeeper.properties
    ```
 2. 启动Kafka服务：
    ```bash
    bin/kafka-server-start.sh config/server.properties
    ```
 3. 为Kafka服务提供一些数据：
    ```bash
    bin/kafka-console-producer.sh --broker-list localhost:9092 --topic test --property parse.key=true --property key.separator=,
    k1,v1
    ```
 4. 启动连接器：
    ```bash
    bin/connect-standalone.sh myconfig/connect-standalone.properties myconfig/ignite-connector.properties
    ```
 5. 检查缓存中的值，比如，通过REST API：
    ```
    http://node1:8080/ignite?cmd=size&cacheName=cache1
    ```
#### 5.1.3.使用Ignite的Kafka流处理器模块的数据流
如果使用Maven来管理项目的依赖，首先要像下面这样添加Kafka流处理器的模块依赖(将'${ignite.version}'替换为实际的版本号)：
```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                        http://maven.apache.org/xsd/maven-4.0.0.xsd">
    ...
    <dependencies>
        ...
        <dependency>
            <groupId>org.apache.ignite</groupId>
            <artifactId>ignite-kafka</artifactId>
            <version>${ignite.version}</version>
        </dependency>
        ...
    </dependencies>
    ...
</project>
```
假定有一个缓存，键和值都是*String*类型，可以像下面这样启动流处理器：
```java
KafkaStreamer<String, String> kafkaStreamer = new KafkaStreamer<>();

IgniteDataStreamer<String, String> stmr = ignite.dataStreamer("myCache"));

// allow overwriting cache data
stmr.allowOverwrite(true);

kafkaStreamer.setIgnite(ignite);
kafkaStreamer.setStreamer(stmr);

// set the topic
kafkaStreamer.setTopic(someKafkaTopic);

// set the number of threads to process Kafka streams
kafkaStreamer.setThreads(4);

// set Kafka consumer configurations
kafkaStreamer.setConsumerConfig(kafkaConsumerConfig);

// set extractor
kafkaStreamer.setSingleTupleExtractor(strExtractor);

kafkaStreamer.start();

...

// stop on shutdown
kafkaStreamer.stop();

strm.close();
```
要了解有关Kafka消费者属性的详细信息，可以参照[Kafka文档](http://kafka.apache.org/documentation.html)。
### 5.2.Camel流处理器
#### 5.2.1.概述
本章节聚焦于[Apache Camel](http://camel.apache.org/)流处理器，它也可以被视为一个*统一的流处理器*，因为它可以从Camel支持的任何技术或者协议中消费消息然后注入一个Ignite缓存。

![](https://ignite.apache.org/docs/2.9.0/images/integrations/camel-streamer.png)

使用这个流处理器，基于如下技术可以将数据条目注入一个Ignite缓存：

 - 通过提取消息头和消息体，调用一个Web服务(SOAP或者REST)；
 - 为消息监听一个TCP或者UDP通道；
 - 通过FTP接收文件的内容或者写入本地文件系统；
 - 通过POP3或者IMAP发送接收到的消息；
 - 一个MongoDB Tailable游标；
 - 一个AWS SQS队列；
 - 其它的。

这个流处理器支持两种提取模式，**直接提取**和**间接提取**。

::: tip 一个Ignite Camel组件
还有一个[camel-ignite组件](https://camel.apache.org/ignite.html)，通过该组件，可以与Ignite缓存、计算、事件、消息等进行交互。
:::
#### 5.2.2.Maven依赖
要使用`ignite-camel`流处理器，需要添加下面的依赖：
```xml
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-camel</artifactId>
    <version>${ignite.version}</version>
</dependency>
```
它也将`camel-core`作为传递依赖引入。
#### 5.2.3.直接提取
直接提取使得通过一个提取器元组的帮助可以从任意Camel端点获得消息然后直接进入Ignite，这个被称为**直接提取**。

下面是一个代码示例：
```java
// Start Apache Ignite.
Ignite ignite = Ignition.start();

// Create an streamer pipe which ingests into the 'mycache' cache.
IgniteDataStreamer<String, String> pipe = ignite.dataStreamer("mycache");

// Create a Camel streamer and connect it.
CamelStreamer<String, String> streamer = new CamelStreamer<>();
streamer.setIgnite(ignite);
streamer.setStreamer(pipe);

// This endpoint starts a Jetty server and consumes from all network interfaces on port 8080 and context path /ignite.
streamer.setEndpointUri("jetty:http://0.0.0.0:8080/ignite?httpMethodRestrict=POST");

// This is the tuple extractor. We'll assume each message contains only one tuple.
// If your message contains multiple tuples, use a StreamMultipleTupleExtractor.
// The Tuple Extractor receives the Camel Exchange and returns a Map.Entry<?,?> with the key and value.
streamer.setSingleTupleExtractor(new StreamSingleTupleExtractor<Exchange, String, String>() {
    @Override public Map.Entry<String, String> extract(Exchange exchange) {
        String stationId = exchange.getIn().getHeader("X-StationId", String.class);
        String temperature = exchange.getIn().getBody(String.class);
        return new GridMapEntry<>(stationId, temperature);
    }
});

// Start the streamer.
streamer.start();
```
#### 5.2.4.间接提取
多于更多的复杂场景，也可以创建一个Camel route在输入的消息上执行复杂的处理，比如转换、验证、拆分、聚合、幂等、重新排序、富集等，然后只是将结果注入Ignite缓存，这个被称为**间接提取**。
```java
// Create a CamelContext with a custom route that will:
//  (1) consume from our Jetty endpoint.
//  (2) transform incoming JSON into a Java object with Jackson.
//  (3) uses JSR 303 Bean Validation to validate the object.
//  (4) dispatches to the direct:ignite.ingest endpoint, where the streamer is consuming from.
CamelContext context = new DefaultCamelContext();
context.addRoutes(new RouteBuilder() {
    @Override
    public void configure() throws Exception {
        from("jetty:http://0.0.0.0:8080/ignite?httpMethodRestrict=POST")
            .unmarshal().json(JsonLibrary.Jackson)
            .to("bean-validator:validate")
            .to("direct:ignite.ingest");
    }
});

// Remember our Streamer is now consuming from the Direct endpoint above.
streamer.setEndpointUri("direct:ignite.ingest");
```
#### 5.2.5.设置一个响应
响应默认只是简单地将一个原来的请求的副本反馈给调用者（如果是一个同步端点）。如果希望定制这个响应，需要设置一个Camel的`Processor`作为一个`responseProcessor`。
```java
streamer.setResponseProcessor(new Processor() {
    @Override public void process(Exchange exchange) throws Exception {
        exchange.getOut().setHeader(Exchange.HTTP_RESPONSE_CODE, 200);
        exchange.getOut().setBody("OK");
    }
});
```
### 5.3.Flink流处理器
Apache Ignite Flink接收器模块是一个流处理连接器，它可以将Flink数据注入Ignite缓存，该接收器会将输入的数据注入Ignite缓存。每当创建一个接收器，都需要提供一个Ignite缓存名和Ignite网格配置文件。

通过如下步骤，可以开启到Ignite缓存的数据注入：

 1. 在Maven工程中导入Ignite的Flink接收器模块。如果使用Maven来进行项目依赖管理，可以像下面这样添加Flink模块依赖（将`${ignite.version}`替换为实际使用的版本）；
    ```xml
    <project xmlns="http://maven.apache.org/POM/4.0.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                            http://maven.apache.org/xsd/maven-4.0.0.xsd">
        ...
        <dependencies>
            ...
            <dependency>
                <groupId>org.apache.ignite</groupId>
                <artifactId>ignite-flink</artifactId>
                <version>${ignite.version}</version>
            </dependency>
            ...
        </dependencies>
        ...
    </project>
    ```
 2. 创建一个Ignite配置文件，并且确保它可以被Sink访问；
 3. 确保输入接收器的数据被指定然后启动接收器；

    ```java
    IgniteSink igniteSink = new IgniteSink("myCache", "ignite.xml");

    igniteSink.setAllowOverwrite(true);
    igniteSink.setAutoFlushFrequency(10);
    igniteSink.start();

    DataStream<Map> stream = ...;

    // Sink data into the grid.
    stream.addSink(igniteSink);
    try {
        env.execute();
    } catch (Exception e){
        // Exception handling.
    }
    finally {
        igniteSink.stop();
    }
    ```

可以参考`ignite-flink`模块的javadoc来了解可用选项的详细信息。
### 5.4.Flume流处理器
#### 5.4.1.概述
Apache Flume是一个高效的收集、汇总以及移动大量的日志数据的分布式的、高可靠和高可用的服务（[https://github.com/apache/flume](https://github.com/apache/flume)）。

IgniteSink是一个Flume接收器，它会从相对应的Flume通道中提取事件然后将数据注入Ignite缓存。

在启动Flume代理之前，就像下面章节描述的，`IgniteSink`及其依赖需要包含在代理的类路径中。
#### 5.4.2.设置

 1. 通过实现EventTransformer接口创建一个转换器；
 2. 在${FLUME_HOME}中的plugins.d目录下创建`ignite`子目录，如果plugins.d目录不存在，创建它；
 3. 构建前述的转换器并且拷贝到`${FLUME_HOME}/plugins.d/ignite/lib`目录；
 4. 从Ignite二进制包中拷贝其它的Ignite相关的jar包到`${FLUME_HOME}/plugins.d/ignite/libext`，如下所示；
    ```
    plugins.d/
    `-- ignite
    |-- lib
    |   `-- ignite-flume-transformer-x.x.x.jar <-- your jar
    `-- libext
        |-- cache-api-1.0.0.jar
        |-- ignite-core-x.x.x.jar
        |-- ignite-flume-x.x.x.jar <-- IgniteSink
        |-- ignite-spring-x.x.x.jar
        |-- spring-aop-4.1.0.RELEASE.jar
        |-- spring-beans-4.1.0.RELEASE.jar
        |-- spring-context-4.1.0.RELEASE.jar
        |-- spring-core-4.1.0.RELEASE.jar
        `-- spring-expression-4.1.0.RELEASE.jar
    ```
 5. 在Flume配置文件中，指定带有缓存属性的Ignite XML配置文件的位置（可以将`flume/src/test/resources/example-ignite.xml`作为一个基本的样例），缓存属性中包含要创建缓存的缓存名称（与Ignite配置文件中的相同），`EventTransformer`的实现类以及可选的批处理大小。所有的属性都显示在下面的表格中（必须项为粗体）。

|属性名称|默认值|描述|
|---|---|---|
|`channel`||-|
|`type`|组件类型名，应该为`org.apache.ignite.stream.flume.IgniteSink`|-|
|`igniteCfg`|Ignite的XML配置文件|-|
|`cacheName`|缓存名，与igniteCfg中的一致|-|
|`eventTransformer`|org.apache.ignite.stream.flume.EventTransformer的实现类名|-|
|`batchSize`|每事务要写入的事件数|100|

名字为`a1`的接收代理配置片段如下所示：
```properties
a1.sinks.k1.type = org.apache.ignite.stream.flume.IgniteSink
a1.sinks.k1.igniteCfg = /some-path/ignite.xml
a1.sinks.k1.cacheName = testCache
a1.sinks.k1.eventTransformer = my.company.MyEventTransformer
a1.sinks.k1.batchSize = 100
```
指定代码和配置后（可以参照Flume的文档），就可以运行Flume的代理了。
### 5.5.JMS流处理器
#### 5.5.1.概述
Ignite提供了一个JMS数据流处理器，它会从JMS代理中消费消息，将消息转换为缓存数据格式然后插入Ignite缓存。

这个数据流处理器支持如下的特性：

 - 从队列或者主题中消费消息；
 - 支持从主题长期订阅；
 - 通过`threads`参数支持并发的消费者；
   - 当从队列中消费消息时，这个组件会启动尽可能多的`会话`对象，每个都持有单独的`MessageListener`实例，因此实现了*自然*的并发；
   - 当从主题消费消息时，显然无法启动多个线程，因为这样会导致消费重复的消息，因此，通过一个内部的线程池来实现*虚拟*的并发。
 - 通过`transacted`参数支持事务级的会话；
 - 通过`batched`参数支持批量的消费，它会对在一个本地JMS事务的范围内接受的消息进行分组（不需要支持XA）。依赖于代理，这个技术提供了一个很高的吞吐量，因为它减少了必要的消息往返确认的量，虽然存在复制消息的开销（特别是在事务的中间发生了一个事件）。
   - 当达到`batchClosureMillis`时间或者会话收到了至少`batchClosureSize`消息后批次会被提交；
   - 基于时间的闭包按照设定的频率触发，然后并行地应用到所有的`会话`；
   - 基于大小的闭包会应用到所有单独的`会话`（因为事务在JMS中是会话绑定的），因此当该`会话`消费了那么多消息后就会被触发。
   - 两个选项是互相兼容的，可以禁用任何一个，但是当批次启用之后不能两个都启用。
 - 支持通过实现特定的`Destination`对象或者名字来指定目的地。

本实现已经在[Apache ActiveMQ](http://activemq.apache.org/)中进行了测试，但是只要客户端库实现了[JMS 1.1 规范](http://download.oracle.com/otndocs/jcp/7195-jms-1.1-fr-spec-oth-JSpec/)的所有JMS代理都是支持的。
#### 5.5.2.实例化JMS流处理器
实例化JMS流处理器时，需要具体化下面的泛型：

 - `T extends Message`：流处理器会接收到的JMS`Message`的类型，如果它可以接收多个，可以使用通用的`Message`类型；
 - `K` ：缓存键的类型；
 - `V` ：缓存值的类型；

要配置JMS流处理器，还需要提供如下的必要属性：

 - `connectionFactory`：`ConnectionFactory`的实例，通过代理进行必要的配置，它也可以是一个`ConnectionFactory`池；
 - `destination`或者(`destinationName`和`destinationType`)：一个`Destination`对象（通常是一个代理指定的JMS`Queue`或者`Topic`接口的实现），或者是目的地名字的组合（队列或者主题名）和到或者`Queue`或者`Topic`的`Class`引用的类型， 在后一种情况下，流处理器通过`Session.createQueue(String)`或者`Session.createTopic(String)`来获得一个目的地；
 - `transformer`：一个`MessageTransformer<T, K, V>`的实现，它会消化一个类型为`T`的JMS消息然后产生一个要添加的缓存条目` Map<K, V>`，它也可以返回`null`或者空的`Map`来忽略传入的消息。

#### 5.5.3.示例
下面的示例通过`String`类型的键和`String`类型的值来填充一个缓存，要消费的`TextMessage`格式如下：
```
raulk,Raul Kripalani
dsetrakyan,Dmitriy Setrakyan
sv,Sergi Vladykin
gm,Gianfranco Murador
```
下面是代码：
```java
// create a data streamer
IgniteDataStreamer<String, String> dataStreamer = ignite.dataStreamer("mycache"));
dataStreamer.allowOverwrite(true);

// create a JMS streamer and plug the data streamer into it
JmsStreamer<TextMessage, String, String> jmsStreamer = new JmsStreamer<>();
jmsStreamer.setIgnite(ignite);
jmsStreamer.setStreamer(dataStreamer);
jmsStreamer.setConnectionFactory(connectionFactory);
jmsStreamer.setDestination(destination);
jmsStreamer.setTransacted(true);
jmsStreamer.setTransformer(new MessageTransformer<TextMessage, String, String>() {
    @Override
    public Map<String, String> apply(TextMessage message) {
        final Map<String, String> answer = new HashMap<>();
        String text;
        try {
            text = message.getText();
        }
        catch (JMSException e) {
            LOG.warn("Could not parse message.", e);
            return Collections.emptyMap();
        }
        for (String s : text.split("\n")) {
            String[] tokens = s.split(",");
            answer.put(tokens[0], tokens[1]);
        }
        return answer;
    }
});

jmsStreamer.start();

// on application shutdown
jmsStreamer.stop();
dataStreamer.close();
```
要使用这个组件，必须通过构建系统(Maven, Ivy, Gradle,sbt等)导入如下的模块:
```xml
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-jms11</artifactId>
    <version>${ignite.version}</version>
</dependency>
```
### 5.6.MQTT流处理器
#### 5.6.1.概述
该流处理器使用[Eclipse Paho](https://eclipse.org/paho/)作为MQTT客户端，从一个MQTT主题消费消息，然后将键-值对提供给`IgniteDataStreamer`实例。

必须提供一个流的元组提取器(不管是单条目的，还是多条目的提取器)来处理传入的消息，然后提取元组以插入缓存。

这个流处理器支持：

 - 一次订阅一个或者多个主题；
 - 为一个主题或者多个主题指定订阅者的QoS；
 - 设置[MqttConnectOptions](https://www.eclipse.org/paho/files/javadoc/org/eclipse/paho/client/mqttv3/MqttConnectOptions.html)以开启比如*会话持久化*这样的特性；
 - 指定客户端ID。如果未指定会生成以及维护一个随机的ID，指导重新连接；
 - (重新)连接重试可以通过[guava-retrying库](https://github.com/rholder/guava-retrying)实现，*重试等待*和*重试停止*是可以配置的；
 - 直到客户端第一次连接，都会阻塞start()方法。

#### 5.6.2.示例
下面的代码显示了如何使用这个流处理器：
```java
// Start Ignite.
Ignite ignite = Ignition.start();

// Get a data streamer reference.
IgniteDataStreamer<Integer, String> dataStreamer = grid().dataStreamer("mycache");

// Create an MQTT data streamer
MqttStreamer<Integer, String> streamer = new MqttStreamer<>();
streamer.setIgnite(ignite);
streamer.setStreamer(dataStreamer);
streamer.setBrokerUrl(brokerUrl);
streamer.setBlockUntilConnected(true);

// Set a single tuple extractor to extract items in the format 'key,value' where key => Int, and value => String
// (using Guava here).
streamer.setSingleTupleExtractor(new StreamSingleTupleExtractor<MqttMessage, Integer, String>() {
    @Override public Map.Entry<Integer, String> extract(MqttMessage msg) {
        List<String> s = Splitter.on(",").splitToList(new String(msg.getPayload()));

        return new GridMapEntry<>(Integer.parseInt(s.get(0)), s.get(1));
    }
});

// Consume from multiple topics at once.
streamer.setTopics(Arrays.asList("def", "ghi", "jkl", "mno"));

// Start the MQTT Streamer.
streamer.start();
```
要了解有关选项的更多信息，可以参考`ignite-mqtt`模块的javadoc。
### 5.7.RocketMQ流处理器
这个流处理器模块提供了从[Apache RocketMQ](https://github.com/apache/incubator-rocketmq)到Ignite的流化处理功能。

如果要使用Ignite的RocketMQ流处理器模块：

 1. 将其导入自己的Maven工程，如果使用Maven管理项目的依赖，需要添加RocketMQ的模块依赖（将`${ignite.version}`替换为实际使用的Ignite版本），如下所示：
    ```xml
    <project xmlns="http://maven.apache.org/POM/4.0.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                            http://maven.apache.org/xsd/maven-4.0.0.xsd">
        ...
        <dependencies>
            ...
            <dependency>
                <groupId>org.apache.ignite</groupId>
                <artifactId>ignite-rocketmq</artifactId>
                <version>${ignite.version}</version>
            </dependency>
            ...
        </dependencies>
        ...
    </project>
    ```
 2. 实现`StreamSingleTupleExtractor`或者`StreamMultipleTupleExtractor`，看下面的`MyTupleExtractor`示例。
对于一个简单的实现，可以看看`RocketMQStreamerTest.java`；
 3. 初始化之后启动：
    ```java
    IgniteDataStreamer<String, byte[]> dataStreamer = ignite.dataStreamer(MY_CACHE));

    dataStreamer.allowOverwrite(true);
    dataStreamer.autoFlushFrequency(10);

    streamer = new RocketMQStreamer<>();

    //configure.
    streamer.setIgnite(ignite);
    streamer.setStreamer(dataStreamer);
    streamer.setNameSrvAddr(NAMESERVER_IP_PORT);
    streamer.setConsumerGrp(CONSUMER_GRP);
    streamer.setTopic(TOPIC_NAME);
    streamer.setMultipleTupleExtractor(new MyTupleExtractor());

    streamer.start();

    ...

    // stop on shutdown
    streamer.stop();

    dataStreamer.close();
    ```

在javadoc中可以找到更多可用选项的信息。
### 5.8.Storm流处理器
Apache Ignite的Storm流处理器模块提供了从Storm到Ignite缓存的流处理功能。

通过如下步骤可以将数据注入Ignite缓存：

 1. 在Maven工程中导入Ignite的Storm流处理器模块。如果使用Maven来管理项目的依赖，可以添加Storm模块依赖（将`${ignite.version}`替换为实际使用的版本），如下所示：
    ```xml
    <project xmlns="http://maven.apache.org/POM/4.0.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                            http://maven.apache.org/xsd/maven-4.0.0.xsd">
        ...
        <dependencies>
            ...
            <dependency>
                <groupId>org.apache.ignite</groupId>
                <artifactId>ignite-storm</artifactId>
                <version>${ignite.version}</version>
            </dependency>
            ...
        </dependencies>
        ...
    </project>
    ```
 2. 创建一个Ignite配置文件（可以以modules/storm/src/test/resources/example-ignite.xml文件作为示例）并且确保它可以被流处理器访问；
 3. 确保输入流处理器的键值数据通过名为`ignite`的属性指定（或者通过StormStreamer.setIgniteTupleField(...)也可以指定一个不同的）。作为一个示例可以看`TestStormSpout.declareOutputFields(...)`。
 4. 为流处理器创建一个拓扑，带有所有依赖制作一个jar文件然后运行如下的命令：
    ```bash
    storm jar ignite-storm-streaming-jar-with-dependencies.jar my.company.ignite.MyStormTopology
    ```

### 5.9.ZeroMQ流处理器
Ignite的ZeroMQ流处理器模块具有将[ZeroMQ](http://zeromq.org/)数据流注入Ignite缓存的功能。
要将数据流注入Ignite缓存，需要按照如下步骤操作：

 1. 将Ignite的ZeroMQ流处理器模块加入Maven依赖，如果使用Maven来管理项目的依赖，那么需要添加如下的ZeroMQ模块依赖(注意将`${ignite.version}`替换为实际使用的版本号)：
    ```xml
    <dependencies>
        ...
        <dependency>
            <groupId>org.apache.ignite</groupId>
            <artifactId>ignite-zeromq</artifactId>
            <version>${ignite.version}</version>
        </dependency>
        ...
    </dependencies>
    ```
 2. 要么实现[StreamSingleTupleExtractor](https://github.com/apache/ignite/blob/f2f82f09b35368f25e136c9fce5e7f2198a91171/modules/core/src/main/java/org/apache/ignite/stream/StreamSingleTupleExtractor.java)，要么实现[StreamMultipleTupleExtractor](https://github.com/apache/ignite/blob/f2f82f09b35368f25e136c9fce5e7f2198a91171/modules/core/src/main/java/org/apache/ignite/stream/StreamMultipleTupleExtractor.java)，[这里](https://github.com/apache/ignite/blob/7492843ad9e22c91764fb8d0c3a096b8ce6c653e/modules/zeromq/src/test/java/org/apache/ignite/stream/zeromq/ZeroMqStringSingleTupleExtractor.java)可以了解更多的细节。
 3. 像下面这样设置提取器，并且初始化流处理器：
    ```java
    try (IgniteDataStreamer<Integer, String> dataStreamer =
        grid().dataStreamer("myCacheName")) {

        dataStreamer.allowOverwrite(true);
        dataStreamer.autoFlushFrequency(1);

        try (IgniteZeroMqStreamer streamer = new IgniteZeroMqStreamer(
        1, ZeroMqTypeSocket.PULL, "tcp://localhost:5671", null)) {
        streamer.setIgnite(grid());
        streamer.setStreamer(dataStreamer);

        streamer.setSingleTupleExtractor(new ZeroMqStringSingleTupleExtractor());

        streamer.start();
        }
    }
    ```
### 5.10.Twitter流处理器
Ignite的Twitter流处理器模块会从Twitter消费微博然后将转换后的键-值对`<tweetId, text>`注入Ignite缓存。
要将来自Twitter的数据流注入Ignite缓存，需要：

 1. 在Maven工程里导入Ignite的twitter模块，如果使用maven来管理项目的依赖，则需要添加如下的依赖，并将`${ignite.version}`替换为实际使用的Ignite版本：
    ```xml
    <dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-twitter</artifactId>
    <version>${ignite.version}</version>
    </dependency>
    ```
 2. 在代码中配置必要的参数，然后启动流处理器，比如：
    ```java
    IgniteDataStreamer dataStreamer = ignite.dataStreamer("myCache");
    dataStreamer.allowOverwrite(true);
    dataStreamer.autoFlushFrequency(10);

    OAuthSettings oAuthSettings = new OAuthSettings("setting1", "setting2", "setting3", "setting4");

    TwitterStreamer<Integer, String> streamer = new TwitterStreamer<>(oAuthSettings);
    streamer.setIgnite(ignite);
    streamer.setStreamer(dataStreamer);

    Map<String, String> params = new HashMap<>();
    params.put("track", "apache, twitter");
    params.put("follow", "3004445758");

    streamer.setApiParams(params);// Twitter Streaming API params.
    streamer.setEndpointUrl(endpointUrl);// Twitter streaming API endpoint.
    streamer.setThreadsCount(8);

    streamer.start();
    ```

可以参考[Twitter流API文档](https://dev.twitter.com/streaming/overview)来了解各种参数的详细信息。
## 6.Cassandra集成
### 6.1.概述
Ignite的Cassandra集成实现了[CacheStore](/doc/java/Persistence.md#_2-1-概述)接口，其在Cassandra之上构建了一个高性能的缓存层。

它在功能上和`CacheJdbcBlobStore`以及`CacheJdbcPojoStore`的方式几乎是相同的，但是又提供了如下的好处；

 1. 对于CacheStore的批量操作`loadAll()`,`writeAll()`,`deleteAll()`，使用Cassandra的[异步查询](http://www.datastax.com/dev/blog/java-driver-async-queries) ，可以提供非常高的性能；
 2. 如果Cassandra中不存在会自动创建所有必要的表（以及键空间），也会为将存储为POJOs的Ignite键值自动检测所有必要的字段，并且创建相应的表结构。因此无需关注Cassandra的表创建DDL语法以及Java到Cassandra的类型映射细节。也可以使用`@QuerySqlField`注解为Cassandra表列提供配置（列名、索引、排序）；
 3. 可以有选择地为将创建的Cassandra表和键空间指定配置（复制因子、复制策略、Bloom过滤器等）；
 4. 组合BLOB和POJO存储的功能，可以根据喜好存储从Ignite缓存来的键-值对（作为BLOB或者POJO）；
 5. 对于键-值支持标准[Java](https://docs.oracle.com/javase/tutorial/jndi/objects/serial.html)和[Kryo](https://github.com/EsotericSoftware/kryo)序列化，它会以BLOB形式存储于Cassandra；
 6. 通过为特定的Ignite缓存指定持久化配置，或者通过使用`@QuerySqlField(index = true)`注解自动进行配置的检测，支持Cassandra的[二级索引](http://docs.datastax.com/en/cql/3.0/cql/cql_reference/create_index_r.html)（包括定制索引）;
 7. 通过持久化配置，或者通过使用`@QuerySqlField(descending = true)`注解自动进行配置的检测，支持Cassandra集群键字段的排序；
 8. 对于POJO的键类，如果它的属性之一加注了`@AffinityKeyMapped`注解，也会支持[关联并置](/doc/java/DataModeling.md#_3-关联并置)，这时Ignite缓存中存储在某个节点上的键-值对，也会存储（并置）于Cassandra中的同一个节点上。

::: warning Ignite的SQL查询和Cassandra
注意，为了执行SQL查询，需要将Cassandra中的所有数据都加载到Ignite集群，Ignite的SQL引擎不会假设所有的数据都在内存中也不会查询Cassandra。
或者也可以使用Ignite原生的持久化-这是一个分布式的、支持ACID以及兼容SQL的磁盘存储，它可以在存储于内存和磁盘上的数据执行SQL查询。
:::
### 6.2.配置
#### 6.2.1.概述
要将Cassandra设置为一个持久化存储，需要将Ignite缓存的`CacheStoreFactory`设置为`org.apache.ignite.cache.store.cassandra.CassandraCacheStoreFactory`。

可以通过Spring进行配置，如下所示：
```xml
<bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="cacheConfiguration">
        <list>
            ...
            <!-- Configuring persistence for "cache1" cache -->
            <bean class="org.apache.ignite.configuration.CacheConfiguration">
                <property name="name" value="cache1"/>
                <!-- Tune on Read-Through and Write-Through mode -->
                <property name="readThrough" value="true"/>
                <property name="writeThrough" value="true"/>
                <!-- Specifying CacheStoreFactory -->
                <property name="cacheStoreFactory">
                    <bean class="org.apache.ignite.cache.store.cassandra.CassandraCacheStoreFactory">
                        <!-- Datasource configuration bean which is responsible for Cassandra connection details -->
                        <property name="dataSourceBean" value="cassandraDataSource"/>
                        <!-- Persistent settings bean which is responsible for the details of how objects will be persisted to Cassandra -->
                        <property name="persistenceSettingsBean" value="cache1_persistence_settings"/>
                    </bean>
                </property>
            </bean>
            ...
        </list>
        ...
    </property>
</bean>
```
这里有两个主要的属性需要为`CassandraCacheStoreFactory`设置：

 - `dataSourceBean`:`org.apache.ignite.cache.store.cassandra.utils.datasource.DataSource`类的实例，负责Cassandra数据库连接的所有方面（凭据、联系点、读/写一致性级别、负载平衡策略等）；
 - `persistenceSettingsBean`:`org.apache.ignite.cache.store.cassandra.utils.persistence.KeyValuePersistenceSettings`类的实例，负责对象如何持久化到Cassandra的所有方面（键空间及其选项、表及其选项、分区和集群键选项、POJO对象字段映射、二级索引、BLOB对象序列化器等）。

下面的章节中这两个Bean及其配置会详细地描述。
#### 6.2.2.DataSourceBean
这个bean存储了Cassandra数据库与连接和CRUD操作有关的所有必要信息，下面的表格中显示了所有的属性：

|属性|描述|默认值|
|---|---|---|
|`user`|连接Cassandra的用户名||
|`password`|连接Cassandra的用户密码||
|`credentials`|提供`user`和`password`的Credentials Bean||
|`authProvider`|接入Cassandra时使用指定的AuthProvider，当自定义身份认证体系准备就绪时，使用这个方法。||
|`port`|接入Cassandra时使用的端口（如果没有在连接点中提供）||
|`contactPoints`|Cassandra连接时使用的连接点数组（**hostaname:[port]**）||
|`maxSchemaAgreementWaitSeconds`|DDL查询返回前架构协议的最大等待时间|`10秒`|
|`protocolVersion`|指定使用Cassandra驱动协议的哪个版本（有助于旧版本Cassandra的后向兼容）|`3`|
|`compression`|传输中使用的压缩格式，支持的压缩格式包括：`snappy`，`lz4`||
|`useSSL`|是否启用SSL|`false`|
|`sslOptions`|是否使用提供的选项启用SSL|`false`|
|`collectMetrix`|是否启用指标收集|`false`|
|`jmxReporting`|是否启用JMX的指标报告|`false`|
|`fetchSize`|指定查询获取大小，获取大小控制一次获取的结果集的数量||
|`readConsistency`|指定READ查询的一致性级别||
|`writeConsistency`|指定WRITE/DELETE/UPDATE查询的一致性级别||
|`loadBalancingPolicy`|指定要使用的负载平衡策略|`TokenAwarePolicy`|
|`reconnectionPolicy`|指定要使用的重连策略|`ExponentialReconnectionPolicy`|
|`retryPolicy`|指定要使用的重试策略|`DefaultRetryPolicy`|
|`addressTranslater`|指定要使用的地址转换器|`IdentityTranslater`|
|`speculativeExecutionPolicy`|指定要使用 的推理执行策略|`NoSpeculativeExecutionPolicy`|
|`poolingOptions`|指定连接池选项||
|`socketOptions`|指定保持到Cassandra主机的连接的底层Socket选项||
|`nettyOptions`|允许客户端定制Cassandra驱动底层Netty层的钩子||

#### 6.2.3.PersistenceSettingsBean
这个bean存储了对象（键和值）如何持久化到Cassandra数据库的所有细节信息（键空间、表、分区选项、POJO字段映射等）。

`org.apache.ignite.cache.store.cassandra.utils.persistence.KeyValuePersistenceSettings`的构造器可以通过如下方式创建这个Bean，从一个包含特定结构的XML配置文档的字符串（看下面的代码），或者指向XML文档的资源。

下面是一个XML配置文档的常规示例（**持久化描述符**），它指定了Ignite缓存的键和值如何序列化/反序列化到/从Cassandra:
```xml
<!--
Root container for persistence settings configuration.

Note: required element

Attributes:
  1) keyspace [required] - specifies keyspace for Cassandra tables which should be used to store key/value pairs
  2) table    [required] - specifies Cassandra table which should be used to store key/value pairs
  3) ttl      [optional] - specifies expiration period for the table rows (in seconds)
-->
<persistence keyspace="my_keyspace" table="my_table" ttl="86400">
    <!--
    Specifies Cassandra keyspace options which should be used to create provided keyspace if it doesn't exist.

    Note: optional element
    -->
    <keyspaceOptions>
        REPLICATION = {'class' : 'SimpleStrategy', 'replication_factor' : 3}
        AND DURABLE_WRITES = true
    </keyspaceOptions>

    <!--
    Specifies Cassandra table options which should be used to create provided table if it doesn't exist.

    Note: optional element
    -->
    <tableOptions>
        comment = 'A most excellent and useful table'
        AND read_repair_chance = 0.2
    </tableOptions>

    <!--
    Specifies persistent settings for Ignite cache keys.

    Note: required element

    Attributes:
      1) class      [required] - java class name for Ignite cache key
      2) strategy   [required] - one of three possible persistent strategies:
            a) PRIMITIVE - stores key value as is, by mapping it to Cassandra table column with corresponding type.
                Should be used only for simple java types (int, long, String, double, Date) which could be mapped
                to corresponding Cassadra types.
            b) BLOB - stores key value as BLOB, by mapping it to Cassandra table column with blob type.
                Could be used for any java object. Conversion of java object to BLOB is handled by "serializer"
                which could be specified in serializer attribute (see below).
            c) POJO - stores each field of an object as a column having corresponding type in Cassandra table.
                Provides ability to utilize Cassandra secondary indexes for object fields.
      3) serializer [optional] - specifies serializer class for BLOB strategy. Shouldn't be used for PRIMITIVE and
        POJO strategies. Available implementations:
            a) org.apache.ignite.cache.store.cassandra.utils.serializer.JavaSerializer - uses standard Java
                serialization framework
            b) org.apache.ignite.cache.store.cassandra.utils.serializer.KryoSerializer - uses Kryo
                serialization framework
      4) column     [optional] - specifies column name for PRIMITIVE and BLOB strategies where to store key value.
        If not specified column having 'key' name will be used. Shouldn't be used for POJO strategy.
    -->
    <keyPersistence class="org.mycompany.MyKeyClass" strategy="..." serializer="..." column="...">
        <!--
        Specifies partition key fields if POJO strategy used.

        Note: optional element, only required for POJO strategy in case you want to manually specify
            POJO fields to Cassandra columns mapping, instead of relying on dynamic discovering of
            POJO fields and mapping them to the same columns of Cassandra table.
        -->
        <partitionKey>
            <!--
             Specifies mapping from POJO field to Cassandra table column.

             Note: required element

             Attributes:
               1) name   [required] - POJO field name
               2) column [optional] - Cassandra table column name. If not specified lowercase
                  POJO field name will be used.
            -->
            <field name="companyCode" column="company" />
            ...
            ...
        </partitionKey>

        <!--
        Specifies cluster key fields if POJO strategy used.

        Note: optional element, only required for POJO strategy in case you want to manually specify
            POJO fields to Cassandra columns mapping, instead of relying on dynamic discovering of
            POJO fields and mapping them to the same columns of Cassandra table.
        -->
        <clusterKey>
            <!--
             Specifies mapping from POJO field to Cassandra table column.

             Note: required element

             Attributes:
               1) name   [required] - POJO field name
               2) column [optional] - Cassandra table column name. If not specified lowercase
                  POJO field name will be used.
               3) sort   [optional] - specifies sort order (asc or desc)
            -->
            <field name="personNumber" column="number" sort="desc"/>
            ...
            ...
        </clusterKey>
    </keyPersistence>

    <!--
    Specifies persistent settings for Ignite cache values.

    Note: required element

    Attributes:
      1) class      [required] - java class name for Ignite cache value
      2) strategy   [required] - one of three possible persistent strategies:
            a) PRIMITIVE - stores key value as is, by mapping it to Cassandra table column with corresponding type.
                Should be used only for simple java types (int, long, String, double, Date) which could be mapped
                to corresponding Cassadra types.
            b) BLOB - stores key value as BLOB, by mapping it to Cassandra table column with blob type.
                Could be used for any java object. Conversion of java object to BLOB is handled by "serializer"
                which could be specified in serializer attribute (see below).
            c) POJO - stores each field of an object as a column having corresponding type in Cassandra table.
                Provides ability to utilize Cassandra secondary indexes for object fields.
      3) serializer [optional] - specifies serializer class for BLOB strategy. Shouldn't be used for PRIMITIVE and
        POJO strategies. Available implementations:
            a) org.apache.ignite.cache.store.cassandra.utils.serializer.JavaSerializer - uses standard Java
                serialization framework
            b) org.apache.ignite.cache.store.cassandra.utils.serializer.KryoSerializer - uses Kryo
                serialization framework
      4) column     [optional] - specifies column name for PRIMITIVE and BLOB strategies where to store value.
        If not specified column having 'value' name will be used. Shouldn't be used for POJO strategy.
    -->
    <valuePersistence class="org.mycompany.MyValueClass" strategy="..." serializer="..." column="">
        <!--
         Specifies mapping from POJO field to Cassandra table column.

         Note: required element

         Attributes:
           1) name         [required] - POJO field name
           2) column       [optional] - Cassandra table column name. If not specified lowercase
              POJO field name will be used.
           3) static       [optional] - boolean flag which specifies that column is static withing a given partition
           4) index        [optional] - boolean flag specifying that secondary index should be created for the field
           5) indexClass   [optional] - custom index java class name if you want to use custom index
           6) indexOptions [optional] - custom index options
        -->
        <field name="firstName" column="first_name" static="..." index="..." indexClass="..." indexOptions="..."/>
        ...
        ...
    </valuePersistence>
</persistence>
```
下面会提供关于持久化描述符配置及其元素的所有细节信息。

##### 6.2.3.1.persistence

::: warning 必要元素
持久化配置的根容器。
:::

|属性|必需|描述|
|---|---|---|
|`keyspace`|是|存储键-值对的Cassandra表的键空间，如果键空间不存在会创建它（如果指定的Cassandra账户持有正确的权限）。|
|`table`|否|存储键-值对的Cassandra表，如果表不存在会创建它（如果指定的Cassandra账户持有正确的权限）。|
|`ttl`|否|表数据行的到期时间（秒），要了解有关Cassandra ttl的详细信息，可以参照[到期数据](http://docs.datastax.com/en/cql/3.1/cql/cql_using/use_expire_c.html)。|

下面的章节中，会看到持久化配置容器中可以放置那些子元素。
##### 6.2.3.2.keyspaceOptions
::: tip 可选元素
创建在持久化配置容器中配置的**keyspace**属性指定的Cassandra键空间时的可选项。
:::

键空间只有在不存在时才会被创建，并且连接到Cassandra的账户要持有正确的权限。

这个XML元素指定的文本只是[创建键空间](http://docs.datastax.com/en/cql/3.0/cql/cql_reference/create_keyspace_r.html)的Cassandra DDL语句中在**WITH**关键字之后的一段代码。

##### 6.2.3.3.tableOptions
::: tip 可选元素
创建在持久化配置容器中配置的**table**属性指定的表时的可选项。
:::

表只有在不存在时才会被创建，并且连接到Cassandra的账户要持有正确的权限。

这个XML元素指定的文本只是[创建表](http://docs.datastax.com/en/cql/3.0/cql/cql_reference/create_table_r.html)的Cassandra DDL语句中在**WITH**关键字之后的一段代码。

##### 6.2.3.4.keyPersistence
::: warning 必要元素
Ignite缓存键的持久化配置。
:::

这些属性指定了从Ignite缓存中对象如何存储/加载到/从Cassandra表。

|属性|必需|描述|
|---|---|---|
|`class`|是|Ignite缓存键的Java类名。|
|`strategy`|是|指定三个可能的持久化策略之一（看下面的描述），它会控制对象如何存储/加载到/从Cassandra表。|
|`serializer`|否|BLOB策略的序列化器类（可用的实现看下面），PRIMITIVE和POJO策略时无法使用。|
|`column`|否|PRIMITIVE和BLOB策略时存储键的列名，如果不指定，列名为`key`，对于POJO策略属性无需指定。|

**持久化策略**：

|名称|描述|
|---|---|
|`PRIMITIVE`|存储对象，通过对应的类型将其映射到Cassandra表列中，只能使用简单的Java类型（int、long、String、double、Date），它们会直接映射到对应的Cassandra类型上，要了解详细的Java到Cassandra的类型映射，点击[这里](http://docs.datastax.com/en/developer/java-driver/2.0/java-driver/reference/javaClass2Cql3Datatypes_r.html)。|
|`BLOB`|将对象存储为BLOB，使用BLOB类型将其映射到Cassandra表列，可以使用任何Java对象，Java对象到BLOB的转换是由**keyPersistence**容器中的serializer属性指定的序列化器处理的。|
|`POJO`|将对象的每个属性按照对应的类型存储到Cassandra的表中，对于对象的属性，提供了利用Cassandra二级索引的能力，只能用于遵守Java Bean规范的POJO对象，并且它的属性都是基本Java类型，它们会直接映射到对应的Cassandra类型上。|

**可用的序列化器实现**：

|类名|描述|
|---|---|
|**org.apache.ignite.cache.store.cassandra.utils.serializer.JavaSerializer**|使用标准的Java序列化框架|
|**org.apache.ignite.cache.store.cassandra.utils.serializer.KryoSerializer**|使用Kryo序列化框架|

如果使用了**PRIMITIVE**和**BLOB**持久化策略，那么是不需要指定`keyPersistence`标签的内部元素的，这样的原因是，这两个策略中整个对象都被持久化到Cassandra表中的一列（可以通过`column`指定）。

如果使用`POJO`持久化策略，那么有两个策略：

 - 让`keyPersistence`标签为空，这时，POJO对象类的所有字段都会通过如下的规则自动检测：
   - 只有那些可以直接映射到[对应的Cassandra类型](http://docs.datastax.com/en/developer/java-driver/1.0/java-driver/reference/javaClass2Cql3Datatypes_r.html)的简单Java类型会被自动检测；
   - 字段的发现机制会考虑`@QuerySqlField`注解；
     - 如果指定了`name`属性，它会被用作Cassandra表中的列名，否则属性名的小写形式会被用做列名；
     - 如果为一个映射到**集群键**列的字段指定了`descending`属性，它会被用于指定列的排序规则。
   - 字段的发现机制会考虑`@AffinityKeyMapped`注解，加注这个注解的字段会被认为是[分区键](http://docs.datastax.com/en/cql/3.0/cql/ddl/ddl_compound_keys_c.html)（以它们在类中声明的顺序），其它的所有字段都会以[集群键](http://docs.datastax.com/en/cql/3.0/cql/ddl/ddl_compound_keys_c.html)处理。
   - 如果没有字段加注了`@AffinityKeyMapped`注解，所有被发现的字段都会被认为是[分区键](http://docs.datastax.com/en/cql/3.0/cql/ddl/ddl_compound_keys_c.html)。
 - 在`keyPersistence`标签中指定持久化的细节，这时，需要在`partitionKey`标签中指定映射到Cassandra表列的`分区键`字段，这个标签只是作为一个映射设置的容器，没有任何属性。作为一个选择（如果打算使用集群键），也可以在`clusterKey`标签中指定映射到对应Cassandra表列的`集群`键字段。这个标签只是作为一个映射设置的容器，也没有任何属性。

下面两个章节会详细描述`partition`和`cluster`键字段映射的细节（如果选择了上面列表的第二个选项）。

##### 6.2.3.5.partitionKey
::: tip 可选元素
`field`元素的容器，用于指定Cassandra的分区键。
:::

定义了Ignite缓存的键对象字段（在它里面），它会被用作Cassandra表的**分区键**，并且指定了到表列的字段映射。

映射是通过`<field>`标签设定的，它有如下的属性：

|属性|必需|描述|
|---|---|---|
|`name`|是|POJO对象字段名|
|`column`|否|Cassandra表列名，如果不指定，会使用POJO字段名的小写形式|

##### 6.2.3.6.clusterKey
::: tip 可选元素
`field`元素的容器，用于指定Cassandra的集群键。
:::

定义了Ignite缓存的键对象字段（在它里面），它会被用作Cassandra表的**集群键**，并且指定了到表列的字段映射。

映射是通过`<field>`标签设定的，它有如下的属性：

|属性|必需|描述|
|---|---|---|
|`name`|是|POJO对象字段名|
|`column`|否|Cassandra表列名，如果不指定，会使用POJO字段名的小写形式|
|`sort`|否|指定字段排序规则（`asc`或者`desc`）|

##### 6.2.3.7.valuePersistence
::: warning 必要元素
Ignite缓存值的持久化配置。
:::

这些设置指定了Ignite缓存的值对象如何存储/加载到/从Cassandra表,这些设置的属性看上去和对应的Ignite缓存键的设定很像。

|属性|必需|描述|
|---|---|---|
|`class`|是|Ignite缓存值的Java类名。|
|`strategy`|是|指定三个可能的持久化策略之一（看下面的描述），它会控制对象如何存储/加载到/从Cassandra表。|
|`serializer`|否|BLOB策略的序列化器类（可用的实现看下面），PRIMITIVE和POJO策略时无法使用。|
|`column`|否|PRIMITIVE和BLOB策略时存储值的列名，如果不指定，列名为`value`，对于POJO策略属性无需指定。|

持久化策略（与键的持久化策略一致）：

|名称|描述|
|---|---|
|`PRIMITIVE`|存储对象，通过对应的类型将其映射到Cassandra表列中，只能使用简单的Java类型（int、long、String、double、Date），它们会直接映射到对应的Cassandra类型上，要了解详细的Java到Cassandra的类型映射，点击[这里](http://docs.datastax.com/en/developer/java-driver/2.0/java-driver/reference/javaClass2Cql3Datatypes_r.html)。|
|`BLOB`|将对象存储为BLOB，使用BLOB类型将其映射到Cassandra表列，可以使用任何Java对象，Java对象到BLOB的转换是由**valuePersistence**容器中的serializer属性指定的序列化器处理的。|
|`POJO`|将对象的每个属性按照对应的类型存储到Cassandra的表中，对于对象的属性，提供了利用Cassandra二级索引的能力，只能用于遵守Java Bean规范的POJO对象，并且它的属性都是基本Java类型，它们会直接映射到对应的Cassandra类型上。|

*可用的序列化器实现*

|类名|描述|
|---|---|
|**org.apache.ignite.cache.store.cassandra.utils.serializer.JavaSerializer**|使用标准的Java序列化框架|
|**org.apache.ignite.cache.store.cassandra.utils.serializer.KryoSerializer**|使用Kryo序列化框架|

如果使用了`PRIMITIVE`和`BLOB`持久化策略，那么是不需要指定`valuePersistence`标签的内部元素的，这样的原因是，这两个策略中整个对象都被持久化到Cassandra表中的一列（可以通过`column`指定）。

如果使用`POJO`持久化策略，那么有两个策略：

 - 让`valuePersistence`标签为空，这时，POJO对象类的所有字段都会通过如下的规则自动检测：
     - 只有那些可以直接映射到[对应的Cassandra类型](http://docs.datastax.com/en/developer/java-driver/1.0/java-driver/reference/javaClass2Cql3Datatypes_r.html)的简单Java类型会被自动检测；
     - 字段的发现机制会考虑`@QuerySqlField`注解；
       - 如果指定了`name`属性，它会被用作Cassandra表中的列名，否则属性名的小写形式会被用做列名；
       - 如果指定了`index`属性，会在Cassandra表中为相应的列创建二级索引（如果这样的表不存在）。
 - 在`valuePersistence`标签中指定持久化的细节，这时，就需要在`valuePersistence`标签中指定POJO字段到Cassandra表列的映射。

如果选择了上述的第二个选项，那么需要使用`<field>`标签指定POJO字段到Cassandra表列的映射，这个标签有如下的属性：

|属性|必需|描述|
|---|---|---|
|`name`|是|POJO对象字段名|
|`column`|否|Cassandra表列名，如果不指定，会使用POJO字段名的小写形式|
|`static`|否|布尔类型标志，它指定了在一个分区内列是否为静态的|
|`index`|否|布尔类型标志，指定了对于特定字段是否要创建二级索引|
|`indexClass`|否|如果要使用自定义索引，自定义索引的Java类名|
|`indexOptions`|否|自定义索引选项|

### 6.3.示例
#### 6.3.1.概述
就像上一章描述的那样，要将Cassandra配置为缓存存储，需要将Ignite缓存的`CacheStoreFactory`设置为`org.apache.ignite.cache.store.cassandra.CassandraCacheStoreFactory`。

下面是一个Ignite将Cassandra配置为缓存存储的典型配置示例，即使它看上去很复杂也不用担心，后续会一步一步深入每一个配置项，这个示例来自于Cassandra模块源代码的单元测试资源文件`test/resources/org/apache/ignite/tests/persistence/blob/ignite-config.xml`。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">

    <!-- Cassandra connection settings -->
    <import resource="classpath:org/apache/ignite/tests/cassandra/connection-settings.xml" />

    <!-- Persistence settings for 'cache1' -->
    <bean id="cache1_persistence_settings" class="org.apache.ignite.cache.store.cassandra.persistence.KeyValuePersistenceSettings">
        <constructor-arg type="org.springframework.core.io.Resource" value="classpath:org/apache/ignite/tests/persistence/blob/persistence-settings-1.xml" />
    </bean>

    <!-- Persistence settings for 'cache2' -->
    <bean id="cache2_persistence_settings" class="org.apache.ignite.cache.store.cassandra.persistence.KeyValuePersistenceSettings">
        <constructor-arg type="org.springframework.core.io.Resource" value="classpath:org/apache/ignite/tests/persistence/blob/persistence-settings-3.xml" />
    </bean>

    <!-- Ignite configuration -->
    <bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
        <property name="cacheConfiguration">
            <list>
                <!-- Configuring persistence for "cache1" cache -->
                <bean class="org.apache.ignite.configuration.CacheConfiguration">
                    <property name="name" value="cache1"/>
                    <property name="readThrough" value="true"/>
                    <property name="writeThrough" value="true"/>
                    <property name="cacheStoreFactory">
                        <bean class="org.apache.ignite.cache.store.cassandra.CassandraCacheStoreFactory">
                            <property name="dataSourceBean" value="cassandraAdminDataSource"/>
                            <property name="persistenceSettingsBean" value="cache1_persistence_settings"/>
                        </bean>
                    </property>
                </bean>

                <!-- Configuring persistence for "cache2" cache -->
                <bean class="org.apache.ignite.configuration.CacheConfiguration">
                    <property name="name" value="cache2"/>
                    <property name="readThrough" value="true"/>
                    <property name="writeThrough" value="true"/>
                    <property name="cacheStoreFactory">
                        <bean class="org.apache.ignite.cache.store.cassandra.CassandraCacheStoreFactory">
                            <property name="dataSourceBean" value="cassandraAdminDataSource"/>
                            <property name="persistenceSettingsBean" value="cache2_persistence_settings"/>
                        </bean>
                    </property>
                </bean>
            </list>
        </property>

        <!-- Explicitly configure TCP discovery SPI to provide list of initial nodes. -->
        <property name="discoverySpi">
            <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
                <property name="ipFinder">
                    <!--
                        Ignite provides several options for automatic discovery that can be used
                        instead os static IP based discovery. For information on all options refer
                        to our documentation: http://apacheignite.readme.io/docs/cluster-config
                    -->
                    <!-- Uncomment static IP finder to enable static-based discovery of initial nodes. -->
                    <!--<bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.vm.TcpDiscoveryVmIpFinder">-->
                    <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.multicast.TcpDiscoveryMulticastIpFinder">
                        <property name="addresses">
                            <list>
                                <!-- In distributed environment, replace with actual host IP address. -->
                                <value>127.0.0.1:47500..47509</value>
                            </list>
                        </property>
                    </bean>
                </property>
            </bean>
        </property>
    </bean>
</beans>
```
在这个示例中，配置了两个Ignite缓存：`cache1`和`cache2`，下面会看配置的细节。

这两个缓存非常接近（`cache1`和`cache2`），看起来像这样：
```xml
<bean class="org.apache.ignite.configuration.CacheConfiguration">
    <property name="name" value="cache1"/>
    <property name="readThrough" value="true"/>
    <property name="writeThrough" value="true"/>
    <property name="cacheStoreFactory">
        <bean class="org.apache.ignite.cache.store.cassandra.CassandraCacheStoreFactory">
            <property name="dataSourceBean" value="cassandraAdminDataSource"/>
            <property name="persistenceSettingsBean" value="cache1_persistence_settings"/>
        </bean>
    </property>
</bean>
```
首先可以看到通读和通写选项已经启用了：
```xml
<property name="readThrough" value="true"/>
<property name="writeThrough" value="true"/>
```
如果希望为过期条目使用持久化存储，这个对于Ignite缓存就是必要的。

如果希望异步更新持久化存储，也可以有选择地配置后写参数。
```xml
<property name="writeBehindEnabled" value="true"/>
```
下一个重要的事就是`CacheStoreFactory`的配置：
```xml
<property name="cacheStoreFactory">
    <bean class="org.apache.ignite.cache.store.cassandra.CassandraCacheStoreFactory">
        <property name="dataSourceBean" value="cassandraAdminDataSource"/>
        <property name="persistenceSettingsBean" value="cache1_persistence_settings"/>
    </bean>
</property>
```
可以看到将`org.apache.ignite.cache.store.cassandra.CassandraCacheStoreFactory`作为一个`CacheStoreFactory`，这使得Ignite缓存可以使用Cassandra作为持久化存储。对于`CassandraCacheStoreFactory`，需要指定两个必要的属性：

 - `dataSourceBean`：spring bean的名字，它指定了所有与Cassandra数据库连接有关的细节，要了解更多细节，可以看上一章的介绍；
 - `persistenceSettingsBean`：spring bean的名字，它指定了对象如何持久化到Cassandra数据库的细节，要了解更多细节，可以看上一章的介绍。

在这个示例中，`cassandraAdminDataSource`是一个datasource bean，可以使用如下的指令导入Ignite的缓存配置文件：
```xml
<import resource="classpath:org/apache/ignite/tests/cassandra/connection-settings.xml" />
```
`cache1_persistence_settings`是一个持久化配置bean，它是在Ignite缓存配置文件中使用如下的方式配置的：
```xml
<bean id="cache1_persistence_settings" class="org.apache.ignite.cache.store.cassandra.utils.persistence.KeyValuePersistenceSettings">
    <constructor-arg type="org.springframework.core.io.Resource" value="classpath:org/apache/ignite/tests/persistence/blob/persistence-settings-1.xml" />
</bean>
```
现在可以从`org/apache/ignite/tests/cassandra/connection-settings.xml`测试资源文件中看一下`cassandraAdminDataSource`的设置。

具体来说，`CassandraAdminCredentials`和`CassandraRegularCredentials`类都是`org.apache.ignite.cache.store.cassandra.datasource.Credentials`的扩展，也可以自定义然后引用它们。
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="cassandraAdminCredentials" class="org.apache.ignite.tests.utils.CassandraAdminCredentials"/>

    <bean id="loadBalancingPolicy" class="com.datastax.driver.core.policies.RoundRobinPolicy"/>

    <bean id="contactPoints" class="org.apache.ignite.tests.utils.CassandraHelper" factory-method="getContactPointsArray"/>

    <bean id="cassandraAdminDataSource" class="org.apache.ignite.cache.store.cassandra.utils.datasource.DataSource">
        <property name="credentials" ref="cassandraAdminCredentials"/>
        <property name="contactPoints" ref="contactPoints"/>
        <property name="readConsistency" value="ONE"/>
        <property name="writeConsistency" value="ONE"/>
        <property name="loadBalancingPolicy" ref="loadBalancingPolicy"/>
    </bean>
</beans>
```
有关Cassandra数据源连接配置的更多详细信息，请参见[配置](#_6-2-配置)章节的介绍。

最后，还没有描述的最后一个片段就是持久化设置的配置，可以从`org/apache/ignite/tests/persistence/blob/persistence-settings-1.xml`测试资源文件中看一下`cache1_persistence_settings`:
```xml
<persistence keyspace="test1" table="blob_test1">
    <keyPersistence class="java.lang.Integer" strategy="PRIMITIVE" />
    <valuePersistence strategy="BLOB"/>
</persistence>
```
在这个配置中，可以看到Cassandra的`test1.blob_test1`表会用于**cache1**缓存的键/值存储，缓存的键对象会以**integer**的形式存储于`key`列中，缓存的值对象会以**blob**的形式存储于`value`列中。

下一章会为不同类型的持久化策略提供持久化设置的示例。
#### 6.3.2.示例1
Ignite缓存的持久化配置中，`Integer`类型的键在Cassandra中会以`int`的形式存储，`String`类型的值在Cassandra中会以`text`的形式存储。

```xml
<persistence keyspace="test1" table="my_table">
    <keyPersistence class="java.lang.Integer" strategy="PRIMITIVE" column="my_key"/>
    <valuePersistence class="java.lang.String" strategy="PRIMITIVE" />
</persistence>
```
键会存储于`my_key`列，值会存储于`value`列（如果`column`属性不指定会使用默认值）。
#### 6.3.3.示例2
Ignite缓存的持久化配置中，`Integer`类型的键在Cassandra中会以`int`的形式存储，`any`类型的值（`BLOB`持久化策略中无需指定类型）在Cassandra中会以`BLOB`的形式存储，这个场景的唯一解决方案就是在Cassandra中将值存储为`BLOB`。
```xml
<persistence keyspace="test1" table="my_table">
    <keyPersistence class="java.lang.Integer" strategy="PRIMITIVE" />
    <valuePersistence strategy="BLOB"/>
</persistence>
```
键会存储于`key`列（如果`column`属性不指定会使用默认值），值会存储于`value`列。
#### 6.3.4.示例3
Ignite缓存的持久化配置中，`Integer`类型的键和`any`类型的值在Cassandra中都以`BLOB`的形式存储。
```xml
<persistence keyspace="test1" table="my_table">
    <!-- By default Java standard serialization is going to be used -->
    <keyPersistence class="java.lang.Integer"
                    strategy="BLOB"/>

    <!-- Kryo serialization specified to be used -->
    <valuePersistence class="org.apache.ignite.tests.pojos.Person"
                      strategy="BLOB"
                      serializer="org.apache.ignite.cache.store.cassandra.utils.serializer.KryoSerializer"/>
</persistence>
```
键会存储于`BLOB`类型的`key`列，使用[Java标准序列化](https://docs.oracle.com/javase/tutorial/jndi/objects/serial.html)，值会存储于`BLOB`类型的`value`列，使用[Kryo序列化](https://github.com/EsotericSoftware/kryo)。
#### 6.3.5.示例4
Ignite缓存的持久化配置中，`Integer`类型的键在Cassandra中会以`int`的形式存储，自定义POJO`org.apache.ignite.tests.pojos.Person`类型的值在动态分析后会被持久化到一组表列中，这样每个POJO字段都会被映射到相对应的表列，关于更多动态POJO字段发现的信息，可以查看上一章的介绍。

```xml
<persistence keyspace="test1" table="my_table">
    <keyPersistence class="java.lang.Integer" strategy="PRIMITIVE"/>
    <valuePersistence class="org.apache.ignite.tests.pojos.Person" strategy="POJO"/>
</persistence>
```
键会存储于`int`类型的`key`列。

假设`org.apache.ignite.tests.pojos.Person`类的实现如下：
```java
public class Person {
    private String firstName;
    private String lastName;
    private int age;
    private boolean married;
    private long height;
    private float weight;
    private Date birthDate;
    private List<String> phones;

    public void setFirstName(String name) {
        firstName = name;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setLastName(String name) {
        lastName = name;
    }

    public String getLastName() {
        return lastName;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public int getAge() {
        return age;
    }

    public void setMarried(boolean married) {
        this.married = married;
    }

    public boolean getMarried() {
        return married;
    }

    public void setHeight(long height) {
        this.height = height;
    }

    public long getHeight() {
        return height;
    }

    public void setWeight(float weight) {
        this.weight = weight;
    }

    public float getWeight() {
        return weight;
    }

    public void setBirthDate(Date date) {
        birthDate = date;
    }

    public Date getBirthDate() {
        return birthDate;
    }

    public void setPhones(List<String> phones) {
        this.phones = phones;
    }

    public List<String> getPhones() {
        return phones;
    }
}
```
这时，Ignite缓存中`org.apache.ignite.tests.pojos.Person`类型的值会使用如下的动态配置映射规则持久化到一组Cassandra表列中：

|POJO字段|表列|列类型|
|---|---|---|
|firstName|firstname|text|
|lastName|lastname|text|
|age|age|int|
|married|married|boolean|
|height|height|bigint|
|weight|weight|float|
|birthDate|birthdate|timestamp|

从上表可以看出，`phones`字段不会被持久化到表中，这是应为它不是一个可以映射到[对应Cassandra类型](http://docs.datastax.com/en/developer/java-driver/1.0/java-driver/reference/javaClass2Cql3Datatypes_r.html)的简单Java类型，这种类型的字段只有在给这个对象类型手工指定所有的映射细节以及字段类型本身实现了`java.io.Serializable`接口时才会被持久化于Cassandra中。这时，字段会被持久化到一个单独的`BLOB`类型的表列。下个示例会看到更多的细节。
#### 6.3.6.示例5
Ignite缓存的持久化配置中，键是自定义的POJO`org.apache.ignite.tests.pojos.PersonId`类型，值是自定义POJO`org.apache.ignite.tests.pojos.Person`类型，基于手工指定的映射规则，都会被持久化到一组表列。
```xml
<persistence keyspace="test1" table="my_table" ttl="86400">
    <!-- Cassandra keyspace options which should be used to create provided keyspace if it doesn't exist -->
    <keyspaceOptions>
        REPLICATION = {'class' : 'SimpleStrategy', 'replication_factor' : 3}
        AND DURABLE_WRITES = true
    </keyspaceOptions>

    <!-- Cassandra table options which should be used to create provided table if it doesn't exist -->
    <tableOptions>
        comment = 'A most excellent and useful table'
        AND read_repair_chance = 0.2
    </tableOptions>

    <!-- Persistent settings for Ignite cache keys -->
    <keyPersistence class="org.apache.ignite.tests.pojos.PersonId" strategy="POJO">
        <!-- Partition key fields if POJO strategy used -->
        <partitionKey>
            <!-- Mapping from POJO field to Cassandra table column -->
            <field name="companyCode" column="company" />
            <field name="departmentCode" column="department" />
        </partitionKey>

        <!-- Cluster key fields if POJO strategy used -->
        <clusterKey>
            <!-- Mapping from POJO field to Cassandra table column -->
            <field name="personNumber" column="number" sort="desc"/>
        </clusterKey>
    </keyPersistence>

    <!-- Persistent settings for Ignite cache values -->
    <valuePersistence class="org.apache.ignite.tests.pojos.Person"
                      strategy="POJO"
                      serializer="org.apache.ignite.cache.store.cassandra.utils.serializer.KryoSerializer">
        <!-- Mapping from POJO field to Cassandra table column -->
        <field name="firstName" column="first_name" />
        <field name="lastName" column="last_name" />
        <field name="age" />
        <field name="married" index="true"/>
        <field name="height" />
        <field name="weight" />
        <field name="birthDate" column="birth_date" />
        <field name="phones" />
    </valuePersistence>
</persistence>
```
这些配置看上去非常复杂，下面会一步一步地分析。

首先看一下根标签：

```xml
<persistence keyspace="test1" table="my_table" ttl="86400">
```
它指定了Ignite缓存的键和值应该存储于`test1.my_table`表，并且每一条数据会在86400秒（24小时）后[过期](http://docs.datastax.com/en/cql/3.1/cql/cql_using/use_expire_c.html)。

然后可以看到关于Cassandra键空间的高级配置，在不存在时，这个配置会用于创建键空间。
```xml
<keyspaceOptions>
    REPLICATION = {'class' : 'SimpleStrategy', 'replication_factor' : 3}
    AND DURABLE_WRITES = true
</keyspaceOptions>
```
然后通过对键空间配置的分析，可以看到只会用于表创建的高级配置。
```xml
<tableOptions>
    comment = 'A most excellent and useful table'
    AND read_repair_chance = 0.2
</tableOptions>
```
下一个章节说明了Ignite缓存的键如何持久化：
```xml
<keyPersistence class="org.apache.ignite.tests.pojos.PersonId" strategy="POJO">
    <!-- Partition key fields if POJO strategy used -->
    <partitionKey>
        <!-- Mapping from POJO field to Cassandra table column -->
        <field name="companyCode" column="company" />
        <field name="departmentCode" column="department" />
    </partitionKey>

    <!-- Cluster key fields if POJO strategy used -->
    <clusterKey>
        <!-- Mapping from POJO field to Cassandra table column -->
        <field name="personNumber" column="number" sort="desc"/>
    </clusterKey>
</keyPersistence>
```
假定`org.apache.ignite.tests.pojos.PersonId`的实现如下：
```java
public class PersonId {
    private String companyCode;
    private String departmentCode;
    private int personNumber;

    public void setCompanyCode(String code) {
        companyCode = code;
    }

    public String getCompanyCode() {
        return companyCode;
    }

    public void setDepartmentCode(String code) {
        departmentCode = code;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setPersonNumber(int number) {
        personNumber = number;
    }

    public int getPersonNumber() {
        return personNumber;
    }
}
```
这时Ignite缓存中`org.apache.ignite.tests.pojos.PersonId`类型的键会使用如下的映射规则持久化到一组表示`分区`和`集群`键的Cassandra表列：

|POJO字段|表列|列类型|
|---|---|---|
|companyCode|company|text|
|departmentCode|department|text|
|personNumber|number|int|

另外，`(company, department)`的列组合会用作为Cassandra的`PARTITION`键，`number`列会用作为倒序排列的`集群`键。
最后到最后一章，它指定了Ignite缓存值的持久化配置：
```xml
<valuePersistence class="org.apache.ignite.tests.pojos.Person"
                  strategy="POJO"
                  serializer="org.apache.ignite.cache.store.cassandra.utils.serializer.KryoSerializer">
    <!-- Mapping from POJO field to Cassandra table column -->
    <field name="firstName" column="first_name" />
    <field name="lastName" column="last_name" />
    <field name="age" />
    <field name="married" index="true"/>
    <field name="height" />
    <field name="weight" />
    <field name="birthDate" column="birth_date" />
    <field name="phones" />
</valuePersistence>
```
假定`org.apache.ignite.tests.pojos.Person`类和示例4的实现一样，这时Ignite缓存的`org.apache.ignite.tests.pojos.Person`类型的值会以如下的映射规则持久化到一组Cassandra表列：

|POJO字段|表列|列类型|
|---|---|---|
|firstName|first_name|text|
|lastName|last_name|text|
|age|age|int|
|married|married|boolean|
|height|height|bigint|
|weight|weight|float|
|birthDate|birth_date|timestamp|
|phones|phones|blob|

和示例4相比，可以看到，使用[Kryo](https://github.com/EsotericSoftware/kryo)序列化器，`phones`字段会被序列化到`blob`类型的`phones`列。另外Cassandra会为`married`列创建二级索引。
### 6.4.DDL生成器
#### 6.4.1.概述
Ignite Cassandra模块的一个好处是，无需关注Cassandra的表创建DDL语法以及Java到Cassandra的类型映射细节。

只需要创建指定了Ignite缓存的键和值如何序列化/反序列化到/从Cassandra的XML配置文档即可，基于这个设置，剩余的Cassandra键空间和表都会被自动创建，要让这一切运转起来，只需要：

::: warning 警告
在Cassandra的连接设置中，指定的用户要有足够的权限来创建键空间和表。
:::

不过因为严格的安全策略，某些环境中这是不可能的。这个场景的唯一解决方案就是向运维团队提供DDL脚本来创建所有必要的Cassandra键空间和表。

这就是使用DDL生成工具的确切场景，它会从一个[持久化配置](#_6-2-3-persistencesettingsbean)中生成DDL。

下面是Cassandra中DDL生成的语法样例：
```shell
java org.apache.ignite.cache.store.cassandra.utils.DDLGenerator /opt/dev/ignite/persistence-settings-1.xml /opt/dev/ignite/persistence-settings-2.xml
```
生成的DDL大体如下：
```
-------------------------------------------------------------
DDL for keyspace/table from file: /opt/dev/ignite/persistence-settings-1.xml
-------------------------------------------------------------

create keyspace if not exists test1
with replication = {'class' : 'SimpleStrategy', 'replication_factor' : 3} and durable_writes = true;

create table if not exists test1.primitive_test1
(
 key int,
 value int,
 primary key ((key))
);

-------------------------------------------------------------
DDL for keyspace/table from file: /opt/dev/ignite/persistence-settings-2.xml
-------------------------------------------------------------

create keyspace if not exists test1
with REPLICATION = {'class' : 'SimpleStrategy', 'replication_factor' : 3} AND DURABLE_WRITES = true;

create table if not exists test1.pojo_test3
(
 company text,
 department text,
 number int,
 first_name text,
 last_name text,
 age int,
 married boolean,
 height bigint,
 weight float,
 birth_date timestamp,
 phones blob,
 primary key ((company, department), number)
)
with comment = 'A most excellent and useful table' AND read_repair_chance = 0.2 and clustering order by (number desc);
```
不要忘了设置正确的`CLASSPATH`环境变量：

 1. 在CLASSPATH中包含Ignite Cassandra模块的jar文件（`ignite-cassandra-<version-number>.jar`）；
 2. 如果打算为部分自定义Java类使用`POJO`持久化策略，需要同时在CLASSPATH中包含带有这些类的jar文件。

## 7.PHP PDO
### 7.1.概述
PHP提供了一个轻量级、一致的接口来访问数据库，叫做PHP数据对象-PDO，这个扩展依赖于若干特定数据库的PDO驱动，其中之一是[PDO_ODBC](http://php.net/manual/en/ref.pdo-odbc.php)，它可以接入任何实现了自己的ODBC驱动的数据库。

通过使用Ignite的ODBC驱动，从PHP应用中就可以接入Ignite集群，然后访问和修改数据，本章节就会介绍如何达到该目的。
### 7.2.配置ODBC驱动
Ignite遵守ODBC协议，并且实现了自己的ODBC驱动，这个驱动会用于PHP的PDO框架接入Ignite集群。

查看本系列文档的[ODBC](/doc/java/WorkingwithSQL.md#_10-1-odbc驱动)部分，可以知道如何在目标系统上安装和配置这个驱动，安装完毕后，就可以进入下一个章节。
### 7.3.安装和配置PHP PDO
要安装PHP，PDO以及PDO_ODBC驱动，可以看PHP的相关资源。

 - [下载](http://php.net/downloads.php)并安装期望的版本，注意，在PHP的5.1.0版本中，默认开启了PDO驱动，在Windows环境下，可以从[这里](http://windows.php.net/download)下载PHP的二进制包；
 - [配置](http://php.net/manual/en/book.pdo.php)PHP的PDO框架；
 - [启用](http://php.net/manual/en/ref.pdo-odbc.php)PDO_ODBC驱动：
   - 在Windows中，需要在php.ini文件中将`extension=php_pdo_odbc.dll`的注释去掉，并且确保`extension_dir`指向`php_pdo_odbc.dll`所在的目录，另外，这个目录还需要加入`PATH`环境变量；
   - 在类Unix系统中，通常可能只需要简单地安装一个特定的PHP_ODBC包，比如，Ubuntu14.04中已经安装了`php5-odbc`；
 - 如果必要，在一些特定的系统中，无法按照常规方法[配置](http://php.net/manual/en/ref.pdo-odbc.php#ref.pdo-odbc.installation)和构建PDO_ODBC驱动，但是大多数情况下，简单地安装PHP和PDO_ODBC驱动就可以了。

### 7.4.启动Ignite集群
PHP PDO准备就绪之后，就可以通过一个常规的配置启动Ignite集群，然后在PHP应用中接入集群并且查询和修改集群的数据。

 - 首先，集群端已经启用了ODBC处理器，即在每个集群节点的`IgniteConfiguration`中都加入了`odbcConfiguration`；
 - 下一步，列出`IgniteConfiguration`中与特定数据模型有关的所有缓存的配置，因为之后要在PHP PDO端执行SQL查询，所有每个缓存的配置都需要包含一个`QueryEntity`的定义，或者也可以使用Ignite的DDL命令来定义SQL表和索引；
 - 最后，可以使用下面的配置模板启动一个Ignite集群：
    ```xml
    <?xml version="1.0" encoding="UTF-8"?>

    <beans xmlns="http://www.springframework.org/schema/beans"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:util="http://www.springframework.org/schema/util"
        xsi:schemaLocation="
            http://www.springframework.org/schema/beans
            http://www.springframework.org/schema/beans/spring-beans.xsd
            http://www.springframework.org/schema/util
            http://www.springframework.org/schema/util/spring-util.xsd">
    <bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">

        <!-- Enabling ODBC. -->
        <property name="odbcConfiguration">
        <bean class="org.apache.ignite.configuration.OdbcConfiguration"></bean>
        </property>

        <!-- Configuring cache. -->
        <property name="cacheConfiguration">
        <list>
            <bean class="org.apache.ignite.configuration.CacheConfiguration">
            <property name="name" value="Person"/>
            <property name="cacheMode" value="PARTITIONED"/>
            <property name="atomicityMode" value="TRANSACTIONAL"/>
            <property name="writeSynchronizationMode" value="FULL_SYNC"/>

            <property name="queryEntities">
                <list>
                <bean class="org.apache.ignite.cache.QueryEntity">
                    <property name="keyType" value="java.lang.Long"/>
                    <property name="valueType" value="Person"/>

                    <property name="fields">
                    <map>
                        <entry key="firstName" value="java.lang.String"/>
                        <entry key="lastName" value="java.lang.String"/>
                        <entry key="resume" value="java.lang.String"/>
                        <entry key="salary" value="java.lang.Integer"/>
                    </map>
                    </property>

                    <property name="indexes">
                    <list>
                        <bean class="org.apache.ignite.cache.QueryIndex">
                        <constructor-arg value="salary"/>
                        </bean>
                    </list>
                    </property>
                </bean>
                </list>
            </property>
            </bean>
        </list>
        </property>
    </bean>
    </beans>
    ```

### 7.5.从PHP端接入Ignite集群
要从PHP PDO端接入Ignite，需要正确地[配置DSN](/doc/java/WorkingwithSQL.md#_10-2-4-配置dsn)。

在下面的示例中，假定DSN名为`LocalApacheIgniteDSN`。都配置好之后，PHP PDO应用就可以接入Ignite集群了，可以像下面这样执行一些查询：

<Tabs>
<Tab title="INSERT">

```php
<?php
try {
    // Connecting to Ignite using pre-configured DSN.
    $dbh = new PDO('odbc:LocalApacheIgniteDSN');

    // Changing PDO error mode.
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Preparing query.
    $dbs = $dbh->prepare('INSERT INTO Person (_key, firstName, lastName, resume, salary)
        VALUES (?, ?, ?, ?, ?)');

    // Declaring parameters.
    $key = 777;
    $firstName = "James";
    $lastName = "Bond";
    $resume = "Secret Service agent";
    $salary = 65000;

    // Binding parameters.
    $dbs->bindParam(1, $key);
    $dbs->bindParam(2, $firstName);
    $dbs->bindParam(3, $lastName);
    $dbs->bindParam(4, $resume);
    $dbs->bindParam(5, $salary);

    // Executing the query.
    $dbs->execute();

} catch (PDOException $e) {
    print "Error!: " . $e->getMessage() . "\n";
    die();
}
?>
```
</Tab>

<Tab title="UPDATE">

```php
<?php
try {
    // Connecting to Ignite using pre-configured DSN.
    $dbh = new PDO('odbc:LocalApacheIgniteDSN');

    // Changing PDO error mode.
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Executing the query. The salary field is an indexed field.
    $dbh->query('UPDATE Person SET salary = 42000 WHERE salary > 50000');

} catch (PDOException $e) {
    print "Error!: " . $e->getMessage() . "\n";
    die();
}
?>
```
</Tab>

<Tab title="SELECT">

```php
<?php
try {
    // Connecting to Ignite using pre-configured DSN.
    $dbh = new PDO('odbc:LocalApacheIgniteDSN');

    // Changing PDO error mode.
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Executing the query and getting a result set. The salary field is an indexed field.
    $res = $dbh->query('SELECT firstName, lastName, resume, salary from Person
        WHERE salary > 12000');

    if ($res == FALSE)
        print_r("Exception");

    // Printing results.
    foreach($res as $row) {
        print_r($row);
    }

} catch (PDOException $e) {
    print "Error!: " . $e->getMessage() . "\n";
    die();
}
?>
```
</Tab>

<Tab title="DELETE">

```php
<?php
try {
    // Connecting to Ignite using pre-configured DSN.
    $dbh = new PDO('odbc:LocalApacheIgniteDSN');

    // Changing PDO error mode.
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Performing query. Both firstName and lastName are non indexed fields.
    $dbh->query('DELETE FROM Person WHERE firstName = \'James\' and lastName = \'Bond\'');

} catch (PDOException $e) {
    print "Error!: " . $e->getMessage() . "\n";
    die();
}
?>
```
</Tab>
</Tabs>

<RightPane/>
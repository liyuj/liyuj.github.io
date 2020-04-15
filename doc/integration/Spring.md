# Spring
## 1.Spring缓存
### 1.1.概述
Ignite提供了一个`SpringCacheManager`-一个[Spring缓存抽象](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/cache.html)的实现。它提供了基于注解的方式来启用Java方法的缓存，这样方法的执行结果就会存储在Ignite缓存中。如果之后同一个方法通过同样的参数集被调用，结果会直接从缓存中获得而不是实际执行这个方法。

::: tip Spring缓存抽象文档
关于如何使用Spring缓存抽象的更多信息，包括可用的注解，可以参照这个文档页面：[http://docs.spring.io/spring/docs/current/spring-framework-reference/html/cache.html](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/cache.html)。
:::

### 1.2.如何启用缓存
只需要两个简单的步骤就可以将Ignite缓存嵌入基于Spring的应用：

 - 在嵌入式模式中使用正确的配置文件启动一个Ignite节点（即应用运行的同一个JVM）。它也可以有预定义的缓存，但不是必须的-如果必要缓存会在第一次访问时自动创建。
 - 在Spring应用上下文中配置`SpringCacheManager`作为缓存管理器。

嵌入式节点可以通过`SpringCacheManager`自己启动，这种情况下需要分别通过`configurationPath`或者`configuration`属性提供一个Ignite配置文件的路径或者`IgniteConfiguration`Bean（看下面的示例）。注意同时设置两个属性是非法的，会抛出`IllegalArgumentException`。

配置文件路径：
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
配置Bean：
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
注意应用内部启动的节点只是接入拓扑的一个入口，可以使用`bin/ignite.{sh|bat}`脚本按需启动任意数量的远程节点，所有这些节点都会参与缓存数据。
:::

### 1.3.动态缓存
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
也可以在客户端侧使用近缓存，要做到这一点只需要简单地通过`dynamicNearCacheConfiguration`属性提供一个近缓存配置即可。近缓存默认是不启用的，下面是一个例子：
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
### 1.4.示例
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

::: tip 缓存键
因为`organizationId`是唯一的方法参数，所以它会自动作为缓存键。
:::

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
注意这个方法是以雇员为参数的，而平均值是通过组织的Id将平均值存储在缓存中的。为了明确地指定什么作为缓存键，可以使用注解的`key`参数和[Spring表达式语言](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/expressions.html)。
`#e.organizationId`表达式的意思是从e变量中获取`organizationId`属性的值。本质上会在提供的雇员对象上调用`getOrganizationId()`方法，以及将返回的值作为缓存键。
:::

## 2.Spring Data
### 2.1.概述
[Spring Data框架](http://projects.spring.io/spring-data/)提供了一套统一并且广泛使用的API，它从应用层抽象了底层的数据存储，Spring Data有助于避免锁定到特定的数据库厂商，通过很小的代价就可以从一个数据库切换到另一个。

Ignite实现了Spring Data的`CrudRepository`接口，它不仅仅支持基本的CRUD操作，还支持通过统一的Spring Data API访问Ignite的SQL网格。
### 2.2.Maven配置
开始使用Ignite的Spring Data库的最简单方式就是将下面的Maven依赖加入应用的`pom.xml`文件：
```xml
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-spring-data</artifactId>
    <version>{ignite.version}</version>
</dependency>
```
::: tip Ignite版本
Ignite从2.0版本开始支持Spring Data，因此需要使用`2.0.0`及之后的版本。
:::
### 2.3.IgniteRepository
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
`@RepositoryConfig`注解需要指定，它会将Repository映射到一个分布式缓存，在上面的示例中，`PersonRepository`映射到了`PersonCache`。

自定义方法（比如`findByFirstName(name)`以及`findTopByLastNameLike(name)`）的签名会被自动处理，在该方法被调用时会被转成对应的SQL查询。另外，如果需要执行明确的SQL查询作为方法调用的结果，也可以使用`@Query(queryString)`注解。
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
### 2.4.Spring Data和Ignite配置
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

### 2.5.使用IgniteRepository
所有的配置和Repository准备好之后，就可以在应用的上下文中注册配置以及获取Repository的引用。

下面的示例代码就会展示如何在应用的上下文中注册`SpringAppCfg`（上面章节的示例配置），然后获取`PersonRepository`的引用：
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
### 2.6.示例
[GitHub](https://github.com/apache/ignite/tree/master/examples/src/main/java/org/apache/ignite/examples/springdata)上有完整的示例，也可以在Ignite二进制包的`examples`文件夹中找到。
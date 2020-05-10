# 服务网格
## 1.服务网格
### 1.1.概述
服务网格可以在集群上部署任意用户定义的服务，比如自定义计数器，ID生成器，分层映射等。

比如，服务网格可以作为基于微服务架构的解决方案或者应用的技术基础，了解更多的信息可以参考下面的文章：

 - [在Ignite之上运行微服务：第一部分](https://my.oschina.net/liyuj/blog/806752)
 - [在Ignite之上运行微服务：第二部分](https://my.oschina.net/liyuj/blog/829457)
 - [在Ignite之上运行微服务：第三部分](https://my.oschina.net/liyuj/blog/892755)

Ignite可以控制每个集群节点应该部署多少个服务的实例，可以自动地确保所有的服务正确地部署和容错。

![](https://files.readme.io/qOINezbjTiOJFl3ueIUs_ignite_service.png)

**特性一览**

 - 无论拓扑发生变化或者节点故障都会使部署的服务**持续有效**
 - 在集群中自动地部署任意数量的分布式服务实例
 - 自动地部署单例，包括集群单例、节点单例或者关联键单例
 - 通过在配置中指定在节点启动时自动部署分布式服务
 - 取消任何已部署的服务
 - 在集群中获得有关服务部署拓扑结构的信息
 - 对于访问远程部署的分布式服务创建服务代理

::: tip 注意
可以访问[服务示例](#_2-服务示例)章节来获得有关服务部署和访问服务的API信息。
:::

::: warning 注意
注意，所有的集群节点的类路径中默认都应包含服务类，服务网格是不支持[对等类加载](/doc/java/Clustering.md#_7-零部署)的，下面的[服务部署](#_1-5-部署管理)章节会描述如何克服这个默认约束。
:::

### 1.2.IgniteServices
所有的服务网格功能都是通过`IgniteServices`接口实现的。
```java
Ignite ignite = Ignition.ignite();

// Get services instance spanning all nodes in the cluster.
IgniteServices svcs = ignite.services();
```
可以将服务部署的范围限制在一个集群组内，这时，服务只会局限在集群组所属的节点内部。
```java
Ignite ignite = Ignitition.ignite();

ClusterGroup remoteGroup = ignite.cluster().forRemotes();

// Limit service deployment only to remote nodes (exclude the local node).
IgniteServices svcs = ignite.services(remoteGroup);
```
### 1.3.负载平衡
在所有的情况下，除非单例服务部署，Ignite会自动地确保集群内的每个节点部署相同数量的服务。当拓扑发生变化时，为了更好地进行负载平衡，Ignite会对服务的部署进行重新评估然后可能将已经部署的服务重新部署到其它的节点。
### 1.4.容错
Ignite会一直保证服务的持续有效，以及不管拓扑发生变化或者节点故障都会按照指定的配置进行部署。
### 1.5.部署管理
默认情况下，就像上面负载平衡部分描述的那样，会根据集群的负载情况，Ignite服务会被部署到一个随机的节点（多个节点）。

除了这个默认的方式，Ignite还提供了一个API以将服务部署到特定的节点集合上，下面会详细描述各个方式。

**基于节点过滤器的部署**

这个方式是基于过滤谓词的，Ignite服务引擎在决定将服务部署到哪些候选节点上时每个节点都会调用，如果谓词返回`true`，那么节点就会包含进集合，否则就会被排除。

节点过滤器需要实现`IgnitePredicate<ClusterNode>`接口，比如下面这个典型示例，它会通知服务引擎将一个Ignite服务部署到本地属性中包含`west.coast.attribute`的非客户端节点上：
```java
// The filter implementation.
public class ServiceFilter implements IgnitePredicate<ClusterNode> {
	@Override public boolean apply(ClusterNode node) {
  	// The service will be deployed on non client nodes
    // that have the attribute 'west.coast.node'.
    return !node.isClient() &&
    node.attributes().containsKey("west.coast.node");
  }
}
```
之后可以将其传给`ServiceConfiguration.setNodeFilter(...)`方法，然后使用这个配置启动服务。
```java
/ Initiating cache configuration.
ServiceConfiguration cfg = new ServiceConfiguration();

// Setting service instance to deploy.
cfg.setService(service);

// Setting service name.
cfg.setName("serviceName");

// Providing the nodes filter.
cfg.setNodeFilter(new ServiceFilter());

// Getting instance of Ignite Service Grid.
IgniteServices services = ignite.services();

// Deploying the service.
services.deploy(cfg);
```
::: warning 注意
确保节点过滤器的类位于每个节点的类路径中，不管服务是否要部署到那个节点上，否则会得到一个`ClassNotFoundException`。
另一方面，原则上在集群的整个生命周期中，是可以只将服务的实现类添加到可能待部署的节点的类路径中的。
:::

**基于集群组的部署**

另一个方式是基于定义的特定`ClusterGroup`，一旦通过特定的集群组获得了Ignite服务网格的引用，新的服务的部署只会发生在这个组的一个或者几个节点上。
```java
/ A service will be deployed on the server nodes only.
IgniteServices services = ignite.services(ignite.cluster().forServers());

// Deploying the service.
services.deploy(serviceCfg);
```
**基于关联键的部署**

最后一个可以影响服务部署的方式是基于关联键的定义，服务的配置需要包含关联键的值及其所属的缓存名，服务启动时，服务网格会将服务部署在该关联键所在的主节点上。在整个周期中，如果主节点发生变化，那么服务也会自动进行再部署。
```java
// Initiating cache configuration.
ServiceConfiguration cfg = new ServiceConfiguration();

// Setting service instance to deploy.
cfg.setService(service);

// Setting service name.
cfg.setName("serviceName");

// Setting the cache name and key's value for the affinity based deployment.
cfg.setCacheName("orgCache");
cfg.setAffinityKey(123);

// Getting instance of Ignite Service Grid.
IgniteServices services = ignite.services();

// Deploying the service.
services.deploy(cfg);
```
使用上述示例的配置部署服务后，Ignite会确保将服务部署到名为`orgCache`的缓存中犍为`123`所在的主节点上。
### 1.6.服务更新（重新部署）
如果在集群中有一个服务，然后希望不停止集群更新服务，基本的过程如下：

 1. 在服务类所在的仓库中更新jar文件（[UriDeploymentSpi](/doc/java/ComputeGrid.md#_11-2-urideploymentspi)中的uriList属性指向的位置）；
 2. 调用`services().cancel()`方法停止服务；
 3. 重新部署服务。

**示例配置**

下面是`UriDeployment`配置的示例，注意一下`uriList`属性：
```java
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="deploymentSpi">
        <bean class="org.apache.ignite.spi.deployment.uri.UriDeploymentSpi">
            <property name="uriList">
                <list>
                    <value>file:///Users/ExampleUser/Code/gridgain/playground/service/repository/</value>
                </list>
            </property>
            <property name="temporaryDirectoryPath" value="/Users/ExampleUser/.ignite/deployments/"/>
        </bean>
    </property>

    <!-- Other configuration -->
</bean>
```
重新部署服务的示例：
```java
try (Ignite ignite = Ignition.start("config/ignite.xml")) {
    String srvcName = "test-service";
    ignite.services().cancel(srvcName);
    ignite.services().deployNodeSingleton(srvcName, new TestService());
}
```
### 1.7.服务卸载
Ignite在所有的节点上存储已部署服务的描述符，如前述，如果一个服务部署在节点的子集上，停止所有这些节点也不会卸载服务，只要满足节点过滤器的节点有一个有备份且在线，服务都会以同样的配置重启。

要使用更新后的资源或者实现重新部署服务（比如更新jar文件），可以参见上面的[服务更新](#_1-6-服务更新（重新部署）)。

如果要卸载服务，可以使用`IgniteServices#cancel`或者`IgniteServices#cancelAll`方法。
```java
// Getting instance of Ignite Service Grid.
IgniteServices services = ignite.services();

services.cancel("serviceName");
```
## 2.服务示例
### 2.1.定义服务接口
作为一个示例，可以定义一个简单的计数器服务：`MyCounterService`接口，注意这是一个简单的Java接口，没有任何特别的注解或者方法。

```java
public interface MyCounterService {
    /**
     * Increment counter value and return the new value.
     */
    int increment() throws CacheException;

    /**
     * Get current counter value.
     */
    int get() throws CacheException;
}
```
### 2.2.服务实现
一个分布式服务的实现必须实现`Service`和`MyCounterService`两个接口。

这个计数器服务的实现将计数值存储在缓存中。这个计数值的键是服务的名字，这样可以使多个计数器服务实例复用同一个缓存。
```java
public class MyCounterServiceImpl implements Service, MyCounterService {
  /** Auto-injected instance of Ignite. */
  @IgniteInstanceResource
  private Ignite ignite;

  /** Distributed cache used to store counters. */
  private IgniteCache<String, Integer> cache;

  /** Service name. */
  private String svcName;

  /**
   * Service initialization.
   */
  @Override public void init(ServiceContext ctx) {
    // Pre-configured cache to store counters.
    cache = ignite.cache("myCounterCache");

    svcName = ctx.name();

    System.out.println("Service was initialized: " + svcName);
  }

  /**
   * Cancel this service.
   */
  @Override public void cancel(ServiceContext ctx) {
    // Remove counter from cache.
    cache.remove(svcName);

    System.out.println("Service was cancelled: " + svcName);
  }

  /**
   * Start service execution.
   */
  @Override public void execute(ServiceContext ctx) {
    // Since our service is simply represented by a counter
    // value stored in cache, there is nothing we need
    // to do in order to start it up.
    System.out.println("Executing distributed service: " + svcName);
  }

  @Override public int get() throws CacheException {
    Integer i = cache.get(svcName);

    return i == null ? 0 : i;
  }

  @Override public int increment() throws CacheException {
    return cache.invoke(svcName, new CounterEntryProcessor());
  }

  /**
   * Entry processor which atomically increments value currently stored in cache.
   */
  private static class CounterEntryProcessor implements EntryProcessor<String, Integer, Integer> {
    @Override public Integer process(MutableEntry<String, Integer> e, Object... args) {
      int newVal = e.exists() ? e.getValue() + 1 : 1;

      // Update cache.
      e.setValue(newVal);

      return newVal;
    }
  }
}
```
### 2.3.服务部署
可以将上述的计数器服务作为节点级单例部署在建立了`myCounterCache`缓存的集群组中。
```java
// Cluster group which includes all caching nodes.
ClusterGroup cacheGrp = ignite.cluster().forCacheNodes("myCounterService");

// Get an instance of IgniteServices for the cluster group.
IgniteServices svcs = ignite.services(cacheGrp);

// Deploy per-node singleton. An instance of the service
// will be deployed on every node within the cluster group.
svcs.deployNodeSingleton("myCounterService", new MyCounterServiceImpl());
```
### 2.4.服务代理
可以从集群内的任意节点访问已部署的服务实例。如果一个服务部署在某个节点，那么本地部署的实例会被返回，否则，如果服务不是本地的，那么会创建服务的一个远程代理。

**粘性和非粘性代理**

代理既可以是*粘性*的也可以是*非粘性*的。如果代理是粘性的，Ignite会总是访问同一个集群节点的服务，如果代理是非粘性的，那么Ignite会在服务部署的所有集群节点内对远程服务代理的调用进行负载平衡。
```java
// Get service proxy for the deployed service.
MyCounterService cntrSvc = ignite.services().
  serviceProxy("myCounterService", MyCounterService.class, /*not-sticky*/false);

// Ivoke a method on 'MyCounterService' interface.
cntrSvc.increment();

// Print latest counter value from our counter service.
System.out.println("Incremented value : " + cntrSvc.get());
```
### 2.5.从计算访问服务
为了方便，可以通过`@ServiceResource`注解在计算中注入一个服务代理的实例。
```java
IgniteCompute compute = ignite.compute();

compute.run(new IgniteRunnable() {
  @ServiceResource(serviceName = "myCounterService");
  private MyCounterService counterSvc;

  public void run() {
    // Ivoke a method on 'MyCounterService' interface.
    int newValue = cntrSvc.increment();

    // Print latest counter value from our counter service.
    System.out.println("Incremented value : " + newValue);
  }
});
```
## 3.集群单例
### 3.1.概述
`IgniteServices`可以在任意的集群节点上部署任意数量的的服务，不过最常用的特性是在集群中部署一个服务的单例，Ignite会管理这个单例除非拓扑发生变化或者节点发生故障。

::: tip 注意
注意如果拓扑发生了变化，因为网络的延迟，可能存在一个临时的情况，就是几个单例服务的实例在不止一个节点上都处于活跃状态（比如故障检测延迟）。
:::

### 3.2.集群单例
可以部署一个集群范围的单例服务，Ignite会保证集群内会一直有一个该服务的实例。当部署该服务的节点故障或者停止时，Ignite会自动在另一个节点上重新部署该服务。不过如果部署该服务的节点仍然在拓扑中，那么服务会一直部署在该节点上，除非拓扑发生了变化。
```java
IgniteServices svcs = ignite.services();

svcs.deployClusterSingleton("myClusterSingleton", new MyService());
```
上面的代码类似于下面的调用：
```java
svcs.deployMultiple("myClusterSingleton", new MyService(), 1, 1)
```
### 3.3.节点单例
也可以部署一个节点范围的单例服务，Ignite会保证每个节点都会有一个服务的实例在运行。当在集群组中启动了新的节点时，Ignite会自动地在每个新节点上部署一个新的服务实例。
```java
IgniteServices svcs = ignite.services();

svcs.deployNodeSingleton("myNodeSingleton", new MyService());
```
上面的代码类似于下面的调用：
```java
svcs.deployMultiple("myNodeSingleton", new MyService(), 0, 1);
```
### 3.4.缓存键关联单例
可以将一个服务的单例通过一个给定的关联键部署在一个主节点上。当拓扑或者主键节点发生变化时，Ignite会一直确保服务在之前的主节点上卸载然后部署在一个新的主节点上。
```java
IgniteServices svcs = ignite.services();

svcs.deployKeyAffinitySingleton("myKeySingleton", new MyService(), "myCache", new MyCacheKey());
```
上面的代码类似于下面的调用：
```java
IgniteServices svcs = ignite.services();

ServiceConfiguration cfg = new ServiceConfiguration();

cfg.setName("myKeySingleton");
cfg.setService(new MyService());
cfg.setCacheName("myCache");
cfg.setAffinityKey(new MyCacheKey());
cfg.setTotalCount(1);
cfg.setMaxPerNodeCount(1);

svcs.deploy(cfg);
```
## 4.服务配置
### 4.1.配置
除了通过调用Ignite提供的`IgniteServices.deploy(...)`方法部署服务之外，还可以通过IgniteConfiguration的`serviceConfiguration`属性在**启动时自动地部署服务**。

XML：
```xml
<bean class="org.apache.ignite.IgniteConfiguration">
    ...
    <!-- Distributed Service configuration. -->
    <property name="serviceConfiguration">
        <list>
            <bean class="org.apache.ignite.services.ServiceConfiguration">
                <property name="name" value="MyClusterSingletonSvc"/>
                <property name="maxPerNodeCount" value="1"/>
                <property name="totalCount" value="1"/>
                <property name="service">
                  <ref bean="myServiceImpl"/>
                </property>
            </bean>
        </list>
    </property>
</bean>

<bean id="myServiceImpl" class="foo.bar.MyServiceImpl">
  ...
</bean>
```
Java：
```java
ServiceConfiguration svcCfg1 = new ServiceConfiguration();

// Cluster-wide singleton configuration.
svcCfg1.setName("MyClusterSingletonSvc");
svcCfg1.setMaxPerNodeCount(1);
svcCfg1.setTotalCount(1);
svcCfg1.setService(new MyClusterSingletonImpl());

ServiceConfiguration svcCfg2 = new ServiceConfiguration();

// Per-node singleton configuration.
svcCfg2.setName("MyNodeSingletonSvc");
svcCfg2.setMaxPerNodeCount(1);
svcCfg2.setService(new MyNodeSingletonImpl());

IgniteConfiguration igniteCfg = new IgniteConfiguration();

igniteCfg.setServiceConfiguration(svcCfg1, svcCfg2);
...

// Start Ignite node.
Ignition.start(gridCfg);
```
### 4.2.启动后部署
可以通过配置然后在节点启动之后部署服务，除了可以部署各种集群单例的一些方便的方法外，还可以通过定制的配置来创建和部署服务。
```java
ServiceConfiguration cfg = new ServiceConfiguration();

cfg.setName("myService");
cfg.setService(new MyService());

// Maximum of 4 service instances within cluster.
cfg.setTotalCount(4);

// Maximum of 2 service instances per each Ignite node.
cfg.setMaxPerNodeCount(2);

ignite.services().deploy(cfg);
```
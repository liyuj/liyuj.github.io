# Ignite服务
## 1.概述
服务是可以部署到Ignite集群并执行特定操作的一部分功能，在一个或多个节点上可以有一个服务的多个实例。

Ignite服务具有以下功能：

**负载均衡**

除了单例服务部署之外，Ignite都会自动确保在集群内的每个节点上部署大约相同数量的服务。当集群拓扑发生变化时，Ignite会重新评估服务的部署，并可能将已经部署的服务重新部署到另一个节点，以实现更好的负载平衡。

**容错**

Ignite会保证服务的持续可用性，即使发生拓扑变更或者节点故障，都会根据指定的配置进行部署。

**热部署**

可以使用Ignite的`DeploymentSpi`配置来重新部署服务，而无需重启集群，具体请参见[重新部署服务](#_1-7-重新部署服务)。

Ignite服务可以用作基于微服务的解决方案或应用的基础，从以下系列文章中可以了解更多的信息：

 - [在Ignite之上运行微服务：第一部分](https://my.oschina.net/liyuj/blog/806752)
 - [在Ignite之上运行微服务：第二部分](https://my.oschina.net/liyuj/blog/829457)
 - [在Ignite之上运行微服务：第三部分](https://my.oschina.net/liyuj/blog/892755)

Ignite的[代码库](https://github.com/apache/ignite/tree/master/examples/src/main/java/org/apache/ignite/examples/servicegrid)中，也有服务的示例实现。

## 2.实现服务
服务需要实现[Service](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/services/Service.html)接口，该`Service`接口具有3个方法：

 - `init(ServiceContext)`：该方法是在服务部署之前被Ignite调用的（`execute()`方法被调用之前）；
 - `execute(ServiceContext)`：服务的执行方法；
 - `cancel(ServiceContext)`：取消服务执行的方法。

## 3.部署服务
可以在运行时以编程方式部署服务，也可以通过服务配置作为节点配置的一部分来部署服务，后者会在集群启动时部署服务。

### 3.1.运行时部署服务
可以通过`IgniteServices`的实例在运行时部署服务，该实例可以通过Ignite实例调用`Ignite.services()`方法获得。

`IgniteServices`接口有多种用于部署服务的方法：

 - `deploy(ServiceConfiguration)`：部署由给定配置定义的服务；
 - `deployNodeSingleton(…​)`：在每个服务端节点上部署服务实例；
 - `deployClusterSingleton(…​)`：每个集群部署一个服务实例。如果部署了服务的集群节点停止，则Ignite会自动在另一个节点上重新部署服务；
 - `deployKeyAffinitySingleton(…​)`：在给定键的主节点上部署服务的单一实例；
 - `deployMultiple(…​)`：部署给定数量的服务实例。

下面是集群单例部署的示例：
```java
Ignite ignite = Ignition.start();

//get the services interface associated with all server nodes
IgniteServices services = ignite.services();

//start a node singleton
services.deployClusterSingleton("myCounterService", new MyCounterServiceImpl());
```
下面是使用`ServiceConfiguration`部署集群单例服务的示例：
```java
Ignite ignite = Ignition.start();

ServiceConfiguration serviceCfg = new ServiceConfiguration();

serviceCfg.setName("myCounterService");
serviceCfg.setMaxPerNodeCount(1);
serviceCfg.setTotalCount(1);
serviceCfg.setService(new MyCounterServiceImpl());

ignite.services().deploy(serviceCfg);
```
### 3.2.节点启动时部署服务
可以将服务指定为节点配置的一部分，然后与节点一起启动。如果服务是节点单例，则该服务将在集群的每个节点上启动。如果服务是集群单例，则在第一个集群节点中启动该服务，如果第一个节点终止，则将其重新部署到其他节点中的一个。该服务必须在每个节点的类路径上可用。

以下是配置集群单例服务的示例：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

    <property name="serviceConfiguration">
        <list>
            <bean class="org.apache.ignite.services.ServiceConfiguration">
                <property name="name" value="myCounterService"/>
                <property name="maxPerNodeCount" value="1"/>
                <property name="totalCount" value="1"/>
                <property name="service">
                    <bean class="org.apache.ignite.snippets.services.MyCounterServiceImpl"/>
                </property>
            </bean>
        </list>
    </property>

</bean>
```
</Tab>

<Tab title="Java">

```java
ServiceConfiguration serviceCfg = new ServiceConfiguration();

serviceCfg.setName("myCounterService");
serviceCfg.setMaxPerNodeCount(1);
serviceCfg.setTotalCount(1);
serviceCfg.setService(new MyCounterServiceImpl());

IgniteConfiguration igniteCfg = new IgniteConfiguration()
        .setServiceConfiguration(serviceCfg);

// Start the node.
Ignite ignite = Ignition.start(igniteCfg);
```
</Tab>
</Tabs>

## 4.部署到节点子集
当通过调用`ignite.services()`拿到`IgniteServices`接口实例后，`IgniteServices`实例是与所有服务端节点关联的。这意味着Ignite会从所有的服务端节点集合中选择将服务部署到何处，但是可以使用下面描述的各种方法来修改用于服务部署的节点集。
### 4.1.集群单例
集群单例是一种部署策略，这时集群中该服务只有一个实例，Ignite会保证该实例的持续可用性。如果服务所在的集群节点故障或者停止，Ignite会自动将服务重新部署到其他的节点。
### 4.2.集群组
可以使用`ClusterGroup`接口将服务部署到集群的一个子集，如果服务是节点单例的，服务会部署到子集的所有节点上，如果服务是集群单例的，其会部署到子集中的某个节点上。
```java
Ignite ignite = Ignition.start();

//deploy the service to the nodes that host the cache named "myCache"
ignite.services(ignite.cluster().forCacheNodes("myCache"));
```
### 4.3.节点过滤器
可以使用节点属性来定义用于服务部署的节点子集，这是通过节点过滤器来实现的。节点过滤器是`IgnitePredicate<ClusterNode>`的实例，Ignite为与`IgniteService`接口关联的每个节点调用该过滤器，如果某个节点的谓词返回`true`，则会包含该节点。

::: warning 警告
节点过滤器的类定义必须存在于所有节点的类路径中。
:::
下面是节点过滤器的一个示例，该过滤器包含了拥有`west.coast.node`属性的服务端节点。

```java
public static class ServiceFilter implements IgnitePredicate<ClusterNode> {
    @Override
    public boolean apply(ClusterNode node) {
        // The service will be deployed on the server nodes
        // that have the 'west.coast.node' attribute.
        return !node.isClient() && node.attributes().containsKey("west.coast.node");
    }
}
```
使用该过滤器部署服务：
```java
Ignite ignite = Ignition.start();

ServiceConfiguration serviceCfg = new ServiceConfiguration();

// Setting service instance to deploy.
serviceCfg.setService(new MyCounterServiceImpl());
serviceCfg.setName("serviceName");
serviceCfg.setMaxPerNodeCount(1);

// Setting the nodes filter.
serviceCfg.setNodeFilter(new ServiceFilter());

// Getting an instance of IgniteService.
IgniteServices services = ignite.services();

// Deploying the service.
services.deploy(serviceCfg);
```
### 4.4.缓存键
基于关联的部署可以将服务部署到缓存的某个键对应的主节点上，具体请参见[关联并置](/doc/java/DataModeling.md#_3-关联并置)章节的介绍。对于基于关联的部署，需要在服务配置中指定对应的缓存和键。缓存不必包含该键，节点由关联函数确定。如果因为集群拓扑发生变化导致该键被重新分配到了其他的节点，该服务也会被重新部署到该节点。

```java
Ignite ignite = Ignition.start();

//making sure the cache exists
ignite.getOrCreateCache("orgCache");

ServiceConfiguration serviceCfg = new ServiceConfiguration();

// Setting service instance to deploy.
serviceCfg.setService(new MyCounterServiceImpl());

// Setting service name.
serviceCfg.setName("serviceName");
serviceCfg.setTotalCount(1);

// Specifying the cache name and key for the affinity based deployment.
serviceCfg.setCacheName("orgCache");
serviceCfg.setAffinityKey(123);

IgniteServices services = ignite.services();

// Deploying the service.
services.deploy(serviceCfg);
```
## 5.访问服务
在运行时通过服务代理可以访问服务，代理既可以是*粘性*的也可以是*非粘性*的。粘性的代理总是会访问同一个集群节点的服务，非粘性的代理会在服务部署的所有集群节点内对远程服务的调用进行负载平衡。

以下代码片段获取服务的非粘性代理后调用服务的方法：

```java
//access the service by name
MyCounterService counterService = ignite.services().serviceProxy("myCounterService",
        MyCounterService.class, false); //non-sticky proxy

//call a service method
counterService.increment();
```
## 6.卸载服务
使用`IgniteServices.cancel(serviceName)`或`IgniteServices.cancelAll()`方法可以卸载服务。
```java
services.cancel("myCounterService");
```
## 7.重新部署服务
如果希望更新服务的实现但是又不希望停止集群，可以通过Ignite的[DeploymentSPI](/doc/java/CodeDeployment.md)配置实现。

重新部署服务的过程如下：

 1. 更新服务存储位置的jar包（在`UriDeploymentSpi.uriList`属性中列出），过了配置的更新时间后，Ignite会重新加载新的类；
 2. 将服务实现添加到客户端节点的类路径然后启动客户端；
 3. 在客户端节点调用`Ignite.services().cancel()`方法来停止该服务；
 4. 从客户端节点部署该服务；
 5. 停止客户端节点。

通过这个方法，不再需要停止服务端节点，所以就不会中断集群的运营。

<RightPane/>
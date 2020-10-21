# 代码部署
## 1.部署用户代码
除了[对等类加载](#_2-对等类加载)之外，还可以通过配置`UriDeploymentSpi`部署用户代码。使用这种方法，可以在节点配置中指定库文件的位置。Ignite会定期扫描该位置，并在类文件有变更时重新部署。该位置可以是文件系统目录或HTTP(S)位置。当Ignite检测到库文件已从该位置删除时，这些类将从集群中卸载。

可以通过提供目录和http(s)的URL来指定（不同类型的）多个位置。
### 1.1.通过本地目录部署
要从文件系统目录部署库文件，需要将目录路径添加到`UriDeploymentSpi`配置中的URI列表中。该目录必须存在于指定目录的节点上，并且包含要部署的类的jar文件。注意，必须使用`file：//`模式指定路径。可以在不同的节点上指定不同的目录。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="deploymentSpi">
        <bean class="org.apache.ignite.spi.deployment.uri.UriDeploymentSpi">
            <property name="temporaryDirectoryPath" value="/tmp/temp_ignite_libs"/>
            <property name="uriList">
                <list>
                    <value>file://freq=2000@localhost/home/username/user_libs</value>
                </list>
            </property>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

UriDeploymentSpi deploymentSpi = new UriDeploymentSpi();

deploymentSpi.setUriList(Arrays.asList("file://freq=2000@localhost/home/username/user_libs"));

cfg.setDeploymentSpi(deploymentSpi);

try (Ignite ignite = Ignition.start(cfg)) {
    //execute the task represented by a class located in the "user_libs" directory
    ignite.compute().execute("org.mycompany.HelloWorldTask", "My Args");
}
```
</Tab>
</Tabs>

可以在URL中传入如下的参数：

|参数|描述|默认值|
|---|---|---|
|`freq`|扫描频率（毫秒）|`5000`|

### 1.2.通过URL部署
要从http(s)位置部署库文件，需要将URL添加到`UriDeploymentSpi`配置中的URI列表中。

Ignite会解析HTML文件，查找页面中所有`<a>`标签的HREF属性，其引用应指向待部署的jar文件。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="deploymentSpi">
        <bean class="org.apache.ignite.spi.deployment.uri.UriDeploymentSpi">
            <property name="temporaryDirectoryPath" value="/tmp/temp_ignite_libs"/>
            <property name="uriList">
                <list>
                    <value>http://username:password;freq=10000@www.mysite.com:110/ignite/user_libs</value>
                </list>
            </property>
        </bean>
    </property>
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

UriDeploymentSpi deploymentSpi = new UriDeploymentSpi();

deploymentSpi.setUriList(Arrays
        .asList("http://username:password;freq=10000@www.mysite.com:110/ignite/user_libs"));

cfg.setDeploymentSpi(deploymentSpi);

try (Ignite ignite = Ignition.start(cfg)) {
    //execute the task represented by a class located in the "user_libs" url
    ignite.compute().execute("org.mycompany.HelloWorldTask", "My Args");
}
```
</Tab>
</Tabs>

可以在URL中传入如下的参数：

|参数|描述|默认值|
|---|---|---|
|`freq`|扫描频率（毫秒）|`300000`|

## 2.对等类加载
### 2.1.概述
对等类加载是指将类从定义它们的本地节点加载到远程节点。启用对等类加载后，就不必在集群中的每个节点上手动部署Java代码，并且每次更改时再重新部署，Ignite会自动将类从定义它们的节点加载到使用它们的节点。

::: warning 在.NET中自动加载程序集
如果开发的是C#和.NET应用，请参见[远程程序集加载](/doc/java/DotnetSpecific.md#_12-远程程序集加载)章节的介绍。
:::

例如，当使用自定义转换器[查询数据](/doc/java/UsingKeyValueApi.md#_3-使用扫描查询)时，只需在发起计算的客户端节点上定义任务，然后Ignite就会将类加载到服务端节点。

启用后，对等类加载适用于如下场景：

 - 通过[计算接口](/doc/java/DistributedComputing.md#_1-分布式计算api)提交的任务和作业；
 - [扫描查询](/doc/java/UsingKeyValueApi.md#_3-使用扫描查询)和[持续查询](/doc/java/ContinuousQueries.md)使用的转换器和过滤器；
 - 与[数据流处理器](/doc/java/DataStreaming.md)一起使用的流转换器、接收器和访问器；
 - [EntryProcessor](/doc/java/DistributedComputing.md#_8-3-entryprocessor)。

在定义上面列出的类时，建议将每个类创建为单独的类或内部静态类，而不是创建为lambda或匿名内部类。非静态内部类与其闭包类一起被序列化，如果闭包类的某些字段无法序列化，则将抛出序列化异常。
::: warning 警告
对等类加载功能不会部署缓存中存储的条目的键和对象类。
:::
::: danger 警告
对等类加载功能允许任何客户端将自定义代码部署到集群，如果要在生产环境中使用，请确保只有授权的客户端才能访问集群。
:::

当在远程节点上需要一个类时，将发生以下情况：

 - Ignite检查该类是否在本地类路径中可用，即是否在系统初始化期间加载了该类，如果有，则将其返回。这时不会从对等节点加载任何类；
 - 如果该类在本地不可用，则将对类定义的请求发送到发起方节点，发起方节点会发送类的字节码，然后该类就会被加载到工作节点上。每个类只会加载一次，在节点上加载类定义后，就不必再次加载。

::: tip 部署第三方库
在使用对等类加载时，应该注意从对等节点加载的库与在类路径中本地可用的库。建议将所有第3方库都包含在每个节点的类路径中，这可以通过将JAR文件放置到`{IGNITE_HOME}/libs`文件夹中来实现，这样就不会出现每更改一行代码都得将上兆字节的第三方类库转移到远程节点的情况。
:::
### 2.2.启用对等类加载
下面是配置对等类加载的方法：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

    <!-- Enable peer class loading. -->
    <property name="peerClassLoadingEnabled" value="true"/>
    <!-- Set deployment mode. -->
    <property name="deploymentMode" value="CONTINUOUS"/>

</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

cfg.setPeerClassLoadingEnabled(true);
cfg.setDeploymentMode(DeploymentMode.CONTINUOUS);

// Start the node.
Ignite ignite = Ignition.start(cfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteConfiguration
{
    PeerAssemblyLoadingMode = PeerAssemblyLoadingMode.CurrentAppDomain
};
var ignite = Ignition.Start(cfg);
```
</Tab>
</Tabs>

下表列出了和对等类加载有关的参数：

|参数|描述|默认值|
|---|---|---|
|`peerClassLoadingEnabled`|启用/禁用对等类加载|`false`|
|`deploymentMode`|对等类加载模式|`SHARED`|
|`peerClassLoadingExecutorService`|配置对等类加载使用的线程池，如果未配置，会使用一个默认的。|`null`|
|`peerClassLoadingExecutorServiceShutdown`|对等类加载ExecutorService关闭标志，如果该标志设置为`true`，对等类加载线程池当节点停止时会强制关闭。|`true`|
|`peerClassLoadingLocalClassPathExclude`|系统类路径的包列表，即使它们在本地存在，P2P也不会加载。|`null`|
|`peerClassLoadingMissedResourcesCacheSize`|错过的资源缓存的大小，设为0会避免错过的资源缓存。|`100`|

### 2.3.对等类加载模式
#### 2.3.1.PRIVATE和ISOLATED
在主节点，同一个类加载器部署的类，还会在工作节点远程共享同一个类加载器。不过从不同主节点部署的任务不会在工作节点共享同一个类加载器，这对于开发很有用，这时不同的开发者可以工作于同一个类的不同版本上。自从`@UserResource`注解删除后，`PRIVATE`和`ISOLATED`部署模式之间就没有不同了。这两个常量都因为后向兼容的原因保留了，并且这两个之一可能在未来的大版本中被删除。

这个模式中，当主节点离开集群时，类会卸载。
#### 2.3.2.SHARED
这是默认的部署模式。这个模式中，来自不同主节点的、用户版本相同的类会在工作节点上共享同一个类加载器。当所有主节点离开集群或者用户版本发生变化时，类会卸载。这个模式可以使来自不同主节点的类在远程节点上共享用户资源的同一个实例（见下面）。这个模式对于生产环境特别有用，与`ISOLATED`模式相比，它在单一主节点上有一个单一类加载器的作用域，`SHARED`模式会向所有主节点扩展部署作用域。

这个模式中，当所有的主节点离开集群时，类会卸载。
#### 2.3.3.CONTINUOUS
在`CONTINUOUS`模式中，当主节点离开集群时类不会卸载。卸载只会发生于类的用户版本发生变化时。这个方式的优势是可以使来自不同主节点的任务在工作节点共享同一个用户资源的实例，这使得在工作节点上执行的所有任务可以复用，比如，连接池或者缓存的同一个实例。当用这个模式时，可以启动多个独立的工作节点，在主节点定义用户资源并且在工作节点上初始化一次，不管它们来自那个主节点。与`ISOLATED`部署模式相比，它在单一主节点上有一个单一类加载器的作用域，`CONTINUOUS`模式会向所有主节点扩展部署作用域，这对于生产环境非常有用。

这个模式中，即使所有的主节点离开集群，类都不会卸载。
### 2.4.卸载和用户版本
通过对等类加载获得的类定义，有它们自己的生命周期。在特定的事件中（当主节点离开或者用户版本变化，依赖于部署模式），类信息会从集群中卸载，类定义会从集群中的所有节点抹掉，与该类链接的用户资源，也会有选择地抹掉（还是依赖于部署模式）。

当部署于`SHARED`和`CONTINUOUS`模式时，如果想重新部署类，可以引入用户版本。Ignite默认会自动检测类加载器是否改变或者一个节点是否重新启动。不过如果希望在节点的一个子集上改变或者重新部署代码，或者在`CONTINUOUS`模式中，杀掉所有的现存部署，那么需要修改用户版本。用户版本是在类路径的`META-INF/ignite.xml`中指定的，如下所示：
```xml
<!-- User version. -->
<bean id="userVersion" class="java.lang.String">
    <constructor-arg value="0"/>
</bean>
```
所有的Ignite启动脚本（ignite.sh或者ignite.bat）默认都会从`IGNITE_HOME/config/userversion`文件夹获取用户版本。通常，在这个文件夹中更新用户版本就够了，不过当使用GAR或者JAR部署时，需要记得提供一个`META-INF/ignite.xml`文件，里面有合适的用户版本。

<RightPane/>
# 1.入门
## 1.1.入门
![](https://files.readme.io/5c0c967-gridgain_platform.png)
### 1.1.1.先决条件
GridGain官方在如下环境中进行了测试：

 - JDK：Oracle JDK8，Open JDK8，IBM JDK8；
 - OS：Linux（任何版本），Mac OS X（10.6及以上），Windows(XP及以上)，Windows Server（2008及以上），Oracle Solaris；
 - 网络：没有限制（建议10G）；
 - 架构：x86，x64，SPARC，PowerPC。

### 1.1.2.安装
以下是安装GridGain企业版的简述：

 - 从[这里](http://www.gridgain.com/download/editions/)下载GridGain的企业版压缩包；
 - 解压压缩包到系统的安装文件夹；
 - 配置`IGNITE_HOME`环境变量指向前面解压的安装文件夹，确保路径不要以`/`结尾（此步骤为可选）。

### 1.1.3.配置
GridGain基于Apache Ignite项目，以插件的方式提供了企业级功能，Ignite的所有功能在GridGain中仍然可用，API层面没有任何变化，具体的细节可以看[Ignite文档](/doc/java/)。

::: tip 注意
GridGain复用了Ignite的系统属性、环境属性和启动脚本等，比如使用`ignite.sh`脚本就可以启动一个GridGain节点，但是已经获得了所有的企业级功能，因为已经自动启用了GridGain的插件。
:::
GridGain插件自动使用默认的配置启用。如果需要修改（添加安全性、可移植对象、数据中心复制等），则应使用`GridGainConfiguration`类。它实现了Ignite的`PluginConfiguration`接口，因此可以通过`IgniteConfiguration.setPluginConfigurations()`配置属性进行设置。

例如，如果要启用安全性，可以使用`GridGainConfiguration.setSecurityCredentialsProvider()`方法对其进行配置：
```java
// Ignite configuration.
IgniteConfiguration igniteCfg = new IgniteConfiguration();
 
// GridGain plugin configuration.
GridGainConfiguration gridCfg = new GridGainConfiguration();

// Create security credentials.
SecurityCredentials creds = new SecurityCredentials("username", "password");

// Create basic security provider.
SecurityCredentialsBasicProvider provider = new SecurityCredentialsBasicProvider(creds);

// Specify security provider in GridGain Configuration.
gridCfg.setSecurityCredentialsProvider(provider);
```
### 1.1.4.从命令行启动
可以使用默认配置或通过传递配置文件从命令行启动GridGain节点。可以启动任意多个节点，它们之间都会自动发现。

**使用默认的配置**

要使用默认的配置启动一个节点，打开终端，转到`IGNITE_HOME`（GridGain安装文件夹），然后输入：
```bash
$ bin/ignite.sh
```
输出大致如下：
```
[02:49:12] Ignite node started OK (id=ab5d18a6)
[02:49:12] Topology snapshot [ver=1, nodes=1, CPUs=8, heap=1.0GB]
```
`ignite.sh`默认会使用`config/default-config.xml`启动一个节点。

**传递配置文件**

要显示指定配置文件，在终端中，进入GridGain的安装文件夹然后输入`ignite.sh <path to configuration file>`，比如：
```bash
$ bin/ignite.sh examples/config/example-cache.xml
```
配置文件的路径可以是绝对路径，也可以是相对于`IGNITE_HOME`（GridGain安装文件夹）或者类路径的`META-INF`文件夹。

::: tip 交互式模式
如果希望以交互式模式选择一个配置文件，传入`-i`标志即可，比如：`ignite.sh -i`。
:::
**通过Maven获得**

另一个在项目中使用GridGain的简单方法是使用Maven的依赖管理。

GridGain只需要一个`gridgain-core`作为强制依赖项。通常，还需要为基于Spring的XML配置添加`ignite-spring`依赖，并为SQL查询添加`ignite-indexing`依赖。

将`${gridgain.version}`替换为实际使用的GridGain企业版版本，将`${ignite.version}`替换为实际的Ignite或GridGain专业版版本。

最后，为了使用GridGain企业版或专业版的库，必须将GridGain的外部存储库添加到Maven配置文件中，如下所示：
```xml
<repositories>
    <repository>
        <id>GridGain External Repository</id>
        <url>http://www.gridgainsystems.com/nexus/content/repositories/external</url>
    </repository>
</repositories>
 
<dependency>
    <groupId>org.gridgain</groupId>
    <artifactId>gridgain-core</artifactId>
    <version>${gridgain.version}</version>
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
### 1.1.5.第一个GridGain计算应用
下面会编写第一个网格应用程序，它将计算一个句子中的非空白字符数。作为一个示例，会将一个句子分成多个单词，并让每个计算作业计算每个单词中的字符数。最后，简单地从各个作业中得到的结果相加，就会得到总数：

Java8：
```java
try (Ignite ignite = Ignition.start("examples/config/example-ignite.xml")) {
  Collection<IgniteCallable<Integer>> calls = new ArrayList<>();
 
  // Iterate through all the words in the sentence and create Callable jobs.
  for (final String word : "Count characters using callable".split(" "))
    calls.add(word::length);
 
  // Execute collection of Callables on the grid.
  Collection<Integer> res = ignite.compute().call(calls);
 
  // Add up all the results.
  int sum = res.stream().mapToInt(Integer::intValue).sum();
  
  System.out.println("Total number of characters is '" + sum + "'.");
} 
```
Java7：
```java
try (Ignite ignite = Ignition.start("examples/config/example-ignite.xml")) {
    Collection<IgniteCallable<Integer>> calls = new ArrayList<>();
  
    // Iterate through all the words in the sentence and create Callable jobs.
    for (final String word : "Count characters using callable".split(" ")) {
        calls.add(new IgniteCallable<Integer>() {
            @Override public Integer call() throws Exception {
                return word.length();
            }
        });
    }
  
    // Execute collection of Callables on the grid.
    Collection<Integer> res = ignite.compute().call(calls);
  
    int sum = 0;
  
    // Add up individual word lengths received from remote nodes.
    for (int len : res)
        sum += len;
  
    System.out.println(">>> Total number of characters in the phrase is '" + sum + "'.");
} 
```
::: tip 零部署
因为有零部署特性，当从IDE中运行上述应用时，远程节点会自动接收到作业而不需要进行显式地部署。
:::
### 1.1.6.第一个GridGain数据应用
下面是几个简单的示例，进行分布式缓存的读写，以及执行基本的事务等。

因为示例中用到了缓存，因此要确保它们已经配置好，下面会使用Ignite已经附带的示例配置，他已经配置好了若干个缓存：
```bash
$ bin/ignite.sh examples/config/example-cache.xml
```
读和写：
```java
try (Ignite ignite = Ignition.start("examples/config/example-cache.xml")) {
    IgniteCache<Integer, String> cache = ignite.getOrCreateCache("myCacheName");
  
    // Store keys in cache (values will end up on different cache nodes).
    for (int i = 0; i < 10; i++)
        cache.put(i, Integer.toString(i));
  
    for (int i = 0; i < 10; i++)
        System.out.println("Got [key=" + i + ", val=" + cache.get(i) + ']');
}
```
原子操作：
```java
// Put-if-absent which returns previous value.
Integer oldVal = cache.getAndPutIfAbsent("Hello", 11);
   
// Put-if-absent which returns boolean success flag.
boolean success = cache.putIfAbsent("World", 22);
   
// Replace-if-exists operation (opposite of getAndPutIfAbsent), returns previous value.
oldVal = cache.getAndReplace("Hello", 11);
  
// Replace-if-exists operation (opposite of putIfAbsent), returns boolean success flag.
success = cache.replace("World", 22);
   
// Replace-if-matches operation.
success = cache.replace("World", 2, 22);
   
// Remove-if-matches operation.
success = cache.remove("Hello", 1); 
```
事务：
```java
try (Transaction tx = ignite.transactions().txStart()) {
    Integer hello = cache.get("Hello");
   
    if (hello == 1)
        cache.put("Hello", 11);
   
    cache.put("World", 22);
   
    tx.commit();
} 
```
分布式锁：
```java
// Lock cache key "Hello".
Lock lock = cache.lock("Hello");
  
lock.lock();
  
try {
    cache.put("Hello", 11);
    cache.put("World", 22);
}
finally {
    lock.unlock();
}
```
### 1.1.7.GridGain Visor管理控制台
检查数据网格的内容以及执行其它众多管理和监视操作的最简单方法是使用GridGain的Visor GUI实用程序。

要启动Visor，只需运行：
```bash
$ bin/ggvisorui.sh
```
## 1.2.配置
GridGain是作为Ignite的插件存在的，只可以配置企业级的特性（安全、数据中心复制等），开源版的特性都是在Ignite中进行配置的，具体可以看Ignite的[文档](/doc/java/)。
### 1.2.1.GridGainConfiguration
GridGain的主配置类是`GridGainConfiguration`，从代码上来说，它是Ignite的一个插件。

Java：
```java
// Ignite configuration.
IgniteConfiguration cfg = new IgniteConfiguration();
 
// GridGain plugin configuration.
GridGainConfiguration ggCfg = new GridGainConfiguration();
 
// For example, this is how rolling updates are enabled.
ggCfg.setRollingUpdatesEnabled(true);
 
// Set GridGain plugin configuration to Ignite configuration.
cfg.setPluginConfigurations(ggCfg);
```
XML：
```xml

<!-- Ignite configuration bean. -->
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    ...
    <property name="pluginConfigurations">
        <list>
            <!-- GridGain plugin configuration bean. -->
            <bean class="org.gridgain.grid.configuration.GridGainConfiguration">
                <!-- For example, this is how rolling updates are enabled. -->
                <property name="rollingUpdatesEnabled" value="true"/>
            </bean>
        </list>
    </property>
</bean>
```
下面是可用的配置属性的完整列表：

|方法|描述|默认值|
|---|---|---|
|`setLicenseUrl()`|设定许可证文件的URL（如果和默认的URL不同）|`gridgain-license.xml`位于GridGain的根目录|
|`setDataCenterId()`|设定网格数据中心ID，数据中心ID在参与数据中心复制的所有拓扑中都应该是唯一的，对于属于给定拓扑的所有节点也是唯一的。|0|
|`setDrSenderConfiguration()`|设定数据中心发送者配置||
|`setDrReceiverConfiguration()`|设定数据中心接收者配置||
|`setAuthenticator()`|设定配置好的`Authenticator`的实例||
|`setSecurityCredentialsProvider()`|设定安全凭据||
|`setInteropConfiguration()`|设定与其他平台的互操作性||
|`setRollingUpdatesEnabled()`|启用和禁用滚动升级|false|

### 1.2.2.GridGainCacheConfiguration

另外，Ignite的`CachePluginConfiguration`可以对缓存的配置进行扩展，然后GridGain通过`GridGainCacheConfiguration`类实现了这个接口。

下面是配置方法：

Java：
```java
// Ignite cache configuration.
CacheConfiguration cacheCfg = new CacheConfiguration("myCache");
  
// GridGain plugin cache configuration.
GridGainCacheConfiguration ggCacheCfg = new GridGainCacheConfiguration();
 
// For example, this is how to set conflict resolution mode (AUTO is the default value).
ggCacheCfg.setConflictResolverMode(CacheConflictMode.AUTO);
  
// Set GridGain plugin cache configuration to Ignite cache configuration.
cacheCfg.setPluginConfigurations(ggCacheCfg); 
```
XML：
```xml
<!-- Ignite cache configuration bean. -->
<bean class="org.apache.ignite.configuration.CacheConfiguration">
    ...
    <property name="pluginConfigurations">
        <list>
            <!-- GridGain plugin cache configuration bean. -->
            <bean class="org.gridgain.grid.configuration.GridGainCacheConfiguration">
                <!-- For example, this is how to set conflict resolution mode (AUTO is the default value). -->
                <property name="conflictResolverMode" value="AUTO"/>
            </bean>
        </list>
    </property>
</bean> 
```
下面是可用的配置属性的完整列表：

|方法|描述|默认值|
|---|---|---|
|`setDrSenderConfiguration()`|设定数据中心复制发送者配置||
|`setDrReceiverEnabled()`|设定数据中心复制接收者启用标志|false|
|`setConflictResolverMode()`|设定冲突解决模式（`AUTO`或者`ALWAYS`）|`AUTO`|
|`setConflictResolver()`|设定冲突解决器||

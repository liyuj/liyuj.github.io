# 第三方集成
## 1.ASP.NET输出缓存
Ignite缓存可用作ASP.NET的输出缓存，这对于在Web服务器之间共享输出缓存尤其有效。

### 1.1.安装
**二进制包**：添加对`Apache.Ignite.AspNet.dll`的引用；
**NuGet**：`Install-Package Apache.Ignite.AspNet`。

### 1.2.配置：自动启动Ignite
如果要自动启动Ignite用于输出缓存，可以在`web.config`中配置`IgniteConfigurationSection`，具体请参见[配置](/doc/2.8.0/net/#_5-配置)章节的内容：
```xml
<configuration>
    <configSections>
        <section name="igniteConfiguration" type="Apache.Ignite.Core.IgniteConfigurationSection, Apache.Ignite.Core" />
    </configSections>

    <igniteConfiguration autoGenerateIgniteInstanceName="true">
        <cacheConfiguration>
            <cacheConfiguration name='myWebCache' />
        </cacheConfiguration>
    </igniteConfiguration>
</configuration>
```
在`web.config`中配置输出缓存：
```xml
<system.web>
  <caching>
    <outputCache defaultProvider="apacheIgnite">
      <providers>
          <add name="apacheIgnite" type="Apache.Ignite.AspNet.IgniteOutputCacheProvider, Apache.Ignite.AspNet" igniteConfigurationSectionName="igniteConfiguration" cacheName="myWebCache" />
      </providers>
    </outputCache>
  </caching>
</system.web>
```
### 1.3.配置：手动启动Ignite
也可以手动启动Ignite的实例，然后在提供者配置中指定它的名字：
```xml
<system.web>
  <caching>
    <outputCache defaultProvider="apacheIgnite">
      <providers>
          <add name="apacheIgnite" type="Apache.Ignite.AspNet.IgniteOutputCacheProvider, Apache.Ignite.AspNet" cacheName="myWebCache" />
      </providers>
    </outputCache>
  </caching>
</system.web>
```
在接收任何请求之前，应该先启动Ignite的实例，通常这是在`Global.asax`的`Application_Start`方法中实现的。

对于和Web环境尤其是和`IGNITE_HOME`有关的内容，请参见[ASP.NET部署](/doc/2.8.0/net/#_14-4-asp-net部署)，
## 2.ASP.NET会话状态缓存
会话状态的值和信息默认存储在ASP.NET进程的内存中，而会话状态缓存旨在将用户会话数据存储在不同的源中。

Ignite.NET实现了一个会话状态存储，其会将会话数据存储在Ignite缓存中，该缓存将会话状态分布在多个服务器上，以实现更高的可用性和容错能力。

::: warning 开发调试
在开发和调试过程中，IIS将在构建和运行Web应用时动态检测代码更新，不过不会重启嵌入式Ignite实例，这可能导致异常和不确定的行为，因此使用Ignite会话状态缓存时，**要确认手动重启IIS**。
:::

### 2.1.安装
**二进制包**：添加对`Apache.Ignite.AspNet.dll`的引用；
**NuGet**：`Install-Package Apache.Ignite.AspNet`。

### 2.2.配置
要启用基于Ignite的会话状态缓存，需要像下面这样修改`web.config`：
```xml
<system.web>
  ...
  <sessionState mode="Custom" customProvider="IgniteSessionStateProvider">
    <providers>
      <add name="IgniteSessionStateProvider"
           type="Apache.Ignite.AspNet.IgniteSessionStateStoreProvider, Apache.Ignite.AspNet"
           igniteConfigurationSectionName="igniteConfiguration"
           applicationId="myApp"
           gridName="myGrid"
           cacheName="aspNetSessionCache" />
    </providers>
  </sessionState>
  ...
</<system.web>
```
`name`和`type`属性是必须的，其他都是可选的。

|属性|描述|
|---|---|
|`igniteConfigurationSectionName`|`configSections`中定义的`web.config`段名，具体请参见[配置](/doc/2.8.0/net/#_5-配置)章节的内容，该配置会在未启动Ignite时启动Ignite。|
|`applicationId`|仅当多个Web应用共享同一Ignite会话状态缓存时才应使用。会分配不同的ID字符串，以避免应用之间的会话数据冲突。建议通过`cacheName`属性每个应用都使用单独的缓存。|
|`gridName`|会话状态缓存实现通过该网格名调用`Ignition.TryGetIgnite`来检查Ignite是否已启动。|
|`cacheName`|会话状态缓存名，默认为`ASPNET_SESSION_STATE`。|

关于在ASP.NET应用中启用Ignite的更多信息，请参见[ASP.NET输出缓存](#_1-asp-net输出缓存)。

对于和Web环境尤其是和`IGNITE_HOME`有关的内容，请参见[ASP.NET部署](/doc/2.8.0/net/#_14-4-asp-net部署)，
## 3.Entity Framework二级缓存
Entity Framework像大多数其他ORM一样，可以在多个层级上使用缓存。

 - 一级缓存是`DbContext`在实体级别控制的（实体缓存在对应的`DbSet`中）；
 - 二级缓存位于`DataReader`层级，并保存原始查询数据（不过Entity Framework6中没有现成的二级缓存机制）。

Ignite.NET提供了EF6的二级缓存解决方案。该方案将数据存储在分布式Ignite缓存中，尤其适用于多个应用服务器通过Entity Framework访问单个SQL数据库的场景，缓存的数据在集群的所有主机之间共享。

### 3.1.安装
**二进制包**：添加对`Apache.Ignite.EntityFramework.dll`的引用；
**NuGet**：`Install-Package Apache.Ignite.EntityFramework`。

### 3.2.配置
Ignite.NET提供了一个支持二级缓存的自定义`DbConfiguration`实现`Apache.Ignite.EntityFramework.IgniteDbConfiguration`。将`DbConfiguration`应用于EntityFramework`DbContext`的方法有很多，具体请参见以下MSDN文档：[msdn.microsoft.com/zh-cn/library/jj680699](https://msdn.microsoft.com/en-us/library/jj680699)。

不过最简单方法是使用`DbConfigurationType`属性：
```csharp
[DbConfigurationType(typeof(IgniteDbConfiguration))]
class MyContext : DbContext
{
  public virtual DbSet<Foo> Foos { get; set; }
  public virtual DbSet<Bar> Bars { get; set; }
}
```
要自定义缓存行为，可以创建一个继承`IgniteDbConfiguration`的类并调用其某个基类构造函数，下面是一个示例：
```csharp
private class MyDbConfiguration : IgniteDbConfiguration
{
  public MyDbConfiguration()
    : base(
      // IIgnite instance to use
      Ignition.Start(),
      // Metadata cache configuration (small cache, does not tolerate data loss)
      // Should be replicated or partitioned with backups
      new CacheConfiguration("metaCache")
      {
        CacheMode = CacheMode.Replicated
      },
      // Data cache configuration (large cache, holds actual query results,
      // tolerates data loss). Can have no backups.
      new CacheConfiguration("dataCache")
      {
        CacheMode = CacheMode.Partitioned,
        Backups = 0
      },
      // Custom caching policy.
      new MyCachingPolicy())
    {
      // No-op.
    }
}

// Apply custom configuration to the DbContext
[DbConfigurationType(typeof(MyDbConfiguration))]
class MyContext : DbContext
{
  ...
}
```
**缓存策略**

缓存策略控制缓存模式、过期时间以及应缓存的实体集。该策略默认为空，所有实体集都缓存为`ReadWrite`模式并且没有过期时间。可以通过实现`IDbCachingPolicy`接口或继承`DbCachingPolicy`类来配置缓存策略，下面是一个简单的示例：
```csharp
public class DbCachingPolicy : IDbCachingPolicy
{
  /// <summary>
  /// Determines whether the specified query can be cached.
  /// </summary>
  public virtual bool CanBeCached(DbQueryInfo queryInfo)
  {
    // This method is called before database call.
    // Cache only Persons.
    return queryInfo.AffectedEntitySets.All(x => x.Name == "Person");
  }

  /// <summary>
  /// Determines whether specified number of rows should be cached.
  /// </summary>
  public virtual bool CanBeCached(DbQueryInfo queryInfo, int rowCount)
  {
    // This method is called after database call.
    // Cache only queries that return less than 1000 rows.
    return rowCount < 1000;
  }

  /// <summary>
  /// Gets the absolute expiration timeout for a given query.
  /// </summary>
  public virtual TimeSpan GetExpirationTimeout(DbQueryInfo queryInfo)
  {
    // Cache for 5 minutes.
    return TimeSpan.FromMinutes(5);
  }

  /// <summary>
  /// Gets the caching strategy for a given query.
  /// </summary>
  public virtual DbCachingMode GetCachingMode(DbQueryInfo queryInfo)
  {
    // Cache with invalidation.
    return DbCachingMode.ReadWrite;
  }
}
```
**缓存模式**

|DbCachingMode|含义|
|---|---|
|`ReadOnly`|只读模式。永不失效，该模式中数据库更新将被忽略。查询结果被缓存后会一直保留在缓存中直到过期（不指定则永不过期）。该模式适用于预计不会更改的数据（例如国家/地区列表和其他字典数据）。|
|`ReadWrite`|读写模式。当底层实体集更改时，缓存的数据将失效。这是`常规`的缓存模式，始终提供正确的查询结果。注意只有由配置了Ignite缓存的`DbContext`执行所有数据库更新，该模式才能正常工作，而其他的数据库更新则被无视。|

**app.config和web.config**

通过提供`IgniteDbConfiguration`（或其子类）的程序集限定类型名，可以在配置文件中启用Ignite缓存：

app.config：
```xml
<entityFramework codeConfigurationType="Apache.Ignite.EntityFramework.IgniteDbConfiguration, Apache.Ignite.EntityFramework">
    ...Your EF config...
</entityFramework>
```
**高级配置**

如果无法继承`IgniteDbConfiguration`（已经继承了其他类），还可以在构造函数中调用`IgniteDbConfiguration.InitializeIgniteCaching`静态方法，然后将`this`作为第一个参数：
```csharp
private class MyDbConfiguration : OtherDbConfiguration
{
  public MyDbConfiguration() : base(...)
  {
    IgniteDbConfiguration.InitializeIgniteCaching(this, Ignition.GetIgnite(), null, null, null);
  }
}
```
## 4.插件
Ignite.NET的插件系统使得第三方可以扩展Ignite.NET的核心功能。

解释Ignite插件的工作方式的最好方法是查看插件的生命周期。

### 4.1.IgniteConfiguration.PluginConfigurations
作为一个Ignite插件，首先需要在`IgniteConfiguration.PluginConfigurations`属性上注册`IPluginConfiguration`接口的实现，从用户的角度来看，这是一个手动过程，即必须明确引用和配置插件的程序集。

`IPluginConfiguration`接口有两个与Ignite.NET的Java部分交互的方法，下面会有介绍。除此之外`IPluginConfiguration`实现还应包含所有其他和插件有关的配置属性。

`IPluginConfiguration`实现的另一部分是必要的`PluginProviderType`属性，其会将插件配置与插件的实现进行链接，例如：
```csharp
    [PluginProviderType(typeof(MyPluginProvider))]
    public class MyPluginConfiguration : IPluginConfiguration
    {
        public string MyProperty { get; set; }  // Plugin-specific property

        public int? PluginConfigurationClosureFactoryId
        {
            get { return null; }  // No Java part
        }

        public void WriteBinary(IBinaryRawWriter writer)
        {
            // No-op.
        }
    }

```
总结：

 - 开发者将`IPluginConfiguration`实现的实例添加到`IgniteConfiguration`中；
 - 使用准备好的配置启动Ignite节点；
 - 在Ignite节点初始化完成之前，插件引擎将检查`IPluginConfiguration`实现的`PluginProviderType`属性并实例化指定的类；

### 4.2.IPluginProvider
`IPluginProvider`实现是新添加的插件的主力，它通过处理`OnIgniteStart`和`OnIgniteStop`方法的调用来处理Ignite节点的生命周期，另外它还通过`GetPlugin<T>()`方法为开发者提供了一个可选的API。

Ignite.NET引擎在`IPluginProvider`实现上要调用的第一个方法是`Start(IPluginContext<TestIgnitePluginConfiguration> context)`，`IPluginContext`中可以访问初始的插件配置以及与Ignite进行交互的所有方法。

当停止Ignite时，会依次调用`Stop`和`OnIgniteStop`方法，以便插件实现可以完成所有的清理和关闭相关的任务。

### 4.3.IIgnite.GetPlugin
通过`IIgnite.GetPlugin(string name)`方法可以访问插件暴露给用户的API，Ignite引擎会使用传递的名字查找`IPluginProvider`。

### 4.4.与Java交互
Ignite.NET插件可以通过`PlatformTarget`＆`IPlatformTarget`接口对与Ignite Java插件进行交互。

**Java端：**

 - 实现`PlatformTarget`接口，它是与.NET的通信端点：

```java
class MyPluginTarget implements PlatformTarget {
  @Override public long processInLongOutLong(int type, long val) throws IgniteCheckedException {
    if (type == 1)
    	return val + 1;
    else
      return val - 1;
  }
  ...  // Other methods here.
}
```
 - 实现`PlatformPluginExtension`接口：

```java
public class MyPluginExtension implements PlatformPluginExtension {
  @Override public int id() {
    return 42;  // Unique id to be used from .NET side.
  }

  @Override public PlatformTarget createTarget() {
    return new MyPluginTarget();  // Return target from previous step.
  }
}
```
- 实现`PluginProvider.initExtensions`方法并注册`PlatformPluginExtension`类：

```java
@Override public void initExtensions(PluginContext ctx, ExtensionRegistry registry) {
  registry.registerExtension(PlatformPluginExtension.class, new MyPluginExtension());
}
```
**.NET端：**

 - 通过对应的ID调用`IPluginContext.GetExtension`，其会调用Java端的`createTarget`方法：

```csharp
IPlatformTarget extension = pluginContext.GetExtension(42);

long result = extension.InLongOutLong(1, 2);  // processInLongOutLong is called in Java
```
其他的`IPlatformTarget`方法会以高效的方式在Java和.NET之间交换任意类型的数据。

**Java端的回调：**

上面介绍了.NET -> Java的调用机制，当然也可以进行Java -> .NET的调用：

 - 在.NET端通过`RegisterCallback`方法使用一些ID注册回调处理器；
 - 在Java端使用该ID调用`PlatformCallbackGateway.pluginCallback`。

## 5.日志
Ignite默认使用底层的Java Log4j日志记录系统，.NET和Java端的日志消息都会记录在那里，开发者也可以通过`IIgnite.Logger`记录日志。
```csharp
var ignite = Ignition.Start();
ignite.Logger.Info("Hello World!");
```
`LoggerExtensions`类提供了访问`ILogger.Log`方法的各种便捷方式。
### 5.1.自定义Logger
通过`IgniteConfiguration.Logger`和`ILogger`接口，开发者可以自定义日志记录器实现，.NET和Java端的日志消息都会转发到这里。

<Tabs>
<Tab title="C#">

```csharp
var cfg = new IgniteConfiguration
{
  Logger = new MemoryLogger()
}

var ignite = Ignition.Start();

class MemoryLogger : ILogger
{
  // Logger can be called from multiple threads, use concurrent collection
  private readonly ConcurrentBag<string> _messages = new ConcurrentBag<string>();

  public void Log(LogLevel level, string message, object[] args,
                  IFormatProvider formatProvider, string category,
                  string nativeErrorInfo, Exception ex)
  {
    _messages.Add(message);
  }

  public bool IsEnabled(LogLevel level)
  {
    // Accept any level.
    return true;
  }
}
```
</Tab>

<Tab title="app.config">

```xml
<igniteConfiguration>
  <logger type="MyNamespace.MemoryLogger, MyAssembly" />
</igniteConfiguration>
```
</Tab>

</Tabs>

### 5.2.NLog和log4net日志
Ignite.NET为[NLog](http://nlog-project.org/)和[log4net](https://logging.apache.org/log4net/)提供了`ILogger`实现，他们位于二进制包（`Apache.Ignite.NLog.dll`和`Apache.Ignite.Log4Net.dll`）中并且可以通过NuGet安装：

 - `Install-Package Apache.Ignite.NLog`；
 - `Install-Package Apache.Ignite.Log4Net`。

NLog和Log4Net使用静态预定义的配置，因此在Ignite中无需配置`IgniteConfiguration.Logger`：

<Tabs>
<Tab title="C#">

```csharp
var cfg = new IgniteConfiguration
{
  Logger = new IgniteNLogLogger()  // or IgniteLog4NetLogger
}

var ignite = Ignition.Start();
```
</Tab>

<Tab title="app.config">

```xml
<igniteConfiguration>
  <logger type="Apache.Ignite.NLog.IgniteNLogLogger, Apache.Ignite.NLog" />
</igniteConfiguration>
```
</Tab>

</Tabs>

使用NLog可以配置基于文件的简单日志，如下所示：
```csharp
var nlogConfig = new LoggingConfiguration();

var fileTarget = new FileTarget
{
  FileName = "ignite_nlog.log"
};
nlogConfig.AddTarget("logfile", fileTarget);

nlogConfig.LoggingRules.Add(new LoggingRule("*", LogLevel.Trace, fileTarget));
LogManager.Configuration = nlogConfig;

var igniteConfig = new IgniteConfiguration
{
  Logger = new IgniteNLogLogger()
};
Ignition.Start(igniteConfig);
```
<RightPane/>
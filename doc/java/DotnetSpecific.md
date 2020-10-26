# Ignite.NET
## 1.配置选项
### 1.1.概述
Ignite.NET节点可以通过各种方式进行配置，然后通过`Ignition.Start*`方法用指定的配置就可以启动。
### 1.2.通过编程方式配置
在C#应用中，使用`Ignition.Start(IgniteConfiguration)`方法可以配置一个Ignite.NET节点。

```csharp
Ignition.Start(new IgniteConfiguration
{
    DiscoverySpi = new TcpDiscoverySpi
    {
        IpFinder = new TcpDiscoveryStaticIpFinder
        {
            Endpoints = new[] {"127.0.0.1:47500..47509"}
        },
        SocketTimeout = TimeSpan.FromSeconds(0.3)
    },
    IncludedEventTypes = EventType.CacheAll,
    JvmOptions = new[] { "-Xms1024m", "-Xmx1024m" }
});
```
### 1.3.通过应用或Web配置文件方式配置
`Ignition.StartFromApplicationConfiguration`方法可以从`app.config`或`web.config`文件的`Apache.Ignite.Core.IgniteConfigurationSection`中读取配置。

`IgniteConfigurationSection.xsd`模式文件位于二进制包和`Apache.Ignite.Schema`NuGet包的`Apache.Ignite.Core.dll`同级目录处，在Visual Studio中通过`None`构建操作将其包含在项目中，这样当编辑配置文件的`IgniteConfigurationSection`段时，可以开启智能提示。

<Tabs>
<Tab title="app.config配置">

```xml
<configuration>
    <configSections>
        <section name="igniteConfiguration" type="Apache.Ignite.Core.IgniteConfigurationSection, Apache.Ignite.Core" />
    </configSections>

    <runtime>
        <gcServer enabled="true"/>
    </runtime>

    <igniteConfiguration xmlns="http://ignite.apache.org/schema/dotnet/IgniteConfigurationSection" gridName="myGrid1">
        <discoverySpi type="TcpDiscoverySpi">
            <ipFinder type="TcpDiscoveryStaticIpFinder">
                <endpoints>
                    <string>127.0.0.1:47500..47509</string>
                </endpoints>
            </ipFinder>
        </discoverySpi>

        <cacheConfiguration>
            <cacheConfiguration cacheMode='Replicated' readThrough='true' writeThrough='true' />
            <cacheConfiguration name='secondCache' />
        </cacheConfiguration>

        <includedEventTypes>
            <int>42</int>
            <int>TaskFailed</int>
            <int>JobFinished</int>
        </includedEventTypes>

        <userAttributes>
            <pair key='myNode' value='true' />
        </userAttributes>

        <JvmOptions>
          <string>-Xms1024m</string>
          <string>-Xmx1024m</string>
        </JvmOptions>
    </igniteConfiguration>
</configuration>
```
</Tab>

<Tab title="C#中的用法">

```csharp
var ignite = Ignition.StartFromApplicationConfiguration("igniteConfiguration");
```
</Tab>
</Tabs>

::: tip 提示
要将`IgniteConfigurationSection.xsd`模式文件添加到Visual Studio项目中，可以转到`Projects`菜单，单击`Add Existing Item...`菜单项，之后找到Apache Ignite包中的`IgniteConfigurationSection.xsd`并且选中。

或者，安装NuGet软件包：`Install-Package Apache.Ignite.Schema`，这将自动将xsd文件添加到项目中。

为了改善编辑体验，需要在`Tools ⇒ Options ⇒ Text Editor ⇒ XML`中启用了`Statement Completion`选项。
:::
#### 1.3.1.Ignite配置段语法
Ignite的配置段直接映射到`IgniteConfiguration`类。

 - 简单属性（字符串、基础类型、枚举）映射到XML属性（属性名为驼峰式的C#属性名）；
 - 复杂属性映射到嵌套的XML元素（元素名为驼峰式的C#属性名）；
 - 当复杂属性是接口或抽象类时，`type`属性将用于指定类型，需要使用程序集限定名。对于内置类型（例如上面代码示例中的`TcpDiscoverySpi`），可以省略程序集名和命名空间；
 - 如有疑问，可以查询`IgniteConfigurationSection.xsd`。

### 1.4.通过Spring XML方式配置
Spring的XML文件可以使用原生的基于Java的Ignite配置，Spring的配置文件可以通过`Ignition.Start(string)`方法以及`IgniteConfiguration.SpringConfigUrl`属性传入。这样在Ignite.NET不直接支持某些Java属性时，此功能会有用。

使用`IgniteConfiguration.SpringConfigUrl`属性时，Spring的配置会首先加载，在其之上才会应用其他的`IgniteConfiguration`属性。

<Tabs>
<Tab title="Spring XML配置">

```xml
<?xml version="1.0" encoding="UTF-8"?>

<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:util="http://www.springframework.org/schema/util"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
                           http://www.springframework.org/schema/beans/spring-beans.xsd
                           http://www.springframework.org/schema/util
                           http://www.springframework.org/schema/util/spring-util.xsd">
    <bean id="grid.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
        <property name="localHost" value="127.0.0.1"/>
        <property name="gridName" value="grid1"/>
        <property name="userAttributes">
            <map>
                <entry key="my_attr" value="value1"/>
            </map>
        </property>

        <property name="cacheConfiguration">
            <list>
                <bean class="org.apache.ignite.configuration.CacheConfiguration">
                    <property name="name" value="cache1"/>
                    <property name="startSize" value="10"/>
                </bean>
            </list>
        </property>

        <property name="discoverySpi">
            <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
                <property name="ipFinder">
                    <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.vm.TcpDiscoveryVmIpFinder">
                        <property name="addresses">
                            <list>
                                <value>127.0.0.1:47500..47509</value>
                            </list>
                        </property>
                    </bean>
                </property>
                <property name="socketTimeout" value="300" />
            </bean>
        </property>
    </bean>
</beans>
```
</Tab>

<Tab title="C#中的用法">

```csharp
var ignite = Ignition.Start("spring-config.xml");
```
</Tab>
</Tabs>

## 2.部署选项
### 2.1.概述
Ignite.NET由.NET程序集和Java jar文件组成。.NET程序集由具体的项目引用，并在自动化构建过程中复制到输出文件夹。Jar文件需要手工复制，Ignite.NET通过`IgniteHome`或`JvmClasspath`配置发现它们。

本章节会介绍Ignite.NET节点的几种最常用的部署选项。
### 2.2.完整二进制包部署

 - 复制从[https://ignite.apache.org](https://ignite.apache.org)下载的整个发行版内容以及自己的应用；
 - 配置`IGNITE_HOME`环境变量或`IgniteConfiguration.IgniteHome`以指向该文件夹。

### 2.3.NuGet部署
在Ignite.NET NuGet软件包安装过程中，将自动更新构建后事件，以将jar文件复制到输出目录中的Libs文件夹中（具体参见[入门](/doc/java/QuickStartGuide.md#_2-c-net)），分发二进制文件时，要确保包括该`Libs`文件夹。

确认未全局配置`IGNITE_HOME`，除了ASP.NET环境（参见下文）外，通常不需要使用NuGet配置`IGNITE_HOME`。

构建后事件：
```
if not exist "$(TargetDir)Libs" md "$(TargetDir)Libs"
xcopy /s /y "$(SolutionDir)packages\Apache.Ignite.1.6.0\Libs\*.*" "$(TargetDir)Libs"
```
### 2.4.自定义部署
Jar文件位于二进制包的`libs`文件夹和NuGet包中。

Ignite.NET必需的最小Jar集合是：

 - `ignite-core-{VER}.jar`；
 - `cache-api-1.0.0.jar`；
 - `ignite-indexing`文件夹（如果使用缓存查询）；
 - `ignite-spring`文件夹（如果使用基于spring的配置）。

**将jar部署到默认位置：**

 - 将jar文件复制到`Apache.Ignite.Core.dll`旁边的`Libs`文件夹中；
 - 不要配置`IgniteConfiguration.JvmClasspath`、`IgniteConfiguration.IgniteHome`属性和`IGNITE_HOME`环境变量。

**将jar文件部署到任意位置：**

 - 将jar文件复制到某处；
 - 将`IgniteConfiguration.JvmClasspath`属性配置为指向每个jar文件路径的字符串，多个用分号分割；
 - 不要设置`IGNITE_HOME`环境变量和`IgniteConfiguration.IgniteHome`属性。

IgniteConfiguration.JvmClasspath示例：
```
c:\ignite-jars\ignite-core-1.5.0.final.jar;c:\ignite-jars\cache-api-1.0.0.jar
```
### 2.5.ASP.NET部署
在Web环境（IIS和IIS Express）中使用Ignite时，`JvmClasspath`或`IgniteHome`必须显式配置，因为dll文件复制到了临时文件夹，而Ignite无法自动定位这些jar文件。

在ASP.NET环境中可以像下面这样配置`IgniteHome`：
```csharp
Ignition.Start(new IgniteConfiguration
{
    IgniteHome = HttpContext.Current.Server.MapPath(@"~\bin\")
});
```
或者，可以全局配置`IGNITE_HOME`，将下面这行代码添加到`Global.asax.cs`中`Application_Start`方法的顶部：
```csharp
Environment.SetEnvironmentVariable("IGNITE_HOME", HttpContext.Current.Server.MapPath(@"~\bin\"));
```
或者，可以使用以下方法填充`JvmClasspath`：
```csharp
static string GetDefaultWebClasspath()
{
    var dir = HttpContext.Current.Server.MapPath(@"~\bin\libs");

    return string.Join(";", Directory.GetFiles(dir, "*.jar"));
}
```
### 2.6.IIS程序池生命周期、AppDomains和Ignite.NET
IIS有一个已知的问题：当重启Web应用时（由于代码更改或手动重启），程序池进程仍然在线，而AppDomain被回收。

卸载AppDomain后，Ignite.NET会自动停止。不过在旧域卸载过程中，可能会启动新域，因此，旧域中的节点可能与新域中的节点发生`IgniteConfiguration.IgniteInstanceName`冲突。

要解决此问题，需要确保为`IgniteInstanceName`分配唯一值或将`IgniteConfiguration.AutoGenerateIgniteInstanceName`属性设置为`true`：

<Tabs>
<Tab title="C#">

```csharp
var cfg = new IgniteConfiguration { AutoGenerateIgniteInstanceName = true };
```
</Tab>

<Tab title="web.config">

```xml
<igniteConfiguration autoGenerateIgniteInstanceName="true">
  ...
</igniteConfiguration>
```
</Tab>
</Tabs>

## 3.独立节点
### 3.1.概述
Ignite.NET节点可以在.NET应用的代码中通过使用`Ignition.Start()`启动，也可以使用可执行的`Apache.Ignite.exe`（位于`{apache_ignite_release}\platforms\dotnet\bin`文件夹下）作为单独的进程启动。像通常一样，在内部`Apache.Ignite.exe`引用`Apache.Ignite.Core.dll`和使用`Ignition.Start()`，并且可以使用下面列出的命令行参数进行配置，方法是将它们作为命令行选项传递或直接在`Apache.Ignite.exe.config`文件中进行设置。

通常以独立模式启动服务端节点，Ignite集群是一组互连在一起的服务端节点，目的是为应用提供RAM和CPU等共享资源。
### 3.2.通过命令行配置独立节点
下面是基本的Ignite参数，当使用`Apache.Ignite.exe`程序启动节点时，这些参数可以作为命令行参数传入：

|命令行参数|含义|
|---|---|
|`-IgniteHome`|Ignite安装目录路径（如果未提供会使用`IGNITE_HOME`环境变量）|
|`-ConfigFileName`|`app.config`文件路径（如果未提供会使用`Apache.Ignite.exe.config`）|
|`-ConfigFileName`|配置文件中`IgniteConfigurationSection`的名字|
|`-SpringConfigUrl`|Spring配置文件路径|
|`-JvmDllPath`|JVM库`jvm.dll`的路径（如果未提供会使用`JAVA_HOME`环境变量）|
|`-JvmClasspath`|传递给JVM的类路径（在这里注册其它的jar文件）|
|`-SuppressWarnings`|是否输出警告信息|
|`-J<javaOption>`|JVM参数|
|`-Assembly`|要加载的其它.NET程序集|
|`-JvmInitialMemoryMB`|初始Java堆大小（MB），对应于`-Xms`Java参数|
|`-JvmMaxMemoryMB`|最大Java堆大小（MB），对应于`-Xmx`Java参数|
|`/install`|根据指定的参数将Ignite安装为Windows服务|
|`/uninstall`|卸载Ignite Windows服务|

示例：
```batch
Apache.Ignite.exe -ConfigFileName=c:\ignite\my-config.xml -ConfigSectionName=igniteConfiguration -Assembly=c:\ignite\my-code.dll -J-Xms1024m -J-Xmx2048m
```
### 3.3.通过XML文件配置独立节点
通过`app.config`XML文件或/和Spring配置文件，也可以配置独立节点。上面列出的每个命令行参数，也可以用于`Apache.Ignite.exe.config`的`appSettings`段。
```xml
<configuration>
  <configSections>
    <section name="igniteConfiguration" type="Apache.Ignite.Core.IgniteConfigurationSection, Apache.Ignite.Core" />
  </configSections>

  <igniteConfiguration springConfigUrl="c:\ignite\spring.xml">
    <cacheConfiguration name="myCache" cacheMode="Replicated" />
  </igniteConfiguration>

  <appSettings>
    <add key="Ignite.Assembly.1" value="my-assembly.dll"/>
    <add key="Ignite.Assembly.2" value="my-assembly2.dll"/>
    <add key="Ignite.ConfigSectionName" value="igniteConfiguration" />
  </appSettings>
</configuration>
```
这个示例定义了`igniteConfiguration`段，并通过`Ignite.ConfigSectionName`配置用其启动Ignite，它还引用了一个Spring配置文件，两者最终会组合在一起。
### 3.4.加载用户程序集
某些Ignite的API涉及了远程代码执行，因此需要将代码和程序集一起加载到`Apache.Ignite.exe`，这可以通过`-Assembly`命令行参数或者`Ignite.Assembly`应用配置来实现。

以下功能要求在所有节点上加载相应的程序集：

 - `ICompute`（支持自动加载，具体可以参见[远程程序集加载](/doc/2.8.0/net/Clustering.md#_7_远程程序集加载)）。
 - 带过滤器的扫描查询；
 - 带过滤器的持续查询；
 - `远程程序集加载`方法；
 - 带过滤器的`ICache.LoadCache`；
 - `IServices`；
 - `IMessaging.RemoteListen`；
 - `IEvents.RemoteQuery`。

::: warning 缺失用户程序集
如果一个用户程序集无法加载，会抛出`Could not load file or assembly 'MyAssembly' or one of its dependencies`异常。

注意任何程序集的依赖也是必须要加入该列表的。
:::
### 3.5.Ignite.NET作为Windows服务
`Apache.Ignite.exe`可以安装为Windows的服务，因此可以通过`/install`命令行参数自动启动。每次服务启动时，所有其它命令行参数将被保留和使用。使用`/uninstall`可以卸载服务。
```batch
Apache.Ignite.exe /install -J-Xms513m -J-Xmx555m -ConfigSectionName=igniteConfiguration
```
## 4.日志
### 4.1.概述
Ignite默认使用底层的Java Log4j日志记录系统，.NET和Java端的日志消息都会记录在那里，开发者也可以通过`IIgnite.Logger`记录日志。
```csharp
var ignite = Ignition.Start();
ignite.Logger.Info("Hello World!");
```
`LoggerExtensions`类提供了访问`ILogger.Log`方法的各种便捷方式。
### 4.2.自定义Logger
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

### 4.3.NLog和log4net日志
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
## 5.LINQ实现
### 5.1.概述
Ignite.NET包含了一个与Ignite SQL API集成的LINQ实现。可以避免直接处理SQL语法，而是在C#中使用LINQ编写查询。Ignite LINQ实现支持ANSI-99 SQL的所有功能，包括分布式关联、分组、聚合、排序等。
### 5.2.安装

 - 如果使用的是Ignite二进制包：需要添加`Apache.Ignite.Linq.dll`引用；
 - 如果使用的是NuGet：`Install-Package Apache.Ignite.Linq`。

### 5.3.配置
SQL索引的配置方式与常规SQL查询相同，具体请参见[定义索引](/doc/java/WorkingwithSQL.md#_3-定义索引)章节的介绍。
### 5.4.用法
`Apache.Ignite.Linq.CacheLinqExtensions`类是LINQ实现的入口。通过调用`AsCacheQueryable`方法可以在Ignite缓存上获取可查询实例，并在其上使用LINQ：
```csharp
ICache<EmployeeKey, Employee> employeeCache = ignite.GetCache<EmployeeKey, Employee>(CacheName);

IQueryable<ICacheEntry<EmployeeKey, Employee>> queryable = cache.AsCacheQueryable();

Employee[] interns = queryable.Where(emp => emp.Value.IsIntern).ToArray();
```
::: warning 警告
可以直接在缓存实例上使用LINQ，而无需调用`AsCacheQueryable()`。但是，这将导致LINQ到对象的查询在本地获取并处理整个缓存数据集，这是非常低效的。
:::
### 5.5.内省
Ignite LINQ实现底层使用的是`ICache.QueryFields`。在物化语句（`ToList`、`ToArray`等）之前，都可以通过将`IQueryable`转换为`ICacheQueryable`来检查生成的`SqlFieldsQuery`：
```csharp
// Create query
var query = ignite.GetCache<EmployeeKey, Employee>(CacheName).AsCacheQueryable().Where(emp => emp.Value.IsIntern);

// Cast to ICacheQueryable
var cacheQueryable = (ICacheQueryable) query;

// Get resulting fields query
SqlFieldsQuery fieldsQuery = cacheQueryable.GetFieldsQuery();

// Examine generated SQL
Console.WriteLine(fieldsQuery.Sql);

// Output: select _T0._key, _T0._val from "persons".Person as _T0 where _T0.IsIntern
```
### 5.6.投影
在`ICacheEntry`对象上的简单`Where`查询操作，可以分别查询键、值或任何键和值的字段，可以使用匿名类型查询多个字段。
```csharp
var query = ignite.GetCache<EmployeeKey, Employee>(CacheName).AsCacheQueryable().Where(emp => emp.Value.IsIntern);

IQueryable<EmployeeKey> keys = query.Select(emp => emp.Key);

IQueryable<Employee> values = query.Select(emp => emp.Value);

IQueryable<string> names = values.Select(emp => emp.Name);

var custom = query.Select(emp => new {Id = emp.Key, Name = emp.Value.Name, Age = emp.Value.Age});
```
### 5.7.编译查询
LINQ实现在表达式解析和SQL生成上有一些开销，因此对于经常使用的查询需要消除这个开销。

`Apache.Ignite.Linq.CompiledQuery`类支持查询的编译，调用其`Compile`方法后可以创建一个新的表示已编译查询的委托，所有的查询参数都在委托参数中。

```csharp
var queryable = ignite.GetCache<EmployeeKey, Employee>(CacheName).AsCacheQueryable();

// Regular query
var persons = queryable.Where(emp => emp.Value.Age > 21);
var result = persons.ToArray();

// Corresponding compiled query
var compiledQuery = CompiledQuery.Compile((int age) => queryable.Where(emp => emp.Value.Age > age));
IQueryCursor<ICacheEntry<EmployeeKey, Employee>> cursor = compiledQuery(21);
result = cursor.ToArray();
```
关于LINQ实现在性能方面的更多信息，请参见[LINQ和SQL](https://ptupitsyn.github.io/LINQ-vs-SQL-in-Ignite/)这篇博客文章。
### 5.8.关联
LINQ实现支持跨越多个缓存/表和节点的关联。

```csharp
var persons = ignite.GetCache<int, Person>("personCache").AsCacheQueryable();
var orgs = ignite.GetCache<int, Organization>("orgCache").AsCacheQueryable();

// SQL join on Person and Organization to find persons working for Apache
var qry = from person in persons from org in orgs
          where person.Value.OrgId == org.Value.Id
          && org.Value.Name == "Apache"
          select person

foreach (var cacheEntry in qry)
    Console.WriteLine(cacheEntry.Value);

// Same query with method syntax
qry = persons.Join(orgs, person => person.Value.OrgId, org => org.Value.Id,
(person, org) => new {person, org}).Where(p => p.org.Name == "Apache").Select(p => p.person);
```
### 5.9.包含
支持`ICollection.Contains`，当需要通过一组ID检索数据时，这很有用，例如：
```csharp
var persons = ignite.GetCache<int, Person>("personCache").AsCacheQueryable();
var ids = new int[] {1, 20, 56};

var personsByIds = persons.Where(p => ids.Contains(p.Value.Id));
```
该查询会被转换为`…​ where Id IN (?, ?, ?)`命令。但是要注意，由于变量数目可变，因此无法使用编译查询。更好的替代方法是在`ids`集合上使用关联：
```csharp
var persons = ignite.GetCache<int, Person>("personCache").AsCacheQueryable();
var ids = new int[] {1, 20, 56};

var personsByIds = persons.Join(ids,
                                person => person.Value.Id,
                                id => id,
                                (person, id) => person);
```
该LINQ查询会被转换为临时表关联：`select _T0._KEY, _T0._VAL from "person".Person as _T0 inner join table (F0 int = ?) _T1 on (_T1.F0 = _T0.ID)`，并且只有一个数组参数，因此可以正确地缓存计划，还可以使用编译查询。
### 5.10.支持的SQL函数
以下是Ignite LINQ实现支持的.NET函数及其等价的SQL列表：

|.NET函数|SQL函数|
|---|---|
|`String.Length`|`LENGTH`|
|`String.ToLower`|`LOWER`|
|`String.ToUpper`|`UPPER`|
|`String.StartsWith("foo")`|`LIKE 'foo%'`|
|`String.EndsWith("foo")`|`LIKE '%foo'`|
|`String.Contains("foo")`|`LIKE '%foo%'`|
|`String.IndexOf("abc")`|`INSTR(MyField, 'abc') - 1`|
|`String.IndexOf("abc", 3)`|`INSTR(MyField, 'abc', 3) - 1`|
|`String.Substring("abc", 4)`|`SUBSTRING(MyField, 4 + 1)`|
|`String.Substring("abc", 4, 7)`|`SUBSTRING(MyField, 4 + 1, 7)`|
|`String.Trim()`|`TRIM`|
|`String.TrimStart()`|`LTRIM`|
|`String.TrimEnd()`|`RTRIM`|
|`String.Trim('x')`|`TRIM(MyField, 'x')`|
|`String.TrimStart('x')`|`LTRIM(MyField, 'x')`|
|`String.TrimEnd('x')`|`RTRIM(MyField, 'x')`|
|`String.Replace`|`REPLACE`|
|`String.PadLeft`|`LPAD`|
|`String.PadRight`|`RPAD`|
|`Regex.Replace`|`REGEXP_REPLACE`|
|`Regex.IsMatch`|`REGEXP_LIKE`|
|`Math.Abs`|`ABS`|
|`Math.Acos`|`ACOS`|
|`Math.Asin`|`ASIN`|
|`Math.Atan`|`ATAN`|
|`Math.Atan2`|`ATAN2`|
|`Math.Ceiling`|`CEILING`|
|`Math.Cos`|`COS`|
|`Math.Cosh`|`COSH`|
|`Math.Exp`|`EXP`|
|`Math.Floor`|`FLOOR`|
|`Math.Log`|`LOG`|
|`Math.Log10`|`LOG10`|
|`Math.Pow`|`POWER`|
|`Math.Round`|`ROUND`|
|`Math.Sign`|`SIGN`|
|`Math.Sin`|`SIN`|
|`Math.Sinh`|`SINH`|
|`Math.Sqrt`|`SQRT`|
|`Math.Tan`|`TAN`|
|`Math.Tanh`|`TANH`|
|`Math.Truncate`|`TRUNCATE`|
|`DateTime.Year`|`YEAR`|
|`DateTime.Month`|`MONTH`|
|`DateTime.Day`|`DAY_OF_MONTH`|
|`DateTime.DayOfYear`|`DAY_OF_YEAR`|
|`DateTime.DayOfWeek`|`DAY_OF_WEEK - 1`|
|`DateTime.Hour`|`HOUR`|
|`DateTime.Minute`|`MINUTE`|
|`DateTime.Second`|`SECOND`|

## 6.执行Java服务
### 6.1.概述
Ignite.NET可以与.NET服务一样使用Java服务，要从.NET应用调用Java服务，需要了解服务的接口。

### 6.2.示例
下面通过一个示例了解如何使用此功能。
#### 6.2.1.创建Java服务
```java
public class MyJavaService implements Service {
  // Service method to be called from .NET
  public String testToUpper(String x) {
    return x.toUpperCase();
  }

  // Service interface implementation
  @Override public void cancel(ServiceContext context) { // No-op.  }
  @Override public void init(ServiceContext context) throws Exception { // No-op. }
  @Override public void execute(ServiceContext context) throws Exception { // No-op. }
}
```
该Java服务可以部署在任何节点（.NET、C++、仅Java）上，因此对部署没有限制：
```java
ignite.services().deployClusterSingleton("myJavaSvc", new MyJavaService());
```
#### 6.2.2..NET端调用Java服务
创建服务接口的.NET版本：
```csharp
// Interface can have any name
interface IJavaService
{
  // Method must have the same name (case-sensitive) and same signature:
  // argument types and order.
  // Argument names and return type do not matter.
  string testToUpper(string str);
}
```
获取服务代理并调用该方法：
```csharp
var config = new IgniteConfiguration
{
  // Make sure that Java service class is in classpath on all nodes, including .NET
  JvmClasspath = @"c:\my-project\src\Java\target\classes\"
}

var ignite = Ignition.Start(config);

// Make sure to use the same service name as in deployment
var prx = ignite.GetServices().GetServiceProxy<IJavaService>("myJavaSvc");
string result = prx.testToUpper("invoking Java service...");
Console.WriteLine(result);
```
### 6.3.接口方法映射
.NET服务接口动态映射到其对应的Java对象，这是在方法调用时发生的：

 - 不必在.NET接口中指定所有Java服务方法；
 - .NET接口可以包含Java服务中不存在的成员，除非调用这些缺少的方法，否则不会抛出任何异常。

Java方法解析方式如下：

 - Ignite寻找具有指定名称和参数计数的方法。如果只找到一个，Ignite将使用它；
 - 在匹配的方法中，Ignite会寻找参数兼容的方法（通过`Class.isAssignableFrom`）。如果兼容Ignite会调用该方法，如果不兼容则会抛出异常；
 - 方法返回类型将被忽略，因为.NET和Java不允许同一个方法有不同的返回类型。

有关方法参数和结果映射的详细信息，请参见[类型兼容性](#_11-3-类型兼容性)章节的介绍。注意`params/varargs`也是支持的，因为在.NET和Java中，它们是对象数组的语法糖。
## 7..NET平台缓存
::: warning 警告
这是一个试验性API。
:::
Ignite.NET在[CLR](https://docs.microsoft.com/en-us/dotnet/standard/clr)堆中提供了额外的缓存层，平台缓存会保留当前节点上存在的每个缓存条目的反序列化副本，从而以增加内存使用为代价大大提高了缓存读取性能。
::: tip 提示
事务中绕过平台缓存：在事务中`cache.Get`以及下面列出的其他API不会使用平台缓存，事务支持后续会推出。
:::
### 7.1.配置平台缓存
#### 7.1.1.服务端节点
通过设置`CacheConfiguration.PlatformCacheConfiguration`为非空值，可以为所有服务端节点配置平台缓存。服务端节点上的平台缓存将分配给该节点的所有主缓存和备份缓存项存储在.NET内存中。条目是实时更新的，在任何时刻都保证是最新的，甚至在用户代码访问它们之前。
::: warning 警告
平台缓存导致服务端节点上的内存使用量翻倍，每个缓存项存储两次：在堆外内存中序列化，在CLR堆中反序列化。
:::
```csharp
var cacheCfg = new CacheConfiguration("my-cache")
{
    PlatformCacheConfiguration = new PlatformCacheConfiguration()
};

var cache = ignite.CreateCache<int, string>(cacheCfg);
```
#### 7.1.2.客户端节点
客户端节点上的平台缓存需要配置[近缓存](/doc/java/ConfiguringCaches.md#_8-近缓存)，因为客户端节点不会存储数据。客户端节点上的平台缓存与该节点上的近缓存保持相同的条目集，近缓存的退出策略也适用于平台缓存。
```csharp
var nearCacheCfg = new NearCacheConfiguration
{
    // Keep up to 1000 most recently used entries in Near and Platform caches.
    EvictionPolicy = new LruEvictionPolicy
    {
        MaxSize = 1000
    }
};

var cache = ignite.CreateNearCache<int, string>("my-cache",
    nearCacheCfg,
    new PlatformCacheConfiguration());
```
### 7.2.支持的API
下面的`ICache<K, V>`API会使用平台缓存（包括对应的异步版本）：

 - `Get`、`TryGet`、索引（`ICache[k]`）；
 - `GetAll`（首先从平台缓存读取，并在必要时回退到分布式缓存）；
 - `ContainsKey`、`ContainsKeys`；
 - `LocalPeek`、`TryLocalPeek`；
 - `GetLocalEntries`；
 - `GetLocalSize`；
 - 使用`ScanQuery`的`Query`：
   - 使用平台缓存将值传递给`ScanQuery.Filter`；
   - 在`ScanQuery.Local`为`true`以及`ScanQuery.Partition`不为空时直接迭代平台缓存。

### 7.3.直接访问平台缓存数据
无需修改代码即可利用平台缓存。已有的对`ICache.Get`以及上面列出的其他API的调用，都会尽可能从平台缓存读取来改进性能，当平台缓存中不存在该条目时，Ignite会退回到正常路径并从集群中检索数据。

但是，有时可能希望专门访问平台缓存，从而避免Java和网络调用，`Local`API结合`CachePeekMode.Platform`可以做到这一点：
```csharp
var cache = ignite.GetCache<int, string>("my-cache");

// Get value from platform cache.
bool hasKey = cache.TryLocalPeek(1, out var val, CachePeekMode.Platform);

// Get platform cache size (current number of entries on local node).
int size = cache.GetLocalSize(CachePeekMode.Platform);

// Get all values from platform cache.
IEnumerable<ICacheEntry<int, string>> entries = cache.GetLocalEntries(CachePeekMode.Platform);
```
### 7.4.高级配置
#### 7.4.1.二进制模式
如果要在平台缓存中使用[二进制对象](/doc/java/UsingKeyValueApi.md#_2-使用二进制对象)，需要将`PlatformCacheConfiguration.KeepBinary`配置为`true`：
```csharp
var cacheCfg = new CacheConfiguration("people")
{
    PlatformCacheConfiguration = new PlatformCacheConfiguration
    {
        KeepBinary = true
    }
};

var cache = ignite.CreateCache<int, Person>(cacheCfg)
    .WithKeepBinary<int, IBinaryObject>();

IBinaryObject binaryPerson = cache.Get(1);
```
#### 7.4.2.键和值类型
在将Ignite缓存与[值类型](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types)一起使用时，应相应地设置`PlatformCacheConfiguration.KeyTypeName`和`ValueTypeName`以获得最佳性能并减少GC压力：
```csharp
var cacheCfg = new CacheConfiguration("people")
{
    PlatformCacheConfiguration = new PlatformCacheConfiguration
    {
        KeyTypeName = typeof(long).FullName,
        ValueTypeName = typeof(Guid).FullName
    }
};

var cache = ignite.CreateCache<long, Guid>(cacheCfg);
```
Ignite默认使用`ConcurrentDictionary<object, object>`存储平台缓存数据，因为实际类型事先未知。这将导致对值类型进行[装箱和拆箱](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing)，从而降低性能并消耗更多的内存。当在`PlatformCacheConfiguration`中配置`KeyTypeName`和`ValueTypeName`时，Ignite会使用这些类型来创建一个内部的`ConcurrentDictionary`而不是默认的`object`。
::: warning 警告
错误的`KeyTypeName`和/或`ValueTypeName`设置可能导致运行时强制转换异常。
:::
## 8.插件
### 8.1.概述
Ignite.NET的插件系统使得第三方可以扩展Ignite.NET的核心功能。解释Ignite插件的工作方式的最好方法是查看插件的生命周期。

### 8.2.IgniteConfiguration.PluginConfigurations
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

### 8.3.IPluginProvider
`IPluginProvider`实现是新添加的插件的主力，它通过处理`OnIgniteStart`和`OnIgniteStop`方法的调用来处理Ignite节点的生命周期，另外它还通过`GetPlugin<T>()`方法为开发者提供了一个可选的API。

Ignite.NET引擎在`IPluginProvider`实现上要调用的第一个方法是`Start(IPluginContext<TestIgnitePluginConfiguration> context)`，`IPluginContext`中可以访问初始的插件配置以及与Ignite进行交互的所有方法。

当停止Ignite时，会依次调用`Stop`和`OnIgniteStop`方法，以便插件实现可以完成所有的清理和关闭相关的任务。

### 8.4.IIgnite.GetPlugin
通过`IIgnite.GetPlugin(string name)`方法可以访问插件暴露给用户的API，Ignite引擎会使用传递的名字查找`IPluginProvider`并在其上调用`GetPlugin`。
### 8.5.与Java交互
Ignite.NET插件可以通过`PlatformTarget`和`IPlatformTarget`接口对与Ignite Java插件进行交互。
#### 8.5.1.Java端

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
#### 8.5.2..NET端
通过对应的ID调用`IPluginContext.GetExtension`，其会调用Java端的`createTarget`方法：

```csharp
IPlatformTarget extension = pluginContext.GetExtension(42);

long result = extension.InLongOutLong(1, 2);  // processInLongOutLong is called in Java
```
其他的`IPlatformTarget`方法会以高效的方式在Java和.NET之间交换任意类型的数据。
#### 8.5.3.Java端的回调
上面介绍了.NET -> Java的调用机制，当然也可以进行Java -> .NET的调用：

 - 在.NET端通过`RegisterCallback`方法使用一些ID注册回调处理器；
 - 在Java端使用该ID调用`PlatformCallbackGateway.pluginCallback`。

::: tip 完整的示例
完整的示例，可以参见这篇[文章](https://ptupitsyn.github.io/Ignite-Plugin/)。
:::
## 9.序列化
大多数用户定义的类都会使用Ignite.NET API通过网络传递给其他节点，这些类包括：

 - 缓存键和值；
 - 缓存处理器和过滤器（`ICacheEntryProcessor`、`ICacheEntryFilter`、`ICacheEntryEventFilter`、`ICacheEntryEventListener`）；
 - 计算函数（`IComputeFunc`）、操作（`IComputeAction`）和作业（`IComputeJob`）；
 - 服务（`IService`）；
 - 事件和消息处理器（`IEventListener`，`IEventFilter`，`IMessageListener`）。

通过网络传输的这些类对象需要序列化，Ignite.NET支持以下序列化用户数据的方式：

 - `Apache.Ignite.Core.Binary.IBinarizable`接口；
 - `Apache.Ignite.Core.Binary.IBinarySerializer`接口；
 - `System.Runtime.Serialization.ISerializable`接口；
 - Ignite反射式序列化（当以上都不适用时）。

### 9.1.IBinarizable
`IBinarizable`方式提供了对序列化的细粒度控制，这是高性能生产代码的首选方法。

首先，在自己的类中实现`IBinarizable`接口：
```csharp
public class Address : IBinarizable
{
    public string Street { get; set; }

    public int Zip { get; set; }

    public void WriteBinary(IBinaryWriter writer)
    {
        // Alphabetic field order is required for SQL DML to work.
        // Even if DML is not used, alphabetic order is recommended.
        writer.WriteString("street", Street);
        writer.WriteInt("zip", Zip);
    }

    public void ReadBinary(IBinaryReader reader)
    {
      	// Read order does not matter, however, reading in the same order
        // as writing improves performance.
        Street = reader.ReadString("street");
        Zip = reader.ReadInt("zip");
    }
}
```
`IBinarizable`也可以在没有字段名的原始模式下实现，这提供了最快和最紧凑的序列化，但是SQL查询不可用：
```csharp
public class Address : IBinarizable
{
    public string Street { get; set; }

    public int Zip { get; set; }

    public void WriteBinary(IBinaryWriter writer)
    {
        var rawWriter = writer.GetRawWriter();

        rawWriter.WriteString(Street);
        rawWriter.WriteInt(Zip);
    }

    public void ReadBinary(IBinaryReader reader)
    {
        // Read order must be the same as write order
        var rawReader = reader.GetRawReader();

        Street = rawReader.ReadString();
        Zip = rawReader.ReadInt();
    }
}
```
::: tip 自动化GetHashCode和Equals实现
如果对象可以序列化为二进制形式，则Ignite将在序列化时计算其哈希值，并将其写入二进制数组。此外，Ignite还提供了`equals`方法的自定义实现，用于二进制对象的比较。这意味着无需覆盖自定义键和值的`GetHashCode`和`Equals`方法即可在Ignite中使用它们。
:::
### 9.2.IBinarySerializer
`IBinarySerializer`与`IBinarizable`类似，但是将序列化逻辑与类实现分开。当无法修改类代码，并且在多个类之间共享序列化逻辑等场景时，这可能很有用。以下代码产生与上面的`Address`示例完全相同的序列化：
```csharp
public class Address : IBinarizable
{
    public string Street { get; set; }

    public int Zip { get; set; }
}

public class AddressSerializer : IBinarySerializer
{
    public void WriteBinary(object obj, IBinaryWriter writer)
    {
      	var addr = (Address) obj;

        writer.WriteString("street", addr.Street);
        writer.WriteInt("zip", addr.Zip);
    }

    public void ReadBinary(object obj, IBinaryReader reader)
    {
      	var addr = (Address) obj;

        addr.Street = reader.ReadString("street");
        addr.Zip = reader.ReadInt("zip");
    }
}
```
序列化器应在配置中指定，如下：
```csharp
var cfg = new IgniteConfiguration
{
    BinaryConfiguration = new BinaryConfiguration
    {
        TypeConfigurations = new[]
        {
            new BinaryTypeConfiguration(typeof (Address))
            {
                Serializer = new AddressSerializer()
            }
        }
    }
};

using (var ignite = Ignition.Start(cfg))
{
  ...
}
```
### 9.3.ISerializable
实现`System.Runtime.Serialization.ISerializable`接口的类型将相应地进行序列化（通过调用`GetObjectData`和序列化构造函数）。所有的系统功能都支持：包括`IObjectReference`、`IDeserializationCallback`、`OnSerializingAttribute`、`OnSerializedAttribute`、`OnDeserializingAttribute`、`OnDeserializedAttribute`。

`GetObjectData`的结果以Ignite二进制格式写入，以下三个类提供相同的序列化表示形式：
```csharp
class Reflective
{
	public int Id { get; set; }
	public string Name { get; set; }
}

class Binarizable : IBinarizable
{
	public int Id { get; set; }
	public string Name { get; set; }

	public void WriteBinary(IBinaryWriter writer)
	{
		writer.WriteInt("Id", Id);
		writer.WriteString("Name", Name);
	}

	public void ReadBinary(IBinaryReader reader)
	{
		Id = reader.ReadInt("Id");
		Name = reader.ReadString("Name");
	}
}

class Serializable : ISerializable
{
	public int Id { get; set; }
	public string Name { get; set; }

	public Serializable() {}

	protected Serializable(SerializationInfo info, StreamingContext context)
	{
		Id = info.GetInt32("Id");
		Name = info.GetString("Name");
	}

	public void GetObjectData(SerializationInfo info, StreamingContext context)
	{
		info.AddValue("Id", Id);
		info.AddValue("Name", Name);
	}
}
```
### 9.4.Ignite反射式序列化
Ignite反射式序列化本质上是一种`IBinarizable`方式，其是通过反射所有字段并发出读/写调用自动实现的。

该机制没有条件，任何类或结构都可以序列化（包括所有系统类型、委托、表达式树、匿名类型等）。

可以使用`NonSerialized`属性排除不需要的字段。

可以通过`BinaryReflectiveSerializer`显式启用原始模式：

<Tabs>
<Tab title="C#">

```csharp
var binaryConfiguration = new BinaryConfiguration
{
    TypeConfigurations = new[]
    {
        new BinaryTypeConfiguration(typeof(MyClass))
        {
            Serializer = new BinaryReflectiveSerializer {RawMode = true}
        }
    }
};
```
</Tab>

<Tab title="app.config">

```xml
<igniteConfiguration>
	<binaryConfiguration>
		<typeConfigurations>
			<binaryTypeConfiguration typeName='Apache.Ignite.ExamplesDll.Binary.Address'>
				<serializer type='Apache.Ignite.Core.Binary.BinaryReflectiveSerializer, Apache.Ignite.Core' rawMode='true' />
			</binaryTypeConfiguration>
		</typeConfigurations>
	</binaryConfiguration>
</igniteConfiguration>
```
</Tab>

</Tabs>

如果没有这个配置，`BinaryConfiguration`是不需要的。

性能与手工实现`IBinarizable`相同，反射只在启动阶段使用，用于遍历所有的字段并发出有效的IL代码。

带有`Serializable`属性但没有`ISerializable`接口的类型使用Ignite反射式序列化器写入。
### 9.5.使用Entity Framework POCOs
Ignite中可以直接使用Entity Framework POCOs。

但是，Ignite无法直接序列化或反序列化POCO代理[https://msdn.microsoft.com/zh-cn/data/jj592886.aspx](https://msdn.microsoft.com/en-us/data/jj592886.aspx)，因为代理类型是动态类型。

将EF对象与Ignite结合使用时，要确认禁用创建代理：

<Tabs>
<Tab title="Entity Framework 6">

```csharp
ctx.Configuration.ProxyCreationEnabled = false;
```
</Tab>

<Tab title="Entity Framework 5">

```csharp
ctx.ContextOptions.ProxyCreationEnabled = false;
```
</Tab>
</Tabs>

### 9.6.更多信息
有关本章节介绍的各种模式的序列化性能的更多信息，请参见[Ignite的序列化性能](https://ptupitsyn.github.io/Ignite-Serialization-Performance/)这篇文章。

## 10.跨平台支持
### 10.1.概述
从2.4版本开始，同Windows平台一样，也可以在Linux和macOS平台上运行.NET节点以及开发Ignite.NET应用，.NET Core和Mono平台都是支持的。

### 10.2..NET Core

**环境要求**

 - [.NET Core SDK 2.0+](https://www.microsoft.com/net/download/)；
 - [Java 8+](http://www.oracle.com/technetwork/java/javase/downloads/index.html)（macOS需要JDK，否则JRE也可以）。

**运行二进制包中的示例**

 - 从[这里](https://ignite.apache.org/download.cgi#binaries)下载二进制包然后解压；
 - `cd platforms/dotnet/examples/dotnetcore`；
 - `dotnet run`。

### 10.3.Java检测
Ignite.NET会在如下位置寻找Java安装目录：

 - `HKLM\Software\JavaSoft\Java Runtime Environment`(Windows)；
 - `/usr/bin/java`(Linux)；
 - `/Library/Java/JavaVirtualMachines`(macOS)。

如果修改了Java的默认位置，那么需要使用下面的方法之一指定实际的位置：

 - 配置`IgniteConfiguration.JvmDllPath`属性；
 - 配置`JAVA_HOME`环境变量。

### 10.4.已知问题

**No Java runtime present, requesting install**

在macOS上Java的`8u151`版本存在一个问题：[JDK-7131356](https://bugs.openjdk.java.net/browse/JDK-7131356)，一定要安装`8u152`及其以后的版本。

**Serializing delegates is not supported on this platform**

.NET Core不支持序列化委托，执行`System.MulticastDelegate.GetObjectData`[会抛出异常](https://github.com/dotnet/coreclr/blob/master/src/mscorlib/src/System/MulticastDelegate.cs#L52)，因此Ignite.NET无法对委托或包含委托的对象进行序列化。

**Could not load file or assembly 'System.Configuration.ConfigurationManager'**

已知的[.NET问题(506)](https://github.com/dotnet/standard/issues/506)，有时需要额外的包引用：

 - `dotnet add package System.Configuration.ConfigurationManager`

## 11.平台互操作性
Ignite允许不同的平台（例如.NET、Java和C++）彼此互操作，由一个平台定义和写入Ignite的类和对象可以由另一平台读取和使用。
### 11.1.标识符
为了实现互操作性，Ignite使用通用二进制格式写入对象，此格式使用整数标识符对对象类型和字段进行编码。

Ignite通过两个阶段，将对象的类型和字段名转换为整数值：

 - 名称转换：将完整的类型名和字段名传递给`IBinaryNameMapper`接口，并转换为某种通用形式；
 - ID转换：将生成的字符串传递给`IBinaryIdMapper`以生成字段ID或者类型ID。

可以在`BinaryConfiguration`中配置全局映射器，也可以在`BinaryTypeConfiguration`中为具体类型配置映射器。

Java有相同的接口`BinaryNameMapper`和`BinaryIdMapper`，它们也是配置在`BinaryConfiguration`或`BinaryTypeConfiguration`上。
### 11.2.默认行为
.NET和Java类型必须映射到相同的类型ID，并且相关字段必须映射到相同的字段ID。

Ignite.NET的.NET部分默认会应用以下转换：

 - 名称转换：`System.Type.FullName`面向非泛型类型的属性，字段或属性名称不变；
 - ID转换：将名称转换为小写，然后以与Java中的`java.lang.String.hashCode()`方法相同的方式计算ID。

Ignite.NET的Java部分默认会应用以下转换：

 - 名称转换：`Class.getName()`方法用于获取类名称，字段名称保持不变；
 - ID转换：将名称转换为小写，然后用`java.lang.String.hashCode()`计算ID。

例如，如果以下两种类型在.NET命名空间和Java包外部，则它们将自动彼此映射：

<Tabs>
<Tab title="C#">

```csharp
class Person
{
    public int Id { get; set; }
    public string Name { get; set; }
    public byte[] Data { get; set; }
}
```
</Tab>

<Tab title="Java">

```java
class Person
{
    public int id;
    public String name;
    public byte[] data;
}
```
</Tab>

</Tabs>

不过类型通常在某些命名空间或包中，包和命名空间的命名约定在Java和.NET中有所不同，.NET命名空间与Java包相同可能会出现问题。

简单名称映射器（忽略命名空间）可以避免此问题，其应该在.NET端和Java端中同时配置：

<Tabs>
<Tab title="Java Spring XML">

```xml
<bean id="grid.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
    ...
    <property name="binaryConfiguration">
        <bean class="org.apache.ignite.configuration.BinaryConfiguration">
            <property name="nameMapper">
                <bean class="org.apache.ignite.binary.BinaryBasicNameMapper">
                    <property name="simpleName" value="true"/>
                </bean>
            </property>
        </bean>
    </property>
    ...
</bean>
```
</Tab>

<Tab title="C#">

```csharp
var cfg = new IgniteConfiguration
{
  BinaryConfiguration = new BinaryConfiguration
  {
    NameMapper = new BinaryBasicNameMapper {IsSimpleName = true}
  }
}

```
</Tab>

<Tab title="app.config">

```xml
<igniteConfiguration>
  <binaryConfiguration>
    <nameMapper type="Apache.Ignite.Core.Binary.BinaryBasicNameMapper, Apache.Ignite.Core" isSimpleName="true" />
  </binaryConfiguration>
</igniteConfiguration>
```
</Tab>
</Tabs>

### 11.3.类型兼容性

|C#|Java|
|---|---|
|`bool`|`boolean`|
|`byte`(*)，`sbyte`|`byte`|
|`short`，`ushort`(*)|`short`|
|`int`, `uint`(*)|`int`|
|`long`,`ulong`(*)|`long`|
|`char`|`char`|
|`float`|`float`|
|`double`|`double`|
|`decimal`|`java.math.BigDecimal`(**)|
|`decimal`|`java.lang.String`|
|`Guid`|`java.util.UUID`|
|`DateTime`|`java.util.Date`,`java.sql.Timestamp`|

* `byte`，`ushort`，`uint`，`ulong`没有对应的Java类型，将直接按字节映射（无范围检查），例如在C#中`byte`值为`200`，对应在Java中为有符号的`byte`值`-56`。

** Java中`BigDecimal`可以有任意的大小和精度，而C#中数值型固定为16个字节和28-29位精度，如果反序列化时一个`BigDecimal`无法匹配`decimal`，则Ignite.NET会抛出`BinaryObjectException`。

**Enum**：在Ignite中，Java的`writeEnum`只会写入序数值，但是在.NET中，可以为`enumValue`分配任何数字，因此要注意，不会考虑任何自定义的枚举到原始值的绑定。

::: warning DateTime序列化
DateTime可以是Local和UTC，Java中Timestamp只能是UTC。因此Ignite.NET可以通过如下方式对DateTime进行序列化：

 - .NET风格（可以与非UTC值一起使用，在SQL中不可用）和作为Timestamp（对非UTC值抛出异常，可用在SQL中）；
 - 反射式序列化：使用`QuerySqlField`标记字段以强制执行时间戳序列化，或者配置`BinaryReflectiveSerializer.ForceTimestamp`为`true`，这个可以每类型单独配置，也可以全局配置，比如：`IgniteConfiguration.BinaryConfiguration = new BinaryConfiguration { Serializer = new BinaryReflectiveSerializer { ForceTimestamp = true } }`；
 - `IBinarizable`：使用`IBinaryWriter.WriteTimestamp`方法。

如果无法通过`QuerySqlField`修改类来标记字段或无法实现`IBinarizable`，可以使用`IBinarySerializer`方式。具体请参见[序列化](#_9-序列化)。
:::
### 11.4.集合兼容性
简单类型数组（上表所示）和对象数组都是可互操作的，所有其他集合和数组的默认行为（使用反射式序列化或`IBinaryWriter.WriteObject`）将使用`BinaryFormatter`，Java代码是无法读取的（为了正确支持泛型）。如果要将集合写为可互操作的格式，需要实现`IBinarizable`接口，并使用`IBinaryWriter.WriteCollection`或`IBinaryWriter.WriteDictionary`或`IBinaryReader.ReadCollection`或`IBinaryReader.ReadDictionary`方法。
### 11.5.混合平台集群
Ignite、Ignite.NET和Ignite.C++节点可以加入同一个集群。

所有平台都是基于Java构建的，因此任何节点都可以执行Java计算。但是.NET和C++计算只能由相对应的节点执行。

如果集群中至少有一个非.NET节点，则不支持以下Ignite.NET功能：

 - 带过滤器的扫描查询；
 - 带过滤器的持续查询；
 - `ICache.Invoke`方法；
 - 带过滤器的`ICache.LoadCache`；
 - 服务；
 - `IMessaging.RemoteListen`；
 - `IEvents.RemoteQuery`；

有关多平台搭建的实战文章：[构建多平台的Ignite集群：Java+.NET](https://my.oschina.net/liyuj/blog/793938)。

### 11.6.混合平台集群中的计算
`ICompute.ExecuteJavaTask`方法在任何集群上的执行都没有限制。其他`ICompute`方法将仅在.NET节点上执行闭包。
## 12.远程程序集加载
### 12.1.概述
许多Ignite API都涉及远程代码执行，例如将计算任务和函数序列化，然后发送到远程节点并执行。但是远程节点必须加载具有这些功能的.NET程序集（dll文件），以便实例化和反序列化任务实例。

在Ignite的2.1版之前，必须手动加载程序集（使用Apache.Ignite.exe的`-assembly`开关或其他方式）。从2.1版开始引入了自动远程程序集加载，由`IgniteConfiguration.PeerAssemblyLoadingMode`控制。其默认值为`Disabled`，这意味着和之前的行为一致。在集群中的所有节点上，该属性值必须全部相同。还有另一种可用的模式是`CurrentAppDomain`。
### 12.2.CurrentAppDomain模式
开启`PeerAssemblyLoadingMode.CurrentAppDomain`可以实现集群中其他节点的自动按需程序集请求，将程序集加载到运行Ignite节点的[AppDomain](https://msdn.microsoft.com/en-us/library/system.appdomain.aspx)中。

考虑以下代码：
```csharp
// Print Hello World on all cluster nodes.
ignite.GetCompute().Broadcast(new HelloAction());

class HelloAction : IComputeAction
{
  public void Invoke()
  {
    Console.WriteLine("Hello World!");
  }
}
```

 - Ignite序列化`HelloAction`实例并发送到集群中的每个节点；
 - 远程节点尝试反序列化`HelloAction`，如果当前已加载或引用的程序集中没有此类，则将请求发送到`Broadcast`被调用的节点，然后发送到其他节点（如有必要）；
 - 程序集文件从其他节点作为字节数组发送，并通过`Assembly.Load(byte[])`方法加载。

#### 12.2.1.版本控制
[程序集限定类型名](https://msdn.microsoft.com/en-us/library/system.type.assemblyqualifiedname.aspx)（包括程序集版本）用于解析类型。

如果集群处于运行态，需要在逻辑上做出如下的修改，然后查看程序集如何自动加载：

 - 修改`HelloAction`实例以输出一些内容；
 - 修改[AssemblyVersion](https://msdn.microsoft.com/en-us/library/system.reflection.assemblyversionattribute.aspx)；
 - 重新编译然后运行应用代码；
 - 新版本的程序集会在其他节点上部署并运行。

但是如果不修改`AssemblyVersion`，则Ignite将使用以前加载的现有程序集，因为类型名没有变化。

不同版本的程序集可以共存，老节点可以继续运行旧代码，而新节点可以使用同一类的较新版本执行计算。

`AssemblyVersion`属性可以包含星号（`*`），以在构建时可以自动增量处理：`[assembly: AssemblyVersion("1.0.*")]`。这样就可以保持集群运行，重复修改和运行计算，并且每次都将部署新的程序集版本。
#### 12.2.2.依赖
依赖程序集也会自动加载（例如`ComputeAction`从其他程序集调用某些代码时），因此使用很重的框架和库时，要注意单个计算调用可能导致大量程序集的网络传输。
#### 12.2.3.卸载
.NET不允许卸载程序集，只能是`AppDomain`作为整体卸载所有的程序集。

当前可用的`CurrentAppDomain`模式使用现有的AppDomain，这意味着在当前AppDomain存在时，所有对等部署的程序集将保持加载状态，这可能会导致内存使用增加。
### 12.3.示例
实践中，可以使用[PeerAssemblyLoadingExample](https://github.com/apache/ignite/blob/56975c266e7019f307bb9da42333a6db4e47365e/modules/platforms/dotnet/examples/Apache.Ignite.Examples/Compute/PeerAssemblyLoadingExample.cs)尝试远程程序集加载。

 - 在Visual Studio中创建一个新的控制台应用；
 - 安装Ignite.NET NuGet软件包`Install-Package Apache.Ignite`；
 - 打开`packages\Apache.Ignite.2.1\lib\net40`文件夹；
 - 向`<igniteConfiguration>`元素添加`peerAssemblyLoadingMode='CurrentAppDomain'`属性；
 - 运行`Apache.Ignite.exe`（一次或多次），保持进程运行；
 - 将`AssemblyInfo.cs`中的`AssemblyVersion`值改为`1.0.*`；
 - 在Visual Studio中修改`Program.cs`，如下所示：

<Tabs>
<Tab title="Program.cs">

```csharp
using System;
using Apache.Ignite.Core;
using Apache.Ignite.Core.Compute;
using Apache.Ignite.Core.Deployment;

namespace ConsoleApp
{
    class Program
    {
        static void Main(string[] args)
        {
            var cfg = new IgniteConfiguration
            {
                PeerAssemblyLoadingMode = PeerAssemblyLoadingMode.CurrentAppDomain
            };

            using (var ignite = Ignition.Start(cfg))
            {
                ignite.GetCompute().Broadcast(new HelloAction());
            }
        }

        class HelloAction : IComputeAction
        {
            public void Invoke()
            {
                Console.WriteLine("Hello, World!");
            }
        }
    }
}
```
</Tab>

<Tab title="Apache.Ignite.exe.config">

```xml
<igniteConfiguration peerAssemblyLoadingMode='CurrentAppDomain' />
```
</Tab>

<Tab title="AssemblyInfo.cs">

```
...
[assembly: AssemblyVersion("1.0.*")]
...
```
</Tab>
</Tabs>

 - 运行该项目并观察"Hello，World！"在所有`Apache.Ignite.exe`窗口的控制台输出；
 - 将"Hello，World！"改为其他的值，然后再次运行该程序；
 - 观察之前使用`Apache.Ignite.exe `启动的节点的输出有何不同。

## 13.问题解决
### 13.1.概述
本章节介绍了几种故障排除技术和在生产中构建和使用Ignite.NET应用时可能遇到的常见问题。
### 13.2.使用控制台排除故障
Ignite会产生控制台输出（stdout）：信息、指标、警告、错误详细信息等，如果应用未打开控制台，则可以将控制台输出重定向到字符串或文件：
```csharp
var sw = new StringWriter();
Console.SetOut(sw);

// Examine output:
sw.ToString();
```
### 13.3.获取有关异常的更多信息
当拿到`IgniteException`时，一定要检查其中的`InnerException`属性，该属性通常包含有关错误的更多详细信息，具体可以在Visual Studio的调试器中或通过在异常对象上调用`ToString()`方法看到：

![](https://ignite.apache.org/docs/2.9.0/images/net-view-details.png)

```csharp
try {
    IQueryCursor<List> cursor = cache.QueryFields(query);
}
catch (IgniteException e) {
    // Printing out the whole exception meesage.
    Console.WriteLine(e.ToString());
}
```
### 13.4.常见问题
下面将介绍设计Ignite.NET应用时可能遇到的几个问题。
#### 13.4.1.无法加载jvm.dll
确认已安装JDK，配置好了`JAVA_HOME`环境变量并指向JDK安装目录。最新的JDK可以在这里找到：[http://www.oracle.com/technetwork/java/javase/downloads/index.html](http://www.oracle.com/technetwork/java/javase/downloads/index.html)。

`errorCode=193`是`ERROR_BAD_EXE_FORMAT`，通常是由x64/x86不匹配引起的。确认已安装的JDK和应用具有相同的x64/x86平台架构。当未设置`JAVA_HOME`时，Ignite会自动检测到合适的JDK，因此即使同时安装了x86和x64的JDK，也没有问题。

丢失依赖时会发生`126 ERROR_MOD_NOT_FOUND`。

 - JDK8需要[Microsoft Visual C++ 2010 Redistributable](https://www.microsoft.com/en-us/download/details.aspx?id=14632)包；
 - 之后版本的JDK需要[Microsoft Visual C++ 2015 Redistributable](https://www.microsoft.com/en-us/download/details.aspx?id=48145)包或者更新的版本。

#### 13.4.2.无法找到Java类
检查`IGNITE_HOME`环境变量、`IgniteConfiguration.IgniteHome`和`IgniteConfiguration.JvmClasspath`属性，具体请参见[部署](#_14-部署)章节，ASP.NET/IIS场景还需要其他的步骤。
#### 13.4.3.Ignition.Start阻塞
检查控制台输出。

最常见的原因是拓扑连接失败：

 - 发现部分的配置不正确（请参见[集群配置](/doc/2.8.0/net/Clustering.md#_4-集群配置)）；
 - `ClientMode`是`true`的，但是没有服务端节点（请参见[客户端和服务端](#_9-客户端和服务端)）。

#### 13.4.4.启动管理器失败: GridManagerAdapter
检查控制台输出，通常这是由无效或不兼容的配置引起的：

 - 某些配置属性值无效（超出范围等）；
 - 某些配置属性与其他集群节点中的值不兼容。尤其是`BinaryConfiguration`中的属性，例如`CompactFooter`、`IdMapper`和`NameMapper`应在所有节点上是相同的。

当搭建混合集群（Java + .NET节点）时，通常会出现后一个问题，因为这些平台上的默认配置是不同的。.NET仅支持`BinaryBasicIdMapper`和`BinaryBasicNameMapper`，因此必须通过以下方式调整Java配置以启用.NET节点的接入：
```xml
<property name="binaryConfiguration">
    <bean class="org.apache.ignite.configuration.BinaryConfiguration">
        <property name="compactFooter" value="true"/>
        <property name="idMapper">
            <bean class="org.apache.ignite.binary.BinaryBasicIdMapper">
                <constructor-arg value="true"/>
            </bean>
        </property>
        <property name="nameMapper">
            <bean class="org.apache.ignite.binary.BinaryBasicNameMapper">
                <constructor-arg value="true"/>
            </bean>
        </property>
    </bean>
</property>
```
#### 13.4.5.无法加载文件或程序集'MyAssembly'或其依赖，系统无法找到指定文件
远程节点缺失某程序集时会抛出该异常，具体请参见[加载用户程序集](#_3-4-加载用户程序集)。
#### 13.4.6.堆栈溢出错误，.NET终止
在Linux平台的.NET Core环境下，当用户代码抛出`NullReferenceException`异常时，就会发生这种情况。其原因是，.NET和Java都使用SIGSEGV来处理某些异常，包括`NullPointerException`和`NullReferenceException`，当JVM与.NET运行在同一进程中时，它将覆盖该处理器，破坏.NET异常处理（具体参见[1](https://github.com/dotnet/coreclr/issues/25945)，[2](https://github.com/dotnet/coreclr/issues/25166)）。

.NET Core 3.0解决了该问题（[#25972](https://github.com/dotnet/coreclr/pull/25972)：将`COMPlus_EnableAlternateStackCheck`环境变量设置为`1`）。
## 14.集成
### 14.1.ASP.NET输出缓存
#### 14.1.1.概述
Ignite缓存可用作ASP.NET的输出缓存，这对于在Web服务器之间共享输出缓存尤其有效。
#### 14.1.2.安装

 - **二进制包**：添加对`Apache.Ignite.AspNet.dll`的引用；
 - **NuGet**：`Install-Package Apache.Ignite.AspNet`。

#### 14.1.3.自动启动Ignite
如果要自动启动Ignite用于输出缓存，可以[在web.config中配置IgniteConfigurationSection](#_1-3-通过应用或web配置文件方式配置)：
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
#### 14.1.4.手动启动Ignite
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

对于和Web环境尤其是和`IGNITE_HOME`有关的内容，请参见[ASP.NET部署](#_2-5-asp-net部署)。
### 14.2.ASP.NET会话状态缓存
#### 14.2.1.概述
会话状态的值和信息默认存储在ASP.NET进程的内存中，而会话状态缓存旨在将用户会话数据存储在不同的源中。

Ignite.NET实现了一个会话状态存储，其会将会话数据存储在Ignite缓存中，该缓存将会话状态分布在多个服务器上，以实现更高的可用性和容错能力。

::: warning 开发调试
在开发和调试过程中，IIS将在构建和运行Web应用时动态检测代码更新，不过不会重启嵌入式Ignite实例，这可能导致异常和不确定的行为，因此使用Ignite会话状态缓存时，**要确认手动重启IIS**。
:::

#### 14.2.2.安装

 - **二进制包**：添加对`Apache.Ignite.AspNet.dll`的引用；
 - **NuGet**：`Install-Package Apache.Ignite.AspNet`。

#### 14.2.3.配置
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

关于在ASP.NET应用中启用Ignite的更多信息，请参见[ASP.NET输出缓存](#_14-1-asp-net输出缓存)。

对于和Web环境尤其是和`IGNITE_HOME`有关的内容，请参见[ASP.NET部署](#_2-5-asp-net部署)。
### 14.3.Entity Framework二级缓存
#### 14.3.1.概述
Entity Framework像大多数其他ORM一样，可以在多个层级上使用缓存。

 - 一级缓存是`DbContext`在实体级别控制的（实体缓存在对应的`DbSet`中）；
 - 二级缓存位于`DataReader`层级，并保存原始查询数据（不过Entity Framework6中没有现成的二级缓存机制）。

Ignite.NET提供了EF6的二级缓存解决方案。该方案将数据存储在分布式Ignite缓存中，尤其适用于多个应用服务器通过Entity Framework访问单个SQL数据库的场景，缓存的数据在集群的所有主机之间共享。
#### 14.3.2.安装

 - **二进制包**：添加对`Apache.Ignite.EntityFramework.dll`的引用；
 - **NuGet**：`Install-Package Apache.Ignite.EntityFramework`。

#### 14.3.3.配置
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

#### 14.3.4.app.config和web.config

通过提供`IgniteDbConfiguration`（或其子类）的程序集限定类型名，可以在配置文件中启用Ignite缓存：

app.config：
```xml
<entityFramework codeConfigurationType="Apache.Ignite.EntityFramework.IgniteDbConfiguration, Apache.Ignite.EntityFramework">
    ...Your EF config...
</entityFramework>
```
#### 14.3.5.高级配置
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

<RightPane/>
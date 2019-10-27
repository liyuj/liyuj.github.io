# 第三方集成
## 1.ASP.NET输出缓存
Ignite缓存可用作ASP.NET的输出缓存，这对于在Web服务器之间共享输出缓存尤其有效。

### 1.1.安装
**二进制发行版**：添加对`Apache.Ignite.AspNet.dll`的引用；
**NuGet**：`Install-Package Apache.Ignite.AspNet`。

### 1.2.配置：自动启动Ignite
如果要自动启动Ignite用于输出缓存，可以在`web.config`中配置`IgniteConfigurationSection`，具体请参见[配置](/doc/net/#_5-配置)章节的内容：
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

对于和Web环境尤其是和`IGNITE_HOME`有关的内容，请参见[ASP.NET部署](/doc/net/#_14-4-asp-net部署)，
## 2.ASP.NET会话状态缓存
会话状态的值和信息默认存储在ASP.NET进程的内存中，而会话状态缓存旨在将用户会话数据存储在不同的源中。

Ignite.NET实现了一个会话状态存储，其会将会话数据存储在Ignite缓存中，该缓存将会话状态分布在多个服务器上，以实现更高的可用性和容错能力。

::: warning 开发调试
在开发和调试过程中，IIS将在构建和运行Web应用时动态检测代码更新，不过不会重启嵌入式Ignite实例，这可能导致异常和不确定的行为，因此使用Ignite会话状态缓存时，**要确认手动重启IIS**。
:::

### 2.1.安装
**二进制发行版**：添加对`Apache.Ignite.AspNet.dll`的引用；
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
|`igniteConfigurationSectionName`|`configSections`中定义的`web.config`段名，具体请参见[配置](/doc/net/#_5-配置)章节的内容，该配置会在未启动Ignite时启动Ignite。|
|`applicationId`|仅当多个Web应用共享同一Ignite会话状态缓存时才应使用。会分配不同的ID字符串，以避免应用之间的会话数据冲突。建议通过`cacheName`属性每个应用都使用单独的缓存。|
|`gridName`|会话状态缓存实现通过该网格名调用`Ignition.TryGetIgnite`来检查Ignite是否已启动。|
|`cacheName`|会话状态缓存名，默认为`ASPNET_SESSION_STATE`。|

关于在ASP.NET应用中启用Ignite的更多信息，请参见[ASP.NET输出缓存](#_1-asp-net输出缓存)。

对于和Web环境尤其是和`IGNITE_HOME`有关的内容，请参见[ASP.NET部署](/doc/net/#_14-4-asp-net部署)，

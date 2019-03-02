# 4.安全和审计
## 4.1.安全和审计
GridGain提供了一套安全功能，可为远程客户端和其他集群节点开启访问控制。它们是通过配置可插拔的认证和授权机制、以及完整的审计功能来实现的，这些功能可以回放系统中的任何事件，以追溯需对该事件负责的用户。
### 4.1.1.认证
GridGain支持可插拔的`Authenticator`，用户可以将任何现有的认证机制插入GridGain。GridGain直接支持基于密码和基于JAAS的认证机制。通过基于JAAS的实现，GridGain能够自动支持JNDI、LDAP、活动目录以及其它任何符合JAAS的认证和授权机制。

为了进行认证，客户端或集群节点需要提供有效的用户名和密码，如果认证成功，GridGain将为通过认证的主体生成可用权限列表。
### 4.1.2.授权
通过认证后，会为主体提供预配置的授权权限列表。GridGain允许为任何数据更改操作、闭包或任务执行、数据查询和查看以及管理和监视设置权限。`SecurityPermission`枚举定义了所有可用权限的完整列表，大多数权限都是缓存级的，因此同一个用户，例如，可能对一个缓存具有READ和WRITE权限，而对另一个缓存只具有QUERY权限。

授权功能通过`Security`API暴露给用户的，以便在需要自定义逻辑时允许在业务代码中进行手动授权检查。

还可以为Visor管理和监控工具设置所有可用的安全权限。
### 4.1.3.审计能力
如果发生了意外的事件，能够回放发生的事件并追溯应对该事件负责的通过认证的主体非常重要。GridGain具有多种审计机制，可确保系统中发生的每个事件都是可追溯的：

 1. 系统中的每个事件都绝对包含通过认证的主体的用户名，这确保每个事件都有责任方的信息；
 2. 除用户名外，每个事件还包含责任方的IP地址、集群节点IP地址、更改前后的受影响数据；
 3. 如果一个事件是由另一个事件引起的，则子事件将具有关于父事件的审计信息。例如，如果从闭包或任务触发了缓存PUT操作，则缓存PUT事件将包含有关父任务执行事件的信息，依此类推；
 4. 除了能够追溯所有直接的数据访问操作和查询之外，用户还可以追溯间接访问。例如，如果数据不是从服务端数据节点访问，而是从客户端近缓存或远程连续查询通知访问，则它仍将作为单独的事件进行记录；
 5. 每个事件都由`EventStorage`SPI记录。该SPI提供了一种可插拔的机制，可以将事件记录为任何所需格式、记录到任何底层存储系统，无论是文件系统还是任何数据库；
 6. 存储在缓存中的所有数据都包含有关字段的元数据信息，因此在打印输出时，所有字段名都会与值一起列出，这样用户就可以立即知道哪个字段已更改，而无需追溯和关联不同的日志。

::: tip 保护集群的两种方法
可以通过两种方式配置安全性：使用GridGain的认证和授权机制或Ignite的[认证机制](/doc/java/Security.md#_4-2-高级安全)，不过GridGain的安全性和Ignite的安全性是互斥的，同时只能使用一个，建议使用GridGain的安全性，因为它提供了更广泛的功能。
:::
## 4.2.安全概念
### 4.2.1.GridSecurity入口
GridGain可以对试图加入集群的集群节点和远程节点进行认证和授权。`GridSecurity`API包含了和当前登录到集群的已认证主体及其持有的权限集有关的信息，可以使用以下代码，从`GridGain`的插件接口中获取`GridSecurity`实例：
```java
GridSecurity security = grid.security();
```
### 4.2.2.认证和授权
启用安全性后，必须在加入集群之前对集群节点进行认证。要启用集群安全性，需为`GridGainConfiguration`配置`安全凭据`和`认证器`，注意可以为缓存授予的权限包括执行`put`、`get`和`remove`操作，针对任务的是`execute`操作。

**安全凭据**

对于集群节点，安全凭据是在集群的配置中通过`GridGainConfiguration.setSecurityCredentialsProvider(...)`方法指定的，下面是示例：

Java：
```java
GridGainConfiguration cfg = new GridGainConfiguration();
 
SecurityCredentials creds = new SecurityCredentials("username", "password");
 
// Create basic security provider.
SecurityCredentialsBasicProvider provider = new SecurityCredentialsBasicProvider(creds);

// Specify security provider in GridGain Configuration.
cfg.setSecurityCredentialsProvider(provider);
```
XML：
```xml
<!-- Security credentials. -->
<bean id="securityCredentials" class="org.apache.ignite.plugin.security.SecurityCredentials">
    <constructor-arg value="YOUR_USERNAME"/>
    <constructor-arg value="YOUR_PASSWORD"/>
</bean>
 
<!-- GridGain plugin configuration. -->
<bean class="org.gridgain.grid.configuration.GridGainConfiguration">
    ...
    <property name="securityCredentialsProvider">
        <bean class="org.apache.ignite.plugin.security.SecurityCredentialsBasicProvider">
            <constructor-arg ref="securityCredentials"/>
        </bean>
    </property>
    ...
</bean>
```
::: tip 自定义或者加密的安全凭据
要设置安全凭据，用户可以选择实现自己的`SecurityCredentialsProvider`接口，这样就可以开发自定义的实现，以在自己的环境中存储用户名和密码，也可以采用加密的格式。如果不需要自定义逻辑或加密时，可以使用GridGain提供的`SecurityCredentialsBasicProvider`，它只是简单地使用传入的凭据。
:::

**认证器**

集群节点认证是通过`Authenticator`实现的，GridGain提供了两种方式来对主体进行**认证**和**授权**（节点或者客户端）：

 - JAAS认证器
 - 密码认证器

安全权限是在节点加入集群过程中赋予的，并且在节点生命周期中不会改变。

**认证器配置验证**

在新节点试图加入集群时，就会执行以下对认证器配置的检查：

 - GridGain会始终检查所有的服务端节点是否配置了相同的认证器实现类；
 - GridGain还支持通过自定义令牌进行认证验证。要启用此验证，认证器实现类还应实现`AuthenticationValidator`接口，GridGain将检查集群中的所有节点是否具有相同的认证令牌。注意，JAAS认证器和密码认证器也都实现了该接口。

**全局节点认证**

GridGain支持由`Authenticator.isGlobalNodeAuthentication()`方法调节的两种主体认证模式：

|isGlobalNodeAuthentication|描述|
|---|---|
|`false`|如果`isGlobalNodeAuthentication()`返回`false`，则只有集群中最老的服务端节点会为加入中的节点进行认证并为其分配安全权限。如果最老的服务端节点下线，则下一个最老的节点将接管并使用它的`Authenticator`实例为新节点进行认证和分配安全权限。<br>在使用集中式身份认证系统（如LDAP）时，此操作模式非常有用，因为它允许动态更改主体的安全权限，而无需重启整个集群，即只需重启安全权限已更改的单个集群节点即可。|
|`true`|如果`isGlobalNodeAuthentication()`返回`true`，集群的所有现有节点都将对主体进行认证，并且必须就分配给主体的安全权限达成一致，以便认证成功。<br>这种操作模式用于`PasscodeAuthenticator`，因为权限是在每个节点上独立定义的，这样可以最小化错误配置的可能性。|

## 4.3.JAAS认证
`JaasAuthenticator`提供了基于JAAS标准的认证机制，接收到认证请求后，该SPI根据[JAAS参考指南](http://docs.oracle.com/javase/7/docs/technotes/guides/security/jaas/JAASRefGuide.html)，会将认证委托给配置好的外部JAAS登录模块。JAAS配置文件的路径是通过`-Djava.security.auth.login.config=/my/path/jass.config`系统属性指定的，下面是一个LDAP登录模块的JAAS配置文件示例：
```
GridJaasLoginContext {
    com.sun.security.auth.module.LdapLoginModule REQUIRED
    userProvider="ldap://serverName/ou=People,dc=nodomain"
    userFilter="uid={USERNAME}"
    authzIdentity="{<ATTR_NAME_OF_GRIDGAIN_PERMISSIONS>}"
    useSSL=false
    debug=false;
};
```
这里`<ATTR_NAME_OF_GRIDGAIN_PERMISSIONS>`是用户的LDAP条目的属性名，它包含了JSON格式的GridGain权限，下面是如何为多个缓存和任务授予不同权限集的示例，关于可用权限的完整列表，可以参见[授权和权限](#_4-5-授权和权限)。
```
{
    {
        "cache":"partitioned",
        "permissions":["CACHE_PUT", "CACHE_REMOVE", "CACHE_READ"]
    },
    {
        "cache":"*",
        "permissions":["CACHE_READ"]
    },
    {
        "task":"org.mytasks.*",
        "permissions":["TASK_EXECUTE"]
    },
    "defaultAllow":"false"
}
```
`JaasAuthenticator`可以在`GridGainConfiguration`中指定：

Java：
```java
// GridGain plugin configuration.
GridGainConfiguration cfg = new GridGainConfiguration();
 
// Set JAAS authenticator. 
cfg.setAuthenticator(new JaasAuthenticator());
```
XML：
```xml
<bean class="org.gridgain.grid.configuration.GridGainConfiguration">
    ...
    <property name="authenticator">
        <bean class="org.gridgain.grid.security.jaas.JaasAuthenticator"/>
    </property>
    ...
</bean>
```
## 4.4.密码认证
`PasscodeAuthenticator`通过访问控制列表（ACL）提供认证和授权，ACL会将安全凭据映射到将分配给通过认证主体的一组权限，节点和客户端的权限应以JSON格式提供。

以下是`PasscodeAuthenticator`配置的示例：

Java：
```java
// Provide security credentials.
SecurityCredentials serverCreds = new SecurityCredentials("server", "password");
SecurityCredentials clientCreds = new SecurityCredentials("client", "password");
 
// GridGain plugin configuration.
GridGainConfiguration cfg = new GridGainConfiguration();
 
PasscodeAuthenticator authenticator = new PasscodeAuthenticator();
 
// Create map for node and client with their security credentials and permissions.       
Map<SecurityCredentials, String> authMap = new HashMap<>();
 
// Allow all operations on server nodes.
authMap.put(serverCreds, "{defaultAllow:true}");
 
// Allow only cache reads on client nodes.
authMap.put(clientCreds, "{defaultAllow:false, {cache:'*', permissions:[CACHE_READ]}}");
 
authenticator.setAclProvider(new AuthenticationAclBasicProvider(authMap));
 
cfg.setAuthenticator(authenticator);
```
XML：
```xml
<!-- Server node credentials. -->
<bean id="server.cred" class="org.apache.ignite.plugin.security.SecurityCredentials">
    <constructor-arg value="server"/>
    <constructor-arg value="password"/>
</bean>
 
<!-- Client node credentials. -->
<bean id="client.cred" class="org.apache.ignite.plugin.security.SecurityCredentials">
    <constructor-arg value="client"/>
    <constructor-arg value="password"/>
</bean>
 
<bean class="org.gridgain.grid.configuration.GridGainConfiguration">
    ...
    <property name="authenticator">
        <bean class="org.gridgain.grid.security.passcode.PasscodeAuthenticator">
            <property name="aclProvider">
                <bean class="org.gridgain.grid.security.passcode.AuthenticationAclBasicProvider">
                    <constructor-arg>
                        <map>
                            <!-- Allow all operations on server nodes. -->
                            <entry key-ref="server.cred" value="{defaultAllow:true}"/>
                            
                            <!-- Allow only cache reads on client nodes. -->
                            <entry key-ref="client.cred"
                                value="
                                    {
                                        defaultAllow:false,
                                        {
                                            cache:'*',
                                            permissions:[CACHE_READ]
                                        }
                                    }"
                            />
                        </map>
                    </constructor-arg>
                </bean>
            </property>
        </bean>
    </property>
    ...
</bean>
```
## 4.5.授权和权限
主体（远程节点或客户端）通过认证之后就会进行授权。主体通过认证之后，它会被授予由`SecurityPermissionSet`对象表示的一组权限，GridGain提供了缓存、任务执行、服务和系统层面的权限：

**缓存权限**

 - `CACHE_READ`：允许缓存读操作；
 - `CACHE_PUT`：允许缓存写操作；
 - `CACHE_REMOVE`：允许缓存删除操作；

**任务权限**

 - `TASK_EXECUTE`：允许任务执行；
 - `TASK_CANCEL`：允许任务取消；

**服务权限**

 - `SERVICE_DEPLOY`：允许服务部署；
 - `SERVICE_INVOKE`：允许服务调用；
 - `SERVICE_CANCEL`：允许服务取消；

**系统权限**

 - `JOIN_AS_SERVER`：允许节点以服务端加入集群；
 - `EVENTS_ENABLE`：允许运行时启用事件；
 - `EVENTS_DISABLE`：允许运行时禁用事件；
 - `ADMIN_OPS`：允许在Visor中执行各种操作；
 - `ADMIN_VIEW`：允许在Visor中查看集群的各种统计信息（指标、图形、缓存大小等）；
 - `ADMIN_QUERY`：允许在Visor中执行SQL查询；
 - `ADMIN_CACHE`：允许在Visor中执行缓存操作（数据加载、数据再平衡等）；
 - `CACHE_CREATE`：允许创建新的缓存（包括在节点配置中指定的）；
 - `CACHE_DESTROY`：允许销毁已有的缓存。

缓存、服务和任务执行权限是基于每个缓存、每个服务和每个任务分配的。注意通配符也是支持的，因此可以为多个缓存、任务或服务定义相同的权限集。

如果直接用`JAAS`或`Passcode`认证来启用安全性，则应使用JSON格式配置权限，下面是如何为多个缓存和任务授予不同的权限集的示例：
```json
{
    {
        "cache":"mycache",
        "permissions":["CACHE_READ", "CACHE_PUT", "CACHE_REMOVE"]
    },
    {
        "cache":"*",
        "permissions":["CACHE_READ"]
    },
    {
        "task":"org.mytasks.*",
        "permissions":["TASK_EXECUTE"]
    },
    {
        "service":"*",
        "permissions":["SERVICE_INVOKE"]
    },
    {
        "system":["ADMIN_VIEW", "CACHE_CREATE", "JOIN_AS_SERVER"]
    },
    "defaultAllow":"false"
}
```
其中：

 - `mycache`缓存有读、写和删除权限；
 - 其他缓存只有读权限；
 - `org.mytasks`包中的任务有执行权限；
 - 所有的服务都有执行权限；
 - Visor管理控制台只有查看权限（SQL查询和数据加载都是不允许的）；
 - `defaultAllow`标志为`false`，会拒绝任何未显式指定的缓存或者任务操作（即不允许`org.mytasks`包之外的任务的执行）。


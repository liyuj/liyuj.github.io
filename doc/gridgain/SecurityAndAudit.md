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
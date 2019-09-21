# 在Ignite中自定义身份认证安全插件
Ignite集群搭建完成之后，应用就可以接入集群进行各种操作了，但是默认的集群，没有安全保护机制，任何应用、支持JDBC的客户端，只要知道集群节点的IP地址，都可以接入集群，这造成了一定的安全风险，这对于持有敏感数据的用户，显然是无法接受的。

Ignite本身有一个简单的安全模块，提供了一个基于用户名/密码的认证机制，但是在实际业务场景中，需求往往更复杂，本文以白名单认证方式为例，讲述如何通过自定义安全插件的方式，满足自己的业务需求。
## 插件
Ignite有一个设计良好的模块化架构和插件机制，可以配置不同的模块，也可以自定义自己的插件。本文会介绍如何替换掉默认的安全实现。

第一步是在`IgniteConfiguration`中注入一个插件，本示例采用基于XML的配置，配置如下：
```xml
<bean id="ignite" class="org.apache.ignite.configuration.IgniteConfiguration"
      p:gridName="mygrid">

    <property name="pluginConfigurations">
        <bean class="ignite.WhiteListPluginConfiguration"/>
    </property>
</bean>
```
这个配置类的实现没什么特别的，只是创建一个插件提供者：
```java
public class WhiteListPluginConfiguration implements PluginConfiguration {
    @Override
    public Class<? extends PluginProvider> providerClass() {
        return WhiteListPluginProvider.class;
    }
}
```
插件提供者类将在启动时由`IgniteKernal`初始化，可以创建支持不同接口的插件。本文对安全插件感兴趣，所以会创建`GridSecurityProcessor`的实现：
```java
public class WhiteListPluginProvider
                  implements PluginProvider<WhiteListPluginConfiguration> {

    @Override
    public String name() {
        return "WhiteListSecurity";
    }

    @Override
    public String version() {
        return "1.0.0";
    }

    @Nullable
    @Override
    public Object createComponent(PluginContext ctx, Class cls) {
        if (cls.isAssignableFrom(GridSecurityProcessor.class)) {
            return new WhiteListSecurityProcessor();
        } else {
            return null;
        }
    }

    @Override
    public IgnitePlugin plugin() {
        return new WhiteListAuthenticator();
    }

    //all other methods are no-op
}
```
注意这里的`createComponent`方法和`plugin`方法。

这个类上的其它方法，大部分都是空实现。

## WhiteListSecurityProcessor
到此为止，已经在Ignite中创建和安装了安全插件，剩下的就是实现具体的认证和授权逻辑，本文只关注认证，认证通过之后会授予所有的权限。

以下是主要的代码段：
```java
public class WhiteListSecurityProcessor
                          implements DiscoverySpiNodeAuthenticator,
                                     GridSecurityProcessor,
                                     IgnitePlugin {

    //the hosts that will be allowed to join the cluster
    private Set<String> whitelist = new HashSet<>();

    private boolean isAddressOk(Collection<String> addresses) {
        //return true if the address is in the whitelist
    }

    @Override
    public SecurityContext authenticateNode(ClusterNode node,
                                                SecurityCredentials cred)
                                                throws IgniteException {

        return new SecurityContext(new SecuritySubject() {

            @Override
            public SecurityPermissionSet permissions() {
                if (isAddressOk(node.addresses())) {
                    return WhiteListPermissionSets.ALLOW_ALL;
                } else {
                    return WhiteListPermissionSets.ALLOW_NONE;
                }
            }

            //all other methods are noop

        });
    }

    @Override
    public boolean isGlobalNodeAuthentication() {
        //allow any node to perform the authentication
        return true;
    }

    @Override
    public void start() throws IgniteCheckedException {
        //load the whitelist
        //check that this process is running on a white listed server
        //if there's a problem throw new IgniteCheckedException
    }

    @Nullable
    @Override
    public IgniteSpiNodeValidationResult validateNode(ClusterNode node) {
        if (!isAddressOk(node.addresses())) {
            return new IgniteSpiNodeValidationResult(node.id(),
                                                     "Access denied",
                                                     "Access denied");
        } else {
            return null;
        }
    }

    //all other methods are noop

}
```
这个只是一段伪代码，具体的实现需要开发者根据自身的需求进行发挥。

`start`方法会在Ignite启动时调用，因此这里是加载白名单IP地址的合适位置。这里还可以用于校验此进程是否在列出白名单的服务器上运行，如果有任何问题，都可以抛出`IgniteCheckedException`异常，这会导致进程终止并输出错误信息。

当新的节点启动并尝试接入时，将按顺序调用`authenticateNode`和`validateNode`方法。调用`authenticateNode`需要返回一个安全上下文，该安全上下文标识授予该进程的权限。为安全起见，如果IP地址不在白名单上，会返回一个`ALLOW_NONE`策略。然后调用`validateNode`，在这里可以获取连接节点的IP地址，并确定它是否可以加入集群。

至于有关如何创建策略列表的示例，请查看Ignite的`GridOsSecurityProcessor`类。

同样，有许多需要实现的无操作方法，但是与本文的主题无关。

## 最后
这个只是一个简单的示例，讲述了如何定制Ignite的插件，尤其是身份认证插件。如果用于处理身份认证的节点故障，则会选择一个新的节点并恢复服务。
# 4.安全
## 4.1.SSL和TLS
### 4.1.1.保护节点间的连接
Ignite允许在所有节点之间使用SSL Socket进行通信。要使用SSL，需要设置`Factory<SSLContext>`以及配置Ignite配置文件的`SSL`段落，Ignite提供了一个默认的SSL上下文工厂，`org.apache.ignite.ssl.SslContextFactory`，它用一个配置好的keystore来初始化SSL上下文。
XML：
```xml
<bean id="cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="sslContextFactory">
    <bean class="org.apache.ignite.ssl.SslContextFactory">
      <property name="keyStoreFilePath" value="keystore/server.jks"/>
      <property name="keyStorePassword" value="123456"/>
      <property name="trustStoreFilePath" value="keystore/trust.jks"/>
      <property name="trustStorePassword" value="123456"/>
    </bean>
  </property>
</bean>
```
Java：
```java
IgniteConfiguration igniteCfg = new IgniteConfiguration();

SslContextFactory factory = new SslContextFactory();

factory.setKeyStoreFilePath("keystore/server.jks");
factory.setKeyStorePassword("123456".toCharArray());
factory.setTrustStoreFilePath("keystore/trust.jks");
factory.setTrustStorePassword("123456".toCharArray());

igniteCfg.setSslContextFactory(factory);
```
某些情况下需要禁用客户端侧的证书认证（比如连接到一个自签名的服务器时），这可以通过给上述工厂设置禁用信任管理器实现，它可以通过`getDisabledTrustManager`获得。
XML:
```xml
<bean id="cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="sslContextFactory">
    <bean class="org.apache.ignite.ssl.SslContextFactory">
      <property name="keyStoreFilePath" value="keystore/server.jks"/>
      <property name="keyStorePassword" value="123456"/>
      <property name="trustManagers">
        <bean class="org.apache.ignite.ssl.SslContextFactory" factory-method="getDisabledTrustManager"/>
     </property>
    </bean>
  </property>
</bean>
```
Java:
```java
IgniteConfiguration igniteCfg = new IgniteConfiguration();

SslContextFactory factory = new SslContextFactory();

factory.setKeyStoreFilePath("keystore/server.jks");
factory.setKeyStorePassword("123456".toCharArray());
factory.setTrustManagers(SslContextFactory.getDisabledTrustManager());

igniteCfg.setSslContextFactory(factory);
```
如果配置了安全，那么日志就会包括：`communication encrypted=on`
```
INFO: Security status [authentication=off, communication encrypted=on]
```
### 4.1.2.SSL和TLS
Ignite允许使用不同的加密类型，支持的加密算法可以参照：[http://docs.oracle.com/javase/7/docs/technotes/guides/security/StandardNames.html#SSLContext](http://docs.oracle.com/javase/7/docs/technotes/guides/security/StandardNames.html#SSLContext),可以通过`setProtocol()`方法进行设置，默认值是`TLS`。
XML：
```xml
<bean id="cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="sslContextFactory">
    <bean class="org.apache.ignite.ssl.SslContextFactory">
      <property name="protocol" value="SSL"/>
      ...
    </bean>
  </property>
  ...
</bean>
```
Java：
```java
IgniteConfiguration igniteCfg = new IgniteConfiguration();

SslContextFactory factory = new SslContextFactory();

...

factory.setProtocol("TLS");

igniteCfg.setSslContextFactory(factory);
```
### 4.1.3.配置
下面的配置参数可以通过`SslContextFactory`进行配置：
|setter方法|描述|默认值|
|---|---|---|
|setKeyAlgorithm|设置key管理器算法，用于创建key管理器。注意，大多数情况下默认值即可，但是在Android平台需要设置成`X509`.|SunX509|
|setKeyStoreFilePath|keystore文件路径，该参数为必须参数，否则SSL上下文无法初始化|无|
|setKeyStorePassword|keystore密码|无|
|setKeyStoreType|用于上下文初始化的keystore类型|JKS|
|setProtocol|安全传输协议|TLS|
|setTrustStoreFilePath|truststore文件路径|无|
|setTrustStorePassword|truststore密码|无|
|setTrustStoreType|用于上下文初始化的truststore类型|JKS|
|setTrustManagers|设置配置好的信任管理器|无|

## 4.2.高级安全
### 4.2.1.认证
通过在服务端开启认证和提供用户凭据来保护集群。目前，只有**打开持久化**才会支持认证，这个限制未来可能放宽。
**开启认证**
要打开服务端认证，可以配置`IgniteConfiguration`的`authenticationEnabled`属性为`true`，比如：
XML：
```xml
<bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
    <!-- Enabling Apache Ignite Persistent Store. -->
    <property name="dataStorageConfiguration">
        <bean class="org.apache.ignite.configuration.DataStorageConfiguration">
            <property name="defaultDataRegionConfiguration">
                <bean class="org.apache.ignite.configuration.DataRegionConfiguration">
                    <property name="persistenceEnabled" value="true"/>
                </bean>
            </property>
        </bean>
    </property>

    <!-- Enabling authentication. -->
    <property name="authenticationEnabled" value="true"/>
   
  <!-- Other Ignite configurations. -->
  ...
    
</bean>
```
Java：
```java
// Apache Ignite node configuration.
IgniteConfiguration cfg = new IgniteConfiguration();

// Ignite persistence configuration.
DataStorageConfiguration storageCfg = new DataStorageConfiguration();

// Enabling the persistence.
storageCfg.getDefaultDataRegionConfiguration().setPersistenceEnabled(true);

// Applying settings.
cfg.setDataStorageConfiguration(storageCfg);

// Enable authentication
cfg.setAuthenticationEnabled(true);

// Other configurations
...
```
**提供用户凭据**
打开认证之后，Ignite会在集群第一次启动时创建名为`ignite`的超级用户，密码为`ignite`。目前，无法对超级用户改名，也无法将它的权限授予其它用户，但是，可以使用Ignite支持的DDL语句，对用户进行创建、修改和删除，注意，只有超级用户才能创建新的用户。
### 4.2.2.授权
Ignite还无法方便地提供授权功能，但是对于这样的高级安全特性，可以通过自定义插件的形式，实现`GridSecurityProcessor`接口，或者也可以使用一个第三方的[实现](https://docs.gridgain.com/docs/security-and-audit)。
## 4.3.数据反序列化安全性
如果攻击者找到办法可以将恶意代码植入集群节点的类路径中，那么数据的序列化是会受到影响的，解决这个问题的常规做法是保护对集群的访问，并且将访问权限授予有限的人群。
但是如果攻击者突破了防护，Ignite还提供了`IGNITE_MARSHALLER_WHITELIST`和`IGNITE_MARSHALLER_BLACKLIST`这两个系统属性，这两个属性可以定义用于安全反序列化的白名单/黑名单。
### 4.3.1.IGNITE_MARSHALLER_WHITELIST
要使用`IGNITE_MARSHALLER_WHITELIST`，可以创建一个包含允许反序列化的文件清单的文件，比如有一个名为whitelist.txt的文件，内容如下：
```
ignite.myexamples.model.Address
ignite.myexamples.model.Person
...
```
然后，在运行时配置系统属性：
VM参数：
```
-DIGNITE_MARSHALLER_WHITELIST=path/to/whitelist.txt
```
Java：
```java
System.setProperty(IGNITE_MARSHALLER_WHITELIST, "Path/to/whitelist.txt");
```
注意要将`Path/to/whitelist.txt`替换为白名单文件的实际路径。
如果使用了`IGNITE_MARSHALLER_WHITELIST`系统属性，试图反序列化的文件如果不在白名单中，就会抛出异常。
```
Exception in thread "main" javax.cache.CacheException: class org.apache.ignite.IgniteCheckedException: Deserialization of class ignite.myexamples.model.Organization is disallowed.
```
### 4.3.2.IGNITE_MARSHALLER_BLACKLIST
要使用`IGNITE_MARSHALLER_BLACKLIST`，可以创建一个包含不允许反序列化的文件清单的文件，比如有一个名为blacklist.txt的文件，内容如下：
```
ignite.myexamples.model.SomeFile
ignite.myexamples.model.SomeOtherFile
...
```
然后，在运行时配置系统属性：
VM参数：
```
-DIGNITE_MARSHALLER_BLACKLIST=path/to/blacklist.txt
```
Java：
```java
System.setProperty(IGNITE_MARSHALLER_BLACKLIST, "Path/to/blacklist.txt");
```
注意要将`Path/to/blacklist.txt`替换为黑名单文件的实际路径。
如果使用了`IGNITE_MARSHALLER_BLACKLIST`系统属性，试图反序列化的文件如果在黑名单中，就会抛出异常。
```
Exception in thread "main" javax.cache.CacheException: class org.apache.ignite.IgniteCheckedException: Deserialization of class ignite.myexamples.model.SomeOtherFile is disallowed.
```
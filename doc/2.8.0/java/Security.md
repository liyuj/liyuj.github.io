# 安全
## 1.SSL和TLS
### 1.1.保护节点间的连接
Ignite允许在所有节点之间使用SSL Socket进行通信。要使用SSL，需要设置`Factory<SSLContext>`以及配置Ignite配置文件的`SSL`段落，Ignite提供了一个默认的SSL上下文工厂，`org.apache.ignite.ssl.SslContextFactory`，它用一个配置好的keystore来初始化SSL上下文。

<Tabs>
<Tab title="XML">

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
</Tab>

<Tab title="Java">

```java
IgniteConfiguration igniteCfg = new IgniteConfiguration();

SslContextFactory factory = new SslContextFactory();

factory.setKeyStoreFilePath("keystore/server.jks");
factory.setKeyStorePassword("123456".toCharArray());
factory.setTrustStoreFilePath("keystore/trust.jks");
factory.setTrustStorePassword("123456".toCharArray());

igniteCfg.setSslContextFactory(factory);
```
</Tab>

</Tabs>

某些情况下需要禁用客户端侧的证书认证（比如连接到一个自签名的服务器时），这可以通过给上述工厂设置禁用信任管理器实现，它可以通过`getDisabledTrustManager`获得。

<Tabs>
<Tab title="XML">

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
</Tab>

<Tab title="Java">

```java
IgniteConfiguration igniteCfg = new IgniteConfiguration();

SslContextFactory factory = new SslContextFactory();

factory.setKeyStoreFilePath("keystore/server.jks");
factory.setKeyStorePassword("123456".toCharArray());
factory.setTrustManagers(SslContextFactory.getDisabledTrustManager());

igniteCfg.setSslContextFactory(factory);
```
</Tab>

</Tabs>

如果配置了安全，那么日志就会包括：`communication encrypted=on`
```
INFO: Security status [authentication=off, communication encrypted=on]
```

### 1.2.SSL和TLS
Ignite允许使用不同的加密类型，支持的加密算法可以参照：[http://docs.oracle.com/javase/7/docs/technotes/guides/security/StandardNames.html#SSLContext](http://docs.oracle.com/javase/7/docs/technotes/guides/security/StandardNames.html#SSLContext),可以通过`setProtocol()`方法进行设置，默认值是`TLS`。

<Tabs>
<Tab title="XML">

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
</Tab>

<Tab title="Java">

```java
IgniteConfiguration igniteCfg = new IgniteConfiguration();

SslContextFactory factory = new SslContextFactory();

...

factory.setProtocol("TLS");

igniteCfg.setSslContextFactory(factory);
```
</Tab>

</Tabs>

### 1.3.升级证书
如果使用的是TLS/SSL，并且证书即将过期，则可以在不关闭集群的情况下安装新证书。

如果可以使用现有信任库读取新证书，则可以一个个地停止集群节点，然后再启动就会使用新的证书。

否则，首先必须将信任库一个个地推送到所有节点，过渡期间，它将同时信任新证书和旧证书。
### 1.4.配置
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

## 2.高级安全
### 2.1.认证
可以通过在服务端开启认证以及在客户端提供用户凭据来保护集群。目前，只有**打开持久化**才会支持认证，这个限制未来可能放宽。
::: tip 注意
这个认证机制只适用于瘦客户端/JDBC/ODBC连接。
:::

**开启认证**

要打开服务端认证，可以配置`IgniteConfiguration`的`authenticationEnabled`属性为`true`，比如：

<Tabs>
<Tab title="XML">

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
</Tab>

<Tab title="Java">

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
</Tab>

</Tabs>

**提供用户凭据**

打开认证之后，Ignite会在集群第一次启动时创建名为`ignite`的超级用户，密码为`ignite`。目前，无法对超级用户改名，也无法将它的权限授予其它用户，但是，可以使用Ignite支持的[DDL语句](/doc/2.8.0/sql/SQLReference.md#_2-数据定义语言（ddl）)，对用户进行[创建](/doc/2.8.0/sql/SQLReference.md#_2-6-create-user)、[修改](/doc/2.8.0/sql/SQLReference.md#_2-7-alter-user)和[删除](/doc/2.8.0/sql/SQLReference.md#_2-8-drop-user)，注意，只有超级用户才能创建新的用户。
### 2.2.授权
Ignite还无法直接提供授权功能，但是对于这样的高级安全特性，可以实现`GridSecurityProcessor`接口，然后将其作为[自定义插件](/doc/2.8.0/java/Plugins.md)的一部分，或者也可以使用一个第三方的[实现](https://www.gridgain.com/docs/latest/administrators-guide/security)。
## 3.数据反序列化安全性
如果攻击者找到办法可以将恶意代码植入集群节点的类路径中，那么数据的序列化是会受到影响的，解决这个问题的常规做法是保护对集群的访问，并且将访问权限授予有限的人群。

但是如果攻击者突破了防护，Ignite还提供了`IGNITE_MARSHALLER_WHITELIST`和`IGNITE_MARSHALLER_BLACKLIST`这两个系统属性，这两个属性可以定义用于允许/不允许安全反序列化的类列表。
### 3.1.IGNITE_MARSHALLER_WHITELIST
要使用`IGNITE_MARSHALLER_WHITELIST`，可以创建一个包含允许反序列化的文件清单的文件，比如有一个名为whitelist.txt的文件，内容如下：
```
ignite.myexamples.model.Address
ignite.myexamples.model.Person
...
```
然后，在运行时配置系统属性：

<Tabs>
<Tab title="VM参数">

```properties
-DIGNITE_MARSHALLER_WHITELIST=path/to/whitelist.txt
```
</Tab>

<Tab title="Java">

```java
System.setProperty(IGNITE_MARSHALLER_WHITELIST, "Path/to/whitelist.txt");
```
</Tab>

</Tabs>

注意要将`Path/to/whitelist.txt`替换为白名单文件的实际路径。

如果使用了`IGNITE_MARSHALLER_WHITELIST`系统属性，试图反序列化的文件如果不在白名单中，就会抛出异常。
```
Exception in thread "main" javax.cache.CacheException: class org.apache.ignite.IgniteCheckedException: Deserialization of class ignite.myexamples.model.Organization is disallowed.
```
### 3.2.IGNITE_MARSHALLER_BLACKLIST
要使用`IGNITE_MARSHALLER_BLACKLIST`，可以创建一个包含不允许反序列化的文件清单的文件，比如有一个名为blacklist.txt的文件，内容如下：
```
ignite.myexamples.model.SomeFile
ignite.myexamples.model.SomeOtherFile
...
```
然后，在运行时配置系统属性：

<Tabs>
<Tab title="VM参数">

```
-DIGNITE_MARSHALLER_BLACKLIST=path/to/blacklist.txt
```
</Tab>

<Tab title="Java">

```java
System.setProperty(IGNITE_MARSHALLER_BLACKLIST, "Path/to/blacklist.txt");
```
</Tab>

</Tabs>

注意要将`Path/to/blacklist.txt`替换为黑名单文件的实际路径。

如果使用了`IGNITE_MARSHALLER_BLACKLIST`系统属性，试图反序列化的文件如果在黑名单中，就会抛出异常。
```
Exception in thread "main" javax.cache.CacheException: class org.apache.ignite.IgniteCheckedException: Deserialization of class ignite.myexamples.model.SomeOtherFile is disallowed.
```
## 4.透明数据加密
### 4.1.概述
Ignite从2.7版本开始，引入了透明数据加密（TDE），使得开发者可以对数据进行加密。

如果开启了Ignite的原生持久化，加密可以在表/缓存级开启，其中下面的数据会被加密：

 - 磁盘上的数据；
 - WAL记录

如果开启了表/缓存级加密，Ignite会生成一个密钥（叫做*缓存加密密钥*），然后使用这个密钥来对缓存的数据进行加密/解密。缓存加密密钥由系统缓存持有，并且用户无法访问。如果该密钥需要发送到其它节点或者保存到磁盘（节点停止），它会使用用户提供的密钥（主密钥）进行加密。

每个服务端节点中的配置都要指定相同的主密钥，为了保证这一点，一种方法是将JKS文件从一个节点复制到其他节点。如果尝试使用不同的密钥启用TDE，则具有不同密钥的节点将无法加入集群（摘要不同，该节点会被拒绝）。

Ignite使用的是JDK提供的加密算法，`AES/CBC/PKCS5Padding`用于WAL记录的加密，`AES/CBC/NoPadding`用于加密磁盘上的数据页面，要了解更多实现的细节，可以看[KeystoreEncryptionSpi](https://github.com/apache/ignite/blob/master/modules/core/src/main/java/org/apache/ignite/spi/encryption/keystore/KeystoreEncryptionSpi.java)。
### 4.2.配置
要开启集群的加密功能，需要在每个服务端节点的配置中提供一个主密钥，配置示例如下：

<Tabs>
<Tab title="XML">

```xml
<bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
    <!-- We need to configure EncryptionSpi to enable encryption feature. -->
    <property name="encryptionSpi">
        <!-- Using EncryptionSpi implementation based on java keystore. -->
        <bean class="org.apache.ignite.spi.encryption.keystore.KeystoreEncryptionSpi">
            <!-- Path to the keystore file. -->
            <property name="keyStorePath" value="ignite_keystore.jks" />
            <!-- Password for keystore file. -->
            <property name="keyStorePassword" value="mypassw0rd" />
            <!-- Name of the key in keystore to be used as a master key. -->
            <property name="masterKeyName" value="ignite.master.key" />
            <!-- Size of the cache encryption keys in bits. Can be 128, 192, or 256 bits.-->
            <property name="keySize" value="256" />
        </bean>
    </property>
    <!-- rest of configuration -->
</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration(“encrypted-instance”);

KeystoreEncryptionSpi encSpi = new KeystoreEncryptionSpi();

encSpi.setKeyStorePath("/home/user/ignite-keystore.jks”);
encSpi.setKeyStorePassword("secret");

cfg.setEncryptionSpi(encSpi);
```
</Tab>

</Tabs>

配置好主密钥后，就可以向下面这样为每个缓存开启加密了：

<Tabs>
<Tab title="XML">

```xml
<bean id="cache.cfg"
      class="org.apache.ignite.configuration.CacheConfiguration">
    <property name="name" value="encrypted-cache"/>
    <property name="encryptionEnabled" value="true"/>
</bean>
```
</Tab>

<Tab title="Java">

```java
CacheConfiguration<Long, String> ccfg = new CacheConfiguration<Long, String>("encrypted-cache");

ccfg.setEncryptionEnabled(true);

ignite.createCache(ccfg);
```
</Tab>

<Tab title="SQL">

```sql
CREATE TABLE encrypted(
  ID BIGINT,
  NAME VARCHAR(10),
  PRIMARY KEY (ID))
WITH "ENCRYPTED=true";
```
</Tab>

</Tabs>

### 4.3.主密钥生成示例
带有主密钥的密钥存储库可以使用`keytool`来生成，如下：
```bash
user:~/tmp:[]$ java -version
java version "1.8.0_161"
Java(TM) SE Runtime Environment (build 1.8.0_161-b12)
Java HotSpot(TM) 64-Bit Server VM (build 25.161-b12, mixed mode)

user:~/tmp:[]$ keytool -genseckey \
-alias ignite.master.key \
-keystore ./ignite_keystore.jks \
-storetype PKCS12 \
-keyalg aes \
-storepass mypassw0rd \
-keysize 256

user:~/tmp:[]$ keytool \
-storepass mypassw0rd \
-storetype PKCS12 \
-keystore ./ignite_keystore.jks \
-list

Keystore type: PKCS12
Keystore provider: SunJSSE

Your keystore contains 1 entry

ignite.master.key, 07.11.2018, SecretKeyEntry,
```
### 4.4.代码示例

 - [EncryptedCacheExample.java](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/encryption/EncryptedCacheExample.java)

<RightPane/>
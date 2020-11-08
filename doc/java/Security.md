# 安全
## 1.认证
### 1.1.Ignite认证
通过将节点配置中的`authenticationEnabled`属性配置为`true`，可以开启Ignite的认证功能。但是开启认证需要至少一个数据区开启了[持久化存储](/doc/java/Persistence.md#_1-ignite持久化)。

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="dataStorageConfiguration">
        <bean class="org.apache.ignite.configuration.DataStorageConfiguration">
            <property name="defaultDataRegionConfiguration">
                <bean class="org.apache.ignite.configuration.DataRegionConfiguration">
                    <property name="persistenceEnabled" value="true"/>
                </bean>
            </property>
        </bean>
    </property>

   <property name="authenticationEnabled" value="true"/>

</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration cfg = new IgniteConfiguration();

// Ignite persistence configuration.
DataStorageConfiguration storageCfg = new DataStorageConfiguration();

// Enabling the persistence.
storageCfg.getDefaultDataRegionConfiguration().setPersistenceEnabled(true);

// Applying settings.
cfg.setDataStorageConfiguration(storageCfg);

// Enable authentication
cfg.setAuthenticationEnabled(true);

Ignite ignite = Ignition.start(cfg);
```
</Tab>
</Tabs>

启动的第一个节点必须启用身份认证。启动时，Ignite会创建一个名为`ignite`和密码为`ignite`的账户，该账户可用于创建其他账户。

可以使用下面的命令管理用户：

 - [CREATE USER](/doc/java/SQLReference.md#_2-6-create-user)；
 - [ALTER USER](/doc/java/SQLReference.md#_2-7-alter-user)；
 - [DROP USER](/doc/java/SQLReference.md#_2-8-drop-user)。

### 1.2.在客户端中提供凭据
当在集群中配置认证后，所有的客户端都需要提供用户凭据，对于特定的客户端，请参见下面章节的介绍：

- [瘦客户端](/doc/java/ThinClients.md#_1-2-3-认证)；
- [JDBC驱动](/doc/java/WorkingwithSQL.md#_8-1-1-参数)；
- [ODBC驱动](/doc/java/WorkingwithSQL.md#_10-2-2-支持的参数)；
- [REST API](/doc/java/RESTAPI.md#_1-2-安全)。

## 2.SSL/TLS
本章节说明如何在集群节点之间（服务端和客户端节点）与接入集群的瘦客户端之间配置SSL/TLS加密。
### 2.1.注意事项
为了确保足够的安全性，建议每个节点（服务端或客户端）在节点的密钥库（包括私钥）中都有自己的唯一证书。所有其他服务端节点都必须信任此证书。
### 2.2.节点的SSL/TLS
要为集群节点启用SSL/TLS，需要在节点配置中配置`SSLContext`工厂。可以使用默认的工厂类`org.apache.ignite.ssl.SslContextFactory`，该工厂使用可配置的密钥库初始化SSL上下文。

以下是`SslContextFactory`配置示例：

<Tabs>
<Tab title="XML">

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

    <property name="sslContextFactory">
        <bean class="org.apache.ignite.ssl.SslContextFactory">
            <property name="keyStoreFilePath" value="keystore/node.jks"/>
            <property name="keyStorePassword" value="123456"/>
            <property name="trustStoreFilePath" value="keystore/trust.jks"/>
            <property name="trustStorePassword" value="123456"/>
            <property name="protocol" value="TLSv1.3"/>
        </bean>
    </property>

</bean>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration igniteCfg = new IgniteConfiguration();

SslContextFactory factory = new SslContextFactory();

factory.setKeyStoreFilePath("keystore/node.jks");
factory.setKeyStorePassword("123456".toCharArray());
factory.setTrustStoreFilePath("keystore/trust.jks");
factory.setTrustStorePassword("123456".toCharArray());
factory.setProtocol("TLSv1.3");

igniteCfg.setSslContextFactory(factory);
```
</Tab>
</Tabs>

密钥库必须包含节点的证书，包括其私钥。信任库必须包含所有其他集群节点的信任证书。

可以定义其他的属性，例如密钥算法，密钥存储类型或信任管理器，具体请参见[SslContextFactory属性](#_2-6-sslcontextfactory属性)章节的介绍。

启动节点后，应该在日志中看到以下消息：
```
Security status [authentication=off, tls/ssl=on]
```
### 2.3.瘦客户端和JDBC/ODBC的SSL/TLS
Ignite对所有客户端（包括瘦客户端和JDBC/ODBC连接）使用相同的SSL/TLS属性，这些属性是在客户端连接器配置中配置的。客户端连接器配置是通过`IgniteConfiguration.clientConnectorConfiguration`属性定义的。

要为客户端连接启用SSL/TLS，需要将`sslEnabled`属性设置为`true`并在客户端连接器配置中提供`SslContextFactory`。节点配置的`SSLContextFactory`可以重用，也可以配置仅用于客户端连接的`SSLContext`工厂。

然后，以相同方式在客户端上配置SSL，具体请参见特定客户端的文档。

下面是在客户端连接设置中配置`SslContextFactory`的示例：

<Tabs>
<Tab title="XML">

```xml
<property name="clientConnectorConfiguration">
    <bean class="org.apache.ignite.configuration.ClientConnectorConfiguration">
        <property name="sslEnabled" value="true"/>
        <property name="useIgniteSslContextFactory" value="false"/>
        <property name="sslContextFactory">
            <bean class="org.apache.ignite.ssl.SslContextFactory">
                <property name="keyStoreFilePath" value="/path/to/server.jks"/>
                <property name="keyStorePassword" value="123456"/>
                <property name="trustStoreFilePath" value="/path/to/trust.jks"/>
                <property name="trustStorePassword" value="123456"/>
            </bean>
        </property>
    </bean>
</property>
```
</Tab>

<Tab title="Java">

```java
IgniteConfiguration igniteCfg = new IgniteConfiguration();

ClientConnectorConfiguration clientCfg = new ClientConnectorConfiguration();
clientCfg.setSslEnabled(true);
clientCfg.setUseIgniteSslContextFactory(false);
SslContextFactory sslContextFactory = new SslContextFactory();
sslContextFactory.setKeyStoreFilePath("/path/to/server.jks");
sslContextFactory.setKeyStorePassword("123456".toCharArray());

sslContextFactory.setTrustStoreFilePath("/path/to/trust.jks");
sslContextFactory.setTrustStorePassword("123456".toCharArray());

clientCfg.setSslContextFactory(sslContextFactory);

igniteCfg.setClientConnectorConfiguration(clientCfg);
```
</Tab>

<Tab title="C#/.NET">

```csharp
var cfg = new IgniteClientConfiguration
{
    Endpoints = new[] {"127.0.0.1:10800"},
    SslStreamFactory = new SslStreamFactory
    {
        CertificatePath = ".../certs/client.pfx",
        CertificatePassword = "password",
    }
};
using (var client = Ignition.StartClient(cfg))
{
    //...
}
```
</Tab>
</Tabs>

如果要重用为节点配置的`SSLContext`工厂，则只需将`sslEnabled`属性设置为`true`，`ClientConnectorConfiguration`会在`IgniteConfiguration`中查找`SSLContext`配置：

<Tabs>
<Tab title="XML">

```xml
SSLContext

<property name="clientConnectorConfiguration">
    <bean class="org.apache.ignite.configuration.ClientConnectorConfiguration">
        <property name="sslEnabled" value="true"/>
    </bean>
</property>
```
</Tab>

<Tab title="Java">

```java
ClientConnectorConfiguration clientConnectionCfg = new ClientConnectorConfiguration();
clientConnectionCfg.setSslEnabled(true);
```
</Tab>
</Tabs>

### 2.4.禁用证书验证
某些情况下需要禁用证书认证（比如连接到一个自签名的服务器时），这可以通过使用禁用的信任管理器实现，它可以通过`SslContextFactory.getDisabledTrustManager`获得。

<Tabs>
<Tab title="XML">

```xml
SslContextFactory

<bean class="org.apache.ignite.configuration.IgniteConfiguration">

    <property name="sslContextFactory">
        <bean class="org.apache.ignite.ssl.SslContextFactory">
            <property name="keyStoreFilePath" value="keystore/node.jks"/>
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

factory.setKeyStoreFilePath("keystore/node.jks");
factory.setKeyStorePassword("123456".toCharArray());
factory.setTrustManagers(SslContextFactory.getDisabledTrustManager());

igniteCfg.setSslContextFactory(factory);
```
</Tab>
</Tabs>

### 2.5.升级证书
如果SSL证书即将过期或已被破坏，则可以在不关闭整个集群的情况下安装新证书。

以下是更新证书的过程：

 1. 首先，确保所有集群节点都信任新证书。如果信任库包含根证书，并且新证书由同一CA签发，则可能不需要此步骤。对不信任证书的节点重复以下过程：

    a.将新证书导入节点的信任库；
    b.正常重启节点；
    c.对所有服务端节点重复这些步骤。

 2. 将新证书（包括私钥）导入到相应节点的密钥库中，删除旧证书后正常重启节点，对要更新的所有证书重复此过程。

### 2.6.SslContextFactory属性
`SslContextFactory`支持如下的属性：

|属性|描述|默认值|
|---|---|---|
|`keyAlgorithm`|设置密钥管理器算法，用于创建密钥管理器。|`SunX509`|
|`keyStoreFilePath`|密钥库文件路径，该参数为必须参数，否则SSL上下文没有密钥管理器无法初始化|无|
|`keyStorePassword`|密钥库密码|无|
|`keyStoreType`|密钥库类型|`JKS`|
|`protocol`|安全传输协议，支持的协议见[这里](https://docs.oracle.com/en/java/javase/11/docs/specs/security/standard-names.html#sslcontext-algorithms)|`TLS`|
|`trustStoreFilePath`|信任库文件路径|无|
|`trustStorePassword`|信任库密码|无|
|`trustStoreType`|信任库类型|`JKS`|
|`trustManagers`|配置好的信任管理器|无|

## 3.透明数据加密
### 3.1.介绍
::: danger 警告
本特性还处于测试阶段，不建议用于生产环境。
:::
#### 3.1.1.概述
透明数据加密（TDE）使得用户可以对静态数据进行加密。

如果开启了[Ignite的原生持久化](/doc/java/Persistence.md#_1-ignite持久化)，加密可以在表/缓存级开启，其中下面的数据会被加密：

 - 磁盘上的数据；
 - WAL记录。

如果开启了表/缓存级加密，Ignite会生成一个密钥（叫做*缓存加密密钥*），然后使用这个密钥来对缓存的数据进行加密/解密。缓存加密密钥由系统缓存持有，并且用户无法访问。如果该密钥需要发送到其它节点或者保存到磁盘（节点停止），它会使用用户提供的密钥（主密钥）进行加密。

每个服务端节点中的配置都要指定相同的主密钥，为了保证这一点，一种方法是将JKS文件从一个节点复制到其他节点。如果尝试使用不同的密钥启用TDE，则具有不同密钥的节点将无法加入集群（摘要不同，该节点会被拒绝）。

Ignite使用的是JDK提供的加密算法，`AES/CBC/PKCS5Padding`用于WAL记录的加密，`AES/CBC/NoPadding`用于加密磁盘上的数据页面，要了解更多实现的细节，可以看[KeystoreEncryptionSpi](https://github.com/apache/ignite/blob/master/modules/core/src/main/java/org/apache/ignite/spi/encryption/keystore/KeystoreEncryptionSpi.java)。
#### 3.1.2.限制
在上生产之前，TDE有一些限制需要了解：

**加密**

 - 加密密钥运行时无法修改；
 - 无法对现有的缓存/表进行加密/解密。

**快照和恢复**

 - 不支持快照。快照不会被加密，也不可能从一个包含加密的缓存/表的快照中恢复。

#### 3.1.3.配置
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

#### 3.1.4.主密钥生成示例
带有主密钥的密钥存储库可以使用`keytool`工具来生成，如下：
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
#### 3.1.5.代码示例

 - [EncryptedCacheExample.java](https://github.com/apache/ignite/tree/master/examples/src/main/java/org/apache/ignite/examples/encryption/EncryptedCacheExample.java)

### 3.2.主密钥轮换
#### 3.2.1.概述
主密钥会对缓存键进行加密，加密的缓存键存储在磁盘上，具体参见上一章节的介绍。

Ignite 2.9引入了主密钥更改过程，这样用户就可以通过重新加密缓存键将Ignite切换到新的主密钥。

如果主密钥已被泄露或在加密期结束时（密钥有效期），则需要进行主密钥轮换。
#### 3.2.2.前提条件
每个服务端节点的`EncryptionSpi`都应持有新的主密钥，集群应处于激活状态。
#### 3.2.3.配置
主密钥通过名字进行标识，当集群第一次启动时，会使用配置中指定的主密钥名，具体请参见[TDE配置](#_3-1-3-配置)章节的介绍。

节点会在集群第一次激活以及每次主密码变更时把主密码名保存在磁盘上（本地`MetaStorage`），如果某个节点重启，他会从本地的`MetaStorage`中读取主密码名。
#### 3.2.4.变更主密码
::: tip 提示
在主密码更改过程中，将禁止缓存的启动和新节点的加入。
:::
Ignite的如下接口支持修改主密码：

 - 命令行工具；
 - JMX；
 - 编程方式。

##### 3.2.4.1.命令行工具
Ignite中位于`$IGNITE_HOME/bin`目录下的`control.sh|bat`脚本，可以从命令行对主密码的变更过程进行管理，见下面的命令：
```shell
# Print the current master key name.
control.sh|bat --encryption get_master_key_name

# Change the master key.
control.sh|bat --encryption change_master_key newMasterKeyName
```
##### 3.2.4.2.JMX
还可以通过`EncryptionMXBean`接口来管理主密码变更过程：

|方法|描述|
|---|---|
|getMasterKeyName()|获取当前主密码名|
|changeMasterKey(String masterKeyName)|开启主密码变更过程|

##### 3.2.4.3.编程方式
主密码变更过程也可以通过编程方式来管理：
```java
// Gets the current master key name.
String name = ignite.encryption().getMasterKeyName();

// Starts master key change process.
IgniteFuture<Void> future = ignite.encryption().changeMasterKey("newMasterKeyName");
```
#### 3.2.5.恢复故障节点的主密码
如果在主密钥更改过程中某个节点故障，它将无法使用旧的主密钥加入集群。在启动恢复期间，该节点应重新加密本地​​组密钥。实际的主密码名应在节点启动前通过系统属性`IGNITE_MASTER_KEY_NAME_TO_CHANGE_BEFORE_STARTUP`设置，当集群激活后，节点会将主密码名保存在本地的`MetaStorage`中。
::: tip 提示
建议在成功恢复后删除系统该属性。否则当节点重启时，可能会使用无效的主密钥名。
:::
#### 3.2.6.附加的主密钥生成示例
Ignite根据JDK提供的加密算法实现提供了`KeystoreEncryptionSpi`，具体请参见[密钥库主密码生成示例](#_3-1-4-主密钥生成示例)，使用`keytool`还可以生成一个附加的主密钥，示例如下：
```shell
user:~/tmp:[]$ keytool \
-storepass mypassw0rd \
-storetype PKCS12 \
-keystore ./ignite_keystore.jks \
-list

Keystore type: PKCS12
Keystore provider: SunJSSE

Your keystore contains 1 entry

ignite.master.key, 15.01.2019, SecretKeyEntry,


user:~/tmp:[]$ keytool -genseckey \
-alias ignite.master.key2 \
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

Your keystore contains 2 entries

ignite.master.key, 15.01.2019, SecretKeyEntry,
ignite.master.key2, 15.01.2019, SecretKeyEntry,
```
## 4.沙箱
### 4.1.概述
Ignite可以通过各种API（包括计算任务、事件过滤器、消息监听器等）执行自定义逻辑。这种用户定义的逻辑可以利用Java API来访问主机资源。例如，它可以创建/更新/删除文件或系统属性、打开网络连接、使用反射和其他API来完全控制主机环境。Ignite沙箱基于[Java沙箱模型](https://docs.oracle.com/en/java/javase/11/security/java-se-platform-security-architecture.html#GUID-C203D80F-C730-45C3-AB95-D4E61FD6D89C)，可以限制通过Ignite API执行的用户定义逻辑的范围。
### 4.2.激活Ignite沙箱
Ignite沙箱的激活涉及`SecurityManager`实例的配置和`GridSecurityProcessor`实现的创建。
#### 4.2.1.安装SecurityManager
因为Ignite沙箱基于Java沙箱模型，而[SecurityManager](https://docs.oracle.com/javase/8/docs/technotes/guides/security/spec/security-spec.doc6.html#a19349)是该模型的重要组成部分，因此需要安装它。`SecurityManager`负责检查当前有效的安全策略，还会执行访问控制检查。应用运行时不会自动安装安全管理器，如果将Ignite作为单独的应用运行，则必须使用`-Djava.security.manager`命令行参数（设置`java.security.manager`属性的值）调用Java虚拟机。还有一个`-Djava.security.policy`命令行参数，用于定义使用哪些策略文件，如果在命令行中未指定`-Djava.security.policy`，那么将使用安全属性文件中指定的策略文件。
::: tip 提示
将安全管理器和策略命令行参数添加到`{IGNITE-HOME}/bin/ignite.sh|ignite.bat`脚本中可能会很方便。
:::
::: tip 提示
Ignite应该具有足够的权限才能正常运行，最直接的方法是给Ignite赋予`java.security.AllPermission`权限，但是应记住“给予尽可能低的权限”的安全原则。
:::
#### 4.2.2.提供GridSecurityProcessor实现
当前Ignite未提供现成的`GridSecurityProcessor`接口实现，但是可以自定义开发该接口的实现并作为[自定义插件](/doc/java/Plugins.md)的一部分。

该`GridSecurityProcessor`接口有一个`sandboxEnabled`方法，可用于管理Ignite沙箱内部用户定义代码的执行。该方法默认返回`false`，表示没有沙箱。如果要使用Ignite沙箱，则需要覆写`sandboxEnabled`方法并返回`true`。

如果启用了Ignite沙箱，则可以看到以下信息：
```
[INFO] Security status [authentication=on, sandbox=on, tls/ssl=off]
```
### 4.3.权限
用户定义的代码总是代表启动其执行的安全主体执行。安全主体的沙盒权限定义用户代码可以执行的操作。Ignite沙箱使用`SecuritySubject#sandboxPermissions`方法获取这些权限。
::: tip 提示
用户定义的代码在Ignite沙箱中运行时，可以使用Ignite的公共API，而无需授予任何其他权限。
:::
如果安全主体没有足够的权限来执行对安全性敏感的操作，则会抛出`AcccessControlException`：
```java
// Get compute instance over all nodes in the cluster.
IgniteCompute compute = Ignition.ignite().compute();

compute.broadcast(() -> {
    // If the Ignite Sandbox is turned on, the lambda code is executed with restrictions.

    // You can use the public API of Ignite without granting any permissions.
    Ignition.localIgnite().cache("some.cache").get("key");

    // If the current security subject doesn't have the java.util.PropertyPermission("secret.property", "read") permission,
    // a java.security.AccessControlException appears here.
    System.getProperty("secret.property");
});
```
如果要访问上面片段中显示的系统属性，则可以看到以下带有异常的输出：
```
java.security.AccessControlException: access denied ("java.util.PropertyPermission" "secret.property" "read")
```

<RightPane/>
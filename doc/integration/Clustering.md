# 2.集群发现
## 2.1.Amazon AWS发现
### 2.1.1.摘要
AWS云上的节点发现通常认为很有挑战性。Amazon EC2，和其他大部分的虚拟环境一样，有如下的限制：

 - 组播被禁用
 - 每次新的映像启动时TCP地址会发生变化

虽然在没有组播时可以使用基于TCP的发现，但是不得不处理不断变换的IP地址以及不断更新配置。这产生了一个主要的不便之处以至于在这种环境下基于静态IP的配置实质上变得不可用。
为了缓解不断变化的IP地址问题，Ignite通过利用[Amazon S3](https://aws.amazon.com/s3/)存储或[Amazon ELB](https://aws.amazon.com/elasticloadbalancing/)支持节点自动发现。

### 2.1.2.基于Amazon S3的发现
基于Amazon S3的发现可以使节点在启动时在Amazon S3存储上注册它们的IP地址，这样其它节点会尝试连接任意存储在S3上的IP地址然后发起网格节点的自动发现。至于使用，需要将`ipFinder`配置为`TcpDiscoveryS3IpFinder`。
注意，要将`libs/optional/ignite-aws`中的库文件添加到应用的类路径。
下面的例子显示了如何配置基于Amazon S3的IP探测器：
XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  ...
  <property name="discoverySpi">
    <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
      <property name="ipFinder">
        <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.s3.TcpDiscoveryS3IpFinder">
          <property name="awsCredentials" ref="aws.creds"/>
          <property name="bucketName" value="YOUR_BUCKET_NAME"/>
        </bean>
      </property>
    </bean>
  </property>
</bean>

<!-- AWS credentials. Provide your access key ID and secret access key. -->
<bean id="aws.creds" class="com.amazonaws.auth.BasicAWSCredentials">
  <constructor-arg value="YOUR_ACCESS_KEY_ID" />
  <constructor-arg value="YOUR_SECRET_ACCESS_KEY" />
</bean>
```
Java：
```java
TcpDiscoverySpi spi = new TcpDiscoverySpi();

BasicAWSCredentials creds = new BasicAWSCredentials("yourAccessKey", "yourSecreteKey");

TcpDiscoveryS3IpFinder ipFinder = new TcpDiscoveryS3IpFinder();
ipFinder.setAwsCredentials(creds);
ipFinder.setBucketName("yourBucketName");

spi.setIpFinder(ipFinder);

IgniteConfiguration cfg = new IgniteConfiguration();
 
// Override default discovery SPI.
cfg.setDiscoverySpi(spi);
 
// Start Ignite node.
Ignition.start(cfg);
```
### 2.1.3.基于Amazon ELB的发现
基于AWS ELB的IP探测器不需要节点注册它们的IP地址，该IP探测器会自动获取ELB中连接的所有节点的地址，然后使用它们接入集群。至于使用，需要将`ipFinder`配置为`TcpDiscoveryElbIpFinder`。
下面是如何配置基于AWS ELB的IP探测器的示例：
XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  ...
  <property name="discoverySpi">
    <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
      <property name="ipFinder">
        <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.elb.TcpDiscoveryElbIpFinder">
          <property name="credentialsProvider"> 
              <bean class="com.amazonaws.auth.AWSStaticCredentialsProvider">
                  <constructor-arg ref="aws.creds"/>
              </bean>
          </property>
          <property name="region" value="YOUR_ELB_REGION_NAME"/>
          <property name="loadBalancerName" value="YOUR_AWS_ELB_NAME"/>
        </bean>
      </property>
    </bean>
  </property>
</bean>

<!-- AWS credentials. Provide your access key ID and secret access key. -->
<bean id="aws.creds" class="com.amazonaws.auth.BasicAWSCredentials">
  <constructor-arg value="YOUR_ACCESS_KEY_ID" />
  <constructor-arg value="YOUR_SECRET_ACCESS_KEY" />
</bean>
```
Java：
```java
TcpDiscoverySpi spi = new TcpDiscoverySpi();

BasicAWSCredentials creds = new BasicAWSCredentials("yourAccessKey", "yourSecreteKey");

TcpDiscoveryElbIpFinder ipFinder = new TcpDiscoveryElbIpFinder();
ipFinder.setRegion("yourElbRegion");
ipFinder.setLoadBalancerName("yourLoadBalancerName");
ipFinder.setCredentialsProvider(new AWSStaticCredentialsProvider(creds));

spi.setIpFinder(ipFinder);

IgniteConfiguration cfg = new IgniteConfiguration();

// Override default discovery SPI.
cfg.setDiscoverySpi(spi);

// Start Ignite node.
Ignition.start(cfg);
```
>上面的两个方法可以只配置一次然后就可以在所有的EC2示例中复用。
## 2.2.Google计算发现
### 2.2.1.摘要
GCE上的节点发现通常认为很有挑战性。Google云，和其他大部分的虚拟环境一样，有如下的限制：

 - 组播被禁用
 - 每次新的映像启动时TCP地址会发生变化

虽然在没有组播时可以使用基于TCP的发现，但是不得不处理不断变换的IP地址以及不断更新配置。这产生了一个主要的不便之处以至于在这种环境下基于静态IP的配置实质上变得不可用。

### 2.2.2.基于Google云存储的发现
为了减轻不断变化的IP地址的问题，Ignite支持通过使用基于`TcpDiscoveryGoogleStorageIpFinder`的Google云存储来实现节点的自动发现。在启动时节点在存储上注册他们的IP地址，这样其他节点会试图连接任意保存在存储上的IP地址然后初始化网格节点的自动发现。

> 这个方法可以只配置一次就可以在所有的EC2实例上复用。

下面的例子显示了如何配置基于Google云存储的IP搜索器：
XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  ...
  <property name="discoverySpi">
    <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
      <property name="ipFinder">
        <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.gce.TcpDiscoveryGoogleStorageIpFinder">
          <property name="projectName" ref="YOUR_GOOGLE_PLATFORM_PROJECT_NAME"/>
          <property name="bucketName" value="YOUR_BUCKET_NAME"/>
          <property name="serviceAccountId" value="YOUR_SERVICE_ACCOUNT_ID"/>
          <property name="serviceAccountP12FilePath" value="PATH_TO_YOUR_PKCS12_KEY"/>
        </bean>
      </property>
    </bean>
  </property>
</bean>
```
Java：
```java
TcpDiscoverySpi spi = new TcpDiscoverySpi();
TcpDiscoveryGoogleStorageIpFinder ipFinder = new TcpDiscoveryGoogleStorageIpFinder();
ipFinder.setServiceAccountId(yourServiceAccountId);
ipFinder.setServiceAccountP12FilePath(pathToYourP12Key);
ipFinder.setProjectName(yourGoogleClourPlatformProjectName);
// Bucket name must be unique across the whole Google Cloud Platform.
ipFinder.setBucketName("your_bucket_name");
spi.setIpFinder(ipFinder);
IgniteConfiguration cfg = new IgniteConfiguration();
// Override default discovery SPI.
cfg.setDiscoverySpi(spi);
// Start Ignite node.
Ignition.start(cfg);
```

## 2.3.JCloud发现
### 2.3.1.摘要
云平台上的节点发现通常认为很有挑战性。因为JCloud，和其他大部分的虚拟环境一样，有如下的限制：

 - 组播被禁用
 - 每次新的映像启动时TCP地址会发生变化

虽然在没有组播时可以使用基于TCP的发现，但是不得不处理不断变换的IP地址以及不断更新配置。这产生了一个主要的不便之处以至于在这种环境下基于静态IP的配置实质上变得不可用。

### 2.3.2.基于Apache JCloud的发现
为了减轻不断变化的IP地址的问题，Ignite支持通过使用基于`TcpDiscoveryCloudIpFinder`的Apache jclouds工具包来实现节点的自动发现。要了解有关Apache JCloud的信息，请参照[jclouds.apache.org](https://jclouds.apache.org/)。
该IP搜索器形成节点地址，通过获取云上所有虚拟机的私有和共有IP地址以及给他们增加一个端口号使Ignite可以运行，该端口可以通过`TcpDiscoverySpi.setLocalPort(int)`或者`TcpDiscoverySpi.DFLT_PORT`进行设置，这样所有节点会连接任何生成的的IP地址然后发起网格节点的自动发现。
可以参考[Apache jclouds providers section](https://jclouds.apache.org/reference/providers/#compute)来获取他支持的云平台的列表。

> 所有虚拟机都要使用同一个端口启动Ignite实例，否则他们无法通过IP搜索器发现对方。

下面的例子显示了如何配置基于Apache JCloud的IP搜索器：
**XML：**
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  ...
  <property name="discoverySpi">
    <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
      <property name="ipFinder">
        <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.cloud.TcpDiscoveryCloudIpFinder">
          <!-- Configuration for Google Compute Engine. -->
          <property name="provider" value="google-compute-engine"/>
          <property name="identity" value="YOUR_SERVICE_ACCOUNT_EMAIL"/>
          <property name="credentialPath" value="PATH_YOUR_PEM_FILE"/>
          <property name="zones">
            <list>
              <value>us-central1-a</value>
              <value>asia-east1-a</value>
            </list>
          </property>
        </bean>
      </property>
    </bean>
  </property>
</bean>
```
**Java：**
```java
TcpDiscoverySpi spi = new TcpDiscoverySpi();
TcpDiscoveryCloudIpFinder ipFinder = new TcpDiscoveryCloudIpFinder();
// Configuration for AWS EC2.
ipFinder.setProvider("aws-ec2");
ipFinder.setIdentity(yourAccountId);
ipFinder.setCredential(yourAccountKey);
ipFinder.setRegions(Collections.<String>emptyList().add("us-east-1"));
ipFinder.setZones(Arrays.asList("us-east-1b", "us-east-1e"));
spi.setIpFinder(ipFinder);
IgniteConfiguration cfg = new IgniteConfiguration();
// Override default discovery SPI.
cfg.setDiscoverySpi(spi);
// Start Ignite node.
Ignition.start(cfg);
```
# 20.Kubernetes部署
## 20.1.Kubernetes部署
Ignite集群可以容易地在[Kubernetes](https://kubernetes.io/)环境中部署和维护，Kubernetes是一个开源的系统，可以自动化地部署、伸缩以及管理容器化的应用。

本文档会引导用户将Ignite部署进Kubernetes环境，还会涉及一些与Ignite有关的特殊性内容。

首先要确定Ignite的开发和使用方式：

 - 如果使用纯内存方式或者作为第三方数据库（RDBMS, NoSQL）的缓存层，那么需要遵照`无状态部署`的相关文档；
 - 如果Ignite作为内存数据库，并且开启了持久化，那么需要遵照`有状态部署`的相关文档。

如果希望将Kubernetes部署在具体的云环境中，那么需要参照下面的文档：

 - `Microsoft Azure部署`
 - `Google Cloud部署`
 - `AWS部署`

## 20.2.常规配置
### 20.2.1.无状态部署
如果使用纯内存方式或者作为第三方数据库（RDBMS, NoSQL）的缓存层，那么需要将其按照无状态的解决方案进行部署。
#### 20.2.1.1.要求
确保如下事项已经完成：

 - 环境中已经部署了Kubernetes集群；
 - 已经配置了RBAC授权；
 - 已经部署了Ignite服务；

#### 20.2.1.2.Kubernetes IP探测器
要开启Kubernetes环境下Ignite节点的自动发现，需要在`IgniteConfiguration`中启用`TcpDiscoveryKubernetesIpFinder`，下面会创建一个名为`example-kube-rbac.xml`的配置文件，然后像下面这样定义相关的配置：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:util="http://www.springframework.org/schema/util"
       xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/util
        http://www.springframework.org/schema/util/spring-util.xsd">

<bean class="org.apache.ignite.configuration.IgniteConfiguration">
  <property name="discoverySpi">
    <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
      <property name="ipFinder">
         <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.kubernetes.TcpDiscoveryKubernetesIpFinder">
           <property name="namespace" value="ignite"/>
         </bean>
      </property>
    </bean>
  </property>
</bean>
</beans>
```
下面，就可以为Ignite配置组准备一套Kubernetes环境然后部署了。
#### 20.2.1.3.Ignite配置组部署
最后，需要为Ignite配置组定义一个yaml格式配置文件。

ignite-deployment.yaml：
```yaml
# An example of a Kubernetes configuration for Ignite pods deployment.
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  # Custom Ignite cluster's name.
  name: ignite-cluster
spec:
  # A number of Ignite pods to be started by Kubernetes initially.
  replicas: 2
  template:
    metadata:
      labels:
        app: ignite
    spec:
      containers:
        # Custom Ignite pod name.
      - name: ignite-node
        image: apacheignite/ignite:2.5.0
        env:
        - name: OPTION_LIBS
          value: ignite-kubernetes
        - name: CONFIG_URI
          value: https://raw.githubusercontent.com/apache/ignite/master/modules/kubernetes/config/example-kube-persistence.xml
        ports:
        # Ports to open.
        # Might be optional depending on your Kubernetes environment.
        - containerPort: 11211 # REST port number.
        - containerPort: 47100 # communication SPI port number.
        - containerPort: 47500 # discovery SPI port number.
        - containerPort: 49112 # JMX port number.
        - containerPort: 10800 # SQL port number.
        - containerPort: 10900 # Thin clients port number.
```
如上所示，该配置定义了一组环境变量（`OPTION_LIBS`和`CONFIG_URIL`），Ignite的Docker镜像使用的一个shell脚本会用到它。Docker镜像的完整配置参数列表可以查看[Docker部署](/doc/java/Deployment.md#_2-docker部署)的相关章节。
::: tip Ignite Docker镜像版本
Kubernetes支持Ignite的1.9及其以后的版本，一定要使用有效的Docker镜像版本，完整的标签列表在[这里](https://hub.docker.com/r/apacheignite/ignite/tags)。
:::

下一步，在Kubernetes中使用上述的配置部署Ignite配置组：
```bash
kubectl create -f ignite-deployment.yaml
```
检查配置组是否启动运行：
```bash
kubectl get pods
```
选择一个可用的配置组的名字：
```
NAME                              READY     STATUS    RESTARTS   AGE
ignite-cluster-3454482164-d4m6g   1/1       Running   0          25m
ignite-cluster-3454482164-w0xtx   1/1       Running   0          25m
```
可以获取日志，确认配置组之间可以在集群内相互发现：
```bash
kubectl logs ignite-cluster-3454482164-d4m6g
```
#### 20.2.1.4.调整Ignite集群大小
可以使用标准的Kubernetes API随时调整Ignite集群的大小。比如，如果想把集群从2个节点扩容到5个节点，那么可以使用下面的命令：
```bash
kubectl scale --replicas=5 -f ignite-deployment.yaml
```
再次检查集群已经成功扩容：
```bash
kubectl get pods
```
输出会显示有5个配置组正在运行：
```
NAME                              READY     STATUS    RESTARTS   AGE
ignite-cluster-3454482164-d4m6g   1/1       Running   0          34m
ignite-cluster-3454482164-ktkrr   1/1       Running   0          58s
ignite-cluster-3454482164-r20f8   1/1       Running   0          58s
ignite-cluster-3454482164-vf8kh   1/1       Running   0          58s
ignite-cluster-3454482164-w0xtx   1/1       Running   0          34m
```
#### 20.2.1.5.在Microsoft Azone环境中部署
参照[Microsoft Azone环境部署](https://dzone.com/articles/deploying-apache-ignite-in-kubernetes-on-microsoft)相关章节。
#### 20.2.1.6.在Amazon AWS环境中部署
参照[AWS环境部署](https://www.gridgain.com/resources/blog/kubernetes-and-apacher-ignitetm-deployment-aws)相关内容。
#### 20.2.1.7.在OpenShift环境中部署
对于使用Docker容器的Kubernetes，[OpenShift](https://www.openshift.com/)也是支持的，但是它有自己的RBAC（基于角色的访问控制）特性，这与Kubernetes直接提供的机制不完全兼容，这也是为什么部分命令会导致`拒绝访问`错误的原因，这时就需要一些额外的配置，如下：

1.使用OpenShift的CLI创建一个具有`view`角色的服务账户；
```bash
$ oc create sa ignite
$ oc policy add-role-to-user view system:serviceaccount:<project>:ignite
```
注意，`<project>`是OpenShift的项目名。
2.指定TcpDiscoveryKubernetesIpFinder的`namespace`参数；
```xml
<bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
    <property name="discoverySpi">
        <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
            <property name="ipFinder">
                <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.kubernetes.TcpDiscoveryKubernetesIpFinder">
                    <!-- Set a project name as the namespace. -->
                    <property name="namespace" value="<project>"/>
                </bean>
            </property>
        </bean>
    </property>
</bean>
```
3.在部署配置中添加`serviceAccountName`；
```yaml
apiVersion: v1
kind: DeploymentConfig
metadata:
  name: ignite-cluster
spec:
  # Start two Ignite nodes by default.
  replicas: 2
  template:
    metadata:
      labels:
        app: ignite
    spec:
      serviceAccountName: ignite
    ...
```
### 20.2.2.有状态部署
如果Ignite部署为内存数据库，并且打开了原生持久化，那么就需要按照有状态的解决方案进行部署。
#### 20.2.2.1.要求
确保如下事项已经完成

 - 环境中已经部署了Kubernetes集群；
 - 已经配置了RBAC授权；
 - 已经部署了Ignite服务；

#### 20.2.2.2.Kubernetes IP探测器
要开启Kubernetes环境下Ignite节点的自动发现，需要在`IgniteConfiguration`中启用`TcpDiscoveryKubernetesIpFinder`，下面会创建一个名为`example-kube-persistence.xml`的配置文件，然后像下面这样定义相关的配置：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:util="http://www.springframework.org/schema/util"
       xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/util
        http://www.springframework.org/schema/util/spring-util.xsd">

<bean class="org.apache.ignite.configuration.IgniteConfiguration">
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

 <!-- Explicitly configure TCP discovery SPI to provide list of initial nodes. -->
<property name="discoverySpi">
  <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
    <property name="ipFinder">
    <!--
     Enables Kubernetes IP finder and setting custom namespace name.
     -->
      <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.kubernetes.TcpDiscoveryKubernetesIpFinder">
        <property name="namespace" value="ignite"/>
      </bean>
    </property>
  </bean>
</property>
</bean>
</beans>
```
该配置开启了Ignite的原生持久化，确保数据能够保存在磁盘上。

下面，就可以为Ignite配置组准备一套Kubernetes有状态集配置然后部署了。
#### 20.2.2.3.有状态集部署
最后一步是以有状态集的形式在Kubernetes中部署Ignite配置组。

建议为预写日志文件（WAL）和数据库文件提供[单独的磁盘设备](/doc/java/ProductionReadiness.md#_4-2-2-为WAL使用单独的磁盘设备)，以获得更好的性能。这就是为什么本节提供了两种部署方案的说明：当WAL和数据库文件位于同一个存储中以及分别存储时。

::: warning 有状态集部署时间
Kubernetes环境可能需要一段时间来分配需要的持久化存储，从而成功地部署所有配置组。在分配时，配置组的部署状态可能会显示如下消息：“pod has unbound persistentvolumeclaims（repeated 4 times）”。
:::

**WAL使用独立磁盘**

为了确保WAL存储在不同的磁盘上，需要求Kuberenetes提供一个专用的存储类。依赖于Kubernetes环境，存储类将有所不同。在本文档中，我们为Amazon AWS、Google Compute Engine和Microsoft Azure提供存储类模板。

使用以下模板为WAL请求存储类：

ignite-wal-storage-class.yaml (AWS)：
```yaml
#Amazon AWS Configuration
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: ignite-wal-storage-class  #StorageClass name
  namespace: ignite #Ignite namespace
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2 #Volume type io1, gp2, sc1, st1. Default: gp2
  zones: us-east-1d
```
ignite-wal-storage-class.yaml (GCE)：
```yaml
#Google Compute Engine Configuration
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: ignite-wal-storage-class #StorageClass Name
  namespace: ignite #Ignite namespace
provisioner: kubernetes.io/gce-pd
parameters:
  type: pd-standard #Volume type pd-standard or pd-ssd. Default: pd-standard
  zones: europe-west1-b
  replication-type: none
```
ignite-wal-storage-class.yaml (Azure)：
```yaml
#Microsoft Azure Configuration
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: ignite-wal-storage-class  #StorageClass name
  namespace: ignite #Ignite namespace
provisioner: kubernetes.io/azure-disk
parameters:
  storageaccounttype: Standard_LRS
  kind: managed
```
通过执行以下命令为WAL文件请求存储：
```bash
#Request storage class
kubectl create -f ignite-wal-storage-class.yaml
```
执行类似的操作，为数据库文件请求专用存储类：

ignite-persistence-storage-class.yaml (AWS)：
```yaml
#Amazon AWS Configuration
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: ignite-persistence-storage-class  #StorageClass name
  namespace: ignite         #Ignite namespace
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp2 #Volume type io1, gp2, sc1, st1. Default: gp2
  zones: us-east-1d
```
ignite-persistence-storage-class.yaml (GCE)：
```yaml
#Google Compute Engine configuration
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: ignite-persistence-storage-class  #StorageClass Name
  namespace: ignite         #Ignite namespace
provisioner: kubernetes.io/gce-pd
parameters:
  type: pd-standard #Type pd-standard or pd-ssd. Default: pd-standard
  zones: europe-west1-b
  replication-type: none
```
ignite-persistence-storage-class.yaml (Azure)：
```yaml
#Microsoft Azure Configuration
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: ignite-persistence-storage-class  #StorageClass name
  namespace: ignite #Ignite namespace
provisioner: kubernetes.io/azure-disk
parameters:
  storageaccounttype: Standard_LRS
  kind: managed
```
通过执行以下命令为数据库文件请求存储：
```bash
#Request storage class
kubectl create -f ignite-persistence-storage-class.yaml
```
::: tip 存储类参数
可以根据需要自由调整存储类配置的区域、存储类型和其它参数。
:::
确认两个存储类都已创建并可使用：
```bash
kubectl get sc
```
接下来，继续在Kubernetes中部署有状态集：
```yaml
apiVersion: apps/v1beta2
kind: StatefulSet
metadata:
  name: ignite
  namespace: ignite
spec:
  selector:
    matchLabels:
      app: ignite
  serviceName: ignite
  replicas: 2
  template:
    metadata:
      labels:
        app: ignite
    spec:
      serviceAccountName: ignite
      containers:
      - name: ignite
        image: apacheignite/ignite:2.6.0
        env:
        - name: OPTION_LIBS
          value: ignite-kubernetes,ignite-rest-http
        - name: CONFIG_URI
          value: https://raw.githubusercontent.com/apache/ignite/master/modules/kubernetes/config/example-kube-persistence-and-wal.xml
        - name: IGNITE_QUIET
          value: "false"
        - name: JVM_OPTS
          value: "-Djava.net.preferIPv4Stack=true"
        ports:
        - containerPort: 11211 # JDBC port number.
        - containerPort: 47100 # communication SPI port number.
        - containerPort: 47500 # discovery SPI port number.
        - containerPort: 49112 # JMX port number.
        - containerPort: 10800 # SQL port number.
        - containerPort: 8080 # REST port number.
        - containerPort: 10900 #Thin clients port number.
        volumeMounts:
        - mountPath: "/wal"
          name: ignite-wal
        - mountPath: "/persistence"
          name: ignite-persistence
  volumeClaimTemplates:
  - metadata:
      name: ignite-persistence
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: "ignite-persistence-storage-class"
      resources:
        requests:
          storage: "1Gi"
  - metadata:
      name: ignite-wal
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: "ignite-wal-storage-class"
      resources:
        requests:
          storage: "1Gi"
```
```bash
# Create the stateful set
kubectl create -f ignite-stateful-set.yaml
```
确认Ignite配置组正在运行：
```bash
kubectl get pods --namespace=ignite
```
**数据库和WAL文件使用相同的存储**

如果出于某种原因，需要将WAL和数据库文件存储在同一个磁盘设备中，那么可以使用下面的配置模板来部署和启动有状态集：

ignite-stateful-set.yaml：
```yaml
apiVersion: apps/v1beta2
kind: StatefulSet
metadata:
  name: ignite
  namespace: ignite
spec:
  selector:
    matchLabels:
      app: ignite
  serviceName: ignite
  replicas: 2
  template:
    metadata:
      labels:
        app: ignite
    spec:
      serviceAccountName: ignite
      containers:
      - name: ignite
        image: apacheignite/ignite:2.6.0
        env:
        - name: OPTION_LIBS
          value: ignite-kubernetes,ignite-rest-http
        - name: CONFIG_URI
          value: https://raw.githubusercontent.com/apache/ignite/master/modules/kubernetes/config/example-kube-persistence.xml
        - name: IGNITE_QUIET
          value: "false"
        - name: JVM_OPTS
          value: "-Djava.net.preferIPv4Stack=true"
        ports:
        - containerPort: 11211 # JDBC port number.
        - containerPort: 47100 # communication SPI port number.
        - containerPort: 47500 # discovery SPI port number.
        - containerPort: 49112 # JMX port number.
        - containerPort: 10800 # SQL port number.
        - containerPort: 8080 # REST port number.
        - containerPort: 10900 #Thin clients port number.
        volumeMounts:
        - mountPath: "/data/ignite"
          name: ignite-storage
  volumeClaimTemplates:
  - metadata:
      name: ignite-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 1Gi
```
```bash
# Create the stateful set
kubectl create -f ignite-stateful-set.yaml
```
如上所示，该配置定义了一组环境变量（`OPTION_LIBS`和`CONFIG_URIL`），Ignite的Docker镜像使用的一个shell脚本会用到它。Docker镜像的完整配置参数列表可以查看[Docker部署](/doc/java/Deployment.md#_2-docker部署)的相关章节。

确认Ignite的配置组已经启动运行：
```bash
kubectl get pods --namespace=ignite
```
**获取Ignite配置组的日志**

通过下面的过程，可以获取Ignite的配置组生成的日志。

获取正在运行的Ignite配置组的列表：
```bash
kubectl get pods --namespace=ignite
```
选择一个可用的配置组的名字：
```
NAME       READY     STATUS    RESTARTS   AGE
ignite-0   1/1       Running   0          7m
ignite-1   1/1       Running   0          4m
```
然后从中获取日志：
```bash
kubectl logs ignite-0 --namespace=ignite
```
#### 20.2.2.4.调整Ignite集群大小
属于标准的Kubernetes API，可以随时调整Ignite集群的大小。比如希望将集群从2个节点扩容到4个节点，可以使用下面的命令：
```bash
kubectl scale sts ignite --replicas=4 --namespace=ignite
```
再次确认集群扩容成功：
```bash
kubectl get pods --namespace=ignite
```
输出显示有4个Ignite配置组正在运行：
```
NAME       READY     STATUS    RESTARTS   AGE
ignite-0   1/1       Running   0          21m
ignite-1   1/1       Running   0          18m
ignite-2   1/1       Running   0          12m
ignite-3   1/1       Running   0          9m
```
#### 20.2.2.5.Ignite集群激活
因为部署使用了Ignite的原生持久化，因此启动之后集群需要激活，怎么做呢，接入一个配置组：
```bash
kubectl exec -it ignite-0 --namespace=ignite -- /bin/bash
```
转到下面的目录：
```bash
cd /opt/ignite/apache-ignite-fabric/bin/
```
然后使用下面的命令可以激活集群：
```bash
./control.sh --activate
```
### 20.2.3.RBAC授权
#### 20.2.3.1.概述
[基于角色的访问控制（RBAC）](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)是一种企业内基于单个用户的角色来调节对计算机或网络资源访问的常规方法。

RBAC使用`rbac.authorization.k8s.io`API组来驱动授权决策，允许管理员通过Kubernetes API动态地配置策略。

建议为Ignite部署配置RBAC，以对部署进行细粒度的控制，避免与安全有关的问题。
#### 20.2.3.2.要求
假定已经部署好了一套Kubernetes集群环境。
#### 20.2.3.3.创建命名空间
需要为Ignite部署创建一个唯一的命名空间，在本案例中命名空间名字为`ignite`：

ignite-namespace.yaml：
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ignite
```
执行下面的命令配置命名空间：
```bash
kubectl create -f ignite-namespace.yaml
```
#### 20.2.3.4.创建服务账户
通过下面的方式配置Ignite服务账户：

ignite-service-account.yaml：
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ignite
  namespace: ignite
```
执行下面的命令创建账户：
```bash
kubectl create -f ignite-service-account.yaml
```
#### 20.2.3.5.创建角色
通过下面的方式创建Ignite服务使用的角色，该服务用于节点的自动发现，并且用作远程应用的负载平衡器。

ignite-account-role.yaml：
```yaml
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRole
metadata:
  name: ignite
  namespace: ignite
rules:
- apiGroups:
  - ""
  resources: # Here are resources you can access
  - pods
  - endpoints
  verbs: # That is what you can do with them
  - get
  - list
  - watch
```
::: warning 注意
如果不打算将Ignite服务用作外部应用的负载平衡器，那么建议赋予其更少的权限，具体见[这里](https://stackoverflow.com/a/49634686/5515526)。
:::

执行下面的命令创建角色：
```bash
kubectl create -f ignite-account-role.yaml
```
下一步，使用下面的配置将该角色绑定到服务账户和命名空间上：

ignite-role-binding.yaml：
```yaml
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1beta1
metadata:
  name: ignite
roleRef:
  kind: ClusterRole
  name: ignite
  apiGroup: rbac.authorization.k8s.io
subjects:
- kind: ServiceAccount
  name: ignite
  namespace: ignite
```
执行下面的命令执行绑定：
```bash
kubectl create -f ignite-role-binding.yaml
```
最后，将命名空间切换到`ignite`，然后就可以看到所有所属的资源：
```bash
kubectl config set-context $(kubectl config current-context) --namespace=ignite
```
### 20.2.4.Ignite服务
Ignite服务用于Ignite节点的自动发现，还有做为要接入集群的外部应用的负载平衡器。

本文描述如何配置和部署Ignite服务。
#### 20.2.4.1.Ignite服务部署
Ignite的`KubernetesIPFinder`需要用户配置和部署一个特定的Kubernetes服务，它会维护一个所有有效的Ignite配置组的IP地址列表。

每次启动一个新的Ignite配置组，IP探测器会通过Kubernetes API接入服务来获取已有的Ignite配置组地址列表。通过这些地址，新的节点就可以发现集群中的其它节点从而最终加入Ignite集群。

同时，也可以将该服务复用为预接入集群的外部应用的负载平衡器。

通过下面的方式可以配置服务，它考虑了所有的必要条件：

::: tip 会话关联属性
只有在Kubernetes中部署了Ignite集群并且应用不在其中时，才需要下面使用的`sessionAffinity`。该属性确保Ignite瘦客户端、JDBC/ODBC驱动保留与特定的Ignite配置组的连接。
如果集群和应用都由Kubernetes管理，那么该属性是冗余的，可以删除。
:::

ignite-service.yaml：
```yaml
apiVersion: v1
kind: Service
metadata:
  # The name must be equal to TcpDiscoveryKubernetesIpFinder.serviceName
  name: ignite
  # The name must be equal to TcpDiscoveryKubernetesIpFinder.namespaceName
  namespace: ignite
spec:
  type: LoadBalancer
  ports:
    - name: rest
      port: 8080
      targetPort: 8080
    - name: sql
      port: 10800
      targetPort: 10800
    - name: thinclients
      port: 10900
      targetPort: 10900
  sessionAffinity: ClientIP
  selector:
    # Must be equal to the label set for Ignite pods.
    app: ignite
```
然后使用如下的命令将其部署进Kubernetes（确认事先已经配置好了唯一的[命名空间和RBAC](#_20-2-3-rbac授权)）：
```bash
kubectl create -f ignite-service.yaml
```
确认服务已经正在运行：
```bash
 kubectl get svc ignite --namespace=ignite
```
### 20.2.5.Kubernetes IP探测器
#### 20.2.5.1.概述
将Ignite节点以Kubernetes配置组的形式进行部署，对Ignite节点的发现机制有一定的要求。因为防火墙通常会阻止组播通信的原因，很可能无法直接使用基于组播的IP探测器。但是，只要Kubernetes动态地分配了地址，就可以列出所有节点的IP地址，然后使用静态IP探测器。

也可以考虑Amazon AWS IP探测器、Google Compute Engine IP探测器或者JClouds IP探测器，但是Kubernetes必须部署在这些云环境中。另外，也可以使用共享文件系统或者关系型数据库用于节点的自动发现，但是必须单独维护数据库或者共享文件系统。

本文会描述有关针对使用Kubernetes技术容器化的Ignite节点，专门开发的IP探测器，该IP探测器会自动搜索所有在线的Ignite配置组的IP地址，它是通过与一个持有所有最新端点的Kubernetes服务进行通信实现的。
#### 20.2.5.2.基于Kubernetes服务的发现
如果要开启Kubernetes环境的节点自动发现，需要在下面的配置中使用`TcpDiscoveryKubernetesIpFinder`：

XML：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">
	...
  <property name="discoverySpi">
    <bean class="org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi">
      <property name="ipFinder">
        <bean class="org.apache.ignite.spi.discovery.tcp.ipfinder.kubernetes.TcpDiscoveryKubernetesIpFinder"/>
      </property>
    </bean>
  </property>
</bean>
```
Java：
```java
// Configuring discovery SPI.
TcpDiscoverySpi spi = new TcpDiscoverySpi();

// Configuring IP finder.
TcpDiscoveryKubernetesIpFinder ipFinder = new TcpDiscoveryKubernetesIpFinder();

spi.setIpFinder(ipFinder);

IgniteConfiguration cfg = new IgniteConfiguration();

// Override default discovery SPI.
cfg.setDiscoverySpi(spi);

// Start Ignite node.
Ignition.start(cfg);
```
::: tip Maven构件
如果要使用`TcpDiscoveryKubernetesIpFinder`，需要在Maven中添加`ignite-kubernetes`依赖。
:::

Ignite的`KubernetesIPFinder`需要用户配置和部署一个特定的Kubernetes服务，它负责维护所有在线Ignite配置组（节点）的IP地址列表。

每当启动一个新的Ignite配置组，IP探测器会通过Kubernetes的API访问Kubernetes服务，获取已有的Ignite配置组的地址列表，通过这些地址，新的节点就可以与其它节点互相连接，然后最终加入集群。

该服务需要手工配置，然后需要优先于Ignite配置组先行启动，下面是代码样例：

Service Configuration：
```yaml
apiVersion: v1
kind: Service
metadata:
  # Name of Ignite Service used by Kubernetes IP finder for IP addresses lookup.
  name: ignite
spec:
  clusterIP: None # custom value.
  ports:
    - port: 9042 # custom value.
  selector:
    # Must be equal to one of the labels set in Ignite pods'
    # deployement configuration.
    app: ignite
```
默认的服务名为`ignite`，如果修改了名字，一定要同时调用`TcpDiscoveryKubernetesIpFinder.setServiceName(String)`方法进行修改。

另外，建议通过某种方式对Ignite的配置组打标签，然后在服务的`selector`配置段中配置标签。比如，通过上面的配置启动的服务，会关注于标注为`app: ignite`的配置组。

::: tip 从外部接入容器化的Ignite集群
`TcpDiscoveryKubernetesIpFinder`的设计是用于Kubernetes环境内部的，这意味着所有的Ignite节点、与集群交互的应用都需要通过Kubernetes容器化。

但是，如果希望从Kubernetes外部接入Ignite集群，那么：
 1. 需要在Ignite配置组的yaml文件中配置`hostNetwork=true`，这样就可以从外部与容器化的Ignite配置组建立TCP/IP连接；
 2. 在Kubernetes环境外部，使用同样的`TcpDiscoveryKubernetesIpFinder`。
:::

#### 20.2.5.3.配置参数
通常，`TcpDiscoveryKubernetesIpFinder`的设计是直接可用，但是通过下面的参数也可以进行细粒度的控制：

|属性|描述|默认值|
|---|---|---|
|`setServiceName(String)`|配置Kubernetes服务的名字，该服务用于Ignite配置组的IP地址搜索，服务名必须与Kubernetes配置中的服务名一致。|`ignite`|
|`setNamespace(String)`|配置Kubernetes服务所属的命名空间。|`default`|
|`setMasterUrl(String)`|配置Kubernetes API服务器的主机名。|`https://kubernetes.default.svc.cluster.local:443`|
|`setAccountToken(String)`|配置服务令牌文件的路径。|`/var/run/secrets/kubernetes.io/serviceaccount/token`|

## 20.3.Microsoft Azone部署
### 20.3.1.Azone Kubernetes服务部署
第一步是配置Azone Kubernetes服务（AKS）集群，具体可以看下面的资料：

 - [通过Azone门户部署AKS集群](https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough-portal)
 - [通过Azone命令行部署AKS集群](https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough)

本文中会讲解如何使用Azone门户进行AKS部署。

**AKS配置**

创建Microsoft账号之后，转到[https://portal.azure.com](https://portal.azure.com/) 然后选择`Create a resource` > 选择 `Kubernetes Service` > `Create`。

在下一页中，配置本次部署的常规参数：

![](https://files.readme.io/522e9d8-Screen_Shot_2018-06-28_at_2.46.26_PM.png)

本例中，会使用`IgniteCluster`作为`Resource group`和`Kubernetes cluster name`的名字。

该页面中还需要选择AKS集群的节点数量。

![](https://files.readme.io/948dd86-Screen_Shot_2018-06-28_at_2.50.22_PM.png)

本例中，集群由4个节点组成，每个节点2个虚拟CPU和8G RAM。

下一步，转到`Networking`配置页，配置需要的网络信息，如果没有什么特别的网络参数那么可以使用下面的默认值：

![](https://files.readme.io/f5bc018-Screen_Shot_2018-06-28_at_2.52.01_PM.png)

之后转到`Monitoring`配置页，建议打开监控，这样可以在Azone门户中获取集群的状态：

![](https://files.readme.io/f46f1f8-Screen_Shot_2018-06-28_at_2.55.06_PM.png)

下一页中，可以配置应用的标签，然后点击`Review + create`按钮，再次检查配置参数之后，点击`Create`按钮。

转到`All Resources` -> `IgniteCluster`，Azone部署集群需要点时间：

![](https://files.readme.io/6e31786-Screen_Shot_2018-06-28_at_3.00.06_PM.png)

**访问Kubernetes集群**

Kubernetes仪表盘是一个有助于从本地或者其它环境监控Kubernetes的简单工具。

如果要使用仪表盘，需要安装Azone CLI，如果未安装，可以参照这个[文档](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)。

Azone CLI安装完成之后，按照下面的步骤操作：

首先，通过下面的命令获取集群的凭据：
```bash
az aks get-credentials --resource-group IgniteCluster --name IgniteCluster
```
下一步，通过下面的命令检查所有的节点是否处于`Ready`状态：
```bash
kubectl get nodes
```
输出大致如下：
```bash
aks-agentpool-41298956-0   Ready     agent     1m        v1.10.3
aks-agentpool-41298956-1   Ready     agent     1m        v1.10.3
aks-agentpool-41298956-2   Ready     agent     1m        v1.10.3
aks-agentpool-41298956-3   Ready     agent     1m        v1.10.3
```
最后，通过下面的命令启动Kubernetes仪表盘：
```bash
az aks browse --resource-group IgniteCluster --name IgniteCluster
```
打开仪表盘之后，转到`Cluster`->`Nodes`，确认是否可以看到正在运行的AKS集群的所有节点。

![](https://files.readme.io/c08ab74-Screen_Shot_2018-06-28_at_3.19.27_PM.png)
### 20.3.2.Ignite集群部署
要在Azone Kubernetes服务中部署Ignite集群，需要至少3步：

 - 配置RBAC授权；
 - 在Kubernetes中部署用于Ignite节点自动发现的Ignite服务，同时它也会作为外部应用的负载平衡器；
 - 将Ignite集群部署为有状态或者无状态的方案。

**RBAC授权**

需要通过RBAC授权来创建一个Ignite特定的命名空间、服务账户和角色。依次运行以下命令：

创建命名空间：
```bash
kubectl create -f ignite-namespace.yaml
```
创建服务账户：
```bash
kubectl create -f ignite-service-account.yaml
```
创建角色：
```bash
kubectl create -f ignite-account-role.yaml
```
角色绑定：
```bash
kubectl create -f ignite-role-binding.yaml
```
具体细节可以看[RBAC授权](#_20-2-3-rbac授权)。

配置RBAC之后打开Kubernetes仪表盘，转到`Cluster`->`Roles`，确认哪有一个Ignite专用的角色。

![](https://files.readme.io/f515543-Screen_Shot_2018-06-28_at_3.49.31_PM.png)

通过选择`Namespace`->`ignite`，在Kubernetes仪表盘中切换当前命名空间到`ignite`。还有，通过下面的命令，也可以通过Azone CLI切换命名空间：
```bash
kubectl config set-context $(kubectl config current-context) --namespace=ignite
```
**Ignite服务部署**

部署一个专用的Ignite服务，用于Ignite节点的自动发现，同时也可以作为外部应用的负载平衡器，执行下面的命令：
```bash
kubectl create -f ignite-service.yaml
```
具体细节可以看[Ignite服务](#_20-2-4-ignite服务)的相关章节。

服务部署之后，转到`Discovery and Load Balancing`->`Services`，确认在Kubernetes仪表盘中可以看到这个服务。

![](https://files.readme.io/398171c-Screen_Shot_2018-06-28_at_5.01.08_PM.png)

**Ignite有状态集部署**

Ignite有状态集部署可以用于将Ignite部署为开启持久化的、以内存为中心的数据库的场景，根据希望存储预写日志（WAL）的位置，有两个选项可用：

 - WAL文件使用单独的磁盘设备（建议）；
 - 数据库和wAL文件使用相同的存储。

*WAL文件使用单独的磁盘*

按顺序一个个地执行下面的命令：

请求WAL存储类：
```bash
kubectl create -f ignite-wal-storage-class.yaml
```
请求存储类：
```bash
kubectl create -f ignite-persistence-storage-class.yaml
```
创建有状态集：
```bash
kubectl create -f ignite-stateful-set.yaml
```
*数据库和wAL文件使用相同的存储*

具体细节可以参见[有状态部署](#_20-2-2-有状态部署)的相关内容。

转到`Cluster`->`Persistence Volumes`，可以看到为集群分配了什么类型的设备，比如下图：

![](https://files.readme.io/28062de-Screen_Shot_2018-06-28_at_5.05.45_PM.png)

::: warning 有状态集部署时间
Microsoft Azure环境可能需要一段时间来分配需要的持久化存储，从而成功地部署所有配置组。在分配时，配置组的部署状态可能会显示如下消息：“pod has unbound persistentvolumeclaims（repeated 4 times）”。
:::
配置组部署之后，可以尝试如下的命令对集群进行扩容：
```bash
kubectl scale sts ignite --replicas=4
```
集群扩容并且磁盘加载之后，就会在Kubernetes仪表盘的`Workloads`->`Pods`页面看到如下内容：

![](https://files.readme.io/e2108a4-Screen_Shot_2018-06-28_at_5.10.04_PM.png)

**Ignite集群激活**

因为集群使用了Ignite的原生持久化，因此启动之后需要对集群进行激活，怎么弄呢？接入其中任意一个配置组：
```bash
kubectl exec -it ignite-0 --namespace=ignite -- /bin/bash
```
转到如下的目录：
```bash
cd /opt/ignite/apache-ignite-fabric/bin/
```
然后通过执行如下的命令激活集群：
```bash
./control.sh --activate
```
### 20.3.3.从外部应用接入
下面会从外部应用（未部署在Kubernetes中）接入集群，本示例会使用SQL接口通过JDBC驱动接入Ignite。

首先，找到Ignite服务的外部地址，比如，转到`Discovery and Load Balancing`->`Services`，然后通过端口号10800选择一个外部端点（这是Ignite SQL驱动的默认端口）。

下一步，下载一个Ignite版本，转到`{ignite_release}/bin`然后使用SQLline工具通过如下的命令可以接入集群：
```bash
./sqlline.sh --verbose=true -u jdbc:ignite:thin://{EXTERNAL_IP}:10800
```
接入之后，使用SQLLine工具，通过下面的命令进行数据预加载：
```bash
!run ../examples/sql/world.sql
```
之后，就可以使用SQL与集群进行交互了，比如：
```sql
SELECT country.name, city.name, MAX(city.population) as max_pop FROM country
    JOIN city ON city.countrycode = country.code
    WHERE country.code IN ('USA','RUS','CHN')
    GROUP BY country.name, city.name ORDER BY max_pop DESC LIMIT 3;
```
### 20.3.4.安装Web控制台
如果希望在Kubernetes中安装[Web控制台](/doc/tools/README.md#_1-ignite-web控制台)，请参见这个[安装文档](/doc/tools/README.md#_6-kubernetes安装)。
## 20.4.Google Cloud部署
### 20.4.1.Google Kubernetes引擎部署
第一步是按照Google的说明配置Google Kubernetes引擎（GKE）集群：

 - [创建集群](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-cluster)

在本文中，会使用Google云控制台进行GKE的部署。

**GKE配置**

创建Google账号之后，转到[https://console.cloud.google.com/](https://console.cloud.google.com/) ，然后选择`Kubernetes Engine` > 选择 `Clusters` > `Create cluster`。

下一页中会配置一些部署所需的常规参数。

![](https://files.readme.io/1d3c0ba-general_parameters.png)

在本例中，会使用`ignitecluster`作为Kubernetes集群的名字。

同一个页面中还需要选择GKE集群中的节点数量。

![](https://files.readme.io/01a8093-nodes_configuration.png)

本例中，集群包含4个节点，每个节点有2个虚拟CPU和7.5GB内存。

建议打开`StackDriver`监控，这样就可以从Google云控制台里面看到集群的状态。

![](https://files.readme.io/18b7a61-monitoring_configuration.png)

下一步，点击`More`之后可以为应用配置需要的标签。

![](https://files.readme.io/1f72403-labels.png)

再次检查配置参数，然后点击`Create`按钮。

转到`Kubernetes Engine` > `Clusters`，注意GKE部署集群需要点时间。

![](https://files.readme.io/bed652e-cluster_info.png)

**访问Kubernetes集群**

按照这个[文档](https://cloud.google.com/sdk/docs/quickstarts)，可以安装Google云的SDK CLI。
Google云SDK CLI安装完之后，可以按照下面的步骤操作。

转到`Kubernetes Engine` > `Clusters`，然后点击集群的`Connect`按钮。

然后按照指令访问您的集群：

![](https://files.readme.io/e900a2a-cluster_access.png)

::: tip Kubernetes仪表盘已经不推荐使用
在[这里](https://cloud.google.com/kubernetes-engine/docs/concepts/dashboards)可以看到Google云平台控制台仪表盘的更多信息。
:::

下一步，通过下面的命令检查所有的节点是否处于`Ready`状态：
```bash
kubectl get nodes
```
输出大体如下：
```bash
NAME                                          STATUS    ROLES     AGE       VERSION
gke-ignitecluster-default-pool-4b1a4860-nb1f   Ready     <none>    1m       v1.10.4-gke.2
gke-ignitecluster-default-pool-4b1a4860-v719   Ready     <none>    1m       v1.10.4-gke.2
gke-ignitecluster-default-pool-4b1a4860-xltc   Ready     <none>    1m       v1.10.4-gke.2
gke-ignitecluster-default-pool-4b1a4860-z9vs   Ready     <none>    1m       v1.10.4-gke.2
```
### 20.4.2.Ignite集群部署
要在Google Kubernetes引擎中部署Ignite集群，需要至少三步操作：

 - 配置RBAC授权；
 - 部署一个Ignite服务，用于Ignite节点的Kubernetes环境自动发现以及外部应用的负载平衡；
 - 将Ignite集群部署为无状态或者有状态的方案。

执行这些步骤所需的所有yaml文件可以在[GitHub](https://github.com/apache/ignite/tree/master/modules/kubernetes/config/gce)上下载。

**RBAC授权**

首先，针对GKE部署，需要执行下面的命令，这里`[YOUR_USERNAME]`为用户的电子邮件地址。
```bash
kubectl create clusterrolebinding cluster-admin-binding \
  --clusterrole cluster-admin --user [YOUR_USERNAME]
```
下一步，需要通过RBAC授权来创建一个Ignite特定的命名空间、服务账户和角色。依次运行以下命令：

命名空间创建：
```bash
kubectl create -f ignite-namespace.yaml
```
服务账户创建：
```bash
kubectl create -f ignite-service-account.yaml
```
角色创建：
```bash
kubectl create -f ignite-account-role.yaml
```
角色绑定：
```bash
kubectl create -f ignite-role-binding.yaml
```
具体细节可以看[RBAC授权](#_20-2-3-rbac授权)。

最后，执行如下的命令，为`Google Cloud SDK CLI`切换当前的命名空间：
```bash
kubectl config set-context $(kubectl config current-context) --namespace=ignite
```

**Ignite服务部署**

部署一个专用的Ignite服务，用于Ignite节点的自动发现，同时也可以作为外部应用的负载平衡器，执行下面的命令：
```bash
kubectl create -f ignite-service.yaml
```
具体细节可以看[Ignite服务](#_20-2-4-ignite服务)的相关章节。

服务部署完成之后，转到`Kubernetes Engine` > `Clusters`，确认从Kubernetes引擎服务仪表盘中可以看到该服务。

![](https://files.readme.io/bd68550-ignite_service.png)

**Ignite无状态部署**

Ignite无状态部署可以用于将Ignite部署为禁用持久化的、以内存为中心的数据库。执行下面的命令：
```bash
kubectl create -f ignite-deployment.yaml
```
具体细节可以参考[无状态部署](#_20-2-1-无状态部署)的相关章节。

![](https://files.readme.io/6bbaa4c-stateless_deployment.png)

**Ignite有状态集部署**

Ignite有状态集部署可以用于将Ignite部署为开启持久化的、以内存为中心的数据库。根据希望存储预写日志（WAL）的位置，有两个选项可用：

 - WAL文件使用单独的磁盘设备（建议）；
 - 数据库和wAL文件使用相同的存储。

*WAL文件使用单独的磁盘*

依序执行下面的命令：

请求WAL存储类：
```bash
kubectl create -f ignite-wal-storage-class.yaml
```
请求存储类：
```bash
kubectl create -f ignite-persistence-storage-class.yaml
```
创建有状态集：
```bash
kubectl create -f ignite-stateful-set.yaml
```
*数据库和wAL文件使用相同的存储*

具体细节可以参见[有状态部署](#_20-2-2-有状态部署)的相关内容。

常规做法假设GKE将为Ignite数据持久化提供通用存储。转到`Kubernetes Engine`->`Storage`可以查看为集群分配了哪些类型的设备，比如可能如下图所示：

![](https://files.readme.io/df8a665-storage.png)

::: warning 有状态集部署时间
Google Cloud环境可能需要一段时间来分配需要的持久化存储，从而成功地部署所有配置组。在分配时，配置组的部署状态可能会显示如下消息：“pod has unbound PersistentVolumeClaims (repeated 4 times)”。
:::
配置组部署之后，可以尝试如下的命令对集群进行扩容：
```bash
kubectl scale sts ignite --replicas=4
```
集群扩容并且磁盘加载之后，就会在Google云平台控制台的`Kubernetes Engine`->`Workloads`页面看到如下内容：

![](https://files.readme.io/9201088-stateful_deployment.png)

**Ignite集群激活**

因为集群使用了Ignite的原生持久化，因此启动之后需要对集群进行激活，怎么弄呢？接入其中任意一个配置组：
```bash
kubectl exec -it ignite-0 --namespace=ignite -- /bin/bash
```
转到如下的目录：
```bash
cd /opt/ignite/apache-ignite-fabric/bin/
```
然后通过执行如下的命令激活集群：
```bash
./control.sh --activate
```
### 20.4.3.从外部应用接入
下面会从外部应用（未部署在Kubernetes中）接入集群，本示例会使用SQL接口通过JDBC驱动接入Ignite。

首先，找到Ignite服务的外部地址，比如，转到`Kubernetes Engine` > `Services`，然后通过端口号10800选择一个外部端点（这是IgniteSQL驱动的默认端口）。

下一步，下载一个Ignite版本，转到`{ignite_release}/bin`然后使用SQLline工具通过如下的命令可以接入集群：
```bash
./sqlline.sh --verbose=true -u jdbc:ignite:thin://{EXTERNAL_IP}:10800
```
接入之后，使用SQLLine工具，通过下面的命令进行数据预加载：
```bash
!run ../examples/sql/world.sql
```
之后，就可以使用SQL与集群进行交互了，比如：
```sql
SELECT country.name, city.name, MAX(city.population) as max_pop FROM country
    JOIN city ON city.countrycode = country.code
    WHERE country.code IN ('USA','RUS','CHN')
    GROUP BY country.name, city.name ORDER BY max_pop DESC LIMIT 3;
```
### 20.4.4.安装Web控制台
如果希望在Kubernetes中安装[Web控制台](/doc/tools/README.md#_1-ignite-web控制台)，请参见这个[安装文档](/doc/tools/README.md#_6-kubernetes安装)。

## 20.5.AWS EKS部署
### 20.5.1.Amazon Web Services EKS部署
遵循Amazon Kubernetes弹性容器服务的相关指南：

 - [Amazon EKS入门](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html)

在本文档中，将使用AWS EKS控制台和AWS CLI进行EKS部署。还将使用`EU (Ireland) (eu-west-1)`区域。密钥对也是必需的，最好将其准备好以后使用。可以使用AWS EC2创建此密钥对。

**要求**

创建完AWS账户之后，按照[Amazon EKS入门](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html)的说明进行操作：

 - 创建Amazon的EKS服务角色；
 - 创建Amazon的EKS集群VPC；
 - 为Amazon的EKS安装和配置`kubectl`；
 - 下载安装最新版本的AWS CLI。

**创建Amazon EKS集群**

使用AWS CLI创建集群，格式如下：
```bash
aws eks create-cluster --name ignitecluster --role-arn arn:aws:iam::111122223333:role/eks-service-role --resources-vpc-config subnetIds=subnet-a9189fe2,subnet-50432629,securityGroupIds=sg-f5c54184
```
下面的值要做替换：

 - --name；
 - --role-arn
 - --resources-vpc-config (subnetIds和securityGroupIds)

上例中，`ignitecluster`为Kubernetes集群的名字。

使用下面的命令可以检查创建的集群的状态：
```bash
aws eks describe-cluster --name ignitecluster --query cluster.status
```
集群状态为`ACTIVE`时，继续执行下一步。

**为Amazon EKS配置kubectl**

使用AWS CLI创建一个`kubeconfig`文件，如下：
```bash
aws eks update-kubeconfig --name ignitecluster
```
通过如下方式可以对配置进行测试：
```bash
kubectl get svc
```
输出大致如下：
```
NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
kubernetes   ClusterIP   10.100.0.1   <none>        443/TCP   12m
```
**启动配置Amazon EKS工作节点**

按照[Amazon EKS入门](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html)的说明进行操作。

*启动工作节点*

根据Amazon的文档介绍来创建堆栈，下面的示例中会使用`ignitecluster`：

![](https://files.readme.io/b715edc-Figure1.png)

这里，大部分参数使用的是默认值，其余值基于前面的配置步骤：

![](https://files.readme.io/d30aaed-Figure2.png)

堆栈创建完之后，需要保存`NodeInstanceRole`的值，后续会用到。

*让工作节点加入集群*

首先，需要下载配置映射文件，如下：
```bash
curl -O https://amazon-eks.s3-us-west-2.amazonaws.com/cloudformation/2018-08-30/aws-auth-cm.yaml
```
下一步，在映射文件中，要将`<ARN of instance role (not instance profile)>`替换为之前保存的`NodeInstanceRole`的值，然后执行下面的命令：
```bash
kubectl apply -f aws-auth-cm.yaml
```
下一步，用下面的命令检查是否所有节点都位于`Ready`状态：
```bash
kubectl get nodes
```
输出大致如下：
```
NAME                                            STATUS    ROLES    AGE       VERSION
ip-192-168-155-238.eu-west-1.compute.internal   Ready     <none>    2m        v1.10.3
ip-192-168-205-7.eu-west-1.compute.internal     Ready     <none>    2m        v1.10.3
ip-192-168-90-214.eu-west-1.compute.internal    Ready     <none>    2m        v1.10.3
```
### 20.5.2.Ignite集群部署
要在`Amazon EKS`中部署Ignite集群，需要执行至少三步：

 - 配置RBAC授权；
 - 部署一个Ignite服务，用于Ignite节点的Kubernetes环境自动发现以及外部应用的负载平衡；
 - 将Ignite集群部署为无状态或者有状态的方案。

执行这些步骤所需的所有yaml文件可以在[GitHub](https://github.com/apache/ignite/tree/master/modules/kubernetes/config/eks)上下载。

**RBAC授权**

首先，需要通过RBAC授权来创建一个Ignite特定的命名空间、服务账户和角色。依次运行以下命令：

命名空间创建：
```bash
kubectl create -f ignite-namespace.yaml
```
服务账户创建：
```bash
kubectl create -f ignite-service-account.yaml
```
角色创建：
```bash
kubectl create -f ignite-account-role.yaml
```
角色绑定：
```bash
kubectl create -f ignite-role-binding.yaml
```
具体细节可以看[RBAC授权](#_20-2-3-rbac授权)。

最后，执行如下的命令，为`AWS CLI`切换当前的命名空间：
```bash
kubectl config set-context $(kubectl config current-context) --namespace=ignite
```

**Ignite服务部署**

部署一个专用的Ignite服务，用于Ignite节点的自动发现，同时也可以作为外部应用的负载平衡器，执行下面的命令：
```bash
kubectl create -f ignite-service.yaml
```
具体细节可以看[Ignite服务](#_20-2-4-ignite服务)的相关章节。

使用如下的命令可以检查服务是否部署成功：
```bash
kubectl get svc ignite
```
**Ignite无状态部署**

Ignite无状态部署可以用于将Ignite部署为禁用持久化的、以内存为中心的数据库。执行下面的命令：
```bash
kubectl create -f ignite-deployment.yaml
```
具体细节可以参考[无状态部署](#_20-2-1-无状态部署)的相关章节。

**Ignite有状态集部署**

Ignite有状态集部署可以用于将Ignite部署为开启持久化的、以内存为中心的数据库。根据希望存储预写日志（WAL）的位置，有两个选项可用：

 - WAL文件使用单独的磁盘设备（建议）；
 - 数据库和wAL文件使用相同的存储。

*WAL文件使用单独的磁盘*

依序执行下面的命令：

请求WAL存储类：
```bash
kubectl create -f ignite-wal-storage-class.yaml
```
请求存储类：
```bash
kubectl create -f ignite-persistence-storage-class.yaml
```
创建有状态集：
```bash
kubectl create -f ignite-stateful-set.yaml
```
*数据库和wAL文件使用相同的存储*

具体细节可以参见[有状态部署](#_20-2-2-有状态部署)的相关内容。

使用下面的命令，可以确认配置组是否部署成功：
```bash
kubectl get pods
```
配置组部署之后，可以尝试如下的命令对集群进行扩容：
```bash
kubectl scale sts ignite --replicas=4
```

**Ignite集群激活**

因为集群使用了Ignite的原生持久化，因此启动之后需要对集群进行激活，怎么弄呢？接入其中任意一个配置组：
```bash
kubectl exec -it ignite-0 --namespace=ignite -- /bin/bash
```
转到如下的目录：
```bash
cd /opt/ignite/apache-ignite-fabric/bin/
```
然后通过执行如下的命令激活集群：
```bash
./control.sh --activate
```
### 20.5.3.从外部应用接入
下面会从外部应用（未部署在Kubernetes中）接入集群，本示例会使用SQL接口通过JDBC驱动接入Ignite。

首先，找到Ignite服务的外部地址，比如执行如下的命令：
```bash
kubectl describe svc ignite
```
注意`LoadBalancer`的地址。

下一步，下载一个Ignite版本，转到`{ignite_release}/bin`然后使用SQLline工具通过如下的命令可以接入集群：
```bash
./sqlline.sh --verbose=true -u jdbc:ignite:thin://{EXTERNAL_IP}:10800
```
接入之后，使用SQLLine工具，通过下面的命令进行数据预加载：
```bash
!run ../examples/sql/world.sql
```
之后，就可以使用SQL与集群进行交互了，比如：
```sql
SELECT country.name, city.name, MAX(city.population) as max_pop FROM country
    JOIN city ON city.countrycode = country.code
    WHERE country.code IN ('USA','RUS','CHN')
    GROUP BY country.name, city.name ORDER BY max_pop DESC LIMIT 3;
```
### 20.5.4.安装Web控制台
如果希望在Kubernetes中安装[Web控制台](/doc/tools/README.md#_1-ignite-web控制台)，请参见这个[安装文档](/doc/tools/README.md#_6-kubernetes安装)。
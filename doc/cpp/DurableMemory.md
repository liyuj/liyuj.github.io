# 固化内存
## 1.固化内存
Ignite分布式内存平台基于固化内存架构，在启用[Ignite持久化存储](/doc/cpp/Persistence.md#_1-ignite持久化)特性之后，可以同时在内存和磁盘上存储和处理数据，这个架构可以使用集群的所有可用资源，实现了带有磁盘存储能力的内存级性能。

![](https://files.readme.io/ac2ff0d-durable-memory.png)

Java版本的[固化内存](/doc/java/DurableMemory.md)文档有更详细的描述。
### 1.1.配置
在C++代码中，固化内存可以使用如下的Spring XML配置文件进行配置：
```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

<!-- Redefining maximum memory size for the cluster node usage. -->
<property name="dataStorageConfiguration">
  <bean class="org.apache.ignite.configuration.DataStorageConfiguration">
    <!-- Redefining the default region's settings -->
    <property name="defaultDataRegionConfiguration">
      <bean class="org.apache.ignite.configuration.DataRegionConfiguration">
        <property name="name" value="Default_Region"/>
        <!-- Setting the size of the default region to 4GB. -->
        <property name="maxSize" value="#{4L * 1024 * 1024 * 1024}"/>
      </bean>
    </property>
  </bean>
</property>

<!-- The rest of the parameters. -->
</bean>
```
更多的内容，可以看[内存配置](/doc/java/DurableMemory.md#_3-内存配置)的文档。
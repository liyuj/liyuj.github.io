# 9.管理和监控
## 9.1.系统视图
Ignite提供了一组内置的视图，它们包含了与集群节点和节点指标有关的各种信息。这些视图位于`IGNITE`模式中，在[3.6.模式](/doc/sql/Architecture.md#_3-6-模式)中介绍了在Ignite中访问非默认的模式的方法。
::: tip 限制
1)无法在IGNITE模式中创建对象；
2)IGNITE模式中的视图无法与用户级的表进行关联。
:::
### 9.1.1.NODES视图
NODES视图中包括了集群节点的各种信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`ID`|UUID|节点ID|
|`CONSISTENT_ID`|VARCHAR|节点的一致性ID|
|`VERSION`|VARCHAR|节点的版本|
|`IS_CLIENT`|BOOLEAN|节点是否为客户端节点|
|`IS_DAEMON`|BOOLEAN|节点是否为守护节点|
|`NODE_ORDER`|INT|节点在网络中的顺序|
|`ADDRESSES`|VARCHAR|节点的地址|
|`HOSTNAMES`|VARCHAR|节点的主机名|

## 9.2.JDBC/ODBC会话管理
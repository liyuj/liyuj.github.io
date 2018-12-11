# 9.管理和监控
## 9.1.系统视图
Ignite提供了一组内置的视图，它们包含了与集群节点和节点指标有关的各种信息。这些视图位于`IGNITE`模式中，在[3.6.模式](/doc/sql/Architecture.md#_3-6-模式)中介绍了在Ignite中访问非默认的模式的方法。
::: tip 限制
1)无法在IGNITE模式中创建对象；<br>
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

### 9.1.2.NODES_ATTRIBUTES视图
NODES_ATTRIBUTES视图包括了集群节点的属性信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`NODE_ID`|UUID|节点ID|
|`NAME`|VARCHAR|属性名|
|`VALUE`|VARCHAR|属性值|

### 9.1.3.BASELINE_NODES视图
BASELINE_NODES视图包括了当前基线拓扑中的节点信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`CONSISTENT_ID`|VARCHAR|节点一致性ID|
|`ONLINE`|BOOLEAN|节点的运行状态|

### 9.1.4.NODE_METRICS视图
NODE_METRICS视图提供了与节点状态、资源消耗等有关的各种信息。

**列**

|列名|数据类型|描述|
|---|---|---|
|`NODE_ID`|UUID|节点ID|
|`LAST_UPDATE_TIME`|TIMESTAMP|指标数据上次更新的时间|
|`MAX_ACTIVE_JOBS`|INT|节点曾经的最大并发作业数|
|`CUR_ACTIVE_JOBS`|INT|节点当前正在运行的活跃作业数|
|`AVG_ACTIVE_JOBS`|FLOAT|节点并发执行的平均活跃作业数|
|`MAX_WAITING_JOBS`|INT|节点曾经的最大等待作业数|
|`CUR_WAITING_JOBS`|INT|节点当前正在等待执行的作业数|
|`AVG_WAITING_JOBS`|FLOAT|节点的平均等待作业数|
|`MAX_REJECTED_JOBS`|INT|在一次冲突解决操作期间一次性的最大拒绝作业数|
|`CUR_REJECTED_JOBS`|INT|最近一次冲突解决操作中的拒绝作业数|
|`AVG_REJECTED_JOBS`|FLOAT|在冲突解决操作期间的平均拒绝作业数|
|`TOTAL_REJECTED_JOBS`|INT|节点启动后在冲突解决期间的拒绝作业总数|
|`MAX_CANCELED_JOBS`|INT|节点的并发最大取消作业数|
|`AVG_CANCELED_JOBS`|FLOAT|节点的并发平均取消作业数|
|`TOTAL_CANCELED_JOBS`|INT|节点启动后取消作业总数|
|`MAX_JOBS_WAIT_TIME`|TIME|节点中的作业执行前在队列中的最大等待时间|
|`CUR_JOBS_WAIT_TIME`|TIME|节点当前正在等待执行的作业的最长等待时间|
|`AVG_JOBS_WAIT_TIME`|TIME|节点中的作业执行前在队列中的平均等待时间|
|`MAX_JOBS_EXECUTE_TIME`|TIME|节点作业的最长执行时间|
|`CUR_JOBS_EXECUTE_TIME`|TIME|节点当前正在执行的作业的执行时间|
|`AVG_JOBS_EXECUTE_TIME`|TIME|节点作业的平均执行时间|
|`TOTAL_JOBS_EXECUTE_TIME`|TIME|节点启动后已经完成的作业的执行总时间|
|`TOTAL_EXECUTED_JOBS`|INT|节点启动后处理的作业总数|
|`TOTAL_EXECUTED_TASKS`|INT|节点处理过的任务总数|
|`TOTAL_BUSY_TIME`|TIME|节点处理作业花费的总时间|
|`TOTAL_IDLE_TIME`|TIME|节点的总空闲（未执行任何作业）时间|
|`CUR_IDLE_TIME`|TIME|节点执行最近的作业后的空闲时间|
|`BUSY_TIME_PERCENTAGE`|FLOAT|节点执行作业和空闲的时间占比|
|`IDLE_TIME_PERCENTAGE`|FLOAT|节点空闲和执行作业的时间占比|
|`TOTAL_CPU`|INT|JVM的可用CPU数量|
|`CUR_CPU_LOAD`|DOUBLE|在范围（0, 1）中以分数表示的CPU使用率|
|`AVG_CPU_LOAD`|DOUBLE|在范围（0, 1）中以分数表示的CPU平均使用率|
|`CUR_GC_CPU_LOAD`|DOUBLE|上次指标更新后花费在GC上的平均时间，指标默认2秒更新一次|
|`HEAP_MEMORY_INIT`|LONG|JVM最初从操作系统申请用于内存管理的堆内存量（字节）。如果初始内存大小未定义，则显示-1|
|`HEAP_MEMORY_USED`|LONG|当前用于对象分配的堆大小，堆由一个或多个内存池组成，该值为所有堆内存池中使用的堆内存总数|
|`HEAP_MEMORY_COMMITED`|LONG|JVM使用的堆内存量（字节），这个内存量保证由JVM使用，堆由一个或多个内存池组成，该值为所有堆内存池中JVM使用的堆内存总数|
|`HEAP_MEMORY_MAX`|LONG|用于内存管理的最大堆内存量（字节），如果最大内存量未指定，则显示-1|
|`HEAP_MEMORY_TOTAL`|LONG|堆内存总量（字节），如果总内存量未指定，则显示-1|
|`NONHEAP_MEMORY_INIT`|LONG|JVM最初从操作系统申请用于内存管理的非堆内存量（字节）。如果初始内存大小未定义，则显示-1|
|`NONHEAP_MEMORY_USED`|LONG|JVM当前使用的非堆内存量，非堆内存由一个或多个内存池组成，该值为所有非堆内存池中使用的非堆内存总数|
|`NONHEAP_MEMORY_COMMITED`|LONG|JVM使用的非堆内存量（字节），这个内存量保证由JVM使用。非堆内存由一个或多个内存池组成，该值为所有非堆内存池中使用的非堆内存总数|
|`NONHEAP_MEMORY_MAX`|LONG|可用于内存管理的最大非堆内存量（字节），如果最大内存量未指定，则显示-1|
|`NONHEAP_MEMORY_TOTAL`|LONG|可用于内存管理的非堆内存总量（字节），如果总内存量未指定，则显示-1|
|`UPTIME`|TIME|JVM的正常运行时间|
|`JVM_START_TIME`|TIMESTAMP|JVM的启动时间|
|`NODE_START_TIME`|TIMESTAMP|节点的启动时间|
|`LAST_DATA_VERSION`|LONG|数据网格为所有缓存操作赋予的不断增长的版本数，该值为节点的最新数据版本|
|`CUR_THREAD_COUNT`|INT|包括守护和非守护线程在内的所有有效线程总数|
|`MAX_THREAD_COUNT`|INT|JVM启动或峰值重置后的最大有效线程数|
|`TOTAL_THREAD_COUNT`|LONG|JVM启动后启动的线程总数|
|`CUR_DAEMON_THREAD_COUNT`|INT|当前的有效守护线程数|
|`SENT_MESSAGES_COUNT`|INT|节点发送的通信消息总量|
|`SENT_BYTES_COUNT`|LONG|发送的字节量|
|`RECEIVED_MESSAGES_COUNT`|INT|节点接收的通信消息总量|
|`RECEIVED_BYTES_COUNT`|LONG|接收的字节量|
|`OUTBOUND_MESSAGES_QUEUE`|INT|出站消息队列大小|

### 9.1.5.示例
可以使用SQLLine工具查询系统视图，先接入IGNITE模式，如下：
```bash
$ ./sqlline.sh -u jdbc:ignite:thin://127.0.0.1/IGNITE
```
执行查询：
```sql
-- get the list of nodes
select * from NODES;

-- view the CPU load as a percentage for a specific node
select CUR_CPU_LOAD * 100 from NODE_METRICS where NODE_ID = 'a1b77663-b37f-4ddf-87a6-1e2d684f3bae'
```
如果使用Java瘦客户端，如下：
```java
ClientConfiguration cfg = new ClientConfiguration().setAddresses("127.0.0.1:10800");

try (IgniteClient igniteClient = Ignition.startClient(cfg)) {
    System.out.println();

    // getting the id of the first node 
    UUID nodeId = (UUID) igniteClient.query(new SqlFieldsQuery("SELECT * from NODES").setSchema("IGNITE"))
    .getAll().iterator().next().get(0);

    double cpu_load = (double) igniteClient
    .query(new SqlFieldsQuery("select CUR_CPU_LOAD * 100 from NODE_METRICS where NODE_ID = ? ")
    .setSchema("IGNITE").setArgs(nodeId.toString()))
    .getAll().iterator().next().get(0);
  
    System.out.println("node's cpu load = " + cpu_load);

} catch (ClientException e) {
    System.err.println(e.getMessage());
} catch (Exception e) {
    System.err.format("Unexpected failure: %s\n", e);
}
```
## 9.2.JDBC/ODBC会话管理
接入集群的JDBC/ODBC/瘦客户端列表，可以通过一个JMX客户端使用`org.apache.ignite.mxbean.ClientProcessorMXBean`MBean获取。

下图显示了如何使用JConsole进行访问：
![](https://files.readme.io/6a532f9-monitoring.png)
`ClientProcessMXBean`有一个`Connections`属性，它以如下形式返回客户端列表：
```
JdbcClient [id=4294967297, user=<anonymous>, rmtAddr=127.0.0.1:39264, locAddr=127.0.0.1:10800]
```
使用该Bean提供的功能，可以通过ID删除特定的连接，也可以一次删除所有的连接。
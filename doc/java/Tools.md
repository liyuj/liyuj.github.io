# 工具
## 1.控制脚本
Ignite提供了一个命令行脚本`control.sh|bat`，可以用它来对集群进行监控和管理，该脚本位于安装目录的`/bin/`文件夹。

控制脚本的语法如下：

<Tabs>
<Tab title="Linux">

```shell
control.sh <connection parameters> <command> <arguments>
```
</Tab>

<Tab title="Windows">

```batch
control.bat <connection parameters> <command> <arguments>
```
</Tab>
</Tabs>

### 1.1.接入集群
如果执行脚本时没有连接参数，控制脚本会尝试连接运行在本机的节点（`localhost:11211`），如果希望接入运行在远程主机上的节点，需要指定连接参数：

|参数|描述|默认值|
|---|---|---|
|--host HOST_OR_IP|节点的主机名或者IP地址|`localhost`|
|--port PORT|连接端口|`11211`|
|--user USER|用户名||
|--password PASSWORD|密码||
|--ping-interval PING_INTERVAL|ping操作间隔|`5000`|
|--ping-timeout PING_TIMEOUT|ping操作响应超时|`30000`|
|--ssl-protocol PROTOCOL1, PROTOCOL2…​|接入集群时尝试的SSL协议列表，支持的协议在[这里](https://docs.oracle.com/javase/8/docs/technotes/guides/security/SunProviders.html#SunJSSE_Protocols)。|`TLS`|
|--ssl-cipher-suites CIPHER1,CIPHER2…​|SSL密码列表，支持的密码在[这里](https://docs.oracle.com/javase/8/docs/technotes/guides/security/SunProviders.html#SupportedCipherSuites)。||
|--ssl-key-algorithm ALG|SSL密钥算法|`SunX509`|
|--keystore-type KEYSTORE_TYPE|密钥库类型|`JKS`|
|--keystore KEYSTORE_PATH|密钥库路径，为控制脚本指定密钥库来开启SSL||
|--keystore-password KEYSTORE_PWD|密钥库密码||
|--truststore-type TRUSTSTORE_TYPE|信任库类型|`JKS`|
|--truststore TRUSTSTORE_PATH|信任库路径||
|--truststore-password TRUSTSTORE_PWD||信任库密码|

### 1.2.激活、冻结和拓扑管理
可以使用控制脚本来激活/冻结集群，以及管理[基线拓扑](/doc/java/Clustering.md#_7-基线拓扑)。
#### 1.2.1.获取集群状态
集群可以有3个状态：激活、只读和非激活，具体可以参见[集群状态](/doc/java/Monitoring.md#_3-集群状态)章节的介绍。

执行下面的命令，可以获得集群的状态：

<Tabs>
<Tab title="Linux">

```shell
control.sh --state
```
</Tab>

<Tab title="Windows">

```batch
control.bat --state
```
</Tab>
</Tabs>

#### 1.2.2.激活集群
激活是将当前可用的服务端节点集配置为基线拓扑，只有使用[原生持久化](/doc/java/Persistence.md#_1-ignite持久化)时才需要激活。

使用下面的命令可以激活集群。

<Tabs>
<Tab title="Linux">

```shell
control.sh --set-state ACTIVE
```
</Tab>

<Tab title="Windows">

```batch
control.bat --set-state ACTIVE
```
</Tab>
</Tabs>

#### 1.2.3.冻结集群
::: danger 警告
冻结会释放所有节点的内存资源，包括应用的数据，并禁用公开的集群API。如果内存中的缓存没有备份到持久化存储（不管是[原生持久化](/doc/java/Persistence.md#_1-ignite持久化)还是[外部存储](/doc/java/Persistence.md#_2-外部存储)），会丢失所有的数据，然后需要重新注入缓存数据。
:::
执行下面的命令可以冻结集群：

<Tabs>
<Tab title="Linux">

```shell
control.sh --set-state INACTIVE [--yes]
```
</Tab>

<Tab title="Windows">

```batch
control.bat --set-state INACTIVE [--yes]
```
</Tab>
</Tabs>

#### 1.2.4.获取基线中注册的节点
执行下面的命令可以获得基线中注册的节点列表：

<Tabs>
<Tab title="Linux">

```shell
control.sh --baseline
```
</Tab>

<Tab title="Windows">

```batch
control.bat --baseline
```
</Tab>
</Tabs>

输出中包含了当前的拓扑版本，基线中节点的唯一性ID列表，以及加入集群但是还没有添加到基线的节点列表。

```
Command [BASELINE] started
Arguments: --baseline
--------------------------------------------------------------------------------
Cluster state: active
Current topology version: 3

Current topology version: 3 (Coordinator: ConsistentId=dd3d3959-4fd6-4dc2-8199-bee213b34ff1, Order=1)

Baseline nodes:
    ConsistentId=7d79a1b5-cbbd-4ab5-9665-e8af0454f178, State=ONLINE, Order=2
    ConsistentId=dd3d3959-4fd6-4dc2-8199-bee213b34ff1, State=ONLINE, Order=1
--------------------------------------------------------------------------------
Number of baseline nodes: 2

Other nodes:
    ConsistentId=30e16660-49f8-4225-9122-c1b684723e97, Order=3
Number of other nodes: 1
Command [BASELINE] finished with code: 0
Control utility has completed execution at: 2019-12-24T16:53:08.392865
Execution time: 333 ms
```
#### 1.2.5.往基线拓扑中添加节点
使用下面的命令可以往基线拓扑中添加节点。节点加入之后，会开启[再平衡过程](/doc/java/DataRebalancing.md)。

<Tabs>
<Tab title="Linux">

```shell
control.sh --baseline add consistentId1,consistentId2,... [--yes]
```
</Tab>

<Tab title="Windows">

```batch
control.bat --baseline add consistentId1,consistentId2,... [--yes]
```
</Tab>
</Tabs>

#### 1.2.6.从基线拓扑中删除节点
使用下面的命令可以从基线拓扑中删除节点。只有离线的节点才能从基线拓扑中删除，需要先停止该节点然后才能执行`remove`命令。这个操作会开启再平衡过程，会在基线拓扑的剩余节点中重新分布数据。

<Tabs>
<Tab title="Linux">

```shell
control.sh --baseline remove consistentId1,consistentId2,... [--yes]
```
</Tab>

<Tab title="Windows">

```batch
control.bat --baseline remove consistentId1,consistentId2,... [--yes]
```
</Tab>
</Tabs>

#### 1.2.7.配置基线拓扑
可以通过提供节点的唯一性ID列表，或者通过指定基线拓扑版本来配置基线拓扑。

要将一组节点配置为基线，可以使用下面的命令：

<Tabs>
<Tab title="Linux">

```shell
control.sh --baseline set consistentId1,consistentId2,... [--yes]
```
</Tab>

<Tab title="Windows">

```batch
control.bat --baseline set consistentId1,consistentId2,... [--yes]
```
</Tab>
</Tabs>

要恢复指定版本的基线，可以使用下面的命令：

<Tabs>
<Tab title="Linux">

```shell
control.sh --baseline version topologyVersion [--yes]
```
</Tab>

<Tab title="Windows">

```batch
control.bat --baseline version topologyVersion [--yes]
```
</Tab>
</Tabs>

#### 1.2.8.启用基线拓扑自动调整
[基线拓扑自动调整](/doc/java/Clustering.md#_7-3-基线拓扑自动调整)是指在拓扑稳定特定时间后自动更新基线拓扑。

对于纯内存集群，自动调整是默认启用的，并且超时设置为0。这意味着基线拓扑在服务端节点加入或离开集群后立即更改。对于开启持久化的集群，自动调整默认是警用的，使用以下命令可以开启：

<Tabs>
<Tab title="Linux">

```shell
control.sh --baseline auto_adjust enable timeout 30000
```
</Tab>

<Tab title="Windows">

```batch
control.bat --baseline auto_adjust enable timeout 30000
```
</Tab>
</Tabs>

超时时间以毫秒计，在上一次JOIN/LEFT/FAIL事件之后经过给定的毫秒数时，会将基线设置为当前拓扑。每个新的JOIN/LEFT/FAIL事件都会重新启动超时倒计时。

使用以下命令可以禁用基线自动调整：

<Tabs>
<Tab title="Linux">

```shell
control.sh --baseline auto_adjust disable
```
</Tab>

<Tab title="Windows">

```batch
control.bat --baseline auto_adjust disable
```
</Tab>
</Tabs>

### 1.3.事务管理
控制脚本可以拿到集群中正在执行的事务的信息，也可以取消特定的事务。

下面的命令可以返回匹配过滤条件的事务列表（或者没有过滤条件返回所有的事务）：

<Tabs>
<Tab title="Linux">

```shell
control.sh --tx <transaction filter> --info
```
</Tab>

<Tab title="Windows">

```batch
control.bat --tx <transaction filter> --info
```
</Tab>
</Tabs>

事务过滤器参数在下表列出：

|参数|描述|
|---|---|
|--xid XID|事务ID|
|--min-duration SECONDS|事务已执行的最小秒数|
|--min-size SIZE|事务大小最小值|
|--label LABEL|事务的标签，可以使用正则表达式|
|--servers|--clients|将操作范围限制为服务器或客户端节点|
|--nodes nodeId1,nodeId2…​|希望获得事务信息的节点唯一性ID列表|
|--limit NUMBER|将事务数限制为指定值|
|--order DURATION|SIZE|START_TIME|该参数用于限制输出的顺序|

使用下面的命令可以取消事务：

<Tabs>
<Tab title="Linux">

```shell
control.sh --tx <transaction filter> --kill
```
</Tab>

<Tab title="Windows">

```batch
control.bat --tx <transaction filter> --kill
```
</Tab>
</Tabs>

要取消已运行超过100秒的事务，请执行以下命令：

```shell
control.sh --tx --min-duration 100 --kill
```

### 1.4.事务竞争检测
`contention`命令可用于检测多个事务在相同键上竞争创建锁的情况，当有事务长期运行或者挂起时，该命令很有用。

示例：
```shell
# Reports all keys that are point of contention for at least 5 transactions on all cluster nodes.
control.sh|bat --cache contention 5

# Reports all keys that are point of contention for at least 5 transactions on specific server node.
control.sh|bat --cache contention 5 f2ea-5f56-11e8-9c2d-fa7a
```
如果存在任何竞争激烈的键，该工具将转储大量信息，包括发生争用的键、事务和节点。

示例：
```shell
[node=TcpDiscoveryNode [id=d9620450-eefa-4ab6-a821-644098f00001, addrs=[127.0.0.1], sockAddrs=[/127.0.0.1:47501], discPort=47501, order=2, intOrder=2, lastExchangeTime=1527169443913, loc=false, ver=2.5.0#20180518-sha1:02c9b2de, isClient=false]]

// No contention on node d9620450-eefa-4ab6-a821-644098f00001.

[node=TcpDiscoveryNode [id=03379796-df31-4dbd-80e5-09cef5000000, addrs=[127.0.0.1], sockAddrs=[/127.0.0.1:47500], discPort=47500, order=1, intOrder=1, lastExchangeTime=1527169443913, loc=false, ver=2.5.0#20180518-sha1:02c9b2de, isClient=false]]
    TxEntry [cacheId=1544803905, key=KeyCacheObjectImpl [part=0, val=0, hasValBytes=false], queue=10, op=CREATE, val=UserCacheObjectImpl [val=0, hasValBytes=false], tx=GridNearTxLocal[xid=e9754629361-00000000-0843-9f61-0000-000000000001, xidVersion=GridCacheVersion [topVer=138649441, order=1527169439646, nodeOrder=1], concurrency=PESSIMISTIC, isolation=REPEATABLE_READ, state=ACTIVE, invalidate=false, rollbackOnly=false, nodeId=03379796-df31-4dbd-80e5-09cef5000000, timeout=0, duration=1247], other=[]]
    TxEntry [cacheId=1544803905, key=KeyCacheObjectImpl [part=0, val=0, hasValBytes=false], queue=10, op=READ, val=null, tx=GridNearTxLocal[xid=8a754629361-00000000-0843-9f61-0000-000000000001, xidVersion=GridCacheVersion [topVer=138649441, order=1527169439656, nodeOrder=1], concurrency=PESSIMISTIC, isolation=REPEATABLE_READ, state=ACTIVE, invalidate=false, rollbackOnly=false, nodeId=03379796-df31-4dbd-80e5-09cef5000000, timeout=0, duration=1175], other=[]]
    TxEntry [cacheId=1544803905, key=KeyCacheObjectImpl [part=0, val=0, hasValBytes=false], queue=10, op=READ, val=null, tx=GridNearTxLocal[xid=6a754629361-00000000-0843-9f61-0000-000000000001, xidVersion=GridCacheVersion [topVer=138649441, order=1527169439654, nodeOrder=1], concurrency=PESSIMISTIC, isolation=REPEATABLE_READ, state=ACTIVE, invalidate=false, rollbackOnly=false, nodeId=03379796-df31-4dbd-80e5-09cef5000000, timeout=0, duration=1175], other=[]]
    TxEntry [cacheId=1544803905, key=KeyCacheObjectImpl [part=0, val=0, hasValBytes=false], queue=10, op=READ, val=null, tx=GridNearTxLocal[xid=7a754629361-00000000-0843-9f61-0000-000000000001, xidVersion=GridCacheVersion [topVer=138649441, order=1527169439655, nodeOrder=1], concurrency=PESSIMISTIC, isolation=REPEATABLE_READ, state=ACTIVE, invalidate=false, rollbackOnly=false, nodeId=03379796-df31-4dbd-80e5-09cef5000000, timeout=0, duration=1175], other=[]]
    TxEntry [cacheId=1544803905, key=KeyCacheObjectImpl [part=0, val=0, hasValBytes=false], queue=10, op=READ, val=null, tx=GridNearTxLocal[xid=4a754629361-00000000-0843-9f61-0000-000000000001, xidVersion=GridCacheVersion [topVer=138649441, order=1527169439652, nodeOrder=1], concurrency=PESSIMISTIC, isolation=REPEATABLE_READ, state=ACTIVE, invalidate=false, rollbackOnly=false, nodeId=03379796-df31-4dbd-80e5-09cef5000000, timeout=0, duration=1175], other=[]]

// Node 03379796-df31-4dbd-80e5-09cef5000000 is place for contention on key KeyCacheObjectImpl [part=0, val=0, hasValBytes=false].
```
### 1.5.缓存状态监控
控制脚本的另一个重要命令是`--cache list`，其用于缓存的监控。该命令可以提供已部署缓存的列表及其关联/分布参数，还有在缓存组内的分布，另外还有一个命令用于查看已有的原子序列。

```shell
# Displays a list of all caches
control.sh|bat --cache list .

# Displays a list of caches whose names start with "account-".
control.sh|bat --cache list account-.*

# Displays info about cache group distribution for all caches.
control.sh|bat --cache list . --groups

# Displays info about cache group distribution for the caches whose names start with "account-".
control.sh|bat --cache list account-.* --groups

# Displays info about all atomic sequences.
control.sh|bat --cache list . --seq

# Displays info about the atomic sequnces whose names start with "counter-".
control.sh|bat --cache list counter-.* --seq
```
### 1.6.丢失分区重置
可以使用控制脚本重置某个缓存丢失的分区，具体请参见[分区丢失策略](/doc/java/ConfiguringCaches.md#_3-分区丢失策略)。
```shell
control.sh --cache reset_lost_partitions cacheName1,cacheName2,...
```
### 1.7.一致性检查命令
`control.sh|bat`包括一组一致性检查命令，可用于验证内部数据的一致性。

首先，这些命令可用于调试和故障排除场景，尤其是在开发高峰期。

其次，如果怀疑查询（例如SQL查询等）返回的结果集不完整或错误，则这些命令可以验证数据中是否存在不一致。

最后，一致性检查命令可以用作常规集群运行状况检测的一部分。

下面看下更具体的使用场景：
#### 1.7.1.验证分区校验和
`idle_verify`命令将主分区的哈希与备份分区的哈希进行比较，并报告差异。差异可能是更新操作期间节点故障或非正常关闭导致。如果检测到任何不一致之处，建议删除不正确的分区。
```shell
# Checks partitions of all caches that their partitions actually contain same data.
control.sh|bat --cache idle_verify

# Checks partitions of specific caches that their partitions actually contain same data.
control.sh|bat --cache idle_verify cache1,cache2,cache3
```
如果有分区出现偏离，则会输出冲突的分区列表，如下所示：
```
idle_verify check has finished, found 2 conflict partitions.

Conflict partition: PartitionKey [grpId=1544803905, grpName=default, partId=5]
Partition instances: [PartitionHashRecord [isPrimary=true, partHash=97506054, updateCntr=3, size=3, consistentId=bltTest1], PartitionHashRecord [isPrimary=false, partHash=65957380, updateCntr=3, size=2, consistentId=bltTest0]]
Conflict partition: PartitionKey [grpId=1544803905, grpName=default, partId=6]
Partition instances: [PartitionHashRecord [isPrimary=true, partHash=97595430, updateCntr=3, size=3, consistentId=bltTest1], PartitionHashRecord [isPrimary=false, partHash=66016964, updateCntr=3, size=2, consistentId=bltTest0]]
```
::: danger idle_verify检查期间集群应处于空闲状态
当`idle_verify`计算哈希时，所有的更新应停止，否则可能显示错误的结果。如果正在不停地更新，比较一个分布式系统的大规模数据集是不可能的。
:::
#### 1.7.2.验证SQL索引一致性
`validate_indexes`命令将验证所有集群节点上给定缓存的索引。

验证过程将检查以下内容：

 1. 二级SQL索引可以访问主索引引用的所有键-值条目；
 2. 主索引引用的所有键-值条目都必须是可访问的，主索引的引用不应指向空值；
 3. 主索引可以访问二级SQL索引引用的所有键-值条目。

```shell
# Checks indexes of all caches on all cluster nodes.
control.sh|bat --cache validate_indexes

# Checks indexes of specific caches on all cluster nodes.
control.sh|bat --cache validate_indexes cache1,cache2

# Checks indexes of specific caches on node with given node ID.
control.sh|bat --cache validate_indexes cache1,cache2 f2ea-5f56-11e8-9c2d-fa7a
```
如果索引引用了不存在的条目（或部分条目未被索引），会输出错误，如下所示：
```
PartitionKey [grpId=-528791027, grpName=persons-cache-vi, partId=0] ValidateIndexesPartitionResult [updateCntr=313, size=313, isPrimary=true, consistentId=bltTest0]
IndexValidationIssue [key=0, cacheName=persons-cache-vi, idxName=_key_PK], class org.apache.ignite.IgniteCheckedException: Key is present in CacheDataTree, but can't be found in SQL index.
IndexValidationIssue [key=0, cacheName=persons-cache-vi, idxName=PERSON_ORGID_ASC_IDX], class org.apache.ignite.IgniteCheckedException: Key is present in CacheDataTree, but can't be found in SQL index.
validate_indexes has finished with errors (listed above).
```
::: danger validate_indexes检查期间集群应处于空闲状态
与`idle_verify`一样，索引验证工具仅在停止更新后才能正常工作。否则检查程序线程与更新条目/索引的线程之间可能会出现竞争，这可能导致错误的检测结果。
:::
### 1.8.追踪配置
通过`--tracing-configuration`命令可以启用/禁用某个API的追踪采样，具体请参见[追踪](/doc/java/Monitoring.md#_7-追踪)章节的介绍。

使用该命令之前，需要开启控制脚本的试验性功能：
```shell
export IGNITE_ENABLE_EXPERIMENTAL_COMMAND=true
```
执行下面的命令可以查看当前的追踪配置：
```shell
control.sh --tracing-configuration
```
要启用某个API的追踪采样：
```shell
control.sh --tracing-configuration set --scope <scope> --sampling-rate <rate> --label <label>
```
参数：

|参数|描述|
|---|---|
|`--scope`|要追踪的API：<br>1.`DISCOVERY`：发现事件；<br>2.`EXCHANGE`：交换事件；<br>3.`COMMUNICATION`：通信事件；<br>4.`TX`：事务|
|`--sampling-rate`|概率采样率，介于`0.0`和`1.0`之间的数字（包含），`0`表示不采样（默认），`1`表示始终采样。例如`0.5`表示每条追踪都以50％的概率采样|
|`--label`|仅适用于`TX`API范围。该参数定义具有给定标签的事务的采样率。当指定`--label`参数时，则Ignite将追踪指定标签的事务。可以为不同的标签配置不同的采样率。没有标签的事务追踪将以默认采样率采样，`TX`范围的默认采样率可以通过不带`--label`参数的命令进行配置|

示例：

 - 追踪所有的发现事件：

    ```shell
    control.sh --tracing-configuration set --scope DISCOVER --sampling-rate 1
    ```
 - 追踪所有的事务：

    ```shell
    control.sh --tracing-configuration set --scope TX --sampling-rate 1
    ```
 - 配置标签为`report`的事务的采样率为50%：

    ```shell
    control.sh --tracing-configuration set --scope TX --sampling-rate 0.5
    ```

### 1.9.集群ID和标签
集群ID可以唯一标识一个集群，其是在集群第一次启动时自动生成的，具体请参见[集群ID和标签](/doc/java/Monitoring.md#_2-集群id和标签)章节的内容。

使用`--state`命令可查看当前集群的ID：

<Tabs>
<Tab title="Linux">

```shell
control.sh --state
```
</Tab>

<Tab title="Windows">

```batch
control.bat --state
```
</Tab>
</Tabs>

然后检查输出：
```
Command [STATE] started
Arguments: --state
--------------------------------------------------------------------------------
Cluster  ID: bf9764ea-995e-4ea9-b35d-8c6d078b0234
Cluster tag: competent_black
--------------------------------------------------------------------------------
Cluster is active
Command [STATE] finished with code: 0
```
集群标签是可以分配给集群的用户友好名称，使用以下命令可以修改标签（标签不得超过280个字符）：

<Tabs>
<Tab title="Linux">

```shell
control.sh --change-tag <new-tag>
```
</Tab>

<Tab title="Windows">

```batch
control.bat --change-tag <new-tag>
```
</Tab>
</Tabs>

## 2.Visor终端
### 2.1.摘要
Visor命令行接口（CMD）是一个用于Ignite集群监控的命令行工具，它提供有关集群节点、缓存和计算任务的基本统计信息，还可以通过启动或停止节点来管理群集的大小。

![](https://ignite.apache.org/docs/2.9.0/images/tools/visor-cmd.png)

### 2.2.使用
Ignite通过`IGNITE_HOME/bin/ignitevisorcmd.{sh|bat}`脚本来启动Visor终端，要将Visor接入集群，需要使用`open`命令。

Visor支持下面的命令，要获得某个命令完整的信息，可以输入`help "cmd"`或者`? "cmd"`。

|命令|别名|描述|
|---|---|---|
|ack||所有远程节点的Ack参数|
|alert||提示用户定义的事件|
|cache||输出缓存的统计数据，清理缓存，从缓存输出所有条目的列表|
|close||将visor从网格断开|
|config||输出节点的配置|
|deploy||将文件或者文件夹复制到远程主机|
|disco||输出拓扑变更日志|
|events||从一个节点输出事件|
|gc||在远程节点运行GC|
|help|?|输出Visor控制台帮助|
|kill||杀掉或者重启节点|
|log||启动或者停止网格范围的事件日志|
|mclear||清除Visor控制台内存变量|
|mget||获取Visor控制台内存变量|
|mlist||输出Visor控制台内存变量|
|node||输出节点统计数据|
|open||将Visor接入网格|
|ping||ping节点|
|quit||退出Visor控制台|
|start||在远程主机启动或者重启节点|
|status|!|输出Visor控制台状态|
|tasks||输出任务执行统计数据|
|top||输出当前的拓扑|
|vvm||打开节点的VisualVM|

## 3.SQLLine
### 3.1.概述
Ignite提供了一个[SQLLine](http://sqlline.sourceforge.net/)工具，它是一个接入关系数据库然后执行SQL命令的基于命令行的工具，本章节会描述如何用SQLLine接入Ignite集群，以及Ignite支持的各种SQLLine命令。
### 3.2.接入集群
在`IGNITE_HOME/bin`目录中，执行`sqlline.sh -u jdbc:ignite:thin:[host]`命令就可以使用SQLLine接入集群，注意要将`[host]`替换为实际的值，比如：

<Tabs>
<Tab title="Linux">

```bash
./sqlline.sh --verbose=true -u jdbc:ignite:thin://127.0.0.1/
```
</Tab>

<Tab title="Windows">

```batch
sqlline.bat --verbose=true -u jdbc:ignite:thin://127.0.0.1/
```
</Tab>

</Tabs>

输入`./sqlline.sh -h`或者`./sqlline.sh --help`可以看到可用的各种选项。
#### 3.2.1.认证
如果集群打开了认证，那么在`IGNITE_HOME/bin`目录中，通过运行`jdbc:ignite:thin://[address]:[port];user=[username];password=[password]`命令SQLLine才可以接入集群。注意要将`[address]`，`[port]`，`[username]`和`[password]替换为实际值，比如：

<Tabs>
<Tab title="Linux">

```bash
./sqlline.sh --verbose=true -u "jdbc:ignite:thin://127.0.0.1:10800;user=ignite;password=ignite"
```
</Tab>

<Tab title="Windows">

```batch
sqlline.bat --verbose=true -u "jdbc:ignite:thin://127.0.0.1:10800;user=ignite;password=ignite"
```
</Tab>
</Tabs>

如果未开启认证，需要忽略`[username]`和`[password]`。

::: tip 通过bash接入时JDBC URL要加引号
当在bash环境中接入时连接的URL一定要加`" "`，比如：`"jdbc:ignite:thin://[address]:[port];user=[username];password=[password]"`。
:::

### 3.3.命令
下面是Ignite支持的[SQLLine命令](http://sqlline.sourceforge.net/#commands)列表：

|命令|描述|
|---|---|
|`!all`|在当前的所有连接中执行指定的SQL|
|`!batch`|开始执行一批SQL语句|
|`!brief`|启动简易输出模式|
|`!closeall`|关闭所有目前已打开的连接|
|`!columns`|显示表中的列|
|`!connect`|接入数据库|
|`!dbinfo`|列出当前连接的元数据信息|
|`!dropall`|删除数据库中的所有表|
|`!go`|转换到另一个活动连接|
|`!help`|显示帮助信息|
|`!history`|显示命令历史|
|`!indexes`|显示表的索引|
|`!list`|显示所有的活动连接|
|`!manual`|显示SQLLine手册|
|`!metadata`|调用任意的元数据命令|
|`!nickname`|为连接命名（更新命令提示）|
|`!outputformat`|改变显示SQL结果的方法|
|`!primarykeys`|显示表的主键列|
|`!properties`|使用指定的属性文件接入数据库|
|`!quit`|退出SQLLine|
|`!reconnect`|重新连接当前的数据库|
|`!record`|开始记录SQL命令的所有输出|
|`!run`|执行一个命令脚本|
|`!script`|将已执行的命令保存到一个文件|
|`!sql`|在数据库上执行一个SQL|
|`!tables`|列出数据库中的所有表|
|`!verbose`|启动详细输出模式|

上面的列表可能不完整，还可能添加支持其它的SQLLine命令。

### 3.4.示例
接入集群后，就可以执行SQL语句和SQLLine命令，比如：

<Tabs>
<Tab title="创建表">

```sql
0: jdbc:ignite:thin://127.0.0.1/> CREATE TABLE City (id LONG PRIMARY KEY, name VARCHAR) WITH "template=replicated";
No rows affected (0.301 seconds)

0: jdbc:ignite:thin://127.0.0.1/> CREATE TABLE Person (id LONG, name VARCHAR, city_id LONG, PRIMARY KEY (id, city_id))WITH "backups=1, affinityKey=city_id";
No rows affected (0.078 seconds)

0: jdbc:ignite:thin://127.0.0.1/> !tables
+-----------+--------------+--------------+-------------+-------------+
| TABLE_CAT | TABLE_SCHEM  |  TABLE_NAME  | TABLE_TYPE  | REMARKS     |
+-----------+--------------+--------------+-------------+-------------+
|           | PUBLIC       | CITY         | TABLE       |             |
|           | PUBLIC       | PERSON       | TABLE       |             |
+-----------+--------------+--------------+-------------+-------------+
```
</Tab>

<Tab title="定义索引">

```sql
0: jdbc:ignite:thin://127.0.0.1/> CREATE INDEX idx_city_name ON City (name);
No rows affected (0.039 seconds)

0: jdbc:ignite:thin://127.0.0.1/> CREATE INDEX idx_person_name ON Person (name);
No rows affected (0.013 seconds)

0: jdbc:ignite:thin://127.0.0.1/> !indexes
+-----------+--------------+--------------+-------------+-----------------+
| TABLE_CAT | TABLE_SCHEM  |  TABLE_NAME  | NON_UNIQUE  | INDEX_QUALIFIER |
+-----------+--------------+--------------+-------------+-----------------+
|           | PUBLIC       | CITY         | true        |                 |
|           | PUBLIC       | PERSON       | true        |                 |
+-----------+--------------+--------------+-------------+-----------------+
```
</Tab>
</Tabs>

## 4.Tableau
### 4.1.概述
[Tableau](http://www.tableau.com/)是一个聚焦于商务智能领域的交互式数据可视化工具。它使用ODBC API接入各种数据库和数据平台，然后分析里面的数据。

Ignite有自己的ODBC实现，这样就使从Tableau端接入Ignite成为可能，并且可以分析存储于分布式Ignite集群中的数据。
### 4.2.安装和配置
要从Tableau接入Ignite，需要进行如下操作：

 - 下载并且安转Tableau桌面版，可以在其[产品主页](http://www.tableau.com/)查看官方文档；
 - 在Windows或者基于Unix的操作系统上安装Ignite的ODBC驱动；
 - 最后，通过DSN配置驱动，Tableau会通过DSN配置接入；
 - ODBC驱动通过一个叫做`ODBC processor`的协议与Ignite集群通信，一定要确保这个组件在集群端已经启用。

上述步骤完成后，就可以接入集群然后分析数据了。
### 4.3.接入集群

 1. 启动Tableau应用，然后在`Connect` ⇒ `To a Server` ⇒ `More...`窗口中找到`Other Databases (ODBC)`配置；
![](https://ignite.apache.org/docs/2.9.0/images/tools/tableau-choosing_driver_01.png)
 2. 点击`Edit connection`链接；
![](https://ignite.apache.org/docs/2.9.0/images/tools/tableau-edit_connection.png)
 3. 配置之前设定的`DSN`属性值，下面的示例中为：`LocalApacheIgniteDSN`，做完之后，点击`Connect`按钮；
![](https://ignite.apache.org/docs/2.9.0/images/tools/tableau-choose_dsn_01.png)
 4. Tableau会试图验证这个连接，如果验证通过，`Sign In`按钮以及其它的与连接有关的字段就会变为可用状态，点击`Sign In`就会完成连接过程；
![](https://ignite.apache.org/docs/2.9.0/images/tools/tableau-choose_dsn_02.png)

### 4.4.数据查询和分析
成功建立Ignite和Tableau之间的连接之后，就可以通过Tableau支持的各种方式对数据进行查询和分析，通过[官方文档](http://www.tableau.com/learn/training)可以了解更多的细节。

![](https://ignite.apache.org/docs/2.9.0/images/tools/tableau-creating_dataset.png)
![](https://ignite.apache.org/docs/2.9.0/images/tools/tableau-visualizing_data.png)

## 5.Informatica
### 5.1.概述
Informatica是一个云数据管理和集成工具，可以通过ODBC连接将Informatica接入Ignite。
### 5.2.从Informatica PowerCenter Designer接入
在PowerCenter Designer中，必须安装32位的Ignite ODBC驱动才能接入Ignite，可以按照下面链接的内容安装ODBC驱动并且创建DSN：

 - [在Windows上安装](/doc/java/WorkingwithSQL.md#_10-1-6-1-在windows上安装)；
 - [配置DSN](/doc/java/WorkingwithSQL.md#_10-2-4-配置dsn)。

然后：

 1. 如果要从Ignite中导入表，在`Sources`或者`Targets`菜单中选择`Import from Database...`；
 2. 通过选择`Apache Ignite DSN`作为ODBC数据源接入集群。

![](https://ignite.apache.org/docs/2.9.0/images/tools/informatica-import-tables.png)
### 5.3.在Informatica服务节点上安装Ignite ODBC
在[在Linux上构建](/doc/java/WorkingwithSQL.md#_10-1-5-3-在linux上构建)和[在Linux上安装](/doc/java/WorkingwithSQL.md#_10-1-6-2-在linux上安装)文档中，描述了如何在Ignite服务端节点上安装Ignite ODBC。

Informatica会使用`$ODBCINI`和`$ODBCISTINI`环境变量指定的配置文件（[为ODBC配置UNIX环境变量](https://kb.informatica.com/howto/6/Pages/19/499306.aspx)）。配置Ignite ODBC驱动和创建新的DSN，如下所示：

<Tabs>
<Tab title="odbc.ini">

```ini
[ApacheIgnite]
Driver      = /usr/local/lib/libignite-odbc.so
Description = Apache Ignite ODBC
Address = 192.168.0.105
User = ignite
Password = ignite
Schema = PUBLIC
```
</Tab>

<Tab title="odbcinst.ini">

```ini
[ApacheIgnite]
Driver  = /usr/local/lib/libignite-odbc.so
```
</Tab>
</Tabs>

要验证ODBC连接，可以使用Informatica的`ssgodbc.linux64`工具，如下所示：
```bash
<INFORMATICA_HOME>/tools/debugtools/ssgodbc/linux64/ssgodbc.linux64 -d ApacheIgnite -u ignite -p ignite -v
```
如果`unixODBC`或者Ignite的ODBC库没有安装在默认的目录中-`/usr/local/lib`，则需要将其加入`LD_LIBRARY_PATH`然后再次测试，如下：
```bash
UNIXODBC_LIB=/opt/unixodbc/lib/
IGNITE_ODBC_LIB=/opt/igniteodbc/lib
LD_LIBRARY_PATH=<UNIXODBC_LIB>:<IGNITE_ODBC_LIB>

<INFORMATICA_HOME>/tools/debugtools/ssgodbc/linux64/ssgodbc.linux64 -d ApacheIgnite -u ignite -p ignite -v
```
### 5.4.配置相关的连接
选择`Connections`>`Relational...`可以显示`Relational Connection Browser`。

选中ODBC类型然后创建一个新的连接。
![](https://ignite.apache.org/docs/2.9.0/images/tools/informatica-rel-connection.png)
### 5.5.在Suse 11.4中安装Ignite ODBC
下面是在Suse 11.4环境中构建Ignite和Ignite ODBC驱动的步骤。

1. 添加仓库 - `oss`，`non-oss`，`openSUSE_Factory`，`devel_gcc`；
```bash
sudo zypper ar http://download.opensuse.org/distribution/11.4/repo/oss/ oss
sudo zypper ar http://download.opensuse.org/distribution/11.4/repo/non-oss/ non-oss
sudo zypper ar https://download.opensuse.org/repositories/devel:/tools:/building/openSUSE_Factory/ openSUSE_Factory
sudo zypper ar http://download.opensuse.org/repositories/devel:/gcc/SLE-11/  devel_gcc
```
 2. 安装`automake`和`autoconf`：
```bash
sudo zypper install autoconf automake
```
 3. 安装`libtool`：
```bash
sudo zypper install libtool-2.4.6-7.1.x86_64

Loading repository data...
Reading installed packages...
Resolving package dependencies...

Problem: nothing provides m4 >= 1.4.16 needed by libtool-2.4.6-7.1.x86_64
 Solution 1: do not install libtool-2.4.6-7.1.x86_64
 Solution 2: break libtool-2.4.6-7.1.x86_64 by ignoring some of its dependencies

Choose from above solutions by number or cancel [1/2/c] (c): 2
```
 4. 安装`OpenSSL`：
```bash
sudo zypper install openssl openssl-devel

Loading repository data...
Reading installed packages...
'openssl-devel' not found in package names. Trying capabilities.
Resolving package dependencies...

Problem: libopenssl-devel-1.0.0c-17.1.x86_64 requires zlib-devel, but this requirement cannot be provided
  uninstallable providers: zlib-devel-1.2.5-8.1.i586[oss]
                   zlib-devel-1.2.5-8.1.x86_64[oss]
 Solution 1: downgrade of zlib-1.2.7-0.12.3.x86_64 to zlib-1.2.5-8.1.x86_64
 Solution 2: do not ask to install a solvable providing openssl-devel
 Solution 3: do not ask to install a solvable providing openssl-devel
 Solution 4: break libopenssl-devel-1.0.0c-17.1.x86_64 by ignoring some of its dependencies

Choose from above solutions by number or cancel [1/2/3/4/c] (c): 1
```
 5. 安装GCC编译器：
```bash
sudo zypper install gcc5 gcc5-c++

Loading repository data...
Reading installed packages...
Resolving package dependencies...
2 Problems:
Problem: gcc5-5.5.0+r253576-1.1.x86_64 requires libgcc_s1 >= 5.5.0+r253576-1.1, but this requirement cannot be provided
Problem: gcc5-c++-5.5.0+r253576-1.1.x86_64 requires gcc5 = 5.5.0+r253576-1.1, but this requirement cannot be provided

Problem: gcc5-5.5.0+r253576-1.1.x86_64 requires libgcc_s1 >= 5.5.0+r253576-1.1, but this requirement cannot be provided
  uninstallable providers: libgcc_s1-5.5.0+r253576-1.1.i586[devel_gcc]
                   libgcc_s1-5.5.0+r253576-1.1.x86_64[devel_gcc]
                   libgcc_s1-6.4.1+r251631-80.1.i586[devel_gcc]
                   libgcc_s1-6.4.1+r251631-80.1.x86_64[devel_gcc]
                   libgcc_s1-7.3.1+r258812-103.1.i586[devel_gcc]
                   libgcc_s1-7.3.1+r258812-103.1.x86_64[devel_gcc]
                   libgcc_s1-8.1.1+r260570-32.1.i586[devel_gcc]
                   libgcc_s1-8.1.1+r260570-32.1.x86_64[devel_gcc]
 Solution 1: install libgcc_s1-8.1.1+r260570-32.1.x86_64 (with vendor change)
  SUSE LINUX Products GmbH, Nuernberg, Germany  -->  obs://build.opensuse.org/devel:gcc
 Solution 2: do not install gcc5-5.5.0+r253576-1.1.x86_64
 Solution 3: do not install gcc5-5.5.0+r253576-1.1.x86_64
 Solution 4: break gcc5-5.5.0+r253576-1.1.x86_64 by ignoring some of its dependencies

Choose from above solutions by number or skip, retry or cancel [1/2/3/4/s/r/c] (c): 1

Problem: gcc5-c++-5.5.0+r253576-1.1.x86_64 requires gcc5 = 5.5.0+r253576-1.1, but this requirement cannot be provided
  uninstallable providers: gcc5-5.5.0+r253576-1.1.i586[devel_gcc]
                   gcc5-5.5.0+r253576-1.1.x86_64[devel_gcc]
 Solution 1: install libgomp1-8.1.1+r260570-32.1.x86_64 (with vendor change)
  SUSE LINUX Products GmbH, Nuernberg, Germany  -->  obs://build.opensuse.org/devel:gcc
 Solution 2: do not install gcc5-c++-5.5.0+r253576-1.1.x86_64
 Solution 3: do not install gcc5-c++-5.5.0+r253576-1.1.x86_64
 Solution 4: break gcc5-c++-5.5.0+r253576-1.1.x86_64 by ignoring some of its dependencies

Choose from above solutions by number or skip, retry or cancel [1/2/3/4/s/r/c] (c): 1
Resolving dependencies...
Resolving package dependencies...

Problem: gcc5-c++-5.5.0+r253576-1.1.x86_64 requires libstdc++6-devel-gcc5 = 5.5.0+r253576-1.1, but this requirement cannot be provided
  uninstallable providers: libstdc++6-devel-gcc5-5.5.0+r253576-1.1.i586[devel_gcc]
                   libstdc++6-devel-gcc5-5.5.0+r253576-1.1.x86_64[devel_gcc]
 Solution 1: install libstdc++6-8.1.1+r260570-32.1.x86_64 (with vendor change)
  SUSE LINUX Products GmbH, Nuernberg, Germany  -->  obs://build.opensuse.org/devel:gcc
 Solution 2: do not install gcc5-c++-5.5.0+r253576-1.1.x86_64
 Solution 3: do not install gcc5-c++-5.5.0+r253576-1.1.x86_64
 Solution 4: break gcc5-c++-5.5.0+r253576-1.1.x86_64 by ignoring some of its dependencies

Choose from above solutions by number or cancel [1/2/3/4/c] (c): 1
```
 6. 创建编译器执行文件的符号链接：
```bash
sudo rm /usr/bin/gcc
sudo rm /usr/bin/g++

sudo ln -s /usr/bin/g++-5 /usr/bin/g++
sudo ln -s /usr/bin/gcc-5 /usr/bin/gcc
```
 7. 通过源码安装unixODBC：从[http://www.unixodbc.org/](http://www.unixodbc.org/)下载并安装最新的unixODBC（2.3.6或更新的版本）；
 8. 检查指定版本的所有依赖库和工具都已经成功安装：
```shell
1. libtool --version
libtool (GNU libtool) 2.4.6
2. m4 --version
m4 (GNU M4) 1.4.12
3. autoconf --version
autoconf (GNU Autoconf) 2.69
4. automake --version
automake (GNU automake) 1.16.1
5. openssl version
OpenSSL 1.0.0c 2 Dec 2010
6. g++ --version
g++ (SUSE Linux) 5.5.0 20171010 [gcc-5-branch revision 253640]
7. JDK 1.8
```

 9. 检查`JAVA_HOME`环境变量是否配置，然后执行下面的命令：
```bash
cd $IGNITE_HOME/platforms/cpp
export LDFLAGS=-lrt

libtoolize && aclocal && autoheader && automake --add-missing && autoreconf
./configure --enable-odbc
make
sudo make install
```
 10. 成功之后，重启系统；
 11. 安装ODBC驱动：
```bash
sudo odbcinst -i -d -f $IGNITE_HOME/platforms/cpp/odbc/install/ignite-odbc-install.ini
```

## 6.Pentaho
### 6.1.概述
[Pentaho](http://www.pentaho.com/)是一个全面的平台，它可以非常容易地对数据进行抽取、转换、可视化和分析。Pentaho数据集成采用Java数据库连接（JDBC）API接入数据库。

Ignite有自己的JDBC驱动，这样就使得通过Pentaho平台接入Ignite成为可能，然后就可以分析分布式Ignite集群中的数据了。
### 6.2.安装和配置

 - 下载并安装Pentaho平台，具体可以参考官方的[Pentaho文档](https://help.pentaho.com/Documentation/7.1/Installation);
 - 安装完成之后，需要使用相关的工具安装Ignite的JDBC驱动，怎么做呢，下载Ignite然后找到`{apache-ignite}/libs/ignite-core-{version}.jar`，然后将其复制到`{pentaho}/jdbc-distribution`目录；
 - 打开一个命令行工具，切换到`{pentaho}/jdbc-distribution`目录然后执行脚本：`./distribute-files.sh ignite-core-{version}.jar`。

### 6.3.JDBC驱动配置
下一步是配置JDBC驱动然后接入集群，下面做的都是必要的，[JDBC Thin模式驱动](/doc/2.8.0/sql/JDBC.md#_1-1-jdbc-thin模式驱动)有更多的细节信息。

 - 打开命令行工具，切换到`{pentaho}/design-tools/data-integration`目录，然后使用`./spoon.sh`脚本启动Pentaho；
 - 出现下面的界面之后，点击`File`菜单然后创建一个新的转换：`New`->`Transformation`；

![](https://ignite.apache.org/docs/2.9.0/images/tools/pentaho-new-transformation.png)

 - 在Pentaho的界面中，填入下面的参数就可以创建一个新的数据库连接：

|Pentaho属性名|值|
|---|---|
|`Connection Name`|比如`IgniteConnection`这样的自定义名字|
|`Connection Type`|选择`Generic database`选项|
|`Access`|选择`Native (JDBC)`|
|`Custom Connection URL`|`jdbc:ignite:thin://localhost:10800`，其中端口和地址可以根据实际进行调整|
|`Custom Driver Class Name`|`org.apache.ignite.IgniteJdbcThinDriver`|

 - 点击`Test`按钮，对连接进行测试

![](https://ignite.apache.org/docs/2.9.0/images/tools/pentaho-ignite-connection.png)

### 6.4.数据的查询和分析
Ignite和Pentaho之间建立连接之后，就可以通过Pentaho支持的各种方式对数据进行查询、转换和分析了，更多的细节，可以查看Pentaho的官方文档。

![](https://ignite.apache.org/docs/2.9.0/images/tools/pentaho-running-and-inspecting-data.png)

<RightPane/>
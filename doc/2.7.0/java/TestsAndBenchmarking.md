# 基准测试
## 1.基准测试
### 1.1.Yardstick Ignite基准测试
Ignite的基准测试是在Yardstick框架之上实现的，通过它可以度量Ignite各种组件和模块的性能。

下面的文档描述了如何配置和执行预编译的测试，如果需要添加新的基准测试或者构建已有的测试，那么请参照源代码目录中的DEVNOTES.txt文件中的介绍。

访问[Yardstick库](https://github.com/gridgain/yardstick)可以了解更多的细节，比如生成的测试报告以及框架的工作原理。
### 1.2.在本机运行Ignite的基准测试
进行测试的最简单方式是使用`benchmarks/bin`目录中的可执行脚本。
```bash
./bin/benchmark-run-all.sh config/benchmark-sample.properties
```
上面的命令会测试一个分布式原子化缓存的`put`操作，测试结果会被添加到一个自动生成的`output/results-{DATE-TIME}`目录中。

如果`./bin/benchmark-run-all.sh`命令执行时没有传递任何参数，并且也没有修改配置文件，那么所有的可用测试会在本地主机使用`config/benchmark.properties`配置文件执行，遇到问题，会在一个自动生成的目录`output/logs-{DATE-TIME}`中生成日志。
### 1.3.在远程运行Ignite的基准测试
如果要在若干远程主机上进行测试，需要按照如下步骤进行：

 1. 打开`config/ignite-remote-config.xml`文件，然后将`<value>127.0.0.1:47500..47509</value>`替换为实际的所有远程主机IP列表，如果要使用其它类型的IP探测器，可以参照相关的集群配置文档；
 2. 打开`config/benchmark-remote-sample.properties`文件，然后将下列位置的`localhost`替换为实际的所有远程主机IP列表：`SERVERS=localhost,localhost`和`DRIVERS=localhost,localhost`，DRIVER是实际执行测试逻辑的主机（通常是Ignite客户端节点），SERVERS是被测试的节点，如果要进行所有测试，则需要替换`config/benchmark-remote.properties`文件中的相同内容；
 3. 将Yardstick测试上传到`DRIVERS`主机之一的工作目录；
 4. 登录该主机，然后执行如下命令：

```bash
./bin/benchmark-run-all.sh config/benchmark-remote-sample.properties
```
所有必要的文件默认会被自动地从执行上面命令的主机上传到所有其它主机的相同目录，如果要手工做，则需要将配置文件中的`AUTO_COPY`变量设为`false`。

上面的命令会测试一个分布式原子化缓存的`put`操作，测试结果会被添加到一个自动生成的`output/results-{DATE-TIME}`目录中。

如果要在远程节点执行所有的测试，那么需要在`DRIVER`端执行`/bin/benchmark-run-all.sh config/benchmark-remote.properties`。
### 1.4.已有的测试点
目前提供的测试点如下：

 1. `GetBenchmark`：测试分布式原子化缓存的`get`操作；
 2. `PutBenchmark`：测试分布式原子化缓存的`put`操作；
 3. `PutGetBenchmark`：一起测试分布式原子化缓存的`get`和`put`操作；
 4. `PutTxBenchmark`：测试分布式事务化缓存的`put`操作；
 5. `PutGetTxBenchmark`：一起测试分布式事务化缓存的`get`和`put`操作；
 6. `SqlQueryBenchmark`：测试在缓存数据上执行分布式SQL查询；
 7. `SqlQueryJoinBenchmark`：测试在缓存数据上执行带关联的分布式SQL查询；
 8. `SqlQueryPutBenchmark`：测试在执行分布式SQL查询的时候同时进行缓存的更新；
 9. `AffinityCallBenchmark`：测试关联调用操作；
 10. `ApplyBenchmark`：测试`apply`操作；
 11. `BroadcastBenchmark`：测试`broadcast`操作；
 12. `ExecuteBenchmark`：测试`execute`操作；
 13. `RunBenchmark`：测试任务的执行操作；
 14. `PutGetOffHeapBenchmark`：测试在有堆外内存的情况下，分布式原子化缓存的`put`和`get`操作；
 15. `PutGetOffHeapValuesBenchmark`：测试在有堆外内存的情况下，分布式原子化缓存的`put`值操作；
 16. `PutOffHeapBenchmark`：测试在有堆外内存的情况下，分布式原子化缓存的`put`操作；
 17. `PutOffHeapValuesBenchmark`：测试在有堆外内存的情况下，分布式原子化缓存的`put`值操作；
 18. `PutTxOffHeapBenchmark`：测试在有堆外内存的情况下，分布式事务化缓存的`put`操作；
 19. `PutTxOffHeapValuesBenchmark`：测试在有堆外内存的情况下，分布式事务化缓存的`put`值操作；
 20. `SqlQueryOffHeapBenchmark`：测试在堆外的缓存数据上执行分布式SQL查询操作；
 21. `SqlQueryJoinOffHeapBenchmark`：测试在堆外的缓存数据上执行带关联的分布式SQL查询操作；
 22. `SqlQueryPutOffHeapBenchmark`：测试在堆外的缓存数据上执行分布式SQL查询的同时进行缓存的更新操作；
 23. `PutAllBenchmark`：测试在分布式原子化缓存中进行批量`put`操作；
 24. `PutAllTxBenchmark`：测试在分布式事务化缓存中进行批量`put`操作。

### 1.5.属性文件和命令行参数
本章节只会描述和Ignite测试有关的配置参数，并不是Yardstick框架的所有参数。如果要进行Ignite测试并且生成结果，需要使用`bin`文件夹中的Yardstick框架脚本执行测试用例。

在[Yardstick文档](https://github.com/gridgain/yardstick/blob/master/README.md)中有Yardstick框架的配置参数和命令行参数的详细说明。

下面的Ignite测试属性可以在测试配置中进行定义：

 - `-b <num>`或者`--backups <num>`：每个键的备份数量；
 - `-cfg <path>`或者`--Config <path`：Ignite配置文件的路径；
 - `-cs`或者`--cacheStore`：打开或者关闭缓存存储的通读和通写；
 - `-cl`或者`--client`：客户端标志，如果有多个`DRIVER`时需要使用这个标志，除了这个以外的其它`DRIVER`的行为类似于`SERVER`；
 - `-nc`或者`--nearCache`：近缓存标志；
 - `-nn <num>`或者`--nodeNumber <num>`：在`benchmark.properties`中自动配置的节点数量，用于等待启动指定数量的节点；
 - `-sm <mode>`或者`-syncMode <mode>`：同步模式（定义于CacheWriteSynchronizationMode）；
 - `-r <num>`或者`--range`：为缓存操作随机生成的键的范围；
 - `-rd`或者`--restartdelay`：重启延迟（秒）；
 - `-rs`或者`--restartsleep`：重启睡眠（秒）；
 - `-rth <host>`或者`--restHost <host>`：REST TCP主机；
 - `-rtp <num>`或者`--restPort <num>`：REST TCP端口；
 - `-ss`或者`--syncSend`：表示`TcpCommunicationSpi`中是否同步发送消息的标志；
 - `-txc <value>`或者`--txConcurrency <value>`：缓存事务的并发控制，`PESSIMISTIC`或者`OPTIMISTIC`(由CacheTxConcurrency进行定义)；
 - `-txi <value>`或者`--txIsolation <value>`：缓存事务隔离级别（由`CacheTxIsolation`定义）；
 - `-wb`或者`--writeBehind`：打开/关闭缓存存储的后写；

比如，要在本地启动两个节点进行`PutBenchmark`测试，备份数为1，同步模式为`PRIMARY_SYNC`，那么需要在`benchmark.properties`文件中指定如下的配置：
```
SERVER_HOSTS=localhost,localhost
...

# Note that -dn and -sn, which stand for data node and server node,
# are native Yardstick parameters and are documented in
# Yardstick framework.
CONFIGS="-b 1 -sm PRIMARY_SYNC -dn PutBenchmark`IgniteNode"
```
### 1.6.从源代码构建
在Ignite的根目录中执行:`mvn clean package -Pyardstick -pl modules/yardstick -am -DskipTests`。
这个命令会对工程进行编译，还会从`yardstick-resources.zip`文件中解压脚本到`modules/yardstick/target/assembly/bin`目录。

构件位于`modules/yardstick/target/assembly`目录。
### 1.7.自定义Ignite测试
所有的测试用例都需要继承`AbstractBenchmark`类，并且实现`test`方法（这个方法实际执行性能测试）。
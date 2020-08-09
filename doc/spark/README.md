# 介绍
## 1.概述
Ignite可以无缝地与Hadoop和Spark集成，其中Ignite与Hadoop的集成可以将IGFS（Ignite文件系统）作为存储于HDFS中的数据的主要缓存层，Ignite与Spark的集成可以使用一个Spark RDD和DataFrames的实现在内存中跨多个Spark作业共享状态。

**Ignite与Spark**

Ignite作为一个分布式的内存数据库和缓存平台，对于Spark用户可以实现如下的功能：

 - 获得真正的可扩展的内存级性能，避免数据源和Spark工作节点和应用之间的数据移动；
 - 提升DataFrame和SQL的性能；
 - 在Spark作业之间更容易地共享状态和数据。

![](https://files.readme.io/17a055b-spark_integration.png)

<RightPane/>
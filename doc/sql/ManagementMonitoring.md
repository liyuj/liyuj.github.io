# 管理和监控
## 1.JDBC/ODBC会话管理
接入集群的JDBC/ODBC/瘦客户端列表，可以通过一个JMX客户端使用`org.apache.ignite.mxbean.ClientProcessorMXBean`MBean获取。

下图显示了如何使用JConsole进行访问：
![](https://files.readme.io/6a532f9-monitoring.png)
`ClientProcessMXBean`有一个`Connections`属性，它以如下形式返回客户端列表：
```
JdbcClient [id=4294967297, user=<anonymous>, rmtAddr=127.0.0.1:39264, locAddr=127.0.0.1:10800]
```
使用该Bean提供的功能，可以通过ID删除特定的连接，也可以一次删除所有的连接。

<RightPane/>
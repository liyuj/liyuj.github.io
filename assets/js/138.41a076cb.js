(window.webpackJsonp=window.webpackJsonp||[]).push([[138],{326:function(t,_,s){"use strict";s.r(_);var a=s(3),v=Object(a.a)({},(function(){var t=this,_=t.$createElement,s=t._self._c||_;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h1",{attrs:{id:"管理和监控"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#管理和监控"}},[t._v("#")]),t._v(" 管理和监控")]),t._v(" "),s("h2",{attrs:{id:"_1-系统视图"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-系统视图"}},[t._v("#")]),t._v(" 1.系统视图")]),t._v(" "),s("p",[t._v("Ignite提供了一组内置的视图，它们包含了与集群节点和节点指标有关的各种信息。这些视图位于"),s("code",[t._v("IGNITE")]),t._v("模式中，在"),s("RouterLink",{attrs:{to:"/doc/2.7.0/sql/Architecture.html#_6-模式"}},[t._v("3.6.模式")]),t._v("中介绍了在Ignite中访问非默认的模式的方法。")],1),t._v(" "),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[t._v("限制")]),t._v(" "),s("p",[t._v("1)无法在IGNITE模式中创建对象；"),s("br"),t._v("\n2)IGNITE模式中的视图无法与用户级的表进行关联。")])]),t._v(" "),s("h3",{attrs:{id:"_1-1-nodes视图"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-1-nodes视图"}},[t._v("#")]),t._v(" 1.1.NODES视图")]),t._v(" "),s("p",[t._v("NODES视图中包括了集群节点的各种信息。")]),t._v(" "),s("p",[s("strong",[t._v("列")])]),t._v(" "),s("table",[s("thead",[s("tr",[s("th",[t._v("列名")]),t._v(" "),s("th",[t._v("数据类型")]),t._v(" "),s("th",[t._v("描述")])])]),t._v(" "),s("tbody",[s("tr",[s("td",[s("code",[t._v("ID")])]),t._v(" "),s("td",[t._v("UUID")]),t._v(" "),s("td",[t._v("节点ID")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("CONSISTENT_ID")])]),t._v(" "),s("td",[t._v("VARCHAR")]),t._v(" "),s("td",[t._v("节点的唯一性ID")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("VERSION")])]),t._v(" "),s("td",[t._v("VARCHAR")]),t._v(" "),s("td",[t._v("节点的版本")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("IS_CLIENT")])]),t._v(" "),s("td",[t._v("BOOLEAN")]),t._v(" "),s("td",[t._v("节点是否为客户端节点")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("IS_DAEMON")])]),t._v(" "),s("td",[t._v("BOOLEAN")]),t._v(" "),s("td",[t._v("节点是否为守护节点")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("NODE_ORDER")])]),t._v(" "),s("td",[t._v("INT")]),t._v(" "),s("td",[t._v("节点在拓扑中的顺序")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("ADDRESSES")])]),t._v(" "),s("td",[t._v("VARCHAR")]),t._v(" "),s("td",[t._v("节点的地址")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("HOSTNAMES")])]),t._v(" "),s("td",[t._v("VARCHAR")]),t._v(" "),s("td",[t._v("节点的主机名")])])])]),t._v(" "),s("h3",{attrs:{id:"_1-2-node-attributes视图"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-2-node-attributes视图"}},[t._v("#")]),t._v(" 1.2.NODE_ATTRIBUTES视图")]),t._v(" "),s("p",[t._v("NODE_ATTRIBUTES视图包括了集群节点的属性信息。")]),t._v(" "),s("p",[s("strong",[t._v("列")])]),t._v(" "),s("table",[s("thead",[s("tr",[s("th",[t._v("列名")]),t._v(" "),s("th",[t._v("数据类型")]),t._v(" "),s("th",[t._v("描述")])])]),t._v(" "),s("tbody",[s("tr",[s("td",[s("code",[t._v("NODE_ID")])]),t._v(" "),s("td",[t._v("UUID")]),t._v(" "),s("td",[t._v("节点ID")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("NAME")])]),t._v(" "),s("td",[t._v("VARCHAR")]),t._v(" "),s("td",[t._v("属性名")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("VALUE")])]),t._v(" "),s("td",[t._v("VARCHAR")]),t._v(" "),s("td",[t._v("属性值")])])])]),t._v(" "),s("h3",{attrs:{id:"_1-3-baseline-nodes视图"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-3-baseline-nodes视图"}},[t._v("#")]),t._v(" 1.3.BASELINE_NODES视图")]),t._v(" "),s("p",[t._v("BASELINE_NODES视图包括了当前基线拓扑中的节点信息。")]),t._v(" "),s("p",[s("strong",[t._v("列")])]),t._v(" "),s("table",[s("thead",[s("tr",[s("th",[t._v("列名")]),t._v(" "),s("th",[t._v("数据类型")]),t._v(" "),s("th",[t._v("描述")])])]),t._v(" "),s("tbody",[s("tr",[s("td",[s("code",[t._v("CONSISTENT_ID")])]),t._v(" "),s("td",[t._v("VARCHAR")]),t._v(" "),s("td",[t._v("节点唯一性ID")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("ONLINE")])]),t._v(" "),s("td",[t._v("BOOLEAN")]),t._v(" "),s("td",[t._v("节点的运行状态")])])])]),t._v(" "),s("h3",{attrs:{id:"_1-4-node-metrics视图"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-4-node-metrics视图"}},[t._v("#")]),t._v(" 1.4.NODE_METRICS视图")]),t._v(" "),s("p",[t._v("NODE_METRICS视图提供了与节点状态、资源消耗等有关的各种信息。")]),t._v(" "),s("p",[s("strong",[t._v("列")])]),t._v(" "),s("table",[s("thead",[s("tr",[s("th",[t._v("列名")]),t._v(" "),s("th",[t._v("数据类型")]),t._v(" "),s("th",[t._v("描述")])])]),t._v(" "),s("tbody",[s("tr",[s("td",[s("code",[t._v("NODE_ID")])]),t._v(" "),s("td",[t._v("UUID")]),t._v(" "),s("td",[t._v("节点ID")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("LAST_UPDATE_TIME")])]),t._v(" "),s("td",[t._v("TIMESTAMP")]),t._v(" "),s("td",[t._v("指标数据上次更新的时间")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("MAX_ACTIVE_JOBS")])]),t._v(" "),s("td",[t._v("INT")]),t._v(" "),s("td",[t._v("节点曾经的最大并发作业数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("CUR_ACTIVE_JOBS")])]),t._v(" "),s("td",[t._v("INT")]),t._v(" "),s("td",[t._v("节点当前正在运行的活跃作业数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("AVG_ACTIVE_JOBS")])]),t._v(" "),s("td",[t._v("FLOAT")]),t._v(" "),s("td",[t._v("节点并发执行的平均活跃作业数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("MAX_WAITING_JOBS")])]),t._v(" "),s("td",[t._v("INT")]),t._v(" "),s("td",[t._v("节点曾经的最大等待作业数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("CUR_WAITING_JOBS")])]),t._v(" "),s("td",[t._v("INT")]),t._v(" "),s("td",[t._v("节点当前正在等待执行的作业数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("AVG_WAITING_JOBS")])]),t._v(" "),s("td",[t._v("FLOAT")]),t._v(" "),s("td",[t._v("节点的平均等待作业数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("MAX_REJECTED_JOBS")])]),t._v(" "),s("td",[t._v("INT")]),t._v(" "),s("td",[t._v("在一次冲突解决操作期间一次性的最大拒绝作业数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("CUR_REJECTED_JOBS")])]),t._v(" "),s("td",[t._v("INT")]),t._v(" "),s("td",[t._v("最近一次冲突解决操作中的拒绝作业数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("AVG_REJECTED_JOBS")])]),t._v(" "),s("td",[t._v("FLOAT")]),t._v(" "),s("td",[t._v("在冲突解决操作期间的平均拒绝作业数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("TOTAL_REJECTED_JOBS")])]),t._v(" "),s("td",[t._v("INT")]),t._v(" "),s("td",[t._v("节点启动后在冲突解决期间的拒绝作业总数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("MAX_CANCELED_JOBS")])]),t._v(" "),s("td",[t._v("INT")]),t._v(" "),s("td",[t._v("节点的并发最大取消作业数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("AVG_CANCELED_JOBS")])]),t._v(" "),s("td",[t._v("FLOAT")]),t._v(" "),s("td",[t._v("节点的并发平均取消作业数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("TOTAL_CANCELED_JOBS")])]),t._v(" "),s("td",[t._v("INT")]),t._v(" "),s("td",[t._v("节点启动后取消作业总数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("MAX_JOBS_WAIT_TIME")])]),t._v(" "),s("td",[t._v("TIME")]),t._v(" "),s("td",[t._v("节点中的作业执行前在队列中的最大等待时间")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("CUR_JOBS_WAIT_TIME")])]),t._v(" "),s("td",[t._v("TIME")]),t._v(" "),s("td",[t._v("节点当前正在等待执行的作业的最长等待时间")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("AVG_JOBS_WAIT_TIME")])]),t._v(" "),s("td",[t._v("TIME")]),t._v(" "),s("td",[t._v("节点中的作业执行前在队列中的平均等待时间")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("MAX_JOBS_EXECUTE_TIME")])]),t._v(" "),s("td",[t._v("TIME")]),t._v(" "),s("td",[t._v("节点作业的最长执行时间")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("CUR_JOBS_EXECUTE_TIME")])]),t._v(" "),s("td",[t._v("TIME")]),t._v(" "),s("td",[t._v("节点当前正在执行的作业的执行时间")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("AVG_JOBS_EXECUTE_TIME")])]),t._v(" "),s("td",[t._v("TIME")]),t._v(" "),s("td",[t._v("节点作业的平均执行时间")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("TOTAL_JOBS_EXECUTE_TIME")])]),t._v(" "),s("td",[t._v("TIME")]),t._v(" "),s("td",[t._v("节点启动后已经完成的作业的执行总时间")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("TOTAL_EXECUTED_JOBS")])]),t._v(" "),s("td",[t._v("INT")]),t._v(" "),s("td",[t._v("节点启动后处理的作业总数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("TOTAL_EXECUTED_TASKS")])]),t._v(" "),s("td",[t._v("INT")]),t._v(" "),s("td",[t._v("节点处理过的任务总数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("TOTAL_BUSY_TIME")])]),t._v(" "),s("td",[t._v("TIME")]),t._v(" "),s("td",[t._v("节点处理作业花费的总时间")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("TOTAL_IDLE_TIME")])]),t._v(" "),s("td",[t._v("TIME")]),t._v(" "),s("td",[t._v("节点的总空闲（未执行任何作业）时间")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("CUR_IDLE_TIME")])]),t._v(" "),s("td",[t._v("TIME")]),t._v(" "),s("td",[t._v("节点执行最近的作业后的空闲时间")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("BUSY_TIME_PERCENTAGE")])]),t._v(" "),s("td",[t._v("FLOAT")]),t._v(" "),s("td",[t._v("节点执行作业和空闲的时间占比")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("IDLE_TIME_PERCENTAGE")])]),t._v(" "),s("td",[t._v("FLOAT")]),t._v(" "),s("td",[t._v("节点空闲和执行作业的时间占比")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("TOTAL_CPU")])]),t._v(" "),s("td",[t._v("INT")]),t._v(" "),s("td",[t._v("JVM的可用CPU数量")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("CUR_CPU_LOAD")])]),t._v(" "),s("td",[t._v("DOUBLE")]),t._v(" "),s("td",[t._v("在范围（0, 1）中以分数表示的CPU使用率")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("AVG_CPU_LOAD")])]),t._v(" "),s("td",[t._v("DOUBLE")]),t._v(" "),s("td",[t._v("在范围（0, 1）中以分数表示的CPU平均使用率")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("CUR_GC_CPU_LOAD")])]),t._v(" "),s("td",[t._v("DOUBLE")]),t._v(" "),s("td",[t._v("上次指标更新后花费在GC上的平均时间，指标默认2秒更新一次")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("HEAP_MEMORY_INIT")])]),t._v(" "),s("td",[t._v("LONG")]),t._v(" "),s("td",[t._v("JVM最初从操作系统申请用于内存管理的堆内存量（字节）。如果初始内存大小未定义，则显示-1")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("HEAP_MEMORY_USED")])]),t._v(" "),s("td",[t._v("LONG")]),t._v(" "),s("td",[t._v("当前用于对象分配的堆大小，堆由一个或多个内存池组成，该值为所有堆内存池中使用的堆内存总数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("HEAP_MEMORY_COMMITED")])]),t._v(" "),s("td",[t._v("LONG")]),t._v(" "),s("td",[t._v("JVM使用的堆内存量（字节），这个内存量保证由JVM使用，堆由一个或多个内存池组成，该值为所有堆内存池中JVM使用的堆内存总数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("HEAP_MEMORY_MAX")])]),t._v(" "),s("td",[t._v("LONG")]),t._v(" "),s("td",[t._v("用于内存管理的最大堆内存量（字节），如果最大内存量未指定，则显示-1")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("HEAP_MEMORY_TOTAL")])]),t._v(" "),s("td",[t._v("LONG")]),t._v(" "),s("td",[t._v("堆内存总量（字节），如果总内存量未指定，则显示-1")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("NONHEAP_MEMORY_INIT")])]),t._v(" "),s("td",[t._v("LONG")]),t._v(" "),s("td",[t._v("JVM最初从操作系统申请用于内存管理的非堆内存量（字节）。如果初始内存大小未定义，则显示-1")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("NONHEAP_MEMORY_USED")])]),t._v(" "),s("td",[t._v("LONG")]),t._v(" "),s("td",[t._v("JVM当前使用的非堆内存量，非堆内存由一个或多个内存池组成，该值为所有非堆内存池中使用的非堆内存总数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("NONHEAP_MEMORY_COMMITED")])]),t._v(" "),s("td",[t._v("LONG")]),t._v(" "),s("td",[t._v("JVM使用的非堆内存量（字节），这个内存量保证由JVM使用。非堆内存由一个或多个内存池组成，该值为所有非堆内存池中使用的非堆内存总数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("NONHEAP_MEMORY_MAX")])]),t._v(" "),s("td",[t._v("LONG")]),t._v(" "),s("td",[t._v("可用于内存管理的最大非堆内存量（字节），如果最大内存量未指定，则显示-1")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("NONHEAP_MEMORY_TOTAL")])]),t._v(" "),s("td",[t._v("LONG")]),t._v(" "),s("td",[t._v("可用于内存管理的非堆内存总量（字节），如果总内存量未指定，则显示-1")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("UPTIME")])]),t._v(" "),s("td",[t._v("TIME")]),t._v(" "),s("td",[t._v("JVM的正常运行时间")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("JVM_START_TIME")])]),t._v(" "),s("td",[t._v("TIMESTAMP")]),t._v(" "),s("td",[t._v("JVM的启动时间")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("NODE_START_TIME")])]),t._v(" "),s("td",[t._v("TIMESTAMP")]),t._v(" "),s("td",[t._v("节点的启动时间")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("LAST_DATA_VERSION")])]),t._v(" "),s("td",[t._v("LONG")]),t._v(" "),s("td",[t._v("数据网格为所有缓存操作赋予的不断增长的版本数，该值为节点的最新数据版本")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("CUR_THREAD_COUNT")])]),t._v(" "),s("td",[t._v("INT")]),t._v(" "),s("td",[t._v("包括守护和非守护线程在内的所有有效线程总数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("MAX_THREAD_COUNT")])]),t._v(" "),s("td",[t._v("INT")]),t._v(" "),s("td",[t._v("JVM启动或峰值重置后的最大有效线程数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("TOTAL_THREAD_COUNT")])]),t._v(" "),s("td",[t._v("LONG")]),t._v(" "),s("td",[t._v("JVM启动后启动的线程总数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("CUR_DAEMON_THREAD_COUNT")])]),t._v(" "),s("td",[t._v("INT")]),t._v(" "),s("td",[t._v("当前的有效守护线程数")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("SENT_MESSAGES_COUNT")])]),t._v(" "),s("td",[t._v("INT")]),t._v(" "),s("td",[t._v("节点发送的通信消息总量")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("SENT_BYTES_COUNT")])]),t._v(" "),s("td",[t._v("LONG")]),t._v(" "),s("td",[t._v("发送的字节量")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("RECEIVED_MESSAGES_COUNT")])]),t._v(" "),s("td",[t._v("INT")]),t._v(" "),s("td",[t._v("节点接收的通信消息总量")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("RECEIVED_BYTES_COUNT")])]),t._v(" "),s("td",[t._v("LONG")]),t._v(" "),s("td",[t._v("接收的字节量")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("OUTBOUND_MESSAGES_QUEUE")])]),t._v(" "),s("td",[t._v("INT")]),t._v(" "),s("td",[t._v("出站消息队列大小")])])])]),t._v(" "),s("h3",{attrs:{id:"_1-5-示例"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-5-示例"}},[t._v("#")]),t._v(" 1.5.示例")]),t._v(" "),s("p",[t._v("可以使用SQLLine工具查询系统视图，先接入IGNITE模式，如下：")]),t._v(" "),s("div",{staticClass:"language-bash extra-class"},[s("pre",{pre:!0,attrs:{class:"language-bash"}},[s("code",[t._v("$ ./sqlline.sh -u jdbc:ignite:thin://127.0.0.1/IGNITE\n")])])]),s("p",[t._v("执行查询：")]),t._v(" "),s("div",{staticClass:"language-sql extra-class"},[s("pre",{pre:!0,attrs:{class:"language-sql"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("-- get the list of nodes")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("select")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" NODES"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("-- view the CPU load as a percentage for a specific node")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("select")]),t._v(" CUR_CPU_LOAD "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("100")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" NODE_METRICS "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("where")]),t._v(" NODE_ID "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'a1b77663-b37f-4ddf-87a6-1e2d684f3bae'")]),t._v("\n")])])]),s("p",[t._v("如果使用Java瘦客户端，如下：")]),t._v(" "),s("div",{staticClass:"language-java extra-class"},[s("pre",{pre:!0,attrs:{class:"language-java"}},[s("code",[s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ClientConfiguration")]),t._v(" cfg "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ClientConfiguration")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("setAddresses")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"127.0.0.1:10800"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("try")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("IgniteClient")]),t._v(" igniteClient "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Ignition")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("startClient")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("cfg"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("System")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("out"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("println")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// getting the id of the first node")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("UUID")]),t._v(" nodeId "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("UUID"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" igniteClient"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("query")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("SqlFieldsQuery")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"SELECT * from NODES"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("setSchema")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"IGNITE"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("getAll")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("iterator")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("next")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("get")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("double")]),t._v(" cpu_load "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("double")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" igniteClient\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("query")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("SqlFieldsQuery")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"select CUR_CPU_LOAD * 100 from NODE_METRICS where NODE_ID = ? "')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("setSchema")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"IGNITE"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("setArgs")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("nodeId"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("toString")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("getAll")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("iterator")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("next")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("get")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("System")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("out"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("println")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"node\'s cpu load = "')]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),t._v(" cpu_load"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("catch")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ClientException")]),t._v(" e"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("System")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("err"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("println")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("e"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("getMessage")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("catch")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Exception")]),t._v(" e"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("System")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("err"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("format")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"Unexpected failure: %s\\n"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" e"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),s("h2",{attrs:{id:"_2-jdbc-odbc会话管理"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-jdbc-odbc会话管理"}},[t._v("#")]),t._v(" 2.JDBC/ODBC会话管理")]),t._v(" "),s("p",[t._v("接入集群的JDBC/ODBC/瘦客户端列表，可以通过一个JMX客户端使用"),s("code",[t._v("org.apache.ignite.mxbean.ClientProcessorMXBean")]),t._v("MBean获取。")]),t._v(" "),s("p",[t._v("下图显示了如何使用JConsole进行访问：\n"),s("img",{attrs:{src:"https://files.readme.io/6a532f9-monitoring.png",alt:""}}),t._v(" "),s("code",[t._v("ClientProcessMXBean")]),t._v("有一个"),s("code",[t._v("Connections")]),t._v("属性，它以如下形式返回客户端列表：")]),t._v(" "),s("div",{staticClass:"language- extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[t._v("JdbcClient [id=4294967297, user=<anonymous>, rmtAddr=127.0.0.1:39264, locAddr=127.0.0.1:10800]\n")])])]),s("p",[t._v("使用该Bean提供的功能，可以通过ID删除特定的连接，也可以一次删除所有的连接。")])])}),[],!1,null,null,null);_.default=v.exports}}]);
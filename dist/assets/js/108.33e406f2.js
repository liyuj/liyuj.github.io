(window.webpackJsonp=window.webpackJsonp||[]).push([[108],{164:function(e,_,v){"use strict";v.r(_);var t=v(0),a=Object(t.a)({},(function(){var e=this,_=e.$createElement,v=e._self._c||_;return v("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[v("h1",{attrs:{id:"基准测试"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#基准测试"}},[e._v("#")]),e._v(" 基准测试")]),e._v(" "),v("h2",{attrs:{id:"_1-基准测试"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#_1-基准测试"}},[e._v("#")]),e._v(" 1.基准测试")]),e._v(" "),v("h3",{attrs:{id:"_1-1-yardstick-ignite基准测试"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#_1-1-yardstick-ignite基准测试"}},[e._v("#")]),e._v(" 1.1.Yardstick Ignite基准测试")]),e._v(" "),v("p",[e._v("Ignite的基准测试是在Yardstick框架之上实现的，通过它可以度量Ignite各种组件和模块的性能。")]),e._v(" "),v("p",[e._v("下面的文档描述了如何配置和执行预编译的测试，如果需要添加新的基准测试或者构建已有的测试，那么请参照源代码目录中的DEVNOTES.txt文件中的介绍。")]),e._v(" "),v("p",[e._v("访问"),v("a",{attrs:{href:"https://github.com/gridgain/yardstick",target:"_self",rel:"noopener noreferrer"}},[e._v("Yardstick库")]),e._v("可以了解更多的细节，比如生成的测试报告以及框架的工作原理。")]),e._v(" "),v("h3",{attrs:{id:"_1-2-在本机运行ignite的基准测试"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#_1-2-在本机运行ignite的基准测试"}},[e._v("#")]),e._v(" 1.2.在本机运行Ignite的基准测试")]),e._v(" "),v("p",[e._v("进行测试的最简单方式是使用"),v("code",[e._v("benchmarks/bin")]),e._v("目录中的可执行脚本。")]),e._v(" "),v("div",{staticClass:"language-bash line-numbers-mode"},[v("pre",{pre:!0,attrs:{class:"language-bash"}},[v("code",[e._v("./bin/benchmark-run-all.sh config/benchmark-sample.properties\n")])]),e._v(" "),v("div",{staticClass:"line-numbers-wrapper"},[v("span",{staticClass:"line-number"},[e._v("1")]),v("br")])]),v("p",[e._v("上面的命令会测试一个分布式原子化缓存的"),v("code",[e._v("put")]),e._v("操作，测试结果会被添加到一个自动生成的"),v("code",[e._v("output/results-{DATE-TIME}")]),e._v("目录中。")]),e._v(" "),v("p",[e._v("如果"),v("code",[e._v("./bin/benchmark-run-all.sh")]),e._v("命令执行时没有传递任何参数，并且也没有修改配置文件，那么所有的可用测试会在本地主机使用"),v("code",[e._v("config/benchmark.properties")]),e._v("配置文件执行，遇到问题，会在一个自动生成的目录"),v("code",[e._v("output/logs-{DATE-TIME}")]),e._v("中生成日志。")]),e._v(" "),v("h3",{attrs:{id:"_1-3-在远程运行ignite的基准测试"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#_1-3-在远程运行ignite的基准测试"}},[e._v("#")]),e._v(" 1.3.在远程运行Ignite的基准测试")]),e._v(" "),v("p",[e._v("如果要在若干远程主机上进行测试，需要按照如下步骤进行：")]),e._v(" "),v("ol",[v("li",[e._v("打开"),v("code",[e._v("config/ignite-remote-config.xml")]),e._v("文件，然后将"),v("code",[e._v("<value>127.0.0.1:47500..47509</value>")]),e._v("替换为实际的所有远程主机IP列表，如果要使用其它类型的IP探测器，可以参照相关的集群配置文档；")]),e._v(" "),v("li",[e._v("打开"),v("code",[e._v("config/benchmark-remote-sample.properties")]),e._v("文件，然后将下列位置的"),v("code",[e._v("localhost")]),e._v("替换为实际的所有远程主机IP列表："),v("code",[e._v("SERVERS=localhost,localhost")]),e._v("和"),v("code",[e._v("DRIVERS=localhost,localhost")]),e._v("，DRIVER是实际执行测试逻辑的主机（通常是Ignite客户端节点），SERVERS是被测试的节点，如果要进行所有测试，则需要替换"),v("code",[e._v("config/benchmark-remote.properties")]),e._v("文件中的相同内容；")]),e._v(" "),v("li",[e._v("将Yardstick测试上传到"),v("code",[e._v("DRIVERS")]),e._v("主机之一的工作目录；")]),e._v(" "),v("li",[e._v("登录该主机，然后执行如下命令：")])]),e._v(" "),v("div",{staticClass:"language-bash line-numbers-mode"},[v("pre",{pre:!0,attrs:{class:"language-bash"}},[v("code",[e._v("./bin/benchmark-run-all.sh config/benchmark-remote-sample.properties\n")])]),e._v(" "),v("div",{staticClass:"line-numbers-wrapper"},[v("span",{staticClass:"line-number"},[e._v("1")]),v("br")])]),v("p",[e._v("所有必要的文件默认会被自动地从执行上面命令的主机上传到所有其它主机的相同目录，如果要手工做，则需要将配置文件中的"),v("code",[e._v("AUTO_COPY")]),e._v("变量设为"),v("code",[e._v("false")]),e._v("。")]),e._v(" "),v("p",[e._v("上面的命令会测试一个分布式原子化缓存的"),v("code",[e._v("put")]),e._v("操作，测试结果会被添加到一个自动生成的"),v("code",[e._v("output/results-{DATE-TIME}")]),e._v("目录中。")]),e._v(" "),v("p",[e._v("如果要在远程节点执行所有的测试，那么需要在"),v("code",[e._v("DRIVER")]),e._v("端执行"),v("code",[e._v("/bin/benchmark-run-all.sh config/benchmark-remote.properties")]),e._v("。")]),e._v(" "),v("h3",{attrs:{id:"_1-4-已有的测试点"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#_1-4-已有的测试点"}},[e._v("#")]),e._v(" 1.4.已有的测试点")]),e._v(" "),v("p",[e._v("目前提供的测试点如下：")]),e._v(" "),v("ol",[v("li",[v("code",[e._v("GetBenchmark")]),e._v("：测试分布式原子化缓存的"),v("code",[e._v("get")]),e._v("操作；")]),e._v(" "),v("li",[v("code",[e._v("PutBenchmark")]),e._v("：测试分布式原子化缓存的"),v("code",[e._v("put")]),e._v("操作；")]),e._v(" "),v("li",[v("code",[e._v("PutGetBenchmark")]),e._v("：一起测试分布式原子化缓存的"),v("code",[e._v("get")]),e._v("和"),v("code",[e._v("put")]),e._v("操作；")]),e._v(" "),v("li",[v("code",[e._v("PutTxBenchmark")]),e._v("：测试分布式事务化缓存的"),v("code",[e._v("put")]),e._v("操作；")]),e._v(" "),v("li",[v("code",[e._v("PutGetTxBenchmark")]),e._v("：一起测试分布式事务化缓存的"),v("code",[e._v("get")]),e._v("和"),v("code",[e._v("put")]),e._v("操作；")]),e._v(" "),v("li",[v("code",[e._v("SqlQueryBenchmark")]),e._v("：测试在缓存数据上执行分布式SQL查询；")]),e._v(" "),v("li",[v("code",[e._v("SqlQueryJoinBenchmark")]),e._v("：测试在缓存数据上执行带关联的分布式SQL查询；")]),e._v(" "),v("li",[v("code",[e._v("SqlQueryPutBenchmark")]),e._v("：测试在执行分布式SQL查询的时候同时进行缓存的更新；")]),e._v(" "),v("li",[v("code",[e._v("AffinityCallBenchmark")]),e._v("：测试关联调用操作；")]),e._v(" "),v("li",[v("code",[e._v("ApplyBenchmark")]),e._v("：测试"),v("code",[e._v("apply")]),e._v("操作；")]),e._v(" "),v("li",[v("code",[e._v("BroadcastBenchmark")]),e._v("：测试"),v("code",[e._v("broadcast")]),e._v("操作；")]),e._v(" "),v("li",[v("code",[e._v("ExecuteBenchmark")]),e._v("：测试"),v("code",[e._v("execute")]),e._v("操作；")]),e._v(" "),v("li",[v("code",[e._v("RunBenchmark")]),e._v("：测试任务的执行操作；")]),e._v(" "),v("li",[v("code",[e._v("PutGetOffHeapBenchmark")]),e._v("：测试在有堆外内存的情况下，分布式原子化缓存的"),v("code",[e._v("put")]),e._v("和"),v("code",[e._v("get")]),e._v("操作；")]),e._v(" "),v("li",[v("code",[e._v("PutGetOffHeapValuesBenchmark")]),e._v("：测试在有堆外内存的情况下，分布式原子化缓存的"),v("code",[e._v("put")]),e._v("值操作；")]),e._v(" "),v("li",[v("code",[e._v("PutOffHeapBenchmark")]),e._v("：测试在有堆外内存的情况下，分布式原子化缓存的"),v("code",[e._v("put")]),e._v("操作；")]),e._v(" "),v("li",[v("code",[e._v("PutOffHeapValuesBenchmark")]),e._v("：测试在有堆外内存的情况下，分布式原子化缓存的"),v("code",[e._v("put")]),e._v("值操作；")]),e._v(" "),v("li",[v("code",[e._v("PutTxOffHeapBenchmark")]),e._v("：测试在有堆外内存的情况下，分布式事务化缓存的"),v("code",[e._v("put")]),e._v("操作；")]),e._v(" "),v("li",[v("code",[e._v("PutTxOffHeapValuesBenchmark")]),e._v("：测试在有堆外内存的情况下，分布式事务化缓存的"),v("code",[e._v("put")]),e._v("值操作；")]),e._v(" "),v("li",[v("code",[e._v("SqlQueryOffHeapBenchmark")]),e._v("：测试在堆外的缓存数据上执行分布式SQL查询操作；")]),e._v(" "),v("li",[v("code",[e._v("SqlQueryJoinOffHeapBenchmark")]),e._v("：测试在堆外的缓存数据上执行带关联的分布式SQL查询操作；")]),e._v(" "),v("li",[v("code",[e._v("SqlQueryPutOffHeapBenchmark")]),e._v("：测试在堆外的缓存数据上执行分布式SQL查询的同时进行缓存的更新操作；")]),e._v(" "),v("li",[v("code",[e._v("PutAllBenchmark")]),e._v("：测试在分布式原子化缓存中进行批量"),v("code",[e._v("put")]),e._v("操作；")]),e._v(" "),v("li",[v("code",[e._v("PutAllTxBenchmark")]),e._v("：测试在分布式事务化缓存中进行批量"),v("code",[e._v("put")]),e._v("操作。")])]),e._v(" "),v("h3",{attrs:{id:"_1-5-属性文件和命令行参数"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#_1-5-属性文件和命令行参数"}},[e._v("#")]),e._v(" 1.5.属性文件和命令行参数")]),e._v(" "),v("p",[e._v("本章节只会描述和Ignite测试有关的配置参数，并不是Yardstick框架的所有参数。如果要进行Ignite测试并且生成结果，需要使用"),v("code",[e._v("bin")]),e._v("文件夹中的Yardstick框架脚本执行测试用例。")]),e._v(" "),v("p",[e._v("在"),v("a",{attrs:{href:"https://github.com/gridgain/yardstick/blob/master/README.md",target:"_self",rel:"noopener noreferrer"}},[e._v("Yardstick文档")]),e._v("中有Yardstick框架的配置参数和命令行参数的详细说明。")]),e._v(" "),v("p",[e._v("下面的Ignite测试属性可以在测试配置中进行定义：")]),e._v(" "),v("ul",[v("li",[v("code",[e._v("-b <num>")]),e._v("或者"),v("code",[e._v("--backups <num>")]),e._v("：每个键的备份数量；")]),e._v(" "),v("li",[v("code",[e._v("-cfg <path>")]),e._v("或者"),v("code",[e._v("--Config <path")]),e._v("：Ignite配置文件的路径；")]),e._v(" "),v("li",[v("code",[e._v("-cs")]),e._v("或者"),v("code",[e._v("--cacheStore")]),e._v("：打开或者关闭缓存存储的通读和通写；")]),e._v(" "),v("li",[v("code",[e._v("-cl")]),e._v("或者"),v("code",[e._v("--client")]),e._v("：客户端标志，如果有多个"),v("code",[e._v("DRIVER")]),e._v("时需要使用这个标志，除了这个以外的其它"),v("code",[e._v("DRIVER")]),e._v("的行为类似于"),v("code",[e._v("SERVER")]),e._v("；")]),e._v(" "),v("li",[v("code",[e._v("-nc")]),e._v("或者"),v("code",[e._v("--nearCache")]),e._v("：近缓存标志；")]),e._v(" "),v("li",[v("code",[e._v("-nn <num>")]),e._v("或者"),v("code",[e._v("--nodeNumber <num>")]),e._v("：在"),v("code",[e._v("benchmark.properties")]),e._v("中自动配置的节点数量，用于等待启动指定数量的节点；")]),e._v(" "),v("li",[v("code",[e._v("-sm <mode>")]),e._v("或者"),v("code",[e._v("-syncMode <mode>")]),e._v("：同步模式（定义于CacheWriteSynchronizationMode）；")]),e._v(" "),v("li",[v("code",[e._v("-r <num>")]),e._v("或者"),v("code",[e._v("--range")]),e._v("：为缓存操作随机生成的键的范围；")]),e._v(" "),v("li",[v("code",[e._v("-rd")]),e._v("或者"),v("code",[e._v("--restartdelay")]),e._v("：重启延迟（秒）；")]),e._v(" "),v("li",[v("code",[e._v("-rs")]),e._v("或者"),v("code",[e._v("--restartsleep")]),e._v("：重启睡眠（秒）；")]),e._v(" "),v("li",[v("code",[e._v("-rth <host>")]),e._v("或者"),v("code",[e._v("--restHost <host>")]),e._v("：REST TCP主机；")]),e._v(" "),v("li",[v("code",[e._v("-rtp <num>")]),e._v("或者"),v("code",[e._v("--restPort <num>")]),e._v("：REST TCP端口；")]),e._v(" "),v("li",[v("code",[e._v("-ss")]),e._v("或者"),v("code",[e._v("--syncSend")]),e._v("：表示"),v("code",[e._v("TcpCommunicationSpi")]),e._v("中是否同步发送消息的标志；")]),e._v(" "),v("li",[v("code",[e._v("-txc <value>")]),e._v("或者"),v("code",[e._v("--txConcurrency <value>")]),e._v("：缓存事务的并发控制，"),v("code",[e._v("PESSIMISTIC")]),e._v("或者"),v("code",[e._v("OPTIMISTIC")]),e._v("(由CacheTxConcurrency进行定义)；")]),e._v(" "),v("li",[v("code",[e._v("-txi <value>")]),e._v("或者"),v("code",[e._v("--txIsolation <value>")]),e._v("：缓存事务隔离级别（由"),v("code",[e._v("CacheTxIsolation")]),e._v("定义）；")]),e._v(" "),v("li",[v("code",[e._v("-wb")]),e._v("或者"),v("code",[e._v("--writeBehind")]),e._v("：打开/关闭缓存存储的后写；")])]),e._v(" "),v("p",[e._v("比如，要在本地启动两个节点进行"),v("code",[e._v("PutBenchmark")]),e._v("测试，备份数为1，同步模式为"),v("code",[e._v("PRIMARY_SYNC")]),e._v("，那么需要在"),v("code",[e._v("benchmark.properties")]),e._v("文件中指定如下的配置：")]),e._v(" "),v("div",{staticClass:"language- line-numbers-mode"},[v("pre",{pre:!0,attrs:{class:"language-text"}},[v("code",[e._v('SERVER_HOSTS=localhost,localhost\n...\n\n# Note that -dn and -sn, which stand for data node and server node,\n# are native Yardstick parameters and are documented in\n# Yardstick framework.\nCONFIGS="-b 1 -sm PRIMARY_SYNC -dn PutBenchmark`IgniteNode"\n')])]),e._v(" "),v("div",{staticClass:"line-numbers-wrapper"},[v("span",{staticClass:"line-number"},[e._v("1")]),v("br"),v("span",{staticClass:"line-number"},[e._v("2")]),v("br"),v("span",{staticClass:"line-number"},[e._v("3")]),v("br"),v("span",{staticClass:"line-number"},[e._v("4")]),v("br"),v("span",{staticClass:"line-number"},[e._v("5")]),v("br"),v("span",{staticClass:"line-number"},[e._v("6")]),v("br"),v("span",{staticClass:"line-number"},[e._v("7")]),v("br")])]),v("h3",{attrs:{id:"_1-6-从源代码构建"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#_1-6-从源代码构建"}},[e._v("#")]),e._v(" 1.6.从源代码构建")]),e._v(" "),v("p",[e._v("在Ignite的根目录中执行:"),v("code",[e._v("mvn clean package -Pyardstick -pl modules/yardstick -am -DskipTests")]),e._v("。\n这个命令会对工程进行编译，还会从"),v("code",[e._v("yardstick-resources.zip")]),e._v("文件中解压脚本到"),v("code",[e._v("modules/yardstick/target/assembly/bin")]),e._v("目录。")]),e._v(" "),v("p",[e._v("构件位于"),v("code",[e._v("modules/yardstick/target/assembly")]),e._v("目录。")]),e._v(" "),v("h3",{attrs:{id:"_1-7-自定义ignite测试"}},[v("a",{staticClass:"header-anchor",attrs:{href:"#_1-7-自定义ignite测试"}},[e._v("#")]),e._v(" 1.7.自定义Ignite测试")]),e._v(" "),v("p",[e._v("所有的测试用例都需要继承"),v("code",[e._v("AbstractBenchmark")]),e._v("类，并且实现"),v("code",[e._v("test")]),e._v("方法（这个方法实际执行性能测试）。")])])}),[],!1,null,null,null);_.default=a.exports}}]);
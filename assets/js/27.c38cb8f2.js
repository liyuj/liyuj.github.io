(window.webpackJsonp=window.webpackJsonp||[]).push([[27],{216:function(t,a,s){"use strict";s.r(a);var n=s(3),e=Object(n.a)({},(function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h1",{attrs:{id:"apache-ignite-net-2-8的新功能"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#apache-ignite-net-2-8的新功能"}},[t._v("#")]),t._v(" Apache Ignite.NET 2.8的新功能")]),t._v(" "),s("h2",{attrs:{id:"瘦客户端和分区感知"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#瘦客户端和分区感知"}},[t._v("#")]),t._v(" 瘦客户端和分区感知")]),t._v(" "),s("p",[t._v("从一开始，Ignite就支持"),s("a",{attrs:{href:"https://www.ignite-service.cn/doc/java/#_7-%E5%AE%A2%E6%88%B7%E7%AB%AF%E5%92%8C%E6%9C%8D%E5%8A%A1%E7%AB%AF",target:"_self",rel:"noopener noreferrer"}},[t._v("客户端和服务端连接模式")]),t._v("。不过即使客户端模式不存储数据也不执行计算，它仍然相对“笨重”，启动Ignite.NET客户端节点需要一个嵌入式的JVM环境，可能至少需要一秒钟，并且消耗几兆字节的内存。")]),t._v(" "),s("p",[t._v("在某些场景中，例如短期在线应用、低功耗客户端主机、命令行工具等，可能不希望这样的架构。因此Ignite从2.4版本开始，新增了轻量级的瘦客户端协议来处理这些场景，下面是简单的比较：")]),t._v(" "),s("table",[s("thead",[s("tr",[s("th"),t._v(" "),s("th",[t._v("胖客户端")]),t._v(" "),s("th",[t._v("瘦客户端")])])]),t._v(" "),s("tbody",[s("tr",[s("td",[t._v("启动时间")]),t._v(" "),s("td",[t._v("1300 ms")]),t._v(" "),s("td",[t._v("15 ms")])]),t._v(" "),s("tr",[s("td",[t._v("内存占用")]),t._v(" "),s("td",[t._v("40 MB (.NET + Java)")]),t._v(" "),s("td",[t._v("70 KB")])]),t._v(" "),s("tr",[s("td",[t._v("是否需要 Java")]),t._v(" "),s("td",[t._v("是")]),t._v(" "),s("td",[t._v("否")])])])]),t._v(" "),s("p",[t._v("Ignite.NET瘦客户端通过"),s("code",[t._v("Ignition.StartClient()")]),t._v("启动，并提供一组和胖客户端类似的API。根接口是分开的（"),s("code",[t._v("IIgnite")]),t._v("-> "),s("code",[t._v("IIgniteClient")]),t._v("，"),s("code",[t._v("ICache")]),t._v("-> "),s("code",[t._v("ICacheClient")]),t._v("），但是方法的命名方式相同，并且大多数代码可以轻松地来回切换。")]),t._v(" "),s("p",[t._v("瘦客户端协议是开放、可扩展并且文档化的，这样也为其他语言（例如"),s("a",{attrs:{href:"https://www.ignite-service.cn/doc/java/ThinClients.html#_1-%E7%98%A6%E5%AE%A2%E6%88%B7%E7%AB%AF",target:"_self",rel:"noopener noreferrer"}},[t._v("Python、JavaScript和PHP")]),t._v("）的客户端铺平了道路。")]),t._v(" "),s("h3",{attrs:{id:"分区感知"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#分区感知"}},[t._v("#")]),t._v(" 分区感知")]),t._v(" "),s("p",[t._v("瘦客户端的初始实现使用接入指定服务端节点的单个连接来执行所有的操作。大家都知道Ignite在集群节点之间平均分配缓存数据，当瘦客户端连接到节点A，但请求的数据在节点B上时，则必须从A到B发出另一个网络请求，这样并不高效。")]),t._v(" "),s("p",[t._v("Ignite从2.8版本开始，引入了瘦客户端分区感知功能：瘦客户端可以接入所有服务端节点，确定给定键的主节点，并将请求直接路由到该节点，从而避免了额外的网络负载。这种路由非常快，它通过键哈希值的一些基本数学运算，就可以根据已知的分区分布确定目标节点。通过"),s("code",[t._v("IgniteClientConfiguration.EnablePartitionAwareness = true")]),t._v("打开/关闭分区感知后，"),s("code",[t._v("cache.Get")]),t._v("操作的性能测试结果如下：")]),t._v(" "),s("div",{staticClass:"language- extra-class"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[t._v("|            Method |     Mean |    Error |   StdDev |\n|------------------ |---------:|---------:|---------:|\n|               Get | 90.73 us | 2.114 us | 5.892 us |\n| GetPartitionAware | 31.56 us | 0.618 us | 1.234 us |\n")])])]),s("p",[t._v("具体测试中，集群拓扑、网络速度和缓存数据量可能有所不同，测试结果可能会不一样，但改进幅度是很大的。")]),t._v(" "),s("h3",{attrs:{id:"故障转移"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#故障转移"}},[t._v("#")]),t._v(" 故障转移")]),t._v(" "),s("p",[t._v("瘦客户端多节点连接还意味着故障转移的能力：如果一个或多个服务端节点发生故障，则客户端会自动切换到其他连接。")]),t._v(" "),s("h2",{attrs:{id:"跨平台支持-net-core、linux、macos"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#跨平台支持-net-core、linux、macos"}},[t._v("#")]),t._v(" 跨平台支持：.NET Core、Linux、macOS")]),t._v(" "),s("p",[t._v("Ignite从2.4版本开始引入了.NET Core 2.x支持，最终放弃了和Windows相关的C++部分，并切换到"),s("a",{attrs:{href:"https://en.wikipedia.org/wiki/Java_Native_Interface",target:"_self",rel:"noopener noreferrer"}},[t._v("JNI层")]),t._v("的纯.NET实现，从而使Ignite.NET应用可以在Linux和macOS上运行。")]),t._v(" "),s("p",[t._v("Ignite在2.8版本中新增了官方的.NET Core 3.x支持，并且可以在该框架支持的任何操作系统上以任何模式运行：服务端、客户端、瘦客户端。")]),t._v(" "),s("p",[t._v("Ignite改进了NuGet软件包中处理jar文件的方式，使用"),s("a",{attrs:{href:"https://docs.microsoft.com/en-us/visualstudio/msbuild/msbuild-dot-targets-files?view=vs-2019",target:"_self",rel:"noopener noreferrer"}},[t._v("MSBuild.targets文件")]),t._v("替换了"),s("code",[t._v("post_build")]),t._v("脚本，该文件更可靠，跨平台，并且可以通过"),s("code",[t._v("dotnet build")]),t._v("以及"),s("code",[t._v("dotnet publish")]),t._v("处理：.jar文件会被自动复制到构建和发布目录，从而生成一个独立的软件包。")]),t._v(" "),s("p",[t._v("注意最低系统要求仍然相同：.NET 4.0和Visual Studio2010，Ignite会保证主要版本（2.x）内的向后兼容性。但是在即将推出的Ignite 3.x中将切换到.NET Standard 2.0。")]),t._v(" "),s("h2",{attrs:{id:"linq-conditional和批量更新"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#linq-conditional和批量更新"}},[t._v("#")]),t._v(" LINQ：Conditional和批量更新")]),t._v(" "),s("p",[t._v("SQL的"),s("code",[t._v("UPDATE .. WHERE ..")]),t._v("或"),s("code",[t._v("DELETE .. WHERE ..")]),t._v("在ORM和LINQ中通常无法实现。Ignite最终使用"),s("code",[t._v(".Where()")]),t._v("来获取数据，然后一个一个更新，这个方案不是很理想，并且也不够优雅。")]),t._v(" "),s("p",[t._v("假设要冻结所有一年以上未使用我们网站的用户：")]),t._v(" "),s("div",{staticClass:"language-csharp extra-class"},[s("pre",{pre:!0,attrs:{class:"language-csharp"}},[s("code",[t._v("ICacheClient"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" Person"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),t._v(" cache "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" client"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token generic-method"}},[s("span",{pre:!0,attrs:{class:"token function"}},[t._v("GetCache")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Person")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"person"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" threshold "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" DateTime"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("UtcNow"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("AddYears")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\nIQueryable"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v("ICacheEntry"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("Person"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">>")]),t._v(" inactiveUsers "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" cache"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("AsCacheQueryable")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\t"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("Where")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("entry "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" entry"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("Value"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("LastActivityDate "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v(" threshold"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("foreach")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" entry "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("in")]),t._v(" inactiveUsers"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\tentry"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("Value"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("IsDeactivated "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("true")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\tcache"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("entry"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("Key"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" entry"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("Value"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),s("p",[t._v("这个代码会将匹配的数据加载到本地节点，浪费内存并给网络造成了压力，这也违背了Ignite并置处理的原则：即"),s("a",{attrs:{href:"https://ignite.apache.org/features/collocatedprocessing.html",target:"_self",rel:"noopener noreferrer"}},[t._v("将代码发到数据所在处，而不是将数据拉到代码所在处")]),t._v("。")]),t._v(" "),s("p",[t._v("解决方法是使用SQL代替：")]),t._v(" "),s("div",{staticClass:"language-csharp extra-class"},[s("pre",{pre:!0,attrs:{class:"language-csharp"}},[s("code",[t._v("cache"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("Query")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("SqlFieldsQuery")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("\n\t"),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"UPDATE person SET IsDeactivated = true WHERE LastActivityDate < ?"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" threshold"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),s("p",[t._v("简单、简洁、高效：Ignite会将查询发送到所有节点，并对每个缓存数据在本地执行更新，从而避免了节点之间的任何数据移动。但是开发者不想要C＃中的SQL，而是想要LINQ，因为它经过了编译器检查，并且由于IDE的高效而更易于读写。")]),t._v(" "),s("p",[t._v("Ignite在2.5中通过LINQ引入了DML更新（除了Ignite2.1中的删除操作）：")]),t._v(" "),s("div",{staticClass:"language-csharp extra-class"},[s("pre",{pre:!0,attrs:{class:"language-csharp"}},[s("code",[t._v("cache"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("AsCacheQueryable")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\t"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("Where")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("entry "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" entry"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("Value"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("LastActivityDate "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v(" threshold"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\t"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("UpdateAll")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("d "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" d"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("Set")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("person "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" person"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("IsDeactivated"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("true")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),s("p",[t._v("它将效率和LINQ的优点结合起来，转换为与上面相同的SQL查询。")]),t._v(" "),s("h2",{attrs:{id:"动态服务代理"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#动态服务代理"}},[t._v("#")]),t._v(" 动态服务代理")]),t._v(" "),s("p",[s("code",[t._v("IServices.GetDynamicServiceProxy()")]),t._v("是一个返回"),s("code",[t._v("dynamic")]),t._v("实例的新API，这样就无需事先创建接口即可调用任意服务，例如：")]),t._v(" "),s("div",{staticClass:"language-csharp extra-class"},[s("pre",{pre:!0,attrs:{class:"language-csharp"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("interface")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ISomeService")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("GetId")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("string")]),t._v(" data"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ISomeService")]),t._v(" proxy "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" ignite"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("GetServices")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token generic-method"}},[s("span",{pre:!0,attrs:{class:"token function"}},[t._v("GetServiceProxy")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ISomeService")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"someService"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" id "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" proxy"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("GetId")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"foo"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),s("p",[t._v("可以替换为：")]),t._v(" "),s("div",{staticClass:"language-csharp extra-class"},[s("pre",{pre:!0,attrs:{class:"language-csharp"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("dynamic")]),t._v(" proxy "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" ignite"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("GetServices")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("GetDynamicServiceProxy")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"someService"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" id "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" proxy"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("GetId")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"foo"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),s("p",[t._v("这在POC、调用Java服务等许多场景中都很有用。")]),t._v(" "),s("p",[t._v("后续甚至还可以通过字符串名字调用服务的方法：")]),t._v(" "),s("div",{staticClass:"language-csharp extra-class"},[s("pre",{pre:!0,attrs:{class:"language-csharp"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" methodName "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"foo"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" proxy "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("DynamicObject"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" ignite"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("GetServices")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("GetDynamicServiceProxy")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"someService"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\nproxy"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("TryInvokeMember")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("SimpleBinder")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("methodName"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("object")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("out")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" result"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),s("h2",{attrs:{id:"总结"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#总结"}},[t._v("#")]),t._v(" 总结")]),t._v(" "),s("p",[t._v("今后，瘦客户端协议及其各种语言的实现是Apache Ignite社区的主要方向之一，其中分区感知是一个重要的里程碑。下一步是自动服务端节点发现，这样就不必手动提供端点列表。在即将发布的版本中，还会将计算、服务、事务（已在Java瘦客户端中提供）和其他API添加到瘦客户端，瘦客户端的功能将变得更为强大。")])])}),[],!1,null,null,null);a.default=e.exports}}]);
(window.webpackJsonp=window.webpackJsonp||[]).push([[147],{334:function(t,a,s){"use strict";s.r(a);var n=s(3),e=Object(n.a)({},(function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h1",{attrs:{id:"ignite-web控制台的功能"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#ignite-web控制台的功能"}},[t._v("#")]),t._v(" Ignite Web控制台的功能")]),t._v(" "),s("h2",{attrs:{id:"_1-集群配置"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-集群配置"}},[t._v("#")]),t._v(" 1.集群配置")]),t._v(" "),s("h3",{attrs:{id:"_1-1-概述"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-1-概述"}},[t._v("#")]),t._v(" 1.1.概述")]),t._v(" "),s("p",[t._v("在Web控制台的"),s("code",[t._v("配置")]),t._v("选项卡中，可以为自己的Ignite项目高效地创建配置文件和代码片段，也可以配置Ignite集群、缓存，从任意RDBMS中导入领域模型，它还支持JDBC驱动，并且可以生成OR映射配置和POJO类。")]),t._v(" "),s("h3",{attrs:{id:"_1-2-集群"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-2-集群"}},[t._v("#")]),t._v(" 1.2.集群")]),t._v(" "),s("p",[t._v("在控制台中，可以对集群进行各种常规或者高级的配置，方便起见，Web控制台以Spring的XML格式以及Java源文件的形式创建这些配置，然后可以将其下载，或者拷贝进自己的工程。")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/b6eb965-cluster.png",alt:""}})]),t._v(" "),s("h3",{attrs:{id:"_1-3-模型"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-3-模型"}},[t._v("#")]),t._v(" 1.3.模型")]),t._v(" "),s("p",[t._v("为了加速配置文件的创建，控制台可以接入数据库然后导入模式、配置索引类型以及自动化地生成所有必要的XML OR映射配置和Java领域模型POJO。Ignite可以与任意支持JDBC驱动的RDBMS集成-包括Oracle、PostgreSQL、Microsoft SQL Server以及MySQL。")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/29e26b5-model.png",alt:""}})]),t._v(" "),s("h3",{attrs:{id:"_1-4-缓存"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-4-缓存"}},[t._v("#")]),t._v(" 1.4.缓存")]),t._v(" "),s("p",[t._v("控制台可以快速地创建和配置Ignite缓存，可以配置内存参数，持久化，还可以配置与集群关联的多个缓存的各种高级参数。")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/d8d186d-caches.png",alt:""}})]),t._v(" "),s("h3",{attrs:{id:"_1-5-igfs"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-5-igfs"}},[t._v("#")]),t._v(" 1.5.IGFS")]),t._v(" "),s("p",[t._v("还可以配置Ignite的内存文件系统，可以在已有的缓存结构中处理文件和目录。IGFS即可以工作于纯内存文件系统中，也可以对接其它的文件系统（比如各种Hadoop文件系统实现）作为一个缓存层，另外，IGFS还提供了在文件系统数据中执行MapReduce任务的API。")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/3eab31c-igfs.png",alt:""}})]),t._v(" "),s("h3",{attrs:{id:"_1-6-配置总结"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-6-配置总结"}},[t._v("#")]),t._v(" 1.6.配置总结")]),t._v(" "),s("p",[t._v("使用控制台的总览特性，可以下载一个直接可用的基于Maven的工程，它包含了XML格式和Java的配置，还有Java领域模型POJO，还可以拷贝这些配置和POJO到自己已有的工程。控制台还可以生成一个Docker的配置文件，可以用其生成一个Ignite Docker镜像。")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/4100500-summary.png",alt:""}})]),t._v(" "),s("h2",{attrs:{id:"_2-自动化rdbms集成"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-自动化rdbms集成"}},[t._v("#")]),t._v(" 2.自动化RDBMS集成")]),t._v(" "),s("p",[t._v("Ignite的Web控制台可以配置所有的集群属性，并且在与持久化存储集成时还可以从数据库导入模式，控制台会接入指定的数据库然后生成所有必要的OR映射配置文件（XML和纯Java）以及Java领域模型POJOs。")]),t._v(" "),s("p",[t._v("Ignite还有一个"),s("code",[t._v("org.apache.ignite.cache.store.jdbc.CacheJdbcPojoStore")]),t._v("，这是Ignite的"),s("code",[t._v("CacheStore")]),t._v("接口的一个JDBC实现，它可以自动化地处理所有的通读和通写逻辑。")]),t._v(" "),s("h3",{attrs:{id:"_2-1-工作方式"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-1-工作方式"}},[t._v("#")]),t._v(" 2.1.工作方式")]),t._v(" "),s("p",[t._v("一个专门的应用-"),s("code",[t._v("ignite-web-agent")]),t._v("，需要在RDBMS端启动，该应用会收集数据库模式元数据，然后将其发送给Ignite的Web控制台。")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/75cc78a-GridGain-Web-Console-Schema-Import_v2.png",alt:""}})]),t._v(" "),s("h3",{attrs:{id:"_2-2-数据库模式导入"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-2-数据库模式导入"}},[t._v("#")]),t._v(" 2.2.数据库模式导入")]),t._v(" "),s("p",[t._v("在浏览器中打开部署在GridGain的Ignite"),s("a",{attrs:{href:"https://console.gridgain.com/",target:"_self",rel:"noopener noreferrer"}},[t._v("Web控制台实例")]),t._v("然后登录，或者也可以构建和部署一个自己的Web控制台实例。")]),t._v(" "),s("blockquote",[s("p",[s("strong",[t._v("Web控制台部署和Logo")]),t._v("\n为了简化，使用了一个已经部署的Web控制台实例，这个实例部署在GridGain的基础设施上，并且将GridGain的logo嵌入作为主界面的一部分，在本章节的所有截图中，也会看到这个logo，注意可以将Web控制台部署到任意主机，也可以使用其它的logo。")])]),t._v(" "),s("p",[s("strong",[t._v("1.配置Ignite集群")])]),t._v(" "),s("p",[t._v("在"),s("strong",[t._v("Clusters")]),t._v("界面中创建一个集群：")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/dcc0069-create-cluster.png",alt:""}})]),t._v(" "),s("p",[s("strong",[t._v("2.配置领域模型")])]),t._v(" "),s("p",[t._v("打开"),s("strong",[t._v("Model")]),t._v("界面然后点击"),s("strong",[t._v("Import from database")]),t._v("按钮：")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/c89abcc-model-screen.png",alt:""}})]),t._v(" "),s("p",[t._v("如果Ignite的WebAgent还没有启动，Web控制台会显示一个对话框来提示下载WebAgent然后启动它，WebAgent需要部署在可以访问要导入模式的数据库所在的主机上。")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/6b32b3f-download-web-agent.png",alt:""}})]),t._v(" "),s("p",[t._v("在WebAgent启动以及接入Web服务器之后，会有一个向导来帮助从数据库导入模式，注意要将数据库的驱动拷贝入WebAgent的"),s("code",[t._v("jdbc-drivers")]),t._v("文件夹。")]),t._v(" "),s("p",[t._v("1.配置接入数据库：")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/fbd346a-wizard-step-1.png",alt:""}})]),t._v(" "),s("p",[t._v("2.选择要导入的表所在的模式：")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/ba21e16-wizard-step-2.png",alt:""}})]),t._v(" "),s("p",[t._v("3.选择要作为领域模型以及配置映射对应的表，每个表默认都会被导入为一个独立的分区缓存。")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/605cc6a-wizard-step-3.png",alt:""}})]),t._v(" "),s("p",[t._v("4.指定各种导入选项，并且选择与生成的缓存相关联的集群：")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/565c881-wizard-step-4.png",alt:""}})]),t._v(" "),s("p",[s("strong",[t._v("3.下载工程")])]),t._v(" "),s("p",[t._v("模式导入之后，打开"),s("code",[t._v("Summary")]),t._v("界面然后下载包含如下内容的工程：")]),t._v(" "),s("ul",[s("li",[t._v("集群和缓存的Spring XML配置文件；")]),t._v(" "),s("li",[t._v("集群和缓存配置的Java代码；")]),t._v(" "),s("li",[t._v("服务端和客户端节点启动的Java代码；")]),t._v(" "),s("li",[t._v("从底层RDBMS中预加载数据的Java代码；")]),t._v(" "),s("li",[t._v("POJO Java代码；")]),t._v(" "),s("li",[t._v("工程描述的pom.xml文件。")])]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/bc9be23-summary-screen.png",alt:""}})]),t._v(" "),s("h3",{attrs:{id:"_2-3-数据预加载"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-3-数据预加载"}},[t._v("#")]),t._v(" 2.3.数据预加载")]),t._v(" "),s("p",[t._v("如上所示，Ignite的Web控制台生成的工程包含了各种直接可用的构件。")]),t._v(" "),s("p",[t._v("如果要想快速地从底层数据库预加载数据，需要按照如下步骤进行操作：")]),t._v(" "),s("ul",[s("li",[t._v("在下载的工程中找到"),s("code",[t._v("secret.properties")]),t._v("文件，然后配置与JDBC驱动相关的参数，比如JDBC地址，用户名和密码，这些值在前述的在控制台中导入模式步骤中也用到过；")]),t._v(" "),s("li",[t._v("使用"),s("code",[t._v("ServerNodeSpringStartup")]),t._v("或者"),s("code",[t._v("ServerNodeCodeStartup")]),t._v("文件启动一个服务端节点；")]),t._v(" "),s("li",[t._v("使用"),s("code",[t._v("LoadCaches")]),t._v("文件来执行初始化，即将数据从数据库中加载进缓存。")])]),t._v(" "),s("blockquote",[s("p",[t._v("要了解这个工程结构以及已有构件的详细信息，可以看工程的README文件，它包含了与内容有关的详细说明。")])]),t._v(" "),s("h2",{attrs:{id:"_3-执行查询"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_3-执行查询"}},[t._v("#")]),t._v(" 3.执行查询")]),t._v(" "),s("p",[t._v("可以通过Web控制台接入Ignite集群然后在其中执行SQL查询，还可以查看执行计划，内存模式，还有集群的流化图表。")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/5f3c0ed-sql-graph-metadata.png",alt:""}})]),t._v(" "),s("p",[t._v("Ignite可以无限制地支持SQL查询，SQL语法兼容于ANSI-99标准，这意味着可以使用任何SQL函数、聚合、分组或者关联。可以在同一个界面中创建和执行任意数量的查询，然后以图形或者表格的形式展现结果。")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/e37ab73-sql-agg-query.png",alt:""}})]),t._v(" "),s("p",[t._v("下面是以饼图形式展现的结果：")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/595390c-sql-pie-chart.png",alt:""}})]),t._v(" "),s("h2",{attrs:{id:"_4-使用跟踪"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_4-使用跟踪"}},[t._v("#")]),t._v(" 4.使用跟踪")]),t._v(" "),s("p",[t._v("作为一个IT管理员，可能希望了解组织内的其它人通过Web控制台是如何与集群进行交互的。这样的功能通过"),s("code",[t._v("Admin panel")]),t._v("可以得到。")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/9726ee5-admin-panel-1.png",alt:""}})]),t._v(" "),s("p",[t._v("在登录用户名的下拉菜单中可以打开控制台的"),s("code",[t._v("Admin panel")]),t._v("，这个管理面板还提供了一个可能用户想要看的选项列表，通过点击三个Tab页面可以进行切换，如下图所示：")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/0071e3c-admin-panel-2.png",alt:""}})]),t._v(" "),s("h2",{attrs:{id:"_5-多集群支持"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_5-多集群支持"}},[t._v("#")]),t._v(" 5.多集群支持")]),t._v(" "),s("p",[t._v("有这样一个场景，就是环境中同时部署并且运行着多个Ignite集群，然后想使用一个Web控制台实例并行地监控并且管理它们。")]),t._v(" "),s("p",[t._v("要做到这一点，每个集群都需要启动一个Ignite Web控制台代理实例，然后映射到已经部署的Ignite Web控制台，如下图所示：")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/63771a6-Apache-Ignite-Multi-Cluster.png",alt:""}})]),t._v(" "),s("p",[t._v("开启多集群支持的最直接方式就是，在与运行的特定集群的节点之一相同的机器/硬件或者拓扑上启动代理，然后将代理映射到Web控制台实例。")]),t._v(" "),s("h3",{attrs:{id:"_5-1-单主机两集群"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_5-1-单主机两集群"}},[t._v("#")]),t._v(" 5.1.单主机两集群")]),t._v(" "),s("p",[t._v("本章节会显示如何在单主机上启动多个集群，然后将它们接入Ignite Web控制台，作为一个示例，下面会配置并且启动两个集群以及两个Ignite Web代理。")]),t._v(" "),s("p",[t._v("下面是第一个集群节点的配置示例：")]),t._v(" "),s("div",{staticClass:"language-xml extra-class"},[s("pre",{pre:!0,attrs:{class:"language-xml"}},[s("code",[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("bean")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("class")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("org.apache.ignite.configuration.IgniteConfiguration"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n  \t...\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("\x3c!--\n \t\t\t\tExplicitly configure TCP discovery SPI to provide list of\n\t\t\t\tinitial nodes from the first cluster.\n \t  --\x3e")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("property")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("discoverySpi"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("bean")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("class")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("\x3c!-- Initial local port to listen to. --\x3e")]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("property")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("localPort"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("value")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("48500"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("/>")])]),t._v("\n\n            "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("\x3c!-- Changing local port range. This is an optional action. --\x3e")]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("property")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("localPortRange"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("value")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("20"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("/>")])]),t._v("\n\n            "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("\x3c!-- Setting up IP finder for this cluster --\x3e")]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("property")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("ipFinder"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n                "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("bean")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("class")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("org.apache.ignite.spi.discovery.tcp.ipfinder.vm.TcpDiscoveryVmIpFinder"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n                    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("property")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("addresses"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n                        "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("list")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n                            "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("\x3c!--\n                                Addresses and port range of the nodes from the first\n \t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tcluster.\n                                127.0.0.1 can be replaced with actual IP addresses or\n \t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\thost names. Port range is optional.\n                            --\x3e")]),t._v("\n                            "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("value")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("127.0.0.1:48500..48520"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("value")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n                        "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("list")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n                    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("property")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n                "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("bean")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("property")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("bean")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("property")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("\x3c!--\n        Explicitly configure TCP communication SPI changing local\n \t\t\t\tport number for the nodes from the first cluster.\n    --\x3e")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("property")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("communicationSpi"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("bean")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("class")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("org.apache.ignite.spi.communication.tcp.TcpCommunicationSpi"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("property")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("localPort"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("value")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("48100"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("/>")])]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("bean")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("property")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("bean")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n")])])]),s("p",[t._v("下面是第二个集群节点的配置：")]),t._v(" "),s("div",{staticClass:"language-xml extra-class"},[s("pre",{pre:!0,attrs:{class:"language-xml"}},[s("code",[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("bean")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("id")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("ignite.cfg"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("class")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("org.apache.ignite.configuration.IgniteConfiguration"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("\x3c!--\n        Explicitly configure TCP discovery SPI to provide list of initial\n         nodes from the second cluster.\n    --\x3e")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("property")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("discoverySpi"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("bean")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("class")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("org.apache.ignite.spi.discovery.tcp.TcpDiscoverySpi"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("\x3c!-- Initial local port to listen to. --\x3e")]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("property")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("localPort"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("value")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("49500"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("/>")])]),t._v("\n\n            "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("\x3c!-- Changing local port range. This is an optional action. --\x3e")]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("property")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("localPortRange"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("value")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("20"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("/>")])]),t._v("\n\n            "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("\x3c!-- Setting up IP finder for this cluster --\x3e")]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("property")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("ipFinder"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n                "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("bean")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("class")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("org.apache.ignite.spi.discovery.tcp.ipfinder.vm.TcpDiscoveryVmIpFinder"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n                    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("property")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("addresses"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n                        "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("list")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n                            "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("\x3c!--\n                                Addresses and port range of the nodes from the second\n \t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tcluster.\n                                127.0.0.1 can be replaced with actual IP addresses or\n \t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\thost names. Port range is optional.\n                            --\x3e")]),t._v("\n                            "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("value")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("127.0.0.1:49500..49520"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("value")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n                        "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("list")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n                    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("property")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n                "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("bean")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("property")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("bean")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("property")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("\x3c!--\n        Explicitly configure TCP communication SPI changing local port number\n        for the nodes from the second cluster.\n    --\x3e")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("property")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("communicationSpi"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("bean")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("class")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("org.apache.ignite.spi.communication.tcp.TcpCommunicationSpi"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("property")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("localPort"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("value")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("49100"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("/>")])]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("bean")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("property")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("bean")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n")])])]),s("p",[t._v("假定集群的配置位于"),s("code",[t._v("${IGNITE_HOME}/config")]),t._v("文件夹，那么可以通过如下命令启动第一个集群的节点：")]),t._v(" "),s("div",{staticClass:"language-bash extra-class"},[s("pre",{pre:!0,attrs:{class:"language-bash"}},[s("code",[t._v("ignite.sh -v -J-DIGNITE_JETTY_PORT"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("8080")]),t._v(" config/first-cluster.xml\n")])])]),s("p",[t._v("然后通过如下方式启动第二个集群：")]),t._v(" "),s("div",{staticClass:"language-bash extra-class"},[s("pre",{pre:!0,attrs:{class:"language-bash"}},[s("code",[t._v("ignite.sh -v -J-DIGNITE_JETTY_PORT"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("9090")]),t._v(" config/second-cluster.xml\n")])])]),s("p",[t._v("因为这些节点在一台主机上启动，所以需要将"),s("code",[t._v("JETTY_PORT")]),t._v("参数配置为不同的值。")]),t._v(" "),s("p",[t._v("最后，启动一个Web代理，接入第一个集群节点：")]),t._v(" "),s("div",{staticClass:"language-bash extra-class"},[s("pre",{pre:!0,attrs:{class:"language-bash"}},[s("code",[t._v("ignite-web-agent.sh --node-uri http://localhost:8080\n")])])]),s("p",[t._v("然后一个web代理接入第二个集群：")]),t._v(" "),s("div",{staticClass:"language-bash extra-class"},[s("pre",{pre:!0,attrs:{class:"language-bash"}},[s("code",[t._v("ignite-web-agent.sh --node-uri http://localhost:9090\n")])])]),s("p",[t._v("通过浏览器打开Web控制台，然后就可以看到控制台可以处理下拉框中的两个集群。")]),t._v(" "),s("h3",{attrs:{id:"_5-2-不同主机的两个集群"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_5-2-不同主机的两个集群"}},[t._v("#")]),t._v(" 5.2.不同主机的两个集群")]),t._v(" "),s("p",[t._v("如果Ignite集群部署在没有交集的一组主机上，那么是不需要配置上述的"),s("code",[t._v("TcpDiscoverySpi")]),t._v("，"),s("code",[t._v("TcpCommunicationSpi")]),t._v("或者"),s("code",[t._v("JETTY_PORT")]),t._v("的。")]),t._v(" "),s("p",[t._v("需要做的仅仅是启动集群然后将Web代理的实例接入第一个集群：")]),t._v(" "),s("div",{staticClass:"language-bash extra-class"},[s("pre",{pre:!0,attrs:{class:"language-bash"}},[s("code",[t._v("ignite-web-agent.sh --node-uri http://host1:8080\n")])])]),s("p",[t._v("然后重复，接入第二个集群：")]),t._v(" "),s("div",{staticClass:"language-bash extra-class"},[s("pre",{pre:!0,attrs:{class:"language-bash"}},[s("code",[t._v("ignite-web-agent.sh --node-uri http://host2:9090\n")])])])])}),[],!1,null,null,null);a.default=e.exports}}]);
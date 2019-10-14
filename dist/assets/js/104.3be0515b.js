(window.webpackJsonp=window.webpackJsonp||[]).push([[104],{117:function(t,s,a){"use strict";a.r(s);var n=a(0),e=Object(n.a)({},(function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"数据网格"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#数据网格","aria-hidden":"true"}},[t._v("#")]),t._v(" 数据网格")]),t._v(" "),a("h2",{attrs:{id:"_1-数据网格"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-数据网格","aria-hidden":"true"}},[t._v("#")]),t._v(" 1.数据网格")]),t._v(" "),a("p",[t._v("Ignite.NET针对越来越火的水平扩展概念而构建，具有实时按需增加节点的能力。它可以线性扩展至几百个节点，通过数据位置的强语义以及关联数据路由来降低冗余数据噪声。")]),t._v(" "),a("p",[t._v("Ignite数据网格是一个"),a("code",[t._v("分布式内存键-值存储")]),t._v("，它可以视为一个分布式的分区化哈希映射，每个集群节点都持有所有数据的一部分，这意味着随着集群节点的增加，就可以缓存更多的数据。")]),t._v(" "),a("p",[t._v("与其它键值存储系统不同，Ignite通过可插拔的哈希算法来决定数据的位置，每个客户端都可以通过一个哈希函数决定一个键属于哪个节点，而不需要任何特定的映射服务器或者协调器节点。")]),t._v(" "),a("p",[t._v("Ignite数据网格支持本地、复制、分区模式的数据集，可以使用标准SQL语法方便地进行跨数据集查询，同时还支持在数据中进行分布式SQL关联。")]),t._v(" "),a("p",[t._v("Ignite数据网格轻量快速，是目前在集群中支持数据的事务性和原子性的最快的实现之一。")]),t._v(" "),a("div",{staticClass:"tip custom-block"},[a("p",{staticClass:"custom-block-title"},[t._v("数据一致性")]),t._v(" "),a("p",[t._v("只要集群处于在线状态，即使节点故障或拓扑发生变化，Ignite都会保证不同节点之间的数据始终保持一致。")])]),t._v(" "),a("p",[a("img",{attrs:{src:"https://files.readme.io/ae429f4-data_grid.png",alt:""}})]),t._v(" "),a("p",[a("strong",[t._v("功能特性")])]),t._v(" "),a("ul",[a("li",[t._v("分布式内存缓存；")]),t._v(" "),a("li",[t._v("高性能；")]),t._v(" "),a("li",[t._v("弹性扩展；")]),t._v(" "),a("li",[t._v("分布式内存事务；")]),t._v(" "),a("li",[t._v("分层堆外存储；")]),t._v(" "),a("li",[t._v("支持关联的分布式ANSI-99 SQL查询。")])]),t._v(" "),a("h3",{attrs:{id:"_1-1-ignitecache"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-1-ignitecache","aria-hidden":"true"}},[t._v("#")]),t._v(" 1.1.IgniteCache")]),t._v(" "),a("p",[a("code",[t._v("ICache")]),t._v("接口是Ignite缓存实现的入口，提供了存储和获取数据、执行查询（包括SQL）、迭代和扫描等的方法。")]),t._v(" "),a("p",[t._v("可以像下面这样获得"),a("code",[t._v("ICache")]),t._v("的实例：")]),t._v(" "),a("div",{staticClass:"language-csharp line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-csharp"}},[a("code",[a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("IIgnite")]),t._v(" ignite "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" Ignition"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("Start")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v('// Obtain instance of cache named "myCache".')]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// Note that generic arguments are only for your convenience.")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// You can work with any cache in terms of any generic arguments.")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// However, attempt to retrieve an entry of incompatible type")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// will result in exception.")]),t._v("\nICache"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("string")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),t._v(" cache "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" ignite"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token generic-method"}},[a("span",{pre:!0,attrs:{class:"token function"}},[t._v("GetCache")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("string")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"myCache"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br"),a("span",{staticClass:"line-number"},[t._v("6")]),a("br"),a("span",{staticClass:"line-number"},[t._v("7")]),a("br"),a("span",{staticClass:"line-number"},[t._v("8")]),a("br")])]),a("p",[t._v("还可以动态创建缓存的实例，这时Ignite会在所有服务端节点上创建和部署缓存。")]),t._v(" "),a("div",{staticClass:"language-csharp line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-csharp"}},[a("code",[a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("IIgnite")]),t._v(" ignite "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" Ignition"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("Start")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// Create cache with given name, if it does not exist.")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" cache "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" ignite"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token generic-method"}},[a("span",{pre:!0,attrs:{class:"token function"}},[t._v("GetOrCreateCache")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("string")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"myNewCache"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br")])]),a("div",{staticClass:"tip custom-block"},[a("p",{staticClass:"custom-block-title"},[t._v("XML配置")]),t._v(" "),a("p",[t._v("在任何节点上的Ignite Spring XML配置中定义的所有缓存都会自动创建并部署在所有服务端节点上（即无需在每个节点上都指定相同的配置）。")])])])}),[],!1,null,null,null);s.default=e.exports}}]);
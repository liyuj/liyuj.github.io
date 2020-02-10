(window.webpackJsonp=window.webpackJsonp||[]).push([[117],{173:function(t,a,s){"use strict";s.r(a);var n=s(0),e=Object(n.a)({},(function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h1",{attrs:{id:"持久化"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#持久化"}},[t._v("#")]),t._v(" 持久化")]),t._v(" "),s("h2",{attrs:{id:"_1-原生持久化"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-原生持久化"}},[t._v("#")]),t._v(" 1.原生持久化")]),t._v(" "),s("p",[t._v("Ignite原生持久化是一种分布式的兼容ACID和SQL的磁盘存储，其可以透明地与Ignite的固化内存集成。原生持久化是可选的，可以启用和禁用，禁用后Ignite就成为纯内存存储。")]),t._v(" "),s("p",[t._v("启用持久化后，就不再需要将所有数据和索引保存在内存中，也无需在节点或集群重启后进行内存预热，因为Ignite"),s("RouterLink",{attrs:{to:"/doc/net/DurableMemory.html#_1-固化内存"}},[t._v("固化内存")]),t._v("与持久化是紧密耦合的，并将其视为二级存储，这意味着如果内存中缺少部分数据或索引，则固化内存将从磁盘中获取数据。")],1),t._v(" "),s("p",[t._v("具体细节请参见Java版本的"),s("RouterLink",{attrs:{to:"/doc/java/Persistence.html"}},[t._v("相关文档")]),t._v("。")],1),t._v(" "),s("h3",{attrs:{id:"_1-1-用法"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-1-用法"}},[t._v("#")]),t._v(" 1.1.用法")]),t._v(" "),s("p",[t._v("要启用分布式持久化存储，需要配置"),s("code",[t._v("IgniteConfiguration.PersistentStoreConfiguration")]),t._v("属性：")]),t._v(" "),s("p",[t._v("C#：")]),t._v(" "),s("div",{staticClass:"language-csharp line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-csharp"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" cfg "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("IgniteConfiguration")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    DataStorageConfiguration "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("DataStorageConfiguration")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        DefaultDataRegionConfiguration "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("DataRegionConfiguration")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n            Name "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"defaultRegion"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n            PersistenceEnabled "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("true")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        DataRegionConfigurations "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("DataRegionConfiguration")]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n                "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// Persistence is off by default.")]),t._v("\n                Name "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"inMemoryRegion"')]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    CacheConfiguration "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("CacheConfiguration")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// Default data region has persistence enabled.")]),t._v("\n            Name "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"persistentCache"')]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("CacheConfiguration")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n            Name "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"inMemoryOnlyCache"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n            DataRegionName "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"inMemoryRegion"')]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br"),s("span",{staticClass:"line-number"},[t._v("8")]),s("br"),s("span",{staticClass:"line-number"},[t._v("9")]),s("br"),s("span",{staticClass:"line-number"},[t._v("10")]),s("br"),s("span",{staticClass:"line-number"},[t._v("11")]),s("br"),s("span",{staticClass:"line-number"},[t._v("12")]),s("br"),s("span",{staticClass:"line-number"},[t._v("13")]),s("br"),s("span",{staticClass:"line-number"},[t._v("14")]),s("br"),s("span",{staticClass:"line-number"},[t._v("15")]),s("br"),s("span",{staticClass:"line-number"},[t._v("16")]),s("br"),s("span",{staticClass:"line-number"},[t._v("17")]),s("br"),s("span",{staticClass:"line-number"},[t._v("18")]),s("br"),s("span",{staticClass:"line-number"},[t._v("19")]),s("br"),s("span",{staticClass:"line-number"},[t._v("20")]),s("br"),s("span",{staticClass:"line-number"},[t._v("21")]),s("br"),s("span",{staticClass:"line-number"},[t._v("22")]),s("br"),s("span",{staticClass:"line-number"},[t._v("23")]),s("br"),s("span",{staticClass:"line-number"},[t._v("24")]),s("br"),s("span",{staticClass:"line-number"},[t._v("25")]),s("br"),s("span",{staticClass:"line-number"},[t._v("26")]),s("br"),s("span",{staticClass:"line-number"},[t._v("27")]),s("br"),s("span",{staticClass:"line-number"},[t._v("28")]),s("br"),s("span",{staticClass:"line-number"},[t._v("29")]),s("br"),s("span",{staticClass:"line-number"},[t._v("30")]),s("br"),s("span",{staticClass:"line-number"},[t._v("31")]),s("br"),s("span",{staticClass:"line-number"},[t._v("32")]),s("br")])]),s("p",[t._v("app.config：")]),t._v(" "),s("div",{staticClass:"language-xml line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-xml"}},[s("code",[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("igniteConfiguration")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("dataStorageConfiguration")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("\x3c!-- Enable persistence for all caches by default. --\x3e")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("defaultDataRegionConfiguration")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("defaultRegion"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("persistenceEnabled")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("true"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("/>")])]),t._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("\x3c!-- Define custom region without persistence. --\x3e")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("dataRegionConfigurations")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("dataRegionConfiguration")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("inMemoryRegion"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("/>")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("dataRegionConfigurations")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n\n  "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("dataStorageConfiguration")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("cacheConfiguration")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("\x3c!-- Default region is persistent. --\x3e")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("cacheConfiguration")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("persistentCache"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("/>")])]),t._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("\x3c!-- Custom cache without persistence. --\x3e")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("cacheConfiguration")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("dataRegionName")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("inMemoryRegion"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("inMemoryOnlyCache"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("/>")])]),t._v("\n\n  "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("cacheConfiguration")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("igniteConfiguration")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br"),s("span",{staticClass:"line-number"},[t._v("8")]),s("br"),s("span",{staticClass:"line-number"},[t._v("9")]),s("br"),s("span",{staticClass:"line-number"},[t._v("10")]),s("br"),s("span",{staticClass:"line-number"},[t._v("11")]),s("br"),s("span",{staticClass:"line-number"},[t._v("12")]),s("br"),s("span",{staticClass:"line-number"},[t._v("13")]),s("br"),s("span",{staticClass:"line-number"},[t._v("14")]),s("br"),s("span",{staticClass:"line-number"},[t._v("15")]),s("br"),s("span",{staticClass:"line-number"},[t._v("16")]),s("br"),s("span",{staticClass:"line-number"},[t._v("17")]),s("br"),s("span",{staticClass:"line-number"},[t._v("18")]),s("br"),s("span",{staticClass:"line-number"},[t._v("19")]),s("br"),s("span",{staticClass:"line-number"},[t._v("20")]),s("br"),s("span",{staticClass:"line-number"},[t._v("21")]),s("br"),s("span",{staticClass:"line-number"},[t._v("22")]),s("br")])]),s("p",[t._v("启用持久化存储后，所有的数据和索引都会同时保存在内存和磁盘上。")]),t._v(" "),s("p",[t._v("如果Ignite发现启用了持久化，会将集群从激活状态转为非激活状态，这时应用非经允许无法对数据进行修改。这样做是为了避免应用在集群重启的过程中修改持久化的、可能还未准备好的数据的情况。因此这时的常规做法是等待所有节点加入集群，然后从应用或者任何节点调用"),s("code",[t._v("IIgnite.SetActive(true)")]),t._v("，以将集群转为激活状态。")]),t._v(" "),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[t._v("持久化存储根路径")]),t._v(" "),s("p",[t._v("Ignite中所有数据默认保存在工作目录（"),s("code",[t._v("IGNITE_HOME\\work")]),t._v("），可以通过"),s("code",[t._v("PersistentStoreConfiguration.PersistentStorePath")]),t._v("属性对默认值进行修改。")])]),t._v(" "),s("h2",{attrs:{id:"_2-第三方持久化"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-第三方持久化"}},[t._v("#")]),t._v(" 2.第三方持久化")]),t._v(" "),s("p",[t._v("Ignite.NET针对底层持久化存储（例如Oracle、MSSQL等RDBMS或MongoDB、Couchbase之类的NoSQL数据库）的"),s("strong",[t._v("通读")]),t._v("和"),s("strong",[t._v("通写")]),t._v("，提供了"),s("code",[t._v("ICacheStore")]),t._v("API。")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://files.readme.io/94a0f76-in_memory_data.png",alt:""}})]),t._v(" "),s("h3",{attrs:{id:"_2-1-通读和通写"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-1-通读和通写"}},[t._v("#")]),t._v(" 2.1.通读和通写")]),t._v(" "),s("p",[t._v("当需要进行通读或通写行为时，提供正确的缓存存储实现非常重要。通读即如果数据在缓存中无效，会从持久化存储中读取数据，而通写则是如果缓存数据发生了更新，数据会自动持久化。所有的通读和通写操作将参与整个缓存事务，并在整体上进行提交或回滚。")]),t._v(" "),s("p",[t._v("要配置通读和通写，需要实现"),s("code",[t._v("ICacheStore")]),t._v("接口，并在配置文件中配置"),s("code",[t._v("CacheConfiguration")]),t._v("的"),s("code",[t._v("cacheStoreFactory")]),t._v("、"),s("code",[t._v("readThrough")]),t._v("和"),s("code",[t._v("writeThrough")]),t._v("属性，后面会有示例。")]),t._v(" "),s("h3",{attrs:{id:"_2-2-后写缓存"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-2-后写缓存"}},[t._v("#")]),t._v(" 2.2.后写缓存")]),t._v(" "),s("p",[t._v("在简单的通写模式下，每个缓存的写入和删除操作都将涉及对持久化存储的相应请求，因此缓存更新的总持续时间可能相对较长，此外密集的缓存更新可能会导致极高的存储负载。")]),t._v(" "),s("p",[t._v("对于此类情况，Ignite提供了异步持久化更新选项（也称为"),s("code",[t._v("后写")]),t._v("）。此方法的关键概念是累积更新，然后将其批量异步刷新到持久化存储中。实际的数据持久化可以通过基于时间的事件（数据可以在队列中驻留的最大时间受到限制）或队列大小的事件（队列的大小达到某个特定点时刷新）来触发，也可以将两者结合在一起，这时任一事件都会触发刷新。")]),t._v(" "),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[t._v("更新顺序")]),t._v(" "),s("p",[t._v("使用后写的方式，只有数据的最后一次更新会被写入底层存储。如果键为"),s("code",[t._v("key1")]),t._v("的数据分别用值"),s("code",[t._v("value1")]),t._v("、"),s("code",[t._v("value2")]),t._v("和"),s("code",[t._v("value3")]),t._v("进行更新，则只将（"),s("code",[t._v("key1")]),t._v("，"),s("code",[t._v("value3")]),t._v("）这个请求传播到持久化。")])]),t._v(" "),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[t._v("更新性能")]),t._v(" "),s("p",[t._v("批量操作通常比一系列的单个操作更有效率，因此可以通过在后写模式下启用批量操作来利用此功能。可以将相似类型的更新序列（写入或删除）组合为一个批次，例如可以将（"),s("code",[t._v("key1")]),t._v("，"),s("code",[t._v("value1")]),t._v("）、（"),s("code",[t._v("key2")]),t._v("，"),s("code",[t._v("value2")]),t._v("）和（"),s("code",[t._v("key3")]),t._v("，"),s("code",[t._v("value3")]),t._v("）的顺序写入组合到单个"),s("code",[t._v("CacheStore.putAll(...)")]),t._v("操作中。")])]),t._v(" "),s("p",[t._v("可以通过"),s("code",[t._v("CacheConfiguration.writeBehindEnabled")]),t._v("属性启用后写缓存，有关后写缓存的可自定义属性列表，请参见下面的"),s("a",{attrs:{href:"#_2-5-%E9%85%8D%E7%BD%AE"}},[t._v("配置")]),t._v("部分。")]),t._v(" "),s("h3",{attrs:{id:"_2-3-icachestore"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-3-icachestore"}},[t._v("#")]),t._v(" 2.3.ICacheStore")]),t._v(" "),s("p",[t._v("Ignite.NET中的"),s("code",[t._v("ICacheStore")]),t._v("接口用于和底层数据存储之间的数据读写。")]),t._v(" "),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[t._v("事务")]),t._v(" "),s("p",[s("code",[t._v("ICacheStore")]),t._v("是完全事务性的，会自动合并到正在进行的缓存事务中。")])]),t._v(" "),s("p",[s("strong",[t._v("LoadCache()")])]),t._v(" "),s("p",[s("code",[t._v("ICacheStore.LoadCache()")]),t._v("用于缓存数据加载，即使没有传入要加载的键也可以。它通常用于启动时预热缓存，但是也可以在启动缓存后的任何时候调用它。")]),t._v(" "),s("p",[s("code",[t._v("ICache.LoadCache()")]),t._v("方法将委派给持有该缓存的节点的"),s("code",[t._v("ICacheStore.LoadCache()")]),t._v("方法，如果希望仅在本地节点上调用加载，可以使用"),s("code",[t._v("ICache.LocalLoadCache()")]),t._v("方法。")]),t._v(" "),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[t._v("提示")]),t._v(" "),s("p",[t._v("如果是分区缓存，对于不是映射到该节点的键（无论是主还是备）将被缓存自动丢弃。")])]),t._v(" "),s("p",[s("strong",[t._v("Load(),Write(),Delete()")])]),t._v(" "),s("p",[t._v("当调用"),s("code",[t._v("ICache")]),t._v("接口的"),s("code",[t._v("Get()")]),t._v("、"),s("code",[t._v("Put()")]),t._v("以及"),s("code",[t._v("Remove()")]),t._v("方法时，会相对应地调用"),s("code",[t._v("ICacheStore")]),t._v("的"),s("code",[t._v("Load()")]),t._v("、"),s("code",[t._v("Write()")]),t._v("以及"),s("code",[t._v("Delete()")]),t._v("方法，在处理单个缓存数据时，这些方法用于实现通读和通写行为。")]),t._v(" "),s("p",[s("strong",[t._v("LoadAll(),WriteAll(),DeleteAll()")])]),t._v(" "),s("p",[t._v("当调用"),s("code",[t._v("ICache")]),t._v("接口的"),s("code",[t._v("GetAll()")]),t._v("、"),s("code",[t._v("PutAll()")]),t._v("以及"),s("code",[t._v("RemoveAll()")]),t._v("方法时，会相对应地调用"),s("code",[t._v("ICacheStore")]),t._v("的"),s("code",[t._v("LoadAll()")]),t._v("、"),s("code",[t._v("WriteAll()")]),t._v("以及"),s("code",[t._v("DeleteAll()")]),t._v("方法，在处理多个缓存数据时，这些方法用于实现通读和通写行为，通常通过批量操作以实现更好的性能。")]),t._v(" "),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[t._v("提示")]),t._v(" "),s("p",[s("code",[t._v("CacheStoreAdapter")]),t._v("提供了"),s("code",[t._v("LoadAll()")]),t._v("、"),s("code",[t._v("WriteAll()")]),t._v("和"),s("code",[t._v("DeleteAll()")]),t._v("这些方法的默认实现，它们只是简单地一个个迭代所有键。")])]),t._v(" "),s("p",[s("strong",[t._v("SessionEnd()")])]),t._v(" "),s("p",[t._v("Ignite有一个存储会话的概念，该概念可能跨越多个缓存存储操作，会话在处理事务时特别有用。")]),t._v(" "),s("p",[t._v("如果是"),s("code",[t._v("ATOMIC")]),t._v("模式缓存，则在每个"),s("code",[t._v("ICacheStore")]),t._v("方法完成后调用"),s("code",[t._v("SessionEnd()")]),t._v("方法。如果使用"),s("code",[t._v("TRANSACTIONAL")]),t._v("模式缓存，则在每个事务结束时调用"),s("code",[t._v("SessionEnd()")]),t._v("，其可以在底层存储上提交或回滚多个操作。")]),t._v(" "),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[t._v("提示")]),t._v(" "),s("p",[s("code",[t._v("CacheStoreAdapater")]),t._v("提供了"),s("code",[t._v("SessionEnd()")]),t._v("方法的默认空实现。")])]),t._v(" "),s("h3",{attrs:{id:"_2-4-cachestoresession"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-4-cachestoresession"}},[t._v("#")]),t._v(" 2.4.CacheStoreSession")]),t._v(" "),s("p",[t._v("缓存存储会话的主要目的是在缓存事务中使用"),s("code",[t._v("ICacheStore")]),t._v("时，保持多个存储调用之间的上下文。例如如果将数据库用作持久化存储，则可以存储该数据库的连接。然后可以在"),s("code",[t._v("ICacheStore.SessionEnd(boolean)")]),t._v("方法中提交此连接。")]),t._v(" "),s("p",[s("code",[t._v("CacheStoreSession")]),t._v("可以通过"),s("code",[t._v("StoreSessionResource")]),t._v("属性注入到缓存存储实现中。")]),t._v(" "),s("h3",{attrs:{id:"_2-5-配置"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-5-配置"}},[t._v("#")]),t._v(" 2.5.配置")]),t._v(" "),s("p",[t._v("以下的参数可用于通过"),s("code",[t._v("IgniteConfiguration.CacheConfiguration")]),t._v("启用和配置后写缓存：")]),t._v(" "),s("table",[s("thead",[s("tr",[s("th",[t._v("属性")]),t._v(" "),s("th",[t._v("描述")]),t._v(" "),s("th",[t._v("默认值")])])]),t._v(" "),s("tbody",[s("tr",[s("td",[s("code",[t._v("WriteBehindEnabled")])]),t._v(" "),s("td",[t._v("设置后写是否启用的标志")]),t._v(" "),s("td",[t._v("false")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("WriteBehindFlushSize")])]),t._v(" "),s("td",[t._v("后写缓存的最大值，如果超过了这个限值，所有的缓存数据都会被刷入CacheStore然后写缓存被清空。如果值为0，刷新操作将会依据刷新频率间隔，注意不能将写缓存大小和刷新频率都设置为0")]),t._v(" "),s("td",[t._v("10240")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("WriteBehindFlushFrequency")])]),t._v(" "),s("td",[t._v("后写缓存的刷新频率，单位为毫秒，该值定义了从对缓存对象进行插入/删除和当相应的操作被施加到CacheStore的时刻之间的最大时间间隔。如果值为0，刷新会依据写缓存大小，注意不能将写缓存大小和刷新频率都设置为0")]),t._v(" "),s("td",[t._v("5000毫秒")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("WriteBehindFlushThreadCount")])]),t._v(" "),s("td",[t._v("执行缓存刷新的线程数")]),t._v(" "),s("td",[t._v("1")])]),t._v(" "),s("tr",[s("td",[s("code",[t._v("WriteBehindBatchSize")])]),t._v(" "),s("td",[t._v("后写缓存存储操作的操作数最大值")]),t._v(" "),s("td",[t._v("512")])])])]),t._v(" "),s("p",[s("code",[t._v("ICacheStore")]),t._v("接口可以在"),s("code",[t._v("CacheConfiguration")]),t._v("中通过"),s("code",[t._v("PlatformDotNetCacheStoreFactory")]),t._v("，以代码或者配置文件的方式进行配置：")]),t._v(" "),s("p",[t._v("C#：")]),t._v(" "),s("div",{staticClass:"language-csharp line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-csharp"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" cfg "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("IgniteConfiguration")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    CacheConfiguration "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("CacheConfiguration")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("CacheStoreFactory "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("MyStoreFactory")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br")])]),s("p",[t._v("app.config：")]),t._v(" "),s("div",{staticClass:"language-xml line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-xml"}},[s("code",[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("igniteConfiguration")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("cacheConfiguration")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("cacheConfiguration")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("cacheStoreFactory")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("type")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("MyNamespace.MyStoreFactory, MyAssembly"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("/>")])]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("cacheConfiguration")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("cacheConfiguration")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("igniteConfiguration")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br")])]),s("p",[t._v("Spring XML：")]),t._v(" "),s("div",{staticClass:"language-xml line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-xml"}},[s("code",[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("bean")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("class")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("org.apache.ignite.configuration.IgniteConfiguration"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n  ...\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("property")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("cacheConfiguration"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("list")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n        "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("bean")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("class")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("org.apache.ignite.configuration.CacheConfiguration"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n          ...\n          "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("property")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("cacheStoreFactory"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("bean")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("class")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("org.apache.ignite.platform.dotnet.PlatformDotNetCacheStoreFactory"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n              "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("property")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("typeName"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),t._v(" "),s("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("value")]),s("span",{pre:!0,attrs:{class:"token attr-value"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("=")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("MyNamespace.MyStoreFactory, MyAssembly"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("/>")])]),t._v("\n            "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("bean")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n\t    \t\t"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("property")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    \t\t\t...\n    \t\t"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("bean")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    \t"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("list")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("property")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n  ...\n"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("bean")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br"),s("span",{staticClass:"line-number"},[t._v("8")]),s("br"),s("span",{staticClass:"line-number"},[t._v("9")]),s("br"),s("span",{staticClass:"line-number"},[t._v("10")]),s("br"),s("span",{staticClass:"line-number"},[t._v("11")]),s("br"),s("span",{staticClass:"line-number"},[t._v("12")]),s("br"),s("span",{staticClass:"line-number"},[t._v("13")]),s("br"),s("span",{staticClass:"line-number"},[t._v("14")]),s("br"),s("span",{staticClass:"line-number"},[t._v("15")]),s("br"),s("span",{staticClass:"line-number"},[t._v("16")]),s("br"),s("span",{staticClass:"line-number"},[t._v("17")]),s("br")])])])}),[],!1,null,null,null);a.default=e.exports}}]);
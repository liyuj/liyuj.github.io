(window.webpackJsonp=window.webpackJsonp||[]).push([[119],{54:function(e,a,s){"use strict";s.r(a);var t=s(0),n=Object(t.a)({},(function(){var e=this,a=e.$createElement,s=e._self._c||a;return s("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[s("h1",{attrs:{id:"控制脚本"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#控制脚本","aria-hidden":"true"}},[e._v("#")]),e._v(" 控制脚本")]),e._v(" "),s("h2",{attrs:{id:"_1-控制脚本"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-控制脚本","aria-hidden":"true"}},[e._v("#")]),e._v(" 1.控制脚本")]),e._v(" "),s("p",[e._v("Ignite提供了一个"),s("code",[e._v("./control.sh")]),e._v("命令行脚本，它可以监控和控制集群的状态，它位于Ignite主目录的"),s("code",[e._v("/bin")]),e._v("文件夹中。")]),e._v(" "),s("h3",{attrs:{id:"_1-1-激活、冻结和拓扑管理"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-1-激活、冻结和拓扑管理","aria-hidden":"true"}},[e._v("#")]),e._v(" 1.1.激活、冻结和拓扑管理")]),e._v(" "),s("p",[e._v("首先，"),s("code",[e._v("./control.sh")]),e._v("用于集群基线拓扑的激活/冻结以及节点的管理，具体可以看相关的章节。")]),e._v(" "),s("h3",{attrs:{id:"_1-2-缓存状态监控"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-2-缓存状态监控","aria-hidden":"true"}},[e._v("#")]),e._v(" 1.2.缓存状态监控")]),e._v(" "),s("p",[s("code",[e._v("./control.sh")]),e._v("提供了若干以"),s("code",[e._v("--cache list")]),e._v("开头的命令用于缓存的监控，这些命令可以看到部署的带有关联参数的缓存的列表，及其在缓存组内的分布，还有一个命令可以看已有的原子化的序列。")]),e._v(" "),s("div",{staticClass:"language-bash line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-bash"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("# Displays list of all caches with affinity parameters.")]),e._v("\n./control.sh --cache list .*\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v('# Displays list of caches with affinity parameters which names start with "account-".')]),e._v("\n./control.sh --cache list account-.*\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("# Displays info about cache groups distribution of all caches.")]),e._v("\n./control.sh --cache list .* "),s("span",{pre:!0,attrs:{class:"token function"}},[e._v("groups")]),e._v("\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v('# Displays info about cache groups distribution of caches which names start with "account-".')]),e._v("\n./control.sh --cache list account-.* "),s("span",{pre:!0,attrs:{class:"token function"}},[e._v("groups")]),e._v("\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("# Displays info about all atomic sequences.")]),e._v("\n./control.sh --cache list .* "),s("span",{pre:!0,attrs:{class:"token function"}},[e._v("seq")]),e._v("\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v('# Displays info about atomic sequnces which names start with "counter-".')]),e._v("\n./control.sh --cache list counter-.*\n")])]),e._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[e._v("1")]),s("br"),s("span",{staticClass:"line-number"},[e._v("2")]),s("br"),s("span",{staticClass:"line-number"},[e._v("3")]),s("br"),s("span",{staticClass:"line-number"},[e._v("4")]),s("br"),s("span",{staticClass:"line-number"},[e._v("5")]),s("br"),s("span",{staticClass:"line-number"},[e._v("6")]),s("br"),s("span",{staticClass:"line-number"},[e._v("7")]),s("br"),s("span",{staticClass:"line-number"},[e._v("8")]),s("br"),s("span",{staticClass:"line-number"},[e._v("9")]),s("br"),s("span",{staticClass:"line-number"},[e._v("10")]),s("br"),s("span",{staticClass:"line-number"},[e._v("11")]),s("br"),s("span",{staticClass:"line-number"},[e._v("12")]),s("br"),s("span",{staticClass:"line-number"},[e._v("13")]),s("br"),s("span",{staticClass:"line-number"},[e._v("14")]),s("br"),s("span",{staticClass:"line-number"},[e._v("15")]),s("br"),s("span",{staticClass:"line-number"},[e._v("16")]),s("br"),s("span",{staticClass:"line-number"},[e._v("17")]),s("br")])]),s("h3",{attrs:{id:"_1-3-事务争用检测"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-3-事务争用检测","aria-hidden":"true"}},[e._v("#")]),e._v(" 1.3.事务争用检测")]),e._v(" "),s("p",[s("code",[e._v("contention")]),e._v("命令可以观测到多个事务对于同一个键的锁竞争状态，如果遇到了长时间运行或者挂起的事务，该命令会很有用，比如：")]),e._v(" "),s("div",{staticClass:"language-bash line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-bash"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("# Reports all keys that are point of contention for at least 5 transactions on all cluster nodes.")]),e._v("\n./control.sh --cache contention "),s("span",{pre:!0,attrs:{class:"token number"}},[e._v("5")]),e._v("\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("# Reports all keys that are point of contention for at least 5 transactions on specific server node.")]),e._v("\n./control.sh --cache contention "),s("span",{pre:!0,attrs:{class:"token number"}},[e._v("5")]),e._v(" f2ea-5f56-11e8-9c2d-fa7a\n")])]),e._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[e._v("1")]),s("br"),s("span",{staticClass:"line-number"},[e._v("2")]),s("br"),s("span",{staticClass:"line-number"},[e._v("3")]),s("br"),s("span",{staticClass:"line-number"},[e._v("4")]),s("br"),s("span",{staticClass:"line-number"},[e._v("5")]),s("br")])]),s("p",[e._v("如果存在高度争用的键，该工具会存储大量的信息，包括键、事务和争用所在的节点，比如：")]),e._v(" "),s("div",{staticClass:"language- line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[e._v("[node=TcpDiscoveryNode [id=d9620450-eefa-4ab6-a821-644098f00001, addrs=[127.0.0.1], sockAddrs=[/127.0.0.1:47501], discPort=47501, order=2, intOrder=2, lastExchangeTime=1527169443913, loc=false, ver=2.5.0#20180518-sha1:02c9b2de, isClient=false]]\n\n// No contention on node d9620450-eefa-4ab6-a821-644098f00001.\n\n[node=TcpDiscoveryNode [id=03379796-df31-4dbd-80e5-09cef5000000, addrs=[127.0.0.1], sockAddrs=[/127.0.0.1:47500], discPort=47500, order=1, intOrder=1, lastExchangeTime=1527169443913, loc=false, ver=2.5.0#20180518-sha1:02c9b2de, isClient=false]]\n    TxEntry [cacheId=1544803905, key=KeyCacheObjectImpl [part=0, val=0, hasValBytes=false], queue=10, op=CREATE, val=UserCacheObjectImpl [val=0, hasValBytes=false], tx=GridNearTxLocal[xid=e9754629361-00000000-0843-9f61-0000-000000000001, xidVersion=GridCacheVersion [topVer=138649441, order=1527169439646, nodeOrder=1], concurrency=PESSIMISTIC, isolation=REPEATABLE_READ, state=ACTIVE, invalidate=false, rollbackOnly=false, nodeId=03379796-df31-4dbd-80e5-09cef5000000, timeout=0, duration=1247], other=[]]\n    TxEntry [cacheId=1544803905, key=KeyCacheObjectImpl [part=0, val=0, hasValBytes=false], queue=10, op=READ, val=null, tx=GridNearTxLocal[xid=8a754629361-00000000-0843-9f61-0000-000000000001, xidVersion=GridCacheVersion [topVer=138649441, order=1527169439656, nodeOrder=1], concurrency=PESSIMISTIC, isolation=REPEATABLE_READ, state=ACTIVE, invalidate=false, rollbackOnly=false, nodeId=03379796-df31-4dbd-80e5-09cef5000000, timeout=0, duration=1175], other=[]]\n    TxEntry [cacheId=1544803905, key=KeyCacheObjectImpl [part=0, val=0, hasValBytes=false], queue=10, op=READ, val=null, tx=GridNearTxLocal[xid=6a754629361-00000000-0843-9f61-0000-000000000001, xidVersion=GridCacheVersion [topVer=138649441, order=1527169439654, nodeOrder=1], concurrency=PESSIMISTIC, isolation=REPEATABLE_READ, state=ACTIVE, invalidate=false, rollbackOnly=false, nodeId=03379796-df31-4dbd-80e5-09cef5000000, timeout=0, duration=1175], other=[]]\n    TxEntry [cacheId=1544803905, key=KeyCacheObjectImpl [part=0, val=0, hasValBytes=false], queue=10, op=READ, val=null, tx=GridNearTxLocal[xid=7a754629361-00000000-0843-9f61-0000-000000000001, xidVersion=GridCacheVersion [topVer=138649441, order=1527169439655, nodeOrder=1], concurrency=PESSIMISTIC, isolation=REPEATABLE_READ, state=ACTIVE, invalidate=false, rollbackOnly=false, nodeId=03379796-df31-4dbd-80e5-09cef5000000, timeout=0, duration=1175], other=[]]\n    TxEntry [cacheId=1544803905, key=KeyCacheObjectImpl [part=0, val=0, hasValBytes=false], queue=10, op=READ, val=null, tx=GridNearTxLocal[xid=4a754629361-00000000-0843-9f61-0000-000000000001, xidVersion=GridCacheVersion [topVer=138649441, order=1527169439652, nodeOrder=1], concurrency=PESSIMISTIC, isolation=REPEATABLE_READ, state=ACTIVE, invalidate=false, rollbackOnly=false, nodeId=03379796-df31-4dbd-80e5-09cef5000000, timeout=0, duration=1175], other=[]]\n\n// Node 03379796-df31-4dbd-80e5-09cef5000000 is place for contention on key KeyCacheObjectImpl [part=0, val=0, hasValBytes=false].\n")])]),e._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[e._v("1")]),s("br"),s("span",{staticClass:"line-number"},[e._v("2")]),s("br"),s("span",{staticClass:"line-number"},[e._v("3")]),s("br"),s("span",{staticClass:"line-number"},[e._v("4")]),s("br"),s("span",{staticClass:"line-number"},[e._v("5")]),s("br"),s("span",{staticClass:"line-number"},[e._v("6")]),s("br"),s("span",{staticClass:"line-number"},[e._v("7")]),s("br"),s("span",{staticClass:"line-number"},[e._v("8")]),s("br"),s("span",{staticClass:"line-number"},[e._v("9")]),s("br"),s("span",{staticClass:"line-number"},[e._v("10")]),s("br"),s("span",{staticClass:"line-number"},[e._v("11")]),s("br"),s("span",{staticClass:"line-number"},[e._v("12")]),s("br")])]),s("h3",{attrs:{id:"_1-4-一致性检查命令"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-4-一致性检查命令","aria-hidden":"true"}},[e._v("#")]),e._v(" 1.4.一致性检查命令")]),e._v(" "),s("p",[e._v("该脚本还提供了一组命令，验证内部数据的一致性。")]),e._v(" "),s("p",[e._v("首先，该命令可用于调试和排错的目的，尤其在活跃的开发节点。")]),e._v(" "),s("p",[e._v("其次，如果怀疑一个查询，比如SQL返回了不完整或者错误的结果集，该命令可以验证是否真的存在数据不一致的情况。")]),e._v(" "),s("p",[e._v("最后，一致性检查命令可以用作集群健康检查工具的一部分。")]),e._v(" "),s("p",[e._v("下面会更详细地描述一些使用场景：")]),e._v(" "),s("p",[s("strong",[e._v("分区校验和验证")])]),e._v(" "),s("p",[e._v("即使主节点和备份节点之间的更新计数器和大小相等，也可能会出现主节点和备份节点因某些严重故障而出现差异的情况。"),s("code",[e._v("./control.sh")]),e._v("工具中的"),s("code",[e._v("idle_verify")]),e._v("命令会计算和比较整个集群的分区哈希值，然后如果有不同会进行报告。它可以指定一个需要验证的缓存列表，比如：")]),e._v(" "),s("div",{staticClass:"language-bash line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-bash"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("# Checks partitions of all caches that their partitions actually contain same data.")]),e._v("\n./control.sh --cache idle_verify\n\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("# Checks partitions of specific caches that their partitions actually contain same data.")]),e._v("\n./control.sh --cache idle_verify cache1,cache2,cache3\n")])]),e._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[e._v("1")]),s("br"),s("span",{staticClass:"line-number"},[e._v("2")]),s("br"),s("span",{staticClass:"line-number"},[e._v("3")]),s("br"),s("span",{staticClass:"line-number"},[e._v("4")]),s("br"),s("span",{staticClass:"line-number"},[e._v("5")]),s("br"),s("span",{staticClass:"line-number"},[e._v("6")]),s("br")])]),s("p",[e._v("如果出现了分区的差异，会输出冲突的分区列表，如下：")]),e._v(" "),s("div",{staticClass:"language- line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[e._v("idle_verify check has finished, found 2 conflict partitions.\n\nConflict partition: PartitionKey [grpId=1544803905, grpName=default, partId=5]\nPartition instances: [PartitionHashRecord [isPrimary=true, partHash=97506054, updateCntr=3, size=3, consistentId=bltTest1], PartitionHashRecord [isPrimary=false, partHash=65957380, updateCntr=3, size=2, consistentId=bltTest0]]\nConflict partition: PartitionKey [grpId=1544803905, grpName=default, partId=6]\nPartition instances: [PartitionHashRecord [isPrimary=true, partHash=97595430, updateCntr=3, size=3, consistentId=bltTest1], PartitionHashRecord [isPrimary=false, partHash=66016964, updateCntr=3, size=2, consistentId=bltTest0]]\n")])]),e._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[e._v("1")]),s("br"),s("span",{staticClass:"line-number"},[e._v("2")]),s("br"),s("span",{staticClass:"line-number"},[e._v("3")]),s("br"),s("span",{staticClass:"line-number"},[e._v("4")]),s("br"),s("span",{staticClass:"line-number"},[e._v("5")]),s("br"),s("span",{staticClass:"line-number"},[e._v("6")]),s("br")])]),s("div",{staticClass:"danger custom-block"},[s("p",{staticClass:"custom-block-title"},[e._v("idle_verify检查期间集群应该为空闲状态")]),e._v(" "),s("p",[e._v("当"),s("code",[e._v("idle_verify")]),e._v("计算哈希值时，所有的更新都要停止，否则可能会出现"),s("strong",[e._v("假阳性")]),e._v("的错误结果。如果正在不断地更新，是无法在分布式系统中比较很大的数据集的。")])]),e._v(" "),s("p",[s("strong",[e._v("SQL索引一致性验证")])]),e._v(" "),s("p",[s("code",[e._v("validate_indexes")]),e._v("命令可以在所有的集群节点本地对给定缓存的索引进行验证。")]),e._v(" "),s("p",[e._v("验证过程会进行如下的检查：")]),e._v(" "),s("ol",[s("li",[e._v("主索引指向的所有键值条目，对于二级SQL索引（如果有）都可以访问；")]),e._v(" "),s("li",[e._v("主索引指向的所有键值条目，都可以访问，主索引中的引用不应该出现在任何地方；")]),e._v(" "),s("li",[e._v("二级SQL索引引用的键值条目，主索引都可以访问。")])]),e._v(" "),s("div",{staticClass:"language-bash line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-bash"}},[s("code",[s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("# Checks indexes of all caches on all cluster nodes.")]),e._v("\n./control.sh --cache validate_indexes\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("# Checks indexes of specific caches on all cluster nodes.")]),e._v("\n./control.sh --cache validate_indexes cache1,cache2\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[e._v("# Checks indexes of specific caches on node with given node ID.")]),e._v("\n./control.sh --cache validate_indexes cache1,cache2 f2ea-5f56-11e8-9c2d-fa7a\n\n")])]),e._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[e._v("1")]),s("br"),s("span",{staticClass:"line-number"},[e._v("2")]),s("br"),s("span",{staticClass:"line-number"},[e._v("3")]),s("br"),s("span",{staticClass:"line-number"},[e._v("4")]),s("br"),s("span",{staticClass:"line-number"},[e._v("5")]),s("br"),s("span",{staticClass:"line-number"},[e._v("6")]),s("br"),s("span",{staticClass:"line-number"},[e._v("7")]),s("br"),s("span",{staticClass:"line-number"},[e._v("8")]),s("br"),s("span",{staticClass:"line-number"},[e._v("9")]),s("br")])]),s("p",[e._v("如果索引指向了不存在的条目（或者条目未被索引），会输出错误信息，如下：")]),e._v(" "),s("div",{staticClass:"language- line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[e._v("PartitionKey [grpId=-528791027, grpName=persons-cache-vi, partId=0] ValidateIndexesPartitionResult [updateCntr=313, size=313, isPrimary=true, consistentId=bltTest0]\nIndexValidationIssue [key=0, cacheName=persons-cache-vi, idxName=_key_PK], class org.apache.ignite.IgniteCheckedException: Key is present in CacheDataTree, but can't be found in SQL index.\nIndexValidationIssue [key=0, cacheName=persons-cache-vi, idxName=PERSON_ORGID_ASC_IDX], class org.apache.ignite.IgniteCheckedException: Key is present in CacheDataTree, but can't be found in SQL index.\nvalidate_indexes has finished with errors (listed above).\n")])]),e._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[e._v("1")]),s("br"),s("span",{staticClass:"line-number"},[e._v("2")]),s("br"),s("span",{staticClass:"line-number"},[e._v("3")]),s("br"),s("span",{staticClass:"line-number"},[e._v("4")]),s("br")])]),s("div",{staticClass:"danger custom-block"},[s("p",{staticClass:"custom-block-title"},[e._v("validate_indexes检查期间集群应该为空闲状态")]),e._v(" "),s("p",[e._v("和"),s("code",[e._v("idle_verify")]),e._v("命令一样，只有所有的更新都停止，索引验证工具才能正常工作，否则，可能会出现检查线程与更新条目/索引的线程之间的竞争，这将导致假阳性错误报告。")])])])}),[],!1,null,null,null);a.default=n.exports}}]);
(window.webpackJsonp=window.webpackJsonp||[]).push([[239],{424:function(t,s,a){"use strict";a.r(s);var n=a(3),e=Object(n.a)({},(function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"ignite消息"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#ignite消息"}},[t._v("#")]),t._v(" Ignite消息")]),t._v(" "),a("h2",{attrs:{id:"_1-概述"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-概述"}},[t._v("#")]),t._v(" 1.概述")]),t._v(" "),a("p",[t._v("Ignite分布式消息可以在集群内的所有节点间进行基于主题的通信，带有特定消息主题的消息可以分布到订阅了该主题的所有节点或者节点的子集。")]),t._v(" "),a("p",[t._v("Ignite消息基于发布-订阅范式，发布者和订阅者通过一个通用的主题连接在一起。当一个节点针对主题T发布了一个消息A，它会被分布到所有订阅了主题T的节点。")]),t._v(" "),a("div",{staticClass:"custom-block tip"},[a("p",{staticClass:"custom-block-title"},[t._v("注意")]),t._v(" "),a("p",[t._v("任意加入集群的新节点会自动地订阅集群内（或者集群组内）其它节点订阅的所有的主题。")])]),t._v(" "),a("h2",{attrs:{id:"_2-ignitemessaging"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_2-ignitemessaging"}},[t._v("#")]),t._v(" 2.IgniteMessaging")]),t._v(" "),a("p",[t._v("Ignite中的分布式消息功能是通过"),a("code",[t._v("IgniteMessaging")]),t._v("接口提供的，可以像下面这样获得一个"),a("code",[t._v("IgniteMessaging")]),t._v("的实例：")]),t._v(" "),a("div",{staticClass:"language-java extra-class"},[a("pre",{pre:!0,attrs:{class:"language-java"}},[a("code",[a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Ignite")]),t._v(" ignite "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Ignition")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("ignite")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// Messaging instance over this cluster.")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("IgniteMessaging")]),t._v(" msg "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" ignite"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("message")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// Messaging instance over given cluster group (in this case, remote nodes).")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("IgniteMessaging")]),t._v(" rmtMsg "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" ignite"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("message")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("ignite"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("cluster")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("forRemotes")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("h2",{attrs:{id:"_3-发布消息"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_3-发布消息"}},[t._v("#")]),t._v(" 3.发布消息")]),t._v(" "),a("p",[t._v("send方法可以将一个带有特定消息主题的消息发送/发布到所有的节点，消息可以以"),a("em",[t._v("有序")]),t._v("也可以以"),a("em",[t._v("无序")]),t._v("的方式发送。")]),t._v(" "),a("p",[a("strong",[t._v("有序消息")])]),t._v(" "),a("p",[t._v("**sendOrdered(...)**可以用于希望按照发送消息的顺序接收消息的场合，可以传递一个timeout参数来指定一个消息可以在队列中保持多长时间来等待发送之前的消息。如果达到了超时时间，那么还没有到达该节点上指定主题的所有消息都会被忽略。")]),t._v(" "),a("p",[a("strong",[t._v("无序消息")])]),t._v(" "),a("p",[a("code",[t._v("send(...)")]),t._v("方法不保证消息的顺序，这意味着，当顺序地发送消息A和消息B，不能保证目标节点先收到A后收到B。")]),t._v(" "),a("h2",{attrs:{id:"_4-订阅消息"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_4-订阅消息"}},[t._v("#")]),t._v(" 4.订阅消息")]),t._v(" "),a("p",[a("code",[t._v("listen")]),t._v("方法可以监听/订阅消息。当这些方法被调用时，带有指定消息主题的监听器就会被注册到所有的（或者集群组）节点来监听新的消息。对于listen方法，可以传入一个返回boolean值的谓词，它会告诉监听器是继续还是停止监听新的消息。")]),t._v(" "),a("p",[a("strong",[t._v("本地监听")])]),t._v(" "),a("p",[a("code",[t._v("localListen(...)")]),t._v("方法只在本地节点注册了一个带有指定主题的消息监听器然后监听来自集群内任意节点的消息。")]),t._v(" "),a("p",[a("strong",[t._v("远程监听")])]),t._v(" "),a("p",[a("code",[t._v("remoteListen(...)")]),t._v("方法在集群内的所有节点上注册了一个带有指定主题的监听器然后监听来自集群内任意节点的消息。")]),t._v(" "),a("h2",{attrs:{id:"_5-示例"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_5-示例"}},[t._v("#")]),t._v(" 5.示例")]),t._v(" "),a("div",{staticClass:"language-java extra-class"},[a("pre",{pre:!0,attrs:{class:"language-java"}},[a("code",[a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Ignite")]),t._v(" ignite "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Ignition")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("ignite")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("IgniteMessaging")]),t._v(" rmtMsg "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" ignite"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("message")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("ignite"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("cluster")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("forRemotes")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// Add listener for ordered messages on all remote nodes.")]),t._v("\nrmtMsg"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("remoteListen")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"MyOrderedTopic"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("nodeId"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" msg"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("->")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("System")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("out"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("println")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"Received ordered message [msg="')]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),t._v(" msg "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('", from="')]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),t._v(" nodeId "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("']'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("true")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// Return true to continue listening.")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// Send ordered messages to remote nodes.")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("for")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),t._v(" i "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" i "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("10")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" i"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("++")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    rmtMsg"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("sendOrdered")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"MyOrderedTopic"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Integer")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("toString")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("i"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),a("RightPane")],1)}),[],!1,null,null,null);s.default=e.exports}}]);
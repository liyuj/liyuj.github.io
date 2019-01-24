(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{82:function(a,t,s){"use strict";s.r(t);var n=s(0),e=Object(n.a)({},function(){this.$createElement;this._self._c;return this._m(0)},[function(){var a=this,t=a.$createElement,s=a._self._c||t;return s("div",{staticClass:"content"},[s("h1",{attrs:{id:"_4-osgi支持"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_4-osgi支持","aria-hidden":"true"}},[a._v("#")]),a._v(" 4.OSGi支持")]),a._v(" "),s("h2",{attrs:{id:"_4-1-在apache-karaf中安装"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_4-1-在apache-karaf中安装","aria-hidden":"true"}},[a._v("#")]),a._v(" 4.1.在Apache Karaf中安装")]),a._v(" "),s("h3",{attrs:{id:"_4-1-1-摘要"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_4-1-1-摘要","aria-hidden":"true"}},[a._v("#")]),a._v(" 4.1.1.摘要")]),a._v(" "),s("p",[s("a",{attrs:{href:"https://karaf.apache.org/",target:"_self",rel:"noopener noreferrer"}},[a._v("Apache Karaf")]),a._v("是一个轻量级、功能强大的企业级OSGi容器，他支持Eclipse Equinox和Apache Felix运行时。")]),a._v(" "),s("blockquote",[s("p",[s("strong",[a._v("支持Apache Karaf4.0.0版本系列")]),a._v("\nIgnite在Karaf4.0.0版本系列上进行了测试，可能也可以工作于更老的版本上，但是未经过明确的测试。")])]),a._v(" "),s("p",[a._v("为了方便不同Ignite模块的部署（包括他们的依赖），Ignite提供了一套打包进特性库的"),s("a",{attrs:{href:"https://karaf.apache.org/manual/latest/users-guide/provisioning.html",target:"_self",rel:"noopener noreferrer"}},[a._v("Karaf特性")]),a._v("，这使得借助于Karaf Shell的一个命令就可以快速地将Ignite部署进OSGi环境。")]),a._v(" "),s("h3",{attrs:{id:"_4-1-2-准备步骤"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_4-1-2-准备步骤","aria-hidden":"true"}},[a._v("#")]),a._v(" 4.1.2.准备步骤")]),a._v(" "),s("p",[a._v("首先，Ignite使用了Oracle/Sun JRE的底层包"),s("code",[a._v("sun.nio.ch")]),a._v("(OpenJDK也有效)。")]),a._v(" "),s("p",[a._v("因为这是一个专有的包（并不是Java标准规范的一部分），Apache Kafka默认并没有从"),s("a",{attrs:{href:"http://wiki.osgi.org/wiki/System_Bundle",target:"_self",rel:"noopener noreferrer"}},[a._v("System Bundle")]),a._v("（bundle 0）中导出它，因此必须通过"),s("a",{attrs:{href:"https://karaf.apache.org/manual/latest-2.2.x/users-guide/jre-tuning.html",target:"_self",rel:"noopener noreferrer"}},[a._v("修改${KARAF_BASE}/etc/jre.properties文件")]),a._v("通知Kafka导出它。")]),a._v(" "),s("p",[a._v("定位到使用的JRE版本的"),s("code",[a._v("jre-1.x")]),a._v("属性，然后在最后追加包名，比如：")]),a._v(" "),s("div",{staticClass:"language- line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[a._v('jre-1.8= \\\n javax.accessibility, \\\n javax.activation;version="1.1", \\\n ...\n org.xml.sax.helpers, \\\n sun.nio.ch\n')])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br"),s("span",{staticClass:"line-number"},[a._v("2")]),s("br"),s("span",{staticClass:"line-number"},[a._v("3")]),s("br"),s("span",{staticClass:"line-number"},[a._v("4")]),s("br"),s("span",{staticClass:"line-number"},[a._v("5")]),s("br"),s("span",{staticClass:"line-number"},[a._v("6")]),s("br")])]),s("h3",{attrs:{id:"_4-1-3-安装ignite特性库"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_4-1-3-安装ignite特性库","aria-hidden":"true"}},[a._v("#")]),a._v(" 4.1.3.安装Ignite特性库")]),a._v(" "),s("p",[a._v("使用Apache Karaf Shell中的如下命令来安装Ignite特性库，确保容器可以连接到互联网或者一个包含Ignite组件的备用Maven仓库。")]),a._v(" "),s("p",[a._v("将Ignite特性库加入Karaf：")]),a._v(" "),s("div",{staticClass:"language-bash line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-bash"}},[s("code",[a._v("karaf@root"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v(">")]),a._v(" feature:repo-add mvn:org.apache.ignite/ignite-osgi-karaf/"),s("span",{pre:!0,attrs:{class:"token variable"}},[a._v("${ignite.version}")]),a._v("/xml/features\nAdding feature url mvn:org.apache.ignite/ignite-osgi-karaf/"),s("span",{pre:!0,attrs:{class:"token variable"}},[a._v("${ignite.version}")]),a._v("/xml/features\nkaraf@root"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v(">")]),a._v("\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br"),s("span",{staticClass:"line-number"},[a._v("2")]),s("br"),s("span",{staticClass:"line-number"},[a._v("3")]),s("br")])]),s("p",[a._v("将"),s("code",[a._v("${ignite.version}")]),a._v("替换为实际使用的版本号。")]),a._v(" "),s("p",[a._v("这时可以列出Ignite支持的所有特性：")]),a._v(" "),s("div",{staticClass:"language- line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[a._v("karaf@root()> feature:list | grep ignite\nignite-all                    | 1.5.0.SNAPSHOT   |          | Uninstalled | ignite                   | Apache Ignite :: All\nignite-core                   | 1.5.0.SNAPSHOT   |          | Uninstalled | ignite                   | Apache Ignite :: Core\nignite-aop                    | 1.5.0.SNAPSHOT   |          | Uninstalled | ignite                   | Apache Ignite :: AOP\nignite-aws                    | 1.5.0.SNAPSHOT   |          | Uninstalled | ignite                   | Apache Ignite :: AWS\nignite-indexing               | 1.5.0.SNAPSHOT   |          | Uninstalled | ignite                   | Apache Ignite :: Indexing\nignite-hibernate              | 1.5.0.SNAPSHOT   |          | Uninstalled | ignite                   | Apache Ignite :: Hibernate\nignite-jcl                    | 1.5.0.SNAPSHOT   |          | Uninstalled | ignite                   | Apache Ignite :: JCL\nignite-jms11                  | 1.5.0.SNAPSHOT   |          | Uninstalled | ignite                   | Apache Ignite :: JMS 1.1\nignite-jta                    | 1.5.0.SNAPSHOT   |          | Uninstalled | ignite                   | Apache Ignite :: JTA\nignite-kafka                  | 1.5.0.SNAPSHOT   |          | Uninstalled | ignite                   | Apache Ignite :: Kafka\n[...]\nkaraf@root()>\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br"),s("span",{staticClass:"line-number"},[a._v("2")]),s("br"),s("span",{staticClass:"line-number"},[a._v("3")]),s("br"),s("span",{staticClass:"line-number"},[a._v("4")]),s("br"),s("span",{staticClass:"line-number"},[a._v("5")]),s("br"),s("span",{staticClass:"line-number"},[a._v("6")]),s("br"),s("span",{staticClass:"line-number"},[a._v("7")]),s("br"),s("span",{staticClass:"line-number"},[a._v("8")]),s("br"),s("span",{staticClass:"line-number"},[a._v("9")]),s("br"),s("span",{staticClass:"line-number"},[a._v("10")]),s("br"),s("span",{staticClass:"line-number"},[a._v("11")]),s("br"),s("span",{staticClass:"line-number"},[a._v("12")]),s("br"),s("span",{staticClass:"line-number"},[a._v("13")]),s("br")])]),s("h3",{attrs:{id:"_4-1-4-安装合适的ignite特性"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_4-1-4-安装合适的ignite特性","aria-hidden":"true"}},[a._v("#")]),a._v(" 4.1.4.安装合适的Ignite特性")]),a._v(" "),s("p",[a._v("下面的特性是有点特别的：")]),a._v(" "),s("ul",[s("li",[s("code",[a._v("ignite-core")]),a._v("：ignite-core模块，他是所有其他特性依赖的，因此不要忘了安装；")]),a._v(" "),s("li",[s("code",[a._v("ignite-all")]),a._v("：安装其他所有特性的一个汇总；")])]),a._v(" "),s("p",[a._v("所有其他的特性包括对应的Ignite模块+依赖，可以通过如下方式安装他们：")]),a._v(" "),s("div",{staticClass:"language- line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[a._v("karaf@root()> feature:install ignite-core\nkaraf@root()> feature:install ignite-kafka\nkaraf@root()> feature:install ignite-aop ignite-urideploy\nkaraf@root()>\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br"),s("span",{staticClass:"line-number"},[a._v("2")]),s("br"),s("span",{staticClass:"line-number"},[a._v("3")]),s("br"),s("span",{staticClass:"line-number"},[a._v("4")]),s("br")])]),s("p",[a._v("一些模块是OSGi片段而不是组件，当安装他们时，可能会注意到，Karaf Shell以及/或者"),s("code",[a._v("ignite-core")]),a._v("，其中一个或者两者，重新启动。")]),a._v(" "),s("h3",{attrs:{id:"_4-1-5-ignite-log4j和pax-logging"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_4-1-5-ignite-log4j和pax-logging","aria-hidden":"true"}},[a._v("#")]),a._v(" 4.1.5.ignite-log4j和Pax Logging")]),a._v(" "),s("blockquote",[s("p",[s("strong",[a._v("当Karaf版本<=4.0.3时如果使用Pax Logging请仔细阅读这个注释")]),a._v("\n安装"),s("code",[a._v("ignite-log4j")]),a._v("这个特性时，Karaf Shell可能显示下面的消息：\nError executing command: Resource has no uri\n这不是一个严重的错误，已经汇报给Karaf社区，问题号是"),s("a",{attrs:{href:"https://issues.apache.org/jira/browse/KARAF-4129",target:"_self",rel:"noopener noreferrer"}},[a._v("KARAF-4129")]),a._v("。\n按照如下的说明可以忽略这个错误。")])]),a._v(" "),s("p",[a._v("Apache Karaf捆绑了"),s("a",{attrs:{href:"https://ops4j1.jira.com/wiki/display/paxlogging/Pax+Logging",target:"_self",rel:"noopener noreferrer"}},[a._v("Pax Logging")]),a._v(",他是一个从其他组件收集和汇总日志输出（通过不同的框架输出，比如slf4j，log4j，JULI，commons-logging等）然后用一个典型的log4j配置处理的框架。")]),a._v(" "),s("p",[s("code",[a._v("ignite-log4j")]),a._v("模块依赖于log4j，Pax Logging默认不输出它，因此我们开发了一个OSGi片段，SymbolicName为"),s("code",[a._v("ignite-osgi-paxlogging")]),a._v("，他加入了"),s("code",[a._v("ignite-core")]),a._v("然后输出了缺失的包。")]),a._v(" "),s("p",[s("code",[a._v("ignite-log4j")]),a._v("特性也安装了这个片段，但是需要用"),s("code",[a._v("org.ops4j.pax.logging.pax-logging-api")]),a._v("这个名字强制刷新：")]),a._v(" "),s("div",{staticClass:"language-bash line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-bash"}},[s("code",[a._v("karaf@root"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v(">")]),a._v(" feature:install ignite-log4j\nkaraf@root"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v(">")]),a._v(" refresh org.ops4j.pax.logging.pax-logging-api\nkaraf@root"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v(">")]),a._v("\n        __ __                  ____\n       / //_/____ __________ _/ __/\n      / ,"),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v("<")]),a._v("  / __ "),s("span",{pre:!0,attrs:{class:"token variable"}},[s("span",{pre:!0,attrs:{class:"token variable"}},[a._v("`")]),a._v("/ ___/ __ "),s("span",{pre:!0,attrs:{class:"token variable"}},[a._v("`")])]),a._v("/ /_\n     / /"),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v("|")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v("|")]),a._v("/ /_/ / /  / /_/ / __/\n    /_/ "),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v("|")]),a._v("_"),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v("|")]),a._v("\\__,_/_/   \\__,_/_/\n\n  Apache Karaf "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),a._v("4.0.2"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),a._v("\n\nHit "),s("span",{pre:!0,attrs:{class:"token string"}},[a._v("'<tab>'")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("for")]),a._v(" a list of available commands\nand "),s("span",{pre:!0,attrs:{class:"token string"}},[a._v("'[cmd] --help'")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("for")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[a._v("help")]),a._v(" on a specific command.\nHit "),s("span",{pre:!0,attrs:{class:"token string"}},[a._v("'<ctrl-d>'")]),a._v(" or "),s("span",{pre:!0,attrs:{class:"token function"}},[a._v("type")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[a._v("'system:shutdown'")]),a._v(" or "),s("span",{pre:!0,attrs:{class:"token string"}},[a._v("'logout'")]),a._v(" to "),s("span",{pre:!0,attrs:{class:"token function"}},[a._v("shutdown")]),a._v(" Karaf.\n\nkaraf@root"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v(">")]),a._v(" la "),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v("|")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[a._v("grep")]),a._v(" ignite-osgi-paxlogging\n75 "),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v("|")]),a._v(" Resolved  "),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v("|")]),a._v("   8 "),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v("|")]),a._v(" 1.5.0.SNAPSHOT                            "),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v("|")]),a._v(" ignite-osgi-paxlogging, Hosts: 1\nkaraf@root"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v(">")]),a._v(" \n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br"),s("span",{staticClass:"line-number"},[a._v("2")]),s("br"),s("span",{staticClass:"line-number"},[a._v("3")]),s("br"),s("span",{staticClass:"line-number"},[a._v("4")]),s("br"),s("span",{staticClass:"line-number"},[a._v("5")]),s("br"),s("span",{staticClass:"line-number"},[a._v("6")]),s("br"),s("span",{staticClass:"line-number"},[a._v("7")]),s("br"),s("span",{staticClass:"line-number"},[a._v("8")]),s("br"),s("span",{staticClass:"line-number"},[a._v("9")]),s("br"),s("span",{staticClass:"line-number"},[a._v("10")]),s("br"),s("span",{staticClass:"line-number"},[a._v("11")]),s("br"),s("span",{staticClass:"line-number"},[a._v("12")]),s("br"),s("span",{staticClass:"line-number"},[a._v("13")]),s("br"),s("span",{staticClass:"line-number"},[a._v("14")]),s("br"),s("span",{staticClass:"line-number"},[a._v("15")]),s("br"),s("span",{staticClass:"line-number"},[a._v("16")]),s("br"),s("span",{staticClass:"line-number"},[a._v("17")]),s("br"),s("span",{staticClass:"line-number"},[a._v("18")]),s("br")])]),s("h2",{attrs:{id:"_4-2-支持的模块"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_4-2-支持的模块","aria-hidden":"true"}},[a._v("#")]),a._v(" 4.2.支持的模块")]),a._v(" "),s("p",[a._v("以下的模块已OSGi化：")]),a._v(" "),s("ul",[s("li",[a._v("ignite-core")]),a._v(" "),s("li",[a._v("ignite-aop")]),a._v(" "),s("li",[a._v("ignite-aws")]),a._v(" "),s("li",[a._v("ignite-camel")]),a._v(" "),s("li",[a._v("ignite-flume")]),a._v(" "),s("li",[a._v("ignite-indexing")]),a._v(" "),s("li",[a._v("ignite-hibernate")]),a._v(" "),s("li",[a._v("ignite-jcl")]),a._v(" "),s("li",[a._v("ignite-jms11")]),a._v(" "),s("li",[a._v("ignite-jta")]),a._v(" "),s("li",[a._v("ignite-kafka")]),a._v(" "),s("li",[a._v("ignite-mqtt")]),a._v(" "),s("li",[a._v("ignite-log4j")]),a._v(" "),s("li",[a._v("ignite-rest-http")]),a._v(" "),s("li",[a._v("ignite-scalar-2.11")]),a._v(" "),s("li",[a._v("ignite-scalar-2.10")]),a._v(" "),s("li",[a._v("ignite-schedule")]),a._v(" "),s("li",[a._v("ignite-slf4j")]),a._v(" "),s("li",[a._v("ignite-spring")]),a._v(" "),s("li",[a._v("ignite-ssh")]),a._v(" "),s("li",[a._v("ignite-twitter")]),a._v(" "),s("li",[a._v("ignite-urideploy")]),a._v(" "),s("li",[a._v("ignite-web")]),a._v(" "),s("li",[a._v("ignite-zookeeper")])]),a._v(" "),s("p",[a._v("下面的模块由于各种各样的原因目前还不支持OSGi：")]),a._v(" "),s("ul",[s("li",[a._v("ignite-cloud")]),a._v(" "),s("li",[a._v("ignite-hadoop")]),a._v(" "),s("li",[a._v("ignite-gce")]),a._v(" "),s("li",[a._v("ignite-log4j2")]),a._v(" "),s("li",[a._v("ignite-mesos")]),a._v(" "),s("li",[a._v("ignite-visor-console[-2.10]")]),a._v(" "),s("li",[a._v("ignite-yarn")])]),a._v(" "),s("h2",{attrs:{id:"_4-3-在osgi容器中启动"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_4-3-在osgi容器中启动","aria-hidden":"true"}},[a._v("#")]),a._v(" 4.3.在OSGi容器中启动")]),a._v(" "),s("h3",{attrs:{id:"_4-3-1-容器的配置"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_4-3-1-容器的配置","aria-hidden":"true"}},[a._v("#")]),a._v(" 4.3.1.容器的配置")]),a._v(" "),s("p",[a._v("要在一个OSGi容器中启动Ignite，至少要安装如下的组件：")]),a._v(" "),s("ul",[s("li",[a._v("ignite-core")]),a._v(" "),s("li",[a._v("ignite-osgi")]),a._v(" "),s("li",[a._v("javax cache API")])]),a._v(" "),s("p",[a._v("当在Karaf中部署时，可以通过使用Ignite特性库来快速地安装"),s("code",[a._v("ignite-core")]),a._v("特性，可以参照"),s("code",[a._v("17.1.在Apache Karaf中安装")]),a._v("章节来了解更多的信息。")]),a._v(" "),s("p",[a._v("可以随意地安装额外的Ignite模块来扩展平台的功能，就像在一个标准环境中将模块加入类路径一样。")]),a._v(" "),s("h3",{attrs:{id:"_4-3-2-实现ignite组件activator"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_4-3-2-实现ignite组件activator","aria-hidden":"true"}},[a._v("#")]),a._v(" 4.3.2.实现Ignite组件Activator")]),a._v(" "),s("p",[a._v("要启动Ignite，通过继承抽象类"),s("code",[a._v("org.apache.ignite.osgi.IgniteAbstractOsgiContextActivator")]),a._v("来实现一个OSGi组件Activator：")]),a._v(" "),s("div",{staticClass:"language-java line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-java"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("package")]),a._v(" org"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("apache"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("ignite"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("osgi"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("examples"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("import")]),a._v(" org"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("apache"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("ignite"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("configuration"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("IgniteConfiguration"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("import")]),a._v(" org"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("apache"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("ignite"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("osgi"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("IgniteAbstractOsgiContextActivator"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("import")]),a._v(" org"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("apache"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("ignite"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("osgi"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("classloaders"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("OsgiClassLoadingStrategyType"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("public")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("class")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[a._v("MyActivator")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("extends")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[a._v("IgniteAbstractOsgiContextActivator")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("{")]),a._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[a._v("/**\n     * Configure your Ignite instance as you would normally do, \n     * and return it.\n     */")]),a._v("\n    "),s("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[a._v("@Override")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("public")]),a._v(" IgniteConfiguration "),s("span",{pre:!0,attrs:{class:"token function"}},[a._v("igniteConfiguration")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("{")]),a._v("\n        IgniteConfiguration config "),s("span",{pre:!0,attrs:{class:"token operator"}},[a._v("=")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("new")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[a._v("IgniteConfiguration")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n        config"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[a._v("setGridName")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[a._v('"testGrid"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n      \n        "),s("span",{pre:!0,attrs:{class:"token comment"}},[a._v("// ...")]),a._v("\n\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("return")]),a._v(" config"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("}")]),a._v("\n\n    "),s("span",{pre:!0,attrs:{class:"token comment"}},[a._v("/**\n     * Choose the classloading strategy for Ignite to use.\n     */")]),a._v("\n    "),s("span",{pre:!0,attrs:{class:"token annotation punctuation"}},[a._v("@Override")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("public")]),a._v(" OsgiClassLoadingStrategyType "),s("span",{pre:!0,attrs:{class:"token function"}},[a._v("classLoadingStrategy")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),a._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("{")]),a._v("\n        "),s("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("return")]),a._v(" OsgiClassLoadingStrategyType"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(".")]),a._v("BUNDLE_DELEGATING"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("}")]),a._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("}")]),a._v("\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br"),s("span",{staticClass:"line-number"},[a._v("2")]),s("br"),s("span",{staticClass:"line-number"},[a._v("3")]),s("br"),s("span",{staticClass:"line-number"},[a._v("4")]),s("br"),s("span",{staticClass:"line-number"},[a._v("5")]),s("br"),s("span",{staticClass:"line-number"},[a._v("6")]),s("br"),s("span",{staticClass:"line-number"},[a._v("7")]),s("br"),s("span",{staticClass:"line-number"},[a._v("8")]),s("br"),s("span",{staticClass:"line-number"},[a._v("9")]),s("br"),s("span",{staticClass:"line-number"},[a._v("10")]),s("br"),s("span",{staticClass:"line-number"},[a._v("11")]),s("br"),s("span",{staticClass:"line-number"},[a._v("12")]),s("br"),s("span",{staticClass:"line-number"},[a._v("13")]),s("br"),s("span",{staticClass:"line-number"},[a._v("14")]),s("br"),s("span",{staticClass:"line-number"},[a._v("15")]),s("br"),s("span",{staticClass:"line-number"},[a._v("16")]),s("br"),s("span",{staticClass:"line-number"},[a._v("17")]),s("br"),s("span",{staticClass:"line-number"},[a._v("18")]),s("br"),s("span",{staticClass:"line-number"},[a._v("19")]),s("br"),s("span",{staticClass:"line-number"},[a._v("20")]),s("br"),s("span",{staticClass:"line-number"},[a._v("21")]),s("br"),s("span",{staticClass:"line-number"},[a._v("22")]),s("br"),s("span",{staticClass:"line-number"},[a._v("23")]),s("br"),s("span",{staticClass:"line-number"},[a._v("24")]),s("br"),s("span",{staticClass:"line-number"},[a._v("25")]),s("br"),s("span",{staticClass:"line-number"},[a._v("26")]),s("br"),s("span",{staticClass:"line-number"},[a._v("27")]),s("br"),s("span",{staticClass:"line-number"},[a._v("28")]),s("br")])]),s("p",[a._v("在OSGi中支持两个不同的类加载策略：")]),a._v(" "),s("ul",[s("li",[s("code",[a._v("BUNDLE_DELEGATING")]),a._v("：优先使用包含Activator的组件的类加载器，"),s("code",[a._v("ignite-core")]),a._v("的类加载器作为备选；")]),a._v(" "),s("li",[s("code",[a._v("CONTAINER_SWEEP")]),a._v("：与"),s("code",[a._v("BUNDLE_DELEGATING")]),a._v("一样，但是在类仍然找不到时最终会搜索所有的组件。")])]),a._v(" "),s("blockquote",[s("p",[s("strong",[a._v("未来的OSGi类加载策略")]),a._v("\n我们可能会考虑在以后的版本中增加其他的类加载策略，比如使用Service Locator机制来定位通过一个文件自发地希望向Ignite的编组器暴露包的组件，类似于JAXB规范中的jaxb.index。")])]),a._v(" "),s("p",[a._v("确保将"),s("code",[a._v("Bundle-Activator")]),a._v("OSGi清单头加入组件，这样才能使OSGi容器在组件启动时调用Activator。")]),a._v(" "),s("p",[a._v("包括Bundle-Activator的OSGi头")]),a._v(" "),s("div",{staticClass:"language- line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[a._v("Bundle-SymbolicName: test-bundle\nBundle-Activator: org.apache.ignite.osgi.examples.MyActivator\nImport-Package: ...\n[...]\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br"),s("span",{staticClass:"line-number"},[a._v("2")]),s("br"),s("span",{staticClass:"line-number"},[a._v("3")]),s("br"),s("span",{staticClass:"line-number"},[a._v("4")]),s("br")])]),s("p",[a._v("要生成这个组件，需要包含"),s("code",[a._v("Bundle-Activator")]),a._v("OSGi头，建议在Maven构建中增加"),s("code",[a._v("maven-bundle-plugin")]),a._v("插件，下面是对应的配置：")]),a._v(" "),s("div",{staticClass:"language-xml line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-xml"}},[s("code",[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("<")]),a._v("plugin")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(">")])]),a._v("\n  "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("<")]),a._v("groupId")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(">")])]),a._v("org.apache.felix"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("</")]),a._v("groupId")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(">")])]),a._v("\n  "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("<")]),a._v("artifactId")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(">")])]),a._v("maven-bundle-plugin"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("</")]),a._v("artifactId")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(">")])]),a._v("\n  "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("<")]),a._v("version")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(">")])]),a._v("${maven.bundle.plugin.version}"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("</")]),a._v("version")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(">")])]),a._v("\n  "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("<")]),a._v("configuration")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(">")])]),a._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("<")]),a._v("Bundle-SymbolicName")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(">")])]),a._v("..."),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("</")]),a._v("Bundle-SymbolicName")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(">")])]),a._v("\n    "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("<")]),a._v("Bundle-Activator")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(">")])]),a._v("org.apache.ignite.osgi.examples.MyActivator"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("</")]),a._v("Bundle-Activator")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(">")])]),a._v("\n    [...]\n  "),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("</")]),a._v("configuration")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(">")])]),a._v("\n"),s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token tag"}},[s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("</")]),a._v("plugin")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(">")])]),a._v("\n")])]),a._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[a._v("1")]),s("br"),s("span",{staticClass:"line-number"},[a._v("2")]),s("br"),s("span",{staticClass:"line-number"},[a._v("3")]),s("br"),s("span",{staticClass:"line-number"},[a._v("4")]),s("br"),s("span",{staticClass:"line-number"},[a._v("5")]),s("br"),s("span",{staticClass:"line-number"},[a._v("6")]),s("br"),s("span",{staticClass:"line-number"},[a._v("7")]),s("br"),s("span",{staticClass:"line-number"},[a._v("8")]),s("br"),s("span",{staticClass:"line-number"},[a._v("9")]),s("br"),s("span",{staticClass:"line-number"},[a._v("10")]),s("br")])])])}],!1,null,null,null);e.options.__file="OSGiSupport.md";t.default=e.exports}}]);
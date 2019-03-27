(window.webpackJsonp=window.webpackJsonp||[]).push([[112],{73:function(s,t,n){"use strict";n.r(t);var a=n(0),e=Object(a.a)({},function(){var s=this,t=s.$createElement,n=s._self._c||t;return n("div",{staticClass:"content"},[s._m(0),s._v(" "),s._m(1),s._v(" "),s._m(2),s._v(" "),n("p",[s._v("Informatica是一个云数据管理和集成工具，可以通过ODBC连接将Informatica接入Ignite。")]),s._v(" "),s._m(3),s._v(" "),n("p",[s._v("在PowerCenter Designer中，必须安装32位的Ignite ODBC驱动才能接入Ignite，可以按照下面链接的内容安装ODBC驱动并且创建DSN：")]),s._v(" "),n("ul",[n("li",[n("router-link",{attrs:{to:"/doc/sql/ODBC.html#_5-1-6-1-在Windows上安装"}},[s._v("在Windows上安装")])],1),s._v(" "),n("li",[n("router-link",{attrs:{to:"/doc/sql/ODBC.html#_5-2-4-配置DSN"}},[s._v("配置DSN")])],1)]),s._v(" "),n("p",[s._v("然后：")]),s._v(" "),s._m(4),s._v(" "),s._m(5),s._v(" "),s._m(6),s._v(" "),n("p",[s._v("在"),n("router-link",{attrs:{to:"/doc/sql/ODBC.html#_5-1-5-2-在Linux上构建"}},[s._v("在Linux上构建")]),s._v("和"),n("router-link",{attrs:{to:"/doc/sql/ODBC.html#_5-1-6-2-在Linux上安装"}},[s._v("在Linux上安装")]),s._v("文档中，描述了如何在Ignite服务端节点上安装Ignite ODBC。")],1),s._v(" "),s._m(7),s._v(" "),n("p",[s._v("配置Ignite ODBC驱动和创建新的DSN，如下所示：")]),s._v(" "),s._m(8),s._v(" "),s._m(9),s._m(10),s._v(" "),s._m(11),s._m(12),s._v(" "),s._m(13),s._m(14),s._v(" "),s._m(15),s._m(16),s._v(" "),s._m(17),s._v(" "),s._m(18),s._v(" "),s._m(19),s._v(" "),n("p",[s._v("下面是在Suse 11.4环境中构建Ignite和Ignite ODBC驱动的步骤。")]),s._v(" "),s._m(20),s._v(" "),s._m(21),s._v(" "),s._m(22),s._m(23),s._v(" "),s._m(24),s._m(25),s._v(" "),s._m(26),s._m(27),s._v(" "),s._m(28),s._m(29),s._v(" "),s._m(30),s._m(31),s._v(" "),s._m(32),s._m(33),s._v(" "),s._m(34),s._v(" "),s._m(35),s._m(36),s._v(" "),s._m(37),s._v(" "),s._m(38),n("p",[s._v("成功之后，重启系统。")]),s._v(" "),s._m(39),s._v(" "),s._m(40)])},[function(){var s=this.$createElement,t=this._self._c||s;return t("h1",{attrs:{id:"_5-informatica"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_5-informatica","aria-hidden":"true"}},[this._v("#")]),this._v(" 5.Informatica")])},function(){var s=this.$createElement,t=this._self._c||s;return t("h2",{attrs:{id:"_5-1-informatica"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_5-1-informatica","aria-hidden":"true"}},[this._v("#")]),this._v(" 5.1.Informatica")])},function(){var s=this.$createElement,t=this._self._c||s;return t("h3",{attrs:{id:"_5-1-1-摘要"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_5-1-1-摘要","aria-hidden":"true"}},[this._v("#")]),this._v(" 5.1.1.摘要")])},function(){var s=this.$createElement,t=this._self._c||s;return t("h3",{attrs:{id:"_5-1-2-从informatica-powercenter-designer接入"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_5-1-2-从informatica-powercenter-designer接入","aria-hidden":"true"}},[this._v("#")]),this._v(" 5.1.2.从Informatica PowerCenter Designer接入")])},function(){var s=this,t=s.$createElement,n=s._self._c||t;return n("ol",[n("li",[s._v("如果要从Ignite中导入表，在"),n("code",[s._v("Sources")]),s._v("或者"),n("code",[s._v("Targets")]),s._v("菜单中选择"),n("code",[s._v("Import from Database...")]),s._v("；")]),s._v(" "),n("li",[s._v("通过选择"),n("code",[s._v("Apache Ignite DSN")]),s._v("作为ODBC数据源接入集群。")])])},function(){var s=this.$createElement,t=this._self._c||s;return t("p",[t("img",{attrs:{src:"https://files.readme.io/decd6fe-ImportTables.png",alt:""}})])},function(){var s=this.$createElement,t=this._self._c||s;return t("h3",{attrs:{id:"_5-1-3-在informatica服务节点上安装ignite-odbc"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_5-1-3-在informatica服务节点上安装ignite-odbc","aria-hidden":"true"}},[this._v("#")]),this._v(" 5.1.3.在Informatica服务节点上安装Ignite ODBC")])},function(){var s=this.$createElement,t=this._self._c||s;return t("p",[this._v("Informatica会使用"),t("code",[this._v("$ODBCINI")]),this._v("和"),t("code",[this._v("$ODBCISTINI")]),this._v("环境变量指定的配置文件（"),t("a",{attrs:{href:"https://kb.informatica.com/howto/6/Pages/19/499306.aspx",target:"_self",rel:"noopener noreferrer"}},[this._v("为ODBC配置UNIX环境变量")]),this._v("）。")])},function(){var s=this.$createElement,t=this._self._c||s;return t("p",[t("strong",[this._v("odbc.ini：")])])},function(){var s=this,t=s.$createElement,n=s._self._c||t;return n("div",{staticClass:"language-ini line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-ini"}},[n("code",[n("span",{pre:!0,attrs:{class:"token selector"}},[s._v("[ApacheIgnite]")]),s._v("\n"),n("span",{pre:!0,attrs:{class:"token constant"}},[s._v("Driver")]),s._v("      "),n("span",{pre:!0,attrs:{class:"token attr-value"}},[n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("=")]),s._v(" /usr/local/lib/libignite-odbc.so")]),s._v("\n"),n("span",{pre:!0,attrs:{class:"token constant"}},[s._v("Description")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token attr-value"}},[n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("=")]),s._v(" Apache Ignite ODBC")]),s._v("\n"),n("span",{pre:!0,attrs:{class:"token constant"}},[s._v("Address")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token attr-value"}},[n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("=")]),s._v(" 192.168.0.105")]),s._v("\n"),n("span",{pre:!0,attrs:{class:"token constant"}},[s._v("User")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token attr-value"}},[n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("=")]),s._v(" ignite")]),s._v("\n"),n("span",{pre:!0,attrs:{class:"token constant"}},[s._v("Password")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token attr-value"}},[n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("=")]),s._v(" ignite")]),s._v("\n"),n("span",{pre:!0,attrs:{class:"token constant"}},[s._v("Schema")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token attr-value"}},[n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("=")]),s._v(" PUBLIC")]),s._v("\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br"),n("span",{staticClass:"line-number"},[s._v("5")]),n("br"),n("span",{staticClass:"line-number"},[s._v("6")]),n("br"),n("span",{staticClass:"line-number"},[s._v("7")]),n("br")])])},function(){var s=this.$createElement,t=this._self._c||s;return t("p",[t("strong",[this._v("odbcinst.ini")])])},function(){var s=this,t=s.$createElement,n=s._self._c||t;return n("div",{staticClass:"language-ini line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-ini"}},[n("code",[n("span",{pre:!0,attrs:{class:"token selector"}},[s._v("[ApacheIgnite]")]),s._v("\n"),n("span",{pre:!0,attrs:{class:"token constant"}},[s._v("Driver")]),s._v("  "),n("span",{pre:!0,attrs:{class:"token attr-value"}},[n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("=")]),s._v(" /usr/local/lib/libignite-odbc.so")]),s._v("\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br")])])},function(){var s=this.$createElement,t=this._self._c||s;return t("p",[this._v("要验证ODBC连接，可以使用Informatica的"),t("code",[this._v("ssgodbc.linux64")]),this._v("工具，如下所示：")])},function(){var s=this.$createElement,t=this._self._c||s;return t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token operator"}},[this._v("<")]),this._v("INFORMATICA_HOME"),t("span",{pre:!0,attrs:{class:"token operator"}},[this._v(">")]),this._v("/tools/debugtools/ssgodbc/linux64/ssgodbc.linux64 -d ApacheIgnite -u ignite -p ignite -v\n")])]),this._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[this._v("1")]),t("br")])])},function(){var s=this.$createElement,t=this._self._c||s;return t("p",[this._v("如果"),t("code",[this._v("unixODBC")]),this._v("或者Ignite的ODBC库没有安装在默认的目录中-"),t("code",[this._v("/usr/local/lib")]),this._v("，则需要将其加入"),t("code",[this._v("LD_LIBRARY_PATH")]),this._v("然后再次测试，如下：")])},function(){var s=this,t=s.$createElement,n=s._self._c||t;return n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[s._v("UNIXODBC_LIB"),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("/opt/unixodbc/lib/\nIGNITE_ODBC_LIB"),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("/opt/igniteodbc/lib\nLD_LIBRARY_PATH"),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("UNIXODBC_LIB"),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(":"),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("IGNITE_ODBC_LIB"),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("\n \n"),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("INFORMATICA_HOME"),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("/tools/debugtools/ssgodbc/linux64/ssgodbc.linux64 -d ApacheIgnite -u ignite -p ignite -v\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br"),n("span",{staticClass:"line-number"},[s._v("5")]),n("br")])])},function(){var s=this.$createElement,t=this._self._c||s;return t("h3",{attrs:{id:"_5-1-4-配置相关的连接"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_5-1-4-配置相关的连接","aria-hidden":"true"}},[this._v("#")]),this._v(" 5.1.4.配置相关的连接")])},function(){var s=this.$createElement,t=this._self._c||s;return t("p",[this._v("选择"),t("code",[this._v("Connections")]),this._v(">"),t("code",[this._v("Relational...")]),this._v("可以显示"),t("code",[this._v("Relational Connection Browser")]),this._v("。")])},function(){var s=this.$createElement,t=this._self._c||s;return t("p",[this._v("选中ODBC类型然后创建一个新的连接。\n"),t("img",{attrs:{src:"https://files.readme.io/bc56583-RelationalConnection.png",alt:""}})])},function(){var s=this.$createElement,t=this._self._c||s;return t("h3",{attrs:{id:"_5-1-5-在suse-11-4中安装ignite-odbc"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_5-1-5-在suse-11-4中安装ignite-odbc","aria-hidden":"true"}},[this._v("#")]),this._v(" 5.1.5.在Suse 11.4中安装Ignite ODBC")])},function(){var s=this.$createElement,t=this._self._c||s;return t("p",[t("strong",[this._v("1.安装必要的包")])])},function(){var s=this,t=s.$createElement,n=s._self._c||t;return n("p",[n("em",[s._v("1.1.添加仓库")]),s._v(" - "),n("code",[s._v("oss")]),s._v("，"),n("code",[s._v("non-oss")]),s._v("，"),n("code",[s._v("openSUSE_Factory")]),s._v("，"),n("code",[s._v("devel_gcc")]),s._v("；")])},function(){var s=this,t=s.$createElement,n=s._self._c||t;return n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[n("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" zypper ar http://download.opensuse.org/distribution/11.4/repo/oss/ oss\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" zypper ar http://download.opensuse.org/distribution/11.4/repo/non-oss/ non-oss\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" zypper ar https://download.opensuse.org/repositories/devel:/tools:/building/openSUSE_Factory/ openSUSE_Factory\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" zypper ar http://download.opensuse.org/repositories/devel:/gcc/SLE-11/  devel_gcc\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br")])])},function(){var s=this.$createElement,t=this._self._c||s;return t("p",[t("em",[this._v("1.2.安装automake和autoconf")])])},function(){var s=this.$createElement,t=this._self._c||s;return t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token function"}},[this._v("sudo")]),this._v(" zypper "),t("span",{pre:!0,attrs:{class:"token function"}},[this._v("install")]),this._v(" autoconf automake\n")])]),this._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[this._v("1")]),t("br")])])},function(){var s=this.$createElement,t=this._self._c||s;return t("p",[t("em",[this._v("1.3.安装libtool")])])},function(){var s=this,t=s.$createElement,n=s._self._c||t;return n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[n("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" zypper "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v(" libtool-2.4.6-7.1.x86_64\n\nLoading repository data"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v(".\nReading installed packages"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v(".\nResolving package dependencies"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v(".\n \nProblem: nothing provides m4 "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">=")]),s._v(" 1.4.16 needed by libtool-2.4.6-7.1.x86_64\n Solution 1: "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("do")]),s._v(" not "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v(" libtool-2.4.6-7.1.x86_64\n Solution 2: "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("break")]),s._v(" libtool-2.4.6-7.1.x86_64 by ignoring some of its dependencies\n \nChoose from above solutions by number or cancel "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("1/2/c"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("c"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(": 2\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br"),n("span",{staticClass:"line-number"},[s._v("5")]),n("br"),n("span",{staticClass:"line-number"},[s._v("6")]),n("br"),n("span",{staticClass:"line-number"},[s._v("7")]),n("br"),n("span",{staticClass:"line-number"},[s._v("8")]),n("br"),n("span",{staticClass:"line-number"},[s._v("9")]),n("br"),n("span",{staticClass:"line-number"},[s._v("10")]),n("br"),n("span",{staticClass:"line-number"},[s._v("11")]),n("br")])])},function(){var s=this.$createElement,t=this._self._c||s;return t("p",[t("em",[this._v("1.4.安装OpenSSL")])])},function(){var s=this,t=s.$createElement,n=s._self._c||t;return n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[n("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" zypper "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v(" openssl openssl-devel\n\nLoading repository data"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v(".\nReading installed packages"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v(".\n"),n("span",{pre:!0,attrs:{class:"token string"}},[s._v("'openssl-devel'")]),s._v(" not found "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("in")]),s._v(" package names. Trying capabilities.\nResolving package dependencies"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v(".\n \nProblem: libopenssl-devel-1.0.0c-17.1.x86_64 requires zlib-devel, but this requirement cannot be provided\n  uninstallable providers: zlib-devel-1.2.5-8.1.i586"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("oss"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n                   zlib-devel-1.2.5-8.1.x86_64"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("oss"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n Solution 1: downgrade of zlib-1.2.7-0.12.3.x86_64 to zlib-1.2.5-8.1.x86_64\n Solution 2: "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("do")]),s._v(" not ask to "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v(" a solvable providing openssl-devel\n Solution 3: "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("do")]),s._v(" not ask to "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v(" a solvable providing openssl-devel\n Solution 4: "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("break")]),s._v(" libopenssl-devel-1.0.0c-17.1.x86_64 by ignoring some of its dependencies\n \nChoose from above solutions by number or cancel "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("1/2/3/4/c"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("c"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(": 1\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br"),n("span",{staticClass:"line-number"},[s._v("5")]),n("br"),n("span",{staticClass:"line-number"},[s._v("6")]),n("br"),n("span",{staticClass:"line-number"},[s._v("7")]),n("br"),n("span",{staticClass:"line-number"},[s._v("8")]),n("br"),n("span",{staticClass:"line-number"},[s._v("9")]),n("br"),n("span",{staticClass:"line-number"},[s._v("10")]),n("br"),n("span",{staticClass:"line-number"},[s._v("11")]),n("br"),n("span",{staticClass:"line-number"},[s._v("12")]),n("br"),n("span",{staticClass:"line-number"},[s._v("13")]),n("br"),n("span",{staticClass:"line-number"},[s._v("14")]),n("br"),n("span",{staticClass:"line-number"},[s._v("15")]),n("br"),n("span",{staticClass:"line-number"},[s._v("16")]),n("br")])])},function(){var s=this.$createElement,t=this._self._c||s;return t("p",[t("em",[this._v("1.5.安装gcc编译器")])])},function(){var s=this,t=s.$createElement,n=s._self._c||t;return n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[n("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" zypper "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v(" gcc5 gcc5-c++\n\nLoading repository data"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v(".\nReading installed packages"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v(".\nResolving package dependencies"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v(".\n2 Problems:\nProblem: gcc5-5.5.0+r253576-1.1.x86_64 requires libgcc_s1 "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">=")]),s._v(" 5.5.0+r253576-1.1, but this requirement cannot be provided\nProblem: gcc5-c++-5.5.0+r253576-1.1.x86_64 requires gcc5 "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" 5.5.0+r253576-1.1, but this requirement cannot be provided\n \nProblem: gcc5-5.5.0+r253576-1.1.x86_64 requires libgcc_s1 "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">=")]),s._v(" 5.5.0+r253576-1.1, but this requirement cannot be provided\n  uninstallable providers: libgcc_s1-5.5.0+r253576-1.1.i586"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("devel_gcc"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n                   libgcc_s1-5.5.0+r253576-1.1.x86_64"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("devel_gcc"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n                   libgcc_s1-6.4.1+r251631-80.1.i586"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("devel_gcc"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n                   libgcc_s1-6.4.1+r251631-80.1.x86_64"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("devel_gcc"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n                   libgcc_s1-7.3.1+r258812-103.1.i586"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("devel_gcc"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n                   libgcc_s1-7.3.1+r258812-103.1.x86_64"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("devel_gcc"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n                   libgcc_s1-8.1.1+r260570-32.1.i586"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("devel_gcc"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n                   libgcc_s1-8.1.1+r260570-32.1.x86_64"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("devel_gcc"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n Solution 1: "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v(" libgcc_s1-8.1.1+r260570-32.1.x86_64 "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("with vendor change"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n  SUSE LINUX Products GmbH, Nuernberg, Germany  --"),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("  obs://build.opensuse.org/devel:gcc\n Solution 2: "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("do")]),s._v(" not "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v(" gcc5-5.5.0+r253576-1.1.x86_64\n Solution 3: "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("do")]),s._v(" not "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v(" gcc5-5.5.0+r253576-1.1.x86_64\n Solution 4: "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("break")]),s._v(" gcc5-5.5.0+r253576-1.1.x86_64 by ignoring some of its dependencies\n \nChoose from above solutions by number or skip, retry or cancel "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("1/2/3/4/s/r/c"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("c"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(": 1\n \nProblem: gcc5-c++-5.5.0+r253576-1.1.x86_64 requires gcc5 "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" 5.5.0+r253576-1.1, but this requirement cannot be provided\n  uninstallable providers: gcc5-5.5.0+r253576-1.1.i586"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("devel_gcc"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n                   gcc5-5.5.0+r253576-1.1.x86_64"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("devel_gcc"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n Solution 1: "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v(" libgomp1-8.1.1+r260570-32.1.x86_64 "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("with vendor change"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n  SUSE LINUX Products GmbH, Nuernberg, Germany  --"),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("  obs://build.opensuse.org/devel:gcc\n Solution 2: "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("do")]),s._v(" not "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v(" gcc5-c++-5.5.0+r253576-1.1.x86_64\n Solution 3: "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("do")]),s._v(" not "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v(" gcc5-c++-5.5.0+r253576-1.1.x86_64\n Solution 4: "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("break")]),s._v(" gcc5-c++-5.5.0+r253576-1.1.x86_64 by ignoring some of its dependencies\n \nChoose from above solutions by number or skip, retry or cancel "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("1/2/3/4/s/r/c"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("c"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(": 1\nResolving dependencies"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v(".\nResolving package dependencies"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("..")]),s._v(".\n \nProblem: gcc5-c++-5.5.0+r253576-1.1.x86_64 requires libstdc++6-devel-gcc5 "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" 5.5.0+r253576-1.1, but this requirement cannot be provided\n  uninstallable providers: libstdc++6-devel-gcc5-5.5.0+r253576-1.1.i586"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("devel_gcc"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n                   libstdc++6-devel-gcc5-5.5.0+r253576-1.1.x86_64"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("devel_gcc"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\n Solution 1: "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v(" libstdc++6-8.1.1+r260570-32.1.x86_64 "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("with vendor change"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n  SUSE LINUX Products GmbH, Nuernberg, Germany  --"),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("  obs://build.opensuse.org/devel:gcc\n Solution 2: "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("do")]),s._v(" not "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v(" gcc5-c++-5.5.0+r253576-1.1.x86_64\n Solution 3: "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("do")]),s._v(" not "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v(" gcc5-c++-5.5.0+r253576-1.1.x86_64\n Solution 4: "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("break")]),s._v(" gcc5-c++-5.5.0+r253576-1.1.x86_64 by ignoring some of its dependencies\n \nChoose from above solutions by number or cancel "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("1/2/3/4/c"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("c"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(": 1\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br"),n("span",{staticClass:"line-number"},[s._v("5")]),n("br"),n("span",{staticClass:"line-number"},[s._v("6")]),n("br"),n("span",{staticClass:"line-number"},[s._v("7")]),n("br"),n("span",{staticClass:"line-number"},[s._v("8")]),n("br"),n("span",{staticClass:"line-number"},[s._v("9")]),n("br"),n("span",{staticClass:"line-number"},[s._v("10")]),n("br"),n("span",{staticClass:"line-number"},[s._v("11")]),n("br"),n("span",{staticClass:"line-number"},[s._v("12")]),n("br"),n("span",{staticClass:"line-number"},[s._v("13")]),n("br"),n("span",{staticClass:"line-number"},[s._v("14")]),n("br"),n("span",{staticClass:"line-number"},[s._v("15")]),n("br"),n("span",{staticClass:"line-number"},[s._v("16")]),n("br"),n("span",{staticClass:"line-number"},[s._v("17")]),n("br"),n("span",{staticClass:"line-number"},[s._v("18")]),n("br"),n("span",{staticClass:"line-number"},[s._v("19")]),n("br"),n("span",{staticClass:"line-number"},[s._v("20")]),n("br"),n("span",{staticClass:"line-number"},[s._v("21")]),n("br"),n("span",{staticClass:"line-number"},[s._v("22")]),n("br"),n("span",{staticClass:"line-number"},[s._v("23")]),n("br"),n("span",{staticClass:"line-number"},[s._v("24")]),n("br"),n("span",{staticClass:"line-number"},[s._v("25")]),n("br"),n("span",{staticClass:"line-number"},[s._v("26")]),n("br"),n("span",{staticClass:"line-number"},[s._v("27")]),n("br"),n("span",{staticClass:"line-number"},[s._v("28")]),n("br"),n("span",{staticClass:"line-number"},[s._v("29")]),n("br"),n("span",{staticClass:"line-number"},[s._v("30")]),n("br"),n("span",{staticClass:"line-number"},[s._v("31")]),n("br"),n("span",{staticClass:"line-number"},[s._v("32")]),n("br"),n("span",{staticClass:"line-number"},[s._v("33")]),n("br"),n("span",{staticClass:"line-number"},[s._v("34")]),n("br"),n("span",{staticClass:"line-number"},[s._v("35")]),n("br"),n("span",{staticClass:"line-number"},[s._v("36")]),n("br"),n("span",{staticClass:"line-number"},[s._v("37")]),n("br"),n("span",{staticClass:"line-number"},[s._v("38")]),n("br"),n("span",{staticClass:"line-number"},[s._v("39")]),n("br"),n("span",{staticClass:"line-number"},[s._v("40")]),n("br"),n("span",{staticClass:"line-number"},[s._v("41")]),n("br"),n("span",{staticClass:"line-number"},[s._v("42")]),n("br"),n("span",{staticClass:"line-number"},[s._v("43")]),n("br"),n("span",{staticClass:"line-number"},[s._v("44")]),n("br"),n("span",{staticClass:"line-number"},[s._v("45")]),n("br"),n("span",{staticClass:"line-number"},[s._v("46")]),n("br"),n("span",{staticClass:"line-number"},[s._v("47")]),n("br"),n("span",{staticClass:"line-number"},[s._v("48")]),n("br"),n("span",{staticClass:"line-number"},[s._v("49")]),n("br")])])},function(){var s=this.$createElement,t=this._self._c||s;return t("p",[t("em",[this._v("1.6.创建编译器执行文件的符号链接")])])},function(){var s=this,t=s.$createElement,n=s._self._c||t;return n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[n("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("rm")]),s._v(" /usr/bin/gcc\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("rm")]),s._v(" /usr/bin/g++\n \n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("ln")]),s._v(" -s /usr/bin/g++-5 /usr/bin/g++\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("ln")]),s._v(" -s /usr/bin/gcc-5 /usr/bin/gcc\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br"),n("span",{staticClass:"line-number"},[s._v("5")]),n("br")])])},function(){var s=this.$createElement,t=this._self._c||s;return t("p",[t("em",[this._v("1.7.通过源码安装unixODBC")]),this._v("：从"),t("a",{attrs:{href:"http://www.unixodbc.org/",target:"_self",rel:"noopener noreferrer"}},[this._v("http://www.unixodbc.org/")]),this._v("下载并安装最新的unixODBC（2.3.6或更新的版本）。")])},function(){var s=this.$createElement,t=this._self._c||s;return t("p",[t("em",[this._v("1.8.检查指定版本的所有依赖库和工具都已经成功安装")])])},function(){var s=this,t=s.$createElement,n=s._self._c||t;return n("div",{staticClass:"language- line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-text"}},[n("code",[s._v("1. libtool --version\nlibtool (GNU libtool) 2.4.6\n2. m4 --version\nm4 (GNU M4) 1.4.12\n3. autoconf --version\nautoconf (GNU Autoconf) 2.69\n4. automake --version\nautomake (GNU automake) 1.16.1\n5. openssl version\nOpenSSL 1.0.0c 2 Dec 2010\n6. g++ --version\ng++ (SUSE Linux) 5.5.0 20171010 [gcc-5-branch revision 253640]\n7. JDK 1.8\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br"),n("span",{staticClass:"line-number"},[s._v("5")]),n("br"),n("span",{staticClass:"line-number"},[s._v("6")]),n("br"),n("span",{staticClass:"line-number"},[s._v("7")]),n("br"),n("span",{staticClass:"line-number"},[s._v("8")]),n("br"),n("span",{staticClass:"line-number"},[s._v("9")]),n("br"),n("span",{staticClass:"line-number"},[s._v("10")]),n("br"),n("span",{staticClass:"line-number"},[s._v("11")]),n("br"),n("span",{staticClass:"line-number"},[s._v("12")]),n("br"),n("span",{staticClass:"line-number"},[s._v("13")]),n("br")])])},function(){var s=this.$createElement,t=this._self._c||s;return t("p",[t("strong",[this._v("2.构建Ignite和Ignite ODBC驱动")])])},function(){var s=this.$createElement,t=this._self._c||s;return t("p",[t("em",[this._v("2.1.先检查JAVA_HOME环境变量是否配置，然后执行下面的命令")])])},function(){var s=this,t=s.$createElement,n=s._self._c||t;return n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[n("span",{pre:!0,attrs:{class:"token function"}},[s._v("cd")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token variable"}},[s._v("$IGNITE_HOME")]),s._v("/platforms/cpp\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("export")]),s._v(" LDFLAGS"),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("-lrt\n \nlibtoolize "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("&&")]),s._v(" aclocal "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("&&")]),s._v(" autoheader "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("&&")]),s._v(" automake --add-missing "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("&&")]),s._v(" autoreconf\n./configure --enable-odbc\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("make")]),s._v("\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("make")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v("\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br"),n("span",{staticClass:"line-number"},[s._v("5")]),n("br"),n("span",{staticClass:"line-number"},[s._v("6")]),n("br"),n("span",{staticClass:"line-number"},[s._v("7")]),n("br")])])},function(){var s=this.$createElement,t=this._self._c||s;return t("p",[t("em",[this._v("2.2.安装ODBC驱动")])])},function(){var s=this.$createElement,t=this._self._c||s;return t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token function"}},[this._v("sudo")]),this._v(" odbcinst -i -d -f "),t("span",{pre:!0,attrs:{class:"token variable"}},[this._v("$IGNITE_HOME")]),this._v("/platforms/cpp/odbc/install/ignite-odbc-install.ini\n")])]),this._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[this._v("1")]),t("br")])])}],!1,null,null,null);e.options.__file="Informatica.md";t.default=e.exports}}]);
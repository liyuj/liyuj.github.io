(window.webpackJsonp=window.webpackJsonp||[]).push([[125],{87:function(t,s,a){"use strict";a.r(s);var e=a(0),n=Object(e.a)({},(function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"visor管理控制台"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#visor管理控制台","aria-hidden":"true"}},[t._v("#")]),t._v(" Visor管理控制台")]),t._v(" "),a("h2",{attrs:{id:"_1-命令行接口"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-命令行接口","aria-hidden":"true"}},[t._v("#")]),t._v(" 1.命令行接口")]),t._v(" "),a("h3",{attrs:{id:"_1-1-概述"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-1-概述","aria-hidden":"true"}},[t._v("#")]),t._v(" 1.1.概述")]),t._v(" "),a("p",[t._v("Visor命令行接口为Ignite提供了脚本化的监控能力，它可以用于从网格获得与节点、缓存和任务有关的统计数据，显示与拓扑有关的各种指标的一般细节，还有节点的配置属性也可以在这里看到，它还可以用于启动和停止远程节点。")]),t._v(" "),a("p",[a("img",{attrs:{src:"https://files.readme.io/T32Eltb1SoaxDK1lEIvd_visor.png",alt:""}})]),t._v(" "),a("h3",{attrs:{id:"_1-2-使用"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-2-使用","aria-hidden":"true"}},[t._v("#")]),t._v(" 1.2.使用")]),t._v(" "),a("p",[t._v("Ignite附带了"),a("code",[t._v("IGNITE_HOME/bin/ignitevisorcmd.{sh|bat}")]),t._v("脚本，用于启动命令行管理接口。")]),t._v(" "),a("p",[t._v("要获得帮助以及希望入门，输入"),a("code",[t._v("type")]),t._v("或者"),a("code",[t._v("?")]),t._v("命令，要将visor接入网格，输入"),a("code",[t._v("open")]),t._v("命令。")]),t._v(" "),a("h3",{attrs:{id:"_1-3-命令"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-3-命令","aria-hidden":"true"}},[t._v("#")]),t._v(" 1.3.命令")]),t._v(" "),a("table",[a("thead",[a("tr",[a("th",[t._v("命令")]),t._v(" "),a("th",[t._v("别名")]),t._v(" "),a("th",[t._v("描述")])])]),t._v(" "),a("tbody",[a("tr",[a("td",[t._v("ack")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("所有远程节点的Ack参数")])]),t._v(" "),a("tr",[a("td",[t._v("alert")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("提示用户定义的事件")])]),t._v(" "),a("tr",[a("td",[t._v("cache")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("输出缓存的统计数据，清理缓存，从缓存输出所有条目的列表")])]),t._v(" "),a("tr",[a("td",[t._v("close")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("将visor从网格断开")])]),t._v(" "),a("tr",[a("td",[t._v("config")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("输出节点的配置")])]),t._v(" "),a("tr",[a("td",[t._v("deploy")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("将文件或者文件夹复制到远程主机")])]),t._v(" "),a("tr",[a("td",[t._v("disco")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("输出拓扑变更日志")])]),t._v(" "),a("tr",[a("td",[t._v("events")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("从一个节点输出事件")])]),t._v(" "),a("tr",[a("td",[t._v("gc")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("在远程节点运行GC")])]),t._v(" "),a("tr",[a("td",[t._v("help")]),t._v(" "),a("td",[t._v("?")]),t._v(" "),a("td",[t._v("输出Visor控制台帮助")])]),t._v(" "),a("tr",[a("td",[t._v("kill")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("杀掉或者重启节点")])]),t._v(" "),a("tr",[a("td",[t._v("log")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("启动或者停止网格范围的事件日志")])]),t._v(" "),a("tr",[a("td",[t._v("mclear")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("清除Visor控制台内存变量")])]),t._v(" "),a("tr",[a("td",[t._v("mget")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("获取Visor控制台内存变量")])]),t._v(" "),a("tr",[a("td",[t._v("mlist")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("输出Visor控制台内存变量")])]),t._v(" "),a("tr",[a("td",[t._v("node")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("输出节点统计数据")])]),t._v(" "),a("tr",[a("td",[t._v("open")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("将Visor接入网格")])]),t._v(" "),a("tr",[a("td",[t._v("ping")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("ping节点")])]),t._v(" "),a("tr",[a("td",[t._v("quit")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("退出Visor控制台")])]),t._v(" "),a("tr",[a("td",[t._v("start")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("在远程主机启动或者重启节点")])]),t._v(" "),a("tr",[a("td",[t._v("status")]),t._v(" "),a("td",[t._v("!")]),t._v(" "),a("td",[t._v("输出Visor控制台状态")])]),t._v(" "),a("tr",[a("td",[t._v("tasks")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("输出任务执行统计数据")])]),t._v(" "),a("tr",[a("td",[t._v("top")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("输出当前的拓扑")])]),t._v(" "),a("tr",[a("td",[t._v("vvm")]),t._v(" "),a("td"),t._v(" "),a("td",[t._v("打开节点的VisualVM")])])])]),t._v(" "),a("h2",{attrs:{id:"_2-报警指令"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_2-报警指令","aria-hidden":"true"}},[t._v("#")]),t._v(" 2.报警指令")]),t._v(" "),a("h3",{attrs:{id:"_2-1-报警指令规范"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_2-1-报警指令规范","aria-hidden":"true"}},[t._v("#")]),t._v(" 2.1.报警指令规范")]),t._v(" "),a("p",[t._v("注册：alert: alert -r {-t=<sec>} {-<metric>=<condition><value>} ... {-<metric>=<condition><value>}")]),t._v(" "),a("p",[t._v("取消注册：alert -u {-id=<alert-id>|-a}")]),t._v(" "),a("p",[t._v("报警选项：\n-n：报警名字\n-u：取消注册的报警，‘-a’标志或者‘id’参数需要二选一，注意同时只允许‘-u’和‘-r’其中之一，如果‘-r’或者‘-u’都没有提供，会输出所有的报警。\n-a：如果提供了‘-a’，所有的报警都会被取消。\n-id=<alert-id>：如果提供了‘-u’，匹配id的报警会被取消。\n-r：通过有助记忆的谓语注册新的报警，注意同时只允许‘-u’和‘-r’其中之一，如果‘-r’或者‘-u’都没有提供，会输出所有的报警。\n-t：定义通知的频率（秒），默认是60秒，注意这个参数只可以和‘-r’配套使用。\n-s：当报警触发时执行的脚本，要配置调节时间间隔，可以看-r参数。脚本可以接收如下的参数：\n1）当名字没有定义时，报警名字或者报警ID；\n2）字符串形式的报警条件；\n3）按照报警指令的顺序的报警条件值。")]),t._v(" "),a("p",[t._v("-i：配置报警通知的最小调节时间间隔（秒），默认是60秒；")]),t._v(" "),a("p",[t._v("-<metric>：定义了有助记忆的可度量的指标：\n集群范围（不是特定节点的）：\ncc：网格内的有效CPU数量；\nnc：网格内的节点数量；\nhc：网格内的物理主机数量；\ncl：网格内当前的平均CPU负载（%）；")]),t._v(" "),a("p",[t._v("每节点的当前指标：\naj：节点的活动作业；\ncj：节点取消的作业；\ntc：节点的线程数；\nut：节点的正常运行时间；\n注意：<num>可以有‘s’，‘m’或者‘h’后缀，分别代表秒，分和时，默认值（没有后缀）是毫秒。\nje：节点的作业执行时间；\njw：节点的作业等待时间；\nwj：节点的等待作业数；\nrj：节点的拒绝作业数；\nhu：节点使用的堆内存（MB）；\ncd：节点的当前CPU负载；\nhm：节点的堆内存最大值（MB）；")]),t._v(" "),a("p",[t._v("<condition>定义指标的条件\n有助记忆谓词的比较部分：\neq：等于‘=’"),a("code",[t._v("<value>")]),t._v("数\nneq：不等于‘!=’"),a("code",[t._v("<value>")]),t._v("数\ngt：大于‘>’"),a("code",[t._v("<value>")]),t._v("数\ngte：大于等于’>=’"),a("code",[t._v("<value>")]),t._v("数\nlt：小于‘<’"),a("code",[t._v("NN")]),t._v("数\nlte：小于等于‘<=’"),a("code",[t._v("<value>")]),t._v("数")]),t._v(" "),a("h3",{attrs:{id:"_2-2-示例"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_2-2-示例","aria-hidden":"true"}},[t._v("#")]),t._v(" 2.2.示例")]),t._v(" "),a("p",[t._v("alert\n输出当前注册的所有报警。")]),t._v(" "),a("p",[t._v("alert -u -a")]),t._v(" "),a("p",[t._v("取消当前所有已注册的报警。")]),t._v(" "),a("p",[t._v("alert -u -id=12345678")]),t._v(" "),a("p",[t._v("取消指定id的报警。")]),t._v(" "),a("p",[t._v("alert -r -t=900 -cc=gte4 -cl=gt50")]),t._v(" "),a("p",[t._v("注册一个报警，如果网格内有大于等于4个CPU以及大于50%的CPU负载，每隔15分会发出通知。")]),t._v(" "),a("p",[t._v("alert -r -n=Nodes -t=15 -nc=gte3 -s=/home/user/scripts/alert.sh -i=300")]),t._v(" "),a("p",[t._v("注册一个报警，如果网格内有大于等于3个节点每隔15秒会发送通知，并且每隔不小于5分钟重复执行脚本“/home/user/scripts/alert.sh”。")]),t._v(" "),a("h3",{attrs:{id:"_2-3-自定义脚本"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_2-3-自定义脚本","aria-hidden":"true"}},[t._v("#")]),t._v(" 2.3.自定义脚本")]),t._v(" "),a("p",[t._v("注册下面这个报警，每隔15秒，如果网格内有大于等于2个节点，并且CPU数小于等于16，重复间隔不能小于5分钟，执行如下脚本"),a("code",[t._v("/home/user/myScript.sh")]),t._v("：")]),t._v(" "),a("div",{staticClass:"language-bash line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-bash"}},[a("code",[t._v("alert -r -t"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("5")]),t._v(" -n"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v("MyAlert -nc"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v("gte2 -cc"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v("lte16 -i"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("15")]),t._v(" -s"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v("/home/user/myScript.sh\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br")])]),a("p",[t._v("报警处理脚本：")]),t._v(" "),a("div",{staticClass:"language-bash line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-bash"}},[a("code",[a("span",{pre:!0,attrs:{class:"token builtin class-name"}},[t._v("echo")]),t._v(" ALERT "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),a("span",{pre:!0,attrs:{class:"token variable"}},[t._v("$1")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" CONDITION "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),a("span",{pre:!0,attrs:{class:"token variable"}},[t._v("$2")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" alarmed with node count "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),a("span",{pre:!0,attrs:{class:"token variable"}},[t._v("$3")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" and cpu count "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),a("span",{pre:!0,attrs:{class:"token variable"}},[t._v("$4")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br")])]),a("p",[t._v("会在终端生成如下输出:")]),t._v(" "),a("div",{staticClass:"language- line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[t._v("ALERT [MyAlert] CONDITION [-nc=gte2 -cc=lte16] alarmed with node count [2] and cpu count [8]\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br")])]),a("blockquote",[a("p",[t._v("注意，这里$1指的是报警名，$2指的是报警条件，$3,$4……指的是每个子条件的值。")])]),t._v(" "),a("h2",{attrs:{id:"_3-启动指令"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_3-启动指令","aria-hidden":"true"}},[t._v("#")]),t._v(" 3.启动指令")]),t._v(" "),a("h3",{attrs:{id:"_3-1-启动指令规范"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_3-1-启动指令规范","aria-hidden":"true"}},[t._v("#")]),t._v(" 3.1.启动指令规范")]),t._v(" "),a("p",[t._v("在远程主机上启动或者重启节点。")]),t._v(" "),a("p",[a("code",[t._v("start -f=<path> {-m=<num>} {-r}")])]),t._v(" "),a("p",[a("code",[t._v("start -h=<hostname> {-p=<num>} {-u=<username>} {-pw=<password>} {-k=<path>} {-n=<num>} {-g=<path>} {-c=<path>} {-s=<path>} {-m=<num>} {-r}")]),t._v("\n选项：")]),t._v(" "),a("ul",[a("li",[a("code",[t._v("-f=<path>")]),t._v("：包含网络规范的INI文件的路径，它有如下属性：")]),t._v(" "),a("li",[a("code",[t._v("[host name]")]),t._v(":特定主机的名字段；")]),t._v(" "),a("li",[a("code",[t._v("host=<hostname>")]),t._v("：IP地址或者主机名；")]),t._v(" "),a("li",[a("code",[t._v("port=<num>")]),t._v("：SSH端口；")]),t._v(" "),a("li",[a("code",[t._v("uname=<username>")]),t._v("：SSH用户名；")]),t._v(" "),a("li",[a("code",[t._v("passwd=<password>")]),t._v("：SSH密码；")]),t._v(" "),a("li",[a("code",[t._v("key=<path>")]),t._v("：SSH密钥文件路径；")]),t._v(" "),a("li",[a("code",[t._v("nodes=<num>")]),t._v("：启动节点数量；")]),t._v(" "),a("li",[a("code",[t._v("igniteHome=<path>")]),t._v("：Ignite主路径；")]),t._v(" "),a("li",[a("code",[t._v("cfg=<path>")]),t._v("：Ignite配置文件路径；")]),t._v(" "),a("li",[a("code",[t._v("script=<path>")]),t._v("：Ignite节点启动脚本。")]),t._v(" "),a("li",[a("code",[t._v("-h=<hostname>")]),t._v("：启动节点的主机名，如果IP是连续的，可以定义一组主机，比如一个范围：192.168.1.100~150，意味着包含从192.168.1.100到192.168.1.150的所有IP；")]),t._v(" "),a("li",[a("code",[t._v("-p=<num>")]),t._v("：端口号（默认22）；")]),t._v(" "),a("li",[a("code",[t._v("-u=<username>")]),t._v("：用户名（如果未定义，会使用本地用户名）；")]),t._v(" "),a("li",[a("code",[t._v("-pw=<password>")]),t._v("：密码（如果未定义，必须定义私有密钥文件）；")]),t._v(" "),a("li",[a("code",[t._v("-k=<path>")]),t._v("：私有密钥文件的路径，如果使用了密钥验证需要定义；")]),t._v(" "),a("li",[a("code",[t._v("-n=<num>")]),t._v("：希望启动的节点数量，如果部分节点已经启动，那么只会启动剩下的节点，如果该值等于当前的节点数量，并且未指定"),a("code",[t._v("-r")]),t._v("标志，那么什么都不会发生；")]),t._v(" "),a("li",[a("code",[t._v("-g=<path>")]),t._v("：Ignite安装文件夹路径，如果未指定，远程主机必须定义IGNITE_HOME环境变量；")]),t._v(" "),a("li",[a("code",[t._v("-c=<path>")]),t._v("：配置文件路径（相对于Ignite主目录），如果未指定，会使用默认的Ignite配置文件；")]),t._v(" "),a("li",[a("code",[t._v("-s=<path>")]),t._v("：启动脚本路径（相对于Ignite主目录），对于Unix默认为"),a("code",[t._v("bin/ignite.sh")]),t._v("，对于Windows为"),a("code",[t._v('bin\\ignite.bat"')]),t._v("；")]),t._v(" "),a("li",[a("code",[t._v("-m=<num>")]),t._v("：定义一台主机可以并行启动的节点的最大值，这个实际上等于每台SSH服务器的并行SSH连接数，默认值为5；")]),t._v(" "),a("li",[a("code",[t._v("-t=<num>")]),t._v("：定义连接超时（毫秒，默认值为2000）;")]),t._v(" "),a("li",[a("code",[t._v("-r")]),t._v("：标识主机的已有节点会被重启，默认如果没有这个标志，已有节点会保留。")])]),t._v(" "),a("h3",{attrs:{id:"_3-2-示例"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_3-2-示例","aria-hidden":"true"}},[t._v("#")]),t._v(" 3.2.示例")]),t._v(" "),a("p",[t._v("使用默认的配置文件启动三个节点（密码验证）：")]),t._v(" "),a("div",{staticClass:"language- line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[t._v('start "-h=10.1.1.10 -u=uname -pw=passwd -n=3"\n')])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br")])]),a("p",[t._v("使用默认的配置文件，在5台主机启动25个节点（每台主机5个节点），使用基于密钥的验证：")]),t._v(" "),a("div",{staticClass:"language- line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[t._v('start "-h=192.168.1.100~104 -u=uname -k=/home/uname/.ssh/is_rsa -n=5"\n')])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br")])]),a("p",[t._v("启动"),a("code",[t._v("start-nodes.ini")]),t._v("文件中定义的拓扑，已有节点停止：")]),t._v(" "),a("div",{staticClass:"language- line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[t._v('start "-f=start-nodes.ini -r"\n')])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br")])]),a("p",[a("strong",[t._v("start-nodes.ini")])]),t._v(" "),a("div",{staticClass:"language- line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[t._v("# section with settings for host 1\n[host1]\n# ip address or host name\nhost=192.168.1.1\n# ssh port\nport=22\n# ssh login\nuname=userName\n# ssh password\npasswd=password\n# ssh key path\nkey=~/.ssh/id_rsa\n# start node count\nnodes=1\n# ignite home path\nigniteHome=/usr/lib/ignite\n# ignite config path\ncfg=/examples/exmaple-ignite.xml\n# ignite node start script\nscript=/bin/ignite.sh\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br"),a("span",{staticClass:"line-number"},[t._v("6")]),a("br"),a("span",{staticClass:"line-number"},[t._v("7")]),a("br"),a("span",{staticClass:"line-number"},[t._v("8")]),a("br"),a("span",{staticClass:"line-number"},[t._v("9")]),a("br"),a("span",{staticClass:"line-number"},[t._v("10")]),a("br"),a("span",{staticClass:"line-number"},[t._v("11")]),a("br"),a("span",{staticClass:"line-number"},[t._v("12")]),a("br"),a("span",{staticClass:"line-number"},[t._v("13")]),a("br"),a("span",{staticClass:"line-number"},[t._v("14")]),a("br"),a("span",{staticClass:"line-number"},[t._v("15")]),a("br"),a("span",{staticClass:"line-number"},[t._v("16")]),a("br"),a("span",{staticClass:"line-number"},[t._v("17")]),a("br"),a("span",{staticClass:"line-number"},[t._v("18")]),a("br"),a("span",{staticClass:"line-number"},[t._v("19")]),a("br"),a("span",{staticClass:"line-number"},[t._v("20")]),a("br")])]),a("h2",{attrs:{id:"_4-批处理模式"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_4-批处理模式","aria-hidden":"true"}},[t._v("#")]),t._v(" 4.批处理模式")]),t._v(" "),a("h3",{attrs:{id:"_4-1-使用批处理模式启动visor"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_4-1-使用批处理模式启动visor","aria-hidden":"true"}},[t._v("#")]),t._v(" 4.1.使用批处理模式启动Visor")]),t._v(" "),a("p",[t._v("Visor命令行可以开启一个批处理模式（运行一组命令）。")]),t._v(" "),a("p",[t._v("运行"),a("code",[t._v("ignitevisorcmd.{sh|bat} -?")]),t._v("后，会显示可用的选项：")]),t._v(" "),a("p",[a("strong",[t._v("ignitevisorcmd.{sh|bat} -?")])]),t._v(" "),a("div",{staticClass:"language- line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[t._v("Usage:\n    ignitevisorcmd.bat [? | -help]|[{-v}{-np} {-cfg=<path>}]|[{-b=<path>} {-e=command1;command2;...}]\n    Where:\n        ?, /help, -help      - show this message.\n        -v                   - verbose mode (quiet by default).\n        -np                  - no pause on exit (pause by default).\n        -cfg=<path>          - connect with specified configuration.\n        -b=<path>            - batch mode with file.\n        -e=cmd1;cmd2;...     - batch mode with commands.\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br"),a("span",{staticClass:"line-number"},[t._v("6")]),a("br"),a("span",{staticClass:"line-number"},[t._v("7")]),a("br"),a("span",{staticClass:"line-number"},[t._v("8")]),a("br"),a("span",{staticClass:"line-number"},[t._v("9")]),a("br")])]),a("h3",{attrs:{id:"_4-2-使用带有命令的文件的批处理模式"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_4-2-使用带有命令的文件的批处理模式","aria-hidden":"true"}},[t._v("#")]),t._v(" 4.2.使用带有命令的文件的批处理模式")]),t._v(" "),a("p",[t._v("这个批处理模式会从文件中读取命令，所有的命令都要从新的一行开始：")]),t._v(" "),a("p",[a("strong",[t._v("commands.txt")])]),t._v(" "),a("div",{staticClass:"language- line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[t._v("open\n0\nstatus\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br")])]),a("p",[a("strong",[t._v("使用")])]),t._v(" "),a("div",{staticClass:"language- line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[t._v("ignitevisorcmd.{bat|sh} -np -b=commands.txt\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br")])]),a("p",[t._v("这会使用索引值为"),a("code",[t._v("0")]),t._v("的配置接入集群，然后执行"),a("code",[t._v("status")]),t._v("命令。")]),t._v(" "),a("h3",{attrs:{id:"_4-3-使用命令列表的批处理模式"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_4-3-使用命令列表的批处理模式","aria-hidden":"true"}},[t._v("#")]),t._v(" 4.3.使用命令列表的批处理模式")]),t._v(" "),a("p",[t._v("这个批处理模式指令会从"),a("code",[t._v("-e")]),t._v("选项读取，命令必须用分号分割：")]),t._v(" "),a("p",[a("strong",[t._v("使用")])]),t._v(" "),a("div",{staticClass:"language-bash line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-bash"}},[a("code",[t._v("ignitevisorcmd."),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("bat"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("sh"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" -np -e"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"open;0;status"')]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br")])]),a("p",[t._v("如果命令包含空格符，它们需要加上额外的单引号：")]),t._v(" "),a("div",{staticClass:"language-bash line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-bash"}},[a("code",[t._v("ignitevisorcmd."),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("bat"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("|")]),t._v("sh"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" -np -e"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("\"'open -cpath=config/default-config.xml;status'\"")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br")])]),a("p",[t._v("这会和上面的例子做同样的事情。")]),t._v(" "),a("div",{staticClass:"warning custom-block"},[a("p",{staticClass:"custom-block-title"},[t._v("注意")]),t._v(" "),a("p",[t._v("在批处理模式中，Visor命令行只是简单地按照给定的命令一个一个地执行，就和通过键盘输入时一样的。")])])])}),[],!1,null,null,null);s.default=n.exports}}]);
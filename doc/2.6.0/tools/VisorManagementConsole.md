# 3.Visor管理控制台
## 3.1.命令行接口
### 3.1.1.摘要
Visor命令行接口为Ignite提供了脚本化的监控能力，它可以用于从网格获得与节点、缓存和任务有关的统计数据，显示与网络有关的各种指标的一般细节，还有节点的配置属性也可以在这里看到，它还可以用于启动和停止远程节点。

![](https://files.readme.io/T32Eltb1SoaxDK1lEIvd_visor.png)

### 3.1.2.使用
Ignite附带了`IGNITE_HOME/bin/ignitevisorcmd.{sh|bat}`脚本，用于启动命令行管理接口。

要获得帮助以及希望入门，输入`type`或者`?`命令，要将visor接入网格，输入`open`命令。
### 3.1.3.命令

|命令|别名|描述|
|---|---|---|
|ack||所有远程节点的Ack参数|
|alert||提示用户定义的事件|
|cache||输出缓存的统计数据，清理缓存，从缓存输出所有条目的列表|
|close||将visor从网格断开|
|config||输出节点的配置|
|deploy||将文件或者文件夹复制到远程主机|
|disco||输出网络变更日志|
|events||从一个节点输出事件|
|gc||在远程节点运行GC|
|help|?|输出Visor控制台帮助|
|kill||杀掉或者重启节点|
|log||启动或者停止网格范围的事件日志|
|mclear||清除Visor控制台内存变量|
|mget||获取Visor控制台内存变量|
|mlist||输出Visor控制台内存变量|
|node||输出节点统计数据|
|open||将Visor接入网格|
|ping||ping节点|
|quit||退出Visor控制台|
|start||在远程主机启动或者重启节点|
|status|!|输出Visor控制台状态|
|tasks||输出任务执行统计数据|
|top||输出当前的网络|
|vvm||打开网络节点的VisualVM|

## 3.2.报警指令
### 3.2.1.报警指令规范
注册：alert: alert -r {-t=&lt;sec&gt;} {-&lt;metric&gt;=&lt;condition&gt;&lt;value&gt;} ... {-&lt;metric&gt;=&lt;condition&gt;&lt;value&gt;}

取消注册：alert -u {-id=&lt;alert-id&gt;|-a}

报警选项：
-n：报警名字
-u：取消注册的报警，‘-a’标志或者‘id’参数需要二选一，注意同时只允许‘-u’和‘-r’其中之一，如果‘-r’或者‘-u’都没有提供，会输出所有的报警。
-a：如果提供了‘-a’，所有的报警都会被取消。
-id=&lt;alert-id&gt;：如果提供了‘-u’，匹配id的报警会被取消。
-r：通过有助记忆的谓语注册新的报警，注意同时只允许‘-u’和‘-r’其中之一，如果‘-r’或者‘-u’都没有提供，会输出所有的报警。
-t：定义通知的频率（秒），默认是60秒，注意这个参数只可以和‘-r’配套使用。
-s：当报警触发时执行的脚本，要配置调节时间间隔，可以看-r参数。脚本可以接收如下的参数：
1）当名字没有定义时，报警名字或者报警ID；
2）字符串形式的报警条件；
3）按照报警指令的顺序的报警条件值。

-i：配置报警通知的最小调节时间间隔（秒），默认是60秒；

-&lt;metric&gt;：定义了有助记忆的可度量的指标：
集群范围（不是特定节点的）：
cc：网格内的有效CPU数量；
nc：网格内的节点数量；
hc：网格内的物理主机数量；
cl：网格内当前的平均CPU负载（%）；

每节点的当前指标：
aj：节点的活动作业；
cj：节点取消的作业；
tc：节点的线程数；
ut：节点的正常运行时间；
注意：&lt;num&gt;可以有‘s’，‘m’或者‘h’后缀，分别代表秒，分和时，默认值（没有后缀）是毫秒。
je：节点的作业执行时间；
jw：节点的作业等待时间；
wj：节点的等待作业数；
rj：节点的拒绝作业数；
hu：节点使用的堆内存（MB）；
cd：节点的当前CPU负载；
hm：节点的堆内存最大值（MB）；

&lt;condition&gt;定义指标的条件
有助记忆谓词的比较部分：
eq：等于‘=’`<value>`数
neq：不等于‘!=’`<value>`数
gt：大于‘>’`<value>`数
gte：大于等于’>=’`<value>`数
lt：小于‘<’`NN`数
lte：小于等于‘<=’`<value>`数

### 3.2.2.示例
alert
输出当前注册的所有报警。

alert -u -a

取消当前所有已注册的报警。

alert -u -id=12345678

取消指定id的报警。

alert -r -t=900 -cc=gte4 -cl=gt50

注册一个报警，如果网格内有大于等于4个CPU以及大于50%的CPU负载，每隔15分会发出通知。

alert -r -n=Nodes -t=15 -nc=gte3 -s=/home/user/scripts/alert.sh -i=300

注册一个报警，如果网格内有大于等于3个节点每隔15秒会发送通知，并且每隔不小于5分钟重复执行脚本“/home/user/scripts/alert.sh”。
### 3.2.3.自定义脚本
注册下面这个报警，每隔15秒，如果网格内有大于等于2个节点，并且CPU数小于等于16，重复间隔不能小于5分钟，执行如下脚本`/home/user/myScript.sh`：
```bash
alert -r -t=5 -n=MyAlert -nc=gte2 -cc=lte16 -i=15 -s=/home/user/myScript.sh
```
报警处理脚本：
```bash
echo ALERT [$1] CONDITION [$2] alarmed with node count [$3] and cpu count [$4]
```
会在终端生成如下输出:
```
ALERT [MyAlert] CONDITION [-nc=gte2 -cc=lte16] alarmed with node count [2] and cpu count [8]
```
> 注意，这里$1指的是报警名，$2指的是报警条件，$3,$4……指的是每个子条件的值。

## 3.3.启动指令
### 3.3.1.启动指令规范
在远程主机上启动或者重启节点。

`start -f=<path> {-m=<num>} {-r}`

`start -h=<hostname> {-p=<num>} {-u=<username>} {-pw=<password>} {-k=<path>} {-n=<num>} {-g=<path>} {-c=<path>} {-s=<path>} {-m=<num>} {-r}`
选项：

 - `-f=<path>`：包含网络规范的INI文件的路径，它有如下属性：
  - `[host name]`:特定主机的名字段；
  - `host=<hostname>`：IP地址或者主机名；
  - `port=<num>`：SSH端口；
  - `uname=<username>`：SSH用户名；
  - `passwd=<password>`：SSH密码；
  - `key=<path>`：SSH密钥文件路径；
  - `nodes=<num>`：启动节点数量；
  - `igniteHome=<path>`：Ignite主路径；
  - `cfg=<path>`：Ignite配置文件路径；
  - `script=<path>`：Ignite节点启动脚本。
 - `-h=<hostname>`：启动节点的主机名，如果IP是连续的，可以定义一组主机，比如一个范围：192.168.1.100~150，意味着包含从192.168.1.100到192.168.1.150的所有IP；
 - `-p=<num>`：端口号（默认22）；
 - `-u=<username>`：用户名（如果未定义，会使用本地用户名）；
 - `-pw=<password>`：密码（如果未定义，必须定义私有密钥文件）；
 - `-k=<path>`：私有密钥文件的路径，如果使用了密钥验证需要定义；
 - `-n=<num>`：希望启动的节点数量，如果部分节点已经启动，那么只会启动剩下的节点，如果该值等于当前的节点数量，并且未指定`-r`标志，那么什么都不会发生；
 - `-g=<path>`：Ignite安装文件夹路径，如果未指定，远程主机必须定义IGNITE_HOME环境变量；
 - `-c=<path>`：配置文件路径（相对于Ignite主目录），如果未指定，会使用默认的Ignite配置文件；
 - `-s=<path>`：启动脚本路径（相对于Ignite主目录），对于Unix默认为`bin/ignite.sh`，对于Windows为`bin\ignite.bat"`；
 - `-m=<num>`：定义一台主机可以并行启动的节点的最大值，这个实际上等于每台SSH服务器的并行SSH连接数，默认值为5；
 - `-t=<num>`：定义连接超时（毫秒，默认值为2000）;
 - `-r`：标识主机的已有节点会被重启，默认如果没有这个标志，已有节点会保留。

### 3.3.2.示例
使用默认的配置文件启动三个节点（密码验证）：
```
start "-h=10.1.1.10 -u=uname -pw=passwd -n=3"
```
使用默认的配置文件，在5台主机启动25个节点（每台主机5个节点），使用基于密钥的验证：
```
start "-h=192.168.1.100~104 -u=uname -k=/home/uname/.ssh/is_rsa -n=5"
```
启动`start-nodes.ini`文件中定义的网络，已有节点停止：
```
start "-f=start-nodes.ini -r"
```
**start-nodes.ini**
```
# section with settings for host 1
[host1]
# ip address or host name
host=192.168.1.1
# ssh port
port=22
# ssh login
uname=userName
# ssh password
passwd=password
# ssh key path
key=~/.ssh/id_rsa
# start node count
nodes=1
# ignite home path
igniteHome=/usr/lib/ignite
# ignite config path
cfg=/examples/exmaple-ignite.xml
# ignite node start script
script=/bin/ignite.sh
```
 
## 3.4.批处理模式
### 3.4.1.使用批处理模式启动VVisor
Visor命令行可以开启一个批处理模式（运行一组命令）。

运行`ignitevisorcmd.{sh|bat} -?`后，会显示可用的选项：

**ignitevisorcmd.{sh|bat} -?**
```
Usage:
    ignitevisorcmd.bat [? | -help]|[{-v}{-np} {-cfg=<path>}]|[{-b=<path>} {-e=command1;command2;...}]
    Where:
        ?, /help, -help      - show this message.
        -v                   - verbose mode (quiet by default).
        -np                  - no pause on exit (pause by default).
        -cfg=<path>          - connect with specified configuration.
        -b=<path>            - batch mode with file.
        -e=cmd1;cmd2;...     - batch mode with commands.
```
### 3.4.2.使用带有命令的文件的批处理模式
这个批处理模式会从文件中读取命令，所有的命令都要从新的一行开始：

**commands.txt**
```
open
0
status
```
**使用**
```
ignitevisorcmd.{bat|sh} -np -b=commands.txt
```
这会使用索引值为`0`的配置接入集群，然后执行`status`命令。
### 3.4.3.使用命令列表的批处理模式
这个批处理模式指令会从`-e`选项读取，命令必须用分号分割：

**使用**
```bash
ignitevisorcmd.{bat|sh} -np -e="open;0;status"
```
如果命令包含空格符，它们需要加上额外的单引号：
```bash
ignitevisorcmd.{bat|sh} -np -e="'open -cpath=config/default-config.xml;status'"
```
这会和上面的例子做同样的事情。

> 注意，在批处理模式中，Visor命令行只是简单地按照给定的命令一个一个地执行，就和通过键盘输入时一样的。
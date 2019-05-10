# 5.Informatica
## 5.1.Informatica
### 5.1.1.概述
Informatica是一个云数据管理和集成工具，可以通过ODBC连接将Informatica接入Ignite。
### 5.1.2.从Informatica PowerCenter Designer接入
在PowerCenter Designer中，必须安装32位的Ignite ODBC驱动才能接入Ignite，可以按照下面链接的内容安装ODBC驱动并且创建DSN：

 - [在Windows上安装](/doc/sql/ODBC.md#_5-1-6-1-在Windows上安装)
 - [配置DSN](/doc/sql/ODBC.md#_5-2-4-配置DSN)

然后：

 1. 如果要从Ignite中导入表，在`Sources`或者`Targets`菜单中选择`Import from Database...`；
 2. 通过选择`Apache Ignite DSN`作为ODBC数据源接入集群。

![](https://files.readme.io/decd6fe-ImportTables.png)
### 5.1.3.在Informatica服务节点上安装Ignite ODBC
在[在Linux上构建](/doc/sql/ODBC.md#_5-1-5-2-在Linux上构建)和[在Linux上安装](/doc/sql/ODBC.md#_5-1-6-2-在Linux上安装)文档中，描述了如何在Ignite服务端节点上安装Ignite ODBC。

Informatica会使用`$ODBCINI`和`$ODBCISTINI`环境变量指定的配置文件（[为ODBC配置UNIX环境变量](https://kb.informatica.com/howto/6/Pages/19/499306.aspx)）。

配置Ignite ODBC驱动和创建新的DSN，如下所示：

**odbc.ini：**
```ini
[ApacheIgnite]
Driver      = /usr/local/lib/libignite-odbc.so
Description = Apache Ignite ODBC
Address = 192.168.0.105
User = ignite
Password = ignite
Schema = PUBLIC
```
**odbcinst.ini**
```ini
[ApacheIgnite]
Driver  = /usr/local/lib/libignite-odbc.so
```
要验证ODBC连接，可以使用Informatica的`ssgodbc.linux64`工具，如下所示：
```bash
<INFORMATICA_HOME>/tools/debugtools/ssgodbc/linux64/ssgodbc.linux64 -d ApacheIgnite -u ignite -p ignite -v
```
如果`unixODBC`或者Ignite的ODBC库没有安装在默认的目录中-`/usr/local/lib`，则需要将其加入`LD_LIBRARY_PATH`然后再次测试，如下：
```bash
UNIXODBC_LIB=/opt/unixodbc/lib/
IGNITE_ODBC_LIB=/opt/igniteodbc/lib
LD_LIBRARY_PATH=<UNIXODBC_LIB>:<IGNITE_ODBC_LIB>

<INFORMATICA_HOME>/tools/debugtools/ssgodbc/linux64/ssgodbc.linux64 -d ApacheIgnite -u ignite -p ignite -v
```
### 5.1.4.配置相关的连接
选择`Connections`>`Relational...`可以显示`Relational Connection Browser`。

选中ODBC类型然后创建一个新的连接。
![](https://files.readme.io/bc56583-RelationalConnection.png)
### 5.1.5.在Suse 11.4中安装Ignite ODBC
下面是在Suse 11.4环境中构建Ignite和Ignite ODBC驱动的步骤。

**1.安装必要的包**

*1.1.添加仓库* - `oss`，`non-oss`，`openSUSE_Factory`，`devel_gcc`；
```bash
sudo zypper ar http://download.opensuse.org/distribution/11.4/repo/oss/ oss
sudo zypper ar http://download.opensuse.org/distribution/11.4/repo/non-oss/ non-oss
sudo zypper ar https://download.opensuse.org/repositories/devel:/tools:/building/openSUSE_Factory/ openSUSE_Factory
sudo zypper ar http://download.opensuse.org/repositories/devel:/gcc/SLE-11/  devel_gcc
```
*1.2.安装automake和autoconf*
```bash
sudo zypper install autoconf automake
```
*1.3.安装libtool*
```bash
sudo zypper install libtool-2.4.6-7.1.x86_64

Loading repository data...
Reading installed packages...
Resolving package dependencies...

Problem: nothing provides m4 >= 1.4.16 needed by libtool-2.4.6-7.1.x86_64
 Solution 1: do not install libtool-2.4.6-7.1.x86_64
 Solution 2: break libtool-2.4.6-7.1.x86_64 by ignoring some of its dependencies

Choose from above solutions by number or cancel [1/2/c] (c): 2
```
*1.4.安装OpenSSL*
```bash
sudo zypper install openssl openssl-devel

Loading repository data...
Reading installed packages...
'openssl-devel' not found in package names. Trying capabilities.
Resolving package dependencies...

Problem: libopenssl-devel-1.0.0c-17.1.x86_64 requires zlib-devel, but this requirement cannot be provided
  uninstallable providers: zlib-devel-1.2.5-8.1.i586[oss]
                   zlib-devel-1.2.5-8.1.x86_64[oss]
 Solution 1: downgrade of zlib-1.2.7-0.12.3.x86_64 to zlib-1.2.5-8.1.x86_64
 Solution 2: do not ask to install a solvable providing openssl-devel
 Solution 3: do not ask to install a solvable providing openssl-devel
 Solution 4: break libopenssl-devel-1.0.0c-17.1.x86_64 by ignoring some of its dependencies

Choose from above solutions by number or cancel [1/2/3/4/c] (c): 1
```
*1.5.安装gcc编译器*
```bash
sudo zypper install gcc5 gcc5-c++

Loading repository data...
Reading installed packages...
Resolving package dependencies...
2 Problems:
Problem: gcc5-5.5.0+r253576-1.1.x86_64 requires libgcc_s1 >= 5.5.0+r253576-1.1, but this requirement cannot be provided
Problem: gcc5-c++-5.5.0+r253576-1.1.x86_64 requires gcc5 = 5.5.0+r253576-1.1, but this requirement cannot be provided

Problem: gcc5-5.5.0+r253576-1.1.x86_64 requires libgcc_s1 >= 5.5.0+r253576-1.1, but this requirement cannot be provided
  uninstallable providers: libgcc_s1-5.5.0+r253576-1.1.i586[devel_gcc]
                   libgcc_s1-5.5.0+r253576-1.1.x86_64[devel_gcc]
                   libgcc_s1-6.4.1+r251631-80.1.i586[devel_gcc]
                   libgcc_s1-6.4.1+r251631-80.1.x86_64[devel_gcc]
                   libgcc_s1-7.3.1+r258812-103.1.i586[devel_gcc]
                   libgcc_s1-7.3.1+r258812-103.1.x86_64[devel_gcc]
                   libgcc_s1-8.1.1+r260570-32.1.i586[devel_gcc]
                   libgcc_s1-8.1.1+r260570-32.1.x86_64[devel_gcc]
 Solution 1: install libgcc_s1-8.1.1+r260570-32.1.x86_64 (with vendor change)
  SUSE LINUX Products GmbH, Nuernberg, Germany  -->  obs://build.opensuse.org/devel:gcc
 Solution 2: do not install gcc5-5.5.0+r253576-1.1.x86_64
 Solution 3: do not install gcc5-5.5.0+r253576-1.1.x86_64
 Solution 4: break gcc5-5.5.0+r253576-1.1.x86_64 by ignoring some of its dependencies

Choose from above solutions by number or skip, retry or cancel [1/2/3/4/s/r/c] (c): 1

Problem: gcc5-c++-5.5.0+r253576-1.1.x86_64 requires gcc5 = 5.5.0+r253576-1.1, but this requirement cannot be provided
  uninstallable providers: gcc5-5.5.0+r253576-1.1.i586[devel_gcc]
                   gcc5-5.5.0+r253576-1.1.x86_64[devel_gcc]
 Solution 1: install libgomp1-8.1.1+r260570-32.1.x86_64 (with vendor change)
  SUSE LINUX Products GmbH, Nuernberg, Germany  -->  obs://build.opensuse.org/devel:gcc
 Solution 2: do not install gcc5-c++-5.5.0+r253576-1.1.x86_64
 Solution 3: do not install gcc5-c++-5.5.0+r253576-1.1.x86_64
 Solution 4: break gcc5-c++-5.5.0+r253576-1.1.x86_64 by ignoring some of its dependencies

Choose from above solutions by number or skip, retry or cancel [1/2/3/4/s/r/c] (c): 1
Resolving dependencies...
Resolving package dependencies...

Problem: gcc5-c++-5.5.0+r253576-1.1.x86_64 requires libstdc++6-devel-gcc5 = 5.5.0+r253576-1.1, but this requirement cannot be provided
  uninstallable providers: libstdc++6-devel-gcc5-5.5.0+r253576-1.1.i586[devel_gcc]
                   libstdc++6-devel-gcc5-5.5.0+r253576-1.1.x86_64[devel_gcc]
 Solution 1: install libstdc++6-8.1.1+r260570-32.1.x86_64 (with vendor change)
  SUSE LINUX Products GmbH, Nuernberg, Germany  -->  obs://build.opensuse.org/devel:gcc
 Solution 2: do not install gcc5-c++-5.5.0+r253576-1.1.x86_64
 Solution 3: do not install gcc5-c++-5.5.0+r253576-1.1.x86_64
 Solution 4: break gcc5-c++-5.5.0+r253576-1.1.x86_64 by ignoring some of its dependencies

Choose from above solutions by number or cancel [1/2/3/4/c] (c): 1
```
*1.6.创建编译器执行文件的符号链接*
```bash
sudo rm /usr/bin/gcc
sudo rm /usr/bin/g++

sudo ln -s /usr/bin/g++-5 /usr/bin/g++
sudo ln -s /usr/bin/gcc-5 /usr/bin/gcc
```
*1.7.通过源码安装unixODBC*：从[http://www.unixodbc.org/](http://www.unixodbc.org/)下载并安装最新的unixODBC（2.3.6或更新的版本）。

*1.8.检查指定版本的所有依赖库和工具都已经成功安装*
```
1. libtool --version
libtool (GNU libtool) 2.4.6
2. m4 --version
m4 (GNU M4) 1.4.12
3. autoconf --version
autoconf (GNU Autoconf) 2.69
4. automake --version
automake (GNU automake) 1.16.1
5. openssl version
OpenSSL 1.0.0c 2 Dec 2010
6. g++ --version
g++ (SUSE Linux) 5.5.0 20171010 [gcc-5-branch revision 253640]
7. JDK 1.8
```
**2.构建Ignite和Ignite ODBC驱动**

*2.1.先检查JAVA_HOME环境变量是否配置，然后执行下面的命令*
```bash
cd $IGNITE_HOME/platforms/cpp
export LDFLAGS=-lrt

libtoolize && aclocal && autoheader && automake --add-missing && autoreconf
./configure --enable-odbc
make
sudo make install
```
成功之后，重启系统。

*2.2.安装ODBC驱动*
```bash
sudo odbcinst -i -d -f $IGNITE_HOME/platforms/cpp/odbc/install/ignite-odbc-install.ini
```
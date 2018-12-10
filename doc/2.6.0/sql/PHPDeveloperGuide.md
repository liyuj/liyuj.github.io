# 8.PHP开发向导
## 8.1.PHP PDO
### 8.1.1.摘要
PHP提供了一个轻量级、一致的接口来访问数据库，叫做PHP数据对象-PDO，这个扩展依赖于若干特定数据库的PDO驱动，其中之一是[PDO_ODBC](http://php.net/manual/en/ref.pdo-odbc.php)，它可以接入任何实现了自己的ODBC驱动的数据库。
通过使用Ignite的ODBC驱动，从PHP应用中就可以接入Ignite集群，然后访问和修改数据，本文就会介绍如何达到该目的。
### 8.1.2.配置ODBC驱动
Ignite遵守ODBC协议，并且实现了自己的ODBC驱动，这个驱动会用于PHP的PDO框架接入Ignite集群。
查看本系列文档的ODBC部分，可以知道如何在目标系统上安装和配置这个驱动，安装完毕后，就可以进入下一个章节。

> 只能使用Ignite的1.8.0及以后的版本中的ODBC驱动，之前的版本不支持PHP的PDO框架。

### 8.1.3.安装和配置PHP PDO
要安装PHP，PDO以及PDO_ODBC驱动，可以看PHP的相关资源。

 - [下载](http://php.net/downloads.php)并安装期望的版本，注意，在PHP的5.1.0版本中，默认开启了PDO驱动，在Windows环境下，可以从[这里](http://windows.php.net/download)下载PHP的二进制包；
 - [配置](http://php.net/manual/en/book.pdo.php)PHP的PDO框架；
 - [启用](http://php.net/manual/en/ref.pdo-odbc.php)PDO_ODBC驱动：
  - 在Windows中，需要在php.ini文件中将`extension=php_pdo_odbc.dll`的注释去掉，并且确保`extension_dir`指向`php_pdo_odbc.dll`所在的目录，另外，这个目录还需要加入`PATH`环境变量；
  - 在类Unix系统中，通常可能只需要简单地安装一个特定的PHP_ODBC包，比如，Ubuntu14.04中已经安装了`php5-odbc`；
 - 如果必要，在一些特定的系统中，无法按照常规方法[配置](http://php.net/manual/en/ref.pdo-odbc.php#ref.pdo-odbc.installation)和构建PDO_ODBC驱动，但是大多数情况下，简单地安装PHP和PDO_ODBC驱动就可以了。

### 8.1.4.启动Ignite集群
PHP PDO准备就绪之后，就可以通过一个常规的配置启动Ignite集群，然后在PHP应用中接入集群并且查询和修改集群的数据。
首先，集群端已经起用了ODBC处理器，如何做呢，在每个集群节点的`IgniteConfiguration`中加入`odbcConfiguration`就可以了。
下一步，列出`IgniteConfiguration`中与特定数据模型有关的所有缓存的配置，因为之后要在PHP PDO端执行SQL查询，所有每个缓存的配置都需要包含一个`QueryEntity`的定义，可以查看有关`SQL查询`的文档，来了解有关`QueryEntity`和SQL查询的更多信息。
可以使用下面的配置模板启动一个Ignite集群：
```xml
<?xml version="1.0" encoding="UTF-8"?>

<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:util="http://www.springframework.org/schema/util"
       xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/util
        http://www.springframework.org/schema/util/spring-util.xsd">
  <bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">

    <!-- Enabling ODBC. -->
    <property name="odbcConfiguration">
      <bean class="org.apache.ignite.configuration.OdbcConfiguration"></bean>
    </property>

    <!-- Configuring cache. -->
    <property name="cacheConfiguration">
      <list>
        <bean class="org.apache.ignite.configuration.CacheConfiguration">
          <property name="name" value="Person"/>
          <property name="cacheMode" value="PARTITIONED"/>
          <property name="atomicityMode" value="TRANSACTIONAL"/>
          <property name="writeSynchronizationMode" value="FULL_SYNC"/>

          <property name="queryEntities">
            <list>
              <bean class="org.apache.ignite.cache.QueryEntity">
                <property name="keyType" value="java.lang.Long"/>
                <property name="valueType" value="Person"/>

                <property name="fields">
                  <map>
                    <entry key="firstName" value="java.lang.String"/>
                    <entry key="lastName" value="java.lang.String"/>
                    <entry key="resume" value="java.lang.String"/>
                    <entry key="salary" value="java.lang.Integer"/>
                  </map>
                </property>

                <property name="indexes">
                  <list>
                    <bean class="org.apache.ignite.cache.QueryIndex">
                      <constructor-arg value="salary"/>
                    </bean>
                  </list>
                </property>
              </bean>
            </list>
          </property>
        </bean>
      </list>
    </property>
  </bean>
</beans>
```
### 8.1.5.从PHP端接入Ignite集群
要从PHP PDO端接入Ignite，需要正确地配置DSN，在下面的示例中，假定DSN名为`LocalApacheIgniteDSN`。
> 注意，PHP PDO端必须配置使用DSN。

最后，都配置好之后，就可以在Ignite和PHP PDO应用之间相互连接了，可以像下面这样执行一些查询：
**Insert**：
```php
<?php
try {
    // Connecting to Ignite using pre-configured DSN.
    $dbh = new PDO('odbc:LocalApacheIgniteDSN');

    // Changing PDO error mode.
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Preparing query.
    $dbs = $dbh->prepare('INSERT INTO Person (_key, firstName, lastName, resume, salary) 
        VALUES (?, ?, ?, ?, ?)');

    // Declaring parameters.
    $key = 777;
    $firstName = "James";
    $lastName = "Bond";
    $resume = "Secret Service agent";
    $salary = 65000;

    // Binding parameters.
    $dbs->bindParam(1, $key);
    $dbs->bindParam(2, $firstName);
    $dbs->bindParam(3, $lastName);
    $dbs->bindParam(4, $resume);
    $dbs->bindParam(5, $salary);

    // Executing the query.
    $dbs->execute();

} catch (PDOException $e) {
    print "Error!: " . $e->getMessage() . "\n";
    die();
}
?>
```
**Update**:
```php
<?php
try {
    // Connecting to Ignite using pre-configured DSN.
    $dbh = new PDO('odbc:LocalApacheIgniteDSN');

    // Changing PDO error mode.
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Executing the query. The salary field is an indexed field.
    $dbh->query('UPDATE Person SET salary = 42000 WHERE salary > 50000');

} catch (PDOException $e) {
    print "Error!: " . $e->getMessage() . "\n";
    die();
}
?>
```
**Select**:
```php
<?php
try {
    // Connecting to Ignite using pre-configured DSN.
    $dbh = new PDO('odbc:LocalApacheIgniteDSN');

    // Changing PDO error mode.
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Executing the query and getting a result set. The salary field is an indexed field.
    $res = $dbh->query('SELECT firstName, lastName, resume, salary from Person
        WHERE salary > 12000');

    if ($res == FALSE)
        print_r("Exception");

    // Printing results.
    foreach($res as $row) {
        print_r($row);
    }

} catch (PDOException $e) {
    print "Error!: " . $e->getMessage() . "\n";
    die();
}
?>
```
**Delete**:
```php
<?php
try {
    // Connecting to Ignite using pre-configured DSN.
    $dbh = new PDO('odbc:LocalApacheIgniteDSN');

    // Changing PDO error mode.
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Performing query. Both firstName and lastName are non indexed fields.
    $dbh->query('DELETE FROM Person WHERE firstName = \'James\' and lastName = \'Bond\'');

} catch (PDOException $e) {
    print "Error!: " . $e->getMessage() . "\n";
    die();
}
?>
```
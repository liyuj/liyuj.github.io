# 9.MyBatis
## 9.1.MyBatis二级缓存
从1.5版本开始，Ignite可以作为MyBatis的二级缓存使用，可以提高MyBatis的性能。
如果是一个Maven用户，可以简单地在pom.xml中添加如下的依赖：
```xml
<dependencies>
  ...
  <dependency>
    <groupId>org.mybatis.caches</groupId>
    <artifactId>mybatis-ignite</artifactId>
    <version>1.0.5</version>
  </dependency>
  ...
</dependencies>
```
或者，也可以下载[zip包](https://github.com/mybatis/ignite-cache/releases)，解压缩之后将jar文件加入类路径。
然后，只需要像下面这样在映射XML文件中指定即可：
```xml
<mapper namespace="org.acme.FooMapper">
  <cache type="org.mybatis.caches.ignite.IgniteCacheAdapter" />
</mapper>
```
然后在*config/default-config.xml*中配置Ignite缓存（可以简单地参考下[github](https://github.com/mybatis/ignite-cache/tree/master/config)中的配置）。

> 当前的实现中，EvictionPolicy，CacheLoaderFactoryCacheWriterFactory在*config/default-config.xml*中无法启用。

要了解MyBatis缓存特性的更多信息，可以参考[MyBatis手册](http://www.mybatis.org/mybatis-3/sqlmap-xml.html#cache)。
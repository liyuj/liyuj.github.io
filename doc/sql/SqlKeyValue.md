# 10.SQL和键-值API的使用
## 10.1.SQL和键-值API的使用
在Ignite中，即使表/缓存是通过SQL创建和预加载的，也可以同时使用SQL和键-值API访问缓存的数据，这就给用户带来了可以根据业务需要灵活使用两种方式的自由。

本文中，会使用GitHub上的一个[样例工程](https://github.com/dmagda/ignite_world_demo)，演示如何同时使用SQL和键-值API查询集群中的数据。

这个工程创建了包含了世界城市的模式，并且通过脚本注入了数据，然后：

 - 使用SQL查询访问加载的数据；
 - 使用键-值操作访问加载的数据；
 - 处理远程的数据。

### 10.1.1.创建模式并且加载数据
要创建SQL模式以及加载数据，可以看[README.md](https://github.com/dmagda/ignite_world_demo)文件中的说明，通常来说，可以使用`CREATE TABLE`语句来建表。

`CREATE TABLE`语句支持一些额外的参数，可以对底层缓存的属性进行配置，比如，创建`City`表的语句如下：
```sql
CREATE TABLE City (
  ID INT(11),
  Name CHAR(35),
  CountryCode CHAR(3),
  District CHAR(20),
  Population INT(11),
  PRIMARY KEY (ID, CountryCode)
) WITH "template=partitioned, backups=1, affinityKey=CountryCode, CACHE_NAME=City, KEY_TYPE=demo.model.CityKey, VALUE_TYPE=demo.model.City";
```
注意，在语句的后面，通过`KEY_TYPE`和`VALUE_TYPE`分别指定了键类和值类。如果没指定这些参数，Ignite会使用默认的名字创建这些类。

如果想进一步了解与缓存的名字及对应的键是如何生成的更多信息，可以看[CREATE TABLE](/doc/sql/SQLReference.md#_2-2-3-create-table)的文档。
### 10.1.2.使用键-值API
`IgniteCache`接口提供了一组方法，可用于通过键-值API访问缓存。比如，`IgniteCache.get(key)`可以获得指定键对应的值，在下面的示例中，获取了`Amsterdam`记录并更新了`POPULATION`字段，该代码在客户端执行（数据从服务端获得）。
```java
try (Ignite ignite = Ignition.start("config/ignite-config.xml")) {
    IgniteCache<CityKey, City> cityCache = ignite.cache("City");

    CityKey key = new CityKey(5, "NLD");
	
    //getting the city by ID and country code
    City city = cityCache.get(key);
  
    System.out.println(">> Updating Amsterdam record:");
		
    city.setPopulation(city.getPopulation() - 10_000);

    cityCache.put(key, city);

    System.out.println(cityCache.get(key));
}
```
也可以使用`BinaryObjects`访问缓存数据，好处是使用二进制对象避免了反序列化，这对于从一个没有该对象类的服务端访问该对象时非常重要，具体可以看[二进制编组器](/doc/java/#_1-10-二进制编组器)相关章节。
```java
try (Ignite ignite = Ignition.start("config/ignite-config.xml")) {
    IgniteCache<BinaryObject, BinaryObject> cityCacheBinary = ignite.cache(CITY_CACHE_NAME).withKeepBinary();

    BinaryObjectBuilder cityKeyBuilder = ignite.binary().builder("demo.model.CityKey");

    cityKeyBuilder.setField("ID", 5);
    cityKeyBuilder.setField("COUNTRYCODE", "NLD");

    BinaryObject amKey = cityKeyBuilder.build();

    BinaryObject amsterdam = cityCache.get(amKey);
  
    System.out.printf("%1s people live in %2s \n", amsterdam.field("population"), amsterdam.field("name"));
  
    System.out.println(">> Updating Amsterdam record:");
    amsterdam = amsterdam.toBuilder().setField("POPULATION", (int) amsterdam.field("POPULATION") - 10_000).build();
  
    cityCache.put(amKey, amsterdam);
}
```
### 10.1.3.执行SQL查询
下面的示例中，使用`SqlFieldsQuery`对象执行SQL查询并且对结果集进行迭代：
```java
try (Ignite ignite = Ignition.start("config/ignite-config.xml")) {
    IgniteCache cityCache = ignite.cache(CITY_CACHE_NAME);
    IgniteCache countryCache = ignite.cache(COUNTRY_CACHE_NAME);
    IgniteCache languageCache = ignite.cache(COUNTRY_LANGUAGE_CACHE_NAME);
		
    SqlFieldsQuery query = new SqlFieldsQuery(
        "SELECT name, population FROM country " +
        "ORDER BY population DESC LIMIT 10");

    FieldsQueryCursor<List<?>> cursor = countryCache.query(query);

    Iterator<List<?>> iterator = cursor.iterator();

    while (iterator.hasNext()) {
        List row = iterator.next();

        System.out.println("    >>> " + row.get(1) + " people live in " + row.get(0));
    }
}
```
如何进行SQL查询的更多细节，可以看[SQL API](/doc/sql/JavaDeveloperGuide.md#_7-1-sql-api)的文档。
### 10.1.4.执行计算任务
在上例中，更新Amsterdam记录的地方，数据是从服务端节点获取的，如果使用[类同并置](/doc/java/Key-ValueDataGrid.md#_3-7-类同并置)，可以在指定键所在的节点执行自定义业务逻辑，这样就不需要将数据传输到客户端。

::: tip 对等类加载
如果在类同并置中使用自定义的类，然后在服务端节点的类路径中又没有，可以配置`IgniteConfiguration.peerClassLoadingEnabled`属性值为`true`，已开启对等类加载功能。
:::

在下面的示例中，直接在服务端节点更新了Amsterdam记录，注意在`affinityRun()`方法的第二个参数中，需要将国家代码配置为类同键的值。
```java
ignite.compute().affinityRun(CITY_CACHE_NAME, "NLD", new IgniteRunnable() {

    @IgniteInstanceResource
    private Ignite ignite;

    @Override
    public void run() {

        IgniteCache<BinaryObject, BinaryObject> cityCache = ignite.cache(CITY_CACHE_NAME).withKeepBinary();
        //building the key for Amsterdam
        BinaryObject key = ignite.binary().builder("demo.model.CityKey").setField("ID", 5)
                .setField("COUNTRYCODE", "NLD").build();

        BinaryObject city = cityCache.localPeek(key);

        city = city.toBuilder().setField("POPULATION", (int) city.field("POPULATION") - 10_000).build();
        cityCache.put(key, city);
      
        System.out.println(cityCache.localPeek(key));
    }
});
```
本例中，使用了`BinaryObject`，这意味着数据并没有被反序列化为`City`类的对象（因此，这个类文件在服务端节点也不是必需的）。

::: tip 注意
也可以操作`City`类，不使用二进制格式操作缓存，这种情况下，`City`类必须存在于服务端节点的类路径中。
:::
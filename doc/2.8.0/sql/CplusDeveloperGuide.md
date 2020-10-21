# C++开发向导
## 1.SQL API
### 1.1.SqlFieldsQueries
`SqlFieldsQuery`接受一个标准SQL作为其构造器的参数，下面是其执行查询的代码。可以只选定特定的字段，来最小化网络和序列化开销。

<Tabs>
<Tab title="SqlFieldsQuery">

```cpp
using namespace ignite;
using namespace cache;

IgniteConfiguration cfg;
Ignite grid = Ignition::Start(cfg);

Cache<int, Person> cache = grid.GetOrCreateCache<int, Person>("myCache");

SqlFieldsQuery qry(
  "select concat(FirstName, ' ', LastName), Organization.Name "
  "from Person, Organization where "
  "Person.OrgId = Organization.Id and "
  "Person.Salary > ?");

qry.AddArgument(1000);

QueryFieldsCursor cursor = cache.Query(qry);

// Iterate over results.
while (cursor.HasNext())
{
  QueryFieldsRow row = cursor.GetNext();

  std::cout << row.GetNext<std::string>() << " "
            << row.GetNext<std::string>() << std::endl;
}
```
</Tab>

<Tab title="带关联的SqlFieldsQuery">

```cpp
using namespace ignite;
using namespace cache;

IgniteConfiguration cfg;
Ignite grid = Ignition::Start(cfg);

Cache<int, Person> cache = grid.GetOrCreateCache<int, Person>("myCache");

SqlFieldsQuery qry(
  "select Person.name "
  "from Person, \"orgCache\".Organization where "
  "Person.orgId = Organization.id "
  "and Organization.name = ?");

qry.AddArgument("Ignite");

QueryFieldsCursor cursor = cache.Query(qry);

// Iterate over results.
while (cursor.HasNext())
{
  QueryFieldsRow row = cursor.GetNext();

  std::cout << "Person name: " << row.GetNext<std::string>() << std::endl;
}
```
</Tab>

</Tabs>

::: warning 可查询字段定义
在特定字段可以被`SqlFieldsQuery`访问之前，它们应做为SQL模式的一部分，使用标准的DDL命令，或者特定的.NET属性，或者`QueryEntity`配置，都可以进行字段的定义。
:::
通过`SqlFieldsQuery`，还可以使用DML命令进行数据的修改：

<Tabs>
<Tab title="INSERT">

```cpp
cache.Query(SqlFieldsQuery("INSERT INTO Person(id, firstName, "
    "lastName) values (1, 'John', 'Smith'), (5, 'Mary', 'Jones')"));
```
</Tab>

<Tab title="MERGE">

```cpp
cache.Query(SqlFieldsQuery("MERGE INTO Person(id, firstName, lastName)"
    "values (1, 'John', 'Smith'), (5, 'Mary', 'Jones')"));
```
</Tab>

<Tab title="UPDATE">

```cpp
cache.Query(SqlFieldsQuery(
    "UPDATE Person set lastName = 'Jones' WHERE id >= 2");
```
</Tab>

<Tab title="DELETE">

```cpp
cache.Query(SqlFieldsQuery("DELETE FROM Person WHERE id >= 2"));
```
</Tab>

</Tabs>

## 2.模式和索引
除了常规的DDL命令，C++开发者还可以使用特定的SQL API进行模式和索引的定义。
### 2.1.基于QueryEntity的配置
索引和字段可以通过`org.apache.ignite.cache.QueryEntity`进行配置，其使用基于Spring的XML配置，还是很方便的：
```xml
<bean class="org.apache.ignite.configuration.CacheConfiguration">
    <property name="name" value="mycache"/>
    <!-- Configure query entities -->
    <property name="queryEntities">
        <list>
            <bean class="org.apache.ignite.cache.QueryEntity">
                <property name="keyType" value="java.lang.Long"/>
                <property name="valueType" value="Person"/>

                <property name="fields">
                    <map>
                        <entry key="id" value="java.lang.Long"/>
                        <entry key="orgId" value="java.lang.Long"/>
                        <entry key="firstName" value="java.lang.String"/>
                        <entry key="lastName" value="java.lang.String"/>
                        <entry key="resume" value="java.lang.String"/>
                        <entry key="salary" value="java.lang.Double"/>
                    </map>
                </property>

                <property name="indexes">
                    <list>
                        <bean class="org.apache.ignite.cache.QueryIndex">
                            <constructor-arg value="id"/>
                        </bean>
                        <bean class="org.apache.ignite.cache.QueryIndex">
                            <constructor-arg value="orgId"/>
                        </bean>
                        <bean class="org.apache.ignite.cache.QueryIndex">
                            <constructor-arg value="salary"/>
                        </bean>
                    </list>
                </property>
            </bean>
        </list>
    </property>
</bean>
```
::: tip 运行时更新索引和可查询字段
如果需要在运行时管理索引或者使新的字段对SQL引擎可见，可以使用[ALTER TABLE, CREATE/DROP INDEX](/doc/2.8.0/sql/SQLReference.md#_2-数据定义语言（ddl）)命令。
:::
### 2.2.自定义主键
如果主键只使用了预定义的SQL数据类型，则无需使用与模式相关的配置来执行其他操作。
::: tip 预定义SQL数据类型
 - 所有的有符号整形类型；
 - `bool`；
 - `float`；
 - `double`；
 - `std::string`；
 - `ignite::Timestamp`；
 - `ignite::Date`；
 - `ignite::Guid`；
 - `int8_t[]`。
:::
不过一旦决定引入自定义复杂主键并在DML语句中引用其字段，就必须在`QueryEntity`配置中将`QueryField.IsKeyField`设置为`true`。

XML：
```xml
<cacheConfiguration name="cars">
  <queryEntities>
	<queryEntity keyTypeName="CarKey" valueTypeName="Car">
	  <fields>
		<queryField fieldType="System.String" fieldTypeName="java.lang.String" isKeyField="true" name="VIN" />
		<queryField fieldType="System.Int32" fieldTypeName="java.lang.Integer" isKeyField="true" name="Id" />
		<queryField fieldType="System.String" fieldTypeName="java.lang.String" name="Make" />
		<queryField fieldType="System.Int32" fieldTypeName="java.lang.Integer" name="Year" />
	  </fields>
	</queryEntity>
  </queryEntities>
</cacheConfiguration>
```
<RightPane/>
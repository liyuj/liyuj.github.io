# .NET开发向导
## 1.SQL API
C#/.NET开发者可以使用特定的SQL API来查询和修改数据库中的数据。
### 1.1.SqlFieldsQueries
`SqlFieldsQuery`接受一个标准SQL作为其构造器的参数，下面是其执行查询的代码。可以只选定特定的字段，来最小化网络和序列化开销。

SqlFieldsQuery：
```csharp
var cache = ignite.GetOrCreateCache<int, Person>("personCache");

// Execute query to get names of all employees.
var sql = new SqlFieldsQuery(
    "select concat(FirstName, ' ', LastName) from Person as p");

// Iterate over the result set.
foreach (var fields in cache.QueryFields(sql))
    Console.WriteLine("Person Name = {0}", fields[0]);
```
带关联的SqlFieldsQuery：
```csharp
// In this example, suppose Person objects are stored in a
// cache named 'personCache' and Organization objects
// are stored in a cache named 'orgCache'.
var personCache = ignite.GetOrCreateCache<int, Person>("personCache");

// Select with join between Person and Organization to
// get the names of all the employees of a specific organization.
var sql = new SqlFieldsQuery(
    "select p.Name  " +
    "from Person as p, \"orgCache\".Organization as org where " +
    "p.OrgId = org.Id " +
    "and org.Name = ?", "Ignite");

foreach (IList fields in personCache.QueryFields(sql))
    Console.WriteLine("Person Name = {0}", fields[0]);
```
::: warning 可查询字段定义
在特定字段可以被`SqlFieldsQuery`访问之前，它们应做为SQL模式的一部分，使用标准的DDL命令，或者特定的.NET属性，或者`QueryEntity`配置，都可以进行字段的定义。
:::
通过`SqlFieldsQuery`，可以执行后续的DML命令来对数据进行修改：

INSERT：
```csharp
cache.QueryFields(new SqlFieldsQuery("INSERT INTO Person(id, firstName, " +
    "lastName) values (1, 'John', 'Smith'), (5, 'Mary', 'Jones')"));
```
MERGE：
```csharp
cache.QueryFields(new SqlFieldsQuery("MERGE INTO Person(id, firstName, " +
    "lastName) values (1, 'John', 'Smith'), (5, 'Mary', 'Jones')"));
```
UPDATE：
```csharp
cache.QueryFields(new SqlFieldsQuery("UPDATE Person set lastName = ? " +
    "WHERE id >= ?", "Jones", 2L));
```
DELETE：
```csharp
cache.QueryFields(new SqlFieldsQuery("DELETE FROM Person " +
    "WHERE id >= ?", 2));
```
### 1.2.示例
Ignite的二进制包中包含了可以直接运行的`QueryDmlExample`，[源代码](https://github.com/apache/ignite/tree/master/modules/platforms/dotnet/examples/Apache.Ignite.Examples/Datagrid)在这里，该示例演示了上述所有DML操作的用法。
### 1.3.SQL查询问题解决
当SQL查询失败时（查询解析失败或者其他的异常），要看一下`InnerException`属性，它带有从IgniteSQL引擎抛出来的所有错误信息，还有失败的确切原因等详细信息，具体可以看Visual Studio的调试器或者调用异常对象的`ToString()`方法。

![](https://files.readme.io/ac878e6-Screen_Shot_2016-10-31_at_12.19.07_PM.png)

```csharp
try
{
    IQueryCursor<List> cursor = cache.QueryFields(query);
}
catch (IgniteException e)
{
    Console.WriteLine(e.ToString());
}
```
## 2.模式和索引
除了常规的[DDL](/doc/sql/SQLReference.md#_2-数据定义语言（ddl）)命令，C#/.NET开发者还可以使用特定的SQL API来进行模式和索引的定义。
### 2.1.基于属性的配置
可以通过使用`QuerySqlFieldAttribute`和`QueryTextFieldAttribute`标记可缓存类型成员来配置索引。这些类型应传递给`CacheConfiguration(string name, params Type[] queryTypes)`的构造函数或`QueryEntity`的构造函数。
```csharp
var cfg = new IgniteConfiguration
{
    CacheConfiguration = new[]
    {
      	// Configure queries for a cache with Person values (cache keys are not indexed)
        new CacheConfiguration("personCache", typeof(Person)),
      	new CacheConfiguration
        {
            QueryEntities =
            {
            		// Configure indexing for both keys and values
                new QueryEntity(typeof(int), typeof(Company))
            }
        }
    }
};
```
**将字段或属性标记为对SQL查询可见**

要使字段或者属性对于SQL查询可见，需要将它们用`[QuerySqlField]`进行标记，`Age`在SQL中是无法访问的，注意这些属性都是没有索引的。
```csharp
public class Employee
{
    [QuerySqlField]
    public string Name { get; set; }

    [QuerySqlField]
    public long Salary { get; set; }

    public int Age { get; set; }
}
```
**嵌套对象索引**

嵌套对象的属性也可以索引和查询，比如下面的`Person`对象，其有一个`Address`对象作为属性：
```csharp
public class Person
{
  /** Indexed field. Will be visible for SQL engine. */
  [QuerySqlField(IsIndexed = true)]
  private long _id;

  /** Queryable field. Will be visible for SQL engine. */
  [QuerySqlField]
  private string _name;

  /** Will NOT be visible for SQL engine. */
  private int _age;

  /** Indexed field. Will be visible for SQL engine. */
  [QuerySqlField(IsIndexed = true)]
  private Address _address;
}
```
`Address`类的结构如下：
```csharp
public class Address
{
  /** Indexed field. Will be visible for SQL engine. */
  [QuerySqlField(IsIndexed = true)]
  private string _street;

  /** Indexed field. Will be visible for SQL engine. */
  [QuerySqlField(IsIndexed = true)]
  private int _zip;
}
```
上面的代码中，`Address`类中的所有属性都指定了`[QuerySqlField(IsIndexed = true)]`，和`Person`类中的`Address`对象一样。

可以执行的查询如下：
```csharp
var cursor = personCache.QueryFields(new SqlFieldsQuery(
  "select * from Person where street = 'street1'"));
```
注意，不要在SQL查询的WHERE子句中指定`address.street`，这是因为`Address`类的字段会在`Person`表内展开，这样只需要在查询中简单地直接使用`Address`中的字段就可以了。
::: tip 字段名和序列化
带有`[QuerySqlField]`标记的字段或属性会自动添加`QueryField`到相应的`QueryEntity`，因此要确保SQL字段名和序列化的字段名相同。

例如，默认的Ignite反射式序列化器对字段进行操作，如果遵循标准命名约定，则辅助字段名将为`_name`，并且该名称用于序列化。因此必须使用`[QuerySqlField]`标记该字段而非属性，然后在SQL查询中使用`_name`。

不过对于自动属性，它会起作用，因为Ignite可以识别它们并修剪辅助字段说明符。
:::
::: tip 预定义字段
除了标有`[QuerySqlField]`属性的所有字段外，每个表还有两个特殊的预定义字段`_key`和`_val`，它们表示到整个键和值对象的链接。这很有用，例如，当其中一个是基本类型并且希望按其值进行过滤时，类似的查询为：`SELECT * FROM Person WHERE _key = 100`。
:::
**单列索引**

如果不仅仅要让字段可以通过SQL访问，还希望加速查询，那就需要索引该字段的值。如果要创建一个单列索引，需要在该字段上加上`[QuerySqlField(IsIndexed = true)]`属性。
```csharp
public class Employee
{
    // Index in ascending order
    [QuerySqlField(IsIndexed = true)]
    public string Name { get; set; }

    // Index in descending order
    [QuerySqlField(IsIndexed = true, IsDescending = true)]
    public long Salary { get; set; }

    // Enable field in SQL, but don't index
    [QuerySqlField]
    public int Age { get; set; }
}
```
**组合索引**

通过多字段索引可以加速复杂条件的查询，做法是使用`QuerySqlField.IndexGroups`属性。如果希望一个字段参与多个组合索引，也可以将多个组加入`IndexGroups`数组。

比如下面的组合索引示例，有个名为`Age`的属性，它参与了名为`age_salary_idx`的倒序组合索引，在同一个组合索引中，还有一个正序排列的`salary`属性，而在`salary`字段之上，它本身还建了弹列索引。
```csharp
public class Employee
{
    [QuerySqlField(IsIndexed = true, IndexGroups = new[] {"age_salary_idx"}, IsDescending = true)]
    public int Age { get; set; }

    [QuerySqlField(IsIndexed = true, IndexGroups = new[] {"age_salary_idx", "salary_idx"})]
    public long Salary { get; set; }
}
```
::: tip 运行时修改索引和可查询字段
如果需要在运行时管理索引或者使新的字段对SQL引擎可见，可以使用[ALTER TABLE, CREATE/DROP INDEX](/doc/sql/SQLReference.md#_2-数据定义语言（ddl）)命令。
:::
### 2.2.基于QueryEntity的配置
索引和字段也可以通过`Apache.Ignite.Core.Cache.Configuration.QueryEntity`进行配置，通过代码、app.config和Spring配置文件都可以。这个和上面的基于属性的配置是等价的，因为在内部属性最后也会被转换为QueryEntity。

C#：
```csharp
var cfg = new IgniteConfiguration
{
    CacheConfiguration = new[]
    {
        new CacheConfiguration
        {
            QueryEntities = new[]
            {
                new QueryEntity
                {
                    KeyType = typeof(int),
                    ValueType = typeof(Employee),
                    Fields =
                    {
                        new QueryField {Name = "Name", FieldType = typeof(string)},
                        new QueryField {Name = "Salary", FieldType = typeof(long)},
                        new QueryField {Name = "Age", FieldType = typeof(int)}
                    },
                    Indexes =
                    {
                        new QueryIndex("Name"),
                        new QueryIndex
                        {
                            Fields =
                            {
                                new QueryIndexField {Name = "Salary"},
                                new QueryIndexField {Name = "Age", IsDescending = true}
                            },
                            IndexType = QueryIndexType.Sorted,
                            Name = "age_salary_idx"
                        }
                    }
                }
            }
        }
    }
};
```
app.config：
```xml
<cacheConfiguration>
    <queryEntities>
        <queryEntity keyType='System.Int32' valueType='Apache.Ignite.ExamplesDll.Binary.Employee, Apache.Ignite.ExamplesDll'>
            <fields>
                <queryField name='Name' fieldType='System.String' />
                <queryField name='Salary' fieldType='System.Int64' />
                <queryField name='Age' fieldType='System.Int32' />
            </fields>
            <indexes>
                <queryIndex>
                    <fields>
                        <queryIndexField name='Name' />
                    </fields>
                </queryIndex>
                <queryIndex name='age_salary_idx' indexType='Sorted'>
                    <fields>
                        <queryIndexField name='Salary' />
                        <queryIndexField name='Age' isDescending='true' />
                    </fields>
                </queryIndex>
            </indexes>
        </queryEntity>
    </queryEntities>
</cacheConfiguration>
```
Spring XML：
```xml
<bean class="org.apache.ignite.configuration.CacheConfiguration">
    <property name="name" value="mycache"/>
    <!-- Configure query entities -->
    <property name="queryEntities">
        <list>
            <bean class="org.apache.ignite.cache.QueryEntity">
                <property name="keyType" value="Long"/>
                <property name="valueType" value="Employee"/>

                <property name="fields">
                    <map>
                        <entry key="name" value="java.lang.String"/>
                        <entry key="age" value="java.lang.Integer"/>
                        <entry key="salary" value="java.lang.Long "/>
                    </map>
                </property>

                <property name="indexes">
                    <list>
                        <bean class="org.apache.ignite.cache.QueryIndex">
                            <constructor-arg value="name"/>
                        </bean>
                        <!-- Group index. -->
                        <bean class="org.apache.ignite.cache.QueryIndex">
                            <constructor-arg>
                                <list>
                                    <value>age</value>
                                    <value>salary</value>
                                </list>
                            </constructor-arg>
                            <constructor-arg value="SORTED"/>
                        </bean>
                    </list>
                </property>
            </bean>
        </list>
    </property>
</bean>
```
::: tip 运行时修改索引和可查询字段
如果需要在运行时管理索引或者使新的字段对SQL引擎可见，可以使用[ALTER TABLE, CREATE/DROP INDEX](/doc/sql/SQLReference.md#_2-数据定义语言（ddl）)命令。
:::
::: warning 注意
确保在app.config中要使用程序集限定类型名。
:::
**Java类型名映射**

因为SQL查询是在Java中通过H2引擎执行的，Ignite.NET通过`QueryEntity`和`QueryField`中的成对的属性，将.NET类型映射到Java类型。

 - `QueryEntity.KeyType`和`QueryEntity.KeyTypeName`；
 - `QueryEntity.ValueType`和`QueryEntity.ValueTypeName`；
 - `QueryField.FieldType`和`QueryField.FieldTypeName`。

Type属性是.NET类型，TypeName属性是Java类型名，Type属性自动配置TypeName属性，但是反过来不行。

 - 自定义类型通过简称进行映射（不带命名空间的类型名）；
 - 基本类型、String和Guids会映射到对应的Java类型；
 - `DateTime`会被映射到`Timestamp`，查询中使用的所有`DateTime`值必须为UTC时间；
 - `sbyte`、`ushort`、`uint`、`ulong`在Java中不存在，会被使用逐位转换（对于超出范围的值，SQL可能无法按预期方式执行）映射到`byte`、`short`、`int`、`long`。

::: warning DateTime和SQL
`DateTime`可以是本地时间和UTC时间，而Java的`Timestamp`只能是UTC时间。因此，Ignite.NET可以通过两种方式序列化`DateTime`：.NET风格（可以与非UTC值一起使用，在SQL中不起作用）和`Timestamp`风格（向非UTC值抛出异常，在SQL中可以正常工作）。

反射式序列化：用`[QuerySqlField]`标记字段以强制`Timestamp`序列化。

`IBinarizable`：使用`IBinaryWriter.WriteTimestamp`方法。

当无法给字段标记`[QuerySqlField]`或实现`IBinarizable`时，可以使用`IBinarySerializer`方法，具体请参见[序列化](/doc/net/README.md#_11-序列化)。
:::
::: SQL Date函数
日期和时间SQL函数（例如`HOUR`）会根据当前时区生成结果，鉴于其他所有条件均为UTC，这可能会出现意外结果。要为SQL函数强制使用UTC，请使用`-Duser.timezone=UTC`JVM选项（通过IgniteConfiguration.JvmOptions）。
:::
### 2.3.自定义主键
如果主键只使用了预定义的SQL数据类型，则无需使用与模式相关的配置来执行其他操作。
::: tip 预定义SQL数据类型
 - 所有的基本类型（包括可为空的形式），除了`char`；
 - `string`；
 - `decimal`；
 - `byte[]`；
 - `DateTime`；
 - `Guid`。
:::
不过一旦决定引入自定义复杂主键并在DML语句中引用其字段，就必须在`QueryEntity`配置中将`QueryField.IsKeyField`设置为`true`。使用基于属性的配置时，不需要任何额外的步骤，`QueryEntity.KeyType`中所有标有`[QuerySqlField]`的字段将被视为主键字段。当使用手动`QueryEntity`配置时，`IsKeyField`应显式配置。

C#：
```csharp
var cfg = new CacheConfiguration("cars", new QueryEntity
{
	KeyTypeName = "CarKey",
	ValueTypeName = "Car",
	Fields = new[]
	{
		new QueryField("VIN", typeof(string)) {IsKeyField = true},
		new QueryField("Id", typeof(int)) {IsKeyField = true},
		new QueryField("Make", typeof(string)),
		new QueryField("Year", typeof(int))
	}
});
```
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
::: 自动GetHashCode和Equals实现
如果对象可以序列化为二进制形式，则Ignite将在序列化期间计算其哈希值并将其写入最后的二进制数组。此外，Ignite还提供了Equals方法的自定义实现，以满足二进制对象的比较需求。这意味着无需覆盖自定义键和值的`GetHashCode`和`Equals`方法即可在Ignite中使用它们，具体请参见[序列化](/doc/net/README.md#_11-序列化)。
:::
## 3.LINQ
Apache Ignite.NET面向缓存SQL查询为LINQ提供了支持，这样就可以避免处理SQL语法，直接在C#中编写查询。Ignite的LINQ实现支持用于缓存查询的ANSI-99 SQL的所有功能：分布式关联、分组、聚合、字段查询等。
### 3.1.安装
**二进制包**：添加对Apache.Ignite.Linq.dll的引用。

**NuGet**：`Install-Package Apache.Ignite.Linq`。

### 3.2.配置
SQL索引的配置方式应与正常的SQL查询一样，具体请参见[DDL](/doc/sql/SQLReference.md#_2-数据定义语言（ddl）)和[模式和索引](#_2-模式和索引)的相关章节。
### 3.3.用法
`Apache.Ignite.Linq.CacheLinqExtensions`类是LINQ实现的入口。

通过调用缓存的`AsCacheQueryable`方法获取`IQueryable`实例，在其上即可使用LINQ：
```csharp
ICache<EmployeeKey, Employee> employeeCache = ignite.GetCache<EmployeeKey, Employee>(CacheName);

IQueryable<ICacheEntry<EmployeeKey, Employee>> queryable = cache.AsCacheQueryable();

Employee[] interns = queryable.Where(emp => emp.Value.IsIntern).ToArray();
```
::: warning 注意
可以直接在缓存实例上使用LINQ，无需调用`AsCacheQueryable()`。不过这将导致LINQ的Objects查询在本地获取并处理整个缓存数据集，这是非常低效的。
:::
### 3.4.内省
Ignite的LINQ实现在底层使用`ICache.QueryFields`。在具体化语句（ToList、ToArray等）之前，可以在任何时点通过将`IQueryable`强制转换为`ICacheQueryable`来检查生成的`SqlFieldsQuery`：
```csharp
// Create query
var query = ignite.GetCache<EmployeeKey, Employee>(CacheName).AsCacheQueryable().Where(emp => emp.Value.IsIntern);

// Cast to ICacheQueryable
var cacheQueryable = (ICacheQueryable) query;

// Get resulting fields query
SqlFieldsQuery fieldsQuery = cacheQueryable.GetFieldsQuery();

// Examine generated SQL
Console.WriteLine(fieldsQuery.Sql);

// Output: select _T0._key, _T0._val from "persons".Person as _T0 where _T0.IsIntern
```
### 3.5.投影
在`ICacheEntry`上可以进行简单的`WHERE`查询操作，可以选择键、值、或者单独的任何键和值，通过匿名类型也可以选择多个字段。
```csharp
var query = ignite.GetCache<EmployeeKey, Employee>(CacheName).AsCacheQueryable().Where(emp => emp.Value.IsIntern);

IQueryable<EmployeeKey> keys = query.Select(emp => emp.Key);

IQueryable<Employee> values = query.Select(emp => emp.Value);

IQueryable<string> names = values.Select(emp => emp.Name);

var custom = query.Select(emp => new {Id = emp.Key, Name = emp.Value.Name, Age = emp.Value.Age});
```
### 3.6.编译查询
LINQ实现会因表达式解析和SQL生成而导致某些开销，因此可能要为频繁访问的查询消除这个开销。

`Apache.Ignite.Linq.CompiledQuery`类提供了查询的编译以便重用，调用其`Compile`方法可以创建一个新的表示已编译的查询的委托，所有查询参数都应在该委托的参数中。
```csharp
var queryable = ignite.GetCache<EmployeeKey, Employee>(CacheName).AsCacheQueryable();

// Regular query
var persons = queryable.Where(emp => emp.Value.Age > 21);
var result = persons.ToArray();

// Corresponding compiled query
var compiledQuery = CompiledQuery.Compile((int age) => queryable.Where(emp => emp.Value.Age > age));
IQueryCursor<ICacheEntry<EmployeeKey, Employee>> cursor = compiledQuery(21);
result = cursor.ToArray();
```
### 3.7.关联
相同缓存和跨缓存的关联都是可能的，当同一缓存中有多种类型的数据时，将使用相同缓存关联，因此建议为每种数据类型创建单独的缓存。
```csharp
var persons = ignite.GetCache<int, Person>("personCache").AsCacheQueryable();
var orgs = ignite.GetCache<int, Organization>("orgCache").AsCacheQueryable();

// SQL join on Person and Organization to find persons working for Apache
var qry = from person in persons
  				from org in orgs
  				where person.Value.OrgId == org.Value.Id && org.Value.Name == "Apache"
  				select person

foreach (var cacheEntry in qry)
    Console.WriteLine(cacheEntry.Value);

// Same query with method syntax
qry = persons.Join(orgs, person => person.Value.OrgId, org => org.Value.Id, (person, org) => new {person, org}).Where(p => p.org.Name == "Apache").Select(p => p.person);
```
### 3.8.Contains
`ICollection.Contains`是支持的，当希望通过一组id获取数据时这个很有用，比如：
```csharp
var persons = ignite.GetCache<int, Person>("personCache").AsCacheQueryable();
var ids = new int[] {1, 20, 56};

var personsByIds = persons.Where(p => ids.Contains(p.Value.Id));
```
这个会翻译成`... where Id IN (?, ?, ?)`。

不过`IN`不使用索引（见[性能和调试](/doc/sql/Architecture.md#_5-性能和调试)），这个还不能使用编译查询，因为参数数量是可变的，更好的做法是在`ids`集合上使用`Join`。
```csharp
var persons = ignite.GetCache<int, Person>("personCache").AsCacheQueryable();
var ids = new int[] {1, 20, 56};

var personsByIds = persons.Join(ids,
                                person => person.Value.Id,
                                id => id,
                                (person, id) => person);
```
这会翻译成一个临时的表关联：`select _T0._KEY, _T0._VAL from "person".Person as _T0 inner join table (F0 int = ?) _T1 on (_T1.F0 = _T0.ID)`，这会只有一个数组参数，因此计划会被正确地缓存，编译查询也可以使用了。
### 3.9.支持的SQL函数
以下是Ignite LINQ实现支持的.NET函数及其对应的SQL函数列表：

|.NET|SQL|
|---|---|
|`String.Length`|`LENGTH`|
|`String.ToLower`|`LOWER`|
|`String.ToUpper`|`UPPER`|
|`String.StartsWith("foo")`|`LIKE 'foo%'`|
|`String.EndsWith("foo")`|`LIKE '%foo'`|
|`String.Contains("foo")`|`LIKE '%foo%'`|
|`String.IndexOf("abc")`|`INSTR(MyField, 'abc') - 1`|
|`String.IndexOf("abc", 3)`|`INSTR(MyField, 'abc', 3) - 1`|
|`String.Substring("abc", 4)`|`SUBSTRING(MyField, 4 + 1)`|
|`String.Substring("abc", 4, 7)`|`SUBSTRING(MyField, 4 + 1, 7)`|
|`String.Trim()`|`TRIM`|
|`String.TrimStart()`|`LTRIM`|
|`String.TrimEnd()`|`RTRIM`|
|`String.Trim('x')`|`TRIM(MyField, 'x')`|
|`String.TrimStart('x')`|`LTRIM(MyField, 'x')`|
|`String.TrimEnd('x')`|`RTRIM(MyField, 'x')`|
|`String.Replace`|`REPLACE`|
|`String.PadLeft`|`LPAD`|
|`String.PadRight`|`RPAD`|
|`Regex.Replace`|`REGEXP_REPLACE`|
|`Regex.IsMatch`|`REGEXP_LIKE`|
|`Math.Abs`|`ABS`|
|`Math.Acos`|`ACOS`|
|`Math.Asin`|`ASIN`|
|`Math.Atan`|`ATAN`|
|`Math.Atan2`|`ATAN2`|
|`Math.Ceiling`|`CEILING`|
|`Math.Cos`|`COS`|
|`Math.Cosh`|`COSH`|
|`Math.Exp`|`EXP`|
|`Math.Floor`|`FLOOR`|
|`Math.Log`|`LOG`|
|`Math.Log10`|`LOG10`|
|`Math.Pow`|`POWER`|
|`Math.Round`|`ROUND`|
|`Math.Sign`|`SIGN`|
|`Math.Sin`|`SIN`|
|`Math.Sinh`|`SINH`|
|`Math.Sqrt`|`SQRT`|
|`Math.Tan`|`TAN`|
|`Math.Tanh`|`TANH`|
|`Math.Truncate`|`TRUNCATE`|
|`DateTime.Year`|`YEAR`|
|`DateTime.Month`|`MONTH`|
|`DateTime.Day`|`DAY_OF_MONTH`|
|`DateTime.DayOfYear`|`DAY_OF_YEAR`|
|`DateTime.DayOfWeek`|`DAY_OF_WEEK - 1`|
|`DateTime.Hour`|`HOUR`|
|`DateTime.Minute`|`MINUTE`|
|`DateTime.Second`|`SECOND`|

<RightPane/>
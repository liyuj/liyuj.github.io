# Ignite C++
## 1.序列化
### 1.1.BinaryType模板
大多数用户定义的类（包括缓存的键和值）会通过Ignite C++ API传输到其它网格节点。

通过网络传输这些类的对象需要序列化。对于Ignite C++，可以通过为类型限定`BinaryType`类模板来实现：
```cpp
class Address
{
  friend struct ignite::binary::BinaryType<Address>;
public:
  Address() { }

  Address(const std::string& street, int32_t zip) :
  street(street), zip(zip) { }

  const std::string& GetStreet() const
  {
    return street;
  }

  int32_t GetZip() const
  {
    return zip;
  }

private:
  std::string street;
  int32_t zip;
};

template<>
struct ignite::binary::BinaryType<Address>
{
  static int32_t GetTypeId()
  {
    return GetBinaryStringHashCode("Address");
  }

  static void GetTypeName(std::string& name)
  {
    name = "Address";
  }

  static int32_t GetFieldId(const char* name)
  {
    return GetBinaryStringHashCode(name);
  }

  static bool IsNull(const Address& obj)
  {
    return obj.GetZip() && !obj.GetStreet().empty();
  }

  static void GetNull(Address& dst)
  {
    dst = Address();
  }

  static void Write(BinaryWriter& writer, const Address& obj)
  {
    writer.WriteString("street", obj.GetStreet());
    writer.WriteInt32("zip", obj.GetZip());
  }

  static void Read(BinaryReader& reader, Address& dst)
  {
    dst.street = reader.ReadString("street");
    dst.zip = reader.ReadInt32("zip");
  }
};
```
另外也可以使用原始序列化模式，而无需以序列化形式存储对象字段的名称。此模式更紧凑且执行速度更快，但是禁用了要求以序列化形式保留字段名称的SQL查询：
```cpp
template<>
struct ignite::binary::BinaryType<Address>
{
  static int32_t GetTypeId()
  {
    return GetBinaryStringHashCode("Address");
  }

  static void GetTypeName(std::string& name)
  {
    name = "Address";
  }

  static int32_t GetFieldId(const char* name)
  {
    return GetBinaryStringHashCode(name);
  }

  static bool IsNull(const Address& obj)
  {
    return false;
  }

  static void GetNull(Address& dst)
  {
    dst = Address();
  }

  static void Write(BinaryWriter& writer, const Address& obj)
  {
    BinaryRawWriter rawWriter = writer.RawWriter();

    rawWriter.WriteString(obj.GetStreet());
    rawWriter.WriteInt32(obj.GetZip());
  }

  static void Read(BinaryReader& reader, Address& dst)
  {
    BinaryRawReader rawReader = reader.RawReader();

    dst.street = rawReader.ReadString();
    dst.zip = rawReader.ReadInt32();
  }
};
```
### 1.2.序列化宏
Ignite C++定义了一组工具宏，用于简化`BinaryType`限定，下面是这些宏的列表及其描述：

 - `IGNITE_BINARY_TYPE_START(T)`：开始二进制类型限定；
 - `IGNITE_BINARY_TYPE_END`：结束二进制类型限定；
 - `IGNITE_BINARY_GET_TYPE_ID_AS_CONST(id)`：`GetTypeId()`的实现，它会返回预定义常量`id`；
 - `IGNITE_BINARY_GET_TYPE_ID_AS_HASH(T)`：`GetTypeId()`的实现，它会返回传入类型名的哈希值；
 - `IGNITE_BINARY_GET_TYPE_NAME_AS_IS(T)`：`GetTypeName()`的实现，它会返回类型名；
 - `IGNITE_BINARY_GET_FIELD_ID_AS_HASH`：`GetFieldId()`函数的默认实现，它会返回字符串Java模式的哈希值；
 - `IGNITE_BINARY_IS_NULL_FALSE(T)`：`IsNull()`函数的实现，它总是返回`false`；
 - `IGNITE_BINARY_IS_NULL_IF_NULLPTR(T)`：`IsNull()`函数的实现，如果传入对象为`NULL`指针则返回`true`；
 - `IGNITE_BINARY_GET_NULL_DEFAULT_CTOR(T)`：`GetNull()`函数的实现，它会返回一个使用默认构造器创建的实例；
 - `IGNITE_BINARY_GET_NULL_NULLPTR(T)`：`GetNull()`函数的实现，它会返回`NULL`指针；

因此，可以使用以下宏描述上面声明的`Address`类：
```cpp
namespace ignite
{
  namespace binary
  {
    IGNITE_BINARY_TYPE_START(Address)
      IGNITE_BINARY_GET_TYPE_ID_AS_HASH(Address)
      IGNITE_BINARY_GET_TYPE_NAME_AS_IS(Address)
      IGNITE_BINARY_GET_NULL_DEFAULT_CTOR(Address)
      IGNITE_BINARY_GET_FIELD_ID_AS_HASH

      static bool IsNull(const Address& obj)
      {
        return obj.GetZip() == 0 && !obj.GetStreet().empty();
      }

      static void Write(BinaryWriter& writer, const Address& obj)
      {
        writer.WriteString("street", obj.GetStreet());
        writer.WriteInt32("zip", obj.GetZip());
      }

      static void Read(BinaryReader& reader, Address& dst)
      {
        dst.street = reader.ReadString("street");
        dst.zip = reader.ReadInt32("zip");
      }

    IGNITE_BINARY_TYPE_END
  }
}
```
### 1.3.值的读写
数据的读写有几种方法，第一个是直接使用对象的值：

<Tabs>
<Tab title="写">

```cpp
CustomType val;

// some application code here
// ...

writer.WriteObject<CustomType>("field_name", val);
```
</Tab>

<Tab title="读">

```cpp
CustomType val = reader.ReadObject<CustomType>("field_name");
```
</Tab>

</Tabs>

第二种方法是做同样的事，但是使用的是对象的指针：

<Tabs>
<Tab title="写">

```cpp
// Writing null to as a value for integer field.
writer.WriteObject<int32_t*>("int_field_name", nullptr);

// Writing a value of the custom type by pointer.
CustomType *val;

// some application code here
// ...

writer.WriteObject<CustomType*>("field_name", val);
```
</Tab>

<Tab title="读">

```cpp
// Reading value which can be null.
CustomType* nullableVal = reader.ReadObject<CustomType*>("field_name");
if (nullableVal) {
  // ...
}

// You can use a smart pointer as well.
std::unique_ptr<CustomType> nullablePtr = reader.ReadObject<CustomType*>();
if (nullablePtr) {
  // ...
}
```
</Tab>

</Tabs>

基于指针的技术的一个优点是它允许以值的形式对`null`进行读写。
## 2.平台互操作性
### 2.1.概述
当使用Ignite C++时，在集群中C++和Java节点协同工作是很常见的。为了在C++和Java节点之间无缝互操作，以下事项需要考虑。
### 2.2.二进制编组器配置
Ignite的二进制编组器负责集群中的数据、逻辑和消息的序列化和反序列化。由于架构的特殊性，Java和C++节点使用不同的二进制编组器默认配置启动，如果要建立异构集群，则可能导致节点启动过程中的异常，如下面的一个节点：
```
class org.apache.ignite.spi.IgniteSpiException: Local node's
binary configuration is not equal to remote node's binary configuration
[locNodeId=b3f0367d-3c2b-47b4-865f-a62c656b5d3f,
rmtNodeId=556a3f41-eab1-4d9f-b67c-d94d77ddd89d,
locBinaryCfg={globIdMapper=org.apache.ignite.binary.BinaryBasicIdMapper,
compactFooter=false, globSerializer=null}, rmtBinaryCfg=null]
```
为了解决这个异常并让Java和C++节点可以共存于单个集群中，需要将以下的二进制编组器配置添加到Java节点的配置中：
```xml
<?xml version="1.0" encoding="UTF-8"?>

<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
	    ...
        <property name="binaryConfiguration">
            <bean class="org.apache.ignite.configuration.BinaryConfiguration">
                <property name="compactFooter" value="false"/>

                <property name="idMapper">
                    <bean class="org.apache.ignite.binary.BinaryBasicIdMapper">
                        <property name="lowerCase" value="true"/>
                    </bean>
                </property>
            </bean>
        </property>
		...
    </bean>
</beans>
```
### 1.3.基本类型兼容性
C++和Java中的基本类型都可以用在Ignite中。要理解哪种原始C++类型与哪种Java类型相匹配并不容易，反之亦然。为了澄清这一点，可以参考下表：

|Java类型|C++类型|
|---|---|
|`boolean`，`java.lang.Boolean`|`bool`|
|`byte`，`java.lang.Byte`|`int8_t`|
|`short`，`java.lang.Short`|`int16_t`|
|`int`，`java.lang.Integer`|`int32_t`|
|`long`，`java.lang.Long`|`int64_t`|
|`float`，`java.lang.Float`|`float`|
|`double`，`java.lang.Double`|`double`|
|`char`，`java.lang.Character`|`uint16_t`|
|`java.lang.String`|`std::string`，`char[]`|
|`java.util.Date`|`ignite::Date`|
|`java.sql.Time`|`ignite::Time`|
|`java.sql.Timestamp`|`ignite::Timestamp`|
|`java.util.UUID`|`ignite::Guid`|

### 1.4.自定义类型兼容性
为了从Java和C++节点访问同一个对象，在两种语言中应该以相同的方式描述它。这包括相同的类型名、类型ID、字段ID、哈希值算法以及类型的读/写函数。

要在C++中这样做，需要限定`ignite::binary::BinaryType`类型模板。

考虑下面的示例，使一个Java类可以在C++端进行操作：
```java
package org.apache.ignite.examples;

public class CrossClass implements Binarylizable {
    private long id;

    private int idPart;

    public void readBinary(BinaryReader reader) throws BinaryObjectException {
        id = reader.readLong("id");
        idPart = reader.readInt("idPart");
    }

    public void writeBinary(BinaryWriter writer) throws BinaryObjectException {
        writer.writeLong("id", id);
        writer.writeInt("idPart", idPart);
    }
}
```
还需要在C++端定义一个对应的类，如下所示：
```cpp
namespace ignite
{
  namespace binary
  {
    template<>
    struct BinaryType<CrossClass>
    {
      static int32_t GetTypeId()
      {
        return GetBinaryStringHashCode("CrossClass");
      }

      static void GetTypeName(std::string& name)
      {
        name = "CrossClass";
      }

      static int32_t GetFieldId(const char* name)
      {
        return GetBinaryStringHashCode(name);
      }

      static bool IsNull(const CrossClass& obj)
      {
        return false;
      }

      static void GetNull(CrossClass& dst)
      {
        dst = CrossClass();
      }

      static void Read(BinaryReader& reader, CrossClass& dst)
      {
        dst.id = reader.ReadInt64("id");
        dst.idPart = reader.ReadInt32("idPart");
      }

      static void Write(BinaryWriter& writer, const CrossClass& obj)
      {
        writer.WriteInt64("id", obj.id);
        writer.WriteInt32("idPart", obj.idPart);
      }
    };
  }
}
```
最后，在C++端和Java端的Spring配置文件中，还需要在`BinaryConfiguration`中增加如下的配置：
```xml
<?xml version="1.0" encoding="UTF-8"?>

<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
	    ...
        <property name="binaryConfiguration">
            <bean class="org.apache.ignite.configuration.BinaryConfiguration">
                <property name="compactFooter" value="false"/>

                <property name="idMapper">
                    <bean class="org.apache.ignite.binary.BinaryBasicIdMapper">
                        <property name="lowerCase" value="true"/>
                    </bean>
                </property>

                <property name="nameMapper">
                    <bean class="org.apache.ignite.binary.BinaryBasicNameMapper">
                        <property name="simpleName" value="true"/>
                    </bean>
                </property>

                <property name="classNames">
                    <list>
                        <value>org.apache.ignite.examples.CrossClass</value>
                    </list>
                </property>
            </bean>
        </property>
		...
    </bean>
</beans>
```
::: warning 注意
对于计划用于键的类型，以正确的方式实现`GetTypeName()`和`GetTypeId()`方法尤为重要。
:::
::: warning 注意
当属性`lowerCase`被设置为`true`时，C++函数`GetBinaryStringHashCode()`总是计算为`BinaryBasicIdMapper`的哈希。因此，如果要使用这个函数计算C++中的类型ID，那么一定要正确地配置`BinaryBasicIdMapper`。
:::
## 3.对象生命周期
### 3.1.Ignite对象
使用Ignite公共API创建的Ignite对象（如`Ignite`或者`Cache`），是作为内部/底层对象的精简处理器实现的，可以安全快速地复制或按值传递给函数。它也是将Ignite对象从一个函数传递到另一个函数的推荐方法，因为只要存在至少一个处理器对象，底层对象就会存在。
```cpp
// Fast and safe passing of the ignite::Ignite instance to the function.
// Here 'val' points to the same underlying node instance even though
// Ignite object gets copied on call.
// It's guarateed that the underlying object will live as long as 'val'
// object is alive.
void Foo(ignite::Ignite val)
{
  ...
}
```
### 3.2.自定义对象
有时，应用可能需要在Ignite中使用自定义对象，而自定义对象的生命周期在编译时无法轻松确定。例如，在创建`ContinuousQuery`实例时，需要为持续查询提供本地监听器的实例，即`CacheEntryEventListener`。这时，不清楚应该是由Ignite还是应用来负责管理本地监听器的生命周期，并在不再需要时将其释放。

Ignite C++在这一点上非常灵活。它使用`ignite::Reference`类来解决自定义对象的所有权问题。请参考下面的代码，了解如何在实践中使用此类：
```cpp
// Ignite function that takes a value of 'SomeType'.
void Foo(ignite::Reference<SomeType> val);

//...

// Defining an object.
SomeType obj1;

// Passing a simple reference to the function.
// Ignite will not get ownership over the instance.
// The application is responsible for keeping instance alive while
// it's used by Ignite and for releasing it once it is no longer needed.
Foo(ignite::MakeReference(obj1);

// Passing the object by copy.
// Ignite gets a copy of the object instance and manages
// its lifetime by itself.
// 'SomeType' is required to have a copy constructor.
foo(ignite::MakeReferenceFromCopy(obj1);

// Defining another object.
SomeType* obj2 = new SomeType;

// Passing object's ownership to the function.
// Ignite will release the object once it's no longer needed.
// The applicaiton must not use the pointer once it have been passed
// to Ignite as it might be released at any point of time.
foo(ignite::MakeReferenceFromOwningPointer(obj2);

std::shared_ptr<SomeType> obj3 = std::make_shared<SomeType>();

// Passing the object by smart pointer.
// In this case, Reference class behaves just like an underlying
// smart pointer type.
foo(ignite::MakeReferenceFromSmartPointer(obj3);
```

<RightPane/>
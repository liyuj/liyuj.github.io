# 固化内存
## 1.固化内存
Ignite内存平台基于固化内存架构，如果开启了[Ignite原生持久化](/doc/net/Persistence.md#_1-原生持久化)功能，该架构可以同时在内存和磁盘上存储和处理数据及其索引，在保证磁盘持久性和利用整个集群资源的同时，还得到了内存级的性能。

![](https://files.readme.io/bd2d53b-durable-memory.png)

### 1.1.配置
固化内存可以通过代码进行配置，也可以通过配置文件进行配置，下面是相关的配置方法：

<Tabs>
<Tab name="C#">

```csharp
var cfg = new IgniteConfiguration
{
    DataStorageConfiguration = new DataStorageConfiguration
    {
        DefaultDataRegionConfiguration = new DataRegionConfiguration
        {
            Name = "defaultRegion",
            InitialSize = 128 * 1024 * 1024,  // 128 MB,
            MaxSize = 4L * 1024 * 1024 * 1025  // 4 GB
        },
        DataRegionConfigurations = new[]
        {
            new DataRegionConfiguration
            {
                Name = "customRegion",
                InitialSize = 32 * 1024 * 1024,  // 32 MB,
                MaxSize = 512 * 1024 * 1025  // 512 MB
            }
        }
    },
    CacheConfiguration = new[]
    {
        new CacheConfiguration
        {
            Name = "cache1"  // Use default region
        },
        new CacheConfiguration
        {
            Name = "cache2",
            DataRegionName = "customRegion"
        }
    }
};
```
</Tab>
<Tab name="app.config">

```xml
<igniteConfiguration>
  <cacheConfiguration>
    <cacheConfiguration name="cache1" /> <!-- Use default region -->
    <cacheConfiguration dataRegionName="customRegion" name="cache2" />
  </cacheConfiguration>
  <dataStorageConfiguration>
    <dataRegionConfigurations>
      <dataRegionConfiguration initialSize="33554432" maxSize="537395200" name="customRegion" />
    </dataRegionConfigurations>
    <defaultDataRegionConfiguration initialSize="134217728" maxSize="4299161600" name="defaultRegion" />
  </dataStorageConfiguration>
</igniteConfiguration>
```
</Tab>
</Tabs>

更多的内容，请参见[内存配置](/doc/java/DurableMemory.md#_3-内存配置)的相关文档。

<RightPane/>
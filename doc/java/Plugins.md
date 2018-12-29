# 13.插件
## 13.1.插件
### 13.1.1.摘要
Ignite的插件系统可以使第三方扩展Ignite的核心功能，理解Ignite插件工作方式的最佳途径是去看一下Ignite的生命周期插件。
### 13.1.2.插件的配置
每个插件都需要一个`PluginConfiguration`，然后在`IgniteConfiguration.pluginConfigurations`属性中注册，如下所示：

XML：
```xml
<bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
	<!-- Plugin Configuration -->
  <property name="pluginConfigurations">
      <bean class="ignite.myexamples.MyPluginConfiguration"/>
  </property>

  <!--Other Ignite configurations -->
</bean>
```
Java：
```java
IgniteConfiguration cfg = new IgniteConfiguration();

MyPluginConfiguration mpc = new MyPluginConfiguration();

cfg.setPluginConfigurations(mpc);

Ignition.start(cfg);

// Start Ignite node.
Ignite ignite = Ignition.start(cfg);
```
一个`PluginConfiguration`的实现，如下所示：
```java
public class MyPluginConfiguration implements PluginConfiguration {

    // Get and Set some plugin related properties
}
```
这个类可以为空，也可以包括部分插件特有的属性，但是它**必须存在**。
### 13.1.3.插件提供者
`PluginProvider<PluginConfiguration>`实现是新添加的插件的构造器，它在节点启动时创建了插件。这个接口有很多的方法，根据需要可以实现或者置空，但是，`name()`和`plugin()`方法**不能为空**。
```java
public class MyPluginProvider implements PluginProvider<MyPluginConfiguration> {
    @Override
    public String name() {
        return "IGNITE";
    }

    @Override
    public <T extends IgnitePlugin> T plugin() {
        return (T)new MyPlugin();
    }

    @Nullable
    @Override
    public <T> T createComponent(PluginContext pluginContext, Class<T> aClass) {
        return null;
    }

    // Other methods can be no-op
}
```
`PluginProvider<PluginConfiguration>`接口有三个重要的方法：

 - `name()`：插件的名字；
 - `plugin()`：创建插件；
 - `createComponent()`：这个方法用于创建Ignite中的已有组件，比如数据快照、网格安全、节点发现、以及第三方Java API的跨平台支持等。

#### 13.1.3.1.加载插件提供者
Ignite的插件使用JDK的`ServiceLoader`类进行加载，对于要加载的插件构造器，需要在META-INF文件夹中创建一个名为`org.apache.ignite.plugin.PluginProvider`的文件:

![](https://files.readme.io/21c53e4-plugin-provider.png)

然后在该文件中提供插件构造器的实现类：

![](https://files.readme.io/5d1ed7f-plugin-provider-2.png)
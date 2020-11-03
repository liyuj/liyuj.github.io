# 插件
## 1.插件
### 1.1.概述
Ignite的插件系统使得开发者可以扩展Ignite的核心功能。插件可以访问不同的内部Ignite组件，例如安全处理器和其他组件，并且可以扩展Ignite的编程API。

添加自定义插件需要实现`PluginProvider`接口并在节点配置中注册，以下是创建插件所涉及步骤的概述：

 - 实施`PluginProvider`接口，这是创建插件的主要接口；
 - 实现`IgnitePlugin`接口。如果插件添加了要由用户触发的功能，则应向此类添加公共方法。运行时用户可以通过`Ignite.plugin(String pluginName)`使用此类的实例；
 - 通过`IgniteConfiguration.setPluginProviders(…​)`方法以编程方式或通过XML配置方式注册插件；
 - 如果插件具有公共API，在运行时调用`MyPlugin plugin = Ignite.plugin(pluginName)`然后即可执行特定的方法。

以下章节会提供一个插件的示例，并详细介绍插件在Ignite中的工作方式。
### 1.2.插件示例
下面会创建一个简单的Ignite插件，该插件在每个节点上定期向控制台输出有关每个缓存中条目数量的信息。此外，它公开了一个公共方法，用户可以在其应用中根据需要调用该方法，以输出缓存大小信息。该插件具有一个配置参数：输出缓存大小信息的时间间隔。
#### 1.2.1.实现PluginProvider
`PluginProvider`是用于创建Ignite插件的主要接口，Ignite在初始化期间会初始化每个注册的插件实现。

以下方法必须返回非空值，其他方法是可选的。

 - `name()`：返回插件名称；
 - `plugin()`：返回插件类的对象。

下面是一个插件实现的示例代码，其在`initExtensions()`方法中创建了`MyPlugin`类的对象（见下一步），Ignite将`PluginContext`对象作为参数传递给该方法。`PluginContext`可以访问Ignite的API和节点的配置。更多信息将参见[PluginContext](https://ignite.apache.org/releases/2.9.0/javadoc/org/apache/ignite/plugin/PluginContext.html)的javadoc。在本例中，只需将`PluginContext`和时间间隔传递给`MyPlugin`的构造函数。
```java
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.ignite.snippets.plugin;

import java.io.Serializable;
import java.util.UUID;

import org.apache.ignite.IgniteCheckedException;
import org.apache.ignite.cluster.ClusterNode;
import org.apache.ignite.plugin.CachePluginContext;
import org.apache.ignite.plugin.CachePluginProvider;
import org.apache.ignite.plugin.ExtensionRegistry;
import org.apache.ignite.plugin.PluginConfiguration;
import org.apache.ignite.plugin.PluginContext;
import org.apache.ignite.plugin.PluginProvider;
import org.apache.ignite.plugin.PluginValidationException;
import org.jetbrains.annotations.Nullable;

public class MyPluginProvider implements PluginProvider<PluginConfiguration> {

    /**
     * The time interval in seconds for printing cache size information.
     */
    private long interval = 10;

    private MyPlugin plugin;

    public MyPluginProvider() {
    }

    /**
     *
     * @param interval Time interval in seconds
     */
    public MyPluginProvider(long interval) {
        this.interval = interval;
    }

    @Override
    public String name() {
        //the name of the plugin
        return "MyPlugin";
    }

    @Override
    public String version() {
        return "1.0";
    }

    @Override
    public String copyright() {
        return "MyCompany";
    }

    @Override
    public MyPlugin plugin() {
        return plugin;
    }

    @Override
    public void initExtensions(PluginContext ctx, ExtensionRegistry registry)
            throws IgniteCheckedException {
        plugin = new MyPlugin(interval, ctx);
    }

    @Override
    public void onIgniteStart() throws IgniteCheckedException {
        //start the plugin when Ignite is started
        plugin.start();
    }

    @Override
    public void onIgniteStop(boolean cancel) {
        //stop the plugin
        plugin.stop();
    }

    /**
     * The time interval (in seconds) for printing cache size information
     * @return
     */
    public long getInterval() {
        return interval;
    }

    /**
     * Sets the time interval (in seconds) for printing cache size information
     * @param interval
     */
    public void setInterval(long interval) {
        this.interval = interval;
    }

    // other no-op methods of PluginProvider
}
```
其`onIgniteStart()`方法在Ignite启动时调用， 这里通过调用`MyPlugin.start()`启动该插件，该插件只是简单地定期执行输出缓存大小信息的任务。
#### 1.2.2.实现IgnitePlugin
通过`Ignite.plugin(String pluginName)`方法，用户可以获得`PluginProvider`中返回的`IgnitePlugin`实现类。如果想向最终用户提供公共API，则应在实现`IgnitePlugin`的类中公开该API。

严格来说，如果插件未提供公共API，则无需执行此步骤。插件功能可以在`PluginProvider`的实现类中实现和初始化，`PluginProvider.plugin()`方法只返回`IgnitePlugin`接口的空实现即可。

在本案例中，将插件功能封装在`MyPlugin`类中，并提供一个公共方法（`MyPlugin.printCacheInfo()`），该`MyPlugin`实现了`Runnable`接口，其`start()`和`stop()`方法会调度缓存大小信息的输出。
```java
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.ignite.snippets.plugin;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.apache.ignite.IgniteCache;
import org.apache.ignite.plugin.IgnitePlugin;
import org.apache.ignite.plugin.PluginContext;

/**
 *
 * The plugin prints cache size information to console
 *
 */
public class MyPlugin implements IgnitePlugin, Runnable {

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    private PluginContext context;

    private long interval;

    /**
     *
     * @param context
     */
    public MyPlugin(long interval, PluginContext context) {
        this.interval = interval;
        this.context = context;
    }

    private void print0() {
        StringBuilder sb = new StringBuilder("\nCache Information: \n");

        //get the names of all caches
        context.grid().cacheNames().forEach(cacheName -> {
            //get the specific cache
            IgniteCache cache = context.grid().cache(cacheName);
            if (cache != null) {
                sb.append("  cacheName=").append(cacheName).append(", size=").append(cache.size())
                        .append("\n");
            }
        });

        System.out.print(sb.toString());
    }

    /**
     * Prints the information about caches to console.
     */
    public void printCacheInfo() {
        print0();
    }

    @Override
    public void run() {
        print0();
    }

    void start() {
        scheduler.scheduleAtFixedRate(this, interval, interval, TimeUnit.SECONDS);
    }

    void stop() {
        scheduler.shutdownNow();
    }
}
```
#### 1.2.3.注册插件

编程方式：

```java
IgniteConfiguration cfg = new IgniteConfiguration();

//register a plugin that prints the cache size information every 100 seconds
cfg.setPluginProviders(new MyPluginProvider(100));

//start the node
Ignite ignite = Ignition.start(cfg);
```
通过XML配置方式：

编译插件的源代码然后将类文件添加到每个节点的类路径中，然后插件注册方式如下：

```xml
<bean class="org.apache.ignite.configuration.IgniteConfiguration">

    <property name="pluginProviders">
        <bean class="org.apache.ignite.snippets.plugin.MyPluginProvider">
           <property name="interval" value="100"/>
        </bean>
    </property>

</bean>
```
启动节点之后，会在控制台看到如下的信息：
```
[11:00:49] Initial heap size is 248MB (should be no less than 512MB, use -Xms512m -Xmx512m).
[11:00:49] Configured plugins:
[11:00:49]   ^-- MyPlugin 1.0
[11:00:49]   ^-- MyCompany
[11:00:49]
```
#### 1.2.4.运行时访问插件
通过调用`Ignite.plugin(pluginName)`方法可以访问插件的实例，该`pluginName`参数必须等于`MyPluginProvider.name()`中返回的插件名：
```java
//get an instance of the plugin
MyPlugin p = ignite.plugin("MyPlugin");

//print the cache size information
p.printCacheInfo();
```

<RightPane/>
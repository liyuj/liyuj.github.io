# 2.Oracle GoldenGate集成
## 2.1.GoldenGate复制
针对与GoldenGate兼容的所有数据源和GridGain集群之间的数据实时集成和复制问题，GridGain的GoldenGate组件为这个需求提供了一套解决方案。配置好GoldenGate集成复制后，GridGain将自动从GoldenGate数据源中接收更新，同时还会将源数据转换为与GridGain兼容的缓存对象，GoldenGate还通过支持实时数据集成的核心功能实现了高可用性和灾难承受能力，同时保留了性能并确保了可扩展性。

::: tip 兼容性
GridGain兼容于Oracle GoldenGate的11.2及其以后的版本。
这个[页面](http://www.oracle.com/technetwork/middleware/goldengate/certify-100402.html)中包含了Oracle GoldenGate支持的数据源列表。
:::
### 2.1.1.角色
下面是GoldenGate复制过程中的主要角色：`源数据库`、`提取器`、`队列文件`以及`GridGain处理器`（GridGain Java适配器）。

 - `源数据库`：包含源数据的数据库；
 - `提取器`：这个进程运行在源系统上，是GoldenGate的数据捕获机制。它既可以配置为源数据的初始加载，也可以配置为变更数据的增量同步。还可以配置为在支持DDL变更的数据库上传播任何DDL更改；
 - `队列文件`：这是GoldenGate存储于磁盘上的一系列文件，这些文件由提取进程写入和读取，根据配置，这些文件可以位于源系统，也可以位于目标系统。

GoldenGate复制有如下的方案：

在源端复制到GridGain集群：

![](https://files.readme.io/jZaErH6rRuighpdsSa1H_extract.png)

在目标端复制到GridGain集群：

![](https://files.readme.io/o7v7a4T5TXCFfoioo5A5_replicat.png)

### 2.1.2.特性
**批处理**

从源数据库过来的更新可以在不同的模式下执行。如果复制是在`事务`模式下完成的，则更新首先由事务机制累积，然后批量注入缓存中。

**故障转移**

GridGain的处理支持故障转移，如果由于某些原因GoldenGate在处理过程中失败或者复制停止，则GridGain会从最后成功的事务开始重新进行处理。

**冲突解决**

在双活或者多活场景中，多个数据源对缓存中同一个键的更新叫做冲突，为了确保跨越多个数据中心的冲突解决的一致性。
## 2.2.GridGain处理器
GridGain处理器是一个GoldenGate的扩展，它会启动一个GridGain的客户端节点，接收不同的事件，接收从`提取`或者`复制`进程过来的更新信息，对信息进行处理，必要时执行缓存操作，然后回给Oracle GoldenGate一个反馈信息。

从`源数据库`接收的更新将传递给数据源操作处理器，该处理器应由用户实现和设置。GridGain处理程序能处理GridGain集群中的任意缓存。如果更新处理因任何原因（例如网络问题等）失败，则GridGain处理程序返回错误代码，从而在GoldenGate中启动故障转移。

`数据源操作处理器`提供了一组API，进行数据库的关系模型到缓存之间的转换，该API可以访问GridGain的完整API：缓存API、数据流处理、计算操作等等（具体可以看下一章节），还可以进行冲突的解决。

### 2.2.1.GoldenGate的配置
要使用GoldenGate集成组件，GoldenGate需要安装两个组件：

 - C/C++实现的动态链接或者共享库，通过一个C API与Oracle的GoldenGate提取进程集成作为`userexit (UE)`；
 - 一组Java库（jars），它包含了Oracle GoldenGate的Java API，这个Java框架通过Java本地化接口（JNI）与`userexit`进行通信。

::: tip 提示
在下面的页面中，可以了解如何安装这些组件：[Oracle GoldenGate For Java安装](https://docs.oracle.com/cd/E18101_01/doc.1111/e17814.pdf)
:::

要复制的所有模式和表，必要的日志级别要配置好，具体要看应用使用的数据库的文档（比如Oracle，可以看[这里](https://docs.oracle.com/goldengate/1212/gg-winux/GIORA/setup.htm#GIORA364)）。

### 2.2.2.GridGain处理器配置
要安装GridGain处理器，按照如下步骤操作：

1.从[http://www.gridgain.com/download/](http://www.gridgain.com/download/)下载和解压GridGain的安装包；

2.将` integration/gridgain-goldengate`文件夹复制到`GOLDENGATE_ROOT_DIRECTORY`；

::: warning 注意
对于GoldenGate的12.2.X版本，需要使用`integration/gridgain-goldengate-12.2`文件夹，其它与GoldenGate有关的模块，比如Oracle GoldenGate应用适配器，也要是相同的版本-12.2.X。
:::

3.使用`JavaUserExit`配置GoldenGate的`提取器`和`复制`，GridGain处理器是与提取适配器相关的(具体可以看[UserExit属性](https://docs.oracle.com/goldengate/1212/gg-winux/GWURF/gg_parameters.htm#GWURF995))。比如在下面的模式中，事务是在源数据库通过主提取进程捕获的，它会将数据写入GoldenGate的队列文件。然后会使用数据泵技术将事务发送给队列，队列会由提取适配器读取；

dirprm/gridgain.prm：
```
# Extractor name.
EXTRACT GRIDGAIN
# Path to property file for `GridGain Handler`.
SETENV ( GGS_USEREXIT_CONF = "dirprm/gridgain.props")
# Credentials for database.
USERID username, PASSWORD password
CUSEREXIT libggjava_ue.so CUSEREXIT INCLUDEUPDATEBEFORES, PASSTHRU
NOCOMPRESSUPDATES
SOURCEDEFS dirdef/per.def
TABLE *;
```
4.实现GridGain的处理器然后复制包含该处理器的jar到`GOLDENGATE_ROOT_DIRECTORY/gridgain-goldengate`文件夹；

5.在属性文件中配置GridGain的处理器，其中还应该有GridGain的XML配置文件的路径，该Spring上下文中应该包含前述步骤中实现的bean；

文本：
```properties
# Handler name.
gg.handlerlist=gridgain

# Handler class name.
gg.handler.gridgain.type=org.gridgain.oracle.goldengate.GridGainHandler
# Path to GridGain configuration file. See XML tab.
gg.handler.gridgain.configurationPath=dirprm/gridgain-configuration.xml
# GoldenGate Handler bean name.
gg.handler.gridgain.operationHandlerBeanName=personOpHandler

# GoldenGate settings 
gg.report.time=30sec
gg.classpath=gridgain-goldengate/*

javawriter.stats.full=TRUE
javawriter.stats.display=TRUE
javawriter.bootoptions=-Xmx1024m -Xms1024m -Djava.class.path=ggjava/ggjava.jar:gg-lib/log4j.xml
```
XML：
```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">
    <bean id="personOpHandler" name="personOpHandler" class="org.gridgain.oracle.goldengate.handler.PersonOperationHandler"/>

    <bean id="ignite.cfg" class="org.apache.ignite.configuration.IgniteConfiguration">
        <property name="localHost" value="127.0.0.1"/>

        <property name="cacheConfiguration">
            <list>
                <bean class="org.apache.ignite.configuration.CacheConfiguration">
                    <property name="name" value="person"/>
                    <property name="atomicityMode" value="ATOMIC"/>
                    <property name="backups" value="1"/>
                </bean>
                <bean class="org.apache.ignite.configuration.CacheConfiguration">
                    <property name="name" value="address"/>
                    <property name="atomicityMode" value="TRANSACTIONAL"/>
                    <property name="backups" value="1"/>
                </bean>
            </list>
        </property>
    </bean>
</beans>
```
GridGain处理器有如下的属性：

|属性|描述|默认值|
|---|---|---|
|`type`|GridGain处理器的主类，此值必须有下一个值：`org.gridgain.oracle.GridGainHandler`|无|
|`configurationPath`|GridGain XML配置文件的路径，该文件中必须有由`operationHandlerBeanName`属性命名的bean|无|
|`mode`|操作模式。可用值为：`op`、`tx`、`meta`和`all`|`op`|
|`operationHandlerBeanName`|GridGain处理器bean的名字，该bean必须在XML配置文件中存在，必须实现`DataSourceOperationHandler`接口|无|

## 2.3.数据源操作处理器
`DataSourceOperationHandler`接口可以将从`数据源`过来的更新转换为对应的缓存对象，并且执行缓存操作，`DataSourceOperationHandler`接口应该由开发者实现。

```java
/**
 * An function that allows applications to perform operations on updates from 
 * DataBase and store they to cache. The callback will be invoked on each 
 * operations such as insert, update, delete rows and etc.
 */
public interface DataSourceOperationHandler {
    /**
     * Init method. This method will be invoked before the handler starts 
     * to receive updates from database.
     *
     * @param ignite Ignite instance.
     */
    public void init(Ignite ignite);

    /**
     * Handle single operation update. This method invoked when 
     * {@link GridGainHandler#setMode(String)} in "op" mode.
     *
     * @param dsOp An operation on a data source, containing the current 
     *      column values (after the operation occurred) and optionally 
     *      the "before" values (before the operation occurred). An operation
     *      can in general be a database operation such as 
     *      insert/update/delete or a primary-key update.
     * @param opCtx Operation context contains information about operations.
     */
    public void handleOperation(DsOperation dsOp, OperationContext opCtx);

    /**
     * Handle transaction update. This method invoked when 
     * {@link GridGainHandler#setMode(String)} in "tx" mode.
     *
     * @param tx Data source transaction. This object contains info about 
     *      whole transaction: changed rows, value, type and etc.
     * @param opCtx Operation context contains information about operations.
     */
    public void handleTransaction(DsTransaction tx, OperationContext opCtx);
}
```
`init`方法会在处理器开始接收来自源数据库的更新之前被调用，这个好位置可以用于创建缓存、检查配置等。对于来自数据库的每个更新，GridGain处理器会调用`handleOperation`或者`handleTransaction`方法，如果处理器工作于`tx`模式，`handleTransaction`方法会被调用，否则会调用`handleOperation`方法。这些方法的实现可以使用任何Ignite的API：缓存操作、计算、消息等等，下面是一个伪代码实现的示例：
```java
/**
 * The class transforms updates (id, name and salary columns)
 * to Person cache value and save it to cluster.
 */
public class PersonOperationHandler implements DataSourceOperationHandler {
    /** Column name that contains "Name". */
    public static final String NAME_COL = "name";

    /** Column name that contains "Salary". */
    public static final String SALARY_COL = "salary";

    /** Ignite instance. */
    private Ignite ignite;

    /** Cache person. */
    private IgniteCache<Integer, Person> cache;

    /** {@inheritDoc} */
    @Override public void init(Ignite ignite) {
        this.ignite = ignite;

        cache = ignite.cache("persons");
    }

    /** {@inheritDoc} */
    @Override public void handleOperation(DsOperation dsOp, OperationContext opCtx) {
        handle(dsOp, opCtx);
    }

    /** {@inheritDoc} */
    @Override public void handleTransaction(DsTransaction tx, OperationContext opCtx) {
        try (Transaction igniteTx = ignite.transactions().txStart()) {
            for (DsOperation op : tx.getOperations())
                handle(op, opCtx);

            igniteTx.commit();
        }
    }

    /**
     * The methods convert data from database to {@code Person} object and performs cache operation.
     *
     * @param dsOp An operation on a data source, containing the 
     *      current column values (after the operation occurred)
     *      and optionally the "before" values (before the operation occurred). 
     *      An operation can in general be a database operation such as 
     *      insert/update/delete or a primary-key update.
     * @param opCtx Operation context contains information about operations.
     */
    private void handle(DsOperation dsOp, OperationContext opCtx) {
        TableMetaData tableMeta = opCtx.getMetaData()
            .getTableMetaData(dsOp.getTableName());

        Op op = new Op(dsOp, tableMeta,  opCtx.getConfiguration());

        DsColumn id = op.getColumn(tableMeta
            .getColumnMetaData(new ColumnName("id")).getIndex());

        if (id == null || id.getAfterValue() == null)
            throw new NullPointerException("Column id doesn't exist! Id: " + id + ".");

        int key = Integer.valueOf(id.getBeforeValue());

        if (op.getOpType().isDelete())
            cache.remove(key);
        else if (op.getOpType().isInsert()) {
            String name = null;
            Double salary = null;

            DsColumn nameCol = op.getColumn(tableMeta.getColumnMetaData(new ColumnName(NAME_COL))
                .getIndex());
            DsColumn salaryCol = op.getColumn(tableMeta.getColumnMetaData(new ColumnName(SALARY_COL))
                .getIndex());

            if (!nameCol.isMissing())
                name = nameCol.getAfterValue();

            if (!salaryCol.isMissing())
                salary = Double.valueOf(salaryCol.getAfterValue());

            cache.put(key, new Person(key, name, salary));
        }
        else {
            String name = null;
            Double salary = null;

            DsColumn nameCol = op.getColumn(tableMeta.getColumnMetaData(new ColumnName(NAME_COL))
                .getIndex());
            DsColumn salaryCol = op.getColumn(tableMeta.getColumnMetaData(new ColumnName(SALARY_COL))
                .getIndex());

            if (!nameCol.isMissing())
                name = nameCol.getAfterValue();

            if (!salaryCol.isMissing())
                salary = Double.valueOf(salaryCol.getAfterValue());

            cache.invoke(key, new PersonUpdater(name, salary));
        }
    }

    /**
     * The class updates person.
     */
    public static final class PersonUpdater implements CacheEntryProcessor<Integer, Person, Void> {
        /** */
        private String name;

        /** */
        private Double salary;

        /**
         * @param name Name.
         * @param salary Salary.
         */
        public PersonUpdater(String name, Double salary) {
            this.name = name;
            this.salary = salary;
        }

        /** {@inheritDoc} */
        @Override public Void process(MutableEntry<Integer, Person> entry, Object... arguments)
            throws EntryProcessorException {
            String oldName = entry.getValue() != null ? entry.getValue().name() : null;
            double oldSalary = entry.getValue() != null ? entry.getValue().salary() : 0;

            Person p = new Person(
                entry.getKey(),
                name != null ? name : oldName,
                salary != null ? salary : oldSalary
            );

            entry.setValue(p);

            return null;
        }
    }
}
```
该处理器需要在Spring XML配置文件中进行配置，它会启动GridGain的处理器。
```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">
    <bean id="personOperationHandler" name="personOperationHandler"
      class="org.gridgain.oracle.goldengate.PersonOperationHandler"/>

    <bean class="org.apache.ignite.configuration.IgniteConfiguration">
      ...
    </bean>
</beans>
```
在`dirprm/gridgain.props`属性文件中，需要为GridGain的处理器配置`theoperationHandlerBeanName`属性。

dirprm/gridgain.props：
```properties
gg.handlerlist=gridgain

gg.handler.gridgain.operationHandlerBeanName=personOperationHandler

...
```
## 2.4.GoldenGate冲突解决
当通过GoldenGate和GridGain缓存API更新缓存时，可以选择继续更新、保留旧值或通过合并旧值和新值生成其他值。为了实现这一点，GridGain提供了冲突解决方案。

要对缓存操作和数据流处理使用冲突解决机制，需要使用`GridGain.cache(String cacheName, byte dataCenterId)`和`GridGain.dataStreamer(String cacheName, byte dataCenterId)`方法。它预计数据中心ID对于参与数据中心复制的所有拓扑都是唯一的，对于属于给定拓扑的所有节点也是唯一的。

缓存：
```java
// Get GridGain plugin.
GridGain gridGain = ignite.plugin(GridGain.PLUGIN_NAME);

// Get "Person" cache with given data center id.
IgniteCache cache = gridGain.cache("Person", 31);

...

/**
 * Conflict resolver for Person entity. In conflicts always used an entry 
 * with data center id equals 31.
 */
public class PersonConflictResolver implements CacheConflictResolver<Integer, Person> {
    /** {@inheritDoc} */
    @Override public void resolve(CacheConflictContext<Integer, Person> ctx) {
        // If we
        if (oldEntry.dataCenterId() == 31)
            ctx.useOld();
        else if (newEntry.dataCenterId() == 31)
            ctx.useNew();
    }
}
```
数据流处理：
```java
// Get GridGain plugin.
GridGain gridGain = ignite.plugin(GridGain.PLUGIN_NAME);

// Get Data Streamer for cache with given data center id.
IgniteDataStreamer cache = gridGain.dataStreamer("Person", 31);

...
  
/**
 * Conflict resolver for Person entity. In conflicts always used an entry 
 * with data center id equals 31.
 */
public class PersonConflictResolver implements CacheConflictResolver<Integer, Person> {
    /** {@inheritDoc} */
    @Override public void resolve(CacheConflictContext<Integer, Person> ctx) {
        // If we
        if (oldEntry.dataCenterId() == 31)
            ctx.useOld();
        else if (newEntry.dataCenterId() == 31)
            ctx.useNew();
    }
}
```
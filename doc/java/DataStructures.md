# Ignite分布式数据结构
## 1.队列和集合
### 1.1.概述
Ignite除了提供了标准的键-值的类似于Map的存储以外，也提供了一个快速的分布式阻塞队列和分布式集合的实现。

`IgniteQueue`和`IgniteSet`分别是`java.util.concurrent.BlockingQueue`和`java.util.Set`接口的实现，也支持`java.util.Collection`接口的所有功能，这两个实现既可以以并置模式也可以以非并置模式创建。

下面是一个如何创建分布式队列和集合的例子：

<Tabs>
<Tab title="队列">

```java
Ignite ignite = Ignition.ignite();

IgniteQueue<String> queue = ignite.queue(
    "queueName", // Queue name.
    0,           // Queue capacity. 0 for unbounded queue.
    new CollectionConfiguration() // Collection configuration.
);
```
</Tab>

<Tab title="集合">

```java
Ignite ignite = Ignition.ignite();

IgniteSet<String> set = ignite.set(
    "setName", // Set name.
    new CollectionConfiguration() // Collection configuration.
);
```
</Tab>

</Tabs>

### 1.2.并置和非并置模式
如果只打算创建包含大量数据的几个Queue或者Set，那么应该以非并置模式创建，这会确保每个集群节点存储每个队列或者集合大体均等的一部分。另一方面，如果打算持有很多的队列或者集合，而大小又相对较小（和整个缓存比），那么以并置模式创建它们是更合理的。这个模式下所有的队列和集合元素都会存储在同一个集群节点上，但是每个节点会被赋予均等的队列或者集合数量。

非并置模式只对`分区`缓存才有意义，也只有`分区`缓存才支持。

一个并置模式的队列或者集合可以通过`CollectionConfiguration`的`collocated`属性来创建，像下面这样：

<Tabs>
<Tab title="队列">

```java
Ignite ignite = Ignition.ignite();

CollectionConfiguration colCfg = new CollectionConfiguration();

colCfg.setCollocated(true);

// Create collocated queue.
IgniteQueue<String> queue = ignite.queue("queueName", 0, colCfg);
```
</Tab>

<Tab title="集合">

```java
Ignite ignite = Ignition.ignite();

CollectionConfiguration colCfg = new CollectionConfiguration();

colCfg.setCollocated(true);

// Create collocated set.
IgniteSet<String> set = ignite.set("setName", colCfg);
```
</Tab>
</Tabs>

### 1.3.缓存队列和负载平衡
特定的元素会留在队列中直到被读取，以及没有两个节点会从队列中得到同一个元素。在Ignite中缓存队列会被用做一个备用的工作以及负载平衡的方式。

比如，可以简单地将一个计算，比如一个`IgniteRunnable`的实例加入队列，然后远程节点上有线程来调用`IgniteQueue.take()`方法，如果队列为空就会阻塞，如果`take()`方法返回一个作业，一个线程会处理它然后再次调用`take()`方法来获取下一个作业。通过这个方式，远程节点的线程只有在前一个作业完成之后才会开启下一个作业，因此创建一个理想的平衡系统，即每个节点只领取它能处理的作业数量，而不是更多。
### 1.4.集合配置
Ignite的集合可以通过`CollectionConfiguration`的API进行配置（可以看上面的例子），可以选择下面的参数进行配置：

|setter方法|描述|默认值|
|---|---|---|
|`setCollocated(boolean)`|设置并置模式|false|
|`setCacheMode(CacheMode)`|设置底层缓存模式（PARTITIONED, REPLICATED 或者LOCAL）|PARTITIONED|
|`setAtomicityMode(CacheAtomicityMode)`|设置底层缓存原子化模式（ATOMIC或者TRANSACTIONAL）|ATOMIC|
|`setMemoryMode(CacheMemoryMode)`|设置底层缓存存储模式（ONHEAP_TIERED, OFFHEAP_TIERED或者OFFHEAP_VALUES）|ONHEAP_TIERED|
|`setOffHeapMaxMemory(long)`|设置堆外存储最大内存大小|0，无限制|
|`setBackups(int)`|设置备份数量|0|
|`setNodeFilter(IgnitePredicate<ClusterNode>`)|设置可选的谓词，该谓词可以指定其存储在哪些节点上|无|

## 2.原子类型
### 2.1.概述
Ignite支持分布式的原子类型*long*和*reference*，分别类似于`java.util.concurrent.atomic.AtomicLong`和`java.util.concurrent.atomic.AtomicReference`。

Ignite的原子性是跨集群分布式的，从根本上支持了对全局可见的数值的原子性操作（比如增量-获取或者比较-赋值）。比如，可以更新一个节点上的原子性的long类型值，然后从另一个节点读取。

**特性**

 - 获取当前值
 - 原子化修改当前值
 - 原子化地对当前值进行增量或者减量
 - 原子化地和新值进行比较以及设置新值

分布式原子化的long和reference可以分别通过`IgniteAtomicLong`和`IgniteAtomicReference`获得，如下：

<Tabs>
<Tab title="AtomicLong">

```java
Ignite ignite = Ignition.ignite();

IgniteAtomicLong atomicLong = ignite.atomicLong(
    "atomicName", // Atomic long name.
    0,            // Initial value.
    false         // Create if it does not exist.
)
```
</Tab>

<Tab title="AtomicReference">

```java
Ignite ignite = Ignition.ignite();

// Create an AtomicReference.
IgniteAtomicReference<Boolean> ref = ignite.atomicReference(
    "refName",  // Reference name.
    "someVal",  // Initial value for atomic reference.
    true        // Create if it does not exist.
);
```
</Tab>
</Tabs>

通过`IgniteAtomicLong`和`IgniteAtomicReference`提供的所有原子性操作都是同步的，一个原子性操作花费的时间依赖于与同一个原子性long类型的实例执行并发操作的节点数量，操作的强度以及网络的延时。
### 2.2.原子性配置
Ignite的原子化可以通过`IgniteConfiguration`的`atomicConfiguration`属性进行配置，有如下的配置参数可选：

|setter方法|描述|默认值|
|---|---|---|
|`setBackups(int)`|设置备份的数量|0|
|`setCacheMode(CacheMode)`|为所有的原子类型设置缓存模式|`分区模式`|
|`setAtomicSequenceReserveSize(int)`|设置为`IgniteAtomicSequence`接口预留的序列值的数量|1000|

## 3.CountDownLatch
如果熟悉关于单一JVM内多线程间同步的`java.util.concurrent.CountDownLatch`,Ignite也提供了支持跨集群节点类似行为的`IgniteCountDownLatch`。

Ignite中的CountDownLatch可以用如下方式创建：
```java
Ignite ignite = Ignition.ignite();

IgniteCountDownLatch latch = ignite.countDownLatch(
    "latchName", // Latch name.
    10,          // Initial count.
    false        // Auto remove, when counter has reached zero.
    true         // Create if it does not exist.
);
```
上述代码执行之后，指定缓存的所有节点将能够同步以`latchName`为名的锁。下面就是这个同步机制的示例：
```java
Ignite ignite = Ignition.ignite();

final IgniteCountDownLatch latch = ignite.countDownLatch("latchName", 10, false, true);

// Execute jobs.
for (int i = 0; i < 10; i++)
    // Execute a job on some remote cluster node.
    ignite.compute().run(() -> {
        int newCnt = latch.countDown();

        System.out.println("Counted down: newCnt=" + newCnt);
    });

// Wait for all jobs to complete.
latch.await();
```
## 4.ID生成器
### 4.1.概述
`IgniteCacheAtomicSequence`接口提供的分布式原子性序列类似于分布式原子性的long类型，但是它的值只能增长。它也支持预留一定范围的序列值，来避免每次一个序列必须提供下一个值时导致的昂贵的网络消耗以及缓存更新。也就是，当在一个原子性序列上执行了`incrementAndGet()`（或者任何其它的原子性操作），数据结构会往前预留一定范围的序列值，它会保证对于这个序列实例来说跨集群的唯一性。

下面的例子显示了如何创建原子性序列：
```java
Ignite ignite = Ignition.ignite();

IgniteAtomicSequence seq = ignite.atomicSequence(
    "seqName", // Sequence name.
    0,       // Initial value for sequence.
    true     // Create if it does not exist.
);
```
下面是一个简单的示例：
```java
Ignite ignite = Ignition.ignite();

// Initialize atomic sequence.
final IgniteAtomicSequence seq = ignite.atomicSequence("seqName", 0, true);

// Increment atomic sequence.
for (int i = 0; i < 20; i++) {
  long currentValue = seq.get();
  long newValue = seq.incrementAndGet();

  ...
}
```
### 4.2.序列预留大小
`IgniteAtomicSequence`的关键参数是`atomicSequenceReserveSize`,它是每个节点序列值的预留数量。当一个节点试图获得`IgniteAtomicSequence`的实例时，一定数量的序列值会为该节点预留，然后随之而来的序列增量会在本地发生而不需要与其它节点通信，直到下一个预留操作发生。

`atomicSequenceReserveSize`的默认值是`1000`，这个默认值可以通过`AtomicConfiguration`的`atomicSequenceReserveSize`属性进行修改。
## 5.Semaphore（信号量）
Ignite的分布式Semaphore的实现和行为类似于众所周知的`java.util.concurrent.Semaphore`。和任何其它的Semaphore一样，它维护了一个许可的集合，通过`acquire()`方法获得许可，通过`release()`方法释放许可，相对应的可以限制对一些逻辑或者物理资源的访问或者同步执行流程，唯一不同的是Ignite的Semaphone不仅仅在单一JVM的范围内具有这些行为，而是一个跨越多个远程节点的集群的范围。

要使用分布式的Semaphore，可以用下面的方式进行创建：
```java
Ignite ignite = Ignition.ignite();

IgniteSemaphore semaphore = ignite.semaphore(
    "semName", // Distributed semaphore name.
    20,        // Number of permits.
    true,      // Release acquired permits if node, that owned them, left topology.
    true       // Create if it doesn't exist.
);
```
创建Semaphore之后，就可以被多个集群节点并发地访问，来实现一些分布式的逻辑或者限制对一些分布式资源的访问，比如下面的示例：
```java
Ignite ignite = Ignition.ignite();

IgniteSemaphore semaphore = ignite.semaphore(
    "semName", // Distributed semaphore name.
    20,        // Number of permits.
    true,      // Release acquired permits if node, that owned them, left topology.
    true       // Create if it doesn't exist.
);

// Acquires a permit, blocking until it's available.
semaphore.acquire();

try {
    // Semaphore permit is acquired. Execute a distributed task.
    ignite.compute().run(() -> {
        System.out.println("Executed on:" + ignite.cluster().localNode().id());

        // Additional logic.
    });
}
finally {
    // Releases a permit, returning it to the semaphore.
    semaphore.release();
}
```

<RightPane/>
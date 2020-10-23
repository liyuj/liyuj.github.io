# Ignite分布式锁
## 1.概述
Ignite事务会隐式获得分布式锁，但是有的场景可能需要显式获得锁。`IgniteCache`API的`lock()`方法会返回`java.util.concurrent.locks.Lock`的实例，其可以获得指定键的显式分布式锁，通过`IgniteCache.lockAll()`方法，也可以在一个集合对象上获得锁。

```java
IgniteCache<String, Integer> cache = ignite.cache("myCache");

// Create a lock for the given key
Lock lock = cache.lock("keyLock");
try {
    // Acquire the lock
    lock.lock();

    cache.put("Hello", 11);
    cache.put("World", 22);
}
finally {
    // Release the lock
    lock.unlock();
}
```
::: tip 原子化模式
Ignite中，只有在`TRANSACTIONAL`原子化模式中才支持锁，它可以通过`CacheConfiguration`的`atomicityMode`属性进行配置。
:::
## 2.锁和事务
显式锁是非事务性的，不能在事务中使用（会抛出异常）。如果确实需要在事务中使用显式锁，那么需要使用事务的`TransactionConcurrency.PESSIMISTIC`并发控制，它会为相关的缓存数据获得显式锁。

<RightPane/>
# 计算网格
## 1.计算网格
分布式计算通过并行执行来获得**高性能**、**低延迟**和**线性扩展性**。Ignite的计算网格通过一组简单的API，支持在集群中的多台计算机上执行分布式计算和数据处理。

![](https://files.readme.io/kFOguSuNQNWCEnyUECLi_in_memory_compute.png)

### 1.1.ICompute
`ICompute`接口提供了在整个集群或集群组中的节点上运行多种类型计算的方法，这些方法可以以分布式方式执行任务或闭包。

只要有一个节点在线，就可以[保证执行](#_5-容错)所有的作业和闭包。如果作业由于资源不足而无法执行，则将由故障转移机制处理。在发生故障时，负载平衡器将选择下一个可用节点来执行作业。下面是获取`IgniteCompute`实例的方法：
```csharp
IIgnite ignite = Ignition.Start();

// Get compute instance over all nodes in the cluster.
ICompute compute = ignite.GetCompute();
IIgnite ignite = Ignition.Start();

// Get compute instance over all nodes in the cluster.
ICompute compute = ignite.GetCompute();
```
还可以将计算的范围限制为[集群组](/doc/net/Clustering.md#_2-集群组)，这时计算将仅在集群组内的节点上执行。
```csharp
IIgnite ignite = Ignition.Start();

// Limit computations only to remote nodes (exclude local node).
ICompute compute = ignite.GetCluster().ForRemotes().GetCompute();
IIgnite ignite = Ignition.Start();

// Limit computations only to remote nodes (exclude local node).
ICompute compute = ignite.GetCluster().ForRemotes().GetCompute();
```
## 2.分布式闭包
Ignite.NET计算网格可以在整个集群或者集群组中广播以及负载平衡任何闭包代码。

### 2.1.Broadcast方法
所有的`Broadcast(...)`方法都会将指定的作业广播给整个集群或者集群组。
```csharp
void Broadcast()
{
    using (var ignite = Ignition.Start())
    {
        var compute = ignite.GetCluster().ForRemotes().GetCompute();

        compute.Broadcast(new HelloAction());

        // Async mode
        compute.BroadcastAsync(new HelloAction())
            .ContinueWith(t => Console.WriteLine("Finished sending broadcast job."));
    }
}

[Serializable]
class HelloAction : IComputeAction
{
    public void Invoke()
    {
        Console.WriteLine("Hello World!");
    }
}
```
### 2.2.Call、Run和Apply方法
所有的`Call(...)`（无参数函数）、`Run(...)`（无动作）和`Apply(...)`（有参数函数）方法，都可以在整个集群或者集群组上，执行单个作业或者一组作业。
```csharp
async void Compute()
{
    using (var ignite = Ignition.Start())
    {
        var funcs = "Count characters using compute func".Split(' ')
          .Select(word => new ComputeFunc { Word = word });

        ICollection<int> res = ignite.GetCompute().Call(funcs);

      	// Async mode
      	res = await ignite.GetCompute().CallAsync(funcs);

        var sum = res.Sum();

        Console.WriteLine(">>> Total number of characters in the phrase is '{0}'.", sum);
    }
}

[Serializable]
class ComputeFunc : IComputeFunc<int>
{
    public string Word { get; set; }

    public int Invoke()
    {
        return Word.Length;
    }
}
```

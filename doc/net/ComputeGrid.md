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
## 3.MapReduce和ForkJoin
`IComputeTask`是Ignite.NET对内存MapReduce的简化抽象，它也非常类似于ForkJoin范式。纯粹的MapReduce并不是为了高性能而设计，仅仅是做离线批量数据处理（例如Hadoop中的MapReduce）时才能更好地发挥作用。不过当对内存中的数据进行计算时，实时低延迟和高吞吐量通常具有最高优先级，同样，API的简单性也变得非常重要，因此Ignite引入了`IComputeTask`API，它是一种轻量级的MapReduce（或ForkJoin）实现。
::: tip 提示
如果需要对作业到节点的映射或故障转移逻辑进行细粒度控制，才推荐`IComputeTask`。其他情况都应该使用更简单的闭包执行，具体细节请参见[分布式闭包](#_2-分布式闭包)的相关章节。
:::

### 3.1.IComputeTask
`IComputeTask<,,>`定义了要在集群上执行的作业，以及这些作业到节点的映射，它还定义了如何处理（汇总）作业的结果，而开发者应该实现`IComputeTask`接口的的`Map(...)`和`Reduce(...)`方法。

通过在`IComputeTask`接口上实现2或3个方法来定义任务：

**Map方法**

`Map(...)`方法会对作业进行实例化并将其映射到工作节点。该方法接收运行任务的节点集合以及任务的参数，并返回一个映射，其中作业为键，映射的工作节点为值，然后将作业发送到映射的节点并在其中执行。
::: tip 提示
下面的[ComputeTaskSplitAdapter](#_3-2-2-computetasksplitadapter)有`Map(...)`方法的简化实现。
:::

**OnResult方法**

`OnResult(...)`方法在作业执行完成时都会被调用。它接收该作业返回的结果，以及到目前为止收到的所有作业结果的列表。该方法应返回一个`ComputeJobResultPolicy`实例，指示下一步要执行的操作：

 - `Wait`：等待所有剩余作业完成（如果有）；
 - `Reduce`：立即进入汇总步骤，丢弃所有剩余的作业以及尚未收到的结果；
 - `Failover`：将作业转移到另一个节点（请参见[容错](#_4-容错)），所有接收到的作业结果在`reduce(...)`方法中仍然有效。

**Reduce方法**

`Reduce(...)`方法在所有作业都已完成（或从该`OnResult(...)`方法返回了`Reduce`策略）的汇总步骤被调用。该方法将接收所有完成的结果列表，并返回计算的最终结果。

### 3.2.计算任务适配器
不是每次定义并行计算时都需要实现`IComputeTask`API的所有3种方法，有一些功能增强的类，开发者只需要实现一小段具体的业务逻辑，而将其余的部分留给Ignite自动处理。

#### 3.2.1.ComputeTaskAdapter
`ComputeTaskAdapter`定义了`OnResult(...)`方法的默认实现，如果作业抛出异常，则该方法返回`Failover`策略，否则返回`Wait`策略，从而等待所有作业完成。

#### 3.2.2.ComputeTaskSplitAdapter
`ComputeTaskSplitAdapter`扩展了`ComputeTaskAdapter`并添加了自动将作业分配给节点的功能。它隐藏了`Map(...)`方法，并添加了一个新的`Split(...)`方法，在该方法中，开发者仅需提供要执行的作业的集合即可（这些作业到节点的映射将由适配器以负载平衡的方式自动进行处理）。

该适配器在同质化环境中特别有用，这时所有节点都同样适合执行作业，因此映射步骤可以隐式完成。

### 3.3.IComputeJob
任务产生的所有作业都是`IComputeJob`接口的实现。其`Execute()`方法定义了具体的业务逻辑，并应返回作业结果。其`Cancel()`方法定义了作业被放弃（例如任务决定立即执行汇总或者取消）时所要执行的业务逻辑。

**ComputeJobAdapter**

简化适配器，提供了无任何操作的`Cancel()`方法实现。

### 3.4.示例
下面是`IComputeTask`和`IComputeJob`实现的示例：

ComputeTaskSplitAdapter：
```csharp
void CountChars()
{
    using (var ignite = Ignition.Start())
    {
        int charCount = ignite.GetCompute().Execute(new CharCountTask(), "Hello Grid Enabled World!");

        Console.WriteLine(">>> Total number of characters in the phrase is " + charCount);
    }
}

class CharCountTask : ComputeTaskSplitAdapter<string, int, int>
{
    public override int Reduce(IList<IComputeJobResult<int>> results)
    {
        return results.Sum(res => res.Data);
    }

    protected override ICollection<IComputeJob<int>> Split(int gridSize, string arg)
    {
        // 1. Splits the received string into words
        // 2. Creates a job for each word
        return arg.Split(' ').Select(word => new CharCountJob {Word = word}).ToList<IComputeJob<int>>();
    }
}

class CharCountJob : ComputeJobAdapter<int>
{
    public string Word { get; set; }

    public override int Execute()
    {
        return Word.Length;
    }
}
```
ComputeTaskAdapter：
```csharp
void CountChars()
{
    using (var ignite = Ignition.Start())
    {
        int charCount = ignite.GetCompute().Execute(new CharCountTask(), "Hello Grid Enabled World!");

        Console.WriteLine(">>> Total number of characters in the phrase is " + charCount);
    }
}

class CharCountTask : ComputeTaskAdapter<string, int, int>
{
    public override IDictionary<IComputeJob<int>, IClusterNode> Map(IList<IClusterNode> subgrid, string arg)
    {
        int nodeIdx = 0;

        // 1. Splits the received string into words
        // 2. Creates a job for each word
        // 3. Distributes created jobs between nodes for processing.
        return arg.Split(' ').Select(word => (IComputeJob<int>) new CharCountJob {Word = word}).ToDictionary(job => job, job => subgrid[nodeIdx++ % subgrid.Count]);
    }

    public override int Reduce(IList<IComputeJobResult<int>> results)
    {
        return results.Sum(res => res.Data);
    }
}

private class CharCountJob : ComputeJobAdapter<int>
{
    public string Word { get; set; }

    public override int Execute()
    {
        return Word.Length;
    }
}
```

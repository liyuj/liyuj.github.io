# 15.机器学习网格
## 15.1.机器学习网格
### 15.1.1.概述
Ignite的机器学习（ML）是一组简单的、可扩展以及高效的工具，在不需要成本高昂的数据转换的前提下，就可以构建可预测的机器学习模型。

将机器和深度学习加入Ignite的原理是很简单的，当前，如果要想让机器学习成为主流，数据科学家要解决两个主要的问题：

 - 首先，模型是在不同的系统中训练和部署（训练结束之后）的，数据科学家需要等待ETL或者其它的数据传输过程，来将数据移至比如Apache Mahout或者Apache Spark这样的系统进行训练，然后还要等待这个过程结束并且将模型部署到生产环境。在系统间移动TB级的数据可能花费数小时的时间，此外，训练部分通常发生在旧的数据集上；
 - 第二个问题和扩展性有关。机器学习和深度学习需要处理的数据量不断增长，已经无法放在单一的服务器上。这促使数据科学家要么提出更复杂的解决方案，要么切换到比如Spark或者TensorFlow这样的分布式计算平台上。但是这些平台通常只能解决模型训练的一部分问题，这给开发者之后的生产部署带来了很多的困难。
![](https://files.readme.io/6def194-machine_learning-2.png)

**无ETL和大规模可扩展性**

Ignite的机器学习依赖于Ignite基于内存的存储，这给机器学习和深度学习任务带来了大规模的扩展性，并且取消了在不同系统间进行ETL产生的等待。比如，在Ignite集群的内存和磁盘中存储的数据上，开发者可以直接进行深度学习和机器学习的训练和推理，然后，Ignite提供了一系列的机器学习和深度学习算法，对Ignite的分布式并置处理进行优化，这样在处理大规模的数据集或者不断增长的输入数据流时，这样的实现提供了内存级的速度和近乎无限的扩展性，而不需要将数据移到另外的存储。通过消除数据的移动以及长时间的处理等待，Ignite的机器学习可以持续地进行学习，可以在最新数据到来之时实时地对决策进行改进。

**容错和持续学习**

Ignite的机器学习能够对节点的故障容错。这意味着如果在学习期间节点出现故障，所有的恢复过程对用户是透明的，学习过程不会被中断，就像所有节点都正常那样获得结果。
### 15.1.2.算法和适用领域

**分类**

根据训练的数据集，对标的的种类进行标识。

*适用领域*：垃圾邮件检测、图像识别、信用评分、疾病识别。

*算法*：支持向量机（SVM）、最近邻、决策树分类和神经网络。

**回归**

对因变量y与一个或多个解释变量（或自变量）x之间的关系进行建模。

*适用领域*：药物反应，股票价格，超市收入。

*算法*：线性回归、决策树回归、最近邻和神经网络。

**聚类**

对对象进行分组的方式，即在同一个组（叫做簇）中的对象（某种意义上）比其它簇中的对象更相似。

*适用领域*：客户细分、实验结果分组、购物项目分组。

*算法*：K均值

**预处理**

特征提取和归一化。

*适用领域*：对比如文本这样的输入数据进行转换，以便用于机器学习算法，然后提取需要拟合的特征，对数据进行归一化。

*算法*：Ignite的机器学习支持使用分区化的数据集自定义预处理，同时也有默认的预处理器。

### 15.1.3.入门
机器学习入门的最快方式是构建和运行示例代码，学习它的输出和代码，机器学习的的示例代码位于Ignite发行版的`examples`文件夹中。

下面是相关的步骤：

 1. 下载Ignite的2.4及以后的版本；
 2. 在比如IntelliJ IDEA或者Eclipse这样的IDE中打开`examples`工程；
 3. 在IDE中打开`src/main/java/org/apache/ignite/examples/ml`文件夹然后运行ML或者DL的示例。

这些示例不需要特别的配置，所有的ML或者DL示例在没有人为干预的情况下，都可以正常地启动、运行、停止，然后在控制台中输出有意义的信息。另外，还支持一个跟踪器API示例，它会启动一个Web浏览器然后生成一些HTML输出。

**通过Maven获取**

在工程中像下面这样添加Maven依赖后，就可以使用Ignite提供的机器学习功能：
```xml
<dependency>
    <groupId>org.apache.ignite</groupId>
    <artifactId>ignite-ml</artifactId>
    <version>${ignite.version}</version>
</dependency
```
将`${ignite-version}`替换为实际使用的Ignite版本。

**从源代码构建**

Ignite机器学习最新版的jar包已经上传到Maven仓库，如果需要获取该jar包然后部署到特定的环境中，那么要么从Maven仓库中进行下载，或者从源代码进行构建，如果要从源代码进行构建，按照如下步骤进行操作：

 - 下载Ignite最新发行版的源代码；
 - 清空Maven的本地仓库（这个是避免旧版本的可能影响）；
 - 从工程的根目录构建并安装Ignite；
```bash
mvn clean install -DskipTests -Dmaven.javadoc.skip=true
```
 - 在本地仓库的`{user_dir}/.m2/repository/org/apache/ignite/ignite-ml/{ignite-version}/ignite-ml-{ignite-version}.jar`中找到机器学习的jar包；
 - 如果要从源代码构建ML或者DL的示例，执行如下的命令：
```bash
cd examples
mvn clean package -DskipTests
```
如果必要，可以参考项目根目录的`DEVNOTES.txt`文件以及`ignite-ml`模块的`README`文件，以了解更多的信息。
## 15.2.预处理
### 15.2.1.概述
预处理是将存储于Ignite中的原始数据转换为特征向量，以便于机器学习流水线的进一步使用。

本节介绍用于处理特征的算法，大致分为以下几组：

 - 从“原始”数据中提取特征
 - 缩放特性
 - 转换特性
 - 修改特性

注意：通常它从标签和特征提取开始，并且可以与其它预处理阶段兼容。
### 15.2.2.归一化预处理器
通常的流程是从Ignite数据中提取特征，转换特征，然后对其进行归一化。训练器API允许以以下方式组成转换器：
```java
// Define feature extractor.
IgniteBiFunction<Integer, double[], double[]> extractor = (k, v) -> v;

// Define feature transformer on top of extractor.
IgniteBiFunction<Integer, double[], double[]> extractorTransformer =
    extractor.andThen(v -> transform(v));

// Define feature normalizer on top of transformer and extractor.
IgniteBiFunction<Integer, double[], double[]> extractorTransformerNormalizer =
    normalizationTrainer.fit(ignite, upstreamCache, transformer);
```
除了可以自定义预处理器之外，Ignite还提供了一个内置的归一化预处理器，它会根据如下的函数对间隔的[0,1]进行归一化。

![](https://files.readme.io/ae0ef26-CodeCogsEqn_2.gif)

为了归一化，需要创建一个`NormalizationTrainer`，然后将其与归一化预处理器进行匹配：
```java
// Create normalization trainer.
NormalizationTrainer<Integer, double[]> normalizationTrainer =
    new NormalizationTrainer<>();

// Train normalization preprocessor.
IgniteBiFunction<Integer, double[], double[]> preprocessor =
    normalizationTrainer.fit(
        ignite,
        upstreamCache,
        (k, pnt) -> pnt.coordinates
    );

// Create linear regression trainer.
LinearRegressionLSQRTrainer trainer = new LinearRegressionLSQRTrainer();

// Train model.
LinearRegressionModel mdl = trainer.fit(
    ignite,
    upstreamCache,
    preprocessor,
    (k, pnt) -> pnt.label
);

// Make a prediction.
double prediction = mdl.apply(preprocessor.apply(coordinates));
```
### 15.2.3.示例
要了解归一化预处理器在实践中是如何使用的，可以看这个[示例](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/ml/preprocessing/NormalizationExample.java)，该示例也会随着每个Ignite发行版进行发布。
### 15.2.4.二值化预处理器
二值化是将数值特征阈值化为二元（0/1）特征的过程。大于阈值的特征值被二值化为1.0，等于或小于阈值的值被二值化为0.0。

它只包含一个重要参数，即阈值。
```java
// Create binarization trainer.
BinarizationTrainer<Integer, double[]> binarizationTrainer=
    new BinarizationTrainer<>().withThreshold(10);

// Train binarization preprocessor.
IgniteBiFunction<Integer, double[], double[]> preprocessor =
    binarizationTrainer.fit(
        ignite,
        upstreamCache,
        (k, pnt) -> pnt.coordinates
    );
```
要了解二值化预处理器在实践中如何使用，可以尝试这个[示例](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/ml/preprocessing/BinarizationExample.java)。
### 15.2.5.填补预处理器
填补预处理器是使用缺失值所在的列的平均值或其它统计信息来填补数据集中的缺失值。缺失的值应该表示为Double类型的NaN，输入数据集列应该是Double。目前，填补预处理器不支持分类特性，并且可能为包含分类特性的列创建不正确的值。

在训练阶段，填补训练器收集关于预处理数据集的统计数据，在预处理阶段，它根据收集的统计数据修改数据。

填补训练器只包含一个参数：imputingStgy，它的类型为`ImputingStrategy`枚举，有两个可用值（注意：将来的版本可能支持更多值）：

 - `MEAN`：默认策略。如果选择此策略，则使用沿轴的数字特征的平均值替换缺失的值；
 - `MOST_FREQUENT`：如果选择此策略，则使用沿轴最频繁的值替换缺失的值。

```java
// Create imputer trainer.
ImputerTrainer<Integer, double[]> imputerTrainer=
    new ImputerTrainer<>().withImputingStrategy(ImputingStrategy.MOST_FREQUENT);

// Train imputer preprocessor.
IgniteBiFunction<Integer, double[], double[]> preprocessor =
    imputerTrainer.fit(
        ignite,
        upstreamCache,
        (k, pnt) -> pnt.coordinates
    );
```
如果要了解填补预处理器在实践中是如何使用的，可以尝试这两个示例：[示例1](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/ml/preprocessing/ImputingExample.java)和[示例2](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/ml/preprocessing/ImputingWithMostFrequentValuesExample.java)。
### 15.2.6.独热编码器预处理器
独热编码将分类特征，表示为标签索引（双精度值或字符串值）映射到二元向量，该二元向量最多只有一个值，该值表示来自所有特征值集合中的特定特征值的抽象。

该预处理器可以转换多个列，其中在训练过程中处理索引。可以通过`.withEncodedFeature(featureIndex)`调用定义这些索引。

注意：

 - 每个独热编码的二元向量将其单元添加到当前特征向量的末尾；
 - 这个预处理器总是为NULL值创建单独的列；
 - 与NULL相关联的索引值将根据NULL值的频率位于二元向量中。

在训练阶段，`StringEncoderPreprocessor`和`OneHotEncoderPreprocessor`使用相同的`EncoderTraining`来收集关于分类特征的数据，为了用独热编码预处理器对数据集进行预处理，需要将`encoderType`配置为`EncoderType.ONE_HOT_ENCODER`，如下面的代码片段所示：
```java
IgniteBiFunction<Integer, Object[], Vector> oneHotEncoderPreprocessor = new EncoderTrainer<Integer, Object[]>()
   .withEncoderType(EncoderType.ONE_HOT_ENCODER)
   .withEncodedFeature(0)
   .withEncodedFeature(1)
   .withEncodedFeature(4)
   .fit(ignite,
       dataCache,
       featureExtractor
);
```
### 15.2.7.字符串编码器预处理器
字符串编码器将字符串值（分类）编码为范围[0.0，amountOfCategories]中的Double类型值，其中最流行的值将显示为0.0，最不流行的值将显示为amountOfCategories-1值。

该预处理器可以转换多个列，其中在训练过程中处理索引。可以通过`.withEncodedFeature(featureIndex)`调用定义这些索引。

注意：它不添加新列，而是直接修改数据。

**示例**

假定有下面的数据集，有id和category两个特征列：

|Id|Category|
|---|---|
|0|a|
|1|b|
|2|c|
|3|a|
|4|a|
|5|c|

|Id|Category|
|---|---|
|0|0.0|
|1|2.0|
|2|1.0|
|3|0.0|
|4|0.0|
|5|1.0|

`a`的索引值为0，因为它是最频繁的，随后是`c`，索引值为1，然后`b`是2。

注意：就如何处理不可见标签而言，当使用StringEncoder给一个数据集编码然后用它又去转换另一个数据集时，只有一个策略：将不可见标签放入一个特殊的附加桶中，索引值等于`amountOfCategories`。

在训练阶段，`StringEncoderPreprocessor`和`OneHotEncoderPreprocessor`使用相同的`EncoderTraning`来收集与分类特征有关的数据。要使用`StringEncoderPreprocessor`对数据集进行预处理，需要将`encoderType`配置为`EncoderType.STRING_ENCODER`，如下面的代码片段所示：
```java
IgniteBiFunction<Integer, Object[], Vector> strEncoderPreprocessor = new EncoderTrainer<Integer, Object[]>()
   .withEncoderType(EncoderType.STRING_ENCODER)
   .withEncodedFeature(1)
   .withEncodedFeature(4)
   .fit(ignite,
       dataCache,
       featureExtractor
);
```
如果要了解字符串编码预处理器在实践中如何使用，可以尝试这个[示例](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/ml/tutorial/Step_3_Categorial.java)。
### 15.2.8.最小最大值缩放预处理器
最小最大值缩放转换给定的数据集，将每个特性重新缩放到特定的范围。

从数学的角度来看，它是将如下函数应用于数据集中的每个元素：

![](https://files.readme.io/dbce0e5-latex_4571634fc5b6f3963c454daf08c15d06.png)

对于所有`i`，其中`i`是许多列，`max_i`是这个列中最大元素的值，`min_i`是这个列中最小元素的值。

`MinMaxScalerTrainer`计算数据集上的汇总统计数据，并生成`MinMaxScalerPreprocessor`，然后该预处理器可以单独地转换每个特征，使得其在给定范围内。

要了解这个预处理器在实践中是如何使用的，可以尝试这个[示例](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/ml/preprocessing/MinMaxScalerExample.java)。
### 15.2.9.最大绝对值缩放预处理器
最大绝对值缩放预处理器转换给定的数据集，通过除以每个特征中的最大绝对值，将每个特征重新调整到范围[-1，1]。

注意：它不会移动/居中数据，因此不会破坏任何稀疏性。

从数学的角度来看，它是将如下函数应用于数据集中的每个元素：

![](https://files.readme.io/67cae68-latex_456308c3d327d05e9b04dbe040a61bda.png)

对于所有`i`，其中`i`是一些列，`maxabs_i`是这个列中绝对值最大的元素的值。

`MaxAbsScalerTrainer`计算数据集上的汇总统计数据，并生成`MaxAbsScalerPreprocessor`。

要了解这个预处理器在实践中是如何使用的，可以尝试这个[示例](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/ml/preprocessing/MaxAbsScalerExample.java)。
## 15.3.分区化的数据集
### 15.3.1.概述
分区化的数据集是在Ignite的计算和存储能力之上构建的抽象层，可以在遵循无ETL和容错的原则下，进行算法运算。

分区化的数据集的主要原理是Ignite的[计算网格](/doc/java/ComputeGrid.md#_7-1-计算网格)实现的经典[MapReduce](https://en.wikipedia.org/wiki/MapReduce)范式。

MapReduce的主要优势在于，可以在分布于整个集群的数据上进行计算，而不需要大量的网络数据移动，这个想法通过如下方式对应于分区化的数据集：

 - 每个数据集都是分区的；
 - 分区在每个节点的本地，持有持久化的训练上下文以及可恢复的训练数据；
 - 在一个数据集上执行的计算，会被拆分为*Map*操作和*Reduce*操作，Map操作负责在每个分区上执行运算，而Reduce操作会将Map操作的结果汇总为最终的结果。

**训练上下文（分区上下文）** 是Ignite分区中的持久化部分，因此在分区化的数据集关闭之前，对应于这部分的变更都会被一直维护，训练上下文不用担心节点故障，但是需要额外的时间进行读写，因此只有在无法使用分区数据的时候才使用它。

**训练数据（分区数据）** 是分区的一部分，可以在任何时候从上游数据以及上下文中恢复，因此没必要在持久化存储中维护分区数据，而是在每个节点的本地存储（堆内、堆外甚至GPU存储）中持有，如果节点故障，可以从其它节点的上游数据以及上下文中恢复。

为什么选择分区而不是节点作为数据集和学习的构建单元呢？

Ignite中的一个基本思想是，分区是原子化的，这意味着分区无法在多个节点上进行拆分（具体可以看`分区和复制`相关的章节）。在再平衡或者节点故障的情况下，分区在其它节点恢复时，数据和它在原来节点时保持一致。

而在机器学习算法中，这很重要，因为大多数机器学习算法是迭代的，并且需要在迭代之间保持一定的上下文，该上下文无法被拆分或者合并，并且应该在整个学习期间保持一致的状态。
### 15.3.2.使用
要构造一个分区化的数据集，可以这么做：

 - 有一个上游的数据源，可以是Ignite的缓存或者仅仅是一个数据的Map；
 - 分区上下文生成器，它定义了如何从对应于该分区的上游数据构建分区上下文；
 - 分区数据生成器，它定义了如何从对应于该分区的上游数据构建分区数据；

基于缓存的数据集：
```java
Dataset<MyPartitionContext, MyPartitionData> dataset =
    new CacheBasedDatasetBuilder<>(
        ignite,                            // Upstream Data Source
        upstreamCache
    ).build(
        new MyPartitionContextBuilder<>(), // Training Context Builder
        new MyPartitionDataBuilder<>()     // Training Data Builder
    );
```
本地数据集：
```java
Dataset<MyPartitionContext, MyPartitionData> dataset =
    new LocalDatasetBuilder<>(
        upstreamMap,                       // Upstream Data Source
        10
    ).build(
        new MyPartitionContextBuilder<>(), // Partition Context Builder
        new MyPartitionDataBuilder<>()     // Partition Data Builder
    );
```
之后就可以在这个数据集上通过MapReduce的方式执行各种计算了。
```java
int numerOfRows = dataset.compute(
    (partitionData, partitionIdx) -> partitionData.getRows(),
    (a, b) -> a == null ? b : a + b
);
```
最后，所有的计算完成后，注意一定要关闭数据集和释放资源。
```java
dataset.close();
```
### 15.3.3.示例
要了解分区化的数据集在实践中是如何使用的，可以看这个[示例](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/ml/dataset/AlgorithmSpecificDatasetExample.java)，该实例也会随着每个Ignite发行版进行发布。
## 15.4.线性回归
### 15.4.1.概述
Ignite支持普通最小二乘线性回归算法，这是最基本也是最强大的机器学习算法之一，本文会说明该算法的工作方式以及Ignite是如何实现的。

线性回归算法的基本原理是，假定因变量y和自变量x有如下的关系：
![](https://files.readme.io/58d1de5-111.gif)
注意，后续的文档中会使用向量x和b的点积，并且明确地避免使用常数项，当向量x由一个等于1的值补充时，在数学上是正确的。

如果向量b已知，上面的假设可以基于特征向量x进行预测，它反映在Ignite中负责预测的`LinearRegressionModel`类中。
### 15.4.2.模型
线性回归的模型表示为`LinearRegressionModel`类，它能够对给定的特征向量进行预测，如下：
```java
LinearRegressionModel model = ...;
double prediction = model.predict(observation);
```
模型是完全独立的对象，训练之后可以被保存、序列化以及恢复。
### 15.4.3.训练器
线性回归是一种监督学习算法，这意味着为了找到参数（向量b），需要在训练数据集上进行训练，并且使损失函数最小化。

![](https://files.readme.io/b20f1ce-222.gif)

Ignite支持两种线性回归训练器，基于LSQR算法的训练器以及另一个基于随机梯度下降法的训练器。

**LSQR训练器**

LSQR算法是为线性方程组找到大的、稀疏的最小二乘解，Ignite实现了这个算法的分布式版本。

基于缓存的数据集：
```java
// Create linear regression trainer.
LinearRegressionLSQRTrainer trainer = new LinearRegressionLSQRTrainer();

// Train model.
LinearRegressionModel mdl = trainer.fit(
    ignite,
    upstreamCache,
    (k, pnt) -> pnt.coordinates,
    (k, pnt) -> pnt.label
);

// Make a prediction.
double prediction = mdl.apply(coordinates);
```
本地数据集：
```java
// Create linear regression trainer.
LinearRegressionLSQRTrainer trainer = new LinearRegressionLSQRTrainer();

// Train model.
LinearRegressionModel mdl = trainer.fit(
    upstreamMap,
    10,          // Number of partitions.
    (k, pnt) -> pnt.coordinates,
    (k, pnt) -> pnt.label
);

// Make a prediction.
double prediction = mdl.apply(coordinates);
```

**SGD训练器**

另一个线性回归训练器会使用随机梯度下降法来寻找损失函数的最小值。该训练器的配置类似于多层感知训练器的配置，可以指定更新类型（`Nesterov`的SGD，RProp）、最大迭代次数、批量大小、局部迭代次数和种子。

基于缓存的数据集：
```java
// Create linear regression trainer.
LinearRegressionSGDTrainer<?> trainer = new LinearRegressionSGDTrainer<>(
    new UpdatesStrategy<>(
        new RPropUpdateCalculator(),
        RPropParameterUpdate::sumLocal,
        RPropParameterUpdate::avg
    ),
    100000,  // Max iterations.
    10,      // Batch size.
    100,     // Local iterations.
    123L     // Random seed.
);

// Train model.
LinearRegressionModel mdl = trainer.fit(
    ignite,
    upstreamCache,
    (k, pnt) -> pnt.coordinates,
    (k, pnt) -> pnt.label
);

// Make a prediction.
double prediction = mdl.apply(coordinates);
```
本地数据集：
```java
// Create linear regression trainer.
LinearRegressionSGDTrainer<?> trainer = new LinearRegressionSGDTrainer<>(
    new UpdatesStrategy<>(
        new RPropUpdateCalculator(),
        RPropParameterUpdate::sumLocal,
        RPropParameterUpdate::avg
    ),
    100000,  // Max iterations.
    10,      // Batch size.
    100,     // Local iterations.
    123L     // Random seed.
);

// Train model.
LinearRegressionModel mdl = trainer.fit(
    upstreamMap,
    10,          // Number of partitions.
    (k, pnt) -> pnt.coordinates,
    (k, pnt) -> pnt.label
);

// Make a prediction.
double prediction = mdl.apply(coordinates);
```
### 15.4.4.示例
要了解线性回归在实践中是如何使用的，可以看这个[示例](https://github.com/apache/ignite/tree/master/examples/src/main/java/org/apache/ignite/examples/ml/regression/linear)，该实例也会随着每个Ignite发行版进行发布。
## 15.5.K-均值聚类
在Ignite的机器学习组件中，提供了一个K-均值聚类算法的实现。
### 15.5.1.模型
K-均值聚类的目标是，将n个待观测值分为k个簇，这里每个观测值和所属的簇都有最近的均值，这被称为簇的原型。

该模型持有一个k中心向量以及距离指标，这些由比如欧几里得、海明或曼哈顿这样的机器学习框架提供。

通过如下的方式，可以预测给定的特征向量：
```java
MeansModel mdl = ...;

double prediction = model.predict(observation);
```
### 15.5.2.训练器
K均值是一种无监督学习算法，它解决了将对象分组的聚类问题，即在同一个组（叫做簇）中的对象（某种意义上）比其它簇中的对象更相似。

K均值是一种参数化的迭代算法，在每个迭代中，计算每个簇中的新的均值，作为观测值的质心。

目前，Ignite为K均值分类算法支持若干个参数：

 - `k`：可能的簇的数量；
 - `maxIterations`：终止条件（另一个是ε）；
 - ε-δ收敛（新旧质心值之间的增量）；
 - 距离：机器学习框架提供的距离指标之一，例如欧几里得、海明或曼哈顿；
 - 种子：一个初始化参数，有助于重现模型（该训练器有一个随机初始化步骤，以获得第一个质心）。

```java
// Set up the trainer
KMeansTrainer trainer = new KMeansTrainer()
   .withDistance(new EuclideanDistance())
   .withK(AMOUNT_OF_CLUSTERS)
   .withMaxIterations(MAX_ITERATIONS)
   .withEpsilon(PRECISION);

// Build the model
KMeansModel knnMdl = trainer.fit(
  datasetBuilder,
  featureExtractor,
  labelExtractor
);
```
### 15.5.3.示例
要了解线性回归在实践中是如何使用的，可以看这个[示例](https://github.com/apache/ignite/tree/master/examples/src/main/java/org/apache/ignite/examples/ml/clustering)，该实例也会随着每个Ignite发行版进行发布。

训练数据集是鸢尾花数据集的一个子集（具有标签1和标签2，它们是线性可分离的两类数据集），可以从[UCL机器学习库](https://archive.ics.uci.edu/ml/datasets/iris)加载。
## 15.6.遗传算法
### 15.6.1.概述
Ignite的机器学习组件包括一组遗传算法（GA），它是一种通过模拟生物进化过程来解决优化问题的一种方法。 遗传算法非常适合于以最优的方式检索大量复杂的数据集，在现实世界中，遗传算法的应用包括：汽车设计、计算机游戏、机器人、投资、交通和运输等等。

所有的遗传操作，比如适应度计算、交叉和变异，都会被建模为分布式的ComputeTask。此外，这些ComputeTask会通过Ignite的关联并置，将ComputeJob分发到染色体实际存储的节点。

下图是遗传算法的架构：
![](https://files.readme.io/07790ee-GAGrid_Overview.png)
下图是遗传算法的执行步骤：
![](https://files.readme.io/352730c-GAProcessDiagram2.png)
### 15.6.2.使用
下面会使用`HelloWorldGAExample`进行演示，一步步讲解遗传算法如何使用，目标是得到“HELLO WORLD”这个短语。

**创建一个GAConfiguration**

开始，需要创建一个`GAConfiguration`对象，这个类可以定义遗传算法的行为。
```java
    ignite = Ignition.start("examples/config/example-ignite.xml");
    // Create GAConfiguration
    gaConfig = new GAConfiguration();
```

**定义基因和染色体**

下一步，需要定义`Gene`，对于本示例对应的问题域，"HELLO WORLD"短语，因为离散部分都是字母，所以使用`Character`来对`Gene`建模，接下来，使用`Character`定义有27个`Gene`的基因库，下面的代码描述了这个过程：
```java
List<Gene> genePool = new ArrayList();

char[] chars = { 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' ' };

for (int i = 0; i < chars.length; i++) {
    Gene gene = new Gene(new Character(chars[i]));
    genePool.add(gene);
}

gaConfig.setGenePool(genePool);
```
下一步，需要定义染色体，这是遗传算法的核心，因为它要对最优解进行建模。染色体由`Gene`构成，它表示了特定解的离散部分。
对于本示例来说，因为目标是包含“HELLO WORLD”的短语，所以染色体应该有11个基因（即字符），从代码上来说，需要将`GAConfiguration`的染色体长度设定为11。
```java
// Set the Chromosome Length to '11' since 'HELLO WORLD' contains 11 characters.
gaConfig.setChromosomeLength(11);
```
在遗传算法的执行过程中，染色体通过交叉和变异的过程演化为最优解，然后，根据一个适应度得分，会选择一个最优解。

::: tip 注意
遗传算法从内部来说，会将染色体存储在染色体缓存中。
:::

最优解：
![](https://files.readme.io/baca393-helloworld_genes.png)

**实现适应度函数**

遗传算法可以智能地执行自然选择的大部分过程，但是遗传算法是不了解具体的问题域的，因此需要定义一个适应度函数，它需要扩展自遗传算法的`IFitnessFunction`类，然后为每个染色体计算适应度得分，这个适应度得分用于决定各个解之间的优化程度，下面的代码会演示这个适应度函数：
```java
public class HelloWorldFitnessFunction implements IFitnessFunction {

    private String targetString = "HELLO WORLD";

    @Override
    public double evaluate(List<Gene> genes) {

        double matches = 0;

        for (int i = 0; i < genes.size(); i++) {
            if (((Character) (genes.get(i).getValue())).equals(targetString.charAt(i))) {
                matches = matches + 1;
            }
        }

        return matches;
    }
}
```
下一步，在`GAConfiguration`中配置HelloWorldFitnessFunction：
```java
// Create and set Fitness function
HelloWorldFitnessFunction function = new HelloWorldFitnessFunction();
gaConfig.setFitnessFunction(function);
```

**定义终止条件**

下一步需要为遗传算法指定一个合适的终止条件，终止条件依赖于问题域，对于本示例来说，当染色体的适应度得分为11时，遗传算法就应该终止了。终止条件是通过实现`ITerminateCriteria`接口实现的，它只有一个方法`isTerminateConditionMet()`。
```java
public class HelloWorldTerminateCriteria implements ITerminateCriteria {

    private IgniteLogger igniteLogger = null;
    private Ignite ignite = null;

    public HelloWorldTerminateCriteria(Ignite ignite) {
        this.ignite = ignite;
        this.igniteLogger = ignite.log();
    }

    public boolean isTerminationConditionMet(Chromosome fittestChromosome, double averageFitnessScore, int currentGeneration) {
        boolean isTerminate = true;
        igniteLogger.info("##########################################################################################");
        igniteLogger.info("Generation: " + currentGeneration);
        igniteLogger.info("Fittest is Chromosome Key: " + fittestChromosome);
        igniteLogger.info("Chromsome: " + fittestChromosome);
        printPhrase(GAGridUtils.getGenesInOrderForChromosome(ignite, fittestChromosome));
        igniteLogger.info("Avg Chromsome Fitness: " + averageFitnessScore);
        igniteLogger.info("##########################################################################################");

        if (!(fittestChromosome.getFitnessScore() > 10)) {
            isTerminate = false;
        }

        return isTerminate;
    }


    /**
     * Helper to print Phrase
     *
     * @param genes
     */
    private void printPhrase(List<Gene> genes) {

        StringBuffer sbPhrase = new StringBuffer();

        for (Gene gene : genes) {
            sbPhrase.append(((Character) gene.getValue()).toString());
        }
        igniteLogger.info(sbPhrase.toString());
    }
}
```
下一步，需要为`GAConfiguration`配置`HelloWorldTerminateCriteria`：
```java
// Create and set TerminateCriteria
HelloWorldTerminateCriteria termCriteria = new HelloWorldTerminateCriteria(ignite);
gaConfig.setTerminateCriteria(termCriteria);
```

**种群的进化**

最后一步就是通过`GAConfiguration`初始化一个`GAGrid`实例和Ignite实例，然后就可以调用`GAGrid.evolve()`执行种群的进化。
```java
// Initialize GAGrid
gaGrid = new GAGrid(gaConfig, ignite);
// Evolve the population
Chromosome fittestChromosome = gaGrid.evolve();
```
### 15.6.3.启动
如果要使用遗传算法，打开命令终端，转到`IGNITE_HOME`目录，然后执行下面的脚本：
```bash
$ bin/ignite.sh examples/config/example-ignite.xml
```
在集群的每个节点中重复这个步骤。

然后打开另一个命令终端，转到`IGNITE_HOME`目录，然后输入：
```bash
mvn exec:java -Dexec.mainClass="org.apache.ignite.examples.ml.genetic.helloworld.HelloWorldGAExample"
```
启动之后，集群中的每个节点会看到类似下面的输出：
```bash
[21:41:49,327][INFO][main][GridCacheProcessor] Started cache [name=populationCache, mode=PARTITIONED]
[21:41:49,365][INFO][main][GridCacheProcessor] Started cache [name=geneCache, mode=REPLICATED]
```
下一步，在若干代之后，会看到下面的输出：
```bash
[19:04:17,307][INFO][main][] Generation: 208
[19:04:17,307][INFO][main][] Fittest is Chromosome Key: Chromosome [fitnessScore=11.0, id=319, genes=[8, 5, 12, 12, 15, 27, 23, 15, 18, 12, 4]]
[19:04:17,307][INFO][main][] Chromosome: Chromosome [fitnessScore=11.0, id=319, genes=[8, 5, 12, 12, 15, 27, 23, 15, 18, 12, 4]]
[19:04:17,310][INFO][main][] HELLO WORLD
[19:04:17,311][INFO][main][] Avg Chromosome Fitness: 5.252
[19:04:17,311][INFO][main][]
Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 53.883 sec
```
### 15.6.4.Apache Zeppelin集成
Apache Zeppelin是一个基于Web的笔记本，可以进行交互式的数据分析。下面会介绍如何利用Zeppelin的可视化特性来显示由遗传算法生成的优化解。

::: tip 注意
下面的步骤，对所有遗传算法的示例都有效。
:::

**Zeppelin的安装和配置**

步骤如下：

 1. 从[这里](http://zeppelin.apache.org/download.html)下载最新版的Zeppelin安装包；
 2. 将压缩包解压到一个目录中，该目录就作为`ZEPPELIN_HOME`；
 3. 将`ignite-core-2.6.0.jar`从`IGNITE_HOME/libs`目录中复制到`ZEPPELIN_HOME/interpreter/jdbc`目录中，该包中包含Ignite的JDBC Thin模式驱动，Zeppelin会使用这个驱动从遗传算法网格中获取优化后的数据；

Zeppelin安装配置好后，可以通过如下命令启动：
```bash
./bin/zeppelin-daemon.sh start
```
Zeppelin启动之后，会看到下面的首页：
![](https://files.readme.io/0a3daa8-Zeppelin_StartPage.png)
下一步，选择`Interpreter`菜单项：
![](https://files.readme.io/23548f1-Zeppelin_Interpreter.png)
这个页面中包含了所有已配置的解释器的配置项。
下一步，点击`Create`按钮，配置一个新的JDBC解释器，使用下表中的配置参数配置这个JDBC解释器：

|配置项|值|
|---|---|
|Interpreter Name|jdbc_ignite_sql|
|Interpreter group|jdbc|
|default.driver|org.apache.ignite.IgniteJdbcThinDriver|
|default.url|jdbc:ignite:thin//localhost:10800|

![](https://files.readme.io/b7bcbeb-Zeppelin_CreateNewInterpreter_JDBC.png)
点击`Save`按钮对变更的配置进行更新，配置变更后要记得重启解释器。

**创建新的记事本**

在`Notebook`标签页中，点击`Create new note`菜单项可以创建一个新的记事本：
![](https://files.readme.io/1ef9f54-Zeppelin_CreateNote_Step1.png)
给记事本命名为`GAGridNotebook`，然后选中`jdbc_ignite_sql`作为默认的解释器，如下图所示，点击`Create Note`继续：
![](https://files.readme.io/c56edb9-Zeppeln_CreateNewNote.png)
到目前为止，新创建的笔记本如下图所示，如果要执行SQL查询，需要添加`%jdbc_ignite_sql`前缀：
![](https://files.readme.io/6d8489d-Zeppelin_GAGridNotebook2.png)

**记事本的使用**

通过自定义SQL函数改进遗传的优化结果，可以改进遗传算法的知识发现，结果集中的列是由单个遗传样本的染色体大小动态驱动的。

**自定义SQL函数**

在遗传算法的分布式缓存`geneCache`中，如下的SQL函数可以用：

|函数名|描述|
|---|---|
|`getSolutionsDesc()`|获得优化解，按照适应度得分倒序排列。|
|`getSolutionsAsc()`|获得优化解，按照适应度得分升序排列。|
|`getSolutionById(key)`|通过染色体键获取优化解。|

要使用`GAGridNotebook`，可以启动一个独立的Ignite节点：
```bash
$ bin/ignite.sh IGNITE_HOME/examples/config/example-config.xml
```
运行`HelloWorldGAExample`这个示例：
```bash
mvn exec:java -Dexec.mainClass="org.apache.ignite.examples.ml.genetic.helloworld.HelloWorldGAExample"
```
当遗传算法为第一代生成最优解后，就可以进行数据查询了。

**第一代**

```bash
##########################################################################################
[13:55:22,589][INFO][main][] Generation: 1
[13:55:22,596][INFO][main][] Fittest is Chromosome Key: Chromosome [fitnessScore=3.0, id=460, genes=[8, 3, 21, 5, 2, 22, 1, 19, 18, 12, 9]]
[13:55:22,596][INFO][main][] Chromosome: Chromosome [fitnessScore=3.0, id=460, genes=[8, 3, 21, 5, 2, 22, 1, 19, 18, 12, 9]]
[13:55:22,598][INFO][main][] HCUEBVASRLI
[13:55:22,598][INFO][main][] Avg Chromosome Fitness: 0.408
```
在Zeppelin的窗口中，输入下面的SQL然后点击`execute`按钮：
```bash
%jdbc_ignite_sql select * from "geneCache".getSolutionsDesc();
```
若干代之后，会发现解已经演变到最后的短语"HELLO WORLD"，对于HellowWorldGAExample这个示例，遗传算法会为每一代维护一个500个解的种群，另外，本示例的解会包含总共11个基因，适应度得分最高的，会被认为是“最适合”。
![](https://files.readme.io/52055cb-Zeppelin_HelloWorldGATest.png)
### 15.6.5.词汇表
**染色体**：是一系列基因，一个染色体代表一个潜在的解；

**交叉**：是染色体内的基因结合以获得新染色体的过程；

**适应度得分**：是一个数值评分，测量一个特定染色体（即：解）相对于种群中其它染色体的价值；

**基因**：是组成染色体的离散构建块；

**遗传算法（GA）**：是通过模拟生物进化过程来求解优化问题的一种方法。遗传算法持续增强种群潜在的解。在每次迭代中，遗传算法从当前种群中选择最合适的个体，为下一代创造后代。在随后的世代中，遗传算法将种群进化为最优解；

**变异**：是染色体内的基因被随机更新以产生新特性的过程；

**种群**：是潜在的解或染色体的集合；

**选择**：是为下一代选择候选解（染色体）的过程。

## 15.7.多层感知
### 15.7.1.概述
多层感知（MLP）是神经网络的基本形式，它由一个输入层和0或多个转换层组成，每个转换层都通过如下的方程依赖于前一个转换层：
![](https://files.readme.io/60458a8-333.gif)
在上面的方程中，点运算符是两个向量的点积，由σ表示的函数称为激活函数，`w`表示的向量称为权重，`b`表示的向量成为偏差。每个转换层都和权重、激活以及可选的偏差有关，MLP中中所有权重和偏差的集合，就被称为MLP的参数集。
### 15.7.2.模型
神经网络的模型由`MultilayerPerceptron`类表示，它可以对给定的特征向量通过如下方式进行预测：
```java
MultilayerPerceptron mlp = ...
Matrix prediction = mlp.apply(coordinates);
```
模型是完全独立的对象，	训练后可以保存、序列化和恢复。
### 15.7.3.训练器
批量训练是监督模型训练的常用方法之一。在这种方法中，训练是迭代进行的，在每次迭代中，提取标记数据的`subpart(batch)`（由近似函数的输入和该函数的相应值组成的数据，通常称为“地面实况”），在这里使用这个子部分训练和更新模型参数，进行更新以使批处理中的损失函数最小化。

Ignite的`MLPTrainer`就是用于分布式批量训练的，它运行于MapReduce模式，每个迭代（称为全局迭代）由若干个并行迭代组成，这些迭代又相应地由若干局部步骤组成，每个局部迭代由它自己的工作进程来执行，并执行指定数量的本地步骤（成为同步周期）来计算模型参数的更新，然后会在发起训练的节点上累计所有的更新，并将其转换为全局更新，全局更新会被反馈给所有的工作进程，在达到标准之前，这个过程会一直持续。

`MLPTrainer`是参数化的，其中包括神经网络架构、损失函数、更新策略（`SGD`、`RProp`、`Nesterov`）、最大迭代数量、批处理大小、本地迭代和种子数量。

**基于缓存的数据集**、
```java
// Define a layered architecture.
MLPArchitecture arch = new MLPArchitecture(2).
    withAddedLayer(10, true, Activators.RELU).
    withAddedLayer(1, false, Activators.SIGMOID);

// Define a neural network trainer.
MLPTrainer<SimpleGDParameterUpdate> trainer = new MLPTrainer<>(
    arch,
    LossFunctions.MSE,
    new UpdatesStrategy<>(
        new SimpleGDUpdateCalculator(0.1),
        SimpleGDParameterUpdate::sumLocal,
        SimpleGDParameterUpdate::avg
    ),
    3000,   // Max iterations.
    4,      // Batch size.
    50,     // Local iterations.
    123L    // Random seed.
);

// Train model.
MultilayerPerceptron mlp = trainer.fit(
    ignite,
    upstreamCache,
    (k, pnt) -> pnt.coordinates,
    (k, pnt) -> pnt.label
);

// Make a prediction.
Matrix prediction = mlp.apply(coordinates);
```
本地数据集：
```java
// Define a layered architecture.
MLPArchitecture arch = new MLPArchitecture(2).
    withAddedLayer(10, true, Activators.RELU).
    withAddedLayer(1, false, Activators.SIGMOID);

// Define a neural network trainer.
MLPTrainer<SimpleGDParameterUpdate> trainer = new MLPTrainer<>(
    arch,
    LossFunctions.MSE,
    new UpdatesStrategy<>(
        new SimpleGDUpdateCalculator(0.1),
        SimpleGDParameterUpdate::sumLocal,
        SimpleGDParameterUpdate::avg
    ),
    3000,   // Max iterations.
    4,      // Batch size.
    50,     // Local iterations.
    123L    // Random seed.
);

// Train model.
MultilayerPerceptron mlp = trainer.fit(
    upstreamMap,
    10,          // Number of partitions.
    (k, pnt) -> pnt.coordinates,
    (k, pnt) -> pnt.label
);

// Make a prediction.
Matrix prediction = mlp.apply(coordinates);
```
### 15.7.4.示例
要了解多层感知在实践中是如何使用的，可以看这个[示例](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/ml/nn/MLPTrainerExample.java)，该实例也会随着每个Ignite发行版进行发布。
## 15.8.决策树
### 15.8.1.概述
决策树是监督学习中一个简单而强大的模型。其主要思想是将特征空间分割成区域，每个区域中的值变化不大。一个区域中的值变化的度量被称为区域的纯度。

Ignite对于行数据存储，提供了一种优化算法，具体可以看[15.3.分区化的数据集](#_15-3-分区化的数据集)。

拆分是递归进行的，每次拆分创建的区域又可以进一步拆分，因此，整个过程可以用二叉树来描述，其中每个节点都代表一个特定的区域，其子节点为由另一个拆分派生出来的区域。

让一个训练集的每个样本独属于一些空间`S`，并且让`p_i`成为具有指数`i`的特征的一个预测，然后通过具有指数`i`的连续特征进行拆分：
![](https://files.readme.io/b62ca98-555.gif)
由分类特征和某些集合`x`的值进行拆分：
![](https://files.readme.io/f2c63c7-666.gif)
这里`X_0`是`x`的一个子集。

该模型的工作方式为，当算法达到配置的最大深度时，拆分过程停止，或者任何区域的拆分没有导致明显的纯度损失。从`S`预测点`s`的值是将树向下遍历，直到节点对应的区域包含`s`，并返回与该叶子相关联的值。
### 15.8.2.模型
决策树分类的模型由`DecisionTreeNode`表示，对于给定的特征向量进行预测，如下所示：
```java
DecisionTreeNode mdl = ...
double prediction = mdl.apply(observation);
```
模型是完全独立的对象，训练之后可以保存、序列化以及恢复。
### 15.8.3.训练器
决策树算法可用于基于纯度度量和节点实例化方法的分类和回归。

**分类**

分类决策树可用于[Gini](https://en.wikipedia.org/wiki/Decision_tree_learning#Gini_impurity)纯度度量，使用方法如下：

基于缓存的数据集：
```java
// Create decision tree classification trainer.
DecisionTreeClassificationTrainer trainer = new DecisionTreeClassificationTrainer(
    4, // Max deep.
    0  // Min impurity decrease.
);

// Train model.
DecisionTreeNode mdl = trainer.fit(
    ignite,
    upstreamCache,
    (k, pnt) -> pnt.coordinates,
    (k, pnt) -> pnt.label
);

// Make a prediction.
double prediction = mdl.apply(coordinates);
```
本地数据集：
```java
// Create decision tree classification trainer.
DecisionTreeClassificationTrainer trainer = new DecisionTreeClassificationTrainer(
    4, // Max deep.
    0  // Min impurity decrease.
);

// Train model.
DecisionTreeNode mdl = trainer.fit(
    upstreamMap,
    10,          // Number of partitions.
    (k, pnt) -> pnt.coordinates,
    (k, pnt) -> pnt.label
);

// Make a prediction.
double prediction = mdl.apply(coordinates);
```
**回归**

回归决策树使用[MSE](https://en.wikipedia.org/wiki/Mean_squared_error)纯度度量，使用方法如下：

基于缓存的数据集：
```java
// Create decision tree classification trainer.
DecisionTreeRegressionTrainer trainer = new DecisionTreeRegressionTrainer(
    4, // Max deep.
    0  // Min impurity decrease.
);

// Train model.
DecisionTreeNode mdl = trainer.fit(
    ignite,
    upstreamCache,
    (k, pnt) -> pnt.x,
    (k, pnt) -> pnt.y
);

// Make a prediction.
double prediction = mdl.apply(x);
```
本地数据集：
```java
// Create decision tree classification trainer.
DecisionTreeRegressionTrainer trainer = new DecisionTreeRegressionTrainer(
    4, // Max deep.
    0  // Min impurity decrease.
);

// Train model.
DecisionTreeNode mdl = trainer.fit(
    upstreamMap,
    10,          // Number of partitions.
    (k, pnt) -> pnt.x,
    (k, pnt) -> pnt.y
);

// Make a prediction.
double prediction = mdl.apply(x);
```
### 15.8.4.示例
要了解决策树在实践中是如何使用的，可以看这个[分类示例](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/ml/tree/DecisionTreeClassificationTrainerExample.java)和[回归示例](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/ml/tree/DecisionTreeRegressionTrainerExample.java)，这些实例也会随着每个Ignite发行版进行发布。
## 15.9.k-NN分类
对于广泛使用的k-NN（k-最近邻）算法，Ignite支持它的两个版本，一个是分类任务，另一个是回归任务。

本文会描述k-NN作为分类任务的解决方案。
### 15.9.1.模型
K-NN算法是一种非参数方法，其输入由特征空间中的K-最近训练样本组成。

另外，k-NN分类的输出表示为类的成员。一个对象按其邻居的多数票进行分类。该对象会被分配为K近邻中最常见的一个特定类。`k`是正整数，通常很小，当`k`为1时是一个特殊的情况，该对象会简单地分配给该单近邻的类。

目前，Ignite为k-NN分类算法提供了若干参数：

  - `k`：最近邻数量；
  - `distanceMeasure`：ML框架提供的距离度量之一，例如欧几里得、海明或曼哈顿；
  - `KNNStrategy`：可以为`SIMPLE`或者`WEIGHTED`（开启加权k-NN算法）；
  - `dataCache`：持有一组已知分类的对象的训练集。

```java
// Create trainer
KNNClassificationTrainer trainer = new KNNClassificationTrainer();

// Train model.
KNNClassificationModel knnMdl = trainer.fit(
    ignite,
    dataCache,
    (k, v) -> Arrays.copyOfRange(v, 0, v.length - 1),
    (k, v) -> v[2]
)
  .withK(3)
  .withDistanceMeasure(new EuclideanDistance())
  .withStrategy(KNNStrategy.SIMPLE);

// Make a prediction.
double prediction = knnMdl.apply(vectorizedData);
```
### 15.9.2.示例
要了解k-NN分类在实践中是如何使用的，可以看这个[示例](https://github.com/apache/ignite/tree/master/examples/src/main/java/org/apache/ignite/examples/ml/knn/classification)，该实例也会随着每个Ignite发行版进行发布。

训练数据集是可以从[UCI机器学习库](https://archive.ics.uci.edu/ml/datasets/iris)加载的鸢尾花数据集。
## 15.10.k-NN回归
对于广泛使用的k-NN（k-最近邻）算法，Ignite支持它的两个版本，一个是分类任务，另一个是回归任务。

本文会描述k-NN作为回归任务的解决方案。
### 15.10.1.模型
K-NN算法是一种非参数方法，其输入由特征空间中的K-最近训练样本组成。每个训练样本具有与给定的训练样本相关联的数值形式的属性值。

K-NN算法使用所有训练集来预测给定测试样本的属性值，这个预测的属性值是其k近邻值的平均值。如果`k`是1，那么测试样本会被简单地分配给单个最近邻的属性值。

目前，Ignite为k-NN分类算法提供了若干参数：

  - `k`：最近邻数量；
  - `distanceMeasure`：ML框架提供的距离度量之一，例如欧几里得、海明或曼哈顿；
  - `KNNStrategy`：可以为`SIMPLE`或者`WEIGHTED`（开启加权k-NN算法）；
  - `datasetBuilder`：帮助访问已知类的对象的训练集。

```java
// Create trainer
KNNRegressionTrainer trainer = new KNNRegressionTrainer();

// Train model.
KNNRegressionModel knnMdl = (KNNRegressionModel) trainer.fit(
      datasetBuilder,
      (k, v) -> Arrays.copyOfRange(v, 1, v.length),
      (k, v) -> v[0])
  .withK(5)
  .withDistanceMeasure(new ManhattanDistance())
  .withStrategy(KNNStrategy.WEIGHTED);

// Make a prediction.
double prediction = knnMdl.apply(vectorizedData);
```
### 15.10.2.示例
要了解k-NN回归在实践中是如何使用的，可以看这个[示例](https://github.com/apache/ignite/tree/master/examples/src/main/java/org/apache/ignite/examples/ml/knn/regression)，该实例也会随着每个Ignite发行版进行发布。

训练数据集是可以从[UCI机器学习库](https://archive.ics.uci.edu/ml/datasets/iris)加载的鸢尾花数据集。
## 15.11.SVM二元分类
支持向量机（SVM）是相关数据分析学习算法中的监督学习模型，用于分类和回归分析。

给定一组训练样本，每一个被标记为属于两个类别中的一个，SVM训练算法会建立一个模型，该模型将新的样本分配给其中一个类别，使其成为非概率二元线性分类器。

Ignite机器学习模块只支持线性支持向量机。更多信息请参见维基百科中的[支持向量机](https://en.wikipedia.org/wiki/Support_vector_machine)。
### 15.11.1.模型
SVM的模型表示为`SVMLinearBinaryClassificationModel`，它通过如下的方式对给定的特征向量进行预测：
```java
SVMLinearBinaryClassificationModel model = ...;

double prediction = model.predict(observation);
```
目前，对于`SVMLinearBinaryClassificationModel`，Ignite支持一组参数：

 - `isKeepingRawLabels`：-1,和+1，分别对应false值和从分离超平面的原始距离（默认值false）；
 - `threshold`：如果原始值大于该阈值（默认值：0.0），则向观察者分配1个标签。

```java
SVMLinearBinaryClassificationModel model = ...;

double prediction = model
  .withRawLabels(true)
  .withThreshold(5)
  .predict(observation);
```
### 15.11.2.训练器
基于具有铰链损失函数的高效通信分布式双坐标上升算法（COCOA），提供软余量SVM线性分类训练器的基类。该训练器将输入作为具有-1和+1两个分类的标签化数据集，并进行二元分类。

关于这个算法的论文可以在[这里](https://arxiv.org/abs/1409.1458)找到。

目前，Ignite为`SVMLinearBinaryClassificationTrainer`支持如下参数：

 - `amountOfIterations`：外部SDCA算法的迭代量。（默认值：200）；
 - `amountOfLocIterations`：本地SDCA算法的迭代量。（默认值：100）；
 - `lambda`：正则化参数（默认值：0.4）。

```java
// Set up the trainer
SVMLinearBinaryClassificationTrainer trainer = new SVMLinearBinaryClassificationTrainer()
  .withAmountOfIterations(AMOUNT_OF_ITERATIONS)
  .withAmountOfLocIterations(AMOUNT_OF_LOC_ITERATIONS)
  .withLambda(LAMBDA);

// Build the model
SVMLinearBinaryClassificationModel mdl = trainer.fit(
  datasetBuilder,
  featureExtractor,
  labelExtractor
);
```
### 15.11.3.示例
要了解SVM线性分类器在实践中是如何使用的，可以看这个[示例](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/ml/svm/binary/SVMBinaryClassificationExample.java)，该实例也会随着每个Ignite发行版进行发布。

训练数据集可以从[UCI机器学习库](https://archive.ics.uci.edu/ml/datasets/iris)加载，其是鸢尾花数据集的子集（具有标签1和标签2的分类，它们是线性可分离的两类数据集）。
## 15.12.SVM多类分类
多类SVM的目的是通过使用支持向量机将标签分配给样本，其中标签是从多个元素的有限集合中提取的。

这个实现方法是通过一对所有的方法将单个多类问题总结成多个二元分类问题。

一对所有的方法是建立二元分类器的过程，它将一个标签和其余的区分开。
### 15.12.1.模型
该模型持有`<ClassLabel, SVMLinearBinaryClassificationModel>`对，它通过如下的方式对给定的特征向量进行预测：
```java
SVMLinearMultiClassClassificationModel model = ...;

double prediction = model.predict(observation);
```
### 15.12.2.训练器
目前，Ignite为`SVMLinearMultiClassClassificationTrainer`支持如下的参数：

 - `amountOfIterations`：外部SDCA算法的迭代量。（默认值：200）；
 - `amountOfLocIterations`：本地SDCA算法的迭代量。（默认值：100）；
 - `lambda`：正则化参数（默认值：0.4）。

所有属性都会被传播到一对所有`SVMLinearBinaryClassificationTrainer`的每个对。
```java
// Set up the trainer
SVMLinearMultiClassClassificationTrainer trainer = new SVMLinearMultiClassClassificationTrainer()
  .withAmountOfIterations(AMOUNT_OF_ITERATIONS)
  .withAmountOfLocIterations(AMOUNT_OF_LOC_ITERATIONS)
  .withLambda(LAMBDA);

// Build the model
SVMLinearMultiClassClassificationModel mdl = trainer.fit(
  datasetBuilder,
  featureExtractor,
  labelExtractor
);
```
### 15.12.3.示例
要了解SVM线性多类分类器在实践中是如何使用的，可以看这个[示例](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/ml/svm/multiclass/SVMMultiClassClassificationExample.java)，该实例也会随着每个Ignite发行版进行发布。

预处理的分类数据集可以从[UCI机器学习库](https://archive.ics.uci.edu/ml/datasets/iris)加载。

共有三个带标签的分类：1 (building_windows_float_processed)，3 (vehicle_windows_float_processed)，7 (headlamps) 以及特征名：'Na-Sodium'，'Mg-Magnesium'，'Al-Aluminum'，'Ba-Barium'，'Fe-Iron'。
## 15.13.模型交叉验证
### 15.13.1.概述
学习预测函数的参数并在同一数据上进行验证不是一个好的做法，这导致过盈。为了避免这个问题，最有效的解决方案之一是将部分训练数据保存为验证集。通过对可用数据进行拆分并从训练集中排除一个或多个部分，可以显著减少可用于模型学习的样本数量，并且结果取决于对(训练、验证)集合的特定随机选择。

解决这个问题的方法是一个称为交叉验证的过程。基本方法称为`k-fold CV`，训练集被分成k个较小的集合，然后执行以下过程：使用k-1个折叠（部分）作为训练数据来训练模型，所得模型在剩余的数据（用作测试集来计算指标，例如精度）上验证。

Ignite提供了交叉验证的功能，可以参数化要验证的训练器，为每个步骤上训练的模型计算指标，以及应该拆分折叠训练数据的数量。
### 15.13.2.使用
Ignite中的交叉验证功能由`CrossValidation`类体现。这是一个由模型类型、标签类型和数据键值类型参数化的计算器。在实例化（构造函数不接受任何附加参数）之后，可以使用`score`方法执行交叉验证。

假设有一个训练器和一个训练集，想用精度作为指标，使用4个折叠进行交叉验证，Ignite可以按照如下示例进行操作：
```java
CrossValidation<DecisionTreeNode, Double, Integer, LabeledPoint> scoreCalculator = new CrossValidation<>();

double[] scores = scoreCalculator.score(
    trainer,
    new Accuracy<>(),
    ignite,
    trainingSet,
    (k, v) -> VectorUtils.of(v.x, v.y),
    (k, v) -> v.lb,
    4
);
```
在本例中，指定了训练器和指标作为参数，之后传递了常规的训练参数，比如Ignite实例的引用、缓存、特征和标签的提取器，最后指定了折叠的数量。此方法返回一个数组，该数组包含训练集的所有可能拆分的指标。
### 15.13.3.示例
如果要了解交叉验证在实践中如何使用，可以尝试每个Ignite发布版以及GitHub上的[示例](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/ml/selection/cv/CrossValidationExample.java)程序，以及机器学习教程的[第8个步骤](https://github.com/apache/ignite/tree/master/examples/src/main/java/org/apache/ignite/examples/ml/tutorial)。

## 15.14.逻辑回归
### 15.14.1.二元分类
二元逻辑回归是一种特殊类型的回归，其中二元响应变量与一组解释变量相关，这些解释变量可以是离散的和/或连续的。这里要注意的重要一点是，在线性回归中，响应变量的预期值是基于预测器所取值的组合来建模的。在逻辑回归中，基于由预测器获得的值的组合，对采取特定值的响应的概率或几率进行建模。在Ignite的ML模块中，它通过`LogisticRegressionModel`实现，解决了二元分类问题。它是在由逻辑损失给出的公式中具有损失函数的线性方法：

![](https://files.readme.io/ec1d944-latex_7d503c8a18a240de7e8d66ba400e79c4.png)

对于二元分类问题，该算法输出二元逻辑回归模型。给定一个新的数据点，用`x`表示，模型通过应用逻辑函数进行预测：

![](https://files.readme.io/d8b0f18-xD4sTj.png)

默认情况下，如果`f(wTx)>0.5`或`mathrm{f}(wv^T x) > 0.5`(Tex公式)，则结果为正，否则为负。不过与线性SVM不同，逻辑回归模型`f(z)`的原始输出具有概率解释(即，其为正的概率)。
### 15.14.2.多类别分类
多类别逻辑回归旨在使用二元逻辑回归将标签分配给实例，其中标签是从一组有限的几个元素中抽取的。实现方式是通过一对一的方式将单个多类问题减少为多个二元分类问题。一对一的方法是构建二元分类器的过程，该二元分类器会区分一个标签和其它标签。
### 15.14.3.模型
该模型持有`<ClassLabel, LogisticRegressionModel>`对，它能够按照以下方式对给定的特征向量进行预测：
```java
LogRegressionMultiClassModel
mdl = …

double prediction = mdl.withRawLabels(true).withThreshold(0.5).apply(observation)
```
Ignite的`LogisticRegressionModel`支持若干个参数：

 - `isKeepingRawLabels`：控制输出标签格式：0和1表示错误值，否则为分离超平面的原始距离（默认值：false）；
 - `threshold`：阈值，如果原始值大于该阈值，则向观察分配标签`1`(默认值：0.5)。

```java
LogisticRegressionSGDTrainer
mdl = …

double prediction = mdl.withRawLabels(true).withThreshold(0.5).apply(observation)
```
### 15.14.4.训练器
多类别逻辑回归模型的训练器在后台运行多个二元逻辑回归训练器。

Ignite的`LogRegressionMultiClassTrainer`支持下面的参数：

 - `updatesStgy`：更新策略；
 - `maxIterations`：收敛前的最大迭代量；
 - `batchSize`：批量学习大小；
 - `locIterations`：SGD算法的局部迭代量；
 - `seed`：用于内部随机目的以再现训练结果的种子值。

```java
LogRegressionMultiClassTrainer<?> trainer = new LogRegressionMultiClassTrainer<>()
  .withUpdatesStgy(UPDATES_STRATEGY)
  .withAmountOfIterations(MAX_ITERATIONS)
  .withAmountOfLocIterations(BATCH_SIZE)
  .withBatchSize(LOC_ITERATIONS)
  .withSeed(SEED);

// Build the model
LogisticRegressionModel mdl = trainer.fit(
  ignite,
  dataCache,
  featureExtractor,
  labelExtractor
);
```
所有属性将针对每对一对所有`LogRegressionMultiClassTrainer`进行传播。
### 15.14.5.示例
要了解`LogRegressionMultiClassModel`在实践中是如何使用的，请尝试这个GitHub上的[示例](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/ml/regression/logistic/multiclass/LogRegressionMultiClassClassificationExample.java)，它也会随着每个Ignite发行版一起发布。预处理的Glass数据集来自[UCI机器学习库](https://archive.ics.uci.edu/ml/datasets/Glass+Identification)。

## 15.15.随机森林
### 15.15.1.概述
随机森林是解决任何分类和回归问题的集成学习方法。随机森林训练建立一种类型的模型组合（集成），并使用一些模型答案的聚合算法。每个模型在训练数据集的一部分上进行训练。该部分是根据装袋法和特征子空间法定义的。关于这些概念的更多信息可以在这里找到：[随机子空间法](https://en.wikipedia.org/wiki/Random_subspace_method)、[装袋法](https://en.wikipedia.org/wiki/Bootstrap_aggregating)和[随机森林](https://en.wikipedia.org/wiki/Random_forest)。

在Ignite的机器学习中有几种聚合算法的实现：

 - `MeanValuePredictionsAggregator`：计算随机森林的回答作为给定组合中所有模型的预测的平均值。这通常用于回归任务；
 - `OnMajorityPredictionsAggegator`：从给定组合中的所有模型中获取预测模式。这对于分类任务很有用。注意：这个聚合器支持多分类任务。

### 15.15.2.模型
在Ignite的机器学习中，随机森林算法是作为具有针对不同问题的特定聚合器的模型组合的一个特例存在的（`MeanValuePredictionsAggregator`针对回归，`OnMajorityPredictionsAggegator`针对分类）。

这里是模型使用的示例：
```java
ModelsComposition randomForest = ….
double prediction = randomForest.apply(featuresVector);
```
### 15.15.3.训练器
随机森林训练算法通过`RandomForestRegressionTrainer`和`RandomForestClassifierTrainer`实现，参数如下：

 - `meta`：特征元数据，特征类型列表，比如：
  - `featureId`：特征向量的索引；
  - `isCategoricalFeature`：如果特征是分类的，则为`true`；
  - 特证名。

该元信息对于随机森林训练算法很重要，因为它建立特征直方图，并且分类特征应该在所有特征值的直方图中表示：

 - `featuresCountSelectionStrgy`：为学习一棵树设置定义随机特征计数的策略。有几种策略：在`FeaturesCountSelectionStrategies`类中实现：有`SQRT`、`LOG2`、`ALL`和`ONE_THIRD`策略；
 - `maxDepththe`：设置最大树深度；
 - `minInpurityDelta`：如果两个节点上的`impurity`值小于未拆分节点的`minImpurityDecrease`值，则决策树中的节点被分成两个节点；
 - `subSampleSize`：值位于[0；MAX_DOUBLE]区间中。此参数定义在具有替换的统一采样中采样重复的计数；
 - `seed`：用于随机生成器的种子值。

随机森林训练使用方法如下：
```java
RandomForestClassifierTrainer trainer = new RandomForestClassifierTrainer(featuresMeta)
  .withCountOfTrees(101)
  .withFeaturesCountSelectionStrgy(FeaturesCountSelectionStrategies.ONE_THIRD)
  .withMaxDepth(4)
  .withMinImpurityDelta(0.)
  .withSubSampleSize(0.3)
  .withSeed(0);

ModelsComposition rf = trainer.fit(
  datasetBuilder,
  featureExtractor,
  labelExtractor
);
```
### 15.15.4.示例
要了解如何在实践中使用随机森林分类器，可以尝试这个GitHub上的[示例](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/ml/tree/randomforest/RandomForestClassificationExample.java)，它也会随着每个Ignite发行版一起发布。在这个例子中，使用了一个葡萄酒识别数据集，该数据集和数据的描述可从[UCI机器学习存储库](https://archive.ics.uci.edu/ml/datasets/wine)获得。
## 15.16.梯度增强
### 15.16.1.概述
梯度增强是一种产生弱预测模型[集合形式](https://en.wikipedia.org/wiki/Ensemble_learning)预测模型的机器学习算法。梯度增强算法试图解决函数空间中每个函数都是模型的学习样本的最小化误差问题。这个组合中的每个模型都试图预测特征空间中点的误差梯度，并且这些预测将用一些权重求和以建模答案。该算法可用于回归和分类问题。更多信息可以参阅[维基百科](https://en.wikipedia.org/wiki/Gradient_boosting)。

在Ignite的机器学习中有一个通用`GDB`算法和`GDB-on-tree`算法的实现。通用`GDB`（`GDBRegressionTrainer`和`GDBBinaryClassifierTrainer`）允许任何训练器对每个模型进行组合训练。`GDB-on-trees`使用一些特定于树的优化，例如索引，以避免在决策树构建阶段进行排序。
### 15.16.2.模型
Ignite的机器学习的目的是使用`GDB`算法的所有实现来使用`GDBModel`，包装`ModelsComposition`来表示几个模型的组成。`ModelsComposition`实现了一个通用的模型接口，使用方式如下：
```java
GDBModel model = ...;
double prediction = model.apply(featureVector);
```
`GDBModel`使用`WeightedPredictionsAggregator`作为模型应答还原器。此聚合器计算元模型的答案，因为`result = bias + p1w1 + p2w2 + ...`，其中：

 - `pi`：第i个模型的答案；
 - `wi`：合成中模型的权重。`GDB`使用标签的平均值作为聚合器中的偏差参数。

### 15.16.3.训练器
`GDB`的训练分别由`GDBRegressionTrainer`、`GDBBinaryClassificationTrainer`和`GDBRegressionOnTreesTrainer`以及`GDBBinaryClassificationOnTreesTrainer`表示，分别用于通用`GDB`和`GDB-on-trees`，所有训练器都有以下参数：

 - `gradStepSize`：设置合成中每个模型的恒定权重；在Ignite机器学习的未来版本中，该参数可以动态计算；
 - `cntOfIterations`：在训练之后设置合成中的最大模型；
 - `checkConvergenceFactory`：设置收敛检查器的工厂，用于在训练时防止过拟合和学习许多无用的模型。

对于分类器训练器，有附加参数：

 - `loss`：从训练数据集中在部分训练样本上配置损失计算器；

收敛检查器有若干个工厂：

 - `ConvergenceCheckerStubFactory`：创建一个始终返回`false`进行收敛检查的检查器。因此，在这种情况下，模型的组成大小将具有`cntofiterations`模型；
 - `MeanAbsValueConvergenceCheckerFactory`：创建一个检查器，该检查器从数据集中计算每个样本的绝对梯度值的平均值，如果该平均值小于已定义的阈值，则返回`true`；
 - `MedianOfMedianConvergenceCheckerFactory`：创建一个检查器，用于计算每个数据分区上的绝对梯度值的中间值。该方法对学习数据集的异常不敏感，但`GDB`收敛时间较长。

训练示例：
```java
// Set up trainer
GDBTrainer trainer = new GDBBinaryClassifierOnTreesTrainer(
  learningRate, countOfIterations, new LogLoss()
).withCheckConvergenceStgyFactory(new MedianOfMedianConvergenceCheckFactory(precision));

// Build the model
GDBModel mdl = trainer.fit(
  datasetBuilder,
  featureExtractor,
  labelExtractor
);
```
### 15.16.4.示例
要了解在实践中如何使用`GDB`分类器，可以尝试GitHub上的[示例](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/ml/tree/boosting/GDBOnTreesClassificationTrainerExample.java)，它也会随着每个Ignite发行版一起发布。
## 15.17.模型更新
### 15.17.1.概述
Ignite机器学习中的模型更新接口使用之前训练过的模型的状态，支持在新数据上对已培训模型的重新学习。此接口表示为`DatasetTrainer`类，它以已学习过的模型作为第一个参数重复训练：

 - M update (`M mdl, DatasetBuilder<K, V> datasetBuilder, IgniteBiFunction<K, V, Vector> featureExtractor, IgniteBiFunction<K, V, L> lbExtractor`)；
 - M update (`M mdl, Ignite ignite, IgniteCache<K, V> cache, IgniteBiFunction<K, V, Vector> featureExtractor, IgniteBiFunction<K, V, L> lbExtractor`)；
 - M update (`M mdl, Ignite ignite, IgniteCache<K, V> cache, IgniteBiPredicate<K, V> filter, IgniteBiFunction<K, V, Vector> featureExtractor, IgniteBiFunction<K, V, L> lbExtractor`)；
 - M update(`M mdl, Map<K, V> data, int parts, IgniteBiFunction<K, V, Vector> featureExtractor, IgniteBiFunction<K, V, L> lbExtractor`)；
 - M update (`M mdl, Map<K, V> data, IgniteBiPredicate<K, V> filter, int parts, IgniteBiFunction<K, V, Vector> featureExtractor, IgniteBiFunction<K, V, L> lbExtractor`)。

该接口提供在线学习和在线批量学习。在线学习意味着你可以训练一个模型，当你得到一个新的学习样本时，比如点击一个网站，就可以更新这个模型，就像这个模型也是在这个样本上训练的一样。在线批量学习需要一批样本，而不是一个用于模型更新的训练样本。有些模型允许两种更新策略，有些只允许批量更新。这取决于学习算法。有关在线和在线批量学习方面的模型更新功能的更多详细信息，请参见下文。

注意：新的部分数据应该与之前训练的参数和数据集兼容，包括特征向量大小和特征值分布方面。比如，如果训练一个ANN模型，那么应该为训练器提供之前学习阶段的距离测量和候选参数计数。如果更新`k均值`，则新数据集应至少包含`k`行。

每个模型都有这个接口的特殊实现。下面会介绍每个算法的更新过程的更多内容。

### 15.17.2.K均值
模型更新采用已学习的质心，并通过新行更新它们。建议对此模型使用在线批量学习。首先，数据集的大小至少应等于k值。第二，具有少量行的数据集可以将质心移动到无效位置。
### 15.17.3.KNN
模型更新只是向旧数据集添加一个新的数据集。在这种情况下，模型更新不受限制。
### 15.17.4.ANN
与KNN一样，新训练器应提供相同的距离测量值和K值。这些参数很重要，因为在内部，人工神经网络使用K均值和K均值提供的质心统计数据。在更新过程中，训练器从之前学习中获取有关质心的统计信息，并用新的观察结果更新。从这个角度来看，ANN允许`小批量`在线学习，其中批量大小等于k参数。
### 15.17.5.神经网络（NN）
神经网络更新只是获取当前的神经网络状态，并根据新数据集上的误差梯度进行更新。在这种情况下，神经网络只需要不同数据集之间的特征向量兼容性。
### 15.17.6.逻辑回归
逻辑回归继承了神经网络训练器的所有限制，因为它在内部使用感知器。
### 15.17.7.线性回归
`LinearRegressionSGD`训练器继承了神经网络训练器的所有限制。`LinearRegressionLSQRTrainer`从上一次学习中恢复状态，并将其用作新数据集学习的第一近似值。这样，`LinearRegressionLSQRTrainer`也只需要特征向量的兼容性。
### 15.17.8.SVM
SVM训练器在训练过程中使用学习模型的状态作为第一近似值。从这个角度来看，该算法只需要特征向量的兼容性。
### 15.17.9.决策树
没有正确的决策树更新实现。更新会在给定的数据集上学习新模型。
### 15.17.10.GDB
GDB训练器更新已经从组合中学习了模型，并试图通过学习新模型预测梯度来最小化给定数据集上的误差梯度。它还使用收敛检查器，如果新数据集上没有大的误差，那么GDB会跳过更新阶段。因此GDB只需要特征向量兼容性。

注意：每次更新都会增加模型组成大小。所有的模型都互相依赖。因此，基于小数据集的频繁更新可以产生一个需要大量内存的巨大模型。
### 15.17.11.随机森林（RF）
RF训练器只需在给定的数据集上学习新的决策树，并将它们添加到已经学习过的合成中。通过这种方式，RF需要特征向量兼容性，并且数据集的大小应该大于一个元素，因为决策树不能在如此小的数据集上进行训练。与经过训练的合成中的GDB模型不同，RF模型彼此不依赖，如果合成太大，用户可以手动删除一些模型。
## 15.18.近似最近邻（ANN）
### 15.18.1.概述
近似最近邻搜索算法允许返回点，其距离查询最多为查询到最近点距离的C倍。

这种方法的吸引力在于，在许多情况下，近似最近邻几乎和精确的一样好。尤其是，如果距离度量准确地捕获了用户质量的概念，那么距离中的微小差异就不重要了。

ANN算法能够解决多类分类任务。Ignite的实现是一种启发式算法，它基于搜索较小的有限大小`N`个候选点（内部使用分布式K均值聚类算法查找质心），可以像KNN算法一样对类标签进行投票。

KNN与ANN的区别在于，在预测阶段，所有训练点都参与了KNN算法中K-最近邻的搜索，而在ANN中，该搜索仅从候选点的一小部分开始。

注意：如果N设置为训练集的大小，则在训练阶段花费大量时间后，ANN将减少到KNN。因此，选择N比K（例如10 x k、100 x k等）。
### 15.18.2.模型
ANN分类输出表示为一个类成员。一个对象是由它的邻居的多数票来分类的。对象被分配给一个特定的类，该类在其K最近邻中最常见。`K`是一个正整数，通常很小。当`K`为1时，有一种特殊情况，对象被简单地分配给单个最近邻的类。

目前，对于ANN分类算法，Ignite支持以下参数：

 - `k`：一组最近邻；
 - `distanceMeasure`：机器学习（ML）框架提供的距离度量之一，如欧几里得、汉明或曼哈顿；
 - `KNNStrategy`：可以是`SIMPLE`或`WEIGHTED`（它支持加权KNN算法）。

```java
NNClassificationModel knnMdl = trainer.fit(
...
).withK(5)
 .withDistanceMeasure(new EuclideanDistance())
 .withStrategy(NNStrategy.WEIGHTED);
```
### 15.18.3.训练器
ANN模型的训练器是基于K均值来计算候选子集的，这就是为什么它具有与K均值算法相同的参数来调整其超参数的原因。它不仅构建了一组候选对象，还构建了它们的类标签分布，以便在预测阶段为类标签投票。

目前，Ignite为`ANNClassificationTrainer`支持以下参数：

 - `k`：一些可能的簇；
 - `maxIterations`：一个停止标准（另一个是`epsilon`）；
 - `epsilon`：收敛增量（新旧质心值之间的增量）；
 - `distance`：ML框架提供的距离度量之一，如欧几里得、汉明或曼哈顿；
 - `seed`：有助于复制模型的初始化参数之一（训练器有一个随机初始化步骤来获取第一个质心）。

```java
// Set up the trainer
ANNClassificationTrainer trainer = new ANNClassificationTrainer()
  .withDistance(new ManhattanDistance())
  .withK(50)
  .withMaxIterations(1000)
  .withSeed(1234L)
  .withEpsilon(1e-2);

// Build the model
NNClassificationModel knnMdl = trainer.fit(
  ignite,
  dataCache,
  (k, v) -> VectorUtils.of(Arrays.copyOfRange(v, 1, v.length)),
  (k, v) -> v[0]
).withK(5)
 .withDistanceMeasure(new EuclideanDistance())
 .withStrategy(NNStrategy.WEIGHTED);
```
### 15.18.4.示例
要了解`ANNClassificationModel`在实践中是如何使用的，可以尝试GitHub上的这个[示例](https://github.com/apache/ignite/blob/master/examples/src/main/java/org/apache/ignite/examples/ml/knn/ANNClassificationExample.java)，它也会随着每个Ignite发行版一起发布。训练数据集是鸢尾花数据集，可以从[UCI机器学习库](https://archive.ics.uci.edu/ml/datasets/iris)获取。
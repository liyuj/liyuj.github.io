# 前言
本网站的内容主要来自于[Apache® Ignite™社区](https://ignite.apache.org)的[文档库](https://apacheignite.readme.io/docs)，非常感谢社区给予的支持！

Apache Ignite是一个分布式数据库，支持以内存级的速度处理PB级的数据。

本文档会介绍Ignite的核心功能，展示了特定功能的用法、如何对集群进行调优以及问题的排查方法。如果是新手，可以从[快速入门](/doc/java/QuickStartGuide.md)开始，然后5-10分钟就可以搭建第一个应用。
## 快速入门向导
通过下面的向导，可以在几分钟内构建出第一个应用：

 - [Java](/doc/java/QuickStartGuide.md#_1-java)；
 - [SQL](/doc/java/QuickStartGuide.md#_6-sql-通过命令行)；
 - [REST API](/doc/java/QuickStartGuide.md#_8-rest-api)；
 - [C#/.NET](/doc/java/QuickStartGuide.md#_2-c-net)；
 - [C++](/doc/java/QuickStartGuide.md#_3-c)；
 - [Python](/doc/java/QuickStartGuide.md#_4-python)；
 - [Node.js](/doc/java/QuickStartGuide.md#_5-node-js)；
 - [PHP](/doc/java/QuickStartGuide.md#_7-php)。
## 示例
Ignite的GitHub仓库中包含了很多可以直接运行的示例：

 - [Java](https://github.com/apache/ignite/tree/master/examples)；
 - [C#/.NET](https://github.com/apache/ignite/tree/master/modules/platforms/dotnet/examples)；
 - [C++](https://github.com/apache/ignite/tree/master/modules/platforms/cpp/examples)；
 - [Python](https://github.com/apache/ignite/tree/master/modules/platforms/python/examples)；
 - [Node.js](https://github.com/apache/ignite/tree/master/modules/platforms/nodejs/examples)；
 - [PHP](https://github.com/apache/ignite/tree/master/modules/platforms/php/examples)。

## 编程语言
Ignite可用于Java、.NET/C#和C++。Java版本提供了最丰富的API，.NET/C#和C++版本的功能有限。为了使本章节对所有开发者都友好，后续将遵守以下约定：

 - 除非另有说明，否则本章节中提供的信息适用于所有编程语言；
 - 如下所示，在不同的选项卡中提供了不同语言的代码示例。例如，如果是.NET开发者，请单击代码示例中的.NET选项卡以查看.NET相关代码：

<Tabs>
<Tab title="XML">

```
This is a place where an example of XML configuration is provided.
Click on other tabs to view an equivalent programmatic configuration.
```
</Tab>

<Tab title="Java">

```
Code sample in Java. Click on other tabs to view the same example in other languages.
```
</Tab>

<Tab title="C#/.NET">

```
Code sample in .NET. Click on other tabs to view the same example in other languages.
```
</Tab>

<Tab title="C++">

```
Code sample in C++. Click on other tabs to view the same example in other languages.
```
</Tab>
</Tabs>

 - 如果没有用于特定语言的选项卡，则最有可能意味着该语言不支持该功能。

<RightPane/>
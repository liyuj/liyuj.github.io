# 2.集群化
## 2.1.集群化
Ignite节点间可以自动发现。这有助于集群的按需扩展，而无需重新启动整个集群。开发者还可以利用Ignite的混合云支持，在私有云和公共云（如Amazon Web Services）之间建立连接，同时享有两者的优势。

![](https://files.readme.io/207fe68-ignite-deploy.png)

**特性**

 - 基于`IgniteDiscoverySpi`的可插拔设计；
 - 动态拓扑管理；
 - LAN, WAN和AWS之间的动态发现；
 - 按需直接部署；
 - 直接虚拟集群和节点分组。

## 2.2.领导者选举
在许多系统中，选举集群的领导者通常与数据一致性有关，通常通过收集集群成员的投票来处理。由于在Ignite中数据一致性是由网格类同函数（例如[约会哈希](http://en.wikipedia.org/wiki/Rendezvous_hashing)]）来处理，因此传统意义上为了数据一致性在网格之外选择领导者不是必需的。
## 2.3.集群配置
在Ignite中，使用`DiscoverySpi`可实现节点间的自动发现。

Ignite С++使用底层Spring XML文件来配置发现。具体请参见Ignite的[集群发现](/doc/java/Clustering.md#_2-5-集群发现)文档。
## 2.4.网络配置
网络配置请参见Ignite的[网络配置](/doc/java/Clustering.md#_2-8-网络配置)文档。
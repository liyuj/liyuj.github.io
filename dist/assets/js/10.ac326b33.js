(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{59:function(t,s,a){"use strict";a.r(s);var n=a(0),e=Object(n.a)({},(function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"apache-ignite上的tensorflow"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#apache-ignite上的tensorflow","aria-hidden":"true"}},[t._v("#")]),t._v(" Apache Ignite上的TensorFlow")]),t._v(" "),a("p",[t._v("任何深度学习都是从数据开始的，这是关键点。没有数据，就无法训练模型，也无法评估模型质量，更无法做出预测，因此，数据源非常重要。在做研究、构建新的神经网络架构、以及做实验时，会习惯于使用最简单的本地数据源，通常是不同格式的文件，这种方法确实非常有效。但有时需要更加接近于生产环境，那么简化和加速生产数据的反馈，以及能够处理大数据就变得非常重要，这时就需要Apache Ignite大展身手了。")]),t._v(" "),a("p",[a("a",{attrs:{href:"https://ignite.apache.org/",target:"_self",rel:"noopener noreferrer"}},[t._v("Apache Ignite")]),t._v("是以内存为中心的分布式数据库、缓存，也是事务性、分析性和流式负载的处理平台，可以实现PB级的内存级速度。借助Ignite和TensorFlow之间的现有集成，可以将Ignite用作神经网络训练和推理的数据源，也可以将其用作分布式训练的检查点存储和集群管理器。")]),t._v(" "),a("h2",{attrs:{id:"分布式内存数据源"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#分布式内存数据源","aria-hidden":"true"}},[t._v("#")]),t._v(" 分布式内存数据源")]),t._v(" "),a("p",[t._v("作为以内存为中心的分布式数据库，Ignite可以提供快速数据访问，摆脱硬盘的限制，在分布式集群中存储和处理需要的所有数据，可以通过使用Ignite Dataset来利用Ignite的这些优势。")]),t._v(" "),a("p",[t._v("注意Ignite不只是数据库或数据仓库与TensorFlow之间ETL管道中的一个步骤，它还是一个"),a("a",{attrs:{href:"https://en.wikipedia.org/wiki/Hybrid_transactional/analytical_processing_%28HTAP%29",target:"_self",rel:"noopener noreferrer"}},[t._v("HTAP")]),t._v("（混合事务/分析处理）系统。通过选择Ignite和TensorFlow，可以获得一个能够处理事务和分析的单一系统，同时还可以获得将操作型和历史型数据用于神经网络训练和推理的能力。")]),t._v(" "),a("p",[t._v("下面的测试结果表明，Ignite非常适合用于单节点数据存储场景。如果存储和客户端位于同一节点，则通过使用Ignite，可以实现每秒超过850MB的吞吐量，如果存储位于与客户端相关的远程节点，则吞吐量约为每秒800MB。")]),t._v(" "),a("p",[a("img",{attrs:{src:"https://mmbiz.qpic.cn/mmbiz_png/NkE3uMFiafXEPNCccKYTtFJPHPXjbwI5lGQouibW71rYjaiccUFdepnrakR2ABvh51KjcfuHQZTzYiaTNwBgicCxQNg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1",alt:""}})]),t._v(" "),a("blockquote",[a("p",[t._v("当存在一个本地Ignite节点时Ignite Dataset的吞吐量。执行该基准测试时使用的是2个Xeon E5–2609 v4 1.7GHz处理器，配备 16GB内存和每秒10Gb的网络（1MB的行和20MB 的页面大小）")])]),t._v(" "),a("p",[t._v("另一个测试显示Ignite Dataset如何与分布式Ignite集群协作。这是Ignite作为HTAP系统的默认用例，它能够在每秒10Gb的网络集群上为单个客户端实现每秒超过1GB的读取吞吐量。")]),t._v(" "),a("p",[a("img",{attrs:{src:"https://mmbiz.qpic.cn/mmbiz_png/NkE3uMFiafXEPNCccKYTtFJPHPXjbwI5lyq44HMU8C3o92iasRSNoPia3RWC0S5Lia6yXEa5niacLSjwtlOD9zv31gg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1",alt:""}})]),t._v(" "),a("blockquote",[a("p",[t._v("分布式Ignite集群具备不同数量的节点（从1到9）时Ignite Dataset的吞吐量。执行该测试时使用的是2个Xeon E5–2609 v4 1.7GHz处理器，配备16GB内存和每秒10Gb的网络（1MB的行和20MB的页面大小）")])]),t._v(" "),a("p",[t._v("测试后的用例如下：Ignite缓存（以及第一组测试中数量不同的分区和第二组测试中的2048个分区）由10000个大小为1MB的行填充，然后TensorFlow客户端使用Ignite Dataset读取所有数据。所有节点均为2个Xeon E5–2609 v4 1.7GHz处理器，配备16GB内存和每秒10Gb的网络连接，每个节点都使用"),a("a",{attrs:{href:"https://github.com/apache/ignite/blob/master/examples/config/example-default.xml",target:"_self",rel:"noopener noreferrer"}},[t._v("默认配置")]),t._v("运行Ignite。")]),t._v(" "),a("p",[t._v("可以很轻松地将Ignite同时用作支持SQL接口的传统数据库和TensorFlow数据源。")]),t._v(" "),a("div",{staticClass:"language-bash line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-bash"}},[a("code",[t._v("apache-ignite/bin/ignite.sh\napache-ignite/bin/sqlline.sh -u "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"jdbc:ignite:thin://localhost:10800/"')]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br")])]),a("div",{staticClass:"language-sql line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-sql"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("CREATE")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("TABLE")]),t._v(" KITTEN_CACHE "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("ID LONG "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("PRIMARY")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("KEY")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" NAME "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("VARCHAR")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("INSERT")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("INTO")]),t._v(" KITTEN_CACHE "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("VALUES")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'WARM KITTY'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("INSERT")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("INTO")]),t._v(" KITTEN_CACHE "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("VALUES")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'SOFT KITTY'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("INSERT")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("INTO")]),t._v(" KITTEN_CACHE "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("VALUES")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("3")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'LITTLE BALL OF FUR'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br")])]),a("div",{staticClass:"language-python line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-python"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" tensorflow "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("as")]),t._v(" tf\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" tensorflow"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("contrib"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("ignite "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" IgniteDataset\ntf"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("enable_eager_execution"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\ndataset "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" IgniteDataset"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("cache_name"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"SQL_PUBLIC_KITTEN_CACHE"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("for")]),t._v(" element "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("in")]),t._v(" dataset"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("print")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("element"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br"),a("span",{staticClass:"line-number"},[t._v("6")]),a("br"),a("span",{staticClass:"line-number"},[t._v("7")]),a("br"),a("span",{staticClass:"line-number"},[t._v("8")]),a("br")])]),a("div",{staticClass:"language- line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[t._v("{'key': 1, 'val': {'NAME': b'WARM KITTY'}}\n{'key': 2, 'val': {'NAME': b'SOFT KITTY'}}\n{'key': 3, 'val': {'NAME': b'LITTLE BALL OF FUR'}}\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br")])]),a("h2",{attrs:{id:"结构化对象"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#结构化对象","aria-hidden":"true"}},[t._v("#")]),t._v(" 结构化对象")]),t._v(" "),a("p",[t._v("使用Ignite可以存储任何类型的对象，这些对象可以具备任何层次结构。Ignite Dataset有处理此类对象的能力。")]),t._v(" "),a("div",{staticClass:"language-python line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-python"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" tensorflow "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("as")]),t._v(" tf\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" tensorflow"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("contrib"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("ignite "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" IgniteDataset\ntf"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("enable_eager_execution"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\ndataset "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" IgniteDataset"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("cache_name"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"IMAGES"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("for")]),t._v(" element "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("in")]),t._v(" dataset"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("take"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("print")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("element"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br"),a("span",{staticClass:"line-number"},[t._v("6")]),a("br"),a("span",{staticClass:"line-number"},[t._v("7")]),a("br"),a("span",{staticClass:"line-number"},[t._v("8")]),a("br")])]),a("div",{staticClass:"language-json line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-json"}},[a("code",[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n   'key'"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" 'kitten.png'"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n   'val'"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n       'metadata'"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n           'file_name'"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" b'kitten.png'"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n           'label'"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" b'little ball of fur'"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n           width"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("800")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n           height"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("600")]),t._v("\n       "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n       'pixels'"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" ..."),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\n   "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br"),a("span",{staticClass:"line-number"},[t._v("6")]),a("br"),a("span",{staticClass:"line-number"},[t._v("7")]),a("br"),a("span",{staticClass:"line-number"},[t._v("8")]),a("br"),a("span",{staticClass:"line-number"},[t._v("9")]),a("br"),a("span",{staticClass:"line-number"},[t._v("10")]),a("br"),a("span",{staticClass:"line-number"},[t._v("11")]),a("br"),a("span",{staticClass:"line-number"},[t._v("12")]),a("br")])]),a("p",[t._v("如果使用Ignite Dataset，则神经网络训练和其它计算所需的转换都可以作为"),a("a",{attrs:{href:"https://www.tensorflow.org/api_docs/python/tf/data",target:"_self",rel:"noopener noreferrer"}},[t._v("tf.data")]),t._v("管道的一部分来完成。")]),t._v(" "),a("div",{staticClass:"language-python line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-python"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" tensorflow "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("as")]),t._v(" tf\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" tensorflow"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("contrib"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("ignite "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" IgniteDataset\ntf"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("enable_eager_execution"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\ndataset "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" IgniteDataset"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("cache_name"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"IMAGES"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token builtin"}},[t._v("map")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("lambda")]),t._v(" obj"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" obj"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'val'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'pixels'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("for")]),t._v(" element "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("in")]),t._v(" dataset"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("print")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("element"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br"),a("span",{staticClass:"line-number"},[t._v("6")]),a("br"),a("span",{staticClass:"line-number"},[t._v("7")]),a("br"),a("span",{staticClass:"line-number"},[t._v("8")]),a("br")])]),a("div",{staticClass:"language- line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[t._v("[0, 0, 0, 0, ..., 0]\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br")])]),a("h2",{attrs:{id:"分布式训练"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#分布式训练","aria-hidden":"true"}},[t._v("#")]),t._v(" 分布式训练")]),t._v(" "),a("p",[t._v("作为机器学习框架，TensorFlow可以为分布式神经网络训练、推理及其它计算提供"),a("a",{attrs:{href:"https://www.tensorflow.org/deploy/distributed",target:"_self",rel:"noopener noreferrer"}},[t._v("原生支持")]),t._v("。分布式神经网络训练的主要理念是能够在每个数据分区（基于水平分区）上计算损失函数的梯度（例如误差的平方），然后对梯度求和，以得出整个数据集的损失函数梯度。借助这种能力，可以在数据所在的节点上计算梯度，减少梯度，最后更新模型参数。这样就无需在节点间传输数据，从而避免了网络瓶颈。")]),t._v(" "),a("p",[t._v("Ignite在分布式集群中使用水平分区存储数据。在创建Ignite缓存（或基于SQL的表）时，可以指定将要在此对数据进行分区的分区数量。例如，如果一个Ignite集群由100台机器组成，然后创建了一个有1000个分区的缓存，则每台机器将要维护10个数据分区。")]),t._v(" "),a("p",[t._v("Ignite Dataset可以利用分布式神经网络训练（使用TensorFlow）和Ignite分区两者的能力。Ignite Dataset是一个可以在远程工作节点上执行的计算图操作。远程工作节点可以通过为工作节点进程设置相应的环境变量（例如"),a("code",[t._v("IGNITE_DATASET_HOST")]),t._v("、"),a("code",[t._v("IGNITE_DATASET_PORT")]),t._v("或"),a("code",[t._v("IGNITE_DATASET_PART")]),t._v("）来替换Ignite Dataset的参数（例如主机、端口或分区）。使用这种替换方法，可以为每个工作节点分配一个特定分区，以使一个工作节点只处理一个分区，同时可以与单个数据集透明协作。")]),t._v(" "),a("div",{staticClass:"language-python line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-python"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" tensorflow "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("as")]),t._v(" tf\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" tensorflow"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("contrib"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("ignite "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" IgniteDataset\n\ndataset "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" IgniteDataset"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"IMAGES"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# Compute gradients locally on every worker node.")]),t._v("\ngradients "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("for")]),t._v(" i "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("in")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token builtin"}},[t._v("range")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("5")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("with")]),t._v(" tf"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("device"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"/job:WORKER/task:%d"')]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("%")]),t._v(" i"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n   device_iterator "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" tf"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("compat"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("v1"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("data"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("make_one_shot_iterator"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("dataset"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n   device_next_obj "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" device_iterator"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("get_next"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n   gradient "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" compute_gradient"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("device_next_obj"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n   gradients"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("append"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("gradient"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# Aggregate them on master node.")]),t._v("\nresult_gradient "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" tf"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("reduce_sum"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("gradients"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("with")]),t._v(" tf"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("Session"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"grpc://localhost:10000"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("as")]),t._v(" sess"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("print")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("sess"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("run"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("result_gradient"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br"),a("span",{staticClass:"line-number"},[t._v("6")]),a("br"),a("span",{staticClass:"line-number"},[t._v("7")]),a("br"),a("span",{staticClass:"line-number"},[t._v("8")]),a("br"),a("span",{staticClass:"line-number"},[t._v("9")]),a("br"),a("span",{staticClass:"line-number"},[t._v("10")]),a("br"),a("span",{staticClass:"line-number"},[t._v("11")]),a("br"),a("span",{staticClass:"line-number"},[t._v("12")]),a("br"),a("span",{staticClass:"line-number"},[t._v("13")]),a("br"),a("span",{staticClass:"line-number"},[t._v("14")]),a("br"),a("span",{staticClass:"line-number"},[t._v("15")]),a("br"),a("span",{staticClass:"line-number"},[t._v("16")]),a("br"),a("span",{staticClass:"line-number"},[t._v("17")]),a("br"),a("span",{staticClass:"line-number"},[t._v("18")]),a("br"),a("span",{staticClass:"line-number"},[t._v("19")]),a("br")])]),a("p",[t._v("借助Ignite，还可以使用TensorFlow的高级"),a("a",{attrs:{href:"https://www.tensorflow.org/guide/estimators",target:"_self",rel:"noopener noreferrer"}},[t._v("Estimator API")]),t._v("来进行分布式训练。此功能以所谓的TensorFlow分布式训练的"),a("a",{attrs:{href:"https://github.com/tensorflow/tensorflow/tree/master/tensorflow/contrib/distribute#standalone-client-mode",target:"_self",rel:"noopener noreferrer"}},[t._v("独立客户端模式")]),t._v("为基础，Ignite在其中发挥数据源和集群管理器的作用。")]),t._v(" "),a("h2",{attrs:{id:"检查点存储"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#检查点存储","aria-hidden":"true"}},[t._v("#")]),t._v(" 检查点存储")]),t._v(" "),a("p",[t._v("除数据库功能外，Ignite还有一个名为"),a("a",{attrs:{href:"https://ignite.apache.org/features/igfs.html",target:"_self",rel:"noopener noreferrer"}},[t._v("IGFS")]),t._v("的分布式文件系统。IGFS 可以提供与Hadoop HDFS类似的功能，但仅限于内存。事实上除了自有API外，IGFS还实现了Hadoop的FileSystem API，可以透明地部署到Hadoop或Spark环境中。Ignite上的TensorFlow支持IGFS与TensorFlow集成，该集成基于TensorFlow端的"),a("a",{attrs:{href:"https://www.tensorflow.org/extend/add_filesys",target:"_self",rel:"noopener noreferrer"}},[t._v("自定义文件系统插件")]),t._v("和Ignite端的"),a("a",{attrs:{href:"https://ignite.apache.org/features/igfs.html",target:"_self",rel:"noopener noreferrer"}},[t._v("IGFS原生API")]),t._v("，它有许多使用场景，比如：")]),t._v(" "),a("ul",[a("li",[t._v("可以将状态检查点保存到IGFS中，以获得可靠性和容错性；")]),t._v(" "),a("li",[t._v("训练过程可以通过将事件文件写入"),a("code",[t._v("TensorBoard")]),t._v("监视的目录来与"),a("code",[t._v("TensorBoard")]),t._v("通信。即使"),a("code",[t._v("TensorBoard")]),t._v("在不同的进程或机器中运行，IGFS也可以正常运行。")])]),t._v(" "),a("p",[t._v("TensorFlow在1.13版本中发布了此功能，并将在TensorFlow 2.0中作为"),a("a",{attrs:{href:"https://github.com/tensorflow/io",target:"_self",rel:"noopener noreferrer"}},[t._v("tensorflow/io")]),t._v("的一部分发布。")]),t._v(" "),a("h2",{attrs:{id:"ssl连接"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#ssl连接","aria-hidden":"true"}},[t._v("#")]),t._v(" SSL连接")]),t._v(" "),a("p",[t._v("通过Ignite，可以使用"),a("a",{attrs:{href:"https://en.wikipedia.org/wiki/Transport_Layer_Security",target:"_self",rel:"noopener noreferrer"}},[t._v("SSL")]),t._v("和认证机制来保护数据传输通道。Ignite Dataset同时支持有认证和无认证的SSL连接，具体信息请参见Ignite的"),a("a",{attrs:{href:"https://liyuj.gitee.io/doc/java/Security.html#_4-1-ssl%E5%92%8Ctls",target:"_self",rel:"noopener noreferrer"}},[t._v("SSL/TLS")]),t._v("文档。")]),t._v(" "),a("div",{staticClass:"language-python line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-python"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" tensorflow "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("as")]),t._v(" tf\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" tensorflow"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("contrib"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("ignite "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" IgniteDataset\ntf"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("enable_eager_execution"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\ndataset "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" IgniteDataset"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("cache_name"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"IMAGES"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n                       certfile"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"client.pem"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n                       cert_password"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"password"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n                       username"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"ignite"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n                       password"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"ignite"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br"),a("span",{staticClass:"line-number"},[t._v("6")]),a("br"),a("span",{staticClass:"line-number"},[t._v("7")]),a("br"),a("span",{staticClass:"line-number"},[t._v("8")]),a("br"),a("span",{staticClass:"line-number"},[t._v("9")]),a("br")])]),a("h2",{attrs:{id:"windows支持"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#windows支持","aria-hidden":"true"}},[t._v("#")]),t._v(" Windows支持")]),t._v(" "),a("p",[t._v("Ignite Dataset完全兼容Windows系统，可以在Windows和Linux/MacOS系统上将其用作TensorFlow的一部分。")]),t._v(" "),a("h2",{attrs:{id:"试用"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#试用","aria-hidden":"true"}},[t._v("#")]),t._v(" 试用")]),t._v(" "),a("p",[t._v("下面的示例非常有助于入门。")]),t._v(" "),a("p",[a("strong",[t._v("Ignite Dataset")])]),t._v(" "),a("p",[t._v("要试用Ignite Dataset，最简单的方法是运行装有Ignite和加载好的"),a("a",{attrs:{href:"http://yann.lecun.com/exdb/mnist/",target:"_self",rel:"noopener noreferrer"}},[t._v("MNIST")]),t._v("数据的"),a("a",{attrs:{href:"https://www.docker.com/",target:"_self",rel:"noopener noreferrer"}},[t._v("Docker")]),t._v("容器，然后使用Ignite Dataset与其交互。可以在Docker Hub："),a("a",{attrs:{href:"https://hub.docker.com/r/dmitrievanthony/ignite-with-mnist/",target:"_self",rel:"noopener noreferrer"}},[t._v("dmitrievanthony/ignite-with-mnist")]),t._v("上找到此容器，然后执行如下命令启动容器：")]),t._v(" "),a("div",{staticClass:"language-bash line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-bash"}},[a("code",[t._v("docker run -it -p "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("10800")]),t._v(":10800 dmitrievanthony/ignite-with-mnist\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br")])]),a("p",[t._v("然后可以按照如下方法进行使用：")]),t._v(" "),a("p",[a("img",{attrs:{src:"https://mmbiz.qpic.cn/mmbiz_png/NkE3uMFiafXEPNCccKYTtFJPHPXjbwI5l8IcbAEJMnibNJibdAnJhdcbOibcnKC1u4AgibdwVEcgFlkYGGJS5I6r50Q/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1",alt:""}})]),t._v(" "),a("h2",{attrs:{id:"igfs"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#igfs","aria-hidden":"true"}},[t._v("#")]),t._v(" IGFS")]),t._v(" "),a("p",[t._v("TensorFlow的IGFS支持于TensorFlow 1.13中发布，并将在TensorFlow 2.0中作为"),a("a",{attrs:{href:"https://github.com/tensorflow/io",target:"_self",rel:"noopener noreferrer"}},[t._v("tensorflow/io")]),t._v("的一部分发布。如要通过TensorFlow试用IGFS，最简单的方法是运行一个装有Ignite和IGFS的"),a("a",{attrs:{href:"https://www.docker.com/",target:"_self",rel:"noopener noreferrer"}},[t._v("Docker")]),t._v("容器，然后使用TensorFlow的"),a("a",{attrs:{href:"https://www.tensorflow.org/api_docs/python/tf/gfile",target:"_self",rel:"noopener noreferrer"}},[t._v("tf.gfile")]),t._v("与之交互。可以在Docker Hub："),a("a",{attrs:{href:"https://hub.docker.com/r/dmitrievanthony/ignite-with-igfs/",target:"_self",rel:"noopener noreferrer"}},[t._v("dmitrievanthony/ignite-with-igfs")]),t._v("上找到此容器，然后执行如下命令启动容器：")]),t._v(" "),a("div",{staticClass:"language-bash line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-bash"}},[a("code",[t._v("docker run -it -p "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("10500")]),t._v(":10500 dmitrievanthony/ignite-with-igfs\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br")])]),a("p",[t._v("然后可以按照如下方法进行使用：")]),t._v(" "),a("div",{staticClass:"language-python line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-python"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" tensorflow "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("as")]),t._v(" tf\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" tensorflow"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("contrib"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("ignite"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("python"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("ops"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("igfs_ops\n\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("with")]),t._v(" tf"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("gfile"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("Open"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"igfs:///hello.txt"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" mode"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'w'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("as")]),t._v(" w"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n w"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("write"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"Hello, world!"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("with")]),t._v(" tf"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("gfile"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("Open"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"igfs:///hello.txt"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" mode"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'r'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("as")]),t._v(" r"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("print")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("r"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("read"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br"),a("span",{staticClass:"line-number"},[t._v("6")]),a("br"),a("span",{staticClass:"line-number"},[t._v("7")]),a("br"),a("span",{staticClass:"line-number"},[t._v("8")]),a("br")])]),a("div",{staticClass:"language- line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[t._v("Hello, world!\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br")])]),a("h2",{attrs:{id:"限制"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#限制","aria-hidden":"true"}},[t._v("#")]),t._v(" 限制")]),t._v(" "),a("p",[t._v("目前，Ignite Dataset要求缓存中的所有对象都具有相同的结构（同类型对象），并且缓存中至少包含一个检索模式所需的对象。另一个限制与结构化对象有关，Ignite Dataset不支持UUID、Map和可能是对象结构组成部分的对象数组。")]),t._v(" "),a("h2",{attrs:{id:"即将发布的tensorflow-2-0"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#即将发布的tensorflow-2-0","aria-hidden":"true"}},[t._v("#")]),t._v(" 即将发布的TensorFlow 2.0")]),t._v(" "),a("p",[t._v("TensorFlow 2.0中会将此功能拆分到"),a("a",{attrs:{href:"https://github.com/tensorflow/io",target:"_self",rel:"noopener noreferrer"}},[t._v("tensorflow/io")]),t._v("模块，这样会更灵活。这些示例将略有改动，后续的文档和示例都会更新。")])])}),[],!1,null,null,null);s.default=e.exports}}]);
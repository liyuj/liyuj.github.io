<template>
  <div class="theme-container" :class="pageClasses">
   <Navbar/>
   <section id="slider" class="slider-area">
      <div class="container">
         <div class="intro-text clearfix">
            <h2 style="font-size:40px;">轻量级分布式内存HTAP数据库及计算平台</h2>
            <h3>全功能分布式内存架构解决方案，中国唯一Ignite技术咨询/服务商</h3>
         </div>
      </div>
   </section>
   <script>document.getElementById('slider').style.height=(document.documentElement.clientHeight) +'px';</script>
	<section id="aboutus" class="aboutus-area section-small">
		<div class="container">
			<div class="row">
				<div class="col-md-5 col-sm-6">
					<div class="about-content">
						<h5>关于Apache Ignite</h5>
						<h3 style="font-size:24px;">Apache Ignite是一套基于内存的集成化企业级分布式架构解决方案，面向数据密集型应用，比传统技术具有更高的性能，其在一个统一的平台中整合了如下技术：</h3>
							<ul style="color:red">
                                 <li>支持标准SQL的分布式内存键-值数据网格</li>
                                 <li>分布式事务支持</li>
                                 <li>原生的持久化（分布式内存数据库模式）</li>
                                 <li>分布式内存计算引擎</li>
                                 <li>流处理框架集成</li>
                                 <li>RDBMS集成（关系型数据库缓存）</li>
                                 <li>机器学习</li>
                                 <li>Spark和Cassandra等的集成支持</li>
                              </ul>
					</div>
				</div>
				<div class="col-md-7 col-sm-6">
					<div class="about-img">
						<img src="img/about.png" alt="">
					</div>
				</div>
			</div>
		</div>
	</section>
   <section id="services" class="hero-box-area">
	<div class="container">
		<div class="row">
			<!-- Hero box -->
			<div class="col-md-3 col-sm-6">
				<div class="hero-box box-one">
					<span class="fa fa-hand-grab-o"></span>
					<h3>以内存为中心</h3>
					<p>强大的以内存为中心的架构，可以提供更高的性能，作为缓存可为已有的各种类型应用加速</p>
				</div>
			</div>
			<!-- Hero box -->
			<div class="col-md-3 col-sm-6">
				<div class="hero-box box-two">
					<span class="fa fa-hand-pointer-o"></span>
					<h3>独特功能优势</h3>
					<p>支持原生持久化的分布式内存数据库、事务化的键-值API、分布式计算框架、易于与各种技术集成、支持机器学习等</p>
				</div>
			</div>
			<!-- Hero box -->
			<div class="col-md-3 col-sm-6">
				<div class="hero-box box-three">
					<span class="fa fa-hand-peace-o"></span>
					<h3>全套解决方案</h3>
					<p>作为全功能的分布式架构解决方案，功能强大，开发容易，帮助客户简化技术堆栈</p>
				</div>
			</div>
			<div class="col-md-3 col-sm-6">
				<div class="hero-box box-four">
					<span class="fa fa-hand-paper-o"></span>
					<h3>综合成本低廉</h3>
					<p>解决大型企业的各种系统面临的复杂问题，对已有系统无需做大的调整甚至推倒重来，综合成本低</p>
				</div>
			</div>
		</div>
	</div>
</section>
<div id="workhin" class="working-process">
	<div class="container">
		<div class="row">
			<div class="col-md-12 text-center">
				<div class="section-title">
					<h2 style="font-size:36px;">适用场景</h2>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="working-boxs">
				<div class="col-md-3 col-sm-6 col-xs-12">
					<div class="working-box">
					   <span class="fa fa-automobile"></span>
					   <h3>实时业务场景</h3>
					   <h4>RDBMS缓存和实时分析</h4>
					   <div class="hexagon"> 01 </div>
					   <p>可以为RDBMS压力较大的业务提供缓存服务，提高整个系统的性能，同时支持KV操作和SQL操作；Ignite的计算网格功能支持数据的实时分析，通过分布式架构，支持对海量数据的快速分析，快速反馈，计算能力可以线性扩展</p>
				   </div>
				</div>
				<div class="col-md-3 col-sm-6 col-xs-12">
					<div class="working-box">
					   <span class="fa fa-train"></span>
					   <h3>离线业务场景</h3>
					   <h4>分析性业务和存储过程替代</h4>
					   <div class="hexagon"> 02 </div>
					   <p>对于数据量大、业务复杂的传统分析型业务，可以将大量的数据缓存到内存中，然后通过SQL进行查询统计分析，也可以通过分布式计算进行数据处理；通过分布式计算替代传统的存储过程，解决存储过程运算速度慢，无法线性扩展的问题</p>
					</div>
				</div>

				<div class="col-md-3 col-sm-6 col-xs-12">
					<div class="working-box">
					   <span class="fa fa-plane"></span>
					   <h3>独立大数据平台</h3>
					   <h4>分布式内存数据库</h4>
					   <div class="hexagon"> 03 </div>
					   <p>Ignite可以独立搭建大数据平台，开启持久化可作为独立分布式数据库，对数据进行整合后，可以对外提供各种各样的服务，比如海量数据的高速查询服务、对数据进行分析后的增值服务、甚至机器学习等；软件开发商也可以基于Ignite进行行业解决方案开发</p>
				   </div>
				</div>
				<div class="col-md-3 col-sm-6 col-xs-12">
					<div class="working-box">
					   <span class="fa fa-rocket"></span>
					   <h3>业务整合场景</h3>
					   <h4>分布式应用开发框架</h4>
					   <div class="hexagon"> 04 </div>
					   <p>Ignite可以与传统应用紧密整合，在不颠覆已有架构的前提下，帮助用户进行分布式架构转型。为传统业务系统提供加速能力的同时，引入众多的先进技术，大幅提升原有系统的能力从而延长已有架构的寿命，保护客户的原有投资</p>
				   </div>
				</div>
			</div>
		</div>
	</div>
</div>
<!-- Footer area starts -->
	<footer id="footer" class="footer-area">
		<div class="container">
			<div class="row">
				<div class="col-md-12 text-center">
					<p>Copyright &copy; 2019-2020 沈阳开源技术咨询服务有限公司 <a href="http://www.beian.miit.gov.cn/" target="_blank" style="color: #000000;">辽ICP备20001956号</a></p>
				</div>
			</div>
		</div>
	</footer>
	<div class="right-pale">
		<div class="right-content">
			<div class="bbox tell-box">
			<button class="btn btn-circle btn-success right-tell"><i class="fa fa-lg fa-phone"></i></button>
			<p class="tell-hide">
				18624049226
			</p>
			</div>
			<div class="bbox weixin-box">
			<button class="btn btn-circle btn-success right-weixin"><i class="fa fa-weixin"></i></button>
			<p class="tell-hide" style="padding:10px;">
				<img src="/img/weixin.jpg">
			</p>
			</div>
		</div>
	</div>
  </div>
</template>
<script>
import Navbar from '@theme/components/Navbar.vue'
export default {
  name: 'HomeLayout',
  components: {Navbar},
  data() {return {}},
  computed: {},
  mounted() {},
  methods: {}
}
</script>

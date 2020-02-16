<template>
  <div class="theme-container" :class="pageClasses">
   <Navbar/>

   <section id="services" class="hero-box-area section-big" style="padding-bottom:10px;padding-top:100px">
	<div class="container">
		<div class="row">
			<div class="col-md-12 text-center" style="height:50px">
				<div class="section-title">
					<h2 style="font-size:36px">服务内容</h2>
				</div>
			</div>
		</div>
		<div class="row">
			<div class="col-md-3 col-sm-6">
				<div class="hero-box">
					<span class="fa fa-battery-0"></span>
					<h3>免费技术交流群</h3>
					<h4>面向开发者</h4>
					<p>Ignite/GridGain产品资讯、功能介绍、组织民间交流等，无服务等级保证</p>
				</div>
			</div>
			<!-- Hero box -->
			<div class="col-md-3 col-sm-6">
				<div class="hero-box">
					<span class="fa fa-battery-1"></span>
					<h3>付费会员制服务群</h3>
					<h4>面向开发者</h4>
					<p>Ignite功能讲解/答疑、指导POC/应用开发、问题处理指引，当日问题当日内不定期回复</p>
				</div>
			</div>
			<!-- Hero box -->
			<div class="col-md-3 col-sm-6">
				<div class="hero-box">
					<span class="fa fa-battery-2"></span>
					<h3>远程技术支持服务</h3>
					<h4>面向企业</h4>
					<p>初始技术调查、Ignite专题介绍/远程培训、协助POC、架构设计规划/评审、协助解决具体的测试/生产问题、系统性能/扩展性优化等个性化需求，预约时间即时响应</p>
				</div>
			</div>
			<div class="col-md-3 col-sm-6">
				<div class="hero-box">
					<span class="fa fa-battery-4"></span>
					<h3>驻场技术支持服务</h3>
					<h4>面向企业</h4>
					<p>现场解决客户的各种个性化需求/问题，最高响应速度</p>
				</div>
			</div>
		</div>
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
</section>
<!-- Footer area starts -->
<footer id="footer" class="footer-area">
	<div class="container">
		<div class="row">
			<div class="col-md-12 text-center">
				<p>Copyright &copy; 2020</p>
			</div>
		</div>
	</div>
</footer>
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

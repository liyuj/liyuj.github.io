<template>
  <div class="theme-container" :class="pageClasses">
   <Navbar/>

   <section id="services" class="hero-box-area section-big">
	<div class="container">

		<div class="row">
			<div class="col-md-12 text-center">
				<div class="section-title">
					<h2 style="font-size:36px">服务内容</h2>
				</div>
			</div>
		</div>
		<div class="row">
			<!-- Hero box -->
			<div class="col-md-4 col-sm-6">
				<div class="hero-box box-one">
					<span class="fa fa-battery-1"></span>
					<h3>付费会员制服务群</h3>
					<p>Ignite功能讲解/答疑、指导POC、问题处理指引，当日问题当日内不定期回复</p>
				</div>
			</div>

			<!-- Hero box -->
			<div class="col-md-4 col-sm-6">
				<div class="hero-box box-two">
					<span class="fa fa-battery-2"></span>
					<h3>远程技术支持服务</h3>
					<p>远程培训、协助POC、架构设计规划和评审、协助解决具体的测试/生产问题、系统性能和扩展性优化等个性化需求，预约时间即时响应</p>
				</div>
			</div>
			<div class="col-md-4 col-sm-6">
				<div class="hero-box box-three">
					<span class="fa fa-battery-4"></span>
					<h3>驻场技术支持服务</h3>
					<p>提供现场培训、原型开发等各种个性化需求，最高响应速度</p>
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

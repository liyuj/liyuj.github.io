<template>
  <div class="theme-container" :class="pageClasses"@touchstart="onTouchStart"
    @touchend="onTouchEnd">
   <Navbar v-if="shouldShowNavbar" @toggle-sidebar="toggleSidebar"/>
   <div
      class="sidebar-mask"
      @click="toggleSidebar(false)"
    />

    <Sidebar
      :items="sidebarItems"
      @toggle-sidebar="toggleSidebar"
    >
      <template #top>
        <slot name="sidebar-top" />
      </template>
      <template #bottom>
        <slot name="sidebar-bottom" />
      </template>
    </Sidebar>

   <section id="home">
    <!-- Background Image -->
    <div class="bg-img" style="background-image: url('../img/background1.jpg');">
      <div class="overlay"></div>
    </div>
    <!-- home wrapper -->
    <div class="home-wrapper">
      <div class="container">
        <div class="row">

          <!-- home content -->
          <div class="col-md-10 col-md-offset-1">
            <div class="home-content">
              <h2 class="white-text" style="font-size:36px">轻量级分布式内存HTAP数据库&计算平台</h2>
              <p class="white-text">GridGain产品&技术服务中国总代理，GridGain认证技术专家
              </p>
              <br/>
              <br/>                            
              <button class="white-btn" onclick="window.location.href='/Service.html'">GridGain技术支持服务</button>
              <button class="white-btn" onclick="window.location.href='/Service.html'">本土咨询顾问服务</button>
              <button class="white-btn" onclick="window.location.href='/Service.html'">付费开发者服务</button>
              <button class="white-btn" onclick="window.location.href='/Service.html'">免费开发者服务</button>
            </div>
          </div>
          <!-- /home content -->

        </div>
      </div>
    </div>
    <!-- /home wrapper -->
  </section>
	<section id="aboutus" class="aboutus-area section-small">
		<div class="container">
			<div class="row">
				<div class="col-md-5 col-sm-6">
					<div class="about-content">
						<h5>关于GridGain/Ignite</h5>
						<h3 style="font-size:24px;">典型应用场景：</h3>
							<ul style="color:red">
								 <li>追求高性能和线性扩展能力</li>
                                 <li>关系型数据库缓存</li>
                                 <li>实时/离线分析型业务和存储过程替代</li>
								 <li>大规模并行计算平台</li>
                                 <li>Redis/GemFire(Geode)/Coherence等软件替代</li>
                                 <li>分布式内存数据库</li>
                                 <li>数据集成中心</li>
                                 <li>Spark/Hadoop加速器</li>
                                 <li>分布式应用开发框架</li>                                 
                              </ul>
					</div>
				</div>
				<div class="col-md-7 col-sm-6">
					<div class="about-img">
						<img src="img/Ignite-architecture.png" alt="">
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
<section id="team" class="team-area">
	<div class="container">

		<div class="row">
			<div class="col-md-12 text-center">
				<div class="section-title">
					<h2>架构模式</h2>
					<p>灵活的分布式架构解决方案</p>
				</div>
			</div>
		</div>

		<div class="row">

			<div class="col-md-3 col-sm-6">
				<div class="member">
					<div class="member-img">
						<img src="img/team/1.png" alt="">
					</div>
				</div>
			</div>

			<div class="col-md-3 col-sm-6">
				<div class="member">
					<div class="member-img">
						<img src="img/team/2.png" alt=""> 
					</div>
				</div>
			</div>

			<div class="col-md-3 col-sm-6">
				<div class="member">
					<div class="member-img">
						<img src="img/team/3.png" alt=""> 
					</div>
				</div>
			</div>

			<div class="col-md-3 col-sm-6">
				<div class="member">
					<div class="member-img">
						<img src="img/team/4.png" alt=""> 
					</div>
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
					<p>声明：本公司与<a target="_blank" style="color: red;" href="https://www.apache.org">Apache软件基金会（ASF）</a>以及<a href="https://ignite.apache.org" target="_blank" style="color: red;">Apache Ignite社区</a>不存在任何隶属关系，也不提供相互担保。</p>

					<p>Copyright &copy; 2019-2020 沈阳开源技术咨询服务有限公司 <a href="http://www.beian.miit.gov.cn/" target="_blank" style="color: #2c3e50;">辽ICP备20001956号</a></p>
				</div>
			</div>
		</div>
	</footer>
	<RightPane/>
  </div>
</template>
<script>
import Navbar from '@theme/components/Navbar.vue'
import Sidebar from '@theme/components/Sidebar.vue'
import { resolveSidebarItems } from '@theme/util'
export default {
  name: 'HomeLayout',

  components: {Sidebar,Navbar},

  data () {
    return {
      isSidebarOpen: false
    }
  },

  computed: {
    shouldShowNavbar () {
      const { themeConfig } = this.$site
      const { frontmatter } = this.$page
      if (
        frontmatter.navbar === false
        || themeConfig.navbar === false) {
        return false
      }
      return (
        this.$title
        || themeConfig.logo
        || themeConfig.repo
        || themeConfig.nav
        || this.$themeLocaleConfig.nav
      )
    },

    shouldShowSidebar () {
      const { frontmatter } = this.$page
      return (
        !frontmatter.home
        && frontmatter.sidebar !== false
        && this.sidebarItems.length
      )
    },

    sidebarItems () {
      return resolveSidebarItems(
        this.$page,
        this.$page.regularPath,
        this.$site,
        this.$localePath
      )
    },

    pageClasses () {
      const userPageClass = this.$page.frontmatter.pageClass
      return [
        {
          'no-navbar': !this.shouldShowNavbar,
          'sidebar-open': this.isSidebarOpen,
          'no-sidebar': !this.shouldShowSidebar
        },
        userPageClass
      ]
    }
  },

  mounted () {
    this.$router.afterEach(() => {
      this.isSidebarOpen = false
    })
  },

  methods: {
    toggleSidebar (to) {
      this.isSidebarOpen = typeof to === 'boolean' ? to : !this.isSidebarOpen
      this.$emit('toggle-sidebar', this.isSidebarOpen)
    },

    // side swipe
    onTouchStart (e) {
      this.touchStart = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      }
    },

    onTouchEnd (e) {
      const dx = e.changedTouches[0].clientX - this.touchStart.x
      const dy = e.changedTouches[0].clientY - this.touchStart.y
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        if (dx > 0 && this.touchStart.x <= 80) {
          this.toggleSidebar(true)
        } else {
          this.toggleSidebar(false)
        }
      }
    }
  }
}
</script>
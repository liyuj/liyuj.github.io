<template>
  <div class="theme-container" :class="pageClasses"@touchstart="onTouchStart"
    @touchend="onTouchEnd">
   <Navbar v-if="shouldShowNavbar" @toggle-sidebar="toggleSidebar"/>
   <div class="sidebar-mask" @click="toggleSidebar(false)"/>
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

     <section id="clients">
	<!-- CONTAINER FLUID -->
	<div class="container-fluid text-center">
		<h3 class="headline scroll-animated-from-bottom">What Clients say about us.</h3>
		<!-- CLIENT FEEDBACK -->
		<div class="client-feedback">
			<!-- CLIENT FEEDBACK ITEM -->
			<div class="client-feedback-item row">
				<!-- COLUMN -->
				<div class="col-sm-3 text-center scroll-animated-from-bottom"  style="color:red">
          <span class="fa fa-battery-0" style="font-size:36px;margin:20px"></span>
					<h3 style="font-size:18px;margin:0 0 10px 0">免费开发者交流群</h3>
          <h4>面向开发者</h4>
				</div>
				<!-- /COLUMN -->
				<!-- COLUMN -->
				<div class="col-sm-9 text-left scroll-animated-from-bottom" style="padding-top:10px;border-left:1px dashed #777">
          <h4>服务内容：</h4>
					开发者间交流平台，Ignite/GridGain产品资讯、功能介绍，不保证响应
          <h4>服务报价：</h4>免费
				</div>
				<!-- /COLUMN -->
			</div>
      <div class="col-sm-12" style="border-top:1px dashed #777"></div>
			<!-- /CLIENT FEEDBACK ITEM -->
			<!-- CLIENT FEEDBACK ITEM -->
			<div class="client-feedback-item row">
				<!-- COLUMN -->
				<div class="col-sm-3 text-center scroll-animated-from-bottom"  style="color:red">
          <span class="fa fa-battery-1" style="font-size:36px;margin:20px"></span>
					<h3 style="font-size:18px;margin:0 0 10px 0">付费开发者服务群</h3>
          <h4>面向开发者</h4>
				</div>
				<!-- /COLUMN -->
				<!-- COLUMN -->
				<div class="col-sm-9 text-left scroll-animated-from-bottom" style="padding-top:10px;border-left:1px dashed #777">
					<h4>服务内容：</h4>Ignite功能讲解/答疑、指导POC/应用开发/架构设计、问题处理指引，当日问题当日内不定期响应<br>
          <h4>服务报价：</h4>100元/半月/人，150元/月/人，300元/季/人，500元/半年/人
				</div>
				<!-- /COLUMN -->
			</div>
      <div class="col-sm-12" style="border-top:2px dashed #777"></div>
			<!-- /CLIENT FEEDBACK ITEM -->
			<!-- CLIENT FEEDBACK ITEM -->
			<div class="client-feedback-item row">
				<!-- COLUMN -->
				<div class="col-sm-3 text-center scroll-animated-from-bottom"  style="color:red">
          <span class="fa fa-battery-2" style="font-size:36px;margin:20px"></span>
					<h3 style="font-size:18px;margin:0 0 10px 0">远程咨询顾问服务</h3>
          <h4>面向企业</h4>
				</div>
				<!-- /COLUMN -->
				<!-- COLUMN -->
				<div class="col-sm-9 text-left scroll-animated-from-bottom" style="padding-top:10px;border-left:1px dashed #777">
					<h4>服务内容：</h4>初始技术调查、Ignite专题介绍/远程培训、协助POC、技术架构咨询/规划/评审、协助解决具体的测试/生产问题、系统性能/扩展性优化等，预约时间即时响应
          <h4>服务报价：</h4>免费初始交流/2小时内，3000元/周，5000元/半月，8000元/月，2万元/季，4万元/半年，8万元/年
				</div>
				<!-- /COLUMN -->
			</div>
      <div class="col-sm-12" style="border-top:3px dashed #777"></div>
      <div class="client-feedback-item row">
				<!-- COLUMN -->
				<div class="col-sm-3 text-center scroll-animated-from-bottom" style="color:red">
          <span class="fa fa-battery-4" style="font-size:36px;margin:20px"></span>
					<h3 style="font-size:18px;margin:0 0 10px 0">驻场咨询顾问服务</h3>
          <h4>面向企业</h4>
				</div>
				<!-- /COLUMN -->
				<!-- COLUMN -->
				<div class="col-sm-9 text-left scroll-animated-from-bottom" style="padding-top:10px;border-left:1px dashed #777">
					<h4>服务内容：</h4>现场解决客户的各种个性化需求/问题，随时响应
          <h4>服务报价：</h4>3000元/核算日，长期合作可议价。
				</div>
				<!-- /COLUMN -->
			</div>
			<!-- /CLIENT FEEDBACK ITEM -->
		</div>
		<!-- /CLIENT FEEDBACK -->
	</div>
	<!-- /CONTAINER FLUID -->
</section>

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
import Sidebar from '@theme/components/Sidebar.vue'
import { resolveSidebarItems } from '@theme/util'
export default {
  name: 'ServiceLayout',

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
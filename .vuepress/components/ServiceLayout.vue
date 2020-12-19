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
				<div class="col-sm-3 text-center scroll-animated-from-bottom"  style="color:red">
          <span class="fa fa-battery-4" style="font-size:36px;margin:20px 0 10px 0"></span>
					<h3 style="font-size:18px;margin:0 0 10px 0">GridGain社区版服务</h3>
          <h4>面向企业</h4>
				</div>
				<!-- /COLUMN -->
				<!-- COLUMN -->
				<div class="col-sm-9 text-left scroll-animated-from-bottom" style="padding-top:10px;border-left:4px dashed #777">
          <h4><span>服务内容：</span><span style="font-weight:normal">初始技术调查，Ignite专题介绍/远程培训，协助POC/技术架构咨询/规划/评审，协助解决具体的测试/生产问题、系统性能/扩展性优化等，GridGain基础版服务（社区版版本更新），GridGain标准版服务（社区版版本更新+紧急修复补丁）</span></h4>
          <h4><span>服务方式：</span><span style="font-weight:normal">中国服务商实施（远程/驻场），GridGain远程（基础版/标准版服务）</span></h4>
          <h4><span>服务报价：</span><span style="font-weight:normal">按年度订阅，GridGain服务包（按GCU计费，全款预付）+ 中国服务商服务包（标准远程服务10万元，驻场服务3000元/核算日，可分期付款）</span></h4>
				</div>
				<!-- /COLUMN -->
			</div>
      <div class="col-sm-12" style="border-top:4px dashed #777"></div>
			<!-- /CLIENT FEEDBACK ITEM -->
			<!-- CLIENT FEEDBACK ITEM -->
			<div class="client-feedback-item row">
				<!-- COLUMN -->
				<div class="col-sm-3 text-center scroll-animated-from-bottom"  style="color:red">
          <span class="fa fa-battery-3" style="font-size:36px;margin:10px 0 10px 0"></span>
					<h3 style="font-size:18px;margin:0 0 10px 0">技术咨询顾问服务</h3>
          <h4>面向企业</h4>
				</div>
				<!-- /COLUMN -->
				<!-- COLUMN -->
				<div class="col-sm-9 text-left scroll-animated-from-bottom" style="padding-top:10px;border-left:3px dashed #777">
					<h4><span>服务内容：</span><span style="font-weight:normal">初始技术调查，Ignite专题介绍/远程培训，协助POC/业务原型开发/Ignite定制化（驻场）、技术架构咨询/规划/评审，协助解决具体的测试/生产问题、Ignite问题确认并提供折衷方案、系统性能/扩展性优化等。</span></h4>
          <h4><span>服务方式：</span><span style="font-weight:normal">远程（远程接入/网络会议/电话/即时通信软件/邮件）/驻场</span></h4>
          <h4><span>服务报价：</span><span style="font-weight:normal">远程（6千元/半月，1万元/月，2.5万元/季，5万元/半年，10万元/年），驻场（3000元/核算日，4.5万元/月，长期合作面议）</span></h4>
				</div>
				<!-- /COLUMN -->
			</div>
      <div class="col-sm-12" style="border-top:3px dashed #777"></div>
			<!-- /CLIENT FEEDBACK ITEM -->
			<!-- CLIENT FEEDBACK ITEM -->
			<div class="client-feedback-item row">
				<!-- COLUMN -->
				<div class="col-sm-3 text-center scroll-animated-from-bottom"  style="color:red">
          <span class="fa fa-battery-2" style="font-size:36px;margin:25px 0 10px 0"></span>
					<h3 style="font-size:18px;margin:0 0 10px 0">远程技术支持服务</h3>
          <h4>面向企业</h4>
				</div>
				<!-- /COLUMN -->
				<!-- COLUMN -->
				<div class="col-sm-9 text-left scroll-animated-from-bottom" style="padding-top:10px;border-left:2px dashed #777">
					<h4><span>服务内容：</span><span style="font-weight:normal">初始技术调查，Ignite功能讲解/答疑，指导POC/应用开发，指导解决具体的测试/生产问题（需配合提供完整日志等必要的信息）、Ignite问题确认并提供折衷方案、系统性能/扩展性优化等。</span></h4>
          <h4><span>服务方式：</span><span style="font-weight:normal">语音（优先）/即时通信软件/电子邮件</span></h4>
          <h4><span>服务时间：</span><span style="font-weight:normal">8:30～21:30</span></h4>
          <h4><span>服务报价：</span><span style="font-weight:normal">200元/半月/人，300元/月/人，600元/季/人，1000元/半年/人，1800元/年/人</span></h4>
				</div>
				<!-- /COLUMN -->
			</div>
      <div class="col-sm-12" style="border-top:2px dashed #777"></div>
      <div class="client-feedback-item row">
				<!-- COLUMN -->
				<div class="col-sm-3 text-center scroll-animated-from-bottom" style="color:red">
          <span class="fa fa-battery-1" style="font-size:36px;margin:20px 0 10px 0"></span>
					<h3 style="font-size:18px;margin:0 0 10px 0">付费开发者服务</h3>
          <h4>面向开发者</h4>
				</div>
				<!-- /COLUMN -->
				<!-- COLUMN -->
				<div class="col-sm-9 text-left scroll-animated-from-bottom" style="padding-top:10px;border-left:1px dashed #777">
					<h4><span>服务内容：</span><span style="font-weight:normal">Ignite功能讲解/答疑、指导POC/应用开发/架构设计、问题处理指引，专属交流群 + 一次语音交流服务</span></h4>
          <h4><span>服务方式：</span><span style="font-weight:normal">即时通信软件</span></h4>
          <h4><span>服务时间：</span><span style="font-weight:normal">8:30～21:30，当日问题当日内不定期回复</span></h4>
          <h4><span>服务报价：</span><span style="font-weight:normal">100元/半月/人，150元/月/人，300元/季/人，500元/半年/人，900元/年/人</span></h4>
				</div>
			</div>
      <div class="col-sm-12" style="border-top:1px dashed #777"></div>
      <div class="client-feedback-item row">
				<!-- COLUMN -->
				<div class="col-sm-3 text-center scroll-animated-from-bottom" style="color:red">
          <span class="fa fa-battery-0" style="font-size:36px;margin:10px 0 10px 0"></span>
					<h3 style="font-size:18px;margin:0 0 10px 0">免费开发者服务</h3>
          <h4>面向开发者</h4>
				</div>
				<!-- /COLUMN -->
				<!-- COLUMN -->
				<div class="col-sm-9 text-left scroll-animated-from-bottom" style="padding-top:10px;border-left:1px dashed #777">
					<h4><span>服务内容：</span><span style="font-weight:normal">提供开发者间交流平台，Ignite/GridGain产品资讯，功能性/适用性介绍</span></h4>          
          <h4><span>服务报价：</span><span style="font-weight:normal">免费</span></h4>
				</div>
			</div>
			<!-- /CLIENT FEEDBACK ITEM -->
		</div>
		<!-- /CLIENT FEEDBACK -->
	</div>
	<!-- /CONTAINER FLUID -->
</section>

	<RightPane/>
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
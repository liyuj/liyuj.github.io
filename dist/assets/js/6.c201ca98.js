(window.webpackJsonp=window.webpackJsonp||[]).push([[6],{64:function(t,s,a){"use strict";a.r(s);var e=a(30),i=a(31),o=a(15),n={name:"ServiceLayout",components:{Sidebar:i.a,Navbar:e.a},data:()=>({isSidebarOpen:!1}),computed:{shouldShowNavbar(){const{themeConfig:t}=this.$site,{frontmatter:s}=this.$page;return!1!==s.navbar&&!1!==t.navbar&&(this.$title||t.logo||t.repo||t.nav||this.$themeLocaleConfig.nav)},shouldShowSidebar(){const{frontmatter:t}=this.$page;return!t.home&&!1!==t.sidebar&&this.sidebarItems.length},sidebarItems(){return Object(o.l)(this.$page,this.$page.regularPath,this.$site,this.$localePath)},pageClasses(){const t=this.$page.frontmatter.pageClass;return[{"no-navbar":!this.shouldShowNavbar,"sidebar-open":this.isSidebarOpen,"no-sidebar":!this.shouldShowSidebar},t]}},mounted(){this.$router.afterEach(()=>{this.isSidebarOpen=!1})},methods:{toggleSidebar(t){this.isSidebarOpen="boolean"==typeof t?t:!this.isSidebarOpen,this.$emit("toggle-sidebar",this.isSidebarOpen)},onTouchStart(t){this.touchStart={x:t.changedTouches[0].clientX,y:t.changedTouches[0].clientY}},onTouchEnd(t){const s=t.changedTouches[0].clientX-this.touchStart.x,a=t.changedTouches[0].clientY-this.touchStart.y;Math.abs(s)>Math.abs(a)&&Math.abs(s)>40&&(s>0&&this.touchStart.x<=80?this.toggleSidebar(!0):this.toggleSidebar(!1))}}},r=a(0),c=Object(r.a)(n,(function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",{staticClass:"theme-container",class:t.pageClasses,on:{touchstart:t.onTouchStart,touchend:t.onTouchEnd}},[t.shouldShowNavbar?a("Navbar",{on:{"toggle-sidebar":t.toggleSidebar}}):t._e(),t._v(" "),a("div",{staticClass:"sidebar-mask",on:{click:function(s){return t.toggleSidebar(!1)}}}),t._v(" "),a("Sidebar",{attrs:{items:t.sidebarItems},on:{"toggle-sidebar":t.toggleSidebar},scopedSlots:t._u([{key:"top",fn:function(){return[t._t("sidebar-top")]},proxy:!0},{key:"bottom",fn:function(){return[t._t("sidebar-bottom")]},proxy:!0}],null,!0)}),t._v(" "),t._m(0),t._v(" "),t._m(1)],1)}),[function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("section",{staticClass:"hero-box-area section-big",staticStyle:{"padding-bottom":"10px","padding-top":"100px"},attrs:{id:"services"}},[a("div",{staticClass:"container"},[a("div",{staticClass:"row"},[a("div",{staticClass:"col-md-12 text-center",staticStyle:{height:"50px"}},[a("div",{staticClass:"section-title"},[a("h2",{staticStyle:{"font-size":"36px"}},[t._v("服务内容")])])])]),t._v(" "),a("div",{staticClass:"row"},[a("div",{staticClass:"col-md-3 col-sm-6"},[a("div",{staticClass:"hero-box"},[a("span",{staticClass:"fa fa-battery-0"}),t._v(" "),a("h3",[t._v("免费开发者交流群")]),t._v(" "),a("h4",[t._v("面向开发者")]),t._v(" "),a("p",[t._v("开发者间交流平台，Ignite/GridGain产品资讯、功能介绍，不保证响应")])])]),t._v(" "),a("div",{staticClass:"col-md-3 col-sm-6"},[a("div",{staticClass:"hero-box"},[a("span",{staticClass:"fa fa-battery-1"}),t._v(" "),a("h3",[t._v("付费开发者服务群")]),t._v(" "),a("h4",[t._v("面向开发者")]),t._v(" "),a("p",[t._v("Ignite功能讲解/答疑、指导POC/应用开发、问题处理指引，当日问题当日内不定期响应")])])]),t._v(" "),a("div",{staticClass:"col-md-3 col-sm-6"},[a("div",{staticClass:"hero-box"},[a("span",{staticClass:"fa fa-battery-2"}),t._v(" "),a("h3",[t._v("远程咨询顾问服务")]),t._v(" "),a("h4",[t._v("面向企业")]),t._v(" "),a("p",[t._v("初始技术调查、Ignite专题介绍/远程培训、协助POC、技术架构咨询/规划/评审、协助解决具体的测试/生产问题、系统性能/扩展性优化等，预约时间即时响应")])])]),t._v(" "),a("div",{staticClass:"col-md-3 col-sm-6"},[a("div",{staticClass:"hero-box"},[a("span",{staticClass:"fa fa-battery-4"}),t._v(" "),a("h3",[t._v("驻场咨询顾问服务")]),t._v(" "),a("h4",[t._v("面向企业")]),t._v(" "),a("p",[t._v("现场解决客户的各种个性化需求/问题，随时响应")])])])])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"right-pale"},[s("div",{staticClass:"right-content"},[s("div",{staticClass:"bbox tell-box"},[s("button",{staticClass:"btn btn-circle btn-success right-tell"},[s("i",{staticClass:"fa fa-lg fa-phone"})]),this._v(" "),s("p",{staticClass:"tell-hide"},[this._v("\n\t\t\t\t18624049226\n\t\t\t")])]),this._v(" "),s("div",{staticClass:"bbox weixin-box"},[s("button",{staticClass:"btn btn-circle btn-success right-weixin"},[s("i",{staticClass:"fa fa-weixin"})]),this._v(" "),s("p",{staticClass:"tell-hide",staticStyle:{padding:"10px"}},[s("img",{attrs:{src:"/img/weixin.jpg"}})])])])])}],!1,null,null,null);s.default=c.exports}}]);
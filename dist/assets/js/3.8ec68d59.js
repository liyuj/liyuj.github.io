(window.webpackJsonp=window.webpackJsonp||[]).push([[3],[,,,,,,,,,,,,,,,,function(t,e,a){},,,,,,,function(t,e,a){},function(t,e,a){},function(t,e,a){},function(t,e,a){},function(t,e,a){},function(t,e,a){},,,,function(t,e){t.exports=function(t){return null==t}},function(t,e,a){var n=a(48).Symbol;t.exports=n},function(t,e,a){"use strict";a.r(e);var n=a(15),s={name:"SidebarGroup",components:{DropdownTransition:a(36).a},props:["item","open","collapsable","depth"],beforeCreate(){this.$options.components.SidebarLinks=a(34).default},methods:{isActive:n.e}},i=(a(56),a(0)),r=Object(i.a)(s,(function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("section",{staticClass:"sidebar-group",class:[{collapsable:t.collapsable,"is-sub-group":0!==t.depth},"depth-"+t.depth]},[t.item.path?a("RouterLink",{staticClass:"sidebar-heading clickable",class:{open:t.open,active:t.isActive(t.$route,t.item.path)},attrs:{to:t.item.path},nativeOn:{click:function(e){return t.$emit("toggle")}}},[a("span",[t._v(t._s(t.item.title))]),t._v(" "),t.collapsable?a("span",{staticClass:"arrow",class:t.open?"down":"right"}):t._e()]):a("p",{staticClass:"sidebar-heading",class:{open:t.open},on:{click:function(e){return t.$emit("toggle")}}},[a("span",[t._v(t._s(t.item.title))]),t._v(" "),t.collapsable?a("span",{staticClass:"arrow",class:t.open?"down":"right"}):t._e()]),t._v(" "),a("DropdownTransition",[t.open||!t.collapsable?a("SidebarLinks",{staticClass:"sidebar-group-items",attrs:{items:t.item.children,"sidebar-depth":t.item.sidebarDepth,depth:t.depth+1}}):t._e()],1)],1)}),[],!1,null,null,null).exports;function o(t,e,a,n,s){const i={props:{to:e,activeClass:"",exactActiveClass:""},class:{active:n,"sidebar-link":!0}};return s>2&&(i.style={"padding-left":s+"rem"}),t("RouterLink",i,a)}function l(t,e,a,s,i,r=1){return!e||r>i?null:t("ul",{class:"sidebar-sub-headers"},e.map(e=>{const c=Object(n.e)(s,a+"#"+e.slug);return t("li",{class:"sidebar-sub-header"},[o(t,a+"#"+e.slug,e.title,c,e.level-1),l(t,e.children,a,s,i,r+1)])}))}var c={functional:!0,props:["item","sidebarDepth"],render(t,{parent:{$page:e,$site:a,$route:s,$themeConfig:i,$themeLocaleConfig:r},props:{item:c,sidebarDepth:p}}){const u=Object(n.e)(s,c.path),d="auto"===c.type?u||c.children.some(t=>Object(n.e)(s,c.basePath+"#"+t.slug)):u,h="external"===c.type?function(t,e,a){return t("a",{attrs:{href:e,target:"_blank",rel:"noopener noreferrer"},class:{"sidebar-link":!0}},[a,t("OutboundLink")])}(t,c.path,c.title||c.path):o(t,c.path,c.title||c.path,d),f=[e.frontmatter.sidebarDepth,p,r.sidebarDepth,i.sidebarDepth,1].find(t=>void 0!==t),b=r.displayAllHeaders||i.displayAllHeaders;if("auto"===c.type)return[h,l(t,c.children,c.basePath,s,f)];if((d||b)&&c.headers&&!n.d.test(c.path)){return[h,l(t,Object(n.c)(c.headers),c.path,s,f)]}return h}};a(57);function p(t,e){return"group"===e.type&&e.children.some(e=>"group"===e.type?p(t,e):"page"===e.type&&Object(n.e)(t,e.path))}var u={name:"SidebarLinks",components:{SidebarGroup:r,SidebarLink:Object(i.a)(c,void 0,void 0,!1,null,null,null).exports},props:["items","depth","sidebarDepth"],data:()=>({openGroupIndex:0}),watch:{$route(){this.refreshIndex()}},created(){this.refreshIndex()},methods:{refreshIndex(){const t=function(t,e){for(let a=0;a<e.length;a++){const n=e[a];if(p(t,n))return a}return-1}(this.$route,this.items);t>-1&&(this.openGroupIndex=t)},toggleGroup(t){this.openGroupIndex=t===this.openGroupIndex?-1:t},isActive(t){return Object(n.e)(this.$route,t.regularPath)}}},d=Object(i.a)(u,(function(){var t=this,e=t.$createElement,a=t._self._c||e;return t.items.length?a("ul",{staticClass:"sidebar-links"},t._l(t.items,(function(e,n){return a("li",{key:n},["group"===e.type?a("SidebarGroup",{attrs:{item:e,open:n===t.openGroupIndex,collapsable:e.collapsable||e.collapsible,depth:t.depth},on:{toggle:function(e){return t.toggleGroup(n)}}}):a("SidebarLink",{attrs:{"sidebar-depth":t.sidebarDepth,item:e}})],1)})),0):t._e()}),[],!1,null,null,null);e.default=d.exports},,,function(t,e,a){"use strict";var n=a(16);a.n(n).a},,,,,,,,function(t,e,a){"use strict";var n=a(23);a.n(n).a},function(t,e,a){var n=a(47),s=a(52),i=a(53);t.exports=function(t){return"string"==typeof t||!s(t)&&i(t)&&"[object String]"==n(t)}},function(t,e,a){var n=a(33),s=a(50),i=a(51),r=n?n.toStringTag:void 0;t.exports=function(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":r&&r in Object(t)?s(t):i(t)}},function(t,e,a){var n=a(49),s="object"==typeof self&&self&&self.Object===Object&&self,i=n||s||Function("return this")();t.exports=i},function(t,e){var a="object"==typeof global&&global&&global.Object===Object&&global;t.exports=a},function(t,e,a){var n=a(33),s=Object.prototype,i=s.hasOwnProperty,r=s.toString,o=n?n.toStringTag:void 0;t.exports=function(t){var e=i.call(t,o),a=t[o];try{t[o]=void 0;var n=!0}catch(t){}var s=r.call(t);return n&&(e?t[o]=a:delete t[o]),s}},function(t,e){var a=Object.prototype.toString;t.exports=function(t){return a.call(t)}},function(t,e){var a=Array.isArray;t.exports=a},function(t,e){t.exports=function(t){return null!=t&&"object"==typeof t}},function(t,e,a){"use strict";var n=a(24);a.n(n).a},function(t,e,a){"use strict";var n=a(25);a.n(n).a},function(t,e,a){"use strict";var n=a(26);a.n(n).a},function(t,e,a){"use strict";var n=a(27);a.n(n).a},function(t,e,a){"use strict";var n=a(28);a.n(n).a},,function(t,e,a){"use strict";a.r(e);var n={name:"Home",components:{NavLink:a(31).a},computed:{data(){return this.$page.frontmatter},actionLink(){return{link:this.data.actionLink,text:this.data.actionText}}}},s=(a(37),a(0)),i=Object(s.a)(n,(function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("main",{staticClass:"home",attrs:{"aria-labelledby":"main-title"}},[a("header",{staticClass:"hero"},[t.data.heroImage?a("img",{attrs:{src:t.$withBase(t.data.heroImage),alt:t.data.heroAlt||"hero"}}):t._e(),t._v(" "),null!==t.data.heroText?a("h1",{attrs:{id:"main-title"}},[t._v("\n      "+t._s(t.data.heroText||t.$title||"Hello")+"\n    ")]):t._e(),t._v(" "),null!==t.data.tagline?a("p",{staticClass:"description"},[t._v("\n      "+t._s(t.data.tagline||t.$description||"Welcome to your VuePress site")+"\n    ")]):t._e(),t._v(" "),t.data.actionText&&t.data.actionLink?a("p",{staticClass:"action"},[a("NavLink",{staticClass:"action-button",attrs:{item:t.actionLink}})],1):t._e()]),t._v(" "),t.data.features&&t.data.features.length?a("div",{staticClass:"features"},t._l(t.data.features,(function(e,n){return a("div",{key:n,staticClass:"feature"},[a("h2",[t._v(t._s(e.title))]),t._v(" "),a("p",[t._v(t._s(e.details))])])})),0):t._e(),t._v(" "),a("Content",{staticClass:"theme-default-content custom"}),t._v(" "),t.data.footer?a("div",{staticClass:"footer"},[t._v("\n    "+t._s(t.data.footer)+"\n  ")]):t._e()],1)}),[],!1,null,null,null).exports,r=a(30),o=a(32),l=a.n(o),c=a(15),p={name:"PageEdit",computed:{lastUpdated(){return this.$page.lastUpdated},lastUpdatedText(){return"string"==typeof this.$themeLocaleConfig.lastUpdated?this.$themeLocaleConfig.lastUpdated:"string"==typeof this.$site.themeConfig.lastUpdated?this.$site.themeConfig.lastUpdated:"Last Updated"},editLink(){const t=l()(this.$page.frontmatter.editLink)?this.$site.themeConfig.editLinks:this.$page.frontmatter.editLink,{repo:e,docsDir:a="",docsBranch:n="master",docsRepo:s=e}=this.$site.themeConfig;return t&&s&&this.$page.relativePath?this.createEditLink(e,s,a,n,this.$page.relativePath):null},editLinkText(){return this.$themeLocaleConfig.editLinkText||this.$site.themeConfig.editLinkText||"Edit this page"}},methods:{createEditLink(t,e,a,n,s){if(/bitbucket.org/.test(t)){return(c.i.test(e)?e:t).replace(c.a,"")+"/src"+`/${n}/`+(a?a.replace(c.a,"")+"/":"")+s+`?mode=edit&spa=0&at=${n}&fileviewer=file-view-default`}return(c.i.test(e)?e:`https://github.com/${e}`).replace(c.a,"")+"/edit"+`/${n}/`+(a?a.replace(c.a,"")+"/":"")+s}}},u=(a(45),Object(s.a)(p,(function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("footer",{staticClass:"page-edit"},[t.editLink?a("div",{staticClass:"edit-link"},[a("a",{attrs:{href:t.editLink,target:"_blank",rel:"noopener noreferrer"}},[t._v(t._s(t.editLinkText))]),t._v(" "),a("OutboundLink")],1):t._e(),t._v(" "),t.lastUpdated?a("div",{staticClass:"last-updated"},[a("span",{staticClass:"prefix"},[t._v(t._s(t.lastUpdatedText)+":")]),t._v(" "),a("span",{staticClass:"time"},[t._v(t._s(t.lastUpdated))])]):t._e()])}),[],!1,null,null,null).exports),d=a(46),h=a.n(d),f={name:"PageNav",props:["sidebarItems"],computed:{prev(){return g(b.PREV,this)},next(){return g(b.NEXT,this)}}};const b={NEXT:{resolveLink:function(t,e){return v(t,e,1)},getThemeLinkConfig:({nextLinks:t})=>t,getPageLinkConfig:({frontmatter:t})=>t.next},PREV:{resolveLink:function(t,e){return v(t,e,-1)},getThemeLinkConfig:({prevLinks:t})=>t,getPageLinkConfig:({frontmatter:t})=>t.prev}};function g(t,{$themeConfig:e,$page:a,$route:n,$site:s,sidebarItems:i}){const{resolveLink:r,getThemeLinkConfig:o,getPageLinkConfig:p}=t,u=o(e),d=p(a),f=l()(d)?u:d;return!1===f?void 0:h()(f)?Object(c.k)(s.pages,f,n.path):r(a,i)}function v(t,e,a){const n=[];!function t(e,a){for(let n=0,s=e.length;n<s;n++)"group"===e[n].type?t(e[n].children||[],a):a.push(e[n])}(e,n);for(let e=0;e<n.length;e++){const s=n[e];if("page"===s.type&&s.path===decodeURIComponent(t.path))return n[e+a]}}var m=f,_=(a(54),{components:{PageEdit:u,PageNav:Object(s.a)(m,(function(){var t=this,e=t.$createElement,a=t._self._c||e;return t.prev||t.next?a("div",{staticClass:"page-nav"},[a("p",{staticClass:"inner"},[t.prev?a("span",{staticClass:"prev"},[t._v("\n      ←\n      "),"external"===t.prev.type?a("a",{staticClass:"prev",attrs:{href:t.prev.path,target:"_blank",rel:"noopener noreferrer"}},[t._v("\n        "+t._s(t.prev.title||t.prev.path)+"\n\n        "),a("OutboundLink")],1):a("RouterLink",{staticClass:"prev",attrs:{to:t.prev.path}},[t._v("\n        "+t._s(t.prev.title||t.prev.path)+"\n      ")])],1):t._e(),t._v(" "),t.next?a("span",{staticClass:"next"},["external"===t.next.type?a("a",{attrs:{href:t.next.path,target:"_blank",rel:"noopener noreferrer"}},[t._v("\n        "+t._s(t.next.title||t.next.path)+"\n\n        "),a("OutboundLink")],1):a("RouterLink",{attrs:{to:t.next.path}},[t._v("\n        "+t._s(t.next.title||t.next.path)+"\n      ")]),t._v("\n      →\n    ")],1):t._e()])]):t._e()}),[],!1,null,null,null).exports},props:["sidebarItems"]}),k=(a(55),Object(s.a)(_,(function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("main",{staticClass:"page"},[t._t("top"),t._v(" "),a("Content",{staticClass:"theme-default-content"}),t._v(" "),a("PageEdit"),t._v(" "),a("PageNav",t._b({},"PageNav",{sidebarItems:t.sidebarItems},!1)),t._v(" "),t._t("bottom")],2)}),[],!1,null,null,null).exports),x=a(34),C=a(35),$={name:"Sidebar",components:{SidebarLinks:x.default,NavLinks:C.a},props:["items"]},L=(a(58),{name:"Layout",components:{Home:i,Page:k,Sidebar:Object(s.a)($,(function(){var t=this.$createElement,e=this._self._c||t;return e("aside",{staticClass:"sidebar"},[e("NavLinks"),this._v(" "),this._t("top"),this._v(" "),e("SidebarLinks",{attrs:{depth:0,items:this.items}}),this._v(" "),this._t("bottom")],2)}),[],!1,null,null,null).exports,Navbar:r.a},data:()=>({isSidebarOpen:!1}),computed:{shouldShowNavbar(){const{themeConfig:t}=this.$site,{frontmatter:e}=this.$page;return!1!==e.navbar&&!1!==t.navbar&&(this.$title||t.logo||t.repo||t.nav||this.$themeLocaleConfig.nav)},shouldShowSidebar(){const{frontmatter:t}=this.$page;return!t.home&&!1!==t.sidebar&&this.sidebarItems.length},sidebarItems(){return Object(c.l)(this.$page,this.$page.regularPath,this.$site,this.$localePath)},pageClasses(){const t=this.$page.frontmatter.pageClass;return[{"no-navbar":!this.shouldShowNavbar,"sidebar-open":this.isSidebarOpen,"no-sidebar":!this.shouldShowSidebar},t]}},mounted(){this.$router.afterEach(()=>{this.isSidebarOpen=!1})},methods:{toggleSidebar(t){this.isSidebarOpen="boolean"==typeof t?t:!this.isSidebarOpen,this.$emit("toggle-sidebar",this.isSidebarOpen)},onTouchStart(t){this.touchStart={x:t.changedTouches[0].clientX,y:t.changedTouches[0].clientY}},onTouchEnd(t){const e=t.changedTouches[0].clientX-this.touchStart.x,a=t.changedTouches[0].clientY-this.touchStart.y;Math.abs(e)>Math.abs(a)&&Math.abs(e)>40&&(e>0&&this.touchStart.x<=80?this.toggleSidebar(!0):this.toggleSidebar(!1))}}}),S=Object(s.a)(L,(function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"theme-container",class:t.pageClasses,on:{touchstart:t.onTouchStart,touchend:t.onTouchEnd}},[t.shouldShowNavbar?a("Navbar",{on:{"toggle-sidebar":t.toggleSidebar}}):t._e(),t._v(" "),a("div",{staticClass:"sidebar-mask",on:{click:function(e){return t.toggleSidebar(!1)}}}),t._v(" "),a("Sidebar",{attrs:{items:t.sidebarItems},on:{"toggle-sidebar":t.toggleSidebar},scopedSlots:t._u([{key:"top",fn:function(){return[t._t("sidebar-top")]},proxy:!0},{key:"bottom",fn:function(){return[t._t("sidebar-bottom")]},proxy:!0}],null,!0)}),t._v(" "),t.$page.frontmatter.home?a("Home"):a("Page",{attrs:{"sidebar-items":t.sidebarItems},scopedSlots:t._u([{key:"top",fn:function(){return[t._t("page-top")]},proxy:!0},{key:"bottom",fn:function(){return[t._t("page-bottom")]},proxy:!0}],null,!0)})],1)}),[],!1,null,null,null);e.default=S.exports}]]);
(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{197:function(t,e,i){"use strict";i.r(e);var s={name:"Tab",props:{id:{default:null},title:{required:!0},prefix:{default:""},suffix:{default:""}},data:()=>({isActive:!1}),computed:{header(){return this.prefix+this.title+this.suffix},computedId(){return this.id?this.id:this.title.toLowerCase().replace(/ /g,"-")},hash(){return"#"+this.computedId}}},a=i(3),r=Object(a.a)(s,(function(){var t=this.$createElement;return(this._self._c||t)("section",{directives:[{name:"show",rawName:"v-show",value:this.isActive,expression:"isActive"}],staticClass:"tabs-component-panel",attrs:{"aria-hidden":!this.isActive,id:this.computedId,role:"tabpanel"}},[this._t("default")],2)}),[],!1,null,null,null);e.default=r.exports}}]);
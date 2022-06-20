import Vue from 'vue';
import App from './App';
import router from './router';
// 引入 vuex
import Vuex from 'vuex';
// 引入md5
import md5 from 'js-md5';
// 引入api 接口
import api from './config/api';
// 引入 正则表达式
import config from './config/config';
// 引入 ElementUI
import ElementUI from 'element-ui';
// 引入全局的分页组件
import pages from './components/pages';
// 引入echarts
import eCharts from 'echarts';
// bus传值
import vueBus from 'vue-bus';
// 引入elementUI的组件样式
import 'element-ui/lib/theme-chalk/index.css';
// 引入格式化css
import './assets/css/base.css';
// 引入全局css
import './assets/css/common.css';
// 解决vue ie兼容
import 'babel-polyfill';
// 阻止显示生产模式消息
Vue.config.productionTip = false;
// 获取cookie
Vue.prototype.getCookie = getCookie;
// 设置cookie
Vue.prototype.setCookie = setCookie;
// 删除cookie
Vue.prototype.delCookie = delCookie;
// 调用api接口
Vue.prototype.$api = api;
// 调用正则表达式
Vue.prototype.$config = config;
// 调用md5
Vue.prototype.$md5 = md5;
// 调用eCharts
Vue.prototype.$echarts = eCharts;
// 调用vuex
Vue.use(Vuex);
// 调用 vue-bus
Vue.use(vueBus);
// 调用elementUI
Vue.use(ElementUI);
// 调用分页组件
Vue.component('pages', pages);
// 全局错误提示方法
Vue.prototype.alertDialogTip = (name, message) => {
  name.$alert(message, '温馨提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return false;
  });
};

const store = new Vuex.Store({
  state: {
    loading: false,
    options: [], // 缓存页面路由集合(页签集合)
    activeIndex: '', // 当前选中页签
  },
  mutations: {
    // 设置loading
    setLoading(state, value) {
      state.loading = value;
    },
    // 置空options和activeIndex
    resetState(state, value) {
      if (value) {
        state.options = [];
        state.activeIndex = '';
      }
    },
    // 添加tabs
    add_tabs(state, data) {
      var _t = this;
      _t.state.options.push(data);
      if (_t.state.options.length > 12) {
        // 删除下标为 1 的 作用: 一直加,加到最多时删除 除首页之外的第一项
        _t.state.options.splice(1, 1);
      }
    },
    // 删除tabs
    delete_tabs(state, name) {
      var _t = this;
      let index = 0;
      for (let option of state.options) {
        if (option.name === name) {
          break;
        }
        index++;
      }
      _t.state.options.splice(index, 1);
    },
    // 设置当前激活的tab
    set_active_index(state, index) {
      var _t = this;
      _t.state.activeIndex = index;
    },
  }
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: {App},
  template: '<App/>',
  watch: {
    // "$route": 'checkLogin'
  },
  methods: {
    // 检查是否登录
    checkLogin() {
      if (!this.getCookie('USER_ID')) {
        this.$store.commit("setLoading", false);
        this.$router.replace('/login');
      }
    }
  }
});


Vue.mixin({
  beforeRouteLeave: function (to, from, next) {
    var _t = this;
    if (from && from.meta.level === 4) {
      //此处判断是如果返回上一层，你可以根据自己的业务更改此处的判断逻辑，酌情决定是否摧毁本层缓存。
      if (_t.$vnode && _t.$vnode.data.keepAlive) {
        if (_t.$vnode.parent && _t.$vnode.parent.componentInstance && _t.$vnode.parent.componentInstance.cache) {
          if (_t.$vnode.componentOptions) {
            var key = _t.$vnode.key == null
              ? _t.$vnode.componentOptions.Ctor.cid + (_t.$vnode.componentOptions.tag ? `::${_t.$vnode.componentOptions.tag}` : '')
              : _t.$vnode.key;
            var cache = _t.$vnode.parent.componentInstance.cache;
            var keys = _t.$vnode.parent.componentInstance.keys;
            if (cache[key]) {
              if (keys.length) {
                var index = keys.indexOf(key);
                if (index > -1) {
                  keys.splice(index, 1);
                }
              }
              delete cache[key];
            }
          }
        }
      }
      _t.$destroy();
    }
    next();
  }
});


// 获取cookie
function getCookie(name) {
  var arr,
    reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
  if (arr = document.cookie.match(reg)) {
    return unescape(arr[2]);
  } else {
    return null;
  }
}

// 设置cookie 有效期为30天
function setCookie(name, value, days) {
  var exp = new Date();
  exp.setDate(exp.getDate() + days);
  document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}

// 删除 cookie
function delCookie(name) {
  var exp = new Date();
  exp.setTime(exp.getTime() - 1);
  var cval = this.getCookie(name);
  if (cval != null)
    document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}

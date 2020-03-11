import Vue from "vue";
import router from "./router";
import axios from "axios";
import VueAxios from "vue-axios";
import VueLazyLoad from "vue-lazyload";
import VueCookie from "vue-cookie";
import store from "./store";
import App from "./App.vue";
// import env from "./env";

axios.defaults.baseURL = "/api";
axios.defaults.timeout = 8000;
// axios.defaults.baseURL = env.baseURL;

axios.interceptors.response.use(function(response) {
  let res = response.data;
  let path = location.hash;
  if (res.status == 0) {
    return res.data;
  } else if (res.status == 10) {
    if (path != "#/index") {
      window.location.href = "/#/login";
    }
  } else {
    alert(res.msg);
  }
  return Promise.reject(res);
});

Vue.use(VueAxios, axios);
Vue.use(VueCookie);
Vue.use(VueLazyLoad, {
  loading: "/imgs/loading-bg/grey.png"
});
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

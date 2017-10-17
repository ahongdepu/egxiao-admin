// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Axios from './config/axios'
import XLSX from 'xlsx'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'

Vue.prototype.$http = Axios
withCredentials: false
Vue.config.productionTip = false
Vue.use(ElementUI)

/* eslint-disable no-new */
new Vue({
	el: '#app',
	router,
	template: '<App/>',
	data: {
    eventHub: new Vue()
  },
	components: {
		App
	},
	created: function() {
//		console.log(window.location.href);
		let t = window.location.hash;
		if(t == '#/register') {
			this.$router.push('/register');
			return false;
		} else {
			if(!localStorage.userData || localStorage.userData == "") {
				this.$router.push('/login');
			}
		}
	},
})

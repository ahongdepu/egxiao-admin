import Vue from 'vue'
import VueRouter from 'vue-router'

const Administration = r => require.ensure([], () => r(require('@/components/sidebar/sidebar')), 'administration')
const Login = r => require.ensure([], () => r(require('@/components/login/login')), 'login')
const Register = r => require.ensure([], () => r(require('@/components/register/register')), 'register')
const QRcode = r => require.ensure([], () => r(require('@/components/QRcode/QRcode')), 'QRcode')
const ResetPwd = r => require.ensure([], () => r(require('@/components/resetPwd/resetPwd')), 'resetPwd')

/*引用网页内容*/
const Home = r => require.ensure([], () => r(require('@/page/home/home')), 'home')
const Student = r => require.ensure([], () => r(require('@/page/student/student')), 'student')
const FlowUp = r => require.ensure([], () => r(require('@/page/flowUp/flowUp')), 'flowUp')
const Enroll = r => require.ensure([], () => r(require('@/page/enroll/enroll')), 'enroll')
const Class = r => require.ensure([], () => r(require('@/page/class/class')), 'class')
const RemeberCource = r => require.ensure([], () => r(require('@/page/remeberCource/remeberCource')), 'remeberCource')

Vue.use(VueRouter)

const router = new VueRouter({
	routes: [{
			path: '/',
			component: Administration,
			children: [{
					path: '',
					component: Student
				},
				{
					path: 'home',
					component: Home
				},
				{
					path: 'student',
					component: Student
				},
				{
					path: 'flowUp',
					component: FlowUp
				},
				{
					path: 'enroll',
					component: Enroll
				},
				{
					path: 'class',
					component: Class
				},
				{
					path: 'remeberCource',
					component: RemeberCource
				}
			]
		},
		{
			path: '/login',
			component: Login
		},
		{
			path: '/Register',
			component: Register
		},
		{
			path: '/QRcode',
			component: QRcode
		},
		{
			path: '/resetPwd',
			component: ResetPwd
		}
	]
})

export default router;
<template>
	<div class="tac">
		<div class="sidebar-left">
			<div class="scroll-hidden">
				<el-menu mode="vertical" theme="dark" default-active="1" class="el-menu-vertical-demo siderbar">
					<el-menu-item index="logo" class="logo">
						<a href="https://egxiao.com/" class="iconfont icon-logofont  egxiao-logo"></a>
					</el-menu-item>
					<el-menu-item index="profile" class="profile">
						<img src="../../../static/assets/images/users/no-image.jpg" class="img-circle img-responsive" />
						<div class="profile-data">
							<div class="profile-data-name">{{ profileName }}</div>
							<div class="profile-data-title">{{ profileTitle }}</div>
						</div>
					</el-menu-item>
					<el-menu-item-group title="日常" class="setHt_bg">
						<!--<el-menu-item index="1" id="home">
							<router-link to="/home"><span class="icon iconfont icon-org-line"></span>主页</router-link>
						</el-menu-item>-->
						<el-menu-item index="student" id="student" class="setHt">
							<router-link to="/student"><span class="icon iconfont icon-xueyuan"></span>学员</router-link>
						</el-menu-item>
						<el-menu-item index="flowUp" id="flowUp" class="setHt">
							<router-link to="/flowUp"><span class="icon iconfont icon-guidepost"></span>跟进</router-link>
						</el-menu-item>
						<el-menu-item index="enroll" id="enroll" class="setHt">
							<router-link to="/enroll"><span class="icon iconfont icon-baoming"></span>报名</router-link>
						</el-menu-item>
						<el-menu-item index="class" id="class" class="setHt">
							<router-link to="/class"><span class="icon iconfont icon-banji"></span>班级</router-link>
						</el-menu-item>
						<el-menu-item index="remeberCource" id="remeberCource" class="setHt">
							<router-link to="/remeberCource"><span class="icon iconfont icon-jishangke"></span>记上课</router-link>
						</el-menu-item>
					</el-menu-item-group>
					<div class="qrcode">
						<p>更多功能下载手机APP</p>
						<div class="text-center"><img class="img-responsive" src="../../../static/img/QRcode.png" /></div>
						<p>&copy;&nbsp;RonSchool</p>
					</div>
				</el-menu>


			</div>
		</div>
		<div class="main-bg">
			<div class="top sidebar-top">
				<div class="pull-left">
					<button><span class="fa fa-dedent"></span></button>
				</div>
				<div class="pull-right"><span class="click" @click="loginOut">退出登录</span></div>
				<div class="clearfix"></div>
			</div>
			<div class="main">
				<router-view></router-view>
			</div>

		</div>
	</div>
</template>

<script>
	export default {
		name: 'administration',
		data() {
			return {
				profileName: '',
				profileTitle: '',
			}
		},
		created: function() {
			//接收自组件访问的方法 --- 退出登陆
			this.$root.eventHub.$on('loginOut',(target) => {
    		this.loginOut(target)
  		});
			var userData = JSON.parse(localStorage.userData);
			//			console.log(userData);
			this.profileName = userData.name?userData.name:userData[0].name;
			//			console.log(this.profileName);
			this.profileTitle = userData.org_name?userData.org_name:userData[0].org_name;
		},
		methods: {
			loginOut(){
				localStorage.removeItem("userData");
				this.$router.push("/login")
			}
		}
	}
</script>
<style scoped>
	@import "../../../static/css/fontawesome/iconfont.css";
	@import "../../../static/css/fontawesome/font-awesome.min.css";
	/*左边导航sidebar*/

	.sidebar-left {
		height: 100%;
		min-height: 650px;
		width: 12.5%;
		position: fixed;
		left: 0px;
		top: 0px;
		background-color: #324157;
		overflow: hidden;
		z-index: 9;
	}

	.sidebar-top {
		width: 87.5%;
		position: fixed;
		right: 0px;
		top: 0px;
		z-index: 9;
	}

	.scroll-hidden {
		height: 100%;
		width: calc(100% + 18px);
		overflow-y: auto;
	}
	.logo{
		padding-left: 0px !important;
	}
	.egxiao-logo {
		font-size: 4.2em;
		padding-left: 0px !important;
		padding-top: 2px !important;
		font-weight: 100;
		text-indent: 0px;
		text-align: center;
		line-height: 50px;
		padding: 0px;
		border-bottom: 0px;
		color: #FFF;
		height: 50px;
	}
	.egxiao-logo:hover{
		background: #324157;
	}
	ul.siderbar {
		height: 100%;
	}

	ul>li>a {
		color: #fff;
		font-size: 13px;
	}

	ul.el-menu {
		border-radius: 0px;
	}

	li>ul>li.el-menu-item {
		border-bottom: 1px solid #2f3c48;
		padding: 0px !important;
	}

	li>ul>li.el-menu-item:first-child {
		margin-top: 15px;
		border-top: 1px solid #2f3c48;
	}

	li.is-active>a>span,
	ul>li:hover>a>span,
	ul>li>a:hover>span,
	ul>li>a:focus>span {
		color: #ffd559;
	}

	ul>li>a {
		display: block;
		width: 100%;
		outline: none;
		padding-left: 13%;
		transition: all 0.2s ease-in;
	}

	ul>li.is-active>a,
	ul>li>a:hover,
	ul>li>a:focus {
		text-decoration: none;
		outline: none;
		padding-left: 15%;
		background: #48576a;
	}

	li.logo:hover {
		background: #324157 !important;
	}

	ul>li>a>span {
		margin-right: 1em;
	}

	li.profile {
		text-align: center;
		height: auto;
		padding: 20px 18px 20px 0px!important;
		background: #48576a;
		cursor: default;
	}

	li.profile img {
		display: block;
		border-radius: 50%;
		width: 40%;
		height: auto;
		margin: 0 auto;
		border: 2px solid #fff;
	}

	li.profile .profile-data {
		line-height: 2em;
	}

	li.profile .profile-data .profile-data-name {
		color: #fff;
		font-weight: normal;
		margin-top: 0.5em;
		font-size: 1.1em;
	}

	li.profile .profile-data .profile-data-title {
		color: #bfcbd9;
	}

	li.logo {
		height: 50px;
		width: 100%;
		/*background: #48576a;*/
	}
	.qrcode{
		width: calc(100% - 15px);
		position: absolute;
		bottom: 0px;
		background-color: #324157;
	}
	.qrcode p{
		color: #fff;
		text-align: center;
		font-size: 0.9em;
		margin-top: 0.5em;
		line-height: 1.2em;
	}
	.qrcode img{
		width: 50%;
		max-width:66px;
		margin: 0 auto;
	}

	/*右边top和main*/

	.main-bg {
		position: absolute;
		top: 0px;
		left: 0px;
		padding-top: 3.5em;
		padding-left: 12.75%;
		width: 100%;
		min-height: 100%;
		background: #f5f5f5 url(../../../static/img/backgrounds/main-bg.png) left top repeat;
	}

	.top {
		height: 50px;
		background: #324157;
		position: fixed;
		top: 0px;
	}

	.main {
		padding: 10px;
	}

	.top button {
		padding: 0px;
		background: none;
		border: none;
		outline: none;
		display: block;
		height: auto;
		line-height: 50px;
		width: 50px;
		text-align: center;
		color: #fff;
		transition: background-color .2s ease-in;
	}

	.top button:hover {
		background: #48576a;
		color: #ffd559;
	}
	.top .click{
		color: #fff;
		line-height: 50px;
		cursor: pointer;
		margin-right: 2em;
	}
	.el-breadcrumb {
		width: 100%;
		background: #E8E8E8;
		margin-top: 50px;
		margin-bottom: 10px;
		padding: 6px 15px 7px;
	}
	/**/
	.setHt_bg{
		height: calc(100% - 340px);
		overflow-y: auto;
	}
	li.setHt_bg ul{
		height: 120% !important;
	}
</style>

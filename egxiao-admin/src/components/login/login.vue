<template>
	<div class="content">
		<div v-if="cv" class="page-content">
			<div class="text-left">
				<h2>易管校<span>还没有账号？<router-link to='/register'>立即注册</router-link></span></h2>
			</div>
			<form v-on:keydown.enter="login">
				<label class="login-icon">
				    <span class="icon iconfont icon-my-line"></span>
				    <input class="input-text" type="tel" v-model="loginModel.username" @focus="isFocus($event)" @blur="isBlur($event)" placeholder="请输入手机号" maxlength="11" />
			    </label>
				<label class="login-icon">
					<span class="icon iconfont icon-lock-line-copy"></span>
				    <input type="password" class="input-text" v-model="pwd_before" @focus="isFocus" @blur="isBlur" placeholder="请输入密码" />
				</label>
				<el-button type="button" @click="login" :plain="true" class="login-butt" :loading="loading_show">{{ login_text }}</el-button>
			</form>
			<div class="text-right">
				<router-link to="/resetPwd">忘记密码？</router-link>
			</div>
		</div>
		<div v-if="!cv" class="page-content02">
			<h3>你已加入以下机构，请选择进入</h3>
			<table class="table table-hover table-responsive">
				<tbody>
					<tr v-for="(org_name,$index) in orgData" @click="storeOrg($index)">
						<td>{{ org_name.org_name }}</td>
					</tr>
					<tr>
						<td>
							<span class="pull-left" @click="cv = !cv"><i class="el-icon-arrow-left"></i>返回</span> 没有您的机构？试试
							<router-link to="/resetPwd">找回密码</router-link>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>

</template>

<script>
	let Base64 = require('js-base64').Base64
	export default {
		data() {
			return {
				loginUrl: 'token',
				msg: 'lalalala',
				pwd_before: '',
				login_text: '登陆',
				loginModel: {
					username: '',
					password: '',
					grant_type: 'password'
				},
				loading_show: false,
				cv: true,
				orgData: [],
				isPC: true,
			}
		},
		created: function() {
			global._this = this;
			// 检查是否为pc端访问
			_this.isPC = function() {
				var userAgentInfo = navigator.userAgent;
				var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
				var flag = true;
				for(var i = 0; i < Agents.length; i++) {
					if(userAgentInfo.indexOf(Agents[i]) > 0) {
						flag = false;
						break;
					}
				}
				return flag;
			}();
		},
		methods: {
			isFocus: function(event) {
				event.currentTarget.parentNode.style.cssText = "color:#3498db;border-bottom-color: #3498db;"
			},
			isBlur: function(event) {
				if(event.currentTarget.value == "") {
					event.currentTarget.parentNode.style.cssText = "color:#b8c4ce;border-bottom-color: #e9ecee;"
				}
			},
			login: function() {
				var usern = this.loginModel.username;
				var pwd = this.loginModel.password;
				var partten = /^1[3,5,7,8]\d{9}$/;
				let _this = this;
				if(usern == '' || _this.pwd_before == '') {
					_this.$message({
						showClose: true,
						message: '请输入手机号或者密码',
						type: 'error'
					});
					return false;
				} else if(!partten.test(usern)) {
					_this.$message({
						showClose: true,
						message: '请输入正确的手机号或者密码',
						type: 'error'
					});
					return false;
				} else {
					this.loading_show = true;
					this.login_text = '登陆中';
					this.loginModel.password = Base64.encode(_this.pwd_before);
					this.$http.post(_this.loginUrl, _this.loginModel)
						.then((response) => {
							this.loading_show = false;
							this.login_text = '登陆';
							if(localStorage.access_token) {
								localStorage.removeItem("access_token");
							};
							localStorage.setItem('access_token', response.data.access_token);
							let userModels = JSON.parse(response.data.userModelJson);
							_this.orgData = userModels;
							sessionStorage.setItem("userData_all", response.data.userModelJson);
							if(userModels.length > 1) {
								this.cv = false;
							} else {
								var userData = JSON.parse(sessionStorage.userData_all);
								if(localStorage.userData) {
									localStorage.removeItem("userData");
								};
								localStorage.setItem("userData", JSON.stringify(userData));

								if(_this.isPC == true) {
									_this.$router.push('/student');
								} else {
									_this.$router.push({path:'/QRcode', query: {from: 'login'}});
								}
							}
						})
						.catch((res) => {
							console.log(res);
							this.loading_show = false;
							this.login_text = '登陆';
							_this.$message({
								showClose: true,
								message: '登陆失败，请检查账号密码或联系管理员',
								type: 'error'
							});
						});
				}
			},
			storeOrg: (index) => {
				var userData = JSON.parse(sessionStorage.userData_all)[index];
				if(localStorage.userData) localStorage.removeItem("userData");
				localStorage.setItem("userData", JSON.stringify(userData));
				if(_this.isPC == true) {
					_this.$router.push('/student');
				} else {
					_this.$router.push({path:'/QRcode', query: {from: 'login'}});
				}

				//				console.log(JSON.parse(localStorage.userData).org_id);
				//				sessionStorage.removeItem("userData_all");
			},
		}
	}
</script>

<style scoped>
	@import "../../../static/css/fontawesome/iconfont.css";
	.text-left {
		margin-top: 2em;
		width: 100%;
	}

	.text-left h2 {
		color: #34495e;
		font-weight: 500;
		padding-left: 0px;
	}

	.text-left h2 span {
		display: block;
		text-align: right;
		font-size: 0.4em;
		position: relative;
		bottom: 1em;
		right: 0px;
	}

	.color {
		background-color: #eff2f5;
		padding: 0px;
	}

	.content {
		width: calc(100% - 30px);
		margin: 0 auto;
		background: #fff;
		margin-top: 80px;
		min-height: 330px;
	}

	.page-content {
		margin: 0 auto;
		width: 100%;
		max-width: 400px;
		padding: 35px 0 78px 0;
	}

	.login-icon {
		display: block;
		width: 100%;
		cursor: pointer;
		background: #fff;
		border: none;
		padding-top: 40px;
		padding-bottom: 4px;
		font-size: 1.4em;
		border-bottom: #e9ecee 1px solid;
		color: #b8c4ce;
		transition: all 500ms ease-out;
	}

	.login-icon span.icon {
		font-size: 1.5em;
		font-weight: normal;
	}

	.input-text {
		border: none;
		font-size: 16px;
		font-weight: normal;
		padding: 10px 2.5% 0 2.5%;
		line-height: 20px;
		color: #5d6d7e;
		background: #fff;
		width: calc(100% - 40px);
		-webkit-appearance: none;
	}

	input.input-text:focus {
		border: none;
		outline: none;
	}

	input::-moz-placeholder {
		color: #b8c4ce;
		font-weight: normal;
	}

	input:-moz-placeholder {
		color: #b8c4ce;
		font-weight: normal;
	}

	input:-ms-input-placeholder {
		color: #b8c4ce;
		font-weight: normal;
	}

	input::-webkit-input-placeholder {
		color: #b8c4ce;
		font-weight: normal;
	}

	button.login-butt:active,
	button.login-butt {
		width: 100%;
		margin-top: 20px;
		display: inline-block;
		position: relative;
		vertical-align: middle;
		cursor: pointer;
		white-space: nowrap;
		background-color: #3499DA;
		height: 40px;
		font-size: 16px;
		list-style: 1.1em;
		color: #FFF;
		border: none;
		letter-spacing: 1px;
		overflow: hidden;
		text-align: center;
		border-radius: 2px;
		transition: all .1s ease-in;
	}

	button.login-butt:focus,
	button.login-butt:hover,
	button.login-butt:visited {
		background: #2380bc !important;
		color: #fff;
	}

	.text-right {
		margin-top: 2em;
	}

	.el-loading-spinner {
		left: 50% !important;
	}

	.page-content02 {
		width: 50%;
		margin: 0 auto;
		max-width: 400px;
		min-width: 280px;
	}

	h3 {
		text-align: left;
		margin-bottom: 1em;
	}

	.table {
		width: 100%;
		margin: 0 auto;
	}

	.table>tbody>tr>td {
		color: #3498db;
	}

	.table>tbody>tr>td {
		font-size: 1.1em;
		padding: 0.9em 0.5em 0.7em 1em;
		transition: all .2s ease-in;
	}

	.table>tbody>tr:first-child>td {
		border-top: none;
	}

	.table>tbody>tr>td:hover {
		text-decoration: underline;
		cursor: pointer;
		padding-left: 1.2em;
		color: #2a6496;
	}

	.table>tbody>tr:last-child>td:hover {
		text-decoration: none;
		cursor: default;
		color: #888;
	}

	.table>tbody>tr:last-child>td {
		color: #888;
		padding-top: 2em;
		text-align: right;
		font-size: 1em;
		letter-spacing: 0.05em;
	}

	.table>tbody>tr:last-child:hover {
		background: none;
	}

	.table>tbody>tr:last-child>td>a {
		text-decoration: none;
		color: #3498db;
	}

	.table>tbody>tr:last-child>td>a:hover {
		text-decoration: underline;
		color: #2a6496;
	}

	.table>tbody>tr:last-child>td>span {
		cursor: pointer;
	}
</style>

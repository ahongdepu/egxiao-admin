<template>
	<div class="content">
		<div class="page-content">
			<div class="text-left">
				<h2>易管校<span>有问题需要帮助？<a href="javascript:void(0)" onclick="_MEIQIA('showPanel')">联系客服</a></span></h2>
			</div>
			<form v-on:keydown.enter="register">
				<label class="login-icon">
				    <span class="icon iconfont icon-org-line"></span>
				    <input id="org_name" class="input-text" type="tel" @focus="isFocus($event)" @blur="isBlur($event)" v-model="registerModel.org_name" placeholder="请输入机构名称" maxlength="25" />				
			    </label>
				<label class="login-icon">
				    <span class="icon iconfont icon-my-line"></span>
				    <input id="phone" class="input-text" type="tel" @focus="isFocus($event)" @blur="isBlur($event)" v-model="registerModel.phone" placeholder="请输入手机号" maxlength="11" />				
			    </label>
				<label class="login-icon">
				    <input id="validateInput" class="input-text yzm pull-left" type="text" @focus="isFocus($event)" @blur="isBlur($event)" maxlength="6" v-model="code" placeholder="请输入验证码" />
				    <button id="validateCodeBtn" type="button" :plain="true" for="validateInput" class="yzm-fs login-butt pull-right" @click="sendValidateCode" v-show="!computedTime">获取验证码</button>
				    <button  type="button" disabled="disabled" for="validateInput" class="yzm-fs login-butt pull-right" v-show="computedTime">重新发送({{ computedTime }})</button>
				<div class="clearfix"></div>
				</label>
				<label class="login-icon">
					<span class="icon iconfont icon-lock-line-copy"></span>
				    <input id="password" class="input-text" type="password" @focus="isFocus($event)" @blur="isBlur($event)" v-model="registerModel.password" maxlength="18" placeholder="请设置密码" />
				</label>
				<button @click="register" :plain="true" type="button" class="login-butt" :loading="loading_show">{{ reg_text }}</button>
			</form>
			<div class="text-center text-tk">
				<p>点击注册即表示你已阅读并同意《
					<a href="https://egxiao.com/agreement.html">易管校使用条款</a>》</p>
			</div>
		</div>

		<div style="margin-top: 20px; width: 100%; color: #8492A6; text-align: center;">&copy;&nbsp;RonSchool</div>
	</div>

</template>

<script>
	import Vue from 'vue'
	let Base64 = require('js-base64').Base64
	export default {
		data() {
			return {
				validateCodeUrl: 'api/sms/ValidateCode',
				registerUrl: 'api/Account/AdminRegister',
				registerModel: {
					phone: '',
					org_name: '',
					name: '',
					password: ''
				},
				reg_text: '立即注册',
				loading_show: false,
				template_code: 'SMS_16815287',
				code: '',
				codeBtn: true,
				computedTime: 0, //倒数记时
			}
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
			sendValidateCode: function() {
				//手机号验证
				var partten = /^1[3,5,7,8]\d{9}$/;
				//获取发送验证吗的需要的信息
				var phone = this.registerModel.phone;
				var org_name = this.registerModel.org_name;
				var template_code = this.template_code;
				if(org_name == "") {
					this.$message.error("请输入机构名称");
					document.getElementById("org_name").focus();
				} else if(!partten.test(phone)) {
					this.$message.error("请输入正确的电话号码！");
					document.getElementById("phone").focus();
					return false;
				} else {
					this.computedTime = 120;
					this.timer = setInterval(() => {
						this.computedTime--;
						if(this.computedTime == 0) {
							clearInterval(this.timer)
						}
					}, 1000);
					document.getElementById("validateInput").focus();
					this.$http.get(this.validateCodeUrl, {
						params: {
							phone,
							template_code
						}
					}).then(function(response) {
						var validateCode = response.data.err_code;
						localStorage.setItem("validateCode", validateCode);
						if(localStorage.getItem("validateCode") != "") {
							setInterval(function() {
								localStorage.removeItem("validateCode")
							}, 600000)
						}
					}).catch(function(requestError) {
						this.this.$message.error(this.requestError)
					});
				};
			},
			register: function() {
				var _this = this;
				if(this.code == localStorage.getItem("validateCode")) {
					//密码正则验证
					var re = new RegExp("^(?![0-9@#$%^&*()+=|{}':;',\\[\\].<>/?~！!@#￥%……&*（）——+|{}【】‘；：”“’。，、？]+$)(?![a-zA-Z@#$%^&*()+=|{}':;',\\[\\].<>/?~！!@#￥%……&*（）——+|{}【】‘；：”“’。，、？]+$)[0-9A-Za-z@#$%^&*()+=|{}':;',\\[\\].<>/?~！!@#￥%……&*（）——+|{}【】‘；：”“’。，、？]{6,18}$");
					var register_params = this.registerModel;
					var pwd = register_params.password;
					if(!re.test(pwd)) {
						this.$message.error("密码是长度为6-18位数字和字母的组合");
						document.getElementById("password").focus();
					} else {
						this.loading_show = true;
						this.reg_text = '提交中';
						var phone = register_params.phone;
						var org_name = register_params.org_name;
						var name = register_params.org_name;
						var password = Base64.encode(register_params.password);
						this.$http.get(this.registerUrl, {
							params: {
								phone,
								org_name,
								name,
								password
							}
						}).then(function(response) {
							_this.loading_show = false;
							if(response.data.success == true) {
								var loginInfo = {};
								loginInfo.username = phone;
								loginInfo.password = password;
								localStorage.setItem("loginInfo", JSON.stringify(loginInfo));
								_this.$router.push('/QRcode');
							} else {
								_this.$message.error(response.data.msg);
							}
						}).catch((res) => {
							console.log(res);
							this.loading_show = false;
							this.login_text = '立即注册';
							_this.$message({
								showClose: true,
								message: '注册失败，请检查账号密码或联系管理员',
								type: 'error'
							});
						})
					}
				} else {
					this.$message.error("请输入正确的验证码！");
					document.getElementById("validateInput").focus();
				};
				this.reg_text = '立即注册';
			}
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
		width: 100%;
		background: #fff;
		margin-top: 1%;
		min-height: 330px;
	}
	
	.page-content {
		margin: 0 auto;
		width: 100%;
		max-width: 430px;
		padding: 2% 15px 0px;
	}
	
	.login-icon {
		display: block;
		width: 100%;
		cursor: pointer;
		background: #fff;
		border: none;
		padding-top: 40px;
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
		width: calc(100% - 3em);
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
	
	.login-butt {
		width: 100%;
		margin-top: 20px;
		display: inline-block;
		position: relative;
		vertical-align: middle;
		cursor: pointer;
		white-space: nowrap;
		background-color: #3499DA;
		height: 40px;
		line-height: 40px;
		font-size: 16px;
		color: #FFF;
		border: none;
		letter-spacing: 1px;
		overflow: hidden;
		text-align: center;
		border-radius: 2px
	}
	
	.text-right {
		font-size: 1em;
		margin-top: 2em;
	}
	
	.yzm {
		width: 60%;
		display: block;
	}
	
	.yzm-fs {
		width: 38%;
		font-size: 0.8em;
		font-weight: normal;
		padding: 0px !important;
		margin: 0px !important;
		margin-top: 0px !important;
	}
	
	button:hover,
	button:focus {
		background: #237cb5 !important;
		color: #fff !important;
	}
	
	button[disabled],
	button[disabled]:hover {
		background: #3499DA !important;
		opacity: .65;
		cursor: not-allowed !important;
	}
	
	.text-tk p {
		color: #8492A6;
		margin-top: 1.2em;
		font-size: .8em;
	}
	
	@media only screen and (max-width:1080px) and (-webkit-min-device-pixel-ratio: 1.5) {
		.content {
			margin-top: 0px;
		}
		.text-left {
			margin-top: 0px;
		}
		.login-icon {
			padding-top: 18px;
		}
	}
</style>
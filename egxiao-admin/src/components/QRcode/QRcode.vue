<template>
	<div class="bg">

		<header class="solid-bg">
			<nav class="navbar navbar-egxiao">
				<div class="container">
					<!-- Brand and toggle get grouped for better mobile display -->
					<div class="navbar-header">
						<a class="navbar-brand " href="https://www.egxiao.com">
							<img class="logo" src="../../../static/img/logoico.png" width="40"><span class="logoname click">易管校</span>
						</a>

					</div>

				</div>
			</nav>
		</header>

		<div class="container content text-center">
			<div class="row">
				<div class="col-xs-8  col-xs-offset-2">
					<h3>{{ title }}</h3>
					<p v-if="show_toggle"><span class="text-danger">{{ computedTime }}</span> 秒后离开本页面，<span class="text-danger click" @click="stopTimer">{{ stopTimer_text }}</span></p>
					<p>扫一扫下方的二维码，<a href="http://a.app.qq.com/o/simple.jsp?pkgname=com.ronzl.egxiao" class="text-center">立即体验</a></p>
					<a href="http://a.app.qq.com/o/simple.jsp?pkgname=com.ronzl.egxiao" class="text-center"><img class="img-responsive" src="../../../static/img/QRcode.png" /></a>
				</div>
			</div>
		</div>
		<div class="tc"></div>
	</div>

</template>

<script>
	let Base64 = require('js-base64').Base64
	export default {
		data() {
			return {
				stopTime: false,
				stopTimer_text: "点击停止",
				computedTime: 0,
				show_toggle: false,
				title: '恭喜你！已成功注册易管校', //
			}
		},
		created: function() {
			let f = location.href.split('?').pop().split('=').pop();
			if(f == 'login') {
				this.title = "登陆成功！您已拥有账号"
			} else {
				this.title = "恭喜你！已成功注册易管校"
			};
			let isPC = function() {
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
			if(isPC == true) {
				this.show_toggle = true;
				this.timer()
			}
		},
		methods: {
			timer() {
				this.computedTime = 3;
				this.timer = setInterval(() => {
					this.computedTime--;
					if(this.stopTime == false && this.computedTime <= 0) {
						clearInterval(this.timer);
						this.pageJump()
					} else if(this.stopTime == true) {
						clearInterval(this.timer)
					}
				}, 1000);
			},
			stopTimer: function() {
				if(this.stopTime == false) {
					this.stopTime = true;
					this.stopTimer_text = "点击跳转";
				} else {
					this.pageJump()
				}
			},
			pageJump: function() {
				if(localStorage.loginInfo || localStorage.loginInfo == "") {
					var loginInfo = JSON.parse(localStorage.loginInfo);
					loginInfo.grant_type = 'password';
					this.$http.post('token', loginInfo)
						.then((response) => {
							var userModels = JSON.parse(response.data.userModelJson);
							if(userModels.length > 1) {
								this.$router.push('/login')
							} else {
								localStorage.setItem('access_token', response.data.access_token);
								this.$router.push('/student')
							}
						}).catch(this.requestError);
				} else {
					this.$router.push('/login')
				}

			}
		}
	}
</script>

<style scoped="scoped">
	.bg {
		/*background: #f7f7f7;*/
		color: #333;
	}
	
	.tc {
		width: 1px;
		height: 1px;
		position: fixed;
		bottom: 0px;
		z-index: -1;
	}
	
	header.solid-bg {
		width: 100%;
		background-color: #373c44;
	}
	
	.solid-bg {
		position: fixed;
		top: 0px;
	}
	
	.navbar-brand {
		float: left;
		height: 50px;
		padding: 5px 15px;
		font-size: 18px;
		line-height: 20px;
	}
	
	.navbar-brand>img {
		display: inline;
	}
	
	.navbar-egxiao {
		background-color: #373c44;
		border-color: #373c44;
		margin-bottom: 0px !important;
	}
	
	.logoname {
		color: #fff;
		padding-left: 10px;
		font-size: 16px;
		vertical-align: middle;
	}
	
	@media (min-width: 768px) .navbar {
		border-radius: 0px;
	}
	
	.content {
		padding-top: 100px;
	}
	
	.col-sm-6 span.left {
		display: block;
		width: 100%;
		font-size: 3000%;
		font-weight: normal;
		color: #48576a;
	}
	
	.content .img-responsive {
		width: 25%;
		max-width: 250px;
		min-width: 100px;
		margin: 0 auto;
	}
	
	.click {
		cursor: pointer;
	}
	
	.click:hover {
		text-decoration: underline;
	}
	
	@media only screen and (max-width:1080px) and (-webkit-min-device-pixel-ratio: 2) {
		.content {
			padding-top: 80px;
		}
		h3 {
			font-size: 1.3em;
		}
		p {
			font-size: 0.9em;
		}
	}
</style>
<template>

	<div class="stu_detail_bg">
		<div class="stu_detail" id="stu_detail">
			<div class="detail_content">
				<div class="close" @click="closeDetail">
					<span class="el-icon-close"></span>
				</div>
				<h4 class="profile_name">{{ profile.name }}</h4>
				<div class="detail_top">
					<div class="info-line">学员: {{ studentDetail["姓名"] }}</div>
					<div class="info-line">成交状态: {{ studentDetail["状态"] }} &nbsp;|&nbsp; 最后跟进时间：{{ studentDetail["最后跟进时间"] }}</div>
				</div>
				<div class="detail_main">
					<el-tabs v-model="activeName" @tab-click="handleClick($event)">
						<el-tab-pane label="学员信息" name="first" class="block">学员信息</el-tab-pane>
						<el-tab-pane label="跟进记录" name="second">跟进记录</el-tab-pane>
						<el-tab-pane label="上课记录" name="third">上课记录</el-tab-pane>
						<el-tab-pane label="报名课程" name="fourth">报名课程</el-tab-pane>
						<el-tab-pane label="财务信息" name="fifth">财务信息</el-tab-pane>
					</el-tabs>
					<div class="pageContent">
						<div class="scroll-hidden">
							<div v-show="detail_num === 0" class="page-container">
								<div class="info_list" v-for="(val,key) in studentDetail">
									<div class="list_key">
										{{ key }}
									</div>
									<div class="list_val">
										{{ val || '---' }}
									</div>
								</div>
							</div>
							<div v-show="!record_show" class="no-info">
								<h2>{{ msg_noInfo }}</h2>
							</div>
							<div v-show="detail_num === 1">
								<div v-if="showHid.flowUpShow">
									<div class="record" v-for="record in studentRecord" ref="recordItem">
										<div class="record_top">
											<img class="pull-left user-img img-responsive" src="../../../../static/assets/images/users/no-image.jpg" />
											<div class="pull-left user">
												<h4>{{ record.create_name }}</h4>
												<time :datetime="record.create_time">{{ record.create_time }}</time>
											</div>
											<div class="pull-right">{{ record.style }}</div>
											<div class="clearfix"></div>

										</div>
										<div id="state" class="color_bg">{{ record.state }}</div>
										<p class="record_msg">{{ record.r_content }}</p>
										<div class="record_bott">
											<div class="pull-left">
												<span class="fa fa-thumbs-up"></span>赞
											</div>
											<div class="pull-right">
												<span class="fa fa-trash-o"></span>删除
											</div>
											<div class="clearfix"></div>
										</div>
									</div>
									<div @click="moreInfoFlow" v-if="showHid.loadMoreFlow" class="loadMore_flow text-center">加载更多</div>
								</div>
							</div>
							<div v-show="detail_num === 2" class="">
								<div class="course_bg" v-if="showHid.lessonShow">
									<el-collapse class="">
										<el-collapse-item v-for="(course,key,$index) in studentCourse" :title="course.teacher_name+' '+course.create_time " :name="$index" :key="course.create_time">
											<div class="lesson_name">
												<i class="iconfont icon-xiangmu"></i>{{ course.lesson_name }}
												<div class="pull-right">{{ course.lesson_type }}&nbsp;&nbsp;</div>
											</div>
											<div class="pull-left half-block">
												<span class="txt-gray">消耗:</span><span class="text-large">{{ course.lesson_num }}</span><span class="txt-gray"> /课时</span>
											</div>
											<div class="pull-left half-block">
												<span class="txt-gray">科目:</span><span class="sub_name">{{ course.subject_name }}</span>
											</div>
											<div class="pull-left half-block">
												<span class="txt-gray">上课类型:</span>{{ course.state }}
											</div>
											<div class="pull-left half-block">
												<span class="txt-gray">上课方式:</span>{{ course.style }}
											</div>
											<div class="clearfix"></div>
											<div class="description">
												<span class="txt-gray">说明:</span>{{ course.description }}
											</div>
											<div class="lesson_name"><i class="iconfont icon-guanlian"></i>教师: {{ course.teacher_name }}</div>
										</el-collapse-item>
									</el-collapse>
									<div v-if="showHid.loadMore" class="text-center loadMore" @click="moreInfoLesson"><i class="el-icon-caret-bottom"></i><span class="loadMore_text"> 加载更多</span></div>
								</div>
							</div>
							<div v-show="detail_num === 3" class="">
								<div class="page-container" v-if="showHid.courseShow">
									<ul class="list-unstyled block pull-left">
										<li v-for="courseNames in studentEnroll.courseName" @click="lessonDetail(courseNames.org_id,courseNames.id,courseNames.name,courseNames.type)">{{ courseNames.name }}</li>
									</ul>
									<div class="pull-left course_content">
										<div class="courseDetail_list">
											<div class="pull-left course_type course_type_color0"></div>
											<div class="pull-left courseList_con">
												<h4 class="h4-color-0">课程信息</h4>
												<div class="course_name">课程：<i>{{ studentEnroll.courseDetail.courseName }}</i></div>
												<div class="half-block pull-left">
													类型：{{ studentEnroll.courseDetail.type }}
												</div>
												<div class="half-block pull-left">
													总计：<span class="text-primary">{{ studentEnroll.courseDetail.totalNum }}</span> 课时
												</div>
												<div class="half-block pull-left">
													消耗：<span class="text-success">{{ studentEnroll.courseDetail.userNum }}</span> 课时
												</div>
												<div class="half-block pull-left">
													剩余：<span class="text-danger">{{ studentEnroll.courseDetail.totalNum - studentEnroll.courseDetail.userNum }}</span> 课时
												</div>
												<div class="clearfix"></div>
											</div>
											<div class="clearfix"></div>
										</div>
										<div class="courseDetail_list">
											<div class="pull-left course_type course_type_color1"></div>
											<div class="pull-left courseList_con">
												<h4 class="h4-color-1">报名记录<span class="partLine">|</span><span class="enroll_num">{{ studentEnroll.courseDetail.enrollNum }} 条</span></h4>
												<div class="course_main">
													<div class="enroll_list" v-for="enroll in studentEnroll.courseDetail.enroll">
														<div class="pull-right">
															<small>{{ enroll.lesson_type }}</small>
														</div>
														<p>{{ enroll.create_name }}<span class="partLine">|</span>{{ enroll.create_time.substring(0, 10)+' '+enroll.create_time.substring(11, 16) }}</p>
														<p>报名 {{ enroll.lesson_number }} 课时</p>
														<p>说明：{{ enroll.description }}</p>
													</div>
												</div>
											</div>
											<div class="clearfix"></div>
										</div>
										<div class="courseDetail_list">
											<div class="pull-left course_type course_type_color2"></div>
											<div class="pull-left courseList_con">
												<h4 class="h4-color-2">退课记录<span class="partLine">|</span><span class="enroll_num">{{ studentEnroll.courseDetail.withdrawNum }} 条</span></h4>
												<div class="course_main">
													<div class="enroll_list" v-for="withdraw in studentEnroll.courseDetail.withdraw">
														<div class="pull-right">
															<small>{{ withdraw.lesson_type }}</small>
														</div>
														<p>{{ withdraw.create_name }}<span class="partLine">|</span>{{ withdraw.create_time.substring(0, 10)+' '+withdraw.create_time.substring(11, 16) }}</p>
														<p>退课 {{ 0 - withdraw.lesson_number }} 课时</p>
														<p>说明：{{ withdraw.description }}</p>
													</div>
												</div>
											</div>
											<div class="clearfix"></div>
										</div>
									</div>
									<div class="clearfix"></div>
								</div>
							</div>
							<div v-show="detail_num === 4" class="">
								<div class="page-container" v-if="showHid.costShow">
									<div class="costInfo">
										<div class="costInfo-msg" @click="costFlows">
											<div class="half-block pull-left">缴费：{{ studentCost.payment }}</div>
											<div class="half-block pull-left">余额：{{ studentCost.balance }}</div>
											<div class="half-block pull-left">优惠金额：{{ studentCost.cash_coupon }}</div>
											<div class="half-block pull-left">欠费：{{ studentCost.arrears }}</div>
											<div class="half-block pull-left">退费：{{ studentCost.refund }}</div>
											<div class="clearfix"></div>
										</div>
										<h4 class="flowRecord_title" @click="costFlows">流水记录</h4>
										<div class="flowRecord_content">
											<div class="flowRecord_list" v-for="flow in costFlow" :key="flow.create_time">
												<p>{{ flow.create_name }}<span class="partLine">|</span>{{ flow.create_time.substring(0, 10)+' '+flow.create_time.substring(11, 16) }}</p>
												<p>{{ flow.item_name }} <span>{{ flow.moeny }}</span>元</p>
												<p>说明： {{ flow.description }}</p>
											</div>
											<div @click="costFlows" v-if="showHid.loadMoreCost" class="loadMore_flow text-center">加载更多</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

</template>

<script>
	export default {
		data () {
			return {
				lalala:'这就是爱',
				msg_noInfo: '',
				record_show: true, //无数据时false显示暂无数据
				studentRecord: [], //单个学员的详细数据 ———— 跟进记录
				studentCourse: [], //单个学员的详细数据 ———— 上课记录
				stu_detail_show: true, //单个学员的详情页面
				studentEnroll: {
					courseName: [],
					courseDetail: []
				}, //单个学员的详细数据 ———— 报名课程
				detail_num: 0, //学员详情中各个选项的展示切换
				activeName: "first", //详情导航tab默认第一个
				studentCost: {
					costFlow: [],
				}, //单个学员的详细数据 ———— 财务信息
				costFlow: [], //财务流水
			}
		},
		props:[
			'tableData',//表格数据
			'moreInfoData',//加载更多
			'student_id',
			'profile',
			'studentDetail',
			'showHid',
		],
		created: function(){
			console.log(this.studentDetail);
		},
		methods: {
			closeDetail(){
				this.$emit('la-la')
			},
			tabChange(){
				this.activeName = 'first';
				this.handleClick(null,"学员信息")
			},
			handleClick: function($event,s) {
				let tabName;
				if($event){
					tabName = event.currentTarget.innerText;
				}else{
					tabName = s;
				}
				var userData = JSON.parse(localStorage.userData);
				var access_token = localStorage.access_token;
				let _this = this;
				this.moreInfoData.currentPage = 0;
				var data = {
					pagesize: 20,
					pageindex: 1,
					org_id: userData.org_id ? userData.org_id : userData[0].org_id,
					account_id: userData.id ? userData.id : userData[0].id,
					student_id: this.student_id,
				};
				if(tabName == "学员信息") {
					this.record_show = true;
					this.detail_num = 0;
				} else if(tabName == "跟进记录") {
					this.detail_num = 1;
					if(this.studentRecord.length > 0) {
						this.studentRecord = [];
					};
					_this.moreInfoFlow();

				} else if(tabName == "上课记录") {
					this.detail_num = 2;
					if(_this.studentCourse.length > 0) {
						_this.studentCourse = [];
					};
					_this.moreInfoLesson();
				} else if(tabName == "报名课程") {
					this.detail_num = 3;
					if(this.studentEnroll.length > 0) {
						this.studentEnroll = [];
					};
					let studentEnroll = this.studentEnroll;
					let org_id = data.org_id;
					let stu_id = this.student_id;
					this.$http.get("api/Student/GetStudentdDetailInfo", {
						params: {
							org_id,
							stu_id
						},
						headers: {
							'Authorization': 'Bearer ' + (access_token ? access_token : '')
						}
					}).then(function(response) {
						_this.studentEnroll.courseName = response.data.lesson;
						if(_this.studentEnroll.courseName.length > 0) {
							_this.showHid.courseShow = true;
							_this.record_show = true;
							let orgId = _this.studentEnroll.courseName[0].org_id;
							let id = _this.studentEnroll.courseName[0].id;
							let course_id = _this.studentEnroll.courseName[0].name;
							let courseType = _this.studentEnroll.courseName[0].type;
							_this.lessonDetail(orgId, id, course_id, courseType);
						} else {
							_this.showHid.courseShow = false;
							_this.record_show = false;
							_this.msg_noInfo = "暂无报名课程"
						}
					}).catch(this.requestError);
				} else if(tabName == "财务信息") {
					this.detail_num = 4;
					if(this.studentCourse.length > 0) {
						this.studentCourse = [];
					};
					let org_id = data.org_id;
					let stu_id = this.student_id;
					this.$http.get("api/Student/GetStudentdDetailInfo", {
						params: {
							org_id,
							stu_id
						},
						headers: {
							'Authorization': 'Bearer ' + (access_token ? access_token : '')
						}
					}).then(function(response) {
						if(response.data.studentCost.payment == 0 && response.data.studentCost.arrears == 0 && response.data.studentCost.balance == 0) {
							_this.showHid.costShow = false;
							_this.record_show = false;
							_this.msg_noInfo = "暂无财务信息"
						} else {
							_this.showHid.costShow = true;
							_this.record_show = true;
							_this.studentCost = response.data.studentCost;
							_this.costFlows();
						}
					}).catch(this.requestError);
				}
			},
			lessonDetail: function(orgId, id, course_id, courseType) {
				let org_id = orgId;
				let lesson_id = id;
				let stu_id = this.student_id;
				let course_type = courseType;
				let access_token = localStorage.access_token;
				this.$http.get("api/Student/GetStuLessonDetailInfo", {
					params: {
						org_id,
						stu_id,
						lesson_id
					},
					headers: {
						'Authorization': 'Bearer ' + (access_token ? access_token : '')
					}
				}).then((response) => {
					this.studentEnroll.courseDetail = response.data;
					this.studentEnroll.courseDetail.courseName = course_id;
					this.studentEnroll.courseDetail.type = course_type == "1" ? "课时" : "课时包";
					this.studentEnroll.courseDetail.userNum = this.studentEnroll.courseDetail.userNum ? this.studentEnroll.courseDetail.userNum : 0;
					let withdraw_num = 0;
					//根据lesson_number的值分为报名和退课两组
					let cache = [];
					let cache_enroll = [];
					this.studentEnroll.courseDetail.withdraw = [];
					for(var i = 0; i < response.data.enroll.length; i++) {
						switch(response.data.enroll[i].lesson_type) {
							case "0":
								response.data.enroll[i].lesson_type = "未结算"
								break;
							case "1":
								response.data.enroll[i].lesson_type = "按消结算"
								break;
							case "2":
								response.data.enroll[i].lesson_type = "已结算"
								break;
							default:
								break;
						};
						if(response.data.enroll[i].lesson_number < 0) {
							//获取退课的数量
							withdraw_num = withdraw_num + 1;
							//将退课的信息放置在cache数组当中
							cache.push(response.data.enroll[i]);
						} else {
							cache_enroll.push(response.data.enroll[i])
						}
					};
					this.studentEnroll.courseDetail.withdraw = cache;
					this.studentEnroll.courseDetail.enroll = cache_enroll;
					//得到报名和退课的数量
					this.studentEnroll.courseDetail.withdrawNum = withdraw_num;
					this.studentEnroll.courseDetail.enrollNum = this.studentEnroll.courseDetail.enroll.length;
				}).catch(this.requestError);
			},
			costFlows: function() {
				this.studentCost.costFlow = [];
				this.studentCost.costFlow.items = [];
				var userData = JSON.parse(localStorage.userData);
				var access_token = localStorage.access_token;
				this.moreInfoData.currentPage++;
				let pageNum = this.moreInfoData.currentPage;
				let _this = this;
				var data = {
					pagesize: 3,
					pageindex: pageNum,
					org_id: userData.org_id ? userData.org_id : userData[0].org_id,
					account_id: userData.id ? userData.id : userData[0].id,
					student_id: this.student_id,
				};
				this.$http.get("api/Student/GetStudentCashFlowList", {
					params: {
						data: JSON.stringify(data)
					},
					headers: {
						'Authorization': 'Bearer ' + (access_token ? access_token : '')
					}
				}).then((response) => {
					let totalPageCount = response.data.totalPageCount;
					if(totalPageCount > pageNum) {
						_this.showHid.loadMoreCost = true;
					} else {
						_this.showHid.loadMoreCost = false;
					};
					var items = response.data.items;
					_this.studentCost.costFlow = response.data;
					if(items.length > 0) {
						for(var i = 0; i < items.length; i++) {
							let cache = items[i];
							_this.costFlow.push(cache);
						}
					};
				}).catch(this.requestError);
			},
			moreInfoLesson: function() {
				var userData = JSON.parse(localStorage.userData);
				var access_token = localStorage.access_token;
				this.moreInfoData.currentPage++;
				let pageNum = this.moreInfoData.currentPage;
				let _this = this;
				var data = {
					pagesize: 10,
					pageindex: pageNum,
					org_id: userData.org_id ? userData.org_id : userData[0].org_id,
					account_id: userData.id ? userData.id : userData[0].id,
					student_id: this.student_id,
				};
				this.$http.get("api/work/GetNoteLesson", {
					params: {
						data: JSON.stringify(data)
					},
					headers: {
						'Authorization': 'Bearer ' + (access_token ? access_token : '')
					}
				}).then((response) => {
					var totalItemCount = response.data.totalItemCount;
					var totalPageCount = response.data.totalPageCount;
					var items = response.data.items;
					if(totalItemCount > 10 && totalPageCount > pageNum) {
						_this.showHid.loadMore = true;
					} else {
						_this.showHid.loadMore = false;
					};
					if(items.length > 0) {
						_this.showHid.lessonShow = true;
						_this.record_show = true;
						let cache = [];
						for(var i = 0; i < items.length; i++) {
							var cache = items[i].noteLesson;
							switch(cache.state) {
								case "noleState0001":
									cache.state = "上课";
									break;
								case "noleState0002":
									cache.state = "旷课";
									break;
								case "noleState0003":
									cache.state = "补课";
									break;
								case "noleState0004":
									cache.state = "请假";
									break;
								default:
									break;
							};
							cache.lesson_type = "1" ? "课时" : "课时包";
							cache.style = "1" ? "正式" : "试听";
							cache.create_time = cache.create_time ? cache.create_time.substring(0, 10) + " " + cache.create_time.substring(11, 16) : "无";
							_this.studentCourse.push(cache);
						}
					} else {
						_this.showHid.lessonShow = false;
						_this.record_show = false;
						_this.msg_noInfo = '暂无上课记录';
					};

				}).catch(this.requestError);
			},
			moreInfoFlow: function() {
				var userData = JSON.parse(localStorage.userData);
				var access_token = localStorage.access_token;
				this.moreInfoData.currentPage++;
				let pageNum = this.moreInfoData.currentPage;
				let _this = this;
				var data = {
					pagesize: 10,
					pageindex: pageNum,
					org_id: userData.org_id ? userData.org_id : userData[0].org_id,
					account_id: userData.id ? userData.id : userData[0].id,
					student_id: this.student_id,
				};
				this.$http.get("api/work/GetRecordList", {
					params: {
						data: JSON.stringify(data)
					},
					headers: {
						'Authorization': 'Bearer ' + (access_token ? access_token : '')
					}
				}).then(function(response) {
					var totalItemCount = response.data.totalItemCount;
					var totalPageCount = response.data.totalPageCount;
					var items = response.data.items;
					if(totalItemCount > 10 && totalPageCount > pageNum) {
						_this.showHid.loadMoreFlow = true;
					} else {
						_this.showHid.loadMoreFlow = false;
					};
					if(items.length > 0) {
						_this.record_show = true;
						_this.showHid.flowUpShow = true;
						for(var i = 0; i < items.length; i++) {
							var cache = items[i].record;
							switch(cache.state) {
								case "stuState0001":
									cache.state = "跟进中";
									break;
								case "stuState0002":
									cache.state = "已报名";
									break;
								case "stuState0003":
									cache.state = "无意向";
									break;
								case "stuState0004":
									cache.state = "已结课";
									break;
								case "stuState0005":
									cache.state = "已流失";
									break;
								default:
									cache.state = "其他";
							};
							switch(cache.style) {
								case "talkStyle0001":
									cache.style = "打电话";
									break;
								case "talkStyle0002":
									cache.style = "面谈";
									break;
								case "talkStyle0003":
									cache.style = "发短信";
									break;
								case "talkStyle0004":
									cache.style = "微信";
									break;
								default:
									break;
							};
							cache.create_time = cache.create_time ? cache.create_time.substring(0, 10) + " " + cache.create_time.substring(11, 16) : "无";
							_this.studentRecord.push(cache);
						}
					} else {
						_this.showHid.flowUpShow = false;
						_this.record_show = false;
						_this.msg_noInfo = '暂无跟进记录';
					}
				}).catch(this.requestError);
			},
		}
	}
</script>

<style>
	/*学员详细的样式*/

	.stu_detail_bg {
		transition: all .3s ease-in;
	}

	.stu_detail {
		background: #324057;
		position: fixed;
		width: 45%;
		min-width: 600px;
		min-height: calc(100% - 50px);
		right: 0px;
		bottom: 0px;
		color: #D3DCE6;
		z-index: 6;
		box-shadow: 2px 0 1px 5px rgba(0, 0, 0, 0.2);
		transition: right 2s;
		-moz-transition: right 2s;
	}

	.pageContent {
		height: 100%;
		width: 100%;
		padding: 2em 0;
		overflow: auto;
	}

	.pageContent .scroll-hidden {
		position: absolute;
		width: calc(100%);
		height: 55vh;
		right: -15px;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.detail_content {
		padding: 0.5em 1.5em;
	}

	.close {
		width: 100%;
		text-align: left;
		margin-bottom: 1em;
		opacity: 1;
		filter: alpha(opacity=100);
		text-shadow: none;
		color: #fff;
	}

	.close:hover {
		color: #F9FAFC;
	}

	.el-icon-close {
		font-size: 0.7em;
		padding-left: 1em;
		height: 2em;
	}

	.detail_top {
		color: #8492A6;
		font-weight: 400;
		margin-bottom: 1.5em;
	}

	.el-tabs__item.is-active {
		color: #ffd559;
	}

	.el-tabs__active-bar {
		background-color: #E5E9F2;
	}
	/*学员信息*/

	.detail_main .page-container {
		width: calc(100% - 30px);
		min-height: 500px;
		border-radius: 0.5em;
		background: #F9FAFC;
		border: 1px solid #99A9BF;
	}

	.info_list {
		width: auto;
		padding: 1em;
	}

	.info_list .list_key,
	.info_list .list_val {
		float: left;
		font-size: 0.9em;
	}

	.info_list .list_key {
		overflow: hidden;
		margin-right: 1em;
		color: #8492A6;
		width: 8em;
	}

	.info_list .list_val {
		color: #324057;
	}

	.info_list:last-child {
		display: none !important;
	}
	/*跟进记录*/

	.course_bg {
		width: 90%;
		height: 100%;
		min-height: 500px;
		padding: 1.5em 0;
		border-radius: 0.5em;
		background-color: #Fff;
	}

	.no-info {
		border-radius: 0.5em;
		margin-top: 1em;
		border: 1px solid #99A9BF;
		height: 100%;
		min-height: 500px;
		text-align: center;
		width: 100%;
		background-color: #F9FAFC;
	}

	.no-info h2 {
		margin-top: 30%;
	}

	.page-container h2 {
		line-height: 100%;
	}

	.record {
		background-color: #F9FAFC;
		color: #8492A6;
		font-weight: lighter;
		font-size: 0.85em;
		padding: 1em;
		margin: 1em 0em;
		border-radius: 0.8em;
		width: 60%;
		min-width: 350px;
	}

	.record .record_top {
		position: relative;
		width: 100%;
		height: auto;
		margin-bottom: 0.4em;
	}

	.record .record_top img.user-img {
		border-radius: 10%;
		height: 3em;
		margin-right: 0.2em;
	}

	.record .user {
		margin-left: 0.1em;
	}

	.record h4 {
		margin-top: 0px;
		margin-bottom: 0.2em;
		color: #475669;
	}

	.record .color_bg {
		font-size: 1em;
		margin-top: 1em;
		display: inline;
		padding: 0.3em 0.5em;
		width: auto;
		border-radius: 1em;
	}

	.record .record_msg {
		margin: 0.5em 0em 1em 0em;
		min-height: 1.8em;
	}

	.color_bg_0 {
		background-color: #F7BA2A;
	}

	.color_bg_1 {
		background-color: #20A0FF;
	}

	.color_bg_2 {
		background-color: #FF4949;
	}

	.record p {
		font-size: 1em;
		width: 100%;
		color: #1F2D3D;
	}

	.record .record_bott {
		font-size: 0.8em;
	}

	.record .record_bott span.fa {
		margin-right: 0.4em;
		font-size: 0.9em;
	}

	.el-collapse {
		width: 92%;
		margin: 0 auto;
	}

	.el-collapse-item__content {
		color: #475669;
		font-size: 0.85em;
	}

	.el-collapse-item__content span.txt-gray {
		padding-right: 1em;
		color: #99A9BF;
	}

	.lesson_name {
		width: 100%;
		padding-left: 1em;
		background-color: #F9FAFC;
		color: #8492A6;
		font-weight: lighter;
	}

	.lesson_name i {
		margin-right: 1em;
	}

	.half-block {
		width: 50%;
		height: 42px;
		line-height: 42px;
	}

	.text-large {
		color: #0f9048;
		font-size: 2em;
	}

	.description {
		margin-top: 0.5em;
		margin-bottom: 1em;
	}

	span.sub_name {
		color: #8113fe;
		font-size: 1.4em;
	}
	/*报名课程*/

	ul.block {
		padding: 1em;
		width: 30%;
		min-width: 14em;
		min-height: 499px;
		height: 70%;
		border-right: 1px solid #C0CCDA;
	}

	ul.block>li {
		display: block;
		color: #475669;
		padding: 0.8em 0;
		overflow: hidden;
		cursor: pointer;
		width: 100%;
		border-bottom: 1px solid #D3DCE6;
		transition: all .2s ease;
	}

	ul.block>li:hover,
	ul.block>li:active {
		color: #1F2D3D;
		padding-left: 0.2em;
		font-weight: 500;
	}

	.course_content {
		width: 70%;
		max-width: calc(100% - 15em);
		min-height: 499px;
	}

	.courseDetail_list {
		color: #324057;
		font-size: 0.9em;
		font-weight: 310;
		margin-left: 0.5em;
		margin-top: 0.5em;
		max-width: 500px;
		padding-bottom: 0.5em;
		width: 100%;
		border: 1px solid #D3DCE6;
		border-radius: 0.3em;
		box-shadow: 0px 0px 1px rgba(71, 86, 105, .3);
	}

	.courseDetail_list h4 {
		font-weight: 400;
		font-size: 1.2em;
		letter-spacing: 0.1em;
	}

	h4.h4-color-0 {
		color: #F7BA2A;
	}

	h4.h4-color-1 {
		color: #20A0FF;
	}

	.courseDetail_list h4.h4-color-2 {
		color: #FF4949;
	}

	.courseDetail_list small {
		font-size: 0.96em;
	}

	.course_type {
		height: 1.2em;
		width: 0.6em;
		margin-right: 0.5em;
		margin-top: 0.7em;
		border-top-right-radius: 0.2em;
		border-bottom-right-radius: 0.2em;
	}

	.course_type_color0 {
		background-color: #F7BA2A;
	}

	.course_type_color1 {
		background-color: #20A0FF;
	}

	.course_type_color2 {
		background-color: #FF4949;
	}

	.courseList_con {
		width: calc(100% - 2em);
	}

	.courseDetail_list .course_name {
		margin-bottom: 0.5em;
	}

	.courseDetail_list .half-block {
		height: 2em;
		line-height: 2em;
	}

	span.partLine {
		color: #E5E9F2;
		margin: 0 0.8em;
	}

	span.enroll_num {
		font-size: 0.8em;
		color: #475669;
	}

	.courseDetail_list .course_main {
		padding-top: 0.8em;
	}

	.courseDetail_list .course_main .enroll_list {
		border-top: 1px solid #D3DCE6;
		padding-top: 0.5em;
	}

	.courseDetail_list .course_main .enroll_list:first-child {
		border-top: none;
	}

	.costInfo {
		width: calc(100% - 2em);
		margin-left: 1em;
		margin-top: 1em;
		color: #324057;
		font-weight: 300;
	}

	.costInfo-msg {
		padding-bottom: 1em;
		border-bottom: 1px solid #E5E9F2;
	}

	.costInfo-msg>.half-block {
		height: 26px;
		line-height: 26px;
		font-size: 1em;
	}

	.flowRecord_content {
		font-size: 0.93em;
	}

	.flowRecord_list {
		padding-bottom: 0.6em;
		margin-top: 0.3em;
		border-bottom: 1px solid #E5E9F2;
	}
	/*加载更多按钮的样式*/

	.loadMore {
		width: 92%;
		border: 1px solid #D3DCE6;
		border-top: none;
		margin: 0 auto;
		height: 2.2em;
		line-height: 2.2em;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.loadMore:hover {
		background-color: #F9FAFC;
		padding-top: 0.2em;
		color: #475669;
	}

	.loadMore_flow {
		width: 100%;
		padding: 0.8em;
		cursor: pointer;
	}

	.loadMore_flow:hover {
		color: #1D8CE0;
	}
</style>

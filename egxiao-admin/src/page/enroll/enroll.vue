<template>
	<div class="">
		<h3 class="pull-left">{{ pageTitle }}</h3>
		<!-- 搜索框 -->
		<div class="pull-right search-bg" v-on:keydown.enter="searchData()">
			<ul class="search_state list-inline text-center text-nowrap">
				<li class="text-right text-nowrap" v-for="sta in search.search_style_before" :key="sta" @click="search.search_msg='';search.search_style = [sta];searchData(0)">
					{{ sta }}
				</li>
			</ul>
			<div class="clearfix"></div>
			<el-input class="search_outer" :placeholder="search.placeHolder" v-model="search.search_msg" @keyup.enter="searchData()">
				<el-select v-model="search.state_slc" slot="prepend" placeholder="学员" @change="searchOption">
					<el-option v-for="con in search.condition" :label="con" :value="con" :key="con"></el-option>
				</el-select>

				<el-button slot="append" icon="search" @click="searchData" class="search_btn"></el-button>
			</el-input>
		</div>
		<div class="clearfix"></div>
		<!-- 操作栏按钮组 -->
		<div class="operationGroup block-full-width text-right">
			<ul class="otg_ul">
				<li @click="searchData">刷新</li>
				<li @click="dialogShow.adSearch = true"><i class="fa fa-filter"></i>&nbsp;高级筛查</li>
				<li @click="dialogShow.sorts = true">选择展示列</li>
				<!--<li>
					<el-dropdown @command="IExport"><span class="el-dropdown-link">导入/导出<i class="el-icon-caret-bottom el-icon--right"></i></span>
						<el-dropdown-menu slot="dropdown">
							<el-dropdown-item command="import">导入</el-dropdown-item>
							<el-dropdown-item command="export">导出</el-dropdown-item>
						</el-dropdown-menu>
					</el-dropdown>
				</li>-->

				<li @click="automateExcel">导出
					<a id="dlink" style="display:none;"></a>
				</li>
			</ul>
		</div>
		<!-- 数据展示表格 -->
		<el-table :data="tableData" style="width: 100%" :height="tableRender.tableHeight" border v-loading.body="tableRender.loading">
			<!--<el-table-column type="selection" fixed></el-table-column>-->
			<el-table-column v-for="type in tableRender.tableData_type" :prop="type" :key="type.text" :label="type" sortable></el-table-column>
		</el-table>
		<!-- 页码跳转 -->
		<div class="block pull-left">
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="tableRender.currentPage" :page-sizes="[20, 30, 50, 100]" :page-size="tableRender.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="tableRender.totalItemCount">
			</el-pagination>
		</div>
		<!-- 计数 -->
		<div class="bill pull-right">
			<p>欠费： <i class="small">{{ bill.Arrears }}</i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;缴费：<i class="small"> {{ bill.payMoney }}</i></p>
		</div>
		<div class="clearfix"></div>
		<!-- 高级搜索弹出模态框 -->
		<el-dialog title="高级搜索" :visible.sync="dialogShow.adSearch" size="tiny" :show-close=false>
			<div class="el-dialog__headerbtn" @click="dialogShow.adSearch = false;">
				<i class="el-dialog__close el-icon el-icon-close close_event"></i>
			</div>
			<el-form :model="search" label-width="100px" ref="ruleForm" @keydown.enter="dialogShow.adSearch = false;refresh()">
				<el-form-item label="学员姓名">
					<el-input v-model="search.search_stu"></el-input>
				</el-form-item>
				<el-form-item label="报名人名称">
					<el-input v-model="search.create_name"></el-input>
				</el-form-item>
				<el-form-item label="报名课程">
					<el-input v-model="search.lesson_name"></el-input>
				</el-form-item>
				<el-form-item label="开始时间">
					<el-date-picker v-model="search.time_start" type="date" placeholder="选择日期" :picker-options="search.pickerOptions"></el-date-picker>
				</el-form-item>
				<el-form-item label="结束时间">
					<el-date-picker v-model="search.time_end" type="date" placeholder="选择日期" :picker-options="search.pickerOptions"></el-date-picker>
				</el-form-item>
				<el-form-item label="学员状态">
					<el-checkbox-group v-model="search.search_style">
						<el-checkbox v-for="sta in search.search_style_before" :label="sta" :key="sta"></el-checkbox>
					</el-checkbox-group>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="dialogShow.adSearch = false;refresh()">立即搜索</el-button>
					<el-button @click="resetForm">重置</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
		<!-- 选择展示弹出模态框 -->
		<el-dialog title="选择展示" :visible.sync="dialogShow.sorts" :show-close=false>
			<div class="el-dialog__headerbtn" @click="dialogShow.sorts = false;">
				<i class="el-dialog__close el-icon el-icon-close close_event"></i>
			</div>
			<el-checkbox :indeterminate="tableRender.isIndeterminate" v-model="tableRender.checkAll" @change="checkAllSorts">全选</el-checkbox>
			<a class="resetSorts" @click="tableRender.tableData_type= ['报名学员','报名人','报名课程','缴费金额','课时数','课程类型','单价','创建时间'];checkSort(tableRender.tableData_type)">重置</a>
			<el-checkbox-group v-model="tableRender.tableData_type" class="sorts" @change="checkSort">
				<el-checkbox label="报名学员" disabled></el-checkbox>
				<el-checkbox label="报名人" disabled></el-checkbox>
				<el-checkbox v-for="sta in tableRender.checkList" :label="sta" :key="sta"></el-checkbox>
			</el-checkbox-group>
		</el-dialog>
	</div>
</template>

<script>
	import {automateExcel} from '@/util/util.js';
	export default {
		data() {
			return {
				pageTitle: "报名",
				//搜索选项
				search: {
					search_style_before: ['欠费', '优惠'],
					state_slc: '学员', //选中的单项搜索条件
					search_stu: '', //学生姓名
					create_name: '', //报名人姓名
					lesson_name: '', //报名课程
					time_start: '',
					time_end: '',
					pickerOptions: {
						disabledDate(time) {
							return time.getTime() > Date.now();
						}
					},
					search_style: [], //状态【'欠费', '优惠'】
					search_msg: '', //单项搜索输入信息
					placeHolder: '输入学员姓名', //placeholder提示
					condition: ['学员', '报名人', '报名课程', '开始时间', '结束时间'], //单项搜索选项
				}, //搜索数据
				//弹出dialog
				dialogShow: {
					adSearch: false, //高级搜索
					sorts: false, //选择展示列
					create: false,
				},
				//table渲染
				tableRender: {
					isIndeterminate: true, //展示内容中全选按钮的状态
					checkAll: true,
					checkList: ['报名课程', '缴费金额', '欠款金额', '优惠金额', '账户余额', '课时数', '课程类型', '单价', '创建时间'], //选择展示选项
					tableData_type: ['报名学员', '报名人', '报名课程', '缴费金额', '课时数', '课程类型', '单价', '创建时间'], //默认展示选项
					tableData_allType: ['报名学员', '报名人', '报名课程', '缴费金额', '欠款金额', '优惠金额', '账户余额', '课时数', '课程类型', '单价', '创建时间'], //所有展示选项
					currentPage: 1,
					pageSize: 20,
					pageIndex: 1,
					totalItemCount: 0,
					totalPageCount: 0,
					tableHeight: 0,
					paymentNumber: 0,
					loading: false,
				},
				// table展示数据
				tableData: [],
				bill: {
					Arrears: 0,
					Discount: 0,
					payMoney: 0,
				},
			}
		},
		created: function() {
			if(localStorage.enrollSorts) {
				this.tableRender.tableData_type = JSON.parse(localStorage.enrollSorts);
			};
			this.tableRender.tableHeight = document.documentElement.clientHeight - 220;;
			this.refresh();
		},

		methods: {
			//获取报名数据
			refresh: function() {
				this.tableRender.loading = true;
				let stuName = this.search.search_stu;
				let createName = this.search.create_name;
				let lessonName = this.search.lesson_name;
				let stuStyle = JSON.parse(JSON.stringify(this.search.search_style));
				let startTim = typeof(this.search.time_start) == 'object' ? JSON.stringify(this.search.time_start).substring(1, 11) : this.search.time_start;
				let endTim = typeof(this.search.time_end) == 'object' ? JSON.stringify(this.search.time_end).substring(1, 11) : this.search.time_end;
				for(var i = 0; i < stuStyle.length; i++) {
					switch(stuStyle[i]) {
						case "欠费":
							stuStyle[i] = "arrears";
							break;
						case "优惠":
							stuStyle[i] = "discount";
							break;
						default:
							break;
					}
				};
				var pageSize = this.tableRender.pageSize;
				var pageIndex = this.tableRender.pageIndex;
				var userData = JSON.parse(localStorage.userData);
				var org_id = userData.org_id ? userData.org_id : userData[0].org_id;;
				var account_id = userData.id ? userData.id : userData[0].id;
				var access_token = localStorage.access_token;
				var data = {
					pagesize: pageSize,
					pageindex: pageIndex,
					org_id: org_id,
					account_id: account_id,
					student_name: stuName,
					enroll_start: startTim,
					enroll_end: endTim,
					state: stuStyle,
					lesson_name: lessonName,
					create_name: createName,
				};
				this.$http.get('api/work/GetEnrollList', {
					params: {
						data: JSON.stringify(data)
					},
					headers: {
						'Authorization': 'Bearer ' + (access_token ? access_token : '')
					}
				}).then((response) => {
					//console.log(response);
					this.tableData = [];
					var totalItemCount = response.data.totalItemCount;
					var totalPageCount = response.data.totalPageCount;
					this.tableRender.totalItemCount = totalItemCount;
					this.tableRender.totalPageCount = totalPageCount;
					this.tableRender.paymentNumber = response.data.paymentNumber;
					this.bill.Arrears = response.data.arrearsNumber;
					this.bill.payMoney = response.data.paymentNumber;
					var items = response.data.items;
					for(var i = 0; i < items.length; i++) {
						var cache = {};

						cache['报名学员'] = items[i].stu_name;
						cache['报名人'] = items[i].create_name;
						cache['报名课程'] = items[i].lesson_name;
						cache['缴费金额'] = "￥" + (items[i].payment ? items[i].payment : 0);
						cache['欠款金额'] = "￥" + (items[i].arrears ? items[i].arrears : 0);
						cache['优惠金额'] = "￥" + (items[i].discount ? items[i].discount : 0);
						cache['账户余额'] = "￥" + (items[i].balance ? items[i].balance : 0);
						cache['课时数'] = items[i].lesson_number;
						cache['课程类型'] = items[i].lesson_type == 1 ? "课时" : "课时包";
						cache['单价'] = "￥" + (items[i].lesson_price ? items[i].lesson_price : 0);
						cache['创建时间'] = items[i].create_time.substring(0, 10) + "/" + items[i].create_time.substring(11, 16);
						this.tableData.push(cache);
					}
					this.tableRender.loading = false;
				}).catch((res) => {
					this.tableRender.loading = false;
					console.log(res);
					if(res.response && res.response.data.message == "已拒绝为此请求授权。"){
						this.$root.eventHub.$emit('loginOut');
					};
					this.$message({
						showClose: true,
						message: (res.response && res.response.data.message)? res.response.data.message : '数据读取失败',
						type: 'error'
					});
				});
			},
			//修改每页展示多少条
			handleSizeChange(val) {
				this.tableRender.pageSize = val;
				var pageSize = this.tableRender.pageSize;
				this.refresh();
			},
			//修改页码
			handleCurrentChange(val) {
				this.tableRender.pageIndex = val;
				var pageSize = this.tableRender.pageSize;
				this.refresh();
			},
			//根据条件查询数据
			searchData: function(num) {
				let _this = this;
				let searchMsg = this.search.search_msg;
				this.search.search_stu = '';
				this.search.create_name = '';
				this.search.lesson_name = '';
				this.search.search_dean = '';
				this.search.time_start = '';
				this.search.time_end = '';
				if(searchMsg.length > 0) {
					_this.search.search_style = [];
					let slc = _this.search.state_slc;
					switch(slc) {
						case '学员':
							_this.search.search_stu = searchMsg;
							break;
						case '报名人':
							_this.search.create_name = searchMsg;
							break;
						case '报名课程':
							_this.search.lesson_name = searchMsg;
							break;
						case '开始时间':
							_this.search.time_start = searchMsg;
							break;
						case '结束时间':
							_this.search.time_end = searchMsg;
							break;
						default:
							break;
					}
				} else if(searchMsg.length == 0 && num == 0) {
					this.search.search_stu = '';
					this.search.search_sales = '';
					this.search.time_end = '';
					this.search.time_start = '';
				} else {
					this.resetForm()
				}
				this.refresh();
			},
			//重置搜索条件
			resetForm: function() {
				this.search.search_stu = '';
				this.search.search_sales = '';
				this.search.time_end = '';
				this.search.time_start = '';
				this.search.search_style = [];
			},
			// 选择搜索选项
			searchOption: function() {
				this.search.search_msg = '';
				if(this.search.state_slc == "学员" || this.search.state_slc == "报名人") {
					this.search.placeHolder = '输入' + this.search.state_slc + '姓名'
				} else if(this.search.state_slc == "报名课程") {
					this.search.placeHolder = '输入' + this.search.state_slc
				} else {
					this.search.placeHolder = '输入' + this.search.state_slc + "（如:2017-06-04）"
				}
			},
			//全选展示内容操作
			checkAllSorts: function(event) {
				this.tableRender.tableData_type = event.target.checked ? this.tableRender.tableData_allType : ['报名学员', '报名人'];
				this.tableRender.isIndeterminate = false;
				this.checkSort(this.tableRender.tableData_type)
			}, //全选
			//选择table展示类，展示类改变后将存储
			checkSort: function(value) {
				let checkedCount = value.length;
				this.tableRender.checkAll = checkedCount === this.tableRender.tableData_allType.length;
				this.tableRender.isIndeterminate = checkedCount > 0 && checkedCount < this.tableRender.tableData_allType.length;
				let list = JSON.stringify(this.tableRender.tableData_type);
				localStorage.setItem("enrollSorts", list)
			}, //选择table展示类，展示类改变后将存储
			//导出当前表格数据
			automateExcel(){
				automateExcel(this.tableData,this.tableRender.tableData_type,this.pageTitle);
			},
		}
	}
</script>

<style>
	h3 {
		color: #434A54;
	}

	.block {
		margin-top: 1em;
	}

	.bill {
		margin-top: 1em;
		margin-right: 1em;
	}

	.close_event {
		position: absolute;
		top: 1.6em;
		right: 1.6em;
	}
	/*操作按钮组*/

	.close_event {
		position: absolute;
		top: 1.6em;
		right: 1.6em;
	}

	.operationGroup {
		height: 2.4em;
		padding: 0.4em 1em;
		line-height: 1.6em;
		border-top: 1px solid #dfe6ec;
		background: #f4f4f4;
	}

	.getExlBtn {}

	.sorts>label.el-checkbox {
		min-width: 5em;
		margin-top: 0.5em;
	}

	.sorts>label.el-checkbox:first-child {
		margin-left: 1em;
	}

	.otg_ul {
		list-style: none;
	}

	.otg_ul>li {
		display: inline-flex;
		padding: 0px 1em;
		line-height: 1em;
		border-left: 1px solid #dfe6ec;
		color: #8492A6;
		cursor: pointer;
		transition: color .1s ease-in;
	}

	.otg_ul>li:hover {
		color: #475669;
	}
	/*search样式*/

	.search-bg {
		width: 30%;
		min-width: 360px;
		max-width: 420px;
		margin-right: 2em;
		position: absolute;
		left: 40%;
		top: 54px;
	}

	.search-bg .search_outer {
		width: 100%;
	}

	ul.search_state {
		width: 100%;
		margin-bottom: 0px
	}

	ul.search_state>li {
		cursor: pointer;
		color: #8492A6;
		font-size: 0.9em;
		margin: 0 0.1em;
		transition: color .1s ease-in;
	}

	ul.search_state>li:hover {
		color: #475669;
	}

	.search_btn:focus,
	.search_btn:hover {
		background-color: #e8f3fe !important;
	}

	.search-bg .search_outer .el-input-group__prepend {
		width: 7.5em;
	}

	.search-bg>.el-row>.el-col>a {
		cursor: pointer;
	}
</style>

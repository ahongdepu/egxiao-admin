<template>
	<div class="">
		<h3 class="pull-left">{{ pageTitle }}</h3>
		<div class="pull-right search-bg" v-on:keydown.enter="searchData()">
			<ul class="search_state list-inline text-center text-nowrap">
				<li class="text-right text-nowrap" v-for="sta in search.search_state_before" :key="sta" @click="search.search_msg='';search.search_state = [sta];searchData(0)">
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
		<div class="operationGroup block-full-width text-right">
			<ul class="otg_ul">
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
				<li @click="AutomateExcel">导出
					<a id="dlink" style="display:none;"></a>
				</li>
			</ul>
		</div>
		<el-table ref="el_table_remeber" :data="tableData" style="width: 100%" :height="tableRender.tableHeight" border class="table table-responsive" v-loading.body="tableRender.loading">
			<!--<el-table-column type="selection" fixed></el-table-column>-->
			<el-table-column type="index" width="70"></el-table-column>
			<el-table-column v-for="type in tableRender.tableData_type" :prop="type" :key="type.text" :label="type" sortable  :render-header="tableHeader"></el-table-column>
		</el-table>
		<div class="block pull-left">
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="tableRender.currentPage" :page-sizes="[10, 20, 30, 50]" :page-size="tableRender.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="tableRender.totalItemCount">
			</el-pagination>
		</div>
		<div class="bill pull-right">
			<p>课时合计： <i class="small">{{ bill.lessonNumber }}</i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;消耗金额(当前页)：<i class="small"> {{ bill.allMoney }}</i></p>
		</div>
		<el-dialog title="高级搜索" :visible.sync="dialogShow.adSearch" size="tiny" :show-close=false>
			<div class="el-dialog__headerbtn" @click="dialogShow.adSearch = false;">
				<i class="el-dialog__close el-icon el-icon-close close_event"></i>
			</div>
			<el-form :model="search" label-width="100px" ref="ruleForm" @keydown.enter="dialogShow.adSearch = false;refresh()">
				<el-form-item label="学员姓名">
					<el-input v-model="search.search_stu"></el-input>
				</el-form-item>
				<el-form-item label="上课老师">
					<el-input v-model="search.teacher_name"></el-input>
				</el-form-item>
				<el-form-item label="课程名称">
					<el-input v-model="search.lesson_name"></el-input>
				</el-form-item>
				<el-form-item label="科目名称">
					<el-input v-model="search.subject_name"></el-input>
				</el-form-item>
				<el-form-item label="开始时间">
					<el-date-picker v-model="search.time_start" type="date" placeholder="选择日期" :picker-options="search.pickerOptions"></el-date-picker>
				</el-form-item>
				<el-form-item label="结束时间">
					<el-date-picker v-model="search.time_end" type="date" placeholder="选择日期" :picker-options="search.pickerOptions"></el-date-picker>
				</el-form-item>
				<el-form-item label="课程状态">
					<el-checkbox-group v-model="search.search_state">
						<el-checkbox v-for="sta in search.search_state_before" :label="sta" :key="sta"></el-checkbox>
					</el-checkbox-group>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="dialogShow.adSearch = false;refresh()">立即搜索</el-button>
					<el-button @click="resetForm">重置</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
		<el-dialog title="选择展示" :visible.sync="dialogShow.sorts" :show-close=false>
			<div class="el-dialog__headerbtn" @click="dialogShow.sorts = false;">
				<i class="el-dialog__close el-icon el-icon-close close_event"></i>
			</div>
			<el-checkbox :indeterminate="allSorts.isIndeterminate" v-model="allSorts.checkAll" @change="checkAllSorts">全选</el-checkbox>
			<a class="resetSorts" @click="tableRender.tableData_type= ['学员','创建时间','课程','课时数','课程类型','上课方式','上课时间','消耗金额','学员状态','上课老师'];checkSort(tableRender.tableData_type)">重置</a>
			<el-checkbox-group v-model="tableRender.tableData_type" class="sorts" @change="checkSort">
				<el-checkbox label="学员" disabled></el-checkbox>
				<el-checkbox v-for="sta in allSorts.checkList" :label="sta" :key="sta"></el-checkbox>
			</el-checkbox-group>
		</el-dialog>
	</div>
</template>

<script>
	import {automateExcel} from '@/util/util.js';
	export default {
		data() {
			return {
				pageTitle: "记上课",
				//搜索数据
				search: {
					search_state_before: ['上课', '旷课', '补课', '请假不扣课', '请假扣课'],
					search_state: [], //状态【'上课', '旷课', '补课', '请假不扣课', '请假扣课'】
					state_slc: '学员', //选中的单项搜索条件
					search_stu: '', //学生姓名
					teacher_name: '', //上课老师姓名
					lesson_name: '', //课程
					subject_name: '', //科目名称
					time_start: '',
					time_end: '',
					pickerOptions: {
						disabledDate(time) {
							return time.getTime() > Date.now();
						}
					},
					search_msg: '', //单项搜索输入信息
					placeHolder: '输入学员姓名', //placeholder提示
					condition: ['学员', '上课老师', '课程', '科目', '开始时间', '结束时间'], //单项搜索选项
				},
				dialogShow: {
					adSearch: false, //高级搜索
					sorts: false, //选择展示列
					create: false,
				}, //弹出dialog
				allSorts: {
					isIndeterminate: true, //展示内容中全选按钮的状态
					checkAll: true,
					checkList: ['创建时间', '课程', '科目', '课时数', '课程类型', '上课方式', '上课时间', '消耗金额', '优惠', '是否使用', '学员状态', '上课老师', '说明', '课时价格', ], //选择展示选项
				}, //选择table展示内容
				tableRender:{
					tableHeight: 0,
					tableData_type: ['学员', '创建时间', '课程', '课时数', '课程类型', '上课方式', '上课时间', '消耗金额', '学员状态', '上课老师'], //默认展示选项
					tableData_allType: ['学员', '创建时间', '课程', '科目', '课时数', '课程类型', '上课方式', '上课时间', '消耗金额', '优惠', '是否使用', '学员状态', '上课老师', '说明', '课时价格', ], //所有展示选项
					currentPage: 1,
					pageSize: 20,
					pageIndex: 1,
					totalItemCount: 0,
					totalPageCount: 0,
					loading: false,
				},
				tableData: [],
				bill: {
					lessonNumber: 0,
					allMoney: 0,
				},
			}
		},
		created: function() {
			global._this = this;
			if(localStorage.remeberCourceSorts) {
				this.tableRender.tableData_type = JSON.parse(localStorage.remeberCourceSorts);
			};
			this.tableRender.tableHeight = document.documentElement.clientHeight - 220;
			this.refresh();
		},
		methods: {
			tableHeader(h, {column,$index}) {
				let widthList = ['学员', '创建时间', '课程', '科目', '课时数', '课程类型', "上课方式", "上课时间", "消耗金额", "优惠", "是否使用",'学员状态', '上课老师', '说明', '课时价格'];
				let sameDataList = [];
				let w = _this.$refs.el_table_remeber.$el.offsetWidth;
				let ow;
				let item  = widthList.concat(_this.tableRender.tableData_type);
				item.sort();
				let svgWidth = 0;
				let state = true;
				let fixWidth = 0;//显示table-header的宽度
				let addWidth = function(item) {
					switch(item) {
						case '学员':
							return 90;
							break;
						case '创建时间':
							return 150;
							break;
						case '课程':
							return 140;
							break;
						case '科目':
							return 100;
							break;
						case '课时数':
							return 80;
							break;
						case '课时数':
							return 80;
							break;
						case '课程类型':
							return 90;
							break;
						case '上课方式':
							return 80;
							break;
						case '上课时间':
							return 150;
							break;
						case '消耗金额':
							return 100;
							break;
						case '优惠':
							return 80;
							break;
						case '是否使用':
							return 80;
							break;
						case '学员状态':
							return 100;
							break;
						case '上课老师':
							return 90;
							break;
						case '说明':
							return 200;
							break;
						case '课时价格':
							return 80;
							break;
						default:
						return 0;
							break;
					}
				};
				for(var i = 0; i < item.length; i++) {
					let table_typeStr = widthList.toString();
					if(item[i] == item[i - 1] && sameDataList[sameDataList.length - 1] != item[i]) {
						sameDataList.push(item[i]);
						if(state && table_typeStr.indexOf(item[i]) == -1) {
							state = false;
						}
					}
				};
				for(var i = 0; i < _this.tableRender.tableData_type.length; i++) {
					fixWidth += addWidth(_this.tableRender.tableData_type[i]);
				};
				if(state) {
					svgWidth = function(){
						if(w > fixWidth){
							return (w-fixWidth)/_this.tableRender.tableData_type.length
						}else{
							return 0
						}
					}();
				}else{
					svgWidth = 0
				};
				switch(column.label) {
						case '学员':
							column.width = 90 + svgWidth;
							break;
						case '创建时间':
							column.width = 150 + svgWidth
							break;
						case '课程':
							column.width = 140 + svgWidth
							break;
						case '科目':
							column.width = 100 + svgWidth
							break;
						case '课时数':
							column.width = 80 + svgWidth;
							break;
						case '课时数':
							column.width = 80 + svgWidth;
							break;
						case '课程类型':
							column.width = 90 + svgWidth;
							break;
						case '上课方式':
							column.width = 80 + svgWidth;
							break;
						case '上课时间':
							column.width = 150 + svgWidth;
							break;
						case '消耗金额':
							column.width = 100 + svgWidth;
							break;
						case '优惠':
							column.width = 80 + svgWidth;
							break;
						case '是否使用':
							column.width = 80 + svgWidth;
							break;
						case '学员状态':
							column.width = 100 + svgWidth;
							break;
						case '上课老师':
							column.width = 90 + svgWidth;
							break;
						case '说明':
							column.width = 200 + svgWidth;
							break;
						case '课时价格':
							column.width = 80 + svgWidth;
							break;
						default:
						ow = parseInt((w - fixWidth) / (_this.tableRender.tableData_type.length - sameDataList.length));
						console.log(ow)
						column.width = ow > 80 ? ow : 80;
						break;
							break;
				}
				//return h('div', {style: "float:left"}, [column.label, h('text', {style: ""}, '')])
				return column.label;
				//console.log(column)
			},
			refresh: function() {
				this.tableRender.loading = true;
				let stuName = this.search.search_stu;
				let teacherName = this.search.teacher_name;
				let lessonName = this.search.lesson_name;
				let subjectName = this.search.subject_name;
				let startTim = typeof(this.search.time_start) == 'object' ? JSON.stringify(this.search.time_start).substring(1, 11) : this.search.time_start;
				let endTim = typeof(this.search.time_end) == 'object' ? JSON.stringify(this.search.time_end).substring(1, 11) : this.search.time_end;
				let corState = JSON.parse(JSON.stringify(this.search.search_state));
				for(var i = 0; i < corState.length; i++) {
					switch(corState[i]) {
						case "上课":
							corState[i] = "noleState0001";
							break;
						case "旷课":
							corState[i] = "noleState0002";
							break;
						case "补课":
							corState[i] = "noleState0003";
							break;
						case "请假不扣课":
							corState[i] = "noleState0004";
							break;
						case "请假扣课":
							corState[i] = "noleState0005";
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
					teacher_name: teacherName,
					lesson_name: lessonName,
					subject_name: subjectName,
					state: corState,
					notelesson_start: startTim,
					notelesson_end: endTim,
				};
				//console.log(data)
				this.$http.get('api/work/GetNoteLesson', {
					params: {
						data: JSON.stringify(data)
					},
					headers: {
						'Authorization': 'Bearer ' + (access_token ? access_token : '')
					}
				}).then((response) => {
					//console.log(response);
					this.tableData = [];
					this.bill.lessonNumber = response.data.lessonNumber;
					var totalItemCount = response.data.totalItemCount;
					var totalPageCount = response.data.totalPageCount;
					this.tableRender.totalItemCount = totalItemCount;
					this.tableRender.totalPageCount = totalPageCount;
					var items = response.data.items;
					for(var i = 0; i < items.length; i++) {
						if(i == 0) {
							_this.bill.allMoney = items[0].noteLesson.moeny
						} else {
							_this.bill.allMoney += items[i].noteLesson.moeny;
						}
						switch(items[i].noteLesson.state) {
							case 'noleState0001':
								items[i].noteLesson.state = "上课";
								break;
							case 'noleState0002':
								items[i].noteLesson.state = "旷课";
								break;
							case 'noleState0003':
								items[i].noteLesson.state = "补课";
								break;
							case 'noleState0004':
								items[i].noteLesson.state = "请假不扣课";
								break;
							case 'noleState0005':
								items[i].noteLesson.state = "请假扣课";
								break;
							default:
								items[i].noteLesson.state = "未记录状态"
								break
						}

						var cache = {};
						cache['学员'] = items[i].noteLesson.student_name;
						cache['创建时间'] = items[i].noteLesson.create_time.substring(0, 10) + " " + items[i].noteLesson.create_time.substring(11, 16);
						cache['课程'] = items[i].noteLesson.lesson_name;
						cache['科目'] = items[i].noteLesson.subject_name;
						cache['课时数'] = items[i].noteLesson.lesson_num;
						cache['课程类型'] = items[i].noteLesson.lesson_type == 1 ? "课时" : "课时包";
						cache['上课方式'] = items[i].noteLesson.style == 1 ? "正式" : "试听";
						cache['上课时间'] = items[i].noteLesson.lesson_time.substring(0, 10) + " " + items[i].noteLesson.lesson_time.substring(11, 16);
						cache['消耗金额'] = "￥" + items[i].noteLesson.moeny;
						cache['是否使用'] = items[i].noteLesson.enable_flag == 0 ? "删除" : "使用";
						cache['学员状态'] = items[i].noteLesson.state;
						cache['上课老师'] = items[i].noteLesson.teacher_name;
						cache['说明'] = items[i].noteLesson.description ? items[i].noteLesson.description : '';
						cache['课时价格'] = items[i].lesson_price ? ("￥" + items[i].lesson_price) : '';
						cache['优惠'] = "￥" + items[i].noteLesson.cash_coupon;
						//						cache['修改人'] = items[i].noteLesson.update_by?items[i].noteLesson.update_by:'';
						//						cache['修改时间'] = items[i].noteLesson.update_time?items[i].noteLesson.update_time:'';
						_this.tableData.push(cache);
					};
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
			handleSizeChange(val) {
				this.tableRender.pageSize = val;
				var pageSize = this.tableRender.pageSize;
				this.refresh();
			},
			handleCurrentChange(val) {
				this.tableRender.pageIndex = val;
				this.refresh();
			},
			searchData: function(num) {
				let searchMsg = this.search.search_msg;
				this.search.search_stu = '';
				this.search.teacher_name = '';
				this.search.lesson_name = '';
				this.search.subject_name = '';
				this.search.time_start = '';
				this.search.time_end = '';
				if(searchMsg.length > 0) {
					let slc = _this.search.state_slc;
					switch(slc) {
						case '学员':
							_this.search.search_stu = searchMsg;
							break;
						case '上课老师':
							_this.search.teacher_name = searchMsg;
							break;
						case '课程':
							_this.search.lesson_name = searchMsg;
							break;
						case '科目':
							_this.search.subject_name = searchMsg;
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
					_this.search.search_stu = '';
					_this.search.teacher_name = '';
					_this.search.lesson_name = '';
					_this.search.subject_name = '';
					_this.search.time_start = '';
					_this.search.time_end = '';
				} else {
					_this.resetForm()
				};
				this.refresh();
			},
			resetForm: function() {
				this.search.search_stu = '';
				this.search.teacher_name = '';
				this.search.lesson_name = '';
				this.search.subject_name = '';
				this.search.time_start = '';
				this.search.time_end = '';
			},
			searchOption: function() {
				this.search.search_msg = '';
				if(this.search.state_slc == "学员" || this.search.state_slc == "上课老师") {
					this.search.placeHolder = '输入' + this.search.state_slc + '姓名'
				} else if(this.search.state_slc == "课程" || this.search.state_slc == "科目") {
					this.search.placeHolder = '输入' + this.search.state_slc + '名称'
				} else {
					this.search.placeHolder = '输入' + this.search.state_slc + "（如:2017-06-04）"
				}
			},
			checkAllSorts: function(event) {
				this.tableRender.tableData_type = event.target.checked ? this.tableRender.tableData_allType : ['学员'];
				this.allSorts.isIndeterminate = false;
				this.checkSort(this.tableRender.tableData_type)
			}, //全选
			checkSort: function(value) {
				let checkedCount = value.length;
				this.allSorts.checkAll = checkedCount === this.tableRender.tableData_allType.length;
				this.allSorts.isIndeterminate = checkedCount > 0 && checkedCount < this.tableRender.tableData_allType.length;
				let list = JSON.stringify(this.tableRender.tableData_type);
				localStorage.setItem("remeberCourceSorts", list)
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
	.bill {
		margin-right: 1em;
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

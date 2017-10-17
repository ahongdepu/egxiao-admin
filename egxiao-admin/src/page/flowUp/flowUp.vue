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
		<el-table ref="el_table_flow" :data="tableData" style="width: 100%" :height="tableRender.tableHeight" border v-loading.body="loading">
			<!--<el-table-column type="selection" fixed></el-table-column>-->

			<el-table-column v-for="type in tableRender.tableData_type" :key="type.text" :prop="type" :label="type" sortable :render-header="tableHeader"></el-table-column>
		</el-table>
		<!-- 页码跳转 -->
		<div class="block">
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="tableRender.currentPage" :page-sizes="[20, 30, 50, 100]" :page-size="tableRender.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="tableRender.totalItemCount">
			</el-pagination>
		</div>
		<!-- 高级搜索弹出模态框 -->
		<el-dialog title="高级搜索" :visible.sync="dialogShow.adSearch" size="tiny" :show-close=false>
			<div class="el-dialog__headerbtn" @click="dialogShow.adSearch = false;">
				<i class="el-dialog__close el-icon el-icon-close close_event"></i>
			</div>
			<el-form :model="search" label-width="100px" ref="ruleForm" @keydown.enter="dialogShow.adSearch = false;refresh()">
				<el-form-item label="学员姓名">
					<el-input v-model="search.search_stu"></el-input>
				</el-form-item>
				<el-form-item label="跟进人名称">
					<el-input v-model="search.search_sales"></el-input>
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
			<a class="resetSorts" @click="tableRender.tableData_type= ['跟进学员', '跟进人', '跟进方式', '跟进内容', '跟进时间', '下次跟进'];checkSort(tableRender.tableData_type)">重置</a>
			<el-checkbox-group v-model="tableRender.tableData_type" class="sorts" @change="checkSort">
				<el-checkbox label="跟进学员" disabled></el-checkbox>
				<el-checkbox label="跟进人" disabled></el-checkbox>
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
				// 搜索选项
				search: {
					search_style_before: ['打电话', '到访', '发短信', '微信', '脚印'],
					search_style: [], //状态【发短信、面谈、打电话】
					state_slc: '学员', //选中的单项搜索条件
					state_toggle: 0, //搜索方式（单项搜索、复合条件搜索）
					search_stu: '', //学生姓名
					search_sales: '', //跟进人
					time_start: '',
					time_end: '',
					pickerOptions: {
						disabledDate(time) {
							return time.getTime() > Date.now();
						}
					},
					search_msg: '', //单项搜索输入信息
					placeHolder: '输入学员姓名', //placeholder提示
					condition: ['学员', '跟进人', '开始时间', '结束时间'],
				}, //搜索数据
				//功能模态弹框隐藏与显示
				dialogShow: {
					adSearch: false, //高级搜索
					sorts: false, //选择展示列
					create: false,
				}, //弹出dialog
				pageTitle: "跟进",
				//表格渲染
				tableRender:{
					isIndeterminate: true, //展示内容中全选按钮的状态
					tableHeight: 0,
					checkAll: true,
					checkList: ['跟进方式', '跟进内容', '跟进时间', '下次跟进',  '咨询师', '教务老师'],
					tableData_type: ['跟进学员', '跟进人', '跟进方式', '跟进内容', '跟进时间', '下次跟进'],
					tableData_allType: ['跟进学员', '跟进人', '跟进方式', '跟进内容', '跟进时间', '下次跟进',  '咨询师', '教务老师'],
					currentPage: 1,
					pageSize: 30,
					pageIndex: 1,
					totalItemCount: 0,
					totalPageCount: 0,
				},
				tableData: [],
				loading: false,
			}
		},
		created: function() {
			global._this = this;
			if(localStorage.flowSorts) {
				this.tableRender.tableData_type = JSON.parse(localStorage.flowSorts);
			};
			this.tableRender.tableHeight = document.documentElement.clientHeight - 220;;
			this.refresh();
		},
		methods: {
			//表格头部的渲染 -- 根据内容改变他的长度
			tableHeader(h, {column,$index}) {
				let widthList = ['跟进学员', '跟进人', '跟进方式', '跟进内容', '跟进时间', '下次跟进',  '咨询师', '教务老师'];
				let sameDataList = [];
				let w = _this.$refs.el_table_flow.$el.offsetWidth;
				let ow;
				let item  = widthList.concat(_this.tableRender.tableData_type);
				item.sort();
				let svgWidth = 0;
				let state = true;
				let fixWidth = 0;//显示table-header的宽度
				let addWidth = function(item) {
					switch(item) {
						case '跟进学员':
							return 90;
							break;
						case '跟进人':
							return 90;
							break;
						case '跟进方式':
							return 90;
							break;
						case '跟进内容':
							return 250;
							break;
						case '跟进时间':
							return 100;
							break;
						case '下次跟进':
							return 100;
							break;
						case '咨询师':
							return 90;
							break;
						case '教务老师':
							return 90;
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
					case '跟进学员':
						column.width = 90 + svgWidth;
						break;
					case '跟进人':
						column.width = 90 + svgWidth;
						break;
					case '跟进方式':
						column.width = 90 + svgWidth;
						break;
					case '跟进内容':
						column.width = 250 + svgWidth;
						break;
					case '跟进时间':
						column.width = 100 + svgWidth;
						break;
					case '下次跟进':
						column.width = 100 + svgWidth;
						break;
					case '咨询师':
						column.width = 90 + svgWidth;
						break;
					case '教务老师':
						column.width = 90 + svgWidth;
						break;
					default:
						ow = parseInt((w - fixWidth) / (_this.tableRender.tableData_type.length - sameDataList.length));
						column.width = ow > 80 ? ow : 80;
						//console.log(_this.$refs.el_table);
						break;
				};
				//return h('div', {style: "float:left"}, [column.label, h('text', {style: ""}, '')])
				return column.label;
			},
			//获取跟进数据
			refresh: function() {
				this.loading = true;
				let _this = this;
				let stuName = this.search.search_stu;
				let salesName = this.search.search_sales;
				let stuStyle = JSON.parse(JSON.stringify(this.search.search_style));
				let startTim = typeof(this.search.time_start) == 'object' ? JSON.stringify(this.search.time_start).substring(1, 11) : this.search.time_start;
				let endTim = typeof(this.search.time_end) == 'object' ? JSON.stringify(this.search.time_end).substring(1, 11) : this.search.time_end;
				for(var i = 0; i < stuStyle.length; i++) {
					switch(stuStyle[i]) {
						case "脚印":
							stuStyle[i] = "talkStyle0005";
							break;
						case "微信":
							stuStyle[i] = "talkStyle0004";
							break;
						case "发短信":
							stuStyle[i] = "talkStyle0003";
							break;
						case "到访":
							stuStyle[i] = "talkStyle0002";
							break;
						case "打电话":
							stuStyle[i] = "talkStyle0001";
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
					record_style: stuStyle,
					record_start: startTim,
					record_end: endTim,
					create_name: salesName,
				};
				this.$http.get('api/work/GetRecordList', {
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
					var items = response.data.items;
					for(var i = 0; i < items.length; i++) {
						var record = items[i].record;
						var student = items[i].student || {};
						let stuState = record.state;
						switch(record.style) {
							case "talkStyle0001":
								record.style = "打电话";
								break;
							case "talkStyle0002":
								record.style = "到访";
								break;
							case "talkStyle0003":
								record.style = "发短信";
								break;
							case "talkStyle0004":
								record.style = "微信";
								break;
							case "talkStyle0005":
								record.style = "脚印";
								break;
							default:
								record.style = "其他";
						};
						//跟进数据
						var cache = {};
						//						cache.create_by = record.create_by;
						cache['跟进学员'] = record.student_name;
						cache['跟进人'] = record.create_name;
						//						cache['状态'] = record.state;
						cache['跟进方式'] = record.style;
						cache['跟进内容'] = record.r_content;
						cache['跟进时间'] = record.create_time ? record.create_time.substring(0, 10) + " " + record.create_time.substring(11, 16) : "无";
						cache['下次跟进'] = record.next_time ? record.next_time.substring(0, 10) + " " + record.next_time.substring(11, 16) : "无计划";
						cache['咨询师'] = student.sales_name || '';
						cache['教务老师'] = student.dean_name;
						this.tableData.push(cache);
					};
					this.loading = false;
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
				this.search.search_sales = '';
				this.search.search_dean = '';
				if(searchMsg.length > 0) {
					let slc = _this.search.state_slc;
					switch(slc) {
						case '学员':
							_this.search.search_stu = searchMsg;
							break;
						case '跟进人':
							_this.search.search_sales = searchMsg;
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
				}else if(searchMsg.length == 0 && num == 0){
					this.search.search_stu = '';
					this.search.search_sales = '';
					this.search.time_end = '';
					this.search.time_start = '';
				}else{
					this.resetForm()
				};
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
				if(this.search.state_slc == "学员" || this.search.state_slc == "跟进人") {
					this.search.search_msg = '';
					this.search.placeHolder = '输入' + this.search.state_slc + '姓名'
				} else {
					this.search.placeHolder = '输入' + this.search.state_slc + "（如:2017-06-04）"
				}
			},
			//全选展示内容操作
			checkAllSorts: function(event) {
				this.tableRender.tableData_type = event.target.checked ? this.tableRender.tableData_allType : ['跟进学员', '跟进人'];
				this.tableRender.isIndeterminate = false;
				this.checkSort(this.tableRender.tableData_type)
			},
			//选择table展示类，展示类改变后将存储
			checkSort: function(value) {
				let checkedCount = value.length;
				this.tableRender.checkAll = checkedCount === this.tableRender.tableData_allType.length;
				this.tableRender.isIndeterminate = checkedCount > 0 && checkedCount < this.tableRender.tableData_allType.length;
				let list = JSON.stringify(this.tableRender.tableData_type);
				localStorage.setItem("flowSorts", list)
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

	.search-bg .search_outer {
		margin-bottom: 0.5em;
		width: 100%;
	}

	.search_style {
		max-width: 50%;
	}

	.search_style a {
		padding-left: 1em;
		white-space: nowrap;
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

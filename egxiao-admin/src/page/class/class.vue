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
				<li @click="dialogShow.adSearch = true"><span class="fa fa-filter"></span>&nbsp;高级筛查</li>
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
		<el-table :data="tableData.tableData_main" ref="el_table_class" :height="tableHeight" @row-click="listDetail" style="width: 100%" border class="table table-responsive" v-loading.body="tableRender.loading">
			<!--<el-table-column type="selection" fixed></el-table-column>-->
			<el-table-column v-for="type in tableRender.tableData_type" :prop="type" :key="type.text" :label="type" sortable :render-header="tableHeader"></el-table-column>
		</el-table>
		<!-- 页码跳转 -->
		<div class="block">
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="tableRender.currentPage" :page-sizes="[10, 20, 30, 50]" :page-size="tableRender.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="tableRender.totalItemCount">
			</el-pagination>
		</div>
		<!-- 高级搜索弹出模态框 -->
		<el-dialog title="高级搜索" :visible.sync="dialogShow.adSearch" size="tiny" :show-close=false>
			<div class="el-dialog__headerbtn" @click="dialogShow.adSearch = false;">
				<i class="el-dialog__close el-icon el-icon-close close_event"></i>
			</div>
			<el-form :model="search" label-width="100px" ref="ruleForm" @keydown.enter="dialogShow.adSearch = false;refresh()">
				<el-form-item label="班级名称">
					<el-input v-model="search.search_class"></el-input>
				</el-form-item>
				<el-form-item label="班级状态">
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
			<a class="resetSorts" @click="tableRender.tableData_type= ['班级名称', '课程类型', '班级状态', '所属课程', '学员人数', '上课教师', '上课科目', '班级说明'];checkSort(tableRender.tableData_type)">重置</a>
			<el-checkbox-group v-model="tableRender.tableData_type" class="sorts" @change="checkSort">
				<el-checkbox label="班级名称" disabled></el-checkbox>
				<el-checkbox v-for="sta in tableRender.checkList" :label="sta" :key="sta"></el-checkbox>
			</el-checkbox-group>
		</el-dialog>
		<!-- 班级详情 -->
		<div v-if="stu_detail_show" class="stu_detail_bg">
			<div class="stu_detail">
				<div class="close" @click="stu_detail_show = false">
					<span class="el-icon-close"></span>
				</div>
				<h4 class="profile_name">{{ profile.name }}</h4>
				<div class="detail_top">
					<div class="info-line">班级: {{ classDetail["班级名称"] }}</div>
					<div class="info-line">班级状态: {{ classDetail["班级状态"] }} &nbsp;|&nbsp; 学员人数：{{ classDetail["学员人数"] }}</div>
				</div>
				<div class="detail_main">
					<el-tabs v-model="activeName" @tab-click="handleClick($event)">
						<el-tab-pane label="班级信息" name="first" class="block">学员信息</el-tab-pane>
						<el-tab-pane label="班内学员" name="second">班内学员</el-tab-pane>
					</el-tabs>
					<div class="pageContent">
						<div class="scroll-hidden">
							<div v-show="detail_num === 0" class="page-container">
								<div class="info_list" v-for="(val,key) in classDetail">
									<div class="list_key">
										{{ key }}
									</div>
									<div class="list_val">
										{{ val }}
									</div>
								</div>
							</div>
							<div v-show="detail_num === 1" class="page-container">
								<el-collapse class="">
									<el-collapse-item v-for="(stu,key,$index) in classStudents" :title="stu['学生姓名']+' '+stu['上课时间'] " :name="$index" :key="stu['上课时间']">
										<div class="col-xs-6">
											<span class="color-silver">任课老师:</span> {{ stu["任课老师"] }}
										</div>
										<div class="col-xs-6">
											<span class="color-silver">消耗课时:</span> {{ stu["消耗课时"] }}
										</div>
										<div class="col-xs-4">
											<span class="color-silver">总课时数:</span> {{ stu["总课时数"] }}
										</div>
										<div class="col-xs-4">
											<span class="color-silver">总消耗课时:</span> {{ stu["总消耗课时"] }}
										</div>
										<div class="col-xs-4">
											<span class="color-silver">剩余课时:</span> {{ stu["剩余课时"] }}
										</div>
									</el-collapse-item>
								</el-collapse>
							</div>
							<div v-show="detail_num === 2" class="page-container">
								<h3 class="text-center color-silver">无分配学员</h3>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {automateExcel} from '@/util/util.js';
	export default {
		data() {
			return {
				tableHeight: 0,
				pageTitle: "班级",
				search: {
					search_style_before: ['待开课', '已开课', '已结课'],
					state_slc: '班级', //选中的单项搜索条件
					search_class: '', //班级名称
					pickerOptions: {
						disabledDate(time) {
							return time.getTime() > Date.now();
						}
					},
					search_style: [], //状态【待开课:1,已开课:2,已结课:3】
					search_msg: '', //单项搜索输入信息
					placeHolder: '输入班级名称', //placeholder提示
					condition: ['班级'], //单项搜索选项
				}, //搜索数据
				dialogShow: {
					adSearch: false, //高级搜索
					sorts: false, //选择展示列
					create: false,
				}, //弹出dialog
				tableRender: {
					isIndeterminate: true, //展示内容中全选按钮的状态
					checkAll: true,
					checkList: ['课程类型', '班级状态', '所属课程', '学员人数', '上课教师', '上课科目', '班级说明', '修改时间', '上次上课教师', '上次上课科目', '上次上课课时数'], //选择展示选项
					tableData_type: ['班级名称', '课程类型', '班级状态', '所属课程', '学员人数', '上课教师', '上课科目', '班级说明', ],
					tableData_allType: ['班级名称', '课程类型', '班级状态', '所属课程', '学员人数', '上课教师', '上课科目', '班级说明', '修改时间', '上次上课教师', '上次上课科目', '上次上课课时数'],
					currentPage: 1, //现在的页码
					pageSize: 20, //每页数据条数
					pageIndex: 1, //页码
					totalItemCount: 0,
					totalPageCount: 0,
					loading: false, //数据加载缓慢时的过渡
				}, //选择table展示内容
				profile: [], //登陆人信息
				stu_detail_show: false,
				tableData: {
					tableData_id: [], //所有班级的所有的id
					tableData_main: [], //所有班级的所有内容
				}, //班级全部数据
				classDetail: [], //班级详情
				classStudents: [], //班内学员的数据
				classId: 0, //选中的班级的ID
				activeName: "second", //详情导航tab默认第一个
				detail_num: 1, //班级详情中各个选项的展示切换
			}
		},
		created: function() {
			global._this = this;
			if(localStorage.classSorts) {
				this.tableRender.tableData_type = JSON.parse(localStorage.classSorts);
			};
			var userData = JSON.parse(localStorage.userData);
			this.profile.name = userData.name ? userData.name : userData[0].name;
			this.tableHeight = window.screen.availHeight - 285;
			this.refresh();
		},

		methods: {
			//表格头部的渲染 -- 根据内容改变他的长度
			tableHeader(h, {column,$index}) {
				let widthList = _this.tableRender.tableData_allType;
				let sameDataList = [];
				let w = _this.$refs.el_table_class.$el.offsetWidth;
				let ow;
				let item  = widthList.concat(_this.tableRender.tableData_type);
				item.sort();
				let svgWidth = 0;
				let state = true;
				let fixWidth = 0;//显示table-header的宽度
				let addWidth = function(item) {
					switch(item) {
						case '班级名称':
							return 150;
							break;
						case '课程类型':
							return 90;
							break;
						case '班级状态':
							return 90;
							break;
						case '所属课程':
							return 150;
							break;
						case '学员人数':
							return 90;
							break;
						case '上课教师':
							return 90;
							break;
						case '上课科目':
							return 90;
							break;
						case '班级说明':
							return 220;
							break;
						case '修改时间':
							return 150;
							break;
						case '上次上课教师':
							return 90;
							break;
						case '上次上课科目':
							return 90;
							break;
						case '上次上课课时数':
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
					case '班级名称':
						column.width = 150 + svgWidth;
						break;
					case '课程类型':
						column.width = 90 + svgWidth;
						break;
					case '班级状态':
						column.width = 90 + svgWidth;
						break;
					case '所属课程':
						column.width = 150 + svgWidth;
						break;
					case '学员人数':
						column.width = 90 + svgWidth;
						break;
					case '上课教师':
						column.width = 90 + svgWidth;
						break;
					case '上课科目':
						column.width = 90 + svgWidth;
						break;
					case '班级说明':
						column.width = 220 + svgWidth;
						break;
					case '修改时间':
						column.width = 150 + svgWidth;
						break;
					case '上次上课教师':
						column.width = 90 + svgWidth;
						break;
					case '上次上课科目':
						column.width = 90 + svgWidth;
						break;
					case '上次上课课时数':
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
			// 获取表格数据
			refresh: function() {
				this.tableRender.loading = true;
				let _this = this;
				let className = this.search.search_class;
				let classStyle = JSON.parse(JSON.stringify(this.search.search_style));
				for(var i = 0; i < classStyle.length; i++) {
					switch(classStyle[i]) {
						case "待开课":
							classStyle[i] = "1";
							break;
						case "已开课":
							classStyle[i] = "2";
							break;
						case "已结课":
							classStyle[i] = "3";
							break;
						default:
							break;
					}
				};
				var pageSize = this.tableRender.pageSize;
				var pageIndex = this.tableRender.pageIndex;
				var userData = JSON.parse(localStorage.userData);
				var org_id = userData.org_id ? userData.org_id : userData[0].org_id;
				var account_id = userData.id ? userData.id : userData[0].id;
				var access_token = localStorage.access_token;
				var data = {
					pagesize: pageSize,
					pageindex: pageIndex,
					org_id: org_id,
					account_id: account_id,
					class_name: className,
					class_state: classStyle
				};
				this.$http.get('api/work/GetClassList', {
					params: {
						data: JSON.stringify(data)
					},
					headers: {
						'Authorization': 'Bearer ' + (access_token ? access_token : '')
					}
				}).then((response) => {
					_this.tableData.tableData_main = [];
					_this.tableData.tableData_id = [];
					_this.tableRender.totalItemCount = response.data.totalItemCount;
					_this.tableRender.totalPageCount = response.data.totalPageCount;
					let items = response.data.items;
					for(var i = 0; i < items.length; i++) {
						switch(items[i].state) {
							case "0":
								items[i].state = "删除";
								break;
							case "1":
								items[i].state = "待开课";
								break;
							case "2":
								items[i].state = "已开课";
								break;
							case "3":
								items[i].state = "已结课";
								break;
							default:
								break;
						};
						switch(items[i].lesson_type) {
							case '1':
								items[i].lesson_type = '学时制';
								break;
							case '2':
								items[i].lesson_type = '学期制';
								break;
							default:
								break;
						};
						let cache = {};
						let cache_id = {};
						cache["班级名称"] = items[i].name;
						cache["所属课程"] = items[i].lesson_name;
						cache["上课教师"] = items[i].pre_teacher_name ? items[i].pre_teacher_name : '';
						cache["上课科目"] = items[i].pre_subject_name ? items[i].pre_subject_name : '';
						cache["课程类型"] = items[i].lesson_type;
						cache["班级状态"] = items[i].state;
						cache["学员人数"] = items[i].student_num;
						cache["班级说明"] = items[i].description;
						cache["创建时间"] = items[i].create_time ? (items[i].create_time.substring(0, 10) + "/" + items[i].create_time.substring(11, 16)) : '';
						cache["修改时间"] = items[i].update_time ? (items[i].update_time.substring(0, 10) + "/" + items[i].update_time.substring(11, 16)) : '';
						cache["上次上课教师"] = items[i].pre_teacher_name ? items[i].pre_teacher_name : '';
						cache["上次上课科目"] = items[i].pre_subject_name ? items[i].pre_subject_name : '';
						cache["上次上课课时数"] = items[i].pre_lesson_number ? items[i].pre_lesson_number : 0;
						cache.class_id = items[i].id;
						cache_id.org_id = items[i].org_id;
						cache_id.lesson_id = items[i].lesson_id;
						cache_id.class_id = items[i].id;
						cache_id.create_by = items[i].create_by;
						cache_id.pre_subject_id = items[i].pre_subject_id;
						cache_id.pre_teacher_id = items[i].pre_teacher_id;
						cache_id.update_by = items[i].update_by;
						_this.tableData.tableData_main.push(cache);
						_this.tableData.tableData_id.push(cache_id);
					}; //重组表格数据
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
			// 改变每页数据条数
			handleSizeChange(val) {
				this.tableRender.pageSize = val;
				var pageSize = this.tableRender.pageSize;
				this.refresh();
			},
			// 修改页码
			handleCurrentChange(val) {
				this.tableRender.pageIndex = val;
				var pageSize = this.tableRender.pageSize;
				this.refresh();
			},
			// 班级详情---班级学员
			handleClick: function($event) {
				let tabName = event.currentTarget.innerText;
				if(tabName == "班内学员") {
					this.classStudent();
				} else {
					this.detail_num = 0;
				}
			},
			//获取班级详情
			listDetail(row) {
				this.classId = row.class_id;
				this.stu_detail_show = true;
				this.activeName = "second";
				for(var i = 0; i < this.tableData.tableData_main.length; i++) {
					if(this.classId == this.tableData.tableData_main[i].class_id) {
						this.classDetail = this.tableData.tableData_main[i];
					}
				};
				try {
					document.addEventListener('click', (e) => {
						if(!this.$el.contains(e.target)) {
							this.stu_detail_show = false;
						}
					}, true)
				} catch(e) {
					console.log(e.description)
				}
				this.classStudent();
			},
			//根据条件查询数据
			searchData: function(num) {
				let _this = this;
				let searchMsg = this.search.search_msg;
				this.search.search_class = '';
				if(searchMsg.length > 0) {
					_this.search.search_style = [];
					let slc = _this.search.state_slc;
					switch(slc) {
						case '班级':
							_this.search.search_class = searchMsg;
							break;
						default:
							break;
					}
				}else if(searchMsg.length == 0 && num == 0){
					this.search.search_class = '';
				}else{
					this.resetForm()
				}
				this.refresh();
			},
			//重置搜索条件
			resetForm: function() {
				this.search.search_class = '';
				this.search.search_style = [];
			},
			//根据搜索选项卡改变提示文字
			searchOption: function() {
				this.search.search_msg = '';
				if(this.search.state_slc == "班级") {
					this.search.placeHolder = '输入' + this.search.state_slc + '名称'
				}
			},
			//选择展示所有展示选项
			checkAllSorts: function(event) {
				this.tableRender.tableData_type = event.target.checked ? this.tableRender.tableData_allType : ['班级名称'];
				this.tableRender.isIndeterminate = false;
				this.checkSort(this.tableRender.tableData_type);
			}, //全选
			//选择table展示类，展示类改变后将存储本地
			checkSort: function(value) {
				let checkedCount = value.length;
				this.tableRender.checkAll = checkedCount === this.tableRender.tableData_allType.length;
				this.tableRender.isIndeterminate = checkedCount > 0 && checkedCount < this.tableRender.tableData_allType.length;
				let list = JSON.stringify(this.tableRender.tableData_type);
				localStorage.setItem("classSorts", list)
			},
			//得到班级学员
			classStudent: function() {
				this.detail_num = 1;
				let _this = this;
				let userData = JSON.parse(localStorage.userData);
				let access_token = localStorage.access_token;
				let class_id;
				let lesson_id;
				let org_id;
				for(var i = 0; i < _this.tableData.tableData_id.length; i++) {
					if(_this.classId == _this.tableData.tableData_id[i].class_id) {
						class_id = _this.tableData.tableData_id[i].class_id;
						lesson_id = _this.tableData.tableData_id[i].lesson_id;
						org_id = _this.tableData.tableData_id[i].org_id;
					}
				};
				_this.$http.get("api/work/GetClassStudentExtension", {
					params: {
						org_id,
						lesson_id,
						class_id
					},
					headers: {
						'Authorization': 'Bearer ' + (access_token ? access_token : '')
					}
				}).then((response) => {
					_this.classStudents = [];
					if(response.data.length > 0) {
						for(var i = 0; i < response.data.length; i++) {
							let cache = [];
							cache['学生姓名'] = response.data[i].student.name;
							cache['任课老师'] = response.data[i].noteLesson.teacher_name;
							cache['消耗课时'] = response.data[i].noteLesson.lesson_num;
							cache['上课时间'] = response.data[i].noteLesson.lesson_time.substring(0, 10) + " " + response.data[i].noteLesson.lesson_time.substring(11, 16);
							cache['总课时数'] = response.data[i].totalNum;
							cache['总消耗课时'] = response.data[i].useNum;
							cache['剩余课时'] = response.data[i].totalNum - response.data[i].useNum;
							_this.classStudents.push(cache);
						}
					} else {
						_this.detail_num = 2
					}
				}).catch((res)=>{
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
			//导出当前表格数据
			automateExcel(){
				automateExcel(this.tableData,this.tableRender.tableData_type,this.pageTitle);
			},
		},

	}
</script>

<style>
	@import "../../../static/css/fontawesome/font-awesome.min.css";
	@import "../../../static/css/fontawesome/iconfont.css";
	table>tbody>tr>td {
		width: auto !important;
		white-space: nowrap !important;
	}

	h3 {
		color: #434A54;
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
		cursor: default;
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

	ul.search_state>l i {
		cursor: pointer;
		color: #8492A6;
		font-size: 0.9em;
		margin: 0 0.1em;
		transition: color .1s ease-in;
	}

	ul.search_state>li:hover,
	ul.search_state>li:visited {
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
	/*学员详细的样式*/

	.stu_detail_bg {
		transition: all .3s ease-in;
	}

	.stu_detail {
		padding-left: 1em;
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
		font-size: 0.9em;
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
	/*折叠面板展示班内学员*/

	h3.color-silver {
		margin-top: 8em;
	}

	.el-collapse {
		padding: 1em;
		border: none;
	}

	.col-xs-4 {
		border-top: 1px solid #E5E9F2;
		padding-top: 0.6em;
		margin: 0.6em 0;
		font-size: 0.8em;
	}

	.color-silver {
		color: #8492A6;
	}
</style>

<template>
	<div class="">
		<h3 class="pull-left">{{ pageTitle }}</h3>
		<!-- 搜索框 -->
		<div class="pull-right search-bg center-block" v-on:keydown.enter="searchData()">
			<ul class="search_state list-inline text-center text-nowrap">
				<li class="text-right text-nowrap" v-for="sta in search.search_state_before" :key="sta" @click="search.search_msg='';search.search_state = [sta];searchData(0)">
					{{ sta }}
				</li>
				<li class="text-right text-nowrap" @click="search.search_msg='';search.type='sales';searchData(1)">未分配咨询</li>
			</ul>
			<el-input class="search_outer" :placeholder="search.placeHolder" v-model="search.search_msg" v-on:keydown.enter="searchData()">
				<el-select v-model="search.state_slc" slot="prepend" placeholder="学员" @change="search.search_msg = '';search.placeHolder = '输入'+ search.state_slc + '姓名'">
					<el-option v-for="con in search.condition" :label="con" :value="con" :key="con"></el-option>
				</el-select>

				<el-button slot="append" icon="search" @click="searchData" class="search_btn"></el-button>
			</el-input>
			<div class="clearfix"></div>
		</div>
		<div class="clearfix"></div>
		<!-- 操作栏按钮组 -->
		<div class="operationGroup block-full-width text-right">
			<ul class="otg_ul">
				<!--<li @click="dialogShow.create = true;" style="line-height: 1em;"><i class="fa fa-plus"></i>&nbsp;新建学员</li>-->
				<!--<li @click="batchOpera = true">批量操作</li>-->
				<li class="pull-left distribution" v-if="distribution.dtb_txt_show">
					<ul class="list-inline">
						<li @click="getRoleList('教务老师')">分配</li>
					</ul>
				</li>
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
				<li @click="dialogShow.importExcel_show = true;importExcel.loading = false">导入</li>
			</ul>
		</div>
		<!-- 数据表格 -->
		<el-table :plain="true" ref="el_table" :data="tableData" row-class-name="table_row" :height="tableRender.tableHeight" style="width: 100%;" border @row-click="listDetail" @select="selectedRow" @select-all="selectedRow" v-loading.body="tableRender.loading">
			<el-table-column type="selection" fixed></el-table-column>
			<!--<el-table-column fixed prop="姓名" label="姓名" width="80"></el-table-column>-->
			<el-table-column v-for="type in tableRender.tableData_type" :prop="type" :key="type.text" show-overflow-tooltip :label="type" sortable :render-header="tableHeader"></el-table-column>
		</el-table>
		<!-- 翻页按钮 -->
		<div class="block">
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="tableRender.currentPage" :page-sizes="[20, 30, 50, 100]" :page-size="tableRender.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="tableRender.totalItemCount"></el-pagination>
		</div>
		<!-- 高级搜索弹出模态框 -->
		<el-dialog title="高级搜索" :visible.sync="dialogShow.adSearch" size="tiny" :show-close=false class="search_dialog">
			<div class="el-dialog__headerbtn" @click="dialogShow.adSearch = false;">
				<i class="el-dialog__close el-icon el-icon-close close_event"></i>
			</div>
			<el-form :model="search" label-width="7rem" ref="search" v-on:keydown.enter="dialogShow.adSearch = false;refresh()">
				<el-form-item label="学员姓名">
					<el-input v-model="search.search_stu"></el-input>
				</el-form-item>
				<el-form-item label="咨询师">
					<el-input v-model="search.search_sales"></el-input>
				</el-form-item>
				<el-form-item label="教务老师">
					<el-input v-model="search.search_dean"></el-input>
				</el-form-item>
				<el-form-item label="选择未分配">
					<el-select v-model="search.type" clearable placeholder="选择未分配学员">
						<el-option value="sales" label="未分配咨询老师"></el-option>
						<el-option value="sales_union" label="未分配联合咨询"></el-option>
						<el-option value="dean" label="未分配教务老师"></el-option>
						<el-option value="dean_union" label="未分配联合教务"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="学员状态">
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
		<!-- 选择展示弹出模态框 -->
		<el-dialog title="选择展示" :visible.sync="dialogShow.sorts" :show-close=false>
			<div class="el-dialog__headerbtn" @click="dialogShow.sorts = false;">
				<i class="el-dialog__close el-icon el-icon-close close_event"></i>
			</div>
			<el-checkbox :indeterminate="allSorts.isIndeterminate" v-model="allSorts.checkAll" @change="checkAllSorts">全选</el-checkbox>
			<a class="resetSorts" @click='tableRender.tableData_type= ["姓名", "性别", "状态", "电话", "咨询师", "教务", "创建时间", "最后修改时间", "最后跟进时间"];checkSort(tableRender.tableData_type)'>重置</a>
			<el-checkbox-group v-model="tableRender.tableData_type" class="sorts" @change="checkSort">
				<el-checkbox label="姓名" disabled></el-checkbox>
				<el-checkbox v-for="sta in allSorts.checkList" :label="sta" :key="sta"></el-checkbox>
			</el-checkbox-group>
		</el-dialog>
		<!-- 学员分配弹出模态框 -->
		<el-dialog title="学员分配" size='tiny' :visible.sync="dialogShow.distribution_show" :show-close=false>
			<div class="el-dialog__headerbtn" @click="emptyDistribution();dialogShow.distribution_show = false;">
				<i class="el-dialog__close el-icon el-icon-close close_event"></i>
			</div>
			<el-row class="demo-autocomplete">
				<el-col :span="24">
					<el-autocomplete v-model="distribution.inputModel" :fetch-suggestions="suggestionRole" :trigger-on-focus="true" @select="optionSlc" class="inline-input" placeholder="请输入内容">
						<el-select class="optionSlc_bg" v-model="distribution.selectObj" slot="prepend" :placeholder="distribution.selectObj" @change="getRoleList">
							<el-option v-for="item in distribution.selectList" :label="item" :value="item" :key="item"></el-option>
						</el-select>
						<el-button slot="append" @click="dsbStu">分配</el-button>
					</el-autocomplete>
				</el-col>
			</el-row>
		</el-dialog>
		<!-- 导入xlsx格式弹出模态框 -->
		<el-dialog title="导入xlsx格式" size='small' :visible.sync="dialogShow.importExcel_show" :show-close=false>
			<div class="el-dialog__headerbtn" @click="dialogShow.importExcel_show = false;importExcel.tbShow=false">
				<i class="el-dialog__close el-icon el-icon-close close_event"></i>
			</div>
			<div v-show="!importExcel.tbShow">
				<p>说明：导入数据量上限为500条。如果超出，请修改后再导入</p>
				<p>1、点击下载《
					<a href="../../../static/模板文件.xlsx">客户导入模板</a>》</p>
				<p>2、填写模板文件选择文件， 并开始导入</p>
				<p>3、数据量较大时请耐心等待</p>
			</div>

			<el-form>
				<el-form-item v-show="!importExcel.tbShow" class="">
					<div @click="$refs.slcFile.click();" class="file_bg">
						<span class="col-xs-9 text-left file_name">{{ importExcel.fileName }}</span>
						<el-button type="primary" class="file_btn">选择文件<i class="el-icon-upload el-icon--right"></i></el-button>
					</div>
					<div class="clearfix"></div>
					<input type="file" ref="slcFile" @change="importfile" class="hidden" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
				</el-form-item>
				<el-form-item class="pull-right file_chose">
					<el-button type="primary" @click="checkFile" :loading="importExcel.loading">导入</el-button>
					<el-button @click="importCancel">取消</el-button>
				</el-form-item>
				<div class="pull-left" v-show="importExcel.tbShow">
					此次导入 <span class="text-primary">{{ importExcel.arrList.length }}</span> 条数据，其中错误数据 <span class="text-danger"> {{ importExcel.tbInfoErrRow.length }} </span>行,共 <span class="text-danger">{{ importExcel.tbInfoErr }}</span> 个错误
				</div>
				<div class="clearfix" v-if="importExcel.tbShow"></div>
				<el-checkbox class="dsb_self" v-bind:class="{ 'pull-left': !importExcel.tbShow, 'pull-right': importExcel.tbShow }" v-model="importExcel.dsb_slef">分配给自己</el-checkbox>
				<div class="clearfix"></div>
			</el-form>
			<div class="imp_table_bg" v-show="importExcel.tbShow">

				<table class="table-responsive table table-bordered file_table">
					<thead>
						<tr>
							<th class="text-danger">姓名（必填）</th>
							<th class="text-danger">性别（必填）</th>
							<th class="text-danger">家长电话（必填）</th>
							<th>家长电话2</th>
							<th>学生电话</th>
							<th>备注</th>
							<th v-if="importExcel.dsb_slef" class="hidden">sales_name</th>
							<th v-if="importExcel.dsb_slef" class="hidden">sales_id</th>
							<th class="hidden">campus_id</th>
						</tr>
					</thead>
					<tbody ref="tb">
						<tr v-for="(obj,index) in importExcel.arrList">
							<td v-for="(item,key) in obj"><input type="text" v-model="obj[key]" class="file_input" /></td>
						</tr>
					</tbody>
				</table>

			</div>
		</el-dialog>
		<!-- 组件||学员详情 -->
		<detail ref="detailSelf" v-show="stu_detail_show" v-on:la-la="stu_detail_show = false" :tableData='tableData' :showHid="showHid" :moreInfoData='moreInfoData' :student_id='student_id' :profile='tableRender.profile' :studentDetail='studentDetail'></detail>
	</div>
</template>

<script>
	import XLSX from 'xlsx';
	import {automateExcel} from '@/util/util.js';
	let detail = require('@/page/student/children/detail.vue');

	export default {
		components: {
			detail: detail, //学员详情组件
		},
		data() {
			return {
				t: true,
				f: false,
				//搜索数据
				search: {
					search_state_before: ['跟进中', '已报名', '无意向', '已结课', '已流失'],
					state_slc: '学员', //选中的单项搜索条件
					state_toggle: 0, //搜索方式（单项搜索、复合条件搜索）
					search_stu: '', //学生姓名
					search_sales: '', //咨询师
					search_dean: '', //教务老师
					search_state: [], //状态【跟进中、已报名、无意向】
					search_msg: '', //单项搜索输入信息
					placeHolder: '输入学员姓名', //placeholder提示
					condition: ['学员', '咨询师', '教务老师'],
					type: '', //未分配类型（咨询，教务）
				},
				//弹出dialog的展示和隐藏
				dialogShow: {
					adSearch: false, //高级搜索
					sorts: false, //选择展示列
					create: false, //创建新学员
					distribution_show: false, //分配咨询教务
					importExcel_show: false, //导入xlsx格式文件
				},
				//选择table展示内容
				allSorts: {
					isIndeterminate: true, //展示内容中全选按钮的状态
					checkAll: true,
					checkList: ["性别", "状态", "电话", "咨询师", "教务", "联合咨询", "联合教务", "加入时间", "创建时间", "最后修改时间", "最后跟进时间", "备注"],
				},
				//导入
				importExcel: {
					fileName: '点击选择文件',
					xlxList: [], //xlsx对象
					arrList: [], //转换而来的json数据
					tbShow: false,
					modifyState: false, //数据处理状态切换
					tbInfoErr: 0, //数据错误个数
					tbInfoErrRow: [], //错误数据行
					loading: false, //防止重复点击
					fileNameList: [], //文件名集
					dsb_slef: false, //分配给自己
				},
				//分配
				distribution: {
					stuIdList: [], //选中学员ID集
					inputModel: '', //输入信息
					slctedRole: {}, //选中的角色
					selectList: ['教务老师', '咨询师', ],
					selectObj: '教务老师', //选中的角色
					roleList: [], //返回角色（教务、咨询、联合）的集
					dtb_txt_show: false, //分配按钮
				}, //分配
				studentDetail: {}, //单个学员的详细数据 ———— 学员信息
				showHid: {
					flowUpShow: true, //单个学员的详细数据 ———— 学员信息
					lessonShow: true, //单个学员的详细数据 ———— 跟进记录
					courseShow: true, //单个学员的详细数据 ———— 上课记录
					costShow: true, //单个学员的详细数据 ———— 报名课程
					loadMore: false, //记上课“加载更多”按钮
					loadMoreFlow: false, //跟进“加载更多”按钮
					loadMoreCost: true, //跟进“加载更多”按钮
				}, //显示与隐藏
				pageTitle: "学员",
				tableData: [], //学员全部数据
				//表格渲染
				tableRender: {
					tableHeight: 0, //表格高度
					currentPage: 1, //现在的页码
					pageSize: 30, //每页数据条数
					pageIndex: 1, //页码
					totalItemCount: 0,
					totalPageCount: 0,
					profile: ["性别", "状态", "电话", "咨询师", "教务", "联合咨询", "联合教务", "加入时间", "创建时间", "最后修改时间", "最后跟进时间", "备注"], //登陆人信息
					tableData_type: ["姓名", "性别", "状态", "电话", "咨询师", "教务", "创建时间", "最后修改时间", "最后跟进时间"],
					tableData_allType: ["姓名", "性别", "状态", "电话", "咨询师", "教务", "联合咨询", "联合教务", "加入时间", "创建时间", "最后修改时间", "最后跟进时间", "备注"],
					loading: false, //数据加载缓慢时的过渡
				},
				stu_detail_show: false, //单个学员的详情页面
				student_id: 0, //鼠标点击的学员的id
				detail_num: 1, //学员详情中各个选项的展示切换
				//加载更多 -- detail组件
				moreInfoData: {
					currentPage: 0, //现在的页码
				},
				userDataAll: {}, //本地存储的账户信息
			}
		},
		created: function() {
			global._this = this;
			let userObj = JSON.parse(localStorage.userData);
			let userData = userObj[0] || userObj;
			this.userDataAll = userData;
			//console.log(userData);
			if(localStorage.stuSorts) {
				this.tableRender.tableData_type = JSON.parse(localStorage.stuSorts);
			};
			this.tableRender.profile.name = userData.name ? userData.name : userData[0].name;
			this.tableRender.tableHeight = document.documentElement.clientHeight - 220;
			this.refresh();
		},
		methods: {
			//表格头部的渲染 -- 根据内容改变他的长度
			tableHeader(h, {column,$index}) {
				let widthList = ['姓名', '性别', '状态', '电话', '咨询师', '教务', "联合咨询", "联合教务", "创建时间", "最后修改时间", "最后跟进时间",'备注'];
				let sameDataList = [];
				let w = _this.$refs.el_table.$el.offsetWidth - 50;
				let ow;
				let item  = widthList.concat(_this.tableRender.tableData_type);
				item.sort();
				let svgWidth = 0;
				let state = true;
				let fixWidth = 0;//显示table-header的宽度
				let addWidth = function(item) {
					switch(item) {
						case '姓名':
						case '性别':
						case '状态':
							return 90;
							break;
						case '电话':
							return 140;
							break;
						case '咨询师':
						case '教务':
							return 80;
							break;
						case '联合咨询':
						case '联合教务':
							return 100;
							break;
						case '创建时间':
						case '加入时间':
						case '最后修改时间':
						case '最后跟进时间':
							return 150;
							break;
						case '备注':
							return 200;
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
					case '姓名':
					case '状态':
					case '性别':
						column.width = 90 + svgWidth;
						break;
					case '电话':
						column.width = 140 + svgWidth;
						break;
					case '咨询师':
					case '教务':
					case '联合咨询':
					case '联合教务':
						column.width = 100 + svgWidth;
						break;
					case '加入时间':
					case '最后修改时间':
					case '最后跟进时间':
					case '创建时间':
						column.width = 150 + svgWidth;
						break;
					case '备注':
						column.width = 200 + svgWidth;
						break;
					default:
						ow = parseInt((w - fixWidth) / (_this.tableRender.tableData_type.length - sameDataList.length));
						column.width = ow > 80 ? ow : 80;
						//console.log(_this.$refs.el_table);
						break;
				};
				//return h('div', {style: "float:left"}, [column.label, h('text', {style: ""}, '')])
				return column.label;
				//console.log(column)
			},
			//获取学员数据
			refresh: function() {
				this.tableRender.loading = true;
				let stuName = this.search.search_stu;
				let salesName = this.search.search_sales;
				let deanName = this.search.search_dean;
				let stuState = JSON.parse(JSON.stringify(this.search.search_state));
				let type = this.search.type;
				for(var i = 0; i < stuState.length; i++) {
					switch(stuState[i]) {
						case "跟进中":
							stuState[i] = "stuState0001";
							break;
						case "已报名":
							stuState[i] = "stuState0002";
							break;
						case "无意向":
							stuState[i] = "stuState0003";
							break;
						case "已结课":
							stuState[i] = "stuState0004";
							break;
						case "已流失":
							stuState[i] = "stuState0005";
							break;
						default:
							break;
					}
				};
				var pageSize = this.tableRender.pageSize;
				var pageIndex = this.tableRender.pageIndex;
				var userData = this.userDataAll;
				var org_id = userData.org_id ? userData.org_id : userData[0].org_id;
				var account_id = userData.id ? userData.id : userData[0].id;
				var access_token = localStorage.access_token;
				var data = {
					pagesize: pageSize,
					pageindex: pageIndex,
					org_id: org_id,
					account_id: account_id,
					stu_name: stuName,
					sales_name: salesName,
					dean_name: deanName,
					state: stuState,
					type: type
				};
				this.$http.get('api/Student/GetStudentListExtension', {
					params: {
						data: JSON.stringify(data)
					},
					headers: {
						'Authorization': 'Bearer ' + (access_token ? access_token : '')
					}
				}).then((response) => {
					this.tableData = [];
					var totalItemCount = response.data.totalItemCount;
					var totalPageCount = response.data.totalPageCount;
					this.tableRender.totalItemCount = totalItemCount;
					this.tableRender.totalPageCount = totalPageCount;
					var items = response.data.items;
					for(var i = 0; i < items.length; i++) {
						switch(items[i].state) {
							case "stuState0001":
								items[i].state = "跟进中";
								break;
							case "stuState0002":
								items[i].state = "已报名";
								break;
							case "stuState0003":
								items[i].state = "无意向";
								break;
							case "stuState0004":
								items[i].state = "已结课";
								break;
							case "stuState0005":
								items[i].state = "已流失";
								break;
							default:
								items[i].state = "其他";
						};
						switch(items[i].source) {
							case "stuSource0001":
								items[i].source = "自然来电";
								break;
							case "stuSource0002":
								items[i].source = "转介绍";
								break;
							case "stuSource0003":
								items[i].source = "渠道合作";
								break;
							case "stuSource0004":
								items[i].source = "活动填单";
								break;
							case "stuSource0005":
								items[i].source = "自然来访";
								break;
							case "stuSource0006":
								items[i].source = "其他";
								break;
							case "stuSource0007":
								items[i].source = "微直招";
								break;
							default:
								items[i].source = "未知来源";
								break;
						};
						var cache = {};
						cache['姓名'] = items[i].name;
						cache['性别'] = items[i].sex ? items[i].sex : '未知';
						cache['状态'] = items[i].state;
						cache['咨询师'] = items[i].sales_name ? items[i].sales_name : "";
						cache['教务'] = items[i].dean_name ? items[i].dean_name : "";
						cache['创建时间'] = items[i].create_time.substring(0, 10) + " " + items[i].create_time.substring(11, 16);
						cache['电话'] = items[i].phone;
						cache['加入时间'] = items[i].join_time ? items[i].jion_time.substring(0, 10) + " " + items[i].jion_time.substring(11, 16) : "";
						cache['最后修改时间'] = items[i].update_time ? items[i].update_time.substring(0, 10) + " " + items[i].update_time.substring(11, 16) : "";
						cache['最后跟进时间'] = items[i].lastrecord_time ? items[i].lastrecord_time.substring(0, 10) + " " + items[i].lastrecord_time.substring(11, 16) : "暂无跟进";

						//							cache["密码"] = items[i].password;
						cache["来源"] = items[i].source;
						//							cache.sales_id = items[i].sales_id;
						//							cache.dean_id = items[i].dean_id;
						//							cache.sales_union_id = items[i].sales_union_id;
						cache["联合咨询"] = items[i].sales_union_name ?items[i].sales_union_name:"";
						//							cache.dean_union_id = items[i].dean_union_id;
						cache["联合教务"] = items[i].dean_union_name ?items[i].dean_union_name:"";
						//							cache.head_pic = items[i].head_pic;
						cache["余额"] = items[i].balance;
						cache["优惠"] = items[i].cash_coupon;
						cache["备注"] = items[i].description ? items[i].description : '';
						//							cache.create_by_id = items[i].create_by;
						//							cache.update_by_id = items[i].update_by;
						cache.student_id = items[i].id;

						this.tableData.push(cache);
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
			//修改每页展示多少条
			handleSizeChange(val) {
				this.tableRender.pageSize = val;
				this.refresh();
			},
			//修改页码
			handleCurrentChange(val) {
				this.tableRender.pageIndex = val;
				this.refresh();
			},
			//点击表格中的每一行 -- 获取单个学员数据
			listDetail(row, column) {
				let path = column.path.length;
				if(path != 20) {
					let id = row.student_id;
					this.student_id = id;
					this.detail_num = 0;
					this.activeName = "first";
					this.record_show = true;
					let tableData = this.tableData;
					this.stu_detail_show = true;
					this.student_id = id;
					this.$refs.detailSelf.tabChange();
					for(var i = 0; i < tableData.length; i++) {
						if(tableData[i].student_id == this.student_id) {
							this.studentDetail = tableData[i];
						};
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
				}
			},
			//根据条件查询数据
			searchData: function(num) {
				let searchMsg = this.search.search_msg;
				this.search.search_stu = '';
				this.search.search_sales = '';
				this.search.search_dean = '';
				if(searchMsg.length > 0) {
					_this.search.search_state = [];
					if(_this.search.placeHolder == '输入学员姓名') {
						_this.search.search_stu = searchMsg;
					} else if(_this.search.placeHolder == '输入咨询师姓名') {
						_this.search.search_sales = searchMsg;
					} else if(_this.search.placeHolder == '输入教务老师姓名') {
						_this.search.search_dean = searchMsg;
					};
				} else if(num == 1) {
					_this.search.type = 'sales';
				} else if(searchMsg.length == 0 && num == 0) {
					_this.search.search_stu = '';
					_this.search.search_sales = '';
					_this.search.search_dean = '';
					_this.search.type = ''
				} else {
					_this.resetForm()
				};
				this.refresh();
			},
			//重置搜索条件
			resetForm: function() {
				this.search.search_stu = '';
				this.search.search_sales = '';
				this.search.search_dean = '';
				this.search.search_state = [];
				this.search.type = '';
			},
			//导出当前表格数据
			automateExcel(){
				automateExcel(this.tableData,this.tableRender.tableData_type,this.pageTitle);
			},
			// 全选展示内容操作
			checkAllSorts: function(event) {
				this.tableRender.tableData_type = event.target.checked ? this.tableRender.tableData_allType : ['姓名'];
				this.allSorts.isIndeterminate = false;
				this.checkSort(this.tableRender.tableData_type)
			},
			//选择table展示类，展示类改变后将存储
			checkSort: function(value) {
				let checkedCount = value.length;
				this.allSorts.checkAll = checkedCount === this.tableRender.tableData_allType.length;
				this.allSorts.isIndeterminate = checkedCount > 0 && checkedCount < this.tableRender.tableData_allType.length;
				let list = JSON.stringify(this.tableRender.tableData_type);
				localStorage.setItem("stuSorts", list)
			},
			// 添加新学员
			addStu: function(formName) {
				this.$refs[formName].validate((valid) => {
					if(valid) {
						alert('submit!');
					} else {
						console.log('error submit!!');
						return false;
					}
				});
			},
			 //多选展示类容
			selectedRow(selection, row) {
				this.stu_detail_show = false;
				if(selection.length > 0) {
					this.distribution.dtb_txt_show = true;
					this.distribution.stuIdList = [];
					for(var i = 0; i < selection.length; i++) {
						let stuId = selection[i].student_id;
						this.distribution.stuIdList.push(stuId);
					};
				} else {
					this.distribution.dtb_txt_show = false;
				}

			},
			// 返回输入建议的方法，仅当你的输入建议数据 resolve 时，通过调用 fnc(data:[]) 来返回它
			suggestionRole(queryString, fnc) {
				let virtualData = this.distribution.roleList;
				let showList = [];
				if(virtualData.length > 0 && queryString) {
					let arry = [];
					for(var key in virtualData[0]) {
						for(var i = 0; i < virtualData.length; i++) {
							if(virtualData[i][key] && virtualData[i][key].indexOf(queryString) > -1) {
								arry.push(i);
								var a1 = 0;
								for(var j = 0; j < arry.length; j++) {
									switch(arry[j]) {
										case i:
											a1++
											break;
										default:
											break;
									}
								};
								if(a1 == 1) {
									showList.push(virtualData[i]);
								}
							}
						};
					}
					let sortList = showList.sort(function(a, b) {
						if(typeof a === "object" && typeof b === 'object' && a && b) {
							let num1, num2;
							for(var key in a) {
								if(a['value'].indexOf(queryString) > -1 && b['value'].indexOf(queryString) > -1) {
									num1 = a['value'].indexOf(queryString);
									num2 = b['value'].indexOf(queryString);
									return num1 - num2;
								} else if(a['value'].indexOf(queryString) && b['value'].indexOf(queryString) == -1) {
									return a > b;
								} else if(b['value'].indexOf(queryString) && a['value'].indexOf(queryString) == -1) {
									return a < b;
								} else {
									num1 = a[key].indexOf(queryString);
									num2 = b[key].indexOf(queryString);
									return num1 - num2;
								}
							}
						}
					})
					fnc(sortList)
				} else {
					fnc(virtualData)
				};

			},
			// 选择角色类
			optionSlc(item) {
				_this.distribution.slctedRole = item;
			},
			//得到角色列 --- 教务，咨询
			getRoleList(e) {
				this.dialogShow.distribution_show = true;
				let userData = this.userDataAll;
				var org_id = userData.org_id ? userData.org_id : userData[0].org_id;
				var account_id = userData.id ? userData.id : userData[0].id;
				var campus_id = userData.campus_id ? userData.campus_id : userData[0].campus_id;
				let access_token = localStorage.access_token ? localStorage.access_token : '';
				if(e == "教务老师") {
					let getData = {
						pagesize: 100,
						pageindex: 1,
						campus_id: campus_id,
						other: false,
						org_id: org_id,
						account_id: account_id,
						roleidList: ["bc0acdf3aa6346d4889ee402a7eb89f1"]
					};
					this.$http.get('api/Account/GetPersonnelByRoleListExtension', {
						params: {
							data: JSON.stringify(getData)
						},
						headers: {
							'Authorization': 'Bearer ' + access_token
						}
					}).then((response) => {
						let items = response.data.items;
						this.distribution.roleList = items;
						for(var i = 0; i < items.length; i++) {
							this.distribution.roleList[i]['value'] = items[i]['name'] + "  " + items[i]['phone']
						}

					});
				} else if(e == "咨询师") {
					let getData = {
						pagesize: 100,
						pageindex: 1,
						campus_id: campus_id,
						other: false,
						org_id: org_id,
						account_id: account_id,
						roleidList: ["439aca7899de48d1a459aa76007b501b"]
					};
					this.$http.get('api/Account/GetPersonnelByRoleListExtension', {
						params: {
							data: JSON.stringify(getData)
						},
						headers: {
							'Authorization': 'Bearer ' + access_token
						}
					}).then((response) => {
						let items = response.data.items;
						this.distribution.roleList = items;
						for(var i = 0; i < items.length; i++) {
							this.distribution.roleList[i]['value'] = items[i]['name'] + "  " + items[i]['phone']
						}
					}).catch((res) => {
						console.log(res);
						this.$message({
							showClose: true,
							message: res.response.data.message || '数据读取失败，请检查网络或者重新登录',
							type: 'error'
						});
					});;
				}
			},
			//分配学员
			dsbStu() {
				let con = _this.distribution.stuIdList.length > 0 && typeof _this.distribution.slctedRole.id !== 'undefined' && typeof _this.distribution.slctedRole.name !== 'undefined' && typeof _this.userDataAll.id !== 'undefined';

				if(con) {
					let type = function() {
						//'教务老师', '咨询师','联合教务','联合咨询'
						if(_this.distribution.selectObj == "教务老师") {
							return 'dean';
						} else if(_this.distribution.selectObj == "咨询师") {
							return 'sales';
						} else if(_this.distribution.selectObj == "联合咨询") {
							return 'sales_union';
						} else if(_this.distribution.selectObj == "联合教务") {
							return 'dean_union';
						}
					}();
					let access_token = localStorage.access_token ? localStorage.access_token : '';
					let data = {
						student_id: _this.distribution.stuIdList,
						type: type,
						per_id: _this.distribution.slctedRole.id,
						per_name: _this.distribution.slctedRole.name,
						update_by: _this.userDataAll.id,
						org_id: _this.userDataAll.org_id
					};
					this.$http.get('api/Student/BatchAllotStudent', {
						params: {
							data: JSON.stringify(data)
						},
						headers: {
							'Authorization': 'Bearer ' + (access_token ? access_token : ''),
							'Content-Type': 'application/x-www-form-urlencoded'
						}
					}).then((response) => {
						if(response.data.err_code == "200") {
							this.$message({
								showClose: true,
								duration: 5000,
								message: '学员分配成功',
								type: 'success'
							});
							_this.dialogShow.distribution_show = false;
							_this.emptyDistribution();
							_this.refresh();
						} else {
							this.$message({
								showClose: true,
								duration: 5000,
								message: response.data.msg,
								type: 'error'
							});
						}

					}).catch((res) => {
						console.log(res);
						this.$message({
							showClose: true,
							message: res.response.data.message || '数据读取失败',
							type: 'error'
						});
					});
				} else {
					this.$message({
						showClose: true,
						message: '分配失败，请选择分配的老师',
						type: 'error'
					});
				}
			},
			//清空分配内容
			emptyDistribution() {
				//				this.distribution.stuIdList=[];
				this.distribution.inputModel = '';
				this.distribution.selectObj = '教务老师';
				this.distribution.slctedRole = {};
			},
			//导入学员
			importfile($event) {
				let obj = $event.target;
				_this.importExcel.fileName = obj.files[0] ? obj.files[0].name : '点击选择文件';
				for(var i = 0; i < _this.importExcel.fileNameList.length; i++) {
					if(_this.importExcel.fileName == _this.importExcel.fileNameList[i]) {
						_this.$message({
							showClose: true,
							duration: 5000,
							message: "防止重复导入，请不要使用相同文件",
							type: 'warning'
						});
						_this.importExcel.arrList = [];
						break;
					}
				};

				let wb;
				let rABS = false;
				if(!obj.files || obj.files.length == 0) {
					return false;
				};
				let f = obj.files[0];
				let reader = new FileReader();
				reader.onload = function(e) {
					let data = e.target.result;
					if(rABS) {
						wb = XLSX.read(data, {
							type: 'binary'
						});
					} else {
						wb = XLSX.read(btoa(fixdata(data)), { //手动转化
							type: 'base64'
						});
					};
					this.cacheList = (XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])).slice(0, 500);
					let xlsxData = this.cacheList;
					for(var i = 0; i < xlsxData.length; i++) {
						xlsxData[i]["姓名"] = xlsxData[i]["姓名"] || "";
						xlsxData[i]["性别"] = xlsxData[i]["性别"] || "";
						xlsxData[i]["家长电话"] = xlsxData[i]["家长电话"] || "";
						xlsxData[i]["家长电话2"] = xlsxData[i]["家长电话2"] || "";
						xlsxData[i]["学生电话"] = xlsxData[i]["学生电话"] || "";
						xlsxData[i]["备注"] = xlsxData[i]["备注"] || "";
					};
					_this.importExcel.arrList = xlsxData;
					_this.importExcel.modifyState = false;
					_this.importExcel.xlxList = wb.Sheets[wb.SheetNames[0]];
				};
				if(rABS) {
					reader.readAsBinaryString(f);
				} else {
					reader.readAsArrayBuffer(f);
				}
				let fixdata = function(data) {
					var o = "",
						l = 0,
						w = 10240;
					for(; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
					o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
					return o;
				}
			},
			//检查导入数据
			checkFile() {
				//防止按钮多次点击
				_this.importExcel.loading = true;
				//錯誤信息集合
				let errList = [];
				//导入展示的数据
				let arrList = _this.importExcel.arrList;

				//家长电话集合
				let phoneList = [];
				let data = {
					org_id: _this.userDataAll.org_id,
					students: [],
					create_by: _this.userDataAll.id
				};
				if(arrList.length == 0) {
					_this.$message({
						showClose: true,
						duration: 5000,
						message: "请重新选择导入文件",
						type: 'warning'
					});
					_this.importExcel.loading = false;
					return false
				};
				let findDeletion = function(e, i, s) {
					if(e) {
						if(e.length == 0 && i && s) {
							errList.push([i, s]);
							return '';
						} else {
							return e.replace(/[^A-Za-z0-9\u4e00-\u9fa5]/g, "");
						}
					} else {
						return ''
					}
				}; //
				let findName = function(e, i, s) {
					if(!e) {
						errList.push([i, s]);
					};
					return e
				};
				let findTel = function(e, i, s) {
					let partten = /^1[3,5,7,8]\d{9}$/;
					if(!partten.test(e)) {
						errList.push([i, s]);
					};
					if(e) {
						return e.replace(/[^0-9]/g, "")
					} else {
						return e
					}
				};
				let findSex = function(e, i, s) {
					if(e) {
						if(e.length > 0 && (e !== "男" || e !== "女")) {
							if(e.indexOf("男") > -1 && e.indexOf("女") == -1) {
								return '男'
							} else if(e.indexOf("女") > -1 && e.indexOf("男") == -1) {
								return '女'
							} else if(e.indexOf("女") > -1 && e.indexOf("男") > -1) {
								if(e.indexOf("女") > e.indexOf("男")) {
									return "男"
								} else {
									return "女"
								}
							} else if(e.indexOf("女") == -1 && e.indexOf("男") == -1) {
								errList.push([i, "sex"]);
								return ' ';
							}
						} else {
							return e
						}
					} else {
						errList.push([i, "sex"]);
						return " "
					}
				};
				for(var i = 0; i < arrList.length; i++) {
					let cache = {};
					//必填选项
					let state = _this.importExcel.modifyState;
					if(state == true) {
						//console.log("新型list")
						cache.name = findName(findDeletion(arrList[i]["name"], i, "name"), i, "name");
						cache.sex = findSex(findDeletion(arrList[i]["sex"]), i, "sex");
						cache.phone = findTel(findDeletion(arrList[i]["phone"]), i, "phone");

						//非必填选项
						cache.phone2 = arrList[i]["phone2"] ? findTel(findDeletion(arrList[i]["phone2"]), i, "phone2") : '';
						cache.student_phone = arrList[i]["student_phone"] ? findTel(findDeletion(arrList[i]["student_phone"]), i, "student_phone") : '';
						cache.description = arrList[i]["description"] ? arrList[i]["description"].substring(0, 50) : '';
					} else {
						//console.log("原始xlsx")
						cache.name = findName(findDeletion(arrList[i]["姓名"], i, "name"), i, "name");
						cache.sex = findSex(findDeletion(arrList[i]["性别"]), i, "sex");
						cache.phone = findTel(findDeletion(arrList[i]["家长电话"]), i, "phone");

						//非必填选项
						cache.phone2 = arrList[i]["家长电话2"] ? findTel(findDeletion(arrList[i]["家长电话2"]), i, "phone2") : '';
						cache.student_phone = arrList[i]["学生电话"] ? findTel(findDeletion(arrList[i]["学生电话"]), i, "student_phone") : '';
						cache.description = arrList[i]["备注"] ? arrList[i]["备注"].substring(0, 50) : '';
					};
					if(_this.importExcel.dsb_slef) {
						cache.sales_name = _this.userDataAll.name;
						cache.sales_id = _this.userDataAll.id;
					};
					//导入学员电话集合
					phoneList.push(cache.phone);
					cache.campus_id = _this.userDataAll.campus_id;
					if(cache.name || cache.sex || cache.phone || cache.phone2 || cache.student_phone || cache.description) data.students.push(cache);
				};
				_this.importExcel.arrList = data.students;
				_this.importExcel.tbInfoErr = errList.length;
				if(errList.length > 0) {
					//console.log(errList);
					_this.importExcel.tbShow = true;
					_this.importExcel.modifyState = true;
					let errObj = {};
					for(var i = 0; i < errList.length; i++) {
						let item = errList[i][0];
						if(!item[item]) {
							errObj[item] = item;
						}
					};
					let errRows = [];
					for(var i in errObj) {
						errRows.push(errObj[i])
					};
					_this.importExcel.tbInfoErrRow = errRows;
					try {
						let rows = _this.$refs.tb.rows;
						for(var i = 0; i < rows.length; i++) {
							var tds = rows[i].childNodes;
							for(var j = 0; j < tds.length; j++) {
								tds[j].childNodes[0].style.border = '';
							}
						};
						for(var i = 0; i < errList.length; i++) {
							let x = errList[i][0];
							let y = function() {
								switch(errList[i][1]) {
									case 'name':
										return 0
										break;
									case 'sex':
										return 1
										break;
									case 'phone':
										return 2
										break;
									case 'phone2':
										return 3
										break;
									case 'student_phone':
										return 4
										break;
									case 'description':
										return 5
										break;
									default:
										return errList[i][1]
										break;
								}
							}();
							let rowObj = rows[x].childNodes;
							var inputObj = rowObj[y].childNodes[0];
							inputObj.style.border = "1px solid red"
							_this.importExcel.loading = false;
						}

					} catch(e) {
						//TODO handle the exception
						console.log(e);
					}
				} else {
					//					console.log(data);

					//判断有没有重复电话
					let getRepeat = function(list) {
						var listSort = list.sort();
						var numList = [];
						var num = 1;
						var tmp = [];
						for(var i = 0; i < listSort.length; i++) {
							if(listSort[i]) {
								if(listSort[i] == listSort[i + 1]) {
									num++;
									if(tmp.indexOf(listSort[i]) == -1) {
										tmp.push(listSort[i])
									};
								} else {
									if(num > 1) {
										numList.push(num);
										num = 1;
									}
								}
							}
						};
						return [numList, tmp]
					};
					let repeatPhone = getRepeat(phoneList);
					//console.log(repeatPhone);
					if(repeatPhone){}
					let con = function() {
						for(var i = 0; i < repeatPhone[0].length; i++) {
							if(repeatPhone[0][i] > 2) {
								return true;
								break;
							}
						}
					}();
					let pMsg = function() {
						let p = "";
						for(var i = 0; i < repeatPhone[0].length; i++) {
							if(repeatPhone[0][i] > 2) {
								if(i < repeatPhone[0].length - 1) {
									p += "\"" + repeatPhone[1][i] + "\"" + "出现 " + " " + repeatPhone[0][i] + "次" + "、"
								} else {
									p += "\"" + repeatPhone[1][i] + "\"" + "出现 " + " " + repeatPhone[0][i] + "次" + "。"
								}
							}
						};
						return p
					}();
					let msg = "有重复超过三次的电话: 其中 " + pMsg;

					let batchImportStudent = function() {
						console.log("数据请求");
						_this.$http.post('api/Student/BatchImportStudent', {
							'': JSON.stringify(data)
						}, {
							headers: {
								'Authorization': 'Bearer ' + localStorage.access_token,
								'Content-Type': 'application/x-www-form-urlencoded'
							}
						}).then((response) => {
							//console.log(response);

							if(response.data.err_code == "200") {
								_this.$message({
									showClose: true,
									duration: 5000,
									message: '学员导入成功',
									type: 'success'
								});
								_this.dialogShow.importExcel_show = false;
								_this.importExcel.tbShow = false;
								_this.importExcel.arrList = [];
								_this.importExcel.fileNameList.push(_this.importExcel.fileName);

								//							_this.$refs.slcFile.createTextRange().execCommand("delete");
								_this.importExcel.fileName = '点击选择文件';
								_this.refresh();
							} else {
								_this.$message({
									showClose: true,
									duration: 5000,
									message: response.data.msg,
									type: 'error'
								});
							}
						}).catch((res) => {
							console.log(res);
							_this.$message({
								showClose: true,
								duration: 5000,
								message: res.response.data.message || "导入失败，请联系管理员",
								type: 'error'
							});
						})
					};

					if(con) {
						this.$confirm(msg, '有重复超过三次的电话', {
								confirmButtonText: "确定提交",
								cancelButtonText: '返回修改',
								type: 'warning'
							})
							.then(_ => {
								batchImportStudent()
							})
							.catch(_ => {
								_this.importExcel.loading = false;
								_this.importExcel.modifyState = true;
							});
					} else {
						batchImportStudent();
					};

					//console.log(data);
					//					_this.importExcel.loading = false;
				}
			},
			//导入取消操作
			importCancel() {
				if(!this.importExcel.tbShow) {
					this.dialogShow.importExcel_show = false;
				} else {
					this.importExcel.tbShow = false
				}
			},
		}
	}
</script>

<style>
	h3 {
		color: #434A54;
	}

	.table_row td {
		white-space: nowrap !important;
	}
	/*导入*/

	.imp_table_bg {
		max-height: 50vh;
		overflow: auto;
		margin-bottom: 2em;
	}

	.imp_table_bg table thead {}

	.file_bg {
		padding: 2px 1em 2.5em 1em;
		border-bottom: 1px dashed #ddd;
	}

	span.file_name {
		display: flex;
		line-height: 35px;
		border: 1px solid #ddd;
		border-radius: 3px;
		cursor: pointer;
	}

	.file_btn {
		margin-left: 1em;
	}

	.file_chose {
		margin-top: 0em;
	}

	table.file_table>tbody>tr>td {
		padding: 0px;
		overflow-x: auto;
	}

	table.file_table>thead>tr>th:nth-child(7),
	table.file_table>thead>tr>th:nth-child(8),
	table.file_table>thead>tr>th:nth-child(9),
	table.file_table>tbody>tr>td:nth-child(7),
	table.file_table>tbody>tr>td:nth-child(8),
	table.file_table>tbody>tr>td:nth-child(9) {
		display: none;
	}

	.file_input {
		border: none;
		padding: 0.5em;
		width: 100%;
		outline: none;
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

	.otg_ul>li:hover,
	.otg_ul>li:visited {
		color: #475669;
	}
	/*search样式*/

	.search_dialog .el-dialog {
		min-width: 520px !important;
	}

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
	/*多选分配样式*/

	.optionSlc_bg {
		width: 30%;
		min-width: 120px;
	}

	li.distribution {
		margin: 0px 0px;
		border: none;
		height: 100%;
		padding-left: 0px;
		padding-top: 4px;
		/*position: relative;
		right: 40px;*/
	}

	.dsb_self {
		padding-left: 1em;
	}
</style>

var refresh = function() {
				this.loading = true;
				let stuName = this.search.search_stu;
				let salesName = this.search.search_sales;
				let deanName = this.search.search_dean;
				let stuState = JSON.parse(JSON.stringify(this.search.search_state));
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
				var pageSize = this.pageSize;
				var pageIndex = this.pageIndex;
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
					this.totalItemCount = totalItemCount;
					this.totalPageCount = totalPageCount;
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
						cache['咨询师'] = items[i].sales_name ? items[i].sales_name : "无";
						cache['教务'] = items[i].dean_name ? items[i].dean_name : "无";
						cache['创建时间'] = items[i].create_time.substring(0, 10) + "/" + items[i].create_time.substring(11, 16);
						cache['电话'] = items[i].phone;
						cache['加入时间'] = items[i].join_time ? items[i].jion_time.substring(0, 10) + "/" + items[i].jion_time.substring(11, 16) : "无";
						cache['最后修改时间'] = items[i].update_time ? items[i].update_time.substring(0, 10) + "/" + items[i].update_time.substring(11, 16) : "无";
						cache['最后跟进时间'] = items[i].lastrecord_time ? items[i].lastrecord_time.substring(0, 10) + "/" + items[i].lastrecord_time.substring(11, 16) : "暂无跟进";

						//							cache["密码"] = items[i].password;
						cache["来源"] = items[i].source;
						//							cache.sales_id = items[i].sales_id;
						//							cache.dean_id = items[i].dean_id;
						//							cache.sales_union_id = items[i].sales_union_id;
						cache["联合咨询师"] = items[i].sales_union_name;
						//							cache.dean_union_id = items[i].dean_union_id;
						cache["联合教务师"] = items[i].dean_union_name;
						//							cache.head_pic = items[i].head_pic;
						cache["余额"] = items[i].balance;
						cache["优惠"] = items[i].cash_coupon;
						cache["说明"] = items[i].description ? items[i].description : '';
						//							cache.create_by_id = items[i].create_by;
						//							cache.update_by_id = items[i].update_by;
						cache.student_id = items[i].id;

						this.tableData.push(cache);
					};

					this.loading = false;
				}).catch((res) => {
					this.loading = false;
					console.log(res);
					this.$message({
						showClose: true,
						message: '数据读取失败',
						type: 'error'
					});
				});
			},

export {refresh}
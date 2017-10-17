
$(function(){
	$(".page-container .page-sidebar ul.c-nav li").each(function(){
		var _title = $(this).children('a').attr('title');
		switch(_title){
			case '主页':
			$(this).children('a').attr('href','index.html');
			break;
			case '学员':
			$(this).children('a').attr('href','xueyuan.html');
			break;
			case '跟进':
			$(this).children('a').attr('href','genjin.html');
			break;
			case '报名':
			$(this).children('a').attr('href','baoming.html');
			break;
			case '班级':
			$(this).children('a').attr('href','class.html');
			break;
			case '记上课':
			$(this).children('a').attr('href','jishangke.html');
			break;
			case '员工':
			$(this).children('a').attr('href','yuangong.html');
			break;
			case '课程':
			$(this).children('a').attr('href','kecheng.html');
			break;
			case '科目':
			$(this).children('a').attr('href','kemu.html');
			break;
			case '校区':
			$(this).children('a').attr('href','xiaoqu.html');
			break;
			case '来源':
			$(this).children('a').attr('href','laiyuan.html');
			break;
		}
	})
})
$(document).ready(function() {
				var nav_h = $(window).height();
				$(".c-nav").css("min-height",nav_h + "px");
				$(window).resize(function(){
					var nav_ht = $(window).height();
				$(".c-nav").css("min-height",nav_ht + "px");
				})
			});


//表格页面的js开始
//表格页面的js开始

//		<!--全选checkbox开始-->
		
			$(document).ready(function() {
				$("tr td:first-child").click(function(e) {
					e.stopPropagation();
				});
				//消除checkbox父级点击事件影响
				$("#g-check-all").click(function(e) {
					if(this.checked) {
						$("td input[type='checkbox']").prop("checked", true);
						$("td input[type='checkbox']").parent().parent().addClass("active");
						$("fieldset").attr("disabled", false);
					} else {
						$("td input[type='checkbox']").prop("checked", false);
						$("td input[type='checkbox']").parent().parent().removeClass("active");
						$("fieldset").attr("disabled", true);
					};
					e.stopPropagation();
				});
				//全选事件
				$("tbody tr td input[type='checkbox']").click(function() {
					$("tbody tr td input[type='checkbox']:checked").each(function(i) {
						if(0 == i) {
							$("fieldset").attr("disabled", true);
						} else {
							$("fieldset").attr("disabled", false);
						};
					});
				});
				$("td input[type='checkbox']").each(function() {
					$(this).click(function() {
						if($(this).is(":checked")) {
							$(this).parent().parent().addClass("active");
						} else {
							$(this).parent().parent().removeClass("active");
						}
					})

				});
				//触发批量选项select的可编辑

				$("thead tr th:last-child").click(function() {
					$("#g-form-more").toggle();
				});
				$("#g-form-more").click(function(e) {
					e.stopPropagation();
				})
				//右边table的点击事件
				$("#g-form-more .form-group").each(function(i) {
					$(this).click(function(i) {
						if($(this).find("input").is(':checked') == true) {
							$(this).find("input").prop("checked", false);
						} else {
							$(this).find("input").prop("checked", true);
						};
					})
					$(this).find("input[type='checkbox']").click(function(i) {
						i.stopPropagation();
					})
				})
				//				点击group触发checkbox选中

				
			})
//		<!--全选checkbox结束-->




$(function() {
				var speed = 600;
				speed = speed - 100;
				var ht_0 = screen.height - 90;
				var wt_0 = $(window).width();
				$(".g-detail-bg").css({ "height": ht_0 + "px" });
				$(".g-detail").css({ "height": ht_0 + "px" });
				$(".g-detail-bg,.g-detail .panel .panel-footer .btn-default").click(function() {
		var wt_0 = $(window).width();
		var wt = $(".g-detail-bg").width();
		if(wt >= wt_0) {
			$(".g-detail-bg").fadeOut(speed);
			$(".g-detail").animate({ "width": '0px', "dispay": "none" }, speed);
		}
	});
	$("#g-detail-click tr").each(function() {
		$(this).click(function(e) {
			$(".g-detail-bg").fadeIn(speed);
			$(".g-detail").css("display", "table-cell").animate({ "width": '800px' }, speed);
			e.stopImmediatePropagation();
		})
	});
	$(window).resize(function() {
		var ht_1 = $(window).height();
		$(".g-detail .panel").css("height", ht_1 - 50 + "px")
	});
})
//頁面右側彈出結束


$(function() {
	$("#g-table-sub").click(function() {
		$("form#g-form-more").fadeOut(100);
		$("form#g-form-more .form-group").each(function(e) {
			var checkBox = $(this).find("input[type='checkbox']");
			if(checkBox.is(":checked") == true) {
				$("table#customers2 tr th").eq(e + 2).removeClass("hidden");
				$("table#customers2 tr td").eq(e + 2).removeClass("hidden");
			} else {
				$("table#customers2 tr th").eq(e + 2).addClass("hidden");
				$("table#customers2 tr td").eq(e + 2).addClass("hidden");
			}
		})
	})
	//点击修改表格
})

$(document).ready(function() {
	//				<!--添加DIV进行批量操作开始-->
	$("#customers2_length").after($("#g-select-form"));
	$("#g-select-form").css("display", "table-cell");
	//				<!--添加DIV进行批量操作结束-->
	//				给customers2_wrapper最低高度开始
	var height = screen.height/2;
	$("#customers2_wrapper").css("min-height", height + "px");
	//				给customers2_wrapper最低高度结束				
})

//这个是表格页面的js结束
//这个是表格页面的js结束


$(window).scroll(function() {
				var htLeft = $(".g-scroll-fixed").offset().top - $(window).scrollTop();
				var widthLeft = $(".g-scroll-fixed").width();
				var offset_1 = $("#g-fixed .panel").offset().top;
				var offset_2 = $("#g-fixed-list").offset().top;
				if(htLeft <= -50) {
					$("#g-fixed").addClass("g-fixed g-fixed-top-1");
					$("#g-fixed-list").addClass("g-fixed").css("top", offset_2 - offset_1 - 53 + "px");
					$("#g-fixed,#g-fixed-list").css("width", widthLeft / 3 + "px");
				} else {
					$("#g-fixed").removeClass("g-fixed g-fixed-top-1");
					$("#g-fixed-list").removeClass("g-fixed g-fixed-top-2").css("top", "")
				}
			});
//滑动滚轮事件，右边搜索div固定

$(function() {
	
				var _cla = $(".g-record").attr('class');
					var ht_p = $(".g-qh").parent().height();
					var ht_pt = $(".g-qh").offset().top;
					var ht_w = $(window).height();
					if(ht_p + ht_pt >= ht_w){
						$(".g-qh").parent().css("min-height",ht_w - ht_pt + 10 + "px")
					};
				$(".g-qh").click(function() {
					var speed = 200,
						speed = speed - 40;
					if($(".g-record").is(".col-sm-4")) {
						$(this).find("span.fa").addClass("fa-th").removeClass("fa-bars");
						$(".g-record").fadeOut(speed);
						$(".g-record").css("display", "none").removeClass("col-sm-4").addClass(_cla);
						$(".g-record").fadeIn(speed);
					} else {
						$(this).find("span.fa").addClass("fa-bars").removeClass("fa-th");
						$(".g-record").css("display", "none").removeClass(_cla).addClass("col-sm-4 g-record");
						$(".g-record").fadeIn(speed);
					}
				})
			})
//切换视图
$(function() {
				$(".col-xs-9 .g-record #g-toggle").each(function(i) {
					$(this).click(function(i) {
						var _toggle = $(this).find(".fa");
						var _toggle_text = $(this).find("#g-toggle-text");
						if(_toggle.is(".fa-eye")) {
							_toggle.removeClass("fa-eye").addClass("fa-eye-slash");
							_toggle_text.text("隐藏");
							$(this).css("color", "#EEE8D5");
						} else {
							_toggle.removeClass("fa-eye-slash").addClass("fa-eye");
							_toggle_text.text("显示");
							$(this).css("color", "#428bca");
						}
					})
				})
			});
			//“显示”“隐藏”切换
			
			
			
			
			
			
			
			

			



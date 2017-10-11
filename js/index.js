(function(mui, doc) {
	mui('.index').on('tap', '#submit', function() {
		var link = mui('#link')[0].value
		if(!link) {
			mui.toast('请粘贴电子发票链接！')
			return
		}
		submit(link)
	})

	mui('#link')[0].addEventListener('input', function () {
		var val = mui('#link')[0].value
		if (val) {
			mui('#submit')[0].disabled = false
		} else {
			mui('#submit')[0].disabled = true
		}
	})
	
	mui('.index').on('tap', '#tab-item-upload', function(e) {
		mui('.mui-title')[0].innerText = '上传发票'
	})
	mui('.index').on('tap', '#tab-item-list', function(e) {
		mui('.mui-title')[0].innerText = '我的发票'
	})
	function submit(link) {
		$http('app/bill/uploadUrl', {
			billUrl: link,
			financeId: getState('financeId')
		}, function(req) {
			if(req.res_code == 200) {
				alert('上传成功！')
				fetch(true)
				setTimeout(function() {
					mui('#tabbar')[0].classList.remove('mui-active')
					mui('#tabbar-with-chat')[0].classList.add('mui-active')
					mui('.mui-tab-item')[0].classList.remove('mui-active')
					mui('.mui-tab-item')[1].classList.add('mui-active')
					mui('.mui-title')[0].innerText = '我的发票'
					mui('#link')[0].value = ''
				}, 1500)
			} else alert(req.res_data ? req.res_data : '上传失败')
		}, function(xhr, type, errorThrown) {
			alert('上传失败！')
		})
	}

	var newMessTimer = null
	function newMessage () {
		clearTimeout(newMessTimer)
		newMessTimer = setTimeout(function () {
			$http('app/message/getCount', {}, function(req) {
				if(req.res_code == 200) {
					if (req.res_data == 1) {
						mui('#newMessage')[0].style.display = 'block'
					} else {
						mui('#newMessage')[0].style.display = 'none'
					}
				}
				// newMessage()
			}, function(xhr, type, errorThrown) {
				newMessage()
			})
		}, 3000)
	}

	mui.init({
//		statusBarBackground: "#509AFF",
		swipeBack: true,
		beforeback: function(){
			return false
		},
		pullRefresh: {
			container: '#pullrefresh',
			down: {
				callback: pulldownRefresh
			},
			up: {
				contentrefresh: '正在加载...',
				callback: pullupRefresh
			}
		}
	})
	var $pullrefresh = null
	mui.plusReady(function() {
		$pullrefresh = mui('#pullrefresh')
		var user = getState()
//		mui('#finance')[0].innerHTML = '财务主管：' + user.name + ' ' + user.financeId
		
		getFinanceUsers(0, function(html, data) {
			var html = ''
			mui.each(data, function(index, item) {
				if (user.financeId == item.id) {
					html = item.name
					return false
				}
			})
			mui('#finance')[0].innerHTML = '财务主管：' + html
		})
		newMessage()
	})

	/**
	 * 下拉刷新具体业务实现
	 */
	function pulldownRefresh() {
		fetch(true)
	}
	/**
	 * 上拉加载具体业务实现
	 */
	function pullupRefresh() {
		fetch()
	}

	var pageNo = 1
	var pageItem = 30
	var app = angular.module('myApp', [])
	var scope
	app.controller('myCtrl', function($scope) {
		$scope.data = {}
		$scope.hasData = false
		scope = $scope
		fetch(true)
	})

	function fetch(isDownRefresh) {
		isDownRefresh = isDownRefresh || false
		$http('app/bill/getMyBills', {
			pageNo: isDownRefresh ? 1 : pageNo,
			beginMoney:'',
			endMoney:'',
			beginDate:'',
			endDate:''
		}, function(req) {
			// 测试
//						req.res_data.list = [{
//								id: 1,
//								name: 'xx',
//								datetime: '2012-12-12',
//								money: 100,
//								isPrint: true
//							},
//							{
//								id: 2,
//								name: 'xx',
//								datetime: '2012-12-12',
//								money: 120,
//								isPrint: false
//							},
//							{
//								id: 3,
//								name: 'xx',
//								datetime: '2012-12-12',
//								money: 120,
//								isPrint: false
//							}
//						]
			if(req.res_code === 200 && req.res_data.list) {
				if(!isDownRefresh) pageNo++
					var list = {}
				mui.each(req.res_data.list, function(i, n) {
					list[n.id] = n
				})
				scope.$apply(function() {
					if(isDownRefresh) scope.data = mui.extend({}, list, scope.data)
					else scope.data = mui.extend({}, scope.data, list)
					var hasData = false
					mui.each(scope.data, function(i, n) {
						hasData = true
					})
					scope.hasData = hasData
				})
				endPullToRefresh(isDownRefresh)
				if(req.res_data.list.length < pageItem) {
					$pullrefresh.pullRefresh().endPullupToRefresh(true)
				}
			} else {
				if(req.res_code == 901) {
					mui.toast(req.res_data)
					toLogin()
					return false
				}
				endPullToRefresh(isDownRefresh)
			}
		}, function(xhr, type, errorThrown) {
			mui.toast('请求错误！')
			endPullToRefresh(isDownRefresh)
		})
	}

	function endPullToRefresh(isDownRefresh) {
		if(isDownRefresh) $pullrefresh.pullRefresh().endPulldownToRefresh()
		else $pullrefresh.pullRefresh().endPullupToRefresh(false)
	}

}(mui, document));
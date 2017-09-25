(function(mui, doc) {
	mui.init({
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
	});
	var $pullrefresh = null
	mui.plusReady(function() {
		$pullrefresh = mui('#pullrefresh')
	})
	var scope
	var pageNo = 1
	var pageItem = 10
	var app = angular.module('myApp', [])
	app.controller('myCtrl', function($scope) {
		$scope.data = {}
		$scope.hasData = true
		scope = $scope
		fetch(true)

		$scope.handleClick = function(item) {
			item.isRead = true
			var id = item.id
			$http('app/message/readMyMessage', {
				id: id
			}, function(req) {
				if(req.res_code === 200) {} else {}
			}, function(xhr, type, errorThrown) {})
		}
	})

	function fetch(isDownRefresh) {
		isDownRefresh = isDownRefresh || false
		$http('app/message/getMyMessages', {
			pageNo: isDownRefresh ? 1 : pageNo
		}, function(req) {
			if(req.res_code === 200) {
				if(!isDownRefresh) pageNo++
					var list = {}
				mui.each(req.res_data.list, function(i, n) {
					list[n.id] = n
				})

				scope.$apply(function() {
					if(isDownRefresh) scope.data = mui.extend({}, list, scope.data)
					else scope.data = mui.extend({}, scope.data, list)
				})

				endPullToRefresh(isDownRefresh)
				if(req.res_data.list.length < pageItem) {
					$pullrefresh.pullRefresh().endPullupToRefresh(true)
				}
			} else {
				endPullToRefresh(isDownRefresh)
			}
			setMessageRead()
		}, function(xhr, type, errorThrown) {
			mui.toast('请求错误！')
			endPullToRefresh(isDownRefresh)
		})
	}
	
	/**
	 * 设置消息为已读
	 */
	function setMessageRead () {
		$http('app/message/changeAll', {}, function(req) {
		}, function(xhr, type, errorThrown) {
		})
	}

	function endPullToRefresh(isDownRefresh) {
		if(isDownRefresh) $pullrefresh.pullRefresh().endPulldownToRefresh()
		else $pullrefresh.pullRefresh().endPullupToRefresh(false)
	}
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
}(mui, document));
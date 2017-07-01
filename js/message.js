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
		app.fetch()
	})

	var app = new Vue({
		el: '#list',
		data: function () {
			return {
				pageNo: 1,
				pageItem: 30,
				data: {}
			}
		},
		methods: {
			handleClick: function(item) {
				item.isRead = true
				var id = item.id
				$http('app/bill/readMyMessage', {
					id: id
				}, function(req) {
					if(req.res_code === 200) {} else {

					}
				}, function(xhr, type, errorThrown) {

				})
			},
			fetch: function (isDownRefresh) {
				isDownRefresh = isDownRefresh || false
				$http('app/message/getMyMessages', {
					pageNo: isDownRefresh ? 0 : this.pageNo
				}, function(req) {
					if(req.res_code === 200) {
						if(!isDownRefresh) app.pageNo++
						var list = {}
						mui.each(req.res_data.list, function(i,n){
							list[n.id] = n
						})
						app.data = mui.extend({}, app.data, list)
						app.endPullToRefresh(isDownRefresh)
						if(req.res_data.list.length < app.pageItem) {
							$pullrefresh.pullRefresh().endPullupToRefresh(true)
						}
					} else {
						app.endPullToRefresh(isDownRefresh)
					}
				}, function(xhr, type, errorThrown) {
					mui.toast('请求错误！')
					app.endPullToRefresh(isDownRefresh)
				})
			},
			endPullToRefresh (isDownRefresh) {
				if (isDownRefresh) $pullrefresh.pullRefresh().endPulldownToRefresh()
				else $pullrefresh.pullRefresh().endPullupToRefresh(false)
			}
		}
	})

	/**
	 * 下拉刷新具体业务实现
	 */
	function pulldownRefresh() {
		app.fetch(true)
	}
	/**
	 * 上拉加载具体业务实现
	 */
	function pullupRefresh() {
		app.fetch()
	}
}(mui, document));
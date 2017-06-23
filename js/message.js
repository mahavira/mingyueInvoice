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

	mui.plusReady(function() {
		fetchMessages(function(data) {
			mui.each(data, function(index, item) {
				mui('#list')[0].appendChild(parseDom(template('list-item', item)))
			})
		}, function() {})
	})

	var pageNo = 1
	var pageItem = 5
	var data = []

	function fetchMessages(success, error) {
		$http('app/message/getMyMessages', {
			pageNo: pageNo
		}, function(req) {
			if(req.res_code === 200) {
				pageNo++
				mui.extend(data, req.res_data.list)
				success(req.res_data.list)
				if(req.res_data.list.length < pageItem) {
					mui('#pullrefresh').pullRefresh().endPullupToRefresh(true)
				}
			} else {
				error()
			}
		}, function(xhr, type, errorThrown) {
			error()
		})
	}
	/**
	 * 下拉刷新具体业务实现
	 */
	function pulldownRefresh() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //refresh completed
		}, 1500);
	}
	/**
	 * 上拉加载具体业务实现
	 */
	function pullupRefresh() {
		fetchMessages(function(data) {
			mui.each(data, function(index, item) {
				mui('#list')[0].appendChild(parseDom(template('list-item', item)))
			})
			mui('#pullrefresh').pullRefresh().endPullupToRefresh(false)
		}, function() {
			mui.toast('请求错误！')
			mui('#pullrefresh').pullRefresh().endPullupToRefresh(false)
		})
	}
}(mui, document));
(function(mui, doc) {
	mui('.index').on('tap', '#submit', function() {
		var link = mui('#link')[0].value
		if(!link) {
			mui.toast('请粘贴电子发票链接！')
			return
		}
		submit(link)
	})

	function submit(link) {
		$http('app/bill/uploadUrl', {
			billUrl: link,
			financeId: getState('financeId')
		}, function(req) {
			if(req.res_code == 200) {
				mui.toast('上传成功！')
				app.fetch(true)
				setTimeout(function() {
					mui('#tabbar')[0].classList.remove('mui-active')
					mui('#tabbar-with-chat')[0].classList.add('mui-active')
					mui('.mui-tab-item')[0].classList.remove('mui-active')
					mui('.mui-tab-item')[1].classList.add('mui-active')
					mui('#link')[0].value = ''
				}, 1500)
			} else mui.toast(req.res_data ? req.res_data : '上传失败')
		}, function(xhr, type, errorThrown) {
			mui.toast('上传失败！')
		})
	}

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
	})
	var $pullrefresh = null
	mui.plusReady(function() {
		$pullrefresh = mui('#pullrefresh')
		var user = getState()
		mui('#finance')[0].innerHTML = '主管财务：' + user.name + ' ' + user.financeId
		app.fetch(true)
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

	var app = new Vue({
		el: '#list',
		data: function() {
			return {
				pageNo: 1,
				pageItem: 30,
				data: {}
			}
		},
		methods: {
			fetch: function(isDownRefresh) {
				isDownRefresh = isDownRefresh || false
				$http('app/bill/getMyBills', {
					pageNo: isDownRefresh ? 0 : this.pageNo
				}, function(req) {
					if(req.res_code === 200 && req.res_data.list) {
						if(!isDownRefresh) app.pageNo++
						var list = {}
						mui.each(req.res_data.list, function(i, n) {
							list[n.id] = n
						})
						app.data = mui.extend({}, app.data, list)
						app.endPullToRefresh(isDownRefresh)
						if(req.res_data.list.length < app.pageItem) {
							$pullrefresh.pullRefresh().endPullupToRefresh(true)
						}
					} else {
						if(req.res_code == 901) {
							mui.toast(req.res_data)
							toLogin()
							return false
						}
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

}(mui, document));
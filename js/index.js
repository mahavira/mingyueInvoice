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
	mui.plusReady(function() {
		var user = getState()
		mui('#finance')[0].innerHTML = '主管财务：' + user.name + ' ' + user.financeId
		fetchInvoices(function(data) {
			mui.each(data, function(index, item) {
				mui('#list')[0].appendChild(parseDom(template('list-item', item)))
			})
		}, function() {})

	})
	
	var pageItem = 5
	var pageNo = 0
	function fetchInvoices(success, error) {
		pageNo++
		$http('app/bill/getMyBills', {
			pageNo: pageNo
		}, function(req) {
			if(req.res_code == 200) {
				success(req.res_data.list)
				if(req.res_data.list && req.res_data.list.length < pageItem) {
					mui('#pullrefresh').pullRefresh().endPullupToRefresh(true)
				}
			} else {
				mui.toast(req.res_data)
				if (req.res_code == 901) {
					toLogin()
				}
				error()
			}
		}, function(xhr, type, errorThrown) {
			mui.toast('请求错误！')
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
		fetchInvoices(function(data) {
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
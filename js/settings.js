(function(mui, doc) {
	if(window.plus) {
		plusReady();
	} else {
		doc.addEventListener("plusready", plusReady, false);
	}
	var user = {}

	// 扩展API准备完成后要执行的操作
	function plusReady() {
		user = getState()
		getFinanceUsers(0, function(html) {
			mui('#financeId')[0].innerHTML = html
		})
		if (!user || !user.name) return
		mui('#name')[0].value = user.name
		mui('#email')[0].value = user.email
		mui('#financeId')[0].value = user.financeId
		mui('#company_id')[0].innerText = user.office.idCode || ''
		mui('#company_name')[0].innerText = user.office.name || ''
		mui('#mobile')[0].innerText = user.mobile || ''
		mui('#taxpayerIdNum')[0].innerText = user.office.taxpayerIdNum || ''
	}

	var urls = {
		name: 'app/user/updateUserName',
		email: 'app/user/updateEmail',
		financeId: 'app/user/updateUserFinance'
	}
	mui(".settings").on('tap', '#logout', toLogin)

	mui.each(urls, function(key, item) {
		mui("#" + key)[0].addEventListener('blur', function() {
			var val = mui('#' + key)[0].value
			if(getState(key) == val) return
			if(!val) {
				mui.toast('不可为空！')
				return
			}
			update(key, val)
		})
	})

	function update(key, val) {
		var fields = {
			id: user.id
		}
		fields[key] = val
		$http(urls[key], fields, function(req) {
			if(req.res_code === 200) {
				setState(fields)
				user[key] = val
				mui.toast('修改成功')
			} else {
				mui.toast(req.res_data ? req.res_data : '修改失败')
			}
		}, function(xhr, type, errorThrown) {
			mui.toast('修改失败')
		})
	}
}(mui, document));
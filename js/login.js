(function(mui, doc) {
	if(window.plus) {
		plusReady();
	} else {
		doc.addEventListener("plusready", plusReady, false);
	}

	// 扩展API准备完成后要执行的操作
	function plusReady() {
		var state = getState()
		if(state.token) {
			var mainPage = mui.preload({
				"id": 'index',
				"url": 'index.html'
			});
			mainPage.show("pop-in");
			plus.webview.currentWebview().close()
		}
	}
	var constraints = {
		username: {
			presence: {
				message: '请输入账号'
			}
		},
		password: {
			presence: {
				message: '请输入密码'
			},
			length: {
				minimum: 6,
				message: "密码不足6位数"
			}
		}
	};
	mui(".login").on('tap', '#submit', function() {
		window.backdrop('正在登录')
		$valids(constraints, function(attributes) {
			$http('app/login/login', attributes, function(req) {
				if(req.res_code === 200) {
					setState(req.res_data)
					swap('index')
				} else {
					mui.toast(req.res_data ? req.res_data : '登录失败')
				}
				window.backdrop('hide')
				console.log('login ok')
			}, function(xhr, type, errorThrown) {
				window.backdrop('hide')
				mui.toast('登录失败')
			})
		})
	})
}(mui, document));
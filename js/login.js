(function(mui, doc) {
	if(window.plus) {
		plusReady();
	} else {
		doc.addEventListener("plusready", plusReady, false);
	}

	// 扩展API准备完成后要执行的操作
	function plusReady() {
//		plus.navigator.setStatusBarBackground("#FFF")
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
		},
		remember: {}
	};
	
  var formValidate = {
    username: localStorage.getItem('remember:username') || '',
    password: localStorage.getItem('remember:password') || '',
    remember: localStorage.getItem('remember') ? true : false
  }
  mui('#username')[0].value = formValidate.username
  mui('#password')[0].value = formValidate.password
  mui('#remember')[0].checked = formValidate.remember
  
	mui(".login").on('tap', '#submit', function() {
		$valids(constraints, function(attributes) {
			window.backdrop('正在登录')
			attributes.remember = mui('#remember')[0].checked
			formValidate = attributes
			$http('app/login/login', attributes, function(req) {
				if(req.res_code === 200) {
					setState(req.res_data)
					
					if (attributes.remember) {
            localStorage.setItem('remember:username', attributes.username)
            localStorage.setItem('remember:password', attributes.password)
            localStorage.setItem('remember', 1)
          } else {
            localStorage.removeItem('remember:username')
            localStorage.removeItem('remember:password')
            localStorage.removeItem('remember')
          }

					swap('index')
//					plus.webview.currentWebview().close()
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
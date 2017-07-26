(function(mui, doc) {
	if(window.plus) {
		plusReady();
	} else {
		doc.addEventListener("plusready", plusReady, false);
	}
	// 扩展API准备完成后要执行的操作
	function plusReady() {}
	var constraints = {
		idCode: {
			presence: {
				message: '请输入企业ID'
			}
		},
		name: {
			presence: {
				message: '请输入表示名称'
			}
		},
		financeUserId: {
			presence: {
				message: '请输入主管财务'
			}
		},
		password: {
			presence: {
				message: '请输入登录密码'
			}
		},
		passwordAgain: {
			equality: {
				attribute: "password",
				message: "密码不一致"
			}
		},
		email: {
			presence: {
				message: '请输入Email'
			}
		}
	};
	getFinanceUsers(function(html){
		mui('#financeUserId')[0].innerHTML = html
	})

	mui(".register").on('tap', '#submit', function() {
		$valids(constraints, function(attributes) {
			var smsCode = getState('smsCode')
			var mobile = getState('mobile')
			attributes.roleType = 1
			mui.extend(attributes, {
				smsCode: smsCode,
				mobile: mobile
			})
			$http('app/login/register', attributes, function(req) {
				if(req.res_code === 200) {
					mui.toast('注册成功！')
					setTimeout(function() {
						swap('login')
					}, 1500)
				} else {
					mui.toast(req.res_data ? req.res_data : '注册失败')
				}
			}, function(xhr, type, errorThrown) {
				mui.toast('注册失败')
			});
		})
	})
}(mui, document));
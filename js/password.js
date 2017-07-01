(function(mui, doc) {
	var constraints = {
		mobile: {
			presence: {
				message: '请输入手机号码'
			},
			format: {
				pattern: /^1(3|4|5|7|8)\d{9}$/,
				message: "手机号码格式错误"
			}
		},
		smsCode: {
			presence: {
				message: '请输入手机验证码'
			}
		}
	};
	validate.Promise = Q.Promise;
	validate.validators.smscodeAsyncValidator = function(value, options, key, attributes) {
		var data = {
			smsCode: mui('#smsCode')[0].value,
			mobile: mui('#mobile')[0].value
		}
		setState(data)
		return new validate.Promise(function(resolve, reject) {
			$http('app/smsCode', data, function(data) {
				if(data.res_code === 200) resolve()
				else reject()
			}, function(xhr, type, errorThrown) {
				// 接口暂未提供
				//	 reject()
				resolve()
			})
		});
	};

	var mobile = ''
	var mobileIsUsable = true

	mui("#mobile")[0].addEventListener('blur', function() {
		mobile = mui('#mobile')[0].value
		if(!mobile) {
			return
		}
		$http('app/login/getUserByMobile', {
			mobile: mobile
		}, function(req) {
			if(req.res_code === 200 && req.res_data == "1") {
				mui.toast('该手机已经被注册')
				mobileIsUsable = false
			}
		})
	})

	mui(".password").on('tap', '#submit', function() {
		$valids(constraints, function() {
			validate.async({
				smsCode: mui('#smsCode')[0].value
			}, {
				smsCode: {
					smscodeAsyncValidator: true
				}
			}).then(function(res) {
				setTimeout(function() {
					swap('login')
				}, 1500)
			}, function() {
				mui.toast('验证码错误')
			});
		})
	})
}(mui, document));
(function(mui, doc) {
	if(window.plus) {
		plusReady();
	} else {
		doc.addEventListener("plusready", plusReady, false);
	}
	// 扩展API准备完成后要执行的操作
	function plusReady() {
		plus.navigator.setStatusBarBackground("#509AFF")
	}
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
				else resolve()
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

	mui(".register").on('tap', '#next', function() {
		$valids(constraints, function() {
			validate.async({
				smsCode: mui('#smsCode')[0].value
			}, {
				smsCode: {
					smscodeAsyncValidator: true
				}
			}).then(function(res) {
				setTimeout(function() {
					swap('register-info')
				}, 1500)
			}, function() {
				mui.toast('验证码错误')
			});
		})
	})
	
	var timer = null
	var countdownTime = 60
	var $getCode = mui('#getCode')[0]
	var $downCode = mui('#downCode')[0]
	function countdown () {
		countdownTime--
		if (countdownTime<0) {
			stopCountdown()
		} else {
			$downCode.innerText = countdownTime + 's'
			clearTimeout(timer)
			timer = setTimeout(countdown, 1000)
		}
	}
	function stopCountdown () {
		clearTimeout(timer)
		$getCode.style.display = 'inline-block'
		$downCode.style.display = 'none'
	}
	function startCountdown () {
		countdownTime = 60
		$getCode.style.display = 'none'
		$downCode.style.display = 'inline-block'
		$downCode.innerText = countdownTime + 's'
		timer = setTimeout(countdown, 1000)
	}
	mui(".register").on('tap', '#getCode', function() {
		mobile = mui('#mobile')[0].value
		if(!mobile) {
			mui.toast("请输入手机号码")
			return
		} else if (!/^1(3|4|5|7|8)\d{9}$/.test(mobile)) {
			mui.toast("手机号码格式错误")
			return 
		}
		startCountdown()
		$http('app/sms/sendSmsCode', {
			mobile: mobile
		}, function(req) {
			if(req.res_code !== 200) {
				mui.toast("发送错误")
				stopCountdown()
			}
		}, function(req) {
			stopCountdown()
		})
	})
	
}(mui, document));
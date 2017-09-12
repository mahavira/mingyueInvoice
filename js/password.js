(function(mui, doc) {
		if(window.plus) {
		plusReady();
	} else {
		doc.addEventListener("plusready", plusReady, false);
	}
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
		return new validate.Promise(function(resolve, reject) {
			$http('app/login/forgetPassword', data, function(data) {
				if(data.res_code === 200) resolve()
				else reject()
			}, function(xhr, type, errorThrown) {
				reject()
			})
		});
	};

	var isSubmit = false
	var mobileIsUsable = false
	mui(".password").on('tap', '#submit', function() {
		if (!mobileIsUsable) {
			mui.toast('该手机未注册')
			return 
		}
		if (isSubmit) return false
		isSubmit = true
		$valids(constraints, function() {
			var sBtn = mui('#submit')[0]
			sBtn.innerText = '正在请求中...'
			validate.async({
				smsCode: mui('#smsCode')[0].value
			}, {
				smsCode: {
					smscodeAsyncValidator: true
				}
			}).then(function(res) {
				mui('#passwordBox1')[0].style.display = 'none'
				mui('#passwordBox2')[0].style.display = 'block'
				isSubmit = false
				sBtn.innerText = '提交'
			}, function() {
				sBtn.innerText = '提交'
				mui.toast('验证码错误')
				isSubmit = false
			});
		})
	})
	
	mui("#mobile")[0].addEventListener('keyup', function() {
		var mobile = mui('#mobile')[0].value
		mobileIsUsable = false
		if(!mobile || !/^1(3|4|5|7|8)\d{9}$/.test(mobile)) {
			console.log(mobile)
			return
		}

		$http('app/login/getUserByMobile', {
			mobile: mobile
		}, function(req) {
			if(req.res_code === 200) {
				if(req.res_data == "0") {
					mui.toast('该手机未注册')
				} else {
					mobileIsUsable = true
				}
			}
		})
	})
	
	/**
	 * 倒计时
	 */
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
	mui(".password").on('tap', '#getCode', function() {
		var mobile = mui('#mobile')[0].value
		if(!mobile) {
			mui.toast("请输入手机号码")
			return
		} else if (!/^1(3|4|5|7|8)\d{9}$/.test(mobile)) {
			mui.toast("手机号码格式错误")
			return 
		}
		startCountdown()
		$http('app/sms/sendSmsCode', {
			mobile: mobile,
			type: 1
		}, function(req) {
			if(req.res_code !== 200) {
				mui.toast("发送错误")
				stopCountdown()
			}
		}, function(req) {
			stopCountdown()
		})
	})
	
	
	/**
	 * 修改密码
	 */
	var constraints2 = {
		password: {
			presence: {
				message: '请输入登录密码'
			},
			length: {minimum: 6,message: '密码至少6位'}
		},
		passwordAgain: {
			equality: {
				attribute: "password",
				message: "密码不一致"
			}
		}
	};
	mui(".password").on('tap', '#submit2', function() {
		$valids(constraints2, function(attributes) {
			if (isSubmit) return false
			isSubmit = true
			var sBtn = mui('#submit')[0]
			sBtn.innerText = '正在请求中...'
			$http('app/login/createPassword', {
				smsCode: mui('#smsCode')[0].value,
				mobile: mui('#mobile')[0].value,
				password: mui('#password')[0].value
			}, function(req) {
				isSubmit = false
				sBtn.innerText = '提交'
				if(req.res_code === 200) {
					mui.toast('修改成功！')
					setTimeout(function() {
						swap('login')
						mui('#passwordBox2')[0].style.display = 'none'
						mui('#passwordBox1')[0].style.display = 'block'
					}, 1500)
				} else {
					mui.toast(req.res_data ? req.res_data : '修改密码失败')
				}
			}, function(xhr, type, errorThrown) {
				isSubmit = false
				sBtn.innerText = '提交'
				mui.toast('修改密码失败')
			});
		})
	})
	
}(mui, document));
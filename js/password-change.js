(function(mui, doc) {
	if(window.plus) {
		plusReady();
	} else {
		doc.addEventListener("plusready", plusReady, false);
	}

	// 扩展API准备完成后要执行的操作
	function plusReady() {}
	var constraints = {
		oldPassword: {
			presence: {
				message: '请输入旧密码'
			},
			length: {
				minimum: 6,
				message: "密码不足6位数"
			}
		},
		newPassword: {
			presence: {
				message: '请输入新密码'
			},
			length: {
				minimum: 6,
				message: "密码不足6位数"
			}
		}
	};
	mui(".password-change").on('tap', '#submit', function() {
		$valids(constraints, function(attributes) {
			$http('app/user/updateUserPassword', attributes, function(req) {
				if(req.res_code === 200) {
					mui.toast('修改成功')
					setTimeout(mui.back, 1500)
				} else {
					mui.toast(req.res_data ? req.res_data : '修改失败')
				}
			}, function(xhr, type, errorThrown) {
				mui.toast('修改失败')
			})
		})
	})
}(mui, document));
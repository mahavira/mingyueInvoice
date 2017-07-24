(function(mui, doc) {
	console.log('-----')
	//取消浏览器的所有事件，使得active的样式在手机上正常生效
	doc.addEventListener('touchstart', function() {
		return false
	}, true)
	// 禁止选择
	doc.oncontextmenu = function() {
		return false
	}
	mui.init()
	// 扩展API是否准备好，如果没有则监听“plusready"事件
	if(window.plus) {
		plusReady()
	} else {
		doc.addEventListener("plusready", plusReady, false)
	}
	// 扩展API准备完成后要执行的操作
	function plusReady() {}
	
	var env = 'production' // development production
	/**
	 * api根路径
	 */
	window.baseUrl = env === 'production' ? 'http://120.92.45.7/project_dzff/' : 'http://localhost:3000/project_dzff/'

	/**
	 * 获取状态
	 * getState('key') 获取某个值
	 * getState() 获取所有
	 **/
	window.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		var state = JSON.parse(stateText)
		if(arguments.length > 0) {
			return state[arguments[0]]
		}
		return state
	}

	/**
	 * 设置状态
	 * setState(key, value) 设置某个值
	 * setState(data) 合并值
	 **/
	window.setState = function() {
		if(!arguments.length) return
		var state = getState()
		if(arguments.length === 1) {
			state = mui.extend(state, arguments[0])
		} else if(arguments.length > 1) {
			state[arguments[0]] = arguments[1]
		}
		console.log(JSON.stringify(state))
		//		alert(JSON.stringify(state))
		localStorage.setItem('$state', JSON.stringify(state));
	}
	/**
	 * 清除所有状态
	 **/
	window.clearState = function() {
		localStorage.setItem('$state', "{}");
	}

	window.parseDom = function(arg) {　　
		var objE = document.createElement("div")
		objE.innerHTML = arg
		return objE.firstElementChild
	}
	/**
	 * 转换页面
	 * @param {Object} id
	 */
	window.swap = function(id) {
		switch(id) {
			case 'x':
				break;
			default:
				openWindow(id)
				break;
		}
	}

	window.toLogin = function() {
		clearState()
		swap('login')
		plus.webview.currentWebview().close()
	}

	function openWindow(id) {
		mui.openWindow({

			url: id + '.html',
			show: {
				aniShow: 'pop-in'
			},
			preload: false,
			styles: {
				popGesture: 'hide'
			},
			waiting: {
				autoShow: false
			}
		})
	}

	/**
	 * 通用表单验证封装
	 * @param {Object} constraints 验证规则
	 * @param {Object} success
	 * @param {Object} error
	 */
	window.$valids = function(constraints, success, error) {
		var attributes = {}
		mui.each(constraints, function(index, item) {
			attributes[index] = mui('#' + index)[0].value
		})
		var vailds = validate(attributes, constraints, {
			fullMessages: false
		})
		if(vailds) {
			mui.each(vailds, function(index, item) {
				mui.toast(item[0])
				return false
			})
			if(error) error()
			return
		}
		if(success) success(attributes)
	}
	/**
	 * 通用接口请求封装
	 * @param {Object} url
	 * @param {Object} data
	 * @param {Object} success
	 * @param {Object} error
	 */
	window.$http = function(url, data, success, error) {
		data = mui.extend({
			id: getState('id')
		}, data)
		console.log('开始请求：' + baseUrl + url, JSON.stringify(data))

		mui.ajax(baseUrl + url, {
			data: data,
			headers: {
				token: getState('token')
			},
			dataType: 'json',
			type: 'POST',
			success: function(req) {
				console.log('请求success', JSON.stringify(req))
				success(req)
			},
			error: function(req) {
				console.log('请求error')
				error()
			}
		})
	}
	window.getFinanceUsers = function(callback) {
		$http('app/login/getFinanceUsers', {
			idCode: 1048577
		}, function(req) {
			if(req.res_code === 200) {
				var html = ''
				var financeId = getState('financeId')
				mui.each(req.res_data, function(index, item) {
					html += '<option value="' + item.id + '" ' + (financeId == item.id ? 'selected' : '') + '>' + item.name + '</option>'
				})
				callback(html)
			} else {

			}
		}, function(xhr, type, errorThrown) {

		});
	}
	window.backdrop = function(text) {
		if(text === 'hide') {
			mui('#backdrop')[0].style.display = 'none'
			return
		}
		if(!mui('#backdrop').length) {
			var html = '<div id="backdrop">' +
				'<div id="backdropBg" class="mui-popup-backdrop mui-active" style="background: rgba(0,0,0,0.1);"></div>' +
				'<div id="popup" class="mui-popup mui-popup-in" style="display: block;">' +
				'<div class="mui-popup-inner">' +
				'<i class="mui-icon mui-icon-spinner mui-spin rotate"></i>' +
				'<span id="popupText">' + (text ? text : '正在加载...') + '</span>' +
				'</div>' +
				'</div>' +
				'</div>'
			mui('body')[0].appendChild(parseDom(html))
		} else if(text) {
			mui('#popupText')[0].innerText = text
			mui('#backdrop')[0].style.display = 'block'
		}
	}

}(mui, document))
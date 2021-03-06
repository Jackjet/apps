Template.sogoWeb.onRendered ->
	console.log('sogoWeb.onRendered');
	unless Steedos.isNode()
		return
	auth = AccountManager.getAuth();
	webIframe = $("#sogo-web-iframe")
	webIframe.hide()
	count = 0
	webIframe.load ()->
		sogoWebURL = Meteor.settings.public.sogoWebURL
		if count == 0 and Steedos.isNode()
			chrome.cookies.remove({name:'0xHIGHFLYxSOGo',url:sogoWebURL})
			chrome.cookies.remove({name:'XSRF-TOKEN',url:sogoWebURL})
		count += 1
		console.log('sogo-web-iframe load....count...', count)
		loginForm = webIframe.contents().find("form[name=loginForm]")
		if loginForm.length > 0
			unless auth
				webIframe.show()
				return
			if count <= 2
				webIframe.hide()
			loginController = webIframe[0].contentWindow.loginController
			if loginController
				loginController.creds.username = auth.user
				loginController.creds.password = auth.pass
				loginController.creds.language = "ChineseChina"
				if count <= 2
					loginController.login()
					setTimeout ->
						if webIframe.contents().find("form[name=loginForm]")?.length
							webIframe.show()
					, 1500
			else
				webIframe.show()
				console.error "未找到sogo web的loginController，请确认sogo版本是否正确！"
		else
			webIframe[0].contentWindow.isSteedosNode = Steedos.isNode()
			webIframe.show()
			
			uid = FlowRouter.current()?.queryParams?.uid
			if uid
				# https://mail.steedos.cn/SOGo/so/yinlianghui@steedos.cn/Mail/view#!/Mail/0/INBOX/5
				sogoWebURL = Meteor.settings.public?.sogoWebURL
				inboxPath = "#{sogoWebURL}/so/#{auth.user}/Mail/view#!/Mail/0/INBOX/#{uid}"
				webIframe.attr "src", inboxPath
			
			# 弹出选人控件
			webIframe.contents().find("body").on 'click', '.btn-open-contacts', (event)->
				Modal.show("contacts_modal", { target: event.target });
			
			# 打开邮件附件
			webIframe.contents().find("body").on 'click', '.msg-attachment-link md-dialog-actions a.md-ink-ripple[target=_blank]', (event)->
				target = $(event.currentTarget)
				url = target.attr("href")
				fileName = target.parent().prev().find("p").attr("title")
				url = new URI(url, event.target.baseURI)
				console.log "sogo open file fileName=", fileName
				console.log "sogo open file url=", url
				domainUrl = Meteor.settings.public.sogoWebURL
				Steedos.downLoadFileWithProgress url, fileName, domainUrl
				return false
Template.sogoWeb.helpers
	webURL: ()->
		if !Meteor.settings.public?.sogoWebURL
			throw new Meteor.Error('缺少settings配置 public.sogoWebURL')
		return Meteor.settings.public?.sogoWebURL
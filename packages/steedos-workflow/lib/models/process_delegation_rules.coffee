db.process_delegation_rules = new Meteor.Collection('process_delegation_rules')

db.process_delegation_rules._simpleSchema = new SimpleSchema
	space:
		type: String
		optional: true
		autoform:
			type: "hidden"
			defaultValue: ->
				return Session.get("spaceId")

	# flow:
	# 	type: String,
	# 	autoform:
	# 		type: "select",
	# 		options: ->
	# 			options = []
	# 			selector = {}
	# 			selector.space = Session.get('spaceId')
	# 			objs = db.flows.find(selector, {fields: {name:1} })
	# 			objs.forEach (obj) ->
	# 				options.push
	# 					label: obj.name,
	# 					value: obj._id
	# 			return options

	from:
		type: String,
		optional: true
		autoform:
			omit: true

	from_name:
		type: String,
		autoform:
			type: "text"
			readonly: true
			defaultValue: ->
				return Meteor.user().name

	to:
		type: String,
		autoform:
			type: "selectuser"
			multiple: false

	to_name:
		type: String,
		optional: true
		autoform:
			omit: true

	enabled:
		type: Boolean
		optional: true
		defaultValue: false
		autoform:
			defaultValue: false

	start_time:
		type: Date
		autoform:
			type: "bootstrap-datetimepicker"
			dateTimePickerOptions: ()->
				opt = { format: "YYYY-MM-DD HH" }
				if Meteor.isClient
					opt.locale = Session.get("TAPi18n::loaded_lang")
				return opt
	end_time:
		type: Date
		autoform:
			type: "bootstrap-datetimepicker"
			dateTimePickerOptions: ()->
				opt = { format: "YYYY-MM-DD HH" }
				if Meteor.isClient
					opt.locale = Session.get("TAPi18n::loaded_lang")
				return opt

if Meteor.isClient
	db.process_delegation_rules._simpleSchema.i18n("process_delegation_rules")


db.process_delegation_rules.attachSchema(db.process_delegation_rules._simpleSchema)

db.process_delegation_rules.helpers
	flow_name: ()->
		f = db.flows.findOne({_id: this.flow}, {fields: {name: 1}})
		return f && f.name

if Meteor.isServer
	db.process_delegation_rules._ensureIndex({
		"space": 1
	},{background: true})
	db.process_delegation_rules._ensureIndex({
		"enabled": 1
		"end_time": 1
	},{background: true})


if Meteor.isServer
	db.process_delegation_rules.allow
		insert: (userId, doc) ->
			return userId and db.space_users.find({space: doc.space, user: userId}).count() > 0 and db.process_delegation_rules.find({space: doc.space, from: userId}).count() is 0

		update: (userId, doc, fieldNames, modifier) ->
			return userId and doc.from is userId

		remove: (userId, doc) ->
			return userId and doc.from is userId

		fetch: ['from']

	db.process_delegation_rules.before.insert (userId, doc) ->
		if doc.start_time >= doc.end_time
			throw new Meteor.Error(400, "process_delegation_rules_start_must_lt_end")

		doc.created_by = userId
		doc.created = new Date()
		doc.from = userId
		doc.to_name = db.space_users.findOne({space: doc.space, user: doc.to}, {fields: {name: 1}})?.name

	db.process_delegation_rules.before.update (userId, doc, fieldNames, modifier, options) ->

		modifier.$set = modifier.$set || {}

		if modifier.$set.start_time >= modifier.$set.end_time
			throw new Meteor.Error(400, "process_delegation_rules_start_must_lt_end")

		modifier.$set.modified = new Date()

		if userId
			modifier.$set.modified_by = userId
			modifier.$set.from_name = db.space_users.findOne({space: doc.space, user: userId}, {fields: {name: 1}})?.name

		if modifier.$set.to
			modifier.$set.to_name = db.space_users.findOne({space: doc.space, user: modifier.$set.to}, {fields: {name: 1}})?.name

	db.process_delegation_rules.after.update (userId, doc, fieldNames, modifier, options) ->
		# 撤销委托
		if (this.previous.enabled is true and doc.enabled is false) or doc.end_time <= new Date()
			uuflowManager.cancelProcessDelegation(this.previous.space, this.previous.to)

	db.process_delegation_rules.after.remove (userId, doc) ->
		if doc.enabled
			uuflowManager.cancelProcessDelegation(doc.space, doc.to)

new Tabular.Table
	name: "process_delegation_rules",
	collection: db.process_delegation_rules,
	columns: [
		{
			data: "from_name"
		}
		{
			data: "to_name"
		}
		{
			data: "enabled"
			render: (val, type, doc) ->
				return if doc.enabled then TAPi18n.__("instance_approve_read_yes") else TAPi18n.__("instance_approve_read_no")
		}
		{
			data: "start_time"
			render: (val, type, doc) ->
				return moment(doc.start_time).format('YYYY-MM-DD HH')
		}
		{
			data: "end_time"
			render: (val, type, doc) ->
				return moment(doc.end_time).format('YYYY-MM-DD HH')
		}
	]
	dom: "tp"
	lengthChange: false
	ordering: false
	pageLength: 10
	info: false
	extraFields: ["space","from","to"]
	searching: true
	autoWidth: false
	changeSelector: (selector, userId) ->
		unless userId
			return {_id: -1}
		return selector
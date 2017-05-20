Template.forward_select_flow_modal.helpers({
	title: function() {
		if (this.action_type == "forward") {
			return TAPi18n.__('instance_forward_title');
		} else if (this.action_type == "distribute") {
			return TAPi18n.__('instance_distribute_title');
		}
	},

	note: function() {
		if (this.action_type == "forward") {
			return TAPi18n.__('instanceForwardNote');
		} else if (this.action_type == "distribute") {
			return TAPi18n.__('instance_distribute_note');
		}
	},

	take_attachments: function() {
		if (this.action_type == "forward") {
			return TAPi18n.__('isForwardAttachments');
		} else if (this.action_type == "distribute") {
			return TAPi18n.__('instance_distribute_attachments');
		}
	},

	user_context: function() {
		var data = {
			dataset: {
				showOrg: true,
				multiple: true,
				spaceId: Session.get('forward_space_id')
			},
			name: 'forward_select_user',
			atts: {
				name: 'forward_select_user',
				id: 'forward_select_user',
				class: 'selectUser form-control'
			}
		}

		return data
	},


	// 判断是转发还是分发
	is_show_selectuser: function() {
		if (this.action_type == "forward") {
			return false;
		} else if (this.action_type == "distribute") {
			if (InstanceManager.isInbox()) {
				var cs = InstanceManager.getCurrentStep();
				if (cs && (cs.allowDistribute == true))
					return true;
			}
		}

		return false;
	},

	selectuser_title: function(action_type) {
		var users_title = "";
		if (this.action_type == "forward") {
			users_title = TAPi18n.__('instance_forward_users');
		} else if (this.action_type == "distribute") {
			users_title = TAPi18n.__('instance_distribute_users');
		};
		return users_title;
	}

})

Template.forward_select_flow_modal.onRendered(function() {
	if (!Session.get('forward_space_id') && Session.get('spaceId')) {
		Session.set('forward_space_id', Session.get('spaceId'));
	}
})


Template.forward_select_flow_modal.events({
	'click #forward_help': function(event, template) {
		var action_type = template.data.action_type;
		if (action_type == "forward") {
			Steedos.openWindow(t("forward_help"));
		} else if (action_type == "distribute") {
			Steedos.openWindow(t("forward_help"));
		}

	},

	'click #forward_flow_ok': function(event, template) {
		var action_type = template.data.action_type;
		var flow = $("#forward_flow")[0].dataset.flow;

		if (!flow)
			return;

		var values = $("#forward_select_user")[0].dataset.values;
		var selectedUsers = values ? values.split(",") : [];

		if (action_type == 'forward') {
			selectedUsers = [Meteor.userId()];
		}

		if (_.isEmpty(selectedUsers)) {
			toastr.error(TAPi18n.__("instance_forward_error_users_required"));
			return;
		}

		InstanceManager.forwardIns(Session.get('instanceId'), Session.get('forward_space_id'), flow, $("#saveInstanceToAttachment")[0].checked, $("#forward_flow_text").val(), $("#isForwardAttachments")[0].checked, selectedUsers, action_type);
		Modal.hide(template);
	},

	'click #forward_flow': function(event, template) {
		Modal.allowMultiple = true;
		Modal.show("selectFlowModal", {
			onSelectFlow: function(flow) {
				var forward_select_user = $("#forward_select_user")[0];

				// 切换了space
				if (Session.get('forward_space_id') != flow.space) {
					Session.set('forward_space_id', flow.space);
					forward_select_user.dataset.spaceId = flow.space;
				}

				// 切换了流程
				if ($("#forward_flow")[0].dataset.flow != flow._id) {
					$("#forward_flow")[0].dataset.flow = flow._id;
					$("#forward_flow").val(flow.name);
					forward_select_user.value = '';
					forward_select_user.dataset.values = '';

					var flow = db.flows.findOne({
						_id: flow._id
					}, {
						fields: {
							distribute_optional_users: 1
						}
					});

					var users = flow.distribute_optional_users || [];
					if (!_.isEmpty(users)) {
						forward_select_user.dataset.userOptions = _.pluck(users, "id").toString();
						forward_select_user.dataset.showOrg = false;
					} else {
						delete forward_select_user.dataset.userOptions;
						delete forward_select_user.dataset.showOrg;
					}
				}

			},
			action_type: template.data.action_type
		});
	}

})
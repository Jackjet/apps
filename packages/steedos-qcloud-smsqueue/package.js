Package.describe({
	name: 'steedos:qcloud-smsqueue',
	version: '0.0.2',
	summary: 'qcloud smsqueue',
	documentation: null,
	git: ''
});

Npm.depends({
	"superagent": "3.5.2",
	"sha256": "0.2.0"
});

Package.onUse(function(api) {
	api.versionsFrom('1.0');

	api.use([
		'raix:eventstate@0.0.2',
		'check',
		'mongo',
		'underscore',
		'ejson',
		'random',
		'coffeescript'
	]);

	api.use('mongo', 'server');

	api.use('steedos:smsqueue@0.0.1');

	// Common api
	api.addFiles([
		'lib/common/main.js',
	], ['server']);

	// Common api
	api.addFiles([
		'lib/common/sms.js'
	], ['server']);

	// API's
	api.addFiles('lib/server/api.js', 'server');

	// STARTUP
	api.addFiles('server/startup.coffee', 'server');

	// api.export('QcloudSMSQueue', ['server']);

});

Package.onTest(function(api) {

});
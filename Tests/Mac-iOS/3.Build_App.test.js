'use strict';

const
	fs = require('fs'),
	path = require('path'),
	assert = require('assert'),
	tiapp = require('ti-appium');
// MochaFilter = require('mocha-filter')(global.filters);

const app = require('../../Config/Test_Config.js').app;

describe('Build App For Virtual Device', () => {
	it('Build the Application', async () => {
		const
			appRoot = path.join(global.projRoot, 'Build', 'Mac-iOS', 'App', app.name);

		await tiapp.buildApp(appRoot, 'ios');

		const
			appPath = tiapp.createAppPath(appRoot, 'ios', app.name),
			logPath = path.join(appRoot, 'build', 'build_iphone.log');

		assert(fs.existsSync(appPath), 'App file doesn\'t exist');
		assert(fs.existsSync(logPath), 'Log file doesn\'t exist');

		let data = fs.readFileSync(logPath, 'utf-8');

		const
			lines = data.trim().split('\n'),
			lastLine = lines.slice(-1)[0];

		assert(lastLine.includes('Project built successfully'), 'Build log doesn\'t show success');
	});
});

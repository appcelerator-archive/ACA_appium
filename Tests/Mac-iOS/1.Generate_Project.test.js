'use strict';

const
	fs = require('fs'),
	path = require('path'),
	assert = require('assert'),
	tiapp = require('ti-appium');
	// MochaFilter = require('mocha-filter')(global.filters);

const
	app = require('../../Config/Test_Config.js').app,
	appc = require('../../Config/Test_Config.js').appc;

describe('Generate Project', () => {
	it('Generate a New Project', async () => {
		const
			appRoot = path.join(global.projRoot, 'Build', 'Mac-iOS', app.name),
			tiappPath = path.join(appRoot, 'tiapp.xml');

		const args = [ 'new', '--quiet', '--no-banner', '--no-prompt', '--classic' ];

		args.push('--name', app.name);
		args.push('--id', app.package);
		args.push('--type', 'app');
		args.push('--project-dir', appRoot);
		args.push('--username', appc.user);
		args.push('--password', appc.pass);
		args.push('--org-id', appc.org);

		await tiapp.appcRun(args);

		assert(fs.existsSync(tiappPath), 'Couldn\'t find a tiapp.xml for the generated app');
	});
});

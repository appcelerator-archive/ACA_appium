'use strict';

const
	path = require('path'),
	tiapp = require('ti-appium');
// MochaFilter = require('mocha-filter')(global.filters);

const app = require('../../Config/Test_Config.js').app;
const device = require('../../Config/Test_Config.js').iosSim;

describe('iOS Simulator Test', () => {
	before(async () => {
		const
			appRoot = path.join(global.projRoot, 'Build', 'Mac-iOS', 'App', app.name),
			appPath = tiapp.createAppPath(appRoot, 'ios', app.name);

		await tiapp.startClient({
			app: appPath,
			platformName: 'iOS',
			deviceName: device.name,
			platformVersion: device.version
		});
	});

	after(async () => {
		await tiapp.stopClient();

		await tiapp.killSimulator();
	});

	it('Crash the application', async () => {
		await global.driver
			.elementById('JAVASCRIPT')
			.click()
			.sleep(1000)
			.elementById('CONTINUE')
			.click()
			.sleep(1000)
			.elementById('NATIVE')
			.click()
			.elementById('CONTINUE')
			.isDisplayed().should.become(true);
	});
});

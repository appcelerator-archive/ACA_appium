'use strict';

const
	path = require('path'),
	tiapp = require('ti-appium');
// MochaFilter = require('mocha-filter')(global.filters);

const app = require('../../Config/Test_Config.js').app;
const device = require('../../Config/Test_Config.js').androidEm;

describe('Android Studio Emulator Test', () => {
	before(async () => {
		const
			appRoot = path.join(global.projRoot, 'Build', 'Mac-Android', 'App', app.name),
			appPath = tiapp.createAppPath(appRoot, 'android', app.name);

		await tiapp.bootEmulator(device.name);

		await tiapp.startClient({
			app: appPath,
			platformName: 'Android',
			deviceName: device.name,
			platformVersion: device.version,
			appPackage: app.package,
			appActivity: app.activity
		});
	});

	after(async () => {
		await tiapp.stopClient();

		await tiapp.killEmulator(device.name);
	});

	it('Crash the application', async () => {
		await global.driver
			.elementByAndroidUIAutomator('new UiSelector().text("JAVASCRIPT")')
			.click()
			.elementByAndroidUIAutomator('new UiSelector().text("Continue")')
			.click()
			.elementByAndroidUIAutomator('new UiSelector().text("Continue")')
			.click()
			.elementByAndroidUIAutomator('new UiSelector().text("NATIVE")')
			.click()
			.elementByAndroidUIAutomator('new UiSelector().text("Continue")')
			.click()
			.elementByAndroidUIAutomator('new UiSelector().text("Continue")')
			.isDisplayed().should.become(true);
	});
});

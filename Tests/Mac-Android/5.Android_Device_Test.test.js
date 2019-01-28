'use strict';

const
	Appium = require('../../Helpers/Appium_Helper.js');

describe('Android Device Test', () => {
	after(async () => {
		await Appium.stopClient('androidDevice');
	});

	before(async () => {
		await Appium.startClient('androidDevice');
	});

	it('Crash the application', async () => {
		await global.driver
			.elementByAndroidUIAutomator('new UiSelector().text("JAVASCRIPT")')
			.click()
			.elementByAndroidUIAutomator('new UiSelector().text("Continue")')
			.click()
			.elementByAndroidUIAutomator('new UiSelector().text("NATIVE")')
			.click()
			.elementByAndroidUIAutomator('new UiSelector().text("Continue")')
			.isDisplayed().should.become(true);
	});
});

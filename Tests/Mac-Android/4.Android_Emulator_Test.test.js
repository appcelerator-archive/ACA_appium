'use strict';

const
	Appium = require('../../Helpers/Appium_Helper.js');

describe('Android Studio Emulator Test', () => {
	after(async () => {
		await Appium.stopClient('emulator');
	});

	before(async () => {
		await Appium.startClient('emulator');
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

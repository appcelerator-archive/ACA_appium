'use strict';

const
	Appium = require('../../Helpers/Appium_Helper.js');

describe('iOS Device Test', () => {
	after(async () => {
		await Appium.stopClient('iosDevice');
	});

	before(async () => {
		await Appium.startClient('iosDevice');
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

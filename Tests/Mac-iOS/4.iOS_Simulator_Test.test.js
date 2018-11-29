'use strict';

const
	Appium = require('../../Helpers/Appium_Helper.js');

describe('iOS Simulator Test', () => {
	after(async () => {
		await Appium.stopClient('simulator');
	});

	before(async () => {
		await Appium.startClient('simulator');
	});

	it('Click the "Hello World" Text in the App', async () => {
		await global.driver
			.elementById('JAVASCRIPT')
			.click()
			.elementById('Continue')
			.click()
			.elementById('NATIVE')
			.click()
			.elementById('Continue')
			.isDisplayed().should.become(true);
	});
});

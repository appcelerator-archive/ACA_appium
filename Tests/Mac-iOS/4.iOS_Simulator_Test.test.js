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
			.elementById('Hello, World')
			.click()
			.elementById('OK')
			.isDisplayed().should.become(true);
	});
});

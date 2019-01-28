'use strict';

const
	assert = require('assert'),
	Appc = require('../../Helpers/Appc_Helper.js');

describe('Build App For Device', () => {
	it('Build the Application', async () => {
		await Appc.buildApp('iosDevice');

		assert.equal(Appc.checkBuiltApp('iosDevice'), true);
	});
});

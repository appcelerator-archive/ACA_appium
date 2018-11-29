'use strict';

const
	assert = require('assert'),
	Appc = require('../../Helpers/Appc_Helper.js');

describe('Build App For Simulator', () => {
	it('Build the Application', async () => {
		await Appc.buildApp('simulator');

		assert.equal(Appc.checkBuiltApp('simulator'), true);
	});
});

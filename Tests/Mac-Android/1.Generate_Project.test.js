'use strict';

const
	assert = require('assert'),
	Appc = require('../../Helpers/Appc_Helper.js');

describe('Generate Project', () => {
	it('Generate a New Project', async () => {
		await Appc.newApp();

		assert(Appc.checkGeneratedApp(), 'App generation checks failed. Please check logs');
	});
});

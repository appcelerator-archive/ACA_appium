'use strict';

const
	Appc = require('../../Helpers/Appc_Helper.js');

describe('Copy test file to created app', () => {
	it('Copy test file to created app', async () => {

		await Appc.copyTestApp();

	});
});

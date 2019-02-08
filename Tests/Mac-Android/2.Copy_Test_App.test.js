'use strict';

const
	helper = require('../../Helpers/Helper.js');
// MochaFilter = require('mocha-filter')(global.filters);

describe('Copy test file to created app', () => {
	it('Copy test file to created app', async () => {

		helper.copyTestApp('Mac-Android');
	});
});

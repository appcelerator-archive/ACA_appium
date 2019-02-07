'use strict';

const
	helper = require('../../Helpers/Helper.js');

describe('Copy test file to created app', () => {
	it('Copy test file to created app', async () => {

		helper.copyTestApp('Mac-iOS');
	});
});

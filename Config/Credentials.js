'use strict';

// NOTE: PLEASE DON'T COMMIT SENSITIVE DATA, THIS IS A PUBLIC REPO

exports.appc = {
	org: '100000675',
	username: process.env.APPCUSER,
	password: process.env.APPCPASS
};

exports.keystore = {
	name: 'AppiumSmokeKeystore',
	alias: 'AppiumSmoke',
	password: 'Monkeylord'
};

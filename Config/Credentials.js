'use strict';

// NOTE: PLEASE DON'T COMMIT SENSITIVE DATA, THIS IS A PUBLIC REPO

// Used in the Zephyr helper for publishing results to JIRA
// NOTE: These should be credentials for the Appcelerator
//       JIRA instance and not the Axway JIRA
exports.jira = {
	username: process.env.JIRAUSER,
	password: process.env.JIRAPASS
};

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

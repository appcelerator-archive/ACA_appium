'use strict';

exports.iosSim = {
	name: 'iPhone 7',
	version: '12.1'
};

exports.androidEm = {
	name: 'android-23-x86',
	version: '6.0'
};

exports.app = {
	apiLevel: '28',
	name: 'AppiumSmoke',
	package: 'com.appc.appiumsmoke',
	activity: '.AppiumsmokeActivity'
};

exports.appc = {
	user: process.env.APPCUSER,
	pass: process.env.APPCPASS,
	org: '100000675'
};

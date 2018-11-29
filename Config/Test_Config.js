'use strict';

exports.iosDevice = {
	platform: 'iOS',
	platVersion: '12.0',
	deviceName: 'GANDALF',
	udid: process.env.IPHONEUDID
};

exports.simulator = {
	platform: 'iOS',
	platVersion: '12.1',
	deviceName: 'iPhone 7'
};

exports.androidDevice = {
	apiLevel: '28',
	platform: 'Android',
	platVersion: '8.0',
	deviceName: 'Nexus 5X',
	deviceId: process.env.ANDROIDID,
	appPackage: 'com.appc.appiumsmoke',
	appActivity: '.AppiumsmokeActivity'
};

exports.emulator = {
	deviceName: 'android-23-x86',
	platVersion: '6.0',
	platform: 'Android',
	appPackage: 'com.appc.appiumsmoke',
	appActivity: '.AppiumsmokeActivity',
	apiLevel: '28'
};

exports.genymotion = {
	deviceName: 'Samsung Galaxy S8 - 8.0 - API 26 - 1440x2960',
	platVersion: '8.0',
	platform: 'Android',
	appPackage: 'com.appium.appiumsmoke',
	appActivity: '.AppiumsmokeActivity'
};

exports.app = {
	name: 'AppiumSmoke',
	packageName: 'com.appc.appiumsmoke'
};

exports.mod = {
	name: 'appiumsmokemodule',
	packageName: 'com.appc.appiumsmokemodule',
	version: '1.0',
	author: 'appc',
	copyright: 'Copyright Appcelerator',
	licence: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur auctor risus sed odio eleifend, eu vestibulum eros volutpat. Integer consequat.',
	description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur scelerisque finibus elit ut ultrices. Phasellus aliquet ligula quis tempor pretium.'
};

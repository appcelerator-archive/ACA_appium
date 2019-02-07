'use strict';

const
	path = require('path'),
	fs = require('fs-extra'),
	tiapp = require('ti-appium'),
	program = require('commander');

const appc = require('../Config/Test_Config.js').appc;

program
	.option('-p, --platforms <platform1,platform2>', 'List the platforms that you want to run the suite for. Defaults to \'ios\' and \'android\'.', 'android,ios')
	.option('-l, --logging <level>', 'Set the amount of Output returned by the process, options are \'debug\' and \'basic\'. Defaults to \'basic\'.', 'basic')
	.option('-A, --address <ip>', 'The IP address for where the Appium server is. Defaults to localhost', 'localhost')
	.option('-P, --port <port>', 'The port that the Appium server will run on. Defaults to 4723', 4723)
	.option('-c, --cli <cli_version>', 'CLI version to test against. Defaults to latest', 'latest')
	.option('-s, --sdk <sdk_version>', 'SDK version to test against. Defaults to latest', 'latest')
	.option('-f, --force', 'Force rebuild applications.')
	.parse(process.argv);

// The root of the project
global.projRoot = path.join(__dirname, '..');
// Get the Appium settings from the input flags
global.appcCLI = program.cli;

global.appcSDK = program.sdk;

// Validate that the passed platforms passed are valid
const
	platforms = program.platforms.split(','),
	suppPlatforms = [ 'ios', 'android' ];

platforms.forEach(platform => {
	if (!suppPlatforms.includes(platform)) {
		tiapp.error(`'${platform}' is not a valid platform.`);
		process.exit();
	}
});

// Set the host value to the current OS being run on
let host;

switch (process.platform) {
	case 'darwin':
		global.hostOS = 'Mac';
		host = 'Mac';
		break;

	case 'win32':
		global.hostOS = 'Windows';
		host = 'Windows';
		break;

	default:
		throw Error('Running on an unsupported OS');
}

const appcConf = {
	username: appc.user,
	password: appc.pass,
	organisation: appc.org,
	cli: program.cli,
	sdk: program.sdk
};

async function run() {
	try {
		await tiapp.appcSetup(appcConf, 'production');
		await tiapp.startAppium(global.projRoot, { hostname: program.address, port: program.port });
	} catch (err) {
		tiapp.error(err);
	}
	for (const platform of platforms) {
		let guest;

		switch (platform) {
			case 'ios':
				guest = 'iOS';
				break;

			case 'android':
				guest = 'Android';
				break;
		}

		const
			appcRoot = path.join(global.projRoot, 'Build', `${host}-${guest}`),
			testPath = path.join(global.projRoot, 'Tests', `${host}-${guest}`),
			packageRoot = path.join(appcRoot, 'Package'),
			moduleRoot = path.join(appcRoot, 'Module'),
			appRoot = path.join(appcRoot, 'App');

		fs.emptyDirSync(appcRoot);
		fs.ensureDirSync(packageRoot);
		fs.ensureDirSync(moduleRoot);
		fs.ensureDirSync(appRoot);

		await tiapp.test(testPath, global.projRoot);
	}

	try {
		await tiapp.stopAppium();
	} catch (err) {
		tiapp.error(err);
	}
}
run();

'use strict';

const
	path = require('path'),
	program = require('commander'),
	Appc = require('../Helpers/Appc_Helper.js'),
	Mocha = require('../Helpers/Mocha_Helper.js'),
	Output = require('../Helpers/Output_Helper.js'),
	Appium = require('../Helpers/Appium_Helper.js'),
	Device = require('../Helpers/Device_Helper.js');
program
	.option('-p, --platforms <platform1,platform2>', 'List the platforms that you want to run the suite for. Defaults to \'iOS\' and \'Android\'.', 'iOS,Android')
	.option('-l, --logging <level>', 'Set the amount of Output returned by the process, options are \'debug\' and \'basic\'. Defaults to \'basic\'.', 'basic')
	.option('-A, --address <ip>', 'The IP address for where the Appium server is. Defaults to localhost', 'localhost')
	.option('-P, --port <port>', 'The port that the Appium server will run on. Defaults to 4723', 4723)
	.option('-c, --cli <cli_version>', 'CLI version to test against. Defaults to latest', 'latest')
	.option('-s, --sdk <sdk_version>', 'SDK version to test against. Defaults to latest', 'latest')
	.option('-f, --force', 'Force rebuild applications.')
	.parse(process.argv);

// Logging option for Output helper
global.logging = program.logging;
// The root of the project
global.projRoot = path.join(__dirname, '..');
// Get the Appium settings from the input flags
global.server = {
	host: program.address,
	port: program.port
};
global.appcCLI = program.cli;
global.appcSDK = program.sdk;

// Setup the logging directory for this run
Output.setupLogDir(err => {
	if (err) {
		console.error(`An error occured setting up the logging directory!: ${err}`);
		process.exit();
	}
});

// Set the global for the hostOS to the current OS being run on
switch (process.platform) {
	case 'darwin':
		global.hostOS = 'Mac';
		break;

	case 'win32':
		global.hostOS = 'Windows';
		break;
}

// TODO: Cater for new SIGINT requirements
// If the process is killed in the console, force close all test devices
process.on('SIGINT', () => {
	Device.quickKill();
	process.exit();
});

// Validate that the platforms passed are valid
let
	platforms = {},
	suppPlatforms = [ 'iOS', 'Android' ];

program.platforms.split(',').forEach(platform => {
	if (!suppPlatforms.includes(platform)) {
		Output.error(`'${platform}' is not a valid platform.`);
		process.exit();
	} else {
		platforms[platform] = {
			cycleId: undefined
		};
	}
});

// The promise chain for setting up suite services
Promise.resolve()
	// Log that the suite is starting up
	.then(() => Output.banner('Starting and Configuring Suite Services'))
	// Login and auth with the Appc CLI
	.then(() => Appc.login('production'))
	// Install the required CLI version
	.then(() => Appc.installCLI())
	// Install the required SDK version
	.then(() => Appc.installSDK())
	// Retrieve the installed version
	.then(value => global.appcSDK = value)
	// Start an Appium server
	.then(() => Appium.runAppium())
	// Handle errors
	.catch(err => {
		Output.error(err);
		// Shutdown the Appium server, as process.exit() will leave it running
		return Appium.quitServ()
			.then(() => process.exit());
	})
	// Launch the platform specific build and test
	.then(() => platformRun())
	.catch(err => Output.error(err))
	// Notify that the suite is finished
	.then(() => Output.banner('All Tests Run, Closing Down Services'))
	// Kill the Appium server
	.then(() => Appium.quitServ())
	.catch(err => Output.error(err));

/*******************************************************************************
 * The Appium run portion of the tests. This step goes through each required
 * platform, builds the app and launches it into its respective
 * emulator/simulator for the mocha test to run against. Then once the tests
 * have run tears itself down again.
 ******************************************************************************/
function platformRun() {
	return new Promise(resolve => {
		let p = Promise.resolve();

		suppPlatforms.forEach(platform => {
			if (!Object.keys(platforms).includes(platform)) {
				return;
			}

			p = p
				// Set the global property for platformOS
				.then(() => global.platformOS = platform)
				// Display information for the test that is about to be conducted
				.then(() => Output.banner(`Running For Platform '${platform}'`))
				// Create the build directory
				.then(() => Output.setupBuildDir())
				// Run the Mocha test suite with the specified test file
				.then(() => Mocha.mochaTest())
				// // If fail is thrown then the next app starts to run, we don't want that if we're still waiting on more platforms
				.catch(error => Output.error(error))
				// Clear the platformOS from the globals
				.then(() => delete global.platformOS);
		});

		p.then(() => resolve());
	});
}


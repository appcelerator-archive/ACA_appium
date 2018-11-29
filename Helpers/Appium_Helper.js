'use strict';

const
	os = require('os'),
	wd = require('wd'),
	chai = require('chai'),
	path = require('path'),
	ioslib = require('ioslib'),
	Appc = require('./Appc_Helper.js'),
	spawn = require('child_process').spawn,
	Device = require('./Device_Helper.js'),
	Output = require('./Output_Helper.js'),
	exec = require('child_process').execSync,
	chaiAsPromised = require('chai-as-promised'),
	app = require('../Config/Test_Config.js').app;

class Appium_Helper {
	/*****************************************************************************
	 * Starts a WD session on the device, using the given capability requirements
	 * as Appium configuration
	 *
	 * @param {String} platform - The platform that is about to be launched
	 ****************************************************************************/
	static startClient(platform) {
		return new Promise(async (resolve, reject) => {
			Output.info('Starting WebDriver Instance... ');

			let
				cap,
				capabilities = require('../Config/Test_Config.js')[platform];

			try {
				cap = {
					app: Appc.genAppPath(platform),
					platformName: capabilities.platform,
					platformVersion: capabilities.platVersion,
					deviceName: capabilities.deviceName,
					appPackage: capabilities.appPackage,
					appActivity: capabilities.appActivity
				};
			} catch (err) {
				// Do nothing
			}

			switch (platform) {
				case 'iosDevice':
					let
						xcodeOrg,
						developerCerts = (await ioslib.certs.getCerts()).distribution;

					developerCerts.forEach(cert => {
						if (cert.name.match(/Michael Asher \(\w{10}\)/)) {
							xcodeOrg = (cert.name.match(/\(\w{10}\)/)[0]).substr(1).slice(0, -1);
						}
					});

					cap.xcodeOrgId = xcodeOrg;
					cap.udid = capabilities.udid;
					cap.xcodeSigningId = 'iPhone Developer';
					cap.updatedWDABundleId = 'com.appc.webdriveragentrunner';

				case 'simulator':
					cap.automationName = 'XCUITest';
					break;

				case 'emulator':
					if (platform === 'emulator') {
						await Device.launchEmu(cap.deviceName, platform);
					}

				case 'genymotion':
					if (platform === 'genymotion') {
						await Device.launchGeny(cap.deviceName, platform);
					}

				case 'androidDevice':
					cap.deviceReadyTimeout = 60;
					cap.automationName = 'Appium';
					break;

				case 'Mac':
					cap = {
						app: 'Xcode',
						deviceName: 'Mac',
						platformName: 'Mac'
					};
					break;
			}

			// Sets the amount of time Appium waits before shutting down in the background
			cap.newCommandTimeout = (60 * 10);

			// Enabling chai assertion style: https://www.npmjs.com/package/chai-as-promised#node
			chai.use(chaiAsPromised);
			chai.should();

			// Enables chai assertion chaining
			chaiAsPromised.transferPromiseness = wd.transferPromiseness;

			// Establish the testing driver
			let driver = wd.promiseChainRemote(global.server);

			global.driver = driver;
			global.webdriver = wd;

			driver.init(cap, err => {
				(err) ? reject(err) : Output.finish(resolve, null);
			});
		});
	}

	/*****************************************************************************
	 * Stops the WD session, but first it closes and removes the app from the
	 * device, to attempt to save storage space
	 ****************************************************************************/
	static async stopClient(platform) {
		Output.info('Stopping WebDriver Instance... ');

		const driver = global.driver;

		if (driver) {
			switch (platform) {
				case 'iosDevice':
				case 'simulator':
					await driver.closeApp();
					await driver.removeApp(app.packageName);
					await driver.quit();
					await Device.killSim();
					break;

				case 'androidDevice':
				case 'genymotion':
				case 'emulator':
					await driver.closeApp();
					await driver.removeApp(app.packageName);
					await driver.quit();
					await Device.quickKill();
					break;

				case 'Mac':
					exec('pkill Xcode');
					await driver.quit();
					break;

				default:
					await driver.quit();
					break;
			}

			delete global.driver;
		}
	}

	/*****************************************************************************
	 * Launch an Appium server for the mobile testing, as it cannot use the
	 * desktop session
	 ****************************************************************************/
	static runAppium() {
		return new Promise((resolve, reject) => {
			// Retreive the server properties
			const server = global.server;

			Output.info(`Starting Appium Server On '${server.host}:${server.port}'... `);
			// We only want to allow starting a server on the local machine
			const validAddresses = [ 'localhost', '0.0.0.0', '127.0.0.1' ];

			if (validAddresses.includes(server.host)) {
				let exe;

				switch (os.platform()) {
					case 'darwin':
						exe = 'appium';
						break;

					case 'win32':
						exe = 'appium.cmd';
						break;
				}

				let
					appiumExe = path.join(__dirname, '..', 'node_modules', '.bin', exe),
					flags = [ '--log-no-colors', '-a', server.host, '-p', server.port, '--show-ios-log' ];

				const appiumServer = spawn(appiumExe, flags, {
					shell: true
				});

				appiumServer.stdout.on('data', output => {
					const line = output.toString().trim();

					const
						regStr = `started on ${server.host}\\:${server.port}$`,
						isRunning = new RegExp(regStr, 'g').test(line);

					if (isRunning) {
						global.appiumServer = appiumServer;

						Output.finish(resolve, null);
					}
				});

				appiumServer.stderr.on('data', output => {
					reject(output.toString());
				});

				appiumServer.on('error', err => {
					reject(err.stack);
				});
			} else {
				reject('Connecting to an External Appium Server is Not Currently Supported');
			}
		});
	}

	/*****************************************************************************
	 * Tells the Appium server to shut down
	 ****************************************************************************/
	static async quitServ() {
		Output.info('Stopping Appium Server... ');

		if (global.appiumServer) {
			await global.appiumServer.kill();

			delete global.appiumServer;
		}

		Output.finish();
	}
}

module.exports = Appium_Helper;

'use strict';

const
	path = require('path'),
	fs = require('fs-extra'),
	ioslib = require('ioslib'),
	spawn = require('child_process').spawn,
	Output = require('./Output_Helper.js'),
	exec = require('child_process').execSync,
	testConf = require('../Config/Test_Config.js'),
	credentials = require('../Config/credentials.js');

const
	appc = credentials.appc,

	app = testConf.app,

	testDevices = {
		emulator: testConf.emulator,
		simulator: testConf.simulator,
		iosDevice: testConf.iosDevice,
		genymotion: testConf.genymotion,
		androidDevice: testConf.androidDevice
	};

class Appc_Helper {
	/*****************************************************************************
	 * Login to the Appcelerator CLI using the login command.
	 *
	 * @param {String} env - The Appcelerator environment to login to.
	 ****************************************************************************/
	static async login(env) {
		Output.info('Logging into the Appcelerator CLI... ');

		if (!env) {
			env = 'production';
		}

		Output.log('Logging Out of the Appcelerator CLI');
		await exec('appc logout');

		Output.log(`Setting Appcelerator Environment to ${env}`);
		await exec(`appc config set defaultEnvironment ${env}`);

		Output.log('Logging Into the Appcelerator CLI');
		let loginReturn = await exec(`appc login --username ${appc.username} --password ${appc.password} -O ${appc.org} --no-prompt`).toString();

		if (loginReturn.includes('Login required to continue') || loginReturn.includes('Invalid username or password')) {
			throw Error('Error During Appc CLI Login');
		} else {
			Output.finish();
		}
	}

	/*****************************************************************************
	 * Take the passed SDK, and attempt to install it. If it is a straight defined
	 * SDK, then install it. Otherwise if it is a branch, get the latest version
	 * of it
	 ****************************************************************************/
	static installSDK() {
		return new Promise((resolve, reject) => {
			let
				sdk,
				cmd = 'appc',
				args = [ 'ti', 'sdk', 'install', '-b', global.appcSDK, '-d', '--no-prompt', '--username', appc.username, '--password', appc.password, '-O', appc.org ],
				error = false;

			let
				foundStr,
				installStr = /successfully installed!/;

			if ((global.appcSDK.split('.')).length > 1) {
				Output.info(`Installing Titanium SDK '${global.appcSDK}'... `);

				foundStr = /is already installed!/;

				// Remove the branch flag if downloading a specific SDK
				let index = args.indexOf(args.find(element => element === '-b'));

				args.splice(index, 1);
			} else {
				Output.info(`Installing Titanium SDK From '${global.appcSDK}'... `);

				foundStr = /is currently the newest version available\./;
			}

			const prc = spawn(cmd, args, {
				shell: true
			});

			prc.stdout.on('data', data => {
				Output.debug(data, 'debug');
				if (data.toString().match(installStr)) {
					sdk = data.toString().match(/\w+\.\w+\.\w+\.\w+/)[0];
				}
				if (data.toString().match(foundStr)) {
					sdk = data.toString().match(/\w+\.\w+\.\w+\.\w+/)[0];
				}
			});
			prc.stderr.on('data', data => {
				Output.debug(data, 'debug');
				// Appc CLI doesn't provide an error code on fail, so need to monitor the output and look for issues manually
				// If statement is there so that [WARN] flags are ignored on stderr
				if (data.toString().includes('[ERROR]')) {
					error = true;
				}
			});
			prc.on('exit', code => {
				if (code !== 0 || error === true) {
					reject('Error installing Titanium SDK');
				} else {
					try {
						// If the SDK was already installed, the -d flag will have been ignored
						exec(`appc ti sdk select ${sdk}`);

						Output.finish(resolve, sdk);
					} catch (err) {
						reject(err);
					}
				}
			});
		});
	}

	/*****************************************************************************
	 * Install the latest version of the required CLI version for testing
	 ****************************************************************************/
	static async installCLI() {
		Output.info(`Installing CLI Version '${global.appcCLI}'... `);
		try {
			exec(`appc use ${global.appcCLI}`, {
				stdio: [ 0 ]
			});
		} catch (err) {
			if (err.toString().includes(`The version specified ${global.appcCLI} was not found`)) {
				// Go to the pre-production environment
				await this.login('preproduction');

				// Check if the CLI version we want to use is installed
				Output.log(`Checking if the Latest Version of ${global.appcCLI} is Installed`);
				const
					clis = JSON.parse(exec('appc use -o json --prerelease')),
					latest = clis.versions.find(element => element.includes(global.appcCLI)),
					installed = clis.installed.includes(latest);

				if (!latest) {
					throw (new Error(`No Version Found For CLI ${global.appcCLI}`));
				}

				// If not, install it and set it as default
				if (installed) {
					Output.log(`Latest Already Installed, Selecting ${latest}`);
				} else {
					Output.log(`Latest Not Installed, Downloading ${latest}`);
				}

				exec(`appc use ${latest}`);

				// Return to the production environment
				await this.login('production');
			}
		}

		Output.finish();
	}

	/*****************************************************************************
	 * Creates the application
	 *
	 * We check if there is already an application in the specified folder
	 * Apps/<OS>-<Platform> and wipe the directory, the log file is created to
	 * track the output of the Appc CLI
	 ****************************************************************************/
	static newApp() {
		return new Promise((resolve, reject) => {
			Output.info('Generating New App... ');

			const
				rootPath = this.genRootPath('App'),
				logFile = path.join(rootPath, '..', 'appc_new.log');

			let
				cmd = 'appc',
				error = false,
				args = [ 'new', '-n', app.name, '--id', app.packageName, '-t', 'app', '-d', rootPath, '-q', '--no-banner', '--no-prompt', '-f', '--classic', '--username', appc.username, '--password', appc.password, '-O', appc.org ];

			const prc = spawn(cmd, args, {
				shell: true
			});

			prc.stdout.on('data', data => {
				Output.debug(data, 'debug');
				fs.appendFileSync(logFile, data);
			});

			prc.stderr.on('data', data => {
				Output.debug(data, 'debug');
				fs.appendFileSync(logFile, data);
				// Appc CLI doesn't provide an error code on fail, so need to monitor the output and look for issues manually
				// If statement is there so that [WARN] flags are ignored on stderr
				if (data.toString().includes('[ERROR]')) {
					error = true;
				}
			});

			prc.on('exit', code => {
				if (code !== 0 || error === true) {
					reject('Failed on appc new');
				} else {
					// Load in the tiapp.xml of the newly generated project
					const
						filePath = path.join(rootPath, 'tiapp.xml'),
						tiapp = require('tiapp.xml').load(filePath);
					// Generate a 3 point version of the SDK being used
					let sdk = tiapp.sdkVersion.split('.').slice(0, 3).join('.');
					// Rearrange our generated timestamp for this run
					let
						tmArr = global.timestamp.split(/[-,_,꞉]+/),
						time = `${tmArr[2].slice(-2)}${tmArr[0]}${tmArr[1]}${tmArr[3]}${tmArr[4]}`;
					// Write this value to the tiapp again to ensure accuracy
					tiapp.version = `${sdk}.${time}`;
					tiapp.write();

					Output.finish(resolve, null);
				}
			});
		});
	}
	/*****************************************************************************
	 * Checks that the application has been created successfully
	 ****************************************************************************/
	static checkGeneratedApp() {
		const
			rootPath = this.genRootPath('App'),
			logPath = path.join(rootPath, '..', 'appc_new.log'),
			filePath = path.join(rootPath, 'tiapp.xml');

		let error = false;

		if (fs.existsSync(logPath)) {
			let data = fs.readFileSync(logPath, 'utf-8'),
				tiapp = require('tiapp.xml').load(filePath);
			// Checks if Tiapp and specified SDK matches
			if (tiapp.sdkVersion !== global.appcSDK) {
				error = true;
				Output.error('SDK specified and SDK in Tiapp.xml do not match');
			}
			let modules = tiapp.getModules();
			// TODO: Add windows wantedModules.
			const wantedModules = [
				{ id: 'com.soasta.touchtest', platform: 'iphone' },
				{ id: 'com.soasta.touchtest', platform: 'android' },
				{ id: 'ti.cloud', platform: 'commonjs' },
				{ id: 'com.appcelerator.apm', platform: 'android' },
				{ id: 'com.appcelerator.apm', platform: 'iphone' },
				{ id: 'hyperloop', platform: 'iphone' },
				{ id: 'hyperloop', platform: 'android' }
			];

			try {
				require('chai').expect(wantedModules).to.have.deep.members(modules);
			} catch (expected) {
				error = true;
				Output.error(expected);
			}

			const generated = data.includes('Project created successfully in') && data.includes('*** new completed. ***');

			if (generated && !error) {
				return true;
			}
		} else {
			return false;
		}
	}
	/*****************************************************************************
	 * Copies the test app.js to the created app.js
	 ****************************************************************************/
	static copyTestApp() {
		return new Promise((resolve, reject) => {
			const
				rootPath = this.genRootPath('App'),
				filePath = path.join(rootPath, 'Resources', 'app.js'),
				testApp = path.join(global.projRoot, 'Config', 'Support', 'app.js');

			readFilePromise(testApp)
				.then(data => fs.writeFile(filePath, data))
				.then(Output.finish(resolve, null))
				.catch(e => reject(e));

		});
	}
	/*****************************************************************************
	 * Builds the required application
	 *
	 * [FIXME]: Had to remove the error listener in the build step due to an error
	 *					being thrown for not having crash analytics enabled. Either remove
	 *					it from the capability of all apps to be tested, or find a way to
	 *					build with no services that doesn't throw an error at runtime.
	 ****************************************************************************/
	static buildApp(platform) {
		return new Promise(async (resolve, reject) => {
			Output.info('Building Application... ');

			let
				error = false,
				rootPath = this.genRootPath('App');

			let
				cmd = 'appc',
				args = [ 'run', '--build-only', '--platform', global.platformOS.toLowerCase(), '-d', rootPath, '-f', '--no-prompt', '--username', appc.username, '--password', appc.password, '-O', appc.org ];

			switch (platform) {
				case 'iosDevice':
					args.push('-V', await getCert(), '-P', await getUUID());

				case 'androidDevice':
					args.push('-T', 'device');
					break;

				case 'simulator':
					args.push('-T', 'simulator');
					break;

				case 'emulator':
				case 'genymotion':
					args.push('-T', 'emulator');
					break;
			}

			const prc = spawn(cmd, args, {
				shell: true
			});
			prc.stdout.on('data', data => {
				Output.debug(data, 'debug');
			});
			prc.stderr.on('data', data => {
				Output.debug(data, 'debug');
				// Appc CLI doesn't provide an error code on fail, so need to monitor the output and look for issues manually
				// If statement is there so that [WARN] flags are ignored on stderr
				// if(data.toString().includes('[ERROR]')) error = true;
			});
			prc.on('exit', code => {
				(code !== 0 || error === true) ? reject('Failed on application build') : Output.finish(resolve, null);
			});
		});
	}

	/*****************************************************************************
	 * See if there is already a built application in the application folder.
	 * If one does exist, then check the build log to make sure that the last
	 * build was successful.
	 ****************************************************************************/
	static checkBuiltApp(platform) {
		let log;

		if (global.platformOS === 'iOS') {
			log = 'iphone';
		}

		if (global.platformOS === 'Android') {
			log = 'android';
		}

		let
			rootPath = this.genRootPath('App'),
			appPath = this.genAppPath(platform),
			logPath = path.join(rootPath, 'build', `build_${log}.log`);

		if (fs.existsSync(appPath) && fs.existsSync(logPath)) {
			// If the application exists, check that it was a successful build from the log
			let data = fs.readFileSync(logPath, 'utf-8');

			const
				lines = data.trim().split('\n'),
				lastLine = lines.slice(-1)[0];

			data = data.replace(/ /g, '');

			const built = lastLine.includes('Project built successfully');

			return built;
		} else {
			return false;
		}
	}
	/*****************************************************************************
	 * Build a path to the location of the built app, dependant on platform
	 ****************************************************************************/
	static genAppPath(platform) {
		const rootPath = this.genRootPath('App');

		switch (platform) {
			case 'iosDevice':
				return path.join(rootPath, 'build', 'iphone', 'build', 'Products', 'Debug-iphoneos', `${app.name}.app`);

			case 'simulator':
				return path.join(rootPath, 'build', 'iphone', 'build', 'Products', 'Debug-iphonesimulator', `${app.name}.app`);

			case 'androidDevice':
			case 'emulator':
			case 'genymotion':
				return path.join(rootPath, 'build', 'android', 'bin', `${app.name}.apk`);

			default:
				if (global.platformOS === 'iOS') {
					return path.join(rootPath, 'build', 'iphone', 'build', 'Products', 'Debug-iphonesimulator', `${app.name}.app`);
				} else if (global.platformOS === 'Android') {
					return path.join(rootPath, 'build', 'android', 'bin', `${app.name}.apk`);
				}
		}
	}

	/*****************************************************************************
	 * Generate a path to the root of the application directory
	 ****************************************************************************/
	static genRootPath() {

		return path.join(global.projRoot, 'Build', `${global.hostOS}-${global.platformOS}`, 'App', app.name);
	}
}

/*******************************************************************************
 * Retrieve the name of the certificate for the QE Department
 ******************************************************************************/
async function getCert() {
	let
		certificate,
		developerCerts = (await ioslib.certs.getCerts()).developer;

	developerCerts.forEach(cert => {
		if (cert.name.match(/QE Department \(\w{10}\)/)) {
			certificate = `"${cert.name}"`;
		}
	});

	return certificate;
}

/*******************************************************************************
 * Retrieve the UUID of the app development provisioning profile
 ******************************************************************************/
async function getUUID() {
	let
		uuid,
		provisioningProfiles = (await ioslib.provisioning.getProvisioningProfiles()).development;

	provisioningProfiles.forEach(profile => {
		if (profile.name === 'Any App Development') {
			uuid = profile.uuid;
		}
	});

	return uuid;
}
/*******************************************************************************
 * Read file
 ******************************************************************************/
async function readFilePromise(filename) {
	return new Promise((resolve, reject) => {
		fs.readFile(filename, 'utf8', (err, data) => {
			if (err) { reject(err); } else { resolve(data); }
		});
	});
}

module.exports = Appc_Helper;

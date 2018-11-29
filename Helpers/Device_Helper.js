'use strict';

const
	path = require('path'),
	childProcess = require('child_process'),
	Output = require('./Output_Helper.js');

class Device_Helper {
	/*****************************************************************************
	 * Launch the emulator specified in the Test_Config.js for the current test
	 *
	 * @param {String} devName - The name of the AVD emulator used for testing
	 ****************************************************************************/
	static launchEmu(devName, platform) {
		return new Promise(resolve => {
			Output.info(`Launching Android device '${devName}'... `);

			if (global.androidPID) {
				Output.skip(resolve, null);
			} else {
				const
					cmd = path.join(process.env.ANDROID_HOME, 'emulator', 'emulator'),
					args = [ '-avd', devName, '-wipe-data' ];

				const prc = childProcess.spawn(cmd, args);

				global.androidPID = prc.pid;

				checkBooted(platform).then(() => {
					return Output.finish(resolve, null);
				});
			}
		});
	}

	/*****************************************************************************
	 * Kill all the iOS simulators using the killall command
	 ****************************************************************************/
	static killSim() {
		return new Promise(resolve => {
			Output.info('Shutting Down the iOS Simulator... ');

			childProcess.execSync('xcrun simctl shutdown booted');

			// Whilst the above does kill the simulator, it can leave processes running, so just nuke it after a period for safe shutdown
			setTimeout(() => {
				childProcess.spawn('killall', [ 'Simulator' ]);
				Output.finish(resolve, null);
			}, 5000);
		});
	}

	/*****************************************************************************
	 * Kill all the test simulators and emulators in the event of SIGINT.
	 ****************************************************************************/
	static quickKill() {
		delete global.androidPID;
		if (global.hostOS === 'Mac') {
			childProcess.spawn('xcrun', [ 'simctl', 'shutdown', 'booted' ]);
			childProcess.spawn('pkill', [ '-9', 'qemu-system-i386' ]);
			childProcess.spawn('pkill', [ '-9', 'player' ]);
		}
		if (global.hostOS === 'Windows') {
			childProcess.spawn('tskill', [ 'qemu-system-i386' ]);
			childProcess.spawn('tskill', [ 'player' ]);
		}
	}
}

/*******************************************************************************
 * Validate to see if there is a process running for this emulator.
 ******************************************************************************/
function checkBooted(platform) {
	return new Promise((resolve) => {
		let cmd = (platform === 'emulator') ? 'adb -e shell getprop init.svc.bootanim' : 'adb -d shell getprop init.svc.bootanim';
		const interval = setInterval(() => {
			childProcess.exec(cmd, function (error, stdout, stderr) {

				if (stdout.toString().indexOf('stopped') > -1) {
					clearInterval(interval);
					Output.info(`${platform} Booted`);
					resolve(true);
				}
				if (stderr) {
					Output.error(stderr);
				}
				if (error) {
					Output.error(error);
				} else {
					Output.info(`${platform} still Booting`);
				}
			});
		}, 1000);
	});
}

module.exports = Device_Helper;

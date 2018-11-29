'use strict';

const
	path = require('path'),
	fs = require('fs-extra');

// Colours to be used in the console logging
const
	Red = '\x1b[31m',
	Grey = '\x1b[37m',
	Reset = '\x1b[0m',
	Green = '\x1b[32m',
	Yellow = '\x1b[33m';

class Output_Helper {
	/*****************************************************************************
	 * Writes a green done to the console and resolves the promise if passed
	 *
	 * @param {Function} done - Promise callback passed from the function
	 ****************************************************************************/
	static finish(done, value) {
		appendLog('basic', 'Done\n', false);
		if (!global.testing && global.logging === 'basic') {
			process.stdout.write(`${Green}Done${Reset}\n`);
		}

		if (done) {
			done(value);
		}
	}

	/*****************************************************************************
	 * Writes a yellow skip to the console and resolves the promise if passed
	 *
	 * @param {Function} done - Promise callback passed from the function
	 ****************************************************************************/
	static skip(done, value) {
		appendLog('basic', 'Skipping\n', false);
		if (!global.testing && global.logging === 'basic') {
			process.stdout.write(`${Yellow}Skipping${Reset}\n`);
		}

		if (done) {
			done(value);
		}
	}

	/*****************************************************************************
	 * Writes a message with a green info tag (note no new line is passed by
	 * default)
	 *
	 * @param {String} message - A string to be output after the info tag
	 ****************************************************************************/
	static info(message) {
		appendLog('basic', `[INFO] ${sanatise(message)}`, true);
		appendLog('debug', `[INFO] ${sanatise(message)}\n`, true);
		if (!global.testing) {
			if (global.logging === 'basic') {
				process.stdout.write(`${Green}[INFO]${Reset} ${message}`);
			} else {
				process.stdout.write(`${Green}[INFO]${Reset} ${message}\n`);
			}
		}
	}

	/*****************************************************************************
	 * Outputs all of a string in red
	 *
	 * @param {String} message - String to be output
	 ****************************************************************************/
	static error(message) {
		appendLog('basic', `\n[ERROR] ${sanatise(message)}\n`, true);
		appendLog('debug', `[ERROR] ${sanatise(message)}\n`, true);
		if (!global.testing) {
			if (global.logging === 'basic') {
				process.stdout.write(`\n${Red}[ERROR] ${message}${Reset}\n`);
			} else {
				process.stdout.write(`${Red}[ERROR] ${message}${Reset}\n`);
			}
		}
	}

	/*****************************************************************************
	 * Creates a banner and a green info tag around a message
	 *
	 * @param {String} message - String to be enclosed by the banner
	 ****************************************************************************/
	static banner(message) {
		appendLog('all', `\n############### ${message} ###############\n`, false);
		if (!global.testing) {
			process.stdout.write('\n-------------------------------------------------------\n');
			process.stdout.write(`${Green}[INFO]${Reset} ${message}\n`);
			process.stdout.write('-------------------------------------------------------\n');
		}
	}

	/*****************************************************************************
	 * Outputs a message when the debug flag is used
	 *
	 * @param {String} message - String to be output
	 ****************************************************************************/
	static debug(message, type) {
		appendLog(type, `[DEBUG] ${sanatise(message)}`, true);
		if (!global.testing && global.logging === 'debug') {
			process.stdout.write(`${Grey}[DEBUG] ${message}${Reset}`);
		}
	}

	/*****************************************************************************
	 * Append data into the log only
	 *
	 * @param {String} message - String to be output
	 ****************************************************************************/
	static log(message) {
		appendLog('all', `[LOG] ${sanatise(message)}\n`, true);
	}

	/*****************************************************************************
	 * Create the build directory if it doesn't exist. If it does, empty the
	 * contents of it ready for the next run
	 ****************************************************************************/
	static setupBuildDir() {
		if (!global.projRoot) {
			global.projRoot = '.';
		}

		const
			rootPath = path.join(global.projRoot, 'Build', `${global.hostOS}-${global.platformOS}`),
			appDir = path.join(rootPath, 'App'),
			moduleDir = path.join(rootPath, 'Module'),
			appLog = path.join(appDir, 'appc_new.log'),
			moduleLog = path.join(moduleDir, 'appc_new.log');

		fs.emptyDirSync(appDir);
		fs.emptyDirSync(moduleDir);

		fs.ensureFileSync(appLog);
		fs.ensureFileSync(moduleLog);
	}

	/*****************************************************************************
	 * Creates the logging records for a new run, setting up an overhead
	 * directory, containing a log of formatted data, and a log of debug data.
	 ****************************************************************************/
	static setupLogDir(done) {
		if (!global.projRoot) {
			global.projRoot = '.';
		}
		// Generate a timestamp to be used on the current run
		global.timestamp = generateTimestamp(new Date(), true);

		// Allows us to know whether or not we should be logging to the files
		global.logFiles = true;

		// Build up the paths to the relevant files
		const
			logRoot = path.join(global.projRoot, 'Logs'),

			logPath = path.join(logRoot, global.timestamp),

			logBasicFile = path.join(logPath, 'basic.log'),
			logDebugFile = path.join(logPath, 'debug.log');

		try {
			// If the log directory doesn't exist then make it
			fs.ensureDirSync(logRoot);
			// Make the directory for storing all the data for this run
			fs.mkdirSync(logPath);
			// Create an empty file for the basic logging output
			fs.ensureFileSync(logBasicFile);
			// Create an empty file for the debug logging output
			fs.ensureFileSync(logDebugFile);

			done();
		} catch (err) {
			// If a log file already exists we don't need a new one
			if (err.code !== 'EEXIST') {
				done(err.code);
			}
		}
	}
}

/*******************************************************************************
 * Generates a timestamp for use in logging
 *
 * @param {Object} now - The time at which the function was called
 * @param {Boolean} full - The full date and time, or just time
 ******************************************************************************/
function generateTimestamp(now, full) {
	const
		timeOptions = {
			hour12: false, // Rule Britannia
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric'
		},
		dateOptions = {
			day: 'numeric',
			year: 'numeric',
			month: 'numeric'
		};

	let
		date = now.toLocaleDateString('en-gb', dateOptions).replace(/\//g, '-'),
		time = now.toLocaleTimeString('en-gb', timeOptions).replace(/:/g, '꞉'); // Replaces colons with a unicode character, colons aren't valid in filenames on Windows

	if (full) {
		return (`${date}_${time}`);
	}
	if (!full) {
		return (time);
	}
}

/*******************************************************************************
 * Write a message into one or both logs depending on the type of message that
 * needs to be written.
 *
 * @param {String} type - The type of logging that the message is for
 * @param {String} message - The string to write to the relevant log file
 * @param {Boolean} time - A bool value for whether a timestamp should be added
 ******************************************************************************/
function appendLog(type, message, time) {
	if (global.logFiles) {
		const
			logBasicFile = path.join(global.projRoot, 'Logs', global.timestamp, 'basic.log'),
			logDebugFile = path.join(global.projRoot, 'Logs', global.timestamp, 'debug.log');

		if (time) {
			message = `[${generateTimestamp(new Date(), false)}]` + message;
		}

		try {
			// Append to the relevant log depending on the type of message
			switch (type) {
				case 'all':
					fs.appendFileSync(logBasicFile, message);
					fs.appendFileSync(logDebugFile, message);
					break;

				case 'basic':
					fs.appendFileSync(logBasicFile, message);
					break;

				case 'debug':
					fs.appendFileSync(logDebugFile, message);
					break;
			}
		} catch (err) {
			// Do Nothing
		}
	}
}

function sanatise(message) {
	if (message instanceof Object) {
		if (message instanceof Buffer) {
			return message.toString('utf8');
		} else {
			return JSON.stringify(message, null, 2);
		}
	} else {
		return message;
	}
}

module.exports = Output_Helper;

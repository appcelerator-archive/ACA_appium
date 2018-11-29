'use strict';

const
	path = require('path'),
	fs = require('fs-extra'),
	Mocha = require('mocha'),
	Output = require('./Output_Helper.js');

class Mocha_Helper {
	/*****************************************************************************
	 * Runs through the Mocha tests outlined in device_config.js
	 ****************************************************************************/
	static mochaTest() {
		return new Promise((resolve, reject) => {

			Output.info('Starting Tests\n');

			// Have to clear cache so that Mocha will run the same tests twice, solution taken from here https://github.com/mochajs/mocha/issues/995#issuecomment-261752316
			Object.keys(require.cache).forEach(function (file) {
				delete require.cache[file];
			});

			// Create the new Mocha instance
			let mocha = new Mocha({
				fullTrace: true,
				useColors: true,
				timeout: 120000,
				slow: 80000
			});

			let tests = [];

			getTests()
				.then(files => {
					// Break here if no tests are defined
					if (files.length === 0) {
						resolve(tests);
					}

					let collator = new Intl.Collator(undefined, {
						numeric: true,
						sensitivity: 'base'
					});

					files.sort(collator.compare);
					// Add all of the test files one by one
					files.forEach(file => {
						mocha.addFile(file);
					});

					global.testing = true;

					mocha.run()
						.on('test end', data => {
							try {
								// Attempt to pull the name of the ticket using the file path of the test
								let
									test,
									testNumber = parseInt(path.basename(data.file, '.js').split('.')[0], 10),
									index = tests.indexOf(tests.find(x => x.testNum === testNumber));

								if (data.pending === true) {
									// If the test is to was skipped
									Output.log(`${data.title}: Skipped`);
									// Check if the ticket is already in the array
									if (index > 0) {
										// Add the skip message onto the object
										tests[index].errors.push(data.title.replace(/\\/g, '').replace(/"/g, '\''));
									} else {
										// If a ticket object isn't already in the array, create it
										test = {
											state: 3,
											name: data.title,
											testNum: testNumber,
											errors: [ data.title.replace(/\\/g, '').replace(/"/g, '\'') ]
										};
									}
								} else if (data.state === 'passed') {
									// Action for if the test passed
									Output.log(`${data.title}: Passed`);
									// Check if the ticket is already in the array
									if (index > 0) {
										// Change the state of the test to a pass if it was previously skipped
										if (tests[index].state === 3) {
											tests[index].state = 1;
										}
									} else {
										// Create a new ticket object if one doesn't exist
										test = {
											state: 1,
											name: data.title,
											testNum: testNumber,
											errors: []
										};
									}
								} else if (data.state === 'failed') {
									// Action for if the test failed
									Output.log(`${data.title}: Failed`);
									Output.log(`Reason: ${data.err.message}`);
									// Create a message to be attatched to the ticket
									let failMessage = `[TEST STEP] ${data.title.replace(/"/g, '\'')}\\n[RESULT] ${data.err.message.replace(/\\/g, '').replace(/"/g, '\'')}`;
									// Check if the ticket is already in the array
									if (index > 0) {
										// Change the state of the test to a failure
										tests[index].state = 2;
										// Add the error into the array
										tests[index].errors.push(failMessage);
									} else {
										// Create a new ticket object if one doesn't exist
										test = {
											state: 2,
											name: data.title,
											testNum: testNumber,
											errors: [ failMessage ]
										};
									}
								}

								if (test) {
									tests.push(test);
								}

							} catch (err) {
								delete global.testing;
								Output.error('hi' + err);
							}
						})
						.on('end', () => {
							delete global.testing;
							resolve(tests);
						});
				})
				.catch(err => {
					delete global.testing;
					reject(err);
				});
		});
	}
}

/*******************************************************************************
 * Collect all test files for the desired platform and test application
 ******************************************************************************/
function getTests() {
	return new Promise((resolve, reject) => {
		// Our container for all the test files to be run
		let
			dir,
			tests = [];

		// Create a file path
		dir = path.join(global.projRoot, 'Tests', `${global.hostOS}-${global.platformOS}`);

		try {
			// Iterate through each file within the test directory
			fs.readdirSync(dir).forEach(file => {
				// Only use actual test files, ignore everything else
				if (file.match(/.+\.test\.js/g)) {
					let filePath = path.join(dir, file);

					tests.push(filePath);
				}
			});
		} catch (err) {
			reject(err);
		}

		resolve(tests);
	});
}

module.exports = Mocha_Helper;

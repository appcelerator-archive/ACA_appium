'use strict';

// Nothing has changed since Yeti in this file, won't actually do anything for this suite except clear the logs :)

const
	path = require('path'),
	fs = require('fs-extra'),
	calcSize = require('get-folder-size'),
	Output = require('../Helpers/Output_Helper.js');

let
	startSize,
	finalSize,
	projRoot = path.join(__dirname, '..');

Promise.resolve()
	// Find the size of the project directory, before we remove anything
	.then(() => getSize())
	.then(cb => startSize = cb)
	// Create an array containing all of the potential paths to be removed
	.then(() => generatePaths())
	// Use the array to remove the specified directories, if they exist
	.then(paths => removeJunk(paths))
	// Check on the size of the project now we have removed the data
	.then(() => getSize())
	.then(cb => finalSize = cb)
	// Print the amount of removed data to the console
	.then(() => getDiff(startSize, finalSize))
	.catch(err => Output.error(err));

/*******************************************************************************
 * Retreive the size of the project directory in Kilobytes using 'du'.
 ******************************************************************************/
function getSize() {
	return new Promise((resolve, reject) => {
		calcSize(projRoot, (err, size) => {
			if (err) {
				reject(new Error(`exited with ${err}`));
			}
			resolve(size);
		});
	});
}

/*******************************************************************************
 * Get the difference between the before and after size of the project, convert
 * it to Megabytes and round it to the nearest whole number, then display it to
 * the console to show how much space was saved.
 *
 * @param {String} start - The size of the project in Kilobytes before removing
 * @param {String} final - The size of the project in Kilobytes after removing
 ******************************************************************************/
function getDiff(start, final) {
	return new Promise(resolve => {
		const diff = (start - final);
		let removed = (diff / 1024 / 1024).toFixed(2);

		console.log();
		Output.info(`Clean Finished. Removed ${removed}Mb(s) of Data`);

		resolve();
	});
}

/*******************************************************************************
 * Go through all the locations that can remove, and generate a path to them
 * that can be passed to the delete function.
 ******************************************************************************/
function generatePaths() {
	return new Promise(resolve => {
		let paths = [];

		paths.push(path.join(projRoot, 'Logs'));
		paths.push(path.join(projRoot, 'Build'));

		resolve(paths);
	});
}

/*******************************************************************************
 * Use the generated paths to check whether there is anyhting at the specified
 * location, and if there is, remove it, whilst notifying the user.
 *
 * @param {Array[String]} paths - The file system paths to the directories that
 *                                can be removed
 ******************************************************************************/
function removeJunk(paths) {
	return new Promise(resolve => {

		let p = Promise.resolve();

		paths.forEach(path => {
			p = p
				.then(() => {
					if (fs.existsSync(path)) {
						fs.removeSync(path);
						Output.info(`Removed ${path}`);
					}
				});
		});

		p.then(() => resolve());
	});
}

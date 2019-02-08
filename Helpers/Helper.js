'use strict';

const
	path = require('path'),
	fs = require('fs-extra');

const
	app = require('../Config/Test_Config.js').app;
	
class Helper {
	/*****************************************************************************
	 * Copies the test app.js to the created app.js
	 ****************************************************************************/
	static copyTestApp(platform) {
		return new Promise((resolve, reject) => {
			const
				appRoot = path.join(global.projRoot, 'Build', platform, app.name),
				filePath = path.join(appRoot, 'Resources', 'app.js'),
				testApp = path.join(global.projRoot, 'Config', 'Support', 'app.js');

			readFilePromise(testApp)
				.then(data => fs.writeFile(filePath, data))
				.then(resolve())
				.catch(e => reject(e));

		});
	}
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

module.exports = Helper;

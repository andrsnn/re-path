//node main.js <pathToRoot>
var path = require('path');
var glob = require('glob');
var async = require('async');
var RePath = require('./lib/RePath');

var absoluteRoot = path.resolve(__dirname, process.argv[2]);

var rePath = new RePath(absoluteRoot);

rePath.resolvePathsInFiles(
	'**/*.js',
	function (regexResult, absPathToCurrentFile, callback) {
		var match = regexResult[1];

		console.log('-------------------------------------------');
		console.log('Current File: ' + absPathToCurrentFile);
		console.log('The following path does not exist: ' + match);
		console.log('-------------------------------------------');

        rePath.utils.prompt(
            function (newPath, callback) {
                var absNewPath = rePath.utils.resolvePathFromFile(absPathToCurrentFile, newPath);

                rePath.isFileAtPath(absNewPath, function (isFileAtPath) {
                    return callback(null, isFileAtPath);
                });
            },
            function (err, newPath) {
                if (err) {
                    return callback(err);
                }

                var transformedLine = rePath.utils.replacePath(regexResult, newPath);
                return callback(null, transformedLine);
            }
        );
	},
	function (err, numFilesChanged, matchingFiles) {
		if (err) throw new Error(err);
		console.log('Number of files iterated: ' + numFilesChanged);

		console.log(matchingFiles);
	}
);
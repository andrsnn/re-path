'use strict';
//node main.js <pathToRoot>
var path = require('path');
var glob = require('glob');
var async = require('async');
var RePath = require('./lib/RePath');
var PathStore = RePath.PathStore;

var absoluteRoot = path.resolve(__dirname, process.argv[2]);

var pathStore = new PathStore();
var rePath = new RePath(absoluteRoot);

function promptForNewFile(regexResult, absPathToCurrentFile, callback) {
    rePath.utils.promptForNewFile(
        function (newPath, callback) {
            var absNewPath = rePath.utils.resolvePathFromFile(absPathToCurrentFile, newPath);

            rePath.isFileAtPath(absNewPath, function (isFileAtPath) {
                return callback(null, isFileAtPath, newPath, absNewPath);
            });
        },
        function (err, newPath, absNewPath) {
            if (err) {
                return callback(err);
            }

            pathStore.memoise(absNewPath);

            var transformedLine = rePath.utils.replacePath(regexResult, newPath);
            return callback(null, transformedLine);
        }
    );
}

rePath.resolvePathsInFiles(
	'**/*.js',
	function (regexResult, absPathToCurrentFile, callback) {
		var match = regexResult[1];

        var memoisedMatches = pathStore.lookup(match);

		console.log('-------------------------------------------');
		console.log('Current File: ' + absPathToCurrentFile);
		console.log('The following path does not exist: ' + match);
		console.log('-------------------------------------------');

        if (memoisedMatches.length !== 0) {
            rePath.utils.promptList(memoisedMatches, function (err, selectedPath) {
                if (selectedPath === 'None') {
                    return promptForNewFile(regexResult, absPathToCurrentFile, callback);
                }

                var relativeNewPath = rePath.utils.resolvePathToFile(absPathToCurrentFile, selectedPath);

                var transformedLine = rePath.utils.replacePath(regexResult, relativeNewPath);
                return callback(null, transformedLine);
            });
        }
        else {
            promptForNewFile(regexResult, absPathToCurrentFile, callback);
        }
        
	},
	function (err, numFilesChanged, matchingFiles) {
		if (err) throw new Error(err);
		console.log('Number of files iterated: ' + numFilesChanged);

		console.log(matchingFiles);

        console.log(pathStore._store);
	}
);
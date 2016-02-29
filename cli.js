'use strict';
//node main.js <pathToRoot>
var path = require('path');
var glob = require('glob');
var async = require('async');
var program = require('commander');
var _ = require('lodash');
var RePath = require('./lib/RePath');
var PathStore = RePath.PathStore;

program
    .version('0.0.1')
    .option('-c, --cwd [value]', 'Current working directory.')
    .option('-am, --autoMemoise', 'Automatically replace with matching memoised paths.')
    .option('-t, --threshold <n>', 'If autoMemoised enabled, threshold in which to replace.', parseInt)
    .parse(process.argv);

if (!program.cwd) {
    throw new Error('No cwd specified.');
}

var absoluteRoot = path.resolve(__dirname, program.cwd);

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

        var memoisedMatches = pathStore.lookup(match, program.threshold);

		console.log('-------------------------------------------');
		console.log('Current File: ' + absPathToCurrentFile);
		console.log('The following path does not exist: ' + match);
		console.log('-------------------------------------------');

        if (memoisedMatches.length !== 0) {
            if (program.autoMemoise) {
                var firstMatch = _.first(memoisedMatches);

                var relativeNewPath = rePath.utils.resolvePathToFile(absPathToCurrentFile, firstMatch);

                var transformedLine = rePath.utils.replacePath(regexResult, relativeNewPath);

                console.log('Auto resolved to: ' + firstMatch);

                return callback(null, transformedLine);
            }

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
	}
);
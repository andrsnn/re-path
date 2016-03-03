'use strict';

var path = require('path');
var fs = require('fs');
var inquirer = require('inquirer');
var async = require('async');
var _ = require('lodash');

var utils = module.exports = exports = {};

utils.hasPath = function (str) {
	var isWrappedInQuotes = /["'](.*)["']/;
	var hasForwardSlash = /\//;

	var result = isWrappedInQuotes.exec(str);

	return result && hasForwardSlash.test(result[1]) ? 
		result : false;
};

//resolve a path relative to a file
utils.resolvePathFromFile = function (from, to) {
	var fileExtension = path.extname(from);
	
	//assume it is a file if it has an extension
	//resolving from the file does not work, need to remove the file
	//and resolve from the directory it resides in
	if (fileExtension) {
		from = from.substring(0, from.lastIndexOf('/'));
	}

	return path.resolve(from, to);
};

utils.resolvePathToFile = function (from, to) {
    return path.relative(from, to);
};

utils.replacePath = function (regexResultPath, newPath) {
	var inputString = regexResultPath.input;
	var originalMatchPath = regexResultPath[1];

	return inputString.replace(originalMatchPath, newPath);
};

utils.stripExtension = function (fullPath) {
	var extension = path.extname(fullPath);

	if (extension) {
		fullPath = fullPath.replace(extension, '');
	}

	return fullPath;
};

utils.promptList = function (memoisedList, callback) {
    var list = _.cloneDeep(memoisedList);

    var questions = [
        {
            type: 'list',
            name: 'selectedPath',
            message: 'Select a memoised path from the list or choose none: ',
            choices: list.concat('None')
        }
    ];

    inquirer.prompt(questions, function (result) {
        return callback(null, result.selectedPath);
    });
};

utils.promptForNewFile = function(iterator, callback) {
	var self = this;
	var returnedArguments = [];
	var canContinue = true;
	async.whilst(
		function () {
			return canContinue;
		},
		function (callback) {
			var question = [
                {
                    type: 'input',
                    name: 'newPath',
                    message: 'Please enter a new file path or enter Skip: '
                }
			];

            inquirer.prompt(question, function (result) {
                var userInput = result.newPath;

                if (userInput.toLowerCase() === 'skip') {
                	canContinue = false;
                	returnedArguments = [null, null, true];
                	return callback(null);
                }

                return iterator(userInput, function () {
                    var err = arguments[0],
                        isNewPathValid = arguments[1];

                    returnedArguments = Array.prototype.slice.call(arguments, 2);

                    if (err) {
                        return callback(err);
                    }

                    canContinue = !isNewPathValid;
                    return callback(null);
                });
            });
		},
		function (err) {
			if (err) {
				return callback(err);
			}

			return callback.apply(callback, [null].concat(returnedArguments));
		}
	);
};
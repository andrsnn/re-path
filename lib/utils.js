'use strict';

var path = require('path');
var fs = require('fs');
var prompt = require('prompt');
var async = require('async');

var utils = module.exports = exports = {};

utils.hasPath = function (str) {
	var isWrappedInQuotes = /["'](.*)["']/;

	var hasForwardSlash = /\//;

	if (isWrappedInQuotes.test(str) &&
		hasForwardSlash.test(str)) {
		return isWrappedInQuotes.exec(str);
	}

	return false;
};


utils.resolvePathFromFile = function (from, to) {
	var fileExtension = path.extname(from);

	if (fileExtension) {
		from = from.substring(0, from.lastIndexOf('/'));
	}

	return path.resolve(from, to);
};

utils.replacePath = function (regexResultPath, newPath) {
	var inputString = regexResultPath.input;
	var originalMatchPath = regexResultPath[1];

	return inputString.replace(originalMatchPath, newPath);
};

utils.prompt = function(iterator, callback) {
	var self = this;
	var finalPath = null;
	var canContinue = true;
	async.whilst(
		function () {
			return canContinue;
		},
		function (callback) {
			prompt.start();

			prompt.get(['newPath'], function (err, result) {
				var newPath = result.newPath;

				finalPath = newPath;

				return iterator(newPath, function (err, isNewPathValid) {
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
			return callback(null, finalPath);
		}
	);
};
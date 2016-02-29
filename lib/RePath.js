var path = require('path');
var util = require('util');
var fs = require('fs');
var async = require('async');
var glob = require('glob');

var PathStore = require('./PathStore');
var utils = require('./utils');
var helpers = require('./helpers')

function _noop (line, filePath, callback) {
	return callback(null, line);
}

var RePath = function (root, extension) {
	this.root = root;
	this.extension = extension || '.js';
};

RePath.PathStore = PathStore;

RePath.prototype = helpers;

RePath.prototype.utils = utils;

RePath.prototype.resolvePathsInFiles = function () {
	var self = this;

	var globString = arguments[0];
	if (!globString) {
		throw new Error('Glob must be passed into findPathsInFiles');
	}
	var iterator = arguments[1] || _noop;
	var callback = arguments[2] || arguments[1];

	var globOptions = {
		cwd: this.root
	};

	async.waterfall([
		glob.bind(glob, globString, globOptions),
		function (files, callback) {
			var index = 0;
			async.eachSeries(files, function (file, callback) {
				self.findPathsInFile(
					file,
					function (matchingLine, absPathToCurrentFile, callback) {
						//regex response
						var lineMatch = matchingLine[1];

						var resolvedFilePath = self.utils.resolvePathFromFile(absPathToCurrentFile, lineMatch);

						self.isFileAtPath(resolvedFilePath, function (fileExists) {
							if (!fileExists) {
								//call iterator for new file path
								return iterator(matchingLine, absPathToCurrentFile, callback);
							}
							return callback(null, matchingLine.input);
						});
					},
					function (err) {
						if (err) {
							return callback(err);
						}
						index++;
						return callback(null);
					}
				)
			}, function (err) {
				if (err) {
					return callback(err);
				}
				return callback(null, index, files);
			});
		}
	], function (err, numFilesChanged, matchingFiles) {
		if (err) {
			return callback(err);
		}

		return callback(null, numFilesChanged, matchingFiles);
	});
};

RePath.prototype.findPathsInFile = function () {
	var self = this;

	var file = arguments[0];
	if (!file) {
		throw new Error('File path must be passed into findPathsInFile');
	}
	var iterator = arguments[1] || _noop;
	var callback = arguments[2] || arguments[1];

	var absPathToCurrentFile = path.resolve(this.root, file);

	async.waterfall([
		function (callback) {
			fs.readFile(absPathToCurrentFile, 'utf8', function (err, file) {
				if (err) {
					return callback(err);
				}
				var fileSplitOnNewLine = file.split('\n');
				return callback(null, file, fileSplitOnNewLine);
			});
		},
		function (file, fileSplitOnNewLine, callback) {
			async.mapSeries(fileSplitOnNewLine, function (line, callback) {
				var pathMatch = self.utils.hasPath(line);
				if (pathMatch) {
					return iterator(pathMatch, absPathToCurrentFile, callback);
				}
				return callback(null, line);
			}, function (err, transformedFile) {
				if (err) {
					return callback(err);
				}

				return callback(null, file, transformedFile);
			});
		}
	], function (err, file, transformedFile) {
		if (err) {
			return callback(err);
		}
		transformedFile = transformedFile.join('\n');
		if (file !== transformedFile) {
			return fs.writeFile(absPathToCurrentFile, transformedFile, callback);
		}
		return callback(null);
	});
};

module.exports = RePath;
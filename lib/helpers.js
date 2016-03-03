'use strict';

var fs = require('fs');
var path = require('path');
var async = require('async');

var helpers = module.exports = exports = {};

helpers.getPossiblePaths = function (absoluteFilePath) {
	var possibleFilePaths = [];
	if (!path.extname(absoluteFilePath)) {
		possibleFilePaths.push(absoluteFilePath + this.extension);
		possibleFilePaths.push(absoluteFilePath + '/' + this.defaultFile);
	}
	possibleFilePaths.push(absoluteFilePath);

	return possibleFilePaths;
};

helpers.isFileAtPath = function (filePath, callback) {
    if (!path.isAbsolute(filePath)) {
        filePath = path.resolve(this.root, filePath);
    }

    //> node 12.x
	fs.stat(filePath, function (err, stat) {
		var found = false;
		if (!err && stat.isFile()) {
			found = true;
		}

		return callback(null, found);
	});
};

helpers.areFilesAtPaths = function (filePaths, callback) {
	var found = false,
		self = this;

	async.eachSeries(filePaths, function (filePath, callback) {
		self.isFileAtPath(filePath, function (err, isFileAtPath) {
			if (err) {
				return callback(err);
			}
			if (isFileAtPath) {
				found = isFileAtPath;
			}

			return callback(null);
		});
	}, function (err) {
		if (err) {
			return callback(err, found);
		}

		return callback(null, found);
	});
};
'use strict';

var fs = require('fs');
var path = require('path');
var async = require('async');

var helpers = module.exports = exports = {};

helpers.isFileAtPath = function (filePath, callback) {
	var possibleFilePaths = [];
	var found = false;

    if (!path.isAbsolute(filePath)) {
        filePath = path.resolve(this.root, filePath);
    }
	if (!path.extname(filePath)) {
		possibleFilePaths.push(filePath + this.extension);
	}

	possibleFilePaths.push(filePath);

	async.each(possibleFilePaths, function (possibleFilePath, callback) {
		//> node 12.x
		fs.stat(possibleFilePath, function (err, stat) {
			if (err) {
				return callback(null);
			}
			if (stat.isFile()) {
				found = true;
			}

			return callback(null);
		});
	}, function (err) {
		if (err) {
			return callback(err);
		}

		return callback(null, found);
	});
};
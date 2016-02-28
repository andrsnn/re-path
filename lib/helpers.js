'use strict';

var fs = require('fs');
var path = require('path');
var async = require('async');
var prompt = require('prompt');

var helpers = module.exports = exports = {};

helpers.isFileAtPath = function (filePath, callback) {
	if (!path.extname(filePath)) {
		filePath += this.extension;
	}
    if (!path.isAbsolute(filePath)) {
        filePath = path.resolve(this.root, filePath);
    }
	//> node 12.x
	fs.stat(filePath, function (err, stat) {
		if (err) {
			return callback(false);
		}

		return callback(true);
	});
};
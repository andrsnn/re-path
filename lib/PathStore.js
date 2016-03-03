'use strict';

var path = require('path');
var _ = require('lodash');
var utils = require('./utils');

var PathStore = function () {
	//keyed on path
	this._store = {};
};

PathStore.prototype.memoise = function (key, value) {
	if (this._store[key]) {
		return;
	}

	this._store[key] = value;
};

PathStore.prototype.lookup = function (lookupPath, threshold) {
	if (!lookupPath) {
		return [];
	}

	threshold = threshold || 0;

	var lookupPathSplitOnSlash = lookupPath
		.replace(/\.+/g, '')
		.split('/').reverse();

	return _.chain(this._store)
		.map(function (val, key) {
			var memoisedPath = key;
			var match = {
				path: val,
				numOfMatches: 0
			};

			var memoisedPathSplitOnSlash = memoisedPath
				.replace(/\.+/g, '')
				.split('/').reverse();

			for (var i = 0; i < lookupPathSplitOnSlash.length; i++) {
				var lookupPath = lookupPathSplitOnSlash[i];

				var memoisedPathAtIndex = memoisedPathSplitOnSlash[i];

				if (memoisedPathAtIndex && lookupPath === memoisedPathAtIndex) {
					match.numOfMatches += 1;
				}
				else {
					break;
				}
			}

			return match;
		})
		.sortBy(function (match) {
			return match.numOfMatches;
		})
		.reduce(function (acc, match) {
			if (match.numOfMatches > threshold) {
				acc.push(match.path);
			}

			return acc;
		}, [])
		.value();
};

module.exports = PathStore; 
'use strict';

var path = require('path');
var _ = require('lodash');
var utils = require('./utils');

var PathStore = function () {
	//keyed on path
	this._store = {};
};

PathStore.prototype.memoise = function (value) {
	if (this._store[value]) {
		return;
	}

	this._store[value] = true;
};

PathStore.prototype.lookup = function (lookupPath) {
	if (!lookupPath) {
		return [];
	}

	//we want to find a match without extension
	lookupPath = utils.stripExtension(lookupPath);
	var lookupPathSplitOnSlash = lookupPath.split('/').reverse();

	return _.chain(this._store)
		.map(function (val, key) {
			var memoisedPath = key;
			var match = {
				path: key,
				numOfMatches: 0
			};
			memoisedPath = utils.stripExtension(memoisedPath);

			var memoisedPathSplitOnSlash = memoisedPath.split('/').reverse();

			lookupPathSplitOnSlash.forEach(function (lookupPath, i) {
				var memoisedPathAtIndex = memoisedPathSplitOnSlash[i];

				if (memoisedPathAtIndex && lookupPath === memoisedPathAtIndex) {
					match.numOfMatches += 1;
				}
			});

			return match;
		})
		.sortBy(function (match) {
			return match.numOfMatches;
		})
		.reduce(function (acc, match) {
			if (match.numOfMatches > 0) {
				acc.push(match.path);
			}

			return acc;
		}, [])
		.value();
};

module.exports = PathStore; 
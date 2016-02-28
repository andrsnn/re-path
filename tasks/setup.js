'use strict';
require('shelljs/global');

var path = require('path');

var pathFrom = path.resolve(__dirname, '../tests/template-project');
var pathTo = path.resolve(__dirname, '../tests/test-project');

rm('-rf', pathTo);
cp('-R', pathFrom, pathTo);
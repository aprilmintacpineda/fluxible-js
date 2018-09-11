'use strict';

var _lib = require('./lib');

(0, _lib.initializeState)({
  count: 1
}); /** @format */

(0, _lib.addListener)(function () {
  console.log('update listener', (0, _lib.getState)());
});

setInterval(function () {
  (0, _lib.updateState)({
    count: (0, _lib.getState)().count + 1
  });
}, 1000);
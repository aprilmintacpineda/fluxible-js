'use strict';

var _lib = require('./lib');

(0, _lib.initializeStore)({
  count: 1
}); /** @format */

(0, _lib.addListener)(function () {
  console.log('update listener', (0, _lib.getStore)());
});

setInterval(function () {
  (0, _lib.updateStore)({
    count: (0, _lib.getStore)().count + 1
  });
}, 1000);
'use strict';

var _lib = require('./lib');

(0, _lib.initializeStore)({
  initialStore: {
    count: 1
  }
}); /** @format */

setInterval(function () {
  return (0, _lib.updateStore)({
    count: (0, _lib.getStore)().count + 1
  }).then(function () {
    console.log('store was updated!', (0, _lib.getStore)().count);
  });
}, 1000);
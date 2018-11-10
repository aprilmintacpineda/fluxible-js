"use strict";

var _lib = require("./lib");

/** @format */
(0, _lib.initializeStore)({
  initialStore: {
    count: 1
  }
});
(0, _lib.addObserver)(function (updatedState) {
  // eslint-disable-next-line
  console.log('observer called. Updated state:', updatedState);
}, ['count']);
setInterval(function () {
  (0, _lib.updateStore)({
    count: (0, _lib.getStore)().count + 1
  }); // eslint-disable-next-line

  console.log('This line ran after updateStore:', (0, _lib.getStore)());
}, 1000); // eslint-disable-next-line

console.log('initialStore', (0, _lib.getStore)());
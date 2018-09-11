"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.initializeStore = initializeStore;
exports.getStore = getStore;
exports.updateStore = updateStore;
exports.addListener = addListener;
/** @format */

var store = {};
var updateListeners = [];

/**
 * initialize store.
 * @param {Object} Object that would be used as initial store
 * @return {undefined}
 */
function initializeStore(initialStore) {
  store = _extends({}, initialStore);
}

/**
 * get the most latest store.
 * @return {Object} the store
 */
function getStore() {
  return store;
}

/**
 * updates some parts of the store.
 * @param {Object} the object containing updates on the store states.
 * @return {undefined}
 */
function updateStore(storeUpdates) {
  store = _extends({}, store, storeUpdates);

  updateListeners.forEach(function (callback) {
    callback();
  });
}

/**
 * register a function that would be called after every store updates.
 * @param {Function} callback function.
 * @return {Function} call the function to remove this callback from the listeners.
 */
function addListener(callback) {
  updateListeners.push(callback);

  return function () {
    updateListeners.splice(updateListeners.indexOf(callback), 1);
  };
}
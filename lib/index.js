'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.initializeStore = initializeStore;
exports.getStore = getStore;
exports.updateStore = updateStore;
exports.addListener = addListener;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/** @format */

var store = {};
var updateListeners = [];
var persistedStateKeys = void 0;
var persistStorage = void 0;

/**
 * initialize store.
 * @param {Object} Config that should contain the required config.initialStore and the optional config.persist
 * @return {undefined}
 */
function initializeStore(config) {
  // persist
  var persistedStates = {};
  if (config.persist) {
    // set the storage first
    persistStorage = config.persist.storage;

    var savedStore = persistStorage.getItem('fluxible-js');
    persistedStates = config.persist.restore(savedStore || {});

    // we should only save states that were restored
    persistedStateKeys = Object.keys(persistedStates);
  }

  store = _extends({}, config.initialStore, persistedStates);
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

  if (persistedStateKeys) {
    persistStorage.setItem('fluxible-js', JSON.stringify(
    // we should only save states that were restored
    persistedStateKeys.reduce(function (compiled, key) {
      return _extends({}, compiled, _defineProperty({}, key, store[key]));
    }, {})));
  }
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
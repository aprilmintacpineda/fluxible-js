'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.initializeStore = initializeStore;
exports.getStore = getStore;
exports.updateStore = updateStore;
exports.addUpdateListener = addUpdateListener;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/** @format */

var updateListeners = [];
var store = {};
var persistedStateKeys = void 0;
var persistStorage = void 0;
var persistTimeout = void 0;

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

    persistedStates = config.persist.restore(JSON.parse(persistStorage.getItem('fluxible-js')) || {});

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
 * @return {Promise}
 */
function updateStore(storeUpdates) {
  if (persistTimeout) clearTimeout(persistTimeout);

  store = _extends({}, store, storeUpdates);

  if (persistedStateKeys) {
    persistTimeout = setTimeout(function () {
      persistStorage.setItem('fluxible-js', JSON.stringify(
      // we should only save states that were restored
      persistedStateKeys.reduce(function (compiled, key) {
        return _extends({}, compiled, _defineProperty({}, key, store[key]));
      }, {})));
    }, 200);
  }

  updateListeners.forEach(function (callback) {
    callback();
  });
}

/**
 * registers an update listener to be called after every store updates.
 * @param {Function} callback function
 * @return {Function} call this function to remove the listener
 */
function addUpdateListener(listener) {
  updateListeners.push(listener);

  return function () {
    updateListeners.splice(updateListeners.indexOf(listener), 1);
  };
}
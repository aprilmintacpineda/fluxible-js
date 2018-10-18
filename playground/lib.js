'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.initializeStore = initializeStore;
exports.getStore = getStore;
exports.updateStore = updateStore;
exports.addObserver = addObserver;
/** @format */

var observers = [];
var store = {};
var persistedStateKeys = null;
var persistStorage = null;
var persistTimeout = null;

function initializeStore(config) {
  observers = [];
  store = {};
  persistedStateKeys = null;
  persistStorage = null;
  persistTimeout = null;

  if (config.persist !== undefined) {
    // persist
    var persistedStates = {};

    // set the storage first
    persistStorage = config.persist.storage;

    // get saved store from storage
    persistedStates = config.persist.restore(JSON.parse(persistStorage.getItem('fluxible-js')) || {});

    // we should only save states that were restored
    persistedStateKeys = Object.keys(persistedStates);

    Object.keys(config.initialStore).forEach(function (key) {
      if (persistedStateKeys.indexOf(key) === -1) {
        store[key] = config.initialStore[key];
      } else {
        store[key] = persistedStates[key];
      }
    });
  } else {
    Object.keys(config.initialStore).forEach(function (key) {
      store[key] = config.initialStore[key];
    });
  }
}

function getStore() {
  return _extends({}, store);
}

function updateStore(updatedStates) {
  if (persistedStateKeys !== null) {
    if (persistTimeout !== null) clearTimeout(persistTimeout);

    persistTimeout = setTimeout(function () {
      persistStorage.setItem('fluxible-js', JSON.stringify(persistedStateKeys.reduce(function (compiled, key) {
        compiled[key] = store[key];
        return compiled;
      }, {})));
    }, 200);
  }

  var updatedStateKeys = Object.keys(updatedStates);

  updatedStateKeys.forEach(function (key) {
    store[key] = updatedStates[key];
  });

  // only notify observers that observes the store keys that were updated
  observers.forEach(function (observer) {
    // we want to maximize performance, so we loop as little as possible
    if (updatedStateKeys.length < observer.wantedKeys.length) {
      for (var a = 0; a < updatedStateKeys.length; a++) {
        if (observer.wantedKeys.indexOf(updatedStateKeys[a]) !== -1) {
          observer.callback(store);
          break;
        }
      }
    } else {
      // they are either of the same length or
      // the observer.wantedKeys is less than the updatedStateKeys
      for (var _a = 0; _a < observer.wantedKeys.length; _a++) {
        if (updatedStateKeys.indexOf(observer.wantedKeys[_a]) !== -1) {
          observer.callback(store);
          break;
        }
      }
    }
  });
}

function addObserver(callback, wantedKeys) {
  var thisObserver = {
    callback: callback,
    wantedKeys: wantedKeys,
    id: Math.random().toString()
  };

  observers.push(thisObserver);

  return function () {
    observers = observers.filter(function (observer) {
      return observer.id !== thisObserver.id;
    });
  };
}
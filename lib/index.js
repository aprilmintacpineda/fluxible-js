'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeStore = initializeStore;
exports.getStore = getStore;
exports.updateStore = updateStore;
exports.addObserver = addObserver;


var observers = [];
var store = {};
var persistedStateKeys = null;
var persistStorage = null;
var persistTimeout = null;

function initializeStore(config) {
  var initialStoreKeys = Object.keys(config.initialStore);

  if (config.persist !== undefined) {
    var persistedStates = config.persist.restore(JSON.parse(config.persist.storage.getItem('fluxible-js')) || {});

    for (var a = 0; a < initialStoreKeys.length; a++) {
      store[initialStoreKeys[a]] = persistedStates[initialStoreKeys[a]] || config.initialStore[initialStoreKeys[a]];
    }

    persistedStateKeys = Object.keys(persistedStates);

    persistStorage = config.persist.storage;
  } else {
    for (var _a = 0; _a < initialStoreKeys.length; _a++) {
      store[initialStoreKeys[_a]] = config.initialStore[initialStoreKeys[_a]];
    }
  }
}

function getStore() {
  return store;
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

  for (var a = 0; a < updatedStateKeys.length; a++) {
    store[updatedStateKeys[a]] = updatedStates[updatedStateKeys[a]];
  }

  for (var _a2 = 0; _a2 < observers.length; _a2++) {
    if (updatedStateKeys.length < observers[_a2].wantedKeys.length) {
      for (var b = 0; b < updatedStateKeys.length; b++) {
        if (observers[_a2].wantedKeys.indexOf(updatedStateKeys[b]) !== -1) {
          observers[_a2].callback(store);
          break;
        }
      }
    } else {
      for (var _b = 0; _b < observers[_a2].wantedKeys.length; _b++) {
        if (updatedStateKeys.indexOf(observers[_a2].wantedKeys[_b]) !== -1) {
          observers[_a2].callback(store);
          break;
        }
      }
    }
  }
}

function addObserver(callback, wantedKeys) {
  var thisObserver = {
    callback: callback,
    wantedKeys: wantedKeys,
    id: Math.random().toString()
  };

  observers.push(thisObserver);

  return function () {
    for (var a = 0; a < observers.length; a++) {
      if (observers[a].id === thisObserver.id) {
        return observers.splice(a, 1);
      }
    }
  };
}
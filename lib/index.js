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

var persistStorage = 0;
var persistRestore = 0;
var persistTimeout = 0;

function initializeStore(config) {
  var initialStoreKeys = Object.keys(config.initialStore);

  if (config.persist) {
    persistStorage = config.persist.storage;
    persistRestore = config.persist.restore;

    var persistedStates = persistRestore(JSON.parse(persistStorage.getItem('fluxible-js')) || {});

    for (var a = 0; a < initialStoreKeys.length; a++) {
      store[initialStoreKeys[a]] = persistedStates[initialStoreKeys[a]] || config.initialStore[initialStoreKeys[a]];
    }
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
  if (persistTimeout !== 0) {
    persistTimeout = clearTimeout(persistTimeout);
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

  if (persistRestore !== 0) {
    persistTimeout = setTimeout(function () {
      persistStorage.setItem('fluxible-js', JSON.stringify(persistRestore(store)));
    }, 200);
  }
}

function addObserver(callback, wantedKeys) {
  var thisObserver = {
    callback: callback,
    wantedKeys: wantedKeys,
    id: Math.random()
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
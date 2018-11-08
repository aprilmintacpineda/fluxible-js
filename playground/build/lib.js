'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeStore = initializeStore;
exports.getStore = getStore;
exports.updateStore = updateStore;
exports.addObserver = addObserver;
exports.addEvent = addEvent;
exports.emitEvent = emitEvent;


var eventBus = {};
var observers = [];
var store = {};

var persistStorage = 0;
var persistRestore = 0;
var persistTimeout = 0;
var persistedStateKeys = 0;

function initializeStore(config) {
  store = config.initialStore;

  if (config.persist) {
    persistStorage = config.persist.storage;
    persistRestore = config.persist.restore;

    var persistedStates = persistRestore(JSON.parse(persistStorage.getItem('fluxible-js')) || {});

    persistedStateKeys = Object.keys(persistedStates);

    for (var a = 0; a < persistedStateKeys.length; a++) {
      store[persistedStateKeys[a]] = persistedStates[persistedStateKeys[a]];
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

  for (var _a = 0; _a < observers.length; _a++) {
    if (updatedStateKeys.length < observers[_a].wantedKeys.length) {
      for (var b = 0; b < updatedStateKeys.length; b++) {
        if (observers[_a].wantedKeys.indexOf(updatedStateKeys[b]) !== -1) {
          observers[_a].callback(store);
          break;
        }
      }
    } else {
      for (var _b = 0; _b < observers[_a].wantedKeys.length; _b++) {
        if (updatedStateKeys.indexOf(observers[_a].wantedKeys[_b]) !== -1) {
          observers[_a].callback(store);
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

function addEvent(ev, callback) {
  if (eventBus[ev] === undefined) {
    eventBus[ev] = [callback];
  } else {
    eventBus[ev].push(callback);
  }
}

function emitEvent(ev, payload) {
  if (!eventBus[ev]) {
    return -1;
  }

  for (var a = 0; a < eventBus[ev].length; a++) {
    eventBus[ev][a](payload);
  }
}
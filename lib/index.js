"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeStore = initializeStore;
exports.getStore = getStore;
exports.updateStore = updateStore;
exports.addObserver = addObserver;
exports.addEvent = addEvent;
exports.emitEvent = emitEvent;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var eventBus = {};
var observers = [];
var store = {};
var shouldPersist = false;
var persistStorage = 0;
var persistTimeout = 0;
var persistedStateKeys = 0;

function initializeStore(config) {
  store = _objectSpread({}, config.initialStore);

  if (config.persist) {
    var persistedStates = config.persist.restore(JSON.parse(config.persist.storage.getItem('fluxible-js')) || {});
    persistedStateKeys = Object.keys(persistedStates);
    persistStorage = config.persist.storage;

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
    clearTimeout(persistTimeout);
    persistTimeout = 0;
  }

  var updatedStateKeys = Object.keys(updatedStates);

  for (var a = 0; a < updatedStateKeys.length; a++) {
    store[updatedStateKeys[a]] = updatedStates[updatedStateKeys[a]];

    if (!shouldPersist && persistedStateKeys !== 0 && persistedStateKeys.indexOf(updatedStateKeys[a]) !== -1) {
      shouldPersist = true;
    }
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

  if (shouldPersist) {
    persistTimeout = setTimeout(function () {
      if (persistTimeout !== 0) {
        var statesToSave = {};

        for (var _a2 = 0; _a2 < persistedStateKeys.length; _a2++) {
          statesToSave[persistedStateKeys[_a2]] = store[persistedStateKeys[_a2]];
        }

        persistStorage.setItem('fluxible-js', JSON.stringify(statesToSave));
        shouldPersist = false;
      }
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
  if (!eventBus[ev]) {
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
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeStore = initializeStore;
exports.updateStore = updateStore;
exports.addObserver = addObserver;
exports.addEvent = addEvent;
exports.emitEvent = emitEvent;
exports.store = void 0;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var eventBus = {};
var observers = [];
var id = 0;
var removedObserverIndex = null;
var shouldPersist = false;
var persistStorage = 0;
var persistTimeout = 0;
var persistedStateKeys = 0;
var persistedStateKeysLen = 0;
var store = {};
exports.store = store;

function exists(arr, needle) {
  for (var a = 0, len = arr.length; a < len; a += 1) {
    if (arr[a] === needle) {
      return true;
    }
  }

  return false;
}

function initializeStore(config) {
  exports.store = store = _objectSpread({}, config.initialStore);

  if ('persist' in config) {
    var persistedStates = config.persist.restore(JSON.parse(config.persist.storage.getItem('fluxible-js')) || {});
    persistedStateKeys = Object.keys(persistedStates);
    persistedStateKeysLen = persistedStateKeys.length;
    persistStorage = config.persist.storage;

    for (var a = 0; a < persistedStateKeysLen; a += 1) {
      store[persistedStateKeys[a]] = persistedStates[persistedStateKeys[a]];
    }
  }
}

function updateStore(updatedStates) {
  if (persistTimeout !== 0) {
    clearTimeout(persistTimeout);
    persistTimeout = 0;
  }

  var updatedStateKeys = Object.keys(updatedStates);
  var updatedStateKeysLen = updatedStateKeys.length;

  for (var a = 0; a < updatedStateKeysLen; a += 1) {
    store[updatedStateKeys[a]] = updatedStates[updatedStateKeys[a]];

    if (!shouldPersist && persistedStateKeys !== 0 && exists(persistedStateKeys, updatedStateKeys[a])) {
      shouldPersist = true;
    }
  }

  for (var _a = 0, observersLen = observers.length; _a < observersLen; _a += 1) {
    if (observers[_a]) {
      var wantedKeysLen = observers[_a].wantedKeys.length;

      if (updatedStateKeysLen < wantedKeysLen) {
        for (var b = 0; b < updatedStateKeysLen; b += 1) {
          if (exists(observers[_a].wantedKeys, updatedStateKeys[b])) {
            observers[_a].callback();

            break;
          }
        }
      } else {
        for (var _b = 0; _b < updatedStateKeysLen; _b += 1) {
          if (exists(updatedStateKeys, observers[_a].wantedKeys[_b])) {
            observers[_a].callback();

            break;
          }
        }
      }

      if (removedObserverIndex !== null) {
        if (removedObserverIndex <= _a) {
          _a -= 1;
        }

        removedObserverIndex = null;
      }
    }
  }

  if (shouldPersist) {
    persistTimeout = setTimeout(function () {
      if (persistTimeout !== 0) {
        var statesToSave = {};

        for (var _a2 = 0; _a2 < persistedStateKeysLen; _a2 += 1) {
          statesToSave[persistedStateKeys[_a2]] = store[persistedStateKeys[_a2]];
        }

        persistStorage.setItem('fluxible-js', JSON.stringify(statesToSave));
        shouldPersist = false;
      }
    }, 200);
  }
}

function addObserver(callback, wantedKeys) {
  var thisId = id;
  observers.push({
    callback: callback,
    wantedKeys: wantedKeys,
    id: thisId
  });
  id += 1;
  return function () {
    for (var a = 0, observersLen = observers.length; a < observersLen; a += 1) {
      if (observers[a] && observers[a].id === thisId) {
        removedObserverIndex = a;
        return observers.splice(a, 1);
      }
    }
  };
}

function addEvent(ev, callback) {
  if (ev in eventBus) {
    eventBus[ev].push(callback);
  } else {
    eventBus[ev] = [callback];
  }
}

function emitEvent(ev, payload) {
  if (ev in eventBus) {
    var eventBusLen = eventBus[ev].length;

    for (var a = 0; a < eventBusLen; a += 1) {
      if (eventBus[ev][a]) {
        eventBus[ev][a](payload);
      }
    }
  }

  return -1;
}
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
var shouldPersist = false;
var persistStorage = 0;
var persistTimeout = 0;
var persistedStateKeys = 0;
var persistedStateKeysLen = 0;
var store = {};
exports.store = store;

function exists(arr, needle) {
  var len = arr.length;
  var a = 0;

  while (a < len) {
    if (arr[a] === needle) {
      return true;
    }

    ++a;
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
    var a = 0;

    while (a < persistedStateKeysLen) {
      store[persistedStateKeys[a]] = persistedStates[persistedStateKeys[a]];
      ++a;
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
  var a = 0;

  while (a < updatedStateKeysLen) {
    store[updatedStateKeys[a]] = updatedStates[updatedStateKeys[a]];

    if (persistedStateKeys !== 0 && !shouldPersist && exists(persistedStateKeys, updatedStateKeys[a])) {
      shouldPersist = true;
    }

    ++a;
  }

  var observersLen = observers.length;
  a = 0;

  while (a < observersLen) {
    var wantedKeysLen = observers[a].wantedKeys.length;

    if (updatedStateKeysLen < wantedKeysLen) {
      var b = 0;

      while (b < updatedStateKeysLen) {
        if (exists(observers[a].wantedKeys, updatedStateKeys[b])) {
          observers[a].callback();
          break;
        }

        ++b;
      }
    } else {
      var _b = 0;

      while (_b < updatedStateKeysLen) {
        if (exists(updatedStateKeys, observers[a].wantedKeys[_b])) {
          observers[a].callback();
          break;
        }

        ++_b;
      }
    }

    ++a;
  }

  if (shouldPersist) {
    persistTimeout = setTimeout(function () {
      if (persistTimeout !== 0) {
        var statesToSave = {};
        var _a = 0;

        while (_a < persistedStateKeysLen) {
          statesToSave[persistedStateKeys[_a]] = store[persistedStateKeys[_a]];
          ++_a;
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
  ++id;
  return function () {
    var observersLen = observers.length;
    var a = 0;

    while (a < observersLen) {
      if (observers[a].id === thisId) {
        return observers.splice(a, 1);
      }

      ++a;
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
    var a = 0;

    while (a < eventBusLen) {
      eventBus[ev][a](payload);
      ++a;
    }
  }

  return -1;
}
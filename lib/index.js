"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeStore = initializeStore;
exports.updateStore = updateStore;
exports.addObserver = addObserver;
exports.addEvent = addEvent;
exports.addEvents = addEvents;
exports.removeEvent = removeEvent;
exports.removeEvents = removeEvents;
exports.emitEvent = emitEvent;
exports.emitEvents = emitEvents;
exports.store = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/** @format */

/** @fluxible-no-synth-events */
var eventBus = {};
var emitEventCycle = null;
/** @end-fluxible-no-synth-events */

var observers = [];
var id = 0;
var updatePointer = 0;
/** @fluxible-config-no-persist */

var shouldPersist = false;
var persistStorage = null;
var persistTimeout = null;
var persistedStateKeys = null;
/** @end-fluxible-config-no-persist */

/** @fluxible-config-no-JSON */

/** @fluxible-config-use-JSON */

var useJSON = true;
/** @end-fluxible-config-use-JSON */

/** @end-fluxible-config-no-JSON */

var store = {};
exports.store = store;

function initializeStore(config,
/** @fluxible-config-no-persist */
asyncInitCallback
/** @end-fluxible-config-no-persist */
) {
  exports.store = store = config.initialStore;
  /** @fluxible-config-no-JSON */

  /** @fluxible-config-use-JSON */

  if (config.useJSON === false) useJSON = false;
  /** @end-fluxible-config-use-JSON */

  /** @end-fluxible-config-no-JSON */

  /** @fluxible-config-no-persist */

  /** @fluxible-config-persist */

  if ('persist' in config) {
    if ('asyncStorage' in config.persist) {
      /** @end-fluxible-config-persist */

      /** @fluxible-config-sync */
      persistStorage = config.persist.asyncStorage;
      persistStorage.getItem('fluxible-js').then(function (savedStore) {
        var parsedSavedStore = savedStore ?
        /** @fluxible-config-no-JSON */

        /** @fluxible-config-use-JSON */
        useJSON ?
        /** @end-fluxible-config-use-JSON */
        JSON.parse(savedStore)
        /** @fluxible-config-use-JSON */
        :
        /** @end-fluxible-config-no-JSON */
        savedStore
        /** @end-fluxible-config-use-JSON */
        : store;
        var persistedStates = config.persist.restore(_objectSpread(_objectSpread({}, store), parsedSavedStore));
        persistedStateKeys = Object.keys(persistedStates);
        persistedStateKeys.forEach(function (field) {
          store[field] = persistedStates[field];
        });
        if (asyncInitCallback) asyncInitCallback();
      });
      /** @end-fluxible-config-sync */

      /** @fluxible-config-persist */
    } else {
      /** @end-fluxible-config-persist */

      /** @fluxible-config-async */
      persistStorage = config.persist.syncStorage;
      var savedStore = persistStorage.getItem('fluxible-js');
      var parsedSavedStore = savedStore ?
      /** @fluxible-config-no-JSON */

      /** @fluxible-config-use-JSON */
      useJSON ?
      /** @end-fluxible-config-use-JSON */
      JSON.parse(savedStore)
      /** @fluxible-config-use-JSON */
      :
      /** @end-fluxible-config-no-JSON */
      savedStore
      /** @end-fluxible-config-use-JSON */
      : store;
      var persistedStates = config.persist.restore(_objectSpread(_objectSpread({}, store), parsedSavedStore));
      persistedStateKeys = Object.keys(persistedStates);
      persistedStateKeys.forEach(function (field) {
        store[field] = persistedStates[field];
      });
      /** @end-fluxible-config-async */

      /** @fluxible-config-persist */
    }
  }
  /** @end-fluxible-config-persist */

  /** @end-fluxible-config-no-persist */

}

function updateStore(updatedStates) {
  /** @fluxible-config-no-persist */
  if (persistTimeout) {
    clearTimeout(persistTimeout);
    persistTimeout = null;
  }
  /** @end-fluxible-config-no-persist */


  var updatedStateKeys = Object.keys(updatedStates);
  var updatedStateKeysLen = updatedStateKeys.length;
  updatedStateKeys.forEach(function (field) {
    store[field] = updatedStates[field];
    /** @fluxible-config-no-persist */

    /**
     * We only want to do this if
     * - we have not previously stopped the persist timeout.
     * - There's no scheduled persist to run.
     * - One of the updated states was persisted.
     */

    if (
    /** @fluxible-config-persist */
    persistedStateKeys &&
    /** @end-fluxible-config-persist */
    !shouldPersist && persistedStateKeys.indexOf(field) > -1) shouldPersist = true;
    /** @end-fluxible-config-no-persist */
  }); // only notify observers that observes the store keys that were updated

  updatePointer = 0;
  var observersLen = observers.length;

  for (; updatePointer < observersLen; updatePointer++) {
    var observer = observers[updatePointer];

    if (observer) {
      var keys = observer.keys,
          callback = observer.callback;
      var keysLen = keys.length; // we want to maximize performance, so we loop as little as possible

      if (updatedStateKeysLen < keysLen) {
        for (var b = 0; b < updatedStateKeysLen; b++) {
          if (keys.indexOf(updatedStateKeys[b]) > -1) {
            callback();
            break;
          }
        }
      } else {
        // they are either of the same length or
        // the keys is less than the updatedStateKeys
        for (var _b = 0; _b < keysLen; _b++) {
          if (updatedStateKeys.indexOf(keys[_b]) > -1) {
            callback();
            break;
          }
        }
      }
    }
  }

  updatePointer = 0;
  /** @fluxible-config-no-persist */

  /**
   * We should only save states to the store when a
   * persisted state has been updated.
   *
   * We also take into consideration if we have previously
   * stopped a persist timeout.
   */

  if (shouldPersist) {
    // Wait 200ms relative to the last updateStore
    persistTimeout = setTimeout(function () {
      /**
       * in case we are next in stack and the persistTimeout
       * has just been cleared, we shouldn't save states to the store.
       */
      if (persistTimeout) {
        var statesToSave = {};
        persistedStateKeys.forEach(function (field) {
          statesToSave[field] = store[field];
        });
        persistStorage.setItem('fluxible-js',
        /** @fluxible-config-no-JSON */

        /** @fluxible-config-use-JSON */
        useJSON ?
        /** @end-fluxible-config-use-JSON */
        JSON.stringify(statesToSave)
        /** @fluxible-config-use-JSON */
        :
        /** @end-fluxible-config-no-JSON */
        statesToSave
        /** @end-fluxible-config-use-JSON */
        );
        shouldPersist = false;
      }
    }, 200);
  }
  /** @end-fluxible-config-no-persist */

}

function addObserver(callback, keys) {
  var observerId = id;
  observers.push({
    callback: callback,
    keys: keys,
    id: observerId
  });
  id++;
  return function () {
    var observersLen = observers.length;

    for (var a = 0; a < observersLen; a++) {
      var observer = observers[a];

      if (observer && observer.id === observerId) {
        /**
         * when an observer unsubscribed during an update cycle
         * we want to shift the pointer 1 point to the left
         */
        if (updatePointer !== null && a <= updatePointer) updatePointer--;
        return observers.splice(a, 1);
      }
    }
  };
}
/** @fluxible-no-synth-events */


function addEvent(targetEv, callback) {
  if (targetEv in eventBus) eventBus[targetEv].push(callback);else eventBus[targetEv] = [callback];
  return function () {
    if (targetEv in eventBus) {
      var eventBusLen = eventBus[targetEv].length;

      for (var a = 0; a < eventBusLen; a++) {
        if (eventBus[targetEv][a] === callback) {
          /**
           * when an event was removed during an emit cycle
           * we want to shift the emit pointer 1 point to the left
           */
          if (emitEventCycle && emitEventCycle.ev === targetEv && a <= emitEventCycle.pointer) {
            emitEventCycle.pointer--;
            emitEventCycle.eventBusLen--;
          }

          return eventBus[targetEv].splice(a, 1);
        }
      }
    }

    return -1;
  };
}

function addEvents(evs, callback) {
  var removeEventCallbacks = evs.map(function (ev) {
    return addEvent(ev, callback);
  });
  return function () {
    removeEventCallbacks.forEach(function (removeEvent) {
      removeEvent();
    });
  };
}

function removeEvent(ev) {
  if (!(ev in eventBus)) return -1;
  delete eventBus[ev];
}

function removeEvents(evs) {
  evs.forEach(function (ev) {
    removeEvent(ev);
  });
}

function emitEvent(ev, payload) {
  if (!(ev in eventBus)) return -1;
  emitEventCycle = {
    ev: ev,
    pointer: 0,
    eventBusLen: eventBus[ev].length
  };

  for (; emitEventCycle.pointer < emitEventCycle.eventBusLen; emitEventCycle.pointer++) {
    var callback = eventBus[ev][emitEventCycle.pointer];
    if (callback) callback(payload, ev);
  }

  emitEventCycle = null;
}

function emitEvents(evs, payload) {
  evs.forEach(function (ev) {
    emitEvent(ev, payload);
  });
}
/** @end-fluxible-no-synth-events */
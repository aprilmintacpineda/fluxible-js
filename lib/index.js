"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeStore = initializeStore;
exports.updateStore = updateStore;
exports.addObserver = addObserver;
exports.addEvent = addEvent;
exports.removeEventCallback = removeEventCallback;
exports.removeEvent = removeEvent;
exports.emitEvent = emitEvent;
exports.store = void 0;

/** @format */

/** @fluxible-no-synth-events */
var eventBus = {};
var emitEventCycle = null;
/** @end-fluxible-no-synth-events */

var observers = [];
var id = 0;
var updateCounter = null;
/** @fluxible-config-no-persist */

var shouldPersist = false;
var persistStorage = 0;
var persistTimeout = 0;
var persistedStateKeys = 0;
var persistedStateKeysLen = 0;
/** @end-fluxible-config-no-persist */

/** @fluxible-config-no-JSON */

/** @fluxible-config-use-JSON */

var useJSON = true;
/** @end-fluxible-config-use-JSON */

/** @end-fluxible-config-no-JSON */

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
  exports.store = store = config.initialStore;
  /** @fluxible-config-no-JSON */

  /** @fluxible-config-use-JSON */

  if (config.useJSON === false) {
    useJSON = false;
  }
  /** @end-fluxible-config-use-JSON */

  /** @end-fluxible-config-no-JSON */

  /** @fluxible-config-no-persist */

  /** @fluxible-config-persist */


  if ('persist' in config) {
    if ('asyncStorage' in config.persist) {
      /** @end-fluxible-config-persist */

      /** @fluxible-config-sync */
      store.asyncInitDone = false;
      config.persist.asyncStorage.getItem('fluxible-js').then(function (savedStore) {
        var persistedStates = config.persist.restore(savedStore ?
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
        : store);
        persistedStateKeys = Object.keys(persistedStates);
        persistedStateKeysLen = persistedStateKeys.length;
        persistStorage = config.persist.asyncStorage;

        for (var a = 0; a < persistedStateKeysLen; a += 1) {
          store[persistedStateKeys[a]] = persistedStates[persistedStateKeys[a]];
        }

        store.asyncInitDone = true; // notify all observers
        // only notify observers that observes the store keys that were updated

        updateCounter = 0;

        for (var observersLen = observers.length; updateCounter < observersLen; updateCounter += 1) {
          if (observers[updateCounter]) {
            observers[updateCounter].callback(true);
          }
        }

        updateCounter = null;
      });
      /** @end-fluxible-config-sync */

      /** @fluxible-config-persist */
    } else {
      /** @end-fluxible-config-persist */

      /** @fluxible-config-async */
      var savedStore = config.persist.syncStorage.getItem('fluxible-js');
      var persistedStates = config.persist.restore(savedStore ?
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
      : store);
      persistedStateKeys = Object.keys(persistedStates);
      persistedStateKeysLen = persistedStateKeys.length;
      persistStorage = config.persist.syncStorage;

      for (var a = 0; a < persistedStateKeysLen; a += 1) {
        store[persistedStateKeys[a]] = persistedStates[persistedStateKeys[a]];
      }
      /** @end-fluxible-config-async */

      /** @fluxible-config-persist */

    }
  }
  /** @end-fluxible-config-persist */

  /** @end-fluxible-config-no-persist */

}

function updateStore(updatedStates) {
  /** @fluxible-config-no-persist */
  if (persistTimeout !== 0) {
    clearTimeout(persistTimeout);
    persistTimeout = 0;
  }
  /** @end-fluxible-config-no-persist */


  var updatedStateKeys = Object.keys(updatedStates);
  var updatedStateKeysLen = updatedStateKeys.length;

  for (var a = 0; a < updatedStateKeysLen; a += 1) {
    store[updatedStateKeys[a]] = updatedStates[updatedStateKeys[a]];
    /** @fluxible-config-no-persist */

    /**
     * We only want to do this if
     * - we have not previously stopped the persist timeout.
     * - There's no scheduled persist to run.
     * - One of the updated states was persisted.
     */

    if (
    /** @fluxible-config-persist */
    persistedStateKeys !== 0 &&
    /** @end-fluxible-config-persist */
    !shouldPersist && exists(persistedStateKeys, updatedStateKeys[a])) {
      shouldPersist = true;
    }
    /** @end-fluxible-config-no-persist */

  } // only notify observers that observes the store keys that were updated


  updateCounter = 0;

  for (var observersLen = observers.length; updateCounter < observersLen; updateCounter += 1) {
    if (observers[updateCounter]) {
      var wantedKeysLen = observers[updateCounter].wantedKeys.length; // we want to maximize performance, so we loop as little as possible

      if (updatedStateKeysLen === 1 && exists(observers[updateCounter].wantedKeys, updatedStateKeys[0]) || wantedKeysLen === 1 && exists(updatedStateKeys, observers[updateCounter].wantedKeys[0])) {
        observers[updateCounter].callback();
      } else if (updatedStateKeysLen < wantedKeysLen) {
        for (var b = 0; b < updatedStateKeysLen; b += 1) {
          if (exists(observers[updateCounter].wantedKeys, updatedStateKeys[b])) {
            observers[updateCounter].callback();
            break;
          }
        }
      } else {
        // they are either of the same length or
        // the wantedKeys is less than the updatedStateKeys
        for (var _b = 0; _b < wantedKeysLen; _b += 1) {
          if (exists(updatedStateKeys, observers[updateCounter].wantedKeys[_b])) {
            observers[updateCounter].callback();
            break;
          }
        }
      }
    }
  }

  updateCounter = null;
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
      if (persistTimeout !== 0) {
        var statesToSave = {};

        for (var _a = 0; _a < persistedStateKeysLen; _a += 1) {
          statesToSave[persistedStateKeys[_a]] = store[persistedStateKeys[_a]];
        }

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
        /**
         * this will ensure that we don't miss an observer due
         * to unsubscription during update
         */
        if (updateCounter !== null && a <= updateCounter) {
          updateCounter -= 1;
        }

        return observers.splice(a, 1);
      }
    }
  };
}
/** @fluxible-no-synth-events */


function addEvent(ev, callback) {
  if (ev in eventBus) {
    eventBus[ev].push(callback);
  } else {
    eventBus[ev] = [callback];
  }

  return function () {
    return removeEventCallback(ev, callback);
  };
}

function removeEventCallback(ev, callback) {
  if (ev in eventBus) {
    var eventBusLen = eventBus[ev].length;

    for (var a = 0; a < eventBusLen; a += 1) {
      if (eventBus[ev][a] === callback) {
        /**
         * this will ensure that we don't miss an event
         * listener due to unsubscription during emitEvent
         */
        if (emitEventCycle !== null && emitEventCycle.ev === ev && a <= emitEventCycle.counter) {
          emitEventCycle.counter -= 1;
        }

        return eventBus[ev].splice(a, 1);
      }
    }
  }

  return -1;
}

function removeEvent(ev) {
  if (ev in eventBus === false) {
    return -1;
  }

  delete eventBus[ev];
}

function emitEvent(ev, payload) {
  if (ev in eventBus === false) {
    return -1;
  }

  emitEventCycle = {
    ev: ev,
    counter: 0
  };

  for (var eventBusLen = eventBus[ev].length; emitEventCycle.counter < eventBusLen; emitEventCycle.counter += 1) {
    if (eventBus[ev][emitEventCycle.counter]) {
      eventBus[ev][emitEventCycle.counter](payload);
    }
  }

  emitEventCycle = null;
}
/** @end-fluxible-no-synth-events */
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

/** @format */

/** @fluxible-no-synth-events */
var eventBus = {};
var emitEventCycle = null;
/** @end-fluxible-no-synth-events */

var observers = [];
var id = 0;
var updateCounter = 0;
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
        persistStorage = config.persist.asyncStorage;
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
      persistStorage = config.persist.syncStorage;
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

  updateCounter = 0;

  for (var observersLen = observers.length; updateCounter < observersLen; updateCounter++) {
    var observer = observers[updateCounter];

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

  updateCounter = 0;
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
    for (var a = 0, observersLen = observers.length; a < observersLen; a++) {
      if (observers[a] && observers[a].id === observerId) {
        /**
         * this will ensure that we don't miss an observer due
         * to unsubscription during update
         */
        if (updateCounter !== null && a <= updateCounter) updateCounter -= 1;
        return observers.splice(a, 1);
      }
    }
  };
}
/** @fluxible-no-synth-events */


function addEvent(ev, callback) {
  if (ev in eventBus) eventBus[ev].push(callback);else eventBus[ev] = [callback];
  return function () {
    if (ev in eventBus) {
      var eventBusLen = eventBus[ev].length;

      for (var a = 0; a < eventBusLen; a++) {
        if (eventBus[ev][a] === callback) {
          /**
           * this will ensure that we don't miss an event
           * listener due to unsubscription during emitEvent
           */
          if (emitEventCycle && eventBusLen > 1 && emitEventCycle.ev === ev && a <= emitEventCycle.counter) emitEventCycle.counter -= 1;
          return eventBus[ev].splice(a, 1);
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
    counter: 0
  };

  for (var eventBusLen = eventBus[ev].length; emitEventCycle.counter < eventBusLen; emitEventCycle.counter++) {
    if (eventBus[ev][emitEventCycle.counter]) eventBus[ev][emitEventCycle.counter](payload);
  }

  emitEventCycle = null;
}

function emitEvents(evs, payload) {
  evs.forEach(function (ev) {
    emitEvent(ev, payload);
  });
}
/** @end-fluxible-no-synth-events */
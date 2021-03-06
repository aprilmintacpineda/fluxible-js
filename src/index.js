/** @format */

/** @fluxible-no-synth-events */
const eventBus = {};
let emitEventCycle = null;
/** @end-fluxible-no-synth-events */
const observers = [];
let id = 0;
let updatePointer = 0;

/** @fluxible-config-no-persist */
let shouldPersist = false;
let persistStorage = null;
let persistTimeout = null;
let persistedStateKeys = null;
/** @end-fluxible-config-no-persist */

/** @fluxible-config-no-JSON */
/** @fluxible-config-use-JSON */
let useJSON = true;
/** @end-fluxible-config-use-JSON */
/** @end-fluxible-config-no-JSON */

export let store = {};

export function initializeStore (
  config,
  /** @fluxible-config-no-persist */
  asyncInitCallback
  /** @end-fluxible-config-no-persist */
) {
  store = config.initialStore;

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

      persistStorage.getItem('fluxible-js').then(savedStore => {
        const parsedSavedStore = savedStore
          ? /** @fluxible-config-no-JSON */
            /** @fluxible-config-use-JSON */
            useJSON
            ? /** @end-fluxible-config-use-JSON */
              JSON.parse(savedStore) /** @fluxible-config-use-JSON */
            : /** @end-fluxible-config-no-JSON */ savedStore /** @end-fluxible-config-use-JSON */
          : store;

        const persistedStates = config.persist.restore({
          ...store,
          ...parsedSavedStore
        });

        persistedStateKeys = Object.keys(persistedStates);

        persistedStateKeys.forEach(field => {
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
      const savedStore = persistStorage.getItem('fluxible-js');

      const parsedSavedStore = savedStore
        ? /** @fluxible-config-no-JSON */
          /** @fluxible-config-use-JSON */
          useJSON
          ? /** @end-fluxible-config-use-JSON */
            JSON.parse(savedStore) /** @fluxible-config-use-JSON */
          : /** @end-fluxible-config-no-JSON */ savedStore /** @end-fluxible-config-use-JSON */
        : store;

      const persistedStates = config.persist.restore({
        ...store,
        ...parsedSavedStore
      });

      persistedStateKeys = Object.keys(persistedStates);

      persistedStateKeys.forEach(field => {
        store[field] = persistedStates[field];
      });
      /** @end-fluxible-config-async */
      /** @fluxible-config-persist */
    }
  }
  /** @end-fluxible-config-persist */
  /** @end-fluxible-config-no-persist */
}

export function updateStore (updatedStates) {
  /** @fluxible-config-no-persist */
  if (persistTimeout) {
    clearTimeout(persistTimeout);
    persistTimeout = null;
  }
  /** @end-fluxible-config-no-persist */

  const updatedStateKeys = Object.keys(updatedStates);
  const updatedStateKeysLen = updatedStateKeys.length;

  updatedStateKeys.forEach(field => {
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
      !shouldPersist &&
      persistedStateKeys.indexOf(field) > -1
    )
      shouldPersist = true;
    /** @end-fluxible-config-no-persist */
  });

  // only notify observers that observes the store keys that were updated
  updatePointer = 0;

  const observersLen = observers.length;

  for (; updatePointer < observersLen; updatePointer++) {
    const observer = observers[updatePointer];

    if (observer) {
      const { keys, callback } = observer;
      const keysLen = keys.length;

      // we want to maximize performance, so we loop as little as possible
      if (updatedStateKeysLen < keysLen) {
        for (let b = 0; b < updatedStateKeysLen; b++) {
          if (keys.indexOf(updatedStateKeys[b]) > -1) {
            callback();
            break;
          }
        }
      } else {
        // they are either of the same length or
        // the keys is less than the updatedStateKeys
        for (let b = 0; b < keysLen; b++) {
          if (updatedStateKeys.indexOf(keys[b]) > -1) {
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
    persistTimeout = setTimeout(() => {
      /**
       * in case we are next in stack and the persistTimeout
       * has just been cleared, we shouldn't save states to the store.
       */
      if (persistTimeout) {
        const statesToSave = {};

        persistedStateKeys.forEach(field => {
          statesToSave[field] = store[field];
        });

        persistStorage.setItem(
          'fluxible-js',
          /** @fluxible-config-no-JSON */
          /** @fluxible-config-use-JSON */
          useJSON
            ? /** @end-fluxible-config-use-JSON */
              JSON.stringify(
                statesToSave
              ) /** @fluxible-config-use-JSON */
            : /** @end-fluxible-config-no-JSON */ statesToSave
          /** @end-fluxible-config-use-JSON */
        );

        shouldPersist = false;
      }
    }, 200);
  }
  /** @end-fluxible-config-no-persist */
}

export function addObserver (callback, keys) {
  const observerId = id;

  observers.push({
    callback,
    keys,
    id: observerId
  });

  id++;

  return () => {
    const observersLen = observers.length;

    for (let a = 0; a < observersLen; a++) {
      const observer = observers[a];

      if (observer && observer.id === observerId) {
        /**
         * when an observer unsubscribed during an update cycle
         * we want to shift the pointer 1 point to the left
         */
        if (updatePointer !== null && a <= updatePointer)
          updatePointer--;
        return observers.splice(a, 1);
      }
    }
  };
}

/** @fluxible-no-synth-events */
export function addEvent (targetEv, callback) {
  if (targetEv in eventBus) eventBus[targetEv].push(callback);
  else eventBus[targetEv] = [callback];

  return () => {
    if (targetEv in eventBus) {
      const eventBusLen = eventBus[targetEv].length;

      for (let a = 0; a < eventBusLen; a++) {
        if (eventBus[targetEv][a] === callback) {
          /**
           * when an event was removed during an emit cycle
           * we want to shift the emit pointer 1 point to the left
           */
          if (
            emitEventCycle &&
            emitEventCycle.event === targetEv &&
            a <= emitEventCycle.pointer
          ) {
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

export function addEvents (events, callback) {
  const removeEventCallbacks = events.map(event =>
    addEvent(event, callback)
  );

  return () => {
    removeEventCallbacks.forEach(removeEvent => {
      removeEvent();
    });
  };
}

export function removeEvent (event) {
  if (!(event in eventBus)) return -1;
  delete eventBus[event];
}

export function removeEvents (events) {
  events.forEach(event => {
    removeEvent(event);
  });
}

export function emitEvent (event, payload) {
  if (!(event in eventBus)) return -1;

  emitEventCycle = {
    event,
    pointer: 0,
    eventBusLen: eventBus[event].length
  };

  for (
    ;
    emitEventCycle.pointer < emitEventCycle.eventBusLen;
    emitEventCycle.pointer++
  ) {
    const callback = eventBus[event][emitEventCycle.pointer];
    if (callback) callback(payload, event);
  }

  emitEventCycle = null;
}

export function emitEvents (events, payload) {
  events.forEach(event => {
    emitEvent(event, payload);
  });
}
/** @end-fluxible-no-synth-events */

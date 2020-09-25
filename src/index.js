/** @format */

/** @fluxible-no-synth-events */
const eventBus = {};
let emitEventCycle = null;
/** @end-fluxible-no-synth-events */
const observers = [];
let id = 0;
let updateCounter = 0;

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

      config.persist.asyncStorage.getItem('fluxible-js').then(savedStore => {
        const persistedStates = config.persist.restore(
          savedStore
            ? /** @fluxible-config-no-JSON */
              /** @fluxible-config-use-JSON */
              useJSON
              ? /** @end-fluxible-config-use-JSON */
                JSON.parse(savedStore) /** @fluxible-config-use-JSON */
              : /** @end-fluxible-config-no-JSON */ savedStore /** @end-fluxible-config-use-JSON */
            : store
        );

        persistedStateKeys = Object.keys(persistedStates);
        persistStorage = config.persist.asyncStorage;

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
      const savedStore = config.persist.syncStorage.getItem('fluxible-js');
      const persistedStates = config.persist.restore(
        savedStore
          ? /** @fluxible-config-no-JSON */
            /** @fluxible-config-use-JSON */
            useJSON
            ? /** @end-fluxible-config-use-JSON */
              JSON.parse(savedStore) /** @fluxible-config-use-JSON */
            : /** @end-fluxible-config-no-JSON */ savedStore /** @end-fluxible-config-use-JSON */
          : store
      );

      persistedStateKeys = Object.keys(persistedStates);
      persistStorage = config.persist.syncStorage;

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
  updateCounter = 0;

  for (let observersLen = observers.length; updateCounter < observersLen; updateCounter++) {
    const observer = observers[updateCounter];

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
              JSON.stringify(statesToSave) /** @fluxible-config-use-JSON */
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
    for (let a = 0, observersLen = observers.length; a < observersLen; a++) {
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
export function addEvent (ev, callback) {
  if (ev in eventBus) eventBus[ev].push(callback);
  else eventBus[ev] = [callback];

  return () => {
    if (ev in eventBus) {
      const eventBusLen = eventBus[ev].length;

      for (let a = 0; a < eventBusLen; a++) {
        if (eventBus[ev][a] === callback) {
          /**
           * this will ensure that we don't miss an event
           * listener due to unsubscription during emitEvent
           */
          if (emitEventCycle && emitEventCycle.ev === ev && a <= emitEventCycle.counter)
            emitEventCycle.counter -= 1;

          return eventBus[ev].splice(a, 1);
        }
      }
    }

    return -1;
  };
}

export function addEvents (evs, callback) {
  const removeEventCallbacks = evs.map(ev => addEvent(ev, callback));

  return () => {
    removeEventCallbacks.forEach(removeEvent => {
      removeEvent();
    });
  };
}

export function removeEvent (ev) {
  if (!(ev in eventBus)) return -1;
  delete eventBus[ev];
}

export function removeEvents (evs) {
  evs.forEach(ev => {
    removeEvent(ev);
  });
}

export function emitEvent (ev, payload) {
  if (!(ev in eventBus)) return -1;

  emitEventCycle = {
    ev,
    counter: 0
  };

  for (
    let eventBusLen = eventBus[ev].length;
    emitEventCycle.counter < eventBusLen;
    emitEventCycle.counter++
  )
    if (eventBus[ev][emitEventCycle.counter]) eventBus[ev][emitEventCycle.counter](payload);

  emitEventCycle = null;
}

export function emitEvents (evs, payload) {
  evs.forEach(ev => {
    emitEvent(ev, payload);
  });
}
/** @end-fluxible-no-synth-events */

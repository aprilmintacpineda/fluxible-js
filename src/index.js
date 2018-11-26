/** @format */

const eventBus = {};
const observers = [];
let id = 0;

// state persistence
let shouldPersist = false;
let persistStorage = 0;
let persistTimeout = 0;
let persistedStateKeys = 0;
let persistedStateKeysLen = 0;

export let store = {};

function exists (arr, needle) {
  for (let a = 0, len = arr.length; a < len; a++) {
    if (arr[a] === needle) {
      return true;
    }
  }

  return false;
}

export function initializeStore (config) {
  store = { ...config.initialStore };

  if ('persist' in config) {
    const persistedStates = config.persist.restore(
      JSON.parse(config.persist.storage.getItem('fluxible-js')) || {}
    );

    persistedStateKeys = Object.keys(persistedStates);
    persistedStateKeysLen = persistedStateKeys.length;
    persistStorage = config.persist.storage;

    for (let a = 0; a < persistedStateKeysLen; a++) {
      store[persistedStateKeys[a]] = persistedStates[persistedStateKeys[a]];
    }
  }
}

export function updateStore (updatedStates) {
  if (persistTimeout !== 0) {
    clearTimeout(persistTimeout);
    persistTimeout = 0;
  }

  const updatedStateKeys = Object.keys(updatedStates);
  const updatedStateKeysLen = updatedStateKeys.length;

  for (let a = 0; a < updatedStateKeysLen; a++) {
    store[updatedStateKeys[a]] = updatedStates[updatedStateKeys[a]];

    /**
     * We only want to do this if
     * - we have not previously stopped the persist timeout.
     * - The persist feature is turned on.
     * - There's no scheduled persist to run.
     * - One of the updated states was persisted.
     */
    if (
      !shouldPersist &&
      persistedStateKeys !== 0 &&
      exists(persistedStateKeys, updatedStateKeys[a])
    ) {
      shouldPersist = true;
    }
  }

  // only notify observers that observes the store keys that were updated
  for (let a = 0, observersLen = observers.length; a < observersLen && observers[a]; a++) {
    const wantedKeysLen = observers[a].wantedKeys.length;

    // we want to maximize performance, so we loop as little as possible
    if (updatedStateKeysLen < wantedKeysLen) {
      for (let b = 0; b < updatedStateKeysLen; b++) {
        if (exists(observers[a].wantedKeys, updatedStateKeys[b])) {
          observers[a].callback();
          break;
        }
      }
    } else {
      // they are either of the same length or
      // the wantedKeys is less than the updatedStateKeys
      for (let b = 0; b < updatedStateKeysLen; b++) {
        if (exists(updatedStateKeys, observers[a].wantedKeys[b])) {
          observers[a].callback();
          break;
        }
      }
    }
  }

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
      if (persistTimeout !== 0) {
        const statesToSave = {};

        for (let a = 0; a < persistedStateKeysLen; a++) {
          statesToSave[persistedStateKeys[a]] = store[persistedStateKeys[a]];
        }

        persistStorage.setItem('fluxible-js', JSON.stringify(statesToSave));
        shouldPersist = false;
      }
    }, 200);
  }
}

export function addObserver (callback, wantedKeys) {
  const thisId = id;

  observers.push({
    callback,
    wantedKeys,
    id: thisId
  });

  ++id;

  return () => {
    for (let a = 0, observersLen = observers.length; a < observersLen && observers[a]; a++) {
      if (observers[a].id === thisId) {
        return observers.splice(a, 1);
      }
    }
  };
}

export function addEvent (ev, callback) {
  if (ev in eventBus) {
    eventBus[ev].push(callback);
  } else {
    eventBus[ev] = [callback];
  }
}

export function emitEvent (ev, payload) {
  if (ev in eventBus) {
    const eventBusLen = eventBus[ev].length;

    for (let a = 0; a < eventBusLen && eventBus[ev][a]; a++) {
      eventBus[ev][a](payload);
    }
  }

  return -1;
}

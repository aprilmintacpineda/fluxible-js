/** @format */

/** @fluxible-no-synth-events */
const eventBus = {};
/** @end-fluxible-no-synth-events */
const observers = [];
let id = 0;
let removedObserverIndex = null;

/** @fluxible-config-no-persist */
let shouldPersist = false;
let persistStorage = 0;
let persistTimeout = 0;
let persistedStateKeys = 0;
let persistedStateKeysLen = 0;
/** @end-fluxible-config-no-persist */

/** @fluxible-config-no-useJSON */
let useJSON = true;
/** @end-fluxible-config-no-useJSON */

export let store = {};

function exists (arr, needle) {
  for (let a = 0, len = arr.length; a < len; a += 1) {
    if (arr[a] === needle) {
      return true;
    }
  }

  return false;
}

export function initializeStore (config) {
  store = { ...config.initialStore };

  /** @fluxible-config-no-useJSON */
  if (config.useJSON === false) {
    useJSON = false;
  }
  /** @end-fluxible-config-no-useJSON */

  /** @fluxible-config-no-persist */
  /** @fluxible-config-persist */
  if ('persist' in config) {
    if ('asyncStorage' in config.persist) {
      /** @end-fluxible-config-persist */
      /** @fluxible-config-sync */
      config.persist.asyncStorage.getItem('fluxible-js').then(savedStore => {
        const persistedStates = config.persist.restore(
          savedStore
            ? /** @fluxible-config-no-useJSON */
              useJSON
              ? /** @end-fluxible-config-no-useJSON */
                JSON.parse(savedStore)
              : /** @fluxible-config-no-useJSON */
                savedStore /** @end-fluxible-config-no-useJSON */
            : {}
        );

        persistedStateKeys = Object.keys(persistedStates);
        persistedStateKeysLen = persistedStateKeys.length;
        persistStorage = config.persist.asyncStorage;

        for (let a = 0; a < persistedStateKeysLen; a += 1) {
          store[persistedStateKeys[a]] = persistedStates[persistedStateKeys[a]];
        }
      });
      /** @end-fluxible-config-sync */
      /** @fluxible-config-persist */
    } else {
      /** @end-fluxible-config-persist */
      /** @fluxible-config-async */
      const savedStore = config.persist.syncStorage.getItem('fluxible-js');
      const persistedStates = config.persist.restore(
        savedStore
          ? /** @fluxible-config-no-useJSON */
            useJSON
            ? /** @end-fluxible-config-no-useJSON */
              JSON.parse(savedStore)
            : /** @fluxible-config-no-useJSON */
              savedStore /** @end-fluxible-config-no-useJSON */
          : {}
      );

      persistedStateKeys = Object.keys(persistedStates);
      persistedStateKeysLen = persistedStateKeys.length;
      persistStorage = config.persist.syncStorage;

      for (let a = 0; a < persistedStateKeysLen; a += 1) {
        store[persistedStateKeys[a]] = persistedStates[persistedStateKeys[a]];
      }
      /** @end-fluxible-config-async */
      /** @fluxible-config-persist */
    }
  }
  /** @end-fluxible-config-persist */
  /** @end-fluxible-config-no-persist */
}

export function updateStore (updatedStates) {
  /** @fluxible-config-no-persist */
  if (persistTimeout !== 0) {
    clearTimeout(persistTimeout);
    persistTimeout = 0;
  }
  /** @end-fluxible-config-no-persist */

  const updatedStateKeys = Object.keys(updatedStates);
  const updatedStateKeysLen = updatedStateKeys.length;

  for (let a = 0; a < updatedStateKeysLen; a += 1) {
    store[updatedStateKeys[a]] = updatedStates[updatedStateKeys[a]];

    /** @fluxible-config-no-persist */
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
    /** @end-fluxible-config-no-persist */
  }

  // only notify observers that observes the store keys that were updated
  for (let a = 0, observersLen = observers.length; a < observersLen; a += 1) {
    if (observers[a]) {
      const wantedKeysLen = observers[a].wantedKeys.length;

      // we want to maximize performance, so we loop as little as possible
      if (updatedStateKeysLen < wantedKeysLen) {
        for (let b = 0; b < updatedStateKeysLen; b += 1) {
          if (exists(observers[a].wantedKeys, updatedStateKeys[b])) {
            observers[a].callback();
            break;
          }
        }
      } else {
        // they are either of the same length or
        // the wantedKeys is less than the updatedStateKeys
        for (let b = 0; b < updatedStateKeysLen; b += 1) {
          if (exists(updatedStateKeys, observers[a].wantedKeys[b])) {
            observers[a].callback();
            break;
          }
        }
      }

      /**
       * this will ensure that we don't miss an observer due
       * to unsubscription during update
       */
      if (removedObserverIndex !== null) {
        if (removedObserverIndex <= a) {
          a -= 1;
        }

        removedObserverIndex = null;
      }
    }
  }

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
      if (persistTimeout !== 0) {
        const statesToSave = {};

        for (let a = 0; a < persistedStateKeysLen; a += 1) {
          statesToSave[persistedStateKeys[a]] = store[persistedStateKeys[a]];
        }

        persistStorage.setItem(
          'fluxible-js',
          /** @fluxible-config-no-useJSON */
          useJSON
            ? /** @end-fluxible-config-no-useJSON */
              JSON.stringify(statesToSave)
            : /** @fluxible-config-no-useJSON */
              statesToSave
          /** @end-fluxible-config-no-useJSON */
        );
        shouldPersist = false;
      }
    }, 200);
  }
  /** @end-fluxible-config-no-persist */
}

export function addObserver (callback, wantedKeys) {
  const thisId = id;

  observers.push({
    callback,
    wantedKeys,
    id: thisId
  });

  id += 1;

  return () => {
    for (let a = 0, observersLen = observers.length; a < observersLen; a += 1) {
      if (observers[a] && observers[a].id === thisId) {
        removedObserverIndex = a;
        return observers.splice(a, 1);
      }
    }
  };
}

/** @fluxible-no-synth-events */
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

    for (let a = 0; a < eventBusLen; a += 1) {
      if (eventBus[ev][a]) {
        eventBus[ev][a](payload);
      }
    }
  }

  return -1;
}
/** @end-fluxible-no-synth-events */

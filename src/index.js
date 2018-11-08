/** @format */

const eventBus = {};
const observers = [];
let store = {};
// state persistence
let shouldPersist = false;
let persistStorage = 0;
let persistTimeout = 0;
let persistedStateKeys = 0;

export function initializeStore (config) {
  store = config.initialStore;

  if (config.persist) {
    const persistedStates = config.persist.restore(
      JSON.parse(config.persist.storage.getItem('fluxible-js')) || {}
    );

    persistedStateKeys = Object.keys(persistedStates);
    persistStorage = config.persist.storage;

    for (let a = 0; a < persistedStateKeys.length; a++) {
      store[persistedStateKeys[a]] = persistedStates[persistedStateKeys[a]];
    }
  }
}

export function getStore () {
  return store;
}

export function updateStore (updatedStates) {
  if (persistTimeout !== 0) {
    clearTimeout(persistTimeout);
    persistTimeout = 0;
  }

  const updatedStateKeys = Object.keys(updatedStates);

  for (let a = 0; a < updatedStateKeys.length; a++) {
    store[updatedStateKeys[a]] = updatedStates[updatedStateKeys[a]];

    if (persistedStateKeys !== 0) {
      if (!shouldPersist && persistedStateKeys.indexOf(updatedStateKeys[a]) !== -1) {
        shouldPersist = true;
      }
    }
  }

  // only notify observers that observes the store keys that were updated
  for (let a = 0; a < observers.length; a++) {
    // we want to maximize performance, so we loop as little as possible
    if (updatedStateKeys.length < observers[a].wantedKeys.length) {
      for (let b = 0; b < updatedStateKeys.length; b++) {
        if (observers[a].wantedKeys.indexOf(updatedStateKeys[b]) !== -1) {
          observers[a].callback(store);
          break;
        }
      }
    } else {
      // they are either of the same length or
      // the wantedKeys is less than the updatedStateKeys
      for (let b = 0; b < observers[a].wantedKeys.length; b++) {
        if (updatedStateKeys.indexOf(observers[a].wantedKeys[b]) !== -1) {
          observers[a].callback(store);
          break;
        }
      }
    }
  }

  /**
   * we should only save states to the store when a
   * persisted state has been updated.
   */
  if (shouldPersist) {
    persistTimeout = setTimeout(() => {
      /**
       * in-case we are next in stack and the persistTimeout
       * has just been cleared, we shouldn't save states to the store.
       */
      if (persistTimeout !== 0) {
        const statesToSave = {};

        for (let a = 0; a < persistedStateKeys.length; a++) {
          statesToSave[persistedStateKeys[a]] = store[persistedStateKeys[a]];
        }

        persistStorage.setItem('fluxible-js', JSON.stringify(statesToSave));
        shouldPersist = false;
      }
    }, 200);
  }
}

export function addObserver (callback, wantedKeys) {
  const thisObserver = {
    callback,
    wantedKeys,
    id: Math.random()
  };

  observers.push(thisObserver);

  return () => {
    for (let a = 0; a < observers.length; a++) {
      if (observers[a].id === thisObserver.id) {
        return observers.splice(a, 1);
      }
    }
  };
}

export function addEvent (ev, callback) {
  if (eventBus[ev] === undefined) {
    eventBus[ev] = [callback];
  } else {
    eventBus[ev].push(callback);
  }
}

export function emitEvent (ev, payload) {
  if (!eventBus[ev]) {
    return -1;
  }

  for (let a = 0; a < eventBus[ev].length; a++) {
    eventBus[ev][a](payload);
  }
}

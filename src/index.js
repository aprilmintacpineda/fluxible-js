/** @format */

let observers = [];
let store = {};
let persistedStateKeys = null;
let persistStorage = null;
let persistTimeout = null;

export function initializeStore (config) {
  const initialStoreKeys = Object.keys(config.initialStore);

  if (config.persist !== undefined) {
    // get saved store from storage
    const persistedStates = config.persist.restore(
      JSON.parse(config.persist.storage.getItem('fluxible-js')) || {}
    );

    for (let a = 0; a < initialStoreKeys.length; a++) {
      store[initialStoreKeys[a]] =
        persistedStates[initialStoreKeys[a]] || config.initialStore[initialStoreKeys[a]];
    }

    // we should only save states that were restored
    persistedStateKeys = Object.keys(persistedStates);
    // save the storage
    persistStorage = config.persist.storage;
  } else {
    for (let a = 0; a < initialStoreKeys.length; a++) {
      store[initialStoreKeys[a]] = config.initialStore[initialStoreKeys[a]];
    }
  }
}

export function getStore () {
  return store;
}

export function updateStore (updatedStates) {
  if (persistedStateKeys !== null) {
    if (persistTimeout !== null) clearTimeout(persistTimeout);

    persistTimeout = setTimeout(() => {
      persistStorage.setItem(
        'fluxible-js',
        JSON.stringify(
          persistedStateKeys.reduce((compiled, key) => {
            compiled[key] = store[key];
            return compiled;
          }, {})
        )
      );
    }, 200);
  }

  const updatedStateKeys = Object.keys(updatedStates);

  for (let a = 0; a < updatedStateKeys.length; a++) {
    store[updatedStateKeys[a]] = updatedStates[updatedStateKeys[a]];
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

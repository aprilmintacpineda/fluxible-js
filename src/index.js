/** @format */

let observers = [];
let store = {};
let persistedStateKeys = null;
let persistStorage = null;
let persistTimeout = null;

export function initializeStore (config) {
  observers = [];
  store = {};
  persistedStateKeys = null;
  persistStorage = null;
  persistTimeout = null;

  if (config.persist !== undefined) {
    // persist
    let persistedStates = {};

    // set the storage first
    persistStorage = config.persist.storage;

    // get saved store from storage
    persistedStates = config.persist.restore(
      JSON.parse(persistStorage.getItem('fluxible-js')) || {}
    );

    // we should only save states that were restored
    persistedStateKeys = Object.keys(persistedStates);

    Object.keys(config.initialStore).forEach(key => {
      if (persistedStateKeys.indexOf(key) === -1) {
        store[key] = config.initialStore[key];
      } else {
        store[key] = persistedStates[key];
      }
    });
  } else {
    Object.keys(config.initialStore).forEach(key => {
      store[key] = config.initialStore[key];
    });
  }
}

export function getStore () {
  return { ...store };
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

  updatedStateKeys.forEach(key => {
    store[key] = updatedStates[key];
  });

  // only notify observers that observes the store keys that were updated
  observers.forEach(observer => {
    // we want to maximize performance, so we loop as little as possible
    if (updatedStateKeys.length < observer.wantedKeys.length) {
      for (let a = 0; a < updatedStateKeys.length; a++) {
        if (observer.wantedKeys.indexOf(updatedStateKeys[a]) !== -1) {
          observer.callback(store);
          break;
        }
      }
    } else {
      // they are either of the same length or
      // the observer.wantedKeys is less than the updatedStateKeys
      for (let a = 0; a < observer.wantedKeys.length; a++) {
        if (updatedStateKeys.indexOf(observer.wantedKeys[a]) !== -1) {
          observer.callback(store);
          break;
        }
      }
    }
  });
}

export function addObserver (callback, wantedKeys) {
  const thisObserver = {
    callback,
    wantedKeys,
    id: Math.random().toString()
  };

  observers.push(thisObserver);

  return () => {
    observers = observers.filter(observer => observer.id !== thisObserver.id);
  };
}

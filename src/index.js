/** @format */

const store = {};
const eventBus = {};
const observers = [];
// state persistence
let persistStorage = 0;
let persistRestore = 0;
let persistTimeout = 0;

export function initializeStore (config) {
  const initialStoreKeys = Object.keys(config.initialStore);

  if (config.persist) {
    persistStorage = config.persist.storage;
    persistRestore = config.persist.restore;

    const persistedStates = persistRestore(JSON.parse(persistStorage.getItem('fluxible-js')) || {});

    for (let a = 0; a < initialStoreKeys.length; a++) {
      store[initialStoreKeys[a]] =
        persistedStates[initialStoreKeys[a]] || config.initialStore[initialStoreKeys[a]];
    }
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
  if (persistTimeout !== 0) {
    persistTimeout = clearTimeout(persistTimeout);
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

  if (persistRestore !== 0) {
    persistTimeout = setTimeout(() => {
      persistStorage.setItem('fluxible-js', JSON.stringify(persistRestore(store)));
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

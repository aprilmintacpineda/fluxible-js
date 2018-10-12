/** @format */

const observers = [];
let store = {};
let persistedStateKeys;
let persistStorage;
let persistTimeout;

/**
 * initialize store.
 * @param {Object} Config that should contain the required config.initialStore and the optional config.persist
 * @return {undefined}
 */
export function initializeStore (config) {
  // persist
  let persistedStates = {};
  if (config.persist) {
    // set the storage first
    persistStorage = config.persist.storage;

    persistedStates = config.persist.restore(
      JSON.parse(persistStorage.getItem('fluxible-js')) || {}
    );

    // we should only save states that were restored
    persistedStateKeys = Object.keys(persistedStates);
  }

  store = {
    ...config.initialStore,
    ...persistedStates
  };
}

/**
 * get the most latest store.
 * @return {Object} the store
 */
export function getStore () {
  return store;
}

/**
 * updates some parts of the store.
 * @param {Object} the object containing updates on the store states.
 * @return {Promise}
 */
export function updateStore (newStates) {
  store = {
    ...store,
    ...newStates
  };

  if (persistTimeout) clearTimeout(persistTimeout);
  const updatedStates = Object.keys(newStates);

  observers.forEach(listener => {
    for (let a = 0; a < updatedStates.length; a++) {
      if (listener.states.indexOf(`{${updatedStates[a]}}`) !== -1) {
        listener.callback(store);
        break;
      }
    }
  });

  if (persistedStateKeys) {
    persistTimeout = setTimeout(() => {
      // we should only save states that were restored
      const statesToPersist = {};

      for (let a = 0; a < persistedStateKeys.length; a++) {
        statesToPersist[persistedStateKeys[a]] = store[persistedStateKeys[a]];
      }

      persistStorage.setItem('fluxible-js', JSON.stringify(statesToPersist));
    }, 200);
  }
}

/**
 * registers an update listener to be called after every store updates.
 * @param {Function} callback function
 * @return {Function} call this function to remove the listener
 */
export function addObserver (callback, states) {
  const listener = {
    callback,
    states: states.map(state => `{${state}}`).join(' ')
  };

  observers.push(listener);

  return () => {
    observers.splice(observers.indexOf(listener), 1);
  };
}

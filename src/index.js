/** @format */

const updateListeners = [];
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
export function updateStore (storeUpdates) {
  if (persistTimeout) clearTimeout(persistTimeout);

  store = {
    ...store,
    ...storeUpdates
  };

  if (persistedStateKeys) {
    persistTimeout = setTimeout(() => {
      persistStorage.setItem(
        'fluxible-js',
        JSON.stringify(
          // we should only save states that were restored
          persistedStateKeys.reduce(
            (compiled, key) => ({
              ...compiled,
              [key]: store[key]
            }),
            {}
          )
        )
      );
    }, 200);
  }

  updateListeners.forEach(callback => {
    callback();
  });
}

/**
 * registers an update listener to be called after every store updates.
 * @param {Function} callback function
 * @return {Function} call this function to remove the listener
 */
export function addUpdateListener (listener) {
  updateListeners.push(listener);

  return () => {
    updateListeners.splice(updateListeners.indexOf(listener), 1);
  };
}

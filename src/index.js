/** @format */

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

  return new Promise(resolve => {
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

    resolve();
  });
}

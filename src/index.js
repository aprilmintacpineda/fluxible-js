/** @format */

let store = {};
const updateListeners = [];
let persistedStateKeys;
let persistStorage;

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

    const savedStore = JSON.parse(persistStorage.getItem('fluxible-js'));
    persistedStates = config.persist.restore(savedStore || {});

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
 * @return {undefined}
 */
export function updateStore (storeUpdates) {
  store = {
    ...store,
    ...storeUpdates
  };

  updateListeners.forEach(callback => {
    callback();
  });

  if (persistedStateKeys) {
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
  }
}

/**
 * register a function that would be called after every store updates.
 * @param {Function} callback function.
 * @return {Function} call the function to remove this callback from the listeners.
 */
export function addListener (callback) {
  updateListeners.push(callback);

  return () => {
    updateListeners.splice(updateListeners.indexOf(callback), 1);
  };
}

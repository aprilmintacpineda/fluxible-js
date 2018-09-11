/** @format */

let store = {};
const updateListeners = [];

/**
 * initialize store.
 * @param {Object} Object that would be used as initial store
 * @return {undefined}
 */
export function initializeStore (initialStore) {
  store = {
    ...initialStore
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

/** @format */

/** @fluxible-no-synth-events */
const eventBus = {};
let emitEventCycle = null;
/** @end-fluxible-no-synth-events */
const observers = [];
let id = 0;
let updateCounter = null;

/** @fluxible-config-no-persist */
let shouldPersist = false;
let persistStorage = 0;
let persistTimeout = 0;
let persistedStateKeys = 0;
let persistedStateKeysLen = 0;
/** @end-fluxible-config-no-persist */

/** @fluxible-config-no-JSON */
/** @fluxible-config-use-JSON */
let useJSON = true;
/** @end-fluxible-config-use-JSON */
/** @end-fluxible-config-no-JSON */

export let store = {};

export function initializeStore (
  config,
  /** @fluxible-config-no-persist */
  asyncInitCallback
  /** @end-fluxible-config-no-persist */
) {
  store = config.initialStore;

  /** @fluxible-config-no-JSON */
  /** @fluxible-config-use-JSON */
  if (config.useJSON === false) useJSON = false;
  /** @end-fluxible-config-use-JSON */
  /** @end-fluxible-config-no-JSON */

  /** @fluxible-config-no-persist */
  /** @fluxible-config-persist */
  if ('persist' in config) {
    if ('asyncStorage' in config.persist) {
      /** @end-fluxible-config-persist */
      /** @fluxible-config-sync */

      config.persist.asyncStorage.getItem('fluxible-js').then(savedStore => {
        const persistedStates = config.persist.restore(
          savedStore
            ? /** @fluxible-config-no-JSON */
              /** @fluxible-config-use-JSON */
              useJSON
              ? /** @end-fluxible-config-use-JSON */
                JSON.parse(savedStore) /** @fluxible-config-use-JSON */
              : /** @end-fluxible-config-no-JSON */ savedStore /** @end-fluxible-config-use-JSON */
            : store
        );

        persistedStateKeys = Object.keys(persistedStates);
        persistedStateKeysLen = persistedStateKeys.length;
        persistStorage = config.persist.asyncStorage;

        for (let a = 0; a < persistedStateKeysLen; a++)
          store[persistedStateKeys[a]] = persistedStates[persistedStateKeys[a]];

        if (asyncInitCallback) asyncInitCallback();
      });
      /** @end-fluxible-config-sync */
      /** @fluxible-config-persist */
    } else {
      /** @end-fluxible-config-persist */
      /** @fluxible-config-async */
      const savedStore = config.persist.syncStorage.getItem('fluxible-js');
      const persistedStates = config.persist.restore(
        savedStore
          ? /** @fluxible-config-no-JSON */
            /** @fluxible-config-use-JSON */
            useJSON
            ? /** @end-fluxible-config-use-JSON */
              JSON.parse(savedStore) /** @fluxible-config-use-JSON */
            : /** @end-fluxible-config-no-JSON */ savedStore /** @end-fluxible-config-use-JSON */
          : store
      );

      persistedStateKeys = Object.keys(persistedStates);
      persistedStateKeysLen = persistedStateKeys.length;
      persistStorage = config.persist.syncStorage;

      for (let a = 0; a < persistedStateKeysLen; a++)
        store[persistedStateKeys[a]] = persistedStates[persistedStateKeys[a]];
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

  for (let a = 0; a < updatedStateKeysLen; a++) {
    store[updatedStateKeys[a]] = updatedStates[updatedStateKeys[a]];

    /** @fluxible-config-no-persist */
    /**
     * We only want to do this if
     * - we have not previously stopped the persist timeout.
     * - There's no scheduled persist to run.
     * - One of the updated states was persisted.
     */
    if (
      /** @fluxible-config-persist */
      persistedStateKeys !== 0 &&
      /** @end-fluxible-config-persist */
      !shouldPersist &&
      persistedStateKeys.indexOf(updatedStateKeys[a]) > -1
    )
      shouldPersist = true;
    /** @end-fluxible-config-no-persist */
  }

  // only notify observers that observes the store keys that were updated
  updateCounter = 0;

  for (let observersLen = observers.length; updateCounter < observersLen; updateCounter++) {
    if (observers[updateCounter]) {
      const keysLen = observers[updateCounter].keys.length;

      // we want to maximize performance, so we loop as little as possible
      if (updatedStateKeysLen === 1) {
        if (observers[updateCounter].keys.indexOf(updatedStateKeys[0]) > -1)
          observers[updateCounter].callback();
      } else if (keysLen === 1) {
        if (updatedStateKeys.indexOf(observers[updateCounter].keys[0]) > -1)
          observers[updateCounter].callback();
      } else if (updatedStateKeysLen < keysLen) {
        for (let b = 0; b < updatedStateKeysLen; b++) {
          if (observers[updateCounter].keys.indexOf(updatedStateKeys[b]) > -1) {
            observers[updateCounter].callback();
            break;
          }
        }
      } else {
        // they are either of the same length or
        // the keys is less than the updatedStateKeys
        for (let b = 0; b < keysLen; b++) {
          if (updatedStateKeys.indexOf(observers[updateCounter].keys[b]) > -1) {
            observers[updateCounter].callback();
            break;
          }
        }
      }
    }
  }

  updateCounter = null;

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

        for (let a = 0; a < persistedStateKeysLen; a++)
          statesToSave[persistedStateKeys[a]] = store[persistedStateKeys[a]];

        persistStorage.setItem(
          'fluxible-js',
          /** @fluxible-config-no-JSON */
          /** @fluxible-config-use-JSON */
          useJSON
            ? /** @end-fluxible-config-use-JSON */
              JSON.stringify(statesToSave) /** @fluxible-config-use-JSON */
            : /** @end-fluxible-config-no-JSON */ statesToSave
          /** @end-fluxible-config-use-JSON */
        );
        shouldPersist = false;
      }
    }, 200);
  }
  /** @end-fluxible-config-no-persist */
}

export function addObserver (callback, keys) {
  const thisId = id;

  observers.push({
    callback,
    keys,
    id: thisId
  });

  id++;

  return () => {
    for (let a = 0, observersLen = observers.length; a < observersLen; a++) {
      if (observers[a] && observers[a].id === thisId) {
        /**
         * this will ensure that we don't miss an observer due
         * to unsubscription during update
         */
        if (updateCounter !== null && a <= updateCounter) updateCounter -= 1;
        return observers.splice(a, 1);
      }
    }
  };
}

/** @fluxible-no-synth-events */
export function addEvent (ev, callback) {
  if (ev in eventBus) eventBus[ev].push(callback);
  else eventBus[ev] = [callback];

  return () => {
    if (ev in eventBus) {
      const eventBusLen = eventBus[ev].length;

      for (let a = 0; a < eventBusLen; a++) {
        if (eventBus[ev][a] === callback) {
          /**
           * this will ensure that we don't miss an event
           * listener due to unsubscription during emitEvent
           */
          if (emitEventCycle !== null && emitEventCycle.ev === ev && a <= emitEventCycle.counter)
            emitEventCycle.counter -= 1;

          return eventBus[ev].splice(a, 1);
        }
      }
    }

    return -1;
  };
}

export function removeEvent (ev) {
  if (ev in eventBus === false) return -1;
  delete eventBus[ev];
}

export function emitEvent (ev, payload) {
  if (ev in eventBus === false) return -1;

  emitEventCycle = {
    ev,
    counter: 0
  };

  for (
    let eventBusLen = eventBus[ev].length;
    emitEventCycle.counter < eventBusLen;
    emitEventCycle.counter++
  )
    if (eventBus[ev][emitEventCycle.counter]) eventBus[ev][emitEventCycle.counter](payload);

  emitEventCycle = null;
}
/** @end-fluxible-no-synth-events */

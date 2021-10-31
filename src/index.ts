type AsyncPersist<T> = {
  asyncStorage: {
    getItem: (key: string) => Promise<string | Record<string, any>>;
    setItem: (key: string, value: string | T) => Promise<void>;
  };
  restore: (savedStore: T) => Partial<T>;
};

type SyncPersist<T> = {
  syncStorage: {
    getItem: (key: string) => string;
    setItem: (key: string, value: string | T) => void;
  };
  restore: (savedStore: T) => Partial<T>;
};

type Config<T> = {
  initialStore: T;
  useJSON?: boolean;
  persist?: AsyncPersist<T> | SyncPersist<T>;
};

export function createStore<StoreType = Record<string, any>> (
  { useJSON = true, initialStore, persist }: Config<StoreType>,
  initCallback?: () => void
) {
  type EventListener = (
    payload: any,
    store: StoreType,
    event: string
  ) => void;

  type Observer = (store: StoreType) => void;

  const store = { ...initialStore };
  let persistStorage = null;
  let persistedStateKeys = null;
  let persistTimeout = null;
  let shouldPersist = null;
  let updatePointer = null;

  const observers: Array<{
    callback: Observer;
    keys: Array<keyof StoreType>;
    id: number;
  }> = [];

  let id = 0;

  const eventBus: Record<
    string,
    Array<EventListener>
  > = {} as Record<string, Array<EventListener>>;

  let emitEventCycle = null;

  if (persist) {
    if ('asyncStorage' in persist) {
      persistStorage = persist.asyncStorage;

      persistStorage.getItem('fluxible-js').then(savedStore => {
        const parsedSavedStore = savedStore
          ? useJSON
            ? JSON.parse(savedStore)
            : savedStore
          : store;

        const persistedStates = persist.restore({
          ...store,
          ...parsedSavedStore
        });

        persistedStateKeys = Object.keys(persistedStates);

        persistedStateKeys.forEach(field => {
          store[field] = persistedStates[field];
        });

        if (initCallback) initCallback();
      });
    } else {
      persistStorage = persist.syncStorage;
      const savedStore = persistStorage.getItem('fluxible-js');

      const parsedSavedStore = savedStore
        ? useJSON
          ? JSON.parse(savedStore)
          : savedStore
        : store;

      const persistedStates = persist.restore({
        ...store,
        ...parsedSavedStore
      });

      persistedStateKeys = Object.keys(persistedStates);

      persistedStateKeys.forEach(field => {
        store[field] = persistedStates[field];
      });

      if (initCallback) initCallback();
    }
  }

  function updateStore (updatedStates: Partial<StoreType>): void {
    if (persistTimeout) {
      clearTimeout(persistTimeout);
      persistTimeout = null;
    }

    const updatedStateKeys: Array<keyof StoreType> = Object.keys(
      updatedStates
    ) as Array<keyof StoreType>;

    updatedStateKeys.forEach(field => {
      store[field] = updatedStates[field];

      /**
       * We only want to do this if
       * - we have not previously stopped the persist timeout.
       * - There's no scheduled persist to run.
       * - One of the updated states was persisted.
       */
      if (
        persistedStateKeys &&
        !shouldPersist &&
        persistedStateKeys.indexOf(field) > -1
      )
        shouldPersist = true;
    });

    updatePointer = 0;

    const observersLen = observers.length;
    const updatedStateKeysLen = updatedStateKeys.length;

    while (updatePointer < observersLen) {
      const observer = observers[updatePointer];

      if (observer) {
        const { keys, callback } = observer;
        const keysLen = keys.length;

        // we want to maximize performance, so we loop as little as possible
        if (updatedStateKeysLen < keysLen) {
          for (let b = 0; b < updatedStateKeysLen; b++) {
            if (keys.indexOf(updatedStateKeys[b]) > -1) {
              callback(store);
              break;
            }
          }
        } else {
          // they are either of the same length or
          // the keys is less than the updatedStateKeys
          for (let b = 0; b < keysLen; b++) {
            if (updatedStateKeys.indexOf(keys[b]) > -1) {
              callback(store);
              break;
            }
          }
        }
      }

      updatePointer++;
    }

    updatePointer = 0;

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
        if (persistTimeout) {
          const statesToSave = {};

          persistedStateKeys.forEach((field: string) => {
            statesToSave[field] = store[field];
          });

          persistStorage.setItem(
            'fluxible-js',
            useJSON ? JSON.stringify(statesToSave) : statesToSave
          );

          shouldPersist = false;
        }
      }, 200);
    }
  }

  function addObserver (
    callback: Observer,
    keys: Array<keyof StoreType>
  ) {
    const observer = {
      callback,
      keys,
      id: id++
    } as const;

    observers.push(observer);

    return (): void => {
      const observersLen = observers.length;

      for (let a = 0; a < observersLen; a++) {
        const currentObserver = observers[a];

        if (currentObserver && currentObserver.id === observer.id) {
          /**
           * when an observer unsubscribed during an update cycle
           * we want to shift the pointer 1 point to the left
           */
          if (updatePointer !== null && a <= updatePointer)
            updatePointer--;

          observers.splice(a, 1);
          break;
        }
      }

      return;
    };
  }

  function addEvent (targetEv: string, callback: EventListener) {
    if (targetEv in eventBus) eventBus[targetEv].push(callback);
    else eventBus[targetEv] = [callback];

    return (): boolean => {
      if (targetEv in eventBus) {
        const eventBusLen = eventBus[targetEv].length;

        for (let a = 0; a < eventBusLen; a++) {
          if (eventBus[targetEv][a] === callback) {
            /**
             * when an event was removed during an emit cycle
             * we want to shift the emit pointer 1 point to the left
             */
            if (
              emitEventCycle &&
              emitEventCycle.event === targetEv
            ) {
              if (a <= emitEventCycle.pointer)
                emitEventCycle.pointer--;

              emitEventCycle.eventBusLen--;
            }

            eventBus[targetEv].splice(a, 1);
            return true;
          }
        }
      }

      return false;
    };
  }

  function addEvents (
    events: Array<string>,
    callback: EventListener
  ) {
    const removeEventCallbacks = events.map(event =>
      addEvent(event, callback)
    );

    return (): void => {
      removeEventCallbacks.map(removeEventCallback =>
        removeEventCallback()
      );
    };
  }

  function removeEvent (event: string): void {
    if (!(event in eventBus)) return;
    delete eventBus[event];
  }

  function removeEvents (events: Array<string>): void {
    events.forEach(event => {
      removeEvent(event);
    });
  }

  function emitEvent (event: string, payload?: any): void {
    if (!(event in eventBus)) return;

    emitEventCycle = {
      event,
      pointer: 0,
      eventBusLen: eventBus[event].length
    };

    while (emitEventCycle.pointer < emitEventCycle.eventBusLen) {
      const callback = eventBus[event][emitEventCycle.pointer];
      if (callback) callback(payload, store, event);
      emitEventCycle.pointer++;
    }

    emitEventCycle = null;
  }

  function emitEvents (events: Array<string>, payload: any): void {
    events.forEach(event => {
      emitEvent(event, payload);
    });
  }

  return {
    updateStore,
    addObserver,
    addEvent,
    addEvents,
    removeEvent,
    removeEvents,
    emitEvent,
    emitEvents,
    store
  };
}

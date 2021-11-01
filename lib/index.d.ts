declare type AsyncPersist<T> = {
    asyncStorage: {
        getItem: (key: string) => Promise<string | Record<string, any>>;
        setItem: (key: string, value: string | T) => Promise<any>;
    };
    restore: (savedStore: T) => Partial<T>;
};
declare type SyncPersist<T> = {
    syncStorage: {
        getItem: (key: string) => string;
        setItem: (key: string, value: string | T) => void;
    };
    restore: (savedStore: T) => Partial<T>;
};
declare type Config<T> = {
    initialStore: T;
    useJSON?: boolean;
    persist?: AsyncPersist<T> | SyncPersist<T>;
};
export declare type Store<StoreType> = {
    updateStore: (updatedStates: Partial<StoreType>) => void;
    addObserver: (callback: (store: StoreType) => void, keys: Array<keyof StoreType>) => () => void;
    addEvent: (targetEv: string, callback: (payload: any, store: StoreType, event: string) => void) => () => boolean;
    addEvents: (events: Array<string>, callback: (payload: any, store: StoreType, event: string) => void) => () => void;
    removeEvent: (event: string) => void;
    removeEvents: (events: Array<string>) => void;
    emitEvent: (event: string, payload?: any) => void;
    emitEvents: (events: Array<string>, payload: any) => void;
    store: StoreType;
};
export declare function createStore<StoreType>({ useJSON, initialStore, persist }: Config<StoreType>, initCallback?: () => void): Store<StoreType>;
export {};
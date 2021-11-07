declare type AsyncPersist<StoreType> = {
    asyncStorage: {
        getItem: (key: string) => Promise<string | Record<string, any>>;
        setItem: (key: string, value: string | StoreType) => Promise<any>;
    };
    restore: (savedStore: StoreType) => Partial<StoreType>;
};
declare type SyncPersist<StoreType> = {
    syncStorage: {
        getItem: (key: string) => string;
        setItem: (key: string, value: string | StoreType) => void;
    };
    restore: (savedStore: StoreType) => Partial<StoreType>;
};
declare type Config<StoreType> = {
    initialStore: StoreType;
    useJSON?: boolean;
    persist?: AsyncPersist<StoreType> | SyncPersist<StoreType>;
};
export declare type FluxibleStore<StoreType> = {
    readonly updateStore: (updatedStates: Partial<StoreType>) => void;
    readonly addObserver: (callback: (store: StoreType) => void, keys: Array<keyof StoreType>) => () => void;
    readonly addEvent: (targetEv: string, callback: (payload: any, store: StoreType, event: string) => void) => () => boolean;
    readonly addEvents: (events: Array<string>, callback: (payload: any, store: StoreType, event: string) => void) => () => void;
    readonly removeEvent: (event: string) => void;
    readonly removeEvents: (events: Array<string>) => void;
    readonly emitEvent: (event: string, payload?: any) => void;
    readonly emitEvents: (events: Array<string>, payload: any) => void;
    readonly store: Readonly<StoreType>;
};
export declare function createStore<StoreType>({ useJSON, initialStore, persist }: Config<StoreType>, initCallback?: () => void): FluxibleStore<StoreType>;
export {};

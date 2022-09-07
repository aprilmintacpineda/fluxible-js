declare type SyncStorage<Store> = {
    getItem: (key: string) => string;
    setItem: (key: string, value: string | Store) => void;
};
declare type AsyncStorage<Store> = {
    getItem: (key: string) => Promise<string | Record<string, any>>;
    setItem: (key: string, value: string | Store) => Promise<any>;
};
declare type PersistConfig<Store> = {
    restore: (savedStore: Store) => Partial<Store>;
    stringify: boolean;
};
declare type AsyncPersist<Store> = PersistConfig<Store> & {
    syncStorage?: never;
    asyncStorage: AsyncStorage<Store>;
};
declare type SyncPersist<Store> = PersistConfig<Store> & {
    asyncStorage?: never;
    syncStorage: SyncStorage<Store>;
};
declare type Config<Store> = {
    initialStore: Store;
    persist?: AsyncPersist<Store> | SyncPersist<Store>;
};
export declare type FluxibleStore<Store> = {
    readonly updateStore: (updatedStates: Partial<Store>) => void;
    readonly addObserver: (callback: (store: Store) => void, keys: Array<keyof Store>) => () => void;
    readonly addEvent: (targetEv: string, callback: (payload: any, store: Store, event: string) => void) => () => boolean;
    readonly addEvents: (events: Array<string>, callback: (payload: any, store: Store, event: string) => void) => () => void;
    readonly removeEvent: (event: string) => void;
    readonly removeEvents: (events: Array<string>) => void;
    readonly emitEvent: (event: string, payload?: any) => void;
    readonly emitEvents: (events: Array<string>, payload: any) => void;
    readonly store: Readonly<Store>;
};
export declare function createStore<Store>({ initialStore, persist }: Config<Store>, initCallback?: () => void): FluxibleStore<Store>;
export {};

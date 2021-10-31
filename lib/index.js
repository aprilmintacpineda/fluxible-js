"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.createStore = void 0;
function createStore(_a, initCallback) {
    var _b = _a.useJSON, useJSON = _b === void 0 ? true : _b, initialStore = _a.initialStore, persist = _a.persist;
    var store = __assign({}, initialStore);
    var persistStorage = null;
    var persistedStateKeys = null;
    var persistTimeout = null;
    var shouldPersist = null;
    var updatePointer = null;
    var observers = [];
    var id = 0;
    var eventBus = {};
    var emitEventCycle = null;
    if (persist) {
        if ('asyncStorage' in persist) {
            persistStorage = persist.asyncStorage;
            persistStorage.getItem('fluxible-js').then(function (savedStore) {
                var parsedSavedStore = savedStore
                    ? useJSON
                        ? JSON.parse(savedStore)
                        : savedStore
                    : store;
                var persistedStates = persist.restore(__assign(__assign({}, store), parsedSavedStore));
                persistedStateKeys = Object.keys(persistedStates);
                persistedStateKeys.forEach(function (field) {
                    store[field] = persistedStates[field];
                });
                if (initCallback)
                    initCallback();
            });
        }
        else {
            persistStorage = persist.syncStorage;
            var savedStore = persistStorage.getItem('fluxible-js');
            var parsedSavedStore = savedStore
                ? useJSON
                    ? JSON.parse(savedStore)
                    : savedStore
                : store;
            var persistedStates_1 = persist.restore(__assign(__assign({}, store), parsedSavedStore));
            persistedStateKeys = Object.keys(persistedStates_1);
            persistedStateKeys.forEach(function (field) {
                store[field] = persistedStates_1[field];
            });
            if (initCallback)
                initCallback();
        }
    }
    function updateStore(updatedStates) {
        if (persistTimeout) {
            clearTimeout(persistTimeout);
            persistTimeout = null;
        }
        var updatedStateKeys = Object.keys(updatedStates);
        updatedStateKeys.forEach(function (field) {
            store[field] = updatedStates[field];
            /**
             * We only want to do this if
             * - we have not previously stopped the persist timeout.
             * - There's no scheduled persist to run.
             * - One of the updated states was persisted.
             */
            if (persistedStateKeys &&
                !shouldPersist &&
                persistedStateKeys.indexOf(field) > -1)
                shouldPersist = true;
        });
        updatePointer = 0;
        var observersLen = observers.length;
        var updatedStateKeysLen = updatedStateKeys.length;
        while (updatePointer < observersLen) {
            var observer = observers[updatePointer];
            if (observer) {
                var keys = observer.keys, callback = observer.callback;
                var keysLen = keys.length;
                // we want to maximize performance, so we loop as little as possible
                if (updatedStateKeysLen < keysLen) {
                    for (var b = 0; b < updatedStateKeysLen; b++) {
                        if (keys.indexOf(updatedStateKeys[b]) > -1) {
                            callback(store);
                            break;
                        }
                    }
                }
                else {
                    // they are either of the same length or
                    // the keys is less than the updatedStateKeys
                    for (var b = 0; b < keysLen; b++) {
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
            persistTimeout = setTimeout(function () {
                if (persistTimeout) {
                    var statesToSave_1 = {};
                    persistedStateKeys.forEach(function (field) {
                        statesToSave_1[field] = store[field];
                    });
                    persistStorage.setItem('fluxible-js', useJSON ? JSON.stringify(statesToSave_1) : statesToSave_1);
                    shouldPersist = false;
                }
            }, 200);
        }
    }
    function addObserver(callback, keys) {
        var observer = {
            callback: callback,
            keys: keys,
            id: id++
        };
        observers.push(observer);
        return function () {
            var observersLen = observers.length;
            for (var a = 0; a < observersLen; a++) {
                var currentObserver = observers[a];
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
    function addEvent(targetEv, callback) {
        if (targetEv in eventBus)
            eventBus[targetEv].push(callback);
        else
            eventBus[targetEv] = [callback];
        return function () {
            if (targetEv in eventBus) {
                var eventBusLen = eventBus[targetEv].length;
                for (var a = 0; a < eventBusLen; a++) {
                    if (eventBus[targetEv][a] === callback) {
                        /**
                         * when an event was removed during an emit cycle
                         * we want to shift the emit pointer 1 point to the left
                         */
                        if (emitEventCycle &&
                            emitEventCycle.event === targetEv) {
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
    function addEvents(events, callback) {
        var removeEventCallbacks = events.map(function (event) {
            return addEvent(event, callback);
        });
        return function () {
            removeEventCallbacks.map(function (removeEventCallback) {
                return removeEventCallback();
            });
        };
    }
    function removeEvent(event) {
        if (!(event in eventBus))
            return;
        delete eventBus[event];
    }
    function removeEvents(events) {
        events.forEach(function (event) {
            removeEvent(event);
        });
    }
    function emitEvent(event, payload) {
        if (!(event in eventBus))
            return;
        emitEventCycle = {
            event: event,
            pointer: 0,
            eventBusLen: eventBus[event].length
        };
        while (emitEventCycle.pointer < emitEventCycle.eventBusLen) {
            var callback = eventBus[event][emitEventCycle.pointer];
            if (callback)
                callback(payload, store, event);
            emitEventCycle.pointer++;
        }
        emitEventCycle = null;
    }
    function emitEvents(events, payload) {
        events.forEach(function (event) {
            emitEvent(event, payload);
        });
    }
    return {
        updateStore: updateStore,
        addObserver: addObserver,
        addEvent: addEvent,
        addEvents: addEvents,
        removeEvent: removeEvent,
        removeEvents: removeEvents,
        emitEvent: emitEvent,
        emitEvents: emitEvents,
        store: store
    };
}
exports.createStore = createStore;

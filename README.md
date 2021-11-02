![npm](https://img.shields.io/npm/dt/fluxible-js) ![npm](https://img.shields.io/npm/dm/fluxible-js) ![npm](https://img.shields.io/npm/dw/fluxible-js)

# Fluxible-JS v6

Smaller, faster, better event-driven state management architecture that supports asynchronicity and state persistence out of the box with no extra code.

# Change logs

From 5.0.10, the changelogs on the project will be kept in [CHANGELOG](./CHANGELOG.md), which follows [keepachangelog](https://keepachangelog.com/en/1.0.0/).

# Demo

[See demo](https://aprilmintacpineda.github.io/react-fluxible/). This demo is using [react-fluxible](https://github.com/aprilmintacpineda/react-fluxible).

# Run me

1. `git clone git@github.com:aprilmintacpineda/fluxible-js.git`
2. `yarn`
3. `yarn test`

# Install

`yarn add fluxible-js`

# Usage

```ts
import { createStore } from 'fluxible-js';

const initialStore = {
  user: null,
  someOtherState: 'value',
  anotherState: {
    value: 'value'
  }
};

const store = createStore({
  initialStore,
  persist: {
    useJSON: false,
    syncStorage: window.localStorage,
    restore: savedStore => ({
      user: savedStore.user
    })
  }
});
```

## Creating a store

```ts
import { createStore } from 'fluxible-js';

const initialStore = {
  user: null,
  someOtherState: 'value',
  anotherState: {
    value: 'value'
  }
};

const myStore = createStore({ initialStore });
```

`createStore` function returns an instance of a `store` that has variety of methods in it. You can access the store's current value by via `myStore.store`.

## Persisting states

Persisting states allows you to save your application's state to a storage on the local device and then reuse those states the next time your application starts.

You need to tell `fluxible-js` which storage to use, a storage API must have a `getItem` and `setItem` methods in them. An example of this would be `window.localStorage`.

You also need to tell `fluxible-js` which states to persist, you can do this via the `restore` callback function.

### Using asynchronous storage

Storage like [react-native-async-storage](https://github.com/react-native-async-storage/async-storage) or [LocalForage](https://github.com/localForage/localForage). These are storage that return a `Promise` for the `setItem` and `getItem` methods.

```ts
import { createStore } from 'fluxible-js';

const initialStore = {
  token: null,
  isLoggedIn: false
};

const store = createStore({
  initialStore,
  persist: {
    asyncStorage: RNAsyncStorage,
    restore: (savedStore) => {
      return {
        token: savedStore.token
      };
    }
  }
});
```

### Using synchronous storage

Storage like `window.localStorage`. These are storage that doesn't return a `Promise` for their `getItem` and `setItem` methods.

```ts
import { createStore } from 'fluxible-js';

const initialStore = {
  token: null,
  isLoggedIn: false
};

const store = createStore({
  initialStore,
  persist: {
    syncStorage: window.localStorage,
    restore: (savedStore) => {
      return {
        token: savedStore.token
      };
    }
  }
});
```

## Updating the store

You can update the store by doing:

```ts
import { createStore } from 'fluxible-js';

const initialStore = {
  token: null,
  isLoggedIn: false
};

const store = createStore({
  initialStore,
  persist: {
    syncStorage: window.localStorage,
    restore: (savedStore) => {
      return {
        token: savedStore.token
      };
    }
  }
});

// somewhere in your code
store.updateStore({
  token: userToken,
  isLoggedIn: true
});
```

## Adding observers

Observers are callback functions that listen to certain changes in your store. Observers will be called **AFTER** the store has been updated and they will receive the updated store. You can add an observer by doing:

```ts
import { createStore } from ".";

const store = createStore({
  initialStore: {
    token: null
  }
});

store.addObserver(
  (store) => {
    console.log(store.token);
    // do something
  },
  // states that you want to watch changes for
  ['token']
);
```

Observers will only be called when the state they are watching changes, in this case, the observer is only watching `token`, so this observer will only be called when you do `store.updateStore({ token })`. This prevents unnecessary calls to all observers when other states changes.

## Events

You can add, emit, and remove events in your store. You can take advantage of events to do various things in your applications such as updating the store.

### Adding events

```ts
import { createStore } from ".";

const store = createStore({
  initialStore: {
    token: null
  }
});

/**
 * Event callbacks receive the:
 * payload = passed on emitEvent
 * store = the latest value of thes store
 * event = the event that was emited, this is useful when using `addEvents`
 */
const unsubscribeCallback = store.addEvent('test-event', (payload, store, event) => {
  console.log(payload, store, event);
  // do something
});

// when you want to remove the event listener from the event
unsubscribeCallback();
```

There is also `addEvents` in case you want an event listener to listen to multiple events.

```ts
const unsubscribeCallback = store.addEvents(
  ['event1', 'event2', 'event3'],
  (payload, store, event) => {
    console.log(payload, store, event);
    // do something
  }
);

// when you want to remove the event listener from the event
unsubscribeCallback();
```

### Emitting an event

```ts
store.emitEvent(
  'event1',
  // optional: any value you want to pass to all the event listeners
  { value: 1 }
);
```

### Emitting multiple events

```ts
store.emitEvents(
  ['anEvent', 'anotherEvent'],
  // optional: any value you want to pass to all the event listeners
  { value: 1 }
);
```

### Removing an event

```ts
store.removeEvent('event1');
```

### Removing multiple events

```ts
store.removeEvents(['anEvent', 'anotherEvent']);
```

# Migrating from v5 to v6

The only changes that occured in v6 are the following:

- Used TypeScript for better coding experience.
- Changed architecture to be more self-contained.
- No more `-1` returns.

Your code should still work with minimal changes. Here's how you can migrate real quick.

Create a file called `globalStore.ts`, and add the following code:

```ts
import { createStore } from 'fluxible-js';

const initialStore = {
  // ... your store values here
};

export default createStore({
  initialStore,
  // ... other options
});
```

Now, change all occurences of `import { updateStore } from 'fluxible-js';` and other similar imports to `import { updateStore } from 'globalStore';`.

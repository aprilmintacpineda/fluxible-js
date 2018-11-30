/** @format */

import { initializeStore, updateStore, addObserver, store } from './lib';

initializeStore({
  initialStore: {
    count: 1
  }
});

addObserver(
  updatedState => {
    // eslint-disable-next-line
    console.log('observer called. Updated state:', updatedState);
  },
  ['count']
);

setInterval(() => {
  updateStore({
    count: store.count + 1
  });

  // eslint-disable-next-line
  console.log('This line ran after updateStore:', store);
}, 1000);

// eslint-disable-next-line
console.log('initialStore', store);

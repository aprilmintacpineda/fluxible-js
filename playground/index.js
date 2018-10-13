/** @format */

import { initializeStore, updateStore, addObserver, getStore } from './lib';

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
    count: getStore().count + 1
  });

  // eslint-disable-next-line
  console.log('This line ran after updateStore:', getStore());
}, 1000);

// eslint-disable-next-line
console.log('initialStore', getStore());

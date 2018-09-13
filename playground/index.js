/** @format */

import { initializeStore, updateStore, getStore } from './lib';

initializeStore({
  initialStore: {
    count: 1
  }
});

setInterval(() => {
  return updateStore({
    count: getStore().count + 1
  }).then(() => {
    console.log('store was updated!', getStore().count);
  });
}, 1000);

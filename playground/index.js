/** @format */

import { initializeStore, updateStore, addListener, getStore } from './lib';

initializeStore({
  count: 1
});

addListener(() => {
  console.log('update listener', getStore());
});

setInterval(() => {
  updateStore({
    count: getStore().count + 1
  });
}, 1000);

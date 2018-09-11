/** @format */

import { initializeState, updateState, addListener, getState } from './lib';

initializeState({
  count: 1
});

addListener(() => {
  console.log('updated!', getState());
});

setInterval(() => {
  updateState({
    count: getState().count + 1
  });
}, 1000);

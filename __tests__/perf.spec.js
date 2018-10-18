/** @format */

import { getStore, updateStore, initializeStore, addObserver } from '../lib';

const maxKeys = 10000;
const initialStore = {};

let average = 0;
let timeTaken = 0;
let now = 0;
let tmp = null;

for (let a = 0; a < maxKeys; a++) {
  initialStore['test' + a] = 'test' + a;
}

const initialStoreKeys = Object.keys(initialStore);

function displayTotalTime() {
  console.log('Total time taken (one time fire)', timeTaken < 0 ? 0 : timeTaken, 'ms');
}

function displayAverageTime() {
  console.log('Average time (' + maxKeys + ' loops)', average / maxKeys, 'ms');
  console.log('-----');
}

console.log('created initialStore with', maxKeys, 'keys.');

console.log('\n-----');
console.log('Beginning of test');
console.log('-----\n');

// ----------
console.log('initialStore:');

timeTaken = Date.now();
initializeStore({ initialStore });
timeTaken -= Date.now();

displayTotalTime();

for (let a = 0; a < maxKeys; a++) {
  now = Date.now();
  initializeStore({ initialStore });
  average += Date.now() - now;
}

displayAverageTime();

// ----------
console.log('updateStore with 1000 keys and 0 observers:');

timeTaken = Date.now();
updateStore(initialStore);
timeTaken -= Date.now();

displayTotalTime();

for (let a = 0; a < maxKeys; a++) {
  now = Date.now();
  updateStore(initialStore);
  average += Date.now() - now;
}

displayAverageTime();

// ----------
console.log('addObserver:');

timeTaken = Date.now();
addObserver(() => {}, ['test1', 'test2', 'test3']);
timeTaken -= Date.now();

displayTotalTime();

for (let a = 0; a < maxKeys; a++) {
  now = Date.now();
  addObserver(() => {}, ['test1', 'test2', 'test3']);
  average += Date.now() - now;
}

displayAverageTime();

// ----------
console.log('updateStore with 1000 keys and 1000 observers:');

timeTaken = Date.now();
updateStore(initialStore);
timeTaken -= Date.now();

displayTotalTime();

for (let a = 0; a < maxKeys; a++) {
  now = Date.now();
  updateStore(initialStore);
  average += Date.now() - now;
}

displayAverageTime();

console.log('END');

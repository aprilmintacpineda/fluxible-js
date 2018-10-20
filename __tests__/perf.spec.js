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
  console.log('Total time taken (one time fire)', timeTaken, 'ms');
}

function displayAverageTimeAndReset() {
  console.log('Average time (' + maxKeys + ' loops)', average / maxKeys, 'ms');
  console.log('-----');

  average = 0;
  timeTaken = 0;
  now = 0;
  tmp = null;
}

console.log('created initialStore with', maxKeys, 'keys.');

console.log('\n-----');
console.log('Beginning of perf test');
console.log('-----\n');

// ----------
console.log('initializeStore:');

timeTaken = Date.now();
initializeStore({ initialStore });
timeTaken = Date.now() - timeTaken;

displayTotalTime();

for (let a = 0; a < maxKeys; a++) {
  now = Date.now();
  initializeStore({ initialStore });
  average += Date.now() - now;
}

displayAverageTimeAndReset();

// ----------
console.log('updateStore with ' + maxKeys + ' keys and 0 observers:');

timeTaken = Date.now();
updateStore(initialStore);
timeTaken = Date.now() - timeTaken;

displayTotalTime();

for (let a = 0; a < maxKeys; a++) {
  now = Date.now();
  updateStore(initialStore);
  average += Date.now() - now;
}

displayAverageTimeAndReset();

// ----------
console.log('addObserver:');

timeTaken = Date.now();
addObserver(() => {}, ['test1', 'test2', 'test3']);
timeTaken = Date.now() - timeTaken;

displayTotalTime();

for (let a = 0; a < maxKeys; a++) {
  now = Date.now();
  addObserver(() => {}, ['test1', 'test2', 'test3']);
  average += Date.now() - now;
}

displayAverageTimeAndReset();

// ----------
console.log('updateStore with ' + maxKeys + ' keys and ' + maxKeys + ' observers:');

timeTaken = Date.now();
updateStore(initialStore);
timeTaken = Date.now() - timeTaken;

displayTotalTime();

for (let a = 0; a < maxKeys; a++) {
  now = Date.now();
  updateStore(initialStore);
  average += Date.now() - now;
}

displayAverageTimeAndReset();

// ----------
console.log('getStore:');

timeTaken = Date.now();
getStore();
timeTaken = Date.now() - timeTaken;

displayTotalTime();

for (let a = 0; a < maxKeys; a++) {
  now = Date.now();
  getStore();
  average += Date.now() - now;
}

displayAverageTimeAndReset();

// ---------- TODO
// console.log('removing an observer with ', maxKeys + 1, ' observers');
//
// tmp = addObserver(() => {}, ['test1', 'test2', 'test3']);
//
// timeTaken = Date.now();
// tmp();
// timeTaken = Date.now() - timeTaken;
//
// displayTotalTime();

// for (let a = 0; a < maxKeys; a++) {
//   now = Date.now();
//   getStore();
//   average += Date.now() - now;
// }
//
// displayAverageTimeAndReset();

console.log('END');

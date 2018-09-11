/** @format */

let state = {};
const updateListeners = [];

export function initializeState (initialState) {
  state = {
    ...initialState
  };
}

export function getState () {
  return state;
}

export function updateState (newState) {
  state = {
    ...state,
    ...newState
  };

  updateListeners.forEach(callback => {
    callback();
  });
}

export function addListener (callback) {
  updateListeners.push(callback);

  return () => {
    updateListeners.splice(updateListeners.indexOf(callback), 1);
  };
}

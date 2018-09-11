"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.initializeState = initializeState;
exports.getState = getState;
exports.updateState = updateState;
exports.addListener = addListener;
/** @format */

var state = {};
var updateListeners = [];

function initializeState(initialState) {
  state = _extends({}, initialState);
}

function getState() {
  return state;
}

function updateState(newState) {
  state = _extends({}, state, newState);

  updateListeners.forEach(function (callback) {
    callback();
  });
}

function addListener(callback) {
  updateListeners.push(callback);

  return function () {
    updateListeners.splice(updateListeners.indexOf(callback), 1);
  };
}
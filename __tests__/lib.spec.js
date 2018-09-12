/** @format */

import { getStore, updateStore, initializeStore, addListener } from '../src';

describe('lib.spec.js', () => {
  describe('store initialization', () => {
    test('initializes store', () => {
      const initialStore = {
        count: 1,
        countAgain: 2
      };

      initializeStore({
        count: 1,
        countAgain: 2
      });

      expect(getStore()).toEqual(initialStore);
    });

    test('does not call listeners on store initialization', () => {
      const listener = jest.fn();

      addListener(listener);
      initializeStore({
        count: 1,
        countAgain: 2
      });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('store updates', () => {
    test('Update store only updates parts of the store that\'s to be updated. getStore returns the updated store.', () => {
      const initialStore = {
        value: 'testValue',
        count: 1
      };

      initializeStore(initialStore);

      updateStore({
        count: 100
      });

      expect(getStore()).toEqual({
        value: 'testValue',
        count: 100
      });
    });

    test('Listeners are called every after update and are removed when callback was called.', () => {
      const initialStore = {
        value: 'testValue',
        count: 1
      };

      const updateListener = jest.fn();

      initializeStore(initialStore);
      const unsubscribeUpdateListener = addListener(updateListener);

      updateStore({
        count: 100
      });

      expect(updateListener).toHaveBeenCalled();
      expect(getStore()).toEqual({
        value: 'testValue',
        count: 100
      });

      unsubscribeUpdateListener();

      updateStore({
        count: 1
      });

      expect(updateListener).toHaveBeenCalledTimes(1);
      expect(getStore()).toEqual({
        value: 'testValue',
        count: 1
      });
    });
  });
});

/** @format */

import { getStore, updateStore, initializeStore, addListener } from '../src';

describe('lib.spec.js', () => {
  describe('store initialization', () => {
    test('initializes store', () => {
      const initialStore = {
        count: 1,
        countAgain: 2
      };

      initializeStore({ initialStore });

      expect(getStore()).toEqual(initialStore);
    });

    test('does not call listeners on store initialization', () => {
      const listener = jest.fn();
      const initialStore = {
        count: 1,
        countAgain: 2
      };

      addListener(listener);
      initializeStore({ initialStore });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('store updates', () => {
    test("Update store only updates parts of the store that's to be updated. getStore returns the updated store.", () => {
      const initialStore = {
        value: 'testValue',
        count: 1
      };

      initializeStore({ initialStore });

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

      initializeStore({ initialStore });
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

  describe('persist', () => {
    test('calls getItem and setItem on config.persist.storage', () => {
      const initialStore = {
        user: null,
        testValue: 'value',
        anotherValue: 'test value'
      };

      const storage = {
        getItem: jest.fn(() => {
          return {
            user: {
              name: 'test user'
            }
          };
        }),
        setItem: jest.fn((key, item) => {})
      };

      initializeStore({
        initialStore,
        persist: {
          storage,
          restore: savedStore => {
            return {
              user: savedStore.user
            };
          }
        }
      });

      expect(storage.getItem).toHaveBeenCalledWith('fluxible-js');
      expect(getStore()).toEqual({
        user: {
          name: 'test user'
        },
        testValue: 'value',
        anotherValue: 'test value'
      });

      updateStore({
        user: {
          name: 'another test user'
        },
        testValue: 'another test value'
      });

      expect(storage.setItem).toHaveBeenCalledWith(
        'fluxible-js',
        JSON.stringify({
          user: {
            name: 'another test user'
          }
        })
      );
    });
  });
});

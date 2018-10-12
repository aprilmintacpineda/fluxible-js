/** @format */

import { getStore, updateStore, initializeStore, addObserver } from '../src';

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
  });

  describe('store updates', () => {
    test('Update store only updates parts of the store that\'s to be updated. getStore returns the updated store.', () => {
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

      updateStore({
        count: 50
      });

      expect(getStore()).toEqual({
        value: 'testValue',
        count: 50
      });

      updateStore({
        value: 'testing',
        count: 100
      });

      expect(getStore()).toEqual({
        value: 'testing',
        count: 100
      });
    });
  });

  describe('update listeners', () => {
    test('calls appropriate listeners after update store', () => {
      const initialStore = {
        value: 'testValue',
        count: 1
      };

      const countListener = jest.fn();
      const valueListener = jest.fn();

      initializeStore({ initialStore });
      addObserver(countListener, ['count']);
      addObserver(valueListener, ['value']);

      updateStore({ count: 2 });
      updateStore({ count: 3 });
      updateStore({ count: 4 });
      updateStore({ count: 5 });

      expect(countListener).toHaveBeenNthCalledWith(1, {
        value: 'testValue',
        count: 2
      });

      expect(countListener).toHaveBeenNthCalledWith(2, {
        value: 'testValue',
        count: 3
      });

      expect(countListener).toHaveBeenNthCalledWith(3, {
        value: 'testValue',
        count: 4
      });

      expect(countListener).toHaveBeenNthCalledWith(4, {
        value: 'testValue',
        count: 5
      });

      expect(valueListener).not.toHaveBeenCalled();

      updateStore({ value: 'another' });
      updateStore({ value: 'another value' });

      expect(valueListener).toHaveBeenNthCalledWith(1, {
        value: 'another',
        count: 5
      });

      expect(valueListener).toHaveBeenNthCalledWith(2, {
        value: 'another value',
        count: 5
      });

      expect(countListener).toHaveBeenCalledTimes(4);
      expect(valueListener).toHaveBeenCalledTimes(2);
    });

    test('can unsubscribe a listener', () => {
      const initialStore = {
        value: 'testValue',
        count: 1
      };

      const listener1 = jest.fn();
      const listener2 = jest.fn();

      initializeStore({ initialStore });
      const unsub1 = addObserver(listener1, ['count']);
      addObserver(listener2, ['count']);

      updateStore({ count: 100 });
      updateStore({ count: 100 });

      unsub1();

      updateStore({ count: 100 });
      updateStore({ count: 100 });

      expect(listener1).toHaveBeenCalledTimes(2);
      expect(listener2).toHaveBeenCalledTimes(4);
    });
  });

  describe('persist', () => {
    test('calls getItem and setItem on config.persist.storage', () => {
      expect.assertions(4);

      const initialStore = {
        user: null,
        testValue: 'value',
        anotherValue: 'test value'
      };

      const storage = {
        getItem: jest.fn(() => {
          return JSON.stringify({
            user: {
              name: 'test user'
            }
          });
        }),
        // eslint-disable-next-line
        setItem: jest.fn((key, item) => {})
      };

      const persist = {
        storage,
        restore: jest.fn(savedStore => {
          return {
            user: savedStore.user
          };
        })
      };

      initializeStore({
        initialStore,
        persist
      });

      expect(storage.getItem).toHaveBeenCalledWith('fluxible-js');
      expect(persist.restore).toHaveBeenCalledWith({
        user: {
          name: 'test user'
        }
      });
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

      return new Promise(resolve => setTimeout(resolve, 200)).then(() => {
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

    test('calls setItem only once after multiple state updates within 200 ms', () => {
      expect.assertions(2);

      const initialStore = {
        user: null,
        testValue: 'value',
        anotherValue: 'test value'
      };

      const storage = {
        getItem: jest.fn(() => {
          return JSON.stringify({
            user: {
              name: 'test user'
            }
          });
        }),
        // eslint-disable-next-line
        setItem: jest.fn((key, item) => {})
      };

      const persist = {
        storage,
        restore: jest.fn(savedStore => {
          return {
            user: savedStore.user
          };
        })
      };

      initializeStore({
        initialStore,
        persist
      });

      updateStore({
        anotherValue: 'call 1'
      });

      updateStore({
        anotherValue: 'call 2'
      });

      updateStore({
        anotherValue: 'call 3'
      });

      updateStore({
        anotherValue: 'call 4'
      });

      updateStore({
        anotherValue: 'call 5',
        testValue: 'call 5'
      });

      return new Promise(resolve => setTimeout(resolve, 200)).then(() => {
        expect(storage.setItem).toHaveBeenCalledTimes(1);
        expect(getStore()).toEqual({
          user: {
            name: 'test user'
          },
          testValue: 'call 5',
          anotherValue: 'call 5'
        });
      });
    });

    test('returns empty object when getItem returned null', () => {
      expect.assertions(3);

      const initialStore = {
        user: null,
        testValue: 'value',
        anotherValue: 'test value'
      };

      const storage = {
        getItem: jest.fn(() => {
          return null;
        }),
        // eslint-disable-next-line
        setItem: jest.fn((key, item) => {})
      };

      initializeStore({
        initialStore,
        persist: {
          storage,
          restore: savedStore => {
            return {
              user: savedStore.user || null
            };
          }
        }
      });

      expect(storage.getItem).toHaveBeenCalledWith('fluxible-js');
      expect(getStore()).toEqual({
        user: null,
        testValue: 'value',
        anotherValue: 'test value'
      });

      updateStore({
        user: {
          name: 'another test user'
        },
        testValue: 'another test value'
      });

      return new Promise(resolve => setTimeout(resolve, 200)).then(() => {
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
});

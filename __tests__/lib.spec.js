/** @format */

import { getStore, updateStore, initializeStore } from '../src';

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
    test('Update store returns a promise', () => {
      const initialStore = {
        value: 'testValue',
        count: 1
      };

      initializeStore({ initialStore });

      expect(
        updateStore({
          count: 100
        })
      ).toBeInstanceOf(Promise);
    });

    test('Update store only updates parts of the store that\'s to be updated. getStore returns the updated store.', () => {
      expect.assertions(1);

      const initialStore = {
        value: 'testValue',
        count: 1
      };

      initializeStore({ initialStore });

      return updateStore({
        count: 100
      }).then(() => {
        expect(getStore()).toEqual({
          value: 'testValue',
          count: 100
        });
      });
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

      return updateStore({
        user: {
          name: 'another test user'
        },
        testValue: 'another test value'
      })
        .then(() => new Promise(resolve => setTimeout(resolve, 200)))
        .then(() => {
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

      return Promise.all([
        updateStore({
          anotherValue: 'call 1'
        }),
        updateStore({
          anotherValue: 'call 2'
        }),
        updateStore({
          anotherValue: 'call 3'
        }),
        updateStore({
          anotherValue: 'call 4'
        }),
        updateStore({
          anotherValue: 'call 5',
          testValue: 'call 5'
        })
      ])
        .then(() => new Promise(resolve => setTimeout(resolve, 200)))
        .then(() => {
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

      return updateStore({
        user: {
          name: 'another test user'
        },
        testValue: 'another test value'
      })
        .then(() => new Promise(resolve => setTimeout(resolve, 200)))
        .then(() => {
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

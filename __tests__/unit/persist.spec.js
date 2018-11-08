/** @format */

import { updateStore, initializeStore, getStore } from '../../lib';

describe('config.persist', () => {
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
      setItem: jest.fn(() => {})
    };

    const persist = {
      storage,
      restore: jest.fn(savedStore => ({
        user: savedStore.user
      }))
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
      setItem: jest.fn(() => {})
    };

    const persist = {
      storage,
      restore: jest.fn(savedStore => {
        return {
          user: savedStore.user,
          anotherValue: ''
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

  test('calls setItem when updated store keys was persisted.', () => {
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
      setItem: jest.fn(() => {})
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

    return new Promise(resolve => setTimeout(resolve, 200))
      .then(() => {
        expect(storage.setItem).toHaveBeenCalledTimes(0);
        expect(getStore()).toEqual({
          user: {
            name: 'test user'
          },
          testValue: 'value',
          anotherValue: 'call 2'
        });

        updateStore({
          user: {
            name: 'another-user'
          }
        });

        updateStore({
          testValue: 'call 1'
        });

        return new Promise(resolve => setTimeout(resolve, 200));
      })
      .then(() => {
        expect(storage.setItem).toHaveBeenCalledTimes(1);
        expect(getStore()).toEqual({
          user: {
            name: 'another-user'
          },
          testValue: 'call 1',
          anotherValue: 'call 2'
        });
      });
  });

  test('Does not call setItem when updated store keys was not persisted.', () => {
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
      setItem: jest.fn(() => {})
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
      expect(storage.setItem).toHaveBeenCalledTimes(0);
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

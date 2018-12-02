/** @format */

import { updateStore, initializeStore, store } from '../../src';

describe('persist using syncStorage', () => {
  test('calls getItem and setItem on config.persist.syncStorage', () => {
    expect.assertions(4);

    const initialStore = {
      user: null,
      testValue: 'value',
      anotherValue: 'test value'
    };

    const syncStorage = {
      getItem: jest.fn(() => {
        return JSON.stringify({
          user: {
            name: 'test user'
          }
        });
      }),
      setItem: jest.fn(() => {})
    };

    const restore = jest.fn(savedStore => ({
      user: savedStore.user
    }));

    initializeStore({
      initialStore,
      persist: {
        syncStorage,
        restore
      }
    });

    expect(syncStorage.getItem).toHaveBeenCalledWith('fluxible-js');
    expect(restore).toHaveBeenCalledWith({
      user: {
        name: 'test user'
      }
    });
    expect(store).toEqual({
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
      expect(syncStorage.setItem).toHaveBeenCalledWith(
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

    const syncStorage = {
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
      syncStorage,
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
      expect(syncStorage.setItem).toHaveBeenCalledTimes(1);
      expect(store).toEqual({
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

    const syncStorage = {
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
      syncStorage,
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
        expect(syncStorage.setItem).toHaveBeenCalledTimes(0);
        expect(store).toEqual({
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
        expect(syncStorage.setItem).toHaveBeenCalledTimes(1);
        expect(store).toEqual({
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

    const syncStorage = {
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
      syncStorage,
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
      expect(syncStorage.setItem).toHaveBeenCalledTimes(0);
      expect(store).toEqual({
        user: {
          name: 'test user'
        },
        testValue: 'call 5',
        anotherValue: 'call 5'
      });
    });
  });

  test('returns the current store when getItem returned null', () => {
    expect.assertions(4);

    const initialStore = {
      user: null,
      testValue: 'value',
      anotherValue: 'test value'
    };

    const syncStorage = {
      getItem: jest.fn(() => {
        return null;
      }),
      // eslint-disable-next-line
      setItem: jest.fn((key, item) => {})
    };

    const restore = jest.fn(savedStore => {
      return {
        user: savedStore.user
      };
    });

    initializeStore({
      initialStore,
      persist: {
        syncStorage,
        restore
      }
    });

    expect(restore).toHaveBeenCalledWith(initialStore);
    expect(syncStorage.getItem).toHaveBeenCalledWith('fluxible-js');
    expect(store).toEqual({
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
      expect(syncStorage.setItem).toHaveBeenCalledWith(
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

describe('persist using asyncStorage', () => {
  test('gets item from asyncStorage then calls restore', () => {
    expect.assertions(3);

    const initialStore = {
      user: null,
      testValue: 'value',
      anotherValue: 'test value'
    };

    const asyncStorage = {
      getItem: jest.fn(() =>
        Promise.resolve(
          JSON.stringify({
            user: {
              name: 'test user'
            }
          })
        )
      ),
      setItem: jest.fn(() => Promise.resolve())
    };

    const restore = jest.fn(savedStore => {
      return {
        user: savedStore.user
      };
    });

    initializeStore({
      initialStore,
      persist: {
        asyncStorage,
        restore
      }
    });

    return Promise.resolve()
      .then(() => {
        expect(asyncStorage.getItem).toHaveBeenCalled();
        expect(restore).toHaveBeenCalled();

        updateStore({
          user: 'hello'
        });

        return new Promise(resolve => setTimeout(resolve, 200));
      })
      .then(() => {
        expect(asyncStorage.setItem).toHaveBeenCalled();
      });
  });
});

describe('saving store to storage', () => {
  test('can turn off JSON.stringify using useJSON config option', () => {
    expect.assertions(5);

    const initialStore = {
      user: null,
      testValue: 'value',
      anotherValue: 'test value'
    };

    const asyncStorage = {
      getItem: jest.fn(() =>
        Promise.resolve({
          user: {
            name: 'test user'
          }
        })
      ),
      setItem: jest.fn(() => Promise.resolve())
    };

    const restore = jest.fn(savedStore => {
      return {
        user: savedStore.user
      };
    });

    initializeStore({
      initialStore,
      persist: {
        asyncStorage,
        restore
      },
      useJSON: false
    });

    const origStringify = JSON.stringify;
    const origParse = JSON.parse;
    JSON.stringify = jest.fn(obj => origStringify(obj));
    JSON.parse = jest.fn(obj => origParse(obj));

    return Promise.resolve()
      .then(() => {
        expect(asyncStorage.getItem).toHaveBeenCalled();
        expect(restore).toHaveBeenCalled();

        updateStore({
          user: 'hello'
        });

        return new Promise(resolve => setTimeout(resolve, 200));
      })
      .then(() => {
        expect(asyncStorage.setItem).toHaveBeenCalled();
        expect(JSON.stringify).not.toHaveBeenCalled();
        expect(JSON.parse).not.toHaveBeenCalled();
      });
  });
});

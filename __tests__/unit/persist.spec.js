/** @format */

import { createStore } from '../../lib';

describe('persist using syncStorage', () => {
  test('persist merges savedStore and initialStore', () => {
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
      setItem: jest.fn(() => {
        // empty
      })
    };

    const restore = jest.fn(({ user }) => ({ user }));
    const initCallback = jest.fn();

    createStore(
      {
        initialStore,
        persist: {
          syncStorage,
          restore,
          stringify: true
        }
      },
      initCallback
    );

    expect(restore).toHaveBeenCalledWith({
      user: {
        name: 'test user'
      },
      testValue: 'value',
      anotherValue: 'test value'
    });

    expect(initCallback).toHaveBeenCalledWith({
      user: {
        name: 'test user'
      },
      testValue: 'value',
      anotherValue: 'test value'
    });
  });

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
      setItem: jest.fn(() => {
        // empty
      })
    };

    const restore = jest.fn(savedStore => ({
      user: savedStore.user
    }));

    const store = createStore({
      initialStore,
      persist: {
        syncStorage,
        restore,
        stringify: true
      }
    });

    expect(syncStorage.getItem).toHaveBeenCalledWith('fluxible-js');
    expect(restore).toHaveBeenCalled();
    expect(store.store).toEqual({
      user: {
        name: 'test user'
      },
      testValue: 'value',
      anotherValue: 'test value'
    });

    store.updateStore({
      user: {
        name: 'another test user'
      },
      testValue: 'another test value'
    });

    return new Promise(resolve => setTimeout(resolve, 200)).then(
      () => {
        expect(syncStorage.setItem).toHaveBeenCalledWith(
          'fluxible-js',
          JSON.stringify({
            user: {
              name: 'another test user'
            }
          })
        );
      }
    );
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
      setItem: jest.fn(() => {
        // empty
      })
    };

    const store = createStore({
      initialStore,
      persist: {
        stringify: true,
        syncStorage,
        restore: jest.fn(savedStore => {
          return {
            user: savedStore.user,
            anotherValue: ''
          };
        })
      }
    });

    store.updateStore({
      anotherValue: 'call 1'
    });

    store.updateStore({
      anotherValue: 'call 2'
    });

    store.updateStore({
      anotherValue: 'call 3'
    });

    store.updateStore({
      anotherValue: 'call 4'
    });

    store.updateStore({
      anotherValue: 'call 5',
      testValue: 'call 5'
    });

    return new Promise(resolve => setTimeout(resolve, 200)).then(
      () => {
        expect(syncStorage.setItem).toHaveBeenCalledTimes(1);
        expect(store.store).toEqual({
          user: {
            name: 'test user'
          },
          testValue: 'call 5',
          anotherValue: 'call 5'
        });
      }
    );
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
      setItem: jest.fn(() => {
        // empty
      })
    };

    const store = createStore({
      initialStore,
      persist: {
        stringify: true,
        syncStorage,
        restore: jest.fn(savedStore => {
          return {
            user: savedStore.user
          };
        })
      }
    });

    store.updateStore({
      anotherValue: 'call 1'
    });

    store.updateStore({
      anotherValue: 'call 2'
    });

    return new Promise(resolve => setTimeout(resolve, 200))
      .then(() => {
        expect(syncStorage.setItem).toHaveBeenCalledTimes(0);
        expect(store.store).toEqual({
          user: {
            name: 'test user'
          },
          testValue: 'value',
          anotherValue: 'call 2'
        });

        store.updateStore({
          user: {
            name: 'another-user'
          }
        });

        store.updateStore({
          testValue: 'call 1'
        });

        return new Promise(resolve => setTimeout(resolve, 200));
      })
      .then(() => {
        expect(syncStorage.setItem).toHaveBeenCalledTimes(1);
        expect(store.store).toEqual({
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
      setItem: jest.fn(() => {
        // empty
      })
    };

    const store = createStore({
      initialStore,
      persist: {
        stringify: true,
        syncStorage,
        restore: jest.fn(savedStore => {
          return {
            user: savedStore.user
          };
        })
      }
    });

    store.updateStore({
      anotherValue: 'call 1'
    });

    store.updateStore({
      anotherValue: 'call 2'
    });

    store.updateStore({
      anotherValue: 'call 3'
    });

    store.updateStore({
      anotherValue: 'call 4'
    });

    store.updateStore({
      anotherValue: 'call 5',
      testValue: 'call 5'
    });

    return new Promise(resolve => setTimeout(resolve, 200)).then(
      () => {
        expect(syncStorage.setItem).toHaveBeenCalledTimes(0);
        expect(store.store).toEqual({
          user: {
            name: 'test user'
          },
          testValue: 'call 5',
          anotherValue: 'call 5'
        });
      }
    );
  });

  test('gives the current store when getItem returned null', () => {
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

    const store = createStore({
      initialStore,
      persist: {
        stringify: true,
        syncStorage,
        restore
      }
    });

    expect(restore).toHaveBeenCalledWith(initialStore);
    expect(syncStorage.getItem).toHaveBeenCalledWith('fluxible-js');
    expect(store.store).toEqual({
      user: null,
      testValue: 'value',
      anotherValue: 'test value'
    });

    store.updateStore({
      user: {
        name: 'another test user'
      },
      testValue: 'another test value'
    });

    return new Promise(resolve => setTimeout(resolve, 200)).then(
      () => {
        expect(syncStorage.setItem).toHaveBeenCalledWith(
          'fluxible-js',
          JSON.stringify({
            user: {
              name: 'another test user'
            }
          })
        );
      }
    );
  });
});

describe('persist using asyncStorage', () => {
  test('persist merges savedStore and initialStore', () => {
    expect.assertions(2);

    const initialStore = {
      user: null,
      testValue: 'value',
      anotherValue: 'test value'
    };

    const asyncStorage = {
      getItem: jest.fn(() => {
        return Promise.resolve(
          JSON.stringify({
            user: {
              name: 'test user'
            }
          })
        );
      }),
      setItem: jest.fn(() => Promise.resolve())
    };

    const restore = jest.fn(savedStore => {
      return {
        user: savedStore.user
      };
    });

    const initCallback = jest.fn();

    createStore(
      {
        initialStore,
        persist: {
          stringify: true,
          asyncStorage,
          restore
        }
      },
      initCallback
    );

    return new Promise(resolve => setTimeout(resolve, 200)).then(
      () => {
        expect(restore).toHaveBeenCalledWith({
          user: {
            name: 'test user'
          },
          testValue: 'value',
          anotherValue: 'test value'
        });

        expect(initCallback).toHaveBeenCalledWith({
          user: {
            name: 'test user'
          },
          testValue: 'value',
          anotherValue: 'test value'
        });
      }
    );
  });

  test('gets item from asyncStorage then calls restore', () => {
    expect.assertions(4);

    const initialStore = {
      user: null,
      testValue: 'value',
      anotherValue: 'test value'
    };

    const asyncStorage = {
      getItem: jest.fn(
        () =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve(
                JSON.stringify({
                  user: {
                    name: 'test user'
                  }
                })
              );
            }, 200);
          })
      ),
      setItem: jest.fn(() => Promise.resolve())
    };

    const restore = jest.fn(savedStore => {
      return {
        user: savedStore.user
      };
    });

    const observer1 = jest.fn();
    const observer2 = jest.fn();
    const initCallback = jest.fn();

    const store = createStore(
      {
        initialStore,
        persist: {
          asyncStorage,
          restore,
          stringify: true
        }
      },
      initCallback
    );

    store.addObserver(observer1, ['user']);

    store.addObserver(observer2, ['user']);

    return new Promise(resolve => setTimeout(resolve, 200))
      .then(() => {
        expect(initCallback).toHaveBeenCalledTimes(1);
        expect(asyncStorage.getItem).toHaveBeenCalled();
        expect(restore).toHaveBeenCalled();

        store.updateStore({
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
  test('can turn off JSON.stringify using stringify config option', () => {
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

    const store = createStore({
      initialStore,
      persist: {
        asyncStorage,
        restore,
        stringify: false
      }
    });

    const origStringify = JSON.stringify;
    const origParse = JSON.parse;
    JSON.stringify = jest.fn(obj => origStringify(obj));
    JSON.parse = jest.fn(obj => origParse(obj));

    return Promise.resolve()
      .then(() => {
        expect(asyncStorage.getItem).toHaveBeenCalled();
        expect(restore).toHaveBeenCalled();

        store.updateStore({
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

/** @format */
import { store, updateStore, initializeStore } from '../../lib';

describe('updateStore', () => {
  test('Update store only updates parts of the store that\'s to be updated. getStore returns the updated store.', () => {
    const initialStore = {
      value: 'testValue',
      count: 1
    };

    initializeStore({ initialStore });

    updateStore({
      count: 100
    });

    expect(store).toEqual({
      value: 'testValue',
      count: 100
    });

    updateStore({
      count: 50
    });

    expect(store).toEqual({
      value: 'testValue',
      count: 50
    });

    updateStore({
      value: 'testing',
      count: 100
    });

    expect(store).toEqual({
      value: 'testing',
      count: 100
    });
  });
});

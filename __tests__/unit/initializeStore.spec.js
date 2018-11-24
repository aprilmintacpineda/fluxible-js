/** @format */

import { store, initializeStore } from '../../lib';

describe('initializeStore', () => {
  test('initializes store', () => {
    const initialStore = {
      count: 1,
      countAgain: 2
    };

    initializeStore({ initialStore });

    expect(store).toEqual(initialStore);
  });
});

/** @format */

import { getStore, initializeStore } from '../../lib';

describe('initializeStore', () => {
  test('initializes store', () => {
    const initialStore = {
      count: 1,
      countAgain: 2
    };

    initializeStore({ initialStore });

    expect(getStore()).toEqual(initialStore);
  });
});

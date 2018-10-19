/** @format */

import { getStore, initializeStore } from '../../lib';

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

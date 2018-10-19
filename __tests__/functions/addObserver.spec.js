/** @format */

import { updateStore, initializeStore, addObserver } from '../../lib';

describe('observers', () => {
  test('calls appropriate observer after update store', () => {
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
    expect(countListener).toHaveBeenCalledWith({
      value: 'testValue',
      count: 2
    });

    updateStore({ count: 3 });
    expect(countListener).toHaveBeenCalledWith({
      value: 'testValue',
      count: 3
    });

    updateStore({ count: 4 });
    expect(countListener).toHaveBeenCalledWith({
      value: 'testValue',
      count: 4
    });

    updateStore({ count: 5 });
    expect(countListener).toHaveBeenCalledWith({
      value: 'testValue',
      count: 5
    });

    expect(valueListener).not.toHaveBeenCalled();

    updateStore({ value: 'another' });
    expect(valueListener).toHaveBeenCalledWith({
      value: 'another',
      count: 5
    });

    updateStore({ value: 'another value' });
    expect(valueListener).toHaveBeenCalledWith({
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

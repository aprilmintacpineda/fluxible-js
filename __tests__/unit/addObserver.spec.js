/** @format */

import {
  updateStore,
  initializeStore,
  addObserver
} from '../../src';

describe('addObserver', () => {
  test('calls appropriate observer after update store', () => {
    const initialStore = {
      value: 'testValue',
      test1: 'test1',
      test2: 'test2',
      test3: 'test3',
      test4: 'test4',
      test5: 'test5',
      count: 1
    };

    const countListener = jest.fn();
    const valueListener = jest.fn();
    const bothListener = jest.fn();
    const allListener = jest.fn();

    initializeStore({ initialStore });
    addObserver(countListener, ['count']);
    addObserver(valueListener, ['value']);
    addObserver(bothListener, ['count', 'value']);
    addObserver(allListener, [
      'value',
      'test1',
      'test2',
      'test3',
      'test4',
      'test5',
      'count'
    ]);

    updateStore({ count: 2 });
    expect(countListener).toHaveBeenCalled();
    expect(bothListener).toHaveBeenCalled();
    expect(allListener).toHaveBeenCalled();

    updateStore({ count: 3 });
    expect(countListener).toHaveBeenCalled();
    expect(bothListener).toHaveBeenCalled();
    expect(allListener).toHaveBeenCalled();

    updateStore({ count: 4 });
    expect(countListener).toHaveBeenCalled();
    expect(bothListener).toHaveBeenCalled();
    expect(allListener).toHaveBeenCalled();

    updateStore({ count: 5 });
    expect(countListener).toHaveBeenCalled();
    expect(bothListener).toHaveBeenCalled();
    expect(allListener).toHaveBeenCalled();

    expect(valueListener).not.toHaveBeenCalled();

    updateStore({ value: 'another' });
    expect(valueListener).toHaveBeenCalled();
    expect(bothListener).toHaveBeenCalled();
    expect(allListener).toHaveBeenCalled();

    updateStore({ value: 'another value' });
    expect(valueListener).toHaveBeenCalled();
    expect(bothListener).toHaveBeenCalled();
    expect(allListener).toHaveBeenCalled();

    expect(countListener).toHaveBeenCalledTimes(4);
    expect(valueListener).toHaveBeenCalledTimes(2);
    expect(bothListener).toHaveBeenCalledTimes(6);
    expect(allListener).toHaveBeenCalledTimes(6);
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

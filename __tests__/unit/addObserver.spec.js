/** @format */

import { createStore } from '../../lib';

describe('addObserver', () => {
  test('calls appropriate observer after update store', () => {
    const store = new createStore({
      value: 'testValue',
      test1: 'test1',
      test2: 'test2',
      test3: 'test3',
      test4: 'test4',
      test5: 'test5',
      count: 1
    });

    const countListener = jest.fn();
    const valueListener = jest.fn();
    const bothListener = jest.fn();
    const allListener = jest.fn();

    store.addObserver(countListener, ['count']);
    store.addObserver(valueListener, ['value']);
    store.addObserver(bothListener, ['count', 'value']);
    store.addObserver(allListener, [
      'value',
      'test1',
      'test2',
      'test3',
      'test4',
      'test5',
      'count'
    ]);

    store.updateStore({ count: 2 });
    expect(countListener).toHaveBeenCalled();
    expect(bothListener).toHaveBeenCalled();
    expect(allListener).toHaveBeenCalled();

    store.updateStore({ count: 3 });
    expect(countListener).toHaveBeenCalled();
    expect(bothListener).toHaveBeenCalled();
    expect(allListener).toHaveBeenCalled();

    store.updateStore({ count: 4 });
    expect(countListener).toHaveBeenCalled();
    expect(bothListener).toHaveBeenCalled();
    expect(allListener).toHaveBeenCalled();

    store.updateStore({ count: 5 });
    expect(countListener).toHaveBeenCalled();
    expect(bothListener).toHaveBeenCalled();
    expect(allListener).toHaveBeenCalled();

    expect(valueListener).not.toHaveBeenCalled();

    store.updateStore({ value: 'another' });
    expect(valueListener).toHaveBeenCalled();
    expect(bothListener).toHaveBeenCalled();
    expect(allListener).toHaveBeenCalled();

    store.updateStore({ value: 'another value' });
    expect(valueListener).toHaveBeenCalled();
    expect(bothListener).toHaveBeenCalled();
    expect(allListener).toHaveBeenCalled();

    expect(countListener).toHaveBeenCalledTimes(4);
    expect(valueListener).toHaveBeenCalledTimes(2);
    expect(bothListener).toHaveBeenCalledTimes(6);
    expect(allListener).toHaveBeenCalledTimes(6);
  });

  test('can unsubscribe a listener', () => {
    const store = new createStore({
      initialStore: {
        value: 'testValue',
        count: 1
      }
    });

    const listener1 = jest.fn();
    const listener2 = jest.fn();

    const unsub1 = store.addObserver(listener1, ['count']);
    store.addObserver(listener2, ['count']);

    store.updateStore({ count: 100 });
    store.updateStore({ count: 100 });

    unsub1();

    store.updateStore({ count: 100 });
    store.updateStore({ count: 100 });

    expect(listener1).toHaveBeenCalledTimes(2);
    expect(listener2).toHaveBeenCalledTimes(4);
  });
});

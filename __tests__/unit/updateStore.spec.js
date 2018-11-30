/** @format */
import { store, updateStore, initializeStore, addObserver } from '../../lib';

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

describe('Update store does not skip any observer in the event that an observer was removed during the update', () => {
  test('When a listener at the front of the counter was removed', () => {
    const initialStore = {
      value: 'testValue',
      count: 1
    };

    initializeStore({ initialStore });

    let canRemove = false;

    let listener1 = jest.fn(() => {
      if (canRemove) {
        unobserve();
      }
    });
    let listener2 = jest.fn();
    let listener3 = jest.fn();
    let listener4 = jest.fn();
    let listener5 = jest.fn();

    addObserver(listener1, ['value']);
    addObserver(listener2, ['value']);
    let unobserve = addObserver(listener3, ['value']);
    addObserver(listener4, ['value']);
    addObserver(listener5, ['value']);

    updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
    expect(listener4).toHaveBeenCalled();
    expect(listener5).toHaveBeenCalled();

    canRemove = true;

    updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalledTimes(2);
    expect(listener2).toHaveBeenCalledTimes(2);
    expect(listener3).toHaveBeenCalledTimes(1);
    expect(listener4).toHaveBeenCalledTimes(2);
    expect(listener5).toHaveBeenCalledTimes(2);
  });

  test('When a listener at the back of the counter was removed', () => {
    const initialStore = {
      value: 'testValue',
      count: 1
    };

    initializeStore({ initialStore });

    let canRemove = false;

    let listener1 = jest.fn();
    let listener2 = jest.fn();
    let listener3 = jest.fn(() => {
      if (canRemove) {
        unobserve();
      }
    });
    let listener4 = jest.fn();
    let listener5 = jest.fn();

    let unobserve = addObserver(listener1, ['value']);
    addObserver(listener2, ['value']);
    addObserver(listener3, ['value']);
    addObserver(listener4, ['value']);
    addObserver(listener5, ['value']);

    updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
    expect(listener4).toHaveBeenCalled();
    expect(listener5).toHaveBeenCalled();

    canRemove = true;

    updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalledTimes(2);
    expect(listener2).toHaveBeenCalledTimes(2);
    expect(listener3).toHaveBeenCalledTimes(2);
    expect(listener4).toHaveBeenCalledTimes(2);
    expect(listener5).toHaveBeenCalledTimes(2);
  });

  test('when an observer removed itself', () => {
    const initialStore = {
      value: 'testValue',
      count: 1
    };

    initializeStore({ initialStore });

    let canRemove = false;

    let listener1 = jest.fn();
    let listener2 = jest.fn();
    let listener3 = jest.fn(() => {
      if (canRemove) {
        unobserve();
      }
    });
    let listener4 = jest.fn();
    let listener5 = jest.fn();

    addObserver(listener1, ['value']);
    addObserver(listener2, ['value']);
    let unobserve = addObserver(listener3, ['value']);
    addObserver(listener4, ['value']);
    addObserver(listener5, ['value']);

    updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
    expect(listener4).toHaveBeenCalled();
    expect(listener5).toHaveBeenCalled();

    canRemove = true;

    updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalledTimes(2);
    expect(listener2).toHaveBeenCalledTimes(2);
    expect(listener3).toHaveBeenCalledTimes(2);
    expect(listener4).toHaveBeenCalledTimes(2);
    expect(listener5).toHaveBeenCalledTimes(2);
  });
});

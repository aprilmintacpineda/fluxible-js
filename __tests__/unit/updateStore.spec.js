/** @format */
import { store, updateStore, initializeStore, addObserver } from '../../src';

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

describe('Does not skip any observer in the event that an observer was removed during the update', () => {
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

describe('Does not skip any observer in the event that more than one observers were removed during the update', () => {
  test('when an observer removed one on the back and then one on the front', () => {
    const initialStore = {
      value: 'testValue',
      count: 1
    };

    initializeStore({ initialStore });

    let canRemove = false;

    let listener1 = jest.fn();
    let listener2 = jest.fn(() => {
      if (canRemove) {
        unobserve1();
        unobserve3();
      }
    });
    let listener3 = jest.fn();
    let listener4 = jest.fn();
    let listener5 = jest.fn();

    let unobserve1 = addObserver(listener1, ['value']);
    addObserver(listener2, ['value']);
    let unobserve3 = addObserver(listener3, ['value']);
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

  test('when an observer removed one on the front and then one on the back', () => {
    const initialStore = {
      value: 'testValue',
      count: 1
    };

    initializeStore({ initialStore });

    let canRemove = false;

    let listener1 = jest.fn();
    let listener2 = jest.fn(() => {
      if (canRemove) {
        unobserve3();
        unobserve1();
      }
    });
    let listener3 = jest.fn();
    let listener4 = jest.fn();
    let listener5 = jest.fn();

    let unobserve1 = addObserver(listener1, ['value']);
    addObserver(listener2, ['value']);
    let unobserve3 = addObserver(listener3, ['value']);
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

  test('when an observer removed one on the back and then itself', () => {
    const initialStore = {
      value: 'testValue',
      count: 1
    };

    initializeStore({ initialStore });

    let canRemove = false;

    let listener1 = jest.fn();
    let listener2 = jest.fn(() => {
      if (canRemove) {
        unobserve1();
        unobserve2();
      }
    });
    let listener3 = jest.fn();
    let listener4 = jest.fn();
    let listener5 = jest.fn();

    let unobserve1 = addObserver(listener1, ['value']);
    let unobserve2 = addObserver(listener2, ['value']);
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

  test('when an observer removed one on the front and then itself', () => {
    const initialStore = {
      value: 'testValue',
      count: 1
    };

    initializeStore({ initialStore });

    let canRemove = false;

    let listener1 = jest.fn();
    let listener2 = jest.fn(() => {
      if (canRemove) {
        unobserve4();
        unobserve2();
      }
    });
    let listener3 = jest.fn();
    let listener4 = jest.fn();
    let listener5 = jest.fn();

    addObserver(listener1, ['value']);
    let unobserve2 = addObserver(listener2, ['value']);
    addObserver(listener3, ['value']);
    let unobserve4 = addObserver(listener4, ['value']);
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
    expect(listener4).toHaveBeenCalledTimes(1);
    expect(listener5).toHaveBeenCalledTimes(2);
  });

  test('when an observer removed itself and then one on the back', () => {
    const initialStore = {
      value: 'testValue',
      count: 1
    };

    initializeStore({ initialStore });

    let canRemove = false;

    let listener1 = jest.fn();
    let listener2 = jest.fn(() => {
      if (canRemove) {
        unobserve2();
        unobserve1();
      }
    });
    let listener3 = jest.fn();
    let listener4 = jest.fn();
    let listener5 = jest.fn();

    let unobserve1 = addObserver(listener1, ['value']);
    let unobserve2 = addObserver(listener2, ['value']);
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

  test('when an observer removed itself and then one on the front', () => {
    const initialStore = {
      value: 'testValue',
      count: 1
    };

    initializeStore({ initialStore });

    let canRemove = false;

    let listener1 = jest.fn();
    let listener2 = jest.fn(() => {
      if (canRemove) {
        unobserve2();
        unobserve4();
      }
    });
    let listener3 = jest.fn();
    let listener4 = jest.fn();
    let listener5 = jest.fn();

    addObserver(listener1, ['value']);
    let unobserve2 = addObserver(listener2, ['value']);
    addObserver(listener3, ['value']);
    let unobserve4 = addObserver(listener4, ['value']);
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
    expect(listener4).toHaveBeenCalledTimes(1);
    expect(listener5).toHaveBeenCalledTimes(2);
  });

  test('when an observer removes 3 observers on the front', () => {
    const initialStore = {
      value: 'testValue',
      count: 1
    };

    initializeStore({ initialStore });

    let canRemove = false;

    let listener1 = jest.fn();
    let listener2 = jest.fn(() => {
      if (canRemove) {
        unobserve6();
        unobserve7();
        unobserve8();
      }
    });
    let listener3 = jest.fn();
    let listener4 = jest.fn();
    let listener5 = jest.fn();
    let listener6 = jest.fn();
    let listener7 = jest.fn();
    let listener8 = jest.fn();
    let listener9 = jest.fn();
    let listener10 = jest.fn();

    addObserver(listener1, ['value']);
    addObserver(listener2, ['value']);
    addObserver(listener3, ['value']);
    addObserver(listener4, ['value']);
    addObserver(listener5, ['value']);
    let unobserve6 = addObserver(listener6, ['value']);
    let unobserve7 = addObserver(listener7, ['value']);
    let unobserve8 = addObserver(listener8, ['value']);
    addObserver(listener9, ['value']);
    addObserver(listener10, ['value']);

    updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
    expect(listener4).toHaveBeenCalled();
    expect(listener5).toHaveBeenCalled();
    expect(listener6).toHaveBeenCalled();
    expect(listener7).toHaveBeenCalled();
    expect(listener8).toHaveBeenCalled();
    expect(listener9).toHaveBeenCalled();
    expect(listener10).toHaveBeenCalled();

    canRemove = true;

    updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalledTimes(2);
    expect(listener2).toHaveBeenCalledTimes(2);
    expect(listener3).toHaveBeenCalledTimes(2);
    expect(listener4).toHaveBeenCalledTimes(2);
    expect(listener5).toHaveBeenCalledTimes(2);
    expect(listener6).toHaveBeenCalledTimes(1);
    expect(listener7).toHaveBeenCalledTimes(1);
    expect(listener8).toHaveBeenCalledTimes(1);
    expect(listener9).toHaveBeenCalledTimes(2);
    expect(listener10).toHaveBeenCalledTimes(2);
  });

  test('when an observer removes 3 observers on the back', () => {
    const initialStore = {
      value: 'testValue',
      count: 1
    };

    initializeStore({ initialStore });

    let canRemove = false;

    let listener1 = jest.fn();
    let listener2 = jest.fn();
    let listener3 = jest.fn();
    let listener4 = jest.fn();
    let listener5 = jest.fn();
    let listener6 = jest.fn();
    let listener7 = jest.fn();
    let listener8 = jest.fn();
    let listener9 = jest.fn();
    let listener10 = jest.fn(() => {
      if (canRemove) {
        unobserve1();
        unobserve3();
        unobserve5();
      }
    });

    let unobserve1 = addObserver(listener1, ['value']);
    addObserver(listener2, ['value']);
    let unobserve3 = addObserver(listener3, ['value']);
    addObserver(listener4, ['value']);
    let unobserve5 = addObserver(listener5, ['value']);
    addObserver(listener6, ['value']);
    addObserver(listener7, ['value']);
    addObserver(listener8, ['value']);
    addObserver(listener9, ['value']);
    addObserver(listener10, ['value']);

    updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
    expect(listener4).toHaveBeenCalled();
    expect(listener5).toHaveBeenCalled();
    expect(listener6).toHaveBeenCalled();
    expect(listener7).toHaveBeenCalled();
    expect(listener8).toHaveBeenCalled();
    expect(listener9).toHaveBeenCalled();
    expect(listener10).toHaveBeenCalled();

    canRemove = true;

    updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalledTimes(2);
    expect(listener2).toHaveBeenCalledTimes(2);
    expect(listener3).toHaveBeenCalledTimes(2);
    expect(listener4).toHaveBeenCalledTimes(2);
    expect(listener5).toHaveBeenCalledTimes(2);
    expect(listener6).toHaveBeenCalledTimes(2);
    expect(listener7).toHaveBeenCalledTimes(2);
    expect(listener8).toHaveBeenCalledTimes(2);
    expect(listener9).toHaveBeenCalledTimes(2);
    expect(listener10).toHaveBeenCalledTimes(2);
  });

  test('when an observer removes 3 observers on the front and then itself', () => {
    const initialStore = {
      value: 'testValue',
      count: 1
    };

    initializeStore({ initialStore });

    let canRemove = false;

    let listener1 = jest.fn();
    let listener2 = jest.fn(() => {
      if (canRemove) {
        unobserve6();
        unobserve7();
        unobserve8();
        unobserver2();
      }
    });
    let listener3 = jest.fn();
    let listener4 = jest.fn();
    let listener5 = jest.fn();
    let listener6 = jest.fn();
    let listener7 = jest.fn();
    let listener8 = jest.fn();
    let listener9 = jest.fn();
    let listener10 = jest.fn();

    addObserver(listener1, ['value']);
    let unobserver2 = addObserver(listener2, ['value']);
    addObserver(listener3, ['value']);
    addObserver(listener4, ['value']);
    addObserver(listener5, ['value']);
    let unobserve6 = addObserver(listener6, ['value']);
    let unobserve7 = addObserver(listener7, ['value']);
    let unobserve8 = addObserver(listener8, ['value']);
    addObserver(listener9, ['value']);
    addObserver(listener10, ['value']);

    updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
    expect(listener4).toHaveBeenCalled();
    expect(listener5).toHaveBeenCalled();
    expect(listener6).toHaveBeenCalled();
    expect(listener7).toHaveBeenCalled();
    expect(listener8).toHaveBeenCalled();
    expect(listener9).toHaveBeenCalled();
    expect(listener10).toHaveBeenCalled();

    canRemove = true;

    updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalledTimes(2);
    expect(listener2).toHaveBeenCalledTimes(2);
    expect(listener3).toHaveBeenCalledTimes(2);
    expect(listener4).toHaveBeenCalledTimes(2);
    expect(listener5).toHaveBeenCalledTimes(2);
    expect(listener6).toHaveBeenCalledTimes(1);
    expect(listener7).toHaveBeenCalledTimes(1);
    expect(listener8).toHaveBeenCalledTimes(1);
    expect(listener9).toHaveBeenCalledTimes(2);
    expect(listener10).toHaveBeenCalledTimes(2);
  });

  test('when an observer removes 3 observers on the back and then itself', () => {
    const initialStore = {
      value: 'testValue',
      count: 1
    };

    initializeStore({ initialStore });

    let canRemove = false;

    let listener1 = jest.fn();
    let listener2 = jest.fn();
    let listener3 = jest.fn();
    let listener4 = jest.fn();
    let listener5 = jest.fn();
    let listener6 = jest.fn();
    let listener7 = jest.fn();
    let listener8 = jest.fn();
    let listener9 = jest.fn(() => {
      if (canRemove) {
        unobserve1();
        unobserve3();
        unobserve5();
        unobserve9();
      }
    });
    let listener10 = jest.fn();

    let unobserve1 = addObserver(listener1, ['value']);
    addObserver(listener2, ['value']);
    let unobserve3 = addObserver(listener3, ['value']);
    addObserver(listener4, ['value']);
    let unobserve5 = addObserver(listener5, ['value']);
    addObserver(listener6, ['value']);
    addObserver(listener7, ['value']);
    addObserver(listener8, ['value']);
    let unobserve9 = addObserver(listener9, ['value']);
    addObserver(listener10, ['value']);

    updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
    expect(listener4).toHaveBeenCalled();
    expect(listener5).toHaveBeenCalled();
    expect(listener6).toHaveBeenCalled();
    expect(listener7).toHaveBeenCalled();
    expect(listener8).toHaveBeenCalled();
    expect(listener9).toHaveBeenCalled();
    expect(listener10).toHaveBeenCalled();

    canRemove = true;

    updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalledTimes(2);
    expect(listener2).toHaveBeenCalledTimes(2);
    expect(listener3).toHaveBeenCalledTimes(2);
    expect(listener4).toHaveBeenCalledTimes(2);
    expect(listener5).toHaveBeenCalledTimes(2);
    expect(listener6).toHaveBeenCalledTimes(2);
    expect(listener7).toHaveBeenCalledTimes(2);
    expect(listener8).toHaveBeenCalledTimes(2);
    expect(listener9).toHaveBeenCalledTimes(2);
    expect(listener10).toHaveBeenCalledTimes(2);
  });

  test('when an observer removes itself and then 3 observers on the front', () => {
    const initialStore = {
      value: 'testValue',
      count: 1
    };

    initializeStore({ initialStore });

    let canRemove = false;

    let listener1 = jest.fn();
    let listener2 = jest.fn(() => {
      if (canRemove) {
        unobserver2();
        unobserve6();
        unobserve7();
        unobserve8();
      }
    });
    let listener3 = jest.fn();
    let listener4 = jest.fn();
    let listener5 = jest.fn();
    let listener6 = jest.fn();
    let listener7 = jest.fn();
    let listener8 = jest.fn();
    let listener9 = jest.fn();
    let listener10 = jest.fn();

    addObserver(listener1, ['value']);
    let unobserver2 = addObserver(listener2, ['value']);
    addObserver(listener3, ['value']);
    addObserver(listener4, ['value']);
    addObserver(listener5, ['value']);
    let unobserve6 = addObserver(listener6, ['value']);
    let unobserve7 = addObserver(listener7, ['value']);
    let unobserve8 = addObserver(listener8, ['value']);
    addObserver(listener9, ['value']);
    addObserver(listener10, ['value']);

    updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
    expect(listener4).toHaveBeenCalled();
    expect(listener5).toHaveBeenCalled();
    expect(listener6).toHaveBeenCalled();
    expect(listener7).toHaveBeenCalled();
    expect(listener8).toHaveBeenCalled();
    expect(listener9).toHaveBeenCalled();
    expect(listener10).toHaveBeenCalled();

    canRemove = true;

    updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalledTimes(2);
    expect(listener2).toHaveBeenCalledTimes(2);
    expect(listener3).toHaveBeenCalledTimes(2);
    expect(listener4).toHaveBeenCalledTimes(2);
    expect(listener5).toHaveBeenCalledTimes(2);
    expect(listener6).toHaveBeenCalledTimes(1);
    expect(listener7).toHaveBeenCalledTimes(1);
    expect(listener8).toHaveBeenCalledTimes(1);
    expect(listener9).toHaveBeenCalledTimes(2);
    expect(listener10).toHaveBeenCalledTimes(2);
  });

  test('when an observer removes itself and then 3 observers on the back', () => {
    const initialStore = {
      value: 'testValue',
      count: 1
    };

    initializeStore({ initialStore });

    let canRemove = false;

    let listener1 = jest.fn();
    let listener2 = jest.fn();
    let listener3 = jest.fn();
    let listener4 = jest.fn();
    let listener5 = jest.fn();
    let listener6 = jest.fn();
    let listener7 = jest.fn();
    let listener8 = jest.fn();
    let listener9 = jest.fn(() => {
      if (canRemove) {
        unobserve9();
        unobserve1();
        unobserve3();
        unobserve5();
      }
    });
    let listener10 = jest.fn();

    let unobserve1 = addObserver(listener1, ['value']);
    addObserver(listener2, ['value']);
    let unobserve3 = addObserver(listener3, ['value']);
    addObserver(listener4, ['value']);
    let unobserve5 = addObserver(listener5, ['value']);
    addObserver(listener6, ['value']);
    addObserver(listener7, ['value']);
    addObserver(listener8, ['value']);
    let unobserve9 = addObserver(listener9, ['value']);
    addObserver(listener10, ['value']);

    updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
    expect(listener4).toHaveBeenCalled();
    expect(listener5).toHaveBeenCalled();
    expect(listener6).toHaveBeenCalled();
    expect(listener7).toHaveBeenCalled();
    expect(listener8).toHaveBeenCalled();
    expect(listener9).toHaveBeenCalled();
    expect(listener10).toHaveBeenCalled();

    canRemove = true;

    updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalledTimes(2);
    expect(listener2).toHaveBeenCalledTimes(2);
    expect(listener3).toHaveBeenCalledTimes(2);
    expect(listener4).toHaveBeenCalledTimes(2);
    expect(listener5).toHaveBeenCalledTimes(2);
    expect(listener6).toHaveBeenCalledTimes(2);
    expect(listener7).toHaveBeenCalledTimes(2);
    expect(listener8).toHaveBeenCalledTimes(2);
    expect(listener9).toHaveBeenCalledTimes(2);
    expect(listener10).toHaveBeenCalledTimes(2);
  });
});

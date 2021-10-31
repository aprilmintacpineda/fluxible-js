import { createStore } from '../../lib';

describe('updateStore', () => {
  test("Update store only updates parts of the store that's to be updated", () => {
    const initialStore = {
      value: 'testValue',
      test1: 'test1',
      test2: 'test2',
      test3: 'test3',
      test4: 'test4',
      test5: 'test5',
      count: 1
    };

    const store = createStore({ initialStore });

    store.updateStore({
      count: 100
    });

    expect(store.store).toEqual({
      value: 'testValue',
      test1: 'test1',
      test2: 'test2',
      test3: 'test3',
      test4: 'test4',
      test5: 'test5',
      count: 100
    });

    store.updateStore({
      count: 50
    });

    expect(store.store).toEqual({
      value: 'testValue',
      test1: 'test1',
      test2: 'test2',
      test3: 'test3',
      test4: 'test4',
      test5: 'test5',
      count: 50
    });

    store.updateStore({
      value: 'testing',
      count: 100
    });

    expect(store.store).toEqual({
      value: 'testing',
      test1: 'test1',
      test2: 'test2',
      test3: 'test3',
      test4: 'test4',
      test5: 'test5',
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

    const store = createStore({ initialStore });

    let canRemove = false;

    const listener1 = jest.fn(() => {
      if (canRemove) unobserve();
    });
    const listener2 = jest.fn();
    const listener3 = jest.fn();
    const listener4 = jest.fn();
    const listener5 = jest.fn();

    store.addObserver(listener1, ['value']);
    store.addObserver(listener2, ['value']);
    const unobserve = store.addObserver(listener3, ['value']);
    store.addObserver(listener4, ['value']);
    store.addObserver(listener5, ['value']);

    store.updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
    expect(listener4).toHaveBeenCalled();
    expect(listener5).toHaveBeenCalled();

    canRemove = true;

    store.updateStore({
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

    const store = createStore({ initialStore });

    let canRemove = false;

    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn(() => {
      if (canRemove) unobserve();
    });
    const listener4 = jest.fn();
    const listener5 = jest.fn();

    const unobserve = store.addObserver(listener1, ['value']);
    store.addObserver(listener2, ['value']);
    store.addObserver(listener3, ['value']);
    store.addObserver(listener4, ['value']);
    store.addObserver(listener5, ['value']);

    store.updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
    expect(listener4).toHaveBeenCalled();
    expect(listener5).toHaveBeenCalled();

    canRemove = true;

    store.updateStore({
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

    const store = createStore({ initialStore });

    let canRemove = false;

    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn(() => {
      if (canRemove) unobserve();
    });
    const listener4 = jest.fn();
    const listener5 = jest.fn();

    store.addObserver(listener1, ['value']);
    store.addObserver(listener2, ['value']);
    const unobserve = store.addObserver(listener3, ['value']);
    store.addObserver(listener4, ['value']);
    store.addObserver(listener5, ['value']);

    store.updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
    expect(listener4).toHaveBeenCalled();
    expect(listener5).toHaveBeenCalled();

    canRemove = true;

    store.updateStore({
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

    const store = createStore({ initialStore });

    let canRemove = false;

    const listener1 = jest.fn();
    const listener2 = jest.fn(() => {
      if (canRemove) {
        unobserve1();
        unobserve3();
      }
    });
    const listener3 = jest.fn();
    const listener4 = jest.fn();
    const listener5 = jest.fn();

    const unobserve1 = store.addObserver(listener1, ['value']);
    store.addObserver(listener2, ['value']);
    const unobserve3 = store.addObserver(listener3, ['value']);
    store.addObserver(listener4, ['value']);
    store.addObserver(listener5, ['value']);

    store.updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
    expect(listener4).toHaveBeenCalled();
    expect(listener5).toHaveBeenCalled();

    canRemove = true;

    store.updateStore({
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

    const store = createStore({ initialStore });

    let canRemove = false;

    const listener1 = jest.fn();
    const listener2 = jest.fn(() => {
      if (canRemove) {
        unobserve3();
        unobserve1();
      }
    });
    const listener3 = jest.fn();
    const listener4 = jest.fn();
    const listener5 = jest.fn();

    const unobserve1 = store.addObserver(listener1, ['value']);
    store.addObserver(listener2, ['value']);
    const unobserve3 = store.addObserver(listener3, ['value']);
    store.addObserver(listener4, ['value']);
    store.addObserver(listener5, ['value']);

    store.updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
    expect(listener4).toHaveBeenCalled();
    expect(listener5).toHaveBeenCalled();

    canRemove = true;

    store.updateStore({
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

    const store = createStore({ initialStore });

    let canRemove = false;

    const listener1 = jest.fn();
    const listener2 = jest.fn(() => {
      if (canRemove) {
        unobserve1();
        unobserve2();
      }
    });
    const listener3 = jest.fn();
    const listener4 = jest.fn();
    const listener5 = jest.fn();

    const unobserve1 = store.addObserver(listener1, ['value']);
    const unobserve2 = store.addObserver(listener2, ['value']);
    store.addObserver(listener3, ['value']);
    store.addObserver(listener4, ['value']);
    store.addObserver(listener5, ['value']);

    store.updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
    expect(listener4).toHaveBeenCalled();
    expect(listener5).toHaveBeenCalled();

    canRemove = true;

    store.updateStore({
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

    const store = createStore({ initialStore });

    let canRemove = false;

    const listener1 = jest.fn();
    const listener2 = jest.fn(() => {
      if (canRemove) {
        unobserve4();
        unobserve2();
      }
    });
    const listener3 = jest.fn();
    const listener4 = jest.fn();
    const listener5 = jest.fn();

    store.addObserver(listener1, ['value']);
    const unobserve2 = store.addObserver(listener2, ['value']);
    store.addObserver(listener3, ['value']);
    const unobserve4 = store.addObserver(listener4, ['value']);
    store.addObserver(listener5, ['value']);

    store.updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
    expect(listener4).toHaveBeenCalled();
    expect(listener5).toHaveBeenCalled();

    canRemove = true;

    store.updateStore({
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

    const store = createStore({ initialStore });

    let canRemove = false;

    const listener1 = jest.fn();
    const listener2 = jest.fn(() => {
      if (canRemove) {
        unobserve2();
        unobserve1();
      }
    });
    const listener3 = jest.fn();
    const listener4 = jest.fn();
    const listener5 = jest.fn();

    const unobserve1 = store.addObserver(listener1, ['value']);
    const unobserve2 = store.addObserver(listener2, ['value']);
    store.addObserver(listener3, ['value']);
    store.addObserver(listener4, ['value']);
    store.addObserver(listener5, ['value']);

    store.updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
    expect(listener4).toHaveBeenCalled();
    expect(listener5).toHaveBeenCalled();

    canRemove = true;

    store.updateStore({
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

    const store = createStore({ initialStore });

    let canRemove = false;

    const listener1 = jest.fn();
    const listener2 = jest.fn(() => {
      if (canRemove) {
        unobserve2();
        unobserve4();
      }
    });
    const listener3 = jest.fn();
    const listener4 = jest.fn();
    const listener5 = jest.fn();

    store.addObserver(listener1, ['value']);
    const unobserve2 = store.addObserver(listener2, ['value']);
    store.addObserver(listener3, ['value']);
    const unobserve4 = store.addObserver(listener4, ['value']);
    store.addObserver(listener5, ['value']);

    store.updateStore({
      value: 1
    });

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
    expect(listener3).toHaveBeenCalled();
    expect(listener4).toHaveBeenCalled();
    expect(listener5).toHaveBeenCalled();

    canRemove = true;

    store.updateStore({
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

    const store = createStore({ initialStore });

    let canRemove = false;

    const listener1 = jest.fn();
    const listener2 = jest.fn(() => {
      if (canRemove) {
        unobserve6();
        unobserve7();
        unobserve8();
      }
    });
    const listener3 = jest.fn();
    const listener4 = jest.fn();
    const listener5 = jest.fn();
    const listener6 = jest.fn();
    const listener7 = jest.fn();
    const listener8 = jest.fn();
    const listener9 = jest.fn();
    const listener10 = jest.fn();

    store.addObserver(listener1, ['value']);
    store.addObserver(listener2, ['value']);
    store.addObserver(listener3, ['value']);
    store.addObserver(listener4, ['value']);
    store.addObserver(listener5, ['value']);
    const unobserve6 = store.addObserver(listener6, ['value']);
    const unobserve7 = store.addObserver(listener7, ['value']);
    const unobserve8 = store.addObserver(listener8, ['value']);
    store.addObserver(listener9, ['value']);
    store.addObserver(listener10, ['value']);

    store.updateStore({
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

    store.updateStore({
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

    const store = createStore({ initialStore });

    let canRemove = false;

    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();
    const listener4 = jest.fn();
    const listener5 = jest.fn();
    const listener6 = jest.fn();
    const listener7 = jest.fn();
    const listener8 = jest.fn();
    const listener9 = jest.fn();
    const listener10 = jest.fn(() => {
      if (canRemove) {
        unobserve1();
        unobserve3();
        unobserve5();
      }
    });

    const unobserve1 = store.addObserver(listener1, ['value']);
    store.addObserver(listener2, ['value']);
    const unobserve3 = store.addObserver(listener3, ['value']);
    store.addObserver(listener4, ['value']);
    const unobserve5 = store.addObserver(listener5, ['value']);
    store.addObserver(listener6, ['value']);
    store.addObserver(listener7, ['value']);
    store.addObserver(listener8, ['value']);
    store.addObserver(listener9, ['value']);
    store.addObserver(listener10, ['value']);

    store.updateStore({
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

    store.updateStore({
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

    const store = createStore({ initialStore });

    let canRemove = false;

    const listener1 = jest.fn();
    const listener2 = jest.fn(() => {
      if (canRemove) {
        unobserve6();
        unobserve7();
        unobserve8();
        unobserver2();
      }
    });
    const listener3 = jest.fn();
    const listener4 = jest.fn();
    const listener5 = jest.fn();
    const listener6 = jest.fn();
    const listener7 = jest.fn();
    const listener8 = jest.fn();
    const listener9 = jest.fn();
    const listener10 = jest.fn();

    store.addObserver(listener1, ['value']);
    const unobserver2 = store.addObserver(listener2, ['value']);
    store.addObserver(listener3, ['value']);
    store.addObserver(listener4, ['value']);
    store.addObserver(listener5, ['value']);
    const unobserve6 = store.addObserver(listener6, ['value']);
    const unobserve7 = store.addObserver(listener7, ['value']);
    const unobserve8 = store.addObserver(listener8, ['value']);
    store.addObserver(listener9, ['value']);
    store.addObserver(listener10, ['value']);

    store.updateStore({
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

    store.updateStore({
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

    const store = createStore({ initialStore });

    let canRemove = false;

    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();
    const listener4 = jest.fn();
    const listener5 = jest.fn();
    const listener6 = jest.fn();
    const listener7 = jest.fn();
    const listener8 = jest.fn();
    const listener9 = jest.fn(() => {
      if (canRemove) {
        unobserve1();
        unobserve3();
        unobserve5();
        unobserve9();
      }
    });
    const listener10 = jest.fn();

    const unobserve1 = store.addObserver(listener1, ['value']);
    store.addObserver(listener2, ['value']);
    const unobserve3 = store.addObserver(listener3, ['value']);
    store.addObserver(listener4, ['value']);
    const unobserve5 = store.addObserver(listener5, ['value']);
    store.addObserver(listener6, ['value']);
    store.addObserver(listener7, ['value']);
    store.addObserver(listener8, ['value']);
    const unobserve9 = store.addObserver(listener9, ['value']);
    store.addObserver(listener10, ['value']);

    store.updateStore({
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

    store.updateStore({
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

    const store = createStore({ initialStore });

    let canRemove = false;

    const listener1 = jest.fn();
    const listener2 = jest.fn(() => {
      if (canRemove) {
        unobserver2();
        unobserve6();
        unobserve7();
        unobserve8();
      }
    });
    const listener3 = jest.fn();
    const listener4 = jest.fn();
    const listener5 = jest.fn();
    const listener6 = jest.fn();
    const listener7 = jest.fn();
    const listener8 = jest.fn();
    const listener9 = jest.fn();
    const listener10 = jest.fn();

    store.addObserver(listener1, ['value']);
    const unobserver2 = store.addObserver(listener2, ['value']);
    store.addObserver(listener3, ['value']);
    store.addObserver(listener4, ['value']);
    store.addObserver(listener5, ['value']);
    const unobserve6 = store.addObserver(listener6, ['value']);
    const unobserve7 = store.addObserver(listener7, ['value']);
    const unobserve8 = store.addObserver(listener8, ['value']);
    store.addObserver(listener9, ['value']);
    store.addObserver(listener10, ['value']);

    store.updateStore({
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

    store.updateStore({
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

    const store = createStore({ initialStore });

    let canRemove = false;

    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();
    const listener4 = jest.fn();
    const listener5 = jest.fn();
    const listener6 = jest.fn();
    const listener7 = jest.fn();
    const listener8 = jest.fn();
    const listener9 = jest.fn(() => {
      if (canRemove) {
        unobserve9();
        unobserve1();
        unobserve3();
        unobserve5();
      }
    });
    const listener10 = jest.fn();

    const unobserve1 = store.addObserver(listener1, ['value']);
    store.addObserver(listener2, ['value']);
    const unobserve3 = store.addObserver(listener3, ['value']);
    store.addObserver(listener4, ['value']);
    const unobserve5 = store.addObserver(listener5, ['value']);
    store.addObserver(listener6, ['value']);
    store.addObserver(listener7, ['value']);
    store.addObserver(listener8, ['value']);
    const unobserve9 = store.addObserver(listener9, ['value']);
    store.addObserver(listener10, ['value']);

    store.updateStore({
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

    store.updateStore({
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

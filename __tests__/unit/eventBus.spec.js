/** @format */

import { createStore } from '../../lib';

const store = new createStore({
  initialStore: {
    test: 123
  }
});

describe('eventBus', () => {
  test('can add, emit, and remove events', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();
    const payload = {
      test1: 'value',
      test2: 'value'
    };

    store.addEvent('test-event', callback1);
    store.addEvent('test-event', callback2);
    store.addEvent('test-event', callback3);
    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);

    store.emitEvent('test-event', payload);

    expect(callback1).toHaveBeenCalledWith(
      payload,
      store.store,
      'test-event'
    );
    expect(callback2).toHaveBeenCalledWith(
      payload,
      store.store,
      'test-event'
    );
    expect(callback3).toHaveBeenCalledWith(
      payload,
      store.store,
      'test-event'
    );

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(2);

    store.removeEvent('test-event');

    expect(store.emitEvent('test-event')).toEqual(undefined);
    expect(store.removeEvent('test-event')).toEqual(undefined);
  });

  test('can remove event callbacks', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();

    store.addEvent('test-event', callback1);
    store.addEvent('test-event', callback2);
    const removeCallback3 = store.addEvent('test-event', callback3);
    store.emitEvent('test-event');
    removeCallback3();
    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(1);
  });

  test('calls only listeners for that event', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();

    store.addEvent('test-event', callback1);
    store.addEvent('test-event', callback2);
    store.addEvent('another-event', callback3);
    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(0);

    store.emitEvent('another-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
  });
});

describe('Does not skip an event callback in the event that an event callback was removed during the event cycle', () => {
  test('when an event callback on the front was removed', () => {
    let canRemove = false;
    const callback1 = jest.fn();
    const callback2 = jest.fn(() => {
      if (canRemove) removeCallback4();
    });
    const callback3 = jest.fn();
    const callback4 = jest.fn();
    const callback5 = jest.fn();

    store.addEvent('test-event', callback1);
    store.addEvent('test-event', callback2);
    store.addEvent('test-event', callback3);
    const removeCallback4 = store.addEvent('test-event', callback4);
    store.addEvent('test-event', callback5);
    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);

    canRemove = true;

    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(2);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(2);
  });

  test('when an event callback on the back was removed', () => {
    let canRemove = false;
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();
    const callback4 = jest.fn(() => {
      if (canRemove) removeCallback1();
    });
    const callback5 = jest.fn();

    const removeCallback1 = store.addEvent('test-event', callback1);
    store.addEvent('test-event', callback2);
    store.addEvent('test-event', callback3);
    store.addEvent('test-event', callback4);
    store.addEvent('test-event', callback5);
    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);

    canRemove = true;

    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(2);
    expect(callback4).toHaveBeenCalledTimes(2);
    expect(callback5).toHaveBeenCalledTimes(2);
  });

  test('when an event callback removed itself', () => {
    let canRemove = false;
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();
    const callback4 = jest.fn(() => {
      if (canRemove) removeCallback4(callback4);
    });
    const callback5 = jest.fn();

    store.addEvent('test-event', callback1);
    store.addEvent('test-event', callback2);
    store.addEvent('test-event', callback3);
    const removeCallback4 = store.addEvent('test-event', callback4);
    store.addEvent('test-event', callback5);
    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);

    canRemove = true;

    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(2);
    expect(callback4).toHaveBeenCalledTimes(2);
    expect(callback5).toHaveBeenCalledTimes(2);
  });

  test('when an event callback removed one on the front and then itself', () => {
    let canRemove = false;
    const callback1 = jest.fn();
    const callback2 = jest.fn(() => {
      if (canRemove) {
        removeCallback4();
        removeCallback2();
      }
    });
    const callback3 = jest.fn();
    const callback4 = jest.fn();
    const callback5 = jest.fn();

    store.addEvent('test-event', callback1);
    const removeCallback2 = store.addEvent('test-event', callback2);
    store.addEvent('test-event', callback3);
    const removeCallback4 = store.addEvent('test-event', callback4);
    store.addEvent('test-event', callback5);
    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);

    canRemove = true;

    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(2);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(2);
  });

  test('when an event callback removed one on the back and then itself', () => {
    let canRemove = false;
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();
    const callback4 = jest.fn(() => {
      if (canRemove) {
        removeCallback1();
        removeCallback4();
      }
    });
    const callback5 = jest.fn();

    const removeCallback1 = store.addEvent('test-event', callback1);
    store.addEvent('test-event', callback2);
    store.addEvent('test-event', callback3);
    const removeCallback4 = store.addEvent('test-event', callback4);
    store.addEvent('test-event', callback5);
    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);

    canRemove = true;

    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(2);
    expect(callback4).toHaveBeenCalledTimes(2);
    expect(callback5).toHaveBeenCalledTimes(2);
  });

  test('when an event callback removed one on the back and then one on the front', () => {
    let canRemove = false;
    const callback1 = jest.fn();
    const callback2 = jest.fn(() => {
      if (canRemove) {
        removeCallback1();
        removeCallback4();
      }
    });
    const callback3 = jest.fn();
    const callback4 = jest.fn();
    const callback5 = jest.fn();

    const removeCallback1 = store.addEvent('test-event', callback1);
    store.addEvent('test-event', callback2);
    store.addEvent('test-event', callback3);
    const removeCallback4 = store.addEvent('test-event', callback4);
    store.addEvent('test-event', callback5);
    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);

    canRemove = true;

    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(2);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(2);
  });

  test('when an event callback removed one on the front and then one on the back', () => {
    let canRemove = false;
    const callback1 = jest.fn();
    const callback2 = jest.fn(() => {
      if (canRemove) {
        removeCallback4();
        removeCallback1();
      }
    });
    const callback3 = jest.fn();
    const callback4 = jest.fn();
    const callback5 = jest.fn();

    const removeCallback1 = store.addEvent('test-event', callback1);
    store.addEvent('test-event', callback2);
    store.addEvent('test-event', callback3);
    const removeCallback4 = store.addEvent('test-event', callback4);
    store.addEvent('test-event', callback5);
    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);

    canRemove = true;

    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(2);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(2);
  });

  test('when an event callback removed 3 on the front', () => {
    let canRemove = false;
    const callback1 = jest.fn();
    const callback2 = jest.fn(() => {
      if (canRemove) {
        removeCallback4();
        removeCallback5();
        removeCallback6();
      }
    });
    const callback3 = jest.fn();
    const callback4 = jest.fn();
    const callback5 = jest.fn();
    const callback6 = jest.fn();
    const callback7 = jest.fn();
    const callback8 = jest.fn();
    const callback9 = jest.fn();
    const callback10 = jest.fn();

    store.addEvent('test-event', callback1);
    store.addEvent('test-event', callback2);
    store.addEvent('test-event', callback3);
    const removeCallback4 = store.addEvent('test-event', callback4);
    const removeCallback5 = store.addEvent('test-event', callback5);
    const removeCallback6 = store.addEvent('test-event', callback6);
    store.addEvent('test-event', callback7);
    store.addEvent('test-event', callback8);
    store.addEvent('test-event', callback9);
    store.addEvent('test-event', callback10);
    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);
    expect(callback6).toHaveBeenCalledTimes(1);
    expect(callback7).toHaveBeenCalledTimes(1);
    expect(callback8).toHaveBeenCalledTimes(1);
    expect(callback9).toHaveBeenCalledTimes(1);
    expect(callback10).toHaveBeenCalledTimes(1);

    canRemove = true;

    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(2);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);
    expect(callback6).toHaveBeenCalledTimes(1);
    expect(callback7).toHaveBeenCalledTimes(2);
    expect(callback8).toHaveBeenCalledTimes(2);
    expect(callback9).toHaveBeenCalledTimes(2);
    expect(callback10).toHaveBeenCalledTimes(2);
  });

  test('when an event callback removed 3 on the back', () => {
    let canRemove = false;
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();
    const callback4 = jest.fn();
    const callback5 = jest.fn();
    const callback6 = jest.fn();
    const callback7 = jest.fn();
    const callback8 = jest.fn(() => {
      if (canRemove) {
        removeCallback1();
        removeCallback2();
        removeCallback3();
      }
    });
    const callback9 = jest.fn();
    const callback10 = jest.fn();

    const removeCallback1 = store.addEvent('test-event', callback1);
    const removeCallback2 = store.addEvent('test-event', callback2);
    const removeCallback3 = store.addEvent('test-event', callback3);
    store.addEvent('test-event', callback4);
    store.addEvent('test-event', callback5);
    store.addEvent('test-event', callback6);
    store.addEvent('test-event', callback7);
    store.addEvent('test-event', callback8);
    store.addEvent('test-event', callback9);
    store.addEvent('test-event', callback10);
    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);
    expect(callback6).toHaveBeenCalledTimes(1);
    expect(callback7).toHaveBeenCalledTimes(1);
    expect(callback8).toHaveBeenCalledTimes(1);
    expect(callback9).toHaveBeenCalledTimes(1);
    expect(callback10).toHaveBeenCalledTimes(1);

    canRemove = true;

    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(2);
    expect(callback4).toHaveBeenCalledTimes(2);
    expect(callback5).toHaveBeenCalledTimes(2);
    expect(callback6).toHaveBeenCalledTimes(2);
    expect(callback7).toHaveBeenCalledTimes(2);
    expect(callback8).toHaveBeenCalledTimes(2);
    expect(callback9).toHaveBeenCalledTimes(2);
    expect(callback10).toHaveBeenCalledTimes(2);
  });

  test('when an event callback removed middle parts and then itself', () => {
    let canRemove = false;
    const callback1 = jest.fn();
    const callback2 = jest.fn(() => {
      if (canRemove) {
        removeCallback4();
        removeCallback5();
        removeCallback6();
        removeCallback2();
      }
    });
    const callback3 = jest.fn();
    const callback4 = jest.fn();
    const callback5 = jest.fn();
    const callback6 = jest.fn();
    const callback7 = jest.fn();
    const callback8 = jest.fn();
    const callback9 = jest.fn();
    const callback10 = jest.fn();

    store.addEvent('test-event', callback1);
    const removeCallback2 = store.addEvent('test-event', callback2);
    store.addEvent('test-event', callback3);
    const removeCallback4 = store.addEvent('test-event', callback4);
    const removeCallback5 = store.addEvent('test-event', callback5);
    const removeCallback6 = store.addEvent('test-event', callback6);
    store.addEvent('test-event', callback7);
    store.addEvent('test-event', callback8);
    store.addEvent('test-event', callback9);
    store.addEvent('test-event', callback10);
    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);
    expect(callback6).toHaveBeenCalledTimes(1);
    expect(callback7).toHaveBeenCalledTimes(1);
    expect(callback8).toHaveBeenCalledTimes(1);
    expect(callback9).toHaveBeenCalledTimes(1);
    expect(callback10).toHaveBeenCalledTimes(1);

    canRemove = true;

    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(2);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);
    expect(callback6).toHaveBeenCalledTimes(1);
    expect(callback7).toHaveBeenCalledTimes(2);
    expect(callback8).toHaveBeenCalledTimes(2);
    expect(callback9).toHaveBeenCalledTimes(2);
    expect(callback10).toHaveBeenCalledTimes(2);
  });

  test('when an event callback removed 3 on the front and 1 on the back and then itself', () => {
    let canRemove = false;
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();
    const callback4 = jest.fn();
    const callback5 = jest.fn();
    const callback6 = jest.fn();
    const callback7 = jest.fn();
    const callback8 = jest.fn(() => {
      if (canRemove) {
        removeCallback1();
        removeCallback2();
        removeCallback3();
        removeCallback8();
      }
    });
    const callback9 = jest.fn();
    const callback10 = jest.fn();

    const removeCallback1 = store.addEvent('test-event', callback1);
    const removeCallback2 = store.addEvent('test-event', callback2);
    const removeCallback3 = store.addEvent('test-event', callback3);
    store.addEvent('test-event', callback4);
    store.addEvent('test-event', callback5);
    store.addEvent('test-event', callback6);
    store.addEvent('test-event', callback7);
    const removeCallback8 = store.addEvent('test-event', callback8);
    store.addEvent('test-event', callback9);
    store.addEvent('test-event', callback10);
    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);
    expect(callback6).toHaveBeenCalledTimes(1);
    expect(callback7).toHaveBeenCalledTimes(1);
    expect(callback8).toHaveBeenCalledTimes(1);
    expect(callback9).toHaveBeenCalledTimes(1);
    expect(callback10).toHaveBeenCalledTimes(1);

    canRemove = true;

    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(2);
    expect(callback4).toHaveBeenCalledTimes(2);
    expect(callback5).toHaveBeenCalledTimes(2);
    expect(callback6).toHaveBeenCalledTimes(2);
    expect(callback7).toHaveBeenCalledTimes(2);
    expect(callback8).toHaveBeenCalledTimes(2);
    expect(callback9).toHaveBeenCalledTimes(2);
    expect(callback10).toHaveBeenCalledTimes(2);
  });

  test('when an event callback removed itself and then 3 on the front', () => {
    let canRemove = false;
    const callback1 = jest.fn();
    const callback2 = jest.fn(() => {
      if (canRemove) {
        removeCallback2();
        removeCallback4();
        removeCallback5();
        removeCallback6();
      }
    });
    const callback3 = jest.fn();
    const callback4 = jest.fn();
    const callback5 = jest.fn();
    const callback6 = jest.fn();
    const callback7 = jest.fn();
    const callback8 = jest.fn();
    const callback9 = jest.fn();
    const callback10 = jest.fn();

    store.addEvent('test-event', callback1);
    const removeCallback2 = store.addEvent('test-event', callback2);
    store.addEvent('test-event', callback3);
    const removeCallback4 = store.addEvent('test-event', callback4);
    const removeCallback5 = store.addEvent('test-event', callback5);
    const removeCallback6 = store.addEvent('test-event', callback6);
    store.addEvent('test-event', callback7);
    store.addEvent('test-event', callback8);
    store.addEvent('test-event', callback9);
    store.addEvent('test-event', callback10);
    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);
    expect(callback6).toHaveBeenCalledTimes(1);
    expect(callback7).toHaveBeenCalledTimes(1);
    expect(callback8).toHaveBeenCalledTimes(1);
    expect(callback9).toHaveBeenCalledTimes(1);
    expect(callback10).toHaveBeenCalledTimes(1);

    canRemove = true;

    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(2);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);
    expect(callback6).toHaveBeenCalledTimes(1);
    expect(callback7).toHaveBeenCalledTimes(2);
    expect(callback8).toHaveBeenCalledTimes(2);
    expect(callback9).toHaveBeenCalledTimes(2);
    expect(callback10).toHaveBeenCalledTimes(2);
  });

  test('when an event callback removed 1 on the back and 3 on the front and then itself', () => {
    let canRemove = false;
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();
    const callback4 = jest.fn();
    const callback5 = jest.fn();
    const callback6 = jest.fn();
    const callback7 = jest.fn();
    const callback8 = jest.fn(() => {
      if (canRemove) {
        removeCallback8();
        removeCallback1();
        removeCallback2();
        removeCallback3();
      }
    });
    const callback9 = jest.fn();
    const callback10 = jest.fn();

    const removeCallback1 = store.addEvent('test-event', callback1);
    const removeCallback2 = store.addEvent('test-event', callback2);
    const removeCallback3 = store.addEvent('test-event', callback3);
    store.addEvent('test-event', callback4);
    store.addEvent('test-event', callback5);
    store.addEvent('test-event', callback6);
    store.addEvent('test-event', callback7);
    const removeCallback8 = store.addEvent('test-event', callback8);
    store.addEvent('test-event', callback9);
    store.addEvent('test-event', callback10);
    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);
    expect(callback6).toHaveBeenCalledTimes(1);
    expect(callback7).toHaveBeenCalledTimes(1);
    expect(callback8).toHaveBeenCalledTimes(1);
    expect(callback9).toHaveBeenCalledTimes(1);
    expect(callback10).toHaveBeenCalledTimes(1);

    canRemove = true;

    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(2);
    expect(callback4).toHaveBeenCalledTimes(2);
    expect(callback5).toHaveBeenCalledTimes(2);
    expect(callback6).toHaveBeenCalledTimes(2);
    expect(callback7).toHaveBeenCalledTimes(2);
    expect(callback8).toHaveBeenCalledTimes(2);
    expect(callback9).toHaveBeenCalledTimes(2);
    expect(callback10).toHaveBeenCalledTimes(2);
  });

  test('Can remove event listeners using the return callback of addEvent', () => {
    let canRemove = false;

    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();
    const callback5 = jest.fn();
    const callback6 = jest.fn();
    const callback7 = jest.fn();

    const callback4 = jest.fn(() => {
      if (canRemove) {
        removeCallback3();
        removeCallback2();
        removeCallback5();
        removeCallback6();
      }
    });

    store.addEvent('test-event', callback1);
    const removeCallback2 = store.addEvent('test-event', callback2);
    const removeCallback3 = store.addEvent('test-event', callback3);
    store.addEvent('test-event', callback4);
    const removeCallback5 = store.addEvent('test-event', callback5);
    const removeCallback6 = store.addEvent('test-event', callback6);
    store.addEvent('test-event', callback7);

    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);
    expect(callback6).toHaveBeenCalledTimes(1);
    expect(callback7).toHaveBeenCalledTimes(1);

    canRemove = true;

    store.emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(2);
    expect(callback4).toHaveBeenCalledTimes(2);
    expect(callback5).toHaveBeenCalledTimes(1);
    expect(callback6).toHaveBeenCalledTimes(1);
    expect(callback7).toHaveBeenCalledTimes(2);
  });

  test('Can work with plural events', () => {
    const listener1 = jest.fn(() => {
      // empty
    });
    const events = ['event-1', 'event-2', 'event-3'];
    const payload = { value: '1' };
    const removeListener = store.addEvents(events, listener1);

    store.emitEvent('event-1', payload);
    expect(listener1).toHaveBeenCalledWith(
      payload,
      store.store,
      'event-1'
    );
    store.emitEvents(['event-1', 'event-2'], payload);
    expect(listener1).toHaveBeenCalledWith(
      payload,
      store.store,
      'event-1'
    );
    removeListener();
    store.emitEvents(events);
    expect(listener1).toHaveBeenCalledTimes(3);

    const listener2 = jest.fn(() => {
      // empty
    });
    store.addEvents(events, listener2);
    store.emitEvents(events);
    store.removeEvents(events);
    store.emitEvents(events);
    expect(listener2).toHaveBeenCalledTimes(3);
  });

  test('Does not suffer the -1 +1 problem', () => {
    /**
     * -1 +1 problem happens when an event listener
     * removed itself and then a new one was added
     * but the emit cycle pointer is on -1, the next
     * pointer will be 0 so the newly added event will be called
     * when it shouldn't
     */

    let removeListener1 = null;

    const listener1 = jest.fn(() => {
      removeListener1();
      store.addEvent('my-event', listener1);
    });

    removeListener1 = store.addEvent('my-event', listener1);
    store.emitEvent('my-event');
    expect(listener1).toHaveBeenCalledTimes(1);
  });

  test('Does not suffer the -1 +1 problem when addEvent was called first', () => {
    /**
     * -1 +1 problem happens when an event listener
     * removed itself and then a new one was added
     * but the emit cycle pointer is on -1, the next
     * pointer will be 0 so the newly added event will be called
     * when it shouldn't
     */

    let removeListener1 = null;

    const listener1 = jest.fn(() => {
      store.addEvent('my-event', listener1);
      removeListener1();
    });

    removeListener1 = store.addEvent('my-event', listener1);
    store.emitEvent('my-event');
    expect(listener1).toHaveBeenCalledTimes(1);
  });

  test('Does not suffer the -1 +1 problem on addEvents', () => {
    /**
     * -1 +1 problem happens when an event listener
     * removed itself and then a new one was added
     * but the emit cycle pointer is on -1, the next
     * pointer will be 0 so the newly added event will be called
     * when it shouldn't
     */

    let removeListener1 = null;

    const listener1 = jest.fn(() => {
      removeListener1();
      store.addEvents(
        ['my-event', 'my-event2', 'my-event3'],
        listener1
      );
    });

    removeListener1 = store.addEvents(
      ['my-event', 'my-event2', 'my-event3'],
      listener1
    );

    store.emitEvent('my-event');
    expect(listener1).toHaveBeenCalledTimes(1);
  });

  test('Does not suffer the -1 +1 problem when addEvents was called first', () => {
    /**
     * -1 +1 problem happens when an event listener
     * removed itself and then a new one was added
     * but the emit cycle pointer is on -1, the next
     * pointer will be 0 so the newly added event will be called
     * when it shouldn't
     */

    let removeListener1 = null;

    const listener1 = jest.fn(() => {
      store.addEvents(
        ['my-event', 'my-event2', 'my-event3'],
        listener1
      );
      removeListener1();
    });

    removeListener1 = store.addEvents(
      ['my-event', 'my-event2', 'my-event3'],
      listener1
    );

    store.emitEvent('my-event');
    expect(listener1).toHaveBeenCalledTimes(1);
  });

  test('When an event listener was removed in front during emitEventCycle', () => {
    let removeListener2 = null;

    const listener1 = jest.fn(() => {
      removeListener2();
      store.addEvent('test-1', listener2);
    });

    const listener2 = jest.fn(() => {
      // empty
    });

    store.addEvent('test-1', listener1);
    removeListener2 = store.addEvent('test-1', listener2);
    store.emitEvent('test-1');

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(0);
  });
});

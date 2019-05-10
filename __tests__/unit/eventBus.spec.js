/** @format */

import { addEvent, emitEvent, removeEvent } from '../../src';

describe('eventBus', () => {
  test('can add, emit, and remove events', () => {
    expect(emitEvent('test-event')).toEqual(-1);

    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();
    const payload = {
      test1: 'value',
      test2: 'value'
    };

    addEvent('test-event', callback1);
    addEvent('test-event', callback2);
    addEvent('test-event', callback3);
    emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);

    emitEvent('test-event', payload);

    expect(callback1).toHaveBeenCalledWith(payload);
    expect(callback2).toHaveBeenCalledWith(payload);
    expect(callback3).toHaveBeenCalledWith(payload);

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(2);

    removeEvent('test-event');

    expect(emitEvent('test-event')).toEqual(-1);
    expect(removeEvent('test-event')).toEqual(-1);
  });

  test('can remove event callbacks', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();

    addEvent('test-event', callback1);
    addEvent('test-event', callback2);
    const removeCallback3 = addEvent('test-event', callback3);
    emitEvent('test-event');
    removeCallback3();
    emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(1);
  });

  test('can remove callback twice and returns -1', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    addEvent('test-event', callback1);
    const listener1 = addEvent('test-event', callback2);

    expect(listener1()).not.toEqual(-1);

    expect(listener1()).toEqual(-1);
  });

  test('calls only listeners for that event', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();

    addEvent('test-event', callback1);
    addEvent('test-event', callback2);
    addEvent('another-event', callback3);
    emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(0);

    emitEvent('another-event');

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

    addEvent('test-event', callback1);
    addEvent('test-event', callback2);
    addEvent('test-event', callback3);
    const removeCallback4 = addEvent('test-event', callback4);
    addEvent('test-event', callback5);
    emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);

    canRemove = true;

    emitEvent('test-event');

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

    const removeCallback1 = addEvent('test-event', callback1);
    addEvent('test-event', callback2);
    addEvent('test-event', callback3);
    addEvent('test-event', callback4);
    addEvent('test-event', callback5);
    emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);

    canRemove = true;

    emitEvent('test-event');

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

    addEvent('test-event', callback1);
    addEvent('test-event', callback2);
    addEvent('test-event', callback3);
    const removeCallback4 = addEvent('test-event', callback4);
    addEvent('test-event', callback5);
    emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);

    canRemove = true;

    emitEvent('test-event');

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

    addEvent('test-event', callback1);
    const removeCallback2 = addEvent('test-event', callback2);
    addEvent('test-event', callback3);
    const removeCallback4 = addEvent('test-event', callback4);
    addEvent('test-event', callback5);
    emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);

    canRemove = true;

    emitEvent('test-event');

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

    const removeCallback1 = addEvent('test-event', callback1);
    addEvent('test-event', callback2);
    addEvent('test-event', callback3);
    const removeCallback4 = addEvent('test-event', callback4);
    addEvent('test-event', callback5);
    emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);

    canRemove = true;

    emitEvent('test-event');

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

    const removeCallback1 = addEvent('test-event', callback1);
    addEvent('test-event', callback2);
    addEvent('test-event', callback3);
    const removeCallback4 = addEvent('test-event', callback4);
    addEvent('test-event', callback5);
    emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);

    canRemove = true;

    emitEvent('test-event');

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

    const removeCallback1 = addEvent('test-event', callback1);
    addEvent('test-event', callback2);
    addEvent('test-event', callback3);
    const removeCallback4 = addEvent('test-event', callback4);
    addEvent('test-event', callback5);
    emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);

    canRemove = true;

    emitEvent('test-event');

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

    addEvent('test-event', callback1);
    addEvent('test-event', callback2);
    addEvent('test-event', callback3);
    const removeCallback4 = addEvent('test-event', callback4);
    const removeCallback5 = addEvent('test-event', callback5);
    const removeCallback6 = addEvent('test-event', callback6);
    addEvent('test-event', callback7);
    addEvent('test-event', callback8);
    addEvent('test-event', callback9);
    addEvent('test-event', callback10);
    emitEvent('test-event');

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

    emitEvent('test-event');

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

    const removeCallback1 = addEvent('test-event', callback1);
    const removeCallback2 = addEvent('test-event', callback2);
    const removeCallback3 = addEvent('test-event', callback3);
    addEvent('test-event', callback4);
    addEvent('test-event', callback5);
    addEvent('test-event', callback6);
    addEvent('test-event', callback7);
    addEvent('test-event', callback8);
    addEvent('test-event', callback9);
    addEvent('test-event', callback10);
    emitEvent('test-event');

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

    emitEvent('test-event');

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

  test('when an event callback removed 3 on the front and then itself', () => {
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

    addEvent('test-event', callback1);
    const removeCallback2 = addEvent('test-event', callback2);
    addEvent('test-event', callback3);
    const removeCallback4 = addEvent('test-event', callback4);
    const removeCallback5 = addEvent('test-event', callback5);
    const removeCallback6 = addEvent('test-event', callback6);
    addEvent('test-event', callback7);
    addEvent('test-event', callback8);
    addEvent('test-event', callback9);
    addEvent('test-event', callback10);
    emitEvent('test-event');

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

    emitEvent('test-event');

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

  test('when an event callback removed 3 on the back and then itself', () => {
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

    const removeCallback1 = addEvent('test-event', callback1);
    const removeCallback2 = addEvent('test-event', callback2);
    const removeCallback3 = addEvent('test-event', callback3);
    addEvent('test-event', callback4);
    addEvent('test-event', callback5);
    addEvent('test-event', callback6);
    addEvent('test-event', callback7);
    const removeCallback8 = addEvent('test-event', callback8);
    addEvent('test-event', callback9);
    addEvent('test-event', callback10);
    emitEvent('test-event');

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

    emitEvent('test-event');

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

    addEvent('test-event', callback1);
    const removeCallback2 = addEvent('test-event', callback2);
    addEvent('test-event', callback3);
    const removeCallback4 = addEvent('test-event', callback4);
    const removeCallback5 = addEvent('test-event', callback5);
    const removeCallback6 = addEvent('test-event', callback6);
    addEvent('test-event', callback7);
    addEvent('test-event', callback8);
    addEvent('test-event', callback9);
    addEvent('test-event', callback10);
    emitEvent('test-event');

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

    emitEvent('test-event');

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

  test('when an event callback removed 3 on the back and then itself', () => {
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

    const removeCallback1 = addEvent('test-event', callback1);
    const removeCallback2 = addEvent('test-event', callback2);
    const removeCallback3 = addEvent('test-event', callback3);
    addEvent('test-event', callback4);
    addEvent('test-event', callback5);
    addEvent('test-event', callback6);
    addEvent('test-event', callback7);
    const removeCallback8 = addEvent('test-event', callback8);
    addEvent('test-event', callback9);
    addEvent('test-event', callback10);
    emitEvent('test-event');

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

    emitEvent('test-event');

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

    addEvent('test-event', callback1);
    const removeCallback2 = addEvent('test-event', callback2);
    const removeCallback3 = addEvent('test-event', callback3);
    addEvent('test-event', callback4);
    const removeCallback5 = addEvent('test-event', callback5);
    const removeCallback6 = addEvent('test-event', callback6);
    addEvent('test-event', callback7);

    emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    expect(callback4).toHaveBeenCalledTimes(1);
    expect(callback5).toHaveBeenCalledTimes(1);
    expect(callback6).toHaveBeenCalledTimes(1);
    expect(callback7).toHaveBeenCalledTimes(1);

    canRemove = true;

    emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(2);
    expect(callback4).toHaveBeenCalledTimes(2);
    expect(callback5).toHaveBeenCalledTimes(1);
    expect(callback6).toHaveBeenCalledTimes(1);
    expect(callback7).toHaveBeenCalledTimes(2);
  });
});

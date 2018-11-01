/** @format */

import { addEvent, emitEvent } from '../../lib';

describe('eventBus', () => {
  test('can add and emit event', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const payload = {
      test1: 'value',
      test2: 'value'
    };

    addEvent('test-event', callback1);
    addEvent('test-event', callback2);
    emitEvent('test-event');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);

    emitEvent('test-event', payload);

    expect(callback1).toHaveBeenCalledWith(payload);
    expect(callback2).toHaveBeenCalledWith(payload);

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);

    emitEvent('does-not-exists');

    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
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

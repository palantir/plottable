/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as Utils from "../utils";

export class Dispatcher {
  /**
   * Subclasses set these in constructor. Then, these get attached to the event
   * target in _connect
   *
   * eventname is a DOM event name like "mouseup", "touchstart", etc. The
   * callback is simply registered to the event callback with bubbling.
   */
  protected _eventToProcessingFunction: { [eventName: string]: (e: Event) => any; } = {};

  /**
   * All listeners are registered to this `EventTarget` and events are then
   * dispatched to callbacks from `_eventNameToCallbackSet` manually.
   *
   * Subclasses set their own event target instead of `document`.
   */
  protected _eventTarget: EventTarget = document;

  private _eventNameToCallbackSet: { [eventName: string]: Utils.CallbackSet<Function>; } = {};
  private _connected = false;

  private _hasNoCallbacks() {
    const eventNames = Object.keys(this._eventNameToCallbackSet);
    for (let i = 0; i < eventNames.length; i++) { // for-loop so return can break out
      if (this._eventNameToCallbackSet[eventNames[i]].size !== 0) {
        return false;
      }
    }
    return true;
  }

  private _connect() {
    if (this._connected) {
      return;
    }
    Object.keys(this._eventToProcessingFunction).forEach((event: string) => {
      const processingFunction = this._eventToProcessingFunction[event];
      // Add `{ passive: false }` option because Chrome 73 broke this.
      const options = event === "wheel" ?  { passive: false } : undefined;
      this._eventTarget.addEventListener(event, processingFunction, options);
    });
    this._connected = true;
  }

  private _disconnect() {
    if (this._connected && this._hasNoCallbacks()) {
      Object.keys(this._eventToProcessingFunction).forEach((event: string) => {
        const processingFunction = this._eventToProcessingFunction[event];
        this._eventTarget.removeEventListener(event, processingFunction);
      });
      this._connected = false;
    }
  }

  protected _addCallbackForEvent(eventName: string, callback: Function) {
    if (this._eventNameToCallbackSet[eventName] == null) {
      this._eventNameToCallbackSet[eventName] = new Utils.CallbackSet<Function>();
    }
    this._eventNameToCallbackSet[eventName].add(callback);
    this._connect();
  }

  protected _removeCallbackForEvent(eventName: string, callback: Function) {
    if (this._eventNameToCallbackSet[eventName] != null) {
      this._eventNameToCallbackSet[eventName].delete(callback);
    }
    this._disconnect();
  }

  protected _callCallbacksForEvent(eventName: string, ...args: any[]) {
    const callbackSet = this._eventNameToCallbackSet[eventName];
    if (callbackSet != null) {
      callbackSet.callCallbacks.apply(callbackSet, args);
    }
  }
}

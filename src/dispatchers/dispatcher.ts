/*
Copyright 2014-present Palantir Technologies
Licensed under MIT (https://github.com/palantir/plottable/blob/master/LICENSE)
*/

import * as Utils from "../utils";

export class Dispatcher {
  protected _eventToProcessingFunction: { [eventName: string]: (e: Event) => any; } = {};
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
      document.addEventListener(event, processingFunction);
    });
    this._connected = true;
  }

  private _disconnect() {
    if (this._connected && this._hasNoCallbacks()) {
      Object.keys(this._eventToProcessingFunction).forEach((event: string) => {
        const processingFunction = this._eventToProcessingFunction[event];
        document.removeEventListener(event, processingFunction);
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

///<reference path="../reference.ts" />

module Plottable {
  export class Dispatcher extends Core.PlottableObject {
    protected _event2Callback: { [eventName: string]: (e: Event) => any; } = {};
    protected _callbackSets: Utils.CallbackSet<Function>[] = [];
    private _connected = false;

    private _hasNoListeners() {
      return this._callbackSets.every((cbs) => cbs.values().length === 0);
    }

    private _connect() {
      if (this._connected) {
        return;
      }
      Object.keys(this._event2Callback).forEach((event: string) => {
        var callback = this._event2Callback[event];
        document.addEventListener(event, callback);
      });
      this._connected = true;
    }

    private _disconnect() {
      if (this._connected && this._hasNoListeners()) {
        Object.keys(this._event2Callback).forEach((event: string) => {
          var callback = this._event2Callback[event];
          document.removeEventListener(event, callback);
        });
        this._connected = false;
      }
    }

    protected _setCallback(callbackSet: Utils.CallbackSet<Function>, callback: Function) {
      if (typeof callback !== "function") {
        console.error("the callback is not a function")
      }

      if (callback === null) { // remove listener if callback is null
        console.error("THIS SHOULD NOT HAPPEN");
        callbackSet.remove(callback);
        this._disconnect();
      } else {
        this._connect();
        callbackSet.add(callback);
      }
    }

    protected _unsetCallback(callbackSet: Utils.CallbackSet<Function>, callback: Function) {
      callbackSet.remove(callback);
      this._disconnect();
    }
  }
}

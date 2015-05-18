///<reference path="../reference.ts" />

module Plottable {
  export class Dispatcher {
    protected _event2Callback: { [eventName: string]: (e: Event) => any; } = {};
    protected _callbacks: Utils.CallbackSet<Function>[] = [];
    private _connected = false;

    private _hasNoListeners() {
      return this._callbacks.every((cbs) => cbs.values().length === 0);
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

    protected setCallback(callbackSet: Utils.CallbackSet<Function>, callback: Function) {
      this._connect();
      callbackSet.add(callback);
    }

    protected unsetCallback(callbackSet: Utils.CallbackSet<Function>, callback: Function) {
      callbackSet.delete(callback);
      this._disconnect();
    }
  }
}

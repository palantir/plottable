///<reference path="../reference.ts" />

module Plottable {
  export class Dispatcher extends Core.PlottableObject {
    protected _event2Callback: { [eventName: string]: (e: Event) => any; } = {};
    protected _broadcasters: Core.Broadcaster<Dispatcher>[] = [];
    protected _callbackSets: Utils.CallbackSet<Function>[] = [];
    private _connected = false;

    private _hasNoListeners() {
      // return this._broadcasters.every((b) => b.getListenerKeys().length === 0);
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

    /**
     * Creates a wrapped version of the callback that can be registered to a Broadcaster
     */
    protected _getWrappedCallback(callback: Function): Core.BroadcasterCallback<Dispatcher> {
      return () => callback();
    }

    protected _setCallback(callbackSet: Utils.CallbackSet<Function>, key: any, callback: Function) {
      if (callback === null) { // remove listener if callback is null
        // broadcaster.deregisterListener(key);
        callbackSet.remove(callback);
        this._disconnect();
      } else {
        this._connect();
        callbackSet.add(callback);
        // broadcaster.registerListener(key, this._getWrappedCallback(callback));
      }
    }

    protected _unsetCallback(callbackSet: Utils.CallbackSet<Function>, key: any, callback: Function) {
      callbackSet.remove(callback);
      this._disconnect();
    }

  }
}

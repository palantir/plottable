///<reference path="../reference.ts" />

module Plottable {
export module Dispatchers {
  export class AbstractDispatcher extends Core.PlottableObject {
    protected _event2Callback: { [eventName: string]: (e: Event) => any; } = {};
    protected _broadcasters: Core.Broadcaster<AbstractDispatcher>[] = [];
    private _connected = false;

    private _hasNoListeners() {
      return this._broadcasters.every((b) => b.getListenerKeys().length === 0);
    }

    private _connect() {
      if (!this._connected) {
        Object.keys(this._event2Callback).forEach((event: string) => {
          var callback = this._event2Callback[event];
          document.addEventListener(event, callback);
        });
        this._connected = true;
      }
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
    protected _getWrappedCallback(callback: Function): Core.BroadcasterCallback<AbstractDispatcher> {
      return () => callback();
    }

    protected _setCallback(b: Core.Broadcaster<AbstractDispatcher>, key: any, callback: Function) {
      if (callback === null) { // remove listener if callback is null
        b.deregisterListener(key);
        this._disconnect();
      } else {
        this._connect();
        b.registerListener(key, this._getWrappedCallback(callback));
      }
    }
  }
}
}

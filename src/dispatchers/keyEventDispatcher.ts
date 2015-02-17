///<reference path="../reference.ts" />

module Plottable {
export module Dispatcher {
  export class KeyEvent {
    private static _DISPATCHER_KEY = "__Plottable_Dispatcher_Key";
    private _connected = false;
    private _keydownBroadcaster: Core.Broadcaster<Dispatcher.KeyEvent>;
    // private _keyupBroadcaster: Core.Broadcaster<Dispatcher.KeyEvent>;
    private _processDownCallback = (e: KeyboardEvent) => this._processKeydown(e);

    public static getDispatcher(): Dispatcher.KeyEvent {
      var dispatcher: KeyEvent = (<any> document)[KeyEvent._DISPATCHER_KEY];
      if (dispatcher == null) {
        dispatcher = new KeyEvent();
        (<any> document)[KeyEvent._DISPATCHER_KEY] = dispatcher;
      }
      return dispatcher;
    }

    constructor() {
      this._keydownBroadcaster = new Core.Broadcaster(this);
    }

    private _connect() {
      if (!this._connected) {
        document.addEventListener("keydown", this._processDownCallback);
        this._connected = true;
      }
    }

    private _disconnect() {
      if (this._connected &&
          this._keydownBroadcaster.getListenerKeys().length === 0) {
        document.removeEventListener("keydown", this._processDownCallback);
        this._connected = false;
      }
    }

    /**
     * Registers a callback to be called whenever a key is pressed,
     * or removes the callback if `null` is passed as the callback.
     *
     * @param {any} key The registration key associated with the callback.
     *                  Registration key uniqueness is determined by deep equality.
     * @param {(e: KeyboardEvent) => any} callback A callback that takes the
     *                                             keydown KeyboardEvent.
     * @return {Dispatcher.KeyEvent} The calling Dispatcher.KeyEvent.
     */
    public onKeydown(key: any, callback: (e: KeyboardEvent) => any): KeyEvent {
      if (callback === null) { // remove listener if callback is null
        this._keydownBroadcaster.deregisterListener(key);
        this._disconnect();
      } else {
        this._connect();
        this._keydownBroadcaster.registerListener(key,
          (d: Dispatcher.KeyEvent, e: KeyboardEvent) => callback(e));
      }
      return this;
    }

    private _processKeydown(e: KeyboardEvent) {
      this._keydownBroadcaster.broadcast(e);
    }
  }
}
}

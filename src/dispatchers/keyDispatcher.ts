///<reference path="../reference.ts" />

module Plottable {
export module Dispatcher {
  export type KeyCallback = (keyCode: number) => any;

  export class Key {
    private static _DISPATCHER_KEY = "__Plottable_Dispatcher_Key";
    private _connected = false;
    private _keydownBroadcaster: Core.Broadcaster<Dispatcher.Key>;
    private _downCallback = (e: KeyboardEvent) => this._processKeydown(e);

    /**
     * Get a Dispatcher.Key. If one already exists it will be returned;
     * otherwise, a new one will be created.
     *
     * @return {Dispatcher.Key} A Dispatcher.Key
     */
    public static getDispatcher(): Dispatcher.Key {
      var dispatcher: Key = (<any> document)[Key._DISPATCHER_KEY];
      if (dispatcher == null) {
        dispatcher = new Key();
        (<any> document)[Key._DISPATCHER_KEY] = dispatcher;
      }
      return dispatcher;
    }

    /**
     * Creates a Dispatcher.Key.
     * This constructor not be invoked directly under most circumstances.
     *
     * @param {SVGElement} svg The root <svg> element to attach to.
     */
    constructor() {
      this._keydownBroadcaster = new Core.Broadcaster(this);
    }

    private _connect() {
      if (!this._connected) {
        document.addEventListener("keydown", this._downCallback);
        this._connected = true;
      }
    }

    private _disconnect() {
      if (this._connected &&
          this._keydownBroadcaster.getListenerKeys().length === 0) {
        document.removeEventListener("keydown", this._downCallback);
        this._connected = false;
      }
    }

    /**
     * Registers a callback to be called whenever a key is pressed,
     * or removes the callback if `null` is passed as the callback.
     *
     * @param {any} key The registration key associated with the callback.
     *                  Registration key uniqueness is determined by deep equality.
     * @param {KeyCallback} callback
     * @return {Dispatcher.Key} The calling Dispatcher.Key.
     */
    public onKeydown(key: any, callback: KeyCallback): Key {
      if (callback === null) { // remove listener if callback is null
        this._keydownBroadcaster.deregisterListener(key);
        this._disconnect();
      } else {
        this._connect();
        this._keydownBroadcaster.registerListener(key,
          (d: Dispatcher.Key, e: KeyboardEvent) => callback(e.keyCode));
      }
      return this;
    }

    private _processKeydown(e: KeyboardEvent) {
      this._keydownBroadcaster.broadcast(e);
    }
  }
}
}

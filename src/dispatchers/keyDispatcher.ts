///<reference path="../reference.ts" />

module Plottable {
export module Dispatchers {
  export type KeyCallback = (keyCode: number, e: KeyboardEvent) => any;

  export class Key extends Dispatcher {
    private static _DISPATCHER_KEY = "__Plottable_Dispatcher_Key";
    private _keydownBroadcaster: Core.Broadcaster<Dispatchers.Key>;

    private _keydownCallbackSet: Utils.CallbackSet<Function>;

    /**
     * Get a Dispatcher.Key. If one already exists it will be returned;
     * otherwise, a new one will be created.
     *
     * @return {Dispatcher.Key} A Dispatcher.Key
     */
    public static getDispatcher(): Dispatchers.Key {
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
      super();

      this._keydownBroadcaster = new Core.Broadcaster(this);
      this._keydownCallbackSet = new Utils.CallbackSet();

      this._event2Callback["keydown"] = (e: KeyboardEvent) => this._processKeydown(e);
      this._broadcasters = [this._keydownBroadcaster];
    }

    protected _getWrappedCallback(callback: Function): Core.BroadcasterCallback<Dispatchers.Key> {
      return (d: Dispatchers.Key, e: KeyboardEvent) => callback(e.keyCode, e);
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
    public onKeyDown(key: any, callback: KeyCallback): Key {
      this._setCallback(this._keydownBroadcaster, key, callback);
      this._keydownCallbackSet.add(this._getWrappedCallback(callback));
      return this;
    }

    private _processKeydown(e: KeyboardEvent) {
      this._keydownCallbackSet.callCallbacks(this, e);
      // this._keydownBroadcaster.broadcast(e);
    }
  }
}
}

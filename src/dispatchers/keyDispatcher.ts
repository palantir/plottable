///<reference path="../reference.ts" />

module Plottable {
export module Dispatchers {
  export type KeyCallback = (keyCode: number, e: KeyboardEvent) => any;

  export class Key extends Dispatcher {
    private static _DISPATCHER_KEY = "__Plottable_Dispatcher_Key";
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

      this._event2Callback["keydown"] = (e: KeyboardEvent) => this._processKeydown(e);

      this._keydownCallbackSet = new Utils.CallbackSet();
      this._callbackSets = [this._keydownCallbackSet];
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
    public onKeyDown(callback: KeyCallback): Key {
      this._setCallback(this._keydownCallbackSet, callback);
      return this;
    }

    public offKeyDown(callback: KeyCallback): Key {
      this._unsetCallback(this._keydownCallbackSet, callback);
      return this;
    }

    private _processKeydown(e: KeyboardEvent) {
      this._keydownCallbackSet.callCallbacks(e.keyCode, e);
    }
  }
}
}

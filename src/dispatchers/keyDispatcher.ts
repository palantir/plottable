///<reference path="../reference.ts" />

module Plottable {
export module Dispatchers {
  export type KeyCallback = (keyCode: number, event: KeyboardEvent) => any;

  export class Key extends Dispatcher {
    private static _DISPATCHER_KEY = "__Plottable_Dispatcher_Key";
    private _keydownCallbacks: Utils.CallbackSet<KeyCallback>;

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

      this._keydownCallbacks = new Utils.CallbackSet<KeyCallback>();
      this._callbacks = [this._keydownCallbacks];
    }

    /**
     * Registers a callback to be called whenever a key is pressed.
     *
     * @param {KeyCallback} callback
     * @return {Dispatcher.Key} The calling Dispatcher.Key.
     */
    public onKeyDown(callback: KeyCallback): Key {
      this.setCallback(this._keydownCallbacks, callback);
      return this;
    }

    /**
     * Removes the callback to be called whenever a key is pressed.
     *
     * @param {KeyCallback} callback
     * @return {Dispatcher.Key} The calling Dispatcher.Key.
     */
    public offKeyDown(callback: KeyCallback): Key {
      this.unsetCallback(this._keydownCallbacks, callback);
      return this;
    }

    private _processKeydown(event: KeyboardEvent) {
      this._keydownCallbacks.callCallbacks(event.keyCode, event);
    }
  }
}
}

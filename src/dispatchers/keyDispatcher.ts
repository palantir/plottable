///<reference path="../reference.ts" />

module Plottable {
export module Dispatcher {
  export type KeyCallback = (keyCode: number, e: KeyboardEvent) => any;

  export class Key extends AbstractDispatcher {
    private static _DISPATCHER_KEY = "__Plottable_Dispatcher_Key";
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
      super();

      this._event2Callback["keydown"] = this._downCallback;

      this._keydownBroadcaster = new Core.Broadcaster(this);
      this._broadcasters = [this._keydownBroadcaster];
    }

    protected _getWrappedCallback(callback: Function): Core.BroadcasterCallback<Dispatcher.Key> {
      return (d: Dispatcher.Key, e: KeyboardEvent) => callback(e.keyCode, e);
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
      return this;
    }

    private _processKeydown(e: KeyboardEvent) {
      this._keydownBroadcaster.broadcast(e);
    }
  }
}
}

///<reference path="../reference.ts" />

module Plottable {
export module Core {

  /**
   * A callback for a Broadcaster. The callback will be called with the Broadcaster's
   * "listenable" as the first argument, with subsequent optional arguments depending
   * on the listenable.
   */
  // HACKHACK: An interface because the "type" keyword doesn't work with generics.
  export interface BroadcasterCallback<L> {
    (listenable: L, ...args: any[]): any;
  }

  /**
   * The Broadcaster holds a reference to a "listenable" object.
   * Third parties can register and deregister listeners from the Broadcaster.
   * When the broadcaster.broadcast() method is called, all registered callbacks
   * are called with the Broadcaster's "listenable", along with optional
   * arguments passed to the `broadcast` method.
   *
   * The listeners are called synchronously.
   */
  export class Broadcaster<L> extends Core.PlottableObject {
    private _key2callback = new Utils.Map();
    private _listenable: L;

    /**
     * Constructs a broadcaster, taking a "listenable" object to broadcast about.
     *
     * @constructor
     * @param {L} listenable The listenable object to broadcast.
     */
    constructor(listenable: L) {
      super();
      this._listenable = listenable;
    }

    /**
     * Registers a callback to be called when the broadcast method is called. Also takes a key which
     * is used to support deregistering the same callback later, by passing in the same key.
     * If there is already a callback associated with that key, then the callback will be replaced.
     * The callback will be passed the Broadcaster's "listenable" as the `this` context.
     *
     * @param key The key associated with the callback. Key uniqueness is determined by deep equality.
     * @param {BroadcasterCallback<L>} callback A callback to be called.
     * @returns {Broadcaster} The calling Broadcaster
     */
    public registerListener(key: any, callback: BroadcasterCallback<L>) {
      this._key2callback.set(key, callback);
      return this;
    }

    /**
     * Call all listening callbacks, optionally with arguments passed through.
     *
     * @param ...args A variable number of optional arguments
     * @returns {Broadcaster} The calling Broadcaster
     */
    public broadcast(...args: any[]) {
      args.unshift(this._listenable);
      this._key2callback.values().forEach((callback) => {
        callback.apply(this._listenable, args);
      });
      return this;
    }

    /**
     * Deregisters the callback associated with a key.
     *
     * @param key The key to deregister.
     * @returns {Broadcaster} The calling Broadcaster
     */
    public deregisterListener(key: any) {
      this._key2callback.delete(key);
      return this;
    }

    /**
     * Gets the keys for all listeners attached to the Broadcaster.
     *
     * @returns {any[]} An array of the keys.
     */
    public getListenerKeys() {
      return this._key2callback.keys();
    }

    /**
     * Deregisters all listeners and callbacks associated with the Broadcaster.
     *
     * @returns {Broadcaster} The calling Broadcaster
     */
    public deregisterAllListeners() {
      this._key2callback = new Utils.Map();
    }
  }
}
}

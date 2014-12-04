///<reference path="../reference.ts" />

module Plottable {
export module Core {
  /**
   * This interface represents anything in Plottable which can have a listener attached.
   * Listeners attach by referencing the Listenable's broadcaster, and calling registerListener
   * on it.
   *
   * e.g.:
   * listenable: Plottable.Listenable;
   * listenable.broadcaster.registerListener(callbackToCallOnBroadcast)
   */
  export interface Listenable {
    broadcaster: Broadcaster;
  }

  /**
   * This interface represents the callback that should be passed to the Broadcaster on a Listenable.
   *
   * The callback will be called with the attached Listenable as the first object, and optional arguments
   * as the subsequent arguments.
   *
   * The Listenable is passed as the first argument so that it is easy for the callback to reference the
   * current state of the Listenable in the resolution logic.
   */
  export interface BroadcasterCallback {
    (listenable: Listenable, ...args: any[]): any;
  }


  /**
   * The Broadcaster class is owned by an Listenable. Third parties can register and deregister listeners
   * from the broadcaster. When the broadcaster.broadcast method is activated, all registered callbacks are
   * called. The registered callbacks are called with the registered Listenable that the broadcaster is attached
   * to, along with optional arguments passed to the `broadcast` method.
   *
   * The listeners are called synchronously.
   */
  export class Broadcaster extends Core.PlottableObject {
    private _key2callback = new _Util.StrictEqualityAssociativeArray();
    public listenable: Listenable;

    /**
     * Constructs a broadcaster, taking the Listenable that the broadcaster will be attached to.
     *
     * @constructor
     * @param {Listenable} listenable The Listenable-object that this broadcaster is attached to.
     */
    constructor(listenable: Listenable) {
      super();
      this.listenable = listenable;
    }

    /**
     * Registers a callback to be called when the broadcast method is called. Also takes a key which
     * is used to support deregistering the same callback later, by passing in the same key.
     * If there is already a callback associated with that key, then the callback will be replaced.
     *
     * @param key The key associated with the callback. Key uniqueness is determined by deep equality.
     * @param {BroadcasterCallback} callback A callback to be called when the Scale's domain changes.
     * @returns {Broadcaster} this object
     */
    public registerListener(key: any, callback: BroadcasterCallback) {
      this._key2callback.set(key, callback);
      return this;
    }

    /**
     * Call all listening callbacks, optionally with arguments passed through.
     *
     * @param ...args A variable number of optional arguments
     * @returns {Broadcaster} this object
     */
    public broadcast(...args: any[]) {
      this._key2callback.values().forEach((callback) => callback(this.listenable, args));
      return this;
    }

    /**
     * Deregisters the callback associated with a key.
     *
     * @param key The key to deregister.
     * @returns {Broadcaster} this object
     */
    public deregisterListener(key: any) {
      this._key2callback.delete(key);
      return this;
    }

    /**
     * Deregisters all listeners and callbacks associated with the broadcaster.
     *
     * @returns {Broadcaster} this object
     */
    public deregisterAllListeners() {
      this._key2callback = new _Util.StrictEqualityAssociativeArray();
    }
  }
}
}

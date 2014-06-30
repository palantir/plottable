///<reference path="../reference.ts" />

module Plottable {
export module Core {
  export interface IListenable {
    broadcaster: Broadcaster;
  }

  export interface IBroadcasterCallback {
    (listenable: IListenable, ...args: any[]): any;
  }


  export class Broadcaster extends Abstract.PlottableObject {
    private listener2Callback = new Util.StrictEqualityAssociativeArray();
    public listenable: IListenable;

    constructor(listenable: IListenable) {
      super();
      this.listenable = listenable;
    }

    /**
     * Registers a callback to be called when the broadcast method is called. Also takes a listener which
     * is used to support deregistering the same callback later, by passing in the same listener.
     * If there is already a callback associated with that listener, then the callback will be replaced.
     *
     * This should NOT be called directly by a Component; registerToBroadcaster should be used instead.
     *
     * @param listener The listener associated with the callback.
     * @param {IBroadcasterCallback} callback A callback to be called when the Scale's domain changes.
     * @returns {Broadcaster} this object
     */
    public registerListener(listener: any, callback: IBroadcasterCallback) {
      this.listener2Callback.set(listener, callback);
      return this;
    }

    /**
     * Call all listening callbacks, optionally with arguments passed through.
     *
     * @param ...args A variable number of optional arguments
     * @returns {Broadcaster} this object
     */
    public broadcast(...args: any[]) {
      this.listener2Callback.values().forEach((callback) => callback(this.listenable, args));
      return this;
    }

    /**
     * Deregisters the callback associated with a listener.
     *
     * @param listener The listener to deregister.
     * @returns {Broadcaster} this object
     */
    public deregisterListener(listener: any) {
      this.listener2Callback.delete(listener);
      return this;
    }

    /**
     * Deregisters all listeners and callbacks associated with the broadcaster.
     *
     * @returns {Broadcaster} this object
     */
    public deregisterAllListeners() {
      this.listener2Callback = new Util.StrictEqualityAssociativeArray();
    }
  }
}
}

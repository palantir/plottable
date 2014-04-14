///<reference path="reference.ts" />

module Plottable {
  interface IListenerCallbackPair {
    l: any;
    c: IBroadcasterCallback;
  }
  export class Broadcaster {
    private listenerCallbacks: IListenerCallbackPair[] = [];

    /**
     * Registers a callback to be called when the broadcast method is called. Also takes a listener which
     * is used to support deregistering the same callback later, by passing in the same listener.
     * If there is already a callback associated with that listener, then the callback will be replaced.
     *
     * @param listener The listener associated with the callback.
     * @param {IBroadcasterCallback} callback A callback to be called when the Scale's domain changes.
     * @returns {Broadcaster} this object
     */
    public registerListener(listener: any, callback: IBroadcasterCallback) {
      for (var i=0; i < this.listenerCallbacks.length; i++) {
        if (this.listenerCallbacks[i].l === listener) {
          this.listenerCallbacks[i].c = callback;
          return this;
        }
      }
      this.listenerCallbacks.push({l: listener, c: callback});
      return this;
    }

    /**
     * Call all listening callbacks, optionally with arguments passed through.
     *
     * @param ...args A variable number of optional arguments
     * @returns {Broadcaster} this object
     */
    public _broadcast(...args: any[]) {
      this.listenerCallbacks.forEach((lc) => lc.c(this, args));
      return this;
    }

    /**
     * Registers deregister the callback associated with a listener.
     *
     * @param listener The listener to deregister.
     * @returns {Broadcaster} this object
     */
    public deregisterListener(listener: any) {
      for (var i=0; i < this.listenerCallbacks.length; i++) {
        if (this.listenerCallbacks[i].l === listener) {
          this.listenerCallbacks.splice(i, 1);
          return this;
        }
      }
      throw new Error("Attempted to deregister listener, but listener not found");
    }
  }
}

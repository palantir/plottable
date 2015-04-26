///<reference path="../reference.ts" />

module Plottable {
  export class Dispatcher extends Core.PlottableObject {
    protected eventCallbacks: { [eventName: string]: (e: Event) => any; } = {};
    protected broadcasters: Core.Broadcaster<Dispatcher>[] = [];
    private connected = false;

    /**
     * Creates a wrapped version of the callback that can be registered to a Broadcaster
     */
    protected getWrappedCallback(callback: Function): Core.BroadcasterCallback<Dispatcher> {
      return () => callback();
    }

    protected setCallback(b: Core.Broadcaster<Dispatcher>, key: any, callback: Function) {
      if (callback === null) { // remove listener if callback is null
        b.deregisterListener(key);
        this.disconnect();
      } else {
        this.connect();
        b.registerListener(key, this.getWrappedCallback(callback));
      }
    }

    private connect() {
      if (!this.connected) {
        Object.keys(this.eventCallbacks).forEach((event: string) => {
          var callback = this.eventCallbacks[event];
          document.addEventListener(event, callback);
        });
        this.connected = true;
      }
    }

    private disconnect() {
      if (this.connected && this.hasNoListeners()) {
        Object.keys(this.eventCallbacks).forEach((event: string) => {
          var callback = this.eventCallbacks[event];
          document.removeEventListener(event, callback);
        });
        this.connected = false;
      }
    }

    private hasNoListeners() {
      return this.broadcasters.every((b) => b.getListenerKeys().length === 0);
    }
  }
}

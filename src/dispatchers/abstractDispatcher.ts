///<reference path="../reference.ts" />

module Plottable {
export module Dispatcher {
  export class AbstractDispatcher extends Core.PlottableObject {
    public _target: D3.Selection;
    public _event2Callback: { [eventName: string]: () => any; } = {};
    private connected = false;

    /**
     * Constructs a Dispatcher with the specified target.
     *
     * @param {D3.Selection} target The selection to listen for events on.
     */
    constructor(target: D3.Selection) {
      super();
      this._target = target;
    }

    /**
     * Gets the target of the Dispatcher.
     *
     * @returns {D3.Selection} The Dispatcher's current target.
     */
    public target(): D3.Selection;
    /**
     * Sets the target of the Dispatcher.
     *
     * @param {D3.Selection} target The element to listen for updates on.
     * @returns {Dispatcher} The calling Dispatcher.
     */
    public target(targetElement: D3.Selection): AbstractDispatcher;
    public target(targetElement?: D3.Selection): any {
      if (targetElement == null) {
        return this._target;
      }
      var wasConnected = this.connected;
      this.disconnect();
      this._target = targetElement;
      if (wasConnected) {
        // re-connect to the new target
        this.connect();
      }
      return this;
    }

    /**
     * Gets a namespaced version of the event name.
     */
    public _getEventString(eventName: string) {
      return eventName + ".dispatcher" + this._plottableID;
    }

    /**
     * Attaches the Dispatcher's listeners to the Dispatcher's target element.
     *
     * @returns {Dispatcher} The calling Dispatcher.
     */
    public connect() {
      if (this.connected) {
        throw new Error("Can't connect dispatcher twice!");
      }
      if (this._target) {
        this.connected = true;
        Object.keys(this._event2Callback).forEach((event: string) => {
          var callback = this._event2Callback[event];
          this._target.on(this._getEventString(event), callback);
        });
      }

      return this;
    }

    /**
     * Detaches the Dispatcher's listeners from the Dispatchers' target element.
     *
     * @returns {Dispatcher} The calling Dispatcher.
     */
    public disconnect() {
      this.connected = false;
      if (this._target) {
        Object.keys(this._event2Callback).forEach((event: string) => {
          this._target.on(this._getEventString(event), null);
        });
      }
      return this;
    }
  }
}
}

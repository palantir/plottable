///<reference path="../reference.ts" />

module Plottable {
export module Dispatcher {
  export class AbstractDispatcher extends Core.PlottableObject {
    protected _target: D3.Selection;
    protected _event2Callback: { [eventName: string]: () => any; } = {};
    private _connected = false;

    /**
     * Constructs a Dispatcher with the specified target.
     *
     * @constructor
     * @param {D3.Selection} [target] The selection to listen for events on.
     */
    constructor(target?: D3.Selection) {
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
      var wasConnected = this._connected;
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
    protected _getEventString(eventName: string) {
      return eventName + ".dispatcher" + this.getID();
    }

    /**
     * Attaches the Dispatcher's listeners to the Dispatcher's target element.
     *
     * @returns {Dispatcher} The calling Dispatcher.
     */
    public connect() {
      if (this._connected) {
        throw new Error("Can't connect dispatcher twice!");
      }
      if (this._target) {
        this._connected = true;
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
      this._connected = false;
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

///<reference path="../reference.ts" />

module Plottable {
export module Dispatcher {
  export class Keypress extends Dispatcher.AbstractDispatcher {
    private mousedOverTarget = false;
    private keydownListenerTarget: D3.Selection;
    private _onKeyDown: (e: D3.D3Event) => void;

    /**
     * Constructs a Keypress Dispatcher with the specified target.
     *
     * @constructor
     * @param {D3.Selection} [target] The selection to listen for events on.
     */
    constructor(target?: D3.Selection) {
      super(target);

      // Can't attach the key listener to the target (a sub-svg element)
      // because "focusable" is only in SVG 1.2 / 2, which most browsers don't
      // yet implement
      this.keydownListenerTarget = d3.select(document);

      this._event2Callback["mouseover"] = () => {
        this.mousedOverTarget = true;
      };

      this._event2Callback["mouseout"] = () => {
        this.mousedOverTarget = false;
      };
    }

    public connect() {
      super.connect();
      this.keydownListenerTarget.on(this._getEventString("keydown"), () => {
        if (this.mousedOverTarget && this._onKeyDown) {
          this._onKeyDown(d3.event);
        }
      });
      return this;
    }

    public disconnect() {
      super.disconnect();
      this.keydownListenerTarget.on(this._getEventString("keydown"), null);
      return this;
    }

    /**
     * Gets the callback to be called when a key is pressed.
     *
     * @return {(e: D3.D3Event) => void} The current keydown callback.
     */
    public onKeyDown(): (e: D3.D3Event) => void;
    /**
     * Sets a callback to be called when a key is pressed.
     *
     * @param {(e: D3.D3Event) => void} A callback that takes in a D3Event.
     * @return {Keypress} The calling Dispatcher.Keypress.
     */
    public onKeyDown(callback: (e: D3.D3Event) => void): Keypress;
    public onKeyDown(callback?: (e: D3.D3Event) => void): any {
      if (callback === undefined) {
        return this._onKeyDown;
      }
      this._onKeyDown = callback;
      return this;
    }
  }
}
}

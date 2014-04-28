///<reference path="../reference.ts" />

module Plottable {
  export class KeyInteraction extends Interaction {
    private _callback: () => any;
    private activated = false;
    private keyCode: number;

    /**
     * Creates a KeyInteraction.
     *
     * @constructor
     * @param {Component} componentToListenTo The component to listen for keypresses on.
     * @param {number} keyCode The key code to listen for.
     */
    constructor(componentToListenTo: Component, keyCode: number) {
      super(componentToListenTo);
      this.keyCode = keyCode;
    }

    public _anchor(hitBox: D3.Selection) {
      super._anchor(hitBox);
      hitBox.on("mouseover", () => {
        this.activated = true;
      });
      hitBox.on("mouseout", () => {
        this.activated = false;
      });

      Plottable.KeyEventListener.addCallback(this.keyCode, (e: D3.Event) => {
        if (this.activated && this._callback != null) {
          this._callback();
        }
      });
    }

    /**
     * Sets an callback to be called when the designated key is pressed.
     *
     * @param {() => any} cb: Callback to be called.
     */
    public callback(cb: () => any): KeyInteraction {
      this._callback = cb;
      return this;
    }
  }
}

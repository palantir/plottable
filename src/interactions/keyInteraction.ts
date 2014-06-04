///<reference path="../reference.ts" />

module Plottable{
export module Interactions {
  export class Key extends Abstract.Interaction {
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
    constructor(componentToListenTo: Abstract.Component, keyCode: number) {
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

      Plottable.Singletons.KeyEventListener.addCallback(this.keyCode, (e: D3.Event) => {
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
    public callback(cb: () => any): Key {
      this._callback = cb;
      return this;
    }
  }
}
}

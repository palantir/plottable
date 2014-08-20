///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export class Key extends Abstract.Interaction {
    private _callback: () => any;
    private activated = false;
    private keyCode: number;

    /**
     * Creates a KeyInteraction.
     *
     * KeyInteraction listens to key events that occur while the component is
     * moused over.
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

      Core.KeyEventListener.addCallback(this.keyCode, (e: D3.D3Event) => {
        if (this.activated && this._callback != null) {
          this._callback();
        }
      });
    }

    /**
     * Sets an callback to be called when the designated key is pressed and the
     * user is moused over the component.
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

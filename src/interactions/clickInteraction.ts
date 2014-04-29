///<reference path="../reference.ts" />

module Plottable {
  export class ClickInteraction extends Interaction {
    private _callback: (x: number, y: number) => any;

    /**
     * Creates a ClickInteraction.
     *
     * @constructor
     * @param {Component} componentToListenTo The component to listen for clicks on.
     */
    constructor(componentToListenTo: Component) {
      super(componentToListenTo);
    }

    public _anchor(hitBox: D3.Selection) {
      super._anchor(hitBox);
      hitBox.on("click", () => {
        var xy = d3.mouse(hitBox.node());
        var x = xy[0];
        var y = xy[1];
        this._callback(x, y);
      });
    }

    /**
     * Sets an callback to be called when a click is received.
     *
     * @param {(x: number, y: number) => any} cb: Callback to be called. Takes click x and y in pixels.
     */
    public callback(cb: (x: number, y: number) => any): ClickInteraction {
      this._callback = cb;
      return this;
    }
  }
}

///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export class Mouse extends Abstract.Interaction {
    private _mouseover: (x: number, y: number) => any;
    private _mousemove: (x: number, y: number) => any;
    private _mouseout: (x: number, y: number) => any;

    constructor(componentToListenTo: Abstract.Component) {
      super(componentToListenTo);
    }

    public _anchor(hitBox: D3.Selection) {
      super._anchor(hitBox);
      hitBox.on("mouseover", () => {
        if (this._mouseover != null) {
          var xy = d3.mouse(hitBox.node());
          var x = xy[0];
          var y = xy[1];
          this._mouseover(x, y);
        }
      });
      hitBox.on("mousemove", () => {
        if (this._mousemove != null) {
          var xy = d3.mouse(hitBox.node());
          var x = xy[0];
          var y = xy[1];
          this._mousemove(x, y);
        }
      });
      hitBox.on("mouseout", () => {
        if (this._mouseout != null) {
          var xy = d3.mouse(hitBox.node());
          var x = xy[0];
          var y = xy[1];
          this._mouseout(x, y);
        }
      });
    }

    /**
     * Attaches a callback to be called on mouseover.
     *
     * @param {(x: number, y: number) => any} callback A function that takes the x and y pixel positions of the mouse event.
     * @return {Mouse} The calling Mouse Interaction.
     */
    public mouseover(callback: (x: number, y: number) => any) {
      this._mouseover = callback;
      return this;
    }

    /**
     * Attaches a callback to be called on mousemove.
     *
     * @param {(x: number, y: number) => any} callback A function that takes the x and y pixel positions of the mouse event.
     * @return {Mouse} The calling Mouse Interaction.
     */
    public mousemove(callback: (x: number, y: number) => any) {
      this._mousemove = callback;
      return this;
    }

    /**
     * Attaches a callback to be called on mouseout.
     *
     * @param {(x: number, y: number) => any} callback A function that takes the x and y pixel positions of the mouse event.
     * @return {Mouse} The calling Mouse Interaction.
     */
    public mouseout(callback: (x: number, y: number) => any) {
      this._mouseout = callback;
      return this;
    }
  }
}
}

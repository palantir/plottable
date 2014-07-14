///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export class Mouse extends Abstract.Interaction {
    private _mouseover: (location: Point) => any;
    private _mousemove: (location: Point) => any;
    private _mouseout: (location: Point) => any;

    constructor(componentToListenTo: Abstract.Component) {
      super(componentToListenTo);
    }

    public _anchor(hitBox: D3.Selection) {
      super._anchor(hitBox);
      hitBox.on("mouseover", () => {
        if (this._mouseover != null) {
          var xy = d3.mouse(hitBox.node());
          var p: Point = {
            x: xy[0],
            y: xy[1]
          }
          this._mouseover(p);
        }
      });
      hitBox.on("mousemove", () => {
        if (this._mousemove != null) {
          var xy = d3.mouse(hitBox.node());
          var p: Point = {
            x: xy[0],
            y: xy[1]
          }
          this._mousemove(p);
        }
      });
      hitBox.on("mouseout", () => {
        if (this._mouseout != null) {
          var xy = d3.mouse(hitBox.node());
          var p: Point = {
            x: xy[0],
            y: xy[1]
          }
          this._mouseout(p);
        }
      });
    }

    /**
     * Attaches a callback to be called on mouseover.
     *
     * @param {(location: Point) => any} callback A function that takes the pixel position of the mouse event.
     * @return {Mouse} The calling Mouse Interaction.
     */
    public mouseover(callback: (location: Point) => any) {
      this._mouseover = callback;
      return this;
    }

    /**
     * Attaches a callback to be called on mousemove.
     *
     * @param {(location: Point) => any} callback A function that takes the pixel position of the mouse event.
     * @return {Mouse} The calling Mouse Interaction.
     */
    public mousemove(callback: (location: Point) => any) {
      this._mousemove = callback;
      return this;
    }

    /**
     * Attaches a callback to be called on mouseout.
     *
     * @param {(location: Point) => any} callback A function that takes the pixel position of the mouse event.
     * @return {Mouse} The calling Mouse Interaction.
     */
    public mouseout(callback: (location: Point) => any) {
      this._mouseout = callback;
      return this;
    }
  }
}
}

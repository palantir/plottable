///<reference path="../reference.ts" />

module Plottable {
export module Dispatcher {
  export class Mouse extends Dispatcher.AbstractDispatcher {
    private _mouseover: (location: Point) => any;
    private _mousemove: (location: Point) => any;
    private _mouseout: (location: Point) => any;

    /**
     * Constructs a Mouse Dispatcher with the specified target.
     *
     * @param {D3.Selection} target The selection to listen for events on.
     */
    constructor(target: D3.Selection) {
      super(target);

      this._event2Callback["mouseover"] = () => {
        if (this._mouseover != null) {
          this._mouseover(this._getMousePosition());
        }
      };

      this._event2Callback["mousemove"] = () => {
        if (this._mousemove != null) {
          this._mousemove(this._getMousePosition());
        }
      };

      this._event2Callback["mouseout"] = () => {
        if (this._mouseout != null) {
          this._mouseout(this._getMousePosition());
        }
      };
    }

    private _getMousePosition(): Point {
      var xy = d3.mouse(this._target.node());
      return {
            x: xy[0],
            y: xy[1]
          };
    }

    /**
     * Gets the current callback to be called on mouseover.
     *
     * @return {(location: Point) => any} The current mouseover callback.
     */
    public mouseover(): (location: Point) => any;
    /**
     * Attaches a callback to be called on mouseover.
     *
     * @param {(location: Point) => any} callback A function that takes the pixel position of the mouse event.
     *                                            Pass in null to remove the callback.
     * @return {Mouse} The calling Mouse Handler.
     */
    public mouseover(callback: (location: Point) => any): Mouse;
    public mouseover(callback?: (location: Point) => any): any {
      if (callback === undefined) {
        return this._mouseover;
      }
      this._mouseover = callback;
      return this;
    }

    /**
     * Gets the current callback to be called on mousemove.
     *
     * @return {(location: Point) => any} The current mousemove callback.
     */
    public mousemove(): (location: Point) => any;
    /**
     * Attaches a callback to be called on mousemove.
     *
     * @param {(location: Point) => any} callback A function that takes the pixel position of the mouse event.
     *                                            Pass in null to remove the callback.
     * @return {Mouse} The calling Mouse Handler.
     */
    public mousemove(callback: (location: Point) => any): Mouse;
    public mousemove(callback?: (location: Point) => any): any {
      if (callback === undefined) {
        return this._mousemove;
      }
      this._mousemove = callback;
      return this;
    }

    /**
     * Gets the current callback to be called on mouseout.
     *
     * @return {(location: Point) => any} The current mouseout callback.
     */
    public mouseout(): (location: Point) => any;
    /**
     * Attaches a callback to be called on mouseout.
     *
     * @param {(location: Point) => any} callback A function that takes the pixel position of the mouse event.
     *                                            Pass in null to remove the callback.
     * @return {Mouse} The calling Mouse Handler.
     */
    public mouseout(callback: (location: Point) => any): Mouse;
    public mouseout(callback?: (location: Point) => any): any {
      if (callback === undefined) {
        return this._mouseout;
      }
      this._mouseout = callback;
      return this;
    }
  }
}
}

///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export class Click extends AbstractInteraction {

    private _mouseDispatcher: Plottable.Dispatcher.Mouse;
    private _touchDispatcher: Plottable.Dispatcher.Touch;
    private _clickCallback: (p: Point) => any;

    public _anchor(component: Component.AbstractComponent, hitBox: D3.Selection) {
      super._anchor(component, hitBox);

      this._mouseDispatcher = Dispatcher.Mouse.getDispatcher(<SVGElement> component.content().node());
      this._mouseDispatcher.onMouseDown("Interaction.Click" + this.getID(), (p: Point) => this._handleMouseDown(p));
      this._mouseDispatcher.onMouseUp("Interaction.Click" + this.getID(), (p: Point) => this._handleMouseUp(p));

      this._touchDispatcher = Dispatcher.Touch.getDispatcher(<SVGElement> component.content().node());
      this._touchDispatcher.onTouchStart("Interaction.Click" + this.getID(), (p: Point) => this._handleMouseDown(p));
      this._touchDispatcher.onTouchEnd("Interaction.Click" + this.getID(), (p: Point) => this._handleMouseUp(p));
    }

    private _handleMouseDown(p: Point) {
      // TODO: implement this
    }

    private _handleMouseUp(p: Point) {
      // TODO: implement this
    }

    /**
     * Gets the callback called when the Component is clicked.
     *
     * @return {(p: Point) => any} The current callback.
     */
    public onClick(): (p: Point) => any;
    /**
     * Sets the callback called when the Component is clicked.
     *
     * @param {(p: Point) => any} callback The callback to set.
     * @return {Interaction.Pointer} The calling Interaction.Click.
     */
    public onClick(callback: (p: Point) => any): Interaction.Click;
    public onClick(callback?: (p: Point) => any): any {
      if (callback === undefined) {
        return this._clickCallback;
      }
      this._clickCallback = callback;
      return this;
    }

  }
}
}

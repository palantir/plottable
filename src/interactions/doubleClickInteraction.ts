///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export class DoubleClick extends AbstractInteraction {

    private _mouseDispatcher: Plottable.Dispatcher.Mouse;
    private _touchDispatcher: Plottable.Dispatcher.Touch;
    private _dblClickCallback: (p: Point) => any;

    public _anchor(component: Component.AbstractComponent, hitBox: D3.Selection) {
      super._anchor(component, hitBox);

      this._mouseDispatcher = Dispatcher.Mouse.getDispatcher(<SVGElement> component.content().node());
      this._mouseDispatcher.onMouseDown("Interaction.DoubleClick" + this.getID(), (p: Point) => this._handleClickDown(p));
      this._mouseDispatcher.onMouseUp("Interaction.DoubleClick" + this.getID(), (p: Point) => this._handleClickUp(p));
      this._mouseDispatcher.onDblClick("Interaction.DoubleClick" + this.getID(), (p: Point) => this._handleDblClick(p));

      this._touchDispatcher = Dispatcher.Touch.getDispatcher(<SVGElement> component.content().node());
      this._touchDispatcher.onTouchStart("Interaction.DoubleClick" + this.getID(), (p: Point) => this._handleClickDown(p));
      this._touchDispatcher.onTouchEnd("Interaction.DoubleClick" + this.getID(), (p: Point) => this._handleClickUp(p));
    }

    private _handleClickDown(p: Point) {
      // TODO: Implement
    }

    private _handleClickUp(p: Point) {
      // TODO: Implement
    }

    private _handleDblClick(p: Point) {
      // TODO: Implement
    }

    /**
     * Gets the callback called when the Component is double-clicked.
     *
     * @return {(p: Point) => any} The current callback.
     */
    public onDblClick(): (p: Point) => any;
    /**
     * Sets the callback called when the Component is double-clicked.
     *
     * @param {(p: Point) => any} callback The callback to set.
     * @return {Interaction.DoubleClick} The calling Interaction.DoubleClick.
     */
    public onDblClick(callback: (p: Point) => any): Interaction.DoubleClick;
    public onDblClick(callback?: (p: Point) => any): any {
      if (callback === undefined) {
        return this._dblClickCallback;
      }
      this._dblClickCallback = callback;
      return this;
    }

  }
}
}

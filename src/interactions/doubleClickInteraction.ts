///<reference path="../reference.ts" />

module Plottable {
export module Interaction {
  export class DoubleClick extends AbstractInteraction {

    private _mouseDispatcher: Plottable.Dispatcher.Mouse;
    private _touchDispatcher: Plottable.Dispatcher.Touch;
    private _dblClickCallback: (p: Point) => any;
    private _clickedDown = false;

    public _anchor(component: Component.AbstractComponent, hitBox: D3.Selection) {
      super._anchor(component, hitBox);

      this._mouseDispatcher = Dispatcher.Mouse.getDispatcher(<SVGElement> component.content().node());
      this._mouseDispatcher.onMouseDown("Interaction.Click" + this.getID(), (p: Point) => this._handleClickDown(p));
      this._mouseDispatcher.onMouseUp("Interaction.Click" + this.getID(), (p: Point) => this._handleClickUp(p));
      this._mouseDispatcher.onDblClick("Interaction.Click" + this.getID(), (p: Point) => this._handleDblClick(p));

      this._touchDispatcher = Dispatcher.Touch.getDispatcher(<SVGElement> component.content().node());
      this._touchDispatcher.onTouchStart("Interaction.Click" + this.getID(), (p: Point) => this._handleClickDown(p));
      this._touchDispatcher.onTouchEnd("Interaction.Click" + this.getID(), (p: Point) => this._handleClickUp(p));
      this._touchDispatcher.onDblClick("Interaction.Click" + this.getID(), (p: Point) => this._handleDblClick(p));
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

  }
}
}

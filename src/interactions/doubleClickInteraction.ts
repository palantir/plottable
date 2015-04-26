///<reference path="../reference.ts" />

module Plottable {
export module Interactions {
  enum ClickState {NotClicked, SingleClicked, DoubleClicked};
  export class DoubleClick extends Interaction {
    private clickedDown = false;
    private clickedPoint: Point;
    private clickState = ClickState.NotClicked;
    private doubleClickCallback: (p: Point) => any;
    private mouseDispatcher: Plottable.Dispatchers.Mouse;
    private touchDispatcher: Plottable.Dispatchers.Touch;

    public anchor(component: Component, hitBox: D3.Selection) {
      super.anchor(component, hitBox);

      this.mouseDispatcher = Dispatchers.Mouse.getDispatcher(<SVGElement> component.content().node());
      this.mouseDispatcher.onMouseDown("Interactions.DoubleClick" + this.getID(), (p: Point) => this.handleClickDown(p));
      this.mouseDispatcher.onMouseUp("Interactions.DoubleClick" + this.getID(), (p: Point) => this.handleClickUp(p));
      this.mouseDispatcher.onDblClick("Interactions.DoubleClick" + this.getID(), (p: Point) => this.handleDblClick());

      this.touchDispatcher = Dispatchers.Touch.getDispatcher(<SVGElement> component.content().node());
      this.touchDispatcher.onTouchStart("Interactions.DoubleClick" + this.getID(), (ids, idToPoint) =>
                                                                                     this.handleClickDown(idToPoint[ids[0]]));
      this.touchDispatcher.onTouchEnd("Interactions.DoubleClick" + this.getID(), (ids, idToPoint) =>
                                                                                     this.handleClickUp(idToPoint[ids[0]]));
    }

    /**
     * Gets the callback called when the Component is double-clicked.
     *
     * @return {(p: Point) => any} The current callback.
     */
    public onDoubleClick(): (p: Point) => any;
    /**
     * Sets the callback called when the Component is double-clicked.
     *
     * @param {(p: Point) => any} callback The callback to set.
     * @return {Interaction.DoubleClick} The calling Interaction.DoubleClick.
     */
    public onDoubleClick(callback: (p: Point) => any): Interactions.DoubleClick;
    public onDoubleClick(callback?: (p: Point) => any): any {
      if (callback === undefined) {
        return this.doubleClickCallback;
      }
      this.doubleClickCallback = callback;
      return this;
    }

    private handleClickDown(p: Point) {
      var translatedP = this.translateToComponentSpace(p);
      if (this.isInsideComponent(translatedP)) {
        if (!(this.clickState === ClickState.SingleClicked) || !Utils.Methods.pointsEqual(translatedP, this.clickedPoint)) {
          this.clickState = ClickState.NotClicked;
        }
        this.clickedPoint = translatedP;
        this.clickedDown = true;
      }
    }

    private handleClickUp(p: Point) {
      var translatedP = this.translateToComponentSpace(p);
      if (this.clickedDown && Utils.Methods.pointsEqual(translatedP, this.clickedPoint)) {
        this.clickState = this.clickState === ClickState.NotClicked ? ClickState.SingleClicked : ClickState.DoubleClicked;
      } else {
        this.clickState = ClickState.NotClicked;
      }
      this.clickedDown = false;
    }

    private handleDblClick() {
      if (this.clickState === ClickState.DoubleClicked) {
        if (this.doubleClickCallback) {
          this.doubleClickCallback(this.clickedPoint);
        }
        this.clickState = ClickState.NotClicked;
      }
    }
  }
}
}

///<reference path="../reference.ts" />

module Plottable {
export module Interactions {
  export class Click extends Interaction {
    private clickCallback: (p: Point) => any;
    private clickedDown = false;
    private mouseDispatcher: Plottable.Dispatchers.Mouse;
    private touchDispatcher: Plottable.Dispatchers.Touch;

    public anchor(component: Component, hitBox: D3.Selection) {
      super.anchor(component, hitBox);

      this.mouseDispatcher = Dispatchers.Mouse.getDispatcher(<SVGElement> component.content().node());
      this.mouseDispatcher.onMouseDown("Interaction.Click" + this.getID(), (p: Point) => this.handleClickDown(p));
      this.mouseDispatcher.onMouseUp("Interaction.Click" + this.getID(), (p: Point) => this.handleClickUp(p));

      this.touchDispatcher = Dispatchers.Touch.getDispatcher(<SVGElement> component.content().node());
      this.touchDispatcher.onTouchStart("Interaction.Click" + this.getID(), (ids, idToPoint) =>
                                                                               this.handleClickDown(idToPoint[ids[0]]));
      this.touchDispatcher.onTouchEnd("Interaction.Click" + this.getID(), (ids, idToPoint) =>
                                                                               this.handleClickUp(idToPoint[ids[0]]));
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
     * @return {Interaction.Click} The calling Interaction.Click.
     */
    public onClick(callback: (p: Point) => any): Interactions.Click;
    public onClick(callback?: (p: Point) => any): any {
      if (callback === undefined) {
        return this.clickCallback;
      }
      this.clickCallback = callback;
      return this;
    }

    private handleClickDown(p: Point) {
      var translatedPoint = this.translateToComponentSpace(p);
      if (this.isInsideComponent(translatedPoint)) {
        this.clickedDown = true;
      }
    }

    private handleClickUp(p: Point) {
      var translatedPoint = this.translateToComponentSpace(p);
      if (this.clickedDown && this.isInsideComponent(translatedPoint) && (this.clickCallback != null)) {
        this.clickCallback(translatedPoint);
      }
      this.clickedDown = false;
    }
  }
}
}

///<reference path="../reference.ts" />

module Plottable {
export module Interactions {
  export class Pointer extends Interaction {

    private mouseDispatcher: Dispatchers.Mouse;
    private overComponent = false;
    private pointerEnterCallback: (p: Point) => any;
    private pointerExitCallback: (p: Point) => any;
    private pointerMoveCallback: (p: Point) => any;
    private touchDispatcher: Dispatchers.Touch;

    public anchor(component: Component, hitBox: D3.Selection) {
      super.anchor(component, hitBox);
      this.mouseDispatcher = Dispatchers.Mouse.getDispatcher(<SVGElement> this.component.content().node());
      this.mouseDispatcher.onMouseMove("Interaction.Pointer" + this.getID(), (p: Point) => this.handlePointerEvent(p));

      this.touchDispatcher = Dispatchers.Touch.getDispatcher(<SVGElement> this.component.content().node());

      this.touchDispatcher.onTouchStart("Interaction.Pointer" + this.getID(), (ids, idToPoint) =>
                                                                                this.handlePointerEvent(idToPoint[ids[0]]));
    }

    /**
     * Gets the callback called when the pointer enters the Component.
     *
     * @return {(p: Point) => any} The current callback.
     */
    public onPointerEnter(): (p: Point) => any;
    /**
     * Sets the callback called when the pointer enters the Component.
     *
     * @param {(p: Point) => any} callback The callback to set.
     * @return {Interaction.Pointer} The calling Interaction.Pointer.
     */
    public onPointerEnter(callback: (p: Point) => any): Interactions.Pointer;
    public onPointerEnter(callback?: (p: Point) => any): any {
      if (callback === undefined) {
        return this.pointerEnterCallback;
      }
      this.pointerEnterCallback = callback;
      return this;
    }

    /**
     * Gets the callback called when the pointer exits the Component.
     *
     * @return {(p: Point) => any} The current callback.
     */
    public onPointerExit(): (p: Point) => any;
    /**
     * Sets the callback called when the pointer exits the Component.
     *
     * @param {(p: Point) => any} callback The callback to set.
     * @return {Interaction.Pointer} The calling Interaction.Pointer.
     */
    public onPointerExit(callback: (p: Point) => any): Interactions.Pointer;
    public onPointerExit(callback?: (p: Point) => any): any {
      if (callback === undefined) {
        return this.pointerExitCallback;
      }
      this.pointerExitCallback = callback;
      return this;
    }

    /**
     * Gets the callback called when the pointer moves.
     *
     * @return {(p: Point) => any} The current callback.
     */
    public onPointerMove(): (p: Point) => any;
    /**
     * Sets the callback called when the pointer moves.
     *
     * @param {(p: Point) => any} callback The callback to set.
     * @return {Interaction.Pointer} The calling Interaction.Pointer.
     */
    public onPointerMove(callback: (p: Point) => any): Interactions.Pointer;
    public onPointerMove(callback?: (p: Point) => any): any {
      if (callback === undefined) {
        return this.pointerMoveCallback;
      }
      this.pointerMoveCallback = callback;
      return this;
    }

    private handlePointerEvent(p: Point) {
      var translatedP = this.translateToComponentSpace(p);
      if (this.isInsideComponent(translatedP)) {
        var wasOverComponent = this.overComponent;
        this.overComponent = true;
        if (!wasOverComponent && this.pointerEnterCallback) {
          this.pointerEnterCallback(translatedP);
        }
        if (this.pointerMoveCallback) {
          this.pointerMoveCallback(translatedP);
        }
      } else if (this.overComponent) {
        this.overComponent = false;
        if (this.pointerExitCallback) {
          this.pointerExitCallback(translatedP);
        }
      }
    }
  }
}
}

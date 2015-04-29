///<reference path="../reference.ts" />

module Plottable {
  export class Interaction extends Core.PlottableObject {
    /**
     * It maintains a 'hitBox' which is where all event listeners are
     * attached. Due to cross- browser weirdness, the hitbox needs to be an
     * opaque but invisible rectangle.  TODO: We should give the interaction
     * "foreground" and "background" elements where it can draw things,
     * e.g. crosshairs.
     */
    protected _hitBox: D3.Selection;
    protected _componentToListenTo: Component;

    public anchor(component: Component, hitBox: D3.Selection) {
      this._componentToListenTo = component;
      this._hitBox = hitBox;
    }

    // HACKHACK: After all Interactions use Dispatchers, we won't need hitboxes at all (#1757)
    public _requiresHitbox() {
      return false;
    }

    /**
     * Translates an <svg>-coordinate-space point to Component-space coordinates.
     *
     * @param {Point} p A Point in <svg>-space coordinates.
     *
     * @return {Point} The same location in Component-space coordinates.
     */
    protected _translateToComponentSpace(p: Point): Point {
      var origin = this._componentToListenTo.originToSVG();
      return {
        x: p.x - origin.x,
        y: p.y - origin.y
      };
    }

    /**
     * Checks whether a Component-coordinate-space Point is inside the Component.
     *
     * @param {Point} p A Point in Coordinate-space coordinates.
     *
     * @return {boolean} Whether or not the point is inside the Component.
     */
    protected _isInsideComponent(p: Point) {
      return 0 <= p.x && 0 <= p.y
             && p.x <= this._componentToListenTo.width()
             && p.y <= this._componentToListenTo.height();
    }
  }
}

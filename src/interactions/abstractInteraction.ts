///<reference path="../reference.ts" />

module Plottable {
  export class Interaction extends Core.PlottableObject {
    protected component: Component;
    /**
     * All event listeners are attached to the hitBox. In order to maintain cross-browser
     * compatibility, the hitbox needs to be an opaque but invisible rectangle.
     *
     * TODO: Give the interaction "foreground" and "background" elements for drawing things
     */
    protected hitBox: D3.Selection;

    public anchor(component: Component, hitBox: D3.Selection) {
      this.component = component;
      this.hitBox = hitBox;
    }

    // HACKHACK: After all Interactions use Dispatchers, we won't need hitboxes at all (#1757)
    public requiresHitbox() {
      return false;
    }

    /**
     * Checks whether a Component-coordinate-space Point is inside the Component.
     *
     * @param {Point} p A Point in Coordinate-space coordinates.
     *
     * @return {boolean} Whether or not the point is inside the Component.
     */
    protected isInsideComponent(p: Point) {
      return 0 <= p.x && 0 <= p.y
             && p.x <= this.component.width()
             && p.y <= this.component.height();
    }

    /**
     * Translates an <svg>-coordinate-space point to Component-space coordinates.
     *
     * @param {Point} p A Point in <svg>-space coordinates.
     *
     * @return {Point} The same location in Component-space coordinates.
     */
    protected translateToComponentSpace(p: Point): Point {
      var origin = this.component.originToSVG();
      return {
        x: p.x - origin.x,
        y: p.y - origin.y
      };
    }
  }
}

///<reference path="../reference.ts" />

module Plottable {
  export class Interaction {
    protected _componentAttachedTo: Component;

    private _anchorCallback = (component: Component) => this._anchor(component);

    private _isAnchored: boolean;

    protected _anchor(component: Component) {
      this._isAnchored = true;
    }

    protected _unanchor() {
      this._isAnchored = false;
    }

    /**
     * Attaches current interaction to a Component. If the interaction was already
     * attached to a Component, it first detaches itself from the old component.
     *
     * @param {Component} component The component to which to attach the interaction.
     *
     * @return {Interaction}
     */
    public attachTo(component: Component) {
      if (this._componentAttachedTo) {
        this.detachFrom(this._componentAttachedTo);
      }

      this._componentAttachedTo = component;
      component.onAnchor(this._anchorCallback);

      return this;
    }

    /**
     * Detaches current interaction from the Component. Interaction can be reused.
     *
     * @param {Component} component The component to which to attach the interaction.
     *
     * @return {Interaction}
     */
    public detachFrom(component: Component) {
      this._unanchor();
      this._componentAttachedTo = null;
      component.offAnchor(this._anchorCallback);

      return this;
    }

    /**
     * Translates an <svg>-coordinate-space point to Component-space coordinates.
     *
     * @param {Point} p A Point in <svg>-space coordinates.
     *
     * @return {Point} The same location in Component-space coordinates.
     */
    protected _translateToComponentSpace(p: Point): Point {
      var origin = this._componentAttachedTo.originToSVG();
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
             && p.x <= this._componentAttachedTo.width()
             && p.y <= this._componentAttachedTo.height();
    }
  }
}

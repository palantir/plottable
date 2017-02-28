/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { IComponent } from "../components/abstractComponent";
import { Point } from "../core/interfaces";
import * as Utils from "../utils";

export class Interaction {
  protected _componentAttachedTo: IComponent<any>;

  private _anchorCallback = (component: IComponent<any>) => this._anchor(component);

  private _isAnchored: boolean;
  private _enabled = true;

  protected _anchor(component: IComponent<any>) {
    this._isAnchored = true;
  }

  protected _unanchor() {
    this._isAnchored = false;
  }

  /**
   * Attaches this Interaction to a Component.
   * If the Interaction was already attached to a Component, it first detaches itself from the old Component.
   *
   * @param {Component} component
   * @returns {Interaction} The calling Interaction.
   */
  public attachTo(component: IComponent<any>) {
    this._disconnect();
    this._componentAttachedTo = component;
    this._connect();
    return this;
  }

  private _connect() {
    if (this.enabled() && this._componentAttachedTo != null && !this._isAnchored) {
      this._componentAttachedTo.onAnchor(this._anchorCallback);
    }
  }

  /**
   * Detaches this Interaction from the Component.
   * This Interaction can be reused.
   *
   * @param {Component} component
   * @returns {Interaction} The calling Interaction.
   */
  public detachFrom(component: IComponent<any>) {
    this._disconnect();
    this._componentAttachedTo = null;
    return this;
  }

  private _disconnect() {
    if (this._isAnchored) {
      this._unanchor();
    }
    if (this._componentAttachedTo != null) {
      this._componentAttachedTo.offAnchor(this._anchorCallback);
    }
  }

  /**
   * Gets whether this Interaction is enabled.
   */
  public enabled(): boolean;
  /**
   * Enables or disables this Interaction.
   *
   * @param {boolean} enabled Whether the Interaction should be enabled.
   * @return {Interaction} The calling Interaction.
   */
  public enabled(enabled: boolean): this;
  public enabled(enabled?: boolean): any {
    if (enabled == null) {
      return this._enabled;
    }
    this._enabled = enabled;
    if (this._enabled) {
      this._connect();
    } else {
      this._disconnect();
    }
    return this;
  }

  /**
   * Translates an element-coordinate-space point to Component-space coordinates.
   *
   * @param {Point} p A Point in element space coordinates.
   * @return {Point} The same location in Component-space coordinates.
   */
  protected _translateToComponentSpace(p: Point): Point {
    let origin = Utils.Component.originToRoot(this._componentAttachedTo);
    return {
      x: p.x - origin.x,
      y: p.y - origin.y,
    };
  }

  /**
   * Checks whether a Component-coordinate-space Point is inside the Component.
   *
   * @param {Point} p A Point in Compoennt-space coordinates.
   * @return {boolean} Whether or not the point is inside the Component.
   */
  protected _isInsideComponent(p: Point) {
    return 0 <= p.x && 0 <= p.y
      && p.x <= this._componentAttachedTo.width()
      && p.y <= this._componentAttachedTo.height();
  }
}

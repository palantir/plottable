/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Component } from "../components/component";
import { Point } from "../core/interfaces";

export class Interaction {
  private _anchorCallback = (component: Component) => this._anchor(component);
  private _isAnchored: boolean;
  private _enabled = true;

  protected _componentAttachedTo: Component;

  /**
   * Attaches this Interaction to a Component.
   * If the Interaction was already attached to a Component, it first detaches itself from the old Component.
   *
   * @param {Component} component
   * @returns {Interaction} The calling Interaction.
   */
  public attachTo(component: Component) {
    this._disconnect();
    this._componentAttachedTo = component;
    this._connect();
    return this;
  }

  /**
   * @deprecated renamed to .detach().
   */
  public detachFrom() {
    return this.detach();
  }

  /**
   * Detaches this Interaction from whatever component it was attached to.
   * This Interaction can be reused.
   *
   * @returns {Interaction} The calling Interaction.
   */
  public detach() {
    this._disconnect();
    this._componentAttachedTo = null;
    return this;
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

  protected _anchor(component: Component) {
    this._isAnchored = true;
  }

  protected _unanchor() {
    this._isAnchored = false;
  }

  /**
   * Translates an <svg>-coordinate-space point to Component-space coordinates.
   *
   * @param {Point} p A Point in <svg>-space coordinates.
   * @return {Point} The same location in Component-space coordinates.
   */
  protected _translateToComponentSpace(p: Point): Point {
    const origin = this._componentAttachedTo.originToRoot();
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

  private _connect() {
    if (this.enabled() && this._componentAttachedTo != null && !this._isAnchored) {
      this._componentAttachedTo.onAnchor(this._anchorCallback);
    }
  }

  private _disconnect() {
    if (this._isAnchored) {
      this._unanchor();
    }
    if (this._componentAttachedTo != null) {
      this._componentAttachedTo.offAnchor(this._anchorCallback);
    }
  }
}

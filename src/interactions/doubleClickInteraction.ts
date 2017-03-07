/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Component } from "../components/component";
import { Point } from "../core/interfaces";
import * as Dispatchers from "../dispatchers";
import * as Utils from "../utils";

import { Interaction } from "./interaction";
import { ClickCallback } from "./";

export class DoubleClick extends Interaction {

  private _mouseDispatcher: Dispatchers.Mouse;

  private _onDoubleClickCallbacks = new Utils.CallbackSet<ClickCallback>();

  private _dblClickCallback = (p: Point, event: MouseEvent) => this._handleDblClick(p, event);

  protected _anchor(component: Component) {
    super._anchor(component);

    this._mouseDispatcher = Dispatchers.Mouse.getDispatcher(<SVGElement> component.content().node());
    this._mouseDispatcher.onDblClick(this._dblClickCallback);
  }

  protected _unanchor() {
    super._unanchor();
    this._mouseDispatcher.offDblClick(this._dblClickCallback);
    this._mouseDispatcher = null;
  }

  private _handleDblClick(p: Point, event: MouseEvent) {
    const point = this._translateToComponentSpace(p);
    this._onDoubleClickCallbacks.callCallbacks(point, event);
  }

  /**
   * Adds a callback to be called when the Component is double-clicked.
   *
   * @param {ClickCallback} callback
   * @return {Interactions.DoubleClick} The calling DoubleClick Interaction.
   */
  public onDoubleClick(callback: ClickCallback) {
    this._onDoubleClickCallbacks.add(callback);
    return this;
  }

  /**
   * Removes a callback that would be called when the Component is double-clicked.
   *
   * @param {ClickCallback} callback
   * @return {Interactions.DoubleClick} The calling DoubleClick Interaction.
   */
  public offDoubleClick(callback: ClickCallback) {
    this._onDoubleClickCallbacks.delete(callback);
    return this;
  }
}

/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Component } from "../components/component";
import { Point } from "../core/interfaces";
import * as Dispatchers from "../dispatchers";
import * as Utils from "../utils";
import { Interaction } from "./interaction";

export type PointerCallback = (point: Point) => void;

export class Pointer extends Interaction {
  private _mouseDispatcher: Dispatchers.Mouse;
  private _touchDispatcher: Dispatchers.Touch;
  private _overComponent = false;
  private _pointerEnterCallbacks = new Utils.CallbackSet<PointerCallback>();
  private _pointerMoveCallbacks = new Utils.CallbackSet<PointerCallback>();
  private _pointerExitCallbacks = new Utils.CallbackSet<PointerCallback>();

  private _mouseMoveCallback = (p: Point, e: MouseEvent) => this._handleMouseEvent(p, e);
  private _touchStartCallback = (ids: number[], idToPoint: Point[], e: TouchEvent) => this._handleTouchEvent(idToPoint[ids[0]], e);

  protected _anchor(component: Component) {
    super._anchor(component);
    this._mouseDispatcher = Dispatchers.Mouse.getDispatcher(this._componentAttachedTo);
    this._mouseDispatcher.onMouseMove(this._mouseMoveCallback);

    this._touchDispatcher = Dispatchers.Touch.getDispatcher(this._componentAttachedTo);
    this._touchDispatcher.onTouchStart(this._touchStartCallback);
  }

  protected _unanchor() {
    super._unanchor();
    this._mouseDispatcher.offMouseMove(this._mouseMoveCallback);
    this._mouseDispatcher = null;

    this._touchDispatcher.offTouchStart(this._touchStartCallback);
    this._touchDispatcher = null;
  }

  private _handleMouseEvent(p: Point, e: MouseEvent) {
    const insideSVG = this._mouseDispatcher.eventInside(this._componentAttachedTo, e);
    this._handlePointerEvent(p, insideSVG);
  }

  private _handleTouchEvent(p: Point, e: TouchEvent) {
    const insideSVG = this._touchDispatcher.eventInside(this._componentAttachedTo, e);
    this._handlePointerEvent(p, insideSVG);
  }

  private _handlePointerEvent(p: Point, insideSVG: boolean) {
    const translatedP = this._translateToComponentSpace(p);
    const overComponent = this._isInsideComponent(translatedP);
    if (overComponent && insideSVG) {
      if (!this._overComponent) {
        this._pointerEnterCallbacks.callCallbacks(translatedP);
      }
      this._pointerMoveCallbacks.callCallbacks(translatedP);
    } else if (this._overComponent) {
      this._pointerExitCallbacks.callCallbacks(translatedP);
    }

    this._overComponent = overComponent && insideSVG;
  }

  /**
   * Adds a callback to be called when the pointer enters the Component.
   *
   * @param {PointerCallback} callback
   * @return {Interactions.Pointer} The calling Pointer Interaction.
   */
  public onPointerEnter(callback: PointerCallback) {
    this._pointerEnterCallbacks.add(callback);
    return this;
  }

  /**
   * Removes a callback that would be called when the pointer enters the Component.
   *
   * @param {PointerCallback} callback
   * @return {Interactions.Pointer} The calling Pointer Interaction.
   */
  public offPointerEnter(callback: PointerCallback) {
    this._pointerEnterCallbacks.delete(callback);
    return this;
  }

  /**
   * Adds a callback to be called when the pointer moves within the Component.
   *
   * @param {PointerCallback} callback
   * @return {Interactions.Pointer} The calling Pointer Interaction.
   */
  public onPointerMove(callback: PointerCallback) {
    this._pointerMoveCallbacks.add(callback);
    return this;
  }

  /**
   * Removes a callback that would be called when the pointer moves within the Component.
   *
   * @param {PointerCallback} callback
   * @return {Interactions.Pointer} The calling Pointer Interaction.
   */
  public offPointerMove(callback: PointerCallback) {
    this._pointerMoveCallbacks.delete(callback);
    return this;
  }

  /**
   * Adds a callback to be called when the pointer exits the Component.
   *
   * @param {PointerCallback} callback
   * @return {Interactions.Pointer} The calling Pointer Interaction.
   */
  public onPointerExit(callback: PointerCallback) {
    this._pointerExitCallbacks.add(callback);
    return this;
  }

  /**
   * Removes a callback that would be called when the pointer exits the Component.
   *
   * @param {PointerCallback} callback
   * @return {Interactions.Pointer} The calling Pointer Interaction.
   */
  public offPointerExit(callback: PointerCallback) {
    this._pointerExitCallbacks.delete(callback);
    return this;
  }
}

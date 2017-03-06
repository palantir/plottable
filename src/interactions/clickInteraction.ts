/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Component } from "../components/component";
import { Point } from "../core/interfaces";
import * as Dispatchers from "../dispatchers";
import * as Utils from "../utils";

import { Interaction } from "./interaction";

export type ClickCallback = (point: Point, event: MouseEvent | TouchEvent) => void;

export class Click extends Interaction {

  private _mouseDispatcher: Dispatchers.Mouse;
  private _touchDispatcher: Dispatchers.Touch;

  private _clickedDown = false;
  private _clickedPoint: Point;
  private _doubleClicking = false;

  private _onClickCallbacks = new Utils.CallbackSet<ClickCallback>();
  private _onDoubleClickCallbacks = new Utils.CallbackSet<ClickCallback>();

  /**
   * Note: we bind to mousedown, mouseup, touchstart and touchend because browsers
   * have a 300ms delay between touchstart and click to allow for scrolling cancelling etc.
   */
  private _mouseDownCallback = (p: Point) => this._handleClickDown(p);
  private _mouseUpCallback = (p: Point) => this._handleClickUp(p);
  private _dblClickCallback = (p: Point) => this._handleDblClick();

  private _touchStartCallback = (ids: number[], idToPoint: Point[]) => this._handleClickDown(idToPoint[ids[0]]);
  private _touchEndCallback = (ids: number[], idToPoint: Point[]) => this._handleClickUp(idToPoint[ids[0]]);
  private _touchCancelCallback = (ids: number[], idToPoint: Point[]) => this._clickedDown = false;

  protected _anchor(component: Component) {
    super._anchor(component);

    this._mouseDispatcher = Dispatchers.Mouse.getDispatcher(<SVGElement> component.content().node());
    this._mouseDispatcher.onMouseDown(this._mouseDownCallback);
    this._mouseDispatcher.onMouseUp(this._mouseUpCallback);
    this._mouseDispatcher.onDblClick(this._dblClickCallback);

    this._touchDispatcher = Dispatchers.Touch.getDispatcher(<SVGElement> component.content().node());
    this._touchDispatcher.onTouchStart(this._touchStartCallback);
    this._touchDispatcher.onTouchEnd(this._touchEndCallback);
    this._touchDispatcher.onTouchCancel(this._touchCancelCallback);
  }

  protected _unanchor() {
    super._unanchor();
    this._mouseDispatcher.offMouseDown(this._mouseDownCallback);
    this._mouseDispatcher.offMouseUp(this._mouseUpCallback);
    this._mouseDispatcher.offDblClick(this._dblClickCallback);
    this._mouseDispatcher = null;

    this._touchDispatcher.offTouchStart(this._touchStartCallback);
    this._touchDispatcher.offTouchEnd(this._touchEndCallback);
    this._touchDispatcher.offTouchCancel(this._touchCancelCallback);
    this._touchDispatcher = null;
  }

  private _handleClickDown(p: Point) {
    let translatedP = this._translateToComponentSpace(p);
    if (this._isInsideComponent(translatedP)) {
      this._clickedDown = true;
      this._clickedPoint = translatedP;
    }
  }

  private _handleClickUp(p: Point) {
    let translatedP = this._translateToComponentSpace(p);
    if (this._clickedDown && Click._pointsEqual(translatedP, this._clickedPoint)) {
      setTimeout(() => {
        if (!this._doubleClicking) {
          console.log("single click called");
          this._onClickCallbacks.callCallbacks(translatedP);
        }
      }, 0);
    }
    this._clickedDown = false;
  }

  private _handleDblClick() {
    this._doubleClicking = true;
    console.log("double click called");
    this._onDoubleClickCallbacks.callCallbacks(this._clickedPoint);
    setTimeout(() => this._doubleClicking = false, 0);
  }

  private static _pointsEqual(p1: Point, p2: Point) {
    return p1.x === p2.x && p1.y === p2.y;
  }

  /**
   * Adds a callback to be called when the Component is clicked.
   *
   * @param {ClickCallback} callback
   * @return {Interactions.Click} The calling Click Interaction.
   */
  public onClick(callback: ClickCallback) {
    this._onClickCallbacks.add(callback);
    return this;
  }

  /**
   * Removes a callback that would be called when the Component is clicked.
   *
   * @param {ClickCallback} callback
   * @return {Interactions.Click} The calling Click Interaction.
   */
  public offClick(callback: ClickCallback) {
    this._onClickCallbacks.delete(callback);
    return this;
  }

  /**
   * Adds a callback to be called when the Component is double-clicked.
   *
   * @param {ClickCallback} callback
   * @return {Interactions.Click} The calling Click Interaction.
   */
  public onDoubleClick(callback: ClickCallback) {
    this._onDoubleClickCallbacks.add(callback);
    return this;
  }

  /**
   * Removes a callback that would be called when the Component is double-clicked.
   *
   * @param {ClickCallback} callback
   * @return {Interactions.Click} The calling Click Interaction.
   */
  public offDoubleClick(callback: ClickCallback) {
    this._onDoubleClickCallbacks.delete(callback);
    return this;
  }
}

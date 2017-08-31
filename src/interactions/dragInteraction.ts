/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Component } from "../components/component";
import { Point } from "../core/interfaces";
import * as Dispatchers from "../dispatchers";
import * as Utils from "../utils";

import { Interaction } from "./interaction";

export type DragCallback = (start: Point, end: Point) => void;

export type MouseFilter = (e: MouseEvent) => boolean;

export class Drag extends Interaction {
  private static _DEFAULT_MOUSE_FILTER = (event: MouseEvent) => event.button === 0;

  private _dragging = false;
  private _constrainedToComponent = true;
  private _mouseDispatcher: Dispatchers.Mouse;
  /**
   * Only emit events when the mouseFilter is true for the source mouse
   * events. Use this to define custom filters (e.g. only right click,
   * require shift to be held down, etc.)
   */
  private _mouseFilter: MouseFilter = Drag._DEFAULT_MOUSE_FILTER;
  private _touchDispatcher: Dispatchers.Touch;
  private _dragOrigin: Point;
  private _dragStartCallbacks = new Utils.CallbackSet<DragCallback>();
  private _dragCallbacks = new Utils.CallbackSet<DragCallback>();
  private _dragEndCallbacks = new Utils.CallbackSet<DragCallback>();

  private _mouseDownCallback = (p: Point, e: MouseEvent) => this._startDrag(p, e);
  private _mouseMoveCallback = (p: Point, e: MouseEvent) => this._doDrag(p, e);
  private _mouseUpCallback = (p: Point, e: MouseEvent) => this._endDrag(p, e);
  private _touchStartCallback = (ids: number[], idToPoint: Point[], e: UIEvent) => this._startDrag(idToPoint[ids[0]], e);
  private _touchMoveCallback = (ids: number[], idToPoint: Point[], e: UIEvent) => this._doDrag(idToPoint[ids[0]], e);
  private _touchEndCallback = (ids: number[], idToPoint: Point[], e: UIEvent) => this._endDrag(idToPoint[ids[0]], e);

  protected _anchor(component: Component) {
    super._anchor(component);
    this._mouseDispatcher = Dispatchers.Mouse.getDispatcher(this._componentAttachedTo);
    this._mouseDispatcher.onMouseDown(this._mouseDownCallback);
    this._mouseDispatcher.onMouseMove(this._mouseMoveCallback);
    this._mouseDispatcher.onMouseUp(this._mouseUpCallback);

    this._touchDispatcher = Dispatchers.Touch.getDispatcher(this._componentAttachedTo);
    this._touchDispatcher.onTouchStart(this._touchStartCallback);
    this._touchDispatcher.onTouchMove(this._touchMoveCallback);
    this._touchDispatcher.onTouchEnd(this._touchEndCallback);
  }

  protected _unanchor() {
    super._unanchor();
    this._mouseDispatcher.offMouseDown(this._mouseDownCallback);
    this._mouseDispatcher.offMouseMove(this._mouseMoveCallback);
    this._mouseDispatcher.offMouseUp(this._mouseUpCallback);
    this._mouseDispatcher = null;

    this._touchDispatcher.offTouchStart(this._touchStartCallback);
    this._touchDispatcher.offTouchMove(this._touchMoveCallback);
    this._touchDispatcher.offTouchEnd(this._touchEndCallback);
    this._touchDispatcher = null;
  }

  private _translateAndConstrain(p: Point) {
    const translatedP = this._translateToComponentSpace(p);
    if (!this._constrainedToComponent) {
      return translatedP;
    }

    return {
      x: Utils.Math.clamp(translatedP.x, 0, this._componentAttachedTo.width()),
      y: Utils.Math.clamp(translatedP.y, 0, this._componentAttachedTo.height()),
    };
  }

  private _startDrag(point: Point, event: UIEvent) {
    if (event instanceof MouseEvent && !this._mouseFilter(event)) {
      return;
    }
    const translatedP = this._translateToComponentSpace(point);
    if (this._isInsideComponent(translatedP)) {
      event.preventDefault();
      this._dragging = true;
      this._dragOrigin = translatedP;
      this._dragStartCallbacks.callCallbacks(this._dragOrigin);
    }
  }

  private _doDrag(point: Point, event: UIEvent) {
    if (this._dragging) {
      this._dragCallbacks.callCallbacks(this._dragOrigin, this._translateAndConstrain(point));
    }
  }

  private _endDrag(point: Point, event: UIEvent) {
    if (event instanceof MouseEvent && (<MouseEvent> event).button !== 0) {
      return;
    }
    if (this._dragging) {
      this._dragging = false;
      this._dragEndCallbacks.callCallbacks(this._dragOrigin, this._translateAndConstrain(point));
    }
  }

  /**
   * Gets whether the Drag Interaction constrains Points passed to its
   * callbacks to lie inside its Component.
   *
   * If true, when the user drags outside of the Component, the closest Point
   * inside the Component will be passed to the callback instead of the actual
   * cursor position.
   *
   * @return {boolean}
   */
  public constrainedToComponent(): boolean;
  /**
   * Sets whether the Drag Interaction constrains Points passed to its
   * callbacks to lie inside its Component.
   *
   * If true, when the user drags outside of the Component, the closest Point
   * inside the Component will be passed to the callback instead of the actual
   * cursor position.
   *
   * @param {boolean}
   * @return {Interactions.Drag} The calling Drag Interaction.
   */
  public constrainedToComponent(constrainedToComponent: boolean): this;
  public constrainedToComponent(constrainedToComponent?: boolean): any {
    if (constrainedToComponent == null) {
      return this._constrainedToComponent;
    }
    this._constrainedToComponent = constrainedToComponent;
    return this;
  }

  /**
   * Gets the current Mouse Filter. Plottable implements a default Mouse Filter
   * to only Drag on a primary (left) click.
   * @returns {MouseFilter}
   */
  public mouseFilter(): MouseFilter;
  /**
   * Set the current Mouse Filter. DragInteraction will only emit events when
   * the mouseFilter evaluates to true for the source mouse events. Use this
   * to define custom filters (e.g. only right click, requires shift to be
   * held down, etc.)
   *
   * @param {MouseFilter} filter
   * @returns {this}
   */
  public mouseFilter(filter: MouseFilter): this;
  public mouseFilter(filter?: MouseFilter): any {
    if (arguments.length === 0) {
      return this._mouseFilter;
    }
    this._mouseFilter = filter;
    return this;
  }

  /**
   * Adds a callback to be called when dragging starts.
   *
   * @param {DragCallback} callback
   * @returns {Drag} The calling Drag Interaction.
   */
  public onDragStart(callback: DragCallback) {
    this._dragStartCallbacks.add(callback);
    return this;
  }

  /**
   * Removes a callback that would be called when dragging starts.
   *
   * @param {DragCallback} callback
   * @returns {Drag} The calling Drag Interaction.
   */
  public offDragStart(callback: DragCallback) {
    this._dragStartCallbacks.delete(callback);
    return this;
  }

  /**
   * Adds a callback to be called during dragging.
   *
   * @param {DragCallback} callback
   * @returns {Drag} The calling Drag Interaction.
   */
  public onDrag(callback: DragCallback) {
    this._dragCallbacks.add(callback);
    return this;
  }

  /**
   * Removes a callback that would be called during dragging.
   *
   * @param {DragCallback} callback
   * @returns {Drag} The calling Drag Interaction.
   */
  public offDrag(callback: DragCallback) {
    this._dragCallbacks.delete(callback);
    return this;
  }

  /**
   * Adds a callback to be called when dragging ends.
   *
   * @param {DragCallback} callback
   * @returns {Drag} The calling Drag Interaction.
   */
  public onDragEnd(callback: DragCallback) {
    this._dragEndCallbacks.add(callback);
    return this;
  }

  /**
   * Removes a callback that would be called when dragging ends.
   *
   * @param {DragCallback} callback
   * @returns {Drag} The calling Drag Interaction.
   */
  public offDragEnd(callback: DragCallback) {
    this._dragEndCallbacks.delete(callback);
    return this;
  }
}

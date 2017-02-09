import { IComponent } from "../components/abstractComponent";
import { Point } from "../core/interfaces";
import * as Dispatchers from "../dispatchers";
import * as Utils from "../utils";

import { Interaction } from "./interaction";

export type ClickCallback = (point: Point, event: MouseEvent | TouchEvent) => void;


export class Click extends Interaction {

  private _mouseDispatcher: Dispatchers.Mouse;
  private _touchDispatcher: Dispatchers.Touch;
  private _clickedDown = false;
  private _onClickCallbacks = new Utils.CallbackSet<ClickCallback>();

  private _mouseDownCallback = (p: Point, event: MouseEvent) => this._handleClickDown(p, event);
  private _mouseUpCallback = (p: Point, event: MouseEvent) => this._handleClickUp(p, event);

  private _touchStartCallback = (ids: number[], idToPoint: Point[], event: TouchEvent) => this._handleClickDown(idToPoint[ids[0]], event);
  private _touchEndCallback = (ids: number[], idToPoint: Point[], event: TouchEvent) => this._handleClickUp(idToPoint[ids[0]], event);
  private _touchCancelCallback = (ids: number[], idToPoint: Point[]) => this._clickedDown = false;

  protected _anchor(component: IComponent<any>) {
    super._anchor(component);

    this._mouseDispatcher = Dispatchers.Mouse.getDispatcher(component);
    this._mouseDispatcher.onMouseDown(this._mouseDownCallback);
    this._mouseDispatcher.onMouseUp(this._mouseUpCallback);

    this._touchDispatcher = Dispatchers.Touch.getDispatcher(component);
    this._touchDispatcher.onTouchStart(this._touchStartCallback);
    this._touchDispatcher.onTouchEnd(this._touchEndCallback);
    this._touchDispatcher.onTouchCancel(this._touchCancelCallback);
  }

  protected _unanchor() {
    super._unanchor();
    this._mouseDispatcher.offMouseDown(this._mouseDownCallback);
    this._mouseDispatcher.offMouseUp(this._mouseUpCallback);
    this._mouseDispatcher = null;

    this._touchDispatcher.offTouchStart(this._touchStartCallback);
    this._touchDispatcher.offTouchEnd(this._touchEndCallback);
    this._touchDispatcher.offTouchCancel(this._touchCancelCallback);
    this._touchDispatcher = null;
  }

  private _handleClickDown(p: Point, e: MouseEvent | TouchEvent) {
    let translatedPoint = this._translateToComponentSpace(p);
    if (this._isInsideComponent(translatedPoint)) {
      this._clickedDown = true;
    }
  }

  private _handleClickUp(p: Point, e: MouseEvent | TouchEvent) {
    let translatedPoint = this._translateToComponentSpace(p);
    if (this._clickedDown && this._isInsideComponent(translatedPoint)) {
      this._onClickCallbacks.callCallbacks(translatedPoint, e);
    }
    this._clickedDown = false;
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
}

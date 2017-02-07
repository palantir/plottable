/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Point } from "../core/interfaces";
import * as Utils from "../utils";

import { Dispatcher } from "./dispatcher";
import * as Dispatchers from "./";

export type TouchCallback = (ids: number[], idToPoint: { [id: number]: Point; }, event: TouchEvent) => void;

export class Touch extends Dispatcher {
  private static _DISPATCHER_KEY = "__Plottable_Dispatcher_Touch";
  private static _TOUCHSTART_EVENT_NAME = "touchstart";
  private static _TOUCHMOVE_EVENT_NAME = "touchmove";
  private static _TOUCHEND_EVENT_NAME = "touchend";
  private static _TOUCHCANCEL_EVENT_NAME = "touchcancel";
  private _translator: Utils.ClientToSVGTranslator;

  /**
   * Gets a Touch Dispatcher for the <svg> containing elem.
   * If one already exists on that <svg>, it will be returned; otherwise, a new one will be created.
   *
   * @param {SVGElement} elem
   * @return {Dispatchers.Touch}
   */
  public static getDispatcher(elem: SVGElement): Dispatchers.Touch {
    let svg = Utils.DOM.boundingSVG(elem);

    let dispatcher: Dispatchers.Touch = (<any> svg)[Touch._DISPATCHER_KEY];
    if (dispatcher == null) {
      dispatcher = new Touch(svg);
      (<any> svg)[Touch._DISPATCHER_KEY] = dispatcher;
    }
    return dispatcher;
  }

  /**
   * This constructor should not be invoked directly.
   *
   * @constructor
   * @param {SVGElement} svg The root <svg> to attach to.
   */
  constructor(svg: SVGElement) {
    super();

    this._translator = Utils.ClientToSVGTranslator.getTranslator(svg);

    this._eventToProcessingFunction[Touch._TOUCHSTART_EVENT_NAME] =
      (e: TouchEvent) => this._measureAndDispatch(e, Touch._TOUCHSTART_EVENT_NAME, "page");
    this._eventToProcessingFunction[Touch._TOUCHMOVE_EVENT_NAME] =
      (e: TouchEvent) => this._measureAndDispatch(e, Touch._TOUCHMOVE_EVENT_NAME, "page");
    this._eventToProcessingFunction[Touch._TOUCHEND_EVENT_NAME] =
      (e: TouchEvent) => this._measureAndDispatch(e, Touch._TOUCHEND_EVENT_NAME, "page");
    this._eventToProcessingFunction[Touch._TOUCHCANCEL_EVENT_NAME] =
      (e: TouchEvent) => this._measureAndDispatch(e, Touch._TOUCHCANCEL_EVENT_NAME, "page");
  }

  /**
   * Registers a callback to be called when a touch starts.
   *
   * @param {TouchCallback} callback
   * @return {Dispatchers.Touch} The calling Touch Dispatcher.
   */
  public onTouchStart(callback: TouchCallback): this {
    this._addCallbackForEvent(Touch._TOUCHSTART_EVENT_NAME, callback);
    return this;
  }

  /**
   * Removes a callback that would be called when a touch starts.
   *
   * @param {TouchCallback} callback
   * @return {Dispatchers.Touch} The calling Touch Dispatcher.
   */
  public offTouchStart(callback: TouchCallback): this {
    this._removeCallbackForEvent(Touch._TOUCHSTART_EVENT_NAME, callback);
    return this;
  }

  /**
   * Registers a callback to be called when the touch position changes.
   *
   * @param {TouchCallback} callback
   * @return {Dispatchers.Touch} The calling Touch Dispatcher.
   */
  public onTouchMove(callback: TouchCallback): this {
    this._addCallbackForEvent(Touch._TOUCHMOVE_EVENT_NAME, callback);
    return this;
  }

  /**
   * Removes a callback that would be called when the touch position changes.
   *
   * @param {TouchCallback} callback
   * @return {Dispatchers.Touch} The calling Touch Dispatcher.
   */
  public offTouchMove(callback: TouchCallback): this {
    this._removeCallbackForEvent(Touch._TOUCHMOVE_EVENT_NAME, callback);
    return this;
  }

  /**
   * Registers a callback to be called when a touch ends.
   *
   * @param {TouchCallback} callback
   * @return {Dispatchers.Touch} The calling Touch Dispatcher.
   */
  public onTouchEnd(callback: TouchCallback): this {
    this._addCallbackForEvent(Touch._TOUCHEND_EVENT_NAME, callback);
    return this;
  }

  /**
   * Removes a callback that would be called when a touch ends.
   *
   * @param {TouchCallback} callback
   * @return {Dispatchers.Touch} The calling Touch Dispatcher.
   */
  public offTouchEnd(callback: TouchCallback): this {
    this._removeCallbackForEvent(Touch._TOUCHEND_EVENT_NAME, callback);
    return this;
  }

  /**
   * Registers a callback to be called when a touch is cancelled.
   *
   * @param {TouchCallback} callback
   * @return {Dispatchers.Touch} The calling Touch Dispatcher.
   */
  public onTouchCancel(callback: TouchCallback): this {
    this._addCallbackForEvent(Touch._TOUCHCANCEL_EVENT_NAME, callback);
    return this;
  }

  /**
   * Removes a callback that would be called when a touch is cancelled.
   *
   * @param {TouchCallback} callback
   * @return {Dispatchers.Touch} The calling Touch Dispatcher.
   */
  public offTouchCancel(callback: TouchCallback): this {
    this._removeCallbackForEvent(Touch._TOUCHCANCEL_EVENT_NAME, callback);
    return this;
  }

  /**
   * Computes the Touch position from the given event, and if successful
   * calls all the callbacks in the provided callbackSet.
   */
  private _measureAndDispatch(event: TouchEvent, eventName: string, scope = "element") {
    if (scope !== "page" && scope !== "element") {
      throw new Error("Invalid scope '" + scope + "', must be 'element' or 'page'");
    }
    if (scope === "element" && !this.eventInsideSVG(event)) {
      return;
    }
    let touches = event.changedTouches;
    let touchPositions: { [id: number]: Point; } = {};
    let touchIdentifiers: number[] = [];
    for (let i = 0; i < touches.length; i++) {
      let touch = touches[i];
      let touchID = touch.identifier;
      let newTouchPosition = this._translator.computePosition(touch.clientX, touch.clientY);
      if (newTouchPosition != null) {
        touchPositions[touchID] = newTouchPosition;
        touchIdentifiers.push(touchID);
      }
    }
    ;
    if (touchIdentifiers.length > 0) {
      this._callCallbacksForEvent(eventName, touchIdentifiers, touchPositions, event);
    }
  }

  public eventInsideSVG(event: TouchEvent) {
    return this._translator.insideSVG(event);
  }
}

import { IComponent } from "../components/abstractComponent";
import { Point } from "../core/interfaces";
import * as Utils from "../utils";

import { Dispatcher } from "./dispatcher";
import * as Dispatchers from "./";

export type MouseCallback = (p: Point, event: MouseEvent) => void;

export class Mouse extends Dispatcher {
  private static _DISPATCHER_KEY = "__Plottable_Dispatcher_Mouse";
  private _translator: Utils.Translator;
  private _lastMousePosition: Point;
  private static _MOUSEOVER_EVENT_NAME = "mouseover";
  private static _MOUSEMOVE_EVENT_NAME = "mousemove";
  private static _MOUSEOUT_EVENT_NAME = "mouseout";
  private static _MOUSEDOWN_EVENT_NAME = "mousedown";
  private static _MOUSEUP_EVENT_NAME = "mouseup";
  private static _WHEEL_EVENT_NAME = "wheel";
  private static _DBLCLICK_EVENT_NAME = "dblclick";

  /**
   * Get a Mouse Dispatcher for the <svg> containing elem.
   * If one already exists on that <svg>, it will be returned; otherwise, a new one will be created.
   *
   * @param {SVGElement} elem
   * @return {Dispatchers.Mouse}
   */
  public static getDispatcher(component: IComponent<any>): Dispatchers.Mouse {
    let element = component.root().content();
    let dispatcher: Dispatchers.Mouse = (<any> element)[Mouse._DISPATCHER_KEY];
    if (dispatcher == null) {
      dispatcher = new Mouse(component);
      (<any> element)[Mouse._DISPATCHER_KEY] = dispatcher;
    }
    return dispatcher;
  }

  /**
   * This constructor not be invoked directly.
   *
   * @constructor
   * @param {SVGElement} svg The root <svg> to attach to.
   */
  private constructor(component: IComponent<any>) {
    super();

    this._translator = component.root().translator();

    this._lastMousePosition = { x: -1, y: -1 };

    let processMoveCallback = (e: MouseEvent) => this._measureAndDispatch(e, Mouse._MOUSEMOVE_EVENT_NAME, "page");
    this._eventToProcessingFunction[Mouse._MOUSEOVER_EVENT_NAME] = processMoveCallback;
    this._eventToProcessingFunction[Mouse._MOUSEMOVE_EVENT_NAME] = processMoveCallback;
    this._eventToProcessingFunction[Mouse._MOUSEOUT_EVENT_NAME] = processMoveCallback;
    this._eventToProcessingFunction[Mouse._MOUSEDOWN_EVENT_NAME] =
      (e: MouseEvent) => this._measureAndDispatch(e, Mouse._MOUSEDOWN_EVENT_NAME);
    this._eventToProcessingFunction[Mouse._MOUSEUP_EVENT_NAME] =
      (e: MouseEvent) => this._measureAndDispatch(e, Mouse._MOUSEUP_EVENT_NAME, "page");
    this._eventToProcessingFunction[Mouse._WHEEL_EVENT_NAME] =
      (e: WheelEvent) => this._measureAndDispatch(e, Mouse._WHEEL_EVENT_NAME);
    this._eventToProcessingFunction[Mouse._DBLCLICK_EVENT_NAME] =
      (e: MouseEvent) => this._measureAndDispatch(e, Mouse._DBLCLICK_EVENT_NAME);
  }

  /**
   * Registers a callback to be called when the mouse position changes.
   *
   * @param {MouseCallback} callback
   * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
   */
  public onMouseMove(callback: MouseCallback): this {
    this._addCallbackForEvent(Mouse._MOUSEMOVE_EVENT_NAME, callback);
    return this;
  }

  /**
   * Removes a callback that would be called when the mouse position changes.
   *
   * @param {MouseCallback} callback
   * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
   */

  public offMouseMove(callback: MouseCallback): this {
    this._removeCallbackForEvent(Mouse._MOUSEMOVE_EVENT_NAME, callback);
    return this;
  }

  /**
   * Registers a callback to be called when a mousedown occurs.
   *
   * @param {MouseCallback} callback
   * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
   */

  public onMouseDown(callback: MouseCallback): this {
    this._addCallbackForEvent(Mouse._MOUSEDOWN_EVENT_NAME, callback);
    return this;
  }

  /**
   * Removes a callback that would be called when a mousedown occurs.
   *
   * @param {MouseCallback} callback
   * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
   */
  public offMouseDown(callback: MouseCallback): this {
    this._removeCallbackForEvent(Mouse._MOUSEDOWN_EVENT_NAME, callback);
    return this;
  }

  /**
   * Registers a callback to be called when a mouseup occurs.
   *
   * @param {MouseCallback} callback
   * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
   */
  public onMouseUp(callback: MouseCallback): this {
    this._addCallbackForEvent(Mouse._MOUSEUP_EVENT_NAME, callback);
    return this;
  }

  /**
   * Removes a callback that would be called when a mouseup occurs.
   *
   * @param {MouseCallback} callback
   * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
   */

  public offMouseUp(callback: MouseCallback): this {
    this._removeCallbackForEvent(Mouse._MOUSEUP_EVENT_NAME, callback);
    return this;
  }

  /**
   * Registers a callback to be called when a wheel event occurs.
   *
   * @param {MouseCallback} callback
   * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
   */

  public onWheel(callback: MouseCallback): this {
    this._addCallbackForEvent(Mouse._WHEEL_EVENT_NAME, callback);
    return this;
  }

  /**
   * Removes a callback that would be called when a wheel event occurs.
   *
   * @param {MouseCallback} callback
   * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
   */
  public offWheel(callback: MouseCallback): this {
    this._removeCallbackForEvent(Mouse._WHEEL_EVENT_NAME, callback);
    return this;
  }

  /**
   * Registers a callback to be called when a dblClick occurs.
   *
   * @param {MouseCallback} callback
   * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
   */
  public onDblClick(callback: MouseCallback): this {
    this._addCallbackForEvent(Mouse._DBLCLICK_EVENT_NAME, callback);
    return this;
  }

  /**
   * Removes a callback that would be called when a dblClick occurs.
   *
   * @param {MouseCallback} callback
   * @return {Dispatchers.Mouse} The calling Mouse Dispatcher.
   */
  public offDblClick(callback: MouseCallback): this {
    this._removeCallbackForEvent(Mouse._DBLCLICK_EVENT_NAME, callback);
    return this;
  }

  /**
   * Computes the mouse position from the given event, and if successful
   * calls all the callbacks in the provided callbackSet.
   */
  private _measureAndDispatch(event: MouseEvent, eventName: string, scope = "element") {
    if (scope !== "page" && scope !== "element") {
      throw new Error("Invalid scope '" + scope + "', must be 'element' or 'page'");
    }
    if (scope === "page" || this.eventInside(event)) {
      let newMousePosition = this._translator.computePosition(event.clientX, event.clientY);
      if (newMousePosition != null) {
        this._lastMousePosition = newMousePosition;
        this._callCallbacksForEvent(eventName, this.lastMousePosition(), event);
      }
    }
  }

  public eventInsideSVG(event: MouseEvent) {
    return this.eventInside(event);
  }

  public eventInside(event: MouseEvent) {
    return this._translator.isInside(event);
  }

  /**
   * Returns the last computed mouse position in <svg> coordinate space.
   *
   * @return {Point}
   */
  public lastMousePosition(): Point {
    return this._lastMousePosition;
  }
}

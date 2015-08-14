///<reference path="../reference.ts" />

module Plottable {
export module Dispatchers {
  export type TouchCallback = (ids: number[], idToPoint: { [id: number]: Point; }, event: TouchEvent) => void;

  export class Touch extends Dispatcher {
    private static _DISPATCHER_KEY = "__Plottable_Dispatcher_Touch";
    private _translator: Utils.ClientToSVGTranslator;
    private _startCallbacks: Utils.CallbackSet<TouchCallback>;
    private _moveCallbacks: Utils.CallbackSet<TouchCallback>;
    private _endCallbacks: Utils.CallbackSet<TouchCallback>;
    private _cancelCallbacks: Utils.CallbackSet<TouchCallback>;

    /**
     * Gets a Touch Dispatcher for the <svg> containing elem.
     * If one already exists on that <svg>, it will be returned; otherwise, a new one will be created.
     *
     * @param {SVGElement} elem
     * @return {Dispatchers.Touch}
     */
    public static getDispatcher(elem: SVGElement): Dispatchers.Touch {
      let svg = Utils.DOM.boundingSVG(elem);

      let dispatcher: Touch = (<any> svg)[Touch._DISPATCHER_KEY];
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

      this._startCallbacks = new Utils.CallbackSet<TouchCallback>();
      this._moveCallbacks = new Utils.CallbackSet<TouchCallback>();
      this._endCallbacks = new Utils.CallbackSet<TouchCallback>();
      this._cancelCallbacks = new Utils.CallbackSet<TouchCallback>();
      this._callbacks = [this._moveCallbacks, this._startCallbacks, this._endCallbacks, this._cancelCallbacks];

      this._eventToCallback["touchstart"] = (e: TouchEvent) => this._measureAndDispatch(e, this._startCallbacks);
      this._eventToCallback["touchmove"] = (e: TouchEvent) => this._measureAndDispatch(e, this._moveCallbacks, "page");
      this._eventToCallback["touchend"] = (e: TouchEvent) => this._measureAndDispatch(e, this._endCallbacks, "page");
      this._eventToCallback["touchcancel"] = (e: TouchEvent) => this._measureAndDispatch(e, this._cancelCallbacks, "page");
    }

    /**
     * Registers a callback to be called when a touch starts.
     *
     * @param {TouchCallback} callback
     * @return {Dispatchers.Touch} The calling Touch Dispatcher.
     */
    public onTouchStart(callback: TouchCallback): Dispatchers.Touch {
      this._setCallback(this._startCallbacks, callback);
      return this;
    }

    /**
     * Removes a callback that would be called when a touch starts.
     *
     * @param {TouchCallback} callback
     * @return {Dispatchers.Touch} The calling Touch Dispatcher.
     */
    public offTouchStart(callback: TouchCallback): Dispatchers.Touch {
      this._unsetCallback(this._startCallbacks, callback);
      return this;
    }

    /**
     * Registers a callback to be called when the touch position changes.
     *
     * @param {TouchCallback} callback
     * @return {Dispatchers.Touch} The calling Touch Dispatcher.
     */
    public onTouchMove(callback: TouchCallback): Dispatchers.Touch {
      this._setCallback(this._moveCallbacks, callback);
      return this;
    }

    /**
     * Removes a callback that would be called when the touch position changes.
     *
     * @param {TouchCallback} callback
     * @return {Dispatchers.Touch} The calling Touch Dispatcher.
     */
    public offTouchMove(callback: TouchCallback): Dispatchers.Touch {
      this._unsetCallback(this._moveCallbacks, callback);
      return this;
    }

    /**
     * Registers a callback to be called when a touch ends.
     *
     * @param {TouchCallback} callback
     * @return {Dispatchers.Touch} The calling Touch Dispatcher.
     */
    public onTouchEnd(callback: TouchCallback): Dispatchers.Touch {
      this._setCallback(this._endCallbacks, callback);
      return this;
    }

    /**
     * Removes a callback that would be called when a touch ends.
     *
     * @param {TouchCallback} callback
     * @return {Dispatchers.Touch} The calling Touch Dispatcher.
     */
    public offTouchEnd(callback: TouchCallback): Dispatchers.Touch {
      this._unsetCallback(this._endCallbacks, callback);
      return this;
    }

    /**
     * Registers a callback to be called when a touch is cancelled.
     *
     * @param {TouchCallback} callback
     * @return {Dispatchers.Touch} The calling Touch Dispatcher.
     */
    public onTouchCancel(callback: TouchCallback): Dispatchers.Touch {
      this._setCallback(this._cancelCallbacks, callback);
      return this;
    }

    /**
     * Removes a callback that would be called when a touch is cancelled.
     *
     * @param {TouchCallback} callback
     * @return {Dispatchers.Touch} The calling Touch Dispatcher.
     */
    public offTouchCancel(callback: TouchCallback): Dispatchers.Touch {
      this._unsetCallback(this._cancelCallbacks, callback);
      return this;
    }

    /**
     * Computes the Touch position from the given event, and if successful
     * calls all the callbacks in the provided callbackSet.
     */
    private _measureAndDispatch(event: TouchEvent, callbackSet: Utils.CallbackSet<TouchCallback>, scope = "element") {
      if (scope !== "page" && scope !== "element") {
        throw new Error("Invalid scope '" + scope + "', must be 'element' or 'page'");
      }
      if (scope === "element" && !this._translator.insideSVG(event)) {
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
      };
      if (touchIdentifiers.length > 0) {
        callbackSet.callCallbacks(touchIdentifiers, touchPositions, event);
      }
    }
  }
}
}

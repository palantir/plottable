///<reference path="../reference.ts" />

module Plottable {
export module Dispatchers {
  export type TouchCallback = (ids: number[], idToPoint: { [id: number]: Point; }, event: TouchEvent) => any;

  export class Touch extends Dispatcher {
    /**
     * Dispatcher.Touch calls callbacks when touch events occur.
     * It reports the (x, y) position of the first Touch relative to the
     * <svg> it is attached to.
     */

    private static _DISPATCHER_KEY = "__Plottable_Dispatcher_Touch";
    private translator: Utils.ClientToSVGTranslator;
    private _startCallbacks: Utils.CallbackSet<TouchCallback>;
    private _moveCallbacks: Utils.CallbackSet<TouchCallback>;
    private _endCallbacks: Utils.CallbackSet<TouchCallback>;
    private _cancelCallbacks: Utils.CallbackSet<TouchCallback>;

    /**
     * Get a Dispatcher.Touch for the <svg> containing elem. If one already exists
     * on that <svg>, it will be returned; otherwise, a new one will be created.
     *
     * @param {SVGElement} elem A svg DOM element.
     * @return {Dispatcher.Touch} A Dispatcher.Touch
     */
    public static getDispatcher(elem: SVGElement): Dispatchers.Touch {
      var svg = Utils.DOM.getBoundingSVG(elem);

      var dispatcher: Touch = (<any> svg)[Touch._DISPATCHER_KEY];
      if (dispatcher == null) {
        dispatcher = new Touch(svg);
        (<any> svg)[Touch._DISPATCHER_KEY] = dispatcher;
      }
      return dispatcher;
    }

    /**
     * Creates a Dispatcher.Touch.
     * This constructor should not be invoked directly under most circumstances.
     *
     * @param {SVGElement} svg The root <svg> element to attach to.
     */
    constructor(svg: SVGElement) {
      super();

      this.translator = Utils.ClientToSVGTranslator.getTranslator(svg);

      this._startCallbacks = new Utils.CallbackSet<TouchCallback>();
      this._moveCallbacks = new Utils.CallbackSet<TouchCallback>();
      this._endCallbacks = new Utils.CallbackSet<TouchCallback>();
      this._cancelCallbacks = new Utils.CallbackSet<TouchCallback>();
      this._callbacks = [this._moveCallbacks, this._startCallbacks, this._endCallbacks, this._cancelCallbacks];

      this._event2Callback["touchstart"] = (e: TouchEvent) => this._measureAndBroadcast(e, this._startCallbacks);
      this._event2Callback["touchmove"] = (e: TouchEvent) => this._measureAndBroadcast(e, this._moveCallbacks);
      this._event2Callback["touchend"] = (e: TouchEvent) => this._measureAndBroadcast(e, this._endCallbacks);
      this._event2Callback["touchcancel"] = (e: TouchEvent) => this._measureAndBroadcast(e, this._cancelCallbacks);
    }

    /**
     * Registers a callback to be called whenever a touch starts.
     *
     * @param {TouchCallback} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space. Pass `null`
     *                                     to remove a callback.
     * @return {Dispatcher.Touch} The calling Dispatcher.Touch.
     */
    public onTouchStart(callback: TouchCallback): Dispatchers.Touch {
      this.setCallback(this._startCallbacks, callback);
      return this;
    }

    /**
     * Removes the callback to be called whenever a touch starts.
     *
     * @param {TouchCallback} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space. Pass `null`
     *                                     to remove a callback.
     * @return {Dispatcher.Touch} The calling Dispatcher.Touch.
     */
    public offTouchStart(callback: TouchCallback): Dispatchers.Touch {
      this.unsetCallback(this._startCallbacks, callback);
      return this;
    }

    /**
     * Registers a callback to be called whenever the touch position changes.
     *
     * @param {TouchCallback} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space. Pass `null`
     *                                     to remove a callback.
     * @return {Dispatcher.Touch} The calling Dispatcher.Touch.
     */
    public onTouchMove(callback: TouchCallback): Dispatchers.Touch {
      this.setCallback(this._moveCallbacks, callback);
      return this;
    }

    /**
     * Removes the callback to be called whenever the touch position changes.
     *
     * @param {TouchCallback} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space. Pass `null`
     *                                     to remove a callback.
     * @return {Dispatcher.Touch} The calling Dispatcher.Touch.
     */
    public offTouchMove(callback: TouchCallback): Dispatchers.Touch {
      this.unsetCallback(this._moveCallbacks, callback);
      return this;
    }

    /**
     * Registers a callback to be called whenever a touch ends.
     *
     * @param {TouchCallback} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space. Pass `null`
     *                                     to remove a callback.
     * @return {Dispatcher.Touch} The calling Dispatcher.Touch.
     */
    public onTouchEnd(callback: TouchCallback): Dispatchers.Touch {
      this.setCallback(this._endCallbacks, callback);
      return this;
    }

    /**
     * Removes the callback to be called whenever a touch ends.
     *
     * @param {TouchCallback} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space. Pass `null`
     *                                     to remove a callback.
     * @return {Dispatcher.Touch} The calling Dispatcher.Touch.
     */
    public offTouchEnd(callback: TouchCallback): Dispatchers.Touch {
      this.unsetCallback(this._endCallbacks, callback);
      return this;
    }

    /**
     * Registers a callback to be called whenever a touch is cancelled.
     *
     * @param {TouchCallback} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space. Pass `null`
     *                                     to remove a callback.
     * @return {Dispatcher.Touch} The calling Dispatcher.Touch.
     */
    public onTouchCancel(callback: TouchCallback): Dispatchers.Touch {
      this.setCallback(this._cancelCallbacks, callback);
      return this;
    }

    /**
     * Removes the callback to be called whenever a touch is cancelled.
     *
     * @param {TouchCallback} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space. Pass `null`
     *                                     to remove a callback.
     * @return {Dispatcher.Touch} The calling Dispatcher.Touch.
     */
    public offTouchCancel(callback: TouchCallback): Dispatchers.Touch {
      this.unsetCallback(this._cancelCallbacks, callback);
      return this;
    }

    /**
     * Computes the Touch position from the given event, and if successful
     * calls broadcast() on the supplied Broadcaster.
     */
    private _measureAndBroadcast(event: TouchEvent, callbackSet: Utils.CallbackSet<TouchCallback>) {
      var touches = event.changedTouches;
      var touchPositions: { [id: number]: Point; } = {};
      var touchIdentifiers: number[] = [];
      for (var i = 0; i < touches.length; i++) {
        var touch = touches[i];
        var touchID = touch.identifier;
        var newTouchPosition = this.translator.computePosition(touch.clientX, touch.clientY);
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

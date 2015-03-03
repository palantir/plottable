///<reference path="../reference.ts" />

module Plottable {
export module Dispatcher {
  export type TouchCallback = (p: Point, e: TouchEvent) => any;

  export class Touch extends AbstractDispatcher {
    /**
     * Dispatcher.Touch calls callbacks when touch events occur.
     * It reports the (x, y) position of the first Touch relative to the
     * <svg> it is attached to.
     */

    private static _DISPATCHER_KEY = "__Plottable_Dispatcher_Touch";
    private translator: _Util.ClientToSVGTranslator;
    private _lastTouchPosition: Point;
    private _startBroadcaster: Core.Broadcaster<Dispatcher.Touch>;
    private _moveBroadcaster: Core.Broadcaster<Dispatcher.Touch>;
    private _endBroadcaster: Core.Broadcaster<Dispatcher.Touch>;
    private _processStartCallback: (e: TouchEvent) => any;
    private _processMoveCallback: (e: TouchEvent) => any;
    private _processEndCallback: (e: TouchEvent) => any;

    /**
     * Get a Dispatcher.Touch for the <svg> containing elem. If one already exists
     * on that <svg>, it will be returned; otherwise, a new one will be created.
     *
     * @param {SVGElement} elem A svg DOM element.
     * @return {Dispatcher.Touch} A Dispatcher.Touch
     */
    public static getDispatcher(elem: SVGElement): Dispatcher.Touch {
      var svg = _Util.DOM.getBoundingSVG(elem);

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

      this.translator = _Util.ClientToSVGTranslator.getTranslator(svg);

      this._lastTouchPosition = { x: -1, y: -1 };
      this._moveBroadcaster = new Core.Broadcaster(this);
      this._processMoveCallback = (e: TouchEvent) => this._measureAndBroadcast(e, this._moveBroadcaster);
      this._event2Callback["touchmove"] = this._processMoveCallback;

      this._startBroadcaster = new Core.Broadcaster(this);
      this._processStartCallback = (e: TouchEvent) => this._measureAndBroadcast(e, this._startBroadcaster);
      this._event2Callback["touchstart"] = this._processStartCallback;

      this._endBroadcaster = new Core.Broadcaster(this);
      this._processEndCallback = (e: TouchEvent) => this._measureAndBroadcast(e, this._endBroadcaster);
      this._event2Callback["touchend"] = this._processEndCallback;

      this._broadcasters = [this._moveBroadcaster, this._startBroadcaster, this._endBroadcaster];
    }

    protected _getWrappedCallback(callback: Function): Core.BroadcasterCallback<Dispatcher.Touch> {
      return (td: Dispatcher.Touch, p: Point, e: MouseEvent) => callback(p, e);
    }

    /**
     * Registers a callback to be called whenever a touch starts,
     * or removes the callback if `null` is passed as the callback.
     *
     * @param {any} key The key associated with the callback.
     *                  Key uniqueness is determined by deep equality.
     * @param {TouchCallback} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space. Pass `null`
     *                                     to remove a callback.
     * @return {Dispatcher.Touch} The calling Dispatcher.Touch.
     */
    public onTouchStart(key: any, callback: TouchCallback): Dispatcher.Touch {
      this._setCallback(this._startBroadcaster, key, callback);
      return this;
    }

    /**
     * Registers a callback to be called whenever the touch position changes,
     * or removes the callback if `null` is passed as the callback.
     *
     * @param {any} key The key associated with the callback.
     *                  Key uniqueness is determined by deep equality.
     * @param {TouchCallback} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space. Pass `null`
     *                                     to remove a callback.
     * @return {Dispatcher.Touch} The calling Dispatcher.Touch.
     */
    public onTouchMove(key: any, callback: TouchCallback): Dispatcher.Touch {
      this._setCallback(this._moveBroadcaster, key, callback);
      return this;
    }

    /**
     * Registers a callback to be called whenever a touch ends,
     * or removes the callback if `null` is passed as the callback.
     *
     * @param {any} key The key associated with the callback.
     *                  Key uniqueness is determined by deep equality.
     * @param {TouchCallback} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space. Pass `null`
     *                                     to remove a callback.
     * @return {Dispatcher.Touch} The calling Dispatcher.Touch.
     */
    public onTouchEnd(key: any, callback: TouchCallback): Dispatcher.Touch {
      this._setCallback(this._endBroadcaster, key, callback);
      return this;
    }

    /**
     * Computes the Touch position from the given event, and if successful
     * calls broadcast() on the supplied Broadcaster.
     */
    private _measureAndBroadcast(e: TouchEvent, b: Core.Broadcaster<Dispatcher.Touch>) {
      var touch = e.changedTouches[0];
      var newTouchPosition = this.translator.computePosition(touch.clientX, touch.clientY);
      if (newTouchPosition != null) {
        this._lastTouchPosition = newTouchPosition;
        b.broadcast(this.getLastTouchPosition(), e);
      }
    }

    /**
     * Returns the last computed Touch position.
     *
     * @return {Point} The last known Touch position in <svg> coordinate space.
     */
    public getLastTouchPosition() {
      return this._lastTouchPosition;
    }
  }
}
}

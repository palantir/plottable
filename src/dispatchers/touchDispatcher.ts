///<reference path="../reference.ts" />

module Plottable {
export module Dispatchers {
  export type TouchCallback = (ids: number[], idToPoint: { [id: number]: Point; }, e: TouchEvent) => any;
  /**
   * Dispatcher.Touch calls callbacks when touch events occur.
   * It reports the (x, y) position of the first Touch relative to the
   * <svg> it is attached to.
   */
  export class Touch extends Dispatcher {
    private static DISPATCHER_KEY = "__Plottable_Dispatcher_Touch";

    private endBroadcaster: Core.Broadcaster<Dispatchers.Touch>;
    private moveBroadcaster: Core.Broadcaster<Dispatchers.Touch>;
    private startBroadcaster: Core.Broadcaster<Dispatchers.Touch>;
    private translator: Utils.ClientToSVGTranslator;

    /**
     * Creates a Dispatcher.Touch.
     * This constructor should not be invoked directly under most circumstances.
     *
     * @param {SVGElement} svg The root <svg> element to attach to.
     */
    constructor(svg: SVGElement) {
      super();

      this.translator = Utils.ClientToSVGTranslator.getTranslator(svg);

      this.startBroadcaster = new Core.Broadcaster(this);
      this.eventCallbacks["touchstart"] = (e: TouchEvent) => this.measureAndBroadcast(e, this.startBroadcaster);

      this.moveBroadcaster = new Core.Broadcaster(this);
      this.eventCallbacks["touchmove"] = (e: TouchEvent) => this.measureAndBroadcast(e, this.moveBroadcaster);

      this.endBroadcaster = new Core.Broadcaster(this);
      this.eventCallbacks["touchend"] = (e: TouchEvent) => this.measureAndBroadcast(e, this.endBroadcaster);

      this.broadcasters = [this.moveBroadcaster, this.startBroadcaster, this.endBroadcaster];
    }

    /**
     * Get a Dispatcher.Touch for the <svg> containing elem. If one already exists
     * on that <svg>, it will be returned; otherwise, a new one will be created.
     *
     * @param {SVGElement} elem A svg DOM element.
     * @return {Dispatcher.Touch} A Dispatcher.Touch
     */
    public static getDispatcher(elem: SVGElement): Dispatchers.Touch {
      var svg = Utils.DOM.getBoundingSVG(elem);

      var dispatcher: Touch = (<any> svg)[Touch.DISPATCHER_KEY];
      if (dispatcher == null) {
        dispatcher = new Touch(svg);
        (<any> svg)[Touch.DISPATCHER_KEY] = dispatcher;
      }
      return dispatcher;
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
    public onTouchEnd(key: any, callback: TouchCallback): Dispatchers.Touch {
      this.setCallback(this.endBroadcaster, key, callback);
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
    public onTouchMove(key: any, callback: TouchCallback): Dispatchers.Touch {
      this.setCallback(this.moveBroadcaster, key, callback);
      return this;
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
    public onTouchStart(key: any, callback: TouchCallback): Dispatchers.Touch {
      this.setCallback(this.startBroadcaster, key, callback);
      return this;
    }

    protected getWrappedCallback(callback: Function): Core.BroadcasterCallback<Dispatchers.Touch> {
      return (td: Dispatchers.Touch, ids: number[], idToPoint: { [id: number]: Point; }, e: MouseEvent) => callback(ids, idToPoint, e);
    }

    /**
     * Computes the Touch position from the given event, and if successful
     * calls broadcast() on the supplied Broadcaster.
     */
    private measureAndBroadcast(e: TouchEvent, b: Core.Broadcaster<Dispatchers.Touch>) {
      var touches = e.changedTouches;
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
        b.broadcast(touchIdentifiers, touchPositions, e);
      }
    }
  }
}
}

///<reference path="../reference.ts" />

module Plottable {
export module Dispatchers {
  export type MouseCallback = (p: Point, e: MouseEvent) => any;

  export class Mouse extends AbstractDispatcher {
    private static _DISPATCHER_KEY = "__Plottable_Dispatcher_Mouse";
    private translator: Utils.ClientToSVGTranslator;
    private _lastMousePosition: Point;
    private _moveBroadcaster: Core.Broadcaster<Dispatchers.Mouse>;
    private _downBroadcaster: Core.Broadcaster<Dispatchers.Mouse>;
    private _upBroadcaster: Core.Broadcaster<Dispatchers.Mouse>;
    private _wheelBroadcaster: Core.Broadcaster<Dispatchers.Mouse>;
    private _dblClickBroadcaster: Core.Broadcaster<Dispatchers.Mouse>;

    /**
     * Get a Dispatcher.Mouse for the <svg> containing elem. If one already exists
     * on that <svg>, it will be returned; otherwise, a new one will be created.
     *
     * @param {SVGElement} elem A svg DOM element.
     * @return {Dispatcher.Mouse} A Dispatcher.Mouse
     */
    public static getDispatcher(elem: SVGElement): Dispatchers.Mouse {
      var svg = Utils.DOM.getBoundingSVG(elem);

      var dispatcher: Mouse = (<any> svg)[Mouse._DISPATCHER_KEY];
      if (dispatcher == null) {
        dispatcher = new Mouse(svg);
        (<any> svg)[Mouse._DISPATCHER_KEY] = dispatcher;
      }
      return dispatcher;
    }

    /**
     * Creates a Dispatcher.Mouse.
     * This constructor not be invoked directly under most circumstances.
     *
     * @param {SVGElement} svg The root <svg> element to attach to.
     */
    constructor(svg: SVGElement) {
      super();

      this.translator = Utils.ClientToSVGTranslator.getTranslator(svg);

      this._lastMousePosition = { x: -1, y: -1 };

      this._moveBroadcaster = new Core.Broadcaster(this);
      var processMoveCallback = (e: MouseEvent) => this._measureAndBroadcast(e, this._moveBroadcaster);
      this._event2Callback["mouseover"] = processMoveCallback;
      this._event2Callback["mousemove"] = processMoveCallback;
      this._event2Callback["mouseout"] = processMoveCallback;

      this._downBroadcaster = new Core.Broadcaster(this);
      this._event2Callback["mousedown"] = (e: MouseEvent) => this._measureAndBroadcast(e, this._downBroadcaster);

      this._upBroadcaster = new Core.Broadcaster(this);
      this._event2Callback["mouseup"] = (e: MouseEvent) => this._measureAndBroadcast(e, this._upBroadcaster);

      this._wheelBroadcaster = new Core.Broadcaster(this);
      this._event2Callback["wheel"] = (e: WheelEvent) => this._measureAndBroadcast(e, this._wheelBroadcaster);

      this._dblClickBroadcaster = new Core.Broadcaster(this);
      this._event2Callback["dblclick"] = (e: MouseEvent) => this._measureAndBroadcast(e, this._dblClickBroadcaster);

      this._broadcasters = [this._moveBroadcaster, this._downBroadcaster, this._upBroadcaster, this._wheelBroadcaster,
                            this._dblClickBroadcaster];
    }

    protected _getWrappedCallback(callback: Function): Core.BroadcasterCallback<Dispatchers.Mouse> {
      return (md: Dispatchers.Mouse, p: Point, e: MouseEvent) => callback(p, e);
    }

    /**
     * Registers a callback to be called whenever the mouse position changes,
     * or removes the callback if `null` is passed as the callback.
     *
     * @param {any} key The key associated with the callback.
     *                  Key uniqueness is determined by deep equality.
     * @param {(p: Point) => any} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space. Pass `null`
     *                                     to remove a callback.
     * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
     */
    public onMouseMove(key: any, callback: MouseCallback): Dispatchers.Mouse {
      this._setCallback(this._moveBroadcaster, key, callback);
      return this;
    }

    /**
     * Registers a callback to be called whenever a mousedown occurs,
     * or removes the callback if `null` is passed as the callback.
     *
     * @param {any} key The key associated with the callback.
     *                  Key uniqueness is determined by deep equality.
     * @param {(p: Point) => any} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space. Pass `null`
     *                                     to remove a callback.
     * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
     */
    public onMouseDown(key: any, callback: MouseCallback): Dispatchers.Mouse {
      this._setCallback(this._downBroadcaster, key, callback);
      return this;
    }

    /**
     * Registers a callback to be called whenever a mouseup occurs,
     * or removes the callback if `null` is passed as the callback.
     *
     * @param {any} key The key associated with the callback.
     *                  Key uniqueness is determined by deep equality.
     * @param {(p: Point) => any} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space. Pass `null`
     *                                     to remove a callback.
     * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
     */
    public onMouseUp(key: any, callback: MouseCallback): Dispatchers.Mouse {
      this._setCallback(this._upBroadcaster, key, callback);
      return this;
    }

    /**
     * Registers a callback to be called whenever a wheel occurs,
     * or removes the callback if `null` is passed as the callback.
     *
     * @param {any} key The key associated with the callback.
     *                  Key uniqueness is determined by deep equality.
     * @param {MouseCallback} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space.
     *                                     Pass `null` to remove a callback.
     * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
     */
    public onWheel(key: any, callback: MouseCallback): Dispatchers.Mouse {
      this._setCallback(this._wheelBroadcaster, key, callback);
      return this;
    }

    /**
     * Registers a callback to be called whenever a dblClick occurs,
     * or removes the callback if `null` is passed as the callback.
     *
     * @param {any} key The key associated with the callback.
     *                  Key uniqueness is determined by deep equality.
     * @param {MouseCallback} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space.
     *                                     Pass `null` to remove a callback.
     * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
     */
    public onDblClick(key: any, callback: MouseCallback): Dispatchers.Mouse {
      this._setCallback(this._dblClickBroadcaster, key, callback);
      return this;
    }

    /**
     * Computes the mouse position from the given event, and if successful
     * calls broadcast() on the supplied Broadcaster.
     */
    private _measureAndBroadcast(e: MouseEvent, b: Core.Broadcaster<Dispatchers.Mouse>) {
      var newMousePosition = this.translator.computePosition(e.clientX, e.clientY);
      if (newMousePosition != null) {
        this._lastMousePosition = newMousePosition;
        b.broadcast(this.getLastMousePosition(), e);
      }
    }

    /**
     * Returns the last computed mouse position.
     *
     * @return {Point} The last known mouse position in <svg> coordinate space.
     */
    public getLastMousePosition() {
      return this._lastMousePosition;
    }
  }
}
}

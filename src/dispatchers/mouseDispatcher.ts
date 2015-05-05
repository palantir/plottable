///<reference path="../reference.ts" />

module Plottable {
export module Dispatchers {
  export type MouseCallback = (p: Point, event: MouseEvent) => any;

  export class Mouse extends Dispatcher {
    private static _DISPATCHER_KEY = "__Plottable_Dispatcher_Mouse";
    private translator: Utils.ClientToSVGTranslator;
    private _lastMousePosition: Point;

    private _moveCallbacks: Utils.CallbackSet<MouseCallback>;
    private _downCallbacks: Utils.CallbackSet<MouseCallback>;
    private _upCallbacks: Utils.CallbackSet<MouseCallback>;
    private _wheelCallbacks: Utils.CallbackSet<MouseCallback>;
    private _dblClickCallbacks: Utils.CallbackSet<MouseCallback>;

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

      this._moveCallbacks = new Plottable.Utils.CallbackSet<MouseCallback>();
      this._downCallbacks = new Plottable.Utils.CallbackSet<MouseCallback>();
      this._upCallbacks = new Plottable.Utils.CallbackSet<MouseCallback>();
      this._wheelCallbacks = new Plottable.Utils.CallbackSet<MouseCallback>();
      this._dblClickCallbacks = new Plottable.Utils.CallbackSet<MouseCallback>();
      this._callbacks = [this._moveCallbacks, this._downCallbacks, this._upCallbacks, this._wheelCallbacks,
                         this._dblClickCallbacks];

      var processMoveCallback = (e: MouseEvent) => this._measureAndDispatch(e, this._moveCallbacks);
      this._event2Callback["mouseover"] = processMoveCallback;
      this._event2Callback["mousemove"] = processMoveCallback;
      this._event2Callback["mouseout"] = processMoveCallback;
      this._event2Callback["mousedown"] = (e: MouseEvent) => this._measureAndDispatch(e, this._downCallbacks);
      this._event2Callback["mouseup"] = (e: MouseEvent) => this._measureAndDispatch(e, this._upCallbacks);
      this._event2Callback["wheel"] = (e: WheelEvent) => this._measureAndDispatch(e, this._wheelCallbacks);
      this._event2Callback["dblclick"] = (e: MouseEvent) => this._measureAndDispatch(e, this._dblClickCallbacks);
    }

    /**
     * Registers a callback to be called whenever the mouse position changes,
     *
     * @param {(p: Point) => any} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space. Pass `null`
     *                                     to remove a callback.
     * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
     */
    public onMouseMove(callback: MouseCallback): Dispatchers.Mouse {
      this.setCallback(this._moveCallbacks, callback);
      return this;
    }

    /**
     * Registers the callback to be called whenever the mouse position changes,
     *
     * @param {(p: Point) => any} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space. Pass `null`
     *                                     to remove a callback.
     * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
     */
    public offMouseMove(callback: MouseCallback): Dispatchers.Mouse {
      this.unsetCallback(this._moveCallbacks, callback);
      return this;
    }

    /**
     * Registers a callback to be called whenever a mousedown occurs.
     *
     * @param {(p: Point) => any} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space. Pass `null`
     *                                     to remove a callback.
     * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
     */
    public onMouseDown(callback: MouseCallback): Dispatchers.Mouse {
      this.setCallback(this._downCallbacks, callback);
      return this;
    }

    /**
     * Registers the callback to be called whenever a mousedown occurs.
     *
     * @param {(p: Point) => any} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space. Pass `null`
     *                                     to remove a callback.
     * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
     */
    public offMouseDown(callback: MouseCallback): Dispatchers.Mouse {
      this.unsetCallback(this._downCallbacks, callback);
      return this;
    }

    /**
     * Registers a callback to be called whenever a mouseup occurs.
     *
     * @param {(p: Point) => any} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space. Pass `null`
     *                                     to remove a callback.
     * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
     */
    public onMouseUp(callback: MouseCallback): Dispatchers.Mouse {
      this.setCallback(this._upCallbacks, callback);
      return this;
    }

    /**
     * Registers the callback to be called whenever a mouseup occurs.
     *
     * @param {(p: Point) => any} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space. Pass `null`
     *                                     to remove a callback.
     * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
     */
    public offMouseUp(callback: MouseCallback): Dispatchers.Mouse {
      this.unsetCallback(this._upCallbacks, callback);
      return this;
    }

    /**
     * Registers a callback to be called whenever a wheel occurs.
     *
     * @param {MouseCallback} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space.
     *                                     Pass `null` to remove a callback.
     * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
     */
    public onWheel(callback: MouseCallback): Dispatchers.Mouse {
      this.setCallback(this._wheelCallbacks, callback);
      return this;
    }

    /**
     * Registers the callback to be called whenever a wheel occurs.
     *
     * @param {MouseCallback} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space.
     *                                     Pass `null` to remove a callback.
     * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
     */
    public offWheel(callback: MouseCallback): Dispatchers.Mouse {
      this.unsetCallback(this._wheelCallbacks, callback);
      return this;
    }

    /**
     * Registers a callback to be called whenever a dblClick occurs.
     *
     * @param {MouseCallback} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space.
     *                                     Pass `null` to remove a callback.
     * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
     */
    public onDblClick(callback: MouseCallback): Dispatchers.Mouse {
      this.setCallback(this._dblClickCallbacks, callback);
      return this;
    }

    /**
     * Registers the callback to be called whenever a dblClick occurs.
     *
     * @param {MouseCallback} callback A callback that takes the pixel position
     *                                     in svg-coordinate-space.
     *                                     Pass `null` to remove a callback.
     * @return {Dispatcher.Mouse} The calling Dispatcher.Mouse.
     */
    public offDblClick(callback: MouseCallback): Dispatchers.Mouse {
      this.unsetCallback(this._dblClickCallbacks, callback);
      return this;
    }

    /**
     * Computes the mouse position from the given event, and if successful
     * calls all the callbacks in the provided callbackSet.
     */
    private _measureAndDispatch(event: MouseEvent, callbackSet: Utils.CallbackSet<MouseCallback>) {
      var newMousePosition = this.translator.computePosition(event.clientX, event.clientY);
      if (newMousePosition != null) {
        this._lastMousePosition = newMousePosition;
        callbackSet.callCallbacks(this.getLastMousePosition(), event);
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

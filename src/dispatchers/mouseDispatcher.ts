///<reference path="../reference.ts" />

module Plottable {
export module Dispatcher {
  export class Mouse {
    private static _DISPATCHER_KEY = "__Plottable_Dispatcher_Mouse";
    private _connected = false;
    private _svg: SVGElement;
    private _measureRect: SVGElement;
    private _lastMousePosition: Point;
    private _moveBroadcaster: Core.Broadcaster<Dispatcher.Mouse>;
    private _processMoveCallback = (e: MouseEvent) => this._processMoveEvent(e);

    /**
     * Get a Dispatcher.Mouse for the <svg> containing elem. If one already exists
     * on that <svg>, it will be returned; otherwise, a new one will be created.
     *
     * @param {SVGElement} elem A svg DOM element.
     * @return {Dispatcher.Mouse} A Dispatcher.Mouse
     */
    public static getDispatcher(elem: SVGElement): Dispatcher.Mouse {
      var svg = _Util.DOM.getBoundingSVG(elem);

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
      this._svg = svg;
      this._measureRect = <SVGElement> <any>document.createElementNS(svg.namespaceURI, "rect");
      this._measureRect.setAttribute("class", "measure-rect");
      this._measureRect.setAttribute("style", "opacity: 0;");
      this._measureRect.setAttribute("width", "1");
      this._measureRect.setAttribute("height", "1");
      this._svg.appendChild(this._measureRect);

      this._lastMousePosition = { x: -1, y: -1 };
      this._moveBroadcaster = new Core.Broadcaster(this);
    }

    private _connect() {
      if (!this._connected) {
        document.addEventListener("mouseover", this._processMoveCallback);
        document.addEventListener("mousemove", this._processMoveCallback);
        document.addEventListener("mouseout", this._processMoveCallback);
        this._connected = true;
      }
    }

    private _disconnect() {
      if (this._connected &&
          this._moveBroadcaster.getListenerKeys().length === 0) {
        document.removeEventListener("mouseover", this._processMoveCallback);
        document.removeEventListener("mousemove", this._processMoveCallback);
        document.removeEventListener("mouseout", this._processMoveCallback);
        this._connected = false;
      }
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
    public onMouseMove(key: any, callback: (p: Point) => any): Mouse {
      if (callback === null) { // remove listener if callback is null
        this._moveBroadcaster.deregisterListener(key);
        this._disconnect();
      } else {
        this._connect();
        this._moveBroadcaster.registerListener(key, () => { callback(this.getLastMousePosition()); });
      }
      return this;
    }

    private _processMoveEvent(e: MouseEvent) {
      var newMousePosition = this._computeMousePosition(e.clientX, e.clientY);
      if (newMousePosition.x == null || newMousePosition.y == null) {
        return; // couldn't measure
      }
      this._lastMousePosition = newMousePosition;
      this._moveBroadcaster.broadcast();
    }

    /**
     * Computes the mouse position relative to the <svg> in svg-coordinate-space.
     */
    private _computeMousePosition(clientX: number, clientY: number) {
      // get the origin
      this._measureRect.setAttribute("x", "0");
      this._measureRect.setAttribute("y", "0");
      var mrBCR = this._measureRect.getBoundingClientRect();
      var origin = { x: mrBCR.left, y: mrBCR.top };

      // calculate the scale
      var sampleDistance = 100;
      this._measureRect.setAttribute("x", String(sampleDistance));
      this._measureRect.setAttribute("y", String(sampleDistance));
      mrBCR = this._measureRect.getBoundingClientRect();
      var testPoint = { x: mrBCR.left, y: mrBCR.top };

      // invalid measurements -- SVG might not be in the DOM
      if (origin.x === testPoint.x || origin.y === testPoint.y) {
        return { x: null, y: null };
      }

      var scaleX = (testPoint.x - origin.x) / sampleDistance;
      var scaleY = (testPoint.y - origin.y) / sampleDistance;

      // get the true cursor position
      this._measureRect.setAttribute("x", String((clientX - origin.x)/scaleX) );
      this._measureRect.setAttribute("y", String((clientY - origin.y)/scaleY) );
      mrBCR = this._measureRect.getBoundingClientRect();
      var trueCursorPosition = { x: mrBCR.left, y: mrBCR.top };

      var scaledPosition = {
        x: (trueCursorPosition.x - origin.x) / scaleX,
        y: (trueCursorPosition.y - origin.y) / scaleY
      };

      return scaledPosition;
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

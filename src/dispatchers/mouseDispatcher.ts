///<reference path="../reference.ts" />

module Plottable {
export module Dispatcher {
  export class Mouse {
    static dispatcherKey = "__Plottable_Dispatcher_Mouse";
    private _svg: SVGElement;
    private _measureRect: SVGElement;
    private _lastMousePosition: Point;
    public broadcaster: Core.Broadcaster;

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
      this.broadcaster = new Core.Broadcaster(this);

      svg.addEventListener("mouseover", (e) => this._computeMousePosition(e.clientX, e.clientY));
      svg.addEventListener("mousemove", (e) => this._computeMousePosition(e.clientX, e.clientY));
      svg.addEventListener("mouseout", (e) => this._computeMousePosition(e.clientX, e.clientY));
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

      // caculate the scale
      this._measureRect.setAttribute("x", "100");
      this._measureRect.setAttribute("y", "100");
      mrBCR = this._measureRect.getBoundingClientRect();
      var testPoint = { x: mrBCR.left, y: mrBCR.top };

      var scaleX = (testPoint.x - origin.x) / 100;
      var scaleY = (testPoint.y - origin.y) / 100;

      // get the true cursor position
      this._measureRect.setAttribute("x", String((clientX - origin.x)/scaleX) );
      this._measureRect.setAttribute("y", String((clientY - origin.y)/scaleY) );
      mrBCR = this._measureRect.getBoundingClientRect();
      var trueCursorPosition = { x: mrBCR.left, y: mrBCR.top };

      var scaledPosition = {
        x: (trueCursorPosition.x - origin.x) / scaleX,
        y: (trueCursorPosition.y - origin.y) / scaleY
      };

      this._lastMousePosition = scaledPosition;
      this.broadcaster.broadcast();
    }

    /**
     * Get a Dispatcher.Mouse for the <svg> containing elem. If one already exists
     * on that <svg>, it will be returned; otherwise, a new one will be created.
     *
     * @param {SVGElement} elem A svg DOM element.
     *
     * @return {Dispatcher.Mouse} A Dispatcher.Mouse
     */
    public static getDispatcher(elem: SVGElement): Dispatcher.Mouse {
      var svg = _Util.DOM.getBoundingSVG(elem);

      var dispatcher: Mouse = (<any> svg)[Mouse.dispatcherKey];
      if (dispatcher == null) {
        dispatcher = new Mouse(svg);
        (<any> svg)[Mouse.dispatcherKey] = dispatcher;
      }
      return dispatcher;
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

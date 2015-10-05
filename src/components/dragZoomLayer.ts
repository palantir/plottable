///<reference path="../reference.ts" />

module Plottable {
export module Components {
  export class DragZoomLayer extends Components.SelectionBoxLayer {
    private _dragInteraction: Interactions.Drag;
    private _doubleClickInteraction: Interactions.DoubleClick;
    private xDomainToRestore: Numeric[];
    private yDomainToRestore: Numeric[];
    private isZoomed = false;
    private easeFn: (t: number) => number = d3.ease("cubic-in-out");
    private _animationTime = 750;

    /* Constructs a SelectionBoxLayer with an attached DragInteraction and DoubleClickInteraction.
     * On drag, it triggers an animated zoom into the box that was dragged.
     * On double click, it zooms back out to the original view, before any zooming.
     * The zoom animation uses an easing function (default d3.ease("cubic-in-out")) and is customizable.
     * Usage: Construct the selection box layer and attach x and y scales, and then add the layer
     * over the plot you are zooming on using a Component Group.
     */
    constructor(xScale: QuantitativeScale<Numeric>,
                yScale: QuantitativeScale<Numeric>) {
      super();
      this.xScale(xScale);
      this.yScale(yScale);
      this._dragInteraction = new Interactions.Drag();
      this._dragInteraction.attachTo(this);
      this._doubleClickInteraction = new Interactions.DoubleClick();
      this._doubleClickInteraction.attachTo(this);
      this.setupCallbacks();
    }

    private setupCallbacks() {
      let dragging = false;
      this._dragInteraction.onDragStart((startPoint: Point) => {
        this.bounds({
          topLeft: startPoint,
          bottomRight: startPoint
        });
      });
      this._dragInteraction.onDrag((startPoint, endPoint) => {
        this.bounds({topLeft: startPoint, bottomRight: endPoint});
        this.boxVisible(true);
        dragging = true;
      });
      this._dragInteraction.onDragEnd((startPoint, endPoint) => {
        this.boxVisible(false);
        this.bounds({topLeft: startPoint, bottomRight: endPoint});
        if (dragging) {
          this.zoom();
        }
        dragging = false;
      });

      this._doubleClickInteraction.onDoubleClick(() => this.unzoom());
    }

    /* Set the time (in ms) over which the zoom will interpolate.
     * 0 implies no interpolation. (ie zoom is instant)
     */
    public animationTime(): number;
    public animationTime(animationTime: number): DragZoomLayer;
    public animationTime(animationTime?: number): any {
      if (animationTime == null) {
        return this._animationTime;
      }
      if (animationTime < 0) {
        throw new Error("animationTime cannot be negative");
      }
      this._animationTime = animationTime;
      return this;
    }

    /* Set the easing function, which determines how the zoom interpolates over time. */
    public ease(fn: (t: number) => number): DragZoomLayer {
      if (typeof(fn) !== "function") {
        throw new Error("ease function must be a function");
      }
      if (fn(0) !== 0 || fn(1) !== 1) {
        Utils.Window.warn("Easing function does not maintain invariant f(0)==0 && f(1)==1. Bad behavior may result.");
      }
      this.easeFn = fn;
      return this;
    }

    // Zoom into extent of the selection box bounds
    private zoom() {
      let x0: number = this.xExtent()[0].valueOf();
      let x1: number = this.xExtent()[1].valueOf();
      let y0: number = this.yExtent()[1].valueOf();
      let y1: number = this.yExtent()[0].valueOf();

      if (x0 === x1 || y0 === y1) {
        return;
      }

      if (!this.isZoomed) {
        this.isZoomed = true;
        this.xDomainToRestore = this._xScale.domain();
        this.yDomainToRestore = this._yScale.domain();
      }
      this.interpolateZoom(x0, x1, y0, y1);
    }

    // Restore the scales to their state before any zoom
    private unzoom() {
      if (!this.isZoomed) {
        return;
      }
      this.isZoomed = false;
      this.interpolateZoom(this.xDomainToRestore[0], this.xDomainToRestore[1],
                           this.yDomainToRestore[0], this.yDomainToRestore[1]);
    }

    // If we are zooming, disable interactions, to avoid contention
    private isZooming(isZooming: boolean) {
      this._dragInteraction.enabled(!isZooming);
      this._doubleClickInteraction.enabled(!isZooming);
    }

    private interpolateZoom(x0f: Numeric, x1f: Numeric, y0f: Numeric, y1f: Numeric) {
      let x0s: number = this._xScale.domain()[0].valueOf();
      let x1s: number = this._xScale.domain()[1].valueOf();
      let y0s: number = this._yScale.domain()[0].valueOf();
      let y1s: number = this._yScale.domain()[1].valueOf();

      // Copy a ref to the ease fn, so that changing ease wont affect zooms in progress
      let ease = this.easeFn;
      let interpolator = (a: Numeric, b: Numeric, p: number): number => {
        return d3.interpolateNumber(a.valueOf(), b.valueOf())(ease(p));
      };
      this.isZooming(true);
      let start = Date.now();
      let draw = () => {
        let now = Date.now();
        let passed = now - start;
        let p = this._animationTime === 0 ? 1 : Math.min(1, passed / this._animationTime);
        let x0 = interpolator(x0s, x0f, p);
        let x1 = interpolator(x1s, x1f, p);
        let y0 = interpolator(y0s, y0f, p);
        let y1 = interpolator(y1s, y1f, p);
        this._xScale.domain([x0, x1]);
        this._yScale.domain([y0, y1]);
        if (p < 1) {
          Utils.DOM.requestAnimationFramePolyfill(draw);
        } else {
          this.isZooming(false);
        }
      };
      draw();
    }
  }
}
}

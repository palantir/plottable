///<reference path="../reference.ts" />

module Plottable {
export module Plots {
  type EdgeIntersections = {
    left: Point[],
    right: Point[],
    top: Point[],
    bottom: Point[]
  };

  export class Line<X> extends XYPlot<X, number> {
    private _interpolator: string | ((points: Array<[number, number]>) => string) = "linear";

    private _autorangeSmooth = false;
    private _croppedRenderingEnabled = true;

    private _downsamplingEnabled = false;

    /**
     * A Line Plot draws line segments starting from the first data point to the next.
     *
     * @constructor
     */
    constructor() {
      super();
      this.addClass("line-plot");
      let animator = new Animators.Easing();
      animator.stepDuration(Plot._ANIMATION_MAX_DURATION);
      animator.easingMode("exp-in-out");
      animator.maxTotalDuration(Plot._ANIMATION_MAX_DURATION);
      this.animator(Plots.Animator.MAIN, animator);
      this.attr("stroke", new Scales.Color().range()[0]);
      this.attr("stroke-width", "2px");
    }

    public x(): Plots.AccessorScaleBinding<X, number>;
    public x(x: number | Accessor<number>): Line<X>;
    public x(x: X | Accessor<X>, xScale: Scale<X, number>): Line<X>;
    public x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any {
      if (x == null) {
        return super.x();
      } else {
        if (xScale == null) {
          super.x(<number | Accessor<number>>x);
        } else {
          super.x(<X | Accessor<X>>x, xScale);
        }
        this._setScaleSnapping();
        return this;
      }
    }

    public y(): Plots.AccessorScaleBinding<number, number>;
    public y(y: number | Accessor<number>): Line<X>;
    public y(y: number | Accessor<number>, yScale: Scale<number, number>): Line<X>;
    public y(y?: number | Accessor<number>, yScale?: Scale<number, number>): any {
      if (y == null) {
        return super.y();
      } else {
        super.y(y, yScale);
        this._setScaleSnapping();
        return this;
      }
    }

    public autorangeMode(): string;
    public autorangeMode(autorangeMode: string): Line<X>;
    public autorangeMode(autorangeMode?: string): any {
      if (autorangeMode == null) {
        return super.autorangeMode();
      }

      super.autorangeMode(autorangeMode);
      this._setScaleSnapping();
      return this;
    }

    /**
     * Gets whether or not the autoranging is done smoothly.
     */
    public autorangeSmooth(): boolean;
    /**
     * Sets whether or not the autorange is done smoothly.
     *
     * Smooth autoranging is done by making sure lines always exit on the left / right side of the plot
     * and deactivating the nice domain feature on the scales
     */
    public autorangeSmooth(autorangeSmooth: boolean): Plots.Line<X>;
    public autorangeSmooth(autorangeSmooth?: boolean): any {
      if (autorangeSmooth == null) {
        return this._autorangeSmooth;
      }
      this._autorangeSmooth = autorangeSmooth;
      this._setScaleSnapping();
      return this;
    }

    private _setScaleSnapping() {
      if (this.autorangeMode() === "x" && this.x() && this.x().scale && this.x().scale instanceof QuantitativeScale) {
        (<QuantitativeScale<X>>this.x().scale).snappingDomainEnabled(!this.autorangeSmooth());
      }

      if (this.autorangeMode() === "y" && this.y() && this.y().scale && this.y().scale instanceof QuantitativeScale) {
        (<QuantitativeScale<number>>this.y().scale).snappingDomainEnabled(!this.autorangeSmooth());
      }
    }

    /**
     * Gets the interpolation function associated with the plot.
     *
     * @return {string | (points: Array<[number, number]>) => string)}
     */
    public interpolator(): string | ((points: Array<[number, number]>) => string);
    /**
     * Sets the interpolation function associated with the plot.
     *
     * @param {string | points: Array<[number, number]>) => string} interpolator Interpolation function
     * @return Plots.Line
     */
    public interpolator(interpolator: string | ((points: Array<[number, number]>) => string)): Plots.Line<X>;
    public interpolator(interpolator: "linear"): Line<X>;
    public interpolator(interpolator: "linear-closed"): Line<X>;
    public interpolator(interpolator: "step"): Line<X>;
    public interpolator(interpolator: "step-before"): Line<X>;
    public interpolator(interpolator: "step-after"): Line<X>;
    public interpolator(interpolator: "basis"): Line<X>;
    public interpolator(interpolator: "basis-open"): Line<X>;
    public interpolator(interpolator: "basis-closed"): Line<X>;
    public interpolator(interpolator: "bundle"): Line<X>;
    public interpolator(interpolator: "cardinal"): Line<X>;
    public interpolator(interpolator: "cardinal-open"): Line<X>;
    public interpolator(interpolator: "cardinal-closed"): Line<X>;
    public interpolator(interpolator: "monotone"): Line<X>;
    public interpolator(interpolator?: string | ((points: Array<[number, number]>) => string)): any {
      if (interpolator == null) {
        return this._interpolator;
      }
      this._interpolator = interpolator;
      this.render();
      return this;
    }
    /**
     * Gets the downsampling performance option state
     * 
     * When downsampling is enabled, lines whose two ends have the same scaled x/y values will not be drawn on top of each other.
     */
    public downsamplingEnabled(): boolean;
    /**
     * Sets if the downsampling performance option is enabled
     * 
     * @returns {Plots.Line} The calling Plots.Line
     */
    public downsamplingEnabled(downsample: boolean): Plots.Line<X>;
    public downsamplingEnabled(downsample?: boolean): any {
      if (downsample == null) {
        return this._downsamplingEnabled;
      }
      this._downsamplingEnabled = downsample;
      return this;
    }

    /**
     * Gets if croppedRendering is enabled
     *
     * When croppedRendering is enabled, lines that will not be visible in the viewport will not be drawn.
     */
    public croppedRenderingEnabled(): boolean;
    /**
     * Sets if croppedRendering is enabled
     *
     * @returns {Plots.Line} The calling Plots.Line
     */
    public croppedRenderingEnabled(croppedRendering: boolean): Plots.Line<X>;
    public croppedRenderingEnabled(croppedRendering?: boolean): any {
      if (croppedRendering == null) {
        return this._croppedRenderingEnabled;
      }
      this._croppedRenderingEnabled = croppedRendering;
      this.render();
      return this;
    }

    protected _createDrawer(dataset: Dataset): Drawer {
      return new Plottable.Drawers.Line(dataset);
    }

    protected _extentsForProperty(property: string) {
      let extents = super._extentsForProperty(property);

      if (!this._autorangeSmooth) {
        return extents;
      }

      if (this.autorangeMode() !== property) {
        return extents;
      }

      if (this.autorangeMode() !== "x" && this.autorangeMode() !== "y") {
        return extents;
      }

      let edgeIntersectionPoints = this._getEdgeIntersectionPoints();
      let includedValues: number[];
      if (this.autorangeMode() === "y") {
        includedValues = edgeIntersectionPoints.left.concat(edgeIntersectionPoints.right).map((point) => point.y);
      } else { // === "x"
        includedValues = edgeIntersectionPoints.top.concat(edgeIntersectionPoints.bottom).map((point) => point.x);
      }

      return extents.map((extent: [number, number]) => d3.extent(d3.merge([extent, includedValues])));
    }

    private _getEdgeIntersectionPoints(): EdgeIntersections {
      if (!(this.y().scale instanceof QuantitativeScale && this.x().scale instanceof QuantitativeScale)) {
        return {
          left: [],
          right: [],
          top: [],
          bottom: []
        };
      }

      let yScale = <QuantitativeScale<number>>this.y().scale;
      let xScale = <QuantitativeScale<any>>this.x().scale;

      let intersectionPoints: EdgeIntersections = {
        left: [],
        right: [],
        top: [],
        bottom: []
      };
      let leftX = xScale.scale(xScale.domain()[0]);
      let rightX = xScale.scale(xScale.domain()[1]);
      let bottomY = yScale.scale(yScale.domain()[0]);
      let topY = yScale.scale(yScale.domain()[1]);

      this.datasets().forEach((dataset) => {
        let data = dataset.data();

        let x1: number, x2: number, y1: number, y2: number;
        let prevX: number, prevY: number, currX: number, currY: number;
        for (let i = 1; i < data.length; i++) {
          prevX = currX || xScale.scale(this.x().accessor(data[i - 1], i - 1, dataset));
          prevY = currY || yScale.scale(this.y().accessor(data[i - 1], i - 1, dataset));

          currX = xScale.scale(this.x().accessor(data[i], i, dataset));
          currY = yScale.scale(this.y().accessor(data[i], i, dataset));

          // If values crossed left edge
          if ((prevX < leftX) === (leftX <= currX)) {
            x1 = leftX - prevX;
            x2 = currX - prevX;
            y2 = currY - prevY;
            y1 = x1 * y2 / x2;

            intersectionPoints.left.push({
              x: leftX,
              y: yScale.invert(prevY + y1)
            });
          }

          // If values crossed right edge
          if ((prevX < rightX) === (rightX <= currX)) {
            x1 = rightX - prevX;
            x2 = currX - prevX;
            y2 = currY - prevY;
            y1 = x1 * y2 / x2;

            intersectionPoints.right.push({
              x: rightX,
              y: yScale.invert(prevY + y1)
            });
          }

          // If values crossed upper edge
          if ((prevY < topY) === (topY <= currY)) {
            x2 = currX - prevX;
            y1 = topY - prevY;
            y2 = currY - prevY;
            x1 = y1 * x2 / y2;

            intersectionPoints.top.push({
              x: xScale.invert(prevX + x1),
              y: topY
            });
          }

          // If values crossed lower edge
          if ((prevY < bottomY) === (bottomY <= currY)) {
            x2 = currX - prevX;
            y1 = bottomY - prevY;
            y2 = currY - prevY;
            x1 = y1 * x2 / y2;

            intersectionPoints.bottom.push({
              x: xScale.invert(prevX + x1),
              y: bottomY
            });
          }
        };
      });

      return intersectionPoints;
    }

    protected _getResetYFunction() {
      // gets the y-value generator for the animation start point
      let yDomain = this.y().scale.domain();
      let domainMax = Math.max(yDomain[0], yDomain[1]);
      let domainMin = Math.min(yDomain[0], yDomain[1]);
      // start from zero, or the closest domain value to zero
      // avoids lines zooming on from offscreen.
      let startValue = (domainMax < 0 && domainMax) || (domainMin > 0 && domainMin) || 0;
      let scaledStartValue = this.y().scale.scale(startValue);
      return (d: any, i: number, dataset: Dataset) => scaledStartValue;
    }

    protected _generateDrawSteps(): Drawers.DrawStep[] {
      let drawSteps: Drawers.DrawStep[] = [];
      if (this._animateOnNextRender()) {
        let attrToProjector = this._generateAttrToProjector();
        attrToProjector["d"] = this._constructLineProjector(Plot._scaledAccessor(this.x()), this._getResetYFunction());
        drawSteps.push({attrToProjector: attrToProjector, animator: this._getAnimator(Plots.Animator.RESET)});
      }

      drawSteps.push({attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator(Plots.Animator.MAIN)});

      return drawSteps;
    }

    protected _generateAttrToProjector() {
      let attrToProjector = super._generateAttrToProjector();
      Object.keys(attrToProjector).forEach((attribute: string) => {
        if (attribute === "d") { return; }
        let projector = attrToProjector[attribute];
        attrToProjector[attribute] = (data: any[], i: number, dataset: Dataset) =>
          data.length > 0 ? projector(data[0], i, dataset) : null;
      });

      return attrToProjector;
    }

    /**
     * Returns the PlotEntity nearest to the query point by X then by Y, or undefined if no PlotEntity can be found.
     *
     * @param {Point} queryPoint
     * @returns {PlotEntity} The nearest PlotEntity, or undefined if no PlotEntity can be found.
     */
    public entityNearest(queryPoint: Point): PlotEntity {
      let minXDist = Infinity;
      let minYDist = Infinity;
      let closest: PlotEntity;
      this.entities().forEach((entity) => {
        if (!this._entityVisibleOnPlot(entity.position, entity.datum, entity.index, entity.dataset)) {
          return;
        }
        let xDist = Math.abs(queryPoint.x - entity.position.x);
        let yDist = Math.abs(queryPoint.y - entity.position.y);

        if (xDist < minXDist || xDist === minXDist && yDist < minYDist) {
          closest = entity;
          minXDist = xDist;
          minYDist = yDist;
        }
      });

      return closest;
    }

    protected _propertyProjectors(): AttributeToProjector {
      let propertyToProjectors = super._propertyProjectors();
      propertyToProjectors["d"] = this._constructLineProjector(Plot._scaledAccessor(this.x()), Plot._scaledAccessor(this.y()));
      return propertyToProjectors;
    }

    protected _constructLineProjector(xProjector: Projector, yProjector: Projector) {
      let definedProjector = (d: any, i: number, dataset: Dataset) => {
        let positionX = Plot._scaledAccessor(this.x())(d, i, dataset);
        let positionY = Plot._scaledAccessor(this.y())(d, i, dataset);
        return positionX != null && !Utils.Math.isNaN(positionX) &&
               positionY != null && !Utils.Math.isNaN(positionY);
      };
      return (datum: any, index: number, dataset: Dataset) => {
        return d3.svg.line()
                     .x((innerDatum, innerIndex) => xProjector(innerDatum, innerIndex, dataset))
                     .y((innerDatum, innerIndex) => yProjector(innerDatum, innerIndex, dataset))
                     .interpolate(this.interpolator())
                     .defined((innerDatum, innerIndex) => definedProjector(innerDatum, innerIndex, dataset))(datum);
      };
    }

    protected _getDataToDraw() {
      let dataToDraw = new Utils.Map<Dataset, any[]> ();

      this.datasets().forEach((dataset) => {
        let data = dataset.data();

        if (!this._croppedRenderingEnabled && !this._downsamplingEnabled) {
          dataToDraw.set(dataset, [data]);
          return;
        }

        let filteredDataIndices = data.map((d, i) => i);
        if (this._croppedRenderingEnabled) {
        filteredDataIndices = this._filterCroppedRendering(dataset, filteredDataIndices);
        }
        if (this._downsamplingEnabled) {
          filteredDataIndices = this._filterDownsampling(dataset, filteredDataIndices);
        }

        dataToDraw.set(dataset, [filteredDataIndices.map((d, i) => data[d])]);
      });

      return dataToDraw;
    }

    private _filterCroppedRendering(dataset: Dataset, indices: number[]) {
      let xProjector = Plot._scaledAccessor(this.x());
      let yProjector = Plot._scaledAccessor(this.y());

      let data = dataset.data();
      let filteredDataIndices: number[] = [];
      let pointInViewport = (x: number, y: number) => {
        return Utils.Math.inRange(x, 0, this.width()) &&
          Utils.Math.inRange(y, 0, this.height());
      };

      for (let i = 0; i < indices.length; i++) {
        let currXPoint = xProjector(data[indices[i]], indices[i], dataset);
        let currYPoint = yProjector(data[indices[i]], indices[i], dataset);
        let shouldShow = pointInViewport(currXPoint, currYPoint);

        if (!shouldShow && indices[i - 1] != null && data[indices[i - 1]] != null) {
          let prevXPoint = xProjector(data[indices[i - 1]], indices[i - 1], dataset);
          let prevYPoint = yProjector(data[indices[i - 1]], indices[i - 1], dataset);
          shouldShow = shouldShow || pointInViewport(prevXPoint, prevYPoint);
        }

        if (!shouldShow && indices[i + 1] != null && data[indices[i + 1]] != null) {
          let nextXPoint = xProjector(data[indices[i + 1]], indices[i + 1], dataset);
          let nextYPoint = yProjector(data[indices[i + 1]], indices[i + 1], dataset);
          shouldShow = shouldShow || pointInViewport(nextXPoint, nextYPoint);
        }

        if (shouldShow) {
          filteredDataIndices.push(indices[i]);
        }
      }
      return filteredDataIndices;
    }

    private _filterDownsampling(dataset: Dataset, indices: number[]) {
      let xAccessor = this.x().accessor;
      let yAccessor = this.y().accessor;
      let filteredIndices = this._filterDownsamplingSlope(dataset, indices, this.x().scale, this.y().scale, xAccessor, yAccessor);
      return filteredIndices;
    }

    private _filterDownsamplingSlope(dataset: Dataset, indices: number[],
      xScale: Scale<any, number>, yScale: Scale<any, number>, xAcessor: Accessor<any>, yAcessor: Accessor<any>) {
      let data = dataset.data();
      let filteredIndices: number[] = [];
      let min: number;
      let max: number;
      let currentSlope: number;
      if (indices.length === 0) {
        return filteredIndices;
      }
      filteredIndices.push(indices[0]);
      function belongToCurBucket(i: number) {
        let p1x = xScale.scale(xAcessor(data[indices[i]], indices[i], dataset));
        let p1y = yScale.scale(yAcessor(data[indices[i]], indices[i], dataset));
        let p2x = xScale.scale(xAcessor(data[indices[i + 1]], indices[i + 1], dataset));
        let p2y = yScale.scale(yAcessor(data[indices[i + 1]], indices[i + 1], dataset));
        if (currentSlope == null) {
          currentSlope = (Math.floor(p1x) === Math.floor(p2x)) ? Infinity : (p2y - p1y) / (p2x - p1x);
          min = (currentSlope === Infinity) ? yAcessor(data[indices[i]], indices[i], dataset) :
            xAcessor(data[indices[i]], indices[i], dataset);
          max = min;
          return true;
        }
        if (currentSlope === Infinity) {
          return Math.floor(p1x) === Math.floor(p2x);
        }else {
          let expectedP2y = p1y + (p2x - p1x) * currentSlope;
          return Math.floor(p2y) === Math.floor(expectedP2y);
        }
      }
      for (let i = 0; i < indices.length - 1; ) {
        currentSlope = null;
        let pFirst = indices[i];
        let pMin = indices[i];
        let pMax = indices[i];
        while (i < indices.length - 1 && belongToCurBucket(i)) {
          let currPoint = (currentSlope === Infinity ? yAcessor(data[indices[i + 1]], indices[i + 1], dataset) :
            xAcessor(data[indices[i + 1]], indices[i + 1], dataset));
          if (currPoint > max) {
            max = currPoint;
            pMax = indices[i + 1];
          }
          if (currPoint < min) {
            min = currPoint;
            pMin = indices[i + 1];
          }
          i++;
        }
        let pLast = indices[i];
        if (pMin !== pFirst) {
          filteredIndices.push(pMin);
        }
        if (pMax !== pMin && pMax !== pFirst) {
          filteredIndices.push(pMax);
        }
        if (pLast && pLast !== pFirst && pLast !== pMin && pLast !== pMax) {
          filteredIndices.push(pLast);
        }
      }
        return filteredIndices;
    }
  }
}
}

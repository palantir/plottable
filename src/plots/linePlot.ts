///<reference path="../reference.ts" />

module Plottable {
export module Plots {
  export class Line<X> extends XYPlot<X, number> {

    /**
     * A Line Plot draws line segments starting from the first data point to the next.
     *
     * @constructor
     */
    constructor() {
      super();
      this.addClass("line-plot");
      var animator = new Animators.Easing();
      animator.stepDuration(Plot._ANIMATION_MAX_DURATION);
      animator.easingMode("exp-in-out");
      animator.maxTotalDuration(Plot._ANIMATION_MAX_DURATION);
      this.animator(Plots.Animator.MAIN, animator);
      this.attr("stroke", new Scales.Color().range()[0]);
      this.attr("stroke-width", "2px");
    }

    protected _createDrawer(dataset: Dataset): Drawer {
      return new Plottable.Drawers.Line(dataset);
    }

    protected _updateExtentsForProperty(property: string) {
      if (property === "y") {
        this._ownMethod();
      }
      super._updateExtentsForProperty(property);
    }


    private _yDomainChangeIncludedValues: Scales.IncludedValuesProvider<any>;

    private _ownMethod() {
      if (this.x && this.x().scale && this.y && this.y().scale && this.datasets().length > 0) {

        if (this._yDomainChangeIncludedValues) {
          this.y().scale.removeIncludedValuesProvider(this._yDomainChangeIncludedValues);
        }

        var edgeIntersectionPoints = this._getEdgeIntersectionPoitns();
        var includedValues = edgeIntersectionPoints[0].concat(edgeIntersectionPoints[1])

        this._yDomainChangeIncludedValues = () => includedValues;
        this.y().scale.addIncludedValuesProvider(this._yDomainChangeIncludedValues);
      }
    }

    private _getEdgeIntersectionPoitns(): number[][] {

      if (!(this.x().scale instanceof QuantitativeScale)) {
        return [[], []];
      }

      var yScale = <QuantitativeScale<number>>this.y().scale;
      var yAccessor = this.y().accessor;

      var xScale = <QuantitativeScale<X>>this.x().scale;
      var xAccessor = this.x().accessor;

      var includedValues: number[][] = [[], []];
      var left = xScale.scale(xScale.domain()[0]);
      var right = xScale.scale(xScale.domain()[1]);
      this.datasets().forEach((dataset) => {

        var data = dataset.data();

        var westOfLeft: boolean;
        var westOfRight: boolean;

        var lastValue: any;
        var d: any;
        var x1: any;
        var x2: any;
        var y1: any;
        var y2: any;
        for (var i = 1; i < data.length; i++) {
          d = data[i];
          lastValue = data[i - 1];
          westOfLeft = xScale.scale(lastValue.x) < left;
          westOfRight = xScale.scale(lastValue.x) < right;

          // If values crossed left edge
          if (xScale.scale(lastValue.x) < left && xScale.scale(d.x) >= left) {
            x1 = left - xScale.scale(xAccessor(lastValue, i - 1, dataset));
            x2 = xScale.scale(xAccessor(d, i, dataset)) - xScale.scale(xAccessor(lastValue, i - 1, dataset));
            y2 = yScale.scale(yAccessor(d, i, dataset)) - yScale.scale(yAccessor(lastValue, i - 1, dataset));
            y1 = x1 * y2 / x2;

            includedValues[0].push(yScale.invert(yScale.scale(yAccessor(lastValue, i - 1, dataset)) + y1))
          }

          // If values crossed right edge
          if (xScale.scale(lastValue.x) < right && xScale.scale(d.x) >= right) {
            x1 = right - xScale.scale(xAccessor(lastValue, i - 1, dataset));
            x2 = xScale.scale(xAccessor(d, i, dataset)) - xScale.scale(xAccessor(lastValue, i - 1, dataset));
            y2 = yScale.scale(d.y) - yScale.scale(lastValue.y);
            y1 = x1 * y2 / x2;

            includedValues[1].push(yScale.invert(yScale.scale(yAccessor(lastValue, i - 1, dataset)) + y1))
          }
        };
      });

      return includedValues;
    }

    private _endOfDomainValues(): X|number[][] {
      return [];
    }

    protected _getResetYFunction() {
      // gets the y-value generator for the animation start point
      var yDomain = this.y().scale.domain();
      var domainMax = Math.max(yDomain[0], yDomain[1]);
      var domainMin = Math.min(yDomain[0], yDomain[1]);
      // start from zero, or the closest domain value to zero
      // avoids lines zooming on from offscreen.
      var startValue = (domainMax < 0 && domainMax) || (domainMin > 0 && domainMin) || 0;
      var scaledStartValue = this.y().scale.scale(startValue);
      return (d: any, i: number, dataset: Dataset) => scaledStartValue;
    }

    protected _generateDrawSteps(): Drawers.DrawStep[] {
      var drawSteps: Drawers.DrawStep[] = [];
      if (this._animateOnNextRender()) {
        var attrToProjector = this._generateAttrToProjector();
        attrToProjector["d"] = this._constructLineProjector(Plot._scaledAccessor(this.x()), this._getResetYFunction());
        drawSteps.push({attrToProjector: attrToProjector, animator: this._getAnimator(Plots.Animator.RESET)});
      }

      drawSteps.push({attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator(Plots.Animator.MAIN)});

      return drawSteps;
    }

    protected _generateAttrToProjector() {
      var attrToProjector = super._generateAttrToProjector();
      Object.keys(attrToProjector).forEach((attribute: string) => {
        if (attribute === "d") { return; }
        var projector = attrToProjector[attribute];
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
      var minXDist = Infinity;
      var minYDist = Infinity;
      var closest: PlotEntity;
      this.entities().forEach((entity) => {
        if (!this._entityVisibleOnPlot(entity.position, entity.datum, entity.index, entity.dataset)) {
          return;
        }
        var xDist = Math.abs(queryPoint.x - entity.position.x);
        var yDist = Math.abs(queryPoint.y - entity.position.y);

        if (xDist < minXDist || xDist === minXDist && yDist < minYDist) {
          closest = entity;
          minXDist = xDist;
          minYDist = yDist;
        }
      });

      return closest;
    }

    protected _propertyProjectors(): AttributeToProjector {
      var propertyToProjectors = super._propertyProjectors();
      propertyToProjectors["d"] = this._constructLineProjector(Plot._scaledAccessor(this.x()), Plot._scaledAccessor(this.y()));
      return propertyToProjectors;
    }

    protected _constructLineProjector(xProjector: Projector, yProjector: Projector) {
      var definedProjector = (d: any, i: number, dataset: Dataset) => {
        var positionX = Plot._scaledAccessor(this.x())(d, i, dataset);
        var positionY = Plot._scaledAccessor(this.y())(d, i, dataset);
        return positionX != null && !Utils.Math.isNaN(positionX) &&
               positionY != null && !Utils.Math.isNaN(positionY);
      };
      return (datum: any, index: number, dataset: Dataset) => {
        return d3.svg.line()
                     .x((innerDatum, innerIndex) => xProjector(innerDatum, innerIndex, dataset))
                     .y((innerDatum, innerIndex) => yProjector(innerDatum, innerIndex, dataset))
                     .defined((innerDatum, innerIndex) => definedProjector(innerDatum, innerIndex, dataset))(datum);
      };
    }

    protected _getDataToDraw() {
      var dataToDraw = new Utils.Map<Dataset, any[]> ();
      this.datasets().forEach((dataset) => dataToDraw.set(dataset, [dataset.data()]));
      return dataToDraw;
    }
  }
}
}

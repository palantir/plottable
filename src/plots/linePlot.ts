///<reference path="../reference.ts" />

module Plottable {
export module Plots {
  export class Line<X> extends XYPlot<X, number> {
    private _interpolator: string | ((points: Array<[number, number]>) => string) = "linear";

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

    protected _createDrawer(dataset: Dataset): Drawer {
      return new Plottable.Drawers.Line(dataset);
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
      var xScale: any = this.x().scale;


      var domain = xScale.domain();

      this.datasets().forEach((dataset) => {

        let reducedData = dataset.data().filter((d, i, dataset) => {
          var shouldShow = domain[0] <= dataset[i].x && dataset[i].x <= domain[1];
          shouldShow = shouldShow || dataset[i - 1] && domain[0] <= dataset[i - 1].x && dataset[i - 1].x <= domain[1];
          shouldShow = shouldShow || dataset[i + 1] && domain[0] <= dataset[i + 1].x && dataset[i + 1].x <= domain[1];

          return shouldShow;
        });

        let rez: any[] = [];
        let lastSampleBucket = -1;

        for (let i = 0; i < reducedData.length; ) {
          let min = Infinity;
          let max = -Infinity;
          let currBucket = Math.floor(xScale.scale(reducedData[i].x));
          let p1 = reducedData[i];
          let p2 = reducedData[i];
          let p3 = reducedData[i];
          while (i < reducedData.length && Math.floor(xScale.scale(reducedData[i].x)) === currBucket) {
            if (reducedData[i].y > max) {
              max = reducedData[i].y;
              p2 = reducedData[i];
            }
            if (reducedData[i].y < min) {
              min = reducedData[i].y;
              p3 = reducedData[i];
            }
            i++;
          }
          let p4 = reducedData[i - 1];

          rez.push(p1);

          if (p2 !== p1) {
            rez.push(p2);
          }

          if (p3 !== p2 && p3 !== p1) {
            rez.push(p3);
          }

          if (p4 !== p3 && p4 !== p2 && p4 != p1) {
            rez.push(p4);
          }
        }

        // console.log(rez);
        dataToDraw.set(dataset, [rez]);
      });

      // this.datasets().forEach((dataset) => dataToDraw.set(dataset, [dataset.data()]));

      return dataToDraw;
    }
  }
}
}

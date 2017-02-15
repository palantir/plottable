/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import * as SVGTypewriter from "svg-typewriter";

import * as Animators from "../animators";
import { Accessor, Point, Bounds, Range, AttributeToProjector } from "../core/interfaces";
import { Dataset } from "../core/dataset";
import * as Drawers from "../drawers";
import { Rectangle as RectangleDrawer } from "../drawers";
import * as Scales from "../scales";
import { Scale } from "../scales/scale";
import * as Utils from "../utils";

import * as Plots from "./";
import { PlotEntity } from "./";
import { Plot } from "./plot";
import { XYPlot } from "./xyPlot";
import { BaseRectanglePlot, IRectanglePlot } from "./baseRectanglePlot";

export class Rectangle<X, Y> extends XYPlot<X, Y> implements IRectanglePlot<X, Y> {
  private _labelsEnabled = false;
  private _label: Accessor<string> = null;
  protected _plot: BaseRectanglePlot<X, Y>;

  /**
   * A Rectangle Plot displays rectangles based on the data.
   * The left and right edges of each rectangle can be set with x() and x2().
   *   If only x() is set the Rectangle Plot will attempt to compute the correct left and right edge positions.
   * The top and bottom edges of each rectangle can be set with y() and y2().
   *   If only y() is set the Rectangle Plot will attempt to compute the correct top and bottom edge positions.
   *
   * @constructor
   * @param {Scale.Scale} xScale
   * @param {Scale.Scale} yScale
   */
  constructor() {
    super();

    this.animator("rectangles", new Animators.Null());
    this.addClass("rectangle-plot");
    this.attr("fill", new Scales.Color().range()[0]);
  }

  /**
   * Gets the AccessorScaleBinding for X.
   */
  public x(): Plots.TransformableAccessorScaleBinding<X, number>;
  /**
   * Sets X to a constant number or the result of an Accessor<number>.
   *
   * @param {number|Accessor<number>} x
   * @returns {Plots.Rectangle} The calling Rectangle Plot.
   */
  public x(x: number | Accessor<number>): this;
  /**
   * Sets X to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {X|Accessor<X>} x
   * @param {Scale<X, number>} xScale
   * @returns {Plots.Rectangle} The calling Rectangle Plot.
   */
  public x(x: X | Accessor<X>, xScale: Scale<X, number>): this;
  public x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any {
        const xReturn = this._plot.x(x as X, xScale);
    if (x == null) {
      return xReturn
    }
    return this;
  }

  /**
   * Gets the AccessorScaleBinding for X2.
   */
  public x2(): Plots.TransformableAccessorScaleBinding<X, number>;
  /**
   * Sets X2 to a constant number or the result of an Accessor.
   * If a Scale has been set for X, it will also be used to scale X2.
   *
   * @param {number|Accessor<number>|X|Accessor<X>} x2
   * @returns {Plots.Rectangle} The calling Rectangle Plot.
   */
  public x2(x2: number | Accessor<number> | X | Accessor<X>): this;
  public x2(x2?: number | Accessor<number> | X | Accessor<X>): any {
    const x2Return = this._plot.x2(x2);
    if (x2 == null) {
      return x2Return;
    }

    this.render();
    return this;
  }

  /**
   * Gets the AccessorScaleBinding for Y.
   */
  public y(): Plots.TransformableAccessorScaleBinding<Y, number>;
  /**
   * Sets Y to a constant number or the result of an Accessor<number>.
   *
   * @param {number|Accessor<number>} y
   * @returns {Plots.Rectangle} The calling Rectangle Plot.
   */
  public y(y: number | Accessor<number>): this;
  /**
   * Sets Y to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {Y|Accessor<Y>} y
   * @param {Scale<Y, number>} yScale
   * @returns {Plots.Rectangle} The calling Rectangle Plot.
   */
  public y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): this;
  public y(y?: number | Accessor<number> | Y | Accessor<Y>, yScale?: Scale<Y, number>): any {
    const yReturn = this._plot.y(y as Y, yScale);
    if (y == null) {
      return yReturn;
    }
    return this;
  }

  /**
   * Gets the AccessorScaleBinding for Y2.
   */
  public y2(): Plots.TransformableAccessorScaleBinding<Y, number>;
  /**
   * Sets Y2 to a constant number or the result of an Accessor.
   * If a Scale has been set for Y, it will also be used to scale Y2.
   *
   * @param {number|Accessor<number>|Y|Accessor<Y>} y2
   * @returns {Plots.Rectangle} The calling Rectangle Plot.
   */
  public y2(y2: number | Accessor<number> | Y | Accessor<Y>): this;
  public y2(y2?: number | Accessor<number> | Y | Accessor<Y>): any {
    const y2Return = this._plot.y2(y2);
    if (y2 == null) {
      return y2Return;
    }
    this.render();
    return this;
  }

  /**
   * Gets the Entities that intersect the Bounds.
   *
   * @param {Bounds} bounds
   * @returns {PlotEntity[]}
   */
  public entitiesIn(bounds: Bounds): PlotEntity[];
  /**
   * Gets the Entities that intersect the area defined by the ranges.
   *
   * @param {Range} xRange
   * @param {Range} yRange
   * @returns {PlotEntity[]}
   */
  public entitiesIn(xRange: Range, yRange: Range): PlotEntity[];
  public entitiesIn(xRangeOrBounds: Range | Bounds, yRange?: Range): PlotEntity[] {
    return this._plot.entitiesIn(xRangeOrBounds as Range, yRange);
  }

  public drawLabels(dataToDraw: Utils.Map<Dataset, any[]>, attrToProjector: AttributeToProjector) {
    this._renderArea.selectAll(".label-area").remove();
    if (this._labelsEnabled && this.label() != null) {
      this.datasets().forEach((dataset, i) => this._drawLabel(dataToDraw, dataset, i, attrToProjector));
    }
  }

  /**
   * Gets the accessor for labels.
   *
   * @returns {Accessor<string>}
   */
  public label(): Accessor<string>;
  /**
   * Sets the text of labels to the result of an Accessor.
   *
   * @param {Accessor<string>} label
   * @returns {Plots.Rectangle} The calling Rectangle Plot.
   */
  public label(label: Accessor<string>): this;
  public label(label?: Accessor<string>): any {
    if (label == null) {
      return this._label;
    }

    this._label = label;
    this.render();
    return this;
  }

  /**
   * Gets whether labels are enabled.
   *
   * @returns {boolean}
   */
  public labelsEnabled(): boolean;
  /**
   * Sets whether labels are enabled.
   * Labels too big to be contained in the rectangle, cut off by edges, or blocked by other rectangles will not be shown.
   *
   * @param {boolean} labelsEnabled
   * @returns {Rectangle} The calling Rectangle Plot.
   */
  public labelsEnabled(enabled: boolean): this;
  public labelsEnabled(enabled?: boolean): any {
    if (enabled == null) {
      return this._labelsEnabled;
    } else {
      this._labelsEnabled = enabled;
      this.render();
      return this;
    }
  }

  private _rectangleWidth(scale: Scale<any, number>) {
    if (scale instanceof Scales.Category) {
      return (<Scales.Category> scale).rangeBand();
    } else {
      let accessor = scale === this.x().scale ? this.x().accessor : this.y().accessor;
      let accessorData = d3.set(Utils.Array.flatten(this.datasets().map((dataset) => {
        return dataset.data().map((d, i) => accessor(d, i, dataset).valueOf());
      }))).values().map((value) => +value);
      // Get the absolute difference between min and max
      let min = Utils.Math.min(accessorData, 0);
      let max = Utils.Math.max(accessorData, 0);
      let scaledMin = scale.scale(min);
      let scaledMax = scale.scale(max);
      return (scaledMax - scaledMin) / Math.abs(max - min);
    }
  }

  private _drawLabel(dataToDraw: Utils.Map<Dataset, any[]>, dataset: Dataset, datasetIndex: number, attrToProjector: AttributeToProjector) {
    let labelArea = this._renderArea.append("g").classed("label-area", true);
    let measurer = new SVGTypewriter.CacheMeasurer(labelArea);
    let writer = new SVGTypewriter.Writer(measurer);
    let xRange = this.x().scale.range();
    let yRange = this.y().scale.range();
    let xMin = Math.min.apply(null, xRange);
    let xMax = Math.max.apply(null, xRange);
    let yMin = Math.min.apply(null, yRange);
    let yMax = Math.max.apply(null, yRange);
    let data = dataToDraw.get(dataset);
    data.forEach((datum, datumIndex) => {
      let label = "" + this.label()(datum, datumIndex, dataset);
      let measurement = measurer.measure(label);

      let x = attrToProjector["x"](datum, datumIndex, dataset);
      let y = attrToProjector["y"](datum, datumIndex, dataset);
      let width = attrToProjector["width"](datum, datumIndex, dataset);
      let height = attrToProjector["height"](datum, datumIndex, dataset);
      if (measurement.height <= height && measurement.width <= width) {

        let horizontalOffset = (width - measurement.width) / 2;
        let verticalOffset = (height - measurement.height) / 2;
        x += horizontalOffset;
        y += verticalOffset;

        let xLabelRange = { min: x, max: x + measurement.width };
        let yLabelRange = { min: y, max: y + measurement.height };
        if (xLabelRange.min < xMin || xLabelRange.max > xMax || yLabelRange.min < yMin || yLabelRange.max > yMax) {
          return;
        }
        if (this._overlayLabel(xLabelRange, yLabelRange, datumIndex, datasetIndex, dataToDraw, attrToProjector)) {
          return;
        }

        let color = attrToProjector["fill"](datum, datumIndex, dataset);
        let dark = Utils.Color.contrast("white", color) * 1.6 < Utils.Color.contrast("black", color);
        let g = labelArea.append("g").attr("transform", "translate(" + x + "," + y + ")");
        let className = dark ? "dark-label" : "light-label";
        g.classed(className, true);

        writer.write(label, measurement.width, measurement.height, {
          selection: g,
          xAlign: "center",
          yAlign: "center",
          textRotation: 0,
        });
      }
    });
  }

  private _overlayLabel(labelXRange: Range, labelYRange: Range, datumIndex: number, datasetIndex: number,
                        dataToDraw: Utils.Map<Dataset, any[]>, attrToProjector: AttributeToProjector) {
    let datasets = this.datasets();
    for (let i = datasetIndex; i < datasets.length; i++) {
      let dataset = datasets[i];
      let data = dataToDraw.get(dataset);
      for (let j = (i === datasetIndex ? datumIndex + 1 : 0); j < data.length; j++) {
        if (Utils.DOM.intersectsBBox(labelXRange, labelYRange, this._entityBBox(data[j], j, dataset, attrToProjector))) {
          return true;
        }
      }
    }
    return false;
  }

  private _entityBBox(datum: any, index: number, dataset: Dataset, attrToProjector: AttributeToProjector): SVGRect {
    return {
      x: attrToProjector["x"](datum, index, dataset),
      y: attrToProjector["y"](datum, index, dataset),
      width: attrToProjector["width"](datum, index, dataset),
      height: attrToProjector["height"](datum, index, dataset),
    };
  }

  protected _createPlot() {
    return new BaseRectanglePlot((dataset) => new RectangleDrawer(dataset),
      this,
      () => this.width(),
      () => this.height());
  }
}

/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import * as Typesettable from "typesettable";

import * as Animators from "../animators";
import { Dataset } from "../core/dataset";
import { AttributeToProjector, IAccessor, IRangeProjector, Point, Range } from "../core/interfaces";
import * as Drawers from "../drawers";
import { ProxyDrawer } from "../drawers/drawer";
import { RectangleSVGDrawer } from "../drawers/rectangleDrawer";
import * as Scales from "../scales";
import { Scale } from "../scales/scale";
import * as Utils from "../utils";
import * as Plots from "./";
import { Plot } from "./plot";
import { XYPlot } from "./xyPlot";

export class Rectangle<X, Y> extends XYPlot<X, Y> {
  private static _X2_KEY = "x2";
  private static _Y2_KEY = "y2";
  private _labelsEnabled = false;
  private _label: IAccessor<string> = null;

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

  protected _createDrawer() {
    return new ProxyDrawer(
      () => new RectangleSVGDrawer(),
      (ctx) => new Drawers.RectangleCanvasDrawer(ctx),
    );
  }

  protected _generateAttrToProjector() {
    const attrToProjector = super._generateAttrToProjector();

    // Copy each of the different projectors.
    const xAttr = Plot._scaledAccessor(this.x());
    const x2Attr = attrToProjector[Rectangle._X2_KEY];
    const yAttr = Plot._scaledAccessor(this.y());
    const y2Attr = attrToProjector[Rectangle._Y2_KEY];

    const xScale = this.x().scale;
    const yScale = this.y().scale;

    if (x2Attr != null) {
      attrToProjector["width"] = (d, i, dataset) => Math.abs(x2Attr(d, i, dataset) - xAttr(d, i, dataset));
      attrToProjector["x"] = (d, i, dataset) => Math.min(x2Attr(d, i, dataset), xAttr(d, i, dataset));
    } else {
      attrToProjector["width"] = (d, i, dataset) => this._rectangleWidth(xScale);
      attrToProjector["x"] = (d, i, dataset) => xAttr(d, i, dataset) - 0.5 * attrToProjector["width"](d, i, dataset);
    }

    if (y2Attr != null) {
      attrToProjector["height"] = (d, i, dataset) => Math.abs(y2Attr(d, i, dataset) - yAttr(d, i, dataset));
      attrToProjector["y"] = (d, i, dataset) => {
        return Math.max(y2Attr(d, i, dataset), yAttr(d, i, dataset)) - attrToProjector["height"](d, i, dataset);
      };
    } else {
      attrToProjector["height"] = (d, i, dataset) => this._rectangleWidth(yScale);
      attrToProjector["y"] = (d, i, dataset) => yAttr(d, i, dataset) - 0.5 * attrToProjector["height"](d, i, dataset);
    }

    // Clean up the attributes projected onto the SVG elements
    delete attrToProjector[Rectangle._X2_KEY];
    delete attrToProjector[Rectangle._Y2_KEY];

    return attrToProjector;
  }

  protected _generateDrawSteps(): Drawers.DrawStep[] {
    return [{ attrToProjector: this._getAttrToProjector(), animator: this._getAnimator("rectangles") }];
  }

  protected _filterForProperty(property: string) {
    if (property === "x2") {
      return super._filterForProperty("x");
    } else if (property === "y2") {
      return super._filterForProperty("y");
    }
    return super._filterForProperty(property);
  }

  /**
   * Gets the AccessorScaleBinding for X.
   */
  public x(): Plots.ITransformableAccessorScaleBinding<X, number>;
  /**
   * Sets X to a constant number or the result of an Accessor<number>.
   *
   * @param {number|Accessor<number>} x
   * @returns {Plots.Rectangle} The calling Rectangle Plot.
   */
  public x(x: number | IAccessor<number>): this;
  /**
   * Sets X to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {X|Accessor<X>} x
   * @param {Scale<X, number>} xScale
   * @returns {Plots.Rectangle} The calling Rectangle Plot.
   */
  public x(x: X | IAccessor<X>, xScale: Scale<X, number>, postScale?: IRangeProjector<number>): this;
  public x(x?: number | IAccessor<number> | X | IAccessor<X>, xScale?: Scale<X, number>, postScale?: IRangeProjector<number>): any {
    if (x == null) {
      return super.x();
    }

    if (xScale == null) {
      super.x(<number | IAccessor<number>>x);
    } else {
      super.x(<X | IAccessor<X>>x, xScale, postScale);
    }

    if (xScale != null) {
      const x2Binding = this.x2();
      const x2 = x2Binding && x2Binding.accessor;
      if (x2 != null) {
        this._bindProperty(Rectangle._X2_KEY, x2, xScale, x2Binding.postScale);
      }
    }

    // The x and y scales should render in bands with no padding for category scales
    if (xScale instanceof Scales.Category) {
      (<Scales.Category> <any> xScale).innerPadding(0).outerPadding(0);
    }

    return this;
  }

  /**
   * Gets the AccessorScaleBinding for X2.
   */
  public x2(): Plots.ITransformableAccessorScaleBinding<X, number>;
  /**
   * Sets X2 to a constant number or the result of an Accessor.
   * If a Scale has been set for X, it will also be used to scale X2.
   *
   * @param {number|Accessor<number>|X|Accessor<X>} x2
   * @returns {Plots.Rectangle} The calling Rectangle Plot.
   */
  public x2(x2: number | IAccessor<number> | X | IAccessor<X>, postScale?: IRangeProjector<number>): this;
  public x2(x2?: number | IAccessor<number> | X | IAccessor<X>, postScale?: IRangeProjector<number>): any {
    if (x2 == null) {
      return this._propertyBindings.get(Rectangle._X2_KEY);
    }

    const xBinding = this.x();
    const xScale = xBinding && xBinding.scale;
    this._bindProperty(Rectangle._X2_KEY, x2, xScale, postScale);

    this.render();
    return this;
  }

  /**
   * Gets the AccessorScaleBinding for Y.
   */
  public y(): Plots.ITransformableAccessorScaleBinding<Y, number>;
  /**
   * Sets Y to a constant number or the result of an Accessor<number>.
   *
   * @param {number|Accessor<number>} y
   * @returns {Plots.Rectangle} The calling Rectangle Plot.
   */
  public y(y: number | IAccessor<number>): this;
  /**
   * Sets Y to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {Y|Accessor<Y>} y
   * @param {Scale<Y, number>} yScale
   * @returns {Plots.Rectangle} The calling Rectangle Plot.
   */
  public y(y: Y | IAccessor<Y>, yScale: Scale<Y, number>, postScale?: IRangeProjector<number>): this;
  public y(y?: number | IAccessor<number> | Y | IAccessor<Y>, yScale?: Scale<Y, number>, postScale?: IRangeProjector<number>): any {
    if (y == null) {
      return super.y();
    }

    if (yScale == null) {
      super.y(<number | IAccessor<number>>y);
    } else {
      super.y(<Y | IAccessor<Y>>y, yScale, postScale);
    }

    if (yScale != null) {
      const y2Binding = this.y2();
      const y2 = y2Binding && y2Binding.accessor;
      if (y2 != null) {
        this._bindProperty(Rectangle._Y2_KEY, y2, yScale, y2Binding.postScale);
      }
    }

    // The x and y scales should render in bands with no padding for category scales
    if (yScale instanceof Scales.Category) {
      (<Scales.Category> <any> yScale).innerPadding(0).outerPadding(0);
    }

    return this;
  }

  /**
   * Gets the AccessorScaleBinding for Y2.
   */
  public y2(): Plots.ITransformableAccessorScaleBinding<Y, number>;
  /**
   * Sets Y2 to a constant number or the result of an Accessor.
   * If a Scale has been set for Y, it will also be used to scale Y2.
   *
   * @param {number|Accessor<number>|Y|Accessor<Y>} y2
   * @returns {Plots.Rectangle} The calling Rectangle Plot.
   */
  public y2(y2: number | IAccessor<number> | Y | IAccessor<Y>, postScale?: IRangeProjector<number>): this;
  public y2(y2?: number | IAccessor<number> | Y | IAccessor<Y>, postScale?: IRangeProjector<number>): any {
    if (y2 == null) {
      return this._propertyBindings.get(Rectangle._Y2_KEY);
    }

    const yBinding = this.y();
    const yScale = yBinding && yBinding.scale;
    this._bindProperty(Rectangle._Y2_KEY, y2, yScale, postScale);

    this.render();
    return this;
  }

  /**
   * Gets the PlotEntities at a particular Point.
   *
   * @param {Point} point The point to query.
   * @returns {PlotEntity[]} The PlotEntities at the particular point
   */
  public entitiesAt(point: Point) {
    const attrToProjector = this._getAttrToProjector();
    return this.entities().filter((entity) => {
      const datum = entity.datum;
      const index = entity.index;
      const dataset = entity.dataset;
      const x = attrToProjector["x"](datum, index, dataset);
      const y = attrToProjector["y"](datum, index, dataset);
      const width = attrToProjector["width"](datum, index, dataset);
      const height = attrToProjector["height"](datum, index, dataset);
      return x <= point.x && point.x <= x + width && y <= point.y && point.y <= y + height;
    });
  }

  protected _entityBounds(entity: Plots.IPlotEntity | Plots.ILightweightPlotEntity) {
    const { datum, index, dataset } = entity;
    return this._entityBBox(datum, index, dataset, this._getAttrToProjector());
  }

  private _entityBBox(datum: any, index: number, dataset: Dataset, attrToProjector: AttributeToProjector): Pick<SVGRect, "x" | "y" | "width" | "height"> {
    return {
      x: attrToProjector["x"](datum, index, dataset),
      y: attrToProjector["y"](datum, index, dataset),
      width: attrToProjector["width"](datum, index, dataset),
      height: attrToProjector["height"](datum, index, dataset),
    };
  }

  /**
   * Gets the accessor for labels.
   *
   * @returns {Accessor<string>}
   */
  public label(): IAccessor<string>;
  /**
   * Sets the text of labels to the result of an Accessor.
   *
   * @param {Accessor<string>} label
   * @returns {Plots.Rectangle} The calling Rectangle Plot.
   */
  public label(label: IAccessor<string>): this;
  public label(label?: IAccessor<string>): any {
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

  protected _propertyProjectors(): AttributeToProjector {
    const attrToProjector = super._propertyProjectors();
    if (this.x2() != null) {
      attrToProjector["x2"] = Plot._scaledAccessor(this.x2());
    }
    if (this.y2() != null) {
      attrToProjector["y2"] = Plot._scaledAccessor(this.y2());
    }
    return attrToProjector;
  }

  protected _pixelPoint(datum: any, index: number, dataset: Dataset) {
    const attrToProjector = this._getAttrToProjector();
    const rectX = attrToProjector["x"](datum, index, dataset);
    const rectY = attrToProjector["y"](datum, index, dataset);
    const rectWidth = attrToProjector["width"](datum, index, dataset);
    const rectHeight = attrToProjector["height"](datum, index, dataset);
    const x = rectX + rectWidth / 2;
    const y = rectY + rectHeight / 2;
    return { x: x, y: y };
  }

  private _rectangleWidth(scale: Scale<any, number>) {
    if (scale instanceof Scales.Category) {
      return (<Scales.Category> scale).rangeBand();
    } else {
      const accessor = scale === this.x().scale ? this.x().accessor : this.y().accessor;
      const accessorData = d3.set(Utils.Array.flatten(this.datasets().map((dataset) => {
        return dataset.data().map((d, i) => accessor(d, i, dataset).valueOf());
      }))).values().map((value) => +value);
      // Get the absolute difference between min and max
      const min = Utils.Math.min(accessorData, 0);
      const max = Utils.Math.max(accessorData, 0);
      const scaledMin = scale.scale(min);
      const scaledMax = scale.scale(max);
      return (scaledMax - scaledMin) / Math.abs(max - min);
    }
  }

  protected _getDataToDraw(): Utils.Map<Dataset, any[]> {
    const dataToDraw = new Utils.Map<Dataset, any[]>();
    const attrToProjector = this._getAttrToProjector();
    this.datasets().forEach((dataset) => {
      const data = dataset.data().map((d, i) => {
        const isValid = (
          Utils.Math.isValidNumber(attrToProjector["x"](d, i, dataset)) &&
          Utils.Math.isValidNumber(attrToProjector["y"](d, i, dataset)) &&
          Utils.Math.isValidNumber(attrToProjector["width"](d, i, dataset)) &&
          Utils.Math.isValidNumber(attrToProjector["height"](d, i, dataset)));
        return isValid ? d : null;
      });
      dataToDraw.set(dataset, data);
    });
    return dataToDraw;
  }

  protected _additionalPaint(time: number) {
    this._renderArea.selectAll(".label-area").remove();
    if (this._labelsEnabled && this.label() != null) {
      Utils.Window.setTimeout(() => this._drawLabels(), time);
    }
  }

  private _drawLabels() {
    const dataToDraw = this._getDataToDraw();
    this.datasets().forEach((dataset, i) => this._drawLabel(dataToDraw, dataset, i));
  }

  private _drawLabel(dataToDraw: Utils.Map<Dataset, any[]>, dataset: Dataset, datasetIndex: number) {
    const attrToProjector = this._getAttrToProjector();
    const labelArea = this._renderArea.append("g").classed("label-area", true);

    const context = new Typesettable.SvgContext(labelArea.node() as SVGElement);
    const measurer = new Typesettable.CacheMeasurer(context);
    const writer = new Typesettable.Writer(measurer, context);
    const xRange = this.x().scale.range();
    const yRange = this.y().scale.range();
    const xMin = Math.min.apply(null, xRange);
    const xMax = Math.max.apply(null, xRange);
    const yMin = Math.min.apply(null, yRange);
    const yMax = Math.max.apply(null, yRange);
    const data = dataToDraw.get(dataset);
    const dataLength = data.length;
    for (let datumIndex = 0; datumIndex < dataLength; datumIndex++) {
      const datum = data[datumIndex];

      if (datum == null) {
        continue;
      }

      const label = "" + this.label()(datum, datumIndex, dataset);
      const measurement = measurer.measure(label);

      let x = attrToProjector["x"](datum, datumIndex, dataset);
      let y = attrToProjector["y"](datum, datumIndex, dataset);
      const width = attrToProjector["width"](datum, datumIndex, dataset);
      const height = attrToProjector["height"](datum, datumIndex, dataset);
      if (measurement.height <= height && measurement.width <= width) {

        const horizontalOffset = (width - measurement.width) / 2;
        const verticalOffset = (height - measurement.height) / 2;
        x += horizontalOffset;
        y += verticalOffset;

        const xLabelRange = { min: x, max: x + measurement.width };
        const yLabelRange = { min: y, max: y + measurement.height };
        if (xLabelRange.min < xMin || xLabelRange.max > xMax || yLabelRange.min < yMin || yLabelRange.max > yMax) {
          continue;
        }
        if (this._overlayLabel(xLabelRange, yLabelRange, datumIndex, datasetIndex, dataToDraw)) {
          continue;
        }

        const color = attrToProjector["fill"](datum, datumIndex, dataset);
        const dark = Utils.Color.contrast("white", color) * 1.6 < Utils.Color.contrast("black", color);
        const g = labelArea.append("g").attr("transform", "translate(" + x + "," + y + ")");
        const className = dark ? "dark-label" : "light-label";
        g.classed(className, true);

        writer.write(label, measurement.width, measurement.height, {
          xAlign: "center",
          yAlign: "center",
        }, g.node());
      }
    }
  }

  private _overlayLabel(labelXRange: Range, labelYRange: Range, datumIndex: number, datasetIndex: number,
                        dataToDraw: Utils.Map<Dataset, any[]>) {
    const attrToProjector = this._getAttrToProjector();
    const datasets = this.datasets();
    for (let i = datasetIndex; i < datasets.length; i++) {
      const dataset = datasets[i];
      const data = dataToDraw.get(dataset);
      const dataLen = data.length;
      for (let j = (i === datasetIndex ? datumIndex + 1 : 0); j < dataLen; j++) {
        if (Utils.DOM.intersectsBBox(labelXRange, labelYRange, this._entityBBox(data[j], j, dataset, attrToProjector))) {
          return true;
        }
      }
    }
    return false;
  }
}

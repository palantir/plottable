import * as d3 from "d3";

import { BaseXYPlot, IXYPlot } from "./baseXYPlot";

import * as Plots from "./";
import * as Drawers from "../drawers";
import { EntityAdapter, DrawerFactory }  from "./basePlot";
import * as Scales from "../scales";
import * as Utils from "../utils";
import { Null } from "../animators";

import { PlotEntity } from "./commons";
import { LabeledComponent } from "../components/labeled";

import { Dataset } from "../core/dataset";
import { Accessor, AttributeToProjector, Bounds, Point, Projector, Range } from "../core/interfaces";
import { Scale } from "../scales/scale";

export interface IRectanglePlot<X, Y> extends IXYPlot<X, Y> {
  /**
   * Gets the Entities that intersect the Bounds.
   *
   * @param {Bounds} bounds
   * @returns {PlotEntity[]}
   */
  entitiesIn(bounds: Bounds): PlotEntity[];
  /**
   * Gets the Entities that intersect the area defined by the ranges.
   *
   * @param {Range} xRange
   * @param {Range} yRange
   * @returns {PlotEntity[]}
   */
  entitiesIn(xRange: Range, yRange: Range): PlotEntity[];
  entitiesIn(xRangeOrBounds: Range | Bounds, yRange?: Range): PlotEntity[];
  /**
   * Gets the AccessorScaleBinding for X2.
   */
  x2(): Plots.TransformableAccessorScaleBinding<X, number>;
  /**
   * Sets X2 to a constant number or the result of an Accessor.
   * If a Scale has been set for X, it will also be used to scale X2.
   *
   * @param {number|Accessor<number>|X|Accessor<X>} x2
   * @returns {Plots.Rectangle} The calling Rectangle Plot.
   */
  x2(x2: number | Accessor<number> | X | Accessor<X>): this;
  x2(x2?: number | Accessor<number> | X | Accessor<X>): any;
  /**
   * Gets the AccessorScaleBinding for Y2.
   */
  y2(): Plots.TransformableAccessorScaleBinding<Y, number>;
  /**
   * Sets Y2 to a constant number or the result of an Accessor.
   * If a Scale has been set for Y, it will also be used to scale Y2.
   *
   * @param {number|Accessor<number>|Y|Accessor<Y>} y2
   * @returns {Plots.Rectangle} The calling Rectangle Plot.
   */
  y2(y2: number | Accessor<number> | Y | Accessor<Y>): this;
  y2(y2?: number | Accessor<number> | Y | Accessor<Y>): any
}

export class BaseRectanglePlot<X, Y, P extends PlotEntity> extends BaseXYPlot<X, Y, P> implements IRectanglePlot<X, Y> {
  private static _X2_KEY = "x2";
  private static _Y2_KEY = "y2";

  protected _component: LabeledComponent;

  constructor(drawerFactory: DrawerFactory, entityAdapter: EntityAdapter<P>, component: LabeledComponent) {
    super(drawerFactory, entityAdapter, component);
  }

  public entitiesAt(point: Point) {
    let attrToProjector = this._generateAttrToProjector();
    return this.entities().filter((entity) => {
      let datum = entity.datum;
      let index = entity.index;
      let dataset = entity.dataset;
      let x = attrToProjector["x"](datum, index, dataset);
      let y = attrToProjector["y"](datum, index, dataset);
      let width = attrToProjector["width"](datum, index, dataset);
      let height = attrToProjector["height"](datum, index, dataset);
      return x <= point.x && point.x <= x + width && y <= point.y && point.y <= y + height;
    });
  }

  public entitiesIn(bounds: Bounds): P[];

  public entitiesIn(xRange: Range, yRange: Range): P[];
  public entitiesIn(xRangeOrBounds: Range | Bounds, yRange?: Range): P[] {
    let dataXRange: Range;
    let dataYRange: Range;
    if (yRange == null) {
      let bounds = (<Bounds> xRangeOrBounds);
      dataXRange = { min: bounds.topLeft.x, max: bounds.bottomRight.x };
      dataYRange = { min: bounds.topLeft.y, max: bounds.bottomRight.y };
    } else {
      dataXRange = (<Range> xRangeOrBounds);
      dataYRange = yRange;
    }
    return this._entitiesIntersecting(dataXRange, dataYRange);
  }

  public x(): Plots.TransformableAccessorScaleBinding<X, number>;
  public x(x: number | Accessor<number>): this;
  public x(x: X | Accessor<X>, xScale: Scale<X, number>): this;
  public x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any {
    if (x == null) {
      return super.x();
    }

    if (xScale == null) {
      super.x(<number | Accessor<number>>x);
    } else {
      super.x(<X | Accessor<X>>x, xScale);
    }

    if (xScale != null) {
      let x2Binding = this.x2();
      let x2 = x2Binding && x2Binding.accessor;
      if (x2 != null) {
        this._bindProperty(BaseRectanglePlot._X2_KEY, x2, xScale);
      }
    }

    // The x and y scales should render in bands with no padding for category scales
    if (xScale instanceof Scales.Category) {
      (<Scales.Category> <any> xScale).innerPadding(0).outerPadding(0);
    }

    return this;
  }
  public x2(): Plots.TransformableAccessorScaleBinding<X, number>;
  public x2(x2: number | Accessor<number> | X | Accessor<X>): this;
  public x2(x2?: number | Accessor<number> | X | Accessor<X>): any {
    if (x2 == null) {
      return this._propertyBindings.get(BaseRectanglePlot._X2_KEY);
    }

    let xBinding = this.x();
    let xScale = xBinding && xBinding.scale;
    this._bindProperty(BaseRectanglePlot._X2_KEY, x2, xScale);
    return this;
  }

  public y(): Plots.TransformableAccessorScaleBinding<Y, number>;
  public y(y: number | Accessor<number>): this;
  public y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): this;
  public y(y?: number | Accessor<number> | Y | Accessor<Y>, yScale?: Scale<Y, number>): any {
    if (y == null) {
      return super.y();
    }

    if (yScale == null) {
      super.y(<number | Accessor<number>>y);
    } else {
      super.y(<Y | Accessor<Y>>y, yScale);
    }

    if (yScale != null) {
      let y2Binding = this.y2();
      let y2 = y2Binding && y2Binding.accessor;
      if (y2 != null) {
        this._bindProperty(BaseRectanglePlot._Y2_KEY, y2, yScale);
      }
    }

    // The x and y scales should render in bands with no padding for category scales
    if (yScale instanceof Scales.Category) {
      (<Scales.Category> <any> yScale).innerPadding(0).outerPadding(0);
    }

    return this;
  }
  public y2(): Plots.TransformableAccessorScaleBinding<Y, number>;
  public y2(y2: number | Accessor<number> | Y | Accessor<Y>): this;
  public y2(y2?: number | Accessor<number> | Y | Accessor<Y>): any {
    if (y2 == null) {
      return this._propertyBindings.get(BaseRectanglePlot._Y2_KEY);
    }

    let yBinding = this.y();
    let yScale = yBinding && yBinding.scale;
    this._bindProperty(BaseRectanglePlot._Y2_KEY, y2, yScale);
    return this;
  }

  protected _additionalPaint(time: number) {
    this._component.drawLabels(this._getDataToDraw(), this._generateAttrToProjector(), time);
  }

  protected _filterForProperty(property: string) {
    if (property === "x2") {
      return super._filterForProperty("x");
    } else if (property === "y2") {
      return super._filterForProperty("y");
    }
    return super._filterForProperty(property);
  }

  protected _generateAttrToProjector() {
    let attrToProjector = super._generateAttrToProjector();

    // Copy each of the different projectors.
    let xAttr = BaseRectanglePlot._scaledAccessor(this.x());
    let x2Attr = attrToProjector[BaseRectanglePlot._X2_KEY];
    let yAttr = BaseRectanglePlot._scaledAccessor(this.y());
    let y2Attr = attrToProjector[BaseRectanglePlot._Y2_KEY];

    let xScale = this.x().scale;
    let yScale = this.y().scale;

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
    delete attrToProjector[BaseRectanglePlot._X2_KEY];
    delete attrToProjector[BaseRectanglePlot._Y2_KEY];

    return attrToProjector;
  }

  protected _generateDrawSteps(): Drawers.DrawStep[] {
    return [{ attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("rectangles") }];
  }

  protected _getDataToDraw(): Utils.Map<Dataset, any[]> {
    let dataToDraw = new Utils.Map<Dataset, any[]>();
    let attrToProjector = this._generateAttrToProjector();
    this.datasets().forEach((dataset) => {
      let data = dataset.data().filter((d, i) => Utils.Math.isValidNumber(attrToProjector["x"](d, i, dataset)) &&
      Utils.Math.isValidNumber(attrToProjector["y"](d, i, dataset)) &&
      Utils.Math.isValidNumber(attrToProjector["width"](d, i, dataset)) &&
      Utils.Math.isValidNumber(attrToProjector["height"](d, i, dataset)));
      dataToDraw.set(dataset, data);
    });
    return dataToDraw;
  }


  protected _pixelPoint(datum: any, index: number, dataset: Dataset) {
    let attrToProjector = this._generateAttrToProjector();
    let rectX = attrToProjector["x"](datum, index, dataset);
    let rectY = attrToProjector["y"](datum, index, dataset);
    let rectWidth = attrToProjector["width"](datum, index, dataset);
    let rectHeight = attrToProjector["height"](datum, index, dataset);
    let x = rectX + rectWidth / 2;
    let y = rectY + rectHeight / 2;
    return { x: x, y: y };
  }

  protected _propertyProjectors(): AttributeToProjector {
    let attrToProjector = super._propertyProjectors();
    if (this.x2() != null) {
      attrToProjector["x2"] = BaseRectanglePlot._scaledAccessor(this.x2());
    }
    if (this.y2() != null) {
      attrToProjector["y2"] = BaseRectanglePlot._scaledAccessor(this.y2());
    }
    return attrToProjector;
  }

  protected _updateExtentsForProperty(property: string) {
    super._updateExtentsForProperty(property);
    if (property === "x") {
      super._updateExtentsForProperty("x2");
    } else if (property === "y") {
      super._updateExtentsForProperty("y2");
    }
  }

  private _entityBBox(datum: any, index: number, dataset: Dataset, attrToProjector: AttributeToProjector): SVGRect {
    return {
      x: attrToProjector["x"](datum, index, dataset),
      y: attrToProjector["y"](datum, index, dataset),
      width: attrToProjector["width"](datum, index, dataset),
      height: attrToProjector["height"](datum, index, dataset),
    };
  }

  private _entitiesIntersecting(xValOrRange: number | Range, yValOrRange: number | Range): P[] {
    let intersected: P[] = [];
    let attrToProjector = this._generateAttrToProjector();
    this.entities().forEach((entity) => {
      if (Utils.DOM.intersectsBBox(xValOrRange, yValOrRange,
        this._entityBBox(entity.datum, entity.index, entity.dataset, attrToProjector))) {
        intersected.push(entity);
      }
    });
    return intersected;
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
}

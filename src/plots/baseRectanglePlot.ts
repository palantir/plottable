import * as d3 from "d3";

import { BaseXYPlot, IXYPlot } from "./baseXYPlot";

import * as Plots from "./";
import * as Drawers from "../drawers";
import * as Scales from "../scales";
import * as Utils from "../utils";
import { Null } from "../animators";

import { Dataset } from "../core/dataset";
import { Accessor, AttributeToProjector, Projector } from "../core/interfaces";
import { Scale } from "../scales/scale";

export interface IRectanglePlot<X, Y> extends IXYPlot<X, Y> {
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

export class BaseRectanglePlot<X, Y> extends BaseXYPlot<X, Y> implements IRectanglePlot<X, Y> {
  private static _X2_KEY = "x2";
  private static _Y2_KEY = "y2";

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

    let widthProjection: Projector = null;
    let heightProjection: Projector = null;
    let xProjection: Projector = null;
    let yProjection: Projector = null;

    if (x2Attr != null) {
      widthProjection = (d, i, dataset) => Math.abs(x2Attr(d, i, dataset) - xAttr(d, i, dataset));
      xProjection = (d, i, dataset) => Math.min(x2Attr(d, i, dataset), xAttr(d, i, dataset));
    } else {
      widthProjection = (d, i, dataset) => this._rectangleWidth(xScale);
      xProjection = (d, i, dataset) => xAttr(d, i, dataset) - 0.5 * widthProjection(d, i, dataset);
    }

    if (y2Attr != null) {
      heightProjection = (d, i, dataset) => Math.abs(y2Attr(d, i, dataset) - yAttr(d, i, dataset));
      yProjection = (d, i, dataset) => {
        return Math.max(y2Attr(d, i, dataset), yAttr(d, i, dataset)) - heightProjection(d, i, dataset);
      };
    } else {
      heightProjection = (d, i, dataset) => this._rectangleWidth(yScale);
      yProjection = (d, i, dataset) => yAttr(d, i, dataset) - 0.5 * heightProjection(d, i, dataset);
    }

    attrToProjector["fillRect"] = (d, i, dataset) => {
      return {
        height: heightProjection(d, i, dataset),
        width: widthProjection(d, i, dataset),
        x: xProjection(d, i, dataset),
        y: yProjection(d, i, dataset),
      };
    };

    // Clean up the attributes projected onto the SVG elements
    delete attrToProjector[BaseRectanglePlot._X2_KEY];
    delete attrToProjector[BaseRectanglePlot._Y2_KEY];

    return attrToProjector;
  }

  protected _generateDrawSteps(): Drawers.DrawStep[] {
    return [{ attrToProjector: this._generateAttrToProjector(), animator: new Null() }];
  }

  protected _getDataToDraw(): Utils.Map<Dataset, any[]> {
    let dataToDraw = new Utils.Map<Dataset, any[]>();
    const fillProjector = this._generateAttrToProjector()["fillRect"]
    this.datasets().forEach((dataset) => {
      let data = dataset.data().filter((d, i) => {
          const fillProjection = fillProjector(d, i, dataset);

          return Utils.Math.isValidNumber(fillProjection.x) &&
            Utils.Math.isValidNumber(fillProjection.y) &&
            Utils.Math.isValidNumber(fillProjection.width) &&
            Utils.Math.isValidNumber(fillProjection.height);
      });

      dataToDraw.set(dataset, data);
    });
    return dataToDraw;
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

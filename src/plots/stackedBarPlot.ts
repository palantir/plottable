/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as SVGTypewriter from "svg-typewriter";

import { Accessor, Point } from "../core/interfaces";
import { Dataset } from "../core/dataset";
import { Scale } from "../scales/scale";
import * as Utils from "../utils";

import * as Plots from "./";
import { Bar } from "./barPlot";

export class StackedBar<X, Y> extends Bar<X, Y> {
  protected static _STACKED_BAR_LABEL_PADDING = 5;

  private _labelArea: d3.Selection<void>;
  private _measurer: SVGTypewriter.CacheMeasurer;
  private _writer: SVGTypewriter.Writer;
  private _stackingOrder: Utils.Stacking.IStackingOrder;
  private _stackingResult: Utils.Stacking.StackingResult;
  private _stackedExtent: number[];

  /**
   * A StackedBar Plot stacks bars across Datasets based on the primary value of the bars.
   *   On a vertical StackedBar Plot, the bars with the same X value are stacked.
   *   On a horizontal StackedBar Plot, the bars with the same Y value are stacked.
   *
   * @constructor
   * @param {Scale} xScale
   * @param {Scale} yScale
   * @param {string} [orientation="vertical"] One of "vertical"/"horizontal".
   */
  constructor(orientation = Bar.ORIENTATION_VERTICAL) {
    super(orientation);
    this.addClass("stacked-bar-plot");
    this._stackingOrder = "bottomup";
    this._stackingResult = new Utils.Map<Dataset, Utils.Map<string, Utils.Stacking.StackedDatum>>();
    this._stackedExtent = [];
  }

  public x(): Plots.TransformableAccessorScaleBinding<X, number>;
  public x(x: number | Accessor<number>): this;
  public x(x: X | Accessor<X>, xScale: Scale<X, number>): this;
  public x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any {
    if (x == null) {
      return super.x();
    }
    if (xScale == null) {
      super.x(<number | Accessor<number>> x);
    } else {
      super.x(<X | Accessor<X>> x, xScale);
    }

    this._updateStackExtentsAndOffsets();
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
      super.y(<number | Accessor<number>> y);
    } else {
      super.y(<Y | Accessor<Y>> y, yScale);
    }

    this._updateStackExtentsAndOffsets();
    return this;
  }

  /**
   * Gets the stacking order of the plot.
   */
  public stackingOrder(): Utils.Stacking.IStackingOrder;
  /**
   * Sets the stacking order of the plot.
   *
   * By default, stacked plots are "bottomup", meaning for positive data, the
   * first series will be placed at the bottom of the scale and subsequent
   * data series will by stacked on top. This can be reveresed by setting
   * stacking order to "topdown".
   *
   * @returns {Plots.StackedArea} This plot
   */
  public stackingOrder(stackingOrder: Utils.Stacking.IStackingOrder): this;
  public stackingOrder(stackingOrder?: Utils.Stacking.IStackingOrder): any {
    if (stackingOrder == null) {
      return this._stackingOrder;
    }
    this._stackingOrder = stackingOrder;
    this._onDatasetUpdate();
    return this;
  }

  protected _setup() {
    super._setup();
    this._labelArea = this._renderArea.append("g").classed(Bar._LABEL_AREA_CLASS, true);
    this._measurer = new SVGTypewriter.CacheMeasurer(this._labelArea);
    this._writer = new SVGTypewriter.Writer(this._measurer);
  }

  protected _drawLabels() {
    super._drawLabels();

    // remove all current labels before redrawing
    this._labelArea.selectAll("g").remove();

    const baselineValue = +this.baselineValue();
    const primaryScale: Scale<any, number> = this._isVertical ? this.x().scale : this.y().scale;
    const secondaryScale: Scale<any, number> = this._isVertical ? this.y().scale : this.x().scale;
    const { maximumExtents, minimumExtents } = Utils.Stacking.stackedExtents<Date | string | number>(this._stackingResult);
    const barWidth = this._getBarPixelWidth();
    const anyTooWide: boolean[] = [];

    const drawLabel = (text: string, measurement: { height: number, width: number }, labelPosition: Point) => {
      const { x, y } = labelPosition;
      const { height, width } = measurement;
      const tooWide = this._isVertical
        ? ( width > barWidth - (2 * StackedBar._LABEL_PADDING) )
        : ( height > barWidth - (2 * StackedBar._LABEL_PADDING) );

      const hideLabel = x < 0
        || y < 0
        || x + width > this.width()
        || y + height > this.height()
        || tooWide;

      if (!hideLabel) {
        const labelContainer = this._labelArea.append("g").attr("transform", `translate(${x}, ${y})`);
        labelContainer.classed("stacked-bar-label", true);

        const writeOptions = {
          selection: labelContainer,
          xAlign: "center",
          yAlign: "center",
          textRotation: 0,
        };

        this._writer.write(text, measurement.width, measurement.height, writeOptions);
      }

      return tooWide;
    };

    maximumExtents.forEach((maximum) => {
      if (maximum.extent !== baselineValue) {
        // only draw sums for values not at the baseline

        const text = this.labelFormatter()(maximum.extent);
        const measurement = this._measurer.measure(text);

        const primaryTextMeasurement = this._isVertical ? measurement.width : measurement.height;
        const secondaryTextMeasurement = this._isVertical ? measurement.height : measurement.width;

        const x = this._isVertical
          ? primaryScale.scale(maximum.axisValue) - primaryTextMeasurement / 2
          : secondaryScale.scale(maximum.extent) + StackedBar._STACKED_BAR_LABEL_PADDING;
        const y = this._isVertical
          ? secondaryScale.scale(maximum.extent) - secondaryTextMeasurement - StackedBar._STACKED_BAR_LABEL_PADDING
          : primaryScale.scale(maximum.axisValue) - primaryTextMeasurement / 2;

        anyTooWide.push(drawLabel(text, measurement, { x, y }));
      }
    });

    minimumExtents.forEach((minimum) => {
      if (minimum.extent !== baselineValue) {
        const text = this.labelFormatter()(minimum.extent);
        const measurement = this._measurer.measure(text);

        const primaryTextMeasurement = this._isVertical ? measurement.width : measurement.height;
        const secondaryTextMeasurement = this._isVertical ? measurement.height : measurement.width;

        const x = this._isVertical
          ? primaryScale.scale(minimum.axisValue) - primaryTextMeasurement / 2
          : secondaryScale.scale(minimum.extent) - secondaryTextMeasurement - StackedBar._STACKED_BAR_LABEL_PADDING;
        const y = this._isVertical
          ? secondaryScale.scale(minimum.extent) + StackedBar._STACKED_BAR_LABEL_PADDING
          : primaryScale.scale(minimum.axisValue) - primaryTextMeasurement / 2;

        anyTooWide.push(drawLabel(text, measurement, { x, y }));
      }
    });

    if (anyTooWide.some((d) => d)) {
      this._labelArea.selectAll("g").remove();
    }
  }

  protected _generateAttrToProjector() {
    let attrToProjector = super._generateAttrToProjector();

    let valueAttr = this._isVertical ? "y" : "x";
    let keyAttr = this._isVertical ? "x" : "y";
    let primaryScale: Scale<any, number> = this._isVertical ? this.y().scale : this.x().scale;
    let primaryAccessor = this._propertyBindings.get(valueAttr).accessor;
    let keyAccessor = this._propertyBindings.get(keyAttr).accessor;
    let normalizedKeyAccessor = (datum: any, index: number, dataset: Dataset) => {
      return Utils.Stacking.normalizeKey(keyAccessor(datum, index, dataset));
    };
    let getStart = (d: any, i: number, dataset: Dataset) =>
      primaryScale.scale(this._stackingResult.get(dataset).get(normalizedKeyAccessor(d, i, dataset)).offset);
    let getEnd = (d: any, i: number, dataset: Dataset) =>
      primaryScale.scale(+primaryAccessor(d, i, dataset) +
        this._stackingResult.get(dataset).get(normalizedKeyAccessor(d, i, dataset)).offset);

    let heightF = (d: any, i: number, dataset: Dataset) => {
      return Math.abs(getEnd(d, i, dataset) - getStart(d, i, dataset));
    };
    attrToProjector[this._isVertical ? "height" : "width"] = heightF;

    let attrFunction = (d: any, i: number, dataset: Dataset) =>
      +primaryAccessor(d, i, dataset) < 0 ? getStart(d, i, dataset) : getEnd(d, i, dataset);
    attrToProjector[valueAttr] = (d: any, i: number, dataset: Dataset) =>
      this._isVertical ? attrFunction(d, i, dataset) : attrFunction(d, i, dataset) - heightF(d, i, dataset);

    return attrToProjector;
  }

  protected _onDatasetUpdate() {
    this._updateStackExtentsAndOffsets();
    super._onDatasetUpdate();
    return this;
  }

  protected _updateExtentsForProperty(property: string) {
    super._updateExtentsForProperty(property);
    if ((property === "x" || property === "y") && this._projectorsReady()) {
      this._updateStackExtentsAndOffsets();
    }
  }

  protected _extentsForProperty(attr: string) {
    let primaryAttr = this._isVertical ? "y" : "x";
    if (attr === primaryAttr) {
      return [this._stackedExtent];
    } else {
      return super._extentsForProperty(attr);
    }
  }

  private _updateStackExtentsAndOffsets() {
    if (!this._projectorsReady()) {
      return;
    }

    let datasets = this.datasets();
    let keyAccessor = this._isVertical ? this.x().accessor : this.y().accessor;
    let valueAccessor = this._isVertical ? this.y().accessor : this.x().accessor;
    let filter = this._filterForProperty(this._isVertical ? "y" : "x");

    this._stackingResult = Utils.Stacking.stack(datasets, keyAccessor, valueAccessor, this._stackingOrder);
    this._stackedExtent = Utils.Stacking.stackedExtent(this._stackingResult, keyAccessor, filter);
  }

  public invalidateCache() {
    super.invalidateCache();
    this._measurer.reset();
  }
}

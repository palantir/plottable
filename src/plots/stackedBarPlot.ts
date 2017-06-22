/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as Typesettable from "typesettable";

import { Dataset } from "../core/dataset";
import { Formatter, identity } from "../core/formatters";
import { Bounds, IAccessor, Point, SimpleSelection } from "../core/interfaces";
import { Scale } from "../scales/scale";
import * as Utils from "../utils";

import * as Plots from "./";
import { Bar, BarOrientation } from "./barPlot";
import { Plot } from "./plot";
import { StackExtent } from "../utils/stackingUtils";

export class StackedBar<X, Y> extends Bar<X, Y> {
  protected static _STACKED_BAR_LABEL_PADDING = 5;

  private _extremaFormatter: Formatter = identity();
  private _labelArea: SimpleSelection<void>;
  private _measurer: Typesettable.CacheMeasurer;
  private _writer: Typesettable.Writer;
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
  constructor(orientation: BarOrientation = "vertical") {
    super(orientation);
    this.addClass("stacked-bar-plot");
    this._stackingOrder = "bottomup";
    this._stackingResult = new Utils.Map<Dataset, Utils.Map<string, Utils.Stacking.StackedDatum>>();
    this._stackedExtent = [];
  }

  public x(): Plots.ITransformableAccessorScaleBinding<X, number>;
  public x(x: number | IAccessor<number>): this;
  public x(x: X | IAccessor<X>, xScale: Scale<X, number>): this;
  public x(x?: number | IAccessor<number> | X | IAccessor<X>, xScale?: Scale<X, number>): any {
    if (x == null) {
      return super.x();
    }
    if (xScale == null) {
      super.x(<number | IAccessor<number>> x);
    } else {
      super.x(<X | IAccessor<X>> x, xScale);
    }

    this._updateStackExtentsAndOffsets();
    return this;
  }

  public y(): Plots.ITransformableAccessorScaleBinding<Y, number>;
  public y(y: number | IAccessor<number>): this;
  public y(y: Y | IAccessor<Y>, yScale: Scale<Y, number>): this;
  public y(y?: number | IAccessor<number> | Y | IAccessor<Y>, yScale?: Scale<Y, number>): any {
    if (y == null) {
      return super.y();
    }
    if (yScale == null) {
      super.y(<number | IAccessor<number>> y);
    } else {
      super.y(<Y | IAccessor<Y>> y, yScale);
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

  /**
   * Gets the Formatter for the stacked bar extrema labels.
   */
  public extremaFormatter(): Formatter;
  /**
   * Sets the Formatter for the stacked bar extrema labels. Extrema labels are the
   * numbers at the very top and bottom of the stack that aren't associated
   * with a single datum. Their value will be passed through this formatter
   * before being displayed.
   *
   * @param {Formatter} formatter
   * @returns {this}
   */
  public extremaFormatter(formatter: Formatter): this;

  public extremaFormatter(formatter?: Formatter): any {
    if (arguments.length === 0) {
      return this._extremaFormatter;
    } else {
      this._extremaFormatter = formatter;
      this.render();
      return this;
    }
  }

  protected _setup() {
    super._setup();
    this._labelArea = this._renderArea.append("g").classed(Bar._LABEL_AREA_CLASS, true);
    const context = new Typesettable.SvgContext(this._labelArea.node() as SVGElement);
    this._measurer = new Typesettable.CacheMeasurer(context);
    this._writer = new Typesettable.Writer(this._measurer, context);
  }

  protected _drawLabels() {
    super._drawLabels();

    // remove all current labels before redrawing
    this._labelArea.selectAll("g").remove();

    const baselineValue = +this.baselineValue();
    const positionScale = this.position().scale;
    const lengthScale = this.length().scale;
    const { maximumExtents, minimumExtents } = Utils.Stacking.stackedExtents<Date | string | number>(this._stackingResult);
    const anyTooWide: boolean[] = [];

    /**
     * Try drawing the text at the center of the bounds. This method does not draw
     * the text if the text would overflow outside of the plot.
     *
     * @param text
     * @param bounds
     * @returns {boolean}
     */
    const tryDrawLabel = (text: string, bounds: Bounds, barThickness: number) => {
      const { x, y } = bounds.topLeft;
      const width = bounds.bottomRight.x - bounds.topLeft.x;
      const height = bounds.bottomRight.y - bounds.topLeft.y;
      const textTooLong = this._isVertical
        ? ( width > barThickness - (2 * StackedBar._LABEL_PADDING) )
        : ( height > barThickness - (2 * StackedBar._LABEL_PADDING) );

      if (!textTooLong) {
        const labelContainer = this._labelArea.append("g").attr("transform", `translate(${x}, ${y})`);
        labelContainer.classed("stacked-bar-label", true);

        const writeOptions: Typesettable.IWriteOptions = {
          xAlign: "center",
          yAlign: "center",
        };
        this._writer.write(text, width, height, writeOptions, labelContainer.node());
      }

      return textTooLong;
    };

    const drawLabelsForExtents = (
          extents: Utils.Map<string | number, StackExtent<Date | number | string>>,
          computeLabelTopLeft: (
              stackEdge: Point,
              textDimensions: Typesettable.IDimensions,
              barThickness: number,
          ) => Point,
    ) => {
      extents.forEach((maximum) => {
        if (maximum.extent !== baselineValue) {
          // only draw sums for values not at the baseline

          const text = this.extremaFormatter()(maximum.extent);
          const textDimensions = this._measurer.measure(text);

          const { stackedDatum } = maximum;
          const { originalDatum, originalIndex, originalDataset } = stackedDatum;
          const barThickness = Plot._scaledAccessor(this.attr(Bar._BAR_THICKNESS_KEY))(originalDatum, originalIndex, originalDataset);

          /*
           * The stackEdge is aligned at the edge of the stack in the length dimension,
           * and in the center of the stack in the thickness dimension.
           */
          const stackEdgeLength = lengthScale.scale(maximum.extent);
          const stackCenterPosition =
              this._getPositionAttr(positionScale.scale(maximum.axisValue), barThickness) + barThickness / 2;

          const stackEdge = this._isVertical
              ? {
                x: stackCenterPosition,
                y: stackEdgeLength,
              }
              : {
                x: stackEdgeLength,
                y: stackCenterPosition,
              };

          const topLeft = computeLabelTopLeft(stackEdge, textDimensions, barThickness);

          const isTooWide = tryDrawLabel(
              text,
              {
                topLeft,
                bottomRight: {
                  x: topLeft.x + textDimensions.width,
                  y: topLeft.y + textDimensions.height,
                },
              },
              barThickness,
          );
          anyTooWide.push(isTooWide);
        }
      });
    };

    drawLabelsForExtents(maximumExtents, (stackEdge, measurement, thickness) => {
      const primaryTextMeasurement = this._isVertical ? measurement.width : measurement.height;
      const secondaryTextMeasurement = this._isVertical ? measurement.height : measurement.width;

      return {
        x: this._isVertical
            ? stackEdge.x - primaryTextMeasurement / 2
            : stackEdge.x + StackedBar._STACKED_BAR_LABEL_PADDING,
        y: this._isVertical
            ? stackEdge.y - secondaryTextMeasurement - StackedBar._STACKED_BAR_LABEL_PADDING
            : stackEdge.y - primaryTextMeasurement / 2,
      };
    });

    drawLabelsForExtents(minimumExtents, (stackEdge, measurement, thickness) => {
      const primaryTextMeasurement = this._isVertical ? measurement.width : measurement.height;
      const secondaryTextMeasurement = this._isVertical ? measurement.height : measurement.width;

      return {
        x: this._isVertical
            ? stackEdge.x - primaryTextMeasurement / 2
            : stackEdge.x - secondaryTextMeasurement - StackedBar._STACKED_BAR_LABEL_PADDING,
        y: this._isVertical
            ? stackEdge.y + StackedBar._STACKED_BAR_LABEL_PADDING
            : stackEdge.y - primaryTextMeasurement / 2,
      };
    });

    if (anyTooWide.some((d) => d)) {
      this._labelArea.selectAll("g").remove();
    }
  }

  protected _generateAttrToProjector() {
    const attrToProjector = super._generateAttrToProjector();

    const valueAttr = this._isVertical ? "y" : "x";
    const lengthScale = this.length().scale;
    const lengthAccessor = this.length().accessor;
    const positionAccessor = this.position().accessor;
    const normalizedPositionAccessor = (datum: any, index: number, dataset: Dataset) => {
      return Utils.Stacking.normalizeKey(positionAccessor(datum, index, dataset));
    };
    const getStart = (d: any, i: number, dataset: Dataset) =>
      lengthScale.scale(this._stackingResult.get(dataset).get(normalizedPositionAccessor(d, i, dataset)).offset);
    const getEnd = (d: any, i: number, dataset: Dataset) =>
      lengthScale.scale(+lengthAccessor(d, i, dataset) +
        this._stackingResult.get(dataset).get(normalizedPositionAccessor(d, i, dataset)).offset);

    const heightF = (d: any, i: number, dataset: Dataset) => {
      return Math.abs(getEnd(d, i, dataset) - getStart(d, i, dataset));
    };
    attrToProjector[this._isVertical ? "height" : "width"] = heightF;

    const attrFunction = (d: any, i: number, dataset: Dataset) =>
      +lengthAccessor(d, i, dataset) < 0 ? getStart(d, i, dataset) : getEnd(d, i, dataset);

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
    const primaryAttr = this._isVertical ? "y" : "x";
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

    const datasets = this.datasets();
    const positionAccessor = this.position().accessor;
    const lengthAccessor = this.length().accessor;
    const filter = this._filterForProperty(this._isVertical ? "y" : "x");

    this._stackingResult = Utils.Stacking.stack(datasets, positionAccessor, lengthAccessor, this._stackingOrder);
    this._stackedExtent = Utils.Stacking.stackedExtent(this._stackingResult, positionAccessor, filter);
  }

  public invalidateCache() {
    super.invalidateCache();
    this._measurer.reset();
  }
}

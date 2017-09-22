/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as Typesettable from "typesettable";

import { Dataset } from "../core/dataset";
import { Formatter, identity } from "../core/formatters";
import { Bounds, Point, SimpleSelection } from "../core/interfaces";
import { memThunk, Thunk } from "../memoize";
import * as Utils from "../utils";
import { StackExtent } from "../utils/stackingUtils";

import { Bar, BarOrientation } from "./barPlot";
import { Plot } from "./plot";

export class StackedBar<X, Y> extends Bar<X, Y> {
  protected static _EXTREMA_LABEL_MARGIN_FROM_BAR = 5;

  private _extremaFormatter: Formatter = identity();
  private _labelArea: SimpleSelection<void>;
  private _measurer: Typesettable.CacheMeasurer;
  private _writer: Typesettable.Writer;
  private _stackingOrder: Utils.Stacking.IStackingOrder;
  private _stackingResult: Thunk<Utils.Stacking.StackingResult> = memThunk(
      () => this.datasets(),
      () => this.position().accessor,
      () => this.length().accessor,
      () => this._stackingOrder,
      (datasets, positionAccessor, lengthAccessor, stackingOrder) => {
        return Utils.Stacking.stack(datasets, positionAccessor, lengthAccessor, stackingOrder);
      },
  );
  private _stackedExtent: Thunk<number[]> = memThunk(
      this._stackingResult,
      () => this.position().accessor,
      () => this._filterForProperty(this._isVertical ? "y" : "x"),
      (stackingResult, positionAccessor, filter) => {
        return Utils.Stacking.stackedExtent(stackingResult, positionAccessor, filter);
      },
  );

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
    const { maximumExtents, minimumExtents } = Utils.Stacking.stackedExtents<Date | string | number>(this._stackingResult());
    const anyTooWide: boolean[] = [];

    /**
     * Try drawing the text at the center of the bounds. This method does not draw
     * the text if the text would overflow outside of the plot.
     *
     * @param text
     * @param bounds
     * @returns {boolean}
     */
    const maybeDrawLabel = (text: string, bounds: Bounds, barThickness: number) => {
      const { x, y } = bounds.topLeft;
      const width = bounds.bottomRight.x - bounds.topLeft.x;
      const height = bounds.bottomRight.y - bounds.topLeft.y;
      const textTooLong = this._isVertical
        ? width > barThickness
        : height > barThickness;

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
          stacks: Utils.Map<string | number, StackExtent<Date | number | string>>,
          computeLabelTopLeft: (
              stackEdge: Point,
              textDimensions: Typesettable.IDimensions,
              barThickness: number,
          ) => Point,
    ) => {
      const attrToProjector = this._generateAttrToProjector();
      const plotWidth = this.width();
      const plotHeight = this.height();
      stacks.forEach((stack) => {
        if (stack.extent !== baselineValue) {
          // only draw sums for values not at the baseline

          const text = this.extremaFormatter()(stack.extent);
          const textDimensions = this._measurer.measure(text);

          const { stackedDatum } = stack;
          const { originalDatum, originalIndex, originalDataset } = stackedDatum;
          // only consider stack extents that are on the screen
          if (!this._isDatumOnScreen(
              attrToProjector,
              plotWidth,
              plotHeight,
              originalDatum,
              originalIndex,
              originalDataset)) {
            return;
          }
          const barThickness = Plot._scaledAccessor(this.attr(Bar._BAR_THICKNESS_KEY))(originalDatum, originalIndex, originalDataset);

          /*
           * The stackEdge is aligned at the edge of the stack in the length dimension,
           * and in the center of the stack in the thickness dimension.
           */
          const stackEdgeLength = lengthScale.scale(stack.extent);
          const stackCenterPosition =
              this._getPositionAttr(positionScale.scale(stack.axisValue), barThickness) + barThickness / 2;

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

          const isTooWide = maybeDrawLabel(
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
            : stackEdge.x + StackedBar._EXTREMA_LABEL_MARGIN_FROM_BAR,
        y: this._isVertical
            ? stackEdge.y - secondaryTextMeasurement
            : stackEdge.y - primaryTextMeasurement / 2,
      };
    });

    drawLabelsForExtents(minimumExtents, (stackEdge, measurement, thickness) => {
      const primaryTextMeasurement = this._isVertical ? measurement.width : measurement.height;
      const secondaryTextMeasurement = this._isVertical ? measurement.height : measurement.width;

      return {
        x: this._isVertical
            ? stackEdge.x - primaryTextMeasurement / 2
            : stackEdge.x - secondaryTextMeasurement,
        y: this._isVertical
            ? stackEdge.y + StackedBar._EXTREMA_LABEL_MARGIN_FROM_BAR
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
    const stackingResult = this._stackingResult();
    const getStart = (d: any, i: number, dataset: Dataset) =>
      lengthScale.scale(stackingResult.get(dataset).get(normalizedPositionAccessor(d, i, dataset)).offset);
    const getEnd = (d: any, i: number, dataset: Dataset) =>
      lengthScale.scale(+lengthAccessor(d, i, dataset) +
        stackingResult.get(dataset).get(normalizedPositionAccessor(d, i, dataset)).offset);

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

  protected getExtentsForProperty(attr: string) {
    const primaryAttr = this._isVertical ? "y" : "x";
    if (attr === primaryAttr) {
      return [this._stackedExtent()];
    } else {
      return super.getExtentsForProperty(attr);
    }
  }

  public invalidateCache() {
    super.invalidateCache();
    this._measurer.reset();
  }
}

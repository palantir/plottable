/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as SVGTypewriter from "svg-typewriter";
import * as Drawers from "../drawers";

import { Accessor, AttributeToProjector, Point } from "../core/interfaces";
import { IComponent } from "../components";
import { Dataset } from "../core/dataset";
import { Scale } from "../scales/scale";
import * as Utils from "../utils";

import * as Plots from "./";
import { SVGPlotEntity } from "../plots";
import { Bar } from "./barPlot";

import { BaseStackedBarPlot, IStackedBarPlot } from "./baseStackedBarPlot";

export class StackedBar<X, Y> extends Bar<X, Y> {
  protected static _STACKED_BAR_LABEL_PADDING = 5;

  protected _plot: BaseStackedBarPlot<X, Y, SVGPlotEntity>;

  private _labelArea: d3.Selection<void>;
  private _measurer: SVGTypewriter.Measurer;
  private _writer: SVGTypewriter.Writer;

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
    const plotStackingOrder = this._plot.stackingOrder(stackingOrder);

    if (stackingOrder == null) {
      return plotStackingOrder;
    }

    this._onDatasetUpdate();
    return this;
  }

  protected _setup() {
    super._setup();
    this._labelArea = this._renderArea.append("g").classed(Bar._LABEL_AREA_CLASS, true);
    this._measurer = new SVGTypewriter.CacheMeasurer(this._labelArea);
    this._writer = new SVGTypewriter.Writer(this._measurer);
  }

  protected _createPlot() {
    return new BaseStackedBarPlot((dataset) => new Drawers.Rectangle(dataset), StackedBar.SVGEntityAdapter, this);
  }

  public drawLabels(dataToDraw: Utils.Map<Dataset, any[]>, attrToProjector: AttributeToProjector, timeout: number) {
    super.drawLabels(dataToDraw, attrToProjector, timeout);

    // remove all current labels before redrawing
    this._labelArea.selectAll("g").remove();

    if (this.labelsEnabled()) {
      Utils.Window.setTimeout(() => {
        const baselineValue = +this.baselineValue();
        const primaryScale: Scale<any, number> = this._plot.isVertical() ? this.x().scale : this.y().scale;
        const secondaryScale: Scale<any, number> = this._plot.isVertical() ? this.y().scale : this.x().scale;
        const { maximumExtents, minimumExtents } = Utils.Stacking.stackedExtents<Date | string | number>(this._plot.stackingResult());
        const barWidth = this._plot.getBarPixelWidth();

        const drawLabel = (text: string, measurement: { height: number, width: number }, labelPosition: Point) => {
          const { x, y } = labelPosition;
          const { height, width } = measurement;
          const tooWide = this._plot.isVertical() ? ( width > barWidth ) : ( height > barWidth );

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
        };

        maximumExtents.forEach((maximum) => {
          if (maximum.extent !== baselineValue) {
            // only draw sums for values not at the baseline

            const text = this.labelFormatter()(maximum.extent);
            const measurement = this._measurer.measure(text);

            const primaryTextMeasurement = this._plot.isVertical() ? measurement.width : measurement.height;
            const secondaryTextMeasurement = this._plot.isVertical() ? measurement.height : measurement.width;

            const x = this._plot.isVertical()
              ? primaryScale.scale(maximum.axisValue) - primaryTextMeasurement / 2
              : secondaryScale.scale(maximum.extent) + StackedBar._STACKED_BAR_LABEL_PADDING;
            const y = this._plot.isVertical()
              ? secondaryScale.scale(maximum.extent) - secondaryTextMeasurement - StackedBar._STACKED_BAR_LABEL_PADDING
              : primaryScale.scale(maximum.axisValue) - primaryTextMeasurement / 2;

            drawLabel(text, measurement, { x, y });
          }
        });

        minimumExtents.forEach((minimum) => {
          if (minimum.extent !== baselineValue) {
            const text = this.labelFormatter()(minimum.extent);
            const measurement = this._measurer.measure(text);

            const primaryTextMeasurement = this._plot.isVertical() ? measurement.width : measurement.height;
            const secondaryTextMeasurement = this._plot.isVertical() ? measurement.height : measurement.width;

            const x = this._plot.isVertical()
              ? primaryScale.scale(minimum.axisValue) - primaryTextMeasurement / 2
              : secondaryScale.scale(minimum.extent) - secondaryTextMeasurement - StackedBar._STACKED_BAR_LABEL_PADDING;
            const y = this._plot.isVertical()
              ? secondaryScale.scale(minimum.extent) + StackedBar._STACKED_BAR_LABEL_PADDING
              : primaryScale.scale(minimum.axisValue) - primaryTextMeasurement / 2;

            drawLabel(text, measurement, { x, y });
          }
        });
      }, timeout);
    }
  }
}

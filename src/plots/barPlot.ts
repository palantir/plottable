/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import * as SVGTypewriter from "svg-typewriter";

import * as Animators from "../animators";
import { Accessor, AttributeToProjector, Point, Bounds, Range } from "../core/interfaces";
import { Dataset } from "../core/dataset";
import { Drawer } from "../drawers/drawer";
import * as Drawers from "../drawers";
import { Formatter } from "../core/formatters";
import * as Formatters from "../core/formatters";
import * as Scales from "../scales";
import { QuantitativeScale } from "../scales/quantitativeScale";
import { Scale } from "../scales/scale";
import * as Utils from "../utils";

import * as Plots from "./";
import { PlotEntity } from "./";
import { Plot } from "./plot";
import { XYPlot } from "./xyPlot";
import { LightweightPlotEntity } from "./commons";


import { BaseBarPlot, IBarPlot } from "./baseBarPlot";

type LabelConfig = {
  labelArea: d3.Selection<void>;
  measurer: SVGTypewriter.Measurer;
  writer: SVGTypewriter.Writer;
};

export class Bar<X, Y> extends XYPlot<X, Y> implements IBarPlot<X, Y> {
  public static ORIENTATION_VERTICAL = "vertical";
  public static ORIENTATION_HORIZONTAL = "horizontal";
  private static _BAR_AREA_CLASS = "bar-area";
  private static _LABEL_PADDING = 10;

  protected static _LABEL_AREA_CLASS = "bar-label-text-area";

  private _baseline: d3.Selection<void>;
  private _labelFormatter: Formatter = Formatters.identity();
  private _labelsEnabled = false;
  private _hideBarsIfAnyAreTooWide = true;
  private _labelConfig: Utils.Map<Dataset, LabelConfig>;
  protected _plot: BaseBarPlot<X, Y>;
  private renderCount = 0;

  /**
   * A Bar Plot draws bars growing out from a baseline to some value
   *
   * @constructor
   * @param {string} [orientation="vertical"] One of "vertical"/"horizontal".
   */
  constructor(orientation = Bar.ORIENTATION_VERTICAL) {
    super();
    this.addClass("bar-plot");
    if (orientation !== Bar.ORIENTATION_VERTICAL && orientation !== Bar.ORIENTATION_HORIZONTAL) {
      throw new Error(orientation + " is not a valid orientation for Plots.Bar");
    }
    this._plot.isVertical(orientation === Bar.ORIENTATION_VERTICAL);

    this.animator("baseline", new Animators.Null());
    this.attr("fill", new Scales.Color().range()[0]);
    this._labelConfig = new Utils.Map<Dataset, LabelConfig>();
  }

  public x(): Plots.TransformableAccessorScaleBinding<X, number>;
  public x(x: number | Accessor<number>): this;
  public x(x: X | Accessor<X>, xScale: Scale<X, number>): this;
  public x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any {
    const plotX = this._plot.x(x as X, xScale);
    if (x == null) {
      return plotX;
    }

    this.render();
    return this;
  }

  public y(): Plots.TransformableAccessorScaleBinding<Y, number>;
  public y(y: number | Accessor<number>): this;
  public y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): this;
  public y(y?: number | Accessor<number> | Y | Accessor<Y>, yScale?: Scale<Y, number>): any {
    const plotY = this._plot.y(y as Y, yScale);
    if (y == null) {
      return plotY;
    }

    this.render();
    return this;
  }

  /**
   * Gets the orientation of the plot
   *
   * @return "vertical" | "horizontal"
   */
  public orientation() {
    return this._plot.isVertical() ? Bar.ORIENTATION_VERTICAL : Bar.ORIENTATION_HORIZONTAL;
  }

  public render() {
    this._plot.updateBarPixelWidth();
    this._plot.updateExtents();
    super.render();
    return this;
  }

  protected _createPlot() {
    return new BaseBarPlot((dataset) => new Drawers.Rectangle(dataset), this);
  }

  protected _setup() {
    super._setup();

    this._plot.renderArea((dataset: Dataset) => {
      const barRenderArea = this._renderArea.append("g");
      barRenderArea.classed(Bar._BAR_AREA_CLASS, true);
      let labelArea = this._renderArea.append("g").classed(Bar._LABEL_AREA_CLASS, true);
      let measurer = new SVGTypewriter.CacheMeasurer(labelArea);
      let writer = new SVGTypewriter.Writer(measurer);
      this._labelConfig.set(dataset, { labelArea: labelArea, measurer: measurer, writer: writer });
      return barRenderArea;
    });

    this._baseline = this._renderArea.append("line").classed("baseline", true);
  }

  /**
   * Gets the baseline value.
   * The baseline is the line that the bars are drawn from.
   *
   * @returns {X|Y}
   */
  public baselineValue(): X|Y;
  /**
   * Sets the baseline value.
   * The baseline is the line that the bars are drawn from.
   *
   * @param {X|Y} value
   * @returns {Bar} The calling Bar Plot.
   */
  public baselineValue(value: X|Y): this;
  public baselineValue(value?: X|Y): any {
    const plotBaselineValue = this._plot.baselineValue(value);
    if (value == null) {
      return plotBaselineValue;
    }

    this.render();
    return this;
  }

  /**
   * Get whether bar labels are enabled.
   *
   * @returns {boolean} Whether bars should display labels or not.
   */
  public labelsEnabled(): boolean;
  /**
   * Sets whether labels are enabled.
   *
   * @param {boolean} labelsEnabled
   * @returns {Bar} The calling Bar Plot.
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

  /**
   * Gets the Formatter for the labels.
   */
  public labelFormatter(): Formatter;
  /**
   * Sets the Formatter for the labels.
   *
   * @param {Formatter} formatter
   * @returns {Bar} The calling Bar Plot.
   */
  public labelFormatter(formatter: Formatter): this;
  public labelFormatter(formatter?: Formatter): any {
    if (formatter == null) {
      return this._labelFormatter;
    } else {
      this._labelFormatter = formatter;
      this.render();
      return this;
    }
  }

  protected _onDatasetRemoved(dataset: Dataset) {
    let labelConfig = this._labelConfig.get(dataset);
    if (labelConfig != null) {
      labelConfig.labelArea.remove();
      this._labelConfig.delete(dataset);
    }
  }

  /**
   * Returns the PlotEntity nearest to the query point according to the following algorithm:
   *   - If the query point is inside a bar, returns the PlotEntity for that bar.
   *   - Otherwise, gets the nearest PlotEntity by the primary direction (X for vertical, Y for horizontal),
   *     breaking ties with the secondary direction.
   * Returns undefined if no PlotEntity can be found.
   *
   * @param {Point} queryPoint
   * @returns {PlotEntity} The nearest PlotEntity, or undefined if no PlotEntity can be found.
   */
  public entityNearest(queryPoint: Point): PlotEntity {
    return this._plot.entityNearest(queryPoint);
  }


  /**
   * Gets the Entities at a particular Point.
   *
   * @param {Point} p
   * @returns {PlotEntity[]}
   */
  public entitiesAt(p: Point) {
    return this._plot.entitiesAt(p);
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

  public renderImmediately() {
    super.renderImmediately();

    const isVertical = this._plot.isVertical();
    let primaryScale: Scale<any, number> = isVertical ? this.y().scale : this.x().scale;
    let scaledBaseline = primaryScale.scale(this.baselineValue());

    let baselineAttr: any = {
      "x1": isVertical ? 0 : scaledBaseline,
      "y1": isVertical ? scaledBaseline : 0,
      "x2": isVertical ? this.width() : scaledBaseline,
      "y2": isVertical ? scaledBaseline : this.height(),
    };

    this.animator("baseline").animate(this._baseline, baselineAttr);
    return this;
  }

  public drawLabels(dataToDraw: Utils.Map<Dataset, any[]>, attrToProjector: AttributeToProjector) {
    if (this._labelsEnabled) {
      this.datasets().forEach((dataset) => this._labelConfig.get(dataset).labelArea.selectAll("g").remove());
      let labelsTooWide = false;
      this.datasets().forEach((dataset) => labelsTooWide = labelsTooWide || this._drawLabel(dataToDraw.get(dataset), dataset, attrToProjector));
      if (this._hideBarsIfAnyAreTooWide && labelsTooWide) {
        this.datasets().forEach((dataset) => this._labelConfig.get(dataset).labelArea.selectAll("g").remove());
      }
    }
  }

  private _drawLabel(data: any[], dataset: Dataset, attrToProjector: AttributeToProjector) {
    let labelConfig = this._labelConfig.get(dataset);
    let labelArea = labelConfig.labelArea;
    let measurer = labelConfig.measurer;
    let writer = labelConfig.writer;

    let drawLabel = (d: any, i: number) => {
      let valueAccessor = this._plot.isVertical() ? this.y().accessor : this.x().accessor;
      let value = valueAccessor(d, i, dataset);
      let valueScale: Scale<any, number> = this._plot.isVertical() ? this.y().scale : this.x().scale;
      let scaledValue = valueScale != null ? valueScale.scale(value) : value;
      let scaledBaseline = valueScale != null ? valueScale.scale(this.baselineValue()) : this.baselineValue();

      let barWidth = attrToProjector["width"](d, i, dataset);
      let barHeight = attrToProjector["height"](d, i, dataset);
      let text = this._labelFormatter(valueAccessor(d, i, dataset));
      let measurement = measurer.measure(text);

      let xAlignment = "center";
      let yAlignment = "center";
      let labelContainerOrigin = {
        x: attrToProjector["x"](d, i, dataset),
        y: attrToProjector["y"](d, i, dataset),
      };
      let containerWidth = barWidth;
      let containerHeight = barHeight;

      let labelOrigin = {
        x: labelContainerOrigin.x,
        y: labelContainerOrigin.y,
      };

      let showLabelOnBar: boolean;

      if (this._plot.isVertical()) {
        labelOrigin.x += containerWidth / 2 - measurement.width / 2;

        let barY = attrToProjector["y"](d, i, dataset);
        let effectiveBarHeight = barHeight;
        if (barY + barHeight > this.height()) {
          effectiveBarHeight = this.height() - barY;
        } else if (barY < 0) {
          effectiveBarHeight = barY + barHeight;
        }
        let offset = Bar._LABEL_PADDING;
        showLabelOnBar = measurement.height + 2 * offset <= effectiveBarHeight;

        if (showLabelOnBar) {
          if (scaledValue < scaledBaseline) {
            labelContainerOrigin.y += offset;
            yAlignment = "top";
            labelOrigin.y += offset;
          } else {
            labelContainerOrigin.y -= offset;
            yAlignment = "bottom";
            labelOrigin.y += containerHeight - offset - measurement.height;
          }
        } else { // show label off bar
          containerHeight = barHeight + offset + measurement.height;
          if (scaledValue <= scaledBaseline) {
            labelContainerOrigin.y -= offset + measurement.height;
            yAlignment = "top";
            labelOrigin.y -= offset + measurement.height;
          } else {
            yAlignment = "bottom";
            labelOrigin.y += barHeight + offset;
          }
        }
      } else { // horizontal
        labelOrigin.y += containerHeight / 2 - measurement.height / 2;

        let barX = attrToProjector["x"](d, i, dataset);
        let effectiveBarWidth = barWidth;
        if (barX + barWidth > this.width()) {
          effectiveBarWidth = this.width() - barX;
        } else if (barX < 0) {
          effectiveBarWidth = barX + barWidth;
        }
        let offset = Bar._LABEL_PADDING;
        showLabelOnBar = measurement.width + 2 * offset <= effectiveBarWidth;

        if (showLabelOnBar) {
          if (scaledValue < scaledBaseline) {
            labelContainerOrigin.x += offset;
            xAlignment = "left";
            labelOrigin.x += offset;
          } else {
            labelContainerOrigin.x -= offset;
            xAlignment = "right";
            labelOrigin.x += containerWidth - offset - measurement.width;
          }
        } else { // show label off bar
          containerWidth = barWidth + offset + measurement.width;
          if (scaledValue < scaledBaseline) {
            labelContainerOrigin.x -= offset + measurement.width;
            xAlignment = "left";
            labelOrigin.x -= offset + measurement.width;
          } else {
            xAlignment = "right";
            labelOrigin.x += barWidth + offset;
          }
        }
      }

      let labelContainer = labelArea.append("g").attr("transform", `translate(${labelContainerOrigin.x}, ${labelContainerOrigin.y})`);

      if (showLabelOnBar) {
        labelContainer.classed("on-bar-label", true);
        let color = attrToProjector["fill"](d, i, dataset);
        let dark = Utils.Color.contrast("white", color) * 1.6 < Utils.Color.contrast("black", color);
        labelContainer.classed(dark ? "dark-label" : "light-label", true);
      } else {
        labelContainer.classed("off-bar-label", true);
      }

      let hideLabel = labelOrigin.x < 0 ||
        labelOrigin.y < 0 ||
        labelOrigin.x + measurement.width > this.width() ||
        labelOrigin.y + measurement.height > this.height();
      labelContainer.style("visibility", hideLabel ? "hidden" : "inherit");

      let writeOptions = {
        selection: labelContainer,
        xAlign: xAlignment,
        yAlign: yAlignment,
        textRotation: 0,
      };
      writer.write(text, containerWidth, containerHeight, writeOptions);

      let tooWide = this._plot.isVertical()
        ? barWidth < (measurement.width + Bar._LABEL_PADDING * 2)
        : barHeight < (measurement.height + Bar._LABEL_PADDING * 2);
      return tooWide;
    };

    let labelTooWide = data.map(drawLabel);
    return labelTooWide.some((d: boolean) => d);
  }
}

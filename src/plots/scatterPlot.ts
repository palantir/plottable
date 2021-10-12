/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as Typesettable from "typesettable";

import { Dataset } from "../core/dataset";
import * as Formatters from "../core/formatters";
import { AttributeToProjector, Bounds, IAccessor, Point, SimpleSelection } from "../core/interfaces";
import * as SymbolFactories from "../core/symbolFactories";
import { SymbolFactory } from "../core/symbolFactories";
import { ProxyDrawer } from "../drawers/drawer";
import { makeSymbolCanvasDrawStep, SymbolSVGDrawer } from "../drawers/symbolDrawer";
import { Scale } from "../scales/scale";

import * as Animators from "../animators";
import { Label } from "../components/label";
import * as Drawers from "../drawers";
import * as Scales from "../scales";
import * as Utils from "../utils";
import * as Plots from "./";
import { IAccessorScaleBinding, ILightweightPlotEntity, IPlotEntity, ITransformableAccessorScaleBinding } from "./";
import { Plot } from "./plot";
import { XYPlot } from "./xyPlot";

export interface ILightweightScatterPlotEntity extends ILightweightPlotEntity {
  // size of the entity in pixel space
  diameter: number;
}

type LabelConfig = {
  labelArea: SimpleSelection<void>;
  measurer: Typesettable.CacheMeasurer;
  writer: Typesettable.Writer;
};

export class Scatter<X, Y> extends XYPlot<X, Y> {
  private static _SIZE_KEY = "size";
  private static _SYMBOL_KEY = "symbol";

  // label stuff
  protected static _LABEL_AREA_CLASS = "scatter-label-text-area";
  private _labelConfig: Utils.Map<Dataset, LabelConfig>;
  private _labelFormatter: Formatters.DatumFormatter = Formatters.identity();
  private _labelFontSize: number = Label._DEFAULT_FONT_SIZE_PX;

  protected static _LABEL_MARGIN_FROM_BUBBLE = 15;
  private _labelsEnabled = false;
  /**
   * A Scatter Plot draws a symbol at each data point.
   *
   * @constructor
   */
  constructor() {
    super();
    this.addClass("scatter-plot");
    const animator = new Animators.Easing();
    animator.startDelay(5);
    animator.stepDuration(250);
    animator.maxTotalDuration(Plot._ANIMATION_MAX_DURATION);
    this.animator(Plots.Animator.MAIN, animator);
    this.attr("opacity", 0.6);
    this.attr("fill", new Scales.Color().range()[0]);
    this.size(6);
    const circleSymbolFactory = SymbolFactories.circle();
    this.symbol(() => circleSymbolFactory);
    this._labelConfig = new Utils.Map<Dataset, LabelConfig>();
  }

  protected _buildLightweightPlotEntities(datasets: Dataset[]) {
    const lightweightPlotEntities = super._buildLightweightPlotEntities(datasets);

    return lightweightPlotEntities.map((lightweightPlotEntity: ILightweightScatterPlotEntity) => {
      const diameter = Plot._scaledAccessor(this.size())(
        lightweightPlotEntity.datum,
        lightweightPlotEntity.index,
        lightweightPlotEntity.dataset);
      lightweightPlotEntity.diameter = diameter;

      return lightweightPlotEntity;
    });
  }

  protected _createDrawer(dataset: Dataset) {
    return new ProxyDrawer(
      () => new SymbolSVGDrawer(),
      (ctx) => {
        return new Drawers.CanvasDrawer(ctx,
          makeSymbolCanvasDrawStep(
            dataset,
            () => Plot._scaledAccessor(this.symbol()),
            () => Plot._scaledAccessor(this.size()),
          ),
        );
      },
    );
  }

  /**
   * Gets the AccessorScaleBinding for the size property of the plot.
   * The size property corresponds to the area of the symbol.
   */
  public size<S>(): ITransformableAccessorScaleBinding<S, number>;
  /**
   * Sets the size property to a constant number or the result of an Accessor<number>.
   *
   * @param {number|Accessor<number>} size
   * @returns {Plots.Scatter} The calling Scatter Plot.
   */
  public size(size: number | IAccessor<number>): this;
  /**
   * Sets the size property to a scaled constant value or scaled result of an Accessor.
   * The provided Scale will account for the values when autoDomain()-ing.
   *
   * @param {S|Accessor<S>} sectorValue
   * @param {Scale<S, number>} scale
   * @returns {Plots.Scatter} The calling Scatter Plot.
   */
  public size<S>(size: S | IAccessor<S>, scale: Scale<S, number>): this;
  public size<S>(size?: number | IAccessor<number> | S | IAccessor<S>, scale?: Scale<S, number>): any {
    if (size == null) {
      return this._propertyBindings.get(Scatter._SIZE_KEY);
    }
    this._bindProperty(Scatter._SIZE_KEY, size, scale);
    this.render();
    return this;
  }

  /**
   * Gets the AccessorScaleBinding for the symbol property of the plot.
   * The symbol property corresponds to how the symbol will be drawn.
   */
  public symbol(): IAccessorScaleBinding<any, any>;
  /**
   * Sets the symbol property to an Accessor<SymbolFactory>.
   *
   * @param {Accessor<SymbolFactory>} symbol
   * @returns {Plots.Scatter} The calling Scatter Plot.
   */
  public symbol(symbol: IAccessor<SymbolFactory>): this;
  public symbol(symbol?: IAccessor<SymbolFactory>): any {
    if (symbol == null) {
      return this._propertyBindings.get(Scatter._SYMBOL_KEY);
    }
    this._propertyBindings.set(Scatter._SYMBOL_KEY, { accessor: symbol });
    this.render();
    return this;
  }

  protected _generateDrawSteps(): Drawers.DrawStep[] {
    const drawSteps: Drawers.DrawStep[] = [];
    if (this._animateOnNextRender()) {
      const attrToProjector = this._getAttrToProjector();

      const symbolProjector = Plot._scaledAccessor(this.symbol());
      attrToProjector["d"] = (datum: any, index: number, dataset: Dataset) => symbolProjector(datum, index, dataset)(0)(null);
      drawSteps.push({ attrToProjector, animator: this._getAnimator(Plots.Animator.RESET) });
    }

    drawSteps.push({
      attrToProjector: this._getAttrToProjector(),
      animator: this._getAnimator(Plots.Animator.MAIN),
    });
    return drawSteps;
  }

  protected _propertyProjectors(): AttributeToProjector {
    const propertyToProjectors = super._propertyProjectors();

    const xProjector = Plot._scaledAccessor(this.x());
    const yProjector = Plot._scaledAccessor(this.y());
    propertyToProjectors["x"] = xProjector;
    propertyToProjectors["y"] = yProjector;
    propertyToProjectors["transform"] = (datum: any, index: number, dataset: Dataset) => {
        return "translate(" + xProjector(datum, index, dataset) + "," + yProjector(datum, index, dataset) + ")";
    };
    propertyToProjectors["d"] = this._constructSymbolGenerator();

    return propertyToProjectors;
  }

  protected _constructSymbolGenerator() {
    const symbolProjector = Plot._scaledAccessor(this.symbol());
    const sizeProjector = Plot._scaledAccessor(this.size());
    return (datum: any, index: number, dataset: Dataset) => {
      return symbolProjector(datum, index, dataset)(sizeProjector(datum, index, dataset))(null);
    };
  }

  protected _entityBounds(entity: ILightweightScatterPlotEntity) {
    return {
      x: entity.position.x - entity.diameter / 2,
      y: entity.position.y - entity.diameter / 2,
      width: entity.diameter,
      height: entity.diameter,
    };
  }

  protected _entityVisibleOnPlot(entity: ILightweightScatterPlotEntity, bounds: Bounds) {
    const xRange = { min: bounds.topLeft.x, max: bounds.bottomRight.x };
    const yRange = { min: bounds.topLeft.y, max: bounds.bottomRight.y };
    const translatedBbox = this._entityBounds(entity);
    return Utils.DOM.intersectsBBox(xRange, yRange, translatedBbox);
  }

  /**
   * Gets the Entities at a particular Point.
   *
   * @param {Point} p
   * @returns {PlotEntity[]}
   */
  public entitiesAt(p: Point): IPlotEntity[] {
    const xProjector = Plot._scaledAccessor(this.x());
    const yProjector = Plot._scaledAccessor(this.y());
    const sizeProjector = Plot._scaledAccessor(this.size());
    return this.entities().filter((entity) => {
      const datum = entity.datum;
      const index = entity.index;
      const dataset = entity.dataset;
      const x = xProjector(datum, index, dataset);
      const y = yProjector(datum, index, dataset);
      const size = sizeProjector(datum, index, dataset);
      return x - size / 2 <= p.x && p.x <= x + size / 2 && y - size / 2 <= p.y && p.y <= y + size / 2;
    });
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
   * @returns {Scatter} The calling SCATTER Plot.
   */
  public labelsEnabled(enabled: boolean): this;
  public labelsEnabled(enabled?: boolean): any {
    if (enabled == null) {
      return this._labelsEnabled;
    } else {
      this._labelsEnabled = enabled;
      this._clearAttrToProjectorCache();
      this.render();
      return this;
    }
  }

  /**
   * Get the label font size in px.
   */
  public labelFontSize(): number;
  /**
   * Set the label font size.
   *
   * @param {fontSize} number The label font size in px. Must be an integer between 12 and 24,
   * inclusive. Values will be coerced to this range.
   */
  public labelFontSize(fontSize: number): this;
  public labelFontSize(fontSize?: number): number | this {
    if (fontSize == null) {
      return this._labelFontSize;
    } else {
      this.invalidateCache();
      this._labelFontSize = Utils.Math.coerceToRange(fontSize, [Label._MIN_FONT_SIZE_PX, Label._MAX_FONT_SIZE_PX]);
      this._labelConfig.forEach(({ labelArea }) => {
        labelArea.attr("class", null)
          .classed(Scatter._LABEL_AREA_CLASS, true)
          .classed(`label-${this._labelFontSize}`, true);
      });
      return this.render();
    }
  }

  public invalidateCache() {
    super.invalidateCache();
    this.datasets().forEach((dataset) => {
      const labelConfig = this._labelConfig.get(dataset);
      if (labelConfig != null) {
        labelConfig.measurer.reset();
      }
    });
  }

  protected _createNodesForDataset(dataset: Dataset): ProxyDrawer {
    const drawer = super._createNodesForDataset(dataset);
    const labelArea = this._renderArea.append("g")
      .classed(Scatter._LABEL_AREA_CLASS, true)
      .classed(`label-${this._labelFontSize}`, true);
    const context = new Typesettable.SvgContext(labelArea.node() as SVGElement);
    const measurer = new Typesettable.CacheMeasurer(context);
    const writer = new Typesettable.Writer(measurer, context);
    this._labelConfig.set(dataset, { labelArea: labelArea, measurer: measurer, writer: writer });
    return drawer;
  }

  protected _removeDatasetNodes(dataset: Dataset) {
    super._removeDatasetNodes(dataset);
    const labelConfig = this._labelConfig.get(dataset);
    if (labelConfig != null) {
      labelConfig.labelArea.remove();
      this._labelConfig.delete(dataset);
    }
  }

  protected _additionalPaint(time: number) {
    this.datasets().forEach((dataset) => this._labelConfig.get(dataset).labelArea.selectAll("g").remove());
    if (this._labelsEnabled) {
      Utils.Window.setTimeout(() => this._drawLabels(), time);
    }
  }

  protected _drawLabels() {
    const dataToDraw = this._getDataToDraw();
    const attrToProjector = this._getAttrToProjector();
    this.datasets().forEach((dataset) => {
      const data = dataToDraw.get(dataset);
      const dataLen = data.length;
      for (let index = 0; index < dataLen; index++) {
        const datum = data[index];
        if (datum == null) {
          continue;
        }
        this._drawLabel(datum, index, dataset, attrToProjector);
      }
    });
  }

  private _drawLabel(datum: any, index: number, dataset: Dataset, attrToProjector: AttributeToProjector) {
    if (datum.label == null) {
      return;
    }
    const { labelArea, measurer, writer } = this._labelConfig.get(dataset);

    const scatterCoordinates = { x: attrToProjector["x"](datum, index, dataset), y: attrToProjector["y"](datum, index, dataset) };

    const sizeProjector = Plot._scaledAccessor(this.size());
    const diameter = sizeProjector(datum, index, dataset);

    const label = this._labelFormatter(datum.label, datum, index, dataset);
    const measurement = measurer.measure(label);

    const { containerDimensions, labelContainerOrigin, labelOrigin, alignment } = this._calculateLabelProperties(scatterCoordinates, diameter, measurement);

    const labelContainer = this._createLabelContainer(labelArea, labelContainerOrigin, labelOrigin, measurement);

    const writeOptions = { xAlign: alignment.x as Typesettable.IXAlign, yAlign: alignment.y as Typesettable.IYAlign };
    writer.write(label, containerDimensions.width, containerDimensions.height, writeOptions, labelContainer.node());
  }

  private _calculateLabelProperties(
    pointCoordinates: Point, diameter: number, measurement: Typesettable.IDimensions) {

    // If diameter is smaller than font size, put label above
    const labelShift = diameter < measurement.height ? diameter / 2 + Scatter._LABEL_MARGIN_FROM_BUBBLE : 0;

    return {
      containerDimensions: {
        width: measurement.width,
        height: measurement.height,
      },
      labelContainerOrigin: {
        x: pointCoordinates.x - measurement.width / 2,
        y: pointCoordinates.y - measurement.height / 2 + labelShift,
      },
      labelOrigin: {
        x: pointCoordinates.x,
        y: pointCoordinates.y,
      },
      alignment: {
        x: "center",
        y: "center",
      },
    };
  }

  private _createLabelContainer(
    labelArea: SimpleSelection<void>,
    labelContainerOrigin: Point,
    labelOrigin: Point,
    measurement: Typesettable.IDimensions) {

    const labelContainer = labelArea.append("g")
                                    .attr("transform", `translate(${labelContainerOrigin.x}, ${labelContainerOrigin.y})`);
    labelContainer.classed("on-bar-label", true);

    return labelContainer;
  }

}

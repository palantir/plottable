/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import * as Typesettable from "typesettable";

import * as Animators from "../animators";
import { Label } from "../components/label";
import { Dataset } from "../core/dataset";
import * as Formatters from "../core/formatters";
import { DatumFormatter } from "../core/formatters";
import {
  AttributeToProjector,
  IAccessor,
  IEntityBounds,
  Point,
  Range,
  SimpleSelection,
} from "../core/interfaces";
import * as Drawers from "../drawers";
import { ProxyDrawer } from "../drawers/drawer";
import { RectangleSVGDrawer } from "../drawers/rectangleDrawer";
import { memoize } from "../memoize";
import * as Scales from "../scales";
import { QuantitativeScale } from "../scales/quantitativeScale";
import { Scale } from "../scales/scale";
import * as Utils from "../utils";
import { makeEnum } from "../utils/makeEnum";
import { coerceToRange } from "../utils/mathUtils";
import * as Plots from "./";
import { IPlotEntity } from "./";
import { Plot } from "./plot";
import { XYPlot } from "./xyPlot";

type LabelConfig = {
  labelArea: SimpleSelection<void>;
  measurer: Typesettable.CacheMeasurer;
  writer: Typesettable.Writer;
};

interface IDimensions { width: number; height: number; }

export const BarOrientation = makeEnum(["vertical", "horizontal"]);
export type BarOrientation = keyof typeof BarOrientation;

export const LabelsPosition = makeEnum(["start", "middle", "end", "outside"]);
export type LabelsPosition = keyof typeof LabelsPosition;

export const BarAlignment = makeEnum(["start", "middle", "end"]);
export type BarAlignment = keyof typeof BarAlignment;

export class Bar<X, Y> extends XYPlot<X, Y> {
  public static _BAR_THICKNESS_RATIO = 0.95;
  public static _BAR_GAPLESS_THRESHOLD_PX = 3;
  public static _SINGLE_BAR_DIMENSION_RATIO = 0.4;
  private static _BAR_AREA_CLASS = "bar-area";
  private static _BAR_END_KEY = "barEnd";

  // we special case the "width" property to represent the bar thickness
  // (aka the distance between adjacent bar positions); in _generateAttrToProjector
  // we re-assign "width" to specifically refer to <rect>'s width attribute
  protected static _BAR_THICKNESS_KEY = "width";
  protected static _LABEL_AREA_CLASS = "bar-label-text-area";
  /**
   * In the case of "start" or "end" LabelPositions, put the label this many px away
   * from the bar's length distance edge
   */
  protected static _LABEL_MARGIN_INSIDE_BAR = 10;

  private _baseline: SimpleSelection<void>;
  private _baselineValue: X|Y;
  protected _isVertical: boolean;
  private _labelFormatter: DatumFormatter = Formatters.identity();
  private _labelsEnabled = false;
  private _labelsPosition = LabelsPosition.end;
  protected _labelFontSize: number = Label._DEFAULT_FONT_SIZE_PX;
  private _hideBarsIfAnyAreTooWide = true;
  private _labelConfig: Utils.Map<Dataset, LabelConfig>;
  private _baselineValueProvider: () => (X|Y)[];
  private _barAlignment: BarAlignment = "middle";

  private _computeBarPixelThickness = memoize(computeBarPixelThickness);

  /**
   * Whether all the bars in this barPlot have the same pixel thickness.
   * If so, use the _barPixelThickness property to access the thickness.
   */
  private _fixedBarPixelThickness = true;

  /**
   * A Bar Plot draws bars growing out from a baseline to some value
   *
   * @constructor
   * @param {string} [orientation="vertical"] One of "vertical"/"horizontal".
   */
  constructor(orientation: BarOrientation = "vertical") {
    super();
    this.addClass("bar-plot");
    if (orientation !== "vertical" && orientation !== "horizontal") {
      throw new Error(orientation + " is not a valid orientation for Plots.Bar");
    }
    this._isVertical = orientation === "vertical";
    this.animator("baseline", new Animators.Null());
    this.attr("fill", new Scales.Color().range()[0]);
    this.attr(Bar._BAR_THICKNESS_KEY, () => this._barPixelThickness());
    this._labelConfig = new Utils.Map<Dataset, LabelConfig>();
    this._baselineValueProvider = () => [this.baselineValue()];
  }

  public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
    super.computeLayout(origin, availableWidth, availableHeight);
    this._updateExtents();
    return this;
  }

  public x(): Plots.ITransformableAccessorScaleBinding<X, number>;
  public x(x: number | IAccessor<number>): this;
  public x(x: X | IAccessor<X>, xScale: Scale<X, number>): this;
  public x(x?: number | IAccessor<number> | X | IAccessor<X>, xScale?: Scale<X, number>): any {
    if (x == null) {
      return super.x();
    }

    if (xScale == null) {
      super.x(<number | IAccessor<number>>x);
    } else {
      super.x(< X | IAccessor<X>>x, xScale);
    }

    this._updateThicknessAttr();
    this._updateLengthScale();
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
      super.y(<number | IAccessor<number>>y);
    } else {
      super.y(<Y | IAccessor<Y>>y, yScale);
    }

    this._updateLengthScale();
    return this;
  }

  /**
   * The binding associated with bar length. Length is the count or value the bar is trying to show.
   * This is the .y() for a vertical plot and .x() for a horizontal plot.
   */
  protected length(): Plots.ITransformableAccessorScaleBinding<any, number> {
    return this._isVertical ? this.y() : this.x();
  }

  /**
   * The binding associated with bar position. Position separates the different bar categories.
   * This is the .x() for a vertical plot and .y() for a horizontal plot.
   */
  protected position(): Plots.ITransformableAccessorScaleBinding<any, number> {
    return this._isVertical ? this.x() : this.y();
  }

  /**
   * Gets the accessor for the bar "end", which is used to compute the width of
   * each bar on the independent axis.
   */
  public barEnd(): Plots.ITransformableAccessorScaleBinding<X, number>;
  /**
   * Sets the accessor for the bar "end", which is used to compute the width of
   * each bar on the x axis (y axis if horizontal).
   *
   * If a `Scale` has been set for the independent axis via the `x` method (`y`
   * if horizontal), it will also be used to scale `barEnd`.
   *
   * Additionally, calling this setter will set `barAlignment` to `"start"`,
   * indicating that `x` and `barEnd` now define the left and right x
   * coordinates of a bar (bottom/top if horizontal).
   *
   * Normally, a single bar width for all bars is determined by how many bars
   * can fit in the given space (minus some padding). Settings this accessor
   * will override this behavior and manually set the start and end coordinates
   * for each bar.
   *
   * This means it will totally ignore the range band width of category scales,
   * so this probably doesn't make sense to use with category axes.
   */
  public barEnd(end: number | IAccessor<number> | X | IAccessor<X>): this;
  public barEnd(end?: number | IAccessor<number> | X | IAccessor<X>): any {
    if (end == null) {
      return this._propertyBindings.get(Bar._BAR_END_KEY);
    }

    const binding = this.position();
    const scale = binding && binding.scale;
    this._bindProperty(Bar._BAR_END_KEY, end, scale);
    this._updateThicknessAttr();
    this._updateLengthScale();
    this.render();
    return this;
  }

  /**
   * Gets the current bar alignment
   */
  public barAlignment(): BarAlignment;
  /**
   * Sets the bar alignment. Valid values are `"start"`, `"middle"`, and
   * `"end"`, which determines the meaning of the accessor of the bar's scale
   * coordinate (e.g. "x" for vertical bars).
   *
   * For example, a value of "start" means the x coordinate accessor sets the
   * left hand side of the rect.
   *
   * The default value is "middle", which aligns to rect so that it centered on
   * the x coordinate
   */
  public barAlignment(align: BarAlignment): this;
  public barAlignment(align?: BarAlignment): any {
    if (align == null) {
      return this._barAlignment;
    }
    this._barAlignment = align;

    this._clearAttrToProjectorCache();
    this.render();
    return this;
  }

  /**
   * Gets the orientation of the plot
   *
   * @return "vertical" | "horizontal"
   */
  public orientation(): BarOrientation {
    return this._isVertical ? "vertical" : "horizontal";
  }

  protected _createDrawer() {
    return new ProxyDrawer(
      () => new RectangleSVGDrawer(Bar._BAR_AREA_CLASS),
      (ctx) => new Drawers.RectangleCanvasDrawer(ctx),
    );
  }

  protected _setup() {
    super._setup();
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
    if (value == null) {
      if (this._baselineValue != null) {
        return this._baselineValue;
      }
      if (!this._projectorsReady()) {
        return 0;
      }
      const lengthScale = this.length().scale;
      if (!lengthScale) {
        return 0;
      }

      if (lengthScale instanceof Scales.Time) {
        return new Date(0);
      }

      return 0;
    }
    this._baselineValue = value;
    this._updateLengthScale();
    this._clearAttrToProjectorCache();
    this.render();
    return this;
  }

  public addDataset(dataset: Dataset) {
    super.addDataset(dataset);
    return this;
  }

  protected _addDataset(dataset: Dataset) {
    super._addDataset(dataset);
    return this;
  }

  public removeDataset(dataset: Dataset) {
    super.removeDataset(dataset);
    return this;
  }

  protected _removeDataset(dataset: Dataset) {
    super._removeDataset(dataset);
    return this;
  }

  public datasets(): Dataset[];
  public datasets(datasets: Dataset[]): this;
  public datasets(datasets?: Dataset[]): any {
    if (datasets == null) {
      return super.datasets();
    }

    super.datasets(datasets);
    return this;
  }

  /**
   * Get whether bar labels are enabled.
   *
   * @returns {boolean} Whether bars should display labels or not.
   */
  public labelsEnabled(): boolean;
  /**
   * Sets whether labels are enabled. If enabled, also sets their position relative to the baseline.
   *
   * @param {boolean} labelsEnabled
   * @param {LabelsPosition} labelsPosition
   * @returns {Bar} The calling Bar Plot.
   */
  public labelsEnabled(enabled: boolean): this;
  public labelsEnabled(enabled: boolean, labelsPosition: LabelsPosition): this;
  public labelsEnabled(enabled?: boolean, labelsPosition?: LabelsPosition): any {
    if (enabled == null) {
      return this._labelsEnabled;
    } else {
      this._labelsEnabled = enabled;
      if (labelsPosition != null) {
        this._labelsPosition = labelsPosition;
      }

      this._clearAttrToProjectorCache();
      this.render();
      return this;
    }
  }

  /**
   * Gets the Formatter for the labels.
   */
  public labelFormatter(): DatumFormatter;
  /**
   * Sets the Formatter for the labels. The labelFormatter will be fed each bar's
   * computed height as defined by the `.y()` accessor for vertical bars, or the
   * width as defined by the `.x()` accessor for horizontal bars, as well as the
   * datum, datum index, and dataset associated with that bar.
   *
   * @param {Formatter} formatter
   * @returns {Bar} The calling Bar Plot.
   */
  public labelFormatter(formatter: DatumFormatter): this;
  public labelFormatter(formatter?: DatumFormatter): any {
    if (formatter == null) {
      return this._labelFormatter;
    } else {
      this._labelFormatter = formatter;

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
          .classed(Bar._LABEL_AREA_CLASS, true)
          .classed(`label-${this._labelFontSize}`, true);
      });
      return this.render();
    }
  }

  protected _createNodesForDataset(dataset: Dataset): ProxyDrawer {
    const drawer = super._createNodesForDataset(dataset);
    const labelArea = this._renderArea .append("g")
      .classed(Bar._LABEL_AREA_CLASS, true)
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

  /**
   * Returns the PlotEntity nearest to the query point according to the following algorithm:
   *   - If the query point is inside a bar, returns the PlotEntity for that bar.
   *   - Otherwise, gets the nearest PlotEntity by the positional direction (X for vertical, Y for horizontal),
   *     breaking ties with the secondary direction.
   * Returns undefined if no PlotEntity can be found.
   *
   * @param {Point} queryPoint
   * @returns {PlotEntity} The nearest PlotEntity, or undefined if no PlotEntity can be found.
   */
  public entityNearest(queryPoint: Point): IPlotEntity {
    const worker = () => {
      const nearest = this._isVertical ?
        this._getEntityStore().entityNearestX(queryPoint) :
        this._getEntityStore().entityNearestY(queryPoint);
      return nearest === undefined ? undefined : this._lightweightPlotEntityToPlotEntity(nearest);
    };
    return this._fixedBarPixelThickness ? this._computeBarPixelThickness.doLocked(worker) : worker();
  }

  /**
   * Gets the Entities at a particular Point.
   *
   * @param {Point} p
   * @returns {PlotEntity[]}
   */
  public entitiesAt(p: Point) {
    const worker = () => this._entitiesIntersecting(p.x, p.y);
    return this._fixedBarPixelThickness ? this._computeBarPixelThickness.doLocked(worker) : worker();
  }

  public entitiesInBounds(queryBounds: IEntityBounds): Plots.IPlotEntity[] {
    const worker = () => super.entitiesInBounds(queryBounds);
    return this._fixedBarPixelThickness ? this._computeBarPixelThickness.doLocked(worker) : worker();
  }

  public entitiesInXBounds(queryBounds: IEntityBounds): Plots.IPlotEntity[] {
    const worker = () => super.entitiesInXBounds(queryBounds);
    return this._fixedBarPixelThickness ? this._computeBarPixelThickness.doLocked(worker) : worker();
  }

  public entitiesInYBounds(queryBounds: IEntityBounds): Plots.IPlotEntity[] {
    const worker = () => super.entitiesInYBounds(queryBounds);
    return this._fixedBarPixelThickness ? this._computeBarPixelThickness.doLocked(worker) : worker();
  }

  private _entitiesIntersecting(xValOrRange: number | Range, yValOrRange: number | Range): IPlotEntity[] {
    const intersected: IPlotEntity[] = [];
    const entities = this._getEntityStore().entities();
    const entitiesLen = entities.length;
    for (let i = 0; i < entitiesLen; i++) {
      const entity = entities[i];
      if (Utils.DOM.intersectsBBox(xValOrRange, yValOrRange, this._entityBounds(entity))) {
        intersected.push(this._lightweightPlotEntityToPlotEntity(entity));
      }
    }
    return intersected;
  }

  private _updateLengthScale() {
    if (!this._projectorsReady()) {
      return;
    }
    const lengthScale = this.length().scale;
    if (lengthScale instanceof QuantitativeScale) {
      lengthScale.addPaddingExceptionsProvider(this._baselineValueProvider);
      lengthScale.addIncludedValuesProvider(this._baselineValueProvider);
    }
  }

  public renderImmediately() {
    // HACK update bar pixel thickness
    this._barPixelThickness();
    return this._computeBarPixelThickness.doLocked(() => super.renderImmediately());
  }

  protected _additionalPaint(time: number) {
    const lengthScale = this.length().scale;
    const scaledBaseline = lengthScale.scale(this.baselineValue());

    const baselineAttr: any = {
      x1: this._isVertical ? 0 : scaledBaseline,
      y1: this._isVertical ? scaledBaseline : 0,
      x2: this._isVertical ? this.width() : scaledBaseline,
      y2: this._isVertical ? scaledBaseline : this.height(),
    };

    this._getAnimator("baseline").animate(this._baseline, baselineAttr);

    this.datasets().forEach((dataset) => this._labelConfig.get(dataset).labelArea.selectAll("g").remove());
    if (this._labelsEnabled) {
      Utils.Window.setTimeout(() => this._drawLabels(), time);
    }
  }

  /**
   * Makes sure the extent takes into account the widths of the bars
   */
  protected getExtentsForProperty(property: string) {
    let extents = super.getExtentsForProperty(property);

    let accScaleBinding: Plots.IAccessorScaleBinding<any, any>;
    if (property === "x" && this._isVertical) {
      accScaleBinding = this.x();
    } else if (property === "y" && !this._isVertical) {
      accScaleBinding = this.y();
    } else {
      return extents;
    }

    if (!(accScaleBinding && accScaleBinding.scale && accScaleBinding.scale instanceof QuantitativeScale)) {
      return extents;
    }

    const scale = <QuantitativeScale<any>>accScaleBinding.scale;
    const width = this._barPixelThickness();

    // To account for inverted domains
    extents = extents.map((extent) => d3.extent([
      scale.invert(this._getPositionAttr(scale.scale(extent[0]), width)),
      scale.invert(this._getPositionAttr(scale.scale(extent[0]), width) + width),
      scale.invert(this._getPositionAttr(scale.scale(extent[1]), width)),
      scale.invert(this._getPositionAttr(scale.scale(extent[1]), width) + width),
    ]));

    return extents;
  }

  /**
   * Return the <rect>'s x or y attr value given the position and thickness of
   * that bar. This method is responsible for account for barAlignment, in particular.
   */
  protected _getPositionAttr(position: number, thickness: number): number {
    // account for flipped vertical axis
    if (!this._isVertical) {
      position -= thickness;
      thickness *= -1;
    }

    switch(this._barAlignment) {
      case "start":
        return position;

      case "end":
        return position - thickness;

      case "middle":
      default:
        return position - thickness / 2;
    }
  }

  protected _drawLabels() {
    const dataToDraw = this._getDataToDraw();
    const attrToProjector = this._getAttrToProjector();
    const anyLabelTooWide = this.datasets().some((dataset) => {
      return dataToDraw.get(dataset).some((datum, index) => {
        if (datum == null) {
          return false;
        }
        return this._drawLabel(datum, index, dataset, attrToProjector);
      });
    });

    if (this._hideBarsIfAnyAreTooWide && anyLabelTooWide) {
      this.datasets().forEach((dataset) => this._labelConfig.get(dataset).labelArea.selectAll("g").remove());
    }
  }

  private _drawLabel(datum: any, index: number, dataset: Dataset, attrToProjector: AttributeToProjector) {
    const { labelArea, measurer, writer } = this._labelConfig.get(dataset);

    const lengthAccessor = this.length().accessor;
    const length = lengthAccessor(datum, index, dataset);
    const lengthScale = this.length().scale;
    const scaledLength = lengthScale != null ? lengthScale.scale(length) : length;
    const scaledBaseline = lengthScale != null ? lengthScale.scale(this.baselineValue()) : this.baselineValue();

    const barCoordinates = { x: attrToProjector["x"](datum, index, dataset), y: attrToProjector["y"](datum, index, dataset) };
    const barDimensions = { width: attrToProjector["width"](datum, index, dataset), height: attrToProjector["height"](datum, index, dataset) };
    const text = this._labelFormatter(length, datum, index, dataset);
    const measurement = measurer.measure(text);

    const showLabelOnBar = this._shouldShowLabelOnBar(barCoordinates, barDimensions, measurement);

    // show label on right when value === baseline for horizontal plots
    const aboveOrLeftOfBaseline = this._isVertical ? scaledLength <= scaledBaseline : scaledLength < scaledBaseline;
    const { containerDimensions, labelContainerOrigin, labelOrigin, alignment } = this._calculateLabelProperties(
      barCoordinates, barDimensions, measurement, showLabelOnBar, aboveOrLeftOfBaseline,
    );

    const color = attrToProjector["fill"](datum, index, dataset);
    const labelContainer = this._createLabelContainer(labelArea, labelContainerOrigin, labelOrigin, measurement, showLabelOnBar, color);

    const writeOptions = { xAlign: alignment.x as Typesettable.IXAlign, yAlign: alignment.y as Typesettable.IYAlign };
    writer.write(text, containerDimensions.width, containerDimensions.height, writeOptions, labelContainer.node());

    const tooWide = this._isVertical
      ? barDimensions.width < (measurement.width)
      : barDimensions.height < (measurement.height);
    return tooWide;
  }

  /**
   * Labels are "on-bar" by default, but if the bar is not long enough to fit the text,
   * we can try putting the label "off-bar", if there's enough space outside of the bar
   * to fit it.
   */
  private _shouldShowLabelOnBar(barCoordinates: Point, barDimensions: IDimensions, labelDimensions: Typesettable.IDimensions) {
    if (this._labelsPosition === LabelsPosition.outside) { return false; }

    const barStart = this._isVertical ? barCoordinates.y : barCoordinates.x;
    const barLength = this._isVertical ? barDimensions.height : barDimensions.width;
    const totalLength = this._isVertical ? this.height() : this.width();
    const labelLength = this._isVertical ? labelDimensions.height : labelDimensions.width;

    const barEnd = barStart + barLength;

    let barLengthVisibleOnScreen = barLength;
    if (barEnd > totalLength) {
      barLengthVisibleOnScreen = totalLength - barStart;
    } else if (barStart < 0) {
      barLengthVisibleOnScreen = barEnd;
    }

    return (labelLength + Bar._LABEL_MARGIN_INSIDE_BAR <= barLengthVisibleOnScreen);
  }

  private _calculateLabelProperties(
      barCoordinates: Point, barDimensions: IDimensions, measurement: Typesettable.IDimensions,
      showLabelOnBar: boolean, aboveOrLeftOfBaseline: boolean) {
    const barCoordinate = this._isVertical ? barCoordinates.y : barCoordinates.x;
    const barDimension = this._isVertical ? barDimensions.height : barDimensions.width;
    const measurementDimension = this._isVertical ? measurement.height : measurement.width;

    let alignmentDimension = "center";
    let containerDimension = barDimension;
    let labelContainerOriginCoordinate = barCoordinate;
    let labelOriginCoordinate = barCoordinate;

    const updateCoordinates = (position: "topLeft" | "center" | "bottomRight") => {
      switch (position) {
        case "topLeft":
          alignmentDimension = this._isVertical ? "top" : "left";
          labelContainerOriginCoordinate += Bar._LABEL_MARGIN_INSIDE_BAR;
          labelOriginCoordinate += Bar._LABEL_MARGIN_INSIDE_BAR;
          return;
        case "center":
          labelOriginCoordinate += (barDimension + measurementDimension) / 2;
          return;
        case "bottomRight":
          alignmentDimension = this._isVertical ? "bottom" : "right";
          labelContainerOriginCoordinate -= Bar._LABEL_MARGIN_INSIDE_BAR;
          labelOriginCoordinate += containerDimension - Bar._LABEL_MARGIN_INSIDE_BAR - measurementDimension;
          return;
      }
    };

    if (showLabelOnBar) {
      switch (this._labelsPosition) {
        case LabelsPosition.start:
          aboveOrLeftOfBaseline ? updateCoordinates("bottomRight") : updateCoordinates("topLeft");
          break;
        case LabelsPosition.middle:
          updateCoordinates("center");
          break;
        case LabelsPosition.end:
          aboveOrLeftOfBaseline ? updateCoordinates("topLeft") : updateCoordinates("bottomRight");
          break;
      }
    } else {
      if (aboveOrLeftOfBaseline) {
        alignmentDimension = this._isVertical ? "top" : "left";
        containerDimension = barDimension + Bar._LABEL_MARGIN_INSIDE_BAR + measurementDimension;
        labelContainerOriginCoordinate -= Bar._LABEL_MARGIN_INSIDE_BAR + measurementDimension;
        labelOriginCoordinate -= Bar._LABEL_MARGIN_INSIDE_BAR + measurementDimension;
      } else {
        alignmentDimension = this._isVertical ? "bottom" : "right";
        containerDimension = barDimension + Bar._LABEL_MARGIN_INSIDE_BAR + measurementDimension;
        labelOriginCoordinate += barDimension + Bar._LABEL_MARGIN_INSIDE_BAR;
      }
    }

    return {
      containerDimensions: {
        width: this._isVertical ? barDimensions.width : containerDimension,
        height: this._isVertical ? containerDimension : barDimensions.height,
      },
      labelContainerOrigin: {
        x: this._isVertical ? barCoordinates.x : labelContainerOriginCoordinate,
        y: this._isVertical ? labelContainerOriginCoordinate : barCoordinates.y,
      },
      labelOrigin: {
        x: this._isVertical ? (barCoordinates.x + barDimensions.width / 2 - measurement.width / 2) : labelOriginCoordinate,
        y: this._isVertical ? labelOriginCoordinate : (barCoordinates.y + barDimensions.height / 2 - measurement.height / 2),
      },
      alignment: {
        x: this._isVertical ? "center" : alignmentDimension,
        y: this._isVertical ? alignmentDimension : "center",
      },
    };
  }

  private _createLabelContainer(
      labelArea: SimpleSelection<void>, labelContainerOrigin: Point, labelOrigin: Point, measurement: Typesettable.IDimensions,
      showLabelOnBar: boolean, color: string) {
    const labelContainer = labelArea.append("g").attr("transform", `translate(${labelContainerOrigin.x}, ${labelContainerOrigin.y})`);

    if (showLabelOnBar) {
      labelContainer.classed("on-bar-label", true);
      const dark = Utils.Color.contrast("white", color) * 1.6 < Utils.Color.contrast("black", color);
      labelContainer.classed(dark ? "dark-label" : "light-label", true);
    } else {
      labelContainer.classed("off-bar-label", true);
    }

    return labelContainer;
  }

  protected _generateDrawSteps(): Drawers.DrawStep[] {
    const drawSteps: Drawers.DrawStep[] = [];
    if (this._animateOnNextRender()) {
      const resetAttrToProjector = this._getAttrToProjector();
      const lengthScale = this.length().scale;
      const scaledBaseline = lengthScale.scale(this.baselineValue());
      const lengthAttr = this._isVertical ? "y" : "x";
      const thicknessAttr = this._isVertical ? "height" : "width";
      resetAttrToProjector[lengthAttr] = () => scaledBaseline;
      resetAttrToProjector[thicknessAttr] = () => 0;
      drawSteps.push({ attrToProjector: resetAttrToProjector, animator: this._getAnimator(Plots.Animator.RESET) });
    }
    drawSteps.push({
      attrToProjector: this._getAttrToProjector(),
      animator: this._getAnimator(Plots.Animator.MAIN),
    });
    return drawSteps;
  }

  protected _generateAttrToProjector() {
    const attrToProjector = super._generateAttrToProjector();

    const lengthScale = this.length().scale;
    const scaledBaseline = lengthScale.scale(this.baselineValue());

    const lengthAttr = this._isVertical ? "y" : "x";
    const positionAttr = this._isVertical ? "x" : "y";

    const positionF = Plot._scaledAccessor(this.position());
    const originalLengthFn = Plot._scaledAccessor(this.length());
    const lengthFn = (d: any, i: number, dataset: Dataset) => {
      return Math.abs(scaledBaseline - originalLengthFn(d, i, dataset));
    };

    const thicknessF = attrToProjector[Bar._BAR_THICKNESS_KEY];
    const gapF = attrToProjector["gap"];
    const thicknessMinusGap = gapF == null ? thicknessF : (d: any, i: number, dataset: Dataset) => {
      const thick = thicknessF(d, i, dataset);
      // only subtract gap if bars are at least 2 pixels wide, otherwise canvas
      // interpolation can cause bars to become invisible due to subpixel
      // sampling
      return thick < Bar._BAR_GAPLESS_THRESHOLD_PX ? thick : thick - gapF(d, i, dataset);
    };

    // re-interpret "width" attr from representing "thickness" to actually meaning
    // width (that is, x-direction specific) again
    attrToProjector["width"] = this._isVertical ? thicknessMinusGap : lengthFn;
    attrToProjector["height"] = this._isVertical ? lengthFn : thicknessMinusGap;

    attrToProjector[lengthAttr] = (d: any, i: number, dataset: Dataset) => {
      const originalLength = originalLengthFn(d, i, dataset);
      // If it is past the baseline, it should start at the baseline then width/height
      // carries it over. If it's not past the baseline, leave it at original position and
      // then width/height carries it to baseline
      return (originalLength > scaledBaseline) ? scaledBaseline : originalLength;
    };

    attrToProjector[positionAttr] = (d: any, i: number, dataset: Dataset) => {
      return this._getPositionAttr(positionF(d, i, dataset), thicknessF(d, i, dataset));
    };

    return attrToProjector;
  }

  protected _updateThicknessAttr() {
    const startProj = this.position();
    const endProj = this.barEnd();
    if (startProj != null && endProj != null) {
      this._fixedBarPixelThickness = false;
      this.attr(Bar._BAR_THICKNESS_KEY, (d, i, data) => {
        let v1 = startProj.accessor(d, i, data);
        let v2 = endProj.accessor(d, i, data);
        v1 = startProj.scale ? startProj.scale.scale(v1) : v1;
        v2 = endProj.scale ? endProj.scale.scale(v2) : v2;
        return Math.abs(v2 - v1);
      });
    } else {
      this._fixedBarPixelThickness = true;
      this.attr(Bar._BAR_THICKNESS_KEY, () => this._barPixelThickness());
    }
  }

  private _barPixelThickness() {
    if (this._fixedBarPixelThickness) {
      if (this._projectorsReady()) {
        return this._computeBarPixelThickness(
            this.position(),
            this.datasets(),
            this._isVertical ? this.width() : this.height(),
        );
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  public entities(datasets = this.datasets()): IPlotEntity[] {
    if (!this._projectorsReady()) {
      return [];
    }
    const entities = super.entities(datasets);
    return entities;
  }

  protected _entityBounds(entity: Plots.IPlotEntity | Plots.ILightweightPlotEntity) {
    const { datum, index, dataset } = entity;
    return this._pixelBounds(datum, index, dataset);
  }

  /**
   * The rectangular bounds of a bar. Note that the x/y coordinates are not the
   * same as the "pixel point" because they are always at the top/left of the
   * bar.
   */
  protected _pixelBounds(datum: any, index: number, dataset: Dataset) {
    const attrToProjector = this._getAttrToProjector();
    return {
      x: attrToProjector["x"](datum, index, dataset),
      y: attrToProjector["y"](datum, index, dataset),
      width: attrToProjector["width"](datum, index, dataset),
      height: attrToProjector["height"](datum, index, dataset),
    };
  }

  /**
   * The "pixel point" of a bar is the farthest point from the baseline.
   *
   * For example, in a vertical bar chart with positive bar values, the pixel
   * point will be at the top of the bar. For negative bar values, the pixel
   * point will be at the bottom of the bar.
   */
  protected _pixelPoint(datum: any, index: number, dataset: Dataset): Point {
    const rect = this._pixelBounds(datum, index, dataset);
    const originalPosition = (this._isVertical ? Plot._scaledAccessor(this.y()) : Plot._scaledAccessor(this.x()))(datum, index, dataset);
    const scaledBaseline = (<Scale<any, any>> (this._isVertical ? this.y().scale : this.x().scale)).scale(this.baselineValue());
    return this._pixelPointBar(originalPosition, scaledBaseline, rect);
  }

  private _pixelPointBar(originalPosition: number, scaledBaseline: number, rect: IEntityBounds) {
      let x, y;
      if (this._isVertical) {
        x = rect.x + rect.width / 2;
        y = originalPosition <= scaledBaseline ? rect.y : rect.y + rect.height;
      } else {
        x = originalPosition >= scaledBaseline ? rect.x + rect.width : rect.x;
        y = rect.y + rect.height / 2;
      }
      return { x, y };
  }

  protected _uninstallScaleForKey(scale: Scale<any, number>, key: string) {
    super._uninstallScaleForKey(scale, key);
  }

  protected _getDataToDraw(): Utils.Map<Dataset, any[]> {
    const dataToDraw = new Utils.Map<Dataset, any[]>();
    const attrToProjector = this._getAttrToProjector();
    const plotWidth = this.width();
    const plotHeight = this.height();
    this.datasets().forEach((dataset: Dataset) => {
      const data = dataset.data().map((d, i) => {
        const isValid = this._isDatumOnScreen(attrToProjector, plotWidth, plotHeight, d, i, dataset);
        return isValid ? d : null;
      });
      dataToDraw.set(dataset, data);
    });
    return dataToDraw;
  }

  protected _isDatumOnScreen(
    attrToProjector: AttributeToProjector,
    plotWidth: number,
    plotHeight: number,
    d: any,
    i: number,
    dataset: Dataset,
  ) {
    const pixelX = attrToProjector["x"](d, i, dataset);
    const pixelY = attrToProjector["y"](d, i, dataset);
    const pixelWidth = attrToProjector["width"](d, i, dataset);
    const pixelHeight = attrToProjector["height"](d, i, dataset);
    const isValid = Utils.Math.isValidNumber(pixelX) &&
      Utils.Math.isValidNumber(pixelY) &&
      Utils.Math.isValidNumber(pixelWidth) &&
      Utils.Math.isValidNumber(pixelHeight);

    if (!isValid) {
      return false;
    }
    return Utils.Math.boundsIntersects(
      pixelX, pixelY, pixelWidth, pixelHeight,
      0, 0, plotWidth, plotHeight,
    );
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
}

/**
 * Computes the barPixelThickness of all the bars in the plot.
 *
 * If the position scale of the plot is a CategoryScale and in bands mode, then the rangeBands function will be used.
 * If the position scale of the plot is a QuantitativeScale, then the bar thickness is equal to the smallest distance between
 * two adjacent data points, padded for visualisation.
 *
 * This is ignored when explicitly setting the barEnd.
 */
function computeBarPixelThickness(
    positionBinding: Plots.ITransformableAccessorScaleBinding<any, number>,
    datasets: Dataset[],
    plotPositionDimensionLength: number,
): number {
  let barPixelThickness: number;
  const positionScale = positionBinding.scale;
  if (positionScale instanceof Scales.Category) {
    barPixelThickness = positionScale.rangeBand();
  } else {
    const positionAccessor = positionBinding.accessor;

    const numberBarAccessorData = d3.set(Utils.Array.flatten(datasets.map((dataset) => {
      return dataset.data().map((d, i) => positionAccessor(d, i, dataset))
          .filter((d) => d != null)
          .map((d) => d.valueOf());
    }))).values().map((value) => +value);

    numberBarAccessorData.sort((a, b) => a - b);

    const scaledData = numberBarAccessorData.map((datum) => positionScale.scale(datum));
    const barAccessorDataPairs = d3.pairs(scaledData);

    barPixelThickness = Utils.Math.min(barAccessorDataPairs, (pair: any[], i: number) => {
      return Math.abs(pair[1] - pair[0]);
    }, plotPositionDimensionLength * Bar._SINGLE_BAR_DIMENSION_RATIO);

    barPixelThickness *= Bar._BAR_THICKNESS_RATIO;
  }
  return barPixelThickness;
}

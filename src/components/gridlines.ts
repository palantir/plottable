namespace Plottable.Components {

  export type ILinePosition = "center" | "after";
  type ScaleDomainValues = (string | number)[];

  export class Gridlines extends Component {
    private static validateScale = (scale: any, which: string) => {
      if (scale != null &&
          ! QuantitativeScale.prototype.isPrototypeOf(scale) &&
          ! Plottable.Scales.Category.prototype.isPrototypeOf(scale)) {
        throw new Error(which + " needs to inherit from Scale.QuantitativeScale or Scales.Category.");
      }
    };

    private _xScale: Scale<any, number>;
    private _yScale: Scale<any, number>;
    private _xLinesContainer: d3.Selection<void>;
    private _yLinesContainer: d3.Selection<void>;
    private _xTicks: () => ScaleDomainValues;
    private _yTicks: () => ScaleDomainValues;

    /**
     */
    private _xLinePosition: ILinePosition;
    private _yLinePosition: ILinePosition;

    private _renderCallback: ScaleCallback<Scale<any, number>>;
    /**
     * @constructor
     *
     * @param {Scale<any, number>} xScale The scale to base the x
     * gridlines on. Can be a category or numeric scale. Pass null if
     * no gridlines are desired.
     *
     * @param {Scale<any, number>} yScale The scale to base the y
     * gridlines on. Can be a category or numeric scale. Pass null if
     * no gridlines are desired.
     */
    constructor(
        xScale: QuantitativeScale<any> | Plottable.Scales.Category,
        yScale: QuantitativeScale<any> | Plottable.Scales.Category) {

      Gridlines.validateScale(xScale, "xScale");
      Gridlines.validateScale(yScale, "yScale");

      super();
      this.addClass("gridlines");
      this._xScale = xScale;
      this._yScale = yScale;
      this._renderCallback = (scale) => this.render();

      this._xLinePosition = "center";
      this._yLinePosition = "center";

      if (this._xScale) {
        this._xTicks = this._mkTicks(xScale);
        this._xScale.onUpdate(this._renderCallback);
      }
      if (this._yScale) {
        this._yTicks = this._mkTicks(yScale);
        this._yScale.onUpdate(this._renderCallback);
      }
    }

    /**
     * Gets the xLinePosition value.
     */
    public xLinePosition(): ILinePosition;
    /**
     * Sets the xLinePosition value, which specifies whether lines are drawn in
     * the center of category or after it.
     *
     * Valid options are "center" and "after". Note that this only makes sense
     * for category axes.
     *
     * @default "center"
     *
     * @param {ILinePosition} linePosition - "center" or "after"
     * @returns {GridLines} this object.
     */
    public xLinePosition(linePosition: ILinePosition): this;
    public xLinePosition(linePosition?: ILinePosition): any {
      if (arguments.length === 0) {
        return this._xLinePosition;
      } else {
        this._xLinePosition = linePosition;
      }
      return this;
    }

    /**
     * Gets the yLinePosition value.
     */
    public yLinePosition(): ILinePosition;
    /**
     * Sets the yLinePosition value, which specifies whether lines are drawn in
     * the center of category or after it.
     *
     * Valid options are "center" and "after". Note that this only makes sense
     * for category axes.
     *
     * @default "center"
     *
     * @param {ILinePosition} linePosition - "center" or "after"
     * @returns {GridLines} this object.
     */
    public yLinePosition(linePosition: ILinePosition): this;
    public yLinePosition(linePosition?: ILinePosition): any {
      if (arguments.length === 0) {
        return this._yLinePosition;
      } else {
        this._yLinePosition = linePosition;
      }
      return this;
    }

    public destroy() {
      super.destroy();
      if (this._xScale) {
        this._xScale.offUpdate(this._renderCallback);
      }
      if (this._yScale) {
        this._yScale.offUpdate(this._renderCallback);
      }
      return this;
    }

    protected _setup() {
      super._setup();
      this._xLinesContainer = this.content().append("g").classed("x-gridlines", true);
      this._yLinesContainer = this.content().append("g").classed("y-gridlines", true);
    }

    public renderImmediately() {
      super.renderImmediately();
      this._redrawXLines();
      this._redrawYLines();
      return this;
    }

    public computeLayout(origin?: Point, availableWidth?: number, availableHeight?: number) {
      super.computeLayout(origin, availableWidth, availableHeight);
      if (this._xScale != null) {
        this._xScale.range([0, this.width()]);
      }
      if (this._yScale != null) {
        this._yScale.range([this.height(), 0]);
      }
      return this;
    }

    private _mkTicks(scale: QuantitativeScale<any> | Plottable.Scales.Category): () => ScaleDomainValues {
      if (QuantitativeScale.prototype.isPrototypeOf(scale)) {
        return () => (<QuantitativeScale<any>>scale).ticks();
      } else if (Plottable.Scales.Category.isInstance(scale)) {
        return () => scale.getDownsampleInfo().domain;
      } else {
        return () => scale.domain();
      }
    }

    private _redrawXLines() {
      if (this._xScale) {
        let positionOffet = 0;
        if (Plottable.Scales.Category.isInstance(this._xScale) && this.xLinePosition() === "after") {
          positionOffet = this._xScale.getDownsampleInfo().stepWidth / 2.0;
        }

        let getScaledXValue = (tickVal: any) => this._xScale.scale(tickVal) + positionOffet;
        let xTicks = this._xTicks();
        let xLines = this._xLinesContainer.selectAll("line").data(xTicks);
        xLines.enter().append("line");
        xLines.attr("x1", getScaledXValue)
              .attr("y1", 0)
              .attr("x2", getScaledXValue)
              .attr("y2", this.height())
             .classed("zeroline", (t: number) => t === 0);
        xLines.exit().remove();
      }
    }

    private _redrawYLines() {
      if (this._yScale) {

        let positionOffet = 0;
        if (Plottable.Scales.Category.isInstance(this._yScale) && this.yLinePosition() === "after") {
          positionOffet = this._yScale.getDownsampleInfo().stepWidth / 2.0;
        }

        let getScaledYValue = (tickVal: any) => this._yScale.scale(tickVal) + positionOffet;
        let yTicks = this._yTicks();
        let yLines = this._yLinesContainer.selectAll("line").data(yTicks);
        yLines.enter().append("line");
        yLines.attr("x1", 0)
          .attr("y1", getScaledYValue)
          .attr("x2", this.width())
          .attr("y2", getScaledYValue)
          .classed("zeroline", (t: number) => t === 0);
        yLines.exit().remove();
      }
    }
  }
}

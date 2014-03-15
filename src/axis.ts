///<reference path="reference.ts" />

module Plottable {
  export class Axis extends Component {
    public static yWidth = 50;
    public static xHeight = 30;
    public axisElement: D3.Selection;
    private d3Axis: D3.Svg.Axis;
    private axisScale: Scale;
    private tickPositioning = "center";

    /**
     * Creates an Axis.
     *
     * @constructor
     * @param {Scale} scale The Scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
     * @param {any} [formatter] a D3 formatter
     */
    constructor(axisScale: Scale, orientation: string, formatter?: any) {
      super();
      this.axisScale = axisScale;
      orientation = orientation.toLowerCase();
      this.d3Axis = d3.svg.axis().scale(axisScale._d3Scale).orient(orientation);
      this.classed("axis", true);
      this.clipPathEnabled = true;
      if (formatter == null) {
        formatter = d3.format(".3s");
      }
      this.d3Axis.tickFormat(formatter);
      this.axisScale.registerListener(() => this.rescale());
    }

    public anchor(element: D3.Selection) {
      super.anchor(element);
      this.axisElement = this.content.append("g").classed("axis", true);
      return this;
    }

    public render() {
      if (this.orient() === "left") {this.axisElement.attr("transform", "translate(" + Axis.yWidth + ", 0)");};
      if (this.orient() === "top")  {this.axisElement.attr("transform", "translate(0," + Axis.xHeight + ")");};
      var domain = this.d3Axis.scale().domain();
      var extent = Math.abs(domain[1] - domain[0]);
      var min = +d3.min(domain);
      var max = +d3.max(domain);
      var newDomain: any;
      var standardOrder = domain[0] < domain[1];
      if (typeof(domain[0]) === "number") {
        newDomain = standardOrder ? [min - extent, max + extent] : [max + extent, min - extent];
      } else {
        newDomain = standardOrder ? [new Date(min - extent), new Date(max + extent)] : [new Date(max + extent), new Date(min - extent)];
      }

      // hackhack Make tiny-zero representations not look terrible, by rounding them to 0
      if ((<QuantitiveScale> this.axisScale).ticks != null) {
        var scale = <QuantitiveScale> this.axisScale;
        var nTicks = 10;
        var ticks = scale.ticks(nTicks);
        var numericDomain = scale.domain();
        var interval = numericDomain[1] - numericDomain[0];
        var cleanTick = (n: number) => Math.abs(n / interval / nTicks) < 0.0001 ? 0 : n;
        ticks = ticks.map(cleanTick);
        this.d3Axis.tickValues(ticks);
      }

      this.axisElement.call(this.d3Axis);

      this.axisElement.selectAll(".tick").select("text").style("visibility", "visible");

      return this;
    }

    public _hideCutOffTickLabels() {
      var availableWidth = this.availableWidth;
      var availableHeight = this.availableHeight;
      var tickLabels = this.axisElement.selectAll(".tick").select("text");

      var boundingBox = this.element.select(".bounding-box")[0][0].getBoundingClientRect();

      function boxIsInside(inner: ClientRect, outer: ClientRect) {
        return (outer.left <= inner.left &&
                inner.right <= outer.right &&
                outer.top <= inner.top &&
                inner.bottom <= outer.bottom);
      }

      tickLabels.each(function (d: any){
        if (!boxIsInside(this.getBoundingClientRect(), boundingBox)) {
          d3.select(this).style("visibility", "hidden");
        }
      });

      return this;
    }

    private rescale() {
      return (this.element != null) ? this.render() : null;
      // short circuit, we don't care about perf.
    }

    public scale(): Scale;
    public scale(newScale: Scale): Axis;
    public scale(newScale?: Scale): any {
      if (newScale == null) {
        return this.axisScale;
      } else {
        this.axisScale = newScale;
        this.d3Axis.scale(newScale._d3Scale);
        return this;
      }
    }

    /**
     * Sets or gets the tick label position relative to the tick marks.
     * The exact consequences of particular tick label positionings depends on the subclass implementation.
     *
     * @param {string} [position] The relative position of the tick label.
     * @returns {string|Axis} The current tick label position, or the calling Axis.
     */
    public tickLabelPosition(): string;
    public tickLabelPosition(position: string): Axis;
    public tickLabelPosition(position?: string): any {
      if (position == null) {
        return this.tickPositioning;
      } else {
        this.tickPositioning = position;
        return this;
      }
    }

    public orient(): string;
    public orient(newOrient: string): Axis;
    public orient(newOrient?: string): any {
      if (newOrient == null) {
        return this.d3Axis.orient();
      } else {
        this.d3Axis.orient(newOrient);
        return this;
      }
    }

    public ticks(): any[];
    public ticks(...args: any[]): Axis;
    public ticks(...args: any[]): any {
      if (args == null || args.length === 0) {
        return this.d3Axis.ticks();
      } else {
        this.d3Axis.ticks(args);
        return this;
      }
    }

    public tickValues(): any[];
    public tickValues(...args: any[]): Axis;
    public tickValues(...args: any[]): any {
      if (args == null) {
        return this.d3Axis.tickValues();
      } else {
        this.d3Axis.tickValues(args);
        return this;
      }
    }

    public tickSize(): number;
    public tickSize(inner: number): Axis;
    public tickSize(inner: number, outer: number): Axis;
    public tickSize(inner?: number, outer?: number): any {
      if (inner != null && outer != null) {
        this.d3Axis.tickSize(inner, outer);
        return this;
      } else if (inner != null) {
        this.d3Axis.tickSize(inner);
        return this;
      } else {
        return this.d3Axis.tickSize();
      }
    }

    public innerTickSize(): number;
    public innerTickSize(val: number): Axis;
    public innerTickSize(val?: number): any {
      if (val == null) {
        return this.d3Axis.innerTickSize();
      } else {
        this.d3Axis.innerTickSize(val);
        return this;
      }
    }

    public outerTickSize(): number;
    public outerTickSize(val: number): Axis;
    public outerTickSize(val?: number): any {
      if (val == null) {
        return this.d3Axis.outerTickSize();
      } else {
        this.d3Axis.outerTickSize(val);
        return this;
      }
    }

    public tickPadding(): number;
    public tickPadding(val: number): Axis;
    public tickPadding(val?: number): any {
      if (val == null) {
        return this.d3Axis.tickPadding();
      } else {
        this.d3Axis.tickPadding(val);
        return this;
      }
    }

    public tickFormat(): (value: any) => string;
    public tickFormat(formatter: (value: any) => string): Axis;
    public tickFormat(formatter?: (value: any) => string): any {
      if (formatter == null) {
        return this.d3Axis.tickFormat();
      } else {
        this.d3Axis.tickFormat(formatter);
        return this;
      }
    }
  }

  export class XAxis extends Axis {
    /**
     * Creates an XAxis (a horizontal Axis).
     *
     * @constructor
     * @param {Scale} scale The Scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom)
     * @param {any} [formatter] a D3 formatter
     */
    constructor(scale: Scale, orientation: string, formatter: any = null) {
      var orientationLC = orientation.toLowerCase();
      if (orientationLC !== "top" && orientationLC !== "bottom") {
        throw new Error(orientation + " is not a valid orientation for XAxis");
      }
      super(scale, orientation, formatter);
      super.rowMinimum(Axis.xHeight);
      this.fixedWidthVal = false;
      this.tickLabelPosition("center");
    }

    public anchor(element: D3.Selection): XAxis {
      super.anchor(element);
      this.axisElement.classed("x-axis", true);
      return this;
    }

    /**
     * Sets or gets the tick label position relative to the tick marks.
     *
     * @param {string} [position] The relative position of the tick label (left/center/right).
     * @returns {string|XAxis} The current tick label position, or the calling XAxis.
     */
    public tickLabelPosition(): string;
    public tickLabelPosition(position: string): XAxis;
    public tickLabelPosition(position?: string): any {
      if (position == null) {
        return super.tickLabelPosition();
      } else {
        var positionLC = position.toLowerCase();
        if (positionLC === "left" || positionLC === "center" || positionLC === "right") {
          if (positionLC !== "center") {
            this.tickSize(12); // longer than default tick size
          }
          return super.tickLabelPosition(positionLC);
        } else {
          throw new Error(position + " is not a valid tick label position for XAxis");
        }
      }
    }

    public render() {
      super.render();
      if (this.tickLabelPosition() !== "center") {
        var tickTextLabels = this.axisElement.selectAll("text");
        tickTextLabels.attr("y", "0px");

        if (this.orient() === "bottom") {
          tickTextLabels.attr("dy", "1em");
        } else {
          tickTextLabels.attr("dy", "-0.25em");
        }

        if (this.tickLabelPosition() === "right") {
          tickTextLabels.attr("dx", "0.2em").style("text-anchor", "start");
        } else if (this.tickLabelPosition() === "left") {
          tickTextLabels.attr("dx", "-0.2em").style("text-anchor", "end");
        }
      }
      this._hideCutOffTickLabels();
      return this;
    }
  }

  export class YAxis extends Axis {
    /**
     * Creates a YAxis (a vertical Axis).
     *
     * @constructor
     * @param {Scale} scale The Scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (left/right)
     * @param {any} [formatter] a D3 formatter
     */
    constructor(scale: Scale, orientation: string, formatter: any = null) {
      var orientationLC = orientation.toLowerCase();
      if (orientationLC !== "left" && orientationLC !== "right") {
        throw new Error(orientation + " is not a valid orientation for YAxis");
      }
      super(scale, orientation, formatter);
      super.colMinimum(Axis.yWidth);
      this.fixedHeightVal = false;
      this.tickLabelPosition("MIDDLE");
    }

    public anchor(element: D3.Selection): YAxis {
      super.anchor(element);
      this.axisElement.classed("y-axis", true);
      return this;
    }

    /**
     * Sets or gets the tick label position relative to the tick marks.
     *
     * @param {string} [position] The relative position of the tick label (top/middle/bottom).
     * @returns {string|YAxis} The current tick label position, or the calling YAxis.
     */
    public tickLabelPosition(): string;
    public tickLabelPosition(position: string): YAxis;
    public tickLabelPosition(position?: string): any {
      if (position == null) {
        return super.tickLabelPosition();
      } else {
        var positionLC = position.toLowerCase();
        if (positionLC === "top" || positionLC === "middle" || positionLC === "bottom") {
          if (positionLC !== "middle") {
            this.tickSize(30); // longer than default tick size
          }
          return super.tickLabelPosition(positionLC);
        } else {
          throw new Error(position + " is not a valid tick label position for YAxis");
        }
      }
    }

    public render() {
      super.render();
      if (this.tickLabelPosition() !== "middle") {
        var tickTextLabels = this.axisElement.selectAll("text");
        tickTextLabels.attr("x", "0px");

        if (this.orient() === "left") {
          tickTextLabels.attr("dx", "-0.25em");
        } else {
          tickTextLabels.attr("dx", "0.25em");
        }

        if (this.tickLabelPosition() === "top") {
          tickTextLabels.attr("dy", "-0.3em");
        } else if (this.tickLabelPosition() === "bottom") {
          tickTextLabels.attr("dy", "1em");
        }
      }
      this._hideCutOffTickLabels();
      return this;
    }
  }
}

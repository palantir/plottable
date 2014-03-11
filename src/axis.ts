///<reference path="reference.ts" />

module Plottable {
  export class Axis extends Component {
    private static CSS_CLASS = "axis";

    public static yWidth = 50;
    public static xHeight = 30;
    public axisElement: D3.Selection;
    public axis: D3.Svg.Axis;
    private axisScale: Scale;
    private cachedScale: number;
    private cachedTranslate: number;
    private isXAligned: boolean;

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
      this.axis = d3.svg.axis().scale(axisScale._internalScale).orient(orientation);
      this.classed(Axis.CSS_CLASS, true);
      this.clipPathEnabled = true;
      this.isXAligned = this.orient() === "bottom" || this.orient() === "top";
      if (formatter == null) {
        formatter = d3.format(".3s");
      }
      this.axis.tickFormat(formatter);
      this.axisScale.registerListener(() => this.rescale());
    }

    public anchor(element: D3.Selection) {
      super.anchor(element);
      this.axisElement = this.content.append("g").classed("axis", true); // TODO: remove extraneous sub-element
      return this;
    }

    public render() {
      if (this.orient() === "left") {this.axisElement.attr("transform", "translate(" + Axis.yWidth + ", 0)");};
      if (this.orient() === "top")  {this.axisElement.attr("transform", "translate(0," + Axis.xHeight + ")");};
      var domain = this.axis.scale().domain();
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
        this.axis.tickValues(ticks);
      }

      this.axisElement.call(this.axis);
      var bbox = (<any> this.axisElement.node()).getBBox();
      if (bbox.height > this.availableHeight || bbox.width > this.availableWidth) {
        this.axisElement.classed("error", true);
      }
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
        this.axis.scale(newScale._internalScale);
        return this;
      }
    }

    public orient(): string;
    public orient(newOrient: string): Axis;
    public orient(newOrient?: string): any {
      if (newOrient == null) {
        return this.axis.orient();
      } else {
        this.axis.orient(newOrient);
        return this;
      }
    }

    public ticks(): any[];
    public ticks(...args: any[]): Axis;
    public ticks(...args: any[]): any {
      if (args == null || args.length === 0) {
        return this.axis.ticks();
      } else {
        this.axis.ticks(args);
        return this;
      }
    }

    public tickValues(): any[];
    public tickValues(...args: any[]): Axis;
    public tickValues(...args: any[]): any {
      if (args == null) {
        return this.axis.tickValues();
      } else {
        this.axis.tickValues(args);
        return this;
      }
    }

    public tickSize(): number;
    public tickSize(inner: number): Axis;
    public tickSize(inner: number, outer: number): Axis;
    public tickSize(inner?: number, outer?: number): any {
      if (inner != null && outer != null) {
        this.axis.tickSize(inner, outer);
        return this;
      } else if (inner != null) {
        this.axis.tickSize(inner);
        return this;
      } else {
        return this.axis.tickSize();
      }
    }

    public innerTickSize(): number;
    public innerTickSize(val: number): Axis;
    public innerTickSize(val?: number): any {
      if (val == null) {
        return this.axis.innerTickSize();
      } else {
        this.axis.innerTickSize(val);
        return this;
      }
    }

    public outerTickSize(): number;
    public outerTickSize(val: number): Axis;
    public outerTickSize(val?: number): any {
      if (val == null) {
        return this.axis.outerTickSize();
      } else {
        this.axis.outerTickSize(val);
        return this;
      }
    }

    public tickPadding(): number;
    public tickPadding(val: number): Axis;
    public tickPadding(val?: number): any {
      if (val == null) {
        return this.axis.tickPadding();
      } else {
        this.axis.tickPadding(val);
        return this;
      }
    }


    public tickFormat(): (value: any) => string;
    public tickFormat(formatter: (value: any) => string): Axis;
    public tickFormat(formatter?: (value: any) => string): any {
      if (formatter == null) {
        return this.axis.tickFormat();
      } else {
        this.axis.tickFormat(formatter);
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
     * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
     * @param {any} [formatter] a D3 formatter
     */
    constructor(scale: Scale, orientation: string, formatter: any = null) {
      super(scale, orientation, formatter);
      super.rowMinimum(Axis.xHeight);
      this.fixedWidthVal = false;
    }
  }

  export class YAxis extends Axis {
    /**
     * Creates a YAxis (a vertical Axis).
     *
     * @constructor
     * @param {Scale} scale The Scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
     * @param {any} [formatter] a D3 formatter
     */
    constructor(scale: Scale, orientation: string, formatter: any = null) {
      super(scale, orientation, formatter);
      super.colMinimum(Axis.yWidth);
      this.fixedHeightVal = false;
    }
  }
}

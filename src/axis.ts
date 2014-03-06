///<reference path="reference.ts" />

module Plottable {
  export class Axis extends Component {
    private static CSS_CLASS = "axis";
    private scale: Scale;
    private orientation: string;
    private formatter: any;

    public static yWidth = 50;
    public static xHeight = 30;
    public axisElement: D3.Selection;
    public d3axis: D3.Svg.Axis;
    private cachedScale: number;
    private cachedTranslate: number;
    private isXAligned: boolean;

    private static axisXTransform(selection, x) {
      selection.attr("transform", function(d) {
        return "translate(" + x(d) + ",0)";
      });
    }

    private static axisYTransform(selection, y) {
      selection.attr("transform", function(d) {
        return "translate(0," + y(d) + ")";
      });
    }

    /**
     * Creates an Axis.
     *
     * @constructor
     * @param {Scale} scale The Scale to base the Axis on.
     * @param {string} orientation The orientation of the Axis (top/bottom/left/right)
     * @param {any} [formatter] a D3 formatter
     */
    constructor(scale: Scale, orientation: string, formatter?: any) {
      super();
      this.scale = scale;
      this.classed(Axis.CSS_CLASS, true);
      this.clipPathEnabled = true;
      this.orientation = orientation;
      this.isXAligned = this.orientation === "bottom" || this.orientation === "top";
      this.d3axis = d3.svg.axis().scale(this.scale.scale).orient(this.orientation);
      if (formatter == null) {
        this.formatter = d3.format(".3s");
      } else {
        this.formatter = formatter;
      }
      this.d3axis.tickFormat(this.formatter);

      this.cachedScale = 1;
      this.cachedTranslate = 0;
      this.scale.registerListener(() => this.rescale());
    }

    public anchor(element: D3.Selection) {
      super.anchor(element);
      this.axisElement = this.element.append("g").classed("axis", true); // TODO: remove extraneous sub-element
      return this;
    }

    private transformString(translate: number, scale: number) {
      var translateS = this.isXAligned ? "" + translate : "0," + translate;
      return "translate(" + translateS + ")";
    }

    public render() {
      if (this.orientation === "left") {this.axisElement.attr("transform", "translate(" + Axis.yWidth + ", 0)");};
      if (this.orientation === "top")  {this.axisElement.attr("transform", "translate(0," + Axis.xHeight + ")");};
      var domain = this.scale.domain();
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
      if ((<QuantitiveScale> this.scale).ticks != null) {
        var scale = <QuantitiveScale> this.scale;
        var nTicks = 10;
        var ticks = scale.ticks(nTicks);
        var numericDomain = scale.domain();
        var interval = numericDomain[1] - numericDomain[0];
        var cleanTick = (n) => Math.abs(n / interval / nTicks) < 0.0001 ? 0 : n;
        ticks = ticks.map(cleanTick);
        this.d3axis.tickValues(ticks);
      }

      this.axisElement.call(this.d3axis);
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

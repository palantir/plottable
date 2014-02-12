///<reference path="reference.ts" />

class Axis extends Component {
  private static CSS_CLASS = "axis";
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

  constructor(
    public scale: Scale,
    public orientation: string,
    public formatter: any
  ) {
    super();
    this.classed(Axis.CSS_CLASS, true);
    this.clipPathEnabled = true;
    this.isXAligned = this.orientation === "bottom" || this.orientation === "top";
    this.d3axis = d3.svg.axis().scale(this.scale.scale).orient(this.orientation);
    if (this.formatter == null) {
      this.formatter = d3.format(".3s");
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
    if (this.orientation === "left") {this.axisElement.attr("transform", "translate(" + Axis.yWidth + ")");};
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
    // chai.assert.operator(this.element.node().getBBox().height, '<=', height, "axis height is appropriate");
    // chai.assert.operator(this.element.node().getBBox().width,  '<=', width, "axis width is appropriate");
    return this;
  }

  public rescale() {
    return (this.element != null) ? this.render() : null;
    // short circuit, we don't care about perf.
    // var tickTransform = this.isXAligned ? Axis.axisXTransform : Axis.axisYTransform;
    // var tickSelection = this.element.selectAll(".tick");
    // (<any> tickSelection).call(tickTransform, this.scale.scale);
    // this.axisElement.attr("transform","");
  }

  public zoom(translatePair: number[], scale: number) {
    return this.render(); //short-circuit, we dont need the performant cleverness for present demo
    // var translate = this.isXAligned ? translatePair[0] : translatePair[1];
    // if (scale != null && scale !== this.cachedScale) {
    //   this.cachedTranslate = translate;
    //   this.cachedScale = scale;
    //   this.rescale();
    // } else {
    //   translate -= this.cachedTranslate;
    //   var transform = this.transformString(translate, scale);
    //   this.axisElement.attr("transform", transform);
    // }
  }
}

class XAxis extends Axis {
  constructor(scale: Scale, orientation: string, formatter: any = null) {
    super(scale, orientation, formatter);
    super.rowMinimum(Axis.xHeight);
  }
}

class YAxis extends Axis {
  constructor(scale: Scale, orientation: string, formatter: any = null) {
    super(scale, orientation, formatter);
    super.colMinimum(Axis.yWidth);
  }
}

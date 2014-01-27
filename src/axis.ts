///<reference path="../lib/d3.d.ts" />

class Axis extends Renderable {
  public static yWidth = 30;
  public static xHeight = 30;
  public element: D3.Selection;
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
    public scale: D3.Scale.Scale,
    public orientation: string,
    public formatter: any
  ) {
    // this.orientation = attachmentTypeToString(this.attachmentPoint);
    this.d3axis = d3.svg.axis().scale(this.scale).orient(this.orientation);
    if (this.formatter != null) {
      this.d3axis.tickFormat(formatter);
    }
    this.cachedScale = 1;
    this.cachedTranslate = 0;
    this.isXAligned = this.orientation === "bottom" || this.orientation === "top";
  }

  private transformString(translate: number, scale: number) {
    var translateS = this.isXAligned ? "" + translate : "0," + translate;
    return "translate(" + translateS + ")";
  }

  public render(element: D3.Selection, width: number, height: number) {
    this.element = element.append("g").classed("axis", true);
    if (this.orientation === "left") this.element.attr("transform", "translate(" + Axis.yWidth + ")");
    if (this.orientation === "top")  this.element.attr("transform", "translate(0," + Axis.xHeight + ")");
    var domain = this.scale.domain();
    var extent = Math.abs(domain[1] - domain[0]);
    var min = +d3.min(domain);
    var max = +d3.max(domain);
    var newDomain: any;
    var standardOrder = domain[0] < domain[1];
    if (typeof(domain[0]) == "number") {
      newDomain = standardOrder ? [min - extent, max + extent] : [max + extent, min - extent];
    } else {
      newDomain = standardOrder ? [new Date(min - extent), new Date(max + extent)] : [new Date(max + extent), new Date(min - extent)];
    }
    // var copyScale = this.scale.copy().domain(newDomain)
    // var ticks = (<any> copyScale).ticks(30);
    // this.d3axis.tickValues(ticks);
    // a = [100,0]; extent = -100; 100 - (-100) = 200, 0 - (-100) = 100
    // a = [0,100]; extent = 100; 0 - 100 = -100, 100 - 100
    this.element.call(this.d3axis);
  }

  public rescale() {
    var tickTransform = this.isXAligned ? Axis.axisXTransform : Axis.axisYTransform;
    var tickSelection = this.element.selectAll(".tick");
    (<any> tickSelection).call(tickTransform, this.scale);
    this.element.attr("transform","");
  }

  public transform(translatePair: number[], scale: number) {
    var translate = this.isXAligned ? translatePair[0] : translatePair[1];
    if (scale != null && scale != this.cachedScale) {
      this.cachedTranslate = translate;
      this.cachedScale = scale;
      this.rescale();
    } else {
      translate -= this.cachedTranslate;
      var transform = this.transformString(translate, scale);
      this.element.attr("transform", transform);
    }
  }
}


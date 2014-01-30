///<reference path="../lib/d3.d.ts" />
///<reference path="../lib/chai/chai.d.ts" />
///<reference path="scale.ts" />

class Renderer extends Component {
  public renderArea: D3.Selection;
  public element: D3.Selection;
  public scales: Scale[];

  constructor(
    public dataset: IDataset
  ) {
    super();
    super.rowWeight(1);
    super.colWeight(1);
  }

  public zoom(translate, scale) {
    this.renderArea.attr("transform", "translate("+translate+") scale("+scale+")");
  }

  public anchor(element: D3.Selection) {
    super.anchor(element);
    this.element.classed("renderer-container", true);
    this.boundingBox.classed("renderer-bounding-box", true);
    this.renderArea = element.append("g").classed("render-area", true).classed(this.dataset.seriesName, true);
  }
}

interface IAccessor {
  (d: any): number;
};

class XYRenderer extends Renderer {
  private static defaultXAccessor = (d: any) => d.x;
  private static defaultYAccessor = (d: any) => d.y;
  public xScale: Scale;
  public yScale: Scale;
  private xAccessor: IAccessor;
  private yAccessor: IAccessor;
  public xScaledAccessor: (datum: any) => number;
  public yScaledAccessor: (datum: any) => number;
  constructor(dataset: IDataset, xScale: Scale, yScale: Scale, xAccessor?: IAccessor, yAccessor?: IAccessor) {
    super(dataset);
    this.xAccessor = (xAccessor != null) ? xAccessor : XYRenderer.defaultXAccessor;
    this.yAccessor = (yAccessor != null) ? yAccessor : XYRenderer.defaultYAccessor;
    this.xScale = xScale;
    this.yScale = yScale;
    this.xScaledAccessor = (datum: any) => this.xScale.scale(this.xAccessor(datum));
    this.yScaledAccessor = (datum: any) => this.yScale.scale(this.yAccessor(datum));
    var data = dataset.data;
    var xDomain = d3.extent(data, this.xAccessor);
    this.xScale.widenDomain(xDomain);
    var yDomain = d3.extent(data, this.yAccessor);
    this.yScale.widenDomain(yDomain);
  }

  public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight? :number) {
    super.computeLayout(xOffset, yOffset, availableWidth, availableHeight);
    this.xScale.range([0, this.availableWidth]);
    this.yScale.range([this.availableHeight, 0]);
  }
}


class LineRenderer extends XYRenderer {
  private line: D3.Svg.Line;

  constructor(dataset: IDataset, xScale: Scale, yScale: Scale, xAccessor?: IAccessor, yAccessor?: IAccessor) {
    super(dataset, xScale, yScale, xAccessor, yAccessor);
  }

  public anchor(element: D3.Selection) {
    super.anchor(element);
    this.renderArea = this.renderArea.append("path");
  }

  public render() {
    super.render();
    this.line = d3.svg.line().interpolate("basis").x(this.xScaledAccessor).y(this.yScaledAccessor);
    this.renderArea.classed("line", true)
      .classed(this.dataset.seriesName, true)
      .datum(this.dataset.data);
    this.renderArea.attr("d", this.line);
  }
}

class CircleRenderer extends XYRenderer {
  private circles: D3.Selection;

  constructor(dataset: IDataset, xScale: Scale, yScale: Scale, xAccessor?: IAccessor, yAccessor?: IAccessor) {
    super(dataset, xScale, yScale, xAccessor, yAccessor);
  }

  public render() {
    super.render();

    this.circles = this.renderArea.selectAll("circle");
    this.circles.data(this.dataset.data).enter().append("circle")
      .attr("cx", this.xScaledAccessor)
      .attr("cy", this.yScaledAccessor)
      .attr("r", 3);
  }
}

// class ResizingCircleRenderer extends CircleRenderer {
//   public transform(translate: number[], scale: number) {
//     console.log("xform");
//     this.renderArea.selectAll("circle").attr("r", 0.5/scale);
//   }
// }

// class RectRenderer extends Renderer {
//   private rects: D3.Selection;

//   public render() {
//     this.rects = this.renderArea.selectAll("rect");
//     this.rects.data(this.data).enter().append("rect")
//       .attr("x", (d) => {return this.xScale(d.date);})
//       .attr("y", (d) => {return this.yScale(d.y) + Math.random() * 10 - 5;})
//       .attr("width", 1)
//       .attr("height",1);
//   }
// }

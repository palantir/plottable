///<reference path="../lib/d3.d.ts" />
///<reference path="../lib/chai/chai.d.ts" />
///<reference path="scale.ts" />

class Renderer extends Component {
  public CLASS_RENDERER_CONTAINER = "renderer-container";

  public renderArea: D3.Selection;
  public element: D3.Selection;
  public scales: Scale[];

  constructor(
    public dataset: IDataset
  ) {
    super();
    super.rowWeight(1);
    super.colWeight(1);

    this.classed(this.CLASS_RENDERER_CONTAINER, true);
  }

  public zoom(translate, scale) {
    this.renderArea.attr("transform", "translate("+translate+") scale("+scale+")");
  }

  public anchor(element: D3.Selection) {
    super.anchor(element);
    this.boundingBox.classed("renderer-bounding-box", true);
    this.renderArea = element.append("g").classed("render-area", true).classed(this.dataset.seriesName, true);
  }
}

interface IAccessor {
  (d: any): number;
};

class XYRenderer extends Renderer {
  public dataSelection: D3.Selection;
  private static defaultXAccessor = (d: any) => d.x;
  private static defaultYAccessor = (d: any) => d.y;
  public xScale: QuantitiveScale;
  public yScale: QuantitiveScale;
  private xAccessor: IAccessor;
  private yAccessor: IAccessor;
  public xScaledAccessor: (datum: any) => number;
  public yScaledAccessor: (datum: any) => number;
  constructor(dataset: IDataset, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor) {
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

    this.xScale.registerListener(() => this.rescale());
    this.yScale.registerListener(() => this.rescale());
  }

  public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight? :number) {
    super.computeLayout(xOffset, yOffset, availableWidth, availableHeight);
    this.xScale.range([0, this.availableWidth]);
    this.yScale.range([this.availableHeight, 0]);
  }

  public invertXYSelectionArea(area: SelectionArea) {
    var xMin = this.xScale.invert(area.xMin);
    var xMax = this.xScale.invert(area.xMax);
    var yMin = this.yScale.invert(area.yMin);
    var yMax = this.yScale.invert(area.yMax);
    return {xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax}
  }

  public getSelectionFromArea(area: FullSelectionArea) {

    var dataArea = area.data;
    var inRange = (x: number, a: number, b: number) => {
      return (Math.min(a,b) <= x && x <= Math.max(a,b));
    }
    var filterFunction = (d: any) => {
      var x = this.xAccessor(d);
      var y = this.yAccessor(d);
      // use inRange rather than direct comparison to avoid thinking about scale inversion
      return inRange(x, dataArea.xMin, dataArea.xMax) && inRange(y, dataArea.yMin, dataArea.yMax);;
    }
    var selection = this.dataSelection.filter(filterFunction);
    return selection;
  }

  public rescale() {
    if (this.element != null) {
      this.renderArea.remove();
      this.renderArea = this.element.append("g").classed("render-area", true).classed(this.dataset.seriesName, true);
      this.render();
    }
  }
}


class LineRenderer extends XYRenderer {
  private line: D3.Svg.Line;

  constructor(dataset: IDataset, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor) {
    super(dataset, xScale, yScale, xAccessor, yAccessor);
  }

  public anchor(element: D3.Selection) {
    super.anchor(element);
    this.renderArea = this.renderArea.append("path");
  }

  public render() {
    super.render();
    this.line = d3.svg.line().interpolate("basis").x(this.xScaledAccessor).y(this.yScaledAccessor);
    this.dataSelection = this.renderArea.classed("line", true)
      .classed(this.dataset.seriesName, true)
      .datum(this.dataset.data);
    this.renderArea.attr("d", this.line);
  }
}

class CircleRenderer extends XYRenderer {
  constructor(dataset: IDataset, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor) {
    super(dataset, xScale, yScale, xAccessor, yAccessor);
  }

  public render() {
    super.render();
    this.dataSelection = this.renderArea.selectAll("circle");
    this.dataSelection = this.dataSelection.data(this.dataset.data).enter()
      .append("circle")
      .attr("cx", this.xScaledAccessor)
      .attr("cy", this.yScaledAccessor)
      .attr("r", 3);
  }
}

// class ResizingCircleRenderer extends CircleRenderer {
//   public transform(translate: number[], scale: number) {
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

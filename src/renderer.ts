///<reference path="reference.ts" />

class Renderer extends Component {
  private static CSS_CLASS = "renderer";

  public dataset: IDataset;
  public renderArea: D3.Selection;
  public element: D3.Selection;
  public scales: Scale[];

  constructor(dataset: IDataset = {seriesName: "", data: []}) {
    super();
    super.rowWeight(1);
    super.colWeight(1);
    this.clipPathEnabled = true;

    this.dataset = dataset;
    this.classed(Renderer.CSS_CLASS, true);
  }

  public data(dataset: IDataset): Renderer {
    this.renderArea.classed(this.dataset.seriesName, false);
    this.dataset = dataset;
    this.renderArea.classed(dataset.seriesName, true);
    return this;
  }

  public anchor(element: D3.Selection) {
    super.anchor(element);
    this.renderArea = element.append("g").classed("render-area", true).classed(this.dataset.seriesName, true);
    return this;
  }
}

interface IAccessor {
  (d: any): number;
};

class XYRenderer extends Renderer {
  private static CSS_CLASS = "xy-renderer";
  public dataSelection: D3.UpdateSelection;
  private static defaultXAccessor = (d: any) => d.x;
  private static defaultYAccessor = (d: any) => d.y;
  public xScale: QuantitiveScale;
  public yScale: QuantitiveScale;
  public xAccessor: IAccessor;
  public yAccessor: IAccessor;
  constructor(dataset: IDataset, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor) {
    super(dataset);
    this.classed(XYRenderer.CSS_CLASS);

    this.xAccessor = (xAccessor != null) ? xAccessor : XYRenderer.defaultXAccessor;
    this.yAccessor = (yAccessor != null) ? yAccessor : XYRenderer.defaultYAccessor;

    this.xScale = xScale;
    this.yScale = yScale;

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
    return this;
  }

  public invertXYSelectionArea(pixelArea: SelectionArea): FullSelectionArea {
    var xMin = this.xScale.invert(pixelArea.xMin);
    var xMax = this.xScale.invert(pixelArea.xMax);
    var yMin = this.yScale.invert(pixelArea.yMin);
    var yMax = this.yScale.invert(pixelArea.yMax);
    var dataArea = {xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax};
    return {pixel: pixelArea, data: dataArea};
  }

  public getSelectionFromArea(area: FullSelectionArea) {
    var dataArea = area.data;
    var filterFunction = (d: any) => {
      var x = this.xAccessor(d);
      var y = this.yAccessor(d);
      return Utils.inRange(x, dataArea.xMin, dataArea.xMax) && Utils.inRange(y, dataArea.yMin, dataArea.yMax);
    };
    return this.dataSelection.filter(filterFunction);
  }

  public getDataIndicesFromArea(area: FullSelectionArea) {
    var dataArea = area.data;
    var filterFunction = (d: any) => {
      var x = this.xAccessor(d);
      var y = this.yAccessor(d);
      return Utils.inRange(x, dataArea.xMin, dataArea.xMax) && Utils.inRange(y, dataArea.yMin, dataArea.yMax);
    };
    var results = [];
    this.dataset.data.forEach((d, i) => {
      if (filterFunction(d)) {
        results.push(i);
      }
    });
    return results;
  }

  public rescale() {
    if (this.element != null) {
      this.render();
    }
  }
}


class LineRenderer extends XYRenderer {
  private static CSS_CLASS = "line-renderer";
  private path: D3.Selection;
  private line: D3.Svg.Line;

  constructor(dataset: IDataset, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor) {
    super(dataset, xScale, yScale, xAccessor, yAccessor);
    this.classed(LineRenderer.CSS_CLASS, true);
  }

  public anchor(element: D3.Selection) {
    super.anchor(element);
    this.path = this.renderArea.append("path");
    return this;
  }

  public render() {
    super.render();
    this.line = d3.svg.line()
                      .x((datum: any) => this.xScale.scale(this.xAccessor(datum)))
                      .y((datum: any) => this.yScale.scale(this.yAccessor(datum)));
    this.dataSelection = this.path.classed("line", true)
      .classed(this.dataset.seriesName, true)
      .datum(this.dataset.data);
    this.path.attr("d", this.line);
    return this;
  }
}

class CircleRenderer extends XYRenderer {
  private static CSS_CLASS = "circle-renderer";
  public size: number;
  constructor(dataset: IDataset, xScale: QuantitiveScale, yScale: QuantitiveScale, xAccessor?: IAccessor, yAccessor?: IAccessor, size=3) {
    super(dataset, xScale, yScale, xAccessor, yAccessor);
    this.classed(CircleRenderer.CSS_CLASS, true);
    this.size = size;
  }

  public render() {
    super.render();
    this.dataSelection = this.renderArea.selectAll("circle").data(this.dataset.data);
    this.dataSelection.enter().append("circle");
    this.dataSelection.attr("cx", (datum: any) => this.xScale.scale(this.xAccessor(datum)))
                      .attr("cy", (datum: any) => this.yScale.scale(this.yAccessor(datum)))
                      .attr("r", this.size);
    this.dataSelection.exit().remove();
    return this;
  }
}

class BarRenderer extends XYRenderer {
  private static CSS_CLASS = "bar-renderer";
  private static defaultX2Accessor = (d: any) => d.x2;
  public barPaddingPx = 1;

  public x2Accessor: IAccessor;

  constructor(dataset: IDataset,
              xScale: QuantitiveScale,
              yScale: QuantitiveScale,
              xAccessor?: IAccessor,
              x2Accessor?: IAccessor,
              yAccessor?: IAccessor) {
    super(dataset, xScale, yScale, xAccessor, yAccessor);
    this.classed(BarRenderer.CSS_CLASS, true);

    var yDomain = this.yScale.domain();
    if (!Utils.inRange(0, yDomain[0], yDomain[1])) {
      var newMin = 0;
      var newMax = yDomain[1];
      this.yScale.widenDomain([newMin, newMax]); // TODO: make this handle reversed scales
    }

    this.x2Accessor = (x2Accessor != null) ? x2Accessor : BarRenderer.defaultX2Accessor;

    var x2Extent = d3.extent(dataset.data, this.x2Accessor);
    this.xScale.widenDomain(x2Extent);
  }

  public render() {
    super.render();
    var yRange = this.yScale.range();
    var maxScaledY = Math.max(yRange[0], yRange[1]);

    this.dataSelection = this.renderArea.selectAll("rect").data(this.dataset.data);
    this.dataSelection.enter().append("rect");
    this.dataSelection
          .attr("x", (d: any) => this.xScale.scale(this.xAccessor(d)) + this.barPaddingPx)
          .attr("y", (d: any) => this.yScale.scale(this.yAccessor(d)))
          .attr("width", (d: any) => (this.xScale.scale(this.x2Accessor(d)) - this.xScale.scale(this.xAccessor(d))
                                          - 2 * this.barPaddingPx))
          .attr("height", (d: any) => maxScaledY - this.yScale.scale(this.yAccessor(d)) );
    this.dataSelection.exit().remove();
    return this;
  }
}

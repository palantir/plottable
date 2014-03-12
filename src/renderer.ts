///<reference path="reference.ts" />

module Plottable {
  export class Renderer extends Component {
    private static CSS_CLASS = "renderer";

    public dataArray: any[];
    public metadata: IMetadata;
    public renderArea: D3.Selection;
    public element: D3.Selection;
    public scales: Scale[];

    /**
     * Creates a Renderer.
     *
     * @constructor
     * @param {IDataset} [dataset] The dataset associated with the Renderer.
     */
    constructor(dataset: IDataset = {metadata: {}, data: []}) {
      super();
      this.clipPathEnabled = true;
      this.fixedWidthVal = false;
      this.fixedHeightVal = false;
      this.classed(Renderer.CSS_CLASS, true);
      this.data(dataset);
    }

    /**
     * Sets a new dataset on the Renderer.
     *
     * @param {IDataset} dataset The new dataset to be associated with the Renderer.
     * @returns {Renderer} The calling Renderer.
     */
    public data(dataset: IDataset): Renderer {
      var oldCSSClass = this.metadata != null ? this.metadata.cssClass : null;
      this.classed(oldCSSClass, false);
      this.dataArray = dataset.data;
      this.metadata = dataset.metadata;
      this.classed(this.metadata.cssClass, true);
      return this;
    }

    public anchor(element: D3.Selection) {
      super.anchor(element);
      this.renderArea = this.content.append("g").classed("render-area", true);
      return this;
    }
  }

  export interface IAccessor {
    (d: any): number;
  };

  export class XYRenderer extends Renderer {
    private static CSS_CLASS = "xy-renderer";
    public dataSelection: D3.UpdateSelection;
    private static defaultXAccessor = (d: any) => d.x;
    private static defaultYAccessor = (d: any) => d.y;
    public xScale: QuantitiveScale;
    public yScale: QuantitiveScale;
    public xAccessor: IAccessor;
    public yAccessor: IAccessor;

    /**
     * Creates an XYRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {QuantitiveScale} xScale The x scale to use.
     * @param {QuantitiveScale} yScale The y scale to use.
     * @param {IAccessor} [xAccessor] A function for extracting x values from the data.
     * @param {IAccessor} [yAccessor] A function for extracting y values from the data.
     */
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

    /**
     * Converts a SelectionArea with pixel ranges to one with data ranges.
     *
     * @param {SelectionArea} pixelArea The selected area, in pixels.
     * @returns {SelectionArea} The corresponding selected area in the domains of the scales.
     */
    public invertXYSelectionArea(pixelArea: SelectionArea): SelectionArea {
      var xMin = this.xScale.invert(pixelArea.xMin);
      var xMax = this.xScale.invert(pixelArea.xMax);
      var yMin = this.yScale.invert(pixelArea.yMin);
      var yMax = this.yScale.invert(pixelArea.yMax);
      var dataArea = {xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax};
      return dataArea;
    }

    /**
     * Gets the data in a selected area.
     *
     * @param {SelectionArea} dataArea The selected area.
     * @returns {D3.UpdateSelection} The data in the selected area.
     */
    public getSelectionFromArea(dataArea: SelectionArea) {
      var filterFunction = (d: any) => {
        var x = this.xAccessor(d);
        var y = this.yAccessor(d);
        return Utils.inRange(x, dataArea.xMin, dataArea.xMax) && Utils.inRange(y, dataArea.yMin, dataArea.yMax);
      };
      return this.dataSelection.filter(filterFunction);
    }

    /**
     * Gets the indices of data in a selected area
     *
     * @param {SelectionArea} dataArea The selected area.
     * @returns {number[]} An array of the indices of datapoints in the selected area.
     */
    public getDataIndicesFromArea(dataArea: SelectionArea): number[] {
      var filterFunction = (d: any) => {
        var x = this.xAccessor(d);
        var y = this.yAccessor(d);
        return Utils.inRange(x, dataArea.xMin, dataArea.xMax) && Utils.inRange(y, dataArea.yMin, dataArea.yMax);
      };
      var results: number[] = [];
      this.dataArray.forEach((d, i) => {
        if (filterFunction(d)) {
          results.push(i);
        }
      });
      return results;
    }

    private rescale() {
      if (this.element != null) {
        this.render();
      }
    }
  }

  export class LineRenderer extends XYRenderer {
    private static CSS_CLASS = "line-renderer";
    private path: D3.Selection;
    private line: D3.Svg.Line;

    /**
     * Creates a LineRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {QuantitiveScale} xScale The x scale to use.
     * @param {QuantitiveScale} yScale The y scale to use.
     * @param {IAccessor} [xAccessor] A function for extracting x values from the data.
     * @param {IAccessor} [yAccessor] A function for extracting y values from the data.
     */
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
        .datum(this.dataArray);
      this.path.attr("d", this.line);
      return this;
    }
  }

  export class CircleRenderer extends XYRenderer {
    private static CSS_CLASS = "circle-renderer";
    public size: number;

    /**
     * Creates a CircleRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {QuantitiveScale} xScale The x scale to use.
     * @param {QuantitiveScale} yScale The y scale to use.
     * @param {IAccessor} [xAccessor] A function for extracting x values from the data.
     * @param {IAccessor} [yAccessor] A function for extracting y values from the data.
     * @param {number} [size] The radius of the circles, in pixels.
     */
    constructor(dataset: IDataset, xScale: QuantitiveScale, yScale: QuantitiveScale,
                xAccessor?: IAccessor, yAccessor?: IAccessor, size=3) {
      super(dataset, xScale, yScale, xAccessor, yAccessor);
      this.classed(CircleRenderer.CSS_CLASS, true);
      this.size = size;
    }

    public render() {
      super.render();
      this.dataSelection = this.renderArea.selectAll("circle").data(this.dataArray);
      this.dataSelection.enter().append("circle");
      this.dataSelection.attr("cx", (datum: any) => this.xScale.scale(this.xAccessor(datum)))
                        .attr("cy", (datum: any) => this.yScale.scale(this.yAccessor(datum)))
                        .attr("r", this.size);
      this.dataSelection.exit().remove();
      return this;
    }
  }

  export class BarRenderer extends XYRenderer {
    private static CSS_CLASS = "bar-renderer";
    private static defaultDxAccessor = (d: any) => d.dx;
    public barPaddingPx = 1;

    public dxAccessor: IAccessor;

    /**
     * Creates a BarRenderer.
     *
     * @constructor
     * @param {IDataset} dataset The dataset to render.
     * @param {QuantitiveScale} xScale The x scale to use.
     * @param {QuantitiveScale} yScale The y scale to use.
     * @param {IAccessor} [xAccessor] A function for extracting the start position of each bar from the data.
     * @param {IAccessor} [dxAccessor] A function for extracting the width of each bar from the data.
     * @param {IAccessor} [yAccessor] A function for extracting height of each bar from the data.
     */
    constructor(dataset: IDataset,
                xScale: QuantitiveScale,
                yScale: QuantitiveScale,
                xAccessor?: IAccessor,
                dxAccessor?: IAccessor,
                yAccessor?: IAccessor) {
      super(dataset, xScale, yScale, xAccessor, yAccessor);
      this.classed(BarRenderer.CSS_CLASS, true);

      var yDomain = this.yScale.domain();
      if (!Utils.inRange(0, yDomain[0], yDomain[1])) {
        var newMin = 0;
        var newMax = yDomain[1];
        this.yScale.widenDomain([newMin, newMax]); // TODO: make this handle reversed scales
      }

      this.dxAccessor = (dxAccessor != null) ? dxAccessor : BarRenderer.defaultDxAccessor;

      var x2Extent = d3.extent(dataset.data, (d: any) => this.xAccessor(d) + this.dxAccessor(d));
      this.xScale.widenDomain(x2Extent);
    }

    public render() {
      super.render();
      var yRange = this.yScale.range();
      var maxScaledY = Math.max(yRange[0], yRange[1]);

      this.dataSelection = this.renderArea.selectAll("rect").data(this.dataArray);
      var xdr = this.xScale.domain()[1] - this.xScale.domain()[0];
      var xrr = this.xScale.range()[1] - this.xScale.range()[0];
      this.dataSelection.enter().append("rect");
      this.dataSelection
            .attr("x", (d: any) => this.xScale.scale(this.xAccessor(d)) + this.barPaddingPx)
            .attr("y", (d: any) => this.yScale.scale(this.yAccessor(d)))
            .attr("width", (d: any) => this.xScale.scale(this.dxAccessor(d)) - this.xScale.scale(0) - 2 * this.barPaddingPx)
            .attr("height", (d: any) => maxScaledY - this.yScale.scale(this.yAccessor(d)) );
      this.dataSelection.exit().remove();
      return this;
    }
  }
}

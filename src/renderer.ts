///<reference path="reference.ts" />

module Plottable {
  export class Renderer extends Component {
    public _data: any[];
    public _metadata: IMetadata;
    public renderArea: D3.Selection;
    public element: D3.Selection;
    public scales: Scale[];
    public _colorAccessor: IAccessor;
    private static defaultColorAccessor = (d: any) => "steelblue";

    public _rerenderUpdateSelection = false;
    // A perf-efficient manner of rendering would be to calculate attributes only
    // on new nodes, and assume that old nodes (ie the update selection) can
    // maintain their current attributes. If we change the metadata or an
    // accessor function, then this property will not be true, and we will need
    // to recompute attributes on the entire update selection.

    public _requireRerender = false;
    // A perf-efficient approach to rendering scale changes would be to transform
    // the container rather than re-render. In the event that the data is changed,
    // it will be necessary to do a regular rerender.

    /**
     * Creates a Renderer.
     *
     * @constructor
     * @param {IDataset} [dataset] The dataset associated with the Renderer.
     */
    constructor(dataset?: IDataset) {
      super();
      this.clipPathEnabled = true;
      this.fixedWidthVal = false;
      this.fixedHeightVal = false;
      this.classed("renderer", true);
      if (dataset != null) {
        this.dataset(dataset);
      }
      this.colorAccessor(Renderer.defaultColorAccessor);
    }

    /**
     * Sets a new dataset on the Renderer.
     *
     * @param {IDataset} dataset The new dataset to be associated with the Renderer.
     * @returns {Renderer} The calling Renderer.
     */
    public dataset(dataset: IDataset) {
      this.data(dataset.data);
      this.metadata(dataset.metadata);
      return this;
    }

    public metadata(metadata: IMetadata) {
      var oldCSSClass = this._metadata != null ? this._metadata.cssClass : null;
      this.classed(oldCSSClass, false);
      this._metadata = metadata;
      this.classed(this._metadata.cssClass, true);
      this._forceRerender();
      return this;
    }

    public data(data: any[]) {
      this._data = data;
      this._requireRerender = true;
      return this;
    }

    public render(): Renderer {
      this._paint();
      this._requireRerender = false;
      this._rerenderUpdateSelection = false;
      return this;
    }

    public colorAccessor(a: IAccessor): Renderer {
      this._colorAccessor = a;
      this._forceRerender();
      return this;
    }

    public _forceRerender() {
      this._requireRerender = true;
      this._rerenderUpdateSelection = true;
    }

    public _paint() {
      // no-op
    }

    public anchor(element: D3.Selection) {
      super.anchor(element);
      this.renderArea = this.content.append("g").classed("render-area", true);
      return this;
    }
  }

  export class XYRenderer extends Renderer {
    public dataSelection: D3.UpdateSelection;
    private static defaultXAccessor = (d: any) => d.x;
    private static defaultYAccessor = (d: any) => d.y;
    public _xScale: QuantitiveScale;
    public _yScale: QuantitiveScale;
    public _xAccessor: IAccessor;
    public _yAccessor: IAccessor;

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
    constructor() {
      super();
      this.classed("xy-renderer");

      this.xAccessor(XYRenderer.defaultXAccessor);
      this.yAccessor(XYRenderer.defaultYAccessor);

      this.xScale(new LinearScale());
      this.yScale(new LinearScale());
    }

    public dataset(dataset: IDataset) {
      super.dataset(dataset);
      return this;
    }

    public metadata(metadata: IMetadata) {
      super.metadata(metadata);
      return this;
    }

    public data(data: any[]) {
      super.data(data);
      return this;
    }

    public autorangeData() {
      // HACKHACK - null being used as index arg, inappropriate
      var appliedXAccessor = (d: any) => this._xAccessor(d, null, this._metadata);
      var xDomain = d3.extent(this._data, appliedXAccessor);
      this._xScale.widenDomain(xDomain);

      var appliedYAccessor = (d: any) => this._yAccessor(d, null, this._metadata);
      var yDomain = d3.extent(this._data, appliedYAccessor);
      this._yScale.widenDomain(yDomain);
      return this;
    }

    public xScale(): QuantitiveScale;
    public xScale(newScale: QuantitiveScale): XYRenderer;
    public xScale(newScale?: QuantitiveScale): any {
      if (newScale != null) {
        this._xScale = newScale;
        this._xScale.registerListener(() => this.rescale());
        this._forceRerender();
        return this;
      } else {
        return this._xScale;
      }
    }

    public yScale(): QuantitiveScale;
    public yScale(newScale: QuantitiveScale): XYRenderer;
    public yScale(newScale?: QuantitiveScale): any {
      if (newScale != null) {
        this._yScale = newScale;
        this._yScale.registerListener(() => this.rescale());
        this._forceRerender();
        return this;
      } else {
        return this._yScale;
      }
    }

    public xAccessor(a: IAccessor): XYRenderer {
      this._xAccessor = a;
      this._forceRerender();
      return this;
    }

    public yAccessor(a: IAccessor): XYRenderer {
      this._yAccessor = a;
      this._forceRerender();
      return this;
    }

    public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight? :number) {
      super.computeLayout(xOffset, yOffset, availableWidth, availableHeight);
      this._xScale.range([0, this.availableWidth]);
      this._yScale.range([this.availableHeight, 0]);
      return this;
    }

    /**
     * Converts a SelectionArea with pixel ranges to one with data ranges.
     *
     * @param {SelectionArea} pixelArea The selected area, in pixels.
     * @returns {SelectionArea} The corresponding selected area in the domains of the scales.
     */
    public invertXYSelectionArea(pixelArea: SelectionArea): SelectionArea {
      var xMin = this._xScale.invert(pixelArea.xMin);
      var xMax = this._xScale.invert(pixelArea.xMax);
      var yMin = this._yScale.invert(pixelArea.yMin);
      var yMax = this._yScale.invert(pixelArea.yMax);
      var dataArea = {xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax};
      return dataArea;
    }

    private getDataFilterFunction(dataArea: SelectionArea): (d: any, i: number) => boolean {
      var filterFunction = (d: any, i: number) => {
        var x = this._xAccessor(d, i, this._metadata);
        var y = this._yAccessor(d, i, this._metadata);
        return Utils.inRange(x, dataArea.xMin, dataArea.xMax) && Utils.inRange(y, dataArea.yMin, dataArea.yMax);
      };
      return filterFunction;
    }

    /**
     * Gets the data in a selected area.
     *
     * @param {SelectionArea} dataArea The selected area.
     * @returns {D3.UpdateSelection} The data in the selected area.
     */
    public getSelectionFromArea(dataArea: SelectionArea) {
      var filterFunction = this.getDataFilterFunction(dataArea);
      return this.dataSelection.filter(filterFunction);
    }

    /**
     * Gets the indices of data in a selected area
     *
     * @param {SelectionArea} dataArea The selected area.
     * @returns {number[]} An array of the indices of datapoints in the selected area.
     */
    public getDataIndicesFromArea(dataArea: SelectionArea): number[] {
      var filterFunction = this.getDataFilterFunction(dataArea);
      var results: number[] = [];
      this._data.forEach((d, i) => {
        if (filterFunction(d, i)) {
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
    constructor() {
      super();
      this.classed("line-renderer", true);
    }

    public anchor(element: D3.Selection) {
      super.anchor(element);
      this.path = this.renderArea.append("path");
      return this;
    }

    public _paint() {
      super._paint();
      this.line = d3.svg.line()
            .x((d: any, i: number) => this._xScale.scale(this._xAccessor(d, i, this._metadata)))
            .y((d: any, i: number) => this._yScale.scale(this._yAccessor(d, i, this._metadata)));
      this.dataSelection = this.path.classed("line", true)
        .datum(this._data);
      this.path.attr("d", this.line);
      // Since we can only set one stroke for the full line, call colorAccessor on first datum with index 0
      this.path.attr("stroke", this._colorAccessor(this._data[0], 0, this._metadata));
    }
  }

  export class CircleRenderer extends XYRenderer {
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
    constructor(size=3) {
      super();
      this.classed("circle-renderer", true);
      this.size = size;
    }

    public _paint() {
      super._paint();
      this.dataSelection = this.renderArea.selectAll("circle").data(this._data);
      this.dataSelection.enter().append("circle");
      this.dataSelection.attr("cx", (d: any, i: number) => this._xScale.scale(this._xAccessor(d, i, this._metadata)))
                        .attr("cy", (d: any, i: number) => this._yScale.scale(this._yAccessor(d, i, this._metadata)))
                        .attr("r", this.size)
                        .attr("fill", (d: any, i: number) => this._colorAccessor(d, i, this._metadata));
      this.dataSelection.exit().remove();
    }
  }

  export class BarRenderer extends XYRenderer {
    private static defaultDxAccessor = (d: any) => d.dx;
    public barPaddingPx = 1;

    public _dxAccessor: IAccessor;

    /**
     * Creates a BarRenderer.
     *
     * @constructor
     */
    constructor() {
      super();
      this.classed("bar-renderer", true);
      this.dxAccessor(BarRenderer.defaultDxAccessor);
    }

    public autorangeData(): BarRenderer {
      super.autorangeData();
      var yDomain = this._yScale.domain();
      if (!Utils.inRange(0, yDomain[0], yDomain[1])) {
        var newMin = 0;
        var newMax = yDomain[1];
        this._yScale.widenDomain([newMin, newMax]); // TODO: make this handle reversed scales
      }
      var x2Accessor = (d: any) => this._xAccessor(d, null, this._metadata) + this._dxAccessor(d, null, this._metadata);
      var x2Extent = d3.extent(this._data, x2Accessor);
      this._xScale.widenDomain(x2Extent);
      return this;
    }

    public dxAccessor(a: IAccessor): BarRenderer {
      this._dxAccessor = a;
      this._forceRerender();
      return this;
    }

    public _paint() {
      super._paint();
      var yRange = this._yScale.range();
      var maxScaledY = Math.max(yRange[0], yRange[1]);

      this.dataSelection = this.renderArea.selectAll("rect").data(this._data);
      var xdr = this._xScale.domain()[1] - this._xScale.domain()[0];
      var xrr = this._xScale.range()[1]  - this._xScale.range()[0];
      this.dataSelection.enter().append("rect");

      var xFunction = (d: any, i: number) => {
        var x = this._xAccessor(d, i, this._metadata);
        var scaledX = this._xScale.scale(x);
        return scaledX + this.barPaddingPx;
      };

      var yFunction = (d: any, i: number) => {
        var y = this._yAccessor(d, i, this._metadata);
        var scaledY = this._yScale.scale(y);
        return scaledY;
      };

      var widthFunction = (d: any, i: number) => {
        var dx = this._dxAccessor(d, i, this._metadata);
        var scaledDx = this._xScale.scale(dx);
        var scaledOffset = this._xScale.scale(0);
        return scaledDx - scaledOffset - 2 * this.barPaddingPx;
      };

      var heightFunction = (d: any, i: number) => {
        var y = this._yAccessor(d, i, this._metadata);
        var scaledY = this._yScale.scale(y);
        return maxScaledY - scaledY;
      };

      var colorFunction = (d: any, i: number) => {
        return this._colorAccessor(d, i, this._metadata);
      };

      this.dataSelection
            .attr("x", xFunction)
            .attr("y", yFunction)
            .attr("width", widthFunction)
            .attr("height", heightFunction)
            .attr("fill", colorFunction);
      this.dataSelection.exit().remove();
    }
  }
}

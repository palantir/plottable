///<reference path="../reference.ts" />

module Plottable {
export module Plots {
  export class Rectangle<X, Y> extends XYPlot<X, Y> {
    private static _X2_KEY = "x2";
    private static _Y2_KEY = "y2";
    private _labelsEnabled = false;
    private _label: Accessor<string> = null;

    /**
     * A Rectangle Plot displays rectangles based on the data.
     * The left and right edges of each rectangle can be set with x() and x2().
     *   If only x() is set the Rectangle Plot will attempt to compute the correct left and right edge positions.
     * The top and bottom edges of each rectangle can be set with y() and y2().
     *   If only y() is set the Rectangle Plot will attempt to compute the correct top and bottom edge positions.
     *
     * @constructor
     * @param {Scale.Scale} xScale
     * @param {Scale.Scale} yScale
     */
    constructor() {
      super();

      this.animator("rectangles", new Animators.Null());
      this.addClass("rectangle-plot");
    }

    protected _createDrawer(dataset: Dataset) {
      return new Drawers.Rectangle(dataset);
    }

    protected _generateAttrToProjector() {
      let attrToProjector = super._generateAttrToProjector();

      // Copy each of the different projectors.
      let xAttr = Plot._scaledAccessor(this.x());
      let x2Attr = attrToProjector[Rectangle._X2_KEY];
      let yAttr = Plot._scaledAccessor(this.y());
      let y2Attr = attrToProjector[Rectangle._Y2_KEY];

      let xScale = this.x().scale;
      let yScale = this.y().scale;

      if (x2Attr != null) {
        attrToProjector["width"] = (d, i, dataset) => Math.abs(x2Attr(d, i, dataset) - xAttr(d, i, dataset));
        attrToProjector["x"] = (d, i, dataset) => Math.min(x2Attr(d, i, dataset), xAttr(d, i, dataset));
      } else {
        attrToProjector["width"] = (d, i, dataset) => this._rectangleWidth(xScale);
        attrToProjector["x"] = (d, i, dataset) => xAttr(d, i, dataset) - 0.5 * attrToProjector["width"](d, i, dataset);
      }

      if (y2Attr != null) {
        attrToProjector["height"] = (d, i, dataset) => Math.abs(y2Attr(d, i, dataset) - yAttr(d, i, dataset));
        attrToProjector["y"] = (d, i, dataset) => {
	        return Math.max(y2Attr(d, i, dataset), yAttr(d, i, dataset)) - attrToProjector["height"](d, i, dataset);
        };
      } else {
        attrToProjector["height"] = (d, i, dataset) => this._rectangleWidth(yScale);
        attrToProjector["y"] = (d, i, dataset) => yAttr(d, i, dataset) - 0.5 * attrToProjector["height"](d, i, dataset);
      }

      // Clean up the attributes projected onto the SVG elements
      delete attrToProjector[Rectangle._X2_KEY];
      delete attrToProjector[Rectangle._Y2_KEY];

      return attrToProjector;
    }

    protected _generateDrawSteps(): Drawers.DrawStep[] {
      return [{attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator("rectangles")}];
    }

    protected _updateExtentsForProperty(property: string) {
      super._updateExtentsForProperty(property);
      if (property === "x") {
        super._updateExtentsForProperty("x2");
      } else if (property === "y") {
        super._updateExtentsForProperty("y2");
      }
    }

    protected _filterForProperty(property: string) {
      if (property === "x2") {
        return super._filterForProperty("x");
      } else if (property === "y2") {
        return super._filterForProperty("y");
      }
      return super._filterForProperty(property);
    }

    /**
     * Gets the AccessorScaleBinding for X.
     */
    public x(): AccessorScaleBinding<X, number>;
    /**
     * Sets X to a constant number or the result of an Accessor<number>.
     *
     * @param {number|Accessor<number>} x
     * @returns {Plots.Rectangle} The calling Rectangle Plot.
     */
    public x(x: number | Accessor<number>): Plots.Rectangle<X, Y>;
    /**
     * Sets X to a scaled constant value or scaled result of an Accessor.
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {X|Accessor<X>} x
     * @param {Scale<X, number>} xScale
     * @returns {Plots.Rectangle} The calling Rectangle Plot.
     */
    public x(x: X | Accessor<X>, xScale: Scale<X, number>): Plots.Rectangle<X, Y>;
    public x(x?: number | Accessor<number> | X | Accessor<X>, xScale?: Scale<X, number>): any {
      if (x == null) {
        return super.x();
      }

      if (xScale == null) {
        super.x(<number | Accessor<number>>x);
      } else {
        super.x(<X | Accessor<X>>x, xScale);
      }

      if (xScale != null) {
        let x2Binding = this.x2();
        let x2 = x2Binding && x2Binding.accessor;
        if (x2 != null) {
          this._bindProperty(Rectangle._X2_KEY, x2, xScale);
        }
      }

      // The x and y scales should render in bands with no padding for category scales
      if (xScale instanceof Scales.Category) {
        (<Scales.Category> <any> xScale).innerPadding(0).outerPadding(0);
      }

      return this;
    }

    /**
     * Gets the AccessorScaleBinding for X2.
     */
    public x2(): AccessorScaleBinding<X, number>;
    /**
     * Sets X2 to a constant number or the result of an Accessor.
     * If a Scale has been set for X, it will also be used to scale X2.
     *
     * @param {number|Accessor<number>|X|Accessor<X>} x2
     * @returns {Plots.Rectangle} The calling Rectangle Plot.
     */
    public x2(x2: number | Accessor<number> | X | Accessor<X>): Plots.Rectangle<X, Y>;
    public x2(x2?: number | Accessor<number> | X | Accessor<X>): any {
      if (x2 == null) {
        return this._propertyBindings.get(Rectangle._X2_KEY);
      }

      let xBinding = this.x();
      let xScale = xBinding && xBinding.scale;
      this._bindProperty(Rectangle._X2_KEY, x2, xScale);

      this.render();
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for Y.
     */
    public y(): AccessorScaleBinding<Y, number>;
    /**
     * Sets Y to a constant number or the result of an Accessor<number>.
     *
     * @param {number|Accessor<number>} y
     * @returns {Plots.Rectangle} The calling Rectangle Plot.
     */
    public y(y: number | Accessor<number>): Plots.Rectangle<X, Y>;
    /**
     * Sets Y to a scaled constant value or scaled result of an Accessor.
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {Y|Accessor<Y>} y
     * @param {Scale<Y, number>} yScale
     * @returns {Plots.Rectangle} The calling Rectangle Plot.
     */
    public y(y: Y | Accessor<Y>, yScale: Scale<Y, number>): Plots.Rectangle<X, Y>;
    public y(y?: number | Accessor<number> | Y | Accessor<Y>, yScale?: Scale<Y, number>): any {
      if (y == null) {
        return super.y();
      }

      if (yScale == null) {
        super.y(<number | Accessor<number>>y);
      } else {
        super.y(<Y | Accessor<Y>>y, yScale);
      }

      if (yScale != null) {
        let y2Binding = this.y2();
        let y2 = y2Binding && y2Binding.accessor;
        if (y2 != null) {
          this._bindProperty(Rectangle._Y2_KEY, y2, yScale);
        }
      }

      // The x and y scales should render in bands with no padding for category scales
      if (yScale instanceof Scales.Category) {
        (<Scales.Category> <any> yScale).innerPadding(0).outerPadding(0);
      }

      return this;
    }

    /**
     * Gets the AccessorScaleBinding for Y2.
     */
    public y2(): AccessorScaleBinding<Y, number>;
    /**
     * Sets Y2 to a constant number or the result of an Accessor.
     * If a Scale has been set for Y, it will also be used to scale Y2.
     *
     * @param {number|Accessor<number>|Y|Accessor<Y>} y2
     * @returns {Plots.Rectangle} The calling Rectangle Plot.
     */
    public y2(y2: number | Accessor<number> | Y | Accessor<Y>): Plots.Rectangle<X, Y>;
    public y2(y2?: number | Accessor<number> | Y | Accessor<Y>): any {
      if (y2 == null) {
        return this._propertyBindings.get(Rectangle._Y2_KEY);
      }

      let yBinding = this.y();
      let yScale = yBinding && yBinding.scale;
      this._bindProperty(Rectangle._Y2_KEY, y2, yScale);

      this.render();
      return this;
    }

    /**
     * Gets the PlotEntities at a particular Point.
     *
     * @param {Point} point The point to query.
     * @returns {PlotEntity[]} The PlotEntities at the particular point
     */
    public entitiesAt(point: Point) {
      let attrToProjector = this._generateAttrToProjector();
      return this.entities().filter((entity) => {
        let datum = entity.datum;
        let index = entity.index;
        let dataset = entity.dataset;
        let x = attrToProjector["x"](datum, index, dataset);
        let y = attrToProjector["y"](datum, index, dataset);
        let width = attrToProjector["width"](datum, index, dataset);
        let height = attrToProjector["height"](datum, index, dataset);
        return x <= point.x && point.x <= x + width && y <= point.y && point.y <= y + height;
      });
    }

    /**
     * Gets the Entities that intersect the Bounds.
     *
     * @param {Bounds} bounds
     * @returns {PlotEntity[]}
     */
    public entitiesIn(bounds: Bounds): PlotEntity[];
    /**
     * Gets the Entities that intersect the area defined by the ranges.
     *
     * @param {Range} xRange
     * @param {Range} yRange
     * @returns {PlotEntity[]}
     */
    public entitiesIn(xRange: Range, yRange: Range): PlotEntity[];
    public entitiesIn(xRangeOrBounds: Range | Bounds, yRange?: Range): PlotEntity[] {
      let dataXRange: Range;
      let dataYRange: Range;
      if (yRange == null) {
        let bounds = (<Bounds> xRangeOrBounds);
        dataXRange = { min: bounds.topLeft.x, max: bounds.bottomRight.x };
        dataYRange = { min: bounds.topLeft.y, max: bounds.bottomRight.y };
      } else {
        dataXRange = (<Range> xRangeOrBounds);
        dataYRange = yRange;
      }
      return this._entitiesIntersecting(dataXRange, dataYRange);
    }

    private _entityBBox(datum: any, index: number, dataset: Plottable.Dataset, attrToProjector: AttributeToProjector): SVGRect {
      return {
        x: attrToProjector["x"](datum, index, dataset),
        y: attrToProjector["y"](datum, index, dataset),
        width: attrToProjector["width"](datum, index, dataset),
        height: attrToProjector["height"](datum, index, dataset)
      };
    }

    private _entitiesIntersecting(xValOrRange: number | Range, yValOrRange: number | Range): PlotEntity[] {
      let intersected: PlotEntity[] = [];
      let attrToProjector = this._generateAttrToProjector();
      this.entities().forEach((entity) => {
        if (Utils.DOM.intersectsBBox(xValOrRange, yValOrRange,
                                     this._entityBBox(entity.datum, entity.index, entity.dataset, attrToProjector))) {
          intersected.push(entity);
        }
      });
      return intersected;
    }

    /**
     * Gets the accessor for labels.
     *
     * @returns {Accessor<string>}
     */
    public label(): Accessor<string>;
    /**
     * Sets the text of labels to the result of an Accessor.
     *
     * @param {Accessor<string>} label
     * @returns {Plots.Rectangle} The calling Rectangle Plot.
     */
    public label(label: Accessor<string>): Plots.Rectangle<X, Y>;
    public label(label?: Accessor<string>): any {
      if (label == null) {
        return this._label;
      }

      this._label = label;
      this.render();
      return this;
    }

    /**
     * Gets whether labels are enabled.
     *
     * @returns {boolean}
     */
    public labelsEnabled(): boolean;
    /**
     * Sets whether labels are enabled.
     * Labels too big to be contained in the rectangle, cut off by edges, or blocked by other rectangles will not be shown.
     *
     * @param {boolean} labelsEnabled
     * @returns {Rectangle} The calling Rectangle Plot.
     */
    public labelsEnabled(enabled: boolean): Plots.Rectangle<X, Y>;
    public labelsEnabled(enabled?: boolean): any {
      if (enabled == null) {
        return this._labelsEnabled;
      } else {
        this._labelsEnabled = enabled;
        this.render();
        return this;
      }
    }

    protected _propertyProjectors(): AttributeToProjector {
      let attrToProjector = super._propertyProjectors();
      if (this.x2() != null) {
        attrToProjector["x2"] = Plot._scaledAccessor(this.x2());
      }
      if (this.y2() != null) {
        attrToProjector["y2"] = Plot._scaledAccessor(this.y2());
      }
      return attrToProjector;
    }

    protected _pixelPoint(datum: any, index: number, dataset: Dataset) {
      let attrToProjector = this._generateAttrToProjector();
      let rectX = attrToProjector["x"](datum, index, dataset);
      let rectY = attrToProjector["y"](datum, index, dataset);
      let rectWidth = attrToProjector["width"](datum, index, dataset);
      let rectHeight = attrToProjector["height"](datum, index, dataset);
      let x = rectX + rectWidth / 2;
      let y = rectY + rectHeight / 2;
      return { x: x, y: y };
    }

    private _rectangleWidth(scale: Scale<any, number>) {
      if (scale instanceof Plottable.Scales.Category) {
        return (<Plottable.Scales.Category> scale).rangeBand();
      } else {
        let accessor = scale === this.x().scale ? this.x().accessor : this.y().accessor;
        let accessorData = d3.set(Utils.Array.flatten(this.datasets().map((dataset) => {
          return dataset.data().map((d, i) => accessor(d, i, dataset).valueOf());
        }))).values().map((value) => +value);
        // Get the absolute difference between min and max
        let min = Plottable.Utils.Math.min(accessorData, 0);
        let max = Plottable.Utils.Math.max(accessorData, 0);
        let scaledMin = scale.scale(min);
        let scaledMax = scale.scale(max);
        return (scaledMax - scaledMin) / Math.abs(max - min);
      }
    }

    protected _getDataToDraw() {
      let dataToDraw = new Utils.Map<Dataset, any[]>();
      let attrToProjector = this._generateAttrToProjector();
      this.datasets().forEach((dataset) => {
        let data = dataset.data().filter((d, i) => Utils.Math.isValidNumber(attrToProjector["x"](d, i, dataset)) &&
                                                   Utils.Math.isValidNumber(attrToProjector["y"](d, i, dataset)) &&
                                                   Utils.Math.isValidNumber(attrToProjector["width"](d, i, dataset)) &&
                                                   Utils.Math.isValidNumber(attrToProjector["height"](d, i, dataset)));
        dataToDraw.set(dataset, data);
      });
      return dataToDraw;
    }

    protected _additionalPaint(time: number) {
      this._renderArea.selectAll(".label-area").remove();
      if (this._labelsEnabled && this.label() != null) {
        Utils.Window.setTimeout(() => this._drawLabels(), time);
      }
    }

    private _drawLabels() {
      let dataToDraw = this._getDataToDraw();
      this.datasets().forEach((dataset, i) => this._drawLabel(dataToDraw, dataset, i));
    }

    private _drawLabel(dataToDraw: Utils.Map<Dataset, any[]>, dataset: Dataset, datasetIndex: number) {
      let attrToProjector = this._generateAttrToProjector();
      let labelArea = this._renderArea.append("g").classed("label-area", true);
      let measurer = new SVGTypewriter.Measurers.Measurer(labelArea);
      let writer = new SVGTypewriter.Writers.Writer(measurer);
      let xRange = this.x().scale.range();
      let yRange = this.y().scale.range();
      let xMin = Math.min.apply(null, xRange);
      let xMax = Math.max.apply(null, xRange);
      let yMin = Math.min.apply(null, yRange);
      let yMax = Math.max.apply(null, yRange);
      let data = dataToDraw.get(dataset);
      data.forEach((datum, datumIndex) => {
        let label = "" + this.label()(datum, datumIndex, dataset);
        let measurement = measurer.measure(label);

        let x = attrToProjector["x"](datum, datumIndex, dataset);
        let y = attrToProjector["y"](datum, datumIndex, dataset);
        let width = attrToProjector["width"](datum, datumIndex, dataset);
        let height = attrToProjector["height"](datum, datumIndex, dataset);
        if (measurement.height <= height && measurement.width <= width) {

          let horizontalOffset = (width - measurement.width) / 2;
          let verticalOffset = (height - measurement.height) / 2;
          x += horizontalOffset;
          y += verticalOffset;

          let xLabelRange = { min: x, max: x + measurement.width };
          let yLabelRange = { min : y, max: y + measurement.height };
          if (xLabelRange.min < xMin || xLabelRange.max > xMax || yLabelRange.min < yMin || yLabelRange.max > yMax) {
            return;
          }
          if (this._overlayLabel(xLabelRange, yLabelRange, datumIndex, datasetIndex, dataToDraw)) {
            return;
          }

          let color = attrToProjector["fill"] == null ? "black" : attrToProjector["fill"](datum, datumIndex, dataset);
          let dark = Utils.Color.contrast("white", color) * 1.6 < Utils.Color.contrast("black", color);
          let g = labelArea.append("g").attr("transform", "translate(" + x + "," + y + ")");
          let className = dark ? "dark-label" : "light-label";
          g.classed(className, true);

          writer.write(label, measurement.width, measurement.height, {
            selection: g,
            xAlign: "center",
            yAlign: "center",
            textRotation: 0
          });
        }
      });
    }

    private _overlayLabel(labelXRange: Range, labelYRange: Range, datumIndex: number, datasetIndex: number,
                          dataToDraw: Utils.Map<Dataset, any[]>) {
      let attrToProjector = this._generateAttrToProjector();
      let datasets = this.datasets();
      for (let i = datasetIndex; i < datasets.length; i ++ ) {
        let dataset = datasets[i];
        let data = dataToDraw.get(dataset);
        for (let j = (i === datasetIndex ? datumIndex + 1 : 0); j < data.length ; j ++ ) {
          if (Utils.DOM.intersectsBBox(labelXRange, labelYRange, this._entityBBox(data[j], j, dataset, attrToProjector))) {
            return true;
          }
        }
      }
      return false;
    }
  }
}
}

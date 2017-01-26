
  export interface LightweightScatterPlotEntity extends LightweightPlotEntity {
    diameter: Point;
  }

  export class Scatter<X, Y> extends XYPlot<X, Y> {
    private static _SIZE_KEY = "size";
    private static _SYMBOL_KEY = "symbol";

    /**
     * A Scatter Plot draws a symbol at each data point.
     *
     * @constructor
     */
    constructor() {
      super();
      this.addClass("scatter-plot");
      let animator = new Animators.Easing();
      animator.startDelay(5);
      animator.stepDuration(250);
      animator.maxTotalDuration(Plot._ANIMATION_MAX_DURATION);
      this.animator(Plots.Animator.MAIN, animator);
      this.attr("opacity", 0.6);
      this.attr("fill", new Scales.Color().range()[0]);
      this.size(6);
      let circleSymbolFactory = SymbolFactories.circle();
      this.symbol(() => circleSymbolFactory);
    }

    protected _buildLightweightPlotEntities(datasets: Dataset[]) {
        const lightweightPlotEntities = super._buildLightweightPlotEntities(datasets);

        return lightweightPlotEntities.map((lightweightPlotEntity: LightweightScatterPlotEntity) => {
          const diameter = Plot._scaledAccessor(this.size())(
            lightweightPlotEntity.datum,
            lightweightPlotEntity.index,
            lightweightPlotEntity.dataset);

          // convert diameter into data space to be on the same scale as the scatter point position
          lightweightPlotEntity.diameter = this._invertedPixelSize({ x: diameter, y: diameter });
          return lightweightPlotEntity;
        });
    }

    protected _createDrawer(dataset: Dataset) {
      return new Plottable.Drawers.Symbol(dataset);
    }

    /**
     * Gets the AccessorScaleBinding for the size property of the plot.
     * The size property corresponds to the area of the symbol.
     */
    public size<S>(): TransformableAccessorScaleBinding<S, number>;
    /**
     * Sets the size property to a constant number or the result of an Accessor<number>.
     *
     * @param {number|Accessor<number>} size
     * @returns {Plots.Scatter} The calling Scatter Plot.
     */
    public size(size: number | Accessor<number>): this;
    /**
     * Sets the size property to a scaled constant value or scaled result of an Accessor.
     * The provided Scale will account for the values when autoDomain()-ing.
     *
     * @param {S|Accessor<S>} sectorValue
     * @param {Scale<S, number>} scale
     * @returns {Plots.Scatter} The calling Scatter Plot.
     */
    public size<S>(size: S | Accessor<S>, scale: Scale<S, number>): this;
    public size<S>(size?: number | Accessor<number> | S | Accessor<S>, scale?: Scale<S, number>): any {
      if (size == null) {
        return this._propertyBindings.get(Scatter._SIZE_KEY);
      }
      this._bindProperty(Scatter._SIZE_KEY, size, scale);
      this.render();
      return this;
    }

    /**
     * Gets the AccessorScaleBinding for the symbol property of the plot.
     * The symbol property corresponds to how the symbol will be drawn.
     */
    public symbol(): AccessorScaleBinding<any, any>;
    /**
     * Sets the symbol property to an Accessor<SymbolFactory>.
     *
     * @param {Accessor<SymbolFactory>} symbol
     * @returns {Plots.Scatter} The calling Scatter Plot.
     */
    public symbol(symbol: Accessor<SymbolFactory>): this;
    public symbol(symbol?: Accessor<SymbolFactory>): any {
      if (symbol == null) {
        return this._propertyBindings.get(Scatter._SYMBOL_KEY);
      }
      this._propertyBindings.set(Scatter._SYMBOL_KEY, { accessor: symbol });
      this.render();
      return this;
    }

    protected _generateDrawSteps(): Drawers.DrawStep[] {
      let drawSteps: Drawers.DrawStep[] = [];
      if (this._animateOnNextRender()) {
        let resetAttrToProjector = this._generateAttrToProjector();

        let symbolProjector = Plot._scaledAccessor(this.symbol());
        resetAttrToProjector["d"] = (datum: any, index: number, dataset: Dataset) => symbolProjector(datum, index, dataset)(0);
        drawSteps.push({attrToProjector: resetAttrToProjector, animator: this._getAnimator(Plots.Animator.RESET)});
      }

      drawSteps.push({attrToProjector: this._generateAttrToProjector(), animator: this._getAnimator(Plots.Animator.MAIN)});
      return drawSteps;
    }

    protected _entityVisibleOnPlot(entity: LightweightScatterPlotEntity, bounds: Bounds) {
      const xRange = { min: bounds.topLeft.x, max: bounds.bottomRight.x };
      const yRange = { min: bounds.topLeft.y, max: bounds.bottomRight.y };

      const translatedBbox = {
        x: entity.position.x - entity.diameter.x,
        y: entity.position.y - entity.diameter.y,
        width: entity.diameter.x,
        height: entity.diameter.y,
      };

      return Utils.DOM.intersectsBBox(xRange, yRange, translatedBbox);
    }

    protected _propertyProjectors(): AttributeToProjector {
      let propertyToProjectors = super._propertyProjectors();

      let xProjector = Plot._scaledAccessor(this.x());
      let yProjector = Plot._scaledAccessor(this.y());

      let sizeProjector = Plot._scaledAccessor(this.size());

      propertyToProjectors["transform"] = (datum: any, index: number, dataset: Dataset) =>
        "translate(" + xProjector(datum, index, dataset) + "," + yProjector(datum, index, dataset) + ")";

      let symbolProjector = Plot._scaledAccessor(this.symbol());

      propertyToProjectors["d"] = (datum: any, index: number, dataset: Dataset) =>
        symbolProjector(datum, index, dataset)(sizeProjector(datum, index, dataset));
      return propertyToProjectors;
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
      let xProjector = Plot._scaledAccessor(this.x());
      let yProjector = Plot._scaledAccessor(this.y());
      return this.entities().filter((entity) => {
        let datum = entity.datum;
        let index = entity.index;
        let dataset = entity.dataset;
        let x = xProjector(datum, index, dataset);
        let y = yProjector(datum, index, dataset);
        return dataXRange.min <= x && x <= dataXRange.max && dataYRange.min <= y && y <= dataYRange.max;
      });
    }

    /**
     * Gets the Entities at a particular Point.
     *
     * @param {Point} p
     * @returns {PlotEntity[]}
     */
    public entitiesAt(p: Point) {
      let xProjector = Plot._scaledAccessor(this.x());
      let yProjector = Plot._scaledAccessor(this.y());
      let sizeProjector = Plot._scaledAccessor(this.size());
      return this.entities().filter((entity) => {
        let datum = entity.datum;
        let index = entity.index;
        let dataset = entity.dataset;
        let x = xProjector(datum, index, dataset);
        let y = yProjector(datum, index, dataset);
        let size = sizeProjector(datum, index, dataset);
        return x - size / 2  <= p.x && p.x <= x + size / 2 && y - size / 2 <= p.y && p.y <= y + size / 2;
      });
    }

    /**
     * _invertedPixelSize returns the size of the object in data space
     * @param {Point} [point] The size of the object in pixel space. X corresponds to
     * the width of the object, and Y corresponds to the height of the object
     * @return {Point} Returns the size of the object in data space. X corresponds to
     * the width of the object in data space, and Y corresponds to the height of the
     * object in data space.
     */
    private _invertedPixelSize(point: Point) {
      const invertedOrigin = this._invertPixelPoint(this.origin());
      const invertedSize = this._invertPixelPoint({ x: point.x, y: point.y });

      return {
        x: Math.abs(invertedSize.x - invertedOrigin.x),
        y: Math.abs(invertedSize.y - invertedOrigin.y)
      };
    }
  }

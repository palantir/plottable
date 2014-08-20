///<reference path="../reference.ts" />

module Plottable {
export module Abstract {
  export class Plot extends Component {
    public _dataSource: DataSource;
    public _dataChanged = false;

    public _renderArea: D3.Selection;
    public _animate: boolean = false;
    public _animators: IPlotAnimatorMap = {};
    public _ANIMATION_DURATION = 250; // milliseconds
    public _projectors: { [attrToSet: string]: _IProjector; } = {};
    private animateOnNextRender = true;

    /**
     * Creates a Plot.
     *
     * Plots render data. Common example include Plot.Scatter, Plot.Bar, and Plot.Line.
     *
     * A bare Plot has a DataSource and any number of projectors, which take
     * data and "project" it onto the Plot, such as "x", "y", "fill", "r".
     *
     * @constructor
     * @param {any[]|DataSource} [dataset] The data or DataSource to be
     * associated with this Plot.
     */
    constructor();
    constructor(dataset: any[]);
    constructor(dataset: DataSource);
    constructor(dataset?: any) {
      super();
      this.clipPathEnabled = true;
      this.classed("plot", true);

      var dataSource: DataSource;
      if (dataset != null) {
        if (typeof dataset.data === "function") {
          dataSource = <DataSource> dataset;
        } else {
          dataSource = dataSource = new DataSource(dataset);
        }
      } else {
        dataSource = new DataSource();
      }
      this.dataSource(dataSource);
    }

    public _anchor(element: D3.Selection) {
      super._anchor(element);
      this.animateOnNextRender = true;
      this._dataChanged = true;
      this._updateAllProjectors();
    }

    public remove() {
      super.remove();
      this._dataSource.broadcaster.deregisterListener(this);
      // deregister from all scales
      var properties = Object.keys(this._projectors);
      properties.forEach((property) => {
        var projector = this._projectors[property];
        if (projector.scale != null) {
          projector.scale.broadcaster.deregisterListener(this);
        }
      });
    }

    /**
     * Get the Plot's DataSource.
     *
     * @return {DataSource} The current DataSource.
     */
    public dataSource(): DataSource;
    /**
     * Set the Plot's DataSource.
     *
     * @param {DataSource} source The DataSource the Plot should use.
     * @returns {Plot} The calling Plot.
     */
    public dataSource(source: DataSource): Plot;
    public dataSource(source?: DataSource): any {
      if (source == null) {
        return this._dataSource;
      }
      var oldSource = this._dataSource;
      if (oldSource != null) {
        this._dataSource.broadcaster.deregisterListener(this);
      }
      this._dataSource = source;
      this._dataSource.broadcaster.registerListener(this, () => this._onDataSourceUpdate());
      this._onDataSourceUpdate();
      return this;
    }

    public _onDataSourceUpdate() {
      this._updateAllProjectors();
      this.animateOnNextRender = true;
      this._dataChanged = true;
      this._render();
    }

    /**
     * Set an attribute of every data point.
     *
     * Here's a common use case:
     * ```typescript
     * plot.project("r", function(d) { return d.foo; });
     * ```
     * This will set the radius of each datum `d` to be `d.foo`.
     *
     * @param {string} attrToSet The attribute to set across each data
     * point. Popular examples include "x", "y", "r". Scales that inherit from
     * Plot define their meaning.
     *
     * @param {Function|string|any} accessor Function to apply to each element
     * of the dataSource. If a Function, use `accessor(d, i)`. If a string,
     * `d[accessor]` is used. If anything else, use `accessor` as a constant
     * across all data points.
     *
     * @param {Abstract.Scale} [scale] If provided, the result of the accessor
     * is passed through the scale, such as `scale.scale(accessor(d, i))`.
     *
     * @returns {Plot} The calling Plot.
     */
    public project(attrToSet: string, accessor: any, scale?: Abstract.Scale) {
      attrToSet = attrToSet.toLowerCase();
      var currentProjection = this._projectors[attrToSet];
      var existingScale = (currentProjection != null) ? currentProjection.scale : null;

      if (existingScale != null) {
        existingScale._removeExtent(this._plottableID.toString(), attrToSet);
        existingScale.broadcaster.deregisterListener(this);
      }

      if (scale != null) {
        scale.broadcaster.registerListener(this, () => this._render());
      }
      var activatedAccessor = _Util.Methods.applyAccessor(accessor, this);
      this._projectors[attrToSet] = {accessor: activatedAccessor, scale: scale, attribute: attrToSet};
      this._updateProjector(attrToSet);
      this._render(); // queue a re-render upon changing projector
      return this;
    }

    public _generateAttrToProjector(): IAttributeToProjector {
      var h: IAttributeToProjector = {};
      d3.keys(this._projectors).forEach((a) => {
        var projector = this._projectors[a];
        var accessor = projector.accessor;
        var scale = projector.scale;
        var fn = scale == null ? accessor : (d: any, i: number) => scale.scale(accessor(d, i));
        h[a] = fn;
      });
      return h;
    }

    public _doRender() {
      if (this._isAnchored) {
        this._paint();
        this._dataChanged = false;
        this.animateOnNextRender = false;
      }
    }

    public _paint() {
      // no-op
    }

    public _setup() {
      super._setup();
      this._renderArea = this._content.append("g").classed("render-area", true);
    }

    /**
     * Enables or disables animation.
     *
     * @param {boolean} enabled Whether or not to animate.
     */
    public animate(enabled: boolean) {
      this._animate = enabled;
      return this;
    }

    public detach() {
      super.detach();
      // make the domain resize
      this._updateAllProjectors();
      return this;
    }

    /**
     * This function makes sure that all of the scales in this._projectors
     * have an extent that includes all the data that is projected onto them.
     */
    public _updateAllProjectors() {
      d3.keys(this._projectors).forEach((attr: string) => this._updateProjector(attr));
    }

    public _updateProjector(attr: string) {
      var projector = this._projectors[attr];
      if (projector.scale != null) {
        var extent = this.dataSource()._getExtent(projector.accessor);
        if (extent.length === 0 || !this._isAnchored) {
          projector.scale._removeExtent(this._plottableID.toString(), attr);
        } else {
          projector.scale._updateExtent(this._plottableID.toString(), attr, extent);
        }
      }
    }

    /**
     * Apply attributes to the selection.
     *
     * If animation is enabled and a valid animator's key is specified, the
     * attributes are applied with the animator. Otherwise, they are applied
     * immediately to the selection.
     *
     * The animation will not animate during auto-resize renders.
     *
     * @param {D3.Selection} selection The selection of elements to update.
     * @param {string} animatorKey The key for the animator.
     * @param {IAttributeToProjector} attrToProjector The set of attributes to set on the selection.
     * @return {D3.Selection} The resulting selection (potentially after the transition)
     */
    public _applyAnimatedAttributes(selection: any, animatorKey: string, attrToProjector: IAttributeToProjector): any {
      if (this._animate && this.animateOnNextRender && this._animators[animatorKey] != null) {
        return this._animators[animatorKey].animate(selection, attrToProjector, this);
      } else {
        return selection.attr(attrToProjector);
      }
    }

    /**
     * Get the animator associated with the specified Animator key.
     *
     * @return {IPlotAnimator} The Animator for the specified key.
     */
    public animator(animatorKey: string): IPlotAnimator;
    /**
     * Set the animator associated with the specified Animator key.
     *
     * @param {string} animatorKey The key for the Animator.
     * @param {IPlotAnimator} animator An Animator to be assigned to
     * the specified key.
     * @returns {Plot} The calling Plot.
     */
    public animator(animatorKey: string, animator: IPlotAnimator): Plot;
    public animator(animatorKey: string, animator?: IPlotAnimator): any {
      if (animator === undefined){
        return this._animators[animatorKey];
      } else {
        this._animators[animatorKey] = animator;
        return this;
      }
    }
  }
}
}

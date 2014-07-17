///<reference path="../reference.ts" />

module Plottable {
export module Abstract {
  export interface _IProjector {
    accessor: IAccessor;
    scale?: Abstract.Scale;
  }

  export interface IAttributeToProjector {
    [attrToSet: string]: IAppliedAccessor;
  }

  export class Plot extends Component {
    public _dataSource: DataSource;
    public _dataChanged = false;

    public renderArea: D3.Selection;
    public element: D3.Selection;
    private scales: Abstract.Scale[];
    public _colorAccessor: IAccessor;
    public _animate: boolean = false;
    public _animators: Animator.IPlotAnimatorMap = {};
    public _ANIMATION_DURATION = 250; // milliseconds
    public _projectors: { [attrToSet: string]: _IProjector; } = {};
    private animateOnNextRender = true;

    /**
     * Creates a Plot.
     *
     * @constructor
     * @param {any[]|DataSource} [dataset] The data or DataSource to be associated with this Plot.
     */
    constructor();
    constructor(dataset: any[]);
    constructor(dataset: DataSource);
    constructor(dataset?: any) {
      super();
      this.clipPathEnabled = true;
      this.classed("renderer", true);

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
      this.updateAllProjectors();
      return this;
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
     * Gets the Plot's DataSource.
     *
     * @return {DataSource} The current DataSource.
     */
    public dataSource(): DataSource;
    /**
     * Sets the Plot's DataSource.
     *
     * @param {DataSource} source The DataSource the Plot should use.
     * @return {Plot} The calling Plot.
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
      this.updateAllProjectors();
      this.animateOnNextRender = true;
      this._dataChanged = true;
      this._render();
    }

    public project(attrToSet: string, accessor: any, scale?: Abstract.Scale) {
      attrToSet = attrToSet.toLowerCase();
      var currentProjection = this._projectors[attrToSet];
      var existingScale = (currentProjection != null) ? currentProjection.scale : null;

      if (existingScale != null) {
        existingScale.removeExtent(this._plottableID, attrToSet);
        existingScale.broadcaster.deregisterListener(this);
      }

      if (scale != null) {
        scale.broadcaster.registerListener(this, () => this._render());
      }

      this._projectors[attrToSet] = {accessor: accessor, scale: scale};
      this.updateProjector(attrToSet);
      this._render(); // queue a re-render upon changing projector
      return this;
    }

    public _generateAttrToProjector(): IAttributeToProjector {
      var h: IAttributeToProjector = {};
      d3.keys(this._projectors).forEach((a) => {
        var projector = this._projectors[a];
        var accessor = Util.Methods.applyAccessor(projector.accessor, this.dataSource());
        var scale = projector.scale;
        var fn = scale == null ? accessor : (d: any, i: number) => scale.scale(accessor(d, i));
        h[a] = fn;
      });
      return h;
    }

    public _doRender(): Plot {
      if (this.element != null) {
        this._paint();
        this._dataChanged = false;
        this.animateOnNextRender = false;
      }
      return this;
    }

    public _paint() {
      // no-op
    }

    public _setup() {
      super._setup();
      this.renderArea = this.content.append("g").classed("render-area", true);
      return this;
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
      this.updateAllProjectors();
      return this;
    }

    /**
     * This function makes sure that all of the scales in this._projectors
     * have an extent that includes all the data that is projected onto them.
     */
    private updateAllProjectors(): Plot {
      d3.keys(this._projectors).forEach((attr: string) => this.updateProjector(attr));
      return this;
    }

    private updateProjector(attr: string) {
      var projector = this._projectors[attr];
      if (projector.scale != null) {
        var extent = this.dataSource()._getExtent(projector.accessor);
        if (extent.length === 0 || !this._isAnchored) {
          projector.scale.removeExtent(this._plottableID, attr);
        } else {
          projector.scale.updateExtent(this._plottableID, attr, extent);
        }
      }
      return this;
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
     * @param {Abstract.IAttributeToProjector} attrToProjector The set of attributes to set on the selection.
     * @return {D3.Selection} The resulting selection (potentially after the transition)
     */
    public _applyAnimatedAttributes(selection: any, animatorKey: string, attrToProjector: Abstract.IAttributeToProjector): any {
      if (this._animate && this.animateOnNextRender && this._animators[animatorKey] != null) {
        return this._animators[animatorKey].animate(selection, attrToProjector, this);
      } else {
        return selection.attr(attrToProjector);
      }
    }

    /**
     * Gets the animator associated with the specified Animator key.
     *
     * @param {string} animatorKey The key for the Animator.
     * @return {Animator.IPlotAnimator} The Animator for the specified key.
     */
    public animator(animatorKey: string): Animator.IPlotAnimator;
    /**
     * Sets the animator associated with the specified Animator key.
     *
     * @param {string} animatorKey The key for the Animator.
     * @param {Animator.IPlotAnimator} animator An Animator to be assigned to
     *                                          the specified key.
     * @return {Plot} The calling Plot.
     */
    public animator(animatorKey: string, animator: Animator.IPlotAnimator): Plot;
    public animator(animatorKey: string, animator?: Animator.IPlotAnimator): any {
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

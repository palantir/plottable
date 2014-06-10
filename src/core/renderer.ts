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
    public scales: Abstract.Scale[];
    public _colorAccessor: IAccessor;
    public _animate: Boolean = false;
    public _animators: Animator.IPlotAnimatorMap = {};
    public _ANIMATION_DURATION = 250; // milliseconds
    public _projectors: { [attrToSet: string]: _IProjector; } = {};


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
      this._dataChanged = true;
      return this;
    }

    /**
     * Retrieves the current DataSource, or sets a DataSource if the Plot doesn't yet have one.
     *
     * @param {DataSource} [source] The DataSource the Plot should use, if it doesn't yet have one.
     * @return {DataSource|Plot} The current DataSource or the calling Plot.
     */
    public dataSource(): DataSource;
    public dataSource(source: DataSource): Plot;
    public dataSource(source?: DataSource): any {
      if (source == null) {
        return this._dataSource;
      }
      var oldSource = this._dataSource;
      if (oldSource != null) {
        this._deregisterFromBroadcaster(this._dataSource);
        this._requireRerender = true;
        this._rerenderUpdateSelection = true;

        // point all scales at the new datasource
        d3.keys(this._projectors).forEach((attrToSet: string) => {
          var projector = this._projectors[attrToSet];
          if (projector.scale != null) {
            var rendererIDAttr = this._plottableID + attrToSet;
            projector.scale._removePerspective(rendererIDAttr);
            projector.scale._addPerspective(rendererIDAttr, source, projector.accessor);
          }
        });
      }
      this._dataSource = source;
      this._registerToBroadcaster(this._dataSource, () => {
        this._dataChanged = true;
        this._render();
      });
      this._dataChanged = true;
      this._render();
      return this;
    }

    public project(attrToSet: string, accessor: any, scale?: Abstract.Scale) {
      attrToSet = attrToSet.toLowerCase();
      var rendererIDAttr = this._plottableID + attrToSet;
      var currentProjection = this._projectors[attrToSet];
      var existingScale = (currentProjection != null) ? currentProjection.scale : null;
      if (scale == null) {
        scale = existingScale;
      }
      if (existingScale != null) {
        existingScale._removePerspective(rendererIDAttr);
        this._deregisterFromBroadcaster(existingScale);
      }
      if (scale != null) {
        scale._addPerspective(rendererIDAttr, this.dataSource(), accessor);
        this._registerToBroadcaster(scale, () => this._render());
      }
      this._projectors[attrToSet] = {accessor: accessor, scale: scale};
      this._requireRerender = true;
      this._rerenderUpdateSelection = true;
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
        this._requireRerender = false;
        this._rerenderUpdateSelection = false;
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

    /**
     * Apply attributes to the selection.
     *
     * If animation is enabled and a valid animator's key is specified, the
     * attributes are applied with the animator. Otherwise, they are applied
     * immediately to the selection.
     *
     * @param {D3.Selection} selection The selection of elements to update.
     * @param {string} animatorKey The key for the animator.
     * @param {Abstract.IAttributeToProjector} attrToProjector The set of attributes to set on the selection.
     * @return {D3.Selection} The resulting selection (potentially after the transition)
     */
    public _applyAnimatedAttributes(selection: any, animatorKey: string, attrToProjector: Abstract.IAttributeToProjector): any {
      if (this._animate && this._animators[animatorKey]) {
        // invoke animator with plot context
        return this._animators[animatorKey].animate(selection, attrToProjector, this);
      } else {
        return selection.attr(attrToProjector);
      }
    }

    /**
     * Gets or sets the animator associated with the specified animator key.
     *
     * @param {string} animatorKey The key for the animator.
     * @param {Animator.IPlotAnimator} animator If specified, will be stored as the
     *     animator for the key.
     * @return {Animator.IPlotAnimator|Plot} If an animator is specified, we return
     *     this object to enable chaining, otherwise we return the animator
     *     stored at the specified key.
     */
    public animator(animatorKey: string): Animator.IPlotAnimator;
    public animator(animatorKey: string, animator: Animator.IPlotAnimator): Plot;
    public animator(animatorKey: string, animator?: Animator.IPlotAnimator): any {
      if (animator == null){
        return this._animators[animatorKey];
      } else {
        this._animators[animatorKey] = animator;
        return this;
      }
    }
  }
}
}

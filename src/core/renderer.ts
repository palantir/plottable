///<reference path="../reference.ts" />

module Plottable {
  export interface _IProjector {
    accessor: IAccessor;
    scale?: Scale;
  }

  export class Renderer extends Component {
    public _dataSource: DataSource;
    public _dataChanged = false;

    public renderArea: D3.Selection;
    public element: D3.Selection;
    public _colorAccessor: IAccessor;
    public _animate = false;
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

    private scales: Scale[];

    /**
     * Creates a Renderer.
     *
     * @constructor
     * @param {any[]|DataSource} [dataset] The data or DataSource to be associated with this Renderer.
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
     * Retrieves the current DataSource, or sets a DataSource if the Renderer doesn't yet have one.
     *
     * @param {DataSource} [source] The DataSource the Renderer should use, if it doesn't yet have one.
     * @return {DataSource|Renderer} The current DataSource or the calling Renderer.
     */
    public dataSource(): DataSource;
    public dataSource(source: DataSource): Renderer;
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
          console.log(attrToSet);
          var projector = this._projectors[attrToSet];
          if (projector.scale != null) {
            var rendererIDAttr = this._plottableID + attrToSet;
            projector.scale._removePerspective(rendererIDAttr);
            projector.scale._addPerspective(rendererIDAttr, source, projector.accessor);
          }
        });
      }
      this._dataSource = source;
      // NOTE: rendererID is a number, convert it to a string first or something
      this._registerToBroadcaster(this._dataSource, (newDataSource) => {
        this._dataChanged = true;
        this._render();
      });
      this._dataChanged = true;
      this._render();
      return this;
    }

    public project(attrToSet: string, accessor: any, scale?: Scale) {
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

    public _generateAttrToProjector(): { [attrToSet: string]: IAppliedAccessor; } {
      var h: { [attrName: string]: IAppliedAccessor; } = {};
      d3.keys(this._projectors).forEach((a) => {
        var projector = this._projectors[a];
        var accessor = Utils.applyAccessor(projector.accessor, this.dataSource());
        var scale = projector.scale;
        var fn = scale == null ? accessor : (d: any, i: number) => scale.scale(accessor(d, i));
        h[a] = fn;
      });
      return h;
    }

    public _doRender(): Renderer {
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

    public addScale(scale: Scale) {
      this.scales.push(scale);
      scale.registerListener(this, () => {
        // get new extent from scale
        console.log("it's happening");
      });
    }

    public _extentFromDataSource(ds: DataSource): any[] {
      // will override
      return [];
    }
  }
}

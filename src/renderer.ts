///<reference path="reference.ts" />

module Plottable {
  export interface _IProjector {
    accessor: IAccessor;
    scale?: Scale;
  }

  export class Renderer extends Component {
    public _dataSource: DataSource;

    public renderArea: D3.Selection;
    public element: D3.Selection;
    public scales: Scale[];
    public _colorAccessor: IAccessor;
    public _animate = false;
    public _hasRendered = false;
    private static defaultColorAccessor = (d: any) => "#1f77b4";
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
      this._fixedWidth = false;
      this._fixedHeight = false;
      this.classed("renderer", true);

      if (dataset != null) {
        if (typeof dataset.data === "function") { // DataSource
          this._dataSource = <DataSource> dataset;
        } else {
          this._dataSource = new DataSource(dataset);
        }
        this._dataSource.registerListener(this, () => this._render());
      }
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
      } else if (this._dataSource == null) {
        this._dataSource = source;
        this._dataSource.registerListener(this, () => this._render());
        return this;
      } else {
        throw new Error("Can't set a new DataSource on the Renderer if it already has one.");
      }
    }

    public project(attrToSet: string, accessor: any, scale?: Scale) {
      var activatedAccessor = Utils.accessorize(accessor);
      var p = {accessor: activatedAccessor, scale: scale};
      this._projectors[attrToSet] = p;
      if (scale != null) {
        var rendererIDAttr = this._componentID + attrToSet;
/*        scale._registerPerspective(rendererIDAttr, this.data(), accessor);*/
      }
      this._requireRerender = true;
      this._rerenderUpdateSelection = true;
      return this;
    }

    public _generateAttrToProjector(): { [attrToSet: string]: IAppliedAccessor; } {
      var h: { [attrName: string]: IAppliedAccessor; } = {};
      d3.keys(this._projectors).forEach((a) => {
        var projector = this._projectors[a];
        var accessor = this._getAppliedAccessor(projector.accessor);
        var scale = projector.scale;
        var fn = scale == null ? accessor : (d: any, i: number) => scale.scale(accessor(d, i));
        h[a] = fn;
      });
      return h;
    }

    public _render(): Renderer {
      this._hasRendered = true;
      this._paint();
      this._requireRerender = false;
      this._rerenderUpdateSelection = false;
      return this;
    }

    public _paint() {
      // no-op
    }

    public autorange() {
      // no-op
      return this;
    }

    public _anchor(element: D3.Selection) {
      super._anchor(element);
      this.renderArea = this.content.append("g").classed("render-area", true);
      return this;
    }

    public _getAppliedAccessor(accessor: IAccessor): IAppliedAccessor {
      if (typeof(accessor) === "function") {
        var metadata = this._dataSource != null ? this._dataSource.metadata() : null;
        return (d: any, i: number) => accessor(d, i, metadata);
      } else if (typeof(accessor) === "string") {
        return (d: any, i: number) => d[accessor];
      } else {
        return (d: any, i: number) => accessor;
      }
    }
  }
}

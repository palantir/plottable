///<reference path="../reference.ts" />

module Plottable {
export module Abstract {
  export interface _IProjector {
    accessor: IAccessor;
    scale?: Abstract.Scale;
  }

  export class Plot extends Component {
    public _dataSource: DataSource;
    public _dataChanged = false;

    public renderArea: D3.Selection;
    public element: D3.Selection;
    private scales: Abstract.Scale[];
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
      }
      this._dataSource = source;
      this._registerToBroadcaster(this._dataSource, () => {

        this.updateProjectors();
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
        this._deregisterFromBroadcaster(existingScale);
      }
      if (scale != null) {
        this._registerToBroadcaster(scale, () => this._render());
      }
      this._projectors[attrToSet] = {accessor: accessor, scale: scale};
      this._requireRerender = true;
      this._rerenderUpdateSelection = true;
      this.updateProjectors();
      return this;
    }

    public _generateAttrToProjector(): { [attrToSet: string]: IAppliedAccessor; } {
      var h: { [attrName: string]: IAppliedAccessor; } = {};
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
     * This function makes sure that all of the scales in this._projectors
     * have an extent that includes all the data that is projected onto them.
     */
    public updateProjectors(): Plot {
      var scales = d3.values(this._projectors).map((p: _IProjector) => p.scale);
      scales.filter((s) => s != null).forEach((scale: Scale) => {
        var extent: any[] = [];
        d3.keys(this._projectors).forEach((attr: string) => {
          var projector = this._projectors[attr];
          var appliedAccessor = Util.Methods.applyAccessor(projector.accessor, this._dataSource);
          var mappedData = this._dataSource.data().map(appliedAccessor);
          if (projector.scale === scale && mappedData.length > 0) {
            extent = this.expandExtent(extent, mappedData, attr);
          }
        });
        scale.extentChanged(this._plottableID, extent);
      });
      return this;
    }

    /**
     * Returns a new extent that includes mappedData into the existing extent.
     *
     * @param {any[]} extent If an array of numbers, this is a [min, max] pair.
     *                If an array of strings, this is a list of all seen strings.
     *                extent is empty to begin with.
     * @param {any[]} mappedData A list of numbers or strings to be included in
     *                           extent.
     * @param {string} attr What kind of projection is being included, e.g.
     *                      "x", "y", "r". "r" for example should probably be
     *                      ignored, since a value having a radius of 5 doesn't
     *                      mean that 5 must be in the extent.
     */
    public expandExtent(extent: any[], mappedData: any[], attr: string): any[] {
      // will override
      return [];
    }

    /**
     * Returns a new extent including both the old extent and mappedData.
     *
     * @param {any[]} extent
     * @param {any[]} mappedData
     */
    public static includeExtent(extent: any[], mappedData: any[]): any[] {
      if (mappedData.length === 0) {
        return extent;
      }
      if (typeof mappedData[0] === "number") {
        var min = d3.min(mappedData);
        var max = d3.max(mappedData);
        if (extent.length === 0) {
          return [min, max];
        }
        return [Math.min(min, extent[0]), Math.max(max, extent[1])];
      } else if (typeof mappedData[0] === "string") {
        return Util.Methods.uniq(extent.concat(mappedData));
      } else {
        // undefined or something
        return extent;
      }
    }
  }
}
}

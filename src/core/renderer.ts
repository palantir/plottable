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

    private scales: Abstract.Scale[];
 

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

        // I don't need this here because it's called by this._render()
        // this.updateProjectors();
        // point all scales at the new datasource
        // d3.keys(this._projectors).forEach((attrToSet: string) => {
        //   console.log(attrToSet);
        //   var projector = this._projectors[attrToSet];
        //   if (projector.scale != null) {
        //     var rendererIDAttr = this._plottableID + attrToSet;
        //     projector.scale._removePerspective(rendererIDAttr);
        //     projector.scale._addPerspective(rendererIDAttr, source, projector.accessor);
        //   }
        // });
      }
      this._dataSource = source;
      // NOTE: rendererID is a number, convert it to a string first or something
      this._registerToBroadcaster(this._dataSource, (newDataSource) => {

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
        // existingScale._removePerspective(rendererIDAttr);
        this._deregisterFromBroadcaster(existingScale);
      }
      if (scale != null) {
        // scale._addPerspective(rendererIDAttr, this.dataSource(), accessor);
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
        var fn = scale == null ? accessor : (d: any, i: number) => {
          var x = scale.scale(accessor(d, i));
          // console.log(a);
          // console.log(accessor(d, i));
          // console.log(x);
          return x;
        };
        h[a] = fn;
      });
      return h;
    }

    public _doRender(): Plot {
      // well this is rather strange. Doesn't draw anything. Ask a mentor how the
      // drawing code works.
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

    public updateProjectors(): Plot {
      var scales = d3.values(this._projectors).map((p: _IProjector) => p.scale);
      scales.filter((s) => s != null).forEach((scale: Scale) => {
        var extent: any[] = [];
        d3.keys(this._projectors).forEach((attr: string) => {
          var projector = this._projectors[attr];
          var appliedAccessor: (d: any, i: number) => any = Util.Methods.applyAccessor(projector.accessor, this._dataSource);
          var mappedData = this._dataSource.data().map(appliedAccessor);
          if (projector.scale === scale && mappedData.length > 0) {
            extent = this.newExtent(extent, mappedData, attr);
          }
        });
        scale.extentChanged(this._plottableID, extent);
      });
      // will override
      return this;
    }

    public newExtent(extent: any[], mappedData: any[], attr: string): any[] {
      return [];
    }



         //  d3.keys(this._projectors).forEach((attrToSet: string) => {
         //    var projector = this._projectors[attrToSet];
         //    if (projector.scale != null) {
         //      var appliedAccessor: (d: any, i: number) => any = Util.Methods.applyAccessor(projector.accessor, this._dataSource);
         //      var mappedData = this._dataSource.data().map(appliedAccessor);
         //      // console.log(attrToSet);
         //      // console.log(mappedData);
         //      var newExtent: any[];
         //      if (mappedData.length === 0){
         //        return;
         //      } else if (typeof(mappedData[0]) === "string") {
         //        newExtent = Util.Methods.uniq(mappedData);
         //      } else {
         //        newExtent = d3.extent(mappedData);
         //      }
         //      // var newExtent = this._dataSource._getExtent(projector.accessor);
         //      // console.log(newExtent);
         //      projector.scale.extentChanged(this._plottableID, newExtent);
         //    }
         // });
         //  return this;

    public static expandExtent(extent: any[], mappedData: any[]): any[] {
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

    // private static includeZero(mappedData: any[], extent: number[]): number[] {
    //   if (extent.length === 0) {
    //     return [0, 0];
    //   }
    //   if (0 <= extent[0]) {
    //     return [0, extent[1]];
    //   } else if (extent[0] <= 0 && 0 <= extent[1]) {
    //     return extent;
    //   } else {
    //     return [extent[0], 0];
    //   }
    // }

    // private computeExtent(accessor: IAccessor): any[] {
    //   var appliedAccessor = Util.Methods.applyAccessor(accessor, this);
    //   var mappedData = this._data.map(appliedAccessor);
    //   if (mappedData.length === 0){
    //     return undefined;
    //   } else if (typeof(mappedData[0]) === "string") {
    //     return Util.Methods.uniq(mappedData);
    //   } else {
    //     return d3.extent(mappedData);
    //   }
    // }
  }
}
}

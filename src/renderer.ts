///<reference path="reference.ts" />

module Plottable {
  export class Renderer extends Component {
    public _data: any[];
    public _metadata: IMetadata;
    public renderArea: D3.Selection;
    public element: D3.Selection;
    public scales: Scale[];
    public _colorAccessor: IAccessor;
    public _animate = false;
    public _hasRendered = false;
    private static DEFAULT_COLOR_ACCESSOR = (d: any) => "#1f77b4";

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
    constructor(dataset?: any) {
      super();
      this.clipPathEnabled = true;
      this._fixedWidth = false;
      this._fixedHeight = false;
      this.classed("renderer", true);
      if (dataset != null) {
        if (dataset.data == null) {
          this.data(dataset);
        } else {
          this.data(dataset.data);
          if (dataset.metadata != null) {
            this.metadata(dataset.metadata);
          }
        }
      }
      this.colorAccessor(Renderer.DEFAULT_COLOR_ACCESSOR);
    }

    /**
     * Sets a new dataset on the Renderer.
     *
     * @param {IDataset} dataset The new dataset to be associated with the Renderer.
     * @returns {Renderer} The calling Renderer.
     */
    public dataset(dataset: IDataset): Renderer {
      this.data(dataset.data);
      this.metadata(dataset.metadata);
      return this;
    }

    public metadata(metadata: IMetadata): Renderer {
      var oldCSSClass = this._metadata != null ? this._metadata.cssClass : null;
      this.classed(oldCSSClass, false);
      this._metadata = metadata;
      this.classed(this._metadata.cssClass, true);
      this._rerenderUpdateSelection = true;
      this._requireRerender = true;
      return this;
    }

    public data(data: any[]): Renderer {
      this._data = data;
      this._requireRerender = true;
      return this;
    }

    public _render(): Renderer {
      this._hasRendered = true;
      this._paint();
      this._requireRerender = false;
      this._rerenderUpdateSelection = false;
      return this;
    }

    public colorAccessor(a: IAccessor): Renderer {
      this._colorAccessor = a;
      this._requireRerender = true;
      this._rerenderUpdateSelection = true;
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

    public _getAppliedAccessor(accessor: any): (d: any, i: number) => any {
      if (typeof(accessor) === "function") {
        return (d: any, i: number) => accessor(d, i, this._metadata);
      } else if (typeof(accessor) === "string") {
        return (d: any, i: number) => d[accessor];
      } else {
        return (d: any, i: number) => accessor;
      }
    }
  }
}

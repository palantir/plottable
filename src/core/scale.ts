///<reference path="../reference.ts" />

module Plottable {
export module Abstract {
  interface IPerspective {
    dataSource: DataSource;
    accessor: IAccessor;
  }
  export class Scale extends Broadcaster {
    public _d3Scale: D3.Scale.Scale;
    public _autoDomain = true;
    private rendererID2Perspective: {[rendererID: string]: IPerspective} = {};
    private dataSourceReferenceCounter = new Utils.IDCounter();
    public _autoNice = false;
    public _autoPad  = false;
    /**
     * Creates a new Scale.
     *
     * @constructor
     * @param {D3.Scale.Scale} scale The D3 scale backing the Scale.
     */
    constructor(scale: D3.Scale.Scale) {
      super();
      this._d3Scale = scale;
    }

    public _getAllExtents(): any[][] {
      var perspectives: IPerspective[] = d3.values(this.rendererID2Perspective);
      var extents = perspectives.map((p) => {
        var source = p.dataSource;
        var accessor = p.accessor;
        return source._getExtent(accessor);
      }).filter((e) => e != null);
      return extents;
    }

    public _getExtent(): any[] {
      return []; // this should be overwritten
    }

    /**
     * Modify the domain on the scale so that it includes the extent of all
     * perspectives it depends on. Extent: The (min, max) pair for a
     * QuantitiativeScale, all covered strings for an OrdinalScale.
     * Perspective: A combination of a DataSource and an Accessor that
     * represents a view in to the data.
     */
    public autoDomain() {
      this._setDomain(this._getExtent());
      return this;
    }

    public _addPerspective(rendererIDAttr: string, dataSource: DataSource, accessor: any) {
      if (this.rendererID2Perspective[rendererIDAttr] != null) {
        this._removePerspective(rendererIDAttr);
      }
      this.rendererID2Perspective[rendererIDAttr] = {dataSource: dataSource, accessor: accessor};

      var dataSourceID = dataSource._plottableID;
      if (this.dataSourceReferenceCounter.increment(dataSourceID) === 1 ) {
        dataSource.registerListener(this, () => {
          if (this._autoDomain) {
            this.autoDomain();
          }
        });
      }
      if (this._autoDomain) {
        this.autoDomain();
      }
      return this;
    }

    public _removePerspective(rendererIDAttr: string) {
      var dataSource = this.rendererID2Perspective[rendererIDAttr].dataSource;
      var dataSourceID = dataSource._plottableID;
      if (this.dataSourceReferenceCounter.decrement(dataSourceID) === 0) {
        dataSource.deregisterListener(this);
      }

      delete this.rendererID2Perspective[rendererIDAttr];
      if (this._autoDomain) {
        this.autoDomain();
      }
      return this;
    }

    /**
     * Returns the range value corresponding to a given domain value.
     *
     * @param value {any} A domain value to be scaled.
     * @returns {any} The range value corresponding to the supplied domain value.
     */
    public scale(value: any) {
      return this._d3Scale(value);
    }

    /**
     * Retrieves the current domain, or sets the Scale's domain to the specified values.
     *
     * @param {any[]} [values] The new value for the domain. This array may
     *     contain more than 2 values if the scale type allows it (e.g.
     *     ordinal scales). Other scales such as quantitative scales accept
     *     only a 2-value extent array.
     * @returns {any[]|Scale} The current domain, or the calling Scale (if values is supplied).
     */
    public domain(): any[];
    public domain(values: any[]): Scale;
    public domain(values?: any[]): any {
      if (values == null) {
        return this._d3Scale.domain();
      } else {
        this._autoDomain = false;
        this._setDomain(values);
        return this;
      }
    }

    public _setDomain(values: any[]) {
      this._d3Scale.domain(values);
      this._broadcast();
    }

    /**
     * Retrieves the current range, or sets the Scale's range to the specified values.
     *
     * @param {any[]} [values] The new value for the range.
     * @returns {any[]|Scale} The current range, or the calling Scale (if values is supplied).
     */
    public range(): any[];
    public range(values: any[]): Scale;
    public range(values?: any[]): any {
      if (values == null) {
        return this._d3Scale.range();
      } else {
        this._d3Scale.range(values);
        return this;
      }
    }

    /**
     * Creates a copy of the Scale with the same domain and range but without any registered listeners.
     *
     * @returns {Scale} A copy of the calling Scale.
     */
    public copy(): Scale {
      return new Scale(this._d3Scale.copy());
    }
  }
}
}

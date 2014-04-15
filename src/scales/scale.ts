///<reference path="../reference.ts" />

module Plottable {
  interface IPerspective {
    dataSource: DataSource;
    accessor: IAccessor;
  }
  export class Scale extends Broadcaster {
    public _d3Scale: D3.Scale.Scale;
    public _autoDomain = true;
    private rendererID2Perspective: {[rendererID: string]: IPerspective} = {};
    private dataSourceID2ReferenceCount: {[datasourceID: string]: number} = {};
    private isAutorangeUpToDate = false;
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

    public _getCombinedExtent(): any[] {
      var perspectives: IPerspective[] = d3.values(this.rendererID2Perspective);
      var extents = perspectives.map((p) => {
        var source = p.dataSource;
        var accessor = p.accessor;
        return source._getExtent(accessor);
      });
      return extents;
    }

    public autorangeDomain() {
        this.isAutorangeUpToDate = true;
        return this;
    }

    public _addPerspective(rendererIDAttr: string, dataSource: DataSource, accessor: IAccessor) {
      if (this.rendererID2Perspective[rendererIDAttr] != null) { // this renderer is changing
        this._removePerspective(rendererIDAttr);
      }
      var p = {dataSource: dataSource, accessor: accessor};
      this.rendererID2Perspective[rendererIDAttr] = p;
      var dataSourceID = dataSource._plottableID;
      var currentRefCount = this.dataSourceID2ReferenceCount[dataSourceID] == null ? this.dataSourceID2ReferenceCount[dataSourceID] : 0;
      if (currentRefCount === 0 ) {
        dataSource.registerListener(this, () => this.isAutorangeUpToDate = false );
      }
      this.dataSourceID2ReferenceCount[dataSourceID] = currentRefCount + 1;
      this.isAutorangeUpToDate = false;
      return this;
    }

    public _removePerspective(rendererIDAttr: string) {
      var dataSourceID = this.rendererID2Perspective[rendererIDAttr].dataSource._plottableID;
      this.dataSourceID2ReferenceCount[dataSourceID]--;
      if (this.dataSourceID2ReferenceCount[dataSourceID] === 0) {
        this.rendererID2Perspective[rendererIDAttr].dataSource.deregisterListener(this);
      }
      delete this.rendererID2Perspective[rendererIDAttr];
      this.isAutorangeUpToDate = false;
      return this;
    }

    /**
     * Returns the range value corresponding to a given domain value.
     *
     * @param value {any} A domain value to be scaled.
     * @returns {any} The range value corresponding to the supplied domain value.
     */
    public scale(value: any) {
      if (!this.isAutorangeUpToDate && this._autoDomain) {
        this.autorangeDomain();
      }
      return this._d3Scale(value);
    }

    /**
     * Retrieves the current domain, or sets the Scale's domain to the specified values.
     *
     * @param {any[]} [values] The new value for the domain.
     * @returns {any[]|Scale} The current domain, or the calling Scale (if values is supplied).
     */
    public domain(): any[];
    public domain(values: any[]): Scale;
    public domain(values?: any[]): any {
      if (values == null) {
        if (!this.isAutorangeUpToDate && this._autoDomain) {
          this.autorangeDomain();
        }
        return this._d3Scale.domain();
      } else {
        this._autoDomain = false;
        this._d3Scale.domain(values);
        this._broadcast();
        return this;
      }
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

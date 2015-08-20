///<reference path="testReference.ts" />

module Mocks {
  export class FixedSizeComponent extends Plottable.Component {
    public fsWidth: number;
    public fsHeight: number;

    constructor(width = 0, height = 0) {
      super();
      this.fsWidth = width;
      this.fsHeight = height;
    }

    public requestedSpace(availableWidth: number, availableHeight: number): Plottable.SpaceRequest {
      return {
        minWidth: this.fsWidth,
        minHeight: this.fsHeight
      };
    }

    public fixedWidth() {
      return true;
    }

    public fixedHeight() {
      return true;
    }
  }

  export class Scale<D, R> extends Plottable.Scale<D, R> {
    private _domain: D[] = [];
    private _range: R[] = [];
    private _domainToRangeMapping = new Plottable.Utils.Map<D, R>();

    protected _getDomain() {
      return this._domain;
    }

    protected _setBackingScaleDomain(values: D[]) {
      this._domain = values;
    }

    protected _getRange() {
      return this._range;
    }

    protected _setRange(values: R[]) {
      this._range = values;
    }

    public scale(value: D): R {
      return this._domainToRangeMapping.get(value);
    }

    public setDomainRangeMapping(key: D, value: R) {
      this._domainToRangeMapping.set(key, value);
      return this;
    }
  }
}

///<reference path="../../reference.ts" />

module Plottable {
export module Axis {
  export class Radial extends Abstract.Component {
    private _rScale: Abstract.Scale<any, number>;
    private _angleOrientation: number;
    private _baseline: D3.Selection;

    /**
     * Constructs an axis. An axis is a wrapper around a scale for rendering.
     *
     * @constructor
     * @param {Scale} scale The scale for this axis to render.
     * @param {string} orientation One of ["top", "left", "bottom", "right"];
     * on which side the axis will appear. On most axes, this is either "left"
     * or "bottom".
     * @param {Formatter} Data is passed through this formatter before being
     * displayed.
     */
    constructor(rScale: Abstract.Scale<any, number>, angle: number) {
      super();
      if (rScale == null) {throw new Error("Axis requires a scale");}
      this._rScale = rScale;
      this._angleOrientation = angle;

      this.classed("radial-axis", true);

      this._rScale.broadcaster.registerListener(this, () => this._rescale());
    }

    public _setup() {
      Abstract.Axis.prototype._setup.call(this);
    }

    public remove() {
      super.remove();
      this._rScale.broadcaster.deregisterListener(this);
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number): _ISpaceRequest {
      return {
        width : offeredWidth,
        height: offeredHeight,
        wantsWidth: false,
        wantsHeight: false
      };
    }

    public _rescale() {
      // default implementation; subclasses may call _invalidateLayout() here
      this._render();
    }

    public _computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
      super._computeLayout(xOffset, yOffset, availableWidth, availableHeight);
      this._rScale.range([0, Math.min(this.width(), this.height()) / 2]);
    }

    public _doRender() {
      this._baseline.attr(this._generateBaselineAttrHash());
    }

    public _generateBaselineAttrHash(): IAttributeToProjector {
      var baselineAttrHash: IAttributeToProjector = {};
      baselineAttrHash["x1"] = () => 0;
      baselineAttrHash["y1"] = () => 0;

      var radius = Math.min(this.width(), this.height()) / 2;
      baselineAttrHash["x2"] = (d: any) => radius * Math.sin(this._angleOrientation);
      baselineAttrHash["y2"] = (d: any) => -radius * Math.cos(this._angleOrientation);

      baselineAttrHash["stroke"] = () => "black";
      baselineAttrHash["transform"] = () => "translate(" + this.width() / 2 + "," + this.height() / 2 + ")";

      return baselineAttrHash;
    }

    public angleOrientation(): number;
    public angleOrientation(angle: number): Radial;
    public angleOrientation(angle?: number): any {
      if (angle == null) {
        return this._angleOrientation;
      }
      this._angleOrientation = angle;
      return this;
    }
  }
}
}

///<reference path="../../reference.ts" />

module Plottable {
export module Axis {
  export class RadialGroup extends Abstract.Component {
    public _rScale: Abstract.Scale<any, number>;
    public _thetaScale: Abstract.Scale<any, number>;

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
    constructor(rScale: Abstract.Scale<any, number>, thetaScale: Abstract.Scale<any, number>) {
      super();
      if (rScale == null || thetaScale == null) {throw new Error("Axis requires a scale");}
      this._rScale = rScale;
      this._thetaScale = thetaScale;

      this.classed("radial-axis-group", true);

      this._rScale.broadcaster.registerListener(this, () => this._rescale());
      this._thetaScale.broadcaster.registerListener(this, () => this._rescale());
    }

    public remove() {
      super.remove();
      this._rScale.broadcaster.deregisterListener(this);
      this._thetaScale.broadcaster.deregisterListener(this);
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
      var thetaDomainLength = this._thetaScale.domain().length;
      this._thetaScale.range([0, 2 * Math.PI * (thetaDomainLength - 1) / thetaDomainLength]);

      var baselines = this._content.selectAll(".baseline").data(this._thetaScale.domain());
      baselines.enter().append("line").classed("baseline", true);
      baselines.exit().remove();
      baselines.attr(this._generateBaselineAttrHash());
    }

    public _generateBaselineAttrHash() {
      var baselineAttrHash: IAttributeToProjector = {};
      baselineAttrHash["x1"] = () => 0;
      baselineAttrHash["y1"] = () => 0;

      var radius = Math.min(this.width(), this.height()) / 2;
      baselineAttrHash["x2"] = (d: any) => radius * Math.sin(this._thetaScale.scale(d));
      baselineAttrHash["y2"] = (d: any) => -radius * Math.cos(this._thetaScale.scale(d));

      baselineAttrHash["stroke"] = () => "black";
      baselineAttrHash["transform"] = () => "translate(" + this.width() / 2 + "," + this.height() / 2 + ")";

      return baselineAttrHash;
    }
  }
}
}

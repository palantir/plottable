///<reference path="../../reference.ts" />

module Plottable {
export module Axis {
  export class RadialGroup extends Component.Group {
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

      var thetaDomainLength = this._thetaScale.domain().length;
      this._thetaScale.range([0, 2 * Math.PI * (thetaDomainLength - 1) / thetaDomainLength]);

      this._thetaScale.domain().forEach((domainEntry) => this.merge(new Radial(rScale, thetaScale.scale(domainEntry))));
    }
  }
}
}

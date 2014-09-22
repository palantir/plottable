///<reference path="../../reference.ts" />

module Plottable {
export module Axis {
  export class RadialGroup extends Component.Group {

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
      if (rScale == null || thetaScale == null) {throw new Error("Axis group requires a scale");}

      thetaScale.broadcaster.registerListener(this, () => this.resetRadialAxes(rScale, thetaScale));
      this.resetRadialAxes(rScale, thetaScale);
    }

    private resetRadialAxes(rScale: Abstract.Scale<any, number>, thetaScale: Abstract.Scale<any, number>) {
      var thetaDomainLength = thetaScale.domain().length;
      thetaScale.range([0, 2 * Math.PI * (thetaDomainLength - 1) / thetaDomainLength]);

      this.components().forEach((component) => component.remove());
      thetaScale.domain().forEach((domainEntry) => this._addComponent(new Radial(rScale, thetaScale.scale(domainEntry))));
    }
  }
}
}

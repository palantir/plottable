///<reference path="../reference.ts" />

module Plottable {
export module _Util {
  export class ScaleDomainCoordinator<D> {
    /* This class is responsible for maintaining coordination between linked scales.
    It registers event listeners for when one of its scales changes its domain. When the scale
    does change its domain, it re-propogates the change to every linked scale.
    */
    private rescaleInProgress = false;
    private scales: Scale.AbstractScale<D,any>[];

    /**
     * Constructs a ScaleDomainCoordinator.
     *
     * @constructor
     * @param {Scale[]} scales A list of scales whose domains should be linked.
     */
    constructor(scales: Scale.AbstractScale<D,any>[]) {
      if (scales == null) {throw new Error("ScaleDomainCoordinator requires scales to coordinate");}
      this.scales = scales;
      this.scales.forEach((s) => s.broadcaster.registerListener(this, (sx: Scale.AbstractScale<D,any>) => this.rescale(sx)));
    }

    public rescale(scale: Scale.AbstractScale<D,any>) {
      if (this.rescaleInProgress) {
        return;
      }
      this.rescaleInProgress = true;
      var newDomain = scale.domain();
      this.scales.forEach((s) => s.domain(newDomain));
      this.rescaleInProgress = false;
    }
  }
}
}

///<reference path="../reference.ts" />

module Plottable {
export module _Util {
  export class ScaleDomainCoordinator {
    /* This class is responsible for maintaining coordination between linked scales.
    It registers event listeners for when one of its scales changes its domain. When the scale
    does change its domain, it re-propogates the change to every linked scale.
    */
    private rescaleInProgress = false;
    private scales: Abstract.Scale[];

    /**
     * Creates a ScaleDomainCoordinator.
     *
     * @constructor
     * @param {Scale[]} scales A list of scales whose domains should be linked.
     */
    constructor(scales: Abstract.Scale[]) {
      if (scales == null) {throw new Error("ScaleDomainCoordinator requires scales to coordinate");}
      this.scales = scales;
      this.scales.forEach((s) => s.broadcaster.registerListener(this, (sx: Abstract.Scale) => this.rescale(sx)));
    }

    public rescale(scale: Abstract.Scale) {
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

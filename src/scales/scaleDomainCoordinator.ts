///<reference path="../reference.ts" />

module Plottable {
  export class ScaleDomainCoordinator {
    /* This class is responsible for maintaining coordination between linked scales.
    It registers event listeners for when one of its scales changes its domain. When the scale
    does change its domain, it re-propogates the change to every linked scale.
    */
    private rescaleInProgress = false;
    private scales: Scale[];

    /**
     * Creates a ScaleDomainCoordinator.
     *
     * @constructor
     * @param {Scale[]} scales A list of scales whose domains should be linked.
     */
    constructor(scales: Scale[]) {
      this.scales = scales;
      this.scales.forEach((s) => s.registerListener(this, (sx: Scale) => this.rescale(sx)));
    }

    public rescale(scale: Scale) {
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

///<reference path="reference.ts" />

class ScaleDomainCoordinator {
  /* This class is responsible for maintaining coordination between linked scales.
  It registers event listeners for when one of its scales changes its domain. When the scale
  does change its domain, it re-propogates the change to every linked scale.
  */
  private currentDomain: any[] = [];
  constructor(private scales: Scale[]) {
    this.scales.forEach((s) => s.registerListener((sx: Scale) => this.rescale(sx)));
  }

  public rescale(scale: Scale) {
    var newDomain = scale.domain();
    if (newDomain === this.currentDomain) {
      // Avoid forming a really funky call stack with depth proportional to number of scales
      // pointer equality check is sufficient in this case
      return;
    }
    this.currentDomain = newDomain;
    // This will repropogate the change to every scale, including the scale that
    // originated it. This is fine because the scale will check if the new domain is
    // different from its current one and will disregard the change if they are equal.
    // It would be easy to stop repropogating to the original scale if it mattered.
    this.scales.forEach((s) => s.domain(newDomain));
  }
}

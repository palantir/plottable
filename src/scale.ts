///<reference path="reference.ts" />

class Scale implements IBroadcaster {
  public scale: D3.Scale.Scale;
  private broadcasterCallbacks: IBroadcasterCallback[] = [];

  constructor(scale: D3.Scale.Scale) {
    this.scale = scale;
  }

  public (value: any): any {
    return this.scale(value);
  }

  public domain(): any[];
  public domain(values: any[]): Scale;
  public domain(values?: any[]): any {
    if (values != null && !(_.isEqual(values, this.scale.domain()))) {
      // It is important that the scale does not update if the new domain is the same as
      // the current domain, to prevent circular propogation of events
      this.scale.domain(values);
      this.broadcasterCallbacks.forEach((b) => b(this));
      return this;
    } else {
      return this.scale.domain();
    }
  }

  public range(): any[];
  public range(values: any[]): Scale;
  public range(values?: any[]): any {
    if (values != null) {
      this.scale.range(values);
      return this;
    } else {
      return this.scale.range();
    }
  }

  public copy(): Scale {
    return new Scale(this.scale.copy());
  }


  public widenDomain(newDomain: number[]) {
    var currentDomain = this.domain();
    var wideDomain = [Math.min(newDomain[0], currentDomain[0]), Math.max(newDomain[1], currentDomain[1])];
    this.domain(wideDomain);
    return this;
  }

  public registerListener(callback: IBroadcasterCallback) {
    this.broadcasterCallbacks.push(callback);
    return this;
  }
}

class QuantitiveScale extends Scale {
  public scale: D3.Scale.QuantitiveScale;
  constructor(scale: D3.Scale.QuantitiveScale) {
    super(scale);
  }

  public invert(value: number) {
    return this.scale.invert(value);
  }

  public ticks(count: number) {
    return this.scale.ticks(count);
  }
}

class LinearScale extends QuantitiveScale {
  constructor() {
    super(d3.scale.linear());
    this.domain([Infinity, -Infinity]);
  }
}

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
    if (_.isEqual(newDomain, this.currentDomain)) {
      // Avoid forming a really funky call stack with depth proportional to number of scales
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

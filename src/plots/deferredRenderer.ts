/**
 * Copyright 2017-present Palantir Technologies
 * @license MIT
 */

import { Scale } from "../scales/scale";

/**
 * Stores the deferred transformation state for a single scale.
 */
class DomainTransform<T> {
  public scale = 0;
  public translate = 0;

  private cachedDomain: T[] = [null, null];
  private lastSeenDomain: T[] = [null, null];

  public reset() {
    this.scale = 1;
    this.translate = 0;
    this.cachedDomain = this.lastSeenDomain;
  }

  public setDomain(domain: T[]) {
    this.cachedDomain = domain;
  }

  public updateDomain = (scale: Scale<T, any>) => {
    this.lastSeenDomain = scale.domain();
    const cachedLength = scale.scale(this.cachedDomain[1]) - scale.scale(this.cachedDomain[0]);
    const lastSeenLength = scale.scale(this.lastSeenDomain[1]) - scale.scale(this.lastSeenDomain[0]);
    this.scale = (cachedLength / lastSeenLength) || 1;
    this.translate = scale.scale(this.cachedDomain[0]) - scale.scale(this.lastSeenDomain[0]) * this.scale || 0;
  }
}

/**
 * Manages deferred rendering callbacks.
 *
 * Call `setDomains` when deferred rendering is initially enabled to fix the
 * current domain values.
 *
 * Call `updateDomains` when scale domains change, which uses the domain to
 * compute CSS-tyle transform parameters passed to `applyTransformCallback`,
 * mimicking the result of a full re-render. After a deferred timeout, invoke
 * `applyTransformCallback` again with an identity transform and finally invoke
 * `renderCallback`, which should actually redraw the plot.
 */
export class DeferredRenderer<X, Y> {
  static DEFERRED_RENDERING_DELAY = 200;

  private domainTransformX = new DomainTransform<X>();
  private domainTransformY = new DomainTransform<Y>();
  private timeoutToken: number;

  constructor(
    private renderCallback: () => void,
    private applyTransformCallback: (tx: number, ty: number, sx: number, sy: number) => void,
  ) {}

  public setDomains(scaleX?: Scale<X, any>, scaleY?: Scale<Y, any>) {
    if (scaleX) {
      this.domainTransformX.setDomain(scaleX.domain());
    }
    if (scaleY) {
      this.domainTransformY.setDomain(scaleY.domain());
    }
    this.resetTransforms();
    this.renderDeferred();
  }

  public updateDomains(scaleX?: Scale<X, any>, scaleY?: Scale<Y, any>) {
    if (scaleX) {
      this.domainTransformX.updateDomain(scaleX);
    }
    if (scaleY) {
      this.domainTransformY.updateDomain(scaleY);
    }
    this.renderDeferred();
  }

  private renderDeferred = () => {
    this.applyTransform();
    clearTimeout(this.timeoutToken);
    this.timeoutToken = setTimeout(() => {
      this.resetTransforms();
      this.applyTransform();
      this.renderCallback();
    }, DeferredRenderer.DEFERRED_RENDERING_DELAY);
  }

  private resetTransforms() {
    this.domainTransformX.reset();
    this.domainTransformY.reset();
  }

  private applyTransform() {
    this.applyTransformCallback(
      this.domainTransformX.translate,
      this.domainTransformY.translate,
      this.domainTransformX.scale,
      this.domainTransformY.scale,
    );
  }
}

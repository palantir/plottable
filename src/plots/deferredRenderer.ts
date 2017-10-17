/**
 * Copyright 2017-present Palantir Technologies
 * @license MIT
 */

import { ITransformableScale } from "../scales";

/**
 * Stores the deferred transformation state for a single scale.
 */
class DomainTransform {
  public scale = 0;
  public translate = 0;

  private cachedDomain: [number, number] = [null, null];
  private lastSeenDomain: [number, number] = [null, null];

  public reset() {
    this.scale = 1;
    this.translate = 0;
    this.cachedDomain = this.lastSeenDomain;
  }

  public setDomain(scale: ITransformableScale) {
    this.cachedDomain = scale.getTransformationDomain();
  }

  public updateDomain = (scale: ITransformableScale) => {
    this.lastSeenDomain = scale.getTransformationDomain();
    const cachedLength = scale.scaleTransformation(this.cachedDomain[1]) - scale.scaleTransformation(this.cachedDomain[0]);
    const lastSeenLength = scale.scaleTransformation(this.lastSeenDomain[1]) - scale.scaleTransformation(this.lastSeenDomain[0]);
    this.scale = (cachedLength / lastSeenLength) || 1;
    this.translate = scale.scaleTransformation(this.cachedDomain[0]) - scale.scaleTransformation(this.lastSeenDomain[0]) * this.scale || 0;
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
 *
 * Call `resetTransforms` just prior to re-rendering into the canvas. This
 * ensures that the canvas is at 1:1 scaling.
 */
export class DeferredRenderer<X, Y> {
  static DEFERRED_RENDERING_DELAY = 200;

  private domainTransformX = new DomainTransform();
  private domainTransformY = new DomainTransform();
  private timeoutToken: number;

  constructor(
    private renderCallback: () => void,
    private applyTransformCallback: (tx: number, ty: number, sx: number, sy: number) => void,
  ) {}

  public setDomains(scaleX?: ITransformableScale, scaleY?: ITransformableScale) {
    if (scaleX) {
      this.domainTransformX.setDomain(scaleX);
    }
    if (scaleY) {
      this.domainTransformY.setDomain(scaleY);
    }
    this.renderDeferred();
  }

  public updateDomains(scaleX?: ITransformableScale, scaleY?: ITransformableScale) {
    if (scaleX) {
      this.domainTransformX.updateDomain(scaleX);
    }
    if (scaleY) {
      this.domainTransformY.updateDomain(scaleY);
    }
    this.renderDeferred();
  }

  public resetTransforms() {
    this.domainTransformX.reset();
    this.domainTransformY.reset();
    this.applyTransform();
  }

  private renderDeferred = () => {
    this.applyTransform();
    clearTimeout(this.timeoutToken);
    this.timeoutToken = setTimeout(() => {
      this.renderCallback();
    }, DeferredRenderer.DEFERRED_RENDERING_DELAY);
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

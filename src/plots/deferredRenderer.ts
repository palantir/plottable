
import { Scale } from "../scales/scale";

class DomainTransform<T> {
  public translate = 0;
  public scale = 0;
  private cachedDomain: T[] = [null, null];
  private lastSeenDomain: T[] = [null, null];
  private renderCallback: () => void;

  public reset() {
    this.translate = 0;
    this.scale = 1;
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
  };
}

export class DeferredRenderer<X, Y> {
  private static DEFERRED_RENDERING_DELAY = 200;

  private domainTransformX = new DomainTransform<X>();
  private domainTransformY = new DomainTransform<Y>();
  private timeoutToken: number;

  constructor(
    private renderCallback: () => void,
    private applyTransformCallback: (tx: number, ty: number, sx: number, sy: number) => void,
  ) {}

  public reset() {
      this.domainTransformX.reset();
      this.domainTransformY.reset();
  }

  public setDomains(scaleX?: Scale<X, any>, scaleY?: Scale<Y, any>) {
    if (scaleX) {
      this.domainTransformX.setDomain(scaleX);
    }
    if (scaleY) {
      this.domainTransformY.setDomain(scaleY);
    }
    this.renderCallback();
  }

  public updateDomains(scaleX?: Scale<X, any>, scaleY?: Scale<Y, any>) {
    if (scaleX) {
      this.domainTransformX.updateDomain(scaleX);
    }
    if (scaleY) {
      this.domainTransformY.updateDomain(scaleY);
    }
    this.renderCallback();
  }

  public renderDeferred = () => {
    this.applyTransform();
    clearTimeout(this.timeoutToken);
    this.timeoutToken = setTimeout(() => {
      this.reset();
      this.applyTransform();
      this.renderCallback();
    }, DeferredRenderer.DEFERRED_RENDERING_DELAY);
  };

  private applyTransform() {
    this.applyTransformCallback(
      this.domainTransformX.translate,
      this.domainTransformY.translate,
      this.domainTransformX.scale,
      this.domainTransformY.scale,
    );
  }
}
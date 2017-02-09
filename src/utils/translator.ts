import { Point } from "../";
import { IComponent } from "../components";

import { IPlottableElement } from "./plottableElement";

export class Translator {
  private _component: IComponent<any>;
  private _measurementElement: IPlottableElement<any>;

  constructor(component: IComponent<any>, measurementElement: IPlottableElement<any>) {
    this._component = component;
    this._measurementElement = measurementElement;
  }

  /**
   * Computes the position relative to the component
   */
  public computePosition(clientX: number, clientY: number): Point {
    // get the origin
    this._measurementElement.left(0);
    this._measurementElement.top(0);
    let mrBCR = this._measurementElement.getBoundingClientRect();
    let origin = { x: mrBCR.left, y: mrBCR.top };

    // calculate the scale
    let sampleDistance = 100;
    this._measurementElement.left(sampleDistance);
    this._measurementElement.top(sampleDistance);
    mrBCR = this._measurementElement.getBoundingClientRect();
    let testPoint = { x: mrBCR.left, y: mrBCR.top };

    // invalid measurements -- SVG might not be in the DOM
    if (origin.x === testPoint.x || origin.y === testPoint.y) {
      return null;
    }

    let scaleX = (testPoint.x - origin.x) / sampleDistance;
    let scaleY = (testPoint.y - origin.y) / sampleDistance;

    // get the true cursor position
    this._measurementElement.left((clientX - origin.x) / scaleX);
    this._measurementElement.top((clientY - origin.y) / scaleY);
    mrBCR = this._measurementElement.getBoundingClientRect();
    let trueCursorPosition = { x: mrBCR.left, y: mrBCR.top };

    const scaledPosition = {
      x: (trueCursorPosition.x - origin.x) / scaleX,
      y: (trueCursorPosition.y - origin.y) / scaleY,
    };

    const componentOrigin = this._component.originToRoot();

    return {
      x: scaledPosition.x - componentOrigin.x,
      y: scaledPosition.y - componentOrigin.y,
    };
  }

  /**
   * Checks whether event happened inside <svg> element.
   */
  public insideSVG(e: Event): boolean {
    return this.isInside(e);
  }

  public isInside(e: Event) {
    return this._component.content().node().contains(e.target as Element);
  }
}
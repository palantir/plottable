import * as d3 from "d3";

import * as Utils from "../utils";

import { Point } from "../";
import { IComponent } from "../components";
import { SimpleSelection } from "../core/interfaces";

const _TRANSLATOR_KEY = "__Plottable_ClientTranslator";

export function getTranslator(component: IComponent<any>): Translator {
  // The Translator works by first calculating the offset to root of the chart and then calculating
  // the offset from the component to the root. It is imperative that the measureElement
  // be added to the root of the hierarchy and nowhere else.
  let root = Utils.Component.root(component).element().node() as Element;

  let translator: Translator = (<any> root)[_TRANSLATOR_KEY];
  if (translator == null) {
    const measurer = <SVGElement> <any>document.createElementNS(root.namespaceURI, "svg");

    measurer.setAttribute("class", "measurer");
    measurer.setAttribute("style", "opacity: 0; visibility: hidden;");
    measurer.setAttribute("width", "1");
    measurer.setAttribute("height", "1");

    measurer.setAttribute("style", "opacity: 0; visibility: hidden; position: absolute; width: 1px; height: 1px;");

    root.appendChild(measurer);

    translator = new Translator(d3.select(measurer));
    (<any> root)[_TRANSLATOR_KEY] = translator;
  }

  return translator;
}

/**
 * Applies position as a style and attribute to the svg element
 * as the position of the element varies by the type of parent.
 * When nested within an SVG, the attribute position is respected.
 * When nested within an HTML, the style position is respected.
 */
function move(node: SimpleSelection<any>, x: number, y: number) {
  node.styles({ "left": `${x}px`, "top": `${y}px` });
  node.attrs({ "x": `${x}`, "y": `${y}` });
}

export class Translator {
  private _measurementElement: SimpleSelection<void>;

  constructor(measurementElement: SimpleSelection<void>) {
    this._measurementElement = measurementElement;
  }

  /**
   * Computes the position relative to the component
   */
  public computePosition(clientX: number, clientY: number): Point {
    // get the origin
    move(this._measurementElement, 0, 0);

    let mrBCR = (this._measurementElement.node() as HTMLElement).getBoundingClientRect();
    let origin = { x: mrBCR.left, y: mrBCR.top };

    // calculate the scale
    let sampleDistance = 100;
    move(this._measurementElement, sampleDistance, sampleDistance);

    mrBCR = (this._measurementElement.node() as HTMLElement).getBoundingClientRect();
    let testPoint = { x: mrBCR.left, y: mrBCR.top };

    // invalid measurements -- SVG might not be in the DOM
    if (origin.x === testPoint.x || origin.y === testPoint.y) {
      return null;
    }

    let scaleX = (testPoint.x - origin.x) / sampleDistance;
    let scaleY = (testPoint.y - origin.y) / sampleDistance;

    // get the true cursor position
    move(this._measurementElement, ((clientX - origin.x) / scaleX), ((clientY - origin.y) / scaleY));

    mrBCR = (this._measurementElement.node() as HTMLElement).getBoundingClientRect();
    let trueCursorPosition = { x: mrBCR.left, y: mrBCR.top };

    const scaledPosition = {
      x: (trueCursorPosition.x - origin.x) / scaleX,
      y: (trueCursorPosition.y - origin.y) / scaleY,
    };

    return scaledPosition;
  }

  public isInside(component: IComponent<any>, e: Event) {
    return Utils.DOM.contains(Utils.Component.root(component).element().node() as Element, e.target as Element);
  }
}

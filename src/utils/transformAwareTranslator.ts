import * as d3 from "d3";

import * as Utils from "../utils";

import { Point } from "../";
import { Component } from "../components/component";
import { SimpleSelection } from "../core/interfaces";

const _TRANSLATOR_KEY = "__Plottable_ClientTranslator";

export function getTranslator(component: Component): Translator {
  // The Translator works by first calculating the offset to root of the chart and then calculating
  // the offset from the component to the root. It is imperative that the _measurementElement
  // be added to the root of the hierarchy and nowhere else.
  const root = component.root().rootElement().node() as Element;

  let translator: Translator = (<any> root)[_TRANSLATOR_KEY];
  if (translator == null) {
    const measurer = <SVGElement> <any>document.createElementNS(root.namespaceURI, "svg");

    measurer.setAttribute("class", "measurer");
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
  private static SAMPLE_DISTANCE = 100;
  private _measurementElement: SimpleSelection<void>;

  constructor(measurementElement: SimpleSelection<void>) {
    this._measurementElement = measurementElement;
  }

  /**
   * Computes the position relative to the component. Converts screen clientX/clientY
   * coordinates to the coordinates relative to the measurementElement, taking into
   * account transform() factors from CSS or SVG up the DOM tree.
   */
  public computePosition(clientX: number, clientY: number): Point {
    // get the origin
    move(this._measurementElement, 0, 0);

    let mrBCR = (this._measurementElement.node() as HTMLElement).getBoundingClientRect();
    const origin = { "x": mrBCR.left, "y": mrBCR.top };

    // calculate the scale
    move(this._measurementElement, Translator.SAMPLE_DISTANCE, Translator.SAMPLE_DISTANCE);

    mrBCR = (this._measurementElement.node() as HTMLElement).getBoundingClientRect();
    const testPoint = { "x": mrBCR.left, "y": mrBCR.top };

    // invalid measurements -- SVG might not be in the DOM
    if (origin.x === testPoint.x || origin.y === testPoint.y) {
      return null;
    }

    const scaleX = (testPoint.x - origin.x) / Translator.SAMPLE_DISTANCE;
    const scaleY = (testPoint.y - origin.y) / Translator.SAMPLE_DISTANCE;

    // get the true cursor position
    move(this._measurementElement, ((clientX - origin.x) / scaleX), ((clientY - origin.y) / scaleY));

    mrBCR = (this._measurementElement.node() as HTMLElement).getBoundingClientRect();
    const trueCursorPosition = { "x": mrBCR.left, "y": mrBCR.top };

    const scaledPosition = {
      "x": (trueCursorPosition.x - origin.x) / scaleX,
      "y": (trueCursorPosition.y - origin.y) / scaleY,
    };

    return scaledPosition;
  }

  public isInside(component: Component, e: Event) {
    return Utils.DOM.contains(component.root().rootElement().node() as Element, e.target as Element);
  }
}

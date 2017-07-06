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
  const rootContent = component.root().content();

  let translator: Translator = (<any> rootContent)[_TRANSLATOR_KEY];
  if (translator == null) {
    translator = new Translator(rootContent);
    (<any> rootContent)[_TRANSLATOR_KEY] = translator;
  }

  return translator;
}

export class Translator {
  private static SAMPLE_DISTANCE = 100;
  private _measurer: d3.Selection<SVGRectElement, any, any, any>;

  constructor(rootContent: SimpleSelection<void>) {
    // Use a "rect" element inside the root content node to resolve https://github.com/palantir/plottable/issues/3355
    this._measurer = rootContent.append<SVGRectElement>("rect")
        .classed("measurer", true)
        .styles({
          opacity: 0,
          visibility: "hidden",
        }).attrs({
          height: 1,
          "stroke-width": 0,
          width: 1,
        });
  }

  /**
   * Computes the position relative to the component. Converts screen clientX/clientY
   * coordinates to the coordinates relative to the measurementElement, taking into
   * account transform() factors from CSS or SVG up the DOM tree.
   */
  public computePosition(clientX: number, clientY: number): Point {
    // get the origin
    this.moveMeasurer(0, 0);

    let mrBCR = this._measurer.node().getBoundingClientRect();
    const origin = { x: mrBCR.left, y: mrBCR.top };

    // calculate the scale
    this.moveMeasurer(Translator.SAMPLE_DISTANCE, Translator.SAMPLE_DISTANCE);

    mrBCR = this._measurer.node().getBoundingClientRect();
    const testPoint = { x: mrBCR.left, y: mrBCR.top };

    // invalid measurements -- SVG might not be in the DOM
    if (origin.x === testPoint.x || origin.y === testPoint.y) {
      return null;
    }

    const scaleX = (testPoint.x - origin.x) / Translator.SAMPLE_DISTANCE;
    const scaleY = (testPoint.y - origin.y) / Translator.SAMPLE_DISTANCE;

    // get the true cursor position
    this.moveMeasurer(((clientX - origin.x) / scaleX), ((clientY - origin.y) / scaleY));

    mrBCR = this._measurer.node().getBoundingClientRect();
    const trueCursorPosition = { x: mrBCR.left, y: mrBCR.top };

    const scaledPosition = {
      x: (trueCursorPosition.x - origin.x) / scaleX,
      y: (trueCursorPosition.y - origin.y) / scaleY,
    };

    return scaledPosition;
  }

  private moveMeasurer(x: number, y: number) {
    this._measurer.attrs({ x: `${x}`, y: `${y}` });
  }

  /**
   * Is the event's target part of the given component's DOM tree?
   * @param component
   * @param e
   * @returns {boolean}
   */
  public static isEventInside(component: Component, e: Event) {
    return Utils.DOM.contains(component.root().rootElement().node() as Element, e.target as Element);
  }
}

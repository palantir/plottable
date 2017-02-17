/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as DOM from "./domUtils";
import { PlottableSVGElement } from "./plottableElement";
import { Translator } from "./translator";

import { IComponent } from "../components";

export class ClientToSVGTranslator {
  private static _TRANSLATOR_KEY = "__Plottable_ClientToSVGTranslator";

  /**
   * Returns the ClientToSVGTranslator for the <svg> containing elem.
   * If one already exists on that <svg>, it will be returned; otherwise, a new one will be created.
   */
  public static getTranslator(component: IComponent<d3.Selection<void>>): Translator {
    let svg = DOM.boundingSVG(component.element().node() as SVGElement);

    let translator: Translator = (<any> svg)[ClientToSVGTranslator._TRANSLATOR_KEY];
    if (translator == null) {
      const measureRect = <SVGElement> <any>document.createElementNS(svg.namespaceURI, "rect");
      measureRect.setAttribute("class", "measure-rect");
      measureRect.setAttribute("style", "opacity: 0; visibility: hidden;");
      measureRect.setAttribute("width", "1");
      measureRect.setAttribute("height", "1");
      svg.appendChild(measureRect);

      translator = new Translator(new PlottableSVGElement(measureRect));
      (<any> svg)[ClientToSVGTranslator._TRANSLATOR_KEY] = translator;
    }

    return translator;
  }
}

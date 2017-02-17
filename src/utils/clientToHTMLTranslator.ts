/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as DOM from "./domUtils";
import { PlottableHTMLElement } from "./plottableElement";
import { Translator } from "./translator";

import { HTMLComponent } from "../components";
import { Point } from "../core/interfaces";

export class ClientToHTMLTranslator {
  private static _TRANSLATOR_KEY = "__Plottable_ClientToHTMLTranslator";

  /**
   * Returns a Translator for the root of the component.
   * If one already exists for the root, it will be returned; otherwise, a new one will be created.
   */
  public static getTranslator(component: HTMLComponent): Translator {
    // The Translator works by first calculating the offset to root of the chart and then calculating
    // the offset from the component to the root. It is imperative that the measureElement
    // be added to the root of the hierarchy and nowhere else.
    const root = component.root().element().node();

    let translator: Translator = (<any> root)[ClientToHTMLTranslator._TRANSLATOR_KEY];
    if (translator == null) {
      const measureElement = document.createElementNS(root.namespaceURI, "div") as HTMLElement;

      measureElement.setAttribute("class", "measure-rect");
      measureElement.setAttribute("style", "opacity: 0; visibility: hidden; position: absolute; width: 1px; height: 1px;");
      root.appendChild(measureElement);

      translator = new Translator(new PlottableHTMLElement(measureElement));
      (<any> root)[ClientToHTMLTranslator._TRANSLATOR_KEY] = translator;
    }

    return translator;
  }
}

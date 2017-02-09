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
  public static getTranslator(component: HTMLComponent) {
    const root = component.root().content();

    let translator: Translator = (<any> root)[ClientToHTMLTranslator._TRANSLATOR_KEY];
    if (translator == null) {
      const rootElement = root.node() as HTMLElement;
      const measureElement = document.createElementNS(rootElement.namespaceURI, "div") as HTMLElement;

      measureElement.setAttribute("class", "measure-rect");
      measureElement.setAttribute("style", "opacity: 0; visibility: hidden; position: relative;");
      measureElement.setAttribute("width", "1");
      measureElement.setAttribute("height", "1");
      rootElement.appendChild(measureElement);

      translator = new Translator(component, new PlottableHTMLElement(measureElement));
      (<any> root)[ClientToHTMLTranslator._TRANSLATOR_KEY] = translator;
    }

    return translator;
  }
}
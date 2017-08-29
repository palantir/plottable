/**
 * Copyright 2017-present Palantir Technologies
 * @license MIT
 */

import * as Utils from "../utils";

import { Point } from "../";
import { Component } from "../components/component";

const _TRANSLATOR_KEY = "__Plottable_ClientTranslator";

/**
 * Returns a singleton-ized `Translator` instance associated with the component.
 */
export function getTranslator(component: Component): Translator {
  const rootElement = component.root().rootElement().node() as HTMLElement;

  let translator: Translator = (<any> rootElement)[_TRANSLATOR_KEY];
  if (translator == null) {
    translator = new Translator(rootElement);
    (<any> rootElement)[_TRANSLATOR_KEY] = translator;
  }

  return translator;
}

/**
 * The translator implements CSS transform aware position measuring. We manually
 * compute a cumulative CSS3 of the root element ancestors up to `<body>`.
 */
export class Translator {
  constructor(private _rootElement: HTMLElement) {
  }

  /**
   * Given `document` client coordinates, computes the position relative to the
   * `Component`'s root element, taking into account the cumulative CSS3
   * transforms of the root element ancestors up to `<body>`.
   *
   * This triggers a layout but doesn't further modify the DOM, so causes a
   * maximum of one layout per frame.
   *
   * Does not support `transform-origin` CSS property other than the default.
   */
  public computePosition(clientX: number, clientY: number): Point {
    const clientPosition = {
      x: clientX,
      y: clientY,
    };

    const transform = Utils.Math.getCumulativeTransform(this._rootElement);
    if (transform == null) {
      return clientPosition;
    }

    const transformed = Utils.Math.applyTransform(transform, clientPosition);
    return transformed;
  }

  /**
   * Is the event's target part of the given component's DOM tree?
   */
  public static isEventInside(component: Component, e: Event) {
    return Utils.DOM.contains(component.root().rootElement().node() as Element, e.target as Element);
  }
}

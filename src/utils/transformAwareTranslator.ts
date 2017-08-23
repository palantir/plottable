/**
 * Copyright 2017-present Palantir Technologies
 * @license MIT
 */

import * as Utils from "../utils";

import { Point } from "../";
import { Component } from "../components/component";

const _TRANSLATOR_KEY = "__Plottable_ClientTranslator";

export function getTranslator(component: Component): Translator {
  // The Translator works by first calculating the offset to root of the chart
  // and then calculating the offset from the component to the root.
  const rootElement = component.element().node() as HTMLElement;

  let translator: Translator = (<any> rootElement)[_TRANSLATOR_KEY];
  if (translator == null) {
    translator = new Translator(rootElement);
    (<any> rootElement)[_TRANSLATOR_KEY] = translator;
  }

  return translator;
}

/**
 * The translator implements CSS transform aware event measuring. We manually
 * compute a composite affine transformation using the computed properties of
 * the ancestors of the root element.
 */
export class Translator {
  constructor(private _rootElement: HTMLElement) {
  }

  /**
   * Computes the position relative to the root element, taking into account
   * css3 transforms.
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
   *
   * @param component
   * @param e
   * @returns {boolean}
   */
  public static isEventInside(component: Component, e: Event) {
    return Utils.DOM.contains(component.element().node() as Element, e.target as Element);
  }
}

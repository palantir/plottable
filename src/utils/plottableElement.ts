/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { IPlottableElement, PlottableElement } from "./abstractPlottableElement";

export class PlottableHTMLElement extends PlottableElement<HTMLElement> {
  public left(position: number) {
    this._element.style.left = `${position}px`;
    return this;
  }

  public top(position: number) {
    this._element.style.top = `${position}px`;
    return this;
  }
}

export class PlottableSVGElement extends PlottableElement<SVGElement> {
  public left(position: number) {
    this.setAttribute("x", String(position));
    return this;
  }

  public top(position: number) {
    this.setAttribute("y", String(position));
    return this;
  }
}

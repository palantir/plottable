/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { SimpleSelection } from "../core/interfaces";
import { SVGDrawer } from "./svgDrawer";

export class AreaSVGDrawer extends SVGDrawer {
  constructor() {
    super("path", "area");
  }

  protected _applyDefaultAttributes(selection: SimpleSelection<any>) {
    selection.style("stroke", "none");
  }

  public getVisualPrimitiveAtIndex(index: number) {
    // areas are represented by one single element; always get that element
    // regardless of the data index.
    return super.getVisualPrimitiveAtIndex(0);
  }
}

/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { SimpleSelection } from "../core/interfaces";

import { SVGDrawer } from "./svgDrawer";

export class ArcSVGDrawer extends SVGDrawer {

  constructor() {
    super("path", "arc fill");
  }

  protected _applyDefaultAttributes(selection: SimpleSelection<any>) {
    selection.style("stroke", "none");
  }
}

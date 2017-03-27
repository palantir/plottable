/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { SimpleSelection } from "../core/interfaces";
import { SVGDrawer } from "./svgDrawer";

export class ArcOutlineSVGDrawer extends SVGDrawer {

  constructor() {
    super("path", "arc outline");
  }

  protected _applyDefaultAttributes(selection: SimpleSelection<any>) {
    selection.style("fill", "none");
  }
}

/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { SVGDrawer } from "./svgDrawer";

export class SymbolSVGDrawer extends SVGDrawer {
  constructor() {
    super("path", "symbol");
  }
}

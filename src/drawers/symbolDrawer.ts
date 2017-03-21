/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { SVGDrawer } from "./drawer";

export class SymbolSVGDrawer extends SVGDrawer {
  constructor() {
    super("path", "symbol");
  }
}

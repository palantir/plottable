/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Dataset } from "../core/dataset";
import { Drawer } from "./drawer";
import { IDrawerContext, SvgDrawerContext } from "./contexts";

export class SymbolSvg extends SvgDrawerContext {
  protected _className = "symbol";
  protected _svgElementName = "path";
}

export class Symbol extends Drawer {
  protected _svgDrawerContext = SymbolSvg;
}

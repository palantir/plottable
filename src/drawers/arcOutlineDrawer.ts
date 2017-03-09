/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import { Dataset } from "../core/dataset";
import { Drawer } from "./drawer";
import { SimpleSelection } from "../core/interfaces";
import { IDrawerContext, SvgDrawerContext } from "./contexts";

export class ArcOutlineSvg extends SvgDrawerContext {
  protected _className = "arc outline";
  protected _svgElementName = "path";

  protected _applyDefaultAttributes(selection: SimpleSelection<any>) {
    super._applyDefaultAttributes(selection);
    selection.style("fill", "none");
  }
}

export class ArcOutline extends Drawer {
  protected _svgDrawerContext = ArcOutlineSvg;
}

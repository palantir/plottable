/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import { Dataset } from "../core/dataset";
import { Drawer } from "./drawer";
import { SimpleSelection } from "../core/interfaces";
import { IDrawerContext, SvgDrawerContext } from "./contexts";

export class AreaSvg extends SvgDrawerContext {
  protected _className = "area";
  protected _svgElementName = "path";

  protected _applyDefaultAttributes(selection: SimpleSelection<any>) {
    super._applyDefaultAttributes(selection);
    selection.style("stroke", "none");
  }

  public selectionForIndex(index: number): SimpleSelection<any> {
    return d3.select(this.selection().node());
  }
}

export class Area extends Drawer {
  protected _svgDrawerContext = AreaSvg;
}

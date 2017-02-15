/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3/build/d3.node";

import { Dataset } from "../core/dataset";

import { Drawer } from "./drawer";
import { SimpleSelection } from "../core/interfaces";

export class Area extends Drawer {

  constructor(dataset: Dataset) {
    super(dataset);
    this._className = "area";
    this._svgElementName = "path";
  }

  protected _applyDefaultAttributes(selection: SimpleSelection<any>) {
    super._applyDefaultAttributes(selection);
    selection.style("stroke", "none");
  }

  public selectionForIndex(index: number): SimpleSelection<any> {
    return d3.select(this.selection().node());
  }
}

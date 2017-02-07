/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { Dataset } from "../core/dataset";

import { Drawer } from "./drawer";

export class Arc extends Drawer {

  constructor(dataset: Dataset) {
    super(dataset);
    this._className = "arc fill";
    this._svgElementName = "path";
  }

  protected _applyDefaultAttributes(selection: d3.Selection<any>) {
    super._applyDefaultAttributes(selection);
    selection.style("stroke", "none");
  }
}

import * as d3 from "d3";

import { Dataset } from "#/core/dataset";

import { Drawer } from "./drawer";

export class ArcOutline extends Drawer {

  constructor(dataset: Dataset) {
    super(dataset);
    this._className = "arc outline";
    this._svgElementName = "path";
  }

  protected _applyDefaultAttributes(selection: d3.Selection<any>) {
    super._applyDefaultAttributes(selection);
    selection.style("fill", "none");
  }
}

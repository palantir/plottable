/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Dataset } from "../core/dataset";

import { SimpleSelection } from "../core/interfaces";
import { Drawer } from "./drawer";

export class Arc extends Drawer {

  constructor(dataset: Dataset) {
    super(dataset);
    this._className = "arc fill";
    this._svgElementName = "path";
  }

  protected _applyDefaultAttributes(selection: SimpleSelection<any>) {
    super._applyDefaultAttributes(selection);
    selection.style("stroke", "none");
  }
}

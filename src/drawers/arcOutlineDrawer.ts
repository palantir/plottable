/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { Dataset } from "../core/dataset";

import { Drawer } from "./drawer";
import { SimpleSelection } from "../core/interfaces";

export class ArcOutline extends Drawer {

  constructor(dataset: Dataset) {
    super(dataset);
    this._className = "arc outline";
    this._svgElementName = "path";
  }

  protected _applyDefaultAttributes(selection: SimpleSelection<any>) {
    super._applyDefaultAttributes(selection);
    selection.style("fill", "none");
  }
}

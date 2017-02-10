/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Dataset } from "../core/dataset";

import { Drawer } from "./drawer";

export class Segment extends Drawer {
  constructor(dataset: Dataset) {
    super(dataset);
    this._svgElementName = "line";
  }
}

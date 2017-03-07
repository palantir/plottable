/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { Dataset } from "../core/dataset";

import { Drawer } from "./drawer";
import { AppliedDrawStep } from "./index";

export class Rectangle extends Drawer {

  constructor(dataset: Dataset) {
    super(dataset);
    this._svgElementName = "rect";
  }
}

/*
Copyright 2014-present Palantir Technologies
Licensed under MIT (https://github.com/palantir/plottable/blob/master/LICENSE)
*/

import { Dataset } from "../core/dataset";

import { Drawer } from "./drawer";

export class Symbol extends Drawer {

  constructor(dataset: Dataset) {
    super(dataset);
    this._svgElementName = "path";
    this._className = "symbol";
  }

}

import { Dataset } from "#/core/dataset";

import { Drawer } from "./drawer";

export class Symbol extends Drawer {

  constructor(dataset: Dataset) {
    super(dataset);
    this._svgElementName = "path";
    this._className = "symbol";
  }

}

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

///<reference path="../reference.ts" />

module Plottable {
export module Component {
  export class SelectionBoxContainer extends AbstractComponent {
    private _selectionBoxes: Entity.SelectionBox[] = [];

    constructor() {
      super();
      this.classed("selection-box-container", true);
    }

    protected _setup() {
      super._setup();
      this._selectionBoxes.push(new Plottable.Entity.SelectionBox(this._content));
    }

    public getSelectionBoxes() {
      return this._selectionBoxes;
    }

    public dismissAll() {
      this._selectionBoxes.forEach((b) => b.dismiss());
      return this;
    }
  }
}
}

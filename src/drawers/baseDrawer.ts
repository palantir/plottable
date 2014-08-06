///<reference path="../reference.ts" />

module Plottable {
export module Abstract {
  export class Drawer {
    public renderArea: D3.Selection;
    constructor(public key: string) {
    }

    public remove() {
      if (this.renderArea != null) {
        this.renderArea.remove();
      }
    }

    public draw(data: any[][], attrHash: any) {
      throw new Error("Abstract Method Not Implemented");
    }
  }
}
}

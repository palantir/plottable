///<reference path="../reference.ts" />

module Plottable {
  export class ToggleLegend extends Legend {
    private toggledOn: boolean[];

    /**
     * Creates a Legend.
     *
     * @constructor
     * @param {ColorScale} colorScale
     */
    constructor(colorScale?: ColorScale) {
      super(colorScale);
      this.toggledOn = [];
    }

    public getState(i: number): boolean {
      return this.toggledOn[i];
    }

    public toggleState(i: number) {
      this.toggledOn[i] = !this.toggledOn[i];
    }

    public init(i: number) {
      this.toggledOn[i] = true;
    }
  }
}

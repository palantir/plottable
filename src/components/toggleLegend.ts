///<reference path="../reference.ts" />

module Plottable {
  export class ToggleLegend extends Legend {
    private state: boolean[];
    public toggleOn: (i?: number) => any;
    public toggleOff: (i?: number) => any;
    public update: (i?: number) => any;

    /**
     * Creates a Legend.
     *
     * @constructor
     * @param {ColorScale} colorScale
     */
    constructor(colorScale: ColorScale, toggleOn: (i?: number) => any, toggleOff: (i?: number) => any, update: (i?: number) => any) {
      super(colorScale);
      this.state = [];

      this.toggleOn = toggleOn;
      this.toggleOff = toggleOff;
      this.update = update;

      var cb = function(x: number, y: number) {
            var legend = this.componentToListenTo;
            var height = legend.availableHeight;
            var entries = legend.colorScale.domain().length;
            var idx = Math.floor(y / (height / entries));
            if (legend.getState(idx)) {
              legend.toggleOff(idx);
            } else {
              legend.toggleOn(idx);
            }
            legend.toggleState(idx);
            legend.update(idx);
        };
        new Plottable.ClickInteraction(this).callback(cb).registerWithComponent();
    }

    public getState(i: number): boolean {
      return this.state[i];
    }

    public toggleState(i: number) {
      this.state[i] = !this.state[i];
    }

    public init(i: number) {
      this.state[i] = true;
    }
  }
}

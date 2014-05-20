///<reference path="../reference.ts" />

module Plottable {
  export class CategoryAxis extends Component {
    private _scale: OrdinalScale;
    private orientation: string;

    constructor(scale: OrdinalScale, orientation = "bottom") {
      super();
      this.classed("category-axis", true);
      this._scale = scale;
      if (orientation.toLowerCase() !== "bottom") {
        throw new Error("Only bottom-oriented axes are implemented");
      }
      this._registerToBroadcaster(this._scale, () => this._invalidateLayout());
    }

    private layoutHorizontallyWithoutBreakingWords(width: number, height: number) {

      /* return {
        fit: string[] the lines that fit
        unfit: string the text that didn't fit
      }
      fit.length = number of lines it would take
    } */
    return;
    }

    private layoutVerticallyWithoutBreakingWords(width: number, height: number) {
      /* return {
        fit: string[] the lines that fit
        unfit: string the text that didn't fit
      }
      */
    return;
    }

    private layoutHorizontallyWithBreakingWords(width: number, height: number) {

    return;
    }

    private layoutVerticallyWithBreakingWords(width: number, height: number) {

    return;
    }
  }
}

///<reference path="../reference.ts" />

module Plottable {
  export class CategoryAxis extends Component {
    private _scale: OrdinalScale;
    private orientation: string;
    private _height = 50;

    constructor(scale: OrdinalScale, orientation = "bottom") {
      super();
      this.classed("category-axis", true);
      this._scale = scale;
      if (orientation.toLowerCase() !== "bottom") {
        throw new Error("Only bottom-oriented axes are implemented");
      }
      if (scale.rangeType() !== "bands") {
        throw new Error("Only rangeBands category axes are implemented");
      }
      this._registerToBroadcaster(this._scale, () => this._invalidateLayout());
    }

    public height(newHeight: number) {
      this._height = newHeight;
      return this;
    }

    public _requestedSpace(offeredWidth: number, offeredHeight: number) {
      return {
        width: 0,
        height: Math.min(offeredHeight, this._height),
        wantsWidth: false,
        wantsHeight: offeredHeight < this._height
      };
    }

    public _doRender() {
      var bandWidth: number = this._scale.rangeBand();
      this._scale.domain().forEach((s: string) => {
        var bandStartPosition: number = this._scale.scale(s);
        TextUtils.drawTextToBox(s, bandStartPosition, 0, bandWidth, this._height);
      });
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

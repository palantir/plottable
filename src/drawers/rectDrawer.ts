///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  var LABEL_VERTICAL_PADDING = 5;
  var LABEL_HORIZONTAL_PADDING = 5;
  export class Rect extends Element {
    public _someLabelsTooWide = false;
    public _isVertical: boolean;
    private textArea: D3.Selection;
    private measurer: _Util.Text.TextMeasurer;

    constructor(key: string, isVertical: boolean) {
      super(key);
      this.svgElement("rect");
      this._isVertical = isVertical;
    }

    public setup(area: D3.Selection) {
      // need to put the bars in a seperate container so we can ensure that they don't cover labels
      super.setup(area.append("g").classed("bar-area", true));
      this.textArea = area.append("g").classed("bar-label-text-area", true);
      this.measurer = new _Util.Text.CachingCharacterMeasurer(this.textArea.append("text")).measure;
    }

    public removeLabels() {
      this.textArea.selectAll("g").remove();
    }

    public drawText(data: any[], attrToProjector: AttributeToProjector) {
      var labelTooWide: boolean[] = data.map((d, i) => {
        var text = attrToProjector["label"](d, i).toString();
        var w = attrToProjector["width"](d, i);
        var h = attrToProjector["height"](d, i);
        var x = attrToProjector["x"](d, i);
        var y = attrToProjector["y"](d, i);
        var positive = attrToProjector["positive"](d, i);
        var measurement = this.measurer(text);
        var color = attrToProjector["fill"](d, i);
        var dark = _Util.Color.contrast("white", color) * 1.6 < _Util.Color.contrast("black", color);
        var primary = this._isVertical ? h : w;
        var primarySpace = this._isVertical ? measurement.height : measurement.width;

        var secondaryAttrTextSpace = this._isVertical ? measurement.width : measurement.height;
        var secondaryAttrAvailableSpace = this._isVertical ? w : h;
        var tooWide = secondaryAttrTextSpace + 2 * LABEL_HORIZONTAL_PADDING > secondaryAttrAvailableSpace;
        if (measurement.height <= h && measurement.width <= w) {
          var offset = Math.min((primary - primarySpace) / 2, LABEL_VERTICAL_PADDING);
          if (!positive) {offset = offset * -1;}
          if (this._isVertical) {
            y += offset;
          } else {
            x += offset;
          }

          var g = this.textArea.append("g").attr("transform", "translate(" + x + "," + y + ")");
          var className = dark ? "dark-label" : "light-label";
          g.classed(className, true);
          var xAlign: string;
          var yAlign: string;
          if (this._isVertical) {
            xAlign = "center";
            yAlign = positive ? "top" : "bottom";
          } else {
            xAlign = positive ? "left" : "right";
            yAlign = "center";
          }
          _Util.Text.writeLineHorizontally(text, g, w, h, xAlign, yAlign);
        }
        return tooWide;
      });
      this._someLabelsTooWide = labelTooWide.some((d: boolean) => d);
    }
  }
}
}

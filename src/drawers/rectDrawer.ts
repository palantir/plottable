///<reference path="../reference.ts" />

module Plottable {
export module _Drawer {
  interface TextToDraw {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    positive: boolean;
    dark: boolean;
  }
  export class RectAndText extends Element {
    public _allLabelsFitOnSecondaryAttribute = true;
    public _isVertical = true;
    private textArea: D3.Selection;

    constructor(key: string) {
      super(key);
      this.svgElement("rect");
      console.log("got a RAT drawer");
    }

    public setup(area: D3.Selection) {
      // need to put the bars in a seperate container so we can ensure that they don't cover labels
      super.setup(area.append("g").classed("bar-area", true));
      this.textArea = area.append("g").classed("bar-label-text-area", true);
    }

    public draw(data: any[], drawSteps: DrawStep[]) {
      super.draw(data, drawSteps);
      this.textArea.selectAll("g").remove();
      var lastStepAttrToProjector = drawSteps[drawSteps.length - 1].attrToProjector;
      if (lastStepAttrToProjector["label"]) {
        console.log("found label");
        this.drawText(data, lastStepAttrToProjector);
      } else {
        console.log("didnt find label");
      }
    }

    public drawText(data: any[], attrToProjector: AttributeToProjector) {
      var measurer = _Util.Text.getTextMeasurer(this.textArea.append("text"));
      this._allLabelsFitOnSecondaryAttribute = true;
      var toDraw: TextToDraw[] = data.map((d, i) => {
        var text = attrToProjector["label"](d, i).toString();
        var w = attrToProjector["width"](d, i);
        var h = attrToProjector["height"](d, i);
        var x = attrToProjector["x"](d, i);
        var y = attrToProjector["y"](d, i);
        var positive = attrToProjector["positive"](d, i);
        var measurement = measurer(text);
        var color = attrToProjector["fill"](d, i);
        var dark = _Util.Color.contrast('white', color) * 1.6 < _Util.Color.contrast('black', color);
        var primary = this._isVertical ? h : w;
        var primarySpace = this._isVertical ? measurement.height : measurement.width;

        this._allLabelsFitOnSecondaryAttribute = this._allLabelsFitOnSecondaryAttribute &&
                                                                      (this._isVertical ? measurement.width <= w : measurement.height <= h);
        if (measurement.height <= h && measurement.width <= w) {
          var offset = Math.min((primary - primarySpace) / 2, 5);
          if (!positive) {offset = offset * -1;}
          if (this._isVertical) {
            y += offset;
          } else {
            x += offset;
          }
          return {x: x, y: y, width: w, height: h, text: text, positive: positive, dark: dark};
        } else {
          return null;
        }
      }).filter(d => !!d); // reject nulls
      if (this._allLabelsFitOnSecondaryAttribute) {
        toDraw.forEach((t) => {
          var g = this.textArea.append("g").attr("transform", "translate(" + t.x + "," + t.y + ")");
          var className = t.dark ? "dark-label" : "light-label";
          g.classed(className, true);
          var xAlign: string;
          var yAlign: string;
          if (this._isVertical) {
            xAlign = "center";
            yAlign = t.positive ? "top" : "bottom";
          } else {
            xAlign = t.positive ? "left" : "right";
            yAlign = "center";
          }
          _Util.Text.writeLineHorizontally(t.text, g, t.width, t.height, xAlign, yAlign);
        });
      }
    }
  }
}
}

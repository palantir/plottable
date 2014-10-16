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
  export class Rect extends AbstractDrawer {
    public _allLabelsFitOnSecondaryAttribute = true;
    public _this.isVertical = true;

    public draw(data: any[], attrToProjector: AttributeToProjector, animator = new Animator.Null()) {
      var svgElement = "rect";
      var dataElements = this._renderArea.selectAll(svgElement).data(data);

      dataElements.enter().append(svgElement);
      animator.animate(dataElements, attrToProjector);
      dataElements.exit().remove();
      if (attrToProjector["label"]) {
        this.drawText(data, attrToProjector);
      }
    }

    public removeText() {
      this._renderArea.select(".bar-label-text-area").remove();
    }

    public drawText(data: any[], attrToProjector: AttributeToProjector) {
      // HACKHACK #1109
      this._renderArea.select(".bar-label-text-area").remove();
      var textArea = this._renderArea.append("g").classed("bar-label-text-area", true);
      var measurer = _Util.Text.getTextMeasurer(textArea.append("text"));
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
        var primary = this.isVertical ? h : w;
        var primarySpace = this.isVertical ? measurement.height : measurement.width;

        this._allLabelsFitOnSecondaryAttribute = this._allLabelsFitOnSecondaryAttribute &&
                                                                      (this.isVertical ? measurement.width <= w : measurement.height <= h);
        if (measurement.height <= h && measurement.width <= w) {
          var offset = Math.min((primary - primarySpace) / 2, 5);
          if (!positive) {offset = offset * -1;}
          if (this.isVertical) {
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
          var g = textArea.append("g").attr("transform", "translate(" + t.x + "," + t.y + ")");
          var className = t.dark ? "dark-label" : "light-label";
          g.classed(className, true);
          var xAlign: string;
          var yAlign: string;
          if (this.isVertical) {
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

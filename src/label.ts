///<reference path="reference.ts" />

class Label extends Component {
  private static CSS_CLASS = "label";

  public xAlignment = "CENTER";
  public yAlignment = "CENTER";

  private textElement: D3.Selection;
  private text: string;
  private orientation: string;

  constructor(text: string, orientation = "horizontal") {
    super();
    this.classed(Label.CSS_CLASS, true);
    this.text = text;
    if (orientation === "horizontal" || orientation === "vertical-left" || orientation === "vertical-right") {
      this.orientation = orientation;
    } else {
      throw orientation + " is not a valid orientation for LabelComponent";
    }
  }

  public anchor(element: D3.Selection) {
    super.anchor(element);
    this.textElement = this.element.append("text").text(this.text);

    var bbox = Utils.getBBox(this.element);
    this.textElement.attr("dy", -bbox.y);
    var clientHeight = bbox.height;
    var clientWidth  = bbox.width;

    if (this.orientation === "horizontal") {
      this.rowMinimum(clientHeight);
      this.colMinimum(clientWidth);
    } else {
      this.colMinimum(clientHeight);
      this.rowMinimum(clientWidth);
      if (this.orientation === "vertical-right") {
        this.textElement.attr("transform", "rotate(90)").attr("y", -clientHeight);
      } else if (this.orientation === "vertical-left") {
        this.textElement.attr("transform", "rotate(-90)").attr("x", -clientWidth);
      }
    }
  }
}

class TitleLabel extends Label {
  private static CSS_CLASS = "title-label";
  constructor(text: string, orientation?: string) {
    super(text, orientation);
    this.classed(TitleLabel.CSS_CLASS, true);
  }
}

class AxisLabel extends Label {
  private static CSS_CLASS = "axis-label";
  constructor(text: string, orientation?: string) {
    super(text, orientation);
    this.classed(AxisLabel.CSS_CLASS, true);
  }
}

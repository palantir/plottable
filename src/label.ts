///<reference path="reference.ts" />

class Label extends Component {
  private static CSS_CLASS = "label";

  private textElement: D3.Selection;
  private text: string; // text assigned to the Label; may not be the actual text displayed due to truncation
  private orientation: string;
  private textLength: number;
  private textHeight: number;

  constructor(text = "", orientation = "horizontal") {
    super();
    this.classed(Label.CSS_CLASS, true);
    this.setText(text);
    if (orientation === "horizontal" || orientation === "vertical-left" || orientation === "vertical-right") {
      this.orientation = orientation;
    } else {
      throw new Error(orientation + " is not a valid orientation for LabelComponent");
    }
    this.xAlign("CENTER").yAlign("CENTER"); // the defaults
  }

  public anchor(element: D3.Selection) {
    super.anchor(element);
    this.textElement = this.element.append("text");
    this.setText(this.text);
    return this;
  }

  public setText(text: string) {
    this.text = text;
    if (this.element != null) {
      this.textElement.text(text);
      this.measureAndSetTextSize();
    }
  }

  private measureAndSetTextSize() {
    var bbox = Utils.getBBox(this.textElement);
    this.textHeight = bbox.height;
    this.textLength = bbox.width;
    if (this.orientation === "horizontal") {
      this.rowMinimum(this.textHeight);
    } else {
      this.colMinimum(this.textHeight);
    }
  }

  private truncateTextAndRemeasure(availableLength: number) {
    var shortText = Utils.truncateTextToLength(this.text, availableLength, this.textElement);
    this.textElement.text(shortText);
    this.measureAndSetTextSize();
  }

  public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
    super.computeLayout(xOffset, yOffset, availableWidth, availableHeight);

    this.textElement.attr("dy", 0); // Reset this so we maintain idempotence
    var bbox = Utils.getBBox(this.textElement);
    this.textElement.attr("dy", -bbox.y);

    var xShift = 0;
    var yShift = 0;

    if (this.orientation === "horizontal") {
      this.truncateTextAndRemeasure(this.availableWidth);
      xShift = (this.availableWidth  - this.textLength) * this.xAlignProportion;
    } else {
      this.truncateTextAndRemeasure(this.availableHeight);
      xShift = (this.availableHeight - this.textLength) * this.yAlignProportion;

      if (this.orientation === "vertical-right") {
        this.textElement.attr("transform", "rotate(90)");
        yShift = -this.textHeight;
      } else { // vertical-left
        this.textElement.attr("transform", "rotate(-90)");
        xShift = -xShift - this.textLength; // flip xShift
      }
    }

    this.textElement.attr("x", xShift);
    this.textElement.attr("y", yShift);
    return this;
  }
}

class TitleLabel extends Label {
  private static CSS_CLASS = "title-label";
  constructor(text?: string, orientation?: string) {
    super(text, orientation);
    this.classed(TitleLabel.CSS_CLASS, true);
  }
}

class AxisLabel extends Label {
  private static CSS_CLASS = "axis-label";
  constructor(text?: string, orientation?: string) {
    super(text, orientation);
    this.classed(AxisLabel.CSS_CLASS, true);
  }
}

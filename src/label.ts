///<reference path="reference.ts" />

class Label extends Component {
  private static CSS_CLASS = "label";

  public xAlignment = "CENTER";
  public yAlignment = "CENTER";

  private textElement: D3.Selection;
  private text: string; // text assigned to the element; may not be the actual text displaed due to truncation
  private displayText: string;
  private orientation: string;
  private textLength: number;
  private textHeight: number;

  constructor(text = "", orientation = "horizontal") {
    super();
    this.classed(Label.CSS_CLASS, true);
    this.text = text;
    if (orientation === "horizontal" || orientation === "vertical-left" || orientation === "vertical-right") {
      this.orientation = orientation;
    } else {
      throw new Error(orientation + " is not a valid orientation for LabelComponent");
    }
  }

  public anchor(element: D3.Selection) {
    super.anchor(element);
    this.textElement = this.element.append("text").text(this.text);
    this.setMinimumsByCalculatingTextSize();
    return this;
  }

  public setText(text: string) {
    this.text = text;
    this.textElement.text(text);
    this.setMinimumsByCalculatingTextSize();
  }

  private setMinimumsByCalculatingTextSize() {
    this.textElement.attr("dy", 0); // Reset this so we maintain idempotence
    var bbox = Utils.getBBox(this.textElement);
    this.textElement.attr("dy", -bbox.y);
    this.textHeight = bbox.height;
    this.textLength = bbox.width;

    // italic text needs a slightly larger bounding box
    if (this.textElement.style("font-style") === "italic") {
      var textNode = <SVGTextElement> this.textElement.node();
      // pad by half the width of the last character
      this.textLength += 0.5 * textNode.getExtentOfChar(textNode.textContent.length-1).width;
    }

    if (this.orientation === "horizontal") {
      this.rowMinimum(this.textHeight);
    } else {
      this.colMinimum(this.textHeight);
    }
  }

  private truncateTextToLength(availableLength: number) {
    this.textElement.text(this.text + "...");
    var textNode = <SVGTextElement> this.textElement.node();
    var numChars = textNode.textContent.length;
    var dotLength = textNode.getSubStringLength(numChars-3, 3);
    for (var i=0; i<numChars; i++) {
      var testLength = textNode.getSubStringLength(0, i);
      if ((testLength + dotLength) > availableLength) {
        if (i > 0) {
          this.textElement.text(this.text.substr(0, i-1).trim() + "...");
        } else {
          this.textElement.text(""); // no room even for ellipsis
        }
        this.setMinimumsByCalculatingTextSize();
        return;
      }
    }
  }

  public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
    super.computeLayout(xOffset, yOffset, availableWidth, availableHeight);

    var xShift = 0;
    var yShift = 0;

    if (this.orientation === "horizontal") {
      if (this.availableWidth < this.textLength) {
        this.truncateTextToLength(this.availableWidth);
      }
      switch (this.xAlignment) {
        case "LEFT":
          break;
        case "CENTER":
          xShift = (this.availableWidth - this.textLength) / 2;
          break;
        case "RIGHT":
          xShift = this.availableWidth - this.textLength;
          break;
        default:
          throw this.xAlignment + " is not a supported alignment";
      }
    } else {
      if (this.availableHeight < this.textLength) {
        this.truncateTextToLength(this.availableHeight);
      }
      switch (this.yAlignment) {
        case "TOP":
          break;
        case "CENTER":
          xShift = (this.availableHeight - this.textLength) / 2;
          break;
        case "BOTTOM":
          xShift = this.availableHeight - this.textLength;
          break;
        default:
          throw this.yAlignment + " is not a supported alignment";
      }

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

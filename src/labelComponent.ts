///<reference path="reference.ts" />

class LabelComponent extends Component {
  public CLASS_TEXT_LABEL = "text-label";

  public xAlignment = "CENTER";
  public yAlignment = "CENTER";

  private textElement: D3.Selection;
  private text:string;
  private orientation = "horizontal";

  constructor(text: string, orientation?: string) {
    super();
    this.classed(this.CLASS_TEXT_LABEL, true);
    this.text = text;
    if (orientation === "horizontal" || orientation === "vertical-left" || orientation === "vertical-right") {
      this.orientation = orientation;
    } else if (orientation != null) {
      throw new Error(orientation + " is not a valid orientation for LabelComponent");
    }
  }

  public anchor(element: D3.Selection) {
    super.anchor(element);
    this.textElement = this.element.append("text").text(this.text);

    var bbox = (<SVGGElement> this.textElement.node()).getBBox();
    this.textElement.attr("dy", -bbox.y);
    var clientHeight = bbox.height;
    var clientWidth = bbox.width;

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

class TitleLabel extends LabelComponent {
  public CLASS_TITLE_LABEL = "title-label";
  constructor(text: string, orientation?: string) {
    super(text, orientation);
    this.classed(this.CLASS_TITLE_LABEL, true);
  }
}

class AxisLabel extends LabelComponent {
  public CLASS_AXIS_LABEL = "axis-label";
  constructor(text: string, orientation?: string) {
    super(text, orientation);
    this.classed(this.CLASS_AXIS_LABEL, true);
  }
}

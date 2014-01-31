///<reference path="../lib/d3.d.ts" />

class LabelComponent extends Component {
  public CLASS_TEXT_LABEL = "text-label";
  public CLASS_TEXT_LABEL_VERTICAL = "text-label-vertical";

  public xAlignment = "CENTER";
  public yAlignment = "CENTER";

  private textElement: D3.Selection;
  private text:string;
  private textHeight = 0;
  private textWidth = 0;
  private isVertical = false;
  private rotationAngle = 0;
  private orientation = "horizontal";

  constructor(text: string, orientation?: string) {
    super();
    this.text = text;
    //this.rotationAngle = rotationAngle;
    if (orientation === "horizontal" || orientation === "vertical-left" || orientation === "vertical-right") {
      this.orientation = orientation;
    } else if (orientation != null) {
      throw new Error(orientation + " is not a valid orientation for LabelComponent");
    }
  }

  public rowWeight(): number;
  public rowWeight(newVal: number): Component;
  public rowWeight(newVal?: number): any {
    if (newVal != null) {
      throw new Error("Row weight cannot be set on Label.");
      return this;
    } else {
      return 0;
    }
  }

  public colWeight(): number;
  public colWeight(newVal: number): Component;
  public colWeight(newVal?: number): any {
    if (newVal != null) {
      throw new Error("Col weight cannot be set on Label.");
      return this;
    } else {
      return 0;
    }
  }

  public rowMinimum(): number;
  public rowMinimum(newVal: number): Component;
  public rowMinimum(newVal?: number): any {
    if (newVal != null) {
      throw new Error("Row minimum cannot be directly set on Label.");
      return this;
    } else {
      return this.textHeight;
    }
  }

  public colMinimum(): number;
  public colMinimum(newVal: number): Component;
  public colMinimum(newVal?: number): any {
    if (newVal != null) {
      throw new Error("Col minimum cannot be directly set on Label.");
      return this;
    } else {
      return this.textWidth;
    }
  }

  public anchor(element: D3.Selection) {
    super.anchor(element);
    this.textElement = this.element.append("text")
                        .classed(this.CLASS_TEXT_LABEL, true)
                        .attr("alignment-baseline", "middle")
                        .text(this.text);

    var clientHeight = this.textElement.node().clientHeight;
    var clientWidth = this.textElement.node().clientWidth;

    if (this.orientation === "horizontal") {
      this.textElement.attr("transform", "translate(0 " + clientHeight/2 + ")");
      this.textHeight = clientHeight;
      this.textWidth = clientWidth;
    } else {
      this.textWidth = clientHeight;
      this.textHeight = clientWidth;
      if (this.orientation === "vertical-right") {
        this.textElement.attr("transform", "rotate(90) translate(0 " + (-clientHeight/2) + ")");
      } else if (this.orientation === "vertical-left") {
        this.textElement.attr("transform", "rotate(-90) translate(" + (-clientWidth) + " " + clientHeight/2 + ")");
      }
    }
  }
}

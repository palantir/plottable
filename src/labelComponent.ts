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

  constructor(text: string, rotationAngle=0) {
    super();
    this.text = text;
    this.rotationAngle = rotationAngle;
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
    this.textElement.attr("transform", "rotate(" + this.rotationAngle + ")");
    var sinVal = Math.sin(this.rotationAngle * Math.PI / 180);
    var cosVal = Math.cos(this.rotationAngle * Math.PI / 180);

    // TODO: Clean up this shifty code
    var cosRotatedVal = Math.cos((this.rotationAngle + 45) * Math.PI / 180);
    var sinRotatedVal = Math.sin(2 * this.rotationAngle * Math.PI / 180);
    var yShift = cosRotatedVal;
    var xShift = sinRotatedVal/2;
    this.textElement.attr("y", yShift + "em");
    this.textElement.attr("x", xShift + "em");

    var clientHeight = this.textElement.node().clientHeight;
    var clientWidth = this.textElement.node().clientWidth;

    this.textHeight = Math.abs(cosVal * clientHeight) + Math.abs(sinVal * clientWidth);
    this.textWidth = Math.abs(sinVal * clientHeight) + Math.abs(cosVal * clientWidth);
  }
}

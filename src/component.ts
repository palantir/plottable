class Component {
  public element: D3.Selection;
  public hitBox: D3.Selection;
  public boundingBox: D3.Selection;

  private anchored = false;
  private laidOut = false;

  private rowWeightVal  = 0;
  private colWeightVal  = 0;
  private rowMinimumVal = 0;
  private colMinimumVal = 0;

  public availableWidth : number;
  public availableHeight: number;
  private xOffset       : number;
  private yOffset       : number;

  public anchor(element: D3.Selection) {
    this.element = element;
    this.hitBox = element.append("rect").classed("hit-box", true);
    this.boundingBox = element.append("rect").classed("bounding-box", true);
    this.anchored = true;
  }

  public computeLayout(xOffset?: number, yOffset?: number, availableWidth?: number, availableHeight?: number) {
    if (xOffset == null || yOffset == null || availableWidth == null || availableHeight == null) {
      if (this.laidOut) {
        return; // idempotent if called after initial layout
      } else if (this.anchored && this.element.node().nodeName === "svg") {
        // we are the root node, let's guess width and height for convenience
        xOffset = 0;
        yOffset = 0;
        availableWidth  = parseFloat(this.element.attr("width" ));
        availableHeight = parseFloat(this.element.attr("height"));
      } else if (!this.anchored) {
        throw new Error("It's impossible to computeLayout before anchoring");
      } else {
        throw new Error("You need to pass non-null arguments when calling computeLayout on a non-root node");
      }
    }
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.availableWidth = availableWidth;
    this.availableHeight = availableHeight;
    this.element.attr("transform", "translate(" + this.xOffset + "," + this.yOffset + ")");
    this.hitBox.attr("width", this.availableWidth).attr("height", this.availableHeight);
    this.boundingBox.attr("width", this.availableWidth).attr("height", this.availableHeight);
    this.laidOut = true;
  }

  public render() {
    if (!this.laidOut) {
      this.computeLayout()
    }
  }

  public zoom(translate, scale) {
    this.render(); // if not overwritten, a zoom event just causes the component to rerender
  }

  public rowWeight(): number;
  public rowWeight(newVal: number): Component;
  public rowWeight(newVal?: number): any {
    if (newVal != null) {
      this.rowWeightVal = newVal;
      chai.assert.operator(this.rowWeightVal, '>=', 0, "rowWeight is a reasonable number");
      this.laidOut = false;
      return this;
    } else {
      return this.rowWeightVal;
    }
  }

  public colWeight(): number;
  public colWeight(newVal: number): Component;
  public colWeight(newVal?: number): any {
    if (newVal != null) {
      this.colWeightVal = newVal;
      chai.assert.operator(this.colWeightVal, '>=', 0, "colWeight is a reasonable number");
      this.laidOut = false;
      return this;
    } else {
      return this.colWeightVal
    }
  }

  public rowMinimum(): number;
  public rowMinimum(newVal: number): Component;
  public rowMinimum(newVal?: number): any {
    if (newVal != null) {
      this.rowMinimumVal = newVal;
      chai.assert.operator(this.rowMinimumVal, '>=', 0, "rowMinimum is a reasonable number");
      this.laidOut = false;
      return this;
    } else {
      return this.rowMinimumVal;
    }
  }

  public colMinimum(): number;
  public colMinimum(newVal: number): Component;
  public colMinimum(newVal?: number): any {
    if (newVal != null) {
      this.colMinimumVal = newVal;
      chai.assert.operator(this.colMinimumVal, '>=', 0, "colMinimum is a reasonable number");
      this.laidOut = false;
      return this;
    } else {
      return this.colMinimumVal;
    }
  }
}

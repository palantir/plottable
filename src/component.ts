class Component {
  public element: D3.Selection;
  public hitBox: D3.Selection;
  public zoom(translate, scale) {
    //noop - hackhack to appease TSC
  }
  private rowWeightVal  = 0;
  private colWeightVal  = 0;
  private rowMinimumVal = 0;
  private colMinimumVal = 0;

  public availableWidth = 0;
  public availableHeight = 0;

  public anchor(element: D3.Selection) {
    this.element = element;
    this.hitBox = element.append("rect").classed("hit-box", true);
  }

  public computeLayout(xOffset: number, yOffset: number, availableWidth: number, availableHeight:number) {
    this.element.attr("transform", "translate(" + xOffset + "," + yOffset + ")");
    this.hitBox.attr("width", availableWidth).attr("height", availableHeight);
    this.availableWidth = availableWidth;
    this.availableHeight = availableHeight;
  }

  public render() {
    // no-op
  }

  public rowWeight(): number;
  public rowWeight(newVal: number): Component;
  public rowWeight(newVal?: number): any {
    if (newVal != null) {
      this.rowWeightVal = newVal;
      chai.assert.operator(this.rowWeightVal, '>=', 0, "rowWeight is a reasonable number");
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
      return this;
    } else {
      return this.colMinimumVal;
    }
  }
}

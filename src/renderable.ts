class Renderable {
  private rowWeightVal = 0;
  private colWeightVal = 0;
  private rowMinimumVal = 0;
  private colMinimumVal = 0;

  public render(element: D3.Selection, width: number, height: number) {
    // no-op
  }

  public rowWeight(): number;
  public rowWeight(newVal: number): Renderable;
  public rowWeight(newVal?: number): any {
    if (newVal != null) {
      this.rowWeightVal = newVal;
      return this;
    } else {
      return this.rowWeightVal;
    }
  }

  public colWeight(): number;
  public colWeight(newVal: number): Renderable;
  public colWeight(newVal?: number): any {
    if (newVal != null) {
      this.colWeightVal = newVal;
      return this;
    } else {
      return this.colWeightVal
    }
  }

  public rowMinimum(): number;
  public rowMinimum(newVal: number): Renderable;
  public rowMinimum(newVal?: number): any {
    if (newVal != null) {
      this.rowMinimumVal = newVal;
      return this;
    } else {
      return this.rowMinimumVal;
    }
  }

  public colMinimum(): number;
  public colMinimum(newVal: number): Renderable;
  public colMinimum(newVal?: number): any {
    if (newVal != null) {
      this.colMinimumVal = newVal;
      return this;
    } else {
      return this.colMinimumVal;
    }
  }

  public computeLayout() {
    // no-op
  }
}

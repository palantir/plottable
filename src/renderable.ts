class Renderable implements IRenderable {
  constructor(private rowWeight, private colWeight, private rowMinimum, private colMinimum) {

  }

  public rowWeight(newVal?: number) {
    if (newVal != null) {
      this.rowWeight = newVal;
    }
    return this.rowWeight;
  }

  public colWeight(newVal?: number) {
    if (newVal != null) {
      this.colWeight = newVal;
    }
    return this.colWeight;
  }

  public rowMinimum(){
    return this.rowMinimum;
  }

  public colMinimum(){
    return this.colMinimum;
  }


}

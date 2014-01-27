class Renderable implements IRenderable {
  public className: string;

  constructor(private rowWeight: number, private colWeight: number, private rowMinimum: number, private colMinimum: number) {

  }

  public rowWeight(newVal?: number): number {
    if (newVal != null) {
      this.rowWeight = newVal;
    }
    return this.rowWeight;
  }

  public colWeight(newVal?: number): number {
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

  public render(element: D3.Selection, width: number, height: number) {
    // no-op
  }


}

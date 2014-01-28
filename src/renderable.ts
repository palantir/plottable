class Renderable implements IRenderable {
  public render(element: D3.Selection, width: number, height: number) {
    // no-op
  }

  public rowWeight(newVal?: number) {
    return 0;
  }

  public colWeight(newVal?: number) {
    return 0;
  }

  public rowMinimum() {
    return 0;
  }

  public colMinimum() {
    return 0;
  }
}

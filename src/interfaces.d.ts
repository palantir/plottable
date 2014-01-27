interface IRenderable {
  render: (element: D3.Selection, width: number, height: number) => ();

  rowWeight: (newVal?: number) => number;
  colWeight: (newVal?: number) => number;
  rowMinimum: () => number;
  colMinimum: () => number;

}

interface IDatum {

}

interface IRenderer<T extends IDatum> implements IRendererable {

}

interface IRendererDraggable implements IRenderer {
  // how to reference the generic <T>? is there a need to?

}

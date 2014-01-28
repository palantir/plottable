interface IRenderable {
  render: (element: D3.Selection, width: number, height: number) => void;

  rowWeight: (newVal?: number) => number;
  colWeight: (newVal?: number) => number;
  rowMinimum: () => number;
  colMinimum: () => number;
  computeLayout?: () => void;
}

interface IDatum {
  x: number;
  y: number;
}

interface IDataset {
  data: IDatum[];
  seriesName: string;
}

// interface IRenderer<T extends IDatum> extends IRendererable {

// }

// interface IRendererDraggable extends IRenderer {
//   // how to reference the generic <T>? is there a need to?

// }

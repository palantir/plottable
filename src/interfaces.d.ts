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


interface IDataset {
  data: any[];
  seriesName: string;
}

interface XYSelectionArea {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

// interface IRenderer<T extends IDatum> extends IRendererable {

// }

// interface IRendererDraggable extends IRenderer {
//   // how to reference the generic <T>? is there a need to?

// }

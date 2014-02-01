
interface IDataset {
  data: any[];
  seriesName: string;
}

interface SelectionArea {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

interface FullSelectionArea {
  pixel: SelectionArea;
  data: SelectionArea;
}


interface IBroadcasterCallback {
  (broadcaster: IBroadcaster, ...args: any[]): any;
}

interface IBroadcaster {
  registerListener: (cb: IBroadcasterCallback) => IBroadcaster;
}

// interface IRenderer<T extends IDatum> extends IRendererable {

// }

// interface IRendererDraggable extends IRenderer {
//   // how to reference the generic <T>? is there a need to?

// }

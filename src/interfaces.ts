module Plottable {
  export interface IDataset {
    data: any[];
    seriesName: string;
  }

  export interface SelectionArea {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  }

  export interface FullSelectionArea {
    pixel: SelectionArea;
    data: SelectionArea;
  }


  export interface IBroadcasterCallback {
    (broadcaster: IBroadcaster, ...args: any[]): any;
  }

  export interface IBroadcaster {
    registerListener: (cb: IBroadcasterCallback) => IBroadcaster;
  }
}

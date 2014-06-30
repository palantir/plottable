module Plottable {
  export interface IDataset {
    data: any[];
    metadata: IMetadata;
  }

  export interface IMetadata {
    cssClass?: string;
    color?: string;
  }

  export interface IAccessor {
    (datum: any, index?: number, metadata?: any): any;
  };

  export interface IAppliedAccessor {
    (datum: any, index: number) : any;
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

  export interface ISpaceRequest {
    width: number;
    height: number;
    wantsWidth: boolean;
    wantsHeight: boolean;
  }

  export interface IPixelArea {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  }

  export interface IExtent {
    min: number;
    max: number;
  }
}

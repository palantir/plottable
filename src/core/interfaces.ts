module Plottable {
  /**
   * Accesses a specific datum property.
   */
  export interface Accessor<T> {
    (datum: any, index: number, dataset: Dataset): T;
  }

  /**
   * Retrieves scaled datum property.
   */
  export type _Projector = (datum: any, index: number, dataset: Dataset) => any;

  export type AppliedProjector = (datum: any, index: number) => any;

  /**
   * Defines a way how specific attribute needs be retrieved before rendering.
   */
  export type _Projection = {
    accessor: Accessor<any>;
    scale?: Scale<any, any>;
    attribute: string;
  }

  /**
   * A mapping from attributes ("x", "fill", etc.) to the functions that get
   * that information out of the data.
   */
  export type AttributeToProjector = { [attrToSet: string]: _Projector; };

  export type AttributeToAppliedProjector = { [attrToSet: string]: AppliedProjector; };

  export type SpaceRequest = {
    minWidth: number;
    minHeight: number;
  }

  export type Range = {
    min: number;
    max: number;
  }

  /**
   * A location in pixel-space.
   */
  export type Point = {
    x: number;
    y: number;
  }

  /**
   * The corners of a box.
   */
  export type Bounds = {
    topLeft: Point;
    bottomRight: Point;
  }
}

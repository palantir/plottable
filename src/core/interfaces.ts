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
  export type Projector = (datum: any, index: number, dataset: Dataset) => any;

  /**
   * A mapping from attributes ("x", "fill", etc.) to the functions that get
   * that information out of the data.
   */
  export type AttributeToProjector = { [attrToSet: string]: Projector; };

  /**
   * Mapping from attributes to functions that set them based on datum and index.
   */
  export type AttributeToAppliedProjector = { [attrToSet: string]: (datum: any, index: number) => any; };

  export type SpaceRequest = {
    minWidth: number;
    minHeight: number;
  };

  export type Range = {
    min: number;
    max: number;
  };

  /**
   * A location in pixel-space.
   */
  export type Point = {
    x: number;
    y: number;
  };

  /**
   * The corners of a box.
   */
  export type Bounds = {
    topLeft: Point;
    bottomRight: Point;
  };

  /**
   * An object representing a data-backed visual entity inside a Component.
   */
  export interface Entity<C extends Component> {
    datum: any;
    position: Point;
    selection: d3.Selection<any>;
    component: C;
  }
}

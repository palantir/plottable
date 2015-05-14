module Plottable {
  /**
   * Access specific datum property.
   */
  export type _Accessor = (datum: any, index?: number, dataset?: Dataset, plotMetadata?: Plots.PlotMetadata) => any;

  /**
   * Retrieves scaled datum property.
   */
  export type _Projector = (datum: any, index: number, dataset: Dataset, plotMetadata: Plots.PlotMetadata) => any;

  /**
   * Projector with dataset and plot metadata
   */
  export type AppliedProjector = (datum: any, index: number) => any;

  /**
   * Defines a way how specific attribute needs be retrieved before rendering.
   */
  export type _Projection = {
    accessor: _Accessor;
    scale?: Scale<any, any>;
    attribute: string;
  }

  /**
   * A mapping from attributes ("x", "fill", etc.) to the functions that get
   * that information out of the data.
   *
   * So if my data looks like `{foo: 5, bar: 6}` and I want the radius to scale
   * with both `foo` and `bar`, an entry in this type might be `{"r":
   * function(d) { return foo + bar; }`.
   */
  export type AttributeToProjector = { [attrToSet: string]: _Projector; };

  export type AttributeToAppliedProjector = { [attrToSet: string]: AppliedProjector; };

  export type SpaceRequest = {
    minWidth: number;
    minHeight: number;
  }

  /**
   * The range of your current data. For example, [1, 2, 6, -5] has the Extent
   * `{min: -5, max: 6}`.
   *
   * The point of this type is to hopefully replace the less-elegant `[min,
   * max]` extents produced by d3.
   */
  export type Extent = {
    min: number;
    max: number;
  }

  /**
   * A simple location on the screen.
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

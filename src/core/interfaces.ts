module Plottable {
  /**
   * Access specific datum property.
   */
  export type _Accessor = (datum: any, index?: number, userMetadata?: any, plotMetadata?: Plot.PlotMetadata) => any;

  /**
   * Retrieves scaled datum property.
   */
  export type _Projector = (datum: any, index: number, userMetadata: any, plotMetadata: Plot.PlotMetadata) => any;

  /**
   * Projector with applied user and plot metadata
   */
  export type _AppliedProjector = (datum: any, index: number) => any;

  /**
   * Defines a way how specific attribute needs be retrieved before rendering.
   */
  export interface _Projection {
    accessor: _Accessor;
    scale?: Scale.AbstractScale<any, any>;
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

  export type _AttributeToAppliedProjector = { [attrToSet: string]: _AppliedProjector; };

  /**
   * A simple bounding box.
   */
  export interface SelectionArea {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  }

  export interface _SpaceRequest {
    width: number;
    height: number;
    wantsWidth: boolean;
    wantsHeight: boolean;
  }

  export interface _PixelArea {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  }

  /**
   * The range of your current data. For example, [1, 2, 6, -5] has the Extent
   * `{min: -5, max: 6}`.
   *
   * The point of this type is to hopefully replace the less-elegant `[min,
   * max]` extents produced by d3.
   */
  export interface Extent {
    min: number;
    max: number;
  }

  /**
   * A simple location on the screen.
   */
  export interface Point {
    x: number;
    y: number;
  }
}

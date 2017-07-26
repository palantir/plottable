/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { Component } from "../components/component";
import { Dataset } from "./dataset";

export type SimpleSelection<Datum> = d3.Selection<d3.BaseType, Datum | {}, any, any>;

/**
 * Accesses a specific datum property. Users supply Accessors to their
 * plots' .x, .y, .attr, etc. functions.
 */
export interface IAccessor<T> {
  (datum: any, index: number, dataset: Dataset): T;
}

/**
 * Converts one range-like value to another. This is useful to, for example,
 * floor or ceiling a pixel coordinate after the scale has been applied.
 * Performing the a `Math.floor` inside the accessor is not advised since it
 * prevents the storage of the scale object for other features like nearest
 * entity location, computing extents, or deferred rendering.
 */
export interface IRangeProjector<T> {
  (value: T, datum: any, index: number, dataset: Dataset): T;
}

/**
 * Retrieves a scaled datum property.
 * Essentially passes the result of an Accessor through a Scale.
 * Projectors are exclusively built from Plot._scaledAccessor.
 */
export type Projector = (datum: any, index: number, dataset: Dataset) => any;

/**
 * A mapping from attributes ("x", "fill", etc.) to the functions that get
 * that information out of the data.
 */
export type AttributeToProjector = { [attr: string]: Projector; };

/**
 * A function that generates attribute values from the datum and index.
 * Essentially a Projector with a particular Dataset rolled in.
 */
export type AppliedProjector = (datum: any, index: number) => any;
/**
 * A mapping from attributes to the AppliedProjectors used to generate them.
 */
export type AttributeToAppliedProjector = { [attr: string]: AppliedProjector; };

/**
 * Space request used during layout negotiation.
 *
 * @member {number} minWidth The minimum acceptable width given the offered space.
 * @member {number} minHeight the minimum acceptable height given the offered space.
 */
export type SpaceRequest = {
  minWidth: number;
  minHeight: number;
};

/**
 * Min and max values for a particular property.
 */
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
 * Client bounds
 */
export interface IEntityBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * An object representing a data-backed visual entity inside a Component.
 */
export interface IEntity<C extends Component> {
  bounds: IEntityBounds;
  component: C;
  datum: any;
  position: Point;
  selection: SimpleSelection<any>;
}

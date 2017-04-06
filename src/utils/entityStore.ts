/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import { Point } from "../core/interfaces";

export interface IPositionedEntity {
  position: Point;
}

/**
 * EntityStore stores entities and makes them searchable. Valid entities must be
 * positioned in Cartesian space.
 */
export interface IEntityStore<T extends IPositionedEntity> {
  /**
   * Adds all of the supplied entities to the store
   *
   * @param {T[]} [entities] Entity array to add to the store. Entities must be
   * positionable
   */
  addAll(entities: T[]): void;

  /**
   * Returns closest entity to a given {Point}
   *
   * @param {Point} [point] Point around which to search for a closest entity
   * @param {(entity: T) => boolean} [filter] optional method that is called
   * while searching for the entity nearest a point. If the filter returns
   * false, the point is considered invalid and is not considered. If the filter
   * returns true, the point is considered valid and will be considered.
   * @returns {T} Will return the nearest entity or undefined if none are found
   */
  entityNearest(point: Point, filter?: (entity: T) => boolean): T;

  /**
   * Returns the current internal array of entities.
   *
   * @returns {T[]} the current internal array of entities.
   */
  entities(): T[];
}

/**
 * Implementation of {IEntityStore} that uses an array for easy iteration as
 * well as a quad tree for fast nearest-point queries.
 *
 * Note that if the position of your entities changes, you MUST rebuild the
 * entity store for the `entityNearest` method to work since the quadtree does
 * not know that its nodes have moved.
 */
export class EntityStore<T extends IPositionedEntity> implements IEntityStore<T> {
  private _entities: T[];
  private _tree: d3.Quadtree<T>;

  constructor() {
    this._entities = [];
    this._tree = d3.quadtree<T>()
      // int casting for faster computation. losing sub-pixel precision here is
      // of no concern.
      .x((d) => d.position.x | 0)
      .y((d) => d.position.y | 0);
  }

  public addAll(entities: T[]) {
    this._entities.push(...entities);
    this._tree.addAll(entities);
  }

  /**
   * Looks up the nearest data point using the internal quadtree.
   *
   * Note that for performance reasons, the optional filter is **DESTRUCTIVE**
   * and will remove any entities that it encounters during the search that do
   * not pass the filter.
   */
  public entityNearest(queryPoint: Point, filter?: (entity: T) => boolean) {
    const tree = this._tree;
    let nearest = tree.find(queryPoint.x, queryPoint.y);
    while (filter !== undefined && !filter(nearest)) {
      tree.remove(nearest);
      nearest = tree.find(queryPoint.x, queryPoint.y);
    }
    return nearest;
  }

  public entities() {
    return this._entities;
  }
}

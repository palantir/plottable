/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import { Bounds, IEntityBounds, Point } from "../core/interfaces";
import { RTree, RTreeBounds } from "./rTree";

export interface IPositionedEntity {
  position: Point;
}

/**
 * EntityStore stores entities and makes them searchable. Valid entities must be
 * positioned in Cartesian space.
 */
export interface IEntityStore<T extends IPositionedEntity> {
  /**
   * Adds all of the supplied entities to the store.
   *
   * If the optional bounds argument is provided, only entities within the
   * bounds will be available to `entityNearest` queries. Regardless, all
   * entities will be available with the `entities` method.
   *
   * @param {T[]} [entities] Entity array to add to the store. Entities must be
   * positionable
   * @param {Bounds} [bounds] Optionally add bounds filter for entityNearest
   * queries
   */
  addAll(entities: T[], entityBoundsFactory: (entity: T) => IEntityBounds, bounds?: Bounds): void;

  /**
   * Returns the entity closest to a given {Point}
   *
   * Note that if a {Bounds} was provided to the `addAll` method, entities
   * outside those bounds will not be returned by this method.
   *
   * @param {Point} [point] Point around which to search for a closest entity
   * @returns {T} Will return the nearest entity or undefined if none are found
   */
  entityNearest(point: Point): T;

  entitiesInBounds(bounds: IEntityBounds): T[];
  entitiesInXRange(bounds: IEntityBounds): T[];
  entitiesInYRange(bounds: IEntityBounds): T[];

  /**
   * Returns the current internal array of all entities.
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
  private _rtree: RTree<T>;

  constructor() {
    this._entities = [];
    this._rtree = new RTree<T>();
    this._tree = d3.quadtree<T>()
      // Flooring for faster computation. losing sub-pixel precision here is
      // of no concern.
      .x((d) => Math.floor(d.position.x))
      .y((d) => Math.floor(d.position.y));
  }

  public addAll(entities: T[], entityBoundsFactory: (entity: T) => IEntityBounds, bounds?: Bounds) {
    this._entities.push(...entities);

    // filter out of bounds entities if bounds is defined
    if (bounds !== undefined) {
      const filterBounds = RTreeBounds.bounds(bounds);
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        const entityBounds = RTreeBounds.entityBounds(entityBoundsFactory(entity));
        if (RTreeBounds.isBoundsOverlapBounds(filterBounds, entityBounds)) {
          this._tree.add(entity);
          this._rtree.insert(entityBounds, entity);
        }
      }
    } else {
      this._tree.addAll(entities);
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        const entityBounds = RTreeBounds.entityBounds(entityBoundsFactory(entity));
        this._rtree.insert(entityBounds, entity);
      }
    }
  }

  public entityNearest(queryPoint: Point) {
    return this._tree.find(queryPoint.x, queryPoint.y);
  }

  public entitiesInBounds(bounds: IEntityBounds) {
    return this._rtree.intersect(RTreeBounds.entityBounds(bounds));
  }

  public entitiesInXRange(bounds: IEntityBounds) {
    return this._rtree.intersectX(RTreeBounds.entityBounds(bounds));
  }

  public entitiesInYRange(bounds: IEntityBounds) {
    return this._rtree.intersectY(RTreeBounds.entityBounds(bounds));
  }

  public entities() {
    return this._entities;
  }
}

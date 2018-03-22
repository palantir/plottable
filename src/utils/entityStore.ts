/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

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
   * @param [entityBoundsFactory] A factory method for producing {IEntityBounds}
   * for each entity.
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

  /**
   * Returns the entity closest to a given {Point} in the x-dimension. Ties are
   * broken with a sort in the y-dimension.
   *
   * @param {Point} [point] Point around which to search for a closest entity
   * @returns {T} Will return the nearest entity or undefined if none are found
   */
  entityNearestX(point: Point): T;

  /**
   * Returns the entity closest to a given {Point} in the y-dimension. Ties are
   * broken with a sort in the x-dimension.
   *
   * @param {Point} [point] Point around which to search for a closest entity
   * @returns {T} Will return the nearest entity or undefined if none are found
   */
  entityNearestY(point: Point): T;

  /**
   * Returns the entites whose bounding boxes overlap the parameter.
   *
   * @param {IEntityBounds} [bounds] The query bounding box.
   */
  entitiesInBounds(bounds: IEntityBounds): T[];

  /**
   * Returns the entites whose bounding boxes overlap the parameter on the
   * x-axis.
   *
   * @param {IEntityBounds} [bounds] The query bounding box.
   */
  entitiesInXBounds(bounds: IEntityBounds): T[];

  /**
   * Returns the entites whose bounding boxes overlap the parameter on the
   * y-axis.
   *
   * @param {IEntityBounds} [bounds] The query bounding box.
   */
  entitiesInYBounds(bounds: IEntityBounds): T[];

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
  private _rtree: RTree<T>;

  constructor() {
    this._entities = [];
    this._rtree = new RTree<T>();
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
          this._rtree.insert(entityBounds, entity);
        }
      }
    } else {
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        const entityBounds = RTreeBounds.entityBounds(entityBoundsFactory(entity));
        this._rtree.insert(entityBounds, entity);
      }
    }
  }

  public entityNearest(queryPoint: Point) {
    return this._rtree.locateNearest(queryPoint).pop();
  }

  public entityNearestX(queryPoint: Point) {
    return this._rtree.locateNearestX(queryPoint).pop();
  }

  public entityNearestY(queryPoint: Point) {
    return this._rtree.locateNearestY(queryPoint).pop();
  }

  public entitiesInBounds(bounds: IEntityBounds) {
    return this._rtree.intersect(RTreeBounds.entityBounds(bounds));
  }

  public entitiesInXBounds(bounds: IEntityBounds) {
    return this._rtree.intersectX(RTreeBounds.entityBounds(bounds));
  }

  public entitiesInYBounds(bounds: IEntityBounds) {
    return this._rtree.intersectY(RTreeBounds.entityBounds(bounds));
  }

  public entities() {
    return this._entities;
  }
}

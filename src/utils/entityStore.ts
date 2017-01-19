namespace Plottable.Utils {

  /**
   * EntityStore stores entities and makes them searchable.
   * Valid entities must be positioned in Cartesian space.
   */
  export interface EntityStore<T extends PositionedEntity> {
    /**
     * Adds an entity to the store
     * @param {T} [entity] Entity to add to the store. Entity must be positionable
     */
    add(entity: T): void;
    /**
     * Returns closest entity to a given {Point}
     * @param {Point} [point] Point around which to search for a closest entity
     * @param {(entity: T) => boolean} [filter] optional method that is called while
     * searching for the entity nearest a point. If the filter returns false, the point
     * is considered invalid and is not considered. If the filter returns true, the point
     * is considered valid and will be considered.
     * @returns {T} Will return the nearest entity or undefined if none are found
     */
    entityNearest(point: Point, filter?: (entity: T) => boolean): T;
    /**
     * Iterator that loops through entities and returns a transformed array
     * @param {(value: T) => S} [callback] transformation function that is passed
     * passed an entity {T} and returns an object {S}.
     * @returns {S[]} The aggregate result of each call to the transformation function
     */
    map<S>(callback: (value: T) => S): S[];
  }

  export interface PositionedEntity {
    position: Point;
  }

  /**
   * Array-backed implementation of {EntityStore}
   */
  export class EntityArray<T extends PositionedEntity> implements EntityStore<T> {
    private _entities: T[];

    constructor() {
      this._entities = [];
    }

    public add(entity: T) {
      this._entities.push(entity);
    }

    /**
     * Iterates through array of of entities and computes the closest point using
     * the standard Euclidean distance formula.
     */
    public entityNearest(queryPoint: Point, filter?: (entity: T) => boolean) {
      let closestDistanceSquared = Infinity;
      let closestPointEntity: T;
      this._entities.forEach((entity) => {
        if (filter !== undefined && filter(entity) === false) {
          return;
        }

        let distanceSquared = Utils.Math.distanceSquared(entity.position, queryPoint);
        if (distanceSquared < closestDistanceSquared) {
          closestDistanceSquared = distanceSquared;
          closestPointEntity = entity;
        }
      });

      if (closestPointEntity === undefined) {
        return undefined;
      }

      return closestPointEntity;
    }

    public map<S>(callback: (value: T) => S) {
      return this._entities.map<S>((entity: T) => callback(entity));
    }
  }
}

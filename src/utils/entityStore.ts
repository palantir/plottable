/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Point } from "../core/interfaces";

import * as Math from "./mathUtils";

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
   * Iterator that loops through entities and returns a transformed array
   * @param {(value: T) => S} [callback] transformation function that is passed
   * passed an entity {T} and returns an object {S}.
   * @returns {S[]} The aggregate result of each call to the transformation function
   */
  map<S>(callback: (value: T) => S): S[];

  /**
   * Iterator that loops through entities calls the callback on each iteration.
   * @param {(value: T) => void} [callback] transformation function that is passed
   * passed an entity {T}.
   */
  forEach(callback: (value: T) => void): void;
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

  public map<S>(callback: (value: T) => S) {
    return this._entities.map<S>((entity: T) => callback(entity));
  }

  public forEach(callback: (value: T) => void) {
    return this._entities.forEach(callback);
  }
}

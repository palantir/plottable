/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { IComponent } from "../components";
import { Bounds, Point } from "../core/interfaces";


/**
 * @returns {Bounds} for the component in pixel space, where the topLeft
 * represents the component's minimum x and y values and the bottomRight represents
 * the component's maximum x and y values.
 */
export function bounds(component: IComponent<any>): Bounds {
  const topLeft = component.origin();

  return {
    topLeft,
    bottomRight: {
      x: topLeft.x + component.width(),
      y: topLeft.y + component.height()
    }
  };
}


/**
 * Gets the origin of the Component relative to the root
 *
 * @return {Point}
 */
export function originToRoot(component: IComponent<any>): Point {
  let origin = component.origin();
  let ancestor = component.parent();

  while (ancestor != null) {
    let ancestorOrigin = ancestor.origin();
    origin.x += ancestorOrigin.x;
    origin.y += ancestorOrigin.y;
    ancestor = ancestor.parent();
 }

 return origin;
}

/**
 * Gets the root component of the hierarchy. If the provided
 * component is the root, that component will be returned.
 *
 * @return {IComponent}
 */
export function root(component: IComponent<any>): IComponent<any> {
  let parent: IComponent<any> = component;

  while (parent.parent() != null) {
    parent = parent.parent();
  }

  return parent;
}

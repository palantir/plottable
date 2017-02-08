/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Set } from "./set";

/**
 * A set of callbacks which can be all invoked at once.
 * Each callback exists at most once in the set (based on reference equality).
 * All callbacks should have the same signature.
 */
export class CallbackSet<CB extends Function> extends Set<CB> {
  public callCallbacks(...args: any[]) {
    this.forEach((callback) => {
      callback.apply(this, args);
    });
    return this;
  }
}

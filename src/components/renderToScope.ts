/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

let depth = 0;
let pending: Array<() => void> = [];

/**
 * Runs a renderTo() call. Callbacks passed to afterRenderTo() during it run once the
 * outermost renderTo() returns or throws.
 */
export function runRenderTo<T>(render: () => T): T {
  depth++;
  try {
    return render();
  } finally {
    depth--;
    if (depth === 0) {
      const callbacks = pending;
      pending = [];
      callbacks.forEach((callback) => callback());
    }
  }
}

/**
 * Runs the callback after the current renderTo() call, or immediately outside of one.
 */
export function afterRenderTo(callback: () => void) {
  if (depth > 0) {
    pending.push(callback);
  } else {
    callback();
  }
}

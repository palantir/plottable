/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Component } from "../components/component";
import * as Utils from "../utils";

import { makeEnum } from "../utils/makeEnum";
import * as RenderPolicies from "./renderPolicy";

/**
 * The RenderController is responsible for enqueueing and synchronizing
 * layout and render calls for Components.
 *
 * Layout and render calls occur inside an animation callback
 * (window.requestAnimationFrame if available).
 *
 * RenderController.flush() immediately lays out and renders all Components currently enqueued.
 *
 * To always have immediate rendering (useful for debugging), call
 * ```typescript
 * Plottable.RenderController.setRenderPolicy(
 *   new Plottable.RenderPolicies.Immediate()
 * );
 * ```
 */
let _componentsNeedingRender = new Utils.Set<Component>();
let _componentsNeedingComputeLayout = new Utils.Set<Component>();
let _animationRequested = false;
let _isCurrentlyFlushing = false;
export const Policy = makeEnum(["immediate", "animationFrame", "timeout"]);
export type Policy = keyof typeof Policy;
let _renderPolicy: RenderPolicies.IRenderPolicy = new RenderPolicies.AnimationFrame();

export function renderPolicy(): RenderPolicies.IRenderPolicy;
export function renderPolicy(renderPolicy: Policy): void;
export function renderPolicy(renderPolicy?: Policy): any {
  if (renderPolicy == null) {
    return _renderPolicy;
  }
  switch (renderPolicy) {
    case Policy.immediate:
      _renderPolicy = new RenderPolicies.Immediate();
      break;
    case Policy.animationFrame:
      _renderPolicy = new RenderPolicies.AnimationFrame();
      break;
    case Policy.timeout:
      _renderPolicy = new RenderPolicies.Timeout();
      break;
    default:
      Utils.Window.warn("Unrecognized renderPolicy: " + renderPolicy);
  }
}

/**
 * Enqueues the Component for rendering.
 *
 * @param {Component} component
 */
export function registerToRender(component: Component) {
  if (_isCurrentlyFlushing) {
    Utils.Window.warn("Registered to render while other components are flushing: request may be ignored");
  }
  _componentsNeedingRender.add(component);
  requestRender();
}

/**
 * Enqueues the Component for layout and rendering.
 *
 * @param {Component} component
 */
export function registerToComputeLayoutAndRender(component: Component) {
  _componentsNeedingComputeLayout.add(component);
  _componentsNeedingRender.add(component);
  requestRender();
}

/**
 * Enqueues the Component for layout and rendering.
 *
 * @param {Component} component
 * @deprecated This method has been renamed to `RenderController.registerToComputeLayoutAndRender()`.
 */
export function registerToComputeLayout(component: Component) {
  registerToComputeLayoutAndRender(component);
}

function requestRender() {
  // Only run or enqueue flush on first request.
  if (!_animationRequested) {
    _animationRequested = true;
    _renderPolicy.render();
  }
}

/**
 * Renders all Components waiting to be rendered immediately
 * instead of waiting until the next frame. Flush is idempotent (given there are no intermediate registrations).
 *
 * Useful to call when debugging.
 */
export function flush() {
  if (_animationRequested) {
    // Layout
    _componentsNeedingComputeLayout.forEach((component: Component) => component.computeLayout());

    // Top level render; Containers will put their children in the toRender queue
    _componentsNeedingRender.forEach((component: Component) => component.render());

    _isCurrentlyFlushing = true;
    const failed = new Utils.Set<Component>();
    _componentsNeedingRender.forEach((component: Component) => {
      try {
        component.renderImmediately();
      } catch (err) {
        // throw error with timeout to avoid interrupting further renders
        window.setTimeout(() => {
          throw err;
        }, 0);
        failed.add(component);
      }
    });
    _componentsNeedingComputeLayout = new Utils.Set<Component>();
    _componentsNeedingRender = failed;
    _animationRequested = false;
    _isCurrentlyFlushing = false;
  }
}

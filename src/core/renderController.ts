import { IComponent } from "../components/component";
import * as Utils from "../utils";

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
let _componentsNeedingRender = new Utils.Set<IComponent<any>>();
let _componentsNeedingComputeLayout = new Utils.Set<IComponent<any>>();
let _animationRequested = false;
let _isCurrentlyFlushing = false;
export namespace Policy {
  export var IMMEDIATE = "immediate";
  export var ANIMATION_FRAME = "animationframe";
  export var TIMEOUT = "timeout";
}
let _renderPolicy: RenderPolicies.RenderPolicy = new RenderPolicies.AnimationFrame();

export function renderPolicy(): RenderPolicies.RenderPolicy;
export function renderPolicy(renderPolicy: string): void;
export function renderPolicy(renderPolicy?: string): any {
  if (renderPolicy == null) {
    return _renderPolicy;
  }
  switch (renderPolicy.toLowerCase()) {
    case Policy.IMMEDIATE:
      _renderPolicy = new RenderPolicies.Immediate();
      break;
    case Policy.ANIMATION_FRAME:
      _renderPolicy = new RenderPolicies.AnimationFrame();
      break;
    case Policy.TIMEOUT:
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
export function registerToRender(component: IComponent<any>) {
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
export function registerToComputeLayoutAndRender(component: IComponent<any>) {
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
export function registerToComputeLayout(component: IComponent<any>) {
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
    _componentsNeedingComputeLayout.forEach((component: IComponent<any>) => component.computeLayout());

    // Top level render; Containers will put their children in the toRender queue
    _componentsNeedingRender.forEach((component: IComponent<any>) => component.render());

    _isCurrentlyFlushing = true;
    let failed = new Utils.Set<IComponent<any>>();
    _componentsNeedingRender.forEach((component: IComponent<any>) => {
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
    _componentsNeedingComputeLayout = new Utils.Set<IComponent<any>>();
    _componentsNeedingRender = failed;
    _animationRequested = false;
    _isCurrentlyFlushing = false;
  }
}

/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import * as d3Ease from "d3-ease";

import { AttributeToAppliedProjector, SimpleSelection } from "../core/interfaces";
import { coerceExternalD3 } from "../utils/coerceD3";
import { Animator } from "./animator";

export type EaseFn = (normalizedTime: number) => number;

const EASE_NAME_MAPPING: { [name: string]: EaseFn } = {
  "linear": d3Ease.easeLinear,
  "quad": d3Ease.easeQuad,
  "quadIn": d3Ease.easeQuadIn,
  "quadOut": d3Ease.easeQuadOut,
  "quadInOut": d3Ease.easeQuadInOut,
  "cubic": d3Ease.easeCubic,
  "cubicIn": d3Ease.easeCubicIn,
  "cubicOut": d3Ease.easeCubicOut,
  "cubicInOut": d3Ease.easeCubicInOut,
  "poly": d3Ease.easePoly,
  "polyIn": d3Ease.easePolyIn,
  "polyOut": d3Ease.easePolyOut,
  "polyInOut": d3Ease.easePolyInOut,
  "sin": d3Ease.easeSin,
  "sinIn": d3Ease.easeSinIn,
  "sinOut": d3Ease.easeSinOut,
  "sinInOut": d3Ease.easeSinInOut,
  "exp": d3Ease.easeExp,
  "expIn": d3Ease.easeExpIn,
  "expOut": d3Ease.easeExpOut,
  "expInOut": d3Ease.easeExpInOut,
  "circle": d3Ease.easeCircle,
  "circleIn": d3Ease.easeCircleIn,
  "circleOut": d3Ease.easeCircleOut,
  "circleInOut": d3Ease.easeCircleInOut,
  "bounce": d3Ease.easeBounce,
  "bounceIn": d3Ease.easeBounceIn,
  "bounceOut": d3Ease.easeBounceOut,
  "bounceInOut": d3Ease.easeBounceInOut,
  "back": d3Ease.easeBack,
  "backIn": d3Ease.easeBackIn,
  "backOut": d3Ease.easeBackOut,
  "backInOut": d3Ease.easeBackInOut,
  "elastic": d3Ease.easeElastic,
  "elasticIn": d3Ease.easeElasticIn,
  "elasticOut": d3Ease.easeElasticOut,
  "elasticInOut": d3Ease.easeElasticInOut,
};

/**
 * Known ease types that animator's .ease() methods understand
 */
export type EaseName =
"linear" |
"quad" |
"quadIn" |
"quadOut" |
"quadInOut" |
"cubic" |
"cubicIn" |
"cubicOut" |
"cubicInOut" |
"poly" |
"polyIn" |
"polyOut" |
"polyInOut" |
"sin" |
"sinIn" |
"sinOut" |
"sinInOut" |
"exp" |
"expIn" |
"expOut" |
"expInOut" |
"circle" |
"circleIn" |
"circleOut" |
"circleInOut" |
"bounce" |
"bounceIn" |
"bounceOut" |
"bounceInOut" |
"back" |
"backIn" |
"backOut" |
"backInOut" |
"elastic" |
"elasticIn" |
"elasticOut" |
"elasticInOut";

/**
 * An Animator with easing and configurable durations and delays.
 */
export class Easing implements Animator {
  /**
   * The default starting delay of the animation in milliseconds
   */
  private static _DEFAULT_START_DELAY_MILLISECONDS = 0;
  /**
   * The default duration of one animation step in milliseconds
   */
  private static _DEFAULT_STEP_DURATION_MILLISECONDS = 300;
  /**
   * The default maximum start delay between each step of an animation
   */
  private static _DEFAULT_ITERATIVE_DELAY_MILLISECONDS = 15;
  /**
   * The default maximum total animation duration
   */
  private static _DEFAULT_MAX_TOTAL_DURATION_MILLISECONDS = Infinity;
  /**
   * The default easing of the animation
   */
  private static _DEFAULT_EASING_MODE: EaseName = "expOut";

  private _startDelay: number;
  private _stepDuration: number;
  private _stepDelay: number;
  private _maxTotalDuration: number;
  private _easingMode: EaseName | EaseFn;

  /**
   * Constructs the default animator
   *
   * @constructor
   */
  constructor() {
    this._startDelay = Easing._DEFAULT_START_DELAY_MILLISECONDS;
    this._stepDuration = Easing._DEFAULT_STEP_DURATION_MILLISECONDS;
    this._stepDelay = Easing._DEFAULT_ITERATIVE_DELAY_MILLISECONDS;
    this._maxTotalDuration = Easing._DEFAULT_MAX_TOTAL_DURATION_MILLISECONDS;
    this._easingMode = Easing._DEFAULT_EASING_MODE;
  }

  public totalTime(numberOfSteps: number) {
    let adjustedIterativeDelay = this._getAdjustedIterativeDelay(numberOfSteps);
    return this.startDelay() + adjustedIterativeDelay * (Math.max(numberOfSteps - 1, 0)) + this.stepDuration();
  }

  public animate(selection: SimpleSelection<any>, attrToAppliedProjector: AttributeToAppliedProjector): d3.Transition<any, any, any, any> {
    selection = coerceExternalD3(selection);
    let numberOfSteps = selection.size();
    let adjustedIterativeDelay = this._getAdjustedIterativeDelay(numberOfSteps);

    return selection.transition()
      .ease(this._getEaseFactory())
      .duration(this.stepDuration())
      .delay((d: any, i: number) => this.startDelay() + adjustedIterativeDelay * i)
      .attrs(attrToAppliedProjector);
  }

  /**
   * Gets the start delay of the animation in milliseconds.
   *
   * @returns {number} The current start delay.
   */
  public startDelay(): number;
  /**
   * Sets the start delay of the animation in milliseconds.
   *
   * @param {number} startDelay The start delay in milliseconds.
   * @returns {Easing} The calling Easing Animator.
   */
  public startDelay(startDelay: number): this;
  public startDelay(startDelay?: number): any {
    if (startDelay == null) {
      return this._startDelay;
    } else {
      this._startDelay = startDelay;
      return this;
    }
  }

  /**
   * Gets the duration of one animation step in milliseconds.
   *
   * @returns {number} The current duration.
   */
  public stepDuration(): number;
  /**
   * Sets the duration of one animation step in milliseconds.
   *
   * @param {number} stepDuration The duration in milliseconds.
   * @returns {Easing} The calling Easing Animator.
   */
  public stepDuration(stepDuration: number): this;
  public stepDuration(stepDuration?: number): any {
    if (stepDuration == null) {
      return Math.min(this._stepDuration, this._maxTotalDuration);
    } else {
      this._stepDuration = stepDuration;
      return this;
    }
  }

  /**
   * Gets the maximum start delay between animation steps in milliseconds.
   *
   * @returns {number} The current maximum iterative delay.
   */
  public stepDelay(): number;
  /**
   * Sets the maximum start delay between animation steps in milliseconds.
   *
   * @param {number} stepDelay The maximum iterative delay in milliseconds.
   * @returns {Easing} The calling Easing Animator.
   */
  public stepDelay(stepDelay: number): this;
  public stepDelay(stepDelay?: number): any {
    if (stepDelay == null) {
      return this._stepDelay;
    } else {
      this._stepDelay = stepDelay;
      return this;
    }
  }

  /**
   * Gets the maximum total animation duration constraint in milliseconds.
   *
   * If the animation time would exceed the specified time, the duration of each step
   * and the delay between each step will be reduced until the animation fits within
   * the specified time.
   *
   * @returns {number} The current maximum total animation duration.
   */
  public maxTotalDuration(): number;
  /**
   * Sets the maximum total animation duration constraint in miliseconds.
   *
   * If the animation time would exceed the specified time, the duration of each step
   * and the delay between each step will be reduced until the animation fits within
   * the specified time.
   *
   * @param {number} maxTotalDuration The maximum total animation duration in milliseconds.
   * @returns {Easing} The calling Easing Animator.
   */
  public maxTotalDuration(maxTotalDuration: number): this;
  public maxTotalDuration(maxTotalDuration?: number): any {
    if (maxTotalDuration == null) {
      return this._maxTotalDuration;
    } else {
      this._maxTotalDuration = maxTotalDuration;
      return this;
    }
  }

  /**
   * Gets the current easing mode of the animation.
   *
   * @returns {string} the current easing mode.
   */
  public easingMode(): EaseName | EaseFn;
  /**
   * Sets the easing mode of the animation.
   *
   * @param {string} easingMode The desired easing mode.
   * @returns {Easing} The calling Easing Animator.
   */
  public easingMode(easingMode: EaseName | EaseFn): this;
  public easingMode(easingMode?: EaseName | EaseFn): any {
    if (easingMode == null) {
      return this._easingMode;
    } else {
      this._easingMode = easingMode;
      return this;
    }
  }

  protected _getEaseFactory() {
    const ease = this.easingMode();
    if(typeof ease === "string") {
      const maybeEaseFunction = EASE_NAME_MAPPING[ease];
      if (maybeEaseFunction == null) {
        // oops; name is wrong - default to linear instead
        return EASE_NAME_MAPPING["linear"];
      } else {
        return maybeEaseFunction;
      }
    } else {
      return ease;
    }
  }

  /**
   * Adjust the iterative delay, such that it takes into account the maxTotalDuration constraint
   */
  private _getAdjustedIterativeDelay(numberOfSteps: number) {
    let stepStartTimeInterval = this.maxTotalDuration() - this.stepDuration();
    stepStartTimeInterval = Math.max(stepStartTimeInterval, 0);
    let maxPossibleIterativeDelay = stepStartTimeInterval / Math.max(numberOfSteps - 1, 1);
    return Math.min(this.stepDelay(), maxPossibleIterativeDelay);
  }
}

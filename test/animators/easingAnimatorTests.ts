import { assert } from "chai";

import * as Plottable from "../../src";

describe("Animators", () => {
  describe("EasingAnimator", () => {
    let animator: Plottable.Animators.Easing;

    beforeEach(() => {
      animator = new Plottable.Animators.Easing();
    });

    describe("getters and setters", () => {

      it("can get and set the start delay", () => {
        const adjustedStartDelay = animator.startDelay() + 10;
        assert.strictEqual(animator.startDelay(adjustedStartDelay), animator, "setter mode returns the Animator");
        assert.strictEqual(animator.startDelay(), adjustedStartDelay, "retrieved the set value");
      });

      it("can get and set the step duration", () => {
        const adjustedStepDuration = animator.stepDuration() + 10;
        assert.strictEqual(animator.stepDuration(adjustedStepDuration), animator, "setter mode returns the Animator");
        assert.strictEqual(animator.stepDuration(), adjustedStepDuration, "retrieved the set value");
      });

      it("can get and set the step delay", () => {
        const adjustedStepDelay = animator.stepDelay() + 10;
        assert.strictEqual(animator.stepDelay(adjustedStepDelay), animator, "setter mode returns the Animator");
        assert.strictEqual(animator.stepDelay(), adjustedStepDelay, "retrieved the set value");
      });

      it("can get and set the max total duration", () => {
        const setMaxTotalDuration = 10;
        assert.strictEqual(animator.maxTotalDuration(setMaxTotalDuration), animator, "setter mode returns the Animator");
        assert.strictEqual(animator.maxTotalDuration(), setMaxTotalDuration, "retrieved the set value");
      });

      it("can get and set the easing mode", () => {
        assert.strictEqual(animator.easingMode("bounce"), animator, "setter mode returns the Animator");
        assert.strictEqual(animator.easingMode(), "bounce", "retrieved the set value");
      });
    });

    describe("total time", () => {
      const NUM_STEPS = 10;

      it("includes start delay in the total time", () => {
        const startDelay = 123;
        animator.startDelay(startDelay);
        animator.stepDelay(0);
        animator.stepDuration(0);

        const expectedTotalTime = startDelay;
        assert.strictEqual(animator.totalTime(NUM_STEPS), expectedTotalTime, "total time includes start delay (when other values are 0)");
      });

      it("includes step delay in the total time", () => {
        animator.startDelay(0);
        const stepDelay = 123;
        animator.stepDelay(stepDelay);
        animator.stepDuration(0);

        const expectedTotalTime = (NUM_STEPS - 1) * stepDelay;
        assert.strictEqual(animator.totalTime(NUM_STEPS), expectedTotalTime, "total time increased by each delay between steps");
      });

      it("includes step duration in the total time", () => {
        animator.startDelay(0);
        animator.stepDelay(0);
        const stepDuration = 123;
        animator.stepDuration(stepDuration);

        const expectedTotalTime = stepDuration;
        assert.strictEqual(animator.totalTime(NUM_STEPS), expectedTotalTime, "total time increased by one step duration");
      });
    });

    describe("max total duration", () => {
      const EPSILON = 0.0000001; // floating-point errors

      const NUM_STEPS = 10;
      const ORIGINAL_STEP_DELAY = 100;
      const ORIGINAL_STEP_DURATION = 100;
      let totalTimeLimit: number;

      beforeEach(() => {
        animator.stepDelay(ORIGINAL_STEP_DELAY);
        animator.stepDuration(ORIGINAL_STEP_DURATION);
        totalTimeLimit = animator.totalTime(NUM_STEPS);

        animator.maxTotalDuration(totalTimeLimit);
      });

      it("restricts the total time when the number of steps increases", () => {
        const moreStepsTotalTime = animator.totalTime(2 * NUM_STEPS);
        assert.closeTo(moreStepsTotalTime, totalTimeLimit, EPSILON,
          "adding more steps does not increase the total time past the limit");
      });

      it("restricts the total time when the step delay increases", () => {
        animator.stepDelay(2 * ORIGINAL_STEP_DELAY);
        const longerStepDelayTotalTime = animator.totalTime(NUM_STEPS);
        assert.closeTo(longerStepDelayTotalTime, totalTimeLimit, EPSILON,
          "increasing step delay does not increase the total time past the limit");
      });

      it("restricts the total time when the step duration increases", () => {
        animator.stepDuration(2 * ORIGINAL_STEP_DURATION);
        const longerStepDurationTotalTime = animator.totalTime(NUM_STEPS);
        assert.closeTo(longerStepDurationTotalTime, totalTimeLimit, EPSILON,
          "increasing step duration does not increase the total time past the limit");
      });

      it("allows the start delay to increase the total time", () => {
        const originalTotalTime = animator.totalTime(NUM_STEPS);

        animator.startDelay(100);
        const totalTimeWithStartDelay = animator.totalTime(NUM_STEPS);
        const expectedTotalTime = animator.startDelay() + originalTotalTime;
        assert.closeTo(totalTimeWithStartDelay, expectedTotalTime, EPSILON,
          "start delay is added on to the max total duration");
      });
    });
  });
});

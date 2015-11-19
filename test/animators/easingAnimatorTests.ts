///<reference path="../testReference.ts" />

describe("Animators", () => {
  describe("EasingAnimator", () => {
    describe("getters and setters", () => {
      let animator: Plottable.Animators.Easing;

      beforeEach(() => {
        animator = new Plottable.Animators.Easing();
      });

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
        const setEasingMode = "test-easing";
        assert.strictEqual(animator.easingMode(setEasingMode), animator, "setter mode returns the Animator");
        assert.strictEqual(animator.easingMode(), setEasingMode, "retrieved the set value");
      });
    });

    describe("Time computations", () => {
      it("totalTime() defaults", () => {
        const iterationSteps = 10;
        const startDelay = 0;
        const stepDuration = 300;
        const stepDelay = 15;
        const expectedTotalTime = startDelay + (iterationSteps - 1) * stepDelay + stepDuration;

        const animator = new Plottable.Animators.Easing();
        const actualTotalTime = animator.totalTime(iterationSteps);

        assert.strictEqual(actualTotalTime, expectedTotalTime,
          "Formula for calculating total time should work");
      });

      it("totalTime() takes setters into account", () => {
        const iterationSteps = 17;
        const startDelay = 135;
        const stepDuration = 453;
        const stepDelay = 265;
        const expectedTotalTime = startDelay + (iterationSteps - 1) * stepDelay + stepDuration;

        const animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);

        const actualTotalTime = animator.totalTime(iterationSteps);
        assert.strictEqual(actualTotalTime, expectedTotalTime,
          "Setters should work");
      });

      it("maxTotalDuration() with many steps", () => {
        const iterationSteps = 10000;
        const startDelay = 0;
        const stepDuration = 100;
        const stepDelay = 1000;
        const expectedTotalTime = 2000;

        const animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);
        animator.maxTotalDuration(expectedTotalTime);

        const actualTotalTime = animator.totalTime(iterationSteps);
        assert.strictEqual(actualTotalTime, expectedTotalTime,
          "Animation should not exceed the maxTotalDuration time constraint when presented with lots of iteration steps");
      });

      it("maxTotalDuration() long steps", () => {
        const iterationSteps = 2;
        const startDelay = 0;
        const stepDuration = 10000;
        const stepDelay = 100;
        const expectedTotalTime = 2000;

        const animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);
        animator.maxTotalDuration(expectedTotalTime);

        const actualTotalTime = animator.totalTime(iterationSteps);
        assert.strictEqual(actualTotalTime, expectedTotalTime,
          "Animation should not exceed the maxTotalDuration time constraint when step duration set too high");
      });

      it("maxTotalDuration() is just a constraint", () => {
        const iterationSteps = 2;
        const startDelay = 0;
        const stepDuration = 100;
        const stepDelay = 100;
        const maxTotalDuration = 5000;

        const expectedTotalTime = 200;

        const animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);
        animator.maxTotalDuration(maxTotalDuration);

        const actualTotalTime = animator.totalTime(iterationSteps);
        assert.strictEqual(actualTotalTime, expectedTotalTime,
          "The total duration constraint is just an upper bound");
      });

      it("maxTotalDuration() edge case for 1 step", () => {
        const iterationSteps = 1;
        const startDelay = 0;
        const stepDuration = 333;
        const stepDelay = 432;

        const animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);

        const actualTotalTime = animator.totalTime(iterationSteps);
        assert.strictEqual(actualTotalTime, stepDuration,
          "The total time is just the time for one step");
      });

      it("maxTotalDuration() edge case for 1 step and startDelay", () => {
        const iterationSteps = 1;
        const startDelay = 213;
        const stepDuration = 333;
        const stepDelay = 432;

        const expectedTotalTime = startDelay + stepDuration;

        const animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);

        const actualTotalTime = animator.totalTime(iterationSteps);
        assert.strictEqual(actualTotalTime, expectedTotalTime,
          "Total time is the time for one step, plus waiting for the start delay");
      });

      it("_getAdjustedIterativeDelay() works with maxTotalDuration constraint", () => {
        const iterationSteps = 2;
        const startDelay = 0;
        const stepDuration = 1000;
        const stepDelay = 1000000;
        const maxTotalDuration = 1500;

        const animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);
        animator.maxTotalDuration(maxTotalDuration);

        const expectedIterativeDelay = 500;
        // 1 |  ###########
        // 2 |       ###########
        //   +------------------------
        //   |  |    |    |    |    |
        //     0.0  0.5  1.0  1.5  2.0
        const actualIterativeDelay = (<any>animator)._getAdjustedIterativeDelay(iterationSteps);
        assert.strictEqual(actualIterativeDelay, expectedIterativeDelay,
          "The total duration constraint is just an upper bound");
      });

    });
  });
});

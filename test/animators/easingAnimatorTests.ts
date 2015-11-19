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
        let iterationSteps = 10;
        let startDelay = 0;
        let stepDuration = 300;
        let stepDelay = 15;
        let expectedTotalTime = startDelay + (iterationSteps - 1) * stepDelay + stepDuration;

        let animator = new Plottable.Animators.Easing();
        let actualTotalTime = animator.totalTime(iterationSteps);

        assert.strictEqual(actualTotalTime, expectedTotalTime,
          "Formula for calculating total time should work");
      });

      it("totalTime() takes setters into account", () => {
        let iterationSteps = 17;
        let startDelay = 135;
        let stepDuration = 453;
        let stepDelay = 265;
        let expectedTotalTime = startDelay + (iterationSteps - 1) * stepDelay + stepDuration;

        let animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);

        let actualTotalTime = animator.totalTime(iterationSteps);
        assert.strictEqual(actualTotalTime, expectedTotalTime,
          "Setters should work");
      });

      it("maxTotalDuration() with many steps", () => {
        let iterationSteps = 10000;
        let startDelay = 0;
        let stepDuration = 100;
        let stepDelay = 1000;
        let expectedTotalTime = 2000;

        let animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);
        animator.maxTotalDuration(expectedTotalTime);

        let actualTotalTime = animator.totalTime(iterationSteps);
        assert.strictEqual(actualTotalTime, expectedTotalTime,
          "Animation should not exceed the maxTotalDuration time constraint when presented with lots of iteration steps");
      });

      it("maxTotalDuration() long steps", () => {
        let iterationSteps = 2;
        let startDelay = 0;
        let stepDuration = 10000;
        let stepDelay = 100;
        let expectedTotalTime = 2000;

        let animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);
        animator.maxTotalDuration(expectedTotalTime);

        let actualTotalTime = animator.totalTime(iterationSteps);
        assert.strictEqual(actualTotalTime, expectedTotalTime,
          "Animation should not exceed the maxTotalDuration time constraint when step duration set too high");
      });

      it("maxTotalDuration() is just a constraint", () => {
        let iterationSteps = 2;
        let startDelay = 0;
        let stepDuration = 100;
        let stepDelay = 100;
        let maxTotalDuration = 5000;

        let expectedTotalTime = 200;

        let animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);
        animator.maxTotalDuration(maxTotalDuration);

        let actualTotalTime = animator.totalTime(iterationSteps);
        assert.strictEqual(actualTotalTime, expectedTotalTime,
          "The total duration constraint is just an upper bound");
      });

      it("maxTotalDuration() edge case for 1 step", () => {
        let iterationSteps = 1;
        let startDelay = 0;
        let stepDuration = 333;
        let stepDelay = 432;

        let animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);

        let actualTotalTime = animator.totalTime(iterationSteps);
        assert.strictEqual(actualTotalTime, stepDuration,
          "The total time is just the time for one step");
      });

      it("maxTotalDuration() edge case for 1 step and startDelay", () => {
        let iterationSteps = 1;
        let startDelay = 213;
        let stepDuration = 333;
        let stepDelay = 432;

        let expectedTotalTime = startDelay + stepDuration;

        let animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);

        let actualTotalTime = animator.totalTime(iterationSteps);
        assert.strictEqual(actualTotalTime, expectedTotalTime,
          "Total time is the time for one step, plus waiting for the start delay");
      });

      it("_getAdjustedIterativeDelay() works with maxTotalDuration constraint", () => {
        let iterationSteps = 2;
        let startDelay = 0;
        let stepDuration = 1000;
        let stepDelay = 1000000;
        let maxTotalDuration = 1500;

        let animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);
        animator.maxTotalDuration(maxTotalDuration);

        let expectedIterativeDelay = 500;
        // 1 |  ###########
        // 2 |       ###########
        //   +------------------------
        //   |  |    |    |    |    |
        //     0.0  0.5  1.0  1.5  2.0
        let actualIterativeDelay = (<any>animator)._getAdjustedIterativeDelay(iterationSteps);
        assert.strictEqual(actualIterativeDelay, expectedIterativeDelay,
          "The total duration constraint is just an upper bound");
      });

    });
  });
});

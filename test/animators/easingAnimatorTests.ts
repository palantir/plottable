///<reference path="../testReference.ts" />

describe("Animators", () => {
  describe("EasingAnimator", () => {
    describe("Time computations", () => {

      it("totalTime() defaults", () => {
        var iterationSteps = 10;
        var startDelay = 0;
        var stepDuration = 300;
        var stepDelay = 15;
        var expectedTotalTime = startDelay + (iterationSteps - 1) * stepDelay + stepDuration;

        var animator = new Plottable.Animators.Easing();
        var actualTotalTime = animator.totalTime(iterationSteps);

        assert.strictEqual(actualTotalTime, expectedTotalTime,
          "Formula for calculating total time should work");
      });

      it("totalTime() takes setters into account", () => {
        var iterationSteps = 17;
        var startDelay = 135;
        var stepDuration = 453;
        var stepDelay = 265;
        var expectedTotalTime = startDelay + (iterationSteps - 1) * stepDelay + stepDuration;

        var animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);

        var actualTotalTime = animator.totalTime(iterationSteps);
        assert.strictEqual(actualTotalTime, expectedTotalTime,
          "Setters should work");
      });

      it("maxTotalDuration() with many steps", () => {
        var iterationSteps = 10000;
        var startDelay = 0;
        var stepDuration = 100;
        var stepDelay = 1000;
        var expectedTotalTime = 2000;

        var animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);
        animator.maxTotalDuration(expectedTotalTime);

        var actualTotalTime = animator.totalTime(iterationSteps);
        assert.strictEqual(actualTotalTime, expectedTotalTime,
          "Animation should not exceed the maxTotalDuration time constraint when presented with lots of iteration steps");
      });

      it("maxTotalDuration() long steps", () => {
        var iterationSteps = 2;
        var startDelay = 0;
        var stepDuration = 10000;
        var stepDelay = 100;
        var expectedTotalTime = 2000;

        var animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);
        animator.maxTotalDuration(expectedTotalTime);

        var actualTotalTime = animator.totalTime(iterationSteps);
        assert.strictEqual(actualTotalTime, expectedTotalTime,
          "Animation should not exceed the maxTotalDuration time constraint when step duration set too high");
      });

      it("maxTotalDuration() is just a constraint", () => {
        var iterationSteps = 2;
        var startDelay = 0;
        var stepDuration = 100;
        var stepDelay = 100;
        var maxTotalDuration = 5000;

        var expectedTotalTime = 200;

        var animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);
        animator.maxTotalDuration(maxTotalDuration);

        var actualTotalTime = animator.totalTime(iterationSteps);
        assert.strictEqual(actualTotalTime, expectedTotalTime,
          "The total duration constraint is just an upper bound");
      });

      it("maxTotalDuration() edge case for 1 step", () => {
        var iterationSteps = 1;
        var startDelay = 0;
        var stepDuration = 333;
        var stepDelay = 432;

        var animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);

        var actualTotalTime = animator.totalTime(iterationSteps);
        assert.strictEqual(actualTotalTime, stepDuration,
          "The total time is just the time for one step");
      });

      it("maxTotalDuration() edge case for 1 step and startDelay", () => {
        var iterationSteps = 1;
        var startDelay = 213;
        var stepDuration = 333;
        var stepDelay = 432;

        var expectedTotalTime = startDelay + stepDuration;

        var animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);

        var actualTotalTime = animator.totalTime(iterationSteps);
        assert.strictEqual(actualTotalTime, expectedTotalTime,
          "Total time is the time for one step, plus waiting for the start delay");
      });

      it("_getAdjustedIterativeDelay() works with maxTotalDuration constraint", () => {
        var iterationSteps = 2;
        var startDelay = 0;
        var stepDuration = 1000;
        var stepDelay = 1000000;
        var maxTotalDuration = 1500;

        var animator = new Plottable.Animators.Easing();
        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);
        animator.maxTotalDuration(maxTotalDuration);

        var expectedIterativeDelay = 500;
        // 1 |  ###########
        // 2 |       ###########
        //   +------------------------
        //   |  |    |    |    |    |
        //     0.0  0.5  1.0  1.5  2.0
        var actualIterativeDelay = (<any>animator)._getAdjustedIterativeDelay(iterationSteps);
        assert.strictEqual(actualIterativeDelay, expectedIterativeDelay,
          "The total duration constraint is just an upper bound");
      });

    });
  });
});

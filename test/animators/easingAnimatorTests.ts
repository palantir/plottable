///<reference path="../testReference.ts" />

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
        const setEasingMode = "test-easing";
        assert.strictEqual(animator.easingMode(setEasingMode), animator, "setter mode returns the Animator");
        assert.strictEqual(animator.easingMode(), setEasingMode, "retrieved the set value");
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
      it("maxTotalDuration() with many steps", () => {
        const iterationSteps = 10000;
        const startDelay = 0;
        const stepDuration = 100;
        const stepDelay = 1000;
        const expectedTotalTime = 2000;

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

        animator.startDelay(startDelay);
        animator.stepDuration(stepDuration);
        animator.stepDelay(stepDelay);
        animator.maxTotalDuration(maxTotalDuration);

        const actualTotalTime = animator.totalTime(iterationSteps);
        assert.strictEqual(actualTotalTime, expectedTotalTime,
          "The total duration constraint is just an upper bound");
      });

      it("_getAdjustedIterativeDelay() works with maxTotalDuration constraint", () => {
        const iterationSteps = 2;
        const startDelay = 0;
        const stepDuration = 1000;
        const stepDelay = 1000000;
        const maxTotalDuration = 1500;

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

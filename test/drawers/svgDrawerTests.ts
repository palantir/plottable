import { assert } from "chai";
import * as d3 from "d3";

import { SVGDrawer } from "../../src/drawers/svgDrawer";
import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("SVGDrawers", () => {
  describe("SVGDrawer", () => {
    const ELEMENT_NAME = "mock";
    const CSS_CLASS_NAME = "mock-css";

    let drawer: SVGDrawer;
    let svg: d3.Selection<SVGElement, any, any, any>;
    beforeEach(() => {
      drawer = new SVGDrawer(ELEMENT_NAME, CSS_CLASS_NAME);
      svg = TestMethods.generateSVG();
    });

    afterEach(function () {
      if (this.currentTest.state === "passed") {
        svg.remove();
      }
    });

    it("returns its element name as a selector", () => {
      assert.strictEqual(drawer.selector(), ELEMENT_NAME);
    });

    describe("drawing and retrieving elements", () => {
      const data = ["A", "B", "C"];
      const propertyName = "property";

      beforeEach(() => {
        let invocationCount = 0;
        const validatingProjector = (datum: any, index: number) => {
          assert.strictEqual(datum, data[invocationCount], "projector was passed the correct datum");
          assert.strictEqual(index, invocationCount, "projector was passed the correct index");
          invocationCount++;
          return datum;
        };
        const attrToAppliedProjector: Plottable.AttributeToAppliedProjector = {};
        attrToAppliedProjector[propertyName] = validatingProjector;
        const drawSteps = [
          {
            attrToAppliedProjector: attrToAppliedProjector,
            animator: new Plottable.Animators.Null(),
          },
        ];
        drawer.draw(svg, data, drawSteps);
      });

      it("draws elements accoding to a specified DrawStep", () => {
        const drawn = svg.selectAll<Element, any>(ELEMENT_NAME);
        assert.strictEqual(drawn.size(), data.length, "created one element per datum");
        drawn.each(function (datum, index) {
          const element = d3.select(this);
          assert.strictEqual(element.attr(propertyName), data[index], "property was set correctly");
          assert.isTrue(element.classed(CSS_CLASS_NAME), "element carries the correct CSS class");
        });
      });

      it("can retrieve a selection containing elements it drew", () => {
        const selection = drawer.selection();
        assert.strictEqual(selection.size(), data.length, "retrieved one element per datum");
        const drawn = svg.selectAll<Element, any>(ELEMENT_NAME);
        assert.deepEqual(selection.node(), drawn.node(), "retrieved all elements it drew");
      });

      it("can retrieve the selection for a particular index", () => {
        const selection = drawer.selection();
        data.forEach((datum, index) => {
          const selectionForIndex = drawer.getVisualPrimitiveAtIndex(index);
          assert.strictEqual(selectionForIndex.node(), selection.nodes()[index], `retrieves the correct selection for index ${index}`);
        });
      });
    });

    describe("animation timings", () => {
      class MockAnimator implements Plottable.Animator {
        private _time: number;
        private _callback: Function;

        constructor(time: number, callback?: Function) {
          this._time = time;
          this._callback = callback;
        }

        public totalTime(numberOfIterations: number) {
          return this._time;
        }

        public animate(selection: any, attrToProjector: Plottable.AttributeToProjector): any {
          if (this._callback) {
            this._callback();
          }
          return selection;
        }
      }

      let oldTimeout: any;
      let timings: number[];

      before(() => {
        oldTimeout = Plottable.Utils.Window.setTimeout;
        Plottable.Utils.Window.setTimeout = function (f: Function, time: number, ...args: any[]) {
          timings.push(time);
          return oldTimeout(f, time, args);
        };
      });

      after(() => {
        Plottable.Utils.Window.setTimeout = oldTimeout;
      });

      beforeEach(() => {
        timings = [];
      });

      it("computes the correct timings for Null Animators", () => {
        const a1 = new Plottable.Animators.Null();
        const a2 = new Plottable.Animators.Null();
        const ds1: Plottable.Drawers.AppliedDrawStep = { attrToAppliedProjector: {}, animator: a1 };
        const ds2: Plottable.Drawers.AppliedDrawStep = { attrToAppliedProjector: {}, animator: a2 };
        const steps = [ds1, ds2];
        drawer.draw(svg, [], steps);
        assert.deepEqual(timings, [0, 0], "setTimeout called twice with 0 time both times");
      });

      it("computes the correct timings for non-Null Animators", (done) => {
        let callback1Called = false;
        const callback1 = () => {
          callback1Called = true;
        };
        const animator1Time = 20;
        const a1 = new MockAnimator(animator1Time, callback1);
        const ds1: Plottable.Drawers.AppliedDrawStep = { attrToAppliedProjector: {}, animator: a1 };

        let callback2Called = false;
        const callback2 = () => {
          assert.isTrue(callback1Called, "callback2 called after callback 1");
          callback2Called = true;
        };
        const animator2Time = 10;
        const a2 = new MockAnimator(animator2Time, callback2);
        const ds2: Plottable.Drawers.AppliedDrawStep = { attrToAppliedProjector: {}, animator: a2 };

        const callback3 = () => {
          assert.isTrue(callback2Called, "callback3 called after callback 2");
          done();
        };
        const animator3Time = 0;
        const a3 = new MockAnimator(animator3Time, callback3);
        const ds3: Plottable.Drawers.AppliedDrawStep = { attrToAppliedProjector: {}, animator: a3 };

        const steps = [ds1, ds2, ds3];
        drawer.draw(svg, [], steps);

        const expectedTimings = [0, animator1Time, animator1Time + animator2Time];
        assert.deepEqual(timings, expectedTimings, "setTimeout called with appropriate times");
      });
    });
  });
});

///<reference path="../testReference.ts" />

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

function createMockDrawer(dataset: Plottable.Dataset) {
  let drawer = new Plottable.Drawer(dataset);
  (<any> drawer)._svgElementName = "circle";
  return drawer;
}

describe("Drawers", () => {
  describe("Drawer", () => {
    class MockDrawer extends Plottable.Drawer {
      public static ELEMENT_NAME = "mock";

      constructor(dataset: Plottable.Dataset) {
        super(dataset);
        this._svgElementName = MockDrawer.ELEMENT_NAME;
      }
    }

   let drawer: MockDrawer;
   let dataset: Plottable.Dataset;
   beforeEach(() => {
     dataset = new Plottable.Dataset();
     drawer = new MockDrawer(dataset);
   });

    it("returns its element name as a selector", () => {
      assert.strictEqual(drawer.selector(), MockDrawer.ELEMENT_NAME);
    });

    it("can set and get its renderArea", () => {
      const svg = TestMethods.generateSVG();
      assert.strictEqual(drawer.renderArea(svg), drawer, "setter mode returns the calling Drawer");
      assert.strictEqual(drawer.renderArea(), svg, "getter mode returns the selection");
      svg.remove();
    });

    it("can remove its renderArea", () => {
      const svg = TestMethods.generateSVG();
      drawer.renderArea(svg);
      drawer.remove();
      assert.isFalse(document.body.contains(<any> svg.node()), "renderArea was removed from the DOM");
    });

    it("correctly computes the total draw time", () => {
      function makeFixedTimeAnimator(totalTime: number) {
        return <Plottable.Animator> {
          animate: () => null,
          totalTime: () => totalTime
        };
      }

      const animationTimes = [10, 20];
      const drawSteps = animationTimes.map((time) => {
        return {
          attrToProjector: <Plottable.AttributeToProjector> {},
          animator: makeFixedTimeAnimator(time)
        };
      });
      const totalTime = drawer.totalDrawTime([], drawSteps);
      const expectedTotalTime = d3.sum(animationTimes);
      assert.strictEqual(totalTime, expectedTotalTime, "returned the total time taken by all Animators");
    });

    it("draws elements accoding to a specified drawStep", () => {
      const svg = TestMethods.generateSVG();
      const data = ["A", "B", "C"];
      const propertyName = "property";
      const attrToProjector: Plottable.AttributeToProjector = {};
      attrToProjector[propertyName] = (datum: any) => datum;
      const drawSteps = [
        {
          attrToProjector: attrToProjector,
          animator: new Plottable.Animators.Null()
        }
      ];
      drawer.renderArea(svg);
      drawer.draw(data, drawSteps);

      const drawn = svg.selectAll(MockDrawer.ELEMENT_NAME);
      assert.strictEqual(drawn.size(), data.length, "created one element per datum");
      drawn.each(function(datum, index) {
        const element = d3.select(this);
        assert.strictEqual(element.attr(propertyName), data[index], "property was set correctly");
      });
      svg.remove();
    });

    it("can retrieve a selection containing elements it drew", () => {
      const svg = TestMethods.generateSVG();
      const data = ["A", "B", "C"];
      const attrToProjector: Plottable.AttributeToProjector = {};
      const drawSteps = [
        {
          attrToProjector: attrToProjector,
          animator: new Plottable.Animators.Null()
        }
      ];
      drawer.renderArea(svg);
      drawer.draw(data, drawSteps);

      const selection = drawer.selection();
      assert.strictEqual(selection.size(), data.length, "retrieved one element per datum");
      const drawn = svg.selectAll(MockDrawer.ELEMENT_NAME);
      assert.deepEqual(selection[0], drawn[0], "retrieved all elements it drew");
      svg.remove();
    });
  });

  describe("Abstract Drawer", () => {
    let oldTimeout: any;
    let timings: number[] = [];
    let svg: d3.Selection<void>;
    let drawer: Plottable.Drawer;
    before(() => {
      oldTimeout = Plottable.Utils.Window.setTimeout;
      Plottable.Utils.Window.setTimeout = function(f: Function, time: number, ...args: any[]) {
        timings.push(time);
        return oldTimeout(f, time, args);
      };
    });

    after(() => {
      Plottable.Utils.Window.setTimeout = oldTimeout;
    });

    beforeEach(() => {
      timings = [];
      svg = TestMethods.generateSVG();
      drawer = createMockDrawer(null);
      drawer.renderArea(svg);
    });

    afterEach(() => {
      svg.remove(); // no point keeping it around since we don't draw anything in it anyway
    });

    it("drawer timing works as expected for null animators", () => {
      let a1 = new Plottable.Animators.Null();
      let a2 = new Plottable.Animators.Null();
      let ds1: Plottable.Drawers.DrawStep = {attrToProjector: {}, animator: a1};
      let ds2: Plottable.Drawers.DrawStep = {attrToProjector: {}, animator: a2};
      let steps = [ds1, ds2];
      drawer.draw([], steps);
      assert.deepEqual(timings, [0, 0], "setTimeout called twice with 0 time both times");
    });

    it("drawer timing works for non-null animators", (done) => {
      let callback1Called = false;
      let callback2Called = false;
      let callback1 = () => {
        callback1Called = true;
      };
      let callback2 = () => {
        assert.isTrue(callback1Called, "callback2 called after callback 1");
        callback2Called = true;
      };
      let callback3 = () => {
        assert.isTrue(callback2Called, "callback3 called after callback 2");
        done();
      };
      let a1 = new MockAnimator(20, callback1);
      let a2 = new MockAnimator(10, callback2);
      let a3 = new MockAnimator(0, callback3);
      let ds1: Plottable.Drawers.DrawStep = {attrToProjector: {}, animator: a1};
      let ds2: Plottable.Drawers.DrawStep = {attrToProjector: {}, animator: a2};
      let ds3: Plottable.Drawers.DrawStep = {attrToProjector: {}, animator: a3};
      let steps = [ds1, ds2, ds3];
      drawer.draw([], steps);
      assert.deepEqual(timings, [0, 20, 30], "setTimeout called with appropriate times");
    });

    it("selectionForIndex()", () => {
      let svg = TestMethods.generateSVG(300, 300);
      let drawer = createMockDrawer(null);
      drawer.renderArea(svg.append("g"));
      drawer.selector = () => "circle";
      let data = [{one: 2, two: 1}, {one: 33, two: 21}, {one: 11, two: 10}];
      let circles = drawer.renderArea().selectAll("circle").data(data);
      circles.enter().append("circle").attr("cx", (datum: any) => datum.one).attr("cy", (datum: any) => datum.two).attr("r", 10);
      let selection = drawer.selectionForIndex(1);
      assert.strictEqual(selection.node(), circles[0][1], "correct selection gotten");
      svg.remove();
    });
  });
});

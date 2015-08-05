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
  const drawer = new Plottable.Drawer(dataset);
  (<any> drawer)._svgElementName = "circle";
  return drawer;
}

describe("Drawers", () => {
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
      const a1 = new Plottable.Animators.Null();
      const a2 = new Plottable.Animators.Null();
      const ds1: Plottable.Drawers.DrawStep = {attrToProjector: {}, animator: a1};
      const ds2: Plottable.Drawers.DrawStep = {attrToProjector: {}, animator: a2};
      const steps = [ds1, ds2];
      drawer.draw([], steps);
      assert.deepEqual(timings, [0, 0], "setTimeout called twice with 0 time both times");
    });

    it("drawer timing works for non-null animators", (done) => {
      let callback1Called = false;
      let callback2Called = false;
      const callback1 = () => {
        callback1Called = true;
      };
      const callback2 = () => {
        assert.isTrue(callback1Called, "callback2 called after callback 1");
        callback2Called = true;
      };
      const callback3 = () => {
        assert.isTrue(callback2Called, "callback3 called after callback 2");
        done();
      };
      const a1 = new MockAnimator(20, callback1);
      const a2 = new MockAnimator(10, callback2);
      const a3 = new MockAnimator(0, callback3);
      const ds1: Plottable.Drawers.DrawStep = {attrToProjector: {}, animator: a1};
      const ds2: Plottable.Drawers.DrawStep = {attrToProjector: {}, animator: a2};
      const ds3: Plottable.Drawers.DrawStep = {attrToProjector: {}, animator: a3};
      const steps = [ds1, ds2, ds3];
      drawer.draw([], steps);
      assert.deepEqual(timings, [0, 20, 30], "setTimeout called with appropriate times");
    });

    it("selectionForIndex()", () => {
      const svg = TestMethods.generateSVG(300, 300);
      const drawer = createMockDrawer(null);
      drawer.renderArea(svg.append("g"));
      drawer.selector = () => "circle";
      const data = [{one: 2, two: 1}, {one: 33, two: 21}, {one: 11, two: 10}];
      const circles = drawer.renderArea().selectAll("circle").data(data);
      circles.enter().append("circle").attr("cx", (datum: any) => datum.one).attr("cy", (datum: any) => datum.two).attr("r", 10);
      const selection = drawer.selectionForIndex(1);
      assert.strictEqual(selection.node(), circles[0][1], "correct selection gotten");
      svg.remove();
    });

    it("totalDrawTime()", () => {
      const svg = TestMethods.generateSVG(300, 300);
      const drawer = createMockDrawer(null);

      const dataObjects = 9;
      const stepDuration = 987;
      const stepDelay = 133;
      const startDelay = 245;

      const expectedAnimationDuration = startDelay + (dataObjects - 1) * stepDelay + stepDuration;

      const data = Plottable.Utils.Array.createFilledArray({}, dataObjects);

      const attrToProjector: Plottable.AttributeToProjector = null;

      const animator = new Plottable.Animators.Easing();
      animator.maxTotalDuration(Infinity);
      animator.stepDuration(stepDuration);
      animator.stepDelay(stepDelay);
      animator.startDelay(startDelay);

      const mockDrawStep = [{attrToProjector: attrToProjector, animator: animator}];

      const drawTime = drawer.totalDrawTime(data, mockDrawStep);

      assert.strictEqual(drawTime, expectedAnimationDuration, "Total Draw time");

      svg.remove();

    });
  });
});

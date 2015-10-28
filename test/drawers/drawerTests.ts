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
  public animateJoin(joinResult: Plottable.Drawers.JoinResult
    , attrToProjector: Plottable.AttributeToProjector, drawer: Plottable.Drawer): void {
    if (this._callback) {
      this._callback(joinResult, attrToProjector, drawer);
    }
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

    it("totalDrawTime()", () => {
      let svg = TestMethods.generateSVG(300, 300);
      let drawer = createMockDrawer(null);

      let dataObjects = 9;
      let stepDuration = 987;
      let stepDelay = 133;
      let startDelay = 245;

      let expectedAnimationDuration = startDelay + (dataObjects - 1) * stepDelay + stepDuration;

      let data = Plottable.Utils.Array.createFilledArray({}, dataObjects);

      let attrToProjector: Plottable.AttributeToProjector = null;

      let animator = new Plottable.Animators.Easing();
      animator.maxTotalDuration(Infinity);
      animator.stepDuration(stepDuration);
      animator.stepDelay(stepDelay);
      animator.startDelay(startDelay);

      let mockDrawStep = [{attrToProjector: attrToProjector, animator: animator}];

      let drawTime = drawer.totalDrawTime(data, mockDrawStep);

      assert.strictEqual(drawTime, expectedAnimationDuration, "Total Draw time");

      svg.remove();

    });
  });
});

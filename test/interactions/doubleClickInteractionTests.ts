///<reference path="../testReference.ts" />

describe("DoubleClick Interaction", () => {
  let clickedPoint: Plottable.Point;
  let svg: d3.Selection<void>;
  let doubleClickInteraction: Plottable.Interactions.DoubleClick;
  let component: Plottable.Component;

  beforeEach(() => {
    const svgWidth = 400;
    const svgHeight = 400;
    svg = TestMethods.generateSVG(svgWidth, svgHeight);
    component = new Plottable.Component();
    component.renderTo(svg);

    doubleClickInteraction = new Plottable.Interactions.DoubleClick();
    doubleClickInteraction.attachTo(component);

    clickedPoint = {x: svgWidth / 2, y: svgHeight / 2};
  });

  afterEach(function() {
    if (this.currentTest.state === "passed") {
      svg.remove();
    }
  });

  describe("onDoubleClick/offDoubleClick", () => {
    describe("registration", () => {
      it("registers callback using onDoubleClick", () => {
        const callback = new TestClickCallback();
        const call = () => callback.call();

        doubleClickInteraction.onDoubleClick(call);
        doubleClickPoint();

        assert.isTrue(callback.getCalled(), "Interaction should trigger the callback");
      });

      it("unregisters callback using offDoubleClick", () => {
        const callback = new TestClickCallback();
        const call = () => callback.call();

        doubleClickInteraction.onDoubleClick(call);
        doubleClickInteraction.offDoubleClick(call);
        doubleClickPoint();

        assert.isFalse(callback.getCalled(), "Callback should be disconnected from the interaction");
      });

      it("can register multiple onDoubleClick callbacks", () => {
        const callback1 = new TestClickCallback();
        const call1 = () => callback1.call();

        const callback2 = new TestClickCallback();
        const call2 = () => callback2.call();

        doubleClickInteraction.onDoubleClick(call1);
        doubleClickInteraction.onDoubleClick(call2);
        doubleClickPoint();

        assert.isTrue(callback1.getCalled(), "Interaction should trigger the first callback");
        assert.isTrue(callback2.getCalled(), "Interaction should trigger the second callback");
      });

      it("can register multiple onDoubleClick callbacks and unregister one", () => {
        const callback1 = new TestClickCallback();
        const call1 = () => callback1.call();

        const callback2 = new TestClickCallback();
        const call2 = () => callback2.call();

        doubleClickInteraction.onDoubleClick(call1);
        doubleClickInteraction.onDoubleClick(call2);
        doubleClickInteraction.offDoubleClick(call1);
        doubleClickPoint();

        assert.isFalse(callback1.getCalled(), "Callback1 should be disconnected from the click interaction");
        assert.isTrue(callback2.getCalled(), "Callback2 should still exist on the click interaction");
      });

      it("onDoubleClick returns this", () => {
        const value = doubleClickInteraction.onDoubleClick();
        assert.strictEqual(value, doubleClickInteraction);
      });

      it("offDoubleClick returns this", () => {
        const value = doubleClickInteraction.offDoubleClick();
        assert.strictEqual(value, doubleClickInteraction);
      });
    });

    describe("callbacks", () => {
      let callback: TestClickCallback;

      beforeEach(() => {
        callback = new TestClickCallback();
        doubleClickInteraction.onDoubleClick((point: Plottable.Point) => callback.call(point));
      });

      [TestMethods.InteractionMode.Mouse, TestMethods.InteractionMode.Touch].forEach((mode: TestMethods.InteractionMode) => {
        it("calls callback and passes correct click position for " + TestMethods.InteractionMode[mode], () => {
          doubleClickPoint(mode);

          assert.deepEqual(callback.getLastPoint(), clickedPoint, "was passed correct point");
        });

        it("does not call callback if clicked in different locations for " + TestMethods.InteractionMode[mode], () => {
          doubleClickPointWithMove(clickedPoint, {x: clickedPoint.x + 10, y: clickedPoint.y + 10}, mode);

          assert.isFalse(callback.getCalled(), "callback was not called");
        });
      });

      it("does not trigger callback when touch event is cancelled", () => {
        let doubleClickedPoint: Plottable.Point = null;
        let dblClickCallback = (point: Plottable.Point) => doubleClickedPoint = point;
        doubleClickInteraction.onDoubleClick(dblClickCallback);

        TestMethods.triggerFakeTouchEvent("touchstart", component.content(), [{x: clickedPoint.x, y: clickedPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchend", component.content(), [{x: clickedPoint.x, y: clickedPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchstart", component.content(), [{x: clickedPoint.x, y: clickedPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchend", component.content(), [{x: clickedPoint.x, y: clickedPoint.y}]);
        TestMethods.triggerFakeTouchEvent("touchcancel", component.content(), [{x: clickedPoint.x, y: clickedPoint.y}]);
        TestMethods.triggerFakeMouseEvent("dblclick", component.content(), clickedPoint.x, clickedPoint.y);
        assert.deepEqual(doubleClickedPoint, null, "point never set");
      });
    });
  });

  class TestClickCallback {
    private called: boolean;
    private lastPoint: Plottable.Point;

    constructor() {
      this.called = false;
    }

    public call(point?: Plottable.Point) {
      this.called = true;
      this.lastPoint = point;
    }

    public getCalled() {
      return this.called;
    }

    public getLastPoint() {
      return this.lastPoint;
    }
  }

  function doubleClickPoint(mode: TestMethods.InteractionMode = TestMethods.InteractionMode.Mouse) {
    doubleClickPointWithMove(clickedPoint, clickedPoint, mode);
  }

  function doubleClickPointWithMove(firstClickPoint: Plottable.Point,
                                    secondClickPoint: Plottable.Point,
                                    mode: TestMethods.InteractionMode) {
    TestMethods.triggerFakeInteractionEvent(mode,
                                            TestMethods.InteractionType.Start,
                                            component.content(),
                                            firstClickPoint.x,
                                            firstClickPoint.y);
    TestMethods.triggerFakeInteractionEvent(mode,
                                            TestMethods.InteractionType.End,
                                            component.content(),
                                            firstClickPoint.x,
                                            firstClickPoint.y);
    TestMethods.triggerFakeInteractionEvent(mode,
                                            TestMethods.InteractionType.Start,
                                            component.content(),
                                            secondClickPoint.x,
                                            secondClickPoint.y);
    TestMethods.triggerFakeInteractionEvent(mode,
                                            TestMethods.InteractionType.End,
                                            component.content(),
                                            secondClickPoint.x,
                                            secondClickPoint.y);
    TestMethods.triggerFakeMouseEvent("dblclick", component.content(), secondClickPoint.x, secondClickPoint.y);
  }
});

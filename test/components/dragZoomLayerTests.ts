///<reference path="../testReference.ts" />

describe("Interactive Components", () => {
  describe("DragZoomLayer", () => {
    let SVG_WIDTH = 400;
    let SVG_HEIGHT = 400;

    let svg: d3.Selection<void>;
    let target: d3.Selection<void>;
    let dzl: Plottable.Components.DragZoomLayer;
    let quarterPoint: Plottable.Point;
    let halfPoint: Plottable.Point;
    let xScale: Plottable.Scales.Linear;
    let yScale: Plottable.Scales.Linear;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);

      xScale = new Plottable.Scales.Linear();
      yScale = new Plottable.Scales.Linear();
      xScale.domain([0, 1]);
      yScale.domain([0, 1]);
      xScale.range([0, SVG_WIDTH]);
      yScale.range([SVG_HEIGHT, 0]);

      dzl = new Plottable.Components.DragZoomLayer(xScale, yScale);
      dzl.animationTime(0);
      dzl.renderTo(svg);
      target = dzl.background();

      quarterPoint = {
        x: SVG_WIDTH / 4,
        y: SVG_HEIGHT / 4
      };
      halfPoint = {
        x: SVG_WIDTH / 2,
        y: SVG_HEIGHT / 2
      };
    });

    it("zooms on drag", () => {
      TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
      assert.deepEqual(xScale.domain(), [0.25, 0.5]);
      assert.deepEqual(yScale.domain(), [0.5, 0.75]);
      svg.remove();
    });

    it("zooms on drag, unzooms on double click", () => {
      TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
      doubleClick(target, halfPoint);
      assert.deepEqual(xScale.domain(), [0, 1], "x zoomed back out to origin");
      assert.deepEqual(yScale.domain(), [0, 1], "y zoomed back out to origin");
      svg.remove();
    });

    it("zooms sequentially", () => {
      TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
      TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
      assert.deepEqual(xScale.domain(), [0.3125, 0.375]);
      assert.deepEqual(yScale.domain(), [0.625, 0.6875]);
      svg.remove();
    });

    it("double click undoes sequential zooms", () => {
      TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
      TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
      TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
      doubleClick(target, halfPoint);
      assert.deepEqual(xScale.domain(), [0, 1], "x zoomed back out to origin");
      assert.deepEqual(yScale.domain(), [0, 1], "y zoomed back out to origin");
      svg.remove();
    });

    it("interpolates if animation time is not zero", (done) => {
      // Implicitly verifies that the interpolated zoom eventually reaches the right
      // domain, otherwise this test would timeout.
      dzl.animationTime(30);
      let interpolations = 0;
      let step = () => {
        interpolations++;
        let domain = xScale.domain();
        if (domain[0] === 0.25 && domain[1] === 0.5) {
          assert.operator(interpolations, ">", 1, "multiple interpolation steps occured");
          svg.remove();
          done();
        }
      };
      xScale.onUpdate(step);
      TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
    });

    it("interactions disabled when zooming", (done) => {
      dzl.animationTime(30);
      let step = () => {
        let domain = xScale.domain();
        if (domain[0] === 0.25 && domain[1] === 0.5) {
          svg.remove();
          done();
        }
      };
      xScale.onUpdate(step);
      TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
      let dragInteraction = (<any> dzl)._dragInteraction;
      let clickInteraction = (<any> dzl)._doubleClickInteraction;
      assert.isFalse(dragInteraction.enabled());
      assert.isFalse(clickInteraction.enabled());
    });

    it("zoom out also interpolates", (done) => {
      TestMethods.triggerFakeDragSequence(target, quarterPoint, halfPoint);
      dzl.animationTime(30);
      let interpolations = 0;
      let step = () => {
        interpolations++;
        let domain = xScale.domain();
        if (domain[0] === 0 && domain[1] === 1) {
          svg.remove();
          done();
        }
      };
      xScale.onUpdate(step);
      doubleClick(target, halfPoint);
    });

    it("complains if an invalid ease fn is used", () => {
      let badEase = (x: number) => 2 * x;
      let invalid = () => dzl.ease(badEase);
      TestMethods.assertWarns(invalid, "Easing function does not maintain invariant", "should get warning");
      svg.remove();
    });

    function doubleClick(target: d3.Selection<void>, point: Plottable.Point) {
      TestMethods.triggerFakeMouseEvent("mousedown", target, point.x, point.y);
      TestMethods.triggerFakeMouseEvent("mouseup", target, point.x, point.y);
      TestMethods.triggerFakeMouseEvent("mousedown", target, point.x, point.y);
      TestMethods.triggerFakeMouseEvent("mouseup", target, point.x, point.y);
      TestMethods.triggerFakeMouseEvent("dblclick", target, point.x, point.y);

    }
  });
});

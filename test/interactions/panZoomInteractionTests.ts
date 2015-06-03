///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Interactions", () => {
  describe("PanZoomInteraction", () => {
    var svg: d3.Selection<void>;
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 500;

    var eventTarget: d3.Selection<void>;

    var xScale: Plottable.QuantitativeScale<number>;
    var yScale: Plottable.QuantitativeScale<number>;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);

      var component = new Plottable.Component();
      component.renderTo(svg);

      xScale = new Plottable.Scales.Linear();
      xScale.domain([0, SVG_WIDTH / 2]).range([0, SVG_WIDTH]);
      yScale = new Plottable.Scales.Linear();
      yScale.domain([0, SVG_HEIGHT / 2]).range([0, SVG_HEIGHT]);
      (new Plottable.Interactions.PanZoom(xScale, yScale)).attachTo(component);

      eventTarget = component.background();
    });

    describe("Panning", () => {

      it("dragging a certain amount will translate the scale correctly (mouse)", () => {
        var startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        var endPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT * 3 / 4 };
        TestMethods.triggerFakeMouseEvent("mousedown", eventTarget, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, endPoint.x, endPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseend", eventTarget, endPoint.x, endPoint.y);
        assert.deepEqual(xScale.domain(), [-SVG_WIDTH / 8, SVG_WIDTH * 3 / 8], "xScale pans to the correct domain via drag (mouse)");
        assert.deepEqual(yScale.domain(), [-SVG_HEIGHT / 4, SVG_HEIGHT / 4], "yScale pans to the correct domain via drag (mouse)");
        svg.remove();
      });

      it("dragging to outside the component will translate the scale correctly (mouse)", () => {
        var startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        var endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };
        TestMethods.triggerFakeMouseEvent("mousedown", eventTarget, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, endPoint.x, endPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseend", eventTarget, endPoint.x, endPoint.y);
        assert.deepEqual(xScale.domain(), [SVG_WIDTH / 2, SVG_WIDTH], "xScale pans to the correct domain via drag (mouse)");
        assert.deepEqual(yScale.domain(), [SVG_HEIGHT / 2, SVG_HEIGHT], "yScale pans to the correct domain via drag (mouse)");
        svg.remove();
      });

      it("dragging a certain amount will translate the scale correctly (touch)", () => {
        // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
        // https://github.com/ariya/phantomjs/issues/11289
        if ( window.PHANTOMJS ) {
          svg.remove();
          return;
        }

        var startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        var endPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT * 3 / 4 };
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint]);
        assert.deepEqual(xScale.domain(), [-SVG_WIDTH / 8, SVG_WIDTH * 3 / 8], "xScale pans to the correct domain via drag (touch)");
        assert.deepEqual(yScale.domain(), [-SVG_HEIGHT / 4, SVG_HEIGHT / 4], "yScale pans to the correct domain via drag (touch)");
        svg.remove();
      });

      it("dragging to outside the component will translate the scale correctly (touch)", () => {
        var startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        var endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint]);
        assert.deepEqual(xScale.domain(), [SVG_WIDTH / 2, SVG_WIDTH], "xScale pans to the correct domain via drag (touch)");
        assert.deepEqual(yScale.domain(), [SVG_HEIGHT / 2, SVG_HEIGHT], "yScale pans to the correct domain via drag (touch)");
        svg.remove();
      });

    });

    it("mousewheeling a certain amount will magnify the scale correctly", () => {
      // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
      // https://github.com/ariya/phantomjs/issues/11289
      if ( window.PHANTOMJS ) {
        svg.remove();
        return;
      }

      var scrollPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
      var deltaY = 500;

      TestMethods.triggerFakeWheelEvent( "wheel", svg, scrollPoint.x, scrollPoint.y, deltaY );

      assert.deepEqual(xScale.domain(), [-SVG_WIDTH / 8, SVG_WIDTH * 7 / 8], "xScale zooms to the correct domain via scroll");
      assert.deepEqual(yScale.domain(), [-SVG_HEIGHT / 8, SVG_HEIGHT * 7 / 8], "yScale zooms to the correct domain via scroll");
      svg.remove();
    });

    it("pinching a certain amount will magnify the scale correctly", () => {
      // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
      // https://github.com/ariya/phantomjs/issues/11289
      if ( window.PHANTOMJS ) {
        svg.remove();
        return;
      }

      var startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
      var startPoint2 = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
      TestMethods.triggerFakeTouchEvent( "touchstart", eventTarget, [startPoint, startPoint2], [0, 1] );

      var endPoint = { x: SVG_WIDTH * 3 / 4, y: SVG_HEIGHT * 3 / 4 };
      TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1] );
      TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1] );
      assert.deepEqual(xScale.domain(), [SVG_WIDTH / 16, SVG_WIDTH * 5 / 16], "xScale transforms to the correct domain via pinch");
      assert.deepEqual(yScale.domain(), [SVG_HEIGHT / 16, SVG_HEIGHT * 5 / 16], "yScale transforms to the correct domain via pinch");
      svg.remove();
    });

  });
});

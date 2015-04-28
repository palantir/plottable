///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Interactions", () => {
  describe("PanZoomInteraction", () => {
    var svg: D3.Selection;
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 500;

    var eventTarget: D3.Selection;

    var xScale: Plottable.Scale.AbstractQuantitative<number>;
    var yScale: Plottable.Scale.AbstractQuantitative<number>;

    beforeEach(() => {
      svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);

      var component = new Plottable.Component.AbstractComponent();
      component.renderTo(svg);

      xScale = new Plottable.Scale.Linear();
      xScale.domain([0, SVG_WIDTH / 2]).range([0, SVG_WIDTH]);
      yScale = new Plottable.Scale.Linear();
      yScale.domain([0, SVG_HEIGHT / 2]).range([0, SVG_HEIGHT]);
      component.registerInteraction(new Plottable.Interaction.PanZoom(xScale, yScale));

      eventTarget = component.background();
    });

    describe("Panning", () => {

      it("dragging a certain amount will translate the scale correctly (mouse)", () => {
        var startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        var endPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT * 3 / 4 };
        triggerFakeMouseEvent("mousedown", eventTarget, startPoint.x, startPoint.y);
        triggerFakeMouseEvent("mousemove", eventTarget, endPoint.x, endPoint.y);
        triggerFakeMouseEvent("mouseend", eventTarget, endPoint.x, endPoint.y);
        assert.deepEqual(xScale.domain(), [-SVG_WIDTH / 8, SVG_WIDTH * 3 / 8], "xScale pans to the correct domain via drag (mouse)");
        assert.deepEqual(yScale.domain(), [-SVG_HEIGHT / 4, SVG_HEIGHT / 4], "yScale pans to the correct domain via drag (mouse)");
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
        triggerFakeTouchEvent("touchstart", eventTarget, [startPoint]);
        triggerFakeTouchEvent("touchmove", eventTarget, [endPoint]);
        triggerFakeTouchEvent("touchend", eventTarget, [endPoint]);
        assert.deepEqual(xScale.domain(), [-SVG_WIDTH / 8, SVG_WIDTH * 3 / 8], "xScale pans to the correct domain via drag (touch)");
        assert.deepEqual(yScale.domain(), [-SVG_HEIGHT / 4, SVG_HEIGHT / 4], "yScale pans to the correct domain via drag (touch)");
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

      triggerFakeWheelEvent( "wheel", svg, scrollPoint.x, scrollPoint.y, deltaY );

      assert.deepEqual( xScale.domain(), [-SVG_WIDTH / 8, SVG_WIDTH * 7 / 8], "xScale zooms to the correct domain via scroll" );
      assert.deepEqual( yScale.domain(), [-SVG_HEIGHT / 8, SVG_HEIGHT * 7 / 8], "yScale zooms to the correct domain via scroll" );
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
      triggerFakeTouchEvent( "touchstart", eventTarget, [startPoint, startPoint2], [0, 1] );

      var endPoint = { x: SVG_WIDTH * 3 / 4, y: SVG_HEIGHT * 3 / 4 };
      triggerFakeTouchEvent( "touchmove", eventTarget, [endPoint], [1] );
      triggerFakeTouchEvent( "touchend", eventTarget, [endPoint], [1] );
      assert.deepEqual( xScale.domain(), [SVG_WIDTH / 16, SVG_WIDTH * 5 / 16], "xScale pans to the correct domain via drag (touch)" );
      assert.deepEqual( yScale.domain(), [SVG_HEIGHT / 16, SVG_HEIGHT * 5 / 16], "yScale pans to the correct domain via drag (touch)" );
      svg.remove();
    });

  });
});

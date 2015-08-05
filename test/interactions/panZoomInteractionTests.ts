///<reference path="../testReference.ts" />

describe("Interactions", () => {
  describe("PanZoomInteraction", () => {
    var svg: d3.Selection<void>;
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 500;

    var component: Plottable.Component;
    var eventTarget: d3.Selection<void>;

    var xScale: Plottable.QuantitativeScale<number>;
    var yScale: Plottable.QuantitativeScale<number>;
    var panZoomInteraction: Plottable.Interactions.PanZoom;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);

      component = new Plottable.Component();
      component.renderTo(svg);

      xScale = new Plottable.Scales.Linear();
      xScale.domain([0, SVG_WIDTH / 2]).range([0, SVG_WIDTH]);
      yScale = new Plottable.Scales.Linear();
      yScale.domain([0, SVG_HEIGHT / 2]).range([0, SVG_HEIGHT]);
      panZoomInteraction = new Plottable.Interactions.PanZoom();
      panZoomInteraction.addXScale(xScale);
      panZoomInteraction.addYScale(yScale);
      panZoomInteraction.attachTo(component);

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

      it("dragging a certain amount will translate multiple scales correctly (mouse)", () => {
        var xScale2 = new Plottable.Scales.Linear();
        xScale2.domain([0, 2 * SVG_WIDTH]).range([0, SVG_WIDTH]);
        panZoomInteraction.addXScale(xScale2);
        var startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        var endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };
        TestMethods.triggerFakeMouseEvent("mousedown", eventTarget, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, endPoint.x, endPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseend", eventTarget, endPoint.x, endPoint.y);
        assert.deepEqual(xScale.domain(), [SVG_WIDTH / 2, SVG_WIDTH], "xScale pans to the correct domain via drag (mouse)");
        assert.deepEqual(xScale2.domain(), [SVG_WIDTH * 2, SVG_WIDTH * 4], "xScale2 pans to the correct domain via drag (mouse)");
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

      it("dragging a certain amount will translate multiple scales correctly (touch)", () => {
        var xScale2 = new Plottable.Scales.Linear();
        xScale2.domain([0, 2 * SVG_WIDTH]).range([0, SVG_WIDTH]);
        panZoomInteraction.addXScale(xScale2);
        var startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        var endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint]);
        assert.deepEqual(xScale.domain(), [SVG_WIDTH / 2, SVG_WIDTH], "xScale pans to the correct domain via drag (touch)");
        assert.deepEqual(xScale2.domain(), [SVG_WIDTH * 2, SVG_WIDTH * 4], "xScale2 pans to the correct domain via drag (touch)");
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

    it("mousewheeling a certain amount will magnify multiple scales correctly", () => {
      // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
      // https://github.com/ariya/phantomjs/issues/11289
      if ( window.PHANTOMJS ) {
        svg.remove();
        return;
      }
      var xScale2 = new Plottable.Scales.Linear();
      xScale2.domain([0, 2 * SVG_WIDTH]).range([0, SVG_WIDTH]);
      panZoomInteraction.addXScale(xScale2);

      var scrollPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
      var deltaY = 500;

      TestMethods.triggerFakeWheelEvent( "wheel", svg, scrollPoint.x, scrollPoint.y, deltaY );

      assert.deepEqual(xScale.domain(), [-SVG_WIDTH / 8, SVG_WIDTH * 7 / 8], "xScale zooms to the correct domain via scroll");
      assert.deepEqual(xScale2.domain(), [-SVG_WIDTH / 2, SVG_WIDTH * 7 / 2], "xScale2 zooms to the correct domain via scroll");
      svg.remove();
    });

    it("pinching a certain amount will magnify the scale correctly", () => {
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

    it("pinching a certain amount will magnify multiple scales correctly", () => {
      var xScale2 = new Plottable.Scales.Linear();
      xScale2.domain([0, 2 * SVG_WIDTH]).range([0, SVG_WIDTH]);
      panZoomInteraction.addXScale(xScale2);
      var startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
      var startPoint2 = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
      TestMethods.triggerFakeTouchEvent( "touchstart", eventTarget, [startPoint, startPoint2], [0, 1] );

      var endPoint = { x: SVG_WIDTH * 3 / 4, y: SVG_HEIGHT * 3 / 4 };
      TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1] );
      TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1] );
      assert.deepEqual(xScale.domain(), [SVG_WIDTH / 16, SVG_WIDTH * 5 / 16], "xScale transforms to the correct domain via pinch");
      assert.deepEqual(xScale2.domain(), [SVG_WIDTH / 4, SVG_WIDTH * 5 / 4], "xScale2 transforms to the correct domain via pinch");
      svg.remove();
    });

    it("pinching inside one component does not affect another component", () => {
      var component2 = new Plottable.Component();
      var table = new Plottable.Components.Table([[component], [component2]]);
      table.renderTo(svg);
      var xScale2 = new Plottable.Scales.Linear();
      const initialDomain = [0, SVG_WIDTH / 2];
      xScale2.domain(initialDomain).range([0, SVG_WIDTH]);
      var panZoomInteraction2 = new Plottable.Interactions.PanZoom();
      panZoomInteraction2.addXScale(xScale2);
      panZoomInteraction2.attachTo(component2);

      var startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 2 };
      var startPoint2 = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
      TestMethods.triggerFakeTouchEvent( "touchstart", eventTarget, [startPoint, startPoint2], [0, 1] );

      var endPoint = { x: SVG_WIDTH * 3 / 4, y: SVG_HEIGHT / 2 };
      TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1] );
      TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1] );
      assert.deepEqual(xScale.domain(), [SVG_WIDTH / 16, SVG_WIDTH * 5 / 16], "xScale inside target component transforms via pinch");
      assert.deepEqual(xScale2.domain(), initialDomain, "xScale outside of target component does not transform via pinch");
      svg.remove();
    });

    it("Setting the xScales in batch is the same as adding one at a time", () => {
      var xScale2 = new Plottable.Scales.Linear();
      panZoomInteraction.addXScale(xScale2);
      var xScales = panZoomInteraction.xScales();
      panZoomInteraction.xScales([xScale, xScale2]);
      assert.deepEqual(xScales, panZoomInteraction.xScales(), "Setting and adding x scales result in the same behavior");
      svg.remove();
    });

    it("Setting the yScales in batch is the same as adding one at a time", () => {
      var yScale2 = new Plottable.Scales.Linear();
      panZoomInteraction.addYScale(yScale2);
      var yScales = panZoomInteraction.yScales();
      panZoomInteraction.yScales([yScale, yScale2]);
      assert.deepEqual(yScales, panZoomInteraction.yScales(), "Setting and adding y scales result in the same behavior");
      svg.remove();
    });

    it("Adding an already existent xScale does nothing", () => {
      var oldXScaleNumber = panZoomInteraction.xScales().length;
      panZoomInteraction.addXScale(panZoomInteraction.xScales()[0]);
      assert.lengthOf(panZoomInteraction.xScales(), oldXScaleNumber, "Number of x scales is maintained");
      svg.remove();
    });

    it("Adding an already existent yScale does nothing", () => {
      var oldYScaleNumber = panZoomInteraction.yScales().length;
      panZoomInteraction.addYScale(panZoomInteraction.yScales()[0]);
      assert.lengthOf(panZoomInteraction.yScales(), oldYScaleNumber, "Number of y scales is maintained");
      svg.remove();
    });

    describe("minDomainExtent", () => {

      var minimumDomainExtent: number;

      beforeEach(() => {
        minimumDomainExtent = SVG_WIDTH / 4;
        panZoomInteraction.minDomainExtent(xScale, minimumDomainExtent);
      });

      it("Rejects negative extents", () => {
        assert.throws(() => panZoomInteraction.minDomainExtent(xScale, -1), Error);
        svg.remove();
      });

      it("can't be larger than maxDomainExtent() for the same Scale", () => {
        var maximumDomainExtent = minimumDomainExtent * 2;
        panZoomInteraction.maxDomainExtent(xScale, maximumDomainExtent);
        var tooBigMinimumDomainExtent = maximumDomainExtent * 2;
        assert.throws(() => panZoomInteraction.minDomainExtent(xScale, tooBigMinimumDomainExtent), Error);
        svg.remove();
      });

      it("Mousewheeling in cannot go beyond the specified domainExtent", () => {
        // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
        // https://github.com/ariya/phantomjs/issues/11289
        if ( window.PHANTOMJS ) {
          svg.remove();
          return;
        }

        var scrollPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        var deltaY = -3000;

        TestMethods.triggerFakeWheelEvent("wheel", svg, scrollPoint.x, scrollPoint.y, deltaY );
        var domainExtent = Math.abs(xScale.domain()[1] - xScale.domain()[0]);
        assert.strictEqual(domainExtent, minimumDomainExtent, "xScale zooms to the correct domain via scroll");
        svg.remove();
      });

      it("Pinching in cannot go beyond the specified domainExtent", () => {
        var startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        var startPoint2 = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        TestMethods.triggerFakeTouchEvent( "touchstart", eventTarget, [startPoint, startPoint2], [0, 1] );

        var endPoint = { x: SVG_WIDTH, y: SVG_HEIGHT};
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1] );
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1] );
        var domainExtent = Math.abs(xScale.domain()[1] - xScale.domain()[0]);
        assert.strictEqual(domainExtent, minimumDomainExtent, "xScale zooms to the correct domain via pinch");
        svg.remove();
      });

    });

    describe("maxDomainExtent", () => {
      var maximumDomainExtent: number;

      beforeEach(() => {
        maximumDomainExtent = SVG_WIDTH;
        panZoomInteraction.maxDomainExtent(xScale, maximumDomainExtent);
      });

      it("Rejects non-positive extents", () => {
        assert.throws(() => panZoomInteraction.maxDomainExtent(xScale, -1), Error);
        assert.throws(() => panZoomInteraction.maxDomainExtent(xScale, 0), Error);
        svg.remove();
      });

      it("can't be smaller than minDomainExtent() for the same Scale", () => {
        var minimumDomainExtent = maximumDomainExtent / 2;
        panZoomInteraction.minDomainExtent(xScale, minimumDomainExtent);
        var tooSmallMaximumDomainExtent = minimumDomainExtent / 2;
        assert.throws(() => panZoomInteraction.maxDomainExtent(xScale, tooSmallMaximumDomainExtent), Error);
        svg.remove();
      });

      it("Mousewheeling out cannot go beyond the specified domainExtent", () => {
        // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
        // https://github.com/ariya/phantomjs/issues/11289
        if ( window.PHANTOMJS ) {
          svg.remove();
          return;
        }

        var scrollPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        var deltaY = 3000;

        TestMethods.triggerFakeWheelEvent("wheel", svg, scrollPoint.x, scrollPoint.y, deltaY );
        var domainExtent = Math.abs(xScale.domain()[1] - xScale.domain()[0]);
        assert.strictEqual(domainExtent, maximumDomainExtent, "xScale zooms to the correct domain via scroll");
        svg.remove();
      });

      it("Pinching in cannot go beyond the specified domainExtent", () => {
        var startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        var startPoint2 = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        TestMethods.triggerFakeTouchEvent( "touchstart", eventTarget, [startPoint, startPoint2], [0, 1] );

        var endPoint = { x: 5 * SVG_WIDTH / 16, y: 5 * SVG_HEIGHT / 16 };
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1] );
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1] );
        var domainExtent = Math.abs(xScale.domain()[1] - xScale.domain()[0]);
        assert.strictEqual(domainExtent, maximumDomainExtent, "xScale zooms to the correct domain via pinch");
        svg.remove();
      });

    });

  });
});

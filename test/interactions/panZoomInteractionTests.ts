///<reference path="../testReference.ts" />

describe("Interactions", () => {
  describe("PanZoomInteraction", () => {

    describe("Scale setting", () => {
      let xScale: Plottable.QuantitativeScale<number>;
      let yScale: Plottable.QuantitativeScale<number>;
      let panZoomInteraction: Plottable.Interactions.PanZoom;

      beforeEach(() => {
        xScale = new Plottable.Scales.Linear();
        yScale = new Plottable.Scales.Linear();

        panZoomInteraction = new Plottable.Interactions.PanZoom();
      });

      it("can set scales", () => {
        assert.deepEqual(panZoomInteraction.xScales(), [], "no xScales exist by default");
        assert.deepEqual(panZoomInteraction.yScales(), [], "no yScales exist by default");

        assert.strictEqual(panZoomInteraction.addXScale(xScale), panZoomInteraction, "setting the xScale returns the interaction");
        assert.strictEqual(panZoomInteraction.addYScale(yScale), panZoomInteraction, "setting the yScale returns the interaction");

        assert.deepEqual(panZoomInteraction.xScales(), [xScale], "xScale has been added");
        assert.deepEqual(panZoomInteraction.yScales(), [yScale], "yScale has been added");
      });

      it("can remove scales", () => {
        panZoomInteraction.addXScale(xScale);
        panZoomInteraction.addYScale(yScale);

        assert.deepEqual(panZoomInteraction.xScales(), [xScale], "xScale has been added");
        assert.deepEqual(panZoomInteraction.yScales(), [yScale], "yScale has been added");

        assert.strictEqual(panZoomInteraction.removeXScale(xScale), panZoomInteraction, "removing the xScale returns the interaction");
        assert.strictEqual(panZoomInteraction.removeYScale(yScale), panZoomInteraction, "removing the yScale returns the interaction");

        assert.deepEqual(panZoomInteraction.xScales(), [], "xScale has been removed");
        assert.deepEqual(panZoomInteraction.yScales(), [], "yScale has been removed");

      });

      it("Setting the xScales in batch is the same as adding one at a time", () => {
        let xScale2 = new Plottable.Scales.Linear();

        panZoomInteraction.addXScale(xScale);
        panZoomInteraction.addXScale(xScale2);
        let xScales = panZoomInteraction.xScales();

        panZoomInteraction.xScales([]);
        assert.deepEqual(panZoomInteraction.xScales(), [], "scales can be removed with the xScales call");

        panZoomInteraction.xScales([xScale, xScale2]);
        assert.deepEqual(xScales, panZoomInteraction.xScales(), "setting and adding x scales result in the same behavior");
      });

      it("Setting the yScales in batch is the same as adding one at a time", () => {
        let yScale2 = new Plottable.Scales.Linear();
        panZoomInteraction.addYScale(yScale);
        panZoomInteraction.addYScale(yScale2);
        let yScales = panZoomInteraction.yScales();

        panZoomInteraction.yScales([]);
        assert.deepEqual(panZoomInteraction.yScales(), [], "scales can be removed with the yScales call");

        panZoomInteraction.yScales([yScale, yScale2]);
        assert.deepEqual(yScales, panZoomInteraction.yScales(), "setting and adding y scales result in the same behavior");
      });

      it("Adding an already existent xScale does nothing", () => {
        panZoomInteraction.addXScale(xScale);
        let oldXScaleNumber = panZoomInteraction.xScales().length;
        panZoomInteraction.addXScale(panZoomInteraction.xScales()[0]);
        assert.lengthOf(panZoomInteraction.xScales(), oldXScaleNumber, "the number of x scales is maintained");
      });

      it("Adding an already existent yScale does nothing", () => {
        panZoomInteraction.addYScale(yScale);
        let oldYScaleNumber = panZoomInteraction.yScales().length;
        panZoomInteraction.addYScale(panZoomInteraction.yScales()[0]);
        assert.lengthOf(panZoomInteraction.yScales(), oldYScaleNumber, "the number of y scales is maintained");
      });
    });

    describe("Panning", () => {
      let svg: d3.Selection<void>;
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 500;

      let eventTarget: d3.Selection<void>;

      let xScale: Plottable.QuantitativeScale<number>;
      let yScale: Plottable.QuantitativeScale<number>;
      let panZoomInteraction: Plottable.Interactions.PanZoom;

      beforeEach(() => {
        xScale = new Plottable.Scales.Linear();
        xScale.domain([0, SVG_WIDTH / 2]).range([0, SVG_WIDTH]);
        yScale = new Plottable.Scales.Linear();
        yScale.domain([0, SVG_HEIGHT / 2]).range([0, SVG_HEIGHT]);

        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);

        let component = new Plottable.Component();
        component.renderTo(svg);

        panZoomInteraction = new Plottable.Interactions.PanZoom();
        panZoomInteraction.addXScale(xScale);
        panZoomInteraction.addYScale(yScale);
        panZoomInteraction.attachTo(component);

        eventTarget = component.background();
      });

      it("dragging a will translate the scale correctly (mouse)", () => {
        let startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        let endPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT * 3 / 4 };
        TestMethods.triggerFakeMouseEvent("mousedown", eventTarget, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, endPoint.x, endPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseend", eventTarget, endPoint.x, endPoint.y);
        assert.deepEqual(xScale.domain(), [-SVG_WIDTH / 8, SVG_WIDTH * 3 / 8], "xScale pans to the correct domain via drag (mouse)");
        assert.deepEqual(yScale.domain(), [-SVG_HEIGHT / 4, SVG_HEIGHT / 4], "yScale pans to the correct domain via drag (mouse)");
        svg.remove();
      });

      it("dragging to outside the component will translate the scale correctly (mouse)", () => {
        let startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };
        TestMethods.triggerFakeMouseEvent("mousedown", eventTarget, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, endPoint.x, endPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseend", eventTarget, endPoint.x, endPoint.y);
        assert.deepEqual(xScale.domain(), [SVG_WIDTH / 2, SVG_WIDTH], "xScale pans to the correct domain via drag (mouse)");
        assert.deepEqual(yScale.domain(), [SVG_HEIGHT / 2, SVG_HEIGHT], "yScale pans to the correct domain via drag (mouse)");
        svg.remove();
      });

      it("dragging a certain amount will translate multiple scales correctly (mouse)", () => {
        let xScale2 = new Plottable.Scales.Linear();
        xScale2.domain([0, 2 * SVG_WIDTH]).range([0, SVG_WIDTH]);
        panZoomInteraction.addXScale(xScale2);
        let startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };
        TestMethods.triggerFakeMouseEvent("mousedown", eventTarget, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, endPoint.x, endPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseend", eventTarget, endPoint.x, endPoint.y);
        assert.deepEqual(xScale.domain(), [SVG_WIDTH / 2, SVG_WIDTH], "xScale pans to the correct domain via drag (mouse)");
        assert.deepEqual(xScale2.domain(), [SVG_WIDTH * 2, SVG_WIDTH * 4], "xScale2 pans to the correct domain via drag (mouse)");
        svg.remove();
      });

      it("dragging a certain amount will translate the scale correctly (touch)", () => {
        let startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        let endPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT * 3 / 4 };
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint]);
        assert.deepEqual(xScale.domain(), [-SVG_WIDTH / 8, SVG_WIDTH * 3 / 8], "xScale pans to the correct domain via drag (touch)");
        assert.deepEqual(yScale.domain(), [-SVG_HEIGHT / 4, SVG_HEIGHT / 4], "yScale pans to the correct domain via drag (touch)");
        svg.remove();
      });

      it("dragging to outside the component will translate the scale correctly (touch)", () => {
        let startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint]);
        assert.deepEqual(xScale.domain(), [SVG_WIDTH / 2, SVG_WIDTH], "xScale pans to the correct domain via drag (touch)");
        assert.deepEqual(yScale.domain(), [SVG_HEIGHT / 2, SVG_HEIGHT], "yScale pans to the correct domain via drag (touch)");
        svg.remove();
      });

      it("dragging a certain amount will translate multiple scales correctly (touch)", () => {
        let xScale2 = new Plottable.Scales.Linear();
        xScale2.domain([0, 2 * SVG_WIDTH]).range([0, SVG_WIDTH]);
        panZoomInteraction.addXScale(xScale2);
        let startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint]);
        assert.deepEqual(xScale.domain(), [SVG_WIDTH / 2, SVG_WIDTH], "xScale pans to the correct domain via drag (touch)");
        assert.deepEqual(xScale2.domain(), [SVG_WIDTH * 2, SVG_WIDTH * 4], "xScale2 pans to the correct domain via drag (touch)");
        svg.remove();
      });
    });

    describe("Zooming", () => {
      let svg: d3.Selection<void>;
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 500;

      let component: Plottable.Component;
      let eventTarget: d3.Selection<void>;

      let xScale: Plottable.QuantitativeScale<number>;
      let yScale: Plottable.QuantitativeScale<number>;
      let panZoomInteraction: Plottable.Interactions.PanZoom;

      beforeEach(() => {
        xScale = new Plottable.Scales.Linear();
        xScale.domain([0, SVG_WIDTH / 2]).range([0, SVG_WIDTH]);
        yScale = new Plottable.Scales.Linear();
        yScale.domain([0, SVG_HEIGHT / 2]).range([0, SVG_HEIGHT]);

        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);

        component = new Plottable.Component();
        component.renderTo(svg);

        panZoomInteraction = new Plottable.Interactions.PanZoom();
        panZoomInteraction.addXScale(xScale);
        panZoomInteraction.addYScale(yScale);
        panZoomInteraction.attachTo(component);

        eventTarget = component.background();
      });

      it("mousewheeling a certain amount will magnify the scale correctly", () => {
        // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
        // https://github.com/ariya/phantomjs/issues/11289
        if (window.PHANTOMJS) {
          svg.remove();
          return;
        }

        let scrollPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        let deltaY = 500;

        TestMethods.triggerFakeWheelEvent("wheel", svg, scrollPoint.x, scrollPoint.y, deltaY);

        assert.deepEqual(xScale.domain(), [-SVG_WIDTH / 8, SVG_WIDTH * 7 / 8], "xScale zooms to the correct domain via scroll");
        assert.deepEqual(yScale.domain(), [-SVG_HEIGHT / 8, SVG_HEIGHT * 7 / 8], "yScale zooms to the correct domain via scroll");
        svg.remove();
      });

      it("mousewheeling a certain amount will magnify multiple scales correctly", () => {
        // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
        // https://github.com/ariya/phantomjs/issues/11289
        if (window.PHANTOMJS) {
          svg.remove();
          return;
        }
        let xScale2 = new Plottable.Scales.Linear();
        xScale2.domain([0, 2 * SVG_WIDTH]).range([0, SVG_WIDTH]);
        panZoomInteraction.addXScale(xScale2);

        let scrollPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        let deltaY = 500;

        TestMethods.triggerFakeWheelEvent( "wheel", svg, scrollPoint.x, scrollPoint.y, deltaY );

        assert.deepEqual(xScale.domain(), [-SVG_WIDTH / 8, SVG_WIDTH * 7 / 8], "xScale zooms to the correct domain via scroll");
        assert.deepEqual(xScale2.domain(), [-SVG_WIDTH / 2, SVG_WIDTH * 7 / 2], "xScale2 zooms to the correct domain via scroll");
        svg.remove();
      });

      it("pinching a certain amount will magnify the scale correctly", () => {
        let startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        let startPoint2 = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        TestMethods.triggerFakeTouchEvent( "touchstart", eventTarget, [startPoint, startPoint2], [0, 1] );

        let endPoint = { x: SVG_WIDTH * 3 / 4, y: SVG_HEIGHT * 3 / 4 };
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1] );
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1] );
        assert.deepEqual(xScale.domain(), [SVG_WIDTH / 16, SVG_WIDTH * 5 / 16], "xScale transforms to the correct domain via pinch");
        assert.deepEqual(yScale.domain(), [SVG_HEIGHT / 16, SVG_HEIGHT * 5 / 16], "yScale transforms to the correct domain via pinch");
        svg.remove();
      });

      it("pinching a certain amount will magnify multiple scales correctly", () => {
        let xScale2 = new Plottable.Scales.Linear();
        xScale2.domain([0, 2 * SVG_WIDTH]).range([0, SVG_WIDTH]);
        panZoomInteraction.addXScale(xScale2);
        let startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        let startPoint2 = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        TestMethods.triggerFakeTouchEvent( "touchstart", eventTarget, [startPoint, startPoint2], [0, 1] );

        let endPoint = { x: SVG_WIDTH * 3 / 4, y: SVG_HEIGHT * 3 / 4 };
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1] );
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1] );
        assert.deepEqual(xScale.domain(), [SVG_WIDTH / 16, SVG_WIDTH * 5 / 16], "xScale transforms to the correct domain via pinch");
        assert.deepEqual(xScale2.domain(), [SVG_WIDTH / 4, SVG_WIDTH * 5 / 4], "xScale2 transforms to the correct domain via pinch");
        svg.remove();
      });

      it("pinching inside one component does not affect another component", () => {
        let xScale2 = new Plottable.Scales.Linear();
        let initialDomain = [0, SVG_WIDTH / 2];
        xScale2.domain(initialDomain).range([0, SVG_WIDTH]);

        let component2 = new Plottable.Component();

        let panZoomInteraction2 = new Plottable.Interactions.PanZoom();
        panZoomInteraction2.addXScale(xScale2);
        panZoomInteraction2.attachTo(component2);

        let table = new Plottable.Components.Table([[component, component2]]);
        table.renderTo(svg);

        let startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 2 };
        let startPoint2 = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        TestMethods.triggerFakeTouchEvent( "touchstart", eventTarget, [startPoint, startPoint2], [0, 1] );

        let endPoint = { x: SVG_WIDTH * 3 / 4, y: SVG_HEIGHT / 2 };
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1] );
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1] );
        assert.deepEqual(xScale.domain(), [SVG_WIDTH / 16, SVG_WIDTH * 5 / 16], "xScale inside target component transforms via pinch");
        assert.deepEqual(xScale2.domain(), initialDomain, "xScale outside of target component does not transform via pinch");
        svg.remove();
      });
    });

    describe("minDomainExtent", () => {
      let svg: d3.Selection<void>;
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 500;

      let eventTarget: d3.Selection<void>;

      let xScale: Plottable.QuantitativeScale<number>;
      let panZoomInteraction: Plottable.Interactions.PanZoom;

      beforeEach(() => {
        xScale = new Plottable.Scales.Linear();
        xScale.domain([0, SVG_WIDTH / 2]);

        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);

        let component = new Plottable.Component();
        component.renderTo(svg);

        panZoomInteraction = new Plottable.Interactions.PanZoom();
        panZoomInteraction.addXScale(xScale);
        panZoomInteraction.attachTo(component);

        eventTarget = component.background();
      });

      it("can set minDomainExtent", () => {
        let minimumDomainExtent = SVG_WIDTH / 4;
        assert.strictEqual(panZoomInteraction.minDomainExtent(xScale, minimumDomainExtent), panZoomInteraction,
          "setting the minDomainExtent returns the interaction");

        assert.strictEqual(panZoomInteraction.minDomainExtent(xScale), minimumDomainExtent,
          "returns the correct minDomainExtent");

        svg.remove();
      });

      it("Rejects negative extents", () => {
        (<any>assert).throws(() => panZoomInteraction.minDomainExtent(xScale, -1), Error, "extent must be non-negative",
          "Correctly rejects -1");
        svg.remove();
      });

      it("can't be larger than maxDomainExtent() for the same Scale", () => {
        let minimumDomainExtent = SVG_WIDTH / 4;
        // panZoomInteraction.minDomainExtent(xScale, minimumDomainExtent);


        let maximumDomainExtent = minimumDomainExtent * 2;
        panZoomInteraction.maxDomainExtent(xScale, maximumDomainExtent);

        let tooBigMinimumDomainExtent = maximumDomainExtent * 2;
        (<any>assert).throws(() => panZoomInteraction.minDomainExtent(xScale, tooBigMinimumDomainExtent), Error,
          "minDomainExtent must be smaller than maxDomainExtent for the same Scale",
          "cannot have minDomainExtent larger than maxDomainExtent");
        svg.remove();
      });

      it("Mousewheeling in cannot go beyond the specified domainExtent", () => {
        // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
        // https://github.com/ariya/phantomjs/issues/11289
        if (window.PHANTOMJS) {
          svg.remove();
          return;
        }

        let minimumDomainExtent = SVG_WIDTH / 4;
        panZoomInteraction.minDomainExtent(xScale, minimumDomainExtent);

        let scrollPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        let deltaY = -3000;

        TestMethods.triggerFakeWheelEvent("wheel", svg, scrollPoint.x, scrollPoint.y, deltaY);
        let domainExtent = Math.abs(xScale.domain()[1] - xScale.domain()[0]);
        assert.strictEqual(domainExtent, minimumDomainExtent, "xScale zooms to the correct domain via scroll");
        svg.remove();
      });

      it("Pinching in cannot go beyond the specified domainExtent", () => {
        let minimumDomainExtent = SVG_WIDTH / 4;
        panZoomInteraction.minDomainExtent(xScale, minimumDomainExtent);

        let startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        let startPoint2 = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        TestMethods.triggerFakeTouchEvent( "touchstart", eventTarget, [startPoint, startPoint2], [0, 1]);

        let endPoint = { x: SVG_WIDTH, y: SVG_HEIGHT };
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1]);
        let domainExtent = Math.abs(xScale.domain()[1] - xScale.domain()[0]);
        assert.strictEqual(domainExtent, minimumDomainExtent, "xScale zooms to the correct domain via pinch");
        svg.remove();
      });
    });

    describe("maxDomainExtent", () => {
      let svg: d3.Selection<void>;
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 500;

      let eventTarget: d3.Selection<void>;

      let xScale: Plottable.QuantitativeScale<number>;
      let panZoomInteraction: Plottable.Interactions.PanZoom;

      beforeEach(() => {
        xScale = new Plottable.Scales.Linear();
        xScale.domain([0, SVG_WIDTH / 2]);

        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);

        let component = new Plottable.Component();
        component.renderTo(svg);

        panZoomInteraction = new Plottable.Interactions.PanZoom();
        panZoomInteraction.addXScale(xScale);
        panZoomInteraction.attachTo(component);

        eventTarget = component.background();
      });

      it("can set maxDomainExtent", () => {
        let maximumDomainExtent = SVG_WIDTH;
        assert.strictEqual(panZoomInteraction.maxDomainExtent(xScale, maximumDomainExtent), panZoomInteraction,
          "setting the maxDomainExtent returns the interaction");

        assert.strictEqual(panZoomInteraction.maxDomainExtent(xScale), maximumDomainExtent,
          "returns the correct maxDomainExtent");

        svg.remove();
      });

      it("Rejects non-positive extents", () => {
        (<any>assert).throws(() => panZoomInteraction.maxDomainExtent(xScale, -1), Error, "extent must be positive",
          "Correctly rejects -1");
        (<any>assert).throws(() => panZoomInteraction.maxDomainExtent(xScale, 0), Error, "extent must be positive",
          "Correctly rejects 0");
        svg.remove();
      });

      it("can't be smaller than minDomainExtent() for the same Scale", () => {
        let maximumDomainExtent = SVG_WIDTH;
        panZoomInteraction.maxDomainExtent(xScale, maximumDomainExtent);


        let minimumDomainExtent = maximumDomainExtent / 2;
        panZoomInteraction.minDomainExtent(xScale, minimumDomainExtent);
        let tooSmallMaximumDomainExtent = minimumDomainExtent / 2;
        (<any>assert).throws(() => panZoomInteraction.maxDomainExtent(xScale, tooSmallMaximumDomainExtent), Error,
          "maxDomainExtent must be larger than minDomainExtent for the same Scale",
          "cannot have maxDomainExtent smaller than minDomainExtent");

        svg.remove();
      });

      it("Mousewheeling out cannot go beyond the specified domainExtent", () => {
        // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
        // https://github.com/ariya/phantomjs/issues/11289
        if (window.PHANTOMJS) {
          svg.remove();
          return;
        }

        let maximumDomainExtent = SVG_WIDTH;
        panZoomInteraction.maxDomainExtent(xScale, maximumDomainExtent);

        let scrollPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        let deltaY = 3000;

        TestMethods.triggerFakeWheelEvent("wheel", svg, scrollPoint.x, scrollPoint.y, deltaY);
        let domainExtent = Math.abs(xScale.domain()[1] - xScale.domain()[0]);
        assert.strictEqual(domainExtent, maximumDomainExtent, "xScale zooms to the correct domain via scroll");
        svg.remove();
      });

      it("Pinching in cannot go beyond the specified domainExtent", () => {
        let maximumDomainExtent = SVG_WIDTH;
        panZoomInteraction.maxDomainExtent(xScale, maximumDomainExtent);

        let startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        let startPoint2 = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        TestMethods.triggerFakeTouchEvent( "touchstart", eventTarget, [startPoint, startPoint2], [0, 1]);

        let endPoint = { x: 5 * SVG_WIDTH / 16, y: 5 * SVG_HEIGHT / 16 };
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1]);
        let domainExtent = Math.abs(xScale.domain()[1] - xScale.domain()[0]);
        assert.strictEqual(domainExtent, maximumDomainExtent, "xScale zooms to the correct domain via pinch");
        svg.remove();
      });
    });

  });
});

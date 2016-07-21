///<reference path="../testReference.ts" />

describe("Interactions", () => {
  describe("PanZoom Interaction", () => {

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

      it("can set the xScales in batch", () => {
        let xScale2 = new Plottable.Scales.Linear();
        let expectedXScales = [xScale, xScale2];
        panZoomInteraction.addXScale(xScale);
        panZoomInteraction.addXScale(xScale2);
        assert.deepEqual(panZoomInteraction.xScales(), expectedXScales, "interaction contains the 2 xScales added");

        assert.deepEqual(panZoomInteraction.xScales([]), panZoomInteraction, "returns the calling interaction");
        assert.deepEqual(panZoomInteraction.xScales(), [], "scales can be removed with the xScales call");

        panZoomInteraction.xScales([xScale, xScale2]);
        assert.deepEqual(panZoomInteraction.xScales(), expectedXScales, "setting and adding x scales result in the same behavior");
      });

      it("can set the yScales in batch", () => {
        let yScale2 = new Plottable.Scales.Linear();
        let expectedYScales = [yScale, yScale2];
        panZoomInteraction.addYScale(yScale);
        panZoomInteraction.addYScale(yScale2);
        assert.deepEqual(panZoomInteraction.yScales(), expectedYScales, "interaction contains the 2 yScales added");

        assert.deepEqual(panZoomInteraction.yScales([]), panZoomInteraction, "returns the calling interaction");
        assert.deepEqual(panZoomInteraction.yScales(), [], "scales can be removed with the yScales call");

        panZoomInteraction.yScales([yScale, yScale2]);
        assert.deepEqual(panZoomInteraction.yScales(), expectedYScales, "setting and adding y scales result in the same behavior");
      });

      it("does not create duplicate for an already existent xScale", () => {
        panZoomInteraction.addXScale(xScale);
        panZoomInteraction.addXScale(xScale);
        assert.deepEqual(panZoomInteraction.xScales(), [xScale], "there is exactly one copy of xScale");
      });

      it("does not create duplicate for an already existent yScale", () => {
        panZoomInteraction.addYScale(yScale);
        panZoomInteraction.addYScale(yScale);
        assert.deepEqual(panZoomInteraction.yScales(), [yScale], "there is exactly one copy of yScale");
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

      it("translates the scale correctly on dragging (mouse)", () => {
        let startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        let endPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT * 3 / 4 };
        let expectedXDomain = domainAfterPan(startPoint, endPoint, xScale, true);
        let expectedYDomain = domainAfterPan(startPoint, endPoint, yScale, false);
        TestMethods.triggerFakeMouseEvent("mousedown", eventTarget, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, endPoint.x, endPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseend", eventTarget, endPoint.x, endPoint.y);
        assert.deepEqual(xScale.domain(), expectedXDomain, "xScale pans to the correct domain via drag (mouse)");
        assert.deepEqual(yScale.domain(), expectedYDomain, "yScale pans to the correct domain via drag (mouse)");
        svg.remove();
      });

      it("translates the scale correctly on dragging to outside of the component (mouse)", () => {
        let startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };
        let expectedXDomain = domainAfterPan(startPoint, endPoint, xScale, true);
        let expectedYDomain = domainAfterPan(startPoint, endPoint, yScale, false);
        TestMethods.triggerFakeMouseEvent("mousedown", eventTarget, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, endPoint.x, endPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseend", eventTarget, endPoint.x, endPoint.y);
        assert.deepEqual(xScale.domain(), expectedXDomain, "xScale pans to the correct domain via drag (mouse)");
        assert.deepEqual(yScale.domain(), expectedYDomain, "yScale pans to the correct domain via drag (mouse)");
        svg.remove();
      });

      it("translates multiple scales correctly on dragging (mouse)", () => {
        let xScale2 = new Plottable.Scales.Linear();
        xScale2.domain([0, 2 * SVG_WIDTH]).range([0, SVG_WIDTH]);
        panZoomInteraction.addXScale(xScale2);
        let startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };
        let expectedXDomain = domainAfterPan(startPoint, endPoint, xScale, true);
        let expectedXDomain2 = domainAfterPan(startPoint, endPoint, xScale2, true);
        TestMethods.triggerFakeMouseEvent("mousedown", eventTarget, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, endPoint.x, endPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseend", eventTarget, endPoint.x, endPoint.y);
        assert.deepEqual(xScale.domain(), expectedXDomain, "xScale pans to the correct domain via drag (mouse)");
        assert.deepEqual(xScale2.domain(), expectedXDomain2, "xScale2 pans to the correct domain via drag (mouse)");
        svg.remove();
      });

      it("translates the scale correctly on dragging (touch)", () => {
        let startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        let endPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT * 3 / 4 };
        let expectedXDomain = domainAfterPan(startPoint, endPoint, xScale, true);
        let expectedYDomain = domainAfterPan(startPoint, endPoint, yScale, false);
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint]);
        assert.deepEqual(xScale.domain(), expectedXDomain, "xScale pans to the correct domain via drag (touch)");
        assert.deepEqual(yScale.domain(), expectedYDomain, "yScale pans to the correct domain via drag (touch)");
        svg.remove();
      });

      it("translates the scale correctly on dragging to outside of the component (touch)", () => {
        let startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };
        let expectedXDomain = domainAfterPan(startPoint, endPoint, xScale, true);
        let expectedYDomain = domainAfterPan(startPoint, endPoint, yScale, false);
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint]);
        assert.deepEqual(xScale.domain(), expectedXDomain, "xScale pans to the correct domain via drag (touch)");
        assert.deepEqual(yScale.domain(), expectedYDomain, "yScale pans to the correct domain via drag (touch)");
        svg.remove();
      });

      it("translates multiple scales correctly on dragging (touch)", () => {
        let xScale2 = new Plottable.Scales.Linear();
        xScale2.domain([0, 2 * SVG_WIDTH]).range([0, SVG_WIDTH]);
        panZoomInteraction.addXScale(xScale2);
        let startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };
        let expectedXDomain = domainAfterPan(startPoint, endPoint, xScale, true);
        let expectedXDomain2 = domainAfterPan(startPoint, endPoint, xScale2, false);
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint]);
        assert.deepEqual(xScale.domain(), expectedXDomain, "xScale pans to the correct domain via drag (touch)");
        assert.deepEqual(xScale2.domain(), expectedXDomain2, "xScale2 pans to the correct domain via drag (touch)");
        svg.remove();
      });

      function domainAfterPan(startPoint: Plottable.Point, endPoint: Plottable.Point,
                              scale: Plottable.QuantitativeScale<number>, isHorizontal: boolean) {
        let delta = isHorizontal ? endPoint.x - startPoint.x : endPoint.y - startPoint.y;
        let domain = scale.domain();
        let range = isHorizontal ? SVG_WIDTH : SVG_HEIGHT;
        let diff = delta / range * (domain[1] - domain[0]);
        return domain.map((v) => v - diff);
      }
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

      it("magnifies the scale correctly (mousewheel)", () => {
        // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
        // https://github.com/ariya/phantomjs/issues/11289
        if (window.PHANTOMJS) {
          svg.remove();
          return;
        }

        let scrollPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        let deltaY = 500;
        let expectedXDomain = domainAfterWheel(deltaY, scrollPoint, xScale, true);
        let expectedYDomain = domainAfterWheel(deltaY, scrollPoint, yScale, true);

        TestMethods.triggerFakeWheelEvent("wheel", svg, scrollPoint.x, scrollPoint.y, deltaY);

        assert.deepEqual(xScale.domain(), expectedXDomain, "xScale zooms to the correct domain via scroll");
        assert.deepEqual(yScale.domain(), expectedYDomain, "yScale zooms to the correct domain via scroll");
        svg.remove();
      });

      it("magnifies multiple scales correctly (mousewheel)", () => {
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
        let expectedXDomain = domainAfterWheel(deltaY, scrollPoint, xScale, true);
        let expectedXDomain2 = domainAfterWheel(deltaY, scrollPoint, xScale2, true);

        TestMethods.triggerFakeWheelEvent("wheel", svg, scrollPoint.x, scrollPoint.y, deltaY );

        assert.deepEqual(xScale.domain(), expectedXDomain, "xScale zooms to the correct domain via scroll");
        assert.deepEqual(xScale2.domain(), expectedXDomain2, "xScale2 zooms to the correct domain via scroll");
        svg.remove();
      });

      it("magnifies the scale correctly (pinching)", () => {
        let startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        let startPoint2 = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let endPoint = { x: SVG_WIDTH * 3 / 4, y: SVG_HEIGHT * 3 / 4 };
        let expectedXDomain = domainAfterPinch(startPoint, startPoint2, startPoint, endPoint, xScale, true);
        let expectedYDomain = domainAfterPinch(startPoint, startPoint2, startPoint, endPoint, yScale, true);

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint, startPoint2], [0, 1] );
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1] );
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1] );
        assert.deepEqual(xScale.domain(), expectedXDomain, "xScale transforms to the correct domain via pinch");
        assert.deepEqual(yScale.domain(), expectedYDomain, "yScale transforms to the correct domain via pinch");
        svg.remove();
      });

      it("magnifies multiple scales correctly (pinching)", () => {
        let xScale2 = new Plottable.Scales.Linear();
        xScale2.domain([0, 2 * SVG_WIDTH]).range([0, SVG_WIDTH]);
        panZoomInteraction.addXScale(xScale2);
        let startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        let startPoint2 = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let endPoint = { x: SVG_WIDTH * 3 / 4, y: SVG_HEIGHT * 3 / 4 };
        let expectedXDomain = domainAfterPinch(startPoint, startPoint2, startPoint, endPoint, xScale, true);
        let expectedXDomain2 = domainAfterPinch(startPoint, startPoint2, startPoint, endPoint, xScale2, true);

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint, startPoint2], [0, 1] );
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1] );
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1] );
        assert.deepEqual(xScale.domain(), expectedXDomain, "xScale transforms to the correct domain via pinch");
        assert.deepEqual(xScale2.domain(), expectedXDomain2, "xScale2 transforms to the correct domain via pinch");
        svg.remove();
      });

      it("can pinch inside one component and not affect another component", () => {
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
        let endPoint = { x: SVG_WIDTH * 3 / 4, y: SVG_HEIGHT / 2 };
        let expectedXDomain = domainAfterPinch(startPoint, startPoint2, startPoint, endPoint, xScale, true);

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint, startPoint2], [0, 1] );
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1] );
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1] );
        assert.deepEqual(xScale.domain(), expectedXDomain, "xScale inside target component transforms via pinch");
        assert.deepEqual(xScale2.domain(), initialDomain, "xScale outside of target component does not transform via pinch");
        svg.remove();
      });

      function domainAfterPinch(startPoint: Plottable.Point, startPoint2: Plottable.Point,
                                endPoint: Plottable.Point, endPoint2: Plottable.Point,
                                scale: Plottable.QuantitativeScale<number>, isHorizontal: boolean) {
        let oldDistance = isHorizontal ? startPoint2.x - startPoint.x : startPoint2.y - startPoint.y;
        let newDistance = isHorizontal ? endPoint2.x - endPoint.x : endPoint2.y - endPoint.y;
        let delta = isHorizontal ? endPoint2.x - startPoint2.x : endPoint2.y - startPoint2.y;
        let zoomAmount = oldDistance / newDistance;

        let domain = scale.domain();
        let range = isHorizontal ? SVG_WIDTH : SVG_HEIGHT;
        let diff = delta / range * (domain[1] - domain[0]);
        return domain.map((v, i) => (v - domain[0] + diff) * zoomAmount + domain[0]);
      }

      function domainAfterWheel(deltaY: number,  scrollPoint: Plottable.Point,
                                scale: Plottable.QuantitativeScale<number>, isHorizontal: boolean) {
        let zoomAmount = Math.pow(2, deltaY * .002);
        let domain = scale.domain();
        let diff = (isHorizontal ? scrollPoint.x / SVG_WIDTH : scrollPoint.y / SVG_HEIGHT) * (domain[1] - domain[0]);
        return domain.map(function (v, i) { return (v - domain[0] - diff) * zoomAmount + domain[0] + diff; });
      }
    });

    describe("Setting minDomainExtent", () => {
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

      it("rejects negative extents", () => {
        // HACKHACK #2661: Cannot assert errors being thrown with description
        (<any> assert).throws(() => panZoomInteraction.minDomainExtent(xScale, -1), Error, "extent must be non-negative",
          "Correctly rejects -1");
        svg.remove();
      });

      it("can't set minDomainExtent() be larger than maxDomainExtent() for the same Scale", () => {
        let maximumDomainExtent = SVG_WIDTH / 2;
        panZoomInteraction.maxDomainExtent(xScale, maximumDomainExtent);

        let tooBigMinimumDomainExtent = maximumDomainExtent * 2;
        // HACKHACK #2661: Cannot assert errors being thrown with description
        (<any> assert).throws(() => panZoomInteraction.minDomainExtent(xScale, tooBigMinimumDomainExtent), Error,
          "minDomainExtent must be smaller than maxDomainExtent for the same Scale",
          "cannot have minDomainExtent larger than maxDomainExtent");
        svg.remove();
      });

      it("cannot go beyond the specified domainExtent (mousewheel)", () => {
        // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
        // https://github.com/ariya/phantomjs/issues/11289
        if (window.PHANTOMJS) {
          svg.remove();
          return;
        }

        let minimumDomainExtent = SVG_WIDTH / 4;
        let scrollPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        let deltaY = -3000;
        TestMethods.triggerFakeWheelEvent("wheel", svg, scrollPoint.x, scrollPoint.y, deltaY);
        let domainExtent = Math.abs(xScale.domain()[1] - xScale.domain()[0]);
        assert.operator(domainExtent, "<", minimumDomainExtent, "there is no zoom limit before setting minimun extent via scroll");

        panZoomInteraction.minDomainExtent(xScale, minimumDomainExtent);
        xScale.domain([0, SVG_WIDTH / 2]);
        TestMethods.triggerFakeWheelEvent("wheel", svg, scrollPoint.x, scrollPoint.y, deltaY);
        domainExtent = Math.abs(xScale.domain()[1] - xScale.domain()[0]);
        assert.strictEqual(domainExtent, minimumDomainExtent, "xScale zooms to the correct domain via scroll");
        svg.remove();
      });

      it("cannot go beyond the specified domainExtent (pinching)", () => {
        let minimumDomainExtent = SVG_WIDTH / 4;

        let startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        let startPoint2 = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let zoomAmount = 6;
        let endX = (startPoint2.x - startPoint.x) * zoomAmount + startPoint.x;
        let endY = (startPoint2.y - startPoint.y) * zoomAmount + startPoint.y;
        let endPoint = { x: endX, y: endY };

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint, startPoint2], [0, 1]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1]);

        let domainExtent = Math.abs(xScale.domain()[1] - xScale.domain()[0]);
        assert.operator(domainExtent, "<", minimumDomainExtent, "there is no zoom limit before setting minimun extent via pinch");

        panZoomInteraction.minDomainExtent(xScale, minimumDomainExtent);
        xScale.domain([0, SVG_WIDTH / 2]);
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint, startPoint2], [0, 1]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1]);
        domainExtent = Math.abs(xScale.domain()[1] - xScale.domain()[0]);
        assert.strictEqual(domainExtent, minimumDomainExtent, "xScale zooms to the correct domain via pinch");
        svg.remove();
      });
    });

    describe("Setting maxDomainExtent", () => {
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

      it("rejects non-positive extents", () => {
        // HACKHACK #2661: Cannot assert errors being thrown with description
        (<any> assert).throws(() => panZoomInteraction.maxDomainExtent(xScale, -1), Error, "extent must be positive",
          "Correctly rejects -1");
        // HACKHACK #2661: Cannot assert errors being thrown with description
        (<any> assert).throws(() => panZoomInteraction.maxDomainExtent(xScale, 0), Error, "extent must be positive",
          "Correctly rejects 0");
        svg.remove();
      });

      it("can't set maxDomainExtent() to be smaller than minDomainExtent() for the same Scale", () => {
        let minimumDomainExtent = SVG_WIDTH / 2;
        panZoomInteraction.minDomainExtent(xScale, minimumDomainExtent);
        let tooSmallMaximumDomainExtent = minimumDomainExtent / 2;
        // HACKHACK #2661: Cannot assert errors being thrown with description
        (<any> assert).throws(() => panZoomInteraction.maxDomainExtent(xScale, tooSmallMaximumDomainExtent), Error,
          "maxDomainExtent must be larger than minDomainExtent for the same Scale",
          "cannot have maxDomainExtent smaller than minDomainExtent");

        svg.remove();
      });

      it("cannot go beyond the specified domainExtent (mousewheel)", () => {
        // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
        // https://github.com/ariya/phantomjs/issues/11289
        if (window.PHANTOMJS) {
          svg.remove();
          return;
        }

        let maximumDomainExtent = SVG_WIDTH;
        let scrollPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        let deltaY = 3000;
        TestMethods.triggerFakeWheelEvent("wheel", svg, scrollPoint.x, scrollPoint.y, deltaY);
        let domainExtent = Math.abs(xScale.domain()[1] - xScale.domain()[0]);
        assert.operator(domainExtent, ">", maximumDomainExtent, "there is no zoom limit before setting maximun extent via scroll");

        xScale.domain([0, SVG_WIDTH / 2]);
        panZoomInteraction.maxDomainExtent(xScale, maximumDomainExtent);

        TestMethods.triggerFakeWheelEvent("wheel", svg, scrollPoint.x, scrollPoint.y, deltaY);
        domainExtent = Math.abs(xScale.domain()[1] - xScale.domain()[0]);
        assert.strictEqual(domainExtent, maximumDomainExtent, "xScale zooms to the correct domain via scroll");
        svg.remove();
      });

      it("cannot go beyond the specified domainExtent (pinching)", () => {
        let maximumDomainExtent = SVG_WIDTH;

        let startPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        let startPoint2 = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let zoomAmount = 1 / 6;
        let endX = (startPoint2.x - startPoint.x) * zoomAmount + startPoint.x;
        let endY = (startPoint2.y - startPoint.y) * zoomAmount + startPoint.y;
        let endPoint = { x: endX, y: endY };

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint, startPoint2], [0, 1]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1]);
        let domainExtent = Math.abs(xScale.domain()[1] - xScale.domain()[0]);
        assert.operator(domainExtent, ">", maximumDomainExtent, "there is no zoom limit before setting maximun extent via pinch");

        xScale.domain([0, SVG_WIDTH / 2]);
        panZoomInteraction.maxDomainExtent(xScale, maximumDomainExtent);
        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint, startPoint2], [0, 1]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1]);

        domainExtent = Math.abs(xScale.domain()[1] - xScale.domain()[0]);
        assert.strictEqual(domainExtent, maximumDomainExtent, "xScale zooms to the correct domain via pinch");
        svg.remove();
      });
    });

    describe("Registering and deregistering Pan and Zoom event callbacks", () => {
      let svg: d3.Selection<void>;
      let SVG_WIDTH = 400;
      let SVG_HEIGHT = 500;

      let eventTarget: d3.Selection<void>;

      let xScale: Plottable.QuantitativeScale<number>;
      let panZoomInteraction: Plottable.Interactions.PanZoom;

      interface PanZoomTestCallback {
        called: boolean;
        reset: () => void;
        (): void;
      }

      function makeCallback () {
        let callback = <PanZoomTestCallback> function(e: Event) {
          callback.called = true;
        };
        callback.called = false;
        callback.reset =  () => {
          callback.called = false;
        };
        return callback;
      }

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

      it("registers callback using onPanEnd", () => {
        let callback = makeCallback();
        let startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };

        assert.strictEqual(panZoomInteraction.onPanEnd(callback), panZoomInteraction, "registration returns the calling Interaction");

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint]);
        assert.isTrue(callback.called, "Interaction correctly triggers the callback (touch)");

        callback.reset();

        TestMethods.triggerFakeMouseEvent("mousedown", eventTarget, startPoint.x, startPoint.y);
        TestMethods.triggerFakeMouseEvent("mousemove", eventTarget, endPoint.x, endPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseend", eventTarget, endPoint.x, endPoint.y);
        TestMethods.triggerFakeMouseEvent("mouseup", eventTarget, endPoint.x, endPoint.y);
        assert.isTrue(callback.called, "Interaction correctly triggers the callback (mouse)");

        svg.remove();
      });

      it("registers callback using onZoomEnd", () => {
        let callback = makeCallback();
        let startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };
        let scrollPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        let deltaY = 3000;

        assert.strictEqual(panZoomInteraction.onZoomEnd(callback), panZoomInteraction, "registration returns the calling Interaction");

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint, scrollPoint], [0, 1]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1]);
        assert.isTrue(callback.called, "Interaction correctly triggers the callback (touch)");

        callback.reset();

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint]);
        assert.isFalse(callback.called, "Interaction does not trigger zoom callback on pan event (touch)");

        callback.reset();

        // HACKHACK PhantomJS doesn't implement fake creation of WheelEvents
        // https://github.com/ariya/phantomjs/issues/11289
        if (window.PHANTOMJS) {
          svg.remove();
          return;
        }

        TestMethods.triggerFakeWheelEvent("wheel", svg, scrollPoint.x, scrollPoint.y, deltaY);
        assert.isTrue(callback.called, "Interaction correctly triggers the callback (mouse)");
        svg.remove();
      });

      it("deregisters callback using offPanEnd", () => {
        let callback = makeCallback();
        let startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };

        panZoomInteraction.onPanEnd(callback);

        assert.strictEqual(panZoomInteraction.offPanEnd(callback), panZoomInteraction, "deregistration returns the calling Interaction");

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint]);
        assert.isFalse(callback.called, "callback should be disconnected from the Interaction");

        svg.remove();
      });

      it("deregisters callback using offZoomEnd", () => {
        let callback = makeCallback();
        let startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };
        let scrollPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };
        panZoomInteraction.onZoomEnd(callback);

        assert.strictEqual(panZoomInteraction.offZoomEnd(callback), panZoomInteraction, "deregistration returns the calling Interaction");

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint, scrollPoint], [0, 1]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1]);

        assert.isFalse(callback.called, "callback should be disconnected from the Interaction");

        svg.remove();
      });

      it("can register multiple onPanEnd callbacks", () => {
        let callback1 = makeCallback();
        let callback2 = makeCallback();
        let startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };

        panZoomInteraction.onPanEnd(callback1);
        panZoomInteraction.onPanEnd(callback2);

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint]);
        assert.isTrue(callback1.called, "Interaction should trigger the first callback");
        assert.isTrue(callback1.called, "Interaction should trigger the second callback");
        svg.remove();
      });

      it("can register multiple onZoomEnd callbacks", () => {
        let callback1 = makeCallback();
        let callback2 = makeCallback();
        let startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };
        let scrollPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };

        panZoomInteraction.onZoomEnd(callback1);
        panZoomInteraction.onZoomEnd(callback2);

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint, scrollPoint], [0, 1]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1]);

        assert.isTrue(callback1.called, "Interaction should trigger the first callback");
        assert.isTrue(callback1.called, "Interaction should trigger the second callback");
        svg.remove();
      });

      it("can deregister a onPanEnd callback without affecting the other ones", () => {
        let callback1 = makeCallback();
        let callback2 = makeCallback();
        let startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };

        panZoomInteraction.onPanEnd(callback1);
        panZoomInteraction.onPanEnd(callback2);
        panZoomInteraction.offPanEnd(callback1);

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint]);
        assert.isFalse(callback1.called, "Callback1 should be disconnected from the Interaction");
        assert.isTrue(callback2.called, "Callback2 should still exist on the Interaction");
        svg.remove();
      });

      it("can deregister a onZoomEnd callback without affecting the other ones", () => {
        let callback1 = makeCallback();
        let callback2 = makeCallback();
        let startPoint = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
        let endPoint = { x: -SVG_WIDTH / 2, y: -SVG_HEIGHT / 2 };
        let scrollPoint = { x: SVG_WIDTH / 4, y: SVG_HEIGHT / 4 };

        panZoomInteraction.onZoomEnd(callback1);
        panZoomInteraction.onZoomEnd(callback2);
        panZoomInteraction.offZoomEnd(callback1);

        TestMethods.triggerFakeTouchEvent("touchstart", eventTarget, [startPoint, scrollPoint], [0, 1]);
        TestMethods.triggerFakeTouchEvent("touchmove", eventTarget, [endPoint], [1]);
        TestMethods.triggerFakeTouchEvent("touchend", eventTarget, [endPoint], [1]);

        assert.isFalse(callback1.called, "Callback1 should be disconnected from the Interaction");
        assert.isTrue(callback2.called, "Callback2 should still exist on the Interaction");
        svg.remove();
      });
    });
  });
});

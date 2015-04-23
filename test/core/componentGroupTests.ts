///<reference path="../testReference.ts" />

var assert = chai.assert;


describe("ComponentGroups", () => {
  it("components in componentGroups overlap", () => {
    var c1 = makeFixedSizeComponent(10, 10);
    var c2 = new Plottable.Component.AbstractComponent();
    var c3 = new Plottable.Component.AbstractComponent();

    var cg = new Plottable.Component.Group([c1, c2, c3]);
    var svg = generateSVG(400, 400);
    cg._anchor(svg);
    (<any> c1)._addBox("test-box1");
    (<any> c2)._addBox("test-box2");
    (<any> c3)._addBox("test-box3");
    cg._computeLayout()._render();
    var t1 = svg.select(".test-box1");
    var t2 = svg.select(".test-box2");
    var t3 = svg.select(".test-box3");
    assertWidthHeight(t1, 10, 10, "rect1 sized correctly");
    assertWidthHeight(t2, 400, 400, "rect2 sized correctly");
    assertWidthHeight(t3, 400, 400, "rect3 sized correctly");
    svg.remove();
  });

  it("components can be added before and after anchoring", () => {
    var c1 = makeFixedSizeComponent(10, 10);
    var c2 = makeFixedSizeComponent(20, 20);
    var c3 = new Plottable.Component.AbstractComponent();

    var cg = new Plottable.Component.Group([c1]);
    var svg = generateSVG(400, 400);
    cg.below(c2)._anchor(svg);
    (<any> c1)._addBox("test-box1");
    (<any> c2)._addBox("test-box2");
    cg._computeLayout()._render();
    var t1 = svg.select(".test-box1");
    var t2 = svg.select(".test-box2");
    assertWidthHeight(t1, 10, 10, "rect1 sized correctly");
    assertWidthHeight(t2, 20, 20, "rect2 sized correctly");
    cg.below(c3);
    (<any> c3)._addBox("test-box3");
    cg._computeLayout()._render();
    var t3 = svg.select(".test-box3");
    assertWidthHeight(t3, 400, 400, "rect3 sized correctly");
    svg.remove();
  });

  it("componentGroup subcomponents have xOffset, yOffset of 0", () => {
    var cg = new Plottable.Component.Group();
    var c1 = new Plottable.Component.AbstractComponent();
    var c2 = new Plottable.Component.AbstractComponent();
    cg.below(c1).below(c2);

    var svg = generateSVG();
    cg._anchor(svg);
    cg._computeLayout(50, 50, 350, 350);

    var cgTranslate = d3.transform((<any> cg)._element.attr("transform")).translate;
    var c1Translate = d3.transform((<any> c1)._element.attr("transform")).translate;
    var c2Translate = d3.transform((<any> c2)._element.attr("transform")).translate;
    assert.equal(cgTranslate[0], 50, "componentGroup has 50 xOffset");
    assert.equal(cgTranslate[1], 50, "componentGroup has 50 yOffset");
    assert.equal(c1Translate[0], 0, "componentGroup has 0 xOffset");
    assert.equal(c1Translate[1], 0, "componentGroup has 0 yOffset");
    assert.equal(c2Translate[0], 0, "componentGroup has 0 xOffset");
    assert.equal(c2Translate[1], 0, "componentGroup has 0 yOffset");
    svg.remove();
    });

  it("detach() and _removeComponent work correctly for componentGroup", () => {
    var c1 = new Plottable.Component.AbstractComponent().classed("component-1", true);
    var c2 = new Plottable.Component.AbstractComponent().classed("component-2", true);
    var cg = new Plottable.Component.Group([c1, c2]);

    var svg = generateSVG(200, 200);
    cg.renderTo(svg);

    var c1Node = svg.select(".component-1").node();
    var c2Node = svg.select(".component-2").node();

    assert.isNotNull(c1Node, "component 1 was added to the DOM");
    assert.isNotNull(c2Node, "component 2 was added to the DOM");

    c2.detach();

    c1Node = svg.select(".component-1").node();
    c2Node = svg.select(".comopnent-2").node();

    assert.isNotNull(c1Node, "component 1 is still in the DOM");
    assert.isNull(c2Node, "component 2 was removed from the DOM");

    cg.detach();
    var cgNode = svg.select(".component-group").node();
    c1Node = svg.select(".component-1").node();

    assert.isNull(cgNode, "component group was removed from the DOM");
    assert.isNull(c1Node, "componet 1 was also removed from the DOM");

    cg.renderTo(svg);
    cgNode = svg.select(".component-group").node();
    c1Node = svg.select(".component-1").node();

    assert.isNotNull(cgNode, "component group was added back to the DOM");
    assert.isNotNull(c1Node, "componet 1 was also added back to the DOM");

    svg.remove();
  });

  it("detachAll() works as expected", () => {
    var cg = new Plottable.Component.Group();
    var c1 = new Plottable.Component.AbstractComponent();
    var c2 = new Plottable.Component.AbstractComponent();
    var c3 = new Plottable.Component.AbstractComponent();
    assert.isTrue(cg.empty(), "cg initially empty");
    cg.below(c1).below(c2).below(c3);
    assert.isFalse(cg.empty(), "cg not empty after merging components");
    cg.detachAll();
    assert.isTrue(cg.empty(), "cg empty after detachAll()");

    assert.isFalse((<any> c1)._isAnchored, "c1 was detached");
    assert.isFalse((<any> c2)._isAnchored, "c2 was detached");
    assert.isFalse((<any> c3)._isAnchored, "c3 was detached");
    assert.lengthOf(cg.components(), 0, "cg has no components");
  });

  describe("requests space based on contents, but occupies total offered space", () => {
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 400;

    it("with no Components", () => {
      var svg = generateSVG();
      var cg = new Plottable.Component.Group([]);

      var request = cg._requestedSpace(SVG_WIDTH, SVG_HEIGHT);
      verifySpaceRequest(request, 0, 0, false, false, "empty Group doesn't request any space");

      cg.renderTo(svg);
      assert.strictEqual(cg.width(), SVG_WIDTH, "occupies all offered width");
      assert.strictEqual(cg.height(), SVG_HEIGHT, "occupies all offered height");
      svg.remove();
    });

    it("with a non-fixed-size Component", () => {
      var svg = generateSVG();
      var c1 = new Plottable.Component.AbstractComponent();
      var c2 = new Plottable.Component.AbstractComponent();
      var cg = new Plottable.Component.Group([c1, c2]);

      var groupRequest = cg._requestedSpace(SVG_WIDTH, SVG_HEIGHT);
      var c1Request = c1._requestedSpace(SVG_WIDTH, SVG_HEIGHT);
      assert.deepEqual(groupRequest, c1Request, "request reflects request of sub-component");
      assert.isFalse(cg._isFixedWidth(), "width is not fixed if subcomponents are not fixed width");
      assert.isFalse(cg._isFixedHeight(), "height is not fixed if subcomponents are not fixed height");

      cg.renderTo(svg);
      assert.strictEqual(cg.width(), SVG_WIDTH, "occupies all offered width");
      assert.strictEqual(cg.height(), SVG_HEIGHT, "occupies all offered height");
      svg.remove();
    });

    it("with fixed-size Components", () => {
      var svg = generateSVG();
      var tall = new Mocks.FixedSizeComponent(SVG_WIDTH/4, SVG_WIDTH/2);
      var wide = new Mocks.FixedSizeComponent(SVG_WIDTH/2, SVG_WIDTH/4);

      var cg = new Plottable.Component.Group([tall, wide]);

      var request = cg._requestedSpace(SVG_WIDTH, SVG_HEIGHT);
      assert.strictEqual(request.width, SVG_WIDTH/2,"requested enough space for widest Component");
      assert.isFalse(request.wantsWidth, "does not request more width if enough was supplied for widest Component");
      assert.strictEqual(request.height, SVG_HEIGHT/2, "requested enough space for tallest Component");
      assert.isFalse(request.wantsHeight, "does not request more height if enough was supplied for tallest Component");

      var constrainedRequest = cg._requestedSpace(SVG_WIDTH/10, SVG_HEIGHT/10);
      assert.strictEqual(constrainedRequest.width, SVG_WIDTH/2, "requested enough space for widest Component");
      assert.isTrue(constrainedRequest.wantsWidth, "requests more width if not enough was supplied for widest Component");
      assert.strictEqual(constrainedRequest.height, SVG_HEIGHT/2, "requested enough space for tallest Component");
      assert.isTrue(constrainedRequest.wantsHeight, "requests more height if not enough was supplied for tallest Component");

      cg.renderTo(svg);
      assert.strictEqual(cg.width(), SVG_WIDTH, "occupies all offered width");
      assert.strictEqual(cg.height(), SVG_HEIGHT, "occupies all offered height");
      svg.remove();
    });
  });

    describe("Merging components works as expected", () => {
      var c1 = new Plottable.Component.AbstractComponent();
      var c2 = new Plottable.Component.AbstractComponent();
      var c3 = new Plottable.Component.AbstractComponent();
      var c4 = new Plottable.Component.AbstractComponent();

      describe("above()", () => {

        it("Component.above works as expected (Component.above Component)",() => {
          var cg: Plottable.Component.Group = c2.above(c1);
          var innerComponents: Plottable.Component.AbstractComponent[] = cg.components();
          assert.lengthOf(innerComponents, 2, "There are two components");
          assert.equal(innerComponents[0], c1, "first component correct");
          assert.equal(innerComponents[1], c2, "second component correct");
        });

        it("Component.above works as expected (Component.above ComponentGroup)",() => {
          var cg = new Plottable.Component.Group([c1, c2, c3]);
          var cg2 = c4.above(cg);
          assert.equal(cg, cg2, "c4.above(cg) returns cg");
          var components: Plottable.Component.AbstractComponent[] = cg.components();
          assert.lengthOf(components, 4, "four components");
          assert.equal(components[2], c3, "third component in third");
          assert.equal(components[3], c4, "fourth component is last");
        });

        it("Component.above works as expected (ComponentGroup.above Component)",() => {
          var cg = new Plottable.Component.Group([c2, c3, c4]);
          var cg2 = cg.above(c1);
          assert.equal(cg, cg2, "cg.merge(c1) returns cg");
          var components: Plottable.Component.AbstractComponent[] = cg.components();
          assert.lengthOf(components, 4, "there are four components");
          assert.equal(components[0], c1, "first is first");
          assert.equal(components[3], c4, "fourth is fourth");
        });

        it("Component.above works as expected (ComponentGroup.above ComponentGroup)",() => {
          var cg1 = new Plottable.Component.Group([c1, c2]);
          var cg2 = new Plottable.Component.Group([c3, c4]);
          var cg = cg1.above(cg2);
          assert.equal(cg, cg1, "merged == cg1");
          assert.notEqual(cg, cg2, "merged != cg2");
          var components: Plottable.Component.AbstractComponent[] = cg.components();
          assert.lengthOf(components, 3, "there are three inner components");
          assert.equal(components[0], cg2, "componentGroup2 inside componentGroup1");
          assert.equal(components[1], c1, "components are inside");
          assert.equal(components[2], c2, "components are inside");
        });

      });

      describe("below()",() => {

        it("Component.below works as expected (Component.below Component)",() => {
          var cg: Plottable.Component.Group = c1.below(c2);
          var innerComponents: Plottable.Component.AbstractComponent[] = cg.components();
          assert.lengthOf(innerComponents, 2, "There are two components");
          assert.equal(innerComponents[0], c1, "first component correct");
          assert.equal(innerComponents[1], c2, "second component correct");
        });

        it("Component.below works as expected (Component.below ComponentGroup)",() => {
          var cg = new Plottable.Component.Group([c2, c3, c4]);
          var cg2 = c1.below(cg);
          assert.equal(cg, cg2, "c1.below(cg) returns cg");
          var components: Plottable.Component.AbstractComponent[] = cg.components();
          assert.lengthOf(components, 4, "four components");
          assert.equal(components[0], c1, "first component in front");
          assert.equal(components[1], c2, "second component is second");
        });

        it("Component.below works as expected (ComponentGroup.below Component)",() => {
          var cg = new Plottable.Component.Group([c1, c2, c3]);
          var cg2 = cg.below(c4);
          assert.equal(cg, cg2, "cg.merge(c4) returns cg");
          var components: Plottable.Component.AbstractComponent[] = cg.components();
          assert.lengthOf(components, 4, "there are four components");
          assert.equal(components[0], c1, "first is first");
          assert.equal(components[3], c4, "fourth is fourth");
        });

        it("Component.below works as expected (ComponentGroup.below ComponentGroup)",() => {
          var cg1 = new Plottable.Component.Group([c1, c2]);
          var cg2 = new Plottable.Component.Group([c3, c4]);
          var cg = cg1.below(cg2);
          assert.equal(cg, cg1, "merged group == cg1");
          assert.notEqual(cg, cg2, "merged group != cg2");
          var components: Plottable.Component.AbstractComponent[] = cg.components();
          assert.lengthOf(components, 3, "there are three inner components");
          assert.equal(components[0], c1, "components are inside");
          assert.equal(components[1], c2, "components are inside");
          assert.equal(components[2], cg2, "componentGroup2 inside componentGroup1");
        });

      });

    });

  describe("getClosestPlotData()", () => {
    it("handles empty groups gracefully", () => {
      var cg = new Plottable.Component.Group();
      var closest = cg.getClosestPlotData({ x: 0, y: 0 });

      assert.lengthOf(closest.data, 0, "returns empty data");
      assert.lengthOf(closest.pixelPoints, 0, "returns empty pixelPoints");
      assert.isTrue(closest.selection.empty(), "returns empty selection");
      assert.isNull(closest.plot, "returns null plot");
    });

    describe("non-empty group", () => {
      var svg: D3.Selection;
      var xScale: Plottable.Scale.Linear;
      var yScale: Plottable.Scale.Linear;
      var data: any[];
      var data2: any[];
      var scatterPlot: Plottable.Plot.Scatter<number, number>;
      var barPlot: Plottable.Plot.Bar<number, number>;
      var group: Plottable.Component.Group;
      var bars: D3.Selection;
      var points: D3.Selection;

      function assertPlotDataEqual(expected: Plottable.Plot.PlotData, actual: Plottable.Plot.PlotData,
          msg: string) {
        assert.deepEqual(expected.data, actual.data, msg);
        assert.closeTo(expected.pixelPoints[0].x, actual.pixelPoints[0].x, 0.01, msg);
        assert.closeTo(expected.pixelPoints[0].y, actual.pixelPoints[0].y, 0.01, msg);
        assert.deepEqual(expected.selection, actual.selection, msg);
        assert.deepEqual(expected.plot, actual.plot, msg);
      }

      beforeEach(() => {
        // setup two plots and add them to a group
        svg = generateSVG(400, 400);
        xScale = new Plottable.Scale.Linear();
        yScale = new Plottable.Scale.Linear();
        data = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
        data2 = [{ x: 1, y: 2 }, { x: 3, y: 4 }];

        scatterPlot = new Plottable.Plot.Scatter(xScale, yScale)
            .project("x", "x", xScale)
            .project("y", "y", yScale)
            .addDataset(data);

        barPlot = new Plottable.Plot.Bar(xScale, yScale)
            .project("x", "x", xScale)
            .project("y", "y", yScale)
            .addDataset(data2);

        group = new Plottable.Component.Group([scatterPlot, barPlot]);
        group.renderTo(svg);

        // setup expected PlotData
        bars = d3.selectAll(".bar-area rect");
        points = d3.selectAll(".scatter-plot path");
      });

      it("returns scatter PlotData when closest to it", () => {
        var d0 = data[0];
        var d0Px = {
          x: xScale.scale(d0.x),
          y: yScale.scale(d0.y)
        };

        var expected = {
          data: [d0],
          pixelPoints: [d0Px],
          plot: scatterPlot,
          selection: d3.select(points[0][0])
        };

        var closest = group.getClosestPlotData({ x: d0Px.x, y: d0Px.y });
        assertPlotDataEqual(expected, closest);

        svg.remove();
      });

      it("returns scatter PlotData when closest to it but overlapping a bar", () => {
        var d1 = data[1];
        var d1Px = {
          x: xScale.scale(d1.x),
          y: yScale.scale(d1.y)
        };

        var expected = {
          data: [d1],
          pixelPoints: [d1Px],
          plot: scatterPlot,
          selection: d3.select(points[0][1])
        };

        closest = group.getClosestPlotData({ x: d1Px.x, y: d1Px.y });
        assertPlotDataEqual(expected, closest);

        svg.remove();
      });

      it("returns bar PlotData when closest to it", () => {
        var d2 = data2[0];
        var d2Px = {
          x: xScale.scale(d2.x),
          y: yScale.scale(d2.y)
        };


        var expected = {
          data: [d2],
          pixelPoints: [d2Px],
          plot: barPlot,
          selection: d3.select(bars[0][0])
        };

        closest = group.getClosestPlotData({ x: d2Px.x, y: d2Px.y - 1 });
        assertPlotDataEqual(expected, closest);

        svg.remove();
      });
    });
  });
});

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

  it("components in componentGroups occupies all available space", () => {
    var svg = generateSVG(400, 400);
    var xAxis = new Plottable.Axis.Numeric(new Plottable.Scale.Linear(), "bottom");

    var leftLabel = new Plottable.Component.Label("LEFT").xAlign("left");
    var rightLabel = new Plottable.Component.Label("RIGHT").xAlign("right");

    var labelGroup = new Plottable.Component.Group([leftLabel, rightLabel]);

    var table = new Plottable.Component.Table([
        [labelGroup],
        [xAxis]
    ]);

    table.renderTo(svg);

    assertBBoxNonIntersection((<any>leftLabel)._element.select(".bounding-box"), (<any>rightLabel)._element.select(".bounding-box"));
    svg.remove();
  });

  it("components can be added before and after anchoring", () => {
    var c1 = makeFixedSizeComponent(10, 10);
    var c2 = makeFixedSizeComponent(20, 20);
    var c3 = new Plottable.Component.AbstractComponent();

    var cg = new Plottable.Component.Group([c1]);
    var svg = generateSVG(400, 400);
    cg.merge(c2)._anchor(svg);
    (<any> c1)._addBox("test-box1");
    (<any> c2)._addBox("test-box2");
    cg._computeLayout()._render();
    var t1 = svg.select(".test-box1");
    var t2 = svg.select(".test-box2");
    assertWidthHeight(t1, 10, 10, "rect1 sized correctly");
    assertWidthHeight(t2, 20, 20, "rect2 sized correctly");
    cg.merge(c3);
    (<any> c3)._addBox("test-box3");
    cg._computeLayout()._render();
    var t3 = svg.select(".test-box3");
    assertWidthHeight(t3, 400, 400, "rect3 sized correctly");
    svg.remove();
  });

  it("component fixity is computed appropriately", () => {
    var cg = new Plottable.Component.Group();
    var c1 = new Plottable.Component.AbstractComponent();
    var c2 = new Plottable.Component.AbstractComponent();

    cg.merge(c1).merge(c2);
    assert.isFalse(cg._isFixedHeight(), "height not fixed when both components unfixed");
    assert.isFalse(cg._isFixedWidth(), "width not fixed when both components unfixed");

    fixComponentSize(c1, 10, 10);
    assert.isFalse(cg._isFixedHeight(), "height not fixed when one component unfixed");
    assert.isFalse(cg._isFixedWidth(), "width not fixed when one component unfixed");

    fixComponentSize(c2, null, 10);
    assert.isFalse(cg._isFixedHeight(), "height unfixed when both components fixed");
    assert.isFalse(cg._isFixedWidth(), "width unfixed when one component unfixed");
  });

  it("componentGroup subcomponents have xOffset, yOffset of 0", () => {
    var cg = new Plottable.Component.Group();
    var c1 = new Plottable.Component.AbstractComponent();
    var c2 = new Plottable.Component.AbstractComponent();
    cg.merge(c1).merge(c2);

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
    cg.merge(c1).merge(c2).merge(c3);
    assert.isFalse(cg.empty(), "cg not empty after merging components");
    cg.detachAll();
    assert.isTrue(cg.empty(), "cg empty after detachAll()");

    assert.isFalse((<any> c1)._isAnchored, "c1 was detached");
    assert.isFalse((<any> c2)._isAnchored, "c2 was detached");
    assert.isFalse((<any> c3)._isAnchored, "c3 was detached");
    assert.lengthOf(cg.components(), 0, "cg has no components");
  });

  describe("ComponentGroup._requestedSpace works as expected", () => {
    it("_works for an empty ComponentGroup", () => {
        var cg = new Plottable.Component.Group();
        var request = cg._requestedSpace(10, 10);
        verifySpaceRequest(request, 0, 0, false, false, "");
    });

    it("works for a ComponentGroup with only proportional-size components", () => {
      var cg = new Plottable.Component.Group();
      var c1 = new Plottable.Component.AbstractComponent();
      var c2 = new Plottable.Component.AbstractComponent();
      cg.merge(c1).merge(c2);
      var request = cg._requestedSpace(10, 10);
      verifySpaceRequest(request, 0, 0, false, false, "");
    });

    it("works when there are fixed-size components", () => {
      var cg = new Plottable.Component.Group();
      var c1 = new Plottable.Component.AbstractComponent();
      var c2 = new Plottable.Component.AbstractComponent();
      var c3 = new Plottable.Component.AbstractComponent();
      cg.merge(c1).merge(c2).merge(c3);
      fixComponentSize(c1, null, 10);
      fixComponentSize(c2, null, 50);
      var request = cg._requestedSpace(10, 10);
      verifySpaceRequest(request, 0, 50, false, true, "");
    });
  });

    describe("Component.merge works as expected", () => {
      var c1 = new Plottable.Component.AbstractComponent();
      var c2 = new Plottable.Component.AbstractComponent();
      var c3 = new Plottable.Component.AbstractComponent();
      var c4 = new Plottable.Component.AbstractComponent();

      it("Component.merge works as expected (Component.merge Component)", () => {
        var cg: Plottable.Component.Group = c1.merge(c2);
        var innerComponents: Plottable.Component.AbstractComponent[] = cg.components();
        assert.lengthOf(innerComponents, 2, "There are two components");
        assert.equal(innerComponents[0], c1, "first component correct");
        assert.equal(innerComponents[1], c2, "second component correct");
      });

      it("Component.merge works as expected (Component.merge ComponentGroup)", () => {
        var cg = new Plottable.Component.Group([c2,c3,c4]);
        var cg2 = c1.merge(cg);
        assert.equal(cg, cg2, "c.merge(cg) returns cg");
        var components: Plottable.Component.AbstractComponent[] = cg.components();
        assert.lengthOf(components, 4, "four components");
        assert.equal(components[0], c1, "first component in front");
        assert.equal(components[1], c2, "second component is second");
      });

      it("Component.merge works as expected (ComponentGroup.merge Component)", () => {
        var cg = new Plottable.Component.Group([c1,c2,c3]);
        var cg2 = cg.merge(c4);
        assert.equal(cg, cg2, "cg.merge(c) returns cg");
        var components: Plottable.Component.AbstractComponent[] = cg.components();
        assert.lengthOf(components, 4, "there are four components");
        assert.equal(components[0], c1, "first is first");
        assert.equal(components[3], c4, "fourth is fourth");
        });

      it("Component.merge works as expected (ComponentGroup.merge ComponentGroup)", () => {
        var cg1 = new Plottable.Component.Group([c1,c2]);
        var cg2 = new Plottable.Component.Group([c3,c4]);
        var cg = cg1.merge(cg2);
        assert.equal(cg, cg1, "merged == cg1");
        assert.notEqual(cg, cg2, "merged != cg2");
        var components: Plottable.Component.AbstractComponent[] = cg.components();
        assert.lengthOf(components, 3, "there are three inner components");
        assert.equal(components[0], c1, "components are inside");
        assert.equal(components[1], c2, "components are inside");
        assert.equal(components[2], cg2, "componentGroup2 inside componentGroup1");
      });
    });
});

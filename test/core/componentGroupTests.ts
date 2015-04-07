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

  describe("Sizing based on contents", () => {
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 400;

    it("no Components", () => {
      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var cg = new Plottable.Component.Group([]);
      cg.renderTo(svg);
      assert.strictEqual(cg.width(), 0, "empty Group has zero width");
      assert.strictEqual(cg.height(), 0, "empty Group has zero height");
      svg.remove();
    });

    it("expanding Components", () => {
      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var cg = new Plottable.Component.Group([
        new Plottable.Component.AbstractComponent(),
        new Plottable.Component.AbstractComponent()
      ]);
      cg.renderTo(svg);
      assert.strictEqual(cg.width(), SVG_WIDTH, "expands to fill available width");
      assert.strictEqual(cg.height(), SVG_HEIGHT, "expands to fill available height");
      svg.remove();
    });

    it("one expanding and one fixed-size Component", () => {
      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var cg = new Plottable.Component.Group([
        new Plottable.Component.AbstractComponent(),
        new Mocks.FixedSizeComponent(SVG_WIDTH / 2, SVG_HEIGHT / 2)
      ]);
      cg.renderTo(svg);
      assert.strictEqual(cg.width(), SVG_WIDTH, "expands to fill available width");
      assert.strictEqual(cg.height(), SVG_HEIGHT, "expands to fill available height");
      svg.remove();
    });

    it("fixed-size Components, same x and same y alignments", () => {
      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var tall = new Mocks.FixedSizeComponent(SVG_WIDTH / 4, SVG_HEIGHT / 2);
      var wide = new Mocks.FixedSizeComponent(SVG_WIDTH / 2, SVG_HEIGHT / 4);
      var cg = new Plottable.Component.Group([ tall, wide ]);
      cg.renderTo(svg);
      var largestWidth = cg.components().map((c) => c.width()).sort((a, b) => b - a)[0];
      assert.strictEqual(cg.width(), largestWidth, "takes on the width of widest fixed-size component");
      var largestHeight = cg.components().map((c) => c.height()).sort((a, b) => b - a)[0];
      assert.strictEqual(cg.height(), largestHeight, "takes on the height of tallest fixed-size component");
      svg.remove();
    });

    it("fixed-size Components, different x alignments", () => {
      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var left = new Mocks.FixedSizeComponent(SVG_WIDTH / 4, SVG_HEIGHT / 4).xAlign("left");
      var right = new Mocks.FixedSizeComponent(SVG_WIDTH / 4, SVG_HEIGHT / 4).xAlign("right");
      var cg = new Plottable.Component.Group([ left, right ]);
      cg.renderTo(svg);
      assert.strictEqual(cg.width(), SVG_WIDTH, "expands to fill available width");
      assert.strictEqual(cg.height(), left.height(), "takes on the height of fixed-size components");
      svg.remove();
    });

    it("fixed-size Components, different y alignments", () => {
      var svg = generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var top = new Mocks.FixedSizeComponent(SVG_WIDTH / 4, SVG_HEIGHT / 4).yAlign("top");
      var bottom = new Mocks.FixedSizeComponent(SVG_WIDTH / 4, SVG_HEIGHT / 4).yAlign("bottom");
      var cg = new Plottable.Component.Group([ top, bottom ]);
      cg.renderTo(svg);
      assert.strictEqual(cg.width(), top.width(), "takes on the width of fixed-size components");
      assert.strictEqual(cg.height(), SVG_HEIGHT, "expands to fill available height");
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
});

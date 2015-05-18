///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("ComponentGroups", () => {
  it("append()", () => {
    var componentGroup = new Plottable.Components.Group();

    var c1 = new Plottable.Component();
    componentGroup.append(c1);
    assert.deepEqual(componentGroup.components(), [c1], "Component 1 was added to the Group");

    var c2 = new Plottable.Component();
    componentGroup.append(c2);
    assert.deepEqual(componentGroup.components(), [c1, c2], "appended Component 2 to the Group");

    componentGroup.append(c1);
    assert.deepEqual(componentGroup.components(), [c1, c2], "adding an already-added Component does nothing");

    var svg = TestMethods.generateSVG();
    componentGroup.renderTo(svg);
    var c3 = new Plottable.Component();
    componentGroup.append(c3);
    assert.deepEqual(componentGroup.components(), [c1, c2, c3], "Components can be append()-ed after rendering");

    svg.remove();
  });

  it("can add null to a Group without failing", () => {
    var cg1 = new Plottable.Components.Group();
    var c = new Plottable.Component;

    cg1.append(c);

    assert.strictEqual(cg1.components().length, 1,
      "there should first be 1 element in the group");

    assert.doesNotThrow(() => cg1.append(null));

    assert.strictEqual(cg1.components().length, 1,
      "adding null to a group should have no effect on the group");
  });

  it("append()-ing a Component to the Group should detach() it from its current location", () => {
    var c1 = new Plottable.Component;
    var svg = TestMethods.generateSVG();
    c1.renderTo(svg);
    var group = new Plottable.Components.Group();
    group.append(c1);
    assert.isFalse(svg.node().hasChildNodes(), "Component was detach()-ed");
    svg.remove();
  });

  it("remove()", () => {
    var c0 = new Plottable.Component();
    var c1 = new Plottable.Component();
    var c2 = new Plottable.Component();
    var componentGroup = new Plottable.Components.Group([c0, c1, c2]);

    componentGroup.remove(c1);
    assert.deepEqual(componentGroup.components(), [c0, c2], "removing a Component respects the order of the remaining Components");

    var svg = TestMethods.generateSVG();
    c1.renderTo(svg);
    componentGroup.remove(c1);
    assert.deepEqual(componentGroup.components(), [c0, c2],
    "removing a Component not in the Group does not remove Components from the Group");
    assert.strictEqual(svg.node().childNodes[0], (<D3.Selection> (<any> c1)._element).node(), "The Component not in the Group stayed put");

    svg.remove();
  });

  it("detach()-ing a Component that is in the Group removes it from the Group", () => {
    var c0 = new Plottable.Component();
    var componentGroup = new Plottable.Components.Group([c0]);
    var svg = TestMethods.generateSVG();
    componentGroup.renderTo(svg);
    c0.detach();
    assert.lengthOf(componentGroup.components(), 0, "Component is no longer in the Group");
    assert.isNull(c0.parent(), "Component disconnected from Group");
    svg.remove();
  });

  it("can move components to other groups after anchoring", () => {
    var svg = TestMethods.generateSVG();

    var cg1 = new Plottable.Components.Group();
    var cg2 = new Plottable.Components.Group();
    var c = new Plottable.Component();

    cg1.append(c);

    cg1.renderTo(svg);
    cg2.renderTo(svg);

    assert.strictEqual(cg2.components().length, 0,
      "second group should have no component before movement");

    assert.strictEqual(cg1.components().length, 1,
      "first group should have 1 component before movement");

    assert.strictEqual(c.parent(), cg1,
      "component's parent before moving should be the group 1"
    );

    assert.doesNotThrow(() => cg2.append(c), Error,
      "should be able to move components between groups after anchoring"
    );

    assert.strictEqual(cg2.components().length, 1,
      "second group should have 1 component after movement");

    assert.strictEqual(cg1.components().length, 0,
      "first group should have no components after movement");

    assert.strictEqual(c.parent(), cg2,
      "component's parent after movement should be the group 2"
    );

    svg.remove();
  });

  it("has()", () => {
    var c0 = new Plottable.Component();
    var componentGroup = new Plottable.Components.Group([c0]);
    assert.isTrue(componentGroup.has(c0), "correctly checks that Component is in the Group");
    componentGroup.remove(c0);
    assert.isFalse(componentGroup.has(c0), "correctly checks that Component is no longer in the Group");
    componentGroup.append(c0);
    assert.isTrue(componentGroup.has(c0), "correctly checks that Component is in the Group again");
  });

  it("components in componentGroups overlap", () => {
    var c1 = TestMethods.makeFixedSizeComponent(10, 10);
    var c2 = new Plottable.Component();
    var c3 = new Plottable.Component();

    var cg = new Plottable.Components.Group([c1, c2, c3]);
    var svg = TestMethods.generateSVG(400, 400);
    cg.anchor(svg);
    (<any> c1)._addBox("test-box1");
    (<any> c2)._addBox("test-box2");
    (<any> c3)._addBox("test-box3");
    cg.computeLayout().render();
    var t1 = svg.select(".test-box1");
    var t2 = svg.select(".test-box2");
    var t3 = svg.select(".test-box3");
    TestMethods.assertWidthHeight(t1, 10, 10, "rect1 sized correctly");
    TestMethods.assertWidthHeight(t2, 400, 400, "rect2 sized correctly");
    TestMethods.assertWidthHeight(t3, 400, 400, "rect3 sized correctly");
    svg.remove();
  });

  it("detach()", () => {
    var c1 = new Plottable.Component().classed("component-1", true);
    var c2 = new Plottable.Component().classed("component-2", true);
    var cg = new Plottable.Components.Group([c1, c2]);

    var svg = TestMethods.generateSVG(200, 200);
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

  describe("requests space based on contents, but occupies total offered space", () => {
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 400;

    it("with no Components", () => {
      var svg = TestMethods.generateSVG();
      var cg = new Plottable.Components.Group([]);

      var request = cg.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
      TestMethods.verifySpaceRequest(request, 0, 0, "empty Group doesn't request any space");

      cg.renderTo(svg);
      assert.strictEqual(cg.width(), SVG_WIDTH, "occupies all offered width");
      assert.strictEqual(cg.height(), SVG_HEIGHT, "occupies all offered height");
      svg.remove();
    });

    it("with a non-fixed-size Component", () => {
      var svg = TestMethods.generateSVG();
      var c1 = new Plottable.Component();
      var c2 = new Plottable.Component();
      var cg = new Plottable.Components.Group([c1, c2]);

      var groupRequest = cg.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
      var c1Request = c1.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
      assert.deepEqual(groupRequest, c1Request, "request reflects request of sub-component");
      assert.isFalse(cg.fixedWidth(), "width is not fixed if subcomponents are not fixed width");
      assert.isFalse(cg.fixedHeight(), "height is not fixed if subcomponents are not fixed height");

      cg.renderTo(svg);
      assert.strictEqual(cg.width(), SVG_WIDTH, "occupies all offered width");
      assert.strictEqual(cg.height(), SVG_HEIGHT, "occupies all offered height");
      svg.remove();
    });

    it("with fixed-size Components", () => {
      var svg = TestMethods.generateSVG();
      var tall = new Mocks.FixedSizeComponent(SVG_WIDTH / 4, SVG_WIDTH / 2);
      var wide = new Mocks.FixedSizeComponent(SVG_WIDTH / 2, SVG_WIDTH / 4);

      var cg = new Plottable.Components.Group([tall, wide]);

      var request = cg.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
      assert.strictEqual(request.minWidth, SVG_WIDTH / 2, "requested enough space for widest Component");
      assert.strictEqual(request.minHeight, SVG_HEIGHT / 2, "requested enough space for tallest Component");

      var constrainedRequest = cg.requestedSpace(SVG_WIDTH / 10, SVG_HEIGHT / 10);
      assert.strictEqual(constrainedRequest.minWidth, SVG_WIDTH / 2, "requested enough space for widest Component");
      assert.strictEqual(constrainedRequest.minHeight, SVG_HEIGHT / 2, "requested enough space for tallest Component");

      cg.renderTo(svg);
      assert.strictEqual(cg.width(), SVG_WIDTH, "occupies all offered width");
      assert.strictEqual(cg.height(), SVG_HEIGHT, "occupies all offered height");
      svg.remove();
    });
  });
});

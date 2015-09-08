///<reference path="../testReference.ts" />

describe("ComponentGroups", () => {
  describe("Basic add/remove/has functionality", () => {
    it("appends Components with append()", () => {
      let componentGroup = new Plottable.Components.Group();

      let c1 = new Plottable.Component();
      componentGroup.append(c1);
      assert.deepEqual(componentGroup.components(), [c1], "Component 1 was added to the Group");

      let c2 = new Plottable.Component();
      componentGroup.append(c2);
      assert.deepEqual(componentGroup.components(), [c1, c2], "appended Component 2 to the Group");

      componentGroup.append(c1);
      assert.deepEqual(componentGroup.components(), [c1, c2], "adding an already-added Component does nothing");

      let svg = TestMethods.generateSVG();
      componentGroup.renderTo(svg);
      let c3 = new Plottable.Component();
      componentGroup.append(c3);
      assert.deepEqual(componentGroup.components(), [c1, c2, c3], "Components can be append()ed after rendering");

      svg.remove();
    });

    it("can append() null to a Group without failing", () => {
      let cg1 = new Plottable.Components.Group();
      let c = new Plottable.Component;

      cg1.append(c);

      assert.strictEqual(cg1.components().length, 1,
        "there should first be 1 element in the group");

      assert.doesNotThrow(() => cg1.append(null));

      assert.strictEqual(cg1.components().length, 1,
        "adding null to a group should have no effect on the group");
    });

    it("removes Components using remove()", () => {
      let c0 = new Plottable.Component();
      let c1 = new Plottable.Component();
      let c2 = new Plottable.Component();
      let componentGroup = new Plottable.Components.Group([c0, c1, c2]);

      componentGroup.remove(c1);
      assert.deepEqual(componentGroup.components(), [c0, c2], "removing a Component respects the order of the remaining Components");

      let svg = TestMethods.generateSVG();
      c1.renderTo(svg);
      componentGroup.remove(c1);
      assert.deepEqual(componentGroup.components(), [c0, c2],
      "removing a Component not in the Group does not remove Components from the Group");
      assert.strictEqual((<SVGElement> c1.content().node()).ownerSVGElement, svg.node(), "The Component not in the Group stayed put");

      svg.remove();
    });

    it("checks for Components using has()", () => {
      let c0 = new Plottable.Component();
      let componentGroup = new Plottable.Components.Group([c0]);
      assert.isTrue(componentGroup.has(c0), "correctly checks that Component is in the Group");
      componentGroup.remove(c0);
      assert.isFalse(componentGroup.has(c0), "correctly checks that Component is no longer in the Group");
      componentGroup.append(c0);
      assert.isTrue(componentGroup.has(c0), "correctly checks that Component is in the Group again");
    });
  });

  describe("detach()ing constituent Components", () => {
    it("takes its constutuent Components with it when detach()ed or anchor()ed", () => {
      function isInDOM(component: Plottable.Component) {
        let contentNode = component.content().node();
        return contentNode != null && Plottable.Utils.DOM.boundingSVG(<SVGElement> contentNode) != null;
      };

      let c1 = new Plottable.Component();
      let c2 = new Plottable.Component();
      let cg = new Plottable.Components.Group([c1, c2]);

      let svg = TestMethods.generateSVG(200, 200);

      cg.renderTo(svg);
      assert.isTrue(isInDOM(cg), "Group was added to the DOM");
      assert.isTrue(isInDOM(c1), "Component 1 was added to the DOM");
      assert.isTrue(isInDOM(c2), "Component 2 was added to the DOM");

      cg.detach();
      assert.isFalse(isInDOM(cg), "Group was removed from the DOM");
      assert.isFalse(isInDOM(c1), "Component 1 was also removed from the DOM");
      assert.isFalse(isInDOM(c2), "Component 2 was also removed from the DOM");

      cg.renderTo(svg);
      assert.isTrue(isInDOM(cg), "Group was added back to the DOM");
      assert.isTrue(isInDOM(c1), "Component 1 was also added back to the DOM");
      assert.isTrue(isInDOM(c2), "Component 2 was also added back to the DOM");

      svg.remove();
    });

    it("detach()es Components from their previous location when they are append()ed", () => {
      let c1 = new Plottable.Component;
      let svg = TestMethods.generateSVG();
      c1.renderTo(svg);
      let group = new Plottable.Components.Group();
      group.append(c1);
      assert.isFalse((<Node> svg.node()).hasChildNodes(), "Component was detach()ed");
      svg.remove();
    });

    it("removes Components if detach() is called on them (before rendering)", () => {
      let c0 = new Plottable.Component();
      let componentGroup = new Plottable.Components.Group([c0]);
      c0.detach();
      assert.lengthOf(componentGroup.components(), 0, "Component is no longer in the Group");
      assert.isNull(c0.parent(), "Component disconnected from Group");
    });

    it("removes Components if detach() is called on them (after rendering)", () => {
      function isInDOM(component: Plottable.Component) {
        let contentNode = component.content().node();
        return contentNode != null && Plottable.Utils.DOM.boundingSVG(<SVGElement> contentNode) != null;
      };

      let c1 = new Plottable.Component();
      let c2 = new Plottable.Component();
      let cg = new Plottable.Components.Group([c1, c2]);

      let svg = TestMethods.generateSVG(200, 200);
      cg.renderTo(svg);

      assert.isTrue(isInDOM(c1), "Component 1 was added to the DOM");
      assert.isTrue(isInDOM(c2), "Component 2 was added to the DOM");

      c2.detach();

      assert.isTrue(isInDOM(c1), "Component 1 is still in the DOM");
      assert.isFalse(isInDOM(c2), "Component 2 was removed from the DOM");
      assert.isFalse(cg.has(c2), "Component 2 was removed from the Group");

      svg.remove();
    });

    it("can move Components to other Groups after anchoring", () => {
      let svg = TestMethods.generateSVG();

      let cg1 = new Plottable.Components.Group();
      let cg2 = new Plottable.Components.Group();
      let c = new Plottable.Component();

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

    it("destroy()s its Components when destroy()ed", () => {
      let c1 = new Plottable.Component();
      let c2 = new Plottable.Component();
      let cg = new Plottable.Components.Group([c1, c2]);

      let svg = TestMethods.generateSVG(200, 200);
      cg.renderTo(svg);

      cg.destroy();
      assert.throws(() => c1.renderTo(svg), Error);
      assert.throws(() => c2.renderTo(svg), Error);

      svg.remove();
    });
  });

  describe("Layout", () => {
    let SVG_WIDTH = 400;
    let SVG_HEIGHT = 400;
    it("requests no space when empty, but occupies all offered space", () => {
      let svg = TestMethods.generateSVG();
      let cg = new Plottable.Components.Group([]);

      let request = cg.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
      TestMethods.verifySpaceRequest(request, 0, 0, "empty Group doesn't request any space");

      cg.renderTo(svg);
      assert.strictEqual(cg.width(), SVG_WIDTH, "occupies all offered width");
      assert.strictEqual(cg.height(), SVG_HEIGHT, "occupies all offered height");
      svg.remove();
    });

    it("requests space correctly when it contains a non-fixed-size Component", () => {
      let svg = TestMethods.generateSVG();
      let c1 = new Plottable.Component();
      let c2 = new Plottable.Component();
      let cg = new Plottable.Components.Group([c1, c2]);

      let groupRequest = cg.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
      let c1Request = c1.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
      assert.deepEqual(groupRequest, c1Request, "request reflects request of sub-component");
      assert.isFalse(cg.fixedWidth(), "width is not fixed if subcomponents are not fixed width");
      assert.isFalse(cg.fixedHeight(), "height is not fixed if subcomponents are not fixed height");

      cg.renderTo(svg);
      assert.strictEqual(cg.width(), SVG_WIDTH, "occupies all offered width");
      assert.strictEqual(cg.height(), SVG_HEIGHT, "occupies all offered height");
      svg.remove();
    });

    it("requests space correctly when it contains fixed-size Components", () => {
      let svg = TestMethods.generateSVG();
      let tall = new Mocks.FixedSizeComponent(SVG_WIDTH / 4, SVG_WIDTH / 2);
      let wide = new Mocks.FixedSizeComponent(SVG_WIDTH / 2, SVG_WIDTH / 4);

      let cg = new Plottable.Components.Group([tall, wide]);

      let request = cg.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
      assert.strictEqual(request.minWidth, SVG_WIDTH / 2, "requested enough space for widest Component");
      assert.strictEqual(request.minHeight, SVG_HEIGHT / 2, "requested enough space for tallest Component");

      let constrainedRequest = cg.requestedSpace(SVG_WIDTH / 10, SVG_HEIGHT / 10);
      assert.strictEqual(constrainedRequest.minWidth, SVG_WIDTH / 2, "requested enough space for widest Component");
      assert.strictEqual(constrainedRequest.minHeight, SVG_HEIGHT / 2, "requested enough space for tallest Component");

      cg.renderTo(svg);
      assert.strictEqual(cg.width(), SVG_WIDTH, "occupies all offered width");
      assert.strictEqual(cg.height(), SVG_HEIGHT, "occupies all offered height");
      svg.remove();
    });

    it("allocates space to its Components correctly", () => {
      let FIXED_COMPONENT_SIZE = SVG_WIDTH / 4;
      let fixedComponent = new Mocks.FixedSizeComponent(FIXED_COMPONENT_SIZE, FIXED_COMPONENT_SIZE)
                                    .xAlignment("right").yAlignment("bottom");
      let unfixedComponent = new Plottable.Component();

      let cg = new Plottable.Components.Group([fixedComponent, unfixedComponent]);
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      cg.renderTo(svg);

      assert.strictEqual(fixedComponent.width(), FIXED_COMPONENT_SIZE, "fixed-size Component has correct width");
      assert.strictEqual(fixedComponent.height(), FIXED_COMPONENT_SIZE, "fixed-size Component has correct height");
      let expectedFixedOrigin = {
        x: SVG_WIDTH - FIXED_COMPONENT_SIZE,
        y: SVG_HEIGHT - FIXED_COMPONENT_SIZE
      };
      TestMethods.assertPointsClose(expectedFixedOrigin, fixedComponent.origin(), 1, "fixed-size Component has correct origin");

      assert.strictEqual(unfixedComponent.width(), SVG_WIDTH, "non-fixed-size Component has correct width");
      assert.strictEqual(unfixedComponent.height(), SVG_HEIGHT, "non-fixed-size Component has correct height");
      let expectedUnfixedOrigin = {
        x: 0,
        y: 0
      };
      TestMethods.assertPointsClose(expectedUnfixedOrigin, unfixedComponent.origin(), 1, "non-fixed-size Component has correct origin");

      svg.remove();
    });
  });
});

///<reference path="../testReference.ts" />

describe("Group", () => {
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
      let group = new Plottable.Components.Group();
      let component = new Plottable.Component;

      group.append(component);

      assert.strictEqual(group.components().length, 1, "there should first be 1 element in the group");

      assert.doesNotThrow(() => group.append(null));

      assert.strictEqual(group.components().length, 1, "adding null to a group should have no effect on the group");
    });

    it("removes Components using remove()", () => {
      let c1 = new Plottable.Component();
      let c2 = new Plottable.Component();
      let c3 = new Plottable.Component();

      let componentGroup = new Plottable.Components.Group([c1, c2, c3]);
      assert.deepEqual(componentGroup.components(), [c1, c2, c3], "Group initialized correctly");

      componentGroup.remove(c2);
      assert.deepEqual(componentGroup.components(), [c1, c3], "removing a Component respects the order of the remaining Components");

      let svg = TestMethods.generateSVG();
      c2.renderTo(svg);
      componentGroup.remove(c2);
      assert.deepEqual(componentGroup.components(), [c1, c3],
        "removing a Component not in the Group does not remove Components from the Group");
      assert.strictEqual((<SVGElement> c2.content().node()).ownerSVGElement, svg.node(), "The Component not in the Group stayed put");

      svg.remove();
    });

    it("checks for Components using has()", () => {
      let component = new Plottable.Component();
      let group = new Plottable.Components.Group([component]);
      assert.isTrue(group.has(component), "correctly checks that Component is in the Group");
      group.remove(component);
      assert.isFalse(group.has(component), "correctly checks that Component is no longer in the Group");
      group.append(component);
      assert.isTrue(group.has(component), "correctly checks that Component is in the Group again");
    });
  });

  describe("Detaching constituent Components", () => {
    it("takes its constutuent Components with it when detach()ed or anchor()ed", () => {
      let c1 = new Plottable.Component();
      let c2 = new Plottable.Component();
      let group = new Plottable.Components.Group([c1, c2]);

      let svg = TestMethods.generateSVG();

      group.renderTo(svg);
      assert.isTrue(TestMethods.isInDOM(group), "Group was added to the DOM");
      assert.isTrue(TestMethods.isInDOM(c1), "Component 1 was added to the DOM");
      assert.isTrue(TestMethods.isInDOM(c2), "Component 2 was added to the DOM");

      group.detach();
      assert.isFalse(TestMethods.isInDOM(group), "Group was removed from the DOM");
      assert.isFalse(TestMethods.isInDOM(c1), "Component 1 was also removed from the DOM");
      assert.isFalse(TestMethods.isInDOM(c2), "Component 2 was also removed from the DOM");

      group.renderTo(svg);
      assert.isTrue(TestMethods.isInDOM(group), "Group was added back to the DOM");
      assert.isTrue(TestMethods.isInDOM(c1), "Component 1 was also added back to the DOM");
      assert.isTrue(TestMethods.isInDOM(c2), "Component 2 was also added back to the DOM");

      svg.remove();
    });

    it("detach()es Components from their previous location when they are append()ed", () => {
      let component = new Plottable.Component;
      let svg = TestMethods.generateSVG();
      component.renderTo(svg);
      let group = new Plottable.Components.Group();
      group.append(component);
      assert.isFalse((<Node> svg.node()).hasChildNodes(), "Component was detach()ed");
      svg.remove();
    });

    it("removes Components if detach() is called on them (before rendering)", () => {
      let component = new Plottable.Component();
      let group = new Plottable.Components.Group([component]);
      component.detach();
      assert.lengthOf(group.components(), 0, "Component is no longer in the Group");
      assert.isNull(component.parent(), "Component disconnected from Group");
    });

    it("removes Components if detach() is called on them (after rendering)", () => {
      let c1 = new Plottable.Component();
      let c2 = new Plottable.Component();
      let group = new Plottable.Components.Group([c1, c2]);

      let svg = TestMethods.generateSVG();
      group.renderTo(svg);

      assert.isTrue(TestMethods.isInDOM(c1), "Component 1 was added to the DOM");
      assert.isTrue(TestMethods.isInDOM(c2), "Component 2 was added to the DOM");

      c2.detach();

      assert.isTrue(TestMethods.isInDOM(c1), "Component 1 is still in the DOM");
      assert.isFalse(TestMethods.isInDOM(c2), "Component 2 was removed from the DOM");
      assert.isFalse(group.has(c2), "Component 2 was removed from the Group");

      svg.remove();
    });

    it("can move Components to other Groups after anchoring", () => {
      let svg = TestMethods.generateSVG();

      let group1 = new Plottable.Components.Group();
      let group2 = new Plottable.Components.Group();
      let component = new Plottable.Component();

      group1.append(component);
      group1.renderTo(svg);
      group2.renderTo(svg);

      assert.strictEqual(group2.components().length, 0, "second group should have no component before movement");
      assert.strictEqual(group1.components().length, 1, "first group should have 1 component before movement");
      assert.strictEqual(component.parent(), group1, "component's parent before moving should be the group 1");

      assert.doesNotThrow(() => group2.append(component), Error, "should be able to move components between groups after anchoring");
      assert.strictEqual(group2.components().length, 1, "second group should have 1 component after movement");
      assert.strictEqual(group1.components().length, 0, "first group should have no components after movement");
      assert.strictEqual(component.parent(), group2, "component's parent after movement should be the group 2");

      svg.remove();
    });

    it("destroy()s its Components when destroy()ed", () => {
      let c1 = new Plottable.Component();
      let c2 = new Plottable.Component();
      let group = new Plottable.Components.Group([c1, c2]);

      let svg = TestMethods.generateSVG();
      group.renderTo(svg);

      group.destroy();
      // HACKHACK #2614: chai-assert.d.ts has the wrong signature
      (<any> assert).throws(() => c1.renderTo(svg), Error, "Can't reuse destroy()-ed Components!", "Component 1 was destroyed");
      (<any> assert).throws(() => c2.renderTo(svg), Error, "Can't reuse destroy()-ed Components!", "Component 2 was destroyed");

      svg.remove();
    });
  });

  describe("Layout", () => {
    let SVG_WIDTH = 400;
    let SVG_HEIGHT = 400;
    let svg: d3.Selection<void>;

    beforeEach(() => {
      svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    });

    it("requests no space when empty, but occupies all offered space", () => {
      let group = new Plottable.Components.Group([]);

      let request = group.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
      TestMethods.verifySpaceRequest(request, 0, 0, "empty Group doesn't request any space");

      group.renderTo(svg);
      assert.strictEqual(group.width(), SVG_WIDTH, "occupies all offered width");
      assert.strictEqual(group.height(), SVG_HEIGHT, "occupies all offered height");
      svg.remove();
    });

    it("requests space correctly when it contains a non-fixed-size Component", () => {
      let c1 = new Plottable.Component();
      let c2 = new Plottable.Component();
      let group = new Plottable.Components.Group([c1, c2]);

      let groupRequest = group.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
      let c1Request = c1.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
      assert.deepEqual(groupRequest, c1Request, "request reflects request of sub-component");
      assert.isFalse(group.fixedWidth(), "width is not fixed if subcomponents are not fixed width");
      assert.isFalse(group.fixedHeight(), "height is not fixed if subcomponents are not fixed height");

      group.renderTo(svg);
      assert.strictEqual(group.width(), SVG_WIDTH, "occupies all offered width");
      assert.strictEqual(group.height(), SVG_HEIGHT, "occupies all offered height");
      svg.remove();
    });

    it("requests space correctly when it contains fixed-size Components", () => {
      let tallComponent = new Mocks.FixedSizeComponent(SVG_WIDTH / 4, SVG_WIDTH / 2);
      let wideComponent = new Mocks.FixedSizeComponent(SVG_WIDTH / 2, SVG_WIDTH / 4);

      let group = new Plottable.Components.Group([tallComponent, wideComponent]);

      let request = group.requestedSpace(SVG_WIDTH, SVG_HEIGHT);
      assert.strictEqual(request.minWidth, SVG_WIDTH / 2, "requested enough space for widest Component");
      assert.strictEqual(request.minHeight, SVG_HEIGHT / 2, "requested enough space for tallest Component");

      let constrainedRequest = group.requestedSpace(SVG_WIDTH / 10, SVG_HEIGHT / 10);
      assert.strictEqual(constrainedRequest.minWidth, SVG_WIDTH / 2, "requested enough space for widest Component");
      assert.strictEqual(constrainedRequest.minHeight, SVG_HEIGHT / 2, "requested enough space for tallest Component");

      group.renderTo(svg);
      assert.strictEqual(group.width(), SVG_WIDTH, "occupies all offered width");
      assert.strictEqual(group.height(), SVG_HEIGHT, "occupies all offered height");
      svg.remove();
    });

    it("allocates space to its Components correctly", () => {
      let FIXED_COMPONENT_SIZE = SVG_WIDTH / 4;
      let fixedComponent = new Mocks.FixedSizeComponent(FIXED_COMPONENT_SIZE, FIXED_COMPONENT_SIZE);
      fixedComponent.xAlignment("right").yAlignment("bottom");
      let unfixedComponent = new Plottable.Component();

      let group = new Plottable.Components.Group([fixedComponent, unfixedComponent]);
      group.renderTo(svg);

      assert.strictEqual(fixedComponent.width(), FIXED_COMPONENT_SIZE, "fixed-size Component has correct width");
      assert.strictEqual(fixedComponent.height(), FIXED_COMPONENT_SIZE, "fixed-size Component has correct height");
      let expectedFixedOrigin = {
        x: SVG_WIDTH - FIXED_COMPONENT_SIZE,
        y: SVG_HEIGHT - FIXED_COMPONENT_SIZE,
      };
      TestMethods.assertPointsClose(expectedFixedOrigin, fixedComponent.origin(), 1, "fixed-size Component has correct origin");

      assert.strictEqual(unfixedComponent.width(), SVG_WIDTH, "non-fixed-size Component has correct width");
      assert.strictEqual(unfixedComponent.height(), SVG_HEIGHT, "non-fixed-size Component has correct height");
      let expectedUnfixedOrigin = {
        x: 0,
        y: 0,
      };
      TestMethods.assertPointsClose(expectedUnfixedOrigin, unfixedComponent.origin(), 1, "non-fixed-size Component has correct origin");

      svg.remove();
    });
  });
});

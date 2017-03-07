import { SimpleSelection } from "../../src/core/interfaces";
import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as Mocks from "../mocks";
import * as TestMethods from "../testMethods";

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

      let div = TestMethods.generateDiv();
      componentGroup.renderTo(div);
      let c3 = new Plottable.Component();
      componentGroup.append(c3);
      assert.deepEqual(componentGroup.components(), [c1, c2, c3], "Components can be append()ed after rendering");

      div.remove();
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

      let div = TestMethods.generateDiv();
      c2.renderTo(div);
      componentGroup.remove(c2);
      assert.deepEqual(componentGroup.components(), [c1, c3],
        "removing a Component not in the Group does not remove Components from the Group");
      assert.strictEqual(c2.element().node().parentNode, div.node(), "The Component not in the Group is still anchored");

      div.remove();
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

      let div = TestMethods.generateDiv();

      group.renderTo(div);
      assert.isTrue(TestMethods.isInDOM(group), "Group was added to the DOM");
      assert.isTrue(TestMethods.isInDOM(c1), "Component 1 was added to the DOM");
      assert.isTrue(TestMethods.isInDOM(c2), "Component 2 was added to the DOM");

      group.detach();
      assert.isFalse(TestMethods.isInDOM(group), "Group was removed from the DOM");
      assert.isFalse(TestMethods.isInDOM(c1), "Component 1 was also removed from the DOM");
      assert.isFalse(TestMethods.isInDOM(c2), "Component 2 was also removed from the DOM");

      group.renderTo(div);
      assert.isTrue(TestMethods.isInDOM(group), "Group was added back to the DOM");
      assert.isTrue(TestMethods.isInDOM(c1), "Component 1 was also added back to the DOM");
      assert.isTrue(TestMethods.isInDOM(c2), "Component 2 was also added back to the DOM");

      div.remove();
    });

    it("detach()es Components from their previous location when they are append()ed", () => {
      let component = new Plottable.Component;
      let div = TestMethods.generateDiv();
      component.renderTo(div);
      let group = new Plottable.Components.Group();
      group.append(component);
      assert.isFalse((<Node> div.node()).hasChildNodes(), "Component was detach()ed");
      div.remove();
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

      let div = TestMethods.generateDiv();
      group.renderTo(div);

      assert.isTrue(TestMethods.isInDOM(c1), "Component 1 was added to the DOM");
      assert.isTrue(TestMethods.isInDOM(c2), "Component 2 was added to the DOM");

      c2.detach();

      assert.isTrue(TestMethods.isInDOM(c1), "Component 1 is still in the DOM");
      assert.isFalse(TestMethods.isInDOM(c2), "Component 2 was removed from the DOM");
      assert.isFalse(group.has(c2), "Component 2 was removed from the Group");

      div.remove();
    });

    it("can move Components to other Groups after anchoring", () => {
      let div = TestMethods.generateDiv();

      let group1 = new Plottable.Components.Group();
      let group2 = new Plottable.Components.Group();
      let component = new Plottable.Component();

      group1.append(component);
      group1.renderTo(div);
      group2.renderTo(div);

      assert.strictEqual(group2.components().length, 0, "second group should have no component before movement");
      assert.strictEqual(group1.components().length, 1, "first group should have 1 component before movement");
      assert.strictEqual(component.parent(), group1, "component's parent before moving should be the group 1");

      assert.doesNotThrow(() => group2.append(component), Error, "should be able to move components between groups after anchoring");
      assert.strictEqual(group2.components().length, 1, "second group should have 1 component after movement");
      assert.strictEqual(group1.components().length, 0, "first group should have no components after movement");
      assert.strictEqual(component.parent(), group2, "component's parent after movement should be the group 2");

      div.remove();
    });

    it("destroy()s its Components when destroy()ed", () => {
      let c1 = new Plottable.Component();
      let c2 = new Plottable.Component();
      let group = new Plottable.Components.Group([c1, c2]);

      let div = TestMethods.generateDiv();
      group.renderTo(div);

      group.destroy();
      // HACKHACK #2614: chai-assert.d.ts has the wrong signature
      (<any> assert).throws(() => c1.renderTo(div), Error, "Can't reuse destroy()-ed Components!", "Component 1 was destroyed");
      (<any> assert).throws(() => c2.renderTo(div), Error, "Can't reuse destroy()-ed Components!", "Component 2 was destroyed");

      div.remove();
    });
  });

  describe("Layout", () => {
    let DIV_WIDTH = 400;
    let DIV_HEIGHT = 400;
    let div: d3.Selection<HTMLDivElement, any, any, any>;

    beforeEach(() => {
      div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
    });

    it("requests no space when empty, but occupies all offered space", () => {
      let group = new Plottable.Components.Group([]);

      let request = group.requestedSpace(DIV_WIDTH, DIV_HEIGHT);
      TestMethods.verifySpaceRequest(request, 0, 0, "empty Group doesn't request any space");

      group.renderTo(div);
      assert.strictEqual(group.width(), DIV_WIDTH, "occupies all offered width");
      assert.strictEqual(group.height(), DIV_HEIGHT, "occupies all offered height");
      div.remove();
    });

    it("requests space correctly when it contains a non-fixed-size Component", () => {
      let c1 = new Plottable.Component();
      let c2 = new Plottable.Component();
      let group = new Plottable.Components.Group([c1, c2]);

      let groupRequest = group.requestedSpace(DIV_WIDTH, DIV_HEIGHT);
      let c1Request = c1.requestedSpace(DIV_WIDTH, DIV_HEIGHT);
      assert.deepEqual(groupRequest, c1Request, "request reflects request of sub-component");
      assert.isFalse(group.fixedWidth(), "width is not fixed if subcomponents are not fixed width");
      assert.isFalse(group.fixedHeight(), "height is not fixed if subcomponents are not fixed height");

      group.renderTo(div);
      assert.strictEqual(group.width(), DIV_WIDTH, "occupies all offered width");
      assert.strictEqual(group.height(), DIV_HEIGHT, "occupies all offered height");
      div.remove();
    });

    it("requests space correctly when it contains fixed-size Components", () => {
      let tallComponent = new Mocks.FixedSizeComponent(DIV_WIDTH / 4, DIV_WIDTH / 2);
      let wideComponent = new Mocks.FixedSizeComponent(DIV_WIDTH / 2, DIV_WIDTH / 4);

      let group = new Plottable.Components.Group([tallComponent, wideComponent]);

      let request = group.requestedSpace(DIV_WIDTH, DIV_HEIGHT);
      assert.strictEqual(request.minWidth, DIV_WIDTH / 2, "requested enough space for widest Component");
      assert.strictEqual(request.minHeight, DIV_HEIGHT / 2, "requested enough space for tallest Component");

      let constrainedRequest = group.requestedSpace(DIV_WIDTH / 10, DIV_HEIGHT / 10);
      assert.strictEqual(constrainedRequest.minWidth, DIV_WIDTH / 2, "requested enough space for widest Component");
      assert.strictEqual(constrainedRequest.minHeight, DIV_HEIGHT / 2, "requested enough space for tallest Component");

      group.renderTo(div);
      assert.strictEqual(group.width(), DIV_WIDTH, "occupies all offered width");
      assert.strictEqual(group.height(), DIV_HEIGHT, "occupies all offered height");
      div.remove();
    });

    it("allocates space to its Components correctly", () => {
      let FIXED_COMPONENT_SIZE = DIV_WIDTH / 4;
      let fixedComponent = new Mocks.FixedSizeComponent(FIXED_COMPONENT_SIZE, FIXED_COMPONENT_SIZE);
      fixedComponent.xAlignment("right").yAlignment("bottom");
      let unfixedComponent = new Plottable.Component();

      let group = new Plottable.Components.Group([fixedComponent, unfixedComponent]);
      group.renderTo(div);

      assert.strictEqual(fixedComponent.width(), FIXED_COMPONENT_SIZE, "fixed-size Component has correct width");
      assert.strictEqual(fixedComponent.height(), FIXED_COMPONENT_SIZE, "fixed-size Component has correct height");
      let expectedFixedOrigin = {
        x: DIV_WIDTH - FIXED_COMPONENT_SIZE,
        y: DIV_HEIGHT - FIXED_COMPONENT_SIZE,
      };
      TestMethods.assertPointsClose(expectedFixedOrigin, fixedComponent.origin(), 1, "fixed-size Component has correct origin");

      assert.strictEqual(unfixedComponent.width(), DIV_WIDTH, "non-fixed-size Component has correct width");
      assert.strictEqual(unfixedComponent.height(), DIV_HEIGHT, "non-fixed-size Component has correct height");
      let expectedUnfixedOrigin = {
        x: 0,
        y: 0,
      };
      TestMethods.assertPointsClose(expectedUnfixedOrigin, unfixedComponent.origin(), 1, "non-fixed-size Component has correct origin");

      div.remove();
    });
  });
});

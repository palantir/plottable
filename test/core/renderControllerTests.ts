import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("RenderController", () => {
  const DIV_WIDTH = 400;
  const DIV_HEIGHT = 300;

  describe("configuring the render policy", () => {
    after(() => {
      Plottable.RenderController.renderPolicy(Plottable.RenderController.Policy.immediate);
    });

    it("can set a render policy", () => {
      Plottable.RenderController.renderPolicy(Plottable.RenderController.Policy.timeout);

      assert.strictEqual(Object.getPrototypeOf(Plottable.RenderController.renderPolicy()),
        Plottable.RenderPolicies.Timeout.prototype, "render policy is of the same type");
    });

    it("throws a warning for unrecognized render policies", () => {
      const unrecognizedRenderPolicy: any = "foo";
      TestMethods.assertWarns(() => Plottable.RenderController.renderPolicy(unrecognizedRenderPolicy),
        "Unrecognized renderPolicy", "warning sent for unrecognized render policy");
    });
  });

  it("can queue a component to render", () => {
    const div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
    const component = new Plottable.Component();
    const renderedClass = "rendered";
    component.renderImmediately = () => {
      component.content().append("g").classed(renderedClass, true);
      return component;
    };
    component.anchor(div);
    Plottable.RenderController.registerToRender(component);
    assert.isFalse(component.content().select(`.${renderedClass}`).empty(), "component has rendered");
    component.destroy();
    div.remove();
  });

  it("can queue a component to undergo layout computation and render", () => {
    const div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
    const component = new Plottable.Component();
    const renderedClass = "rendered";
    component.renderImmediately = () => {
      component.content().append("g").classed(renderedClass, true);
      return component;
    };
    component.anchor(div);
    Plottable.RenderController.registerToComputeLayoutAndRender(component);
    assert.isFalse(component.content().select(`.${renderedClass}`).empty(), "component has rendered");
    assert.deepEqual(component.origin(), {x: 0, y: 0}, "origin set");
    assert.strictEqual(component.width(), DIV_WIDTH, "width set");
    assert.strictEqual(component.height(), DIV_HEIGHT, "height set");
    component.destroy();
    div.remove();
  });

  // HACKHACK: https://github.com/palantir/plottable/issues/2083
  it.skip("can render components that are triggered by another component's render", () => {
    const link1 = new Plottable.Component();
    const div1 = TestMethods.generateDiv();
    link1.anchor(div1).computeLayout();
    const link2 = new Plottable.Component();
    const div2 = TestMethods.generateDiv();
    link2.anchor(div2).computeLayout();

    (<any> link1).renderImmediately = () => link2.render();
    let link2Rendered = false;
    (<any> link2).renderImmediately = () => link2Rendered = true;

    link1.render();
    assert.isTrue(link2Rendered, "dependent Component was render()-ed");

    div1.remove();
    div2.remove();
  });
});

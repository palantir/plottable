import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("RenderController", () => {
  let SVG_WIDTH = 400;
  let SVG_HEIGHT = 300;

  describe("configuring the render policy", () => {
    after(() => {
      Plottable.RenderController.renderPolicy(Plottable.RenderController.Policy.IMMEDIATE);
    });

    it("can set a render policy", () => {
      let renderPolicy = Plottable.RenderController.Policy.TIMEOUT;
      Plottable.RenderController.renderPolicy(renderPolicy);

      assert.strictEqual(Object.getPrototypeOf(Plottable.RenderController.renderPolicy()),
        Plottable.RenderPolicies.Timeout.prototype, "render policy is of the same type");
    });

    it("throws a warning for unrecognized render policies", () => {
      let unrecognizedRenderPolicy = "foo";
      TestMethods.assertWarns(() => Plottable.RenderController.renderPolicy(unrecognizedRenderPolicy),
        "Unrecognized renderPolicy", "warning sent for unrecognized render policy");
    });
  });

  it("can queue a component to render", () => {
    let div = TestMethods.generateDiv(SVG_WIDTH, SVG_HEIGHT);
    let component = new Plottable.Component();
    let renderedClass = "rendered";
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
    let div = TestMethods.generateDiv(SVG_WIDTH, SVG_HEIGHT);
    let component = new Plottable.Component();
    let renderedClass = "rendered";
    component.renderImmediately = () => {
      component.content().append("g").classed(renderedClass, true);
      return component;
    };
    component.anchor(div);
    Plottable.RenderController.registerToComputeLayoutAndRender(component);
    assert.isFalse(component.content().select(`.${renderedClass}`).empty(), "component has rendered");
    assert.deepEqual(component.origin(), {x: 0, y: 0}, "origin set");
    assert.strictEqual(component.width(), SVG_WIDTH, "width set");
    assert.strictEqual(component.height(), SVG_HEIGHT, "height set");
    component.destroy();
    div.remove();
  });

  // HACKHACK: https://github.com/palantir/plottable/issues/2083
  it.skip("can render components that are triggered by another component's render", () => {
    let link1 = new Plottable.Component();
    let div1 = TestMethods.generateDiv();
    link1.anchor(div1).computeLayout();
    let link2 = new Plottable.Component();
    let div2 = TestMethods.generateDiv();
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

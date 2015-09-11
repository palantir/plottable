///<reference path="../testReference.ts" />

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
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let component = new Plottable.Component();
    let renderedClass = "rendered";
    component.renderImmediately = () => {
      component.content().append("g").classed(renderedClass, true);
      return component;
    };
    component.anchor(svg);
    Plottable.RenderController.registerToRender(component);
    assert.isFalse(component.content().select(`.${renderedClass}`).empty(), "component has rendered");
    component.destroy();
    svg.remove();
  });

  it("can queue a component to undergo layout computation and render", () => {
    let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
    let component = new Plottable.Component();
    let renderedClass = "rendered";
    component.renderImmediately = () => {
      component.content().append("g").classed(renderedClass, true);
      return component;
    };
    component.anchor(svg);
    Plottable.RenderController.registerToComputeLayout(component);
    assert.isFalse(component.content().select(`.${renderedClass}`).empty(), "component has rendered");
    assert.deepEqual(component.origin(), {x: 0, y: 0}, "origin set");
    assert.strictEqual(component.width(), SVG_WIDTH, "width set");
    assert.strictEqual(component.height(), SVG_HEIGHT, "height set");
    component.destroy();
    svg.remove();
  });

  // HACKHACK: https://github.com/palantir/plottable/issues/2083
  it.skip("can render components that are triggered by another component's render", () => {
    let link1 = new Plottable.Component();
    let svg1 = TestMethods.generateSVG();
    link1.anchor(svg1).computeLayout();
    let link2 = new Plottable.Component();
    let svg2 = TestMethods.generateSVG();
    link2.anchor(svg2).computeLayout();

    (<any> link1).renderImmediately = () => link2.render();
    let link2Rendered = false;
    (<any> link2).renderImmediately = () => link2Rendered = true;

    link1.render();
    assert.isTrue(link2Rendered, "dependent Component was render()-ed");

    svg1.remove();
    svg2.remove();
  });
});

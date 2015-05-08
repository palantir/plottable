///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Interactions", () => {
  describe("Interaction", () => {
    var SVG_WIDTH = 400;
    var SVG_HEIGHT = 400;

    it("attaching/detaching a component modifies the state of the interaction", () => {
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var component = new Plottable.Component();
      var interaction = new Plottable.Interaction();
      component.renderTo(svg);

      interaction.attachTo(component);
      assert.strictEqual((<any>interaction)._componentAttachedTo, component,
        "the _componentAttachedTo field should contain the component the interaction is attached to");

      interaction.detachFrom(component);
      assert.isNull((<any>interaction)._componentAttachedTo,
        "the _componentAttachedTo field should be blanked upon detaching");

      svg.remove();
    });

    it("can attach interaction to component", () => {
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var component = new Plottable.Component();
      component.renderTo(svg);

      var clickInteraction = new Plottable.Interactions.Click();

      var callbackCalled = false;
      var callback = () => callbackCalled = true;
      clickInteraction.onClick(callback);

      clickInteraction.attachTo(component);

      TestMethods.triggerFakeMouseEvent("mousedown", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");

      svg.remove();
    });

    it("can detach interaction from component", () => {
      var svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var component = new Plottable.Component();
      component.renderTo(svg);

      var clickInteraction = new Plottable.Interactions.Click();

      var callbackCalled = false;
      var callback = () => callbackCalled = true;
      clickInteraction.onClick(callback);

      clickInteraction.attachTo(component);

      TestMethods.triggerFakeMouseEvent("mousedown", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");

      callbackCalled = false;
      clickInteraction.detachFrom(component);

      TestMethods.triggerFakeMouseEvent("mousedown", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isFalse(callbackCalled, "callback was removed from component and should not be called");

      svg.remove();
    });

    it("can move interaction from one component to another", () => {
      var svg1 = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var svg2 = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      var component1 = new Plottable.Component();
      var component2 = new Plottable.Component();

      component1.renderTo(svg1);
      component2.renderTo(svg2);

      var clickInteraction = new Plottable.Interactions.Click();

      var callbackCalled = false;
      var callback = () => callbackCalled = true;
      clickInteraction.onClick(callback);

      clickInteraction.attachTo(component1);

      callbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousedown", component1.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component1.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isTrue(callbackCalled, "Round 1 callback called for component 1");

      callbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousedown", component2.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component2.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isFalse(callbackCalled, "Round 1 callback not called for component 2");

      clickInteraction.detachFrom(component1);
      clickInteraction.attachTo(component2);

      callbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousedown", component1.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component1.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isFalse(callbackCalled, "Round 2 (after longhand attaching) callback not called for component 1");

      callbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousedown", component2.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component2.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isTrue(callbackCalled, "Round 2 (after longhand attaching) callback called for component 2");

      clickInteraction.attachTo(component1);

      callbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousedown", component1.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component1.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isTrue(callbackCalled, "Round 3 (after shorthand attaching) callback called for component 1");

      callbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousedown", component2.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component2.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isFalse(callbackCalled, "Round 3 (after shorthand attaching) callback not called for component 2");

      svg1.remove();
      svg2.remove();
    });
  });
});

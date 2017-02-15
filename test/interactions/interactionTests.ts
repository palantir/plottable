import * as d3 from "d3/build/d3.node";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Interactions", () => {
  describe("Interaction", () => {
    let SVG_WIDTH = 400;
    let SVG_HEIGHT = 400;

    it("attaching/detaching a component modifies the state of the interaction", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let component = new Plottable.Component();
      let interaction = new Plottable.Interaction();
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
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let component = new Plottable.Component();
      component.renderTo(svg);

      let clickInteraction = new Plottable.Interactions.Click();

      let callbackCalled = false;
      let callback = () => callbackCalled = true;
      clickInteraction.onClick(callback);

      clickInteraction.attachTo(component);

      TestMethods.triggerFakeMouseEvent("mousedown", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
      assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");

      svg.remove();
    });

    it("can detach interaction from component", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let component = new Plottable.Component();
      component.renderTo(svg);

      let clickInteraction = new Plottable.Interactions.Click();

      let callbackCalled = false;
      let callback = () => callbackCalled = true;
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

    it("calling detachFrom() on a detached Interaction has no effect", () => {
      let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let component = new Plottable.Component();

      let clickInteraction = new Plottable.Interactions.Click();

      assert.doesNotThrow(() => {
        clickInteraction.detachFrom(component);
      }, Error, "detaching an Interaction which was not attached should not throw an error");

      clickInteraction.attachTo(component);
      clickInteraction.detachFrom(component);
      assert.doesNotThrow(() => {
        clickInteraction.detachFrom(component);
      }, Error, "calling detachFrom() twice should not throw an error");

      component.renderTo(svg);

      clickInteraction.attachTo(component);
      clickInteraction.detachFrom(component);
      assert.doesNotThrow(() => {
        clickInteraction.detachFrom(component);
      }, Error, "calling detachFrom() twice should not throw an error even if the Component is anchored");

      svg.remove();

    });

    it("can move interaction from one component to another", () => {
      let svg1 = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let svg2 = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
      let component1 = new Plottable.Component();
      let component2 = new Plottable.Component();

      component1.renderTo(svg1);
      component2.renderTo(svg2);

      let clickInteraction = new Plottable.Interactions.Click();

      let callbackCalled = false;
      let callback = () => callbackCalled = true;
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

    describe("enabled()", () => {
      it("setting and querying status", () => {
        let interaction = new Plottable.Interaction();
        assert.isTrue(interaction.enabled(), "defaults to enabled");
        interaction.enabled(false);
        assert.isFalse(interaction.enabled(), "enabled status set to false");
        interaction.enabled(true);
        assert.isTrue(interaction.enabled(), "enabled status set to true");
      });

      it("no longer responds when disabled", () => {
        let svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let component = new Plottable.Component();
        component.renderTo(svg);

        let clickInteraction = new Plottable.Interactions.Click();
        let callbackCalled = false;
        let callback = () => callbackCalled = true;
        clickInteraction.onClick(callback);
        clickInteraction.attachTo(component);

        clickInteraction.enabled(false);
        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
        assert.isFalse(callbackCalled, "callback is not called when Interaction is disabled");

        clickInteraction.enabled(true);
        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
        assert.isTrue(callbackCalled, "callback is called when Interaction is re-enabled");

        svg.remove();
      });

      it("can be attached to new Component while disabled", () => {
        let svg1 = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let svg2 = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        let component1 = new Plottable.Component();
        let component2 = new Plottable.Component();
        component1.renderTo(svg1);
        component2.renderTo(svg2);

        let clickInteraction = new Plottable.Interactions.Click();
        let callbackCalled = false;
        let callback = () => callbackCalled = true;
        clickInteraction.onClick(callback);
        clickInteraction.attachTo(component1);

        clickInteraction.enabled(false);
        clickInteraction.attachTo(component2);
        TestMethods.triggerFakeMouseEvent("mousedown", component2.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
        TestMethods.triggerFakeMouseEvent("mouseup", component2.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
        assert.isFalse(callbackCalled, "stays disabled even if attachTo() is called again");

        clickInteraction.enabled(true);
        TestMethods.triggerFakeMouseEvent("mousedown", component2.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
        TestMethods.triggerFakeMouseEvent("mouseup", component2.content(), SVG_WIDTH / 2, SVG_HEIGHT / 2);
        assert.isTrue(callbackCalled, "re-enabled");

        svg1.remove();
        svg2.remove();
      });
    });
  });
});

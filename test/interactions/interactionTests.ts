import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Interactions", () => {
  describe("Interaction", () => {
    let DIV_WIDTH = 400;
    let DIV_HEIGHT = 400;

    it("attaching/detaching a component modifies the state of the interaction", () => {
      let div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
      let component = new Plottable.Component();
      let interaction = new Plottable.Interaction();
      component.renderTo(div);

      interaction.attachTo(component);
      assert.strictEqual((<any>interaction)._componentAttachedTo, component,
        "the _componentAttachedTo field should contain the component the interaction is attached to");

      interaction.detachFrom(component);
      assert.isNull((<any>interaction)._componentAttachedTo,
        "the _componentAttachedTo field should be blanked upon detaching");

      div.remove();
    });

    it("can attach interaction to component", () => {
      let div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
      let component = new Plottable.Component();
      component.renderTo(div);

      let clickInteraction = new Plottable.Interactions.Click();

      let callbackCalled = false;
      let callback = () => callbackCalled = true;
      clickInteraction.onClick(callback);

      clickInteraction.attachTo(component);

      TestMethods.triggerFakeMouseEvent("mousedown", component.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
      assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");

      div.remove();
    });

    it("can detach interaction from component", () => {
      let div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
      let component = new Plottable.Component();
      component.renderTo(div);

      let clickInteraction = new Plottable.Interactions.Click();

      let callbackCalled = false;
      let callback = () => callbackCalled = true;
      clickInteraction.onClick(callback);

      clickInteraction.attachTo(component);

      TestMethods.triggerFakeMouseEvent("mousedown", component.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
      assert.isTrue(callbackCalled, "callback called on clicking Component (mouse)");

      callbackCalled = false;
      clickInteraction.detachFrom(component);

      TestMethods.triggerFakeMouseEvent("mousedown", component.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
      assert.isFalse(callbackCalled, "callback was removed from component and should not be called");

      div.remove();
    });

    it("calling detachFrom() on a detached Interaction has no effect", () => {
      let div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
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

      component.renderTo(div);

      clickInteraction.attachTo(component);
      clickInteraction.detachFrom(component);
      assert.doesNotThrow(() => {
        clickInteraction.detachFrom(component);
      }, Error, "calling detachFrom() twice should not throw an error even if the Component is anchored");

      div.remove();

    });

    it("can move interaction from one component to another", () => {
      let div1 = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
      let div2 = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
      let component1 = new Plottable.Component();
      let component2 = new Plottable.Component();

      component1.renderTo(div1);
      component2.renderTo(div2);

      let clickInteraction = new Plottable.Interactions.Click();

      let callbackCalled = false;
      let callback = () => callbackCalled = true;
      clickInteraction.onClick(callback);

      clickInteraction.attachTo(component1);

      callbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousedown", component1.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component1.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
      assert.isTrue(callbackCalled, "Round 1 callback called for component 1");

      callbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousedown", component2.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component2.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
      assert.isFalse(callbackCalled, "Round 1 callback not called for component 2");

      clickInteraction.detachFrom(component1);
      clickInteraction.attachTo(component2);

      callbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousedown", component1.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component1.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
      assert.isFalse(callbackCalled, "Round 2 (after longhand attaching) callback not called for component 1");

      callbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousedown", component2.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component2.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
      assert.isTrue(callbackCalled, "Round 2 (after longhand attaching) callback called for component 2");

      clickInteraction.attachTo(component1);

      callbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousedown", component1.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component1.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
      assert.isTrue(callbackCalled, "Round 3 (after shorthand attaching) callback called for component 1");

      callbackCalled = false;
      TestMethods.triggerFakeMouseEvent("mousedown", component2.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
      TestMethods.triggerFakeMouseEvent("mouseup", component2.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
      assert.isFalse(callbackCalled, "Round 3 (after shorthand attaching) callback not called for component 2");

      div1.remove();
      div2.remove();
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
        let div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
        let component = new Plottable.Component();
        component.renderTo(div);

        let clickInteraction = new Plottable.Interactions.Click();
        let callbackCalled = false;
        let callback = () => callbackCalled = true;
        clickInteraction.onClick(callback);
        clickInteraction.attachTo(component);

        clickInteraction.enabled(false);
        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
        assert.isFalse(callbackCalled, "callback is not called when Interaction is disabled");

        clickInteraction.enabled(true);
        TestMethods.triggerFakeMouseEvent("mousedown", component.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
        TestMethods.triggerFakeMouseEvent("mouseup", component.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
        assert.isTrue(callbackCalled, "callback is called when Interaction is re-enabled");

        div.remove();
      });

      it("can be attached to new Component while disabled", () => {
        let div1 = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
        let div2 = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
        let component1 = new Plottable.Component();
        let component2 = new Plottable.Component();
        component1.renderTo(div1);
        component2.renderTo(div2);

        let clickInteraction = new Plottable.Interactions.Click();
        let callbackCalled = false;
        let callback = () => callbackCalled = true;
        clickInteraction.onClick(callback);
        clickInteraction.attachTo(component1);

        clickInteraction.enabled(false);
        clickInteraction.attachTo(component2);
        TestMethods.triggerFakeMouseEvent("mousedown", component2.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
        TestMethods.triggerFakeMouseEvent("mouseup", component2.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
        assert.isFalse(callbackCalled, "stays disabled even if attachTo() is called again");

        clickInteraction.enabled(true);
        TestMethods.triggerFakeMouseEvent("mousedown", component2.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
        TestMethods.triggerFakeMouseEvent("mouseup", component2.content(), DIV_WIDTH / 2, DIV_HEIGHT / 2);
        assert.isTrue(callbackCalled, "re-enabled");

        div1.remove();
        div2.remove();
      });
    });
  });
});

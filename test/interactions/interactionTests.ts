import { assert } from "chai";

import * as Plottable from "../../src";

import * as TestMethods from "../testMethods";

describe("Interactions", () => {
  describe("Interaction", () => {
    const DIV_WIDTH = 400;
    const DIV_HEIGHT = 400;

    function triggerMoveEvent(component: Plottable.Component) {
      TestMethods.triggerFakeInteractionEvent(
        TestMethods.InteractionMode.Mouse,
        TestMethods.InteractionType.Move,
        component.content(),
        DIV_WIDTH / 2,
        DIV_HEIGHT / 2,
      );
    }

    it("attaching/detaching a component modifies the state of the interaction", () => {
      const div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
      const component = new Plottable.Component();
      const interaction = new Plottable.Interaction();
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
      const div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
      const component = new Plottable.Component();
      component.renderTo(div);

      const pointerInteraction= new Plottable.Interactions.Pointer();

      let callbackCalled = false;
      const callback = () => callbackCalled = true;
      pointerInteraction.onPointerMove(callback);

      pointerInteraction.attachTo(component);

      triggerMoveEvent(component);
      assert.isTrue(callbackCalled, "callback called on moving in Component (mouse)");

      div.remove();
    });

    it("can detach interaction from component", () => {
      const div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
      const component = new Plottable.Component();
      component.renderTo(div);

      const pointerInteraction = new Plottable.Interactions.Pointer();

      let callbackCalled = false;
      const callback = () => callbackCalled = true;
      pointerInteraction.onPointerMove(callback);

      pointerInteraction.attachTo(component);

      triggerMoveEvent(component);
      assert.isTrue(callbackCalled, "callback called on moving in Component (mouse)");

      callbackCalled = false;
      pointerInteraction.detachFrom(component);

      triggerMoveEvent(component);
      assert.isFalse(callbackCalled, "callback was removed from component and should not be called");

      div.remove();
    });

    it("calling detachFrom() on a detached Interaction has no effect", () => {
      const div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
      const component = new Plottable.Component();

      const clickInteraction = new Plottable.Interactions.Click();

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
      const div1 = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
      const div2 = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
      const component1 = new Plottable.Component();
      const component2 = new Plottable.Component();

      component1.renderTo(div1);
      component2.renderTo(div2);

      const pointerInteraction = new Plottable.Interactions.Pointer();

      let callbackCalled = false;
      const callback = () => callbackCalled = true;
      pointerInteraction.onPointerMove(callback);

      pointerInteraction.attachTo(component1);

      callbackCalled = false;
      triggerMoveEvent(component1);
      assert.isTrue(callbackCalled, "Round 1 callback called for component 1");

      callbackCalled = false;
      triggerMoveEvent(component2);
      assert.isFalse(callbackCalled, "Round 1 callback not called for component 2");

      pointerInteraction.detachFrom(component1);
      pointerInteraction.attachTo(component2);

      callbackCalled = false;
      triggerMoveEvent(component1);
      assert.isFalse(callbackCalled, "Round 2 (after longhand attaching) callback not called for component 1");

      callbackCalled = false;
      triggerMoveEvent(component2);
      assert.isTrue(callbackCalled, "Round 2 (after longhand attaching) callback called for component 2");

      pointerInteraction.attachTo(component1);

      callbackCalled = false;
      triggerMoveEvent(component1);
      assert.isTrue(callbackCalled, "Round 3 (after shorthand attaching) callback called for component 1");

      callbackCalled = false;
      triggerMoveEvent(component2);
      assert.isFalse(callbackCalled, "Round 3 (after shorthand attaching) callback not called for component 2");

      div1.remove();
      div2.remove();
    });

    describe("enabled()", () => {
      it("setting and querying status", () => {
        const interaction = new Plottable.Interaction();
        assert.isTrue(interaction.enabled(), "defaults to enabled");
        interaction.enabled(false);
        assert.isFalse(interaction.enabled(), "enabled status set to false");
        interaction.enabled(true);
        assert.isTrue(interaction.enabled(), "enabled status set to true");
      });

      it("no longer responds when disabled", () => {
        const div = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
        const component = new Plottable.Component();
        component.renderTo(div);

        const pointerInteraction = new Plottable.Interactions.Pointer();
        let callbackCalled = false;
        const callback = () => callbackCalled = true;
        pointerInteraction.onPointerMove(callback);
        pointerInteraction.attachTo(component);

        pointerInteraction.enabled(false);
        triggerMoveEvent(component);
        assert.isFalse(callbackCalled, "callback is not called when Interaction is disabled");

        pointerInteraction.enabled(true);
        triggerMoveEvent(component);
        assert.isTrue(callbackCalled, "callback is called when Interaction is re-enabled");

        div.remove();
      });

      it("can be attached to new Component while disabled", () => {
        const div1 = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
        const div2 = TestMethods.generateDiv(DIV_WIDTH, DIV_HEIGHT);
        const component1 = new Plottable.Component();
        const component2 = new Plottable.Component();
        component1.renderTo(div1);
        component2.renderTo(div2);

        const pointerInteraction = new Plottable.Interactions.Pointer();
        let callbackCalled = false;
        const callback = () => callbackCalled = true;
        pointerInteraction.onPointerMove(callback);
        pointerInteraction.attachTo(component1);

        pointerInteraction.enabled(false);
        pointerInteraction.attachTo(component2);
        triggerMoveEvent(component2);
        assert.isFalse(callbackCalled, "stays disabled even if attachTo() is called again");

        pointerInteraction.enabled(true);
        triggerMoveEvent(component2);
        assert.isTrue(callbackCalled, "re-enabled");

        div1.remove();
        div2.remove();
      });
    });
  });
});

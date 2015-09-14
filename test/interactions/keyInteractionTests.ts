///<reference path="../testReference.ts" />

describe("Interactions", () => {
  describe("Key Interaction", () => {
    describe("onKeyPress", () => {
      let svg: d3.Selection<void>;
      let component: Plottable.Component;
      let keyInteraction: Plottable.Interactions.Key;

      let aCode: number;
      let aCallbackCalled: boolean;
      let aCallback: Plottable.KeyCallback;

      beforeEach(() => {
        component = new Plottable.Component();
        keyInteraction = new Plottable.Interactions.Key();
        aCode = 65;
        aCallbackCalled = false;
        aCallback = () => aCallbackCalled = true;
        svg = TestMethods.generateSVG();
        component.renderTo(svg);
      });

      it("only fires callback for \"a\" when \"a\" key is pressed", () => {
        let bCode = 66;
        let bCallbackCalled = false;
        let bCallback = () => bCallbackCalled = true;

        assert.strictEqual(keyInteraction.onKeyPress(aCode, aCallback), keyInteraction,
          "setting the keyPress callback returns the interaction");
        keyInteraction.onKeyPress(bCode, bCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode);
        assert.isTrue(aCallbackCalled, "callback for \"a\" was called when \"a\" key was pressed");
        assert.isFalse(bCallbackCalled, "callback for \"b\" was not called when \"a\" key was pressed");

        keyInteraction.offKeyPress(aCode, aCallback);
        keyInteraction.offKeyPress(bCode, bCallback);
        svg.remove();
      });

      it("does not fire callback when the key is pressed outside of the component", () => {
        keyInteraction.onKeyPress(aCode, aCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode);
        assert.isFalse(aCallbackCalled, "callback for \"a\" was not called when not moused over the Component");

        keyInteraction.offKeyPress(aCode, aCallback);
        svg.remove();
      });

      it("can remove keyPress callbacks", () => {
        keyInteraction.onKeyPress(aCode, aCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode);
        assert.isTrue(aCallbackCalled, "callback for \"a\" was called when \"a\" key was pressed");

        keyInteraction.offKeyPress(aCode, aCallback);
        aCallbackCalled = false;
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode);
        assert.isFalse(aCallbackCalled, "callback for \"a\" was disconnected from the interaction");

        keyInteraction.onKeyPress(aCode, aCallback);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode);
        assert.isTrue(aCallbackCalled, "callback for \"a\" was properly connected back to the interaction");

        assert.strictEqual(keyInteraction.offKeyPress(aCode, aCallback), keyInteraction,
          "unsetting the keyPress callback returns the interaction");
        svg.remove();
      });

      it("can attach multiple keyPress callbacks", () => {
        let aCallback1Called = false;
        let aCallback1 = () => aCallback1Called = true;
        let aCallback2Called = false;
        let aCallback2 = () => aCallback2Called = true;

        keyInteraction.onKeyPress(aCode, aCallback1);
        keyInteraction.onKeyPress(aCode, aCallback2);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode);
        assert.isTrue(aCallback1Called, "callback 1 for \"a\" was called when \"a\" key was pressed");
        assert.isTrue(aCallback2Called, "callback 2 for \"a\" was called when \"a\" key was pressed");

        keyInteraction.offKeyPress(aCode, aCallback1);
        keyInteraction.offKeyPress(aCode, aCallback2);
        svg.remove();
      });

      it("can remove only one of the registered keypress callbacks", () => {
        let aCallback1Called = false;
        let aCallback1 = () => aCallback1Called = true;
        let aCallback2Called = false;
        let aCallback2 = () => aCallback2Called = true;

        keyInteraction.onKeyPress(aCode, aCallback1);
        keyInteraction.onKeyPress(aCode, aCallback2);
        keyInteraction.attachTo(component);
        keyInteraction.offKeyPress(aCode, aCallback1);

        aCallback1Called = false;
        aCallback2Called = false;
        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode);
        assert.isFalse(aCallback1Called, "callback 1 for \"a\" was disconnected from the interaction");
        assert.isTrue(aCallback2Called, "callback 2 for \"a\" is still connected to the interaction");

        keyInteraction.offKeyPress(aCode, aCallback2);
        svg.remove();
      });

      it("is only triggered once when the key is pressed", () => {
        keyInteraction.onKeyPress(aCode, aCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode);
        assert.isTrue(aCallbackCalled, "callback for \"a\" was called when \"a\" key was pressed");

        aCallbackCalled = false;
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode, { repeat : true });
        assert.isFalse(aCallbackCalled, "callback for \"a\" was not called when keydown was fired the second time");

        keyInteraction.offKeyPress(aCode, aCallback);
        svg.remove();
      });

      it("does not fire the callback if the key is pressed and held down outside, then the mouse moved inside", () => {
        keyInteraction.onKeyPress(aCode, aCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode);
        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode, { repeat : true });
        assert.isFalse(aCallbackCalled, "callback for \"a\" was not called");

        keyInteraction.offKeyPress(aCode, aCallback);
        svg.remove();
      });
    });

    describe("onKeyRelease", () => {
      let svg: d3.Selection<void>;
      let component: Plottable.Component;
      let keyInteraction: Plottable.Interactions.Key;

      let aCode: number;
      let aCallbackCalled: boolean;
      let aCallback: Plottable.KeyCallback;

      beforeEach(() => {
        aCode = 65;
        component = new Plottable.Component();
        keyInteraction = new Plottable.Interactions.Key();
        aCallbackCalled = false;
        aCallback = () => aCallbackCalled = true;
        svg = TestMethods.generateSVG();
        component.renderTo(svg);
      });

      it("doesn't fire callback if key was released without being pressed", () => {
        assert.strictEqual(keyInteraction.onKeyRelease(aCode, aCallback), keyInteraction,
          "setting the keyRelease callback returns the interaction");
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aCode);
        assert.isFalse(aCallbackCalled, "callback for \"a\" was not called when \"a\" key was released");

        keyInteraction.offKeyRelease(aCode, aCallback);
        svg.remove();
      });

      it("fires callback if key was released after being pressed", () => {
        keyInteraction.onKeyRelease(aCode, aCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aCode);
        assert.isTrue(aCallbackCalled, "callback for \"a\" was called when \"a\" key was released");

        keyInteraction.offKeyRelease(aCode, aCallback);
        svg.remove();
      });

      it("only fires callback for key that has been released", () => {
        let bCode = 66;
        let bCallbackCalled = false;
        let bCallback = () => bCallbackCalled = true;

        keyInteraction.onKeyRelease(aCode, aCallback);
        keyInteraction.onKeyRelease(bCode, bCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aCode);
        assert.isTrue(aCallbackCalled, "callback for \"a\" was called when \"a\" key was released");
        assert.isFalse(bCallbackCalled, "callback for \"b\" was not called when \"a\" key was released");

        keyInteraction.offKeyRelease(aCode, aCallback);
        keyInteraction.offKeyRelease(bCode, bCallback);
        svg.remove();
      });

      it("fires callback if key was released outside of component after being pressed inside", () => {
        keyInteraction.onKeyRelease(aCode, aCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode);
        TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aCode);
        assert.isTrue(aCallbackCalled, "callback for \"a\" was called when \"a\" key was released");

        keyInteraction.offKeyRelease(aCode, aCallback);
        svg.remove();
      });

      it("doesn't fire callback if key was released after being pressed outside", () => {
        keyInteraction.onKeyRelease(aCode, aCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aCode);
        assert.isFalse(aCallbackCalled, "callback for \"a\" was not called when \"a\" key was released");

        keyInteraction.offKeyRelease(aCode, aCallback);
        svg.remove();
      });

      it("doesn't fire callback key was released inside after being pressed outside", () => {
        keyInteraction.onKeyRelease(aCode, aCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode);
        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aCode);
        assert.isFalse(aCallbackCalled, "callback for \"a\" was not called when \"a\" key was released");

        keyInteraction.offKeyRelease(aCode, aCallback);
        svg.remove();
      });

      it("can remove keyRelease callbacks", () => {
        keyInteraction.onKeyRelease(aCode, aCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aCode);
        assert.isTrue(aCallbackCalled, "callback for \"a\" was called when \"a\" key was released");

        assert.strictEqual(keyInteraction.offKeyRelease(aCode, aCallback), keyInteraction,
          "unsetting the keyRelease callback returns the interaction");
        aCallbackCalled = false;
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aCode);
        assert.isFalse(aCallbackCalled, "callback for \"a\" was disconnected from the interaction");

        keyInteraction.onKeyRelease(aCode, aCallback);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aCode);
        assert.isTrue(aCallbackCalled, "callback for \"a\" was properly connected back to the interaction");

        keyInteraction.offKeyRelease(aCode, aCallback);
        svg.remove();
      });

      it("can register multiple keyRelease callbacks", () => {
        let aCallback1Called = false;
        let aCallback1 = () => aCallback1Called = true;
        let aCallback2Called = false;
        let aCallback2 = () => aCallback2Called = true;

        keyInteraction.onKeyRelease(aCode, aCallback1);
        keyInteraction.onKeyRelease(aCode, aCallback2);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aCode);
        assert.isTrue(aCallback1Called, "callback 1 for \"a\" was called when \"a\" key was released");
        assert.isTrue(aCallback2Called, "callback 2 for \"a\" was called when \"a\" key was released");

        keyInteraction.offKeyRelease(aCode, aCallback1);
        keyInteraction.offKeyRelease(aCode, aCallback2);
        svg.remove();
      });

      it("can remove only one of the registered keyRelease callbacks", () => {
        let aCallback1Called = false;
        let aCallback1 = () => aCallback1Called = true;
        let aCallback2Called = false;
        let aCallback2 = () => aCallback2Called = true;

        keyInteraction.onKeyRelease(aCode, aCallback1);
        keyInteraction.onKeyRelease(aCode, aCallback2);
        keyInteraction.attachTo(component);

        keyInteraction.offKeyRelease(aCode, aCallback1);
        aCallback1Called = false;
        aCallback2Called = false;
        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aCode);
        assert.isFalse(aCallback1Called, "callback 1 for \"a\" was disconnected from the interaction");
        assert.isTrue(aCallback2Called, "callback 2 for \"a\" is still connected to the interaction");

        keyInteraction.offKeyRelease(aCode, aCallback2);
        svg.remove();
      });
    });

  });
});

///<reference path="../testReference.ts" />

describe("Interactions", () => {
  describe("Key Interaction", () => {
    describe("onKeyPress", () => {
      let svg: d3.Selection<void>;
      let component: Plottable.Component;
      let keyInteraction: Plottable.Interactions.Key;

      let aKeyCode: number;
      let aKeyCodeCallbackCalled: boolean;
      let aKeyCodeCallback: Plottable.KeyCallback;

      beforeEach(() => {
        component = new Plottable.Component();
        keyInteraction = new Plottable.Interactions.Key();
        aKeyCode = 65;
        aKeyCodeCallbackCalled = false;
        aKeyCodeCallback = () => aKeyCodeCallbackCalled = true;
        svg = TestMethods.generateSVG();
        component.renderTo(svg);
      });

      it("fires callback for key press", () => {
        assert.strictEqual(keyInteraction.onKeyPress(aKeyCode, aKeyCodeCallback), keyInteraction,
          "setting the keyPress callback returns the interaction");
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode);
        assert.isTrue(aKeyCodeCallbackCalled, "callback for \"a\" was called when \"a\" key was pressed");

        keyInteraction.offKeyPress(aKeyCode, aKeyCodeCallback);
        svg.remove();
      });

      it("only fires callback for \"a\" when \"a\" key is pressed", () => {
        let bKeyCode = 66;
        let bKeyCodeCallbackCalled = false;
        let bKeyCodeCallback = () => bKeyCodeCallbackCalled = true;

        keyInteraction.onKeyPress(aKeyCode, aKeyCodeCallback);
        keyInteraction.onKeyPress(bKeyCode, bKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode);
        assert.isTrue(aKeyCodeCallbackCalled, "callback for \"a\" was called when \"a\" key was pressed");
        assert.isFalse(bKeyCodeCallbackCalled, "callback for \"b\" was not called when \"a\" key was pressed");

        keyInteraction.offKeyPress(aKeyCode, aKeyCodeCallback);
        keyInteraction.offKeyPress(bKeyCode, bKeyCodeCallback);
        svg.remove();
      });

      it("does not fire callback when the key is pressed outside of the component", () => {
        keyInteraction.onKeyPress(aKeyCode, aKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode);
        assert.isFalse(aKeyCodeCallbackCalled, "callback for \"a\" was not called when not moused over the Component");

        keyInteraction.offKeyPress(aKeyCode, aKeyCodeCallback);
        svg.remove();
      });

      it("can remove and reattach keyPress callbacks", () => {
        keyInteraction.onKeyPress(aKeyCode, aKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode);
        assert.isTrue(aKeyCodeCallbackCalled, "callback for \"a\" was called when \"a\" key was pressed");

        assert.strictEqual(keyInteraction.offKeyPress(aKeyCode, aKeyCodeCallback), keyInteraction,
          "unsetting the keyPress callback returns the interaction");
        aKeyCodeCallbackCalled = false;
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode);
        assert.isFalse(aKeyCodeCallbackCalled, "callback for \"a\" was disconnected from the interaction");

        keyInteraction.onKeyPress(aKeyCode, aKeyCodeCallback);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode);
        assert.isTrue(aKeyCodeCallbackCalled, "callback for \"a\" was properly connected back to the interaction");

        keyInteraction.offKeyPress(aKeyCode, aKeyCodeCallback);
        svg.remove();
      });

      it("can attach multiple keyPress callbacks on the same key code", () => {
        let aKeyCodeCallback1Called = false;
        let aKeyCodeCallback1 = () => aKeyCodeCallback1Called = true;
        let aKeyCodeCallback2Called = false;
        let aKeyCodeCallback2 = () => aKeyCodeCallback2Called = true;

        keyInteraction.onKeyPress(aKeyCode, aKeyCodeCallback1);
        keyInteraction.onKeyPress(aKeyCode, aKeyCodeCallback2);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode);
        assert.isTrue(aKeyCodeCallback1Called, "callback 1 for \"a\" was called when \"a\" key was pressed");
        assert.isTrue(aKeyCodeCallback2Called, "callback 2 for \"a\" was called when \"a\" key was pressed");

        keyInteraction.offKeyPress(aKeyCode, aKeyCodeCallback1);
        keyInteraction.offKeyPress(aKeyCode, aKeyCodeCallback2);
        svg.remove();
      });

      it("can remove only the specified keypress callbacks", () => {
        let aKeyCodeCallback1Called = false;
        let aKeyCodeCallback1 = () => aKeyCodeCallback1Called = true;
        let aKeyCodeCallback2Called = false;
        let aKeyCodeCallback2 = () => aKeyCodeCallback2Called = true;

        keyInteraction.onKeyPress(aKeyCode, aKeyCodeCallback1);
        keyInteraction.onKeyPress(aKeyCode, aKeyCodeCallback2);
        keyInteraction.attachTo(component);
        keyInteraction.offKeyPress(aKeyCode, aKeyCodeCallback1);

        aKeyCodeCallback1Called = false;
        aKeyCodeCallback2Called = false;
        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode);
        assert.isFalse(aKeyCodeCallback1Called, "callback 1 for \"a\" was disconnected from the interaction");
        assert.isTrue(aKeyCodeCallback2Called, "callback 2 for \"a\" is still connected to the interaction");

        keyInteraction.offKeyPress(aKeyCode, aKeyCodeCallback2);
        svg.remove();
      });

      it("is only triggered once when the key is pressed", () => {
        keyInteraction.onKeyPress(aKeyCode, aKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode);
        assert.isTrue(aKeyCodeCallbackCalled, "callback for \"a\" was called when \"a\" key was pressed");

        aKeyCodeCallbackCalled = false;
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode, { repeat : true });
        assert.isFalse(aKeyCodeCallbackCalled, "callback for \"a\" was not called when keydown was fired the second time");

        keyInteraction.offKeyPress(aKeyCode, aKeyCodeCallback);
        svg.remove();
      });

      it("does not fire the callback if the key is pressed and held down outside, then the mouse moved inside", () => {
        keyInteraction.onKeyPress(aKeyCode, aKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode);
        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode, { repeat : true });
        assert.isFalse(aKeyCodeCallbackCalled, "callback for \"a\" was not called");

        keyInteraction.offKeyPress(aKeyCode, aKeyCodeCallback);
        svg.remove();
      });
    });

    describe("onKeyRelease", () => {
      let svg: d3.Selection<void>;
      let component: Plottable.Component;
      let keyInteraction: Plottable.Interactions.Key;

      let aKeyCode: number;
      let aKeyCodeCallbackCalled: boolean;
      let aKeyCodeCallback: Plottable.KeyCallback;

      beforeEach(() => {
        aKeyCode = 65;
        component = new Plottable.Component();
        keyInteraction = new Plottable.Interactions.Key();
        aKeyCodeCallbackCalled = false;
        aKeyCodeCallback = () => aKeyCodeCallbackCalled = true;
        svg = TestMethods.generateSVG();
        component.renderTo(svg);
      });

      it("doesn't fire callback if key was released without being pressed", () => {
        assert.strictEqual(keyInteraction.onKeyRelease(aKeyCode, aKeyCodeCallback), keyInteraction,
          "setting the keyRelease callback returns the interaction");
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aKeyCode);
        assert.isFalse(aKeyCodeCallbackCalled, "callback for \"a\" was not called when \"a\" key was released");

        keyInteraction.offKeyRelease(aKeyCode, aKeyCodeCallback);
        svg.remove();
      });

      it("fires callback if key was released after being pressed", () => {
        keyInteraction.onKeyRelease(aKeyCode, aKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aKeyCode);
        assert.isTrue(aKeyCodeCallbackCalled, "callback for \"a\" was called when \"a\" key was released");

        keyInteraction.offKeyRelease(aKeyCode, aKeyCodeCallback);
        svg.remove();
      });

      it("only fires callback for key that has been released", () => {
        let bKeyCode = 66;
        let bKeyCodeCallbackCalled = false;
        let bKeyCodeCallback = () => bKeyCodeCallbackCalled = true;

        keyInteraction.onKeyRelease(aKeyCode, aKeyCodeCallback);
        keyInteraction.onKeyRelease(bKeyCode, bKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aKeyCode);
        assert.isTrue(aKeyCodeCallbackCalled, "callback for \"a\" was called when \"a\" key was released");
        assert.isFalse(bKeyCodeCallbackCalled, "callback for \"b\" was not called when \"a\" key was released");

        keyInteraction.offKeyRelease(aKeyCode, aKeyCodeCallback);
        keyInteraction.offKeyRelease(bKeyCode, bKeyCodeCallback);
        svg.remove();
      });

      it("fires callback if key was released outside of component after being pressed inside", () => {
        keyInteraction.onKeyRelease(aKeyCode, aKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode);
        TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aKeyCode);
        assert.isTrue(aKeyCodeCallbackCalled, "callback for \"a\" was called when \"a\" key was released");

        keyInteraction.offKeyRelease(aKeyCode, aKeyCodeCallback);
        svg.remove();
      });

      it("doesn't fire callback if key was released after being pressed outside", () => {
        keyInteraction.onKeyRelease(aKeyCode, aKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aKeyCode);
        assert.isFalse(aKeyCodeCallbackCalled, "callback for \"a\" was not called when \"a\" key was released");

        keyInteraction.offKeyRelease(aKeyCode, aKeyCodeCallback);
        svg.remove();
      });

      it("doesn't fire callback key was released inside after being pressed outside", () => {
        keyInteraction.onKeyRelease(aKeyCode, aKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode);
        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aKeyCode);
        assert.isFalse(aKeyCodeCallbackCalled, "callback for \"a\" was not called when \"a\" key was released");

        keyInteraction.offKeyRelease(aKeyCode, aKeyCodeCallback);
        svg.remove();
      });

      it("can remove and reattach keyRelease callbacks", () => {
        keyInteraction.onKeyRelease(aKeyCode, aKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aKeyCode);
        assert.isTrue(aKeyCodeCallbackCalled, "callback for \"a\" was called when \"a\" key was released");

        assert.strictEqual(keyInteraction.offKeyRelease(aKeyCode, aKeyCodeCallback), keyInteraction,
          "unsetting the keyRelease callback returns the interaction");
        aKeyCodeCallbackCalled = false;
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aKeyCode);
        assert.isFalse(aKeyCodeCallbackCalled, "callback for \"a\" was disconnected from the interaction");

        keyInteraction.onKeyRelease(aKeyCode, aKeyCodeCallback);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aKeyCode);
        assert.isTrue(aKeyCodeCallbackCalled, "callback for \"a\" was properly connected back to the interaction");

        keyInteraction.offKeyRelease(aKeyCode, aKeyCodeCallback);
        svg.remove();
      });

      it("can register multiple keyRelease callbacks", () => {
        let aKeyCodeCallback1Called = false;
        let aKeyCodeCallback1 = () => aKeyCodeCallback1Called = true;
        let aKeyCodeCallback2Called = false;
        let aKeyCodeCallback2 = () => aKeyCodeCallback2Called = true;

        keyInteraction.onKeyRelease(aKeyCode, aKeyCodeCallback1);
        keyInteraction.onKeyRelease(aKeyCode, aKeyCodeCallback2);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aKeyCode);
        assert.isTrue(aKeyCodeCallback1Called, "callback 1 for \"a\" was called when \"a\" key was released");
        assert.isTrue(aKeyCodeCallback2Called, "callback 2 for \"a\" was called when \"a\" key was released");

        keyInteraction.offKeyRelease(aKeyCode, aKeyCodeCallback1);
        keyInteraction.offKeyRelease(aKeyCode, aKeyCodeCallback2);
        svg.remove();
      });

      it("can remove only one of the registered keyRelease callbacks", () => {
        let aKeyCodeCallback1Called = false;
        let aKeyCodeCallback1 = () => aKeyCodeCallback1Called = true;
        let aKeyCodeCallback2Called = false;
        let aKeyCodeCallback2 = () => aKeyCodeCallback2Called = true;

        keyInteraction.onKeyRelease(aKeyCode, aKeyCodeCallback1);
        keyInteraction.onKeyRelease(aKeyCode, aKeyCodeCallback2);
        keyInteraction.attachTo(component);

        keyInteraction.offKeyRelease(aKeyCode, aKeyCodeCallback1);
        aKeyCodeCallback1Called = false;
        aKeyCodeCallback2Called = false;
        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aKeyCode);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aKeyCode);
        assert.isFalse(aKeyCodeCallback1Called, "callback 1 for \"a\" was disconnected from the interaction");
        assert.isTrue(aKeyCodeCallback2Called, "callback 2 for \"a\" is still connected to the interaction");

        keyInteraction.offKeyRelease(aKeyCode, aKeyCodeCallback2);
        svg.remove();
      });
    });

  });
});

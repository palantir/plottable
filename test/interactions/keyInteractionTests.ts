///<reference path="../testReference.ts" />

describe("Interactions", () => {
  describe("Key Interaction", () => {
    describe("onKeyPress", () => {
      let svg: d3.Selection<void>;
      let component: Plottable.Component;
      let keyInteraction: Plottable.Interactions.Key;

      let A_KEY_CODE = 65;
      let B_KEY_CODE = 66;
      let aKeyCodeCallbackCalled: boolean;
      let aKeyCodeCallback: Plottable.KeyCallback;

      beforeEach(() => {
        component = new Plottable.Component();
        keyInteraction = new Plottable.Interactions.Key();
        aKeyCodeCallbackCalled = false;
        aKeyCodeCallback = () => aKeyCodeCallbackCalled = true;
        svg = TestMethods.generateSVG();
        component.renderTo(svg);
      });

      it("fires callback for key press", () => {
        assert.strictEqual(keyInteraction.onKeyPress(A_KEY_CODE, aKeyCodeCallback), keyInteraction,
          "setting the keyPress callback returns the interaction");
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE);
        assert.isTrue(aKeyCodeCallbackCalled, "callback for \"a\" was called when \"a\" key was pressed");

        keyInteraction.offKeyPress(A_KEY_CODE, aKeyCodeCallback);
        svg.remove();
      });

      it("only fires callback for \"a\" when \"a\" key is pressed", () => {
        let bKeyCodeCallbackCalled = false;
        let bKeyCodeCallback = () => bKeyCodeCallbackCalled = true;

        keyInteraction.onKeyPress(A_KEY_CODE, aKeyCodeCallback);
        keyInteraction.onKeyPress(B_KEY_CODE, bKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE);
        assert.isTrue(aKeyCodeCallbackCalled, "callback for \"a\" was called when \"a\" key was pressed");
        assert.isFalse(bKeyCodeCallbackCalled, "callback for \"b\" was not called when \"a\" key was pressed");

        keyInteraction.offKeyPress(A_KEY_CODE, aKeyCodeCallback);
        keyInteraction.offKeyPress(B_KEY_CODE, bKeyCodeCallback);
        svg.remove();
      });

      it("does not fire callback when the key is pressed outside of the component", () => {
        keyInteraction.onKeyPress(A_KEY_CODE, aKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE);
        assert.isFalse(aKeyCodeCallbackCalled, "callback for \"a\" was not called when not moused over the Component");

        keyInteraction.offKeyPress(A_KEY_CODE, aKeyCodeCallback);
        svg.remove();
      });

      it("can remove and reattach keyPress callbacks", () => {
        keyInteraction.onKeyPress(A_KEY_CODE, aKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE);
        assert.isTrue(aKeyCodeCallbackCalled, "callback for \"a\" was called when \"a\" key was pressed");

        assert.strictEqual(keyInteraction.offKeyPress(A_KEY_CODE, aKeyCodeCallback), keyInteraction,
          "unsetting the keyPress callback returns the interaction");
        aKeyCodeCallbackCalled = false;
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE);
        assert.isFalse(aKeyCodeCallbackCalled, "callback for \"a\" was disconnected from the interaction");

        keyInteraction.onKeyPress(A_KEY_CODE, aKeyCodeCallback);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE);
        assert.isTrue(aKeyCodeCallbackCalled, "callback for \"a\" was properly connected back to the interaction");

        keyInteraction.offKeyPress(A_KEY_CODE, aKeyCodeCallback);
        svg.remove();
      });

      it("can attach multiple keyPress callbacks on the same key code", () => {
        let aKeyCodeCallback1Called = false;
        let aKeyCodeCallback1 = () => aKeyCodeCallback1Called = true;
        let aKeyCodeCallback2Called = false;
        let aKeyCodeCallback2 = () => aKeyCodeCallback2Called = true;

        keyInteraction.onKeyPress(A_KEY_CODE, aKeyCodeCallback1);
        keyInteraction.onKeyPress(A_KEY_CODE, aKeyCodeCallback2);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE);
        assert.isTrue(aKeyCodeCallback1Called, "callback 1 for \"a\" was called when \"a\" key was pressed");
        assert.isTrue(aKeyCodeCallback2Called, "callback 2 for \"a\" was called when \"a\" key was pressed");

        keyInteraction.offKeyPress(A_KEY_CODE, aKeyCodeCallback1);
        keyInteraction.offKeyPress(A_KEY_CODE, aKeyCodeCallback2);
        svg.remove();
      });

      it("removes only the specified callback", () => {
        let aKeyCodeCallback1Called = false;
        let aKeyCodeCallback1 = () => aKeyCodeCallback1Called = true;
        let aKeyCodeCallback2Called = false;
        let aKeyCodeCallback2 = () => aKeyCodeCallback2Called = true;

        keyInteraction.onKeyPress(A_KEY_CODE, aKeyCodeCallback1);
        keyInteraction.onKeyPress(A_KEY_CODE, aKeyCodeCallback2);
        keyInteraction.attachTo(component);
        keyInteraction.offKeyPress(A_KEY_CODE, aKeyCodeCallback1);

        aKeyCodeCallback1Called = false;
        aKeyCodeCallback2Called = false;
        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE);
        assert.isFalse(aKeyCodeCallback1Called, "callback 1 for \"a\" was disconnected from the interaction");
        assert.isTrue(aKeyCodeCallback2Called, "callback 2 for \"a\" is still connected to the interaction");

        keyInteraction.offKeyPress(A_KEY_CODE, aKeyCodeCallback2);
        svg.remove();
      });

      it("is only triggered once when the key is pressed", () => {
        keyInteraction.onKeyPress(A_KEY_CODE, aKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE);
        assert.isTrue(aKeyCodeCallbackCalled, "callback for \"a\" was called when \"a\" key was pressed");

        aKeyCodeCallbackCalled = false;
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE, { repeat : true });
        assert.isFalse(aKeyCodeCallbackCalled, "callback for \"a\" was not called when keydown was fired the second time");

        keyInteraction.offKeyPress(A_KEY_CODE, aKeyCodeCallback);
        svg.remove();
      });

      it("does not fire the callback when component is initially out of focus", () => {
        keyInteraction.onKeyPress(A_KEY_CODE, aKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE);
        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE, { repeat : true });
        assert.isFalse(aKeyCodeCallbackCalled, "callback for \"a\" was not called");

        keyInteraction.offKeyPress(A_KEY_CODE, aKeyCodeCallback);
        svg.remove();
      });
    });

    describe("onKeyRelease", () => {
      let svg: d3.Selection<void>;
      let component: Plottable.Component;
      let keyInteraction: Plottable.Interactions.Key;

      let A_KEY_CODE = 65;
      let B_KEY_CODE = 66;
      let aKeyCodeCallbackCalled: boolean;
      let aKeyCodeCallback: Plottable.KeyCallback;

      beforeEach(() => {
        component = new Plottable.Component();
        keyInteraction = new Plottable.Interactions.Key();
        aKeyCodeCallbackCalled = false;
        aKeyCodeCallback = () => aKeyCodeCallbackCalled = true;
        svg = TestMethods.generateSVG();
        component.renderTo(svg);
      });

      it("fires the callback upon releasing the key", () => {
        keyInteraction.onKeyRelease(A_KEY_CODE, aKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE);
        assert.isFalse(aKeyCodeCallbackCalled, "callback for \"a\" was not called before releasing the key");
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), A_KEY_CODE);
        assert.isTrue(aKeyCodeCallbackCalled, "callback for \"a\" was called when \"a\" key was released");

        keyInteraction.offKeyRelease(A_KEY_CODE, aKeyCodeCallback);
        svg.remove();
      });

      it("doesn't fire callback if key was released without being pressed", () => {
        assert.strictEqual(keyInteraction.onKeyRelease(A_KEY_CODE, aKeyCodeCallback), keyInteraction,
          "setting the keyRelease callback returns the interaction");
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), A_KEY_CODE);
        assert.isFalse(aKeyCodeCallbackCalled, "callback for \"a\" was not called when \"a\" key was released");

        keyInteraction.offKeyRelease(A_KEY_CODE, aKeyCodeCallback);
        svg.remove();
      });

      it("only fires callback for key that has been released", () => {
        let bKeyCodeCallbackCalled = false;
        let bKeyCodeCallback = () => bKeyCodeCallbackCalled = true;

        keyInteraction.onKeyRelease(A_KEY_CODE, aKeyCodeCallback);
        keyInteraction.onKeyRelease(B_KEY_CODE, bKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), A_KEY_CODE);
        assert.isTrue(aKeyCodeCallbackCalled, "callback for \"a\" was called when \"a\" key was released");
        assert.isFalse(bKeyCodeCallbackCalled, "callback for \"b\" was not called when \"a\" key was released");

        keyInteraction.offKeyRelease(A_KEY_CODE, aKeyCodeCallback);
        keyInteraction.offKeyRelease(B_KEY_CODE, bKeyCodeCallback);
        svg.remove();
      });

      it("fires callback if key was released outside of component after being pressed inside", () => {
        keyInteraction.onKeyRelease(A_KEY_CODE, aKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE);
        TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), A_KEY_CODE);
        assert.isTrue(aKeyCodeCallbackCalled, "callback for \"a\" was called when \"a\" key was released");

        keyInteraction.offKeyRelease(A_KEY_CODE, aKeyCodeCallback);
        svg.remove();
      });

      it("doesn't fire callback if key was released after being pressed outside", () => {
        keyInteraction.onKeyRelease(A_KEY_CODE, aKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), A_KEY_CODE);
        assert.isFalse(aKeyCodeCallbackCalled, "callback for \"a\" was not called when \"a\" key was released");

        keyInteraction.offKeyRelease(A_KEY_CODE, aKeyCodeCallback);
        svg.remove();
      });

      it("doesn't fire callback key was released inside after being pressed outside", () => {
        keyInteraction.onKeyRelease(A_KEY_CODE, aKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseout", component.background(), -100, -100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE);
        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), A_KEY_CODE);
        assert.isFalse(aKeyCodeCallbackCalled, "callback for \"a\" was not called when \"a\" key was released");

        keyInteraction.offKeyRelease(A_KEY_CODE, aKeyCodeCallback);
        svg.remove();
      });

      it("can remove and reattach keyRelease callbacks", () => {
        keyInteraction.onKeyRelease(A_KEY_CODE, aKeyCodeCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), A_KEY_CODE);
        assert.isTrue(aKeyCodeCallbackCalled, "callback for \"a\" was called when \"a\" key was released");

        assert.strictEqual(keyInteraction.offKeyRelease(A_KEY_CODE, aKeyCodeCallback), keyInteraction,
          "unsetting the keyRelease callback returns the interaction");
        aKeyCodeCallbackCalled = false;
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), A_KEY_CODE);
        assert.isFalse(aKeyCodeCallbackCalled, "callback for \"a\" was disconnected from the interaction");

        keyInteraction.onKeyRelease(A_KEY_CODE, aKeyCodeCallback);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), A_KEY_CODE);
        assert.isTrue(aKeyCodeCallbackCalled, "callback for \"a\" was properly connected back to the interaction");

        keyInteraction.offKeyRelease(A_KEY_CODE, aKeyCodeCallback);
        svg.remove();
      });

      it("can register multiple keyRelease callbacks", () => {
        let aKeyCodeCallback1Called = false;
        let aKeyCodeCallback1 = () => aKeyCodeCallback1Called = true;
        let aKeyCodeCallback2Called = false;
        let aKeyCodeCallback2 = () => aKeyCodeCallback2Called = true;

        keyInteraction.onKeyRelease(A_KEY_CODE, aKeyCodeCallback1);
        keyInteraction.onKeyRelease(A_KEY_CODE, aKeyCodeCallback2);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), A_KEY_CODE);
        assert.isTrue(aKeyCodeCallback1Called, "callback 1 for \"a\" was called when \"a\" key was released");
        assert.isTrue(aKeyCodeCallback2Called, "callback 2 for \"a\" was called when \"a\" key was released");

        keyInteraction.offKeyRelease(A_KEY_CODE, aKeyCodeCallback1);
        keyInteraction.offKeyRelease(A_KEY_CODE, aKeyCodeCallback2);
        svg.remove();
      });

      it("can remove only one of the registered keyRelease callbacks", () => {
        let aKeyCodeCallback1Called = false;
        let aKeyCodeCallback1 = () => aKeyCodeCallback1Called = true;
        let aKeyCodeCallback2Called = false;
        let aKeyCodeCallback2 = () => aKeyCodeCallback2Called = true;

        keyInteraction.onKeyRelease(A_KEY_CODE, aKeyCodeCallback1);
        keyInteraction.onKeyRelease(A_KEY_CODE, aKeyCodeCallback2);
        keyInteraction.attachTo(component);

        keyInteraction.offKeyRelease(A_KEY_CODE, aKeyCodeCallback1);
        aKeyCodeCallback1Called = false;
        aKeyCodeCallback2Called = false;
        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), A_KEY_CODE);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), A_KEY_CODE);
        assert.isFalse(aKeyCodeCallback1Called, "callback 1 for \"a\" was disconnected from the interaction");
        assert.isTrue(aKeyCodeCallback2Called, "callback 2 for \"a\" is still connected to the interaction");

        keyInteraction.offKeyRelease(A_KEY_CODE, aKeyCodeCallback2);
        svg.remove();
      });
    });

  });
});

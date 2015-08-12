///<reference path="../testReference.ts" />

describe("Interactions", () => {
  describe("KeyInteraction", () => {
    let svg: d3.Selection<void>;
    let component: Plottable.Component;
    let keyInteraction: Plottable.Interactions.Key;
    let aCode: number;
    let bCode: number;

    let aCallbackCalled: boolean;
    let bCallbackCalled: boolean;
    let aCallback: Plottable.KeyCallback;
    let bCallback: Plottable.KeyCallback;

    beforeEach(() => {
      aCode = 65;
      bCode = 66;
      component = new Plottable.Component();
      svg = TestMethods.generateSVG(400, 400);
      keyInteraction = new Plottable.Interactions.Key();
      aCallback = () => aCallbackCalled = true;
      bCallback = () => bCallbackCalled = true;
      component.renderTo(svg);
      aCallbackCalled = false;
      bCallbackCalled = false;
    });

    describe("onKeyPress", () => {
      it("only fires callback for \"a\" when \"a\" key is pressed", () => {
        keyInteraction.onKeyPress(aCode, aCallback);
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

      it("removing keyPress callbacks is possible", () => {
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

        keyInteraction.offKeyPress(aCode, aCallback);
        svg.remove();
      });

      it("multiple keyPress callbacks are possible", () => {
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
      it("doesn't fire callback if key was released without being pressed", () => {
        keyInteraction.onKeyRelease(aCode, aCallback);
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

      it("removing keyRelease callbacks is possible", () => {
        keyInteraction.onKeyRelease(aCode, aCallback);
        keyInteraction.attachTo(component);

        TestMethods.triggerFakeMouseEvent("mouseover", component.background(), 100, 100);
        TestMethods.triggerFakeKeyboardEvent("keydown", component.background(), aCode);
        TestMethods.triggerFakeKeyboardEvent("keyup", component.background(), aCode);
        assert.isTrue(aCallbackCalled, "callback for \"a\" was called when \"a\" key was released");

        keyInteraction.offKeyRelease(aCode, aCallback);
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

      it("multiple keyRelease callbacks are possible", () => {
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

      it("can remove only one of the registered keyrelease callback", () => {
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

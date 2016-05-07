///<reference path="../testReference.ts" />

describe("Interactions", () => {
  describe("Key Interaction", () => {
    const A_KEY_CODE = 65;
    const B_KEY_CODE = 66;
    const INSIDE_POINT = { x: 100, y: 100 };
    const OUTSIDE_POINT = { x: -100, y: -100 };

    interface KeyTestCallback {
      called: boolean;
      keycode: number;
      reset: () => void;
      (keycode: number): void;
    }

    function makeKeyCallback() {
      const callback = <KeyTestCallback> function(keycode?: number) {
        callback.called = true;
        callback.keycode = keycode;
      };
      callback.called = false;
      callback.reset = () => {
        callback.called = false;
        callback.keycode = null;
      };
      return callback;
    }

    ["KeyPress", "KeyRelease"].forEach((event: string) => {
      describe(`on${event}`, () => {
        const ACTION = event === "KeyPress" ? "pressed" : "released";

        let svg: d3.Selection<void>;
        let eventTarget: d3.Selection<void>;
        let keyInteraction: Plottable.Interactions.Key;
        let callback: KeyTestCallback;

        beforeEach(() => {
          svg = TestMethods.generateSVG();
          let component = new Plottable.Component().renderTo(svg);
          eventTarget = component.background();
          keyInteraction = new Plottable.Interactions.Key();
          keyInteraction.attachTo(component);
          callback = makeKeyCallback();
        });

        afterEach(function() {
          if (this.currentTest.state === "passed") {
            svg.remove();
          }
        });

        function triggerKeyEvent(mouseEvent: string, p: Plottable.Point, target: d3.Selection<void>, keycode: number) {
          TestMethods.triggerFakeMouseEvent(mouseEvent, target, p.x, p.y);
          TestMethods.triggerFakeKeyboardEvent("keydown", target, keycode);
          if (event === "KeyRelease") {
            TestMethods.triggerFakeKeyboardEvent("keyup", target, keycode);
          }
        }

        function registerEvent(keycode: number, handler: KeyTestCallback) {
          if (event === "KeyPress") {
            return keyInteraction.onKeyPress(keycode, handler);
          } else {
            return keyInteraction.onKeyRelease(keycode, handler);
          }
        }

        function unregisterEvent(keycode: number, handler: KeyTestCallback) {
          if (event === "KeyPress") {
            return keyInteraction.offKeyPress(keycode, handler);
          } else {
            return keyInteraction.offKeyRelease(keycode, handler);
          }
        }

        it(`fires callback for ${event}`, () => {
          assert.strictEqual(registerEvent(A_KEY_CODE, callback), keyInteraction,
            `setting the ${event} callback returns the interaction`);

          registerEvent(A_KEY_CODE, callback);
          triggerKeyEvent("mouseover", INSIDE_POINT, eventTarget, A_KEY_CODE);
          assert.isTrue(callback.called, `callback for "a" was called when "a" key was ${ACTION}`);
          assert.strictEqual(callback.keycode, A_KEY_CODE, "callback passed correct keycode");
        });

        it(`only fires callback for key that has been ${ACTION}`, () => {
          const bCallback = makeKeyCallback();

          registerEvent(A_KEY_CODE, callback);
          registerEvent(B_KEY_CODE, bCallback);

          triggerKeyEvent("mouseover", INSIDE_POINT, eventTarget, A_KEY_CODE);
          assert.isTrue(callback.called, `callback for "a" was called when "a" key was ${ACTION}`);
          assert.isFalse(bCallback.called, `callback for "b" was not called when "a" key was ${ACTION}`);
        });

        it("does not fire callback when the key is pressed outside of the component", () => {
          registerEvent(A_KEY_CODE, callback);

          triggerKeyEvent("mouseover", OUTSIDE_POINT, eventTarget, A_KEY_CODE);
          assert.isFalse(callback.called, `callback for "a" was not called when not moused over the Component`);
        });

        it(`can remove and reattach ${event} callbacks`, () => {
          registerEvent(A_KEY_CODE, callback);

          triggerKeyEvent("mouseover", INSIDE_POINT, eventTarget, A_KEY_CODE);
          assert.isTrue(callback.called, `callback for "a" was called when "a" key was pressed`);

          assert.strictEqual(unregisterEvent(A_KEY_CODE, callback), keyInteraction,
            `unsetting the ${event} callback returns the interaction`);

          callback.reset();
          triggerKeyEvent("mouseover", INSIDE_POINT, eventTarget, A_KEY_CODE);
          assert.isFalse(callback.called, `callback for "a" was disconnected from the interaction`);

          registerEvent(A_KEY_CODE, callback);
          triggerKeyEvent("mouseover", INSIDE_POINT, eventTarget, A_KEY_CODE);
          assert.isTrue(callback.called, `callback for "a" was properly connected back to the interaction`);
        });

        it(`can attach multiple ${event} callbacks on the same key code`, () => {
          const callback2 = makeKeyCallback();

          registerEvent(A_KEY_CODE, callback);
          registerEvent(A_KEY_CODE, callback2);

          triggerKeyEvent("mouseover", INSIDE_POINT, eventTarget, A_KEY_CODE);
          assert.isTrue(callback.called, `callback 1 for "a" was called when "a" key was ${ACTION}`);
          assert.isTrue(callback2.called, `callback 2 for "a" was called when "a" key was ${ACTION}`);
        });

        it("removes only the specified callback", () => {
          const callback2 = makeKeyCallback();

          registerEvent(A_KEY_CODE, callback);
          registerEvent(A_KEY_CODE, callback2);

          unregisterEvent(A_KEY_CODE, callback);
          triggerKeyEvent("mouseover", INSIDE_POINT, eventTarget, A_KEY_CODE);
          assert.isFalse(callback.called, `callback 1 for "a" was disconnected from the interaction`);
          assert.isTrue(callback2.called, `callback 2 for "a" is still connected to the interaction`);
        });
      });
    });

    describe("onKeyPress respects mouse position", () => {
      let svg: d3.Selection<void>;
      let eventTarget: d3.Selection<void>;
      let keyInteraction: Plottable.Interactions.Key;
      let callback: KeyTestCallback;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        let component = new Plottable.Component().renderTo(svg);
        eventTarget = component.background();
        keyInteraction = new Plottable.Interactions.Key();
        keyInteraction.attachTo(component);
        callback = makeKeyCallback();
      });

      afterEach(function() {
        if (this.currentTest.state === "passed") {
          svg.remove();
        }
      });

      it("is only triggered once when the key is pressed", () => {
        keyInteraction.onKeyPress(A_KEY_CODE, callback);

        TestMethods.triggerFakeMouseEvent("mouseover", eventTarget, INSIDE_POINT.x, INSIDE_POINT.y);
        TestMethods.triggerFakeKeyboardEvent("keydown", eventTarget, A_KEY_CODE);
        assert.isTrue(callback.called, `callback for "a" was called when "a" key was pressed`);

        callback.reset();
        TestMethods.triggerFakeMouseEvent("mouseover", eventTarget, INSIDE_POINT.x, INSIDE_POINT.y);
        TestMethods.triggerFakeKeyboardEvent("keydown", eventTarget, A_KEY_CODE, { repeat : true });
        assert.isFalse(callback.called, `callback for "a" was not called when keydown was fired the second time`);
      });

      it("does not fire the callback when component is initially out of focus", () => {
        keyInteraction.onKeyPress(A_KEY_CODE, callback);

        TestMethods.triggerFakeMouseEvent("mouseout", eventTarget, OUTSIDE_POINT.x, OUTSIDE_POINT.y);
        TestMethods.triggerFakeKeyboardEvent("keydown", eventTarget, A_KEY_CODE);
        TestMethods.triggerFakeMouseEvent("mouseover", eventTarget, INSIDE_POINT.x, INSIDE_POINT.y);
        TestMethods.triggerFakeKeyboardEvent("keydown", eventTarget, A_KEY_CODE, { repeat : true });
        assert.isFalse(callback.called, `callback for "a" was not called when keydown was fired the second time`);
      });
    });

    describe("onKeyRelease respects mouse position", () => {
      let svg: d3.Selection<void>;
      let eventTarget: d3.Selection<void>;
      let keyInteraction: Plottable.Interactions.Key;
      let callback: KeyTestCallback;

      beforeEach(() => {
        svg = TestMethods.generateSVG();
        let component = new Plottable.Component().renderTo(svg);
        eventTarget = component.background();
        keyInteraction = new Plottable.Interactions.Key();
        keyInteraction.attachTo(component);
        callback = makeKeyCallback();
      });

      afterEach(function() {
        if (this.currentTest.state === "passed") {
          svg.remove();
        }
      });

      it("does not fire callback if press without release", () => {
        keyInteraction.onKeyRelease(A_KEY_CODE, callback);

        TestMethods.triggerFakeMouseEvent("mouseover", eventTarget, INSIDE_POINT.x, INSIDE_POINT.y);
        TestMethods.triggerFakeKeyboardEvent("keydown", eventTarget, A_KEY_CODE);
        assert.isFalse(callback.called, `callback for "a" was not called wihtout releasing the key`);
      });

      it("does not fire callback if release without press", () => {
        keyInteraction.onKeyRelease(A_KEY_CODE, callback);

        TestMethods.triggerFakeKeyboardEvent("keyup", eventTarget, A_KEY_CODE);
        assert.isFalse(callback.called, `callback for "a" was not called wihtout pressing the key`);
      });

      it("fires callback if key was released outside of component after being pressed inside", () => {
        keyInteraction.onKeyRelease(A_KEY_CODE, callback);

        TestMethods.triggerFakeMouseEvent("mouseover", eventTarget, INSIDE_POINT.x, INSIDE_POINT.y);
        TestMethods.triggerFakeKeyboardEvent("keydown", eventTarget, A_KEY_CODE);
        TestMethods.triggerFakeMouseEvent("mouseout", eventTarget, OUTSIDE_POINT.x, OUTSIDE_POINT.y);
        TestMethods.triggerFakeKeyboardEvent("keyup", eventTarget, A_KEY_CODE);
        assert.isTrue(callback.called, `callback for "a" was called when "a" key was released`);
      });

      it("doesn't fire callback if key was released after being pressed outside", () => {
        keyInteraction.onKeyRelease(A_KEY_CODE, callback);

        TestMethods.triggerFakeMouseEvent("mouseout", eventTarget, OUTSIDE_POINT.x, OUTSIDE_POINT.y);
        TestMethods.triggerFakeKeyboardEvent("keydown", eventTarget, A_KEY_CODE);
        TestMethods.triggerFakeKeyboardEvent("keyup", eventTarget, A_KEY_CODE);
        assert.isFalse(callback.called, `callback for "a" was not called when "a" key was released`);
      });

      it("doesn't fire callback key was released inside after being pressed outside", () => {
        keyInteraction.onKeyRelease(A_KEY_CODE, callback);

        TestMethods.triggerFakeMouseEvent("mouseout", eventTarget, OUTSIDE_POINT.x, OUTSIDE_POINT.y);
        TestMethods.triggerFakeKeyboardEvent("keydown", eventTarget, A_KEY_CODE);
        TestMethods.triggerFakeMouseEvent("mouseover", eventTarget, INSIDE_POINT.x, INSIDE_POINT.y);
        TestMethods.triggerFakeKeyboardEvent("keyup", eventTarget, A_KEY_CODE);
        assert.isFalse(callback.called, `callback for "a" was not called when "a" key was released`);
      });
    });
  });
});

///<reference path="../testReference.ts" />

describe("Dispatchers", () => {
  describe("Key Dispatcher", () => {

    describe("Basic usage", () => {
      let keyCodeToSend: number;
      let keyDispatcher: Plottable.Dispatchers.Key;

      let body: d3.Selection<void>;

      beforeEach(() => {
        keyCodeToSend = 65;
        keyDispatcher = Plottable.Dispatchers.Key.getDispatcher();
        body = d3.select("body");
      });

      it("can set a callback to be called when a key is pressed down", () => {
        let keyDowned = false;
        let callback = (code: number, event: KeyboardEvent) => {
          keyDowned = true;
          assert.strictEqual(code, keyCodeToSend, "correct keycode was passed");
          assert.isNotNull(event, "key event was passed to the callback");
        };

        assert.strictEqual(keyDispatcher.onKeyDown(callback), keyDispatcher, "setting the keyDown callback returns the dispatcher");

        TestMethods.triggerFakeKeyboardEvent("keydown", body, keyCodeToSend);
        assert.isTrue(keyDowned, "callback when a key was pressed");

        keyDispatcher.offKeyDown(callback);
      });

      it("can remove the keydown listener", () => {
        let keyDowned = false;
        let callback = () => keyDowned = true;

        assert.strictEqual(keyDispatcher.onKeyDown(callback), keyDispatcher, "setting the keyDown callback returns the dispatcher");

        TestMethods.triggerFakeKeyboardEvent("keydown", body, keyCodeToSend);
        assert.isTrue(keyDowned, "callback when a key was pressed");

        assert.strictEqual(keyDispatcher.offKeyDown(callback), keyDispatcher, "unsetting the keyDown callback returns the dispatcher");

        keyDowned = false;
        TestMethods.triggerFakeKeyboardEvent("keydown", body, keyCodeToSend);
        assert.isFalse(keyDowned, "nothing happens when a key was pressed");
      });

      it("can set a callback to be called when the key is released", () => {
        let keyUped = false;
        let callback = (code: number, event: KeyboardEvent) => {
          keyUped = true;
          assert.strictEqual(code, keyCodeToSend, "correct keycode was passed");
          assert.isNotNull(event, "key event was passed to the callback");
        };

        assert.strictEqual(keyDispatcher.onKeyUp(callback), keyDispatcher, "setting the keyUp callback returns the dispatcher");

        TestMethods.triggerFakeKeyboardEvent("keyup", body, keyCodeToSend);
        assert.isTrue(keyUped, "callback when a key was released");

        keyDispatcher.offKeyUp(callback);
      });

      it("can remove the keyup listener", () => {
        let keyUped = false;
        let callback = () => keyUped = true;

        keyDispatcher.onKeyUp(callback);

        TestMethods.triggerFakeKeyboardEvent("keyup", body, keyCodeToSend);
        assert.isTrue(keyUped, "callback when a key was released");

        assert.strictEqual(keyDispatcher.offKeyUp(callback), keyDispatcher, "unsetting the keyup callback returns the dispatcher");

        keyUped = false;
        TestMethods.triggerFakeKeyboardEvent("keyup", body, keyCodeToSend);
        assert.isFalse(keyUped, "nothing happens when a key was released");
      });
    });

  });
});

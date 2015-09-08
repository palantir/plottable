///<reference path="../testReference.ts" />

describe("Dispatchers", () => {
  describe("Key Dispatcher", () => {
    it("triggers callback on keydown", () => {
      let ked = Plottable.Dispatchers.Key.getDispatcher();
      let keyCodeToSend = 65;
      let keyDowned = false;
      let body = d3.select("body");
      let callback = (code: number, e: KeyboardEvent) => {
        keyDowned = true;
        assert.strictEqual(code, keyCodeToSend, "correct keycode was passed");
        assert.isNotNull(e, "key event was passed to the callback");
      };

      ked.onKeyDown(callback);

      TestMethods.triggerFakeKeyboardEvent("keydown", body, keyCodeToSend);
      assert.isTrue(keyDowned, "callback when a key was pressed");

      ked.offKeyDown(callback);

      keyDowned = false;
      TestMethods.triggerFakeKeyboardEvent("keydown", body, keyCodeToSend);
      assert.isFalse(keyDowned, "nothing happens when a key was pressed");
    });

    it("triggers callback on keyup", () => {
      let ked = Plottable.Dispatchers.Key.getDispatcher();
      let keyCodeToSend = 65;
      let keyUped = false;
      let body = d3.select("body");
      let callback = (code: number, e: KeyboardEvent) => {
        keyUped = true;
        assert.strictEqual(code, keyCodeToSend, "correct keycode was passed");
        assert.isNotNull(e, "key event was passed to the callback");
      };

      ked.onKeyUp(callback);

      TestMethods.triggerFakeKeyboardEvent("keyup", body, keyCodeToSend);
      assert.isTrue(keyUped, "callback when a key was release");

      ked.offKeyUp(callback);

      keyUped = false;
      TestMethods.triggerFakeKeyboardEvent("keyup", body, keyCodeToSend);
      assert.isFalse(keyUped, "nothing happens when a key was release");
    });
  });
});

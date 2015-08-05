///<reference path="../testReference.ts" />

describe("Dispatchers", () => {
  describe("Key Dispatcher", () => {
    it("triggers callback on keydown", () => {
      var ked = Plottable.Dispatchers.Key.getDispatcher();
      var keyCodeToSend = 65;
      var keyDowned = false;
      var body = d3.select("body");
      var callback = (code: number, e: KeyboardEvent) => {
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
      var ked = Plottable.Dispatchers.Key.getDispatcher();
      var keyCodeToSend = 65;
      var keyUped = false;
      var body = d3.select("body");
      var callback = (code: number, e: KeyboardEvent) => {
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

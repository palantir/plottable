///<reference path="../testReference.ts" />

describe("Dispatchers", () => {
  describe("Key Dispatcher", () => {
    it("triggers callback on mousedown", () => {
      const ked = Plottable.Dispatchers.Key.getDispatcher();

      const keyCodeToSend = 65;

      let keyDowned = false;
      const callback = (code: number, e: KeyboardEvent) => {
        keyDowned = true;
        assert.strictEqual(code, keyCodeToSend, "correct keycode was passed");
        assert.isNotNull(e, "key event was passed to the callback");
      };

      ked.onKeyDown(callback);

      $("body").simulate("keydown", { keyCode: keyCodeToSend });
      assert.isTrue(keyDowned, "callback when a key was pressed");

      ked.offKeyDown(callback); // clean up
    });
  });
});

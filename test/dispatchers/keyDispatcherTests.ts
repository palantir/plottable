///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Dispatchers", () => {
  describe("Key Dispatcher", () => {
    it("triggers callback on mousedown", () => {
      var ked = Plottable.Dispatchers.Key.getDispatcher();

      var keyCodeToSend = 65;

      var keyDowned = false;
      var callback = (code: number, e: KeyboardEvent) => {
        keyDowned = true;
        assert.strictEqual(code, 66, "correct keycode was passed");
        assert.isNotNull(e, "key event was passed to the callback");
      };

      ked.onKeyDown(callback);

      $("body").simulate("keydown", { keyCode: keyCodeToSend });
      assert.isTrue(keyDowned, "callback when a key was pressed");

      ked.offKeyDown(callback); // clean up
    });
  });
});

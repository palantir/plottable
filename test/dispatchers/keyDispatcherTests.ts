///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Dispatchers", () => {
  describe("Key Dispatcher", () => {
    it("triggers callback on mousedown", () => {
      var ked = Plottable.Dispatcher.Key.getDispatcher();

      var keyCodeToSend = 65;

      var keyDowned = false;
      var callback = (code: number, e: KeyboardEvent) => {
        keyDowned = true;
        assert.strictEqual(code, keyCodeToSend, "correct keycode was passed");
        assert.isNotNull(e, "key event was passed to the callback");
      };

      var keyString = "unit test";
      ked.onKeyDown(keyString, callback);

      $("body").simulate("keydown", { keyCode: keyCodeToSend });
      assert.isTrue(keyDowned, "callback when a key was pressed");

      ked.onKeyDown(keyString, null); // clean up
    });
  });
});

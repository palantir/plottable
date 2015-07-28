///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Dispatchers", () => {
  describe("Key Dispatcher", () => {
    it("triggers callback on keydown", () => {
      var ked = Plottable.Dispatchers.Key.getDispatcher();

      var keyCodeToSend = 65;

      var keyDowned = false;
      var callback = (code: number, e: KeyboardEvent) => {
        keyDowned = true;
        assert.strictEqual(code, keyCodeToSend, "correct keycode was passed");
        assert.isNotNull(e, "key event was passed to the callback");
      };

      ked.onKeyDown(callback);

      $("body").simulate("keydown", { keyCode: keyCodeToSend });
      assert.isTrue(keyDowned, "callback when a key was pressed");

      ked.offKeyDown(callback);

      keyDowned = false;
      $("body").simulate("keydown", { keyCode: keyCodeToSend });
      assert.isFalse(keyDowned, "nothing happens when a key was pressed");
    });

    it("triggers callback on keyup", () => {
          var ked = Plottable.Dispatchers.Key.getDispatcher();

          var keyCodeToSend = 65;

          var keyUped = false;
          var callback = (code: number, e: KeyboardEvent) => {
            keyUped = true;
            assert.strictEqual(code, keyCodeToSend, "correct keycode was passed");
            assert.isNotNull(e, "key event was passed to the callback");
          };

          ked.onKeyUp(callback);

          $("body").simulate("keyup", { keyCode: keyCodeToSend });
          assert.isTrue(keyUped, "callback when a key was release");

          ked.offKeyUp(callback);

          keyUped = false;
          $("body").simulate("keyup", { keyCode: keyCodeToSend });
          assert.isFalse(keyUped, "nothing happens when a key was release");
        });
  });
});

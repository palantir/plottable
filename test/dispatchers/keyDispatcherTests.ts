///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Dispatchers", () => {
  describe("Key Dispatcher", () => {
    it("triggers callback on mousedown", () => {
      var ked = Plottable.Dispatcher.Key.getDispatcher();

      var keyDowned = false;
      var callback = () => keyDowned = true;

      var keyString = "unit test";
      ked.onKeyDown(keyString, callback);

      $("body").simulate("keydown", { keyCode: 65 });
      assert.isTrue(keyDowned, "callback when a key was pressed");

      ked.onKeyDown(keyString, null); // clean up
    });
  });
});

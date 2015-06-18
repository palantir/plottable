///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Utils.Window", () => {
  it("deprecated()", () => {

    var warningTriggered = false;
    var oldWarn = Plottable.Utils.Window.warn;
    Plottable.Utils.Window.warn = (msg: string) => {
      warningTriggered = true;
    };

    Plottable.Utils.Window.deprecated("v0.77.2");

    assert.isTrue(warningTriggered, "the warning has been triggered");

    Plottable.Utils.Window.warn = oldWarn;
  });

  it("deprecated() version and message", () => {

    var version = "v0.77.2";
    var message = "hadoop is doopey"

    var warningTriggered = false;
    var oldWarn = Plottable.Utils.Window.warn;
    Plottable.Utils.Window.warn = (msg: string) => {
      assert.strictEqual(msg.match(/v\d\.\d\d\.\d/)[0], version, "The version number has been correctly passed in " + msg);
      assert.strictEqual(msg.match(message)[0], message, "The message has been correctly passed in " + msg);
      var regEx = new RegExp(message + "$");
      assert.strictEqual(msg.match(regEx)[0], message, "The message appears at the end of the warning message " + msg);
      warningTriggered = true;
    };

    Plottable.Utils.Window.deprecated(version, message);

    assert.isTrue(warningTriggered, "the warning has been triggered");

    Plottable.Utils.Window.warn = oldWarn;
  });

  it("deprecated() calling method", () => {

    var warningTriggered = false;
    var oldWarn = Plottable.Utils.Window.warn;
    Plottable.Utils.Window.warn = (msg: string) => {
      warningTriggered = true;
    };

    Plottable.Utils.Window.deprecated("v0.77.2");

    assert.isTrue(warningTriggered, "warning has been issued about differing domains");

    Plottable.Utils.Window.warn = oldWarn;
  });
});

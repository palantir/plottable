///<reference path="../testReference.ts" />

describe("Utils.Window", () => {
  describe("deprecated()", () => {

    let oldWarn: (warning: string) => void;

    before(() => {
      oldWarn = Plottable.Utils.Window.warn;
    });

    after(() => {
      Plottable.Utils.Window.warn = oldWarn;
    });

    it("deprecated() issues a warning", () => {
      let warningTriggered = false;
      Plottable.Utils.Window.warn = (msg: string) => {
        warningTriggered = true;
      };

      Plottable.Utils.Window.deprecated("deprecatedMethod", "v0.77.2");
      assert.isTrue(warningTriggered, "the warning has been triggered");
    });

    it("deprecated() calling method name, version and message are correct", () => {
      let callingMethod = "reallyOutdatedCallerMethod";
      let version = "v0.77.2";
      let message = "hadoop is doopey";

      let warningTriggered = false;
      Plottable.Utils.Window.warn = (msg: string) => {
        assert.isNotNull(msg.match(new RegExp(callingMethod)), "The method name exists in the message " + msg);
        assert.isNotNull(msg.match(/v\d\.\d\d\.\d/), "There exists a version number " + msg);
        assert.strictEqual(msg.match(/v\d\.\d\d\.\d/)[0], version, "The version number has been correctly passed in " + msg);
        assert.isNotNull(msg.match(message)[0], "The message exists in the warning message " + msg);
        let regEx = new RegExp(message + "$");
        assert.strictEqual(msg.match(regEx)[0], message, "The message appears at the end of the warning message " + msg);
        warningTriggered = true;
      };

      Plottable.Utils.Window.deprecated(callingMethod, version, message);

      assert.isTrue(warningTriggered, "the warning has been triggered");
    });

  });
});

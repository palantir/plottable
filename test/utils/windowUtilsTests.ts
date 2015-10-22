///<reference path="../testReference.ts" />

describe("Utils.Window", () => {
  describe("warn()", () => {
    const runTest = console != null ? it : it.skip;

    runTest("uses console.warn if available, console.log otherwise", () => {
      const originalWindowWarn = console.warn;
      let receivedWarning: string = null;
      const replacementWarn = (warning: string) => receivedWarning = warning;
      console.warn = replacementWarn;

      const expectedWarning = "BEEP BOOP";
      Plottable.Utils.Window.warn(expectedWarning);
      console.warn = originalWindowWarn;
      assert.strictEqual(receivedWarning, expectedWarning, "console.warn was passed the expected message");

      const originalWindowLog = console.log;
      let receivedMessage: string = null;
      const replacementLog = (warning: string) => receivedMessage = warning;
      console.warn = null;
      console.log = replacementLog;
      receivedWarning = null;

      Plottable.Utils.Window.warn(expectedWarning);
      console.warn = originalWindowWarn;
      console.log = originalWindowLog;

      assert.isNull(receivedWarning, "console.warn was not invoked if it doesn't exist");
      assert.strictEqual(receivedMessage, expectedWarning, "used console.log as a fallback");
    });

    runTest("does not emit warnings if Configs.SHOW_WARNINGS is set to false", () => {
      const originalWindowWarn = console.warn;
      let windowWarnWasCalled = false;
      const replacementWarn = (warning: string) => windowWarnWasCalled = true;
      console.warn = replacementWarn;

      const originalShowWarnings = Plottable.Configs.SHOW_WARNINGS;
      Plottable.Configs.SHOW_WARNINGS = false;
      Plottable.Utils.Window.warn("BEEP BOOP");
      console.warn = originalWindowWarn;
      Plottable.Configs.SHOW_WARNINGS = originalShowWarnings;

      assert.isFalse(windowWarnWasCalled, "no warning was logged if SHOW_WARNINGS was set to false");
    });
  });

  describe("deprecated()", () => {
    let oldWarn: (warning: string) => void;

    before(() => {
      oldWarn = Plottable.Utils.Window.warn;
    });

    after(() => {
      Plottable.Utils.Window.warn = oldWarn;
    });

    it("issues a warning", () => {
      let warningTriggered = false;
      Plottable.Utils.Window.warn = (msg: string) => {
        warningTriggered = true;
      };

      Plottable.Utils.Window.deprecated("deprecatedMethod", "v0.77.2");
      assert.isTrue(warningTriggered, "the warning has been triggered");
    });

    it("displays the calling method name, deprecation version, and message", () => {
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

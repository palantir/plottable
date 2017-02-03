import { assert } from "chai";
import * as sinon from "sinon";

import * as Plottable from "../../src";

describe("Utils.Window", () => {
  describe("warn()", () => {
    if (console != null) { // console not defined in IE unless it's opened
      it("uses console.warn if available, console.log otherwise", () => {
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

      it("does not emit warnings if Configs.SHOW_WARNINGS is set to false", () => {
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
    }
  });
});

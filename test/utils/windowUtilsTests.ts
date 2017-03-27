import { assert } from "chai";

import * as Plottable from "../../src";

describe("Utils.Window", () => {
  it("warn does not emit warnings if Configs.SHOW_WARNINGS is set to false", () => {
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

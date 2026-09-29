import * as d3 from "d3";

import { assert } from "chai";

import * as Plottable from "../../src";

describe("Utils.Color", () => {
  it("rejects long malformed colors without excessive backtracking (GHSA-36jr-mh4h-2g58)", function(done) {
    this.timeout(10000);
    // Isolate parsing so a regression can be terminated without hanging the test suite.
    const source = `
      importScripts(${JSON.stringify(new URL("../node_modules/d3/dist/d3.min.js", window.location.href).href)});
      const digits = "1".repeat(100000);
      postMessage([d3.color("rgb(" + digits + "x)"), d3.color("hsl(" + digits + "x)")]);
    `;
    const url = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
    const worker = new Worker(url);
    const cleanup = () => {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
    };
    const timeout = setTimeout(() => {
      cleanup();
      done(new Error("Color parsing exceeded five seconds"));
    }, 5000);
    worker.onerror = (event) => {
      cleanup();
      done(new Error(event.message));
    };
    worker.onmessage = (event) => {
      cleanup();
      try {
        assert.deepEqual(event.data, [null, null]);
        done();
      } catch (error) {
        done(error);
      }
    };
  });

  it("lightenColor()", () => {
    const colorHex = "#12fced";
    const oldColor = d3.hsl(colorHex);
    const lightenedColor = Plottable.Utils.Color.lightenColor(colorHex, 1);
    assert.operator(d3.hsl(lightenedColor).l, ">", oldColor.l, "color got lighter");
  });

  it("colorTest()", () => {
    const colorTester = d3.select("body").append("div").classed("color-tester", true);
    const style = colorTester.append("style");
    style.attr("type", "text/css");

    style.text(".plottable-colors-0 { background-color: blue; }");
    const blueHexcode = Plottable.Utils.Color.colorTest(colorTester, "plottable-colors-0");
    assert.strictEqual(blueHexcode, "#0000ff", "hexcode for blue returned");

    style.text(".plottable-colors-2 { background-color: #13EADF; }");
    const hexcode = Plottable.Utils.Color.colorTest(colorTester, "plottable-colors-2");
    assert.strictEqual(hexcode, "#13eadf", "hexcode for blue returned");

    const nullHexcode = Plottable.Utils.Color.colorTest(colorTester, "plottable-colors-11");
    assert.strictEqual(nullHexcode, null, "null hexcode returned");
    colorTester.remove();
  });
});

import * as d3 from "d3";
import * as sinon from "sinon";

import { assert } from "chai";

import { CanvasDrawer } from "../../src/drawers/canvasDrawer";
import { ProxyDrawer } from "../../src/drawers/drawer";
import { SVGDrawer } from "../../src/drawers/svgDrawer";
import * as TestMethods from "../testMethods";

describe("ProxyDrawer", () => {
  let drawer: ProxyDrawer;
  let svgDrawer: SVGDrawer;
  let canvasDrawer: CanvasDrawer;

  beforeEach(() => {
    svgDrawer = new SVGDrawer("test", "foo");
    canvasDrawer = new CanvasDrawer(null, null);
    drawer = new ProxyDrawer(() => svgDrawer, () => canvasDrawer);
  });

  it("useSVG/useCanvas uses the right renderer", () => {
    const svg = TestMethods.generateSVG();
    const removeSpy = sinon.stub(svgDrawer, "remove");

    drawer.useSVG(svg);
    assert.strictEqual(drawer.getDrawer(), svgDrawer, "svg drawer was used");

    const canvas = d3.select(document.createElement("canvas"));
    drawer.useCanvas(canvas);
    assert.isTrue(removeSpy.called, "old drawer was removed");
    assert.strictEqual(drawer.getDrawer(), canvasDrawer, "canvas drawer was used");
    svg.remove();
  });
});

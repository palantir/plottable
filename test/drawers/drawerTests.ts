import * as d3 from "d3";
import * as sinon from "sinon";

import { assert } from "chai";

import * as TestMethods from "../testMethods";
import { SVGDrawer } from "../../src/drawers/svgDrawer";
import { CanvasDrawer } from "../../src/drawers/canvasDrawer";
import { ProxyDrawer } from "../../src/drawers/drawer";

describe("ProxyDrawer", () => {
  let drawer: ProxyDrawer;
  let svgDrawer: SVGDrawer;
  const canvasDrawStepSpy = sinon.spy();

  beforeEach(() => {
    svgDrawer = new SVGDrawer("test", "foo");
    drawer = new ProxyDrawer(() => svgDrawer, canvasDrawStepSpy);
  });

  it("useSVG/useCanvas uses the right renderer", () => {
    const svg = TestMethods.generateSVG();
    const removeSpy = sinon.stub(svgDrawer, "remove");

    drawer.useSVG(svg);
    assert.strictEqual(drawer.getDrawer(), svgDrawer, "svg drawer was used");

    const canvas = d3.select(document.createElement("canvas"));
    drawer.useCanvas(canvas);
    assert.isTrue(removeSpy.called, "old drawer was removed");
    assert.isTrue(drawer.getDrawer() instanceof CanvasDrawer, "canvas drawer is used");
    assert.strictEqual((drawer.getDrawer() as CanvasDrawer).getDrawStep(), canvasDrawStepSpy, "canvas drawer passed correct draw step");
    svg.remove();
  });
});

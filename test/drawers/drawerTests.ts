import * as d3 from "d3";
import * as sinon from "sinon";

import { assert } from "chai";

import * as TestMethods from "../testMethods";
import { Drawer } from "../../src/drawers/drawer";
import { SVGDrawer } from "../../src/drawers/svgDrawer";
import { CanvasDrawer } from "../../src/drawers/canvasDrawer";
import { Dataset } from "../../src/core/dataset";
import { DrawStep } from "../../src/drawers/index";
import { AttributeToProjector } from "../../src/core/interfaces";
import { Null } from "../../src/animators/nullAnimator";

describe("Drawer", () => {
  let drawer: Drawer;
  let dataset: Dataset;
  let svgDrawer: SVGDrawer;
  let canvasDrawer: CanvasDrawer;

  beforeEach(() => {
    dataset = new Dataset();
    svgDrawer = new SVGDrawer("test", "foo");
    canvasDrawer = new CanvasDrawer(() => {});
    drawer = new Drawer(dataset, svgDrawer, canvasDrawer);
  });

  it("proxies the draw call to the configured drawer", () => {
    const svg = TestMethods.generateSVG();
    const canvas = d3.select(document.createElement("canvas"));

    const data = [1, 2, 3];
    const attrToProjector: AttributeToProjector = {};
    const drawSteps: DrawStep[] = [
      {
        attrToProjector: attrToProjector,
        animator: new Null(),
      }
    ];

    const svgDrawerStub = sinon.stub(svgDrawer, "draw", () => {});
    const canvasDrawerStub = sinon.stub(canvasDrawer, "draw", () => {});
    drawer.useSVG(svg);
    drawer.draw(data, drawSteps);
    assert.isTrue(svgDrawerStub.called, "svgDrawer was used");
    assert.isNotNull(drawer.getSvgRootG(), "svgRootG is not null");
    assert.isFalse(canvasDrawerStub.called, "canvasDrawer was not used");

    svgDrawerStub.reset();
    canvasDrawerStub.reset();

    drawer.useCanvas(canvas);
    drawer.draw(data, drawSteps);
    assert.isTrue(canvasDrawerStub.called, "canvasDrawer was used");
    assert.isFalse(svgDrawerStub.called, "svgDrawer was not used");
    assert.isNull(drawer.getSvgRootG(), "svgRootG is now null");

    svg.remove();
  });

  it("removes the rootG", () => {
    const svg = TestMethods.generateSVG();
    drawer.useSVG(svg);
    const rootG = drawer.getSvgRootG();
    assert.isTrue(document.body.contains(rootG.node()), "renderArea is in the DOM");
    drawer.remove();
    assert.isFalse(document.body.contains(rootG.node()), "renderArea was removed from the DOM");

    svg.remove();
  });

});

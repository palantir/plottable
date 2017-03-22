/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { Dataset } from "../core/dataset";
import { AttributeToAppliedProjector, AttributeToProjector, SimpleSelection } from "../core/interfaces";

import { CanvasDrawer } from "./canvasDrawer";
import { AppliedDrawStep, DrawStep } from "./index";
import { SVGDrawer } from "./svgDrawer";

function applyProjectorsWithDataset(attrToProjector: AttributeToProjector, dataset: Dataset): AttributeToAppliedProjector {
  const modifiedAttrToProjector: AttributeToAppliedProjector = {};
  Object.keys(attrToProjector).forEach((attr: string) => {
    modifiedAttrToProjector[attr] =
      (datum: any, index: number) => attrToProjector[attr](datum, index, dataset);
  });

  return modifiedAttrToProjector;
}

/**
 * A Drawer is a stateful class that holds one SVGDrawer and one CanvasDrawer, and can switch between
 * the two.
 */
export class Drawer {
  private _canvas: d3.Selection<HTMLCanvasElement, any, any, any>;
  private _canvasDrawer: CanvasDrawer;

  private _dataset: Dataset;

  private _svgRootG: d3.Selection<SVGElement, any, any, any>;
  private _svgDrawer: SVGDrawer;

  /**
   * A Drawer draws svg elements based on the input Dataset.
   *
   * @constructor
   * @param {Dataset} dataset The dataset associated with this Drawer
   */
  constructor(dataset: Dataset, svgDrawer: SVGDrawer, canvasDrawer: CanvasDrawer) {
    this._canvasDrawer = canvasDrawer;
    this._dataset = dataset;
    this._svgDrawer = svgDrawer;
  }

  /**
   * Use SVG rendering from now on. This will append a new <g> element to the renderArea and draw
   * DOM elements into it.
   */
  public useSVG(parentRenderArea: SimpleSelection<any>) {
    this._canvas = null;
    this._svgRootG = parentRenderArea.append<SVGGElement>("g");
  }

  /**
   * Use Canvas rendering from now on. This will remove the <g> element created by useSVG, if it exists.
   */
  public useCanvas(canvas: d3.Selection<HTMLCanvasElement, any, any, any>) {
    if (this._svgRootG != null) {
      this._svgRootG.remove();
      this._svgRootG = null;
    }
    this._canvas = canvas;
  }

  /**
   * Public for testing
   */
  public getSvgRootG(): d3.Selection<SVGElement, any, any, any> {
    return this._svgRootG;
  }

  /**
   * public for testing
   */
  public getCanvas(): d3.Selection<HTMLCanvasElement, any, any, any> {
    return this._canvas;
  }

  /**
   * Removes this Drawer's renderArea
   */
  public remove() {
    if (this._svgRootG != null) {
      this._svgRootG.remove();
    }
  }

  /**
   * Draws the data using the drawSteps onto the currently selected drawer.
   *
   * @param{any[]} data The data to be drawn
   * @param{DrawStep[]} drawSteps The list of steps, which needs to be drawn
   */
  public draw(data: any[], drawSteps: DrawStep[]) {
    const appliedDrawSteps: AppliedDrawStep[] = drawSteps.map((drawStep) => {
      const attrToAppliedProjector = applyProjectorsWithDataset(drawStep.attrToProjector, this._dataset);
      return {
        attrToAppliedProjector: attrToAppliedProjector,
        animator: drawStep.animator,
      };
    });

    if (this._svgRootG != null) {
      this._svgDrawer.draw(this._svgRootG, data, appliedDrawSteps);
    } else if (this._canvas != null) {
      this._canvasDrawer.draw(this._canvas, data, appliedDrawSteps);
    } else {
      throw new Error("Must call .useSVG or .useCanvas before drawing!");
    }

    return this;
  }

  public selection(): SimpleSelection<any> {
    if (this._svgRootG != null) {
      return this._svgDrawer.selection();
    } else {
      return null;
    }
  }

  public selectionForIndex(index: number): SimpleSelection<any> {
    if (this._svgRootG != null) {
      return this._svgDrawer.selectionForIndex(index);
    } else {
      return null;
    }
  }
}

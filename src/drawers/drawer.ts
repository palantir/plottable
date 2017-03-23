/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { CanvasDrawer, CanvasDrawStep } from "./canvasDrawer";
import { AppliedDrawStep } from "./index";
import { SVGDrawer } from "./svgDrawer";

/**
 * Drawers draw data onto an output of some sort, usually a DOM element.
 */
export interface Drawer {
  /**
   * Mutate the surface to reflect the data being passed in. This method is responsible
   * for calling the animators at the right time and order.
   * @param data The data to be drawn.
   * @param drawSteps The draw steps that the data go through.
   */
  draw(data: any[], drawSteps: AppliedDrawStep[]): void;

  /**
   * Get the the last drawn visual primitives.
   */
  getVisualPrimitives(): Element[];

  /**
   * Get the visual primitive for the given *data* index.
   */
  getVisualPrimitiveAtIndex(index: number): Element;

  /**
   * Destroy this Drawer, remove all traces of it from the DOM, etc.
   */
  remove(): void;
}

/**
 * A Drawer is a stateful class that holds one SVGDrawer and one CanvasDrawer, and can switch between
 * the two.
 */
export class ProxyDrawer implements Drawer {
  private _currentDrawer: Drawer;
  /**
   * A Drawer draws svg elements based on the input Dataset.
   *
   * @constructor
   * @param _svgDrawerFactory A factory that will be invoked to create an SVGDrawer whenever useSVG is called
   * @param _canvasDrawStep The DrawStep to be fed into a new CanvasDrawer whenever useCanvas is called
   */
  constructor(
    private _svgDrawerFactory: () => SVGDrawer,
    private _canvasDrawStep: CanvasDrawStep) {
  }

  /**
   * Remove the old drawer and use SVG rendering from now on.
   */
  public useSVG(parent: d3.Selection<SVGElement, any, any, any>) {
    if (this._currentDrawer != null) {
      this._currentDrawer.remove();
    }
    const svgDrawer = this._svgDrawerFactory();
    svgDrawer.attachTo(parent);
    this._currentDrawer = svgDrawer;
  }

  /**
   * Remove the old drawer and use Canvas rendering from now on.
   */
  public useCanvas(canvas: d3.Selection<HTMLCanvasElement, any, any, any>) {
    if (this._currentDrawer != null) {
      this._currentDrawer.remove();
    }
    this._currentDrawer = new CanvasDrawer(canvas.node().getContext("2d"), this._canvasDrawStep);
  }

  // public for testing
  public getDrawer() {
    return this._currentDrawer;
  }

  /**
   * Removes this Drawer's renderArea
   */
  public remove() {
    if (this._currentDrawer != null) {
      this._currentDrawer.remove();
    }
  }

  public draw(data: any[], drawSteps: AppliedDrawStep[]) {
    this._currentDrawer.draw(data, drawSteps);
  }

  public getVisualPrimitives() {
    return this._currentDrawer.getVisualPrimitives();
  }

  public getVisualPrimitiveAtIndex(index: number) {
    return this._currentDrawer.getVisualPrimitiveAtIndex(index);
  }
}

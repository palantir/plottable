/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as Utils from "../utils";

import { Dataset } from "../core/dataset";
import { AttributeToAppliedProjector, AttributeToProjector, SimpleSelection } from "../core/interfaces";

import { coerceExternalD3 } from "../utils/coerceD3";
import * as Drawers from "./";

/**
 * A Drawer is responsible for actually committing the DrawSteps to the DOM. You first pass a renderArea
 * to the Drawer, which is the root DOM node holding all the drawing elements. Subclasses set an _svgElementName
 * which is an HTML/SVG tag name. Then you call .draw() with the DrawSteps to draw, and the Drawer will draw
 * to the DOM by clearing old DOM elements, adding new DOM elements, and then passing those DOM elements to
 * the animator, which will set the appropriate attributes on the DOM.
 *
 * "Drawing" in Plottable really means either:
 * (a) "making the DOM elements and their attributes correctly reflect the data being passed in", using SVG.
 * (b) "making draw commands to the Canvas element", using Canvas.
 */
export class Drawer {
  private _renderArea: SimpleSelection<void>;
  private _canvas: d3.Selection<HTMLCanvasElement, any, any, any>;

  protected _svgElementName: string;
  protected _className: string;
  private _dataset: Dataset;

  private _cachedSelectionValid = false;
  private _cachedSelection: SimpleSelection<any>;
  private _cachedSelectionNodes: d3.BaseType[];

  /**
   * A Drawer draws svg elements based on the input Dataset.
   *
   * @constructor
   * @param {Dataset} dataset The dataset associated with this Drawer
   */
  constructor(dataset: Dataset) {
    this._dataset = dataset;
    this._svgElementName = "path";
  }

  public canvas(): d3.Selection<HTMLCanvasElement, any, any, any>;
  /**
   * Sets the renderArea() to null and tells this Drawer to draw to the specified canvas instead.
   * @param canvas
   */
  public canvas(canvas: d3.Selection<HTMLCanvasElement, any, any, any>): this;
  public canvas(canvas?: d3.Selection<HTMLCanvasElement, any, any, any>): any {
    if (canvas === undefined) {
      return this._canvas;
    }
    canvas = coerceExternalD3(canvas);
    this._canvas = canvas;
    this._renderArea = null;
    this._cachedSelectionValid = false;
    return this;
  }

  /**
   * Retrieves the renderArea selection for the Drawer.
   */
  public renderArea(): SimpleSelection<void>;
  /**
   * Sets the canvas() to null and tells this Drawer to draw to the specified SVG area instead.
   *
   * @param {d3.Selection} Selection containing the <g> to render to.
   * @returns {Drawer} The calling Drawer.
   */
  public renderArea(area: SimpleSelection<void>): this;
  public renderArea(area?: SimpleSelection<void>): any {
    if (area === undefined) {
      return this._renderArea;
    }
    area = coerceExternalD3(area);
    this._renderArea = area;
    this._canvas = null;
    this._cachedSelectionValid = false;
    return this;
  }

  /**
   * Removes the Drawer and its renderArea
   */
  public remove() {
    if (this.renderArea() != null) {
      this.renderArea().remove();
    }
  }

  /**
   * Binds data to selection
   *
   * @param{any[]} data The data to be drawn
   */
  private _bindSelectionData(data: any[]) {
    const dataElementsUpdate = this.selection().data(data);
    const dataElements =
      dataElementsUpdate
        .enter()
        .append(this._svgElementName)
        .merge(dataElementsUpdate);
    dataElementsUpdate.exit().remove();

    this._applyDefaultAttributes(dataElements);
  }

  protected _applyDefaultAttributes(selection: SimpleSelection<any>) {
    if (this._className != null) {
      selection.classed(this._className, true);
    }
  }

  /**
   * Draws data using one step
   *
   * @param{AppliedDrawStep} step The step, how data should be drawn.
   */
  private _drawStep(step: Drawers.AppliedDrawStep) {
    const selection = this.selection();
    const colorAttributes = ["fill", "stroke"];
    colorAttributes.forEach((colorAttribute) => {
      if (step.attrToAppliedProjector[colorAttribute] != null) {
        selection.attr(colorAttribute, step.attrToAppliedProjector[colorAttribute]);
      }
    });
    step.animator.animate(selection, step.attrToAppliedProjector);
    if (this._className != null) {
      this.selection().classed(this._className, true);
    }
  }

  protected _drawStepCanvas(data: any[], step: Drawers.AppliedDrawStep) {
    Utils.Window.warn("canvas rendering not yet implemented on " + (<any> this.constructor).name);
  }

  private _appliedProjectors(attrToProjector: AttributeToProjector): AttributeToAppliedProjector {
    const modifiedAttrToProjector: AttributeToAppliedProjector = {};
    Object.keys(attrToProjector).forEach((attr: string) => {
      modifiedAttrToProjector[attr] =
        (datum: any, index: number) => attrToProjector[attr](datum, index, this._dataset);
    });

    return modifiedAttrToProjector;
  }

  /**
   * Calculates the total time it takes to use the input drawSteps to draw the input data
   *
   * @param {any[]} data The data that would have been drawn
   * @param {Drawers.DrawStep[]} drawSteps The DrawSteps to use
   * @returns {number} The total time it takes to draw
   */
  public totalDrawTime(data: any[], drawSteps: Drawers.DrawStep[]) {
    let delay = 0;
    drawSteps.forEach((drawStep, i) => {
      delay += drawStep.animator.totalTime(data.length);
    });

    return delay;
  }

  /**
   * Draws the data into the renderArea using the spefic steps and metadata
   *
   * @param{any[]} data The data to be drawn
   * @param{DrawStep[]} drawSteps The list of steps, which needs to be drawn
   */
  public draw(data: any[], drawSteps: Drawers.DrawStep[]) {
    const appliedDrawSteps: Drawers.AppliedDrawStep[] = drawSteps.map((dr: Drawers.DrawStep) => {
      const attrToAppliedProjector = this._appliedProjectors(dr.attrToProjector);
      return {
        "attrToAppliedProjector": attrToAppliedProjector,
        "animator": dr.animator,
      };
    });

    if (this._renderArea != null) {
      this._bindSelectionData(data);
      this._cachedSelectionValid = false;

      let delay = 0;
      appliedDrawSteps.forEach((drawStep, i) => {
        Utils.Window.setTimeout(() => this._drawStep(drawStep), delay);
        delay += drawStep.animator.totalTime(data.length);
      });
    } else if (this._canvas != null) {
      const canvas = this.canvas().node();
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      // don't support animations for now; just draw the last draw step immediately
      const lastDrawStep = appliedDrawSteps[appliedDrawSteps.length - 1];
      Utils.Window.setTimeout(() => this._drawStepCanvas(data, lastDrawStep), 0);
    } else {
      throw new Error("Drawer's canvas and renderArea are both null!");
    }

    return this;
  }

  public selection(): SimpleSelection<any> | null {
    this.maybeRefreshCache();
    return this._cachedSelection;
  }

  /**
   * Returns the CSS selector for this Drawer's visual elements.
   */
  public selector(): string {
    return this._svgElementName;
  }

  /**
   * Returns the D3 selection corresponding to the datum with the specified index.
   */
  public selectionForIndex(index: number): SimpleSelection<any> | null {
    this.maybeRefreshCache();
    if (this._cachedSelectionNodes != null) {
      return d3.select(this._cachedSelectionNodes[index]);
    } else {
      return null;
    }
  }

  private maybeRefreshCache() {
    if (!this._cachedSelectionValid) {
      if (this._renderArea != null) {
        this._cachedSelection = this.renderArea().selectAll(this.selector());
        this._cachedSelectionNodes = this._cachedSelection.nodes();
      } else {
        this._cachedSelection = null;
        this._cachedSelectionNodes = null;
      }
      this._cachedSelectionValid = true;
    }
  }

}

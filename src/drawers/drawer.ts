/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import * as Utils from "../utils";
import { Dataset } from "../core/dataset";
import { AttributeToProjector, AttributeToAppliedProjector, SimpleSelection } from "../core/interfaces";
import * as Drawers from "./";
import { coerceExternalD3 } from "../utils/coerceD3";
import { IDrawerContext, IDrawerContextClass, IDrawerContextType, CanvasDrawerContext, SvgDrawerContext } from "./contexts";

/**
 * A Drawer is responsible for actually committing the DrawSteps to the DOM. You
 * first pass a renderArea to the Drawer, which is the root DOM node holding all
 * the drawing elements. Subclasses set an _svgElementName which is an HTML/SVG
 * tag name. Then you call .draw() with the DrawSteps to draw, and the Drawer
 * will draw to the DOM by clearing old DOM elements, adding new DOM elements,
 * and then passing those DOM elements to the animator, which will set the
 * appropriate attributes on the DOM.
 *
 * "Drawing" in Plottable really means either: (a) "making the DOM elements and
 * their attributes correctly reflect the data being passed in", using SVG. (b)
 * "making draw commands to the Canvas element", using Canvas.
 */
export class Drawer {
  protected _svgContextType: IDrawerContextClass = SvgDrawerContext;
  protected _canvasContextType: IDrawerContextClass = null;

  private _dataset: Dataset;
  private _context: IDrawerContext;

  /**
   * A Drawer draws svg elements based on the input Dataset.
   *
   * @constructor
   * @param {Dataset} dataset The dataset associated with this Drawer
   */
  constructor(dataset: Dataset) {
    this._dataset = dataset;
  }

  public setContext(type: IDrawerContextType, selection: SimpleSelection<any>) {
    this._context = null;

    switch(type) {
      case "svg":
        if (this._svgContextType == null) {
          Utils.Window.warn("SVG rendering not yet implemented on " + (<any> this.constructor).name);
          break;
        }
        this._context = new this._svgContextType(selection);
        break;

      case "canvas":
        if (this._canvasContextType == null) {
          Utils.Window.warn("SVG rendering not yet implemented on " + (<any> this.constructor).name);
          break;
        }
        this._context = new this._canvasContextType(selection);
        break;

      default:
        Utils.Window.warn(`Not a valid renderer type '${type}'`);
    }

    return this;
  }

  /**
   * These three methods are still used by the plot APIs so we expose them from
   * the context
   */

  public remove() {
    if (this._context != null) {
      this._context.clear();
    }
  }

  public selection(): SimpleSelection<any> | null  {
    if (this._context != null) {
      return this._context.selection();
    }
    return null;
  }

  public selectionForIndex(index: number): SimpleSelection<any> | null {
    if (this._context != null) {
      return this._context.selectionForIndex(index);
    }
    return null;
  }

  /**
   * Draws the data into the renderArea using the spefic steps and metadata
   *
   * @param{any[]} data The data to be drawn
   * @param{DrawStep[]} drawSteps The list of steps, which needs to be drawn
   */
  public draw(data: any[], drawSteps: Drawers.DrawStep[]) {
    if (this._context == null) {
      return this;
    }

    let appliedDrawSteps: Drawers.AppliedDrawStep[] = drawSteps.map((dr: Drawers.DrawStep) => {
      let attrToAppliedProjector = this._appliedProjectors(dr.attrToProjector);
      return {
        attrToAppliedProjector: attrToAppliedProjector,
        animator: dr.animator,
      };
    });

    this._context.draw(data, appliedDrawSteps);
    return this;
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

  private _appliedProjectors(attrToProjector: AttributeToProjector): AttributeToAppliedProjector {
    let modifiedAttrToProjector: AttributeToAppliedProjector = {};
    Object.keys(attrToProjector).forEach((attr: string) => {
      modifiedAttrToProjector[attr] =
        (datum: any, index: number) => attrToProjector[attr](datum, index, this._dataset);
    });

    return modifiedAttrToProjector;
  }
}

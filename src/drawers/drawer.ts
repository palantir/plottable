/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as Utils from "../utils";

import { Dataset } from "../core/dataset";
import { AttributeToAppliedProjector, AttributeToProjector, SimpleSelection } from "../core/interfaces";

import * as Drawers from "./";

function applyProjectorsWithDataset(attrToProjector: AttributeToProjector, dataset: Dataset): AttributeToAppliedProjector {
  const modifiedAttrToProjector: AttributeToAppliedProjector = {};
  Object.keys(attrToProjector).forEach((attr: string) => {
    modifiedAttrToProjector[attr] =
      (datum: any, index: number) => attrToProjector[attr](datum, index, dataset);
  });

  return modifiedAttrToProjector;
}

/**
 * An SVGDrawer "draws" data by creating DOM elements and setting specific attributes on them
 * to accurately reflect the data being passed in.
 *
 * This class is immutable (but has internal state) and shouldn't be extended.
 */
export class SVGDrawer {
  protected _className: string;
  protected _svgElementName: string;

  /**
   * All of the DOM elements from the last draw.
   */
  private _selection: SimpleSelection<any>;
  /**
   * Cache of the _selection.nodes().
   */
  private _cachedSelectionNodes: d3.BaseType[];

  /**
   * @param svgElementName an HTML/SVG tag name to be created one per data.
   * @param className CSS classes to be applied to the drawn primitives.
   * @param applyDefaultAttributes
   */
  constructor(svgElementName: string, className: string) {
    this._className = className;
    this._svgElementName = svgElementName;
  }

  /**
   * Draws to the given root element.
   * @param root
   * @param data
   * @param appliedDrawSteps
   */
  public draw(root: d3.Selection<SVGGElement, any, any, any>, data: any[], appliedDrawSteps: Drawers.AppliedDrawStep[]) {
    /*
     * Draw to the DOM by clearing old DOM elements, adding new DOM elements,
     * and then passing those DOM elements to the animator, which will set the
     * appropriate attributes on the DOM.
     */
    this._createAndDestroyDOMElements(root, data);

    let delay = 0;
    appliedDrawSteps.forEach((drawStep, i) => {
      Utils.Window.setTimeout(() => this._drawStep(drawStep), delay);
      delay += drawStep.animator.totalTime(data.length);
    });
  }

  private _createAndDestroyDOMElements(root: d3.Selection<SVGGElement, any, any, any>, data: any[]) {
    const dataElementsUpdate = root.selectAll(this.selector()).data(data);
    this._selection =
      dataElementsUpdate
        .enter()
        .append(this._svgElementName)
        .merge(dataElementsUpdate);
    dataElementsUpdate.exit().remove();
    this._cachedSelectionNodes = null;

    if (this._className != null) {
      this._selection.classed(this._className, true);
    }
    this._applyDefaultAttributes(this._selection);
  }

  protected _applyDefaultAttributes(selection: SimpleSelection<any>) {
    // subclasses may override
  }

  /**
   * Draws data using one step
   *
   * @param{AppliedDrawStep} step The step, how data should be drawn.
   */
  private _drawStep(step: Drawers.AppliedDrawStep) {
    const colorAttributes = ["fill", "stroke"];
    colorAttributes.forEach((colorAttribute) => {
      if (step.attrToAppliedProjector[colorAttribute] != null) {
        this._selection.attr(colorAttribute, step.attrToAppliedProjector[colorAttribute]);
      }
    });
    step.animator.animate(this._selection, step.attrToAppliedProjector);
    if (this._className != null) {
      this.selection().classed(this._className, true);
    }
  }

  public selection(): SimpleSelection<any> {
    return this._selection;
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
  public selectionForIndex(index: number): SimpleSelection<any> {
    if (this._cachedSelectionNodes == null) {
      this._cachedSelectionNodes = this._selection.nodes();
    }
    return d3.select(this._cachedSelectionNodes[index]);
  }
}

export type CanvasDrawStep = (
  context: CanvasRenderingContext2D,
  data: any[],
  attrToAppliedProjector: AttributeToAppliedProjector,
) => void;

/**
 * A CanvasDrawer draws data onto a supplied Canvas DOM element.
 *
 * This class is immutable (but has internal state) and shouldn't be extended.
 */
export class CanvasDrawer {
  private _drawStep: CanvasDrawStep;

  constructor(drawStep: CanvasDrawStep) {
    this._drawStep = drawStep;
  }

  public draw(canvas: d3.Selection<HTMLCanvasElement, any, any, any>, data: any[], appliedDrawSteps: Drawers.AppliedDrawStep[]) {
    // don't support animations for now; just draw the last draw step immediately
    const lastDrawStep = appliedDrawSteps[appliedDrawSteps.length - 1];
    const context = canvas.node().getContext("2d");
    context.save();
    this._drawStep(context, data, lastDrawStep.attrToAppliedProjector);
    context.restore();
  }
}

/**
 * A Drawer is a stateful class that holds one SVGDrawer and one CanvasDrawer, and can switch between
 * the two.
 */
export class Drawer {
  private _canvas: d3.Selection<HTMLCanvasElement, any, any, any>;
  private _canvasDrawer: CanvasDrawer;

  private _dataset: Dataset;

  private _svgRootG: d3.Selection<SVGGElement, any, any, any>;
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
  public draw(data: any[], drawSteps: Drawers.DrawStep[]) {
    const appliedDrawSteps: Drawers.AppliedDrawStep[] = drawSteps.map((dr: Drawers.DrawStep) => {
      const attrToAppliedProjector = applyProjectorsWithDataset(dr.attrToProjector, this._dataset);
      return {
        attrToAppliedProjector: attrToAppliedProjector,
        animator: dr.animator,
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

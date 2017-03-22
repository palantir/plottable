/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as Utils from "../utils";

import { SimpleSelection } from "../core/interfaces";
import { AppliedDrawStep } from "./index";

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
  public draw(root: d3.Selection<SVGElement, any, any, any>, data: any[], appliedDrawSteps: AppliedDrawStep[]) {
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

  private _createAndDestroyDOMElements(root: d3.Selection<SVGElement, any, any, any>, data: any[]) {
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
  private _drawStep(step: AppliedDrawStep) {
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

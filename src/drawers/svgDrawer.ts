/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import * as Utils from "../utils";

import { SimpleSelection } from "../core/interfaces";
import { Drawer } from "./drawer";
import { AppliedDrawStep } from "./index";

/**
 * An SVGDrawer draws data by creating DOM elements and setting specific attributes on them
 * to accurately reflect the data being passed in.
 *
 * This class is immutable (but has internal state).
 */
export class SVGDrawer implements Drawer {
  protected _className: string;
  protected _svgElementName: string;

  /**
   * The root element holding the visual elements. The SVGDrawer owns
   * this variable and manipulates it accordingly.
   */
  protected _root: d3.Selection<SVGElement, any, any, any>;

  /**
   * All of the DOM elements from the last draw.
   */
  private _selection: d3.Selection<Element, any, any, any>;

  /**
   * Cache of the _selection.nodes().
   */
  private _cachedVisualPrimitivesNodes: Element[];

  /**
   * @param svgElementName an HTML/SVG tag name to be created, one per datum.
   * @param className CSS classes to be applied to the drawn primitives.
   * @param applyDefaultAttributes
   */
  constructor(svgElementName: string, className: string) {
    this._root = d3.select(document.createElementNS("http://www.w3.org/2000/svg", "g"));
    this._className = className;
    this._svgElementName = svgElementName;
  }

  public draw(data: any[], appliedDrawSteps: AppliedDrawStep[]) {
    /*
     * Draw to the DOM by clearing old DOM elements, adding new DOM elements,
     * and then passing those DOM elements to the animator, which will set the
     * appropriate attributes on the DOM.
     */
    this._createAndDestroyDOMElements(data);

    let delay = 0;
    appliedDrawSteps.forEach((drawStep, i) => {
      Utils.Window.setTimeout(() => this._drawStep(drawStep), delay);
      delay += drawStep.animator.totalTime(data.length);
    });
  }

  public getVisualPrimitives() {
    if (this._cachedVisualPrimitivesNodes == null) {
      this._cachedVisualPrimitivesNodes = this._selection.nodes();
    }
    return this._cachedVisualPrimitivesNodes;
  }

  public getVisualPrimitiveAtIndex(index: number) {
    return this.getVisualPrimitives()[index];
  }

  public remove() {
    this._root.remove();
  }

  public attachTo(parent: d3.Selection<SVGElement, any, any, any>) {
    parent.node().appendChild(this._root.node());
  }

  // public for testing
  public getRoot(): d3.Selection<SVGElement, any, any, any> {
    return this._root;
  }

  /**
   * Returns the CSS selector for this Drawer's visual elements.
   */
  public selector(): string {
    return this._svgElementName;
  }

  protected _applyDefaultAttributes(selection: SimpleSelection<any>) {
    // subclasses may override
  }

  private _createAndDestroyDOMElements(data: any[]) {
    const dataElementsUpdate = this._root.selectAll<Element, any>(this.selector()).data(data);
    this._selection =
      dataElementsUpdate
        .enter()
        .append<Element>(this._svgElementName)
        .merge(dataElementsUpdate);
    dataElementsUpdate.exit().remove();
    this._cachedVisualPrimitivesNodes = null;

    if (this._className != null) {
      this._selection.classed(this._className, true);
    }
    this._applyDefaultAttributes(this._selection);
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
      this._selection.classed(this._className, true);
    }
  }
}

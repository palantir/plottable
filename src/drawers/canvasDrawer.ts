/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";
import * as Utils from "../utils";

import { Dataset } from "../core/dataset";
import { AttributeToProjector, AttributeToAppliedProjector } from "../core/interfaces";

import * as Drawers from "./";
import { IDrawer } from "./drawer";

export class CanvasDrawer implements IDrawer {
  protected _renderArea: d3.Selection<void>;
  protected _className: string;
  protected _dataset: Dataset;

  /**
   * A Drawer draws svg elements based on the input Dataset.
   *
   * @constructor
   * @param {Dataset} dataset The dataset associated with this Drawer
   */
  constructor(dataset: Dataset) {
    this._dataset = dataset;
  }

  /**
   * Retrieves the renderArea selection for the Drawer.
   */
  public renderArea(): d3.Selection<void>;
  /**
   * Sets the renderArea selection for the Drawer.
   *
   * @param {d3.Selection} Selection containing the <g> to render to.
   * @returns {Drawer} The calling Drawer.
   */
  public renderArea(area: d3.Selection<void>): this;
  public renderArea(area?: d3.Selection<void>): any {
    if (area == null) {
      return this._renderArea;
    }
    this._renderArea = area;
    return this;
  }

  /**
   * Removes the Drawer and its renderArea
   */
  public remove() {
    if (this.renderArea() != null) {
      // this.renderArea().remove();
    }
  }

  /**
   * Draws data using one step
   *
   * @param{AppliedDrawStep} step The step, how data should be drawn.
   */
  protected _drawStep(step: Drawers.AppliedDrawStep) {
      /*
    let selection = this.selection();
    let colorAttributes = ["fill", "stroke"];
    colorAttributes.forEach((colorAttribute) => {
      if (step.attrToAppliedProjector[colorAttribute] != null) {
        selection.attr(colorAttribute, step.attrToAppliedProjector[colorAttribute]);
      }
    });
    step.animator.animate(selection, step.attrToAppliedProjector);
    if (this._className != null) {
      this.selection().classed(this._className, true);
    }
    */
  }

  private _appliedProjectors(attrToProjector: AttributeToProjector): AttributeToAppliedProjector {
    let modifiedAttrToProjector: AttributeToAppliedProjector = {};
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
    let appliedDrawSteps: Drawers.AppliedDrawStep[] = drawSteps.map((dr: Drawers.DrawStep) => {
      let attrToAppliedProjector = this._appliedProjectors(dr.attrToProjector);
      return {
        attrToAppliedProjector: attrToAppliedProjector,
        animator: dr.animator,
      };
    });

    let delay = 0;
    appliedDrawSteps.forEach((drawStep, i) => {
      Utils.Window.setTimeout(() => this._drawStep(drawStep), delay);
      delay += drawStep.animator.totalTime(data.length);
    });

    return this;
  }
}

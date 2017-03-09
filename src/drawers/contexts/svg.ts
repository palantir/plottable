
import * as d3 from "d3";
import * as Utils from "../../utils";
import { AppliedDrawStep } from "../";
import { coerceExternalD3 } from "../../utils/coerceD3";
import { IDrawerContext } from "./";
import { SimpleSelection } from "../../core/interfaces";

export class SvgDrawerContext implements IDrawerContext {
  protected _svgElementName: string;
  protected _className: string;
  protected _renderArea: SimpleSelection<void>;
  private _cachedSelectionValid = false;
  private _cachedSelection: SimpleSelection<any>;
  private _cachedSelectionNodes: d3.BaseType[];

  constructor(renderArea: SimpleSelection<void>) {
    this._renderArea = coerceExternalD3(renderArea);
    this._svgElementName = "path";
  }

  public draw(data: any[], steps: AppliedDrawStep[]){
      this._bindSelectionData(data);
      this._cachedSelectionValid = false;

      let delay = 0;
      steps.forEach((drawStep, i) => {
        Utils.Window.setTimeout(() => this.drawStep(data, drawStep), delay);
        delay += drawStep.animator.totalTime(data.length);
      });
  }

  public drawStep(data: any[], step: AppliedDrawStep) {
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
  }

  /**
   * Binds data to selection
   *
   * @param{any[]} data The data to be drawn
   */
  private _bindSelectionData(data: any[]) {
    let dataElementsUpdate = this.selection().data(data);
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

  public clear() {
    if (this._renderArea != null) {
      this._renderArea.remove();
    }
  }

  public selection(): SimpleSelection<any> | null {
    this.maybeRefreshCache();
    return this._cachedSelection;
  }

  /**
   * Returns the CSS selector for this Drawer's visual elements.
   */
  private selector(): string {
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
      this._cachedSelection = this._renderArea.selectAll(this.selector());
      this._cachedSelectionNodes = this._cachedSelection.nodes();
      this._cachedSelectionValid = true;
    }
  }
}
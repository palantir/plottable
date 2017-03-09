
import * as d3 from "d3";
import * as Utils from "../../utils";
import { AppliedDrawStep } from "../";
import { coerceExternalD3 } from "../../utils/coerceD3";
import { IDrawerContext } from "./";
import { SimpleSelection } from "../../core/interfaces";

export abstract class CanvasDrawerContext implements IDrawerContext {
  protected _canvas: d3.Selection<HTMLCanvasElement, any, any, any>;

  constructor(canvas: SimpleSelection<void>) {
    this._canvas = coerceExternalD3(canvas) as d3.Selection<HTMLCanvasElement, any, any, any>;
  }

  public draw(data: any[], steps: AppliedDrawStep[]) {
      const canvas = this._canvas.node();
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);

      // don't support animations for now; just draw the last draw step immediately
      const lastDrawStep = steps[steps.length - 1];
      Utils.Window.setTimeout(() => this.drawStep(data, lastDrawStep), 0);
  }

  public abstract drawStep(data: any[], step: AppliedDrawStep): void;

  public clear() {
    // noop
  }

  public selection(): null {
      return null;
  }

  public selectionForIndex(index: number): null {
      return null;
  }
}

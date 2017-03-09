import * as d3 from "d3";
import { AppliedDrawStep } from "../";
import { SimpleSelection } from "../../core/interfaces";

export interface IDrawerContext {
  draw: (data: any[], steps: AppliedDrawStep[]) => void;
  drawStep: (data: any[], step: AppliedDrawStep) => void;
  clear: () => void;
  selection: () => SimpleSelection<any> | null;
  selectionForIndex: (index: number) => SimpleSelection<any> | null;
}

export type IDrawerContextClass = new (selection: SimpleSelection<any>) => IDrawerContext;
export type IDrawerContextType = "svg" | "canvas";

export * from "./canvas";
export * from "./svg";

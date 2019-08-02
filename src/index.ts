// HACKHACK d3-selection-multi doesn't play well with default "d3" package in a
// bundler environment (e.g. webpack) - see https://github.com/d3/d3-selection-multi/issues/11
// we add it manually to the default "d3" bundle
import "./utils/addD3SelectionMulti";

import * as Animators from "./animators";
import * as Axes from "./axes";
import * as Components from "./components";
import * as Configs from "./core/config";
import * as Formatters from "./core/formatters";
import * as RenderController from "./core/renderController";
import * as RenderPolicies from "./core/renderPolicy";
import * as SymbolFactories from "./core/symbolFactories";
import * as Dispatchers from "./dispatchers";
import * as Drawers from "./drawers";
import * as Interactions from "./interactions";
import * as Plots from "./plots";
import * as Scales from "./scales";
import * as Utils from "./utils";

export {
  Animators,
  Axes,
  Components,
  Configs,
  Formatters,
  RenderController,
  RenderPolicies,
  SymbolFactories,
  Dispatchers,
  Drawers,
  Interactions,
  Plots,
  Scales,
  Utils,
};

export * from "./animators/animator";

export * from "./axes/axis";
export { TimeInterval } from "./axes/timeAxis";

export * from "./components/component";
export * from "./components/componentContainer";
export { DragBoxCallback } from "./components/dragBoxLayer";
export { IDragLineCallback } from "./components/dragLineLayer";

export * from "./core/dataset";
export { Formatter, DatumFormatter } from "./core/formatters";
export * from "./core/interfaces";
export { SymbolFactory } from "./core/symbolFactories";
export { version } from "./core/version";

export * from "./dispatchers/dispatcher";

export * from "./drawers/drawer";

export { ClickCallback } from "./interactions/clickInteraction";
export { DragCallback } from "./interactions/dragInteraction";
export * from "./interactions/interaction";
export * from "./interactions/keyInteraction";
export { PointerCallback } from "./interactions/pointerInteraction";

export * from "./plots/xyPlot";
export * from "./plots/plot";

export * from "./scales/quantitativeScale";
export * from "./scales/scale";

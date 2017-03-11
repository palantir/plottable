/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

export * from "./dragBoxLayer";
export * from "./dragLineLayer";
export * from "./gridlines";
export * from "./group";
export * from "./guideLineLayer";
export * from "./interpolatedColorLegend";
export * from "./label";
export * from "./legend";
export * from "./plotGroup";
export * from "./selectionBoxLayer";
export * from "./table";
export * from "./xDragBoxLayer";
export * from "./yDragBoxLayer";

/**
 * @deprecated just use string literals for alignment
 */
export const Alignment = {
  TOP: "top" as "top",
  BOTTOM: "bottom" as "bottom",
  LEFT: "left" as "left",
  RIGHT: "right" as "right",
  CENTER: "center" as "center",
};

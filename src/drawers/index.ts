import { Animator } from "../animators/animator";
import { AttributeToProjector, AttributeToAppliedProjector } from "../core/interfaces";

export * from "./arcDrawer";
export * from "./arcOutlineDrawer";
export * from "./areaDrawer";
export * from "./lineDrawer";
export * from "./rectangleDrawer";
export * from "./segmentDrawer";
export * from "./symbolDrawer";

/**
 * A step for the drawer to draw.
 *
 * Specifies how AttributeToProjector needs to be animated.
 */
export type DrawStep = {
  attrToProjector: AttributeToProjector;
  animator: Animator;
};

/**
 * A DrawStep that carries an AttributeToAppliedProjector map.
 */
export type AppliedDrawStep = {
  attrToAppliedProjector: AttributeToAppliedProjector;
  animator: Animator;
};


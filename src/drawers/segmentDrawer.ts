/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import { Dataset } from "../core/dataset";
import { Drawer } from "./drawer";
import { IDrawerContext, SvgDrawerContext } from "./contexts";

export class SegmentSvg extends SvgDrawerContext {
  protected _svgElementName = "line";
}

export class Segment extends Drawer {
  protected _svgDrawerContext = SegmentSvg;
}

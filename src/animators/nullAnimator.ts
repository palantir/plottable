/**
 * Copyright 2014-present Palantir Technologies
 * @license MIT
 */

import * as d3 from "d3";

import { Animator } from "./animator";
import { AttributeToAppliedProjector } from "../core/interfaces";
/**
 * An animator implementation with no animation. The attributes are
 * immediately set on the selection.
 */
export class Null implements Animator {
  public totalTime(selection: any) {
    return 0;
  }

  public animate(selection: d3.Selection<any>, attrToAppliedProjector: AttributeToAppliedProjector) {
    return selection.attr(attrToAppliedProjector);
  }
}

